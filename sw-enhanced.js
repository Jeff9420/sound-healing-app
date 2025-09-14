/**
 * Enhanced Service Worker for Archive.org External Audio Storage
 * Optimized caching strategy for external audio files and improved performance
 *
 * @author Claude Code Performance Optimization
 * @version 2.0
 */

const CACHE_VERSION = 'v2.0-archive-optimized';
const CACHE_NAMES = {
    STATIC: `sound-healing-static-${CACHE_VERSION}`,
    AUDIO_METADATA: `sound-healing-audio-meta-${CACHE_VERSION}`,
    IMAGES: `sound-healing-images-${CACHE_VERSION}`,
    API_RESPONSES: `sound-healing-api-${CACHE_VERSION}`
};

// Static files to cache
const STATIC_CACHE_FILES = [
    '/',
    '/index.html',
    '/assets/css/main.css',
    '/assets/css/mobile-optimized.css',
    '/assets/css/playlist.css',
    '/assets/css/gpu-optimized-animations.css',
    '/assets/js/audio-config.js',
    '/assets/js/module-loader.js',
    '/assets/js/loading-indicator.js',
    '/assets/js/i18n-system.js',
    '/assets/js/audio-manager.js',
    '/assets/js/ui-controller.js',
    '/assets/js/playlist-ui.js',
    '/assets/js/background-scene-manager.js',
    '/manifest.json'
];

// Audio metadata cache duration (2 hours)
const AUDIO_METADATA_MAX_AGE = 2 * 60 * 60 * 1000;
// Image cache duration (1 week)
const IMAGE_CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
// API response cache duration (30 minutes)
const API_CACHE_MAX_AGE = 30 * 60 * 1000;

// Install event
self.addEventListener('install', (event) => {
    console.log('🚀 Enhanced SW: Installing Service Worker v2.0');

    event.waitUntil(
        Promise.all([
            // Cache static files
            caches.open(CACHE_NAMES.STATIC).then((cache) => {
                console.log('📦 Enhanced SW: Caching static files...');
                return cache.addAll(STATIC_CACHE_FILES);
            }),

            // Initialize other caches
            caches.open(CACHE_NAMES.AUDIO_METADATA),
            caches.open(CACHE_NAMES.IMAGES),
            caches.open(CACHE_NAMES.API_RESPONSES)
        ])
        .then(() => {
            console.log('✅ Enhanced SW: Installation complete');
            return self.skipWaiting();
        })
        .catch((error) => {
            console.warn('⚠️ Enhanced SW: Some files failed to cache:', error);
        })
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('🔄 Enhanced SW: Activating Service Worker v2.0');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Keep current version caches
                    if (!Object.values(CACHE_NAMES).includes(cacheName)) {
                        console.log('🧹 Enhanced SW: Cleaning old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            console.log('✅ Enhanced SW: Activation complete');
            return self.clients.claim();
        })
    );
});

// Fetch event with intelligent routing
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
        return;
    }

    const url = new URL(event.request.url);
    const pathname = url.pathname;

    // Route requests based on type
    if (isArchiveAudioRequest(url)) {
        event.respondWith(handleArchiveAudioRequest(event.request));
    } else if (isVercelApiRequest(url)) {
        event.respondWith(handleVercelApiRequest(event.request));
    } else if (isImageRequest(pathname)) {
        event.respondWith(handleImageRequest(event.request));
    } else if (isStaticResource(pathname)) {
        event.respondWith(handleStaticRequest(event.request));
    } else {
        // Default network-first for everything else
        event.respondWith(networkFirst(event.request, CACHE_NAMES.STATIC));
    }
});

