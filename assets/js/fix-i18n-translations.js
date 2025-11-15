/**
 * Fix i18n Translation Loading - 确保player.modal翻译正确加载
 */

(function() {
    'use strict';

    console.log('🔧 启动i18n翻译修复...');

    // 等待i18n系统加载完成
    function waitForI18n() {
        return new Promise((resolve) => {
            if (window.i18n && window.i18n.isInitialized) {
                resolve();
            } else {
                const checkInterval = setInterval(() => {
                    if (window.i18n && window.i18n.isInitialized) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
            }
        });
    }

    // 修复翻译
    async function fixTranslations() {
        await waitForI18n();

        console.log('🌍 i18n系统已就绪，检查当前语言:', window.i18n.currentLanguage);

        // 确保当前语言是中文
        if (window.i18n.currentLanguage !== 'zh-CN') {
            console.log('🔄 切换到中文...');
            await window.i18n.changeLanguage('zh-CN');
        }

        // 再次更新页面内容
        console.log('🔄 更新页面内容...');
        window.i18n.updatePageContent();

        // 特别检查player.modal相关的元素
        const playerModalElements = document.querySelectorAll('[data-i18n^="player.modal"]');
        console.log(`🔍 找到 ${playerModalElements.length} 个player.modal元素`);

        playerModalElements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = window.i18n.getTranslation(key);
            console.log(`📝 ${key}: ${translation}`);

            // 特殊处理不同类型的元素
            if (el.tagName === 'INPUT' && (el.type === 'text' || el.type === 'email')) {
                // Input元素不修改textContent
            } else if (el.tagName === 'OPTION') {
                el.textContent = translation;
            } else if (el.hasAttribute('title')) {
                el.title = translation;
            } else {
                el.textContent = translation;
            }
        });

        console.log('✅ 翻译修复完成');
    }

    // 如果页面已经加载完成，立即执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixTranslations);
    } else {
        // 页面已加载，延迟一点时间确保所有脚本都加载完成
        setTimeout(fixTranslations, 500);
    }

    // 导出修复函数到全局，方便调试
    window.fixI18nTranslations = fixTranslations;

})();