class SleepTimer {
    constructor(audioManager, uiController) {
        this.audioManager = audioManager;
        this.uiController = uiController;
        this.timerId = null;
        this.isActive = false;
        this.remainingTime = 0;
        this.duration = 0;
        this.startTime = 0;
        this.updateInterval = null;
        
        this.bindElements();
        this.setupEventListeners();
    }

    bindElements() {
        this.elements = {
            durationSelect: document.getElementById('timerDuration'),
            startBtn: document.getElementById('timerStartBtn'),
            statusDisplay: document.getElementById('timerStatus'),
            remainingDisplay: document.getElementById('timerRemaining')
        };
    }

    setupEventListeners() {
        this.elements.startBtn.addEventListener('click', () => {
            if (this.isActive) {
                this.stop();
            } else {
                this.start();
            }
        });

        this.elements.durationSelect.addEventListener('change', () => {
            if (this.isActive) {
                this.stop();
            }
        });
    }

    start() {
        const duration = parseInt(this.elements.durationSelect.value);
        if (duration <= 0) {
            this.uiController.showMessage('请选择定时器时长', 'info');
            return;
        }

        this.duration = duration * 60 * 1000;
        this.remainingTime = this.duration;
        this.startTime = Date.now();
        this.isActive = true;

        this.updateUI();
        this.startCountdown();

        this.timerId = setTimeout(() => {
            this.onTimerComplete();
        }, this.duration);

        console.log(`睡眠定时器启动: ${duration}分钟`);
    }

    stop() {
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }

        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }

        this.isActive = false;
        this.remainingTime = 0;
        this.updateUI();

        console.log('睡眠定时器已停止');
    }

    startCountdown() {
        this.updateInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            this.remainingTime = Math.max(0, this.duration - elapsed);
            
            this.updateRemainingDisplay();
            
            if (this.remainingTime <= 0) {
                clearInterval(this.updateInterval);
                this.updateInterval = null;
            }
        }, 1000);
    }

    onTimerComplete() {
        console.log('睡眠定时器到时，开始渐弱停止');
        
        this.isActive = false;
        this.updateUI();

        const playingSounds = this.audioManager.getPlayingSounds();
        
        if (playingSounds.length > 0) {
            const fadeOutPromises = playingSounds.map(soundId => {
                return new Promise(resolve => {
                    this.audioManager.fadeOut(soundId, 3000);
                    setTimeout(resolve, 3000);
                });
            });

            Promise.all(fadeOutPromises).then(() => {
                this.uiController.showMessage('定时器结束，音频已停止', 'info');
            });
        } else {
            this.uiController.showMessage('定时器结束', 'info');
        }
    }

    updateUI() {
        if (this.isActive) {
            this.elements.startBtn.textContent = '停止';
            this.elements.startBtn.classList.add('active');
            this.elements.statusDisplay.textContent = '运行中';
            this.elements.durationSelect.disabled = true;
        } else {
            this.elements.startBtn.textContent = '启动';
            this.elements.startBtn.classList.remove('active');
            this.elements.statusDisplay.textContent = '未启动';
            this.elements.remainingDisplay.textContent = '';
            this.elements.durationSelect.disabled = false;
        }
    }

    updateRemainingDisplay() {
        if (!this.isActive || this.remainingTime <= 0) {
            this.elements.remainingDisplay.textContent = '';
            return;
        }

        const minutes = Math.floor(this.remainingTime / 60000);
        const seconds = Math.floor((this.remainingTime % 60000) / 1000);
        this.elements.remainingDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    getStatus() {
        return {
            isActive: this.isActive,
            remainingTime: this.remainingTime,
            duration: this.duration
        };
    }
}