/**
 * 广告分析和监控系统
 * 负责广告性能监控、用户行为分析和收入优化
 *
 * @date 2024-09-18
 */

class AdAnalytics {
    constructor() {
        this.sessionData = {
            startTime: Date.now(),
            pageViews: 0,
            adImpressions: 0,
            adClicks: 0,
            userInteractions: 0,
            audioPlayTime: 0,
            meditationSessions: 0
        };

        this.adPerformance = {
            daily: {},
            weekly: {},
            monthly: {}
        };

        this.userSegments = {
            newUser: false,
            returningUser: false,
            premiumUser: false,
            sleepUser: false,
            meditationUser: false
        };

        this.revenueTracking = {
            estimatedRevenue: 0,
            cpm: 0,
            ctr: 0,
            fillRate: 0
        };

        this.init();
    }

    /**
     * 初始化分析系统
     */
    init() {
        console.log('📊 AdAnalytics: 初始化广告分析系统');

        this.identifyUserSegment();
        this.setupEventTracking();
        this.loadHistoricalData();
        this.startSessionTracking();

        // 每5分钟保存一次数据
        setInterval(() => {
            this.saveSessionData();
        }, 300000);

        // 页面关闭时保存数据
        window.addEventListener('beforeunload', () => {
            this.saveSessionData();
        });
    }

    /**
     * 识别用户细分
     */
    identifyUserSegment() {
        // 检查是否是新用户
        const firstVisit = localStorage.getItem('firstVisit');
        if (!firstVisit) {
            this.userSegments.newUser = true;
            localStorage.setItem('firstVisit', Date.now().toString());
        } else {
            this.userSegments.returningUser = true;
        }

        // 检查是否是Premium用户
        this.userSegments.premiumUser = localStorage.getItem('isPremium') === 'true';

        // 分析使用模式
        this.analyzeUsagePatterns();
    }

    /**
     * 分析使用模式
     */
    analyzeUsagePatterns() {
        const usageHistory = JSON.parse(localStorage.getItem('usageHistory') || '[]');

        // 分析使用时间偏好
        const eveningUsage = usageHistory.filter(session => {
            const hour = new Date(session.timestamp).getHours();
            return hour >= 20 || hour <= 6;
        }).length;

        const totalSessions = usageHistory.length;

        if (totalSessions > 0) {
            // 如果70%以上的使用在晚间，标记为睡眠用户
            if (eveningUsage / totalSessions > 0.7) {
                this.userSegments.sleepUser = true;
            }

            // 分析音频偏好
            const meditationUsage = usageHistory.filter(session =>
                session.categories && (
                    session.categories.includes('meditation') ||
                    session.categories.includes('chakra')
                )
            ).length;

            if (meditationUsage / totalSessions > 0.5) {
                this.userSegments.meditationUser = true;
            }
        }

        console.log('👤 用户细分:', this.userSegments);
    }

    /**
     * 设置事件追踪
     */
    setupEventTracking() {
        // 追踪页面访问
        this.trackPageView();

        // 追踪用户交互
        this.setupInteractionTracking();

        // 追踪音频播放
        this.setupAudioTracking();

        // 追踪广告事件
        this.setupAdTracking();
    }

