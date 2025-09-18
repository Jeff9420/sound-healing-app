/**
 * 广告管理器 - AdSense集成
 * 负责管理所有广告显示、用户体验保护和性能监控
 *
 * @date 2024-09-18
 */

class AdManager {
    constructor() {
        this.adsEnabled = true;
        this.adBlockPositions = {
            mainTop: 'ad-main-top',
            carouselBottom: 'ad-carousel-bottom',
            settingsMiddle: 'ad-settings-middle',
            playlistEnd: 'ad-playlist-end'
        };
        this.adStats = {
            impressions: 0,
            clicks: 0,
            revenue: 0,
            sessions: 0
        };
        this.userPreferences = this.loadUserPreferences();
        this.lastAdTime = 0;
        this.minAdInterval = 120000; // 2分钟最小间隔
        this.init();
    }

    /**
     * 初始化广告系统
     */
    init() {
        console.log('🎯 AdManager: 初始化广告系统');

        // 检查用户是否为Premium用户
        if (this.isPremiumUser()) {
            console.log('👑 检测到Premium用户，禁用广告');
            this.adsEnabled = false;
            return;
        }

        // 检查AdBlock
        this.detectAdBlock().then(hasAdBlock => {
            if (hasAdBlock) {
                console.log('🚫 检测到广告拦截器');
                this.showAdBlockMessage();
            } else {
                this.loadGoogleAdSense();
                this.setupAdPositions();
                this.bindEvents();
            }
        });

        // 监听用户活动
        this.setupUserActivityTracking();
    }

    /**
     * 加载Google AdSense
     */
    loadGoogleAdSense() {
        if (window.adsbygoogle) {
            console.log('✅ AdSense已加载');
            return;
        }

        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID';
        script.crossOrigin = 'anonymous';

        script.onload = () => {
            console.log('✅ AdSense脚本加载成功');
            window.adsbygoogle = window.adsbygoogle || [];
        };

        script.onerror = () => {
            console.error('❌ AdSense脚本加载失败');
            this.fallbackToAlternativeAds();
        };

        document.head.appendChild(script);
    }

    /**
     * 设置广告位置
     */
    setupAdPositions() {
        // 主页顶部原生广告
        this.createAdUnit({
            position: 'mainTop',
            type: 'native',
            size: 'responsive',
            className: 'ad-native-top'
        });

        // 轮播下方展示广告
        this.createAdUnit({
            position: 'carouselBottom',
            type: 'display',
            size: '300x250',
            className: 'ad-display-main'
        });

        // 设置页面中部广告
        this.createAdUnit({
            position: 'settingsMiddle',
            type: 'display',
            size: '320x100',
            className: 'ad-display-settings'
        });
    }

