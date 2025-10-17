# 📊 Amplitude 仪表盘设置 - 详细操作指南

**适用于**: SoundFlows 声音疗愈平台
**预计时间**: 30-45 分钟
**难度**: ⭐⭐☆☆☆ 简单

---

## 🎯 目标

创建 3 个核心仪表盘：
1. **内容互动仪表盘** - 追踪用户对内容的浏览和点击
2. **线索质量仪表盘** - 追踪表单提交和转化
3. **用户互动仪表盘** - 追踪音频播放和功能使用

---

## ⚠️ 开始前的重要说明

### 关于数据显示

**目前状态**: 您的仪表盘可能显示 "No data"（没有数据）

**原因**:
- Amplitude SDK 已正确部署 ✅
- 但需要等待真实用户访问网站
- 广告拦截器会阻止 30-50% 的用户数据

**不用担心**:
- ✅ 您可以**先创建所有仪表盘和图表**
- ✅ 一旦有数据进入，图表会**自动填充**
- ✅ 仪表盘结构和配置会保存

---

## 📋 仪表盘 1: 内容互动分析

### 步骤 1: 创建仪表盘

1. **点击页面顶部的蓝色 "Create" 按钮**
2. 在下拉菜单中选择 **"Dashboard"**
3. 在弹出的对话框中：
   - **Name（名称）**: 输入 `内容互动分析 - Content Performance`
   - **Description（描述）**: `追踪用户对内容资源的浏览、点击和转化行为`
4. 点击 **"Create"** 或 **"创建"** 按钮

---

### 步骤 2: 添加图表 1 - 页面浏览量

1. 在新创建的仪表盘中，点击 **"Add Chart"** 按钮
2. 选择图表类型：**"Event Segmentation"**（事件细分）
3. 配置图表：

   **左侧配置区域**:
   - **Events（事件）**:
     - 点击事件下拉框
     - 选择 `[Amplitude] Page Viewed` 或搜索 "page"
     - （如果没有这个事件，输入 `page_view`）

   - **Measured as（测量方式）**:
     - 选择 `Uniques` 或 `Event Totals`

   - **Segment by（分组依据）**:
     - 点击 "+ Segment by"
     - 选择 `Page URL` 或 `Page Path`

   - **Date range（日期范围）**:
     - 选择 `Last 30 days`

4. **右上角**输入图表名称：`页面浏览量 - Page Views`
5. 点击 **"Save"** 保存图表

---

### 步骤 3: 添加图表 2 - 元素点击分布

1. 点击 **"Add Chart"** 按钮
2. 选择图表类型：**"Event Segmentation"**
3. 配置图表：

   - **Events**: 选择 `[Amplitude] Element Clicked` 或搜索 "click"
   - **Measured as**: `Event Totals`
   - **Segment by**: 选择 `Element Text` 或 `Element Type`
   - **Chart type（图表类型）**: 切换到 `Bar Chart`（柱状图）

4. 图表名称：`元素点击分布 - Element Clicks`
5. 点击 **"Save"**

---

### 步骤 4: 添加图表 3 - 表单交互漏斗

1. 点击 **"Add Chart"**
2. 选择图表类型：**"Funnel Analysis"**（漏斗分析）
3. 配置漏斗步骤：

   **Step 1（步骤1）**:
   - Event: `[Amplitude] Page Viewed`
   - 点击 "+ where" 添加过滤条件
   - 选择 `Page URL` → `contains` → 输入 `conversionOffer` 或 `plan`

   **Step 2（步骤2）**:
   - 点击 "+ Add Step"
   - Event: `[Amplitude] Element Clicked`
   - 过滤: `Element Text` → `contains` → `提交` 或 `submit`

   **Step 3（步骤3）**:
   - 点击 "+ Add Step"
   - Event: `plan_submit_success`（如果有数据）

   - **Conversion window（转化窗口）**: `24 hours`

4. 图表名称：`表单提交漏斗 - Form Submission Funnel`
5. 点击 **"Save"**

---

### 步骤 5: 添加图表 4 - 会话时长分布

1. 点击 **"Add Chart"**
2. 选择图表类型：**"Event Segmentation"**
3. 配置：

   - **Events**: `[Amplitude] Session End`
   - **Measured as**: `Average`
   - **Property**: `Session Length` 或 `Duration`
   - **Chart type**: `Line Chart`（折线图）
   - **Date range**: `Last 7 days`

4. 图表名称：`平均会话时长 - Avg Session Duration`
5. 点击 **"Save"**

---

## 📋 仪表盘 2: 线索质量分析

