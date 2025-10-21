/**
 * Firebase Authentication Manager (UI Bridge)
 * Firebase认证管理器 (UI桥接)
 *
 * @version 2.0.0
 * @date 2025-01-20
 */

class FirebaseAuthManager {
    constructor() {
        this.auth = null;
        this.currentUser = null;
        this.authUI = null;

        this.init();
    }

    /**
     * 初始化认证管理器
     */
    init() {
        console.log('🔐 初始化Firebase认证管理器...');

        try {
            // 等待一秒钟确保Firebase模块加载
            setTimeout(() => {
                // 尝试导入Firebase Auth
                import('./firebase-auth.js').then(({ auth, onAuthStateChanged }) => {
                    this.auth = auth;
                    console.log('✅ Firebase Auth模块加载成功');

                    // 设置认证状态监听
                    onAuthStateChanged((user) => {
                        this.currentUser = user;
                        console.log('🔐 认证状态更新:', user ? '已登录' : '未登录');
                        this.updateUI(user);
                    });

                }).catch(error => {
                    console.warn('⚠️ Firebase Auth模块加载失败，使用匿名模式:', error);
                    this.setupAnonymousMode();
                });
            }, 1000);

        } catch (error) {
            console.warn('⚠️ Firebase Auth初始化失败，使用匿名模式:', error);
            this.setupAnonymousMode();
        }
    }

    /**
     * 设置匿名模式
     */
    setupAnonymousMode() {
        this.currentUser = null;
        console.log('🔐 使用匿名模式');
        // 隐藏登录相关UI或显示简化版本
        this.updateUI(null);
    }

    
    /**
     * Google登录
     */
    async signInWithGoogle() {
        try {
            if (!this.auth) {
                throw new Error('Firebase Auth 未初始化');
            }

            // 动态导入所需的函数
            const { signInWithPopup, GoogleAuthProvider } = await import('./firebase-auth.js');
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(this.auth, provider);

            window.showNotification('✅ Login successful!', 'success');

            // 跟踪事件
            if (typeof gtag !== 'undefined') {
                gtag('event', 'login', {
                    method: 'Google'
                });
            }

            return result.user;
        } catch (error) {
            console.error('❌ Google login failed:', error);
            window.showNotification('Login failed: ' + error.message, 'error');
            return null;
        }
    }

    /**
     * 邮箱密码登录
     */
    async signInWithEmail(email, password) {
        try {
            if (!this.auth) {
                throw new Error('Firebase Auth 未初始化');
            }

            // 动态导入所需的函数
            const { signInWithEmailAndPassword } = await import('./firebase-auth.js');
            const result = await signInWithEmailAndPassword(this.auth, email, password);
            window.showNotification('✅ Login successful!', 'success');

            if (typeof gtag !== 'undefined') {
                gtag('event', 'login', {
                    method: 'Email'
                });
            }

            return result.user;
        } catch (error) {
            console.error('❌ Email login failed:', error);
            window.showNotification('Login failed: ' + error.message, 'error');
            return null;
        }
    }

    /**
     * 邮箱密码注册
     */
    async signUpWithEmail(email, password, displayName) {
        try {
            if (!this.auth) {
                throw new Error('Firebase Auth 未初始化');
            }

            // 动态导入所需的函数
            const { createUserWithEmailAndPassword } = await import('./firebase-auth.js');
            const result = await createUserWithEmailAndPassword(this.auth, email, password);

            // 更新用户名
            if (displayName) {
                await result.user.updateProfile({
                    displayName: displayName
                });
            }

            window.showNotification('✅ Registration successful!', 'success');

            if (typeof gtag !== 'undefined') {
                gtag('event', 'sign_up', {
                    method: 'Email'
                });
            }

            return result.user;
        } catch (error) {
            console.error('❌ Registration failed:', error);
            window.showNotification('Registration failed: ' + error.message, 'error');
            return null;
        }
    }

    /**
     * 匿名登录
     */
    async signInAnonymously() {
        try {
            if (!this.auth) {
                throw new Error('Firebase Auth 未初始化');
            }

            const result = await this.auth.signInAnonymously();
            window.showNotification('✅ 已进入匿名模式', 'info');
            return result.user;
        } catch (error) {
            console.error('❌ 匿名登录失败:', error);
            return null;
        }
    }

    /**
     * 登出
     */
    async signOut() {
        try {
            if (!this.auth) {
                throw new Error('Firebase Auth 未初始化');
            }

            // 动态导入所需的函数
            const { signOut } = await import('./firebase-auth.js');
            await signOut(this.auth);
            window.showNotification('✅ Logged out successfully', 'success');

            if (typeof gtag !== 'undefined') {
                gtag('event', 'logout');
            }
        } catch (error) {
            console.error('❌ Logout failed:', error);
            window.showNotification('Logout failed: ' + error.message, 'error');
        }
    }

    /**
     * 发送密码重置邮件
     */
    async sendPasswordResetEmail(email) {
        try {
            if (!this.auth) {
                throw new Error('Firebase Auth 未初始化');
            }

            // 动态导入所需的函数
            const { sendPasswordResetEmail } = await import('./firebase-auth.js');
            await sendPasswordResetEmail(this.auth, email);
            window.showNotification('✅ Password reset email sent', 'success');
            return true;
        } catch (error) {
            console.error('❌ Password reset failed:', error);
            window.showNotification('Reset failed: ' + error.message, 'error');
            return false;
        }
    }

