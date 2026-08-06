const CACHE_NAME = 'unglobal-v5'; // Increment version to force update
const assets = [
  'index.html',
  'manifest.json',
  'logo.png'
  // Removed './' as it can cause a recursive loop on some browsers
];

// Install and Cache Assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Caching App Shell');
      // Use return to ensure the install event waits
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
    }).then(() => self.clients.claim()) 
  );
});

// Fetch Logic
self.addEventListener('fetch', (event) => {
    // 1. Skip non-GET requests (like your Google Script POSTs)
    if (event.request.method !== 'GET') return;

    // 2. IGNORE external API calls (Jitsi, Google Auth, etc.)
    const url = event.request.url;
    if (url.includes('8x8.vc') || url.includes('google')) {
        return; 
    }

    event.respondWith(
        fetch(event.request)
            .catch(() => {
                // If network fails, look in cache
                return caches.match(event.request).then(response => {
                    return response || caches.match('index.html');
                });
            })
    );
});
