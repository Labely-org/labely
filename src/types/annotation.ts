export type ShapeType = 'rect' | 'polygon' | 'obb' | 'point' | 'polyline';

export interface Point {
  x: number;
  y: number;
}

export interface BaseAnnotation {
  id: string;
  classId: string;
  locked?: boolean;
  label?: string;
  confidence?: number;
}

export interface RectAnnotation extends BaseAnnotation {
  type: 'rect';
  x: number; // Top-left x
  y: number; // Top-left y
  width: number;
  height: number;
}

export interface PolygonAnnotation extends BaseAnnotation {
  type: 'polygon';
  points: Point[];
  closed: boolean;
}

export interface OBBAnnotation extends BaseAnnotation {
  type: 'obb';
  cx: number;      // Center x
  cy: number;      // Center y
  width: number;
  height: number;
  angle: number;   // In degrees (0 - 360)
}

export interface PointAnnotation extends BaseAnnotation {
  type: 'point';
  x: number;
  y: number;
}

export interface PolylineAnnotation extends BaseAnnotation {
  type: 'polyline';
  points: Point[];
}

export type Annotation =
  | RectAnnotation
  | PolygonAnnotation
  | OBBAnnotation
  | PointAnnotation
  | PolylineAnnotation;

export interface Category {
  id: string;
  name: string;
  color: string;
  shortcutKey?: string;
}

export type DatasetSplit = 'train' | 'val' | 'test';

export interface ImageItem {
  id: string;
  name: string;
  src: string;
  width: number;
  height: number;
  annotations: Annotation[];
  status: 'unlabeled' | 'in_progress' | 'labeled' | 'reviewed';
  tags?: string[];
  split?: DatasetSplit;
  file?: File;
}

export type ToolMode =
  | 'select'
  | 'rect'
  | 'polygon'
  | 'obb'
  | 'point'
  | 'polyline'
  | 'wand'
  | 'pan';

export interface ViewTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export type ExportFormat = 'yolo' | 'coco' | 'voc' | 'labelme' | 'csv' | 'labely_json';

export interface ExportSettings {
  format: ExportFormat;
  includeImages: boolean;
  trainRatio: number;
  valRatio: number;
  testRatio: number;
  saveYaml: boolean;
  minConfidence?: number;
}
