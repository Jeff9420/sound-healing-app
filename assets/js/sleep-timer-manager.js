/**
 * 睡眠定时器管理器
 * 确保定时器功能正常工作
 */

(function() {
    'use strict';

    let sleepTimerTimeout = null;
    let sleepTimerInterval = null;
    let sleepTimerEnd = null;
    let sleepTimerMinutes = 0;

    // 设置睡眠定时器
    window.setSleepTimer = function(minutes) {
        console.log('Setting sleep timer for', minutes, 'minutes');

        // 清除现有定时器
        clearSleepTimer();

        // 如果设置为0，表示关闭定时器
        if (minutes === 0) {
            clearSleepTimer();
            showTimerNotification('定时器已关闭', 'Timer disabled');
            return;
        }

        // 设置新的定时器
        sleepTimerMinutes = minutes;
        sleepTimerEnd = Date.now() + minutes * 60 * 1000;

        // 设置定时器
        sleepTimerTimeout = setTimeout(() => {
            // 停止音频播放
            if (window.audioManager && window.audioManager.audio) {
                window.audioManager.audio.pause();
                window.audioManager.audio.currentTime = 0;
            }

            // 更新播放状态
            window.isPlaying = false;
            window.isPaused = true;

            // 更新播放按钮
            const playPauseBtn = document.getElementById('playPauseBtn');
            if (playPauseBtn) {
                const playIcon = playPauseBtn.querySelector('.play-icon');
                const pauseIcon = playPauseBtn.querySelector('.pause-icon');
                if (playIcon) playIcon.style.display = 'block';
                if (pauseIcon) pauseIcon.style.display = 'none';
            }

            // 更新定时器按钮状态
            const sleepTimerBtn = document.getElementById('sleepTimerBtn');
            if (sleepTimerBtn) {
                sleepTimerBtn.classList.remove('active');
            }

            // 显示通知
            showTimerNotification('睡眠定时器已停止播放', 'Sleep timer stopped');

            // 清除定时器
            clearSleepTimer();
        }, minutes * 60 * 1000);

        // 设置定时器显示
        startTimerDisplay();

        // 更新定时器按钮状态
        const sleepTimerBtn = document.getElementById('sleepTimerBtn');
        if (sleepTimerBtn) {
            sleepTimerBtn.classList.add('active');
        }

        // 显示通知
        showTimerNotification(`定时器已设置：${minutes}分钟`, `Timer set: ${minutes} minutes`);
    };

    // 清除睡眠定时器
    function clearSleepTimer() {
        if (sleepTimerTimeout) {
            clearTimeout(sleepTimerTimeout);
            sleepTimerTimeout = null;
        }

        if (sleepTimerInterval) {
            clearInterval(sleepTimerInterval);
            sleepTimerInterval = null;
        }

        sleepTimerEnd = null;
        sleepTimerMinutes = 0;

        // 清除定时器显示
        const timerDisplay = document.getElementById('sleepTimerDisplay');
        if (timerDisplay) {
            timerDisplay.textContent = '';
        }
    }

    // 开始定时器显示
    function startTimerDisplay() {
        if (sleepTimerInterval) {
            clearInterval(sleepTimerInterval);
        }

        sleepTimerInterval = setInterval(() => {
            if (sleepTimerEnd) {
                const remaining = Math.max(0, sleepTimerEnd - Date.now());
                const minutes = Math.floor(remaining / 60000);
                const seconds = Math.floor((remaining % 60000) / 1000);

                // 更新定时器按钮显示
                const sleepTimerBtn = document.getElementById('sleepTimerBtn');
                if (sleepTimerBtn && remaining > 0) {
                    sleepTimerBtn.setAttribute('title', `剩余时间: ${minutes}:${seconds.toString().padStart(2, '0')}`);
                }
            }
        }, 1000);
    }

    // 显示定时器通知
    function showTimerNotification(message, englishMessage) {
        // 使用现有的通知系统
        if (window.showNotification) {
            const lang = window.i18n ? window.i18n.currentLanguage : 'en-US';
            const isZh = lang.includes('zh');
            window.showNotification(isZh ? message : englishMessage);
        } else {
            console.log('Timer notification:', message);
        }
    }

    // 初始化定时器管理器
    function init() {
        console.log('Sleep Timer Manager initialized');
    }

    // 导出清除定时器函数
    window.clearSleepTimer = clearSleepTimer;

    // 初始化
    init();

})();