/**
 * 通知偏好管理器
 * 管理用户的通知偏好设置
 *
 * @author Sound Healing Team
 * @version 1.0.0
 */

class NotificationPreferences {
    constructor() {
        this.preferences = {
            enabled: true,
            playbackNotifications: true,
            timerNotifications: true,
            errorNotifications: true,
            autoHide: true,
            autoHideDelay: 3000,
            position: 'top-right' // top-right, top-left, bottom-right, bottom-left
        };

        this.loadPreferences();
    }

    /**
     * 加载用户偏好
     */
    loadPreferences() {
        try {
            const saved = localStorage.getItem('notificationPreferences');
            if (saved) {
                this.preferences = { ...this.preferences, ...JSON.parse(saved) };
                console.log('✅ 通知偏好已加载');
            }
        } catch (error) {
            console.warn('加载通知偏好失败:', error);
        }
    }

    /**
     * 保存用户偏好
     */
    savePreferences() {
        try {
            localStorage.setItem('notificationPreferences', JSON.stringify(this.preferences));
            console.log('✅ 通知偏好已保存');
        } catch (error) {
            console.warn('保存通知偏好失败:', error);
        }
    }

    /**
     * 获取偏好设置
     */
    get(key) {
        return this.preferences[key];
    }

    /**
     * 设置偏好
     */
    set(key, value) {
        this.preferences[key] = value;
        this.savePreferences();

        // 触发偏好更新事件
        window.dispatchEvent(new CustomEvent('notificationPreferenceChanged', {
            detail: { key, value }
        }));
    }

    /**
     * 检查是否应该显示通知
     */
    shouldShowNotification(type) {
        if (!this.preferences.enabled) {
            return false;
        }

        switch (type) {
            case 'playback':
                return this.preferences.playbackNotifications;
            case 'timer':
                return this.preferences.timerNotifications;
            case 'error':
                return this.preferences.errorNotifications;
            default:
                return true;
        }
    }

    /**
     * 显示通知（带偏好检查）
     */
    show(message, type = 'info', category = 'general') {
        // 检查是否应该显示
        if (!this.shouldShowNotification(category)) {
            return;
        }

        const notification = document.getElementById('notification');
        if (!notification) {
            return;
        }

        // 设置通知内容和样式
        notification.textContent = message;
        notification.className = `notification ${type} ${this.preferences.position}`;
        notification.style.display = 'block';

        // 自动隐藏
        if (this.preferences.autoHide) {
            setTimeout(() => {
                notification.style.display = 'none';
            }, this.preferences.autoHideDelay);
        }
    }

