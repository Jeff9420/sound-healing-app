const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertSvgToJpg() {
  const imagesDir = path.join(__dirname, 'assets', 'images');

  const conversions = [
    {
      input: path.join(imagesDir, 'og-image-template.svg'),
      output: path.join(imagesDir, 'og-image.jpg'),
      width: 1200,
      height: 630
    },
    {
      input: path.join(imagesDir, 'twitter-card-template.svg'),
      output: path.join(imagesDir, 'twitter-card.jpg'),
      width: 1200,
      height: 628
    }
  ];

  console.log('🔄 开始转换SVG到JPG...\n');

  for (const conversion of conversions) {
    try {
      console.log(`处理: ${path.basename(conversion.input)}`);

      await sharp(conversion.input)
        .resize(conversion.width, conversion.height)
        .jpeg({ quality: 90 })
        .toFile(conversion.output);

      const stats = fs.statSync(conversion.output);
      console.log(`✅ 成功: ${path.basename(conversion.output)} (${(stats.size / 1024).toFixed(2)} KB)\n`);
    } catch (error) {
      console.error(`❌ 失败: ${path.basename(conversion.input)}`);
      console.error(`错误: ${error.message}\n`);
    }
  }

  console.log('✅ 转换完成！');
  console.log(`\n生成的文件位于: ${imagesDir}`);
  console.log('- og-image.jpg (1200x630)');
  console.log('- twitter-card.jpg (1200x628)');
}

convertSvgToJpg().catch(console.error);
