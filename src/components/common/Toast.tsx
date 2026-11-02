import React from 'react';
import { PawIcon } from '../mascot/PawIcon';
import { Check, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  paw?: boolean;
  onUndo?: () => void;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center justify-between gap-3 p-3.5 bg-[#24203D] text-[#FFF8EE] dark:bg-[#F3EDFD] dark:text-[#24203D] rounded-xl shadow-lg border border-[#B69AFF]/30 animate-in slide-in-from-bottom-2 fade-in duration-200"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {toast.paw ? (
              <div className="w-6 h-6 rounded-lg bg-[#7047D7] dark:bg-[#B69AFF] text-[#FFF8EE] dark:text-[#24203D] flex items-center justify-center shrink-0">
                <PawIcon size={14} fill="currentColor" />
              </div>
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : toast.type === 'warning' ? (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            ) : (
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
            )}
            <p className="text-xs font-medium truncate">{toast.text}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {toast.onUndo && (
              <button
                onClick={() => {
                  toast.onUndo?.();
                  onDismiss(toast.id);
                }}
                className="text-xs font-semibold text-[#B69AFF] dark:text-[#7047D7] hover:underline px-1 py-0.5"
              >
                Undo
              </button>
            )}
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-white/60 hover:text-white dark:text-black/60 dark:hover:text-black p-0.5"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
