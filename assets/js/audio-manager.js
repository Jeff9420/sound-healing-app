/**
 * AudioManager - 音频管理器
 *
 * 负责应用程序的所有音频播放功能，包括：
 * - 音频格式检测和兼容性处理
 * - 播放列表管理和控制
 * - 音频实例的生命周期管理
 * - 音量控制和进度跟踪
 * - 全局事件系统
 *
 * @class
 * @author Sound Healing Team
 * @version 1.0.0
 */

// 防止重复加载和声明
if (typeof window !== 'undefined' && typeof window.AudioManager === 'undefined') {

    class AudioManager {
        constructor() {
            this.audioInstances = new Map();
            this.MAX_AUDIO_INSTANCES = 10; // 限制音频实例数量
            this.isInitialized = false;
            this.globalVolume = 0.5;
            this.categories = {};
            this.currentPlaylist = null;
            this.currentTrackIndex = 0;
            this.isPlaylistMode = false;
            this.shuffleMode = false;
            this.repeatMode = 'all'; // 'none', 'one', 'all' - 默认循环播放
            this.loadingStates = new Map();
            this.eventBus = new EventTarget();
            this.supportedFormats = {};
            this.currentAudio = null;
            this.currentTrack = null; // 当前播放的音轨信息
            this.progressUpdateInterval = null;

            // 音频加载重试配置
            this.retryConfig = {
                maxRetries: 3,
                initialDelay: 1000, // 1秒
                maxDelay: 10000, // 10秒
                backoffMultiplier: 2
            };
            this.retryAttempts = new Map(); // 跟踪每个音频的重试次数

            // 检测浏览器支持的音频格式
            this.detectSupportedFormats();

            // 初始化音频分类
            this.initializeCategories();

            // 添加页面卸载时的清理事件
            if (typeof window !== 'undefined') {
                window.addEventListener('beforeunload', () => this.cleanup(), { once: true });
            }

            // 增强的内存管理
            this.audioPool = []; // 音频对象池，重用Audio实例
            this.poolSize = 5; // 池大小，减少对象创建/销毁
            this.memoryCleanupTimer = null; // 定期内存清理定时器
            this.lastCleanupTime = Date.now();
            this.memoryUsageThreshold = 100 * 1024 * 1024; // 100MB内存阈值

            // 初始化对象池和内存监控
            this.initializeAudioPool();
            this.startMemoryMonitoring();
        }

        /**
     * 检测浏览器支持的音频格式
     * 创建临时音频元素测试各种格式的支持情况
     */
        detectSupportedFormats() {
            const audio = document.createElement('audio');
            this.supportedFormats = {
                mp3: audio.canPlayType('audio/mpeg') !== '',
                wma: audio.canPlayType('audio/x-ms-wma') !== '' || audio.canPlayType('audio/wma') !== '',
                wav: audio.canPlayType('audio/wav') !== '',
                ogg: audio.canPlayType('audio/ogg') !== '',
                flac: audio.canPlayType('audio/flac') !== '',
                m4a: audio.canPlayType('audio/mp4') !== '',
                aac: audio.canPlayType('audio/aac') !== ''
            };
        
            console.log('浏览器支持的音频格式:', this.supportedFormats);
        
            // 如果WMA不被支持，发出警告
            if (!this.supportedFormats.wma) {
                console.warn('此浏览器不支持WMA格式，WMA文件将创建为静默实例');
            }
        
            return this.supportedFormats;
        }

        initializeCategories() {
        // 从配置文件加载音频分类
            if (typeof AUDIO_CONFIG !== 'undefined' && AUDIO_CONFIG.categories) {
                this.categories = AUDIO_CONFIG.categories;
                console.log('✅ AudioManager: 成功加载音频分类', Object.keys(this.categories).length, '个类别');
            } else {
                console.warn('⚠️ AudioManager: AUDIO_CONFIG未定义');
            }
        }

        /**
     * 初始化音频管理器
     * 简化版 - 移除不必要的重试机制
     * @returns {Promise<void>}
     */
        async initialize() {
            try {
            // 简单检查配置是否已加载
                if (!this.categories || Object.keys(this.categories).length === 0) {
                // 尝试重新加载一次
                    this.initializeCategories();
                }

                // 如果仍然没有数据，等待一个短暂的延迟后再试
                if (!this.categories || Object.keys(this.categories).length === 0) {
                    console.log('⏳ AudioManager: 等待配置加载...');
                    await new Promise(resolve => setTimeout(resolve, 200));
                    this.initializeCategories();
                }

                // 最终检查
                if (!this.categories || Object.keys(this.categories).length === 0) {
                    throw new Error('❌ 音频配置未找到，请确保 audio-config.js 已正确加载');
                }

                console.log('✅ AudioManager: 初始化完成，共', Object.keys(this.categories).length, '个音频类别');

                this.isInitialized = true;
                this.loadUserSettings();
                this.eventBus.dispatchEvent(new CustomEvent('initialized'));
            } catch (error) {
                console.error('❌ 音频管理器初始化失败:', error);
                this.eventBus.dispatchEvent(new CustomEvent('error', { detail: error }));
                throw error;
            }
        }

        /**
     * 生成唯一的音轨ID
     * @param {string} categoryName - 分类名称
     * @param {string} fileName - 文件名
     * @returns {string} 唯一的音轨ID
     */
        generateTrackId(categoryName, fileName) {
            return `${categoryName}__${fileName}`.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '_');
        }

        /**
     * 获取音频显示名称（移除扩展名）
     * @param {string} fileName - 文件名
     * @returns {string} 显示名称
     */
        getDisplayName(fileName) {
            return fileName.replace(/\.(mp3|wav|ogg|m4a|wma|flac|aac)$/i, '');
        }

        /**
     * 计算重试延迟（指数退避）
     * @param {number} attemptNumber - 当前重试次数
     * @returns {number} 延迟时间（毫秒）
     */
        calculateRetryDelay(attemptNumber) {
            const delay = this.retryConfig.initialDelay * Math.pow(this.retryConfig.backoffMultiplier, attemptNumber);
            return Math.min(delay, this.retryConfig.maxDelay);
        }

        /**
     * 等待指定的时间
     * @param {number} ms - 等待时间（毫秒）
     * @returns {Promise<void>}
     */
        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        /**
     * 加载音频并带有重试机制
     * @param {HTMLAudioElement} audio - 音频元素
     * @param {string} fullPath - 音频URL
     * @param {string} fileName - 文件名
     * @param {string} trackId - 音轨ID
     * @returns {Promise<void>}
     */
        async loadAudioWithRetry(audio, fullPath, fileName, trackId) {
            const attemptNumber = this.retryAttempts.get(trackId) || 0;

            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    audio.removeEventListener('canplaythrough', onCanPlay);
                    audio.removeEventListener('error', onError);

                    if (attemptNumber < this.retryConfig.maxRetries) {
                        console.warn(`⏳ 音频加载超时，准备重试 (${attemptNumber + 1}/${this.retryConfig.maxRetries}): ${fileName}`);
                        reject(new Error('TIMEOUT'));
                    } else {
                        console.error(`❌ 音频加载超时，已达到最大重试次数: ${fileName}`);
                        reject(new Error(`音频加载超时: ${fileName}`));
                    }
                }, 15000);

                const onCanPlay = () => {
                    clearTimeout(timeout);
                    audio.removeEventListener('error', onError);
                    this.retryAttempts.delete(trackId); // 成功后清除重试记录
                    console.log(`✅ 音频加载成功: ${fileName}`);
                    resolve();
                };

                const onError = (error) => {
                    clearTimeout(timeout);
                    audio.removeEventListener('canplaythrough', onCanPlay);

                    if (attemptNumber < this.retryConfig.maxRetries) {
                        console.warn(`⚠️ 音频加载失败，准备重试 (${attemptNumber + 1}/${this.retryConfig.maxRetries}): ${fileName}`, error);
                        reject(new Error('LOAD_ERROR'));
                    } else {
                        console.error(`❌ 音频加载失败，已达到最大重试次数: ${fileName}`, error);
                        reject(new Error(`音频文件加载失败: ${fileName}`));
                    }
                };

                audio.addEventListener('canplaythrough', onCanPlay, { once: true });
                audio.addEventListener('error', onError, { once: true });

                audio.src = fullPath;
            });
        }

        /**
     * 创建音频实例
     * 管理音频实例的生命周期，防止内存泄漏
     * @param {string} trackId - 音轨ID
     * @param {string} categoryName - 分类名称
     * @param {string} fileName - 文件名
     * @returns {Promise<void>}
     */
        async createAudioInstance(trackId, categoryName, fileName) {
        // 检查是否超过最大实例数限制
            if (this.audioInstances.size >= this.MAX_AUDIO_INSTANCES) {
            // 清理最旧的已完成或暂停的实例
                for (const [existingTrackId, instance] of this.audioInstances) {
                    if (!instance.isPlaying && existingTrackId !== this.currentTrack) {
                        instance.audio.pause();
                        instance.audio.src = '';
                        this.audioInstances.delete(existingTrackId);
                        console.log(`清理音频实例: ${existingTrackId}`);
                        break;
                    }
                }
            }

            // 检查文件格式是否受支持（现在只支持MP3）
            const fileExtension = fileName.split('.').pop().toLowerCase();
            const isSupported = this.supportedFormats[fileExtension];

            if (!isSupported) {
                console.warn(`格式 ${fileExtension} 不受支持，为文件 ${fileName} 创建静默实例`);
                this.createSilentAudioInstance(trackId, categoryName, fileName);
                return Promise.resolve();
            }

            // 验证音频文件确实存在（通过Archive.org CDN）
            if (!fileExtension.match(/^(mp3)$/)) {
                console.warn(`文件格式 ${fileExtension} 不被支持，考虑转换为MP3格式: ${fileName}`);
            }

            // 从对象池获取音频实例，减少内存分配
            let audio = this.getAudioFromPool();
            audio.preload = 'auto'; // 改为auto积极预加载，减少播放延迟

            // 设置音频路径
            const fullPath = getAudioUrl(categoryName, fileName);

            // 验证URL安全性
            try {
                new URL(fullPath);
            } catch (e) {
                console.error(`无效的音频URL: ${fullPath}`);
                this.createSilentAudioInstance(trackId, categoryName, fileName);
                return Promise.resolve();
            }

            this.loadingStates.set(trackId, true);
            this.eventBus.dispatchEvent(new CustomEvent('loadingStart', { detail: trackId }));

            // Show loading indicator for external audio
            if (typeof window.loadingIndicator !== 'undefined') {
                window.loadingIndicator.showExternalAudioLoading(fileName);
            }

            // 使用重试机制加载音频
            let attemptNumber = 0;
            while (attemptNumber <= this.retryConfig.maxRetries) {
                try {
                    // 更新重试次数
                    this.retryAttempts.set(trackId, attemptNumber);

                    // 如果不是第一次尝试，等待一段时间后再重试
                    if (attemptNumber > 0) {
                        const delay = this.calculateRetryDelay(attemptNumber - 1);
                        console.log(`⏳ 等待 ${delay}ms 后重试...`);

                        // 更新加载指示器显示重试信息
                        if (typeof window.loadingIndicator !== 'undefined') {
                            window.loadingIndicator.showExternalAudioLoading(
                                `${fileName} (重试 ${attemptNumber}/${this.retryConfig.maxRetries})`
                            );
                        }

                        await this.sleep(delay);

                        // 重新创建音频元素以清除之前的错误状态
                        audio = new Audio();
                        audio.preload = 'auto'; // 改为auto积极预加载
                    }

                    // 尝试加载音频
                    await this.loadAudioWithRetry(audio, fullPath, fileName, trackId);

                    // 加载成功
                    this.loadingStates.set(trackId, false);
                    this.eventBus.dispatchEvent(new CustomEvent('loadingEnd', { detail: trackId }));

                    // Complete loading indicator
                    if (typeof window.loadingIndicator !== 'undefined') {
                        window.loadingIndicator.completeLoading();
                    }

                    audio.volume = this.globalVolume * 0.5;
                    this.audioInstances.set(trackId, {
                        audio: audio,
                        volume: 0.5,
                        isPlaying: false,
                        categoryName: categoryName,
                        fileName: fileName,
                        isReady: true,
                        lastUsedTime: Date.now() // 添加最后使用时间
                    });

                    // 添加结束事件监听
                    audio.addEventListener('ended', () => {
                        this.onTrackEnded(trackId);
                    });

                    return Promise.resolve();

                } catch (error) {
                    if (error.message === 'TIMEOUT' || error.message === 'LOAD_ERROR') {
                        // 可重试的错误
                        attemptNumber++;
                        if (attemptNumber > this.retryConfig.maxRetries) {
                            // 达到最大重试次数
                            console.error(`❌ 音频加载失败，已达到最大重试次数: ${fileName}`);
                            break;
                        }
                        // 继续下一次重试
                        continue;
                    } else {
                        // 不可重试的错误
                        console.error(`❌ 音频加载出现不可重试的错误: ${fileName}`, error);
                        break;
                    }
                }
            }

            // 所有重试都失败，创建静默实例
            this.loadingStates.set(trackId, false);
            this.eventBus.dispatchEvent(new CustomEvent('loadingEnd', { detail: trackId }));

            if (typeof window.loadingIndicator !== 'undefined') {
                window.loadingIndicator.showError(
                    `音频加载失败: ${fileName}\n已重试 ${this.retryConfig.maxRetries} 次`
                );
            }

            // 使用通知系统提示用户
            if (typeof window.showNotification === 'function') {
                window.showNotification(
                    `⚠️ 音频加载失败\n\n"${this.getDisplayName(fileName)}" 无法加载，可能原因：\n1. 网络连接问题\n2. CDN 暂时不可用\n\n建议：请检查网络连接或稍后重试`,
                    'warning',
                    'error'
                );
            }

            this.createSilentAudioInstance(trackId, categoryName, fileName);
            return Promise.resolve();
        }

        /**
     * 从预加载的音频创建实例
     */
        async createAudioInstanceFromPreloaded(trackId, categoryName, fileName, preloadedAudio) {
        // 检查是否超过最大实例数限制
            if (this.audioInstances.size >= this.MAX_AUDIO_INSTANCES) {
            // 清理最旧的已完成或暂停的实例
                for (const [existingTrackId, instance] of this.audioInstances) {
                    if (!instance.isPlaying && existingTrackId !== this.currentTrack) {
                        instance.audio.pause();
                        instance.audio.src = '';
                        this.audioInstances.delete(existingTrackId);
                        console.log(`清理音频实例: ${existingTrackId}`);
                        break;
                    }
                }
            }

            // 使用预加载的音频
            preloadedAudio.volume = this.globalVolume * 0.5;
            this.audioInstances.set(trackId, {
                audio: preloadedAudio,
                volume: 0.5,
                isPlaying: false,
                categoryName: categoryName,
                fileName: fileName,
                isReady: true,
                isPreloaded: true
            });

            console.log(`✅ 从预加载创建音频实例: ${fileName}`);

            // 添加结束事件监听
            preloadedAudio.addEventListener('ended', () => {
                this.onTrackEnded(trackId);
            });

            return Promise.resolve();
        }

        /**
     * 获取音频URL
     */
        getAudioUrl(categoryName, fileName) {
        // 如果是完整URL，直接返回
            if (fileName.startsWith('http://') || fileName.startsWith('https://')) {
                return fileName;
            }

            // 使用全局 getAudioUrl 函数从 audio-config.js
            if (typeof getAudioUrl === 'function') {
                return getAudioUrl(categoryName, fileName);
            }

            // 降级处理：如果全局函数不可用，使用本地路径
            console.warn('全局 getAudioUrl 函数不可用，使用本地路径');
            return `/assets/audio/${categoryName}/${fileName}`;
        }

        createSilentAudioInstance(trackId, categoryName, fileName) {
        // 创建一个静默的音频实例，避免应用崩溃
            const silentAudio = new Audio();

            // 检查是否超过最大实例数限制
            if (this.audioInstances.size >= this.MAX_AUDIO_INSTANCES) {
            // 清理最旧的静音实例
                for (const [existingTrackId, instance] of this.audioInstances) {
                    if (instance.isSilent && existingTrackId !== trackId) {
                        instance.audio.pause();
                        instance.audio.src = '';
                        this.audioInstances.delete(existingTrackId);
                        console.log(`清理静音音频实例: ${existingTrackId}`);
                        break;
                    }
                }
            }

            this.audioInstances.set(trackId, {
                audio: silentAudio,
                volume: 0,
                isPlaying: false,
                categoryName: categoryName,
                fileName: fileName,
                isReady: false,
                isSilent: true
            });

            console.info(`为 ${fileName} 创建了静默音频实例`);
        }

        async playTrack(trackId, categoryName, fileName, resetTime = false) {
        // 如果音频实例不存在，先创建
            if (!this.audioInstances.has(trackId)) {
            // 检查是否有预加载的音频
                let preloadedAudio = null;
                const audioUrl = this.getAudioUrl(categoryName, fileName);

                if (window.audioPreloader && audioUrl) {
                    preloadedAudio = window.audioPreloader.getPreloadedAudio(audioUrl);

                    if (preloadedAudio) {
                        console.log('🎵 使用预加载的音频:', fileName);
                        // 使用预加载的音频创建实例
                        await this.createAudioInstanceFromPreloaded(trackId, categoryName, fileName, preloadedAudio);
                    } else {
                    // 预加载下一个可能的音频
                        if (window.audioPreloader && audioUrl) {
                            window.audioPreloader.preloadNextInCategory(categoryName, audioUrl);
                        }
                        await this.createAudioInstance(trackId, categoryName, fileName);
                    }
                } else {
                    await this.createAudioInstance(trackId, categoryName, fileName);
                }
            }
        
            const instance = this.audioInstances.get(trackId);
            if (!instance || this.loadingStates.get(trackId)) {
                throw new Error(`音频未准备就绪: ${fileName}`);
            }

            // 如果是静默实例，直接模拟播放
            if (instance.isSilent) {
                instance.isPlaying = true;
                this.eventBus.dispatchEvent(new CustomEvent('trackPlay', { detail: trackId }));
                console.info(`静默模式播放: ${fileName}`);
                return;
            }

            try {
            // 显示聆听准备提示 - 已禁用以实现静默切换
                // this.showListeningPreparation();

                // 如果正在播放其他音频，暂停它们
                const currentlyPlaying = this.getPlayingTracks().filter(track => track.trackId !== trackId);
                currentlyPlaying.forEach(track => this.pauseTrack(track.trackId));

                // 只有在明确要求重置时间或者是新的音频时才重置时间
                if (resetTime || this.currentAudio !== instance.audio) {
                    instance.audio.currentTime = 0;
                }

                await instance.audio.play();
                instance.isPlaying = true;

                // 设置当前播放的音频
                this.currentAudio = instance.audio;
                this.currentTrack = { trackId, categoryName, fileName };
                this.startProgressUpdate();

                // 触发音频开始播放事件 - 用于显示弹窗播放器
                window.dispatchEvent(new CustomEvent('audioStarted', {
                    detail: { trackId, categoryName, fileName }
                }));

                // 添加到播放历史
                if (window.userDataManager) {
                    const displayName = this.getDisplayName(fileName);
                    window.userDataManager.addToHistory({
                        category: categoryName,
                        fileName: fileName,
                        displayName: displayName,
                        duration: instance.audio.duration || 0
                    });
                }

                this.eventBus.dispatchEvent(new CustomEvent('trackPlay', {
                    detail: { trackId, categoryName, fileName }
                }));

                // 触发音频切换事件（用于收藏按钮等功能）
                window.dispatchEvent(new CustomEvent('audio:trackChanged', {
                    detail: {
                        category: categoryName,
                        fileName: fileName,
                        displayName: this.getDisplayName(fileName)
                    }
                }));

                // 触发分类切换事件（用于视频背景切换）
                window.dispatchEvent(new CustomEvent('categoryChanged', {
                    detail: {
                        category: categoryName
                    }
                }));
            } catch (error) {
                if (error.name === 'NotAllowedError') {
                    throw new Error('浏览器阻止自动播放，请用户手动触发');
                }
                throw error;
            }
        }

        pauseTrack(trackId) {
            const instance = this.audioInstances.get(trackId);
            if (!instance) {
                return;
            }

            // 如果是静默实例，直接模拟暂停
            if (instance.isSilent) {
                instance.isPlaying = false;
                this.eventBus.dispatchEvent(new CustomEvent('trackPause', { detail: trackId }));
                console.info(`静默模式暂停: ${instance.fileName}`);
                return;
            }

            instance.audio.pause();
            instance.isPlaying = false;

            // 停止进度更新，但保留currentAudio引用以便继续播放
            if (this.currentAudio === instance.audio) {
                this.stopProgressUpdate();
                // 不清空currentAudio，这样暂停后再播放时可以从暂停位置继续
                // this.currentAudio = null;
            }
        
            this.eventBus.dispatchEvent(new CustomEvent('trackPause', { detail: trackId }));
        
            // 检查是否所有音频都已停止
            this.checkAllTracksStopped();
        }

        setTrackVolume(trackId, volume) {
            const instance = this.audioInstances.get(trackId);
            if (!instance) {
                return;
            }

            volume = Math.max(0, Math.min(1, volume));
            instance.volume = volume;
            instance.audio.volume = volume * this.globalVolume;
        
            this.eventBus.dispatchEvent(new CustomEvent('volumeChange', { 
                detail: { trackId, volume } 
            }));
        }

        setGlobalVolume(volume) {
            this.globalVolume = Math.max(0, Math.min(1, volume));
        
            for (const [trackId, instance] of this.audioInstances) {
                instance.audio.volume = instance.volume * this.globalVolume;
            }
        
            this.eventBus.dispatchEvent(new CustomEvent('globalVolumeChange', { 
                detail: this.globalVolume 
            }));
        }

        async toggleTrack(trackId, categoryName, fileName) {
            const instance = this.audioInstances.get(trackId);
        
            if (instance && instance.isPlaying) {
                this.pauseTrack(trackId);
            } else {
            // 如果是当前暂停的音轨，继续播放；否则重新开始
                const resetTime = !this.currentTrack || this.currentTrack.trackId !== trackId;
                await this.playTrack(trackId, categoryName, fileName, resetTime);
            }
        }

        // 继续播放当前暂停的音轨
        async resumeCurrentTrack() {
            if (this.currentTrack && this.currentAudio) {
                const { trackId, categoryName, fileName } = this.currentTrack;
                await this.playTrack(trackId, categoryName, fileName, false); // 不重置时间
            }
        }

        // 获取当前音轨信息
        getCurrentTrack() {
            return this.currentTrack;
        }

        pauseAll() {
            for (const [trackId, instance] of this.audioInstances) {
                if (instance.isPlaying) {
                    this.pauseTrack(trackId);
                }
            }
        
            // 检查是否所有音频都已停止
            this.checkAllTracksStopped();
        }

        checkAllTracksStopped() {
            const playingTracks = this.getPlayingTracks();
            if (playingTracks.length === 0) {
                this.eventBus.dispatchEvent(new CustomEvent('allTracksStopped'));
            }
        }

        getPlayingTracks() {
            return Array.from(this.audioInstances.entries())
                .filter(([_, instance]) => instance.isPlaying)
                .map(([trackId, instance]) => ({
                    trackId,
                    categoryName: instance.categoryName,
                    fileName: instance.fileName
                }));
        }

        isAnyPlaying() {
            return this.getPlayingTracks().length > 0;
        }

        // 播放列表功能
        async playPlaylist(categoryName, startIndex = 0) {
            const category = this.categories[categoryName];
            if (!category) {
                throw new Error(`分类不存在: ${categoryName}`);
            }

            // 保存原始轨道顺序
            const originalTracks = [...category.files];

            this.currentPlaylist = {
                categoryName: categoryName,
                originalTracks: originalTracks,  // 保存原始顺序
                tracks: originalTracks,         // 当前播放顺序（初始化为原始顺序）
                shuffleOrder: [],               // 随机顺序映射
                currentIndex: startIndex
            };
            this.isPlaylistMode = true;

            // 如果随机模式已启用，生成随机顺序
            if (this.shuffleMode) {
                this.generateShuffleOrder();
            }

            await this.playCurrentTrack();
        }

        async playCurrentTrack() {
            if (!this.currentPlaylist) {
                return;
            }

            const { categoryName, tracks, currentIndex } = this.currentPlaylist;
            const fileName = tracks[currentIndex];
            const trackId = this.generateTrackId(categoryName, fileName);

            await this.playTrack(trackId, categoryName, fileName);
            this.currentPlaylist.currentIndex = currentIndex;
        }

        async nextTrack() {
            if (!this.currentPlaylist || !this.isPlaylistMode) {
                return;
            }

            const { tracks } = this.currentPlaylist;
            let nextIndex;

            if (this.shuffleMode && this.currentPlaylist.shuffleOrder.length > 0) {
                // 随机播放模式
                nextIndex = this.getNextShuffleIndex(this.currentPlaylist.currentIndex);
                if (nextIndex === -1) {
                    this.isPlaylistMode = false;
                    return;
                }
            } else {
                // 正常播放模式
                nextIndex = this.currentPlaylist.currentIndex + 1;
                if (nextIndex >= tracks.length) {
                    if (this.repeatMode === 'all') {
                        nextIndex = 0;
                    } else {
                        this.isPlaylistMode = false;
                        return;
                    }
                }
            }

            this.currentPlaylist.currentIndex = nextIndex;
            await this.playCurrentTrack();
        }

        async previousTrack() {
            if (!this.currentPlaylist || !this.isPlaylistMode) {
                return;
            }

            const { tracks } = this.currentPlaylist;
            let prevIndex;

            if (this.shuffleMode && this.currentPlaylist.shuffleOrder.length > 0) {
                // 随机播放模式
                prevIndex = this.getPreviousShuffleIndex(this.currentPlaylist.currentIndex);
                if (prevIndex === -1) {
                    // 没有上一首，保持当前曲目
                    return;
                }
            } else {
                // 正常播放模式
                prevIndex = this.currentPlaylist.currentIndex - 1;
                if (prevIndex < 0) {
                    if (this.repeatMode === 'all') {
                        prevIndex = tracks.length - 1;
                    } else {
                        // 没有上一首，保持当前曲目
                        return;
                    }
                }
            }

            this.currentPlaylist.currentIndex = prevIndex;
            await this.playCurrentTrack();
        }

        onTrackEnded(trackId) {
            const instance = this.audioInstances.get(trackId);
            if (instance) {
                instance.isPlaying = false;
            }

            if (this.isPlaylistMode) {
                if (this.repeatMode === 'one') {
                // 重复当前曲目
                    this.playCurrentTrack();
                } else {
                // 播放下一首
                    this.nextTrack();
                }
            }

            this.eventBus.dispatchEvent(new CustomEvent('trackEnded', { detail: trackId }));
        
            // 检查是否所有音频都已停止
            this.checkAllTracksStopped();
        }

        setShuffleMode(enabled) {
            this.shuffleMode = enabled;

            if (this.currentPlaylist) {
                if (enabled) {
                    // 启用随机播放 - 生成随机顺序
                    this.generateShuffleOrder();
                    console.log('🔀 随机播放已启用');
                } else {
                    // 禁用随机播放 - 恢复原始顺序
                    this.restoreOriginalOrder();
                    console.log('📋 随机播放已禁用，恢复原始顺序');
                }

                // 触发模式变更事件
                this.eventBus.dispatchEvent(new CustomEvent('shuffleModeChanged', {
                    detail: { enabled }
                }));
            }
        }

        setRepeatMode(mode) {
            this.repeatMode = mode; // 'none', 'one', 'all'
        }

        /**
         * 生成随机播放顺序
         */
        generateShuffleOrder() {
            if (!this.currentPlaylist) {
                return;
            }

            const { originalTracks, currentIndex } = this.currentPlaylist;
            const trackCount = originalTracks.length;

            // 生成随机顺序数组（包含所有轨道的索引）
            let shuffleOrder = Array.from({ length: trackCount }, (_, i) => i);

            // Fisher-Yates 洗牌算法
            for (let i = shuffleOrder.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffleOrder[i], shuffleOrder[j]] = [shuffleOrder[j], shuffleOrder[i]];
            }

            // 确保当前播放的曲目的随机位置正确
            const currentTrackInShuffle = shuffleOrder.indexOf(currentIndex);
            if (currentTrackInShuffle !== 0) {
                // 将当前曲目移到随机顺序的第一位
                [shuffleOrder[0], shuffleOrder[currentTrackInShuffle]] =
                [shuffleOrder[currentTrackInShuffle], shuffleOrder[0]];
            }

            // 更新播放列表的随机顺序和当前轨道顺序
            this.currentPlaylist.shuffleOrder = shuffleOrder;
            this.currentPlaylist.tracks = shuffleOrder.map(index => originalTracks[index]);

            // 更新当前索引（在随机顺序中的位置）
            this.currentPlaylist.currentIndex = 0;

            console.log('🔀 随机播放顺序已生成:', this.currentPlaylist.tracks.map(t => this.getDisplayName(t)));
        }

        /**
         * 恢复原始播放顺序
         */
        restoreOriginalOrder() {
            if (!this.currentPlaylist) {
                return;
            }

            const { originalTracks, tracks, currentIndex } = this.currentPlaylist;

            // 找到当前播放的曲目在原始顺序中的位置
            const currentTrack = tracks[currentIndex];
            const originalIndex = originalTracks.indexOf(currentTrack);

            // 恢复原始顺序
            this.currentPlaylist.tracks = [...originalTracks];
            this.currentPlaylist.currentIndex = originalIndex;
            this.currentPlaylist.shuffleOrder = [];

            console.log('📋 已恢复原始播放顺序');
        }

        /**
         * 获取随机播放模式下的下一个索引
         */
        getNextShuffleIndex(currentIndex) {
            if (!this.currentPlaylist || !this.currentPlaylist.shuffleOrder.length) {
                return currentIndex + 1;
            }

            const { shuffleOrder } = this.currentPlaylist;
            const currentShuffleIndex = shuffleOrder[currentIndex];

            // 找到当前曲目在随机顺序中的位置
            const currentPosInShuffle = shuffleOrder.indexOf(currentShuffleIndex);

            // 返回下一个位置
            if (currentPosInShuffle < shuffleOrder.length - 1) {
                return currentIndex + 1;
            } else if (this.repeatMode === 'all') {
                // 循环播放，回到随机顺序的开头
                return 0;
            } else {
                // 没有更多曲目
                return -1;
            }
        }

        /**
         * 获取随机播放模式下的上一个索引
         */
        getPreviousShuffleIndex(currentIndex) {
            if (!this.currentPlaylist || !this.currentPlaylist.shuffleOrder.length) {
                return currentIndex - 1;
            }

            const { shuffleOrder } = this.currentPlaylist;

            if (currentIndex > 0) {
                return currentIndex - 1;
            } else if (this.repeatMode === 'all') {
                // 循环播放，回到随机顺序的末尾
                return shuffleOrder.length - 1;
            } else {
                // 没有上一首
                return -1;
            }
        }

        fadeIn(trackId, duration = 1000) {
            const instance = this.audioInstances.get(trackId);
            if (!instance) {
                return;
            }

            const targetVolume = instance.volume * this.globalVolume;
            const steps = 50;
            const stepDuration = duration / steps;
            const volumeStep = targetVolume / steps;
        
            let currentStep = 0;
            instance.audio.volume = 0;

            const fadeInterval = setInterval(() => {
                currentStep++;
                instance.audio.volume = Math.min(volumeStep * currentStep, targetVolume);
            
                if (currentStep >= steps) {
                    clearInterval(fadeInterval);
                    instance.audio.volume = targetVolume;
                }
            }, stepDuration);
        }

        fadeOut(trackId, duration = 1000) {
            const instance = this.audioInstances.get(trackId);
            if (!instance) {
                return;
            }

            const initialVolume = instance.audio.volume;
            const steps = 50;
            const stepDuration = duration / steps;
            const volumeStep = initialVolume / steps;
        
            let currentStep = 0;

            const fadeInterval = setInterval(() => {
                currentStep++;
                instance.audio.volume = Math.max(initialVolume - (volumeStep * currentStep), 0);
            
                if (currentStep >= steps) {
                    clearInterval(fadeInterval);
                    instance.audio.volume = 0;
                    this.pauseTrack(trackId);
                }
            }, stepDuration);
        }

        saveUserSettings() {
            const settings = {
                globalVolume: this.globalVolume,
                trackVolumes: {},
                repeatMode: this.repeatMode,
                shuffleMode: this.shuffleMode,
                timestamp: Date.now()
            };

            for (const [trackId, instance] of this.audioInstances) {
                settings.trackVolumes[trackId] = instance.volume;
            }

            try {
                localStorage.setItem('soundHealingSettings', JSON.stringify(settings));
            } catch (error) {
                console.warn('设置保存失败:', error);
            }
        }

        loadUserSettings() {
            try {
                const savedSettings = localStorage.getItem('soundHealingSettings');
                if (!savedSettings) {
                    return;
                }

                const settings = JSON.parse(savedSettings);
            
                if (settings.globalVolume !== undefined) {
                    this.setGlobalVolume(settings.globalVolume);
                }

                if (settings.repeatMode) {
                    this.setRepeatMode(settings.repeatMode);
                }

                if (settings.shuffleMode !== undefined) {
                    this.setShuffleMode(settings.shuffleMode);
                }

                // 轨道音量设置会在创建实例时应用

                this.eventBus.dispatchEvent(new CustomEvent('settingsLoaded', { detail: settings }));
            } catch (error) {
                console.warn('设置加载失败:', error);
            }
        }

        getTrackInstance(trackId) {
            return this.audioInstances.get(trackId);
        }

        getCategories() {
            return this.categories;
        }

        startProgressUpdate() {
            if (this.progressUpdateInterval) {
                this.stopProgressUpdate();
            }
        
            this.progressUpdateInterval = setInterval(() => {
                if (this.currentAudio && !this.currentAudio.paused) {
                    const currentTime = this.currentAudio.currentTime;
                    const duration = this.currentAudio.duration;
                
                    if (duration > 0) {
                        const progress = (currentTime / duration) * 100;
                        this.eventBus.dispatchEvent(new CustomEvent('progressUpdate', {
                            detail: {
                                currentTime,
                                duration,
                                progress
                            }
                        }));
                    }
                }
            }, 1000);
        }

        stopProgressUpdate() {
            if (this.progressUpdateInterval) {
                clearInterval(this.progressUpdateInterval);
                this.progressUpdateInterval = null;
            }
        }

        seekTo(position) {
            if (this.currentAudio && this.currentAudio.duration) {
                const seekTime = (position / 100) * this.currentAudio.duration;
                this.currentAudio.currentTime = seekTime;
            
                // 立即更新进度显示
                const progress = (seekTime / this.currentAudio.duration) * 100;
                this.eventBus.dispatchEvent(new CustomEvent('progressUpdate', {
                    detail: {
                        currentTime: seekTime,
                        duration: this.currentAudio.duration,
                        progress
                    }
                }));
            }
        }

        /**
         * 初始化音频对象池
         * 预创建Audio实例以减少运行时开销
         */
        initializeAudioPool() {
            console.log('🔄 AudioManager: 初始化音频对象池...');
            for (let i = 0; i < this.poolSize; i++) {
                const audio = new Audio();
                audio.preload = 'none'; // 池中实例不预加载
                this.audioPool.push({
                    audio: audio,
                    inUse: false,
                    lastUsed: Date.now()
                });
            }
            console.log(`✅ AudioManager: 音频对象池已创建，包含 ${this.poolSize} 个实例`);
        }

        /**
         * 从对象池获取音频实例
         * @returns {Object} 音频实例对象
         */
        getAudioFromPool() {
            // 查找可用的池实例
            let poolItem = this.audioPool.find(item => !item.inUse);

            if (poolItem) {
                poolItem.inUse = true;
                poolItem.lastUsed = Date.now();
                console.log('🎵 从对象池获取音频实例');
                return poolItem.audio;
            }

            // 如果池中没有可用实例，创建新的
            console.log('⚠️ 对象池已满，创建新音频实例');
            const newAudio = new Audio();
            newAudio.preload = 'auto';
            return newAudio;
        }

        /**
         * 将音频实例返回到对象池
         * @param {HTMLAudioElement} audio - 要回收的音频实例
         */
        returnAudioToPool(audio) {
            // 查找该音频是否属于池中的实例
            const poolItem = this.audioPool.find(item => item.audio === audio);

            if (poolItem) {
                // 重置音频状态
                audio.pause();
                audio.currentTime = 0;
                audio.src = '';
                audio.removeAttribute('src');

                poolItem.inUse = false;
                poolItem.lastUsed = Date.now();
                console.log('🔄 音频实例已返回到对象池');
            } else {
                // 不属于池的实例，直接清理
                audio.pause();
                audio.src = '';
                audio.load();
                console.log('🗑️ 清理非池音频实例');
            }
        }

        /**
         * 启动内存监控
         * 定期检查内存使用情况并执行清理
         */
        startMemoryMonitoring() {
            // 每30秒检查一次内存使用情况
            this.memoryCleanupTimer = setInterval(() => {
                this.performMemoryCleanup();
            }, 30000);

            // 监听页面可见性变化，页面隐藏时释放资源
            if (typeof document !== 'undefined') {
                document.addEventListener('visibilitychange', () => {
                    if (document.hidden) {
                        console.log('📱 页面隐藏，执行内存清理');
                        this.performMemoryCleanup();
                    }
                });
            }
        }

        /**
         * 执行内存清理
         * 清理未使用的音频实例和对象池
         */
        performMemoryCleanup() {
            const now = Date.now();
            const timeSinceLastCleanup = now - this.lastCleanupTime;

            // 如果距离上次清理不到2分钟，跳过
            if (timeSinceLastCleanup < 120000) {
                return;
            }

            console.log('🧹 AudioManager: 执行内存清理...');
            let cleanedInstances = 0;
            let cleanedPoolItems = 0;

            // 1. 清理未播放的音频实例（超过5分钟未使用）
            for (const [trackId, instance] of this.audioInstances) {
                if (!instance.isPlaying && trackId !== this.currentTrack?.trackId) {
                    const audioElement = instance.audio;
                    const hasActiveTimer = audioElement.dataset.hasActiveTimer === 'true';

                    // 检查是否有活跃的定时器或事件监听器
                    if (!hasActiveTimer && (now - instance.lastUsedTime > 300000)) {
                        console.log(`🗑️ 清理长期未使用的实例: ${trackId}`);
                        this.cleanupAudioInstance(instance);
                        this.audioInstances.delete(trackId);
                        cleanedInstances++;
                    }
                }
            }

            // 2. 清理对象池中长期未使用的实例
            for (const poolItem of this.audioPool) {
                if (!poolItem.inUse && (now - poolItem.lastUsed > 600000)) {
                    // 重置池实例
                    poolItem.audio.pause();
                    poolItem.audio.src = '';
                    poolItem.audio.load();
                    poolItem.lastUsed = now;
                    cleanedPoolItems++;
                }
            }

            // 3. 强制垃圾回收提示（如果浏览器支持）
            if (typeof window !== 'undefined' && window.gc) {
                try {
                    window.gc();
                    console.log('🗑️ 手动触发垃圾回收');
                } catch (e) {
                    // 忽略错误
                }
            }

            // 4. 检查并报告内存使用情况
            this.reportMemoryUsage();

            this.lastCleanupTime = now;
            console.log(`✅ 内存清理完成: 清理 ${cleanedInstances} 个实例, ${cleanedPoolItems} 个池项`);
        }

        /**
         * 清理单个音频实例
         * @param {Object} instance - 音频实例对象
         */
        cleanupAudioInstance(instance) {
            try {
                const audio = instance.audio;

                // 标记为正在清理，避免重复处理
                audio.dataset.hasActiveTimer = 'false';

                // 清理所有事件监听器
                audio.removeEventListener('ended', instance.onEnded);
                audio.removeEventListener('error', instance.onError);
                audio.removeEventListener('loadstart', instance.onLoadStart);
                audio.removeEventListener('canplay', instance.onCanPlay);
                audio.removeEventListener('timeupdate', instance.onTimeUpdate);

                // 暂停并重置
                if (!audio.paused) {
                    audio.pause();
                }

                audio.currentTime = 0;
                audio.src = '';
                audio.removeAttribute('src');

                // 释放媒体资源
                if (audio.src) {
                    audio.load();
                }

                // 清理引用
                instance.audio = null;
                instance.onEnded = null;
                instance.onError = null;

            } catch (error) {
                console.warn('清理音频实例时出错:', error);
            }
        }

        /**
         * 报告当前内存使用情况
         */
        reportMemoryUsage() {
            const activeInstances = this.audioInstances.size;
            const poolUsage = this.audioPool.filter(item => item.inUse).length;
            const totalMemoryEstimate = (activeInstances + poolUsage) * 10; // 估算每个实例约10MB

            console.log(`📊 内存使用报告:`);
            console.log(`  - 活跃音频实例: ${activeInstances}/${this.MAX_AUDIO_INSTANCES}`);
            console.log(`  - 对象池使用: ${poolUsage}/${this.poolSize}`);
            console.log(`  - 估算内存使用: ${(totalMemoryEstimate / 1024).toFixed(2)} MB`);

            // 如果估算内存超过阈值，执行强制清理
            if (totalMemoryEstimate > this.memoryUsageThreshold) {
                console.warn('⚠️ 内存使用超过阈值，执行强制清理');
                this.performMemoryCleanup();
            }

            // 触发内存使用事件
            this.eventBus.dispatchEvent(new CustomEvent('memoryUsageReport', {
                detail: {
                    activeInstances,
                    poolUsage,
                    estimatedMemoryMB: totalMemoryEstimate / 1024
                }
            }));
        }

        /**
         * 停止内存监控
         */
        stopMemoryMonitoring() {
            if (this.memoryCleanupTimer) {
                clearInterval(this.memoryCleanupTimer);
                this.memoryCleanupTimer = null;
            }
        }

        cleanup() {
            console.log('🧹 AudioManager: 开始清理资源...');

            // 停止进度更新
            this.stopProgressUpdate();

            // 清理所有音频实例
            for (const [trackId, instance] of this.audioInstances) {
                try {
                    // 暂停播放
                    instance.audio.pause();

                    // 移除事件监听器
                    instance.audio.removeEventListener('ended', this.onTrackEnded);
                    instance.audio.removeEventListener('error', () => {});
                    instance.audio.removeEventListener('canplaythrough', () => {});

                    // 清空音频源
                    instance.audio.src = '';

                    // 调用 load() 释放资源
                    instance.audio.load();

                    console.log(`✅ 清理音频实例: ${trackId}`);
                } catch (error) {
                    console.warn(`清理音频实例失败: ${trackId}`, error);
                }
            }

            // 停止内存监控
            this.stopMemoryMonitoring();

            // 清理对象池
            for (const poolItem of this.audioPool) {
                try {
                    if (poolItem.audio) {
                        poolItem.audio.pause();
                        poolItem.audio.src = '';
                        poolItem.audio.load();
                    }
                } catch (error) {
                    console.warn('清理对象池实例失败:', error);
                }
            }
            this.audioPool = [];

            // 清空所有实例映射
            this.audioInstances.clear();
            this.loadingStates.clear();

            // 重置状态
            this.currentAudio = null;
            this.currentTrack = null;
            this.currentPlaylist = null;
            this.isInitialized = false;
            this.isPlaylistMode = false;

            console.log('✅ AudioManager: 资源清理完成（包含对象池和内存监控）');
        }

        /**
         * 显示聆听准备提示 - 已禁用以实现静默音频切换
         */
        showListeningPreparation() {
            // 方法已禁用 - 不显示任何提示,实现完全静默的音频切换
            return;
        }
    }

    // 将AudioManager类添加到window对象以便全局访问
    if (typeof window !== 'undefined') {
        window.AudioManager = AudioManager;
        console.log('✅ AudioManager类定义已加载');
    }

} // 结束 AudioManager 类定义检查

// 创建全局实例（只创建一次）
if (typeof window !== 'undefined' && !window.audioManager && typeof window.AudioManager !== 'undefined') {
    window.audioManager = new window.AudioManager();
    console.log('✅ AudioManager全局实例已创建');
    
    // 立即初始化AudioManager
    window.audioManager.initialize().catch(error => {
        console.error('❌ AudioManager初始化失败:', error);
    });
} else if (typeof window !== 'undefined' && window.audioManager) {
    console.log('✅ AudioManager实例已存在，跳过创建');
}