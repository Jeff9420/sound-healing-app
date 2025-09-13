/**
 * 基础Service Worker
 * 声音疗愈应用基础缓存系统（降级方案）
 * 
 * @author Claude Code Performance Optimization
 * @version 1.0
 */

const CACHE_NAME = 'sound-healing-basic-v1.0';

// 基础缓存文件
const CACHE_FILES = [
    '/',
    '/index.html',
    '/assets/css/main.css',
    '/assets/css/playlist.css',
    '/assets/js/audio-config.js',
    '/assets/js/module-loader.js',
    '/assets/js/i18n-system.js',
    '/assets/js/audio-manager.js'
];

// 安装事件
self.addEventListener('install', (event) => {
    console.log('📦 基础SW: Service Worker 安装中...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 基础SW: 开始缓存基础文件...');
                return cache.addAll(CACHE_FILES);
            })
            .then(() => {
                console.log('✅ 基础SW: 基础缓存完成');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.warn('⚠️ 基础SW: 部分文件缓存失败，继续运行', error);
            })
    );
});

// 激活事件
self.addEventListener('activate', (event) => {
    console.log('🔄 基础SW: Service Worker 激活中...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🧹 基础SW: 清理旧缓存', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ 基础SW: Service Worker 激活完成');
            return self.clients.claim();
        })
    );
});

// 请求拦截
self.addEventListener('fetch', (event) => {
    // 只处理GET请求
    if (event.request.method !== 'GET') {
        return;
    }
    
    const url = new URL(event.request.url);
    
    // 音频文件不缓存（避免占用过多空间）
    if (url.pathname.includes('/assets/audio/') || url.hostname === 'archive.org') {
        return;
    }
    
    // 使用网络优先策略
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // 如果网络请求成功，缓存静态资源
                if (response.ok && isStaticResource(url.pathname)) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseClone);
                        })
                        .catch(() => {
                            // 缓存失败不影响正常功能
                        });
                }
                return response;
            })
            .catch(() => {
                // 网络失败时尝试从缓存获取
                return caches.match(event.request)
                    .then((response) => {
                        if (response) {
                            return response;
                        }
                        
                        // 页面请求失败时返回首页
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        
                        throw new Error('缓存中没有找到对应资源');
                    });
            })
    );
});

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
           pathname.endsWith('.ico');
}

console.log('📦 基础SW: Service Worker 脚本加载完成');