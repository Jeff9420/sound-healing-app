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

                // 检查依赖是否加载（i18n系统必须加载，至少有一个SAAS翻译源）
                const i18nReady = typeof window.i18n !== 'undefined';
                const hasBasicTranslations = typeof window.SAAS_TRANSLATIONS !== 'undefined';
                const hasCompleteTranslations = typeof window.SAAS_COMPLETE_TRANSLATIONS !== 'undefined';

                if (i18nReady && (hasBasicTranslations || hasCompleteTranslations)) {
                    clearInterval(checkInterval);
                    const sources = [];
                    if (hasBasicTranslations) sources.push('SAAS_TRANSLATIONS');
                    if (hasCompleteTranslations) sources.push('SAAS_COMPLETE_TRANSLATIONS');
                    console.log(`✅ 检测到翻译源: ${sources.join(', ')}`);
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

    // 合并单个翻译源
    function mergeTranslationSource(i18nSystem, translationSource, sourceName) {
        if (!translationSource) {
            console.log(`⚠️ ${sourceName} 不存在，跳过...`);
            return;
        }

        console.log(`📦 合并 ${sourceName}...`);
        let totalMerged = 0;

        // 遍历所有语言
        Object.keys(translationSource).forEach(langCode => {
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
            const langData = translationSource[langCode];
            let mergedCount = 0;

            Object.keys(langData).forEach(key => {
                existingTranslations[key] = langData[key];
                mergedCount++;
            });

            totalMerged += mergedCount;
            console.log(`  ✅ ${langCode}: 合并了 ${mergedCount} 个翻译键值`);
        });

        console.log(`✅ ${sourceName} 合并完成！总计: ${totalMerged} 个键值`);
    }

    // 合并所有SaaS翻译数据
    function mergeSaasTranslations() {
        console.log('📦 开始合并所有SaaS组件翻译...');

        const i18nSystem = window.i18n;

        // 合并基础翻译（i18n-saas-extensions.js）
        mergeTranslationSource(i18nSystem, window.SAAS_TRANSLATIONS, 'SAAS_TRANSLATIONS');

        // 合并完整翻译（i18n-saas-complete-translations.js）
        mergeTranslationSource(i18nSystem, window.SAAS_COMPLETE_TRANSLATIONS, 'SAAS_COMPLETE_TRANSLATIONS');

        console.log('🎉 所有SaaS翻译合并完成！');

        // 输出合并后的统计信息
        console.log(`📊 翻译统计:`);
        i18nSystem.loadedLanguages.forEach(lang => {
            const translations = i18nSystem.translations.get(lang);
            const count = translations ? Object.keys(translations).length : 0;
            console.log(`  - ${lang}: ${count} 个翻译键值`);
        });
    }

    // 触发UI更新（如果当前语言包含SaaS组件）
    function refreshUI() {
        console.log('🔄 刷新UI翻译...');

        if (window.i18n && typeof window.i18n.updatePageContent === 'function') {
            window.i18n.updatePageContent();
            console.log('✅ UI翻译已更新');
        } else {
            console.warn('⚠️ i18n.updatePageContent 方法不可用');
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
            const integratedLanguages = new Set();
            if (window.SAAS_TRANSLATIONS) {
                Object.keys(window.SAAS_TRANSLATIONS).forEach(lang => integratedLanguages.add(lang));
            }
            if (window.SAAS_COMPLETE_TRANSLATIONS) {
                Object.keys(window.SAAS_COMPLETE_TRANSLATIONS).forEach(lang => integratedLanguages.add(lang));
            }

            const event = new CustomEvent('saasTranslationsReady', {
                detail: {
                    timestamp: Date.now(),
                    languagesIntegrated: Array.from(integratedLanguages),
                    sources: {
                        basic: typeof window.SAAS_TRANSLATIONS !== 'undefined',
                        complete: typeof window.SAAS_COMPLETE_TRANSLATIONS !== 'undefined'
                    }
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
