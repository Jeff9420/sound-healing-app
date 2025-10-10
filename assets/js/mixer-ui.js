/**
 * MixerUI - 混音器用户界面
 *
 * 提供可视化的多轨混音控制界面
 *
 * @class
 * @author Sound Healing Team
 * @version 1.0.0
 */

class MixerUI {
    constructor(audioMixer) {
        this.audioMixer = audioMixer;
        this.modal = null;
        this.isOpen = false;
    }

    /**
     * 打开混音器界面
     */
    open() {
        if (!this.modal) {
            this.createModal();
        }

        this.modal.style.display = 'flex';
        setTimeout(() => this.modal.classList.add('active'), 10);
        this.isOpen = true;
        this.render();
    }

    /**
     * 关闭混音器界面
     */
    close() {
        if (this.modal) {
            this.modal.classList.remove('active');
            setTimeout(() => {
                this.modal.style.display = 'none';
                this.isOpen = false;
            }, 300);
        }
    }

    /**
     * 创建模态框
     */
    createModal() {
        this.modal = document.createElement('div');
        this.modal.id = 'mixerModal';
        this.modal.className = 'mixer-modal';
        this.modal.innerHTML = `
            <div class="mixer-content">
                <div class="mixer-header">
                    <h2>🎚️ <span data-i18n="mixer.title">音频混音器</span></h2>
                    <button class="mixer-close" onclick="window.mixerUI.close()">×</button>
                </div>

                <div class="mixer-presets">
                    <label data-i18n="mixer.presets">预设组合:</label>
                    <div class="preset-buttons" id="presetButtons"></div>
                </div>

                <div class="mixer-tracks" id="mixerTracks">
                    <!-- 轨道列表将动态生成 -->
                </div>

                <div class="mixer-controls">
                    <button class="mixer-btn mixer-btn-add" onclick="window.mixerUI.showAddTrackDialog()">
                        ➕ <span data-i18n="mixer.addTrack">添加音轨</span>
                    </button>
                    <button class="mixer-btn mixer-btn-play" onclick="window.mixerUI.playAll()">
                        ▶️ <span data-i18n="mixer.playAll">播放全部</span>
                    </button>
                    <button class="mixer-btn mixer-btn-pause" onclick="window.mixerUI.pauseAll()">
                        ⏸️ <span data-i18n="mixer.pauseAll">暂停全部</span>
                    </button>
                    <button class="mixer-btn mixer-btn-clear" onclick="window.mixerUI.clearAll()">
                        🗑️ <span data-i18n="mixer.clearAll">清空</span>
                    </button>
                </div>

                <div class="mixer-master">
                    <label data-i18n="mixer.masterVolume">主音量:</label>
                    <input type="range" id="masterVolumeSlider" min="0" max="100" value="80"
                           oninput="window.mixerUI.setMasterVolume(this.value)">
                    <span id="masterVolumeValue">80%</span>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);

        // 点击背景关闭
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // 监听混音器事件
        this.setupEventListeners();
    }

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        window.addEventListener('mixer:trackAdded', () => this.render());
        window.addEventListener('mixer:trackRemoved', () => this.render());
        window.addEventListener('mixer:trackPlay', () => this.render());
        window.addEventListener('mixer:trackPause', () => this.render());
    }

    /**
     * 渲染界面
     */
    render() {
        if (!this.modal) {
            return;
        }

        this.renderPresets();
        this.renderTracks();
    }

    /**
     * 渲染预设按钮
     */
    renderPresets() {
        const container = document.getElementById('presetButtons');
        if (!container) {
            return;
        }

        const presets = this.audioMixer.getPresets();
        const presetLabels = {
            'sleep': '😴 睡眠模式',
            'focus': '🎯 专注模式',
            'relax': '😌 放松模式',
            'deep-meditation': '🧘 深度冥想'
        };

        container.innerHTML = presets.map(preset => `
            <button class="preset-btn" onclick="window.mixerUI.loadPreset('${preset}')">
                ${presetLabels[preset] || preset}
            </button>
        `).join('');
    }

    /**
     * 渲染音轨列表
     */
    renderTracks() {
        const container = document.getElementById('mixerTracks');
        if (!container) {
            return;
        }

        const tracks = this.audioMixer.getTracks();

        if (tracks.length === 0) {
            container.innerHTML = `
                <div class="mixer-empty">
                    <p data-i18n="mixer.empty">还没有添加音轨</p>
                    <p class="mixer-hint" data-i18n="mixer.emptyHint">点击"添加音轨"开始创建混音</p>
                </div>
            `;
            return;
        }

        container.innerHTML = tracks.map(track => `
            <div class="mixer-track" data-track-id="${track.trackId}">
                <div class="track-info">
                    <div class="track-name">${this.getDisplayName(track.fileName)}</div>
                    <div class="track-category">${track.category}</div>
                </div>
                <div class="track-controls">
                    <button class="track-btn" onclick="window.mixerUI.toggleTrack('${track.trackId}')"
                            title="${track.isPlaying ? '暂停' : '播放'}">
                        ${track.isPlaying ? '⏸️' : '▶️'}
                    </button>
                    <input type="range" class="track-volume" min="0" max="100"
                           value="${track.volume * 100}"
                           oninput="window.mixerUI.setTrackVolume('${track.trackId}', this.value)">
                    <span class="track-volume-value">${Math.round(track.volume * 100)}%</span>
                    <button class="track-btn track-btn-remove"
                            onclick="window.mixerUI.removeTrack('${track.trackId}')"
                            title="移除">
                        ✕
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * 显示添加音轨对话框
     */
    async showAddTrackDialog() {
        // 获取可用分类
        const categories = typeof AUDIO_CONFIG !== 'undefined'
            ? Object.keys(AUDIO_CONFIG.categories)
            : [];

        if (categories.length === 0) {
            alert('没有可用的音频分类');
            return;
        }

        // 简单的分类选择
        const categoryHtml = categories.map(cat =>
            `<option value="${cat}">${cat}</option>`
        ).join('');

        const dialogHtml = `
            <div class="mixer-dialog">
                <h3 data-i18n="mixer.selectCategory">选择音频分类</h3>
                <select id="mixerCategorySelect">${categoryHtml}</select>
                <div class="dialog-buttons">
                    <button onclick="window.mixerUI.addTrackFromCategory()" class="mixer-btn">
                        <span data-i18n="mixer.confirm">确定</span>
                    </button>
                    <button onclick="this.closest('.mixer-dialog').remove()" class="mixer-btn">
                        <span data-i18n="mixer.cancel">取消</span>
                    </button>
                </div>
            </div>
        `;

        const dialog = document.createElement('div');
        dialog.className = 'mixer-dialog-overlay';
        dialog.innerHTML = dialogHtml;
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });

        this.modal.appendChild(dialog);
    }

    /**
     * 从分类添加音轨
     */
    async addTrackFromCategory() {
        const select = document.getElementById('mixerCategorySelect');
        if (!select) {
            return;
        }

        const category = select.value;
        const categoryData = AUDIO_CONFIG.categories[category];

        if (!categoryData || !categoryData.files || categoryData.files.length === 0) {
            alert('该分类没有可用的音频文件');
            return;
        }

        // 随机选择一个音频文件
        const randomFile = categoryData.files[Math.floor(Math.random() * categoryData.files.length)];
        const trackId = `mixer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        try {
            await this.audioMixer.addTrack(trackId, category, randomFile, 0.5);
            await this.audioMixer.playTrack(trackId);

            // 关闭对话框
            const dialog = document.querySelector('.mixer-dialog-overlay');
            if (dialog) {
                dialog.remove();
            }

            this.showNotification(`✅ 已添加: ${this.getDisplayName(randomFile)}`);
        } catch (error) {
            alert(`添加音轨失败: ${error.message}`);
        }
    }

    /**
     * 加载预设
     */
    async loadPreset(presetName) {
        try {
            await this.audioMixer.loadPreset(presetName);

            // 获取预设的分类
            const preset = this.audioMixer.presets[presetName];

            if (!preset || preset.length === 0) {
                return;
            }

            // 为每个分类添加一个随机音轨
            for (const category of preset) {
                const categoryData = AUDIO_CONFIG.categories[category];
                if (!categoryData || !categoryData.files) {
                    continue;
                }

                const randomFile = categoryData.files[Math.floor(Math.random() * categoryData.files.length)];
                const trackId = `mixer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                await this.audioMixer.addTrack(trackId, category, randomFile, 0.6);
            }

            // 播放所有音轨
            await this.audioMixer.playAll();

            this.showNotification(`🎵 已加载预设: ${presetName}`);
        } catch (error) {
            console.error('加载预设失败:', error);
            alert(`加载预设失败: ${error.message}`);
        }
    }

    /**
     * 切换音轨播放状态
     */
    async toggleTrack(trackId) {
        const track = this.audioMixer.tracks.get(trackId);
        if (!track) {
            return;
        }

        if (track.isPlaying) {
            this.audioMixer.pauseTrack(trackId);
        } else {
            await this.audioMixer.playTrack(trackId);
        }
    }

    /**
     * 设置音轨音量
     */
    setTrackVolume(trackId, value) {
        const volume = value / 100;
        this.audioMixer.setTrackVolume(trackId, volume);

        // 更新显示
        const track = document.querySelector(`[data-track-id="${trackId}"]`);
        if (track) {
            const volumeValue = track.querySelector('.track-volume-value');
            if (volumeValue) {
                volumeValue.textContent = `${Math.round(value)}%`;
            }
        }
    }

    /**
     * 设置主音量
     */
    setMasterVolume(value) {
        const volume = value / 100;
        this.audioMixer.setMasterVolume(volume);

        const volumeValue = document.getElementById('masterVolumeValue');
        if (volumeValue) {
            volumeValue.textContent = `${Math.round(value)}%`;
        }
    }

    /**
     * 移除音轨
     */
    removeTrack(trackId) {
        if (confirm('确定要移除这个音轨吗？')) {
            this.audioMixer.removeTrack(trackId);
        }
    }

    /**
     * 播放全部
     */
    async playAll() {
        try {
            await this.audioMixer.playAll();
            this.showNotification('▶️ 播放全部音轨');
        } catch (error) {
            alert(`播放失败: ${error.message}`);
        }
    }

    /**
     * 暂停全部
     */
    pauseAll() {
        this.audioMixer.pauseAll();
        this.showNotification('⏸️ 已暂停全部音轨');
    }

    /**
     * 清空所有音轨
     */
    clearAll() {
        if (confirm('确定要清空所有音轨吗？')) {
            this.audioMixer.stopAll();
            this.showNotification('🗑️ 已清空所有音轨');
        }
    }

    /**
     * 显示通知
     */
    showNotification(message) {
        // 复用触摸手势的反馈系统
        if (window.touchGestures && typeof window.touchGestures.showFeedback === 'function') {
            window.touchGestures.showFeedback(message);
        } else {
            // 简单的alert作为后备
            console.log(message);
        }
    }

    /**
     * 获取显示名称
     */
    getDisplayName(fileName) {
        return fileName.replace(/\.(mp3|wav|ogg|m4a|wma|flac|aac)$/i, '');
    }
}

// 创建全局实例
if (typeof window !== 'undefined') {
    window.MixerUI = MixerUI;

    // 等待audioMixer加载后初始化
    if (window.audioMixer) {
        window.mixerUI = new MixerUI(window.audioMixer);
        console.log('✅ MixerUI 已创建');
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            if (window.audioMixer) {
                window.mixerUI = new MixerUI(window.audioMixer);
                console.log('✅ MixerUI 已创建');
            }
        });
    }
}
