/**
 * AudioPreloader - 音频预加载管理器 (优化版)
 *
 * 功能:
 * 1. 预加载当前播放音频的下一首
 * 2. 管理预加载缓存，避免内存溢出
 * 3. 提高音频切换速度，减少等待时间
 *
 * @version 2.0.0
 * @date 2025-10-12
 */

class AudioPreloader {
    constructor() {
        this.preloadCache = new Map(); // 预加载的Audio对象缓存
        this.maxCacheSize = 3; // 最多缓存3个音频
        this.isPreloading = false;
        this.preloadQueue = []; // 预加载队列

        console.log('✅ AudioPreloader已初始化 (v2.0)');
    }

    /**
     * 预加载音频
     * @param {string} url - 音频URL
     * @param {string} name - 音频名称（用于日志）
     * @returns {Promise<Audio>}
     */
    preloadAudio(url, name = 'Unknown') {
        // 如果已经缓存，直接返回
        if (this.preloadCache.has(url)) {
            console.log(`⚡ 使用缓存音频: ${name}`);
            return Promise.resolve(this.preloadCache.get(url));
        }

        // 如果正在预加载相同URL，跳过
        if (this.preloadQueue.includes(url)) {
            console.log(`⏳ ${name} 已在预加载队列中`);
            return Promise.resolve(null);
        }

        return new Promise((resolve, reject) => {
            this.preloadQueue.push(url);

            const audio = new Audio();
            audio.preload = 'auto';
            audio.src = url;

            // 设置超时（10秒）
            const timeout = setTimeout(() => {
                this.removeFromQueue(url);
                reject(new Error(`预加载超时: ${name}`));
            }, 10000);

            // 当足够数据可播放时，认为预加载成功
            audio.addEventListener('canplaythrough', () => {
                clearTimeout(timeout);
                console.log(`✅ 音频预加载完成: ${name}`);

                // 添加到缓存
                this.addToCache(url, audio);

                // 从队列中移除
                this.removeFromQueue(url);

                resolve(audio);
            }, { once: true });

            audio.addEventListener('error', (e) => {
                clearTimeout(timeout);
                console.warn(`⚠️ 音频预加载失败: ${name}`, e);

                this.removeFromQueue(url);
                reject(e);
            }, { once: true });

            // 开始加载
            audio.load();
        });
    }

    /**
     * 添加到缓存
     */
    addToCache(url, audio) {
        // 如果缓存已满，删除最旧的
        if (this.preloadCache.size >= this.maxCacheSize) {
            const firstKey = this.preloadCache.keys().next().value;
            const oldAudio = this.preloadCache.get(firstKey);

            // 清理旧音频
            if (oldAudio) {
                oldAudio.pause();
                oldAudio.src = '';
            }

            this.preloadCache.delete(firstKey);
            console.log(`🧹 清理旧的音频缓存: ${firstKey.split('/').pop()}`);
        }

        this.preloadCache.set(url, audio);
    }

    /**
     * 从队列中移除
     */
    removeFromQueue(url) {
        const index = this.preloadQueue.indexOf(url);
        if (index > -1) {
            this.preloadQueue.splice(index, 1);
        }
    }

    /**
     * 获取缓存的音频
     */
    getCachedAudio(url) {
        return this.preloadCache.get(url);
    }

    /**
     * 检查是否已缓存
     */
    isCached(url) {
        return this.preloadCache.has(url);
    }

    /**
     * 清除所有缓存
     */
    clearCache() {
        // 停止并清理所有音频
        this.preloadCache.forEach((audio, url) => {
            audio.pause();
            audio.src = '';
        });

        this.preloadCache.clear();
        this.preloadQueue = [];
        console.log('🧹 清空音频缓存');
    }

    /**
     * 预加载播放列表的下一首
     * @param {Array} tracks - 音频列表
     * @param {number} currentIndex - 当前播放索引
     * @param {boolean} isShuffleMode - 是否随机模式
     */
    preloadNext(tracks, currentIndex, isShuffleMode = false) {
        if (!tracks || tracks.length === 0) {
            return;
        }

        let nextIndex;

        if (isShuffleMode) {
            // 随机模式：预加载一个随机的下一首
            do {
                nextIndex = Math.floor(Math.random() * tracks.length);
            } while (nextIndex === currentIndex && tracks.length > 1);
        } else {
            // 顺序模式：预加载下一首
            nextIndex = (currentIndex + 1) % tracks.length;
        }

        const nextTrack = tracks[nextIndex];

        if (nextTrack && nextTrack.url) {
            // 检查是否已经缓存
            if (this.isCached(nextTrack.url)) {
                console.log(`✅ 下一首已缓存: ${nextTrack.name}`);
                return;
            }

            console.log(`🔮 开始预加载下一首: ${nextTrack.name}`);

            this.preloadAudio(nextTrack.url, nextTrack.name).catch(err => {
                console.warn(`⚠️ 下一首预加载失败，不影响当前播放: ${nextTrack.name}`);
            });
        }
    }

    /**
     * 获取缓存状态
     */
    getCacheStatus() {
        return {
            cacheSize: this.preloadCache.size,
            maxCacheSize: this.maxCacheSize,
            queueLength: this.preloadQueue.length,
            cachedUrls: Array.from(this.preloadCache.keys()).map(url =>
                url.split('/').pop()
            )
        };
    }

    /**
     * 设置最大缓存大小
     */
    setMaxCacheSize(size) {
        this.maxCacheSize = size;
        console.log(`✅ 最大缓存大小设置为: ${size}`);

        // 如果当前缓存超过新的限制，清理多余的
        while (this.preloadCache.size > this.maxCacheSize) {
            const firstKey = this.preloadCache.keys().next().value;
            const oldAudio = this.preloadCache.get(firstKey);

            if (oldAudio) {
                oldAudio.pause();
                oldAudio.src = '';
            }

            this.preloadCache.delete(firstKey);
        }
    }
}

// 创建全局实例
const audioPreloader = new AudioPreloader();
window.audioPreloader = audioPreloader;

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioPreloader;
}

console.log('✅ AudioPreloader已加载 (v2.0)');