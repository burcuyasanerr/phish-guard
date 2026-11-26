import { runHeuristics } from "./heuristics.js";
import { isBlocked } from "./blocklist.js";

export const RISK = {
  SAFE: "safe",
  SUSPICIOUS: "suspicious",
  DANGEROUS: "dangerous"
};

export const THRESHOLDS = {
  suspicious: 30,
  dangerous: 60
};

/**
 * Bir URL'yi analiz eder ve risk sonucunu döndürür.
 * @returns {{url, hostname, level, score, reasons, blocked}}
 */
export async function analyzeUrl(urlString, pageSignals = []) {
  const url = new URL(urlString);
  const blocked = await isBlocked(url.hostname);
  const { score: hScore, matches } = runHeuristics(urlString);

  const reasons = [...matches];
  let score = hScore;

  for (const s of pageSignals) {
    reasons.push(s);
    score += s.weight;
  }

  if (blocked) {
    reasons.unshift({ id: "blocklist", description: "Site bilinen kötü amaçlı siteler listesinde", weight: 100 });
    score = 100;
  }

  score = Math.min(100, score);
  let level = RISK.SAFE;
  if (score >= THRESHOLDS.dangerous) level = RISK.DANGEROUS;
  else if (score >= THRESHOLDS.suspicious) level = RISK.SUSPICIOUS;

  return { url: urlString, hostname: url.hostname, level, score, reasons, blocked };
}
