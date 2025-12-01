const CACHE_NAME = 'vamika-crm-v1';
const OFFLINE_URL = '.';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '.',
        'index.html',
        'styles.css',
        'app.js',
        'manifest.json',
        'logo-round.png'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((r) => {
      return r || fetch(event.request);
    })
  );
});