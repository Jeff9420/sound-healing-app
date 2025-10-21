/**
 * Service Worker - PWA Implementation
 * Service Worker - PWA 实现
 *
 * @version 3.0.0
 * @author Sound Healing Team
 */

const CACHE_NAME = 'sound-healing-v3.0.0'
const STATIC_CACHE_NAME = 'sound-healing-static-v3.0.0'
const AUDIO_CACHE_NAME = 'sound-healing-audio-v3.0.0'
const DYNAMIC_CACHE_NAME = 'sound-healing-dynamic-v3.0.0'

// Cache URLs that should be cached immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/assets/fonts/system-font.woff2',
  '/assets/css/main.css'
]

// Audio file patterns that should be cached
const AUDIO_PATTERNS = [
  /\/assets\/audio\//i
]

// API routes that should use network-first strategy
const NETWORK_FIRST_ROUTES = [
  /\/api\//i
]

// ============================================================================
// Service Worker Lifecycle
// ============================================================================

self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...')

  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching static assets...')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('✅ Static assets cached successfully')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('❌ Failed to cache static assets:', error)
      })
  )
})

self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker activating...')

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME &&
                cacheName !== AUDIO_CACHE_NAME &&
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      // Take control of all pages
      self.clients.claim()
    ])
      .then(() => {
        console.log('✅ Service Worker activated successfully')
        // Notify all clients about the update
        return self.clients.matchAll()
      })
      .then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_UPDATED',
            cacheName: STATIC_CACHE_NAME
          })
        })
      })
  )
})

// ============================================================================
// Fetch Event Handler
// ============================================================================

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  console.log('🌐 Fetching:', request.url)

  // Handle different request types
  if (request.method === 'GET') {
    // Audio files - Cache First with Network Fallback
    if (isAudioRequest(request.url)) {
      event.respondWith(cacheFirstWithNetworkFallback(request, AUDIO_CACHE_NAME))
      return
    }

    // API routes - Network First with Cache Fallback
    if (isApiRequest(request.url)) {
      event.respondWith(networkFirstWithCacheFallback(request, DYNAMIC_CACHE_NAME))
      return
    }

    // Static assets - Cache First
    if (isStaticAsset(request.url)) {
      event.respondWith(cacheFirstWithNetworkFallback(request, STATIC_CACHE_NAME))
      return
    }

    // HTML pages - Network First with Cache Fallback
    if (request.mode === 'navigate') {
      event.respondWith(networkFirstWithCacheFallback(request, DYNAMIC_CACHE_NAME))
      return
    }

    // Default: Stale While Revalidate
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE_NAME))
  } else {
    // Handle non-GET requests (POST, PUT, DELETE)
    event.respondWith(handleNonGetRequest(request))
  }
})

// ============================================================================
// Caching Strategies
// ============================================================================

// Cache First with Network Fallback
async function cacheFirstWithNetworkFallback(request, cacheName) {
  try {
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)

    if (cachedResponse) {
      console.log('📦 Serving from cache:', request.url)
      return cachedResponse
    }

    console.log('🌐 Not in cache, fetching from network:', request.url)
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      console.log('💾 Caching new resource:', request.url)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.error('❌ Cache First strategy failed:', error)
    throw error
  }
}

// Network First with Cache Fallback
async function networkFirstWithCacheFallback(request, cacheName) {
  try {
    console.log('🌐 Attempting network first:', request.url)
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      console.log('💾 Caching network response:', request.url)
      cache.put(request, networkResponse.clone())
      return networkResponse
    }
  } catch (error) {
    console.log('📦 Network failed, trying cache:', request.url)
  }

  // Fallback to cache
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)

  if (cachedResponse) {
    console.log('📦 Serving from cache:', request.url)
    return cachedResponse
  }

  // Return offline page for HTML requests
  if (request.mode === 'navigate') {
    return caches.match('/offline.html')
  }

  throw new Error('Network request failed and no cached version available')
}

