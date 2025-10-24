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
        this.maxCacheSize = 5; // 增加缓存到5个音频
        this.isPreloading = false;
        this.preloadQueue = []; // 预加载队列

        // 智能预加载相关
        this.userPreferences = new Map(); // 用户偏好记录
        this.preloadPriority = new Map(); // 预加载优先级
        this.networkSpeed = 'unknown'; // 网络速度检测
        this.lastPreloadTime = 0; // 上次预加载时间

        // 性能优化相关
        this.memoryUsage = 0; // 内存使用量
        this.maxMemoryUsage = 50 * 1024 * 1024; // 50MB最大内存使用
        this.preloadStats = {
            successCount: 0,
            failCount: 0,
            cacheHitCount: 0
        };

        this.initNetworkDetection();
        console.log('✅ AudioPreloader已初始化 (v2.1 - Enhanced)');
    }

    /**
     * 初始化网络速度检测
     */
    initNetworkDetection() {
        // 使用 navigator.connection API 检测网络状况
        if ('connection' in navigator) {
            const connection = navigator.connection;
            this.updateNetworkSpeed(connection.effectiveType);

            connection.addEventListener('change', () => {
                this.updateNetworkSpeed(connection.effectiveType);
            });
        }

        // 使用下载速度测试
        this.testNetworkSpeed();
    }

    /**
     * 更新网络速度
     */
    updateNetworkSpeed(effectiveType) {
        const speedMap = {
            'slow-2g': 'slow',
            '2g': 'slow',
            '3g': 'medium',
            '4g': 'fast',
            '5g': 'fast'
        };

        this.networkSpeed = speedMap[effectiveType] || 'unknown';

        // 根据网络速度调整预加载策略
        this.adjustPreloadStrategy();
    }

    /**
     * 测试网络速度
     */
    async testNetworkSpeed() {
        const startTime = Date.now();
        const testUrl = 'https://archive.org/download/sound-healing-collection/meditation/01-morning-meditation.mp3';

        try {
            const response = await fetch(testUrl, { method: 'HEAD' });
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // 根据响应时间估算网络速度
            if (responseTime < 500) {
                this.networkSpeed = 'fast';
            } else if (responseTime < 2000) {
                this.networkSpeed = 'medium';
            } else {
                this.networkSpeed = 'slow';
            }

            this.adjustPreloadStrategy();
        } catch (error) {
            console.warn('Network speed test failed:', error);
            this.networkSpeed = 'unknown';
        }
    }

    /**
     * 根据网络速度调整预加载策略
     */
    adjustPreloadStrategy() {
        switch (this.networkSpeed) {
            case 'fast':
                this.maxCacheSize = 5;
                break;
            case 'medium':
                this.maxCacheSize = 3;
                break;
            case 'slow':
                this.maxCacheSize = 2;
                break;
            default:
                this.maxCacheSize = 3;
        }

        console.log(`🌐 网络速度: ${this.networkSpeed}, 预加载策略: 最大缓存 ${this.maxCacheSize} 个音频`);
    }

    /**
     * 预加载音频（增强版）
     * @param {string} url - 音频URL
     * @param {string} name - 音频名称（用于日志）
     * @param {number} priority - 预加载优先级 (1-10, 10最高)
     * @returns {Promise<Audio>}
     */
    async preloadAudio(url, name = 'Unknown', priority = 5) {
        // 记录用户偏好
        this.trackUserPreference(url);

        // 如果已经缓存，直接返回
        if (this.preloadCache.has(url)) {
            this.preloadStats.cacheHitCount++;
            console.log(`⚡ 使用缓存音频: ${name}`);
            return this.preloadCache.get(url);
        }

        // 如果正在预加载相同URL，跳过
        if (this.preloadQueue.includes(url)) {
            console.log(`⏳ ${name} 已在预加载队列中`);
            return null;
        }

        // 检查网络状况和内存使用
        if (!this.shouldPreload()) {
            console.log(`🚫 网络状况不佳或内存不足，跳过预加载: ${name}`);
            return null;
        }

        // 估算音频大小
        const estimatedSize = await this.estimateAudioSize(url);
        if (this.memoryUsage + estimatedSize > this.maxMemoryUsage) {
            console.log(`💾 内存不足，清理旧缓存后预加载: ${name}`);
            await this.cleanupOldCache();
        }

        return new Promise((resolve, reject) => {
            this.preloadQueue.push(url);
            this.preloadPriority.set(url, priority);

            const audio = new Audio();
            audio.preload = 'auto';
            audio.src = url;

            // 根据网络状况调整超时时间
            const timeoutDuration = this.networkSpeed === 'slow' ? 20000 : 10000;
            const timeout = setTimeout(() => {
                this.removeFromQueue(url);
                this.preloadPriority.delete(url);
                this.preloadStats.failCount++;
                reject(new Error(`预加载超时: ${name}`));
            }, timeoutDuration);

            // 监听加载进度
            audio.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percent = (e.loaded / e.total) * 100;
                    // 可以在这里显示预加载进度
                    console.debug(`📊 ${name} 预加载进度: ${percent.toFixed(1)}%`);
                }
            });

            // 当足够数据可播放时，认为预加载成功
            audio.addEventListener('canplaythrough', () => {
                clearTimeout(timeout);
                console.log(`✅ 音频预加载完成: ${name}`);

                // 添加到缓存
                this.addToCache(url, audio, estimatedSize);

                // 从队列中移除
                this.removeFromQueue(url);
                this.preloadPriority.delete(url);

                this.preloadStats.successCount++;
                this.lastPreloadTime = Date.now();

                resolve(audio);
            }, { once: true });

            audio.addEventListener('error', (e) => {
                clearTimeout(timeout);
                console.warn(`⚠️ 音频预加载失败: ${name}`, e);

                this.removeFromQueue(url);
                this.preloadPriority.delete(url);
                this.preloadStats.failCount++;
                reject(e);
            }, { once: true });

            // 开始加载
            audio.load();
        });
    }

    /**
     * 判断是否应该预加载
     */
    shouldPreload() {
        // 检查网络状况
        if (this.networkSpeed === 'slow' && this.preloadCache.size >= 1) {
            return false;
        }

        // 检查内存使用
        if (this.memoryUsage > this.maxMemoryUsage * 0.8) {
            return false;
        }

        // 检查是否有空闲时间（用户不活跃时预加载）
        const timeSinceLastPreload = Date.now() - this.lastPreloadTime;
        if (timeSinceLastPreload < 2000 && this.preloadCache.size > 0) {
            return false;
        }

        return true;
    }

    /**
     * 估算音频大小
     */
    async estimateAudioSize(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            const contentLength = response.headers.get('content-length');
            return contentLength ? parseInt(contentLength) : 5 * 1024 * 1024; // 默认5MB
        } catch (error) {
            return 5 * 1024 * 1024; // 默认5MB
        }
    }

    /**
     * 清理旧缓存
     */
    async cleanupOldCache() {
        // 按优先级排序，优先删除低优先级的缓存
        const cacheEntries = Array.from(this.preloadCache.entries()).sort((a, b) => {
            const priorityA = this.preloadPriority.get(a[0]) || 5;
            const priorityB = this.preloadPriority.get(b[0]) || 5;
            return priorityA - priorityB;
        });

        // 删除最旧的或最低优先级的缓存
        while (cacheEntries.length > 0 && this.memoryUsage > this.maxMemoryUsage * 0.6) {
            const [url, audio] = cacheEntries.shift();

            // 估算并减少内存使用量
            const size = await this.estimateAudioSize(url);
            this.memoryUsage -= size;

            // 清理音频对象
            if (audio) {
                audio.pause();
                audio.src = '';
                audio.removeAttribute('src');
            }

            this.preloadCache.delete(url);
            this.preloadPriority.delete(url);

            console.log(`🗑️ 清理音频缓存: ${url.split('/').pop()}`);
        }
    }

    /**
     * 记录用户偏好
     */
    trackUserPreference(url) {
        const count = this.userPreferences.get(url) || 0;
        this.userPreferences.set(url, count + 1);

        // 保存到本地存储
        const prefs = Object.fromEntries(this.userPreferences);
        localStorage.setItem('audioPreferences', JSON.stringify(prefs));
    }

    /**
     * 加载用户偏好
     */
    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('audioPreferences');
            if (saved) {
                const prefs = JSON.parse(saved);
                this.userPreferences = new Map(Object.entries(prefs));
            }
        } catch (error) {
            console.warn('Failed to load user preferences:', error);
        }
    }

    /**
     * 添加到缓存（增强版）
     */
    async addToCache(url, audio, estimatedSize) {
        // 更新内存使用量
        this.memoryUsage += estimatedSize || 0;

        // 如果缓存已满，使用智能策略删除
        while (this.preloadCache.size >= this.maxCacheSize) {
            await this.smartCacheEviction();
        }

        this.preloadCache.set(url, audio);
        console.log(`✅ 音频已缓存: ${url.split('/').pop()} (大小: ${(estimatedSize / 1024 / 1024).toFixed(2)}MB)`);
    }

    /**
     * 智能缓存淘汰策略
     */
    async smartCacheEviction() {
        let keyToRemove;

        // 策略1: 优先删除用户不常听的音频
        const leastPlayed = Array.from(this.preloadCache.keys()).reduce((min, key) => {
            const minCount = this.userPreferences.get(min) || 0;
            const keyCount = this.userPreferences.get(key) || 0;
            return keyCount < minCount ? key : min;
        });

        // 策略2: 优先删除低优先级音频
        const lowestPriority = Array.from(this.preloadCache.keys()).reduce((min, key) => {
            const minPriority = this.preloadPriority.get(min) || 5;
            const keyPriority = this.preloadPriority.get(key) || 5;
            return keyPriority < minPriority ? key : min;
        });

        // 选择最合适的删除项
        const leastPlayedCount = this.userPreferences.get(leastPlayed) || 0;
        const lowestPriorityValue = this.preloadPriority.get(lowestPriority) || 5;

        if (leastPlayedCount < 2 && lowestPriorityValue < 7) {
            keyToRemove = leastPlayed;
        } else {
            keyToRemove = lowestPriority;
        }

        // 删除选中的缓存项
        if (keyToRemove) {
            const audio = this.preloadCache.get(keyToRemove);
            const size = await this.estimateAudioSize(keyToRemove);

            if (audio) {
                audio.pause();
                audio.src = '';
                audio.removeAttribute('src');
            }

            this.preloadCache.delete(keyToRemove);
            this.preloadPriority.delete(keyToRemove);
            this.memoryUsage -= size;

            console.log(`🗑️ 智能清理缓存: ${keyToRemove.split('/').pop()}`);
        }
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
     * 智能预加载播放列表的下一首（增强版）
     * @param {Array} tracks - 音频列表
     * @param {number} currentIndex - 当前播放索引
     * @param {boolean} isShuffleMode - 是否随机模式
     * @param {string} userBehavior - 用户行为模式 ('continuous', 'skip', 'repeat')
     */
    async preloadNext(tracks, currentIndex, isShuffleMode = false, userBehavior = 'continuous') {
        if (!tracks || tracks.length === 0) {
            return;
        }

        // 根据用户行为调整预加载策略
        const preloadCandidates = this.getPreloadCandidates(tracks, currentIndex, isShuffleMode, userBehavior);

        // 预加载前2个候选音频
        for (let i = 0; i < Math.min(2, preloadCandidates.length); i++) {
            const track = preloadCandidates[i];
            if (track && track.url) {
                // 检查是否已经缓存
                if (this.isCached(track.url)) {
                    console.log(`✅ 预加载目标已缓存: ${track.name}`);
                    continue;
                }

                // 计算优先级
                const priority = this.calculatePreloadPriority(track, i, userBehavior);

                console.log(`🔮 开始预加载: ${track.name} (优先级: ${priority})`);

                try {
                    await this.preloadAudio(track.url, track.name, priority);
                } catch (err) {
                    console.warn(`⚠️ 预加载失败: ${track.name}`, err);
                }
            }
        }
    }

    /**
     * 获取预加载候选列表
     */
    getPreloadCandidates(tracks, currentIndex, isShuffleMode, userBehavior) {
        const candidates = [];

        if (isShuffleMode) {
            // 随机模式：选择几个随机但不重复的轨道
            const availableIndices = [];
            for (let i = 0; i < tracks.length; i++) {
                if (i !== currentIndex) {
                    availableIndices.push(i);
                }
            }

            // 随机打乱
            for (let i = availableIndices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [availableIndices[i], availableIndices[j]] = [availableIndices[j], availableIndices[i]];
            }

            // 取前3个
            for (let i = 0; i < Math.min(3, availableIndices.length); i++) {
                candidates.push(tracks[availableIndices[i]]);
            }
        } else {
            // 顺序模式：预加载接下来的几首
            for (let i = 1; i <= 3; i++) {
                const index = (currentIndex + i) % tracks.length;
                candidates.push(tracks[index]);
            }
        }

        // 根据用户偏好排序
        return candidates.sort((a, b) => {
            const aPreference = this.userPreferences.get(a.url) || 0;
            const bPreference = this.userPreferences.get(b.url) || 0;
            return bPreference - aPreference;
        });
    }

    /**
     * 计算预加载优先级
     */
    calculatePreloadPriority(track, position, userBehavior) {
        let priority = 5; // 基础优先级

        // 根据位置调整优先级
        priority += (3 - position) * 2;

        // 根据用户偏好调整
        const preferenceCount = this.userPreferences.get(track.url) || 0;
        priority += Math.min(preferenceCount, 3);

        // 根据用户行为调整
        if (userBehavior === 'continuous') {
            priority += 1;
        } else if (userBehavior === 'skip') {
            priority -= 1;
        }

        // 根据网络速度调整
        if (this.networkSpeed === 'fast') {
            priority += 1;
        } else if (this.networkSpeed === 'slow') {
            priority -= 1;
        }

        // 确保优先级在1-10之间
        return Math.max(1, Math.min(10, priority));
    }

    /**
     * 预加载分类中的热门音频
     */
    async preloadPopularInCategory(categoryKey, audioConfig) {
        if (!audioConfig || !audioConfig[categoryKey]) {
            return;
        }

        const category = audioConfig[categoryKey];
        if (!category || !category.tracks) {
            return;
        }

        // 获取该分类中最受欢迎的音频（基于用户偏好）
        const popularTracks = category.tracks
            .map(track => ({
                ...track,
                preference: this.userPreferences.get(track.url) || 0
            }))
            .sort((a, b) => b.preference - a.preference)
            .slice(0, 3); // 取前3个

        console.log(`🔥 预加载分类 ${categoryKey} 中的热门音频`);

        for (const track of popularTracks) {
            if (!this.isCached(track.url)) {
                const priority = 8 + track.preference; // 高优先级
                try {
                    await this.preloadAudio(track.url, track.name, priority);
                } catch (err) {
                    console.warn(`预加载失败: ${track.name}`, err);
                }
            }
        }
    }

    /**
     * 获取缓存状态（增强版）
     */
    async getCacheStatus() {
        const total = this.preloadStats.successCount + this.preloadStats.failCount;
        const successRate = total > 0 ? (this.preloadStats.successCount / total * 100).toFixed(1) : 0;

        return {
            // 基本缓存信息
            cacheSize: this.preloadCache.size,
            maxCacheSize: this.maxCacheSize,
            queueLength: this.preloadQueue.length,

            // 内存使用情况
            memoryUsage: {
                current: this.memoryUsage,
                max: this.maxMemoryUsage,
                percentage: (this.memoryUsage / this.maxMemoryUsage * 100).toFixed(1)
            },

            // 网络状况
            networkSpeed: this.networkSpeed,

            // 统计信息
            stats: {
                successCount: this.preloadStats.successCount,
                failCount: this.preloadStats.failCount,
                cacheHitCount: this.preloadStats.cacheHitCount,
                successRate: `${successRate}%`
            },

            // 缓存的音频列表
            cachedUrls: Array.from(this.preloadCache.keys()).map(url => ({
                url: url,
                name: url.split('/').pop(),
                priority: this.preloadPriority.get(url) || 5,
                playCount: this.userPreferences.get(url) || 0
            }))
        };
    }

    /**
     * 获取性能报告
     */
    async getPerformanceReport() {
        const cacheStatus = await this.getCacheStatus();

        return {
            timestamp: new Date().toISOString(),
            ...cacheStatus,

            // 性能建议
            recommendations: this.getPerformanceRecommendations(cacheStatus)
        };
    }

    /**
     * 获取性能建议
     */
    getPerformanceRecommendations(status) {
        const recommendations = [];

        if (status.memoryUsage.percentage > 80) {
            recommendations.push('内存使用率过高，建议清理缓存');
        }

        if (status.stats.successRate < 80) {
            recommendations.push('预加载成功率较低，建议检查网络连接');
        }

        if (status.networkSpeed === 'slow' && status.cacheSize > 2) {
            recommendations.push('网络速度较慢，建议减少缓存数量');
        }

        if (status.cacheSize < status.maxCacheSize && status.networkSpeed === 'fast') {
            recommendations.push('网络状况良好，可以增加预加载数量');
        }

        if (recommendations.length === 0) {
            recommendations.push('预加载性能良好，无需优化');
        }

        return recommendations;
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