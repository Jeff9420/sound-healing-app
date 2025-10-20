/**
 * Compatibility Integration System for Sound Healing Application
 * Integrates cross-browser compatibility features into existing codebase
 */

class CompatibilityIntegration {
    constructor() {
        this.isInitialized = false;
        this.browserInfo = null;
        this.featureSupport = null;
        this.performanceProfile = null;

        this.initializeIntegration();
    }

    async initializeIntegration() {
        console.log('🔧 初始化跨浏览器兼容性集成系统...');

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // Initialize compatibility system
        await this.initializeCompatibilitySystem();

        // Apply compatibility fixes
        this.applyCompatibilityFixes();

        // Setup performance optimizations
        this.setupPerformanceOptimizations();

        // Initialize event listeners
        this.setupEventListeners();

        // Apply CSS fixes
        this.applyCSSFixes();

        // Setup audio compatibility
        this.setupAudioCompatibility();

        // Setup Canvas compatibility
        this.setupCanvasCompatibility();

        this.isInitialized = true;
        console.log('✅ 跨浏览器兼容性集成系统初始化完成');

        // Emit ready event
        window.dispatchEvent(new CustomEvent('compatibilityReady', {
            detail: {
                browserInfo: this.browserInfo,
                featureSupport: this.featureSupport,
                performanceProfile: this.performanceProfile
            }
        }));
    }

    async initializeCompatibilitySystem() {
        // Load polyfills first
        await this.loadPolyfills();

        // Get browser compatibility audit results
        if (window.crossBrowserAuditResults) {
            this.browserInfo = window.crossBrowserAuditResults.browser;
            this.featureSupport = window.crossBrowserAuditResults.features;
            this.performanceProfile = this.performanceProfile = this.detectPerformanceProfile();
        } else {
            // Fallback detection
            this.performFallbackDetection();
        }

        console.log('📋 浏览器信息:', this.browserInfo);
        console.log('🔧 功能支持:', this.featureSupport);
        console.log('⚡ 性能配置:', this.performanceProfile);
    }

    async loadPolyfills() {
        return new Promise((resolve) => {
            if (window.polyfillSystem && window.polyfillSystem.loaded) {
                console.log('✅ Polyfills 已加载');
                resolve();
                return;
            }

            // If polyfills are not loaded, wait for them
            if (document.querySelector('script[src*="cross-browser-polyfills.js"]')) {
                window.addEventListener('polyfillsReady', resolve, { once: true });
            } else {
                console.warn('⚠️ Polyfills 脚本未找到，某些功能可能不可用');
                resolve();
            }
        });
    }

    detectPerformanceProfile() {
        const profile = {
            level: 'medium',
            score: 50,
            settings: {
                maxParticles: 100,
                targetFPS: 30,
                enableEffects: true,
                useSimpleRendering: false,
                enablePreloading: true,
                memoryOptimization: true
            }
        };

        // Device-based detection
        if (this.browserInfo.isMobile) {
            profile.level = 'low';
            profile.score = 25;
            profile.settings.maxParticles = 50;
            profile.settings.targetFPS = 20;
            profile.settings.useSimpleRendering = true;
        }

        // Hardware-based detection
        if (this.browserInfo.hardwareConcurrency && this.browserInfo.deviceMemory) {
            const cpuScore = Math.min(this.browserInfo.hardwareConcurrency / 8 * 40, 40);
            const memoryScore = Math.min(this.browserInfo.deviceMemory / 8 * 40, 40);
            profile.score = Math.round(cpuScore + memoryScore);

            if (profile.score >= 80) {
                profile.level = 'high';
                profile.settings.maxParticles = 200;
                profile.settings.targetFPS = 60;
                profile.settings.enableEffects = true;
            } else if (profile.score >= 50) {
                profile.level = 'medium';
            } else {
                profile.level = 'low';
                profile.settings.useSimpleRendering = true;
                profile.settings.enableEffects = false;
            }
        }

        // Browser-specific adjustments
        if (this.browserInfo.name === 'Internet Explorer') {
            profile.level = 'very-low';
            profile.score = 10;
            profile.settings.maxParticles = 20;
            profile.settings.targetFPS = 15;
            profile.settings.enableEffects = false;
            profile.settings.useSimpleRendering = true;
        }

        return profile;
    }

