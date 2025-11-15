/**
 * 播放器控件增强
 * - 音量滑块样式更新
 * - 定时器功能修复
 */

(function() {
    'use strict';

    // 初始化音量滑块样式
    function initVolumeSlider() {
        const volumeSlider = document.getElementById('volumeSlider');
        if (!volumeSlider) return;

        // 初始化音量显示
        updateVolumeDisplay(volumeSlider.value);

        // 监听音量变化
        volumeSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            updateVolumeDisplay(value);
            // 确保实际的音量函数被调用
            if (typeof changeVolume === 'function') {
                changeVolume(value);
            }
        });

        // 添加点击拖拽功能
        volumeSlider.addEventListener('click', (e) => {
            const rect = volumeSlider.getBoundingClientRect();
            const percent = ((e.clientX - rect.left) / rect.width) * 100;
            const value = Math.round(percent);
            volumeSlider.value = value;
            updateVolumeDisplay(value);
            if (typeof changeVolume === 'function') {
                changeVolume(value);
            }
        });
    }

    // 更新音量滑块显示
    function updateVolumeDisplay(value) {
        const volumeSlider = document.getElementById('volumeSlider');
        if (!volumeSlider) return;

        // 使用CSS变量更新背景渐变
        volumeSlider.style.setProperty('--volume-percent', value + '%');
    }

    // 初始化定时器功能
    function initSleepTimer() {
        const sleepTimerBtn = document.getElementById('sleepTimerBtn');
        if (!sleepTimerBtn) return;

        // 确保点击事件正常工作
        sleepTimerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            console.log('Sleep timer button clicked');

            // 检查是否有定时器模态框
            const modal = document.getElementById('sleepTimerModal');
            if (modal) {
                // 切换模态框显示
                if (modal.style.display === 'none' || !modal.style.display) {
                    modal.style.display = 'block';
                    modal.style.position = 'fixed';
                    modal.style.top = '50%';
                    modal.style.left = '50%';
                    modal.style.transform = 'translate(-50%, -50%)';
                    modal.style.zIndex = '10001';
                    modal.style.background = 'rgba(15, 12, 30, 0.98)';
                    modal.style.padding = '30px';
                    modal.style.borderRadius = '16px';
                    modal.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    modal.style.backdropFilter = 'blur(20px)';

                    // 添加定时器选项
                    if (!modal.querySelector('.timer-options')) {
                        modal.innerHTML = `
                            <h3 style="margin: 0 0 20px 0; color: #fff;">设置睡眠定时器</h3>
                            <div class="timer-options" style="display: flex; flex-direction: column; gap: 10px;">
                                <button onclick="setSleepTimer(15); closeSleepTimerModal();" style="padding: 12px; background: rgba(255,255,255,0.1); border: none; color: #fff; border-radius: 8px; cursor: pointer;">15分钟</button>
                                <button onclick="setSleepTimer(30); closeSleepTimerModal();" style="padding: 12px; background: rgba(255,255,255,0.1); border: none; color: #fff; border-radius: 8px; cursor: pointer;">30分钟</button>
                                <button onclick="setSleepTimer(45); closeSleepTimerModal();" style="padding: 12px; background: rgba(255,255,255,0.1); border: none; color: #fff; border-radius: 8px; cursor: pointer;">45分钟</button>
                                <button onclick="setSleepTimer(60); closeSleepTimerModal();" style="padding: 12px; background: rgba(255,255,255,0.1); border: none; color: #fff; border-radius: 8px; cursor: pointer;">60分钟</button>
                                <button onclick="setSleepTimer(0); closeSleepTimerModal();" style="padding: 12px; background: rgba(255,255,255,0.1); border: none; color: #fff; border-radius: 8px; cursor: pointer;">关闭定时器</button>
                                <button onclick="closeSleepTimerModal();" style="margin-top: 10px; padding: 12px; background: transparent; border: 1px solid rgba(255,255,255,0.3); color: #fff; border-radius: 8px; cursor: pointer;">取消</button>
                            </div>
                        `;
                    }
                } else {
                    modal.style.display = 'none';
                }
            } else {
                // 如果没有模态框，直接设置30分钟定时器
                if (typeof setSleepTimer === 'function') {
                    setSleepTimer(30);
                }
            }
        });
    }

    // 关闭定时器模态框
    window.closeSleepTimerModal = function() {
        const modal = document.getElementById('sleepTimerModal');
        if (modal) {
            modal.style.display = 'none';
        }
    };

    // 监听音频管理器的音量变化
    function setupAudioManagerListener() {
        // 定期检查并同步音量
        setInterval(() => {
            if (window.audioManager && window.audioManager.audio) {
                const volumeSlider = document.getElementById('volumeSlider');
                if (volumeSlider && volumeSlider.value != Math.round(window.audioManager.audio.volume * 100)) {
                    volumeSlider.value = Math.round(window.audioManager.audio.volume * 100);
                    updateVolumeDisplay(volumeSlider.value);
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