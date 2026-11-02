/**
 * CopyCat – Copy less. Do more. Meow!
 * Cute, premium, cat-themed clipboard manager for Google Chrome.
 * Manifest V3, IndexedDB, local-first privacy.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ClipCategory,
  ClipItem,
  Collection,
  FilterState,
  UserSettings,
} from './types/clipboard';
import {
  getAllClips,
  saveClip,
  deleteClip,
  clearAllClips,
  getAllCollections,
  saveCollection,
  deleteCollection,
  getUserSettings,
  saveUserSettings,
  DEFAULT_SETTINGS,
} from './lib/storage';
import {
  createClipItem,
  readSystemClipboard,
  writeSystemClipboard,
} from './lib/clipboard';
import { playMeowChime, playPawTap } from './lib/sound';
import { triggerExtensionDownload } from './lib/extensionPackager';
import { WebsiteView } from './components/website/WebsiteView';
import { PopupView } from './components/popup/PopupView';
import { DashboardView } from './components/dashboard/DashboardView';
import { AddClipModal } from './components/common/AddClipModal';
import { ExportImportModal } from './components/common/ExportImportModal';
import { ExtensionPackageModal } from './components/common/ExtensionPackageModal';
import { PermissionsModal } from './components/common/PermissionsModal';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { PawParticles } from './components/mascot/PawParticles';
import { PawIcon } from './components/mascot/PawIcon';
import {
  Globe,
  LayoutDashboard,
  Laptop,
  Download,
  Moon,
  Sun,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export default function App() {
  const [clips, setClips] = useState<ClipItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // View state: 'website' (Landing & Download portal), 'dashboard' (full manager), or 'popup' (authentic Chrome popup frame)
  const [viewMode, setViewMode] = useState<'website' | 'dashboard' | 'popup'>('website');

  // Filter & Search
  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    category: 'all',
    filterType: 'all',
    collectionId: 'all',
    sortBy: 'newest',
  });

  // Mascot & Particle effects
  const [pawTrigger, setPawTrigger] = useState(0);
  const [pawOrigin, setPawOrigin] = useState<{ x: number; y: number } | undefined>();
  const [lastCopiedTime, setLastCopiedTime] = useState(0);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const deletedClipBackupRef = useRef<ClipItem | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);
  const [isExtensionPackageOpen, setIsExtensionPackageOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);

  // Dark Theme
  const [darkMode, setDarkMode] = useState(false);

  // Toast helper
  const showToast = useCallback(
    (
      text: string,
      type: ToastMessage['type'] = 'success',
      paw = true,
      onUndo?: () => void
    ) => {
      const id = `toast_${Date.now()}_${Math.random()}`;
      setToasts((prev) => [...prev, { id, text, type, paw, onUndo }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load initial data from IndexedDB
  const reloadData = useCallback(async () => {
    try {
      const [savedClips, savedCollections, savedSettings] = await Promise.all([
        getAllClips(),
        getAllCollections(),
        getUserSettings(),
      ]);
      setClips(savedClips);
      setCollections(savedCollections);
      setSettings(savedSettings);
      if (savedSettings.theme === 'dark') {
        setDarkMode(true);
      }
    } catch (err) {
      console.error('Failed to load initial storage:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // Sync dark class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    saveUserSettings({ theme: next ? 'dark' : 'light' });
  };

  // Update filter
  const handleFilterChange = (newFilter: Partial<FilterState>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
  };

  // Direct download trigger from anywhere
  const handleDirectDownload = async () => {
    try {
      await triggerExtensionDownload();
      showToast('Downloaded copycat-chrome-extension-v3.zip! 🐾', 'success', true);
    } catch (err) {
      console.error('Download error:', err);
      showToast('Failed to download extension package.', 'error');
    }
  };

  // Save new clip with duplicate handling
  const handleSaveNewClip = async (
    content: string,
    options?: {
      category?: ClipCategory;
      collectionId?: string | null;
      tags?: string[];
      title?: string;
    }
  ) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    // Duplicate detection
    const existingIndex = clips.findIndex((c) => c.content.trim() === trimmed);
    if (existingIndex >= 0) {
      const existing = clips[existingIndex];
      if (settings.duplicateHandling === 'ignore') {
        showToast('Item already exists in CopyCat vault! 🐾', 'info', true);
        return;
      }
      if (settings.duplicateHandling === 'moveToTop') {
        const updated = { ...existing, updatedAt: Date.now(), createdAt: Date.now() };
        await saveClip(updated);
        setClips((prev) => [updated, ...prev.filter((c) => c.id !== existing.id)]);
        showToast('Duplicate caught & moved to top! 🐾', 'success', true);
        playPawTap(settings.soundEffects);
        return;
      }
    }

    const newClip = createClipItem(content, options);
    await saveClip(newClip);
    setClips((prev) => [newClip, ...prev]);
    showToast('Pawsome! Added to CopyCat vault! ✨', 'success', true);
    playMeowChime(settings.soundEffects);

    if (settings.showPawParticles) {
      setPawTrigger((k) => k + 1);
    }
  };

  // Copy clip back to system clipboard
  const handleCopyClip = async (clip: ClipItem, event?: React.MouseEvent) => {
    if (event) {
      setPawOrigin({ x: event.clientX, y: event.clientY });
    } else {
      setPawOrigin(undefined);
    }

    const success = await writeSystemClipboard(clip.content);
    if (success) {
      playMeowChime(settings.soundEffects);
      setLastCopiedTime(Date.now());
      if (settings.showPawParticles) {
        setPawTrigger((k) => k + 1);
      }

      // Increment copy count
      const updated = {
        ...clip,
        copyCount: (clip.copyCount || 0) + 1,
        updatedAt: Date.now(),
      };
      await saveClip(updated);
      setClips((prev) => prev.map((c) => (c.id === clip.id ? updated : c)));

      showToast('Copied to your paws! 🐾', 'success', true);
    } else {
      showToast('Could not copy to clipboard. Check permissions.', 'error', false);
    }
  };

  // Toggle Pin
  const handleTogglePin = async (id: string) => {
    const target = clips.find((c) => c.id === id);
    if (!target) return;
    const updated = { ...target, pinned: !target.pinned, updatedAt: Date.now() };
    await saveClip(updated);
    setClips((prev) => prev.map((c) => (c.id === id ? updated : c)));
    playPawTap(settings.soundEffects);
    showToast(
      updated.pinned ? 'Clip pinned to the top! 📌' : 'Clip unpinned',
      'info',
      true
    );
  };

  // Toggle Favorite
  const handleToggleFavorite = async (id: string) => {
    const target = clips.find((c) => c.id === id);
    if (!target) return;
    const updated = { ...target, favorite: !target.favorite, updatedAt: Date.now() };
    await saveClip(updated);
    setClips((prev) => prev.map((c) => (c.id === id ? updated : c)));
    playPawTap(settings.soundEffects);
    showToast(
      updated.favorite ? 'Added to favorites! ❤️' : 'Removed from favorites',
      'info',
      true
    );
  };

  // Delete clip with undo option
  const handleDeleteClip = async (id: string) => {
    const target = clips.find((c) => c.id === id);
    if (!target) return;

    deletedClipBackupRef.current = target;
    await deleteClip(id);
    setClips((prev) => prev.filter((c) => c.id !== id));

    showToast('Deleted item from vault', 'info', false, async () => {
      if (deletedClipBackupRef.current) {
        await saveClip(deletedClipBackupRef.current);
        setClips((prev) => [deletedClipBackupRef.current!, ...prev]);
        showToast('Restored clip! 🐾', 'success', true);
        deletedClipBackupRef.current = null;
      }
    });
  };

  // Clear all clips
  const handleClearAll = async (unpinnedOnly = false) => {
    if (unpinnedOnly) {
      const pinned = clips.filter((c) => c.pinned);
      const unpinned = clips.filter((c) => !c.pinned);
      for (const item of unpinned) {
        await deleteClip(item.id);
      }
      setClips(pinned);
      showToast(`Cleared ${unpinned.length} unpinned clips. Pinned items kept!`, 'info', true);
    } else {
      await clearAllClips();
      setClips([]);
      showToast('Cleared all clipboard history.', 'info', true);
    }
  };

  // Assign collection
  const handleAssignCollection = async (clipId: string, colId: string | null) => {
    const target = clips.find((c) => c.id === clipId);
    if (!target) return;
    const updated = { ...target, collectionId: colId, updatedAt: Date.now() };
    await saveClip(updated);
    setClips((prev) => prev.map((c) => (c.id === clipId ? updated : c)));
    showToast('Collection updated! 🐾', 'success', true);
  };

  // Create Collection
  const handleCreateCollection = async (name: string, color: string) => {
    const newCol: Collection = {
      id: `col_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name,
      color,
      icon: 'folder',
      createdAt: Date.now(),
    };
    await saveCollection(newCol);
    setCollections((prev) => [...prev, newCol]);
    showToast(`Created collection "${name}"! 🐾`, 'success', true);
  };

  // Delete Collection
  const handleDeleteCollection = async (id: string) => {
    await deleteCollection(id);
    setCollections((prev) => prev.filter((c) => c.id !== id));
    setClips((prev) =>
      prev.map((c) => (c.collectionId === id ? { ...c, collectionId: null } : c))
    );
    showToast('Collection removed', 'info');
  };

  // Paste from system clipboard helper
  const handlePasteFromClipboard = async () => {
    const res = await readSystemClipboard();
    if (res.success && res.content) {
      await handleSaveNewClip(res.content);
    } else {
      showToast(
        res.error || 'Please click on the page or press Ctrl+V to paste.',
        'warning',
        false
      );
    }
  };

  // Update Settings
  const handleUpdateSettings = async (partial: Partial<UserSettings>) => {
    const updated = await saveUserSettings(partial);
    setSettings(updated);
    showToast('Settings saved!', 'success');
  };

  // Global listeners for Paste & Keyboard Shortcuts
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')
      ) {
        return;
      }

      const text = e.clipboardData?.getData('text/plain');
      if (text) {
        handleSaveNewClip(text);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInput =
        activeElement &&
        (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');

      // Key '/' to focus search
      if (e.key === '/' && !isInput) {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[placeholder*="Search"]'
        );
        searchInput?.focus();
        return;
      }

      // Key 1-9 to quick-copy top items
      if (!isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 1 && num <= 9) {
          const targetClip = clips[num - 1];
          if (targetClip) {
            e.preventDefault();
            handleCopyClip(targetClip);
          }
        }
      }

      // 'd' key to toggle theme
      if (!isInput && e.key === 'd' && !e.ctrlKey && !e.metaKey) {
        toggleDarkMode();
      }
    };

    window.addEventListener('paste', handlePaste);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [clips, settings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8EE] dark:bg-[#1A172A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#7047D7] text-white flex items-center justify-center animate-bounce">
            <PawIcon size={24} fill="currentColor" />
          </div>
          <span className="text-xs font-bold text-[#7047D7] dark:text-[#B69AFF]">
            Waking up CopyCat...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8EE] dark:bg-[#1A172A] text-[#24203D] dark:text-[#F3EDFD] selection:bg-[#B69AFF]/40">
      {/* Top Experience Switcher Navigation */}
      <nav className="h-12 px-6 bg-[#24203D] text-[#FFF8EE] flex items-center justify-between text-xs shrink-0 select-none border-b border-[#B69AFF]/20 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="font-extrabold tracking-wide text-[#B69AFF] flex items-center gap-1.5 cursor-pointer" onClick={() => setViewMode('website')}>
            <PawIcon size={16} fill="currentColor" />
            COPYCAT
          </span>
          <span className="text-white/30 hidden sm:inline">|</span>
          <span className="text-white/60 hidden sm:inline text-[11px]">
            Chrome Extension (Manifest V3)
          </span>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-xl">
            <button
              onClick={() => setViewMode('website')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                viewMode === 'website'
                  ? 'bg-[#7047D7] text-white shadow-xs'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Official Website</span>
            </button>
            <button
              onClick={() => setViewMode('dashboard')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                viewMode === 'dashboard'
                  ? 'bg-[#7047D7] text-white shadow-xs'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>App Dashboard</span>
            </button>
            <button
              onClick={() => setViewMode('popup')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                viewMode === 'popup'
                  ? 'bg-[#7047D7] text-white shadow-xs'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Popup Simulator</span>
            </button>
          </div>

          <button
            onClick={handleDirectDownload}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#B69AFF] hover:bg-white text-[#24203D] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .ZIP</span>
          </button>

          <button
            onClick={toggleDarkMode}
            title="Toggle theme"
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Main View Container */}
      <div className="flex-1 flex flex-col min-h-0">
        {viewMode === 'website' && (
          <WebsiteView
            onOpenDashboard={() => setViewMode('dashboard')}
            onOpenPopupSimulator={() => setViewMode('popup')}
            onShowToast={showToast}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
          />
        )}

        {viewMode === 'dashboard' && (
          <DashboardView
            clips={clips}
            collections={collections}
            filter={filter}
            onFilterChange={handleFilterChange}
            onCopy={handleCopyClip}
            onTogglePin={handleTogglePin}
            onToggleFavorite={handleToggleFavorite}
            onDelete={handleDeleteClip}
            onAssignCollection={handleAssignCollection}
            onCreateCollection={handleCreateCollection}
            onDeleteCollection={handleDeleteCollection}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenExportImport={() => setIsExportImportOpen(true)}
            onOpenExtensionPackage={() => setIsExtensionPackageOpen(true)}
            onOpenPermissions={() => setIsPermissionsOpen(true)}
            onPasteClipboard={handlePasteFromClipboard}
            lastCopiedTime={lastCopiedTime}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
            onSwitchToPopupView={() => setViewMode('popup')}
          />
        )}

        {viewMode === 'popup' && (
          /* Simulated Google Chrome Extension Frame */
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#EFE8F9] to-[#FFF8EE] dark:from-[#151224] dark:to-[#1A172A]">
            <div className="mb-4 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7047D7] dark:text-[#B69AFF]">
                Chrome Extension Popup Simulator
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pixel-accurate 380×580px Google Chrome Manifest V3 popup
              </p>
            </div>

            {/* Browser Window Mockup Frame */}
            <div className="rounded-3xl shadow-2xl border-4 border-slate-800/10 dark:border-white/10 overflow-hidden bg-white dark:bg-[#1E1B33]">
              {/* Chrome Mockup Browser Tab Bar */}
              <div className="px-4 py-2 bg-slate-200 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 flex items-center justify-between text-xs select-none">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500 dark:text-slate-400 px-3 py-0.5 rounded-md bg-white/70 dark:bg-black/30">
                  <PawIcon size={11} fill="#7047D7" />
                  <span>chrome-extension://copycat/popup.html</span>
                </div>
                <div className="w-8" />
              </div>

              {/* The Actual Popup */}
              <PopupView
                clips={clips}
                collections={collections}
                filter={filter}
                onFilterChange={handleFilterChange}
                onCopy={handleCopyClip}
                onTogglePin={handleTogglePin}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDeleteClip}
                onAssignCollection={handleAssignCollection}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                onOpenDashboard={() => setViewMode('dashboard')}
                onPasteClipboard={handlePasteFromClipboard}
                lastCopiedTime={lastCopiedTime}
                darkMode={darkMode}
                onToggleDarkMode={toggleDarkMode}
              />
            </div>

            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
              <span>Press <kbd className="font-mono px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded">Ctrl+V</kbd> to paste</span>
              <span>·</span>
              <button
                onClick={() => setViewMode('dashboard')}
                className="font-bold text-[#7047D7] dark:text-[#B69AFF] hover:underline"
              >
                Switch to Full Dashboard ↗
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Paw Particles */}
      {settings.showPawParticles && (
        <PawParticles
          triggerKey={pawTrigger}
          originX={pawOrigin?.x}
          originY={pawOrigin?.y}
        />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Modals */}
      <AddClipModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveNewClip}
        collections={collections}
        onShowPermissionError={(msg) => showToast(msg, 'warning', false)}
      />

      <ExportImportModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
        clips={clips}
        collections={collections}
        onRefreshData={reloadData}
        onShowToast={showToast}
        onClearAll={handleClearAll}
      />

      <ExtensionPackageModal
        isOpen={isExtensionPackageOpen}
        onClose={() => setIsExtensionPackageOpen(false)}
        onShowToast={showToast}
      />

      <PermissionsModal
        isOpen={isPermissionsOpen}
        onClose={() => setIsPermissionsOpen(false)}
      />
    </div>
  );
}
