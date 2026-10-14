/* Offline support: app files are cached on first visit, libraries and fonts as they load. */
const VER = "reader-v1";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png"];
const LIBS = [
  "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/epub.js/0.3.93/epub.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VER).then(async c => {
    await c.addAll(SHELL);
    await Promise.all(LIBS.map(u => c.add(u).catch(() => {})));
  }).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  /* never cache AI calls or Google sign-in / Drive traffic */
  if (/generativelanguage\.googleapis\.com|www\.googleapis\.com|accounts\.google\.com/.test(u.host)) return;
  if (u.origin === location.origin) {
    /* app page: try the network first so updates arrive, fall back to the cache offline */
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(VER).then(c => c.put(r, cp)); return res; }).catch(() => caches.match(r).then(m => m || caches.match("./index.html"))));
    return;
  }
  /* libraries and fonts: cache first */
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res.ok || res.type === "opaque") { const cp = res.clone(); caches.open(VER).then(c => c.put(r, cp)); } return res; })));
});
