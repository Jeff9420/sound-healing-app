/**
 * Google AdSense 配置和优化
 * 海外市场广告变现策略
 * 
 * @date 2025-09-08
 */

class GoogleAdsManager {
    constructor() {
        this.adUnits = new Map();
        this.performanceData = {
            impressions: 0,
            clicks: 0,
            earnings: 0,
            ctr: 0
        };
        this.isAdBlockDetected = false;
        
        this.initializeAds();
    }
    
    /**
     * 初始化 Google AdSense
     */
    async initializeAds() {
        // 检测广告拦截器
        this.detectAdBlocker();
        
        // 延迟加载广告（性能优化）
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => this.loadAdsense(), 3000);
            });
        } else {
            setTimeout(() => this.loadAdsense(), 3000);
        }
        
        // 设置广告位
        this.setupAdUnits();
        
        console.log('🎯 Google Ads Manager 初始化完成');
    }
    
    /**
     * 加载 AdSense 脚本
     */
    async loadAdsense() {
        if (this.isAdBlockDetected) {
            console.log('🚫 检测到广告拦截器，跳过广告加载');
            return;
        }
        
        try {
            // 动态加载 AdSense 脚本
            const script = document.createElement('script');
            script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR-PUBLISHER-ID';
            script.crossOrigin = 'anonymous';
            script.async = true;
            
            document.head.appendChild(script);
            
            // 初始化 adsbygoogle
            window.adsbygoogle = window.adsbygoogle || [];
            
            console.log('📺 AdSense 脚本已加载');
            
        } catch (error) {
            console.error('❌ AdSense 加载失败:', error);
        }
    }
    
    /**
     * 检测广告拦截器
     */
    detectAdBlocker() {
        // 创建测试广告元素
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox';
        testAd.style.cssText = 'position:absolute;left:-10000px;';
        document.body.appendChild(testAd);
        
        setTimeout(() => {
            if (testAd.offsetHeight === 0) {
                this.isAdBlockDetected = true;
                console.log('🚫 检测到广告拦截器');
                this.showAdBlockMessage();
            }
            document.body.removeChild(testAd);
        }, 100);
    }
    
    /**
     * 设置广告位配置
     */
    setupAdUnits() {
        // 顶部横幅广告 (效果最好)
        this.adUnits.set('header-banner', {
            id: 'header-banner-ad',
            slot: 'YOUR-AD-SLOT-ID',
            size: [[728, 90], [970, 90]], // 桌面
            sizeMapping: [
                [[1024, 768], [[728, 90], [970, 90]]],
                [[768, 576], [[728, 90]]],
                [[0, 0], [[320, 50], [300, 50]]] // 移动端
            ],
            position: 'top'
        });
        
        // 侧边栏广告 (桌面端)
        this.adUnits.set('sidebar', {
            id: 'sidebar-ad',
            slot: 'YOUR-AD-SLOT-ID-2',
            size: [[300, 250], [300, 600]],
            position: 'sidebar'
        });
        
        // 内容中间广告 (原生广告，效果好)
        this.adUnits.set('content-middle', {
            id: 'content-middle-ad',
            slot: 'YOUR-AD-SLOT-ID-3',
            size: [[336, 280], [300, 250]],
            position: 'content'
        });
        
        // 底部广告
        this.adUnits.set('footer-banner', {
            id: 'footer-banner-ad',
            slot: 'YOUR-AD-SLOT-ID-4',
            size: [[728, 90], [320, 50]],
            position: 'bottom'
        });
        
        this.createAdElements();
    }
    
    /**
     * 创建广告元素
     */
    createAdElements() {
        this.adUnits.forEach((config, unitName) => {
            this.createAdUnit(config);
        });
    }
    
    /**
     * 创建单个广告单元
     */
    createAdUnit(config) {
        const adContainer = document.createElement('div');
        adContainer.className = `ad-container ad-${config.position}`;
        adContainer.id = `${config.id}-container`;
        
        const adElement = document.createElement('ins');
        adElement.className = 'adsbygoogle';
        adElement.style.display = 'block';
        adElement.setAttribute('data-ad-client', 'ca-pub-YOUR-PUBLISHER-ID');
        adElement.setAttribute('data-ad-slot', config.slot);
        adElement.setAttribute('data-ad-format', 'auto');
        adElement.setAttribute('data-full-width-responsive', 'true');
        adElement.id = config.id;
        
        // 设置响应式广告
        if (config.sizeMapping) {
            adElement.setAttribute('data-ad-format', 'rectangle');
        }
        
        adContainer.appendChild(adElement);
        
        // 插入到页面合适位置
        this.insertAdToPage(adContainer, config.position);
        
        // 延迟推送广告（避免影响页面加载）
        setTimeout(() => {
            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
                console.log(`📺 广告位 ${config.id} 已激活`);
            } catch (error) {
                console.error(`❌ 广告位 ${config.id} 激活失败:`, error);
            }
        }, 1000);
    }
    
    /**
     * 将广告插入页面
     */
    insertAdToPage(adContainer, position) {
        switch (position) {
            case 'top':
                const header = document.querySelector('header');
                if (header) {
                    header.insertAdjacentElement('afterend', adContainer);
                }
                break;
                
            case 'sidebar':
                // 仅在桌面端显示侧边栏广告
                if (window.innerWidth > 1024) {
                    const sidebar = this.createSidebar();
                    sidebar.appendChild(adContainer);
                }
                break;
                
            case 'content':
                const main = document.querySelector('main');
                if (main && main.children.length > 2) {
                    // 插入到内容中间
                    const middleIndex = Math.floor(main.children.length / 2);
                    main.children[middleIndex].insertAdjacentElement('afterend', adContainer);
                }
                break;
                
            case 'bottom':
                document.body.appendChild(adContainer);
                break;
        }
    }
    
    /**
     * 创建侧边栏（如果不存在）
     */
    createSidebar() {
        let sidebar = document.querySelector('.ad-sidebar');
        if (!sidebar) {
            sidebar = document.createElement('div');
            sidebar.className = 'ad-sidebar';
            sidebar.style.cssText = `
                position: fixed;
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
                z-index: 1000;
                width: 300px;
            `;
            document.body.appendChild(sidebar);
        }
        return sidebar;
    }
    
    /**
     * 显示广告拦截器提示
     */
    showAdBlockMessage() {
        const message = document.createElement('div');
        message.className = 'adblock-notice';
        message.innerHTML = `
            <div style="
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 15px;
                margin: 20px;
                text-align: center;
                font-family: Arial, sans-serif;
            ">
                <h4 style="margin: 0 0 10px 0; color: #856404;">
                    🙏 Support Free Sound Healing
                </h4>
                <p style="margin: 0; color: #856404;">
                    We detected an ad blocker. Our free service is supported by ads. 
                    Please consider whitelisting our site to help us continue providing 
                    free healing sounds for everyone.
                </p>
            </div>
        `;
        
        const header = document.querySelector('header');
        if (header) {
            header.insertAdjacentElement('afterend', message);
        }
    }
    
    /**
     * 追踪广告性能
     */
    trackAdPerformance() {
        // 模拟广告性能追踪（实际应使用 Google Analytics）
        setInterval(() => {
            if (window.gtag) {
                window.gtag('event', 'ad_impression', {
                    'event_category': 'monetization',
                    'event_label': 'adsense',
                    'value': 1
                });
            }
        }, 30000);
    }
    
    /**
     * 获取广告收益报告
     */
    getRevenueReport() {
        // 这里应该集成 AdSense API 获取真实数据
        return {
            daily: this.performanceData,
            estimated: {
                monthly: this.performanceData.earnings * 30,
                ctr: this.performanceData.ctr,
                rpm: this.performanceData.earnings / (this.performanceData.impressions / 1000)
            }
        };
    }
    
    /**
     * A/B 测试广告位置
     */
    runAdPositionTest() {
        const testVariant = Math.random() > 0.5 ? 'A' : 'B';
        
        if (testVariant === 'A') {
            // 版本A: 传统位置
            console.log('🧪 A/B测试: 使用传统广告位置');
        } else {
            // 版本B: 优化位置
            console.log('🧪 A/B测试: 使用优化广告位置');
            this.optimizeAdPlacement();
        }
        
        // 记录测试版本
        if (window.gtag) {
            window.gtag('event', 'ad_ab_test', {
                'event_category': 'experiment',
                'event_label': `variant_${testVariant}`,
                'custom_parameter_1': testVariant
            });
        }
    }
    
    /**
     * 优化广告位置（A/B测试版本B）
     */
    optimizeAdPlacement() {
        // 延迟显示顶部广告，避免影响用户体验
        setTimeout(() => {
            const headerAd = document.querySelector('#header-banner-ad-container');
            if (headerAd) {
                headerAd.style.display = 'block';
            }
        }, 5000);
    }
}

