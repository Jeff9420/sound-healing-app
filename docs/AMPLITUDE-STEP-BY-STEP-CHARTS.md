# 📊 Amplitude 图表创建详细步骤

**前提：您的 Live Events 已经有数据流入**

---

## 🚀 准备工作

1. **登录 Amplitude**
   - 网址：https://analytics.amplitude.com
   - 确保已选择正确的项目（SoundFlows）

2. **进入仪表盘**
   - 点击左侧菜单 "Dashboards"
   - 找到您的 "内容互动分析 - Content Performance" 仪表盘
   - 点击进入

---

## 📈 图表 1: 页面浏览量趋势

### 步骤 1: 创建新图表
1. 在仪表盘右上角，找到并点击 **"+ Add Chart"** 按钮
2. 如果看不到，查看仪表盘是否有 "Add" 或 "+" 图标

### 步骤 2: 选择图表类型
1. 在弹出的窗口中，选择 **"Event Segmentation"**
2. 这是默认选项，通常在第一个位置

### 步骤 3: 配置事件
1. **Events 部分**：
   - 点击事件选择框（显示 "Select event..."）
   - 在搜索框中输入：`Page Viewed`
   - 从下拉列表选择：`[Amplitude] Page Viewed`
   - 点击事件名称确认选择

2. **Measured as 部分**：
   - 默认应该是 "Uniques" 或 "Event Totals"
   - 选择 **"Event Totals"**（显示总数）

3. **Segment by 部分**：
   - **暂时留空，不设置分组**

4. **Date range 部分**：
   - 选择 **"Last 7 days"** 或 "Last 30 days"

### 步骤 4: 设置图表外观
1. **Chart type**：
   - 选择 **"Line Chart"**（折线图图标）
   - 图标通常像一条波浪线

2. **图表名称**：
   - 在图表顶部或右侧找到名称输入框
   - 输入：`Page Views - 页面浏览量趋势`

### 步骤 5: 保存图表
1. 点击右下角的 **"Save"** 按钮
2. 或点击右上角的 ✓ 图标

---

## 🖱️ 图表 2: 用户点击统计

### 步骤 1: 添加新图表
1. 再次点击 **"+ Add Chart"** 按钮
2. 选择 **"Event Segmentation"**

### 步骤 2: 配置点击事件
1. **Events**：
   - 点击事件选择框
   - 输入：`Element Clicked`
   - 选择：`[Amplitude] Element Clicked`

2. **Measured as**：
   - 选择 **"Event Totals"**

3. **Segment by**：
   - 点击 "+ Segment by"
   - 搜索并尝试：`Element Text`
   - 如果找不到，选择：`Element Type`
   - 如果都没有，**不设置分组**

4. **Chart type**：
   - 选择 **"Bar Chart"**（柱状图图标）

### 步骤 3: 命名和保存
1. 图表名称：`User Clicks - 用户点击统计`
2. 点击 **"Save"**

---

## 🔄 图表 3: 会话分析

### 步骤 1: 添加新图表
1. 点击 **"+ Add Chart"**
2. 选择 **"Event Segmentation"**

### 步骤 2: 配置会话事件
1. **Events**：
   - 选择：`[Amplitude] Session Start`

2. **Measured as**：
   - 选择 **"Uniques"**（唯一用户数）

3. **Group by**：
   - 选择 **"Day"**（按天）

4. **Chart type**：
   - 选择 **"Line Chart"**

### 步骤 3: 命名和保存
1. 图表名称：`Daily Sessions - 日会话统计`
2. 点击 **"Save"**

---

## 📊 图表 4: 滚动深度分布

### 步骤 1: 添加新图表
1. 点击 **"+ Add Chart"**
2. 选择 **"Event Segmentation"**

### 步骤 2: 配置滚动事件
1. **Events**：
   - 输入：`scroll_depth`
   - 选择 `scroll_depth` 事件

2. **Measured as**：
   - 选择 **"Event Totals"**

3. **Segment by**：
   - 尝试搜索：`percentage`
   - 如果找到，选择它
   - 如果找不到，不分组

4. **Chart type**：
   - 选择 **"Bar Chart"**

### 步骤 3: 命名和保存
1. 图表名称：`Scroll Depth - 滚动深度分析`
2. 点击 **"Save"**

---

## 🎬 图表 5: 视频播放统计

