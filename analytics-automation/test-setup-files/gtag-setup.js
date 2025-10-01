<!-- Google Analytics 4 Setup for SoundFlows -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-4NZR3HR3J1"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  // GA4 Configuration
  gtag('config', 'G-4NZR3HR3J1', {
    'anonymize_ip': true,
    'cookie_flags': 'SameSite=None;Secure',
    'custom_map': {
      'dimension1': 'audio_category',
      'dimension2': 'audio_format',
      'dimension3': 'device_type',
      'dimension4': 'user_type'
    }
  });

  // Event tracking functions
  function trackEvent(eventName, params = {}) {
    gtag('event', eventName, params);
  }

  // Audio tracking
  function trackAudioPlay(category, trackName, format = 'unknown') {
    trackEvent('audio_play', {
      'audio_category': category,
      'audio_format': format,
      'event_label': trackName,
      'value': 1
    });
  }

  function trackAudioDuration(duration, trackName) {
    trackEvent('audio_duration', {
      'event_category': 'engagement',
      'event_label': trackName,
      'value': duration
    });
  }

  // Feature tracking
  function trackFeature(featureName) {
    trackEvent('feature_used', {
      'event_category': 'feature',
      'event_label': featureName
    });
  }

  // Social tracking
  function trackShare(platform) {
    trackEvent('share', {
      'event_category': 'social',
      'event_label': platform
    });
  }

  // Export to global scope
  window.trackEvent = trackEvent;
  window.trackAudioPlay = trackAudioPlay;
  window.trackAudioDuration = trackAudioDuration;
  window.trackFeature = trackFeature;
  window.trackShare = trackShare;
</script>