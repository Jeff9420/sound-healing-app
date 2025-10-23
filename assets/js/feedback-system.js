/**
 * User Feedback Collection System
 * 用户反馈收集系统 - 收集、分析和管理用户反馈
 * Version: 1.0.0
 */

class FeedbackSystem {
    constructor() {
        this.config = {
            enabled: true,
            autoPrompt: true,
            promptDelay: 30000, // 30秒后提示
            promptAfterActions: 5, // 5个操作后提示
            feedbackEndpoint: '/api/feedback',
            analyticsEndpoint: '/api/feedback-analytics',
            maxRetries: 3,
            debounceTime: 500
        };

        this.feedbackTypes = {
            bug: {
                icon: '🐛',
                label: '报告问题',
                color: '#ff4757',
                fields: ['description', 'steps', 'expected', 'actual']
            },
            feature: {
                icon: '💡',
                label: '功能建议',
                color: '#3742fa',
                fields: ['description', 'useCase', 'priority']
            },
            general: {
                icon: '💬',
                label: '一般反馈',
                color: '#2ed573',
                fields: ['rating', 'comment', 'improvement']
            },
            audio: {
                icon: '🎵',
                label: '音频问题',
                color: '#ffa502',
                fields: ['audioTrack', 'issue', 'device', 'browser']
            }
        };

        this.state = {
            actionCount: 0,
            lastPromptTime: 0,
            feedbackSubmitted: false,
            sessionData: {
                startTime: Date.now(),
                actions: [],
                errors: [],
                performance: {}
            }
        };

        this.init();
    }

    init() {
        this.createFeedbackWidget();
        this.setupAutoPrompt();
        this.trackUserActions();
        this.setupErrorTracking();
        this.setupPerformanceTracking();
        this.loadFeedbackHistory();

        console.log('📝 Feedback System initialized');
    }

    /**
     * 创建反馈小部件
     */
    createFeedbackWidget() {
        // 创建浮动按钮
        const feedbackButton = document.createElement('div');
        feedbackButton.id = 'feedback-button';
        feedbackButton.innerHTML = `
            <div class="feedback-icon">💬</div>
            <div class="feedback-tooltip">反馈建议</div>
        `;
        feedbackButton.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            width: 56px;
            height: 56px;
            background: #667eea;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            transition: all 0.3s ease;
            opacity: 0.9;
        `;

        // 创建反馈模态框
        const feedbackModal = document.createElement('div');
        feedbackModal.id = 'feedback-modal';
        feedbackModal.innerHTML = `
            <div class="feedback-backdrop"></div>
            <div class="feedback-content">
                <div class="feedback-header">
                    <h3>您的反馈对我们很重要</h3>
                    <button class="feedback-close">&times;</button>
                </div>
                <div class="feedback-body">
                    <div class="feedback-types">
                        ${Object.entries(this.feedbackTypes).map(([key, type]) => `
                            <button class="feedback-type-btn" data-type="${key}">
                                <span class="type-icon">${type.icon}</span>
                                <span class="type-label">${type.label}</span>
                            </button>
                        `).join('')}
                    </div>
                    <div class="feedback-form" id="feedback-form-container">
                        <!-- 动态生成表单 -->
                    </div>
                </div>
                <div class="feedback-footer">
                    <button class="feedback-submit" disabled>提交反馈</button>
                    <button class="feedback-cancel">取消</button>
                </div>
            </div>
        `;

        // 添加样式
        this.addFeedbackStyles();

        // 添加到页面
        document.body.appendChild(feedbackButton);
        document.body.appendChild(feedbackModal);

        // 绑定事件
        this.bindFeedbackEvents();
    }

    /**
     * 添加反馈系统样式
     */
    addFeedbackStyles() {
        const styles = `
            <style id="feedback-styles">
                #feedback-button:hover {
                    transform: scale(1.1);
                    opacity: 1;
                }

