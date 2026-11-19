/* Einfacher Offline-Cache: App-Dateien zuerst aus dem Netz, sonst aus dem Cache; Bilder cache-first. */
const CACHE = 'weinkeller-v6';
const CORE = ['./', 'index.html', 'app.css', 'app.js', 'data.js', 'schule-data.js', 'manifest.json', 'icon-192.png', 'icon-512.png', 'img/header/fruehling.jpg', 'img/header/sommer.jpg', 'img/header/lese.jpg', 'img/header/winter.jpg'];

self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const isImg = req.destination === 'image';
  if (isImg) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; })));
    return;
  }
  e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; }).catch(() => caches.match(req)));
});