// Stale While Revalidate
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      console.log('🔄 Updating cache:', request.url)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch((error) => {
    console.error('❌ Network request failed:', error)
    throw error
  })

  if (cachedResponse) {
    console.log('📦 Serving stale from cache:', request.url)
    event.waitUntil(fetchPromise)
    return cachedResponse
  }

  console.log('🌐 No cached version, fetching from network:', request.url)
  return fetchPromise
}

// ============================================================================
// Request Type Detection
// ============================================================================

function isAudioRequest(url) {
  return AUDIO_PATTERNS.some(pattern => pattern.test(url))
}

function isApiRequest(url) {
  return NETWORK_FIRST_ROUTES.some(pattern => pattern.test(url))
}

function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.woff', '.woff2', '.ttf', '.eot', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp']
  const extension = url.split('.').pop()?.toLowerCase()
  return staticExtensions.includes(extension)
}

// ============================================================================
// Non-GET Request Handler
// ============================================================================

async function handleNonGetRequest(request) {
  try {
    // For non-GET requests, always try network first
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      // Cache successful POST/PUT responses for offline access
      if (request.method === 'POST' && shouldCacheResponse(request, networkResponse)) {
        const cache = await caches.open(DYNAMIC_CACHE_NAME)
        const cacheKey = createCacheKey(request)
        cache.put(cacheKey, networkResponse.clone())
      }

      return networkResponse
    }
  } catch (error) {
    console.error('❌ Non-GET request failed:', error)

    // Try to serve cached response for POST requests
    if (request.method === 'POST') {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      const cacheKey = createCacheKey(request)
      const cachedResponse = await cache.match(cacheKey)

      if (cachedResponse) {
        console.log('📦 Serving cached POST response:', request.url)
        return cachedResponse
      }
    }
  }

  throw new Error('Non-GET request failed')
}

function shouldCacheResponse(request, response) {
  // Cache successful responses with appropriate status codes
  return response.ok &&
         response.status < 400 &&
         !response.headers.get('cache-control')?.includes('no-store')
}

function createCacheKey(request) {
  // Create a unique cache key for POST/PUT requests
  const body = request.clone()
  return request.url + '_' + body.body?.toString() || ''
}

// ============================================================================
// Background Sync
// ============================================================================

self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag)

  if (event.tag === 'sync-user-data') {
    event.waitUntil(syncUserData())
  } else if (event.tag === 'sync-analytics') {
    event.waitUntil(syncAnalyticsData())
  }
})

async function syncUserData() {
  try {
    console.log('🔄 Syncing user data...')

    // Get offline data from IndexedDB
    const offlineData = await getOfflineUserData()

    if (offlineData.length > 0) {
      // Send data to server
      await sendUserDataToServer(offlineData)

      // Clear offline data after successful sync
      await clearOfflineUserData()

      console.log('✅ User data synced successfully')
    }
  } catch (error) {
    console.error('❌ User data sync failed:', error)
  }
}

async function syncAnalyticsData() {
  try {
    console.log('🔄 Syncing analytics data...')

    // Get offline analytics data
    const offlineAnalytics = await getOfflineAnalyticsData()

    if (offlineAnalytics.length > 0) {
      // Send analytics to server
      await sendAnalyticsToServer(offlineAnalytics)

      // Clear offline analytics after successful sync
      await clearOfflineAnalyticsData()

      console.log('✅ Analytics data synced successfully')
    }
  } catch (error) {
    console.error('❌ Analytics data sync failed:', error)
  }
}

// ============================================================================
// Push Notifications
// ============================================================================

self.addEventListener('push', (event) => {
  console.log('📬 Push notification received')

  if (!event.data) {
    console.warn('⚠️ Push event has no data')
    return
  }

  try {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: data.tag || 'default',
      data: data.data || {},
      actions: data.actions || [],
      silent: data.silent || false,
      requireInteraction: data.requireInteraction || false,
      timestamp: Date.now()
    }

    if (data.image) {
      options.image = data.image
    }

    event.waitUntil(
      self.registration.showNotification(data.title || 'Sound Healing', options)
    )
  } catch (error) {
    console.error('❌ Failed to show push notification:', error)
  }
})

