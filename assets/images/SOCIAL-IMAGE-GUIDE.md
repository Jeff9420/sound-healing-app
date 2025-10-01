# 社交媒体分享图片创建指南

## 📐 图片规格

### Open Graph (Facebook/LinkedIn)
- **文件名**: `og-image.jpg`
- **尺寸**: 1200 x 630 像素
- **格式**: JPG
- **文件大小**: 建议 < 300 KB

### Twitter Card
- **文件名**: `twitter-card.jpg`
- **尺寸**: 1200 x 628 像素
- **格式**: JPG
- **文件大小**: 建议 < 300 KB

## 🎨 设计要素

### 配色方案（与网站主题一致）
- **背景渐变**: #1a1a2e → #16213e → #0f3460
- **主色调**: #e94560（红色/粉色）
- **辅助色**: #a8dadc（浅蓝色）
- **文字色**: #ffffff（白色）

### 内容元素
1. **图标**: 🎵 音符图标（大号，居中上方）
2. **中文标题**: "声音疗愈空间"（大字号，加粗）
3. **英文标题**: "Sound Healing Space"（中等字号）
4. **核心卖点**: "213+ 免费疗愈音频"（醒目徽章样式）
5. **功能特点**: "冥想 · 自然音效 · 颂钵音疗 · 脉轮疗愈 · 催眠引导"
6. **域名**: "soundflows.app"（底部）

## 🛠️ 创建方法

### 方法1：在线SVG转JPG工具
1. 使用提供的SVG模板文件：
   - `og-image-template.svg`
   - `twitter-card-template.svg`

2. 推荐在线工具：
   - CloudConvert (https://cloudconvert.com/svg-to-jpg)
   - Online-Convert (https://www.online-convert.com/)
   - Convertio (https://convertio.co/svg-jpg/)

3. 转换设置：
   - 质量：85-90%
   - 保持原始尺寸
   - 输出格式：JPG

### 方法2：使用Canva（推荐）
1. 访问 https://www.canva.com
2. 创建自定义尺寸：
   - OG: 1200 x 630 px
   - Twitter: 1200 x 628 px
3. 使用上述配色方案和设计元素
4. 导出为JPG格式

### 方法3：使用Figma/Photoshop
1. 创建新文档（使用上述尺寸）
2. 参照SVG模板的布局和样式
3. 导出为JPG（质量85-90%）

## ✅ 质量检查清单

- [ ] 图片尺寸完全符合规格
- [ ] 文字清晰可读（即使缩略图模式）
- [ ] 品牌色彩一致
- [ ] 文件大小 < 300 KB
- [ ] 核心信息在安全区域内（避免被裁剪）
- [ ] 在移动设备上预览效果

## 📍 文件放置位置

创建完成后，将图片放置在：
```
assets/images/
├── og-image.jpg          (1200x630)
└── twitter-card.jpg      (1200x628)
```

## 🧪 测试验证

创建完成后，使用以下工具验证：

1. **Facebook分享调试器**
   https://developers.facebook.com/tools/debug/

2. **Twitter Card验证器**
   https://cards-dev.twitter.com/validator

3. **LinkedIn Post Inspector**
   https://www.linkedin.com/post-inspector/

## 💡 优化建议

- 确保图片在深色和浅色背景下都清晰可见
- 测试在移动设备上的显示效果
- 保持品牌一致性
- 定期更新图片以反映最新功能
