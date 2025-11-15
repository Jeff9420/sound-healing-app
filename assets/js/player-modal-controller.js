/**
 * Player Modal Controller - 弹窗播放器控制
 * 控制播放器的显示/隐藏逻辑
 */

class PlayerModalController {
    constructor() {
        this.modal = null;
        this.isVisible = false;
        this.init();
    }

    init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.modal = document.getElementById('playerModal');
        if (!this.modal) {
            console.error('Player modal not found');
            return;
        }

        // 监听音频播放事件
        window.addEventListener('audioStarted', () => this.show());

        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });

        console.log('Player Modal Controller initialized');
    }

    /**
     * 显示播放器弹窗
     */
    show() {
        if (!this.modal) return;

        this.modal.classList.add('show');
        this.modal.setAttribute('aria-hidden', 'false');
        this.isVisible = true;

        // 防止背景滚动
        document.body.style.overflow = 'hidden';

        console.log('Player modal shown');
    }

    /**
     * 隐藏播放器弹窗
     */
    hide() {
        if (!this.modal) return;

        this.modal.classList.remove('show');
        this.modal.setAttribute('aria-hidden', 'true');
        this.isVisible = false;

        // 恢复背景滚动
        document.body.style.overflow = '';

        console.log('Player modal hidden');
    }

    /**
     * 切换显示/隐藏
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}

// 全局函数 - 关闭播放器
function closePlayer() {
    if (window.playerModalController) {
        window.playerModalController.hide();
    }
}

// 创建全局实例
window.playerModalController = new PlayerModalController();