// Handle Archive.org audio requests (network-only with optimization)
async function handleArchiveAudioRequest(request) {
    try {
        console.log('🎵 Enhanced SW: Archive.org audio request:', request.url);

        // Add custom headers for Archive.org optimization
        const enhancedRequest = new Request(request, {
            headers: {
                ...request.headers,
                'Cache-Control': 'public, max-age=3600',
                'Accept-Encoding': 'gzip, deflate, br'
            }
        });

        const response = await fetch(enhancedRequest);

        if (response.ok) {
            // Don't cache audio files (too large), but improve streaming
            const optimizedResponse = new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: {
                    ...response.headers,
                    'Cache-Control': 'public, max-age=3600',
                    'Accept-Ranges': 'bytes'
                }
            });

            console.log('✅ Enhanced SW: Archive.org audio loaded successfully');
            return optimizedResponse;
        }

        return response;

    } catch (error) {
        console.error('❌ Enhanced SW: Archive.org audio failed:', error);

        // Return a helpful error response
        return new Response(JSON.stringify({
            error: 'Audio loading failed',
            message: '音频加载失败，请检查网络连接',
            retry: true
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Handle Vercel API proxy requests
async function handleVercelApiRequest(request) {
    try {
        console.log('🔄 Enhanced SW: Vercel API request:', request.url);

        const response = await fetch(request);

        if (response.ok) {
            // Cache successful API responses briefly
            const cache = await caches.open(CACHE_NAMES.API_RESPONSES);
            const responseClone = response.clone();

            // Add expiration timestamp
            const expiration = Date.now() + API_CACHE_MAX_AGE;
            const enhancedResponse = new Response(responseClone.body, {
                status: responseClone.status,
                statusText: responseClone.statusText,
                headers: {
                    ...responseClone.headers,
                    'sw-cached-at': Date.now().toString(),
                    'sw-expires-at': expiration.toString()
                }
            });

            cache.put(request, enhancedResponse.clone());
            console.log('📦 Enhanced SW: API response cached');
        }

        return response;

    } catch (error) {
        console.log('🔍 Enhanced SW: API network failed, checking cache...');

        // Try cache with expiration check
        const cache = await caches.open(CACHE_NAMES.API_RESPONSES);
        const cached = await cache.match(request);

        if (cached) {
            const expiresAt = cached.headers.get('sw-expires-at');
            if (expiresAt && Date.now() < parseInt(expiresAt)) {
                console.log('✅ Enhanced SW: Serving cached API response');
                return cached;
            } else {
                console.log('🕒 Enhanced SW: Cached API response expired');
                cache.delete(request);
            }
        }

        throw error;
    }
}

// Handle image requests with aggressive caching
async function handleImageRequest(request) {
    return cacheFirst(request, CACHE_NAMES.IMAGES, IMAGE_CACHE_MAX_AGE);
}

// Handle static resource requests
async function handleStaticRequest(request) {
    return networkFirst(request, CACHE_NAMES.STATIC);
}

// Network-first strategy
async function networkFirst(request, cacheName) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;

    } catch (error) {
        console.log('🔍 Enhanced SW: Network failed, trying cache...');

        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('✅ Enhanced SW: Serving from cache');
            return cachedResponse;
        }

        throw error;
    }
}

// Cache-first strategy with expiration
async function cacheFirst(request, cacheName, maxAge) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    if (cached) {
        const cachedAt = cached.headers.get('sw-cached-at');
        if (cachedAt && (Date.now() - parseInt(cachedAt)) < maxAge) {
            console.log('✅ Enhanced SW: Serving from cache (fresh)');
            return cached;
        } else {
            console.log('🕒 Enhanced SW: Cache expired, fetching new...');
            cache.delete(request);
        }
    }

    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const responseWithTimestamp = new Response(networkResponse.body, {
                status: networkResponse.status,
                statusText: networkResponse.statusText,
                headers: {
                    ...networkResponse.headers,
                    'sw-cached-at': Date.now().toString()
                }
            });

            cache.put(request, responseWithTimestamp.clone());
            console.log('📦 Enhanced SW: Cached new response');

            return responseWithTimestamp;
        }

        return networkResponse;

    } catch (error) {
        // If network fails and we have stale cache, use it
        if (cached) {
            console.log('⚠️ Enhanced SW: Using stale cache due to network error');
            return cached;
        }

        throw error;
    }
}

// Utility functions
function isArchiveAudioRequest(url) {
    return url.hostname === 'archive.org' && url.pathname.includes('.mp3');
}

function isVercelApiRequest(url) {
    return url.pathname.startsWith('/api/');
}

function isImageRequest(pathname) {
    return /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(pathname);
}

function isStaticResource(pathname) {
    return /\.(css|js|html|json)$/i.test(pathname) || pathname === '/';
}

// Background sync for offline support
self.addEventListener('sync', (event) => {
    if (event.tag === 'retry-failed-audio') {
        console.log('🔄 Enhanced SW: Retrying failed audio requests...');
        event.waitUntil(retryFailedAudioRequests());
    }
});

async function retryFailedAudioRequests() {
    // Implementation for retrying failed requests when back online
    console.log('🔄 Enhanced SW: Background sync for audio retry');
}

// Message handling for client communication
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CACHE_STATUS') {
        getCacheStatus().then((status) => {
            event.ports[0].postMessage(status);
        });
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        clearAllCaches().then(() => {
            event.ports[0].postMessage({ success: true });
        });
    }
});

async function getCacheStatus() {
    const cacheNames = await caches.keys();
    const status = {};

    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        status[cacheName] = keys.length;
    }

    return status;
}

async function clearAllCaches() {
    const cacheNames = await caches.keys();
    return Promise.all(cacheNames.map(name => caches.delete(name)));
}

console.log('🚀 Enhanced SW: Service Worker script loaded successfully');