import { ClipItem, Collection, UserSettings, ClipboardExportData } from '../types/clipboard';

// Chrome extension global type definition
declare const chrome: any;

const DB_NAME = 'CopyCatClipboardDB';
const DB_VERSION = 1;
const STORE_CLIPS = 'clips';
const STORE_COLLECTIONS = 'collections';
const STORE_SETTINGS = 'settings';

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  duplicateHandling: 'moveToTop',
  autoDetectCategory: true,
  maxClips: 500,
  soundEffects: true,
  maskSensitive: true,
  showPawParticles: true,
  viewMode: 'full',
};

// Open IndexedDB instance
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Clips store
      if (!db.objectStoreNames.contains(STORE_CLIPS)) {
        const clipStore = db.createObjectStore(STORE_CLIPS, { keyPath: 'id' });
        clipStore.createIndex('createdAt', 'createdAt', { unique: false });
        clipStore.createIndex('pinned', 'pinned', { unique: false });
        clipStore.createIndex('favorite', 'favorite', { unique: false });
        clipStore.createIndex('category', 'category', { unique: false });
        clipStore.createIndex('collectionId', 'collectionId', { unique: false });
      }

      // Collections store
      if (!db.objectStoreNames.contains(STORE_COLLECTIONS)) {
        db.createObjectStore(STORE_COLLECTIONS, { keyPath: 'id' });
      }

      // Settings store
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Check Chrome Storage API if running in actual extension context
function hasChromeStorage(): boolean {
  return typeof chrome !== 'undefined' && !!chrome?.storage?.local;
}

// ---------------- Clips CRUD ---------------- //

export async function getAllClips(): Promise<ClipItem[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CLIPS, 'readonly');
      const store = tx.objectStore(STORE_CLIPS);
      const request = store.getAll();

      request.onsuccess = () => {
        const clips = (request.result as ClipItem[]) || [];
        // Sort newest first by default
        clips.sort((a, b) => b.createdAt - a.createdAt);
        resolve(clips);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('IndexedDB fallback to localStorage for getAllClips:', error);
    const raw = localStorage.getItem('copycat_clips');
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}

export async function saveClip(clip: ClipItem): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_CLIPS, 'readwrite');
      const store = tx.objectStore(STORE_CLIPS);
      store.put(clip);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn('IndexedDB save failed, using localStorage:', error);
    const raw = localStorage.getItem('copycat_clips');
    const clips: ClipItem[] = raw ? JSON.parse(raw) : [];
    const index = clips.findIndex((c) => c.id === clip.id);
    if (index >= 0) {
      clips[index] = clip;
    } else {
      clips.unshift(clip);
    }
    localStorage.setItem('copycat_clips', JSON.stringify(clips));
  }

  // Sync to chrome storage if available
  if (hasChromeStorage()) {
    try {
      chrome.storage.local.set({ [`clip_${clip.id}`]: clip });
    } catch (e) {
      console.warn('Chrome storage sync failed', e);
    }
  }
}

export async function deleteClip(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_CLIPS, 'readwrite');
      const store = tx.objectStore(STORE_CLIPS);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn('IndexedDB delete failed, using localStorage:', error);
    const raw = localStorage.getItem('copycat_clips');
    if (raw) {
      const clips: ClipItem[] = JSON.parse(raw);
      const filtered = clips.filter((c) => c.id !== id);
      localStorage.setItem('copycat_clips', JSON.stringify(filtered));
    }
  }

  if (hasChromeStorage()) {
    try {
      chrome.storage.local.remove(`clip_${id}`);
    } catch (e) {
      console.warn('Chrome storage remove failed', e);
    }
  }
}

export async function clearAllClips(): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_CLIPS, 'readwrite');
      const store = tx.objectStore(STORE_CLIPS);
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn('IndexedDB clear failed:', error);
  }
  localStorage.removeItem('copycat_clips');
}

// ---------------- Collections CRUD ---------------- //

