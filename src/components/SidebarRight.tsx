import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Lock,
  Unlock,
  Tag,
  Square,
  Pentagon,
  RotateCcw,
  Dot,
  GitCommit,
  CheckCircle2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Annotation, Category, DatasetSplit, ImageItem } from '../types/annotation';

interface SidebarRightProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  onAddCategory: (name: string, color: string) => void;
  onDeleteCategory: (id: string) => void;
  currentImage: ImageItem | null;
  selectedAnnotationId: string | null;
  onSelectAnnotation: (id: string | null) => void;
  onUpdateAnnotation: (ann: Annotation) => void;
  onDeleteAnnotation: (id: string) => void;
  onAddImageTag: (tag: string) => void;
  onRemoveImageTag: (tag: string) => void;
  onChangeSplit: (split: DatasetSplit) => void;
  onAutoDetectCurrent: () => void;
}

export const SidebarRight: React.FC<SidebarRightProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onAddCategory,
  onDeleteCategory,
  currentImage,
  selectedAnnotationId,
  onSelectAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  onAddImageTag,
  onRemoveImageTag,
  onChangeSplit,
  onAutoDetectCurrent,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');
  const [showAddCat, setShowAddCat] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim(), newCatColor);
    setNewCatName('');
    setShowAddCat(false);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    onAddImageTag(newTagInput.trim().toLowerCase());
    setNewTagInput('');
  };

  const getShapeIcon = (type: string) => {
    switch (type) {
      case 'rect':
        return <Square className="w-3.5 h-3.5 text-blue-400" />;
      case 'polygon':
        return <Pentagon className="w-3.5 h-3.5 text-emerald-400" />;
      case 'obb':
        return <RotateCcw className="w-3.5 h-3.5 text-purple-400" />;
      case 'point':
        return <Dot className="w-3.5 h-3.5 text-amber-400" />;
      case 'polyline':
        return <GitCommit className="w-3.5 h-3.5 text-orange-400" />;
      default:
        return <Square className="w-3.5 h-3.5" />;
    }
  };

  return (
    <aside className="w-72 flex flex-col bg-[#0d121f] border-l border-slate-800/80 z-20 select-none overflow-hidden h-full">
      {/* 1. Classes / Categories Section */}
      <div className="flex flex-col border-b border-slate-800/80 p-3.5 max-h-[42%] overflow-y-auto">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-semibold tracking-wider text-slate-200 uppercase">
              Classes ({categories.length})
            </h3>
          </div>
          <button
            onClick={() => setShowAddCat(!showAddCat)}
            className="flex items-center gap-1 text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
        </div>

        {/* Add Class Form */}
        {showAddCat && (
          <form onSubmit={handleCreateCategory} className="mb-3 p-2 bg-slate-900/90 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Class name..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-100 focus:outline-none focus:border-blue-500"
                autoFocus
              />
              <input
                type="color"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
              />
            </div>
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setShowAddCat(false)}
                className="text-xs px-2 py-0.5 text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-xs px-2.5 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium"
              >
                Add
              </button>
            </div>
          </form>
        )}

        {/* Classes List */}
        <div className="space-y-1 overflow-y-auto pr-1">
          {categories.map((c, idx) => {
            const isSelected = c.id === selectedCategoryId;
            const countInImage =
              currentImage?.annotations.filter((a) => a.classId === c.id).length || 0;

            return (
              <div
                key={c.id}
                onClick={() => onSelectCategory(c.id)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-all duration-150 text-xs ${
                  isSelected
                    ? 'bg-blue-600/20 text-white border border-blue-500/50'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="font-medium truncate">{c.name}</span>
                  {idx < 9 && (
                    <span className="text-[10px] text-slate-500 font-mono">[{idx + 1}]</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-mono bg-slate-800/80 px-1.5 py-0.2 rounded">
                    {countInImage}
                  </span>
                  {categories.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCategory(c.id);
                      }}
                      className="text-slate-500 hover:text-red-400 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Image Layer Stack & Annotations */}
      <div className="flex-1 flex flex-col p-3.5 overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold tracking-wider text-slate-200 uppercase">
              Annotations ({currentImage?.annotations.length || 0})
            </h3>
          </div>
          <button
            onClick={onAutoDetectCurrent}
            title="Run AI Auto-Annotation on this image"
            className="flex items-center gap-1 text-[11px] px-2 py-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded font-medium shadow transition-all"
          >
            <Sparkles className="w-3 h-3" />
            Auto-AI
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {(!currentImage?.annotations || currentImage.annotations.length === 0) && (
            <div className="flex flex-col items-center justify-center h-32 text-slate-500 text-xs text-center px-4">
              <Layers className="w-8 h-8 stroke-1 mb-1 text-slate-600" />
              <span>No annotations yet. Draw a box (B) or polygon (P) to start.</span>
            </div>
          )}

          {currentImage?.annotations.map((ann, idx) => {
            const cat = categories.find((c) => c.id === ann.classId) || categories[0];
            const isSelected = ann.id === selectedAnnotationId;

            return (
              <div
                key={ann.id}
                onClick={() => onSelectAnnotation(ann.id)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer text-xs border transition-all ${
                  isSelected
                    ? 'bg-blue-600/25 border-blue-500 text-white shadow'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {getShapeIcon(ann.type)}
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="truncate font-medium">{ann.label || cat.name}</span>
                  {ann.confidence && (
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {(ann.confidence * 100).toFixed(0)}%
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateAnnotation({ ...ann, locked: !ann.locked });
                    }}
                    className="text-slate-500 hover:text-slate-300 p-1"
                    title={ann.locked ? 'Unlock' : 'Lock'}
                  >
                    {ann.locked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteAnnotation(ann.id);
                    }}
                    className="text-slate-500 hover:text-red-400 p-1"
                    title="Delete annotation"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Image Tags & Dataset Split */}
      {currentImage && (
        <div className="border-t border-slate-800/80 p-3 bg-slate-900/40 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 font-medium">Dataset Split:</span>
            <div className="flex items-center gap-1">
              {(['train', 'val', 'test'] as DatasetSplit[]).map((sp) => (
                <button
                  key={sp}
                  onClick={() => onChangeSplit(sp)}
                  className={`px-2 py-0.5 rounded text-[11px] uppercase font-mono font-medium transition-colors ${
                    currentImage.split === sp
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sp}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap gap-1">
              {currentImage.tags?.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]"
                >
                  #{tag}
                  <button
                    onClick={() => onRemoveImageTag(tag)}
                    className="hover:text-red-400 text-slate-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <form onSubmit={handleAddTag} className="flex gap-1">
              <input
                type="text"
                placeholder="Add tag (e.g. night, wet)..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-[11px] text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
              >
                +
              </button>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};
