// URL tabanlı sezgisel (heuristic) kontroller.
// Her kural bir puan ekler; toplam puan risk seviyesini belirler.

const SUSPICIOUS_TLDS = ["zip", "mov", "xyz", "top", "click", "gq", "tk", "ml", "cf", "work", "rest"];
const BRAND_KEYWORDS = ["paypal", "apple", "google", "microsoft", "netflix", "amazon", "facebook", "instagram", "garanti", "akbank", "ziraat", "isbank", "edevlet", "turkiye"];
const LURE_WORDS = ["login", "signin", "verify", "account", "update", "secure", "wallet", "giris", "dogrula", "hesap", "guncelle"];

export const RULES = [
  {
    id: "ip-host",
    description: "Alan adı yerine doğrudan IP adresi kullanılıyor",
    weight: 30,
    test: (u) => /^\d{1,3}(\.\d{1,3}){3}$/.test(u.hostname)
  },
  {
    id: "punycode",
    description: "Punycode (xn--) içeren, benzer görünümlü alan adı olabilir",
    weight: 25,
    test: (u) => u.hostname.split(".").some((p) => p.startsWith("xn--"))
  },
  {
    id: "at-symbol",
    description: "URL içinde '@' karakteri var (gerçek hedef gizlenebilir)",
    weight: 20,
    test: (u) => u.href.includes("@")
  },
  {
    id: "many-subdomains",
    description: "Çok fazla alt alan adı var",
    weight: 15,
    test: (u) => u.hostname.split(".").length > 4
  },
  {
    id: "suspicious-tld",
    description: "Kötüye kullanımı sık görülen bir üst düzey alan adı",
    weight: 15,
    test: (u) => SUSPICIOUS_TLDS.includes(u.hostname.split(".").pop())
  },
  {
    id: "long-url",
    description: "URL olağandışı uzun",
    weight: 10,
    test: (u) => u.href.length > 120
  },
  {
    id: "many-hyphens",
    description: "Alan adında çok sayıda tire var",
    weight: 10,
    test: (u) => (u.hostname.match(/-/g) || []).length >= 3
  },
  {
    id: "brand-impersonation",
    description: "Bilinen bir marka adı, markaya ait olmayan bir alan adında geçiyor",
    weight: 25,
    test: (u) => {
      const registrable = u.hostname.split(".").slice(-2).join(".");
      return BRAND_KEYWORDS.some((b) => u.hostname.includes(b) && !registrable.startsWith(b + "."));
    }
  },
  {
    id: "lure-words",
    description: "URL'de giriş/doğrulama gibi tuzak kelimeleri var",
    weight: 10,
    test: (u) => LURE_WORDS.some((w) => u.href.toLowerCase().includes(w))
  },
  {
    id: "no-https",
    description: "Bağlantı şifreli değil (HTTPS yok)",
    weight: 10,
    test: (u) => u.protocol === "http:"
  }
];

export function runHeuristics(urlString) {
  let url;
  try {
    url = new URL(urlString);
  } catch {
    return { score: 0, matches: [] };
  }
  const matches = RULES.filter((r) => {
    try {
      return r.test(url);
    } catch {
      return false;
    }
  }).map(({ id, description, weight }) => ({ id, description, weight }));
  const score = Math.min(100, matches.reduce((s, m) => s + m.weight, 0));
  return { score, matches };
}
