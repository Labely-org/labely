import React, { useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  FolderPlus,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Filter,
} from 'lucide-react';
import { ImageItem } from '../types/annotation';

interface ImageGalleryProps {
  images: ImageItem[];
  currentImageId: string | null;
  onSelectImage: (id: string) => void;
  onAddImages: (files: FileList | null) => void;
  onPrevImage: () => void;
  onNextImage: () => void;
  onDeleteImage: (id: string) => void;
  filterStatus: 'all' | 'labeled' | 'unlabeled';
  onFilterStatusChange: (status: 'all' | 'labeled' | 'unlabeled') => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  currentImageId,
  onSelectImage,
  onAddImages,
  onPrevImage,
  onNextImage,
  onDeleteImage,
  filterStatus,
  onFilterStatusChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const filteredImages = images.filter((img) => {
    if (filterStatus === 'labeled') return img.annotations.length > 0;
    if (filterStatus === 'unlabeled') return img.annotations.length === 0;
    return true;
  });

  const currentIndex = images.findIndex((img) => img.id === currentImageId);

  return (
    <footer className="h-28 bg-[#0a0e1a] border-t border-slate-800/80 flex flex-col z-20 select-none">
      {/* Top Gallery Header Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-800/60 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-200">Dataset Gallery</span>
            <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-mono text-[11px]">
              {currentIndex >= 0 ? currentIndex + 1 : 0} / {images.length}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 px-1 py-0.5 rounded-lg border border-slate-800">
            {(['all', 'labeled', 'unlabeled'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onFilterStatusChange(mode)}
                className={`px-2 py-0.5 rounded capitalize text-[11px] transition-colors ${
                  filterStatus === mode
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation & Upload Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevImage}
            title="Previous Image (A or Left Arrow)"
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Prev [A]
          </button>
          <button
            onClick={onNextImage}
            title="Next Image (D or Right Arrow)"
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors"
          >
            Next [D]
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-slate-800 mx-1" />

          {/* Hidden inputs */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => onAddImages(e.target.files)}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1 bg-blue-600/90 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-all shadow-sm shadow-blue-500/20"
          >
            <Upload className="w-3.5 h-3.5" />
            Add Images
          </button>
        </div>
      </div>

      {/* Thumbnails Row */}
      <div className="flex-1 flex items-center gap-2 px-4 overflow-x-auto py-1 scrollbar-thin">
        {filteredImages.map((img) => {
          const isSelected = img.id === currentImageId;
          const hasAnnotations = img.annotations.length > 0;

          return (
            <div
              key={img.id}
              onClick={() => onSelectImage(img.id)}
              className={`relative group flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500/30 scale-[1.03]'
                  : 'border-slate-800 hover:border-slate-600 opacity-80 hover:opacity-100'
              }`}
            >
              <img
                src={img.src}
                alt={img.name}
                className="w-full h-full object-cover bg-slate-900"
              />

              {/* Status Badge */}
              <div className="absolute top-1 left-1 bg-slate-900/80 backdrop-blur-sm px-1 py-0.2 rounded text-[10px] flex items-center gap-1">
                {hasAnnotations ? (
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                ) : (
                  <Circle className="w-2.5 h-2.5 text-slate-500" />
                )}
                <span className="font-mono text-slate-200">{img.annotations.length}</span>
              </div>

              {/* Split Tag */}
              {img.split && (
                <div className="absolute bottom-1 right-1 uppercase text-[9px] font-mono px-1 rounded bg-black/60 text-slate-300">
                  {img.split}
                </div>
              )}

              {/* Hover Delete Button */}
              {images.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteImage(img.id);
                  }}
                  className="absolute top-1 right-1 p-1 bg-red-600/90 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  title="Remove image"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </footer>
  );
};
