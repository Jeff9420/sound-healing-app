/**
 * SoundFlows 全局配置
 *
 * 此文件包含 CRM 集成、邮件营销自动化和账户系统的配置。
 *
 * 📖 完整配置指南: docs/CRM-EMAIL-INTEGRATION-GUIDE.md
 * 📧 邮件模板: docs/EMAIL-TEMPLATES.md
 *
 * 快速开始:
 * 1. 选择 CRM 平台 (推荐 HubSpot 免费版)
 * 2. 选择邮件平台 (推荐 Mailchimp 免费版)
 * 3. 按照下方示例配置端点和密钥
 * 4. 测试配置 (参考 docs/CRM-EMAIL-INTEGRATION-GUIDE.md 测试部分)
 */

window.SITE_CONFIG = window.SITE_CONFIG || {
    /**
     * CRM 配置 - 表单提交到 CRM 系统
     *
     * 推荐方案:
     * - HubSpot Forms API (免费,易用,无需后端)
     * - Zapier Webhook (无代码方案)
     * - 自定义后端 API
     */

    // 资源订阅表单提交端点
    // 示例 (HubSpot): "https://api.hsforms.com/submissions/v3/integration/submit/12345678/form-guid-here"
    // 示例 (Zapier): "https://hooks.zapier.com/hooks/catch/12345/abcde/"
    subscribeEndpoint: "https://api.hsforms.com/submissions/v3/integration/submit/244150644/ec666460-ee7c-4057-97a6-d6f1fdd9c061",

    // 7日冥想计划表单提交端点
    // 示例 (HubSpot): "https://api.hsforms.com/submissions/v3/integration/submit/12345678/form-guid-here"
    // 示例 (Zapier): "https://hooks.zapier.com/hooks/catch/12345/fghij/"
    // 注意: 目前使用与订阅表单相同的端点，待第二个表单创建后再更新
    planEndpoint: "https://api.hsforms.com/submissions/v3/integration/submit/244150644/ec666460-ee7c-4057-97a6-d6f1fdd9c061",

    /**
     * 邮件营销自动化配置
     *
     * 支持的平台:
     * - Mailchimp (推荐) - 免费 500 联系人
     * - SendGrid - 免费 100 邮件/天
     * - Brevo (Sendinblue) - 免费 300 邮件/天
     * - HubSpot - 免费版含邮件功能
     * - 自定义 API
     *
     * 注意: 大多数邮件 API 不支持直接从前端调用 (CORS限制),
     * 需要通过后端中间件或 Zapier/Make.com 等无代码工具。
     */
    emailAutomation: {
        // 平台类型: "mailchimp" | "sendgrid" | "brevo" | "hubspot" | "zapier" | "custom"
        provider: "custom",

        // API 端点
        // Mailchimp (通过后端): "https://your-backend.com/api/email/subscribe"
        // SendGrid (通过后端): "https://api.sendgrid.com/v3/marketing/contacts"
        // Brevo (通过后端): "https://api.brevo.com/v3/contacts"
        // Zapier Webhook: "https://hooks.zapier.com/hooks/catch/12345/abcde/"
        // HubSpot: 留空 (通过 CRM 自动化处理)
        endpoint: "",

        // HTTP 方法
        method: "POST",

        // Mailchimp Audience ID 或其他平台的列表 ID
        // 获取方式: Mailchimp -> Audience -> Settings -> Audience ID
        listId: "",

        // 是否启用双重确认 (Double Opt-In)
        // true: 用户需要点击确认邮件才算订阅成功
        // false: 提交后立即订阅
        doubleOptIn: false,

        // 默认标签 (用于自动化流程触发)
        // 示例: ["website-subscriber", "7-day-plan"]
        tags: [],

        // 自定义 HTTP 请求头
        // 注意: 如果使用后端,认证应在后端处理,这里留空
        headers: {
            // "Content-Type": "application/json" // 自动添加
        },

        // 认证方案: "Bearer" | "Basic" | "api-key" | ""
        // Bearer: Authorization: Bearer {apiKey}
        // Basic: Authorization: Basic {base64(apiKey:apiSecret)}
        // api-key: Authorization: api-key {apiKey} (Brevo 使用)
        // "": 仅使用 apiKey 值作为 Authorization
        authScheme: "Bearer",

        // API 密钥
        // 注意: 生产环境不应在前端暴露 API 密钥!
        // 使用后端中间件或 Zapier/Make.com 代替
        apiKey: "",

        // API 密钥对 (用于 Basic Auth)
        apiSecret: "",

        // 默认请求载荷 (会合并到每个请求中)
        // 示例:
        // {
        //     "source": "website",
        //     "language": "zh-CN",
        //     "updateEnabled": true
        // }
        defaultPayload: {}
    },

    /**
     * 账户系统配置 (未来扩展)
     *
     * 用于用户注册、登录和个性化功能。
     * 目前为预留配置,暂未实现。
     */
    account: {
        // 注册 API 端点
        signupEndpoint: "",

        // 登录 API 端点
        loginEndpoint: "",

        // 登录后重定向 URL
        redirectUrl: ""
    }
};

