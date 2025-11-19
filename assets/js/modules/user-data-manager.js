/**
 * UserDataManager Module
 * Manages user local data including history, favorites, and statistics.
 */

export class UserDataManager {
    constructor() {
        this.storagePrefix = 'soundHealing_';
        this.maxHistoryItems = 50; // 最多保存50条历史记录
        this.maxFavorites = 200; // 最多收藏200个音频

        // 初始化存储
        this.initializeStorage();
    }

    /**
     * 初始化本地存储结构
     */
    initializeStorage() {
        // 确保基础数据结构存在
        if (!this.getHistory()) {
            this.saveToStorage('history', []);
        }
        if (!this.getFavorites()) {
            this.saveToStorage('favorites', []);
        }
        if (!this.getStatistics()) {
            this.saveToStorage('statistics', {
                totalPlayTime: 0,
                totalPlays: 0,
                categoryStats: {},
                lastUpdated: new Date().toISOString()
            });
        }
    }

    /**
     * 通用存储方法
     */
    saveToStorage(key, data) {
        try {
            localStorage.setItem(this.storagePrefix + key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('保存数据失败:', error);
            return false;
        }
    }

    /**
     * 通用读取方法
     */
    getFromStorage(key) {
        try {
            const data = localStorage.getItem(this.storagePrefix + key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('读取数据失败:', error);
            return null;
        }
    }

    // ============ 播放历史管理 ============

    /**
     * 添加播放记录
     * @param {Object} trackInfo - 音频信息
     * @param {string} trackInfo.category - 分类
     * @param {string} trackInfo.fileName - 文件名
     * @param {string} trackInfo.displayName - 显示名称
     */
    addToHistory(trackInfo) {
        const history = this.getHistory();

        // 创建历史记录项
        const historyItem = {
            id: this.generateId(trackInfo.category, trackInfo.fileName),
            category: trackInfo.category,
            fileName: trackInfo.fileName,
            displayName: trackInfo.displayName || trackInfo.fileName,
            playedAt: new Date().toISOString(),
            duration: trackInfo.duration || 0
        };

        // 移除重复的记录（如果存在）
        const filteredHistory = history.filter(item => item.id !== historyItem.id);

        // 添加到开头
        filteredHistory.unshift(historyItem);

        // 限制历史记录数量
        const trimmedHistory = filteredHistory.slice(0, this.maxHistoryItems);

        // 保存
        this.saveToStorage('history', trimmedHistory);

        // 触发事件
        this.triggerEvent('historyUpdated', { history: trimmedHistory });

        return true;
    }

    /**
     * 获取播放历史
     * @param {number} limit - 限制返回数量
     */
    getHistory(limit = null) {
        const history = this.getFromStorage('history') || [];
        return limit ? history.slice(0, limit) : history;
    }

    /**
     * 清空播放历史
     */
    clearHistory() {
        this.saveToStorage('history', []);
        this.triggerEvent('historyCleared');
        return true;
    }

    /**
     * 从历史中删除单个项目
     */
    removeFromHistory(trackId) {
        const history = this.getHistory();
        const newHistory = history.filter(item => item.id !== trackId);
        this.saveToStorage('history', newHistory);
        this.triggerEvent('historyUpdated', { history: newHistory });
        return true;
    }

    // ============ 收藏管理 ============

    /**
     * 添加到收藏
     */
    addToFavorites(trackInfo) {
        const favorites = this.getFavorites();

        const favoriteItem = {
            id: this.generateId(trackInfo.category, trackInfo.fileName),
            category: trackInfo.category,
            fileName: trackInfo.fileName,
            displayName: trackInfo.displayName || trackInfo.fileName,
            addedAt: new Date().toISOString(),
            tags: trackInfo.tags || []
        };

        // 检查是否已收藏
        if (favorites.some(item => item.id === favoriteItem.id)) {
            console.log('已经在收藏列表中');
            return false;
        }

        // 检查收藏数量限制
        if (favorites.length >= this.maxFavorites) {
            console.warn('收藏数量已达上限');
            return false;
        }

        // 添加到开头
        favorites.unshift(favoriteItem);

        // 保存
        this.saveToStorage('favorites', favorites);

        // 触发事件
        this.triggerEvent('favoritesUpdated', { favorites, action: 'add', item: favoriteItem });

        return true;
    }

    /**
     * 从收藏中移除
     */
    removeFromFavorites(trackId) {
        const favorites = this.getFavorites();
        const newFavorites = favorites.filter(item => item.id !== trackId);

        if (newFavorites.length === favorites.length) {
            return false; // 没有找到要删除的项
        }

        this.saveToStorage('favorites', newFavorites);
        this.triggerEvent('favoritesUpdated', { favorites: newFavorites, action: 'remove', trackId });

        return true;
    }

    /**
     * 切换收藏状态
     */
    toggleFavorite(trackInfo) {
        const trackId = this.generateId(trackInfo.category, trackInfo.fileName);

        if (this.isFavorite(trackId)) {
            return this.removeFromFavorites(trackId);
        } else {
            return this.addToFavorites(trackInfo);
        }
    }

    /**
     * 检查是否已收藏
     */
    isFavorite(trackId) {
        const favorites = this.getFavorites();
        return favorites.some(item => item.id === trackId);
    }

    /**
     * 获取收藏列表
     */
    getFavorites() {
        return this.getFromStorage('favorites') || [];
    }

    /**
     * 清空收藏
     */
    clearFavorites() {
        this.saveToStorage('favorites', []);
        this.triggerEvent('favoritesCleared');
        return true;
    }

    // ============ 统计数据管理 ============

    /**
     * 更新统计数据
     */
    updateStatistics(category, playTime = 0) {
        const stats = this.getStatistics();

        // 更新总播放次数
        stats.totalPlays = (stats.totalPlays || 0) + 1;

        // 更新总播放时长（秒）
        stats.totalPlayTime = (stats.totalPlayTime || 0) + playTime;

        // 更新分类统计
        if (!stats.categoryStats[category]) {
            stats.categoryStats[category] = {
                plays: 0,
                playTime: 0
            };
        }
        stats.categoryStats[category].plays += 1;
        stats.categoryStats[category].playTime += playTime;

        // 更新时间戳
        stats.lastUpdated = new Date().toISOString();

        // 保存
        this.saveToStorage('statistics', stats);

        return stats;
    }

    /**
     * 获取统计数据
     */
    getStatistics() {
        return this.getFromStorage('statistics') || {
            totalPlayTime: 0,
            totalPlays: 0,
            categoryStats: {},
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * 获取最常听的分类
     */
    getMostPlayedCategories(limit = 5) {
        const stats = this.getStatistics();
        const categories = Object.entries(stats.categoryStats || {})
            .map(([category, data]) => ({
                category,
                plays: data.plays,
                playTime: data.playTime
            }))
            .sort((a, b) => b.plays - a.plays)
            .slice(0, limit);

        return categories;
    }

    /**
     * 获取推荐音频（基于收听历史）
     */
    getRecommendations(limit = 10) {
        const mostPlayedCategories = this.getMostPlayedCategories(3);
        const history = this.getHistory(20);

        // 简单推荐逻辑：基于最常听的分类
        const recommendations = {
            basedOnHistory: mostPlayedCategories,
            recentlyPlayed: history.slice(0, limit)
        };

        return recommendations;
    }

    // ============ 工具方法 ============

    /**
     * 生成唯一ID
     */
    generateId(category, fileName) {
        return `${category}_${fileName}`.replace(/\s+/g, '_').toLowerCase();
    }

    /**
     * 触发自定义事件
     */
    triggerEvent(eventName, data = {}) {
        const event = new CustomEvent(`userData:${eventName}`, {
            detail: data
        });
        window.dispatchEvent(event);
    }

    /**
     * 导出所有用户数据
     */
    exportData() {
        return {
            history: this.getHistory(),
            favorites: this.getFavorites(),
            statistics: this.getStatistics(),
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * 导入用户数据
     */
    importData(data) {
        try {
            if (data.history) {
                this.saveToStorage('history', data.history);
            }
            if (data.favorites) {
                this.saveToStorage('favorites', data.favorites);
            }
            if (data.statistics) {
                this.saveToStorage('statistics', data.statistics);
            }

            return true;
        } catch (error) {
            console.error('导入数据失败:', error);
            return false;
        }
    }

    /**
     * 清空所有数据
     */
    clearAllData() {
        this.clearHistory();
        this.clearFavorites();
        this.saveToStorage('statistics', {
            totalPlayTime: 0,
            totalPlays: 0,
            categoryStats: {},
            lastUpdated: new Date().toISOString()
        });

        return true;
    }

    /**
     * 获取存储使用情况
     */
    getStorageInfo() {
        const data = this.exportData();
        const dataStr = JSON.stringify(data);
        const bytes = new Blob([dataStr]).size;
        const kb = (bytes / 1024).toFixed(2);

        return {
            historyCount: data.history.length,
            favoritesCount: data.favorites.length,
            totalPlays: data.statistics.totalPlays,
            storageSize: `${kb} KB`
        };
    }
}
