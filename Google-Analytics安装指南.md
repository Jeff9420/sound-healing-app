# Google Analytics 安装指南 - SoundFlows

## 概述
本指南将帮助您为SoundFlows网站（https://soundflows.app）安装和配置Google Analytics 4，以追踪用户行为、流量来源和音频播放数据。

## 安装步骤

### 步骤1：创建Google Analytics账号
1. 访问 https://analytics.google.com
2. 使用Google账号登录
3. 点击"开始测量"
4. 创建账号：
   - 账号名称：SoundFlows
   - 选择数据共享设置（建议全部勾选以获得更好体验）
   - 点击"下一步"

### 步骤2：设置媒体资源
1. 媒体资源名称：SoundFlows - Main
2. 报告时区：根据您的目标用户选择（建议：美国东部时间 EST）
3. 货币：美元 (USD)
4. 点击"下一步"

### 步骤3：业务详情
1. 行业类别：艺术与娱乐 > 音乐
2. 企业规模：小型（1-10名员工）
3. 点击"创建"

### 步骤4：选择数据收集
- 选择"Web"
- 网站名称：SoundFlows
- 网址：https://soundflows.app
- 增强型衡量功能：建议开启（获得更详细数据）

### 步骤5：获取跟踪代码
创建完成后，您将获得：
- **衡量ID**（格式：G-XXXXXXXXX）
- **全局网站代码（gtag.js）**

## 代码安装方案

### 方案A：直接在HTML中安装（推荐）

1. 打开 `index.html`
2. 在 `<head>` 标签内的最顶部添加以下代码：
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXX');
</script>
```

3. 将 `G-XXXXXXXXX` 替换为您的实际衡量ID

### 方案B：通过外部JS文件安装

1. 创建新文件 `assets/js/analytics.js`
```javascript
// Google Analytics Integration
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

// Configure GA4
gtag('config', 'G-XXXXXXXXX');

// Track audio plays
function trackAudioPlay(category, trackName) {
  gtag('event', 'audio_play', {
    'event_category': category,
    'event_label': trackName,
    'value': 1
  });
}

// Track feature usage
function trackFeature(featureName) {
  gtag('event', 'feature_used', {
    'event_category': 'feature',
    'event_label': featureName
  });
}

// Export functions
window.trackAudioPlay = trackAudioPlay;
window.trackFeature = trackFeature;
```

2. 在 `index.html` 的 `</head>` 前添加：
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXX"></script>
<script src="assets/js/analytics.js"></script>
```

3. 在 `index.html` 底部添加Google Analytics主脚本：
```html
<script>
  // Additional tracking initialization
  gtag('config', 'G-XXXXXXXXX', {
    'custom_map': {'dimension1': 'audio_format'}
  });
</script>
```

## 增强型事件追踪

### 1. 音频播放追踪
在 `audio-manager.js` 中添加追踪代码：

```javascript
// 在播放音频时调用
if (window.trackAudioPlay) {
  window.trackAudioPlay(category, fileName);
}
```

### 2. 精选音频追踪
在 `featured-tracks.js` 中添加：

```javascript
// 在 playFeaturedTrack 方法中
if (window.trackFeature) {
  window.trackFeature('featured_track_play');
}
```

### 3. 分享功能追踪
在 `share-module.js` 中添加：

```javascript
// 在分享时调用
if (window.gtag) {
  gtag('event', 'share', {
    'event_category': 'social',
    'event_label': platform
  });
}
```

## 重要事件配置

### 自动追踪事件
```javascript
// 页面滚动深度
window.addEventListener('scroll', function() {
  if (window.scrollY > window.innerHeight * 0.5) {
    if (!window._scrolled50) {
      window._scrolled50 = true;
      gtag('event', 'scroll_50_percent');
    }
  }
});

// 音频播放时长
setInterval(function() {
  if (window.audioManager && window.audioManager.isPlaying) {
    gtag('event', 'audio_duration', {
      'event_category': 'engagement',
      'event_label': 'seconds_played',
      'value': 30 // 每30秒记录一次
    });
  }
}, 30000);
```

## Google Tag Manager 集成（可选）

如果需要更高级的追踪，可以同时安装Google Tag Manager：

1. 创建GTM账号：https://tagmanager.google.com
2. 获取容器代码
3. 在`<head>`顶部添加：
```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
<!-- End Google Tag Manager -->
```

4. 在`<body>`开始后添加：
```html
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

## 隐私合规设置

### Cookie同意管理
1. 安装Cookie同意插件或创建自定义横幅
2. 在获得同意后再加载Analytics

```javascript
// Cookie同意示例
function acceptCookies() {
  localStorage.setItem('cookieConsent', 'accepted');
  loadAnalytics();
}

function loadAnalytics() {
  if (localStorage.getItem('cookieConsent') === 'accepted') {
    // 加载Google Analytics
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXX';
    document.head.appendChild(script);
  }
}
```

### IP匿名化
```javascript
gtag('config', 'G-XXXXXXXXX', {
  'anonymize_ip': true
});
```

## 测试与验证

### 1. 实时测试
1. 打开 Google Analytics
2. 进入"实时" > "概览"
3. 访问您的网站，应该能看到实时活动

### 2. DebugView测试
1. 在GA4中进入"配置" > "DebugView"
2. 在浏览器中添加参数：`https://soundflows.app?gtm_debug=x`
3. 查看实时事件数据

### 3. Tag Assistant
1. 安装Chrome扩展：Google Tag Assistant
2. 访问网站并检查标签是否正确触发

## 自定义报告

创建以下自定义报告以更好追踪音频内容：

1. **音频内容报告**
   - 维度：类别、音频名称
   - 指标：播放次数、播放时长

2. **用户行为报告**
   - 维度：页面路径、设备类型
   - 指标：页面浏览量、平均参与时间

3. **转化渠道报告**
   - 维度：默认渠道组
   - 指标：用户数、新用户数、转化率

## 维护清单

- [ ] 每周检查核心指标
- [ ] 每月分析音频播放数据
- [ ] 季度审查目标设置
- [ ] 更新事件追踪需求
- [ ] 备份配置信息

## 常见问题

### Q: 数据不显示？
A: 检查：
- 代码是否正确安装
- 是否使用了ad blocker
- 是否在正确的时间范围内查看数据

### Q: 如何追踪SPA页面浏览？
A: 在路由变化时手动发送：
```javascript
gtag('config', 'G-XXXXXXXXX', {
  'page_path': '/new-page'
});
```

### Q: 如何导出数据？
A: 使用Google Analytics API或导出功能，支持：
- CSV
- Google Sheets
- BigQuery

---

*指南创建时间：2025年9月29日*