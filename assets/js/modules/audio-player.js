/**
 * AudioPlayer Module
 * Manages audio playback, volume, and sleep timer.
 */

export class AudioPlayer extends EventTarget {
    constructor() {
        super();
        this.audio = new Audio();
        this.isPlaying = false;
        this.currentTrackIndex = -1;
        this.tracks = [];
        this.currentCategory = null;

        this.isShuffleMode = false;
        this.isRepeatMode = false;
        this.sleepTimer = null;

        // Default settings
        this.audio.volume = 0.7;
        this.audio.preload = 'auto';

        this._initListeners();
    }

    _initListeners() {
        this.audio.addEventListener('timeupdate', () => {
            this.dispatchEvent(new CustomEvent('timeupdate', {
                detail: {
                    currentTime: this.audio.currentTime,
                    duration: this.audio.duration
                }
            }));
        });

        this.audio.addEventListener('ended', () => this._handleTrackEnd());

        this.audio.addEventListener('loadedmetadata', () => {
            this.dispatchEvent(new CustomEvent('loadedmetadata', {
                detail: { duration: this.audio.duration }
            }));
        });

        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.dispatchEvent(new CustomEvent('statechange', { detail: { isPlaying: true } }));
        });

        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.dispatchEvent(new CustomEvent('statechange', { detail: { isPlaying: false } }));
        });

        this.audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            this.dispatchEvent(new CustomEvent('error', { detail: e }));
        });
    }

    async loadAndPlay(tracks, index = 0, category = null) {
        this.tracks = tracks;
        this.currentTrackIndex = index;
        if (category) this.currentCategory = category;

        const track = this.tracks[index];
        if (!track) return;

        // Autoplay check (simplified, assumes external handling or user interaction)

        const sourceChanged = this.audio.src !== track.url;
        if (sourceChanged) {
            this.audio.src = track.url;
            this.audio.currentTime = 0;
        }

        try {
            await this.audio.play();

            this.dispatchEvent(new CustomEvent('trackchange', {
                detail: {
                    track,
                    category: this.currentCategory,
                    index
                }
            }));

            // Notify external systems
            if (window.audioPreloader && this.tracks.length > 1) {
                window.audioPreloader.preloadNext(this.tracks, this.currentTrackIndex, this.isShuffleMode);
            }

        } catch (error) {
            this.dispatchEvent(new CustomEvent('playerror', { detail: error }));
            throw error;
        }
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play().catch(e => {
                this.dispatchEvent(new CustomEvent('playerror', { detail: e }));
            });
        }
    }

    // Alias for legacy compatibility
    togglePlay() {
        this.togglePlayPause();
    }

    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlaying = false;
    }

    previous() {
        if (this.currentTrackIndex > 0) {
            this.loadAndPlay(this.tracks, this.currentTrackIndex - 1, this.currentCategory);
        }
    }

    next() {
        if (this.tracks.length === 0) return;

        let nextIndex;
        if (this.isShuffleMode) {
            do {
                nextIndex = Math.floor(Math.random() * this.tracks.length);
            } while (nextIndex === this.currentTrackIndex && this.tracks.length > 1);
        } else if (this.currentTrackIndex < this.tracks.length - 1) {
            nextIndex = this.currentTrackIndex + 1;
        } else if (this.isRepeatMode) {
            nextIndex = 0;
        } else {
            return; // End of playlist
        }

        this.loadAndPlay(this.tracks, nextIndex, this.currentCategory);
    }

    _handleTrackEnd() {
        if (this.isRepeatMode) {
            this.audio.currentTime = 0;
            this.audio.play();
        } else if (this.currentTrackIndex < this.tracks.length - 1 || this.isShuffleMode) {
            this.next();
        } else {
            this.stop();
        }
    }

    seek(percentage) {
        if (this.audio.duration) {
            this.audio.currentTime = this.audio.duration * percentage;
        }
    }

    // Alias for legacy compatibility
    seekTo(percentage) {
        this.seek(percentage);
    }

    setVolume(value) {
        this.audio.volume = Math.max(0, Math.min(1, value)); // 0.0 to 1.0
    }

    setPlaybackRate(rate) {
        this.audio.playbackRate = rate;
    }

    toggleShuffle() {
        this.isShuffleMode = !this.isShuffleMode;
        return this.isShuffleMode;
    }

    toggleRepeat() {
        this.isRepeatMode = !this.isRepeatMode;
        return this.isRepeatMode;
    }

    setSleepTimer(minutes, callback) {
        if (this.sleepTimer) {
            clearTimeout(this.sleepTimer);
            this.sleepTimer = null;
        }

        if (minutes > 0) {
            this.sleepTimer = setTimeout(() => {
                this.stop();
                if (callback) callback();
            }, minutes * 60 * 1000);
            return true;
        }
        return false;
    }
}
