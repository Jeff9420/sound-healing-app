# 声音疗愈应用部署指南 / Sound Healing App Deployment Guide

## 🚀 快速部署到 Vercel (推荐)

### 1. 前置要求
- Git 仓库 (GitHub, GitLab, Bitbucket)
- Vercel 账户 (免费)
- 正确的目录结构：
```
sound-healing-app/
├── index.html
├── vercel.json
├── assets/
│   ├── js/
│   ├── css/
│   └── audio/
└── 其他文件...
```

### 2. 成功部署流程 (已验证)

#### 步骤1：准备 vercel.json 配置文件
创建 `vercel.json` 配置，内容如下：
```json
{
  "rewrites": [
    {
      "source": "/((?!assets|sw|manifest|robots|sitemap|.*\\..*).*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/audio/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    },
    {
      "source": "/sitemap.xml",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/xml"
        }
      ]
    },
    {
      "source": "/robots.txt",
      "headers": [
        {
          "key": "Content-Type", 
          "value": "text/plain"
        }
      ]
    }
  ]
}
```

#### 步骤2：确保目录结构正确
**重要：** 确保JS和CSS文件在正确位置：
```bash
# 检查文件是否在正确位置
ls assets/js/app.js        # 应该存在
ls assets/css/main.css     # 应该存在
```

如果文件在 `js/` 和 `css/` 目录，需要移动到 `assets/` 下：
```bash
mkdir -p assets/js assets/css
cp -r js/* assets/js/
cp -r css/* assets/css/
```

#### 步骤3：使用 Vercel CLI 部署
```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 在项目目录下登录
vercel login

# 3. 部署到生产环境
vercel --prod --yes
```

#### 步骤4：配置自定义域名 (可选)
1. 在域名注册商处配置DNS：
   - A记录：`@` → `216.198.79.1`
   - A记录：`www` → `216.198.79.1`

2. 在Vercel项目设置中添加域名

### 3. 常见问题解决方案

#### 🚨 静态文件404错误
**症状：** JavaScript/CSS文件返回404
**原因：** 目录结构错误或路由配置问题
**解决：**
```bash
# 1. 检查文件位置
ls assets/js/
ls assets/css/

# 2. 确保vercel.json不包含错误的builds配置
# 移除任何 "builds" 配置让Vercel自动检测
```

#### 🚨 SPA路由问题
**症状：** 刷新页面显示404
**原因：** 单页应用路由配置
**解决：** 使用正确的rewrite规则（已在配置中）

#### 🚨 部署配置冲突
**症状：** "builds" 配置警告
**解决：** 简化 vercel.json，移除不必要的配置

### 4. 部署验证清单
- [ ] 网站正常加载
- [ ] 所有JS模块正常加载
- [ ] 音频分类显示正确（9个分类）
- [ ] 多语言功能正常
- [ ] 音频播放功能正常
- [ ] 响应式设计在移动端正常

## 📋 故障排除指南

### DNS配置问题
如果遇到域名解析问题：
```bash
# 检查DNS记录
nslookup your-domain.com

# 清除DNS缓存 (Windows)
ipconfig /flushdns
```

### 部署失败处理
```bash
# 查看部署日志
vercel inspect --logs

# 重新部署
vercel --prod --yes
```

## 快速部署到 Netlify (备选方案)

### 1. 准备工作
确保所有文件都在项目根目录下：
- ✅ `index.html`
- ✅ `netlify.toml` (部署配置)
- ✅ `_redirects` (路由配置)
- ✅ `assets/` 文件夹及所有子文件

### 2. 部署方法

