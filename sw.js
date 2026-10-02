const CACHE = "presence42-v1.1.0";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", event => {
  // Keep the current version active until the user chooses to update.
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("presence42-v") && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  const shellPaths = ASSETS.map(path => new URL(path, self.registration.scope).pathname);
  if (event.request.mode !== "navigate" && !shellPaths.includes(url.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // Pin HTML and assets to this worker's version, including while an update waits.
    if (event.request.mode === "navigate") {
      const html = await cache.match("./index.html");
      if (html) return html;
    }
    const cached = await cache.match(url.pathname);
    if (cached) return cached;
    return fetch(event.request);
  })());
});
