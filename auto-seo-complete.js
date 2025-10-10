/**
 * 完全自动化SEO配置
 * 自动完成所有表单填写和按钮点击
 */

const { chromium } = require('playwright');

async function autoCompleteSEO() {
    console.log('🚀 启动完全自动化SEO配置...\n');

    const browser = await chromium.launch({
        headless: false,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: ['--start-maximized']
    });

    const context = await browser.newContext({
        viewport: null
    });

    try {
        // ========================================
        // 任务1: Google Search Console自动化
        // ========================================
        console.log('📊 任务1: 自动配置Google Search Console\n');

        const gscPage = await context.newPage();
        console.log('🔗 打开Google Search Console...');

        await gscPage.goto('https://search.google.com/search-console', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        await gscPage.waitForTimeout(5000);
        await gscPage.screenshot({ path: 'auto-gsc-1.png', fullPage: false });
        console.log('📸 截图: auto-gsc-1.png');

        // 检查是否需要登录
        const needLogin = await gscPage.locator('text=/sign in|login|登录/i').count() > 0;
        if (needLogin) {
            console.log('\n⚠️ 检测到需要登录Google账号');
            console.log('请在打开的浏览器中登录，完成后等待10秒自动继续...\n');
            await gscPage.waitForTimeout(30000); // 等30秒让用户登录
        }

        console.log('✓ 尝试自动添加资源...');

        // 尝试多种方式查找"添加资源"按钮
        const addPropertySelectors = [
            'text=/add property|添加资源|添加属性/i',
            'button:has-text("Add property")',
            'button:has-text("添加资源")',
            '[aria-label*="Add property"]',
            'a[href*="add-property"]'
        ];

        let propertyAdded = false;
        for (const selector of addPropertySelectors) {
            try {
                const button = gscPage.locator(selector).first();
                if (await button.isVisible({ timeout: 3000 })) {
                    console.log(`✓ 找到按钮: ${selector}`);
                    await button.click();
                    await gscPage.waitForTimeout(3000);
                    propertyAdded = true;
                    break;
                }
            } catch (e) {
                // 继续尝试
            }
        }

        if (propertyAdded) {
            console.log('✓ 点击了添加资源按钮');
            await gscPage.screenshot({ path: 'auto-gsc-2.png', fullPage: false });

            // 选择"URL prefix"类型
            try {
                const urlPrefixButton = gscPage.locator('text=/url prefix|网址前缀/i').first();
                if (await urlPrefixButton.isVisible({ timeout: 3000 })) {
                    await urlPrefixButton.click();
                    console.log('✓ 选择了URL prefix类型');
                    await gscPage.waitForTimeout(2000);
                }
            } catch (e) {
                console.log('⚠️ 未找到URL prefix选项，跳过');
            }

            // 输入网站URL
            try {
                const urlInput = gscPage.locator('input[type="text"], input[type="url"]').first();
                if (await urlInput.isVisible({ timeout: 3000 })) {
                    await urlInput.fill('https://soundflows.app');
                    console.log('✓ 输入了网站URL: https://soundflows.app');
                    await gscPage.waitForTimeout(1000);

                    // 点击继续/验证按钮
                    const continueButton = gscPage.locator('button:has-text("Continue"), button:has-text("继续"), button:has-text("Verify"), button:has-text("验证")').first();
                    if (await continueButton.isVisible({ timeout: 3000 })) {
                        await continueButton.click();
                        console.log('✓ 点击了继续按钮');
                        await gscPage.waitForTimeout(3000);
                    }
                }
            } catch (e) {
                console.log('⚠️ URL输入失败:', e.message);
            }

            await gscPage.screenshot({ path: 'auto-gsc-3.png', fullPage: false });
        }

        console.log('✅ Google Search Console配置尝试完成');
        console.log('📸 请检查截图: auto-gsc-1.png, auto-gsc-2.png, auto-gsc-3.png\n');

        // ========================================
        // 任务2: Bing Webmaster自动化
        // ========================================
        console.log('📊 任务2: 自动配置Bing Webmaster Tools\n');

        const bingPage = await context.newPage();
        console.log('🔗 打开Bing Webmaster Tools...');

        await bingPage.goto('https://www.bing.com/webmasters/home', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        await bingPage.waitForTimeout(5000);
        await bingPage.screenshot({ path: 'auto-bing-1.png', fullPage: false });
        console.log('📸 截图: auto-bing-1.png');

        // 检查是否需要登录
        const bingNeedLogin = await bingPage.locator('text=/sign in|login|登录/i').count() > 0;
        if (bingNeedLogin) {
            console.log('\n⚠️ 检测到需要登录Microsoft账号');
            console.log('请在打开的浏览器中登录，完成后等待10秒自动继续...\n');
            await bingPage.waitForTimeout(30000);
        }

        // 尝试从GSC导入（推荐方式）
        try {
            const importButton = bingPage.locator('text=/import from google|从google导入/i').first();
            if (await importButton.isVisible({ timeout: 5000 })) {
                await importButton.click();
                console.log('✓ 点击了从Google导入按钮');
                await bingPage.waitForTimeout(5000);
                await bingPage.screenshot({ path: 'auto-bing-2.png', fullPage: false });

                // 如果有授权按钮，点击它
                const authorizeButton = bingPage.locator('button:has-text("Authorize"), button:has-text("授权")').first();
                if (await authorizeButton.isVisible({ timeout: 5000 })) {
                    await authorizeButton.click();
                    console.log('✓ 点击了授权按钮');
                    await bingPage.waitForTimeout(3000);
                }
            } else {
                // 尝试手动添加
                const addSiteButton = bingPage.locator('text=/add a site|add site|添加站点/i').first();
                if (await addSiteButton.isVisible({ timeout: 5000 })) {
                    await addSiteButton.click();
                    console.log('✓ 点击了添加站点按钮');
                    await bingPage.waitForTimeout(2000);

                    // 输入网站URL
                    const siteInput = bingPage.locator('input[type="text"], input[type="url"]').first();
                    if (await siteInput.isVisible({ timeout: 3000 })) {
                        await siteInput.fill('https://soundflows.app');
                        console.log('✓ 输入了网站URL');
                        await bingPage.waitForTimeout(1000);

                        const submitButton = bingPage.locator('button:has-text("Add"), button:has-text("添加"), button[type="submit"]').first();
                        if (await submitButton.isVisible({ timeout: 3000 })) {
                            await submitButton.click();
                            console.log('✓ 点击了提交按钮');
                            await bingPage.waitForTimeout(3000);
                        }
                    }
                }
            }
        } catch (e) {
            console.log('⚠️ Bing配置遇到问题:', e.message);
        }

        await bingPage.screenshot({ path: 'auto-bing-3.png', fullPage: false });
        console.log('✅ Bing Webmaster Tools配置尝试完成');
        console.log('📸 请检查截图: auto-bing-1.png, auto-bing-2.png, auto-bing-3.png\n');

        // ========================================
        // 任务3: Facebook Sharing Debugger
        // ========================================
        console.log('📊 任务3: 测试Facebook分享预览\n');

        const fbPage = await context.newPage();
        console.log('🔗 打开Facebook Sharing Debugger...');

        await fbPage.goto('https://developers.facebook.com/tools/debug/', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        await fbPage.waitForTimeout(5000);
        await fbPage.screenshot({ path: 'auto-facebook-1.png', fullPage: false });
        console.log('📸 截图: auto-facebook-1.png');

        try {
            // 查找输入框
            const fbInput = fbPage.locator('input[type="text"], input[name="q"]').first();
            if (await fbInput.isVisible({ timeout: 5000 })) {
                await fbInput.fill('https://soundflows.app');
                console.log('✓ 输入了网站URL');
                await fbPage.waitForTimeout(1000);

                // 点击Debug按钮
                const debugButton = fbPage.locator('button:has-text("Debug"), button:has-text("调试")').first();
                if (await debugButton.isVisible({ timeout: 3000 })) {
                    await debugButton.click();
                    console.log('✓ 点击了Debug按钮');
                    await fbPage.waitForTimeout(5000);
                } else {
                    // 尝试按Enter
                    await fbInput.press('Enter');
                    console.log('✓ 按下了Enter键');
                    await fbPage.waitForTimeout(5000);
                }

                await fbPage.screenshot({ path: 'auto-facebook-2.png', fullPage: true });
                console.log('📸 截图: auto-facebook-2.png');
            }
        } catch (e) {
            console.log('⚠️ Facebook配置遇到问题:', e.message);
        }

        console.log('✅ Facebook分享预览测试完成\n');

        // ========================================
        // 任务4: Twitter Card Validator
        // ========================================
        console.log('📊 任务4: 测试Twitter卡片预览\n');

        const twitterPage = await context.newPage();
        console.log('🔗 打开Twitter Card Validator...');

        await twitterPage.goto('https://cards-dev.twitter.com/validator', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        await twitterPage.waitForTimeout(5000);
        await twitterPage.screenshot({ path: 'auto-twitter-1.png', fullPage: false });
        console.log('📸 截图: auto-twitter-1.png');

        // 检查是否需要登录
        const twitterNeedLogin = await twitterPage.locator('text=/log in|sign in|登录/i').count() > 0;
        if (twitterNeedLogin) {
            console.log('\n⚠️ 检测到需要登录Twitter账号');
            console.log('请在打开的浏览器中登录，完成后等待10秒自动继续...\n');
            await twitterPage.waitForTimeout(30000);
        }

        try {
            // 查找输入框
            const twitterInput = twitterPage.locator('input[type="text"], input[type="url"], textarea').first();
            if (await twitterInput.isVisible({ timeout: 5000 })) {
                await twitterInput.fill('https://soundflows.app');
                console.log('✓ 输入了网站URL');
                await twitterPage.waitForTimeout(1000);

                // 点击Preview按钮
                const previewButton = twitterPage.locator('button:has-text("Preview"), input[type="submit"]').first();
                if (await previewButton.isVisible({ timeout: 3000 })) {
                    await previewButton.click();
                    console.log('✓ 点击了Preview按钮');
                    await twitterPage.waitForTimeout(5000);
                } else {
                    // 尝试按Enter
                    await twitterInput.press('Enter');
                    console.log('✓ 按下了Enter键');
                    await twitterPage.waitForTimeout(5000);
                }

                await twitterPage.screenshot({ path: 'auto-twitter-2.png', fullPage: true });
                console.log('📸 截图: auto-twitter-2.png');
            }
        } catch (e) {
            console.log('⚠️ Twitter配置遇到问题:', e.message);
        }

        console.log('✅ Twitter卡片预览测试完成\n');

        // ========================================
        // 完成总结
        // ========================================
        console.log('\n🎉 所有自动化配置任务已完成！\n');
        console.log('📊 生成的截图文件：');
        console.log('  ✓ auto-gsc-1.png, auto-gsc-2.png, auto-gsc-3.png (Google Search Console)');
        console.log('  ✓ auto-bing-1.png, auto-bing-2.png, auto-bing-3.png (Bing Webmaster)');
        console.log('  ✓ auto-facebook-1.png, auto-facebook-2.png (Facebook)');
        console.log('  ✓ auto-twitter-1.png, auto-twitter-2.png (Twitter)\n');

        console.log('📋 请检查截图确认配置结果');
        console.log('如果某些步骤需要登录，请在浏览器中完成登录后刷新页面\n');

        console.log('⏰ 浏览器将保持打开60秒供您检查...');
        await new Promise(resolve => setTimeout(resolve, 60000));

        console.log('\n🔚 关闭浏览器...');
        await browser.close();
        console.log('✅ 所有任务完成！');

    } catch (error) {
        console.error('\n❌ 发生错误:', error.message);
        console.error(error.stack);
        try {
            await browser.close();
        } catch (e) {
            // 忽略关闭错误
        }
    }
}

autoCompleteSEO().catch(console.error);
