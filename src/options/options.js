const listEl = document.getElementById("allowlist");

async function render() {
  const { allowlist = [] } = await chrome.storage.sync.get("allowlist");
  listEl.innerHTML = "";
  for (const host of allowlist) {
    const li = document.createElement("li");
    li.textContent = host;
    const btn = document.createElement("button");
    btn.textContent = "Remove";
    btn.onclick = async () => {
      await chrome.storage.sync.set({ allowlist: allowlist.filter((h) => h !== host) });
      render();
    };
    li.appendChild(btn);
    listEl.appendChild(li);
  }
}

document.getElementById("add-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("host-input");
  const host = input.value.trim().toLowerCase();
  if (!host) return;
  const { allowlist = [] } = await chrome.storage.sync.get("allowlist");
  if (!allowlist.includes(host)) allowlist.push(host);
  await chrome.storage.sync.set({ allowlist });
  input.value = "";
  render();
});

render();
