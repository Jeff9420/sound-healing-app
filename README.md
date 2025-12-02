# 🎵 声音疗愈应用 / Sound Healing App

一个专为放松和冥想设计的现代化声音疗愈Web应用，具有沉浸式视频背景和完整的多语言支持。

## ✨ 主要特性

- 🎧 **213+ 高质量音频文件** - 涵盖9个分类：动物声音、脉轮、火焰、催眠、冥想、雨声、流水、颂钵、潜意识疗法
- 🌍 **5种语言支持** - 中文、英文、日文、韩文、西班牙文完整界面翻译
- 🎬 **动态视频背景** - 9个4K视频背景自动匹配音频类型（Cloudflare R2 CDN加速）
- 🎨 **智能降级系统** - 视频加载失败时自动切换到Canvas动画
- 📱 **PWA支持** - 可安装到桌面，支持离线缓存
- 🎯 **性能优化** - 首屏加载时间<1秒，内存使用<200MB
- 🔒 **100%隐私保护** - 无用户追踪，所有数据本地存储

## 🏗️ 技术栈

- **前端**: HTML5 + CSS3 + Vanilla JavaScript (ES2022)
- **托管**: Vercel (静态站点托管)
- **音频**: Internet Archive (永久存储)
- **视频**: Cloudflare R2 CDN (全球加速)
- **CI/CD**: GitHub → Vercel 自动部署

## 🌐 基础设施

| 组件 | 平台 | URL |
|------|------|-----|
| **主站点** | Vercel | https://soundflows.app |
| **音频文件** | Internet Archive | https://archive.org/download/sound-healing-collection/ |
| **视频文件** | Cloudflare R2 | https://media.soundflows.app/ |
| **代码仓库** | GitHub | https://github.com/Jeff9420/sound-healing-app |

## 🚀 部署说明

### 当前部署状态
- ✅ **生产环境**: [soundflows.app](https://soundflows.app)
- ✅ **版本**: v3.0.0 (企业级现代Web应用)
- ✅ **自动部署**: GitHub集成，推送即部署

### 本地开发

```bash
# 1. 克隆仓库
git clone https://github.com/Jeff9420/sound-healing-app.git
cd sound-healing-app

# 2. 本地服务器（可选）
python -m http.server 8000
# 或使用 Node.js
npx serve .

# 3. 访问 http://localhost:8000
```

### 项目结构

```
sound-healing-app/
├── index.html              # 主页面
├── assets/                 # 静态资源
│   ├── css/               # 样式文件
│   ├── js/                # JavaScript模块
│   │   ├── audio-manager.js
│   │   ├── video-background-manager.js
│   │   ├── i18n-system.js
│   │   └── ...
│   ├── icons/             # PWA图标
│   └── images/            # 图片资源
├── docs/                  # 文档
├── sw.js                  # Service Worker
├── manifest.json          # PWA配置
└── vercel.json           # Vercel配置
```

## 📚 文档

- **[技术架构](./ARCHITECTURE.md)** - 详细的系统架构说明
- **[配置指南](./PROJECT-CONFIG.md)** - 音频/视频配置说明
- **[开发文档](./CLAUDE.md)** - 开发者指南
- **[部署指南](./DEPLOYMENT.md)** - 部署说明

## 🎵 音频分类

| 分类 | 文件数 | 场景 |
|------|--------|------|
| 森林栖息地 (Animal sounds) | 26 | 森林鸟鸣 |
| 脉轮能量 (Chakra) | 7 | 能量粒子 |
| 温暖壁炉 (Fire) | 4 | 篝火火焰 |
| 梦境花园 (hypnosis) | 70 | 宇宙星空 |
| 禅境山谷 (meditation) | 14 | 禅意竹林 |
| 雨林圣地 (Rain) | 14 | 雨滴涟漪 |
| 溪流秘境 (running water) | 6 | 流水潺潺 |
| 颂钵圣殿 (Singing bowl) | 61 | 金色寺庙 |
| 潜识星域 (Subconscious) | 11 | 梦境云海 |

## 🎬 视频背景

每个音频分类都配有专属的4K视频背景：
- 自动检测用户网络环境
- 智能选择合适分辨率
- 优雅的淡入淡出切换
- 加载失败时自动降级到Canvas动画

## 🌍 国际化

完整支持5种语言：
- 🇺🇸 English (默认)
- 🇨🇳 简体中文
- 🇯🇵 日本語
- 🇰🇷 한국어
- 🇪🇸 Español

## 🔧 浏览器支持

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ 移动端浏览器

## 📊 性能指标

- **首屏加载**: < 1秒
- **内存占用**: < 200MB
- **Lighthouse评分**: 95+
- **离线支持**: ✅
- **SEO优化**: ✅

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- 音频文件来源于 Internet Archive
- 视频素材由团队自制
- 感谢所有开源贡献者

---

**维护者**: Sound Healing Team
**最后更新**: 2025年11月21日
**部署状态**: ✅ 生产环境运行中
# Cache fix deployment
