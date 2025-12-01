self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('fetch', function(e) {
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});