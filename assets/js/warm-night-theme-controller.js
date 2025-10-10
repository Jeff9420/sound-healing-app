/**
 * =================================================================
 * 🌙 温暖夜色主题控制器 - 失眠友好UI解决方案
 * =================================================================
 */

class WarmNightThemeController {
    constructor() {
        this.isInitialized = false;
        this.currentTimeMode = 'default';
        this.breathingAnimation = null;
        this.settings = {
            blueLightFilter: true,
            dynamicBrightness: true,
            breathingEffects: true,
            timeBasedAdjustment: true,
            intensity: 0.8 // 0-1, 主题强度
        };

        console.log('🌙 温暖夜色主题控制器启动中...');
        this.init();
    }

    /**
     * 初始化主题控制器
     */
    async init() {
        try {
            await this.loadThemeSettings();
            this.applyWarmNightTheme();
            this.setupTimeBasedAdjustment();
            this.initBreathingEffects();
            this.bindEvents();
            this.createThemeControls();

            this.isInitialized = true;
            console.log('✅ 温暖夜色主题控制器初始化完成');

            // 触发主题就绪事件
            document.dispatchEvent(new CustomEvent('warmNightThemeReady', {
                detail: { controller: this }
            }));

        } catch (error) {
            console.error('❌ 主题控制器初始化失败:', error);
        }
    }

    /**
     * 应用温暖夜色主题
     */
    applyWarmNightTheme() {
        // 添加主题类到body
        document.body.classList.add('warm-night-theme');

        // 设置CSS自定义属性
        const root = document.documentElement;

        // 根据强度调整主题参数
        const intensity = this.settings.intensity;

        root.style.setProperty('--theme-intensity', intensity);
        root.style.setProperty('--breathing-rhythm', this.settings.breathingEffects ? '4s' : '0s');

        // 应用蓝光过滤
        if (this.settings.blueLightFilter) {
            this.applyBlueLightFilter();
        }

        console.log('🎨 温暖夜色主题已应用');
    }

    /**
     * 应用蓝光过滤
     */
    applyBlueLightFilter() {
        const filterIntensity = this.settings.intensity;
        const sepiaValue = 0.15 * filterIntensity;
        const saturateValue = 0.85 + (0.1 * (1 - filterIntensity));
        const hueRotateValue = 18 * filterIntensity;
        const brightnessValue = 0.88 + (0.07 * (1 - filterIntensity));
        const contrastValue = 0.92 + (0.05 * (1 - filterIntensity));

        const filter = `sepia(${sepiaValue}) saturate(${saturateValue}) hue-rotate(${hueRotateValue}deg) brightness(${brightnessValue}) contrast(${contrastValue})`;

        document.documentElement.style.filter = filter;
    }

    /**
     * 设置基于时间的动态调整
     */
    setupTimeBasedAdjustment() {
        if (!this.settings.timeBasedAdjustment) {
            return;
        }

        const updateTimeMode = () => {
            const now = new Date();
            const hour = now.getHours();
            let newMode = 'default';

            // 时间段判断
            if (hour >= 20 || hour <= 2) {
                newMode = 'deep-night'; // 深夜模式 (20:00-02:00)
            } else if (hour >= 18 || hour <= 6) {
                newMode = 'evening'; // 晚间模式 (18:00-06:00)
            }

            if (newMode !== this.currentTimeMode) {
                this.currentTimeMode = newMode;
                this.applyTimeModeStyles(newMode);
            }
        };

        // 立即执行一次
        updateTimeMode();

        // 每分钟检查一次时间
        setInterval(updateTimeMode, 60000);

        console.log('⏰ 基于时间的动态调整已启用');
    }

    /**
     * 应用时间模式样式
     */
    applyTimeModeStyles(mode) {
        document.body.classList.remove('evening-mode', 'deep-night-mode');

        switch (mode) {
        case 'evening':
            document.body.classList.add('evening-mode');
            console.log('🌆 切换到晚间模式');
            break;
        case 'deep-night':
            document.body.classList.add('deep-night-mode');
            console.log('🌙 切换到深夜模式');
            break;
        default:
            console.log('🌅 切换到默认模式');
        }
    }

