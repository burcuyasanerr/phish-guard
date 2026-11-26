const target = new URLSearchParams(location.search).get("url") || "";
document.getElementById("url").textContent = target;

document.getElementById("back").onclick = () => {
  if (history.length > 2) history.go(-2);
  else location.href = "https://www.google.com";
};

document.getElementById("proceed").onclick = async () => {
  try {
    const hostname = new URL(target).hostname;
    await chrome.runtime.sendMessage({ type: "ALLOW_SITE", hostname });
    location.href = target;
  } catch {
    /* geçersiz URL */
  }
};
