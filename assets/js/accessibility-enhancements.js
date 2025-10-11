/**
 * 可访问性增强模块
 * 增强键盘导航和ARIA标签支持
 *
 * @author Sound Healing Team
 * @version 1.0.0
 */

class AccessibilityEnhancements {
    constructor() {
        this.focusableElements = [];
        this.currentFocusIndex = -1;
        this.isKeyboardMode = false;
    }

    /**
     * 初始化可访问性增强
     */
    initialize() {
        this.enhanceARIALabels();
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupSkipLinks();
        this.announcePageLoad();

        console.log('✅ 可访问性增强已初始化');
    }

    /**
     * 增强ARIA标签
     */
    enhanceARIALabels() {
        // 增强音频播放器
        const player = document.getElementById('audioPlayer');
        if (player) {
            player.setAttribute('role', 'region');
            player.setAttribute('aria-label', '音频播放器');
        }

        // 增强播放按钮
        const playPauseBtn = document.getElementById('playPauseBtn');
        if (playPauseBtn) {
            playPauseBtn.setAttribute('aria-label', '播放/暂停');
            playPauseBtn.setAttribute('aria-pressed', 'false');
        }

        // 增强进度条
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.setAttribute('role', 'slider');
            progressBar.setAttribute('aria-label', '音频进度');
            progressBar.setAttribute('aria-valuemin', '0');
            progressBar.setAttribute('aria-valuemax', '100');
            progressBar.setAttribute('aria-valuenow', '0');
            progressBar.setAttribute('tabindex', '0');
        }

