/**
 * 资源预加载配置
 * 智能预加载策略以提升用户体验
 */

class PreloadManager {
    constructor() {
        this.preloadQueue = [];
        this.preloadedResources = new Set();
        this.connectionType = this.getConnectionType();
        this.init();
    }

    init() {
        // 根据网络状况调整预加载策略
        this.adjustPreloadStrategy();

        // 设置预加载队列
        this.setupPreloadQueue();

        // 开始预加载
        this.startPreloading();
    }

    getConnectionType() {
        if ('connection' in navigator) {
            return navigator.connection.effectiveType || '4g';
        }
        return '4g'; // 默认假设4G
    }

    adjustPreloadStrategy() {
        // 根据网络连接类型调整策略
        switch (this.connectionType) {
            case 'slow-2g':
            case '2g':
                this.maxConcurrentPreloads = 1;
                this.preloadAudioLimit = 0; // 不预加载音频
                break;
            case '3g':
                this.maxConcurrentPreloads = 2;
                this.preloadAudioLimit = 1;
                break;
            case '4g':
            default:
                this.maxConcurrentPreloads = 3;
                this.preloadAudioLimit = 2;
                break;
        }
    }

    setupPreloadQueue() {
        // 关键资源优先级队列
        this.preloadQueue = [
            // 优先级1：关键样式和脚本
            {
                type: 'style',
                url: '/assets/css/main.css',
                priority: 1
            },
            {
                type: 'script',
                url: '/assets/js/audio-manager.js',
                priority: 1
            },
            {
                type: 'script',
                url: '/assets/js/background-scene-manager.js',
                priority: 1
            },

            // 优先级2：核心应用脚本
            {
                type: 'script',
                url: '/assets/js/app.js',
                priority: 2
            },
            {
                type: 'script',
                url: '/assets/js/ui-controller.js',
                priority: 2
            },

            // 优先级3：音频配置
            {
                type: 'script',
                url: '/assets/js/audio-config.js',
                priority: 3
            },

            // 优先级4：增强功能
            {
                type: 'script',
                url: '/assets/js/playlist-ui.js',
                priority: 4
            },
            {
                type: 'script',
                url: '/assets/js/theme-manager.js',
                priority: 4
            }
        ];

        // 根据网络状况过滤队列
        this.preloadQueue = this.preloadQueue.filter(item => {
            if (this.connectionType === 'slow-2g' || this.connectionType === '2g') {
                return item.priority <= 2; // 只预加载最关键的资源
            }
            return true;
        });
    }

    startPreloading() {
        // 按优先级排序
        this.preloadQueue.sort((a, b) => a.priority - b.priority);

        // 开始预加载
        this.processPreloadQueue();
    }

    async processPreloadQueue() {
        const activeTasks = [];

        for (const resource of this.preloadQueue) {
            // 控制并发数量
            while (activeTasks.length >= this.maxConcurrentPreloads) {
                await Promise.race(activeTasks);
                activeTasks.splice(0, 1);
            }

            // 添加预加载任务
            const task = this.preloadResource(resource);
            activeTasks.push(task);
        }

        // 等待所有任务完成
        await Promise.all(activeTasks);
        console.log('✅ 资源预加载完成');
    }

    async preloadResource(resource) {
        if (this.preloadedResources.has(resource.url)) {
            return; // 已经预加载过
        }

        try {
            switch (resource.type) {
                case 'style':
                    await this.preloadCSS(resource.url);
                    break;
                case 'script':
                    await this.preloadScript(resource.url);
                    break;
                case 'audio':
                    await this.preloadAudio(resource.url);
                    break;
                case 'image':
                    await this.preloadImage(resource.url);
                    break;
            }

            this.preloadedResources.add(resource.url);
            console.log(`✅ 预加载完成: ${resource.url}`);
        } catch (error) {
            console.warn(`⚠️ 预加载失败: ${resource.url}`, error);
        }
    }

    preloadCSS(url) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = url;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }

    preloadScript(url) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'script';
            link.href = url;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }

    preloadAudio(url) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'prefetch'; // 使用prefetch而不是preload，优先级较低
            link.href = url;
            link.as = 'audio';
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }

    preloadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
        });
    }

    // 智能预加载音频
    preloadAudioByCategory(category, limit = null) {
        if (this.preloadAudioLimit === 0) {
            return; // 网络较慢，不预加载音频
        }

        const actualLimit = limit || this.preloadAudioLimit;

        // 等待音频配置加载完成
        if (window.audioConfig && window.audioConfig[category]) {
            const tracks = window.audioConfig[category].slice(0, actualLimit);
            tracks.forEach(track => {
                const audioUrl = `assets/audio/${category}/${track}`;
                this.preloadQueue.push({
                    type: 'audio',
                    url: audioUrl,
                    priority: 5
                });
            });
        }
    }

    // 预加载用户可能访问的音频
    preloadPopularAudio() {
        // 根据使用统计或默认顺序预加载热门音频
        const popularCategories = ['meditation', 'rain', 'Singing bowl sound'];

        popularCategories.forEach(category => {
            this.preloadAudioByCategory(category, 1);
        });
    }

    // 监听用户交互，动态预加载
    setupIntelligentPreloading() {
        // 监听分类选择
        document.addEventListener('categoryHover', (e) => {
            const category = e.detail.category;
            this.preloadAudioByCategory(category, 2);
        });

        // 监听播放事件，预加载下一首
        document.addEventListener('audioPlay', (e) => {
            const currentCategory = e.detail.category;
            this.preloadNextTrack(currentCategory, e.detail.trackIndex);
        });
    }

    preloadNextTrack(category, currentIndex) {
        if (window.audioConfig && window.audioConfig[category]) {
            const tracks = window.audioConfig[category];
            const nextIndex = (currentIndex + 1) % tracks.length;
            const nextTrack = tracks[nextIndex];

            if (nextTrack) {
                const audioUrl = `assets/audio/${category}/${nextTrack}`;
                this.preloadResource({
                    type: 'audio',
                    url: audioUrl,
                    priority: 6
                });
            }
        }
    }

    // 清理预加载的资源
    cleanup() {
        // 移除预加载链接（可选）
        document.querySelectorAll('link[rel="preload"], link[rel="prefetch"]').forEach(link => {
            if (link.dataset.preloadManager) {
                link.remove();
            }
        });
    }
}

// 根据页面加载状态初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.preloadManager = new PreloadManager();
    });
} else {
    window.preloadManager = new PreloadManager();
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PreloadManager;
}