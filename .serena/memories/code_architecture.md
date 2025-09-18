# 声音疗愈项目代码架构

## 核心架构模式

### 3层音频系统架构
1. **AudioManager** (`assets/js/audio-manager.js`)
   - 核心音频管理和格式检测
   - 播放列表控制和浏览器兼容性处理
   - 主要方法: `playTrack()`, `playPlaylist()`, `seekTo()`

2. **PlaylistUI** (`assets/js/playlist-ui.js`)
   - 分类浏览和曲目选择界面
   - 与AudioManager协作进行音频控制

3. **BackgroundSceneManager** (`assets/js/background-scene-manager.js`)
   - 基于Canvas的动画场景
   - 根据音频分类自动切换背景效果

### 配置系统
- **`assets/js/audio-config.js`**: 中央配置文件，映射音频分类到实际文件
- 音频文件按分类文件夹组织，每个文件夹代表一个播放列表
- 配置从实际文件系统结构自动生成

### 关键组件
- **App Controller** (`assets/js/app.js`): 主应用程序协调器
- **UI Controller** (`assets/js/ui-controller.js`): 全局控制和音量管理
- **Theme Manager** (`assets/js/theme-manager.js`): 深色/浅色主题切换
- **Performance Monitor** (`assets/js/performance-monitor.js`): 内存和性能跟踪
- **Sleep Timer** (`assets/js/sleep-timer.js`): 自动停止功能

## 文件结构
```
project/
├── index.html                 # 主页面(3D播放列表)
├── assets/
│   ├── js/                   # JavaScript模块
│   │   ├── app.js           # 主应用控制器
│   │   ├── audio-manager.js # 音频管理核心
│   │   ├── playlist-ui.js   # 播放列表界面
│   │   ├── background-scene-manager.js # 背景场景
│   │   └── audio-config.js  # 音频配置
│   └── css/                 # 样式文件
├── vercel.json              # Vercel部署配置
├── CLAUDE.md               # Claude Code项目指南
└── DEPLOYMENT.md           # 部署指南
```

## 设计模式
- **模块化架构**: 每个功能独立的JavaScript模块
- **事件驱动**: 组件间通过事件通信
- **观察者模式**: AudioManager发出分类变化事件，BackgroundSceneManager监听
- **工厂模式**: 音频实例创建和管理
- **单例模式**: 核心管理器类(AudioManager, ThemeManager等)

## 浏览器兼容性策略
- 格式优先级: MP3 (通用) > WAV > OGG > WMA
- AudioManager自动检测支持的格式
- 优雅降级处理不支持的格式
- 内存泄漏防护通过音频实例重用