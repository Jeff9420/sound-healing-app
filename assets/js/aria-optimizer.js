/**
 * ARIA标签优化模块 - SoundFlows声音疗愈应用
 * 自动增强无障碍功能，符合WCAG 2.1标准
 */

class ARIAOptimizer {
    constructor() {
        this.initialized = false;
        this.dynamicElements = new Set();
        this.observerInstances = new Map();
        this.liveRegions = new Map();

        // 中文无障碍标签映射
        this.labelMappings = {
            // 播放控制
            'play': '播放',
            'pause': '暂停',
            'stop': '停止',
            'next': '下一首',
            'previous': '上一首',
            'forward': '快进',
            'backward': '快退',
            'shuffle': '随机播放',
            'repeat': '循环播放',
            'repeat-one': '单曲循环',
            'volume-up': '增加音量',
            'volume-down': '降低音量',
            'volume-mute': '静音',
            'volume-unmute': '取消静音',

            // 播放列表
            'playlist': '播放列表',
            'add-to-playlist': '添加到播放列表',
            'remove-from-playlist': '从播放列表移除',
            'favorite': '收藏',
            'unfavorite': '取消收藏',
            'share': '分享',
            'download': '下载',

            // 导航
            'menu': '菜单',
            'close': '关闭',
            'back': '返回',
            'home': '首页',
            'search': '搜索',
            'filter': '筛选',
            'sort': '排序',
            'settings': '设置',
            'help': '帮助',
            'info': '信息',

            // 主题切换
            'theme': '主题',
            'dark-mode': '深色模式',
            'light-mode': '浅色模式',
            'warm-theme': '暖色主题',
            'nature-theme': '自然主题',

            // 音频类别
            'animal': '动物声音',
            'chakra': '脉轮疗愈',
            'fire': '火焰声音',
            'hypnosis': '催眠音乐',
            'meditation': '冥想音乐',
            'rain': '雨声',
            'water': '水流声',
            'singing-bowl': '颂钵声音',
            'subconscious': '潜意识疗愈',

            // 控制
            'fullscreen': '全屏',
            'exit-fullscreen': '退出全屏',
            'minimize': '最小化',
            'maximize': '最大化',
            'refresh': '刷新',
            'load': '加载',
            'save': '保存',
            'cancel': '取消',
            'confirm': '确认',
            'delete': '删除',
            'edit': '编辑',
            'apply': '应用',
            'reset': '重置',
            'clear': '清除',

            // 无障碍
            'skip-to-content': '跳转到主要内容',
            'skip-to-navigation': '跳转到导航',
            'skip-to-search': '跳转到搜索'
        };

        this.init();
    }

    /**
     * 初始化ARIA优化器
     */
    init() {
        if (this.initialized) {
            return;
        }

        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }

