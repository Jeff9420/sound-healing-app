#!/usr/bin/env node

/**
 * 音频文件清单生成器
 * 从 audio-config.js 生成可读的清单文件（JSON/CSV/Markdown）
 *
 * 使用方法：
 * node tools/generate-audio-manifest.js [format]
 *
 * 格式选项：json, csv, markdown (默认: json)
 */

const fs = require('fs');
const path = require('path');

// 从配置文件导入（实际路径）
const configPath = path.join(__dirname, '../assets/js/audio-config.js');

// 读取配置文件
const configContent = fs.readFileSync(configPath, 'utf-8');

// 简单解析（提取 AUDIO_CONFIG 对象）
const AUDIO_CONFIG = eval(configContent.match(/const AUDIO_CONFIG = ({[\s\S]*?});/)[1]);

class ManifestGenerator {
    constructor() {
        this.manifest = [];
        this.stats = {
            totalCategories: 0,
            totalFiles: 0,
            categories: {}
        };
    }

    /**
     * 生成清单数据
     */
    generateData() {
        for (const [categoryName, category] of Object.entries(AUDIO_CONFIG.categories)) {
            this.stats.totalCategories++;
            this.stats.categories[categoryName] = category.files.length;
            this.stats.totalFiles += category.files.length;

            category.files.forEach((filename, index) => {
                const url = `${AUDIO_CONFIG.baseUrl}${category.folder}/${encodeURIComponent(filename)}`;

                this.manifest.push({
                    id: `${category.folder}-${index + 1}`,
                    category: categoryName,
                    folder: category.folder,
                    filename: filename,
                    url: url,
                    icon: category.icon || '🎵',
                    index: index + 1
                });
            });
        }

        return this.manifest;
    }

    /**
     * 导出为 JSON
     */
    exportJSON(outputPath = './audio-manifest.json') {
        const data = {
            generatedAt: new Date().toISOString(),
            baseUrl: AUDIO_CONFIG.baseUrl,
            stats: this.stats,
            files: this.manifest
        };

        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`✅ JSON 清单已生成: ${outputPath}`);
        return outputPath;
    }

    /**
     * 导出为 CSV
     */
    exportCSV(outputPath = './audio-manifest.csv') {
        const headers = ['ID', 'Category', 'Folder', 'Filename', 'URL', 'Icon', 'Index'];
        const rows = this.manifest.map(item => [
            item.id,
            item.category,
            item.folder,
            `"${item.filename}"`, // CSV 转义
            item.url,
            item.icon,
            item.index
        ]);

        const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

        fs.writeFileSync(outputPath, csv, 'utf-8');
        console.log(`✅ CSV 清单已生成: ${outputPath}`);
        return outputPath;
    }

    /**
     * 导出为 Markdown
     */
    exportMarkdown(outputPath = './audio-manifest.md') {
        let md = `# 音频文件清单\n\n`;
        md += `**生成时间**: ${new Date().toLocaleString('zh-CN')}\n\n`;
        md += `**CDN 地址**: ${AUDIO_CONFIG.baseUrl}\n\n`;
        md += `## 📊 统计信息\n\n`;
        md += `- **总分类数**: ${this.stats.totalCategories}\n`;
        md += `- **总文件数**: ${this.stats.totalFiles}\n\n`;

        md += `### 各分类文件数\n\n`;
        for (const [category, count] of Object.entries(this.stats.categories)) {
            md += `- **${category}**: ${count} 个文件\n`;
        }

        md += `\n## 📁 文件列表\n\n`;

        let currentCategory = '';
        this.manifest.forEach(item => {
            if (item.category !== currentCategory) {
                currentCategory = item.category;
                md += `\n### ${item.icon} ${currentCategory}\n\n`;
                md += `| # | 文件名 | Archive.org 链接 |\n`;
                md += `|---|--------|------------------|\n`;
            }

            const shortUrl = item.url.length > 50
                ? item.url.substring(0, 47) + '...'
                : item.url;

            md += `| ${item.index} | ${item.filename} | [链接](${item.url}) |\n`;
        });

        md += `\n---\n\n`;
        md += `*此清单由 \`generate-audio-manifest.js\` 自动生成*\n`;

        fs.writeFileSync(outputPath, md, 'utf-8');
        console.log(`✅ Markdown 清单已生成: ${outputPath}`);
        return outputPath;
    }

    /**
     * 打印统计信息
     */
    printStats() {
        console.log('\n📊 音频文件统计:');
        console.log('='.repeat(50));
        console.log(`总分类数: ${this.stats.totalCategories}`);
        console.log(`总文件数: ${this.stats.totalFiles}`);
        console.log('\n各分类文件数:');

        for (const [category, count] of Object.entries(this.stats.categories)) {
            console.log(`  ${category.padEnd(25)} : ${count} 个`);
        }
        console.log('='.repeat(50));
    }
}

// CLI 执行
if (require.main === module) {
    const format = (process.argv[2] || 'json').toLowerCase();
    const generator = new ManifestGenerator();

    console.log('🎵 生成音频文件清单...\n');
    generator.generateData();
    generator.printStats();

    console.log('\n');

    switch (format) {
        case 'json':
            generator.exportJSON();
            break;
        case 'csv':
            generator.exportCSV();
            break;
        case 'markdown':
        case 'md':
            generator.exportMarkdown();
            break;
        case 'all':
            generator.exportJSON();
            generator.exportCSV();
            generator.exportMarkdown();
            break;
        default:
            console.error(`❌ 未知格式: ${format}`);
            console.log('支持的格式: json, csv, markdown, all');
            process.exit(1);
    }
}

module.exports = ManifestGenerator;
