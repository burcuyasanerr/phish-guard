// URL-based heuristic checks.
// Each matching rule adds points; the total score determines the risk level.

const SUSPICIOUS_TLDS = ["zip", "mov", "xyz", "top", "click", "gq", "tk", "ml", "cf", "work", "rest"];
const BRAND_KEYWORDS = ["paypal", "apple", "google", "microsoft", "netflix", "amazon", "facebook", "instagram", "garanti", "akbank", "ziraat", "isbank", "edevlet", "turkiye"];
const LURE_WORDS = ["login", "signin", "verify", "account", "update", "secure", "wallet", "giris", "dogrula", "hesap", "guncelle"];

export const RULES = [
  {
    id: "ip-host",
    description: "Uses a raw IP address instead of a domain name",
    weight: 30,
    test: (u) => /^\d{1,3}(\.\d{1,3}){3}$/.test(u.hostname)
  },
  {
    id: "punycode",
    description: "Domain contains punycode (xn--) and may imitate another domain",
    weight: 25,
    test: (u) => u.hostname.split(".").some((p) => p.startsWith("xn--"))
  },
  {
    id: "at-symbol",
    description: "URL contains an '@' character (the real destination may be hidden)",
    weight: 20,
    test: (u) => u.href.includes("@")
  },
  {
    id: "many-subdomains",
    description: "Unusually many subdomains",
    weight: 15,
    test: (u) => u.hostname.split(".").length > 4
  },
  {
    id: "suspicious-tld",
    description: "Top-level domain commonly used for abuse",
    weight: 15,
    test: (u) => SUSPICIOUS_TLDS.includes(u.hostname.split(".").pop())
  },
  {
    id: "long-url",
    description: "URL is unusually long",
    weight: 10,
    test: (u) => u.href.length > 120
  },
  {
    id: "many-hyphens",
    description: "Domain name contains many hyphens",
    weight: 10,
    test: (u) => (u.hostname.match(/-/g) || []).length >= 3
  },
  {
    id: "brand-impersonation",
    description: "A well-known brand name appears in a domain the brand does not own",
    weight: 25,
    test: (u) => {
      const registrable = u.hostname.split(".").slice(-2).join(".");
      return BRAND_KEYWORDS.some((b) => u.hostname.includes(b) && !registrable.startsWith(b + "."));
    }
  },
  {
    id: "lure-words",
    description: "URL contains lure words such as login or verify",
    weight: 10,
    test: (u) => LURE_WORDS.some((w) => u.href.toLowerCase().includes(w))
  },
  {
    id: "no-https",
    description: "Connection is not encrypted (no HTTPS)",
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
