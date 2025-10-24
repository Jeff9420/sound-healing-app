/**
 * Mailgun Email Service Integration
 *
 * 使用Mailgun API发送邮件
 * 免费计划：5000封/月
 *
 * @version 1.0.0
 * @date 2025-01-24
 */

class MailgunEmailService {
    constructor(apiKey, domain) {
        this.apiKey = apiKey;
        this.domain = domain;
        this.baseUrl = `https://api.mailgun.net/v3/${domain}`;

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
     * @param {string} options.text - 纯文本内容（可选）
     * @param {string} options.from - 发件人邮箱（可选）
     * @param {Object} options.templateData - 模板数据（可选）
     * @returns {Promise} 发送结果
     */
    async sendEmail(options) {
        const {
            to,
            subject,
            html,
            text = this.htmlToText(html),
            from = `SoundFlows <noreply@${this.domain}>`,
            templateData = {}
        } = options;

        try {
            // 验证必要参数
            if (!to || !subject || !html) {
                throw new Error('Missing required parameters: to, subject, or html');
            }

            // 构建邮件数据
            const emailData = {
                from: from,
                to: to,
                subject: subject,
                text: text,
                html: html
            };

            // 添加模板数据到邮件头部（用于追踪）
            if (Object.keys(templateData).length > 0) {
                emailData['h:X-Mailgun-Variables'] = JSON.stringify(templateData);
            }

            // 发送邮件
            const response = await fetch(`${this.baseUrl}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${btoa('api:' + this.apiKey)}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: this.buildFormData(emailData)
            });

            const result = await response.json();

            if (response.ok) {
                console.log('✅ Email sent successfully:', result.id);
                return {
                    success: true,
                    messageId: result.id,
                    message: 'Email sent successfully'
                };
            } else {
                throw new Error(result.message || 'Failed to send email');
            }

        } catch (error) {
            console.error('❌ Email service error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 使用模板发送邮件
     * @param {string} to - 收件人邮箱
     * @param {string} templateType - 模板类型 (welcome, passwordReset, dailyReminder, weeklyDigest)
     * @param {string} language - 语言代码
     * @param {Object} variables - 模板变量
     * @returns {Promise} 发送结果
     */
    async sendTemplateEmail(to, templateType, language, variables = {}) {
        try {
            // 获取邮件模板
            const template = window.emailTemplatesI18n.getTemplate(language, templateType, variables);

            // 添加模板追踪数据
            const templateData = {
                templateType: templateType,
                language: language,
                sentAt: new Date().toISOString()
            };

            // 发送邮件
            const result = await this.sendEmail({
                to: to,
                subject: template.subject,
                html: template.html,
                templateData: templateData
            });

            // 记录发送日志（可选）
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
        console.log(`📧 Starting batch send: ${emailList.length} emails`);

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
     * 构建表单数据（Mailgun API要求）
     */
    buildFormData(data) {
        const formData = new FormData();
        for (const key in data) {
            formData.append(key, data[key]);
        }
        return formData;
    }

    /**
     * HTML转纯文本
     */
    htmlToText(html) {
        // 简单的HTML转文本处理
        return html
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, ' ')
            .trim();
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
            success: success
        };

        // 存储到localStorage（可选）
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
            new Date(log.timestamp).toDateString() === today
        );

        return {
            total: logs.length,
            today: todayStats.length,
            success: logs.filter(log => log.success).length,
            failed: logs.filter(log => !log.success).length,
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
            'en-US',
            {
                userName: 'Test User',
                siteUrl: window.location.origin
            }
        );
    }
}

// 初始化邮件服务
function initMailgunService() {
    // 首先尝试从localStorage读取配置
    const savedConfig = localStorage.getItem('mailgunConfig');
    let MAILGUN_CONFIG;

    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            MAILGUN_CONFIG = {
                apiKey: config.apiKey || '',
                domain: config.domain || ''
            };
        } catch (e) {
            console.warn('配置解析失败，使用默认配置');
        }
    }

    // 如果没有保存的配置，使用默认值
    if (!MAILGUN_CONFIG) {
        MAILGUN_CONFIG = {
            // 替换为您的实际API密钥
            apiKey: '', // 例如：'key-1234567890abcdef1234567890abcdef'
            // 替换为您的sandbox域名
            domain: '' // 例如：'sandbox12345.mailgun.org'
        };
    }

    // 如果配置存在，创建服务实例
    if (MAILGUN_CONFIG.apiKey && MAILGUN_CONFIG.domain) {
        const mailgunService = new MailgunEmailService(
            MAILGUN_CONFIG.apiKey,
            MAILGUN_CONFIG.domain
        );

        window.emailService = mailgunService;
        console.log('✅ Mailgun email service initialized');

        return mailgunService;
    } else {
        console.warn('⚠️ Mailgun configuration missing. Please configure your API key and domain.');
        console.log('📝 To configure:');
        console.log('1. Edit assets/js/email-service-mailgun.js');
        console.log('2. Fill in your Mailgun API key and domain');

        return null;
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    const service = initMailgunService();

    // 暴露到全局作用域供其他脚本使用
    window.initMailgunService = initMailgunService;
});

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MailgunEmailService, initMailgunService };
}

console.log('✅ Mailgun email service loaded');