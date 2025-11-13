/**
 * SaaS翻译集成器
 * 将SaaS组件翻译扩展合并到主i18n系统
 *
 * 使用方法：
 * 1. 在主HTML中，确保按顺序加载：
 *    <script src="assets/js/i18n-system.js"></script>
 *    <script src="assets/js/i18n-saas-extensions.js"></script>
 *    <script src="assets/js/i18n-saas-integrator.js"></script>
 *
 * 2. 集成器会自动合并翻译数据
 *
 * @version 1.0.0
 * @date 2025-01-13
 */

(function() {
    'use strict';

    console.log('🔗 启动SaaS翻译集成器...');

    // 等待i18n系统和SAAS翻译都加载完成
    function waitForDependencies() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 5秒超时

            const checkInterval = setInterval(() => {
                attempts++;

                // 检查依赖是否加载
                if (typeof window.i18n !== 'undefined' &&
                    typeof window.SAAS_TRANSLATIONS !== 'undefined') {
                    clearInterval(checkInterval);
                    resolve();
                    return;
                }

                // 超时
                if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    reject(new Error('等待i18n系统或SAAS翻译超时'));
                }
            }, 100);
        });
    }

    // 合并翻译数据
    function mergeSaasTranslations() {
        console.log('📦 合并SaaS组件翻译...');

        const i18nSystem = window.i18n;
        const saasTranslations = window.SAAS_TRANSLATIONS;

        // 遍历所有语言
        Object.keys(saasTranslations).forEach(langCode => {
            console.log(`  处理语言: ${langCode}`);

            // 获取现有翻译数据
            let existingTranslations = i18nSystem.translations.get(langCode);

            // 如果该语言尚未加载，先加载
            if (!existingTranslations) {
                console.log(`  ${langCode} 翻译数据不存在，创建新的...`);
                existingTranslations = {};
                i18nSystem.translations.set(langCode, existingTranslations);
                i18nSystem.loadedLanguages.add(langCode);
            }

            // 合并SaaS翻译到现有翻译
            const saasLangData = saasTranslations[langCode];
            let mergedCount = 0;

            Object.keys(saasLangData).forEach(key => {
                existingTranslations[key] = saasLangData[key];
                mergedCount++;
            });

            console.log(`  ✅ ${langCode}: 合并了 ${mergedCount} 个翻译键值`);
        });

        console.log('✅ SaaS翻译合并完成！');
    }

    // 触发UI更新（如果当前语言包含SaaS组件）
    function refreshUI() {
        console.log('🔄 刷新UI翻译...');

        if (window.i18n && typeof window.i18n.translatePage === 'function') {
            window.i18n.translatePage();
            console.log('✅ UI翻译已更新');
        } else {
            console.warn('⚠️ i18n.translatePage 方法不可用');
        }
    }

    // 主初始化流程
    async function initializeIntegration() {
        try {
            // 等待依赖加载
            await waitForDependencies();
            console.log('✅ 依赖已加载');

            // 合并翻译
            mergeSaasTranslations();

            // 刷新UI
            refreshUI();

            console.log('🎉 SaaS翻译集成完成！');

            // 触发自定义事件，通知应用集成完成
            const event = new CustomEvent('saasTranslationsReady', {
                detail: {
                    timestamp: Date.now(),
                    languagesIntegrated: Object.keys(window.SAAS_TRANSLATIONS)
                }
            });
            document.dispatchEvent(event);

        } catch (error) {
            console.error('❌ SaaS翻译集成失败:', error);
        }
    }

    // DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeIntegration);
    } else {
        // DOM已经加载完成
        initializeIntegration();
    }

    // 暴露全局调试方法
    window.reloadSaasTranslations = function() {
        console.log('🔄 手动重新加载SaaS翻译...');
        mergeSaasTranslations();
        refreshUI();
    };

})();
