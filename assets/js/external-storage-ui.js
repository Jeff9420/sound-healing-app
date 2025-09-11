/**
 * 外部存储UI增强器
 * 专门处理Archive.org外部存储的加载状态、错误提示和重试功能
 */

class ExternalStorageUI {
    constructor() {
        this.isOnline = navigator.onLine;
        this.storageStatus = 'unknown'; // unknown, connecting, connected, error, offline
        this.retryAttempts = new Map();
        this.maxRetries = 3;
        this.retryDelay = 2000;
        this.connectionTimeout = 10000;
        this.statusIndicators = new Map();
        
        this.initializeUI();
        this.setupNetworkMonitoring();
        this.bindEvents();
    }
    
    initializeUI() {
        this.createStatusIndicator();
        this.createRetryButton();
        this.createConnectionDiagnostic();
        this.enhanceLoadingMessages();
        
        console.log('🌐 外部存储UI增强器已初始化');
    }
    
    /**
     * 创建存储状态指示器
     */
    createStatusIndicator() {
        // 顶部状态条
        const statusBar = document.createElement('div');
        statusBar.id = 'external-storage-status';
        statusBar.className = 'storage-status-bar hidden';
        statusBar.innerHTML = `
            <div class="status-content">
                <div class="status-icon">
                    <div class="status-dot"></div>
                </div>
                <div class="status-text">
                    <span class="status-message">检查外部存储连接...</span>
                    <span class="status-detail">Archive.org</span>
                </div>
                <div class="status-actions">
                    <button class="status-retry-btn" style="display: none;">
                        <i class="retry-icon">🔄</i>
                        重试
                    </button>
                    <button class="status-close-btn">✕</button>
                </div>
            </div>
        `;
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .storage-status-bar {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 1000;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 8px 16px;
                font-size: 14px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                transform: translateY(-100%);
                transition: transform 0.3s ease, background 0.3s ease;
            }
            
            .storage-status-bar:not(.hidden) {
                transform: translateY(0);
            }
            
            .storage-status-bar.status-connecting {
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            }
            
            .storage-status-bar.status-connected {
                background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            }
            
            .storage-status-bar.status-error {
                background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
            }
            
            .storage-status-bar.status-offline {
                background: linear-gradient(135deg, #a8a8a8 0%, #d3d3d3 100%);
            }
            
            .status-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .status-icon {
                margin-right: 12px;
            }
            
            .status-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: currentColor;
                animation: pulse 2s infinite;
            }
            
            .status-connected .status-dot {
                animation: none;
                background: #4ade80;
            }
            
            .status-error .status-dot {
                animation: none;
                background: #ef4444;
            }
            
            .status-text {
                flex: 1;
                display: flex;
                flex-direction: column;
            }
            
            .status-message {
                font-weight: 500;
                margin-bottom: 2px;
            }
            
            .status-detail {
                font-size: 12px;
                opacity: 0.8;
            }
            
            .status-actions {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .status-retry-btn, .status-close-btn {
                background: rgba(255,255,255,0.2);
                border: 1px solid rgba(255,255,255,0.3);
                color: white;
                padding: 4px 12px;
                border-radius: 16px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .status-retry-btn:hover, .status-close-btn:hover {
                background: rgba(255,255,255,0.3);
                border-color: rgba(255,255,255,0.5);
            }
            
            .status-retry-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .retry-icon {
                display: inline-block;
                margin-right: 4px;
                animation: spin 1s linear infinite;
            }
            
            .status-retry-btn:not(:disabled) .retry-icon {
                animation: none;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            @media (max-width: 768px) {
                .storage-status-bar {
                    padding: 6px 12px;
                    font-size: 13px;
                }
                
                .status-detail {
                    display: none;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(statusBar);
        this.statusBar = statusBar;
        
        // 绑定事件
        statusBar.querySelector('.status-retry-btn').addEventListener('click', () => {
            this.retryConnection();
        });
        
        statusBar.querySelector('.status-close-btn').addEventListener('click', () => {
            this.hideStatusBar();
        });
    }
    
    /**
     * 创建重试按钮增强
     */
    createRetryButton() {
        // 为现有的音频控制添加重试功能
        const style = document.createElement('style');
        style.textContent = `
            .audio-retry-btn {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.3s ease;
                margin: 8px auto;
            }
            
            .audio-retry-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }
            
            .audio-retry-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }
            
            .audio-retry-icon {
                font-size: 16px;
                animation: spin 1s linear infinite;
            }
            
            .audio-retry-btn:not(:disabled) .audio-retry-icon {
                animation: none;
            }
            
            .error-message-enhanced {
                background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
                border: 1px solid #f59e0b;
                color: #92400e;
                padding: 12px 16px;
                border-radius: 8px;
                margin: 12px 0;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .error-icon {
                font-size: 18px;
                color: #dc2626;
            }
            
            .error-details {
                flex: 1;
            }
            
            .error-title {
                font-weight: 500;
                margin-bottom: 4px;
            }
            
            .error-description {
                font-size: 12px;
                opacity: 0.8;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * 创建连接诊断工具
     */
    createConnectionDiagnostic() {
        const diagnosticPanel = document.createElement('div');
        diagnosticPanel.id = 'connection-diagnostic';
        diagnosticPanel.className = 'diagnostic-panel hidden';
        diagnosticPanel.innerHTML = `
            <div class="diagnostic-content">
                <div class="diagnostic-header">
                    <h3>🔍 连接诊断</h3>
                    <button class="diagnostic-close">✕</button>
                </div>
                <div class="diagnostic-body">
                    <div class="diagnostic-item">
                        <span class="diagnostic-label">网络状态:</span>
                        <span class="diagnostic-value" id="network-status">检测中...</span>
                    </div>
                    <div class="diagnostic-item">
                        <span class="diagnostic-label">Archive.org连接:</span>
                        <span class="diagnostic-value" id="archive-status">检测中...</span>
                    </div>
                    <div class="diagnostic-item">
                        <span class="diagnostic-label">DNS解析:</span>
                        <span class="diagnostic-value" id="dns-status">检测中...</span>
                    </div>
                    <div class="diagnostic-item">
                        <span class="diagnostic-label">延迟:</span>
                        <span class="diagnostic-value" id="latency-status">测量中...</span>
                    </div>
                </div>
                <div class="diagnostic-actions">
                    <button class="diagnostic-test-btn">重新测试</button>
                    <button class="diagnostic-report-btn">报告问题</button>
                </div>
            </div>
        `;
        
        // 诊断面板样式
        const style = document.createElement('style');
        style.textContent = `
            .diagnostic-panel {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.2);
                z-index: 10000;
                width: 90%;
                max-width: 400px;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .diagnostic-panel:not(.hidden) {
                opacity: 1;
                visibility: visible;
            }
            
            .diagnostic-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .diagnostic-header h3 {
                margin: 0;
                font-size: 16px;
                color: #374151;
            }
            
            .diagnostic-close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #6b7280;
            }
            
            .diagnostic-body {
                padding: 16px 20px;
            }
            
            .diagnostic-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 12px;
                font-size: 14px;
            }
            
            .diagnostic-label {
                color: #374151;
                font-weight: 500;
            }
            
            .diagnostic-value {
                color: #6b7280;
            }
            
            .diagnostic-value.status-good {
                color: #10b981;
            }
            
            .diagnostic-value.status-warning {
                color: #f59e0b;
            }
            
            .diagnostic-value.status-error {
                color: #ef4444;
            }
            
            .diagnostic-actions {
                padding: 16px 20px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                gap: 12px;
            }
            
            .diagnostic-test-btn, .diagnostic-report-btn {
                flex: 1;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .diagnostic-test-btn {
                background: #3b82f6;
                color: white;
                border: none;
            }
            
            .diagnostic-test-btn:hover {
                background: #2563eb;
            }
            
            .diagnostic-report-btn {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
            }
            
            .diagnostic-report-btn:hover {
                background: #e5e7eb;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(diagnosticPanel);
        this.diagnosticPanel = diagnosticPanel;
        
        // 绑定事件
        diagnosticPanel.querySelector('.diagnostic-close').addEventListener('click', () => {
            this.hideDiagnostic();
        });
        
        diagnosticPanel.querySelector('.diagnostic-test-btn').addEventListener('click', () => {
            this.runConnectionDiagnostic();
        });
        
        diagnosticPanel.querySelector('.diagnostic-report-btn').addEventListener('click', () => {
            this.reportIssue();
        });
    }
    
    /**
     * 增强加载消息
     */
    enhanceLoadingMessages() {
        // 创建多语言加载消息
        this.loadingMessages = {
            'zh-CN': {
                connecting: '正在连接Archive.org...',
                loading: '正在从外部存储加载音频...',
                retrying: '连接失败，正在重试...',
                offline: '网络离线，使用缓存播放',
                error: '外部存储连接错误',
                success: '外部存储连接成功'
            },
            'en-US': {
                connecting: 'Connecting to Archive.org...',
                loading: 'Loading audio from external storage...',
                retrying: 'Connection failed, retrying...',
                offline: 'Offline mode, using cached audio',
                error: 'External storage connection error',
                success: 'External storage connected successfully'
            },
            'ja-JP': {
                connecting: 'Archive.orgに接続中...',
                loading: '外部ストレージからオーディオを読み込み中...',
                retrying: '接続に失敗しました、再試行中...',
                offline: 'オフラインモード、キャッシュを使用',
                error: '外部ストレージ接続エラー',
                success: '外部ストレージに正常に接続'
            }
        };
        
        this.currentLanguage = document.documentElement.getAttribute('data-i18n-lang') || 'zh-CN';
    }
    
    /**
     * 网络监控设置
     */
    setupNetworkMonitoring() {
        // 监听在线/离线状态
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateStorageStatus('connecting');
            this.checkExternalStorageConnection();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateStorageStatus('offline');
        });
        
        // 监听连接变化
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                this.handleConnectionChange();
            });
        }
        
        // 定期检查连接状态
        setInterval(() => {
            if (this.isOnline && this.storageStatus !== 'connected') {
                this.checkExternalStorageConnection();
            }
        }, 30000); // 每30秒检查一次
        
        // 初始连接检查
        if (this.isOnline) {
            this.checkExternalStorageConnection();
        }
    }
    
