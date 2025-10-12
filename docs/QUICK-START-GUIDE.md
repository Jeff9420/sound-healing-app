# 声音疗愈 2.0 快速开始指南

## 🎉 欢迎使用声音疗愈 2.0！

你已经成功完成了 Phase 1 的核心功能开发：
- ✅ **视频背景系统** - 提升视觉沉浸感
- ✅ **专注模式** - 极简UI体验
- ✅ **智能预加载** - 优化性能
- ✅ **Canvas降级方案** - 确保兼容性

---

## 🚀 立即测试（本地环境）

### 步骤 1: 启动本地服务器

```bash
# 方法1: 使用Python (推荐)
cd "C:\Users\MI\Desktop\声音疗愈"
python -m http.server 8000

# 方法2: 使用Node.js
npx http-server -p 8000

# 方法3: 使用PHP
php -S localhost:8000
```

### 步骤 2: 打开浏览器

访问: http://localhost:8000

### 步骤 3: 测试新功能

#### 🎥 测试视频背景系统

1. **打开浏览器开发者工具**
   - 按 `F12` 或右键 → 检查

2. **查看控制台输出**
   ```
   ✅ 应该看到:
   🎥 初始化视频背景系统...
   ✅ 视频背景系统初始化完成
   ```

3. **点击音频分类**
   - 点击任意分类（如"冥想音乐"）
   - 观察控制台输出

4. **检查视频切换**
   ```javascript
   // 在控制台手动测试
   window.videoBackgroundManager.getStatus()

   // 手动切换视频
   window.videoBackgroundManager.switchVideoBackground('meditation')
   ```

5. **查看当前状态**
   ```javascript
   // 查看是否使用Canvas降级方案
   window.videoBackgroundManager.getStatus()
   // 输出: { isVideoMode: false, useCanvas: true, ... }
   ```

#### 🎯 测试专注模式

1. **进入专注模式**
   - 点击Header右上角的 🎯 按钮
   - 或按 `F11` 进入全屏

2. **预期效果**
   - ✅ 全屏显示
   - ✅ 中央大播放按钮
   - ✅ 主界面淡出
   - ✅ 移动鼠标显示底部控制栏
   - ✅ 3秒后控制栏自动隐藏

3. **测试交互**
   - 点击中央播放按钮 → 播放/暂停
   - 移动鼠标 → 显示控制栏
   - 点击底部 "✖️ 退出" → 退出专注模式
   - 按 `ESC` 键 → 退出专注模式

4. **查看状态**
   ```javascript
   // 在控制台查看专注模式状态
   window.focusModeController.getStatus()
   // 输出: { isActive: true/false, isFullscreen: true/false }
   ```

---

## ⚠️ 当前状态提示

### ❗ 视频资源尚未准备

**当前行为**:
- 视频背景系统已经实现 ✅
- 但视频文件URL是占位符 ⏳
- 系统会**自动降级到Canvas动画** ✅

**控制台提示**:
```
⚠️ 浏览器不支持视频，降级到Canvas动画
或
⚠️ 视频加载失败，降级到Canvas动画
```

**这是正常行为！** 在上传视频资源之前，系统会使用Canvas动画作为替代方案。

### 🎬 准备视频资源的步骤

详细指南请查看: `docs/VIDEO-RESOURCES-GUIDE.md`

**快速步骤**:

1. **下载9个视频** (每个15-30秒)
   - 访问 Pexels.com 或 Pixabay.com
   - 搜索关键词见指南文档

2. **优化视频**
   ```bash
   ffmpeg -i input.mp4 \
     -vf "scale=1920:1080" \
     -c:v libx264 -crf 23 \
     -b:v 3M -an \
     output.mp4
   ```

3. **上传到Archive.org**
   - 创建项目: `sound-healing-videos`
   - 上传9个视频文件
   - 获取直链URL

4. **更新配置**
   - 修改 `video-background-manager.js`
   - 更新 `baseUrl` 为实际URL

---

## 🐛 调试技巧

### 查看系统状态

```javascript
// 1. 视频背景管理器状态
window.videoBackgroundManager.getStatus()

// 2. 专注模式控制器状态
window.focusModeController.getStatus()

// 3. 性能指标
window.videoBackgroundManager.getPerformanceMetrics()
```

### 强制切换模式

```javascript
// 强制启用Canvas模式（测试降级方案）
window.videoBackgroundManager.enableCanvasMode()

// 强制启用视频模式
window.videoBackgroundManager.enableVideoMode()

// 手动切换视频背景
window.videoBackgroundManager.switchVideoBackground('Rain')
```

### 控制台日志

打开开发者工具（F12），切换到 Console 标签：

```
预期日志输出:
✅ 视频背景系统初始化完成
✅ 专注模式控制器初始化完成
✅ i18n system initialized
✅ 主题管理器已初始化
```

---

## 📊 性能监控

### 使用Chrome DevTools

1. **打开Performance标签**
   - F12 → Performance
   - 点击录制 → 使用应用 → 停止录制

2. **检查指标**
   - FPS (目标: > 30fps)
   - 内存占用 (目标: < 150MB)
   - CPU占用 (目标: < 30%)

3. **检查Network**
   - F12 → Network
   - 刷新页面
   - 查看视频加载时间

### 性能优化建议

如果遇到性能问题：

```javascript
// 1. 降低粒子数量
window.videoBackgroundManager.enableCanvasMode()

// 2. 清理预加载缓存
window.videoBackgroundManager.cleanup()

// 3. 检查内存泄漏
// Chrome DevTools → Memory → Take Heap Snapshot
```

