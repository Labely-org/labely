import React from 'react';
import {
  X,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  PieChart,
  Layers,
  Image as ImageIcon,
  Tag,
} from 'lucide-react';
import { Category, ImageItem } from '../types/annotation';

interface DatasetStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: ImageItem[];
  categories: Category[];
}

export const DatasetStatsModal: React.FC<DatasetStatsModalProps> = ({
  isOpen,
  onClose,
  images,
  categories,
}) => {
  if (!isOpen) return null;

  const totalImages = images.length;
  const labeledImages = images.filter((i) => i.annotations.length > 0).length;
  const unlabeledImages = totalImages - labeledImages;

  // Count annotations per class
  const classCounts: Record<string, number> = {};
  categories.forEach((c) => (classCounts[c.id] = 0));

  let totalAnnotations = 0;
  const shapeCounts: Record<string, number> = {
    rect: 0,
    polygon: 0,
    obb: 0,
    point: 0,
    polyline: 0,
  };

  images.forEach((img) => {
    img.annotations.forEach((ann) => {
      totalAnnotations++;
      classCounts[ann.classId] = (classCounts[ann.classId] || 0) + 1;
      shapeCounts[ann.type] = (shapeCounts[ann.type] || 0) + 1;
    });
  });

  // Calculate imbalance
  const maxClassCount = Math.max(...Object.values(classCounts), 0);
  const maxClassRatio = totalAnnotations > 0 ? maxClassCount / totalAnnotations : 0;
  const hasSevereImbalance = maxClassRatio > 0.65 && categories.length > 1;

  // Split counts
  const trainCount = images.filter((i) => (i.split || 'train') === 'train').length;
  const valCount = images.filter((i) => i.split === 'val').length;
  const testCount = images.filter((i) => i.split === 'test').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Dataset Analytics & Health</h2>
              <p className="text-xs text-slate-400">
                Inspect class distribution, geometry metrics, and quality alerts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Total Images</span>
              <span className="text-2xl font-bold font-mono text-white">{totalImages}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Total Labels</span>
              <span className="text-2xl font-bold font-mono text-blue-400">{totalAnnotations}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Avg per Image</span>
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {totalImages > 0 ? (totalAnnotations / totalImages).toFixed(1) : 0}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Unlabeled</span>
              <span
                className={`text-2xl font-bold font-mono ${
                  unlabeledImages > 0 ? 'text-amber-400' : 'text-slate-500'
                }`}
              >
                {unlabeledImages}
              </span>
            </div>
          </div>

          {/* Health Diagnostics Alert */}
          {hasSevereImbalance ? (
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-amber-300">
                  Potential Class Imbalance Detected
                </h4>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  A single class accounts for more than {(maxClassRatio * 100).toFixed(0)}% of all
                  annotations. Consider collecting or labeling more samples of minority classes to
                  prevent overfitting during training.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div className="text-xs text-emerald-300">
                <strong>Dataset Health Good:</strong> Balanced distribution and clean annotation
                layers across classes.
              </div>
            </div>
          )}

          {/* Class Distribution Bars */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Class Distribution Histogram
            </h3>
            <div className="space-y-2.5">
              {categories.map((cat) => {
                const count = classCounts[cat.id] || 0;
                const pct = totalAnnotations > 0 ? (count / totalAnnotations) * 100 : 0;

                return (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-medium text-slate-200">{cat.name}</span>
                      </div>
                      <span className="font-mono text-slate-400">
                        {count} ({pct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shape Types & Splits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Shape Types */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
                Geometry Types
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Bounding Boxes (Rect):</span>
                  <span className="font-mono font-bold text-white">{shapeCounts.rect}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Polygons (Segmentation):</span>
                  <span className="font-mono font-bold text-white">{shapeCounts.polygon}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Oriented Boxes (OBB):</span>
                  <span className="font-mono font-bold text-white">{shapeCounts.obb}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Keypoints / Points:</span>
                  <span className="font-mono font-bold text-white">{shapeCounts.point}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Polylines / Lanes:</span>
                  <span className="font-mono font-bold text-white">{shapeCounts.polyline}</span>
                </div>
              </div>
            </div>

            {/* Split Distribution */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
                Splits Distribution
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="text-blue-400">Train Set:</span>
                  <span className="font-mono font-bold text-white">
                    {trainCount} ({totalImages ? ((trainCount / totalImages) * 100).toFixed(0) : 0}
                    %)
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-emerald-400">Validation Set:</span>
                  <span className="font-mono font-bold text-white">
                    {valCount} ({totalImages ? ((valCount / totalImages) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-amber-400">Test Set:</span>
                  <span className="font-mono font-bold text-white">
                    {testCount} ({totalImages ? ((testCount / totalImages) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
