/**
 * GDPR用户权利管理模块 - SoundFlows
 * 实现数据访问、更正、删除、导出等用户权利
 */

class GDPRManager {
    constructor() {
        this.dataTypes = {
            preferences: 'user_preferences',
            analytics: 'analytics_data',
            consent: 'consent_records',
            usage: 'usage_data'
        };

        this.retentionPeriods = {
            preferences: 365, // 1年
            analytics: 180,  // 6个月
            consent: 2555, // 7年（法律要求）
            usage: 90      // 3个月
        };

        this.init();
    }

    /**
   * 初始化GDPR管理器
   */
    init() {
    // 创建用户权利界面
        this.createUserRightsUI();

        // 监听数据主体权利请求
        this.setupDataSubjectRequests();

        // 自动数据清理
        this.setupAutomaticDataCleanup();

        console.log('🛡️ GDPR用户权利管理器已启动');
    }

    /**
   * 创建用户权利界面
   */
    createUserRightsUI() {
    // 检查是否已有GDPR界面
        if (document.getElementById('gdprRightsPanel')) {
            return;
        }

        // 创建GDPR权利面板
        const panel = document.createElement('div');
        panel.id = 'gdprRightsPanel';
        panel.className = 'gdpr-panel';
        panel.innerHTML = `
      <div class="gdpr-panel-header">
        <h3>您的数据权利</h3>
        <button class="gdpr-close-btn" onclick="this.closest('.gdpr-panel').remove()">×</button>
      </div>

      <div class="gdpr-panel-content">
        <div class="gdpr-right-item">
          <h4>📊 数据访问权</h4>
          <p>查看我们持有的关于您的所有数据</p>
          <button onclick="window.gdprManager.accessData()" class="btn-secondary">访问我的数据</button>
        </div>

        <div class="gdpr-right-item">
          <h4>✏️ 数据更正权</h4>
          <p>更正不准确或不完整的个人数据</p>
          <button onclick="window.gdprManager.showDataCorrectionForm()" class="btn-secondary">更正数据</button>
        </div>

        <div class="gdpr-right-item">
          <h4>🗑️ 数据删除权</h4>
          <p>要求删除您的个人数据（"被遗忘权"）</p>
          <button onclick="window.gdprManager.requestDataDeletion()" class="btn-secondary">删除我的数据</button>
        </div>

        <div class="gdpr-right-item">
          <h4>📥 数据携带权</h4>
          <p>以机器可读格式获取您的数据</p>
          <button onclick="window.gdprManager.exportData()" class="btn-secondary">导出数据</button>
        </div>

        <div class="gdpr-right-item">
          <h4>⛔ 处理限制权</h4>
          <p>限制某些数据处理活动</p>
          <button onclick="window.gdprManager.limitProcessing()" class="btn-secondary">限制处理</button>
        </div>

        <div class="gdpr-right-item">
          <h4>📤 撤回同意权</h4>
          <p>随时撤回您的同意</p>
          <button onclick="window.gdprManager.withdrawConsent()" class="btn-secondary">撤回同意</button>
        </div>

        <div class="gdpr-right-item">
          <h4>📢 投诉权</h4>
          <p>向监管机构投诉</p>
          <button onclick="window.gdprManager.showComplaintInfo()" class="btn-secondary">投诉信息</button>
        </div>
      </div>

      <div id="gdprDataDisplay" class="gdpr-data-display"></div>
    `;

        // 添加样式
        this.addGDPRStyles();

        // 添加到页面
        document.body.appendChild(panel);

        // 创建入口按钮
        this.createGDPROpenButton();
    }

    /**
   * 创建GDPR入口按钮
   */
    createGDPROpenButton() {
        const button = document.createElement('button');
        button.id = 'gdprRightsButton';
        button.className = 'gdpr-trigger-btn';
        button.innerHTML = '🛡️ 隐私权利';
        button.onclick = () => {
            document.getElementById('gdprRightsPanel').style.display = 'block';
        };

        // 添加到设置或页脚
        const footer = document.querySelector('footer') || document.body;
        footer.appendChild(button);
    }

