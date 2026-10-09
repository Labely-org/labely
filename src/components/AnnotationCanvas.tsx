import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Annotation,
  Category,
  ImageItem,
  Point,
  RectAnnotation,
  PolygonAnnotation,
  OBBAnnotation,
  PointAnnotation,
  PolylineAnnotation,
  ToolMode,
  ViewTransform,
} from '../types/annotation';
import {
  distance,
  isPointInRect,
  isPointInPolygon,
  isPointInOBB,
  obbToCorners,
  getRectHandles,
  ResizeHandle,
} from '../utils/geometry';
import { detectBoundingBoxFromSeed } from '../utils/aiHeuristics';

interface AnnotationCanvasProps {
  currentImage: ImageItem | null;
  categories: Category[];
  selectedCategoryId: string;
  toolMode: ToolMode;
  selectedAnnotationId: string | null;
  onSelectAnnotation: (id: string | null) => void;
  onAddAnnotation: (ann: Annotation) => void;
  onUpdateAnnotation: (ann: Annotation) => void;
  onDeleteAnnotation: (id: string) => void;
  opacity: number;
  showLabels: boolean;
  transform: ViewTransform;
  onTransformChange: (t: ViewTransform) => void;
}

export const AnnotationCanvas: React.FC<AnnotationCanvasProps> = ({
  currentImage,
  categories,
  selectedCategoryId,
  toolMode,
  selectedAnnotationId,
  onSelectAnnotation,
  onAddAnnotation,
  onUpdateAnnotation,
  opacity,
  showLabels,
  transform,
  onTransformChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  // Interaction State
  const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });
  const [canvasMousePos, setCanvasMousePos] = useState<Point>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });

  // Creation State
  const [isDrawingRect, setIsDrawingRect] = useState(false);
  const [rectStart, setRectStart] = useState<Point>({ x: 0, y: 0 });
  const [activePolygonPoints, setActivePolygonPoints] = useState<Point[]>([]);
  const [activePolylinePoints, setActivePolylinePoints] = useState<Point[]>([]);

  // Editing State
  const [isDraggingShape, setIsDraggingShape] = useState(false);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null);
  const [isRotatingOBB, setIsRotatingOBB] = useState(false);

  // Load Current Image
  useEffect(() => {
    if (!currentImage) {
      imageElementRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentImage.src;
    img.onload = () => {
      imageElementRef.current = img;
      // Auto-fit to screen initially if not already transformed
      if (containerRef.current) {
        const cw = containerRef.current.clientWidth;
        const ch = containerRef.current.clientHeight;
        const scaleX = (cw * 0.85) / img.width;
        const scaleY = (ch * 0.85) / img.height;
        const initScale = Math.min(scaleX, scaleY, 1.2);
        onTransformChange({
          scale: initScale,
          offsetX: (cw - img.width * initScale) / 2,
          offsetY: (ch - img.height * initScale) / 2,
        });
      }
    };
  }, [currentImage?.id]);

  // Screen to Image Coordinates
  const screenToImage = useCallback(
    (screenX: number, screenY: number): Point => {
      return {
        x: (screenX - transform.offsetX) / transform.scale,
        y: (screenY - transform.offsetY) / transform.scale,
      };
    },
    [transform]
  );

  // Find Category Helper
  const getCat = useCallback(
    (classId: string) => categories.find((c) => c.id === classId) || categories[0],
    [categories]
  );

  // Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const container = containerRef.current;
    if (container) {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
        canvas.style.width = `${cw}px`;
        canvas.style.height = `${ch}px`;
      }
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dark grid background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply View Transform
    ctx.save();
    ctx.translate(transform.offsetX, transform.offsetY);
    ctx.scale(transform.scale, transform.scale);

    // 1. Draw Image
    const img = imageElementRef.current;
    if (img && currentImage) {
      ctx.drawImage(img, 0, 0, currentImage.width, currentImage.height);

      // Image border
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1 / transform.scale;
      ctx.strokeRect(0, 0, currentImage.width, currentImage.height);
    }

    // 2. Draw Existing Annotations
    if (currentImage) {
      currentImage.annotations.forEach((ann) => {
        const cat = getCat(ann.classId);
        const isSelected = ann.id === selectedAnnotationId;
        const color = cat?.color || '#3b82f6';

        ctx.lineWidth = (isSelected ? 2.5 : 1.8) / transform.scale;
        ctx.strokeStyle = color;
        ctx.fillStyle = isSelected
          ? `${color}55`
          : `${color}${Math.round(opacity * 255)
              .toString(16)
              .padStart(2, '0')}`;

        if (ann.type === 'rect') {
          ctx.beginPath();
          ctx.rect(ann.x, ann.y, ann.width, ann.height);
          ctx.fill();
          ctx.stroke();

          // Draw resize handles if selected
          if (isSelected) {
            const handles = getRectHandles(ann);
            const hs = 7 / transform.scale;
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5 / transform.scale;

            Object.entries(handles).forEach(([key, pt]) => {
              if (key === 'rot') {
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, hs / 1.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                // Line connecting to top edge
                ctx.beginPath();
                ctx.moveTo(pt.x, pt.y);
                ctx.lineTo(pt.x, ann.y);
                ctx.stroke();
              } else {
                ctx.fillRect(pt.x - hs / 2, pt.y - hs / 2, hs, hs);
                ctx.strokeRect(pt.x - hs / 2, pt.y - hs / 2, hs, hs);
              }
            });
          }

          // Label Tag
          if (showLabels) {
            renderTag(ctx, ann.label || cat?.name || 'Class', ann.x, ann.y, color, transform.scale);
          }
        } else if (ann.type === 'polygon' && ann.points.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(ann.points[0].x, ann.points[0].y);
          for (let i = 1; i < ann.points.length; i++) {
            ctx.lineTo(ann.points[i].x, ann.points[i].y);
          }
          if (ann.closed) ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Vertices
          ann.points.forEach((pt) => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, (isSelected ? 4.5 : 3) / transform.scale, 0, Math.PI * 2);
            ctx.fillStyle = isSelected ? '#ffffff' : color;
            ctx.fill();
            ctx.strokeStyle = color;
            ctx.stroke();
          });

          if (showLabels && ann.points.length > 0) {
            renderTag(ctx, ann.label || cat?.name || 'Polygon', ann.points[0].x, ann.points[0].y, color, transform.scale);
          }
        } else if (ann.type === 'obb') {
          const corners = obbToCorners(ann);
          ctx.beginPath();
          ctx.moveTo(corners[0].x, corners[0].y);
          for (let i = 1; i < 4; i++) {
            ctx.lineTo(corners[i].x, corners[i].y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Orientation direction indicator
          ctx.beginPath();
          ctx.arc(ann.cx, ann.cy, 3 / transform.scale, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();

          if (showLabels) {
            renderTag(ctx, `${ann.label || cat?.name} (${ann.angle.toFixed(0)}°)`, corners[0].x, corners[0].y, color, transform.scale);
          }
        } else if (ann.type === 'point') {
          ctx.beginPath();
          ctx.arc(ann.x, ann.y, 6 / transform.scale, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.lineWidth = 2 / transform.scale;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();

          if (showLabels) {
            renderTag(ctx, ann.label || cat?.name || 'Point', ann.x + 8 / transform.scale, ann.y, color, transform.scale);
          }
        } else if (ann.type === 'polyline' && ann.points.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(ann.points[0].x, ann.points[0].y);
          for (let i = 1; i < ann.points.length; i++) {
            ctx.lineTo(ann.points[i].x, ann.points[i].y);
          }
          ctx.stroke();

          ann.points.forEach((pt) => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 3 / transform.scale, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.stroke();
          });

          if (showLabels && ann.points.length > 0) {
            renderTag(ctx, ann.label || cat?.name || 'Line', ann.points[0].x, ann.points[0].y, color, transform.scale);
          }
        }
      });
    }

    // 3. Draw In-Progress Creations
    const activeCat = getCat(selectedCategoryId);
    const activeColor = activeCat?.color || '#3b82f6';
    ctx.lineWidth = 1.8 / transform.scale;
    ctx.strokeStyle = activeColor;
    ctx.fillStyle = `${activeColor}40`;

    if (isDrawingRect) {
      const rx = Math.min(rectStart.x, mousePos.x);
      const ry = Math.min(rectStart.y, mousePos.y);
      const rw = Math.abs(mousePos.x - rectStart.x);
      const rh = Math.abs(mousePos.y - rectStart.y);
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeRect(rx, ry, rw, rh);
    }

    if (activePolygonPoints.length > 0) {
      ctx.beginPath();
      ctx.moveTo(activePolygonPoints[0].x, activePolygonPoints[0].y);
      for (let i = 1; i < activePolygonPoints.length; i++) {
        ctx.lineTo(activePolygonPoints[i].x, activePolygonPoints[i].y);
      }
      ctx.lineTo(mousePos.x, mousePos.y);
      ctx.stroke();

      activePolygonPoints.forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4 / transform.scale, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.stroke();
      });
    }

    if (activePolylinePoints.length > 0) {
      ctx.beginPath();
      ctx.moveTo(activePolylinePoints[0].x, activePolylinePoints[0].y);
      for (let i = 1; i < activePolylinePoints.length; i++) {
        ctx.lineTo(activePolylinePoints[i].x, activePolylinePoints[i].y);
      }
      ctx.lineTo(mousePos.x, mousePos.y);
      ctx.stroke();
    }

    ctx.restore(); // Restore View Transform

    // 4. Screen-space Crosshair Guidelines
    if (toolMode !== 'pan' && !isPanning && container) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(canvasMousePos.x, 0);
      ctx.lineTo(canvasMousePos.x, container.clientHeight);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, canvasMousePos.y);
      ctx.lineTo(container.clientWidth, canvasMousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }, [
    currentImage,
    categories,
    selectedCategoryId,
    selectedAnnotationId,
    toolMode,
    isDrawingRect,
    rectStart,
    mousePos,
    canvasMousePos,
    activePolygonPoints,
    activePolylinePoints,
    transform,
    opacity,
    showLabels,
    isPanning,
    getCat,
  ]);

  // Helper for crisp tag text
  function renderTag(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    color: string,
    scale: number
  ) {
    ctx.save();
    const fontSize = Math.max(10, Math.min(14, 12 / scale));
    ctx.font = `600 ${fontSize}px Inter, sans-serif`;
    const padding = 4 / scale;
    const textWidth = ctx.measureText(text).width;
    const boxHeight = fontSize + padding * 2;

    ctx.fillStyle = color;
    ctx.fillRect(x, y - boxHeight, textWidth + padding * 2, boxHeight);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x + padding, y - padding);
    ctx.restore();
  }

  // Mouse Wheel (Zooming around cursor)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    const newScale = Math.max(0.1, Math.min(35, transform.scale * zoomFactor));

    // Calculate new offsets so cursor point remains stationary on image
    const newOffsetX = screenX - (screenX - transform.offsetX) * (newScale / transform.scale);
    const newOffsetY = screenY - (screenY - transform.offsetY) * (newScale / transform.scale);

    onTransformChange({
      scale: newScale,
      offsetX: newOffsetX,
      offsetY: newOffsetY,
    });
  };

  // Mouse Down
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || !currentImage) return;

    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const imgPt = screenToImage(screenX, screenY);

    // Pan with Middle Click or Space Key or Pan Tool
    if (e.button === 1 || toolMode === 'pan' || e.altKey) {
      setIsPanning(true);
      setPanStart({ x: screenX - transform.offsetX, y: screenY - transform.offsetY });
      return;
    }

    if (e.button !== 0) return; // Only left click for drawing/selecting

    // Magic Wand / Auto-Detect Seed
    if (toolMode === 'wand') {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && imageElementRef.current) {
        // Create an offscreen canvas to sample original resolution image data
        const offCanvas = document.createElement('canvas');
        offCanvas.width = currentImage.width;
        offCanvas.height = currentImage.height;
        const offCtx = offCanvas.getContext('2d');
        if (offCtx) {
          offCtx.drawImage(imageElementRef.current, 0, 0);
          const detected = detectBoundingBoxFromSeed(offCtx, imgPt, currentImage.width, currentImage.height);
          if (detected) {
            onAddAnnotation({
              id: `ann_wand_${Date.now()}`,
              type: 'rect',
              classId: selectedCategoryId,
              x: detected.x,
              y: detected.y,
              width: detected.width,
              height: detected.height,
            });
            return;
          }
        }
      }
    }

    // Select Tool Interactions
    if (toolMode === 'select') {
      // Check if clicked on a selected rect handle
      if (selectedAnnotationId) {
        const selAnn = currentImage.annotations.find((a) => a.id === selectedAnnotationId);
        if (selAnn && selAnn.type === 'rect') {
          const handles = getRectHandles(selAnn);
          const hitDist = 12 / transform.scale;
          for (const [key, pt] of Object.entries(handles)) {
            if (distance(imgPt, pt) <= hitDist) {
              setActiveHandle(key as ResizeHandle);
              return;
            }
          }
        } else if (selAnn && selAnn.type === 'obb') {
          // Check rotation stalk or center
          const corners = obbToCorners(selAnn);
          const topStalk = {
            x: (corners[0].x + corners[1].x) / 2,
            y: (corners[0].y + corners[1].y) / 2,
          };
          if (distance(imgPt, topStalk) <= 15 / transform.scale) {
            setIsRotatingOBB(true);
            return;
          }
        }
      }

      // Check hit testing top-down (last drawn is top)
      let hitId: string | null = null;
      for (let i = currentImage.annotations.length - 1; i >= 0; i--) {
        const ann = currentImage.annotations[i];
        if (ann.type === 'rect' && isPointInRect(imgPt, ann)) {
          hitId = ann.id;
          break;
        } else if (ann.type === 'polygon' && isPointInPolygon(imgPt, ann.points)) {
          hitId = ann.id;
          break;
        } else if (ann.type === 'obb' && isPointInOBB(imgPt, ann)) {
          hitId = ann.id;
          break;
        } else if (ann.type === 'point' && distance(imgPt, ann) <= 10 / transform.scale) {
          hitId = ann.id;
          break;
        }
      }

      onSelectAnnotation(hitId);

      if (hitId) {
        const hitAnn = currentImage.annotations.find((a) => a.id === hitId);
        if (hitAnn) {
          setIsDraggingShape(true);
          if (hitAnn.type === 'rect') {
            setDragOffset({ x: imgPt.x - hitAnn.x, y: imgPt.y - hitAnn.y });
          } else if (hitAnn.type === 'obb') {
            setDragOffset({ x: imgPt.x - hitAnn.cx, y: imgPt.y - hitAnn.cy });
          } else if (hitAnn.type === 'point') {
            setDragOffset({ x: imgPt.x - hitAnn.x, y: imgPt.y - hitAnn.y });
          }
        }
      }
      return;
    }

    // Rect Drawing
    if (toolMode === 'rect') {
      setIsDrawingRect(true);
      setRectStart(imgPt);
      return;
    }

    // OBB Drawing
    if (toolMode === 'obb') {
      setIsDrawingRect(true);
      setRectStart(imgPt);
      return;
    }

    // Point Drawing
    if (toolMode === 'point') {
      const newPt: PointAnnotation = {
        id: `ann_pt_${Date.now()}`,
        type: 'point',
        classId: selectedCategoryId,
        x: imgPt.x,
        y: imgPt.y,
      };
      onAddAnnotation(newPt);
      return;
    }

    // Polygon Drawing
    if (toolMode === 'polygon') {
      // Check if clicking close to the first point to close polygon
      if (activePolygonPoints.length >= 3 && distance(imgPt, activePolygonPoints[0]) <= 15 / transform.scale) {
        finishPolygon();
      } else {
        setActivePolygonPoints((prev) => [...prev, imgPt]);
      }
      return;
    }

    // Polyline Drawing
    if (toolMode === 'polyline') {
      setActivePolylinePoints((prev) => [...prev, imgPt]);
      return;
    }
  };

  // Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    setCanvasMousePos({ x: screenX, y: screenY });

    const imgPt = screenToImage(screenX, screenY);
    setMousePos(imgPt);

    if (isPanning) {
      onTransformChange({
        ...transform,
        offsetX: screenX - panStart.x,
        offsetY: screenY - panStart.y,
      });
      return;
    }

    if (!currentImage) return;

    // Handle Active Resizing of Rect
    if (activeHandle && selectedAnnotationId) {
      const ann = currentImage.annotations.find((a) => a.id === selectedAnnotationId);
      if (ann && ann.type === 'rect') {
        const updated = { ...ann };
        if (activeHandle === 'br') {
          updated.width = Math.max(5, imgPt.x - ann.x);
          updated.height = Math.max(5, imgPt.y - ann.y);
        } else if (activeHandle === 'tl') {
          const right = ann.x + ann.width;
          const bottom = ann.y + ann.height;
          updated.x = Math.min(right - 5, imgPt.x);
          updated.y = Math.min(bottom - 5, imgPt.y);
          updated.width = right - updated.x;
          updated.height = bottom - updated.y;
        } else if (activeHandle === 'tr') {
          const bottom = ann.y + ann.height;
          updated.y = Math.min(bottom - 5, imgPt.y);
          updated.width = Math.max(5, imgPt.x - ann.x);
          updated.height = bottom - updated.y;
        } else if (activeHandle === 'bl') {
          const right = ann.x + ann.width;
          updated.x = Math.min(right - 5, imgPt.x);
          updated.width = right - updated.x;
          updated.height = Math.max(5, imgPt.y - ann.y);
        }
        onUpdateAnnotation(updated);
      }
      return;
    }

    // Handle OBB Rotation
    if (isRotatingOBB && selectedAnnotationId) {
      const ann = currentImage.annotations.find((a) => a.id === selectedAnnotationId);
      if (ann && ann.type === 'obb') {
        const dx = imgPt.x - ann.cx;
        const dy = imgPt.y - ann.cy;
        const deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        onUpdateAnnotation({ ...ann, angle: (deg + 360) % 360 });
      }
      return;
    }

    // Handle Shape Dragging
    if (isDraggingShape && selectedAnnotationId) {
      const ann = currentImage.annotations.find((a) => a.id === selectedAnnotationId);
      if (!ann || ann.locked) return;

      if (ann.type === 'rect') {
        onUpdateAnnotation({
          ...ann,
          x: imgPt.x - dragOffset.x,
          y: imgPt.y - dragOffset.y,
        });
      } else if (ann.type === 'obb') {
        onUpdateAnnotation({
          ...ann,
          cx: imgPt.x - dragOffset.x,
          cy: imgPt.y - dragOffset.y,
        });
      } else if (ann.type === 'point') {
        onUpdateAnnotation({
          ...ann,
          x: imgPt.x - dragOffset.x,
          y: imgPt.y - dragOffset.y,
        });
      }
    }
  };

  // Mouse Up
  const handleMouseUp = () => {
    setIsPanning(false);
    setIsDraggingShape(false);
    setActiveHandle(null);
    setIsRotatingOBB(false);

    if (isDrawingRect) {
      setIsDrawingRect(false);
      const rx = Math.min(rectStart.x, mousePos.x);
      const ry = Math.min(rectStart.y, mousePos.y);
      const rw = Math.abs(mousePos.x - rectStart.x);
      const rh = Math.abs(mousePos.y - rectStart.y);

      if (rw >= 6 && rh >= 6) {
        if (toolMode === 'rect') {
          const newRect: RectAnnotation = {
            id: `ann_rect_${Date.now()}`,
            type: 'rect',
            classId: selectedCategoryId,
            x: rx,
            y: ry,
            width: rw,
            height: rh,
          };
          onAddAnnotation(newRect);
        } else if (toolMode === 'obb') {
          const newObb: OBBAnnotation = {
            id: `ann_obb_${Date.now()}`,
            type: 'obb',
            classId: selectedCategoryId,
            cx: rx + rw / 2,
            cy: ry + rh / 2,
            width: rw,
            height: rh,
            angle: 0,
          };
          onAddAnnotation(newObb);
        }
      }
    }
  };

  // Double Click / Finish Polygon
  const finishPolygon = useCallback(() => {
    if (activePolygonPoints.length >= 3) {
      const newPoly: PolygonAnnotation = {
        id: `ann_poly_${Date.now()}`,
        type: 'polygon',
        classId: selectedCategoryId,
        points: [...activePolygonPoints],
        closed: true,
      };
      onAddAnnotation(newPoly);
    }
    setActivePolygonPoints([]);
  }, [activePolygonPoints, selectedCategoryId, onAddAnnotation]);

  const finishPolyline = useCallback(() => {
    if (activePolylinePoints.length >= 2) {
      const newLine: PolylineAnnotation = {
        id: `ann_line_${Date.now()}`,
        type: 'polyline',
        classId: selectedCategoryId,
        points: [...activePolylinePoints],
      };
      onAddAnnotation(newLine);
    }
    setActivePolylinePoints([]);
  }, [activePolylinePoints, selectedCategoryId, onAddAnnotation]);

  // Keyboard Shortcuts for Canvas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (activePolygonPoints.length >= 3) finishPolygon();
        if (activePolylinePoints.length >= 2) finishPolyline();
      } else if (e.key === 'Escape') {
        setActivePolygonPoints([]);
        setActivePolylinePoints([]);
        setIsDrawingRect(false);
        onSelectAnnotation(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePolygonPoints, activePolylinePoints, finishPolygon, finishPolyline, onSelectAnnotation]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none bg-[#090d16] ${
        toolMode === 'pan' || isPanning ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'
      }`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={() => {
        if (toolMode === 'polygon') finishPolygon();
        if (toolMode === 'polyline') finishPolyline();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        // Right click cancels active polygon drawing
        if (activePolygonPoints.length > 0) setActivePolygonPoints([]);
      }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Floating Canvas Status HUD */}
      <div className="absolute bottom-3 left-4 flex items-center space-x-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs font-mono text-slate-300 pointer-events-none shadow-xl">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {currentImage?.name || 'No image loaded'}
        </span>
        <span className="text-slate-600">|</span>
        <span>
          X: {Math.round(mousePos.x)} Y: {Math.round(mousePos.y)}
        </span>
        <span className="text-slate-600">|</span>
        <span className="text-blue-400 font-semibold">{Math.round(transform.scale * 100)}%</span>
      </div>
    </div>
  );
};
