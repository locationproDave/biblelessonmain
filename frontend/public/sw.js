// Service Worker for Bible Lesson Planner PWA
// Update this version number to force cache refresh on deploy
const CACHE_VERSION = 'v4-' + Date.now();
const CACHE_NAME = 'blp-cache-' + CACHE_VERSION;
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately on install (minimal - just offline page)
const PRECACHE_ASSETS = [
  '/offline.html',
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing new version:', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching offline page');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Activate immediately - don't wait for old SW to be replaced
  self.skipWaiting();
});

// Activate event - clean up ALL old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new version:', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('blp-cache-') && name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event - NETWORK FIRST for HTML, cache fallback for assets
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip API requests (never cache)
  if (event.request.url.includes('/api/')) return;

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  const isNavigationRequest = event.request.mode === 'navigate';
  const isHTMLRequest = event.request.headers.get('accept')?.includes('text/html');

  // For navigation/HTML requests - ALWAYS go to network first
  if (isNavigationRequest || isHTMLRequest) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          // Only use offline page if network fails
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // For other assets (JS, CSS, images) - network first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses for offline use
        if (response.ok) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return offline response for failed requests
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
      })
  );
});

// Background sync for offline lesson saves
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-lessons') {
    event.waitUntil(syncLessons());
  }
});

async function syncLessons() {
  console.log('[SW] Background sync triggered for lessons...');
  // The actual sync is handled by the offline-sync.ts module in the main thread
  // This just triggers a message to the client to process the sync queue
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'SYNC_LESSONS' });
  });
}

// Listen for sync requests from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  // Force refresh all caches
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((name) => caches.delete(name));
    });
  }
  // Request background sync registration
  if (event.data && event.data.type === 'REQUEST_SYNC') {
    if (self.registration.sync) {
      self.registration.sync.register('sync-lessons').catch(err => {
        console.log('[SW] Background sync not available:', err);
      });
    }
  }
});
