/**
 * 实时性能监控系统 - 声音疗愈应用第二阶段优化
 * Core Web Vitals实时监测和自动优化
 * 目标：实时监控FCP、LCP、CLS、FID等关键指标，动态优化
 * 
 * @author Claude Code Performance Optimization - Phase 2
 * @date 2024-09-05
 * @version 2.2.0
 */

class RealTimePerformanceMonitor {
    constructor() {
        this.metrics = {
            // Core Web Vitals
            fcp: null,
            lcp: null,
            cls: 0,
            fid: null,
            
            // Runtime Performance
            memoryUsage: 0,
            networkLatency: 0,
            audioLatency: 0,
            frameRate: 0,
            
            // Custom Metrics
            audioLoadTime: 0,
            cacheHitRate: 0,
            errorCount: 0,
            userInteractions: 0
        };
        
        this.thresholds = {
            fcp: { good: 1800, needsImprovement: 3000 },
            lcp: { good: 2500, needsImprovement: 4000 },
            cls: { good: 0.1, needsImprovement: 0.25 },
            fid: { good: 100, needsImprovement: 300 },
            memoryUsage: { good: 50, needsImprovement: 100 },
            frameRate: { good: 55, needsImprovement: 30 }
        };
        
        this.observers = new Map();
        this.intervals = new Map();
        this.reportingCallbacks = new Set();
        this.optimizationActions = new Map();
        
        // 性能历史数据
        this.history = {
            metrics: [],
            optimizations: [],
            alerts: []
        };
        
        this.initializeMonitoring();
    }
    
    /**
     * 初始化性能监控
     */
    initializeMonitoring() {
        console.log('📊 启动实时性能监控系统...');
        
        try {
            this.setupWebVitalsMonitoring();
            this.setupRuntimeMonitoring();
            this.setupCustomMetrics();
            this.setupAlertSystem();
            this.startReporting();
            
            console.log('✅ 实时性能监控系统启动成功');
            
        } catch (error) {
            console.error('❌ 性能监控系统启动失败:', error);
        }
    }
    
