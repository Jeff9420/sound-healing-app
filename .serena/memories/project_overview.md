# 声音疗愈项目概览

## 项目目的
这是一个**声音疗愈 (Sound Healing)** Web应用程序 - 一个具有沉浸式背景场景和播放列表功能的本地音频播放器。应用程序拥有213+音频文件，涵盖9个类别，具备全屏动画背景，会根据播放的音频类型自动匹配。

## 技术栈
- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **音频**: Web Audio API, HTML5 Audio
- **图形**: Canvas API (用于动画背景场景)
- **部署**: Vercel + GitHub自动部署
- **版本控制**: Git
- **配置**: JSON配置文件系统

## 核心特性
1. **3层音频架构**:
   - AudioManager: 核心音频管理
   - PlaylistUI: 分类浏览和曲目选择界面
   - BackgroundSceneManager: 基于Canvas的动画场景，根据音频分类自动切换

2. **音频分类**:
   - Animal sounds (26文件)
   - Chakra (7文件)
   - Fire (4文件)
   - Hypnosis (70文件)
   - Meditation (14文件)
   - Rain (14文件)
   - Running water (6文件)
   - Singing bowl sound (61文件)
   - Subconscious Therapy (11文件)

3. **智能功能**:
   - 自动播放列表模式
   - 格式兼容性检测
   - 内存和性能监控
   - 睡眠定时器
   - 主题管理（深色/浅色）

## 部署状态
- **生产环境**: https://soundflows.app
- **部署方式**: GitHub → Vercel自动集成
- **域名**: 已配置自定义域名 soundflows.app
- **HTTPS**: 必需，用于音频文件的完整功能支持