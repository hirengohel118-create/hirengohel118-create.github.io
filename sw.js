
const CACHE_NAME = 'vamika-cache-v2';
const urlsToCache = ['/', '/index.html', '/style.css', '/app.js', '/manifest.json', '/logo-192.png', '/logo-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(resp => resp || fetch(event.request)));
});
