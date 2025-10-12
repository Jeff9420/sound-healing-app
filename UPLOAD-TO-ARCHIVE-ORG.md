# 📤 Archive.org 上传指南

## 🎯 上传步骤 (简化版)

### 1️⃣ 登录 Archive.org
访问: https://archive.org/account/login.php

### 2️⃣ 开始上传
访问: https://archive.org/upload/

### 3️⃣ 填写基本信息
```
Title: Sound Healing Background Videos

Description:
High-quality looping background videos for sound healing meditation app.
9 nature scenes in Full HD (1920x1080, 30fps).
Optimized for web streaming (52MB total).

Categories: Forest Birds, Energy Chakra, Campfire Flames, Cosmic Stars,
Zen Bamboo, Rain Drops, Flowing Stream, Golden Temple, Dreamy Clouds.

Creator: [您的名字]

Subject tags: meditation, nature, background video, healing, soundflows, relaxation

License: Creative Commons - Attribution 4.0 International
```

### 4️⃣ 上传文件
- 拖入 `videos/optimized/` 目录下的所有 9 个视频
- 等待上传完成 (总共约 52 MB，几分钟即可)

### 5️⃣ 发布
- 点击 "Upload and Create Your Item"
- 等待 Archive.org 处理 (2-5分钟)

### 6️⃣ 获取视频 URL
- 上传后，您会看到类似这样的页面:
  ```
  https://archive.org/details/[您的item-id]
  ```

- 每个视频的直链URL格式为:
  ```
  https://archive.org/download/[您的item-id]/[视频文件名]
  ```

- 例如，如果您的 Item ID 是 `soundflows-backgrounds`，那么：
  ```
  https://archive.org/download/soundflows-backgrounds/forest-birds.mp4
  https://archive.org/download/soundflows-backgrounds/energy-chakra.mp4
  https://archive.org/download/soundflows-backgrounds/campfire-flames.mp4
  ... (其余7个视频)
  ```

---

## ✏️ 上传后需要更新的代码

### 更新 `assets/js/video-background-manager.js`

找到第 34 行的 `baseUrl`，替换为您的实际 URL：

**修改前:**
```javascript
videoConfig = {
    baseUrl: 'https://archive.org/download/sound-healing-videos/',
    // ...
};
```

**修改后 (替换为您的实际 Item ID):**
```javascript
videoConfig = {
    baseUrl: 'https://archive.org/download/[您的item-id]/',
    // ...
};
```

例如:
```javascript
baseUrl: 'https://archive.org/download/soundflows-backgrounds/',
```

---

## 📋 视频文件清单 (上传这9个文件)

✅ 所有视频都在 `videos/optimized/` 目录下：

1. `campfire-flames.mp4` (6.2 MB) - Fire类别
2. `cosmic-stars.mp4` (3.3 MB) - Hypnosis类别
3. `dreamy-clouds.mp4` (5.6 MB) - Subconscious Therapy类别
4. `energy-chakra.mp4` (4.5 MB) - Chakra类别
5. `flowing-stream.mp4` (8.7 MB) - Running water类别
6. `forest-birds.mp4` (8.7 MB) - Animal sounds类别
7. `rain-drops.mp4` (2.2 MB) - Rain类别
8. `temple-golden.mp4` (4.2 MB) - Singing bowl sound类别
9. `zen-bamboo.mp4` (8.7 MB) - Meditation类别

**总大小**: 52 MB

---

## 🎬 完成后测试

### 1. 更新代码后提交
```bash
git add assets/js/video-background-manager.js
git commit -m "🎥 更新视频背景URL为Archive.org地址"
git push origin main
```

### 2. 等待Vercel自动部署
- GitHub推送后，Vercel会自动部署 (2-3分钟)

### 3. 访问 https://soundflows.app 测试
- 点击不同的音频分类
- 检查视频背景是否正确加载和切换
- 测试视频循环播放是否流畅

---

## 💡 提示

### Item ID 命名建议
- 使用小写字母和连字符
- 简短易记
- 相关词汇: soundflows, healing, meditation, backgrounds

### 上传速度
- 52 MB 通常需要 5-10 分钟上传
- Archive.org 处理视频需要额外 2-5 分钟
- 总时间约 10-15 分钟

### 隐私设置
- 必须选择 **Public** (公开)
- 否则视频无法通过直链访问

---

## 🆘 如果遇到问题

### 视频无法加载
1. 检查Archive.org Item是否为Public
2. 检查视频URL是否正确
3. 在浏览器直接访问视频URL测试

### 视频加载缓慢
- Archive.org CDN有时较慢，属正常现象
- 可以考虑未来迁移到其他CDN (如Cloudflare R2)

---

**准备上传时间**: 2025-10-12
**优化后视频位置**: `videos/optimized/`
**状态**: ✅ 视频已优化，等待上传
