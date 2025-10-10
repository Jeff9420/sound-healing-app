/**
 * 使用Playwright自动化Vercel部署
 */

const { chromium } = require('playwright');

async function deployToVercel() {
    console.log('🚀 启动自动化Vercel部署...\n');

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
        // 1. 打开Vercel deployments页面
        console.log('📂 打开Vercel Deployments页面...');
        await page.goto('https://vercel.com/weiqas-projects/sound-healing-app/deployments', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        console.log('✅ 页面已加载');
        await page.waitForTimeout(3000);

        // 2. 截图当前状态
        await page.screenshot({ path: 'vercel-before-deploy.png', fullPage: true });
        console.log('📸 已截图: vercel-before-deploy.png');

        // 3. 查找并点击Redeploy按钮
        console.log('\n🔍 寻找Redeploy按钮...');

        // 尝试多种可能的选择器
        const possibleSelectors = [
            'button:has-text("Redeploy")',
            'button:has-text("redeploy")',
            '[aria-label*="Redeploy"]',
            '[data-testid*="redeploy"]',
            'button:has-text("Deploy")',
            // 三个点菜单
            'button[aria-label="More actions"]',
            'button[aria-label="Actions"]',
            '[data-testid="overflow-menu-button"]'
        ];

        let buttonFound = false;
        let clickedSelector = '';

        for (const selector of possibleSelectors) {
            try {
                const button = await page.locator(selector).first();
                if (await button.isVisible({ timeout: 2000 })) {
                    console.log(`✓ 找到按钮: ${selector}`);
                    await button.click();
                    clickedSelector = selector;
                    buttonFound = true;
                    await page.waitForTimeout(2000);

                    // 如果点击的是菜单按钮，需要再点击Redeploy选项
                    if (selector.includes('More') || selector.includes('Actions') || selector.includes('overflow')) {
                        console.log('📋 打开了菜单，寻找Redeploy选项...');
                        const redeployOption = await page.locator('text=Redeploy').first();
                        if (await redeployOption.isVisible({ timeout: 2000 })) {
                            await redeployOption.click();
                            console.log('✓ 点击了Redeploy选项');
                        }
                    }

                    break;
                }
            } catch (e) {
                // 继续尝试下一个选择器
            }
        }

        if (!buttonFound) {
            console.log('⚠️ 未找到Redeploy按钮，尝试使用键盘快捷键...');
            // 尝试使用Tab和Enter导航
            await page.keyboard.press('Tab');
            await page.waitForTimeout(500);
        }

        await page.waitForTimeout(3000);

        // 4. 处理确认对话框
        console.log('\n🔍 检查确认对话框...');
        try {
            // 查找确认按钮
            const confirmSelectors = [
                'button:has-text("Redeploy")',
                'button:has-text("Confirm")',
                'button:has-text("Deploy")',
                'button[type="submit"]'
            ];

            for (const selector of confirmSelectors) {
                try {
                    const confirmButton = await page.locator(selector).last();
                    if (await confirmButton.isVisible({ timeout: 2000 })) {
                        console.log(`✓ 找到确认按钮: ${selector}`);
                        await confirmButton.click();
                        console.log('✅ 已确认部署');
                        break;
                    }
                } catch (e) {
                    // 继续
                }
            }
        } catch (error) {
            console.log('ℹ️ 未发现确认对话框（可能已自动部署）');
        }

        await page.waitForTimeout(5000);

        // 5. 截图部署后状态
        await page.screenshot({ path: 'vercel-after-deploy.png', fullPage: true });
        console.log('📸 已截图: vercel-after-deploy.png');

        // 6. 监控部署状态
        console.log('\n⏳ 监控部署状态...');
        console.log('检查页面是否显示"Building"或"Ready"状态...');

        let deploymentStarted = false;
        for (let i = 0; i < 12; i++) {
            await page.waitForTimeout(5000);

            const pageText = await page.textContent('body');

            if (pageText.includes('Building') || pageText.includes('building')) {
                console.log(`✓ 检测到构建中... (${i + 1}/12)`);
                deploymentStarted = true;
            } else if (pageText.includes('Ready') && deploymentStarted) {
                console.log('✅ 部署完成！');
                break;
            } else {
                console.log(`⏳ 等待部署状态更新... (${i + 1}/12)`);
            }
        }

        // 7. 验证部署
        console.log('\n🔍 验证图片文件部署...');
        const testUrls = [
            'https://soundflows.app/assets/images/og-image.jpg',
            'https://soundflows.app/assets/images/twitter-card.jpg'
        ];

        for (const url of testUrls) {
            try {
                const response = await page.goto(url, { timeout: 10000 });
                const status = response.status();
                if (status === 200) {
                    console.log(`✅ ${url.split('/').pop()} - 部署成功 (200)`);
                } else {
                    console.log(`⚠️ ${url.split('/').pop()} - 状态: ${status}`);
                }
            } catch (error) {
                console.log(`❌ ${url.split('/').pop()} - 访问失败`);
            }
        }

        console.log('\n✅ 自动化部署流程完成！');
        console.log('\n📊 结果文件：');
        console.log('- vercel-before-deploy.png (部署前截图)');
        console.log('- vercel-after-deploy.png (部署后截图)');

        console.log('\n⏰ 浏览器将在10秒后关闭...');
        await page.waitForTimeout(10000);

    } catch (error) {
        console.error('\n❌ 发生错误:', error.message);
        await page.screenshot({ path: 'vercel-error.png', fullPage: true });
        console.log('📸 错误截图已保存: vercel-error.png');
    } finally {
        await browser.close();
        console.log('\n🔚 浏览器已关闭');
    }
}

deployToVercel().catch(console.error);
