// Offline-Speicher fuer die App-Dateien. Bei einer neuen Version die Nummer erhoehen.
const CACHE = "pfadikasse-v3";
const FILES = [
  "./", "./index.html", "./manifest.webmanifest",
  "./xlsx.full.min.js", "./jszip.min.js",
  "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Zuerst aus dem Speicher (schnell, offline), im Hintergrund aktualisieren.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => {
      if (r.ok) c.put(e.request, r.clone());
      return r;
    }).catch(() => hit);
    return hit || net;
  }));
});