    performFallbackDetection() {
        console.warn('⚠️ 使用降级检测系统');

        this.browserInfo = {
            name: this.getBrowserName(),
            version: this.getBrowserVersion(),
            isMobile: this.isMobileDevice(),
            isIE: this.isIE()
        };

        this.featureSupport = {
            audio: !!document.createElement('audio').canPlayType,
            canvas: !!document.createElement('canvas').getContext,
            webAudio: !!(window.AudioContext || window.webkitAudioContext),
            localStorage: this.testLocalStorage(),
            sessionStorage: this.testSessionStorage(),
            serviceWorker: 'serviceWorker' in navigator,
            fetch: !!window.fetch,
            cssVariables: CSS.supports('color', 'var(--test)'),
            cssGrid: CSS.supports('display', 'grid'),
            touch: 'ontouchstart' in window
        };
    }

    getBrowserName() {
        const ua = navigator.userAgent;
        if (/Chrome/.test(ua) && !/Edge/.test(ua)) return 'Chrome';
        if (/Firefox/.test(ua)) return 'Firefox';
        if (/Safari/.test(ua) && !/Chrome/.test(ua)) return 'Safari';
        if (/Edge/.test(ua) || /Edg/.test(ua)) return 'Edge';
        if (/MSIE|Trident/.test(ua)) return 'Internet Explorer';
        return 'Unknown';
    }

    getBrowserVersion() {
        const ua = navigator.userAgent;
        const browser = this.getBrowserName();

        const patterns = {
            'Chrome': /Chrome\/(\d+)/,
            'Firefox': /Firefox\/(\d+)/,
            'Safari': /Version\/(\d+)/,
            'Edge': /Edge\/(\d+)|Edg\/(\d+)/,
            'Internet Explorer': /MSIE (\d+)|rv:(\d+)/
        };

        const pattern = patterns[browser];
        if (pattern) {
            const match = ua.match(pattern);
            return match ? match[1] || match[2] : 'Unknown';
        }

        return 'Unknown';
    }

    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    isIE() {
        return !!document.documentMode;
    }

