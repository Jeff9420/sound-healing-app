/**
 * Email Integration Handler
 * 邮件集成处理器 - 统一处理所有邮件发送功能
 *
 * @version 1.0.0
 * @date 2025-01-24
 */

class EmailIntegrationHandler {
    constructor() {
        this.emailService = null;
        this.formspreeFormId = localStorage.getItem('formspreeFormId') || 'mldpqopn';
        this.init();
    }

    /**
     * 初始化邮件服务
     */
    init() {
        // 等待邮件服务加载
        const checkEmailService = () => {
            if (window.emailService) {
                this.emailService = window.emailService;
                console.log('✅ 邮件服务已连接');
                this.setupEventListeners();
            } else {
                setTimeout(checkEmailService, 100);
            }
        };
        checkEmailService();
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听用户注册事件
        document.addEventListener('userRegistered', (event) => {
            this.sendWelcomeEmail(event.detail);
        });

        // 监听密码重置请求
        document.addEventListener('passwordResetRequested', (event) => {
            this.sendPasswordResetEmail(event.detail);
        });

        // 监听每日提醒事件
        document.addEventListener('dailyReminderTriggered', (event) => {
            this.sendDailyReminderEmail(event.detail);
        });

        // 监听周报生成事件
        document.addEventListener('weeklyDigestGenerated', (event) => {
            this.sendWeeklyDigestEmail(event.detail);
        });
    }

