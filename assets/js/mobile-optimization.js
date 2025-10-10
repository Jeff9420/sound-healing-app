/**
 * 移动端优化模块 - SoundFlows
 * 处理移动端特定的交互和体验优化
 */

class MobileOptimization {
    constructor() {
        this.isMobile = this.detectMobile();
        this.navBar = document.getElementById('mobileNavBar');
        this.mainContent = document.querySelector('.grid');
        this.init();
    }

    detectMobile() {
    // 检测是否为移动设备
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    }

    init() {
        if (this.isMobile || window.innerWidth <= 768) {
            this.enableMobileMode();
        }

        // 监听屏幕尺寸变化
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768) {
                this.enableMobileMode();
            } else {
                this.disableMobileMode();
            }
        });

        // 初始化触摸优化
        this.initTouchOptimization();

        // 初始化手势支持
        this.initGestures();

        // 防止双击缩放
        this.preventDoubleTapZoom();
    }

    enableMobileMode() {
    // 显示移动端导航栏
        if (this.navBar) {
            this.navBar.style.display = 'flex';
        }

        // 为主内容添加滚动容器
        if (this.mainContent && !this.mainContent.classList.contains('scrollable-content')) {
            this.mainContent.classList.add('scrollable-content');
        }

        // 优化音频控件位置
        this.optimizeAudioControls();

        // 调整布局
        this.adjustLayoutForMobile();
    }

    disableMobileMode() {
    // 隐藏移动端导航栏
        if (this.navBar) {
            this.navBar.style.display = 'none';
        }

        // 移除滚动容器
        if (this.mainContent) {
            this.mainContent.classList.remove('scrollable-content');
        }
    }

    initTouchOptimization() {
    // 优化所有按钮的触摸体验
        const buttons = document.querySelectorAll('button, .btn, .track-item, .category-card');
        buttons.forEach(button => {
            // 确保最小触摸区域
            const rect = button.getBoundingClientRect();
            if (rect.width < 44 || rect.height < 44) {
                button.style.minWidth = '44px';
                button.style.minHeight = '44px';
            }

            // 添加触摸反馈
            button.addEventListener('touchstart', () => {
                button.style.transform = 'scale(0.95)';
                button.style.transition = 'transform 0.1s';
            });

            button.addEventListener('touchend', () => {
                button.style.transform = 'scale(1)';
            });
        });

        // 优化进度条触摸体验
        this.initOptimizedProgressBar();
    }

    initOptimizedProgressBar() {
        const progressContainer = document.getElementById('progressContainer');
        if (!progressContainer) {
            return;
        }

        let isDragging = false;

        progressContainer.addEventListener('touchstart', (e) => {
            isDragging = true;
            this.updateProgress(e.touches[0]);
        });

        progressContainer.addEventListener('touchmove', (e) => {
            if (isDragging) {
                e.preventDefault();
                this.updateProgress(e.touches[0]);
            }
        });

        progressContainer.addEventListener('touchend', () => {
            isDragging = false;
        });
    }

    updateProgress(touch) {
        const progressContainer = document.getElementById('progressContainer');
        if (!progressContainer) {
            return;
        }

        const rect = progressContainer.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));

        // 触发进度更新事件
        const event = new CustomEvent('progressUpdate', { detail: { percent } });
        document.dispatchEvent(event);
    }

    initGestures() {
    // 初始化滑动支持
        const carousel = document.querySelector('.theme-selector');
        if (!carousel) {
            return;
        }

        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let isSwiping = false;

        carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isSwiping = true;
        });

        carousel.addEventListener('touchmove', (e) => {
            if (!isSwiping) {
                return;
            }

            currentX = e.touches[0].clientX;
            const deltaX = currentX - startX;
            const deltaY = e.touches[0].clientY - startY;

            // 确保是水平滑动
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                e.preventDefault();
            }
        });

        carousel.addEventListener('touchend', (e) => {
            if (!isSwiping) {
                return;
            }

            const deltaX = currentX - startX;
            const threshold = 50;

            // 左滑或右滑
            if (Math.abs(deltaX) > threshold) {
                if (deltaX > 0) {
                    // 右滑 - 上一个主题
                    document.getElementById('carouselPrev')?.click();
                } else {
                    // 左滑 - 下一个主题
                    document.getElementById('carouselNext')?.click();
                }
            }

            isSwiping = false;
        });
    }

    preventDoubleTapZoom() {
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    optimizeAudioControls() {
    // 将音频控件移动到更好的位置
        const audioController = document.querySelector('.audio-controller');
        if (audioController) {
            // 音频控件已经通过CSS定位在底部
        }

        // 优化播放/暂停按钮
        const playButton = document.querySelector('[data-action="play-pause"]');
        if (playButton) {
            playButton.classList.add('mobile-play-btn');
        }
    }

    adjustLayoutForMobile() {
    // 隐藏或调整某些元素
        const elementsToHide = [
            '.amplitude-visualization', // 移动端可能不需要可视化
            '.healing-tip' // 提示信息
        ];

        elementsToHide.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (window.innerWidth <= 480) {
                    el.style.display = 'none';
                }
            });
        });

        // 调整字体大小
        this.adjustFontSize();
    }

    adjustFontSize() {
        const baseWidth = 375; // iPhone X 宽度
        const currentWidth = window.innerWidth;
        const scale = Math.min(1.2, Math.max(0.8, currentWidth / baseWidth));

        document.documentElement.style.fontSize = `${16 * scale}px`;
    }

    // 显示加载状态
    showLoading() {
        const loading = document.createElement('div');
        loading.className = 'mobile-loading';
        loading.innerHTML = '<div class="loading-spinner"></div>';
        document.body.appendChild(loading);
    }

    // 隐藏加载状态
    hideLoading() {
        const loading = document.querySelector('.mobile-loading');
        if (loading) {
            loading.remove();
        }
    }

    // 处理移动端导航
    handleNavigation(page) {
    // 更新导航栏激活状态
        const navItems = document.querySelectorAll('.mobile-nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });

        // 滚动到对应区域
        switch (page) {
        case 'home':
            window.scrollTo({ top: 0, behavior: 'smooth' });
            break;
        case 'categories':
            document.querySelector('.featured-tracks')?.scrollIntoView({ behavior: 'smooth' });
            break;
        case 'player':
            document.querySelector('.audio-controller')?.scrollIntoView({ behavior: 'smooth' });
            break;
        case 'blog':
            window.location.href = 'content/blog/';
            break;
        case 'more':
        // 显示更多选项
            this.showMoreOptions();
            break;
        }
    }

    showMoreOptions() {
    // 创建更多选项菜单
        const existingMenu = document.querySelector('.mobile-more-menu');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }

        const menu = document.createElement('div');
        menu.className = 'mobile-more-menu';
        menu.innerHTML = `
      <div class="menu-overlay" onclick="this.parentElement.remove()"></div>
      <div class="menu-content">
        <h3>More Options</h3>
        <a href="pages/newsletter/">Newsletter</a>
        <a href="#" onclick="window.shareContent()">Share App</a>
        <a href="#" onclick="window.toggleTheme()">Toggle Theme</a>
        <a href="privacy-policy.html">Privacy Policy</a>
        <a href="terms.html">Terms of Service</a>
        <button class="close-menu" onclick="this.closest('.mobile-more-menu').remove()">Close</button>
      </div>
    `;
        document.body.appendChild(menu);
    }
}

// 初始化移动端优化
document.addEventListener('DOMContentLoaded', () => {
    window.mobileOptimization = new MobileOptimization();

    // 处理移动端导航点击
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            window.mobileOptimization.handleNavigation(page);
        });
    });

    // 添加横屏检测
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            window.mobileOptimization.adjustLayoutForMobile();
        }, 100);
    });
});

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileOptimization;
}