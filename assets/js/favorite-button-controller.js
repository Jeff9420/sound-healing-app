/**
 * FavoriteButtonController - 管理播放器收藏按钮
 *
 * 重新实现兼容层，避免因为编码问题导致图标不可见。
 * 按钮会在播放器展开后显示，点击即可收藏/取消收藏当前曲目。
 */

class FavoriteButtonController {
    constructor(userDataManager, audioManager) {
        this.userDataManager = userDataManager;
        this.audioManager = audioManager;

        this.favoriteBtn = null;
        this.currentTrack = null;

        this.init();
    }

    init() {
        this.createFavoriteButton();
        this.setupEventListeners();
        console.log('✅ FavoriteButtonController 已初始化');
    }

    createFavoriteButton() {
        const playerControls = document.querySelector('.player-controls');
        const headerControls = document.querySelector('.header-controls');
        const controlsContainer = playerControls || headerControls;

        if (!controlsContainer) {
            console.warn('FavoriteButtonController: 未找到播放器控制区域');
            return;
        }

        this.favoriteBtn = document.createElement('button');
        this.favoriteBtn.id = 'favoriteCurrentTrack';
        this.favoriteBtn.className = 'header-icon-btn favorite-btn';
        this.favoriteBtn.type = 'button';
        this.favoriteBtn.style.display = 'none';
        this.favoriteBtn.textContent = '♡';
        this.favoriteBtn.title = 'Add to favorites';
        this.favoriteBtn.setAttribute('aria-label', 'Add to favorites');
        this.favoriteBtn.addEventListener('click', () => this.toggleFavorite());

        controlsContainer.appendChild(this.favoriteBtn);
    }

    setupEventListeners() {
        window.addEventListener('audio:trackChanged', (event) => {
            this.handleTrackChange(event.detail);
        });

        window.addEventListener('userData:favoritesUpdated', () => {
            this.updateButtonState();
        });

        if (this.audioManager && this.audioManager.eventBus) {
            this.audioManager.eventBus.addEventListener('trackStarted', (event) => {
                this.handleTrackChange(event.detail);
            });
        }
    }

    handleTrackChange(trackInfo) {
        if (!trackInfo || !trackInfo.category || !trackInfo.fileName) {
            this.hideButton();
            return;
        }

        this.currentTrack = {
            category: trackInfo.category,
            fileName: trackInfo.fileName,
            displayName: trackInfo.displayName || this.getDisplayName(trackInfo.fileName)
        };

        this.showButton();
        this.updateButtonState();
    }

    toggleFavorite() {
        if (!this.currentTrack || !this.userDataManager) {
            return;
        }

        const added = this.userDataManager.toggleFavorite(this.currentTrack);

        const message = added
            ? `Added "${this.currentTrack.displayName}" to favorites`
            : `Removed "${this.currentTrack.displayName}" from favorites`;
        this.showToast(message);

        this.updateButtonState();
    }

    updateButtonState() {
        if (!this.favoriteBtn || !this.currentTrack || !this.userDataManager) {
            return;
        }

        const trackId = `${this.currentTrack.category}_${this.currentTrack.fileName}`;
        const isFavorited = this.userDataManager.isFavorite(trackId);

        this.favoriteBtn.textContent = isFavorited ? '❤' : '♡';
        const title = isFavorited ? 'Remove from favorites' : 'Add to favorites';
        this.favoriteBtn.title = title;
        this.favoriteBtn.setAttribute('aria-label', title);
        this.favoriteBtn.classList.toggle('favorited', isFavorited);
    }

    showButton() {
        if (this.favoriteBtn) {
            this.favoriteBtn.style.display = 'flex';
        }
    }

    hideButton() {
        if (this.favoriteBtn) {
            this.favoriteBtn.style.display = 'none';
        }
        this.currentTrack = null;
    }

    getDisplayName(fileName) {
        return fileName.replace(/\.(mp3|wav|ogg|m4a|wma|flac|aac)$/i, '');
    }

    showToast(message) {
        let toastContainer = document.getElementById('favoriteToastContainer');

        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'favoriteToastContainer';
            toastContainer.style.cssText = `
                position: fixed;
                top: 80px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = 'favorite-toast';
        toast.textContent = message;
        toast.style.cssText = `
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            margin-bottom: 10px;
            opacity: 0;
            transition: opacity 0.3s ease;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;

        toastContainer.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = '1';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

if (typeof window !== 'undefined') {
    window.FavoriteButtonController = FavoriteButtonController;

    const initialize = () => {
        if (!window.userDataManager) {
            return;
        }

        if (!window.favoriteButtonController) {
            window.favoriteButtonController = new FavoriteButtonController(
                window.userDataManager,
                window.audioManager || null
            );
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initialize, 300);
        });
    } else {
        setTimeout(initialize, 300);
    }

    window.addEventListener('userData:ready', () => {
        setTimeout(initialize, 100);
    });
}
