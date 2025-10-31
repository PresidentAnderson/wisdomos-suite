const CACHE_NAME = 'wisdomos-v1.0.0'
const STATIC_CACHE_NAME = 'wisdomos-static-v1.0.0'
const DYNAMIC_CACHE_NAME = 'wisdomos-dynamic-v1.0.0'

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/auth/login',
  '/auth/register',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
]

// Dynamic assets patterns
const DYNAMIC_PATTERNS = [
  /^https:\/\/.*\.supabase\.co\/.*/,
  /^https:\/\/fonts\.googleapis\.com\/.*/,
  /^https:\/\/fonts\.gstatic\.com\/.*/
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static assets', error)
      })
  )
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && 
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  
  // Take control of all pages
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return
  }
  
  // Handle different types of requests
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirstStrategy(request))
  } else if (isAPIRequest(url)) {
    event.respondWith(networkFirstStrategy(request))
  } else if (isDynamicAsset(url)) {
    event.respondWith(staleWhileRevalidateStrategy(request))
  } else {
    event.respondWith(cacheFirstStrategy(request))
  }
})

// Check if request is for static asset
function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.pathname === asset) ||
         url.pathname.includes('/icon-') ||
         url.pathname.includes('/static/') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.svg')
}

// Check if request is to API
function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') ||
         url.hostname.includes('supabase.co') ||
         url.hostname.includes('googleapis.com')
}

// Check if request is for dynamic asset
function isDynamicAsset(url) {
  return DYNAMIC_PATTERNS.some(pattern => pattern.test(url.href))
}

// Cache first strategy - good for static assets
async function cacheFirstStrategy(request) {
  try {
    const cacheResponse = await caches.match(request)
    if (cacheResponse) {
      return cacheResponse
    }
    
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(STATIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('Cache first strategy failed:', error)
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      const cache = await caches.open(STATIC_CACHE_NAME)
      return cache.match('/') || new Response('Offline', { status: 503 })
    }
    
    return new Response('Network error', { status: 503 })
  }
}

// Network first strategy - good for API requests
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('Network first strategy failed:', error)
    
    // Fallback to cache
    const cacheResponse = await caches.match(request)
    if (cacheResponse) {
      return cacheResponse
    }
    
    return new Response('Offline', { status: 503 })
  }
}

// Stale while revalidate - good for dynamic content
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME)
  const cacheResponse = await caches.match(request)
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch((error) => {
    console.error('Stale while revalidate failed:', error)
    return cacheResponse
  })
  
  return cacheResponse || fetchPromise
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag)
  
  if (event.tag === 'document-sync') {
    event.waitUntil(syncDocuments())
  }
  
  if (event.tag === 'activity-sync') {
    event.waitUntil(syncActivities())
  }
})

// Sync offline documents when back online
async function syncDocuments() {
  try {
    // Get offline documents from IndexedDB
    const offlineDocuments = await getOfflineDocuments()
    
    for (const doc of offlineDocuments) {
      try {
        // Attempt to sync with server
        const response = await fetch('/api/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(doc)
        })
        
        if (response.ok) {
          // Remove from offline storage
          await removeOfflineDocument(doc.id)
          console.log('Document synced:', doc.id)
        }
      } catch (error) {
        console.error('Failed to sync document:', doc.id, error)
      }
    }
  } catch (error) {
    console.error('Document sync failed:', error)
  }
}

// Sync offline activities
async function syncActivities() {
  try {
    const offlineActivities = await getOfflineActivities()
    
    for (const activity of offlineActivities) {
      try {
        const response = await fetch('/api/activities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(activity)
        })
        
        if (response.ok) {
          await removeOfflineActivity(activity.id)
          console.log('Activity synced:', activity.id)
        }
      } catch (error) {
        console.error('Failed to sync activity:', activity.id, error)
      }
    }
  } catch (error) {
    console.error('Activity sync failed:', error)
  }
}

// IndexedDB helper functions (simplified)
async function getOfflineDocuments() {
  // This would implement IndexedDB operations
  return []
}

async function removeOfflineDocument(id) {
  // This would implement IndexedDB operations
  console.log('Removing offline document:', id)
}

async function getOfflineActivities() {
  // This would implement IndexedDB operations
  return []
}

async function removeOfflineActivity(id) {
  // This would implement IndexedDB operations
  console.log('Removing offline activity:', id)
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received')
  
  let notificationData = {
    title: 'WisdomOS Notification',
    body: 'You have a new update',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    tag: 'wisdomos-notification',
    renotify: true,
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icon-192x192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  }
  
  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = { ...notificationData, ...data }
    } catch (error) {
      console.error('Error parsing push data:', error)
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event)
  
  event.notification.close()
  
  if (event.action === 'view') {
    // Open the app
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/dashboard')
    )
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return
  } else {
    // Default click action
    event.waitUntil(
      clients.openWindow('/dashboard')
    )
  }
})

// Handle message from main app
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CACHE_DOCUMENT') {
    // Cache a document for offline access
    cacheDocument(event.data.document)
  }
})

// Cache document for offline access
async function cacheDocument(document) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME)
    const response = new Response(JSON.stringify(document), {
      headers: { 'Content-Type': 'application/json' }
    })
    await cache.put(`/offline/document/${document.id}`, response)
    console.log('Document cached for offline:', document.id)
  } catch (error) {
    console.error('Failed to cache document:', error)
  }
}