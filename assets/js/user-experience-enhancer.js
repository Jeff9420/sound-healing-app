/**
 * 用户体验增强器
 * 提供平滑过渡、加载指示器、手势支持和智能交互
 */

class UserExperienceEnhancer {
    constructor() {
        this.isInitialized = false;
        this.touchStartPosition = null;
        this.swipeThreshold = 100;
        this.swipeVelocityThreshold = 0.5;
        this.loadingStates = new Map();
        this.animations = new Map();
        this.hapticSupported = 'vibrate' in navigator;
        this.prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // 用户偏好设置
        this.userPreferences = {
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            highContrast: window.matchMedia('(prefers-contrast: high)').matches,
            animations: true,
            hapticFeedback: true,
            autoPlay: false
        };
        
        this.initializeEnhancer();
    }
    
    initializeEnhancer() {
        this.loadUserPreferences();
        this.setupAccessibilityFeatures();
        this.setupGestureHandlers();
        this.setupSmoothScrolling();
        this.setupLoadingSystem();
        this.setupKeyboardNavigation();
        this.bindMediaQueryListeners();
        
        this.isInitialized = true;
        console.log('✨ 用户体验增强器已初始化');
    }
    
    /**
     * 加载用户偏好设置
     */
    loadUserPreferences() {
        try {
            const stored = localStorage.getItem('userExperiencePrefs');
            if (stored) {
                const prefs = JSON.parse(stored);
                this.userPreferences = { ...this.userPreferences, ...prefs };
                console.log('📖 已加载用户偏好设置');
            }
        } catch (error) {
            console.warn('⚠️ 无法加载用户偏好设置:', error);
        }
    }
    
    /**
     * 保存用户偏好设置
     */
    saveUserPreferences() {
        try {
            localStorage.setItem('userExperiencePrefs', JSON.stringify(this.userPreferences));
        } catch (error) {
            console.warn('⚠️ 无法保存用户偏好设置:', error);
        }
    }
    
    /**
     * 设置无障碍功能
     */
    setupAccessibilityFeatures() {
        // 跳过链接
        this.createSkipLink();
        
        // 焦点指示器
        this.enhanceFocusIndicators();
        
        // 屏幕阅读器支持
        this.setupAriaSupport();
        
        // 键盘陷阱管理
        this.setupFocusTrap();
        
        console.log('♿ 无障碍功能已设置');
    }
    
    /**
     * 创建跳过链接
     */
    createSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = '跳转到主要内容';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            z-index: 10000;
            padding: 8px;
            background: var(--primary-color, #007bff);
            color: white;
            text-decoration: none;
            border-radius: 4px;
            transition: top 0.3s ease;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }
    
