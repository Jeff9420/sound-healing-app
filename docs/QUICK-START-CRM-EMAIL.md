# 🚀 SoundFlows CRM 与邮件营销 - 快速开始指南

**预计完成时间**: 30-60 分钟
**难度**: ⭐⭐ (中等)
**前置要求**: 无

---

## 目标

完成这个指南后,你将拥有:
- ✅ 功能完整的 CRM 系统 (管理用户线索)
- ✅ 自动化邮件营销 (7 日冥想计划邮件序列)
- ✅ 完整的数据追踪 (Amplitude + GA4 集成)

---

## 选择你的方案

根据你的需求和技术水平,选择最适合的方案:

### 🥇 方案 1: HubSpot 一体化 (推荐给初学者)
- **优势**: 完全免费,一站式,最简单
- **时间**: 30 分钟
- **技术要求**: 无需代码或后端
- **适合**: 没有技术背景,预算有限

### 🥈 方案 2: HubSpot + Mailchimp (推荐给追求质量)
- **优势**: 免费,邮件模板更丰富
- **时间**: 45 分钟
- **技术要求**: 需要使用 Zapier (无代码)
- **适合**: 注重邮件营销质量

### 🥉 方案 3: Zapier 万能方案 (推荐给灵活性需求)
- **优势**: 可连接任意 CRM 和邮件平台
- **时间**: 40 分钟
- **技术要求**: 基本的 Zapier 使用
- **适合**: 已有其他平台账号,想整合使用

---

## 方案 1: HubSpot 一体化 (30 分钟)

### 第 1 步: 创建 HubSpot 账号 (5 分钟)

1. 访问 https://www.hubspot.com/products/get-started
2. 选择 **Start free**
3. 使用邮箱注册 (建议使用工作邮箱)
4. 完成初始设置向导

### 第 2 步: 创建自定义联系人字段 (5 分钟)

1. 登录 HubSpot → **Settings** (右上角齿轮图标)
2. 左侧菜单: **Properties** → **Contact properties**
3. 点击 **Create property**

**创建字段 1: meditation_goal**
```
Object type: Contact
Group: Contact Information
Label: 冥想目标
Description: 用户选择的冥想目标类型
Field type: Dropdown select
Options (每行一个):
  stress-relief | 压力缓解
  better-sleep | 改善睡眠
  emotional-balance | 情绪平衡
  focus | 专注力提升
  general-wellness | 整体健康
Internal value: meditation_goal
```

**创建字段 2: preferred_time**
```
Object type: Contact
Group: Contact Information
Label: 偏好时间
Field type: Dropdown select
Options:
  morning | 早晨 (6-9 AM)
  midday | 中午 (12-2 PM)
  evening | 晚间 (6-9 PM)
  flexible | 灵活安排
Internal value: preferred_time
```

### 第 3 步: 创建表单 (10 分钟)

#### 3.1 创建"资源订阅"表单

1. 导航到 **Marketing** → **Forms**
2. 点击 **Create form** → **Embedded form** → **Blank template**
3. 表单名称: `SoundFlows - 资源订阅`

**添加字段**:
- Email (默认已有)

**配置选项**:
- Options → Form options → 取消勾选 "Add CAPTCHA" (可选)
- Options → What should happen after form submission?
  - Display a thank you message: "感谢订阅!我们会定期发送声音疗愈的精选内容。"

4. 点击 **Publish** → 记录 **Form GUID** (在 URL 或嵌入代码中)

#### 3.2 创建"7 日冥想计划"表单

重复上述步骤,创建第二个表单:

表单名称: `SoundFlows - 7 日冥想计划`

**添加字段**:
- First name
- Last name
- Email
- Meditation Goal (选择你刚创建的自定义字段 `meditation_goal`)
- Preferred Time (选择你刚创建的自定义字段 `preferred_time`)

**成功消息**:
```
感谢加入!我们已为你定制了 7 日声音疗愈计划。
你将在几分钟内收到欢迎邮件,开启你的疗愈之旅。
```

记录这个表单的 **Form GUID**。

### 第 4 步: 获取 Portal ID (2 分钟)

1. HubSpot → **Settings** → **Account Setup** → **Account Defaults**
2. 找到并记录 **HubSpot Account ID** (即 Portal ID)

### 第 5 步: 配置 SoundFlows (3 分钟)

编辑 `assets/js/config.js`:

```javascript
window.SITE_CONFIG = {
    // 替换为你的实际值
    subscribeEndpoint: "https://api.hsforms.com/submissions/v3/integration/submit/YOUR_PORTAL_ID/SUBSCRIBE_FORM_GUID",
    planEndpoint: "https://api.hsforms.com/submissions/v3/integration/submit/YOUR_PORTAL_ID/PLAN_FORM_GUID",

    emailAutomation: {
        provider: "hubspot",
        endpoint: "",
        apiKey: ""
    }
};
```

