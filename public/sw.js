// Service Worker for DamDoh PWA
const CACHE_NAME = 'damdoh-v1.0.0';
const STATIC_CACHE = 'damdoh-static-v1.0.0';
const DYNAMIC_CACHE = 'damdoh-dynamic-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/offline.html'
];

// API endpoints that should be cached
const API_CACHE_PATTERNS = [
  /\/api\/weather\//,
  /\/api\/marketplace\/prices/,
  /\/api\/farm-management\/crops\/types/,
  /\/api\/activity\/types/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    // Cache GET requests for certain endpoints
    if (request.method === 'GET' && API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      event.respondWith(
        caches.open(DYNAMIC_CACHE).then((cache) => {
          return fetch(request)
            .then((response) => {
              // Cache successful responses
              if (response.status === 200) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => {
              // Return cached version if available
              return cache.match(request);
            });
        })
      );
    } else {
      // For other API requests, try network first, then cache
      event.respondWith(
        fetch(request).catch(() => {
          return caches.match(request);
        })
      );
    }
    return;
  }

  // Handle static assets
  if (STATIC_ASSETS.includes(url.pathname) || url.pathname.match(/\.(css|js|png|jpg|jpeg|svg|ico|woff|woff2)$/)) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((response) => {
          // Cache new static assets
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Default strategy: Network first, then cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful GET requests
        if (request.method === 'GET' && response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Return cached version or offline page
        return caches.match(request).then((response) => {
          return response || caches.match('/offline.html');
        });
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered');

  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');

  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body || 'New update available',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'DamDoh Farmer',
      options
    )
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');

  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Sync offline data function
async function syncOfflineData() {
  try {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_OFFLINE_DATA'
      });
    });
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Periodic background sync for weather/market updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'weather-update') {
    event.waitUntil(updateWeatherData());
  } else if (event.tag === 'market-update') {
    event.waitUntil(updateMarketData());
  }
});

async function updateWeatherData() {
  try {
    // This would fetch and cache weather data
    console.log('Updating weather data in background');
  } catch (error) {
    console.error('Weather update failed:', error);
  }
}

async function updateMarketData() {
  try {
    // This would fetch and cache market data
    console.log('Updating market data in background');
  } catch (error) {
    console.error('Market update failed:', error);
  }
}