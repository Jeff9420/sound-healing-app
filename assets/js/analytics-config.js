// ========== Analytics Configuration ==========
// Google Analytics 4 and Microsoft Clarity Configuration

// Analytics Configuration Object
window.__ANALYTICS_CONFIG = {
    // Google Analytics 4 Measurement ID
    // Format: G-XXXXXXXXX
    // Get this from: https://analytics.google.com
    gaMeasurementId: 'G-4NZR3HR3J1', // SoundFlows GA4 Property

    // Microsoft Clarity Project ID
    // Get this from: https://clarity.microsoft.com
    clarityProjectId: '', // TODO: Replace with your Clarity ID

    // Amplitude Workspace API Key
    // Format: a long string from https://analytics.amplitude.com (Project Settings → General → API key)
    amplitudeApiKey: 'b6c4ebe3ec4d16c8f5fd258d29653cfc', // SoundFlows Amplitude Project

    // Amplitude specific options
    amplitudeOptions: {
        defaultTracking: {
            pageViews: true,
            sessions: true,
            fileDownloads: false,
            formInteractions: true
        },
        ingestionMetadata: {
            source: 'soundflows-web',
            commit: 'manual'
        },
        funnel: {
            discoveryEvent: 'content_detail_click',
            engagementEvent: 'content_cta_click',
            conversionEvent: 'content_conversion'
        }
    },

    // Additional configuration options
    options: {
    // Enable debug mode for development
        debugMode: false,

        // Track single page application navigation
        spaTracking: true,

        // Anonymize IP addresses for GDPR compliance
        anonymizeIP: true,

        // Cookie settings
        cookieFlags: 'SameSite=None;Secure',

        // Custom dimensions setup
        customDimensions: {
            audio_category: 'dimension1',
            audio_format: 'dimension2',
            device_type: 'dimension3',
            user_type: 'dimension4'
        },

        // Events to track
        trackedEvents: [
            'audio_play',
            'audio_pause',
            'audio_complete',
            'featured_track_play',
            'category_switch',
            'theme_change',
            'language_change',
            'share',
            'tutorial_complete',
            'tutorial_skip',
            'sleep_timer_set',
            'scroll_depth'
        ]
    }
};

// Helper function to update configuration
function updateAnalyticsConfig(config) {
    Object.assign(window.__ANALYTICS_CONFIG, config);
    console.log('Analytics configuration updated');
}

// Helper function to enable/disable tracking
function setAnalyticsEnabled(enabled) {
    if (enabled) {
        localStorage.setItem('analyticsConsent', 'accepted');
        // Reload analytics if already loaded
        if (window.soundFlowsAnalytics) {
            window.soundFlowsAnalytics.loadAnalytics();
        }
    } else {
        localStorage.setItem('analyticsConsent', 'denied');
    // Note: Cannot unload analytics once loaded, but can stop sending events
    }
}

// Check for URL parameters to enable debug mode
if (window.location.search.includes('analytics_debug=1')) {
    window.__ANALYTICS_CONFIG.options.debugMode = true;
    console.log('Analytics debug mode enabled');
}

// Export functions for global access
window.updateAnalyticsConfig = updateAnalyticsConfig;
window.setAnalyticsEnabled = setAnalyticsEnabled;
