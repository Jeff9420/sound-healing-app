/**
 * DailyMeditationReminder - 每日冥想提醒功能
 *
 * 功能:
 * 1. 设置每日提醒时间
 * 2. 浏览器通知提醒
 * 3. 连续练习天数追踪
 * 4. 本地存储用户偏好
 *
 * @version 1.0.0
 * @date 2025-01-24
 */

class DailyMeditationReminder {
    constructor() {
        this.isSupported = 'Notification' in window;
        this.isPermissionGranted = false;
        this.reminderTime = '20:00'; // 默认晚上8点
        this.isEnabled = false;
        this.streakDays = 0;
        this.lastPracticeDate = null;
        this.reminderTimer = null;

        // 从本地存储加载设置
        this.loadSettings();

        // 初始化
        this.init();
    }

    /**
     * 初始化提醒系统
     */
    async init() {
        console.log('🔔 初始化每日冥想提醒系统...');

        // 检查浏览器通知支持
        if (!this.isSupported) {
            console.warn('⚠️ 浏览器不支持通知功能');
            return;
        }

        // 检查通知权限
        await this.checkNotificationPermission();

        // 更新连续练习天数
        this.updateStreakDays();

        // 如果已启用，设置定时器
        if (this.isEnabled) {
            this.setupDailyReminder();
        }

        console.log('✅ 每日冥想提醒系统初始化完成');
    }

    /**
     * 检查通知权限
     */
    async checkNotificationPermission() {
        if (Notification.permission === 'granted') {
            this.isPermissionGranted = true;
        } else if (Notification.permission === 'denied') {
            this.isPermissionGranted = false;
        }
    }

    /**
     * 请求通知权限
     */
    async requestNotificationPermission() {
        if (!this.isSupported) {
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            this.isPermissionGranted = permission === 'granted';

            if (this.isPermissionGranted) {
                console.log('✅ 通知权限已获取');
                this.showTestNotification();
            } else {
                console.log('❌ 通知权限被拒绝');
            }

            return this.isPermissionGranted;
        } catch (error) {
            console.error('请求通知权限失败:', error);
            return false;
        }
    }

    /**
     * 显示测试通知
     */
    showTestNotification() {
        if (!this.isPermissionGranted) return;

        const notification = new Notification('🧘‍♀️ SoundFlows 冥想提醒', {
            body: '通知功能已开启！您将收到每日冥想提醒。',
            icon: '/assets/icons/icon-192x192.png',
            badge: '/assets/icons/icon-96x96.png',
            tag: 'meditation-test'
        });

        setTimeout(() => notification.close(), 3000);
    }

