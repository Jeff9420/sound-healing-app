/**
 * Weekly Digest Email System
 * 周报邮件系统
 *
 * 功能：
 * 1. 生成用户周报
 * 2. 自动发送周报邮件
 * 3. 本地存储用户统计
 *
 * @version 1.0.0
 * @date 2025-01-24
 */

class WeeklyDigestEmail {
    constructor() {
        this.isEnabled = true;
        this.sendDay = 'Sunday'; // 默认周日发送
        this.sendTime = '09:00'; // 默认上午9点发送
        this.lastSentDate = null;
        this.userStats = null;

        // 加载设置
        this.loadSettings();

        // 初始化
        this.init();
    }

    /**
     * 初始化周报系统
     */
    init() {
        console.log('📊 初始化周报邮件系统...');

        // 加载用户统计数据
        this.loadUserStats();

        // 设置每周定时器
        this.setupWeeklySchedule();

        console.log('✅ 周报邮件系统初始化完成');
    }

    /**
     * 加载设置
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('weeklyDigestSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.isEnabled = settings.isEnabled !== false;
                this.sendDay = settings.sendDay || 'Sunday';
                this.sendTime = settings.sendTime || '09:00';
                this.lastSentDate = settings.lastSentDate;
            }
        } catch (error) {
            console.warn('加载周报设置失败:', error);
        }
    }

    /**
     * 保存设置
     */
    saveSettings() {
        const settings = {
            isEnabled: this.isEnabled,
            sendDay: this.sendDay,
            sendTime: this.sendTime,
            lastSentDate: this.lastSentDate
        };

        localStorage.setItem('weeklyDigestSettings', JSON.stringify(settings));
    }

    /**
     * 加载用户统计数据
     */
    loadUserStats() {
        try {
            const saved = localStorage.getItem('userStatistics');
            if (saved) {
                this.userStats = JSON.parse(saved);
            } else {
                // 初始化统计数据
                this.userStats = {
                    totalSessions: 0,
                    totalMinutes: 0,
                    favoriteCategory: null,
                    mostPlayedTrack: null,
                    sessionsByCategory: {},
                    weeklyStats: {}
                };
            }
        } catch (error) {
            console.warn('加载用户统计失败:', error);
            this.userStats = {
                totalSessions: 0,
                totalMinutes: 0,
                favoriteCategory: null,
                mostPlayedTrack: null
            };
        }
    }

    /**
     * 保存用户统计数据
     */
    saveUserStats() {
        if (this.userStats) {
            localStorage.setItem('userStatistics', JSON.stringify(this.userStats));
        }
    }

    /**
     * 更新播放统计
     */
    updatePlaybackStats(trackData) {
        if (!this.userStats) return;

        const { category, trackName, duration } = trackData;

        // 更新总统计
        this.userStats.totalSessions++;
        this.userStats.totalMinutes += Math.floor(duration / 60);

        // 更新分类统计
        if (!this.userStats.sessionsByCategory[category]) {
            this.userStats.sessionsByCategory[category] = 0;
        }
        this.userStats.sessionsByCategory[category]++;

        // 更新最常播放
        this.updateMostPlayed(trackName, category);

        // 保存统计
        this.saveUserStats();
    }

    /**
     * 更新最常播放
     */
    updateMostPlayed(trackName, category) {
        // 简单实现：根据播放次数判断
        const trackKey = `${category}-${trackName}`;

        if (!this.userStats.playCounts) {
            this.userStats.playCounts = {};
        }

        this.userStats.playCounts[trackKey] = (this.userStats.playCounts[trackKey] || 0) + 1;

        // 找出播放最多的
        let maxCount = 0;
        let mostPlayed = null;

        for (const [key, count] of Object.entries(this.userStats.playCounts)) {
            if (count > maxCount) {
                maxCount = count;
                mostPlayed = key;
            }
        }

        if (mostPlayed) {
            const [cat, track] = mostPlayed.split('-');
            this.userStats.mostPlayedTrack = track;
        }
    }

    /**
     * 更新最爱分类
     */
    updateFavoriteCategory() {
        if (!this.userStats || !this.userStats.sessionsByCategory) return;

        let maxCount = 0;
        let favoriteCategory = null;

        for (const [category, count] of Object.entries(this.userStats.sessionsByCategory)) {
            if (count > maxCount) {
                maxCount = count;
                favoriteCategory = category;
            }
        }

        this.userStats.favoriteCategory = favoriteCategory;
        this.saveUserStats();
    }

    /**
     * 设置每周定时器
     */
    setupWeeklySchedule() {
        if (!this.isEnabled) return;

        // 计算下次发送时间
        const nextSendDate = this.calculateNextSendDate();
        const timeUntilSend = nextSendDate - new Date();

        console.log(`📅 下次周报发送时间: ${nextSendDate.toLocaleString()}`);

        // 设置定时器
        setTimeout(() => {
            this.sendWeeklyDigest();
            // 设置下一周发送
            this.setupWeeklySchedule();
        }, timeUntilSend);
    }