    testLocalStorage() {
        try {
            const testKey = 'localStorage_test';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }

    testSessionStorage() {
        try {
            const testKey = 'sessionStorage_test';
            sessionStorage.setItem(testKey, 'test');
            sessionStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }

    applyCompatibilityFixes() {
        console.log('🔧 应用兼容性修复...');

        // Apply browser-specific fixes
        this.applyBrowserSpecificFixes();

        // Apply feature-specific fixes
        this.applyFeatureSpecificFixes();

        // Apply performance fixes
        this.applyPerformanceFixes();
    }

    applyBrowserSpecificFixes() {
        // IE11 specific fixes
        if (this.browserInfo.name === 'Internet Explorer') {
            this.applyIE11Fixes();
        }

        // Safari specific fixes
        if (this.browserInfo.name === 'Safari') {
            this.applySafariFixes();
        }

        // Mobile specific fixes
        if (this.browserInfo.isMobile) {
            this.applyMobileFixes();
        }
    }

    applyIE11Fixes() {
        console.log('🔧 应用 IE11 修复...');

        // Add IE11 specific CSS class
        document.documentElement.classList.add('ie11');

        // Fix CSS Grid in IE11
        if (!this.featureSupport.cssGrid) {
            const style = document.createElement('style');
            style.textContent = `
                .ie11 .grid-layout {
                    display: -ms-grid;
                    -ms-grid-columns: repeat(auto-fit, minmax(300px, 1fr));
                    -ms-grid-gap: 1rem;
                }

                .ie11 .category-grid {
                    display: -ms-flexbox;
                    -ms-flex-direction: row;
                    -ms-flex-wrap: wrap;
                    -ms-justify-content: space-between;
                }

                .ie11 .category-card {
                    -ms-flex: 0 0 calc(33.333% - 1rem);
                }
            `;
            document.head.appendChild(style);
        }

        // Fix flexbox issues
        const flexFixStyle = document.createElement('style');
        flexFixStyle.textContent = `
            .ie11 .flex-container {
                display: -ms-flexbox;
                -ms-flex-direction: column;
            }

            .ie11 .audio-player {
                display: -ms-flexbox;
                -ms-flex-direction: column;
            }
        `;
        document.head.appendChild(flexFixStyle);
    }

    applySafariFixes() {
        console.log('🔧 应用 Safari 修复...');

        // Add Safari specific CSS class
        document.documentElement.classList.add('safari');

        // Fix audio autoplay in Safari
        if (this.featureSupport.audio) {
            document.addEventListener('click', () => {
                // Create a silent audio to enable user interaction
                const silentAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSl+zPLTgjMGHm7A7+OZURE');
                silentAudio.play().catch(() => {});
            }, { once: true });
        }

        // Fix backdrop filter
        if (!CSS.supports('backdrop-filter', 'blur(5px)')) {
            document.documentElement.classList.add('no-backdrop-filter');
        }
    }

    applyMobileFixes() {
        console.log('🔧 应用移动端修复...');

        // Add mobile class
        document.documentElement.classList.add('mobile-device');

        // Fix viewport issues
        const viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            const meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, initial-scale=1.0, user-scalable=no';
            document.head.appendChild(meta);
        }

        // Fix touch events
        this.setupTouchOptimizations();
    }

    applyFeatureSpecificFixes() {
        // CSS Variables fallback
        if (!this.featureSupport.cssVariables) {
            this.setupCSSVariableFallback();
        }

        // Service Worker fallback
        if (!this.featureSupport.serviceWorker) {
            this.setupServiceWorkerFallback();
        }

        // Fetch API fallback
        if (!this.featureSupport.fetch) {
            // Polyfill should handle this
            console.log('📦 Fetch API polyfill 已加载');
        }
    }

    setupCSSVariableFallback() {
        console.log('🎨 设置 CSS 变量降级...');

        if (window.cssVariablesProcessor) {
            // Define theme variables
            const lightTheme = {
                '--primary-color': '#667eea',
                '--secondary-color': '#764ba2',
                '--background-color': '#ffffff',
                '--text-color': '#333333',
                '--card-background': '#f8f9ff',
                '--border-color': '#e0e0e0'
            };

            const darkTheme = {
                '--primary-color': '#4c5fd5',
                '--secondary-color': '#667eea',
                '--background-color': '#1a1a1a',
                '--text-color': '#ffffff',
                '--card-background': '#2d2d2d',
                '--border-color': '#404040'
            };

            // Apply default theme
            window.cssVariablesProcessor.update(lightTheme);
        }
    }

    setupServiceWorkerFallback() {
        console.log('🚀 设置 Service Worker 降级...');

        if (!this.featureSupport.localStorage) {
            console.warn('⚠️ localStorage 也不可用，离线功能将受限');
            return;
        }

        // Create a simple cache using localStorage
        window.simpleCache = {
            set: function(key, value, ttl) {
                const item = {
                    value: value,
                    timestamp: Date.now(),
                    ttl: ttl || 3600000 // 1 hour default
                };
                localStorage.setItem(`cache_${key}`, JSON.stringify(item));
            },

            get: function(key) {
                try {
                    const item = JSON.parse(localStorage.getItem(`cache_${key}`));
                    if (!item) return null;

                    if (Date.now() - item.timestamp > item.ttl) {
                        localStorage.removeItem(`cache_${key}`);
                        return null;
                    }

                    return item.value;
                } catch (e) {
                    return null;
                }
            },

            remove: function(key) {
                localStorage.removeItem(`cache_${key}`);
            }
        };
    }

    setupPerformanceOptimizations() {
        console.log('⚡ 设置性能优化...');

        // Apply performance profile settings
        this.applyPerformanceProfile();

        // Setup memory monitoring
        this.setupMemoryMonitoring();

        // Setup animation optimizations
        this.setupAnimationOptimizations();
    }

    applyPerformanceProfile() {
        const profile = this.performanceProfile;

        // Apply performance settings to global scope
        window.soundHealingPerformance = {
            level: profile.level,
            score: profile.score,
            settings: profile.settings
        };

        // Add performance class to document
        document.documentElement.classList.add(`perf-${profile.level}`);
        document.documentElement.classList.add(`perf-score-${profile.score}`);

        console.log(`🎯 性能配置: ${profile.level} (分数: ${profile.score})`);
    }

    setupMemoryMonitoring() {
        if (!this.performanceProfile.settings.memoryOptimization) {
            return;
        }

        let lastCleanup = Date.now();
        const cleanupInterval = 30000; // 30 seconds

        const performCleanup = () => {
            const now = Date.now();
            if (now - lastCleanup < cleanupInterval) return;

            console.log('🧹 执行内存清理...');

            // Trigger cleanup for canvas animations
            if (window.backgroundSceneManager) {
                window.backgroundSceneManager.cleanup();
            }

            // Trigger cleanup for audio instances
            if (window.audioManager) {
                window.audioManager.performMemoryCleanup();
            }

            // Suggest garbage collection if available
            if (window.gc) {
                window.gc();
            }

            lastCleanup = now;
        };

        // Perform cleanup on visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                performCleanup();
            }
        });

        // Set up periodic cleanup
        setInterval(performCleanup, 60000); // Every minute
    }

    setupAnimationOptimizations() {
        const settings = this.performanceProfile.settings;

        // Reduce animation on low-end devices
        if (settings.targetFPS <= 30) {
            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
            const lowEndDevice = this.performanceProfile.level === 'low' || this.performanceProfile.level === 'very-low';

            if (reducedMotion.matches || lowEndDevice) {
                document.documentElement.classList.add('reduced-motion');

                // Add CSS for reduced motion
                const style = document.createElement('style');
                style.textContent = `
                    .reduced-motion * {
                        animation-duration: 0.01s !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01s !important;
                    }

                    .reduced-motion .particle {
                        opacity: 0.5;
                    }

                    .reduced-motion canvas {
                        opacity: 0.8;
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }

    setupEventListeners() {
        console.log('👂 设置兼容性事件监听器...');

        // Listen for audio manager events
        window.addEventListener('audioManagerInitialized', this.handleAudioManagerReady.bind(this));

        // Listen for background scene manager events
        window.addEventListener('backgroundSceneReady', this.handleBackgroundSceneReady.bind(this));

        // Listen for theme changes
        window.addEventListener('themeChanged', this.handleThemeChange.bind(this));

        // Listen for performance warnings
        window.addEventListener('performanceWarning', this.handlePerformanceWarning.bind(this));
    }

    handleAudioManagerReady(event) {
        console.log('🎵 音频管理器已就绪，应用兼容性设置...');

        const audioManager = event.detail.audioManager;

        // Apply audio compatibility settings
        if (audioManager && !this.featureSupport.webAudio) {
            console.log('📦 Web Audio API 不可用，使用降级音频控制');
            audioManager.enableWebAudioFallback = true;
        }
    }

    handleBackgroundSceneReady(event) {
        console.log('🎨 背景场景管理器已就绪，应用性能配置...');

        const sceneManager = event.detail.sceneManager;

        if (sceneManager && this.performanceProfile) {
            // Apply performance settings to scene manager
            sceneManager.applyPerformanceProfile(this.performanceProfile);
        }
    }

    handleThemeChange(event) {
        console.log('🎨 主题切换事件，应用兼容性处理...');

        if (!this.featureSupport.cssVariables) {
            // Update CSS variables using processor
            const newTheme = event.detail.theme;
            if (window.cssVariablesProcessor) {
                window.cssVariablesProcessor.update(newTheme);
            }
        }
    }

    handlePerformanceWarning(event) {
        console.warn('⚠️ 性能警告:', event.detail);

        // Apply emergency performance measures
        if (this.performanceProfile.level !== 'very-low') {
            this.applyEmergencyPerformanceReduction();
        }
    }

    applyEmergencyPerformanceReduction() {
        console.log('🚨 应用紧急性能降低...');

        document.documentElement.classList.add('emergency-low-performance');

        // Add emergency CSS
        const style = document.createElement('style');
        style.textContent = `
            .emergency-low-performance * {
                animation: none !important;
                transition: none !important;
                transform: none !important;
            }

            .emergency-low-performance canvas {
                opacity: 0.5 !important;
            }

            .emergency-low-performance .particle {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    applyCSSFixes() {
        console.log('🎭 应用 CSS 兼容性修复...');

        // Add browser-specific classes
        document.documentElement.classList.add(this.browserInfo.name.toLowerCase().replace(/\s+/g, '-'));

        if (this.browserInfo.isMobile) {
            document.documentElement.classList.add('mobile');
        }

        if (this.browserInfo.isTablet) {
            document.documentElement.classList.add('tablet');
        }

        // Apply feature-based classes
        Object.keys(this.featureSupport).forEach(feature => {
            if (this.featureSupport[feature]) {
                document.documentElement.classList.add(`supports-${feature.toLowerCase()}`);
            } else {
                document.documentElement.classList.add(`no-${feature.toLowerCase()}`);
            }
        });
    }

    setupAudioCompatibility() {
        console.log('🎵 设置音频兼容性...');

        // Setup audio format fallback
        this.setupAudioFormatFallback();

        // Setup autoplay policy handling
        this.setupAutoplayPolicy();

        // Setup audio context management
        this.setupAudioContextManagement();
    }

    setupAudioFormatFallback() {
        window.getOptimalAudioFormat = () => {
            const audio = document.createElement('audio');

            // Check format support in order of preference
            if (audio.canPlayType('audio/webm; codecs="opus"') !== '') {
                return 'webm';
            } else if (audio.canPlayType('audio/mpeg;') !== '') {
                return 'mp3';
            } else if (audio.canPlayType('audio/wav;') !== '') {
                return 'wav';
            } else {
                return 'mp3'; // Default fallback
            }
        };
    }

    setupAutoplayPolicy() {
        window.audioAutoplayPolicy = {
            requiresUserInteraction: this.browserInfo.name === 'Safari' || this.browserInfo.isMobile,
            userInteracted: false,

            markInteraction: function() {
                this.userInteracted = true;
                document.removeEventListener('click', this.markInteraction);
                document.removeEventListener('touchstart', this.markInteraction);
            }.bind(this),

            canAutoplay: function() {
                return !this.requiresUserInteraction || this.userInteracted;
            }.bind(this)
        };

        // Set up interaction listeners if needed
        if (window.audioAutoplayPolicy.requiresUserInteraction) {
            document.addEventListener('click', window.audioAutoplayPolicy.markInteraction, { once: true });
            document.addEventListener('touchstart', window.audioAutoplayPolicy.markInteraction, { once: true });
        }
    }

    setupAudioContextManagement() {
        window.createAudioContextSafely = () => {
            try {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (!AudioContextClass) {
                    throw new Error('Web Audio API not supported');
                }

                const audioContext = new AudioContextClass();

                // Handle autoplay policy for Safari
                if (audioContext.state === 'suspended') {
                    document.addEventListener('click', () => {
                        audioContext.resume();
                    }, { once: true });
                }

                return audioContext;
            } catch (error) {
                console.warn('Web Audio API 初始化失败:', error);
                return null;
            }
        };
    }

    setupCanvasCompatibility() {
        console.log('🎨 设置 Canvas 兼容性...');

        // Setup canvas performance optimizations
        this.setupCanvasPerformance();

        // Setup text rendering fallback
        this.setupTextRenderingFallback();
    }

    setupCanvasPerformance() {
        window.optimizeCanvasForPerformance = (canvas) => {
            const ctx = canvas.getContext('2d');
            if (!ctx) return canvas;

            // Apply performance optimizations based on profile
            const settings = this.performanceProfile.settings;

            // Disable image smoothing for performance
            if (settings.useSimpleRendering) {
                ctx.imageSmoothingEnabled = false;
                ctx.imageSmoothingQuality = 'low';
            }

            // Set will-change for animations
            if (settings.enableEffects) {
                canvas.style.willChange = 'transform';
            }

            return canvas;
        };
    }

    setupTextRenderingFallback() {
        // Add text rendering support check
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        window.supportsCanvasText = !!(ctx && ctx.fillText);

        if (!window.supportsCanvasText) {
            console.warn('⚠️ Canvas text rendering 不支持，将使用 DOM 文本降级');
            window.canvasTextRenderer = {
                render: function(text, x, y, options = {}) {
                    // Return DOM-based text rendering implementation
                    return null;
                }
            };
        }
    }

    // Public API
    getBrowserInfo() {
        return this.browserInfo;
    }

    getFeatureSupport() {
        return this.featureSupport;
    }

    getPerformanceProfile() {
        return this.performanceProfile;
    }

    isFeatureSupported(feature) {
        return this.featureSupport[feature] || false;
    }

    requiresPolyfill(feature) {
        return !this.featureSupport[feature];
    }

    isLowEndDevice() {
        return this.performanceProfile.level === 'low' || this.performanceProfile.level === 'very-low';
    }

    optimizeForDevice() {
        return this.performanceProfile.settings;
    }
}

// Auto-initialize
if (typeof window !== 'undefined') {
    window.CompatibilityIntegration = CompatibilityIntegration;

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.compatibilityIntegration = new CompatibilityIntegration();
        });
    } else {
        window.compatibilityIntegration = new CompatibilityIntegration();
    }
}

export default CompatibilityIntegration;