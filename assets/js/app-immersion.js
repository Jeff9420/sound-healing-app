/**
 * Deep Immersion Theme Application Script
 * Handles UI interactions, audio playback via AudioManager, and integration with UserDataManager.
 */

class TimerManager {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.timerInterval = null;
        this.endTime = null;
        this.duration = 0;
        this.modal = document.getElementById('timerModal');
        this.timerBtn = document.getElementById('timerBtn');
        this.closeBtn = document.getElementById('closeTimerModal');
        this.optionBtns = document.querySelectorAll('.timer-opt-btn');
    }

    initialize() {
        if (this.timerBtn) {
            this.timerBtn.addEventListener('click', () => this.openModal());
        }
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeModal());
        }
        this.optionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const minutes = parseInt(e.target.dataset.time);
                this.setTimer(minutes);
                this.closeModal();
            });
        });

        // Close modal on outside click
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) this.closeModal();
            });
        }
    }

    openModal() {
        if (this.modal) {
            this.modal.classList.remove('hidden');
            this.modal.style.display = 'flex';
        }
    }

    closeModal() {
        if (this.modal) {
            this.modal.classList.add('hidden');
            this.modal.style.display = 'none';
        }
    }

    setTimer(minutes) {
        this.clearTimer();
        if (minutes > 0) {
            this.duration = minutes;
            this.endTime = Date.now() + minutes * 60000;
            this.startCountdown();
            this.updateButtonState(true);
        } else {
            this.updateButtonState(false);
        }
    }

    clearTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.endTime = null;
        this.duration = 0;
    }

    startCountdown() {
        this.timerInterval = setInterval(() => {
            const remaining = this.endTime - Date.now();
            if (remaining <= 0) {
                this.clearTimer();
                if (this.audioManager && typeof this.audioManager.pauseAll === 'function') {
                    this.audioManager.pauseAll();
                }
                this.updateButtonState(false);
            }
        }, 1000);
    }

    updateButtonState(isActive) {
        if (this.timerBtn) {
            this.timerBtn.style.color = isActive ? 'var(--primary-color)' : 'currentColor';
            if (isActive) {
                this.timerBtn.classList.add('active');
            } else {
                this.timerBtn.classList.remove('active');
            }
        }
    }
}

class DeepImmersionApp {
    constructor() {
        this.audioManager = null;
        this.userDataManager = null;
        this.historyFavoritesUI = null;
        this.currentTrackId = null;
        this.recommendedTrack = {
            trackId: '一声闷雷，大雨倾盆.mp3',
            category: 'Rain',
            name: 'Sleep Rain · 15 min',
            subtitle: 'Press ▶ to start your session'
        };
        this.isPlaying = false;

        // New playback control states
        this.shuffleEnabled = false;
        this.repeatMode = 'off'; // 'off', 'all', 'one'
        this.volume = 80; // 0-100
        this.isMuted = false;
        this.previousVolume = 80;
        this.progressUpdateInterval = null;
    }

    async initialize() {
        console.log('🌊 Initializing Deep Immersion App...');

        // 1. Initialize Managers
        await this.initializeManagers();

        // 2. Setup UI Event Listeners
        this.setupEventListeners();

        // 3. Check for URL parameters (e.g. auto-play)
        this.handleUrlParameters();

        console.log('✅ Deep Immersion App Initialized');

        // Trigger custom event for dictionary system
        window.dispatchEvent(new CustomEvent('appInitialized'));
    }

    async initializeManagers() {
        // Initialize UserDataManager
        if (window.UserDataManager) {
            this.userDataManager = new window.UserDataManager();
            window.userDataManager = this.userDataManager; // Global access for other scripts
        }

        // Initialize AudioManager
        try {
            if (window.audioManager) {
                this.audioManager = window.audioManager;
                if (!this.audioManager.isInitialized) {
                    await this.audioManager.initialize();
                }
            } else if (window.AudioManager) {
                this.audioManager = new window.AudioManager();
                await this.audioManager.initialize();
                window.audioManager = this.audioManager;
            } else {
                console.error('❌ AudioManager class not found!');
            }
        } catch (error) {
            console.error('⚠️ AudioManager initialization failed:', error);
            // Continue anyway to allow UI to function (even if audio is broken)
        }

        // Initialize HistoryFavoritesUI
        if (window.HistoryFavoritesUI && this.userDataManager) {
            this.historyFavoritesUI = new window.HistoryFavoritesUI(this.userDataManager);
            this.historyFavoritesUI.initialize();
            window.historyFavoritesUI = this.historyFavoritesUI;
        }

        // Initialize TimerManager
        this.timerManager = new TimerManager(this.audioManager);
        this.timerManager.initialize();

        // Initialize volume slider and icon
        this.initializeVolumeControls();

        // Prime a recommended track without autoplay
        this.primeRecommendedTrack();
    }

