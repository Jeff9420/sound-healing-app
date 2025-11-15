/**
 * 播放器最终修复
 * 彻底解决定时器和滚动条问题
 */

(function() {
    'use strict';

    // ==================== 定时器修复 ====================

    // 全局定时器变量
    let globalSleepTimer = null;
    let timerEnd = null;

    // 重写setSleepTimer函数，确保能真正停止音频
    function initSleepTimerFix() {
        // 找到原有的sleepTimer变量
        const originalSetSleepTimer = window.setSleepTimer;

        window.setSleepTimer = function(minutes) {
            console.log('Setting sleep timer for', minutes, 'minutes');

            // 清除所有定时器
            if (globalSleepTimer) {
                clearTimeout(globalSleepTimer);
                globalSleepTimer = null;
            }

            // 清除原有定时器（如果存在）
            if (window.sleepTimer) {
                clearTimeout(window.sleepTimer);
                window.sleepTimer = null;
            }

            // 关闭模态框
            const modal = document.getElementById('sleepTimerModal');
            if (modal) {
                modal.style.display = 'none';
            }

            if (minutes > 0) {
                // 设置新的定时器
                timerEnd = Date.now() + minutes * 60 * 1000;

                const stopTime = minutes * 60 * 1000;
                console.log(`Sleep timer set for ${minutes} minutes (${stopTime}ms) at ${new Date().toLocaleTimeString()}`);
                console.log(`Audio will stop at ${new Date(Date.now() + stopTime).toLocaleTimeString()}`);

                globalSleepTimer = setTimeout(() => {
                    const stopTimeReached = new Date().toLocaleTimeString();
                    console.log(`⏰ Sleep timer triggered at ${stopTimeReached} - stopping audio after ${minutes} minutes`);
                    console.log(`Total timer duration: ${minutes} minutes (${stopTime}ms)`);

                    // 尝试所有可能的音频停止方式
                    try {
                        let stoppedCount = 0;

                        // 方式1: 通过audioManager
                        if (window.audioManager && window.audioManager.audio) {
                            window.audioManager.audio.pause();
                            window.audioManager.audio.currentTime = 0;
                            console.log('✅ Stopped via audioManager');
                            stoppedCount++;
                        }

                        // 方式2: 通过全局audio变量
                        if (window.audio) {
                            window.audio.pause();
                            window.audio.currentTime = 0;
                            console.log('✅ Stopped via window.audio');
                            stoppedCount++;
                        }

                        // 方式3: 通过所有audio元素
                        const allAudios = document.querySelectorAll('audio');
                        allAudios.forEach((audio, index) => {
                            audio.pause();
                            audio.currentTime = 0;
                            console.log(`✅ Stopped audio element ${index + 1}`);
                            stoppedCount++;
                        });

                        console.log(`🎯 Successfully stopped ${stoppedCount} audio source(s)`);
                    } catch (error) {
                        console.error('❌ Error stopping audio:', error);
                    }

                    // 更新播放状态
                    window.isPlaying = false;
                    window.isPaused = true;

                    // 更新所有播放按钮
                    const playButtons = document.querySelectorAll('#playPauseBtn, .play-pause-btn');
                    playButtons.forEach(btn => {
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
                    });

                    // 更新定时器按钮
                    const sleepTimerBtn = document.getElementById('sleepTimerBtn');
                    if (sleepTimerBtn) {
                        sleepTimerBtn.classList.remove('active');
                    }

                    // 显示通知
                    if (window.showNotification) {
                        window.showNotification('定时器已停止播放', 'Timer stopped');
                    }

                    // 触发自定义事件
                    window.dispatchEvent(new CustomEvent('sleepTimerTriggered', {
                        detail: { minutes }
                    }));

                }, minutes * 60 * 1000);

                // 更新定时器按钮状态
                const sleepTimerBtn = document.getElementById('sleepTimerBtn');
                if (sleepTimerBtn) {
                    sleepTimerBtn.classList.add('active');
                    sleepTimerBtn.setAttribute('title', `定时器: ${minutes}分钟`);
                }

                // 显示设置成功通知
                if (window.showNotification) {
                    window.showNotification(`定时器已设置: ${minutes}分钟`, `Timer set: ${minutes} minutes`);
                }

            } else {
                // 关闭定时器
                const sleepTimerBtn = document.getElementById('sleepTimerBtn');
                if (sleepTimerBtn) {
                    sleepTimerBtn.classList.remove('active');
                    sleepTimerBtn.removeAttribute('title');
                }

                if (window.showNotification) {
                    window.showNotification('定时器已关闭', 'Timer disabled');
                }
            }
        };
    }

    // ==================== 滚动条修复 ====================

    function fixScrollbar() {
        // 修复模态框打开时的滚动问题
        const originalShow = window.playerModalController ? window.playerModalController.show : null;
        const originalHide = window.playerModalController ? window.playerModalController.hide : null;

        if (window.playerModalController) {
            window.playerModalController.show = function() {
                // 保存滚动位置
                const scrollY = window.scrollY;

                // 防止背景滚动
                document.body.style.position = 'fixed';
                document.body.style.top = `-${scrollY}px`;
                document.body.style.width = '100%';
                document.body.style.overflow = 'hidden';

                // 调用原始显示方法
                if (originalShow) {
                    originalShow.call(this);
                } else {
                    const modal = document.getElementById('playerModal');
                    if (modal) {
                        modal.classList.add('show');
                        modal.setAttribute('aria-hidden', 'false');
                    }
                }
            };

            window.playerModalController.hide = function() {
                // 调用原始隐藏方法
                if (originalHide) {
                    originalHide.call(this);
                } else {
                    const modal = document.getElementById('playerModal');
                    if (modal) {
                        modal.classList.remove('show');
                        modal.setAttribute('aria-hidden', 'true');
                    }
                }

                // 恢复滚动
                const scrollY = document.body.style.top;
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflow = '';

                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            };
        }
    }

    // ==================== 强制移除所有可能的嵌套滚动条 ====================

    function forceSingleScrollbar() {
        // 添加CSS来强制只显示一个滚动条
        const style = document.createElement('style');
        style.id = 'force-single-scrollbar';
        style.textContent = `
            /* 强制只允许一个滚动条 */
            html {
                overflow-x: hidden !important;
            }

            body {
                overflow-x: hidden !important;
                overflow-y: auto !important;
                position: relative !important;
            }

            /* 移除所有可能的嵌套滚动容器 */
            .player-modal.show ~ * {
                overflow: visible !important;
            }

            /* 防止固定元素产生滚动条 */
            [style*="position: fixed"] {
                overflow: visible !important;
            }

            /* Webkit滚动条样式 */
            ::-webkit-scrollbar {
                width: 8px;
            }

            ::-webkit-scrollbar-track {
                background: transparent;
            }

            ::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
            }
        `;

        // 只添加一次
        if (!document.getElementById('force-single-scrollbar')) {
            document.head.appendChild(style);
        }
    }

  
    // ==================== 初始化 ====================

    function init() {
        // 等待页面加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    initSleepTimerFix();
                    fixScrollbar();
                    forceSingleScrollbar();
                    console.log('Player fixes initialized');
                }, 1000);
            });
        } else {
            setTimeout(() => {
                initSleepTimerFix();
                fixScrollbar();
                forceSingleScrollbar();
                console.log('Player fixes initialized');
            }, 1000);
        }
    }

    init();

})();