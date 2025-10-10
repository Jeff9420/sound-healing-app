/**
 * 疗愈状态控制器 - 替代天气模块
 * 显示当前疗愈状态、会话时长和智能建议
 * 
 * @author Claude Code Performance Optimization
 * @date 2024-09-05
 */

class HealingStatusController {
    constructor() {
        // 疗愈模式配置
        this.healingModes = {
            focus: {
                icon: '🧘',
                name: '专注模式',
                description: '帮助集中注意力',
                suggestedCategories: ['Rain', 'stream', 'wind']
            },
            relax: {
                icon: '😌',
                name: '放松模式',
                description: '缓解压力和紧张',
                suggestedCategories: ['ocean', 'Rain', 'meditation']
            },
            sleep: {
                icon: '😴',
                name: '睡眠模式',
                description: '帮助快速入眠',
                suggestedCategories: ['Rain', 'ocean', 'meditation']
            },
            meditation: {
                icon: '🕯️',
                name: '冥想模式',
                description: '深度内观和平静',
                suggestedCategories: ['Singing bowl sound', 'meditation', 'wind']
            },
            work: {
                icon: '💼',
                name: '工作模式',
                description: '提高工作效率',
                suggestedCategories: ['stream', 'wind', 'birds']
            },
            nature: {
                icon: '🌿',
                name: '自然模式',
                description: '感受大自然的力量',
                suggestedCategories: ['birds', 'stream', 'wind']
            }
        };
        
        // 当前状态
        this.currentMode = 'focus';
        this.sessionStartTime = null;
        this.sessionTimer = null;
        this.isSessionActive = false;
        
        // DOM元素
        this.elements = {
            container: null,
            icon: null,
            text: null,
            time: null
        };
        
        this.initializeController();
    }
    
    /**
     * 初始化控制器
     */
    initializeController() {
        this.bindElements();
        this.setupEventListeners();
        this.startSessionTracking();
        
        // 根据时间自动选择模式
        this.autoSelectMode();
        
        console.log('🧘 疗愈状态控制器已启动');
    }
    
    /**
     * 绑定DOM元素
     */
    bindElements() {
        this.elements.container = document.querySelector('.healing-status-info');
        this.elements.icon = document.querySelector('.healing-mode-icon');
        this.elements.text = document.querySelector('.healing-mode-text');
        this.elements.time = document.querySelector('.session-time');
        
        if (!this.elements.container) {
            console.warn('⚠️ 疗愈状态容器未找到');
            return;
        }
    }
    
    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 点击状态栏切换模式
        if (this.elements.container) {
            this.elements.container.addEventListener('click', () => {
                this.cycleThroughModes();
            });
        }
        
        // 监听音频播放事件，自动调整模式
        document.addEventListener('audioPlayStart', (event) => {
            this.handleAudioPlay(event.detail);
        });
        
