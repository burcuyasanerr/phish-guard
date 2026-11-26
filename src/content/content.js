// Collects risk signals from the page content and sends them to the background.
// Note: content scripts cannot be loaded as ES modules, so this file is self-contained.

(function () {
  const signals = [];
  const isHttps = location.protocol === "https:";

  const passwordFields = document.querySelectorAll('input[type="password"]');
  if (passwordFields.length > 0 && !isHttps) {
    signals.push({
      id: "password-over-http",
      description: "Password field on an unencrypted (HTTP) page",
      weight: 30
    });
  }

  // Form submitting data to a different domain
  for (const form of document.forms) {
    const action = form.getAttribute("action");
    if (!action) continue;
    try {
      const target = new URL(action, location.href);
      if (target.hostname && target.hostname !== location.hostname && form.querySelector('input[type="password"]')) {
        signals.push({
          id: "cross-domain-form",
          description: `Password form submits to a different domain (${target.hostname})`,
          weight: 25
        });
        break;
      }
    } catch {
      /* invalid action, ignore */
    }
  }

  if (signals.length === 0) return;

  chrome.runtime.sendMessage({ type: "PAGE_SIGNALS", signals }, (result) => {
    if (chrome.runtime.lastError || !result) return;
    if (result.level === "dangerous" || result.level === "suspicious") {
      showBanner(result);
    }
  });

  function showBanner(result) {
    if (document.getElementById("phish-guard-banner")) return;
    const bar = document.createElement("div");
    bar.id = "phish-guard-banner";
    bar.textContent =
      result.level === "dangerous"
        ? "⚠️ Phish Guard: This site looks dangerous. Do not enter personal information!"
        : "⚠️ Phish Guard: This site looks suspicious. Be careful.";
    Object.assign(bar.style, {
      position: "fixed", top: "0", left: "0", right: "0", zIndex: "2147483647",
      padding: "10px 16px", font: "600 14px system-ui, sans-serif", color: "#fff",
      background: result.level === "dangerous" ? "#c62828" : "#f57f17", textAlign: "center"
    });
    const close = document.createElement("button");
    close.textContent = "✕";
    Object.assign(close.style, { marginLeft: "12px", background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "14px" });
    close.onclick = () => bar.remove();
    bar.appendChild(close);
    document.documentElement.appendChild(bar);
  }
})();