                .feedback-tooltip {
                    position: absolute;
                    right: 70px;
                    background: #333;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 14px;
                    white-space: nowrap;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.3s;
                }

                #feedback-button:hover .feedback-tooltip {
                    opacity: 1;
                }

                #feedback-modal {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10000;
                    animation: fadeIn 0.3s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .feedback-backdrop {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                }

                .feedback-content {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 500px;
                    max-height: 80vh;
                    overflow: auto;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                }

                .feedback-header {
                    padding: 24px;
                    border-bottom: 1px solid #e0e0e0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .feedback-header h3 {
                    margin: 0;
                    font-size: 20px;
                    color: #333;
                }

                .feedback-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                    padding: 0;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: background 0.2s;
                }

                .feedback-close:hover {
                    background: #f0f0f0;
                }

                .feedback-body {
                    padding: 24px;
                }

                .feedback-types {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 12px;
                    margin-bottom: 24px;
                }

                .feedback-type-btn {
                    padding: 16px;
                    border: 2px solid #e0e0e0;
                    background: white;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }

                .feedback-type-btn:hover {
                    border-color: #667eea;
                    background: #f8f9ff;
                }

                .feedback-type-btn.selected {
                    border-color: #667eea;
                    background: #667eea;
                    color: white;
                }

                .type-icon {
                    font-size: 24px;
                }

                .type-label {
                    font-size: 14px;
                    font-weight: 500;
                }

                .feedback-form {
                    display: none;
                }

                .feedback-form.active {
                    display: block;
                    animation: slideIn 0.3s ease;
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .form-group {
                    margin-bottom: 16px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 6px;
                    font-weight: 500;
                    color: #333;
                }

                .form-group input,
                .form-group textarea,
                .form-group select {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 14px;
                    transition: border-color 0.2s;
                }

                .form-group input:focus,
                .form-group textarea:focus,
                .form-group select:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 255, 0.1);
                }

                .form-group textarea {
                    resize: vertical;
                    min-height: 100px;
                }

                .rating-group {
                    display: flex;
                    gap: 8px;
                    font-size: 24px;
                }

                .rating-star {
                    cursor: pointer;
                    color: #ddd;
                    transition: color 0.2s;
                }

                .rating-star:hover,
                .rating-star.active {
                    color: #ffd700;
                }

                .feedback-footer {
                    padding: 24px;
                    border-top: 1px solid #e0e0e0;
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }

                .feedback-submit {
                    background: #667eea;
                    color: white;
                    border: none;
                    padding: 10px 24px;
                    border-radius: 6px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .feedback-submit:hover:not(:disabled) {
                    background: #5569d8;
                }

                .feedback-submit:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .feedback-cancel {
                    background: white;
                    color: #666;
                    border: 1px solid #ddd;
                    padding: 10px 24px;
                    border-radius: 6px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .feedback-cancel:hover {
                    background: #f5f5f5;
                }

                .feedback-success {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #2ed573;
                    color: white;
                    padding: 16px 24px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 10001;
                    animation: slideInRight 0.3s ease;
                }

                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }

                /* 响应式设计 */
                @media (max-width: 600px) {
                    .feedback-content {
                        width: 95%;
                        margin: 20px;
                    }

                    .feedback-types {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    /**
     * 绑定反馈事件
     */
    bindFeedbackEvents() {
        const feedbackButton = document.getElementById('feedback-button');
        const feedbackModal = document.getElementById('feedback-modal');
        const feedbackClose = feedbackModal.querySelector('.feedback-close');
        const feedbackCancel = feedbackModal.querySelector('.feedback-cancel');
        const feedbackSubmit = feedbackModal.querySelector('.feedback-submit');
        const feedbackBackdrop = feedbackModal.querySelector('.feedback-backdrop');

        // 打开反馈模态框
        feedbackButton.addEventListener('click', () => {
            this.openFeedbackModal();
        });

        // 关闭模态框
        const closeModal = () => {
            this.closeFeedbackModal();
        };

        feedbackClose.addEventListener('click', closeModal);
        feedbackCancel.addEventListener('click', closeModal);
        feedbackBackdrop.addEventListener('click', closeModal);

        // 反馈类型选择
        feedbackModal.querySelectorAll('.feedback-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectFeedbackType(btn.dataset.type);
            });
        });

        // 提交反馈
        feedbackSubmit.addEventListener('click', () => {
            this.submitFeedback();
        });

        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && feedbackModal.style.display === 'block') {
                closeModal();
            }
        });
    }

    /**
     * 打开反馈模态框
     */
    openFeedbackModal() {
        const modal = document.getElementById('feedback-modal');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    /**
     * 关闭反馈模态框
     */
    closeFeedbackModal() {
        const modal = document.getElementById('feedback-modal');
        modal.style.display = 'none';
        document.body.style.overflow = '';

        // 重置表单
        this.resetFeedbackForm();
    }

    /**
     * 选择反馈类型
     */
    selectFeedbackType(type) {
        // 更新按钮状态
        document.querySelectorAll('.feedback-type-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.querySelector(`[data-type="${type}"]`).classList.add('selected');

        // 生成表单
        this.generateFeedbackForm(type);
    }

    /**
     * 生成反馈表单
     */
    generateFeedbackForm(type) {
        const formContainer = document.getElementById('feedback-form-container');
        const feedbackType = this.feedbackTypes[type];

        let formHTML = '<div class="feedback-form active">';

        // 根据类型生成不同字段
        switch(type) {
            case 'bug':
                formHTML += `
                    <div class="form-group">
                        <label>问题描述 *</label>
                        <textarea name="description" placeholder="请详细描述您遇到的问题" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>复现步骤</label>
                        <textarea name="steps" placeholder="请列出重现问题的步骤"></textarea>
                    </div>
                    <div class="form-group">
                        <label>期望结果</label>
                        <input type="text" name="expected" placeholder="您期望发生什么">
                    </div>
                    <div class="form-group">
                        <label>实际结果</label>
                        <input type="text" name="actual" placeholder="实际发生了什么">
                    </div>
                `;
                break;

            case 'feature':
                formHTML += `
                    <div class="form-group">
                        <label>功能描述 *</label>
                        <textarea name="description" placeholder="请描述您希望添加的功能" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>使用场景</label>
                        <textarea name="useCase" placeholder="这个功能会在什么情况下使用？"></textarea>
                    </div>
                    <div class="form-group">
                        <label>优先级</label>
                        <select name="priority">
                            <option value="low">低 - 有更好</option>
                            <option value="medium">中 - 需要但不是紧急</option>
                            <option value="high">高 - 非常需要</option>
                            <option value="critical">紧急 - 必须有</option>
                        </select>
                    </div>
                `;
                break;

            case 'general':
                formHTML += `
                    <div class="form-group">
                        <label>总体评分</label>
                        <div class="rating-group">
                            ${[1,2,3,4,5].map(i => `
                                <span class="rating-star" data-rating="${i}">★</span>
                            `).join('')}
                        </div>
                    </div>
                    <div class="form-group">
                        <label>您的反馈 *</label>
                        <textarea name="comment" placeholder="请分享您的想法和建议" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>如何改进？</label>
                        <textarea name="improvement" placeholder="您认为我们可以在哪些方面改进？"></textarea>
                    </div>
                `;
                break;

            case 'audio':
                formHTML += `
                    <div class="form-group">
                        <label>音频名称</label>
                        <select name="audioTrack">
                            <option value="">请选择音频</option>
                            <option value="meditation-01">冥想音乐 01</option>
                            <option value="rain-01">雨声 01</option>
                            <option value="singing-bowl-01">颂钵 01</option>
                            <option value="other">其他</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>问题类型</label>
                        <select name="issue">
                            <option value="">请选择</option>
                            <option value="loading">加载失败</option>
                            <option value="quality">音质问题</option>
                            <option value="playback">播放问题</option>
                            <option value="download">下载问题</option>
                            <option value="other">其他</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>设备类型</label>
                        <select name="device">
                            <option value="">请选择</option>
                            <option value="desktop">桌面电脑</option>
                            <option value="mobile">手机</option>
                            <option value="tablet">平板</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>浏览器</label>
                        <input type="text" name="browser" placeholder="例如：Chrome 91" value="${navigator.userAgent.split(' ').slice(-2).join(' ')}">
                    </div>
                `;
                break;
        }

        // 添加通用字段
        formHTML += `
            <div class="form-group">
                <label>联系邮箱（可选）</label>
                <input type="email" name="email" placeholder="如需回复请留下邮箱">
            </div>
        </div>`;

        formContainer.innerHTML = formHTML;

        // 绑定评分事件
        if (type === 'general') {
            this.bindRatingEvents();
        }

        // 绑定表单验证
        this.bindFormValidation();
    }

    /**
     * 绑定评分事件
     */
    bindRatingEvents() {
        const stars = document.querySelectorAll('.rating-star');
        let rating = 0;

        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                rating = index + 1;
                updateStars(rating);
            });

            star.addEventListener('mouseenter', () => {
                updateStars(index + 1);
            });
        });

        const ratingGroup = document.querySelector('.rating-group');
        ratingGroup.addEventListener('mouseleave', () => {
            updateStars(rating);
        });

        function updateStars(value) {
            stars.forEach((star, index) => {
                star.classList.toggle('active', index < value);
            });
        }
    }

    /**
     * 绑定表单验证
     */
    bindFormValidation() {
        const form = document.querySelector('.feedback-form');
        const submitBtn = document.querySelector('.feedback-submit');
        const inputs = form.querySelectorAll('input[required], textarea[required]');

        const validateForm = () => {
            let isValid = true;
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                }
            });
            submitBtn.disabled = !isValid;
        };

        inputs.forEach(input => {
            input.addEventListener('input', debounce(validateForm, this.config.debounceTime));
        });
    }

    /**
     * 提交反馈
     */
    async submitFeedback() {
        const formData = this.collectFormData();

        if (!this.validateFormData(formData)) {
            this.showError('请填写必填项');
            return;
        }

        const submitBtn = document.querySelector('.feedback-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = '提交中...';

        try {
            // 添加会话数据
            formData.sessionData = this.state.sessionData;
            formData.timestamp = Date.now();
            formData.userAgent = navigator.userAgent;
            formData.url = window.location.href;

            // 发送反馈
            const response = await this.sendFeedback(formData);

            if (response.success) {
                this.showSuccess('感谢您的反馈！我们会认真处理。');
                this.closeFeedbackModal();
                this.state.feedbackSubmitted = true;

                // 触发分析事件
                this.trackFeedbackSubmission(formData);
            } else {
                throw new Error(response.message || '提交失败');
            }
        } catch (error) {
            console.error('Feedback submission error:', error);
            this.showError('提交失败，请稍后重试');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '提交反馈';
        }
    }

    /**
     * 收集表单数据
     */
    collectFormData() {
        const formData = {};
        const form = document.querySelector('.feedback-form');

        // 获取选中的反馈类型
        const selectedType = document.querySelector('.feedback-type-btn.selected');
        formData.type = selectedType ? selectedType.dataset.type : null;

        // 收集表单字段
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.name) {
                formData[input.name] = input.value;
            }
        });

        // 收集评分
        const activeStars = form.querySelectorAll('.rating-star.active');
        if (activeStars.length > 0) {
            formData.rating = activeStars.length;
        }

        return formData;
    }

    /**
     * 验证表单数据
     */
    validateFormData(data) {
        if (!data.type) return false;

        const requiredFields = {
            bug: ['description'],
            feature: ['description'],
            general: ['comment'],
            audio: []
        };

        const fields = requiredFields[data.type] || [];
        return fields.every(field => data[field] && data[field].trim());
    }

    /**
     * 发送反馈
     */
    async sendFeedback(data) {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };

        for (let i = 0; i < this.config.maxRetries; i++) {
            try {
                const response = await fetch(this.config.feedbackEndpoint, options);
                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                console.warn(`Feedback submission attempt ${i + 1} failed:`, error);
                if (i === this.config.maxRetries - 1) {
                    // 存储到本地
                    this.storeFeedbackLocally(data);
                    return { success: true, storedLocally: true };
                }
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }

        throw new Error('Max retries exceeded');
    }

    /**
     * 本地存储反馈
     */
    storeFeedbackLocally(data) {
        const stored = JSON.parse(localStorage.getItem('pendingFeedback') || '[]');
        stored.push(data);
        localStorage.setItem('pendingFeedback', JSON.stringify(stored));
    }

    /**
     * 显示成功消息
     */
    showSuccess(message) {
        this.showToast(message, 'success');
    }

    /**
     * 显示错误消息
     */
    showError(message) {
        this.showToast(message, 'error');
    }

    /**
     * 显示提示消息
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `feedback-toast feedback-${type}`;
        toast.textContent = message;

        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10001;
            animation: slideInRight 0.3s ease;
            ${type === 'success' ? 'background: #2ed573;' : ''}
            ${type === 'error' ? 'background: #ff4757;' : ''}
            ${type === 'info' ? 'background: #667eea;' : ''}
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * 重置反馈表单
     */
    resetFeedbackForm() {
        document.querySelectorAll('.feedback-type-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.getElementById('feedback-form-container').innerHTML = '';
        document.querySelector('.feedback-submit').disabled = true;
    }

    /**
     * 设置自动提示
     */
    setupAutoPrompt() {
        if (!this.config.autoPrompt) return;

        // 延时提示
        setTimeout(() => {
            if (!this.state.feedbackSubmitted && this.shouldShowPrompt()) {
                this.showFeedbackPrompt();
            }
        }, this.config.promptDelay);

        // 操作次数提示
        this.checkActionCount();
    }

    /**
     * 检查是否应该显示提示
     */
    shouldShowPrompt() {
        const timeSinceLastPrompt = Date.now() - this.state.lastPromptTime;
        return timeSinceLastPrompt > 24 * 60 * 60 * 1000; // 24小时
    }

    /**
     * 显示反馈提示
     */
    showFeedbackPrompt() {
        const prompt = document.createElement('div');
        prompt.className = 'feedback-prompt';
        prompt.innerHTML = `
            <div class="prompt-content">
                <span>👋 您觉得声音疗愈空间怎么样？</span>
                <div class="prompt-actions">
                    <button class="prompt-yes">很好</button>
                    <button class="prompt-no">有建议</button>
                    <button class="prompt-dismiss">稍后</button>
                </div>
            </div>
        `;

        prompt.style.cssText = `
            position: fixed;
            bottom: 150px;
            right: 20px;
            background: white;
            padding: 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 999;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;

        document.body.appendChild(prompt);

        // 绑定事件
        prompt.querySelector('.prompt-yes').addEventListener('click', () => {
            this.trackQuickFeedback('positive');
            prompt.remove();
        });

        prompt.querySelector('.prompt-no').addEventListener('click', () => {
            this.openFeedbackModal();
            prompt.remove();
        });

        prompt.querySelector('.prompt-dismiss').addEventListener('click', () => {
            prompt.remove();
        });

        // 自动移除
        setTimeout(() => {
            if (prompt.parentNode) {
                prompt.remove();
            }
        }, 10000);

        this.state.lastPromptTime = Date.now();
    }

    /**
     * 跟踪用户操作
     */
    trackUserActions() {
        const actions = [
            'play',
            'pause',
            'volume-change',
            'category-change',
            'playlist-create',
            'favorite-add'
        ];

        actions.forEach(action => {
            document.addEventListener(action === 'category-change' ? 'click' : action, () => {
                this.state.actionCount++;
                this.state.sessionData.actions.push({
                    action: action,
                    timestamp: Date.now()
                });
                this.checkActionCount();
            });
        });
    }

    /**
     * 检查操作次数
     */
    checkActionCount() {
        if (this.state.actionCount >= this.config.promptAfterActions && !this.state.feedbackSubmitted) {
            this.showFeedbackPrompt();
            this.state.actionCount = 0; // 重置计数
        }
    }

    /**
     * 设置错误跟踪
     */
    setupErrorTracking() {
        window.addEventListener('error', (event) => {
            this.state.sessionData.errors.push({
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                timestamp: Date.now()
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.state.sessionData.errors.push({
                type: 'unhandledrejection',
                reason: event.reason,
                timestamp: Date.now()
            });
        });
    }

    /**
     * 设置性能跟踪
     */
    setupPerformanceTracking() {
        if (window.performanceAnalytics) {
            setInterval(() => {
                this.state.sessionData.performance = window.performanceAnalytics.getMetrics();
            }, 60000); // 每分钟记录一次
        }
    }

    /**
     * 加载反馈历史
     */
    loadFeedbackHistory() {
        const history = JSON.parse(localStorage.getItem('feedbackHistory') || '[]');
        this.feedbackHistory = history;
    }

    /**
     * 跟踪反馈提交
     */
    trackFeedbackSubmission(data) {
        // 保存到历史
        this.feedbackHistory.push({
            type: data.type,
            timestamp: Date.now(),
            rating: data.rating
        });

        // 只保留最近10条
        if (this.feedbackHistory.length > 10) {
            this.feedbackHistory.shift();
        }

        localStorage.setItem('feedbackHistory', JSON.stringify(this.feedbackHistory));

        // 发送分析事件
        if (window.gtag) {
            window.gtag('event', 'feedback_submitted', {
                feedback_type: data.type,
                rating: data.rating
            });
        }

        if (window.amplitude) {
            window.amplitude.track('Feedback Submitted', {
                type: data.type,
                rating: data.rating,
                hasError: this.state.sessionData.errors.length > 0
            });
        }
    }

    /**
     * 跟踪快速反馈
     */
    trackQuickFeedback(sentiment) {
        if (window.gtag) {
            window.gtag('event', 'quick_feedback', {
                sentiment: sentiment
            });
        }

        if (window.amplitude) {
            window.amplitude.track('Quick Feedback', {
                sentiment: sentiment
            });
        }
    }

    /**
     * 获取反馈分析
     */
    async getFeedbackAnalytics() {
        try {
            const response = await fetch(this.config.analyticsEndpoint);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            return null;
        }
    }

    /**
     * 公共API - 获取反馈统计
     */
    getFeedbackStats() {
        return {
            submittedToday: this.feedbackHistory.filter(f =>
                Date.now() - f.timestamp < 24 * 60 * 60 * 1000
            ).length,
            totalSubmitted: this.feedbackHistory.length,
            averageRating: this.calculateAverageRating(),
            commonIssues: this.getCommonIssues()
        };
    }

    /**
     * 计算平均评分
     */
    calculateAverageRating() {
        const ratings = this.feedbackHistory
            .filter(f => f.rating)
            .map(f => f.rating);

        if (ratings.length === 0) return null;
        return ratings.reduce((a, b) => a + b, 0) / ratings.length;
    }

    /**
     * 获取常见问题
     */
    getCommonIssues() {
        const issues = {};
        this.feedbackHistory.forEach(f => {
            if (f.type === 'bug') {
                issues[f.type] = (issues[f.type] || 0) + 1;
            }
        });
        return issues;
    }
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 初始化反馈系统
window.feedbackSystem = new FeedbackSystem();

// 导出
window.FeedbackSystem = FeedbackSystem;