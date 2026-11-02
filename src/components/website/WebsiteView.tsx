import React, { useState } from 'react';
import { PawIcon } from '../mascot/PawIcon';
import { SleepingCat } from '../mascot/SleepingCat';
import { HappyCat } from '../mascot/HappyCat';
import {
  Download,
  ShieldCheck,
  Zap,
  Code2,
  Folder,
  Keyboard,
  CheckCircle2,
  ExternalLink,
  Laptop,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
  Lock,
  ArrowRight,
  Pin,
  Heart,
  Trash2,
  Search,
  ClipboardPaste,
  Moon,
  Sun,
  Maximize2,
} from 'lucide-react';
import { triggerExtensionDownload } from '../../lib/extensionPackager';

interface WebsiteViewProps {
  onOpenDashboard: () => void;
  onOpenPopupSimulator: () => void;
  onShowToast: (msg: string, type?: 'success' | 'warning' | 'error', paw?: boolean) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const WebsiteView: React.FC<WebsiteViewProps> = ({
  onOpenDashboard,
  onOpenPopupSimulator,
  onShowToast,
  darkMode,
  onToggleDarkMode,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Hero interactive popup state
  const [heroTab, setHeroTab] = useState<'all' | 'code' | 'link' | 'pinned'>('all');
  const [heroSearch, setHeroSearch] = useState('');
  const [heroEmptyMode, setHeroEmptyMode] = useState(false);
  const [heroCopiedId, setHeroCopiedId] = useState<string | null>(null);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await triggerExtensionDownload();
      onShowToast('Downloaded copycat-chrome-extension-v3.zip! 🐾', 'success', true);
    } catch (err) {
      console.error('Download error:', err);
      onShowToast('Failed to start download. Try again.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  // Sample hero mockup clips that exactly match CopyCat
  const heroMockClips = [
    {
      id: 'clip_1',
      category: 'code',
      content: 'const copycat = () => console.log("Copy less. Do more. Meow! 🐾");',
      pinned: true,
      favorite: true,
      charCount: 68,
      time: 'just now',
    },
    {
      id: 'clip_2',
      category: 'link',
      content: 'https://chrome.google.com/webstore/detail/copycat',
      pinned: false,
      favorite: false,
      charCount: 47,
      time: '5m ago',
    },
    {
      id: 'clip_3',
      category: 'color',
      content: '#7047D7',
      pinned: false,
      favorite: true,
      charCount: 7,
      time: '12m ago',
    },
  ];

  const filteredHeroClips = heroMockClips.filter((c) => {
    if (heroEmptyMode) return false;
    if (heroSearch.trim() && !c.content.toLowerCase().includes(heroSearch.toLowerCase())) {
      return false;
    }
    if (heroTab === 'pinned') return c.pinned;
    if (heroTab === 'code') return c.category === 'code';
    if (heroTab === 'link') return c.category === 'link';
    return true;
  });

  const handleHeroCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setHeroCopiedId(id);
    onShowToast('Copied to your paws! 🐾', 'success', true);
    setTimeout(() => setHeroCopiedId(null), 1800);
  };

  const faqs = [
    {
      q: 'Why does the extension install via "Load unpacked"?',
      a: 'This download package is a clean, developer-ready Manifest V3 extension bundle. In Chrome, turning on "Developer mode" at chrome://extensions and selecting "Load unpacked" installs it instantly in seconds without waiting for Chrome Web Store reviews.',
    },
    {
      q: 'Does CopyCat send my copied data to any cloud servers?',
      a: 'Never. CopyCat is engineered with a strict local-first architecture. All your snippets, links, and collections are saved exclusively on your local computer using browser IndexedDB and chrome.storage.local.',
    },
    {
      q: 'Will CopyCat slow down Google Chrome?',
      a: 'Not at all. Unlike legacy extensions, CopyCat is built with Chrome Manifest V3 service workers that only spin up when you interact with the extension and instantly sleep when idle, consuming 0% idle CPU.',
    },
    {
      q: 'How does the Sensitive Shield protect passwords and keys?',
      a: 'CopyCat includes pattern detection for passwords, credit card numbers, JWT tokens, Stripe keys, GitHub tokens, and Google API keys. When detected, they are automatically masked with dots and require an intentional click to reveal.',
    },
    {
      q: 'Can I export or backup my saved clipboard vault?',
      a: 'Yes! CopyCat supports full JSON backup and restore, as well as formatted Markdown exports for developer documentation and notes.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#FFF8EE] dark:bg-[#1A172A] text-[#24203D] dark:text-[#F3EDFD] font-sans">
      {/* Top Website Header adhering to Top Bar Contract */}
      <header className="px-8 py-5 border-b border-[#E8E1F5] dark:border-[#383256] bg-white/70 dark:bg-[#201C38]/70 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between gap-8">
        {/* Zone 1: Single element brand wordmark */}
        <a href="#hero" className="flex items-center gap-2.5 text-slate-900 dark:text-white shrink-0 group">
          <div className="w-8 h-8 rounded-xl bg-[#7047D7] text-white flex items-center justify-center shadow-md shadow-[#7047D7]/20 group-hover:scale-105 transition-transform">
            <PawIcon size={18} fill="currentColor" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-[#7047D7] dark:text-[#B69AFF]">
            CopyCat
          </span>
        </a>

        {/* Zone 2: 4-5 concise single-line links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <a href="#features" className="hover:text-[#7047D7] dark:hover:text-[#B69AFF] transition-colors whitespace-nowrap">
            Features
          </a>
          <a href="#installation" className="hover:text-[#7047D7] dark:hover:text-[#B69AFF] transition-colors whitespace-nowrap">
            Install Guide
          </a>
          <a href="#privacy" className="hover:text-[#7047D7] dark:hover:text-[#B69AFF] transition-colors whitespace-nowrap">
            Privacy Pledge
          </a>
          <a href="#faq" className="hover:text-[#7047D7] dark:hover:text-[#B69AFF] transition-colors whitespace-nowrap">
            FAQ
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenDashboard}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#7047D7] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Launch Web App</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#7047D7] hover:bg-[#5D37BD] text-white shadow-md shadow-[#7047D7]/20 flex items-center gap-2 active:scale-95 transition-transform"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Packaging...' : 'Download for Chrome'}</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative px-6 py-12 md:py-20 max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Release Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFD9E4]/60 dark:bg-[#7047D7]/20 border border-[#B69AFF]/40 text-[#7047D7] dark:text-[#B69AFF] text-xs font-bold mb-6">
          <PawIcon size={14} fill="currentColor" />
          <span>Chrome Extension Manifest V3 · Free & 100% Local</span>
        </div>

        {/* Headline with balance */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl leading-tight">
          The purr-fect clipboard manager for <span className="text-[#7047D7] dark:text-[#B69AFF]">Google Chrome</span>.
        </h1>

        <p className="mt-4 text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          Copy less. Do more. Meow! Never lose a snippet, URL, or color hex code again. Packed with instant search, auto-categorization, custom collections, and delightful cat animations.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-6 py-3.5 text-sm font-bold rounded-2xl bg-[#7047D7] hover:bg-[#5D37BD] text-white shadow-xl shadow-[#7047D7]/25 flex items-center gap-2.5 transition-transform hover:-translate-y-0.5 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Generating ZIP...' : 'Download Extension (.zip)'}</span>
            <span className="text-[11px] opacity-80 font-normal ml-1">v1.0.0</span>
          </button>

          <button
            onClick={onOpenPopupSimulator}
            className="px-6 py-3.5 text-sm font-semibold rounded-2xl bg-white dark:bg-[#201C38] border border-slate-200 dark:border-slate-700 hover:border-[#7047D7] text-slate-800 dark:text-slate-100 shadow-sm flex items-center gap-2 transition-transform hover:-translate-y-0.5"
          >
            <Laptop className="w-4 h-4 text-[#7047D7] dark:text-[#B69AFF]" />
            <span>Interactive Simulator</span>
          </button>

          <button
            onClick={onOpenDashboard}
            className="px-5 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#7047D7] dark:hover:text-[#B69AFF] flex items-center gap-1.5 transition-colors"
          >
            <span>Open Full Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Toggle Switcher for Website Popup Mockup: Active vs Snoozing */}
        <div className="mt-10 flex items-center gap-2 bg-white/80 dark:bg-[#201C38]/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <button
            onClick={() => setHeroEmptyMode(false)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
              !heroEmptyMode
                ? 'bg-[#7047D7] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Show Active Popup Design
          </button>
          <button
            onClick={() => setHeroEmptyMode(true)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
              heroEmptyMode
                ? 'bg-[#7047D7] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Show Snoozing Cat (Empty State)
          </button>
        </div>

        {/* EXACT Pixel-Perfect Chrome Popup Picture on Website */}
        <div className="mt-6 flex flex-col items-center">
          <div className="w-[380px] rounded-3xl shadow-2xl border-4 border-slate-900/10 dark:border-white/10 overflow-hidden bg-white dark:bg-[#1E1B33] text-left">
            {/* Chrome Browser Mini Tab Bar */}
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

            {/* Exact CopyCat Popup Container */}
            <div className="w-full h-[540px] flex flex-col bg-[#FFF8EE] dark:bg-[#1A172A] text-[#24203D] dark:text-[#F3EDFD] relative">
              {/* Popup Header */}
              <div className="px-4 py-3 bg-white dark:bg-[#24203D] border-b border-[#E8E1F5] dark:border-[#383256] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#7047D7] text-white flex items-center justify-center shadow-xs">
                    <PawIcon size={16} fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-tight text-[#7047D7] dark:text-[#B69AFF]">
                      CopyCat
                    </h3>
                    <span className="text-[10px] text-slate-400 block leading-tight">
                      {heroEmptyMode ? '0 clips saved' : `${heroMockClips.length} clips saved`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onShowToast('Paste from clipboard simulated! 🐾', 'success', true)}
                    title="Paste from clipboard"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#7047D7] dark:hover:text-[#B69AFF] hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ClipboardPaste className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onToggleDarkMode}
                    title="Toggle Theme"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#7047D7] dark:hover:text-[#B69AFF] hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={onOpenDashboard}
                    title="Open full dashboard"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#7047D7] dark:hover:text-[#B69AFF] hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Popup Filter & Search */}
              <div className="p-3 bg-white/70 dark:bg-[#24203D]/70 backdrop-blur-xs border-b border-[#E8E1F5] dark:border-[#383256] space-y-2 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Search clipboard..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#1E1B33] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#7047D7]"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'code', label: 'Code' },
                    { id: 'link', label: 'Links' },
                    { id: 'pinned', label: '📌 Pinned' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setHeroTab(tab.id as typeof heroTab)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg whitespace-nowrap transition-colors ${
                        heroTab === tab.id
                          ? 'bg-[#7047D7] text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-[#1E1B33] text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Popup List Area */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {heroEmptyMode ? (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center select-none">
                    <SleepingCat size={140} />
                    <h4 className="mt-3 text-xs font-bold text-[#7047D7] dark:text-[#B69AFF]">
                      Zzz... CopyCat is snoozing peacefully
                    </h4>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 max-w-[220px]">
                      No items copied yet. Copy any text or click below to wake me up!
                    </p>
                    <button
                      onClick={() => setHeroEmptyMode(false)}
                      className="mt-3 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#7047D7] text-white hover:bg-[#5D37BD] shadow-sm flex items-center gap-1.5"
                    >
                      <ClipboardPaste className="w-3.5 h-3.5" />
                      Paste from Clipboard
                    </button>
                  </div>
                ) : (
                  filteredHeroClips.map((clip) => {
                    const isCode = clip.category === 'code';
                    const isColor = clip.category === 'color';
                    const isCopied = heroCopiedId === clip.id;

                    return (
                      <div
                        key={clip.id}
                        className={`p-3 rounded-2xl border transition-all ${
                          clip.pinned
                            ? 'bg-[#FFF8EE] dark:bg-[#201C38] border-[#B69AFF] shadow-xs'
                            : 'bg-white dark:bg-[#24203D] border-[#E8E1F5] dark:border-[#383256]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            <span className="font-semibold text-slate-700 dark:text-slate-200 capitalize">
                              {clip.category}
                            </span>
                            <span>·</span>
                            <span>{clip.charCount} chars</span>
                            <span>·</span>
                            <span>{clip.time}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button className={`p-1 rounded ${clip.pinned ? 'text-[#7047D7] bg-[#B69AFF]/20' : 'text-slate-400'}`}>
                              <Pin className="w-3 h-3 fill-current" />
                            </button>
                            <button className={`p-1 rounded ${clip.favorite ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40' : 'text-slate-400'}`}>
                              <Heart className="w-3 h-3 fill-current" />
                            </button>
                          </div>
                        </div>

                        {/* Color swatch */}
                        {isColor && (
                          <div className="flex items-center gap-2 mb-2 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                            <div className="w-5 h-5 rounded border border-black/10 shrink-0" style={{ backgroundColor: clip.content }} />
                            <span className="font-mono text-xs font-semibold">{clip.content}</span>
                          </div>
                        )}

                        {/* Text / Code container */}
                        <div
                          onClick={() => handleHeroCopy(clip.content, clip.id)}
                          className={`p-2.5 rounded-xl cursor-pointer text-xs ${
                            isCode
                              ? 'bg-[#1E1B33] text-[#F3EDFD] font-mono'
                              : 'bg-slate-50 dark:bg-[#1E1B33]/80 text-[#24203D] dark:text-[#E8E1F5]'
                          } hover:ring-2 hover:ring-[#B69AFF]/50`}
                        >
                          <pre className="whitespace-pre-wrap break-words">{clip.content}</pre>
                        </div>

                        {/* Bottom action */}
                        <div className="mt-2 flex items-center justify-end">
                          <button
                            onClick={() => handleHeroCopy(clip.content, clip.id)}
                            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                              isCopied
                                ? 'bg-emerald-500 text-white'
                                : 'bg-[#7047D7] hover:bg-[#5D37BD] text-white shadow-xs'
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Copied! 🐾</span>
                              </>
                            ) : (
                              <>
                                <PawIcon size={12} fill="currentColor" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Popup Footer */}
              <div className="px-4 py-2 bg-white dark:bg-[#24203D] border-t border-[#E8E1F5] dark:border-[#383256] flex items-center justify-between text-[11px] text-slate-500 shrink-0">
                <span className="flex items-center gap-1 font-medium">
                  <PawIcon size={12} fill="#7047D7" />
                  <span>Copy less. Do more. Meow!</span>
                </span>
                <button
                  onClick={onOpenDashboard}
                  className="font-semibold text-[#7047D7] dark:text-[#B69AFF] hover:underline flex items-center gap-1"
                >
                  <span>Dashboard ↗</span>
                </button>
              </div>
            </div>
          </div>

          <span className="text-xs text-slate-500 mt-3">
            ↑ Exact replica of the Chrome Extension popup window
          </span>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7047D7] dark:text-[#B69AFF]">
            Why CopyCat?
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            Packed with smart features. Zero fluff.
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Engineered for developers, writers, and power users who value speed, beauty, and privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#201C38] border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-[#7047D7]/10 dark:bg-[#7047D7]/30 text-[#7047D7] dark:text-[#B69AFF] flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              100% Local & Zero-Server
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Your clips never leave your device. All data is saved directly in browser IndexedDB. No external telemetry, no accounts, and no third-party tracking.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#201C38] border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Auto-Classification
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Instantly detects whether your clip is Code, a URL, an Email, or a Hex Color with live swatch previews. Filter through them in a single click.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#201C38] border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
              <PawIcon size={20} fill="currentColor" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Cat Personality & Chimes
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Sleeping Cat snoozes when your history is empty, and Happy Cat pops up with a joyful wave and synthesized audio purr when you copy an item.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#201C38] border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
              <Folder className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Custom Collections
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Group related clips into custom collections like "Work", "Snippets", "Research", or "Prompts" with personalized color labels.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#201C38] border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Sensitive Shield
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Auto-detects API keys, tokens, passwords, and card numbers, masking them by default with an eye toggle to reveal only when you require it.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#201C38] border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4">
              <Keyboard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Keyboard Shortcuts
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Press <kbd className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">Ctrl+Shift+V</kbd> to summon the popup, <kbd className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">/</kbd> to search, and <kbd className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">1-9</kbd> to quick-copy top clips.
            </p>
          </div>
        </div>
      </section>

      {/* Installation Walkthrough Section */}
      <section id="installation" className="py-20 px-6 bg-[#FFD9E4]/25 dark:bg-[#1E1B33]/40 border-y border-[#E8E1F5] dark:border-[#383256]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7047D7] dark:text-[#B69AFF]">
              Quick Installation
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              Install in Google Chrome in 3 Simple Steps
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              No store account or wait times required. Works seamlessly on Chrome, Brave, and Edge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#201C38] border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
              <div>
                <span className="w-8 h-8 rounded-full bg-[#7047D7] text-white font-extrabold text-sm flex items-center justify-center mb-4">
                  1
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Download & Unzip
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Click the button below to download the verified Manifest V3 ZIP package and extract it to a local folder.
                </p>
              </div>

              <button
                onClick={handleDownload}
                disabled={downloading}
                className="mt-6 w-full py-2.5 text-xs font-bold rounded-xl bg-[#7047D7] hover:bg-[#5D37BD] text-white flex items-center justify-center gap-2 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloading ? 'Downloading...' : 'Get .ZIP (v1.0.0)'}</span>
              </button>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#201C38] border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
              <div>
                <span className="w-8 h-8 rounded-full bg-[#7047D7] text-white font-extrabold text-sm flex items-center justify-center mb-4">
                  2
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Open chrome://extensions
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Open Google Chrome, navigate to <code className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">chrome://extensions</code>, and toggle <strong>Developer mode</strong> in the top-right corner.
                </p>
              </div>

              <div className="mt-6 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-[11px] font-mono text-center text-slate-600 dark:text-slate-300">
                Developer mode: ON 🔘
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#201C38] border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
              <div>
                <span className="w-8 h-8 rounded-full bg-[#7047D7] text-white font-extrabold text-sm flex items-center justify-center mb-4">
                  3
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Click "Load unpacked"
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Click the <strong>"Load unpacked"</strong> button in the top-left toolbar and select your extracted CopyCat folder. Done!
                </p>
              </div>

              <div className="mt-6 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ready to Meow!</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Pledge */}
      <section id="privacy" className="py-20 px-6 max-w-4xl mx-auto w-full">
        <div className="p-8 rounded-3xl bg-white dark:bg-[#201C38] border border-slate-200 dark:border-slate-700 shadow-lg flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 rounded-3xl bg-[#7047D7]/10 dark:bg-[#7047D7]/30 text-[#7047D7] dark:text-[#B69AFF] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-10 h-10" />
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Our Privacy Pledge: Zero Cloud, Zero Tracking
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Most clipboard tools require logins and sync your sensitive clipboard data to mysterious cloud servers. <strong>CopyCat does not.</strong> Everything is stored strictly inside your browser's local sandbox (IndexedDB and local storage). We never collect or read your clipboard silently.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-[#7047D7] dark:text-[#B69AFF]">
              <span>✓ No tracking cookies</span>
              <span>✓ No background uploads</span>
              <span>✓ Export or wipe history anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 px-6 max-w-3xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-white dark:bg-[#201C38] border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full p-4 text-left text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 px-6 bg-gradient-to-r from-[#7047D7] to-[#8C64E8] text-white text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <PawIcon size={32} fill="currentColor" className="mx-auto text-[#FFD9E4]" />
          <h2 className="text-3xl font-extrabold tracking-tight">
            Ready to upgrade your Chrome clipboard?
          </h2>
          <p className="text-xs text-white/80 max-w-md mx-auto">
            Download CopyCat for free and experience instant copy history with cat charm.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-6 py-3 text-xs font-extrabold rounded-2xl bg-white text-[#7047D7] hover:bg-[#FFF8EE] shadow-xl flex items-center gap-2 active:scale-95 transition-transform"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Downloading...' : 'Download Extension (.zip)'}</span>
            </button>
            <button
              onClick={onOpenDashboard}
              className="px-6 py-3 text-xs font-bold rounded-2xl bg-[#24203D] hover:bg-[#1A172A] text-white shadow-lg flex items-center gap-2"
            >
              <Laptop className="w-4 h-4" />
              <span>Try in Browser</span>
            </button>
          </div>
        </div>
      </section>

      {/* Website Footer */}
      <footer className="px-8 py-8 bg-[#24203D] text-[#FFF8EE] text-xs border-t border-[#B69AFF]/20 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-bold text-[#B69AFF]">
          <PawIcon size={16} fill="currentColor" />
          <span>CopyCat – Copy less. Do more. Meow!</span>
        </div>

        <div className="flex items-center gap-6 text-white/60 text-xs">
          <button onClick={onOpenDashboard} className="hover:text-white">
            Web Dashboard
          </button>
          <button onClick={onOpenPopupSimulator} className="hover:text-white">
            Popup Simulator
          </button>
          <a href="#installation" className="hover:text-white">
            Install Guide
          </a>
          <button onClick={onToggleDarkMode} className="hover:text-white">
            {darkMode ? 'Light Theme' : 'Dark Theme'}
          </button>
        </div>

        <span className="text-white/40 text-[11px]">
          Manifest V3 Chrome Extension · 100% Local Privacy
        </span>
      </footer>
    </div>
  );
};
