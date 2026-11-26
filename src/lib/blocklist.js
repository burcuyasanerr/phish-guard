// Yerel kara liste. İleride Google Safe Browsing, PhishTank, URLhaus gibi
// dış kaynaklarla güncellenecek (bkz. README > Yol Haritası).

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
  // Alan adının kendisi veya herhangi bir üst alan adı listede mi?
  const parts = host.split(".");
  for (let i = 0; i < parts.length - 1; i++) {
    if (list.has(parts.slice(i).join("."))) return true;
  }
  return false;
}
