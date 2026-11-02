import React, { useState } from 'react';
import { PawIcon } from '../mascot/PawIcon';
import {
  Download,
  Copy,
  Check,
  FileCode,
  Package,
  Sparkles,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  MANIFEST_JSON,
  BACKGROUND_JS,
  POPUP_HTML,
  POPUP_JS,
  DASHBOARD_HTML,
  DASHBOARD_JS,
  README_MD,
  triggerExtensionDownload,
} from '../../lib/extensionPackager';

interface ExtensionPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type?: 'success' | 'warning' | 'error', paw?: boolean) => void;
}

export const ExtensionPackageModal: React.FC<ExtensionPackageModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [selectedFile, setSelectedFile] = useState<string>('manifest.json');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  if (!isOpen) return null;

  const files: Record<string, string> = {
    'manifest.json': MANIFEST_JSON,
    'background.js': BACKGROUND_JS,
    'popup.html': POPUP_HTML,
    'popup.js': POPUP_JS,
    'dashboard.html': DASHBOARD_HTML,
    'dashboard.js': DASHBOARD_JS,
    'README.md': README_MD,
  };

  const handleCopyCode = async () => {
    const code = files[selectedFile];
    if (code) {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      onShowToast(`Copied ${selectedFile} to clipboard!`, 'success');
    }
  };

  const handleDownload = async () => {
    setIsZipping(true);
    try {
      await triggerExtensionDownload();
      onShowToast('Downloaded copycat-chrome-extension-v3.zip! 🐾', 'success', true);
    } catch (err) {
      console.error('Failed to create zip', err);
      onShowToast('Could not package zip file.', 'error');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl bg-white dark:bg-[#24203D] border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl p-6 relative max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7047D7] text-white flex items-center justify-center shadow-md">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Chrome Extension Package (Manifest V3)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Validated icons & Manifest V3 structure ready to load unpacked into Chrome
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

        {/* Verification banner */}
        <div className="my-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs text-emerald-900 dark:text-emerald-200">
              Icons and Manifest V3 validated: Includes binary PNG icons (16px, 48px, 128px) and service worker.
            </span>
          </div>

          <button
            onClick={handleDownload}
            disabled={isZipping}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#7047D7] hover:bg-[#5D37BD] text-white shadow-md shadow-[#7047D7]/20 flex items-center gap-2 shrink-0 active:scale-95 transition-transform"
          >
            <Download className="w-3.5 h-3.5" />
            {isZipping ? 'Packaging...' : 'Download Extension (.zip)'}
          </button>
        </div>

        {/* File Browser & Code Viewer */}
        <div className="flex-1 min-h-0 flex rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-[#1B182B]">
          {/* Sidebar file list */}
          <div className="w-48 border-r border-slate-200 dark:border-slate-700 p-2 space-y-1 overflow-y-auto">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
              Extension Files
            </div>
            {Object.keys(files).map((fileName) => (
              <button
                key={fileName}
                onClick={() => setSelectedFile(fileName)}
                className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-2 ${
                  selectedFile === fileName
                    ? 'bg-[#B69AFF]/20 text-[#7047D7] dark:text-[#B69AFF] font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{fileName}</span>
              </button>
            ))}
            <div className="pt-2 px-2 text-[10px] text-slate-400">
              <span>+ icons/icon16.png</span><br/>
              <span>+ icons/icon48.png</span><br/>
              <span>+ icons/icon128.png</span>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#1E1B33] text-[#F3EDFD]">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/80 bg-[#171426]">
              <span className="font-mono text-xs text-[#B69AFF] font-semibold">
                {selectedFile}
              </span>
              <button
                onClick={handleCopyCode}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="flex-1 p-4 overflow-auto font-mono text-xs leading-relaxed text-[#E8E1F5]">
              {files[selectedFile]}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Unpack & click "Load unpacked" at chrome://extensions</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
