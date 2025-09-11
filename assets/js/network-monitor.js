/**
 * 网络监控器
 * 高级网络状态检测和智能适应性管理
 */

class NetworkMonitor {
    constructor() {
        this.isOnline = navigator.onLine;
        this.connectionType = 'unknown';
        this.downloadSpeed = 0;
        this.latency = 0;
        this.quality = 'unknown'; // excellent, good, fair, poor, offline
        this.lastSpeedTest = 0;
        this.speedTestInterval = 5 * 60 * 1000; // 5分钟
        this.listeners = new Set();
        
        // 连接质量阈值
        this.qualityThresholds = {
            excellent: { speed: 10, latency: 100 },
            good: { speed: 5, latency: 300 },
            fair: { speed: 1, latency: 1000 },
            poor: { speed: 0.5, latency: 3000 }
        };
        
        this.initializeMonitor();
    }
    
    initializeMonitor() {
        this.setupEventListeners();
        this.detectInitialConnection();
        this.startPeriodicMonitoring();
        
        console.log('📡 网络监控器已初始化');
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 基本在线/离线状态
        window.addEventListener('online', () => {
            this.handleOnlineStatus(true);
        });
        
        window.addEventListener('offline', () => {
            this.handleOnlineStatus(false);
        });
        
        // Network Information API支持
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            connection.addEventListener('change', () => {
                this.handleConnectionChange(connection);
            });
            
            // 初始连接信息
            this.handleConnectionChange(connection);
        }
        
