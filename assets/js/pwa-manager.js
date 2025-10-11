/**
 * PWA Manager - 渐进式Web应用管理器
 *
 * 功能：
 * - Service Worker注册和更新
 * - 离线状态检测
 * - 安装提示
 * - 缓存管理
 *
 * @class
 * @version 1.0.0
 */

class PWAManager {
    constructor() {
        this.registration = null;
        this.isOnline = navigator.onLine;
        this.deferredPrompt = null;
    }

    /**
     * 初始化PWA功能
     */
    async initialize() {
        // 检查浏览器支持
        if (!('serviceWorker' in navigator)) {
            console.warn('⚠️ 浏览器不支持Service Worker');
            return false;
        }

        try {
            // 注册Service Worker
            await this.registerServiceWorker();

            // 监听网络状态变化
            this.setupNetworkListeners();

            // 监听安装提示
            this.setupInstallPrompt();

            // 检查更新
            this.checkForUpdates();

            console.log('✅ PWA Manager 初始化成功');
            return true;
        } catch (error) {
            console.error('❌ PWA Manager 初始化失败:', error);
            return false;
        }
    }

    /**
     * 注册Service Worker
     */
    async registerServiceWorker() {
        try {
            this.registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });

            console.log('✅ Service Worker 注册成功');

            // 监听更新
            this.registration.addEventListener('updatefound', () => {
                const newWorker = this.registration.installing;

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // 有新版本可用
                        this.showUpdateNotification();
                    }
                });
            });

            return this.registration;
        } catch (error) {
            console.error('Service Worker 注册失败:', error);
            throw error;
        }
    }

    /**
     * 设置网络状态监听
     */
    setupNetworkListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 网络连接已恢复');
            this.showNotification('网络连接已恢复', 'success');

            // 触发后台同步
            this.triggerSync();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📡 网络连接已断开');
            this.showNotification('当前处于离线模式', 'warning');
        });

        // 初始状态提示
        if (!this.isOnline) {
            this.showNotification('当前处于离线模式', 'warning');
        }
    }

    /**
     * 设置安装提示
     */
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            // 阻止默认提示
            e.preventDefault();

            // 保存事件以便后续使用
            this.deferredPrompt = e;

            console.log('💾 可以安装PWA应用');

            // 显示自定义安装按钮
            this.showInstallButton();
        });

        // 监听安装完成
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA 已安装');
            this.deferredPrompt = null;
            this.showNotification('应用已安装到您的设备', 'success');
        });
    }

    /**
     * 显示安装按钮
     */
    showInstallButton() {
        // 检查是否已经有安装按钮
        if (document.getElementById('pwaInstallBtn')) {
            return;
        }

        const installBtn = document.createElement('button');
        installBtn.id = 'pwaInstallBtn';
        installBtn.className = 'pwa-install-btn';
        installBtn.innerHTML = '📱 安装应用';
        installBtn.onclick = () => this.promptInstall();

        // 添加到页面合适位置
        const header = document.querySelector('.header');
        if (header) {
            header.appendChild(installBtn);
        }
    }

    /**
     * 提示安装
     */
    async promptInstall() {
        if (!this.deferredPrompt) {
            console.log('没有可用的安装提示');
            return;
        }

        // 显示安装提示
        this.deferredPrompt.prompt();

        // 等待用户响应
        const { outcome } = await this.deferredPrompt.userChoice;

        console.log(`用户${outcome === 'accepted' ? '接受' : '拒绝'}了安装提示`);

        // 清除保存的提示
        this.deferredPrompt = null;

        // 隐藏安装按钮
        const installBtn = document.getElementById('pwaInstallBtn');
        if (installBtn) {
            installBtn.remove();
        }
    }

    /**
     * 检查更新
     */
    async checkForUpdates() {
        if (!this.registration) {
            return;
        }

        try {
            await this.registration.update();
            console.log('✅ 检查更新完成');
        } catch (error) {
            console.error('检查更新失败:', error);
        }
    }

    /**
     * 显示更新通知
     */
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'pwa-update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <p>🎉 有新版本可用！</p>
                <button onclick="window.pwaManager.applyUpdate()">立即更新</button>
                <button onclick="this.closest('.pwa-update-notification').remove()">稍后</button>
            </div>
        `;

        document.body.appendChild(notification);
    }

    /**
     * 应用更新
     */
    async applyUpdate() {
        if (!this.registration || !this.registration.waiting) {
            return;
        }

        // 通知Service Worker跳过等待
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });

        // 监听控制器变化
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            // 重新加载页面以应用更新
            window.location.reload();
        });
    }

    /**
     * 触发后台同步
     */
    async triggerSync() {
        if (!this.registration || !this.registration.sync) {
            console.warn('不支持后台同步');
            return;
        }

        try {
            await this.registration.sync.register('sync-user-data');
            console.log('✅ 已请求后台同步');
        } catch (error) {
            console.error('后台同步失败:', error);
        }
    }

    /**
     * 缓存指定音频
     */
    async cacheAudio(audioUrl) {
        if (!navigator.serviceWorker.controller) {
            console.warn('Service Worker 未激活');
            return false;
        }

        try {
            navigator.serviceWorker.controller.postMessage({
                type: 'CACHE_AUDIO',
                url: audioUrl
            });

            console.log('✅ 已请求缓存音频:', audioUrl);
            return true;
        } catch (error) {
            console.error('缓存音频失败:', error);
            return false;
        }
    }

    /**
     * 获取缓存状态
     */
    async getCacheStatus() {
        if (!('caches' in window)) {
            return null;
        }

        try {
            const cacheNames = await caches.keys();
            const status = {
                totalCaches: cacheNames.length,
                caches: []
            };

            for (const cacheName of cacheNames) {
                const cache = await caches.open(cacheName);
                const keys = await cache.keys();

                status.caches.push({
                    name: cacheName,
                    itemCount: keys.length
                });
            }

            return status;
        } catch (error) {
            console.error('获取缓存状态失败:', error);
            return null;
        }
    }

    /**
     * 清空所有缓存
     */
    async clearAllCaches() {
        if (!('caches' in window)) {
            return false;
        }

        try {
            const cacheNames = await caches.keys();

            await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );

            console.log('✅ 已清空所有缓存');
            this.showNotification('缓存已清空', 'success');
            return true;
        } catch (error) {
            console.error('清空缓存失败:', error);
            return false;
        }
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'info') {
        // 如果存在全局通知系统，使用它
        if (window.showNotification) {
            window.showNotification(message, type);
            return;
        }

        // 简单的控制台输出
        const emoji = {
            'info': 'ℹ️',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌'
        };

        console.log(`${emoji[type] || ''} ${message}`);
    }

    /**
     * 请求通知权限
     */
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.warn('浏览器不支持通知');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    }

    /**
     * 发送本地通知
     */
    async sendNotification(title, options = {}) {
        const hasPermission = await this.requestNotificationPermission();

        if (!hasPermission) {
            console.warn('没有通知权限');
            return null;
        }

        const defaultOptions = {
            icon: '/assets/icons/icon-192x192.png',
            badge: '/assets/icons/badge-72x72.png',
            vibrate: [200, 100, 200]
        };

        return new Notification(title, { ...defaultOptions, ...options });
    }
}

// 创建全局实例
if (typeof window !== 'undefined') {
    window.PWAManager = PWAManager;
    window.pwaManager = new PWAManager();

    // 页面加载后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.pwaManager.initialize();
        });
    } else {
        window.pwaManager.initialize();
    }

    console.log('✅ PWA Manager 已创建');
}
