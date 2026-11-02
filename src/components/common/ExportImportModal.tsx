import React, { useState } from 'react';
import { ClipItem, Collection, ClipboardExportData } from '../../types/clipboard';
import { exportAllData, importData } from '../../lib/storage';
import { PawIcon } from '../mascot/PawIcon';
import { Download, Upload, Trash2, FileJson, Copy, Check, AlertTriangle, X } from 'lucide-react';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  clips: ClipItem[];
  collections: Collection[];
  onRefreshData: () => void;
  onShowToast: (msg: string, type?: 'success' | 'warning' | 'error', paw?: boolean) => void;
  onClearAll: (unpinnedOnly?: boolean) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  clips,
  collections,
  onRefreshData,
  onShowToast,
  onClearAll,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'cleanup'>('export');
  const [importJsonText, setImportJsonText] = useState('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [copiedJson, setCopiedJson] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [clearUnpinnedOnly, setClearUnpinnedOnly] = useState(false);

  if (!isOpen) return null;

  const handleDownloadJson = async () => {
    const data = await exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `copycat_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Exported backup file successfully! 🐾', 'success', true);
  };

  const handleCopyJson = async () => {
    const data = await exportAllData();
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
    onShowToast('Copied backup JSON to clipboard!', 'success');
  };

  const handleExportMarkdown = async () => {
    let md = `# CopyCat Clipboard Export (${new Date().toLocaleDateString()})\n\n`;
    clips.forEach((clip, index) => {
      const col = collections.find((c) => c.id === clip.collectionId);
      md += `### ${index + 1}. [${clip.category.toUpperCase()}] ${clip.pinned ? '📌 ' : ''}${clip.favorite ? '❤️ ' : ''}${col ? `(${col.name})` : ''}\n`;
      md += `*Created: ${new Date(clip.createdAt).toLocaleString()}*\n\n`;
      if (clip.category === 'code') {
        md += `\`\`\`\n${clip.content}\n\`\`\`\n\n`;
      } else {
        md += `${clip.content}\n\n`;
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `copycat_clips_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Exported Markdown file successfully!', 'success');
  };

  const handleImportSubmit = async () => {
    if (!importJsonText.trim()) {
      onShowToast('Please paste valid JSON data.', 'warning');
      return;
    }

    try {
      const parsed: ClipboardExportData = JSON.parse(importJsonText);
      if (!Array.isArray(parsed.clips)) {
        throw new Error('Invalid format: missing clips array');
      }

      const res = await importData(parsed, importMode);
      onRefreshData();
      onShowToast(
        `Imported ${res.clipsImported} clips and ${res.collectionsImported} collections! 🐾`,
        'success',
        true
      );
      setImportJsonText('');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid JSON file';
      onShowToast(`Import failed: ${msg}`, 'error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJsonText(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#24203D] border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#7047D7] text-white flex items-center justify-center">
              <FileJson className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Data & Storage Management
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Backup, restore, and manage your local clipboard vault
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

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#1E1B33] rounded-xl my-4">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'export'
                ? 'bg-white dark:bg-[#2C274A] text-[#7047D7] dark:text-[#B69AFF] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Export Vault
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'import'
                ? 'bg-white dark:bg-[#2C274A] text-[#7047D7] dark:text-[#B69AFF] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Import Backup
          </button>
          <button
            onClick={() => setActiveTab('cleanup')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'cleanup'
                ? 'bg-white dark:bg-[#2C274A] text-rose-500 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-500'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear History
          </button>
        </div>

        {/* Export tab */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E1B33] border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                Current Vault Statistics
              </span>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span>{clips.length} total clips</span>
                <span aria-hidden="true">·</span>
                <span>{collections.length} collections</span>
                <span aria-hidden="true">·</span>
                <span>{clips.filter((c) => c.pinned).length} pinned</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownloadJson}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-[#7047D7] dark:hover:border-[#B69AFF] bg-white dark:bg-[#201C38] text-left transition-colors flex flex-col justify-between"
              >
                <div>
                  <Download className="w-5 h-5 text-[#7047D7] dark:text-[#B69AFF] mb-1.5" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Download JSON Backup
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Full archive with collections & settings
                  </span>
                </div>
              </button>

              <button
                onClick={handleExportMarkdown}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-[#7047D7] dark:hover:border-[#B69AFF] bg-white dark:bg-[#201C38] text-left transition-colors flex flex-col justify-between"
              >
                <div>
                  <FileJson className="w-5 h-5 text-[#7047D7] dark:text-[#B69AFF] mb-1.5" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Export as Markdown
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Formatted document with code blocks
                  </span>
                </div>
              </button>
            </div>

            <button
              onClick={handleCopyJson}
              className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              {copiedJson ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  Copied JSON to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Raw Backup JSON
                </>
              )}
            </button>
          </div>
        )}

        {/* Import tab */}
        {activeTab === 'import' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Upload Backup File or Paste JSON
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#7047D7]/10 file:text-[#7047D7] hover:file:bg-[#7047D7]/20 cursor-pointer mb-2"
              />
              <textarea
                rows={5}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='Paste {"version":"1.0.0", "clips": [...]} here...'
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-[#1E1B33] border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#7047D7]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Import Mode
              </label>
              <div className="flex gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'merge'}
                    onChange={() => setImportMode('merge')}
                    className="accent-[#7047D7]"
                  />
                  <span>Merge with existing clips</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="accent-rose-500"
                  />
                  <span className="text-rose-500">Replace current vault</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleImportSubmit}
              disabled={!importJsonText.trim()}
              className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-[#7047D7] hover:bg-[#5D37BD] disabled:opacity-50 text-white shadow-md shadow-[#7047D7]/20 flex items-center justify-center gap-2"
            >
              <PawIcon size={14} fill="currentColor" />
              Process & Import Data
            </button>
          </div>
        )}

        {/* Cleanup tab */}
        {activeTab === 'cleanup' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                    Clear Clipboard History
                  </span>
                  <p className="mt-1 text-xs text-rose-800/90 dark:text-rose-300/90">
                    This permanently removes stored items from your local IndexedDB storage. Pinned clips can optionally be preserved.
                  </p>
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={clearUnpinnedOnly}
                onChange={(e) => setClearUnpinnedOnly(e.target.checked)}
                className="w-4 h-4 rounded text-[#7047D7] focus:ring-[#7047D7]"
              />
              <span>Keep pinned items safe (only delete unpinned clips)</span>
            </label>

            {!confirmClearOpen ? (
              <button
                onClick={() => setConfirmClearOpen(true)}
                className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {clearUnpinnedOnly ? 'Clear Unpinned Clips' : 'Clear Entire History'}
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-[#1E1B33] border border-rose-300 dark:border-rose-800 space-y-3">
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 block text-center">
                  Are you absolutely sure? This cannot be undone!
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmClearOpen(false)}
                    className="flex-1 py-2 text-xs font-medium rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onClearAll(clearUnpinnedOnly);
                      setConfirmClearOpen(false);
                      onClose();
                    }}
                    className="flex-1 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