---

## 🌐 部署到生产环境

### 步骤 1: 提交代码到GitHub

```bash
cd "C:\Users\MI\Desktop\声音疗愈"

git add .
git commit -m "🎥 Phase 1: 添加视频背景和专注模式

- 实现VideoBackgroundManager视频背景系统
- 添加FocusModeController专注模式
- 支持9个分类的视频背景切换
- 实现极简UI专注模式体验
- 添加智能预加载和降级方案

Features:
- 🎥 视频背景平滑切换（1秒淡入淡出）
- 🎯 专注模式全屏体验
- 🚀 智能预加载下一个可能的视频
- 🎨 Canvas降级方案确保兼容性
- 📱 移动端优化"

git push origin main
```

### 步骤 2: Vercel自动部署

1. GitHub push后，Vercel会自动触发部署
2. 等待2-3分钟
3. 访问 https://soundflows.app
4. 验证新功能是否正常工作

### 步骤 3: 验证部署

访问生产环境并测试：
- ✅ 专注模式按钮显示
- ✅ 点击分类触发视频切换事件
- ✅ Canvas降级方案工作正常
- ✅ 移动端适配正常

---

## 🎯 已知限制和解决方案

### 1. 视频自动播放限制 (iOS Safari)

**问题**: iOS Safari限制视频自动播放

**解决方案**:
- ✅ 已设置 `muted` 属性（静音视频可自动播放）
- ✅ 使用 `playsInline` 避免全屏
- ✅ 失败时自动降级到Canvas

### 2. 全屏API兼容性

**问题**: 部分浏览器不支持全屏API

**解决方案**:
- ✅ 专注模式在非全屏下也能正常工作
- ✅ 全屏失败时不影响专注模式功能

### 3. Canvas性能

**问题**: 低端设备Canvas动画可能卡顿

**解决方案**:
- ✅ 帧率限制到30 FPS
- ✅ 页面不可见时自动暂停
- ✅ 批量渲染优化

---

## 📝 下一步计划

### Phase 2: 账号系统和数据同步 (Week 3-4)

- [ ] Firebase Authentication 集成
- [ ] Firestore 数据存储
- [ ] 云端同步收藏和历史
- [ ] 可选登录（保留匿名模式）

### Phase 3: 社区和内容扩展 (Week 5-6)

- [ ] 社区贡献系统
- [ ] 音频上传和审核
- [ ] 创作者展示页面
- [ ] 打卡和分享功能

### Phase 4: 智能推荐 (Week 7-8)

- [ ] 基于时间的推荐
- [ ] 基于行为的推荐
- [ ] 今日推荐板块
- [ ] AI音频生成

### Phase 5: 引导式课程 (Week 9-10)

- [ ] 7天冥想入门
- [ ] 21天睡眠改善计划
- [ ] 课程进度追踪
- [ ] 完成徽章系统

---

## 💡 常见问题 (FAQ)

### Q1: 为什么视频不播放？

**A**: 目前视频URL是占位符，系统自动降级到Canvas动画。这是正常行为！等待视频资源准备完毕后，更新配置即可。

### Q2: 专注模式如何退出？

**A**: 三种方式:
1. 按 `ESC` 键
2. 点击底部 "✖️ 退出" 按钮
3. 退出全屏模式

### Q3: 如何测试视频切换功能？

**A**: 在浏览器控制台执行:
```javascript
window.videoBackgroundManager.switchVideoBackground('meditation')
```

### Q4: Canvas降级方案如何工作？

**A**: 系统会自动检测：
1. 浏览器是否支持视频
2. 视频是否加载失败
3. 任一条件不满足，自动降级到Canvas动画

### Q5: 如何强制使用Canvas模式？

**A**: 执行:
```javascript
window.videoBackgroundManager.enableCanvasMode()
```

---

## 🔧 故障排查

### 问题: 控制台显示 "找不到Canvas元素"

**解决方案**:
```javascript
// 检查Canvas元素
document.getElementById('backgroundCanvas')

// 应该返回: <canvas id="backgroundCanvas"></canvas>
```

### 问题: 专注模式按钮无响应

**解决方案**:
```javascript
// 检查FocusModeController
window.focusModeController

// 手动调用
window.focusModeController.toggle()
```

### 问题: 视频事件未触发

**解决方案**:
```javascript
// 检查事件监听
window.addEventListener('categoryChanged', (e) => {
    console.log('Category changed:', e.detail);
});

// 测试触发事件
window.dispatchEvent(new CustomEvent('categoryChanged', {
    detail: { category: 'meditation' }
}));
```

---

## 📞 获取帮助

### 技术支持

- **GitHub Issues**: https://github.com/soundflows/app/issues
- **文档**: `docs/` 目录
- **邮箱**: support@soundflows.app

### 相关文档

- `UPGRADE-2.0-PLAN.md` - 完整升级计划
- `VIDEO-RESOURCES-GUIDE.md` - 视频资源准备指南
- `PHASE-1-IMPLEMENTATION-SUMMARY.md` - 实施总结

---

## 🎉 恭喜！

你已经成功完成了声音疗愈 2.0 的 Phase 1 开发！

**已实现的功能**:
- ✅ 视频背景系统
- ✅ 专注模式
- ✅ 智能预加载
- ✅ Canvas降级方案
- ✅ 移动端优化

**下一步**:
1. 准备视频资源
2. 测试和优化
3. 部署到生产环境
4. 开始 Phase 2 开发

---

**最后更新**: 2025-10-12
**版本**: 2.0 Phase 1
**状态**: ✅ 开发完成，准备测试
