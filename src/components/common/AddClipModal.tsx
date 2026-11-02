import React, { useState, useEffect } from 'react';
import { ClipCategory, Collection } from '../../types/clipboard';
import { detectCategory, readSystemClipboard } from '../../lib/clipboard';
import { PawIcon } from '../mascot/PawIcon';
import { X, ClipboardPaste, Code2, ExternalLink, FileText, Mail, Palette } from 'lucide-react';

interface AddClipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string, options: { category?: ClipCategory; collectionId?: string | null; tags?: string[] }) => void;
  collections: Collection[];
  onShowPermissionError?: (msg: string) => void;
}

export const AddClipModal: React.FC<AddClipModalProps> = ({
  isOpen,
  onClose,
  onSave,
  collections,
  onShowPermissionError,
}) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<ClipCategory>('text');
  const [autoDetected, setAutoDetected] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Update auto-detected category when typing
  useEffect(() => {
    if (content.trim() && autoDetected) {
      setCategory(detectCategory(content));
    }
  }, [content, autoDetected]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePasteFromSystem = async () => {
    const res = await readSystemClipboard();
    if (res.success && res.content) {
      setContent(res.content);
    } else if (res.error) {
      onShowPermissionError?.(res.error);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSave(content, {
      category,
      collectionId: selectedCollection,
      tags,
    });
    setContent('');
    setTags([]);
    setSelectedCollection(null);
    onClose();
  };

  const categories: { id: ClipCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'text', label: 'Text', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'code', label: 'Code', icon: <Code2 className="w-3.5 h-3.5" /> },
    { id: 'link', label: 'Link', icon: <ExternalLink className="w-3.5 h-3.5" /> },
    { id: 'email', label: 'Email', icon: <Mail className="w-3.5 h-3.5" /> },
    { id: 'color', label: 'Color', icon: <Palette className="w-3.5 h-3.5" /> },
  ];

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
              <PawIcon size={18} fill="currentColor" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add New Clip
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Type or paste text to save to your CopyCat vault
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Paste Helper */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Content
            </span>
            <button
              type="button"
              onClick={handlePasteFromSystem}
              className="text-xs font-semibold text-[#7047D7] dark:text-[#B69AFF] hover:underline flex items-center gap-1.5"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              Paste from clipboard
            </button>
          </div>

          {/* Textarea */}
          <textarea
            autoFocus
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste code snippet, URL, notes, or any text here..."
            className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1E1B33] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#7047D7] dark:focus:ring-[#B69AFF] font-mono leading-relaxed"
          />

          {/* Category Selector Tabs */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Category
              </span>
              {autoDetected && content.trim() && (
                <span className="text-[11px] text-[#7047D7] dark:text-[#B69AFF]">
                  Auto-detected: {category}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#1E1B33] rounded-xl">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategory(cat.id);
                    setAutoDetected(false);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    category === cat.id
                      ? 'bg-white dark:bg-[#2C274A] text-[#7047D7] dark:text-[#B69AFF] shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Collection Selector */}
          {collections.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                Collection (Optional)
              </label>
              <select
                value={selectedCollection || ''}
                onChange={(e) => setSelectedCollection(e.target.value || null)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1E1B33] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#7047D7]"
              >
                <option value="">No Collection</option>
                {collections.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
              Tags (Press Enter)
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="e.g. auth, api, react..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1E1B33] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#7047D7]"
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-[#B69AFF]/20 text-[#7047D7] dark:text-[#B69AFF]"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!content.trim()}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#7047D7] hover:bg-[#5D37BD] disabled:opacity-50 text-white shadow-md shadow-[#7047D7]/20 flex items-center gap-2"
            >
              <PawIcon size={14} fill="currentColor" />
              Save Clip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
