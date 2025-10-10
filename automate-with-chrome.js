/**
 * 使用Chrome进行自动化部署和验证
 */

const { chromium } = require('playwright');

const SITE_URL = 'https://soundflows.app';
const VERCEL_PROJECT_URL = 'https://vercel.com/weiqas-projects/sound-healing-app';

async function main() {
    console.log('🚀 使用Chrome浏览器启动自动化流程...\n');

    // 启动Chrome浏览器
    const browser = await chromium.launch({
        headless: false,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: ['--start-maximized']
    });

    const context = await browser.newContext({
        viewport: null
    });

    console.log('✅ Chrome浏览器已启动\n');

    // 1. 打开Vercel触发部署
    console.log('📦 步骤1: 打开Vercel项目页面...');
    const vercelPage = await context.newPage();
    await vercelPage.goto(VERCEL_PROJECT_URL);
    console.log('✅ Vercel页面已打开');
    console.log('⏳ 请在浏览器中手动触发 Redeploy（如果需要）\n');
    await vercelPage.waitForTimeout(5000);

    // 2. 等待部署完成
    console.log('📦 步骤2: 检查部署状态...');
    let deployed = false;
    let attempts = 0;
    const maxAttempts = 30;

    while (!deployed && attempts < maxAttempts) {
        try {
            const response = await vercelPage.goto(`${SITE_URL}/assets/images/og-image.jpg`, {
                waitUntil: 'networkidle',
                timeout: 10000
            });

            if (response && response.status() === 200) {
                console.log('✅ 部署完成！图片已可访问\n');
                deployed = true;
            } else {
                attempts++;
                console.log(`⏳ 等待部署... (${attempts}/${maxAttempts})`);
                await vercelPage.waitForTimeout(10000);
            }
        } catch (error) {
            attempts++;
            console.log(`⏳ 等待部署... (${attempts}/${maxAttempts})`);
            await vercelPage.waitForTimeout(10000);
        }
    }

    if (!deployed) {
        console.log('⚠️ 部署检查超时，但继续执行验证步骤...\n');
    }

    // 3. Google Search Console
    console.log('📊 步骤3: 打开Google Search Console...');
    const gscPage = await context.newPage();
    await gscPage.goto('https://search.google.com/search-console');
    console.log('✅ GSC已打开');
    console.log('📝 操作提示：');
    console.log('   1. 点击"添加资源"');
    console.log('   2. 选择"URL前缀"，输入: https://soundflows.app');
    console.log('   3. 使用Google Analytics验证 (GA4: G-4NZR3HR3J1)');
    console.log('   4. 验证成功后，提交sitemap: sitemap.xml\n');
    await gscPage.waitForTimeout(3000);

    // 4. Bing Webmaster Tools
    console.log('📊 步骤4: 打开Bing Webmaster Tools...');
    const bingPage = await context.newPage();
    await bingPage.goto('https://www.bing.com/webmasters');
    console.log('✅ Bing已打开');
    console.log('📝 操作提示：');
    console.log('   1. 选择"从Google Search Console导入"（推荐）');
    console.log('   2. 或手动添加站点: https://soundflows.app\n');
    await bingPage.waitForTimeout(3000);

    // 5. Facebook分享调试器
    console.log('📘 步骤5: 测试Facebook分享...');
    const fbPage = await context.newPage();
    await fbPage.goto('https://developers.facebook.com/tools/debug/');
    console.log('✅ Facebook调试器已打开');

    try {
        // 等待页面加载
        await fbPage.waitForTimeout(3000);

        // 尝试查找输入框并填入URL
        const inputSelector = 'input[name="q"], input[type="text"], input[placeholder*="URL"]';
        await fbPage.waitForSelector(inputSelector, { timeout: 5000 });
        await fbPage.fill(inputSelector, SITE_URL);
        console.log('✅ 已输入URL: ' + SITE_URL);

        // 查找并点击调试按钮
        const debugButton = await fbPage.locator('button:has-text("Debug"), button:has-text("调试")').first();
        if (await debugButton.isVisible()) {
            await debugButton.click();
            console.log('✅ 已点击调试按钮');
            await fbPage.waitForTimeout(5000);
        }
    } catch (error) {
        console.log('⚠️ 自动填充失败，请手动操作');
        console.log('📝 操作提示：');
        console.log('   1. 输入URL: https://soundflows.app');
        console.log('   2. 点击"Debug"按钮');
        console.log('   3. 检查og-image.jpg是否正确显示\n');
    }

    await fbPage.waitForTimeout(3000);

    // 6. Twitter Card验证器
    console.log('🐦 步骤6: 测试Twitter Card...');
    const twitterPage = await context.newPage();
    await twitterPage.goto('https://cards-dev.twitter.com/validator');
    console.log('✅ Twitter验证器已打开');

    try {
        // 等待页面加载
        await twitterPage.waitForTimeout(3000);

        // 尝试查找输入框并填入URL
        const inputSelector = 'input[type="url"], input[type="text"]';
        await twitterPage.waitForSelector(inputSelector, { timeout: 5000 });
        await twitterPage.fill(inputSelector, SITE_URL);
        console.log('✅ 已输入URL: ' + SITE_URL);

        // 查找并点击预览按钮
        const previewButton = await twitterPage.locator('button:has-text("Preview"), input[type="submit"]').first();
        if (await previewButton.isVisible()) {
            await previewButton.click();
            console.log('✅ 已点击预览按钮');
            await twitterPage.waitForTimeout(5000);
        }
    } catch (error) {
        console.log('⚠️ 自动填充失败，请手动操作');
        console.log('📝 操作提示：');
        console.log('   1. 输入URL: https://soundflows.app');
        console.log('   2. 点击"Preview card"按钮');
        console.log('   3. 检查twitter-card.jpg是否正确显示\n');
    }

    console.log('\n✅ 所有页面已打开！');
    console.log('\n📋 接下来请在各个标签页中完成操作：');
    console.log('   1. Vercel - 确认部署成功');
    console.log('   2. Google Search Console - 添加资源并提交sitemap');
    console.log('   3. Bing Webmaster - 导入或添加站点');
    console.log('   4. Facebook - 检查分享预览');
    console.log('   5. Twitter - 检查Card预览');
    console.log('\n⏰ 浏览器将保持打开状态，完成后请手动关闭。');
    console.log('按 Ctrl+C 结束脚本（浏览器会保持打开）\n');

    // 保持脚本运行，不关闭浏览器
    await new Promise(() => {});
}

main().catch(console.error);
