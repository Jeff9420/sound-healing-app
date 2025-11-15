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
            console.error('❌ Player modal not found - #playerModal element missing');
            return;
        }

        console.log('✅ Player modal found:', this.modal);

        // 监听音频播放事件
        window.addEventListener('audioStarted', (e) => {
            console.log('🎵 audioStarted event received:', e.detail);
            this.show();
        });

        // 监听旧的音频播放事件（兼容性）
        window.addEventListener('audioStateChange', (e) => {
            if (e.detail && e.detail.isPlaying) {
                console.log('🎵 audioStateChange event (playing):', e.detail);
                this.show();
            }
        });

        // 监听audio元素的play事件（最后的保险）
        document.addEventListener('play', (e) => {
            if (e.target.tagName === 'AUDIO') {
                console.log('🎵 HTML5 audio play event detected');
                this.show();
            }
        }, true);

        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });

        console.log('✅ Player Modal Controller initialized successfully');
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

        // 记录调用堆栈，找出是谁在关闭播放器
        console.log('❌ Player modal hidden - Called from:');
        console.trace();

        this.modal.classList.remove('show');
        this.modal.setAttribute('aria-hidden', 'true');
        this.isVisible = false;

        // 恢复背景滚动
        document.body.style.overflow = '';
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

// 全局函数 - 手动显示播放器（测试用）
function showPlayer() {
    if (window.playerModalController) {
        window.playerModalController.show();
    }
}

// 创建全局实例
window.playerModalController = new PlayerModalController();

// 添加到全局window对象，方便调试
window.showPlayer = showPlayer;
window.closePlayer = closePlayer;

console.log('🎯 Player Modal Controller loaded. Test with: showPlayer() or closePlayer()');
