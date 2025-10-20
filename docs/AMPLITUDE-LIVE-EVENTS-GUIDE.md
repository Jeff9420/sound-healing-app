# 🎯 Amplitude 图表配置 - 基于实时数据

**基于您的 Live Events 显示的可用事件**

---

## 📋 可用事件列表（从截图）

根据您的 Live Events，我看到以下事件：
1. `[Amplitude] Page Viewed`
2. `[Amplitude] Element Clicked`
3. `[Amplitude] Session Start`
4. `[Amplitude] Session End`
5. `video_play`
6. `scroll_depth`
7. `plan_submit` (可能存在)

---

## 🚀 仪表盘配置（使用实际存在的事件）

### 仪表盘 1: 基础流量分析

#### 图表 1: 页面浏览趋势
- **事件**: `[Amplitude] Page Viewed`
- **测量方式**: `Event Totals`
- **图表类型**: `Line Chart`
- **时间范围**: `Last 7 Days`
- **无需分组** - 只看总数趋势

#### 图表 2: 元素点击统计
- **事件**: `[Amplitude] Element Clicked`
- **测量方式**: `Event Totals`
- **图表类型**: `Bar Chart`
- **分组方式**: 如果找不到文本字段，不分组

#### 图表 3: 会话分析
- **事件**: `[Amplitude] Session Start`
- **测量方式**: `Uniques` (唯一用户)
- **图表类型**: `Line Chart`

### 仪表盘 2: 用户行为分析

#### 图表 1: 滚动深度分布
- **事件**: `scroll_depth`
- **测量方式**: `Event Totals`
- **分组**: `percentage` (如果可用)
- **图表类型**: `Bar Chart`

#### 图表 2: 视频播放统计
- **事件**: `video_play`
- **测量方式**: `Event Totals`
- **图表类型**: `Line Chart`

#### 图表 3: 会话时长
- **事件**: `[Amplitude] Session End`
- **测量方式**: `Average`
- **属性**: 查找 `duration` 或 `length`

### 仪表盘 3: 转化分析

#### 图表 1: 页面到点击的转化
- **类型**: `Funnel Analysis`
- **步骤 1**: `[Amplitude] Page Viewed`
- **步骤 2**: `[Amplitude] Element Clicked`
- **转化窗口**: `Same session`

#### 图表 2: 日活用户趋势
- **事件**: `[Amplitude] Session Start`
- **测量方式**: `Uniques per day`
- **图表类型**: `Bar Chart`

---

## 🔧 创建步骤（超简化版）

### 创建仪表盘
1. 点击 `Create` → `Dashboard`
2. 输入名称：`基础流量分析`
3. 点击 `Create`

### 添加第一个图表
1. 点击 `Add Chart`
2. 选择 `Event Segmentation`
3. 在事件框输入：`Page Viewed`
4. 选择 `[Amplitude] Page Viewed`
5. 测量方式选择：`Event Totals`
6. 图表类型：`Line Chart`
7. 点击右上角 `Save`

### 批量复制
1. 创建完第一个图表后
2. 点击图表右上角的 `...`
3. 选择 `Duplicate`
4. 修改事件名称
5. 保存

---

## 💡 字段查找技巧

### 如果需要分组，尝试这些属性
1. 在 "Segment by" 框中点击
2. 使用搜索功能输入：
   - `page` - 查找页面相关
   - `text` - 查找文本相关
   - `type` - 查找类型相关
   - `category` - 查找分类相关

### 常见可用属性
Amplitude Autocapture 通常提供：
- `Platform` (Web/iOS/Android)
- `Browser` (Chrome/Safari等)
- `Country` (国家)
- `City` (城市)
- `Device Type` (Desktop/Mobile)
- `OS Version` (操作系统版本)

---

## ⚠️ 注意事项

1. **数据延迟** - 新事件可能需要几分钟才出现在图表中
2. **保存每个图表** - 创建后记得点击 Save
3. **使用默认设置** - 如果不确定字段，使用默认配置

---

## ✅ 完成检查

创建完成后，您应该有：
- [ ] 3个仪表盘
- [ ] 每个仪表盘 3个图表
- [ ] 共 9 个图表
- [ ] 所有图表已保存

---

## 🎉 快速完成提示

1. **从最简单的开始** - 先创建无分组的图表
2. **使用 Duplicate 功能** - 快速复制和修改
3. **数据会自动填充** - 不要担心一开始显示 No data

您的数据已经在流入，现在只需要创建图表容器即可！