/**
 * Performance Optimizer - 声音疗愈网站专用
 * 自动优化网站加载速度和运行性能
 * Version: 2.0.0
 */

class PerformanceOptimizer {
    constructor() {
        this.config = {
            // 图片优化
            lazyLoadImages: true,
            useWebP: true,
            placeholderQuality: 10,

            // 资源优化
            preloadCriticalResources: true,
            prefetchNextPages: true,
            cacheResources: true,

            // 代码优化
            deferNonCriticalJS: true,
            inlineCriticalCSS: true,

            // 网络优化
            useServiceWorker: true,

            // 监控
            monitorPerformance: true,
            autoOptimize: true
        };

        this.optimizations = {
            images: new Map(),
            scripts: new Set(),
            styles: new Set(),
            fonts: new Set()
        };

        this.init();
    }

    init() {
        this.optimizeImages();
        this.optimizeScripts();
        this.optimizeStyles();
        this.optimizeFonts();
        this.implementResourceHints();
        this.setupServiceWorker();
        this.setupAutoOptimization();

        console.log('⚡ Performance Optimizer v2.0 initialized');
    }

    // 1. 图片优化
    optimizeImages() {
        if (this.config.lazyLoadImages) {
            this.setupImageLazyLoading();
        }

        if (this.config.useWebP) {
            this.setupWebPSupport();
        }

        this.setupResponsiveImages();
        this.setupImageOptimization();
    }

    setupImageLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            // 观察所有图片
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });

            // 处理背景图片懒加载
            document.querySelectorAll('[data-bg-src]').forEach(el => {
                imageObserver.observe(el);
            });
        }
    }

    loadImage(img) {
        const src = img.dataset.src || img.src;

        const highQualityImg = new Image();
        highQualityImg.src = src;

        highQualityImg.onload = () => {
            if (img.dataset.src) {
                img.src = src;
            } else {
                img.style.backgroundImage = `url(${src})`;
            }
            img.classList.add('loaded');
            img.removeAttribute('data-src');
        };
    }

    setupWebPSupport() {
        const webP = new Image();
        webP.onload = webP.onerror = () => {
            this.supportsWebP = webP.height === 2;
            if (this.supportsWebP) {
                this.convertImagesToWebP();
            }
        };
        webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    }

    convertImagesToWebP() {
        document.querySelectorAll('img[src*=".jpg"], img[src*=".png"]').forEach(img => {
            const src = img.src;
            if (!src.includes('.webp') && src.includes('media.soundflows.app')) {
                const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                img.src = webpSrc;
            }
        });
    }

    setupResponsiveImages() {
        document.querySelectorAll('img[data-responsive]').forEach(img => {
            const widths = [320, 640, 960, 1280, 1920];
            const srcset = widths.map(width =>
                `${this.generateResponsiveSrc(img.src, width)} ${width}w`
            ).join(', ');

            img.srcset = srcset;
            img.sizes = '(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw';
        });
    }

    generateResponsiveSrc(src, width) {
        if (src.includes('media.soundflows.app')) {
            return `${src}?w=${width}&q=80&auto=format`;
        }
        return src;
    }

    setupImageOptimization() {
        this.setupProgressiveImageLoading();
        this.setupImagePriorityLoading();
    }

    setupProgressiveImageLoading() {
        document.querySelectorAll('img[data-progressive]').forEach(img => {
            const smallSrc = img.dataset.small;
            const largeSrc = img.dataset.large;

            const smallImg = new Image();
            smallImg.src = smallSrc;
            smallImg.onload = () => {
                img.src = smallSrc;
                img.classList.add('progressive-loaded');

                const largeImg = new Image();
                largeImg.src = largeSrc;
                largeImg.onload = () => {
                    img.src = largeSrc;
                    img.classList.add('progressive-complete');
                };
            };
        });
    }

    setupImagePriorityLoading() {
        const priorityMap = {
            'hero': 1,
            'above-fold': 2,
            'content': 3,
            'sidebar': 4,
            'footer': 5
        };

        document.querySelectorAll('img[data-priority]').forEach(img => {
            const priority = priorityMap[img.dataset.priority] || 5;
            img.dataset.loadingPriority = priority;
        });

        const images = Array.from(document.querySelectorAll('img[data-priority]'))
            .sort((a, b) => a.dataset.loadingPriority - b.dataset.loadingPriority);

        this.loadImagesSequentially(images);
    }

    loadImagesSequentially(images) {
        let index = 0;

        const loadNext = () => {
            if (index < images.length) {
                const img = images[index];
                this.loadImage(img);
                index++;

                if ('requestIdleCallback' in window) {
                    requestIdleCallback(loadNext, { timeout: 1000 });
                } else {
                    setTimeout(loadNext, 100);
                }
            }
        };

        loadNext();
    }

    // 2. 脚本优化
    optimizeScripts() {
        this.deferNonCriticalScripts();
        this.asyncThirdPartyScripts();
        this.preloadCriticalScripts();
        this.setupCodeSplitting();
    }

    deferNonCriticalScripts() {
        document.querySelectorAll('script[data-defer]').forEach(script => {
            script.defer = true;
            script.removeAttribute('data-defer');
        });
    }

    asyncThirdPartyScripts() {
        const thirdPartyScripts = [
            'https://www.google-analytics.com/analytics.js',
            'https://www.googletagmanager.com/gtm.js'
        ];

        thirdPartyScripts.forEach(src => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = () => {
                console.log(`✅ Loaded: ${src}`);
            };
            document.head.appendChild(script);
        });
    }

    preloadCriticalScripts() {
        const criticalScripts = [
            'assets/js/audio-config.js',
            'assets/js/i18n-system.js'
        ];

        criticalScripts.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'script';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    setupCodeSplitting() {
        // 动态导入非核心功能
        window.loadModule = (moduleName) => {
            const moduleMap = {
                'mixer': () => import('./audio-mixer.js'),
                'dashboard': () => import('./stats-dashboard.js'),
                'history': () => import('./history-favorites-ui.js')
            };

            if (moduleMap[moduleName]) {
                return moduleMap[moduleName]();
            }
        };
    }

    // 3. 样式优化
    optimizeStyles() {
        this.inlineCriticalCSS();
        this.loadNonCriticalCSS();
    }

    inlineCriticalCSS() {
        const criticalCSS = `
            .loading-screen { display: flex; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .hero-intro { padding: 80px 20px; }
            .category-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        `;

        if (!document.querySelector('style[data-critical]')) {
            const style = document.createElement('style');
            style.setAttribute('data-critical', 'true');
            style.textContent = criticalCSS;
            document.head.insertBefore(style, document.head.firstChild);
        }
    }

    loadNonCriticalCSS() {
        const loadCSS = (href) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.media = 'print';
            link.onload = () => {
                link.media = 'all';
            };
            document.head.appendChild(link);
        };

        const nonCriticalStyles = [
            'assets/css/mixer.css',
            'assets/css/stats-dashboard.css',
            'assets/css/history-favorites.css'
        ];

        nonCriticalStyles.forEach(href => {
            loadCSS(href);
        });
    }

    // 4. 字体优化
    optimizeFonts() {
        this.preloadFonts();
        this.setupFontDisplay();
    }

    preloadFonts() {
        const fonts = [
            {
                family: 'Inter',
                weights: [400, 600, 700]
            },
            {
                family: 'Noto Sans SC',
                weights: [400, 500, 700]
            }
        ];

        fonts.forEach(font => {
            font.weights.forEach(weight => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'font';
                link.type = 'font/woff2';
                link.crossOrigin = 'anonymous';
                link.href = `https://fonts.googleapis.com/css2?family=${font.family.replace(' ', '+')}:wght@${weight}&display=swap`;
                document.head.appendChild(link);
            });
        });
    }

    setupFontDisplay() {
        document.querySelectorAll('link[rel="stylesheet"][href*="fonts.googleapis.com"]').forEach(link => {
            if (!link.href.includes('display=swap')) {
                link.href += '&display=swap';
            }
        });
    }

    // 5. 资源提示优化
    implementResourceHints() {
        this.setupDNSPrefetch();
        this.setupPreconnect();
        this.setupPrefetch();
    }

    setupDNSPrefetch() {
        const domains = [
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com',
            'https://archive.org',
            'https://media.soundflows.app'
        ];

        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = domain;
            document.head.appendChild(link);
        });
    }

    setupPreconnect() {
        const criticalDomains = [
            'https://fonts.googleapis.com',
            'https://archive.org'
        ];

        criticalDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }

    setupPrefetch() {
        const likelyPages = [
            'resources.html',
            'privacy-policy.html'
        ];

        likelyPages.forEach(page => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = page;
            document.head.appendChild(link);
        });
    }

    // 6. Service Worker设置
    setupServiceWorker() {
        if ('serviceWorker' in navigator && this.config.useServiceWorker) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('✅ Service Worker registered');
                })
                .catch(error => {
                    console.error('❌ Service Worker failed:', error);
                });
        }
    }

    // 7. 自动优化
    setupAutoOptimization() {
        if (!this.config.autoOptimize) return;

        setInterval(() => {
            this.autoOptimizeBasedOnMetrics();
        }, 30000);

        this.setupNetworkAwareOptimization();
    }

    autoOptimizeBasedOnMetrics() {
        if (!window.performanceAnalytics) return;

        const metrics = window.performanceAnalytics.getMetrics();

        if (metrics.coreWebVitals && metrics.coreWebVitals.LCP > 3000) {
            this.optimizeImageLoading();
        }

        if (metrics.coreWebVitals && metrics.coreWebVitals.FID > 200) {
            this.optimizeJavaScriptExecution();
        }
    }

    optimizeImageLoading() {
        console.log('🔧 Optimizing image loading...');
        document.querySelectorAll('img').forEach(img => {
            if (img.src.includes('quality=')) {
                img.src = img.src.replace(/quality=\d+/, 'quality=60');
            }
        });
    }

    optimizeJavaScriptExecution() {
        console.log('🔧 Optimizing JavaScript execution...');
        if (window.loadModule) {
            setTimeout(() => {
                window.loadModule('mixer');
            }, 2000);
        }
    }

    setupNetworkAwareOptimization() {
        if ('connection' in navigator) {
            const connection = navigator.connection;

            const optimizeForNetwork = () => {
                const effectiveType = connection.effectiveType;

                if (effectiveType === 'slow-2g' || effectiveType === '2g') {
                    this.enableLowBandwidthMode();
                } else if (effectiveType === '3g') {
                    this.enable3GMode();
                } else {
                    this.enableHighBandwidthMode();
                }
            };

            optimizeForNetwork();
            connection.addEventListener('change', optimizeForNetwork);
        }
    }

    enableLowBandwidthMode() {
        console.log('📶 Low bandwidth mode enabled');
        document.body.classList.add('low-bandwidth');

        // 禁用非必要功能
        if (window.mixerUI) window.mixerUI.disable();
        if (window.statsDashboard) window.statsDashboard.disable();

        // 降低图片质量
        document.querySelectorAll('img').forEach(img => {
            if (img.src.includes('media.soundflows.app')) {
                img.src = img.src.replace(/q=\d+/, 'q=30');
            }
        });
    }

    enable3GMode() {
        console.log('📶 3G mode enabled');
        document.body.classList.add('medium-bandwidth');

        // 适度优化
        document.querySelectorAll('img').forEach(img => {
            if (img.src.includes('media.soundflows.app')) {
                img.src = img.src.replace(/q=\d+/, 'q=60');
            }
        });
    }

    enableHighBandwidthMode() {
        console.log('📶 High bandwidth mode enabled');
        document.body.classList.remove('low-bandwidth', 'medium-bandwidth');

        // 启用所有功能
        if (window.mixerUI) window.mixerUI.enable();
        if (window.statsDashboard) window.statsDashboard.enable();
    }

    // 公共API
    getOptimizationReport() {
        return {
            imagesOptimized: this.optimizations.images.size,
            scriptsOptimized: this.optimizations.scripts.size,
            stylesOptimized: this.optimizations.styles.size,
            fontsOptimized: this.optimizations.fonts.size,
            performanceScore: window.performanceAnalytics ?
                window.performanceAnalytics.getPerformanceScore() : null
        };
    }
}

// 初始化性能优化器
window.performanceOptimizer = new PerformanceOptimizer();

// 导出
window.PerformanceOptimizer = PerformanceOptimizer;