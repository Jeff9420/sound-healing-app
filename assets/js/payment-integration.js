/**
 * 支付集成 - Stripe 简化实现
 * 为声音疗愈应用添加付费功能
 * 
 * @date 2025-09-08
 */

class PaymentManager {
    constructor() {
        this.stripe = null;
        this.isInitialized = false;
        this.plans = {
            monthly: {
                id: 'price_monthly_premium',
                name: '高级版 - 月付',
                price: 4.99,
                interval: 'month'
            },
            yearly: {
                id: 'price_yearly_premium', 
                name: '高级版 - 年付',
                price: 29.99,
                interval: 'year'
            }
        };
        
        this.initializeStripe();
    }
    
    /**
     * 初始化 Stripe
     */
    async initializeStripe() {
        try {
            // 加载 Stripe.js
            if (!window.Stripe) {
                await this.loadStripeScript();
            }
            
            // 初始化 Stripe（需要您的公开密钥）
            this.stripe = Stripe('pk_test_YOUR_PUBLISHABLE_KEY_HERE');
            this.isInitialized = true;
            
            console.log('💳 Stripe 支付系统已初始化');
            
        } catch (error) {
            console.error('❌ Stripe 初始化失败:', error);
        }
    }
    
    /**
     * 加载 Stripe 脚本
     */
    loadStripeScript() {
        return new Promise((resolve, reject) => {
            if (window.Stripe) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    /**
     * 创建付费会话
     */
    async createCheckoutSession(planId = 'monthly') {
        if (!this.isInitialized) {
            throw new Error('支付系统未初始化');
        }
        
        const plan = this.plans[planId];
        if (!plan) {
            throw new Error('无效的付费计划');
        }
        
        try {
            // 调用后端创建会话（需要实现后端端点）
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    priceId: plan.id,
                    successUrl: window.location.origin + '/success',
                    cancelUrl: window.location.origin + '/canceled'
                })
            });
            
            const session = await response.json();
            
            // 重定向到 Stripe Checkout
            const result = await this.stripe.redirectToCheckout({
                sessionId: session.id
            });
            
            if (result.error) {
                throw new Error(result.error.message);
            }
            
        } catch (error) {
            console.error('❌ 创建付费会话失败:', error);
            this.showPaymentError(error.message);
        }
    }
    
    /**
     * 检查订阅状态
     */
    async checkSubscriptionStatus() {
        try {
            const response = await fetch('/api/subscription-status', {
                method: 'GET',
                credentials: 'include'
            });
            
            const data = await response.json();
            return data.isActive || false;
            
        } catch (error) {
            console.warn('⚠️ 检查订阅状态失败:', error);
            return false;
        }
    }
    
    /**
     * 显示付费弹窗
     */
    showUpgradeModal(feature = '高级功能') {
        const modal = document.createElement('div');
        modal.className = 'payment-modal';
        modal.innerHTML = `
            <div class="payment-modal-content">
                <div class="payment-header">
                    <h2>🌟 升级到高级版</h2>
                    <button class="payment-close">&times;</button>
                </div>
                
                <div class="payment-body">
                    <p>您正在尝试使用「${feature}」，这是高级版专享功能</p>
                    
                    <div class="payment-benefits">
                        <h3>高级版包含：</h3>
                        <ul>
                            <li>✅ 解锁全部9个音频分类</li>
                            <li>✅ 213+个高质量音频文件</li>
                            <li>✅ 高级背景动画场景</li>
                            <li>✅ 音频下载功能</li>
                            <li>✅ 睡眠定时器</li>
                            <li>✅ 无广告纯净体验</li>
                        </ul>
                    </div>
                    
                    <div class="payment-plans">
                        <div class="plan-card" data-plan="monthly">
                            <h4>月付计划</h4>
                            <div class="plan-price">$4.99<span>/月</span></div>
                            <button class="plan-select-btn" data-plan="monthly">
                                选择月付
                            </button>
                        </div>
                        
                        <div class="plan-card recommended" data-plan="yearly">
                            <div class="plan-badge">推荐</div>
                            <h4>年付计划</h4>
                            <div class="plan-price">$29.99<span>/年</span></div>
                            <div class="plan-save">节省 $30</div>
                            <button class="plan-select-btn" data-plan="yearly">
                                选择年付
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 绑定事件
        modal.querySelector('.payment-close').onclick = () => modal.remove();
        modal.onclick = (e) => e.target === modal && modal.remove();
        
        modal.querySelectorAll('.plan-select-btn').forEach(btn => {
            btn.onclick = () => {
                const planId = btn.dataset.plan;
                modal.remove();
                this.createCheckoutSession(planId);
            };
        });
        
        // 添加样式
        this.addPaymentModalStyles();
    }
    
    /**
     * 添加支付弹窗样式
     */
    addPaymentModalStyles() {
        if (document.querySelector('#payment-modal-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'payment-modal-styles';
        styles.textContent = `
            .payment-modal {
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
                animation: fadeIn 0.3s ease;
            }
            
            .payment-modal-content {
                background: var(--card-bg, #fff);
                border-radius: 16px;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                animation: slideUp 0.3s ease;
            }
            
            .payment-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 24px;
                border-bottom: 1px solid var(--border-color, #eee);
            }
            
            .payment-header h2 {
                margin: 0;
                color: var(--text-color, #333);
            }
            
            .payment-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: var(--text-color, #666);
            }
            
            .payment-body {
                padding: 24px;
            }
            
            .payment-benefits ul {
                list-style: none;
                padding: 0;
            }
            
            .payment-benefits li {
                padding: 8px 0;
                color: var(--text-color, #333);
            }
            
            .payment-plans {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                margin-top: 24px;
            }
            
            .plan-card {
                border: 2px solid var(--border-color, #eee);
                border-radius: 12px;
                padding: 20px;
                text-align: center;
                position: relative;
                transition: all 0.3s ease;
            }
            
            .plan-card:hover {
                border-color: var(--primary-color, #007bff);
                transform: translateY(-2px);
            }
            
            .plan-card.recommended {
                border-color: var(--primary-color, #007bff);
                background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
            }
            
            .plan-badge {
                position: absolute;
                top: -10px;
                right: 16px;
                background: var(--primary-color, #007bff);
                color: white;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
            }
            
            .plan-price {
                font-size: 24px;
                font-weight: bold;
                color: var(--primary-color, #007bff);
                margin: 12px 0;
            }
            
            .plan-price span {
                font-size: 14px;
                color: var(--text-muted, #666);
            }
            
            .plan-save {
                color: var(--success-color, #28a745);
                font-size: 14px;
                margin-bottom: 16px;
            }
            
            .plan-select-btn {
                width: 100%;
                padding: 12px;
                background: var(--primary-color, #007bff);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                transition: background 0.3s ease;
            }
            
            .plan-select-btn:hover {
                background: var(--primary-color-dark, #0056b3);
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            @media (max-width: 600px) {
                .payment-plans {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
    
    /**
     * 显示支付错误
     */
    showPaymentError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'payment-error-toast';
        errorDiv.textContent = `支付错误: ${message}`;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10001;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
    
    /**
     * 本地订阅状态管理（简化版）
     */
    setLocalPremiumStatus(isPremium, expiryDate = null) {
        const premiumData = {
            isPremium: isPremium,
            expiryDate: expiryDate,
            updatedAt: Date.now()
        };
        
        localStorage.setItem('premium_status', JSON.stringify(premiumData));
        
        // 触发状态更新事件
        window.dispatchEvent(new CustomEvent('premiumStatusChanged', {
            detail: premiumData
        }));
    }
    
    /**
     * 获取本地订阅状态
     */
    getLocalPremiumStatus() {
        try {
            const data = localStorage.getItem('premium_status');
            if (!data) return { isPremium: false };
            
            const premiumData = JSON.parse(data);
            
            // 检查是否过期
            if (premiumData.expiryDate && Date.now() > premiumData.expiryDate) {
                this.setLocalPremiumStatus(false);
                return { isPremium: false };
            }
            
            return premiumData;
            
        } catch (error) {
            console.warn('⚠️ 读取订阅状态失败:', error);
            return { isPremium: false };
        }
    }
}

// 创建全局实例
window.paymentManager = new PaymentManager();

// 监听订阅状态变化
window.addEventListener('premiumStatusChanged', (event) => {
    const { isPremium } = event.detail;
    console.log(`💎 订阅状态更新: ${isPremium ? '已订阅' : '未订阅'}`);
    
    // 可以在这里更新UI，显示/隐藏付费内容
    if (window.audioManager) {
        window.audioManager.updatePremiumAccess(isPremium);
    }
});

console.log('💳 支付管理器已加载');