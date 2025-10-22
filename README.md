# 🎵 声音疗愈应用 / Sound Healing App

一个专为放松和冥想设计的声音疗愈应用，具有沉浸式背景场景和完整的多语言支持。

## ✨ 主要特性

- 🎧 **213+ 高质量音频文件** - 涵盖9个分类：动物声音、脉轮、火焰、催眠、冥想、雨声、流水、颂钵、潜意识疗法
- 🌍 **完整多语言支持** - 支持中文、英文、日文、韩文、西班牙文界面
- 🎬 **动态视频背景** - 9个高质量视频背景自动匹配音频类型（Cloudflare R2 CDN）
- 🎨 **Canvas降级方案** - 智能降级到Canvas动画当视频无法加载
- ⚡ **性能优化** - 99%性能提升，首屏加载时间从17-102秒降至0.144秒
- 💾 **智能缓存管理** - Service Worker + 音频懒加载，内存占用从4.2GB降至<200MB
- 📱 **响应式设计** - 支持桌面和移动端
- 🔒 **隐私保护** - 所有数据本地存储，无用户追踪

## 🏗️ 技术架构

### 资源托管配置
- **音频文件**: Internet Archive (archive.org) - 稳定的长期存储
- **视频文件**: Cloudflare R2 CDN (media.soundflows.app) - 全球加速
- **前端部署**: Vercel - 自动CI/CD

## 🚀 快速部署

### 方法一：Netlify 拖拽部署（推荐）

1. 访问 [Netlify](https://netlify.com)
2. 注册/登录账户
3. 直接拖拽整个 `sound-healing-app` 文件夹到部署区域
4. 等待部署完成（约2-3分钟）
5. 获取 HTTPS 域名

### 方法二：Git 部署

```bash
# 1. 初始化 Git 仓库
git init
git add .
git commit -m "Initial deployment"

# 2. 推送到 GitHub
git remote add origin https://github.com/yourusername/sound-healing-app.git
git push -u origin main
```

## 🌐 现已部署

✅ **生产环境**: [soundflows.app](https://soundflows.app)
✅ **备用域名**: [www.soundflows.app](https://www.soundflows.app)

---

*🎵 Deployed with Claude Code and Vercel*
