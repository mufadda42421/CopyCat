import React from 'react';
import { PawIcon } from '../mascot/PawIcon';
import { ShieldCheck, Lock, AlertTriangle, Key, Terminal, X, CheckCircle2 } from 'lucide-react';

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PermissionsModal: React.FC<PermissionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white dark:bg-[#24203D] border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7047D7] text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Privacy & Browser Permissions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                How CopyCat safeguards your data and handles Chrome restrictions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {/* Privacy Guarantee */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                  100% Local Storage Guarantee
                </span>
                <p className="mt-1 text-emerald-800/90 dark:text-emerald-300/90">
                  Your clipboard history never leaves your device. All data is saved directly in browser IndexedDB (<code className="font-mono text-[11px] bg-emerald-100 dark:bg-emerald-900 px-1 py-0.5 rounded">CopyCatClipboardDB</code>) and local Chrome storage. No servers, no analytics, no third-party telemetry.
                </p>
              </div>
            </div>
          </div>

          {/* Browser Limitation Explanation */}
          <div className="p-4 rounded-2xl bg-[#FFF8EE] dark:bg-[#1E1B33] border border-[#B69AFF]/40">
            <div className="flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-[#7047D7] dark:text-[#B69AFF] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">
                  Why Browsers Restrict Background Clipboard Access
                </span>
                <p className="mt-1">
                  Modern browsers (Chrome, Edge, Firefox) enforce strict security:
                </p>
                <ul className="list-disc pl-4 mt-2 space-y-1.5">
                  <li>
                    <strong>Active Tab & User Gesture:</strong> Web pages cannot read your clipboard silently in the background. Clipboard reading requires an explicit user action (like pressing <kbd className="font-mono px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px]">Ctrl+V</kbd> or clicking "Paste").
                  </li>
                  <li>
                    <strong>Chrome Extension Manifest V3 Advantage:</strong> When installed as an unpacked Chrome Extension, CopyCat uses the dedicated <code className="font-mono text-[11px] bg-purple-100 dark:bg-purple-900/40 text-[#7047D7] dark:text-[#B69AFF] px-1 py-0.5 rounded">clipboardRead</code> and <code className="font-mono text-[11px] bg-purple-100 dark:bg-purple-900/40 text-[#7047D7] dark:text-[#B69AFF] px-1 py-0.5 rounded">clipboardWrite</code> permissions along with background service worker context menus.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sensitive Data Protection */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E1B33]/80 border border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-2.5">
              <Key className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">
                  Built-in Sensitive Shield
                </span>
                <p className="mt-1">
                  CopyCat automatically detects passwords, API keys (e.g., Stripe, GitHub, Google Cloud), JWT tokens, and card numbers. They are masked by default in the list with a one-click eye toggle to reveal only when you need them.
                </p>
              </div>
            </div>
          </div>

          {/* Permissions Breakdown */}
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
              Extension Manifest Permissions Explained
            </h4>
            <div className="space-y-2 font-mono text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#1B182B] flex items-center justify-between">
                <span className="text-[#7047D7] dark:text-[#B69AFF]">"storage" & "unlimitedStorage"</span>
                <span className="text-slate-500 font-sans text-xs">Persists clips & collections locally</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#1B182B] flex items-center justify-between">
                <span className="text-[#7047D7] dark:text-[#B69AFF]">"clipboardRead" & "clipboardWrite"</span>
                <span className="text-slate-500 font-sans text-xs">Reads/writes text on copy action</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#1B182B] flex items-center justify-between">
                <span className="text-[#7047D7] dark:text-[#B69AFF]">"contextMenus"</span>
                <span className="text-slate-500 font-sans text-xs">Right-click "Save to CopyCat"</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#7047D7] hover:bg-[#5D37BD] text-white shadow-sm flex items-center gap-1.5"
          >
            <PawIcon size={14} fill="currentColor" />
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
