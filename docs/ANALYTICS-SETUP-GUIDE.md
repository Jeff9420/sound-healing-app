# Analytics 配置完整指南

本文档提供 Amplitude、GTM 和 GA4 的完整配置步骤。

---

## 📊 Part 1: Amplitude 仪表盘配置

### 前置条件
- ✅ Amplitude API 密钥已配置：`b6c4ebe3ec4d16c8f5fd258d29653cfc`
- ✅ SDK 已集成到 soundflows.app
- ✅ 事件追踪已启用

### 1.1 创建仪表盘 #1：内容互动仪表盘 (Content Performance)

**目标**：追踪用户对内容资源的互动情况

#### 登录 Amplitude
1. 访问 https://analytics.amplitude.com
2. 使用您的账号登录
3. 选择 "SoundFlows" 项目

#### 创建仪表盘
1. 点击左侧菜单 **"Dashboards"**
2. 点击 **"Create Dashboard"**
3. 仪表盘名称：`内容互动分析 - Content Performance`
4. 描述：`追踪用户对内容资源页面的浏览、点击和转化行为`

#### 添加图表 (Charts)

**图表 1: 内容详情页浏览量 (Content Detail Views)**
- 类型：Event Segmentation
- 事件：`content_detail_click`
- 分组依据 (Group By)：`content_category`
- 时间范围：Last 30 days
- 图表类型：Bar Chart

**图表 2: CTA 点击漏斗 (CTA Click Funnel)**
- 类型：Funnel Analysis
- 步骤：
  1. `content_detail_click` (内容详情页浏览)
  2. `content_cta_click` (CTA 按钮点击)
  3. `content_conversion` (转化完成)
- 分组依据：`content_category`
- 转化窗口：24 hours

**图表 3: 滚动深度分布 (Scroll Depth Distribution)**
- 类型：Event Segmentation
- 事件：`scroll_depth`
- 过滤条件：`value >= 75` (只看滚动超过75%的用户)
- 分组依据：`event_label` (25%, 50%, 75%, 90%)
- 图表类型：Line Chart

**图表 4: 内容阶段转化率 (Content Stage Conversion)**
- 类型：Event Segmentation
- 事件：`content_cta_click`
- 分组依据：`content_stage` (discover, consider, decide)
- 显示为：Percentage
- 图表类型：Pie Chart

---

### 1.2 创建仪表盘 #2：线索质量仪表盘 (Lead Quality)

**目标**：追踪表单提交、CRM 状态和自动化流程

#### 创建仪表盘
1. 仪表盘名称：`线索质量分析 - Lead Quality`
2. 描述：`追踪用户提交表单、CRM 状态更新和营销自动化效果`

#### 添加图表

**图表 1: 方案提交漏斗 (Plan Submission Funnel)**
- 类型：Funnel Analysis
- 步骤：
  1. `plan_submit` (表单提交)
  2. `plan_automation_success` (自动化成功)
  3. `plan_submit_success` (提交成功)
- 分组依据：`goal` (用户选择的目标)
- 转化窗口：1 hour

**图表 2: CRM 状态分布 (CRM Status Distribution)**
- 类型：Event Segmentation
- 事件：`plan_submit_success`
- 分组依据：`crm_status` (pending, synced, failed)
- 图表类型：Pie Chart

**图表 3: 资源订阅自动化效果 (Resources Subscribe Automation)**
- 类型：Funnel Analysis
- 步骤：
  1. `resources_subscribe_submit`
  2. `resources_subscribe_automation_success`
  3. `resources_subscribe_success`
- 分组依据：`list_id` 或 `automation_status`

**图表 4: 线索质量评分趋势 (Lead Quality Over Time)**
- 类型：Event Segmentation
- 事件：`plan_submit_success`
- 按时间分组：Daily
- 图表类型：Line Chart
- Y轴：Event count (线索数量)

**图表 5: 目标分布 (Goal Distribution)**
- 类型：Event Segmentation
- 事件：`plan_submit`
- 分组依据：`goal` (better_sleep, reduce_stress, meditation, focus, healing)
- 图表类型：Bar Chart

