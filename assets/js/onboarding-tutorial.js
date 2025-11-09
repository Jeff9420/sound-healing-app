// ========== 首次访问引导教程 ==========
class OnboardingTutorial {
    constructor() {
        this.tutorial = null;
        this.currentStep = 1;
        this.totalSteps = 4;
        this.isCompleted = false;
        this.highlightElements = {
            2: '.healing-dashboard', // 主题选择区域
            3: '.audio-controller'   // 播放控制区域
        };
        this.idleTimer = null;
        this.idleDelay = 35000;
        this.hasInteracted = false;
        this.idleListenersBound = false;
        this.init();
    }

    init() {
    // 检查是否是首次访问
        this.checkFirstVisit();

        // 获取DOM元素
        this.tutorial = document.getElementById('onboardingTutorial');
        if (!this.tutorial) {
            return;
        }

        // 绑定事件
        this.bindEvents();

        // 监听语言变化
        document.addEventListener('languageChanged', () => {
            this.updateTutorialText();
        });
    }

    checkFirstVisit() {
        const hasVisited = localStorage.getItem('soundHealingTutorialCompleted');

        if (hasVisited) {
            this.isCompleted = true;
            return;
        }

        this.registerIdleListeners();
        this.startIdleTimer();
    }

    registerIdleListeners() {
        if (this.idleListenersBound) {
            return;
        }
        this.idleListenersBound = true;
        const interactionHandler = () => this.handleIdleInteraction();
        ['pointerdown', 'keydown', 'scroll'].forEach(evt => {
            document.addEventListener(evt, interactionHandler, { once: true });
        });
        document.addEventListener('playerInteraction', interactionHandler, { once: true });
        document.addEventListener('playerPlaybackError', () => {
            if (!this.isCompleted && !this.tutorial?.classList.contains('active')) {
                this.showTutorial();
            }
        });
    }

    startIdleTimer() {
        this.clearIdleTimer();
        this.idleTimer = setTimeout(() => {
            if (!this.hasInteracted && !this.isCompleted) {
                this.showTutorial();
            }
        }, this.idleDelay);
    }

