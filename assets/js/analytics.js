// ========== SoundFlows Analytics Integration ==========
// Enhanced Google Analytics 4 tracking for SoundFlows app

(() => {
  const config = window.__ANALYTICS_CONFIG || {};
  const gaId = (config.gaMeasurementId || '').trim();
  const clarityId = (config.clarityProjectId || '').trim();

  // Analytics Management Class
  class SoundFlowsAnalytics {
    constructor(gaId, clarityId) {
      this.gaId = gaId;
      this.clarityId = clarityId;
      this.isInitialized = false;
      this.audioEvents = {};
      this.init();
    }

    init() {
      const consentType = this.getConsentType();
      if (consentType === 'accepted') {
        this.loadAnalytics();
      }

      document.addEventListener('cookieConsentGiven', (event) => {
        const nextConsent = event?.detail?.type || this.getConsentType();
        if (nextConsent === 'accepted') {
          this.loadAnalytics();
        } else if (nextConsent === 'denied' || nextConsent === 'necessary') {
          this.clearAnalyticsCookies();
        }
      });

      if (this.gaId) {
        this.setupEventListeners();
      }
    }

    getConsentType() {
      try {
        const stored = localStorage.getItem('cookieConsent');
        if (!stored) return null;
        if (stored === 'accepted' || stored === 'necessary' || stored === 'denied') {
          return stored;
        }
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && parsed.type) {
          return parsed.type;
        }
      } catch (error) {
        console.warn('Failed to parse cookie consent', error);
      }
      return null;
    }

    getConsent() {
      return this.getConsentType() === 'accepted';
    }

    clearAnalyticsCookies() {
      ['_ga', '_gid', '_gat', '_gcl_au'].forEach((name) => {
        document.cookie = `${name}=; Max-Age=0; path=/; SameSite=None; Secure`;
        document.cookie = `${name}=; Max-Age=0; path=/`;
      });
      try {
        window.cookieConsent?.disableAnalytics?.();
      } catch (error) {
        console.warn('Failed to invoke cookieConsent.disableAnalytics', error);
      }
    }

    loadAnalytics() {
      if (this.isInitialized) return;

      // Load Google Analytics
      if (this.gaId) {
        this.loadGoogleAnalytics();
      }

      // Load Microsoft Clarity
      if (this.clarityId) {
        this.loadClarity();
      }

      this.isInitialized = true;
    }

    loadGoogleAnalytics() {
      const loadScript = (src, attributes = {}) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        Object.entries(attributes).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            script.setAttribute(key, value);
          }
        });
        document.head.appendChild(script);
      };

      // Initialize dataLayer
      window.dataLayer = window.dataLayer || [];
      const gtag = function () {
        window.dataLayer.push(arguments);
      };

      // Configure GA4
      gtag('js', new Date());
      gtag('config', this.gaId, {
        'anonymize_ip': true,
        'cookie_flags': 'SameSite=None;Secure',
        'custom_map': {
          'dimension1': 'audio_category',
          'dimension2': 'audio_format',
          'dimension3': 'device_type'
        }
      });

      loadScript(`https://www.googletagmanager.com/gtag/js?id=${this.gaId}`);
      window.gtag = gtag;

      // Track initial page view
      this.trackPageView();

      console.log('Google Analytics loaded');
    }

    loadClarity() {
      (function (c, l, a, r, i, t, y) {
        c[a] = c[a] || function () {
          (c[a].q = c[a].q || []).push(arguments);
        };
        t = l.createElement(r);
        t.async = 1;
        t.src = `https://www.clarity.ms/tag/${i}`;
        y = l.getElementsByTagName(r)[0];
        y.parentNode.insertBefore(t, y);
      })(window, document, 'clarity', 'script', this.clarityId);

      console.log('Microsoft Clarity loaded');
    }

    setupEventListeners() {
      // Track audio events
      this.trackAudioEvents();

      // Track feature usage
      this.trackFeatureUsage();

      // Track scroll depth
      this.trackScrollDepth();

      // Track user interactions
      this.trackUserInteractions();

      // Track errors
      this.trackErrors();
    }

    // Page View Tracking
    trackPageView(path = window.location.pathname) {
      if (window.gtag) {
        window.gtag('config', this.gaId, {
          'page_path': path,
          'page_title': document.title
        });
      }
    }

    // Audio Event Tracking
    trackAudioEvents() {
      // Audio play events
      document.addEventListener('audioTrackChanged', (e) => {
        const { track, category, format } = e.detail;
        this.event('audio_play', {
          'event_category': category,
          'event_label': track,
          'audio_category': category,
          'audio_format': format || 'unknown'
        });

        // Start duration tracking
        this.startAudioDurationTracking(track);
      });

      // Audio pause/stop events
      document.addEventListener('audioPlaybackStateChanged', (e) => {
        const { isPlaying, track } = e.detail;
        if (!isPlaying && track) {
          this.endAudioDurationTracking(track);
        }
      });

      // Featured track events
      document.addEventListener('featuredTrackPlayed', (e) => {
        this.event('featured_track_play', {
          'event_category': 'feature',
          'event_label': e.detail.trackName
        });
      });
    }

    startAudioDurationTracking(track) {
      if (!this.audioEvents[track]) {
        this.audioEvents[track] = {
          startTime: Date.now(),
          totalDuration: 0
        };
      }
      this.audioEvents[track].startTime = Date.now();
    }

    endAudioDurationTracking(track) {
      if (this.audioEvents[track]) {
        const duration = Math.floor((Date.now() - this.audioEvents[track].startTime) / 1000);
        this.audioEvents[track].totalDuration += duration;

        // Only track if duration > 5 seconds
        if (duration > 5) {
          this.event('audio_duration', {
            'event_category': 'engagement',
            'event_label': track,
            'value': duration
          });
        }
      }
    }

    // Feature Usage Tracking
    trackFeatureUsage() {
      // Theme changes
      document.addEventListener('themeChanged', (e) => {
        this.event('theme_change', {
          'event_category': 'feature',
          'event_label': e.detail.theme
        });
      });

      // Language changes
      document.addEventListener('languageChanged', (e) => {
        this.event('language_change', {
          'event_category': 'feature',
          'event_label': e.detail.language
        });
      });

      // Share events
      document.addEventListener('shareCompleted', (e) => {
        this.event('share', {
          'event_category': 'social',
          'event_label': e.detail.platform
        });
      });

      // Tutorial events
      document.addEventListener('tutorialCompleted', () => {
        this.event('tutorial_complete', {
          'event_category': 'onboarding',
          'event_label': 'full_tutorial'
        });
      });

      document.addEventListener('tutorialSkipped', () => {
        this.event('tutorial_skip', {
          'event_category': 'onboarding',
          'event_label': 'skipped'
        });
      });

      // Sleep timer
      document.addEventListener('sleepTimerSet', (e) => {
        this.event('sleep_timer_set', {
          'event_category': 'feature',
          'event_label': 'timer',
          'value': e.detail.minutes
        });
      });

      // Category switching
      document.addEventListener('categoryChanged', (e) => {
        this.event('category_switch', {
          'event_category': 'navigation',
          'event_label': e.detail.category
        });
      });
    }

    // Scroll Depth Tracking
    trackScrollDepth() {
      const thresholds = [25, 50, 75, 90];
      let tracked = new Set();

      window.addEventListener('scroll', () => {
        const scrollPercent = Math.round(
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );

        thresholds.forEach(threshold => {
          if (scrollPercent >= threshold && !tracked.has(threshold)) {
            tracked.add(threshold);
            this.event('scroll_depth', {
              'event_category': 'engagement',
              'event_label': `${threshold}%`,
              'value': threshold
            });
          }
        });
      });
    }

    // User Interaction Tracking
    trackUserInteractions() {
      // Track outbound links
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.hostname !== window.location.hostname) {
          this.event('outbound_click', {
            'event_category': 'navigation',
            'event_label': link.hostname
          });
        }
      });

      // Track audio control usage
      const audioControls = ['play', 'pause', 'next', 'previous', 'volume'];
      audioControls.forEach(control => {
        document.addEventListener(`audio${control.charAt(0).toUpperCase() + control.slice(1)}`, () => {
          this.event('audio_control', {
            'event_category': 'interaction',
            'event_label': control
          });
        });
      });
    }

    // Error Tracking
    trackErrors() {
      window.addEventListener('error', (e) => {
        this.event('javascript_error', {
          'event_category': 'error',
          'event_label': `${e.filename}:${e.lineno}`,
          'value': 1
        });
      });

      // Audio errors
      document.addEventListener('audioError', (e) => {
        this.event('audio_error', {
          'event_category': 'error',
          'event_label': e.detail.error,
          'value': 1
        });
      });
    }

    // Generic event tracking
    event(eventName, parameters = {}) {
      if (window.gtag) {
        window.gtag('event', eventName, parameters);
      }
    }

    // Custom methods for specific tracking
    trackFeature(featureName) {
      this.event('feature_used', {
        'event_category': 'feature',
        'event_label': featureName
      });
    }

    trackAudio(category, action, label = '', value = null) {
      const params = {
        'event_category': category,
        'event_label': label
      };
      if (value !== null) params.value = value;

      this.event(`audio_${action}`, params);
    }

    trackConversion(conversionType, label = '') {
      this.event('conversion', {
        'event_category': 'conversion',
        'event_label': conversionType,
        'value': 1
      });
    }
  }

  // Initialize analytics if IDs are provided
  let analyticsInstance = null;
  if (gaId || clarityId) {
    analyticsInstance = new SoundFlowsAnalytics(gaId, clarityId);
    window.soundFlowsAnalytics = analyticsInstance;
  }

  // Export to global scope for manual tracking
  window.trackEvent = function(eventName, params) {
    if (analyticsInstance) {
      analyticsInstance.event(eventName, params);
    }
  };

  window.trackFeature = function(featureName) {
    if (analyticsInstance) {
      analyticsInstance.trackFeature(featureName);
    }
  };

  window.trackAudio = function(category, action, label, value) {
    if (analyticsInstance) {
      analyticsInstance.trackAudio(category, action, label, value);
    }
  };

  // Debug helper
  window.debugAnalytics = function() {
    console.log('Analytics Status:', {
      gaId: gaId,
      clarityId: clarityId,
      initialized: analyticsInstance ? analyticsInstance.isInitialized : false,
      hasGtag: typeof window.gtag !== 'undefined',
      hasClarity: typeof window.clarity !== 'undefined'
    });
  };
})();





