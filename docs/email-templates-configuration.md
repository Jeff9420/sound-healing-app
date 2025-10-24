# 邮件模板多语言配置指南

## 概述
已完成5种语言的邮件模板翻译，支持：
- English (en-US)
- 简体中文 (zh-CN)
- 日本語 (ja-JP)
- 한국어 (ko-KR)
- Español (es-ES)

## 已实现的邮件模板类型

### 1. 欢迎邮件 (Welcome Email)
**用途**: 新用户注册后的欢迎邮件
**包含内容**:
- 平台介绍
- 主要功能列表
- 快速入门提示
- CTA按钮

### 2. 密码重置邮件 (Password Reset)
**用途**: 用户忘记密码时发送重置链接
**包含内容**:
- 安全的重置按钮
- 有效期提醒（24小时）
- 安全提示

### 3. 每日提醒邮件 (Daily Reminder)
**用途**: 每日冥想练习提醒
**包含内容**:
- 连续练习天数
- 每日引言
- 推荐音频
- 取消订阅链接

### 4. 周报邮件 (Weekly Digest)
**用途**: 每周发送使用统计和进度
**包含内容**:
- 使用统计数据
- 成就展示
- 下周建议
- 查看详细报告链接

## 技术实现

### 文件位置
- **主文件**: `assets/js/email-templates-i18n.js`
- **配置指南**: `docs/email-templates-configuration.md`

### 使用方法

```javascript
// 1. 获取邮件模板
const template = window.emailTemplatesI18n.getTemplate(
    'zh-CN',  // 语言
    'welcome', // 模板类型
    {         // 变量替换
        userName: '小明',
        siteUrl: 'https://soundflows.app'
    }
);

// 2. 发送邮件（集成邮件服务后）
await window.emailTemplatesI18n.sendEmail(
    'user@example.com',
    'welcome',
    { userName: '小明', siteUrl: 'https://soundflows.app' },
    'zh-CN'
);
```

### 模板变量列表

#### 通用变量
- `{{userName}}` - 用户名称
- `{{siteUrl}}` - 网站URL

#### 每日提醒变量
- `{{streakDays}}` - 连续练习天数
- `{{dailyQuote}}` - 每日引言
- `{{recommendedTrack}}` - 推荐音频
- `{{unsubscribeUrl}}` - 取消订阅链接

#### 周报变量
- `{{totalSessions}}` - 总课程数
- `{{totalMinutes}}` - 总分钟数
- `{{favoriteCategory}}` - 最爱分类
- `{{mostPlayedTrack}}` - 最常播放
- `{{weeklyAchievement}}` - 周成就
- `{{weeklyTip}}` - 周建议

#### 密码重置变量
- `{{resetUrl}}` - 重置密码链接

## 邮件服务集成步骤

### 1. 选择邮件服务提供商
推荐选项：
- **SendGrid** (免费100封/天)
- **Mailgun** (免费5000封/月)
- **Amazon SES** (按量付费，$0.10/1000封)
- **Brevo (Sendinblue)** (免费300封/天)

### 2. 配置步骤（以SendGrid为例）

#### 步骤1: 注册SendGrid账户
1. 访问 https://sendgrid.com
2. 注册免费账户
3. 验证邮箱域名

#### 步骤2: 获取API密钥
1. 进入 Settings > API Keys
2. 创建新的API密钥
3. 保存密钥（只显示一次）

#### 步骤3: 创建邮件发送函数

```javascript
// assets/js/email-service.js
class EmailService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.endpoint = 'https://api.sendgrid.com/v3/mail/send';
    }

    async sendEmail(options) {
        const { to, subject, html, from } = options;

        const payload = {
            personalizations: [{
                to: [{ email: to }],
                subject: subject
            }],
            from: { email: from || 'noreply@soundflows.app' },
            content: [{
                type: 'text/html',
                value: html
            }]
        };

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                return { success: true, message: 'Email sent successfully' };
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to send email');
            }
        } catch (error) {
            console.error('Email service error:', error);
            return { success: false, error: error.message };
        }
    }
}

// 创建全局实例
window.emailService = new EmailService('YOUR_SENDGRID_API_KEY');
```

### 3. 集成到现有系统

#### 在用户注册时发送欢迎邮件
```javascript
// 在注册成功后
async function handleSuccessfulRegistration(userEmail, userName, language) {
    const template = window.emailTemplatesI18n.getTemplate(language, 'welcome', {
        userName: userName,
        siteUrl: window.location.origin
    });

    await window.emailService.sendEmail({
        to: userEmail,
        subject: template.subject,
        html: template.html
    });
}
```

