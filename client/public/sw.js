// Service Worker für Cache-Busting und Offline-Funktionalität
const CACHE_NAME = 'helix-v2.1.0-' + Date.now();
const urlsToCache = [
  '/',
  '/dashboard',
  '/static/css/main.css',
  '/static/js/main.js'
];

// Installiere Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v2.1.0');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching resources');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Sofortige Aktivierung des neuen Service Workers
        return self.skipWaiting();
      })
  );
});

// Aktiviere Service Worker und lösche alte Caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker v2.1.0');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Übernimm sofort die Kontrolle über alle Clients
      return self.clients.claim();
    })
  );
});

// Fetch-Event: Network-First-Strategie für Dynamic Content
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // API-Requests: Immer netzwerk-first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache API-Responses nur wenn sie ok sind
          if (response.ok && event.request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Fallback auf gecachte Version
          return caches.match(event.request);
        })
    );
    return;
  }

  // Static Assets: Cache-First
  if (url.pathname.includes('/assets/') || url.pathname.includes('.js') || url.pathname.includes('.css')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
    );
    return;
  }

  // Standard Pages: Network-First mit Cache-Fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then((response) => {
            return response || caches.match('/');
          });
      })
  );
});

// Push-Notification für App-Updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FORCE_UPDATE') {
    console.log('[SW] Force update requested');
    // Lösche alle Caches und lade neu
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      // Benachrichtige alle Clients über Update
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'CACHE_CLEARED' });
        });
      });
    });
  }
});