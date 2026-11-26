// Run: node --test tests/
import { test } from "node:test";
import assert from "node:assert/strict";
import { runHeuristics } from "../src/lib/heuristics.js";

test("a normal site gets a low score", () => {
  const { score } = runHeuristics("https://www.wikipedia.org/");
  assert.ok(score < 30, `score ${score}`);
});

test("an HTTP login page on an IP address is at least suspicious", () => {
  const { score, matches } = runHeuristics("http://192.168.10.5/paypal/login/verify");
  assert.ok(score >= 30, `score ${score}`);
  assert.ok(matches.some((m) => m.id === "ip-host"));
});

test("brand impersonation is detected", () => {
  const { matches } = runHeuristics("https://paypal-secure-login.xyz/");
  assert.ok(matches.some((m) => m.id === "brand-impersonation"));
});

test("the brand's own domain is not flagged as impersonation", () => {
  const { matches } = runHeuristics("https://www.paypal.com/signin");
  assert.ok(!matches.some((m) => m.id === "brand-impersonation"));
});

test("an invalid URL does not throw", () => {
  assert.deepEqual(runHeuristics("this is not a url"), { score: 0, matches: [] });
});