#### 设置每日提醒
```javascript
// 设置每日定时任务
async function sendDailyReminder(userEmail, language, userData) {
    const quotes = {
        'en-US': ["The mind is everything. What you think you become.", "Peace comes from within. Do not seek it without."],
        'zh-CN': ["心是一切，你心所想，即你所是。", "平和来自内心，莫向外求。"],
        // ... 其他语言
    };

    const dailyQuote = quotes[language][Math.floor(Math.random() * quotes[language].length)];

    const template = window.emailTemplatesI18n.getTemplate(language, 'dailyReminder', {
        userName: userData.name,
        streakDays: userData.streakDays,
        dailyQuote: dailyQuote,
        recommendedTrack: userData.recommendedTrack,
        siteUrl: window.location.origin,
        unsubscribeUrl: `${window.location.origin}/unsubscribe?email=${userEmail}`
    });

    await window.emailService.sendEmail({
        to: userEmail,
        subject: template.subject,
        html: template.html
    });
}
```

## 本地测试方法

### 1. 创建测试页面
```html
<!-- test-email-templates.html -->
<!DOCTYPE html>
<html>
<head>
    <title>邮件模板测试</title>
</head>
<body>
    <h1>邮件模板测试</h1>
    <div>
        <select id="language">
            <option value="en-US">English</option>
            <option value="zh-CN">简体中文</option>
            <option value="ja-JP">日本語</option>
            <option value="ko-KR">한국어</option>
            <option value="es-ES">Español</option>
        </select>

        <select id="templateType">
            <option value="welcome">欢迎邮件</option>
            <option value="passwordReset">密码重置</option>
            <option value="dailyReminder">每日提醒</option>
            <option value="weeklyDigest">周报</option>
        </select>

        <button onclick="previewEmail()">预览邮件</button>
    </div>

    <iframe id="emailPreview" style="width: 100%; height: 600px; border: 1px solid #ccc;"></iframe>

    <script src="assets/js/email-templates-i18n.js"></script>
    <script>
        function previewEmail() {
            const language = document.getElementById('language').value;
            const type = document.getElementById('templateType').value;

            const variables = {
                userName: '测试用户',
                siteUrl: 'https://soundflows.app',
                streakDays: 7,
                dailyQuote: '每一天都是新的开始',
                recommendedTrack: '雨声冥想',
                totalSessions: 14,
                totalMinutes: 180,
                favoriteCategory: '冥想音乐',
                mostPlayedTrack: '清晨冥想',
                weeklyAchievement: '本周完成了7天连续练习！',
                weeklyTip: '尝试新的音频类型来丰富你的体验',
                resetUrl: 'https://soundflows.app/reset-password?token=abc123',
                unsubscribeUrl: 'https://soundflows.app/unsubscribe'
            };

            const template = window.emailTemplatesI18n.getTemplate(language, type, variables);
            const iframe = document.getElementById('emailPreview');
            iframe.srcdoc = template.html;
        }

        // 默认加载
        previewEmail();
    </script>
</body>
</html>
```

### 2. 测试所有语言
1. 打开测试页面
2. 选择不同语言和模板类型
3. 检查：
   - 文字显示是否正确
   - 布局是否完整
   - 变量是否正确替换
   - 按钮和链接是否正常

## 性能优化建议

### 1. 模板缓存
```javascript
// 在内存中缓存已渲染的模板
const templateCache = new Map();

function getCachedTemplate(language, type, variables) {
    const key = `${language}-${type}-${JSON.stringify(variables)}`;

    if (templateCache.has(key)) {
        return templateCache.get(key);
    }

    const template = emailTemplatesI18n.getTemplate(language, type, variables);
    templateCache.set(key, template);
    return template;
}
```

### 2. 批量发送优化
```javascript
// 批量发送时使用队列
class EmailQueue {
    constructor() {
        this.queue = [];
        this.sending = false;
    }

    async addToQueue(emailData) {
        this.queue.push(emailData);
        if (!this.sending) {
            this.processQueue();
        }
    }

    async processQueue() {
        this.sending = true;

        while (this.queue.length > 0) {
            const emailData = this.queue.shift();
            await this.sendEmail(emailData);

            // 避免发送频率限制
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        this.sending = false;
    }
}
```

## 合规性注意事项

### 1. GDPR合规
- 提供取消订阅链接
- 获得用户同意
- 保护用户数据

### 2. CAN-SPAM合规
- 包含准确的发件人信息
- 提供物理地址
- 不使用误导性标题

### 3. 最佳实践
- 响应式设计
- 纯文本备选
- 避免垃圾邮件词汇
- 测试所有邮件客户端

## 完成检查清单

- [x] 创建5种语言的邮件模板
- [x] 实现模板变量系统
- [x] 创建邮件发送服务框架
- [x] 提供集成指南
- [x] 创建测试页面
- [x] 添加性能优化建议
- [x] 包含合规性指南

## 下一步操作

1. **选择邮件服务提供商**并获取API密钥
2. **配置邮件发送服务**（参考集成步骤）
3. **在注册/密码重置流程中集成邮件发送**
4. **设置定时任务**（每日提醒、周报）
5. **测试所有语言的邮件发送**
6. **监控邮件发送状态和用户反馈**

---

**预计完成时间**: 8小时（包括配置和测试）
**难度等级**: ⭐⭐⭐ (中等)
**需要配置**: 邮件服务API密钥