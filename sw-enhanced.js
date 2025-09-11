/**
 * Enhanced Service Worker - 外部存储和离线优化
 * 支持Archive.org外部存储的智能缓存和离线回退
 */

const CACHE_VERSION = '2.0.0';
const STATIC_CACHE = `sound-healing-static-v${CACHE_VERSION}`;
const AUDIO_CACHE = `sound-healing-audio-v${CACHE_VERSION}`;
const ARCHIVE_CACHE = `sound-healing-archive-v${CACHE_VERSION}`;
const RUNTIME_CACHE = `sound-healing-runtime-v${CACHE_VERSION}`;

// 缓存配置
const CACHE_CONFIG = {
    maxAudioCacheSize: 200 * 1024 * 1024, // 200MB
    maxStaticCacheSize: 50 * 1024 * 1024,  // 50MB
    audioRetentionDays: 30,
    staticRetentionDays: 7,
    maxRetries: 3,
    retryDelay: 1000
};

// 核心静态资源
const CORE_STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/assets/css/main.css',
    '/assets/css/playlist.css',
    '/assets/js/module-loader.js',
    '/assets/js/audio-config.js',
    '/assets/js/intelligent-preloader-enhanced.js',
    '/assets/js/enhanced-cache-manager.js',
    '/assets/js/memory-optimizer.js',
    '/assets/js/user-experience-enhancer.js',
    '/assets/js/network-monitor.js',
    '/assets/js/external-storage-ui.js',
    '/assets/js/mobile-touch-optimizer.js'
];

// Archive.org 域名配置
const EXTERNAL_DOMAINS = [
    'archive.org',
    'ia600008.us.archive.org',
    'ia800008.us.archive.org',
    'ia900008.us.archive.org'
];

// 全局状态
let networkStatus = 'unknown';
let cacheStats = {
    audioHits: 0,
    audioMisses: 0,
    staticHits: 0,
    staticMisses: 0
};

/**
 * Service Worker 安装
 */
self.addEventListener('install', (event) => {
    console.log('🔧 Enhanced Service Worker 安装中...');
    
    event.waitUntil(
        Promise.all([
            caches.open(STATIC_CACHE).then(cache => {
                return cache.addAll(CORE_STATIC_ASSETS);
            }),
            caches.open(AUDIO_CACHE),
            caches.open(ARCHIVE_CACHE),
            caches.open(RUNTIME_CACHE)
        ]).then(() => {
            console.log('✅ 核心资源预缓存完成');
            return self.skipWaiting();
        })
    );
});

/**
 * Service Worker 激活
 */
self.addEventListener('activate', (event) => {
    console.log('🚀 Enhanced Service Worker 激活中...');
    
    event.waitUntil(
        Promise.all([
            cleanupOldCaches(),
            self.clients.claim()
        ]).then(() => {
            console.log('✅ Enhanced Service Worker 已激活');
            broadcastToClients({ type: 'sw-ready', version: CACHE_VERSION });
        })
    );
});

/**
 * 网络请求拦截
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    if (request.method !== 'GET') {
        return;
    }
    
    if (isAudioRequest(request)) {
        event.respondWith(handleAudioRequest(request));
    } else if (isExternalDomain(url.hostname)) {
        event.respondWith(handleExternalRequest(request));
    } else if (isStaticAsset(request)) {
        event.respondWith(handleStaticRequest(request));
    } else {
        event.respondWith(handleRuntimeRequest(request));
    }
});

/**
 * 消息处理
 */
self.addEventListener('message', (event) => {
    const { type, data } = event.data;
    
    switch (type) {
        case 'CACHE_AUDIO':
            handleCacheAudioMessage(data, event);
            break;
        case 'GET_CACHE_STATS':
            event.ports[0].postMessage(getCacheStats());
            break;
        case 'CLEAR_CACHE':
            clearSpecificCache(data.cacheType).then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;
        case 'UPDATE_NETWORK_STATUS':
            networkStatus = data.status;
            break;
    }
});

