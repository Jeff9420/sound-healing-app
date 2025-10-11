#!/usr/bin/env node

/**
 * Archive.org 链接验证工具
 * 验证所有音频链接的可用性
 *
 * 使用方法：
 * node tools/verify-archive-links.js [--verbose]
 *
 * 选项：
 * --verbose  显示详细信息（每个文件的状态）
 */

const https = require('https');
const path = require('path');
const fs = require('fs');

// 从配置文件导入
const configPath = path.join(__dirname, '../assets/js/audio-config.js');
const configContent = fs.readFileSync(configPath, 'utf-8');
const AUDIO_CONFIG = eval(configContent.match(/const AUDIO_CONFIG = ({[\s\S]*?});/)[1]);

class LinkValidator {
    constructor(verbose = false) {
        this.verbose = verbose;
        this.stats = {
            total: 0,
            valid: 0,
            invalid: 0,
            timeout: 0
        };
        this.invalidLinks = [];
    }

    /**
     * 检查单个链接
     */
    checkLink(url) {
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                this.stats.timeout++;
                resolve({ valid: false, status: 'timeout' });
            }, 10000); // 10秒超时

            https.get(url, { method: 'HEAD' }, (response) => {
                clearTimeout(timeout);

                const valid = response.statusCode === 200;
                if (valid) {
                    this.stats.valid++;
                } else {
                    this.stats.invalid++;
                    this.invalidLinks.push({
                        url,
                        status: response.statusCode
                    });
                }

                resolve({
                    valid,
                    status: response.statusCode
                });
            }).on('error', (err) => {
                clearTimeout(timeout);
                this.stats.invalid++;
                this.invalidLinks.push({
                    url,
                    error: err.message
                });

                resolve({
                    valid: false,
                    error: err.message
                });
            });
        });
    }

    /**
     * 验证所有链接
     */
    async validateAll() {
        console.log('🔗 开始验证 Archive.org 链接...\n');

        for (const [categoryName, category] of Object.entries(AUDIO_CONFIG.categories)) {
            console.log(`\n📁 验证分类: ${categoryName} (${category.files.length} 个文件)`);

            this.stats.total += category.files.length;

            for (let i = 0; i < category.files.length; i++) {
                const filename = category.files[i];
                const url = `${AUDIO_CONFIG.baseUrl}${category.folder}/${encodeURIComponent(filename)}`;

                const result = await this.checkLink(url);

                if (this.verbose) {
                    const status = result.valid
                        ? `✅ ${result.status}`
                        : `❌ ${result.status || result.error}`;
                    console.log(`  [${i + 1}/${category.files.length}] ${status} - ${filename.substring(0, 50)}${filename.length > 50 ? '...' : ''}`);
                } else {
                    // 简洁模式：显示进度
                    process.stdout.write(`\r  进度: ${i + 1}/${category.files.length} 文件`);
                }

                // 延迟避免请求过快
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            if (!this.verbose) {
                console.log(' ✓');
            }
        }

        this.printReport();
    }

    /**
     * 打印验证报告
     */
    printReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 验证报告:');
        console.log('='.repeat(60));
        console.log(`总链接数: ${this.stats.total}`);
        console.log(`✅ 有效: ${this.stats.valid} (${(this.stats.valid / this.stats.total * 100).toFixed(1)}%)`);
        console.log(`❌ 无效: ${this.stats.invalid} (${(this.stats.invalid / this.stats.total * 100).toFixed(1)}%)`);
        console.log(`⏱️  超时: ${this.stats.timeout}`);
        console.log('='.repeat(60));

        if (this.invalidLinks.length > 0) {
            console.log('\n❌ 无效链接列表:');
            console.log('-'.repeat(60));

            this.invalidLinks.forEach((link, index) => {
                const status = link.status ? `HTTP ${link.status}` : link.error;
                const url = link.url.length > 80 ? link.url.substring(0, 77) + '...' : link.url;
                console.log(`${index + 1}. [${status}] ${url}`);
            });

            // 保存到文件
            const reportPath = path.join(__dirname, '../invalid-links-report.json');
            fs.writeFileSync(reportPath, JSON.stringify({
                generatedAt: new Date().toISOString(),
                stats: this.stats,
                invalidLinks: this.invalidLinks
            }, null, 2), 'utf-8');

            console.log(`\n📄 详细报告已保存到: ${reportPath}`);
        } else {
            console.log('\n🎉 所有链接都有效！');
        }
    }

    /**
     * 快速健康检查（采样验证）
     */
    async quickHealthCheck(sampleSize = 10) {
        console.log(`🏥 快速健康检查（采样 ${sampleSize} 个链接）...\n`);

        const allFiles = [];

        // 收集所有文件
        for (const [categoryName, category] of Object.entries(AUDIO_CONFIG.categories)) {
            category.files.forEach(filename => {
                allFiles.push({
                    category: categoryName,
                    folder: category.folder,
                    filename
                });
            });
        }

        // 随机采样
        const samples = [];
        for (let i = 0; i < Math.min(sampleSize, allFiles.length); i++) {
            const randomIndex = Math.floor(Math.random() * allFiles.length);
            samples.push(allFiles.splice(randomIndex, 1)[0]);
        }

        // 验证采样
        for (const sample of samples) {
            const url = `${AUDIO_CONFIG.baseUrl}${sample.folder}/${encodeURIComponent(sample.filename)}`;
            const result = await this.checkLink(url);

            const status = result.valid ? '✅' : '❌';
            console.log(`${status} [${sample.category}] ${sample.filename.substring(0, 60)}`);

            await new Promise(resolve => setTimeout(resolve, 200));
        }

        const healthScore = (this.stats.valid / samples.length * 100).toFixed(1);
        console.log(`\n📊 健康分数: ${healthScore}% (${this.stats.valid}/${samples.length})`);

        if (this.stats.valid === samples.length) {
            console.log('✅ 系统健康！');
        } else {
            console.log('⚠️  检测到问题，建议运行完整验证');
        }
    }
}

// CLI 执行
if (require.main === module) {
    const args = process.argv.slice(2);
    const verbose = args.includes('--verbose') || args.includes('-v');
    const quick = args.includes('--quick') || args.includes('-q');

    const validator = new LinkValidator(verbose);

    if (quick) {
        const sampleSize = parseInt(args.find(arg => !arg.startsWith('-'))) || 10;
        validator.quickHealthCheck(sampleSize);
    } else {
        validator.validateAll();
    }
}

module.exports = LinkValidator;
