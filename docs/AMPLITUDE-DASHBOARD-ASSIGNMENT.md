# 📊 Amplitude 仪表盘图表分配方案

**3个仪表盘 · 每个仪表盘3-4个图表**

---

## 🎯 仪表盘 1: 内容互动分析 - Content Performance

### 图表分配：
1. **Page Views - 页面浏览量趋势**
   - 事件：`[Amplitude] Page Viewed`
   - 图表类型：折线图
   - 作用：了解哪些页面最受欢迎

2. **User Clicks - 用户点击热力图**
   - 事件：`[Amplitude] Element Clicked`
   - 图表类型：柱状图
   - 分组：Element Type 或 Element Text
   - 作用：了解用户最常点击什么

3. **Scroll Depth - 滚动深度分析**
   - 事件：`scroll_depth`
   - 图表类型：饼图或柱状图
   - 分组：percentage
   - 作用：了解用户是否真的阅读了内容

4. **Video Plays - 视频播放统计**
   - 事件：`video_play`
   - 图表类型：折线图
   - 作用：了解视频内容表现

---

## 🎯 仪表盘 2: 线索质量分析 - Lead Quality

### 图表分配：
1. **Form Submissions - 表单提交趋势**
   - 事件：搜索 `submit` 或 `form`
   - 图表类型：折线图
   - 作用：追踪表单提交量变化

2. **Daily Sessions - 日会话统计**
   - 事件：`[Amplitude] Session Start`
   - 图表类型：折线图
   - 分组：Day
   - 作用：了解访问量趋势

3. **Session Duration - 平均会话时长**
   - 事件：`[Amplitude] Session End`
   - 图表类型：折线图
   - 测量：Average
   - 属性：Session Length 或 duration
   - 作用：了解用户停留时间

4. **Return Users vs New Users**
   - 事件：`[Amplitude] Session Start`
   - 图表类型：饼图
   - 分组：New vs Returning
   - 作用：了解用户忠诚度

---

## 🎯 仪表盘 3: 用户行为分析 - User Engagement

### 图表分配：
1. **Device Distribution - 设备分布**
   - 事件：`[Amplitude] Page Viewed`
   - 图表类型：饼图
   - 分组：Device Type 或 Platform
   - 作用：了解用户使用的设备

2. **Geographic Distribution - 用户地理分布**
   - 事件：`[Amplitude] Session Start`
   - 图表类型：柱状图
   - 分组：Country
   - 限制：Top 10
   - 作用：了解用户来自哪里

3. **Browser Distribution - 浏览器分布**
   - 事件：`[Amplitude] Page Viewed`
   - 图表类型：饼图
   - 分组：Browser
   - 作用：了解用户使用的浏览器

4. **User Retention - 用户留存率**
   - 图表类型：Retention Analysis
   - 初始事件：Page Viewed
   - 返回事件：Session Start
   - 留存类型：N-Day
   - 作用：了解用户回访情况

---

## 📝 创建顺序建议

### 第一步：创建仪表盘
1. `Create` → `Dashboard`
2. 输入名称：`内容互动分析 - Content Performance`
3. `Create`

### 第二步：为每个仪表盘创建图表
按照上面的分配，为每个仪表盘创建相应的图表

---

## ✅ 完成检查清单

### 仪表盘 1 - 内容互动分析
- [ ] Page Views - 页面浏览量趋势
- [ ] User Clicks - 用户点击热力图
- [ ] Scroll Depth - 滚动深度分析
- [ ] Video Plays - 视频播放统计

### 仪表盘 2 - 线索质量分析
- [ ] Form Submissions - 表单提交趋势
- [ ] Daily Sessions - 日会话统计
- [ ] Session Duration - 平均会话时长
- [ ] Return Users vs New Users

### 仪表盘 3 - 用户行为分析
- [ ] Device Distribution - 设备分布
- [ ] Geographic Distribution - 用户地理分布
- [ ] Browser Distribution - 浏览器分布
- [ ] User Retention - 用户留存率

---

## 💡 提示

1. **优先创建重要图表**
   - 先创建 Page Views 和 User Clicks
   - 这些最容易验证

2. **灵活调整**
   - 如果找不到特定事件（如 submit），使用相似的
   - 如果没有表单数据，用其他替代

3. **数据验证**
   - 创建后查看图表是否显示数据
   - Live Events 有数据，图表应该很快显示

现在您清楚地知道哪个图表属于哪个仪表盘了！