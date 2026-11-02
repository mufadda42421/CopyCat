export type ClipCategory = 'text' | 'link' | 'code' | 'email' | 'color';

export interface ClipItem {
  id: string;
  content: string;
  category: ClipCategory;
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
  favorite: boolean;
  collectionId: string | null;
  tags: string[];
  charCount: number;
  wordCount: number;
  lineCount: number;
  copyCount: number;
  isSensitive: boolean;
  title?: string;
  sourceUrl?: string;
}

export interface Collection {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: number;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  duplicateHandling: 'moveToTop' | 'ignore' | 'allow';
  autoDetectCategory: boolean;
  maxClips: number;
  soundEffects: boolean;
  maskSensitive: boolean;
  showPawParticles: boolean;
  viewMode: 'full' | 'popup';
}

export interface FilterState {
  searchQuery: string;
  category: ClipCategory | 'all';
  filterType: 'all' | 'pinned' | 'favorites';
  collectionId: string | 'all';
  sortBy: 'newest' | 'oldest' | 'mostCopied' | 'alphabetical';
}

export interface ClipboardExportData {
  version: string;
  exportedAt: number;
  appName: string;
  clips: ClipItem[];
  collections: Collection[];
  settings: Partial<UserSettings>;
}
