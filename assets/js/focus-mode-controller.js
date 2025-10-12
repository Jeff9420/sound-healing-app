/**
 * FocusModeController - 专注模式控制器
 *
 * 功能：
 * 1. 提供极简的专注播放体验
 * 2. 全屏视频背景
 * 3. 隐藏非必要UI元素
 * 4. 仅显示播放/暂停按钮
 * 5. ESC键退出专注模式
 *
 * 设计哲学：
 * "少即是多" - 减少干扰，促进专注
 *
 * @version 2.0.0
 * @date 2025-10-12
 */

class FocusModeController {
    constructor() {
        // 状态管理
        this.isActive = false;
        this.savedScrollPosition = 0;

        // DOM 元素
        this.appContainer = null;
        this.focusModeOverlay = null;
        this.focusControls = null;

        // 配置
        this.config = {
            autoHideDelay: 3000, // 鼠标静止3秒后隐藏控制栏
            fadeOutDuration: 500  // 淡出动画时长
        };

        // 定时器
        this.autoHideTimer = null;
        this.mouseMoveHandler = null;

        this.init();
    }

    /**
     * 初始化专注模式控制器
     */
    init() {
        console.log('🎯 初始化专注模式控制器...');

        // 获取DOM元素
        this.appContainer = document.getElementById('app');

        if (!this.appContainer) {
            console.error('❌ 找不到App容器');
            return;
        }

        // 创建专注模式覆盖层
        this.createFocusModeOverlay();

        // 监听键盘事件（ESC退出）
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isActive) {
                this.toggle();
            }
        });

        // 监听全屏变化
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement && this.isActive) {
                // 退出全屏时也退出专注模式
                this.deactivate();
            }
        });

        console.log('✅ 专注模式控制器初始化完成');
    }

    /**
     * 创建专注模式覆盖层
     */
    createFocusModeOverlay() {
        // 创建覆盖层容器
        this.focusModeOverlay = document.createElement('div');
        this.focusModeOverlay.id = 'focusModeOverlay';
        this.focusModeOverlay.className = 'focus-mode-overlay';
        this.focusModeOverlay.style.display = 'none';

        // 创建中央播放按钮
        const centerPlayButton = document.createElement('button');
        centerPlayButton.className = 'focus-center-play-btn';
        centerPlayButton.innerHTML = '▶️';
        centerPlayButton.onclick = () => {
            // 调用全局的togglePlayPause函数
            if (typeof window.togglePlayPause === 'function') {
                window.togglePlayPause();
                this.updateCenterButton();
            }
        };

        // 创建底部迷你控制栏
        const miniControls = document.createElement('div');
        miniControls.className = 'focus-mini-controls';
        miniControls.innerHTML = `
            <div class="focus-track-info">
                <div class="focus-track-title">未播放</div>
                <div class="focus-track-category"></div>
            </div>
            <div class="focus-control-buttons">
                <button class="focus-btn" onclick="previousTrack()">⏮️</button>
                <button class="focus-btn focus-play-btn" onclick="window.togglePlayPause(); window.focusModeController.updateCenterButton()">▶️</button>
                <button class="focus-btn" onclick="nextTrack()">⏭️</button>
            </div>
            <div class="focus-volume-control">
                <span>🔊</span>
                <input type="range" class="focus-volume-slider" min="0" max="100" value="70"
                       onchange="changeVolume(this.value)">
            </div>
            <button class="focus-exit-btn" onclick="window.focusModeController.toggle()" title="退出专注模式 (ESC)">
                ✖️ 退出
            </button>
        `;

        // 创建提示文字
        const hintText = document.createElement('div');
        hintText.className = 'focus-hint-text';
        hintText.textContent = '移动鼠标显示控制栏 • 按 ESC 退出专注模式';

        // 组装覆盖层
        this.focusModeOverlay.appendChild(centerPlayButton);
        this.focusModeOverlay.appendChild(miniControls);
        this.focusModeOverlay.appendChild(hintText);

        // 添加到页面
        document.body.appendChild(this.focusModeOverlay);

        // 绑定鼠标移动事件（显示/隐藏控制栏）
        this.setupAutoHide();
    }

    /**
     * 设置自动隐藏控制栏
     */
    setupAutoHide() {
        this.mouseMoveHandler = () => {
            if (!this.isActive) return;

            // 显示控制栏和提示文字
            const miniControls = this.focusModeOverlay.querySelector('.focus-mini-controls');
            const hintText = this.focusModeOverlay.querySelector('.focus-hint-text');

            if (miniControls) miniControls.classList.add('show');
            if (hintText) hintText.classList.add('show');

            // 显示鼠标指针
            this.focusModeOverlay.style.cursor = 'default';

            // 清除之前的定时器
            if (this.autoHideTimer) {
                clearTimeout(this.autoHideTimer);
            }

            // 设置新的定时器
            this.autoHideTimer = setTimeout(() => {
                if (miniControls) miniControls.classList.remove('show');
                if (hintText) hintText.classList.remove('show');
                this.focusModeOverlay.style.cursor = 'none';
            }, this.config.autoHideDelay);
        };

        document.addEventListener('mousemove', this.mouseMoveHandler);
    }

    /**
     * 切换专注模式
     */
    toggle() {
        if (this.isActive) {
            this.deactivate();
        } else {
            this.activate();
        }
    }

    /**
     * 激活专注模式
     */
    async activate() {
        console.log('🎯 激活专注模式');

        this.isActive = true;

        // 保存当前滚动位置
        this.savedScrollPosition = window.scrollY;

        // 隐藏主要UI元素
        this.appContainer.classList.add('focus-mode-active');

        // 显示专注模式覆盖层
        this.focusModeOverlay.style.display = 'flex';

        // 淡入动画
        requestAnimationFrame(() => {
            this.focusModeOverlay.classList.add('active');
        });

        // 更新播放按钮状态
        this.updateCenterButton();
        this.updateMiniControlsInfo();

        // 尝试进入全屏
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }
        } catch (error) {
            console.log('⚠️ 无法进入全屏模式:', error);
            // 不强制全屏，继续专注模式
        }

        // 触发鼠标移动以显示控制栏
        this.mouseMoveHandler();

        // 跟踪事件
        if (typeof window.trackFocusMode === 'function') {
            window.trackFocusMode('activate');
        }

        console.log('✅ 专注模式已激活');
    }

    /**
     * 退出专注模式
     */
    async deactivate() {
        console.log('🎯 退出专注模式');

        this.isActive = false;

        // 淡出动画
        this.focusModeOverlay.classList.remove('active');

        // 等待动画完成后隐藏
        setTimeout(() => {
            this.focusModeOverlay.style.display = 'none';
            this.appContainer.classList.remove('focus-mode-active');
        }, this.config.fadeOutDuration);

        // 退出全屏
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.log('⚠️ 退出全屏失败:', error);
        }

        // 恢复滚动位置
        window.scrollTo(0, this.savedScrollPosition);

        // 清除自动隐藏定时器
        if (this.autoHideTimer) {
            clearTimeout(this.autoHideTimer);
        }

        // 跟踪事件
        if (typeof window.trackFocusMode === 'function') {
            window.trackFocusMode('deactivate');
        }

        console.log('✅ 已退出专注模式');
    }

    /**
     * 更新中央播放按钮状态
     */
    updateCenterButton() {
        const centerBtn = this.focusModeOverlay.querySelector('.focus-center-play-btn');
        const miniPlayBtn = this.focusModeOverlay.querySelector('.focus-play-btn');

        // 获取全局播放状态（假设有全局audioManager）
        const isPlaying = window.audioManager && window.audioManager.isPlaying;

        if (centerBtn) {
            centerBtn.innerHTML = isPlaying ? '⏸️' : '▶️';
        }

        if (miniPlayBtn) {
            miniPlayBtn.innerHTML = isPlaying ? '⏸️' : '▶️';
        }
    }

    /**
     * 更新迷你控制栏信息
     */
    updateMiniControlsInfo() {
        const trackTitle = this.focusModeOverlay.querySelector('.focus-track-title');
        const trackCategory = this.focusModeOverlay.querySelector('.focus-track-category');

        // 从全局获取当前播放信息
        const currentTrackEl = document.getElementById('currentTrack');
        const currentCategoryEl = document.getElementById('currentCategory');

        if (trackTitle && currentTrackEl) {
            trackTitle.textContent = currentTrackEl.textContent || '未播放';
        }

        if (trackCategory && currentCategoryEl) {
            trackCategory.textContent = currentCategoryEl.textContent || '';
        }

        // 同步音量滑块
        const focusVolumeSlider = this.focusModeOverlay.querySelector('.focus-volume-slider');
        const mainVolumeSlider = document.getElementById('volumeSlider');

        if (focusVolumeSlider && mainVolumeSlider) {
            focusVolumeSlider.value = mainVolumeSlider.value;
        }
    }

    /**
     * 监听音频状态变化
     */
    onAudioStateChange() {
        if (this.isActive) {
            this.updateCenterButton();
            this.updateMiniControlsInfo();
        }
    }

    /**
     * 获取当前状态
     */
    getStatus() {
        return {
            isActive: this.isActive,
            isFullscreen: !!document.fullscreenElement
        };
    }

    /**
     * 销毁控制器
     */
    destroy() {
        // 退出专注模式
        if (this.isActive) {
            this.deactivate();
        }

        // 移除事件监听
        if (this.mouseMoveHandler) {
            document.removeEventListener('mousemove', this.mouseMoveHandler);
        }

        // 移除DOM元素
        if (this.focusModeOverlay && this.focusModeOverlay.parentNode) {
            this.focusModeOverlay.parentNode.removeChild(this.focusModeOverlay);
        }

        console.log('🧹 专注模式控制器已销毁');
    }
}

// 自动初始化
let focusModeController;

// 等待DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        focusModeController = new FocusModeController();
        window.focusModeController = focusModeController;

        // 监听音频状态变化
        window.addEventListener('audioStateChange', () => {
            if (focusModeController) {
                focusModeController.onAudioStateChange();
            }
        });
    });
} else {
    focusModeController = new FocusModeController();
    window.focusModeController = focusModeController;

    // 监听音频状态变化
    window.addEventListener('audioStateChange', () => {
        if (focusModeController) {
            focusModeController.onAudioStateChange();
        }
    });
}

// 添加Google Analytics事件追踪
window.trackFocusMode = function(action) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'focus_mode', {
            'event_category': 'Feature',
            'event_label': action,
            'value': action === 'activate' ? 1 : 0
        });
    }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FocusModeController;
}
