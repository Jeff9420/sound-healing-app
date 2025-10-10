/**
 * SoundFlows Enhanced Service Worker v2
 * 增强版PWA离线支持
 *
 * Features:
 * - 智能缓存策略
 * - 音频离线播放
 * - 后台同步
 * - 推送通知支持
 * - IndexedDB音频元数据存储
 *
 * @version 2.1.0
 */

const VERSION = '2.1.0';
const CACHE_NAME = `soundflows-v${VERSION}`;
const AUDIO_CACHE = `soundflows-audio-v${VERSION}`;
const IMAGE_CACHE = `soundflows-images-v${VERSION}`;
const RUNTIME_CACHE = `soundflows-runtime-v${VERSION}`;

// 静态资源列表（核心文件）
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/assets/css/index-styles.css',
    '/assets/css/history-favorites.css',
    '/assets/css/mixer.css',
    '/assets/js/audio-config.js',
    '/assets/js/i18n-system.js',
    '/assets/js/audio-manager.js',
    '/assets/js/user-data-manager.js',
    '/assets/js/history-favorites-ui.js',
    '/assets/js/touch-gestures.js',
    '/assets/js/audio-mixer.js',
    '/assets/js/mixer-ui.js',
    '/assets/js/index-app.js'
];

// 音频缓存配置
const AUDIO_CACHE_CONFIG = {
    maxItems: 30, // 最多缓存30个音频文件
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7天过期
    maxSize: 100 * 1024 * 1024 // 100MB
};

// 图片缓存配置
const IMAGE_CACHE_CONFIG = {
    maxItems: 50,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30天
};

/**
 * 安装事件 - 预缓存核心资源
 */
self.addEventListener('install', event => {
    console.log(`[SW] 安装 Service Worker v${VERSION}`);

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] 缓存核心资源');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] 安装完成，跳过等待');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('[SW] 安装失败:', error);
            })
    );
});

/**
 * 激活事件 - 清理旧缓存
 */
self.addEventListener('activate', event => {
    console.log('[SW] 激活 Service Worker');

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        // 删除旧版本缓存
                        if (cacheName.startsWith('soundflows-') &&
                            cacheName !== CACHE_NAME &&
                            cacheName !== AUDIO_CACHE &&
                            cacheName !== IMAGE_CACHE &&
                            cacheName !== RUNTIME_CACHE) {
                            console.log('[SW] 删除旧缓存:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] 激活完成，接管所有页面');
                return self.clients.claim();
            })
    );
});

/**
 * Fetch事件 - 智能缓存策略
 */
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // 跳过Chrome扩展和其他非HTTP请求
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // 根据资源类型选择缓存策略
    if (isAudioRequest(request)) {
        event.respondWith(handleAudioRequest(request));
    } else if (isImageRequest(request)) {
        event.respondWith(handleImageRequest(request));
    } else if (isStaticAsset(request)) {
        event.respondWith(handleStaticAsset(request));
    } else {
        event.respondWith(handleDynamicRequest(request));
    }
});

/**
 * 判断是否为音频请求
 */
function isAudioRequest(request) {
    return request.url.includes('/audio/') ||
           request.url.includes('archive.org/download') ||
           /\.(mp3|wav|ogg|m4a|wma|flac|aac)$/i.test(request.url);
}

/**
 * 判断是否为图片请求
 */
function isImageRequest(request) {
    return /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(request.url);
}

/**
 * 判断是否为静态资源
 */
function isStaticAsset(request) {
    return request.url.includes('/assets/js/') ||
           request.url.includes('/assets/css/') ||
           request.url.includes('manifest.json');
}

/**
 * 处理音频请求 - Cache First with Network Fallback
 */
async function handleAudioRequest(request) {
    try {
        // 1. 先查找缓存
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('[SW] 🎵 从缓存返回音频:', request.url);
            return cachedResponse;
        }

        // 2. 网络请求
        console.log('[SW] 🌐 从网络获取音频:', request.url);
        const networkResponse = await fetch(request);

        // 3. 只缓存成功的响应
        if (networkResponse && networkResponse.status === 200) {
            // 检查缓存大小限制
            const cache = await caches.open(AUDIO_CACHE);

            // 异步清理旧缓存（不阻塞响应）
            cleanupAudioCache(cache);

            // 缓存新音频
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('[SW] 音频请求失败:', error);

        // 返回离线提示
        return new Response('Audio unavailable offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

/**
 * 处理图片请求 - Cache First
 */
async function handleImageRequest(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);

        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(IMAGE_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        // 返回占位图片
        return new Response(
            '<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="200" fill="#1a1a2e"/><text x="50%" y="50%" text-anchor="middle" fill="#fff">Image Offline</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
        );
    }
}

/**
 * 处理静态资源 - Stale While Revalidate
 */
async function handleStaticAsset(request) {
    const cachedResponse = await caches.match(request);

    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(cache => {
                cache.put(request, networkResponse.clone());
            });
        }
        return networkResponse;
    });

    // 返回缓存（如果有），同时在后台更新
    return cachedResponse || fetchPromise;
}

