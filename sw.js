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
      // If any asset in the array is missing, the install will fail. 
      // Ensure logo.png and manifest.json exist in your root folder.
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
    // These must ALWAYS be live and should not be handled by the Service Worker cache.
    // Caching these would break the meeting connection and the login verification.
    if (
        event.request.url.includes('8x8.vc') || 
        event.request.url.includes('google.com') ||
        event.request.url.includes('googleapis.com') ||
        event.request.url.includes('googleusercontent.com')
    ) {
        return; 
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // If network is successful, return the response immediately
                return response;
            })
            .catch(() => {
                // If network fails (offline), attempt to serve from the cache
                return caches.match(event.request);
            })
    );
});
