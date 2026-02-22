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
      // Use cache.addAll with caution: if one asset fails, the whole install fails
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

// Fetch Logic: Strategic Handling
self.addEventListener('fetch', (event) => {
    // IMPORTANT: Ignore Jitsi/8x8 and Google Script URLs
    // These must ALWAYS be live and should not be handled by the Service Worker cache
    if (
        event.request.url.includes('8x8.vc') || 
        event.request.url.includes('google.com') ||
        event.request.url.includes('googleapis.com')
    ) {
        return; 
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // If network is successful, return the response
                return response;
            })
            .catch(() => {
                // If network fails (offline), try the cache
                return caches.match(event.request);
            })
    );
});
