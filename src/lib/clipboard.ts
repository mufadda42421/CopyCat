import { ClipCategory, ClipItem } from '../types/clipboard';

// Heuristic to classify clipboard content
export function detectCategory(text: string): ClipCategory {
  const trimmed = text.trim();

  // URL / Link
  const urlPattern = /^(https?:\/\/|www\.)[^\s/$.?#].[^\s]*$/i;
  if (urlPattern.test(trimmed)) {
    return 'link';
  }

  // Email
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (emailPattern.test(trimmed)) {
    return 'email';
  }

  // Color hex / rgb / hsl
  const hexPattern = /^#(?:[0-9a-fA-F]{3}){1,2}$|^#(?:[0-9a-fA-F]{4}){1,2}$/;
  const rgbPattern = /^rgb(a)?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(\s*,\s*[\d.]+\s*)?\)$/i;
  const hslPattern = /^hsl(a)?\(\s*\d+\s*,\s*[\d.]+%?\s*,\s*[\d.]+%?(\s*,\s*[\d.]+\s*)?\)$/i;
  if (hexPattern.test(trimmed) || rgbPattern.test(trimmed) || hslPattern.test(trimmed)) {
    return 'color';
  }

  // Code heuristics
  const codeIndicators = [
    /<[a-z][\s\S]*>/i, // HTML/XML tags
    /\b(function|const|let|var|class|interface|type|import|export|from|return|def|fn|pub|impl)\b/,
    /[{}\[\];]\s*$/, // Trailing syntax tokens
    /=>\s*[{(\[]/, // Arrow function
    /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|JOIN)\b/i, // SQL
    /console\.(log|warn|error)/,
    /public\s+static\s+void\s+main/,
    /def\s+\w+\s*\(.*?\):/,
  ];

  const lines = trimmed.split('\n');
  if (lines.length > 2 && lines.some((line) => line.startsWith('  ') || line.startsWith('\t'))) {
    return 'code';
  }

  for (const indicator of codeIndicators) {
    if (indicator.test(trimmed)) {
      return 'code';
    }
  }

  return 'text';
}

// Detect sensitive information (passwords, tokens, keys)
export function detectSensitive(text: string): boolean {
  const patterns = [
    /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/, // JWT
    /\b(sk_live|sk_test|pk_live|pk_test)_[0-9a-zA-Z]{24,}\b/, // Stripe keys
    /\bAIza[0-9A-Za-z-_]{35}\b/, // Google API key
    /\bgh[pousr]_[a-zA-Z0-9]{36,255}\b/, // GitHub token
    /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\b/, // Credit cards
    /\b(password|passwd|pwd|secret|api_key|apikey|bearer)\s*[:=]\s*[^\s]+/i,
  ];

  return patterns.some((p) => p.test(text));
}

// Mask sensitive string
export function maskContent(text: string): string {
  if (text.length <= 8) {
    return '••••••••';
  }
  const prefix = text.slice(0, 4);
  const suffix = text.slice(-4);
  return `${prefix}${'•'.repeat(Math.min(16, text.length - 8))}${suffix}`;
}

// Helper to generate a clean preview title for a clip
export function generateTitle(text: string, category: ClipCategory): string {
  const firstLine = text.trim().split('\n')[0] || '';
  if (category === 'link') {
    try {
      const url = new URL(text.trim());
      return url.hostname + (url.pathname !== '/' ? url.pathname : '');
    } catch {
      return firstLine.slice(0, 40);
    }
  }
  return firstLine.slice(0, 50) || 'Empty Clip';
}

// Create ClipItem instance
export function createClipItem(
  content: string,
  options?: {
    category?: ClipCategory;
    collectionId?: string | null;
    tags?: string[];
    title?: string;
  }
): ClipItem {
  const detectedCategory = options?.category || detectCategory(content);
  const words = content.trim().split(/\s+/).filter(Boolean);
  const lines = content.split('\n');

  return {
    id: `clip_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    content,
    category: detectedCategory,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    pinned: false,
    favorite: false,
    collectionId: options?.collectionId || null,
    tags: options?.tags || [],
    charCount: content.length,
    wordCount: words.length,
    lineCount: lines.length,
    copyCount: 0,
    isSensitive: detectSensitive(content),
    title: options?.title || generateTitle(content, detectedCategory),
  };
}

// Clipboard Web API wrapper with comprehensive error handling
export async function readSystemClipboard(): Promise<{
  success: boolean;
  content?: string;
  error?: string;
  permissionDenied?: boolean;
}> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    return {
      success: false,
      error: 'Clipboard API is not supported in this browser environment.',
    };
  }

  try {
    const text = await navigator.clipboard.readText();
    return {
      success: true,
      content: text,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const isPermission =
      errorMsg.includes('permission') ||
      errorMsg.includes('NotAllowedError') ||
      errorMsg.includes('focus') ||
      errorMsg.includes('gesture');

    return {
      success: false,
      error: isPermission
        ? 'Clipboard access requires active window focus and user gesture.'
        : errorMsg,
      permissionDenied: isPermission,
    };
  }
}

export async function writeSystemClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard.writeText failed, falling back:', err);
    }
  }

  // Fallback using textarea execCommand
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback clipboard copy failed:', err);
    return false;
  }
}
