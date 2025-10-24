/**
 * Email Templates Internationalization (邮件模板多语言系统)
 *
 * 支持5种语言的邮件模板：
 * - English (en-US)
 * - 简体中文 (zh-CN)
 * - 日本語 (ja-JP)
 * - 한국어 (ko-KR)
 * - Español (es-ES)
 *
 * @version 1.0.0
 * @date 2025-01-24
 */

class EmailTemplatesI18n {
    constructor() {
        this.currentLanguage = 'en-US';
        this.templates = this.getAllTemplates();
    }

    /**
     * 获取所有语言的邮件模板
     */
    getAllTemplates() {
        return {
            // 英文模板
            'en-US': {
                welcome: {
                    subject: 'Welcome to SoundFlows - Your Sound Healing Journey Begins! 🎵',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Welcome to SoundFlows</title>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { text-align: center; background: linear-gradient(135deg, #6666ff, #7777ff); padding: 40px; border-radius: 10px 10px 0 0; color: white; }
                                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                                .cta-button { display: inline-block; background: #6666ff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                                .feature-list { list-style: none; padding: 0; }
                                .feature-list li { padding: 10px 0; border-bottom: 1px solid #eee; }
                                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>🎵 Welcome to SoundFlows</h1>
                                    <p>Your personal sound healing sanctuary awaits</p>
                                </div>
                                <div class="content">
                                    <h2>Hello {{userName}},</h2>
                                    <p>Thank you for joining SoundFlows! We're excited to help you discover the transformative power of sound healing.</p>

                                    <h3>What You'll Discover:</h3>
                                    <ul class="feature-list">
                                        <li>✨ <strong>213+ Healing Audio Tracks</strong> - Meditation, rain sounds, singing bowls & more</li>
                                        <li>🌍 <strong>5 Language Support</strong> - Interface available in English, Chinese, Japanese, Korean & Spanish</li>
                                        <li>🎯 <strong>Personalized Experience</strong> - Custom playlists, mixing, and progress tracking</li>
                                        <li>🔔 <strong>Daily Reminders</strong> - Build consistent meditation habits</li>
                                        <li>📱 <strong>Works on All Devices</strong> - Phone, tablet, or computer</li>
                                    </ul>

                                    <p>Ready to begin your journey? Click below to start exploring:</p>
                                    <a href="{{siteUrl}}" class="cta-button">Start Healing Now</a>

                                    <h3>Quick Tips:</h3>
                                    <ul>
                                        <li>🎧 Use headphones for the best experience</li>
                                        <li>⏰ Start with 5-10 minute sessions</li>
                                        <li>📝 Track your progress in the statistics dashboard</li>
                                        <li>❤️ Save your favorites for easy access</li>
                                    </ul>

                                    <p>If you have any questions, simply reply to this email. We're here to support your journey!</p>

                                    <p>Wishing you peace and harmony,<br>
                                    The SoundFlows Team</p>
                                </div>
                                <div class="footer">
                                    <p>© 2025 Sound Healing Space. All rights reserved.</p>
                                    <p>SoundFlows | {{siteUrl}}</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                },

                passwordReset: {
                    subject: 'Reset Your SoundFlows Password 🔐',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Password Reset</title>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { text-align: center; background: #ff6b6b; padding: 40px; border-radius: 10px 10px 0 0; color: white; }
                                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                                .reset-button { display: inline-block; background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>🔐 Password Reset</h1>
                                    <p>No worries, we'll help you get back in</p>
                                </div>
                                <div class="content">
                                    <h2>Hello {{userName}},</h2>
                                    <p>We received a request to reset your password for your SoundFlows account.</p>

                                    <p>Click the button below to reset your password:</p>
                                    <a href="{{resetUrl}}" class="reset-button">Reset My Password</a>

                                    <p><strong>This link will expire in 24 hours.</strong></p>

                                    <p>If you didn't request this password reset, please ignore this email or contact us if you have concerns.</p>

                                    <p>Stay peaceful,<br>
                                    The SoundFlows Team</p>
                                </div>
                                <div class="footer">
                                    <p>© 2025 Sound Healing Space. All rights reserved.</p>
                                    <p>If you're having trouble clicking the button, copy and paste this link: {{resetUrl}}</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                },

                dailyReminder: {
                    subject: '🧘‍♀️ Your Daily Sound Healing Reminder',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Daily Reminder</title>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { text-align: center; background: linear-gradient(135deg, #667eea, #764ba2); padding: 40px; border-radius: 10px 10px 0 0; color: white; }
                                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                                .play-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>🧘‍♀️ Time for Your Daily Practice</h1>
                                    <p>{{streakDays}} day streak - Keep it going!</p>
                                </div>
                                <div class="content">
                                    <h2>Hi {{userName}},</h2>
                                    <p>It's time for your daily sound healing session. Today's reminder:</p>

                                    <blockquote style="background: #e8f4fd; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
                                        <p><em>"{{dailyQuote}}"</em></p>
                                    </blockquote>

                                    <h3>Today's Recommendation:</h3>
                                    <p>{{recommendedTrack}}</p>

                                    <a href="{{siteUrl}}" class="play-button">Start Your Session</a>

                                    <p>Remember: Even 5 minutes of mindful listening can transform your day.</p>

                                    <p>Breathing deeply,<br>
                                    The SoundFlows Team</p>
                                </div>
                                <div class="footer">
                                    <p>© 2025 Sound Healing Space. All rights reserved.</p>
                                    <p><a href="{{unsubscribeUrl}}">Unsubscribe from daily reminders</a></p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                },

                weeklyDigest: {
                    subject: 'Your SoundFlows Weekly Digest 📊',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Weekly Digest</title>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { text-align: center; background: linear-gradient(135deg, #56ab2f, #a8e063); padding: 40px; border-radius: 10px 10px 0 0; color: white; }
                                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                                .stats { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
                                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>📊 Your Weekly Sound Healing Report</h1>
                                    <p>Track your progress and discover insights</p>
                                </div>
                                <div class="content">
                                    <h2>Hello {{userName}},</h2>
                                    <p>Here's your sound healing journey summary for this week:</p>

                                    <div class="stats">
                                        <h3>📈 Your Stats</h3>
                                        <ul>
                                            <li><strong>Total Sessions:</strong> {{totalSessions}}</li>
                                            <li><strong>Total Minutes:</strong> {{totalMinutes}}</li>
                                            <li><strong>Favorite Category:</strong> {{favoriteCategory}}</li>
                                            <li><strong>Most Played Track:</strong> {{mostPlayedTrack}}</li>
                                        </ul>
                                    </div>

                                    <h3>🎯 Weekly Achievement</h3>
                                    <p>{{weeklyAchievement}}</p>

                                    <h3>💡 Tip for Next Week</h3>
                                    <p>{{weeklyTip}}</p>

                                    <a href="{{siteUrl}}" style="display: inline-block; background: #56ab2f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">View Full Dashboard</a>

                                    <p>Keep up the amazing work on your wellness journey!</p>

                                    <p>With gratitude,<br>
                                    The SoundFlows Team</p>
                                </div>
                                <div class="footer">
                                    <p>© 2025 Sound Healing Space. All rights reserved.</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                }
            },

            // 中文模板
            'zh-CN': {
                welcome: {
                    subject: '欢迎来到声音疗愈空间 - 开启您的音疗之旅！🎵',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>欢迎来到声音疗愈空间</title>
                            <style>
                                body { font-family: "PingFang SC", "Microsoft YaHei", sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { text-align: center; background: linear-gradient(135deg, #6666ff, #7777ff); padding: 40px; border-radius: 10px 10px 0 0; color: white; }
                                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                                .cta-button { display: inline-block; background: #6666ff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                                .feature-list { list-style: none; padding: 0; }
                                .feature-list li { padding: 10px 0; border-bottom: 1px solid #eee; }
                                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>🎵 欢迎来到声音疗愈空间</h1>
                                    <p>您的专属声音疗愈圣地正在等待</p>
                                </div>
                                <div class="content">
                                    <h2>亲爱的 {{userName}}，</h2>
                                    <p>感谢您加入声音疗愈空间！我们很兴奋能帮助您发现声音疗愈的变革力量。</p>

                                    <h3>您将发现：</h3>
                                    <ul class="feature-list">
                                        <li>✨ <strong>213+ 疗愈音频</strong> - 冥想、雨声、颂钵等</li>
                                        <li>🌍 <strong>5种语言支持</strong> - 中文、英文、日文、韩文、西班牙文</li>
                                        <li>🎯 <strong>个性化体验</strong> - 自定义播放列表、混音和进度追踪</li>
                                        <li>🔔 <strong>每日提醒</strong> - 培养持续的冥想习惯</li>
                                        <li>📱 <strong>全设备支持</strong> - 手机、平板或电脑</li>
                                    </ul>

                                    <p>准备开始您的旅程了吗？点击下方开始探索：</p>
                                    <a href="{{siteUrl}}" class="cta-button">立即开始疗愈</a>

                                    <h3>快速提示：</h3>
                                    <ul>
                                        <li>🎧 使用耳机获得最佳体验</li>
                                        <li>⏰ 从5-10分钟的课程开始</li>
                                        <li>📝 在统计面板中追踪您的进度</li>
                                        <li>❤️ 收藏您喜欢的音频以便快速访问</li>
                                    </ul>

                                    <p>如果您有任何问题，只需回复此邮件。我们在您的旅程中为您提供支持！</p>

                                    <p>祝您平和与和谐<br>
                                    声音疗愈空间团队</p>
                                </div>
                                <div class="footer">
                                    <p>© 2025 Sound Healing Space. 保留所有权利</p>
                                    <p>声音疗愈空间 | {{siteUrl}}</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                },

                passwordReset: {
                    subject: '重置您的声音疗愈空间密码 🔐',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>密码重置</title>
                            <style>
                                body { font-family: "PingFang SC", "Microsoft YaHei", sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { text-align: center; background: #ff6b6b; padding: 40px; border-radius: 10px 10px 0 0; color: white; }
                                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                                .reset-button { display: inline-block; background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>🔐 密码重置</h1>
                                    <p>别担心，我们会帮您重新登录</p>
                                </div>
                                <div class="content">
                                    <h2>亲爱的 {{userName}}，</h2>
                                    <p>我们收到了您重置声音疗愈空间账户密码的请求。</p>

                                    <p>点击下方按钮重置您的密码：</p>
                                    <a href="{{resetUrl}}" class="reset-button">重置我的密码</a>

                                    <p><strong>此链接将在24小时后过期。</strong></p>

                                    <p>如果您没有请求此密码重置，请忽略此邮件或如有疑虑请联系我们。</p>

                                    <p>保持平静<br>
                                    声音疗愈空间团队</p>
                                </div>
                                <div class="footer">
                                    <p>© 2025 Sound Healing Space. 保留所有权利</p>
                                    <p>如果您无法点击按钮，请复制并粘贴此链接：{{resetUrl}}</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                },

                dailyReminder: {
                    subject: '🧘‍♀️ 您的每日声音疗愈提醒',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>每日提醒</title>
                            <style>
                                body { font-family: "PingFang SC", "Microsoft YaHei", sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { text-align: center; background: linear-gradient(135deg, #667eea, #764ba2); padding: 40px; border-radius: 10px 10px 0 0; color: white; }
                                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                                .play-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>🧘‍♀️ 每日练习时间到了</h1>
                                    <p>连续练习 {{streakDays}} 天 - 继续加油！</p>
                                </div>
                                <div class="content">
                                    <h2>嗨 {{userName}}，</h2>
                                    <p>是时候进行您每日的声音疗愈课程了。今日提醒：</p>

                                    <blockquote style="background: #e8f4fd; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
                                        <p><em>"{{dailyQuote}}"</em></p>
                                    </blockquote>

                                    <h3>今日推荐：</h3>
                                    <p>{{recommendedTrack}}</p>

                                    <a href="{{siteUrl}}" class="play-button">开始您的课程</a>

                                    <p>记住：即使是5分钟的专注聆听也能改变您的一天。</p>

                                    <p>深呼吸<br>
                                    声音疗愈空间团队</p>
                                </div>
                                <div class="footer">
                                    <p>© 2025 Sound Healing Space. 保留所有权利</p>
                                    <p><a href="{{unsubscribeUrl}}">取消每日提醒订阅</a></p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                },

                weeklyDigest: {
                    subject: '您的声音疗愈空间周报 📊',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>周报</title>
                            <style>
                                body { font-family: "PingFang SC", "Microsoft YaHei", sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { text-align: center; background: linear-gradient(135deg, #56ab2f, #a8e063); padding: 40px; border-radius: 10px 10px 0 0; color: white; }
                                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                                .stats { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
                                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>📊 您的每周声音疗愈报告</h1>
                                    <p>追踪您的进度，发现洞察</p>
                                </div>
                                <div class="content">
                                    <h2>你好 {{userName}}，</h2>
                                    <p>这是您本周声音疗愈之旅的总结：</p>

                                    <div class="stats">
                                        <h3>📈 您的统计</h3>
                                        <ul>
                                            <li><strong>总课程数：</strong> {{totalSessions}}</li>
                                            <li><strong>总分钟数：</strong> {{totalMinutes}}</li>
                                            <li><strong>最爱分类：</strong> {{favoriteCategory}}</li>
                                            <li><strong>最常播放：</strong> {{mostPlayedTrack}}</li>
                                        </ul>
                                    </div>

                                    <h3>🎯 本周成就</h3>
                                    <p>{{weeklyAchievement}}</p>

                                    <h3>💡 下周提示</h3>
                                    <p>{{weeklyTip}}</p>

                                    <a href="{{siteUrl}}" style="display: inline-block; background: #56ab2f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">查看完整仪表板</a>

                                    <p>在您的健康之旅上继续努力！</p>

                                    <p>怀着感激<br>
                                    声音疗愈空间团队</p>
                                </div>
                                <div class="footer">
                                    <p>© 2025 Sound Healing Space. 保留所有权利</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                }
            },

            // 日文模板
            'ja-JP': {
                welcome: {
                    subject: 'SoundFlowsへようこそ - あなたのサウンドヒーリングの旅が始まります！🎵',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>SoundFlowsへようこそ</title>
                            <style>
                                body { font-family: "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { text-align: center; background: linear-gradient(135deg, #6666ff, #7777ff); padding: 40px; border-radius: 10px 10px 0 0; color: white; }
                                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                                .cta-button { display: inline-block; background: #6666ff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                                .feature-list { list-style: none; padding: 0; }
                                .feature-list li { padding: 10px 0; border-bottom: 1px solid #eee; }
                                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>🎵 SoundFlowsへようこそ</h1>
                                    <p>個人的なサウンドヒーリングの聖地があなたを待っています</p>
                                </div>
                                <div class="content">
                                    <h2>{{userName}}様、</h2>
                                    <p>SoundFlowsにご登録いただき、誠にありがとうございます！サウンドヒーリングの変革的な力を発見するお手伝いをできることを嬉しく思います。</p>

                                    <h3>あなたが発見すること：</h3>
                                    <ul class="feature-list">
                                        <li>✨ <strong>213以上のヒーリングオーディオトラック</strong> - 瞑想、雨の音、シンギングボウルなど</li>
                                        <li>🌍 <strong>5言語サポート</strong> - 英語、中国語、日本語、韓国語、スペイン語</li>
                                        <li>🎯 <strong>パーソナライズされた体験</strong> - カスタムプレイリスト、ミキシング、進行状況の追跡</li>
                                        <li>🔔 <strong>毎日リマインダー</strong> - 一貫した瞑想習慣を築く</li>
                                        <li>📱 <strong>すべてのデバイスで動作</strong> - スマートフォン、タブレット、またはコンピューター</li>
                                    </ul>

                                    <p>旅を始める準備はできましたか？下をクリックして探索を始めてください：</p>
                                    <a href="{{siteUrl}}" class="cta-button">今すぐヒーリングを始める</a>

                                    <h3>クイックヒント：</h3>
                                    <ul>
                                        <li>🎧 最高の体験のためにはヘッドフォンを使用してください</li>
                                        <li>⏰ 5-10分のセッションから始めてください</li>
                                        <li>📝 統計ダッシュボードで進行状況を追跡してください</li>
                                        <li>❤️ お気に入りを保存して簡単にアクセスしてください</li>
                                    </ul>

                                    <p>ご質問がある場合は、このメールに返信してください。あなたの旅をサポートするためにここにいます！</p>

                                    <p>平和と調和をお祈りしております<br>
                                    SoundFlowsチーム</p>
                                </div>
                                <div class="footer">
                                    <p>© 2025 Sound Healing Space. すべての権利を保有</p>
                                    <p>SoundFlows | {{siteUrl}}</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                },

                passwordReset: {
                    subject: 'SoundFlowsのパスワードをリセット 🔐',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>パスワードリセット</title>
                            <style>
                                body { font-family: "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { text-align: center; background: #ff6b6b; padding: 40px; border-radius: 10px 10px 0 0; color: white; }
                                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                                .reset-button { display: inline-block; background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>🔐 パスワードリセット</h1>
                                    <p>心配しないで、戻るのをお手伝いします</p>
                                </div>
                                <div class="content">
                                    <h2>{{userName}}様、</h2>
                                    <p>SoundFlowsアカウントのパスワードリセット要求を受信しました。</p>

                                    <p>下のボタンをクリックしてパスワードをリセットしてください：</p>
                                    <a href="{{resetUrl}}" class="reset-button">私のパスワードをリセット</a>

                                    <p><strong>このリンクは24時間後に期限切れになります。</strong></p>

                                    <p>このパスワードリセットを要求していない場合は、このメールを無視するか、懸念がある場合はご連絡ください。</p>

                                    <p>平穏をお過ごしください<br>
                                    SoundFlowsチーム</p>
                                </div>
                                <div class="footer">
                                    <p>© 2025 Sound Healing Space. すべての権利を保有</p>
                                    <p>ボタンをクリックできない場合は、このリンクをコピーして貼り付けてください：{{resetUrl}}</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                },

                dailyReminder: {
                    subject: '🧘‍♀️ 毎日のサウンドヒーリングリマインダー',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>毎日リマインダー</title>
                            <style>
                                body { font-family: "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { text-align: center; background: linear-gradient(135deg, #667eea, #764ba2); padding: 40px; border-radius: 10px 10px 0 0; color: white; }
                                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                                .play-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>🧘‍♀️ 毎日の練習時間です</h1>
                                    <p>{{streakDays}}日連続 - 続けましょう！</p>
                                </div>
                                <div class="content">
                                    <h2>{{userName}}様、</h2>
                                    <p>毎日のサウンドヒーリングセッションの時間です。今日のリマインダー：</p>

                                    <blockquote style="background: #e8f4fd; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
                                        <p><em>"{{dailyQuote}}"</em></p>
                                    </blockquote>

                                    <h3>今日のおすすめ：</h3>
                                    <p>{{recommendedTrack}}</p>

                                    <a href="{{siteUrl}}" class="play-button">セッションを開始</a>

                                    <p>覚えておいてください：5分のマインドフルな聴取でさえ、あなたの一日を変えることができます。</p>

                                    <p>深呼吸して<br>
                                    SoundFlowsチーム</p>
                                </div>
                                <div class="footer">
                                    <p>© 2025 Sound Healing Space. すべての権利を保有</p>
                                    <p><a href="{{unsubscribeUrl}}">毎日のリマインダーを購読解除</a></p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                },

                weeklyDigest: {
                    subject: 'あなたのSoundFlows週刊ダイジェスト 📊',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>週刊ダイジェスト</title>
                            <style>
                                body { font-family: "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { text-align: center; background: linear-gradient(135deg, #56ab2f, #a8e063); padding: 40px; border-radius: 10px 10px 0 0; color: white; }
                                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                                .stats { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
                                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>📊 あなたの週次サウンドヒーリングレポート</h1>
                                    <p>進行状況を追跡し、洞察を発見</p>
                                </div>
                                <div class="content">
                                    <h2>{{userName}}様、</h2>
                                    <p>今週のあなたのサウンドヒーリングの旅の概要です：</p>

                                    <div class="stats">
                                        <h3>📈 あなたの統計</h3>
                                        <ul>
                                            <li><strong>総セッション数：</strong> {{totalSessions}}</li>
                                            <li><strong>総分数：</strong> {{totalMinutes}}</li>
                                            <li><strong>お気に入りのカテゴリー：</strong> {{favoriteCategory}}</li>
                                            <li><strong>最も再生されたトラック：</strong> {{mostPlayedTrack}}</li>
                                        </ul>
                                    </div>

                                    <h3>🎯 今週の成果</h3>
                                    <p>{{weeklyAchievement}}</p>

                                    <h3>💡 来週のヒント</h3>
                                    <p>{{weeklyTip}}</p>

                                    <a href="{{siteUrl}}" style="display: inline-block; background: #56ab2f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">完全なダッシュボードを表示</a>

                                    <p>ウェルネスの旅で素晴らしい作業を続けてください！</p>

                                    <p>感謝を込めて<br>
                                    SoundFlowsチーム</p>
                                </div>
                                <div class="footer">
                                    <p>© 2025 Sound Healing Space. すべての権利を保有</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                }
            },

            // 韩文模板
            'ko-KR': {
                welcome: {
                    subject: 'SoundFlows에 오신 것을 환영합니다 - 사운드 힐링 여정이 시작됩니다! 🎵',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>SoundFlows에 오신 것을 환영합니다</title>
                            <style>
                                body { font-family: "Malgun Gothic", "Apple SD Gothic Neo", sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { text-align: center; background: linear-gradient(135deg, #6666ff, #7777ff); padding: 40px; border-radius: 10px 10px 0 0; color: white; }
                                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                                .cta-button { display: inline-block; background: #6666ff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                                .feature-list { list-style: none; padding: 0; }
                                .feature-list li { padding: 10px 0; border-bottom: 1px solid #eee; }
                                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>🎵 SoundFlows에 오신 것을 환영합니다</h1>
                                    <p>개인적인 사운드 힐링 성지가 당신을 기다리고 있습니다</p>
                                </div>
                                <div class="content">
                                    <h2>{{userName}}님,</h2>
                                    <p>SoundFlows에 가입해주셔서 감사합니다! 사운드 힐링의 변혁적인 힘을 발견하도록 도와드리게 되어 기쁩니다.</p>

                                    <h3>발견할 것들:</h3>
                                    <ul class="feature-list">
                                        <li>✨ <strong>213개 이상의 힐링 오디오 트랙</strong> - 명상, 빗소리, 싱볼 등</li>
                                        <li>🌍 <strong>5개 언어 지원</strong> - 영어, 중국어, 일본어, 한국어, 스페인어</li>
                                        <li>🎯 <strong>개인화된 경험</strong> - 맞춤형 재생목록, 믹싱, 진행 상황 추적</li>
                                        <li>🔔 <strong>매일 리마인더</strong> - 꾸준한 명상 습관 형성</li>
                                        <li>📱 <strong>모든 기기에서 작동</strong> - 스마트폰, 태블릿 또는 컴퓨터</li>
                                    </ul>

                                    <p>여정을 시작할 준비가 되셨나요? 아래를 클릭하여 탐색을 시작하세요:</p>
                                    <a href="{{siteUrl}}" class="cta-button">지금 힐링 시작하기</a>

                                    <h3>빠른 팁:</h3>
                                    <ul>
                                        <li>🎧 최고의 경험을 위해 헤드폰을 사용하세요</li>
                                        <li>⏰ 5-10분 세션부터 시작하세요</li>
                                        <li>📝 통계 대시보드에서 진행 상황을 추적하세요</li>
                                        <li>❤️ 즐겨찾기를 저장하여 쉽게 접근하세요</li>
                                    </ul>

                                    <p>질문이 있으시면 이 이메일에 회신해 주세요. 당신의 여정을 지원하기 위해 여기에 있습니다!</p>

                                    <p>평화와 조화를 기원하며<br>
                                    SoundFlows 팀</p>
                                </div>
                                <div class="footer">
                                    <p>© 2025 Sound Healing Space. 모든 권리 보유</p>
                                    <p>SoundFlows | {{siteUrl}}</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                },

                passwordReset: {
                    subject: 'SoundFlows 비밀번호 재설정 🔐',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>비밀번호 재설정</title>
                            <style>
                                body { font-family: "Malgun Gothic", "Apple SD Gothic Neo", sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { text-align: center; background: #ff6b6b; padding: 40px; border-radius: 10px 10px 0 0; color: white; }
                                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                                .reset-button { display: inline-block; background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>🔐 비밀번호 재설정</h1>
                                    <p>걱정하지 마세요, 다시 로그인할 수 있도록 도와드리겠습니다</p>
                                </div>
                                <div class="content">
                                    <h2>{{userName}}님,</h2>
                                    <p>SoundFlows 계정의 비밀번호 재설정 요청을 받았습니다.</p>

                                    <p>아래 버튼을 클릭하여 비밀번호를 재설정하세요:</p>
                                    <a href="{{resetUrl}}" class="reset-button">내 비밀번호 재설정</a>

                                    <p><strong>이 링크는 24시간 후에 만료됩니다.</strong></p>

                                    <p>이 비밀번호 재설정을 요청하지 않았다면 이 이메일을 무시하시거나 우려 사항이 있으면 저희에게 연락하세요.</p>

                                    <p>평온하게 지내세요<br>
                                    SoundFlows 팀</p>
                                </div>
                                <div class="footer">
                                    <p>© 2025 Sound Healing Space. 모든 권리 보유</p>
                                    <p>버튼을 클릭할 수 없는 경우 이 링크를 복사하여 붙여넣으세요: {{resetUrl}}</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                },

                dailyReminder: {
                    subject: '🧘‍♀️ 매일 사운드 힐링 리마인더',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>매일 리마인더</title>
                            <style>
                                body { font-family: "Malgun Gothic", "Apple SD Gothic Neo", sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { text-align: center; background: linear-gradient(135deg, #667eea, #764ba2); padding: 40px; border-radius: 10px 10px 0 0; color: white; }
                                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                                .play-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>🧘‍♀️ 매일 연습 시간입니다</h1>
                                    <p>{{streakDays}}일 연속 - 계속하세요!</p>
                                </div>
                                <div class="content">
                                    <h2>{{userName}}님,</h2>
                                    <p>매일 사운드 힐링 세션 시간입니다. 오늘의 리마인더:</p>

                                    <blockquote style="background: #e8f4fd; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
                                        <p><em>"{{dailyQuote}}"</em></p>
                                    </blockquote>

                                    <h3>오늘의 추천:</h3>
                                    <p>{{recommendedTrack}}</p>

                                    <a href="{{siteUrl}}" class="play-button">세션 시작</a>

                                    <p>기억하세요: 5분의 마음챙김한 듣기만으로도 하루를 바꿀 수 있습니다.</p>

                                    <p>깊게 호흡하며<br>
                                    SoundFlows 팀</p>
                                </div>
                                <div class="footer">
                                    <p>© 2025 Sound Healing Space. 모든 권리 보유</p>
                                    <p><a href="{{unsubscribeUrl}}">매일 리마인더 구독 취소</a></p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                },

                weeklyDigest: {
                    subject: '귀하의 SoundFlows 주간 다이제스트 📊',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>주간 다이제스트</title>
                            <style>
                                body { font-family: "Malgun Gothic", "Apple SD Gothic Neo", sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { text-align: center; background: linear-gradient(135deg, #56ab2f, #a8e063); padding: 40px; border-radius: 10px 10px 0 0; color: white; }
                                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                                .stats { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
                                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>📊 귀하의 주간 사운드 힐링 보고서</h1>
                                    <p>진행 상황을 추적하고 통찰력을 발견하세요</p>
                                </div>
                                <div class="content">
                                    <h2>{{userName}}님,</h2>
                                    <p>이번 주 귀하의 사운드 힐링 여정 요약입니다:</p>

                                    <div class="stats">
                                        <h3>📈 귀하의 통계</h3>
                                        <ul>
                                            <li><strong>총 세션 수:</strong> {{totalSessions}}</li>
                                            <li><strong>총 분:</strong> {{totalMinutes}}</li>
                                            <li><strong>좋아하는 카테고리:</strong> {{favoriteCategory}}</li>
                                            <li><strong>가장 많이 재생된 트랙:</strong> {{mostPlayedTrack}}</li>
                                        </ul>
                                    </div>

                                    <h3>🎯 주간 성취</h3>
                                    <p>{{weeklyAchievement}}</p>

                                    <h3>💡 다음 주 팁</h3>
                                    <p>{{weeklyTip}}</p>

                                    <a href="{{siteUrl}}" style="display: inline-block; background: #56ab2f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">전체 대시보드 보기</a>

                                    <p>웰니스 여정에서 멋진 작업을 계속하세요!</p>

                                    <p>감사하는 마음으로<br>
                                    SoundFlows 팀</p>
                                </div>
                                <div class="footer">
                                    <p>© 2025 Sound Healing Space. 모든 권리 보유</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                }
            },

            // 西班牙文模板
            'es-ES': {
                welcome: {
                    subject: '¡Bienvenido a SoundFlows - Tu Viaje de Sanación con Sonido Comienza! 🎵',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Bienvenido a SoundFlows</title>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { text-align: center; background: linear-gradient(135deg, #6666ff, #7777ff); padding: 40px; border-radius: 10px 10px 0 0; color: white; }
                                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                                .cta-button { display: inline-block; background: #6666ff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                                .feature-list { list-style: none; padding: 0; }
                                .feature-list li { padding: 10px 0; border-bottom: 1px solid #eee; }
                                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>🎵 Bienvenido a SoundFlows</h1>
                                    <p>Tu santuario personal de sanación con sonido te espera</p>
                                </div>
                                <div class="content">
                                    <h2>Hola {{userName}},</h2>
                                    <p>¡Gracias por unirte a SoundFlows! Estamos emocionados de ayudarte a descubrir el poder transformador de la sanación con sonido.</p>

                                    <h3>Lo que Descubrirás:</h3>
                                    <ul class="feature-list">
                                        <li>✨ <strong>213+ Pistas de Audio Sanadoras</strong> - Meditación, sonidos de lluvia, cuencos tibetanos y más</li>
                                        <li>🌍 <strong>Soporte en 5 Idiomas</strong> - Interfaz disponible en inglés, chino, japonés, coreano y español</li>
                                        <li>🎯 <strong>Experiencia Personalizada</strong> - Listas de reproducción personalizadas, mezclas y seguimiento de progreso</li>
                                        <li>🔔 <strong>Recordatorios Diarios</strong> - Construye hábitos consistentes de meditación</li>
                                        <li>📱 <strong>Funciona en Todos los Dispositivos</strong> - Teléfono, tableta o computadora</li>
                                    </ul>

                                    <p>¿Listo para comenzar tu viaje? Haz clic abajo para empezar a explorar:</p>
                                    <a href="{{siteUrl}}" class="cta-button">Comenzar Sanación Ahora</a>

                                    <h3>Consejos Rápidos:</h3>
                                    <ul>
                                        <li>🎧 Usa auriculares para la mejor experiencia</li>
                                        <li>⏰ Comienza con sesiones de 5-10 minutos</li>
                                        <li>📝 Rastrea tu progreso en el panel de estadísticas</li>
                                        <li>❤️ Guarda tus favoritos para fácil acceso</li>
                                    </ul>

                                    <p>Si tienes alguna pregunta, simplemente responde a este correo. ¡Estamos aquí para apoyar tu viaje!</p>

                                    <p>Te deseamos paz y armonía,<br>
                                    El Equipo de SoundFlows</p>
                                </div>
                                <div class="footer">
                                    <p>© 2025 Sound Healing Space. Todos los derechos reservados.</p>
                                    <p>SoundFlows | {{siteUrl}}</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                },

                passwordReset: {
                    subject: 'Restablece tu Contraseña de SoundFlows 🔐',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Restablecer Contraseña</title>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { text-align: center; background: #ff6b6b; padding: 40px; border-radius: 10px 10px 0 0; color: white; }
                                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                                .reset-button { display: inline-block; background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>🔐 Restablecer Contraseña</h1>
                                    <p>No te preocupes, te ayudaremos a volver a entrar</p>
                                </div>
                                <div class="content">
                                    <h2>Hola {{userName}},</h2>
                                    <p>Recibimos una solicitud para restablecer tu contraseña de tu cuenta SoundFlows.</p>

                                    <p>Haz clic en el botón de abajo para restablecer tu contraseña:</p>
                                    <a href="{{resetUrl}}" class="reset-button">Restablecer mi Contraseña</a>

                                    <p><strong>Este enlace expirará en 24 horas.</strong></p>

                                    <p>Si no solicitaste este restablecimiento de contraseña, por favor ignora este correo o contáctanos si tienes preocupaciones.</p>

                                    <p>Mantente en paz,<br>
                                    El Equipo de SoundFlows</p>
                                </div>
                                <div class="footer">
                                    <p>© 2025 Sound Healing Space. Todos los derechos reservados.</p>
                                    <p>Si tienes problemas haciendo clic en el botón, copia y pega este enlace: {{resetUrl}}</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                },

                dailyReminder: {
                    subject: '🧘‍♀️ Tu Recordatorio Diario de Sanación con Sonido',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Recordatorio Diario</title>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { text-align: center; background: linear-gradient(135deg, #667eea, #764ba2); padding: 40px; border-radius: 10px 10px 0 0; color: white; }
                                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                                .play-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>🧘‍♀️ Tiempo para tu Práctica Diaria</h1>
                                    <p>Racha de {{streakDays}} días - ¡Sigue así!</p>
                                </div>
                                <div class="content">
                                    <h2>Hola {{userName}},</h2>
                                    <p>Es hora de tu sesión diaria de sanación con sonido. El recordatorio de hoy:</p>

                                    <blockquote style="background: #e8f4fd; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
                                        <p><em>"{{dailyQuote}}"</em></p>
                                    </blockquote>

                                    <h3>Recomendación de Hoy:</h3>
                                    <p>{{recommendedTrack}}</p>

                                    <a href="{{siteUrl}}" class="play-button">Comenzar tu Sesión</a>

                                    <p>Recuerda: Incluso 5 minutos de escucha consciente pueden transformar tu día.</p>

                                    <p>Respirando profundamente,<br>
                                    El Equipo de SoundFlows</p>
                                </div>
                                <div class="footer">
                                    <p>© 2025 Sound Healing Space. Todos los derechos reservados.</p>
                                    <p><a href="{{unsubscribeUrl}}">Cancelar suscripción de recordatorios diarios</a></p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                },

                weeklyDigest: {
                    subject: 'Tu Resumen Semanal de SoundFlows 📊',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Resumen Semanal</title>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { text-align: center; background: linear-gradient(135deg, #56ab2f, #a8e063); padding: 40px; border-radius: 10px 10px 0 0; color: white; }
                                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                                .stats { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
                                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>📊 Tu Reporte Semanal de Sanación con Sonido</h1>
                                    <p>Rastrea tu progreso y descubre información</p>
                                </div>
                                <div class="content">
                                    <h2>Hola {{userName}},</h2>
                                    <p>Aquí está tu resumen del viaje de sanación con sonido de esta semana:</p>

                                    <div class="stats">
                                        <h3>📈 Tus Estadísticas</h3>
                                        <ul>
                                            <li><strong>Sesiones Totales:</strong> {{totalSessions}}</li>
                                            <li><strong>Minutos Totales:</strong> {{totalMinutes}}</li>
                                            <li><strong>Categoría Favorita:</strong> {{favoriteCategory}}</li>
                                            <li><strong>Pista Más Reproducida:</strong> {{mostPlayedTrack}}</li>
                                        </ul>
                                    </div>

                                    <h3>🎯 Logro Semanal</h3>
                                    <p>{{weeklyAchievement}}</p>

                                    <h3>💡 Consejo para la Próxima Semana</h3>
                                    <p>{{weeklyTip}}</p>

                                    <a href="{{siteUrl}}" style="display: inline-block; background: #56ab2f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">Ver Panel Completo</a>

                                    <p>¡Sigue haciendo el increíble trabajo en tu viaje de bienestar!</p>

                                    <p>Con gratitud,<br>
                                    El Equipo de SoundFlows</p>
                                </div>
                                <div class="footer">
                                    <p>© 2025 Sound Healing Space. Todos los derechos reservados.</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                }
            }
        };
    }

    /**
     * 获取指定语言和类型的邮件模板
     * @param {string} language - 语言代码 (en-US, zh-CN, ja-JP, ko-KR, es-ES)
     * @param {string} type - 邮件类型 (welcome, passwordReset, dailyReminder, weeklyDigest)
     * @param {Object} variables - 模板变量替换对象
     * @returns {Object} 包含 subject 和 html 的邮件对象
     */
    getTemplate(language, type, variables = {}) {
        const lang = language || this.currentLanguage;
        const templates = this.templates[lang] || this.templates['en-US'];
        const template = templates[type];

        if (!template) {
            console.warn(`Template not found: ${type} for language ${lang}`);
            return this.templates['en-US'].welcome;
        }

        // 替换模板变量
        let html = template.html;
        let subject = template.subject;

        Object.keys(variables).forEach(key => {
            const placeholder = `{{${key}}}`;
            const value = variables[key] || '';
            html = html.replace(new RegExp(placeholder, 'g'), value);
            subject = subject.replace(new RegExp(placeholder, 'g'), value);
        });

        return {
            subject: subject,
            html: html
        };
    }

    /**
     * 获取所有支持的语言列表
     */
    getSupportedLanguages() {
        return [
            { code: 'en-US', name: 'English', nativeName: 'English' },
            { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文' },
            { code: 'ja-JP', name: 'Japanese', nativeName: '日本語' },
            { code: 'ko-KR', name: 'Korean', nativeName: '한국어' },
            { code: 'es-ES', name: 'Spanish', nativeName: 'Español' }
        ];
    }

    /**
     * 设置当前语言
     * @param {string} language - 语言代码
     */
    setLanguage(language) {
        if (this.templates[language]) {
            this.currentLanguage = language;
        } else {
            console.warn(`Language not supported: ${language}`);
        }
    }

    /**
     * 获取当前语言
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * 发送邮件的辅助方法（集成邮件服务时使用）
     * @param {string} to - 收件人邮箱
     * @param {string} type - 邮件类型
     * @param {Object} variables - 模板变量
     * @param {string} language - 语言代码（可选）
     */
    async sendEmail(to, type, variables, language = null) {
        const template = this.getTemplate(language || this.currentLanguage, type, variables);

        // 这里集成邮件服务，例如 SendGrid, Mailgun, AWS SES 等
        console.log('Sending email:', {
            to: to,
            subject: template.subject,
            templateType: type,
            language: language || this.currentLanguage
        });

        // 示例集成代码（需要配置邮件服务）:
        /*
        if (window.emailService) {
            return await window.emailService.send({
                to: to,
                subject: template.subject,
                html: template.html
            });
        }
        */

        return { success: true, message: 'Email template prepared' };
    }
}

// 创建全局实例
const emailTemplatesI18n = new EmailTemplatesI18n();
window.emailTemplatesI18n = emailTemplatesI18n;

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmailTemplatesI18n;
}

console.log('✅ EmailTemplatesI18n loaded - 5 languages supported');