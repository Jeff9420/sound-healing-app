/**
 * Analytics Lazy Loader
 * 延迟加载 GTM / GA4 / Amplitude，降低首屏阻塞
 */
(function() {
  if (typeof window === 'undefined') {
    return;
  }

  if (!window.ANALYTICS_CONFIG && window.__ANALYTICS_CONFIG) {
    window.ANALYTICS_CONFIG = window.__ANALYTICS_CONFIG;
  }

  const rawConfig = window.ANALYTICS_CONFIG || window.__ANALYTICS_CONFIG || {};
  const rawOptions = rawConfig.options || {};
  const config = {
    enabled: rawConfig.enabled !== undefined ? rawConfig.enabled : (rawOptions.enabled !== undefined ? rawOptions.enabled : true),
    gtmId: rawConfig.gtmId || rawConfig.googleTagManagerId || rawOptions.gtmId,
    gaId: rawConfig.gaId || rawConfig.gaMeasurementId || rawConfig.gaMeasurementID || rawOptions.gaId,
    amplitudeKey: rawConfig.amplitudeKey || rawConfig.amplitudeApiKey || rawOptions.amplitudeKey,
    loadDelay: rawConfig.loadDelay || rawOptions.loadDelay || 1200,
    amplitudeOptions: rawConfig.amplitudeOptions || rawOptions.amplitudeOptions || {}
  };
  const aiSignatureQueue = window.__pendingAISignatureEvents = window.__pendingAISignatureEvents || [];
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isLocalFile = window.location.protocol === 'file:';
  const saveData = connection && connection.saveData;
  const shouldLoad =
    config.enabled !== false &&
    navigator.onLine !== false &&
    !saveData &&
    !isLocalFile;

  function createTracker(fn) {
    return function (...args) {
      try {
        fn(...args);
      } catch (err) {
        console.warn('[analytics]', err);
      }
    };
  }

  window.trackAudioPlay = window.trackAudioPlay || createTracker((category, trackName) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'audio_play', {
        event_category: 'Audio',
        event_label: `${category} - ${trackName}`,
        audio_category: category,
        track_name: trackName
      });
    }
  });

  window.trackLanguageChange = window.trackLanguageChange || createTracker((language) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'language_change', {
        event_category: 'Engagement',
        event_label: language
      });
    }
  });

  window.trackSleepTimer = window.trackSleepTimer || createTracker((minutes) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'sleep_timer_set', {
        event_category: 'Feature',
        event_label: `${minutes} minutes`,
        timer_duration: minutes
      });
    }
  });

  window.trackShare = window.trackShare || createTracker((platform) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'share', {
        event_category: 'Social',
        event_label: platform,
        method: platform
      });
    }
  });

  window.trackCTA = window.trackCTA || createTracker((ctaName, source) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'cta_click', {
        event_category: 'CTA',
        event_label: ctaName,
        cta_source: source || ''
      });
    }
  });

  function logAISignatureStart(detail) {
    const payload = {
      source: detail && detail.source ? detail.source : 'ai-module',
      hrv: detail && detail.hrv,
      mood: detail && detail.mood,
      language: detail && detail.language ? detail.language : (document.documentElement.lang || 'en'),
      path: detail && detail.path ? detail.path : window.location.pathname,
      timestamp: Date.now()
    };

    if (typeof window.trackCTA === 'function') {
      window.trackCTA('ai_signature_start', payload.source);
    }

    const amplitudeInstance = window.amplitude && typeof window.amplitude.getInstance === 'function'
      ? window.amplitude.getInstance()
      : null;

    if (amplitudeInstance && typeof amplitudeInstance.logEvent === 'function') {
      amplitudeInstance.logEvent('ai_signature_start', payload);
    } else {
      aiSignatureQueue.push(payload);
    }

    const sentryReady = window.Sentry && typeof window.Sentry.captureMessage === 'function';
    if (sentryReady && typeof window.Sentry.addBreadcrumb === 'function') {
      window.Sentry.addBreadcrumb({
        category: 'ai',
        message: 'soundflows.aiSignatureStart',
        data: payload,
        level: 'info'
      });
    }

    if (sentryReady) {
      window.Sentry.captureMessage('ai_signature_start', {
        level: 'info',
        extra: payload
      });
    } else {
      const pendingSentry = window.__pendingAISignatureSentry = window.__pendingAISignatureSentry || [];
      pendingSentry.push(payload);
    }
  }

  function flushAISignatureQueue() {
    if (!aiSignatureQueue.length) {
      return;
    }
    const amplitudeInstance = window.amplitude && typeof window.amplitude.getInstance === 'function'
      ? window.amplitude.getInstance()
      : null;
    if (!amplitudeInstance || typeof amplitudeInstance.logEvent !== 'function') {
      return;
    }
    while (aiSignatureQueue.length) {
      amplitudeInstance.logEvent('ai_signature_start', aiSignatureQueue.shift());
    }
  }

  document.addEventListener('soundflows.aiSignatureStart', (event) => {
    logAISignatureStart((event && event.detail) || {});
  });

  if (!shouldLoad) {
    console.info('[analytics] Disabled (offline/save-data mode)');
    return;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  }

  function initGTM() {
    if (!config.gtmId) return Promise.resolve();
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    return loadScript(`https://www.googletagmanager.com/gtm.js?id=${config.gtmId}`);
  }

  function initGA() {
    if (!config.gaId) return Promise.resolve();
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
    return loadScript(`https://www.googletagmanager.com/gtag/js?id=${config.gaId}`)
      .then(() => {
        window.gtag('js', new Date());
        window.gtag('config', config.gaId, {
          send_page_view: true,
          anonymize_ip: true,
          cookie_flags: 'SameSite=None;Secure'
        });
      });
  }

  function initAmplitude() {
    if (!config.amplitudeKey) return Promise.resolve();
    return loadScript(`https://cdn.amplitude.com/script/${config.amplitudeKey}.js`)
      .then(() => {
        if (window.amplitude && typeof window.amplitude.init === 'function') {
          window.amplitude.init(config.amplitudeKey, null, {
            fetchRemoteConfig: true,
            autocapture: {
              attribution: true,
              fileDownloads: true,
              formInteractions: true,
              pageViews: true,
              sessions: true,
              elementInteractions: true
            }
          });
          console.log('✅ Amplitude SDK initialized lazily');
        }
      })
      .catch((err) => console.warn('[analytics] Amplitude load failed', err));
  }

  const schedule = window.requestIdleCallback || function(cb){ setTimeout(cb, config.loadDelay || 1200); };
  schedule(() => {
    Promise.all([initGTM(), initGA(), initAmplitude()])
      .catch((err) => console.warn('[analytics] initialization error', err));
  });
})();
