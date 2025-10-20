# 📊 Amplitude 图表配置 - 更新版（仅使用实际存在的事件）

**基于您的实际事件：[Amplitude] Page Viewed, [Amplitude] Element Clicked, [Amplitude] Session Start, [Amplitude] Session End**

---

## 🎯 仪表盘 1: 内容互动分析 - Content Performance

### 图表 1: 页面浏览量趋势
- **事件**: `[Amplitude] Page Viewed`
- **Measured as**: `Event Totals`
- **Chart type**: `Line Chart`
- **名称**: `Page Views - 页面浏览量趋势`
- **时间范围**: `Last 7 days`

### 图表 2: 用户点击分析
- **事件**: `[Amplitude] Element Clicked`
- **Measured as**: `Event Totals`
- **Chart type**: `Bar Chart`
- **名称**: `User Clicks - 用户点击统计`
- **Group by**: 如果找不到字段，不分组

### 图表 3: 每日页面浏览
- **事件**: `[Amplitude] Page Viewed`
- **Measured as**: `Event Totals`
- **Chart type**: `Bar Chart`
- **名称**: `Daily Page Views - 每日页面浏览`
- **Group by**: `Day`

### 图表 4: 点击率分析
- **类型**: `Formula Chart`
- **公式**: `(Element Clicks / Page Views) * 100`
- **名称**: `Click Through Rate - 点击率`
- **如果不会公式，跳过这个**

---

## 🎯 仪表盘 2: 用户行为分析 - User Behavior

### 图表 1: 会话开始趋势
- **事件**: `[Amplitude] Session Start`
- **Measured as**: `Event Totals`
- **Chart type**: `Line Chart`
- **名称**: `Sessions - 会话开始趋势`

### 图表 2: 平均会话时长
- **事件**: `[Amplitude] Session End`
- **Measured as**: `Average`
- **Property**: 搜索 `duration` 或 `length`
- **Chart type**: `Line Chart`
- **名称**: `Avg Session Duration - 平均会话时长`

### 图表 3: 活跃用户数
- **事件**: `[Amplitude] Session Start`
- **Measured as**: `Uniques`
- **Chart type**: `Line Chart`
- **名称**: `Active Users - 活跃用户数`
- **Group by**: `Day`

### 图表 4: 页面浏览与会话比
- **事件**: `[Amplitude] Page Viewed`
- **Measured as**: `Event Totals` / `[Amplitude] Session Start` 的 `Event Totals`
- **Chart type**: `Line Chart`
- **名称**: `Pages per Session - 每会话页面数`

---

## 🎯 仪表盘 3: 技术和设备分析 - Tech & Device Analytics

### 图表 1: 设备类型分布
- **事件**: `[Amplitude] Page Viewed`
- **Measured as**: `Uniques`
- **Chart type**: `Pie Chart`
- **Group by**: 搜索 `Device Type` 或 `Platform`
- **名称**: `Device Types - 设备类型分布`

### 图表 2: 浏览器分布
- **事件**: `[Amplitude] Page Viewed`
- **Measured as**: `Uniques`
- **Chart type**: `Pie Chart`
- **Group by**: 搜索 `Browser`
- **名称**: `Browser Distribution - 浏览器分布`

### 图表 3: 操作系统分布
- **事件**: `[Amplitude] Page Viewed`
- **Measured as**: `Uniques`
- **Chart type**: `Pie Chart`
- **Group by**: 搜索 `OS` 或 `Platform`
- **名称**: `OS Distribution - 操作系统分布`

### 图表 4: 国家/地区分布
- **事件**: `[Amplitude] Session Start`
- **Measured as**: `Uniques`
- **Chart type**: `Bar Chart`
- **Group by**: 搜索 `Country` 或 `Region`
- **名称**: `Top Countries - 热门国家/地区`
- **Limit**: `Top 10`

---

## 🔍 如何找到分组属性

1. **搜索常用属性名**：
   - `Device Type`
   - `Platform`
   - `Browser`
   - `OS`
   - `Country`
   - `City`
   - `Language`

2. **查看所有属性**：
   - 点击 "Segment by"
   - 选择 "View All Properties" 或 "All Properties"
   - 浏览可用属性列表

3. **使用默认属性**：
   - 如果找不到特定属性，选择 Amplitude 提供的默认属性
   - 这些通常在属性列表的顶部

---

## 📝 创建步骤（简化版）

### 创建任何图表的通用步骤：

1. **点击 "Add Chart"**
2. **选择 "Event Segmentation"**
3. **选择事件**（从 4 个可用事件中选择）
4. **选择测量方式**（Event Totals 或 Uniques）
5. **设置图表类型**（Line, Bar, 或 Pie）
6. **添加分组（可选）**
7. **输入图表名称**
8. **点击 "Save"**

---

## ✅ 最简化方案

如果遇到困难，就只创建这些基础图表：

### 仪表盘 1（基础）
- Page Views (Line Chart)
- User Clicks (Bar Chart)

### 仪表盘 2（基础）
- Sessions (Line Chart)
- Active Users (Line Chart)

### 仪表盘 3（基础）
- Device Distribution (Pie Chart)
- Browser Distribution (Pie Chart)

---

## 💡 重要提示

1. **数据需要时间**：新图表可能需要 1-2 分钟显示数据
2. **保持简单**：先创建基础图表，复杂的功能可以后续添加
3. **使用存在的事件**：只用 `[Amplitude]` 开头的四个事件
4. **属性可能不同**：根据您的 Amplitude 版本，属性名称可能略有不同

记住：即使只有基础数据，这些图表仍然能提供有价值的洞察！