/**
 * VideoBackgroundManager - 视频背景管理系统
 *
 * 功能：
 * 1. 管理9个分类的循环视频背景
 * 2. 平滑切换视频
 * 3. 视频预加载和懒加载
 * 4. 性能优化和内存管理
 * 5. 降级方案（Canvas动画）
 *
 * @version 2.0.2
 * @date 2025-10-17
 * @update Force Vercel redeployment for Archive.org CDN
 */

class VideoBackgroundManager {
    constructor() {
        // 视频配置 - 本地优化版本（2-9MB，比Archive.org快）
        this.videoConfig = {
            baseUrl: 'https://media.soundflows.app/',
            categories: {
                'Animal sounds': {
                    filename: 'forest-birds.ia.mp4',
                    fallbackColor: '#2d5016'
                },
                'Chakra': {
                    filename: 'energy-chakra.ia.mp4',
                    fallbackColor: '#8b5cf6'
                },
                'Fire': {
                    filename: 'campfire-flames.ia.mp4',
                    fallbackColor: '#dc2626'
                },
                'hypnosis': {
                    filename: 'cosmic-stars.ia.mp4',
                    fallbackColor: '#6b21a8'
                },
                'meditation': {
                    filename: 'zen-bamboo.ia.mp4',
                    fallbackColor: '#065f46'
                },
                'Rain': {
                    filename: 'rain-drops.ia.mp4',
                    fallbackColor: '#1e3a8a'
                },
                'running water': {
                    filename: 'flowing-stream.ia.mp4',
                    fallbackColor: '#0e7490'
                },
                'Singing bowl sound': {
                    filename: 'temple-golden.ia.mp4',
                    fallbackColor: '#b45309'
                },
                'Subconscious Therapy': {
                    filename: 'dreamy-clouds.ia.mp4',
                    fallbackColor: '#7c3aed'
                }
            }
        };

        // DOM 元素
        this.videoContainer = null;
        this.currentVideo = null;
        this.nextVideo = null;
        this.canvasElement = null;

        // 状态管理
        this.currentCategory = null;
        this.isVideoSupported = this.checkVideoSupport();
        this.useCanvas = false; // 是否使用Canvas降级方案
        this.preloadedVideos = new Map(); // 预加载的视频缓存
        this.isTransitioning = false;

        // 性能监控
        this.performanceMetrics = {
            loadTime: 0,
            switchTime: 0,
            errorCount: 0
        };

        this.init();
    }

    /**
     * 初始化视频背景系统
     */
    init() {
        console.log('🎥 初始化视频背景系统...');

        // 检测视频支持
        if (!this.isVideoSupported) {
            console.warn('⚠️ 浏览器不支持视频，降级到Canvas动画');
            this.useCanvas = true;
            return;
        }

        // 创建视频容器
        this.createVideoContainer();

        // 监听音频分类切换事件
        this.listenToCategoryChanges();

        // 预加载首个视频（通常是meditation分类）
        this.preloadInitialVideo();

        const defaultCategory = 'meditation';
        const initialCategory = this.currentCategory || defaultCategory;
        if (this.videoConfig.categories[initialCategory]) {
            this.switchVideoBackground(initialCategory);
        }

        console.log('✅ 视频背景系统初始化完成');
    }

    /**
     * 预加载首个视频
     */
    preloadInitialVideo() {
        // ✅ 优化：只预加载最常用的1个视频，减少初始加载压力
        const initialCategories = ['meditation'];

        // 延迟3秒后才开始预加载，让页面其他资源先加载
        setTimeout(() => {
            initialCategories.forEach((category) => {
                const url = this.getVideoUrl(category);
                if (url) {
                    console.log('[Video] Queueing preload:', url);
                    this.preloadVideoInBackground(url);
                }
            });
        }, 3000);
    }