#### 方法一：拖拽部署 (最简单)
1. 访问 [Netlify](https://netlify.com)
2. 注册/登录账户
3. 直接将整个 `sound-healing-app` 文件夹拖拽到 Netlify 部署区域
4. 等待部署完成（约2-3分钟）
5. 获取 HTTPS 域名（如：`https://your-app-name.netlify.app`）

#### 方法二：Git 部署
1. 初始化 Git 仓库：
```bash
git init
git add .
git commit -m "Initial deployment"
```

2. 推送到 GitHub：
```bash
# 在 GitHub 创建新仓库后
git remote add origin https://github.com/yourusername/sound-healing-app.git
git push -u origin main
```

3. 在 Netlify 连接 GitHub 仓库并自动部署

### 3. 部署后验证清单

#### ✅ 基本功能测试
- [ ] 应用正常加载
- [ ] 音频文件能正常播放
- [ ] 背景场景正常切换
- [ ] 语言切换功能正常

#### ✅ 性能验证
- [ ] 首屏加载时间 < 3秒
- [ ] 音频加载流畅
- [ ] 内存使用正常（< 200MB）

#### ✅ 多语言测试
- [ ] 中文 (zh-CN) - 默认
- [ ] 英文 (en-US) 
- [ ] 日文 (ja-JP)
- [ ] 韩文 (ko-KR)
- [ ] 西班牙文 (es-ES)

#### ✅ 跨浏览器兼容性
- [ ] Chrome (推荐)
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## 其他部署平台

### Vercel 部署
1. 访问 [Vercel](https://vercel.com)
2. 导入项目
3. 使用以下配置：
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### GitHub Pages 部署
1. 推送代码到 GitHub
2. 在 Repository Settings 中启用 GitHub Pages
3. 选择 `main` 分支作为源

### Netlify CLI 部署
```bash
# 1. 安装Netlify CLI
npm install -g netlify-cli

# 2. 在项目目录下
netlify deploy --prod --dir .
```

## 配置说明

### netlify.toml 配置特点
- ✅ 安全头部配置（XSS防护、HTTPS强制等）
- ✅ 音频文件缓存优化（1年缓存）
- ✅ CSS/JS文件缓存优化
- ✅ Service Worker 不缓存
- ✅ 内容安全策略（CSP）

### 性能优化配置
- 音频文件：`max-age=31536000` (1年缓存)
- 静态资源：`max-age=31536000` (1年缓存)  
- HTML文件：`max-age=3600` (1小时缓存)
- Service Worker：`no-cache` (不缓存)

## 监控和分析

### 推荐工具
1. **Netlify Analytics** - 基础访问统计
2. **Google Analytics** - 详细用户行为分析
3. **Sentry** - 错误监控
4. **Lighthouse** - 性能监控

### 关键指标监控
- 首次内容绘制 (FCP): < 1.5秒
- 最大内容绘制 (LCP): < 2.5秒  
- 音频加载时间: < 3秒
- 内存使用: < 200MB
- 错误率: < 1%

## 故障排查

### 常见问题及解决方案

#### 1. 音频无法播放
- **原因**: HTTPS策略或音频格式不支持
- **解决**: 确保部署在HTTPS环境，检查音频格式兼容性

#### 2. 语言切换失败
- **原因**: i18n配置文件加载问题
- **解决**: 检查`assets/js/i18n-system.js`路径和配置

#### 3. Service Worker 错误
- **原因**: 协议不匹配或配置错误
- **解决**: 检查`assets/js/cache-manager.js`中的协议检测

#### 4. 背景场景不显示
- **原因**: Canvas初始化失败或WebGL不支持
- **解决**: 检查浏览器WebGL支持，降级到2D渲染

### 调试工具
1. 浏览器开发者工具 → Network 选项卡
2. 浏览器开发者工具 → Console 选项卡
3. Netlify 部署日志
4. 性能监控面板 (应用内置)

## 更新和维护

### 代码更新流程
1. 本地测试修改
2. 提交到 Git 仓库
3. 自动触发 Netlify 重新部署
4. 验证部署结果

### 音频文件更新
1. 上传新音频文件到相应分类文件夹
2. 更新 `assets/js/audio-config.js`
3. 测试新文件播放功能
4. 重新部署

### 版本管理建议
- 使用语义化版本号 (Semantic Versioning)
- 重大更新前创建备份
- 保持定期的安全更新

---

## 支持和反馈

如果在部署过程中遇到问题，请检查：
1. 浏览器控制台错误信息
2. Netlify 部署日志
3. 网络连接状态
4. 音频文件完整性

**🎵 部署完成后，您的声音疗愈应用就可以通过HTTPS访问了！**

## 旧版配置参考

### 自有服务器部署

**Nginx配置示例：**
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    root /var/www/sound-healing-app;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
        
        # PWA缓存头
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    location ~* \.(mp3|wav|ogg)$ {
        add_header Cache-Control "public, max-age=604800";
        add_header Access-Control-Allow-Origin "*";
    }
    
    location /manifest.json {
        add_header Cache-Control "public, max-age=86400";
    }
    
    location /sw.js {
        add_header Cache-Control "public, max-age=0";
    }
}
```

### 方法3：CDN加速部署

**推荐CDN：**
- Cloudflare（免费套餐足够）
- AWS CloudFront
- 阿里云CDN

**配置要点：**
- 设置音频文件缓存时间：7天
- 设置静态资源缓存时间：1年
- 启用Gzip压缩
- 配置HTTPS重定向

## 音频资源优化

### 音频文件准备

**必需文件（6个）：**
```
assets/audio/
├── rain.mp3     # 雨声
├── ocean.mp3    # 海浪声  
├── wind.mp3     # 风声
├── fire.mp3     # 篝火声
├── stream.mp3   # 溪流声
└── birds.mp3    # 鸟鸣声
```

**音频规格要求：**
- 格式：MP3, 128kbps
- 采样率：44.1kHz
- 声道：立体声
- 文件大小：< 3MB
- 时长：30秒-2分钟循环
- 特性：无缝循环，无明显噪音

**音频来源推荐：**
```bash
# Freesound高质量资源
https://freesound.org/search/?q=rain+seamless+loop
https://freesound.org/search/?q=ocean+waves+loop
https://freesound.org/search/?q=wind+ambient+loop
https://freesound.org/search/?q=campfire+crackling
https://freesound.org/search/?q=stream+flowing+water
https://freesound.org/search/?q=birds+forest+ambient

# Pixabay免费资源（更简单）
https://pixabay.com/sound-effects/search/nature/
```

### 性能优化建议

**压缩优化：**
```bash
# 使用FFmpeg压缩音频
ffmpeg -i input.wav -b:a 128k -ar 44100 output.mp3

# 批量处理
for f in *.wav; do ffmpeg -i "$f" -b:a 128k "${f%.wav}.mp3"; done
```

**CDN配置：**
- 音频文件放到CDN，减少主服务器负载
- 设置地理位置就近分发
- 启用音频预加载优化

## 性能监控配置

### 生产环境监控

**关键指标：**
- 页面加载时间 < 1秒
- 音频加载时间 < 3秒  
- 内存使用 < 100MB
- 错误率 < 1%

**监控工具集成：**
```javascript
// Google Analytics 4 (可选)
gtag('event', 'audio_play', {
  'sound_type': soundId,
  'preset_used': presetId || 'manual'
});

// 自定义性能监控
app.performanceMonitor.exportMetrics(); // 导出性能数据
```

## 安全配置

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    media-src 'self' https://*.soundjay.com https://*.freesound.org;
    connect-src 'self' https:;
    img-src 'self' data:;
">
```

### 隐私保护
- 所有数据仅本地存储（localStorage）
- 无用户追踪和数据收集
- 无第三方广告或分析工具
- 符合GDPR隐私要求

## 浏览器兼容性

### 支持的浏览器
**桌面端：**
- Chrome 80+ ✅
- Firefox 75+ ✅  
- Safari 13+ ✅
- Edge 80+ ✅

**移动端：**
- iOS Safari 13+ ✅
- Android Chrome 80+ ✅
- Samsung Internet 12+ ✅

### 功能降级策略
- Service Worker不支持：正常功能，无离线缓存
- Web Audio API不支持：使用HTMLAudioElement替代
- localStorage不支持：设置不保存，功能正常

## 维护和更新

### 版本更新流程
1. 修改 `sw.js` 中的 `CACHE_NAME` 版本号
2. 测试所有功能正常
3. 部署新版本
4. Service Worker自动提示用户更新

### 监控检查项
- 定期检查音频文件可访问性
- 监控内存使用趋势
- 收集用户错误报告
- 性能指标定期分析

### 故障排除

**常见问题解决：**

**音频无法播放：**
```bash
# 检查文件权限
chmod 644 assets/audio/*.mp3

# 检查MIME类型
# 确保服务器正确设置 audio/mpeg
```

**PWA安装失败：**
```bash
# 检查manifest.json
curl -I https://your-domain.com/manifest.json

# 检查Service Worker
curl -I https://your-domain.com/sw.js
```

**性能问题：**
```javascript
// 开发者控制台检查
app.performanceMonitor.getMetricsSummary()

// 内存使用检查
performance.memory
```

## 扩展开发指南

### 添加新声音
1. 在 `audio-manager.js` 的 `soundConfigs` 中添加配置
2. 在 `index.html` 中添加对应的卡片HTML
3. 更新预设组合配置
4. 添加音频文件到 `assets/audio/`

### 自定义主题
1. 在 `main.css` 中定义新的CSS变量
2. 在 `theme-manager.js` 中添加主题配置
3. 可选：添加主题切换动画

### 性能优化建议
- 音频文件使用CDN分发
- 启用Gzip压缩
- 实施渐进式加载
- 监控Core Web Vitals指标

---

**生产就绪检查清单：**
- [ ] 所有音频文件已优化并放置到位
- [ ] HTTPS证书配置完成
- [ ] Service Worker缓存策略验证
- [ ] 跨浏览器兼容性测试完成
- [ ] 性能指标达标
- [ ] 错误处理测试完成
- [ ] 移动端体验验证
- [ ] PWA安装功能测试