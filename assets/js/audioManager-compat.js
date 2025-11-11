/**
 * AudioManager Compatibility Layer
 * Provides a lightweight facade so legacy UI modules (history, favorites,
 * focus mode, etc.) can operate with the simplified index-app audio stack.
 *
 * @version 1.1.0
 * @date 2025-10-13
 */

(function createAudioManagerCompat() {
    if (window.audioManager && window.audioManager.__compat) {
        return;
    }

    class CompatAudioManager {
        constructor() {
            this.__compat = true;
            this.eventBus = new EventTarget();
            this.globalVolume = (window.audio && typeof window.audio.volume === 'number')
                ? window.audio.volume
                : 0.7;
            this.categories = (typeof window.AUDIO_CONFIG !== 'undefined' && window.AUDIO_CONFIG.categories)
                ? window.AUDIO_CONFIG.categories
                : {};

            this.isPlayingState = window.isPlaying || false;
            this.currentTrackInfo = null;
            this.soundStates = new Map();

            this._bindCoreEvents();
        }

        _bindCoreEvents() {
            window.addEventListener('audioStateChange', (event) => {
                const detail = event.detail || {};
                this.isPlayingState = !!detail.isPlaying;

                if (detail.track) {
                    this.currentTrackInfo = this._buildTrackDetail(detail.track);
                    this.eventBus.dispatchEvent(new CustomEvent('trackPlay', {
                        detail: this.currentTrackInfo
                    }));
                    this.eventBus.dispatchEvent(new CustomEvent('trackStarted', {
                        detail: this.currentTrackInfo
                    }));
                } else if (!this.isPlayingState) {
                    this.eventBus.dispatchEvent(new CustomEvent('trackPause', {
                        detail: this.currentTrackInfo
                    }));
                }
            });

            if (window.audio && typeof window.audio.addEventListener === 'function') {
                window.audio.addEventListener('ended', () => {
                    this.isPlayingState = false;
                    this.eventBus.dispatchEvent(new CustomEvent('trackEnded', {
                        detail: this.currentTrackInfo
                    }));
                });
            }
        }

        _ensureSoundState(soundId) {
            if (!this.soundStates.has(soundId)) {
                this.soundStates.set(soundId, {
                    id: soundId,
                    volume: 1,
                    isPlaying: false
                });
            }
            return this.soundStates.get(soundId);
        }

        _extractArgs(args) {
            const flat = Array.from(args).filter(arg => arg !== undefined && arg !== null);
            let fileName = flat.find(arg => typeof arg === 'string' && /\.[a-z0-9]+$/i.test(arg)) || null;
            let categoryKey = flat.find(arg => typeof arg === 'string' && arg !== fileName) || null;

            if (!categoryKey && window.currentCategory && window.currentCategory.key) {
                categoryKey = window.currentCategory.key;
            }

            return { categoryKey, fileName };
        }

        async _ensureCategory(categoryKey) {
            if (!categoryKey) {
                return;
            }

            if (window.currentCategory && window.currentCategory.key === categoryKey && Array.isArray(window.tracks) && window.tracks.length > 0) {
                return;
            }

            if (typeof window.AUDIO_CONFIG !== 'undefined' && window.AUDIO_CONFIG.categories && window.AUDIO_CONFIG.categories[categoryKey]) {
                const categoryData = window.AUDIO_CONFIG.categories[categoryKey];
                const baseUrl = window.AUDIO_CONFIG.baseUrl || '';

                window.tracks = (categoryData.files || []).map(fileName => {
                    // 使用全局 getAudioUrl 函数（如果可用），否则手动构建并编码URL
                    let url;
                    if (typeof window.getAudioUrl === 'function') {
                        url = window.getAudioUrl(categoryKey, fileName);
                    } else {
                        // 降级处理：手动构建URL并编码文件名
                        url = `${baseUrl}${categoryData.folder}/${encodeURIComponent(fileName)}`;
                    }

                    return {
                        name: fileName.replace(/\.[^/.]+$/, ''),
                        fileName,
                        url
                    };
                });

                window.currentCategory = { key: categoryKey, ...categoryData };
                return;
            }

            if (typeof window.audioData !== 'undefined' && window.audioData[categoryKey]) {
                window.tracks = window.audioData[categoryKey].map(item => ({
                    name: item.name || item.title || item.fileName || item.url,
                    fileName: item.fileName || (item.url ? item.url.split('/').pop() : ''),
                    url: item.url
                }));

                window.currentCategory = {
                    key: categoryKey,
                    name: window.categoryInfo?.[categoryKey]?.name || categoryKey
                };
            }
        }

        _buildTrackDetail(track) {
            const activeTrack = (Array.isArray(window.tracks) && window.tracks[window.currentTrackIndex])
                ? window.tracks[window.currentTrackIndex]
                : null;

            return {
                index: window.currentTrackIndex,
                category: window.currentCategory?.key || track.category || null,
                displayName: activeTrack?.name || track.name || track.displayName || '',
                fileName: activeTrack?.fileName || track.fileName || (track.url ? track.url.split('/').pop() : null),
                url: activeTrack?.url || track.url || null
            };
        }

        get isPlaying() {
            return this.isPlayingState;
        }

        get currentCategory() {
            return window.currentCategory || null;
        }

        get currentTrack() {
            return this.currentTrackInfo;
        }

        get currentAudio() {
            return window.audio || null;
        }

        async playTrack(...args) {
            const { categoryKey, fileName } = this._extractArgs(args);

            if (categoryKey) {
                await this._ensureCategory(categoryKey);
            }

            let index = (typeof args[0] === 'number') ? args[0] : -1;

            if (fileName && Array.isArray(window.tracks)) {
                index = window.tracks.findIndex(item => {
                    if (!item) return false;
                    if (item.fileName === fileName) return true;
                    if (item.url && item.url.endsWith(fileName)) return true;
                    return false;
                });
            }

            if (index < 0 && Array.isArray(window.tracks)) {
                index = 0;
            }

            if (!Array.isArray(window.tracks) || index < 0 || index >= window.tracks.length) {
                console.warn('audioManagerCompat: 无法根据提供的参数定位音轨', args);
                return false;
            }

            if (typeof window.playTrack === 'function') {
                await window.playTrack(index);
                return true;
            }

            return false;
        }

        pause() {
            if (window.audio && typeof window.audio.pause === 'function') {
                window.audio.pause();
                this.isPlayingState = false;
                if (typeof window.updatePlayPauseButton === 'function') {
                    window.updatePlayPauseButton();
                }
                this.eventBus.dispatchEvent(new CustomEvent('trackPause', {
                    detail: this.currentTrackInfo
                }));
            }
        }

        play() {
            if (window.audio && typeof window.audio.play === 'function') {
                window.audio.play().catch(err => console.warn('audioManagerCompat: play failed', err));
            }
        }

        stop() {
            if (typeof window.stopAudio === 'function') {
                window.stopAudio();
            } else {
                this.pause();
                if (window.audio) {
                    window.audio.currentTime = 0;
                }
            }
        }

        next() {
            if (typeof window.nextTrack === 'function') {
                window.nextTrack();
            }
        }

        previous() {
            if (typeof window.previousTrack === 'function') {
                window.previousTrack();
            }
        }

        setVolume(value) {
            if (!window.audio) return;
            const normalized = Math.max(0, Math.min(1, typeof value === 'number' ? value / 100 : parseFloat(value) / 100));
            window.audio.volume = normalized;
            this.globalVolume = normalized;
            if (typeof window.changeVolume === 'function') {
                window.changeVolume(Math.round(normalized * 100));
            }
        }

        setGlobalVolume(value) {
            this.setVolume(typeof value === 'number' ? value * 100 : value);
        }

        getGlobalVolume() {
            return this.globalVolume;
        }

        setTrackVolume(_trackId, volume) {
            this.setVolume(volume * 100);
        }

        seekTo(position) {
            if (!window.audio || !window.audio.duration) return;
            const percent = Math.max(0, Math.min(100, position));
            window.audio.currentTime = (percent / 100) * window.audio.duration;
        }

        pauseAll() {
            this.pause();
        }

        resumeCurrentTrack() {
            this.play();
        }

        async toggleTrack(...args) {
            if (this.isPlayingState && typeof args[0] === 'number' && args[0] === window.currentTrackIndex) {
                this.pause();
                return false;
            }
            return this.playTrack(...args);
        }

        setSoundVolume(soundId, volume) {
            const state = this._ensureSoundState(soundId);
            state.volume = Math.max(0, Math.min(1, volume));
            return Promise.resolve();
        }

        async toggleSound(soundId) {
            const state = this._ensureSoundState(soundId);
            state.isPlaying = !state.isPlaying;
            return state.isPlaying;
        }

        async applyPreset(_presetId) {
            console.warn('audioManagerCompat: applyPreset is not supported in simplified mode.');
            return false;
        }

        isAnyPlaying() {
            return this.isPlayingState;
        }

        getCurrentTrack() {
            return this.currentTrackInfo;
        }

        getPlayingTracks() {
            return this.isPlayingState && this.currentTrackInfo ? [this.currentTrackInfo] : [];
        }

        getPlayingSounds() {
            return Array.from(this.soundStates.values()).filter(state => state.isPlaying);
        }

        getTrackInstance() {
            return {
                audio: window.audio,
                isPlaying: this.isPlayingState
            };
        }

        initialize() {
            this.eventBus.dispatchEvent(new CustomEvent('initialized'));
            return Promise.resolve(true);
        }

        saveUserSettings() {
            return Promise.resolve();
        }

        cleanup() {
            return Promise.resolve();
        }
    }

    const compatManager = new CompatAudioManager();
    window.audioManager = compatManager;
    console.log('🎧 AudioManager compatibility layer enabled');
})();
