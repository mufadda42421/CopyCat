import JSZip from 'jszip';

// Valid PNG images encoded as base64 (Purple rounded icon with cream paw center)
export const ICON16_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAM0lEQVR4nGMocL/+nxLMMIwN+P/jHQYm2gBsmnEZgmEAPs3YDBk1gBaxQJV0MDiSMrEYAEgt6ZIB0P2aAAAAAElFTkSuQmCC';
export const ICON48_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAoElEQVR4nO3Yuw2AMBAEUXdHO3RLF8RkUAFI9/Ny8gSb2vNCe+zbcXfeUAcAUAcAUAcAUAcAUAcAqDj0vs7X/RbwFV2JSQF44rMQYUAkPgMRAmTERxFuQGZ8BOECVMR7EWZAZbwHAaAVYEa8FQEAAAAAjQCzEJYeAO0A1Qhry5rvgQqEt2HtN3EGIno3/0JWTPZd/I2qB0A9AOoBUA+Aeg/R0fDX5EsYBgAAAABJRU5ErkJggg==';
export const ICON128_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAB30lEQVR4nO3SsVEEQAwEwc+OdMiWLLDxHpfCpIpfSdvG+Hfafry/fTzV2yP9AAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAAPjd8+vzz6XfDsCLB28DcQrAfw5/FcJ6AK8c/SKG1QDSw19AsBJAeuxLEFYBSI97EcIaAOlBryJYASA95GUE4wGkB7yOYDSA9HANCMYCSA/WgmAkgPRQTQjGAUgP1IZgFID0MI0IAAAg/4i28SchAACA/CPSQzQjiANIDzAhAMoDoLxaAOnDTwqA8uoApA8+MQDKA6A8AMqrAZA+9OQAKA+A8gAoD4DyACgPgPIAKA+A8gAoD4DyACgPgPIAKA+A8ioAQDBjfACGBUB5AJRXBQCC/PgADKoSAATZ8QEYEgDlVQNoR5C+/QgArQjSNwcAgDkA2hCkbw0AAPMAtCBI33g0gOsI0rddAeAqgvRNVwG4hiB9y5UAriBI33A1gO0I0rc7AWArgvTNTgHYhiB9q5MANkBI36YCwEQI6VtUApiCIH2DagApDOm/AhCCkP4bAC8GkX47AAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgA/ewbltlbqGlybRIAAAAASUVORK5CYII=';

export const MANIFEST_JSON = `{
  "manifest_version": 3,
  "name": "CopyCat – Clipboard Manager",
  "version": "1.0.0",
  "description": "Copy less. Do more. Meow! A cute, premium, cat-themed clipboard manager for Google Chrome.",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "background": {
    "service_worker": "background.js"
  },
  "permissions": [
    "storage",
    "unlimitedStorage",
    "clipboardRead",
    "clipboardWrite",
    "contextMenus"
  ],
  "commands": {
    "_execute_action": {
      "suggested_key": {
        "default": "Ctrl+Shift+V",
        "mac": "Command+Shift+V"
      },
      "description": "Open CopyCat Clipboard Manager"
    }
  }
}`;

export const BACKGROUND_JS = `/**
 * CopyCat Service Worker (Manifest V3)
 * Handles context menus, badge notifications, and storage sync
 */

chrome.runtime.onInstalled.addListener(() => {
  // Clear any previous context menus first to avoid duplicate ID errors
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "save-to-copycat",
      title: "Save to CopyCat 🐾",
      contexts: ["selection"]
    });
  });

  console.log("CopyCat Background Service Worker initialized. Meow!");
});

// Handle right-click selection save
chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId === "save-to-copycat" && info.selectionText) {
    const text = info.selectionText.trim();
    if (!text) return;

    chrome.storage.local.get(["copycat_clips"], (res) => {
      const clips = res.copycat_clips || [];
      const newClip = {
        id: "clip_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
        content: text,
        category: text.startsWith("http") ? "link" : (text.includes("{") ? "code" : "text"),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pinned: false,
        favorite: false,
        collectionId: null,
        charCount: text.length,
        copyCount: 0
      };

      // Add to front
      clips.unshift(newClip);
      chrome.storage.local.set({ copycat_clips: clips }, () => {
        // Flash badge
        chrome.action.setBadgeText({ text: "🐾" });
        chrome.action.setBadgeBackgroundColor({ color: "#7047D7" });
        setTimeout(() => chrome.action.setBadgeText({ text: "" }), 2500);
      });
    });
  }
});
`;

