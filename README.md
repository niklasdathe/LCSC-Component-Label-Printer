# LCSC → Labelmaker (12 mm tape, 40 mm length)


Paste **LCSC** part numbers → fetch details via a secure **serverless proxy** → print crisp **SVG labels** with **Value**, **LCSC #**, **Package/Footprint**, **Type**, plus a **QR code** linking to the product page. Default label is **12 mm** width and **40 mm** length; other widths (6/9/12/18/24 mm) are supported.


**Frontend**: GitHub Pages (static, no secrets).
**Backend**: Cloudflare Worker proxy (hides API key, signs LCSC Item Details API requests).


---


## Demo / Hosting
- Host the `public/` folder as your GitHub Pages site (root).
- Deploy the Worker from `workers/` and set its public URL in your frontend (the app calls `/api/item` on the same origin if you reverse‑proxy; otherwise set `API_BASE` in `index.html`).


---


## Why a proxy?
You **must not** ship the LCSC API key to browsers. The Cloudflare Worker signs requests (key + secret, server‑side) and returns a minimal, safe JSON subset for labels.


---


## Quick start


### 1) Fork and enable Pages
1. Fork this repo.
2. In GitHub → Settings → Pages → **Source: `main` branch `/public` folder`**.
3. Your site will be available at `https://<user>.github.io/<repo>/`.


### 2) Deploy the Worker (Cloudflare)
1. Install Wrangler: `npm i -g wrangler`.
2. `cd workers && wrangler login`.
3. Set secrets:
```bash
wrangler secret put LCSC_KEY
wrangler secret put LCSC_SECRET
```
4. (Optional) Set CORS:

  	In wrangler.toml, set CORS_ORIGIN = "https://<user>.github.io" (or your custom domain).

5. Deploy: wrangler deploy → note the URL, e.g. `https://lcsc-proxy.<account>.workers.dev`.
### 3) Point the frontend to the proxy

  The provided index.html calls /api/item. If your Worker lives at another origin, add a simple reverse proxy (via a path rule on your domain) or change the fetch call:
```
const API_BASE = 'https://lcsc-proxy.<account>.workers.dev';
const r = await fetch(`${API_BASE}/api/item?product_number=${encodeURIComponent(pn)}&currency=EUR`)
```

---

## Printing

- Works with any standard printer via the browser’s print dialog.

- For silent, one‑click printing and better control, install QZ Tray (Win/macOS/Linux). The app will auto‑use it when available.

- For auto‑cut at exactly one label per 40 mm: in the Brother PT driver, enable Auto Cut → Each.

### Recommended printers

- Brother PT‑P700 (USB, auto‑cutter, 3.5–24 mm TZe). Very affordable second‑hand.

- Brother PT‑P750W (USB/Wi‑Fi) if you need network printing.


---


## Features

- Paste many LCSC numbers (one per line).

- Fetches: number, title, mpn, package, category, attributes (for value), datasheet, etc.

- Heuristics to guess Value from attributes/title; fully editable inline.

- SVG labels at physical mm dimensions (scales for 6/9/12/18/24 mm width; default 12 mm × 40 mm length).

- QR to product page.

- Optional QZ Tray silent printing.


---


## Dev notes

- Physical sizing uses 300 DPI ≈ 11.811 px/mm to render crisp text/QR.

- One SVG per label → driver auto‑cut per element when enabled.

- You can add caching on the Worker (e.g., Cache API, 24 h) to reduce API calls.


