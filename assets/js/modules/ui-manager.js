/**
 * UIManager Module
 * Handles UI rendering, event binding, and updates.
 */

export class UIManager {
    constructor(dataManager, audioPlayer, recommendationEngine, userDataManager) {
        this.dataManager = dataManager;
        this.audioPlayer = audioPlayer;
        this.recommendationEngine = recommendationEngine;
        this.userDataManager = userDataManager;

        // Cache DOM elements
        this.elements = {
            shortcutsContainer: document.getElementById('categoryShortcuts'),
            recommendationsGrid: document.getElementById('recommendationsGrid'),
            playerModal: document.getElementById('playerControlModal') || document.getElementById('playerModal'),
            playlistModal: document.getElementById('playlistModal'),
            trackList: document.getElementById('trackList'),
            playPauseBtn: document.getElementById('playPauseBtn'),
            currentTrack: document.getElementById('currentTrack'),
            currentTime: document.getElementById('currentTime'),
            duration: document.getElementById('duration') || document.getElementById('totalDuration'),
            progressFill: document.getElementById('progressFill'),
            volumeSlider: document.getElementById('volumeSlider'),
            volumeValue: document.getElementById('volumeValue'),
            shuffleBtn: document.getElementById('shuffleBtn'),
            repeatBtn: document.getElementById('repeatBtn'),
            sleepTimerBtn: document.getElementById('sleepTimerBtn'),
            sleepTimerModal: document.getElementById('sleepTimerModal')
        };

        this._bindEvents();
        this.fixChineseEncoding();
    }

