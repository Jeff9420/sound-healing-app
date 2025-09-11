/**
 * Playwright MCP 兼容的多语言测试脚本
 * 适用于声音疗愈应用的自动化多语言功能测试
 * 
 * 使用方法：
 * 1. 与Playwright MCP工具配合使用
 * 2. 或者独立作为Playwright测试脚本运行
 * 
 * @author Claude Code Playwright Integration
 * @date 2024-09-05
 */

const { test, expect } = require('@playwright/test');

class PlaywrightMultiLangTest {
    constructor(page) {
        this.page = page;
        this.supportedLanguages = [
            { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
            { code: 'en-US', name: 'English', flag: '🇺🇸' },
            { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
            { code: 'ko-KR', name: '한국어', flag: '🇰🇷' },
            { code: 'es-ES', name: 'Español', flag: '🇪🇸' }
        ];
        
        this.testResults = [];
        this.screenshots = [];
        
        // 测试元素选择器
        this.selectors = {
            languageSelector: '#languageSelector',
            languageToggle: '#languageToggle',
            languageDropdown: '#languageDropdown',
            languageOptions: '.language-option',
            testableElements: [
                '[data-i18n="header.title"]',
                '[data-i18n="header.subtitle"]',
                '[data-i18n="player.selectSound"]',
                '[data-i18n="main.exploreTitle"]'
            ]
        };
    }

    /**
     * 初始化页面并导航到应用
     */
    async initializePage(url) {
        console.log(`🚀 导航到: ${url}`);
        await this.page.goto(url, { waitUntil: 'networkidle' });
        
        // 等待关键脚本加载
        await this.page.waitForFunction(() => {
            return window.i18n && window.languageIntegration;
        }, { timeout: 10000 });
        
        // 额外等待初始化完成
        await this.page.waitForTimeout(2000);
    }

    /**
     * 截取屏幕快照
     */
    async takeScreenshot(name, options = {}) {
        const screenshotPath = `screenshots/multilang-${name}-${Date.now()}.png`;
        
        await this.page.screenshot({
            path: screenshotPath,
            fullPage: true,
            ...options
        });
        
        const screenshot = {
            name,
            path: screenshotPath,
            timestamp: new Date().toISOString(),
            url: this.page.url()
        };
        
        this.screenshots.push(screenshot);
        console.log(`📸 截图保存: ${screenshot.name} -> ${screenshotPath}`);
        
        return screenshot;
    }

    /**
     * 检查系统状态
     */
    async checkSystemStatus() {
        console.log('🔍 检查系统状态...');
        
        const systemStatus = await this.page.evaluate(() => {
            return {
                i18nSystem: !!(window.i18n && window.i18n.isInitialized),
                languageIntegration: !!(window.languageIntegration && window.languageIntegration.isInitialized),
                currentLanguage: window.i18n?.currentLanguage,
                domElements: {
                    languageSelector: !!document.querySelector('#languageSelector'),
                    languageToggle: !!document.querySelector('#languageToggle'),
                    languageDropdown: !!document.querySelector('#languageDropdown')
                }
            };
        });
        
        const allSystemsReady = systemStatus.i18nSystem && 
                               systemStatus.languageIntegration && 
                               Object.values(systemStatus.domElements).every(Boolean);
        
        console.log('📊 系统状态:', systemStatus);
        
        return {
            ready: allSystemsReady,
            details: systemStatus
        };
    }

    /**
     * 测试语言选择器是否存在和可见
     */
    async testLanguageSelectorPresence() {
        console.log('🔍 测试语言选择器存在性...');
        
        // 检查语言选择器是否存在
        const languageSelector = this.page.locator(this.selectors.languageSelector);
        await expect(languageSelector).toBeVisible({ timeout: 5000 });
        
        // 检查语言切换按钮
        const languageToggle = this.page.locator(this.selectors.languageToggle);
        await expect(languageToggle).toBeVisible();
        
        // 获取边界框信息
        const boundingBox = await languageSelector.boundingBox();
        
        return {
            exists: true,
            visible: true,
            boundingBox
        };
    }

    /**
     * 测试语言选择器点击功能
     */
    async testLanguageSelectorClick() {
        console.log('🖱️ 测试语言选择器点击功能...');
        
        await this.takeScreenshot('before-click');
        
        const languageToggle = this.page.locator(this.selectors.languageToggle);
        const languageDropdown = this.page.locator(this.selectors.languageDropdown);
        
        // 检查初始状态（下拉菜单应该隐藏）
        await expect(languageDropdown).not.toBeVisible();
        
        // 点击语言切换按钮
        await languageToggle.click();
        
        // 等待动画完成
        await this.page.waitForTimeout(500);
        
        await this.takeScreenshot('after-click');
        
        // 验证下拉菜单是否显示
        await expect(languageDropdown).toBeVisible();
        
        return { success: true };
    }

    /**
     * 测试语言选项显示
     */
    async testLanguageOptions() {
        console.log('🌍 测试语言选项显示...');
        
        const options = this.page.locator(this.selectors.languageOptions);
        const optionCount = await options.count();
        
        console.log(`找到 ${optionCount} 个语言选项`);
        
        // 验证每个支持的语言都有对应的选项
        for (const lang of this.supportedLanguages) {
            const option = this.page.locator(`${this.selectors.languageOptions}[data-lang="${lang.code}"]`);
            await expect(option).toBeVisible();
            
            const text = await option.textContent();
            console.log(`✅ 语言选项: ${lang.code} -> ${text}`);
        }
        
        return {
            totalOptions: optionCount,
            expectedCount: this.supportedLanguages.length,
            allPresent: optionCount === this.supportedLanguages.length
        };
    }

    /**
     * 测试特定语言切换
     */
    async testLanguageSwitch(targetLanguage) {
        console.log(`🔄 测试切换到 ${targetLanguage.name} (${targetLanguage.code})`);
        
        // 记录切换前的内容
        const beforeContent = await this.page.evaluate(() => {
            const titleElement = document.querySelector('[data-i18n="header.title"]');
            return {
                currentLang: window.i18n?.currentLanguage,
                titleText: titleElement?.textContent,
                htmlLang: document.documentElement.lang
            };
        });
        
        await this.takeScreenshot(`before-switch-${targetLanguage.code}`);
        
        // 确保下拉菜单是打开的
        const languageToggle = this.page.locator(this.selectors.languageToggle);
        const languageDropdown = this.page.locator(this.selectors.languageDropdown);
        
        if (!(await languageDropdown.isVisible())) {
            await languageToggle.click();
            await this.page.waitForTimeout(300);
        }
        
        // 点击目标语言选项
        const targetOption = this.page.locator(`${this.selectors.languageOptions}[data-lang="${targetLanguage.code}"]`);
        await expect(targetOption).toBeVisible();
        await targetOption.click();
        
        // 等待语言切换完成
        await this.page.waitForTimeout(1000);
        
        await this.takeScreenshot(`after-switch-${targetLanguage.code}`);
        
        // 验证切换结果
        const afterContent = await this.page.evaluate(() => {
            const titleElement = document.querySelector('[data-i18n="header.title"]');
            return {
                currentLang: window.i18n?.currentLanguage,
                titleText: titleElement?.textContent,
                htmlLang: document.documentElement.lang
            };
        });
        
        // 验证语言切换是否成功
        const switchSuccessful = afterContent.currentLang === targetLanguage.code &&
                               afterContent.htmlLang === targetLanguage.code;
        
        const contentChanged = beforeContent.titleText !== afterContent.titleText;
        
        console.log(`切换结果:`, {
            targetLanguage: targetLanguage.code,
            beforeContent,
            afterContent,
            switchSuccessful,
            contentChanged
        });
        
        // 验证语言切换成功
        expect(switchSuccessful).toBeTruthy();
        expect(contentChanged).toBeTruthy();
        
        return {
            targetLanguage: targetLanguage.code,
            switchSuccessful,
            contentChanged,
            beforeContent,
            afterContent
        };
    }

    /**
     * 测试内容翻译准确性
     */
    async testContentTranslation(language) {
        console.log(`📝 测试 ${language.name} 内容翻译...`);
        
        const translationResults = await this.page.evaluate((selectors) => {
            const results = [];
            
            selectors.forEach(selector => {
                const element = document.querySelector(selector);
                if (element) {
                    const i18nKey = element.getAttribute('data-i18n');
                    const currentText = element.textContent.trim();
                    const expectedText = window.i18n?.t(i18nKey) || '';
                    
                    results.push({
                        selector,
                        i18nKey,
                        currentText,
                        expectedText,
                        matches: currentText === expectedText,
                        isEmpty: currentText.length === 0
                    });
                }
            });
            
            return results;
        }, this.selectors.testableElements);
        
        const translatedCount = translationResults.filter(result => result.matches && !result.isEmpty).length;
        const allTranslated = translationResults.length > 0 && translationResults.every(result => result.matches && !result.isEmpty);
        
        console.log(`翻译结果: ${translatedCount}/${translationResults.length} 元素已翻译`);
        
        return {
            language: language.code,
            totalElements: translationResults.length,
            translatedElements: translatedCount,
            allTranslated,
            details: translationResults
        };
    }

    /**
     * 运行完整的多语言测试套件
     */
    async runFullTestSuite() {
        console.log('🚀 开始完整多语言测试套件...');
        const startTime = Date.now();
        
        await this.takeScreenshot('test-suite-start');
        
        try {
            // 1. 系统状态检查
            const systemStatus = await this.checkSystemStatus();
            if (!systemStatus.ready) {
                throw new Error('系统未就绪，测试终止');
            }
            
            // 2. 语言选择器基础测试
            await this.testLanguageSelectorPresence();
            await this.testLanguageSelectorClick();
            await this.testLanguageOptions();
            
            // 3. 各语言切换测试
            for (const language of this.supportedLanguages) {
                await this.testLanguageSwitch(language);
                await this.testContentTranslation(language);
            }
            
            await this.takeScreenshot('test-suite-complete');
            
            const duration = Date.now() - startTime;
            console.log(`🎉 完整测试套件完成，耗时: ${duration}ms`);
            
            return {
                success: true,
                duration,
                screenshots: this.screenshots,
                testResults: this.testResults
            };
            
        } catch (error) {
            await this.takeScreenshot('test-suite-error');
            console.error('❌ 测试套件失败:', error);
            throw error;
        }
    }

    /**
     * 生成测试报告
     */
    generateReport() {
        return {
            timestamp: new Date().toISOString(),
            screenshots: this.screenshots,
            supportedLanguages: this.supportedLanguages,
            testResults: this.testResults,
            summary: {
                totalScreenshots: this.screenshots.length,
                totalLanguagesTested: this.supportedLanguages.length
            }
        };
    }
}

// Playwright测试用例定义
test.describe('声音疗愈应用多语言功能测试', () => {
    let testSuite;
    const APP_URL = 'file:///C:/Users/MI/Desktop/声音疗愈/sound-healing-app/index.html';

    test.beforeEach(async ({ page }) => {
        testSuite = new PlaywrightMultiLangTest(page);
        await testSuite.initializePage(APP_URL);
    });

    test('系统状态检查', async () => {
        const status = await testSuite.checkSystemStatus();
        expect(status.ready).toBeTruthy();
    });

    test('语言选择器存在性测试', async () => {
        const result = await testSuite.testLanguageSelectorPresence();
        expect(result.exists).toBeTruthy();
        expect(result.visible).toBeTruthy();
    });

    test('语言选择器点击功能测试', async () => {
        const result = await testSuite.testLanguageSelectorClick();
        expect(result.success).toBeTruthy();
    });

    test('语言选项显示测试', async () => {
        // 先点击打开下拉菜单
        await testSuite.testLanguageSelectorClick();
        
        const result = await testSuite.testLanguageOptions();
        expect(result.allPresent).toBeTruthy();
    });

    // 为每种支持的语言创建单独的测试用例
    const languages = [
        { code: 'zh-CN', name: '简体中文' },
        { code: 'en-US', name: 'English' },
        { code: 'ja-JP', name: '日本語' },
        { code: 'ko-KR', name: '한국어' },
        { code: 'es-ES', name: 'Español' }
    ];

    languages.forEach(language => {
        test(`语言切换测试 - ${language.name}`, async () => {
            const result = await testSuite.testLanguageSwitch(language);
            expect(result.switchSuccessful).toBeTruthy();
            expect(result.contentChanged).toBeTruthy();
        });

        test(`内容翻译测试 - ${language.name}`, async () => {
            // 先切换到目标语言
            await testSuite.testLanguageSwitch(language);
            
            const result = await testSuite.testContentTranslation(language);
            expect(result.allTranslated).toBeTruthy();
        });
    });

    test('完整多语言测试套件', async () => {
        const result = await testSuite.runFullTestSuite();
        expect(result.success).toBeTruthy();
        
        // 生成并输出测试报告
        const report = testSuite.generateReport();
        console.log('📊 测试报告:', JSON.stringify(report, null, 2));
    });
});

// 导出测试类供独立使用
module.exports = { PlaywrightMultiLangTest };

console.log('🧪 Playwright 多语言测试脚本已加载');
console.log('💡 使用方法:');
console.log('   1. 作为Playwright测试运行: npx playwright test playwright-multilang-test.js');
console.log('   2. 或与Playwright MCP工具配合使用');