    async fetchVideoBlob(url) {
        try {
            // 首先尝试CORS请求
            const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
            if (!response.ok) {
                throw new Error(`视频资源下载失败: ${response.status} ${response.statusText}`);
            }
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch (corsError) {
            // CORS失败时，尝试使用代理方案
            console.warn('⚠️ CORS请求失败，尝试代理方案:', corsError.message);

            // 检查是否可以使用代理
            const proxyUrl = this.getProxyUrl(url);
            if (proxyUrl) {
                try {
                    const proxyResponse = await fetch(proxyUrl, { mode: 'cors', credentials: 'omit' });
                    if (proxyResponse.ok) {
                        const blob = await proxyResponse.blob();
                        console.log('✅ 通过代理成功加载视频:', url);
                        return URL.createObjectURL(blob);
                    }
                } catch (proxyError) {
                    console.warn('⚠️ 代理加载也失败:', proxyError.message);
                }
            }

            // 最后降级方案：直接使用视频URL（可能有限制）
            console.warn('⚠️ 降级到直接视频加载模式');
            throw new Error(`无法加载视频资源: ${url}`);
        }
    }

    /**
     * 获取代理URL（如果可用）
     */
    getProxyUrl(originalUrl) {
        // 这里可以配置代理服务器
        // 由于这是临时解决方案，我们可以返回null，让系统降级到Canvas
        return null;
    }

    /**
     * 检测浏览器是否支持视频
     */
    checkVideoSupport() {
        const video = document.createElement('video');
        return !!(video.canPlayType && video.canPlayType('video/mp4').replace(/no/, ''));
    }

    /**
     * 创建视频容器
     */
    createVideoContainer() {
        // 获取Canvas元素（作为参考位置）
        this.canvasElement = document.getElementById('backgroundCanvas');

        if (!this.canvasElement) {
            console.error('❌ 找不到Canvas元素');
            return;
        }

        // 创建视频容器
        this.videoContainer = document.createElement('div');
        this.videoContainer.id = 'videoBackgroundContainer';
        this.videoContainer.className = 'video-background-container';

        // 插入到Canvas之前
        this.canvasElement.parentNode.insertBefore(this.videoContainer, this.canvasElement);

        // 创建两个视频元素用于交叉淡入淡出
        this.currentVideo = this.createVideoElement('currentVideo');
        this.nextVideo = this.createVideoElement('nextVideo');

        this.videoContainer.appendChild(this.currentVideo);
        this.videoContainer.appendChild(this.nextVideo);

        // 隐藏Canvas（保留作为降级方案）
        this.canvasElement.style.display = 'none';

        console.log('✅ 视频容器创建完成');
    }

    /**
     * 创建视频元素
     */
    createVideoElement(id) {
        const video = document.createElement('video');
        video.id = id;
        video.className = 'background-video';
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.autoplay = false;
        video.preload = 'auto'; // 改为auto积极预加载，减少播放延迟
        video.crossOrigin = 'anonymous';

        return video;
    }

    /**
     * 监听音频分类切换
     */
    listenToCategoryChanges() {
        // 监听全局事件（从AudioManager触发）
        window.addEventListener('categoryChanged', (event) => {
            const category = event.detail.category;
            this.switchVideoBackground(category);
        });

        // 也可以通过直接调用切换
        window.switchVideoBackground = (category) => {
            this.switchVideoBackground(category);
        };
    }

    /**
     * 切换视频背景
     */
    async switchVideoBackground(category) {
        if (this.useCanvas) {
            console.log('🎨 使用Canvas降级方案');
            return;
        }

        if (this.isTransitioning) {
            console.log('⏳ 正在切换中，跳过本次请求');
            return;
        }

        if (this.currentCategory === category) {
            console.log('📌 相同分类，无需切换');
            return;
        }

        console.log(`🎬 切换视频背景: ${category}`);
        console.log(`   可用分类:`, Object.keys(this.videoConfig.categories));
        const startTime = performance.now();

        this.isTransitioning = true;
        this.currentCategory = category;

        try {
            // 获取视频URL
            const videoUrl = this.getVideoUrl(category);

            if (!videoUrl) {
                console.error(`❌ 未找到分类 "${category}" 的视频配置`);
                console.error(`   可用的分类:`, Object.keys(this.videoConfig.categories));
                this.fallbackToCanvas();
                return;
            }

            console.log(`   视频URL: ${videoUrl}`);

            // 如果视频已缓存，立即开始切换；否则先加载
            const isCached = this.preloadedVideos.has(videoUrl);
            if (isCached) {
                console.log(`[Video] Using cached blob: ${url}`);
            }

            // 预加载视频（如已缓存会立即返回）
            await this.loadVideo(this.nextVideo, videoUrl);

            // 平滑切换
            await this.transitionVideos();

            // 记录性能
            this.performanceMetrics.switchTime = performance.now() - startTime;
            console.log(`✅ 视频切换完成，耗时: ${this.performanceMetrics.switchTime.toFixed(2)}ms`);

            // 预加载下一个可能的视频（智能预加载）
            this.preloadNextVideos(category);

        } catch (error) {
            console.error('❌ 视频切换失败:', error);
            this.performanceMetrics.errorCount++;
            this.fallbackToCanvas();
        } finally {
            this.isTransitioning = false;
        }
    }

    /**
     * 获取视频URL
     */
    getVideoUrl(category) {
        const config = this.videoConfig.categories[category];
        if (!config) return null;

        return `${this.videoConfig.baseUrl}${config.filename}`;
    }

    /**
     * 加载视频
     * 改进：命中缓存时同样等待 canplay，避免过早淡入黑屏
     */
    async loadVideo(videoElement, url) {
        let cacheEntry = this.preloadedVideos.get(url);

        try {
            if (!cacheEntry || !cacheEntry.blobUrl) {
                console.log(`[Video] Downloading resource: ${url}`);
                const blobUrl = await this.fetchVideoBlob(url);
                cacheEntry = {
                    src: url,
                    blobUrl,
                    ready: true,
                    lastUsed: Date.now()
                };
                this.preloadedVideos.set(url, cacheEntry);
            } else {
                cacheEntry.ready = true;
                cacheEntry.lastUsed = Date.now();
                console.log(`[Video] Using cached blob: ${url}`);
            }

            await new Promise((resolve, reject) => {
                let timeoutId = null;

                const onReady = () => {
                    cleanup();
                    resolve();
                };

                const onError = (event) => {
                    cleanup();
                    const mediaError = event?.target?.error;
                    const message = mediaError?.message || event?.message || '未知错误';
                    reject(new Error(`视频加载失败: ${message} (${url})`));
                };

                const cleanup = () => {
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                    }
                    videoElement.removeEventListener('loadeddata', onReady);
                    videoElement.removeEventListener('error', onError);
                };

                videoElement.addEventListener('loadeddata', onReady, { once: true });
                videoElement.addEventListener('error', onError, { once: true });

                videoElement.setAttribute('data-source-url', url);
                videoElement.src = cacheEntry.blobUrl;
                videoElement.load();

                timeoutId = setTimeout(() => {
                    cleanup();
                    reject(new Error('视频加载超时'));
                }, 20000);
            });
        } catch (error) {
            if (cacheEntry && cacheEntry.blobUrl) {
                URL.revokeObjectURL(cacheEntry.blobUrl);
            }
            this.preloadedVideos.delete(url);
            throw error;
        }
    }

