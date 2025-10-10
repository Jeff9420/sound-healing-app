class PerformanceMonitor {
    constructor() {
        this.metrics = {
            audioLoadTime: new Map(),
            memoryUsage: [],
            userInteractions: 0,
            errorCount: 0,
            sessionStart: Date.now()
        };
        this.monitoringInterval = null;
        this.isMonitoring = false;
    }

    startMonitoring() {
        if (this.isMonitoring) {
            return;
        }
        
        this.isMonitoring = true;
        this.monitoringInterval = setInterval(() => {
            this.collectMemoryMetrics();
            this.checkPerformanceThresholds();
        }, 30000);

        this.setupPerformanceObserver();
        console.log('性能监控已启动');
    }

    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        this.isMonitoring = false;
    }

    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.entryType === 'resource' && entry.name.includes('.mp3')) {
                            this.recordAudioLoadTime(entry.name, entry.duration);
                        }
                    }
                });
                observer.observe({ entryTypes: ['resource'] });
            } catch (error) {
                console.warn('Performance Observer setup failed:', error);
            }
        }
    }

    recordAudioLoadTime(audioUrl, loadTime) {
        const audioName = audioUrl.split('/').pop();
        this.metrics.audioLoadTime.set(audioName, loadTime);
        
        if (loadTime > 3000) {
            console.warn(`音频加载较慢: ${audioName} - ${loadTime}ms`);
        }
    }

    collectMemoryMetrics() {
        if ('memory' in performance) {
            const memInfo = {
                timestamp: Date.now(),
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
            
            this.metrics.memoryUsage.push(memInfo);
            
            if (this.metrics.memoryUsage.length > 100) {
                this.metrics.memoryUsage.shift();
            }
        }
    }

    checkPerformanceThresholds() {
        if ('memory' in performance) {
            const currentMemory = performance.memory.usedJSHeapSize / 1024 / 1024;
            
            if (currentMemory > 100) {
                console.warn(`内存使用过高: ${currentMemory.toFixed(2)}MB`);
                this.triggerMemoryCleanup();
            }
        }

        const audioLoadTimes = Array.from(this.metrics.audioLoadTime.values());
        const avgLoadTime = audioLoadTimes.reduce((a, b) => a + b, 0) / audioLoadTimes.length;
        
        if (avgLoadTime > 5000) {
            console.warn(`音频加载平均时间过长: ${avgLoadTime.toFixed(0)}ms`);
        }
    }

    triggerMemoryCleanup() {
        if (window.gc) {
            window.gc();
            console.log('手动垃圾回收已触发');
        }
        
        setTimeout(() => {
            this.collectMemoryMetrics();
        }, 1000);
    }

    recordUserInteraction() {
        this.metrics.userInteractions++;
    }

    recordError(error) {
        this.metrics.errorCount++;
        console.error('性能监控记录错误:', error);
    }

    getMetricsSummary() {
        const sessionDuration = Date.now() - this.metrics.sessionStart;
        const currentMemory = performance.memory ? 
            performance.memory.usedJSHeapSize / 1024 / 1024 : 0;

        return {
            sessionDuration: Math.round(sessionDuration / 1000),
            userInteractions: this.metrics.userInteractions,
            errorCount: this.metrics.errorCount,
            currentMemoryMB: Math.round(currentMemory * 100) / 100,
            audioLoadTimes: Object.fromEntries(this.metrics.audioLoadTime),
            memoryTrend: this.getMemoryTrend()
        };
    }

    getMemoryTrend() {
        if (this.metrics.memoryUsage.length < 2) {
            return 'stable';
        }
        
        const recent = this.metrics.memoryUsage.slice(-5);
        const oldAvg = recent.slice(0, 2).reduce((a, b) => a + b.used, 0) / 2;
        const newAvg = recent.slice(-2).reduce((a, b) => a + b.used, 0) / 2;
        
        const change = (newAvg - oldAvg) / oldAvg;
        
        if (change > 0.1) {
            return 'increasing';
        }
        if (change < -0.1) {
            return 'decreasing';
        }
        return 'stable';
    }

    exportMetrics() {
        const summary = this.getMetricsSummary();
        const blob = new Blob([JSON.stringify(summary, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sound-healing-metrics-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}