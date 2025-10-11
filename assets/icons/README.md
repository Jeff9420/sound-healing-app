# PWA Icons - 图标说明

## ⚠️ 缺失的图标文件

此目录应包含以下PWA所需的图标文件，但当前**全部缺失**：

### 必需的图标尺寸：

1. ✅ **icon-72x72.png** (72x72px)
2. ✅ **icon-96x96.png** (96x96px)
3. ✅ **icon-128x128.png** (128x128px)
4. ✅ **icon-144x144.png** (144x144px)
5. ✅ **icon-152x152.png** (152x152px)
6. ✅ **icon-192x192.png** (192x192px) - 最重要，Android使用
7. ✅ **icon-384x384.png** (384x384px)
8. ✅ **icon-512x512.png** (512x512px) - 最重要，启动画面使用

### 快捷方式图标（可选但推荐）：

- **meditation-icon.png** (192x192px) - 冥想快捷方式图标
- **sleep-icon.png** (192x192px) - 睡眠音乐快捷方式图标
- **chakra-icon.png** (192x192px) - 脉轮疗愈快捷方式图标

## 🎨 设计建议

### 主图标设计要求：
- **背景色**: 深色背景 (#0d131f 或类似)
- **主色调**: 紫色/蓝色渐变 (#6666ff)
- **图案**: 声波、音符、莲花、冥想等疗愈元素
- **文字**: 可选包含 "SF" 或 "SoundFlows" 简写
- **风格**: 简洁、现代、专业

### Maskable图标要求：
- 192x192 和 512x512 需要支持 maskable
- 重要内容保持在安全区域内（中心80%）
- 四周留白至少10%，避免被裁切

## 🛠️ 快速生成图标

### 方法1: 使用在线工具
1. **PWA Asset Generator**: https://www.pwabuilder.com/imageGenerator
   - 上传一张1024x1024的logo
   - 自动生成所有尺寸

2. **RealFaviconGenerator**: https://realfavicongenerator.net/
   - 上传原图
   - 下载完整的图标包

### 方法2: 使用设计工具
- Figma/Photoshop/Illustrator 设计原图 (1024x1024)
- 导出所需的各个尺寸

### 方法3: 使用命令行工具
```bash
# 使用 ImageMagick 批量生成
convert source.png -resize 72x72 icon-72x72.png
convert source.png -resize 96x96 icon-96x96.png
convert source.png -resize 128x128 icon-128x128.png
convert source.png -resize 144x144 icon-144x144.png
convert source.png -resize 152x152 icon-152x152.png
convert source.png -resize 192x192 icon-192x192.png
convert source.png -resize 384x384 icon-384x384.png
convert source.png -resize 512x512 icon-512x512.png
```

## 📋 当前状态

- [x] Icons 目录已创建
- [ ] **所有图标文件缺失 - 需要添加！**
- [ ] manifest.json 中已配置图标路径
- [ ] 添加图标后需要测试PWA安装功能

## ⚡ 优先级

**HIGH PRIORITY**: 至少需要添加以下两个核心图标才能让PWA正常工作：
1. **icon-192x192.png** - Android主屏幕图标
2. **icon-512x512.png** - 启动画面和大尺寸显示

其他尺寸可以后续补充，但建议一次性全部添加以获得最佳体验。

## 🔗 相关文件

- `/manifest.json` - PWA配置文件（已配置图标路径）
- `/index.html` - HTML头部链接图标
- `/assets/icons/` - 图标存放目录（当前目录）

---

**下一步操作**: 请设计或获取SoundFlows的logo，然后使用上述方法之一生成所需的图标文件。