export const POPUP_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CopyCat Popup</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --lavender: #B69AFF;
      --purple: #7047D7;
      --purple-hover: #5D37BD;
      --cream: #FFF8EE;
      --dark-navy: #24203D;
      --soft-pink: #FFD9E4;
      --card-bg: #FFFFFF;
      --card-border: #E8E1F5;
      --text-muted: #64748B;
    }

    body.dark {
      --cream: #1A172A;
      --dark-navy: #F3EDFD;
      --card-bg: #24203D;
      --card-border: #383256;
      --text-muted: #94A3B8;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      width: 380px;
      height: 580px;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background: var(--cream);
      color: var(--dark-navy);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      user-select: none;
    }

    /* Top Chrome Extension Header */
    header {
      padding: 12px 16px;
      background: var(--card-bg);
      border-bottom: 1px solid var(--card-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .paw-badge {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: var(--purple);
      color: #FFF;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(112, 71, 215, 0.2);
    }

    .brand-title {
      font-size: 14px;
      font-weight: 800;
      color: var(--purple);
      line-height: 1.1;
    }

    .brand-sub {
      font-size: 10px;
      color: var(--text-muted);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .icon-btn {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s, color 0.15s;
    }

    .icon-btn:hover {
      background: rgba(112, 71, 215, 0.1);
      color: var(--purple);
    }

    /* Filter & Search Bar */
    .filter-section {
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.6);
      border-bottom: 1px solid var(--card-border);
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex-shrink: 0;
    }

    body.dark .filter-section {
      background: rgba(36, 32, 61, 0.6);
    }

    .search-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 10px;
      color: var(--text-muted);
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 7px 12px 7px 32px;
      border-radius: 10px;
      border: 1px solid var(--card-border);
      background: var(--card-bg);
      color: var(--dark-navy);
      font-size: 12px;
      outline: none;
      font-family: inherit;
    }

    .search-input:focus {
      border-color: var(--purple);
      box-shadow: 0 0 0 2px rgba(112, 71, 215, 0.15);
    }

    .category-pills {
      display: flex;
      align-items: center;
      gap: 4px;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .category-pills::-webkit-scrollbar { display: none; }

    .cat-pill {
      padding: 3px 9px;
      font-size: 11px;
      font-weight: 600;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      white-space: nowrap;
      background: rgba(112, 71, 215, 0.08);
      color: var(--text-muted);
      transition: all 0.15s;
    }

    .cat-pill.active {
      background: var(--purple);
      color: #FFF;
      box-shadow: 0 2px 6px rgba(112, 71, 215, 0.25);
    }

    /* Main Clip List */
    .clip-list {
      flex: 1;
      overflow-y: auto;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* Clip Card */
    .clip-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 12px;
      transition: all 0.2s;
      position: relative;
    }

    .clip-card.pinned {
      background: #FFF8EE;
      border-color: var(--lavender);
    }

    body.dark .clip-card.pinned {
      background: #201C38;
      border-color: var(--lavender);
    }

    .clip-card:hover {
      border-color: var(--lavender);
      box-shadow: 0 4px 12px rgba(112, 71, 215, 0.08);
    }

    .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 11px;
      color: var(--text-muted);
    }

    .card-meta {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .card-meta strong {
      color: var(--dark-navy);
      text-transform: capitalize;
    }

    .card-actions {
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .btn-action-icon {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 3px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-action-icon:hover {
      color: var(--purple);
      background: rgba(112, 71, 215, 0.08);
    }

    .btn-action-icon.pinned {
      color: var(--purple);
      background: rgba(182, 154, 255, 0.2);
    }
    .btn-action-icon.favorite {
      color: #F43F5E;
    }

    /* Content block */
    .content-box {
      background: rgba(0, 0, 0, 0.03);
      border-radius: 10px;
      padding: 8px 10px;
      font-size: 12px;
      line-height: 1.45;
      cursor: pointer;
      word-break: break-word;
      white-space: pre-wrap;
      max-height: 64px;
      overflow: hidden;
      transition: background 0.15s;
    }
    body.dark .content-box {
      background: rgba(0, 0, 0, 0.25);
    }
    .content-box:hover {
      background: rgba(112, 71, 215, 0.06);
    }
    .content-box.code-type {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      background: #1E1B33;
      color: #F3EDFD;
    }

    .color-swatch-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .color-box {
      width: 20px;
      height: 20px;
      border-radius: 6px;
      border: 1px solid rgba(0,0,0,0.1);
      box-shadow: inset 0 0 2px rgba(0,0,0,0.1);
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin-top: 8px;
    }

    .btn-copy {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 5px 12px;
      font-size: 11px;
      font-weight: 700;
      border-radius: 10px;
      border: none;
      background: var(--purple);
      color: #FFF;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(112, 71, 215, 0.25);
      transition: all 0.15s;
    }
    .btn-copy:hover {
      background: var(--purple-hover);
    }
    .btn-copy.copied {
      background: #10B981;
      box-shadow: 0 2px 6px rgba(16, 185, 129, 0.25);
    }

    /* Empty state with Sleeping Cat */
    .empty-state {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 24px;
    }

    .empty-title {
      font-size: 13px;
      font-weight: 800;
      color: var(--purple);
      margin-top: 14px;
    }

    .empty-desc {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 4px;
      max-width: 240px;
      line-height: 1.4;
    }

    .btn-wake {
      margin-top: 14px;
      padding: 7px 14px;
      border-radius: 10px;
      background: var(--purple);
      color: #FFF;
      font-size: 11px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Happy cat toast */
    .happy-toast {
      position: absolute;
      top: 14px;
      left: 14px;
      right: 14px;
      background: var(--card-bg);
      border: 1px solid var(--lavender);
      border-radius: 16px;
      padding: 10px 14px;
      box-shadow: 0 8px 24px rgba(112, 71, 215, 0.2);
      display: flex;
      align-items: center;
      gap: 10px;
      z-index: 100;
      animation: slideDown 0.2s ease-out;
    }
    @keyframes slideDown {
      from { transform: translateY(-10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    /* Footer */
    footer {
      padding: 10px 16px;
      background: var(--card-bg);
      border-top: 1px solid var(--card-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      color: var(--text-muted);
      flex-shrink: 0;
    }

    .btn-open-dashboard {
      background: transparent;
      border: none;
      color: var(--purple);
      font-weight: 700;
      font-size: 11px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .btn-open-dashboard:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <!-- Extension Top Bar -->
  <header>
    <div class="brand-group">
      <div class="paw-badge">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 11.5C9.5 11.5 7.5 13.5 7.5 16C7.5 18 9 20 12 20C15 20 16.5 18 16.5 16C16.5 13.5 14.5 11.5 12 11.5Z"/>
          <ellipse cx="6" cy="10" rx="1.8" ry="2.4" transform="rotate(-15 6 10)"/>
          <ellipse cx="10" cy="7.2" rx="1.8" ry="2.4" transform="rotate(-5 10 7.2)"/>
          <ellipse cx="14" cy="7.2" rx="1.8" ry="2.4" transform="rotate(5 14 7.2)"/>
          <ellipse cx="18" cy="10" rx="1.8" ry="2.4" transform="rotate(15 18 10)"/>
        </svg>
      </div>
      <div>
        <div class="brand-title">CopyCat</div>
        <div class="brand-sub" id="clipCount">0 clips saved</div>
      </div>
    </div>

    <div class="header-actions">
      <button class="icon-btn" id="btnPaste" title="Paste from clipboard">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
        </svg>
      </button>
      <button class="icon-btn" id="btnTheme" title="Toggle theme">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>
      <button class="icon-btn" id="btnDashboardTop" title="Open full dashboard">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
      </button>
    </div>
  </header>

  <!-- Filter & Search -->
  <div class="filter-section">
    <div class="search-wrapper">
      <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input type="text" id="searchInput" class="search-input" placeholder="Search clips...">
    </div>

    <div class="category-pills">
      <button class="cat-pill active" data-cat="all">All</button>
      <button class="cat-pill" data-cat="text">Text</button>
      <button class="cat-pill" data-cat="code">Code</button>
      <button class="cat-pill" data-cat="link">Links</button>
      <button class="cat-pill" data-cat="pinned">📌 Pinned</button>
      <button class="cat-pill" data-cat="favorite">❤️ Favorites</button>
    </div>
  </div>

  <!-- Clips List -->
  <div class="clip-list" id="clipList"></div>

  <!-- Footer -->
  <footer>
    <span style="display:flex;align-items:center;gap:4px;">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#7047D7">
        <path d="M12 11.5C9.5 11.5 7.5 13.5 7.5 16C7.5 18 9 20 12 20C15 20 16.5 18 16.5 16C16.5 13.5 14.5 11.5 12 11.5Z"/>
      </svg>
      Copy less. Do more. Meow!
    </span>
    <button class="btn-open-dashboard" id="btnDashboardBottom">
      <span>Dashboard</span>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
        <polyline points="15 3 21 3 21 9"/>
        <line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
    </button>
  </footer>

  <script src="popup.js"></script>
</body>
</html>`;

export const POPUP_JS = `// CopyCat Popup Application Script (Manifest V3)
document.addEventListener("DOMContentLoaded", () => {
  const clipList = document.getElementById("clipList");
  const searchInput = document.getElementById("searchInput");
  const clipCount = document.getElementById("clipCount");
  const btnPaste = document.getElementById("btnPaste");
  const btnTheme = document.getElementById("btnTheme");
  const btnDashboardTop = document.getElementById("btnDashboardTop");
  const btnDashboardBottom = document.getElementById("btnDashboardBottom");
  const catPills = document.querySelectorAll(".cat-pill");

  let allClips = [];
  let currentFilter = "all";
  let searchQuery = "";

  // Check saved theme
  chrome.storage.local.get(["copycat_theme"], (res) => {
    if (res.copycat_theme === "dark") {
      document.body.classList.add("dark");
    }
  });

  btnTheme.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    chrome.storage.local.set({ copycat_theme: isDark ? "dark" : "light" });
  });

  function loadClips() {
    chrome.storage.local.get(["copycat_clips"], (res) => {
      allClips = res.copycat_clips || [];
      clipCount.textContent = allClips.length + (allClips.length === 1 ? " clip saved" : " clips saved");
      renderClips();
    });
  }

  function renderClips() {
    clipList.innerHTML = "";

    const filtered = allClips.filter(c => {
      if (searchQuery) {
        if (!c.content.toLowerCase().includes(searchQuery)) return false;
      }
      if (currentFilter === "pinned") return !!c.pinned;
      if (currentFilter === "favorite") return !!c.favorite;
      if (currentFilter !== "all") return c.category === currentFilter;
      return true;
    });

    // Pinned to the top
    filtered.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

    if (filtered.length === 0) {
      if (allClips.length === 0) {
        clipList.innerHTML = \`
          <div class="empty-state">
            <svg width="140" height="100" viewBox="0 0 240 180" fill="none">
              <ellipse cx="120" cy="155" rx="85" ry="12" fill="#7047D7" opacity="0.1"/>
              <path d="M40 145 C40 125, 80 115, 120 115 C160 115, 200 125, 200 145 C200 165, 160 168, 120 168 C80 168, 40 165, 40 145 Z" fill="#FFF8EE" stroke="#B69AFF" stroke-width="2"/>
              <circle cx="100" cy="115" r="30" fill="#7047D7"/>
              <path d="M78 96 L68 68 C74 70, 86 78, 88 88 Z" fill="#7047D7"/>
              <path d="M112 92 L128 68 C126 76, 122 84, 118 94 Z" fill="#7047D7"/>
              <path d="M85 116 Q91 122 97 116" stroke="#FFF8EE" stroke-width="2" stroke-linecap="round"/>
              <path d="M103 116 Q109 122 115 116" stroke="#FFF8EE" stroke-width="2" stroke-linecap="round"/>
              <text x="160" y="70" font-size="16" fill="#7047D7" font-weight="bold">z</text>
              <text x="175" y="52" font-size="20" fill="#7047D7" font-weight="bold">Z</text>
            </svg>
            <div class="empty-title">Zzz... CopyCat is snoozing</div>
            <div class="empty-desc">No clips saved yet. Copy text in any tab or click "+ Paste" to wake me up!</div>
            <button class="btn-wake" id="btnWakePaste">
              <span>Paste from Clipboard</span>
            </button>
          </div>
        \`;
        document.getElementById("btnWakePaste")?.addEventListener("click", handlePaste);
      } else {
        clipList.innerHTML = \`
          <div style="padding: 30px; text-align: center; color: #888; font-size: 12px;">
            No matching clips found for "\${escapeHtml(searchQuery)}"
          </div>
        \`;
      }
      return;
    }

    filtered.forEach((clip) => {
      const card = document.createElement("div");
      card.className = "clip-card" + (clip.pinned ? " pinned" : "");

      const isCode = clip.category === "code";
      const isColor = clip.category === "color" || /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(clip.content.trim());
      const charLen = clip.charCount || clip.content.length;

      card.innerHTML = \`
        <div class="card-top">
          <div class="card-meta">
            <strong>\${clip.category || 'text'}</strong>
            <span>·</span>
            <span>\${charLen} chars</span>
          </div>
          <div class="card-actions">
            <button class="btn-action-icon \${clip.pinned ? 'pinned' : ''}" data-act="pin" title="Pin clip">📌</button>
            <button class="btn-action-icon \${clip.favorite ? 'favorite' : ''}" data-act="fav" title="Favorite">❤️</button>
            <button class="btn-action-icon" data-act="del" title="Delete">🗑️</button>
          </div>
        </div>

        \${isColor ? \`<div class="color-swatch-row"><div class="color-box" style="background:\${escapeHtml(clip.content.trim())}"></div><span style="font-family:monospace;font-size:11px;font-weight:600;">\${escapeHtml(clip.content.trim())}</span></div>\` : ''}

        <div class="content-box \${isCode ? 'code-type' : ''}">\${escapeHtml(clip.content)}</div>

        <div class="card-footer">
          <button class="btn-copy">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 11.5C9.5 11.5 7.5 13.5 7.5 16C7.5 18 9 20 12 20C15 20 16.5 18 16.5 16C16.5 13.5 14.5 11.5 12 11.5Z"/>
            </svg>
            <span>Copy</span>
          </button>
        </div>
      \`;

      // Copy click
      const copyBtn = card.querySelector(".btn-copy");
      const contentBox = card.querySelector(".content-box");

      const doCopy = async (e) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(clip.content);
        copyBtn.classList.add("copied");
        copyBtn.innerHTML = "<span>Copied! 🐾</span>";
        setTimeout(() => {
          copyBtn.classList.remove("copied");
          copyBtn.innerHTML = \`<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 11.5C9.5 11.5 7.5 13.5 7.5 16C7.5 18 9 20 12 20C15 20 16.5 18 16.5 16C16.5 13.5 14.5 11.5 12 11.5Z"/></svg><span>Copy</span>\`;
        }, 1500);
      };

      copyBtn.addEventListener("click", doCopy);
      contentBox.addEventListener("click", doCopy);

      // Pin
      card.querySelector('[data-act="pin"]').addEventListener("click", (e) => {
        e.stopPropagation();
        clip.pinned = !clip.pinned;
        chrome.storage.local.set({ copycat_clips: allClips }, renderClips);
      });

      // Favorite
      card.querySelector('[data-act="fav"]').addEventListener("click", (e) => {
        e.stopPropagation();
        clip.favorite = !clip.favorite;
        chrome.storage.local.set({ copycat_clips: allClips }, renderClips);
      });

      // Delete
      card.querySelector('[data-act="del"]').addEventListener("click", (e) => {
        e.stopPropagation();
        allClips = allClips.filter(c => c.id !== clip.id);
        chrome.storage.local.set({ copycat_clips: allClips }, loadClips);
      });

      clipList.appendChild(card);
    });
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) return;

      const trimmed = text.trim();
      const existing = allClips.find(c => c.content.trim() === trimmed);
      if (existing) {
        existing.createdAt = Date.now();
        allClips = [existing, ...allClips.filter(c => c.id !== existing.id)];
      } else {
        const isUrl = /^https?:\\/\\//i.test(trimmed);
        const isCode = /[{};<>()=>]|function|const|import/.test(trimmed);
        const isColor = /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(trimmed);
        const newClip = {
          id: "clip_" + Date.now(),
          content: text,
          category: isUrl ? "link" : (isColor ? "color" : (isCode ? "code" : "text")),
          createdAt: Date.now(),
          pinned: false,
          favorite: false,
          charCount: text.length
        };
        allClips.unshift(newClip);
      }
      chrome.storage.local.set({ copycat_clips: allClips }, loadClips);
    } catch(err) {
      console.warn("Clipboard read restricted", err);
    }
  }

  btnPaste.addEventListener("click", handlePaste);

  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderClips();
  });

  catPills.forEach(pill => {
    pill.addEventListener("click", () => {
      catPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      currentFilter = pill.getAttribute("data-cat");
      renderClips();
    });
  });

  const openDash = () => chrome.tabs.create({ url: "dashboard.html" });
  btnDashboardTop.addEventListener("click", openDash);
  btnDashboardBottom.addEventListener("click", openDash);

  loadClips();
});
`;

export const DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CopyCat – Dashboard</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      background: #FFF8EE;
      color: #24203D;
      display: flex;
      height: 100vh;
      overflow: hidden;
    }
    aside {
      width: 250px;
      background: #fff;
      border-right: 1px solid #E8E1F5;
      padding: 24px 18px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      flex-shrink: 0;
    }
    main {
      flex: 1;
      padding: 32px;
      overflow-y: auto;
    }
    .brand {
      font-size: 20px;
      font-weight: 800;
      color: #7047D7;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .tagline {
      font-size: 12px;
      color: #64748B;
      margin-top: 4px;
    }
    .card {
      background: #fff;
      padding: 24px;
      border-radius: 20px;
      border: 1px solid #E8E1F5;
      box-shadow: 0 4px 12px rgba(112, 71, 215, 0.05);
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <aside>
    <div>
      <div class="brand">
        <div style="width:32px;height:32px;border-radius:10px;background:#7047D7;color:#fff;display:flex;align-items:center;justify-content:center;">
          🐾
        </div>
        <span>CopyCat</span>
      </div>
      <div class="tagline">Copy less. Do more. Meow!</div>
    </div>
  </aside>
  <main>
    <h2>CopyCat Vault Manager</h2>
    <p style="color:#64748B;margin-top:6px;font-size:14px;">
      Your clips are safely stored locally in Chrome Storage and IndexedDB.
    </p>
    <div class="card">
      <h3 style="color:#7047D7;">Welcome to your CopyCat Dashboard</h3>
      <p style="margin-top:8px;font-size:13px;line-height:1.6;color:#475569;">
        Use <kbd style="background:#F1F5F9;padding:2px 6px;border-radius:4px;font-family:monospace;">Ctrl+Shift+V</kbd> to open the popup anywhere in Chrome!
      </p>
    </div>
  </main>
</body>
</html>`;

export const DASHBOARD_JS = `console.log("CopyCat Dashboard loaded.");`;

export const README_MD = `# CopyCat Chrome Extension (Manifest V3)
Copy less. Do more. Meow! 🐾

## Quick Installation Instructions:
1. Extract / Unzip this ZIP package into a local folder on your computer (e.g. \`copycat-extension\`).
2. Open Google Chrome and navigate to: \`chrome://extensions\`.
3. In the top-right corner of the Extensions page, toggle **"Developer mode"** to ON.
4. Click the **"Load unpacked"** button in the top-left toolbar.
5. Select the extracted \`copycat-extension\` directory (which directly contains \`manifest.json\`).
6. Done! CopyCat is now installed. Pin it to your Chrome toolbar by clicking the puzzle icon!

### Keyboard Shortcut:
- Press \`Ctrl+Shift+V\` (or \`Command+Shift+V\` on macOS) anywhere to summon CopyCat!
`;

export async function generateExtensionZipBlob(): Promise<Blob> {
  const zip = new JSZip();

  // Root files
  zip.file('manifest.json', MANIFEST_JSON);
  zip.file('background.js', BACKGROUND_JS);
  zip.file('popup.html', POPUP_HTML);
  zip.file('popup.js', POPUP_JS);
  zip.file('dashboard.html', DASHBOARD_HTML);
  zip.file('dashboard.js', DASHBOARD_JS);
  zip.file('README.md', README_MD);

  // Icons - MUST be valid binary PNGs
  const iconsFolder = zip.folder('icons');
  if (iconsFolder) {
    iconsFolder.file('icon16.png', ICON16_BASE64, { base64: true });
    iconsFolder.file('icon48.png', ICON48_BASE64, { base64: true });
    iconsFolder.file('icon128.png', ICON128_BASE64, { base64: true });
  }

  return await zip.generateAsync({ type: 'blob' });
}

export async function triggerExtensionDownload(): Promise<void> {
  const blob = await generateExtensionZipBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'copycat-chrome-extension-v3.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
