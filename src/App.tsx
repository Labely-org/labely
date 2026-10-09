import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Annotation,
  Category,
  DatasetSplit,
  ImageItem,
  ToolMode,
  ViewTransform,
} from './types/annotation';
import { SAMPLE_IMAGES, DEFAULT_CATEGORIES } from './assets/sampleImages';
import { Header } from './components/Header';
import { SidebarLeft } from './components/SidebarLeft';
import { SidebarRight } from './components/SidebarRight';
import { ImageGallery } from './components/ImageGallery';
import { AnnotationCanvas } from './components/AnnotationCanvas';
import { ExportModal } from './components/ExportModal';
import { ImportModal } from './components/ImportModal';
import { DatasetStatsModal } from './components/DatasetStatsModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { AutoAnnotateModal } from './components/AutoAnnotateModal';
import { LandingPage } from './components/LandingPage';
import { ToastContainer, ToastMessage } from './components/Toast';
import { uid } from './utils/importFormats';

import { loadDatasetFromDB, saveDatasetToDB } from './utils/db';

export function App() {
  // Navigation & View Mode
  const [isLandingView, setIsLandingView] = useState(() => {
    return window.location.hash !== '#studio';
  });

  // Dataset State
  const [images, setImages] = useState<ImageItem[]>(SAMPLE_IMAGES);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [currentImageId, setCurrentImageId] = useState<string | null>(SAMPLE_IMAGES[0]?.id || null);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(() => {
    return categories[0]?.id || 'cat_car';
  });

  const [toolMode, setToolMode] = useState<ToolMode>('rect');
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [opacity, setOpacity] = useState(0.25);
  const [showLabels, setShowLabels] = useState(true);
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'labeled' | 'unlabeled'>('all');

  // Canvas View Transform
  const [transform, setTransform] = useState<ViewTransform>({
    scale: 1,
    offsetX: 50,
    offsetY: 40,
  });

  // History for Undo/Redo
  const [history, setHistory] = useState<ImageItem[][]>([]);
  const [future, setFuture] = useState<ImageItem[][]>([]);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isAutoAnnotateOpen, setIsAutoAnnotateOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = uid();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load from IndexedDB on initial mount
  useEffect(() => {
    loadDatasetFromDB().then((saved) => {
      if (saved && saved.images.length > 0) {
        setImages(saved.images);
        if (saved.categories.length > 0) setCategories(saved.categories);
        if (saved.activeImageId) setCurrentImageId(saved.activeImageId);
      }
    });
  }, []);

  // Sync URL hash with view mode
  useEffect(() => {
    const handleHash = () => {
      setIsLandingView(window.location.hash !== '#studio');
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Sync to IndexedDB with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      saveDatasetToDB(images, categories, currentImageId);
    }, 500);
    return () => clearTimeout(timer);
  }, [images, categories, currentImageId]);

  // Current Active Image
  const currentImage = useMemo(() => {
    return images.find((img) => img.id === currentImageId) || images[0] || null;
  }, [images, currentImageId]);

  // Push History Snapshot
  const pushHistory = useCallback(() => {
    setHistory((prev) => [...prev.slice(-25), JSON.parse(JSON.stringify(images))]);
    setFuture([]);
  }, [images]);

  // Undo / Redo
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setFuture((f) => [JSON.parse(JSON.stringify(images)), ...f]);
    setHistory((h) => h.slice(0, -1));
    setImages(prev);
    addToast('Undo performed', 'info');
  }, [history, images, addToast]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory((h) => [...h, JSON.parse(JSON.stringify(images))]);
    setFuture((f) => f.slice(1));
    setImages(next);
    addToast('Redo performed', 'info');
  }, [future, images, addToast]);

  // Add Annotation
  const handleAddAnnotation = useCallback(
    (ann: Annotation) => {
      if (!currentImage) return;
      pushHistory();

      setImages((prev) =>
        prev.map((img) => {
          if (img.id === currentImage.id) {
            const updated = [...img.annotations, ann];
            return {
              ...img,
              annotations: updated,
              status: 'labeled',
            };
          }
          return img;
        })
      );
      setSelectedAnnotationId(ann.id);
    },
    [currentImage, pushHistory]
  );

  // Update Annotation
  const handleUpdateAnnotation = useCallback(
    (updatedAnn: Annotation) => {
      if (!currentImage) return;
      setImages((prev) =>
        prev.map((img) => {
          if (img.id === currentImage.id) {
            return {
              ...img,
              annotations: img.annotations.map((a) => (a.id === updatedAnn.id ? updatedAnn : a)),
            };
          }
          return img;
        })
      );
    },
    [currentImage]
  );

  // Delete Annotation
  const handleDeleteAnnotation = useCallback(
    (annId: string) => {
      if (!currentImage) return;
      pushHistory();
      setImages((prev) =>
        prev.map((img) => {
          if (img.id === currentImage.id) {
            const nextAnns = img.annotations.filter((a) => a.id !== annId);
            return {
              ...img,
              annotations: nextAnns,
              status: nextAnns.length > 0 ? 'labeled' : 'unlabeled',
            };
          }
          return img;
        })
      );
      if (selectedAnnotationId === annId) {
        setSelectedAnnotationId(null);
      }
    },
    [currentImage, selectedAnnotationId, pushHistory]
  );

  // Add Category
  const handleAddCategory = useCallback((name: string, color: string) => {
    const newCat: Category = {
      id: `cat_${Date.now()}`,
      name,
      color,
    };
    setCategories((prev) => [...prev, newCat]);
    setSelectedCategoryId(newCat.id);
  }, []);

  // Update Category (Name & Color)
  const handleUpdateCategory = useCallback(
    (catId: string, name: string, color: string) => {
      pushHistory();
      setCategories((prev) =>
        prev.map((c) => (c.id === catId ? { ...c, name, color } : c))
      );
      // Synchronize image annotations with the new class name
      setImages((prev) =>
        prev.map((img) => ({
          ...img,
          annotations: img.annotations.map((a) => {
            if (a.classId === catId) {
              return {
                ...a,
                label: name,
              };
            }
            return a;
          }),
        }))
      );
      addToast(`Updated class "${name}"`, 'success');
    },
    [pushHistory, addToast]
  );

  // Reassign Selected Annotation Category
  const handleReassignAnnotationCategory = useCallback(
    (annId: string, newClassId: string) => {
      if (!currentImage) return;
      const targetCat = categories.find((c) => c.id === newClassId);
      if (!targetCat) return;

      pushHistory();
      setImages((prev) =>
        prev.map((img) => {
          if (img.id === currentImage.id) {
            return {
              ...img,
              annotations: img.annotations.map((a) => {
                if (a.id === annId) {
                  return {
                    ...a,
                    classId: newClassId,
                    label: targetCat.name,
                  };
                }
                return a;
              }),
            };
          }
          return img;
        })
      );
      setSelectedCategoryId(newClassId);
      addToast(`Reassigned to ${targetCat.name}`, 'info');
    },
    [currentImage, categories, pushHistory, addToast]
  );

  // Delete Category
  const handleDeleteCategory = useCallback(
    (catId: string) => {
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      if (selectedCategoryId === catId) {
        setSelectedCategoryId(categories[0]?.id || '');
      }
    },
    [categories, selectedCategoryId]
  );

  // Add Image Tag
  const handleAddImageTag = useCallback(
    (tag: string) => {
      if (!currentImage) return;
      setImages((prev) =>
        prev.map((img) => {
          if (img.id === currentImage.id) {
            const curTags = img.tags || [];
            if (!curTags.includes(tag)) {
              return { ...img, tags: [...curTags, tag] };
            }
          }
          return img;
        })
      );
    },
    [currentImage]
  );

  const handleRemoveImageTag = useCallback(
    (tag: string) => {
      if (!currentImage) return;
      setImages((prev) =>
        prev.map((img) => {
          if (img.id === currentImage.id) {
            return { ...img, tags: (img.tags || []).filter((t) => t !== tag) };
          }
          return img;
        })
      );
    },
    [currentImage]
  );

  // Change Dataset Split
  const handleChangeSplit = useCallback(
    (split: DatasetSplit) => {
      if (!currentImage) return;
      setImages((prev) =>
        prev.map((img) => (img.id === currentImage.id ? { ...img, split } : img))
      );
    },
    [currentImage]
  );

  // Upload New Images
  const handleAddImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: ImageItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!f.type.startsWith('image/')) continue;

      const objUrl = URL.createObjectURL(f);
      const dims = await new Promise<{ w: number; h: number }>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ w: img.naturalWidth || 800, h: img.naturalHeight || 600 });
        img.onerror = () => resolve({ w: 800, h: 600 });
        img.src = objUrl;
      });

      newItems.push({
        id: uid(),
        name: f.name,
        src: objUrl,
        width: dims.w,
        height: dims.h,
        annotations: [],
        status: 'unlabeled',
        split: 'train',
        file: f,
      });
    }

    if (newItems.length > 0) {
      pushHistory();
      setImages((prev) => [...prev, ...newItems]);
      setCurrentImageId(newItems[0].id);
      addToast(`Added ${newItems.length} images to dataset`, 'success');
    }
  };

  // Image Navigation
  const currentIndex = images.findIndex((img) => img.id === currentImageId);

  const handlePrevImage = useCallback(() => {
    if (images.length === 0) return;
    const idx = images.findIndex((img) => img.id === currentImageId);
    const prevIdx = idx > 0 ? idx - 1 : images.length - 1;
    setCurrentImageId(images[prevIdx].id);
    setSelectedAnnotationId(null);
  }, [images, currentImageId]);

  const handleNextImage = useCallback(() => {
    if (images.length === 0) return;
    const idx = images.findIndex((img) => img.id === currentImageId);
    const nextIdx = idx < images.length - 1 ? idx + 1 : 0;
    setCurrentImageId(images[nextIdx].id);
    setSelectedAnnotationId(null);
  }, [images, currentImageId]);

  const handleDeleteImage = useCallback(
    (id: string) => {
      if (images.length <= 1) {
        addToast('Cannot delete only image in dataset', 'warning');
        return;
      }
      pushHistory();
      const nextImages = images.filter((i) => i.id !== id);
      setImages(nextImages);
      if (currentImageId === id) {
        setCurrentImageId(nextImages[0]?.id || null);
      }
      addToast('Image removed from dataset', 'info');
    },
    [images, currentImageId, pushHistory, addToast]
  );

  // View Controls
  const handleFitToScreen = () => {
    if (!currentImage) return;
    const cw = window.innerWidth - 360;
    const ch = window.innerHeight - 200;
    const s = Math.min((cw * 0.85) / currentImage.width, (ch * 0.85) / currentImage.height, 1.5);
    setTransform({
      scale: s,
      offsetX: (cw - currentImage.width * s) / 2 + 30,
      offsetY: (ch - currentImage.height * s) / 2 + 20,
    });
  };

  const handleResetZoom = () => {
    setTransform((prev) => ({ ...prev, scale: 1 }));
  };

  const handleZoomIn = () => {
    setTransform((prev) => ({ ...prev, scale: Math.min(35, prev.scale * 1.25) }));
  };

  const handleZoomOut = () => {
    setTransform((prev) => ({ ...prev, scale: Math.max(0.1, prev.scale * 0.8) }));
  };

  // Import handler
  const handleImportComplete = (
    newImages: ImageItem[],
    newCats: Category[],
    mode: 'replace' | 'merge'
  ) => {
    pushHistory();
    if (mode === 'replace') {
      setImages(newImages);
      setCategories(newCats);
      setCurrentImageId(newImages[0]?.id || null);
    } else {
      setImages((prev) => [...prev, ...newImages]);
      // Merge categories by name
      const mergedCats = [...categories];
      newCats.forEach((nc) => {
        if (!mergedCats.some((c) => c.name.toLowerCase() === nc.name.toLowerCase())) {
          mergedCats.push(nc);
        }
      });
      setCategories(mergedCats);
      setCurrentImageId(newImages[0]?.id || currentImageId);
    }
    addToast(`Successfully imported dataset!`, 'success');
  };

  // Single AI Auto-detect on current
  const handleAutoDetectCurrent = () => {
    setIsAutoAnnotateOpen(true);
  };

  const handleApplyPredictions = (imageId: string, preds: any[]) => {
    pushHistory();
    setImages((prev) =>
      prev.map((img) => {
        if (img.id === imageId) {
          return {
            ...img,
            annotations: [...img.annotations, ...preds],
            status: 'labeled',
          };
        }
        return img;
      })
    );
    addToast(`Generated ${preds.length} auto-annotations!`, 'success');
  };

  const handleApplyAllUnlabeled = (predMap: Map<string, any[]>) => {
    pushHistory();
    let totalGenerated = 0;
    setImages((prev) =>
      prev.map((img) => {
        if (predMap.has(img.id)) {
          const preds = predMap.get(img.id)!;
          totalGenerated += preds.length;
          return {
            ...img,
            annotations: [...img.annotations, ...preds],
            status: 'labeled',
          };
        }
        return img;
      })
    );
    addToast(`Generated ${totalGenerated} annotations across unlabeled images!`, 'success');
  };

  // Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input, textarea, or select
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toLowerCase();

      // Tool shortcuts
      if (key === 'v') setToolMode('select');
      else if (key === 'b') setToolMode('rect');
      else if (key === 'p') setToolMode('polygon');
      else if (key === 'o') setToolMode('obb');
      else if (key === 'k') setToolMode('point');
      else if (key === 'l') setToolMode('polyline');
      else if (key === 'w') setToolMode('wand');
      else if (key === 'h') setToolMode('pan');
      else if (key === 'f') handleFitToScreen();
      else if (key === 'd' || e.key === 'ArrowRight') handleNextImage();
      else if (key === 'a' || e.key === 'ArrowLeft') handlePrevImage();
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedAnnotationId) handleDeleteAnnotation(selectedAnnotationId);
      } else if (e.key === '?') {
        setIsShortcutsOpen((o) => !o);
      } else if ((e.ctrlKey || e.metaKey) && key === 'z') {
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && key === 'y') {
        handleRedo();
      }

      // Class 1-9 shortcuts
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= 9 && categories[num - 1]) {
        const cat = categories[num - 1];
        if (selectedAnnotationId && currentImage) {
          handleReassignAnnotationCategory(selectedAnnotationId, cat.id);
        } else {
          setSelectedCategoryId(cat.id);
          addToast(`Active class: ${cat.name}`, 'info');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    categories,
    selectedAnnotationId,
    currentImage,
    handleReassignAnnotationCategory,
    handleDeleteAnnotation,
    handleFitToScreen,
    handleNextImage,
    handlePrevImage,
    handleUndo,
    handleRedo,
    addToast,
  ]);

  const totalAnnotations = images.reduce((acc, img) => acc + img.annotations.length, 0);

  return (
    <div
      className={`flex flex-col bg-[#070a13] text-slate-100 font-sans ${
        isLandingView ? 'min-h-screen w-full overflow-y-auto' : 'h-screen w-screen overflow-hidden'
      }`}
    >
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {isLandingView ? (
        <LandingPage
          onLaunchStudio={() => {
            setIsLandingView(false);
            window.location.hash = 'studio';
          }}
        />
      ) : (
        <div className="flex flex-col h-full w-full overflow-hidden">
          {/* Main Studio Header */}
          <Header
            onOpenExport={() => setIsExportOpen(true)}
            onOpenImport={() => setIsImportOpen(true)}
            onOpenStats={() => setIsStatsOpen(true)}
            onOpenAutoAnnotate={() => setIsAutoAnnotateOpen(true)}
            onToggleViewMode={() => {
              setIsLandingView(true);
              window.location.hash = '';
            }}
            isLandingView={isLandingView}
            totalImages={images.length}
            totalAnnotations={totalAnnotations}
          />

          {/* Central Workspace: Left Toolbar + Canvas + Right Sidebar */}
          <div className="flex flex-1 overflow-hidden relative">
            <SidebarLeft
              toolMode={toolMode}
              onSelectTool={setToolMode}
              canUndo={history.length > 0}
              canRedo={future.length > 0}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onFitToScreen={handleFitToScreen}
              onResetZoom={handleResetZoom}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              opacity={opacity}
              onChangeOpacity={setOpacity}
              showLabels={showLabels}
              onToggleLabels={() => setShowLabels(!showLabels)}
              onOpenShortcuts={() => setIsShortcutsOpen(true)}
              transform={transform}
            />

            <main className="flex-1 h-full relative overflow-hidden bg-[#090d16]">
              <AnnotationCanvas
                currentImage={currentImage}
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                toolMode={toolMode}
                selectedAnnotationId={selectedAnnotationId}
                onSelectAnnotation={setSelectedAnnotationId}
                onAddAnnotation={handleAddAnnotation}
                onUpdateAnnotation={handleUpdateAnnotation}
                onDeleteAnnotation={handleDeleteAnnotation}
                opacity={opacity}
                showLabels={showLabels}
                transform={transform}
                onTransformChange={setTransform}
              />
            </main>

            <SidebarRight
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              onReassignAnnotationCategory={handleReassignAnnotationCategory}
              currentImage={currentImage}
              selectedAnnotationId={selectedAnnotationId}
              onSelectAnnotation={setSelectedAnnotationId}
              onUpdateAnnotation={handleUpdateAnnotation}
              onDeleteAnnotation={handleDeleteAnnotation}
              onAddImageTag={handleAddImageTag}
              onRemoveImageTag={handleRemoveImageTag}
              onChangeSplit={handleChangeSplit}
              onAutoDetectCurrent={handleAutoDetectCurrent}
            />
          </div>

          {/* Bottom Thumbnails Strip */}
          <ImageGallery
            images={images}
            currentImageId={currentImageId}
            onSelectImage={(id) => {
              setCurrentImageId(id);
              setSelectedAnnotationId(null);
            }}
            onAddImages={handleAddImages}
            onPrevImage={handlePrevImage}
            onNextImage={handleNextImage}
            onDeleteImage={handleDeleteImage}
            filterStatus={galleryFilter}
            onFilterStatusChange={setGalleryFilter}
          />
        </div>
      )}

      {/* Modals */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        images={images}
        categories={categories}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportComplete={handleImportComplete}
        categories={categories}
      />

      <DatasetStatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        images={images}
        categories={categories}
      />

      <AutoAnnotateModal
        isOpen={isAutoAnnotateOpen}
        onClose={() => setIsAutoAnnotateOpen(false)}
        images={images}
        categories={categories}
        currentImageId={currentImageId}
        onApplyPredictions={handleApplyPredictions}
        onApplyAllUnlabeled={handleApplyAllUnlabeled}
      />

      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
    </div>
  );
}

export default App;
