// Archive.org连接状态UI控制器
class ConnectionStatusUI {
    constructor() {
        this.statusElement = null;
        this.isArchiveAvailable = null;
        this.lastCheckTime = null;
        this.checkInterval = null;
        
        this.init();
    }

    init() {
        this.createStatusIndicator();
        this.startPeriodicCheck();
        this.bindEvents();
    }

    createStatusIndicator() {
        // 创建状态指示器容器
        const statusContainer = document.createElement('div');
        statusContainer.id = 'archive-status-container';
        statusContainer.className = 'archive-status-container';
        statusContainer.innerHTML = `
            <div class="archive-status-indicator" id="archive-status-indicator">
                <div class="status-icon" id="status-icon">
                    <span class="status-dot"></span>
                </div>
                <div class="status-text" id="status-text">
                    <span class="status-label">外部存储</span>
                    <span class="status-message" id="status-message">检查中...</span>
                </div>
                <div class="status-details" id="status-details">
                    <small class="last-check" id="last-check">上次检查: --</small>
                </div>
            </div>
            <div class="status-tooltip" id="status-tooltip">
                音频文件存储在Archive.org，确保最佳播放体验
            </div>
        `;

        // 添加到页面顶部
        document.body.insertBefore(statusContainer, document.body.firstChild);
        this.statusElement = statusContainer;
    }

    async checkArchiveStatus() {
        const statusIcon = document.getElementById('status-icon');
        const statusMessage = document.getElementById('status-message');
        const lastCheckElement = document.getElementById('last-check');
        const indicator = document.getElementById('archive-status-indicator');

        try {
            // 显示检查状态
            indicator.className = 'archive-status-indicator checking';
            statusMessage.textContent = '检查连接...';

            // 测试多个Archive.org端点
            const testUrls = [
                'https://archive.org/services/check.php',
                'https://archive.org/',
                'https://ia801504.us.archive.org/'
            ];

            let isAvailable = false;
            let bestResponseTime = Infinity;
            let workingUrl = null;

            for (const url of testUrls) {
                try {
                    const startTime = performance.now();
                    const response = await fetch(url, { 
                        method: 'HEAD', 
                        cache: 'no-cache',
                        signal: AbortSignal.timeout(5000)
                    });
                    const endTime = performance.now();
                    const responseTime = endTime - startTime;

                    if (response.ok && responseTime < bestResponseTime) {
                        isAvailable = true;
                        bestResponseTime = responseTime;
                        workingUrl = url;
                    }
                } catch (error) {
                    console.warn(`Archive.org endpoint ${url} failed:`, error.message);
                }
            }

            this.isArchiveAvailable = isAvailable;
            this.lastCheckTime = new Date();

            // 更新UI状态
            if (isAvailable) {
                indicator.className = 'archive-status-indicator online';
                statusMessage.innerHTML = `
                    <span class="status-good">连接正常</span>
                    <span class="response-time">${Math.round(bestResponseTime)}ms</span>
                `;
                this.updateTooltip(`Archive.org连接正常，响应时间 ${Math.round(bestResponseTime)}ms`);
            } else {
                indicator.className = 'archive-status-indicator offline';
                statusMessage.innerHTML = '<span class="status-error">连接异常</span>';
                this.updateTooltip('Archive.org暂时无法访问，将尝试使用镜像站点');
            }

            lastCheckElement.textContent = `上次检查: ${this.formatTime(this.lastCheckTime)}`;

            // 触发全局事件
            window.dispatchEvent(new CustomEvent('archiveStatusChanged', {
                detail: { 
                    isAvailable, 
                    responseTime: bestResponseTime,
                    workingUrl 
                }
            }));

        } catch (error) {
            console.error('Archive status check failed:', error);
            
            this.isArchiveAvailable = false;
            indicator.className = 'archive-status-indicator error';
            statusMessage.innerHTML = '<span class="status-error">检查失败</span>';
            this.updateTooltip('无法检查Archive.org状态，请检查网络连接');
        }
    }

    updateTooltip(message) {
        const tooltip = document.getElementById('status-tooltip');
        if (tooltip) {
            tooltip.textContent = message;
        }
    }

    formatTime(date) {
        return date.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
    }

    startPeriodicCheck() {
        // 立即检查一次
        this.checkArchiveStatus();
        
        // 每5分钟检查一次
        this.checkInterval = setInterval(() => {
            this.checkArchiveStatus();
        }, 5 * 60 * 1000);
    }

    stopPeriodicCheck() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    bindEvents() {
        // 点击状态指示器手动检查
        const indicator = document.getElementById('archive-status-indicator');
        if (indicator) {
            indicator.addEventListener('click', () => {
                this.checkArchiveStatus();
            });
        }

        // 页面可见性变化时检查
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                // 页面重新变为可见时检查状态
                setTimeout(() => this.checkArchiveStatus(), 1000);
            }
        });

        // 网络状态变化时检查
        window.addEventListener('online', () => {
            setTimeout(() => this.checkArchiveStatus(), 2000);
        });

        window.addEventListener('offline', () => {
            const indicator = document.getElementById('archive-status-indicator');
            const statusMessage = document.getElementById('status-message');
            
            if (indicator && statusMessage) {
                indicator.className = 'archive-status-indicator offline';
                statusMessage.innerHTML = '<span class="status-error">网络离线</span>';
                this.updateTooltip('网络连接已断开');
            }
        });
    }

    // 获取当前状态
    getStatus() {
        return {
            isAvailable: this.isArchiveAvailable,
            lastCheck: this.lastCheckTime,
            isChecking: document.getElementById('archive-status-indicator')?.classList.contains('checking') || false
        };
    }

    // 手动触发检查
    forceCheck() {
        return this.checkArchiveStatus();
    }

    // 销毁实例
    destroy() {
        this.stopPeriodicCheck();
        if (this.statusElement) {
            this.statusElement.remove();
        }
    }
}

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    window.connectionStatusUI = new ConnectionStatusUI();
});

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConnectionStatusUI;
} else if (typeof window !== 'undefined') {
    window.ConnectionStatusUI = ConnectionStatusUI;
}