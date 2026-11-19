/* Offline-Cache: App-Dateien zuerst aus dem Netz (immer beim Server nachfragen, sonst liefert
   der Browser bis zu 10 Min. alte Kopien von GitHub Pages), ohne Netz aus dem Cache; Bilder cache-first. */
const CACHE = 'weinkeller-v7';
const CORE = ['./', 'index.html', 'app.css', 'app.js', 'data.js', 'schule-data.js', 'manifest.json', 'icon-192.png', 'icon-512.png', 'img/header/fruehling.jpg', 'img/header/sommer.jpg', 'img/header/lese.jpg', 'img/header/winter.jpg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.destination === 'image') {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; })));
    return;
  }
  const sameOrigin = new URL(req.url).origin === self.location.origin;
  e.respondWith(fetch(req, sameOrigin ? { cache: 'no-cache' } : undefined)
    .then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return res; })
    .catch(() => caches.match(req)));
});
