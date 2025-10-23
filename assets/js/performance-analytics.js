/**
 * Performance Analytics Monitor
 * 性能分析监控系统 - 监控网站加载速度、用户行为和资源使用情况
 * Version: 1.0.0
 * Author: SoundFlows Team
 */

class PerformanceAnalytics {
    constructor() {
        this.metrics = {
            // Core Web Vitals
            coreWebVitals: {
                LCP: null, // Largest Contentful Paint
                FID: null, // First Input Delay
                CLS: null, // Cumulative Layout Shift
                FCP: null, // First Contentful Paint
                TTFB: null // Time to First Byte
            },
            // Custom metrics
            custom: {
                audioLoadTime: null,
                videoLoadTime: null,
                imageLoadTime: null,
                jsLoadTime: null,
                cssLoadTime: null,
                firstInteraction: null,
                pageLoadComplete: null
            },
            // User engagement
            engagement: {
                sessionDuration: null,
                pageViews: 0,
                audioPlayCount: 0,
                interactionCount: 0,
                bounceRate: null
            },
            // Resource usage
            resources: {
                memoryUsage: null,
                networkRequests: 0,
                totalTransferSize: 0,
                cachedResources: 0
            }
        };

        this.observers = [];
        this.startTime = performance.now();
        this.sessionId = this.generateSessionId();
        this.config = {
            sampleRate: 0.1, // 10% sampling rate
            debug: window.location.hostname === 'localhost',
            endpoint: '/api/performance-metrics', // 实际部署时需要配置
            sendInterval: 30000, // 30秒发送一次
            maxRetries: 3
        };

        this.init();
    }

