/**
 * SendGrid Email Service Integration
 *
 * 使用SendGrid API发送邮件
 * 免费计划：100封/天 (3000封/月)
 *
 * @version 1.0.0
 * @date 2025-01-24
 */

class SendGridEmailService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.endpoint = 'https://api.sendgrid.com/v3/mail/send';

        // 邮件队列管理
        this.emailQueue = [];
        this.isProcessing = false;
        this.rateLimitDelay = 1000; // 1秒延迟避免触发限制
    }

    /**
     * 发送邮件
     * @param {Object} options - 邮件选项
     * @param {string} options.to - 收件人邮箱
     * @param {string} options.subject - 邮件主题
     * @param {string} options.html - HTML内容
     * @param {string} options.from - 发件人邮箱（可选）
     * @returns {Promise} 发送结果
     */
    async sendEmail(options) {
        const {
            to,
            subject,
            html,
            from = 'SoundFlows <noreply@soundflows.app>'
        } = options;

        try {
            // 验证必要参数
            if (!to || !subject || !html) {
                throw new Error('Missing required parameters: to, subject, or html');
            }

            // 构建SendGrid邮件数据
            const payload = {
                personalizations: [{
                    to: [{ email: to }],
                    subject: subject
                }],
                from: { email: from },
                content: [{
                    type: 'text/html',
                    value: html
                }],
                tracking_settings: {
                    click_tracking: { enable: true },
                    open_tracking: { enable: true }
                }
            };

            // 发送邮件
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                console.log('✅ Email sent successfully via SendGrid');
                return {
                    success: true,
                    message: 'Email sent successfully'
                };
            } else {
                const error = await response.json();
                throw new Error(error.errors?.[0]?.message || 'Failed to send email');
            }

        } catch (error) {
            console.error('❌ SendGrid email service error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 使用模板发送邮件
     * @param {string} to - 收件人邮箱
     * @param {string} templateType - 模板类型
     * @param {string} language - 语言代码
     * @param {Object} variables - 模板变量
     * @returns {Promise} 发送结果
     */
    async sendTemplateEmail(to, templateType, language, variables = {}) {
        try {
            // 获取邮件模板
            const template = window.emailTemplatesI18n.getTemplate(language, templateType, variables);

            // 发送邮件
            const result = await this.sendEmail({
                to: to,
                subject: template.subject,
                html: template.html
            });

            // 记录发送日志
            this.logEmailSent(to, templateType, language, result.success);

            return result;

        } catch (error) {
            console.error('Template email error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 批量发送邮件（带速率限制）
     * @param {Array} emailList - 邮件列表
     * @returns {Promise} 发送结果
     */
    async sendBatchEmails(emailList) {
        console.log(`📧 Starting batch send via SendGrid: ${emailList.length} emails`);

        const results = [];

        for (let i = 0; i < emailList.length; i++) {
            const email = emailList[i];

            try {
                const result = await this.sendEmail(email);
                results.push(result);

                // 速率限制：每封邮件间隔1秒
                if (i < emailList.length - 1) {
                    await this.delay(this.rateLimitDelay);
                }
            } catch (error) {
                results.push({
                    success: false,
                    error: error.message,
                    to: email.to
                });
            }
        }

        const successCount = results.filter(r => r.success).length;
        console.log(`✅ Batch send complete: ${successCount}/${emailList.length} successful`);

        return results;
    }

    /**
     * 验证邮箱地址格式
     * @param {string} email - 邮箱地址
     * @returns {boolean} 是否有效
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * 记录邮件发送日志
     */
    logEmailSent(to, templateType, language, success) {
        const log = {
            timestamp: new Date().toISOString(),
            to: to,
            template: templateType,
            language: language,
            service: 'SendGrid',
            success: success
        };

        // 存储到localStorage
        const logs = JSON.parse(localStorage.getItem('emailLogs') || '[]');
        logs.push(log);

        // 只保留最近100条记录
        if (logs.length > 100) {
            logs.splice(0, logs.length - 100);
        }

        localStorage.setItem('emailLogs', JSON.stringify(logs));
    }

    /**
     * 获取发送统计
     */
    getSendingStats() {
        const logs = JSON.parse(localStorage.getItem('emailLogs') || '[]');
        const today = new Date().toDateString();

        const todayStats = logs.filter(log =>
            new Date(log.timestamp).toDateString() === today &&
            log.service === 'SendGrid'
        );

        return {
            total: logs.filter(l => l.service === 'SendGrid').length,
            today: todayStats.length,
            success: logs.filter(l => l.success && l.service === 'SendGrid').length,
            failed: logs.filter(l => !l.success && l.service === 'SendGrid').length,
            lastSent: logs.length > 0 ? logs[logs.length - 1].timestamp : null
        };
    }

    /**
     * 延迟函数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 测试邮件服务
     */
    async testService(testEmail) {
        if (!this.validateEmail(testEmail)) {
            return {
                success: false,
                error: 'Invalid email address'
            };
        }

        return await this.sendTemplateEmail(
            testEmail,
            'welcome',
            'zh-CN',
            {
                userName: 'Test User',
                siteUrl: window.location.origin
            }
        );
    }
}

// 初始化SendGrid邮件服务
function initSendGridService() {
    // 从localStorage读取配置
    const savedConfig = localStorage.getItem('emailServiceConfig');

    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            if (config.service === 'sendgrid' && config.apiKey) {
                const sendgridService = new SendGridEmailService(config.apiKey);
                window.emailService = sendgridService;
                console.log('✅ SendGrid email service initialized');
                return sendgridService;
            }
        } catch (e) {
            console.warn('SendGrid配置解析失败:', e);
        }
    }

    // 如果没有配置，提供默认配置
    const SENDGRID_CONFIG = {
        apiKey: '' // 替换为您的SendGrid API Key，格式：SG.xxxxxxxxxx
    };

    if (SENDGRID_CONFIG.apiKey) {
        const sendgridService = new SendGridEmailService(SENDGRID_CONFIG.apiKey);
        window.emailService = sendgridService;
        console.log('✅ SendGrid email service initialized');
        return sendgridService;
    } else {
        console.warn('⚠️ SendGrid configuration missing. Please configure your API key.');
        console.log('📝 To configure:');
        console.log('1. Visit https://signup.sendgrid.com to register');
        console.log('2. Get your API key from Dashboard > Settings > API Keys');
        console.log('3. Use mailgun-alternative-setup.html for quick configuration');

        return null;
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    const service = initSendGridService();

    // 暴露到全局作用域供其他脚本使用
    window.initSendGridService = initSendGridService;
});

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SendGridEmailService, initSendGridService };
}

console.log('✅ SendGrid email service loaded');