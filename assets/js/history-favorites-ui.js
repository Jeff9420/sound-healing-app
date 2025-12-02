/**
 * HistoryFavoritesUI - 播放历史和收藏UI管理器
 *
 * 提供播放历史和收藏列表的UI界面
 *
 * @class
 * @author Sound Healing Team
 * @version 1.0.0
 */

class HistoryFavoritesUI {
    constructor(userDataManager) {
        this.userDataManager = userDataManager;
        this.currentView = 'history'; // 'history' or 'favorites'
        this.i18n = null; // 将在初始化时设置

        // 绑定方法
        this.render = this.render.bind(this);
        this.renderHistoryList = this.renderHistoryList.bind(this);
        this.renderFavoritesList = this.renderFavoritesList.bind(this);
    }

    /**
     * 初始化UI
     */
    initialize() {
        // 监听数据更新事件
        window.addEventListener('userData:historyUpdated', () => {
            if (this.currentView === 'history') {
                this.renderHistoryList();
            }
        });

        window.addEventListener('userData:favoritesUpdated', () => {
            if (this.currentView === 'favorites') {
                this.renderFavoritesList();
            }
        });

        console.log('✅ HistoryFavoritesUI 已初始化');
    }

    /**
     * 设置国际化实例
     */
    setI18n(i18nInstance) {
        this.i18n = i18nInstance;
    }

    /**
     * 获取翻译文本
     */
    t(key, defaultText) {
        if (this.i18n && typeof this.i18n.t === 'function') {
            return this.i18n.t(key);
        }
        return defaultText || key;
    }

    /**
     * 打开历史/收藏面板
     */
    openPanel(view = 'history') {
        this.currentView = view;

        // 创建或更新模态框
        let modal = document.getElementById('historyFavoritesModal');

        if (!modal) {
            modal = this.createModal();
            document.body.appendChild(modal);
        }

        this.render();
        modal.style.display = 'flex';

        // 添加打开动画
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }

    /**
     * 关闭面板
     */
    closePanel() {
        const modal = document.getElementById('historyFavoritesModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }

    /**
     * 创建模态框结构
     */
    createModal() {
        const modal = document.createElement('div');
        modal.id = 'historyFavoritesModal';
        modal.className = 'history-favorites-modal';
        modal.innerHTML = `
            <div class="hf-modal-content">
                <div class="hf-header">
                    <div class="hf-tabs">
                        <button class="hf-tab active" data-view="history">
                            📜 <span data-i18n="history.title">播放历史</span>
                        </button>
                        <button class="hf-tab" data-view="favorites">
                            ⭐ <span data-i18n="favorites.title">我的收藏</span>
                        </button>
                    </div>
                    <button class="hf-close" onclick="window.historyFavoritesUI.closePanel()">
                        <span data-i18n="modal.close">&times;</span>
                    </button>
                </div>
                <div class="hf-toolbar">
                    <div class="hf-stats" id="hfStats"></div>
                    <div class="hf-actions">
                        <button class="hf-btn-secondary" id="hfExportBtn">
                            📥 <span data-i18n="data.export">导出</span>
                        </button>
                        <button class="hf-btn-danger" id="hfClearBtn">
                            🗑️ <span data-i18n="data.clear">清空</span>
                        </button>
                    </div>
                </div>
                <div class="hf-content" id="hfContent">
                    <!-- 内容将动态填充 -->
                </div>
            </div>
        `;

        // 绑定事件
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closePanel();
            }
        });

