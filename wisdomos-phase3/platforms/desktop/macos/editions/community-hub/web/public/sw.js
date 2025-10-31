// Service Worker for WisdomOS PWA
const CACHE_NAME = 'wisdomos-v1.0.0';
const STATIC_CACHE_NAME = 'wisdomos-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'wisdomos-dynamic-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/analytics',
  '/search',
  '/profile',
  '/tools/boundary-audit',
  '/tools/upset-documentation',
  '/tools/fulfillment-display',
  '/offline',
  '/manifest.json',
  // Add any critical CSS/JS files
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^\/api\/auth\//,
  /^\/api\/user\//,
  /^\/api\/analytics\//,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return cacheName !== STATIC_CACHE_NAME && 
                     cacheName !== DYNAMIC_CACHE_NAME &&
                     cacheName.startsWith('wisdomos-');
            })
            .map(cacheName => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle different types of requests
  if (request.method === 'GET') {
    // Static assets - cache first strategy
    if (STATIC_ASSETS.some(asset => url.pathname === asset) || 
        url.pathname.startsWith('/_next/static/')) {
      event.respondWith(cacheFirstStrategy(request));
    }
    // API requests - network first with cache fallback
    else if (url.pathname.startsWith('/api/') || 
             API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      event.respondWith(networkFirstStrategy(request));
    }
    // HTML pages - network first with offline fallback
    else if (request.headers.get('accept').includes('text/html')) {
      event.respondWith(networkFirstWithOfflineFallback(request));
    }
    // Other resources - cache first
    else {
      event.respondWith(cacheFirstStrategy(request));
    }
  }
});

// Cache first strategy (for static assets)
async function cacheFirstStrategy(request) {
  try {
    const cacheResponse = await caches.match(request);
    if (cacheResponse) {
      return cacheResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first strategy failed:', error);
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Network first strategy (for API requests)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cacheResponse = await caches.match(request);
    
    if (cacheResponse) {
      // Add offline indicator header
      const headers = new Headers(cacheResponse.headers);
      headers.append('X-Served-By', 'serviceworker-cache');
      
      return new Response(cacheResponse.body, {
        status: cacheResponse.status,
        statusText: cacheResponse.statusText,
        headers: headers
      });
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'This feature is not available offline' 
      }), 
      { 
        status: 503, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Network first with offline fallback (for HTML pages)
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', request.url);
    const cacheResponse = await caches.match(request);
    
    if (cacheResponse) {
      return cacheResponse;
    }
    
    // Return offline page
    return caches.match('/offline') || new Response(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>WisdomOS - Offline</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { 
            font-family: system-ui, -apple-system, sans-serif; 
            text-align: center; 
            padding: 2rem; 
            color: #374151;
            background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
          }
          .container {
            background: white;
            padding: 3rem;
            border-radius: 1rem;
            box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
            max-width: 500px;
          }
          .icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 1.5rem;
            background: #8b5cf6;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 2rem;
          }
          h1 { color: #1f2937; margin-bottom: 1rem; }
          p { color: #6b7280; margin-bottom: 2rem; }
          .retry-btn {
            background: #8b5cf6;
            color: white;
            padding: 0.75rem 2rem;
            border: none;
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 1rem;
            margin: 0 0.5rem;
          }
          .retry-btn:hover { background: #7c3aed; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">🧠</div>
          <h1>You're Offline</h1>
          <p>It looks like you don't have an internet connection. Some features may not be available, but you can still access your cached wisdom content.</p>
          <button class="retry-btn" onclick="window.location.reload()">Try Again</button>
          <button class="retry-btn" onclick="window.location.href='/dashboard'">Go to Dashboard</button>
        </div>
      </body>
      </html>`,
      { 
        headers: { 'Content-Type': 'text/html' } 
      }
    );
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-wisdom-entries') {
    event.waitUntil(syncWisdomEntries());
  } else if (event.tag === 'sync-analytics') {
    event.waitUntil(syncAnalytics());
  }
});

async function syncWisdomEntries() {
  try {
    // Get offline entries from IndexedDB
    const offlineEntries = await getOfflineEntries();
    
    for (const entry of offlineEntries) {
      try {
        const response = await fetch('/api/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry.data)
        });
        
        if (response.ok) {
          await removeOfflineEntry(entry.id);
          console.log('[SW] Synced offline entry:', entry.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync entry:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

async function syncAnalytics() {
  try {
    // Sync analytics data when back online
    const response = await fetch('/api/analytics/sync', {
      method: 'POST'
    });
    
    if (response.ok) {
      console.log('[SW] Analytics synced successfully');
    }
  } catch (error) {
    console.error('[SW] Analytics sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let data = {};
  if (event.data) {
    data = event.data.json();
  }
  
  const options = {
    title: data.title || 'WisdomOS',
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    image: data.image,
    data: {
      url: data.url || '/dashboard',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/action-dismiss.png'
      }
    ],
    tag: data.tag || 'default',
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    silent: false,
    vibrate: [200, 100, 200],
    timestamp: Date.now()
  };
  
  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/dashboard';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then((clientList) => {
      // Check if app is already open
      for (let client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Helper functions for offline storage (would use IndexedDB in real implementation)
async function getOfflineEntries() {
  // Mock implementation - in real app, use IndexedDB
  return [];
}

async function removeOfflineEntry(id) {
  // Mock implementation - in real app, use IndexedDB
  console.log('Removing offline entry:', id);
}

// Cache management
self.addEventListener('message', (event) => {
  if (event.data?.type === 'CACHE_UPDATE') {
    // Force update cache
    event.waitUntil(updateCache());
  } else if (event.data?.type === 'GET_CACHE_STATUS') {
    // Send cache status to client
    event.ports[0].postMessage({
      type: 'CACHE_STATUS',
      cached: true,
      version: CACHE_NAME
    });
  }
});

async function updateCache() {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    await cache.addAll(STATIC_ASSETS);
    console.log('[SW] Cache updated successfully');
  } catch (error) {
    console.error('[SW] Cache update failed:', error);
  }
}