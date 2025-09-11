/**
 * 声音疗愈应用监控配置
 * 简单的客户端监控和分析设置
 * 
 * 使用方式：在 index.html 中引入此脚本
 * @date 2025-09-08
 */

class SimpleMonitoring {
    constructor() {
        this.sessionData = {
            startTime: Date.now(),
            events: [],
            errors: [],
            performance: {}
        };
        
        this.initializeMonitoring();
    }
    
    /**
     * 初始化监控
     */
    initializeMonitoring() {
        // 页面性能监控
        this.trackPagePerformance();
        
        // 错误监控
        this.setupErrorTracking();
        
        // 用户行为监控
        this.setupUserTracking();
        
        // 定期发送数据（可选）
        this.setupPeriodicReporting();
        
        console.log('📊 监控系统已启动');
    }
    
    /**
     * 页面性能监控
     */
    trackPagePerformance() {
        // 等待页面加载完成
        window.addEventListener('load', () => {
            if (performance && performance.timing) {
                const timing = performance.timing;
                const navigationStart = timing.navigationStart;
                
                this.sessionData.performance = {
                    // 页面加载时间
                    pageLoadTime: timing.loadEventEnd - navigationStart,
                    // DNS查询时间
                    dnsTime: timing.domainLookupEnd - timing.domainLookupStart,
                    // 首字节时间
                    ttfb: timing.responseStart - navigationStart,
                    // DOM构建时间
                    domTime: timing.domContentLoadedEventEnd - timing.domLoading,
                    // 资源加载时间
                    resourceTime: timing.loadEventEnd - timing.domContentLoadedEventEnd
                };
                
                this.logEvent('page_performance', this.sessionData.performance);
            }
        });
        
        // Core Web Vitals (如果支持)
        if ('web-vital' in window) {
            // LCP - 最大内容绘制
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    this.logEvent('lcp', { value: entry.startTime });
                }
            }).observe({ entryTypes: ['largest-contentful-paint'] });
            
            // FID - 首次输入延迟
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    this.logEvent('fid', { value: entry.processingStart - entry.startTime });
                }
            }).observe({ entryTypes: ['first-input'] });
        }
    }
    
    /**
     * 错误监控
     */
    setupErrorTracking() {
        // JavaScript 错误
        window.addEventListener('error', (event) => {
            const errorData = {
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error?.stack,
                timestamp: Date.now()
            };
            
            this.sessionData.errors.push(errorData);
            this.logEvent('javascript_error', errorData);
        });
        
        // Promise 错误
        window.addEventListener('unhandledrejection', (event) => {
            const errorData = {
                message: event.reason?.message || event.reason,
                stack: event.reason?.stack,
                timestamp: Date.now()
            };
            
            this.sessionData.errors.push(errorData);
            this.logEvent('promise_error', errorData);
        });
        
        // 资源加载错误
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                const errorData = {
                    type: 'resource_error',
                    element: event.target.tagName,
                    source: event.target.src || event.target.href,
                    timestamp: Date.now()
                };
                
                this.logEvent('resource_error', errorData);
            }
        }, true);
    }
    
    /**
     * 用户行为监控
     */
    setupUserTracking() {
        // 语言切换事件
        document.addEventListener('languageChanged', (event) => {
            this.logEvent('language_change', {
                from: event.detail?.from || 'unknown',
                to: event.detail?.to || 'unknown'
            });
        });
        
        // 音频播放事件
        document.addEventListener('click', (event) => {
            // 监控音频卡片点击
            if (event.target.closest('.ecosystem-card')) {
                const card = event.target.closest('.ecosystem-card');
                const category = card.dataset.category || 'unknown';
                
                this.logEvent('audio_category_click', { category });
            }
            
            // 监控播放控制点击
            if (event.target.closest('.play-pause-btn')) {
                this.logEvent('play_control_click', {
                    action: 'play_pause'
                });
            }
        });
        
        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            this.logEvent('visibility_change', {
                hidden: document.hidden,
                timestamp: Date.now()
            });
        });
    }
    
    /**
     * 定期报告（可选）
     */
    setupPeriodicReporting() {
        // 每5分钟记录一次会话状态
        setInterval(() => {
            this.logEvent('session_heartbeat', {
                duration: Date.now() - this.sessionData.startTime,
                eventCount: this.sessionData.events.length,
                errorCount: this.sessionData.errors.length
            });
        }, 5 * 60 * 1000);
        
        // 页面卸载时保存数据
        window.addEventListener('beforeunload', () => {
            this.saveSessionData();
        });
    }
    
    /**
     * 记录事件
     */
    logEvent(eventType, data = {}) {
        const event = {
            type: eventType,
            timestamp: Date.now(),
            data: data,
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        this.sessionData.events.push(event);
        
        // 控制台日志（开发环境）
        if (window.location.hostname === 'localhost' || window.location.protocol === 'file:') {
            console.log(`📊 [${eventType}]`, data);
        }
        
        // 可以在这里添加发送到服务器的逻辑
        // this.sendToServer(event);
    }
    
    /**
     * 保存会话数据到 localStorage
     */
    saveSessionData() {
        try {
            const sessionSummary = {
                duration: Date.now() - this.sessionData.startTime,
                eventCount: this.sessionData.events.length,
                errorCount: this.sessionData.errors.length,
                performance: this.sessionData.performance,
                timestamp: new Date().toISOString()
            };
            
            // 保存会话摘要
            localStorage.setItem('app_session_summary', JSON.stringify(sessionSummary));
            
            // 如果需要详细数据，可以保存完整的 sessionData
            // localStorage.setItem('app_session_data', JSON.stringify(this.sessionData));
            
        } catch (error) {
            console.warn('保存会话数据失败:', error);
        }
    }
    
    /**
     * 获取监控报告
     */
    getReport() {
        return {
            session: this.sessionData,
            summary: {
                duration: Date.now() - this.sessionData.startTime,
                eventCount: this.sessionData.events.length,
                errorCount: this.sessionData.errors.length,
                errorRate: (this.sessionData.errors.length / this.sessionData.events.length * 100).toFixed(2) + '%'
            }
        };
    }
    
    /**
     * 发送数据到服务器（示例）
     * 实际使用时需要替换为真实的端点
     */
    sendToServer(data) {
        // 示例：发送到 Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', data.type, {
                custom_parameter: JSON.stringify(data.data),
                timestamp: data.timestamp
            });
        }
        
        // 示例：发送到自定义端点
        // fetch('/api/analytics', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // }).catch(console.warn);
    }
}

// 自动初始化监控（如果在浏览器环境中）
if (typeof window !== 'undefined') {
    window.simpleMonitoring = new SimpleMonitoring();
    
    // 提供全局访问方法
    window.getMonitoringReport = () => window.simpleMonitoring.getReport();
    window.logCustomEvent = (type, data) => window.simpleMonitoring.logEvent(type, data);
    
    console.log('📊 简单监控系统已就绪');
}