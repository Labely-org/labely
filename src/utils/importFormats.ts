import { Annotation, Category, ImageItem, Point, RectAnnotation, PolygonAnnotation } from '../types/annotation';

export interface ParsedImportResult {
  categories: Category[];
  images: ImageItem[];
  importedCount: number;
}

// Generate unique id
export function uid(): string {
  return 'id_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
}

// Random aesthetic palette generator
const PRESET_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#14b8a6', '#f97316', '#6366f1',
];

export function getRandomColor(idx: number): string {
  return PRESET_COLORS[idx % PRESET_COLORS.length];
}

/**
 * Parse YOLO TXT annotation content
 */
export function parseYoloTxt(
  txtContent: string,
  imageWidth: number,
  imageHeight: number,
  categoryList: Category[]
): Annotation[] {
  const lines = txtContent.split('\n').map((l) => l.trim()).filter(Boolean);
  const annotations: Annotation[] = [];

  for (const line of lines) {
    const parts = line.split(/\s+/).map(Number);
    if (parts.length < 5 || isNaN(parts[0])) continue;

    const classIdx = parts[0];
    const category = categoryList[classIdx] || { id: `cat_${classIdx}`, name: `class_${classIdx}`, color: getRandomColor(classIdx) };

    if (parts.length === 5) {
      // Standard bounding box: class xc yc w h
      const [, xc, yc, nw, nh] = parts;
      const w = nw * imageWidth;
      const h = nh * imageHeight;
      const x = xc * imageWidth - w / 2;
      const y = yc * imageHeight - h / 2;

      annotations.push({
        id: uid(),
        type: 'rect',
        classId: category.id,
        x: Math.max(0, x),
        y: Math.max(0, y),
        width: Math.min(imageWidth, w),
        height: Math.min(imageHeight, h),
      });
    } else if (parts.length > 5 && parts.length % 2 === 1) {
      // Polygon segmentation: class x1 y1 x2 y2 ...
      const points: Point[] = [];
      for (let i = 1; i < parts.length; i += 2) {
        points.push({
          x: parts[i] * imageWidth,
          y: parts[i + 1] * imageHeight,
        });
      }
      if (points.length >= 3) {
        annotations.push({
          id: uid(),
          type: 'polygon',
          classId: category.id,
          points,
          closed: true,
        });
      }
    }
  }

  return annotations;
}

/**
 * Parse COCO JSON
 */
export function parseCocoJson(
  cocoJson: any,
  existingCategories: Category[]
): { categories: Category[]; annotationsByImage: Map<string, Annotation[]> } {
  const categories: Category[] = [...existingCategories];
  const catIdToInternalId = new Map<number, string>();

  // Map or append categories
  if (Array.isArray(cocoJson.categories)) {
    cocoJson.categories.forEach((c: any, idx: number) => {
      let existing = categories.find((cat) => cat.name.toLowerCase() === c.name.toLowerCase());
      if (!existing) {
        existing = {
          id: `cat_${Date.now()}_${idx}`,
          name: c.name,
          color: getRandomColor(categories.length),
        };
        categories.push(existing);
      }
      catIdToInternalId.set(c.id, existing.id);
    });
  }

  const imageIdToName = new Map<number, string>();
  if (Array.isArray(cocoJson.images)) {
    cocoJson.images.forEach((img: any) => {
      imageIdToName.set(img.id, img.file_name);
    });
  }

  const annotationsByImage = new Map<string, Annotation[]>();

  if (Array.isArray(cocoJson.annotations)) {
    cocoJson.annotations.forEach((ann: any) => {
      const imageName = imageIdToName.get(ann.image_id);
      if (!imageName) return;

      const classId = catIdToInternalId.get(ann.category_id) || categories[0]?.id || 'default';
      const list = annotationsByImage.get(imageName) || [];

      // Check if polygon segmentation exists
      if (Array.isArray(ann.segmentation) && ann.segmentation.length > 0 && Array.isArray(ann.segmentation[0])) {
        const seg = ann.segmentation[0];
        const points: Point[] = [];
        for (let i = 0; i < seg.length; i += 2) {
          points.push({ x: seg[i], y: seg[i + 1] });
        }
        if (points.length >= 3) {
          list.push({
            id: uid(),
            type: 'polygon',
            classId,
            points,
            closed: true,
          } as PolygonAnnotation);
        }
      } else if (Array.isArray(ann.bbox) && ann.bbox.length === 4) {
        const [x, y, w, h] = ann.bbox;
        list.push({
          id: uid(),
          type: 'rect',
          classId,
          x,
          y,
          width: w,
          height: h,
        } as RectAnnotation);
      }

      annotationsByImage.set(imageName, list);
    });
  }

  return { categories, annotationsByImage };
}

/**
 * Parse Labelme JSON
 */
export function parseLabelmeJson(
  labelmeJson: any,
  existingCategories: Category[]
): { categories: Category[]; annotations: Annotation[] } {
  const categories: Category[] = [...existingCategories];
  const annotations: Annotation[] = [];

  if (Array.isArray(labelmeJson.shapes)) {
    labelmeJson.shapes.forEach((shape: any) => {
      const label = shape.label || 'object';
      let cat = categories.find((c) => c.name.toLowerCase() === label.toLowerCase());
      if (!cat) {
        cat = {
          id: `cat_${Date.now()}_${categories.length}`,
          name: label,
          color: getRandomColor(categories.length),
        };
        categories.push(cat);
      }

      if (shape.shape_type === 'rectangle' && shape.points?.length >= 2) {
        const [p1, p2] = shape.points;
        const x = Math.min(p1[0], p2[0]);
        const y = Math.min(p1[1], p2[1]);
        const width = Math.abs(p2[0] - p1[0]);
        const height = Math.abs(p2[1] - p1[1]);

        annotations.push({
          id: uid(),
          type: 'rect',
          classId: cat.id,
          x,
          y,
          width,
          height,
        });
      } else if (shape.shape_type === 'polygon' && shape.points?.length >= 3) {
        const points = shape.points.map((pt: [number, number]) => ({ x: pt[0], y: pt[1] }));
        annotations.push({
          id: uid(),
          type: 'polygon',
          classId: cat.id,
          points,
          closed: true,
        });
      } else if (shape.shape_type === 'point' && shape.points?.length >= 1) {
        annotations.push({
          id: uid(),
          type: 'point',
          classId: cat.id,
          x: shape.points[0][0],
          y: shape.points[0][1],
        });
      } else if (shape.shape_type === 'linestrip' && shape.points?.length >= 2) {
        const points = shape.points.map((pt: [number, number]) => ({ x: pt[0], y: pt[1] }));
        annotations.push({
          id: uid(),
          type: 'polyline',
          classId: cat.id,
          points,
        });
      }
    });
  }

  return { categories, annotations };
}
