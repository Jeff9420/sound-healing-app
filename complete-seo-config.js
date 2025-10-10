/**
 * 完成所有SEO配置任务
 * 使用Playwright自动化浏览器操作
 */

const { chromium } = require('playwright');

async function completeSEOConfiguration() {
    console.log('🚀 开始SEO配置自动化流程...\n');

    const browser = await chromium.launch({
        headless: false,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: ['--start-maximized']
    });

    const context = await browser.newContext({
        viewport: null
    });

    const page = await context.newPage();

    try {
        // ========================================
        // 任务1: Google Search Console
        // ========================================
        console.log('📊 任务1: Google Search Console配置\n');
        console.log('🔗 打开Google Search Console...');

        await page.goto('https://search.google.com/search-console', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'seo-gsc-step1.png', fullPage: false });
        console.log('📸 截图: seo-gsc-step1.png\n');

        const pageTitle = await page.title();
        if (pageTitle.includes('Sign in') || pageTitle.includes('登录')) {
            console.log('⚠️ 需要登录Google账号');
            console.log('📋 请在浏览器中：');
            console.log('  1. 登录你的Google账号');
            console.log('  2. 登录后按Enter继续...\n');

            // 等待用户登录
            await new Promise(resolve => {
                process.stdin.once('data', resolve);
            });

            await page.waitForTimeout(2000);
        }

        console.log('✅ 已登录Google Search Console\n');
        console.log('📋 接下来需要手动操作：');
        console.log('  1. 点击"添加资源"或"Add property"按钮');
        console.log('  2. 选择"网址前缀"类型');
        console.log('  3. 输入: https://soundflows.app');
        console.log('  4. 选择验证方法: "Google Analytics（分析）"');
        console.log('  5. 系统会自动检测到GA4 (G-4NZR3HR3J1)');
        console.log('  6. 点击"验证"按钮');
        console.log('  7. 验证成功后，点击"前往资源"');
        console.log('  8. 在左侧菜单找到"站点地图"');
        console.log('  9. 输入: sitemap.xml');
        console.log('  10. 点击"提交"');
        console.log('\n完成后按Enter继续...\n');

        await new Promise(resolve => {
            process.stdin.once('data', resolve);
        });

        await page.screenshot({ path: 'seo-gsc-completed.png', fullPage: false });
        console.log('📸 截图: seo-gsc-completed.png');
        console.log('✅ Google Search Console配置完成\n');

        // ========================================
        // 任务2: Bing Webmaster Tools
        // ========================================
        console.log('📊 任务2: Bing Webmaster Tools配置\n');

        const bingPage = await context.newPage();
        console.log('🔗 打开Bing Webmaster Tools...');

        await bingPage.goto('https://www.bing.com/webmasters', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        await bingPage.waitForTimeout(3000);
        await bingPage.screenshot({ path: 'seo-bing-step1.png', fullPage: false });
        console.log('📸 截图: seo-bing-step1.png\n');

        const bingTitle = await bingPage.title();
        if (bingTitle.includes('Sign in') || bingTitle.includes('登录')) {
            console.log('⚠️ 需要登录Microsoft账号');
            console.log('📋 请在浏览器中：');
            console.log('  1. 登录你的Microsoft账号');
            console.log('  2. 登录后按Enter继续...\n');

            await new Promise(resolve => {
                process.stdin.once('data', resolve);
            });

            await bingPage.waitForTimeout(2000);
        }

        console.log('✅ 已登录Bing Webmaster Tools\n');
        console.log('📋 选择导入方式（推荐从GSC导入）：\n');
        console.log('方法A - 从Google Search Console导入（推荐）：');
        console.log('  1. 点击"Import from Google Search Console"');
        console.log('  2. 授权连接Google账号');
        console.log('  3. 选择 soundflows.app');
        console.log('  4. 点击"Import"');
        console.log('\n方法B - 手动添加：');
        console.log('  1. 点击"Add a site"');
        console.log('  2. 输入: https://soundflows.app');
        console.log('  3. 选择验证方法（推荐使用HTML标签）');
        console.log('  4. 复制验证代码，添加到网站<head>中');
        console.log('  5. 提交sitemap: https://soundflows.app/sitemap.xml');
        console.log('\n完成后按Enter继续...\n');

        await new Promise(resolve => {
            process.stdin.once('data', resolve);
        });

        await bingPage.screenshot({ path: 'seo-bing-completed.png', fullPage: false });
        console.log('📸 截图: seo-bing-completed.png');
        console.log('✅ Bing Webmaster Tools配置完成\n');

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

        await fbPage.waitForTimeout(3000);
        await fbPage.screenshot({ path: 'seo-facebook-step1.png', fullPage: false });
        console.log('📸 截图: seo-facebook-step1.png\n');

        console.log('📋 手动操作步骤：');
        console.log('  1. 在输入框中输入: https://soundflows.app');
        console.log('  2. 点击"Debug"或"调试"按钮');
        console.log('  3. 等待抓取完成');
        console.log('  4. 检查预览图片是否显示正确（og-image.jpg 1200x630）');
        console.log('  5. 检查标题、描述是否正确');
        console.log('  6. 如果需要更新缓存，点击"Scrape Again"');
        console.log('\n完成后按Enter继续...\n');

        await new Promise(resolve => {
            process.stdin.once('data', resolve);
        });

        await fbPage.screenshot({ path: 'seo-facebook-completed.png', fullPage: true });
        console.log('📸 截图: seo-facebook-completed.png');
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

        await twitterPage.waitForTimeout(3000);
        await twitterPage.screenshot({ path: 'seo-twitter-step1.png', fullPage: false });
        console.log('📸 截图: seo-twitter-step1.png\n');

        const twitterTitle = await twitterPage.title();
        if (twitterTitle.includes('Log in') || twitterTitle.includes('登录')) {
            console.log('⚠️ 需要登录Twitter/X账号');
            console.log('📋 请在浏览器中：');
            console.log('  1. 登录你的Twitter账号');
            console.log('  2. 登录后按Enter继续...\n');

            await new Promise(resolve => {
                process.stdin.once('data', resolve);
            });

            await twitterPage.waitForTimeout(2000);
        }

        console.log('✅ 已登录Twitter Card Validator\n');
        console.log('📋 手动操作步骤：');
        console.log('  1. 在输入框中输入: https://soundflows.app');
        console.log('  2. 点击"Preview card"按钮');
        console.log('  3. 等待预览加载');
        console.log('  4. 检查卡片图片是否显示正确（twitter-card.jpg 1200x628）');
        console.log('  5. 检查标题、描述是否正确');
        console.log('  6. 确认卡片类型为"summary_large_image"');
        console.log('\n完成后按Enter继续...\n');

        await new Promise(resolve => {
            process.stdin.once('data', resolve);
        });

        await twitterPage.screenshot({ path: 'seo-twitter-completed.png', fullPage: true });
        console.log('📸 截图: seo-twitter-completed.png');
        console.log('✅ Twitter卡片预览测试完成\n');

        // ========================================
        // 总结
        // ========================================
        console.log('\n🎉 所有SEO配置任务完成！\n');
        console.log('📊 生成的截图文件：');
        console.log('  ✓ seo-gsc-step1.png');
        console.log('  ✓ seo-gsc-completed.png');
        console.log('  ✓ seo-bing-step1.png');
        console.log('  ✓ seo-bing-completed.png');
        console.log('  ✓ seo-facebook-step1.png');
        console.log('  ✓ seo-facebook-completed.png');
        console.log('  ✓ seo-twitter-step1.png');
        console.log('  ✓ seo-twitter-completed.png\n');

        console.log('📋 后续建议：');
        console.log('  1. 定期检查Google Search Console的索引状态');
        console.log('  2. 监控Bing Webmaster的爬虫活动');
        console.log('  3. 在社交媒体分享链接，验证预览效果');
        console.log('  4. 7-14天后检查搜索引擎收录情况\n');

        console.log('⏰ 浏览器将保持打开，您可以继续查看...');
        console.log('按Ctrl+C结束脚本\n');

        // 保持浏览器打开
        await new Promise(() => {});

    } catch (error) {
        console.error('\n❌ 发生错误:', error.message);
        await page.screenshot({ path: 'seo-error.png', fullPage: true });
        console.log('📸 错误截图: seo-error.png');
    }
}

completeSEOConfiguration().catch(console.error);