        // 增强音量滑块
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            volumeSlider.setAttribute('aria-label', '音量控制');
            volumeSlider.setAttribute('aria-valuetext', volumeSlider.value + '%');
        }

        // 增强分类网格
        const categoryGrid = document.getElementById('categoryGrid');
        if (categoryGrid) {
            categoryGrid.setAttribute('role', 'list');
            categoryGrid.setAttribute('aria-label', '音频分类列表');
        }

        // 增强播放列表模态框
        const playlistModal = document.getElementById('playlistModal');
        if (playlistModal) {
            playlistModal.setAttribute('role', 'dialog');
            playlistModal.setAttribute('aria-modal', 'true');
            playlistModal.setAttribute('aria-labelledby', 'playlistTitle');
        }

        // 增强语言选择器
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.setAttribute('aria-label', '选择语言');
        }

        // 增强功能按钮
        this.enhanceHeaderButtons();
    }

    /**
     * 增强头部按钮的ARIA标签
     */
    enhanceHeaderButtons() {
        const buttons = document.querySelectorAll('.header-icon-btn');
        const labels = {
            '📜': '播放历史',
            '⭐': '我的收藏',
            '🎚️': '音频混音器',
            '📊': '收听统计'
        };

        buttons.forEach(btn => {
            const text = btn.textContent.trim();
            if (labels[text]) {
                btn.setAttribute('aria-label', labels[text]);
                btn.setAttribute('role', 'button');
            }
        });
    }

    /**
     * 设置键盘导航
     */
    setupKeyboardNavigation() {
        // 全局键盘快捷键
        document.addEventListener('keydown', (e) => {
            // 检测是否正在输入
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                return;
            }

            switch(e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    // 空格键或K键: 播放/暂停
                    e.preventDefault();
                    const playBtn = document.getElementById('playPauseBtn');
                    if (playBtn) playBtn.click();
                    break;

                case 'arrowleft':
                case 'j':
                    // 左箭头或J键: 后退10秒
                    e.preventDefault();
                    this.skipBackward(10);
                    break;

                case 'arrowright':
                case 'l':
                    // 右箭头或L键: 前进10秒
                    e.preventDefault();
                    this.skipForward(10);
                    break;

                case 'arrowup':
                    // 上箭头: 增加音量
                    e.preventDefault();
                    this.adjustVolume(5);
                    break;

                case 'arrowdown':
                    // 下箭头: 减少音量
                    e.preventDefault();
                    this.adjustVolume(-5);
                    break;

                case 'm':
                    // M键: 静音/取消静音
                    e.preventDefault();
                    this.toggleMute();
                    break;

                case 'n':
                    // N键: 下一首
                    e.preventDefault();
                    if (typeof nextTrack === 'function') nextTrack();
                    break;

                case 'p':
                    // P键: 上一首
                    e.preventDefault();
                    if (typeof previousTrack === 'function') previousTrack();
                    break;

                case 's':
                    // S键: 随机播放
                    e.preventDefault();
                    if (typeof toggleShuffle === 'function') toggleShuffle();
                    break;

                case 'r':
                    // R键: 循环播放
                    e.preventDefault();
                    if (typeof toggleRepeat === 'function') toggleRepeat();
                    break;

                case 'escape':
                    // Esc键: 关闭模态框
                    this.closeModals();
                    break;

                case 'tab':
                    // Tab键: 标记键盘模式
                    this.isKeyboardMode = true;
                    document.body.classList.add('keyboard-mode');
                    break;

                case '?':
                    // ?键: 显示快捷键帮助
                    e.preventDefault();
                    this.showKeyboardShortcuts();
                    break;
            }
        });

        // 鼠标点击时退出键盘模式
        document.addEventListener('mousedown', () => {
            this.isKeyboardMode = false;
            document.body.classList.remove('keyboard-mode');
        });
    }

    /**
     * 设置焦点管理
     */
    setupFocusManagement() {
        // 模态框打开时，焦点转移到模态框
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'style' || mutation.attributeName === 'class') {
                    const modal = document.getElementById('playlistModal');
                    if (modal && modal.style.display === 'block') {
                        const closeBtn = modal.querySelector('.close');
                        if (closeBtn) {
                            setTimeout(() => closeBtn.focus(), 100);
                        }
                    }
                }
            });
        });

        const playlistModal = document.getElementById('playlistModal');
        if (playlistModal) {
            observer.observe(playlistModal, {
                attributes: true,
                attributeFilter: ['style', 'class']
            });
        }

        // 在模态框内循环焦点
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const modal = document.getElementById('playlistModal');
                if (modal && modal.style.display === 'block') {
                    this.trapFocusInModal(e, modal);
                }
            }
        });
    }

    /**
     * 在模态框内困住焦点
     */
    trapFocusInModal(event, modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    }

    /**
     * 设置跳转链接
     */
    setupSkipLinks() {
        const skipLink = document.createElement('a');
        skipLink.href = '#categoryGrid';
        skipLink.className = 'skip-link';
        skipLink.textContent = '跳转到主内容';
        skipLink.setAttribute('aria-label', '跳过导航，直接到音频分类');

        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    /**
     * 宣布页面加载完成
     */
    announcePageLoad() {
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('role', 'status');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'aria-live-region';

        document.body.appendChild(liveRegion);

        // 页面加载完成后宣布
        window.addEventListener('load', () => {
            this.announce('声音疗愈空间已加载完成，准备开始疗愈之旅');
        });
    }

    /**
     * 宣布消息给屏幕阅读器
     */
    announce(message, priority = 'polite') {
        const liveRegion = document.getElementById('aria-live-region');
        if (liveRegion) {
            liveRegion.setAttribute('aria-live', priority);
            liveRegion.textContent = message;

            // 清空消息，准备下次宣布
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    /**
     * 后退指定秒数
     */
    skipBackward(seconds) {
        if (typeof window.audioManager !== 'undefined' && window.audioManager.currentAudio) {
            const audio = window.audioManager.currentAudio;
            audio.currentTime = Math.max(0, audio.currentTime - seconds);
            this.announce(`后退${seconds}秒`);
        }
    }

    /**
     * 前进指定秒数
     */
    skipForward(seconds) {
        if (typeof window.audioManager !== 'undefined' && window.audioManager.currentAudio) {
            const audio = window.audioManager.currentAudio;
            audio.currentTime = Math.min(audio.duration, audio.currentTime + seconds);
            this.announce(`前进${seconds}秒`);
        }
    }

    /**
     * 调整音量
     */
    adjustVolume(delta) {
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            const newValue = Math.max(0, Math.min(100, parseInt(volumeSlider.value) + delta));
            volumeSlider.value = newValue;
            volumeSlider.dispatchEvent(new Event('change'));
            volumeSlider.setAttribute('aria-valuetext', newValue + '%');
            this.announce(`音量 ${newValue}%`);
        }
    }

    /**
     * 切换静音
     */
    toggleMute() {
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            if (!this.previousVolume) {
                this.previousVolume = volumeSlider.value;
                volumeSlider.value = 0;
                this.announce('已静音');
            } else {
                volumeSlider.value = this.previousVolume;
                this.previousVolume = null;
                this.announce(`取消静音，音量 ${volumeSlider.value}%`);
            }
            volumeSlider.dispatchEvent(new Event('change'));
        }
    }

    /**
     * 关闭所有模态框
     */
    closeModals() {
        const modals = document.querySelectorAll('.playlist-modal, .timer-modal');
        modals.forEach(modal => {
            if (modal.style.display === 'block' || modal.style.display === '') {
                modal.style.display = 'none';
            }
        });
        this.announce('已关闭对话框');
    }

    /**
     * 显示键盘快捷键帮助
     */
    showKeyboardShortcuts() {
        const shortcuts = `
            键盘快捷键：

            空格/K - 播放/暂停
            N - 下一首
            P - 上一首
            S - 随机播放
            R - 循环播放
            M - 静音/取消静音
            ↑ - 增加音量
            ↓ - 减少音量
            → / L - 前进10秒
            ← / J - 后退10秒
            Esc - 关闭对话框
            ? - 显示此帮助
        `;

        this.announce('键盘快捷键帮助已打开');
        alert(shortcuts);
    }
}

// 创建全局实例并初始化
if (typeof window !== 'undefined') {
    window.accessibilityEnhancements = new AccessibilityEnhancements();

    // DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.accessibilityEnhancements.initialize();
        });
    } else {
        window.accessibilityEnhancements.initialize();
    }
}