    /**
     * 显示提醒设置界面
     */
    showReminderSettings() {
        const modal = document.createElement('div');
        modal.className = 'meditation-reminder-modal';
        modal.innerHTML = `
            <div class="reminder-modal-content">
                <div class="reminder-header">
                    <h3>🧘‍♀️ 每日冥想提醒</h3>
                    <button class="close-btn" onclick="this.closest('.meditation-reminder-modal').remove()">×</button>
                </div>

                <div class="reminder-body">
                    <div class="setting-group">
                        <label>
                            <input type="checkbox" id="enableReminder" ${this.isEnabled ? 'checked' : ''}>
                            启用每日提醒
                        </label>
                    </div>

                    <div class="setting-group">
                        <label for="reminderTime">提醒时间：</label>
                        <input type="time" id="reminderTime" value="${this.reminderTime}">
                    </div>

                    <div class="streak-info">
                        <div class="streak-days">
                            <span class="streak-number">${this.streakDays}</span>
                            <span class="streak-label">连续练习天数</span>
                        </div>
                        <div class="streak-fire">🔥</div>
                    </div>

                    <div class="reminder-preview">
                        <p>📱 提醒方式：浏览器通知</p>
                        <p>⏰ 每日 ${this.reminderTime} 提醒</p>
                    </div>
                </div>

                <div class="reminder-footer">
                    <button class="btn-secondary" onclick="this.closest('.meditation-reminder-modal').remove()">取消</button>
                    <button class="btn-primary" id="saveReminderSettings">保存设置</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 绑定事件
        document.getElementById('saveReminderSettings').addEventListener('click', () => {
            this.saveReminderSettings(modal);
        });

        document.getElementById('enableReminder').addEventListener('change', (e) => {
            if (e.target.checked && !this.isPermissionGranted) {
                this.requestNotificationPermission();
            }
        });
    }

    /**
     * 保存提醒设置
     */
    saveReminderSettings(modal) {
        const enableReminder = document.getElementById('enableReminder').checked;
        const reminderTime = document.getElementById('reminderTime').value;

        this.isEnabled = enableReminder;
        this.reminderTime = reminderTime;

        // 保存到本地存储
        this.saveSettings();

        // 清除现有定时器
        if (this.reminderTimer) {
            clearTimeout(this.reminderTimer);
        }

        // 如果启用，设置新的提醒
        if (enableReminder) {
            this.setupDailyReminder();

            // 显示成功提示
            this.showSuccessToast('✅ 提醒设置已保存！');
        } else {
            this.showSuccessToast('⏸️ 提醒已关闭');
        }

        modal.remove();
    }

    /**
     * 设置每日提醒
     */
    setupDailyReminder() {
        if (!this.isEnabled || !this.isPermissionGranted) return;

        const now = new Date();
        const [hours, minutes] = this.reminderTime.split(':').map(Number);

        // 计算下次提醒时间
        const nextReminder = new Date();
        nextReminder.setHours(hours, minutes, 0, 0);

        // 如果今天的时间已过，设置为明天
        if (nextReminder <= now) {
            nextReminder.setDate(nextReminder.getDate() + 1);
        }

        const timeUntilReminder = nextReminder - now;

        console.log(`⏰ 下次提醒时间: ${nextReminder.toLocaleString()}`);

        // 设置定时器
        this.reminderTimer = setTimeout(() => {
            this.showDailyReminder();
            // 设置第二天提醒
            this.setupDailyReminder();
        }, timeUntilReminder);
    }

    /**
     * 显示每日提醒
     */
    showDailyReminder() {
        if (!this.isPermissionGranted) return;

        const messages = [
            '🧘‍♀️ 是时候进行今日冥想了！',
            '🌸 让我们一起开始今天的冥想练习吧',
            '🕊️ 深呼吸，放松身心，开始冥想',
            '🌙 今天是练习冥想的好日子',
            '✨ 内心的平静从这里开始'
        ];

        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        const notification = new Notification('SoundFlows 每日冥想提醒', {
            body: randomMessage,
            icon: '/assets/icons/icon-192x192.png',
            badge: '/assets/icons/icon-96x96.png',
            tag: 'daily-meditation',
            requireInteraction: true,
            actions: [
                {
                    action: 'start',
                    title: '开始练习',
                    icon: '/assets/icons/icon-96x96.png'
                },
                {
                    action: 'later',
                    title: '稍后提醒',
                    icon: '/assets/icons/icon-72x72.png'
                }
            ]
        });

        // 处理通知点击
        notification.onclick = (event) => {
            if (event.action === 'start') {
                window.location.href = '/#meditation';
            } else {
                // 15分钟后再次提醒
                setTimeout(() => this.showDailyReminder(), 15 * 60 * 1000);
            }
            notification.close();
        };

        // 5秒后自动关闭（除非用户交互）
        setTimeout(() => {
            if (!notification.close) {
                notification.close();
            }
        }, 5000);
    }

    /**
     * 标记今日练习
     */
    markTodayPractice() {
        const today = new Date().toDateString();

        // 如果今天还没练习过
        if (this.lastPracticeDate !== today) {
            this.lastPracticeDate = today;

            // 更新连续天数
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (this.lastPracticeDate === yesterday.toDateString()) {
                // 昨天也练习了，连续天数+1
                this.streakDays++;
            } else {
                // 重新开始计数
                this.streakDays = 1;
            }

            // 保存设置
            this.saveSettings();

            // 显示成就提示
            this.showPracticeAchievement();
        }
    }

    /**
     * 显示练习成就
     */
    showPracticeAchievement() {
        const achievements = [
            { days: 1, message: '🌱 开始了冥想之旅！', emoji: '🌱' },
            { days: 3, message: '🌿 连续3天练习，太棒了！', emoji: '🌿' },
            { days: 7, message: '🌳 一周冥想大师！', emoji: '🌳' },
            { days: 14, message: '🏆 两周坚持，了不起！', emoji: '🏆' },
            { days: 30, message: '👑 一个月冥想大师！', emoji: '👑' },
            { days: 100, message: '🎊 百日冥想传奇！', emoji: '🎊' }
        ];

        const achievement = achievements.find(a => a.days === this.streakDays);

        if (achievement) {
            this.showAchievementModal(achievement);
        } else {
            this.showSuccessToast(`✅ 今日练习完成！连续 ${this.streakDays} 天`);
        }
    }

    /**
     * 显示成就弹窗
     */
    showAchievementModal(achievement) {
        const modal = document.createElement('div');
        modal.className = 'achievement-modal';
        modal.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-emoji">${achievement.emoji}</div>
                <h3>${achievement.message}</h3>
                <p>连续练习 ${this.streakDays} 天</p>
                <button class="btn-primary" onclick="this.closest('.achievement-modal').remove()">太棒了！</button>
            </div>
        `;

        document.body.appendChild(modal);

        // 自动关闭
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 5000);
    }

    /**
     * 显示成功提示
     */
    showSuccessToast(message) {
        const toast = document.createElement('div');
        toast.className = 'success-toast';
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * 更新连续练习天数
     */
    updateStreakDays() {
        const today = new Date().toDateString();

        if (this.lastPracticeDate) {
            const lastDate = new Date(this.lastPracticeDate);
            const daysDiff = Math.floor((new Date(today) - lastDate) / (1000 * 60 * 60 * 24));

            if (daysDiff > 1) {
                // 超过1天没练习，重置连续天数
                this.streakDays = 0;
            }
        }
    }

    /**
     * 保存设置到本地存储
     */
    saveSettings() {
        const settings = {
            isEnabled: this.isEnabled,
            reminderTime: this.reminderTime,
            streakDays: this.streakDays,
            lastPracticeDate: this.lastPracticeDate
        };

        localStorage.setItem('meditationReminder', JSON.stringify(settings));
    }

    /**
     * 从本地存储加载设置
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('meditationReminder');
            if (saved) {
                const settings = JSON.parse(saved);
                this.isEnabled = settings.isEnabled || false;
                this.reminderTime = settings.reminderTime || '20:00';
                this.streakDays = settings.streakDays || 0;
                this.lastPracticeDate = settings.lastPracticeDate || null;
            }
        } catch (error) {
            console.warn('加载提醒设置失败:', error);
        }
    }

    /**
     * 获取提醒状态
     */
    getReminderStatus() {
        return {
            isEnabled: this.isEnabled,
            reminderTime: this.reminderTime,
            streakDays: this.streakDays,
            isPermissionGranted: this.isPermissionGranted,
            lastPracticeDate: this.lastPracticeDate
        };
    }
}

// 创建全局实例
const dailyMeditationReminder = new DailyMeditationReminder();
window.dailyMeditationReminder = dailyMeditationReminder;

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DailyMeditationReminder;
}

console.log('✅ 每日冥想提醒系统已加载');