/**
 * Sync Manager
 * Handles synchronization of user data between local storage and Supabase
 */

class SyncManager {
    constructor() {
        this.supabase = null;
        this.authManager = null;
        this.isSyncing = false;
        this.init();
    }

    /**
     * Initialize sync manager
     */
    async init() {
        this.supabase = window.getSupabaseClient();
        this.authManager = window.authManager;

        if (!this.supabase || !this.authManager) {
            console.error('Dependencies not available');
            return;
        }

        // Listen to auth state changes
        this.authManager.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN') {
                console.log('🔄 User signed in, starting data migration...');
                await this.migrateLocalData();
            } else if (event === 'SIGNED_OUT') {
                console.log('👋 User signed out');
            }
        });

        console.log('🔄 Sync Manager initialized');
    }

    /**
     * Migrate local storage data to Supabase on first login
     * @returns {Promise<Object>} Migration result
     */
    async migrateLocalData() {
        if (this.isSyncing) {
            console.log('⏳ Migration already in progress');
            return { success: false, message: 'Migration in progress' };
        }

        this.isSyncing = true;

        try {
            const results = {
                favorites: await this.migrateFavorites(),
                history: await this.migrateHistory(),
                mixes: await this.migrateMixes()
            };

            console.log('✅ Local data migration completed:', results);
            this.isSyncing = false;
            return { success: true, results };
        } catch (error) {
            console.error('❌ Migration failed:', error);
            this.isSyncing = false;
            return { success: false, error: error.message };
        }
    }

    /**
     * Migrate favorites from localStorage to Supabase
     */
    async migrateFavorites() {
        const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        if (localFavorites.length === 0) return { migrated: 0 };

        const user = this.authManager.getCurrentUser();
        if (!user) return { migrated: 0 };

        const favoritesToInsert = localFavorites.map(fav => ({
            user_id: user.id,
            audio_id: fav.id || fav.audio_id,
            category: fav.category
        }));

        try {
            const { data, error } = await this.supabase
                .from('user_favorites')
                .upsert(favoritesToInsert, { onConflict: 'user_id,audio_id', ignoreDuplicates: true });

            if (error) throw error;

            console.log(`✅ Migrated ${favoritesToInsert.length} favorites`);
            return { migrated: favoritesToInsert.length };
        } catch (error) {
            console.error('Failed to migrate favorites:', error);
            return { migrated: 0, error: error.message };
        }
    }

    /**
     * Migrate history from localStorage to Supabase
     */
    async migrateHistory() {
        const localHistory = JSON.parse(localStorage.getItem('playHistory') || '[]');
        if (localHistory.length === 0) return { migrated: 0 };

        const user = this.authManager.getCurrentUser();
        if (!user) return { migrated: 0 };

        const historyToInsert = localHistory.map(item => ({
            user_id: user.id,
            audio_id: item.id || item.audio_id,
            category: item.category,
            duration_seconds: item.duration || 0,
            played_at: item.timestamp || new Date().toISOString()
        }));

        try {
            const { data, error } = await this.supabase
                .from('user_history')
                .insert(historyToInsert);

            if (error) throw error;

            console.log(`✅ Migrated ${historyToInsert.length} history items`);
            return { migrated: historyToInsert.length };
        } catch (error) {
            console.error('Failed to migrate history:', error);
            return { migrated: 0, error: error.message };
        }
    }

    /**
     * Migrate custom mixes from localStorage to Supabase
     */
    async migrateMixes() {
        const localMixes = JSON.parse(localStorage.getItem('customMixes') || '[]');
        if (localMixes.length === 0) return { migrated: 0 };

        const user = this.authManager.getCurrentUser();
        if (!user) return { migrated: 0 };

        const mixesToInsert = localMixes.map(mix => ({
            user_id: user.id,
            name: mix.name || 'Untitled Mix',
            config: mix.config || mix,
            is_public: false
        }));

        try {
            const { data, error } = await this.supabase
                .from('user_mixes')
                .insert(mixesToInsert);

            if (error) throw error;

            console.log(`✅ Migrated ${mixesToInsert.length} custom mixes`);
            return { migrated: mixesToInsert.length };
        } catch (error) {
            console.error('Failed to migrate mixes:', error);
            return { migrated: 0, error: error.message };
        }
    }

    /**
     * Sync favorites to cloud
     * @param {Array} favorites - Favorites array
     */
    async syncFavorites(favorites) {
        const user = this.authManager.getCurrentUser();
        if (!user) return;

        try {
            const favoritesToSync = favorites.map(fav => ({
                user_id: user.id,
                audio_id: fav.id || fav.audio_id,
                category: fav.category
            }));

            const { error } = await this.supabase
                .from('user_favorites')
                .upsert(favoritesToSync, { onConflict: 'user_id,audio_id' });

            if (error) throw error;
            console.log('✅ Favorites synced to cloud');
        } catch (error) {
            console.error('Failed to sync favorites:', error);
        }
    }

    /**
     * Add to history in cloud
     * @param {Object} historyItem - History item
     */
    async addToHistory(historyItem) {
        const user = this.authManager.getCurrentUser();
        if (!user) return;

        try {
            const { error } = await this.supabase
                .from('user_history')
                .insert({
                    user_id: user.id,
                    audio_id: historyItem.id || historyItem.audio_id,
                    category: historyItem.category,
                    duration_seconds: historyItem.duration || 0
                });

            if (error) throw error;
            console.log('✅ History item added to cloud');
        } catch (error) {
            console.error('Failed to add history:', error);
        }
    }

    /**
     * Get favorites from cloud
     * @returns {Promise<Array>} Favorites array
     */
    async getFavorites() {
        const user = this.authManager.getCurrentUser();
        if (!user) return [];

        try {
            const { data, error } = await this.supabase
                .from('user_favorites')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Failed to get favorites:', error);
            return [];
        }
    }

    /**
     * Get history from cloud
     * @param {number} limit - Number of items to fetch
     * @returns {Promise<Array>} History array
     */
    async getHistory(limit = 50) {
        const user = this.authManager.getCurrentUser();
        if (!user) return [];

        try {
            const { data, error } = await this.supabase
                .from('user_history')
                .select('*')
                .eq('user_id', user.id)
                .order('played_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Failed to get history:', error);
            return [];
        }
    }

    /**
     * Get user stats
     * @returns {Promise<Object|null>} User stats
     */
    async getUserStats() {
        const user = this.authManager.getCurrentUser();
        if (!user) return null;

        try {
            const { data, error } = await this.supabase
                .from('user_stats')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Failed to get user stats:', error);
            return null;
        }
    }

    /**
     * Update user stats
     * @param {Object} stats - Stats to update
     */
    async updateUserStats(stats) {
        const user = this.authManager.getCurrentUser();
        if (!user) return;

        try {
            const { error } = await this.supabase
                .from('user_stats')
                .update({
                    ...stats,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', user.id);

            if (error) throw error;
            console.log('✅ User stats updated');
        } catch (error) {
            console.error('Failed to update stats:', error);
        }
    }

    /**
     * Remove favorite from cloud
     * @param {string} audioId - Audio ID to remove
     */
    async removeFavorite(audioId) {
        const user = this.authManager.getCurrentUser();
        if (!user) return;

        try {
            const { error } = await this.supabase
                .from('user_favorites')
                .delete()
                .eq('user_id', user.id)
                .eq('audio_id', audioId);

            if (error) throw error;
            console.log('✅ Favorite removed from cloud');
        } catch (error) {
            console.error('Failed to remove favorite:', error);
        }
    }
}

// Create singleton instance
const syncManager = new SyncManager();

// Export for use in other modules
window.syncManager = syncManager;

console.log('🔄 Sync Manager ready');