/**
 * 判断是否为音频请求
 */
function isAudioRequest(request) {
    const url = request.url.toLowerCase();
    return url.includes('.mp3') || url.includes('.wav') || url.includes('.ogg');
}

/**
 * 判断是否为外部域名
 */
function isExternalDomain(hostname) {
    return EXTERNAL_DOMAINS.some(domain => hostname.includes(domain));
}

/**
 * 判断是否为静态资源
 */
function isStaticAsset(request) {
    const url = request.url.toLowerCase();
    return url.includes('.css') || url.includes('.js') || url.includes('.html');
}

/**
 * 处理音频请求
 */
async function handleAudioRequest(request) {
    const cacheName = isExternalDomain(new URL(request.url).hostname) ? ARCHIVE_CACHE : AUDIO_CACHE;
    
    try {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            cacheStats.audioHits++;
            return cachedResponse;
        }
        
        cacheStats.audioMisses++;
        const networkResponse = await fetchWithRetry(request, CACHE_CONFIG.maxRetries);
        
        if (networkResponse && networkResponse.ok) {
            cache.put(request, networkResponse.clone()).catch(err => {
                console.warn('音频缓存失败:', err);
            });
            return networkResponse;
        }
        
        return createOfflineAudioResponse();
        
    } catch (error) {
        console.error('音频请求处理失败:', error);
        return createErrorResponse(error);
    }
}

/**
 * 处理外部存储请求
 */
async function handleExternalRequest(request) {
    try {
        const networkResponse = await fetchWithRetry(request, 2);
        
        if (networkResponse && networkResponse.ok) {
            const cache = await caches.open(ARCHIVE_CACHE);
            cache.put(request, networkResponse.clone()).catch(err => {
                console.warn('外部资源缓存失败:', err);
            });
            return networkResponse;
        }
        
        const cache = await caches.open(ARCHIVE_CACHE);
        const cachedResponse = await cache.match(request);
        
        return cachedResponse || createOfflineResponse();
        
    } catch (error) {
        console.error('外部请求处理失败:', error);
        return createErrorResponse(error);
    }
}

/**
 * 处理静态资源请求
 */
async function handleStaticRequest(request) {
    try {
        const cache = await caches.open(STATIC_CACHE);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            cacheStats.staticHits++;
            return cachedResponse;
        }
        
        cacheStats.staticMisses++;
        const networkResponse = await fetch(request);
        
        if (networkResponse && networkResponse.ok) {
            cache.put(request, networkResponse.clone()).catch(err => {
                console.warn('静态资源缓存失败:', err);
            });
        }
        
        return networkResponse;
        
    } catch (error) {
        console.error('静态资源请求失败:', error);
        return createErrorResponse(error);
    }
}

/**
 * 处理运行时请求
 */
async function handleRuntimeRequest(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse && networkResponse.ok) {
            if (shouldCacheRuntimeResponse(request)) {
                const cache = await caches.open(RUNTIME_CACHE);
                cache.put(request, networkResponse.clone()).catch(err => {
                    console.warn('运行时缓存失败:', err);
                });
            }
            return networkResponse;
        }
        
        const cache = await caches.open(RUNTIME_CACHE);
        const cachedResponse = await cache.match(request);
        
        return cachedResponse || createOfflineResponse();
        
    } catch (error) {
        console.error('运行时请求失败:', error);
        const cache = await caches.open(RUNTIME_CACHE);
        const cachedResponse = await cache.match(request);
        return cachedResponse || createErrorResponse(error);
    }
}

/**
 * 带重试的fetch请求
 */
async function fetchWithRetry(request, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(request);
            if (response.ok) {
                return response;
            }
            if (response.status >= 400 && response.status < 500) {
                return response;
            }
        } catch (error) {
            if (i === maxRetries - 1) {
                throw error;
            }
        }
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
}

/**
 * 判断是否应该缓存运行时响应
 */
function shouldCacheRuntimeResponse(request) {
    const url = request.url.toLowerCase();
    return url.includes('/api/') || url.includes('.json') || url.includes('metadata');
}

