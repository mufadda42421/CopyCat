import React, { useState } from 'react';
import { ClipCategory, ClipItem, Collection, FilterState } from '../../types/clipboard';
import { ClipCard } from '../common/ClipCard';
import { SleepingCat } from '../mascot/SleepingCat';
import { HappyCat } from '../mascot/HappyCat';
import { PawIcon } from '../mascot/PawIcon';
import {
  Search,
  Plus,
  Maximize2,
  Filter,
  X,
  ClipboardPaste,
  ShieldAlert,
  Moon,
  Sun,
  Sparkles,
} from 'lucide-react';

interface PopupViewProps {
  clips: ClipItem[];
  collections: Collection[];
  filter: FilterState;
  onFilterChange: (newFilter: Partial<FilterState>) => void;
  onCopy: (clip: ClipItem, event?: React.MouseEvent) => void;
  onTogglePin: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onAssignCollection: (clipId: string, colId: string | null) => void;
  onOpenAddModal: () => void;
  onOpenDashboard: () => void;
  onPasteClipboard: () => void;
  lastCopiedTime: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const PopupView: React.FC<PopupViewProps> = ({
  clips,
  collections,
  filter,
  onFilterChange,
  onCopy,
  onTogglePin,
  onToggleFavorite,
  onDelete,
  onAssignCollection,
  onOpenAddModal,
  onOpenDashboard,
  onPasteClipboard,
  lastCopiedTime,
  darkMode,
  onToggleDarkMode,
}) => {
  const [showHappyCat, setShowHappyCat] = useState(false);

  // Trigger happy cat popup for 1.5 seconds when an item was copied
  React.useEffect(() => {
    if (lastCopiedTime > 0) {
      setShowHappyCat(true);
      const timer = setTimeout(() => setShowHappyCat(false), 1600);
      return () => clearTimeout(timer);
    }
  }, [lastCopiedTime]);

  // Filter and sort clips
  const filteredClips = clips.filter((clip) => {
    // Search query
    if (filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase();
      const matchContent = clip.content.toLowerCase().includes(q);
      const matchTags = clip.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchContent && !matchTags) return false;
    }

    // Category
    if (filter.category !== 'all' && clip.category !== filter.category) {
      return false;
    }

    // Filter Type (pinned / favorites)
    if (filter.filterType === 'pinned' && !clip.pinned) return false;
    if (filter.filterType === 'favorites' && !clip.favorite) return false;

    // Collection
    if (filter.collectionId !== 'all' && clip.collectionId !== filter.collectionId) {
      return false;
    }

    return true;
  });

