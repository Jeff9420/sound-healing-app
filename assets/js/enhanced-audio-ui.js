// 增强的音频UI控制器 - 专为Archive.org外部存储优化
class EnhancedAudioUI {
    constructor() {
        this.loadingStates = new Map();
        this.retryCounters = new Map();
        this.progressElements = new Map();
        
        this.init();
    }

    init() {
        this.createGlobalStyles();
        this.bindGlobalEvents();
    }

    createGlobalStyles() {
        if (document.getElementById('enhanced-audio-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'enhanced-audio-styles';
        styles.textContent = `
            /* Archive.org连接状态样式 */
            .archive-status-container {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 1000;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-bottom: 1px solid #e0e0e0;
                padding: 8px 16px;
                transition: all 0.3s ease;
            }

            .archive-status-indicator {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .archive-status-indicator:hover {
                background: rgba(0, 0, 0, 0.05);
                border-radius: 8px;
                padding: 4px 8px;
                margin: -4px -8px;
            }

            .status-icon {
                position: relative;
                width: 20px;
                height: 20px;
            }

            .status-dot {
                display: block;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: #ccc;
                transition: all 0.3s ease;
            }

            .archive-status-indicator.online .status-dot {
                background: #4CAF50;
                box-shadow: 0 0 8px rgba(76, 175, 80, 0.6);
                animation: pulse 2s infinite;
            }

            .archive-status-indicator.offline .status-dot {
                background: #f44336;
                animation: blink 1s infinite;
            }

            .archive-status-indicator.checking .status-dot {
                background: #FF9800;
                animation: spin 1s linear infinite;
            }

            .archive-status-indicator.error .status-dot {
                background: #9E9E9E;
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.7; }
            }

            @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.3; }
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .status-text {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }

            .status-label {
                font-weight: 500;
                color: #333;
            }

            .status-message {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .status-good {
                color: #4CAF50;
                font-weight: 500;
            }

            .status-error {
                color: #f44336;
                font-weight: 500;
            }

            .response-time {
                background: #E8F5E8;
                color: #2E7D32;
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: 500;
            }

            .status-details {
                margin-left: auto;
                color: #666;
                font-size: 12px;
            }

            .status-tooltip {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 8px 16px;
                font-size: 12px;
                transform: translateY(-100%);
                opacity: 0;
                pointer-events: none;
                transition: all 0.3s ease;
            }

            .archive-status-container:hover .status-tooltip {
                transform: translateY(0);
                opacity: 1;
            }

            /* 增强的音频加载状态 */
            .audio-track {
                position: relative;
                transition: all 0.3s ease;
            }

            .audio-track.loading {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
            }

            @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }

            .loading-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.95);
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: inherit;
                z-index: 10;
            }

            .loading-content {
                text-align: center;
                padding: 16px;
            }

            .loading-spinner {
                width: 32px;
                height: 32px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #2196F3;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 12px;
            }

            .loading-text {
                color: #666;
                font-size: 14px;
                margin-bottom: 8px;
            }

            .loading-progress {
                width: 100%;
                max-width: 200px;
                height: 4px;
                background: #e0e0e0;
                border-radius: 2px;
                overflow: hidden;
                margin: 0 auto;
            }

            .loading-progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #2196F3, #21CBF3);
                border-radius: 2px;
                transition: width 0.3s ease;
                animation: progress-pulse 1.5s ease-in-out infinite;
            }

            @keyframes progress-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }

            .retry-container {
                margin-top: 12px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }

            .retry-info {
                font-size: 12px;
                color: #999;
            }

            .retry-button {
                background: #2196F3;
                color: white;
                border: none;
                padding: 6px 16px;
                border-radius: 16px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .retry-button:hover {
                background: #1976D2;
                transform: translateY(-1px);
            }

            .retry-button:disabled {
                background: #ccc;
                cursor: not-allowed;
                transform: none;
            }

            /* 错误状态样式 */
            .audio-track.error {
                background: #ffebee;
                border: 1px solid #ffcdd2;
            }

            .error-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(244, 67, 54, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: inherit;
                z-index: 10;
            }

            .error-content {
                text-align: center;
                padding: 16px;
            }

            .error-icon {
                font-size: 24px;
                color: #f44336;
                margin-bottom: 8px;
            }

            .error-message {
                color: #c62828;
                font-size: 14px;
                margin-bottom: 12px;
            }

            /* 移动端适配 */
            @media (max-width: 768px) {
                .archive-status-container {
                    padding: 6px 12px;
                }
                
                .archive-status-indicator {
                    font-size: 13px;
                    gap: 8px;
                }
                
                .status-text {
                    gap: 1px;
                }
                
                .loading-overlay {
                    background: rgba(255, 255, 255, 0.98);
                }
                
                .loading-content {
                    padding: 12px;
                }
                
                .loading-spinner {
                    width: 28px;
                    height: 28px;
                    margin-bottom: 8px;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    bindGlobalEvents() {
        // 监听Archive.org状态变化
        window.addEventListener('archiveStatusChanged', (e) => {
            this.handleArchiveStatusChange(e.detail);
        });
    }

    handleArchiveStatusChange(statusDetail) {
        const { isAvailable, responseTime } = statusDetail;
        
        // 根据Archive.org状态调整加载策略
        if (!isAvailable) {
            this.showGlobalNotification('Archive.org暂时无法访问，将尝试使用镜像站点', 'warning');
        } else if (responseTime > 5000) {
            this.showGlobalNotification('Archive.org响应较慢，正在优化加载策略', 'info');
        }
    }

    showLoadingState(trackId, categoryName, fileName) {
        const trackElement = this.findTrackElement(trackId);
        if (!trackElement) return;

        // 添加加载样式
        trackElement.classList.add('loading');
        
        // 创建加载覆盖层
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">正在从Archive.org加载音频...</div>
                <div class="loading-progress">
                    <div class="loading-progress-bar" style="width: 0%"></div>
                </div>
                <div class="retry-container" style="display: none;">
                    <div class="retry-info">尝试连接镜像站点...</div>
                    <button class="retry-button" onclick="window.enhancedAudioUI.retryLoad('${trackId}')">
                        重新加载
                    </button>
                </div>
            </div>
        `;

        trackElement.appendChild(overlay);
        this.progressElements.set(trackId, overlay);
        
        // 模拟进度更新
        this.startProgressAnimation(trackId);
        
        // 设置超时显示重试选项
        setTimeout(() => {
            const retryContainer = overlay.querySelector('.retry-container');
            if (retryContainer && trackElement.classList.contains('loading')) {
                retryContainer.style.display = 'flex';
                overlay.querySelector('.loading-text').textContent = '加载时间较长，可能是网络问题';
            }
        }, 10000);
    }

    updateLoadingProgress(trackId, progress, message) {
        const overlay = this.progressElements.get(trackId);
        if (!overlay) return;

        const progressBar = overlay.querySelector('.loading-progress-bar');
        const loadingText = overlay.querySelector('.loading-text');

        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        if (loadingText && message) {
            loadingText.textContent = message;
        }
    }

    startProgressAnimation(trackId) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            progress = Math.min(progress, 85); // 不超过85%，等待真实加载完成

            this.updateLoadingProgress(trackId, progress);

            const trackElement = this.findTrackElement(trackId);
            if (!trackElement || !trackElement.classList.contains('loading')) {
                clearInterval(interval);
            }
        }, 500);
    }

    showErrorState(trackId, errorMessage, retryCount = 0) {
        const trackElement = this.findTrackElement(trackId);
        if (!trackElement) return;

        // 移除加载状态
        this.hideLoadingState(trackId);
        
        // 添加错误样式
        trackElement.classList.add('error');
        
        // 创建错误覆盖层
        const overlay = document.createElement('div');
        overlay.className = 'error-overlay';
        overlay.innerHTML = `
            <div class="error-content">
                <div class="error-icon">⚠️</div>
                <div class="error-message">${errorMessage}</div>
                <div class="retry-container">
                    <div class="retry-info">已重试 ${retryCount} 次</div>
                    <button class="retry-button" onclick="window.enhancedAudioUI.retryLoad('${trackId}')">
                        重新加载
                    </button>
                </div>
            </div>
        `;

        trackElement.appendChild(overlay);
        this.retryCounters.set(trackId, retryCount);
    }

    hideLoadingState(trackId) {
        const trackElement = this.findTrackElement(trackId);
        if (!trackElement) return;

        trackElement.classList.remove('loading');
        
        const overlay = trackElement.querySelector('.loading-overlay');
        if (overlay) {
            overlay.remove();
        }
        
        this.progressElements.delete(trackId);
    }

    hideErrorState(trackId) {
        const trackElement = this.findTrackElement(trackId);
        if (!trackElement) return;

        trackElement.classList.remove('error');
        
        const overlay = trackElement.querySelector('.error-overlay');
        if (overlay) {
            overlay.remove();
        }
        
        this.retryCounters.delete(trackId);
    }

    showSuccessState(trackId) {
        this.hideLoadingState(trackId);
        this.hideErrorState(trackId);
        
        const trackElement = this.findTrackElement(trackId);
        if (trackElement) {
            trackElement.classList.add('loaded');
            
            // 短暂显示成功提示
            const successBadge = document.createElement('div');
            successBadge.className = 'success-badge';
            successBadge.innerHTML = '✓ 加载成功';
            successBadge.style.cssText = `
                position: absolute;
                top: 8px;
                right: 8px;
                background: #4CAF50;
                color: white;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 11px;
                z-index: 100;
                animation: fadeInOut 2s ease-in-out forwards;
            `;
            
            trackElement.appendChild(successBadge);
            
            setTimeout(() => {
                successBadge.remove();
            }, 2000);
        }
    }

    findTrackElement(trackId) {
        // 尝试多种方式查找track元素
        return document.getElementById(`track-${trackId}`) || 
               document.querySelector(`[data-track-id="${trackId}"]`) ||
               document.querySelector(`.track[data-id="${trackId}"]`);
    }

    retryLoad(trackId) {
        const retryCount = this.retryCounters.get(trackId) || 0;
        this.retryCounters.set(trackId, retryCount + 1);
        
        this.hideErrorState(trackId);
        this.showLoadingState(trackId, '', '');
        
        // 触发重试事件
        window.dispatchEvent(new CustomEvent('audioRetryRequested', {
            detail: { trackId, retryCount: retryCount + 1 }
        }));
    }

    showGlobalNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `global-notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 60px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'warning' ? '#ff9800' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 12px 24px;
            border-radius: 24px;
            font-size: 14px;
            z-index: 2000;
            animation: slideDown 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease-in forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// CSS动画样式补充
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    @keyframes slideDown {
        from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    
    @keyframes slideUp {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
    }
    
    @keyframes fadeInOut {
        0% { opacity: 0; transform: scale(0.8); }
        20% { opacity: 1; transform: scale(1); }
        80% { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(0.8); }
    }
`;
document.head.appendChild(additionalStyles);

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedAudioUI = new EnhancedAudioUI();
});

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedAudioUI;
} else if (typeof window !== 'undefined') {
    window.EnhancedAudioUI = EnhancedAudioUI;
}