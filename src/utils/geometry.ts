import { Point, RectAnnotation, OBBAnnotation } from '../types/annotation';

export function distance(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function isPointInRect(pt: Point, rect: { x: number; y: number; width: number; height: number }): boolean {
  const minX = Math.min(rect.x, rect.x + rect.width);
  const maxX = Math.max(rect.x, rect.x + rect.width);
  const minY = Math.min(rect.y, rect.y + rect.height);
  const maxY = Math.max(rect.y, rect.y + rect.height);
  return pt.x >= minX && pt.x <= maxX && pt.y >= minY && pt.y <= maxY;
}

// Ray casting algorithm for point in polygon
export function isPointInPolygon(pt: Point, points: Point[]): boolean {
  if (points.length < 3) return false;
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i].x;
    const yi = points[i].y;
    const xj = points[j].x;
    const yj = points[j].y;

    const intersect = yi > pt.y !== yj > pt.y && pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// Distance from point to line segment
export function distanceToSegment(p: Point, v: Point, w: Point): number {
  const l2 = (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y);
  if (l2 === 0) return distance(p, v);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return distance(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
}

// Convert OBB (center, w, h, angle) into 4 vertex points
export function obbToCorners(obb: OBBAnnotation): Point[] {
  const rad = (obb.angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const hw = obb.width / 2;
  const hh = obb.height / 2;

  // Local corners relative to center
  const localCorners: Point[] = [
    { x: -hw, y: -hh },
    { x: hw, y: -hh },
    { x: hw, y: hh },
    { x: -hw, y: hh },
  ];

  return localCorners.map((p) => ({
    x: obb.cx + p.x * cos - p.y * sin,
    y: obb.cy + p.x * sin + p.y * cos,
  }));
}

export function isPointInOBB(pt: Point, obb: OBBAnnotation): boolean {
  const corners = obbToCorners(obb);
  return isPointInPolygon(pt, corners);
}

// Calculate polygon area using Shoelace formula
export function getPolygonArea(points: Point[]): number {
  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
}

// Bounding box from points
export function getBoundingBox(points: Point[]): { x: number; y: number; width: number; height: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  points.forEach((p) => {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  });

  return {
    x: minX,
    y: minY,
    width: Math.max(0, maxX - minX),
    height: Math.max(0, maxY - minY),
  };
}

export type ResizeHandle = 'tl' | 'tr' | 'bl' | 'br' | 'tm' | 'bm' | 'ml' | 'mr' | 'rot';

export function getRectHandles(rect: RectAnnotation): Record<ResizeHandle, Point> {
  const x = rect.x;
  const y = rect.y;
  const w = rect.width;
  const h = rect.height;

  return {
    tl: { x, y },
    tr: { x: x + w, y },
    bl: { x, y: y + h },
    br: { x: x + w, y: y + h },
    tm: { x: x + w / 2, y },
    bm: { x: x + w / 2, y: y + h },
    ml: { x, y: y + h / 2 },
    mr: { x: x + w, y: y + h / 2 },
    rot: { x: x + w / 2, y: y - 20 }, // Rotation / top handle
  };
}