    /**
     * 计算下次发送时间
     */
    calculateNextSendDate() {
        const now = new Date();
        const [hours, minutes] = this.sendTime.split(':').map(Number);

        // 找到下一个发送日
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDayIndex = now.getDay(); // 0 = Sunday
        const sendDayIndex = daysOfWeek.indexOf(this.sendDay);

        let nextSendDate = new Date(now);
        nextSendDate.setHours(hours, minutes, 0, 0);

        // 如果今天已过或不是发送日，设置到下周
        if (now > nextSendDate || currentDayIndex !== sendDayIndex) {
            const daysUntilSend = sendDayIndex - currentDayIndex + (sendDayIndex <= currentDayIndex ? 7 : 0);
            nextSendDate.setDate(now.getDate() + daysUntilSend);
        }

        return nextSendDate;
    }

    /**
     * 发送周报
     */
    sendWeeklyDigest() {
        // 检查是否本周已发送
        const thisWeek = this.getWeekKey(new Date());
        if (this.lastSentDate === thisWeek) {
            console.log('本周周报已发送，跳过');
            return;
        }

        // 获取用户信息
        const user = this.getCurrentUser();
        if (!user || !user.email) {
            console.log('⚠️ 未找到用户邮箱，跳过周报发送');
            return;
        }

        // 生成周报数据
        const digestData = this.generateWeeklyDigest();

        // 更新最爱分类
        this.updateFavoriteCategory();

        // 触发周报生成事件
        const event = new CustomEvent('weeklyDigestGenerated', { detail: digestData });
        document.dispatchEvent(event);

        // 更新最后发送日期
        this.lastSentDate = thisWeek;
        this.saveSettings();

        console.log('✅ 周报邮件事件已触发');
    }

    /**
     * 生成周报数据
     */
    generateWeeklyDigest() {
        // 计算本周统计
        const weekStats = this.calculateWeekStats();

        return {
            email: this.getCurrentUser().email,
            userName: this.getCurrentUser().displayName || '用户',
            totalSessions: this.userStats.totalSessions || 0,
            totalMinutes: this.userStats.totalMinutes || 0,
            favoriteCategory: this.userStats.favoriteCategory || '冥想音乐',
            mostPlayedTrack: this.userStats.mostPlayedTrack || '晨间冥想',
            weeklySessions: weekStats.sessions || 0,
            weeklyMinutes: weekStats.minutes || 0,
            weekStart: weekStats.weekStart,
            weekEnd: weekStats.weekEnd
        };
    }

    /**
     * 计算本周统计
     */
    calculateWeekStats() {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // 本周日开始
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        // 这里简化处理，实际应该从历史记录中计算
        return {
            weekStart: weekStart,
            weekEnd: weekEnd,
            sessions: Math.floor(this.userStats.totalSessions / 4), // 简化：假设总次数的1/4是本周的
            minutes: Math.floor(this.userStats.totalMinutes / 4)
        };
    }

    /**
     * 获取当前用户
     */
    getCurrentUser() {
        if (window.firebaseAuthManager && window.firebaseAuthManager.getCurrentUser) {
            return window.firebaseAuthManager.getCurrentUser();
        }

        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                return JSON.parse(savedUser);
            } catch (e) {
                return null;
            }
        }

        return null;
    }

    /**
     * 获取周键
     */
    getWeekKey(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());

        return `${year}-${month}-${weekStart.getDate()}`;
    }

    /**
     * 获取周报设置
     */
    getDigestSettings() {
        return {
            isEnabled: this.isEnabled,
            sendDay: this.sendDay,
            sendTime: this.sendTime,
            lastSentDate: this.lastSentDate,
            nextSendDate: this.calculateNextSendDate()
        };
    }

    /**
     * 更新周报设置
     */
    updateDigestSettings(settings) {
        if (settings.isEnabled !== undefined) this.isEnabled = settings.isEnabled;
        if (settings.sendDay) this.sendDay = settings.sendDay;
        if (settings.sendTime) this.sendTime = settings.sendTime;

        this.saveSettings();

        // 重新设置定时器
        if (this.reminderTimer) {
            clearTimeout(this.reminderTimer);
        }

        if (this.isEnabled) {
            this.setupWeeklySchedule();
        }
    }

    /**
     * 手动发送周报（测试用）
     */
    async sendTestDigest() {
        console.log('📧 发送测试周报...');

        const digestData = this.generateWeeklyDigest();
        const event = new CustomEvent('weeklyDigestGenerated', { detail: digestData });
        document.dispatchEvent(event);

        console.log('✅ 测试周报邮件事件已触发');
    }
}

// 创建全局实例
const weeklyDigestEmail = new WeeklyDigestEmail();
window.weeklyDigestEmail = weeklyDigestEmail;

// 监听音频播放事件，更新统计
document.addEventListener('audioPlayed', (event) => {
    if (window.weeklyDigestEmail) {
        window.weeklyDigestEmail.updatePlaybackStats(event.detail);
    }
});

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeeklyDigestEmail;
}

console.log('✅ 周报邮件系统已加载');