    /**
     * 设置Core Web Vitals监控
     */
    setupWebVitalsMonitoring() {
        // FCP (First Contentful Paint) 监控
        const fcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
            
            if (fcpEntry) {
                this.metrics.fcp = fcpEntry.startTime;
                this.evaluateMetric('fcp', fcpEntry.startTime);
                console.log(`🎨 FCP: ${fcpEntry.startTime.toFixed(2)}ms`);
            }
        });
        
        try {
            fcpObserver.observe({ type: 'paint', buffered: true });
            this.observers.set('fcp', fcpObserver);
        } catch (error) {
            console.warn('FCP监控不支持:', error);
        }
        
        // LCP (Largest Contentful Paint) 监控
        const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            
            if (lastEntry) {
                this.metrics.lcp = lastEntry.startTime;
                this.evaluateMetric('lcp', lastEntry.startTime);
                console.log(`🖼️ LCP: ${lastEntry.startTime.toFixed(2)}ms`);
            }
        });
        
        try {
            lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
            this.observers.set('lcp', lcpObserver);
        } catch (error) {
            console.warn('LCP监控不支持:', error);
        }
        
        // CLS (Cumulative Layout Shift) 监控
        const clsObserver = new PerformanceObserver((list) => {
            let clsValue = 0;
            
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            
            this.metrics.cls += clsValue;
            this.evaluateMetric('cls', this.metrics.cls);
            
            if (clsValue > 0) {
                console.log(`📐 CLS增量: ${clsValue.toFixed(4)}, 累计: ${this.metrics.cls.toFixed(4)}`);
            }
        });
        
        try {
            clsObserver.observe({ type: 'layout-shift', buffered: true });
            this.observers.set('cls', clsObserver);
        } catch (error) {
            console.warn('CLS监控不支持:', error);
        }
        
        // FID (First Input Delay) 监控
        const fidObserver = new PerformanceObserver((list) => {
            const firstEntry = list.getEntries()[0];
            
            if (firstEntry) {
                this.metrics.fid = firstEntry.processingStart - firstEntry.startTime;
                this.evaluateMetric('fid', this.metrics.fid);
                console.log(`⚡ FID: ${this.metrics.fid.toFixed(2)}ms`);
            }
        });
        
        try {
            fidObserver.observe({ type: 'first-input', buffered: true });
            this.observers.set('fid', fidObserver);
        } catch (error) {
            console.warn('FID监控不支持:', error);
        }
    }
    
    /**
     * 设置运行时性能监控
     */
    setupRuntimeMonitoring() {
        // 内存使用监控
        const memoryInterval = setInterval(() => {
            if (performance.memory) {
                const memoryMB = performance.memory.usedJSHeapSize / (1024 * 1024);
                this.metrics.memoryUsage = memoryMB;
                this.evaluateMetric('memoryUsage', memoryMB);
                
                // 内存预警
                if (memoryMB > this.thresholds.memoryUsage.needsImprovement) {
                    this.triggerOptimization('memory_cleanup');
                }
            }
        }, 5000);
        
        this.intervals.set('memory', memoryInterval);
        
        // 帧率监控
        let frameCount = 0;
        let lastFrameTime = performance.now();
        
        const frameRateMonitor = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastFrameTime >= 1000) {
                this.metrics.frameRate = frameCount;
                this.evaluateMetric('frameRate', frameCount);
                
                if (frameCount < this.thresholds.frameRate.needsImprovement) {
                    this.triggerOptimization('reduce_animations');
                }
                
                frameCount = 0;
                lastFrameTime = currentTime;
            }
            
            requestAnimationFrame(frameRateMonitor);
        };
        
        requestAnimationFrame(frameRateMonitor);
    }
    
    /**
     * 设置自定义指标监控
     */
    setupCustomMetrics() {
        // 监听音频加载性能
        document.addEventListener('audioLoadComplete', (event) => {
            if (event.detail && event.detail.loadTime) {
                this.metrics.audioLoadTime = event.detail.loadTime;
                console.log(`🎵 音频加载时间: ${event.detail.loadTime}ms`);
            }
        });
        
        // 监听缓存命中率
        document.addEventListener('cacheMetricsUpdate', (event) => {
            if (event.detail && event.detail.hitRate) {
                this.metrics.cacheHitRate = event.detail.hitRate;
                console.log(`💾 缓存命中率: ${event.detail.hitRate}%`);
            }
        });
        
        // 监听用户交互
        const interactionEvents = ['click', 'touch', 'keydown'];
        interactionEvents.forEach(eventType => {
            document.addEventListener(eventType, () => {
                this.metrics.userInteractions++;
            });
        });
        
        // 监听JavaScript错误
        window.addEventListener('error', (event) => {
            this.metrics.errorCount++;
            this.logAlert('javascript_error', {
                message: event.message,
                filename: event.filename,
                line: event.lineno
            });
        });
        
        // 网络延迟监控
        const networkInterval = setInterval(() => {
            const startTime = performance.now();
            
            fetch('/favicon.ico', { mode: 'no-cors' })
                .then(() => {
                    const latency = performance.now() - startTime;
                    this.metrics.networkLatency = latency;
                })
                .catch(() => {
                    // 网络连接问题
                    this.metrics.networkLatency = 0;
                });
        }, 30000);
        
        this.intervals.set('network', networkInterval);
    }
    
    /**
     * 设置警报系统
     */
    setupAlertSystem() {
        // 性能劣化警报
        this.optimizationActions.set('memory_cleanup', () => {
            console.log('🧹 触发内存清理优化...');
            
            // 通知其他组件清理缓存
            document.dispatchEvent(new CustomEvent('performanceOptimization', {
                detail: { action: 'memory_cleanup' }
            }));
            
            // 建议垃圾回收（如果支持）
            if (window.gc) {
                window.gc();
            }
        });
        
        this.optimizationActions.set('reduce_animations', () => {
            console.log('🎨 触发动画降级优化...');
            
            document.documentElement.classList.add('performance-mode');
            
            // 通知设备分级系统降级
            if (window.deviceClassifier) {
                window.deviceClassifier.adjustPerformanceLevel('low');
            }
        });
        
        this.optimizationActions.set('cache_optimization', () => {
            console.log('💾 触发缓存优化...');
            
            if (window.cacheManager) {
                window.cacheManager.clearCache();
            }
        });
    }
    
    /**
     * 评估单个指标
     */
    evaluateMetric(metricName, value) {
        const threshold = this.thresholds[metricName];
        if (!threshold) {
            return;
        }
        
        let status = 'good';
        if (value > threshold.needsImprovement) {
            status = 'poor';
        } else if (value > threshold.good) {
            status = 'needsImprovement';
        }
        
        // 记录历史数据
        this.history.metrics.push({
            timestamp: Date.now(),
            metric: metricName,
            value: value,
            status: status
        });
        
        // 触发警报
        if (status === 'poor') {
            this.logAlert('performance_degradation', {
                metric: metricName,
                value: value,
                threshold: threshold.needsImprovement
            });
        }
    }
    
    /**
     * 触发性能优化
     */
    triggerOptimization(actionType) {
        const action = this.optimizationActions.get(actionType);
        if (action && !this.isOptimizationRecentlyTriggered(actionType)) {
            action();
            
            this.history.optimizations.push({
                timestamp: Date.now(),
                action: actionType
            });
        }
    }
    
    /**
     * 检查优化是否近期已触发（避免频繁触发）
     */
    isOptimizationRecentlyTriggered(actionType) {
        const recentThreshold = Date.now() - 60000; // 1分钟内
        return this.history.optimizations.some(opt => 
            opt.action === actionType && opt.timestamp > recentThreshold
        );
    }
    
    /**
     * 记录警报
     */
    logAlert(alertType, details) {
        const alert = {
            timestamp: Date.now(),
            type: alertType,
            details: details
        };
        
        this.history.alerts.push(alert);
        console.warn(`⚠️ 性能警报: ${alertType}`, details);
        
        // 通知监听器
        this.reportingCallbacks.forEach(callback => {
            try {
                callback('alert', alert);
            } catch (error) {
                console.warn('警报回调执行失败:', error);
            }
        });
    }
    
    /**
     * 开始性能报告
     */
    startReporting() {
        // 每30秒生成一次性能报告
        const reportingInterval = setInterval(() => {
            const report = this.generateReport();
            
            this.reportingCallbacks.forEach(callback => {
                try {
                    callback('report', report);
                } catch (error) {
                    console.warn('报告回调执行失败:', error);
                }
            });
            
            // 调试输出
            if (Math.random() < 0.1) { // 10%概率输出详细报告
                console.log('📊 性能监控报告:', report);
            }
            
        }, 30000);
        
        this.intervals.set('reporting', reportingInterval);
    }
    
    /**
     * 生成性能报告
     */
    generateReport() {
        const now = Date.now();
        
        return {
            timestamp: now,
            coreWebVitals: {
                fcp: this.metrics.fcp,
                lcp: this.metrics.lcp,
                cls: this.metrics.cls,
                fid: this.metrics.fid
            },
            runtime: {
                memoryUsage: this.metrics.memoryUsage,
                frameRate: this.metrics.frameRate,
                networkLatency: this.metrics.networkLatency
            },
            custom: {
                audioLoadTime: this.metrics.audioLoadTime,
                cacheHitRate: this.metrics.cacheHitRate,
                errorCount: this.metrics.errorCount,
                userInteractions: this.metrics.userInteractions
            },
            scores: this.calculateScores(),
            recommendations: this.generateRecommendations()
        };
    }
    
    /**
     * 计算性能得分
     */
    calculateScores() {
        const scores = {};
        
        Object.entries(this.metrics).forEach(([metric, value]) => {
            const threshold = this.thresholds[metric];
            if (threshold && value !== null && value !== undefined) {
                if (value <= threshold.good) {
                    scores[metric] = 100;
                } else if (value <= threshold.needsImprovement) {
                    scores[metric] = 50;
                } else {
                    scores[metric] = 0;
                }
            }
        });
        
        // 综合得分
        const validScores = Object.values(scores).filter(score => !isNaN(score));
        scores.overall = validScores.length > 0 
            ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
            : 0;
        
        return scores;
    }
    
    /**
     * 生成优化建议
     */
    generateRecommendations() {
        const recommendations = [];
        
        if (this.metrics.fcp > this.thresholds.fcp.needsImprovement) {
            recommendations.push('首屏渲染时间过长，建议优化关键路径资源');
        }
        
        if (this.metrics.lcp > this.thresholds.lcp.needsImprovement) {
            recommendations.push('最大内容渲染时间过长，建议预加载关键图片和字体');
        }
        
        if (this.metrics.cls > this.thresholds.cls.needsImprovement) {
            recommendations.push('布局抖动过多，建议为动态内容保留空间');
        }
        
        if (this.metrics.memoryUsage > this.thresholds.memoryUsage.needsImprovement) {
            recommendations.push('内存使用过高，建议清理未使用的音频缓存');
        }
        
        if (this.metrics.frameRate < this.thresholds.frameRate.needsImprovement) {
            recommendations.push('帧率过低，建议简化动画效果');
        }
        
        return recommendations;
    }
    
    /**
     * 添加报告回调
     */
    onReport(callback) {
        this.reportingCallbacks.add(callback);
    }
    
    /**
     * 移除报告回调
     */
    offReport(callback) {
        this.reportingCallbacks.delete(callback);
    }
    
    /**
     * 获取当前指标
     */
    getCurrentMetrics() {
        return { ...this.metrics };
    }
    
    /**
     * 获取历史数据
     */
    getHistory(type = 'all', limit = 100) {
        if (type === 'all') {
            return {
                metrics: this.history.metrics.slice(-limit),
                optimizations: this.history.optimizations.slice(-limit),
                alerts: this.history.alerts.slice(-limit)
            };
        }
        
        return this.history[type]?.slice(-limit) || [];
    }
    
    /**
     * 手动触发性能检查
     */
    performHealthCheck() {
        console.log('🔍 执行性能健康检查...');
        
        const report = this.generateReport();
        const scores = report.scores;
        
        if (scores.overall < 50) {
            console.warn('⚠️ 性能健康状况较差，建议采取优化措施');
            
            // 自动触发优化
            if (this.metrics.memoryUsage > this.thresholds.memoryUsage.good) {
                this.triggerOptimization('memory_cleanup');
            }
            
            if (this.metrics.frameRate < this.thresholds.frameRate.good) {
                this.triggerOptimization('reduce_animations');
            }
        } else {
            console.log('✅ 性能健康状况良好');
        }
        
        return report;
    }
    
    /**
     * 清理监控器
     */
    destroy() {
        // 清理观察者
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        
        // 清理定时器
        this.intervals.forEach(interval => clearInterval(interval));
        this.intervals.clear();
        
        // 清理回调
        this.reportingCallbacks.clear();
        
        console.log('🛑 性能监控系统已停止');
    }
}

// 创建全局实例
window.performanceMonitor = new RealTimePerformanceMonitor();

// 导出常用函数给其他模块使用
window.getPerformanceReport = () => window.performanceMonitor.generateReport();
window.performHealthCheck = () => window.performanceMonitor.performHealthCheck();

// 页面卸载前生成最终报告
window.addEventListener('beforeunload', () => {
    const finalReport = window.performanceMonitor.generateReport();
    console.log('📊 最终性能报告:', finalReport);
});

console.log('🚀 实时性能监控系统加载完成');