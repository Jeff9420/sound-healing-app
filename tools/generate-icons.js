/**
 * PWA图标生成脚本
 * 使用 Canvas 生成所有缺失的PWA图标
 */

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// 需要生成的图标尺寸
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// 输出目录
const outputDir = path.join(__dirname, '../assets/icons');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * 生成单个图标
 */
function generateIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // 背景渐变
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#6666ff');
    gradient.addColorStop(1, '#4444cc');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // 绘制声波图案
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = size / 40;
    ctx.lineCap = 'round';

    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const amplitude = size / 8;
        const frequency = 0.05;
        const yOffset = size / 2 + (i - 2) * (size / 10);

        for (let x = 0; x <= size; x += 2) {
            const y = yOffset + Math.sin(x * frequency + i) * amplitude;
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }

    // 中心圆形（代表声音源）
    const centerX = size / 2;
    const centerY = size / 2;
    const circleRadius = size / 8;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
    ctx.fill();

    // 添加文字（仅在较大尺寸）
    if (size >= 192) {
        ctx.fillStyle = '#6666ff';
        ctx.font = `bold ${size / 10}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SF', centerX, centerY);
    }

    return canvas;
}

/**
 * 保存图标为PNG文件
 */
function saveIcon(canvas, size) {
    const filename = `icon-${size}x${size}.png`;
    const filepath = path.join(outputDir, filename);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filepath, buffer);
    console.log(`✅ 生成: ${filename}`);
}

/**
 * 生成所有图标
 */
function generateAllIcons() {
    console.log('🎨 开始生成PWA图标...\n');

    sizes.forEach(size => {
        const canvas = generateIcon(size);
        saveIcon(canvas, size);
    });

    // 额外生成 favicon.png 和 android-chrome-192x192.png
    const favicon32 = generateIcon(32);
    fs.writeFileSync(path.join(__dirname, '../favicon.png'), favicon32.toBuffer('image/png'));
    console.log('✅ 生成: favicon.png (32x32)');

    const androidChrome = generateIcon(192);
    fs.writeFileSync(path.join(__dirname, '../android-chrome-192x192.png'), androidChrome.toBuffer('image/png'));
    console.log('✅ 生成: android-chrome-192x192.png');

    console.log('\n✅ 所有图标生成完成！');
    console.log(`📁 PWA图标位置: ${outputDir}`);
    console.log('📁 根目录图标: favicon.png, android-chrome-192x192.png');
}

// 执行生成
try {
    generateAllIcons();
} catch (error) {
    console.error('❌ 生成图标失败:', error.message);
    console.log('\n💡 提示: 请先安装 canvas 包:');
    console.log('   npm install canvas');
    process.exit(1);
}
