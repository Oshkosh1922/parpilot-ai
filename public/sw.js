const CACHE = "parpilot-v1";
const ASSETS = ["/", "/styles-1.css", "/styles-2.css", "/styles-3.css", "/styles-4.css", "/styles-5.css", "/app.js", "/favicon.svg", "/manifest.webmanifest"];
self.addEventListener("install", (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS))));
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("/api/")) return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
