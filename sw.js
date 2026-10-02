// AeroSim Aviation PWA Service Worker - v2.8.0
const CACHE_NAME = 'aerosim-cache-v2.8.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './login.html',
  './register.html',
  './forgot-password.html',
  './track.html',
  './journey.html',
  './stage.html',
  './my-bags.html',
  './report-issue.html',
  './how-it-works.html',
  './faq.html',
  './contact.html',
  './about.html',
  './terms.html',
  './privacy.html',
  './404.html',
  './offline.html',
  './css/style.css',
  './js/data.js',
  './js/layout.js',
  './js/app.js',
  './manifest.json',
  './assets/stage1.jpg',
  './assets/stage2.jpg',
  './assets/stage3.jpg',
  './assets/stage4.jpg',
  './assets/stage5.jpg',
  './assets/stage6.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('PWA cache addAll partial warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle http/https GET requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache (stale-while-revalidate)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Fallback for HTML documents to offline fallback page
        if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./offline.html').then((offlineRes) => {
            return offlineRes || caches.match('./index.html');
          });
        }
      });
    })
  );
});

// Listen for skip waiting message from app
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
