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
            console.log(`Timer set for ${minutes} minutes`);
            if (typeof window.showNotification === 'function') {
                window.showNotification(`Timer set for ${minutes} minutes`, 'info');
            }
        } else {
            this.updateButtonState(false);
            console.log('Timer cleared');
            if (typeof window.showNotification === 'function') {
                window.showNotification('Timer cleared', 'info');
            }
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
                console.log('Timer finished, audio paused');
                if (typeof window.showNotification === 'function') {
                    window.showNotification('Timer finished', 'info');
                }
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
        this.isPlaying = false;
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

    togglePlayPause() {
        if (!this.audioManager || !this.currentTrackId) return;

        if (this.isPlaying) {
            this.audioManager.pauseTrack(this.currentTrackId);
        } else {
            // Resume
            // We need to know the category and filename to resume if it was fully stopped
            // But AudioManager.pauseTrack just pauses.
            // AudioManager.resumeCurrentTrack() might be better if available
            if (this.audioManager.resumeCurrentTrack) {
                this.audioManager.resumeCurrentTrack();
            } else {
                // Fallback
                const track = this.audioManager.getCurrentTrack();
                if (track) {
                    this.audioManager.playTrack(track.trackId, track.categoryName, track.fileName);
                }
            }
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
    }

    onTrackPause(detail) {
        this.isPlaying = false;
        this.updatePlayButtonState(false);
        this.updateActiveCard(null);
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

    showPlayer() {
        const player = document.getElementById('audioPlayer');
        if (player) {
            player.classList.remove('hidden');
            player.classList.add('visible');
        }
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
}

// Initialize App on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DeepImmersionApp();
    window.app.initialize();
});
