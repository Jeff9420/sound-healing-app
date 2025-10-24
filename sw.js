/**
 * SoundFlows Service Worker - PWA功能支持
 * 离线缓存、后台同步、推送通知、音频预加载
 * @version 2.5.0 - 添加pages多语言支持
 */

const CACHE_NAME = 'soundflows-v2.5';
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/privacy-policy.html',
  '/assets/css/main.css',
  '/assets/css/playlist.css',
  '/assets/css/mobile-enhancement.css',
  '/assets/css/index-styles.css',
  '/assets/js/audio-config.js',
  '/assets/js/module-loader.js',
  '/assets/js/i18n-system.js',
  '/assets/js/i18n-translations-addon.js',
  '/assets/js/cookie-consent.js',
  '/assets/js/social-share.js',
  '/assets/js/gdpr-compliance.js',
  '/assets/js/pages-i18n.js',
  '/assets/js/audio-manager.js',
  '/assets/js/playlist-ui.js',
  '/assets/js/background-scene-manager.js',
  '/assets/js/ui-controller.js',
  '/assets/js/theme-manager.js',
  '/assets/js/mobile-optimization.js',
  '/assets/js/performance-monitor.js',
  '/assets/js/sleep-timer.js',
  '/assets/js/pwa-manager.js',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png'
];

// 精选音频文件预加载列表
// 注意：所有音频已迁移至Archive.org CDN，支持离线缓存
const FEATURED_AUDIO = [
  // 每个分类精选2-3个最受欢迎的音频文件用于离线缓存
  'https://archive.org/download/sound-healing-collection/meditation/01-morning-meditation.mp3',
  'https://archive.org/download/sound-healing-collection/meditation/02-deep-relaxation.mp3',
  'https://archive.org/download/sound-healing-collection/rain-sounds/01-gentle-rain.mp3',
  'https://archive.org/download/sound-healing-collection/rain-sounds/02-rain-on-leaves.mp3',
  'https://archive.org/download/sound-healing-collection/singing-bowl-sound/01-root-chakra-bowl.mp3',
  'https://archive.org/download/sound-healing-collection/singing-bowl-sound/02-heart-chakra-bowl.mp3',
  'https://archive.org/download/sound-healing-collection/white-noise/01-pure-white-noise.mp3',
  'https://archive.org/download/sound-healing-collection/white-noise/02-fan-white-noise.mp3'
];

// 运行时缓存名称
const RUNTIME_CACHE = 'soundflows-runtime-v2.5';

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

  // ✅ 跳过外部 API 请求（HubSpot, Zapier, Analytics 等）
  // 让这些请求直接通过，不经过 Service Worker 拦截
  const skipDomains = [
    'api.hsforms.com',
    'hooks.zapier.com',
    'googletagmanager.com',
    'google-analytics.com',
    'clarity.ms',
    'amplitude.com'
  ];

  if (skipDomains.some(domain => url.hostname.includes(domain))) {
    // 直接返回，不拦截
    return;
  }

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
    badge: '/assets/icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'play',
        title: 'Play Now',
        icon: '/assets/icons/icon-96x96.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/assets/icons/icon-72x72.png'
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
  const { type, data } = event.data;

  switch (type) {
    case 'CLEAN_CACHE':
      event.waitUntil(
        caches.keys().then(cacheNames => {
          return Promise.all(
            cacheNames.filter(name => name.startsWith('dynamic-'))
              .map(name => caches.delete(name))
          );
        })
      );
      break;

    case 'DOWNLOAD_FOR_OFFLINE':
      // 下载音频文件以供离线使用
      event.waitUntil(downloadAudioForOffline(data.audioUrls));
      break;

    case 'GET_OFFLINE_AUDIO_LIST':
      // 获取已缓存的音频列表
      event.waitUntil(getOfflineAudioList().then(audioList => {
        event.ports[0].postMessage({ type: 'OFFLINE_AUDIO_LIST', audioList });
      }));
      break;

    case 'REMOVE_OFFLINE_AUDIO':
      // 删除特定的离线音频
      event.waitUntil(removeOfflineAudio(data.audioUrl));
      break;

    case 'GET_CACHE_STATUS':
      // 获取缓存状态信息
      event.waitUntil(getCacheStatus().then(status => {
        event.ports[0].postMessage({ type: 'CACHE_STATUS', status });
      }));
      break;

    case 'PRELOAD_CATEGORY':
      // 预加载整个分类的音频
      event.waitUntil(preloadCategory(data.category, data.audioUrls));
      break;
  }
});

// 下载音频文件以供离线使用
async function downloadAudioForOffline(audioUrls) {
  const cache = await caches.open(RUNTIME_CACHE);
  const results = [];

  try {
    for (const url of audioUrls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response.clone());
          results.push({ url, success: true });
          console.log('✅ 音频已缓存供离线使用:', url);
        } else {
          results.push({ url, success: false, error: 'Download failed' });
        }
      } catch (error) {
        results.push({ url, success: false, error: error.message });
        console.error('❌ 音频缓存失败:', url, error);
      }
    }

    // 通知客户端下载完成
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'AUDIO_DOWNLOAD_COMPLETE',
        results
      });
    });

    return results;
  } catch (error) {
    console.error('❌ 批量下载失败:', error);
    throw error;
  }
}

// 获取已缓存的音频列表
async function getOfflineAudioList() {
  const cache = await caches.open(RUNTIME_CACHE);
  const keys = await cache.keys();
  const audioList = [];

  for (const request of keys) {
    const url = request.url;
    if (url.includes('.mp3') || url.includes('.wav') || url.includes('.ogg')) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        audioList.push({
          url,
          size: blob.size,
          cached: true,
          timestamp: response.headers.get('date') || new Date().toISOString()
        });
      }
    }
  }

  return audioList;
}

// 删除特定的离线音频
async function removeOfflineAudio(audioUrl) {
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    await cache.delete(audioUrl);
    console.log('🗑️ 已删除离线音频:', audioUrl);

    // 通知客户端
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'OFFLINE_AUDIO_REMOVED',
        url: audioUrl
      });
    });

    return true;
  } catch (error) {
    console.error('❌ 删除离线音频失败:', error);
    return false;
  }
}

// 获取缓存状态信息
async function getCacheStatus() {
  const cache = await caches.open(RUNTIME_CACHE);
  const keys = await cache.keys();
  let totalSize = 0;
  let audioCount = 0;

  for (const request of keys) {
    const response = await cache.match(request);
    if (response) {
      const blob = await response.blob();
      totalSize += blob.size;

      if (request.url.includes('.mp3') || request.url.includes('.wav') || request.url.includes('.ogg')) {
        audioCount++;
      }
    }
  }

  return {
    totalSize,
    audioCount,
    totalFiles: keys.length,
    quota: await navigator.storage.estimate().then(estimate => ({
      used: estimate.usage || 0,
      available: estimate.quota || 0
    }))
  };
}

// 预加载整个分类的音频
async function preloadCategory(category, audioUrls) {
  console.log(`📦 开始预加载分类: ${category}`);

  // 限制预加载数量，避免占用过多存储空间
  const maxPreload = 5;
  const urlsToPreload = audioUrls.slice(0, maxPreload);

  const results = await downloadAudioForOffline(urlsToPreload);

  // 通知客户端预加载完成
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'CATEGORY_PRELOAD_COMPLETE',
      category,
      results
    });
  });

  return results;
}

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