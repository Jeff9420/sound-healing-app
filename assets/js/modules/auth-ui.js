/**
 * Authentication UI Controller
 * Handles the authentication modal and user interface interactions
 */

class AuthUI {
    constructor() {
        this.modal = null;
        this.currentTab = 'signin';
        this.init();
    }

    /**
     * Initialize auth UI
     */
    init() {
        this.createModal();
        this.attachEventListeners();
        this.setupAuthStateListener();
        console.log('🎨 Auth UI initialized');
    }

    /**
     * Create auth modal HTML
     */
    createModal() {
        const modalHTML = `
            <div class="auth-modal-overlay" id="authModalOverlay">
                <div class="auth-modal">
                    <button class="auth-modal-close" id="authModalClose">×</button>
                    
                    <div class="auth-modal-header">
                        <h2 class="auth-modal-title">Welcome to Sound Healing</h2>
                        <p class="auth-modal-subtitle">Sign in to sync your data across devices</p>
                    </div>

                    <div class="auth-message" id="authMessage"></div>

                    <div class="auth-tabs">
                        <button class="auth-tab active" data-tab="signin">Sign In</button>
                        <button class="auth-tab" data-tab="signup">Sign Up</button>
                    </div>

                    <!-- Sign In Form -->
                    <div class="auth-form-container active" id="signinForm">
                        <form id="signinFormElement">
                            <div class="auth-form-group">
                                <label class="auth-form-label" for="signinEmail">Email</label>
                                <input 
                                    type="email" 
                                    id="signinEmail" 
                                    class="auth-form-input" 
                                    placeholder="your@email.com" 
                                    required
                                />
                            </div>
                            <div class="auth-form-group">
                                <label class="auth-form-label" for="signinPassword">Password</label>
                                <input 
                                    type="password" 
                                    id="signinPassword" 
                                    class="auth-form-input" 
                                    placeholder="••••••••" 
                                    required
                                />
                            </div>
                            <div class="auth-forgot-password">
                                <a href="#" id="forgotPasswordLink">Forgot password?</a>
                            </div>
                            <button type="submit" class="auth-submit-btn">Sign In</button>
                        </form>

                        <div class="auth-divider">or continue with</div>

                        <div class="auth-social-btns">
                            <button class="auth-social-btn" id="googleSignInBtn">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
                                    <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
                                    <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05"/>
                                    <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335"/>
                                </svg>
                                Sign in with Google
                            </button>
                        </div>
                    </div>

                    <!-- Sign Up Form -->
                    <div class="auth-form-container" id="signupForm">
                        <form id="signupFormElement">
                            <div class="auth-form-group">
                                <label class="auth-form-label" for="signupEmail">Email</label>
                                <input 
                                    type="email" 
                                    id="signupEmail" 
                                    class="auth-form-input" 
                                    placeholder="your@email.com" 
                                    required
                                />
                            </div>
                            <div class="auth-form-group">
                                <label class="auth-form-label" for="signupPassword">Password</label>
                                <input 
                                    type="password" 
                                    id="signupPassword" 
                                    class="auth-form-input" 
                                    placeholder="••••••••" 
                                    minlength="6"
                                    required
                                />
                            </div>
                            <div class="auth-form-group">
                                <label class="auth-form-label" for="signupPasswordConfirm">Confirm Password</label>
                                <input 
                                    type="password" 
                                    id="signupPasswordConfirm" 
                                    class="auth-form-input" 
                                    placeholder="••••••••" 
                                    minlength="6"
                                    required
                                />
                            </div>
                            <button type="submit" class="auth-submit-btn">Create Account</button>
                        </form>

                        <div class="auth-divider">or continue with</div>

                        <div class="auth-social-btns">
                            <button class="auth-social-btn" id="googleSignUpBtn">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
                                    <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
                                    <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05"/>
                                    <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335"/>
                                </svg>
                                Sign up with Google
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('authModalOverlay');
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Close modal
        document.getElementById('authModalClose').addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });

        // Tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        // Sign in form
        document.getElementById('signinFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignIn();
        });

        // Sign up form
        document.getElementById('signupFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignUp();
        });

        // Google sign in/up
        document.getElementById('googleSignInBtn').addEventListener('click', () => this.handleGoogleAuth());
        document.getElementById('googleSignUpBtn').addEventListener('click', () => this.handleGoogleAuth());

        // Forgot password
        document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleForgotPassword();
        });

        // Update sign in button in header
        const signInBtn = document.querySelector('.saas-nav__signin');
        if (signInBtn) {
            signInBtn.addEventListener('click', () => this.openModal());
        }
    }

    /**
     * Setup auth state listener
     */
    setupAuthStateListener() {
        if (window.authManager) {
            window.authManager.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN') {
                    this.closeModal();
                    this.updateUIForAuthenticatedUser(session.user);
                } else if (event === 'SIGNED_OUT') {
                    this.updateUIForGuestUser();
                }
            });

            // Check initial state
            const user = window.authManager.getCurrentUser();
            if (user) {
                this.updateUIForAuthenticatedUser(user);
            }
        }
    }

    /**
     * Switch between sign in and sign up tabs
     */
    switchTab(tab) {
        this.currentTab = tab;

        // Update tabs
        document.querySelectorAll('.auth-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });

        // Update forms
        document.querySelectorAll('.auth-form-container').forEach(form => {
            form.classList.toggle('active', form.id === `${tab}Form`);
        });

        // Clear message
        this.hideMessage();
    }

    /**
     * Handle sign in
     */
    async handleSignIn() {
        const email = document.getElementById('signinEmail').value;
        const password = document.getElementById('signinPassword').value;

        this.showMessage('Signing in...', 'info');

        const result = await window.authManager.signIn(email, password);

        if (result.success) {
            this.showMessage(result.message, 'success');
        } else {
            this.showMessage(result.error, 'error');
        }
    }

    /**
     * Handle sign up
     */
    async handleSignUp() {
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const passwordConfirm = document.getElementById('signupPasswordConfirm').value;

        if (password !== passwordConfirm) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }

        this.showMessage('Creating account...', 'info');

        const result = await window.authManager.signUp(email, password);

        if (result.success) {
            this.showMessage(result.message, 'success');
        } else {
            this.showMessage(result.error, 'error');
        }
    }

    /**
     * Handle Google authentication
     */
    async handleGoogleAuth() {
        const result = await window.authManager.signInWithGoogle();

        if (!result.success) {
            this.showMessage(result.error, 'error');
        }
    }

    /**
     * Handle forgot password
     */
    async handleForgotPassword() {
        const email = prompt('Enter your email address:');
        if (!email) return;

        const result = await window.authManager.resetPassword(email);

        if (result.success) {
            alert(result.message);
        } else {
            alert('Error: ' + result.error);
        }
    }

    /**
     * Show message
     */
    showMessage(message, type) {
        const messageEl = document.getElementById('authMessage');
        messageEl.textContent = message;
        messageEl.className = `auth-message active ${type}`;
    }

    /**
     * Hide message
     */
    hideMessage() {
        const messageEl = document.getElementById('authMessage');
        messageEl.className = 'auth-message';
    }

    /**
     * Open modal
     */
    openModal() {
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close modal
     */
    closeModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        this.hideMessage();
    }

    /**
     * Update UI for authenticated user
     */
    updateUIForAuthenticatedUser(user) {
        const signInBtn = document.querySelector('.saas-nav__signin');
        if (signInBtn) {
            const email = user.email || 'User';
            const initial = email.charAt(0).toUpperCase();

            signInBtn.outerHTML = `
                <div class="user-profile-dropdown" id="userProfileDropdown">
                    <button class="user-profile-btn">
                        <div class="user-avatar">${initial}</div>
                        <span>${email.split('@')[0]}</span>
                    </button>
                    <div class="user-profile-menu">
                        <div class="user-profile-menu-item" onclick="window.location.href='#profile'">
                            👤 Profile
                        </div>
                        <div class="user-profile-menu-item" onclick="window.location.href='#stats'">
                            📊 Statistics
                        </div>
                        <div class="user-profile-menu-divider"></div>
                        <div class="user-profile-menu-item" onclick="window.authUI.handleSignOut()">
                            🚪 Sign Out
                        </div>
                    </div>
                </div>
            `;

            // Add dropdown toggle
            const dropdown = document.getElementById('userProfileDropdown');
            dropdown.querySelector('.user-profile-btn').addEventListener('click', () => {
                dropdown.classList.toggle('active');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target)) {
                    dropdown.classList.remove('active');
                }
            });
        }
    }

    /**
     * Update UI for guest user
     */
    updateUIForGuestUser() {
        const dropdown = document.getElementById('userProfileDropdown');
        if (dropdown) {
            dropdown.outerHTML = '<button class="saas-nav__signin" type="button">Sign In</button>';

            // Re-attach event listener
            const signInBtn = document.querySelector('.saas-nav__signin');
            if (signInBtn) {
                signInBtn.addEventListener('click', () => this.openModal());
            }
        }
    }

    /**
     * Handle sign out
     */
    async handleSignOut() {
        const result = await window.authManager.signOut();
        if (result.success) {
            alert('Signed out successfully');
        }
    }
}

// Initialize auth UI when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.authUI = new AuthUI();
    });
} else {
    window.authUI = new AuthUI();
}

console.log('🎨 Auth UI Controller loaded');