// 广告样式
const adStyles = `
<style>
.ad-container {
    margin: 20px 0;
    text-align: center;
}

.ad-container ins {
    display: block !important;
}

.ad-top {
    margin-top: 10px;
    margin-bottom: 30px;
}

.ad-content {
    margin: 40px 0;
}

.ad-bottom {
    margin-top: 40px;
    margin-bottom: 20px;
}

.ad-sidebar {
    display: none;
}

@media (min-width: 1200px) {
    .ad-sidebar {
        display: block;
    }
}

/* 广告加载动画 */
.ad-container ins:empty {
    position: relative;
}

.ad-container ins:empty::after {
    content: "Advertisement";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #ccc;
    font-size: 12px;
}

/* 响应式广告 */
@media (max-width: 768px) {
    .ad-sidebar {
        display: none !important;
    }
    
    .ad-container {
        margin: 15px 0;
    }
}
</style>
`;

// 注入广告样式
document.head.insertAdjacentHTML('beforeend', adStyles);

// 初始化广告管理器
if (typeof window !== 'undefined') {
    // 延迟初始化，避免影响页面加载
    window.addEventListener('load', () => {
        setTimeout(() => {
            window.googleAdsManager = new GoogleAdsManager();
        }, 2000);
    });
    
    console.log('🎯 Google Ads 配置已加载');
}

/**
 * 使用说明：
 * 
 * 1. 替换 YOUR-PUBLISHER-ID 为您的 AdSense 发布商ID
 * 2. 替换所有 YOUR-AD-SLOT-ID 为实际的广告位ID
 * 3. 在 AdSense 后台创建对应的广告位
 * 4. 确保网站通过 AdSense 审核
 * 5. 监控广告性能并优化位置
 */