export async function getAllCollections(): Promise<Collection[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_COLLECTIONS, 'readonly');
      const store = tx.objectStore(STORE_COLLECTIONS);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('IndexedDB collections fallback:', error);
    const raw = localStorage.getItem('copycat_collections');
    return raw ? JSON.parse(raw) : [];
  }
}

export async function saveCollection(collection: Collection): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_COLLECTIONS, 'readwrite');
      const store = tx.objectStore(STORE_COLLECTIONS);
      store.put(collection);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn('IndexedDB collection save failed:', error);
    const raw = localStorage.getItem('copycat_collections');
    const cols: Collection[] = raw ? JSON.parse(raw) : [];
    const index = cols.findIndex((c) => c.id === collection.id);
    if (index >= 0) cols[index] = collection;
    else cols.push(collection);
    localStorage.setItem('copycat_collections', JSON.stringify(cols));
  }
}

export async function deleteCollection(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_COLLECTIONS, 'readwrite');
      const store = tx.objectStore(STORE_COLLECTIONS);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn('IndexedDB collection delete failed:', error);
    const raw = localStorage.getItem('copycat_collections');
    if (raw) {
      const cols: Collection[] = JSON.parse(raw);
      localStorage.setItem('copycat_collections', JSON.stringify(cols.filter((c) => c.id !== id)));
    }
  }
}

// ---------------- Settings CRUD ---------------- //

export async function getUserSettings(): Promise<UserSettings> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_SETTINGS, 'readonly');
      const store = tx.objectStore(STORE_SETTINGS);
      const request = store.get('user_preferences');
      request.onsuccess = () => {
        if (request.result?.value) {
          resolve({ ...DEFAULT_SETTINGS, ...request.result.value });
        } else {
          // Check localStorage
          const local = localStorage.getItem('copycat_settings');
          resolve(local ? { ...DEFAULT_SETTINGS, ...JSON.parse(local) } : DEFAULT_SETTINGS);
        }
      };
      request.onerror = () => {
        const local = localStorage.getItem('copycat_settings');
        resolve(local ? { ...DEFAULT_SETTINGS, ...JSON.parse(local) } : DEFAULT_SETTINGS);
      };
    });
  } catch {
    const local = localStorage.getItem('copycat_settings');
    return local ? { ...DEFAULT_SETTINGS, ...JSON.parse(local) } : DEFAULT_SETTINGS;
  }
}

export async function saveUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  const current = await getUserSettings();
  const updated = { ...current, ...settings };

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_SETTINGS, 'readwrite');
      const store = tx.objectStore(STORE_SETTINGS);
      store.put({ key: 'user_preferences', value: updated });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('Could not save to IndexedDB settings', e);
  }

  localStorage.setItem('copycat_settings', JSON.stringify(updated));
  return updated;
}

// ---------------- Import & Export ---------------- //

export async function exportAllData(): Promise<ClipboardExportData> {
  const clips = await getAllClips();
  const collections = await getAllCollections();
  const settings = await getUserSettings();

  return {
    version: '1.0.0',
    exportedAt: Date.now(),
    appName: 'CopyCat Clipboard Manager',
    clips,
    collections,
    settings,
  };
}

export async function importData(
  data: ClipboardExportData,
  mode: 'merge' | 'replace'
): Promise<{ clipsImported: number; collectionsImported: number }> {
  if (mode === 'replace') {
    await clearAllClips();
  }

  let clipsImported = 0;
  let collectionsImported = 0;

  if (Array.isArray(data.collections)) {
    for (const col of data.collections) {
      if (col.id && col.name) {
        await saveCollection(col);
        collectionsImported++;
      }
    }
  }

  if (Array.isArray(data.clips)) {
    for (const clip of data.clips) {
      if (clip.id && typeof clip.content === 'string') {
        await saveClip(clip);
        clipsImported++;
      }
    }
  }

  if (data.settings) {
    await saveUserSettings(data.settings);
  }

  return { clipsImported, collectionsImported };
}
