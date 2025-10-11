#!/usr/bin/env node

/**
 * Archive.org 音频备份工具
 * 从 Archive.org 下载所有音频文件到本地备份
 *
 * 使用方法：
 * node tools/backup-audio-from-archive.js [output-directory]
 *
 * 示例：
 * node tools/backup-audio-from-archive.js ./audio-backup
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 从配置文件导入
const AUDIO_CONFIG = {
    baseUrl: 'https://archive.org/download/sound-healing-collection/',
    categories: {
        'Animal sounds': {
            folder: 'animal-sounds',
            files: [
                'SPA音乐疗馆 1 - 减压疗程 The Curing Shop - For Decompression.mp3',
                'SPA音乐疗馆 4 - 冥想疗程 The Curing Shop - For Meditation.mp3',
                '【大自然韵律】鸟儿欢快的鸣叫.mp3',
                '【沉浸】鸟语花香，流年岁月.mp3',
                '【海鸥】超自然睡眠版.mp3',
                '动物叫声 空旷山谷里的杜鹃.mp3',
                '喜鹊叫声、犬吠、 布谷鸟交织在一起的华丽乐章.mp3',
                '天然大森里的动物欢叫声音.mp3',
                '天空上非常空灵的鸟叫，不知道什么名字.mp3',
                '天籁之音，清脆的鸟鸣【放松减压】.mp3',
                '山间清澈的小溪声音伴着清脆的鸟叫（上）.mp3',
                '山间清澈的小溪声音伴着清脆的鸟叫（下）.mp3',
                '山间清澈的小溪声音伴着清脆的鸟叫（中）.mp3',
                '枕着鸟儿的欢叫、母鸡的悠闲睡眠.mp3',
                '森林里百灵鸟鸣叫.mp3',
                '歌唱的小鸟 减压静心 配舒缓音乐（上）.mp3',
                '歌唱的小鸟 减压静心 配舒缓音乐（下）.mp3',
                '歌唱的小鸟 减压静心 配舒缓音乐（中）.mp3',
                '气场修补：钵声.敲与磨.潺潺流水.鸟鸣.mp3',
                '河边点燃篝火、水声和清脆的鸟鸣01.mp3',
                '河边点燃篝火、水声和清脆的鸟鸣02.mp3',
                '河边点燃篝火、水声和清脆的鸟鸣03.mp3',
                '海鸥的叫声，海浪的声音（上）.mp3',
                '海鸥的叫声，海浪的声音（下）.mp3',
                '蜜蜂与小鸟对唱.mp3',
                '非常难得的清脆鸟叫，深山里录制.mp3'
            ]
        },
        // ... 其他分类（这里简化，实际使用时导入完整配置）
    }
};

class AudioBackup {
    constructor(outputDir = './audio-backup') {
        this.outputDir = outputDir;
        this.stats = {
            total: 0,
            downloaded: 0,
            failed: 0,
            skipped: 0
        };
    }

    /**
     * 下载单个文件
     */
    downloadFile(url, outputPath) {
        return new Promise((resolve, reject) => {
            // 检查文件是否已存在
            if (fs.existsSync(outputPath)) {
                console.log(`⏭️  跳过已存在: ${path.basename(outputPath)}`);
                this.stats.skipped++;
                return resolve();
            }

            const file = fs.createWriteStream(outputPath);

            https.get(url, (response) => {
                if (response.statusCode === 200) {
                    response.pipe(file);

                    file.on('finish', () => {
                        file.close();
                        console.log(`✅ 下载成功: ${path.basename(outputPath)}`);
                        this.stats.downloaded++;
                        resolve();
                    });
                } else {
                    fs.unlink(outputPath, () => {});
                    console.error(`❌ 下载失败: ${url} (状态码: ${response.statusCode})`);
                    this.stats.failed++;
                    reject(new Error(`HTTP ${response.statusCode}`));
                }
            }).on('error', (err) => {
                fs.unlink(outputPath, () => {});
                console.error(`❌ 下载失败: ${url} (${err.message})`);
                this.stats.failed++;
                reject(err);
            });
        });
    }

    /**
     * 备份所有音频
     */
    async backupAll() {
        console.log('🎵 开始备份 Archive.org 音频文件...\n');

        // 创建输出目录
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }

        // 遍历所有分类
        for (const [categoryName, category] of Object.entries(AUDIO_CONFIG.categories)) {
            console.log(`\n📁 分类: ${categoryName} (${category.files.length} 个文件)`);

            // 创建分类文件夹
            const categoryDir = path.join(this.outputDir, category.folder);
            if (!fs.existsSync(categoryDir)) {
                fs.mkdirSync(categoryDir, { recursive: true });
            }

            this.stats.total += category.files.length;

            // 下载该分类的所有文件
            for (const filename of category.files) {
                const url = `${AUDIO_CONFIG.baseUrl}${category.folder}/${encodeURIComponent(filename)}`;
                const outputPath = path.join(categoryDir, filename);

                try {
                    await this.downloadFile(url, outputPath);
                    // 延迟避免请求过快
                    await new Promise(resolve => setTimeout(resolve, 200));
                } catch (err) {
                    // 错误已在 downloadFile 中记录
                }
            }
        }

        this.printStats();
    }

    /**
     * 打印统计信息
     */
    printStats() {
        console.log('\n' + '='.repeat(50));
        console.log('📊 备份统计:');
        console.log(`总文件数: ${this.stats.total}`);
        console.log(`✅ 成功下载: ${this.stats.downloaded}`);
        console.log(`⏭️  已跳过: ${this.stats.skipped}`);
        console.log(`❌ 失败: ${this.stats.failed}`);
        console.log('='.repeat(50));

        if (this.stats.failed > 0) {
            console.log('\n⚠️  部分文件下载失败，请检查网络连接或稍后重试');
        } else if (this.stats.downloaded > 0) {
            console.log('\n🎉 备份完成！');
        } else {
            console.log('\n✨ 所有文件已存在，无需重新下载');
        }
    }

    /**
     * 验证备份完整性
     */
    verifyBackup() {
        console.log('\n🔍 验证备份完整性...\n');

        const missing = [];

        for (const [categoryName, category] of Object.entries(AUDIO_CONFIG.categories)) {
            const categoryDir = path.join(this.outputDir, category.folder);

            for (const filename of category.files) {
                const filePath = path.join(categoryDir, filename);
                if (!fs.existsSync(filePath)) {
                    missing.push(`${categoryName}/${filename}`);
                }
            }
        }

        if (missing.length === 0) {
            console.log('✅ 所有文件完整，备份验证通过！');
        } else {
            console.log(`❌ 缺少 ${missing.length} 个文件:`);
            missing.forEach(file => console.log(`  - ${file}`));
        }

        return missing.length === 0;
    }
}

// CLI 执行
if (require.main === module) {
    const outputDir = process.argv[2] || './audio-backup';
    const backup = new AudioBackup(outputDir);

    backup.backupAll().then(() => {
        setTimeout(() => {
            backup.verifyBackup();
        }, 1000);
    }).catch(err => {
        console.error('备份过程出错:', err);
        process.exit(1);
    });
}

module.exports = AudioBackup;
