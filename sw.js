/**
 * SoundFlows Service Worker - PWA功能支持
 * 离线缓存、后台同步、推送通知、音频预加载
 * @version 2.2.0 - 修复Response.clone()错误
 */

const CACHE_NAME = 'soundflows-v2.2';
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/css/main.css',
  '/assets/css/playlist.css',
  '/assets/css/mobile-enhancement.css',
  '/assets/js/audio-config.js',
  '/assets/js/module-loader.js',
  '/assets/js/i18n-system.js',
  '/assets/js/audio-manager.js',
  '/assets/js/playlist-ui.js',
  '/assets/js/background-scene-manager.js',
  '/assets/js/ui-controller.js',
  '/assets/js/theme-manager.js',
  '/assets/js/mobile-optimization.js',
  '/assets/js/performance-monitor.js',
  '/assets/js/sleep-timer.js',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png'
];

// 精选音频文件预加载列表
// 注意：所有音频已迁移至Archive.org CDN，无需预加载本地文件
const FEATURED_AUDIO = [];

// 安装Service Worker
self.addEventListener('install', event => {
  console.log('📦 SoundFlows SW: 安装中...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 SoundFlows SW: 缓存静态资源...');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        // 音频预加载已禁用 - 所有音频使用Archive.org CDN
        console.log('ℹ️ SoundFlows SW: 音频预加载已禁用（使用CDN）');
      })
      .then(() => {
        console.log('✅ SoundFlows SW: 安装完成');
        return self.skipWaiting();
      })
      .catch(error => {
        console.warn('⚠️ SoundFlows SW: 安装过程中有错误，但继续运行', error);
      })
  );
});

// 激活Service Worker
self.addEventListener('activate', event => {
  console.log('🔄 SoundFlows SW: 激活中...');

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // 保留当前版本和精选音频缓存
          if (cacheName !== CACHE_NAME &&
              cacheName !== 'featured-audio-v1' &&
              !cacheName.startsWith('dynamic-audio-')) {
            console.log('🧹 SoundFlows SW: 清理旧缓存', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ SoundFlows SW: 激活完成');
      return self.clients.claim();
    })
  );
});

// 智能缓存策略
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 处理音频文件请求
  if (url.pathname.endsWith('.mp3') || url.pathname.endsWith('.wav') || url.pathname.endsWith('.ogg')) {
    event.respondWith(handleAudioRequest(event.request));
    return;
  }

  // 处理静态资源请求 - 缓存优先策略
  if (isStaticResource(url.pathname)) {
    event.respondWith(handleStaticRequest(event.request));
    return;
  }

  // 其他请求使用网络优先策略
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});

// 处理音频请求
async function handleAudioRequest(request) {
  const cache = await caches.open('featured-audio-v1');
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // ✅ 修复: 先clone再使用，避免Response body already used错误
      const contentLength = networkResponse.headers.get('content-length');
      if (contentLength && parseInt(contentLength) < 5 * 1024 * 1024) {
        // Clone BEFORE reading the response
        const responseClone = networkResponse.clone();
        // 使用await确保缓存操作完成
        const dynamicCache = await caches.open('dynamic-audio-v1');
        await dynamicCache.put(request, responseClone).catch(err => {
          console.warn('⚠️ 音频缓存失败:', err);
        });
      }
      return networkResponse;
    }
    return networkResponse;
  } catch (error) {
    // 网络失败，尝试从动态缓存获取
    const dynamicCache = await caches.open('dynamic-audio-v1');
    const fallback = await dynamicCache.match(request);
    return fallback || new Response('', { status: 404 });
  }
}

// 处理静态资源请求
async function handleStaticRequest(request) {
  const cached = await caches.match(request);

  if (cached) {
    // ✅ 后台更新缓存 - 修复clone时序问题
    fetch(request)
      .then(response => {
        if (response.ok) {
          // Clone BEFORE using the response
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone).catch(err => {
              console.warn('⚠️ 后台缓存更新失败:', err);
            });
          });
        }
      })
      .catch(() => {});

    return cached;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // ✅ Clone BEFORE using the response
      const responseClone = networkResponse.clone();
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, responseClone).catch(err => {
        console.warn('⚠️ 静态资源缓存失败:', err);
      });
    }
    return networkResponse;
  } catch (error) {
    // 页面请求失败时返回首页
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }
    throw new Error('资源加载失败');
  }
}

/**
 * 判断是否为静态资源
 */
function isStaticResource(pathname) {
  return pathname.includes('/assets/') ||
         pathname.endsWith('.css') ||
         pathname.endsWith('.js') ||
         pathname.endsWith('.html') ||
         pathname === '/' ||
         pathname.endsWith('.png') ||
         pathname.endsWith('.jpg') ||
         pathname.endsWith('.svg') ||
         pathname.endsWith('.ico') ||
         pathname.endsWith('.json');
}

// 后台同步
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// 推送通知
self.addEventListener('push', event => {
  const options = {
    body: 'Time for your sound healing session',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'play',
        title: 'Play Now',
        icon: '/assets/icons/play-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/assets/icons/dismiss-icon.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('SoundFlows Reminder', options)
  );
});

// 通知点击处理
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'play') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 消息处理
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CLEAN_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.filter(name => name.startsWith('dynamic-'))
            .map(name => caches.delete(name))
        );
      })
    );
  }
});

// 后台同步函数
async function doBackgroundSync() {
  try {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE'
      });
    });
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

console.log('📦 SoundFlows SW: Service Worker 加载完成');