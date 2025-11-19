/**
 * Authentication Manager
 * Handles user registration, login, logout, and session management
 */

class AuthManager {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.authStateCallbacks = [];
        this.init();
    }

    /**
     * Initialize auth manager
     */
    async init() {
        this.supabase = window.getSupabaseClient();
        if (!this.supabase) {
            console.error('Supabase client not available');
            return;
        }

        // Listen to auth state changes
        this.supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event);
            this.currentUser = session?.user || null;
            this.notifyAuthStateChange(event, session);
        });

        // Check for existing session
        const { data: { session } } = await this.supabase.auth.getSession();
        this.currentUser = session?.user || null;
    }

    /**
     * Register a new user with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {string} username - Optional username
     * @returns {Promise<Object>} Result object
     */
    async signUp(email, password, username = null) {
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: username || email.split('@')[0]
                    }
                }
            });

            if (error) throw error;

            console.log('✅ User registered successfully:', data.user?.email);
            return { success: true, user: data.user, message: 'Registration successful! Please check your email to verify your account.' };
        } catch (error) {
            console.error('❌ Registration failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sign in with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} Result object
     */
    async signIn(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            console.log('✅ User signed in successfully:', data.user?.email);
            return { success: true, user: data.user, message: 'Welcome back!' };
        } catch (error) {
            console.error('❌ Sign in failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sign in with Google OAuth
     * @returns {Promise<Object>} Result object
     */
    async signInWithGoogle() {
        try {
            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });

            if (error) throw error;

            console.log('✅ Google OAuth initiated');
            return { success: true, message: 'Redirecting to Google...' };
        } catch (error) {
            console.error('❌ Google sign in failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sign out current user
     * @returns {Promise<Object>} Result object
     */
    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;

            this.currentUser = null;
            console.log('✅ User signed out successfully');
            return { success: true, message: 'Signed out successfully' };
        } catch (error) {
            console.error('❌ Sign out failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send password reset email
     * @param {string} email - User email
     * @returns {Promise<Object>} Result object
     */
    async resetPassword(email) {
        try {
            const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            });

            if (error) throw error;

            console.log('✅ Password reset email sent');
            return { success: true, message: 'Password reset email sent! Please check your inbox.' };
        } catch (error) {
            console.error('❌ Password reset failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update user password
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Result object
     */
    async updatePassword(newPassword) {
        try {
            const { error } = await this.supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            console.log('✅ Password updated successfully');
            return { success: true, message: 'Password updated successfully' };
        } catch (error) {
            console.error('❌ Password update failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get current user
     * @returns {Object|null} Current user object or null
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} True if user is logged in
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    /**
     * Register callback for auth state changes
     * @param {Function} callback - Callback function
     */
    onAuthStateChange(callback) {
        this.authStateCallbacks.push(callback);
    }

    /**
     * Notify all registered callbacks of auth state change
     * @param {string} event - Auth event type
     * @param {Object} session - Session object
     */
    notifyAuthStateChange(event, session) {
        this.authStateCallbacks.forEach(callback => {
            try {
                callback(event, session);
            } catch (error) {
                console.error('Error in auth state callback:', error);
            }
        });
    }

    /**
     * Get user profile from database
     * @returns {Promise<Object|null>} User profile or null
     */
    async getUserProfile() {
        if (!this.currentUser) return null;

        try {
            const { data, error } = await this.supabase
                .from('user_profiles')
                .select('*')
                .eq('id', this.currentUser.id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Failed to get user profile:', error);
            return null;
        }
    }

    /**
     * Update user profile
     * @param {Object} updates - Profile updates
     * @returns {Promise<Object>} Result object
     */
    async updateUserProfile(updates) {
        if (!this.currentUser) {
            return { success: false, error: 'Not authenticated' };
        }

        try {
            const { data, error } = await this.supabase
                .from('user_profiles')
                .update(updates)
                .eq('id', this.currentUser.id)
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Profile updated successfully');
            return { success: true, data, message: 'Profile updated successfully' };
        } catch (error) {
            console.error('❌ Profile update failed:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create singleton instance
const authManager = new AuthManager();

// Export for use in other modules
window.authManager = authManager;

console.log('🔐 Auth Manager initialized');
