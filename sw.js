const CACHE = "meu-shape-v5-1";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon-180.png", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (url.origin !== location.origin || event.request.method !== "GET") return;

  if (url.pathname.endsWith("/sw.js")) {
    event.respondWith(fetch(event.request, {cache:"no-store"}));
    return;
  }

  if (event.request.mode === "navigate" || url.pathname.endsWith("/index.html") || url.pathname.endsWith("/Meu-Shape/")) {
    event.respondWith(
      fetch(event.request, {cache:"no-store"})
        .then(response => {
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put("./index.html", copy));
          return response;
        })
        .catch(()=>caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(event.request, copy));
      return response;
    }))
  );
});
