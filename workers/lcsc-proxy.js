// /workers/lcsc-proxy.js — Cloudflare Worker
// Env vars: LCSC_KEY, LCSC_SECRET, CORS_ORIGIN (e.g., https://yourdomain.tld)
// LCSC signature = sha1("key=...&nonce=...&secret=...&timestamp=...")
// Docs show required query params: key, nonce (16‑char), product_number, signature, timestamp


export default {
async fetch(req, env) {
const url = new URL(req.url);
if (req.method !== 'GET') return new Response('Method Not Allowed', { status: 405 });


// CORS
const origin = req.headers.get('Origin') || '';
const isAllowed = origin === env.CORS_ORIGIN;
const cors = {
'Access-Control-Allow-Origin': isAllowed ? origin : 'null',
'Vary': 'Origin',
'Access-Control-Allow-Methods': 'GET, OPTIONS',
'Access-Control-Allow-Headers': 'Content-Type',
'Access-Control-Max-Age': '86400'
};
if (req.method === 'OPTIONS') return new Response(null, { headers: cors });


const pn = url.searchParams.get('product_number');
const currency = url.searchParams.get('currency') || 'EUR';
if (!pn) return new Response(JSON.stringify({ error: 'missing product_number' }), { status: 400, headers: { 'Content-Type': 'application/json', ...cors } });


const key = env.LCSC_KEY;
const secret = env.LCSC_SECRET;
const nonce = crypto.getRandomValues(new Uint8Array(8)) // 8 bytes → 16 hex chars
.reduce((s, b) => s + b.toString(16).padStart(2, '0'), '');
const timestamp = Date.now().toString();


const sigBase = `key=${key}&nonce=${nonce}&secret=${secret}&timestamp=${timestamp}`;
const signature = await sha1Hex(sigBase);


const qs = new URLSearchParams({
key,
nonce,
product_number: pn,
signature,
timestamp,
currency
});


// LCSC item details endpoint (from docs)
const apiUrl = `https://www.lcsc.com/api/item/detail?${qs.toString()}`;
const lcscResp = await fetch(apiUrl);
if (!lcscResp.ok) return new Response(JSON.stringify({ error: 'upstream error', status: lcscResp.status }), { status: 502, headers: { 'Content-Type': 'application/json', ...cors } });
const data = await lcscResp.json();


// Minimal safe payload for labels (avoid leaking account data)
const r = data?.result || {};
const safe = {
number: r.number, // LCSC part #
mpn: r.mpn, // manufacturer P/N
title: r.title,
description: r.description,
package: r.package, // e.g., SOT‑223, 0603, QFN‑32
category: r.category?.name,
manufacturer: r.manufacturer?.name,
attributes: r.attributes || {}, // sometimes includes value fields
datasheet: r.datasheet?.url,
prices: r.prices || [],
stock: r.quantity,
images: (r.images || []).map(i => i?.url)
};


return new Response(JSON.stringify({ success: true, result: safe }), {
headers: { 'Content-Type': 'application/json', ...cors }
});
}
};


async function sha1Hex(msg) {
const enc = new TextEncoder().encode(msg);
const buf = await crypto.subtle.digest('SHA-1', enc);
const v = new Uint8Array(buf);
return Array.from(v).map(b => b.toString(16).padStart(2, '0')).join('');
}