**示例** (替换成你自己的):
```javascript
subscribeEndpoint: "https://api.hsforms.com/submissions/v3/integration/submit/12345678/abcd-1234-5678-efgh",
planEndpoint: "https://api.hsforms.com/submissions/v3/integration/submit/12345678/wxyz-9876-5432-ijkl",
```

### 第 6 步: 创建邮件自动化 (5 分钟)

1. HubSpot → **Automation** → **Workflows**
2. 点击 **Create workflow** → **From scratch** → **Contact-based**

**工作流名称**: `7 日冥想计划邮件序列`

**设置触发条件**:
- Trigger: Contact property → `meditation_goal` → is known (有任何值)

**添加动作 - Day 0 欢迎邮件**:
1. 点击 **+** 添加动作 → **Send email**
2. 创建邮件:
   - Subject: `🎉 欢迎开启你的 7 日声音疗愈之旅`
   - Body: 从 `docs/EMAIL-TEMPLATES.md` 复制 "Day 0: 欢迎邮件" 内容
   - 使用个性化 token:
     - `{{ contact.firstname }}` → 名字
     - `{{ contact.meditation_goal }}` → 目标
     - `{{ contact.preferred_time }}` → 时间偏好
3. 保存邮件

**添加延迟和后续邮件**:
1. 点击 **+** → **Delay** → Set delay → **1 day**
2. 点击 **+** → **Send email** → 创建 Day 1 邮件
3. 重复步骤 1-2,创建 Day 2 到 Day 7 邮件

**激活工作流**:
- 点击右上角 **Review and publish**
- 检查无误后点击 **Turn on**

### 第 7 步: 测试 (5 分钟)

1. 访问你的网站 (本地或已部署)
2. 填写并提交"7 日冥想计划"表单
3. 检查:
   - ✅ HubSpot Contacts 中出现新联系人
   - ✅ 字段 `meditation_goal` 和 `preferred_time` 已填充
   - ✅ 收到欢迎邮件 (检查垃圾邮件文件夹)
   - ✅ HubSpot Workflows 中看到联系人已加入流程

**故障排查**:
- 如果表单提交失败 → 检查 Portal ID 和 Form GUID 是否正确
- 如果没收到邮件 → 检查工作流是否已激活,邮箱是否在垃圾邮件中
- 查看浏览器控制台是否有错误信息

---

## 方案 2: HubSpot + Mailchimp (45 分钟)

### 第 1 步: 完成方案 1 的步骤 1-5 (20 分钟)

先按方案 1 设置好 HubSpot CRM 部分。

### 第 2 步: 创建 Mailchimp 账号 (5 分钟)

1. 访问 https://mailchimp.com/signup/
2. 选择 **Free** 计划 (最多 500 联系人)
3. 完成注册和初始设置

### 第 3 步: 创建 Mailchimp Audience (3 分钟)

1. Mailchimp → **Audience** → **All contacts**
2. 如果没有 Audience,点击 **Create Audience**
3. 填写基本信息:
   - Audience name: `SoundFlows 用户`
   - Default from email: 你的邮箱
   - Default from name: `SoundFlows`

### 第 4 步: 创建自定义字段 (3 分钟)

1. Audience → **Settings** → **Audience fields and *|MERGE|* tags**
2. 点击 **Add A Field**

**字段 1**:
```
Field type: Text
Field label: 冥想目标
Merge tag: GOAL
```

**字段 2**:
```
Field type: Text
Field label: 偏好时间
Merge tag: TIME_PREF
```

### 第 5 步: 设置 Zapier 连接 (10 分钟)

1. 访问 https://zapier.com/ 并注册免费账号
2. 点击 **Create Zap**

**Zap 名称**: `SoundFlows → Mailchimp 7 日计划`

**步骤 1: 设置 Trigger (触发器)**
1. Choose App: **Webhooks by Zapier**
2. Choose Event: **Catch Hook**
3. 点击 **Continue**
4. 复制提供的 **Custom Webhook URL** (类似 `https://hooks.zapier.com/hooks/catch/12345/abcde/`)

**步骤 2: 测试 Webhook**
1. 在浏览器控制台运行:
```javascript
fetch('YOUR_WEBHOOK_URL', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        email: 'test@example.com',
        name: '测试 用户',
        goal: 'stress-relief',
        time: 'morning'
    })
});
```
2. 在 Zapier 中点击 **Test trigger**,应该能看到测试数据
3. 点击 **Continue**

**步骤 3: 设置 Action (动作)**
1. Choose App: **Mailchimp**
2. Choose Event: **Add/Update Subscriber**
3. 连接你的 Mailchimp 账号
4. 配置字段映射:
   - Audience: 选择你创建的 Audience
   - Email: `email` (从 Webhook 数据)
   - Status: `subscribed`
   - Merge Fields:
     - FNAME: `name` 的前半部分 (使用 Formatter 分割)
     - GOAL: `goal`
     - TIME_PREF: `time`
   - Tags: `7-day-meditation-plan` (手动输入)
