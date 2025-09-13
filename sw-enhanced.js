/**
 * 增强版Service Worker v2.0
 * 声音疗愈应用缓存系统
 * 
 * @author Claude Code Performance Optimization
 * @version 2.0
 */

const CACHE_NAME = 'sound-healing-v2.0';
const CACHE_VERSION = '2.0';

// 核心文件（必须缓存）
const CORE_CACHE_FILES = [
    '/',
    '/index.html',
    '/assets/css/main.css',
    '/assets/css/playlist.css',
    '/assets/css/gpu-optimized-animations.css',
    '/assets/js/audio-config.js',
    '/assets/js/module-loader.js',
    '/assets/js/i18n-system.js',
    '/assets/js/language-integration.js',
    '/assets/js/audio-manager.js',
    '/assets/js/cache-manager.js',
    '/assets/js/audio-lazy-loader.js'
];

// 音频缓存配置
const AUDIO_CACHE_CONFIG = {
    maxCacheSize: 100 * 1024 * 1024, // 100MB 音频缓存限制
    maxCacheAge: 7 * 24 * 60 * 60 * 1000, // 7天过期
    cacheName: `${CACHE_NAME}-audio`
};

// 性能统计
let performanceStats = {
    cacheHits: 0,
    cacheMisses: 0,
    audioServed: 0,
    lastCleanup: Date.now()
};

// Service Worker事件监听器
self.addEventListener('install', (event) => {
    console.log('🚀 SW v2.0: Service Worker 安装中...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('✅ SW v2.0: 开始缓存核心文件...');
                return cache.addAll(CORE_CACHE_FILES);
            })
            .then(() => {
                console.log('✅ SW v2.0: 核心文件缓存完成');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ SW v2.0: 安装失败', error);
            })
    );
});

self.addEventListener('activate', (event) => {
    console.log('🔄 SW v2.0: Service Worker 激活中...');
    
    event.waitUntil(
        Promise.all([
            // 清理旧缓存
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== AUDIO_CACHE_CONFIG.cacheName) {
                            console.log('🧹 SW v2.0: 清理旧缓存', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // 声明控制权
            self.clients.claim()
        ]).then(() => {
            console.log('✅ SW v2.0: Service Worker 激活完成');
        })
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // 音频文件处理（外部Archive.org文件）
    if (url.pathname.includes('/assets/audio/') || url.hostname === 'archive.org') {
        event.respondWith(handleAudioRequest(event.request));
        return;
    }
    
    // API请求处理
    if (url.pathname.startsWith('/api/audio/')) {
        event.respondWith(handleApiAudioRequest(event.request));
        return;
    }
    
    // 静态资源缓存策略
    if (isStaticResource(url.pathname)) {
        event.respondWith(handleStaticResource(event.request));
        return;
    }
    
    // 页面请求处理
    if (event.request.mode === 'navigate') {
        event.respondWith(handlePageRequest(event.request));
        return;
    }
    
    // 默认网络优先策略
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});

/**
 * 处理音频请求（缓存优先策略）
 */
async function handleAudioRequest(request) {
    try {
        const audioCache = await caches.open(AUDIO_CACHE_CONFIG.cacheName);
        const cachedResponse = await audioCache.match(request);
        
        if (cachedResponse) {
            performanceStats.cacheHits++;
            performanceStats.audioServed++;
            return cachedResponse;
        }
        
        // 网络获取
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok && networkResponse.status === 200) {
            // 检查缓存大小
            await manageCacheSize(audioCache);
            
            // 缓存新音频文件
            audioCache.put(request, networkResponse.clone());
            performanceStats.cacheMisses++;
            performanceStats.audioServed++;
        }
        
        return networkResponse;
        
    } catch (error) {
        console.warn('SW v2.0: 音频请求失败', error);
        performanceStats.cacheMisses++;
        throw error;
    }
}

/**
 * 处理API音频请求（代理到Archive.org）
 */
async function handleApiAudioRequest(request) {
    // 这些请求会通过Vercel rewrites重定向到Archive.org
    // 直接转发到网络
    return fetch(request);
}

/**
 * 处理静态资源（缓存优先）
 */
async function handleStaticResource(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
}

/**
 * 处理页面请求
 */
async function handlePageRequest(request) {
    try {
        return await fetch(request);
    } catch (error) {
        // 离线时返回缓存的首页
        const cache = await caches.open(CACHE_NAME);
        return await cache.match('/index.html');
    }
}

/**
 * 判断是否为静态资源
 */
function isStaticResource(pathname) {
    return pathname.includes('/assets/') || 
           pathname.endsWith('.css') || 
           pathname.endsWith('.js') || 
           pathname.endsWith('.png') || 
           pathname.endsWith('.jpg') || 
           pathname.endsWith('.svg') || 
           pathname.endsWith('.ico');
}

/**
 * 管理音频缓存大小
 */
async function manageCacheSize(audioCache) {
    const now = Date.now();
    
    // 每小时检查一次缓存大小
    if (now - performanceStats.lastCleanup < 60 * 60 * 1000) {
        return;
    }
    
    const keys = await audioCache.keys();
    let totalSize = 0;
    const cacheEntries = [];
    
    // 估算缓存大小
    for (const key of keys) {
        const response = await audioCache.match(key);
        if (response) {
            const size = parseInt(response.headers.get('content-length') || '3000000'); // 默认3MB
            const lastModified = response.headers.get('date') || response.headers.get('last-modified');
            const timestamp = lastModified ? new Date(lastModified).getTime() : now;
            
            cacheEntries.push({ key, size, timestamp });
            totalSize += size;
        }
    }
    
    // 如果超过限制，删除最旧的文件
    if (totalSize > AUDIO_CACHE_CONFIG.maxCacheSize) {
        cacheEntries.sort((a, b) => a.timestamp - b.timestamp);
        
        let deletedSize = 0;
        const targetSize = AUDIO_CACHE_CONFIG.maxCacheSize * 0.8; // 删除到80%
        
        for (const entry of cacheEntries) {
            if (totalSize - deletedSize <= targetSize) break;
            
            await audioCache.delete(entry.key);
            deletedSize += entry.size;
            console.log(`🧹 SW v2.0: 清理过期音频缓存: ${entry.key.url}`);
        }
        
        console.log(`✅ SW v2.0: 缓存清理完成，释放 ${(deletedSize / 1024 / 1024).toFixed(2)}MB`);
    }
    
    performanceStats.lastCleanup = now;
}

// 消息处理（与主线程通信）
self.addEventListener('message', (event) => {
    const { type, data } = event.data;
    
    switch (type) {
        case 'PERFORMANCE_REPORT':
            event.ports[0].postMessage({
                type: 'PERFORMANCE_DATA',
                data: {
                    ...performanceStats,
                    version: CACHE_VERSION,
                    uptime: Date.now() - performanceStats.lastCleanup
                }
            });
            break;
            
        case 'CLEAR_CACHE':
            clearAllCaches().then(() => {
                event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
            });
            break;
            
        default:
            console.log('SW v2.0: 未知消息类型', type);
    }
});

/**
 * 清理所有缓存
 */
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    await Promise.all(
        cacheNames.map(cacheName => {
            console.log('🧹 SW v2.0: 清理缓存', cacheName);
            return caches.delete(cacheName);
        })
    );
    
    // 重置统计
    performanceStats = {
        cacheHits: 0,
        cacheMisses: 0,
        audioServed: 0,
        lastCleanup: Date.now()
    };
    
    console.log('✅ SW v2.0: 所有缓存已清理');
}

console.log('🚀 SW v2.0: Service Worker 脚本加载完成');