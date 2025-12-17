const CACHE_NAME = 'yellow-river-v5';
const urlsToCache = [
  './',
  'index.html',
  'index.tsx',
  'manifest.json',
  'icon.svg',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Force activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache.map(url => new Request(url, {mode: 'no-cors'})));
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Navigation strategy: Cache First for index.html (App Shell), fallback to Network
  // This ensures the app opens immediately even if offline or if the server path is tricky
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('index.html').then(response => {
        return response || fetch(event.request).catch(() => {
          // If network also fails, try root
          return caches.match('./');
        });
      })
    );
    return;
  }

  // Stale-while-revalidate for other assets could be better, but Cache First is safer for static apps
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});