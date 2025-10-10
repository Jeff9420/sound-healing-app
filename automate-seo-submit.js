/**
 * 自动化SEO提交脚本
 * 使用Playwright自动化浏览器操作
 */

const { chromium } = require('playwright');

const SITE_URL = 'https://soundflows.app';
const GA4_ID = 'G-4NZR3HR3J1';

async function waitForDeployment() {
    console.log('⏳ 等待Vercel部署完成...');
    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
        try {
            const response = await fetch(`${SITE_URL}/assets/images/og-image.jpg`);
            if (response.ok) {
                console.log('✅ 部署完成！图片已可访问');
                return true;
            }
        } catch (error) {
            // 继续等待
        }

        attempts++;
        console.log(`等待中... (${attempts}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 10000)); // 等待10秒
    }

    console.log('⚠️ 部署检查超时，但继续执行...');
    return false;
}

async function testFacebookDebugger(page) {
    console.log('\n📘 测试Facebook分享调试器...');
    try {
        await page.goto('https://developers.facebook.com/tools/debug/', { waitUntil: 'networkidle' });

        // 等待输入框
        await page.waitForSelector('input[type="text"]', { timeout: 10000 });

        // 输入URL
        await page.fill('input[type="text"]', SITE_URL);

        // 点击调试按钮
        await page.click('button:has-text("Debug")');

        // 等待结果
        await page.waitForTimeout(5000);

        // 截图保存
        await page.screenshot({ path: 'facebook-debug-result.png' });
        console.log('✅ Facebook调试完成，截图已保存');

        return true;
    } catch (error) {
        console.error('❌ Facebook调试失败:', error.message);
        return false;
    }
}

async function testTwitterCard(page) {
    console.log('\n🐦 测试Twitter Card验证器...');
    try {
        await page.goto('https://cards-dev.twitter.com/validator', { waitUntil: 'networkidle' });

        // 等待输入框
        await page.waitForSelector('input[type="url"]', { timeout: 10000 });

        // 输入URL
        await page.fill('input[type="url"]', SITE_URL);

        // 点击预览按钮
        await page.click('button:has-text("Preview")');

        // 等待结果
        await page.waitForTimeout(5000);

        // 截图保存
        await page.screenshot({ path: 'twitter-card-result.png' });
        console.log('✅ Twitter Card验证完成，截图已保存');

        return true;
    } catch (error) {
        console.error('❌ Twitter Card验证失败:', error.message);
        return false;
    }
}

async function main() {
    console.log('🚀 开始自动化SEO提交流程...\n');
    console.log(`网站: ${SITE_URL}`);
    console.log(`GA4 ID: ${GA4_ID}\n`);

    // 等待部署
    await waitForDeployment();

    // 启动浏览器
    console.log('\n🌐 启动浏览器...');
    const browser = await chromium.launch({
        headless: false, // 显示浏览器窗口，方便您看到进度和进行授权
        channel: 'msedge' // 使用Edge浏览器
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // 打开Google Search Console
        console.log('\n📊 打开Google Search Console...');
        await page.goto('https://search.google.com/search-console');
        console.log('✅ 已打开GSC，请在浏览器中登录并添加资源');
        console.log('   资源URL: https://soundflows.app');
        console.log('   验证方式: Google Analytics (GA4: G-4NZR3HR3J1)');
        console.log('   Sitemap: sitemap.xml');
        await page.waitForTimeout(10000); // 等待10秒让用户看到

        // 打开Bing Webmaster Tools
        console.log('\n📊 打开Bing Webmaster Tools...');
        const bingPage = await context.newPage();
        await bingPage.goto('https://www.bing.com/webmasters');
        console.log('✅ 已打开Bing Webmaster，请登录并从GSC导入');
        await bingPage.waitForTimeout(10000);

        // 测试Facebook分享
        const facebookPage = await context.newPage();
        await testFacebookDebugger(facebookPage);

        // 测试Twitter Card
        const twitterPage = await context.newPage();
        await testTwitterCard(twitterPage);

        console.log('\n✅ 自动化流程完成！');
        console.log('\n📋 下一步：');
        console.log('1. 在Google Search Console中完成资源验证');
        console.log('2. 提交sitemap: sitemap.xml');
        console.log('3. 在Bing Webmaster中从GSC导入站点');
        console.log('4. 查看保存的截图：facebook-debug-result.png 和 twitter-card-result.png');

        // 保持浏览器打开30秒，让用户完成操作
        console.log('\n浏览器将在30秒后关闭...');
        await page.waitForTimeout(30000);

    } catch (error) {
        console.error('❌ 执行过程中出错:', error);
    } finally {
        await browser.close();
        console.log('\n🔚 浏览器已关闭');
    }
}

main().catch(console.error);