    /**
     * 初始化呼吸效果
     */
    initBreathingEffects() {
        if (!this.settings.breathingEffects) {
            return;
        }

        const breathingElements = document.querySelectorAll('.carrossel-item.active, .lotus-player');

        breathingElements.forEach(element => {
            element.classList.add('breathing-element');
        });

        // 监听卡片状态变化，动态添加呼吸效果
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const element = mutation.target;
                    if (element.classList.contains('active')) {
                        element.classList.add('breathing-element');
                    } else {
                        element.classList.remove('breathing-element');
                    }
                }
            });
        });

        // 观察所有轮播项目
        document.querySelectorAll('.carrossel-item').forEach(item => {
            observer.observe(item, { attributes: true });
        });

        console.log('🫁 呼吸效果已启用');
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 监听用户偏好变化
        if (window.matchMedia) {
            // 监听系统主题偏好
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
            prefersDark.addListener(() => this.handleSystemThemeChange());

            // 监听减少动画偏好
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
            prefersReducedMotion.addListener(() => this.handleReducedMotionChange());

            // 监听高对比度偏好
            const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
            prefersHighContrast.addListener(() => this.handleContrastChange());
        }

        // 页面可见性变化监听
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.refreshTheme();
            }
        });

        // 窗口焦点事件
        window.addEventListener('focus', () => {
            this.refreshTheme();
        });

        console.log('👂 事件监听器已绑定');
    }

    /**
     * 创建主题控制面板
     */
    createThemeControls() {
        const controlPanel = document.createElement('div');
        controlPanel.className = 'warm-night-theme-controls';
        controlPanel.innerHTML = `
            <div class="theme-control-header">
                <span>🌙 失眠友好设置</span>
                <button class="theme-toggle-btn" id="themeToggle">⚙️</button>
            </div>
            <div class="theme-control-content" id="themeControlContent" style="display: none;">
                <div class="control-group">
                    <label>
                        <input type="checkbox" id="blueLightFilter" ${this.settings.blueLightFilter ? 'checked' : ''}>
                        蓝光过滤
                    </label>
                </div>
                <div class="control-group">
                    <label>
                        <input type="checkbox" id="breathingEffects" ${this.settings.breathingEffects ? 'checked' : ''}>
                        呼吸效果
                    </label>
                </div>
                <div class="control-group">
                    <label>
                        <input type="checkbox" id="timeBasedAdjustment" ${this.settings.timeBasedAdjustment ? 'checked' : ''}>
                        时间自适应
                    </label>
                </div>
                <div class="control-group">
                    <label>主题强度</label>
                    <input type="range" id="themeIntensity" min="0" max="1" step="0.1" value="${this.settings.intensity}">
                    <span id="intensityValue">${Math.round(this.settings.intensity * 100)}%</span>
                </div>
                <div class="control-actions">
                    <button id="resetTheme">重置默认</button>
                </div>
            </div>
        `;

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .warm-night-theme-controls {
                position: fixed;
                top: 80px;
                right: 20px;
                width: 280px;
                background: var(--gradient-card, rgba(45, 24, 16, 0.9));
                border: var(--border-warm, 1px solid rgba(212, 165, 116, 0.3));
                border-radius: 12px;
                backdrop-filter: blur(20px);
                box-shadow: var(--shadow-medium, 0 8px 32px rgba(139, 69, 19, 0.25));
                z-index: 9999;
                font-size: 14px;
            }

            .theme-control-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                border-bottom: var(--border-soft, 1px solid rgba(139, 69, 19, 0.2));
                color: var(--text-primary, #f4e4bc);
            }

            .theme-toggle-btn {
                background: none;
                border: none;
                color: var(--text-secondary, #d4a574);
                cursor: pointer;
                font-size: 16px;
                transition: transform 0.3s ease;
            }

            .theme-toggle-btn:hover {
                transform: rotate(90deg);
            }

            .theme-control-content {
                padding: 16px;
            }

            .control-group {
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .control-group label {
                color: var(--text-secondary, #d4a574);
                display: flex;
                align-items: center;
                cursor: pointer;
            }

            .control-group input[type="checkbox"] {
                margin-right: 8px;
                accent-color: var(--accent-glow, #daa520);
            }

            .control-group input[type="range"] {
                flex: 1;
                margin: 0 12px;
                accent-color: var(--accent-glow, #daa520);
            }

            #intensityValue {
                color: var(--accent-glow, #daa520);
                font-weight: bold;
                min-width: 35px;
                text-align: right;
            }

            .control-actions {
                margin-top: 16px;
                padding-top: 12px;
                border-top: var(--border-soft, 1px solid rgba(139, 69, 19, 0.2));
            }

            .control-actions button {
                width: 100%;
                background: var(--accent-warm, #cd853f);
                color: var(--bg-deepest, #0d0704);
                border: none;
                border-radius: 6px;
                padding: 8px 12px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .control-actions button:hover {
                background: var(--accent-glow, #daa520);
                box-shadow: 0 0 12px rgba(218, 165, 32, 0.4);
            }

            @media (max-width: 768px) {
                .warm-night-theme-controls {
                    right: 10px;
                    width: 250px;
                }
            }
        `;
        document.head.appendChild(style);

        // 绑定控制面板事件
        this.bindControlPanelEvents(controlPanel);

        document.body.appendChild(controlPanel);
        console.log('🎛️ 主题控制面板已创建');
    }

    /**
     * 绑定控制面板事件
     */
    bindControlPanelEvents(controlPanel) {
        // 切换显示/隐藏
        const toggleBtn = controlPanel.querySelector('#themeToggle');
        const content = controlPanel.querySelector('#themeControlContent');

        toggleBtn.addEventListener('click', () => {
            const isVisible = content.style.display !== 'none';
            content.style.display = isVisible ? 'none' : 'block';
            toggleBtn.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
        });

        // 蓝光过滤切换
        controlPanel.querySelector('#blueLightFilter').addEventListener('change', (e) => {
            this.settings.blueLightFilter = e.target.checked;
            if (e.target.checked) {
                this.applyBlueLightFilter();
            } else {
                document.documentElement.style.filter = 'none';
            }
            this.saveSettings();
        });

        // 呼吸效果切换
        controlPanel.querySelector('#breathingEffects').addEventListener('change', (e) => {
            this.settings.breathingEffects = e.target.checked;
            const root = document.documentElement;
            root.style.setProperty('--breathing-rhythm', e.target.checked ? '4s' : '0s');
            this.saveSettings();
        });

        // 时间自适应切换
        controlPanel.querySelector('#timeBasedAdjustment').addEventListener('change', (e) => {
            this.settings.timeBasedAdjustment = e.target.checked;
            if (e.target.checked) {
                this.setupTimeBasedAdjustment();
            } else {
                document.body.classList.remove('evening-mode', 'deep-night-mode');
            }
            this.saveSettings();
        });

        // 主题强度调节
        const intensitySlider = controlPanel.querySelector('#themeIntensity');
        const intensityValue = controlPanel.querySelector('#intensityValue');

        intensitySlider.addEventListener('input', (e) => {
            this.settings.intensity = parseFloat(e.target.value);
            intensityValue.textContent = Math.round(this.settings.intensity * 100) + '%';
            this.applyWarmNightTheme();
            this.saveSettings();
        });

        // 重置按钮
        controlPanel.querySelector('#resetTheme').addEventListener('click', () => {
            this.resetToDefaults();
            this.updateControlPanel();
        });
    }

    /**
     * 处理系统主题变化
     */
    handleSystemThemeChange() {
        console.log('🎨 系统主题偏好发生变化');
        this.refreshTheme();
    }

    /**
     * 处理减少动画偏好变化
     */
    handleReducedMotionChange() {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReduced) {
            this.settings.breathingEffects = false;
            document.documentElement.style.setProperty('--breathing-rhythm', '0s');
            console.log('♿ 已适应减少动画偏好');
        }

        this.updateControlPanel();
    }

    /**
     * 处理对比度变化
     */
    handleContrastChange() {
        console.log('🔍 对比度偏好发生变化');
        this.refreshTheme();
    }

    /**
     * 刷新主题
     */
    refreshTheme() {
        this.applyWarmNightTheme();
        if (this.settings.timeBasedAdjustment) {
            this.setupTimeBasedAdjustment();
        }
    }

    /**
     * 更新控制面板状态
     */
    updateControlPanel() {
        const blueLightCheckbox = document.querySelector('#blueLightFilter');
        const breathingCheckbox = document.querySelector('#breathingEffects');
        const timeAdjustmentCheckbox = document.querySelector('#timeBasedAdjustment');
        const intensitySlider = document.querySelector('#themeIntensity');
        const intensityValue = document.querySelector('#intensityValue');

        if (blueLightCheckbox) {
            blueLightCheckbox.checked = this.settings.blueLightFilter;
        }
        if (breathingCheckbox) {
            breathingCheckbox.checked = this.settings.breathingEffects;
        }
        if (timeAdjustmentCheckbox) {
            timeAdjustmentCheckbox.checked = this.settings.timeBasedAdjustment;
        }
        if (intensitySlider) {
            intensitySlider.value = this.settings.intensity;
        }
        if (intensityValue) {
            intensityValue.textContent = Math.round(this.settings.intensity * 100) + '%';
        }
    }

    /**
     * 重置为默认设置
     */
    resetToDefaults() {
        this.settings = {
            blueLightFilter: true,
            dynamicBrightness: true,
            breathingEffects: true,
            timeBasedAdjustment: true,
            intensity: 0.8
        };

        this.applyWarmNightTheme();
        this.saveSettings();
        console.log('🔄 主题设置已重置为默认值');
    }

    /**
     * 保存设置到本地存储
     */
    saveSettings() {
        try {
            localStorage.setItem('warmNightThemeSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('⚠️ 无法保存主题设置:', error);
        }
    }

    /**
     * 从本地存储加载设置
     */
    async loadThemeSettings() {
        try {
            const saved = localStorage.getItem('warmNightThemeSettings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
                console.log('📂 已加载保存的主题设置');
            }
        } catch (error) {
            console.warn('⚠️ 无法加载主题设置，使用默认值:', error);
        }
    }

    /**
     * 获取当前主题信息
     */
    getThemeInfo() {
        return {
            name: 'Warm Night Theme',
            version: '1.0.0',
            description: '失眠友好的温暖夜色主题',
            settings: this.settings,
            timeMode: this.currentTimeMode,
            isInitialized: this.isInitialized
        };
    }

    /**
     * 切换主题开关
     */
    toggle(enabled = null) {
        if (enabled === null) {
            enabled = !document.body.classList.contains('warm-night-theme');
        }

        if (enabled) {
            this.applyWarmNightTheme();
            console.log('✅ 温暖夜色主题已启用');
        } else {
            document.body.classList.remove('warm-night-theme');
            document.documentElement.style.filter = 'none';
            console.log('❌ 温暖夜色主题已禁用');
        }

        return enabled;
    }

    /**
     * 销毁主题控制器
     */
    destroy() {
        // 移除主题相关类和样式
        document.body.classList.remove('warm-night-theme', 'evening-mode', 'deep-night-mode');
        document.documentElement.style.filter = 'none';

        // 移除控制面板
        const controlPanel = document.querySelector('.warm-night-theme-controls');
        if (controlPanel) {
            controlPanel.remove();
        }

        // 清理呼吸效果
        document.querySelectorAll('.breathing-element').forEach(el => {
            el.classList.remove('breathing-element');
        });

        this.isInitialized = false;
        console.log('🗑️ 温暖夜色主题控制器已销毁');
    }
}

// 全局变量
window.WarmNightThemeController = WarmNightThemeController;

// 自动初始化
let warmNightThemeController = null;

// DOM加载完成后自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        warmNightThemeController = new WarmNightThemeController();
        window.warmNightThemeController = warmNightThemeController;
    });
} else {
    warmNightThemeController = new WarmNightThemeController();
    window.warmNightThemeController = warmNightThemeController;
}

console.log('🌙 温暖夜色主题控制器模块加载完成');