/**
 * 配置示例
 *
 * 以下是常见平台的配置示例,根据你选择的平台取消注释并填入真实值。
 */

// ========================================
// 示例 1: HubSpot CRM + HubSpot Email (一体化方案,推荐)
// ========================================
/*
window.SITE_CONFIG = {
    // HubSpot Forms API - 无需后端
    subscribeEndpoint: "https://api.hsforms.com/submissions/v3/integration/submit/YOUR_PORTAL_ID/SUBSCRIBE_FORM_GUID",
    planEndpoint: "https://api.hsforms.com/submissions/v3/integration/submit/YOUR_PORTAL_ID/PLAN_FORM_GUID",

    // HubSpot 通过 Workflows 处理邮件,无需额外配置
    emailAutomation: {
        provider: "hubspot",
        endpoint: "",
        apiKey: ""
    }
};

获取 HubSpot 配置:
1. Portal ID: HubSpot -> Settings -> Account Defaults
2. Form GUID: HubSpot -> Marketing -> Forms -> 创建表单后在 URL 中查看
3. 设置 Workflow: Automation -> Workflows -> 创建 contact-based workflow

优势: 完全免费,一站式解决方案,易于设置
劣势: 邮件模板较基础
*/

// ========================================
// 示例 2: HubSpot CRM + Mailchimp Email (最佳组合)
// ========================================
/*
window.SITE_CONFIG = {
    // HubSpot CRM
    subscribeEndpoint: "https://api.hsforms.com/submissions/v3/integration/submit/YOUR_PORTAL_ID/SUBSCRIBE_FORM_GUID",
    planEndpoint: "https://api.hsforms.com/submissions/v3/integration/submit/YOUR_PORTAL_ID/PLAN_FORM_GUID",

    // Mailchimp (通过 Zapier Webhook 或后端)
    emailAutomation: {
        provider: "mailchimp",
        endpoint: "https://hooks.zapier.com/hooks/catch/12345/abcde/", // Zapier Webhook URL
        method: "POST",
        listId: "", // 在 Zapier 中配置
        tags: ["7-day-meditation-plan"]
    }
};

设置 Zapier:
1. 创建 Zap: Webhook -> Mailchimp Add/Update Subscriber
2. 配置 Webhook URL 和 Mailchimp 连接
3. 映射字段: email, FNAME, LNAME, GOAL, TIME_PREF
4. 设置标签触发 Mailchimp Automation

优势: HubSpot 免费 CRM + Mailchimp 丰富邮件模板
劣势: 需要管理两个平台
*/

// ========================================
// 示例 3: Zapier Webhook (最简单的无代码方案)
// ========================================
/*
window.SITE_CONFIG = {
    // 通过 Zapier 连接到任意 CRM
    subscribeEndpoint: "https://hooks.zapier.com/hooks/catch/12345/subscribe/",
    planEndpoint: "https://hooks.zapier.com/hooks/catch/12345/plan/",

    // 通过 Zapier 连接到 Mailchimp
    emailAutomation: {
        provider: "zapier",
        endpoint: "https://hooks.zapier.com/hooks/catch/12345/email/",
        method: "POST"
    }
};

设置 Zapier:
1. 创建 3 个 Zap (订阅、计划、邮件)
2. Trigger: Webhooks by Zapier -> Catch Hook
3. Action: 连接到你选择的 CRM/邮件平台
4. 测试并激活

优势: 无需代码,灵活连接任意平台
劣势: 免费版每月只有 100 个任务
*/

// ========================================
// 示例 4: 自定义后端 API (高级方案)
// ========================================
/*
window.SITE_CONFIG = {
    // 自己的后端 API
    subscribeEndpoint: "https://api.yourdomain.com/subscribe",
    planEndpoint: "https://api.yourdomain.com/plan",

    emailAutomation: {
        provider: "custom",
        endpoint: "https://api.yourdomain.com/email/subscribe",
        method: "POST",
        headers: {
            "X-API-Key": "your-api-key" // 或在后端通过 Cookie/Session 验证
        }
    }
};

后端实现参考: docs/CRM-EMAIL-INTEGRATION-GUIDE.md

优势: 完全控制,可以添加自定义逻辑
劣势: 需要开发和维护后端
*/

// ========================================
// 测试配置
// ========================================
// 配置完成后,在浏览器控制台测试:
//
// // 测试 CRM Bridge
// window.crmBridge.sendToCrm(window.SITE_CONFIG.planEndpoint, {
//     email: 'test@example.com',
//     name: '测试用户',
//     goal: 'stress-relief',
//     time: 'morning'
// });
//
// // 测试邮件自动化
// window.emailAutomation.subscribe('test@example.com', {
//     mergeFields: { FNAME: '测试', LNAME: '用户' },
//     tags: ['test']
// });
//
// 详细测试指南: docs/CRM-EMAIL-INTEGRATION-GUIDE.md 测试部分
