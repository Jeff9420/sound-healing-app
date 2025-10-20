# 📊 Amplitude 仪表板配置 - 修正版

**登录地址**: https://analytics.amplitude.com
**项目**: SoundFlows (API Key: b6c4ebe3ec4d16c8f5fd258d29653cfc)
**更新日期**: 2025-01-20

---

## ⚠️ 重要提示

如果找不到特定字段，请尝试以下替代方案：

### 🔍 查找字段的技巧
1. **使用搜索功能** - 在输入框中输入字段名
2. **查看所有属性** - 点击 "All Properties" 或 "View All"
3. **使用变体名称** - `page_url`, `Page URL`, `pagePath` 等

---

## 📋 仪表盘 1: 内容互动分析

### 图表 1: 页面浏览量

**如果找不到 Page URL/Page Path：**

1. **方案 A - 使用事件属性**
   - 事件: `[Amplitude] Page Viewed`
   - 点击 "Segment by"
   - 搜索: `page` 或 `url`
   - 可能的字段：
     - `page_location`
     - `page_title`
     - `path`
     - `url`

2. **方案 B - 不分组**
   - 事件: `[Amplitude] Page Viewed`
   - 不设置分组
   - 只看总浏览量趋势

3. **方案 C - 使用页面标题**
   - 事件: `[Amplitude] Page Viewed`
   - 分组: `Page Title` 或 `page_title`

### 图表 2: 元素点击

1. **事件选择**
   - 事件: `[Amplitude] Element Clicked` 或搜索 `click`

2. **分组字段**
   - 尝试以下字段之一：
     - `Element Text`
     - `element_text`
     - `Click Text`
     - `Button Text`
     - `text`

3. **如果没有元素文本**
   - 使用 `Element Type` 或 `element_type`
   - 或使用 `Element Selector` 或 `selector`

### 图表 3: 音频播放事件

1. **搜索自定义事件**
   - 直接输入: `audio_play`
   - 如果没有，搜索: `play` 或 `audio`

2. **分组字段**
   - 搜索: `category`
   - 可能的字段：
     - `audio_category`
     - `category`
     - `type`

---

## 📋 仪表盘 2: 转化追踪

### 图表 1: 表单提交

1. **事件搜索**
   - 输入: `plan_submit`
   - 如果没有，搜索: `submit`
   - 或搜索: `form`

2. **替代事件**
   - `[Amplitude] Form Submitted`
   - `[Amplitude] Form Started`
   - `conversion` 或 `lead`

### 图表 2: 转化漏斗

1. **漏斗事件顺序**
   - 步骤1: `[Amplitude] Page Viewed`
   - 步骤2: `plan_submit` (如果有)
   - 步骤3: `success` 或搜索 `complete`

2. **如果没有自定义事件**
   - 使用页面浏览作为代理
   - 添加页面过滤条件

---

## 📋 仪表盘 3: 用户行为

### 图表 1: 会话时长

1. **事件选择**
   - `[Amplitude] Session End`
   - 或搜索: `session`

2. **指标选择**
   - 搜索: `duration`
   - 可能的字段：
     - `Session Length`
     - `session_duration`
     - `duration`

### 图表 2: 用户留存

1. **留存分析**
   - 初始事件: `[Amplitude] Page Viewed`
   - 返回事件: `[Amplitude] Session Start`
   - 类型: `N-Day` 或 `Rolling`

---

## 🔧 故障排除

### 如果看不到任何数据

1. **检查时间范围**
   - 改为 "Last 7 Days"
   - 或 "Last 30 Days"

2. **检查实时事件**
   - 点击左侧 "Live Events"
   - 访问您的网站测试

3. **检查项目设置**
   - 确认 API Key 正确
   - 确认数据正在发送

### 如果字段不存在

1. **使用通用字段**
   - 不使用分组，只看总数
   - 使用默认属性

2. **创建自定义属性**
   - 在 Project Settings 中定义
   - 需要管理员权限

3. **等待数据积累**
   - 新属性需要时间出现
   - 通常需要 1-2 小时

---

## 💡 最简单的配置方案

如果上述方法都不行，使用这个最简配置：

### 仪表盘 1: 基础指标
- 图表1: `[Amplitude] Page Viewed` (总计)
- 图表2: `[Amplitude] Element Clicked` (总计)
- 图表3: `[Amplitude] Session Start` (按天)

### 仪表盘 2: 用户活动
- 图表1: `[Amplitude] Session End` (计数)
- 图表2: `[Amplitude] Page Viewed` (按小时)
- 图表3: `[Amplitude] Element Clicked` (Top 5)

### 仪表盘 3: 基础留存
- 图表1: 留存分析（Page Viewed → Session Start）
- 图表2: 用户组成（New vs Returning）
- 图表3: 设备分布

---

## ✅ 快速检查清单

完成后确认：
- [ ] 3 个仪表盘已创建
- [ ] 每个仪表盘有 3-4 个图表
- [ ] 图表名称清晰
- [ ] 设置了邮件提醒（可选）
- [ ] 保存了所有更改

---

## 📞 获取帮助

1. **Amplitude 帮助中心**
   - https://help.amplitude.com
   - 搜索 "custom events" 或 "properties"

2. **实时聊天**
   - 登录 Amplitude 后
   - 点击右下角聊天图标

3. **社区论坛**
   - https://community.amplitude.com
   - 可以提问具体问题

---

**预计时间**: 20-30分钟
**记住**: 先创建基础图表，数据会自动填充！