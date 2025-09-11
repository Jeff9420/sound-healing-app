/**
 * Playwright多语言功能调试测试脚本
 * 此脚本将检测和修复多语言切换问题
 */

import { chromium } from 'playwright';

async function runMultiLanguageDebugTest() {
    console.log('🚀 启动Playwright多语言功能调试测试...');
    
    // 启动浏览器
    const browser = await chromium.launch({ 
        headless: false,  // 显示浏览器窗口以便调试
        slowMo: 500       // 减慢操作速度以便观察
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // 监听控制台输出
    page.on('console', msg => {
        console.log(`📜 Console ${msg.type()}: ${msg.text()}`);
    });
    
    // 监听页面错误
    page.on('pageerror', error => {
        console.error(`❌ Page Error: ${error.message}`);
    });
    
    try {
        console.log('📍 Step 1: 导航到声音疗愈应用');
        // 使用文件URL直接访问
        const fileUrl = 'file:///C:/Users/MI/Desktop/声音疗愈/sound-healing-app/index.html';
        await page.goto(fileUrl);
        await page.waitForLoadState('domcontentloaded');
        
        // 截取初始页面截图
        await page.screenshot({ path: 'debug-step1-initial-page.png', fullPage: true });
        console.log('✅ 初始页面截图已保存');
        
        console.log('📍 Step 2: 检查页面基本元素');
        
        // 检查关键元素是否存在
        const languageSelector = await page.locator('#languageSelector');
        const languageToggle = await page.locator('#languageToggle');
        const languageDropdown = await page.locator('#languageDropdown');
        
        console.log('🔍 检查DOM元素存在性:');
        console.log(`- languageSelector: ${await languageSelector.count() > 0 ? '✅' : '❌'}`);
        console.log(`- languageToggle: ${await languageToggle.count() > 0 ? '✅' : '❌'}`);
        console.log(`- languageDropdown: ${await languageDropdown.count() > 0 ? '✅' : '❌'}`);
        
        if (await languageToggle.count() === 0) {
            console.error('❌ 语言切换按钮不存在，检查HTML结构');
            return { success: false, error: '语言切换按钮不存在' };
        }
        
        console.log('📍 Step 3: 检查JavaScript加载状态');
        
        // 检查关键JavaScript对象是否存在
        const i18nExists = await page.evaluate(() => typeof window.i18n !== 'undefined');
        const languageIntegrationExists = await page.evaluate(() => typeof window.languageIntegration !== 'undefined');
        const i18nInitialized = await page.evaluate(() => window.i18n && window.i18n.isInitialized);
        const integrationInitialized = await page.evaluate(() => window.languageIntegration && window.languageIntegration.isInitialized);
        
        console.log('🔍 检查JavaScript系统状态:');
        console.log(`- window.i18n 存在: ${i18nExists ? '✅' : '❌'}`);
        console.log(`- window.languageIntegration 存在: ${languageIntegrationExists ? '✅' : '❌'}`);
        console.log(`- i18n 已初始化: ${i18nInitialized ? '✅' : '❌'}`);
        console.log(`- 语言集成已初始化: ${integrationInitialized ? '✅' : '❌'}`);
        
        if (!i18nExists || !i18nInitialized) {
            console.log('⚠️ i18n系统未就绪，等待初始化...');
            await page.waitForTimeout(3000);
            
            // 再次检查
            const i18nRetryExists = await page.evaluate(() => typeof window.i18n !== 'undefined');
            const i18nRetryInitialized = await page.evaluate(() => window.i18n && window.i18n.isInitialized);
            
            console.log(`- 重试后 i18n 存在: ${i18nRetryExists ? '✅' : '❌'}`);
            console.log(`- 重试后 i18n 已初始化: ${i18nRetryInitialized ? '✅' : '❌'}`);
            
            if (!i18nRetryInitialized) {
                console.log('🔧 尝试手动初始化i18n系统...');
                await page.evaluate(() => {
                    if (window.initMultiLanguage) {
                        window.initMultiLanguage();
                    }
                });
                await page.waitForTimeout(2000);
            }
        }
        
        console.log('📍 Step 4: 测试语言切换按钮点击');
        
        // 确保元素可见
        await languageToggle.waitFor({ state: 'visible' });
        
        // 获取点击前的状态
        const beforeClickClass = await languageSelector.getAttribute('class');
        console.log(`点击前选择器class: ${beforeClickClass}`);
        
        // 点击语言切换按钮
        console.log('🖱️ 点击语言切换按钮...');
        await languageToggle.click();
        
        // 等待动画完成
        await page.waitForTimeout(500);
        
        // 检查下拉菜单是否出现
        const afterClickClass = await languageSelector.getAttribute('class');
        console.log(`点击后选择器class: ${afterClickClass}`);
        
        const dropdownVisible = await languageDropdown.isVisible();
        console.log(`下拉菜单可见性: ${dropdownVisible ? '✅' : '❌'}`);
        
        if (!dropdownVisible) {
            console.log('❌ 下拉菜单未显示，检查CSS和JavaScript事件绑定');
            
            // 检查CSS样式
            const dropdownStyles = await languageDropdown.evaluate(el => {
                const computed = window.getComputedStyle(el);
                return {
                    display: computed.display,
                    visibility: computed.visibility,
                    opacity: computed.opacity,
                    transform: computed.transform
                };
            });
            
            console.log('🎨 下拉菜单CSS样式:', dropdownStyles);
            
            // 尝试手动触发显示
            await page.evaluate(() => {
                const selector = document.getElementById('languageSelector');
                if (selector) {
                    selector.classList.add('active');
                }
            });
            
            await page.waitForTimeout(500);
            const manualShowVisible = await languageDropdown.isVisible();
            console.log(`手动显示后可见性: ${manualShowVisible ? '✅' : '❌'}`);
        }
        
        // 截取点击后截图
        await page.screenshot({ path: 'debug-step4-after-click.png', fullPage: true });
        console.log('✅ 点击后截图已保存');
        
        console.log('📍 Step 5: 测试语言选项点击');
        
        if (dropdownVisible || await languageDropdown.isVisible()) {
            // 获取所有语言选项
            const languageOptions = await page.locator('.language-option').all();
            console.log(`找到 ${languageOptions.length} 个语言选项`);
            
            for (let i = 0; i < Math.min(languageOptions.length, 3); i++) {
                const option = languageOptions[i];
                const langCode = await option.getAttribute('data-lang');
                const optionText = await option.textContent();
                
                console.log(`🌍 测试语言选项: ${optionText} (${langCode})`);
                
                // 记录当前页面语言
                const currentLang = await page.evaluate(() => window.i18n ? window.i18n.currentLanguage : 'unknown');
                console.log(`点击前当前语言: ${currentLang}`);
                
                // 点击语言选项
                await option.click();
                await page.waitForTimeout(1000);
                
                // 检查语言是否改变
                const newLang = await page.evaluate(() => window.i18n ? window.i18n.currentLanguage : 'unknown');
                const htmlLang = await page.getAttribute('html', 'lang');
                const titleText = await page.title();
                
                console.log(`点击后语言: ${newLang}`);
                console.log(`HTML lang属性: ${htmlLang}`);
                console.log(`页面标题: ${titleText}`);
                
                if (newLang === langCode) {
                    console.log(`✅ 语言切换成功: ${langCode}`);
                } else {
                    console.log(`❌ 语言切换失败: 期望${langCode}，实际${newLang}`);
                }
                
                // 截图记录
                await page.screenshot({ path: `debug-step5-lang-${langCode}.png`, fullPage: true });
                
                // 重新打开下拉菜单为下次测试准备
                if (i < languageOptions.length - 1) {
                    await languageToggle.click();
                    await page.waitForTimeout(500);
                }
            }
        } else {
            console.log('❌ 无法测试语言选项，下拉菜单未显示');
        }
        
        console.log('📍 Step 6: 生成修复建议');
        
        // 收集所有发现的问题
        const issues = [];
        
        if (!dropdownVisible) {
            issues.push({
                type: 'UI交互',
                problem: '语言切换按钮点击后下拉菜单不显示',
                solution: '检查CSS active类和JavaScript事件绑定'
            });
        }
        
        if (!i18nInitialized) {
            issues.push({
                type: 'JavaScript初始化',
                problem: 'i18n系统未正确初始化',
                solution: '调整脚本加载顺序或添加初始化等待机制'
            });
        }
        
        const report = {
            success: issues.length === 0,
            timestamp: new Date().toISOString(),
            issues: issues,
            screenshots: [
                'debug-step1-initial-page.png',
                'debug-step4-after-click.png'
            ]
        };
        
        console.log('📊 测试完成，生成报告:');
        console.log(JSON.stringify(report, null, 2));
        
        return report;
        
    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error);
        await page.screenshot({ path: 'debug-error.png', fullPage: true });
        return { success: false, error: error.message };
    } finally {
        console.log('🧹 清理浏览器资源...');
        await browser.close();
    }
}

// 导出函数供MCP使用
export { runMultiLanguageDebugTest };

// 如果直接运行此脚本
runMultiLanguageDebugTest()
    .then(result => {
        console.log('🎯 测试结果:', result);
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        console.error('💥 测试失败:', error);
        process.exit(1);
    });