# Sentry 错误追踪配置指南

## 概述

本项目已集成 Sentry 错误追踪系统，用于实时监控和报告前端错误，帮助快速发现和修复问题。

## 已完成配置

### 1. Sentry SDK 集成
- 文件位置：`assets/js/sentry-error-tracking.js`
- SDK 版本：7.64.0
- 支持功能：错误捕获、性能监控、用户追踪

### 2. 核心功能
- ✅ JavaScript 错误自动捕获
- ✅ Promise 拒绝追踪
- ✅ 音频播放错误监控
- ✅ 视频加载错误追踪
- ✅ API 请求失败监控
- ✅ 性能指标监控
- ✅ 内存使用警告
- ✅ 用户会话追踪

### 3. 特殊优化
- 音频相关错误增强追踪（音频类别、曲目名称）
- Archive.org 和 Cloudflare CDN 错误监控
- 多语言环境支持
- 敏感信息过滤

## 配置说明

### 当前配置
```javascript
const SENTRY_CONFIG = {
    dsn: 'https://5f5292b3a1c54d3e8e5e6f7a8b9c0d1e@o4505811234567890.ingest.sentry.io/4505811234567890',
    environment: 'development' | 'production',
    release: 'soundflows@v3.0.0',
    tracesSampleRate: 1.0 (开发) | 0.1 (生产),
    debug: true (开发) | false (生产)
}
```

### 需要更新配置

#### 1. 获取真实的 Sentry DSN
1. 登录 [Sentry.io](https://sentry.io)
2. 创建新项目或选择现有项目
3. 在 Settings > Client Keys (DSN) 中找到你的 DSN
4. 替换 `sentry-error-tracking.js` 中的 DSN

#### 2. 设置发布版本
```javascript
release: 'soundflows@v3.0.0'  // 根据实际版本更新
```

#### 3. 环境配置
- 开发环境：`localhost` 或 `127.0.0.1`
- 生产环境：`soundflows.app`

## 测试 Sentry

### 使用测试页面
1. 打开 `sentry-test.html`
2. 点击各种测试按钮
3. 在 Sentry 控制台查看错误报告

### 手动测试
```javascript
// 发送自定义错误
window.trackError(new Error('测试错误'), {
    category: 'test',
    audioCategory: 'meditation'
});

// 发送自定义消息
window.trackEvent('用户操作', 'info', {
    extra: { action: 'play_audio' }
});
```

## 错误追踪功能

### 1. 音频错误追踪
- 自动捕获音频加载失败
- 记录音频类别和曲目信息
- 监控 Archive.org CDN 状态

### 2. 性能监控
- 页面加载时间 > 5秒 时发送警告
- 内存使用 > 80% 时发送警告
- 音频配置加载状态监控

### 3. 用户追踪
- 自动设置用户上下文（如果已登录）
- 追踪用户语言偏好
- 记录主题设置

## 最佳实践

### 1. 自定义错误追踪
在关键功能中添加错误追踪：

```javascript
try {
    // 你的代码
    await audioManager.playTrack(trackId, category, fileName);
} catch (error) {
    window.trackError(error, {
        function: 'playTrack',
        trackId,
        category,
        fileName
    });
}
```

### 2. 用户操作追踪
```javascript
// 追踪重要用户操作
window.trackEvent('音频播放', 'info', {
    extra: {
        category: audioCategory,
        trackName: trackName,
        source: 'category_grid'
    }
});
```

### 3. 性能监控
```javascript
// 监控关键操作性能
const startTime = performance.now();
await doSomething();
const duration = performance.now() - startTime;

if (duration > 1000) {
    window.trackEvent('操作耗时过长', 'warning', {
        extra: { operation: 'doSomething', duration }
    });
}
```

## 查看错误报告

### Sentry 控制台
1. 登录 Sentry.io
2. 选择你的项目
3. 查看 Issues 标签页的错误列表
4. 使用过滤条件筛选特定错误

### 重要指标
- 错误率趋势
- 受影响用户数
- 浏览器分布
- 错误发生位置

## 故障排除

### Sentry 未加载
1. 检查网络连接
2. 验证 DSN 配置
3. 查看浏览器控制台错误

### 错误未上报
1. 确认不是在本地文件协议 (file://) 运行
2. 检查 CORS 配置
3. 验证项目配置

### 过多错误
1. 调整采样率
2. 添加 beforeSend 过滤器
3. 设置忽略错误

## 生产环境部署

### 1. 更新 DSN
使用生产环境的 DSN

### 2. 调整采样率
```javascript
tracesSampleRate: 0.1  // 10% 采样率，平衡监控和成本
```

### 3. 设置告警
在 Sentry 中配置：
- 错误率阈值告警
- 新错误类型通知
- 性能问题告警

## 相关文件

- `assets/js/sentry-error-tracking.js` - Sentry 主配置文件
- `sentry-test.html` - 测试页面
- `index.html` - 已集成 Sentry
- `assets/js/audio-manager.js` - 音频管理（已添加错误追踪）

## 支持

如有问题，请：
1. 查看 Sentry 官方文档：https://docs.sentry.io/
2. 检查浏览器控制台错误
3. 使用测试页面验证配置