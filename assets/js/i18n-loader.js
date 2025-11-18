/**
 * i18n Dynamic Loader
 * 动态加载翻译数据 - 减少初始包体积
 *
 * @version 1.0.0
 * @date 2025-01-20
 */

class I18nLoader {
    constructor() {
        this.baseUrl = '/assets/js/i18n-data/';
        this.loadedLanguages = new Map();
        this.loadingPromises = new Map();
        this.fallbackLanguage = 'en-US';
    }

    /**
     * 动态加载语言数据
     * @param {string} langCode - 语言代码 (zh-CN, en-US, etc.)
     * @returns {Promise<object>} 翻译数据
     */
    async loadLanguage(langCode) {
        // 检查是否已加载
        if (this.loadedLanguages.has(langCode)) {
            return this.loadedLanguages.get(langCode);
        }

        // 检查是否正在加载
        if (this.loadingPromises.has(langCode)) {
            return this.loadingPromises.get(langCode);
        }

        // 创建加载 Promise
        const loadPromise = this._fetchLanguageData(langCode);
        this.loadingPromises.set(langCode, loadPromise);

        try {
            const data = await loadPromise;
            this.loadedLanguages.set(langCode, data);
            this.loadingPromises.delete(langCode);
            return data;
        } catch (error) {
            this.loadingPromises.delete(langCode);
            throw error;
        }
    }

    /**
     * 获取语言数据（使用现有的getTranslationData作为回退）
     * @param {string} langCode - 语言代码
     * @returns {Promise<object>} 翻译数据
     */
    async _fetchLanguageData(langCode) {
        const jsonUrl = `${this.baseUrl}${langCode}.json`;

        try {
            // 尝试从JSON文件加载
            const response = await fetch(jsonUrl);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log(`✅ 从JSON加载语言数据: ${langCode}`);
            return data;

        } catch (error) {
            // 回退到内嵌数据
            console.warn(`⚠️ JSON加载失败，使用内嵌数据: ${langCode}`, error);

            // 如果i18n系统已加载，使用其getTranslationData方法
            if (window.i18n && typeof window.i18n.getTranslationData === 'function') {
                return window.i18n.getTranslationData(langCode);
            }

            throw new Error(`无法加载语言数据: ${langCode}`);
        }
    }

    /**
     * 预加载多个语言
     * @param {string[]} langCodes - 语言代码数组
     */
    async preloadLanguages(langCodes) {
        const promises = langCodes.map(lang => this.loadLanguage(lang));
        return Promise.allSettled(promises);
    }

    /**
     * 清除缓存的语言数据
     * @param {string} langCode - 可选，指定语言代码
     */
    clearCache(langCode) {
        if (langCode) {
            this.loadedLanguages.delete(langCode);
            console.log(`🗑️ 清除语言缓存: ${langCode}`);
        } else {
            this.loadedLanguages.clear();
            console.log(`🗑️ 清除所有语言缓存`);
        }
    }

    /**
     * 获取已加载的语言列表
     * @returns {string[]} 已加载的语言代码
     */
    getLoadedLanguages() {
        return Array.from(this.loadedLanguages.keys());
    }

    /**
     * 获取缓存统计
     * @returns {object} 缓存统计信息
     */
    getCacheStats() {
        return {
            loaded: this.loadedLanguages.size,
            loading: this.loadingPromises.size,
            languages: this.getLoadedLanguages()
        };
    }
}

// 全局导出
if (typeof window !== 'undefined') {
    window.I18nLoader = I18nLoader;
    window.i18nLoader = new I18nLoader();
}

// ES6 模块导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18nLoader;
}