    /**
     * 打开设置面板
     */
    openSettings() {
        const modal = this.createSettingsModal();
        document.body.appendChild(modal);

        // 焦点到模态框
        setTimeout(() => {
            const firstInput = modal.querySelector('input, select');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    /**
     * 创建设置模态框
     */
    createSettingsModal() {
        const modal = document.createElement('div');
        modal.id = 'notificationSettingsModal';
        modal.className = 'notification-settings-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'notificationSettingsTitle');
        modal.setAttribute('aria-modal', 'true');

        modal.innerHTML = `
            <div class="notification-settings-content">
                <h2 id="notificationSettingsTitle">⚙️ 通知设置</h2>
                <button class="close-notification-settings" aria-label="关闭设置">&times;</button>

                <div class="settings-section">
                    <h3>通知开关</h3>
                    <label class="setting-item">
                        <input type="checkbox" id="notif-enabled" ${this.preferences.enabled ? 'checked' : ''}>
                        <span>启用通知</span>
                    </label>
                </div>

                <div class="settings-section">
                    <h3>通知类型</h3>
                    <label class="setting-item">
                        <input type="checkbox" id="notif-playback" ${this.preferences.playbackNotifications ? 'checked' : ''}>
                        <span>播放通知（播放/暂停/切换）</span>
                    </label>
                    <label class="setting-item">
                        <input type="checkbox" id="notif-timer" ${this.preferences.timerNotifications ? 'checked' : ''}>
                        <span>定时器通知</span>
                    </label>
                    <label class="setting-item">
                        <input type="checkbox" id="notif-error" ${this.preferences.errorNotifications ? 'checked' : ''}>
                        <span>错误通知</span>
                    </label>
                </div>

                <div class="settings-section">
                    <h3>显示设置</h3>
                    <label class="setting-item">
                        <input type="checkbox" id="notif-autohide" ${this.preferences.autoHide ? 'checked' : ''}>
                        <span>自动隐藏</span>
                    </label>
                    <label class="setting-item">
                        <span>隐藏延迟（秒）</span>
                        <input type="range" id="notif-delay" min="1" max="10" value="${this.preferences.autoHideDelay / 1000}"
                               style="width: 100px; margin: 0 10px;">
                        <span id="notif-delay-value">${this.preferences.autoHideDelay / 1000}s</span>
                    </label>
                    <label class="setting-item">
                        <span>通知位置</span>
                        <select id="notif-position" style="padding: 5px;">
                            <option value="top-right" ${this.preferences.position === 'top-right' ? 'selected' : ''}>右上角</option>
                            <option value="top-left" ${this.preferences.position === 'top-left' ? 'selected' : ''}>左上角</option>
                            <option value="bottom-right" ${this.preferences.position === 'bottom-right' ? 'selected' : ''}>右下角</option>
                            <option value="bottom-left" ${this.preferences.position === 'bottom-left' ? 'selected' : ''}>左下角</option>
                        </select>
                    </label>
                </div>

                <div class="settings-actions">
                    <button class="save-settings-btn">💾 保存设置</button>
                    <button class="test-notification-btn">🔔 测试通知</button>
                </div>
            </div>
        `;

        // 事件监听
        this.attachModalEvents(modal);

        return modal;
    }

    /**
     * 附加模态框事件
     */
    attachModalEvents(modal) {
        // 关闭按钮
        const closeBtn = modal.querySelector('.close-notification-settings');
        closeBtn.addEventListener('click', () => this.closeSettings());

        // 延迟滑块值更新
        const delaySlider = modal.querySelector('#notif-delay');
        const delayValue = modal.querySelector('#notif-delay-value');
        delaySlider.addEventListener('input', (e) => {
            delayValue.textContent = e.target.value + 's';
        });

        // 保存按钮
        const saveBtn = modal.querySelector('.save-settings-btn');
        saveBtn.addEventListener('click', () => this.saveSettings(modal));

        // 测试按钮
        const testBtn = modal.querySelector('.test-notification-btn');
        testBtn.addEventListener('click', () => {
            this.show('这是一条测试通知 🎵', 'info', 'general');
        });

        // ESC键关闭
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeSettings();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // 点击外部关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeSettings();
            }
        });
    }

    /**
     * 保存设置
     */
    saveSettings(modal) {
        this.set('enabled', modal.querySelector('#notif-enabled').checked);
        this.set('playbackNotifications', modal.querySelector('#notif-playback').checked);
        this.set('timerNotifications', modal.querySelector('#notif-timer').checked);
        this.set('errorNotifications', modal.querySelector('#notif-error').checked);
        this.set('autoHide', modal.querySelector('#notif-autohide').checked);
        this.set('autoHideDelay', parseInt(modal.querySelector('#notif-delay').value) * 1000);
        this.set('position', modal.querySelector('#notif-position').value);

        this.show('✅ 设置已保存', 'success', 'general');
        this.closeSettings();
    }

    /**
     * 关闭设置
     */
    closeSettings() {
        const modal = document.getElementById('notificationSettingsModal');
        if (modal) {
            modal.remove();
        }
    }
}

// 创建全局实例
if (typeof window !== 'undefined') {
    window.notificationPreferences = new NotificationPreferences();
    console.log('✅ 通知偏好管理器已创建');

    // 覆盖全局showNotification函数
    window.showNotification = function(message, type = 'info', category = 'general') {
        window.notificationPreferences.show(message, type, category);
    };
}
