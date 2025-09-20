/**
 * Google Analytics 4 配置和增强事件跟踪
 * 专为声音疗愈应用优化的GA4集成
 *
 * @version 1.0.0
 * @date 2024-09-20
 */

class GA4Config {
    constructor() {
        // GA4测量ID
        this.measurementId = 'G-4NZR3HR3J1';

        this.isInitialized = false;
        this.debugMode = this.isDebugEnvironment();

        // 自定义维度映射
        this.customDimensions = {
            user_segment: 'custom_parameter_1',
            session_id: 'custom_parameter_2',
            audio_category: 'custom_parameter_3',
            user_type: 'custom_parameter_4',
            session_duration: 'custom_parameter_5'
        };

        // 初始化GA4
        this.init();
    }

    /**
     * 初始化GA4配置
     */
    init() {
        if (typeof gtag === 'undefined') {
            console.warn('GA4Config: gtag未加载，等待加载完成...');
            this.waitForGtag();
            return;
        }

        this.configureGA4();
        this.setupEnhancedEvents();
        this.isInitialized = true;

        console.log('✅ GA4Config: 初始化完成', {
            measurementId: this.measurementId,
            debugMode: this.debugMode
        });
    }

    /**
     * 等待gtag加载完成
     */
    waitForGtag() {
        const checkGtag = () => {
            if (typeof gtag !== 'undefined') {
                this.init();
            } else {
                setTimeout(checkGtag, 100);
            }
        };
        checkGtag();
    }

    /**
     * 配置GA4基础设置
     */
    configureGA4() {
        gtag('config', this.measurementId, {
            'send_page_view': true,
            'anonymize_ip': true,
            'allow_google_signals': true,
            'allow_ad_personalization_signals': false, // 隐私保护
            'cookie_expires': 63072000, // 2年
            'cookie_flags': 'SameSite=None;Secure',
            'debug_mode': this.debugMode,
            'custom_map': this.customDimensions
        });

        // 设置默认用户属性
        this.setDefaultUserProperties();
    }

    /**
     * 设置默认用户属性
     */
    setDefaultUserProperties() {
        const userAgent = navigator.userAgent;
        const language = navigator.language || 'unknown';
        const screenResolution = `${screen.width}x${screen.height}`;

        gtag('set', 'user_properties', {
            'app_name': '声音疗愈',
            'app_version': '1.0.0',
            'device_type': this.getDeviceType(),
            'browser_type': this.getBrowserType(),
            'language': language,
            'screen_resolution': screenResolution,
            'timezone': Intl.DateTimeFormat().resolvedOptions().timeZone
        });
    }

    /**
     * 设置增强事件跟踪
     */
    setupEnhancedEvents() {
        // 音频播放事件监听
        document.addEventListener('audioPlay', (e) => {
            this.trackAudioEvent('audio_play', e.detail);
        });

        document.addEventListener('audioPause', (e) => {
            this.trackAudioEvent('audio_pause', e.detail);
        });

        document.addEventListener('audioEnd', (e) => {
            this.trackAudioEvent('audio_complete', e.detail);
        });

        // 用户交互事件
        document.addEventListener('click', (e) => {
            this.trackUserInteraction(e);
        });

        // 页面滚动深度
        this.setupScrollTracking();

        // 页面停留时间
        this.setupTimeOnPageTracking();
    }

    /**
     * 跟踪音频事件
     */
    trackAudioEvent(action, detail) {
        if (!this.isInitialized) return;

        const eventData = {
            'event_category': 'audio_interaction',
            'event_label': detail.fileName || 'unknown',
            'audio_category': detail.category || 'unknown',
            'custom_parameter_3': detail.category || 'unknown'
        };

        if (detail.duration) {
            eventData.value = Math.round(detail.duration);
        }

        if (detail.playTime) {
            eventData.play_time = Math.round(detail.playTime);
        }

        gtag('event', action, eventData);

        if (this.debugMode) {
            console.log('🎵 GA4: 音频事件跟踪', action, eventData);
        }
    }

    /**
     * 跟踪用户交互
     */
    trackUserInteraction(event) {
        const target = event.target;
        const element = target.closest('[data-ga-category]') || target;

        // 特定元素的交互跟踪
        if (element.closest('.carousel-item')) {
            this.trackEvent('category_select', {
                'event_category': 'navigation',
                'event_label': element.closest('.carousel-item').dataset.category || 'unknown'
            });
        }

        if (element.closest('.control-btn')) {
            this.trackEvent('control_interaction', {
                'event_category': 'audio_controls',
                'event_label': element.className.replace('control-btn', '').trim() || 'unknown'
            });
        }

        if (element.closest('.language-switch')) {
            this.trackEvent('language_change', {
                'event_category': 'localization',
                'event_label': element.textContent || 'unknown'
            });
        }
    }

