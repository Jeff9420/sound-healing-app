# 🚀 HubSpot 5 分钟快速 Workflow 设置

## 最简单方案：一键完成自动化邮件

只需要设置一个 Workflow，发送一封欢迎邮件即可！

---

## 📋 准备工作（2分钟）

1. **打开 HubSpot**
   - 访问：https://app.hubspot.com
   - 登录您的账户

2. **确认表单存在**
   - 点击左侧 **Marketing**
   - 点击 **Forms**
   - 确认能看到您的两个表单

---

## 🎯 创建冥想计划欢迎邮件（3分钟）

### 步骤 1：创建 Workflow

1. **点击左侧** `Automation` → `Workflows`
2. **点击右上角** `Create workflow`
3. **选择** `Contact-based`（右侧那个）
4. **点击** `Next`

### 步骤 2：设置触发

1. **点击** `Set enrollment triggers`
2. **点击** `+ AND`
3. **选择** `Form submission`
4. **选择您的冥想计划表单**
5. **点击** `Save`

### 步骤 3：创建邮件

1. **点击** `Add action`
2. **选择** `Send email`
3. **选择** `Create marketing email`

### 步骤 4：填写邮件内容

```
邮件名称：冥想计划欢迎邮件
主题：✨ 您的7日冥想计划已收到 - SoundFlows

邮件内容（直接复制粘贴）：

嗨 {{contact.firstname}}，

感谢您申请 SoundFlows 的7日冥想计划！

📋 您的信息：
• 目标：{{contact.meditation_goal}}
• 每日时长：{{contact.preferred_time}}

🎵 立即开始您的冥想之旅：
[点击访问 SoundFlows](https://soundflows.app)

我们精选了 213+ 疗愈音频，包括：
• 雨声助眠 - 帮助深度睡眠
• 颂钵音疗 - 平衡身心能量
• 自然音效 - 缓解日常压力
• 冥想音乐 - 提升专注力

💡 小贴士：
每天坚持 {{contact.preferred_time}}，让冥想成为生活的一部分。

祝您冥想愉快！

SoundFlows 团队
```

5. **点击** `Save`
6. **选择发送时间**：`Immediately`
7. **再次点击** `Save`

### 步骤 5：激活

1. **点击右上角** `Review and publish`
2. **检查设置**
3. **点击** `Turn on`

✅ **完成！**

---

## 📚 创建资源订阅欢迎邮件（可选，同样3分钟）

重复以上步骤，但：
- 表单选择：资源订阅表单
- 邮件主题改为：`📚 欢迎订阅 SoundFlows 资源`
- 邮件内容改为：

```
嗨 {{contact.firstname}}，

感谢您订阅 SoundFlows！

🎵 探索 213+ 免费疗愈音频：
[立即访问 SoundFlows](https://soundflows.app)

热门推荐：
• 雨声合集（14首）
• 颂钵音疗（61首）
• 冥想引导（70首）

SoundFlows 团队
```

---

## ✅ 完成！您已经实现了：

- ✅ 自动捕获表单提交
- ✅ 立即发送欢迎邮件
- ✅ 个性化内容（显示姓名和目标）
- ✅ 引导用户访问网站

## 🎉 测试一下！

1. 访问您的网站：`https://soundflows.app`
2. 填写冥想计划申请表
3. 查看邮箱是否收到邮件

---

## 📞 需要帮助？

如果遇到问题：
1. 检查表单是否已发布
2. 确认 Workflow 已开启（显示为 ON）
3. 查看垃圾邮件文件夹

---

**就这么简单！您已经成功设置了自动化邮件营销！** 🎊