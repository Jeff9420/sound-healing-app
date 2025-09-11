/**
 * 前端性能优化器 - 实时监控和自动优化
 * 针对声音疗愈应用的性能瓶颈进行动态调整
 */
class PerformanceOptimizer {
    constructor() {
        this.metrics = {
            fcp: 0,
            lcp: 0,
            fid: 0,
            cls: 0,
            ttfb: 0,
            loadTime: 0
        };
        
        this.thresholds = {
            fcp: 2000,      // First Contentful Paint < 2s
            lcp: 2500,      // Largest Contentful Paint < 2.5s  
            fid: 100,       // First Input Delay < 100ms
            cls: 0.1,       // Cumulative Layout Shift < 0.1
            ttfb: 600,      // Time to First Byte < 600ms
            loadTime: 3000  // 总加载时间 < 3s
        };
        
        this.optimizations = new Map();
        this.isOptimizing = false;
        this.deviceCapabilities = this.detectDeviceCapabilities();
        
        this.init();
    }

    /**
     * 初始化性能优化器
     */
    init() {
        this.measureCoreWebVitals();
        this.monitorNetworkConditions();
        this.detectDeviceConstraints();
        this.startPerformanceMonitoring();
        this.implementAdaptiveOptimizations();
        
        console.log('🚀 性能优化器已启动', this.deviceCapabilities);
    }

    /**
     * 测量Core Web Vitals
     */
    measureCoreWebVitals() {
        // First Contentful Paint
        this.measureFCP();
        
        // Largest Contentful Paint
        this.measureLCP();
        
        // First Input Delay
        this.measureFID();
        
        // Cumulative Layout Shift
        this.measureCLS();
        
        // Time to First Byte
        this.measureTTFB();
    }