---

### 1.3 创建仪表盘 #3：用户互动仪表盘 (Engagement)

**目标**：追踪用户与应用功能的互动情况

#### 创建仪表盘
1. 仪表盘名称：`用户互动分析 - User Engagement`
2. 描述：`追踪音频播放、视频背景、功能使用等核心互动指标`

#### 添加图表

**图表 1: 音频播放次数 (Audio Plays)**
- 类型：Event Segmentation
- 事件：`audio_play`
- 分组依据：`audio_category`
- 时间范围：Last 7 days
- 图表类型：Bar Chart

**图表 2: 视频背景互动 (Video Background Engagement)**
- 类型：Event Segmentation
- 事件：选择所有 `video_*` 事件
  - `video_started`
  - `video_loaded`
  - `video_error`
- 图表类型：Stacked Bar Chart

**图表 3: 功能使用热度 (Feature Usage Heatmap)**
- 类型：Event Segmentation
- 事件：选择所有功能事件
  - `theme_change`
  - `language_change`
  - `sleep_timer_set`
  - `share`
- 分组依据：Event type
- 图表类型：Bar Chart

**图表 4: 用户留存率 (User Retention)**
- 类型：Retention Analysis
- 初始事件：First page view
- 返回事件：Any active event
- 时间范围：7-day retention

**图表 5: 自动化成功率 (Automation Success Rate)**
- 类型：Event Segmentation
- 事件：
  - `plan_automation_success`
  - `plan_automation_failure`
  - `resources_subscribe_automation_success`
  - `resources_subscribe_automation_failure`
- 显示为：Percentage
- 图表类型：Pie Chart

---

### 1.4 配置 Amplitude 周报邮件推送

#### 步骤：

1. **进入仪表盘设置**
   - 打开任一仪表盘
   - 点击右上角 "..." 菜单
   - 选择 **"Schedule Email"**

2. **配置邮件推送**
   - 频率：**Weekly** (每周一次)
   - 发送时间：每周一上午 9:00 AM
   - 收件人：添加团队成员邮箱
   - 格式：PDF 或 链接

3. **为每个仪表盘配置周报**
   - 内容互动仪表盘 → 每周一 9:00
   - 线索质量仪表盘 → 每周一 9:30
   - 用户互动仪表盘 → 每周一 10:00

4. **自定义邮件主题**
   - 内容互动：`[SoundFlows] 内容互动周报 - {date}`
   - 线索质量：`[SoundFlows] 线索质量周报 - {date}`
   - 用户互动：`[SoundFlows] 用户互动周报 - {date}`

---

## 🏷️ Part 2: GTM 自定义事件触发器配置

### 前置条件
- GTM 账号：需要访问 Google Tag Manager
- GTM 容器：需要为 soundflows.app 创建 GTM 容器

### 2.1 登录 GTM

1. 访问 https://tagmanager.google.com
2. 选择或创建容器 (Container) for soundflows.app

### 2.2 创建自定义事件触发器

#### 触发器 1: 方案提交事件 (Plan Submit Events)

**创建触发器组：**

1. **Trigger 1.1: plan_submit**
   - 类型：Custom Event
   - 事件名称：`plan_submit`
   - 触发条件：All Custom Events
   - 用途：捕获用户提交方案表单

2. **Trigger 1.2: plan_submit_success**
   - 类型：Custom Event
   - 事件名称：`plan_submit_success`
   - 用途：捕获方案提交成功

3. **Trigger 1.3: plan_automation_success**
   - 类型：Custom Event
   - 事件名称：`plan_automation_success`
   - 用途：捕获自动化流程成功

4. **Trigger 1.4: plan_automation_failure**
   - 类型：Custom Event
   - 事件名称：`plan_automation_failure`
   - 用途：捕获自动化流程失败

#### 触发器 2: 资源订阅事件 (Resources Subscribe Events)

1. **Trigger 2.1: resources_subscribe_submit**
   - 类型：Custom Event
   - 事件名称：`resources_subscribe_submit`