        // 监听用户交互，判断活跃状态
        document.addEventListener('click', () => {
            this.updateSessionActivity();
        });
        
        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseSession();
            } else {
                this.resumeSession();
            }
        });
    }
    
    /**
     * 开始会话追踪
     */
    startSessionTracking() {
        this.sessionStartTime = Date.now();
        this.isSessionActive = true;
        
        // 每秒更新时间显示
        this.sessionTimer = setInterval(() => {
            this.updateSessionTime();
        }, 1000);
        
        this.updateDisplay();
    }
    
    /**
     * 更新会话时间显示
     */
    updateSessionTime() {
        if (!this.isSessionActive || !this.sessionStartTime) {
            return;
        }
        
        const elapsed = Date.now() - this.sessionStartTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (this.elements.time) {
            this.elements.time.textContent = timeString;
        }
        
        // 长时间会话提醒
        if (minutes > 0 && minutes % 30 === 0 && seconds === 0) {
            this.showSessionReminder(minutes);
        }
    }
    
    /**
     * 根据时间自动选择模式
     */
    autoSelectMode() {
        const hour = new Date().getHours();
        
        if (hour >= 6 && hour < 9) {
            this.setMode('focus'); // 早晨专注
        } else if (hour >= 9 && hour < 17) {
            this.setMode('work'); // 工作时间
        } else if (hour >= 17 && hour < 22) {
            this.setMode('relax'); // 晚间放松
        } else {
            this.setMode('sleep'); // 夜间睡眠
        }
    }
    
    /**
     * 处理音频播放事件
     */
    handleAudioPlay(details) {
        // 根据音频类型智能调整模式
        const category = details.category;
        
        if (['meditation', 'Singing bowl sound'].includes(category)) {
            this.setMode('meditation');
        } else if (['Rain', 'ocean'].includes(category)) {
            if (new Date().getHours() > 21 || new Date().getHours() < 6) {
                this.setMode('sleep');
            } else {
                this.setMode('relax');
            }
        } else if (['stream', 'birds', 'wind'].includes(category)) {
            this.setMode('nature');
        }
        
        // 重置会话时间（新的音频播放）
        this.resetSession();
    }
    
    /**
     * 循环切换模式
     */
    cycleThroughModes() {
        const modes = Object.keys(this.healingModes);
        const currentIndex = modes.indexOf(this.currentMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        
        this.setMode(modes[nextIndex]);
        
        // 显示切换提示
        this.showModeChangeNotification();
    }
    
    /**
     * 设置疗愈模式
     */
    setMode(mode) {
        if (!this.healingModes[mode]) {
            console.warn('⚠️ 未知的疗愈模式:', mode);
            return;
        }
        
        this.currentMode = mode;
        this.updateDisplay();
        
        // 触发模式变更事件
        document.dispatchEvent(new CustomEvent('healingModeChange', {
            detail: {
                mode: mode,
                config: this.healingModes[mode]
            }
        }));
        
        console.log(`🧘 切换到${this.healingModes[mode].name}`);
    }
    
    /**
     * 更新显示
     */
    updateDisplay() {
        const modeConfig = this.healingModes[this.currentMode];
        
        if (this.elements.icon) {
            this.elements.icon.textContent = modeConfig.icon;
        }
        
        if (this.elements.text) {
            this.elements.text.textContent = modeConfig.name;
        }
        
        // 更新容器的数据属性，用于CSS样式
        if (this.elements.container) {
            this.elements.container.setAttribute('data-mode', this.currentMode);
            this.elements.container.title = `${modeConfig.name} - ${modeConfig.description}`;
        }
    }
    
    /**
     * 重置会话
     */
    resetSession() {
        this.sessionStartTime = Date.now();
        this.isSessionActive = true;
    }
    
    /**
     * 暂停会话
     */
    pauseSession() {
        this.isSessionActive = false;
    }
    
    /**
     * 恢复会话
     */
    resumeSession() {
        if (!this.isSessionActive) {
            // 恢复时重新计算起始时间
            const pausedTime = this.elements.time ? this.parseTimeString(this.elements.time.textContent) : 0;
            this.sessionStartTime = Date.now() - pausedTime;
            this.isSessionActive = true;
        }
    }
    
    /**
     * 解析时间字符串为毫秒
     */
    parseTimeString(timeString) {
        const [minutes, seconds] = timeString.split(':').map(Number);
        return (minutes * 60 + seconds) * 1000;
    }
    
    /**
     * 更新会话活跃度
     */
    updateSessionActivity() {
        // 用户交互时重置空闲状态
        this.lastActivityTime = Date.now();
    }
    
    /**
     * 显示会话提醒
     */
    showSessionReminder(minutes) {
        // 创建温和的提醒
        const reminder = document.createElement('div');
        reminder.className = 'session-reminder';
        reminder.innerHTML = `
            <div class="reminder-content">
                <span class="reminder-icon">⏰</span>
                <span class="reminder-text">已聆听 ${minutes} 分钟，注意适当休息</span>
            </div>
        `;
        
        // 添加样式
        Object.assign(reminder.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'rgba(127, 176, 105, 0.9)',
            color: '#fff',
            padding: '12px 16px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            zIndex: '1000',
            animation: 'slideInFade 0.5s ease-out'
        });
        
        document.body.appendChild(reminder);
        
        // 3秒后自动移除
        setTimeout(() => {
            reminder.style.animation = 'slideOutFade 0.5s ease-out';
            setTimeout(() => {
                document.body.removeChild(reminder);
            }, 500);
        }, 3000);
    }
    
    /**
     * 显示模式切换通知
     */
    showModeChangeNotification() {
        const modeConfig = this.healingModes[this.currentMode];
        
        // 简单的图标动画效果
        if (this.elements.icon) {
            this.elements.icon.style.animation = 'none';
            this.elements.icon.offsetHeight; // 强制重排
            this.elements.icon.style.animation = 'healing-pulse 1s ease-out';
        }
        
        // 在控制台输出切换信息
        console.log(`🔄 模式切换: ${modeConfig.name} - ${modeConfig.description}`);
    }
    
    /**
     * 获取当前状态信息
     */
    getStatusInfo() {
        const elapsed = this.sessionStartTime ? Date.now() - this.sessionStartTime : 0;
        const modeConfig = this.healingModes[this.currentMode];
        
        return {
            currentMode: this.currentMode,
            modeName: modeConfig.name,
            modeDescription: modeConfig.description,
            sessionDuration: elapsed,
            sessionActive: this.isSessionActive,
            suggestedCategories: modeConfig.suggestedCategories
        };
    }
    
    /**
     * 获取智能推荐
     */
    getSmartSuggestions() {
        const modeConfig = this.healingModes[this.currentMode];
        const hour = new Date().getHours();
        
        let suggestions = [...modeConfig.suggestedCategories];
        
        // 根据时间调整建议
        if (hour > 21 || hour < 6) {
            suggestions = suggestions.filter(cat => ['Rain', 'ocean', 'meditation'].includes(cat));
        } else if (hour >= 9 && hour < 17) {
            suggestions = suggestions.filter(cat => !['meditation'].includes(cat));
        }
        
        return {
            mode: modeConfig.name,
            categories: suggestions,
            reason: this.getRecommendationReason(hour)
        };
    }
    
    /**
     * 获取推荐理由
     */
    getRecommendationReason(hour) {
        if (hour > 21 || hour < 6) {
            return '夜间时光，推荐舒缓的声音帮助放松';
        } else if (hour >= 9 && hour < 17) {
            return '工作时间，推荐有助专注的自然声音';
        } else if (hour >= 17 && hour < 22) {
            return '傍晚时分，适合减压和放松的音频';
        } else {
            return '清晨时光，唤醒内心的平静与专注';
        }
    }
    
    /**
     * 销毁控制器
     */
    destroy() {
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
            this.sessionTimer = null;
        }
        
        this.isSessionActive = false;
        console.log('🧘 疗愈状态控制器已停止');
    }
}

// 创建全局实例
window.healingStatusController = new HealingStatusController();

// 导出API给其他模块使用
window.getHealingStatus = () => window.healingStatusController.getStatusInfo();
window.getHealingSuggestions = () => window.healingStatusController.getSmartSuggestions();
window.setHealingMode = (mode) => window.healingStatusController.setMode(mode);

// 防止重复创建样式
if (!document.getElementById('healing-status-animations')) {
    const animationStyles = document.createElement('style');
    animationStyles.id = 'healing-status-animations';
    animationStyles.textContent = `
@keyframes slideInFade {
    0% {
        transform: translateX(100px);
        opacity: 0;
    }
    100% {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOutFade {
    0% {
        transform: translateX(0);
        opacity: 1;
    }
    100% {
        transform: translateX(100px);
        opacity: 0;
    }
}

.session-reminder .reminder-content {
    display: flex;
    align-items: center;
    gap: 8px;
}

.reminder-icon {
    font-size: 1.1rem;
}
`;
    document.head.appendChild(animationStyles);
}

console.log('🚀 疗愈状态控制器模块加载完成');