    /**
     * 测量First Contentful Paint
     */
    measureFCP() {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name === 'first-contentful-paint') {
                    this.metrics.fcp = entry.startTime;
                    console.log(`📊 FCP: ${entry.startTime.toFixed(0)}ms`);
                    
                    if (entry.startTime > this.thresholds.fcp) {
                        this.triggerFCPOptimization();
                    }
                }
            }
        });
        
        observer.observe({ entryTypes: ['paint'] });
    }

    /**
     * 测量Largest Contentful Paint
     */
    measureLCP() {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            
            this.metrics.lcp = lastEntry.startTime;
            console.log(`📊 LCP: ${lastEntry.startTime.toFixed(0)}ms`);
            
            if (lastEntry.startTime > this.thresholds.lcp) {
                this.triggerLCPOptimization();
            }
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }

    /**
     * 测量First Input Delay
     */
    measureFID() {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                this.metrics.fid = entry.processingStart - entry.startTime;
                console.log(`📊 FID: ${this.metrics.fid.toFixed(0)}ms`);
                
                if (this.metrics.fid > this.thresholds.fid) {
                    this.triggerFIDOptimization();
                }
            }
        });
        
        observer.observe({ entryTypes: ['first-input'] });
    }

    /**
     * 测量Cumulative Layout Shift
     */
    measureCLS() {
        let clsValue = 0;
        
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            
            this.metrics.cls = clsValue;
            console.log(`📊 CLS: ${clsValue.toFixed(3)}`);
            
            if (clsValue > this.thresholds.cls) {
                this.triggerCLSOptimization();
            }
        });
        
        observer.observe({ entryTypes: ['layout-shift'] });
    }

    /**
     * 测量Time to First Byte
     */
    measureTTFB() {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
            console.log(`📊 TTFB: ${this.metrics.ttfb.toFixed(0)}ms`);
            
            if (this.metrics.ttfb > this.thresholds.ttfb) {
                this.triggerTTFBOptimization();
            }
        }
    }

    /**
     * 检测设备能力
     */
    detectDeviceCapabilities() {
        const capabilities = {
            cores: navigator.hardwareConcurrency || 4,
            memory: navigator.deviceMemory || 4,
            connection: this.getConnectionInfo(),
            batteryLevel: null,
            isLowEndDevice: false
        };
        
        // 检测低端设备
        capabilities.isLowEndDevice = capabilities.cores <= 2 || capabilities.memory <= 2;
        
        // 电池API
        if ('getBattery' in navigator) {
            navigator.getBattery().then((battery) => {
                capabilities.batteryLevel = battery.level;
                this.adaptToBatteryLevel(battery.level);
                
                battery.addEventListener('levelchange', () => {
                    this.adaptToBatteryLevel(battery.level);
                });
            });
        }
        
        return capabilities;
    }

    /**
     * 获取网络连接信息
     */
    getConnectionInfo() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            return {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            };
        }
        return { effectiveType: '4g', downlink: 10, rtt: 100, saveData: false };
    }

    /**
     * 监控网络状况变化
     */
    monitorNetworkConditions() {
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                const connection = this.getConnectionInfo();
                console.log('🌐 网络状况变化:', connection);
                this.adaptToNetworkCondition(connection);
            });
        }
        
        // 在线/离线状态监控
        window.addEventListener('online', () => {
            console.log('🟢 网络已连接');
            this.handleOnlineState();
        });
        
        window.addEventListener('offline', () => {
            console.log('🔴 网络已断开');
            this.handleOfflineState();
        });
    }

    /**
     * FCP优化触发
     */
    triggerFCPOptimization() {
        console.log('🔧 触发FCP优化');
        
        // 内联关键CSS
        this.inlineCriticalCSS();
        
        // 预连接关键资源
        this.preconnectCriticalDomains();
        
        // 延迟非关键资源
        this.deferNonCriticalResources();
    }

    /**
     * LCP优化触发
     */
    triggerLCPOptimization() {
        console.log('🔧 触发LCP优化');
        
        // 预加载LCP元素
        this.preloadLCPResource();
        
        // 优化图片加载
        this.optimizeImageLoading();
        
        // 减少渲染阻塞
        this.reduceRenderBlocking();
    }

    /**
     * FID优化触发
     */
    triggerFIDOptimization() {
        console.log('🔧 触发FID优化');
        
        // 分解长任务
        this.breakLongTasks();
        
        // 使用web workers
        this.offloadToWebWorkers();
        
        // 优化事件监听器
        this.optimizeEventListeners();
    }

    /**
     * CLS优化触发
     */
    triggerCLSOptimization() {
        console.log('🔧 触发CLS优化');
        
        // 为图片设置尺寸
        this.setImageDimensions();
        
        // 预留广告空间
        this.reserveAdSpace();
        
        // 避免动态内容插入
        this.preventDynamicInserts();
    }

    /**
     * 内联关键CSS
     */
    inlineCriticalCSS() {
        if (this.optimizations.has('criticalCSS')) return;
        
        const criticalCSS = `
            body { font-family: Georgia, serif; background: #4a6741; color: #f7f4e9; }
            .loading-spinner { position: fixed; top: 50%; left: 50%; }
            .ecosystem-grid { display: grid; gap: 1rem; }
        `;
        
        const style = document.createElement('style');
        style.textContent = criticalCSS;
        document.head.insertBefore(style, document.head.firstChild);
        
        this.optimizations.set('criticalCSS', true);
        console.log('✅ 关键CSS已内联');
    }

    /**
     * 预连接关键域名
     */
    preconnectCriticalDomains() {
        const domains = ['//fonts.googleapis.com', '//cdn.jsdelivr.net'];
        
        domains.forEach(domain => {
            if (!document.querySelector(`link[rel="preconnect"][href="${domain}"]`)) {
                const link = document.createElement('link');
                link.rel = 'preconnect';
                link.href = domain;
                document.head.appendChild(link);
            }
        });
        
        console.log('✅ 关键域名预连接完成');
    }

    /**
     * 延迟非关键资源
     */
    deferNonCriticalResources() {
        // 延迟加载非关键JavaScript
        const scripts = document.querySelectorAll('script[src]:not([async]):not([defer])');
        scripts.forEach(script => {
            if (!script.src.includes('critical')) {
                script.defer = true;
            }
        });
        
        console.log(`✅ 已延迟${scripts.length}个非关键脚本`);
    }

    /**
     * 预加载LCP资源
     */
    preloadLCPResource() {
        // 识别LCP元素并预加载
        const lcpElements = document.querySelectorAll('img, video, canvas');
        lcpElements.forEach(element => {
            if (element.offsetWidth * element.offsetHeight > 50000) { // 大于50k像素
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = element.tagName === 'IMG' ? 'image' : 'video';
                link.href = element.src || element.currentSrc;
                document.head.appendChild(link);
            }
        });
    }

    /**
     * 分解长任务
     */
    breakLongTasks() {
        // 使用scheduler.postTask或setTimeout分解任务
        const originalSetTimeout = window.setTimeout;
        window.setTimeout = (callback, delay, ...args) => {
            if (delay === 0) {
                // 使用MessageChannel实现更快的异步执行
                const channel = new MessageChannel();
                channel.port1.onmessage = () => callback(...args);
                channel.port2.postMessage(null);
            } else {
                originalSetTimeout(callback, delay, ...args);
            }
        };
    }

    /**
     * 卸载到Web Workers
     */
    offloadToWebWorkers() {
        if (!this.optimizations.has('webWorker')) {
            // 创建通用计算Worker
            const workerScript = `
                self.onmessage = function(e) {
                    const { type, data } = e.data;
                    switch(type) {
                        case 'heavy-calculation':
                            const result = performHeavyCalculation(data);
                            self.postMessage({ type: 'result', result });
                            break;
                    }
                };
                
                function performHeavyCalculation(data) {
                    // 执行重计算任务
                    return data;
                }
            `;
            
            const blob = new Blob([workerScript], { type: 'application/javascript' });
            const worker = new Worker(URL.createObjectURL(blob));
            
            window.performanceWorker = worker;
            this.optimizations.set('webWorker', true);
            console.log('✅ Web Worker已创建');
        }
    }

    /**
     * 优化事件监听器
     */
    optimizeEventListeners() {
        // 使用事件委托减少监听器数量
        const container = document.getElementById('categoriesContainer');
        if (container && !container.dataset.optimized) {
            // 移除单个卡片的监听器，使用委托
            container.addEventListener('click', (e) => {
                const card = e.target.closest('.ecosystem-card');
                if (card) {
                    // 处理卡片点击
                    this.handleCardClick(card);
                }
            }, { passive: true });
            
            container.dataset.optimized = 'true';
            console.log('✅ 事件监听器已优化');
        }
    }

    /**
     * 根据网络状况调整
     */
    adaptToNetworkCondition(connection) {
        const { effectiveType, saveData } = connection;
        
        if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
            this.enableDataSavingMode();
        } else if (effectiveType === '4g') {
            this.enableHighQualityMode();
        }
    }

    /**
     * 启用数据节省模式
     */
    enableDataSavingMode() {
        document.body.classList.add('low-bandwidth');
        
        // 禁用自动播放
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
            audio.preload = 'none';
        });
        
        // 减少动画效果
        document.body.classList.add('reduced-motion');
        
        console.log('📱 数据节省模式已启用');
    }

    /**
     * 启用高质量模式
     */
    enableHighQualityMode() {
        document.body.classList.remove('low-bandwidth', 'reduced-motion');
        
        // 启用预加载
        if (window.audioLazyLoader) {
            window.audioLazyLoader.smartPreload();
        }
        
        console.log('🚀 高质量模式已启用');
    }

    /**
     * 根据电池电量调整
     */
    adaptToBatteryLevel(level) {
        if (level < 0.2) { // 电量低于20%
            this.enableBatterySavingMode();
        } else if (level > 0.8) {
            this.enableFullPerformanceMode();
        }
    }

    /**
     * 启用省电模式
     */
    enableBatterySavingMode() {
        document.body.classList.add('low-battery');
        
        // 降低刷新率
        const animations = document.querySelectorAll('.cloud, .ripple');
        animations.forEach(element => {
            element.style.animationDuration = '120s'; // 减慢动画
        });
        
        console.log('🔋 省电模式已启用');
    }

    /**
     * 启用全性能模式
     */
    enableFullPerformanceMode() {
        document.body.classList.remove('low-battery');
        console.log('⚡ 全性能模式已启用');
    }

    /**
     * 处理在线状态
     */
    handleOnlineState() {
        // 恢复正常功能
        document.body.classList.remove('offline');
        
        // 同步离线数据
        if (window.cacheManager) {
            window.cacheManager.syncOfflineData();
        }
    }

    /**
     * 处理离线状态
     */
    handleOfflineState() {
        document.body.classList.add('offline');
        
        // 显示离线提示
        this.showOfflineNotification();
    }

    /**
     * 显示离线通知
     */
    showOfflineNotification() {
        const notification = document.createElement('div');
        notification.className = 'offline-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span>📶 网络连接已断开，当前为离线模式</span>
                <button onclick="this.parentElement.parentElement.remove()">知道了</button>
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * 开始性能监控
     */
    startPerformanceMonitoring() {
        // 每30秒监控一次性能指标
        setInterval(() => {
            this.collectPerformanceMetrics();
        }, 30000);
        
        // 监控内存使用
        if ('memory' in performance) {
            setInterval(() => {
                this.monitorMemoryUsage();
            }, 60000);
        }
    }

    /**
     * 收集性能指标
     */
    collectPerformanceMetrics() {
        const metrics = {
            timestamp: Date.now(),
            ...this.metrics,
            memoryUsage: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            } : null
        };
        
        // 发送到分析服务或本地存储
        this.logMetrics(metrics);
    }

    /**
     * 监控内存使用
     */
    monitorMemoryUsage() {
        if (performance.memory) {
            const usage = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
            
            if (usage > 0.8) { // 内存使用超过80%
                console.warn('⚠️ 内存使用过高，触发清理');
                this.performMemoryCleanup();
            }
        }
    }

    /**
     * 执行内存清理
     */
    performMemoryCleanup() {
        // 清理音频缓存
        if (window.audioLazyLoader) {
            window.audioLazyLoader.cleanupExpiredCache();
        }
        
        // 清理DOM节点
        this.cleanupDOMNodes();
        
        // 触发垃圾回收（如果可用）
        if (window.gc) {
            window.gc();
        }
    }

    /**
     * 清理DOM节点
     */
    cleanupDOMNodes() {
        // 移除隐藏的或不必要的DOM节点
        const hiddenElements = document.querySelectorAll('[style*="display: none"]:not(.playlist-section)');
        hiddenElements.forEach(element => {
            if (!element.dataset.preserve) {
                element.remove();
            }
        });
        
        console.log(`🗑️ 清理了 ${hiddenElements.length} 个隐藏元素`);
    }

    /**
     * 记录性能指标
     */
    logMetrics(metrics) {
        // 保存到localStorage或发送到服务器
        const metricsLog = JSON.parse(localStorage.getItem('performanceMetrics') || '[]');
        metricsLog.push(metrics);
        
        // 只保留最近50条记录
        if (metricsLog.length > 50) {
            metricsLog.shift();
        }
        
        localStorage.setItem('performanceMetrics', JSON.stringify(metricsLog));
    }

    /**
     * 获取性能报告
     */
    getPerformanceReport() {
        const report = {
            metrics: this.metrics,
            deviceCapabilities: this.deviceCapabilities,
            optimizations: Array.from(this.optimizations.keys()),
            recommendations: this.generateRecommendations()
        };
        
        return report;
    }

    /**
     * 生成优化建议
     */
    generateRecommendations() {
        const recommendations = [];
        
        if (this.metrics.fcp > this.thresholds.fcp) {
            recommendations.push('建议内联关键CSS以减少FCP时间');
        }
        
        if (this.metrics.lcp > this.thresholds.lcp) {
            recommendations.push('建议预加载LCP资源以改善LCP指标');
        }
        
        if (this.metrics.fid > this.thresholds.fid) {
            recommendations.push('建议分解长任务以改善FID指标');
        }
        
        if (this.metrics.cls > this.thresholds.cls) {
            recommendations.push('建议为图片设置固定尺寸以减少CLS');
        }
        
        return recommendations;
    }
}

// 创建全局性能优化器实例
window.performanceOptimizer = new PerformanceOptimizer();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
}