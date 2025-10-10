/**
 * FavoriteButtonController - 收藏按钮控制器
 *
 * 在播放器UI中添加收藏按钮，让用户可以随时收藏正在播放的音频
 *
 * @class
 * @version 1.0.0
 */

class FavoriteButtonController {
    constructor(userDataManager, audioManager) {
        this.userDataManager = userDataManager;
        this.audioManager = audioManager;
        this.currentTrack = null;
        this.favoriteBtn = null;

        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.createFavoriteButton();
        this.setupEventListeners();
        console.log('✅ FavoriteButtonController 已初始化');
    }

    /**
     * 创建收藏按钮
     */
    createFavoriteButton() {
        // 查找播放器控制区域
        const playerControls = document.querySelector('.player-controls');
        const headerControls = document.querySelector('.header-controls');
        const controlsContainer = playerControls || headerControls;

        if (!controlsContainer) {
            console.warn('未找到播放器控制区域，将在首次播放时创建收藏按钮');
            return;
        }

        // 创建收藏按钮
        this.favoriteBtn = document.createElement('button');
        this.favoriteBtn.id = 'favoriteCurrentTrack';
        this.favoriteBtn.className = 'header-icon-btn favorite-btn';
        this.favoriteBtn.title = '收藏当前音频';
        this.favoriteBtn.innerHTML = '☆';
        this.favoriteBtn.style.display = 'none'; // 初始隐藏
        this.favoriteBtn.onclick = () => this.toggleFavorite();

        // 插入到控制区域
        controlsContainer.appendChild(this.favoriteBtn);
    }

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 监听音频开始播放
        window.addEventListener('audio:trackChanged', (e) => {
            this.handleTrackChange(e.detail);
        });

        // 监听收藏状态变化
        window.addEventListener('userData:favoritesUpdated', () => {
            this.updateButtonState();
        });

        // 如果audioManager存在，监听其播放事件
        if (this.audioManager) {
            // 尝试通过不同方式监听播放事件
            if (this.audioManager.eventBus) {
                this.audioManager.eventBus.addEventListener('trackStarted', (e) => {
                    this.handleTrackChange(e.detail);
                });
            }
        }
    }

    /**
     * 处理音频切换
     */
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

    /**
     * 切换收藏状态
     */
    toggleFavorite() {
        if (!this.currentTrack) {
            return;
        }

        const isFavorited = this.userDataManager.toggleFavorite(this.currentTrack);

        // 显示提示
        this.showToast(
            isFavorited ?
            `已收藏《${this.currentTrack.displayName}》` :
            `已取消收藏《${this.currentTrack.displayName}》`
        );

        this.updateButtonState();
    }

    /**
     * 更新按钮状态
     */
    updateButtonState() {
        if (!this.favoriteBtn || !this.currentTrack) {
            return;
        }

        const trackId = `${this.currentTrack.category}_${this.currentTrack.fileName}`;
        const isFavorited = this.userDataManager.isFavorite(trackId);

        this.favoriteBtn.innerHTML = isFavorited ? '⭐' : '☆';
        this.favoriteBtn.title = isFavorited ? '取消收藏' : '收藏当前音频';
        this.favoriteBtn.classList.toggle('favorited', isFavorited);
    }

    /**
     * 显示按钮
     */
    showButton() {
        if (this.favoriteBtn) {
            this.favoriteBtn.style.display = 'flex';
        }
    }

    /**
     * 隐藏按钮
     */
    hideButton() {
        if (this.favoriteBtn) {
            this.favoriteBtn.style.display = 'none';
        }
        this.currentTrack = null;
    }

    /**
     * 获取显示名称
     */
    getDisplayName(fileName) {
        return fileName.replace(/\.(mp3|wav|ogg|m4a|wma|flac|aac)$/i, '');
    }

    /**
     * 显示提示消息
     */
    showToast(message) {
        // 检查是否已有toast容器
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

        // 创建toast元素
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

        // 显示动画
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 10);

        // 3秒后淡出并移除
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
}

// 创建全局实例
if (typeof window !== 'undefined') {
    window.FavoriteButtonController = FavoriteButtonController;

    // 等待依赖加载后初始化
    const initFavoriteButton = () => {
        if (window.userDataManager && window.audioManager) {
            window.favoriteButtonController = new FavoriteButtonController(
                window.userDataManager,
                window.audioManager
            );
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initFavoriteButton, 500);
        });
    } else {
        setTimeout(initFavoriteButton, 500);
    }
}
