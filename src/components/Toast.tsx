import React, { useEffect } from 'react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-16 right-5 z-50 flex flex-col space-y-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl text-xs text-white backdrop-blur-md animate-in slide-in-from-top duration-150"
        >
          {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {t.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400" />}
          {t.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
          <span className="font-medium">{t.text}</span>
          <button
            onClick={() => onDismiss(t.id)}
            className="text-slate-400 hover:text-white p-0.5 ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
