import JSZip from 'jszip';
import { Category, ExportSettings, ImageItem } from '../types/annotation';
import { obbToCorners, getPolygonArea, getBoundingBox } from './geometry';

async function resolveImageBlob(img: ImageItem): Promise<Blob | null> {
  if (img.file) return img.file;
  if (!img.src) return null;
  try {
    const res = await fetch(img.src);
    return await res.blob();
  } catch (err) {
    console.warn(`Could not resolve blob for ${img.name}:`, err);
    return null;
  }
}

export async function exportDataset(
  images: ImageItem[],
  categories: Category[],
  settings: ExportSettings
): Promise<Blob> {
  const zip = new JSZip();
  const catMap = new Map<string, number>();
  categories.forEach((c, idx) => catMap.set(c.id, idx));

  // Determine splits
  const trainRatio = settings.trainRatio / 100;
  const valRatio = settings.valRatio / 100;

  const partitionedImages = images.map((img, idx) => {
    let split = img.split;
    if (!split) {
      const p = idx / images.length;
      if (p < trainRatio) split = 'train';
      else if (p < trainRatio + valRatio) split = 'val';
      else split = 'test';
    }
    return { ...img, split };
  });

  if (settings.format === 'yolo') {
    // Generate YOLO structure
    // data.yaml
    const namesYaml = categories.map((c, i) => `  ${i}: ${c.name}`).join('\n');
    const dataYaml = `# Labely Generated Dataset
path: ./dataset
train: images/train
val: images/val
test: images/test

names:
${namesYaml}
`;
    zip.file('data.yaml', dataYaml);

    for (const img of partitionedImages) {
      const splitDir = img.split || 'train';
      const baseName = img.name.replace(/\.[^/.]+$/, '');
      const labelLines: string[] = [];

      for (const ann of img.annotations) {
        const classIdx = catMap.get(ann.classId) ?? 0;
        const w = img.width || 1;
        const h = img.height || 1;

        if (ann.type === 'rect') {
          // Normalize bounding box coordinates
          const actualX = Math.min(ann.x, ann.x + ann.width);
          const actualY = Math.min(ann.y, ann.y + ann.height);
          const actualW = Math.abs(ann.width);
          const actualH = Math.abs(ann.height);

          const xc = (actualX + actualW / 2) / w;
          const yc = (actualY + actualH / 2) / h;
          const nw = actualW / w;
          const nh = actualH / h;
          labelLines.push(
            `${classIdx} ${Math.max(0, Math.min(1, xc)).toFixed(6)} ${Math.max(0, Math.min(1, yc)).toFixed(6)} ${Math.max(0, Math.min(1, nw)).toFixed(6)} ${Math.max(0, Math.min(1, nh)).toFixed(6)}`
          );
        } else if (ann.type === 'polygon' && ann.points.length >= 3) {
          const normPts = ann.points
            .map((p) => `${Math.max(0, Math.min(1, p.x / w)).toFixed(6)} ${Math.max(0, Math.min(1, p.y / h)).toFixed(6)}`)
            .join(' ');
          labelLines.push(`${classIdx} ${normPts}`);
        } else if (ann.type === 'obb') {
          const corners = obbToCorners(ann);
          const normCorners = corners
            .map((p) => `${Math.max(0, Math.min(1, p.x / w)).toFixed(6)} ${Math.max(0, Math.min(1, p.y / h)).toFixed(6)}`)
            .join(' ');
          labelLines.push(`${classIdx} ${normCorners}`);
        }
      }

      zip.file(`labels/${splitDir}/${baseName}.txt`, labelLines.join('\n'));

      if (settings.includeImages) {
        const imageBlob = await resolveImageBlob(img);
        if (imageBlob) {
          zip.file(`images/${splitDir}/${img.name}`, imageBlob);
        }
      }
    }
  } else if (settings.format === 'coco') {
    // COCO Format
    const cocoCategories = categories.map((c, idx) => ({
      id: idx + 1,
      name: c.name,
      supercategory: 'object',
    }));

    const cocoImages = partitionedImages.map((img, idx) => ({
      id: idx + 1,
      file_name: img.name,
      width: img.width,
      height: img.height,
      date_captured: new Date().toISOString(),
    }));

    let annotationId = 1;
    const cocoAnnotations: Record<string, unknown>[] = [];

    partitionedImages.forEach((img, imgIdx) => {
      const imageId = imgIdx + 1;
      for (const ann of img.annotations) {
        const catIdx = (catMap.get(ann.classId) ?? 0) + 1;

        if (ann.type === 'rect') {
          const actualX = Math.min(ann.x, ann.x + ann.width);
          const actualY = Math.min(ann.y, ann.y + ann.height);
          const actualW = Math.abs(ann.width);
          const actualH = Math.abs(ann.height);

          cocoAnnotations.push({
            id: annotationId++,
            image_id: imageId,
            category_id: catIdx,
            bbox: [actualX, actualY, actualW, actualH],
            area: actualW * actualH,
            segmentation: [
              [
                actualX, actualY,
                actualX + actualW, actualY,
                actualX + actualW, actualY + actualH,
                actualX, actualY + actualH,
              ],
            ],
            iscrowd: 0,
          });
        } else if (ann.type === 'polygon' && ann.points.length >= 3) {
          const seg: number[] = [];
          ann.points.forEach((p) => seg.push(p.x, p.y));
          const box = getBoundingBox(ann.points);
          cocoAnnotations.push({
            id: annotationId++,
            image_id: imageId,
            category_id: catIdx,
            bbox: [box.x, box.y, box.width, box.height],
            area: getPolygonArea(ann.points),
            segmentation: [seg],
            iscrowd: 0,
          });
        }
      }
    });

    const cocoJSON = {
      info: {
        description: 'Labely Open Source Export',
        url: 'https://labely.org',
        version: '1.0',
        year: new Date().getFullYear(),
        contributor: 'Labely Community',
        date_created: new Date().toISOString(),
      },
      licenses: [{ id: 1, name: 'MIT', url: 'https://opensource.org/licenses/MIT' }],
      images: cocoImages,
      annotations: cocoAnnotations,
      categories: cocoCategories,
    };

    zip.file('annotations.json', JSON.stringify(cocoJSON, null, 2));

    if (settings.includeImages) {
      for (const img of partitionedImages) {
        const imageBlob = await resolveImageBlob(img);
        if (imageBlob) {
          zip.file(`images/${img.name}`, imageBlob);
        }
      }
    }
  } else if (settings.format === 'voc') {
    // Pascal VOC XML files
    for (const img of partitionedImages) {
      const baseName = img.name.replace(/\.[^/.]+$/, '');
      const objectsXml = img.annotations
        .map((ann) => {
          const cat = categories.find((c) => c.id === ann.classId)?.name || 'object';
          let xmin = 0, ymin = 0, xmax = 0, ymax = 0;

          if (ann.type === 'rect') {
            xmin = Math.round(Math.min(ann.x, ann.x + ann.width));
            ymin = Math.round(Math.min(ann.y, ann.y + ann.height));
            xmax = Math.round(Math.max(ann.x, ann.x + ann.width));
            ymax = Math.round(Math.max(ann.y, ann.y + ann.height));
          } else if (ann.type === 'polygon') {
            const b = getBoundingBox(ann.points);
            xmin = Math.round(b.x);
            ymin = Math.round(b.y);
            xmax = Math.round(b.x + b.width);
            ymax = Math.round(b.y + b.height);
          } else if (ann.type === 'obb') {
            const corners = obbToCorners(ann);
            const b = getBoundingBox(corners);
            xmin = Math.round(b.x);
            ymin = Math.round(b.y);
            xmax = Math.round(b.x + b.width);
            ymax = Math.round(b.y + b.height);
          }

          return `  <object>
    <name>${cat}</name>
    <pose>Unspecified</pose>
    <truncated>0</truncated>
    <difficult>0</difficult>
    <bndbox>
      <xmin>${xmin}</xmin>
      <ymin>${ymin}</ymin>
      <xmax>${xmax}</xmax>
      <ymax>${ymax}</ymax>
    </bndbox>
  </object>`;
        })
        .join('\n');

      const vocXml = `<annotation>
  <folder>images</folder>
  <filename>${img.name}</filename>
  <size>
    <width>${img.width}</width>
    <height>${img.height}</height>
    <depth>3</depth>
  </size>
  <segmented>0</segmented>
${objectsXml}
</annotation>`;

      zip.file(`annotations/${baseName}.xml`, vocXml);
      if (settings.includeImages) {
        const imageBlob = await resolveImageBlob(img);
        if (imageBlob) {
          zip.file(`images/${img.name}`, imageBlob);
        }
      }
    }
  } else if (settings.format === 'labelme') {
    // Labelme JSON files
    for (const img of partitionedImages) {
      const baseName = img.name.replace(/\.[^/.]+$/, '');
      const shapes = img.annotations.map((ann) => {
        const cat = categories.find((c) => c.id === ann.classId)?.name || 'object';
        let shapeType = 'polygon';
        let points: [number, number][] = [];

        if (ann.type === 'rect') {
          shapeType = 'rectangle';
          const x1 = Math.min(ann.x, ann.x + ann.width);
          const y1 = Math.min(ann.y, ann.y + ann.height);
          const x2 = Math.max(ann.x, ann.x + ann.width);
          const y2 = Math.max(ann.y, ann.y + ann.height);
          points = [
            [x1, y1],
            [x2, y2],
          ];
        } else if (ann.type === 'polygon') {
          shapeType = 'polygon';
          points = ann.points.map((p) => [p.x, p.y]);
        } else if (ann.type === 'obb') {
          shapeType = 'polygon';
          points = obbToCorners(ann).map((p) => [p.x, p.y]);
        } else if (ann.type === 'point') {
          shapeType = 'point';
          points = [[ann.x, ann.y]];
        } else if (ann.type === 'polyline') {
          shapeType = 'linestrip';
          points = ann.points.map((p) => [p.x, p.y]);
        }

        return {
          label: cat,
          points,
          group_id: null,
          shape_type: shapeType,
          flags: {},
        };
      });

      const labelmeData = {
        version: '5.2.1',
        flags: {},
        shapes,
        imagePath: img.name,
        imageData: null,
        imageHeight: img.height,
        imageWidth: img.width,
      };

      zip.file(`${baseName}.json`, JSON.stringify(labelmeData, null, 2));
      if (settings.includeImages) {
        const imageBlob = await resolveImageBlob(img);
        if (imageBlob) {
          zip.file(img.name, imageBlob);
        }
      }
    }
  } else if (settings.format === 'csv') {
    // CSV tabular export
    const rows: string[] = ['image,width,height,split,class,type,x1,y1,x2,y2,points'];
    for (const img of partitionedImages) {
      for (const ann of img.annotations) {
        const cat = categories.find((c) => c.id === ann.classId)?.name || 'unknown';
        let x1 = 0, y1 = 0, x2 = 0, y2 = 0, ptsStr = '';

        if (ann.type === 'rect') {
          x1 = Math.min(ann.x, ann.x + ann.width);
          y1 = Math.min(ann.y, ann.y + ann.height);
          x2 = Math.max(ann.x, ann.x + ann.width);
          y2 = Math.max(ann.y, ann.y + ann.height);
        } else if (ann.type === 'polygon') {
          const b = getBoundingBox(ann.points);
          x1 = b.x; y1 = b.y; x2 = b.x + b.width; y2 = b.y + b.height;
          ptsStr = ann.points.map((p) => `${p.x}:${p.y}`).join(';');
        }
        rows.push(`"${img.name}",${img.width},${img.height},${img.split || 'train'},"${cat}",${ann.type},${x1.toFixed(1)},${y1.toFixed(1)},${x2.toFixed(1)},${y2.toFixed(1)},"${ptsStr}"`);
      }
    }
    zip.file('annotations.csv', rows.join('\n'));
  } else {
    // labely_json complete backup
    const projectBackup = {
      generator: 'Labely Open Source Annotator',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      categories,
      images: partitionedImages.map((img) => ({
        id: img.id,
        name: img.name,
        width: img.width,
        height: img.height,
        status: img.status,
        split: img.split,
        tags: img.tags,
        annotations: img.annotations,
      })),
    };
    zip.file('labely_project.json', JSON.stringify(projectBackup, null, 2));
  }

  return await zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