        // 标签切换
        modal.querySelectorAll('.hf-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const view = tab.dataset.view;
                this.switchView(view);
            });
        });

        // 清空按钮
        modal.querySelector('#hfClearBtn').addEventListener('click', () => {
            this.handleClear();
        });

        // 导出按钮
        modal.querySelector('#hfExportBtn').addEventListener('click', () => {
            this.handleExport();
        });

        return modal;
    }

    /**
     * 切换视图
     */
    switchView(view) {
        this.currentView = view;

        // 更新标签状态
        document.querySelectorAll('.hf-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.view === view);
        });

        this.render();
    }

    /**
     * 渲染主内容
     */
    render() {
        if (this.currentView === 'history') {
            this.renderHistoryList();
        } else {
            this.renderFavoritesList();
        }

        this.updateStats();
    }

    /**
     * 渲染历史列表
     */
    renderHistoryList() {
        const content = document.getElementById('hfContent');
        if (!content) return; // 如果元素不存在（如在沉浸式页面上），直接返回

        const history = this.userDataManager.getHistory();

        if (history.length === 0) {
            content.innerHTML = `
                <div class="hf-empty">
                    <div class="hf-empty-icon">📜</div>
                    <p data-i18n="history.empty">暂无播放历史</p>
                    <p class="hf-empty-hint" data-i18n="history.emptyHint">开始播放音频后，这里会显示您的播放记录</p>
                </div>
            `;
            return;
        }

        const listHtml = history.map(item => `
            <div class="hf-item" data-track-id="${item.id}">
                <div class="hf-item-icon">🎵</div>
                <div class="hf-item-info">
                    <div class="hf-item-title">${this.escapeHtml(item.displayName)}</div>
                    <div class="hf-item-meta">
                        <span class="hf-item-category">${this.escapeHtml(item.category)}</span>
                        <span class="hf-item-time">${this.formatTimeAgo(item.playedAt)}</span>
                    </div>
                </div>
                <div class="hf-item-actions">
                    <button class="hf-item-btn" onclick="window.historyFavoritesUI.playTrack('${item.category}', '${this.escapeHtml(item.fileName)}')" title="${this.t('actions.play', '播放')}">
                        ▶️
                    </button>
                    <button class="hf-item-btn" onclick="window.historyFavoritesUI.toggleFavorite({category:'${item.category}',fileName:'${this.escapeHtml(item.fileName)}',displayName:'${this.escapeHtml(item.displayName)}'})" title="${this.t('actions.favorite', '收藏')}">
                        ${this.userDataManager.isFavorite(item.id) ? '⭐' : '☆'}
                    </button>
                    <button class="hf-item-btn hf-btn-remove" onclick="window.historyFavoritesUI.removeFromHistory('${item.id}')" title="${this.t('actions.remove', '移除')}">
                        ✕
                    </button>
                </div>
            </div>
        `).join('');

        content.innerHTML = `<div class="hf-list">${listHtml}</div>`;
    }

    /**
     * 渲染收藏列表
     */
    renderFavoritesList() {
        const content = document.getElementById('hfContent');
        if (!content) return; // 如果元素不存在（如在沉浸式页面上），直接返回

        const favorites = this.userDataManager.getFavorites();

        if (favorites.length === 0) {
            content.innerHTML = `
                <div class="hf-empty">
                    <div class="hf-empty-icon">⭐</div>
                    <p data-i18n="favorites.empty">暂无收藏</p>
                    <p class="hf-empty-hint" data-i18n="favorites.emptyHint">点击音频旁的星标按钮来收藏您喜欢的音频</p>
                </div>
            `;
            return;
        }

        const listHtml = favorites.map(item => `
            <div class="hf-item" data-track-id="${item.id}">
                <div class="hf-item-icon">⭐</div>
                <div class="hf-item-info">
                    <div class="hf-item-title">${this.escapeHtml(item.displayName)}</div>
                    <div class="hf-item-meta">
                        <span class="hf-item-category">${this.escapeHtml(item.category)}</span>
                        <span class="hf-item-time">${this.formatTimeAgo(item.addedAt)}</span>
                    </div>
                </div>
                <div class="hf-item-actions">
                    <button class="hf-item-btn" onclick="window.historyFavoritesUI.playTrack('${item.category}', '${this.escapeHtml(item.fileName)}')" title="${this.t('actions.play', '播放')}">
                        ▶️
                    </button>
                    <button class="hf-item-btn hf-btn-remove" onclick="window.historyFavoritesUI.removeFromFavorites('${item.id}')" title="${this.t('actions.remove', '取消收藏')}">
                        ✕
                    </button>
                </div>
            </div>
        `).join('');

        content.innerHTML = `<div class="hf-list">${listHtml}</div>`;
    }

    /**
     * 更新统计信息
     */
    updateStats() {
        const statsEl = document.getElementById('hfStats');
        if (!statsEl) {
            return;
        }

        if (this.currentView === 'history') {
            const count = this.userDataManager.getHistory().length;
            statsEl.innerHTML = `<span data-i18n="history.count">共 ${count} 条记录</span>`;
        } else {
            const count = this.userDataManager.getFavorites().length;
            statsEl.innerHTML = `<span data-i18n="favorites.count">共 ${count} 个收藏</span>`;
        }
    }

    /**
     * 播放音频
     */
    playTrack(category, fileName) {
        // 调用全局音频管理器播放
        if (window.audioManager) {
            window.audioManager.playTrack(null, category, fileName);
            this.closePanel();
        }
    }

    /**
     * 切换收藏状态
     */
    toggleFavorite(trackInfo) {
        this.userDataManager.toggleFavorite(trackInfo);
        this.render();
    }

    /**
     * 从历史中移除
     */
    removeFromHistory(trackId) {
        if (confirm(this.t('history.confirmRemove', '确定要删除这条记录吗？'))) {
            this.userDataManager.removeFromHistory(trackId);
        }
    }

    /**
     * 从收藏中移除
     */
    removeFromFavorites(trackId) {
        if (confirm(this.t('favorites.confirmRemove', '确定要取消收藏吗？'))) {
            this.userDataManager.removeFromFavorites(trackId);
        }
    }

    /**
     * 处理清空操作
     */
    handleClear() {
        const confirmMsg = this.currentView === 'history'
            ? this.t('history.confirmClear', '确定要清空所有播放历史吗？此操作无法撤销！')
            : this.t('favorites.confirmClear', '确定要清空所有收藏吗？此操作无法撤销！');

        if (confirm(confirmMsg)) {
            if (this.currentView === 'history') {
                this.userDataManager.clearHistory();
            } else {
                this.userDataManager.clearFavorites();
            }
            this.render();
        }
    }

    /**
     * 处理导出操作
     */
    handleExport() {
        const data = this.userDataManager.exportData();
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `sound-healing-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        URL.revokeObjectURL(url);
    }

    /**
     * 格式化时间
     */
    formatTimeAgo(timestamp) {
        const now = new Date();
        const past = new Date(timestamp);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) {
            return this.t('time.justNow', '刚刚');
        }
        if (diffMins < 60) {
            return `${diffMins}${this.t('time.minutesAgo', '分钟前')}`;
        }
        if (diffHours < 24) {
            return `${diffHours}${this.t('time.hoursAgo', '小时前')}`;
        }
        if (diffDays < 7) {
            return `${diffDays}${this.t('time.daysAgo', '天前')}`;
        }

        return past.toLocaleDateString();
    }

    /**
     * HTML转义
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 创建全局实例
if (typeof window !== 'undefined') {
    window.HistoryFavoritesUI = HistoryFavoritesUI;

    // 等待userDataManager加载后初始化
    if (window.userDataManager) {
        window.historyFavoritesUI = new HistoryFavoritesUI(window.userDataManager);
        window.historyFavoritesUI.initialize();
        console.log('✅ HistoryFavoritesUI 已创建');
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            if (window.userDataManager) {
                window.historyFavoritesUI = new HistoryFavoritesUI(window.userDataManager);
                window.historyFavoritesUI.initialize();
                console.log('✅ HistoryFavoritesUI 已创建');
            }
        });
    }
}
