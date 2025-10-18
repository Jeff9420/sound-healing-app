# 🧙 HubSpot 配置向导 - 30 分钟完成 CRM 集成

**适用于**: SoundFlows 声音疗愈平台
**预计时间**: 30 分钟
**难度**: ⭐ (非常简单)
**需要**: HubSpot 账号（免费）

---

## 🎯 目标

完成此配置后，你的网站将能够:
- ✅ 自动将表单提交发送到 HubSpot CRM
- ✅ 在 HubSpot 中管理所有用户线索
- ✅ 使用 HubSpot 发送自动化邮件（7 日冥想计划）

---

## 📋 配置步骤

### 第 1 步: 创建 HubSpot 账号 (5 分钟)

1. 访问 https://app.hubspot.com/signup-hubspot/crm
2. 填写注册信息:
   - Email: 使用你的工作邮箱
   - Company name: SoundFlows 或你的公司名
3. 选择 **Free** 计划
4. 完成邮箱验证
5. 登录 HubSpot

### 第 2 步: 获取 Portal ID (2 分钟)

1. 登录 HubSpot 后，点击右上角 **设置图标** (齿轮)
2. 左侧菜单: **Account Setup** → **Account Defaults**
3. 找到 **HubSpot Account ID**
4. **复制这个数字** (例如: `12345678`)

**保存到记事本:**
```
Portal ID: 12345678
```

### 第 3 步: 创建"资源订阅"表单 (5 分钟)

1. 导航到 **Marketing** → **Forms**
2. 点击 **Create form**
3. 选择 **Embedded form** → **Blank template**
4. 配置表单:

**表单名称**: `SoundFlows - 资源订阅`

**添加字段**:
- Email (默认已有，保留即可)

**配置提交后行为**:
1. 点击 **Options** 标签
2. What should happen after form submission?
   - 选择 **Display a thank you message**
   - 输入: `✅ 感谢订阅！我们会定期发送声音疗愈的精选内容。`

**发布表单**:
1. 点击右上角 **Publish**
2. 复制 **Form GUID** (在嵌入代码或 URL 中)
   - 格式类似: `abcd-1234-5678-efgh-ijklmnop`

**保存到记事本:**
```
订阅表单 GUID: abcd-1234-5678-efgh-ijklmnop
```

### 第 4 步: 创建"7 日冥想计划"表单 (8 分钟)

重复第 3 步，但使用以下配置:

**表单名称**: `SoundFlows - 7 日冥想计划`

**添加字段** (按顺序):
1. **First name**
   - Field type: Single-line text
   - Required: Yes

2. **Last name**
   - Field type: Single-line text
   - Required: No (设为 Optional)

3. **Email**
   - 默认已有
   - Required: Yes

4. **创建自定义字段: Meditation Goal**
   - 点击 **+ Add new field**
   - Field type: **Dropdown select**
   - Label: `Meditation Goal`
   - Internal name: `meditation_goal`
   - Options (每行一个):
     ```
     stress-relief | 压力缓解
     better-sleep | 改善睡眠
     emotional-balance | 情绪平衡
     focus | 专注力提升
     general-wellness | 整体健康
     ```
   - Required: Yes
   - 点击 **Create**

5. **创建自定义字段: Preferred Time**
   - 点击 **+ Add new field**
   - Field type: **Dropdown select**
   - Label: `Preferred Time`
   - Internal name: `preferred_time`
   - Options:
     ```
     morning | 早晨 (6-9 AM)
     midday | 中午 (12-2 PM)
     evening | 晚间 (6-9 PM)
     flexible | 灵活安排
     ```
   - Required: Yes
   - 点击 **Create**

**配置提交后行为**:
- Thank you message:
  ```
  ✅ 感谢加入！我们已为你定制了 7 日声音疗愈计划。
  你将在几分钟内收到欢迎邮件，开启你的疗愈之旅。
  ```

**发布表单并保存 GUID**:
```
计划表单 GUID: wxyz-9876-5432-abcd-efghijkl
```

### 第 5 步: 更新网站配置 (3 分钟)

1. 打开文件: `C:\Users\MI\Desktop\声音疗愈\assets\js\config.js`

2. 找到以下部分并更新:

**替换前:**
```javascript
window.SITE_CONFIG = window.SITE_CONFIG || {
    subscribeEndpoint: "",
    planEndpoint: "",
```

**替换为** (使用你的实际值):
```javascript
window.SITE_CONFIG = window.SITE_CONFIG || {
    subscribeEndpoint: "https://api.hsforms.com/submissions/v3/integration/submit/YOUR_PORTAL_ID/YOUR_SUBSCRIBE_FORM_GUID",
    planEndpoint: "https://api.hsforms.com/submissions/v3/integration/submit/YOUR_PORTAL_ID/YOUR_PLAN_FORM_GUID",
```

**示例** (替换成你自己的):
```javascript
subscribeEndpoint: "https://api.hsforms.com/submissions/v3/integration/submit/12345678/abcd-1234-5678-efgh-ijklmnop",
planEndpoint: "https://api.hsforms.com/submissions/v3/integration/submit/12345678/wxyz-9876-5432-abcd-efghijkl",
```

3. 保存文件

### 第 6 步: 测试配置 (5 分钟)

**方法 A: 使用测试页面**

1. 在浏览器中打开: `C:\Users\MI\Desktop\声音疗愈\crm-test.html`
2. 填写测试信息并提交
3. 查看结果