### 步骤 1: 添加新图表
1. 点击 **"+ Add Chart"**
2. 选择 **"Event Segmentation"**

### 步骤 2: 配置视频事件
1. **Events**：
   - 输入：`video_play`
   - 选择 `video_play` 事件

2. **Measured as**：
   - 选择 **"Event Totals"**

3. **Segment by**：
   - 尝试搜索：`video_title` 或 `video_id`
   - 如果找不到，不分组

4. **Chart type**：
   - 选择 **"Line Chart"**

### 步骤 3: 命名和保存
1. 图表名称：`Video Plays - 视频播放次数`
2. 点击 **"Save"**

---

## ⏱️ 图表 6: 会话时长分析

### 步骤 1: 添加新图表
1. 点击 **"+ Add Chart"**
2. 选择 **"Event Segmentation"**

### 步骤 2: 配置时长事件
1. **Events**：
   - 选择：`[Amplitude] Session End`

2. **Measured as**：
   - 选择 **"Average"**

3. **Property**：
   - 搜索属性：
     - `Session Length`
     - `duration`
     - `session_duration`
   - 选择找到的属性

4. **Chart type**：
   - 选择 **"Line Chart"**

### 步骤 3: 命名和保存
1. 图表名称：`Session Duration - 平均会话时长`
2. 点击 **"Save"**

---

## 🔍 图表 7: 设备分布

### 步骤 1: 添加新图表
1. 点击 **"+ Add Chart"**
2. 选择 **"Event Segmentation"**

### 步骤 2: 配置设备事件
1. **Events**：
   - 选择：`[Amplitude] Page Viewed`

2. **Measured as**：
   - 选择 **"Uniques"**

3. **Segment by**：
   - 搜索并选择：`Device Type`
   - 或选择：`Platform`

4. **Chart type**：
   - 选择 **"Pie Chart"**

### 步骤 3: 命名和保存
1. 图表名称：`Device Distribution - 设备分布`
2. 点击 **"Save"**

---

## 🌍 图表 8: 用户地理分布

### 步骤 1: 添加新图表
1. 点击 **"+ Add Chart"**
2. 选择 **"Event Segmentation"**

### 步骤 2: 配置地理事件
1. **Events**：
   - 选择：`[Amplitude] Session Start`

2. **Measured as**：
   - 选择 **"Uniques"**

3. **Segment by**：
   - 选择：`Country`

4. **Chart type**：
   - 选择 **"Bar Chart"**

5. **Limit**：
   - 设置为 **"Top 10"**

### 步骤 3: 命名和保存
1. 图表名称：`Top Countries - 用户国家分布`
2. 点击 **"Save"**

---

## 📈 图表 9: 留存分析（如果有）

### 步骤 1: 添加新图表
1. 点击 **"+ Add Chart"**
2. 选择 **"Retention Analysis"**

### 步骤 2: 配置留存
1. **Starting event**：
   - 选择：`[Amplitude] Page Viewed`

2. **Return event**：
   - 选择：`[Amplitude] Session Start`

3. **Retention type**：
   - 选择：`N-Day`

4. **Date range**：
   - 选择：`Last 30 days`

### 步骤 3: 命名和保存
1. 图表名称：`User Retention - 用户留存率`
2. 点击 **"Save"**

---

## ✅ 完成检查

创建完所有图表后，您应该看到：
- 仪表盘上有 9 个图表
- 每个图表都有数据显示（或正在加载数据）
- 所有图表都已保存

## 🔧 故障排除

### 如果找不到特定事件：
1. 检查拼写是否正确
2. 使用部分关键词搜索（如 "page" 而不是 "Page Viewed"）
3. 查看 Live Events 确认确切的事件名称

### 如果图表显示 "No data"：
1. 检查时间范围（改为更长的时间）
2. 确认事件名称正确
3. 等待几分钟让数据更新

### 如果保存失败：
1. 确认图表名称已填写
2. 检查是否有错误提示
3. 刷新页面重试

---

## 💡 提示

1. **数据延迟**：新创建的图表可能需要 1-2 分钟才显示数据
2. **自动保存**：Amplitude 可能会自动保存，但手动保存更保险
3. **批量编辑**：创建后可以点击 "Edit" 修改图表
4. **导出功能**：完成后的仪表盘可以导出为 PDF 或分享链接

您现在可以开始创建这些图表了！记住，您的数据已经在那里，只需要创建图表来展示它们。