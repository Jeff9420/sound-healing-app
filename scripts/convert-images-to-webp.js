/**
 * 图片转WebP格式优化脚本
 * 使用sharp库将JPG/PNG转换为WebP格式，减少文件大小
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
    inputDir: path.join(__dirname, '../assets/images'),
    outputDir: path.join(__dirname, '../assets/images/webp'),
    quality: 85, // WebP质量 (0-100)
    keepOriginal: true, // 是否保留原始文件
    extensions: ['.jpg', '.jpeg', '.png']
};

/**
 * 确保输出目录存在
 */
function ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ 创建输出目录: ${dir}`);
    }
}

/**
 * 获取文件大小（KB）
 */
function getFileSizeInKB(filePath) {
    const stats = fs.statSync(filePath);
    return (stats.size / 1024).toFixed(2);
}

/**
 * 转换单个图片为WebP
 */
async function convertToWebP(inputPath, outputPath) {
    try {
        const originalSize = getFileSizeInKB(inputPath);

        await sharp(inputPath)
            .webp({ quality: CONFIG.quality })
            .toFile(outputPath);

        const webpSize = getFileSizeInKB(outputPath);
        const savings = ((1 - webpSize / originalSize) * 100).toFixed(1);

        console.log(`  ✓ ${path.basename(inputPath)}`);
        console.log(`    原始: ${originalSize}KB → WebP: ${webpSize}KB (节省 ${savings}%)`);

        return {
            success: true,
            originalSize: parseFloat(originalSize),
            webpSize: parseFloat(webpSize),
            savings: parseFloat(savings)
        };
    } catch (error) {
        console.error(`  ✗ 转换失败: ${path.basename(inputPath)}`, error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 批量转换目录中的所有图片
 */
async function convertDirectory(inputDir, outputDir) {
    ensureDirectoryExists(outputDir);

    const files = fs.readdirSync(inputDir);
    const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return CONFIG.extensions.includes(ext);
    });

    if (imageFiles.length === 0) {
        console.log('⚠️  未找到需要转换的图片文件');
        return;
    }

    console.log(`\n🔄 开始转换 ${imageFiles.length} 个图片文件...\n`);

    const results = {
        total: imageFiles.length,
        success: 0,
        failed: 0,
        totalOriginalSize: 0,
        totalWebPSize: 0
    };

    for (const file of imageFiles) {
        const inputPath = path.join(inputDir, file);
        const outputFileName = path.basename(file, path.extname(file)) + '.webp';
        const outputPath = path.join(outputDir, outputFileName);

        const result = await convertToWebP(inputPath, outputPath);

        if (result.success) {
            results.success++;
            results.totalOriginalSize += result.originalSize;
            results.totalWebPSize += result.webpSize;
        } else {
            results.failed++;
        }
    }

    // 打印统计信息
    console.log('\n' + '='.repeat(60));
    console.log('📊 转换统计');
    console.log('='.repeat(60));
    console.log(`总文件数: ${results.total}`);
    console.log(`成功: ${results.success}`);
    console.log(`失败: ${results.failed}`);
    console.log(`原始总大小: ${results.totalOriginalSize.toFixed(2)} KB`);
    console.log(`WebP总大小: ${results.totalWebPSize.toFixed(2)} KB`);

    if (results.success > 0) {
        const totalSavings = ((1 - results.totalWebPSize / results.totalOriginalSize) * 100).toFixed(1);
        const savedKB = (results.totalOriginalSize - results.totalWebPSize).toFixed(2);
        console.log(`节省空间: ${savedKB} KB (${totalSavings}%)`);
    }
    console.log('='.repeat(60));

    // 生成HTML更新建议
    console.log('\n💡 使用建议:');
    console.log('在HTML中使用<picture>标签来提供WebP和回退格式:');
    console.log(`
<picture>
    <source srcset="assets/images/webp/your-image.webp" type="image/webp">
    <img src="assets/images/your-image.jpg" alt="描述">
</picture>
    `);
}

/**
 * 主函数
 */
async function main() {
    console.log('🎨 图片WebP转换工具');
    console.log('='.repeat(60));
    console.log(`输入目录: ${CONFIG.inputDir}`);
    console.log(`输出目录: ${CONFIG.outputDir}`);
    console.log(`WebP质量: ${CONFIG.quality}`);
    console.log(`保留原文件: ${CONFIG.keepOriginal ? '是' : '否'}`);

    if (!fs.existsSync(CONFIG.inputDir)) {
        console.error(`❌ 输入目录不存在: ${CONFIG.inputDir}`);
        process.exit(1);
    }

    try {
        await convertDirectory(CONFIG.inputDir, CONFIG.outputDir);
        console.log('\n✅ 转换完成！');
    } catch (error) {
        console.error('\n❌ 转换过程中出错:', error);
        process.exit(1);
    }
}

// 执行主函数
if (require.main === module) {
    main();
}

module.exports = { convertToWebP, convertDirectory };
