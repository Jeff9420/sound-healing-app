# 声音疗愈空间 - SoundFlows

> 🎵 **专业的声音疗愈平台** | 213+疗愈音频 | 9种动态背景 | 5种语言支持

[![Live Site](https://img.shields.io/badge/🌐-Online-success)](https://soundflows.app)
[![Version](https://img.shields.io/badge/version-3.0.0-blue)](https://github.com/Jeff9420/sound-healing-app)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## ✨ 核心功能

- 🎵 **213+ 专业疗愈音频** - 冥想、雨声、颂钵、催眠等9大分类
- 🎬 **动态视频背景** - 9种场景自动切换，支持Canvas降级
- 🌍 **5种语言支持** - 中文、英文、日文、韩文、西班牙文
- 🔐 **多种登录方式** - Google、邮箱、匿名登录
- 📧 **智能邮件系统** - 欢迎邮件、每日提醒、周报（Formspree集成）
- 📊 **使用统计** - 播放历史、收藏、进度追踪
- 🌙 **睡眠定时器** - 5-60分钟自动停止
- 🎚️ **音频混音台** - 混合多种音频创建个性化体验
- 📱 **PWA支持** - 离线缓存、原生应用体验

## 🛠 技术栈

### 前端
- **原生JavaScript** (ES2022) - 无框架依赖，极致性能
- **HTML5/CSS3** - 语义化标签、响应式设计、CSS动画
- **Web Audio API** - 专业音频处理
- **Canvas API** - 动态背景生成
- **Service Worker** - PWA离线支持

### 后端服务
- **Firebase Authentication** - 用户认证
- **Formspree** - 邮件服务 (50封/月免费)
- **Google Analytics 4** - 数据分析
- **Amplitude** - 用户行为追踪
- **Microsoft Clarity** - 会话录制

### 托管和CDN
- **Vercel** - 主应用托管 (全球CDN)
- **Internet Archive** - 音频文件存储
- **Cloudflare R2** - 视频资源CDN

## 🚀 快速开始

### 本地开发
```bash
# 克隆仓库
git clone https://github.com/Jeff9420/sound-healing-app.git
cd sound-healing-app

# 启动本地服务器
python -m http.server 8000

# 或使用Node.js
npx serve .

# 访问
open http://localhost:8000
```

### 配置
1. 复制环境变量模板
```bash
cp .env.example .env.local
```

2. 配置Firebase
   - 访问 [Firebase Console](https://console.firebase.google.com)
   - 创建新项目
   - 启用Authentication
   - 复制配置到 `.env.local`

3. 配置Formspree（可选）
   - 访问 [Formspree](https://formspree.io)
   - 创建表单获取Form ID
   - 设置到 `quick-formspree-config.js`

## 📁 项目结构

```
声音疗愈/
├── 📁 assets/
│   ├── 📁 css/          # 样式文件
│   ├── 📁 js/           # JavaScript模块
│   │   ├── audio-manager.js
│   │   ├── video-background-manager.js
│   │   ├── firebase-auth-ui.js
│   │   ├── email-integration-handler.js
│   │   └── ...
│   ├── 📁 images/       # 图片资源
│   └── 📁 icons/        # 应用图标
├── 📁 docs/             # 项目文档
│   ├── PROJECT_DOCUMENTATION.md
│   ├── TECHNICAL_ARCHITECTURE.md
│   └── API_AND_CONFIG.md
├── 📄 index.html        # 主页面
├── 📄 manifest.json     # PWA配置
├── 📄 vercel.json       # Vercel配置
└── 📄 README.md         # 项目说明
```

## 🔧 核心模块

### AudioManager (音频管理)
```javascript
// 播放音频
await audioManager.playTrack(trackId, category, fileName);

// 控制播放
audioManager.pause();
audioManager.stop();
audioManager.setVolume(0.7);
```

### VideoBackgroundManager (视频背景)
```javascript
// 切换背景
videoBackgroundManager.changeBackground('meditation');

// 设置播放模式
videoBackgroundManager.setMode('video'); // or 'canvas'
```

### EmailIntegrationHandler (邮件系统)
```javascript
// 触发欢迎邮件
document.dispatchEvent(new CustomEvent('userRegistered', {
    detail: { email, displayName, language }
}));

// 触发每日提醒
document.dispatchEvent(new CustomEvent('dailyReminderTriggered', {
    detail: { email, userName, streakDays }
}));
```

## 🌐 部署

### Vercel部署 (推荐)
```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel --prod

# 或通过GitHub自动部署
git push origin main
```

### 自定义域名
1. 在Vercel控制台添加域名
2. 配置DNS记录
3. 自动SSL证书

## 📊 性能指标

- **首屏加载**: < 2秒
- **LCP**: < 2.5秒
- **FID**: < 100ms
- **CLS**: < 0.1
- **Bundle大小**: < 500KB
- **缓存命中率**: > 80%

## 🔍 SEO优化

- ✅ 语义化HTML5结构
- ✅ 完整Meta标签
- ✅ 结构化数据 (JSON-LD)
- ✅ 多语言hreflang
- ✅ Sitemap自动生成
- ✅ Core Web Vitals优化
- ✅ 图片Alt标签
- ✅ 内部链接优化

## 🌍 国际化

支持语言：
- 🇨🇳 简体中文 (zh-CN)
- 🇺🇸 English (en-US)
- 🇯🇵 日本語 (ja-JP)
- 🇰🇷 한국어 (ko-KR)
- 🇪🇸 Español (es-ES)

## 📧 邮件系统

使用Formspree实现：
- **欢迎邮件** - 用户注册时自动发送
- **密码重置** - 包含安全重置链接
- **每日提醒** - 冥想练习提醒
- **周报** - 使用统计和成就

配置：
```javascript
localStorage.setItem('formspreeFormId', 'your-form-id');
```

## 📈 分析和监控

### 集成工具
- Google Analytics 4 - 用户行为分析
- Amplitude - 产品分析和用户旅程
- Microsoft Clarity - 热图和会话录制

### 关键指标
- 日活跃用户 (DAU)
- 音频播放次数
- 平均会话时长
- 用户留存率
- 转化率

## 🔒 安全措施

- CSP内容安全策略
- HTTPS强制加密
- XSS防护
- 输入验证
- JWT认证
- GDPR/CCPA合规

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 📝 更新日志

### v3.0.0 (2025-01-24)
- ✨ 完成Formspree邮件系统集成
- 🎧 新增213+疗愈音频
- 🎬 添加9种动态视频背景
- 🌍 支持5种语言
- 📱 PWA功能完善
- 📊 用户统计系统
- 🎚️ 音频混音台功能

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- Internet Archive - 音频文件托管
- Vercel - 免费托管服务
- Firebase - 认证服务
- Formspree - 邮件服务
- 所有开源贡献者

## 📞 联系方式

- 🌐 [官方网站](https://soundflows.app)
- 📧 support@soundflows.app
- 🐛 [问题反馈](https://github.com/Jeff9420/sound-healing-app/issues)

---

<div align="center">
  <p>🌟 如果这个项目对您有帮助，请给个Star！</p>
  <p>Made with ❤️ by Sound Healing Team</p>
</div>