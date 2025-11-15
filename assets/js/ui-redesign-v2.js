/**
 * UI Redesign v2.0 - 简化导航与优化布局
 *
 * 主要功能：
 * 1. 简化导航栏（11个按钮 → 3个按钮）
 * 2. 添加首屏快速启动区（3个精选分类）
 * 3. 固定底部播放器（迷你/展开两种模式）
 * 4. 重新排序内容布局
 */

class UIRedesignV2 {
    constructor() {
        this.init();
    }

    init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupUI());
        } else {
            this.setupUI();
        }
    }

    setupUI() {
        this.simplifyNavigation();
        this.createQuickStartSection();
        // 禁用固定底部播放器，使用模态框播放器
        // this.createFixedPlayer();
        this.reorderContent();
        this.setupEventListeners();
    }

    /**
     * 简化导航栏 - 只保留3个关键按钮
     */
    simplifyNavigation() {
        const nav = document.querySelector('.saas-nav');
        if (!nav) {
            console.warn('UI Redesign v2.0: .saas-nav not found');
            return;
        }

        // 注意：当前HTML已经使用简化导航，这里只添加增强功能
        // 不隐藏现有元素，而是在现有基础上增强

        // 获取现有的导航操作区
        const navActions = nav.querySelector('.saas-nav__actions');
        if (!navActions) {
            console.warn('UI Redesign v2.0: .saas-nav__actions not found');
            return;
        }

        // 添加设置按钮到现有导航（在语言选择器旁边）
        const settingsBtn = this.createSettingsButton();
        const languageSelector = navActions.querySelector('.language-selector');

        if (languageSelector && !navActions.querySelector('.header__settings-btn')) {
            navActions.insertBefore(settingsBtn, languageSelector);
        }

        console.log('✅ UI Redesign v2.0: Navigation simplified');
    }

    /**
     * 创建用户中心按钮
     */
    createUserCenterButton() {
        const userBtn = document.createElement('button');
        userBtn.className = 'header__user-btn';
        userBtn.setAttribute('aria-label', '用户中心');
        userBtn.setAttribute('title', '用户中心');

        userBtn.innerHTML = `
            <span class="icon">👤</span>
            <span data-i18n="nav.userCenter">用户中心</span>
        `;

        // 点击展开用户菜单
        userBtn.addEventListener('click', () => {
            this.showUserMenu();
        });

        return userBtn;
    }

    /**
     * 创建设置按钮
     */
    createSettingsButton() {
        const settingsBtn = document.createElement('button');
        settingsBtn.className = 'header__settings-btn';
        settingsBtn.setAttribute('aria-label', '设置');
        settingsBtn.setAttribute('title', '设置');

        settingsBtn.innerHTML = '<span class="icon">⚙️</span>';

        // 点击展开设置菜单
        settingsBtn.addEventListener('click', () => {
            this.showSettingsMenu();
        });

        return settingsBtn;
    }

    /**
     * 创建首屏快速启动区
     */
    createQuickStartSection() {
        const heroSection = document.querySelector('.saas-hero');
        if (!heroSection) {
            console.warn('UI Redesign v2.0: .saas-hero not found');
            return;
        }

        // 创建快速启动区HTML
        const quickStartHTML = `
            <section class="quick-start-section" id="quickStart">
                <div class="container">
                    <div class="quick-start__heading">
                        <h2 class="quick-start__title" data-i18n="quickStart.title">
                            🎵 选择你的疗愈声景，立即开始
                        </h2>
                        <p class="quick-start__subtitle" data-i18n="quickStart.subtitle">
                            点击任意分类，3秒内进入专属音疗空间
                        </p>
                    </div>

                    <div class="quick-start__grid">
                        <!-- 精选1: 雨声助眠 -->
                        <div class="featured-card" data-category="Rain" role="button" tabindex="0">
                            <span class="featured-card__icon">🌧️</span>
                            <h3 class="featured-card__name" data-i18n="featured.rain.name">雨声</h3>
                            <p class="featured-card__purpose" data-i18n="featured.rain.purpose">助眠</p>
                            <button class="featured-card__play-btn">
                                <span class="icon">▶️</span>
                                <span data-i18n="featured.playBtn">播放</span>
                            </button>
                        </div>

                        <!-- 精选2: 冥想专注 -->
                        <div class="featured-card" data-category="meditation" role="button" tabindex="0">
                            <span class="featured-card__icon">🧘‍♀️</span>
                            <h3 class="featured-card__name" data-i18n="featured.meditation.name">冥想</h3>
                            <p class="featured-card__purpose" data-i18n="featured.meditation.purpose">专注</p>
                            <button class="featured-card__play-btn">
                                <span class="icon">▶️</span>
                                <span data-i18n="featured.playBtn">播放</span>
                            </button>
                        </div>

                        <!-- 精选3: 催眠深睡 -->
                        <div class="featured-card" data-category="hypnosis" role="button" tabindex="0">
                            <span class="featured-card__icon">🌙</span>
                            <h3 class="featured-card__name" data-i18n="featured.hypnosis.name">催眠</h3>
                            <p class="featured-card__purpose" data-i18n="featured.hypnosis.purpose">深睡</p>
                            <button class="featured-card__play-btn">
                                <span class="icon">▶️</span>
                                <span data-i18n="featured.playBtn">播放</span>
                            </button>
                        </div>
                    </div>

                    <div class="quick-start__browse-all">
                        <a href="#categoryGrid" class="quick-start__browse-link" data-i18n="quickStart.browseAll">
                            或浏览全部 213+ 音频 ↓
                        </a>
                    </div>
                </div>
            </section>
        `;

        // 在hero区后插入
        heroSection.insertAdjacentHTML('afterend', quickStartHTML);

        // 绑定快速启动卡片的点击事件
        this.setupQuickStartCards();

        // 触发一次多语言刷新，确保新插入区域与当前语言一致
        if (window.i18n && typeof window.i18n.updatePageContent === 'function') {
            window.i18n.updatePageContent();
        }
    }

    /**
     * 设置快速启动卡片的交互
     */
    setupQuickStartCards() {
        const cards = document.querySelectorAll('.featured-card');

        cards.forEach(card => {
            const playBtn = card.querySelector('.featured-card__play-btn');
            const category = card.dataset.category;

            // 点击卡片或播放按钮
            const handlePlay = (e) => {
                e.preventDefault();
                e.stopPropagation();

                // 播放该分类的第一首音频
                this.playCategory(category);

                // 添加点击动画
                card.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    card.style.transform = '';
                }, 200);
            };

            playBtn.addEventListener('click', handlePlay);

            // 键盘支持
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    handlePlay(e);
                }
            });
        });
    }

    /**
     * 播放指定分类的音频
     */
    playCategory(category) {
        // 滚动到音频分类区
        const categoryGrid = document.getElementById('categoryGrid');
        if (categoryGrid) {
            categoryGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // 触发分类卡片点击（如果有的话）
        setTimeout(() => {
            const categoryCard = document.querySelector(`[data-category="${category}"]`);
            if (categoryCard && categoryCard.classList.contains('category-card')) {
                categoryCard.click();
            } else {
                // 如果找不到，尝试使用AudioManager直接播放
                if (window.app && window.app.audioManager) {
                    const config = window.AUDIO_CONFIG;
                    if (config && config.categories[category]) {
                        const files = config.categories[category].files;
                        if (files && files.length > 0) {
                            window.app.audioManager.playTrack(files[0], category, files[0]);
                        }
                    }
                }
            }
        }, 600);
    }

    /**
     * 创建固定底部播放器
     */
    createFixedPlayer() {
        const existingPlayer = document.querySelector('.audio-player');
        if (!existingPlayer) return;

        // 隐藏原有播放器
        existingPlayer.style.display = 'none';

        // 创建新的固定播放器
        const fixedPlayerHTML = `
            <div class="audio-player-fixed" id="fixedPlayer">
                <!-- 迷你播放器（默认显示） -->
                <div class="player-mini" id="playerMini">
                    <div class="player-mini__placeholder" id="playerPlaceholder">
                        <span>▶️</span>
                        <span data-i18n="player.selectAudio">选择音频开始播放</span>
                    </div>

                    <div class="player-mini__info" id="playerInfo" style="display: none;">
                        <div class="player-mini__cover" id="playerCover">🎵</div>
                        <div class="player-mini__track">
                            <div class="player-mini__title" id="playerTitle">音频标题</div>
                            <div class="player-mini__category" id="playerCategory">分类</div>
                        </div>
                    </div>

                    <div class="player-mini__controls" id="playerControls" style="display: none;">
                        <button class="player-mini__btn" id="playPauseBtn" aria-label="播放/暂停">
                            <span id="playPauseIcon">▶️</span>
                        </button>
                        <button class="player-mini__btn" id="nextBtn" aria-label="下一首">
                            <span>⏭️</span>
                        </button>
                    </div>

                    <div class="player-mini__progress" id="playerProgress" style="display: none;">
                        <span class="player-mini__time" id="currentTime">0:00</span>
                        <div class="player-mini__progress-bar" id="progressBar">
                            <div class="player-mini__progress-fill" id="progressFill"></div>
                        </div>
                        <span class="player-mini__time" id="totalTime">0:00</span>
                    </div>

                    <div class="player-mini__volume" id="playerVolume" style="display: none;">
                        <span>🔊</span>
                        <input type="range" class="player-mini__volume-slider" id="volumeSlider"
                               min="0" max="100" value="70" aria-label="音量">
                    </div>

                    <button class="player-mini__btn" id="expandBtn" aria-label="展开播放器" style="display: none;">
                        <span>↑</span>
                    </button>
                </div>

                <!-- 展开的播放器（点击展开后显示） -->
                <div class="player-expanded" id="playerExpanded" style="display: none;">
                    <div class="player-expanded__header">
                        <h3 data-i18n="player.nowPlaying">正在播放</h3>
                        <button class="player-expanded__close" id="collapseBtn" aria-label="收起播放器">
                            ×
                        </button>
                    </div>

                    <div class="player-expanded__main">
                        <div class="player-expanded__cover" id="expandedCover">🎵</div>

                        <div class="player-expanded__info">
                            <h4 class="player-expanded__title" id="expandedTitle">音频标题</h4>
                            <p class="player-expanded__category" id="expandedCategory">分类</p>

                            <div class="player-expanded__controls">
                                <button class="player-expanded__control-btn" id="prevBtnExpanded" aria-label="上一首">
                                    ⏮️
                                </button>
                                <button class="player-expanded__control-btn player-expanded__control-btn--play"
                                        id="playPauseBtnExpanded" aria-label="播放/暂停">
                                    ▶️
                                </button>
                                <button class="player-expanded__control-btn" id="nextBtnExpanded" aria-label="下一首">
                                    ⏭️
                                </button>
                            </div>

                            <div class="player-expanded__secondary">
                                <button class="player-expanded__control-btn" id="shuffleBtn" aria-label="随机播放">
                                    🔀
                                </button>
                                <button class="player-expanded__control-btn" id="repeatBtn" aria-label="循环播放">
                                    🔁
                                </button>
                                <button class="player-expanded__control-btn" id="timerBtn" aria-label="睡眠定时">
                                    ⏱️
                                </button>
                                <button class="player-expanded__control-btn" id="mixerBtn" aria-label="混音器">
                                    🎚️
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 添加到页面底部
        document.body.insertAdjacentHTML('beforeend', fixedPlayerHTML);

        // 设置播放器交互
        this.setupPlayerInteractions();
    }

    /**
     * 设置播放器交互
     */
    setupPlayerInteractions() {
        const playerMini = document.getElementById('playerMini');
        const playerExpanded = document.getElementById('playerExpanded');
        const expandBtn = document.getElementById('expandBtn');
        const collapseBtn = document.getElementById('collapseBtn');

        // 展开播放器
        if (expandBtn) {
            expandBtn.addEventListener('click', () => {
                playerMini.style.display = 'none';
                playerExpanded.style.display = 'block';
            });
        }

        // 收起播放器
        if (collapseBtn) {
            collapseBtn.addEventListener('click', () => {
                playerMini.style.display = 'flex';
                playerExpanded.style.display = 'none';
            });
        }

        // 同步AudioManager状态
        this.syncWithAudioManager();
    }

    /**
     * 与AudioManager同步状态
     */
    syncWithAudioManager() {
        // 监听全局音频播放事件
        if (window.app && window.app.audioManager) {
            const audioManager = window.app.audioManager;

            // 监听播放事件
            document.addEventListener('audioPlay', (e) => {
                this.updatePlayerUI(e.detail);
            });

            // 监听暂停事件
            document.addEventListener('audioPause', () => {
                this.updatePlayPauseButton(false);
            });

            // 监听进度更新
            document.addEventListener('audioProgress', (e) => {
                this.updateProgress(e.detail);
            });
        }
    }

    /**
     * 更新播放器UI
     */
    updatePlayerUI(audioData) {
        const placeholder = document.getElementById('playerPlaceholder');
        const info = document.getElementById('playerInfo');
        const controls = document.getElementById('playerControls');
        const progress = document.getElementById('playerProgress');
        const volume = document.getElementById('playerVolume');
        const expandBtn = document.getElementById('expandBtn');

        // 隐藏占位符，显示播放器元素
        if (placeholder) placeholder.style.display = 'none';
        if (info) info.style.display = 'flex';
        if (controls) controls.style.display = 'flex';
        if (progress) progress.style.display = 'flex';
        if (volume) volume.style.display = 'flex';
        if (expandBtn) expandBtn.style.display = 'flex';

        // 更新音频信息
        if (audioData) {
            const { title, category, icon } = audioData;

            document.getElementById('playerTitle').textContent = title || '未知音频';
            document.getElementById('playerCategory').textContent = category || '未知分类';
            document.getElementById('playerCover').textContent = icon || '🎵';

            document.getElementById('expandedTitle').textContent = title || '未知音频';
            document.getElementById('expandedCategory').textContent = category || '未知分类';
            document.getElementById('expandedCover').textContent = icon || '🎵';
        }

        this.updatePlayPauseButton(true);
    }

    /**
     * 更新播放/暂停按钮
     */
    updatePlayPauseButton(isPlaying) {
        const playPauseIcon = document.getElementById('playPauseIcon');
        const playPauseBtnExpanded = document.getElementById('playPauseBtnExpanded');

        if (playPauseIcon) {
            playPauseIcon.textContent = isPlaying ? '⏸️' : '▶️';
        }

        if (playPauseBtnExpanded) {
            playPauseBtnExpanded.textContent = isPlaying ? '⏸️' : '▶️';
        }
    }

    /**
     * 更新进度条
     */
    updateProgress(progressData) {
        const { currentTime, duration, percentage } = progressData;

        const progressFill = document.getElementById('progressFill');
        const currentTimeEl = document.getElementById('currentTime');
        const totalTimeEl = document.getElementById('totalTime');

        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }

        if (currentTimeEl) {
            currentTimeEl.textContent = this.formatTime(currentTime);
        }

        if (totalTimeEl) {
            totalTimeEl.textContent = this.formatTime(duration);
        }
    }

    /**
     * 格式化时间
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    /**
     * 重新排序内容布局
     */
    reorderContent() {
        const quickStart = document.getElementById('quickStart');
        const categorySection = document.querySelector('.category-section');
        const journeyShowcase = document.querySelector('.journey-showcase');

        if (!categorySection) {
            console.warn('UI Redesign v2.0: .category-section not found');
            return;
        }

        // 确保顺序：快速启动 → 音频分类 → 其他内容
        if (quickStart && journeyShowcase) {
            // 将音频分类移到旅程展示之前
            journeyShowcase.parentElement.insertBefore(categorySection, journeyShowcase);
            console.log('✅ UI Redesign v2.0: Content reordered');
        }

        // 为分类区添加增强标题（如果还没有）
        const categoryGrid = document.getElementById('categoryGrid');
        if (categoryGrid && !document.querySelector('.category-section__heading')) {
            const heading = document.createElement('div');
            heading.className = 'category-section__heading';
            heading.style.cssText = 'text-align: center; margin-bottom: 2rem; padding: 0 1rem;';
            heading.innerHTML = `
                <h2 class="category-section__title" data-i18n="categories.title" style="font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-primary, #1a1a2e);">浏览全部 213+ 疗愈音频</h2>
                <p class="category-section__subtitle" data-i18n="categories.subtitle" style="font-size: 1.1rem; color: var(--text-secondary, #64748b);">9个专业分类，找到最适合你的声音</p>
            `;
            categorySection.insertBefore(heading, categorySection.firstChild);

            if (window.i18n && typeof window.i18n.updatePageContent === 'function') {
                window.i18n.updatePageContent();
            }
        }
    }

    /**
     * 显示用户菜单
     */
    showUserMenu() {
        const userDropdown = document.getElementById('userDropdown');
        if (userDropdown) {
            const toggle = userDropdown.querySelector('.user-dropdown-toggle');
            if (toggle) {
                toggle.click();
            }
        }
    }

    /**
     * 显示设置菜单
     */
    showSettingsMenu() {
        // 创建设置菜单弹窗
        const settingsMenu = `
            <div class="settings-modal" id="settingsModal">
                <div class="settings-modal__overlay"></div>
                <div class="settings-modal__content">
                    <div class="settings-modal__header">
                        <h3 data-i18n="settings.title">设置</h3>
                        <button class="settings-modal__close" aria-label="关闭">×</button>
                    </div>
                    <div class="settings-modal__body">
                        <button class="settings-item" onclick="document.getElementById('themeToggle')?.click()">
                            <span class="icon">🌙</span>
                            <span data-i18n="settings.theme">主题切换</span>
                        </button>
                        <button class="settings-item" onclick="window.notificationPreferences?.openSettings()">
                            <span class="icon">🔔</span>
                            <span data-i18n="settings.notifications">通知设置</span>
                        </button>
                        <button class="settings-item" onclick="window.focusModeController?.toggle()">
                            <span class="icon">🎯</span>
                            <span data-i18n="settings.focusMode">专注模式</span>
                        </button>
                        <button class="settings-item" onclick="window.mixerUI?.open()">
                            <span class="icon">🎚️</span>
                            <span data-i18n="settings.mixer">音频混音器</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // 如果已存在，直接显示
        let modal = document.getElementById('settingsModal');
        if (!modal) {
            document.body.insertAdjacentHTML('beforeend', settingsMenu);
            modal = document.getElementById('settingsModal');

            // 绑定关闭事件
            const closeBtn = modal.querySelector('.settings-modal__close');
            const overlay = modal.querySelector('.settings-modal__overlay');

            const closeModal = () => {
                modal.remove();
            };

            closeBtn.addEventListener('click', closeModal);
            overlay.addEventListener('click', closeModal);
        } else {
            modal.style.display = 'flex';
        }
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听播放器按钮点击
        const playPauseBtn = document.getElementById('playPauseBtn');
        const nextBtn = document.getElementById('nextBtn');

        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                if (window.app && window.app.audioManager) {
                    window.app.audioManager.togglePlay();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (window.app && window.app.audioManager) {
                    window.app.audioManager.next();
                }
            });
        }

        // 音量控制
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                if (window.app && window.app.audioManager) {
                    window.app.audioManager.setVolume(e.target.value / 100);
                }
            });
        }

        // 进度条点击跳转
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.addEventListener('click', (e) => {
                const rect = progressBar.getBoundingClientRect();
                const percentage = (e.clientX - rect.left) / rect.width;

                if (window.app && window.app.audioManager) {
                    window.app.audioManager.seekTo(percentage);
                }
            });
        }
    }
}

// 初始化UI重新设计
window.uiRedesignV2 = new UIRedesignV2();