    /**
     * 平滑切换视频
     */
    async transitionVideos() {
        return new Promise((resolve) => {
            // 播放新视频
            this.nextVideo.play().catch(err => {
                console.warn('⚠️ 视频自动播放失败:', err);
            });

            // 淡入新视频
            this.nextVideo.style.opacity = '0';
            this.nextVideo.style.display = 'block';

            // 使用requestAnimationFrame实现平滑过渡
            requestAnimationFrame(() => {
                this.nextVideo.style.transition = 'opacity 1s ease-in-out';
                this.nextVideo.style.opacity = '1';

                // 淡出旧视频
                if (this.currentVideo.src) {
                    this.currentVideo.style.transition = 'opacity 1s ease-in-out';
                    this.currentVideo.style.opacity = '0';
                }

                // 等待过渡完成
                setTimeout(() => {
                    // 停止并隐藏旧视频
                    if (this.currentVideo.src) {
                        this.currentVideo.pause();
                        this.currentVideo.style.display = 'none';
                    }

                    // 交换视频元素引用
                    const temp = this.currentVideo;
                    this.currentVideo = this.nextVideo;
                    this.nextVideo = temp;

                    resolve();
                }, 1000); // 等待1秒过渡完成
            });
        });
    }

    /**
     * 智能预加载下一个可能播放的视频
     */
    preloadNextVideos(currentCategory) {
        // 根据用户历史和当前时间智能预测下一个分类
        const likelyNextCategories = this.predictNextCategories(currentCategory);

        // 预加载前2个最可能的视频
        likelyNextCategories.slice(0, 2).forEach(category => {
            const url = this.getVideoUrl(category);
            if (url && !this.preloadedVideos.has(url)) {
                this.preloadVideoInBackground(url);
            }
        });
    }

