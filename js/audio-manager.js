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
        
        // 如果WMA不被支持，发出警告
        if (!this.supportedFormats.wma) {
            console.warn('此浏览器不支持WMA格式，WMA文件将创建为静默实例');
        }
        
        return this.supportedFormats;
    }

    initializeCategories() {
        // 从配置文件加载音频分类 - 添加重试逻辑
        if (typeof AUDIO_CONFIG !== 'undefined' && AUDIO_CONFIG.categories) {
            this.categories = AUDIO_CONFIG.categories;
            console.log('AudioManager: 成功从AUDIO_CONFIG加载分类', Object.keys(this.categories).length);
        } else {
            console.warn('AudioManager: AUDIO_CONFIG未就绪，稍后重试...');
        }
    }

    async initialize() {
        try {
            // 确保音频配置已加载
            let retryCount = 0;
            const maxRetries = 50; // 最多等待5秒
            
            while ((!this.categories || Object.keys(this.categories).length === 0) && retryCount < maxRetries) {
                console.log(`AudioManager初始化重试 ${retryCount + 1}/${maxRetries}`);
                this.initializeCategories();
                
                if (!this.categories || Object.keys(this.categories).length === 0) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    retryCount++;
                } else {
                    break;
                }
            }
            
            if (!this.categories || Object.keys(this.categories).length === 0) {
                throw new Error('音频配置加载超时，无法获取分类数据');
            }
            
            console.log('AudioManager: 初始化完成，分类数量:', Object.keys(this.categories).length);
            
            this.isInitialized = true;
            this.loadUserSettings();
            this.eventBus.dispatchEvent(new CustomEvent('initialized'));
        } catch (error) {
            console.error('音频管理器初始化失败:', error);
            this.eventBus.dispatchEvent(new CustomEvent('error', { detail: error }));
            throw error;
        }
    }

    generateTrackId(categoryName, fileName) {
        return `${categoryName}__${fileName}`.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '_');
    }

    async createAudioInstance(trackId, categoryName, fileName) {
        // 检查文件格式是否受支持
        const fileExtension = fileName.split('.').pop().toLowerCase();
        const isSupported = this.supportedFormats[fileExtension];
        
        if (!isSupported) {
            console.warn(`格式 ${fileExtension} 不受支持，为文件 ${fileName} 创建静默实例`);
            this.createSilentAudioInstance(trackId, categoryName, fileName);
            return Promise.resolve();
        }
        
        const audio = new Audio();
        audio.preload = 'metadata';
        
        // 设置音频路径
        const fullPath = `assets/audio/${categoryName}/${fileName}`;
        
        this.loadingStates.set(trackId, true);
        this.eventBus.dispatchEvent(new CustomEvent('loadingStart', { detail: trackId }));

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.loadingStates.set(trackId, false);
                this.eventBus.dispatchEvent(new CustomEvent('loadingEnd', { detail: trackId }));
                reject(new Error(`音频加载超时: ${fileName}`));
            }, 15000);

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
                    fileName: fileName,
                    isReady: true
                });
                resolve();
            };

            const onError = (error) => {
                clearTimeout(timeout);
                console.error(`音频文件加载失败: ${fileName}`, error);
                this.loadingStates.set(trackId, false);
                this.eventBus.dispatchEvent(new CustomEvent('loadingEnd', { detail: trackId }));
                this.createSilentAudioInstance(trackId, categoryName, fileName);
                resolve();
            };

            audio.addEventListener('canplaythrough', onCanPlay, { once: true });
            audio.addEventListener('error', onError, { once: true });
            
            // 添加结束事件监听
            audio.addEventListener('ended', () => {
                this.onTrackEnded(trackId);
            });

            audio.src = fullPath;
        });
    }

    createSilentAudioInstance(trackId, categoryName, fileName) {
        // 创建一个静默的音频实例，避免应用崩溃
        const silentAudio = new Audio();
        
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
            await this.createAudioInstance(trackId, categoryName, fileName);
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
            
            this.eventBus.dispatchEvent(new CustomEvent('trackPlay', { 
                detail: { trackId, categoryName, fileName } 
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
            console.info(`静默模式暂停: ${instance.fileName}`);
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
        const fileName = tracks[currentIndex];
        const trackId = this.generateTrackId(categoryName, fileName);

        await this.playTrack(trackId, categoryName, fileName);
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
            localStorage.setItem('soundHealingSettings', JSON.stringify(settings));
        } catch (error) {
            console.warn('设置保存失败:', error);
        }
    }

    loadUserSettings() {
        try {
            const savedSettings = localStorage.getItem('soundHealingSettings');
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