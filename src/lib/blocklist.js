// Local blocklist. It will later be updated from external sources such as
// Google Safe Browsing, PhishTank and URLhaus (see README > Roadmap).

let cache = null;

export async function loadBlocklist() {
  if (cache) return cache;
  const res = await fetch(chrome.runtime.getURL("src/data/blocklist.json"));
  const data = await res.json();
  cache = new Set(data.domains.map((d) => d.toLowerCase()));
  return cache;
}

export async function isBlocked(hostname) {
  const list = await loadBlocklist();
  const host = hostname.toLowerCase();
  // Is the domain itself or any of its parent domains on the list?
  const parts = host.split(".");
  for (let i = 0; i < parts.length - 1; i++) {
    if (list.has(parts.slice(i).join("."))) return true;
  }
  return false;
}