    /**
     * 预测下一个可能的分类
     */
    predictNextCategories(currentCategory) {
        // 简单的预测逻辑，可以根据用户历史数据改进
        const categorySequences = {
            'meditation': ['Singing bowl sound', 'Chakra', 'Rain'],
            'hypnosis': ['Rain', 'running water', 'Subconscious Therapy'],
            'Rain': ['running water', 'Animal sounds', 'meditation'],
            'Singing bowl sound': ['Chakra', 'meditation', 'Subconscious Therapy'],
            'Chakra': ['Singing bowl sound', 'meditation', 'Subconscious Therapy'],
            'Animal sounds': ['running water', 'Rain', 'meditation'],
            'Fire': ['Rain', 'running water', 'meditation'],
            'running water': ['Rain', 'Animal sounds', 'meditation'],
            'Subconscious Therapy': ['meditation', 'hypnosis', 'Singing bowl sound']
        };

        return categorySequences[currentCategory] || Object.keys(this.videoConfig.categories);
    }

    /**
     * 后台预加载视频
     */
    async preloadVideoInBackground(url) {
        try {
            const cached = this.preloadedVideos.get(url);
            if (cached && cached.blobUrl) {
                return;
            }

            const blobUrl = await this.fetchVideoBlob(url);
            this.preloadedVideos.set(url, {
                src: url,
                blobUrl,
                ready: true,
                lastUsed: Date.now()
            });
            console.log(`[Video] Preload complete: ${url}`);
        } catch (error) {
            console.warn(`[Video] Preload failed: ${url}`, error);
        }
    }
    /**
     * 降级到Canvas动画
     */
    fallbackToCanvas() {
        console.log('🎨 降级到Canvas动画');
        this.useCanvas = true;

        // 隐藏视频容器
        if (this.videoContainer) {
            this.videoContainer.style.display = 'none';
        }

        // 显示Canvas
        if (this.canvasElement) {
            this.canvasElement.style.display = 'block';
        }

        // 触发Canvas动画（如果BackgroundSceneManager存在）
        if (window.backgroundSceneManager) {
            window.backgroundSceneManager.switchScene(this.currentCategory);
        }
    }

    /**
     * 切换到Canvas模式（手动降级）
     */
    enableCanvasMode() {
        this.fallbackToCanvas();
    }

    /**
     * 切换回视频模式
     */
    enableVideoMode() {
        if (!this.isVideoSupported) {
            console.warn('⚠️ 浏览器不支持视频');
            return;
        }

        this.useCanvas = false;

        // 显示视频容器
        if (this.videoContainer) {
            this.videoContainer.style.display = 'block';
        }

        // 隐藏Canvas
        if (this.canvasElement) {
            this.canvasElement.style.display = 'none';
        }

        // 重新加载当前分类视频
        if (this.currentCategory) {
            this.switchVideoBackground(this.currentCategory);
        }
    }

    /**
     * 清理资源
     */
    cleanup() {
        // 停止所有视频
        if (this.currentVideo) {
            this.currentVideo.pause();
            this.currentVideo.src = '';
        }

        if (this.nextVideo) {
            this.nextVideo.pause();
            this.nextVideo.src = '';
        }

        // 清空预加载缓存
        this.preloadedVideos.clear();

        console.log('🧹 视频背景资源已清理');
    }

    /**
     * 获取性能指标
     */
    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            cacheSize: this.preloadedVideos.size,
            isVideoMode: !this.useCanvas
        };
    }

    /**
     * 获取当前状态
     */
    getStatus() {
        return {
            currentCategory: this.currentCategory,
            isVideoMode: !this.useCanvas,
            isTransitioning: this.isTransitioning,
            preloadedCount: this.preloadedVideos.size,
            performanceMetrics: this.performanceMetrics
        };
    }
}

// 自动初始化
let videoBackgroundManager;

// 等待DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        videoBackgroundManager = new VideoBackgroundManager();
        window.videoBackgroundManager = videoBackgroundManager;
    });
} else {
    videoBackgroundManager = new VideoBackgroundManager();
    window.videoBackgroundManager = videoBackgroundManager;
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoBackgroundManager;
}

// Force redeploy - 2025年10月22日 14:12:07
