import React from 'react';
import {
  Download,
  Upload,
  BarChart3,
  Sparkles,
  Globe,
  Layers,
  Home,
  Monitor,
} from 'lucide-react';
import { GithubIcon } from './GithubIcon';

interface HeaderProps {
  onOpenExport: () => void;
  onOpenImport: () => void;
  onOpenStats: () => void;
  onOpenAutoAnnotate: () => void;
  onToggleViewMode: () => void;
  isLandingView: boolean;
  totalImages: number;
  totalAnnotations: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenExport,
  onOpenImport,
  onOpenStats,
  onOpenAutoAnnotate,
  onToggleViewMode,
  isLandingView,
  totalImages,
  totalAnnotations,
}) => {
  return (
    <header className="h-14 bg-[#0d121f] border-b border-slate-800/80 px-4 flex items-center justify-between z-30 select-none">
      {/* Brand & Mode */}
      <div className="flex items-center gap-3">
        <div
          onClick={onToggleViewMode}
          className="flex items-center gap-2 cursor-pointer group"
          title="Return to Labely Homepage"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Layers className="w-4 h-4 text-white stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">Labely</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                v1.0 OS
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">labely.org</span>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-slate-800 mx-2 hidden sm:block" />

        {/* Dataset Counter Chips */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono">
          <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/50">
            {totalImages} Images
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/50">
            {totalAnnotations} Labels
          </span>
        </div>
      </div>

      {/* Center Nav / Toggle View */}
      <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
        <button
          onClick={onToggleViewMode}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${isLandingView
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
            }`}
        >
          <Home className="w-3.5 h-3.5" />
          Overview
        </button>
        <button
          onClick={() => {
            if (isLandingView) onToggleViewMode();
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${!isLandingView
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
            }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Studio
        </button>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Health / Stats */}
        <button
          onClick={onOpenStats}
          title="Dataset Analytics & Health"
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors border border-slate-700/60"
        >
          <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Analytics</span>
        </button>

        {/* Auto Annotate */}
        <button
          onClick={onOpenAutoAnnotate}
          title="AI Auto-Annotation"
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 hover:from-indigo-800/60 hover:to-purple-800/60 text-purple-200 rounded-lg text-xs transition-all border border-purple-500/30"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">AI Assist</span>
        </button>

        {/* Import */}
        <button
          onClick={onOpenImport}
          title="Import YOLO / COCO / Labelme"
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors border border-slate-700/60"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Import</span>
        </button>

        {/* Export Dataset Button (Primary) */}
        <button
          onClick={onOpenExport}
          title="Export Dataset in YOLO, COCO, VOC format"
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-xs transition-all shadow-md shadow-blue-600/25 ring-1 ring-blue-400/40"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Export Dataset</span>
        </button>

        {/* GitHub External */}
        <a
          href="https://github.com/zorthana/labely"
          target="_blank"
          rel="noopener noreferrer"
          title="View GitHub Repository"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
        >
          <GithubIcon className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
};
