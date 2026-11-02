/**
 * CopyCat Service Worker (Manifest V3)
 * Handles context menus, badge counts, and storage sync
 */

chrome.runtime.onInstalled.addListener(() => {
  // Create Context Menu item to save selected text
  chrome.contextMenus.create({
    id: "save-to-copycat",
    title: "Save to CopyCat 🐾",
    contexts: ["selection"]
  });

  console.log("CopyCat Background Service Worker initialized. Meow!");
});

// Handle right-click selection save
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
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
