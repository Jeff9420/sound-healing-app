class AudioManager {
    constructor() {
        this.audioInstances = new Map();
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
        
        // Archive.org 外部存储相关
        this.downloadCache = new Map(); // 下载缓存
        this.retryAttempts = 3;
        this.retryDelay = 1000;
        
        // 检测浏览器支持的音频格式
        this.detectSupportedFormats();
        
        // 初始化音频分类
        this.initializeCategories();
    }

    detectSupportedFormats() {
        const audio = document.createElement('audio');
        this.supportedFormats = {
            mp3: audio.canPlayType('audio/mpeg') !== '',
            wma: audio.canPlayType('audio/x-ms-wma') !== '' || audio.canPlayType('audio/wma') !== '',
            wav: audio.canPlayType('audio/wav') !== '',
            ogg: audio.canPlayType('audio/ogg') !== ''
        };
        
        console.log('Supported audio formats:', this.supportedFormats);
    }

    initializeCategories() {
        if (typeof AUDIO_CONFIG !== 'undefined') {
            this.categories = AUDIO_CONFIG.categories;
            this.isInitialized = true;
            console.log('Audio categories initialized:', Object.keys(this.categories));
        } else {
            console.error('AUDIO_CONFIG not found');
        }
    }

    // Archive.org URL 生成
    generateAudioUrl(categoryKey, fileName) {
        const category = this.categories[categoryKey];
        if (!category) return null;

        const archiveFolder = category.archiveFolder || '';
        const baseUrl = AUDIO_CONFIG.baseUrl || '';
        
        return baseUrl + archiveFolder + encodeURIComponent(fileName);
    }

    // 生成多个URL用于重试
    generateAudioUrls(categoryKey, fileName) {
        const urls = [];
        
        // 主URL
        urls.push(this.generateAudioUrl(categoryKey, fileName));
        
        // 镜像URLs
        if (AUDIO_CONFIG.mirrorUrls) {
            const category = this.categories[categoryKey];
            const archiveFolder = category.archiveFolder || '';
            
            AUDIO_CONFIG.mirrorUrls.forEach(mirrorUrl => {
                urls.push(mirrorUrl + archiveFolder + encodeURIComponent(fileName));
            });
        }
        
        return urls.filter(url => url); // 移除null/undefined
    }

    // 带重试和进度更新的音频加载
    async loadAudioWithRetryAndProgress(categoryKey, fileName, trackId) {
        const urls = this.generateAudioUrls(categoryKey, fileName);
        const cacheKey = `${categoryKey}:${fileName}`;
        
        // 检查缓存
        if (this.downloadCache.has(cacheKey)) {
            return this.downloadCache.get(cacheKey).audio;
        }
        
        let lastError = null;
        let currentUrlIndex = 0;
        
        for (const url of urls) {
            for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
                try {
                    console.log(`Attempting to load: ${url} (attempt ${attempt + 1})`);
                    
                    // 更新UI进度
                    const progress = ((currentUrlIndex * this.retryAttempts + attempt) / (urls.length * this.retryAttempts)) * 100;
                    const message = currentUrlIndex === 0 ? 
                        `正在从主服务器加载... (${attempt + 1}/${this.retryAttempts})` :
                        `尝试镜像站点 ${currentUrlIndex} ... (${attempt + 1}/${this.retryAttempts})`;
                    
                    if (window.enhancedAudioUI) {
                        window.enhancedAudioUI.updateLoadingProgress(trackId, progress, message);
                    }
                    
                    const audio = new Audio();
                    audio.crossOrigin = 'anonymous';
                    audio.preload = 'metadata';
                    
                    // Promise wrapper for audio loading
                    const audioPromise = new Promise((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            reject(new Error('Audio load timeout'));
                        }, 30000); // 30秒超时
                        
                        audio.addEventListener('canplaythrough', () => {
                            clearTimeout(timeout);
                            resolve(audio);
                        });
                        
                        audio.addEventListener('error', () => {
                            clearTimeout(timeout);
                            reject(new Error(`Audio load error: ${audio.error?.message || 'Unknown error'}`));
                        });
                        
                        // 加载进度监听
                        audio.addEventListener('progress', () => {
                            if (audio.buffered.length > 0) {
                                const bufferedProgress = (audio.buffered.end(0) / audio.duration) * 100;
                                if (window.enhancedAudioUI && !isNaN(bufferedProgress)) {
                                    window.enhancedAudioUI.updateLoadingProgress(trackId, 
                                        Math.min(85 + bufferedProgress * 0.15, 100), 
                                        '缓冲音频数据...');
                                }
                            }
                        });
                        
                        audio.src = url;
                    });
                    
                    const loadedAudio = await audioPromise;
                    
                    // 缓存成功加载的音频
                    this.downloadCache.set(cacheKey, {
                        audio: loadedAudio,
                        url: url,
                        timestamp: Date.now()
                    });
                    
                    console.log(`Successfully loaded: ${fileName} from ${url}`);
                    return loadedAudio;
                    
                } catch (error) {
                    console.warn(`Failed to load ${fileName} from ${url} (attempt ${attempt + 1}):`, error.message);
                    lastError = error;
                    
                    // 等待后重试
                    if (attempt < this.retryAttempts - 1) {
                        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)));
                    }
                }
            }
            currentUrlIndex++;
        }
        
        throw new Error(`Failed to load ${fileName} from all sources. Last error: ${lastError?.message}`);
    }

    // 带重试的音频加载（保持向后兼容）
    async loadAudioWithRetry(categoryKey, fileName) {
        const urls = this.generateAudioUrls(categoryKey, fileName);
        const cacheKey = `${categoryKey}:${fileName}`;
        
        // 检查缓存
        if (this.downloadCache.has(cacheKey)) {
            return this.downloadCache.get(cacheKey);
        }
        
        let lastError = null;
        
        for (const url of urls) {
            for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
                try {
                    console.log(`Attempting to load: ${url} (attempt ${attempt + 1})`);
                    
                    const audio = new Audio();
                    audio.crossOrigin = 'anonymous';
                    audio.preload = 'metadata';
                    
                    // Promise wrapper for audio loading
                    const audioPromise = new Promise((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            reject(new Error('Audio load timeout'));
                        }, 30000); // 30秒超时
                        
                        audio.addEventListener('canplaythrough', () => {
                            clearTimeout(timeout);
                            resolve(audio);
                        });
                        
                        audio.addEventListener('error', () => {
                            clearTimeout(timeout);
                            reject(new Error(`Audio load error: ${audio.error?.message || 'Unknown error'}`));
                        });
                        
                        audio.src = url;
                    });
                    
                    const loadedAudio = await audioPromise;
                    
                    // 缓存成功加载的音频
                    this.downloadCache.set(cacheKey, {
                        audio: loadedAudio,
                        url: url,
                        timestamp: Date.now()
                    });
                    
                    console.log(`Successfully loaded: ${fileName} from ${url}`);
                    return loadedAudio;
                    
                } catch (error) {
                    console.warn(`Failed to load ${fileName} from ${url} (attempt ${attempt + 1}):`, error.message);
                    lastError = error;
                    
                    // 等待后重试
                    if (attempt < this.retryAttempts - 1) {
                        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)));
                    }
                }
            }
        }
        
        throw new Error(`Failed to load ${fileName} from all sources. Last error: ${lastError?.message}`);
    }

    async playTrack(trackId, categoryKey, fileName) {
        try {
            // 显示增强的加载UI
            if (window.enhancedAudioUI) {
                window.enhancedAudioUI.showLoadingState(trackId, categoryKey, fileName);
            }
            
            // 设置加载状态
            this.setLoadingState(trackId, true);
            this.eventBus.dispatchEvent(new CustomEvent('loadingStart', { detail: { trackId, fileName } }));
            
            // 停止当前播放
            if (this.currentAudio) {
                this.currentAudio.pause();
                this.currentAudio.currentTime = 0;
            }
            
            // 加载音频（带重试机制和进度更新）
            const audio = await this.loadAudioWithRetryAndProgress(categoryKey, fileName, trackId);
            
            // 配置音频
            audio.volume = this.globalVolume;
            
            // 播放音频
            await audio.play();
            
            // 更新状态
            this.currentAudio = audio;
            this.currentTrack = { trackId, categoryKey, fileName };
            this.audioInstances.set(trackId, audio);
            
            // 设置事件监听器
            audio.addEventListener('ended', () => this.handleTrackEnded(trackId));
            audio.addEventListener('timeupdate', () => this.handleProgressUpdate(trackId, audio));
            
            // 开始进度更新
            this.startProgressUpdate();
            
            // 显示成功状态
            if (window.enhancedAudioUI) {
                window.enhancedAudioUI.showSuccessState(trackId);
            }
            
            // 清除加载状态
            this.setLoadingState(trackId, false);
            this.eventBus.dispatchEvent(new CustomEvent('loadingEnd', { detail: { trackId, fileName } }));
            this.eventBus.dispatchEvent(new CustomEvent('trackPlay', { detail: { trackId, fileName } }));
            
            console.log(`Now playing: ${fileName}`);
            
        } catch (error) {
            console.error(`Failed to play ${fileName}:`, error);
            
            // 显示错误状态
            if (window.enhancedAudioUI) {
                const retryCount = this.getRetryCount(trackId);
                window.enhancedAudioUI.showErrorState(trackId, `加载失败: ${error.message}`, retryCount);
            }
            
            this.setLoadingState(trackId, false);
            this.eventBus.dispatchEvent(new CustomEvent('loadingEnd', { detail: { trackId, fileName, error: error.message } }));
            throw error;
        }
    }

    pauseTrack(trackId) {
        const audio = this.audioInstances.get(trackId);
        if (audio) {
            audio.pause();
            this.stopProgressUpdate();
            this.eventBus.dispatchEvent(new CustomEvent('trackPause', { detail: { trackId } }));
        }
    }

    stopTrack(trackId) {
        const audio = this.audioInstances.get(trackId);
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            this.audioInstances.delete(trackId);
            
            if (this.currentTrack?.trackId === trackId) {
                this.currentTrack = null;
                this.currentAudio = null;
                this.stopProgressUpdate();
            }
            
            this.eventBus.dispatchEvent(new CustomEvent('trackStop', { detail: { trackId } }));
        }
    }

    pauseAll() {
        this.audioInstances.forEach((audio, trackId) => {
            audio.pause();
        });
        this.stopProgressUpdate();
        this.eventBus.dispatchEvent(new CustomEvent('allPaused'));
    }

    setGlobalVolume(volume) {
        this.globalVolume = Math.max(0, Math.min(1, volume));
        
        // 更新所有音频实例的音量
        this.audioInstances.forEach(audio => {
            audio.volume = this.globalVolume;
        });
        
        this.eventBus.dispatchEvent(new CustomEvent('volumeChange', { detail: { volume: this.globalVolume } }));
    }

    setLoadingState(trackId, isLoading) {
        this.loadingStates.set(trackId, isLoading);
    }

    isTrackLoading(trackId) {
        return this.loadingStates.get(trackId) || false;
    }

    handleTrackEnded(trackId) {
        console.log(`Track ended: ${trackId}`);
        this.eventBus.dispatchEvent(new CustomEvent('trackEnded', { detail: { trackId } }));
        
        // 如果是播放列表模式，自动播放下一首
        if (this.isPlaylistMode && this.currentPlaylist) {
            this.playNext();
        }
    }

    handleProgressUpdate(trackId, audio) {
        const progress = {
            currentTime: audio.currentTime,
            duration: audio.duration,
            percentage: audio.duration ? (audio.currentTime / audio.duration) * 100 : 0
        };
        
        this.eventBus.dispatchEvent(new CustomEvent('progressUpdate', { 
            detail: { trackId, progress } 
        }));
    }

    startProgressUpdate() {
        this.stopProgressUpdate(); // 清除现有的定时器
        
        this.progressUpdateInterval = setInterval(() => {
            if (this.currentAudio && this.currentTrack) {
                this.handleProgressUpdate(this.currentTrack.trackId, this.currentAudio);
            }
        }, 1000);
    }

    stopProgressUpdate() {
        if (this.progressUpdateInterval) {
            clearInterval(this.progressUpdateInterval);
            this.progressUpdateInterval = null;
        }
    }

    // 播放列表控制
    playPlaylist(categoryKey, startIndex = 0) {
        const category = this.categories[categoryKey];
        if (!category || !category.files.length) return;
        
        this.currentPlaylist = {
            categoryKey,
            files: [...category.files]
        };
        
        if (this.shuffleMode) {
            this.shufflePlaylist();
        }
        
        this.currentTrackIndex = startIndex;
        this.isPlaylistMode = true;
        
        const fileName = this.currentPlaylist.files[this.currentTrackIndex];
        const trackId = this.generateTrackId(categoryKey, fileName);
        
        this.playTrack(trackId, categoryKey, fileName);
    }

    playNext() {
        if (!this.currentPlaylist) return;
        
        this.currentTrackIndex++;
        
        if (this.currentTrackIndex >= this.currentPlaylist.files.length) {
            if (this.repeatMode === 'all') {
                this.currentTrackIndex = 0;
            } else {
                this.isPlaylistMode = false;
                return;
            }
        }
        
        const fileName = this.currentPlaylist.files[this.currentTrackIndex];
        const trackId = this.generateTrackId(this.currentPlaylist.categoryKey, fileName);
        
        this.playTrack(trackId, this.currentPlaylist.categoryKey, fileName);
    }

    playPrevious() {
        if (!this.currentPlaylist) return;
        
        this.currentTrackIndex--;
        
        if (this.currentTrackIndex < 0) {
            if (this.repeatMode === 'all') {
                this.currentTrackIndex = this.currentPlaylist.files.length - 1;
            } else {
                this.currentTrackIndex = 0;
                return;
            }
        }
        
        const fileName = this.currentPlaylist.files[this.currentTrackIndex];
        const trackId = this.generateTrackId(this.currentPlaylist.categoryKey, fileName);
        
        this.playTrack(trackId, this.currentPlaylist.categoryKey, fileName);
    }

    generateTrackId(categoryKey, fileName) {
        return `${categoryKey}_${fileName}`.replace(/[^a-zA-Z0-9_-]/g, '_');
    }

    // 清理缓存
    clearCache() {
        this.downloadCache.clear();
        console.log('Audio cache cleared');
    }

    // 获取缓存统计
    getCacheStats() {
        return {
            size: this.downloadCache.size,
            items: Array.from(this.downloadCache.keys())
        };
    }

    // Archive.org连接性检查
    async checkArchiveAvailability() {
        try {
            const response = await fetch('https://archive.org/ping', { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            console.warn('Archive.org connectivity check failed:', error);
            return false;
        }
    }

    // 获取当前播放信息
    getCurrentPlayingInfo() {
        if (!this.currentTrack || !this.currentAudio) return null;
        
        return {
            trackId: this.currentTrack.trackId,
            categoryKey: this.currentTrack.categoryKey,
            fileName: this.currentTrack.fileName,
            isPlaying: !this.currentAudio.paused,
            currentTime: this.currentAudio.currentTime,
            duration: this.currentAudio.duration,
            volume: this.currentAudio.volume
        };
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
} else if (typeof window !== 'undefined') {
    window.AudioManager = AudioManager;
}