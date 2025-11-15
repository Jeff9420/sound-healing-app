/**
 * 播放器控件增强
 * - 音量滑块样式更新（与进度条完全一致）
 * - 定时器功能修复
 */

(function() {
    'use strict';

    // 初始化音量滑块
    function initVolumeSlider() {
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeFill = document.getElementById('volumeFill');
        const volumeControl = document.getElementById('volumeControl');

        if (!volumeSlider || !volumeFill || !volumeControl) return;

        // 初始化音量显示
        updateVolumeDisplay(volumeSlider.value);

        // 监听音量变化
        volumeSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            updateVolumeDisplay(value);
            // 调用实际的音量函数
            if (typeof changeVolume === 'function') {
                changeVolume(value);
            } else if (window.audioManager && window.audioManager.audio) {
                window.audioManager.audio.volume = value / 100;
            }
        });

        // 点击音量条直接跳转到位置
        volumeControl.addEventListener('click', (e) => {
            const rect = volumeControl.getBoundingClientRect();
            const percent = ((e.clientX - rect.left) / rect.width) * 100;
            const value = Math.max(0, Math.min(100, Math.round(percent)));
            volumeSlider.value = value;
            updateVolumeDisplay(value);
            if (typeof changeVolume === 'function') {
                changeVolume(value);
            } else if (window.audioManager && window.audioManager.audio) {
                window.audioManager.audio.volume = value / 100;
            }
        });
    }

    // 更新音量滑块显示
    function updateVolumeDisplay(value) {
        const volumeFill = document.getElementById('volumeFill');
        if (volumeFill) {
            volumeFill.style.width = value + '%';
        }
    }

    // 初始化定时器功能
    function initSleepTimer() {
        const sleepTimerBtn = document.getElementById('sleepTimerBtn');
        if (!sleepTimerBtn) return;

        // 移除原有的onclick，使用addEventListener
        sleepTimerBtn.removeAttribute('onclick');

        // 添加点击事件
        sleepTimerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Sleep timer button clicked');

            // 检查是否已有定时器模态框
            let modal = document.getElementById('sleepTimerModal');

            // 如果没有模态框，创建一个
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'sleepTimerModal';
                modal.className = 'sleep-timer-modal';
                modal.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 10001;
                    background: linear-gradient(135deg,
                        rgba(15, 12, 30, 0.98) 0%,
                        rgba(22, 18, 42, 0.95) 100%);
                    padding: 30px;
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(40px) saturate(180%);
                    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.9);
                    color: #fff;
                    min-width: 280px;
                    display: none;
                `;

                modal.innerHTML = `
                    <h3 style="margin: 0 0 20px 0; font-size: 18px; text-align: center;">睡眠定时器</h3>
                    <div class="timer-options" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                        <button onclick="setSleepTimer(15); closeSleepTimerModal();" style="padding: 12px; background: rgba(255,255,255,0.1); border: none; color: #fff; border-radius: 8px; cursor: pointer; font-size: 14px;">15分钟</button>
                        <button onclick="setSleepTimer(30); closeSleepTimerModal();" style="padding: 12px; background: rgba(255,255,255,0.1); border: none; color: #fff; border-radius: 8px; cursor: pointer; font-size: 14px;">30分钟</button>
                        <button onclick="setSleepTimer(45); closeSleepTimerModal();" style="padding: 12px; background: rgba(255,255,255,0.1); border: none; color: #fff; border-radius: 8px; cursor: pointer; font-size: 14px;">45分钟</button>
                        <button onclick="setSleepTimer(60); closeSleepTimerModal();" style="padding: 12px; background: rgba(255,255,255,0.1); border: none; color: #fff; border-radius: 8px; cursor: pointer; font-size: 14px;">60分钟</button>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 8px; font-size: 14px; opacity: 0.8;">自定义时间（分钟）</label>
                        <input type="number" id="customTimerMinutes" min="1" max="180" value="30" style="width: 100%; padding: 8px 12px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 8px; font-size: 14px;">
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="setCustomSleepTimer(); closeSleepTimerModal();" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; color: #fff; border-radius: 8px; cursor: pointer; font-size: 14px;">设置</button>
                        <button onclick="closeSleepTimerModal();" style="flex: 1; padding: 12px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: #fff; border-radius: 8px; cursor: pointer; font-size: 14px;">取消</button>
                    </div>
                `;

                document.body.appendChild(modal);
            }

            // 切换模态框显示
            if (modal.style.display === 'none' || !modal.style.display) {
                modal.style.display = 'block';

                // 创建背景遮罩
                let overlay = document.getElementById('sleepTimerOverlay');
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.id = 'sleepTimerOverlay';
                    overlay.style.cssText = `
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.5);
                        backdrop-filter: blur(4px);
                        z-index: 10000;
                    `;
                    overlay.addEventListener('click', closeSleepTimerModal);
                    document.body.appendChild(overlay);
                }
                overlay.style.display = 'block';
            } else {
                closeSleepTimerModal();
            }
        });
    }

    // 关闭定时器模态框
    window.closeSleepTimerModal = function() {
        const modal = document.getElementById('sleepTimerModal');
        const overlay = document.getElementById('sleepTimerOverlay');

        if (modal) {
            modal.style.display = 'none';
        }
        if (overlay) {
            overlay.style.display = 'none';
        }
    };

    // 设置自定义定时器
    window.setCustomSleepTimer = function() {
        const input = document.getElementById('customTimerMinutes');
        if (input && input.value) {
            const minutes = parseInt(input.value);
            if (minutes > 0 && minutes <= 180) {
                if (typeof setSleepTimer === 'function') {
                    setSleepTimer(minutes);
                }
            }
        }
    };

    // 监听音频管理器的音量变化
    function setupAudioManagerListener() {
        setInterval(() => {
            if (window.audioManager && window.audioManager.audio) {
                const volumeSlider = document.getElementById('volumeSlider');
                if (volumeSlider) {
                    const currentVolume = Math.round(window.audioManager.audio.volume * 100);
                    if (volumeSlider.value != currentVolume) {
                        volumeSlider.value = currentVolume;
                        updateVolumeDisplay(currentVolume);
                    }
                }
            }
        }, 1000);
    }

    // 初始化所有功能
    function init() {
        // 等待DOM加载
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    initVolumeSlider();
                    initSleepTimer();
                    setupAudioManagerListener();
                }, 500);
            });
        } else {
            setTimeout(() => {
                initVolumeSlider();
                initSleepTimer();
                setupAudioManagerListener();
            }, 500);
        }
    }

    init();

    // 导出到全局
    window.updateVolumeDisplay = updateVolumeDisplay;

})();