    fixChineseEncoding() {
        const corruptedElements = document.querySelectorAll('*');
        let fixedCount = 0;
        corruptedElements.forEach(el => {
            if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;
            Array.from(el.childNodes).forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.nodeValue;
                    if (text && text.includes('\uFFFD')) {
                        if (text.match(/\uFFFD{10}/)) {
                            node.nodeValue = text.replace(/\uFFFD{10}/g, '体验启动台');
                            fixedCount++;
                        }
                    }
                }
            });
        });
        if (fixedCount > 0) console.log(`✅ Fixed ${fixedCount} encoding issues`);
    }

    _bindEvents() {
        // Global click to close modals
        window.addEventListener('click', (e) => {
            if (e.target === this.elements.playlistModal) {
                this.closePlaylist();
            }
            if (e.target && e.target.hasAttribute('data-close-player-modal')) {
                this.closePlayerModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closePlayerModal();
                this.closePlaylist();
            }
        });
    }

    renderCategoryShortcuts(entries) {
        if (!this.elements.shortcutsContainer) return;

        this.elements.shortcutsContainer.innerHTML = '';

        entries.forEach(([key, category]) => {
            const button = document.createElement('button');
            button.className = 'category-shortcut';
            button.setAttribute('data-category', key);

            const info = this.dataManager.getCategoryInfo(key);
            const presentation = this.dataManager.getCategoryPresentation(key);
            const name = this.dataManager.getCategoryDisplayName(key, category);
            const desc = this.dataManager.getCategoryDescription(key, category);

            button.style.setProperty('--accent-color', presentation.accent || '#7b5dff');

            button.innerHTML = `
                <span class="category-shortcut__glow"></span>
                <span class="category-shortcut__orbit"></span>
                <div class="category-shortcut__header">
                    <span class="category-shortcut__badge">${presentation.badge || 'Sound Module'}</span>
                    <span class="category-shortcut__label">${presentation.label || name}</span>
                </div>
                <div class="category-shortcut__body">
                    <div class="category-shortcut__icon">${category.icon || info.icon || '🎵'}</div>
                    <div class="category-shortcut__copy">
                        <p class="category-shortcut__title">${name}</p>
                        <p class="category-shortcut__desc">${desc}</p>
                    </div>
                </div>
                <div class="category-shortcut__cta">
                    <span>${presentation.tagline || '立即体验'}</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            `;

            button.addEventListener('click', () => {
                this.openPlaylist(key, category);
            });

            this.elements.shortcutsContainer.appendChild(button);
        });
    }

    renderRecommendations() {
        if (!this.elements.recommendationsGrid || !this.recommendationEngine) return;

        const recommendations = this.recommendationEngine.getRecommendations(4);
        this.elements.recommendationsGrid.innerHTML = '';

        recommendations.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'recommendation-card'; // Ensure CSS exists for this

            const reasonText = this.recommendationEngine.getReasonText(rec.reason, rec);
            const title = this.dataManager.getLocalizedTrackTitle(rec.category, rec.fileName);

            card.innerHTML = `
                <div class="rec-badge">${reasonText}</div>
                <div class="rec-icon">🎵</div>
                <div class="rec-info">
                    <h3>${title}</h3>
                    <p>${rec.duration || 'Relaxing'}</p>
                </div>
                <button class="rec-play-btn">▶</button>
            `;

            card.addEventListener('click', () => {
                // Find index in category
                const category = this.dataManager.audioConfig.categories[rec.category];
                if (category && category.files) {
                    const index = category.files.indexOf(rec.fileName);
                    if (index !== -1) {
                        this.audioPlayer.loadAndPlay(
                            category.files.map(f => ({
                                name: this.dataManager.getLocalizedTrackTitle(rec.category, f),
                                fileName: f,
                                url: this.dataManager.getAudioUrl(rec.category, f),
                                category: rec.category
                            })),
                            index,
                            { key: rec.category, ...category }
                        );
                    }
                }
            });

            this.elements.recommendationsGrid.appendChild(card);
        });
    }

    openPlaylist(key, category) {
        const playlistTitle = document.getElementById('playlistTitle');
        if (playlistTitle) {
            playlistTitle.textContent = this.dataManager.getCategoryDisplayName(key, category);
        }

        if (!this.elements.trackList) return;
        this.elements.trackList.innerHTML = '';

        let tracks = [];
        if (category.files) {
            tracks = category.files.map(fileName => ({
                name: this.dataManager.getLocalizedTrackTitle(key, fileName),
                fileName,
                url: this.dataManager.getAudioUrl(key, fileName),
                category: key
            }));
        }

        tracks.forEach((track, index) => {
            const item = document.createElement('div');
            item.className = 'track-item';
            item.onclick = () => {
                this.audioPlayer.loadAndPlay(tracks, index, { key, ...category });
            };

            item.innerHTML = `
                <div style="font-size: 1.1em; margin-bottom: 4px;">🎧 ${track.name}</div>
                <div class="track-meta">${this.dataManager.getTrackMetaSummary(key, track.fileName)}</div>
            `;
            this.elements.trackList.appendChild(item);
        });

        if (this.elements.playlistModal) {
            this.elements.playlistModal.style.display = 'block';
        }
    }

    closePlaylist() {
        if (this.elements.playlistModal) {
            this.elements.playlistModal.style.display = 'none';
        }
    }

    openPlayerModal() {
        const modal = document.getElementById('playerControlModal') || document.getElementById('playerModal');
        if (modal) {
            modal.classList.add('show', 'player-modal--visible');
            modal.removeAttribute('aria-hidden');
            document.body.classList.add('player-modal-open');

            const player = document.getElementById('audioPlayer');
            if (player) player.classList.add('show');
        }
    }

    closePlayerModal() {
        const modal = document.getElementById('playerControlModal') || document.getElementById('playerModal');
        if (modal) {
            modal.classList.remove('show', 'player-modal--visible');
            modal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('player-modal-open');

            const player = document.getElementById('audioPlayer');
            if (player) player.classList.remove('show');
        }
    }

    updatePlayerState(isPlaying) {
        const btn = this.elements.playPauseBtn;
        if (btn) {
            const playIcon = btn.querySelector('.play-icon');
            const pauseIcon = btn.querySelector('.pause-icon');

            if (playIcon && pauseIcon) {
                playIcon.style.display = isPlaying ? 'none' : 'block';
                pauseIcon.style.display = isPlaying ? 'block' : 'none';
            } else {
                btn.textContent = isPlaying ? '⏸️' : '▶️';
            }
        }
    }

    updateTrackInfo(track) {
        if (this.elements.currentTrack) {
            this.elements.currentTrack.textContent = track.name;
        }
    }

    updateProgress(currentTime, duration) {
        if (this.elements.currentTime) {
            this.elements.currentTime.textContent = this._formatTime(currentTime);
        }
        if (this.elements.duration && duration) {
            this.elements.duration.textContent = this._formatTime(duration);
        }
        if (this.elements.progressFill && duration) {
            const pct = (currentTime / duration) * 100;
            this.elements.progressFill.style.width = `${pct}%`;
        }
    }

    updateVolume(value) {
        if (this.elements.volumeSlider) {
            this.elements.volumeSlider.value = value * 100;
        }
        if (this.elements.volumeValue) {
            this.elements.volumeValue.textContent = `${Math.round(value * 100)}%`;
        }
    }

    toggleSleepTimerModal() {
        const modal = this.elements.sleepTimerModal;
        if (modal) {
            modal.style.display = modal.style.display === 'none' ? 'block' : 'none';
        }
    }

    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }

    _formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}