    /**
     * 创建广告单元
     */
    createAdUnit(config) {
        const adContainer = document.getElementById(this.adBlockPositions[config.position]);
        if (!adContainer) {
            console.warn(`⚠️ 广告容器不存在: ${config.position}`);
            return;
        }

        // 创建广告元素
        const adElement = document.createElement('ins');
        adElement.className = `adsbygoogle ${config.className}`;
        adElement.style.display = 'block';
        adElement.setAttribute('data-ad-client', 'ca-pub-YOUR_PUBLISHER_ID');
        adElement.setAttribute('data-ad-slot', 'YOUR_AD_SLOT_ID');

        if (config.size === 'responsive') {
            adElement.setAttribute('data-ad-format', 'auto');
            adElement.setAttribute('data-full-width-responsive', 'true');
        } else {
            const [width, height] = config.size.split('x');
            adElement.style.width = width + 'px';
            adElement.style.height = height + 'px';
        }

        // 添加广告标识
        const adLabel = document.createElement('div');
        adLabel.className = 'ad-label';
        adLabel.textContent = '广告';
        adLabel.style.cssText = `
            font-size: 10px;
            color: #888;
            text-align: center;
            margin-bottom: 5px;
            opacity: 0.7;
        `;

        adContainer.appendChild(adLabel);
        adContainer.appendChild(adElement);

        // 推送广告
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            this.trackAdImpression(config.position);
        } catch (e) {
            console.error('❌ 广告推送失败:', e);
            this.showFallbackContent(adContainer, config);
        }
    }

    /**
     * 智能广告显示 - 基于用户活动
     */
    showContextualAd(context) {
        if (!this.shouldShowAd()) {
            return;
        }

        const now = Date.now();
        if (now - this.lastAdTime < this.minAdInterval) {
            console.log('⏰ 广告间隔时间未到，跳过显示');
            return;
        }

        let adConfig;
        switch (context) {
            case 'meditation_end':
                adConfig = this.getMeditationRelatedAd();
                break;
            case 'sleep_time':
                adConfig = this.getSleepRelatedAd();
                break;
            case 'daytime_focus':
                adConfig = this.getFocusRelatedAd();
                break;
            default:
                adConfig = this.getGeneralHealthAd();
        }

        this.showInterstitialAd(adConfig);
        this.lastAdTime = now;
    }

    /**
     * 获取冥想相关广告配置
     */
    getMeditationRelatedAd() {
        return {
            keywords: ['冥想', '瑜伽', '正念', '压力缓解'],
            categories: ['健康养生', '运动健身', '个人成长'],
            excludeCategories: ['游戏', '娱乐', '快餐']
        };
    }

    /**
     * 获取睡眠相关广告配置
     */
    getSleepRelatedAd() {
        return {
            keywords: ['睡眠', '失眠', '床垫', '枕头', '助眠'],
            categories: ['家居用品', '健康养生', '医疗保健'],
            timeRestriction: 'evening'
        };
    }

    /**
     * 用户体验保护机制
     */
    shouldShowAd() {
        // Premium用户不显示广告
        if (!this.adsEnabled || this.isPremiumUser()) {
            return false;
        }

        // 检查用户当前状态
        if (this.isUserInMeditation()) {
            console.log('🧘‍♀️ 用户正在冥想，不显示广告');
            return false;
        }

        // 检查失眠友好模式
        if (this.isInSleepFriendlyMode()) {
            console.log('🌙 失眠友好模式，限制广告显示');
            return this.shouldShowSleepFriendlyAd();
        }

        return true;
    }

    /**
     * 检测广告拦截器
     */
    detectAdBlock() {
        return new Promise((resolve) => {
            const testAd = document.createElement('div');
            testAd.innerHTML = '&nbsp;';
            testAd.className = 'adsbox';
            testAd.style.cssText = 'position:absolute;left:-10000px;';
            document.body.appendChild(testAd);

            setTimeout(() => {
                const blocked = testAd.offsetHeight === 0;
                document.body.removeChild(testAd);
                resolve(blocked);
            }, 100);
        });
    }

    /**
     * 显示AdBlock提示信息
     */
    showAdBlockMessage() {
        const message = document.createElement('div');
        message.className = 'adblock-message';
        message.innerHTML = `
            <div style="
                background: rgba(116, 165, 212, 0.1);
                border: 1px solid #74a5d4;
                border-radius: 10px;
                padding: 15px;
                margin: 20px;
                text-align: center;
                color: #74a5d4;
            ">
                <h3>💝 支持我们的工作</h3>
                <p>我们检测到您使用了广告拦截器。声音疗愈应用是免费提供的，广告收入帮助我们维持服务并不断改进。</p>
                <p>您可以:</p>
                <ul style="list-style: none; padding: 0;">
                    <li>✅ 将我们的网站加入广告拦截器白名单</li>
                    <li>✅ 考虑升级到Premium版本以支持我们</li>
                </ul>
                <button onclick="window.location.reload()" style="
                    background: #74a5d4;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 10px;
                ">刷新页面</button>
            </div>
        `;

        // 插入到主要内容区域
        const mainContent = document.querySelector('.carousel-container');
        if (mainContent && mainContent.parentNode) {
            mainContent.parentNode.insertBefore(message, mainContent.nextSibling);
        }
    }

    /**
     * 广告性能监控
     */
    trackAdImpression(position) {
        this.adStats.impressions++;

        // 发送到分析系统
        this.sendAnalytics('ad_impression', {
            position: position,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            viewport: `${window.innerWidth}x${window.innerHeight}`
        });

        console.log(`📊 广告展示: ${position}, 总展示: ${this.adStats.impressions}`);
    }

    /**
     * 跟踪广告点击
     */
    trackAdClick(position) {
        this.adStats.clicks++;

        this.sendAnalytics('ad_click', {
            position: position,
            timestamp: Date.now(),
            ctr: (this.adStats.clicks / this.adStats.impressions * 100).toFixed(2)
        });

        console.log(`🎯 广告点击: ${position}, CTR: ${(this.adStats.clicks / this.adStats.impressions * 100).toFixed(2)}%`);
    }

    /**
     * 发送分析数据
     */
    sendAnalytics(event, data) {
        // 发送到Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', event, {
                custom_parameter_1: data.position,
                value: 1
            });
        }

        // 保存到本地存储用于后续分析
        const analyticsData = JSON.parse(localStorage.getItem('adAnalytics') || '[]');
        analyticsData.push({
            event: event,
            data: data,
            timestamp: Date.now()
        });

        // 只保留最近1000条记录
        if (analyticsData.length > 1000) {
            analyticsData.splice(0, analyticsData.length - 1000);
        }

        localStorage.setItem('adAnalytics', JSON.stringify(analyticsData));
    }

    /**
     * 获取广告性能报告
     */
    getPerformanceReport() {
        const ctr = this.adStats.impressions > 0 ?
            (this.adStats.clicks / this.adStats.impressions * 100).toFixed(2) : 0;

        return {
            impressions: this.adStats.impressions,
            clicks: this.adStats.clicks,
            ctr: ctr + '%',
            revenue: this.adStats.revenue,
            sessions: this.adStats.sessions,
            revenuePerSession: this.adStats.sessions > 0 ?
                (this.adStats.revenue / this.adStats.sessions).toFixed(2) : 0
        };
    }

    /**
     * 辅助方法
     */
    isPremiumUser() {
        return localStorage.getItem('isPremium') === 'true';
    }

    isUserInMeditation() {
        // 检查是否有音频正在播放
        return window.audioManager && window.audioManager.isAnyPlaying();
    }

    isInSleepFriendlyMode() {
        const currentTheme = document.body.getAttribute('data-sleep-theme');
        return currentTheme && currentTheme !== 'default';
    }

    shouldShowSleepFriendlyAd() {
        const hour = new Date().getHours();
        // 22:00-6:00 期间减少广告频率
        return !(hour >= 22 || hour <= 6) || Math.random() < 0.3;
    }

    loadUserPreferences() {
        return JSON.parse(localStorage.getItem('adPreferences') || '{}');
    }

    saveUserPreferences() {
        localStorage.setItem('adPreferences', JSON.stringify(this.userPreferences));
    }

    /**
     * 设置用户活动跟踪
     */
    setupUserActivityTracking() {
        // 跟踪页面可见性
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.adStats.sessions++;
            }
        });

        // 跟踪用户交互
        let interactionTimer;
        const trackInteraction = () => {
            clearTimeout(interactionTimer);
            interactionTimer = setTimeout(() => {
                this.considerShowingAd();
            }, 30000); // 30秒无交互后考虑显示广告
        };

        ['click', 'scroll', 'keypress'].forEach(event => {
            document.addEventListener(event, trackInteraction, { passive: true });
        });
    }

    /**
     * 考虑显示广告
     */
    considerShowingAd() {
        if (this.shouldShowAd()) {
            // 根据当前上下文决定广告类型
            const context = this.getCurrentContext();
            this.showContextualAd(context);
        }
    }

    getCurrentContext() {
        const hour = new Date().getHours();
        if (hour >= 22 || hour <= 6) return 'sleep_time';
        if (hour >= 9 && hour <= 17) return 'daytime_focus';
        return 'general';
    }

    /**
     * 显示备用内容
     */
    showFallbackContent(container, config) {
        container.innerHTML = `
            <div style="
                background: rgba(116, 165, 212, 0.1);
                border: 1px dashed #74a5d4;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                color: #74a5d4;
                font-size: 14px;
            ">
                <p>📱 推荐相关应用</p>
                <p style="font-size: 12px; margin-top: 10px;">
                    发现更多优质的冥想和健康应用
                </p>
            </div>
        `;
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 监听广告容器点击
        Object.values(this.adBlockPositions).forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.addEventListener('click', (e) => {
                    if (e.target.closest('.adsbygoogle')) {
                        this.trackAdClick(containerId);
                    }
                });
            }
        });
    }

    /**
     * 清理资源
     */
    cleanup() {
        // 清理事件监听器和定时器
        console.log('🧹 AdManager: 清理资源');
    }
}

// 全局实例
let adManager;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    adManager = new AdManager();
    window.adManager = adManager; // 全局访问

    console.log('✅ AdManager 初始化完成');
});

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdManager;
}