    /**
     * 设置滚动深度跟踪
     */
    setupScrollTracking() {
        let maxScroll = 0;
        const thresholds = [25, 50, 75, 90, 100];
        const tracked = new Set();

        const trackScroll = () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );

            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;

                thresholds.forEach(threshold => {
                    if (scrollPercent >= threshold && !tracked.has(threshold)) {
                        tracked.add(threshold);
                        this.trackEvent('scroll_depth', {
                            'event_category': 'engagement',
                            'event_label': `${threshold}%`,
                            'value': threshold
                        });
                    }
                });
            }
        };

        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(trackScroll, 100);
        }, { passive: true });
    }

    /**
     * 设置页面停留时间跟踪
     */
    setupTimeOnPageTracking() {
        const startTime = Date.now();
        const intervals = [30, 60, 180, 300, 600]; // 30秒，1分钟，3分钟，5分钟，10分钟
        const tracked = new Set();

        const checkTimeOnPage = () => {
            const timeOnPage = Math.round((Date.now() - startTime) / 1000);

            intervals.forEach(interval => {
                if (timeOnPage >= interval && !tracked.has(interval)) {
                    tracked.add(interval);
                    this.trackEvent('time_on_page', {
                        'event_category': 'engagement',
                        'event_label': `${interval}s`,
                        'value': interval
                    });
                }
            });
        };

        setInterval(checkTimeOnPage, 10000); // 每10秒检查一次

        // 页面关闭时记录总停留时间
        window.addEventListener('beforeunload', () => {
            const totalTime = Math.round((Date.now() - startTime) / 1000);
            this.trackEvent('session_duration', {
                'event_category': 'engagement',
                'value': totalTime,
                'custom_parameter_5': totalTime
            });
        });
    }

    /**
     * 通用事件跟踪方法
     */
    trackEvent(eventName, parameters = {}) {
        if (!this.isInitialized) return;

        gtag('event', eventName, parameters);

        if (this.debugMode) {
            console.log('📊 GA4: 事件跟踪', eventName, parameters);
        }
    }

    /**
     * 跟踪音频会话
     */
    trackAudioSession(category, duration, completionRate) {
        this.trackEvent('audio_session_complete', {
            'event_category': 'audio_usage',
            'event_label': category,
            'value': Math.round(duration),
            'custom_parameter_3': category,
            'completion_rate': Math.round(completionRate * 100)
        });
    }

    /**
     * 跟踪用户细分
     */
    trackUserSegment(segment) {
        gtag('set', 'user_properties', {
            'user_segment': segment,
            'custom_parameter_1': segment
        });

        this.trackEvent('user_segment_identified', {
            'event_category': 'user_analysis',
            'event_label': segment
        });
    }

    /**
     * 跟踪转化事件
     */
    trackConversion(conversionType, value = 0) {
        this.trackEvent('conversion', {
            'event_category': 'conversion',
            'event_label': conversionType,
            'value': value
        });
    }

    /**
     * 跟踪错误事件
     */
    trackError(errorType, errorMessage) {
        this.trackEvent('exception', {
            'description': errorMessage,
            'fatal': false,
            'event_category': 'error',
            'event_label': errorType
        });
    }

    /**
     * 跟踪性能指标
     */
    trackPerformance() {
        if (typeof performance !== 'undefined' && performance.navigation) {
            const timing = performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            const domReadyTime = timing.domContentLoadedEventEnd - timing.navigationStart;

            this.trackEvent('performance_timing', {
                'event_category': 'performance',
                'page_load_time': Math.round(loadTime),
                'dom_ready_time': Math.round(domReadyTime)
            });
        }
    }

    /**
     * 辅助方法
     */
    isDebugEnvironment() {
        return window.location.hostname === 'localhost' ||
               window.location.hostname.includes('127.0.0.1') ||
               window.location.hostname.includes('test');
    }

    getDeviceType() {
        if (/Mobile|Android|iPhone|iPad/.test(navigator.userAgent)) {
            return 'mobile';
        } else if (/Tablet|iPad/.test(navigator.userAgent)) {
            return 'tablet';
        }
        return 'desktop';
    }

    getBrowserType() {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Chrome')) return 'chrome';
        if (userAgent.includes('Firefox')) return 'firefox';
        if (userAgent.includes('Safari')) return 'safari';
        if (userAgent.includes('Edge')) return 'edge';
        return 'unknown';
    }

    /**
     * 获取GA4测量ID（供其他模块使用）
     */
    getMeasurementId() {
        return this.measurementId;
    }

    /**
     * 设置测量ID（用于配置）
     */
    setMeasurementId(id) {
        this.measurementId = id;
        console.log('GA4Config: 测量ID已更新为', id);
    }
}

// 全局实例
let ga4Config;

// 等待DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    ga4Config = new GA4Config();
    window.ga4Config = ga4Config; // 全局访问
});

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GA4Config;
}