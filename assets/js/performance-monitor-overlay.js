/**
 * Performance Monitor for Canvas Background Animations
 * Monitors FPS, memory usage, and performance metrics
 */

class PerformanceMonitor {
    constructor(backgroundSceneManager) {
        this.bgManager = backgroundSceneManager;
        this.isVisible = false;
        this.fps = 0;
        this.frameTime = 0;
        this.memoryUsage = 0;
        this.particleCount = 0;

        // Performance tracking
        this.frameTimestamps = [];
        this.maxFramesToTrack = 60;
        this.lastUpdate = performance.now();

        // Create overlay element
        this.createOverlay();

        // Keyboard shortcut to toggle (Ctrl+Shift+P)
        this.setupKeyboardShortcut();

        console.log('Performance Monitor initialized. Press Ctrl+Shift+P to toggle overlay.');
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'performance-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.85);
            color: #00ff00;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 12px;
            padding: 10px;
            border-radius: 5px;
            z-index: 10000;
            min-width: 200px;
            display: none;
            backdrop-filter: blur(5px);
            border: 1px solid rgba(0, 255, 0, 0.3);
        `;
        document.body.appendChild(this.overlay);
    }

    setupKeyboardShortcut() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    toggle() {
        this.isVisible = !this.isVisible;
        this.overlay.style.display = this.isVisible ? 'block' : 'none';

        if (this.isVisible) {
            this.startMonitoring();
        } else {
            this.stopMonitoring();
        }
    }

    startMonitoring() {
        if (this.monitoringInterval) return;

        this.monitoringInterval = setInterval(() => {
            this.updateMetrics();
            this.render();
        }, 250); // Update 4 times per second
    }

    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }

    updateMetrics() {
        const now = performance.now();
        const deltaTime = now - this.lastUpdate;
        this.lastUpdate = now;

        // Track frame timestamps for FPS calculation
        this.frameTimestamps.push(now);
        if (this.frameTimestamps.length > this.maxFramesToTrack) {
            this.frameTimestamps.shift();
        }

        // Calculate FPS
        if (this.frameTimestamps.length > 1) {
            const timeSpan = this.frameTimestamps[this.frameTimestamps.length - 1] - this.frameTimestamps[0];
            this.fps = Math.round((this.frameTimestamps.length - 1) * 1000 / timeSpan);
        }

        // Frame time
        this.frameTime = Math.round(deltaTime * 100) / 100;

        // Memory usage (if available)
        if (performance.memory) {
            this.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024 * 100) / 100;
        }

        // Get performance info from background manager
        const perfInfo = this.bgManager.getPerformanceInfo();
        this.performanceLevel = perfInfo.level;
        this.targetFPS = perfInfo.targetFPS;
        this.particleMultiplier = perfInfo.particleMultiplier;
        this.maxParticles = perfInfo.maxParticles;
    }

    render() {
        const status = {
            fps: this.fps >= this.targetFPS ? '#00ff00' : this.fps >= this.targetFPS * 0.7 ? '#ffff00' : '#ff0000',
            memory: this.memoryUsage > 100 ? '#ff0000' : this.memoryUsage > 50 ? '#ffff00' : '#00ff00'
        };

        this.overlay.innerHTML = `
            <div style="margin-bottom: 8px; font-size: 14px; font-weight: bold; color: #ffffff;">
                📊 Performance Monitor
            </div>
            <div style="margin-bottom: 4px;">
                <span style="color: #ffffff;">FPS:</span>
                <span style="color: ${status.fps}; font-weight: bold;">${this.fps}</span>
                <span style="color: #888;">/ ${this.targetFPS}</span>
            </div>
            <div style="margin-bottom: 4px;">
                <span style="color: #ffffff;">Frame:</span>
                <span style="color: #00ff00;">${this.frameTime}ms</span>
            </div>
            <div style="margin-bottom: 4px;">
                <span style="color: #ffffff;">Memory:</span>
                <span style="color: ${status.memory};">${this.memoryUsage}MB</span>
            </div>
            <div style="margin-bottom: 4px;">
                <span style="color: #ffffff;">Level:</span>
                <span style="color: #ffff00; font-weight: bold;">${this.performanceLevel.toUpperCase()}</span>
            </div>
            <div style="margin-bottom: 4px;">
                <span style="color: #ffffff;">Particles:</span>
                <span style="color: #00ffff;">${Math.round(this.maxParticles)} (${Math.round(this.particleMultiplier * 100)}%)</span>
            </div>
            <div style="margin-top: 8px; padding-top: 4px; border-top: 1px solid #333; font-size: 10px; color: #888;">
                Press Ctrl+Shift+P to toggle
            </div>
        `;
    }

    logPerformanceWarning(message) {
        console.warn(`⚠️ Performance Warning: ${message}`);

        if (this.isVisible) {
            const warning = document.createElement('div');
            warning.style.cssText = `
                background: rgba(255, 0, 0, 0.2);
                border: 1px solid #ff0000;
                color: #ff6b6b;
                padding: 5px;
                margin-top: 5px;
                border-radius: 3px;
                font-size: 11px;
            `;
            warning.textContent = `⚠️ ${message}`;
            this.overlay.appendChild(warning);

            setTimeout(() => warning.remove(), 5000);
        }
    }

    getReport() {
        return {
            timestamp: new Date().toISOString(),
            fps: this.fps,
            targetFPS: this.targetFPS,
            frameTime: this.frameTime,
            memoryUsage: this.memoryUsage,
            performanceLevel: this.performanceLevel,
            particleMultiplier: this.particleMultiplier,
            maxParticles: this.maxParticles
        };
    }
}

// Auto-initialize if background scene manager is available
document.addEventListener('DOMContentLoaded', () => {
    // Wait for app to initialize
    setTimeout(() => {
        if (window.audioManager && window.audioManager.backgroundSceneManager) {
            window.performanceMonitor = new PerformanceMonitor(window.audioManager.backgroundSceneManager);
        }
    }, 1000);
});