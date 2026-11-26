# Debugging Phish Guard

The extension is made of three parts that run in **separate contexts**. Each one has its own
DevTools console, so an error only shows up in the console of the part where it happened.

| Part | File | Where its console is |
|---|---|---|
| Service worker (background) | `src/background/service-worker.js` | `chrome://extensions` → Phish Guard → **Inspect views: service worker** |
| Popup | `src/popup/popup.js` | Right-click the toolbar icon → **Inspect popup** |
| Content script | `src/content/content.js` | Open any website → **F12** → Console → change the context dropdown from **top** to **Phish Guard** |

## Reload after every change

Chrome keeps running the version of the extension it loaded. After editing any file:

1. Save the file.
2. Go to `chrome://extensions` and click the **reload (⟳)** button on the Phish Guard card.
3. Reload the page you are testing (F5).
4. If the service worker DevTools window was open, close it and open it again.

## Manual test pages

`test-pages/` contains harmless pages that imitate the signals the extension looks for.

```bash
npm run serve:test
```

Then open http://127.0.0.1:8000 and follow the table on the index page. Stop the server with **Ctrl+C**.

## Useful console commands (service worker console)

```js
// Read the allowlist
await chrome.storage.sync.get("allowlist");

// Clear the allowlist
await chrome.storage.sync.remove("allowlist");
```

## Service worker sleep test

In Manifest V3, Chrome stops the service worker after it has been idle for a short while and starts
it again when it is needed. Anything kept only in memory (variables, `Map`s) is lost when that happens.

Run this check after every new feature:

1. Use the feature normally and confirm it works.
2. Stop the service worker, either:
   - in its DevTools window: **Application → Service workers → Stop**, or
   - at `chrome://serviceworker-internals`: find the `chrome-extension://` entry → **Stop**.
3. Use the feature again **without reloading the page**.

If it still works, the feature survives the service worker restarting.

> While the service worker's DevTools window is open, Chrome does not put it to sleep. Close that
> window when you want to reproduce what real users see.

### Known issue

The analysis results are currently kept in an in-memory `Map` in the service worker. After the
service worker restarts, the popup shows *"This page has not been analyzed."* while the badge still
shows the old result. Fix: store results in `chrome.storage.session` (see roadmap, phase 4C).
