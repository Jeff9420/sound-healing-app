# 📧 HubSpot 邮件自动化设置指南

**目标**: 在用户提交表单后自动发送欢迎邮件和 7 日邮件序列

---

## 🎯 当前状态

✅ **已完成**: 表单数据保存到 HubSpot CRM
❌ **未完成**: 自动发送邮件

**原因**: HubSpot 需要单独配置 Workflow 才会发送邮件

---

## 📋 设置步骤

### 第 1 步: 验证联系人是否创建成功

1. 登录 HubSpot: https://app.hubspot.com
2. 导航到 **Contacts** → **Contacts**
3. 搜索测试邮箱: `test@soundflows.app`
4. 确认联系人已创建

**如果没有找到联系人**,说明表单提交有问题,需要:
- 检查浏览器控制台是否有错误
- 查看网络请求是否成功 (应该是 HTTP 200)
- 确认 Portal ID 和 Form GUID 正确

---

### 第 2 步: 创建欢迎邮件模板

1. 导航到 **Marketing** → **Email**
2. 点击 **Create email** → **Regular**
3. 选择模板或从空白开始

**邮件配置**:
- **Email name**: 7 日冥想计划 - 欢迎邮件
- **Subject**: 🎉 欢迎开启你的 7 日声音疗愈之旅
- **Sender name**: SoundFlows 团队
- **Sender email**: 你的邮箱 (需要在 HubSpot 中验证)

**邮件内容** (参考 `docs/EMAIL-TEMPLATES.md` 的 Day 0):

```html
Hi {{contact.firstname}},

感谢加入 SoundFlows 的 7 日定制冥想计划！

我们已根据你的目标「{{contact.meditation_goal}}」为你准备了专属的声音疗愈方案。

## 🎯 你的冥想目标
{{contact.meditation_goal}}

## ⏰ 建议练习时间
{{contact.preferred_time}}

## 📅 接下来 7 天的安排
- Day 1: 认识你的呼吸
- Day 2: 身体扫描放松
- Day 3: 声音疗愈入门
- Day 4: 情绪观察练习
- Day 5: 深度冥想体验
- Day 6: 能量平衡调整
- Day 7: 整合与回顾

明天你将收到第一天的练习指引。

祝你旅途愉快！

SoundFlows 团队
https://soundflows.app
```

4. 点击 **Save** 保存邮件

---

### 第 3 步: 创建 Workflow 自动化

1. 导航到 **Automation** → **Workflows**
2. 点击 **Create workflow** → **From scratch**
3. 选择 **Contact-based**
4. Workflow name: `7 日冥想计划邮件序列`

**设置触发条件**:
1. 点击 **Set up triggers**
2. 选择 **Form submission**
3. 选择你的表单 (Form GUID: ec666460-ee7c-4057-97a6-d6f1fdd9c061)
4. 点击 **Save**

**添加 Day 0 邮件**:
1. 点击 **+** 添加动作
2. 选择 **Send email**
3. 选择刚才创建的欢迎邮件
4. 点击 **Save**

**添加 Day 1 邮件**:
1. 点击欢迎邮件下方的 **+**
2. 选择 **Delay**
3. 设置延迟时间: **1 day**
4. 点击 **Save**
5. 点击延迟下方的 **+**
6. 选择 **Send email**
7. 创建或选择 Day 1 邮件 (参考 `docs/EMAIL-TEMPLATES.md`)
8. 点击 **Save**

**重复添加 Day 2-7 邮件**:
- 每个邮件前添加 1 天延迟
- 总共 8 封邮件 (Day 0 到 Day 7)

**激活 Workflow**:
1. 点击右上角 **Review and publish**
2. 检查设置
3. 点击 **Turn on**

---

### 第 4 步: 测试邮件发送

**重要**: 删除之前的测试联系人,重新提交表单测试

1. 在 HubSpot Contacts 中删除 `test@soundflows.app`
2. 访问 https://soundflows.app
3. 重新提交 7 日冥想计划表单
4. 使用**真实邮箱**测试 (你能收到邮件的邮箱)
5. 检查邮箱,应该会收到欢迎邮件

**验证 Workflow 是否运行**:
1. 回到 HubSpot → **Automation** → **Workflows**
2. 点击你的 workflow
3. 查看 **Enrollment history** 标签
4. 应该能看到新联系人已加入流程

