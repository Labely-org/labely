import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const sections = [
    {
      title: 'Drawing & Annotation Tools',
      shortcuts: [
        { key: 'V', desc: 'Select & Move Tool' },
        { key: 'B', desc: 'Bounding Box (Rect)' },
        { key: 'P', desc: 'Polygon Segmentation' },
        { key: 'O', desc: 'Oriented Bounding Box (OBB)' },
        { key: 'K', desc: 'Keypoint / Point' },
        { key: 'L', desc: 'Polyline / Lane Line' },
        { key: 'W', desc: 'Magic Wand Auto-Contour' },
        { key: '1 - 9', desc: 'Quick switch Active Class' },
      ],
    },
    {
      title: 'Canvas Navigation & View',
      shortcuts: [
        { key: 'Space + Drag', desc: 'Pan canvas' },
        { key: 'Wheel', desc: 'Zoom in / out around cursor' },
        { key: 'F', desc: 'Fit image to screen' },
        { key: 'Enter', desc: 'Close/finish active polygon or line' },
        { key: 'Esc', desc: 'Cancel drawing or deselect shape' },
        { key: 'Right Click', desc: 'Cancel active polygon' },
      ],
    },
    {
      title: 'Dataset & Edit Actions',
      shortcuts: [
        { key: 'D or →', desc: 'Next image in dataset' },
        { key: 'A or ←', desc: 'Previous image in dataset' },
        { key: 'Ctrl + Z', desc: 'Undo last annotation change' },
        { key: 'Ctrl + Y', desc: 'Redo last annotation change' },
        { key: 'Del / Backspace', desc: 'Delete selected annotation' },
        { key: '?', desc: 'Toggle this shortcuts modal' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Keyboard Shortcuts</h2>
              <p className="text-xs text-slate-400">Supercharge your annotation speed</p>
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
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {sections.map((sec, idx) => (
            <div key={idx} className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                {sec.title}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sec.shortcuts.map((sc, scIdx) => (
                  <div
                    key={scIdx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs"
                  >
                    <span className="text-slate-300">{sc.desc}</span>
                    <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-blue-300 font-mono text-[11px] font-semibold">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
