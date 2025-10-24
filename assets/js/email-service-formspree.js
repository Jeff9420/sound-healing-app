/**
 * Formspree Email Service Integration
 *
 * 使用Formspree接收表单提交，无需API密钥
 * 免费计划：50封/月
 *
 * @version 1.0.0
 * @date 2025-01-24
 */

class FormspreeEmailService {
    constructor(formId) {
        this.formId = formId;
        this.endpoint = `https://formspree.io/f/${formId}`;
        this.monthlyLimit = 50;
    }

    /**
     * 发送邮件（通过Formspree表单提交）
     * @param {Object} options - 邮件选项
     * @param {string} options.to - 收件人（通过Formspree设置）
     * @param {string} options.subject - 邮件主题
     * @param {string} options.html - HTML内容
     * @param {Object} options.data - 额外数据
     * @returns {Promise} 发送结果
     */
    async sendEmail(options) {
        const {
            to,
            subject,
            html,
            data = {}
        } = options;

        try {
            // 构建表单数据
            const formData = new FormData();
            formData.append('subject', subject);
            formData.append('content', html);
            formData.append('to', to);
            formData.append('timestamp', new Date().toISOString());

            // 添加额外数据
            Object.keys(data).forEach(key => {
                formData.append(key, data[key]);
            });

            // 发送请求
            const response = await fetch(this.endpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            const result = await response.json();

            if (response.ok) {
                console.log('✅ Email sent successfully via Formspree');

                // 记录发送
                this.recordEmailSent();

                return {
                    success: true,
                    message: 'Email sent successfully',
                    submissionId: result.submission_id
                };
            } else {
                throw new Error(result.error || 'Failed to send email');
            }

        } catch (error) {
            console.error('❌ Formspree error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 使用模板发送邮件
     * @param {string} to - 收件人
     * @param {string} templateType - 模板类型
     * @param {string} language - 语言
     * @param {Object} variables - 模板变量
     * @returns {Promise} 发送结果
     */
    async sendTemplateEmail(to, templateType, language, variables = {}) {
        try {
            // 获取邮件模板
            const template = window.emailTemplatesI18n.getTemplate(language, templateType, variables);

            // 构建邮件数据
            const emailData = {
                to: to,
                subject: template.subject,
                html: template.html,
                templateType: templateType,
                language: language,
                userName: variables.userName || 'User'
            };

            // 发送邮件
            const result = await this.sendEmail(emailData);

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
        localStorage.setItem('formspreeStats', JSON.stringify(stats));
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

        return JSON.parse(localStorage.getItem('formspreeStats') || JSON.stringify(defaultStats));
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
            service: 'Formspree',
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

// 初始化Formspree服务
function initFormspreeService() {
    // Formspree配置 - 需要用户获取form ID
    const FORMSPREE_CONFIG = {
        // 替换为您的Formspree Form ID
        // 例如：'mzbqknyp' (在formspree.io创建表单后获得)
        formId: localStorage.getItem('formspreeFormId') || ''
    };

    if (FORMSPREE_CONFIG.formId) {
        const formspreeService = new FormspreeEmailService(FORMSPREE_CONFIG.formId);
        window.emailService = formspreeService;
        console.log('✅ Formspree email service initialized');
        console.log(`📊 Monthly limit: ${formspreeService.monthlyLimit} emails`);
        console.log(`📊 Remaining: ${formspreeService.getRemainingQuota().remaining} emails`);
        return formspreeService;
    } else {
        console.warn('⚠️ Formspree configuration missing.');
        console.log('📝 To configure:');
        console.log('1. Visit https://formspree.io');
        console.log('2. Enter your email and create a form');
        console.log('3. Copy the form ID (e.g., mzbqknyp)');
        console.log('4. Save it to localStorage as "formspreeFormId"');
        console.log('5. Or use no-phone-email-setup.html for quick setup');

        return null;
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    const service = initFormspreeService();

    // 暴露到全局作用域
    window.initFormspreeService = initFormspreeService;
    window.FormspreeEmailService = FormspreeEmailService;
});

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FormspreeEmailService, initFormspreeService };
}

console.log('✅ Formspree email service loaded');