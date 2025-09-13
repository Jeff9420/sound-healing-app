/**
 * 缓存管理器 - Service Worker集成
 * 第二阶段性能优化：智能缓存管理和离线支持
 * 
 * @author Claude Code Performance Optimization - Phase 2
 * @date 2024-09-05
 */

class CacheManager {
    constructor() {
        this.swRegistration = null;
        this.isOnline = navigator.onLine;
        this.performanceData = null;
        this.cacheStatus = 'unknown';
        
        // 事件监听器
        this.onlineStatusListeners = [];
        this.cacheStatusListeners = [];
        
        this.initializeCacheManager();
    }
    
    /**
     * 初始化缓存管理器
     */
    async initializeCacheManager() {
        console.log('🚀 缓存管理器：开始初始化...');
        
        // 检查Service Worker支持
        if (!('serviceWorker' in navigator)) {
            console.warn('⚠️ 缓存管理器：浏览器不支持Service Worker');
            this.cacheStatus = 'not_supported';
            return;
        }
        
        try {
            // 注册增强版Service Worker
            await this.registerServiceWorker();
            
            // 监听网络状态变化
            this.setupNetworkListener();
            
            // 初始化缓存状态监控
            this.setupCacheMonitoring();
            
            console.log('✅ 缓存管理器：初始化完成');
            
        } catch (error) {
            console.error('❌ 缓存管理器：初始化失败', error);
            this.cacheStatus = 'failed';
        }
    }
    
    /**
     * 注册Service Worker
     */
    async registerServiceWorker() {
        try {
            // 检查是否支持Service Worker以及当前协议
            if (!('serviceWorker' in navigator)) {
                console.log('💫 Service Worker不被支持，跳过注册');
                this.cacheStatus = 'unsupported';
                return;
            }
            
            // 检查协议，file:// 协议下无法使用Service Worker
            if (location.protocol === 'file:') {
                console.log('💫 文件协议下无法使用Service Worker，使用基础缓存模式');
                this.cacheStatus = 'file-protocol';
                return;
            }
            
            // 检查是否已有旧版本Service Worker
            const existingRegistration = await navigator.serviceWorker.getRegistration();
            
            if (existingRegistration) {
                console.log('🔄 缓存管理器：发现现有Service Worker，准备升级...');
                
                // 注册新版本
                this.swRegistration = await navigator.serviceWorker.register('/sw-enhanced.js', {
                    scope: '/',
                    updateViaCache: 'none' // 强制检查更新
                });
                
                console.log('🔄 缓存管理器：Service Worker升级完成');
            } else {
                // 首次注册
                this.swRegistration = await navigator.serviceWorker.register('/sw-enhanced.js', {
                    scope: '/'
                });
                
                console.log('📦 缓存管理器：首次注册Service Worker');
            }
            
            // 监听Service Worker状态变化
            this.swRegistration.addEventListener('updatefound', () => {
                console.log('🔄 缓存管理器：Service Worker更新中...');
                this.cacheStatus = 'updating';
                this.notifyCacheStatusChange();
            });
            
            // 等待Service Worker激活
            if (this.swRegistration.active) {
                this.cacheStatus = 'active';
                console.log('✅ 缓存管理器：Service Worker已激活');
            } else {
                await this.waitForServiceWorkerActivation();
            }
            
        } catch (error) {
            console.warn('⚠️ Service Worker注册失败，使用降级模式', error);
            this.cacheStatus = 'failed';
            // 不再抛出错误，改为优雅降级
        }
    }
    
    /**
     * 等待Service Worker激活
     */
    async waitForServiceWorkerActivation() {
        return new Promise((resolve) => {
            const checkActivation = () => {
                if (this.swRegistration.active) {
                    this.cacheStatus = 'active';
                    console.log('✅ 缓存管理器：Service Worker激活完成');
                    resolve();
                } else {
                    setTimeout(checkActivation, 100);
                }
            };
            checkActivation();
        });
    }
    
    /**
     * 设置网络状态监听
     */
    setupNetworkListener() {
        const updateOnlineStatus = () => {
            const wasOnline = this.isOnline;
            this.isOnline = navigator.onLine;
            
            if (wasOnline !== this.isOnline) {
                console.log(`🌐 网络状态变化: ${this.isOnline ? '在线' : '离线'}`);
                this.notifyOnlineStatusChange();
                
                if (this.isOnline) {
                    // 网络恢复时，尝试更新缓存
                    this.syncCacheInBackground();
                }
            }
        };
        
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
    }
    
    /**
     * 设置缓存监控
     */
    setupCacheMonitoring() {
        // 每30秒获取一次性能数据
        setInterval(() => {
            this.getPerformanceData();
        }, 30000);
        
        // 立即获取首次数据
        setTimeout(() => {
            this.getPerformanceData();
        }, 2000);
    }
    
    /**
     * 获取Service Worker性能数据
     */
    async getPerformanceData() {
        if (!this.swRegistration || !this.swRegistration.active) {
            return null;
        }
        
        try {
            const messageChannel = new MessageChannel();
            
            const performancePromise = new Promise((resolve) => {
                messageChannel.port1.onmessage = (event) => {
                    if (event.data.type === 'PERFORMANCE_DATA') {
                        resolve(event.data.data);
                    }
                };
                
                // 5秒超时
                setTimeout(() => resolve(null), 5000);
            });
            
            this.swRegistration.active.postMessage(
                { type: 'PERFORMANCE_REPORT' },
                [messageChannel.port2]
            );
            
            this.performanceData = await performancePromise;
            
            if (this.performanceData) {
                console.log('📊 缓存性能数据:', this.performanceData);
            }
            
            return this.performanceData;
            
        } catch (error) {
            console.warn('⚠️ 获取缓存性能数据失败:', error);
            return null;
        }
    }
    