    init() {
        // 监控 Core Web Vitals
        this.observeCoreWebVitals();

        // 监控资源加载
        this.observeResourceLoading();

        // 监控用户交互
        this.observeUserInteractions();

        // 监控音频性能
        this.observeAudioPerformance();

        // 监控内存使用
        this.observeMemoryUsage();

        // 定期发送数据
        this.scheduleDataSending();

        // 页面卸载时发送最终数据
        this.addEventListener('beforeunload', () => {
            this.sendFinalData();
        });

        if (this.config.debug) {
            console.log('🚀 Performance Analytics initialized');
            this.createDebugPanel();
        }
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Core Web Vitals 监控
    observeCoreWebVitals() {
        // LCP - Largest Contentful Paint
        this.observeLCP();

        // FID - First Input Delay
        this.observeFID();

        // CLS - Cumulative Layout Shift
        this.observeCLS();

        // FCP - First Contentful Paint
        this.observeFCP();

        // TTFB - Time to First Byte
        this.observeTTFB();
    }

    observeLCP() {
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.metrics.coreWebVitals.LCP = lastEntry.renderTime || lastEntry.loadTime;
            this.recordMetric('LCP', this.metrics.coreWebVitals.LCP);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
    }

    observeFID() {
        new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                this.metrics.coreWebVitals.FID = entry.processingStart - entry.startTime;
                this.recordMetric('FID', this.metrics.coreWebVitals.FID);
            }
        }).observe({ entryTypes: ['first-input'] });
    }

    observeCLS() {
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            this.metrics.coreWebVitals.CLS = clsValue;
            this.recordMetric('CLS', clsValue);
        }).observe({ entryTypes: ['layout-shift'] });
    }

    observeFCP() {
        new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (entry.name === 'first-contentful-paint') {
                    this.metrics.coreWebVitals.FCP = entry.startTime;
                    this.recordMetric('FCP', this.metrics.coreWebVitals.FCP);
                }
            }
        }).observe({ entryTypes: ['paint'] });
    }

    observeTTFB() {
        if (window.performance.timing) {
            const ttfb = window.performance.timing.responseStart - window.performance.timing.navigationStart;
            this.metrics.coreWebVitals.TTFB = ttfb;
            this.recordMetric('TTFB', ttfb);
        }
    }

    // 资源加载监控
    observeResourceLoading() {
        const observer = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                this.metrics.resources.networkRequests++;
                this.metrics.resources.totalTransferSize += entry.transferSize || 0;

                if (entry.transferSize === 0) {
                    this.metrics.resources.cachedResources++;
                }

                // 分类记录资源加载时间
                switch (entry.initiatorType) {
                    case 'img':
                        this.recordImageLoadTime(entry.duration);
                        break;
                    case 'script':
                        this.recordJSLoadTime(entry.duration);
                        break;
                    case 'link':
                        this.recordCSSLoadTime(entry.duration);
                        break;
                    case 'video':
                        this.recordVideoLoadTime(entry.duration);
                        break;
                }
            }
        });
        observer.observe({ entryTypes: ['resource'] });
    }

    // 用户交互监控
    observeUserInteractions() {
        let firstInteraction = null;

        const interactionEvents = ['click', 'scroll', 'keydown', 'touchstart'];

        interactionEvents.forEach(eventType => {
            document.addEventListener(eventType, () => {
                if (!firstInteraction) {
                    firstInteraction = performance.now() - this.startTime;
                    this.metrics.custom.firstInteraction = firstInteraction;
                    this.recordMetric('FirstInteraction', firstInteraction);
                }

                this.metrics.engagement.interactionCount++;
            }, { once: eventType === 'click', passive: true });
        });

        // 监控页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.metrics.engagement.sessionDuration = performance.now() - this.startTime;
            }
        });
    }

    // 音频性能监控
    observeAudioPerformance() {
        // 监控音频加载时间
        if (window.audioManager) {
            const originalLoadTrack = window.audioManager.loadTrack;
            window.audioManager.loadTrack = (...args) => {
                const startTime = performance.now();
                const result = originalLoadTrack.apply(window.audioManager, args);

                result.then(() => {
                    const loadTime = performance.now() - startTime;
                    this.recordAudioLoadTime(loadTime);
                }).catch(error => {
                    console.error('Audio load error:', error);
                });

                return result;
            };

            // 监控音频播放次数
            const originalPlay = window.audioManager.play;
            window.audioManager.play = (...args) => {
                this.metrics.engagement.audioPlayCount++;
                return originalPlay.apply(window.audioManager, args);
            };
        }
    }

    // 内存使用监控
    observeMemoryUsage() {
        if (window.performance && window.performance.memory) {
            setInterval(() => {
                this.metrics.resources.memoryUsage = {
                    usedJSHeapSize: window.performance.memory.usedJSHeapSize,
                    totalJSHeapSize: window.performance.memory.totalJSHeapSize,
                    jsHeapSizeLimit: window.performance.memory.jsHeapSizeLimit
                };
            }, 10000); // 每10秒记录一次
        }
    }

    // 记录各类指标
    recordMetric(name, value) {
        const event = {
            name: `performance_${name}`,
            value: value,
            timestamp: performance.now(),
            sessionId: this.sessionId,
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        // 发送到 Google Analytics
        if (window.gtag) {
            window.gtag('event', 'performance_metric', {
                metric_name: name,
                metric_value: value,
                custom_map: { custom_parameter: name }
            });
        }

        // 发送到 Amplitude
        if (window.amplitude) {
            window.amplitude.track('Performance Metric', {
                [name]: value,
                page: window.location.pathname
            });
        }

        if (this.config.debug) {
            console.log(`📊 Performance Metric: ${name} = ${value.toFixed(2)}ms`);
        }
    }

    recordAudioLoadTime(time) {
        this.metrics.custom.audioLoadTime = time;
        this.recordMetric('AudioLoadTime', time);
    }

    recordVideoLoadTime(time) {
        this.metrics.custom.videoLoadTime = time;
        this.recordMetric('VideoLoadTime', time);
    }

    recordImageLoadTime(time) {
        this.metrics.custom.imageLoadTime = time;
        this.recordMetric('ImageLoadTime', time);
    }

    recordJSLoadTime(time) {
        this.metrics.custom.jsLoadTime = time;
        this.recordMetric('JSLoadTime', time);
    }

    recordCSSLoadTime(time) {
        this.metrics.custom.cssLoadTime = time;
        this.recordMetric('CSSLoadTime', time);
    }

    // 获取性能评分
    getPerformanceScore() {
        const weights = {
            LCP: 0.3,
            FID: 0.2,
            CLS: 0.2,
            FCP: 0.15,
            TTFB: 0.15
        };

        const scores = {
            LCP: this.scoreLCP(this.metrics.coreWebVitals.LCP),
            FID: this.scoreFID(this.metrics.coreWebVitals.FID),
            CLS: this.scoreCLS(this.metrics.coreWebVitals.CLS),
            FCP: this.scoreFCP(this.metrics.coreWebVitals.FCP),
            TTFB: this.scoreTTFB(this.metrics.coreWebVitals.TTFB)
        };

        const totalScore = Object.keys(weights).reduce((sum, key) => {
            return sum + (scores[key] * weights[key]);
        }, 0);

        return {
            total: Math.round(totalScore),
            individual: scores,
            grade: this.getGrade(totalScore)
        };
    }

    scoreLCP(lcp) {
        if (lcp < 2500) return 100;
        if (lcp < 4000) return 75;
        return 50;
    }

    scoreFID(fid) {
        if (fid < 100) return 100;
        if (fid < 300) return 75;
        return 50;
    }

    scoreCLS(cls) {
        if (cls < 0.1) return 100;
        if (cls < 0.25) return 75;
        return 50;
    }

    scoreFCP(fcp) {
        if (fcp < 1800) return 100;
        if (fcp < 3000) return 75;
        return 50;
    }

    scoreTTFB(ttfb) {
        if (ttfb < 800) return 100;
        if (ttfb < 1800) return 75;
        return 50;
    }

    getGrade(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    // 性能优化建议
    getOptimizationSuggestions() {
        const suggestions = [];
        const metrics = this.metrics.coreWebVitals;

        if (metrics.LCP > 2500) {
            suggestions.push({
                type: 'LCP',
                severity: metrics.LCP > 4000 ? 'high' : 'medium',
                message: '最大内容绘制时间过长',
                solutions: [
                    '优化图片格式和尺寸',
                    '使用WebP格式',
                    '实施懒加载',
                    '使用CDN加速'
                ]
            });
        }

        if (metrics.FID > 100) {
            suggestions.push({
                type: 'FID',
                severity: metrics.FID > 300 ? 'high' : 'medium',
                message: '首次输入延迟过长',
                solutions: [
                    '减少JavaScript执行时间',
                    '分割代码块',
                    '使用Web Workers',
                    '优化第三方脚本'
                ]
            });
        }

        if (metrics.CLS > 0.1) {
            suggestions.push({
                type: 'CLS',
                severity: metrics.CLS > 0.25 ? 'high' : 'medium',
                message: '累计布局偏移过大',
                solutions: [
                    '为图片和广告设置尺寸',
                    '避免动态插入内容',
                    '使用transform动画',
                    '预留空间给异步内容'
                ]
            });
        }

        return suggestions;
    }

    // 发送数据
    scheduleDataSending() {
        setInterval(() => {
            this.sendMetrics();
        }, this.config.sendInterval);
    }

    async sendMetrics() {
        if (Math.random() > this.config.sampleRate) {
            return; // 采样控制
        }

        const payload = {
            sessionId: this.sessionId,
            timestamp: Date.now(),
            url: window.location.href,
            metrics: this.metrics,
            score: this.getPerformanceScore(),
            suggestions: this.getOptimizationSuggestions()
        };

        try {
            const response = await fetch(this.config.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            if (this.config.debug) {
                console.log('✅ Performance metrics sent successfully');
            }
        } catch (error) {
            console.error('❌ Failed to send performance metrics:', error);
            // 存储到本地，稍后重试
            this.storeMetricsLocally(payload);
        }
    }

    storeMetricsLocally(metrics) {
        const stored = localStorage.getItem('pending_performance_metrics') || '[]';
        const pending = JSON.parse(stored);
        pending.push(metrics);

        // 保留最近50条记录
        if (pending.length > 50) {
            pending.splice(0, pending.length - 50);
        }

        localStorage.setItem('pending_performance_metrics', JSON.stringify(pending));
    }

    sendFinalData() {
        this.metrics.custom.pageLoadComplete = performance.now() - this.startTime;
        this.metrics.engagement.sessionDuration = performance.now() - this.startTime;
        this.sendMetrics();
    }

    // 创建调试面板
    createDebugPanel() {
        const panel = document.createElement('div');
        panel.id = 'performance-debug-panel';
        panel.innerHTML = `
            <div style="position: fixed; bottom: 20px; right: 20px; background: rgba(0,0,0,0.9); color: white; padding: 15px; border-radius: 10px; font-family: monospace; font-size: 12px; z-index: 10000; min-width: 300px;">
                <h3 style="margin: 0 0 10px 0;">Performance Monitor</h3>
                <div id="perf-metrics-content"></div>
                <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 5px; right: 5px; background: none; border: none; color: white; cursor: pointer;">✕</button>
            </div>
        `;

        document.body.appendChild(panel);

        // 定期更新显示
        setInterval(() => {
            this.updateDebugPanel();
        }, 1000);
    }

    updateDebugPanel() {
        const content = document.getElementById('perf-metrics-content');
        if (!content) return;

        const score = this.getPerformanceScore();
        const metrics = this.metrics.coreWebVitals;

        content.innerHTML = `
            <div>Performance Score: <span style="color: ${score.grade === 'A' ? '#4CAF50' : score.grade === 'F' ? '#F44336' : '#FFC107'}">${score.grade} (${score.total})</span></div>
            <div>LCP: ${metrics.LCP ? metrics.LCP.toFixed(0) + 'ms' : 'N/A'}</div>
            <div>FID: ${metrics.FID ? metrics.FID.toFixed(0) + 'ms' : 'N/A'}</div>
            <div>CLS: ${metrics.CLS ? metrics.CLS.toFixed(3) : 'N/A'}</div>
            <div>FCP: ${metrics.FCP ? metrics.FCP.toFixed(0) + 'ms' : 'N/A'}</div>
            <div>TTFB: ${metrics.TTFB ? metrics.TTFB.toFixed(0) + 'ms' : 'N/A'}</div>
            <hr style="margin: 10px 0; border: 1px solid #333;">
            <div>Audio Plays: ${this.metrics.engagement.audioPlayCount}</div>
            <div>Interactions: ${this.metrics.engagement.interactionCount}</div>
            <div>Session: ${(performance.now() - this.startTime).toFixed(0)}ms</div>
        `;
    }

    // 公共API
    getMetrics() {
        return {
            ...this.metrics,
            score: this.getPerformanceScore(),
            suggestions: this.getOptimizationSuggestions()
        };
    }

    // 手动记录自定义指标
    recordCustomMetric(name, value) {
        this.metrics.custom[name] = value;
        this.recordMetric(name, value);
    }
}

// 初始化性能监控
window.performanceAnalytics = new PerformanceAnalytics();

// 导出到全局
window.PerformanceAnalytics = PerformanceAnalytics;