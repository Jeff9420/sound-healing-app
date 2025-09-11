/**
 * 声音疗愈应用多语言功能测试套件
 * 支持手动测试和自动化测试（适配Playwright MCP）
 * 
 * @author Claude Code Testing Suite
 * @date 2024-09-05
 */

class MultilingualTestSuite {
    constructor() {
        this.testResults = [];
        this.screenshots = [];
        this.supportedLanguages = ['zh-CN', 'en-US', 'ja-JP', 'ko-KR', 'es-ES'];
        this.testStartTime = Date.now();
        
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
                '[data-i18n="main.exploreTitle"]',
                '[data-i18n="playlist.backToEcosystem"]'
            ]
        };
    }

    /**
     * 等待元素出现
     */
    async waitForElement(selector, timeout = 10000) {
        const startTime = Date.now();
        
        return new Promise((resolve, reject) => {
            const checkElement = () => {
                const element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                } else if (Date.now() - startTime >= timeout) {
                    reject(new Error(`Element ${selector} not found within ${timeout}ms`));
                } else {
                    setTimeout(checkElement, 100);
                }
            };
            checkElement();
        });
    }

    /**
     * 截取屏幕快照（模拟函数，适配Playwright MCP时替换）
     */
    async takeScreenshot(name) {
        const screenshot = {
            name: name,
            timestamp: Date.now(),
            url: window.location.href,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            // 模拟截图数据
            data: `screenshot-${name}-${Date.now()}.png`
        };
        
        this.screenshots.push(screenshot);
        console.log(`📸 截图保存: ${screenshot.name}`);
        return screenshot;
    }

    /**
     * 记录测试结果
     */
    logResult(testName, status, details = {}) {
        const result = {
            testName,
            status,
            details,
            timestamp: Date.now(),
            duration: Date.now() - this.testStartTime
        };
        
        this.testResults.push(result);
        
        const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
        console.log(`${icon} ${testName}: ${status}`, details);
    }

    /**
     * 检查系统状态
     */
    async checkSystemStatus() {
        console.log('🔍 检查系统状态...');
        
        const checks = {
            i18nSystem: !!(window.i18n && window.i18n.isInitialized),
            languageIntegration: !!(window.languageIntegration && window.languageIntegration.isInitialized),
            domElements: {
                languageSelector: !!document.querySelector(this.selectors.languageSelector),
                languageToggle: !!document.querySelector(this.selectors.languageToggle),
                languageDropdown: !!document.querySelector(this.selectors.languageDropdown)
            }
        };
        
        const allSystemsReady = checks.i18nSystem && checks.languageIntegration && 
            Object.values(checks.domElements).every(Boolean);
        
        this.logResult('System Status Check', allSystemsReady ? 'pass' : 'fail', checks);
        
        return {
            ready: allSystemsReady,
            details: checks
        };
    }

    /**
     * 测试语言选择器是否存在且可见
     */
    async testLanguageSelectorPresence() {
        console.log('🔍 测试语言选择器存在性...');
        
        try {
            const selector = await this.waitForElement(this.selectors.languageSelector, 5000);
            
            const isVisible = selector.offsetWidth > 0 && selector.offsetHeight > 0;
            const computedStyle = window.getComputedStyle(selector);
            const isDisplayed = computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden';
            
            const result = {
                exists: true,
                visible: isVisible,
                displayed: isDisplayed,
                rect: selector.getBoundingClientRect()
            };
            
            this.logResult('Language Selector Presence', 'pass', result);
            return result;
            
        } catch (error) {
            this.logResult('Language Selector Presence', 'fail', { error: error.message });
            return { exists: false, error: error.message };
        }
    }

    /**
     * 测试语言选择器点击功能
     */
    async testLanguageSelectorClick() {
        console.log('🖱️ 测试语言选择器点击功能...');
        
        try {
            const toggle = await this.waitForElement(this.selectors.languageToggle);
            const dropdown = await this.waitForElement(this.selectors.languageDropdown);
            
            // 记录初始状态
            const initialState = {
                dropdownVisible: window.getComputedStyle(dropdown).opacity > 0.5,
                selectorActive: document.querySelector(this.selectors.languageSelector).classList.contains('active')
            };
            
            await this.takeScreenshot('before-click');
            
            // 点击切换按钮
            toggle.click();
            
            // 等待动画完成
            await new Promise(resolve => setTimeout(resolve, 500));
            
            await this.takeScreenshot('after-click');
            
            // 检查结果
            const finalState = {
                dropdownVisible: window.getComputedStyle(dropdown).opacity > 0.5,
                selectorActive: document.querySelector(this.selectors.languageSelector).classList.contains('active')
            };
            
            const clickWorked = finalState.selectorActive !== initialState.selectorActive;
            
            this.logResult('Language Selector Click', clickWorked ? 'pass' : 'fail', {
                initialState,
                finalState,
                clickWorked
            });
            
            return { success: clickWorked, initialState, finalState };
            
        } catch (error) {
            this.logResult('Language Selector Click', 'fail', { error: error.message });
            return { success: false, error: error.message };
        }
    }

    /**
     * 测试语言选项是否正确显示
     */
    async testLanguageOptions() {
        console.log('🌍 测试语言选项显示...');
        
        try {
            const options = document.querySelectorAll(this.selectors.languageOptions);
            
            const optionDetails = Array.from(options).map(option => ({
                langCode: option.getAttribute('data-lang'),
                text: option.textContent.trim(),
                visible: option.offsetWidth > 0 && option.offsetHeight > 0,
                clickable: !option.hasAttribute('disabled')
            }));
            
            const expectedLanguages = this.supportedLanguages;
            const foundLanguages = optionDetails.map(opt => opt.langCode);
            const missingLanguages = expectedLanguages.filter(lang => !foundLanguages.includes(lang));
            const extraLanguages = foundLanguages.filter(lang => !expectedLanguages.includes(lang));
            
            const result = {
                totalOptions: options.length,
                expectedCount: expectedLanguages.length,
                options: optionDetails,
                missingLanguages,
                extraLanguages,
                allExpectedPresent: missingLanguages.length === 0
            };
            
            this.logResult('Language Options', result.allExpectedPresent ? 'pass' : 'fail', result);
            return result;
            
        } catch (error) {
            this.logResult('Language Options', 'fail', { error: error.message });
            return { error: error.message };
        }
    }

    /**
     * 测试特定语言切换
     */
    async testLanguageSwitch(targetLanguage) {
        console.log(`🔄 测试切换到 ${targetLanguage}...`);
        
        try {
            // 记录切换前的状态
            const beforeSwitch = {
                currentLang: window.i18n?.currentLanguage,
                sampleText: document.querySelector('[data-i18n="header.title"]')?.textContent,
                htmlLang: document.documentElement.lang
            };
            
            await this.takeScreenshot(`before-switch-${targetLanguage}`);
            
            // 查找目标语言选项
            const targetOption = document.querySelector(`.language-option[data-lang="${targetLanguage}"]`);
            if (!targetOption) {
                throw new Error(`Language option ${targetLanguage} not found`);
            }
            
            // 点击语言选项
            targetOption.click();
            
            // 等待语言切换完成
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            await this.takeScreenshot(`after-switch-${targetLanguage}`);
            
            // 检查切换结果
            const afterSwitch = {
                currentLang: window.i18n?.currentLanguage,
                sampleText: document.querySelector('[data-i18n="header.title"]')?.textContent,
                htmlLang: document.documentElement.lang
            };
            
            const switchSuccessful = afterSwitch.currentLang === targetLanguage &&
                                   afterSwitch.htmlLang === targetLanguage &&
                                   afterSwitch.sampleText !== beforeSwitch.sampleText;
            
            const result = {
                targetLanguage,
                beforeSwitch,
                afterSwitch,
                switchSuccessful,
                textChanged: afterSwitch.sampleText !== beforeSwitch.sampleText,
                langAttributeUpdated: afterSwitch.htmlLang === targetLanguage
            };
            
            this.logResult(`Language Switch to ${targetLanguage}`, switchSuccessful ? 'pass' : 'fail', result);
            return result;
            
        } catch (error) {
            this.logResult(`Language Switch to ${targetLanguage}`, 'fail', { error: error.message });
            return { error: error.message, targetLanguage };
        }
    }

    /**
     * 测试内容翻译准确性
     */
    async testContentTranslation(language) {
        console.log(`📝 测试 ${language} 内容翻译...`);
        
        try {
            const testElements = this.selectors.testableElements;
            const translationResults = [];
            
            for (const selector of testElements) {
                const element = document.querySelector(selector);
                if (element) {
                    const i18nKey = element.getAttribute('data-i18n');
                    const currentText = element.textContent.trim();
                    const expectedText = window.i18n?.t(i18nKey) || '';
                    
                    translationResults.push({
                        selector,
                        i18nKey,
                        currentText,
                        expectedText,
                        matches: currentText === expectedText,
                        isEmpty: currentText.length === 0
                    });
                }
            }
            
            const allTranslated = translationResults.every(result => result.matches && !result.isEmpty);
            const translatedCount = translationResults.filter(result => result.matches).length;
            
            const result = {
                language,
                totalElements: translationResults.length,
                translatedElements: translatedCount,
                allTranslated,
                details: translationResults
            };
            
            this.logResult(`Content Translation ${language}`, allTranslated ? 'pass' : 'warn', result);
            return result;
            
        } catch (error) {
            this.logResult(`Content Translation ${language}`, 'fail', { error: error.message });
            return { error: error.message, language };
        }
    }

    /**
     * 运行完整的多语言测试套件
     */
    async runFullTestSuite() {
        console.log('🚀 启动完整多语言测试套件...');
        
        const suiteStartTime = Date.now();
        await this.takeScreenshot('test-suite-start');
        
        // 1. 检查系统状态
        const systemStatus = await this.checkSystemStatus();
        if (!systemStatus.ready) {
            console.error('❌ 系统未就绪，终止测试');
            return this.generateReport();
        }
        
        // 2. 测试语言选择器存在性
        await this.testLanguageSelectorPresence();
        
        // 3. 测试语言选择器点击功能
        await this.testLanguageSelectorClick();
        
        // 4. 测试语言选项
        await this.testLanguageOptions();
        
        // 5. 测试每种语言的切换
        for (const language of this.supportedLanguages) {
            await this.testLanguageSwitch(language);
            await this.testContentTranslation(language);
            
            // 在每次切换之间稍等片刻
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        await this.takeScreenshot('test-suite-complete');
        
        const suiteDuration = Date.now() - suiteStartTime;
        console.log(`🎉 测试套件完成，耗时: ${suiteDuration}ms`);
        
        return this.generateReport();
    }

    /**
     * 生成测试报告
     */
    generateReport() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.status === 'pass').length;
        const failedTests = this.testResults.filter(r => r.status === 'fail').length;
        const warningTests = this.testResults.filter(r => r.status === 'warn').length;
        
        const report = {
            summary: {
                totalTests,
                passedTests,
                failedTests,
                warningTests,
                successRate: ((passedTests / totalTests) * 100).toFixed(2) + '%',
                duration: Date.now() - this.testStartTime
            },
            testResults: this.testResults,
            screenshots: this.screenshots,
            recommendations: this.generateRecommendations(),
            timestamp: new Date().toISOString()
        };
        
        console.log('📊 测试报告已生成:', report.summary);
        return report;
    }

    /**
     * 生成修复建议
     */
    generateRecommendations() {
        const recommendations = [];
        const failedTests = this.testResults.filter(r => r.status === 'fail');
        
        failedTests.forEach(test => {
            switch (test.testName) {
                case 'System Status Check':
                    recommendations.push({
                        priority: 'high',
                        issue: '系统初始化问题',
                        solution: '检查 i18n-system.js 和 language-integration.js 是否正确加载和初始化',
                        code: 'window.initMultiLanguage(); // 手动初始化多语言系统'
                    });
                    break;
                    
                case 'Language Selector Presence':
                    recommendations.push({
                        priority: 'high', 
                        issue: '语言选择器DOM元素缺失',
                        solution: '确保HTML中包含必要的语言选择器元素',
                        code: `
<!-- 确保HTML中包含以下结构 -->
<div class="language-selector" id="languageSelector">
    <button class="language-toggle" id="languageToggle">🌐 简体中文</button>
    <div class="language-dropdown" id="languageDropdown">
        <!-- 语言选项 -->
    </div>
</div>`
                    });
                    break;
                    
                case 'Language Selector Click':
                    recommendations.push({
                        priority: 'medium',
                        issue: '语言选择器点击事件无响应',
                        solution: '检查事件监听器绑定和CSS动画效果',
                        code: 'window.languageIntegration?.init(); // 重新初始化语言集成'
                    });
                    break;
                    
                default:
                    if (test.testName.includes('Language Switch')) {
                        recommendations.push({
                            priority: 'medium',
                            issue: `${test.details?.targetLanguage || '特定语言'} 切换失败`,
                            solution: '检查翻译数据是否完整，语言切换逻辑是否正确',
                            code: `window.i18n.changeLanguage('${test.details?.targetLanguage || 'zh-CN'}');`
                        });
                    }
                    break;
            }
        });
        
        // 通用建议
        if (failedTests.length > 0) {
            recommendations.push({
                priority: 'low',
                issue: '通用调试建议',
                solution: '打开开发者工具查看控制台错误信息',
                code: `
// 检查多语言系统状态
console.log('i18n:', window.i18n);
console.log('languageIntegration:', window.languageIntegration);
console.log('当前语言:', window.i18n?.currentLanguage);
`
            });
        }
        
        return recommendations;
    }

    /**
     * 手动测试模式 - 适合在浏览器控制台中运行
     */
    static async runManualTest() {
        const testSuite = new MultilingualTestSuite();
        const report = await testSuite.runFullTestSuite();
        
        // 在控制台中显示详细报告
        console.table(report.testResults);
        console.log('🎯 修复建议:', report.recommendations);
        
        return report;
    }
}

// 导出测试套件
window.MultilingualTestSuite = MultilingualTestSuite;

// 便捷测试函数
window.runMultiLangTest = () => MultilingualTestSuite.runManualTest();

console.log('🧪 多语言测试套件已加载');
console.log('💡 使用方法:');
console.log('   - 运行完整测试: runMultiLangTest()');
console.log('   - 创建测试实例: new MultilingualTestSuite()');