### 步骤 1: 创建第二个仪表盘

1. 点击左侧菜单的 **"Home"** 返回主页
2. 点击顶部 **"Create"** → **"Dashboard"**
3. 配置：
   - **Name**: `线索质量分析 - Lead Quality`
   - **Description**: `追踪表单提交、CRM状态和营销自动化效果`
4. 点击 **"Create"**

---

### 步骤 2: 添加图表 1 - 表单提交趋势

1. 点击 **"Add Chart"**
2. 类型：**"Event Segmentation"**
3. 配置：

   - **Events**:
     - 输入 `plan_submit` 或搜索 "submit"
     - （如果没有，使用 `[Amplitude] Element Clicked` + 过滤 submit 按钮）
   - **Measured as**: `Event Totals`
   - **Segment by**: `Date`（按日期）
   - **Chart type**: `Line Chart`
   - **Date range**: `Last 30 days`

4. 图表名称：`表单提交趋势 - Form Submissions Over Time`
5. 点击 **"Save"**

---

### 步骤 3: 添加图表 2 - 目标分布

1. 点击 **"Add Chart"**
2. 类型：**"Event Segmentation"**
3. 配置：

   - **Events**: `plan_submit`
   - **Measured as**: `Event Totals`
   - **Segment by**:
     - 点击 "+ Segment by"
     - 选择 `goal` 属性
     - （如果没有，使用 `Form Field Value`）
   - **Chart type**: `Pie Chart`（饼图）

4. 图表名称：`用户目标分布 - Goal Distribution`
5. 点击 **"Save"**

---

### 步骤 4: 添加图表 3 - 转化漏斗

1. 点击 **"Add Chart"**
2. 类型：**"Funnel Analysis"**
3. 配置步骤：

   - **Step 1**: `[Amplitude] Page Viewed` + 过滤包含 "plan" 或 "conversion"
   - **Step 2**: `plan_submit`
   - **Step 3**: `plan_automation_success`
   - **Step 4**: `plan_submit_success`
   - **Conversion window**: `1 hour`

4. 图表名称：`方案提交转化漏斗 - Plan Submission Funnel`
5. 点击 **"Save"**

---

### 步骤 5: 添加图表 4 - 提交成功率

1. 点击 **"Add Chart"**
2. 类型：**"Event Segmentation"**
3. 配置：

   - **Events**:
     - 添加 `plan_submit` （事件1）
     - 点击 "+ Add Event" 添加 `plan_submit_success` （事件2）
   - **Measured as**: `Event Totals`
   - **Formula（公式）**:
     - 点击 "Formula" 或 "计算"
     - 输入: `(B/A)*100` （B是成功数，A是提交数）
   - **Chart type**: `Bar Chart`

4. 图表名称：`表单提交成功率 - Submission Success Rate`
5. 点击 **"Save"**

---

## 📋 仪表盘 3: 用户互动分析

### 步骤 1: 创建第三个仪表盘

1. 返回主页 **"Home"**
2. 点击 **"Create"** → **"Dashboard"**
3. 配置：
   - **Name**: `用户互动分析 - User Engagement`
   - **Description**: `追踪音频播放、视频背景、功能使用等核心互动`
4. 点击 **"Create"**

---

### 步骤 2: 添加图表 1 - 按钮点击热度

1. 点击 **"Add Chart"**
2. 类型：**"Event Segmentation"**
3. 配置：

   - **Events**: `[Amplitude] Element Clicked`
   - **Measured as**: `Event Totals`
   - **Segment by**: `Element Text` 或 `Button Text`
   - **Chart type**: `Bar Chart`
   - **Sort by（排序）**: `Descending`（降序）
   - **Limit（限制）**: `Top 10`

4. 图表名称：`按钮点击热度 Top 10 - Top Button Clicks`
5. 点击 **"Save"**

---

### 步骤 3: 添加图表 2 - 用户留存率

1. 点击 **"Add Chart"**
2. 类型：**"Retention Analysis"**（留存分析）
3. 配置：

   - **Starting event（初始事件）**: `[Amplitude] Page Viewed`
   - **Return event（返回事件）**: `[Amplitude] Session Start` 或 `Any Active Event`
   - **Retention type（留存类型）**: `N-Day` 或 `Rolling`
   - **Date range**: `Last 30 days`

4. 图表名称：`用户留存率 - User Retention`
5. 点击 **"Save"**

---

### 步骤 4: 添加图表 3 - 性能指标 (Web Vitals)

