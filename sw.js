/* =========================================================
   SERVICE WORKER — offline-first caching strategy
   ========================================================= */

const CACHE_NAME = 'fitmylife-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/base.css',
  './css/components.css',
  './css/screens.css',
  './css/animations.css',
  './js/db.js',
  './js/utils.js',
  './js/exercises-data.js',
  './js/quotes-data.js',
  './js/charts.js',
  './js/notifications.js',
  './js/onboarding.js',
  './js/dashboard.js',
  './js/food.js',
  './js/water.js',
  './js/workout.js',
  './js/progress.js',
  './js/sleep.js',
  './js/habits.js',
  './js/mood.js',
  './js/notes.js',
  './js/calendar.js',
  './js/reports.js',
  './js/profile.js',
  './js/settings.js',
  './js/search.js',
  './js/app.js',
  './icons/icon-72.png',
  './icons/icon-96.png',
  './icons/icon-128.png',
  './icons/icon-144.png',
  './icons/icon-152.png',
  './icons/icon-192.png',
  './icons/icon-192-maskable.png',
  './icons/icon-384.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Cache-first for core assets, network-first fallback for everything else (fonts, etc.)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req)
        .then(res => {
          if (res && res.status === 200 && res.type === 'basic') {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
          }
          return res;
        })
        .catch(() => {
          if (req.mode === 'navigate') return caches.match('./index.html');
        });
    })
  );
});

// Background sync placeholder — queues pending writes if the browser supports it.
// All data is local-first (IndexedDB), so sync here is a hook for future server sync.
self.addEventListener('sync', (event) => {
  if (event.tag === 'fitmylife-sync') {
    event.waitUntil(Promise.resolve());
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('index.html') && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./index.html');
    })
  );
});