    /**
     * 增强焦点指示器
     */
    enhanceFocusIndicators() {
        const style = document.createElement('style');
        style.textContent = `
            .enhanced-focus:focus {
                outline: 3px solid var(--focus-color, #4A90E2) !important;
                outline-offset: 2px !important;
                border-radius: 4px !important;
                box-shadow: 0 0 0 1px rgba(74, 144, 226, 0.3) !important;
            }
            
            .enhanced-focus:focus:not(:focus-visible) {
                outline: none !important;
                box-shadow: none !important;
            }
        `;
        document.head.appendChild(style);
        
        // 为所有可交互元素添加增强焦点
        const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]');
        interactiveElements.forEach(element => {
            element.classList.add('enhanced-focus');
        });
    }
    
    /**
     * 设置ARIA支持
     */
    setupAriaSupport() {
        // 为动态内容添加aria-live区域
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(liveRegion);
        this.liveRegion = liveRegion;
        
        // 添加语言标记
        if (!document.documentElement.lang) {
            document.documentElement.lang = 'zh-CN';
        }
    }
    
    /**
     * 设置焦点陷阱
     */
    setupFocusTrap() {
        this.focusTrapElements = [];
        
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Tab' && this.focusTrapElements.length > 0) {
                const focusableElements = this.getFocusableElements(this.focusTrapElements[0]);
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (event.shiftKey) {
                    if (document.activeElement === firstElement) {
                        event.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        event.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    }
    
    /**
     * 获取可聚焦元素
     */
    getFocusableElements(container) {
        return Array.from(container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )).filter(element => {
            return !element.disabled && element.offsetParent !== null;
        });
    }
    
    /**
     * 设置手势处理
     */
    setupGestureHandlers() {
        // 触摸事件
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
        
        // 鼠标拖拽（用于桌面端）
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        console.log('👆 手势处理已设置');
    }
    
    /**
     * 处理触摸开始
     */
    handleTouchStart(event) {
        if (event.touches.length === 1) {
            this.touchStartPosition = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY,
                time: Date.now()
            };
        }
    }
    
    /**
     * 处理触摸移动
     */
    handleTouchMove(event) {
        if (!this.touchStartPosition || event.touches.length !== 1) return;
        
        const currentTouch = event.touches[0];
        const deltaX = currentTouch.clientX - this.touchStartPosition.x;
        const deltaY = currentTouch.clientY - this.touchStartPosition.y;
        
        // 预处理滑动方向
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
            const direction = deltaX > 0 ? 'right' : 'left';
            this.handleSwipePreview(direction, Math.abs(deltaX));
        }
    }
    
    /**
     * 处理触摸结束
     */
    handleTouchEnd(event) {
        if (!this.touchStartPosition) return;
        
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - this.touchStartPosition.x;
        const deltaY = touch.clientY - this.touchStartPosition.y;
        const deltaTime = Date.now() - this.touchStartPosition.time;
        
        // 计算滑动速度
        const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime;
        
        // 判断是否为有效滑动
        if (Math.abs(deltaX) > this.swipeThreshold && velocity > this.swipeVelocityThreshold) {
            const direction = deltaX > 0 ? 'right' : 'left';
            this.handleSwipe(direction, Math.abs(deltaX), velocity);
        } else if (Math.abs(deltaY) > this.swipeThreshold && velocity > this.swipeVelocityThreshold) {
            const direction = deltaY > 0 ? 'down' : 'up';
            this.handleSwipe(direction, Math.abs(deltaY), velocity);
        }
        
        this.touchStartPosition = null;
        this.resetSwipePreview();
    }
    
    /**
     * 处理滑动预览
     */
    handleSwipePreview(direction, distance) {
        const progress = Math.min(distance / this.swipeThreshold, 1);
        
        window.dispatchEvent(new CustomEvent('swipePreview', {
            detail: { direction, progress, distance }
        }));
    }
    
    /**
     * 重置滑动预览
     */
    resetSwipePreview() {
        window.dispatchEvent(new CustomEvent('swipePreviewEnd'));
    }
    
    /**
     * 处理滑动
     */
    handleSwipe(direction, distance, velocity) {
        this.provideHapticFeedback('light');
        
        window.dispatchEvent(new CustomEvent('swipeGesture', {
            detail: { direction, distance, velocity }
        }));
        
        console.log(`👆 检测到滑动: ${direction}, 距离: ${distance}, 速度: ${velocity}`);
    }
    
    /**
     * 鼠标事件处理（桌面端）
     */
    handleMouseDown(event) {
        if (event.button === 0) { // 左键
            this.mouseStartPosition = {
                x: event.clientX,
                y: event.clientY,
                time: Date.now()
            };
        }
    }
    
    handleMouseMove(event) {
        if (!this.mouseStartPosition) return;
        
        const deltaX = event.clientX - this.mouseStartPosition.x;
        const deltaY = event.clientY - this.mouseStartPosition.y;
        
        if (Math.abs(deltaX) > 30 || Math.abs(deltaY) > 30) {
            const direction = Math.abs(deltaX) > Math.abs(deltaY) 
                ? (deltaX > 0 ? 'right' : 'left')
                : (deltaY > 0 ? 'down' : 'up');
            
            this.handleSwipePreview(direction, Math.max(Math.abs(deltaX), Math.abs(deltaY)));
        }
    }
    
    handleMouseUp(event) {
        if (!this.mouseStartPosition) return;
        
        const deltaX = event.clientX - this.mouseStartPosition.x;
        const deltaY = event.clientY - this.mouseStartPosition.y;
        const deltaTime = Date.now() - this.mouseStartPosition.time;
        const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime;
        
        if ((Math.abs(deltaX) > this.swipeThreshold || Math.abs(deltaY) > this.swipeThreshold) 
            && velocity > this.swipeVelocityThreshold * 0.5) {
            
            const direction = Math.abs(deltaX) > Math.abs(deltaY)
                ? (deltaX > 0 ? 'right' : 'left')
                : (deltaY > 0 ? 'down' : 'up');
            
            this.handleSwipe(direction, Math.max(Math.abs(deltaX), Math.abs(deltaY)), velocity);
        }
        
        this.mouseStartPosition = null;
        this.resetSwipePreview();
    }
    
    /**
     * 设置平滑滚动
     */
    setupSmoothScrolling() {
        // CSS 平滑滚动
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // 自定义平滑滚动函数
        this.smoothScrollTo = (targetY, duration = 800) => {
            const startY = window.pageYOffset;
            const distance = targetY - startY;
            const startTime = performance.now();
            
            const easeInOutCubic = (t) => {
                return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            };
            
            const animateScroll = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const ease = easeInOutCubic(progress);
                
                window.scrollTo(0, startY + distance * ease);
                
                if (progress < 1) {
                    requestAnimationFrame(animateScroll);
                }
            };
            
            requestAnimationFrame(animateScroll);
        };
    }
    
    /**
     * 设置加载系统
     */
    setupLoadingSystem() {
        this.loadingOverlay = this.createLoadingOverlay();
        this.createProgressIndicators();
        
        console.log('⏳ 加载系统已设置');
    }
    
    /**
     * 创建加载覆盖层
     */
    createLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">加载中...</div>
                <div class="loading-progress">
                    <div class="loading-progress-bar"></div>
                </div>
            </div>
        `;
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
            }
            
            .loading-overlay.active {
                opacity: 1;
                visibility: visible;
            }
            
            .loading-content {
                text-align: center;
                color: white;
                max-width: 300px;
            }
            
            .loading-spinner {
                width: 60px;
                height: 60px;
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-top: 4px solid #ffffff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }
            
            .loading-text {
                font-size: 18px;
                margin-bottom: 20px;
            }
            
            .loading-progress {
                width: 200px;
                height: 4px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 2px;
                overflow: hidden;
                margin: 0 auto;
            }
            
            .loading-progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #4A90E2, #7B68EE);
                border-radius: 2px;
                transition: width 0.3s ease;
                width: 0%;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @media (prefers-reduced-motion: reduce) {
                .loading-spinner {
                    animation: none;
                    border: 4px solid #ffffff;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(overlay);
        
        return overlay;
    }
    
    /**
     * 创建进度指示器
     */
    createProgressIndicators() {
        const progressBar = document.createElement('div');
        progressBar.className = 'top-progress-bar';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, #4A90E2, #7B68EE);
            z-index: 9999;
            transition: width 0.3s ease;
            opacity: 0;
        `;
        
        document.body.appendChild(progressBar);
        this.topProgressBar = progressBar;
    }
    
    /**
     * 显示加载状态
     */
    showLoading(text = '加载中...', showProgress = false) {
        const overlay = this.loadingOverlay;
        const textElement = overlay.querySelector('.loading-text');
        const progressElement = overlay.querySelector('.loading-progress');
        
        textElement.textContent = text;
        progressElement.style.display = showProgress ? 'block' : 'none';
        
        overlay.classList.add('active');
        
        // 通知屏幕阅读器
        this.announceToScreenReader(`开始${text}`);
        
        return {
            updateText: (newText) => {
                textElement.textContent = newText;
            },
            updateProgress: (percent) => {
                const bar = overlay.querySelector('.loading-progress-bar');
                bar.style.width = Math.max(0, Math.min(100, percent)) + '%';
            },
            hide: () => this.hideLoading()
        };
    }
    
    /**
     * 隐藏加载状态
     */
    hideLoading() {
        this.loadingOverlay.classList.remove('active');
        this.announceToScreenReader('加载完成');
    }
    
    /**
     * 显示顶部进度条
     */
    showTopProgress(percent = 0) {
        this.topProgressBar.style.opacity = '1';
        this.topProgressBar.style.width = Math.max(0, Math.min(100, percent)) + '%';
    }
    
    /**
     * 隐藏顶部进度条
     */
    hideTopProgress() {
        this.topProgressBar.style.opacity = '0';
        setTimeout(() => {
            this.topProgressBar.style.width = '0%';
        }, 300);
    }
    
    /**
     * 设置键盘导航
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (event) => {
            // ESC键关闭模态框
            if (event.key === 'Escape') {
                this.handleEscapeKey();
            }
            
            // 空格键播放/暂停
            if (event.key === ' ' && event.target === document.body) {
                event.preventDefault();
                this.handleSpaceKey();
            }
            
            // 方向键导航
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
                this.handleArrowKeys(event);
            }
        });
        
        console.log('⌨️ 键盘导航已设置');
    }
    
    /**
     * 处理ESC键
     */
    handleEscapeKey() {
        // 关闭加载覆盖层
        if (this.loadingOverlay.classList.contains('active')) {
            this.hideLoading();
            return;
        }
        
        // 触发ESC事件供其他组件监听
        window.dispatchEvent(new CustomEvent('escapePressed'));
    }
    
    /**
     * 处理空格键
     */
    handleSpaceKey() {
        window.dispatchEvent(new CustomEvent('spacePressed'));
    }
    
    /**
     * 处理方向键
     */
    handleArrowKeys(event) {
        const direction = event.key.replace('Arrow', '').toLowerCase();
        
        window.dispatchEvent(new CustomEvent('arrowKeyPressed', {
            detail: { direction, shiftKey: event.shiftKey, ctrlKey: event.ctrlKey }
        }));
    }
    
    /**
     * 绑定媒体查询监听器
     */
    bindMediaQueryListeners() {
        // 监听暗色模式变化
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeQuery.addListener((event) => {
            this.prefersDarkMode = event.matches;
            this.handleColorSchemeChange(event.matches ? 'dark' : 'light');
        });
        
        // 监听减少动画偏好变化
        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        reducedMotionQuery.addListener((event) => {
            this.userPreferences.reducedMotion = event.matches;
            this.handleMotionPreferenceChange(event.matches);
        });
        
        // 监听高对比度偏好变化
        const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
        highContrastQuery.addListener((event) => {
            this.userPreferences.highContrast = event.matches;
            this.handleContrastPreferenceChange(event.matches);
        });
    }
    
    /**
     * 处理颜色主题变化
     */
    handleColorSchemeChange(scheme) {
        document.documentElement.setAttribute('data-color-scheme', scheme);
        
        window.dispatchEvent(new CustomEvent('colorSchemeChanged', {
            detail: { scheme }
        }));
        
        console.log(`🎨 颜色主题已切换至: ${scheme}`);
    }
    
    /**
     * 处理动画偏好变化
     */
    handleMotionPreferenceChange(reduceMotion) {
        document.documentElement.setAttribute('data-reduce-motion', reduceMotion ? 'true' : 'false');
        
        if (reduceMotion) {
            this.userPreferences.animations = false;
            // 禁用所有动画
            document.body.style.setProperty('--animation-duration', '0.01ms');
        } else {
            this.userPreferences.animations = true;
            document.body.style.removeProperty('--animation-duration');
        }
        
        this.saveUserPreferences();
    }
    
    /**
     * 处理对比度偏好变化
     */
    handleContrastPreferenceChange(highContrast) {
        document.documentElement.setAttribute('data-high-contrast', highContrast ? 'true' : 'false');
        
        window.dispatchEvent(new CustomEvent('contrastPreferenceChanged', {
            detail: { highContrast }
        }));
    }
    
    /**
     * 提供触觉反馈
     */
    provideHapticFeedback(type = 'light') {
        if (!this.hapticSupported || !this.userPreferences.hapticFeedback) {
            return;
        }
        
        const patterns = {
            light: 50,
            medium: 100,
            heavy: 200
        };
        
        if (navigator.vibrate && patterns[type]) {
            navigator.vibrate(patterns[type]);
        }
    }
    
    /**
     * 向屏幕阅读器宣布信息
     */
    announceToScreenReader(message) {
        if (this.liveRegion) {
            this.liveRegion.textContent = message;
            
            // 清理消息
            setTimeout(() => {
                this.liveRegion.textContent = '';
            }, 1000);
        }
    }
    
    /**
     * 添加焦点陷阱
     */
    addFocusTrap(element) {
        if (!this.focusTrapElements.includes(element)) {
            this.focusTrapElements.push(element);
        }
    }
    
    /**
     * 移除焦点陷阱
     */
    removeFocusTrap(element) {
        const index = this.focusTrapElements.indexOf(element);
        if (index > -1) {
            this.focusTrapElements.splice(index, 1);
        }
    }
    
    /**
     * 更新用户偏好
     */
    updateUserPreference(key, value) {
        if (key in this.userPreferences) {
            this.userPreferences[key] = value;
            this.saveUserPreferences();
            
            // 应用偏好设置
            this.applyUserPreference(key, value);
        }
    }
    
    /**
     * 应用用户偏好设置
     */
    applyUserPreference(key, value) {
        switch (key) {
            case 'animations':
                document.documentElement.setAttribute('data-animations', value ? 'true' : 'false');
                break;
            case 'hapticFeedback':
                // 触觉反馈偏好已保存，无需额外操作
                break;
            case 'autoPlay':
                // 自动播放偏好供音频管理器使用
                break;
        }
    }
    
    /**
     * 获取增强器状态
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            userPreferences: { ...this.userPreferences },
            hapticSupported: this.hapticSupported,
            prefersDarkMode: this.prefersDarkMode,
            focusTrapActive: this.focusTrapElements.length > 0,
            loadingActive: this.loadingOverlay.classList.contains('active')
        };
    }
}

// 创建全局实例
window.userExperienceEnhancer = new UserExperienceEnhancer();

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserExperienceEnhancer;
}

console.log('✨ 用户体验增强器已加载');