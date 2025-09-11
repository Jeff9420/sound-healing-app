class ArchiveAudioManager {
    constructor() {
        this.audioInstances = new Map();
        this.isInitialized = false;
        this.globalVolume = 0.5;
        this.categories = {};
        this.currentPlaylist = null;
        this.currentTrackIndex = 0;
        this.isPlaylistMode = false;
        this.shuffleMode = false;
        this.repeatMode = 'all';
        this.loadingStates = new Map();
        this.eventBus = new EventTarget();
        this.supportedFormats = {};
        this.currentAudio = null;
        this.currentTrack = null;
        this.progressUpdateInterval = null;
        
        // Archive.org 特定设置
        this.maxRetries = 3; // 最大重试次数
        this.retryDelay = 1000; // 重试延迟（毫秒）
        this.loadTimeout = 30000; // 加载超时（30秒）
        this.fallbackEnabled = true; // 是否启用本地fallback
        
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
            ogg: audio.canPlayType('audio/ogg') !== '',
            flac: audio.canPlayType('audio/flac') !== '',
            m4a: audio.canPlayType('audio/mp4') !== '',
            aac: audio.canPlayType('audio/aac') !== ''
        };
        
        console.log('浏览器支持的音频格式:', this.supportedFormats);
        return this.supportedFormats;
    }

    initializeCategories() {
        // 从Archive.org配置文件加载音频分类
        if (typeof AUDIO_CONFIG_ARCHIVE !== 'undefined' && AUDIO_CONFIG_ARCHIVE.categories) {
            this.categories = AUDIO_CONFIG_ARCHIVE.categories;
            console.log('ArchiveAudioManager: 成功从AUDIO_CONFIG_ARCHIVE加载分类', Object.keys(this.categories).length);
        } else {
            console.warn('ArchiveAudioManager: AUDIO_CONFIG_ARCHIVE未就绪，稍后重试...');
        }
    }

    async initialize() {
        try {
            // 确保音频配置已加载
            let retryCount = 0;
            const maxRetries = 50;
            
            while ((!this.categories || Object.keys(this.categories).length === 0) && retryCount < maxRetries) {
                console.log(`ArchiveAudioManager初始化重试 ${retryCount + 1}/${maxRetries}`);
                this.initializeCategories();
                
                if (!this.categories || Object.keys(this.categories).length === 0) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    retryCount++;
                } else {
                    break;
                }
            }
            
            if (!this.categories || Object.keys(this.categories).length === 0) {
                throw new Error('Archive音频配置加载超时，无法获取分类数据');
            }
            
            console.log('ArchiveAudioManager: 初始化完成，分类数量:', Object.keys(this.categories).length);
            
            this.isInitialized = true;
            this.loadUserSettings();
            this.eventBus.dispatchEvent(new CustomEvent('initialized'));
        } catch (error) {
            console.error('Archive音频管理器初始化失败:', error);
            this.eventBus.dispatchEvent(new CustomEvent('error', { detail: error }));
            throw error;
        }
    }

    generateTrackId(categoryName, file) {
        const safeFilename = typeof file === 'object' ? file.filename : file;
        return `${categoryName}__${safeFilename}`.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '_');
    }

    // 生成音频URL（带重试逻辑）
    generateAudioUrl(categoryName, file, retryIndex = 0) {
        if (retryIndex === 0) {
            // 主URL
            return generateArchiveUrl(categoryName, file);
        } else if (retryIndex <= AUDIO_CONFIG_ARCHIVE.mirrorUrls.length) {
            // 镜像URL
            return getMirrorUrl(categoryName, file, retryIndex - 1);
        } else if (this.fallbackEnabled) {
            // Fallback到本地文件
            return getFallbackUrl(categoryName, file);
        }
        return null;
    }

    async createAudioInstance(trackId, categoryName, file) {
        // 检查文件格式是否受支持
        const filename = typeof file === 'object' ? file.filename : file;
        const fileExtension = filename.split('.').pop().toLowerCase();
        const isSupported = this.supportedFormats[fileExtension];
        
        if (!isSupported) {
            console.warn(`格式 ${fileExtension} 不受支持，为文件 ${filename} 创建静默实例`);
            this.createSilentAudioInstance(trackId, categoryName, file);
            return Promise.resolve();
        }
        
        const audio = new Audio();
        audio.preload = 'metadata';
        audio.crossOrigin = 'anonymous'; // Archive.org 需要CORS设置
        
        this.loadingStates.set(trackId, true);
        this.eventBus.dispatchEvent(new CustomEvent('loadingStart', { detail: trackId }));

        return this.tryLoadAudio(audio, trackId, categoryName, file, 0);
    }

    async tryLoadAudio(audio, trackId, categoryName, file, retryIndex) {
        const audioUrl = this.generateAudioUrl(categoryName, file, retryIndex);
        
        if (!audioUrl) {
            console.error(`所有URL都失败，无法加载音频: ${file.filename || file}`);
            this.createSilentAudioInstance(trackId, categoryName, file);
            return Promise.resolve();
        }

        console.log(`尝试加载音频 (重试 ${retryIndex}): ${audioUrl}`);

        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                console.warn(`音频加载超时 (重试 ${retryIndex}): ${audioUrl}`);
                this.handleLoadFailure(audio, trackId, categoryName, file, retryIndex, resolve);
            }, this.loadTimeout);

            const onCanPlay = () => {
                clearTimeout(timeout);
                this.loadingStates.set(trackId, false);
                this.eventBus.dispatchEvent(new CustomEvent('loadingEnd', { detail: trackId }));
                
                audio.volume = this.globalVolume * 0.5;
                this.audioInstances.set(trackId, {
                    audio: audio,
                    volume: 0.5,
                    isPlaying: false,
                    categoryName: categoryName,
                    file: file,
                    isReady: true,
                    sourceUrl: audioUrl,
                    retryIndex: retryIndex
                });
                
                console.log(`音频加载成功 (重试 ${retryIndex}): ${audioUrl}`);
                resolve();
            };

            const onError = (error) => {
                clearTimeout(timeout);
                console.warn(`音频加载失败 (重试 ${retryIndex}): ${audioUrl}`, error);
                this.handleLoadFailure(audio, trackId, categoryName, file, retryIndex, resolve);
            };

            audio.addEventListener('canplaythrough', onCanPlay, { once: true });
            audio.addEventListener('error', onError, { once: true });
            
            // 添加结束事件监听
            audio.addEventListener('ended', () => {
                this.onTrackEnded(trackId);
            });

            audio.src = audioUrl;
        });
    }

    async handleLoadFailure(audio, trackId, categoryName, file, retryIndex, resolve) {
        if (retryIndex < this.maxRetries) {
            // 等待一段时间后重试
            await new Promise(r => setTimeout(r, this.retryDelay));
            try {
                await this.tryLoadAudio(audio, trackId, categoryName, file, retryIndex + 1);
                resolve();
            } catch (error) {
                console.error('重试也失败了:', error);
                this.createSilentAudioInstanceAndResolve(trackId, categoryName, file, resolve);
            }
        } else {
            console.error(`所有重试都失败，创建静默实例: ${file.filename || file}`);
            this.createSilentAudioInstanceAndResolve(trackId, categoryName, file, resolve);
        }
    }

    createSilentAudioInstanceAndResolve(trackId, categoryName, file, resolve) {
        this.loadingStates.set(trackId, false);
        this.eventBus.dispatchEvent(new CustomEvent('loadingEnd', { detail: trackId }));
        this.createSilentAudioInstance(trackId, categoryName, file);
        resolve();
    }

    createSilentAudioInstance(trackId, categoryName, file) {
        const silentAudio = new Audio();
        const filename = typeof file === 'object' ? file.filename : file;
        
        this.audioInstances.set(trackId, {
            audio: silentAudio,
            volume: 0,
            isPlaying: false,
            categoryName: categoryName,
            file: file,
            isReady: false,
            isSilent: true
        });
        
        console.info(`为 ${filename} 创建了静默音频实例`);
    }

    async playTrack(trackId, categoryName, file, resetTime = false) {
        // 如果音频实例不存在，先创建
        if (!this.audioInstances.has(trackId)) {
            await this.createAudioInstance(trackId, categoryName, file);
        }
        
        const instance = this.audioInstances.get(trackId);
        if (!instance || this.loadingStates.get(trackId)) {
            const filename = typeof file === 'object' ? file.filename : file;
            throw new Error(`音频未准备就绪: ${filename}`);
        }

        // 如果是静默实例，直接模拟播放
        if (instance.isSilent) {
            instance.isPlaying = true;
            this.eventBus.dispatchEvent(new CustomEvent('trackPlay', { detail: trackId }));
            const filename = typeof file === 'object' ? file.filename : file;
            console.info(`静默模式播放: ${filename}`);
            return;
        }

        try {
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
            this.currentTrack = { trackId, categoryName, file };
            this.startProgressUpdate();
            
            this.eventBus.dispatchEvent(new CustomEvent('trackPlay', { 
                detail: { trackId, categoryName, file } 
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
        if (!instance) return;

        // 如果是静默实例，直接模拟暂停
        if (instance.isSilent) {
            instance.isPlaying = false;
            this.eventBus.dispatchEvent(new CustomEvent('trackPause', { detail: trackId }));
            const filename = typeof instance.file === 'object' ? instance.file.filename : instance.file;
            console.info(`静默模式暂停: ${filename}`);
            return;
        }

        instance.audio.pause();
        instance.isPlaying = false;
        
        // 停止进度更新
        if (this.currentAudio === instance.audio) {
            this.stopProgressUpdate();
            this.currentAudio = null;
        }
        
        this.eventBus.dispatchEvent(new CustomEvent('trackPause', { detail: trackId }));
        
        // 检查是否所有音频都已停止
        this.checkAllTracksStopped();
    }

    setTrackVolume(trackId, volume) {
        const instance = this.audioInstances.get(trackId);
        if (!instance) return;

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

    async toggleTrack(trackId, categoryName, file) {
        const instance = this.audioInstances.get(trackId);
        
        if (instance && instance.isPlaying) {
            this.pauseTrack(trackId);
        } else {
            // 如果是当前暂停的音轨，继续播放；否则重新开始
            const resetTime = !this.currentTrack || this.currentTrack.trackId !== trackId;
            await this.playTrack(trackId, categoryName, file, resetTime);
        }
    }

    // 继续播放当前暂停的音轨
    async resumeCurrentTrack() {
        if (this.currentTrack && this.currentAudio) {
            const { trackId, categoryName, file } = this.currentTrack;
            await this.playTrack(trackId, categoryName, file, false); // 不重置时间
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
                file: instance.file
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

        this.currentPlaylist = {
            categoryName: categoryName,
            tracks: category.files,
            currentIndex: startIndex
        };
        this.isPlaylistMode = true;

        await this.playCurrentTrack();
    }

    async playCurrentTrack() {
        if (!this.currentPlaylist) return;

        const { categoryName, tracks, currentIndex } = this.currentPlaylist;
        const file = tracks[currentIndex];
        const trackId = this.generateTrackId(categoryName, file);

        await this.playTrack(trackId, categoryName, file);
        this.currentPlaylist.currentIndex = currentIndex;
    }

    async nextTrack() {
        if (!this.currentPlaylist || !this.isPlaylistMode) return;

        const { tracks } = this.currentPlaylist;
        let nextIndex = this.currentPlaylist.currentIndex + 1;

        if (nextIndex >= tracks.length) {
            if (this.repeatMode === 'all') {
                nextIndex = 0;
            } else {
                this.isPlaylistMode = false;
                return;
            }
        }

        this.currentPlaylist.currentIndex = nextIndex;
        await this.playCurrentTrack();
    }

    async previousTrack() {
        if (!this.currentPlaylist || !this.isPlaylistMode) return;

        let prevIndex = this.currentPlaylist.currentIndex - 1;
        if (prevIndex < 0) {
            prevIndex = this.currentPlaylist.tracks.length - 1;
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
        // TODO: 实现随机播放逻辑
    }

    setRepeatMode(mode) {
        this.repeatMode = mode; // 'none', 'one', 'all'
    }

    fadeIn(trackId, duration = 1000) {
        const instance = this.audioInstances.get(trackId);
        if (!instance) return;

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
        if (!instance) return;

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
            localStorage.setItem('soundHealingArchiveSettings', JSON.stringify(settings));
        } catch (error) {
            console.warn('Archive设置保存失败:', error);
        }
    }

    loadUserSettings() {
        try {
            const savedSettings = localStorage.getItem('soundHealingArchiveSettings');
            if (!savedSettings) return;

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

            this.eventBus.dispatchEvent(new CustomEvent('settingsLoaded', { detail: settings }));
        } catch (error) {
            console.warn('Archive设置加载失败:', error);
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

    // 获取音频文件信息（Archive.org特有功能）
    getTrackInfo(trackId) {
        const instance = this.audioInstances.get(trackId);
        if (!instance || !instance.file || typeof instance.file !== 'object') {
            return null;
        }

        return {
            filename: instance.file.filename,
            originalName: instance.file.originalName,
            duration: instance.file.duration,
            size: instance.file.size,
            sourceUrl: instance.sourceUrl,
            retryIndex: instance.retryIndex,
            metadata: instance.file
        };
    }

    // 网络状态检查
    async checkArchiveAvailability() {
        try {
            const response = await fetch(AUDIO_CONFIG_ARCHIVE.baseUrl, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            console.warn('Archive.org 连接检查失败:', error);
            return false;
        }
    }

    cleanup() {
        this.stopProgressUpdate();
        for (const [trackId, instance] of this.audioInstances) {
            instance.audio.pause();
            instance.audio.src = '';
            instance.audio.remove();
        }
        this.audioInstances.clear();
        this.isInitialized = false;
    }
}