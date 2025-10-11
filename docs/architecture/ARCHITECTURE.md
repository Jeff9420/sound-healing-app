# 声音疗愈应用架构文档

## 项目概述

声音疗愈是一个基于Web技术的音频治疗应用，提供213+高质量音频文件，帮助用户放松、冥想和改善睡眠质量。

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **音频**: HTML5 Audio API, Web Audio API
- **部署**: Vercel
- **域名**: soundflows.app

## 核心架构

### 1. 三层音频系统架构

```
┌─────────────────────────────────────┐
│           AudioManager              │
│    (音频管理核心 - 单例模式)        │
└─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────┐
│          PlaylistUI                 │
│     (播放列表和用户界面)             │
└─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────┐
│    BackgroundSceneManager          │
│   (背景场景管理 - Canvas动画)        │
└─────────────────────────────────────┘
```

### 2. 模块职责

#### AudioManager (`assets/js/audio-manager.js`)
- **职责**: 音频播放控制、格式兼容性、内存管理
- **特性**:
  - 支持多种音频格式 (MP3, WMA, WAV, OGG等)
  - 智能重试机制和指数退避
  - 音频实例池管理 (最多10个实例)
  - 全局事件系统
  - 自动清理机制

#### PlaylistUI (`assets/js/playlist-ui.js`)
- **职责**: 分类浏览、音轨选择、播放控制
- **特性**:
  - 9个音频分类展示
  - 拖拽排序支持
  - 搜索和过滤功能
  - 播放状态可视化

#### BackgroundSceneManager (`assets/js/background-scene-manager.js`)
- **职责**: 动态背景场景管理
- **特性**:
  - 9种主题场景，自动匹配音频类型
  - Canvas粒子动画系统
  - 性能自适应 (低端设备自动降级)
  - 帧率控制 (30fps)

### 3. 配置系统

#### Audio Config (`assets/js/audio-config.js`)
- 集中管理所有音频文件的元数据
- 映射分类到实际文件路径
- 支持远程音频托管 (Archive.org)

#### 文件结构
```
assets/audio/
├── Animal sounds/     # 26 files - 森林声音
├── Chakra/           # 7 files  - 脉轮音乐
├── Fire/             # 4 files  - 火焰声音
├── hypnosis/         # 70 files - 催眠音频
├── meditation/       # 14 files - 冥想音乐
├── Rain/             # 14 files - 雨声
├── running water/    # 6 files  - 流水声
├── Singing bowl sound/ # 61 files - 颂钵声音
└── Subconscious Therapy/ # 11 files - 潜意识治疗
```

### 4. 性能优化策略

#### 内存管理
- 音频实例限制 (最多10个)
- 自动清理未使用的实例
- 页面卸载时完整清理

#### Canvas优化
- 对象池管理粒子
- 帧率控制 (30fps)
- 设备性能检测
- 低端设备降级

#### CSS优化
- 减少复杂阴影效果
- 移除不必要的 !important 声明
- 使用CSS变量便于主题切换

### 5. 安全配置

#### CORS策略
- 限制音频资源访问域名
- 避免通配符 "*"

#### 内容安全策略 (CSP)
```http
Content-Security-Policy: default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://archive.org;
  style-src 'self' 'unsafe-inline' https://archive.org;
  img-src 'self' data: https://archive.org https://*.vercel.app;
  media-src 'self' https://archive.org;
  connect-src 'self' https://archive.org https://*.vercel.app;
  font-src 'self' data:;
```

### 6. 浏览器兼容性

#### 支持的浏览器
- Chrome (推荐)
- Firefox
- Safari
- Edge

#### Polyfills
- RequestAnimationFrame
- Promise (可选)
- Canvas API

#### 兼容性检测
- 自动检测浏览器功能
- 优雅降级
- 用户友好提示

### 7. 可访问性

#### ARIA标签
- 完整的屏幕阅读器支持
- 键盘导航
- 跳转链接

#### 键盘快捷键
- Space: 播放/暂停
- Arrow Left/Right: 上一首/下一首
- Ctrl+Arrow Left: 上一首 (精确控制)

### 8. SEO优化

#### Meta标签
- 完整的Open Graph标签
- Twitter Card支持
- 结构化数据 (JSON-LD)

#### 结构化数据
- WebApplication schema
- 网站搜索功能
- 评分和评论信息

### 9. 错误处理

#### 全局错误捕获
- JavaScript错误
- Promise rejection
- 音频加载错误

#### 用户友好提示
- 根据错误类型提供建议
- 多语言支持
- 非阻塞式通知

### 10. 部署流程

#### 自动部署 (GitHub → Vercel)
1. 提交代码到GitHub
2. 自动触发Vercel构建
3. 部署到 soundflows.app

#### 环境配置
- 生产环境: soundflows.app
- 开发环境: localhost:8000

## 开发指南

### 添加新音频文件
1. 将文件放入对应的分类文件夹
2. 运行配置更新脚本
3. 测试播放功能

### 添加新分类
1. 创建新的文件夹
2. 更新配置文件
3. 添加对应的场景配置
4. 更新UI界面

### 性能调试
- 使用浏览器DevTools的Performance面板
- 监控内存使用情况
- 检查Canvas渲染性能

## 维护说明

### 定期检查
- 音频文件可用性
- 第三方服务 (Archive.org) 链接
- 浏览器兼容性更新

### 备份策略
- Git版本控制
- 音频文件备份
- 配置文件版本管理

---

*最后更新: 2025-09-23*