self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.notification.tag)

  event.notification.close()

  const data = event.notification.data || {}

  // Handle different notification actions
  if (event.action) {
    handleNotificationAction(event.action, data)
  } else {
    // Default action: open app
    handleDefaultNotificationAction(data)
  }
})

function handleNotificationAction(action, data) {
  switch (action) {
    case 'play-track':
      // Navigate to app and play specific track
      clients.matchAll({ type: 'window' }).then((clientList) => {
        clientList.forEach((client) => {
          client.postMessage({
            type: 'PLAY_TRACK',
            trackId: data.trackId
          })
        })
      })
      break

    case 'open-app':
      handleDefaultNotificationAction(data)
      break

    case 'dismiss':
      // Just close notification, already handled
      break
  }
}

function handleDefaultNotificationAction(data) {
  // Focus or open the app
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      if (clientList.length > 0) {
        // Focus existing window
        clientList[0].focus()
        clientList[0].postMessage({
          type: 'NOTIFICATION_CLICKED',
          data
        })
      } else {
        // Open new window
        clients.openWindow(data.url || '/')
      }
    })
  )
}

// ============================================================================
// Message Handling
// ============================================================================

self.addEventListener('message', (event) => {
  console.log('📨 Message received in service worker:', event.data)

  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break

    case 'CACHE_AUDIO':
      cacheAudioFiles(event.data.files)
      break

    case 'CLEAR_CACHE':
      clearCache(event.data.cacheName)
      break

    case 'GET_VERSION':
      event.ports[0].postMessage({
        version: CACHE_NAME,
        timestamp: Date.now()
      })
      break

    default:
      console.warn('⚠️ Unknown message type:', event.data.type)
  }
})

async function cacheAudioFiles(files) {
  try {
    console.log('📦 Caching audio files...')

    const cache = await caches.open(AUDIO_CACHE_NAME)
    const promises = files.map(file =>
      fetch(file.url).then(response => {
        if (response.ok) {
          return cache.put(file.url, response)
        }
      })
    )

    await Promise.all(promises)
    console.log('✅ Audio files cached successfully')
  } catch (error) {
    console.error('❌ Failed to cache audio files:', error)
  }
}

async function clearCache(cacheName) {
  try {
    console.log('🗑️ Clearing cache:', cacheName)

    if (cacheName) {
      await caches.delete(cacheName)
    } else {
      // Clear all caches
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
    }

    console.log('✅ Cache cleared successfully')
  } catch (error) {
    console.error('❌ Failed to clear cache:', error)
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

async function getOfflineUserData() {
  // This would integrate with IndexedDB to get offline user data
  return []
}

async function clearOfflineUserData() {
  // This would clear IndexedDB user data
}

async function getOfflineAnalyticsData() {
  // This would get offline analytics data
  return []
}

async function clearOfflineAnalyticsData() {
  // This would clear offline analytics data
}

async function sendUserDataToServer(data) {
  // This would send user data to your server
  return Promise.resolve()
}

async function sendAnalyticsToServer(data) {
  // This would send analytics data to your analytics service
  return Promise.resolve()
}

// ============================================================================
// Error Handling
// ============================================================================

self.addEventListener('error', (event) => {
  console.error('❌ Service Worker error:', event.error)

  // Report error to monitoring service
  if (self.registration) {
    self.registration.pushManager.getSubscription().then(subscription => {
      if (subscription) {
        // Report error to server
        fetch('/api/sw-error', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            error: event.error.message,
            stack: event.error.stack,
            timestamp: new Date().toISOString(),
            subscription: subscription.endpoint
          })
        }).catch(() => {
          // Ignore reporting errors
        })
      }
    })
  }
})

console.log('🔧 Service Worker loaded successfully')