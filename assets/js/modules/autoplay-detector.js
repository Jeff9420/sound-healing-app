/**
 * AutoplayDetector Module
 * Handles browser autoplay policies and user interaction prompts.
 */

export class AutoplayDetector {
    constructor() {
        this.isAutoplayAllowed = null;
        this.hasUserInteracted = false;

        const stored = localStorage.getItem('soundHealing_userInteracted');
        if (stored === 'true') {
            this.hasUserInteracted = true;
        }
    }

    async detectAutoplay() {
        if (this.isAutoplayAllowed !== null) {
            return this.isAutoplayAllowed;
        }

        try {
            const testAudio = new Audio();
            testAudio.volume = 0;
            testAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
            await testAudio.play();
            testAudio.pause();
            this.isAutoplayAllowed = true;
            console.log('✅ Browser supports autoplay');
            return true;
        } catch (error) {
            this.isAutoplayAllowed = false;
            console.log('⚠️ Browser blocked autoplay:', error.name);
            return false;
        }
    }

    showInteractionPrompt() {
        if (document.getElementById('autoplayOverlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'autoplayOverlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.8); display: flex; justify-content: center; align-items: center;
            z-index: 10000; backdrop-filter: blur(5px); animation: fadeIn 0.3s ease;
        `;

        const card = document.createElement('div');
        card.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px; border-radius: 20px; text-align: center; max-width: 400px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3); animation: slideUp 0.4s ease; color: white;
        `;

        card.innerHTML = `
            <div style="font-size: 60px; margin-bottom: 20px;">🎵</div>
            <h2 style="margin: 0 0 15px 0; color: white; font-weight: 600;">Ready to Listen?</h2>
            <p style="color: rgba(255,255,255,0.9); margin-bottom: 30px; line-height: 1.6;">
                The browser needs your permission to play audio.<br>Click below to start your journey.
            </p>
            <button id="startAudioBtn" style="
                background: white; color: #667eea; border: none; padding: 15px 40px;
                font-size: 18px; font-weight: 600; border-radius: 50px; cursor: pointer;
                box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3); transition: transform 0.2s, box-shadow 0.2s;
            ">🎧 Start Listening</button>
        `;

        overlay.appendChild(card);
        document.body.appendChild(overlay);

        if (!document.getElementById('autoplayStyles')) {
            const style = document.createElement('style');
            style.id = 'autoplayStyles';
            style.textContent = `
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
            `;
            document.head.appendChild(style);
        }

        const btn = document.getElementById('startAudioBtn');
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-2px) scale(1.05)';
            btn.style.boxShadow = '0 6px 20px rgba(255, 255, 255, 0.5)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0) scale(1)';
            btn.style.boxShadow = '0 4px 15px rgba(255, 255, 255, 0.3)';
        });
        btn.addEventListener('click', () => {
            this.hasUserInteracted = true;
            localStorage.setItem('soundHealing_userInteracted', 'true');
            overlay.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => overlay.remove(), 300);
            window.dispatchEvent(new CustomEvent('userInteractionGranted'));
            console.log('✅ User interaction granted');
        });
    }

    waitForInteraction() {
        if (this.hasUserInteracted) return Promise.resolve();
        return new Promise((resolve) => {
            window.addEventListener('userInteractionGranted', () => resolve(), { once: true });
            this.showInteractionPrompt();
        });
    }
}