5. 点击 **Test action** 确认成功
6. 点击 **Publish**

### 第 6 步: 配置 SoundFlows (2 分钟)

更新 `assets/js/config.js`:

```javascript
window.SITE_CONFIG = {
    // HubSpot CRM (保持不变)
    subscribeEndpoint: "https://api.hsforms.com/submissions/v3/integration/submit/YOUR_PORTAL_ID/SUBSCRIBE_FORM_GUID",
    planEndpoint: "https://api.hsforms.com/submissions/v3/integration/submit/YOUR_PORTAL_ID/PLAN_FORM_GUID",

    // Mailchimp (通过 Zapier)
    emailAutomation: {
        provider: "zapier",
        endpoint: "YOUR_ZAPIER_WEBHOOK_URL", // 刚才复制的 URL
        method: "POST"
    }
};
```

### 第 7 步: 创建 Mailchimp 邮件自动化 (7 分钟)

1. Mailchimp → **Automations** → **Create** → **Custom**
2. Automation name: `7 日冥想计划`

**触发条件**:
- Trigger: **Tag is added** → 选择 `7-day-meditation-plan`

**添加邮件序列**:
1. 点击 **+** → **Email**
2. 创建 Day 0 邮件:
   - Subject: `🎉 欢迎开启你的 7 日声音疗愈之旅`
   - 使用 Mailchimp 模板,粘贴 `docs/EMAIL-TEMPLATES.md` 中的内容
   - 使用合并标签:
     - `*|FNAME|*` → 名字
     - `*|GOAL|*` → 目标
   - Delay: **immediately**
3. 点击 **Add delay** → **1 day**
4. 添加 Day 1 邮件
5. 重复步骤 3-4,创建 Day 2 到 Day 7 邮件

**激活自动化**:
- 点击 **Start workflow**

### 第 8 步: 测试 (5 分钟)

1. 提交网站上的"7 日冥想计划"表单
2. 检查:
   - ✅ HubSpot 中创建了联系人
   - ✅ Zapier 任务成功运行
   - ✅ Mailchimp 中添加了订阅者
   - ✅ 订阅者被打上 `7-day-meditation-plan` 标签
   - ✅ 收到 Day 0 欢迎邮件
   - ✅ Mailchimp Automation 中看到联系人已加入

---

## 方案 3: Zapier 万能方案 (40 分钟)

### 适用场景
- 你已有其他 CRM (如 Salesforce, Pipedrive)
- 你想使用其他邮件平台 (如 SendGrid, Brevo)
- 你需要连接多个系统

### 步骤

与方案 2 类似,但创建 3 个独立的 Zap:

1. **Zap 1: 表单 → CRM**
   - Trigger: Webhooks by Zapier → Catch Hook
   - Action: 你的 CRM → Create/Update Contact

2. **Zap 2: 表单 → 邮件平台**
   - Trigger: Webhooks by Zapier → Catch Hook
   - Action: 你的邮件平台 → Add Subscriber

3. **Zap 3: 数据同步 (可选)**
   - Trigger: CRM → New Contact
   - Action: 邮件平台 → Add/Update Subscriber

配置 `assets/js/config.js`:
```javascript
window.SITE_CONFIG = {
    subscribeEndpoint: "ZAPIER_WEBHOOK_URL_1",
    planEndpoint: "ZAPIER_WEBHOOK_URL_2",
    emailAutomation: {
        provider: "zapier",
        endpoint: "ZAPIER_WEBHOOK_URL_3",
        method: "POST"
    }
};
```

---

## 完成后的检查清单

- [ ] CRM 系统能够接收表单提交
- [ ] 联系人字段正确映射和填充
- [ ] 邮件自动化已设置并激活
- [ ] 测试用户收到了欢迎邮件
- [ ] 7 天邮件序列已配置
- [ ] Amplitude 和 GA4 能追踪表单提交事件
- [ ] 所有配置已部署到生产环境

---

## 下一步

配置完成后:

1. **监控数据流**
   - 每天检查 CRM 中的新联系人
   - 查看邮件打开率和点击率
   - 在 Amplitude/GA4 中追踪转化

2. **优化邮件内容**
   - 根据打开率调整主题行
   - 根据点击率优化 CTA
   - A/B 测试不同的内容

3. **扩展功能**
   - 创建更多细分列表
   - 添加个性化推荐邮件
   - 实现更复杂的自动化流程

---

## 需要帮助?

- 📖 **完整文档**: `docs/CRM-EMAIL-INTEGRATION-GUIDE.md`
- 📧 **邮件模板**: `docs/EMAIL-TEMPLATES.md`
- 🐛 **故障排查**: `docs/CRM-EMAIL-INTEGRATION-GUIDE.md` 故障排查部分

---

**维护者**: SoundFlows Team
**文档版本**: 1.0
**最后更新**: 2025-10-18
