# 项目配置说明文档

## 🎯 核心配置概览

### 📁 文件托管位置

| 资源类型 | 托管平台 | URL | 配置文件 |
|---------|---------|-----|---------|
| **音频文件** | Internet Archive | `https://archive.org/download/sound-healing-collection/` | `assets/js/audio-config.js` |
| **视频文件** | Cloudflare R2 CDN | `https://media.soundflows.app/` | `assets/js/video-background-manager.js` |

### ⚠️ 重要提醒

**千万不要搞错！**
- 🎵 **音频** → Archive.org（archive.org）
- 🎬 **视频** → Cloudflare R2（media.soundflows.app）

## 📋 详细配置

### 1. 音频配置（Archive.org）

#### 配置文件：`assets/js/audio-config.js`
```javascript
const AUDIO_CONFIG = {
    baseUrl: 'https://archive.org/download/sound-healing-collection/',
    categories: {
        'Animal sounds': {
            folder: 'animal-sounds',  // Archive.org 上的文件夹名
            files: [/* 音频文件列表 */]
        }
        // ... 其他分类
    }
};
```

#### Archive.org 文件夹映射
| 应用内分类名 | Archive.org 文件夹名 |
|-------------|-------------------|
| Animal sounds | animal-sounds |
| Chakra | chakra |
| Fire | fire-sounds |
| hypnosis | hypnosis |
| meditation | meditation |
| Rain | rain-sounds |
| running water | water-sounds |
| Singing bowl sound | singing-bowls |
| Subconscious Therapy | subconscious-therapy |

### 2. 视频配置（Cloudflare R2）

#### 配置文件：`assets/js/video-background-manager.js`
```javascript
class VideoBackgroundManager {
    constructor() {
        this.videoConfig = {
            baseUrl: 'https://media.soundflows.app/',
            categories: {
                'Animal sounds': {
                    filename: 'forest-birds.ia.mp4'
                }
                // ... 其他分类
            }
        };
    }
}
```

#### 视频文件路径尝试顺序
系统会自动尝试以下路径：
1. `https://media.soundflows.app/video/视频文件名`
2. `https://media.soundflows.app/videos/视频文件名`
3. `https://media.soundflows.app/视频文件名`

## 🔄 更新流程

### 添加新音频文件
1. **上传到 Archive.org**
   - 登录 Internet Archive
   - 上传到 `sound-healing-collection` 项目的对应文件夹
2. **更新配置文件**
   - 编辑 `assets/js/audio-config.js`
   - 在对应分类的 `files` 数组中添加新文件名
3. **测试**
   - 打开网站测试新音频是否能正常播放

### 添加新视频文件
1. **上传到 Cloudflare R2**
   - 登录 Cloudflare Dashboard
   - 上传到 R2 Bucket（media.soundflows.app）
   - 可以放在 `video/`、`videos/` 或根目录
2. **更新配置文件**
   - 编辑 `assets/js/video-background-manager.js`
   - 在 `videoConfig.categories` 中添加视频文件名
3. **测试**
   - 切换到对应分类，检查视频是否正常播放

## 🛠️ 常见问题排查

### 音频无法播放
1. 检查 `audio-config.js` 是否使用 Archive.org URL
2. 在浏览器控制台检查 `window.AUDIO_CONFIG` 是否已定义
3. 直接访问 Archive.org URL 确认文件存在
4. 检查文件名是否完全匹配（包括空格和特殊字符）

### 视频无法播放
1. 检查 `video-background-manager.js` 是否使用 R2 CDN URL
2. 直接访问 R2 CDN URL 确认文件存在
3. 检查 CORS 配置（应在 Cloudflare Dashboard 中配置）
4. 注意：自动化浏览器可能被 Cloudflare 屏蔽，真实用户应该能正常看到

### 混淆配置的后果
- ❌ 音频使用 R2 CDN：文件不存在，播放失败
- ❌ 视频使用 Archive.org：加载速度慢，体验差
- ✅ 音频使用 Archive.org：稳定的长期存储
- ✅ 视频使用 R2 CDN：全球加速，用户体验好

## 📝 配置检查清单

在部署前确认：

- [ ] `audio-config.js` 使用 `https://archive.org/download/sound-healing-collection/`
- [ ] `video-background-manager.js` 使用 `https://media.soundflows.app/`
- [ ] 所有音频文件名在 Archive.org 上存在
- [ ] 所有视频文件在 R2 CDN 上存在
- [ ] 文件夹名称映射正确
- [ ] CORS 配置正确（R2 CDN）
- [ ] 测试各分类音频和视频都能正常播放

## 🎵🎬 记住

**音频 = Archive.org（旧金山数字图书馆）**
**视频 = Cloudflare R2（现代CDN）**

这样的配置既保证了音频文件的长期稳定存储，又确保了视频的快速加载和流畅播放。