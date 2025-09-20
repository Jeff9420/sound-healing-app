/**
 * 增强电子商务跟踪
 * 为声音疗愈应用配置的价值事件跟踪系统
 *
 * @version 1.0.0
 * @date 2024-09-20
 */

class EnhancedEcommerce {
    constructor() {
        this.isInitialized = false;
        this.sessionValue = 0;
        this.conversionValues = {
            audio_play: 0.1,          // 播放音频的价值
            audio_complete: 1.0,      // 完成音频的价值
            session_complete: 2.0,    // 完成会话的价值
            daily_return: 5.0,        // 日活用户价值
            weekly_retention: 10.0,   // 周留存价值
            sharing: 3.0,            // 分享行为价值
            feedback: 2.0            // 反馈行为价值
        };

        // 用户生命周期价值计算
        this.userLTVData = {
            newUser: 0,
            returningUser: 0,
            loyalUser: 0,
            championUser: 0
        };

        this.init();
    }

    /**
     * 初始化增强电子商务跟踪
     */
    init() {
        console.log('💰 Enhanced Ecommerce: 初始化增强电子商务跟踪');

        this.setupValueTracking();
        this.setupConversionTracking();
        this.calculateUserLTV();
        this.isInitialized = true;

        // 定期更新用户价值
        setInterval(() => {
            this.updateUserValue();
        }, 60000); // 每分钟更新一次
    }

    /**
     * 设置价值跟踪
     */
    setupValueTracking() {
        // 音频播放价值跟踪
        document.addEventListener('audioPlay', (e) => {
            this.trackValueEvent('audio_play', {
                item_id: e.detail.fileName || 'unknown',
                item_name: e.detail.fileName || 'Unknown Audio',
                item_category: e.detail.category || 'unknown',
                value: this.conversionValues.audio_play
            });
        });

        // 音频完成价值跟踪
        document.addEventListener('audioEnd', (e) => {
            this.trackValueEvent('audio_complete', {
                item_id: e.detail.fileName || 'unknown',
                item_name: e.detail.fileName || 'Unknown Audio',
                item_category: e.detail.category || 'unknown',
                value: this.conversionValues.audio_complete,
                duration: e.detail.duration || 0
            });
        });

        // 会话完成价值跟踪
        this.setupSessionValueTracking();
    }

    /**
     * 设置会话价值跟踪
     */
    setupSessionValueTracking() {
        let sessionStartTime = Date.now();
        let audioPlayCount = 0;
        let totalListenTime = 0;

        // 监听音频播放
        document.addEventListener('audioPlay', () => {
            audioPlayCount++;
        });

        document.addEventListener('audioEnd', (e) => {
            totalListenTime += e.detail.duration || 0;
        });

        // 页面关闭时计算会话价值
        window.addEventListener('beforeunload', () => {
            const sessionDuration = (Date.now() - sessionStartTime) / 1000;
            this.calculateSessionValue(sessionDuration, audioPlayCount, totalListenTime);
        });

        // 定期检查会话价值
        setInterval(() => {
            const sessionDuration = (Date.now() - sessionStartTime) / 1000;
            if (sessionDuration > 300 && audioPlayCount > 0) { // 5分钟以上且有播放
                this.trackValueEvent('session_milestone', {
                    value: this.conversionValues.session_complete,
                    session_duration: sessionDuration,
                    audio_plays: audioPlayCount,
                    total_listen_time: totalListenTime
                });
            }
        }, 300000); // 每5分钟检查一次
    }

    /**
     * 计算会话价值
     */
    calculateSessionValue(duration, playCount, listenTime) {
        let sessionValue = 0;

        // 基础会话价值
        if (duration > 60) sessionValue += 0.5;
        if (duration > 300) sessionValue += 1.0;
        if (duration > 600) sessionValue += 1.5;

        // 播放次数加分
        sessionValue += playCount * 0.2;

        // 听音时间加分
        sessionValue += Math.min(listenTime / 300, 2.0); // 最多2分加分

        // 跟踪最终会话价值
        this.trackValueEvent('session_complete', {
            value: sessionValue,
            session_duration: duration,
            audio_plays: playCount,
            total_listen_time: listenTime
        });

        this.sessionValue = sessionValue;
    }

