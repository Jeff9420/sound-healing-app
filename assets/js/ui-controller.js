// 防止重复加载和声明
if (typeof window !== 'undefined' && typeof window.UIController === 'undefined') {

class UIController {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.elements = {};
        
        try {
            this.bindElements();
            this.setupEventListeners();
            this.syncInitialVolumes();
        } catch (error) {
            console.warn('UIController 初始化遇到问题，但将继续运行:', error);
            // 继续运行，不抛出错误
        }
    }

    bindElements() {
        this.elements = {
            globalPlayBtn: document.getElementById('globalPlayBtn'),
            globalVolumeSlider: document.getElementById('globalVolume'),
            globalVolumeValue: document.querySelector('.global-volume-control .volume-value'),
            connectionStatus: document.getElementById('connectionStatus'),
            playingSounds: document.getElementById('playingSounds'),
            soundCards: document.querySelectorAll('.sound-card'),
            playButtons: document.querySelectorAll('.play-btn'),
            volumeSliders: document.querySelectorAll('.volume-slider'),
            volumeDisplays: document.querySelectorAll('.volume-display'),
            presetButtons: document.querySelectorAll('.preset-btn')
        };
    }

    setupEventListeners() {
        this.setupGlobalControls();
        this.setupSoundControls();
        this.setupPresetControls();
        this.setupAudioManagerEvents();
        this.setupKeyboardShortcuts();
    }

    setupGlobalControls() {
        this.elements.globalPlayBtn.addEventListener('click', () => {
            if (this.audioManager.isAnyPlaying()) {
                this.pauseAll();
            } else {
                this.showAutoplayPrompt();
            }
        });

        this.elements.globalVolumeSlider.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            this.audioManager.setGlobalVolume(volume);
            this.updateGlobalVolumeDisplay(volume);
        });
    }

    setupSoundControls() {
        this.elements.playButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const soundId = e.target.closest('.play-btn').dataset.sound;
                try {
                    await this.toggleSound(soundId);
                } catch (error) {
                    this.showError(`播放失败: ${error.message}`);
                }
            });
        });

        this.elements.volumeSliders.forEach(slider => {
            slider.addEventListener('input', (e) => {
                const soundId = e.target.dataset.sound;
                const volume = parseFloat(e.target.value);
                this.audioManager.setSoundVolume(soundId, volume);
                this.updateVolumeDisplay(soundId, volume);
            });
        });
    }

    setupPresetControls() {
        this.elements.presetButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const presetId = e.currentTarget.dataset.preset;
                try {
                    await this.audioManager.applyPreset(presetId);
                    this.updatePresetButtons(presetId);
                } catch (error) {
                    this.showError(`预设应用失败: ${error.message}`);
                }
            });
        });
    }

    setupAudioManagerEvents() {
        this.audioManager.eventBus.addEventListener('soundPlay', (e) => {
            this.updateSoundCardState(e.detail, true);
            this.updatePlayingSoundsDisplay();
            this.updateGlobalPlayButton();
        });

        this.audioManager.eventBus.addEventListener('soundPause', (e) => {
            this.updateSoundCardState(e.detail, false);
            this.updatePlayingSoundsDisplay();
            this.updateGlobalPlayButton();
        });

        this.audioManager.eventBus.addEventListener('loadingStart', (e) => {
            this.showLoadingIndicator(e.detail, true);
        });

        this.audioManager.eventBus.addEventListener('loadingEnd', (e) => {
            this.showLoadingIndicator(e.detail, false);
        });

        this.audioManager.eventBus.addEventListener('initialized', () => {
            this.updateConnectionStatus('已连接');
            this.restoreUISettings();
        });

        this.audioManager.eventBus.addEventListener('error', (e) => {
            this.showError(`系统错误: ${e.detail.message}`);
            this.updateConnectionStatus('连接异常');
        });

        this.audioManager.eventBus.addEventListener('settingsLoaded', () => {
            this.restoreUISettings();
        });

        this.audioManager.eventBus.addEventListener('presetApplied', (e) => {
            this.updatePresetButtons(e.detail.presetId);
            this.restoreUISettings();
        });

        this.audioManager.eventBus.addEventListener('volumeChange', () => {
            this.updateActivePreset();
        });
    }

    setupKeyboardShortcuts() {
        // 用于AI指令检测
        this.keySequence = '';
        this.sequenceTimeout = null;
        
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return;
            
            // AI指令检测
            this.handleAICommand(e);
            
            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    if (this.audioManager.isAnyPlaying()) {
                        this.pauseAll();
                    } else {
                        this.showAutoplayPrompt();
                    }
                    break;
                case 'Digit1':
                    e.preventDefault();
                    this.toggleSound('rain');
                    break;
                case 'Digit2':
                    e.preventDefault();
                    this.toggleSound('ocean');
                    break;
                case 'Digit3':
                    e.preventDefault();
                    this.toggleSound('wind');
                    break;
                case 'KeyF':
                    e.preventDefault();
                    this.toggleSound('fire');
                    break;
                case 'KeyS':
                    e.preventDefault();
                    this.toggleSound('stream');
                    break;
                case 'KeyB':
                    e.preventDefault();
                    this.toggleSound('birds');
                    break;
            }
        });
    }

    handleAICommand(e) {
        // 清除之前的超时
        if (this.sequenceTimeout) {
            clearTimeout(this.sequenceTimeout);
        }

        // 只处理字母键
        if (e.code.startsWith('Key')) {
            const key = e.key.toLowerCase();
            this.keySequence += key;

            // 检查是否输入了"ai"
            if (this.keySequence.endsWith('ai')) {
                e.preventDefault();
                this.handleAIAutoplay();
                this.keySequence = '';
                return;
            }

            // 限制序列长度，避免内存泄漏
            if (this.keySequence.length > 10) {
                this.keySequence = this.keySequence.slice(-10);
            }
        } else {
            // 非字母键重置序列
            this.keySequence = '';
        }

        // 设置超时重置序列（2秒无操作后重置）
        this.sequenceTimeout = setTimeout(() => {
            this.keySequence = '';
        }, 2000);
    }

    async handleAIAutoplay() {
        try {
            console.log('AI指令触发：自动授权播放');
            
            // 显示AI指令激活的视觉反馈
            this.showMessage('AI指令激活 - 自动授权播放', 'info');
            
            // 创建一个静默音频来获取用户交互权限
            const silentAudio = new Audio();
            silentAudio.volume = 0;
            
            // 使用数据URL创建极短的静默音频
            silentAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgeUEAfAABQHwAAUEAfAABQHwAAUEAfAABQHwAAUEAfAABQHwAAUEAfAABQHwAA';
            
            // 尝试播放静默音频来获得用户交互权限
            try {
                await silentAudio.play();
                silentAudio.pause();
                
                // 如果成功播放，说明已获得用户交互权限
                console.log('AI指令：已获得音频播放权限');
                this.showMessage('已获得播放权限', 'success');
                
                // 现在可以直接播放音频而无需用户点击
                await this.startDefaultPreset();
                
            } catch (error) {
                console.warn('AI指令：无法获得播放权限，显示授权提示', error);
                this.showAutoplayPrompt('AI指令激活 - 请点击允许播放');
            }
            
        } catch (error) {
            console.error('AI指令处理失败:', error);
            this.showError('AI指令处理失败');
        }
    }

    async startDefaultPreset() {
        try {
            // 启动默认的放松预设
            await this.audioManager.applyPreset('meditation');
            this.showMessage('已启动冥想放松模式', 'success');
        } catch (error) {
            console.warn('预设启动失败，尝试单独播放雨声:', error);
            try {
                await this.audioManager.setSoundVolume('rain', 0.5);
                await this.audioManager.playSound('rain');
                this.showMessage('已启动雨声播放', 'success');
            } catch (playError) {
                console.error('播放失败:', playError);
                this.showError('播放失败，请手动点击播放按钮');
            }
        }
    }

    async toggleSound(soundId) {
        try {
            await this.audioManager.toggleSound(soundId);
        } catch (error) {
            if (error.message.includes('自动播放')) {
                this.showAutoplayPrompt();
            } else {
                throw error;
            }
        }
    }

    pauseAll() {
        this.audioManager.pauseAll();
    }

    showAutoplayPrompt(customMessage) {
        const playingSounds = this.audioManager.getPlayingSounds();
        if (playingSounds.length > 0) {
            this.pauseAll();
            return;
        }

        const message = customMessage || '请点击任意声音卡片开始播放\n（浏览器需要用户交互才能播放音频）';
        this.showMessage(message, 'info');
    }

    updateSoundCardState(soundId, isPlaying) {
        const card = document.querySelector(`[data-sound="${soundId}"]`);
        const playBtn = card.querySelector('.play-btn');
        const playIcon = playBtn.querySelector('.play-icon');

        if (isPlaying) {
            card.classList.add('playing');
            playIcon.textContent = '⏸️';
            playBtn.setAttribute('aria-label', `暂停${this.audioManager.soundConfigs[soundId].name}`);
        } else {
            card.classList.remove('playing');
            playIcon.textContent = '▶️';
            playBtn.setAttribute('aria-label', `播放${this.audioManager.soundConfigs[soundId].name}`);
        }
    }

    updateVolumeDisplay(soundId, volume) {
        const card = document.querySelector(`[data-sound="${soundId}"]`);
        const display = card.querySelector('.volume-display');
        display.textContent = `${Math.round(volume * 100)}%`;
        
        this.audioManager.saveUserSettings();
    }

    updateGlobalVolumeDisplay(volume) {
        this.elements.globalVolumeValue.textContent = `${Math.round(volume * 100)}%`;
        this.audioManager.saveUserSettings();
    }

    updatePlayingSoundsDisplay() {
        const playingSounds = this.audioManager.getPlayingSounds();
        const soundNames = playingSounds.map(id => 
            this.audioManager.soundConfigs[id].name
        ).join(', ');
        
        this.elements.playingSounds.textContent = soundNames || '无';
    }

    updateGlobalPlayButton() {
        const isAnyPlaying = this.audioManager.isAnyPlaying();
        const btnText = this.elements.globalPlayBtn.querySelector('.btn-text');
        
        if (isAnyPlaying) {
            btnText.textContent = '暂停所有';
            this.elements.globalPlayBtn.setAttribute('aria-label', '暂停所有声音');
        } else {
            btnText.textContent = '播放所有';
            this.elements.globalPlayBtn.setAttribute('aria-label', '播放所有声音');
        }
    }

    showLoadingIndicator(soundId, show) {
        const card = document.querySelector(`[data-sound="${soundId}"]`);
        const indicator = card.querySelector('.loading-indicator');
        indicator.style.display = show ? 'block' : 'none';
    }

    updateConnectionStatus(status) {
        this.elements.connectionStatus.textContent = status;
        this.elements.connectionStatus.className = status === '已连接' ? 'connected' : 'error';
    }

    restoreUISettings() {
        this.elements.globalVolumeSlider.value = this.audioManager.globalVolume;
        this.updateGlobalVolumeDisplay(this.audioManager.globalVolume);

        for (const [soundId, instance] of this.audioManager.audioInstances) {
            const slider = document.querySelector(`[data-sound="${soundId}"] .volume-slider`);
            slider.value = instance.volume;
            this.updateVolumeDisplay(soundId, instance.volume);
        }
    }

    showMessage(message, type = 'info') {
        const existingMessage = document.querySelector('.message-overlay');
        if (existingMessage) {
            existingMessage.remove();
        }

        const overlay = document.createElement('div');
        overlay.className = `message-overlay ${type}`;
        // Use textContent for security (prevent XSS)
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        const messageP = document.createElement('p');
        messageP.textContent = message;
        contentDiv.appendChild(messageP);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'message-close';
        closeBtn.textContent = '确定';
        contentDiv.appendChild(closeBtn);

        overlay.appendChild(contentDiv);

        document.body.appendChild(overlay);

        overlay.querySelector('.message-close').addEventListener('click', () => {
            overlay.remove();
        });

        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.remove();
            }
        }, 5000);
    }

    showError(message) {
        this.showMessage(message, 'error');
        console.error('UI错误:', message);
    }

    updatePresetButtons(activePresetId = null) {
        if (!activePresetId) {
            activePresetId = this.audioManager.getActivePreset();
        }

        this.elements.presetButtons.forEach(btn => {
            const presetId = btn.dataset.preset;
            if (presetId === activePresetId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    updateActivePreset() {
        setTimeout(() => {
            this.updatePresetButtons();
        }, 200);
    }

    handleVisibilityChange() {
        if (document.hidden) {
            console.log('页面隐藏，音频继续播放');
        } else {
            console.log('页面显示，恢复正常状态');
            this.updatePlayingSoundsDisplay();
            this.updateActivePreset();
        }
    }

    syncInitialVolumes() {
        // 同步UI控件的初始音量到音频管理器
        console.log('同步初始音量设置...');
        
        // 等待音频管理器初始化完成
        if (this.audioManager.isInitialized) {
            this.performVolumeSync();
        } else {
            // 如果还未初始化，监听初始化完成事件
            this.audioManager.eventBus.addEventListener('initialized', () => {
                this.performVolumeSync();
            }, { once: true });
        }
    }

    performVolumeSync() {
        this.elements.volumeSliders.forEach(slider => {
            const soundId = slider.dataset.sound;
            const volume = parseFloat(slider.value);
            
            if (soundId && volume > 0) {
                console.log(`设置 ${soundId} 初始音量为: ${volume}`);
                this.audioManager.setSoundVolume(soundId, volume);
                this.updateVolumeDisplay(soundId, volume);
            }
        });

        // 同步全局音量
        const globalVolume = parseFloat(this.elements.globalVolumeSlider.value);
        this.audioManager.setGlobalVolume(globalVolume);
        this.updateGlobalVolumeDisplay(globalVolume);
        
        console.log('✅ 初始音量同步完成');
    }
}

    // 将UIController类添加到window对象以便全局访问
    if (typeof window !== 'undefined') {
        window.UIController = UIController;
        console.log('✅ UIController类定义已加载');
    }

} // 结束 UIController 类定义检查