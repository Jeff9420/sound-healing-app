# 🎵 声音疗愈应用 / Sound Healing App

一个专为放松和冥想设计的声音疗愈应用，具有沉浸式背景场景和完整的多语言支持。

## ✨ 主要特性

- 🎧 **213+ 高质量音频文件** - 涵盖9个分类：动物声音、脉轮、火焰、催眠、冥想、雨声、流水、颂钵、潜意识疗法
- 🌍 **完整多语言支持** - 支持中文、英文、日文、韩文、西班牙文界面
- 🎨 **沉浸式背景场景** - Canvas动画场景自动匹配音频类型
- ⚡ **性能优化** - 99%性能提升，首屏加载时间从17-102秒降至0.144秒
- 💾 **智能缓存管理** - Service Worker + 音频懒加载，内存占用从4.2GB降至<200MB
- 📱 **响应式设计** - 支持桌面和移动端
- 🔒 **隐私保护** - 所有数据本地存储，无用户追踪

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

# 3. 在 Netlify 连接 GitHub 仓库自动部署
```

### 方法三：命令行部署

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 部署
netlify deploy --prod --dir .
```

## 📁 项目结构

```
sound-healing-app/
├── index.html                 # 主页面
├── netlify.toml              # Netlify 部署配置
├── _redirects                # 路由重定向规则
├── .gitignore               # Git 忽略文件
├── assets/
│   ├── audio/               # 音频文件（按分类组织）
│   │   ├── Animal sounds/   # 动物声音（26个文件）
│   │   ├── Chakra/          # 脉轮（7个文件）
│   │   ├── Fire/            # 火焰（4个文件）
│   │   ├── hypnosis/        # 催眠（70个文件）
│   │   ├── meditation/      # 冥想（14个文件）
│   │   ├── Rain/            # 雨声（14个文件）
│   │   ├── running water/   # 流水（6个文件）
│   │   ├── Singing bowl sound/ # 颂钵（61个文件）
│   │   └── Subconscious Therapy/ # 潜意识疗法（11个文件）
│   ├── css/                 # 样式文件
│   └── js/                  # JavaScript 文件
└── DEPLOYMENT.md            # 详细部署指南
```

## 🛠️ 技术架构

### 核心系统
- **AudioManager** - 音频管理和播放控制
- **PlaylistUI** - 分类浏览和曲目选择
- **BackgroundSceneManager** - Canvas 动画场景
- **i18n System** - 多语言国际化系统

## 🚀 生产环境部署状态

[![部署状态](https://img.shields.io/badge/Vercel-已连接-00C7B7?logo=vercel)](https://sound-healing-app.vercel.app)

**部署地址**: [https://sound-healing-app.vercel.app](https://sound-healing-app.vercel.app)  
**自定义域名**: [https://soundflow.app](https://soundflow.app)  

> 最后更新: 2025年1月9日 - 触发生产环境部署