    /**
     * 设置转化跟踪
     */
    setupConversionTracking() {
        // 首次音频播放转化
        let hasPlayedAudio = localStorage.getItem('hasPlayedAudio');
        if (!hasPlayedAudio) {
            document.addEventListener('audioPlay', () => {
                if (!localStorage.getItem('hasPlayedAudio')) {
                    localStorage.setItem('hasPlayedAudio', 'true');
                    this.trackConversion('first_audio_play', 1.0);
                }
            }, { once: true });
        }

        // 完成首个音频转化
        let hasCompletedAudio = localStorage.getItem('hasCompletedAudio');
        if (!hasCompletedAudio) {
            document.addEventListener('audioEnd', () => {
                if (!localStorage.getItem('hasCompletedAudio')) {
                    localStorage.setItem('hasCompletedAudio', 'true');
                    this.trackConversion('first_audio_complete', 2.0);
                }
            }, { once: true });
        }

        // 回访用户转化
        this.trackReturnUserConversion();

        // 长时间使用转化
        this.trackLongSessionConversion();
    }

    /**
     * 跟踪回访用户转化
     */
    trackReturnUserConversion() {
        const firstVisit = localStorage.getItem('firstVisit');
        const lastVisit = localStorage.getItem('lastVisit');
        const today = new Date().toDateString();

        if (firstVisit && lastVisit) {
            const daysSinceFirst = Math.floor((Date.now() - parseInt(firstVisit)) / (1000 * 60 * 60 * 24));
            const daysSinceLast = Math.floor((Date.now() - parseInt(lastVisit)) / (1000 * 60 * 60 * 24));

            // 日活跃用户
            if (daysSinceLast === 1) {
                this.trackConversion('daily_active_user', this.conversionValues.daily_return);
            }

            // 周留存用户
            if (daysSinceFirst >= 7 && daysSinceLast <= 7) {
                this.trackConversion('weekly_retention', this.conversionValues.weekly_retention);
            }

            // 月留存用户
            if (daysSinceFirst >= 30) {
                this.trackConversion('monthly_retention', 15.0);
            }
        }

        localStorage.setItem('lastVisit', Date.now().toString());
    }

    /**
     * 跟踪长时间使用转化
     */
    trackLongSessionConversion() {
        const sessionStart = Date.now();
        const milestones = [
            { time: 600000, value: 2.0, name: '10min_session' },    // 10分钟
            { time: 1800000, value: 5.0, name: '30min_session' },   // 30分钟
            { time: 3600000, value: 10.0, name: '60min_session' }   // 60分钟
        ];

        milestones.forEach(milestone => {
            setTimeout(() => {
                if (document.visibilityState === 'visible') {
                    this.trackConversion(milestone.name, milestone.value);
                }
            }, milestone.time);
        });
    }

    /**
     * 计算用户生命周期价值
     */
    calculateUserLTV() {
        const userData = this.getUserEngagementData();
        const userType = this.classifyUser(userData);

        // 根据用户类型设置LTV
        switch (userType) {
            case 'new':
                this.userLTVData.newUser = 1.0;
                break;
            case 'returning':
                this.userLTVData.returningUser = 5.0;
                break;
            case 'loyal':
                this.userLTVData.loyalUser = 15.0;
                break;
            case 'champion':
                this.userLTVData.championUser = 30.0;
                break;
        }

        // 发送用户LTV事件
        this.trackValueEvent('user_ltv_calculated', {
            value: this.userLTVData[userType + 'User'],
            user_type: userType,
            total_sessions: userData.totalSessions,
            total_audio_plays: userData.totalAudioPlays
        });
    }

