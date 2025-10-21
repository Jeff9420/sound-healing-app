// ========== Dropdown Login System ==========
// Minimal dropdown authentication system for SoundFlows

class DropdownLoginSystem {
    constructor() {
        this.dropdown = null;
        this.menu = null;
        this.toggle = null;
        this.compactModal = null;
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        // Initialize DOM elements
        this.dropdown = document.getElementById('userDropdown');
        this.menu = document.getElementById('userDropdownMenu');
        this.toggle = document.getElementById('userDropdownToggle');
        this.compactModal = document.getElementById('compactLoginModal');

        if (!this.dropdown || !this.menu || !this.toggle) {
            console.warn('Dropdown login system elements not found');
            return;
        }

        // Bind events
        this.bindEvents();

        // Check authentication state
        this.checkAuthState();

        // Listen for authentication events
        this.setupAuthListeners();
    }

    bindEvents() {
        // Toggle dropdown
        this.toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.dropdown.contains(e.target)) {
                this.closeDropdown();
            }
        });

        // Keyboard navigation
        this.toggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleDropdown();
            } else if (e.key === 'Escape') {
                this.closeDropdown();
            }
        });

        // Close modal on overlay click
        const overlay = this.compactModal?.querySelector('.compact-modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.closeCompactLogin();
            });
        }

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.compactModal.style.display !== 'none') {
                this.closeCompactLogin();
            }
        });
    }

    toggleDropdown() {
        const isExpanded = this.toggle.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    openDropdown() {
        this.toggle.setAttribute('aria-expanded', 'true');
        this.menu.setAttribute('aria-hidden', 'false');

        // Focus management
        setTimeout(() => {
            const firstItem = this.menu.querySelector('.dropdown-item');
            if (firstItem) {
                firstItem.focus();
            }
        }, 100);
    }

    closeDropdown() {
        this.toggle.setAttribute('aria-expanded', 'false');
        this.menu.setAttribute('aria-hidden', 'true');
    }

    // Authentication State Management
    checkAuthState() {
        // Check if user is authenticated (localStorage, cookie, or Firebase)
        const savedUser = localStorage.getItem('soundFlows_user');
        const authToken = localStorage.getItem('soundFlows_authToken');

        if (savedUser && authToken) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.isAuthenticated = true;
                this.showLoggedInState();
            } catch (e) {
                console.error('Error parsing saved user data:', e);
                this.showGuestState();
            }
        } else {
            this.showGuestState();
        }

        // Listen for Firebase auth changes if available
        if (window.firebaseAuthManager) {
            setTimeout(() => {
                if (window.firebaseAuthManager.currentUser) {
                    this.currentUser = window.firebaseAuthManager.currentUser;
                    this.isAuthenticated = true;
                    this.showLoggedInState();
                }
            }, 1000);
        }
    }

    showGuestState() {
        const guestMenu = document.getElementById('guestMenu');
        const loggedInMenu = document.getElementById('loggedInMenu');
        const loginIcon = document.getElementById('loginIcon');
        const userAvatar = document.getElementById('userAvatar');

        if (guestMenu) guestMenu.style.display = 'block';
        if (loggedInMenu) loggedInMenu.style.display = 'none';
        if (loginIcon) loginIcon.style.display = 'inline';
        if (userAvatar) userAvatar.style.display = 'none';

        this.updateUserAvatar(null);
    }

    showLoggedInState() {
        const guestMenu = document.getElementById('guestMenu');
        const loggedInMenu = document.getElementById('loggedInMenu');
        const loginIcon = document.getElementById('loginIcon');
        const userAvatar = document.getElementById('userAvatar');

        if (guestMenu) guestMenu.style.display = 'none';
        if (loggedInMenu) loggedInMenu.style.display = 'block';
        if (loginIcon) loginIcon.style.display = 'none';
        if (userAvatar) userAvatar.style.display = 'inline';

        this.updateUserAvatar(this.currentUser);
        this.updateUserDetails();
    }

    updateUserAvatar(user) {
        const avatar = document.getElementById('userAvatar');
        const avatarLarge = document.getElementById('userAvatarLarge');

        let avatarContent = '👤';

        if (user) {
            // Generate avatar from user name or email
            const name = user.displayName || user.name;
            const email = user.email;

            if (name) {
                avatarContent = name.charAt(0).toUpperCase();
            } else if (email) {
                avatarContent = email.charAt(0).toUpperCase();
            }
        }

        if (avatar) {
            avatar.textContent = avatarContent;
            avatar.style.display = user ? 'inline' : 'none';
        }

        if (avatarLarge) {
            avatarLarge.textContent = avatarContent;
        }
    }

    updateUserDetails() {
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');

        if (this.currentUser) {
            if (userName) {
                userName.textContent = this.currentUser.displayName ||
                                    this.currentUser.name ||
                                    '用户';
            }
            if (userEmail) {
                userEmail.textContent = this.currentUser.email || 'user@example.com';
            }
        }
    }

    // Login Functions
    showEmailLogin() {
        this.closeDropdown();
        this.showCompactLogin('email');
    }

    showPhoneLogin() {
        this.closeDropdown();
        this.showCompactLogin('phone');
    }

    showCompactLogin(type = 'email') {
        if (!this.compactModal) return;

        // Hide all forms
        document.getElementById('emailLoginForm').style.display = 'none';
        document.getElementById('emailSignupForm').style.display = 'none';
        document.getElementById('passwordResetForm').style.display = 'none';
        document.getElementById('phoneLoginForm').style.display = 'none';

        // Show selected form
        switch (type) {
            case 'email':
                document.getElementById('emailLoginForm').style.display = 'block';
                break;
            case 'phone':
                document.getElementById('phoneLoginForm').style.display = 'block';
                break;
        }

        // Show modal
        this.compactModal.style.display = 'block';

        // Focus first input
        setTimeout(() => {
            const firstInput = this.compactModal.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }

    closeCompactLogin() {
        if (this.compactModal) {
            this.compactModal.style.display = 'none';

            // Clear forms
            const inputs = this.compactModal.querySelectorAll('input');
            inputs.forEach(input => input.value = '');
        }
    }

    showCompactSignup() {
        if (!this.compactModal) return;

        // Hide all forms
        document.getElementById('emailLoginForm').style.display = 'none';
        document.getElementById('emailSignupForm').style.display = 'none';
        document.getElementById('passwordResetForm').style.display = 'none';
        document.getElementById('phoneLoginForm').style.display = 'none';

        // Show signup form
        document.getElementById('emailSignupForm').style.display = 'block';
        this.compactModal.style.display = 'block';

        // Focus first input
        setTimeout(() => {
            const nameInput = document.getElementById('compactName');
            if (nameInput) {
                nameInput.focus();
            }
        }, 100);
    }

    showCompactReset() {
        if (!this.compactModal) return;

        // Hide all forms
        document.getElementById('emailLoginForm').style.display = 'none';
        document.getElementById('emailSignupForm').style.display = 'none';
        document.getElementById('passwordResetForm').style.display = 'none';
        document.getElementById('phoneLoginForm').style.display = 'none';

        // Show reset form
        document.getElementById('passwordResetForm').style.display = 'block';
        this.compactModal.style.display = 'block';

        // Focus email input
        setTimeout(() => {
            const emailInput = document.getElementById('compactResetEmail');
            if (emailInput) {
                emailInput.focus();
            }
        }, 100);
    }

    // Firebase Integration
    setupAuthListeners() {
        // Listen for successful authentication
        document.addEventListener('userLoggedIn', (e) => {
            this.currentUser = e.detail.user;
            this.isAuthenticated = true;
            this.showLoggedInState();
            this.closeCompactLogin();
            this.closeDropdown();
        });

        // Listen for logout
        document.addEventListener('userLoggedOut', () => {
            this.currentUser = null;
            this.isAuthenticated = false;
            this.showGuestState();
            this.closeDropdown();
        });
    }

    // Settings Function
    showSettings() {
        this.closeDropdown();
        // Implement settings modal or navigation
        console.log('Settings clicked - implement settings functionality');

        // Show placeholder notification
        if (window.showNotification) {
            window.showNotification('设置功能即将推出', 'info');
        }
    }

    // Logout Function
    async logout() {
        if (!this.isAuthenticated) return;

        try {
            // Firebase logout
            if (window.firebaseAuthManager && window.firebaseAuthManager.signOut) {
                await window.firebaseAuthManager.signOut();
            }

            // Clear local storage
            localStorage.removeItem('soundFlows_user');
            localStorage.removeItem('soundFlows_authToken');

            // Update UI
            this.currentUser = null;
            this.isAuthenticated = false;
            this.showGuestState();
            this.closeDropdown();

            // Show notification
            if (window.showNotification) {
                window.showNotification('已成功退出登录', 'success');
            }

            // Dispatch logout event
            document.dispatchEvent(new CustomEvent('userLoggedOut'));

        } catch (error) {
            console.error('Logout error:', error);
            if (window.showNotification) {
                window.showNotification('退出登录失败，请重试', 'error');
            }
        }
    }
}

// Global functions for onclick handlers
function showEmailLogin() {
    if (window.dropdownLoginSystem) {
        window.dropdownLoginSystem.showEmailLogin();
    }
}

function showPhoneLogin() {
    if (window.dropdownLoginSystem) {
        window.dropdownLoginSystem.showPhoneLogin();
    }
}

function showCompactSignup() {
    if (window.dropdownLoginSystem) {
        window.dropdownLoginSystem.showCompactSignup();
    }
}

function showCompactReset() {
    if (window.dropdownLoginSystem) {
        window.dropdownLoginSystem.showCompactReset();
    }
}

function closeCompactLogin() {
    if (window.dropdownLoginSystem) {
        window.dropdownLoginSystem.closeCompactLogin();
    }
}

// Compact login handlers
function handleCompactLogin() {
    const email = document.getElementById('compactEmail')?.value;
    const password = document.getElementById('compactPassword')?.value;

    if (!email || !password) {
        if (window.showNotification) {
            window.showNotification('请填写邮箱和密码', 'error');
        }
        return;
    }

    // Use Firebase auth if available
    if (window.firebaseAuthManager && window.firebaseAuthManager.signInWithEmail) {
        window.firebaseAuthManager.signInWithEmail(email, password)
            .then(result => {
                if (result) {
                    closeCompactLogin();
                }
            })
            .catch(error => {
                console.error('Login error:', error);
                if (window.showNotification) {
                    window.showNotification('登录失败：' + error.message, 'error');
                }
            });
    } else {
        // Fallback authentication
        console.log('Compact login:', email);
        // Simulate successful login for demo
        setTimeout(() => {
            const userData = {
                email: email,
                displayName: email.split('@')[0],
                uid: 'demo-user-' + Date.now()
            };

            localStorage.setItem('soundFlows_user', JSON.stringify(userData));
            localStorage.setItem('soundFlows_authToken', 'demo-token-' + Date.now());

            document.dispatchEvent(new CustomEvent('userLoggedIn', {
                detail: { user: userData }
            }));

            closeCompactLogin();
            if (window.showNotification) {
                window.showNotification('登录成功', 'success');
            }
        }, 1000);
    }
}

function handleCompactSignup() {
    const name = document.getElementById('compactName')?.value;
    const email = document.getElementById('compactSignupEmail')?.value;
    const password = document.getElementById('compactSignupPassword')?.value;

    if (!name || !email || !password) {
        if (window.showNotification) {
            window.showNotification('请填写所有字段', 'error');
        }
        return;
    }

    if (password.length < 6) {
        if (window.showNotification) {
            window.showNotification('密码至少需要6位字符', 'error');
        }
        return;
    }

    // Use Firebase auth if available
    if (window.firebaseAuthManager && window.firebaseAuthManager.signUpWithEmail) {
        window.firebaseAuthManager.signUpWithEmail(email, password, name)
            .then(result => {
                if (result) {
                    closeCompactLogin();
                }
            })
            .catch(error => {
                console.error('Signup error:', error);
                if (window.showNotification) {
                    window.showNotification('注册失败：' + error.message, 'error');
                }
            });
    } else {
        // Fallback registration
        console.log('Compact signup:', name, email);

        setTimeout(() => {
            const userData = {
                email: email,
                displayName: name,
                name: name,
                uid: 'demo-user-' + Date.now()
            };

            localStorage.setItem('soundFlows_user', JSON.stringify(userData));
            localStorage.setItem('soundFlows_authToken', 'demo-token-' + Date.now());

            document.dispatchEvent(new CustomEvent('userLoggedIn', {
                detail: { user: userData }
            }));

            closeCompactLogin();
            if (window.showNotification) {
                window.showNotification('注册成功', 'success');
            }
        }, 1000);
    }
}

function handleCompactReset() {
    const email = document.getElementById('compactResetEmail')?.value;

    if (!email) {
        if (window.showNotification) {
            window.showNotification('请输入邮箱地址', 'error');
        }
        return;
    }

    // Use Firebase auth if available
    if (window.firebaseAuthManager && window.firebaseAuthManager.sendPasswordResetEmail) {
        window.firebaseAuthManager.sendPasswordResetEmail(email)
            .then(result => {
                if (result) {
                    closeCompactLogin();
                    if (window.showNotification) {
                        window.showNotification('重置邮件已发送，请检查邮箱', 'success');
                    }
                }
            })
            .catch(error => {
                console.error('Password reset error:', error);
                if (window.showNotification) {
                    window.showNotification('发送重置邮件失败：' + error.message, 'error');
                }
            });
    } else {
        // Fallback password reset
        console.log('Password reset for:', email);

        setTimeout(() => {
            closeCompactLogin();
            if (window.showNotification) {
                window.showNotification('重置邮件已发送，请检查邮箱', 'success');
            }
        }, 1000);
    }
}

function handlePhoneLogin() {
    const phone = document.getElementById('compactPhone')?.value;
    const code = document.getElementById('compactVerificationCode')?.value;

    if (!phone) {
        if (window.showNotification) {
            window.showNotification('请输入手机号码', 'error');
        }
        return;
    }

    if (!code) {
        if (window.showNotification) {
            window.showNotification('请输入验证码', 'error');
        }
        return;
    }

    // Simulate phone login
    console.log('Phone login:', phone, code);

    setTimeout(() => {
        const userData = {
            phone: phone,
            displayName: '用户',
            uid: 'demo-user-' + Date.now()
        };

        localStorage.setItem('soundFlows_user', JSON.stringify(userData));
        localStorage.setItem('soundFlows_authToken', 'demo-token-' + Date.now());

        document.dispatchEvent(new CustomEvent('userLoggedIn', {
            detail: { user: userData }
        }));

        closeCompactLogin();
        if (window.showNotification) {
            window.showNotification('登录成功', 'success');
        }
    }, 1000);
}

function sendVerificationCode() {
    const phone = document.getElementById('compactPhone')?.value;

    if (!phone) {
        if (window.showNotification) {
            window.showNotification('请输入手机号码', 'error');
        }
        return;
    }

    // Simulate sending verification code
    console.log('Sending code to:', phone);

    if (window.showNotification) {
        window.showNotification('验证码已发送', 'success');
    }

    // Enable verification code input
    setTimeout(() => {
        const codeInput = document.getElementById('compactVerificationCode');
        if (codeInput) {
            codeInput.focus();
        }
    }, 1000);
}

function handleLogout() {
    if (window.dropdownLoginSystem) {
        window.dropdownLoginSystem.logout();
    }
}

function showSettings() {
    if (window.dropdownLoginSystem) {
        window.dropdownLoginSystem.showSettings();
    }
}

// Initialize dropdown login system
document.addEventListener('DOMContentLoaded', () => {
    window.dropdownLoginSystem = new DropdownLoginSystem();
    console.log('✅ Dropdown login system initialized');
});

// Export for global access
window.DropdownLoginSystem = DropdownLoginSystem;