    /**
     * 更新用户信息
     */
    async updateUserProfile(displayName, photoURL) {
        try {
            if (!this.currentUser) {
                throw new Error('用户未登录');
            }

            await this.currentUser.updateProfile({
                displayName: displayName || this.currentUser.displayName,
                photoURL: photoURL || this.currentUser.photoURL
            });

            window.showNotification('✅ 个人信息已更新', 'success');
            return true;
        } catch (error) {
            console.error('❌ 更新失败:', error);
            window.showNotification('更新失败: ' + error.message, 'error');
            return false;
        }
    }

    /**
     * 更新UI
     */
    updateUI(user) {
        const authContainer = document.getElementById('authContainer');
        const userProfile = document.getElementById('userProfile');

        if (user) {
            // 显示用户信息
            if (userProfile) {
                userProfile.innerHTML = `
                    <div class="user-info">
                        <img src="${user.photoURL || 'assets/images/default-avatar.png'}"
                             alt="${user.displayName || 'User'}"
                             class="user-avatar">
                        <span class="user-name">${user.displayName || user.email || '匿名用户'}</span>
                        <button onclick="window.firebaseAuthManager.signOut()" class="btn-signout">
                            退出
                        </button>
                    </div>
                `;
            }

            // 隐藏登录按钮
            if (authContainer) {
                authContainer.style.display = 'none';
            }
        } else {
            // 显示登录按钮
            if (authContainer) {
                authContainer.style.display = 'block';
            }

            // 清空用户信息
            if (userProfile) {
                userProfile.innerHTML = '';
            }
        }
    }

    /**
     * 打开登录对话框
     */
    openAuthDialog() {
        const dialog = document.getElementById('authDialog');
        if (dialog) {
            dialog.style.display = 'flex';

            // 手动更新认证对话框的多语言文本
            this.updateAuthDialogTranslations();
        }
    }

    /**
     * 关闭登录对话框
     */
    closeAuthDialog() {
        const dialog = document.getElementById('authDialog');
        if (dialog) {
            dialog.style.display = 'none';
        }
    }

    /**
     * 获取当前用户
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * 更新认证对话框的多语言文本
     */
    updateAuthDialogTranslations() {
        if (!window.getI18nText) return;

        // 更新所有带data-i18n属性的元素
        const elementsToUpdate = [
            // 标题和按钮
            { selector: '[data-i18n="auth.title"]', key: 'auth.title' },
            { selector: '[data-i18n="auth.login"]', key: 'auth.login' },
            { selector: '[data-i18n="auth.signup"]', key: 'auth.signup' },
            { selector: '[data-i18n="auth.reset"]', key: 'auth.reset' },
            { selector: '[data-i18n="auth.close"]', key: 'auth.close' },

            // 表单标签
            { selector: '[data-i18n="auth.email"]', key: 'auth.email' },
            { selector: '[data-i18n="auth.password"]', key: 'auth.password' },
            { selector: '[data-i18n="auth.displayName"]', key: 'auth.displayName' },

            // 表单按钮
            { selector: '[data-i18n="auth.loginButton"]', key: 'auth.loginButton' },
            { selector: '[data-i18n="auth.signupButton"]', key: 'auth.signupButton' },
            { selector: '[data-i18n="auth.googleLogin"]', key: 'auth.googleLogin' },
            { selector: '[data-i18n="auth.anonymousLogin"]', key: 'auth.anonymousLogin' },
            { selector: '[data-i18n="auth.resetButton"]', key: 'auth.resetButton' }
        ];

        elementsToUpdate.forEach(({ selector, key }) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                const translatedText = window.getI18nText(key);
                if (translatedText && element.textContent !== translatedText) {
                    element.textContent = translatedText;
                }
            });
        });

        // 更新placeholder属性
        const placeholderElements = [
            { selector: '[data-i18n-placeholder="auth.emailPlaceholder"]', key: 'auth.emailPlaceholder' },
            { selector: '[data-i18n-placeholder="auth.passwordPlaceholder"]', key: 'auth.passwordPlaceholder' },
            { selector: '[data-i18n-placeholder="auth.displayNamePlaceholder"]', key: 'auth.displayNamePlaceholder' }
        ];

        placeholderElements.forEach(({ selector, key }) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                const translatedText = window.getI18nText(key);
                if (translatedText && element.placeholder !== translatedText) {
                    element.placeholder = translatedText;
                }
            });
        });
    }

    /**
     * 检查是否已登录
     */
    isSignedIn() {
        return !!this.currentUser;
    }
}

// 自动初始化
let firebaseAuthManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        firebaseAuthManager = new FirebaseAuthManager();
        window.firebaseAuthManager = firebaseAuthManager;
    });
} else {
    firebaseAuthManager = new FirebaseAuthManager();
    window.firebaseAuthManager = firebaseAuthManager;
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirebaseAuthManager;
}