    /**
   * 添加GDPR样式
   */
    addGDPRStyles() {
        if (document.getElementById('gdprStyles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'gdprStyles';
        style.textContent = `
      .gdpr-panel {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        background: rgba(13, 19, 31, 0.98);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        color: white;
        z-index: 10000;
        display: none;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      }

      .gdpr-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .gdpr-panel-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .gdpr-close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.2s;
      }

      .gdpr-close-btn:hover {
        opacity: 1;
      }

      .gdpr-panel-content {
        padding: 20px;
      }

      .gdpr-right-item {
        margin-bottom: 25px;
        padding: 15px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .gdpr-right-item h4 {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 600;
      }

      .gdpr-right-item p {
        margin: 0 0 12px 0;
        font-size: 14px;
        opacity: 0.8;
      }

      .gdpr-trigger-btn {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #6666ff;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 30px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(102, 102, 255, 0.3);
        transition: all 0.3s ease;
        z-index: 999;
      }

      .gdpr-trigger-btn:hover {
        background: #5555ee;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(102, 102, 255, 0.4);
      }

      .gdpr-data-display {
        margin: 20px;
        padding: 15px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 8px;
        font-family: monospace;
        font-size: 12px;
        max-height: 300px;
        overflow-y: auto;
        display: none;
      }

      .gdpr-data-display pre {
        white-space: pre-wrap;
        word-wrap: break-word;
      }

      @media (max-width: 768px) {
        .gdpr-trigger-btn {
          bottom: 80px;
          right: 10px;
          padding: 10px 16px;
          font-size: 12px;
        }
      }
    `;

        document.head.appendChild(style);
    }

    /**
   * 数据访问权
   */
    async accessData() {
        const display = document.getElementById('gdprDataDisplay');
        display.style.display = 'block';
        display.innerHTML = '<p>正在收集您的数据...</p>';

        try {
            const userData = await this.collectAllUserData();

            // 安全地显示用户数据（转义HTML）
            const safeUserData = typeof SecurityUtils !== 'undefined'
                ? SecurityUtils.escapeHtml(JSON.stringify(userData, null, 2))
                : JSON.stringify(userData, null, 2).replace(/</g, '&lt;').replace(/>/g, '&gt;');

            display.innerHTML = `
        <h4>我们持有的关于您的数据：</h4>
        <pre>${safeUserData}</pre>
        <button onclick="this.parentElement.style.display='none'" class="btn-primary">关闭</button>
      `;
        } catch (error) {
            // 安全地显示错误消息
            const safeErrorMsg = typeof SecurityUtils !== 'undefined'
                ? SecurityUtils.escapeHtml(error.message)
                : String(error.message).replace(/</g, '&lt;').replace(/>/g, '&gt;');

            display.innerHTML = `
        <p>数据获取失败：${safeErrorMsg}</p>
        <button onclick="this.parentElement.style.display='none'" class="btn-primary">关闭</button>
      `;
        }
    }

    /**
   * 收集所有用户数据
   */
    async collectAllUserData() {
        const userData = {
            collectedAt: new Date().toISOString(),
            dataSummary: {}
        };

        // 收集偏好设置
        const preferences = this.getUserPreferences();
        if (Object.keys(preferences).length > 0) {
            userData.dataSummary.preferences = preferences;
        }

        // 收集同意记录
        const consent = this.getConsentRecords();
        if (consent.length > 0) {
            userData.dataSummary.consent = consent;
        }

        // 收集使用数据
        const usage = this.getUsageData();
        if (Object.keys(usage).length > 0) {
            userData.dataSummary.usage = usage;
        }

        // 收集分析数据（如果有）
        const analytics = this.getAnalyticsData();
        if (analytics) {
            userData.dataSummary.analytics = analytics;
        }

        return userData;
    }

    /**
   * 获取用户偏好
   */
    getUserPreferences() {
        const preferences = {};

        // 主题设置
        const theme = localStorage.getItem('theme');
        if (theme) {
            preferences.theme = theme;
        }

        // 语言设置
        const language = localStorage.getItem('language');
        if (language) {
            preferences.language = language;
        }

        // 音量设置
        const volume = localStorage.getItem('volume');
        if (volume) {
            preferences.volume = volume;
        }

        // 播放设置
        const autoplay = localStorage.getItem('autoplay');
        if (autoplay) {
            preferences.autoplay = autoplay;
        }

        return preferences;
    }

    /**
   * 获取同意记录
   */
    getConsentRecords() {
        const consent = localStorage.getItem('cookieConsent');
        return consent ? [JSON.parse(consent)] : [];
    }

    /**
   * 获取使用数据
   */
    getUsageData() {
        const usage = {};

        // 最后播放
        const lastPlayed = localStorage.getItem('lastPlayed');
        if (lastPlayed) {
            usage.lastPlayed = lastPlayed;
        }

        // 播放历史
        const playHistory = localStorage.getItem('playHistory');
        if (playHistory) {
            try {
                usage.playHistory = JSON.parse(playHistory);
            } catch (e) {
                // 忽略解析错误
            }
        }

        // 收藏
        const favorites = localStorage.getItem('favorites');
        if (favorites) {
            try {
                usage.favorites = JSON.parse(favorites);
            } catch (e) {
                // 忽略解析错误
            }
        }

        return usage;
    }

    /**
   * 获取分析数据
   */
    getAnalyticsData() {
    // 如果有Google Analytics，获取客户端ID
        if (window.ga && window.ga.getAll) {
            try {
                const tracker = window.ga.getAll()[0];
                return {
                    clientId: tracker.get('clientId'),
                    measurementId: window.__ANALYTICS_CONFIG?.gaMeasurementId
                };
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    /**
   * 数据更正权
   */
    showDataCorrectionForm() {
        const display = document.getElementById('gdprDataDisplay');
        display.style.display = 'block';

        display.innerHTML = `
      <h4>更正您的数据</h4>
      <form id="dataCorrectionForm" onsubmit="return false;">
        <div class="form-group">
          <label>数据类型：</label>
          <select id="correctDataType" class="form-control">
            <option value="preferences">偏好设置</option>
            <option value="usage">使用数据</option>
          </select>
        </div>

        <div class="form-group">
          <label>当前值：</label>
          <textarea id="currentValue" readonly class="form-control" rows="4"></textarea>
        </div>

        <div class="form-group">
          <label>更正后的值：</label>
          <textarea id="correctedValue" class="form-control" rows="4" required></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary">提交更正</button>
          <button type="button" onclick="this.closest('.gdpr-data-display').style.display='none'" class="btn-secondary">取消</button>
        </div>
      </form>
    `;

        // 绑定事件
        const form = document.getElementById('dataCorrectionForm');
        const dataTypeSelect = document.getElementById('correctDataType');
        const currentValueTextarea = document.getElementById('currentValue');

        dataTypeSelect.addEventListener('change', (e) => {
            const dataType = e.target.value;
            let currentValue = '';

            switch (dataType) {
            case 'preferences':
                currentValue = JSON.stringify(this.getUserPreferences(), null, 2);
                break;
            case 'usage':
                currentValue = JSON.stringify(this.getUsageData(), null, 2);
                break;
            }

            currentValueTextarea.value = currentValue;
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.correctData(dataTypeSelect.value, document.getElementById('correctedValue').value);
        });
    }

    /**
   * 执行数据更正
   */
    correctData(dataType, newValue) {
        try {
            switch (dataType) {
            case 'preferences':
                const prefs = JSON.parse(newValue);
                Object.keys(prefs).forEach(key => {
                    localStorage.setItem(key, prefs[key]);
                });
                break;

            case 'usage':
                const usage = JSON.parse(newValue);
                localStorage.setItem('usage', JSON.stringify(usage));
                break;
            }

            this.showNotification('数据已成功更正', 'success');
            document.getElementById('gdprDataDisplay').style.display = 'none';
        } catch (error) {
            this.showNotification('数据更正失败：' + error.message, 'error');
        }
    }

    /**
   * 数据删除权
   */
    requestDataDeletion() {
        const display = document.getElementById('gdprDataDisplay');
        display.style.display = 'block';

        display.innerHTML = `
      <div class="deletion-confirmation">
        <h4>⚠️ 确认删除数据</h4>
        <p>您确定要删除所有个人数据吗？此操作不可逆转。</p>

        <div class="deletion-options">
          <label>
            <input type="checkbox" id="deletePreferences" checked>
            偏好设置（主题、语言等）
          </label>

          <label>
            <input type="checkbox" id="deleteUsage" checked>
            使用数据（播放历史、收藏等）
          </label>

          <label>
            <input type="checkbox" id="deleteConsent">
            同意记录（法律要求保留7年）
          </label>
        </div>

        <div class="form-actions">
          <button onclick="window.gdprManager.executeDataDeletion()" class="btn-danger">确认删除</button>
          <button onclick="this.closest('.gdpr-data-display').style.display='none'" class="btn-secondary">取消</button>
        </div>
      </div>
    `;
    }

    /**
   * 执行数据删除
   */
    executeDataDeletion() {
        const deletePrefs = document.getElementById('deletePreferences').checked;
        const deleteUsage = document.getElementById('deleteUsage').checked;
        const deleteConsent = document.getElementById('deleteConsent').checked;

        if (deletePrefs) {
            // 删除偏好设置
            localStorage.removeItem('theme');
            localStorage.removeItem('language');
            localStorage.removeItem('volume');
            localStorage.removeItem('autoplay');
        }

        if (deleteUsage) {
            // 删除使用数据
            localStorage.removeItem('lastPlayed');
            localStorage.removeItem('playHistory');
            localStorage.removeItem('favorites');
        }

        if (deleteConsent) {
            // 注意：根据法律要求，同意记录可能需要保留
            localStorage.removeItem('cookieConsent');
        }

        this.showNotification('数据已删除', 'success');
        document.getElementById('gdprDataDisplay').style.display = 'none';
    }

    /**
   * 数据携带权
   */
    async exportData() {
        const display = document.getElementById('gdprDataDisplay');
        display.style.display = 'block';
        display.innerHTML = '<p>正在准备数据导出...</p>';

        try {
            const userData = await this.collectAllUserData();

            // 创建JSON文件
            const dataStr = JSON.stringify(userData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            // 创建下载链接
            const url = URL.createObjectURL(dataBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `soundflows-data-export-${new Date().toISOString().split('T')[0]}.json`;

            display.innerHTML = `
        <h4>您的数据已准备就绪</h4>
        <p>点击下方按钮下载您的个人数据</p>
        <button onclick="this.click()" class="btn-primary">下载数据</button>
        <button onclick="this.parentElement.style.display='none'" class="btn-secondary">关闭</button>
      `;

            display.querySelector('button').onclick = () => {
                a.click();
                URL.revokeObjectURL(url);
                this.showNotification('数据导出成功', 'success');
            };
        } catch (error) {
            // 安全地显示错误消息
            const safeErrorMsg = typeof SecurityUtils !== 'undefined'
                ? SecurityUtils.escapeHtml(error.message)
                : String(error.message).replace(/</g, '&lt;').replace(/>/g, '&gt;');

            display.innerHTML = `
        <p>数据导出失败：${safeErrorMsg}</p>
        <button onclick="this.parentElement.style.display='none'" class="btn-primary">关闭</button>
      `;
        }
    }

    /**
   * 处理限制权
   */
    limitProcessing() {
        const display = document.getElementById('gdprDataDisplay');
        display.style.display = 'block';

        display.innerHTML = `
      <h4>限制数据处理</h4>
      <p>您可以限制以下数据处理活动：</p>

      <div class="limit-options">
        <label>
          <input type="checkbox" id="limitAnalytics">
          限制分析数据收集
        </label>

        <label>
          <input type="checkbox" id="limitUsage">
          限制使用数据跟踪
        </label>

        <label>
          <input type="checkbox" id="limitPersonalization">
          限制个性化体验
        </label>
      </div>

      <div class="form-actions">
        <button onclick="window.gdprManager.applyProcessingLimits()" class="btn-primary">应用限制</button>
        <button onclick="this.closest('.gdpr-data-display').style.display='none'" class="btn-secondary">取消</button>
      </div>
    `;
    }

    /**
   * 应用处理限制
   */
    applyProcessingLimits() {
        const limits = {
            analytics: document.getElementById('limitAnalytics').checked,
            usage: document.getElementById('limitUsage').checked,
            personalization: document.getElementById('limitPersonalization').checked
        };

        localStorage.setItem('processingLimits', JSON.stringify(limits));

        // 立即应用限制
        if (limits.analytics) {
            // 禁用分析
            if (window.cookieConsent) {
                window.cookieConsent.disableAnalytics();
            }
        }

        this.showNotification('处理限制已应用', 'success');
        document.getElementById('gdprDataDisplay').style.display = 'none';
    }

    /**
   * 撤回同意
   */
    withdrawConsent() {
        const display = document.getElementById('gdprDataDisplay');
        display.style.display = 'block';

        display.innerHTML = `
      <div class="withdraw-consent">
        <h4>撤回同意</h4>
        <p>您可以撤回以下同意：</p>

        <div class="consent-list">
          <label>
            <input type="checkbox" id="withdrawAnalytics">
            分析Cookie同意
          </label>

          <label>
            <input type="checkbox" id="withdrawMarketing">
            营销通信同意
          </label>
        </div>

        <div class="form-actions">
          <button onclick="window.gdprManager.executeConsentWithdrawal()" class="btn-primary">撤回同意</button>
          <button onclick="this.closest('.gdpr-data-display').style.display='none'" class="btn-secondary">取消</button>
        </div>
      </div>
    `;
    }

    /**
   * 执行同意撤回
   */
    executeConsentWithdrawal() {
        const withdrawAnalytics = document.getElementById('withdrawAnalytics').checked;
        const withdrawMarketing = document.getElementById('withdrawMarketing').checked;

        if (withdrawAnalytics) {
            // 更新同意记录
            const consent = {
                type: 'necessary',
                date: new Date().toISOString(),
                version: '1.0',
                withdrawn: {
                    analytics: true,
                    date: new Date().toISOString()
                }
            };

            localStorage.setItem('cookieConsent', JSON.stringify(consent));

            // 禁用分析
            if (window.cookieConsent) {
                window.cookieConsent.disableAnalytics();
            }
        }

        this.showNotification('同意已撤回', 'success');
        document.getElementById('gdprDataDisplay').style.display = 'none';
    }

    /**
   * 显示投诉信息
   */
    showComplaintInfo() {
        const display = document.getElementById('gdprDataDisplay');
        display.style.display = 'block';

        display.innerHTML = `
      <div class="complaint-info">
        <h4>投诉权利</h4>
        <p>如果您认为我们的数据处理违反了GDPR，您有权向监管机构投诉。</p>

        <div class="complaint-details">
          <h5>相关监管机构：</h5>
          <ul>
            <li>中国国家互联网信息办公室 (CAC)</li>
            <li>欧洲数据保护机构 (如果您位于欧盟)</li>
            <li>您所在国家/地区的数据保护机构</li>
          </ul>

          <h5>投诉前建议：</h5>
          <ol>
            <li>首先联系我们，我们会尽力解决您的问题</li>
            <li>详细说明您的投诉内容</li>
            <li>提供相关证据</li>
            <li>说明您期望的解决方案</li>
          </ol>

          <h5>联系方式：</h5>
          <p>邮箱：privacy@soundflows.app</p>
        </div>

        <button onclick="this.closest('.gdpr-data-display').style.display='none'" class="btn-primary">关闭</button>
      </div>
    `;
    }

    /**
   * 设置数据主体请求监听
   */
    setupDataSubjectRequests() {
    // 监听来自外部系统的数据主体请求
        window.addEventListener('message', (event) => {
            if (event.data.type === 'GDPR_REQUEST') {
                this.handleDataSubjectRequest(event.data);
            }
        });
    }

    /**
   * 处理数据主体请求
   */
    async handleDataSubjectRequest(request) {
        const { action, dataType, requestId } = request;

        try {
            let result;

            switch (action) {
            case 'ACCESS':
                result = await this.collectAllUserData();
                break;

            case 'DELETE':
                this.executeDataDeletion();
                result = { success: true };
                break;

            case 'EXPORT':
                const userData = await this.collectAllUserData();
                result = { data: userData };
                break;

            default:
                throw new Error('未知的请求类型');
            }

            // 发送响应
            window.postMessage({
                type: 'GDPR_RESPONSE',
                requestId,
                success: true,
                result
            }, '*');
        } catch (error) {
            window.postMessage({
                type: 'GDPR_RESPONSE',
                requestId,
                success: false,
                error: error.message
            }, '*');
        }
    }

    /**
   * 设置自动数据清理
   */
    setupAutomaticDataCleanup() {
    // 每天检查一次过期数据
        setInterval(() => {
            this.cleanupExpiredData();
        }, 24 * 60 * 60 * 1000);

        // 页面加载时也检查
        this.cleanupExpiredData();
    }

    /**
   * 清理过期数据
   */
    cleanupExpiredData() {
        const now = new Date();

        // 检查使用数据
        const usageData = localStorage.getItem('playHistory');
        if (usageData) {
            try {
                const data = JSON.parse(usageData);
                if (data.lastUpdated) {
                    const lastUpdated = new Date(data.lastUpdated);
                    const daysOld = (now - lastUpdated) / (1000 * 60 * 60 * 24);

                    if (daysOld > this.retentionPeriods.usage) {
                        localStorage.removeItem('playHistory');
                        console.log('🧹 已清理过期的使用数据');
                    }
                }
            } catch (e) {
                // 忽略错误
            }
        }

    // 检查其他数据...
    // 可以根据需要添加更多数据清理逻辑
    }

    /**
   * 显示通知
   */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `gdpr-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 10001;
      animation: slideIn 0.3s ease;
    `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
   * 销毁GDPR管理器
   */
    destroy() {
        const panel = document.getElementById('gdprRightsPanel');
        if (panel) {
            panel.remove();
        }

        const button = document.getElementById('gdprRightsButton');
        if (button) {
            button.remove();
        }

        const styles = document.getElementById('gdprStyles');
        if (styles) {
            styles.remove();
        }
    }
}

// 初始化GDPR管理器
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        window.gdprManager = new GDPRManager();
    });

    // 导出到全局命名空间
    window.GDPRManager = GDPRManager;
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GDPRManager;
}