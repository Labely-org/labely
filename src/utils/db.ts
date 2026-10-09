import { Category, ImageItem } from '../types/annotation';

const DB_NAME = 'labely_db';
const DB_VERSION = 1;
const STORE_IMAGES = 'images';
const STORE_META = 'meta';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_IMAGES)) {
        db.createObjectStore(STORE_IMAGES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface StoredImageItem extends Omit<ImageItem, 'src' | 'file'> {
  blob?: Blob;
  dataUrl?: string;
}

export async function saveDatasetToDB(
  images: ImageItem[],
  categories: Category[],
  activeImageId: string | null
): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction([STORE_IMAGES, STORE_META], 'readwrite');
    const imageStore = tx.objectStore(STORE_IMAGES);
    const metaStore = tx.objectStore(STORE_META);

    // Clear existing images to stay in sync
    imageStore.clear();

    for (const img of images) {
      let blobToStore: Blob | undefined = img.file;

      // If no file but has blob URL or data URL, extract blob
      if (!blobToStore && img.src.startsWith('blob:')) {
        try {
          const res = await fetch(img.src);
          blobToStore = await res.blob();
        } catch {
          // Ignore
        }
      }

      const stored: StoredImageItem = {
        id: img.id,
        name: img.name,
        width: img.width,
        height: img.height,
        annotations: img.annotations,
        status: img.status,
        tags: img.tags,
        split: img.split,
        blob: blobToStore,
        dataUrl: img.src.startsWith('data:') ? img.src : undefined,
      };

      imageStore.put(stored);
    }

    metaStore.put({ key: 'categories', value: categories });
    if (activeImageId) {
      metaStore.put({ key: 'activeImageId', value: activeImageId });
    }

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Could not save to IndexedDB:', err);
  }
}

export async function loadDatasetFromDB(): Promise<{
  images: ImageItem[];
  categories: Category[];
  activeImageId: string | null;
} | null> {
  try {
    const db = await openDatabase();
    const tx = db.transaction([STORE_IMAGES, STORE_META], 'readonly');
    const imageStore = tx.objectStore(STORE_IMAGES);
    const metaStore = tx.objectStore(STORE_META);

    const imagesReq = imageStore.getAll();
    const metaCatsReq = metaStore.get('categories');
    const metaActiveReq = metaStore.get('activeImageId');

    const [storedImages, catMeta, activeMeta] = await Promise.all([
      new Promise<StoredImageItem[]>((resolve) => {
        imagesReq.onsuccess = () => resolve(imagesReq.result || []);
      }),
      new Promise<any>((resolve) => {
        metaCatsReq.onsuccess = () => resolve(metaCatsReq.result?.value);
      }),
      new Promise<any>((resolve) => {
        metaActiveReq.onsuccess = () => resolve(metaActiveReq.result?.value);
      }),
    ]);

    if (!storedImages || storedImages.length === 0) {
      return null;
    }

    const reconstructedImages: ImageItem[] = [];

    for (const item of storedImages) {
      let src = item.dataUrl || '';
      let file: File | undefined = undefined;

      if (item.blob) {
        src = URL.createObjectURL(item.blob);
        file = new File([item.blob], item.name, { type: item.blob.type });
      }

      reconstructedImages.push({
        id: item.id,
        name: item.name,
        src,
        width: item.width,
        height: item.height,
        annotations: item.annotations,
        status: item.status,
        tags: item.tags,
        split: item.split,
        file,
      });
    }

    return {
      images: reconstructedImages,
      categories: catMeta || [],
      activeImageId: activeMeta || reconstructedImages[0]?.id || null,
    };
  } catch (err) {
    console.warn('Could not read from IndexedDB:', err);
    return null;
  }
}