2. **Trigger 2.2: resources_subscribe_success**
   - 类型：Custom Event
   - 事件名称：`resources_subscribe_success`

3. **Trigger 2.3: resources_subscribe_automation_success**
   - 类型：Custom Event
   - 事件名称：`resources_subscribe_automation_success`

4. **Trigger 2.4: resources_subscribe_automation_failure**
   - 类型：Custom Event
   - 事件名称：`resources_subscribe_automation_failure`

#### 触发器 3: 内容互动事件 (Content Engagement Events)

1. **Trigger 3.1: content_detail_click**
   - 类型：Custom Event
   - 事件名称：`content_detail_click`

2. **Trigger 3.2: content_cta_click**
   - 类型：Custom Event
   - 事件名称：`content_cta_click`

3. **Trigger 3.3: content_conversion**
   - 类型：Custom Event
   - 事件名称：`content_conversion`

### 2.3 为每个触发器创建 GA4 事件标签 (Tags)

**示例：为 plan_submit 创建 GA4 事件标签**

1. 点击 **"Tags"** → **"New"**
2. Tag 名称：`GA4 Event - plan_submit`
3. Tag 类型：**Google Analytics: GA4 Event**
4. 配置：
   - Measurement ID: `G-4NZR3HR3J1`
   - Event Name: `plan_submit`
   - Event Parameters (可选):
     - `goal`: `{{DLV - goal}}`
     - `source`: `{{DLV - source}}`
     - `timestamp`: `{{DLV - timestamp}}`
5. 触发条件：选择对应的 Custom Event 触发器
6. 保存

**重复以上步骤，为所有自定义事件创建 GA4 标签**

### 2.4 创建数据层变量 (Data Layer Variables)

为了捕获事件参数，创建以下数据层变量：

1. **DLV - goal**
   - 类型：Data Layer Variable
   - 数据层变量名称：`goal`

2. **DLV - content_category**
   - 类型：Data Layer Variable
   - 数据层变量名称：`content_category`

3. **DLV - crm_status**
   - 类型：Data Layer Variable
   - 数据层变量名称：`crm_status`

4. **DLV - automation_status**
   - 类型：Data Layer Variable
   - 数据层变量名称：`automation_status`

5. **DLV - source**
   - 类型：Data Layer Variable
   - 数据层变量名称：`source`

### 2.5 测试和发布

1. 点击 **"Preview"** 进入预览模式
2. 访问 https://soundflows.app 测试事件触发
3. 在 GTM 调试控制台中验证：
   - 触发器正确触发
   - 数据层变量正确捕获
   - GA4 事件标签正确发送
4. 测试通过后，点击 **"Submit"** 发布容器
5. 版本名称：`v1.0 - 添加自定义事件追踪`

---

## 📈 Part 3: GA4 自定义维度和报表配置

### 3.1 添加自定义维度 (Custom Dimensions)

#### 登录 GA4

1. 访问 https://analytics.google.com
2. 选择属性：SoundFlows (Measurement ID: G-4NZR3HR3J1)

#### 创建自定义维度

1. 点击 **"Configure"** → **"Custom definitions"**
2. 点击 **"Create custom dimension"**

**维度 1: content_category (内容类别)**
- 维度名称：`content_category`
- 范围 (Scope)：Event
- 描述：`内容资源的分类 (docs, guides, whitepapers)`
- 事件参数：`content_category`

**维度 2: goal (用户目标)**
- 维度名称：`goal`
- 范围：Event
- 描述：`用户选择的疗愈目标`
- 事件参数：`goal`

**维度 3: crm_status (CRM 状态)**
- 维度名称：`crm_status`
- 范围：Event
- 描述：`CRM 同步状态 (pending, synced, failed)`
- 事件参数：`crm_status`

**维度 4: automation_status (自动化状态)**
- 维度名称：`automation_status`
- 范围：Event
- 描述：`营销自动化状态 (pending, success, failed)`
- 事件参数：`automation_status`

