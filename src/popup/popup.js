const LABELS = {
  safe: "✅ Güvenli görünüyor",
  suspicious: "⚠️ Şüpheli",
  dangerous: "⛔ Tehlikeli"
};

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const result = await chrome.runtime.sendMessage({ type: "GET_RESULT", tabId: tab.id });
  const status = document.getElementById("status");

  if (!result) {
    status.textContent = "Bu sayfa analiz edilmedi.";
    return;
  }

  status.textContent = result.allowlisted ? "✅ İzin verilen site" : LABELS[result.level];
  status.className = `status ${result.level}`;
  document.getElementById("host").textContent = result.hostname;
  document.getElementById("score").textContent = `Risk puanı: ${result.score}/100`;

  const list = document.getElementById("reasons");
  for (const r of result.reasons) {
    const li = document.createElement("li");
    li.textContent = r.description;
    list.appendChild(li);
  }
}

document.getElementById("open-options").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

init();
