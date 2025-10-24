/**
 * EmailJS Email Service Integration
 *
 * 使用EmailJS通过自己的邮箱发送邮件
 * 免费计划：200封/月
 *
 * @version 1.0.0
 * @date 2025-01-24
 */

class EmailJSEmailService {
    constructor(serviceId, templateId, publicKey) {
        this.serviceId = serviceId;
        this.templateId = templateId;
        this.publicKey = publicKey;
        this.monthlyLimit = 200;
        (function(d,t){
            var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
            g.src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
            g.type="text/javascript"; s.parentNode.insertBefore(g,s);
        }(document,"script"));
    }

    /**
     * 初始化EmailJS
     */
    async init() {
        try {
            if (window.emailjs) {
                await window.emailjs.init(this.publicKey);
                console.log('✅ EmailJS initialized');
                return true;
            } else {
                console.error('EmailJS SDK not loaded');
                return false;
            }
        } catch (error) {
            console.error('EmailJS initialization error:', error);
            return false;
        }
    }

    /**
     * 发送邮件
     * @param {Object} options - 邮件选项
     * @param {string} options.to - 收件人邮箱
     * @param {string} options.subject - 邮件主题
     * @param {string} options.html - HTML内容
     * @param {string} options.from - 发件人姓名
     * @returns {Promise} 发送结果
     */
    async sendEmail(options) {
        const {
            to,
            subject,
            html,
            from = 'SoundFlows',
            ...additionalParams
        } = options;

        try {
            // 检查每月限制
            if (!this.checkMonthlyLimit()) {
                throw new Error('Monthly email limit reached (200 emails/month)');
            }

            // 确保EmailJS已初始化
            if (!window.emailjs) {
                await this.waitForEmailJS();
            }

            // 准备发送参数
            const templateParams = {
                to_email: to,
                subject: subject,
                message: html,
                from_name: from,
                ...additionalParams
            };

            // 发送邮件
            const response = await window.emailjs.send(
                this.serviceId,
                this.templateId,
                templateParams
            );

            if (response.status === 200) {
                console.log('✅ Email sent successfully via EmailJS');

                // 记录发送
                this.recordEmailSent();

                return {
                    success: true,
                    messageId: response.id,
                    message: 'Email sent successfully'
                };
            } else {
                throw new Error('Failed to send email');
            }

        } catch (error) {
            console.error('❌ EmailJS error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 等待EmailJS加载
     */
    async waitForEmailJS() {
        return new Promise((resolve) => {
            const checkEmailJS = () => {
                if (window.emailjs) {
                    resolve();
                } else {
                    setTimeout(checkEmailJS, 100);
                }
            };
            checkEmailJS();
        });
    }

    /**
     * 使用模板发送邮件
     * @param {string} to - 收件人邮箱
     * @param {string} templateType - 模板类型
     * @param {string} language - 语言
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
                html: template.html,
                templateType: templateType,
                language: language,
                userName: variables.userName || 'User'
            });

            // 记录日志
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
     * 检查每月限制
     * @returns {boolean} 是否可以发送
     */
    checkMonthlyLimit() {
        const stats = this.getSendingStats();
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        if (stats.month === currentMonth && stats.year === currentYear) {
            return stats.sent < this.monthlyLimit;
        }
        return true;
    }

    /**
     * 记录邮件发送
     */
    recordEmailSent() {
        const stats = this.getSendingStats();
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        if (stats.month !== currentMonth || stats.year !== currentYear) {
            // 新月份，重置计数
            stats.month = currentMonth;
            stats.year = currentYear;
            stats.sent = 0;
        }

        stats.sent += 1;
        localStorage.setItem('emailjsStats', JSON.stringify(stats));
    }

    /**
     * 获取发送统计
     */
    getSendingStats() {
        const defaultStats = {
            month: new Date().getMonth(),
            year: new Date().getFullYear(),
            sent: 0
        };

        return JSON.parse(localStorage.getItem('emailjsStats') || JSON.stringify(defaultStats));
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
            service: 'EmailJS',
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
     * 测试服务
     */
    async testService(testEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(testEmail)) {
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
            remaining: Math.max(0, this.monthlyLimit - stats.sent),
            total: this.monthlyLimit,
            used: stats.sent
        };
    }
}

// 初始化EmailJS服务
function initEmailJSService() {
    // EmailJS配置
    const EMAILJS_CONFIG = {
        serviceId: localStorage.getItem('emailjsServiceId') || '',
        templateId: localStorage.getItem('emailjsTemplateId') || '',
        publicKey: localStorage.getItem('emailjsPublicKey') || ''
    };

    if (EMAILJS_CONFIG.serviceId && EMAILJS_CONFIG.templateId && EMAILJS_CONFIG.publicKey) {
        const emailjsService = new EmailJSEmailService(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            EMAILJS_CONFIG.publicKey
        );

        // 初始化EmailJS
        emailjsService.init().then(success => {
            if (success) {
                window.emailService = emailjsService;
                console.log('✅ EmailJS email service initialized');
                console.log(`📊 Monthly limit: ${emailjsService.monthlyLimit} emails`);
            }
        });

        return emailjsService;
    } else {
        console.warn('⚠️ EmailJS configuration missing.');
        console.log('📝 To configure:');
        console.log('1. Visit https://www.emailjs.com and register');
        console.log('2. Add an email service (Gmail, Outlook, etc.)');
        console.log('3. Create an email template');
        console.log('4. Get your Service ID, Template ID, and Public Key');
        console.log('5. Use no-phone-email-setup.html for quick setup');

        return null;
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    const service = initEmailJSService();

    // 暴露到全局作用域
    window.initEmailJSService = initEmailJSService;
    window.EmailJSEmailService = EmailJSEmailService;
});

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EmailJSEmailService, initEmailJSService };
}

console.log('✅ EmailJS email service loaded');