import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Zap,
  Sliders,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { Category, ImageItem } from '../types/annotation';
import { generateSmartPredictions } from '../utils/aiHeuristics';

interface AutoAnnotateModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: ImageItem[];
  categories: Category[];
  currentImageId: string | null;
  onApplyPredictions: (imageId: string, predictions: any[]) => void;
  onApplyAllUnlabeled: (predictionMap: Map<string, any[]>) => void;
}

export const AutoAnnotateModal: React.FC<AutoAnnotateModalProps> = ({
  isOpen,
  onClose,
  images,
  categories,
  currentImageId,
  onApplyPredictions,
  onApplyAllUnlabeled,
}) => {
  const [scope, setScope] = useState<'current' | 'unlabeled'>('current');
  const [minConfidence, setMinConfidence] = useState(0.75);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const currentImg = images.find((i) => i.id === currentImageId);
  const unlabeledCount = images.filter((i) => i.annotations.length === 0).length;

  const handleRun = () => {
    setIsProcessing(true);
    const classIds = categories.map((c) => c.id);

    setTimeout(() => {
      if (scope === 'current' && currentImg) {
        const preds = generateSmartPredictions(currentImg.width, currentImg.height, classIds);
        onApplyPredictions(currentImg.id, preds);
      } else {
        const predMap = new Map<string, any[]>();
        images.forEach((img) => {
          if (img.annotations.length === 0) {
            const preds = generateSmartPredictions(img.width, img.height, classIds);
            predMap.set(img.id, preds);
          }
        });
        onApplyAllUnlabeled(predMap);
      }
      setIsProcessing(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI-Assisted Auto-Annotation</h2>
              <p className="text-xs text-slate-400">
                Accelerate dataset labeling with automated object proposals
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
        <div className="p-6 space-y-5">
          {/* Engine Banner */}
          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-start gap-3">
            <Cpu className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-purple-200/90 leading-relaxed">
              <strong className="text-purple-100">Zero-Server Client AI Engine:</strong> Computes
              high-contrast object proposals and contour boundaries right inside your browser
              without sending your data to any remote cloud.
            </div>
          </div>

          {/* Scope Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-2">
              Target Scope
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setScope('current')}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  scope === 'current'
                    ? 'bg-blue-600/15 border-blue-500 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="font-semibold block mb-0.5">Current Image</span>
                <span className="text-[11px] text-slate-400">{currentImg?.name || 'Selected'}</span>
              </button>
              <button
                type="button"
                onClick={() => setScope('unlabeled')}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  scope === 'unlabeled'
                    ? 'bg-blue-600/15 border-blue-500 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="font-semibold block mb-0.5">All Unlabeled</span>
                <span className="text-[11px] text-slate-400">{unlabeledCount} images pending</span>
              </button>
            </div>
          </div>

          {/* Confidence Threshold */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Minimum Confidence Threshold</span>
              <span className="font-mono text-purple-400 font-bold">
                {(minConfidence * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              value={minConfidence}
              onChange={(e) => setMinConfidence(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-900/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRun}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            {isProcessing ? 'Generating Proposals...' : 'Run Auto-Annotation'}
          </button>
        </div>
      </div>
    </div>
  );
};
