const CACHE_NAME = 'unglobal-v3';
const assets = [
  './',
  './index.html',
  './manifest.json',
  './logo.png'
];

// Install and Cache Assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assets);
    })
  );
});

// Activate and Clean Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// Fetch Logic: Network first, then Cache
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests (like Jitsi/8x8 API) to prevent errors
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