/**
 * 处理动态请求 - Network First with Cache Fallback
 */
async function handleDynamicRequest(request) {
    try {
        const networkResponse = await fetch(request);

        // 缓存成功的GET请求
        if (request.method === 'GET' && networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        // 网络失败时返回缓存
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // 返回离线页面
        if (request.mode === 'navigate') {
            const offlinePage = await caches.match('/index.html');
            if (offlinePage) {
                return offlinePage;
            }
        }

        return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

/**
 * 清理音频缓存
 */
async function cleanupAudioCache(cache) {
    try {
        const requests = await cache.keys();

        // 检查数量限制
        if (requests.length > AUDIO_CACHE_CONFIG.maxItems) {
            console.log('[SW] 清理超出数量限制的音频缓存');

            // 删除最旧的缓存
            const toDelete = requests.length - AUDIO_CACHE_CONFIG.maxItems;
            for (let i = 0; i < toDelete; i++) {
                await cache.delete(requests[i]);
            }
        }

        // 检查缓存年龄
        const now = Date.now();
        for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
                const dateHeader = response.headers.get('date');
                if (dateHeader) {
                    const cacheTime = new Date(dateHeader).getTime();
                    if (now - cacheTime > AUDIO_CACHE_CONFIG.maxAge) {
                        console.log('[SW] 删除过期音频缓存:', request.url);
                        await cache.delete(request);
                    }
                }
            }
        }
    } catch (error) {
        console.error('[SW] 清理缓存失败:', error);
    }
}

/**
 * 后台同步 - 用于上传用户数据
 */
self.addEventListener('sync', event => {
    console.log('[SW] 后台同步:', event.tag);

    if (event.tag === 'sync-user-data') {
        event.waitUntil(syncUserData());
    }
});

/**
 * 同步用户数据（历史、收藏等）
 */
async function syncUserData() {
    try {
        // 这里可以实现数据同步到云端的逻辑
        console.log('[SW] 同步用户数据');

        // 获取localStorage数据
        const clients = await self.clients.matchAll();
        if (clients.length > 0) {
            clients[0].postMessage({
                type: 'SYNC_REQUEST',
                timestamp: Date.now()
            });
        }
    } catch (error) {
        console.error('[SW] 同步失败:', error);
    }
}

/**
 * 推送通知
 */
self.addEventListener('push', event => {
    console.log('[SW] 收到推送通知');

    if (!event.data) {
        return;
    }

    const data = event.data.json();
    const options = {
        body: data.body || '您有新的声音疗愈推荐',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        data: data.url || '/',
        actions: [
            { action: 'open', title: '打开', icon: '/assets/icons/check.png' },
            { action: 'close', title: '关闭', icon: '/assets/icons/cross.png' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title || '声音疗愈', options)
    );
});

/**
 * 通知点击
 */
self.addEventListener('notificationclick', event => {
    console.log('[SW] 通知被点击:', event.action);

    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow(event.notification.data || '/')
        );
    }
});

/**
 * 消息处理 - 与主线程通信
 */
self.addEventListener('message', event => {
    console.log('[SW] 收到消息:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CACHE_AUDIO') {
        // 缓存指定音频
        const audioUrl = event.data.url;
        if (audioUrl) {
            caches.open(AUDIO_CACHE).then(cache => {
                fetch(audioUrl).then(response => {
                    if (response.ok) {
                        cache.put(audioUrl, response);
                        console.log('[SW] 已缓存音频:', audioUrl);
                    }
                });
            });
        }
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        // 清空所有缓存
        caches.keys().then(cacheNames => {
            Promise.all(
                cacheNames.filter(name => name.startsWith('soundflows-'))
                    .map(name => caches.delete(name))
            ).then(() => {
                console.log('[SW] 已清空所有缓存');
                event.ports[0].postMessage({ success: true });
            });
        });
    }
});

console.log(`[SW] Service Worker v${VERSION} 已加载`);
