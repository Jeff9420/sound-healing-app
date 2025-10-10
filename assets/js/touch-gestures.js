/**
 * TouchGestures - 移动端触摸手势管理器
 *
 * 提供以下功能:
 * - 左右滑动切歌
 * - 双击暂停/播放
 * - 上下滑动调整音量
 * - 长按显示菜单
 *
 * @class
 * @author Sound Healing Team
 * @version 1.0.0
 */

class TouchGestures {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.isEnabled = this.isTouchDevice();

        // 触摸状态
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchStartTime = 0;
        this.lastTapTime = 0;
        this.isLongPressing = false;
        this.longPressTimer = null;

        // 配置
        this.config = {
            swipeThreshold: 50, // 滑动阈值（像素）
            swipeTimeout: 300, // 滑动超时（毫秒）
            doubleTapDelay: 300, // 双击延迟（毫秒）
            longPressDelay: 500, // 长按延迟（毫秒）
            volumeStep: 5 // 音量调节步进
        };

        if (this.isEnabled) {
            this.initialize();
        }
    }

    /**
     * 检测是否为触摸设备
     */
    isTouchDevice() {
        return ('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0) ||
               (navigator.msMaxTouchPoints > 0);
    }

    /**
     * 初始化触摸事件
     */
    initialize() {
        // 获取音频播放器元素
        const player = document.getElementById('audioPlayer');

        if (!player) {
            console.warn('⚠️ 未找到音频播放器元素');
            return;
        }

        // 绑定触摸事件
        player.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        player.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        player.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        player.addEventListener('touchcancel', this.handleTouchCancel.bind(this));

        // 添加CSS类标识
        document.body.classList.add('touch-enabled');

        console.log('✅ TouchGestures 已初始化');
    }

    /**
     * 触摸开始
     */
    handleTouchStart(e) {
        const touch = e.touches[0];

        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.touchStartTime = Date.now();

        // 检测双击
        const timeSinceLastTap = Date.now() - this.lastTapTime;
        if (timeSinceLastTap < this.config.doubleTapDelay) {
            this.handleDoubleTap(e);
            this.lastTapTime = 0; // 重置以避免三击
        } else {
            this.lastTapTime = Date.now();
        }

        // 启动长按检测
        this.startLongPressTimer(e);
    }

    /**
     * 触摸移动
     */
    handleTouchMove(e) {
        // 如果正在长按，取消它
        if (this.isLongPressing) {
            this.cancelLongPress();
        }

        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }

        const touch = e.touches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;

        // 检测是否主要是垂直滑动（调节音量）
        if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 30) {
            e.preventDefault(); // 防止页面滚动
            this.handleVolumeGesture(deltaY);
        }
    }

    /**
     * 触摸结束
     */
    handleTouchEnd(e) {
        // 取消长按计时器
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }

        if (this.isLongPressing) {
            this.isLongPressing = false;
            return;
        }

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;
        const deltaTime = Date.now() - this.touchStartTime;

        // 检测水平滑动（切歌）
        if (deltaTime < this.config.swipeTimeout &&
            Math.abs(deltaX) > this.config.swipeThreshold &&
            Math.abs(deltaX) > Math.abs(deltaY)) {

            if (deltaX > 0) {
                this.handleSwipeRight();
            } else {
                this.handleSwipeLeft();
            }
        }
    }

    /**
     * 触摸取消
     */
    handleTouchCancel() {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
        this.isLongPressing = false;
    }

    /**
     * 启动长按计时器
     */
    startLongPressTimer(e) {
        this.longPressTimer = setTimeout(() => {
            this.isLongPressing = true;
            this.handleLongPress(e);
        }, this.config.longPressDelay);
    }

    /**
     * 取消长按
     */
    cancelLongPress() {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
        this.isLongPressing = false;
    }

    /**
     * 处理双击 - 暂停/播放
     */
    handleDoubleTap(e) {
        e.preventDefault();

        if (this.audioManager && this.audioManager.currentAudio) {
            if (this.audioManager.currentAudio.paused) {
                this.audioManager.resumeCurrentTrack();
                this.showFeedback('▶️ 播放');
            } else {
                const currentTrack = this.audioManager.getCurrentTrack();
                if (currentTrack) {
                    this.audioManager.pauseTrack(currentTrack.trackId);
                    this.showFeedback('⏸️ 暂停');
                }
            }
        }
    }

    /**
     * 处理向左滑动 - 下一首
     */
    handleSwipeLeft() {
        if (this.audioManager && typeof this.audioManager.nextTrack === 'function') {
            this.audioManager.nextTrack();
            this.showFeedback('⏭️ 下一首');
        }
    }

    /**
     * 处理向右滑动 - 上一首
     */
    handleSwipeRight() {
        if (this.audioManager && typeof this.audioManager.previousTrack === 'function') {
            this.audioManager.previousTrack();
            this.showFeedback('⏮️ 上一首');
        }
    }

    /**
     * 处理音量手势
     */
    handleVolumeGesture(deltaY) {
        if (!this.audioManager || !this.audioManager.currentAudio) {
            return;
        }

        // 向上滑动增加音量，向下滑动减少音量
        const volumeChange = -deltaY / 300; // 标准化到0-1范围
        let newVolume = this.audioManager.globalVolume + volumeChange;

        // 限制在0-1范围内
        newVolume = Math.max(0, Math.min(1, newVolume));

        // 更新音量（如果有全局音量控制函数）
        if (typeof window.changeVolume === 'function') {
            window.changeVolume(newVolume * 100);
        } else {
            this.audioManager.setVolume(newVolume);
        }
    }

    /**
     * 处理长按 - 显示菜单
     */
    handleLongPress(e) {
        e.preventDefault();

        // 震动反馈（如果支持）
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }

        // 打开历史/收藏菜单
        if (window.historyFavoritesUI) {
            window.historyFavoritesUI.openPanel('favorites');
        }

        this.showFeedback('⭐ 收藏菜单');
    }

    /**
     * 显示手势反馈
     */
    showFeedback(message) {
        // 创建临时反馈元素
        let feedback = document.getElementById('gestureFeedback');

        if (!feedback) {
            feedback = document.createElement('div');
            feedback.id = 'gestureFeedback';
            feedback.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 20px 30px;
                border-radius: 15px;
                font-size: 24px;
                font-weight: bold;
                z-index: 99999;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
                backdrop-filter: blur(10px);
            `;
            document.body.appendChild(feedback);
        }

        feedback.textContent = message;
        feedback.style.opacity = '1';

        // 自动隐藏
        setTimeout(() => {
            feedback.style.opacity = '0';
        }, 1000);
    }

    /**
     * 禁用触摸手势
     */
    disable() {
        this.isEnabled = false;
        const player = document.getElementById('audioPlayer');
        if (player) {
            player.removeEventListener('touchstart', this.handleTouchStart);
            player.removeEventListener('touchmove', this.handleTouchMove);
            player.removeEventListener('touchend', this.handleTouchEnd);
            player.removeEventListener('touchcancel', this.handleTouchCancel);
        }
        document.body.classList.remove('touch-enabled');
    }

    /**
     * 启用触摸手势
     */
    enable() {
        if (this.isTouchDevice() && !this.isEnabled) {
            this.isEnabled = true;
            this.initialize();
        }
    }
}

// 创建全局实例
if (typeof window !== 'undefined') {
    window.TouchGestures = TouchGestures;

    // 等待audioManager加载后初始化
    if (window.audioManager) {
        window.touchGestures = new TouchGestures(window.audioManager);
        console.log('✅ TouchGestures 已创建');
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            // 尝试多次查找audioManager
            const checkAudioManager = setInterval(() => {
                if (window.audioManager) {
                    window.touchGestures = new TouchGestures(window.audioManager);
                    console.log('✅ TouchGestures 已创建');
                    clearInterval(checkAudioManager);
                }
            }, 500);

            // 10秒后停止尝试
            setTimeout(() => clearInterval(checkAudioManager), 10000);
        });
    }
}
