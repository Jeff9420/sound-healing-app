/**
 * 最终修复 - 彻底解决所有问题
 * 1. 定时器中文乱码
 * 2. 双滚动条
 */

(function() {
    'use strict';

    // ==================== 修复定时器中文乱码 ====================

    // 创建定时器模态框的HTML模板
    function createSleepTimerModal() {
        const modal = document.createElement('div');
        modal.id = 'sleepTimerModal';
        modal.className = 'sleep-timer-modal';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10001;
            background: linear-gradient(135deg, rgba(15, 12, 30, 0.98) 0%, rgba(22, 18, 42, 0.95) 100%);
            padding: 30px;
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(40px) saturate(180%);
            box-shadow: 0 24px 48px rgba(0, 0, 0, 0.9);
            color: #fff;
            min-width: 300px;
            display: none;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        `;

        // 获取当前语言
        const lang = window.i18n ? window.i18n.currentLanguage : 'en-US';
        const isZh = lang.includes('zh');

        // 根据语言设置内容
        if (isZh) {
            modal.innerHTML = `
                <h3 style="margin: 0 0 20px 0; font-size: 18px; text-align: center;">睡眠定时器</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                    <button onclick="applySleepTimer(15)" data-timer="15" style="padding: 12px; background: rgba(255,255,255,0.1); border: none; color: #fff; border-radius: 8px; cursor: pointer; font-size: 14px;">15分钟</button>
                    <button onclick="applySleepTimer(30)" data-timer="30" style="padding: 12px; background: rgba(255,255,255,0.1); border: none; color: #fff; border-radius: 8px; cursor: pointer; font-size: 14px;">30分钟</button>
                    <button onclick="applySleepTimer(45)" data-timer="45" style="padding: 12px; background: rgba(255,255,255,0.1); border: none; color: #fff; border-radius: 8px; cursor: pointer; font-size: 14px;">45分钟</button>
                    <button onclick="applySleepTimer(60)" data-timer="60" style="padding: 12px; background: rgba(255,255,255,0.1); border: none; color: #fff; border-radius: 8px; cursor: pointer; font-size: 14px;">60分钟</button>
                    <button onclick="applySleepTimer(0)" data-timer="0" style="padding: 12px; background: rgba(255,100,100,0.2); border: 1px solid rgba(255,100,100,0.3); color: #fff; border-radius: 8px; cursor: pointer; font-size: 14px; grid-column: 1 / -1;">关闭定时器</button>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; font-size: 14px; opacity: 0.8;">自定义时间（分钟）</label>
                    <input type="number" id="customTimerMinutes" min="1" max="180" value="30" style="width: 100%; padding: 8px 12px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 8px; font-size: 14px;">
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="applyCustomTimer()" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; color: #fff; border-radius: 8px; cursor: pointer; font-size: 14px;">设置</button>
                    <button onclick="closeSleepTimerModal()" style="flex: 1; padding: 12px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: #fff; border-radius: 8px; cursor: pointer; font-size: 14px;">取消</button>
                </div>
            `;
        } else {
            modal.innerHTML = `
                <h3 style="margin: 0 0 20px 0; font-size: 18px; text-align: center;">Sleep Timer</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                    <button onclick="applySleepTimer(15)" data-timer="15" style="padding: 12px; background: rgba(255,255,255,0.1); border: none; color: #fff; border-radius: 8px; cursor: pointer; font-size: 14px;">15 min</button>
                    <button onclick="applySleepTimer(30)" data-timer="30" style="padding: 12px; background: rgba(255,255,255,0.1); border: none; color: #fff; border-radius: 8px; cursor: pointer; font-size: 14px;">30 min</button>
                    <button onclick="applySleepTimer(45)" data-timer="45" style="padding: 12px; background: rgba(255,255,255,0.1); border: none; color: #fff; border-radius: 8px; cursor: pointer; font-size: 14px;">45 min</button>
                    <button onclick="applySleepTimer(60)" data-timer="60" style="padding: 12px; background: rgba(255,255,255,0.1); border: none; color: #fff; border-radius: 8px; cursor: pointer; font-size: 14px;">60 min</button>
                    <button onclick="applySleepTimer(0)" data-timer="0" style="padding: 12px; background: rgba(255,100,100,0.2); border: 1px solid rgba(255,100,100,0.3); color: #fff; border-radius: 8px; cursor: pointer; font-size: 14px; grid-column: 1 / -1;">Turn Off</button>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; font-size: 14px; opacity: 0.8;">Custom time (minutes)</label>
                    <input type="number" id="customTimerMinutes" min="1" max="180" value="30" style="width: 100%; padding: 8px 12px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 8px; font-size: 14px;">
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="applyCustomTimer()" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; color: #fff; border-radius: 8px; cursor: pointer; font-size: 14px;">Set</button>
                    <button onclick="closeSleepTimerModal()" style="flex: 1; padding: 12px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: #fff; border-radius: 8px; cursor: pointer; font-size: 14px;">Cancel</button>
                </div>
            `;
        }

        document.body.appendChild(modal);
        return modal;
    }

    // 应用定时器
    window.applySleepTimer = function(minutes) {
        closeSleepTimerModal();
        if (window.setSleepTimer) {
            window.setSleepTimer(minutes);
        }
    };

    // 应用自定义定时器
    window.applyCustomTimer = function() {
        const input = document.getElementById('customTimerMinutes');
        if (input && input.value) {
            const minutes = parseInt(input.value);
            if (minutes > 0 && minutes <= 180) {
                closeSleepTimerModal();
                if (window.setSleepTimer) {
                    window.setSleepTimer(minutes);
                }
            }
        }
    };

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

    // ==================== 彻底修复滚动条问题 ====================

    function fixScrollbar() {
        // 强制CSS规则
        const scrollbarCSS = `
            /* 强制只允许一个滚动条 */
            html {
                overflow-x: hidden !important;
                overflow-y: hidden !important;
                height: 100%;
            }

            body {
                overflow-x: hidden !important;
                overflow-y: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                max-width: 100vw !important;
                position: static !important;
                min-height: 100%;
            }

            /* 移除所有可能的overflow设置 */
            * {
                box-sizing: border-box !important;
            }

            /* 修复模态框 */
            .player-modal {
                overflow: hidden !important;
            }

            /* 修复固定定位元素 */
            [style*="position: fixed"] {
                overflow: visible !important;
            }

            /* 防止body被修改 */
            body.modal-open {
                overflow: hidden !important;
            }
        `;

        // 创建或更新样式标签
        let styleEl = document.getElementById('ultimate-scrollbar-fix');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'ultimate-scrollbar-fix';
            styleEl.textContent = scrollbarCSS;
            document.head.appendChild(styleEl);
        }

        // 监听并修复滚动问题
        setInterval(() => {
            // 检查并修复body的overflow
            const body = document.body;
            const computed = window.getComputedStyle(body);

            if (computed.overflowX !== 'hidden' || computed.overflow === 'hidden') {
                body.style.overflowX = 'hidden';
                body.style.overflowY = 'auto';
            }

            // 确保html也是正确的
            const html = document.documentElement;
            const htmlComputed = window.getComputedStyle(html);

            if (htmlComputed.overflowX !== 'hidden') {
                html.style.overflowX = 'hidden';
            }
        }, 1000);
    }

    // ==================== 强化定时器停止功能 ====================

    function enhanceSleepTimer() {
        const originalSetSleepTimer = window.setSleepTimer;

        window.setSleepTimer = function(minutes) {
            console.log('Setting enhanced sleep timer for', minutes, 'minutes');

            // 清除所有现有定时器
            if (window.sleepTimer) {
                clearTimeout(window.sleepTimer);
                window.sleepTimer = null;
            }

            if (minutes > 0) {
                // 设置定时器
                window.sleepTimer = setTimeout(() => {
                    console.log(`⏰ ${minutes} minute timer triggered - stopping all audio`);

                    // 强制停止所有音频
                    stopAllAudio();

                    // 更新UI
                    updatePlayerUI();

                    // 显示通知
                    showTimerNotification(minutes);

                    // 清除定时器
                    window.sleepTimer = null;

                }, minutes * 60 * 1000);

                // 更新按钮状态
                const btn = document.getElementById('sleepTimerBtn');
                if (btn) {
                    btn.classList.add('active');
                }

                // 显示设置通知
                const lang = window.i18n ? window.i18n.currentLanguage : 'en-US';
                const isZh = lang.includes('zh');
                if (window.showNotification) {
                    window.showNotification(
                        isZh ? `定时器已设置: ${minutes}分钟` : `Timer set: ${minutes} minutes`,
                        'success'
                    );
                }
            } else {
                // 关闭定时器
                const btn = document.getElementById('sleepTimerBtn');
                if (btn) {
                    btn.classList.remove('active');
                }
            }
        };
    }

    // 停止所有音频
    function stopAllAudio() {
        let stoppedCount = 0;

        // 方法1: AudioManager
        if (window.audioManager && window.audioManager.audio) {
            try {
                window.audioManager.audio.pause();
                window.audioManager.audio.currentTime = 0;
                stoppedCount++;
                console.log('✅ Stopped via AudioManager');
            } catch (e) {
                console.error('Error stopping AudioManager:', e);
            }
        }

        // 方法2: 全局audio
        if (window.audio) {
            try {
                window.audio.pause();
                window.audio.currentTime = 0;
                stoppedCount++;
                console.log('✅ Stopped via window.audio');
            } catch (e) {
                console.error('Error stopping window.audio:', e);
            }
        }

        // 方法3: 所有audio元素
        const allAudios = document.querySelectorAll('audio');
        allAudios.forEach((audio, index) => {
            try {
                audio.pause();
                audio.currentTime = 0;
                stoppedCount++;
            } catch (e) {
                console.error(`Error stopping audio ${index}:`, e);
            }
        });

        console.log(`🎯 Total audio sources stopped: ${stoppedCount}`);
        return stoppedCount;
    }

    // 更新播放器UI
    function updatePlayerUI() {
        // 更新全局状态
        window.isPlaying = false;
        window.isPaused = true;

        // 更新所有播放按钮
        const buttons = document.querySelectorAll('#playPauseBtn, .play-pause-btn, .control-btn');
        buttons.forEach(btn => {
            // 检查是否是播放按钮
            const isPlayBtn = btn.id === 'playPauseBtn' ||
                           btn.textContent === '⏸️' ||
                           btn.querySelector('.pause-icon');

            if (isPlayBtn) {
                const playIcon = btn.querySelector('.play-icon');
                const pauseIcon = btn.querySelector('.pause-icon');

                if (playIcon) {
                    playIcon.style.display = 'block';
                    playIcon.textContent = '▶️';
                }
                if (pauseIcon) {
                    pauseIcon.style.display = 'none';
                }
                if (!playIcon && !pauseIcon) {
                    btn.textContent = '▶️';
                }
            }
        });

        // 移除定时器激活状态
        const timerBtn = document.getElementById('sleepTimerBtn');
        if (timerBtn) {
            timerBtn.classList.remove('active');
            timerBtn.classList.remove('active');
        }
    }

    // 显示定时器通知
    function showTimerNotification(minutes) {
        const lang = window.i18n ? window.i18n.currentLanguage : 'en-US';
        const isZh = lang.includes('zh');

        if (window.showNotification) {
            window.showNotification(
                isZh ? '定时器已停止播放' : 'Timer stopped',
                'success'
            );
        }
    }

    // ==================== 初始化 ====================

    function init() {
        // 确保DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(initFixes, 100);
            });
        } else {
            setTimeout(initFixes, 100);
        }
    }

    function initFixes() {
        // 创建定时器模态框
        createSleepTimerModal();

        // 修复滚动条
        fixScrollbar();

        // 增强定时器
        enhanceSleepTimer();

        // 重写定时器按钮点击事件
        const sleepTimerBtn = document.getElementById('sleepTimerBtn');
        if (sleepTimerBtn) {
            sleepTimerBtn.removeAttribute('onclick');
            sleepTimerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const modal = document.getElementById('sleepTimerModal');

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
                        display: none;
                    `;
                    overlay.addEventListener('click', closeSleepTimerModal);
                    document.body.appendChild(overlay);
                }

                // 显示/隐藏模态框
                if (modal && overlay) {
                    const isVisible = modal.style.display === 'block';
                    modal.style.display = isVisible ? 'none' : 'block';
                    overlay.style.display = isVisible ? 'none' : 'block';
                }
            });
        }

        console.log('Ultimate player fixes initialized');
    }

    // 启动
    init();

})();