        // Page Visibility API - 页面可见时检测
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isOnline) {
                this.performQuickConnectivityCheck();
            }
        });
        
        // Focus事件 - 窗口获得焦点时检测
        window.addEventListener('focus', () => {
            if (this.isOnline) {
                this.performQuickConnectivityCheck();
            }
        });
    }
    
    /**
     * 处理在线状态变化
     */
    async handleOnlineStatus(online) {
        this.isOnline = online;
        
        if (online) {
            console.log('🌐 网络已连接，开始连接质量检测');
            this.quality = 'checking';
            this.notifyListeners('statusChanged', { online, quality: 'checking' });
            
            // 延迟检测以确保连接稳定
            setTimeout(() => {
                this.performFullConnectivityTest();
            }, 1000);
        } else {
            console.log('📴 网络已断开');
            this.quality = 'offline';
            this.downloadSpeed = 0;
            this.latency = Infinity;
            this.notifyListeners('statusChanged', { online, quality: 'offline' });
        }
    }
    
    /**
     * 处理连接变化
     */
    handleConnectionChange(connection) {
        this.connectionType = connection.effectiveType || 'unknown';
        
        console.log(`📶 网络类型变化: ${this.connectionType}, 下行: ${connection.downlink}Mbps`);
        
        // 基于连接类型调整预期
        this.adjustExpectationsForConnectionType();
        
        // 触发新的连接测试
        if (this.isOnline) {
            this.performQuickConnectivityCheck();
        }
        
        this.notifyListeners('connectionChanged', {
            type: this.connectionType,
            downlink: connection.downlink,
            rtt: connection.rtt
        });
    }
    
    /**
     * 根据连接类型调整预期
     */
    adjustExpectationsForConnectionType() {
        const adjustments = {
            'slow-2g': { speedFactor: 0.1, latencyFactor: 5 },
            '2g': { speedFactor: 0.2, latencyFactor: 3 },
            '3g': { speedFactor: 0.5, latencyFactor: 2 },
            '4g': { speedFactor: 1, latencyFactor: 1 },
            '5g': { speedFactor: 2, latencyFactor: 0.5 }
        };
        
        const adjustment = adjustments[this.connectionType] || { speedFactor: 1, latencyFactor: 1 };
        
        // 调整质量阈值
        this.adjustedThresholds = {};
        for (const [quality, thresholds] of Object.entries(this.qualityThresholds)) {
            this.adjustedThresholds[quality] = {
                speed: thresholds.speed * adjustment.speedFactor,
                latency: thresholds.latency * adjustment.latencyFactor
            };
        }
    }
    
    /**
     * 检测初始连接
     */
    async detectInitialConnection() {
        if (this.isOnline) {
            await this.performFullConnectivityTest();
        } else {
            this.quality = 'offline';
        }
    }
    
    /**
     * 开始定期监控
     */
    startPeriodicMonitoring() {
        // 每30秒快速检测
        setInterval(() => {
            if (this.isOnline) {
                this.performQuickConnectivityCheck();
            }
        }, 30000);
        
        // 每5分钟完整测试
        setInterval(() => {
            if (this.isOnline && Date.now() - this.lastSpeedTest > this.speedTestInterval) {
                this.performFullConnectivityTest();
            }
        }, this.speedTestInterval);
    }
    
    /**
     * 快速连接检测
     */
    async performQuickConnectivityCheck() {
        const startTime = performance.now();
        
        try {
            const response = await fetch('https://archive.org/favicon.ico?t=' + Date.now(), {
                method: 'HEAD',
                cache: 'no-cache',
                signal: AbortSignal.timeout(5000)
            });
            
            const endTime = performance.now();
            this.latency = Math.round(endTime - startTime);
            
            if (response.ok) {
                this.updateConnectionQuality();
                this.notifyListeners('quickCheckComplete', {
                    success: true,
                    latency: this.latency,
                    quality: this.quality
                });
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
            
        } catch (error) {
            console.warn('快速连接检测失败:', error);
            this.quality = 'poor';
            this.latency = Infinity;
            this.notifyListeners('quickCheckComplete', {
                success: false,
                error: error.message,
                quality: this.quality
            });
        }
    }
    
    /**
     * 完整连接测试
     */
    async performFullConnectivityTest() {
        console.log('🧪 开始完整连接测试');
        this.lastSpeedTest = Date.now();
        
        const results = await Promise.allSettled([
            this.testDownloadSpeed(),
            this.testLatency(),
            this.testReliability()
        ]);
        
        const [speedResult, latencyResult, reliabilityResult] = results;
        
        // 处理测试结果
        if (speedResult.status === 'fulfilled') {
            this.downloadSpeed = speedResult.value;
        }
        
        if (latencyResult.status === 'fulfilled') {
            this.latency = latencyResult.value;
        }
        
        const reliability = reliabilityResult.status === 'fulfilled' ? reliabilityResult.value : 0;
        
        this.updateConnectionQuality(reliability);
        
        console.log(`📊 连接测试完成 - 速度: ${this.downloadSpeed.toFixed(2)}Mbps, 延迟: ${this.latency}ms, 质量: ${this.quality}`);
        
        this.notifyListeners('fullTestComplete', {
            speed: this.downloadSpeed,
            latency: this.latency,
            reliability,
            quality: this.quality,
            connectionType: this.connectionType
        });
    }
    
    /**
     * 测试下载速度
     */
    async testDownloadSpeed() {
        const testSizes = [100, 500, 1000]; // KB
        const results = [];
        
        for (const size of testSizes) {
            try {
                const url = `https://archive.org/download/test-audio-file/${size}kb-test.bin?t=${Date.now()}`;
                const startTime = performance.now();
                
                const response = await fetch(url, {
                    signal: AbortSignal.timeout(10000)
                });
                
                const data = await response.arrayBuffer();
                const endTime = performance.now();
                
                const duration = (endTime - startTime) / 1000; // 秒
                const sizeInBits = data.byteLength * 8;
                const speedBps = sizeInBits / duration;
                const speedMbps = speedBps / (1000 * 1000);
                
                results.push(speedMbps);
                
            } catch (error) {
                console.warn(`速度测试失败 (${size}KB):`, error);
            }
        }
        
        // 取平均值
        return results.length > 0 ? 
            results.reduce((sum, speed) => sum + speed, 0) / results.length : 0;
    }
    
    /**
     * 测试延迟
     */
    async testLatency() {
        const tests = [];
        
        for (let i = 0; i < 3; i++) {
            try {
                const startTime = performance.now();
                
                await fetch('https://archive.org/favicon.ico?t=' + Date.now(), {
                    method: 'HEAD',
                    cache: 'no-cache',
                    signal: AbortSignal.timeout(5000)
                });
                
                const endTime = performance.now();
                tests.push(endTime - startTime);
                
            } catch (error) {
                tests.push(Infinity);
            }
        }
        
        // 返回中位数延迟
        tests.sort((a, b) => a - b);
        return Math.round(tests[Math.floor(tests.length / 2)]);
    }
    
    /**
     * 测试连接可靠性
     */
    async testReliability() {
        const testCount = 5;
        let successCount = 0;
        
        const promises = Array(testCount).fill().map(async (_, index) => {
            try {
                const response = await fetch(`https://archive.org/metadata/sound-healing-collection?t=${Date.now()}_${index}`, {
                    method: 'HEAD',
                    cache: 'no-cache',
                    signal: AbortSignal.timeout(3000)
                });
                
                if (response.ok) {
                    successCount++;
                }
            } catch (error) {
                // 失败计入统计
            }
        });
        
        await Promise.allSettled(promises);
        
        return successCount / testCount; // 返回成功率
    }
    
    /**
     * 更新连接质量
     */
    updateConnectionQuality(reliability = 1) {
        const thresholds = this.adjustedThresholds || this.qualityThresholds;
        
        // 基于速度和延迟的基础质量
        let baseQuality = 'poor';
        
        for (const [quality, threshold] of Object.entries(thresholds)) {
            if (this.downloadSpeed >= threshold.speed && this.latency <= threshold.latency) {
                baseQuality = quality;
                break;
            }
        }
        
        // 可靠性调整
        if (reliability < 0.8 && baseQuality !== 'poor') {
            const qualityLevels = ['poor', 'fair', 'good', 'excellent'];
            const currentIndex = qualityLevels.indexOf(baseQuality);
            if (currentIndex > 0) {
                baseQuality = qualityLevels[currentIndex - 1];
            }
        }
        
        const previousQuality = this.quality;
        this.quality = baseQuality;
        
        if (previousQuality !== this.quality) {
            this.notifyListeners('qualityChanged', {
                from: previousQuality,
                to: this.quality,
                speed: this.downloadSpeed,
                latency: this.latency,
                reliability
            });
        }
    }
    
    /**
     * 添加监听器
     */
    addListener(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }
    
    /**
     * 通知监听器
     */
    notifyListeners(event, data) {
        this.listeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('网络监控器监听器错误:', error);
            }
        });
        
        // 也发送全局事件
        window.dispatchEvent(new CustomEvent(`networkMonitor:${event}`, {
            detail: data
        }));
    }
    
    /**
     * 获取连接建议
     */
    getConnectionAdvice() {
        const advice = {
            quality: this.quality,
            recommendations: [],
            optimizations: []
        };
        
        switch (this.quality) {
            case 'excellent':
                advice.recommendations.push('连接质量优秀，可以启用所有高级功能');
                advice.optimizations.push('预加载策略：积极预加载');
                break;
                
            case 'good':
                advice.recommendations.push('连接质量良好，适合正常使用');
                advice.optimizations.push('预加载策略：正常预加载');
                break;
                
            case 'fair':
                advice.recommendations.push('连接质量一般，建议降低音频质量');
                advice.optimizations.push('预加载策略：保守预加载');
                advice.optimizations.push('缓存策略：增强本地缓存');
                break;
                
            case 'poor':
                advice.recommendations.push('连接质量较差，建议使用缓存模式');
                advice.optimizations.push('预加载策略：禁用预加载');
                advice.optimizations.push('播放策略：仅播放已缓存内容');
                break;
                
            case 'offline':
                advice.recommendations.push('网络离线，仅可播放已缓存的音频');
                advice.optimizations.push('播放策略：离线模式');
                break;
        }
        
        // 基于连接类型的建议
        if (this.connectionType === 'slow-2g' || this.connectionType === '2g') {
            advice.recommendations.push('检测到慢速连接，建议在Wi-Fi环境下使用');
            advice.optimizations.push('数据节省：启用低质量模式');
        }
        
        return advice;
    }
    
    /**
     * 获取自适应配置
     */
    getAdaptiveConfig() {
        const config = {
            preloadEnabled: true,
            preloadConcurrency: 3,
            cacheAggressiveness: 'normal',
            audioQuality: 'high',
            retryAttempts: 3,
            timeout: 10000
        };
        
        switch (this.quality) {
            case 'excellent':
                config.preloadConcurrency = 5;
                config.cacheAggressiveness = 'aggressive';
                config.timeout = 15000;
                break;
                
            case 'good':
                // 使用默认配置
                break;
                
            case 'fair':
                config.preloadConcurrency = 2;
                config.cacheAggressiveness = 'conservative';
                config.audioQuality = 'medium';
                config.timeout = 8000;
                break;
                
            case 'poor':
                config.preloadEnabled = false;
                config.preloadConcurrency = 1;
                config.cacheAggressiveness = 'minimal';
                config.audioQuality = 'low';
                config.retryAttempts = 5;
                config.timeout = 5000;
                break;
                
            case 'offline':
                config.preloadEnabled = false;
                config.preloadConcurrency = 0;
                config.cacheAggressiveness = 'disabled';
                config.retryAttempts = 0;
                break;
        }
        
        return config;
    }
    
    /**
     * 强制重新测试
     */
    async forceRetest() {
        console.log('🔄 强制重新测试网络连接');
        
        if (!this.isOnline) {
            this.isOnline = navigator.onLine;
        }
        
        if (this.isOnline) {
            await this.performFullConnectivityTest();
        } else {
            this.quality = 'offline';
        }
        
        return this.getStatus();
    }
    
    /**
     * 获取当前状态
     */
    getStatus() {
        return {
            isOnline: this.isOnline,
            connectionType: this.connectionType,
            downloadSpeed: this.downloadSpeed,
            latency: this.latency,
            quality: this.quality,
            lastSpeedTest: this.lastSpeedTest,
            advice: this.getConnectionAdvice(),
            config: this.getAdaptiveConfig()
        };
    }
}

// 创建全局实例
window.networkMonitor = new NetworkMonitor();

// 与其他系统集成
window.networkMonitor.addListener((event, data) => {
    // 通知智能预加载器
    if (window.intelligentPreloader) {
        window.intelligentPreloader.handleNetworkChange?.(event, data);
    }
    
    // 通知缓存管理器
    if (window.enhancedCacheManager) {
        window.enhancedCacheManager.handleNetworkChange?.(event, data);
    }
    
    // 通知外部存储UI
    if (window.externalStorageUI) {
        window.externalStorageUI.handleNetworkChange?.(event, data);
    }
});

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NetworkMonitor;
}

console.log('📡 网络监控器已加载');