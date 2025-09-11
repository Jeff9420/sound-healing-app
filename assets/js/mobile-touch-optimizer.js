/**
 * 移动端触摸优化器
 * 专为移动设备优化的触摸交互和界面适配
 */

class MobileTouchOptimizer {
    constructor() {
        this.isMobile = this.detectMobileDevice();
        this.touchStartTime = 0;
        this.touchStartPosition = null;
        this.isScrolling = false;
        this.gestureInProgress = false;
        this.vibrationSupported = 'vibrate' in navigator;
        
        // 触摸配置
        this.touchConfig = {
            tapThreshold: 10,
            longPressDelay: 500,
            swipeThreshold: 80,
            swipeVelocityThreshold: 0.5,
            scrollThreshold: 15,
            doubleTapInterval: 300
        };
        
        // 防止误触配置
        this.preventAccidental = {
            enabled: true,
            edgeBuffer: 20, // px
            minimumTouchTime: 50 // ms
        };
        
        this.lastTap = 0;
        this.doubleTapTimeout = null;
        
        this.initializeOptimizer();
    }
    
    initializeOptimizer() {
        if (this.isMobile) {
            this.setupMobileViewport();
            this.setupTouchEnhancements();
            this.setupGestureHandlers();
            this.setupMobileUIAdaptations();
            this.setupPerformanceOptimizations();
            console.log('📱 移动端触摸优化器已启用');
        } else {
            this.setupDesktopFallbacks();
            console.log('🖥️ 桌面端模式，触摸优化器已加载');
        }
    }
    
