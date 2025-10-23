# HubSpot Workflow 创建详细指南

## 概述

本指南将帮助您创建两个关键的 HubSpot Workflow：
1. **7 日冥想计划自动化** - 发送系列冥想指导邮件
2. **资源订阅自动化** - 发送欢迎邮件和资源更新

## 准备工作

### 1. 登录 HubSpot
访问：[https://app.hubspot.com](https://app.hubspot.com)
确保您有 Marketing Hub Starter 或更高版本

### 2. 检查表单
确保您的两个表单已存在：
- 冥想计划表单（GUID: ec666460-ee7c-4057-97a6-d6f1fdd9c061）
- 资源订阅表单（GUID: ce1bb1ff-0230-4f9b-bf4c-ea92ca4962f4）

---

## 创建 7 日冥想计划 Workflow

### 步骤 1: 创建新 Workflow

1. **导航到 Automation**
   - 在左侧菜单点击 **Automation**
   - 点击 **Workflows**

2. **创建新 Workflow**
   - 点击右上角 **"Create workflow"**
   - 选择 **"Contact-based"**（从右侧创建）
   - 点击 **"Next"**

3. **设置基本信息**
   - Workflow 名称：`7 日冥想计划自动化`
   - 描述：`为申请7日冥想计划的用户发送系列指导邮件`
   - 点击 **"Next"**

### 步骤 2: 设置触发条件

1. **选择触发类型**
   - 点击 **"Set enrollment triggers"**

2. **添加表单提交条件**
   - 点击 **"AND"**
   - 选择 **"Form submission"**
   - 选择您的冥想计划表单（如果看不到，搜索表单名称）

3. **添加目标条件**（可选但推荐）
   - 点击 **"AND"**
   - 选择 **"Contact property"**
   - 选择 **"meditation_goal"**
   - 设置 **"is known"**

4. **点击 "Save"**

### 步骤 3: 创建 Day 0 动作

1. **立即执行动作**
   - 点击 **"Add action"**
   - 选择 **"Internal notification"**
   - 配置通知：
     - 收件人：您的邮箱
     - 标题：`新的冥想计划申请`
     - 内容：`{{contact.firstname}} 申请了7日冥想计划，目标：{{contact.meditation_goal}}`

2. **添加第一个邮件**
   - 点击 **"Add action"**
   - 选择 **"Send email"**
   - 选择 **"Create marketing email"**

3. **配置 Day 0 邮件**
   ```
   邮件名称：Day 0 - 欢迎邮件
   主题：✨ 您的7日冥想计划已准备就绪 - SoundFlows

   邮件内容（使用 HubSpot 邮件编辑器）：

   嗨 {{contact.firstname}}，

   感谢您申请 SoundFlows 的7日定制冥想计划！

   📋 您的计划概览：
   • 目标：{{contact.meditation_goal}}
   • 每日时长：{{contact.preferred_time}}
   • 开始日期：今天

   🎵 明天开始，您将收到：
   • 个性化的冥想音频推荐
   • 每日练习指引
   • 进度跟踪技巧

   📌 重要提醒：
   • 每天只需 10-20 分钟
   • 建议固定时间练习
   • 保持记录和反思

   准备好开始您的冥想之旅了吗？

   祝好，
   SoundFlows 团队

   [访问 SoundFlows 开始冥想](https://soundflows.app)
   ```

4. **设置发送时间**
   - 选择 **"Immediately"**
   - 点击 **"Save"**

### 步骤 4: 创建 Day 1-7 动作

#### Day 1 - 等待 1 天
1. **添加延迟**
   - 点击 **"Add action"**
   - 选择 **"Delay"**
   - 设置 **"Wait 1 day"**

2. **添加邮件**
   ```
   邮件名称：Day 1 - 开始您的冥想之旅
   主题：🧘‍♀️ Day 1：{{contact.firstname}}，让我们开始冥想吧！

   邮件内容：

   早上好 {{contact.firstname}}，

   欢迎来到您冥想之旅的第一天！

   🎯 今日重点：
   根据您的目标（{{contact.meditation_goal}}），我们推荐您从以下音频开始：

   {% if contact.meditation_goal == "sleep" %}
   • 推荐音频：雨声助眠
   • 练习时长：{{contact.preferred_time}}
   • 最佳时间：睡前 30 分钟
   {% elif contact.meditation_goal == "stress" %}
   • 推荐音频：深度放松引导
   • 练习时长：{{contact.preferred_time}}
   • 最佳时间：下班后
   {% elif contact.meditation_goal == "focus" %}
   • 推荐音频：专注力提升
   • 练习时长：{{contact.preferred_time}}
   • 最佳时间：工作前
   {% else %}
   • 推荐音频：正念冥想入门
   • 练习时长：{{contact.preferred_time}}
   • 最佳时间：任何您喜欢的时间
   {% endif %}

   💡 今日小贴士：
   • 找一个安静的空间
   • 设置手机静音
   • 舒适坐姿或躺下

   [立即开始今日冥想](https://soundflows.app)

   明天见！
   SoundFlows 团队
   ```

#### Day 2 - 等待 1 天
1. **添加延迟**：Wait 1 day
2. **添加邮件**：
   ```
   邮件名称：Day 2 - 建立习惯
   主题：📈 Day 2：{{contact.firstname}}，习惯正在形成中！

   邮件内容：

   嗨 {{contact.firstname}}，

   恭喜您完成了第二天的练习！

   🌟 今日进展：
   • 您已经坚持了 2 天
   • 身体正在适应冥想节奏
   • 内心的平静正在积累

   🎵 今日推荐：
   • 继续昨天的音频，或尝试新的：颂钵音疗
   • 颂钵有助于清理能量，提升专注

   ✍️ 今日反思：
   今天的冥想有什么不同的感受？
   您注意到哪些变化？

   [继续您的冥想之旅](https://soundflows.app)

   加油！
   SoundFlows 团队
   ```

#### Day 3 - 等待 1 天
1. **添加延迟**：Wait 1 day
2. **添加邮件**：中期检查，内容关于进展和调整建议

#### Day 4-6 - 每天等待 1 天
- Day 4：深入练习技巧
- Day 5：克服挑战
- Day 6：持续进步

#### Day 7 - 等待 1 天
1. **添加延迟**：Wait 1 day
2. **添加邮件**：
   ```
   邮件名称：Day 7 - 完成与展望
   主题：🎉 恭喜 {{contact.firstname}}！您完成了7日冥想计划！

   邮件内容：

   亲爱的 {{contact.firstname}}，

   🎊 恭喜您！您已经完成了7日冥想计划！

   🏆 您的成就：
   • 连续冥想 7 天
   • 总练习时长：约 {{contact.preferred_time}} × 7
   • 建立了冥想习惯

   📊 接下来可以：
   • 继续每日冥想（推荐）
   • 尝试不同类型的音频
   • 加入我们的冥想社区

   🎁 特别礼物：
   您已获得 SoundFlows 高级用户身份，可访问所有冥想资源！

   [探索更多冥想资源](https://soundflows.app)

   感谢您的信任和坚持！
   SoundFlows 团队
   ```

### 步骤 5: 激活 Workflow

1. **检查所有步骤**
   - 确认所有动作都已添加
   - 检查邮件内容
   - 测试发送逻辑

2. **设置激活选项**
   - **Enrollment**：保持默认
   - **Unenrollment**：无需设置
   - **Suppression**：无需设置

3. **测试 Workflow**
   - 点击右上角 **"Test"**
   - 使用测试联系人测试
   - 确认邮件正常发送

4. **激活**
   - 点击右上角 **"Review and publish"**
   - 检查所有设置
   - 点击 **"Turn on"**

---

## 创建资源订阅 Workflow

### 步骤 1: 创建 Workflow

1. **名称**：`资源订阅欢迎自动化`
2. **类型**：Contact-based

### 步骤 2: 设置触发条件

1. **触发**：Form submission
2. **选择**：资源订阅表单

### 步骤 3: 添加动作

```
邮件名称：欢迎订阅 SoundFlows 资源
主题：📚 欢迎！您的声音疗愈资源已备好

邮件内容：

嗨 {{contact.firstname}},

感谢您订阅 SoundFlows 的资源更新！

🎁 您可以立即访问：
• 213+ 免费疗愈音频
• 9 大音频分类
• 个性化播放列表
• 睡眠定时器
• 混音功能

🌟 推荐先体验：
1. 雨声助眠 - 改善睡眠质量
2. 颂钵音疗 - 平衡能量
3. 自然音效 - 缓解压力

[立即开始探索](https://soundflows.app)

我们会定期向您发送：
• 新音频推荐
• 冥想技巧分享
• 限时优惠活动

祝您有美好的冥想体验！
SoundFlows 团队
```

### 步骤 4: 激活 Workflow

同样的流程，测试并激活。

---

## 故障排除

### 邮件未发送

1. **检查联系人状态**
   - 确认联系人不是 "Unsubscribed"
   - 确认邮箱格式正确

2. **检查邮件配额**
   - Marketing Hub Starter: 2000邮件/月
   - 查看已使用数量

3. **检查 Workflow 设置**
   - 确认 Workflow 已激活
   - 确认触发条件正确

### 表单提交未触发

1. **检查表单设置**
   - 确认表单已发布
   - 确认表单 GUID 正确

2. **检查字段映射**
   - 确认 meditation_goal 字段存在
   - 确认 preferred_time 字段存在

### HubSpot 个性化字段

在邮件中使用这些变量：

```html
{{contact.firstname}} - 名字
{{contact.lastname}} - 姓氏
{{contact.email}} - 邮箱
{{contact.meditation_goal}} - 冥想目标
{{contact.preferred_time}} - 偏好时间
{{contact.lifecyclestage}} - 生命周期阶段
{{contact.utm_source}} - 来源
{{contact.utm_medium}} - 媒介
{{contact.utm_campaign}} - 活动
```

## 邮件模板复制粘贴

我已经创建了 7 天的邮件模板，您可以直接：
1. 复制每个邮件的内容
2. 粘贴到 HubSpot 邮件编辑器
3. 根据需要调整

## 测试建议

1. **使用自己邮箱测试**
   - 填写表单
   - 观察是否收到邮件
   - 检查邮件内容是否正确

2. **使用测试联系人**
   - 在 HubSpot 创建测试联系人
   - 手动注册到 Workflow
   - 查看执行情况

3. **监控执行**
   - 查看 Workflow 活动历史
   - 检查失败原因
   - 优化邮件内容

---

## 需要帮助？

如果您在创建过程中遇到问题：
1. HubSpot 帮助中心：https://help.hubspot.com/
2. Workflow 指南：https://help.hubspot.com/en-us/article/workflows
3. 随时告诉我具体问题，我可以提供更详细的帮助

---

**最后更新**: 2025-10-23
**版本**: 1.0.0