1. 点击 **"Add Chart"**
2. 类型：**"Event Segmentation"**
3. 配置：

   - **Events**: 搜索 `Web Vitals` 相关事件
     - `[Amplitude] LCP` (Largest Contentful Paint)
     - 或 `performance` 相关事件
   - **Measured as**: `Average`
   - **Property**: `Value` 或 `Metric Value`
   - **Chart type**: `Line Chart`

4. 图表名称：`页面性能指标 - Web Performance`
5. 点击 **"Save"**

---

### 步骤 5: 添加图表 4 - 挫败行为检测

1. 点击 **"Add Chart"**
2. 类型：**"Event Segmentation"**
3. 配置：

   - **Events**:
     - 搜索 `Rage Click` 或 `Dead Click`
     - 如果没有，使用 `[Amplitude] Element Clicked` + 过滤快速重复点击
   - **Measured as**: `Event Totals`
   - **Segment by**: `Page URL`
   - **Chart type**: `Bar Chart`

4. 图表名称：`用户挫败行为 - Frustration Interactions`
5. 点击 **"Save"**

---

## ⚙️ 配置周报邮件推送

完成所有仪表盘后，为每个仪表盘配置自动邮件：

### 对于每个仪表盘：

1. **打开仪表盘**
2. **点击右上角的 "..." (三个点) 菜单**
3. 选择 **"Schedule"** 或 **"Schedule Email"**
4. 配置：
   - **Frequency（频率）**: `Weekly`（每周）
   - **Day（星期几）**: `Monday`（星期一）
   - **Time（时间）**: `9:00 AM`
   - **Recipients（收件人）**: 添加您的邮箱
   - **Format（格式）**: `PDF` 或 `Link`
5. 点击 **"Save"** 或 **"Schedule"**

重复以上步骤为 3 个仪表盘都配置周报。

---

## ✅ 完成检查清单

创建完成后，检查以下项目：

- [ ] 仪表盘 1: 内容互动分析 - 4 个图表
- [ ] 仪表盘 2: 线索质量分析 - 4 个图表
- [ ] 仪表盘 3: 用户互动分析 - 4 个图表
- [ ] 周报邮件 1: 内容互动 - 每周一 9:00
- [ ] 周报邮件 2: 线索质量 - 每周一 9:30
- [ ] 周报邮件 3: 用户互动 - 每周一 10:00

---

## 🔍 验证数据流入

### 查看实时事件

1. 点击左侧菜单 **"Live Events"**
2. 您应该能看到事件实时流入（当有用户访问时）
3. 常见的 Amplitude autocapture 事件：
   - `[Amplitude] Page Viewed`
   - `[Amplitude] Session Start`
   - `[Amplitude] Session End`
   - `[Amplitude] Element Clicked`
   - `[Amplitude] Form Submitted`

### 如果没有数据显示

**原因**:
- 还没有真实用户访问（或都被广告拦截器阻止了）
- 需要等待一段时间

**解决方案**:
1. ✅ 仪表盘已经创建好，会自动填充数据
2. ✅ 分享网站链接给朋友，请他们访问（用手机）
3. ✅ 在社交媒体分享，增加访问量
4. ✅ 耐心等待，通常 24-48 小时会有数据

---

## 💡 小贴士

### 自定义事件追踪

如果您想追踪特定的自定义事件（如 `audio_play`, `plan_submit`），这些事件会由网站代码自动发送。您在创建图表时可以：

1. 在 Events 下拉框中搜索事件名称
2. 或直接输入事件名称（如 `plan_submit`）
3. Amplitude 会自动识别并显示这些事件

### 图表编辑

创建后的图表可以随时编辑：
1. 点击图表右上角的 "..." 菜单
2. 选择 **"Edit"**
3. 修改配置后点击 **"Save"**

### 仪表盘共享

您可以与团队成员共享仪表盘：
1. 打开仪表盘
2. 点击右上角的 **"Share"** 按钮
3. 添加成员邮箱或生成共享链接

---

## 🎉 恭喜！

您已经完成了 Amplitude 的完整配置！

**接下来**:
- ✅ 等待数据流入（24-48小时）
- ✅ 每周一接收自动邮件报告
- ✅ 随时登录 Amplitude 查看实时数据

---

## 📞 需要帮助？

如果在设置过程中遇到问题：
1. 参考 `docs/ANALYTICS-SETUP-GUIDE.md` 中的详细说明
2. 访问 Amplitude 帮助中心: https://help.amplitude.com
3. 或查看 Amplitude 官方文档: https://docs.developers.amplitude.com

---

**创建日期**: 2025-10-17
**维护者**: SoundFlows Analytics Team