    initializeVolumeControls() {
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            volumeSlider.value = this.volume;
            volumeSlider.style.setProperty('--volume', `${this.volume}%`);
        }
        this.updateVolumeIcon();
    }

    primeRecommendedTrack() {
        const override = (typeof window !== 'undefined' && window.recommendedTrackOverride) ? window.recommendedTrackOverride : null;
        if (override) {
            this.recommendedTrack = { ...this.recommendedTrack, ...override };
        }
        if (!this.recommendedTrack) return;
        this.updatePlayerUI(this.recommendedTrack.name, this.recommendedTrack.subtitle, false);
    }

    startRecommendedSession() {
        if (!this.recommendedTrack) return;
        this.playTrack(this.recommendedTrack.trackId, this.recommendedTrack.name, this.recommendedTrack.category);
    }

    setupEventListeners() {
        // Listen for global audio events from AudioManager
        if (this.audioManager && this.audioManager.eventBus) {
            this.audioManager.eventBus.addEventListener('trackPlay', (e) => this.onTrackPlay(e.detail));
            this.audioManager.eventBus.addEventListener('trackPause', (e) => this.onTrackPause(e.detail));
            this.audioManager.eventBus.addEventListener('loadingStart', (e) => this.onLoadingStart(e.detail));
            this.audioManager.eventBus.addEventListener('loadingEnd', (e) => this.onLoadingEnd(e.detail));
        }

        // Floating Player Controls
        const playPauseBtn = document.getElementById('playPauseBtn');
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        }

        const prevBtn = document.getElementById('prevBtn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.audioManager?.previousTrack) {
                    this.audioManager.previousTrack();
                }
            });
        }

        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.audioManager?.nextTrack) {
                    this.audioManager.nextTrack();
                }
            });
        }

        // Shuffle Button
        const shuffleBtn = document.getElementById('shuffleBtn');
        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        }

        // Repeat Button
        const repeatBtn = document.getElementById('repeatBtn');
        if (repeatBtn) {
            repeatBtn.addEventListener('click', () => this.cycleRepeatMode());
        }

        const closeBtn = document.getElementById('closePlayerBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hidePlayer());
        }

        // Volume Button and Slider
        const volumeBtn = document.getElementById('volumeBtn');
        if (volumeBtn) {
            volumeBtn.addEventListener('click', () => this.toggleMute());
        }

        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
            // Update CSS variable for visual gradient
            volumeSlider.addEventListener('input', (e) => {
                e.target.style.setProperty('--volume', `${e.target.value}%`);
            });
        }

        // Progress Bar
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.addEventListener('input', (e) => this.seekTo(e.target.value));
            progressBar.addEventListener('mousedown', () => this.stopProgressUpdate());
            progressBar.addEventListener('mouseup', () => this.startProgressUpdate());
            progressBar.addEventListener('touchstart', () => this.stopProgressUpdate());
            progressBar.addEventListener('touchend', () => this.startProgressUpdate());
        }

        // Setup Card Click Listeners (delegation)
        const grid = document.getElementById('sound-grid');
        if (grid) {
            grid.addEventListener('click', (e) => {
                const card = e.target.closest('.glass-card');
                if (card) {
                    const trackId = card.dataset.trackId;
                    const name = card.dataset.name;
                    const category = card.dataset.category;
                    if (trackId && name && category) {
                        this.playTrack(trackId, name, category);
                    }
                }
            });
        }
    }

    async playTrack(trackId, name, category) {
        if (!this.audioManager) return;

        try {
            // If clicking the same track that is playing, toggle it
            const uniqueId = this.audioManager.generateTrackId(category, trackId);
            if (this.currentTrackId === uniqueId && this.isPlaying) {
                this.audioManager.pauseTrack(uniqueId);
                return;
            }

            // Update UI immediately
            this.updatePlayerUI(name, category, true);
            this.showPlayer();

            // Prefer playlist playback so next/previous controls work
            const categoryFiles = (window.AUDIO_CONFIG?.categories?.[category]?.files) ||
                (this.audioManager.categories?.[category]?.files) ||
                [];
            const fileIndex = categoryFiles.indexOf(trackId);

            if (fileIndex >= 0 && typeof this.audioManager.playPlaylist === 'function') {
                await this.audioManager.playPlaylist(category, fileIndex);
                const activeFile = categoryFiles[fileIndex] || trackId;
                this.currentTrackId = this.audioManager.generateTrackId(category, activeFile);
            } else {
                await this.audioManager.playTrack(uniqueId, category, trackId);
                this.currentTrackId = uniqueId; // Store the unique ID
            }

            this.isPlaying = true;

        } catch (error) {
            console.error('Error playing track:', error);
            // Show error notification
        }
    }

    async togglePlayPause() {
        if (!this.audioManager) {
            return;
        }

        try {
            // Check if there's a current track
            if (!this.currentTrackId) {
                if (this.recommendedTrack) {
                    await this.playTrack(
                        this.recommendedTrack.trackId,
                        this.recommendedTrack.name,
                        this.recommendedTrack.category
                    );
                }
                return;
            }

            // Get current track info
            const currentTrack = this.audioManager.getCurrentTrack();

            if (this.isPlaying && currentTrack) {
                this.audioManager.pauseTrack(this.currentTrackId);
                this.isPlaying = false;
            } else if (currentTrack) {
                // Resume the current track
                await this.audioManager.playTrack(
                    currentTrack.trackId,
                    currentTrack.categoryName,
                    currentTrack.fileName,
                    false // don't reset playback time
                );
                this.isPlaying = true;
            }

            this.updatePlayPauseButton();
        } catch (error) {
            console.error('Toggle play/pause failed:', error);
        }
    }

    onTrackPlay(detail) {
        this.isPlaying = true;
        this.currentTrackId = detail?.trackId || detail;

        if (detail?.fileName) {
            const displayName = this.audioManager?.getDisplayName
                ? this.audioManager.getDisplayName(detail.fileName)
                : detail.fileName;
            const subtitle = detail.categoryName || detail.category || '';
            this.updatePlayerUI(displayName, subtitle, true);
        }

        this.updatePlayButtonState(true);

        // Update active card state
        this.updateActiveCard(detail.trackId || detail); // detail might be just ID or object

        // Set volume for the new audio
        if (this.audioManager && this.audioManager.currentAudio) {
            this.audioManager.currentAudio.volume = this.volume / 100;

            // Add loadedmetadata listener to update duration when available
            const audio = this.audioManager.currentAudio;
            const updateDurationOnce = () => {
                if (audio.duration && !isNaN(audio.duration)) {
                    const totalDurationEl = document.getElementById('totalDuration');
                    if (totalDurationEl) {
                        totalDurationEl.textContent = this.formatTime(audio.duration);
                    }
                }
                audio.removeEventListener('loadedmetadata', updateDurationOnce);
            };

            // Try to update immediately if duration is already available
            if (audio.duration && !isNaN(audio.duration)) {
                updateDurationOnce();
            } else {
                audio.addEventListener('loadedmetadata', updateDurationOnce);
            }
        }

        // Start progress bar updates
        this.startProgressUpdate();
    }

    onTrackPause(detail) {
        this.isPlaying = false;
        this.updatePlayButtonState(false);
        this.updateActiveCard(null);

        // Stop progress bar updates
        this.stopProgressUpdate();
    }

    onLoadingStart(trackId) {
        document.body.style.cursor = 'wait';
    }

    onLoadingEnd(trackId) {
        document.body.style.cursor = 'default';
    }

    updatePlayerUI(title, subtitle, isPlaying) {
        const player = document.getElementById('audioPlayer');
        const titleEl = document.getElementById('playerTitle');
        const subtitleEl = document.getElementById('playerSubtitle');

        if (titleEl) titleEl.textContent = title;
        if (subtitleEl) subtitleEl.textContent = subtitle;

        this.updatePlayButtonState(isPlaying);
    }

    updatePlayButtonState(isPlaying) {
        const btn = document.getElementById('playPauseBtn');
        if (btn) {
            btn.innerHTML = isPlaying ?
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>' :
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
        }
    }

    // Helper method to update play/pause button based on current state
    updatePlayPauseButton() {
        this.updatePlayButtonState(this.isPlaying);
    }

    showPlayer() {
        const player = document.getElementById('audioPlayer');
        if (player) {
            player.classList.remove('hidden');
            player.classList.add('visible');
        }
    }

    hidePlayer() {
        const player = document.getElementById('audioPlayer');
        if (player) {
            player.classList.add('hidden');
            player.classList.remove('visible');
        }
        if (this.audioManager?.pauseAll) {
            this.audioManager.pauseAll();
        }
        this.isPlaying = false;
        this.currentTrackId = null;
        this.updatePlayerUI(this.recommendedTrack?.name || '', this.recommendedTrack?.subtitle || '', false);
        this.stopProgressUpdate();
    }

    updateActiveCard(activeTrackId) {
        // Remove active class from all cards
        document.querySelectorAll('.glass-card').forEach(card => {
            card.classList.remove('active');
            card.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        });

        if (activeTrackId) {
            // Find card that matches. 
            // Note: activeTrackId from AudioManager is "Category__FileName"
            // Our cards have data-track-id="FileName" and data-category="Category"

            // We can try to reconstruct or find partial match
            const cards = document.querySelectorAll('.glass-card');
            for (const card of cards) {
                const cat = card.dataset.category;
                const tid = card.dataset.trackId;
                const generatedId = this.audioManager.generateTrackId(cat, tid);

                if (generatedId === activeTrackId) {
                    card.classList.add('active');
                    card.style.borderColor = 'var(--primary-color)';
                    break;
                }
            }
        }
    }

    handleUrlParameters() {
        // TODO: Implement deep linking if needed
    }

    // ===== NEW PLAYBACK CONTROL METHODS =====

    /**
     * Toggle Shuffle Mode
     */
    toggleShuffle() {
        this.shuffleEnabled = !this.shuffleEnabled;
        const shuffleBtn = document.getElementById('shuffleBtn');

        if (shuffleBtn) {
            if (this.shuffleEnabled) {
                shuffleBtn.classList.add('active');
                shuffleBtn.title = 'Shuffle On';
            } else {
                shuffleBtn.classList.remove('active');
                shuffleBtn.title = 'Shuffle Off';
            }
        }

        // Update AudioManager shuffle state if it supports it
        if (this.audioManager && typeof this.audioManager.setShuffle === 'function') {
            this.audioManager.setShuffle(this.shuffleEnabled);
        }
    }

    /**
     * Cycle through repeat modes: off -> all -> one -> off
     */
    cycleRepeatMode() {
        const modes = ['off', 'all', 'one'];
        const currentIndex = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentIndex + 1) % modes.length];

        const repeatBtn = document.getElementById('repeatBtn');

        if (repeatBtn) {
            // Update button state
            if (this.repeatMode === 'off') {
                repeatBtn.classList.remove('active');
                repeatBtn.title = 'Repeat Off';
            } else {
                repeatBtn.classList.add('active');
                repeatBtn.title = this.repeatMode === 'all' ? 'Repeat All' : 'Repeat One';
            }

            // Update icon based on mode
            let icon = '';
            if (this.repeatMode === 'one') {
                icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="17 1 21 5 17 9"></polyline>
                    <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                    <polyline points="7 23 3 19 7 15"></polyline>
                    <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                    <text x="12" y="16" text-anchor="middle" font-size="10" font-weight="bold" fill="currentColor">1</text>
                </svg>`;
            } else {
                icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="17 1 21 5 17 9"></polyline>
                    <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                    <polyline points="7 23 3 19 7 15"></polyline>
                    <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                </svg>`;
            }
            repeatBtn.innerHTML = icon;
        }

        // Update AudioManager repeat state if it supports it
        if (this.audioManager && typeof this.audioManager.setRepeat === 'function') {
            this.audioManager.setRepeat(this.repeatMode);
        }
    }

    /**
     * Set volume (0-100)
     */
    setVolume(value) {
        this.volume = parseInt(value);

        // Update audio element volume
        if (this.audioManager && this.audioManager.currentAudio) {
            this.audioManager.currentAudio.volume = this.volume / 100;
        }

        // Update mute state if needed
        if (this.volume > 0 && this.isMuted) {
            this.isMuted = false;
            this.updateVolumeIcon();
        }

        // Update slider CSS variable
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            volumeSlider.style.setProperty('--volume', `${this.volume}%`);
        }
    }

    /**
     * Toggle mute
     */
    toggleMute() {
        this.isMuted = !this.isMuted;

        if (this.isMuted) {
            this.previousVolume = this.volume;
            this.setVolume(0);

            const volumeSlider = document.getElementById('volumeSlider');
            if (volumeSlider) {
                volumeSlider.value = 0;
            }
        } else {
            this.setVolume(this.previousVolume);

            const volumeSlider = document.getElementById('volumeSlider');
            if (volumeSlider) {
                volumeSlider.value = this.previousVolume;
            }
        }

        this.updateVolumeIcon();
    }

    /**
     * Update volume icon based on volume level and mute state
     */
    updateVolumeIcon() {
        const volumeBtn = document.getElementById('volumeBtn');
        if (!volumeBtn) return;

        let icon = '';
        if (this.isMuted || this.volume === 0) {
            // Muted icon
            icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>`;
        } else if (this.volume < 33) {
            // Low volume icon
            icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            </svg>`;
        } else if (this.volume < 66) {
            // Medium volume icon
            icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>`;
        } else {
            // High volume icon
            icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>`;
        }

        volumeBtn.innerHTML = icon;
    }

    /**
     * Seek to a specific position (0-100%)
     */
    seekTo(percentage) {
        if (!this.audioManager || !this.audioManager.currentAudio) return;

        const audio = this.audioManager.currentAudio;
        if (isNaN(audio.duration)) return;

        const seekTime = (percentage / 100) * audio.duration;
        audio.currentTime = seekTime;

        // Update progress bar CSS variable
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.setProperty('--progress', `${percentage}%`);
        }
    }

    /**
     * Start updating progress bar
     */
    startProgressUpdate() {
        this.stopProgressUpdate(); // Clear any existing interval

        this.progressUpdateInterval = setInterval(() => {
            if (!this.audioManager || !this.audioManager.currentAudio) return;

            const audio = this.audioManager.currentAudio;
            if (!audio || isNaN(audio.duration) || audio.duration === 0) return;

            const percentage = (audio.currentTime / audio.duration) * 100;
            const currentTime = this.formatTime(audio.currentTime);
            const totalDuration = this.formatTime(audio.duration);

            // Update progress bar
            const progressBar = document.getElementById('progressBar');
            if (progressBar) {
                progressBar.value = percentage;
                progressBar.style.setProperty('--progress', `${percentage}%`);
            }

            // Update time displays
            const currentTimeEl = document.getElementById('currentTime');
            const totalDurationEl = document.getElementById('totalDuration');

            if (currentTimeEl) currentTimeEl.textContent = currentTime;
            if (totalDurationEl) totalDurationEl.textContent = totalDuration;

        }, 500); // Update every 500ms
    }

    /**
     * Stop updating progress bar
     */
    stopProgressUpdate() {
        if (this.progressUpdateInterval) {
            clearInterval(this.progressUpdateInterval);
            this.progressUpdateInterval = null;
        }
    }

    /**
     * Format seconds to MM:SS
     */
    formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds)) return '0:00';

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Initialize App on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DeepImmersionApp();
    window.app.initialize();
    // Expose CTA helper
    window.startRecommendedSession = () => window.app.startRecommendedSession();
}); 