    /**
     * 1. 发送欢迎邮件
     * @param {Object} userData - 用户数据
     */
    async sendWelcomeEmail(userData) {
        if (!this.emailService) {
            console.warn('邮件服务未初始化');
            return;
        }

        const { email, displayName, language = 'zh-CN' } = userData;

        try {
            // 使用Formspree直接发送
            const formData = new FormData();
            formData.append('email', email);
            formData.append('name', displayName || '用户');
            formData.append('message', this.generateWelcomeEmailContent(displayName, language));
            formData.append('_subject', `欢迎加入SoundFlows - ${displayName || '用户'}`);
            formData.append('_template', 'table');
            formData.append('emailType', 'welcome');
            formData.append('timestamp', new Date().toISOString());

            const response = await fetch(`https://formspree.io/f/${this.formspreeFormId}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                console.log('✅ 欢迎邮件发送成功');
                this.showNotification('欢迎邮件已发送', 'success');

                // 记录到本地
                this.logEmailSent({
                    type: 'welcome',
                    email: email,
                    status: 'success'
                });
            } else {
                throw new Error('发送失败');
            }

        } catch (error) {
            console.error('❌ 欢迎邮件发送失败:', error);
            this.showNotification('邮件发送失败', 'error');
        }
    }

    /**
     * 2. 发送密码重置邮件
     * @param {Object} resetData - 重置数据
     */
    async sendPasswordResetEmail(resetData) {
        if (!this.emailService) {
            console.warn('邮件服务未初始化');
            return;
        }

        const { email, resetToken, language = 'zh-CN' } = resetData;

        try {
            // 生成重置链接（模拟）
            const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}&email=${email}`;

            // 使用Formspree发送
            const formData = new FormData();
            formData.append('email', email);
            formData.append('name', '用户');
            formData.append('message', this.generatePasswordResetContent(resetUrl, language));
            formData.append('_subject', 'SoundFlows 密码重置请求');
            formData.append('_template', 'table');
            formData.append('emailType', 'passwordReset');
            formData.append('resetUrl', resetUrl);
            formData.append('timestamp', new Date().toISOString());

            const response = await fetch(`https://formspree.io/f/${this.formspreeFormId}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                console.log('✅ 密码重置邮件发送成功');
                this.showNotification('密码重置邮件已发送', 'success');

                this.logEmailSent({
                    type: 'passwordReset',
                    email: email,
                    status: 'success'
                });
            } else {
                throw new Error('发送失败');
            }

        } catch (error) {
            console.error('❌ 密码重置邮件发送失败:', error);
            this.showNotification('邮件发送失败', 'error');
        }
    }

    /**
     * 3. 发送每日提醒邮件
     * @param {Object} reminderData - 提醒数据
     */
    async sendDailyReminderEmail(reminderData) {
        if (!this.emailService) {
            console.warn('邮件服务未初始化');
            return;
        }

        const { email, userName, streakDays = 0, language = 'zh-CN' } = reminderData;

        try {
            // 获取每日引言
            const dailyQuote = this.getDailyQuote(language);

            // 使用Formspree发送
            const formData = new FormData();
            formData.append('email', email);
            formData.append('name', userName || '用户');
            formData.append('message', this.generateDailyReminderContent(userName, streakDays, dailyQuote, language));
            formData.append('_subject', streakDays > 0
                ? `连续冥想第${streakDays}天 - SoundFlows每日提醒`
                : 'SoundFlows每日冥想提醒');
            formData.append('_template', 'table');
            formData.append('emailType', 'dailyReminder');
            formData.append('streakDays', streakDays.toString());
            formData.append('timestamp', new Date().toISOString());

            const response = await fetch(`https://formspree.io/f/${this.formspreeFormId}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                console.log('✅ 每日提醒邮件发送成功');
                this.logEmailSent({
                    type: 'dailyReminder',
                    email: email,
                    status: 'success'
                });
            }

        } catch (error) {
            console.error('❌ 每日提醒邮件发送失败:', error);
        }
    }

    /**
     * 4. 发送周报邮件
     * @param {Object} digestData - 周报数据
     */
    async sendWeeklyDigestEmail(digestData) {
        if (!this.emailService) {
            console.warn('邮件服务未初始化');
            return;
        }

        const {
            email,
            userName,
            totalSessions,
            totalMinutes,
            favoriteCategory,
            mostPlayedTrack,
            language = 'zh-CN'
        } = digestData;

        try {
            // 使用Formspree发送
            const formData = new FormData();
            formData.append('email', email);
            formData.append('name', userName || '用户');
            formData.append('message', this.generateWeeklyDigestContent({
                userName,
                totalSessions,
                totalMinutes,
                favoriteCategory,
                mostPlayedTrack
            }, language));
            formData.append('_subject', '您的SoundFlows本周使用报告');
            formData.append('_template', 'table');
            formData.append('emailType', 'weeklyDigest');
            formData.append('totalSessions', totalSessions.toString());
            formData.append('totalMinutes', totalMinutes.toString());
            formData.append('timestamp', new Date().toISOString());

            const response = await fetch(`https://formspree.io/f/${this.formspreeFormId}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                console.log('✅ 周报邮件发送成功');
                this.showNotification('周报已发送到您的邮箱', 'success');

                this.logEmailSent({
                    type: 'weeklyDigest',
                    email: email,
                    status: 'success'
                });
            }

        } catch (error) {
            console.error('❌ 周报邮件发送失败:', error);
        }
    }

    /**
     * 生成欢迎邮件内容
     */
    generateWelcomeEmailContent(displayName, language) {
        const content = {
            'zh-CN': `
亲爱的${displayName || '用户'}，

欢迎您加入SoundFlows声音疗愈空间！

我们很高兴您的加入。在这里，您可以：
🎵 享受213+专业疗愈音频
🧘‍♀️ 进行每日冥想练习
📊 追踪您的使用进度
🌍 支持5种语言

立即开始您的声音疗愈之旅吧！

祝好，
SoundFlows团队
            `,
            'en-US': `
Dear ${displayName || 'User'},

Welcome to SoundFlows Sound Healing Space!

We're thrilled to have you join us. Here you can:
🎵 Enjoy 213+ professional healing audio tracks
🧘‍♀️ Practice daily meditation
📊 Track your usage progress
🌍 Support for 5 languages

Start your sound healing journey now!

Best regards,
The SoundFlows Team
            `
        };

        return content[language] || content['zh-CN'];
    }

    /**
     * 生成密码重置内容
     */
    generatePasswordResetContent(resetUrl, language) {
        const content = {
            'zh-CN': `
您好，

我们收到了您的密码重置请求。

请点击以下链接重置您的密码：
${resetUrl}

此链接将在24小时后失效。

如果您没有请求重置密码，请忽略此邮件。

祝好，
SoundFlows团队
            `,
            'en-US': `
Hello,

We received a password reset request for your account.

Please click the link below to reset your password:
${resetUrl}

This link will expire in 24 hours.

If you didn't request a password reset, please ignore this email.

Best regards,
The SoundFlows Team
            `
        };

        return content[language] || content['zh-CN'];
    }

    /**
     * 生成每日提醒内容
     */
    generateDailyReminderContent(userName, streakDays, quote, language) {
        const content = {
            'zh-CN': `
亲爱的${userName || '用户'}，

${streakDays > 0 ? `🔥 已经连续冥想${streakDays}天了！太棒了！` : '是时候进行今天的冥想练习了。'}

今日引言：
"${quote}"

建议今日练习：
🎵 选择您喜欢的音频分类
⏰ 建议15-30分钟
🧘‍♀️ 找一个安静的地方

祝您有美好的一天！

SoundFlows团队
            `,
            'en-US': `
Dear ${userName || 'User'},

${streakDays > 0 ? `🔥 You've been meditating for ${streakDays} days straight! Amazing!` : "It's time for today's meditation practice."}

Today's quote:
"${quote}"

Today's practice suggestions:
🎵 Choose your favorite audio category
⏰ Recommended 15-30 minutes
🧘‍♀️ Find a quiet place

Have a wonderful day!

The SoundFlows Team
            `
        };

        return content[language] || content['zh-CN'];
    }

    /**
     * 生成周报内容
     */
    generateWeeklyDigestContent(data, language) {
        const { userName, totalSessions, totalMinutes, favoriteCategory, mostPlayedTrack } = data;

        const content = {
            'zh-CN': `
亲爱的${userName || '用户'}，

您的本周SoundFlows使用报告：

📊 使用统计：
• 总练习次数：${totalSessions} 次
• 总冥想时长：${totalMinutes} 分钟
• 最爱分类：${favoriteCategory || '冥想音乐'}
• 最常播放：${mostPlayedTrack || '晨间冥想'}

本周成就：
${totalSessions >= 7 ? '✨ 完美！您每天坚持练习！' :
 totalSessions >= 5 ? '👍 做得好！继续保持！' :
 '💪 加油！下周可以尝试每天练习。'}

下周建议：
尝试新的音频类型，探索更多疗愈音乐。

祝您下周冥想愉快！

SoundFlows团队
            `,
            'en-US': `
Dear ${userName || 'User'},

Your weekly SoundFlows usage report:

📊 Usage Statistics:
• Total sessions: ${totalSessions}
• Total meditation time: ${totalMinutes} minutes
• Favorite category: ${favoriteCategory || 'Meditation Music'}
• Most played track: ${mostPlayedTrack || 'Morning Meditation'}

This week's achievement:
${totalSessions >= 7 ? '✨ Perfect! You practiced every day!' :
 totalSessions >= 5 ? '👍 Great job! Keep it up!' :
 '💪 You can do it! Try practicing daily next week.'}

Next week's suggestion:
Try new audio types and explore more healing music.

Happy meditation next week!

The SoundFlows Team
            `
        };

        return content[language] || content['zh-CN'];
    }

    /**
     * 获取每日引言
     */
    getDailyQuote(language) {
        const quotes = {
            'zh-CN': [
                "心是一切，你心所想，即你所是。",
                "平和来自内心，莫向外求。",
                "每一次呼吸都是新的开始。",
                "静心聆听，内心的答案自然显现。",
                "冥想是与自己最好的对话。"
            ],
            'en-US': [
                "The mind is everything. What you think you become.",
                "Peace comes from within. Do not seek it without.",
                "Every breath is a new beginning.",
                "Listen quietly, the answers will come from within.",
                "Meditation is the best conversation with yourself."
            ]
        };

        const langQuotes = quotes[language] || quotes['zh-CN'];
        const today = new Date().getDate();
        return langQuotes[today % langQuotes.length];
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    /**
     * 记录邮件发送日志
     */
    logEmailSent(logData) {
        const logs = JSON.parse(localStorage.getItem('emailLogs') || '[]');
        logs.push({
            ...logData,
            timestamp: new Date().toISOString(),
            service: 'Formspree'
        });

        // 只保留最近100条
        if (logs.length > 100) {
            logs.splice(0, logs.length - 100);
        }

        localStorage.setItem('emailLogs', JSON.stringify(logs));
    }

    /**
     * 触发自定义事件
     */
    triggerEvent(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }
}

// 初始化邮件集成处理器
document.addEventListener('DOMContentLoaded', () => {
    window.emailIntegrationHandler = new EmailIntegrationHandler();
    console.log('✅ 邮件集成处理器已初始化');
});

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmailIntegrationHandler;
}

console.log('✅ 邮件集成处理器已加载');