    /**
     * 获取用户参与数据
     */
    getUserEngagementData() {
        const sessionHistory = JSON.parse(localStorage.getItem('sessionHistory') || '[]');
        const eventLog = JSON.parse(localStorage.getItem('eventLog') || '[]');

        const totalSessions = sessionHistory.length;
        const totalAudioPlays = eventLog.filter(e => e.event === 'audio_play').length;
        const totalListenTime = eventLog
            .filter(e => e.event === 'audio_complete')
            .reduce((sum, e) => sum + (e.parameters.duration || 0), 0);

        const daysSinceFirst = localStorage.getItem('firstVisit') ?
            Math.floor((Date.now() - parseInt(localStorage.getItem('firstVisit'))) / (1000 * 60 * 60 * 24)) : 0;

        return {
            totalSessions,
            totalAudioPlays,
            totalListenTime,
            daysSinceFirst,
            avgSessionDuration: totalSessions > 0 ?
                sessionHistory.reduce((sum, s) => sum + s.duration, 0) / totalSessions : 0
        };
    }

    /**
     * 用户分类
     */
    classifyUser(userData) {
        if (userData.totalSessions === 0) return 'new';
        if (userData.totalSessions < 5) return 'returning';
        if (userData.totalSessions < 20 && userData.daysSinceFirst < 30) return 'loyal';
        return 'champion';
    }

    /**
     * 跟踪价值事件
     */
    trackValueEvent(eventName, parameters = {}) {
        if (!this.isInitialized) return;

        // 确保价值是数字
        const value = parseFloat(parameters.value) || 0;

        // GA4 价值事件
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                ...parameters,
                value: value,
                currency: 'USD',
                event_category: 'value_generation'
            });
        }

        // 累计会话价值
        this.sessionValue += value;

        console.log(`💰 价值事件: ${eventName}`, {
            value: value,
            sessionTotal: this.sessionValue,
            ...parameters
        });
    }

    /**
     * 跟踪转化事件
     */
    trackConversion(conversionType, value = 0) {
        this.trackValueEvent('conversion', {
            value: value,
            conversion_type: conversionType,
            event_category: 'conversion'
        });

        // GA4 转化事件
        if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', {
                send_to: window.ga4Config?.getMeasurementId(),
                value: value,
                currency: 'USD',
                conversion_type: conversionType
            });
        }

        console.log(`🎯 转化事件: ${conversionType}`, { value });
    }

    /**
     * 获取当前会话价值
     */
    getSessionValue() {
        return this.sessionValue;
    }

    /**
     * 更新用户价值
     */
    updateUserValue() {
        const currentValue = this.getSessionValue();
        if (currentValue > 0) {
            this.trackValueEvent('session_value_update', {
                value: currentValue,
                timestamp: Date.now()
            });
        }
    }

    /**
     * 生成价值报告
     */
    generateValueReport() {
        const userData = this.getUserEngagementData();
        const userType = this.classifyUser(userData);

        return {
            currentSession: {
                value: this.sessionValue,
                duration: Date.now() - (localStorage.getItem('sessionStart') || Date.now())
            },
            userLifetime: {
                type: userType,
                estimatedValue: this.userLTVData[userType + 'User'],
                totalSessions: userData.totalSessions,
                totalAudioPlays: userData.totalAudioPlays,
                totalListenTime: userData.totalListenTime
            },
            conversionHistory: this.getConversionHistory()
        };
    }

    /**
     * 获取转化历史
     */
    getConversionHistory() {
        const eventLog = JSON.parse(localStorage.getItem('eventLog') || '[]');
        return eventLog
            .filter(e => e.event === 'conversion')
            .map(e => ({
                type: e.parameters.conversion_type,
                value: e.parameters.value,
                timestamp: e.timestamp
            }));
    }

    /**
     * 清理方法
     */
    cleanup() {
        console.log('🧹 Enhanced Ecommerce: 清理完成');
    }
}

// 全局实例
let enhancedEcommerce;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 等待GA4配置完成后初始化
    setTimeout(() => {
        enhancedEcommerce = new EnhancedEcommerce();
        window.enhancedEcommerce = enhancedEcommerce;
        console.log('✅ Enhanced Ecommerce 初始化完成');
    }, 1000);
});

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedEcommerce;
}