    /**
     * 检查外部存储连接
     */
    async checkExternalStorageConnection() {
        if (!this.isOnline) {
            this.updateStorageStatus('offline');
            return false;
        }
        
        this.updateStorageStatus('connecting');
        
        const testUrl = 'https://archive.org/metadata/sound-healing-collection';
        const startTime = performance.now();
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.connectionTimeout);
            
            const response = await fetch(testUrl, {
                method: 'HEAD',
                signal: controller.signal,
                cache: 'no-cache'
            });
            
            clearTimeout(timeoutId);
            const endTime = performance.now();
            const latency = Math.round(endTime - startTime);
            
            if (response.ok) {
                this.updateStorageStatus('connected', { latency });
                return true;
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
            
        } catch (error) {
            console.warn('外部存储连接测试失败:', error);
            this.updateStorageStatus('error', { error: error.message });
            return false;
        }
    }
    
    /**
     * 更新存储状态
     */
    updateStorageStatus(status, details = {}) {
        this.storageStatus = status;
        
        if (!this.statusBar) return;
        
        const statusMessage = this.statusBar.querySelector('.status-message');
        const statusDetail = this.statusBar.querySelector('.status-detail');
        const retryBtn = this.statusBar.querySelector('.status-retry-btn');
        
        // 更新样式
        this.statusBar.className = `storage-status-bar status-${status}`;
        
        // 更新消息
        const messages = this.loadingMessages[this.currentLanguage];
        switch (status) {
            case 'connecting':
                statusMessage.textContent = messages.connecting;
                statusDetail.textContent = 'Archive.org';
                retryBtn.style.display = 'none';
                this.showStatusBar();
                break;
                
            case 'connected':
                statusMessage.textContent = messages.success;
                statusDetail.textContent = details.latency ? `延迟: ${details.latency}ms` : 'Archive.org';
                retryBtn.style.display = 'none';
                this.showStatusBar();
                // 3秒后自动隐藏成功状态
                setTimeout(() => this.hideStatusBar(), 3000);
                break;
                
            case 'error':
                statusMessage.textContent = messages.error;
                statusDetail.textContent = details.error || 'Archive.org';
                retryBtn.style.display = 'inline-flex';
                this.showStatusBar();
                break;
                
            case 'offline':
                statusMessage.textContent = messages.offline;
                statusDetail.textContent = '使用本地缓存';
                retryBtn.style.display = 'none';
                this.showStatusBar();
                break;
        }
        
        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('storageStatusChanged', {
            detail: { status, details }
        }));
    }
    
    /**
     * 显示状态栏
     */
    showStatusBar() {
        if (this.statusBar) {
            this.statusBar.classList.remove('hidden');
        }
    }
    
    /**
     * 隐藏状态栏
     */
    hideStatusBar() {
        if (this.statusBar) {
            this.statusBar.classList.add('hidden');
        }
    }
    
    /**
     * 重试连接
     */
    async retryConnection() {
        const retryBtn = this.statusBar.querySelector('.status-retry-btn');
        retryBtn.disabled = true;
        
        const success = await this.checkExternalStorageConnection();
        
        setTimeout(() => {
            retryBtn.disabled = false;
        }, 2000);
        
        return success;
    }
    
    /**
     * 处理连接变化
     */
    handleConnectionChange() {
        const connection = navigator.connection;
        console.log(`网络连接变化: ${connection.effectiveType}, ${connection.downlink}Mbps`);
        
        if (this.isOnline) {
            this.checkExternalStorageConnection();
        }
    }
    
    /**
     * 显示诊断面板
     */
    showDiagnostic() {
        this.diagnosticPanel.classList.remove('hidden');
        this.runConnectionDiagnostic();
    }
    
    /**
     * 隐藏诊断面板
     */
    hideDiagnostic() {
        this.diagnosticPanel.classList.add('hidden');
    }
    
    /**
     * 运行连接诊断
     */
    async runConnectionDiagnostic() {
        const networkStatus = this.diagnosticPanel.querySelector('#network-status');
        const archiveStatus = this.diagnosticPanel.querySelector('#archive-status');
        const dnsStatus = this.diagnosticPanel.querySelector('#dns-status');
        const latencyStatus = this.diagnosticPanel.querySelector('#latency-status');
        
        // 重置状态
        [networkStatus, archiveStatus, dnsStatus, latencyStatus].forEach(el => {
            el.textContent = '测试中...';
            el.className = 'diagnostic-value';
        });
        
        // 1. 网络状态检查
        networkStatus.textContent = this.isOnline ? '在线' : '离线';
        networkStatus.className = `diagnostic-value ${this.isOnline ? 'status-good' : 'status-error'}`;
        
        if (!this.isOnline) {
            archiveStatus.textContent = '网络离线';
            dnsStatus.textContent = '网络离线';
            latencyStatus.textContent = '网络离线';
            return;
        }
        
        // 2. DNS解析测试
        try {
            await fetch('https://archive.org/favicon.ico', { method: 'HEAD', cache: 'no-cache' });
            dnsStatus.textContent = '正常';
            dnsStatus.className = 'diagnostic-value status-good';
        } catch (error) {
            dnsStatus.textContent = 'DNS解析失败';
            dnsStatus.className = 'diagnostic-value status-error';
        }
        
        // 3. Archive.org连接和延迟测试
        const startTime = performance.now();
        try {
            const response = await fetch('https://archive.org/metadata/sound-healing-collection', {
                method: 'HEAD',
                cache: 'no-cache'
            });
            
            const endTime = performance.now();
            const latency = Math.round(endTime - startTime);
            
            if (response.ok) {
                archiveStatus.textContent = '连接正常';
                archiveStatus.className = 'diagnostic-value status-good';
                
                latencyStatus.textContent = `${latency}ms`;
                latencyStatus.className = `diagnostic-value ${latency < 1000 ? 'status-good' : latency < 3000 ? 'status-warning' : 'status-error'}`;
            } else {
                archiveStatus.textContent = `HTTP ${response.status}`;
                archiveStatus.className = 'diagnostic-value status-error';
                latencyStatus.textContent = '超时';
                latencyStatus.className = 'diagnostic-value status-error';
            }
        } catch (error) {
            archiveStatus.textContent = '连接失败';
            archiveStatus.className = 'diagnostic-value status-error';
            latencyStatus.textContent = '测量失败';
            latencyStatus.className = 'diagnostic-value status-error';
        }
    }
    
    /**
     * 报告问题
     */
    reportIssue() {
        const diagnosticData = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            online: this.isOnline,
            storageStatus: this.storageStatus,
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink
            } : null
        };
        
        console.log('问题报告数据:', diagnosticData);
        
        // 这里可以发送到日志服务
        alert('问题报告已生成，请联系技术支持');
        this.hideDiagnostic();
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 监听音频加载错误
        document.addEventListener('audioLoadError', (event) => {
            this.handleAudioLoadError(event.detail);
        });
        
        // 监听外部存储事件
        document.addEventListener('externalStorageRequest', (event) => {
            this.handleExternalStorageRequest(event.detail);
        });
        
        // 添加全局错误处理
        window.addEventListener('error', (event) => {
            if (event.filename && event.filename.includes('archive.org')) {
                this.updateStorageStatus('error', { error: 'Script load failed' });
            }
        });
    }
    
    /**
     * 处理音频加载错误
     */
    handleAudioLoadError(errorData) {
        const fileName = errorData.fileName;
        const attempts = this.retryAttempts.get(fileName) || 0;
        
        if (attempts < this.maxRetries) {
            this.retryAttempts.set(fileName, attempts + 1);
            setTimeout(() => {
                this.retryAudioLoad(errorData);
            }, this.retryDelay * (attempts + 1));
        } else {
            this.showPersistentError(errorData);
        }
    }
    
    /**
     * 重试音频加载
     */
    retryAudioLoad(errorData) {
        window.dispatchEvent(new CustomEvent('retryAudioLoad', {
            detail: errorData
        }));
    }
    
    /**
     * 显示持续错误
     */
    showPersistentError(errorData) {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-message-enhanced';
        errorContainer.innerHTML = `
            <div class="error-icon">⚠️</div>
            <div class="error-details">
                <div class="error-title">音频加载失败</div>
                <div class="error-description">
                    文件: ${errorData.fileName} | 
                    重试次数: ${this.maxRetries} | 
                    <a href="#" class="diagnostic-link">诊断连接</a>
                </div>
            </div>
            <button class="audio-retry-btn">
                <span class="audio-retry-icon">🔄</span>
                手动重试
            </button>
        `;
        
        // 找到合适的插入位置
        const insertTarget = document.querySelector('.audio-controls') || document.body;
        insertTarget.appendChild(errorContainer);
        
        // 绑定事件
        errorContainer.querySelector('.diagnostic-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.showDiagnostic();
        });
        
        errorContainer.querySelector('.audio-retry-btn').addEventListener('click', () => {
            this.retryAttempts.delete(errorData.fileName);
            this.retryAudioLoad(errorData);
            errorContainer.remove();
        });
        
        // 10秒后自动移除
        setTimeout(() => {
            if (errorContainer.parentNode) {
                errorContainer.remove();
            }
        }, 10000);
    }
    
    /**
     * 处理外部存储请求
     */
    handleExternalStorageRequest(requestData) {
        if (this.storageStatus !== 'connected') {
            this.showStatusBar();
            this.checkExternalStorageConnection();
        }
    }
    
    /**
     * 获取当前状态
     */
    getStatus() {
        return {
            isOnline: this.isOnline,
            storageStatus: this.storageStatus,
            retryAttempts: Object.fromEntries(this.retryAttempts),
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink
            } : null
        };
    }
}

// 创建全局实例
window.externalStorageUI = new ExternalStorageUI();

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExternalStorageUI;
}

console.log('🌐 外部存储UI增强器已加载');