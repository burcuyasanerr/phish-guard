// Sayfa içeriğinden risk sinyalleri toplar ve arka plana gönderir.
// Not: content script'ler ES modülü olarak yüklenemediği için bağımsız yazıldı.

(function () {
  const signals = [];
  const isHttps = location.protocol === "https:";

  const passwordFields = document.querySelectorAll('input[type="password"]');
  if (passwordFields.length > 0 && !isHttps) {
    signals.push({
      id: "password-over-http",
      description: "Şifresiz (HTTP) bir sayfada parola alanı var",
      weight: 30
    });
  }

  // Formun başka bir alan adına veri göndermesi
  for (const form of document.forms) {
    const action = form.getAttribute("action");
    if (!action) continue;
    try {
      const target = new URL(action, location.href);
      if (target.hostname && target.hostname !== location.hostname && form.querySelector('input[type="password"]')) {
        signals.push({
          id: "cross-domain-form",
          description: `Parola formu başka bir alan adına gönderiyor (${target.hostname})`,
          weight: 25
        });
        break;
      }
    } catch {
      /* geçersiz action, yoksay */
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
        ? "⚠️ Phish Guard: Bu site tehlikeli görünüyor. Kişisel bilgilerinizi girmeyin!"
        : "⚠️ Phish Guard: Bu site şüpheli görünüyor. Dikkatli olun.";
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
