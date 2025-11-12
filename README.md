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
