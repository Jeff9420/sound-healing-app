/**
 * Content Management System
 * 内容管理系统 - 动态管理和更新网站内容
 * Version: 1.0.0
 */

class ContentManager {
    constructor() {
        this.config = {
            apiEndpoint: '/api/content',
            cacheExpiry: 5 * 60 * 1000, // 5分钟
            enablePreview: true,
            enableVersioning: true,
            autoSave: true,
            autoSaveInterval: 30000 // 30秒
        };

        this.content = {
            pages: new Map(),
            components: new Map(),
            resources: new Map(),
            audio: new Map(),
            userContent: new Map()
        };

        this.cache = new Map();
        this.version = '1.0.0';
        this.editMode = false;
        this.currentEditor = null;

        this.init();
    }

    init() {
        this.loadContent();
        this.setupContentAPI();
        this.initializeEditor();
        this.setupAutoSave();
        this.setupContentSync();

        console.log('📝 Content Manager initialized');
    }

    /**
     * 加载内容
     */
    async loadContent() {
        try {
            // 从本地存储加载缓存
            this.loadFromCache();

            // 从服务器加载最新内容
            await this.fetchContent();

            // 应用内容到页面
            this.applyContent();
        } catch (error) {
            console.error('Failed to load content:', error);
            // 使用离线内容
            this.loadOfflineContent();
        }
    }

