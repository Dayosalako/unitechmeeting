const CACHE_NAME = 'unglobal-v4'; // Incremented version to v4
const assets = [
  './',
  './index.html',
  './manifest.json',
  './logo.png'
];

// 1. Install and Cache Assets
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the new service worker to become active immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assets);
    })
  );
});

// 2. Activate and Clean Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  // Ensure the new Service Worker takes control of the page immediately
  return self.clients.claim(); 
});

// 3. Strategic Fetch Handling
self.addEventListener('fetch', (event) => {
    const url = event.request.url;

    // CRITICAL: Never cache these. They must always be LIVE.
    if (
        url.includes('8x8.vc') || 
        url.includes('google.com') ||
        url.includes('googleapis.com') ||
        url.includes('exec') // Matches your Google Script macros
    ) {
        return; 
    }

    // Network-First Strategy for index.html
    // This ensures that the Friday 8:55 AM lock is always accurate
    event.respondWith(
        fetch(event.request)
            .then(response => {
                return response;
            })
            .catch(() => {
                // If offline, provide the cached version
                return caches.match(event.request);
            })
    );
});
