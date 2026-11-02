// CopyCat Popup Application Script (Manifest V3)
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

    filtered.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

    if (filtered.length === 0) {
      if (allClips.length === 0) {
        clipList.innerHTML = `
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
        `;
        document.getElementById("btnWakePaste")?.addEventListener("click", handlePaste);
      } else {
        clipList.innerHTML = `
          <div style="padding: 30px; text-align: center; color: #888; font-size: 12px;">
            No matching clips found for "${escapeHtml(searchQuery)}"
          </div>
        `;
      }
      return;
    }

    filtered.forEach((clip) => {
      const card = document.createElement("div");
      card.className = "clip-card" + (clip.pinned ? " pinned" : "");

      const isCode = clip.category === "code";
      const isColor = clip.category === "color" || /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(clip.content.trim());
      const charLen = clip.charCount || clip.content.length;

      card.innerHTML = `
        <div class="card-top">
          <div class="card-meta">
            <strong>${clip.category || 'text'}</strong>
            <span>·</span>
            <span>${charLen} chars</span>
          </div>
          <div class="card-actions">
            <button class="btn-action-icon ${clip.pinned ? 'pinned' : ''}" data-act="pin" title="Pin clip">📌</button>
            <button class="btn-action-icon ${clip.favorite ? 'favorite' : ''}" data-act="fav" title="Favorite">❤️</button>
            <button class="btn-action-icon" data-act="del" title="Delete">🗑️</button>
          </div>
        </div>

        ${isColor ? `<div class="color-swatch-row"><div class="color-box" style="background:${escapeHtml(clip.content.trim())}"></div><span style="font-family:monospace;font-size:11px;font-weight:600;">${escapeHtml(clip.content.trim())}</span></div>` : ''}

        <div class="content-box ${isCode ? 'code-type' : ''}">${escapeHtml(clip.content)}</div>

        <div class="card-footer">
          <button class="btn-copy">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 11.5C9.5 11.5 7.5 13.5 7.5 16C7.5 18 9 20 12 20C15 20 16.5 18 16.5 16C16.5 13.5 14.5 11.5 12 11.5Z"/>
            </svg>
            <span>Copy</span>
          </button>
        </div>
      `;

      const copyBtn = card.querySelector(".btn-copy");
      const contentBox = card.querySelector(".content-box");

      const doCopy = async (e) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(clip.content);
        copyBtn.classList.add("copied");
        copyBtn.innerHTML = "<span>Copied! 🐾</span>";
        setTimeout(() => {
          copyBtn.classList.remove("copied");
          copyBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 11.5C9.5 11.5 7.5 13.5 7.5 16C7.5 18 9 20 12 20C15 20 16.5 18 16.5 16C16.5 13.5 14.5 11.5 12 11.5Z"/></svg><span>Copy</span>`;
        }, 1500);
      };

      copyBtn.addEventListener("click", doCopy);
      contentBox.addEventListener("click", doCopy);

      card.querySelector('[data-act="pin"]').addEventListener("click", (e) => {
        e.stopPropagation();
        clip.pinned = !clip.pinned;
        chrome.storage.local.set({ copycat_clips: allClips }, renderClips);
      });

      card.querySelector('[data-act="fav"]').addEventListener("click", (e) => {
        e.stopPropagation();
        clip.favorite = !clip.favorite;
        chrome.storage.local.set({ copycat_clips: allClips }, renderClips);
      });

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
        const isUrl = /^https?:\/\//i.test(trimmed);
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
