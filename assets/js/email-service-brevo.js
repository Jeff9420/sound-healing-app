/**
 * Brevo (Sendinblue) Email Service Integration
 *
 * 使用Brevo API发送邮件
 * 免费计划：300封/天 (9000封/月)
 *
 * @version 1.0.0
 * @date 2025-01-24
 */

class BrevoEmailService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.endpoint = 'https://api.brevo.com/v3/smtp/email';

        // 邮件队列管理
        this.emailQueue = [];
        this.isProcessing = false;
        this.rateLimitDelay = 2000; // 2秒延迟避免触发限制
        this.dailyLimit = 300; // 每日限制
        this.monthlyLimit = 9000; // 每月限制
    }

    /**
     * 发送邮件
     * @param {Object} options - 邮件选项
     * @param {string} options.to - 收件人邮箱
     * @param {string} options.subject - 邮件主题
     * @param {string} options.html - HTML内容
     * @param {string} options.text - 纯文本内容（可选）
     * @param {string} options.from - 发件人邮箱（可选）
     * @param {string} options.fromName - 发件人姓名（可选）
     * @returns {Promise} 发送结果
     */
    async sendEmail(options) {
        const {
            to,
            subject,
            html,
            text = this.htmlToText(html),
            from = 'noreply@soundflows.app',
            fromName = 'SoundFlows'
        } = options;

        try {
            // 验证必要参数
            if (!to || !subject || !html) {
                throw new Error('Missing required parameters: to, subject, or html');
            }

            // 检查每日限制
            if (!this.checkDailyLimit()) {
                throw new Error('Daily email limit reached (300 emails/day)');
            }

            // 构建Brevo邮件数据
            const payload = {
                sender: {
                    name: fromName,
                    email: from
                },
                to: [{
                    email: to
                }],
                subject: subject,
                htmlContent: html,
                textContent: text
            };

            // 发送邮件
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'api-key': this.apiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                console.log('✅ Email sent successfully via Brevo:', result.messageId);

                // 记录发送
                this.recordEmailSent();

                return {
                    success: true,
                    messageId: result.messageId,
                    message: 'Email sent successfully'
                };
            } else {
                throw new Error(result.message || result.code || 'Failed to send email');
            }

        } catch (error) {
            console.error('❌ Brevo email service error:', error);
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
        console.log(`📧 Starting batch send via Brevo: ${emailList.length} emails`);

        const results = [];
        let successCount = 0;

        for (let i = 0; i < emailList.length; i++) {
            const email = emailList[i];

            // 检查每日限制
            if (!this.checkDailyLimit()) {
                console.log('⚠️ Daily limit reached, stopping batch send');
                results.push({
                    success: false,
                    error: 'Daily limit reached',
                    to: email.to
                });
                continue;
            }

            try {
                const result = await this.sendEmail(email);
                results.push(result);
                if (result.success) successCount++;

                // 速率限制：每封邮件间隔2秒（Brevo要求更严格）
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

        console.log(`✅ Batch send complete: ${successCount}/${emailList.length} successful`);

        return results;
    }

    /**
     * 检查每日发送限制
     * @returns {boolean} 是否可以发送
     */
    checkDailyLimit() {
        const today = new Date().toDateString();
        const stats = this.getSendingStats();

        if (stats.date === today && stats.sent >= this.dailyLimit) {
            return false;
        }
        return true;
    }

    /**
     * 记录邮件发送
     */
    recordEmailSent() {
        const today = new Date().toDateString();
        let stats = JSON.parse(localStorage.getItem('brevoDailyStats') || '{}');

        if (stats.date !== today) {
            stats = {
                date: today,
                sent: 0,
                successful: 0
            };
        }

        stats.sent += 1;
        stats.successful += 1;
        localStorage.setItem('brevoDailyStats', JSON.stringify(stats));
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
     * HTML转纯文本
     */
    htmlToText(html) {
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
            service: 'Brevo',
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
        const dailyStats = JSON.parse(localStorage.getItem('brevoDailyStats') || '{}');
        const today = new Date().toDateString();

        const todayLogs = logs.filter(log =>
            new Date(log.timestamp).toDateString() === today &&
            log.service === 'Brevo'
        );

        return {
            total: logs.filter(l => l.service === 'Brevo').length,
            today: todayLogs.length,
            sent: dailyStats.sent || 0,
            successful: logs.filter(l => l.success && l.service === 'Brevo').length,
            failed: logs.filter(l => !l.success && l.service === 'Brevo').length,
            lastSent: logs.length > 0 ? logs[logs.length - 1].timestamp : null,
            dailyLimit: this.dailyLimit,
            monthlyLimit: this.monthlyLimit,
            remaining: Math.max(0, this.dailyLimit - (dailyStats.sent || 0))
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

    /**
     * 获取剩余发送额度
     */
    getRemainingQuota() {
        const stats = this.getSendingStats();
        return {
            daily: Math.max(0, this.dailyLimit - stats.sent),
            monthly: Math.max(0, this.monthlyLimit - stats.total)
        };
    }
}

// 初始化Brevo邮件服务
function initBrevoService() {
    // 从localStorage读取配置
    const savedConfig = localStorage.getItem('brevoConfig') || localStorage.getItem('emailServiceConfig');

    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            if (config.service === 'brevo' && config.apiKey) {
                const brevoService = new BrevoEmailService(config.apiKey);
                window.emailService = brevoService;
                console.log('✅ Brevo email service initialized');
                console.log(`📊 Daily limit: ${brevoService.dailyLimit} emails`);
                console.log(`📊 Monthly limit: ${brevoService.monthlyLimit} emails`);
                return brevoService;
            }
        } catch (e) {
            console.warn('Brevo配置解析失败:', e);
        }
    }

    // 如果没有配置，提供默认配置
    const BREVO_CONFIG = {
        apiKey: '' // 替换为您的Brevo API Key，格式：xkeysib-xxxxxxxxx
    };

    if (BREVO_CONFIG.apiKey) {
        const brevoService = new BrevoEmailService(BREVO_CONFIG.apiKey);
        window.emailService = brevoService;
        console.log('✅ Brevo email service initialized');
        return brevoService;
    } else {
        console.warn('⚠️ Brevo configuration missing. Please configure your API key.');
        console.log('📝 To configure:');
        console.log('1. Visit https://www.brevo.com/free-signup/ to register');
        console.log('2. Get your API key from SMTP & API > API Keys');
        console.log('3. Use brevo-quick-setup.html for quick configuration');

        return null;
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    const service = initBrevoService();

    // 暴露到全局作用域供其他脚本使用
    window.initBrevoService = initBrevoService;
    window.BrevoEmailService = BrevoEmailService;
});

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BrevoEmailService, initBrevoService };
}

console.log('✅ Brevo email service loaded');