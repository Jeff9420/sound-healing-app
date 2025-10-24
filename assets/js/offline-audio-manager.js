/**
 * Offline Audio Manager
 * Manages offline audio downloads, caching, and playback
 *
 * @author Sound Healing Team
 * @version 1.0.0
 * @date 2025-01-24
 */

class OfflineAudioManager {
    constructor() {
        this.swRegistration = null;
        this.downloadedAudio = new Map();
        this.downloadQueue = [];
        this.isDownloading = false;
        this.init();
    }

    async init() {
        // Register service worker if not already registered
        if ('serviceWorker' in navigator) {
            this.swRegistration = await navigator.serviceWorker.ready;

            // Listen for messages from service worker
            navigator.serviceWorker.addEventListener('message', this.handleSWMessage.bind(this));

            // Load downloaded audio list from storage
            this.loadDownloadedAudioList();
        }

        // Setup UI elements
        this.setupUI();
    }

    setupUI() {
        // Add offline button to audio player
        this.addOfflineButton();

        // Add offline status indicator
        this.addOfflineIndicator();

        // Listen for online/offline events
        window.addEventListener('online', () => this.updateOnlineStatus(true));
        window.addEventListener('offline', () => this.updateOnlineStatus(false));
    }

    addOfflineButton() {
        // Check if button already exists
        if (document.getElementById('offlineDownloadBtn')) {
            return;
        }

        const extraControls = document.querySelector('.extra-controls');
        if (!extraControls) return;

        const offlineButton = document.createElement('button');
        offlineButton.id = 'offlineDownloadBtn';
        offlineButton.className = 'control-btn offline-btn';
        offlineButton.innerHTML = '📥';
        offlineButton.title = 'Download for offline use';
        offlineButton.onclick = () => this.showOfflineDownloadDialog();

        extraControls.appendChild(offlineButton);
    }

    addOfflineIndicator() {
        // Check if indicator already exists
        if (document.getElementById('offlineIndicator')) {
            return;
        }

        const indicator = document.createElement('div');
        indicator.id = 'offlineIndicator';
        indicator.className = 'offline-indicator';
        indicator.innerHTML = `
            <span class="offline-icon">📱</span>
            <span class="offline-text">Offline</span>
        `;

        document.body.appendChild(indicator);

        // Add CSS
        if (!document.getElementById('offlineIndicatorStyles')) {
            const style = document.createElement('style');
            style.id = 'offlineIndicatorStyles';
            style.textContent = `
                .offline-indicator {
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%) translateY(-100px);
                    background: rgba(76, 175, 80, 0.95);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                    transition: transform 0.3s ease;
                }

                .offline-indicator.show {
                    transform: translateX(-50%) translateY(0);
                }

                .offline-indicator.online {
                    background: rgba(33, 150, 243, 0.95);
                }

                .offline-btn {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: rgba(255, 255, 255, 0.8);
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2em;
                }

                .offline-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    transform: translateY(-2px);
                }

                .offline-btn.downloading {
                    animation: pulse 1.5s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                .offline-download-dialog {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                    border-radius: 20px;
                    padding: 30px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    z-index: 10000;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                }

                .offline-download-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(5px);
                    z-index: 9999;
                }

                .offline-download-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                }

                .offline-download-header h3 {
                    color: white;
                    font-size: 1.5rem;
                    margin: 0;
                }

                .offline-download-close {
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 2rem;
                    cursor: pointer;
                    padding: 0;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                }

                .offline-download-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }

                .offline-download-options {
                    margin-bottom: 25px;
                }

                .offline-option-card {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 15px;
                    padding: 20px;
                    margin-bottom: 15px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: 1px solid transparent;
                }

                .offline-option-card:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(255, 255, 255, 0.2);
                }

                .offline-option-card.selected {
                    background: rgba(102, 102, 255, 0.2);
                    border-color: rgba(102, 102, 255, 0.4);
                }

                .offline-option-title {
                    color: white;
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin-bottom: 5px;
                }

                .offline-option-desc {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.9rem;
                }

                .offline-option-size {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 0.85rem;
                    margin-top: 8px;
                }

                .offline-download-actions {
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                }

                .offline-download-btn {
                    padding: 12px 30px;
                    border-radius: 10px;
                    border: none;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .offline-download-btn.primary {
                    background: linear-gradient(135deg, #6666ff, #7777ff);
                    color: white;
                }

                .offline-download-btn.primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(102, 102, 255, 0.3);
                }

                .offline-download-btn.secondary {
                    background: transparent;
                    color: rgba(255, 255, 255, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .offline-download-btn.secondary:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                }

                .offline-progress {
                    margin-top: 20px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    overflow: hidden;
                    height: 6px;
                }

                .offline-progress-bar {
                    height: 100%;
                    background: linear-gradient(90deg, #6666ff, #7777ff);
                    width: 0%;
                    transition: width 0.3s ease;
                }

                .offline-progress-text {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.9rem;
                    margin-top: 10px;
                    text-align: center;
                }
            `;
            document.head.appendChild(style);
        }
    }

