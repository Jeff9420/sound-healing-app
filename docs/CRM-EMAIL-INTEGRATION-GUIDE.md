# 📧 SoundFlows CRM 与邮件营销集成指南

**更新日期**: 2025-10-18
**版本**: 1.0
**适用于**: SoundFlows 声音疗愈平台

---

## 📑 目录

1. [概述](#概述)
2. [平台选择建议](#平台选择建议)
3. [HubSpot CRM 集成](#hubspot-crm-集成)
4. [Mailchimp 邮件营销集成](#mailchimp-邮件营销集成)
5. [其他平台集成方案](#其他平台集成方案)
6. [配置步骤](#配置步骤)
7. [字段映射](#字段映射)
8. [测试与验证](#测试与验证)
9. [故障排查](#故障排查)

---

## 概述

SoundFlows 已经内置了 CRM 和邮件营销自动化的基础架构：
- **CRM Bridge** (`assets/js/crm-bridge.js`) - 处理表单提交到 CRM
- **Email Automation** (`assets/js/email-automation.js`) - 处理邮件订阅和自动化流程
- **配置文件** (`assets/js/config.js`) - 集中管理 API 端点和密钥

### 核心功能

1. **表单提交到 CRM**
   - 7 日定制冥想计划表单 → CRM 联系人创建
   - 自动记录用户目标、时间偏好等自定义字段

2. **邮件营销自动化**
   - 资源订阅 → 添加到邮件列表
   - 计划提交 → 触发 7 日邮件序列
   - 内容互动 → 触发个性化推荐邮件

3. **数据同步**
   - CRM 和邮件平台双向同步
   - 分析数据（Amplitude/GA4）与 CRM 数据整合

---

## 平台选择建议

### CRM 平台对比

| 平台 | 推荐指数 | 价格 | 优势 | 劣势 |
|------|----------|------|------|------|
| **HubSpot** | ⭐⭐⭐⭐⭐ | 免费起步<br>付费 $50+/月 | • 免费版功能强大<br>• 原生邮件营销<br>• 易于集成<br>• 强大的自动化 | • 高级功能较贵<br>• 学习曲线中等 |
| **Salesforce** | ⭐⭐⭐⭐ | $25+/用户/月 | • 行业标准<br>• 高度可定制<br>• 强大的报表 | • 价格较高<br>• 配置复杂 |
| **Pipedrive** | ⭐⭐⭐⭐ | $14.90+/用户/月 | • 界面友好<br>• 专注销售流程<br>• 价格适中 | • 邮件营销需额外工具 |
| **Zoho CRM** | ⭐⭐⭐ | 免费起步<br>付费 $14+/用户/月 | • 性价比高<br>• 功能全面 | • 界面较旧<br>• 集成生态较弱 |

### 邮件营销平台对比

| 平台 | 推荐指数 | 价格 | 优势 | 劣势 |
|------|----------|------|------|------|
| **Mailchimp** | ⭐⭐⭐⭐⭐ | 免费 500 联系人<br>付费 $13+/月 | • 免费版够用<br>• 模板丰富<br>• 易于使用<br>• 强大的自动化 | • 超过免费额度后较贵 |
| **SendGrid** | ⭐⭐⭐⭐ | 免费 100 邮件/天<br>付费 $15+/月 | • 开发者友好<br>• API 强大<br>• 送达率高 | • UI 较复杂<br>• 侧重事务邮件 |
| **ConvertKit** | ⭐⭐⭐⭐ | $9+/月 (无免费版) | • 专为内容创作者设计<br>• 自动化流程强<br>• 分段功能好 | • 无免费版<br>• 模板较简单 |
| **Brevo (Sendinblue)** | ⭐⭐⭐⭐ | 免费 300 邮件/天<br>付费 $25+/月 | • 免费版慷慨<br>• 含 CRM 和短信<br>• 性价比高 | • 高级功能需付费 |

### 推荐组合方案

#### 🥇 方案 1: HubSpot（一体化，推荐）
- **CRM**: HubSpot 免费版
- **邮件**: HubSpot 集成邮件营销
- **优势**: 一站式解决方案，数据无需同步
- **适合**: 初创团队，预算有限，追求简单高效

#### 🥈 方案 2: HubSpot + Mailchimp（最佳组合）
- **CRM**: HubSpot 免费版
- **邮件**: Mailchimp 免费版
- **优势**: 两者都有强大免费版，Mailchimp 邮件模板更丰富
- **适合**: 需要高质量邮件营销，愿意管理两个平台

#### 🥉 方案 3: Brevo（一体化，性价比）
- **CRM**: Brevo 内置 CRM
- **邮件**: Brevo 邮件营销
- **优势**: 免费额度最高，含短信功能
- **适合**: 预算极度有限，需要短信营销

---

## HubSpot CRM 集成

### 第 1 步: 创建 HubSpot 账号

1. 访问 [HubSpot 注册页面](https://www.hubspot.com/products/get-started)
2. 选择 **免费 CRM** 开始
3. 完成账号设置

### 第 2 步: 获取 API 密钥

1. 登录 HubSpot 账号
2. 导航到 **设置** → **集成** → **Private Apps**
3. 点击 **创建私有应用**
4. 配置权限：
   - `crm.objects.contacts.write` - 创建/更新联系人
   - `crm.objects.contacts.read` - 读取联系人
   - `timeline` - 记录活动
5. 生成 **访问令牌**（类似 `pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`）

### 第 3 步: 配置 HubSpot Webhook

#### 方法 A: 使用 HubSpot Forms API（推荐）

HubSpot 提供原生表单 API，无需 webhook：

**API 端点**: `https://api.hsforms.com/submissions/v3/integration/submit/{portalId}/{formGuid}`

**获取 Portal ID 和 Form GUID**:
1. 在 HubSpot 中创建表单（Marketing → Forms）
2. Portal ID 在账号设置中查看（Settings → Account Defaults）
3. Form GUID 在表单设置页面的 URL 中

**配置示例**（直接更新 `assets/js/config.js`）:

```javascript
window.SITE_CONFIG = {
    // HubSpot CRM 表单提交端点
    planEndpoint: "https://api.hsforms.com/submissions/v3/integration/submit/12345678/abcd-1234-5678-efgh",
    subscribeEndpoint: "https://api.hsforms.com/submissions/v3/integration/submit/12345678/wxyz-9876-5432-ijkl",

    // 邮件自动化（可选，如使用 HubSpot 邮件功能）
    emailAutomation: {
        provider: "hubspot",
        endpoint: "", // HubSpot 通过 CRM 自动化处理，留空
        apiKey: "", // 留空
    }
};
```

#### 方法 B: 使用 HubSpot CRM API（高级）

需要后端中间件处理（Node.js/Python/PHP）。

**示例后端 (Node.js)**:

```javascript
// server.js
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const HUBSPOT_API_KEY = 'pat-na1-your-access-token';

app.post('/api/crm/contact', async (req, res) => {
    const { email, name, goal, time_preference } = req.body;

    try {
        const response = await axios.post(
            'https://api.hubapi.com/crm/v3/objects/contacts',
            {
                properties: {
                    email: email,
                    firstname: name.split(' ')[0],
                    lastname: name.split(' ')[1] || '',
                    meditation_goal: goal,
                    preferred_time: time_preference
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({ success: true, contactId: response.data.id });
    } catch (error) {
        console.error('HubSpot API Error:', error.response?.data);
        res.status(500).json({ error: 'Failed to create contact' });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

然后在 `config.js` 中配置：

```javascript
window.SITE_CONFIG = {
    planEndpoint: "https://your-backend.com/api/crm/contact",
    subscribeEndpoint: "https://your-backend.com/api/crm/contact",
};
```

### 第 4 步: 创建自定义字段

在 HubSpot CRM 中创建以下自定义联系人属性：

1. **meditation_goal** (下拉选择)
   - 选项: `stress-relief`, `better-sleep`, `emotional-balance`, `focus`, `general-wellness`
   - 显示名: 冥想目标

2. **preferred_time** (下拉选择)
   - 选项: `morning`, `midday`, `evening`, `flexible`
   - 显示名: 偏好时间

3. **plan_start_date** (日期)
   - 显示名: 计划开始日期

4. **plan_status** (下拉选择)
   - 选项: `pending`, `active`, `completed`, `paused`
   - 显示名: 计划状态

### 第 5 步: 设置 HubSpot 工作流自动化

1. 导航到 **Automation** → **Workflows**
2. 创建 **Contact-based workflow**
3. 触发条件: `meditation_goal` 已设置
4. 操作:
   - 发送欢迎邮件
   - 等待 1 天 → 发送 Day 1 邮件
   - 等待 1 天 → 发送 Day 2 邮件
   - ... (继续 7 天序列)

---

## Mailchimp 邮件营销集成

### 第 1 步: 创建 Mailchimp 账号

1. 访问 [Mailchimp 注册页面](https://mailchimp.com/signup/)
2. 选择 **免费** 计划（最多 500 联系人）
3. 完成账号设置

### 第 2 步: 获取 API 密钥

1. 登录 Mailchimp 账号
2. 导航到 **Account** → **Extras** → **API keys**
3. 点击 **Create A Key**
4. 复制 API 密钥（格式类似 `xxxxxxxx-usXX`）
5. 注意 API 密钥后缀（如 `us21`），这是你的数据中心代码

### 第 3 步: 创建受众列表（Audience）

1. 导航到 **Audience** → **All contacts**
2. 如果没有列表，点击 **Create Audience**
3. 记录 **Audience ID**（在 Audience Settings → Audience name and defaults 页面）

### 第 4 步: 配置 Mailchimp API 集成

#### 方法 A: 直接使用 Mailchimp API（需要后端）

由于 CORS 限制，Mailchimp API 无法直接从前端调用，需要后端中间件。

**示例后端 (Node.js)**:

```javascript
// server.js
const express = require('express');
const mailchimp = require('@mailchimp/mailchimp_marketing');
const app = express();

app.use(express.json());

mailchimp.setConfig({
    apiKey: process.env.MAILCHIMP_API_KEY, // 从环境变量获取
    server: process.env.MAILCHIMP_SERVER || 'us21'
});

const AUDIENCE_ID = 'abcd1234';

// 订阅资源
app.post('/api/email/subscribe', async (req, res) => {
    const { email } = req.body;

    try {
        const response = await mailchimp.lists.addListMember(AUDIENCE_ID, {
            email_address: email,
            status: 'subscribed'
        });

        res.json({ success: true, id: response.id });
    } catch (error) {
        console.error('Mailchimp Error:', error.response?.body);
        res.status(500).json({ error: 'Failed to subscribe' });
    }
});

// 触发 7 日冥想计划
app.post('/api/email/start-journey', async (req, res) => {
    const { email, name, goal } = req.body;

    try {
        // 添加到列表并打标签
        const response = await mailchimp.lists.addListMember(AUDIENCE_ID, {
            email_address: email,
            status: 'subscribed',
            merge_fields: {
                FNAME: name.split(' ')[0],
                LNAME: name.split(' ')[1] || '',
                GOAL: goal
            },
            tags: ['7-day-meditation-plan']
        });

        res.json({ success: true, id: response.id });
    } catch (error) {
        console.error('Mailchimp Error:', error.response?.body);
        res.status(500).json({ error: 'Failed to start journey' });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

然后在 `assets/js/config.js` 中配置：

```javascript
window.SITE_CONFIG = {
    emailAutomation: {
        provider: "mailchimp",
        endpoint: "https://your-backend.com/api/email/subscribe",
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    }
};
```

#### 方法 B: 使用 Zapier/Make.com（无代码方案，推荐）

1. 创建 Zapier 账号（免费版足够）
2. 创建 Zap:
   - **Trigger**: Webhooks by Zapier → Catch Hook
   - **Action**: Mailchimp → Add/Update Subscriber
3. 获取 Webhook URL（类似 `https://hooks.zapier.com/hooks/catch/12345/abcde/`）
4. 在 `config.js` 中配置：

```javascript
window.SITE_CONFIG = {
    subscribeEndpoint: "https://hooks.zapier.com/hooks/catch/12345/abcde/",
    planEndpoint: "https://hooks.zapier.com/hooks/catch/12345/fghij/",

    emailAutomation: {
        provider: "zapier",
        endpoint: "https://hooks.zapier.com/hooks/catch/12345/abcde/",
        method: "POST"
    }
};
```

### 第 5 步: 创建 Mailchimp 自动化流程

1. 导航到 **Automations** → **Create** → **Custom**
2. 选择触发条件: **Tag is added** → 选择 `7-day-meditation-plan`
3. 添加邮件序列:
   - **Day 0**: 欢迎邮件（立即发送）
   - **Day 1**: 第一天练习指引（延迟 1 天）
   - **Day 2**: 第二天练习指引（延迟 2 天）
   - ...
   - **Day 7**: 总结邮件（延迟 7 天）

---

## 其他平台集成方案

### SendGrid 集成

**优势**: 强大的邮件发送 API，适合开发者

**配置示例**:

```javascript
window.SITE_CONFIG = {
    emailAutomation: {
        provider: "sendgrid",
        endpoint: "https://api.sendgrid.com/v3/marketing/contacts",
        method: "PUT",
        apiKey: "SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        authScheme: "Bearer",
        headers: {
            "Content-Type": "application/json"
        }
    }
};
```

### Brevo (Sendinblue) 集成

**优势**: 免费版额度高，含 CRM 和短信功能

**配置示例**:

```javascript
window.SITE_CONFIG = {
    emailAutomation: {
        provider: "brevo",
        endpoint: "https://api.brevo.com/v3/contacts",
        method: "POST",
        apiKey: "xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        authScheme: "api-key",
        headers: {
            "Content-Type": "application/json"
        },
        defaultPayload: {
            listIds: [2], // Brevo 列表 ID
            updateEnabled: true
        }
    }
};
```

---

## 配置步骤

### 完整配置示例（推荐：HubSpot + Mailchimp）

编辑 `assets/js/config.js`:

```javascript
window.SITE_CONFIG = window.SITE_CONFIG || {
    // HubSpot CRM - 处理表单提交和联系人管理
    subscribeEndpoint: "https://api.hsforms.com/submissions/v3/integration/submit/12345678/your-subscribe-form-guid",
    planEndpoint: "https://api.hsforms.com/submissions/v3/integration/submit/12345678/your-plan-form-guid",

    // Mailchimp 邮件营销 - 处理邮件自动化
    emailAutomation: {
        provider: "mailchimp",
        endpoint: "https://your-backend.com/api/email/subscribe", // 或 Zapier Webhook URL
        method: "POST",
        listId: "abcd1234", // Mailchimp Audience ID
        doubleOptIn: false,
        tags: [],
        headers: {
            "Content-Type": "application/json"
        },
        authScheme: "Bearer",
        apiKey: "", // 如果使用后端，留空；后端处理认证
        defaultPayload: {}
    },

    // 账号系统（未来扩展）
    account: {
        signupEndpoint: "",
        loginEndpoint: "",
        redirectUrl: ""
    }
};
```

---

## 字段映射

### 表单字段到 CRM 字段映射

#### 7 日定制冥想计划表单

| 前端表单字段 | 字段名 | HubSpot 字段 | Mailchimp 字段 | 数据类型 |
|-------------|--------|--------------|----------------|----------|
| 姓名 | name | `firstname` + `lastname` | `FNAME` + `LNAME` | 字符串 |
| 邮箱 | email | `email` | `email_address` | 邮箱 |
| 冥想目标 | goal | `meditation_goal` | `GOAL` | 下拉选择 |
| 偏好时间 | time | `preferred_time` | `TIME_PREF` | 下拉选择 |
| 提交时间 | timestamp | `plan_start_date` | `PLAN_START` | 日期时间 |

#### 资源订阅表单

| 前端表单字段 | 字段名 | HubSpot 字段 | Mailchimp 字段 | 数据类型 |
|-------------|--------|--------------|----------------|----------|
| 邮箱 | email | `email` | `email_address` | 邮箱 |
| 订阅来源 | source | `subscription_source` | `SOURCE` | 字符串 |
| 订阅时间 | timestamp | `subscription_date` | `SUB_DATE` | 日期时间 |

### HubSpot 自定义字段创建步骤

1. 登录 HubSpot → **Settings** → **Properties**
2. 选择 **Contact properties**
3. 点击 **Create property**
4. 配置字段:

**字段 1: meditation_goal**
- Object type: Contact
- Group: Contact Information
- Label: 冥想目标
- Field type: Dropdown select
- Options:
  - `stress-relief` - 压力缓解
  - `better-sleep` - 改善睡眠
  - `emotional-balance` - 情绪平衡
  - `focus` - 专注力提升
  - `general-wellness` - 整体健康

**字段 2: preferred_time**
- Object type: Contact
- Group: Contact Information
- Label: 偏好时间
- Field type: Dropdown select
- Options:
  - `morning` - 早晨 (6-9 AM)
  - `midday` - 中午 (12-2 PM)
  - `evening` - 晚间 (6-9 PM)
  - `flexible` - 灵活安排

### Mailchimp 合并字段创建步骤

1. 登录 Mailchimp → **Audience** → **Settings** → **Audience fields and *|MERGE|* tags**
2. 点击 **Add A Field**
3. 配置字段:

**字段 1: GOAL**
- Field type: Dropdown
- Field label: 冥想目标
- Choices:
  - 压力缓解
  - 改善睡眠
  - 情绪平衡
  - 专注力提升
  - 整体健康

**字段 2: TIME_PREF**
- Field type: Dropdown
- Field label: 偏好时间
- Choices:
  - 早晨 (6-9 AM)
  - 中午 (12-2 PM)
  - 晚间 (6-9 PM)
  - 灵活安排

---

## 测试与验证

### 测试清单

#### 1. CRM 集成测试

- [ ] **联系人创建测试**
  1. 提交 7 日冥想计划表单
  2. 检查 HubSpot CRM 中是否创建了新联系人
  3. 验证所有字段是否正确填充

- [ ] **字段映射测试**
  1. 提交表单时选择不同的目标和时间
  2. 验证自定义字段值是否正确

- [ ] **错误处理测试**
  1. 提交重复邮箱（已存在联系人）
  2. 验证系统是否更新现有联系人而非报错

#### 2. 邮件营销测试

- [ ] **订阅测试**
  1. 提交资源订阅表单
  2. 检查 Mailchimp 中是否添加了新订阅者
  3. 验证订阅状态为 "Subscribed"

- [ ] **自动化流程测试**
  1. 提交 7 日冥想计划表单
  2. 验证是否收到欢迎邮件（Day 0）
  3. 检查 Mailchimp Automation 中是否启动了流程

- [ ] **标签和分段测试**
  1. 提交表单
  2. 验证联系人是否被打上正确标签
  3. 检查是否添加到正确的分段列表

#### 3. 端到端测试

- [ ] **完整用户旅程测试**
  1. 作为新用户访问网站
  2. 浏览内容并提交资源订阅
  3. 提交 7 日冥想计划表单
  4. 验证:
     - HubSpot 中创建了联系人
     - Mailchimp 中添加了订阅者
     - 收到了欢迎邮件
     - Amplitude/GA4 记录了事件

### 测试工具

#### 1. Postman 测试 API

创建 Postman Collection 测试 API 端点:

**测试 1: HubSpot 表单提交**

```
POST https://api.hsforms.com/submissions/v3/integration/submit/{portalId}/{formGuid}
Content-Type: application/json

{
  "fields": [
    { "name": "email", "value": "test@example.com" },
    { "name": "firstname", "value": "测试" },
    { "name": "lastname", "value": "用户" },
    { "name": "meditation_goal", "value": "stress-relief" },
    { "name": "preferred_time", "value": "morning" }
  ],
  "context": {
    "pageUri": "https://www.soundflows.app/",
    "pageName": "SoundFlows 7 Day Plan"
  }
}
```

**测试 2: Mailchimp 添加订阅者（通过后端）**

```
POST https://your-backend.com/api/email/subscribe
Content-Type: application/json

{
  "email": "test@example.com"
}
```

#### 2. 浏览器控制台测试

在网站上打开浏览器控制台，运行:

```javascript
// 测试 CRM Bridge
window.crmBridge.sendToCrm(window.SITE_CONFIG.planEndpoint, {
    email: 'test@example.com',
    name: '测试用户',
    goal: 'stress-relief',
    time: 'morning'
});

// 测试邮件自动化
window.emailAutomation.subscribe('test@example.com', {
    mergeFields: { FNAME: '测试', LNAME: '用户' },
    tags: ['7-day-meditation-plan']
});
```

---

## 故障排查

### 常见问题

#### 1. HubSpot 表单提交失败

**错误**: `403 Forbidden` 或 `Invalid form GUID`

**解决方案**:
- 检查 Portal ID 和 Form GUID 是否正确
- 确认表单已在 HubSpot 中创建并发布
- 检查表单字段名称是否与 HubSpot 字段匹配

**错误**: `CORS policy` 错误

**解决方案**:
- HubSpot Forms API 支持 CORS，检查 API 端点是否正确
- 如果使用 HubSpot CRM API，需要通过后端调用

#### 2. Mailchimp 订阅失败

**错误**: `CORS policy` 错误

**解决方案**:
- Mailchimp API 不支持直接从前端调用
- 使用后端中间件或 Zapier Webhook

**错误**: `Member already exists`

**解决方案**:
- 使用 `PUT` 方法而非 `POST`，或设置 `update_existing: true`

#### 3. 自动化流程未触发

**检查清单**:
- [ ] 确认 Mailchimp Automation 已启用
- [ ] 检查触发条件（标签、列表等）是否正确
- [ ] 验证联系人是否成功添加到列表
- [ ] 查看 Mailchimp Automation 日志

#### 4. 字段映射不正确

**检查清单**:
- [ ] 确认 HubSpot/Mailchimp 中已创建自定义字段
- [ ] 检查字段名称是否完全匹配（区分大小写）
- [ ] 验证字段类型是否兼容

### 调试技巧

#### 1. 启用详细日志

在 `assets/js/crm-bridge.js` 中添加日志:

```javascript
async function sendToCrm(endpoint, payload) {
    console.log('[CRM Bridge] Sending to CRM:', { endpoint, payload });

    // ... 现有代码 ...

    console.log('[CRM Bridge] Response:', response);
}
```

#### 2. 使用 Network 面板

1. 打开浏览器开发者工具
2. 切换到 **Network** 面板
3. 提交表单
4. 查找 CRM/邮件 API 请求
5. 检查请求和响应详情

#### 3. Webhook 调试工具

使用 [RequestBin](https://requestbin.com/) 或 [Webhook.site](https://webhook.site/) 测试 Webhook:

1. 创建临时 Webhook URL
2. 在 `config.js` 中配置该 URL
3. 提交表单
4. 查看 Webhook 收到的数据

---

## 下一步

配置完成后，建议:

1. **创建邮件模板** - 参考 `docs/EMAIL-TEMPLATES.md`
2. **配置分析追踪** - 确保 Amplitude/GA4 捕获 CRM 事件
3. **设置告警** - 在 CRM 中配置失败通知
4. **定期审查数据** - 每周检查联系人质量和邮件效果

---

**维护者**: SoundFlows Marketing Team
**文档版本**: 1.0
**最后更新**: 2025-10-18
