/**
 * A/B Testing Framework
 * A/B测试框架 - 实现功能测试和优化实验
 * Version: 1.0.0
 */

class ABTestingFramework {
    constructor() {
        this.config = {
            enabled: true,
            apiEndpoint: '/api/ab-testing',
            persistVariants: true,
            debugMode: false,
            sampleRate: 1.0, // 100% 参与测试
            cookieExpiry: 30 // 30天
        };

        this.tests = new Map();
        this.activeVariants = new Map();
        this.userSegment = null;
        this.exposureLog = [];

        this.init();
    }

    init() {
        this.loadUserSegment();
        this.loadActiveTests();
        this.initializeVariants();
        this.setupTracking();
        this.runActiveTests();

        console.log('🧪 A/B Testing Framework initialized');
    }

    /**
     * 加载用户分组
     */
    loadUserSegment() {
        // 从 cookie 或 localStorage 获取用户分组
        let segment = localStorage.getItem('ab-user-segment');

        if (!segment) {
            // 创建新的用户分组
            segment = this.generateUserSegment();
            if (this.config.persistVariants) {
                localStorage.setItem('ab-user-segment', segment);
            }
        }

        this.userSegment = segment;
    }

    /**
     * 生成用户分组
     */
    generateUserSegment() {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2);
        return btoa(`${timestamp}-${random}`).substring(0, 16);
    }

    /**
     * 加载活跃测试
     */
    async loadActiveTests() {
        try {
            // 从服务器加载测试配置
            const response = await fetch(`${this.config.apiEndpoint}/active`);
            const tests = await response.json();

            // 初始化测试
            tests.forEach(test => {
                this.tests.set(test.id, test);
            });

            console.log(`📋 Loaded ${tests.length} active tests`);
        } catch (error) {
            console.error('Failed to load tests:', error);
            // 使用默认测试
            this.loadDefaultTests();
        }
    }

    /**
     * 加载默认测试
     */
    loadDefaultTests() {
        const defaultTests = [
            {
                id: 'hero-cta-text',
                name: 'Hero CTA Text Test',
                description: '测试不同的CTA文案对转化率的影响',
                trafficAllocation: 1.0,
                variants: [
                    {
                        id: 'control',
                        name: 'Control',
                        weight: 50,
                        changes: {
                            'hero-cta-text': '立即开启沉浸体验',
                            'hero-cta-color': '#667eea'
                        }
                    },
                    {
                        id: 'variant-a',
                        name: 'Variant A - 更直接',
                        weight: 50,
                        changes: {
                            'hero-cta-text': '开始免费疗愈',
                            'hero-cta-color': '#2ed573'
                        }
                    }
                ],
                metrics: ['click-through-rate', 'conversion-rate'],
                status: 'active'
            },
            {
                id: 'audio-player-layout',
                name: 'Audio Player Layout Test',
                description: '测试播放器布局对用户使用的影响',
                trafficAllocation: 0.5, // 50% 流量参与
                variants: [
                    {
                        id: 'control',
                        name: 'Bottom Player',
                        weight: 50,
                        changes: {
                            'player-position': 'bottom',
                            'player-style': 'default'
                        }
                    },
                    {
                        id: 'variant-b',
                        name: 'Side Player',
                        weight: 50,
                        changes: {
                            'player-position': 'side',
                            'player-style': 'compact'
                        }
                    }
                ],
                metrics: ['play-duration', 'interaction-rate'],
                status: 'active'
            },
            {
                id: 'resource-card-design',
                name: 'Resource Card Design Test',
                description: '测试卡片设计对点击率的影响',
                trafficAllocation: 0.3, // 30% 流量参与
                variants: [
                    {
                        id: 'control',
                        name: 'Current Design',
                        weight: 50,
                        changes: {
                            'card-style': 'default',
                            'card-shadow': 'normal'
                        }
                    },
                    {
                        id: 'variant-c',
                        name: 'Enhanced Design',
                        weight: 50,
                        changes: {
                            'card-style': 'enhanced',
                            'card-shadow': 'elevated'
                        }
                    }
                ],
                metrics: ['click-rate', 'engagement-time'],
                status: 'active'
            }
        ];

        defaultTests.forEach(test => {
            this.tests.set(test.id, test);
        });
    }

    /**
     * 初始化变体
     */
    initializeVariants() {
        this.tests.forEach((test, testId) => {
            if (test.status === 'active') {
                const variant = this.selectVariant(test);
                if (variant) {
                    this.activeVariants.set(testId, variant);
                    this.logExposure(testId, variant.id);
                }
            }
        });
    }

    /**
     * 选择变体
     */
    selectVariant(test) {
        // 检查流量分配
        if (Math.random() > test.trafficAllocation * this.config.sampleRate) {
            return null; // 不参与测试
        }

        // 生成一致的哈希值
        const hash = this.hashString(`${test.id}-${this.userSegment}`);
        const bucket = hash % 100;

        // 根据权重分配变体
        let accumulated = 0;
        for (const variant of test.variants) {
            accumulated += variant.weight;
            if (bucket < accumulated) {
                return variant;
            }
        }

        return test.variants[0]; // 默认返回控制组
    }

    /**
     * 字符串哈希函数
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return Math.abs(hash);
    }

    /**
     * 运行活跃测试
     */
    runActiveTests() {
        this.activeVariants.forEach((variant, testId) => {
            this.applyVariant(testId, variant);
        });

        // 延迟应用以避免布局闪烁
        setTimeout(() => {
            document.body.classList.add('ab-testing-active');
        }, 0);
    }

    /**
     * 应用变体
     */
    applyVariant(testId, variant) {
        const changes = variant.changes || {};

        Object.entries(changes).forEach(([key, value]) => {
            this.applyChange(key, value, testId);
        });

        if (this.config.debugMode) {
            console.log(`🧪 Applied variant "${variant.id}" for test "${testId}"`);
        }
    }

    /**
     * 应用变更
     */
    applyChange(key, value, testId) {
        // 根据键的类型应用不同的变更
        if (key.includes('-text') || key.includes('-title')) {
            this.changeText(key, value, testId);
        } else if (key.includes('-color') || key.includes('-style')) {
            this.changeStyle(key, value, testId);
        } else if (key.includes('-position') || key.includes('-layout')) {
            this.changeLayout(key, value, testId);
        } else {
            this.changeAttribute(key, value, testId);
        }
    }

    /**
     * 改变文本
     */
    changeText(selector, text, testId) {
        const elements = document.querySelectorAll(`[data-ab="${selector}"], [data-content="${selector.replace('-text', '')}"]`);
        elements.forEach(element => {
            // 保存原始文本
            if (!element.dataset.originalText) {
                element.dataset.originalText = element.textContent;
            }
            // 应用新文本
            element.textContent = text;
            // 标记为AB测试元素
            element.dataset.abTest = testId;
        });
    }

    /**
     * 改变样式
     */
    changeStyle(selector, style, testId) {
        const elements = document.querySelectorAll(`[data-ab="${selector}"]`);
        elements.forEach(element => {
            // 保存原始样式
            if (!element.dataset.originalStyle) {
                element.dataset.originalStyle = element.getAttribute('style') || '';
            }
            // 应用新样式
            if (selector.includes('-color')) {
                element.style.color = style;
                element.style.backgroundColor = style;
            } else if (selector.includes('-style')) {
                element.className = element.className.replace(/\bstyle-\w+/g, '');
                element.classList.add(`style-${style}`);
            }
            // 标记为AB测试元素
            element.dataset.abTest = testId;
        });
    }

    /**
     * 改变布局
     */
    changeLayout(selector, layout, testId) {
        const element = document.querySelector(`[data-ab="${selector}"]`);
        if (element) {
            // 保存原始类名
            if (!element.dataset.originalClass) {
                element.dataset.originalClass = element.className;
            }
            // 应用新布局
            element.className = element.className.replace(/\blayout-\w+/g, '');
            element.classList.add(`layout-${layout}`);
            // 标记为AB测试元素
            element.dataset.abTest = testId;
        }
    }

    /**
     * 改变属性
     */
    changeAttribute(selector, value, testId) {
        const elements = document.querySelectorAll(`[data-ab="${selector}"]`);
        elements.forEach(element => {
            // 保存原始属性
            if (!element.datasetOriginalValue) {
                element.datasetOriginalValue = element.value || element.textContent;
            }
            // 应用新值
            if (element.tagName === 'INPUT') {
                element.value = value;
            } else {
                element.textContent = value;
            }
            // 标记为AB测试元素
            element.dataset.abTest = testId;
        });
    }

    /**
     * 设置跟踪
     */
    setupTracking() {
        // 跟踪点击事件
        document.addEventListener('click', (e) => {
            this.trackClick(e.target);
        }, true);

        // 跟踪表单提交
        document.addEventListener('submit', (e) => {
            this.trackConversion(e.target, 'form_submit');
        });

        // 跟踪页面停留时间
        this.trackEngagement();

        // 跟踪音频播放
        this.trackAudioEvents();
    }

    /**
     * 跟踪点击
     */
    trackClick(element) {
        const abTest = element.dataset.abTest;
        if (!abTest) return;

        const variant = this.activeVariants.get(abTest);
        if (!variant) return;

        this.sendEvent('click', {
            testId: abTest,
            variantId: variant.id,
            element: element.tagName,
            elementClass: element.className,
            timestamp: Date.now()
        });
    }

    /**
     * 跟踪转化
     */
    trackConversion(element, type) {
        this.activeVariants.forEach((variant, testId) => {
            this.sendEvent('conversion', {
                testId: testId,
                variantId: variant.id,
                conversionType: type,
                timestamp: Date.now()
            });
        });
    }

    /**
     * 跟踪用户参与度
     */
    trackEngagement() {
        const startTime = Date.now();
        let lastActiveTime = startTime;

        // 更新活跃时间
        ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                lastActiveTime = Date.now();
            });
        });

        // 定期发送参与度数据
        setInterval(() => {
            const activeTime = lastActiveTime - startTime;
            const totalTime = Date.now() - startTime;

            this.activeVariants.forEach((variant, testId) => {
                this.sendEvent('engagement', {
                    testId: testId,
                    variantId: variant.id,
                    activeTime: activeTime,
                    totalTime: totalTime,
                    engagementRate: activeTime / totalTime
                });
            });
        }, 30000); // 每30秒发送一次
    }

    /**
     * 跟踪音频事件
     */
    trackAudioEvents() {
        if (window.audioManager) {
            // 监听播放事件
            const originalPlay = window.audioManager.play;
            window.audioManager.play = (...args) => {
                this.trackConversion(null, 'audio_play');
                return originalPlay.apply(window.audioManager, args);
            };

            // 监听收藏事件
            document.addEventListener('favorite-add', () => {
                this.trackConversion(null, 'favorite_add');
            });
        }
    }

    /**
     * 记录曝光
     */
    logExposure(testId, variantId) {
        const exposure = {
            testId: testId,
            variantId: variantId,
            userId: this.userSegment,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        this.exposureLog.push(exposure);

        // 发送曝光事件
        this.sendEvent('exposure', exposure);
    }

    /**
     * 发送事件
     */
    async sendEvent(eventType, data) {
        const payload = {
            eventType: eventType,
            data: data,
            timestamp: Date.now()
        };

        try {
            // 发送到分析平台
            this.sendToAnalytics(eventType, data);

            // 发送到A/B测试服务器
            if (this.config.enabled) {
                await fetch(`${this.config.apiEndpoint}/events`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
            }
        } catch (error) {
            console.warn('Failed to send A/B test event:', error);
            // 存储到本地稍后发送
            this.storeEventLocally(payload);
        }
    }

    /**
     * 发送到分析平台
     */
    sendToAnalytics(eventType, data) {
        // Google Analytics
        if (window.gtag) {
            window.gtag('event', 'ab_test', {
                test_id: data.testId,
                variant_id: data.variantId,
                event_type: eventType
            });
        }

        // Amplitude
        if (window.amplitude) {
            window.amplitude.track('A/B Test', {
                testId: data.testId,
                variantId: data.variantId,
                eventType: eventType
            });
        }
    }

    /**
     * 本地存储事件
     */
    storeEventLocally(event) {
        const stored = JSON.parse(localStorage.getItem('ab-test-events') || '[]');
        stored.push(event);

        // 只保留最近100个事件
        if (stored.length > 100) {
            stored.splice(0, stored.length - 100);
        }

        localStorage.setItem('ab-test-events', JSON.stringify(stored));
    }

    /**
     * 获取测试结果
     */
    async getTestResults(testId) {
        try {
            const response = await fetch(`${this.config.apiEndpoint}/results/${testId}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch test results:', error);
            return null;
        }
    }

    /**
     * 获取所有测试结果
     */
    async getAllResults() {
        try {
            const response = await fetch(`${this.config.apiEndpoint}/results`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch results:', error);
            return null;
        }
    }

    /**
     * 创建新测试
     */
    async createTest(testConfig) {
        try {
            const response = await fetch(`${this.config.apiEndpoint}/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testConfig)
            });

            const test = await response.json();
            this.tests.set(test.id, test);
            return test;
        } catch (error) {
            console.error('Failed to create test:', error);
            return null;
        }
    }

    /**
     * 结束测试
     */
    async endTest(testId, winner) {
        try {
            const response = await fetch(`${this.config.apiEndpoint}/end/${testId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ winner: winner })
            });

            if (response.ok) {
                // 应用获胜变体
                this.applyWinner(testId, winner);
                console.log(`🏆 Test ${testId} ended with winner: ${winner}`);
            }
        } catch (error) {
            console.error('Failed to end test:', error);
        }
    }

    /**
     * 应用获胜变体
     */
    applyWinner(testId, winnerVariantId) {
        const test = this.tests.get(testId);
        if (!test) return;

        const winnerVariant = test.variants.find(v => v.id === winnerVariantId);
        if (!winnerVariant) return;

        // 永久应用获胜变体
        Object.entries(winnerVariant.changes || {}).forEach(([key, value]) => {
            this.applyPermanentChange(key, value);
        });

        // 移除测试标记
        document.querySelectorAll(`[data-ab-test="${testId}"]`).forEach(element => {
            delete element.dataset.abTest;
        });
    }

    /**
     * 永久应用变更
     */
    applyPermanentChange(key, value) {
        // 恢复原始内容
        const elements = document.querySelectorAll(`[data-ab="${key}"]`);
        elements.forEach(element => {
            if (element.dataset.originalText) {
                delete element.dataset.originalText;
            }
            if (element.dataset.originalStyle) {
                delete element.dataset.originalStyle;
            }
            if (element.dataset.originalClass) {
                delete element.dataset.originalClass;
            }
        });

        // 应用新值作为默认值
        this.applyChange(key, value, null);
    }

    /**
     * 强制变体（用于调试）
     */
    forceVariant(testId, variantId) {
        const test = this.tests.get(testId);
        if (!test) return false;

        const variant = test.variants.find(v => v.id === variantId);
        if (!variant) return false;

        this.activeVariants.set(testId, variant);
        this.applyVariant(testId, variant);

        console.log(`🔧 Forced variant "${variantId}" for test "${testId}"`);
        return true;
    }

    /**
     * 获取用户的所有变体
     */
    getUserVariants() {
        return Object.fromEntries(this.activeVariants);
    }

    /**
     * 检查用户是否在测试中
     */
    isInTest(testId) {
        return this.activeVariants.has(testId);
    }

    /**
     * 获取调试信息
     */
    getDebugInfo() {
        return {
            userSegment: this.userSegment,
            activeTests: Array.from(this.activeVariants.entries()),
            availableTests: Array.from(this.tests.keys()),
            exposureLog: this.exposureLog
        };
    }

    /**
     * 重置所有测试
     */
    resetTests() {
        this.activeVariants.clear();
        this.exposureLog = [];
        localStorage.removeItem('ab-user-segment');
        localStorage.removeItem('ab-test-events');

        // 恢复原始内容
        document.querySelectorAll('[data-original-text]').forEach(element => {
            element.textContent = element.dataset.originalText;
            delete element.dataset.originalText;
        });

        document.querySelectorAll('[data-original-style]').forEach(element => {
            element.setAttribute('style', element.dataset.originalStyle);
            delete element.dataset.originalStyle;
        });

        document.querySelectorAll('[data-original-class]').forEach(element => {
            element.className = element.dataset.originalClass;
            delete element.dataset.originalClass;
        });

        console.log('🔄 A/B tests reset');
    }
}

// 初始化A/B测试框架
window.abTesting = new ABTestingFramework();

// 导出
window.ABTestingFramework = ABTestingFramework;