/**
 * AppCore Module
 * Main entry point for the Sound Healing App.
 */

import { DataManager } from './data-manager.js';
import { AudioPlayer } from './audio-player.js';
import { UIManager } from './ui-manager.js';
import { CanvasManager } from './canvas-manager.js';
import { AudioMetadata } from './audio-metadata.js';
import { UserDataManager } from './user-data-manager.js';
import { RecommendationEngine } from './recommendation-engine.js';
import { AutoplayDetector } from './autoplay-detector.js';
import { AUDIO_CONFIG } from './audio-config.js';

class AppCore {
    constructor() {
        this.init();
    }

    get audioManager() {
        return this.audioPlayer;
    }

    async init() {
        console.log('🚀 AppCore initializing...');

        // 1. Initialize Data & Metadata
        this.audioMetadata = new AudioMetadata();
        this.userDataManager = new UserDataManager();
        this.dataManager = new DataManager(this.audioMetadata);

        // 2. Initialize Logic Engines
        this.recommendationEngine = new RecommendationEngine(this.userDataManager, this.audioMetadata);
        this.autoplayDetector = new AutoplayDetector();

        // 3. Initialize Player
        this.audioPlayer = new AudioPlayer();

        // 4. Initialize UI
        this.uiManager = new UIManager(
            this.dataManager,
            this.audioPlayer,
            this.recommendationEngine,
            this.userDataManager
        );

        // 5. Initialize Canvas
        this.canvasManager = new CanvasManager();

        // 6. Bind Events
        this._bindEvents();

        // 7. Initial Render
        const entries = this.dataManager.getAvailableCategoryEntries();
        this.uiManager.renderCategoryShortcuts(entries);
        this.uiManager.renderRecommendations();

        // 8. Autoplay Check
        await this.autoplayDetector.detectAutoplay();

        // Expose for legacy compatibility
        window.appCore = this;
        window.app = this; // For legacy scripts
        window.audioManager = this.audioPlayer; // For legacy scripts expecting global audioManager

        // Expose legacy globals for compatibility with old scripts (if any remain)
        window.userDataManager = this.userDataManager;
        window.audioMetadata = this.audioMetadata;
        window.recommendationEngine = this.recommendationEngine;
        window.AUDIO_CONFIG = AUDIO_CONFIG; // For ui-redesign-v2.js

        console.log('✅ AppCore initialized');

        // Hide loading screen and show app
        this._hideLoadingScreen();
    }

    _hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            const app = document.getElementById('app');

            if (loadingScreen) {
                loadingScreen.style.display = 'none';
                console.log('✅ Loading screen hidden');
            }
            if (app) {
                app.style.display = 'block';
            }
        }, 500); // Short delay to ensure smooth transition
    }

    _bindEvents() {
        // Initialize Audio Player Events
        this.audioPlayer.addEventListener('statechange', (e) => {
            this.uiManager.updatePlayerState(e.detail.isPlaying);
        });

        this.audioPlayer.addEventListener('trackchange', (e) => {
            this.uiManager.updateTrackInfo(e.detail.track);
            this.uiManager.openPlayerModal();
            this.uiManager.showNotification(`正在播放: ${e.detail.track.name}`, 'success');

            // Add to history
            this.userDataManager.addToHistory({
                category: e.detail.track.category,
                fileName: e.detail.track.fileName,
                displayName: e.detail.track.name,
                duration: e.detail.track.duration
            });
        });

        this.audioPlayer.addEventListener('timeupdate', (e) => {
            this.uiManager.updateProgress(e.detail.currentTime, e.detail.duration);
        });

        this.audioPlayer.addEventListener('error', (e) => {
            this.uiManager.showNotification('播放出错，请检查网络', 'error');
        });

        this.audioPlayer.addEventListener('playerror', async () => {
            await this.autoplayDetector.waitForInteraction();
            // User interacted, try playing again? 
            // For now just notify
            this.uiManager.showNotification('请点击页面任意位置以启用音频', 'warning');
        });

        // Initialize UI Events (that need Core coordination)
        const playPauseBtn = document.getElementById('playPauseBtn');
        if (playPauseBtn) {
            playPauseBtn.onclick = () => this.audioPlayer.togglePlayPause();
        }

        const prevBtn = document.querySelector('.control-btn[onclick="previousTrack()"]'); // Legacy selector support
        if (prevBtn) prevBtn.onclick = () => this.audioPlayer.previous();

        // Also bind to ID if exists
        const prevBtnId = document.getElementById('prevBtn');
        if (prevBtnId) prevBtnId.onclick = () => this.audioPlayer.previous();

        const nextBtn = document.querySelector('.control-btn[onclick="nextTrack()"]');
        if (nextBtn) nextBtn.onclick = () => this.audioPlayer.next();

        const nextBtnId = document.getElementById('nextBtn');
        if (nextBtnId) nextBtnId.onclick = () => this.audioPlayer.next();

        const shuffleBtn = document.getElementById('shuffleBtn');
        if (shuffleBtn) {
            shuffleBtn.onclick = () => {
                const isShuffle = this.audioPlayer.toggleShuffle();
                shuffleBtn.classList.toggle('active', isShuffle);
                this.uiManager.showNotification(isShuffle ? '随机播放已开启' : '随机播放已关闭');
            };
        }

        const repeatBtn = document.getElementById('repeatBtn');
        if (repeatBtn) {
            repeatBtn.onclick = () => {
                const isRepeat = this.audioPlayer.toggleRepeat();
                repeatBtn.classList.toggle('active', isRepeat);
                repeatBtn.textContent = isRepeat ? '🔂' : '🔁';
                this.uiManager.showNotification(isRepeat ? '单曲循环已开启' : '循环播放已开启');
            };
        }

        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            volumeSlider.oninput = (e) => {
                const val = e.target.value / 100;
                this.audioPlayer.setVolume(val);
                this.uiManager.updateVolume(val);
            };
        }

        // Sleep Timer
        const sleepTimerBtn = document.getElementById('sleepTimerBtn');
        if (sleepTimerBtn) {
            sleepTimerBtn.onclick = () => this.uiManager.toggleSleepTimerModal();
        }

        // Bind sleep timer options
        document.querySelectorAll('.timer-option').forEach(btn => {
            btn.onclick = (e) => {
                const mins = parseInt(e.target.dataset.time);
                this.audioPlayer.setSleepTimer(mins);
                this.uiManager.toggleSleepTimerModal();
                this.uiManager.showNotification(`睡眠定时器已设置: ${mins}分钟`);
            };
        });
    }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new AppCore());
} else {
    new AppCore();
}