    /**
     * 从缓存加载
     */
    loadFromCache() {
        const cached = localStorage.getItem('contentCache');
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < this.config.cacheExpiry) {
                this.content = new Map(Object.entries(data));
                console.log('✅ Loaded content from cache');
            }
        }
    }

    /**
     * 获取内容
     */
    async fetchContent() {
        const response = await fetch(`${this.config.apiEndpoint}?v=${this.version}`);
        if (!response.ok) throw new Error('Failed to fetch content');

        const data = await response.json();

        // 更新内容
        this.content = new Map(Object.entries(data));

        // 缓存内容
        this.saveToCache(data);

        console.log('✅ Fetched fresh content');
    }

    /**
     * 保存到缓存
     */
    saveToCache(data) {
        const cacheData = {
            data: data,
            timestamp: Date.now()
        };
        localStorage.setItem('contentCache', JSON.stringify(cacheData));
    }

    /**
     * 加载离线内容
     */
    loadOfflineContent() {
        const defaultContent = {
            // 页面内容
            'index-hero': {
                title: '声音疗愈空间',
                subtitle: '探索声音的治愈力量',
                description: '213+ 沉浸式疗愈音频，帮你在 5 分钟内放松、睡眠与重启专注'
            },
            'resources-title': {
                text: '声音疗愈资源中心',
                description: '探索我们的精选学习资源，掌握声音疗愈技巧'
            },

            // 组件内容
            'category-meditation': {
                name: '冥想音乐',
                description: '14首专业冥想引导音频',
                icon: '🧘'
            },
            'category-sleep': {
                name: '雨声助眠',
                description: '14种不同雨声音效',
                icon: '🌧️'
            },
            'category-healing': {
                name: '颂钵疗愈',
                description: '61首西藏颂钵音频',
                icon: '🔔'
            }
        };

        this.content = new Map(Object.entries(defaultContent));
        console.log('📴 Using offline content');
    }

    /**
     * 应用内容到页面
     */
    applyContent() {
        // 更新页面标题和描述
        this.updatePageMeta();

        // 更新动态内容区域
        this.updateDynamicSections();

        // 更新音频资源
        this.updateAudioResources();

        // 更新多语言内容
        this.updateI18nContent();
    }

    /**
     * 更新页面元数据
     */
    updatePageMeta() {
        const metaContent = this.content.get('meta');
        if (metaContent) {
            document.title = metaContent.title || document.title;

            // 更新 meta description
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc && metaContent.description) {
                metaDesc.content = metaContent.description;
            }
        }
    }

    /**
     * 更新动态区域
     */
    updateDynamicSections() {
        // 更新英雄区域
        const heroContent = this.content.get('hero');
        if (heroContent) {
            const heroTitle = document.querySelector('[data-content="hero-title"]');
            const heroDesc = document.querySelector('[data-content="hero-description"]');

            if (heroTitle) heroTitle.textContent = heroContent.title;
            if (heroDesc) heroDesc.textContent = heroContent.description;
        }

        // 更新资源中心
        const resourcesContent = this.content.get('resources');
        if (resourcesContent) {
            resourcesContent.sections?.forEach(section => {
                const element = document.querySelector(`[data-content="${section.id}"]`);
                if (element) {
                    element.innerHTML = section.content;
                }
            });
        }
    }

    /**
     * 更新音频资源
     */
    updateAudioResources() {
        const audioContent = this.content.get('audio');
        if (audioContent) {
            // 更新音频配置
            if (window.AUDIO_CONFIG && audioContent.categories) {
                Object.assign(window.AUDIO_CONFIG, audioContent.categories);
            }
        }
    }

    /**
     * 更新多语言内容
     */
    updateI18nContent() {
        const i18nContent = this.content.get('i18n');
        if (i18nContent && window.i18n) {
            // 合并翻译内容
            Object.keys(i18nContent).forEach(lang => {
                if (window.i18n.translations[lang]) {
                    Object.assign(window.i18n.translations[lang], i18nContent[lang]);
                }
            });
        }
    }

    /**
     * 设置内容API
     */
    setupContentAPI() {
        // 创建全局内容管理接口
        window.contentManager = {
            // 获取内容
            get: (key) => this.content.get(key),

            // 设置内容
            set: (key, value) => this.setContent(key, value),

            // 更新内容
            update: (key, updates) => this.updateContent(key, updates),

            // 删除内容
            delete: (key) => this.deleteContent(key),

            // 获取所有内容
            getAll: () => Object.fromEntries(this.content),

            // 刷新内容
            refresh: () => this.loadContent(),

            // 启用编辑模式
            enableEdit: () => this.enableEditMode(),

            // 禁用编辑模式
            disableEdit: () => this.disableEditMode()
        };
    }

    /**
     * 设置内容
     */
    setContent(key, value) {
        this.content.set(key, value);
        this.applySingleContent(key, value);

        if (this.config.autoSave) {
            this.saveContent();
        }
    }

    /**
     * 更新内容
     */
    updateContent(key, updates) {
        const current = this.content.get(key) || {};
        const updated = { ...current, ...updates };
        this.setContent(key, updated);
    }

    /**
     * 删除内容
     */
    deleteContent(key) {
        this.content.delete(key);
        this.removeContentElement(key);

        if (this.config.autoSave) {
            this.saveContent();
        }
    }

    /**
     * 应用单个内容
     */
    applySingleContent(key, value) {
        const elements = document.querySelectorAll(`[data-content="${key}"]`);
        elements.forEach(element => {
            if (typeof value === 'string') {
                element.textContent = value;
            } else if (value.html) {
                element.innerHTML = value.html;
            } else if (value.text) {
                element.textContent = value.text;
            }
        });
    }

    /**
     * 移除内容元素
     */
    removeContentElement(key) {
        const elements = document.querySelectorAll(`[data-content="${key}"]`);
        elements.forEach(element => {
            element.remove();
        });
    }

    /**
     * 初始化编辑器
     */
    initializeEditor() {
        // 创建编辑器工具栏
        const editorToolbar = document.createElement('div');
        editorToolbar.id = 'content-editor-toolbar';
        editorToolbar.innerHTML = `
            <div class="toolbar-section">
                <button class="toolbar-btn" onclick="contentManager.enableEdit()">
                    <span class="icon">✏️</span>
                    <span>编辑内容</span>
                </button>
                <button class="toolbar-btn" onclick="contentManager.disableEdit()">
                    <span class="icon">👁️</span>
                    <span>预览模式</span>
                </button>
            </div>
            <div class="toolbar-section">
                <button class="toolbar-btn" onclick="contentManager.saveContent()">
                    <span class="icon">💾</span>
                    <span>保存</span>
                </button>
                <button class="toolbar-btn" onclick="contentManager.refresh()">
                    <span class="icon">🔄</span>
                    <span>刷新</span>
                </button>
            </div>
        `;

        // 添加编辑器样式
        this.addEditorStyles();

        // 只在开发环境显示
        if (this.isDevelopment()) {
            document.body.appendChild(editorToolbar);
        }
    }

    /**
     * 添加编辑器样式
     */
    addEditorStyles() {
        const styles = `
            <style id="content-editor-styles">
                #content-editor-toolbar {
                    position: fixed;
                    top: 10px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    z-index: 10001;
                    display: flex;
                    gap: 16px;
                    font-size: 14px;
                }

                .toolbar-section {
                    display: flex;
                    gap: 8px;
                    padding: 0 8px;
                    border-right: 1px solid #ddd;
                }

                .toolbar-section:last-child {
                    border-right: none;
                }

                .toolbar-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border: 1px solid #ddd;
                    background: white;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .toolbar-btn:hover {
                    background: #f5f5f5;
                    border-color: #667eea;
                }

                .toolbar-btn.active {
                    background: #667eea;
                    color: white;
                    border-color: #667eea;
                }

                [contenteditable="true"] {
                    outline: 2px dashed #667eea;
                    outline-offset: 2px;
                    border-radius: 4px;
                    padding: 4px;
                }

                [contenteditable="true"]:hover {
                    background: rgba(102, 126, 255, 0.05);
                }

                .content-edit-hint {
                    position: absolute;
                    top: -30px;
                    right: 0;
                    background: #333;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    white-space: nowrap;
                    pointer-events: none;
                }

                .content-save-indicator {
                    position: fixed;
                    top: 60px;
                    right: 20px;
                    background: #2ed573;
                    color: white;
                    padding: 8px 16px;
                    border-radius: 4px;
                    font-size: 14px;
                    opacity: 0;
                    transform: translateY(-10px);
                    transition: all 0.3s;
                }

                .content-save-indicator.show {
                    opacity: 1;
                    transform: translateY(0);
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    /**
     * 启用编辑模式
     */
    enableEditMode() {
        this.editMode = true;
        document.body.classList.add('content-edit-mode');

        // 使可编辑元素可编辑
        const editableElements = document.querySelectorAll('[data-content]');
        editableElements.forEach(element => {
            element.contentEditable = true;
            element.addEventListener('input', (e) => {
                this.handleContentEdit(e.target);
            });

            // 添加编辑提示
            this.addEditHint(element);
        });

        // 更新工具栏状态
        this.updateToolbarState();

        console.log('✏️ Edit mode enabled');
    }

    /**
     * 禁用编辑模式
     */
    disableEditMode() {
        this.editMode = false;
        document.body.classList.remove('content-edit-mode');

        // 移除可编辑性
        const editableElements = document.querySelectorAll('[data-content]');
        editableElements.forEach(element => {
            element.contentEditable = false;
            element.removeEventListener('input', this.handleContentEdit);
            this.removeEditHint(element);
        });

        // 更新工具栏状态
        this.updateToolbarState();

        console.log('👁️ Preview mode enabled');
    }

    /**
     * 添加编辑提示
     */
    addEditHint(element) {
        const hint = document.createElement('div');
        hint.className = 'content-edit-hint';
        hint.textContent = '点击编辑';
        element.style.position = 'relative';
        element.appendChild(hint);
    }

    /**
     * 移除编辑提示
     */
    removeEditHint(element) {
        const hint = element.querySelector('.content-edit-hint');
        if (hint) hint.remove();
    }

    /**
     * 处理内容编辑
     */
    handleContentEdit(element) {
        const key = element.dataset.content;
        const value = element.textContent || element.innerHTML;

        this.content.set(key, {
            text: value,
            lastModified: Date.now(),
            modifiedBy: 'admin'
        });

        // 触发自动保存
        if (this.config.autoSave) {
            this.debounceSave();
        }
    }

    /**
     * 防抖保存
     */
    debounceSave = debounce(() => {
        this.saveContent();
    }, 1000);

    /**
     * 保存内容
     */
    async saveContent() {
        try {
            // 保存到服务器
            const response = await fetch(this.config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: Object.fromEntries(this.content),
                    version: this.version,
                    timestamp: Date.now()
                })
            });

            if (response.ok) {
                this.showSaveIndicator(true);
                console.log('✅ Content saved successfully');
            } else {
                throw new Error('Save failed');
            }
        } catch (error) {
            console.error('Failed to save content:', error);
            // 保存到本地
            this.saveToCache(Object.fromEntries(this.content));
            this.showSaveIndicator(false);
        }
    }

    /**
     * 显示保存指示器
     */
    showSaveIndicator(success) {
        let indicator = document.querySelector('.content-save-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'content-save-indicator';
            document.body.appendChild(indicator);
        }

        indicator.textContent = success ? '✅ 已保存' : '❌ 保存失败';
        indicator.classList.add('show');

        setTimeout(() => {
            indicator.classList.remove('show');
        }, 2000);
    }

    /**
     * 设置自动保存
     */
    setupAutoSave() {
        if (this.config.autoSave) {
            setInterval(() => {
                if (this.editMode) {
                    this.saveContent();
                }
            }, this.config.autoSaveInterval);
        }
    }

    /**
     * 设置内容同步
     */
    setupContentSync() {
        // 监听存储事件（多标签页同步）
        window.addEventListener('storage', (e) => {
            if (e.key === 'contentCache') {
                this.loadContent();
            }
        });

        // 定期检查更新
        setInterval(() => {
            this.checkForUpdates();
        }, 60000); // 每分钟检查一次
    }

    /**
     * 检查更新
     */
    async checkForUpdates() {
        try {
            const response = await fetch(`${this.config.apiEndpoint}/version`);
            const { version } = await response.json();

            if (version !== this.version) {
                console.log('🆕 New content version available');
                this.loadContent();
                this.version = version;
            }
        } catch (error) {
            console.warn('Failed to check for updates:', error);
        }
    }

    /**
     * 更新工具栏状态
     */
    updateToolbarState() {
        const editBtn = document.querySelector('.toolbar-btn:nth-child(1)');
        const previewBtn = document.querySelector('.toolbar-btn:nth-child(2)');

        if (this.editMode) {
            editBtn?.classList.add('active');
            previewBtn?.classList.remove('active');
        } else {
            editBtn?.classList.remove('active');
            previewBtn?.classList.add('active');
        }
    }

    /**
     * 检查是否为开发环境
     */
    isDevelopment() {
        return window.location.hostname === 'localhost' ||
               window.location.hostname === '127.0.0.1' ||
               window.location.search.includes('edit=true');
    }

    /**
     * 创建内容模板
     */
    createTemplate(type, data) {
        const templates = {
            hero: `
                <h1 data-content="hero-title">${data.title || '标题'}</h1>
                <p data-content="hero-description">${data.description || '描述'}</p>
            `,
            section: `
                <section class="content-section">
                    <h2 data-content="${data.id}-title">${data.title}</h2>
                    <div data-content="${data.id}-content">${data.content}</div>
                </section>
            `,
            category: `
                <div class="category-card" data-content="category-${data.id}">
                    <h3>${data.name}</h3>
                    <p>${data.description}</p>
                </div>
            `
        };

        return templates[type] || '';
    }

    /**
     * 导入内容
     */
    importContent(content) {
        Object.entries(content).forEach(([key, value]) => {
            this.content.set(key, value);
        });
        this.applyContent();
        this.saveContent();
    }

    /**
     * 导出内容
     */
    exportContent() {
        return {
            content: Object.fromEntries(this.content),
            version: this.version,
            exportDate: new Date().toISOString()
        };
    }

    /**
     * 清理缓存
     */
    clearCache() {
        this.cache.clear();
        localStorage.removeItem('contentCache');
        console.log('🗑️ Cache cleared');
    }
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 初始化内容管理器
window.contentManagerSystem = new ContentManager();

// 导出
window.ContentManager = ContentManager;