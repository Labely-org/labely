import { Point, RectAnnotation, PolygonAnnotation } from '../types/annotation';

/**
 * Intelligent client-side contour & contrast detector
 * Detects foreground object boundaries around a seed click point directly from canvas ImageData
 */
export function detectBoundingBoxFromSeed(
  ctx: CanvasRenderingContext2D,
  seed: Point,
  imageWidth: number,
  imageHeight: number,
  tolerance = 32
): { x: number; y: number; width: number; height: number } | null {
  const sx = Math.floor(seed.x);
  const sy = Math.floor(seed.y);

  if (sx < 0 || sx >= imageWidth || sy < 0 || sy >= imageHeight) return null;

  // Sample a local bounding box around the click point to avoid freezing on 8K images
  const sampleRadius = 150;
  const startX = Math.max(0, sx - sampleRadius);
  const startY = Math.max(0, sy - sampleRadius);
  const patchW = Math.min(imageWidth - startX, sampleRadius * 2);
  const patchH = Math.min(imageHeight - startY, sampleRadius * 2);

  const imgData = ctx.getImageData(startX, startY, patchW, patchH);
  const data = imgData.data;

  const localSeedX = sx - startX;
  const localSeedY = sy - startY;
  const seedIdx = (localSeedY * patchW + localSeedX) * 4;

  const r0 = data[seedIdx];
  const g0 = data[seedIdx + 1];
  const b0 = data[seedIdx + 2];

  let minX = localSeedX;
  let maxX = localSeedX;
  let minY = localSeedY;
  let maxY = localSeedY;
  let matchingPixels = 0;

  // Quick BFS/Queue flood-fill check within patch
  const visited = new Uint8Array(patchW * patchH);
  const queue: number[] = [localSeedX, localSeedY];
  visited[localSeedY * patchW + localSeedX] = 1;

  while (queue.length > 0 && matchingPixels < 15000) {
    const cy = queue.pop()!;
    const cx = queue.pop()!;
    matchingPixels++;

    if (cx < minX) minX = cx;
    if (cx > maxX) maxX = cx;
    if (cy < minY) minY = cy;
    if (cy > maxY) maxY = cy;

    // Check 4 neighbors
    const neighbors = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1],
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < patchW && ny >= 0 && ny < patchH) {
        const nIndex = ny * patchW + nx;
        if (!visited[nIndex]) {
          visited[nIndex] = 1;
          const pxIdx = nIndex * 4;
          const dr = Math.abs(data[pxIdx] - r0);
          const dg = Math.abs(data[pxIdx + 1] - g0);
          const db = Math.abs(data[pxIdx + 2] - b0);
          const diff = (dr + dg + db) / 3;

          if (diff <= tolerance) {
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  if (matchingPixels < 20) {
    // If threshold too narrow, fallback to a sensible default region around the click
    return {
      x: Math.max(0, sx - 40),
      y: Math.max(0, sy - 40),
      width: 80,
      height: 80,
    };
  }

  // Add padding
  const pad = 6;
  const finalX = Math.max(0, startX + minX - pad);
  const finalY = Math.max(0, startY + minY - pad);
  const finalW = Math.min(imageWidth - finalX, maxX - minX + pad * 2);
  const finalH = Math.min(imageHeight - finalY, maxY - minY + pad * 2);

  return {
    x: finalX,
    y: finalY,
    width: Math.max(20, finalW),
    height: Math.max(20, finalH),
  };
}

/**
 * Generate synthetic AI auto-predictions for quick dataset bootstrapping
 */
export function generateSmartPredictions(
  width: number,
  height: number,
  classIds: string[]
): (RectAnnotation | PolygonAnnotation)[] {
  if (classIds.length === 0) return [];

  const results: (RectAnnotation | PolygonAnnotation)[] = [];
  const count = Math.floor(Math.random() * 3) + 2; // 2-4 items

  for (let i = 0; i < count; i++) {
    const classId = classIds[i % classIds.length];
    const bw = Math.floor(width * (0.15 + Math.random() * 0.25));
    const bh = Math.floor(height * (0.15 + Math.random() * 0.25));
    const bx = Math.floor(width * 0.1 + Math.random() * (width * 0.7 - bw));
    const by = Math.floor(height * 0.1 + Math.random() * (height * 0.7 - bh));

    if (Math.random() > 0.4) {
      results.push({
        id: `auto_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type: 'rect',
        classId,
        x: bx,
        y: by,
        width: bw,
        height: bh,
        confidence: Number((0.82 + Math.random() * 0.16).toFixed(2)),
      });
    } else {
      // Polygon prediction
      const pts: Point[] = [
        { x: bx + bw * 0.2, y: by },
        { x: bx + bw * 0.8, y: by },
        { x: bx + bw, y: by + bh * 0.4 },
        { x: bx + bw * 0.9, y: by + bh },
        { x: bx + bw * 0.1, y: by + bh },
        { x: bx, y: by + bh * 0.5 },
      ];
      results.push({
        id: `auto_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type: 'polygon',
        classId,
        points: pts,
        closed: true,
        confidence: Number((0.85 + Math.random() * 0.13).toFixed(2)),
      });
    }
  }

  return results;
}
