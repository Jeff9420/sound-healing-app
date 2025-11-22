/**
 * Deep Immersion Theme Application Script
 * Handles UI interactions, audio playback via AudioManager, and integration with UserDataManager.
 */

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
        if (window.AudioManager) {
            this.audioManager = new window.AudioManager();
            await this.audioManager.initialize();
            window.audioManager = this.audioManager; // Global access for HistoryFavoritesUI
        } else {
            console.error('❌ AudioManager class not found!');
        }

        // Initialize HistoryFavoritesUI
        if (window.HistoryFavoritesUI && this.userDataManager) {
            this.historyFavoritesUI = new window.HistoryFavoritesUI(this.userDataManager);
            this.historyFavoritesUI.initialize();
            window.historyFavoritesUI = this.historyFavoritesUI;
        }
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
            if (this.currentTrackId === trackId && this.isPlaying) {
                this.audioManager.pauseTrack(trackId);
                return;
            }

            // Play the track
            // Note: AudioManager expects (trackId, categoryName, fileName)
            // Our trackId in HTML is usually the filename without extension or a unique key
            // We need to map it correctly. 
            // Assuming trackId in HTML is the fileName for now, or we construct it.

            // Construct a unique ID for AudioManager
            const uniqueId = this.audioManager.generateTrackId(category, trackId);

            // Update UI immediately
            this.updatePlayerUI(name, category, true);
            this.showPlayer();

            await this.audioManager.playTrack(uniqueId, category, trackId);

            this.currentTrackId = uniqueId; // Store the unique ID
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
