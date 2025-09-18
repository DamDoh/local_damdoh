/**
 * Service Worker for DamDoh PWA
 * Provides offline functionality, caching, and background sync
 */

const CACHE_NAME = 'damdoh-v1.0.0';
const STATIC_CACHE = 'damdoh-static-v1.0.0';
const DYNAMIC_CACHE = 'damdoh-dynamic-v1.0.0';
const API_CACHE = 'damdoh-api-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints to cache for offline use
const API_ENDPOINTS = [
  '/api/dashboard/layouts',
  '/api/dashboard/widgets',
  '/api/meetings/platforms'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== API_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (STATIC_ASSETS.includes(url.pathname) || url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Default fetch for other requests
  event.respondWith(
    caches.match(request)
      .then(response => response || fetch(request))
  );
});

// Handle API requests with offline support
async function handleApiRequest(request) {
  const url = new URL(request.url);

  // For read operations, try cache first, then network
  if (request.method === 'GET') {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Return cached response and update in background
      fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
          caches.open(API_CACHE).then(cache => cache.put(request, networkResponse));
        }
      }).catch(() => {
        // Network failed, keep cached version
      });
      return cachedResponse;
    }

    // No cache, try network
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        // Cache successful responses
        const cache = await caches.open(API_CACHE);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      // Network failed, return offline response for known endpoints
      if (API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint))) {
        return new Response(JSON.stringify({
          error: 'offline',
          message: 'You are currently offline. This data will sync when connection is restored.',
          offline: true
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      throw error;
    }
  }

  // For write operations, queue for later sync
  if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
    // Clone the request for queuing
    const requestClone = request.clone();

    // Try to send immediately
    try {
      const response = await fetch(request);
      return response;
    } catch (error) {
      // Network failed, queue for background sync
      await queueRequestForSync(requestClone);
      return new Response(JSON.stringify({
        success: true,
        queued: true,
        message: 'Request queued for sync when connection is restored.'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return fetch(request);
}

// Handle static asset requests
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return offline fallback for critical assets
    if (request.url.includes('favicon') || request.url.includes('icon')) {
      return caches.match('/favicon.ico');
    }
    throw error;
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    // Return offline page for navigation requests
    const offlineResponse = await caches.match('/offline.html');
    if (offlineResponse) {
      return offlineResponse;
    }

    // Fallback offline response
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>DamDoh - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding: 2rem; }
            .offline-icon { font-size: 4rem; margin-bottom: 1rem; }
            h1 { color: #16a34a; }
            p { color: #6b7280; max-width: 400px; margin: 0 auto; }
          </style>
        </head>
        <body>
          <div class="offline-icon">🌱</div>
          <h1>You're Offline</h1>
          <p>DamDoh is currently unavailable. Please check your internet connection and try again.</p>
          <p><small>Your data will sync automatically when connection is restored.</small></p>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Queue requests for background sync
async function queueRequestForSync(request) {
  const syncQueue = await getSyncQueue();
  syncQueue.push({
    id: Date.now().toString(),
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: request.method !== 'GET' ? await request.text() : null,
    timestamp: Date.now()
  });

  await saveSyncQueue(syncQueue);

  // Register for background sync if available
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    self.registration.sync.register('background-sync');
  }
}

// Get queued requests
async function getSyncQueue() {
  try {
    const cache = await caches.open('sync-queue');
    const response = await cache.match('queue');
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.warn('[SW] Error reading sync queue:', error);
  }
  return [];
}

// Save queued requests
async function saveSyncQueue(queue) {
  try {
    const cache = await caches.open('sync-queue');
    const response = new Response(JSON.stringify(queue));
    await cache.put('queue', response);
  } catch (error) {
    console.warn('[SW] Error saving sync queue:', error);
  }
}

// Background sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(processSyncQueue());
  }
});

// Process queued requests when connection is restored
async function processSyncQueue() {
  const queue = await getSyncQueue();
  if (queue.length === 0) return;

  console.log(`[SW] Processing ${queue.length} queued requests`);

  for (const item of queue) {
    try {
      const request = new Request(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body
      });

      const response = await fetch(request);
      if (response.ok) {
        console.log(`[SW] Successfully synced request: ${item.url}`);
      } else {
        console.warn(`[SW] Failed to sync request: ${item.url}`, response.status);
      }
    } catch (error) {
      console.warn(`[SW] Error syncing request: ${item.url}`, error);
    }
  }

  // Clear processed queue
  await saveSyncQueue([]);
}

// Push notification support (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: data.data || {},
      actions: data.actions || []
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'DamDoh', options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        // Check if there is already a window/tab open with the target URL
        for (let client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window/tab with the target URL
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});