    /**
     * 追踪页面访问
     */
    trackPageView() {
        this.sessionData.pageViews++;

        // 发送到Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('config', 'GA_MEASUREMENT_ID', {
                page_title: document.title,
                page_location: window.location.href,
                custom_map: {
                    'custom_parameter_1': 'user_segment',
                    'custom_parameter_2': 'session_id'
                }
            });

            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href,
                user_segment: this.getUserSegmentString(),
                session_id: this.getSessionId()
            });
        }
    }

    /**
     * 设置交互追踪
     */
    setupInteractionTracking() {
        const trackableEvents = ['click', 'scroll', 'keypress', 'touchstart'];

        trackableEvents.forEach(eventType => {
            document.addEventListener(eventType, (e) => {
                this.sessionData.userInteractions++;

                // 追踪特定元素的交互
                if (e.target.closest('.carousel-item')) {
                    this.trackEvent('carousel_interaction', {
                        category: e.target.closest('.carousel-item').dataset.category,
                        action: eventType
                    });
                }

                if (e.target.closest('.ad-container')) {
                    this.trackEvent('ad_interaction', {
                        position: e.target.closest('.ad-container').id,
                        action: eventType
                    });
                }
            }, { passive: true, once: false });
        });
    }

    /**
     * 设置音频追踪
     */
    setupAudioTracking() {
        // 监听音频播放事件
        document.addEventListener('audioPlay', (e) => {
            this.trackEvent('audio_play', {
                category: e.detail.category,
                fileName: e.detail.fileName,
                userSegment: this.getUserSegmentString()
            });

            this.startAudioSession();
        });

        document.addEventListener('audioPause', (e) => {
            this.trackEvent('audio_pause', {
                duration: e.detail.playTime
            });

            this.endAudioSession();
        });

        document.addEventListener('audioEnd', (e) => {
            this.trackEvent('audio_complete', {
                category: e.detail.category,
                duration: e.detail.duration
            });

            this.sessionData.meditationSessions++;
            this.considerShowingAd('session_complete');
        });
    }

    /**
     * 设置广告追踪
     */
    setupAdTracking() {
        // 监听广告展示
        document.addEventListener('adImpression', (e) => {
            this.trackAdImpression(e.detail);
        });

        // 监听广告点击
        document.addEventListener('adClick', (e) => {
            this.trackAdClick(e.detail);
        });

        // 监听广告收入
        document.addEventListener('adRevenue', (e) => {
            this.trackAdRevenue(e.detail);
        });
    }

    /**
     * 追踪广告展示
     */
    trackAdImpression(data) {
        this.sessionData.adImpressions++;

        const today = this.getToday();
        if (!this.adPerformance.daily[today]) {
            this.adPerformance.daily[today] = {
                impressions: 0,
                clicks: 0,
                revenue: 0
            };
        }

        this.adPerformance.daily[today].impressions++;

        // 发送到分析平台
        this.trackEvent('ad_impression', {
            position: data.position,
            adUnit: data.adUnit,
            userSegment: this.getUserSegmentString(),
            sessionTime: Date.now() - this.sessionData.startTime
        });

        // 更新填充率
        this.calculateFillRate();
    }

    /**
     * 追踪广告点击
     */
    trackAdClick(data) {
        const today = this.getToday();
        if (this.adPerformance.daily[today]) {
            this.adPerformance.daily[today].clicks++;
        }

        // 计算CTR
        this.revenueTracking.ctr = this.calculateCTR();

        this.trackEvent('ad_click', {
            position: data.position,
            ctr: this.revenueTracking.ctr,
            userSegment: this.getUserSegmentString()
        });

        // 分析点击模式
        this.analyzeClickPattern(data);
    }

    /**
     * 追踪广告收入
     */
    trackAdRevenue(data) {
        const revenue = parseFloat(data.revenue) || 0;
        this.revenueTracking.estimatedRevenue += revenue;

        const today = this.getToday();
        if (this.adPerformance.daily[today]) {
            this.adPerformance.daily[today].revenue += revenue;
        }

        // 计算CPM
        this.revenueTracking.cpm = this.calculateCPM();

        this.trackEvent('ad_revenue', {
            revenue: revenue,
            cpm: this.revenueTracking.cpm,
            position: data.position
        });
    }

    /**
     * 分析点击模式
     */
    analyzeClickPattern(data) {
        const clickHistory = JSON.parse(localStorage.getItem('adClickHistory') || '[]');

        clickHistory.push({
            timestamp: Date.now(),
            position: data.position,
            userSegment: this.getUserSegmentString(),
            sessionTime: Date.now() - this.sessionData.startTime
        });

        // 只保留最近100次点击
        if (clickHistory.length > 100) {
            clickHistory.splice(0, clickHistory.length - 100);
        }

        localStorage.setItem('adClickHistory', JSON.stringify(clickHistory));

        // 分析异常点击
        this.detectAnomalousClicks(clickHistory);
    }

    /**
     * 检测异常点击
     */
    detectAnomalousClicks(clickHistory) {
        const recentClicks = clickHistory.filter(click =>
            Date.now() - click.timestamp < 60000 // 1分钟内
        );

        // 如果1分钟内点击超过5次，标记为异常
        if (recentClicks.length > 5) {
            this.trackEvent('anomalous_clicking', {
                clickCount: recentClicks.length,
                userSegment: this.getUserSegmentString()
            });

            console.warn('⚠️ 检测到异常点击行为');

            // 临时禁用广告
            if (window.adManager) {
                window.adManager.temporarilyDisableAds(300000); // 5分钟
            }
        }
    }

    /**
     * 计算关键指标
     */
    calculateCTR() {
        const totalImpressions = this.sessionData.adImpressions;
        const totalClicks = Object.values(this.adPerformance.daily)
            .reduce((sum, day) => sum + day.clicks, 0);

        return totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0;
    }

    calculateCPM() {
        const totalImpressions = Object.values(this.adPerformance.daily)
            .reduce((sum, day) => sum + day.impressions, 0);
        const totalRevenue = this.revenueTracking.estimatedRevenue;

        return totalImpressions > 0 ? (totalRevenue / totalImpressions * 1000).toFixed(2) : 0;
    }

    calculateFillRate() {
        const adRequests = this.sessionData.adImpressions + this.getFailedAdRequests();
        const filledAds = this.sessionData.adImpressions;

        this.revenueTracking.fillRate = adRequests > 0 ?
            (filledAds / adRequests * 100).toFixed(2) : 100;
    }

    /**
     * 获取失败的广告请求数
     */
    getFailedAdRequests() {
        return parseInt(localStorage.getItem('failedAdRequests') || '0');
    }

    /**
     * 生成性能报告
     */
    generatePerformanceReport() {
        const report = {
            session: {
                duration: Date.now() - this.sessionData.startTime,
                pageViews: this.sessionData.pageViews,
                userInteractions: this.sessionData.userInteractions,
                audioPlayTime: this.sessionData.audioPlayTime,
                meditationSessions: this.sessionData.meditationSessions
            },
            ads: {
                impressions: this.sessionData.adImpressions,
                clicks: Object.values(this.adPerformance.daily)
                    .reduce((sum, day) => sum + day.clicks, 0),
                ctr: this.revenueTracking.ctr + '%',
                cpm: '$' + this.revenueTracking.cpm,
                fillRate: this.revenueTracking.fillRate + '%',
                estimatedRevenue: '$' + this.revenueTracking.estimatedRevenue.toFixed(2)
            },
            userSegment: this.userSegments,
            optimization: this.getOptimizationSuggestions()
        };

        return report;
    }

    /**
     * 获取优化建议
     */
    getOptimizationSuggestions() {
        const suggestions = [];

        // CTR优化建议
        if (parseFloat(this.revenueTracking.ctr) < 1.0) {
            suggestions.push({
                type: 'ctr_improvement',
                message: 'CTR较低，建议优化广告位置和内容相关性',
                priority: 'high'
            });
        }

        // 填充率优化建议
        if (parseFloat(this.revenueTracking.fillRate) < 90) {
            suggestions.push({
                type: 'fill_rate_improvement',
                message: '填充率偏低，建议增加备用广告网络',
                priority: 'medium'
            });
        }

        // 用户体验建议
        if (this.sessionData.userInteractions / this.sessionData.pageViews < 10) {
            suggestions.push({
                type: 'user_engagement',
                message: '用户参与度较低，建议减少广告频率',
                priority: 'high'
            });
        }

        return suggestions;
    }

    /**
     * A/B测试支持
     */
    initABTest(testName, variants) {
        const existingTest = localStorage.getItem(`abtest_${testName}`);

        if (!existingTest) {
            // 随机分配用户到不同变体
            const variant = variants[Math.floor(Math.random() * variants.length)];
            localStorage.setItem(`abtest_${testName}`, variant);

            this.trackEvent('ab_test_assignment', {
                testName: testName,
                variant: variant,
                userSegment: this.getUserSegmentString()
            });

            return variant;
        }

        return existingTest;
    }

    /**
     * 辅助方法
     */
    trackEvent(eventName, parameters = {}) {
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, parameters);
        }

        // 本地存储
        const eventLog = JSON.parse(localStorage.getItem('eventLog') || '[]');
        eventLog.push({
            event: eventName,
            parameters: parameters,
            timestamp: Date.now(),
            sessionId: this.getSessionId()
        });

        // 只保留最近1000个事件
        if (eventLog.length > 1000) {
            eventLog.splice(0, eventLog.length - 1000);
        }

        localStorage.setItem('eventLog', JSON.stringify(eventLog));
    }

    startAudioSession() {
        this.audioSessionStart = Date.now();
    }

    endAudioSession() {
        if (this.audioSessionStart) {
            this.sessionData.audioPlayTime += Date.now() - this.audioSessionStart;
            this.audioSessionStart = null;
        }
    }

    considerShowingAd(context) {
        if (window.adManager) {
            window.adManager.showContextualAd(context);
        }
    }

    getUserSegmentString() {
        const segments = [];
        Object.keys(this.userSegments).forEach(key => {
            if (this.userSegments[key]) {
                segments.push(key);
            }
        });
        return segments.join(',') || 'unknown';
    }

    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        return this.sessionId;
    }

    getToday() {
        return new Date().toISOString().split('T')[0];
    }

    loadHistoricalData() {
        const savedData = localStorage.getItem('adPerformanceHistory');
        if (savedData) {
            this.adPerformance = JSON.parse(savedData);
        }
    }

    saveSessionData() {
        // 保存性能数据
        localStorage.setItem('adPerformanceHistory', JSON.stringify(this.adPerformance));

        // 保存会话数据
        const sessionSummary = {
            timestamp: Date.now(),
            duration: Date.now() - this.sessionData.startTime,
            pageViews: this.sessionData.pageViews,
            adImpressions: this.sessionData.adImpressions,
            userSegment: this.getUserSegmentString()
        };

        const sessionHistory = JSON.parse(localStorage.getItem('sessionHistory') || '[]');
        sessionHistory.push(sessionSummary);

        // 只保留最近30天的数据
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const recentSessions = sessionHistory.filter(session =>
            session.timestamp > thirtyDaysAgo
        );

        localStorage.setItem('sessionHistory', JSON.stringify(recentSessions));
    }

    startSessionTracking() {
        // 每分钟记录用户活动
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                this.trackEvent('session_heartbeat', {
                    sessionTime: Date.now() - this.sessionData.startTime,
                    userSegment: this.getUserSegmentString()
                });
            }
        }, 60000);
    }

    /**
     * 清理资源
     */
    cleanup() {
        this.saveSessionData();
        console.log('🧹 AdAnalytics: 清理完成');
    }
}

// 全局实例
let adAnalytics;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    adAnalytics = new AdAnalytics();
    window.adAnalytics = adAnalytics; // 全局访问

    console.log('✅ AdAnalytics 初始化完成');
});

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdAnalytics;
}