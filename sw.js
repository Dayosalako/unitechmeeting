const CACHE_NAME = 'unglobal-v4';
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
      console.log('SW: Caching App Shell');
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
    }).then(() => self.clients.claim()) // Ensures PWA is active immediately
  );
});

// Fetch Logic: Strategic Handling
self.addEventListener('fetch', (event) => {
    // IGNORE external API calls and authentication scripts
    if (
        event.request.url.includes('8x8.vc') || 
        event.request.url.includes('google.com') ||
        event.request.url.includes('google-analytics.com') ||
        event.request.url.includes('googleapis.com') ||
        event.request.url.includes('googleusercontent.com')
    ) {
        return; 
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                return response;
            })
            .catch(() => {
                // If offline, serve cached index.html
                return caches.match(event.request).then(cachedResponse => {
                  return cachedResponse || caches.match('./index.html');
                });
            })
    );
});
