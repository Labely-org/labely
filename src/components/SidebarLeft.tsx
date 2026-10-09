import React from 'react';
import {
  MousePointer,
  Square,
  Pentagon,
  RotateCcw,
  Dot,
  GitCommit,
  Wand2,
  Hand,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Undo2,
  Redo2,
  Eye,
  EyeOff,
  Sliders,
  HelpCircle,
} from 'lucide-react';
import { ToolMode, ViewTransform } from '../types/annotation';

interface SidebarLeftProps {
  toolMode: ToolMode;
  onSelectTool: (mode: ToolMode) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onFitToScreen: () => void;
  onResetZoom: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  opacity: number;
  onChangeOpacity: (val: number) => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  onOpenShortcuts: () => void;
  transform: ViewTransform;
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({
  toolMode,
  onSelectTool,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onFitToScreen,
  onResetZoom,
  onZoomIn,
  onZoomOut,
  opacity,
  onChangeOpacity,
  showLabels,
  onToggleLabels,
  onOpenShortcuts,
}) => {
  const tools = [
    { id: 'select', label: 'Select & Edit (V)', icon: MousePointer, key: 'V' },
    { id: 'rect', label: 'Bounding Box (B)', icon: Square, key: 'B' },
    { id: 'polygon', label: 'Polygon Mask (P)', icon: Pentagon, key: 'P' },
    { id: 'obb', label: 'Oriented Box OBB (O)', icon: RotateCcw, key: 'O' },
    { id: 'point', label: 'Keypoint / Point (K)', icon: Dot, key: 'K' },
    { id: 'polyline', label: 'Polyline / Lane (L)', icon: GitCommit, key: 'L' },
    { id: 'wand', label: 'Magic Wand / Auto-Contour (W)', icon: Wand2, key: 'W' },
    { id: 'pan', label: 'Pan Tool (H / Space)', icon: Hand, key: 'H' },
  ];

  return (
    <aside className="w-16 flex flex-col items-center justify-between py-3 bg-[#0d121f] border-r border-slate-800/80 z-20 select-none">
      {/* Top Drawing Tools */}
      <div className="flex flex-col items-center space-y-1.5 w-full px-2">
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = toolMode === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTool(t.id as ToolMode)}
              title={t.label}
              className={`relative group flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-400/40'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
              }`}
            >
              <Icon className="w-5 h-5 stroke-[2]" />
              <span className="absolute left-14 hidden group-hover:flex items-center px-2 py-1 text-xs font-medium text-slate-100 bg-slate-900 border border-slate-700 rounded-md shadow-xl whitespace-nowrap z-50">
                {t.label}
              </span>
            </button>
          );
        })}

        <div className="w-8 h-[1px] bg-slate-800 my-1" />

        {/* Undo / Redo */}
        <div className="flex flex-col space-y-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`w-11 h-9 rounded-lg flex items-center justify-center transition-colors ${
              canUndo
                ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className={`w-11 h-9 rounded-lg flex items-center justify-center transition-colors ${
              canRedo
                ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Zoom & View Controls */}
      <div className="flex flex-col items-center space-y-1.5 w-full px-2">
        <div className="w-8 h-[1px] bg-slate-800 my-1" />

        {/* Zoom In/Out */}
        <button
          onClick={onZoomIn}
          title="Zoom In (+)"
          className="w-10 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          title="Zoom Out (-)"
          className="w-10 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={onFitToScreen}
          title="Fit to Screen (F)"
          className="w-10 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Label Visibility */}
        <button
          onClick={onToggleLabels}
          title={showLabels ? 'Hide Labels' : 'Show Labels'}
          className={`w-10 h-8 rounded-lg flex items-center justify-center transition-colors ${
            showLabels ? 'text-blue-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-800'
          }`}
        >
          {showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>

        {/* Shortcuts Cheat Sheet */}
        <button
          onClick={onOpenShortcuts}
          title="Keyboard Shortcuts (?)"
          className="w-10 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