---

## 🚀 简化方案: 只发送欢迎邮件

如果你只想先测试欢迎邮件,可以简化步骤:

### 快速设置 (5 分钟)

1. **创建简单邮件模板**
   - Marketing → Email → Create email
   - Subject: `欢迎加入 SoundFlows 7 日冥想计划`
   - 内容:
     ```
     Hi {{contact.firstname}},

     感谢加入 SoundFlows!

     我们已收到你的申请,接下来 7 天你将收到每日练习指引。

     祝你旅途愉快!
     ```

2. **创建简单 Workflow**
   - Automation → Workflows → Create workflow
   - Contact-based
   - Trigger: Form submission (选择你的表单)
   - Action: Send email (选择刚创建的邮件)
   - Turn on

3. **测试**
   - 删除之前的测试联系人
   - 使用真实邮箱重新提交表单
   - 查看邮箱

---

## 📊 查看邮件发送统计

### Workflow 执行日志
1. Automation → Workflows
2. 点击你的 workflow
3. 查看标签:
   - **Enrollment history** - 谁被加入了流程
   - **Performance** - 邮件打开率、点击率

### 邮件统计
1. Marketing → Email
2. 点击邮件名称
3. 查看:
   - Sent (发送数)
   - Open rate (打开率)
   - Click rate (点击率)

---

## 🐛 常见问题

### Q: 为什么没有收到邮件?

**检查清单**:
- [ ] Workflow 已激活 (状态显示 "On")
- [ ] 联系人已加入 Workflow (查看 Enrollment history)
- [ ] 发件人邮箱已在 HubSpot 中验证
- [ ] 检查垃圾邮件文件夹
- [ ] 邮件模板已保存并发布

### Q: Workflow 显示 "Suppressed"

**原因**: 联系人之前取消订阅或邮箱无效

**解决方案**:
1. 检查联系人的 Email status
2. 如果是测试,手动更新状态为 "Active"

### Q: 使用个性化字段但显示空白

**原因**: 自定义字段名称不匹配

**解决方案**:
1. 检查字段名称是否正确:
   - `{{contact.firstname}}` - 名
   - `{{contact.lastname}}` - 姓
   - `{{contact.meditation_goal}}` - 冥想目标
   - `{{contact.preferred_time}}` - 偏好时间
2. 确认 HubSpot 中已创建这些自定义字段
3. 确认表单提交时正确填充了这些字段

---

## 📝 完整 7 日邮件模板

参考文件: `docs/EMAIL-TEMPLATES.md`

包含:
- Day 0: 欢迎邮件
- Day 1: 认识你的呼吸
- Day 2: 身体扫描放松
- Day 3: 声音疗愈入门
- Day 4: 情绪观察练习
- Day 5: 深度冥想体验
- Day 6: 能量平衡调整
- Day 7: 整合与回顾

每封邮件包含:
- 个性化问候
- 当日主题
- 音频推荐
- 练习步骤
- 鼓励和提示

---

## 🎓 HubSpot 邮件最佳实践

### 1. 发件人设置
- 使用你的真实邮箱作为发件人
- 在 HubSpot → Settings → Email → Sender 中验证邮箱
- 使用统一的发件人名称 (如 "SoundFlows 团队")

### 2. 邮件内容
- 使用简洁明了的主题行
- 开头使用个性化称呼
- 提供清晰的 CTA (Call-to-Action)
- 避免过多图片 (影响送达率)
- 包含退订链接 (HubSpot 自动添加)

### 3. 发送时间
- 避免周末发送
- 建议时间: 上午 10-11 点或下午 2-3 点
- 使用 Delay 功能控制发送时间

### 4. A/B 测试
- 测试不同主题行
- 测试不同 CTA
- 根据数据优化内容

---

## 📞 需要帮助?

如果设置过程中遇到问题:
1. 查看 HubSpot 官方文档: https://knowledge.hubspot.com/workflows
2. 检查 HubSpot Academy 教程: https://academy.hubspot.com
3. 参考本地文档: `docs/CRM-EMAIL-INTEGRATION-GUIDE.md`

---

**维护者**: SoundFlows Team
**文档版本**: 1.0
**最后更新**: 2025-10-18
