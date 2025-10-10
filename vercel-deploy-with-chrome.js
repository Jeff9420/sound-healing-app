/**
 * 使用已登录的Chrome会话来部署Vercel
 */

const { chromium } = require('playwright');
const os = require('os');
const path = require('path');

async function deployToVercel() {
    console.log('🚀 使用现有Chrome会话部署Vercel...\n');

    // 使用现有的Chrome用户数据
    const userDataDir = path.join(os.homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'User Data');

    const browser = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        channel: 'chrome',
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    try {
        // 1. 打开Vercel项目页面
        console.log('📂 打开Vercel项目页面...');
        await page.goto('https://vercel.com/weiqas-projects/sound-healing-app', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        console.log('✅ 页面已加载，等待完全渲染...');
        await page.waitForTimeout(5000);

        // 2. 截图当前状态
        await page.screenshot({ path: 'vercel-page.png', fullPage: false });
        console.log('📸 已截图: vercel-page.png\n');

        // 3. 检查页面内容
        const pageTitle = await page.title();
        console.log(`📄 页面标题: ${pageTitle}`);

        if (pageTitle.includes('Log in')) {
            console.log('⚠️ 需要登录，请在浏览器中手动登录后按Enter继续...');
            // 等待用户登录
            await page.pause();
        }

        // 4. 查找Redeploy按钮
        console.log('\n🔍 查找部署控制按钮...');

        // 等待页面完全加载
        await page.waitForLoadState('networkidle', { timeout: 30000 });

        // 获取页面所有按钮文本
        const buttons = await page.locator('button').all();
        console.log(`找到 ${buttons.length} 个按钮`);

        for (let i = 0; i < Math.min(buttons.length, 20); i++) {
            try {
                const text = await buttons[i].textContent();
                const isVisible = await buttons[i].isVisible();
                if (text && isVisible) {
                    console.log(`  按钮 ${i + 1}: "${text.trim()}"`);
                }
            } catch (e) {
                // 跳过
            }
        }

        // 5. 尝试多种方式找到Redeploy
        console.log('\n🎯 尝试触发部署...');

        const strategies = [
            // 策略1: 直接点击Redeploy按钮
            async () => {
                const button = page.getByRole('button', { name: /redeploy/i });
                if (await button.isVisible({ timeout: 2000 })) {
                    await button.click();
                    return true;
                }
                return false;
            },
            // 策略2: 点击"..."菜单
            async () => {
                const menu = page.getByRole('button', { name: /more|actions|options/i });
                if (await menu.isVisible({ timeout: 2000 })) {
                    await menu.click();
                    await page.waitForTimeout(1000);
                    const redeploy = page.getByText(/redeploy/i);
                    if (await redeploy.isVisible({ timeout: 2000 })) {
                        await redeploy.click();
                        return true;
                    }
                }
                return false;
            },
            // 策略3: 通过文本查找
            async () => {
                const button = page.locator('button:has-text("Redeploy"), button:has-text("redeploy")').first();
                if (await button.isVisible({ timeout: 2000 })) {
                    await button.click();
                    return true;
                }
                return false;
            }
        ];

        let success = false;
        for (let i = 0; i < strategies.length; i++) {
            console.log(`尝试策略 ${i + 1}...`);
            try {
                if (await strategies[i]()) {
                    console.log(`✅ 策略 ${i + 1} 成功！`);
                    success = true;
                    break;
                }
            } catch (e) {
                console.log(`❌ 策略 ${i + 1} 失败: ${e.message}`);
            }
        }

        if (!success) {
            console.log('\n⚠️ 自动点击失败，请手动操作：');
            console.log('1. 在打开的浏览器中找到"Redeploy"按钮或"..."菜单');
            console.log('2. 点击触发部署');
            console.log('3. 完成后，脚本将自动验证部署状态\n');
            console.log('按Enter继续...');
            // 保持浏览器打开，等待用户操作
            await page.waitForTimeout(60000);
        } else {
            await page.waitForTimeout(3000);

            // 处理确认对话框
            console.log('\n🔍 检查确认对话框...');
            try {
                const confirmButton = page.getByRole('button', { name: /confirm|redeploy|deploy/i }).last();
                if (await confirmButton.isVisible({ timeout: 5000 })) {
                    await confirmButton.click();
                    console.log('✅ 已确认部署');
                }
            } catch (e) {
                console.log('ℹ️ 未发现确认对话框');
            }
        }

        await page.waitForTimeout(5000);

        // 6. 截图部署后状态
        await page.screenshot({ path: 'vercel-deployed.png', fullPage: false });
        console.log('📸 已截图: vercel-deployed.png\n');

        // 7. 监控部署状态
        console.log('⏳ 监控部署状态（最多等待2分钟）...');
        for (let i = 0; i < 24; i++) {
            await page.waitForTimeout(5000);

            const pageContent = await page.content();

            if (pageContent.includes('Building') || pageContent.includes('building')) {
                console.log(`✓ 正在构建... (${Math.floor((i + 1) * 5 / 60)}分${((i + 1) * 5) % 60}秒)`);
            } else if (pageContent.includes('Ready') || pageContent.includes('ready')) {
                console.log('✅ 部署完成！');
                break;
            } else {
                console.log(`⏳ 等待中... (${Math.floor((i + 1) * 5 / 60)}分${((i + 1) * 5) % 60}秒)`);
            }
        }

        // 8. 验证图片部署
        console.log('\n🔍 验证图片文件...');
        const testPage = await browser.newPage();

        const testUrls = [
            'https://soundflows.app/assets/images/og-image.jpg',
            'https://soundflows.app/assets/images/twitter-card.jpg'
        ];

        for (const url of testUrls) {
            try {
                const response = await testPage.goto(url, { timeout: 10000 });
                const status = response.status();
                const fileName = url.split('/').pop();

                if (status === 200) {
                    console.log(`✅ ${fileName} - 已部署 (HTTP ${status})`);
                } else if (status === 307 || status === 301) {
                    console.log(`⚠️ ${fileName} - 重定向 (HTTP ${status})，可能还在部署中`);
                } else {
                    console.log(`❌ ${fileName} - HTTP ${status}`);
                }
            } catch (error) {
                console.log(`❌ ${testUrls[testUrls.indexOf(url)].split('/').pop()} - 无法访问`);
            }
        }

        await testPage.close();

        console.log('\n✅ Vercel部署流程完成！');
        console.log('\n📊 生成的文件：');
        console.log('- vercel-page.png (项目页面)');
        console.log('- vercel-deployed.png (部署后状态)');

        console.log('\n⏰ 浏览器将保持打开，您可以手动检查...');
        console.log('按Ctrl+C结束脚本');

        // 保持打开
        await new Promise(() => {});

    } catch (error) {
        console.error('\n❌ 发生错误:', error.message);
        await page.screenshot({ path: 'vercel-error-detail.png', fullPage: true });
        console.log('📸 错误截图: vercel-error-detail.png');
    }
}

deployToVercel().catch(console.error);