    updateOnlineStatus(isOnline) {
        const indicator = document.getElementById('offlineIndicator');
        if (!indicator) return;

        if (isOnline) {
            indicator.classList.remove('show');
            indicator.classList.remove('online');
        } else {
            indicator.classList.add('show');
            indicator.classList.add('online');
        }
    }

    showOfflineDownloadDialog() {
        // Create dialog
        const dialog = document.createElement('div');
        dialog.id = 'offlineDownloadDialog';
        dialog.innerHTML = `
            <div class="offline-download-overlay" onclick="this.parentElement.remove()"></div>
            <div class="offline-download-content">
                <div class="offline-download-header">
                    <h3>Download for Offline Use</h3>
                    <button class="offline-download-close" onclick="this.closest('.offline-download-dialog').remove()">&times;</button>
                </div>
                <div class="offline-download-options">
                    <div class="offline-option-card" data-option="current">
                        <div class="offline-option-title">Current Track</div>
                        <div class="offline-option-desc">Download only the currently playing track</div>
                        <div class="offline-option-size">~3-5 MB</div>
                    </div>
                    <div class="offline-option-card" data-option="category">
                        <div class="offline-option-title">Entire Category</div>
                        <div class="offline-option-desc">Download all tracks from this category (up to 10)</div>
                        <div class="offline-option-size">~30-50 MB</div>
                    </div>
                    <div class="offline-option-card" data-option="favorites">
                        <div class="offline-option-title">Favorites</div>
                        <div class="offline-option-desc">Download all your favorite tracks</div>
                        <div class="offline-option-size">~20-100 MB</div>
                    </div>
                    <div class="offline-option-card" data-option="featured">
                        <div class="offline-option-title">Featured Collection</div>
                        <div class="offline-option-desc">Download our curated selection of popular tracks</div>
                        <div class="offline-option-size">~40-60 MB</div>
                    </div>
                </div>
                <div class="offline-download-actions">
                    <button class="offline-download-btn primary" onclick="window.offlineManager.startDownload()">Download</button>
                    <button class="offline-download-btn secondary" onclick="this.closest('.offline-download-dialog').remove()">Cancel</button>
                </div>
                <div id="downloadProgress" style="display: none;">
                    <div class="offline-progress">
                        <div class="offline-progress-bar"></div>
                    </div>
                    <div class="offline-progress-text">Downloading...</div>
                </div>
            </div>
        `;

        // Add click handlers for option cards
        dialog.querySelectorAll('.offline-option-card').forEach(card => {
            card.addEventListener('click', () => {
                dialog.querySelectorAll('.offline-option-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            });
        });

        // Select first option by default
        dialog.querySelector('.offline-option-card').classList.add('selected');

        document.body.appendChild(dialog);
    }

    async startDownload() {
        const dialog = document.getElementById('offlineDownloadDialog');
        const selectedOption = dialog.querySelector('.offline-option-card.selected').dataset.option;

        const progressDiv = document.getElementById('downloadProgress');
        progressDiv.style.display = 'block';

        const progressBar = progressDiv.querySelector('.offline-progress-bar');
        const progressText = progressDiv.querySelector('.offline-progress-text');

        // Disable download button
        const downloadBtn = dialog.querySelector('.offline-download-btn.primary');
        downloadBtn.disabled = true;
        downloadBtn.textContent = 'Downloading...';

        // Get URLs to download based on selection
        let urls = [];
        switch (selectedOption) {
            case 'current':
                urls = await this.getCurrentTrackUrls();
                break;
            case 'category':
                urls = await this.getCategoryUrls();
                break;
            case 'favorites':
                urls = await this.getFavoriteUrls();
                break;
            case 'featured':
                urls = await this.getFeaturedUrls();
                break;
        }

        if (urls.length === 0) {
            progressText.textContent = 'No tracks to download';
            return;
        }

        // Simulate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `Downloading... ${progress}%`;

            if (progress >= 100) {
                clearInterval(progressInterval);
            }
        }, 200);

        try {
            // Send download request to service worker
            if (this.swRegistration && this.swRegistration.active) {
                this.swRegistration.active.postMessage({
                    type: 'DOWNLOAD_FOR_OFFLINE',
                    data: { audioUrls: urls }
                });
            }

            // Store in local storage for tracking
            urls.forEach(url => {
                this.downloadedAudio.set(url, {
                    downloaded: true,
                    timestamp: new Date().toISOString()
                });
            });
            this.saveDownloadedAudioList();

        } catch (error) {
            console.error('Download failed:', error);
            progressText.textContent = 'Download failed. Please try again.';
        }

        // Close dialog after delay
        setTimeout(() => {
            dialog.remove();
            this.showNotification('Download complete! Tracks are available for offline use.', 'success');
        }, 2000);
    }

    async getCurrentTrackUrls() {
        // Get current playing track URL
        const currentTrack = window.audioManager?.currentTrack;
        if (currentTrack && currentTrack.url) {
            return [currentTrack.url];
        }
        return [];
    }

    async getCategoryUrls() {
        // Get URLs from current category
        const currentCategory = window.audioManager?.currentCategory;
        const tracks = window.audioManager?.playlist?.tracks || [];

        if (currentCategory && tracks.length > 0) {
            // Limit to 10 tracks to avoid excessive storage use
            return tracks.slice(0, 10).map(track => track.url).filter(url => url);
        }
        return [];
    }

    async getFavoriteUrls() {
        // Get favorite tracks from local storage
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        return favorites.map(fav => fav.url).filter(url => url);
    }

    async getFeaturedUrls() {
        // Return featured audio URLs from service worker
        return [
            'https://archive.org/download/sound-healing-collection/meditation/01-morning-meditation.mp3',
            'https://archive.org/download/sound-healing-collection/rain-sounds/01-gentle-rain.mp3',
            'https://archive.org/download/sound-healing-collection/singing-bowl-sound/01-root-chakra-bowl.mp3',
            'https://archive.org/download/sound-healing-collection/white-noise/01-pure-white-noise.mp3'
        ];
    }

    handleSWMessage(event) {
        const { type, data } = event.data;

        switch (type) {
            case 'AUDIO_DOWNLOAD_COMPLETE':
                this.handleDownloadComplete(data.results);
                break;
            case 'OFFLINE_AUDIO_REMOVED':
                this.handleAudioRemoved(data.url);
                break;
            case 'CACHE_STATUS':
                this.updateCacheStatus(data.status);
                break;
            case 'CATEGORY_PRELOAD_COMPLETE':
                this.handlePreloadComplete(data.category, data.results);
                break;
        }
    }

    handleDownloadComplete(results) {
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        if (successful > 0) {
            this.showNotification(
                `Successfully downloaded ${successful} track${successful > 1 ? 's' : ''} for offline use!`,
                'success'
            );
        }

        if (failed > 0) {
            this.showNotification(
                `Failed to download ${failed} track${failed > 1 ? 's' : ''}. Please check your connection.`,
                'error'
            );
        }

        // Update UI
        this.updateOfflineButton();
    }

    handleAudioRemoved(url) {
        this.downloadedAudio.delete(url);
        this.saveDownloadedAudioList();
        this.showNotification('Track removed from offline storage', 'info');
    }

    updateCacheStatus(status) {
        // Could display cache status in settings or elsewhere
        console.log('Cache Status:', status);
    }

    handlePreloadComplete(category, results) {
        const successful = results.filter(r => r.success).length;
        if (successful > 0) {
            this.showNotification(
                `Preloaded ${successful} tracks from ${category} category`,
                'success'
            );
        }
    }

    updateOfflineButton() {
        const button = document.getElementById('offlineDownloadBtn');
        if (!button) return;

        const currentTrack = window.audioManager?.currentTrack;
        if (currentTrack && this.downloadedAudio.has(currentTrack.url)) {
            button.innerHTML = '✓';
            button.title = 'Downloaded for offline use';
            button.style.color = '#4caf50';
        } else {
            button.innerHTML = '📥';
            button.title = 'Download for offline use';
            button.style.color = '';
        }
    }

    loadDownloadedAudioList() {
        const saved = localStorage.getItem('downloadedAudioList');
        if (saved) {
            const list = JSON.parse(saved);
            this.downloadedAudio = new Map(Object.entries(list));
        }
    }

    saveDownloadedAudioList() {
        const obj = Object.fromEntries(this.downloadedAudio);
        localStorage.setItem('downloadedAudioList', JSON.stringify(obj));
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `offline-notification offline-notification-${type}`;
        notification.textContent = message;

        // Add notification styles if not exists
        if (!document.getElementById('offlineNotificationStyles')) {
            const style = document.createElement('style');
            style.id = 'offlineNotificationStyles';
            style.textContent = `
                .offline-notification {
                    position: fixed;
                    bottom: 100px;
                    right: 20px;
                    padding: 15px 25px;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    font-weight: 500;
                    z-index: 10003;
                    transform: translateX(400px);
                    transition: transform 0.3s ease;
                    max-width: 400px;
                    word-wrap: break-word;
                }

                .offline-notification.show {
                    transform: translateX(0);
                }

                .offline-notification-success {
                    background: rgba(76, 175, 80, 0.9);
                    color: white;
                }

                .offline-notification-error {
                    background: rgba(244, 67, 54, 0.9);
                    color: white;
                }

                .offline-notification-info {
                    background: rgba(33, 150, 243, 0.9);
                    color: white;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto-hide after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
    }
}

// Initialize offline manager
window.offlineManager = new OfflineAudioManager();