/**
 * 音频预加载模块 - SoundFlows
 * 智能预加载音频文件，提升用户体验
 */

class AudioPreloader {
    constructor() {
        this.preloadQueue = [];
        this.preloadedAudio = new Map();
        this.isPreloading = false;
        this.preloadSize = 0;
        this.maxPreloadSize = 50 * 1024 * 1024; // 50MB限制
        this.networkInfo = null;

        this.init();
    }

    init() {
    // 获取网络信息
        if ('connection' in navigator) {
            this.networkInfo = navigator.connection;
            this.networkInfo.addEventListener('change', () => this.handleNetworkChange());
        }

        // 监听在线状态
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // 从配置中获取精选音频列表
        this.loadFeaturedAudioList();
    }

    /**
   * 加载精选音频列表
   * 注意：所有音频已迁移至Archive.org CDN，无需预加载本地文件
   */
    loadFeaturedAudioList() {
        // 清空预加载列表 - 所有音频使用Archive.org CDN
        this.featuredAudio = [];

        console.log('🎵 音频预加载已禁用 - 使用Archive.org CDN提供音频服务');
        console.log('ℹ️ Archive.org自带CDN加速，无需额外预加载');
    }

    /**
   * 开始智能预加载
   */
    startPreload() {
        if (this.shouldPreload()) {
            this.preloadNext();
        }
    }

    /**
   * 判断是否应该预加载
   */
    shouldPreload() {
    // 检查网络状态
        if (!navigator.onLine) {
            return false;
        }

        // 检查网络类型
        if (this.networkInfo) {
            // 省流量模式不预加载
            if (this.networkInfo.saveData) {
                return false;
            }

            // 只在WiFi或以太网预加载
            const effectiveType = this.networkInfo.effectiveType;
            if (effectiveType !== 'wifi' && effectiveType !== 'ethernet' && effectiveType !== '4g') {
                return false;
            }
        }

        // 检查电池状态（如果可用）
        if ('getBattery' in navigator) {
            return navigator.getBattery().then(battery => {
                // 电量低于20%不预加载
                return battery.level > 0.2;
            });
        }

        return true;
    }

