import React, { useState } from 'react';
import {
  X,
  Download,
  Check,
  FileArchive,
  Layers,
  Settings2,
  FolderTree,
  Sliders,
} from 'lucide-react';
import { Category, ExportFormat, ExportSettings, ImageItem } from '../types/annotation';
import { exportDataset, downloadBlob } from '../utils/exportFormats';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: ImageItem[];
  categories: Category[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  images,
  categories,
}) => {
  const [format, setFormat] = useState<ExportFormat>('yolo');
  const [includeImages, setIncludeImages] = useState(true);
  const [trainRatio, setTrainRatio] = useState(70);
  const [valRatio, setValRatio] = useState(20);
  const [testRatio, setTestRatio] = useState(10);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const totalAnnotations = images.reduce((acc, img) => acc + img.annotations.length, 0);

  const formats: { id: ExportFormat; title: string; desc: string; badge: string }[] = [
    {
      id: 'yolo',
      title: 'YOLO (v5, v8, v11)',
      desc: 'Normalized txt coordinates + data.yaml + train/val split. Ready for Ultralytics train().',
      badge: 'Popular',
    },
    {
      id: 'coco',
      title: 'COCO JSON',
      desc: 'Standard MS COCO format with bbox, polygon segmentation masks, and category IDs.',
      badge: 'Industry Standard',
    },
    {
      id: 'voc',
      title: 'Pascal VOC XML',
      desc: 'Individual XML annotations for each image with pixel-space coordinates.',
      badge: 'Classic',
    },
    {
      id: 'labelme',
      title: 'Labelme JSON',
      desc: 'Compatible with MIT Labelme format for seamless cross-tool interoperability.',
      badge: 'Interchangeable',
    },
    {
      id: 'csv',
      title: 'CSV Tabular',
      desc: 'Comma-separated values with image name, class name, coordinates for pandas analysis.',
      badge: 'Simple',
    },
    {
      id: 'labely_json',
      title: 'Labely Project Backup',
      desc: 'Complete full-fidelity JSON project archive to restore state anywhere.',
      badge: 'Full Restore',
    },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const settings: ExportSettings = {
        format,
        includeImages,
        trainRatio,
        valRatio,
        testRatio,
        saveYaml: true,
      };

      const zipBlob = await exportDataset(images, categories, settings);
      downloadBlob(zipBlob, `labely_${format}_dataset.zip`);
      onClose();
    } catch (err) {
      console.error('Export error:', err);
      alert('Export failed. See console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Export Dataset</h2>
              <p className="text-xs text-slate-400">
                Package your annotations into standard ML frameworks
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

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Format Selection Grid */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-2.5">
              Select ML Format
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {formats.map((fmt) => {
                const isSelected = format === fmt.id;
                return (
                  <div
                    key={fmt.id}
                    onClick={() => setFormat(fmt.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500 shadow-sm shadow-blue-500/20'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-white">{fmt.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {fmt.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{fmt.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dataset Split Configuration */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-400" />
                Train / Validation / Test Split
              </span>
              <span className="text-xs font-mono text-slate-400">
                {trainRatio}% / {valRatio}% / {testRatio}%
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Train ({trainRatio}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={trainRatio}
                  onChange={(e) => {
                    const t = Number(e.target.value);
                    setTrainRatio(t);
                    setValRatio(Math.round((100 - t) * 0.7));
                    setTestRatio(100 - t - Math.round((100 - t) * 0.7));
                  }}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Val ({valRatio}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={valRatio}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setValRatio(v);
                    setTestRatio(Math.max(0, 100 - trainRatio - v));
                  }}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Test ({testRatio}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={testRatio}
                  onChange={(e) => setTestRatio(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800">
            <div>
              <span className="text-sm font-medium text-slate-200 block">
                Include Image Files in Zip
              </span>
              <span className="text-xs text-slate-400">
                Packages images into <code className="text-blue-300">images/train</code> and{' '}
                <code className="text-blue-300">images/val</code>
              </span>
            </div>
            <input
              type="checkbox"
              checked={includeImages}
              onChange={(e) => setIncludeImages(e.target.checked)}
              className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Summary Box */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-blue-950/30 border border-blue-900/40 text-xs text-blue-200">
            <span>
              Summary: <strong className="text-white">{images.length} images</strong>,{' '}
              <strong className="text-white">{totalAnnotations} labels</strong> across{' '}
              <strong className="text-white">{categories.length} classes</strong>.
            </span>
            <span className="font-mono text-blue-400">Ready to build</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-900/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Generating Zip...' : 'Download Dataset Zip'}
          </button>
        </div>
      </div>
    </div>
  );
};
