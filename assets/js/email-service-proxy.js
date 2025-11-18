/**
 * Email Service Proxy - 前端
 * 使用Vercel Serverless Function代理Formspree
 *
 * @version 1.0.0
 * @date 2025-01-20
 */

class EmailServiceProxy {
    constructor() {
        // API端点（自动检测环境）
        this.apiEndpoint = this.getApiEndpoint();
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1秒
    }

    /**
     * 获取API端点
     */
    getApiEndpoint() {
        const isProduction = window.location.hostname.includes('soundflows.app');

        if (isProduction) {
            return '/api/send-email';
        }

        // 开发环境
        return 'http://localhost:3000/api/send-email';
    }

    /**
     * 发送邮件
     * @param {object} emailData - 邮件数据
     * @returns {Promise<object>} 发送结果
     */
    async sendEmail(emailData) {
        // 验证数据
        if (!this.validateEmailData(emailData)) {
            throw new Error('邮件数据验证失败');
        }

        let lastError;

        // 重试机制
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                const response = await fetch(this.apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify(emailData)
                });

                const result = await response.json();

                if (response.ok) {
                    console.log(`✅ 邮件发送成功 (尝试${attempt}/${this.maxRetries})`);
                    return result;
                }

                // 处理错误响应
                if (response.status === 429) {
                    throw new Error('发送过于频繁，请稍后再试');
                } else if (response.status === 403) {
                    throw new Error('请求被拒绝');
                } else {
                    throw new Error(result.message || '邮件发送失败');
                }

            } catch (error) {
                lastError = error;
                console.warn(`⚠️ 尝试${attempt}/${this.maxRetries}失败:`, error.message);

                // 如果不是最后一次尝试，等待后重试
                if (attempt < this.maxRetries) {
                    await this.delay(this.retryDelay * attempt);
                }
            }
        }

        // 所有尝试都失败
        throw lastError || new Error('邮件发送失败');
    }

    /**
     * 验证邮件数据
     */
    validateEmailData(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }

        // 检查必需字段
        if (!data.email || !data.message) {
            console.error('❌ 缺少必需字段: email 或 message');
            return false;
        }

        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            console.error('❌ 邮箱格式无效');
            return false;
        }

        return true;
    }

    /**
     * 延迟函数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 发送欢迎邮件
     */
    async sendWelcomeEmail(userData) {
        const emailData = {
            email: userData.email,
            subject: 'Welcome to SoundFlows',
            message: `欢迎 ${userData.displayName || '用户'}！感谢注册声音疗愈平台。`,
            templateType: 'welcome',
            language: userData.language || 'en-US'
        };

        return this.sendEmail(emailData);
    }

    /**
     * 发送密码重置邮件
     */
    async sendPasswordResetEmail(email, resetLink) {
        const emailData = {
            email: email,
            subject: 'Password Reset Request',
            message: `点击以下链接重置密码：\n${resetLink}`,
            templateType: 'password_reset',
            resetLink: resetLink
        };

        return this.sendEmail(emailData);
    }

    /**
     * 发送联系表单
     */
    async sendContactForm(formData) {
        const emailData = {
            email: formData.email,
            name: formData.name,
            subject: formData.subject || 'Contact Form Submission',
            message: formData.message
        };

        return this.sendEmail(emailData);
    }
}

// 全局导出
if (typeof window !== 'undefined') {
    window.EmailServiceProxy = EmailServiceProxy;
    window.emailServiceProxy = new EmailServiceProxy();
}

// ES6 模块导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmailServiceProxy;
}