    /**
     * 检测移动设备
     */
    detectMobileDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'opera mini'];
        
        const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isSmallScreen = window.innerWidth <= 768;
        
        return isMobileUA || (isTouchDevice && isSmallScreen);
    }
    
    /**
     * 设置移动端视口
     */
    setupMobileViewport() {
        // 更新viewport meta标签
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }
        
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover';
        
        // 防止双击缩放在某些元素上
        const style = document.createElement('style');
        style.textContent = `
            .no-zoom {
                touch-action: manipulation;
            }
            
            /* 移动端优化样式 */
            @media (max-width: 768px) {
                body {
                    -webkit-user-select: none;
                    -webkit-touch-callout: none;
                    -webkit-tap-highlight-color: transparent;
                }
                
                .touch-target {
                    min-height: 44px;
                    min-width: 44px;
                    padding: 8px;
                }
                
                .audio-controls button {
                    min-height: 48px;
                    min-width: 48px;
                    font-size: 18px;
                }
                
                .playlist-item {
                    padding: 16px 12px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                
                .volume-slider {
                    height: 6px;
                }
                
                .volume-slider::-webkit-slider-thumb {
                    height: 24px;
                    width: 24px;
                }
                
                /* 触摸反馈 */
                .touch-feedback {
                    position: relative;
                    overflow: hidden;
                }
                
                .touch-feedback::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.3);
                    transform: translate(-50%, -50%);
                    transition: width 0.3s ease, height 0.3s ease;
                    pointer-events: none;
                }
                
                .touch-feedback.active::after {
                    width: 100px;
                    height: 100px;
                }
                
                /* 手势提示 */
                .gesture-hint {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 14px;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    z-index: 1000;
                }
                
                .gesture-hint.show {
                    opacity: 1;
                }
                
                /* 移动端播放列表优化 */
                .mobile-playlist {
                    max-height: 60vh;
                    overflow-y: auto;
                    -webkit-overflow-scrolling: touch;
                }
                
                .mobile-playlist .playlist-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                .mobile-playlist .track-info {
                    flex: 1;
                    min-width: 0;
                }
                
                .mobile-playlist .track-name {
                    font-size: 16px;
                    font-weight: 500;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .mobile-playlist .track-actions {
                    display: flex;
                    gap: 8px;
                    margin-left: 12px;
                }
                
                /* 移动端控制条 */
                .mobile-controls {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(135deg, rgba(0,0,0,0.9), rgba(0,0,0,0.8));
                    padding: 16px 20px;
                    backdrop-filter: blur(10px);
                    border-top: 1px solid rgba(255,255,255,0.1);
                    z-index: 900;
                }
                
                .mobile-controls .progress-container {
                    margin-bottom: 16px;
                }
                
                .mobile-controls .control-buttons {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 20px;
                }
                
                .mobile-controls .play-pause-btn {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    color: white;
                    font-size: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
                }
                
                .mobile-controls .control-btn {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    color: white;
                    font-size: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * 设置触摸增强
     */
    setupTouchEnhancements() {
        // 为所有可点击元素添加触摸反馈
        const clickableElements = document.querySelectorAll('button, .playlist-item, .category-item, a[href], .clickable');
        
        clickableElements.forEach(element => {
            this.enhanceElementForTouch(element);
        });
        
        // 监听新元素的添加
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        const clickableElements = node.querySelectorAll('button, .playlist-item, .category-item, a[href], .clickable');
                        clickableElements.forEach(element => {
                            this.enhanceElementForTouch(element);
                        });
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * 增强元素的触摸体验
     */
    enhanceElementForTouch(element) {
        if (element.hasAttribute('data-touch-enhanced')) return;
        
        element.setAttribute('data-touch-enhanced', 'true');
        element.classList.add('touch-target', 'touch-feedback');
        
        let touchStartTime = 0;
        let touchStartPos = null;
        let longPressTimer = null;
        
        // 触摸开始
        element.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            touchStartPos = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
            
            element.classList.add('active');
            this.provideTactileFeedback('light');
            
            // 长按检测
            longPressTimer = setTimeout(() => {
                this.handleLongPress(element, e);
            }, this.touchConfig.longPressDelay);
        }, { passive: true });
        
        // 触摸移动
        element.addEventListener('touchmove', (e) => {
            if (!touchStartPos) return;
            
            const currentPos = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
            
            const distance = Math.sqrt(
                Math.pow(currentPos.x - touchStartPos.x, 2) +
                Math.pow(currentPos.y - touchStartPos.y, 2)
            );
            
            if (distance > this.touchConfig.tapThreshold) {
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
                element.classList.remove('active');
            }
        }, { passive: true });
        
        // 触摸结束
        element.addEventListener('touchend', (e) => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            
            element.classList.remove('active');
            
            const touchDuration = Date.now() - touchStartTime;
            if (touchDuration < this.preventAccidental.minimumTouchTime) {
                return; // 防止误触
            }
            
            // 检测双击
            const now = Date.now();
            if (now - this.lastTap < this.touchConfig.doubleTapInterval) {
                if (this.doubleTapTimeout) {
                    clearTimeout(this.doubleTapTimeout);
                    this.doubleTapTimeout = null;
                }
                this.handleDoubleTap(element, e);
            } else {
                this.doubleTapTimeout = setTimeout(() => {
                    this.handleSingleTap(element, e);
                }, this.touchConfig.doubleTapInterval);
            }
            
            this.lastTap = now;
        }, { passive: true });
        
        // 触摸取消
        element.addEventListener('touchcancel', () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            element.classList.remove('active');
        }, { passive: true });
    }
    
    /**
     * 设置手势处理
     */
    setupGestureHandlers() {
        let gestureStart = null;
        let gestureDistance = 0;
        let gestureAngle = 0;
        
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                gestureStart = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY,
                    time: Date.now()
                };
            }
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1 && gestureStart) {
                const currentTouch = e.touches[0];
                const deltaX = currentTouch.clientX - gestureStart.x;
                const deltaY = currentTouch.clientY - gestureStart.y;
                
                gestureDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                gestureAngle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
                
                // 预览手势
                if (gestureDistance > this.touchConfig.swipeThreshold * 0.3) {
                    this.previewGesture(deltaX, deltaY, gestureDistance);
                }
                
                // 判断是否在滚动
                if (!this.isScrolling && gestureDistance > this.touchConfig.scrollThreshold) {
                    const absX = Math.abs(deltaX);
                    const absY = Math.abs(deltaY);
                    this.isScrolling = absY > absX;
                }
            }
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (gestureStart && !this.isScrolling) {
                const deltaTime = Date.now() - gestureStart.time;
                const velocity = gestureDistance / deltaTime;
                
                if (gestureDistance > this.touchConfig.swipeThreshold && velocity > this.touchConfig.swipeVelocityThreshold) {
                    this.handleSwipeGesture(gestureAngle, gestureDistance, velocity);
                }
            }
            
            // 重置状态
            gestureStart = null;
            gestureDistance = 0;
            gestureAngle = 0;
            this.isScrolling = false;
            this.hideGesturePreview();
        }, { passive: true });
    }
    
    /**
     * 预览手势
     */
    previewGesture(deltaX, deltaY, distance) {
        const direction = this.getSwipeDirection(Math.atan2(deltaY, deltaX) * 180 / Math.PI);
        const progress = Math.min(distance / this.touchConfig.swipeThreshold, 1);
        
        window.dispatchEvent(new CustomEvent('gesturePreview', {
            detail: { direction, progress, deltaX, deltaY }
        }));
    }
    
    /**
     * 隐藏手势预览
     */
    hideGesturePreview() {
        window.dispatchEvent(new CustomEvent('gesturePreviewEnd'));
    }
    
    /**
     * 处理滑动手势
     */
    handleSwipeGesture(angle, distance, velocity) {
        const direction = this.getSwipeDirection(angle);
        
        this.provideTactileFeedback('medium');
        this.showGestureHint(`${direction}滑动`);
        
        window.dispatchEvent(new CustomEvent('mobileSwipe', {
            detail: { direction, angle, distance, velocity }
        }));
        
        // 根据方向执行相应操作
        switch (direction) {
            case '左':
                this.handleLeftSwipe();
                break;
            case '右':
                this.handleRightSwipe();
                break;
            case '上':
                this.handleUpSwipe();
                break;
            case '下':
                this.handleDownSwipe();
                break;
        }
    }
    
    /**
     * 获取滑动方向
     */
    getSwipeDirection(angle) {
        const absAngle = Math.abs(angle);
        
        if (absAngle < 45) return '右';
        if (absAngle > 135) return '左';
        if (angle > 0) return '下';
        return '上';
    }
    
    /**
     * 处理各方向滑动
     */
    handleLeftSwipe() {
        // 下一首
        window.dispatchEvent(new CustomEvent('nextTrack'));
    }
    
    handleRightSwipe() {
        // 上一首
        window.dispatchEvent(new CustomEvent('prevTrack'));
    }
    
    handleUpSwipe() {
        // 显示播放列表
        window.dispatchEvent(new CustomEvent('showPlaylist'));
    }
    
    handleDownSwipe() {
        // 隐藏播放列表
        window.dispatchEvent(new CustomEvent('hidePlaylist'));
    }
    
    /**
     * 处理单击
     */
    handleSingleTap(element, event) {
        // 默认点击行为
        if (element.tagName === 'BUTTON' || element.classList.contains('clickable')) {
            element.click();
        }
    }
    
    /**
     * 处理双击
     */
    handleDoubleTap(element, event) {
        this.provideTactileFeedback('medium');
        
        window.dispatchEvent(new CustomEvent('mobileDoubleTap', {
            detail: { element, originalEvent: event }
        }));
        
        // 音频相关双击
        if (element.classList.contains('playlist-item')) {
            // 双击播放列表项 - 快速播放
            this.showGestureHint('快速播放');
        } else if (element.classList.contains('audio-controls')) {
            // 双击控制区 - 显示/隐藏控制
            this.showGestureHint('切换控制');
        }
    }
    
    /**
     * 处理长按
     */
    handleLongPress(element, event) {
        this.provideTactileFeedback('heavy');
        
        window.dispatchEvent(new CustomEvent('mobileLongPress', {
            detail: { element, originalEvent: event }
        }));
        
        // 根据元素类型显示上下文菜单
        if (element.classList.contains('playlist-item')) {
            this.showTrackContextMenu(element, event);
        } else if (element.classList.contains('category-item')) {
            this.showCategoryContextMenu(element, event);
        }
    }
    
    /**
     * 显示曲目上下文菜单
     */
    showTrackContextMenu(element, event) {
        const menu = document.createElement('div');
        menu.className = 'mobile-context-menu';
        menu.innerHTML = `
            <div class="context-menu-item" data-action="play">
                <i class="icon">▶️</i> 播放
            </div>
            <div class="context-menu-item" data-action="addToQueue">
                <i class="icon">➕</i> 加入队列
            </div>
            <div class="context-menu-item" data-action="download">
                <i class="icon">⬇️</i> 缓存到本地
            </div>
            <div class="context-menu-item" data-action="share">
                <i class="icon">📤</i> 分享
            </div>
        `;
        
        this.showContextMenu(menu, event);
    }
    
    /**
     * 显示分类上下文菜单
     */
    showCategoryContextMenu(element, event) {
        const menu = document.createElement('div');
        menu.className = 'mobile-context-menu';
        menu.innerHTML = `
            <div class="context-menu-item" data-action="playAll">
                <i class="icon">▶️</i> 播放全部
            </div>
            <div class="context-menu-item" data-action="shuffle">
                <i class="icon">🔀</i> 随机播放
            </div>
            <div class="context-menu-item" data-action="cacheAll">
                <i class="icon">⬇️</i> 缓存分类
            </div>
        `;
        
        this.showContextMenu(menu, event);
    }
    
    /**
     * 显示上下文菜单
     */
    showContextMenu(menu, event) {
        // 移除现有菜单
        const existingMenu = document.querySelector('.mobile-context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .mobile-context-menu {
                position: fixed;
                background: rgba(0,0,0,0.9);
                border-radius: 12px;
                padding: 8px 0;
                min-width: 200px;
                z-index: 10000;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.1);
                opacity: 0;
                transform: scale(0.8);
                transition: opacity 0.2s ease, transform 0.2s ease;
            }
            
            .mobile-context-menu.show {
                opacity: 1;
                transform: scale(1);
            }
            
            .context-menu-item {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                color: white;
                font-size: 16px;
                cursor: pointer;
                transition: background 0.2s ease;
            }
            
            .context-menu-item:hover,
            .context-menu-item:active {
                background: rgba(255,255,255,0.1);
            }
            
            .context-menu-item .icon {
                margin-right: 12px;
                font-size: 18px;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(menu);
        
        // 定位菜单
        const touch = event.changedTouches[0];
        let x = touch.clientX;
        let y = touch.clientY;
        
        // 确保菜单在屏幕内
        const menuRect = menu.getBoundingClientRect();
        if (x + menuRect.width > window.innerWidth) {
            x = window.innerWidth - menuRect.width - 10;
        }
        if (y + menuRect.height > window.innerHeight) {
            y = y - menuRect.height - 10;
        }
        
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
        
        // 显示动画
        requestAnimationFrame(() => {
            menu.classList.add('show');
        });
        
        // 绑定事件
        menu.addEventListener('click', (e) => {
            const item = e.target.closest('.context-menu-item');
            if (item) {
                const action = item.getAttribute('data-action');
                this.handleContextMenuAction(action, event);
                menu.remove();
            }
        });
        
        // 点击其他地方关闭
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('touchstart', closeMenu);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('touchstart', closeMenu);
        }, 100);
    }
    
    /**
     * 处理上下文菜单操作
     */
    handleContextMenuAction(action, originalEvent) {
        window.dispatchEvent(new CustomEvent('mobileContextAction', {
            detail: { action, originalEvent }
        }));
        
        this.showGestureHint(`${action} 操作`);
    }
    
    /**
     * 设置移动端UI适配
     */
    setupMobileUIAdaptations() {
        // 创建移动端控制栏
        this.createMobileControls();
        
        // 优化播放列表显示
        this.optimizePlaylistForMobile();
        
        // 调整音量控制
        this.enhanceVolumeControlForMobile();
        
        // 添加底部安全区域
        this.addSafeArea();
    }
    
    /**
     * 创建移动端控制栏
     */
    createMobileControls() {
        const mobileControls = document.createElement('div');
        mobileControls.id = 'mobile-controls';
        mobileControls.className = 'mobile-controls';
        mobileControls.innerHTML = `
            <div class="progress-container">
                <div class="progress-time">
                    <span class="current-time">0:00</span>
                    <span class="total-time">0:00</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                    <div class="progress-handle"></div>
                </div>
            </div>
            <div class="control-buttons">
                <button class="control-btn prev-btn">⏮️</button>
                <button class="play-pause-btn">▶️</button>
                <button class="control-btn next-btn">⏭️</button>
                <button class="control-btn volume-btn">🔊</button>
                <button class="control-btn playlist-btn">📄</button>
            </div>
        `;
        
        document.body.appendChild(mobileControls);
        
        // 绑定事件
        this.bindMobileControlEvents(mobileControls);
    }
    
    /**
     * 绑定移动端控制事件
     */
    bindMobileControlEvents(controls) {
        const playPauseBtn = controls.querySelector('.play-pause-btn');
        const prevBtn = controls.querySelector('.prev-btn');
        const nextBtn = controls.querySelector('.next-btn');
        const volumeBtn = controls.querySelector('.volume-btn');
        const playlistBtn = controls.querySelector('.playlist-btn');
        const progressBar = controls.querySelector('.progress-bar');
        
        playPauseBtn.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('togglePlayPause'));
        });
        
        prevBtn.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('prevTrack'));
        });
        
        nextBtn.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('nextTrack'));
        });
        
        volumeBtn.addEventListener('click', () => {
            this.toggleVolumePanel();
        });
        
        playlistBtn.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('togglePlaylist'));
        });
        
        // 进度条拖拽
        this.setupProgressBarDrag(progressBar);
    }
    
    /**
     * 设置进度条拖拽
     */
    setupProgressBarDrag(progressBar) {
        let isDragging = false;
        
        progressBar.addEventListener('touchstart', (e) => {
            isDragging = true;
            this.updateProgressFromTouch(e, progressBar);
        }, { passive: false });
        
        progressBar.addEventListener('touchmove', (e) => {
            if (isDragging) {
                e.preventDefault();
                this.updateProgressFromTouch(e, progressBar);
            }
        }, { passive: false });
        
        progressBar.addEventListener('touchend', () => {
            isDragging = false;
        });
    }
    
    /**
     * 从触摸更新进度
     */
    updateProgressFromTouch(event, progressBar) {
        const rect = progressBar.getBoundingClientRect();
        const touch = event.touches[0];
        const x = touch.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        
        window.dispatchEvent(new CustomEvent('seekToPercentage', {
            detail: { percentage }
        }));
    }
    
    /**
     * 优化移动端播放列表
     */
    optimizePlaylistForMobile() {
        const playlistContainers = document.querySelectorAll('.playlist-container');
        
        playlistContainers.forEach(container => {
            container.classList.add('mobile-playlist');
            
            // 添加虚拟滚动优化
            this.setupVirtualScrolling(container);
        });
    }
    
    /**
     * 设置虚拟滚动
     */
    setupVirtualScrolling(container) {
        // 简化的虚拟滚动实现
        let lastScrollTop = 0;
        
        container.addEventListener('scroll', () => {
            const scrollTop = container.scrollTop;
            const scrollDirection = scrollTop > lastScrollTop ? 'down' : 'up';
            
            // 优化：隐藏不可见元素的复杂内容
            const items = container.querySelectorAll('.playlist-item');
            const containerHeight = container.clientHeight;
            const scrollBuffer = containerHeight * 0.5;
            
            items.forEach(item => {
                const rect = item.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                const isVisible = rect.bottom > (containerRect.top - scrollBuffer) && 
                                rect.top < (containerRect.bottom + scrollBuffer);
                
                if (!isVisible) {
                    item.style.contentVisibility = 'hidden';
                } else {
                    item.style.contentVisibility = 'visible';
                }
            });
            
            lastScrollTop = scrollTop;
        }, { passive: true });
    }
    
    /**
     * 增强移动端音量控制
     */
    enhanceVolumeControlForMobile() {
        // 创建移动端音量面板
        this.createMobileVolumePanel();
    }
    
    /**
     * 创建移动端音量面板
     */
    createMobileVolumePanel() {
        const volumePanel = document.createElement('div');
        volumePanel.id = 'mobile-volume-panel';
        volumePanel.className = 'mobile-volume-panel hidden';
        volumePanel.innerHTML = `
            <div class="volume-slider-container">
                <div class="volume-icon">🔊</div>
                <div class="volume-slider-vertical">
                    <div class="volume-track"></div>
                    <div class="volume-fill"></div>
                    <div class="volume-handle"></div>
                </div>
                <div class="volume-value">100</div>
            </div>
        `;
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .mobile-volume-panel {
                position: fixed;
                right: 20px;
                bottom: 120px;
                background: rgba(0,0,0,0.9);
                border-radius: 12px;
                padding: 20px 16px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.1);
                transform: translateX(100px);
                opacity: 0;
                transition: all 0.3s ease;
                z-index: 1000;
            }
            
            .mobile-volume-panel:not(.hidden) {
                transform: translateX(0);
                opacity: 1;
            }
            
            .volume-slider-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                height: 200px;
            }
            
            .volume-icon {
                font-size: 24px;
                margin-bottom: 16px;
                color: white;
            }
            
            .volume-slider-vertical {
                position: relative;
                width: 6px;
                height: 120px;
                background: rgba(255,255,255,0.3);
                border-radius: 3px;
                margin-bottom: 16px;
                touch-action: none;
            }
            
            .volume-fill {
                position: absolute;
                bottom: 0;
                width: 100%;
                background: linear-gradient(to top, #667eea, #764ba2);
                border-radius: 3px;
                height: 100%;
                transition: height 0.1s ease;
            }
            
            .volume-handle {
                position: absolute;
                width: 20px;
                height: 20px;
                background: white;
                border-radius: 50%;
                left: -7px;
                top: 0;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                transition: top 0.1s ease;
            }
            
            .volume-value {
                color: white;
                font-size: 14px;
                font-weight: 500;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(volumePanel);
        
        this.mobileVolumePanel = volumePanel;
        this.setupVolumeSliderEvents(volumePanel);
    }
    
    /**
     * 切换音量面板
     */
    toggleVolumePanel() {
        if (!this.mobileVolumePanel) return;
        
        const isHidden = this.mobileVolumePanel.classList.contains('hidden');
        
        if (isHidden) {
            this.mobileVolumePanel.classList.remove('hidden');
            setTimeout(() => this.mobileVolumePanel.classList.add('hidden'), 3000);
        } else {
            this.mobileVolumePanel.classList.add('hidden');
        }
    }
    
    /**
     * 设置音量滑块事件
     */
    setupVolumeSliderEvents(panel) {
        const slider = panel.querySelector('.volume-slider-vertical');
        const fill = panel.querySelector('.volume-fill');
        const handle = panel.querySelector('.volume-handle');
        const valueDisplay = panel.querySelector('.volume-value');
        
        let isDragging = false;
        
        slider.addEventListener('touchstart', (e) => {
            isDragging = true;
            this.updateVolumeFromTouch(e, slider, fill, handle, valueDisplay);
        }, { passive: false });
        
        slider.addEventListener('touchmove', (e) => {
            if (isDragging) {
                e.preventDefault();
                this.updateVolumeFromTouch(e, slider, fill, handle, valueDisplay);
            }
        }, { passive: false });
        
        slider.addEventListener('touchend', () => {
            isDragging = false;
        });
    }
    
    /**
     * 从触摸更新音量
     */
    updateVolumeFromTouch(event, slider, fill, handle, valueDisplay) {
        const rect = slider.getBoundingClientRect();
        const touch = event.touches[0];
        const y = touch.clientY - rect.top;
        const percentage = Math.max(0, Math.min(1, 1 - (y / rect.height)));
        const volume = Math.round(percentage * 100);
        
        // 更新UI
        fill.style.height = (percentage * 100) + '%';
        handle.style.top = ((1 - percentage) * 100) + '%';
        valueDisplay.textContent = volume;
        
        // 发送音量变化事件
        window.dispatchEvent(new CustomEvent('volumeChange', {
            detail: { volume: percentage }
        }));
        
        this.provideTactileFeedback('light');
    }
    
    /**
     * 添加安全区域
     */
    addSafeArea() {
        const style = document.createElement('style');
        style.textContent = `
            @supports (padding-bottom: env(safe-area-inset-bottom)) {
                .mobile-controls {
                    padding-bottom: calc(16px + env(safe-area-inset-bottom));
                }
                
                body {
                    padding-bottom: env(safe-area-inset-bottom);
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * 设置性能优化
     */
    setupPerformanceOptimizations() {
        // 减少重绘和重排
        if (this.isMobile) {
            document.body.style.transformStyle = 'preserve-3d';
            document.body.style.willChange = 'transform';
        }
        
        // 防抖的resize处理
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.handleResize();
            }, 100);
        });
        
        // 节流的scroll处理
        let scrollTimer;
        document.addEventListener('scroll', () => {
            if (!scrollTimer) {
                scrollTimer = setTimeout(() => {
                    this.handleScroll();
                    scrollTimer = null;
                }, 16); // 60fps
            }
        }, { passive: true });
    }
    
    /**
     * 设置桌面端降级
     */
    setupDesktopFallbacks() {
        // 为桌面端提供触摸手势的鼠标替代
        document.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                const direction = e.deltaY > 0 ? 'down' : 'up';
                this.handleUpSwipe(); // 滚轮上滑显示播放列表
            }
        }, { passive: false });
    }
    
    /**
     * 提供触觉反馈
     */
    provideTactileFeedback(intensity = 'light') {
        if (!this.vibrationSupported) return;
        
        const patterns = {
            light: 10,
            medium: 50,
            heavy: 100
        };
        
        const pattern = patterns[intensity] || patterns.light;
        navigator.vibrate(pattern);
    }
    
    /**
     * 显示手势提示
     */
    showGestureHint(text) {
        let hint = document.querySelector('.gesture-hint');
        
        if (!hint) {
            hint = document.createElement('div');
            hint.className = 'gesture-hint';
            document.body.appendChild(hint);
        }
        
        hint.textContent = text;
        hint.classList.add('show');
        
        clearTimeout(this.hintTimeout);
        this.hintTimeout = setTimeout(() => {
            hint.classList.remove('show');
        }, 1500);
    }
    
    /**
     * 处理窗口大小变化
     */
    handleResize() {
        // 重新检测是否为移动设备
        const wasMobile = this.isMobile;
        this.isMobile = this.detectMobileDevice();
        
        if (wasMobile !== this.isMobile) {
            // 设备类型发生变化，重新初始化
            this.initializeOptimizer();
        }
    }
    
    /**
     * 处理滚动
     */
    handleScroll() {
        // 移动端滚动优化
        if (this.isMobile) {
            const scrollTop = window.pageYOffset;
            
            // 向下滚动时隐藏移动控制栏
            if (this.lastScrollTop !== undefined) {
                const mobileControls = document.getElementById('mobile-controls');
                if (mobileControls) {
                    if (scrollTop > this.lastScrollTop && scrollTop > 100) {
                        mobileControls.style.transform = 'translateY(100%)';
                    } else {
                        mobileControls.style.transform = 'translateY(0)';
                    }
                }
            }
            
            this.lastScrollTop = scrollTop;
        }
    }
    
    /**
     * 获取触摸状态
     */
    getTouchStatus() {
        return {
            isMobile: this.isMobile,
            vibrationSupported: this.vibrationSupported,
            touchConfig: this.touchConfig,
            gestureInProgress: this.gestureInProgress,
            isScrolling: this.isScrolling
        };
    }
}

// 创建全局实例
window.mobileTouchOptimizer = new MobileTouchOptimizer();

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileTouchOptimizer;
}

console.log('📱 移动端触摸优化器已加载');