    /**
   * 预加载下一个音频
   */
    async preloadNext() {
        if (this.isPreloading) {
            return;
        }

        const nextAudio = this.featuredAudio.find(audio =>
            !this.preloadedAudio.has(audio.url) &&
      (this.preloadSize + audio.size) <= this.maxPreloadSize
        );

        if (!nextAudio) {
            console.log('🎵 所有精选音频预加载完成');
            this.dispatchPreloadComplete();
            return;
        }

        this.isPreloading = true;

        try {
            console.log(`🎵 预加载音频: ${nextAudio.url}`);

            const audio = new Audio();
            audio.preload = 'auto';

            // 设置超时
            const timeout = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('预加载超时')), 30000);
            });

            // 加载音频
            const loadPromise = new Promise((resolve, reject) => {
                audio.addEventListener('canplaythrough', () => resolve(audio), { once: true });
                audio.addEventListener('error', reject, { once: true });
                audio.src = nextAudio.url;
            });

            const loadedAudio = await Promise.race([loadPromise, timeout]);

            // 存储预加载的音频
            this.preloadedAudio.set(nextAudio.url, {
                audio: loadedAudio,
                category: nextAudio.category,
                size: nextAudio.size,
                loadedAt: Date.now()
            });

            this.preloadSize += nextAudio.size;

            console.log(`✅ 音频预加载成功: ${nextAudio.url}`);

            // 通知其他模块
            this.notifyAudioPreloaded(nextAudio);

        } catch (error) {
            console.warn(`⚠️ 音频预加载失败: ${nextAudio.url}`, error);
        } finally {
            this.isPreloading = false;

            // 继续预加载下一个
            if (this.shouldPreload()) {
                setTimeout(() => this.preloadNext(), 1000);
            }
        }
    }

    /**
   * 获取预加载的音频
   */
    getPreloadedAudio(url) {
        const preloaded = this.preloadedAudio.get(url);
        if (preloaded) {
            // 重置音频状态
            preloaded.audio.currentTime = 0;
            return preloaded.audio;
        }
        return null;
    }

    /**
   * 检查音频是否已预加载
   */
    isAudioPreloaded(url) {
        return this.preloadedAudio.has(url);
    }

    /**
   * 预加载特定音频
   */
    async preloadSpecificAudio(url) {
        if (this.preloadedAudio.has(url)) {
            return this.preloadedAudio.get(url).audio;
        }

        try {
            const audio = new Audio();
            audio.preload = 'auto';

            await new Promise((resolve, reject) => {
                audio.addEventListener('canplaythrough', resolve, { once: true });
                audio.addEventListener('error', reject, { once: true });
                audio.src = url;
            });

            this.preloadedAudio.set(url, {
                audio: audio,
                category: 'user_selected',
                size: 0, // 未知大小
                loadedAt: Date.now()
            });

            console.log(`✅ 指定音频预加载成功: ${url}`);
            return audio;

        } catch (error) {
            console.warn(`⚠️ 指定音频预加载失败: ${url}`, error);
            return null;
        }
    }

    /**
   * 清理预加载的音频
   */
    clearPreloadedAudio(category = null) {
        if (category) {
            // 清理特定类别
            for (const [url, data] of this.preloadedAudio) {
                if (data.category === category) {
                    data.audio.src = '';
                    this.preloadedAudio.delete(url);
                    this.preloadSize -= data.size;
                }
            }
        } else {
            // 清理所有
            for (const data of this.preloadedAudio.values()) {
                data.audio.src = '';
            }
            this.preloadedAudio.clear();
            this.preloadSize = 0;
        }

        console.log('🧹 预加载音频已清理');
    }

    /**
   * 获取预加载状态
   */
    getPreloadStatus() {
        return {
            total: this.featuredAudio.length,
            preloaded: this.preloadedAudio.size,
            size: this.preloadSize,
            maxSize: this.maxPreloadSize,
            progress: (this.preloadedAudio.size / this.featuredAudio.length) * 100
        };
    }

    /**
   * 处理网络变化
   */
    handleNetworkChange() {
        if (this.shouldPreload() && !this.isPreloading) {
            this.startPreload();
        } else if (!this.shouldPreload()) {
            this.clearPreloadedAudio();
        }
    }

    /**
   * 处理在线事件
   */
    handleOnline() {
        if (this.shouldPreload()) {
            this.startPreload();
        }
    }

    /**
   * 处理离线事件
   */
    handleOffline() {
    // 离线时停止预加载
        this.isPreloading = false;
    }

    /**
   * 通知音频预加载完成
   */
    notifyAudioPreloaded(audioInfo) {
        window.dispatchEvent(new CustomEvent('audioPreloaded', {
            detail: audioInfo
        }));
    }

    /**
   * 派发预加载完成事件
   */
    dispatchPreloadComplete() {
        window.dispatchEvent(new CustomEvent('audioPreloadComplete', {
            detail: this.getPreloadStatus()
        }));
    }

    /**
   * 预加载用户可能播放的下一个音频
   */
    preloadNextInCategory(currentCategory, currentUrl) {
        const categoryAudios = this.featuredAudio.filter(audio =>
            audio.category === currentCategory && audio.url !== currentUrl
        );

        if (categoryAudios.length > 0) {
            // 预加载同类别中的下一个音频
            this.preloadSpecificAudio(categoryAudios[0].url);
        }
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioPreloader;
} else if (typeof window !== 'undefined') {
    window.AudioPreloader = AudioPreloader;
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.audioPreloader = new AudioPreloader();

    // 延迟启动预加载，等待主要资源加载完成
    setTimeout(() => {
        window.audioPreloader.startPreload();
    }, 3000);
});