        this.initialized = true;
        console.log('♿ ARIA优化器已初始化');
    }

    /**
     * 设置ARIA优化
     */
    setup() {
        // 创建实时区域
        this.createLiveRegions();

        // 优化现有元素
        this.optimizeExistingElements();

        // 设置MutationObserver监听动态元素
        this.setupObservers();

        // 处理单页应用路由变化
        this.handleSPAChanges();

        // 优化表单元素
        this.optimizeForms();

        // 优化媒体元素
        this.optimizeMediaElements();

        // 添加键盘快捷键
        this.setupKeyboardShortcuts();

        // 初始化完成后广播
        this.announceToScreenReader('声音疗愈应用已完全加载');
    }

    /**
     * 创建实时区域
     */
    createLiveRegions() {
        // 创建不同优先级的实时区域
        const regions = [
            { id: 'aria-live-polite', priority: 'polite', 'aria-live': 'polite' },
            { id: 'aria-live-assertive', priority: 'assertive', 'aria-live': 'assertive' },
            { id: 'aria-live-status', role: 'status', 'aria-live': 'polite' },
            { id: 'aria-live-alert', role: 'alert', 'aria-live': 'assertive' }
        ];

        regions.forEach(region => {
            const liveRegion = document.createElement('div');
            liveRegion.id = region.id;
            liveRegion.setAttribute('aria-live', region['aria-live']);
            if (region.role) {
                liveRegion.setAttribute('role', region.role);
            }
            Object.assign(liveRegion.style, {
                position: 'absolute',
                left: '-10000px',
                width: '1px',
                height: '1px',
                overflow: 'hidden'
            });

            document.body.appendChild(liveRegion);
            this.liveRegions.set(region.priority, liveRegion);
        });
    }

    /**
     * 优化现有元素
     */
    optimizeExistingElements() {
        // 优化所有按钮
        this.optimizeButtons();

        // 优化所有链接
        this.optimizeLinks();

        // 优化所有输入元素
        this.optimizeInputs();

        // 优化自定义组件
        this.optimizeCustomComponents();

        // 优化图像
        this.optimizeImages();

        // 优化图标
        this.optimizeIcons();

        // 优化导航
        this.optimizeNavigation();

        // 优化模态框和对话框
        this.optimizeModals();
    }

    /**
     * 优化按钮
     */
    optimizeButtons() {
        const buttons = document.querySelectorAll('button, [role="button"]');

        buttons.forEach(button => {
            // 检查是否已经有标签
            if (!this.hasAccessibleLabel(button)) {
                const label = this.generateButtonLabel(button);
                if (label) {
                    button.setAttribute('aria-label', label);
                }
            }

            // 检查按钮状态
            this.optimizeButtonState(button);

            // 为图标按钮添加更多描述
            if (this.isIconOnly(button)) {
                this.enhanceIconButton(button);
            }
        });
    }

    /**
     * 优化链接
     */
    optimizeLinks() {
        const links = document.querySelectorAll('a[href]');

        links.forEach(link => {
            // 跳过已有描述的链接
            if (link.textContent.trim() || link.getAttribute('aria-label')) {
                return;
            }

            // 为图标链接添加描述
            if (this.isIconOnly(link)) {
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    link.setAttribute('aria-label', `页面内链接：${href.substring(1)}`);
                } else if (href.startsWith('http')) {
                    link.setAttribute('aria-label', `外部链接：${new URL(href).hostname}`);
                } else {
                    link.setAttribute('aria-label', `链接：${href}`);
                }
            }

            // 标记新窗口链接
            if (link.target === '_blank' && !link.getAttribute('aria-describedby')) {
                const warningId = 'new-window-warning';
                let warning = document.getElementById(warningId);
                if (!warning) {
                    warning = document.createElement('span');
                    warning.id = warningId;
                    warning.textContent = '在新窗口打开';
                    warning.style.display = 'none';
                    document.body.appendChild(warning);
                }
                link.setAttribute('aria-describedby', warningId);
            }
        });
    }

    /**
     * 优化输入元素
     */
    optimizeInputs() {
        const inputs = document.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            // 确保每个输入都有关联的标签
            if (!this.hasAssociatedLabel(input)) {
                const id = input.id || this.generateUniqueId();
                if (!input.id) {
                    input.id = id;
                }

                // 尝试从placeholder创建标签
                const placeholder = input.getAttribute('placeholder');
                if (placeholder) {
                    const label = document.createElement('label');
                    label.setAttribute('for', id);
                    label.textContent = placeholder;
                    label.style.display = 'none';
                    input.parentNode.insertBefore(label, input);
                }
            }

            // 添加必填字段提示
            if (input.hasAttribute('required') && !input.getAttribute('aria-required')) {
                input.setAttribute('aria-required', 'true');
            }

            // 添加错误状态
            if (input.hasAttribute('invalid') || input.classList.contains('error')) {
                input.setAttribute('aria-invalid', 'true');
                this.addErrorMessage(input);
            }

            // 为range输入添加当前值
            if (input.type === 'range' && !input.getAttribute('aria-valuenow')) {
                this.updateRangeValue(input);
            }
        });
    }

    /**
     * 优化表单
     */
    optimizeForms() {
        const forms = document.querySelectorAll('form');

        forms.forEach(form => {
            // 为表单添加可访问的标签
            if (!form.getAttribute('aria-label') && !form.getAttribute('aria-labelledby')) {
                const title = form.querySelector('legend, h1, h2, h3, h4, h5, h6');
                if (title) {
                    const id = title.id || this.generateUniqueId();
                    if (!title.id) {
                        title.id = id;
                    }
                    form.setAttribute('aria-labelledby', id);
                } else {
                    form.setAttribute('aria-label', '表单');
                }
            }

            // 为必填字段添加说明
            const requiredFields = form.querySelectorAll('[required]');
            if (requiredFields.length > 0 && !form.querySelector('.required-fields-info')) {
                const info = document.createElement('div');
                info.className = 'required-fields-info';
                info.setAttribute('aria-live', 'polite');
                info.textContent = '标有 * 的字段为必填项';
                info.style.fontSize = '0.875rem';
                info.style.color = '#666';
                info.style.marginTop = '0.5rem';
                form.insertBefore(info, form.firstChild);
            }

            // 优化表单提交按钮
            const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
            if (submitBtn && !submitBtn.getAttribute('aria-label')) {
                const buttonText = submitBtn.textContent || submitBtn.value;
                submitBtn.setAttribute('aria-label', `提交表单：${buttonText}`);
            }
        });
    }

    /**
     * 优化自定义组件
     */
    optimizeCustomComponents() {
        // 播放列表组件
        this.optimizePlaylist();

        // 音频播放器
        this.optimizeAudioPlayer();

        // 主题切换器
        this.optimizeThemeSwitcher();

        // 折叠面板
        this.optimizeAccordions();

        // 标签页
        this.optimizeTabs();

        // 轮播图
        this.optimizeCarousels();
    }

    /**
     * 优化播放列表
     */
    optimizePlaylist() {
        const playlists = document.querySelectorAll('.playlist, [role="listbox"]');

        playlists.forEach(playlist => {
            if (!playlist.getAttribute('role')) {
                playlist.setAttribute('role', 'listbox');
            }

            const items = playlist.querySelectorAll('.track-item, [role="option"]');
            items.forEach((item, index) => {
                if (!item.getAttribute('role')) {
                    item.setAttribute('role', 'option');
                }
                if (!item.getAttribute('aria-posinset')) {
                    item.setAttribute('aria-posinset', index + 1);
                }
                if (!item.getAttribute('aria-setsize')) {
                    item.setAttribute('aria-setsize', items.length);
                }
                if (!item.getAttribute('tabindex')) {
                    item.setAttribute('tabindex', '-1');
                }
            });
        });
    }

    /**
     * 优化音频播放器
     */
    optimizeAudioPlayer() {
        const players = document.querySelectorAll('.audio-player, .audio-controller');

        players.forEach(player => {
            // 主播放器区域
            if (!player.getAttribute('role')) {
                player.setAttribute('role', 'application');
                player.setAttribute('aria-label', '音频播放控制器');
            }

            // 播放/暂停按钮
            const playPauseBtn = player.querySelector('.play-btn, .pause-btn');
            if (playPauseBtn && !playPauseBtn.getAttribute('aria-pressed')) {
                playPauseBtn.setAttribute('aria-pressed', 'false');
            }

            // 进度条
            const progressBar = player.querySelector('.progress-bar, input[type="range"]');
            if (progressBar) {
                if (!progressBar.getAttribute('role')) {
                    progressBar.setAttribute('role', 'slider');
                    progressBar.setAttribute('aria-label', '播放进度');
                }
                this.setupProgressBarAccessibility(progressBar);
            }

            // 音量控制
            const volumeControl = player.querySelector('.volume-slider, .volume-control');
            if (volumeControl && !volumeControl.getAttribute('aria-label')) {
                volumeControl.setAttribute('aria-label', '音量控制');
            }
        });
    }

    /**
     * 优化主题切换器
     */
    optimizeThemeSwitcher() {
        const themeSwitcher = document.querySelector('.theme-switcher, .theme-nav');

        if (themeSwitcher && !themeSwitcher.getAttribute('role')) {
            themeSwitcher.setAttribute('role', 'radiogroup');
            themeSwitcher.setAttribute('aria-label', '主题选择');

            const themes = themeSwitcher.querySelectorAll('.theme-btn, [data-theme]');
            themes.forEach(theme => {
                if (!theme.getAttribute('role')) {
                    theme.setAttribute('role', 'radio');
                }
                if (!theme.getAttribute('aria-checked')) {
                    theme.setAttribute('aria-checked',
                        theme.classList.contains('active') ? 'true' : 'false');
                }
            });
        }
    }

    /**
     * 优化折叠面板
     */
    optimizeAccordions() {
        const accordions = document.querySelectorAll('.accordion, .collapse');

        accordions.forEach(accordion => {
            const headers = accordion.querySelectorAll('.accordion-header, .collapse-header');
            headers.forEach(header => {
                const button = header.querySelector('button') || header;
                const content = header.nextElementSibling;

                if (!button.getAttribute('aria-expanded')) {
                    button.setAttribute('aria-expanded', 'false');
                }
                if (!button.getAttribute('aria-controls')) {
                    const contentId = content.id || this.generateUniqueId();
                    if (!content.id) {
                        content.id = contentId;
                    }
                    button.setAttribute('aria-controls', contentId);
                }

                // 切换状态
                button.addEventListener('click', () => {
                    const isExpanded = button.getAttribute('aria-expanded') === 'true';
                    button.setAttribute('aria-expanded', !isExpanded);
                });
            });
        });
    }

    /**
     * 优化标签页
     */
    optimizeTabs() {
        const tabLists = document.querySelectorAll('.tab-list, [role="tablist"]');

        tabLists.forEach(tabList => {
            if (!tabList.getAttribute('role')) {
                tabList.setAttribute('role', 'tablist');
            }

            const tabs = tabList.querySelectorAll('.tab, [role="tab"]');
            tabs.forEach(tab => {
                if (!tab.getAttribute('role')) {
                    tab.setAttribute('role', 'tab');
                }
                if (!tab.getAttribute('aria-selected')) {
                    tab.setAttribute('aria-selected',
                        tab.classList.contains('active') ? 'true' : 'false');
                }
                if (!tab.getAttribute('tabindex')) {
                    tab.setAttribute('tabindex',
                        tab.classList.contains('active') ? '0' : '-1');
                }
            });
        });
    }

    /**
     * 优化轮播图
     */
    optimizeCarousels() {
        const carousels = document.querySelectorAll('.carousel, .slider');

        carousels.forEach(carousel => {
            if (!carousel.getAttribute('role')) {
                carousel.setAttribute('role', 'region');
                carousel.setAttribute('aria-label', '图片轮播');
            }

            const slides = carousel.querySelectorAll('.carousel-item, .slide');
            slides.forEach((slide, index) => {
                if (!slide.getAttribute('role')) {
                    slide.setAttribute('role', 'tabpanel');
                }
                if (!slide.getAttribute('aria-label')) {
                    slide.setAttribute('aria-label', `幻灯片 ${index + 1} / ${slides.length}`);
                }
            });
        });
    }

    /**
     * 优化图像
     */
    optimizeImages() {
        const images = document.querySelectorAll('img');

        images.forEach(img => {
            // 跳过装饰性图像
            if (img.getAttribute('role') === 'presentation') {
                return;
            }

            // 确保有alt文本
            if (!img.getAttribute('alt')) {
                const src = img.getAttribute('src') || '';
                if (src.includes('icon') || src.includes('decorative')) {
                    img.setAttribute('alt', '');
                    img.setAttribute('role', 'presentation');
                } else {
                    img.setAttribute('alt', this.generateImageAlt(img));
                }
            }

            // 为长描述添加longdesc
            if (img.hasAttribute('longdesc') && !img.getAttribute('aria-describedby')) {
                const descId = this.generateUniqueId();
                const desc = document.createElement('span');
                desc.id = descId;
                desc.textContent = img.getAttribute('longdesc');
                desc.style.display = 'none';
                img.parentNode.appendChild(desc);
                img.setAttribute('aria-describedby', descId);
            }
        });
    }

    /**
     * 优化图标
     */
    optimizeIcons() {
        const icons = document.querySelectorAll('.icon, [class*="icon-"], svg, i');

        icons.forEach(icon => {
            // 装饰性图标
            if (icon.hasAttribute('aria-hidden') ||
                icon.getAttribute('role') === 'presentation' ||
                icon.closest('button, a')) {
                if (!icon.hasAttribute('aria-hidden')) {
                    icon.setAttribute('aria-hidden', 'true');
                }
                return;
            }

            // 功能性图标
            if (!this.hasAccessibleLabel(icon)) {
                const label = this.generateIconLabel(icon);
                if (label) {
                    icon.setAttribute('aria-label', label);
                    icon.setAttribute('role', 'img');
                }
            }
        });
    }

    /**
     * 优化导航
     */
    optimizeNavigation() {
        const navs = document.querySelectorAll('nav, [role="navigation"]');

        navs.forEach(nav => {
            if (!nav.getAttribute('aria-label')) {
                nav.setAttribute('aria-label', this.generateNavLabel(nav));
            }

            // 优化导航链接
            const links = nav.querySelectorAll('a');
            links.forEach((link, index) => {
                if (!link.getAttribute('aria-label') && !link.textContent.trim()) {
                    link.setAttribute('aria-label', `导航项目 ${index + 1}`);
                }
            });
        });
    }

    /**
     * 优化模态框
     */
    optimizeModals() {
        const modals = document.querySelectorAll('.modal, .dialog, [role="dialog"]');

        modals.forEach(modal => {
            if (!modal.getAttribute('role')) {
                modal.setAttribute('role', 'dialog');
            }
            if (!modal.getAttribute('aria-modal')) {
                modal.setAttribute('aria-modal', 'true');
            }
            if (!modal.getAttribute('aria-label')) {
                modal.setAttribute('aria-label', this.generateModalLabel(modal));
            }

            // 确保模态框可以聚焦
            if (!modal.hasAttribute('tabindex')) {
                modal.setAttribute('tabindex', '-1');
            }

            // 优化关闭按钮
            const closeBtn = modal.querySelector('.close, .close-btn, [aria-label*="关闭"]');
            if (closeBtn && !closeBtn.getAttribute('aria-label')) {
                closeBtn.setAttribute('aria-label', '关闭对话框');
            }
        });
    }

    /**
     * 优化媒体元素
     */
    optimizeMediaElements() {
        // 优化audio元素
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
            if (!audio.getAttribute('aria-label')) {
                audio.setAttribute('aria-label', '音频播放器');
            }

            // 为控件添加标签
            const controls = audio.querySelectorAll('button, input');
            controls.forEach(control => {
                if (!control.getAttribute('aria-label')) {
                    if (control.type === 'range') {
                        control.setAttribute('aria-label', '音量控制');
                    } else if (control.matches('.play-btn, .pause-btn')) {
                        control.setAttribute('aria-label', '播放/暂停');
                    }
                }
            });
        });

        // 优化video元素
        const videoElements = document.querySelectorAll('video');
        videoElements.forEach(video => {
            if (!video.getAttribute('aria-label')) {
                video.setAttribute('aria-label', '视频播放器');
            }
        });
    }

    /**
     * 设置MutationObserver监听动态内容
     */
    setupObservers() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.optimizeElement(node);
                            this.optimizeSubtree(node);
                        }
                    });
                } else if (mutation.type === 'attributes') {
                    const element = mutation.target;
                    if (this.needsARIAOptimization(element)) {
                        this.optimizeElement(element);
                    }
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'role', 'aria-label', 'disabled']
        });

        this.observerInstances.set('main', observer);
    }

    /**
     * 优化单个元素
     */
    optimizeElement(element) {
        if (element.matches('button, [role="button"]')) {
            this.optimizeButtonState(element);
            if (this.isIconOnly(element)) {
                this.enhanceIconButton(element);
            }
        } else if (element.matches('input, textarea, select')) {
            if (!this.hasAssociatedLabel(element)) {
                this.optimizeInputs();
            }
        } else if (element.matches('.modal, .dialog')) {
            this.optimizeModals();
        } else if (element.matches('img')) {
            this.optimizeImages();
        }
    }

    /**
     * 优化子树
     */
    optimizeSubtree(root) {
        // 优化特定类型的组件
        if (root.matches('.playlist')) {
            this.optimizePlaylist();
        } else if (root.matches('.audio-player')) {
            this.optimizeAudioPlayer();
        } else if (root.matches('.theme-switcher')) {
            this.optimizeThemeSwitcher();
        } else if (root.matches('.accordion')) {
            this.optimizeAccordions();
        }
    }

    /**
     * 处理SPA路由变化
     */
    handleSPAChanges() {
        // 监听路由变化
        let lastUrl = location.href;
        new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                // 页面变化后重新优化
                setTimeout(() => {
                    this.optimizeExistingElements();
                    this.announceToScreenReader('页面内容已更新');
                }, 100);
            }
        }).observe(document, { subtree: true, childList: true });
    }

    /**
     * 设置键盘快捷键
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + Shift + H: 帮助
            if (e.altKey && e.shiftKey && e.key === 'H') {
                this.showAccessibilityHelp();
            }

            // Alt + Shift + S: 跳转到主要内容
            if (e.altKey && e.shiftKey && e.key === 'S') {
                const main = document.querySelector('main') ||
                            document.querySelector('[role="main"]') ||
                            document.querySelector('.main-content');
                if (main) {
                    main.setAttribute('tabindex', '-1');
                    main.focus();
                    e.preventDefault();
                }
            }

            // Alt + Shift + N: 跳转到导航
            if (e.altKey && e.shiftKey && e.key === 'N') {
                const nav = document.querySelector('nav') ||
                           document.querySelector('[role="navigation"]');
                if (nav) {
                    nav.setAttribute('tabindex', '-1');
                    nav.focus();
                    e.preventDefault();
                }
            }
        });
    }

    /**
     * 显示无障碍帮助
     */
    showAccessibilityHelp() {
        const helpId = 'accessibility-help';
        let help = document.getElementById(helpId);

        if (!help) {
            help = document.createElement('div');
            help.id = helpId;
            help.setAttribute('role', 'dialog');
            help.setAttribute('aria-modal', 'true');
            help.setAttribute('aria-label', '无障碍功能帮助');
            help.className = 'accessibility-help-modal';
            help.innerHTML = `
                <style>
                    .accessibility-help-modal {
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: var(--bg-secondary);
                        border: 2px solid var(--border-primary);
                        border-radius: 12px;
                        padding: 24px;
                        max-width: 500px;
                        max-height: 80vh;
                        overflow-y: auto;
                        z-index: 10000;
                        box-shadow: var(--shadow-heavy);
                    }
                    .accessibility-help-modal h2 {
                        margin-top: 0;
                        color: var(--text-primary);
                    }
                    .accessibility-help-modal h3 {
                        color: var(--text-primary);
                        margin-top: 20px;
                    }
                    .accessibility-help-modal ul {
                        padding-left: 20px;
                    }
                    .accessibility-help-modal li {
                        margin: 8px 0;
                        color: var(--text-secondary);
                    }
                    .accessibility-help-modal .close-help {
                        position: absolute;
                        top: 12px;
                        right: 12px;
                        background: none;
                        border: none;
                        color: var(--text-primary);
                        font-size: 24px;
                        cursor: pointer;
                        width: 32px;
                        height: 32px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                </style>
                <button class="close-help" aria-label="关闭帮助">&times;</button>
                <h2>无障碍功能帮助</h2>
                <h3>键盘快捷键</h3>
                <ul>
                    <li><kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>H</kbd> - 显示此帮助</li>
                    <li><kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> - 跳转到主要内容</li>
                    <li><kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>N</kbd> - 跳转到导航</li>
                    <li><kbd>Tab</kbd> - 在元素间导航</li>
                    <li><kbd>Shift</kbd> + <kbd>Tab</kbd> - 反向导航</li>
                    <li><kbd>Enter</kbd> / <kbd>Space</kbd> - 激活按钮或链接</li>
                    <li><kbd>Esc</kbd> - 关闭对话框或取消操作</li>
                </ul>
                <h3>屏幕阅读器支持</h3>
                <ul>
                    <li>所有按钮都有中文标签</li>
                    <li>表单字段有描述性标签</li>
                    <li>动态内容更新会自动播报</li>
                    <li>错误状态会及时通知</li>
                </ul>
                <h3>其他功能</h3>
                <ul>
                    <li>高对比度模式支持</li>
                    <li>响应式设计适配各种设备</li>
                    <li>键盘完全可访问</li>
                    <li>清晰的焦点指示器</li>
                </ul>
            `;

            document.body.appendChild(help);

            // 关闭按钮事件
            help.querySelector('.close-help').addEventListener('click', () => {
                help.remove();
            });

            // ESC键关闭
            const handleEsc = (e) => {
                if (e.key === 'Escape') {
                    help.remove();
                    document.removeEventListener('keydown', handleEsc);
                }
            };
            document.addEventListener('keydown', handleEsc);
        }

        // 聚焦到帮助对话框
        help.focus();
    }

    /**
     * 生成按钮标签
     */
    generateButtonLabel(button) {
        // 检查图标类名
        const iconClasses = Array.from(button.classList)
            .find(cls => cls.includes('icon-') || cls.includes('-btn') || cls.includes('-button'));

        if (iconClasses) {
            const iconType = iconClasses.replace(/-?btn|-?button/g, '').replace(/^-/, '');
            return this.labelMappings[iconType] || iconType;
        }

        // 检查data属性
        const dataLabel = button.getAttribute('data-label') ||
                         button.getAttribute('data-action') ||
                         button.getAttribute('title');
        if (dataLabel) {
            return this.labelMappings[dataLabel] || dataLabel;
        }

        // 检查文本内容
        const text = button.textContent.trim();
        if (text) {
            return text;
        }

        return '按钮';
    }

    /**
     * 生成图像alt文本
     */
    generateImageAlt(img) {
        const src = img.getAttribute('src') || '';
        const classes = Array.from(img.classList);

        // 根据类名判断
        if (classes.some(cls => cls.includes('logo'))) {
            return '网站标志';
        }
        if (classes.some(cls => cls.includes('avatar'))) {
            return '用户头像';
        }
        if (classes.some(cls => cls.includes('banner'))) {
            return '横幅图片';
        }
        if (classes.some(cls => cls.includes('thumbnail'))) {
            return '缩略图';
        }

        // 根据文件名判断
        const filename = src.split('/').pop();
        if (filename.includes('cover')) {
            return '封面图片';
        }
        if (filename.includes('background')) {
            return '背景图片';
        }
        if (filename.includes('icon')) {
            return '图标';
        }

        return '图片';
    }

    /**
     * 生成图标标签
     */
    generateIconLabel(icon) {
        const classes = Array.from(icon.classList);
        const iconClass = classes.find(cls => cls.includes('fa-') || cls.includes('icon-'));

        if (iconClass) {
            const iconName = iconClass.replace(/^fa-|^icon-/, '');
            return this.labelMappings[iconName] || iconName;
        }

        return '图标';
    }

    /**
     * 生成导航标签
     */
    generateNavLabel(nav) {
        const classes = Array.from(nav.classList);
        if (classes.some(cls => cls.includes('main'))) {
            return '主导航';
        }
        if (classes.some(cls => cls.includes('footer'))) {
            return '底部导航';
        }
        if (classes.some(cls => cls.includes('side'))) {
            return '侧边导航';
        }
        if (classes.some(cls => cls.includes('breadcrumb'))) {
            return '面包屑导航';
        }
        return '导航菜单';
    }

    /**
     * 生成模态框标签
     */
    generateModalLabel(modal) {
        const heading = modal.querySelector('h1, h2, h3, h4, h5, h6');
        if (heading) {
            return heading.textContent.trim();
        }

        const classes = Array.from(modal.classList);
        if (classes.some(cls => cls.includes('login'))) {
            return '登录对话框';
        }
        if (classes.some(cls => cls.includes('signup'))) {
            return '注册对话框';
        }
        if (classes.some(cls => cls.includes('settings'))) {
            return '设置对话框';
        }

        return '对话框';
    }

    /**
     * 增强图标按钮
     */
    enhanceIconButton(button) {
        // 添加更大的点击区域
        if (!button.style.minWidth) {
            button.style.minWidth = '44px';
            button.style.minHeight = '44px';
        }

        // 添加tooltip（如果没有）
        if (!button.getAttribute('title') && !button.querySelector('.tooltip')) {
            const label = button.getAttribute('aria-label');
            if (label) {
                button.setAttribute('title', label);
            }
        }
    }

    /**
     * 设置进度条无障碍功能
     */
    setupProgressBarAccessibility(progressBar) {
        const updateValues = () => {
            const value = progressBar.value || 0;
            const min = progressBar.min || 0;
            const max = progressBar.max || 100;
            const percentage = ((value - min) / (max - min) * 100).toFixed(0);

            progressBar.setAttribute('aria-valuenow', value);
            progressBar.setAttribute('aria-valuemin', min);
            progressBar.setAttribute('aria-valuemax', max);
            progressBar.setAttribute('aria-valuetext', `${percentage}%`);
        };

        updateValues();
        progressBar.addEventListener('input', updateValues);
    }

    /**
     * 更新range输入值
     */
    updateRangeValue(input) {
        const updateValues = () => {
            const value = input.value || 0;
            const min = input.min || 0;
            const max = input.max || 100;
            const percentage = ((value - min) / (max - min) * 100).toFixed(0);

            input.setAttribute('aria-valuenow', value);
            input.setAttribute('aria-valuemin', min);
            input.setAttribute('aria-valuemax', max);
            input.setAttribute('aria-valuetext', `${percentage}%`);
        };

        updateValues();
        input.addEventListener('input', updateValues);
    }

    /**
     * 添加错误消息
     */
    addErrorMessage(input) {
        const errorId = `${input.id}-error`;
        if (!document.getElementById(errorId)) {
            const error = document.createElement('div');
            error.id = errorId;
            error.className = 'error-message';
            error.setAttribute('role', 'alert');
            error.textContent = input.getAttribute('data-error') || '此字段填写有误';
            error.style.display = 'none';
            input.parentNode.insertBefore(error, input.nextSibling);

            // 显示错误
            if (input.hasAttribute('invalid') || input.classList.contains('error')) {
                error.style.display = 'block';
                input.setAttribute('aria-describedby', errorId);
            }
        }
    }

    /**
     * 向屏幕阅读器广播消息
     */
    announceToScreenReader(message, priority = 'polite') {
        const region = this.liveRegions.get(priority) || this.liveRegions.get('polite');
        if (region) {
            region.textContent = message;

            // 清除消息以便下次使用
            setTimeout(() => {
                region.textContent = '';
            }, 1000);
        }
    }

    /**
     * 广播状态变化
     */
    announceStatusChange(status) {
        this.announceToScreenReader(status, 'assertive');
    }

    /**
     * 广播错误消息
     */
    announceError(message) {
        this.announceToScreenReader(`错误：${message}`, 'assertive');
    }

    /**
     * 广播成功消息
     */
    announceSuccess(message) {
        this.announceToScreenReader(`成功：${message}`, 'polite');
    }

    /**
     * 检查元素是否有可访问标签
     */
    hasAccessibleLabel(element) {
        return (
            element.getAttribute('aria-label') ||
            element.getAttribute('aria-labelledby') ||
            (element.tagName === 'INPUT' && this.hasAssociatedLabel(element)) ||
            (element.textContent && element.textContent.trim()) ||
            element.getAttribute('title')
        );
    }

    /**
     * 检查输入元素是否有关联标签
     */
    hasAssociatedLabel(input) {
        const id = input.id;
        if (id) {
            const label = document.querySelector(`label[for="${id}"]`);
            return !!label;
        }
        return false;
    }

    /**
     * 检查是否是仅图标按钮
     */
    isIconOnly(element) {
        const text = element.textContent.trim();
        return !text || text.length === 0 || element.innerHTML.trim() === '';
    }

    /**
     * 检查是否需要ARIA优化
     */
    needsARIAOptimization(element) {
        return element.matches('button, input, select, textarea, a, [role]') &&
               !this.hasAccessibleLabel(element);
    }

    /**
     * 优化按钮状态
     */
    optimizeButtonState(button) {
        // 切换状态按钮
        if (button.getAttribute('aria-pressed') !== null) {
            button.addEventListener('click', () => {
                const isPressed = button.getAttribute('aria-pressed') === 'true';
                button.setAttribute('aria-pressed', !isPressed);
            });
        }

        // 展开/折叠状态
        if (button.getAttribute('aria-expanded') !== null) {
            button.addEventListener('click', () => {
                const isExpanded = button.getAttribute('aria-expanded') === 'true';
                button.setAttribute('aria-expanded', !isExpanded);
            });
        }
    }

    /**
     * 生成唯一ID
     */
    generateUniqueId() {
        return `aria-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 公共API
     */

    // 手动优化新添加的元素
    optimizeNewElement(element) {
        this.optimizeElement(element);
        this.optimizeSubtree(element);
    }

    // 更新实时广播
    updateAnnouncement(message, priority = 'polite') {
        this.announceToScreenReader(message, priority);
    }

    // 设置元素的加载状态
    setLoading(element, isLoading) {
        if (isLoading) {
            element.setAttribute('aria-busy', 'true');
            this.announceToScreenReader('正在加载');
        } else {
            element.setAttribute('aria-busy', 'false');
            this.announceToScreenReader('加载完成');
        }
    }

    // 标记区域为正在更新
    markRegionUpdating(regionId, isUpdating) {
        const region = document.getElementById(regionId);
        if (region) {
            if (isUpdating) {
                region.setAttribute('aria-busy', 'true');
                region.setAttribute('aria-live', 'polite');
            } else {
                region.setAttribute('aria-busy', 'false');
            }
        }
    }

    // 销毁实例
    destroy() {
        this.observerInstances.forEach(observer => observer.disconnect());
        this.observerInstances.clear();
        this.liveRegions.clear();
        this.initialized = false;
    }
}

// 创建全局实例
if (typeof window !== 'undefined') {
    window.ariaOptimizer = new ARIAOptimizer();

    // 导出到全局命名空间
    window.ARIAOptimizer = ARIAOptimizer;

    // 自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.ariaOptimizer.init();
        });
    } else {
        window.ariaOptimizer.init();
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ARIAOptimizer;
}