import React, { useState } from 'react';
import {
  ClipCategory,
  ClipItem,
  Collection,
  FilterState,
  UserSettings,
} from '../../types/clipboard';
import { ClipCard } from '../common/ClipCard';
import { SleepingCat } from '../mascot/SleepingCat';
import { HappyCat } from '../mascot/HappyCat';
import { PawIcon } from '../mascot/PawIcon';
import {
  Search,
  Plus,
  Pin,
  Heart,
  Code2,
  ExternalLink,
  FileText,
  Mail,
  Palette,
  Folder,
  FolderPlus,
  Settings,
  Download,
  ShieldCheck,
  Package,
  SlidersHorizontal,
  ClipboardPaste,
  Moon,
  Sun,
  LayoutGrid,
  Laptop,
  X,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';

interface DashboardViewProps {
  clips: ClipItem[];
  collections: Collection[];
  filter: FilterState;
  onFilterChange: (newFilter: Partial<FilterState>) => void;
  onCopy: (clip: ClipItem, event?: React.MouseEvent) => void;
  onTogglePin: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onAssignCollection: (clipId: string, colId: string | null) => void;
  onCreateCollection: (name: string, color: string) => void;
  onDeleteCollection: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenExportImport: () => void;
  onOpenExtensionPackage: () => void;
  onOpenPermissions: () => void;
  onPasteClipboard: () => void;
  lastCopiedTime: number;
  settings: UserSettings;
  onUpdateSettings: (s: Partial<UserSettings>) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onSwitchToPopupView: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  clips,
  collections,
  filter,
  onFilterChange,
  onCopy,
  onTogglePin,
  onToggleFavorite,
  onDelete,
  onAssignCollection,
  onCreateCollection,
  onDeleteCollection,
  onOpenAddModal,
  onOpenExportImport,
  onOpenExtensionPackage,
  onOpenPermissions,
  onPasteClipboard,
  lastCopiedTime,
  settings,
  onUpdateSettings,
  darkMode,
  onToggleDarkMode,
  onSwitchToPopupView,
}) => {
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColColor, setNewColColor] = useState('#7047D7');
  const [showHappyToast, setShowHappyToast] = useState(false);

  // Trigger happy cat animation for 1.8s when copy action occurs
  React.useEffect(() => {
    if (lastCopiedTime > 0) {
      setShowHappyToast(true);
      const timer = setTimeout(() => setShowHappyToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastCopiedTime]);

  const handleCreateColSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    onCreateCollection(newColName.trim(), newColColor);
    setNewColName('');
    setShowAddCollection(false);
  };

  // Filter & sort
  const filteredClips = clips.filter((clip) => {
    if (filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase();
      const matchContent = clip.content.toLowerCase().includes(q);
      const matchTags = clip.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchContent && !matchTags) return false;
    }

    if (filter.category !== 'all' && clip.category !== filter.category) {
      return false;
    }

    if (filter.filterType === 'pinned' && !clip.pinned) return false;
    if (filter.filterType === 'favorites' && !clip.favorite) return false;

    if (filter.collectionId !== 'all' && clip.collectionId !== filter.collectionId) {
      return false;
    }

    return true;
  });

  const sortedClips = [...filteredClips].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (filter.sortBy === 'mostCopied') return b.copyCount - a.copyCount;
    if (filter.sortBy === 'oldest') return a.createdAt - b.createdAt;
    if (filter.sortBy === 'alphabetical') return a.content.localeCompare(b.content);
    return b.createdAt - a.createdAt;
  });

  const pinnedCount = clips.filter((c) => c.pinned).length;
  const favoritesCount = clips.filter((c) => c.favorite).length;

  const colorPalette = ['#7047D7', '#B69AFF', '#FFD9E4', '#3B82F6', '#10B981', '#F59E0B'];

  return (
    <div className="flex-1 flex min-h-screen bg-[#FFF8EE] dark:bg-[#1A172A] text-[#24203D] dark:text-[#F3EDFD] font-sans antialiased">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#201C38] border-r border-[#E8E1F5] dark:border-[#383256] flex flex-col shrink-0 select-none">
        {/* Brand Lockup */}
        <div className="p-5 border-b border-[#E8E1F5] dark:border-[#383256] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#7047D7] text-white flex items-center justify-center shadow-md shadow-[#7047D7]/20">
              <PawIcon size={20} fill="currentColor" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-[#7047D7] dark:text-[#B69AFF]">
                CopyCat
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block -mt-0.5">
                Copy less. Do more.
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Main views */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
              History Views
            </div>
            <div className="space-y-1">
              <button
                onClick={() =>
                  onFilterChange({
                    filterType: 'all',
                    category: 'all',
                    collectionId: 'all',
                  })
                }
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  filter.filterType === 'all' && filter.category === 'all' && filter.collectionId === 'all'
                    ? 'bg-[#7047D7] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutGrid className="w-4 h-4" />
                  <span>All Clips</span>
                </div>
                <span className="text-[11px] opacity-80 tabular-nums">{clips.length}</span>
              </button>

              <button
                onClick={() =>
                  onFilterChange({
                    filterType: 'pinned',
                    category: 'all',
                    collectionId: 'all',
                  })
                }
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  filter.filterType === 'pinned'
                    ? 'bg-[#7047D7] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Pin className="w-4 h-4" />
                  <span>Pinned</span>
                </div>
                <span className="text-[11px] opacity-80 tabular-nums">{pinnedCount}</span>
              </button>

              <button
                onClick={() =>
                  onFilterChange({
                    filterType: 'favorites',
                    category: 'all',
                    collectionId: 'all',
                  })
                }
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  filter.filterType === 'favorites'
                    ? 'bg-[#7047D7] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Favorites</span>
                </div>
                <span className="text-[11px] opacity-80 tabular-nums">{favoritesCount}</span>
              </button>
            </div>
          </div>

          {/* Categories */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
              Categories
            </div>
            <div className="space-y-1 text-xs">
              {[
                { id: 'text', label: 'Plain Text', icon: <FileText className="w-4 h-4 text-slate-400" /> },
                { id: 'code', label: 'Code Snippets', icon: <Code2 className="w-4 h-4 text-[#7047D7] dark:text-[#B69AFF]" /> },
                { id: 'link', label: 'Links & URLs', icon: <ExternalLink className="w-4 h-4 text-blue-500" /> },
                { id: 'email', label: 'Emails', icon: <Mail className="w-4 h-4 text-emerald-500" /> },
                { id: 'color', label: 'Hex & Colors', icon: <Palette className="w-4 h-4 text-amber-500" /> },
              ].map((cat) => {
                const count = clips.filter((c) => c.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() =>
                      onFilterChange({
                        category: cat.id as ClipCategory,
                        filterType: 'all',
                        collectionId: 'all',
                      })
                    }
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl transition-colors ${
                      filter.category === cat.id
                        ? 'bg-[#B69AFF]/20 text-[#7047D7] dark:text-[#B69AFF] font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {cat.icon}
                      <span>{cat.label}</span>
                    </div>
                    <span className="text-[11px] tabular-nums text-slate-400">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Collections */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Collections
              </span>
              <button
                onClick={() => setShowAddCollection(!showAddCollection)}
                className="text-[11px] font-semibold text-[#7047D7] dark:text-[#B69AFF] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                New
              </button>
            </div>

            {showAddCollection && (
              <form onSubmit={handleCreateColSubmit} className="p-3 mb-2 rounded-2xl bg-slate-50 dark:bg-[#1E1B33] border border-slate-200 dark:border-slate-700 space-y-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Collection name (e.g. Work, Snippets)"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#2C274A] focus:outline-hidden focus:ring-1 focus:ring-[#7047D7]"
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {colorPalette.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setNewColColor(col)}
                        className={`w-4 h-4 rounded-full transition-transform ${
                          newColColor === col ? 'scale-125 ring-2 ring-black/20 dark:ring-white/40' : ''
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setShowAddCollection(false)}
                      className="px-2 py-0.5 text-[10px] text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newColName.trim()}
                      className="px-2.5 py-0.5 text-[10px] font-bold bg-[#7047D7] text-white rounded-md disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="space-y-1 text-xs">
              {collections.length === 0 ? (
                <div className="px-2 py-1.5 text-[11px] text-slate-400 italic">
                  No collections created yet.
                </div>
              ) : (
                collections.map((col) => {
                  const count = clips.filter((c) => c.collectionId === col.id).length;
                  return (
                    <div
                      key={col.id}
                      className={`group flex items-center justify-between px-3 py-1.5 rounded-xl transition-colors ${
                        filter.collectionId === col.id
                          ? 'bg-[#B69AFF]/20 text-[#7047D7] dark:text-[#B69AFF] font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <button
                        onClick={() =>
                          onFilterChange({
                            collectionId: col.id,
                            category: 'all',
                            filterType: 'all',
                          })
                        }
                        className="flex items-center gap-2 min-w-0 flex-1 text-left"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: col.color }}
                        />
                        <span className="truncate">{col.name}</span>
                      </button>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] text-slate-400 tabular-nums">{count}</span>
                        <button
                          onClick={() => onDeleteCollection(col.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-0.5"
                          title="Delete collection"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-[#E8E1F5] dark:border-[#383256] space-y-1">
          <button
            onClick={onOpenExtensionPackage}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#7047D7] dark:text-[#B69AFF] hover:bg-[#B69AFF]/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>Extension Package</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#7047D7] text-white">
              V3
            </span>
          </button>

          <button
            onClick={onOpenPermissions}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Privacy & Permissions</span>
          </button>

          <button
            onClick={onOpenExportImport}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export & Backup</span>
          </button>

          {/* Sound toggle */}
          <div className="pt-2 px-3 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              {settings.soundEffects ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>Meow sounds</span>
            </span>
            <input
              type="checkbox"
              checked={settings.soundEffects}
              onChange={(e) => onUpdateSettings({ soundEffects: e.target.checked })}
              className="accent-[#7047D7] cursor-pointer"
            />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Bar adhering to Top Bar Contract */}
        <header className="px-8 py-4 bg-white/80 dark:bg-[#201C38]/80 backdrop-blur-md border-b border-[#E8E1F5] dark:border-[#383256] flex items-center justify-between gap-8 shrink-0 sticky top-0 z-30">
          {/* Zone 1: Single element brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              {filter.collectionId !== 'all'
                ? collections.find((c) => c.id === filter.collectionId)?.name || 'Collection'
                : filter.filterType === 'pinned'
                ? 'Pinned Clips'
                : filter.filterType === 'favorites'
                ? 'Favorite Clips'
                : filter.category !== 'all'
                ? `${filter.category.toUpperCase()} Clips`
                : 'Clipboard History'}
            </h2>
            <span className="text-xs text-slate-400 font-medium tabular-nums">
              ({sortedClips.length})
            </span>
          </div>

          {/* Zone 2: Search & Sort Links */}
          <div className="flex-1 max-w-md flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filter.searchQuery}
                onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
                placeholder="Search clips by text or tag... (Press /)"
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#1E1B33] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#7047D7]"
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

            <select
              value={filter.sortBy}
              onChange={(e) =>
                onFilterChange({
                  sortBy: e.target.value as FilterState['sortBy'],
                })
              }
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#1E1B33] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-[#7047D7] shrink-0"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="mostCopied">Most Copied</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>

          {/* Zone 3: Primary action + Popup Switcher + Theme */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick paste button */}
            <button
              onClick={onPasteClipboard}
              title="Paste from system clipboard (Ctrl+V)"
              className="px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#7047D7] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <ClipboardPaste className="w-4 h-4 text-[#7047D7] dark:text-[#B69AFF]" />
              <span>Paste</span>
            </button>

            {/* Add clip modal button */}
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#7047D7] hover:bg-[#5D37BD] text-white shadow-md shadow-[#7047D7]/20 flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <PawIcon size={14} fill="currentColor" />
              <span>New Clip</span>
            </button>

            {/* Switch to Extension Popup View */}
            <button
              onClick={onSwitchToPopupView}
              title="Switch to compact Extension Popup frame"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#7047D7] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Laptop className="w-4 h-4" />
            </button>

            {/* Dark mode */}
            <button
              onClick={onToggleDarkMode}
              title="Toggle Theme"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#7047D7] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Sub-header info / Active filter indicator */}
        <div className="px-8 py-3 bg-[#FFF8EE]/60 dark:bg-[#1A172A]/60 border-b border-[#E8E1F5]/60 dark:border-[#383256]/60 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>IndexedDB Local Storage Active</span>
            <span aria-hidden="true">·</span>
            <span>Duplicate Protection: {settings.duplicateHandling}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              Zero-Server Privacy Shield On
            </span>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span>Shortcuts:</span>
            <kbd className="font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px]">
              Ctrl+V
            </kbd>
            <span>paste</span>
            <kbd className="font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px]">
              /
            </kbd>
            <span>search</span>
            <kbd className="font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px]">
              1-9
            </kbd>
            <span>copy item</span>
          </div>
        </div>

        {/* Happy Cat floating celebratory toast */}
        {showHappyToast && (
          <div className="fixed top-20 right-8 z-40 p-4 rounded-3xl bg-white dark:bg-[#201C38] border-2 border-[#B69AFF] shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-4 fade-in duration-200">
            <HappyCat size={64} />
            <div>
              <span className="text-sm font-extrabold text-[#7047D7] dark:text-[#B69AFF] block">
                Purr-fect! Copied to clipboard! 🐾
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Ready to paste in any app or tab
              </span>
            </div>
          </div>
        )}

        {/* Clips Grid / Empty State */}
        <div className="flex-1 p-8">
          {sortedClips.length === 0 ? (
            <div className="h-full min-h-[440px] flex flex-col items-center justify-center text-center select-none">
              {clips.length === 0 ? (
                <div className="max-w-md flex flex-col items-center">
                  <SleepingCat size={220} />
                  <h3 className="mt-6 text-lg font-bold text-[#7047D7] dark:text-[#B69AFF]">
                    Zzz... CopyCat is snoozing peacefully
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    No clips saved in your vault yet. Whenever you copy text in any tab or press <kbd className="font-mono px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700">Ctrl+V</kbd>, CopyCat will catch it!
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <button
                      onClick={onPasteClipboard}
                      className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#7047D7] hover:bg-[#5D37BD] text-white shadow-md shadow-[#7047D7]/20 flex items-center gap-2"
                    >
                      <ClipboardPaste className="w-4 h-4" />
                      Paste from System Clipboard
                    </button>
                    <button
                      onClick={onOpenAddModal}
                      className="px-5 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Clip Manually
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-16">
                  <span className="text-4xl block mb-3">🔍</span>
                  <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    No clips match your search criteria
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Try searching for different keywords or reset your filters.
                  </p>
                  <button
                    onClick={() =>
                      onFilterChange({
                        searchQuery: '',
                        category: 'all',
                        filterType: 'all',
                        collectionId: 'all',
                      })
                    }
                    className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {sortedClips.map((clip, index) => (
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
                  compact={false}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
