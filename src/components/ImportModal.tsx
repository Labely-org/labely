import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  FolderOpen,
  Sparkles,
} from 'lucide-react';
import { Category, ImageItem } from '../types/annotation';
import {
  parseYoloTxt,
  parseCocoJson,
  parseLabelmeJson,
  uid,
  getRandomColor,
} from '../utils/importFormats';
import { SAMPLE_IMAGES, DEFAULT_CATEGORIES } from '../assets/sampleImages';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (images: ImageItem[], categories: Category[], mode: 'replace' | 'merge') => void;
  categories: Category[];
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
  categories,
}) => {
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    setStatusMessage('Reading and parsing files...');

    try {
      const imageFiles: File[] = [];
      const txtFiles: Map<string, string> = new Map();
      let cocoData: any = null;
      let labelmeDataList: { baseName: string; json: any }[] = [];
      let currentCategories: Category[] = [...categories];

      // Step 1: Segregate files
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop()?.toLowerCase();
        const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

        if (['jpg', 'jpeg', 'png', 'webp', 'bmp', 'svg'].includes(ext || '')) {
          imageFiles.push(file);
        } else if (ext === 'txt') {
          const text = await file.text();
          txtFiles.set(base, text);
        } else if (ext === 'json') {
          try {
            const text = await file.text();
            const parsed = JSON.parse(text);
            if (parsed.images && parsed.annotations) {
              cocoData = parsed;
            } else if (parsed.shapes) {
              labelmeDataList.push({ baseName: base, json: parsed });
            } else if (parsed.generator?.includes('Labely')) {
              // Full labely project
              onImportComplete(parsed.images, parsed.categories, importMode);
              setIsProcessing(false);
              onClose();
              return;
            }
          } catch (e) {
            console.error('Error parsing JSON:', file.name, e);
          }
        }
      }

      // Step 2: Parse COCO if present
      let cocoMap = new Map<string, any[]>();
      if (cocoData) {
        const { categories: updatedCats, annotationsByImage } = parseCocoJson(
          cocoData,
          currentCategories
        );
        currentCategories = updatedCats;
        cocoMap = annotationsByImage;
      }

      // Step 3: Build ImageItems
      const newImages: ImageItem[] = [];

      for (const imgFile of imageFiles) {
        const base = imgFile.name.substring(0, imgFile.name.lastIndexOf('.')) || imgFile.name;
        const objectUrl = URL.createObjectURL(imgFile);

        // Get natural dimensions
        const dims = await new Promise<{ w: number; h: number }>((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ w: img.naturalWidth || 800, h: img.naturalHeight || 600 });
          img.onerror = () => resolve({ w: 800, h: 600 });
          img.src = objectUrl;
        });

        let anns: any[] = [];

        // Check YOLO TXT
        if (txtFiles.has(base)) {
          const txt = txtFiles.get(base)!;
          anns = parseYoloTxt(txt, dims.w, dims.h, currentCategories);
        }

        // Check COCO
        if (cocoMap.has(imgFile.name)) {
          anns = cocoMap.get(imgFile.name)!;
        }

        // Check Labelme
        const matchLabelme = labelmeDataList.find((l) => l.baseName === base);
        if (matchLabelme) {
          const { categories: updatedCats, annotations } = parseLabelmeJson(
            matchLabelme.json,
            currentCategories
          );
          currentCategories = updatedCats;
          anns = annotations;
        }

        newImages.push({
          id: uid(),
          name: imgFile.name,
          src: objectUrl,
          width: dims.w,
          height: dims.h,
          annotations: anns,
          status: anns.length > 0 ? 'labeled' : 'unlabeled',
          split: 'train',
          file: imgFile,
        });
      }

      if (newImages.length > 0) {
        onImportComplete(newImages, currentCategories, importMode);
        onClose();
      } else {
        setStatusMessage('No valid images were recognized in the selection.');
      }
    } catch (err) {
      console.error('Import error:', err);
      setStatusMessage('Error importing files. Please check file format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSample = () => {
    onImportComplete(SAMPLE_IMAGES, DEFAULT_CATEGORIES, 'replace');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Import Dataset</h2>
              <p className="text-xs text-slate-400">
                Load images and existing annotations (YOLO txt, COCO, Labelme JSON)
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
          {/* Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-blue-500 hover:bg-blue-950/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.txt,.json,.xml"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="w-14 h-14 rounded-2xl bg-slate-800 group-hover:bg-blue-600/20 text-slate-400 group-hover:text-blue-400 flex items-center justify-center mb-3 transition-colors">
              <FolderOpen className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">
              Click to select or drag and drop files
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mb-3">
              Select your images (.png, .jpg) alongside their annotation files (.txt, .json). Labely
              automatically pairs matching names!
            </p>
            <div className="flex gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                YOLO TXT
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                COCO JSON
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                Labelme JSON
              </span>
            </div>
          </div>

          {statusMessage && (
            <div className="p-3 bg-blue-950/40 border border-blue-900/50 rounded-xl text-xs text-blue-200 text-center font-mono">
              {statusMessage}
            </div>
          )}

          {/* Import Mode Options */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-xs">
            <span className="text-slate-300 font-medium">Dataset Action:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setImportMode('merge')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  importMode === 'merge'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Merge with Current
              </button>
              <button
                type="button"
                onClick={() => setImportMode('replace')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  importMode === 'replace'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Replace Entire Dataset
              </button>
            </div>
          </div>

          {/* Load Sample Dataset */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white block">
                Want to test instantly without uploading?
              </span>
              <span className="text-[11px] text-slate-400">
                Load our autonomous driving and drone aerial sample dataset.
              </span>
            </div>
            <button
              onClick={handleLoadSample}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-medium shadow transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load Sample Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
