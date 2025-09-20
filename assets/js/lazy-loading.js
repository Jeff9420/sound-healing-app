/**
 * 懒加载优化模块
 * 用于提升页面加载性能
 */

class LazyLoader {
    constructor() {
        this.imageObserver = null;
        this.audioObserver = null;
        this.init();
    }

    init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupObservers());
        } else {
            this.setupObservers();
        }
    }

    setupObservers() {
        // 设置图片懒加载
        this.setupImageLazyLoading();

        // 设置音频预加载优化
        this.setupAudioOptimization();

        // 设置CSS懒加载
        this.setupCSSLazyLoading();
    }

    setupImageLazyLoading() {
        // 检查浏览器是否支持Intersection Observer
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        this.imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px', // 提前50px开始加载
                threshold: 0.01
            });

            // 观察所有带有data-src的图片
            document.querySelectorAll('img[data-src]').forEach(img => {
                this.imageObserver.observe(img);
            });
        } else {
            // 降级处理：直接加载所有图片
            document.querySelectorAll('img[data-src]').forEach(img => {
                this.loadImage(img);
            });
        }
    }

    loadImage(img) {
        // 创建新的Image对象进行预加载
        const imageLoader = new Image();

        imageLoader.onload = () => {
            img.src = img.dataset.src;
            img.classList.add('loaded');
            img.removeAttribute('data-src');
        };

        imageLoader.onerror = () => {
            img.classList.add('error');
            console.warn('Image failed to load:', img.dataset.src);
        };

        imageLoader.src = img.dataset.src;
    }

    setupAudioOptimization() {
        // 预加载重要的音频文件
        this.preloadCriticalAudio();

        // 优化音频元素
        document.querySelectorAll('audio').forEach(audio => {
            // 设置preload属性
            audio.preload = 'none'; // 默认不预加载

            // 添加错误处理
            audio.addEventListener('error', (e) => {
                console.warn('Audio load error:', e.target.src);
            });
        });
    }

    preloadCriticalAudio() {
        // 预加载第一个音频文件（用户最可能播放的）
        const firstAudioCategory = 'meditation'; // 最受欢迎的分类
        this.preloadAudioCategory(firstAudioCategory, 1); // 只预加载1个文件
    }

    preloadAudioCategory(category, limit = 1) {
        // 这里会与audio-manager.js集成
        if (window.audioConfig && window.audioConfig[category]) {
            const tracks = window.audioConfig[category].slice(0, limit);
            tracks.forEach(track => {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = `assets/audio/${category}/${track}`;
                link.as = 'audio';
                document.head.appendChild(link);
            });
        }
    }

    setupCSSLazyLoading() {
        // 延迟加载非关键CSS
        const nonCriticalCSS = [
            '/assets/css/playlist.css',
            '/assets/css/mobile-optimized.css'
        ];

        // 在页面加载完成后加载非关键CSS
        window.addEventListener('load', () => {
            setTimeout(() => {
                nonCriticalCSS.forEach(cssFile => this.loadCSS(cssFile));
            }, 100);
        });
    }

    loadCSS(href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.media = 'print'; // 先设置为print媒体

        link.onload = () => {
            link.media = 'all'; // 加载完成后切换为all媒体
        };

        document.head.appendChild(link);
    }

    // 性能监控方法
    measurePerformance() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    const metrics = {
                        loadTime: perfData.loadEventEnd - perfData.loadEventStart,
                        domReady: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                        firstPaint: this.getFirstPaint(),
                        firstContentfulPaint: this.getFirstContentfulPaint()
                    };

                    console.log('Performance metrics:', metrics);

                    // 如果有GA4，发送性能数据
                    if (window.gtag) {
                        window.gtag('event', 'performance_timing', {
                            event_category: 'performance',
                            page_load_time: Math.round(metrics.loadTime),
                            dom_ready_time: Math.round(metrics.domReady)
                        });
                    }
                }, 0);
            });
        }
    }

    getFirstPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
        return firstPaint ? firstPaint.startTime : 0;
    }

    getFirstContentfulPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcp ? fcp.startTime : 0;
    }

    // 清理方法
    cleanup() {
        if (this.imageObserver) {
            this.imageObserver.disconnect();
        }
        if (this.audioObserver) {
            this.audioObserver.disconnect();
        }
    }
}

// 自动初始化
const lazyLoader = new LazyLoader();

// 启用性能监控
lazyLoader.measurePerformance();

// 导出以供其他模块使用
window.lazyLoader = lazyLoader;

// 模块导出（如果支持）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LazyLoader;
}