    clearIdleTimer() {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
            this.idleTimer = null;
        }
    }

    handleIdleInteraction() {
        this.hasInteracted = true;
        this.clearIdleTimer();
    }

    bindEvents() {
    // 教程按钮事件
        const tutorialButtons = this.tutorial.querySelectorAll('.tutorial-btn');
        tutorialButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleAction(action);
            });
        });

        // 进度点点击事件
        const progressDots = this.tutorial.querySelectorAll('.progress-dot');
        progressDots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const step = parseInt(e.target.dataset.step);
                this.goToStep(step);
            });
        });

        // ESC键退出教程
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.tutorial.classList.contains('active')) {
                this.skipTutorial();
            }
        });

        // 点击遮罩层退出
        const overlay = this.tutorial.querySelector('.tutorial-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.skipTutorial();
            });
        }
    }

    handleAction(action) {
        switch (action) {
        case 'next':
            this.nextStep();
            break;
        case 'prev':
            this.prevStep();
            break;
        case 'skip':
            this.skipTutorial();
            break;
        case 'start':
            this.completeTutorial();
            break;
        default:
            console.warn('Unknown tutorial action:', action);
        }
    }

    showTutorial() {
        if (!this.tutorial || this.isCompleted) {
            return;
        }

        this.clearIdleTimer();
        this.hasInteracted = true;
        this.tutorial.style.display = 'block';
        this.tutorial.classList.add('active');
        document.body.style.overflow = 'hidden';

        // 重置到第一步
        this.currentStep = 1;
        this.updateStepDisplay();

        // 触发教程开始事件
        document.dispatchEvent(new CustomEvent('tutorialStarted'));
    }

    hideTutorial() {
        if (!this.tutorial) {
            return;
        }

        this.tutorial.classList.remove('active');
        document.body.style.overflow = '';

        setTimeout(() => {
            this.tutorial.style.display = 'none';
        }, 500);
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateStepDisplay();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }

    goToStep(step) {
        if (step >= 1 && step <= this.totalSteps) {
            this.currentStep = step;
            this.updateStepDisplay();
        }
    }

    updateStepDisplay() {
    // 更新步骤显示
        const steps = this.tutorial.querySelectorAll('.tutorial-step');
        steps.forEach((step, index) => {
            if (index + 1 === this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // 更新进度点
        const dots = this.tutorial.querySelectorAll('.progress-dot');
        dots.forEach((dot, index) => {
            if (index + 1 === this.currentStep) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        // 更新高亮提示
        this.updateHighlight();

        // 更新按钮状态
        this.updateButtonStates();

        // 触发步骤变化事件
        document.dispatchEvent(new CustomEvent('tutorialStepChanged', {
            detail: { step: this.currentStep }
        }));
    }

    updateHighlight() {
        const highlight = document.getElementById('tutorialHighlight');
        if (!highlight) {
            return;
        }

        const targetSelector = this.highlightElements[this.currentStep];

        if (targetSelector) {
            const targetElement = document.querySelector(targetSelector);
            if (targetElement) {
                // 获取元素位置
                const rect = targetElement.getBoundingClientRect();
                highlight.style.left = rect.left + 'px';
                highlight.style.top = rect.top + 'px';
                highlight.style.width = rect.width + 'px';
                highlight.style.height = rect.height + 'px';
                highlight.classList.add('show');
            } else {
                highlight.classList.remove('show');
            }
        } else {
            highlight.classList.remove('show');
        }
    }

    updateButtonStates() {
        const prevBtn = this.tutorial.querySelector('[data-action="prev"]');
        const nextBtn = this.tutorial.querySelector('[data-action="next"]');
        const startBtn = this.tutorial.querySelector('[data-action="start"]');

        // 第一步不显示上一步按钮
        if (prevBtn) {
            prevBtn.style.display = this.currentStep === 1 ? 'none' : 'block';
        }

        // 最后一步显示开始按钮
        if (nextBtn && startBtn) {
            if (this.currentStep === this.totalSteps) {
                nextBtn.style.display = 'none';
                startBtn.style.display = 'block';
            } else {
                nextBtn.style.display = 'block';
                startBtn.style.display = 'none';
            }
        }
    }

    updateTutorialText() {
    // 根据当前语言更新教程文本
        const isEnglish = document.documentElement.lang === 'en';

    // 这里可以添加多语言文本更新逻辑
    // 由于教程文本主要在HTML中，可以通过data-i18n属性处理
    }

    skipTutorial() {
        this.hideTutorial();
        this.markAsCompleted();

        // 显示跳过提示
        this.showSkipMessage();
    }

    completeTutorial() {
        this.hideTutorial();
        this.markAsCompleted();

        // 显示完成提示
        this.showCompletionMessage();

        // 触发教程完成事件
        document.dispatchEvent(new CustomEvent('tutorialCompleted'));
    }

    markAsCompleted() {
        localStorage.setItem('soundHealingTutorialCompleted', 'true');
        this.isCompleted = true;
        this.clearIdleTimer();
    }

    showSkipMessage() {
    // 创建跳过提示
        const message = document.createElement('div');
        message.className = 'tutorial-skip-message';
        message.innerHTML = `
      <div class="skip-message-content">
        <span>📖</span>
        <span>您可以随时点击右下角的帮助按钮重新查看教程</span>
      </div>
    `;
        document.body.appendChild(message);

        // 显示动画
        setTimeout(() => message.classList.add('show'), 10);

        // 3秒后移除
        setTimeout(() => {
            message.classList.remove('show');
            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 300);
        }, 3000);
    }

    showCompletionMessage() {
    // 创建完成提示
        const message = document.createElement('div');
        message.className = 'tutorial-completion-message';
        message.innerHTML = `
      <div class="completion-message-content">
        <span>🎉</span>
        <span>教程已完成！祝您使用愉快！</span>
      </div>
    `;
        document.body.appendChild(message);

        // 显示动画
        setTimeout(() => message.classList.add('show'), 10);

        // 3秒后移除
        setTimeout(() => {
            message.classList.remove('show');
            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 300);
        }, 3000);
    }

    // 公共方法：手动显示教程
    show() {
        this.showTutorial();
    }

    // 公共方法：重置教程状态
    reset() {
        localStorage.removeItem('soundHealingTutorialCompleted');
        this.isCompleted = false;
        this.currentStep = 1;
    }
}

// 添加提示消息样式
const style = document.createElement('style');
style.textContent = `
.tutorial-skip-message,
.tutorial-completion-message {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  background: rgba(45,35,65,.95);
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 8px;
  border: 1px solid rgba(232,184,109,0.4);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  z-index: 10001;
  opacity: 0;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.tutorial-skip-message.show,
.tutorial-completion-message.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

.skip-message-content,
.completion-message-content {
  display: flex;
  align-items: center;
  gap: 8px;
}
`;
document.head.appendChild(style);

// 页面加载完成后初始化教程
document.addEventListener('DOMContentLoaded', () => {
    window.onboardingTutorial = new OnboardingTutorial();
});

// 导出到全局作用域
window.OnboardingTutorial = OnboardingTutorial;
