# Phish Guard 🛡️

A **Google Chrome** extension (Manifest V3) that detects malicious (malware) and phishing websites and warns the user.

> Status: **Skeleton / early development (v0.1.0)**

## How it works

Every page you open goes through a three-layer check:

1. **Blocklist** – Is the domain on the list of known malicious sites? (`src/data/blocklist.json`)
   If it is, the tab is redirected to a warning page.
2. **URL heuristics** – Signs such as a raw IP address, punycode, brand impersonation, suspicious TLDs (`.xyz`, `.zip` …),
   an `@` character or missing HTTPS add to a risk score. (`src/lib/heuristics.js`)
3. **Page signals** – Content-based signs such as a password field on an HTTP page or a form that sends
   the password to another domain. (`src/content/content.js`)

Based on the total score, the site is classified as **Safe / Suspicious / Dangerous**; the result is shown
on the extension icon badge and in the popup.

## Project structure

```
phish-guard/
├── manifest.json              # Extension definition (MV3)
├── src/
│   ├── background/
│   │   └── service-worker.js  # Watches tabs, runs the analysis, updates the badge
│   ├── content/
│   │   └── content.js         # Collects in-page signals, shows a warning banner
│   ├── lib/
│   │   ├── analyzer.js        # Combines all checks into a risk level
│   │   ├── heuristics.js      # URL rules
│   │   └── blocklist.js       # Blocklist loading and lookup
│   ├── data/
│   │   └── blocklist.json     # Sample blocklist
│   ├── popup/                 # Window that opens when the icon is clicked
│   ├── options/               # Settings (allowed sites)
│   └── warning/               # Dangerous-site warning page
└── tests/
    └── heuristics.test.js     # Unit tests using Node's built-in test runner
```

## Installation (developer mode)

1. Clone this repository:
   ```bash
   git clone https://github.com/burcuyasanerr/phish-guard.git
   ```
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select the `phish-guard` folder.

## Tests

Requires Node.js 18+:

```bash
npm test
```

## Roadmap

- [ ] Extension icons (16/32/48/128 px)
- [ ] Google Safe Browsing API integration
- [ ] Periodic download of PhishTank / URLhaus / OpenPhish lists
- [ ] Look-alike domain (typosquatting) detection using Levenshtein distance
- [ ] Domain age (WHOIS) check
- [ ] Visual page similarity / machine-learning-based classification
- [ ] Let users report suspicious sites
- [ ] Multi-language support (`_locales`)
- [ ] Publish on the Chrome Web Store
