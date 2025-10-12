/**
 * AutoplayDetector - 浏览器Autoplay策略检测
 *
 * 功能:
 * 1. 检测浏览器是否支持自动播放
 * 2. 提供友好的用户引导
 * 3. 处理浏览器Autoplay限制
 *
 * @version 1.0.0
 * @date 2025-10-12
 */

class AutoplayDetector {
    constructor() {
        this.isAutoplayAllowed = null;
        this.hasUserInteracted = false;

        // 检查localStorage中是否已记录用户交互
        const stored = localStorage.getItem('soundHealing_userInteracted');
        if (stored === 'true') {
            this.hasUserInteracted = true;
        }
    }

    /**
     * 检测浏览器是否允许自动播放
     * @returns {Promise<boolean>}
     */
    async detectAutoplay() {
        if (this.isAutoplayAllowed !== null) {
            return this.isAutoplayAllowed;
        }

        try {
            // 创建一个静音的音频元素测试
            const testAudio = new Audio();
            testAudio.volume = 0;
            // 使用极短的静音音频数据
            testAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

            await testAudio.play();

            // 如果能播放，说明允许autoplay
            testAudio.pause();
            this.isAutoplayAllowed = true;
            console.log('✅ 浏览器支持自动播放');
            return true;
        } catch (error) {
            // 播放失败，说明不允许autoplay
            this.isAutoplayAllowed = false;
            console.log('⚠️ 浏览器阻止自动播放:', error.name);
            return false;
        }
    }

    /**
     * 显示用户交互引导界面
     */
    showInteractionPrompt() {
        // 检查是否已经显示过
        if (document.getElementById('autoplayOverlay')) {
            return;
        }

        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.id = 'autoplayOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
            animation: fadeIn 0.3s ease;
        `;

        // 创建提示卡片
        const card = document.createElement('div');
        card.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            max-width: 400px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            animation: slideUp 0.4s ease;
            color: white;
        `;

        card.innerHTML = `
            <div style="font-size: 60px; margin-bottom: 20px;">🎵</div>
            <h2 style="margin: 0 0 15px 0; color: white; font-weight: 600;">准备好聆听了吗？</h2>
            <p style="color: rgba(255,255,255,0.9); margin-bottom: 30px; line-height: 1.6;">
                浏览器需要您的许可才能播放音频。<br>
                点击下方按钮开始您的声音疗愈之旅。
            </p>
            <button id="startAudioBtn" style="
                background: white;
                color: #667eea;
                border: none;
                padding: 15px 40px;
                font-size: 18px;
                font-weight: 600;
                border-radius: 50px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
                transition: transform 0.2s, box-shadow 0.2s;
            ">
                🎧 开始聆听
            </button>
        `;

        overlay.appendChild(card);
        document.body.appendChild(overlay);

        // 添加动画样式
        if (!document.getElementById('autoplayStyles')) {
            const style = document.createElement('style');
            style.id = 'autoplayStyles';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        // 按钮交互效果
        const btn = document.getElementById('startAudioBtn');

        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-2px) scale(1.05)';
            btn.style.boxShadow = '0 6px 20px rgba(255, 255, 255, 0.5)';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0) scale(1)';
            btn.style.boxShadow = '0 4px 15px rgba(255, 255, 255, 0.3)';
        });

        // 点击按钮
        btn.addEventListener('click', () => {
            this.hasUserInteracted = true;

            // 记录到localStorage，避免下次再显示
            localStorage.setItem('soundHealing_userInteracted', 'true');

            // 淡出动画
            overlay.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                overlay.remove();
            }, 300);

            // 触发自定义事件，通知应用可以播放音频了
            window.dispatchEvent(new CustomEvent('userInteractionGranted'));

            console.log('✅ 用户已授权音频播放');
        });
    }

    /**
     * 等待用户交互
     * @returns {Promise<void>}
     */
    waitForInteraction() {
        // 如果已经交互过，直接返回
        if (this.hasUserInteracted) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            window.addEventListener('userInteractionGranted', () => {
                resolve();
            }, { once: true });

            // 显示引导界面
            this.showInteractionPrompt();
        });
    }

    /**
     * 重置交互状态（用于测试）
     */
    reset() {
        this.hasUserInteracted = false;
        this.isAutoplayAllowed = null;
        localStorage.removeItem('soundHealing_userInteracted');

        const overlay = document.getElementById('autoplayOverlay');
        if (overlay) {
            overlay.remove();
        }

        console.log('🔄 Autoplay状态已重置');
    }

    /**
     * 获取当前状态
     */
    getStatus() {
        return {
            isAutoplayAllowed: this.isAutoplayAllowed,
            hasUserInteracted: this.hasUserInteracted
        };
    }
}

// 创建全局实例
const autoplayDetector = new AutoplayDetector();
window.autoplayDetector = autoplayDetector;

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoplayDetector;
}

console.log('✅ AutoplayDetector已加载');
