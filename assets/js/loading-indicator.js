// Enhanced Loading Indicator for Archive.org External Audio Storage
// Handles loading states, network status, and user feedback

class LoadingIndicator {
    constructor() {
        this.loadingStates = new Map();
        this.networkStatus = 'online';
        this.connectionSpeed = 'fast';
        this.currentLoading = new Set();

        this.init();
        this.setupNetworkMonitoring();
    }

    init() {
        // Create loading indicator elements if they don't exist
        this.createLoadingElements();
        this.injectStyles();
    }

    createLoadingElements() {
        // Main loading overlay
        if (!document.getElementById('global-loading-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'global-loading-overlay';
            overlay.className = 'loading-overlay hidden';
            overlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">正在从 Archive.org 加载音频...</div>
                    <div class="loading-progress">
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                        <div class="progress-text">0%</div>
                    </div>
                    <div class="loading-tips">
                        <div class="tip-text">💡 首次加载可能需要10-15秒，后续播放会更快</div>
                        <div class="network-status"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
        }

        // Category loading indicators
        if (!document.getElementById('category-loading-status')) {
            const statusBar = document.createElement('div');
            statusBar.id = 'category-loading-status';
            statusBar.className = 'category-loading-bar hidden';
            statusBar.innerHTML = `
                <div class="loading-category-content">
                    <span class="loading-icon">🔄</span>
                    <span class="loading-category-text">加载中...</span>
                    <div class="loading-dots">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            `;

            // Insert at top of main content
            const mainContent = document.querySelector('.content-container') || document.body;
            mainContent.insertBefore(statusBar, mainContent.firstChild);
        }
    }

    injectStyles() {
        if (document.getElementById('loading-indicator-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'loading-indicator-styles';
        style.textContent = `
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(18, 18, 18, 0.95);
                backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                transition: opacity 0.3s ease;
            }

            .loading-overlay.hidden {
                opacity: 0;
                pointer-events: none;
            }

            .loading-content {
                text-align: center;
                color: white;
                max-width: 400px;
                padding: 2rem;
            }

            .loading-spinner {
                width: 60px;
                height: 60px;
                border: 4px solid rgba(255, 255, 255, 0.1);
                border-left: 4px solid #7c4dff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1.5rem;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            .loading-text {
                font-size: 1.2rem;
                margin-bottom: 1.5rem;
                font-weight: 500;
            }

            .loading-progress {
                margin-bottom: 1.5rem;
            }

            .progress-bar {
                width: 100%;
                height: 6px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
                overflow: hidden;
                margin-bottom: 0.5rem;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #7c4dff, #536dfe);
                width: 0%;
                border-radius: 3px;
                transition: width 0.3s ease;
            }

            .progress-text {
                font-size: 0.9rem;
                opacity: 0.8;
            }

            .loading-tips {
                font-size: 0.9rem;
                opacity: 0.7;
                line-height: 1.4;
            }

            .tip-text {
                margin-bottom: 0.5rem;
            }

            .network-status {
                padding: 0.5rem;
                border-radius: 4px;
                background: rgba(255, 255, 255, 0.05);
            }

            .category-loading-bar {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #7c4dff, #536dfe);
                color: white;
                padding: 0.75rem;
                text-align: center;
                z-index: 1000;
                transform: translateY(-100%);
                transition: transform 0.3s ease;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            }

            .category-loading-bar:not(.hidden) {
                transform: translateY(0);
            }

            .loading-category-content {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.75rem;
            }

            .loading-icon {
                animation: rotate 1.5s linear infinite;
            }

            @keyframes rotate {
                to { transform: rotate(360deg); }
            }

            .loading-dots span {
                display: inline-block;
                width: 4px;
                height: 4px;
                background: white;
                border-radius: 50%;
                margin: 0 2px;
                opacity: 0.3;
                animation: loadingDots 1.4s infinite ease-in-out;
            }

            .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
            .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
            .loading-dots span:nth-child(3) { animation-delay: 0s; }

            @keyframes loadingDots {
                0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
                40% { opacity: 1; transform: scale(1); }
            }

            /* Track-specific loading indicators */
            .nature-card.loading {
                position: relative;
                opacity: 0.7;
            }

            .nature-card.loading::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(90deg,
                    transparent,
                    rgba(255,255,255,0.1),
                    transparent
                );
                animation: shimmer 2s infinite;
                border-radius: inherit;
            }

            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }

            .track-loading {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.85rem;
                color: #7c4dff;
            }

            .track-loading-spinner {
                width: 16px;
                height: 16px;
                border: 2px solid rgba(124, 77, 255, 0.2);
                border-left: 2px solid #7c4dff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            /* Mobile optimizations */
            @media (max-width: 600px) {
                .loading-content {
                    padding: 1.5rem;
                }

                .loading-text {
                    font-size: 1rem;
                }

                .category-loading-bar {
                    padding: 0.5rem;
                }

                .loading-category-content {
                    gap: 0.5rem;
                }
            }
        `;

        document.head.appendChild(style);
    }

    // Show global loading overlay
    showGlobalLoading(message = '正在加载...') {
        const overlay = document.getElementById('global-loading-overlay');
        const textElement = overlay.querySelector('.loading-text');

        if (textElement) {
            textElement.textContent = message;
        }
        overlay.classList.remove('hidden');

        // Auto-hide after 30 seconds as failsafe
        setTimeout(() => {
            this.hideGlobalLoading();
        }, 30000);
    }

    // Hide global loading overlay
    hideGlobalLoading() {
        const overlay = document.getElementById('global-loading-overlay');
        overlay.classList.add('hidden');
    }

    // Update progress bar
    updateProgress(percentage) {
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');

        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        if (progressText) {
            progressText.textContent = `${Math.round(percentage)}%`;
        }
    }

    // Show category loading bar
    showCategoryLoading(categoryName) {
        const bar = document.getElementById('category-loading-status');
        const textElement = bar.querySelector('.loading-category-text');

        if (textElement) {
            textElement.textContent = `正在加载 ${categoryName} 分类...`;
        }

        bar.classList.remove('hidden');
    }

    // Hide category loading bar
    hideCategoryLoading() {
        const bar = document.getElementById('category-loading-status');
        bar.classList.add('hidden');
    }

    // Add loading state to specific track card
    showTrackLoading(trackElement, trackName) {
        if (!trackElement) {
            return;
        }

        trackElement.classList.add('loading');

        // Add loading indicator to track
        const existingIndicator = trackElement.querySelector('.track-loading');
        if (!existingIndicator) {
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'track-loading';
            loadingDiv.innerHTML = `
                <div class="track-loading-spinner"></div>
                <span>加载 ${trackName}...</span>
            `;

            const titleElement = trackElement.querySelector('.track-title') || trackElement;
            titleElement.appendChild(loadingDiv);
        }
    }

    // Remove loading state from track card
    hideTrackLoading(trackElement) {
        if (!trackElement) {
            return;
        }

        trackElement.classList.remove('loading');

        const loadingIndicator = trackElement.querySelector('.track-loading');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
    }

    // Setup network monitoring
    setupNetworkMonitoring() {
        // Monitor online/offline status
        window.addEventListener('online', () => {
            this.networkStatus = 'online';
            this.updateNetworkStatus('✅ 网络连接已恢复');
        });

        window.addEventListener('offline', () => {
            this.networkStatus = 'offline';
            this.updateNetworkStatus('❌ 网络连接已断开');
        });

        // Monitor connection speed if available
        if ('connection' in navigator) {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            if (connection) {
                this.updateConnectionSpeed(connection);
                connection.addEventListener('change', () => {
                    this.updateConnectionSpeed(connection);
                });
            }
        }
    }

    updateConnectionSpeed(connection) {
        const effectiveType = connection.effectiveType || 'unknown';
        const downlink = connection.downlink || 0;

        this.connectionSpeed = effectiveType;

        let speedText = '';
        if (effectiveType === '4g' && downlink > 1) {
            speedText = '🚀 网络状况良好';
        } else if (effectiveType === '3g' || downlink < 1) {
            speedText = '⚡ 网络较慢，加载时间可能较长';
        } else {
            speedText = `📶 网络类型: ${effectiveType}`;
        }

        this.updateNetworkStatus(speedText);
    }

    updateNetworkStatus(message) {
        const statusElement = document.querySelector('.network-status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    // Convenience method to show loading for external audio
    showExternalAudioLoading(fileName) {
        this.showGlobalLoading(`正在从 Archive.org 加载: ${fileName}`);

        // Simulate progress for better UX
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) {
                progress = 90;
            } // Don't reach 100% until actually loaded

            this.updateProgress(progress);

            if (progress >= 90) {
                clearInterval(progressInterval);
            }
        }, 500);

        return progressInterval;
    }

    // Complete loading with success
    completeLoading() {
        this.updateProgress(100);
        setTimeout(() => {
            this.hideGlobalLoading();
        }, 500);
    }

    // Handle loading error
    showError(message) {
        const overlay = document.getElementById('global-loading-overlay');
        const content = overlay.querySelector('.loading-content');

        content.innerHTML = `
            <div style="color: #ff6b6b; font-size: 3rem;">❌</div>
            <div class="loading-text" style="color: #ff6b6b;">加载失败</div>
            <div style="margin: 1rem 0; opacity: 0.8;">${message}</div>
            <button onclick="window.loadingIndicator.hideGlobalLoading()"
                    style="background: #7c4dff; color: white; border: none; padding: 0.75rem 1.5rem;
                           border-radius: 25px; cursor: pointer;">
                确定
            </button>
        `;

        setTimeout(() => {
            this.hideGlobalLoading();
        }, 5000);
    }
}

// Initialize global loading indicator
window.loadingIndicator = new LoadingIndicator();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingIndicator;
}