  // Sort: pinned items first, then by chosen sort
  const sortedClips = [...filteredClips].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (filter.sortBy === 'mostCopied') return b.copyCount - a.copyCount;
    if (filter.sortBy === 'oldest') return a.createdAt - b.createdAt;
    if (filter.sortBy === 'alphabetical') return a.content.localeCompare(b.content);
    return b.createdAt - a.createdAt;
  });

  const categories: { id: ClipCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'text', label: 'Text' },
    { id: 'code', label: 'Code' },
    { id: 'link', label: 'Links' },
  ];

  return (
    <div className="w-[380px] h-[580px] flex flex-col bg-[#FFF8EE] dark:bg-[#1A172A] text-[#24203D] dark:text-[#F3EDFD] rounded-3xl shadow-2xl border border-[#B69AFF]/30 overflow-hidden font-sans relative">
      {/* Chrome Extension Top Bar */}
      <header className="px-4 py-3 bg-white dark:bg-[#24203D] border-b border-[#E8E1F5] dark:border-[#383256] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#7047D7] text-white flex items-center justify-center shadow-xs">
            <PawIcon size={16} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-[#7047D7] dark:text-[#B69AFF]">
              CopyCat
            </h1>
            <span className="text-[10px] text-slate-400 block leading-tight">
              {clips.length} {clips.length === 1 ? 'clip' : 'clips'} saved
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Quick Paste from clipboard */}
          <button
            onClick={onPasteClipboard}
            title="Paste from clipboard (Ctrl+V)"
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#7047D7] dark:hover:text-[#B69AFF] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ClipboardPaste className="w-4 h-4" />
          </button>

          {/* New Clip */}
          <button
            onClick={onOpenAddModal}
            title="Add new clip"
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#7047D7] dark:hover:text-[#B69AFF] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Theme */}
          <button
            onClick={onToggleDarkMode}
            title="Toggle Theme"
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#7047D7] dark:hover:text-[#B69AFF] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Open Dashboard */}
          <button
            onClick={onOpenDashboard}
            title="Open Full Dashboard"
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#7047D7] dark:hover:text-[#B69AFF] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Search & Category Filter Bar */}
      <div className="p-3 bg-white/70 dark:bg-[#24203D]/70 backdrop-blur-xs border-b border-[#E8E1F5] dark:border-[#383256] space-y-2 shrink-0">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filter.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search clipboard... (or press /)"
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#1E1B33] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#7047D7]"
          />
          {filter.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onFilterChange({ category: cat.id })}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg whitespace-nowrap transition-colors ${
                filter.category === cat.id
                  ? 'bg-[#7047D7] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-[#1E1B33] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}

          <button
            onClick={() =>
              onFilterChange({
                filterType: filter.filterType === 'pinned' ? 'all' : 'pinned',
              })
            }
            className={`px-2 py-1 text-[11px] font-medium rounded-lg whitespace-nowrap transition-colors ${
              filter.filterType === 'pinned'
                ? 'bg-[#B69AFF] text-[#24203D] font-bold'
                : 'bg-slate-100 dark:bg-[#1E1B33] text-slate-600 dark:text-slate-400'
            }`}
          >
            📌 Pinned
          </button>

          <button
            onClick={() =>
              onFilterChange({
                filterType: filter.filterType === 'favorites' ? 'all' : 'favorites',
              })
            }
            className={`px-2 py-1 text-[11px] font-medium rounded-lg whitespace-nowrap transition-colors ${
              filter.filterType === 'favorites'
                ? 'bg-rose-500 text-white font-bold'
                : 'bg-slate-100 dark:bg-[#1E1B33] text-slate-600 dark:text-slate-400'
            }`}
          >
            ❤️ Favorites
          </button>
        </div>
      </div>

      {/* Main List Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 relative">
        {/* Happy Cat floating notification when copying */}
        {showHappyCat && (
          <div className="absolute inset-x-4 top-4 z-30 p-3 rounded-2xl bg-[#FFF8EE] dark:bg-[#24203D] border border-[#B69AFF] shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <HappyCat size={56} />
            <div>
              <span className="text-xs font-bold text-[#7047D7] dark:text-[#B69AFF] block">
                Pawsome! Copied to clipboard 🐾
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Ready to paste anywhere
              </span>
            </div>
          </div>
        )}

        {sortedClips.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center select-none">
            {clips.length === 0 ? (
              <>
                <SleepingCat size={140} />
                <h3 className="mt-3 text-xs font-bold text-[#7047D7] dark:text-[#B69AFF]">
                  Zzz... CopyCat is snoozing peacefully
                </h3>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 max-w-[240px]">
                  No items copied yet. Copy any text or click below to wake me up!
                </p>
                <button
                  onClick={onPasteClipboard}
                  className="mt-3 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#7047D7] text-white hover:bg-[#5D37BD] shadow-sm flex items-center gap-1.5"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  Paste from Clipboard
                </button>
              </>
            ) : (
              <div className="py-8">
                <span className="text-2xl block mb-2">🔍</span>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No matching clips found
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Try adjusting your search query or filter tags
                </p>
              </div>
            )}
          </div>
        ) : (
          sortedClips.map((clip, index) => (
            <ClipCard
              key={clip.id}
              clip={clip}
              shortcutIndex={index + 1}
              collections={collections}
              onCopy={onCopy}
              onTogglePin={onTogglePin}
              onToggleFavorite={onToggleFavorite}
              onDelete={onDelete}
              onAssignCollection={onAssignCollection}
              compact={true}
            />
          ))
        )}
      </div>

      {/* Extension Footer */}
      <footer className="px-4 py-2.5 bg-white dark:bg-[#24203D] border-t border-[#E8E1F5] dark:border-[#383256] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
        <span className="flex items-center gap-1 font-medium">
          <PawIcon size={12} fill="#7047D7" />
          <span>Copy less. Do more. Meow!</span>
        </span>
        <button
          onClick={onOpenDashboard}
          className="font-semibold text-[#7047D7] dark:text-[#B69AFF] hover:underline flex items-center gap-1"
        >
          <span>Dashboard</span>
          <Maximize2 className="w-3 h-3" />
        </button>
      </footer>
    </div>
  );
};
