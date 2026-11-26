import { analyzeUrl, RISK } from "../lib/analyzer.js";

const BADGE = {
  [RISK.SAFE]: { text: "", color: "#2e7d32" },
  [RISK.SUSPICIOUS]: { text: "!", color: "#f9a825" },
  [RISK.DANGEROUS]: { text: "X", color: "#c62828" }
};

// Sekme başına son analiz sonucu (popup bunu okur).
const results = new Map();
// Sayfadan (content script) gelen ek sinyaller.
const pageSignals = new Map();

async function getAllowlist() {
  const { allowlist = [] } = await chrome.storage.sync.get("allowlist");
  return allowlist;
}

function isHttp(url) {
  return url && (url.startsWith("http://") || url.startsWith("https://"));
}

async function evaluateTab(tabId, url) {
  if (!isHttp(url)) return;
  const host = new URL(url).hostname;
  const allowlist = await getAllowlist();

  if (allowlist.includes(host)) {
    const r = { url, hostname: host, level: RISK.SAFE, score: 0, reasons: [], allowlisted: true };
    results.set(tabId, r);
    updateBadge(tabId, r);
    return r;
  }

  const result = await analyzeUrl(url, pageSignals.get(tabId) || []);
  results.set(tabId, result);
  updateBadge(tabId, result);

  // Kara listedeki siteler için uyarı sayfasına yönlendir.
  if (result.blocked) {
    const warning = chrome.runtime.getURL(
      `src/warning/warning.html?url=${encodeURIComponent(url)}`
    );
    chrome.tabs.update(tabId, { url: warning });
  }
  return result;
}

function updateBadge(tabId, result) {
  const b = BADGE[result.level];
  chrome.action.setBadgeText({ tabId, text: b.text });
  chrome.action.setBadgeBackgroundColor({ tabId, color: b.color });
}

chrome.webNavigation.onCommitted.addListener(({ tabId, frameId, url }) => {
  if (frameId !== 0) return;
  pageSignals.delete(tabId);
  evaluateTab(tabId, url);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  results.delete(tabId);
  pageSignals.delete(tabId);
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.type) {
    case "PAGE_SIGNALS": {
      const tabId = sender.tab?.id;
      if (tabId == null) return;
      pageSignals.set(tabId, msg.signals);
      evaluateTab(tabId, sender.tab.url).then((r) => sendResponse(r));
      return true;
    }
    case "GET_RESULT": {
      sendResponse(results.get(msg.tabId) || null);
      return;
    }
    case "ALLOW_SITE": {
      getAllowlist().then(async (list) => {
        if (!list.includes(msg.hostname)) list.push(msg.hostname);
        await chrome.storage.sync.set({ allowlist: list });
        sendResponse({ ok: true });
      });
      return true;
    }
  }
});
