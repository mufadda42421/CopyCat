import React, { useState } from 'react';
import { ClipItem, Collection } from '../../types/clipboard';
import { PawIcon } from '../mascot/PawIcon';
import { maskContent } from '../../lib/clipboard';
import {
  Pin,
  Heart,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Mail,
  Palette,
  FileText,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Folder,
} from 'lucide-react';

interface ClipCardProps {
  clip: ClipItem;
  shortcutIndex?: number;
  collections: Collection[];
  onCopy: (clip: ClipItem, event?: React.MouseEvent) => void;
  onTogglePin: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onAssignCollection: (clipId: string, collectionId: string | null) => void;
  compact?: boolean;
}

export const ClipCard: React.FC<ClipCardProps> = ({
  clip,
  shortcutIndex,
  collections,
  onCopy,
  onTogglePin,
  onToggleFavorite,
  onDelete,
  onAssignCollection,
  compact = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);
  const [showCollectionMenu, setShowCollectionMenu] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy(clip, e);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const currentCollection = collections.find((c) => c.id === clip.collectionId);

  // Format relative time
  const formatTime = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  // Category Icon
  const getCategoryIcon = () => {
    switch (clip.category) {
      case 'link':
        return <ExternalLink className="w-3.5 h-3.5 text-blue-500" />;
      case 'code':
        return <Code2 className="w-3.5 h-3.5 text-[#7047D7] dark:text-[#B69AFF]" />;
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-emerald-500" />;
      case 'color':
        return <Palette className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  // Format content for display
  const displayContent = clip.isSensitive && !showSensitive
    ? maskContent(clip.content)
    : clip.content;

  const isColor = clip.category === 'color';
  const isLink = clip.category === 'link';
  const isMultiLine = clip.lineCount > 2 || clip.charCount > 180;

  return (
    <div
      className={`group relative transition-all duration-200 rounded-2xl border ${
        clip.pinned
          ? 'bg-[#FFF8EE] dark:bg-[#201C38] border-[#B69AFF] shadow-sm'
          : 'bg-white dark:bg-[#24203D] border-[#E8E1F5] dark:border-[#383256] hover:border-[#B69AFF]/70 hover:shadow-md'
      } ${compact ? 'p-3' : 'p-4'}`}
    >
      {/* Top row: Category, unboxed metadata, and actions */}
      <div className="flex items-center justify-between gap-2 mb-2 text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 min-w-0">
          <div className="flex items-center gap-1.5 font-medium capitalize text-slate-700 dark:text-slate-200">
            {getCategoryIcon()}
            <span>{clip.category}</span>
          </div>

          <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
          <span>{clip.charCount} chars</span>

          {!compact && (
            <>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
              <span>{clip.wordCount} words</span>
            </>
          )}

          <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
          <span className="tabular-nums">{formatTime(clip.createdAt)}</span>

          {clip.copyCount > 0 && (
            <>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
              <span className="text-[#7047D7] dark:text-[#B69AFF] font-medium">
                Copied {clip.copyCount}x
              </span>
            </>
          )}
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {shortcutIndex !== undefined && shortcutIndex <= 9 && (
            <span
              title={`Press ${shortcutIndex} to quick-copy`}
              className="hidden group-hover:inline-block font-mono text-[10px] text-slate-400 dark:text-slate-500 px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800"
            >
              [{shortcutIndex}]
            </span>
          )}

          {/* Collection tag/assigner */}
          <div className="relative">
            <button
              onClick={() => setShowCollectionMenu(!showCollectionMenu)}
              title={currentCollection ? `Collection: ${currentCollection.name}` : 'Assign to collection'}
              className={`p-1.5 rounded-lg transition-colors text-xs flex items-center gap-1 ${
                currentCollection
                  ? 'text-[#7047D7] dark:text-[#B69AFF] bg-[#FFD9E4]/40 dark:bg-[#7047D7]/30'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              {currentCollection && (
                <span className="max-w-[70px] truncate text-[11px] font-medium">
                  {currentCollection.name}
                </span>
              )}
            </button>

            {showCollectionMenu && (
              <div className="absolute right-0 top-8 z-20 w-44 p-1.5 bg-white dark:bg-[#1E1B33] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Assign Collection
                </div>
                <button
                  onClick={() => {
                    onAssignCollection(clip.id, null);
                    setShowCollectionMenu(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-2 ${
                    !clip.collectionId
                      ? 'bg-[#B69AFF]/20 text-[#7047D7] dark:text-[#B69AFF] font-medium'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                  No Collection
                </button>
                {collections.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => {
                      onAssignCollection(clip.id, col.id);
                      setShowCollectionMenu(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-2 ${
                      clip.collectionId === col.id
                        ? 'bg-[#B69AFF]/20 text-[#7047D7] dark:text-[#B69AFF] font-medium'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: col.color || '#7047D7' }}
                    />
                    <span className="truncate">{col.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pin */}
          <button
            onClick={() => onTogglePin(clip.id)}
            title={clip.pinned ? 'Unpin clip' : 'Pin clip to top'}
            className={`p-1.5 rounded-lg transition-colors ${
              clip.pinned
                ? 'text-[#7047D7] dark:text-[#B69AFF] bg-[#B69AFF]/20'
                : 'text-slate-400 hover:text-[#7047D7] dark:hover:text-[#B69AFF] hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Pin className={`w-3.5 h-3.5 ${clip.pinned ? 'fill-current' : ''}`} />
          </button>

          {/* Favorite */}
          <button
            onClick={() => onToggleFavorite(clip.id)}
            title={clip.favorite ? 'Remove favorite' : 'Add to favorites'}
            className={`p-1.5 rounded-lg transition-colors ${
              clip.favorite
                ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${clip.favorite ? 'fill-current' : ''}`} />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(clip.id)}
            title="Delete clip"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content Preview Block */}
      <div className="relative">
        {/* Color preview chip if it's a color */}
        {isColor && (
          <div className="flex items-center gap-3 my-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div
              className="w-8 h-8 rounded-lg shadow-inner border border-black/10 shrink-0"
              style={{ backgroundColor: clip.content.trim() }}
            />
            <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white">
              {clip.content.trim()}
            </span>
          </div>
        )}

        {/* Text / Code container */}
        <div
          onClick={handleCopy}
          className={`cursor-pointer group/content relative p-3 rounded-xl transition-colors ${
            clip.category === 'code'
              ? 'bg-[#1E1B33] text-[#F3EDFD] font-mono text-xs'
              : 'bg-slate-50 dark:bg-[#1E1B33]/80 text-[#24203D] dark:text-[#E8E1F5] text-sm leading-relaxed'
          } hover:ring-2 hover:ring-[#B69AFF]/50`}
        >
          <pre
            className={`whitespace-pre-wrap break-words font-inherit ${
              !expanded && isMultiLine ? 'line-clamp-3 max-h-24 overflow-hidden' : ''
            }`}
          >
            {displayContent}
          </pre>

          {/* Sensitive content toggle notice */}
          {clip.isSensitive && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setShowSensitive(!showSensitive);
              }}
              className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
            >
              {showSensitive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {showSensitive ? 'Hide sensitive content' : 'Show hidden sensitive content'}
            </div>
          )}

          {/* Copy overlay hint */}
          <div className="absolute right-2.5 bottom-2.5 opacity-0 group-hover/content:opacity-100 transition-opacity">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#7047D7] text-white flex items-center gap-1 shadow-sm">
              <Copy className="w-2.5 h-2.5" />
              Click to Copy
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="mt-2.5 pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          {isMultiLine && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[11px] font-medium text-[#7047D7] dark:text-[#B69AFF] hover:underline flex items-center gap-1"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3 h-3" /> Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" /> Show all {clip.lineCount} lines
                </>
              )}
            </button>
          )}

          {isLink && (
            <a
              href={clip.content.trim().startsWith('http') ? clip.content.trim() : `https://${clip.content.trim()}`}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" /> Visit link
            </a>
          )}
        </div>

        {/* Primary Action Button: Copy */}
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all shadow-sm ${
            copied
              ? 'bg-emerald-500 text-white shadow-emerald-500/20'
              : 'bg-[#7047D7] hover:bg-[#5D37BD] text-white shadow-[#7047D7]/20 active:scale-95'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied! 🐾</span>
            </>
          ) : (
            <>
              <PawIcon size={14} fill="currentColor" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
