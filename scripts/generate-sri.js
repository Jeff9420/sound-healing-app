#!/usr/bin/env node
/**
 * SRI Hash Generator
 * 为外部资源生成 Subresource Integrity 哈希
 *
 * 使用方法：
 * node scripts/generate-sri.js
 */

const crypto = require('crypto');
const https = require('https');

// 需要生成SRI哈希的外部资源
const resources = [
    // Firebase SDK
    'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js',
    'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js',
    'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js',
    'https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js',
    'https://www.gstatic.com/firebasejs/9.22.1/firebase-analytics.js',

    // Google Analytics (注意：这个经常变化，不建议SRI)
    // 'https://www.googletagmanager.com/gtag/js?id=G-4NZR3HR3J1',
];

/**
 * 从URL下载内容并生成SRI哈希
 */
function generateSRI(url) {
    return new Promise((resolve, reject) => {
        console.log(`\n📥 正在下载: ${url}`);

        https.get(url, (response) => {
            const data = [];

            response.on('data', (chunk) => {
                data.push(chunk);
            });

            response.on('end', () => {
                const buffer = Buffer.concat(data);

                // 生成 SHA-384 哈希
                const hash = crypto.createHash('sha384');
                hash.update(buffer);
                const digest = hash.digest('base64');

                const sri = `sha384-${digest}`;

                console.log(`✅ 生成成功`);
                console.log(`   URL: ${url}`);
                console.log(`   SRI: ${sri}`);
                console.log(`\n   HTML:`);
                console.log(`   <script src="${url}"`);
                console.log(`           integrity="${sri}"`);
                console.log(`           crossorigin="anonymous"></script>`);

                resolve({ url, sri });
            });

        }).on('error', (error) => {
            console.error(`❌ 下载失败: ${url}`, error.message);
            reject(error);
        });
    });
}

// 主函数
async function main() {
    console.log('🔐 开始生成 SRI 哈希...\n');
    console.log('='.repeat(60));

    const results = [];

    for (const url of resources) {
        try {
            const result = await generateSRI(url);
            results.push(result);
        } catch (error) {
            console.error(`跳过: ${url}`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n📋 所有SRI哈希总结：\n');

    results.forEach(({ url, sri }) => {
        const fileName = url.split('/').pop().split('?')[0];
        console.log(`// ${fileName}`);
        console.log(`<script src="${url}"`);
        console.log(`        integrity="${sri}"`);
        console.log(`        crossorigin="anonymous"></script>\n`);
    });

    console.log('✨ 完成！请将上述代码添加到HTML文件中\n');
}

main();