### 3.2 创建 GA4 探索报表 (Exploration Reports)

#### 报表 1: 内容互动漏斗 (Content Engagement Funnel)

1. 点击 **"Explore"** → **"Blank"**
2. 报表名称：`内容互动转化漏斗`
3. 类型：**Funnel exploration**
4. 配置步骤：
   - Step 1: `content_detail_click` (内容详情页浏览)
   - Step 2: `content_cta_click` (CTA 点击)
   - Step 3: `content_conversion` (转化完成)
5. 细分维度：`content_category`, `goal`
6. 保存到库

#### 报表 2: 线索质量分析 (Lead Quality Analysis)

1. 类型：**Free form**
2. 报表名称：`线索质量分析`
3. 维度：
   - `goal` (用户目标)
   - `crm_status` (CRM 状态)
   - `automation_status` (自动化状态)
4. 指标：
   - `Event count` (事件数量)
   - `Conversions` (转化次数)
5. 行：`goal`
6. 列：`crm_status`
7. 值：`Event count`

#### 报表 3: 用户旅程分析 (User Journey)

1. 类型：**Path exploration**
2. 报表名称：`用户互动路径`
3. 起始点：`page_view`
4. 探索路径：
   - `scroll_depth`
   - `content_detail_click`
   - `content_cta_click`
   - `plan_submit`
5. 节点类型：Event name
6. 最大步数：5

### 3.3 创建自定义报表集合

1. 点击 **"Reports"** → **"Library"**
2. 点击 **"Create new report"**
3. 报表集合名称：`SoundFlows 内容营销分析`

**添加报表卡片：**

**卡片 1: 内容分类表现**
- 维度：`content_category`
- 指标：
  - `content_detail_click` (浏览量)
  - `content_cta_click` (CTA 点击)
  - Conversion rate (转化率)

**卡片 2: 目标分布**
- 维度：`goal`
- 指标：`plan_submit` 事件数量
- 图表类型：Pie chart

**卡片 3: CRM 同步状态**
- 维度：`crm_status`
- 指标：`plan_submit_success` 数量
- 图表类型：Bar chart

**卡片 4: 自动化成功率**
- 维度：`automation_status`
- 指标：Event count
- 计算字段：成功率 = success_count / total_count

---

## ✅ 验证检查清单

### Amplitude 验证
- [ ] 3 个仪表盘已创建
- [ ] 每个仪表盘包含 4-5 个图表
- [ ] 周报邮件已配置（每周一发送）
- [ ] 收到第一封测试邮件

### GTM 验证
- [ ] 所有自定义事件触发器已创建
- [ ] 每个触发器关联了 GA4 事件标签
- [ ] 数据层变量已配置
- [ ] 预览模式测试通过
- [ ] 容器已发布

### GA4 验证
- [ ] 4 个自定义维度已创建
- [ ] 3 个探索报表已创建
- [ ] 自定义报表集合已创建
- [ ] 数据正确显示在报表中

---

## 🎯 预期结果

完成以上配置后，您将获得：

1. **Amplitude**：
   - 3 个实时更新的仪表盘
   - 每周自动发送的数据报告
   - 完整的事件追踪和漏斗分析

2. **GTM**：
   - 自动捕获所有自定义事件
   - 事件数据自动发送到 GA4
   - 灵活的标签管理系统

3. **GA4**：
   - 4 个自定义维度用于深度分析
   - 3 个探索报表用于数据可视化
   - 自定义报表集合用于日常监控

---

## 📚 参考文档

- Amplitude Dashboard Guide: https://help.amplitude.com/hc/en-us/articles/360046052632
- GTM Custom Events: https://support.google.com/tagmanager/answer/7679219
- GA4 Custom Dimensions: https://support.google.com/analytics/answer/10075209
- AMPLITUDE-FUNNEL-PLAYBOOK.md: 项目中的详细漏斗配置指南

---

**创建日期**: 2025-10-17
**更新日期**: 2025-10-17
**维护者**: SoundFlows Analytics Team