**方法 B: 在实际网站测试**

1. 启动本地服务器 (如果尚未运行):
   ```bash
   # 任选一种方式
   python -m http.server 8000
   # 或
   npx http-server -p 8000
   ```

2. 访问 `http://localhost:8000`
3. 滚动到"7 日定制冥想计划"表单
4. 填写测试信息:
   - 昵称: 测试
   - 邮箱: your-email@example.com
   - 目标: 压力缓解
   - 时长: 10-20 分钟
5. 点击提交

**验证**:
1. 应该看到成功提示: `✅ 计划申请成功！`
2. 登录 HubSpot → **Contacts** → **Contacts**
3. 应该看到新创建的联系人
4. 点击联系人，查看 `Meditation Goal` 和 `Preferred Time` 字段

---

## 第 7 步: 创建邮件自动化 (可选,7 分钟)

如果你想发送 7 日邮件序列:

1. HubSpot → **Automation** → **Workflows**
2. 点击 **Create workflow** → **From scratch** → **Contact-based**
3. Workflow name: `7 日冥想计划邮件序列`

**设置触发条件**:
- Trigger type: **Form submission**
- Select form: `SoundFlows - 7 日冥想计划`
- 点击 **Save**

**添加 Day 0 邮件**:
1. 点击 **+** 添加动作
2. 选择 **Send email**
3. 创建新邮件:
   - Name: `Day 0 - 欢迎邮件`
   - Subject: `🎉 欢迎开启你的 7 日声音疗愈之旅`
   - Body: 从 `docs/EMAIL-TEMPLATES.md` 复制 "Day 0: 欢迎邮件" 内容
   - 使用个性化token:
     - `{{ contact.firstname }}` - 名字
     - `{{ contact.meditation_goal }}` - 目标
     - `{{ contact.preferred_time }}` - 时间偏好
4. 保存邮件

**添加后续邮件** (Day 1-7):
1. 点击 **+** 添加动作
2. 选择 **Delay** → **Set delay** → **1 day**
3. 点击 **+** 添加动作
4. 选择 **Send email** → 创建 Day 1 邮件
5. 重复步骤 1-4，创建 Day 2 到 Day 7 邮件

**激活工作流**:
- 点击右上角 **Review and publish**
- 点击 **Turn on**

---

## ✅ 完成检查清单

- [ ] 已创建 HubSpot 账号
- [ ] 已获取 Portal ID
- [ ] 已创建"资源订阅"表单
- [ ] 已创建"7 日冥想计划"表单
- [ ] 已更新 `assets/js/config.js`
- [ ] 已测试表单提交
- [ ] 在 HubSpot 中看到测试联系人
- [ ] (可选) 已创建邮件自动化工作流

---

## 🐛 常见问题

### Q: 提交表单后报错 403 Forbidden

**原因**: Portal ID 或 Form GUID 不正确

**解决方案**:
1. 重新检查 Portal ID (在 Account Defaults 中)
2. 重新检查 Form GUID (在表单 URL 或嵌入代码中)
3. 确保没有多余的空格

### Q: 字段没有正确填充

**原因**: 字段名称不匹配

**解决方案**:
1. 在 HubSpot 表单中，字段的 **Internal name** 必须是:
   - `firstname` (不是 `first_name`)
   - `lastname` (不是 `last_name`)
   - `meditation_goal`
   - `preferred_time`
2. 检查代码中发送的字段名是否匹配

### Q: 没有收到邮件

**原因**:
- 工作流未激活
- 邮箱在垃圾邮件文件夹
- HubSpot 邮件配置问题

**解决方案**:
1. 确认工作流状态为 "On"
2. 检查垃圾邮件文件夹
3. 在 HubSpot → Settings → Email → Configuration 中验证发件人地址

---

## 📊 查看数据

### 查看联系人
1. HubSpot → **Contacts** → **Contacts**
2. 查看所有提交的用户

### 查看表单提交统计
1. HubSpot → **Marketing** → **Forms**
2. 点击表单名称
3. 查看 **Performance** 标签

### 查看工作流执行
1. HubSpot → **Automation** → **Workflows**
2. 点击工作流名称
3. 查看 **Enrollment history**

---

## 🚀 下一步

配置完成后:

1. **部署到生产环境**
   ```bash
   git add assets/js/config.js
   git commit -m "配置 HubSpot CRM 集成"
   git push origin main
   ```
   Vercel 会自动部署

2. **监控数据**
   - 每天查看 HubSpot 中的新联系人
   - 查看表单提交率

3. **优化邮件**
   - 根据打开率优化邮件主题
   - 根据点击率优化邮件内容

---

## 📚 参考资源

- **完整集成指南**: `docs/CRM-EMAIL-INTEGRATION-GUIDE.md`
- **邮件模板库**: `docs/EMAIL-TEMPLATES.md`
- **快速开始指南**: `docs/QUICK-START-CRM-EMAIL.md`
- **HubSpot 官方文档**: https://developers.hubspot.com/docs/api/marketing/forms

---

**需要帮助？**
- 查看 `docs/CRM-EMAIL-INTEGRATION-GUIDE.md` 故障排查部分
- 检查浏览器控制台是否有错误信息
- 确认 HubSpot 表单已正确发布

---

**维护者**: SoundFlows Team
**文档版本**: 1.0
**最后更新**: 2025-10-18