/**
 * 创建离线音频响应
 */
function createOfflineAudioResponse() {
    return new Response('离线模式：音频文件不可用', {
        status: 503,
        statusText: 'Service Unavailable - Offline',
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-cache'
        }
    });
}

/**
 * 创建离线响应
 */
function createOfflineResponse() {
    const offlineHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>离线模式</title>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .offline-message { background: #f0f0f0; padding: 20px; border-radius: 8px; }
            </style>
        </head>
        <body>
            <div class="offline-message">
                <h2>🔌 离线模式</h2>
                <p>您当前处于离线状态，请检查网络连接后重试。</p>
                <button onclick="window.location.reload()">重新加载</button>
            </div>
        </body>
        </html>
    `;
    
    return new Response(offlineHTML, {
        status: 503,
        statusText: 'Service Unavailable - Offline',
        headers: { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' }
    });
}

/**
 * 创建错误响应
 */
function createErrorResponse(error) {
    const errorHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>请求错误</title>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .error-message { background: #ffe6e6; padding: 20px; border-radius: 8px; color: #d63031; }
            </style>
        </head>
        <body>
            <div class="error-message">
                <h2>❌ 请求错误</h2>
                <p>请求处理时发生错误：${error.message}</p>
                <button onclick="window.location.reload()">重新加载</button>
            </div>
        </body>
        </html>
    `;
    
    return new Response(errorHTML, {
        status: 500,
        statusText: 'Internal Server Error',
        headers: { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' }
    });
}

/**
 * 清理旧版本缓存
 */
async function cleanupOldCaches() {
    const cacheNames = await caches.keys();
    const currentCaches = [STATIC_CACHE, AUDIO_CACHE, ARCHIVE_CACHE, RUNTIME_CACHE];
    
    const deletePromises = cacheNames
        .filter(name => !currentCaches.includes(name))
        .map(name => caches.delete(name));
    
    await Promise.all(deletePromises);
    console.log('🧹 旧版本缓存已清理');
}

/**
 * 处理缓存音频消息
 */
async function handleCacheAudioMessage(data, event) {
    try {
        const { url } = data;
        const request = new Request(url);
        const cacheName = isExternalDomain(new URL(url).hostname) ? ARCHIVE_CACHE : AUDIO_CACHE;
        const cache = await caches.open(cacheName);
        
        const response = await fetchWithRetry(request);
        if (response && response.ok) {
            await cache.put(request, response);
            event.ports[0].postMessage({ success: true, url });
        } else {
            event.ports[0].postMessage({ success: false, url, error: 'Network error' });
        }
    } catch (error) {
        event.ports[0].postMessage({ success: false, url: data.url, error: error.message });
    }
}

/**
 * 获取缓存统计
 */
async function getCacheStats() {
    const stats = { ...cacheStats };
    
    try {
        const cacheNames = [STATIC_CACHE, AUDIO_CACHE, ARCHIVE_CACHE, RUNTIME_CACHE];
        
        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const requests = await cache.keys();
            stats[cacheName] = { items: requests.length };
        }
    } catch (error) {
        console.warn('获取缓存统计失败:', error);
    }
    
    return stats;
}

/**
 * 清理特定缓存
 */
async function clearSpecificCache(cacheType) {
    const cacheNames = {
        'static': STATIC_CACHE,
        'audio': AUDIO_CACHE,
        'archive': ARCHIVE_CACHE,
        'runtime': RUNTIME_CACHE,
        'all': null
    };
    
    if (cacheType === 'all') {
        const allCaches = await caches.keys();
        await Promise.all(allCaches.map(name => caches.delete(name)));
    } else {
        const cacheName = cacheNames[cacheType];
        if (cacheName) {
            await caches.delete(cacheName);
        }
    }
}

/**
 * 广播消息给所有客户端
 */
async function broadcastToClients(message) {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
        client.postMessage(message);
    });
}

console.log('🚀 Enhanced Service Worker 已加载');
