// Çalıştırma: node --test tests/
import { test } from "node:test";
import assert from "node:assert/strict";
import { runHeuristics } from "../src/lib/heuristics.js";

test("normal site düşük puan alır", () => {
  const { score } = runHeuristics("https://www.wikipedia.org/");
  assert.ok(score < 30, `puan ${score}`);
});

test("IP adresli http giriş sayfası en az şüpheli sayılır", () => {
  const { score, matches } = runHeuristics("http://192.168.10.5/paypal/login/verify");
  assert.ok(score >= 30, `puan ${score}`);
  assert.ok(matches.some((m) => m.id === "ip-host"));
});

test("marka taklidi yakalanır", () => {
  const { matches } = runHeuristics("https://paypal-secure-login.xyz/");
  assert.ok(matches.some((m) => m.id === "brand-impersonation"));
});

test("markanın kendi alan adı taklit sayılmaz", () => {
  const { matches } = runHeuristics("https://www.paypal.com/signin");
  assert.ok(!matches.some((m) => m.id === "brand-impersonation"));
});

test("geçersiz URL hata fırlatmaz", () => {
  assert.deepEqual(runHeuristics("bu bir url değil"), { score: 0, matches: [] });
});
