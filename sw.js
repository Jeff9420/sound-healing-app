/**
 * Service Worker - 声音疗愈应用离线缓存策略
 */

const CACHE_VERSION = '1.0.0';
const CACHE_NAME = `sound-healing-cache-v${CACHE_VERSION}`;
const AUDIO_CACHE_NAME = `sound-healing-audio-v${CACHE_VERSION}`;

// 核心资源列表
const CORE_ASSETS = [
    '/',
    '/index-optimized.html',
    '/assets/css/main.css',
    '/assets/js/module-loader.js',
    '/assets/js/audio-config.js'
];

// 安装事件
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(CORE_ASSETS);
        })
    );
});

// 激活事件
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// 请求拦截
self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('.mp3')) {
        event.respondWith(handleAudioRequest(event.request));
    } else {
        event.respondWith(handleStaticRequest(event.request));
    }
});

// 音频请求处理
async function handleAudioRequest(request) {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) return cachedResponse;
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        return cachedResponse || new Response('离线', { status: 503 });
    }
}

// 静态资源处理
async function handleStaticRequest(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) return cachedResponse;
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        return cachedResponse || new Response('离线', { status: 503 });
    }
}