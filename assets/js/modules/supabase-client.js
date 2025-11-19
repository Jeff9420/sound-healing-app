/**
 * Supabase Client Configuration
 * Initializes the Supabase client for authentication and database operations
 */

// Supabase project configuration
const SUPABASE_URL = 'https://ilbpfjgmuqvzfbentlvd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsYnBmamdtdXF2emZiZW50bHZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDQ4NTAsImV4cCI6MjA3MjkyMDg1MH0.tDd79GDqNfsBxg0WMmcmJaJcSLx5UKb3DA1OtthovKw';

// Initialize Supabase client
let supabaseClient = null;

/**
 * Get or create Supabase client instance
 * @returns {Object} Supabase client
 */
function getSupabaseClient() {
    if (supabaseClient) {
        return supabaseClient;
    }

    // Check if Supabase library is loaded
    if (typeof supabase === 'undefined') {
        console.error('Supabase library not loaded. Please include the Supabase CDN script.');
        return null;
    }

    try {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            }
        });

        console.log('✅ Supabase client initialized successfully');
        return supabaseClient;
    } catch (error) {
        console.error('❌ Failed to initialize Supabase client:', error);
        return null;
    }
}

// Export for use in other modules
window.getSupabaseClient = getSupabaseClient;

// Auto-initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', getSupabaseClient);
} else {
    getSupabaseClient();
}