    /**
     * 后台同步缓存
     */
    async syncCacheInBackground() {
        if (!this.isOnline) {
            console.log('🔄 离线模式：跳过缓存同步');
            return;
        }
        
        console.log('🔄 后台同步缓存...');
        
        try {
            // 预缓存关键音频文件
            await this.precacheAudioFiles();
            
            // 更新静态资源
            await this.updateStaticResources();
            
            console.log('✅ 后台缓存同步完成');
            
        } catch (error) {
            console.warn('⚠️ 后台缓存同步失败:', error);
        }
    }
    
    /**
     * 预缓存音频文件
     */
    async precacheAudioFiles() {
        if (!window.AUDIO_CONFIG) return;
        
        // 获取热门分类的音频文件进行预缓存
        const popularCategories = ['Rain', 'meditation', 'Singing bowl sound'];
        const precachePromises = [];
        
        for (const categoryKey of popularCategories) {
            const category = window.AUDIO_CONFIG.categories[categoryKey];
            if (category && category.files) {
                // 每个分类预缓存前3个文件
                const filesToCache = category.files.slice(0, 3);
                
                for (const fileName of filesToCache) {
                    const audioUrl = getAudioUrl(categoryKey, fileName);
                    precachePromises.push(
                        fetch(audioUrl, { mode: 'no-cors' }).catch(error => {
                            console.warn(`⚠️ 预缓存音频失败: ${audioUrl}`, error);
                        })
                    );
                }
            }
        }
        
        if (precachePromises.length > 0) {
            console.log(`🎵 预缓存 ${precachePromises.length} 个热门音频文件...`);
            await Promise.allSettled(precachePromises);
        }
    }
    
    /**
     * 更新静态资源
     */
    async updateStaticResources() {
        const staticResources = [
            '/assets/css/main.css',
            '/assets/css/playlist.css',
            '/assets/css/gpu-optimized-animations.css'
        ];
        
        const updatePromises = staticResources.map(url => 
            fetch(url, { cache: 'no-cache' }).catch(error => {
                console.warn(`⚠️ 更新静态资源失败: ${url}`, error);
            })
        );
        
        await Promise.allSettled(updatePromises);
    }
    
    /**
     * 清理缓存
     */
    async clearCache() {
        if (!this.swRegistration || !this.swRegistration.active) {
            console.warn('⚠️ Service Worker未激活，无法清理缓存');
            return;
        }
        
        try {
            const messageChannel = new MessageChannel();
            
            const clearPromise = new Promise((resolve) => {
                messageChannel.port1.onmessage = (event) => {
                    if (event.data.type === 'CACHE_CLEARED') {
                        resolve();
                    }
                };
                
                setTimeout(() => resolve(), 5000); // 5秒超时
            });
            
            this.swRegistration.active.postMessage(
                { type: 'CLEAR_CACHE' },
                [messageChannel.port2]
            );
            
            await clearPromise;
            console.log('🧹 缓存清理完成');
            
        } catch (error) {
            console.error('❌ 缓存清理失败:', error);
        }
    }
    
    /**
     * 获取缓存状态
     */
    getCacheStatus() {
        return {
            status: this.cacheStatus,
            isOnline: this.isOnline,
            swActive: !!(this.swRegistration && this.swRegistration.active),
            performanceData: this.performanceData
        };
    }
    
    /**
     * 监听在线状态变化
     */
    onOnlineStatusChange(callback) {
        this.onlineStatusListeners.push(callback);
    }
    
    /**
     * 监听缓存状态变化
     */
    onCacheStatusChange(callback) {
        this.cacheStatusListeners.push(callback);
    }
    
    /**
     * 通知在线状态变化
     */
    notifyOnlineStatusChange() {
        this.onlineStatusListeners.forEach(callback => {
            try {
                callback(this.isOnline);
            } catch (error) {
                console.warn('⚠️ 在线状态回调执行失败:', error);
            }
        });
    }
    
    /**
     * 通知缓存状态变化
     */
    notifyCacheStatusChange() {
        this.cacheStatusListeners.forEach(callback => {
            try {
                callback(this.cacheStatus);
            } catch (error) {
                console.warn('⚠️ 缓存状态回调执行失败:', error);
            }
        });
    }
    
    /**
     * 强制更新Service Worker
     */
    async updateServiceWorker() {
        if (!this.swRegistration) return;
        
        try {
            await this.swRegistration.update();
            console.log('🔄 Service Worker更新检查完成');
        } catch (error) {
            console.warn('⚠️ Service Worker更新检查失败:', error);
        }
    }
}

// 创建全局实例（仅在支持的环境中）
if (typeof window !== 'undefined') {
    window.cacheManager = new CacheManager();
    
    // 提供全局缓存控制函数
    window.getCacheStatus = () => window.cacheManager.getCacheStatus();
    window.clearAppCache = () => window.cacheManager.clearCache();
    window.updateCache = () => window.cacheManager.updateServiceWorker();
    
    console.log('📦 缓存管理器全局实例已创建');
}

console.log('🚀 缓存管理器模块加载完成');