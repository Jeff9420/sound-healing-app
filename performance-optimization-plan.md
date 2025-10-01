# SoundFlows Performance Optimization Implementation Plan

## Phase 1: Critical Optimizations (Immediate Impact)

### 1.1 Critical CSS Extraction and Inlining

Create a tool to extract critical CSS:

```javascript
// assets/js/critical-css-extractor.js
class CriticalCSSExtractor {
  constructor() {
    this.criticalSelectors = [
      'body', 'html', '.panel', '.grid', '.control-btn',
      '.mountain', '.brand-section', '.status-cards',
      '.amplitude-visualization', '.featured-tracks',
      '.audio-controller', '.progress-bar-container',
      '.now-playing-section', '.control-section'
    ];
  }

  extractCriticalRules() {
    const styleSheets = document.styleSheets;
    let criticalCSS = '';

    for (const sheet of styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (this.isCriticalRule(rule)) {
            criticalCSS += rule.cssText + '\n';
          }
        }
      } catch (e) {
        console.warn('Could not access stylesheet rules:', e);
      }
    }

    return criticalCSS;
  }

  isCriticalRule(rule) {
    if (!rule.selectorText) return false;

    return this.criticalSelectors.some(selector =>
      rule.selectorText.includes(selector) ||
      rule.selectorText.startsWith(':root') ||
      rule.selectorText.startsWith('*')
    );
  }

  generateInlineCSS() {
    const criticalCSS = this.extractCriticalRules();

    // Minify the CSS
    const minified = criticalCSS
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\n\s*/g, '')
      .replace(/\s*([{}:;,])\s*/g, '$1')
      .replace(/;\s*}/g, '}');

    return minified;
  }
}
```

Update index.html to inline critical CSS:

```html
<head>
  <!-- Inline critical CSS for faster first paint -->
  <style>
    /* Critical CSS will be injected here by build process */
    :root{--bg-tint:linear-gradient(135deg,rgba(45,35,65,.85)0%,rgba(35,25,45,.9)40%,rgba(25,35,55,.95)100%);--fg:#fff;--accent:#e8b86d;--panel-bg:rgba(255,248,235,.18);--panel-br:16px;--shadow:0 12px 40px rgba(25,15,35,.3)}*,:after,:before{box-sizing:border-box}html,body{height:100%}body{margin:0;color:var(--fg);font:14px/1.5 system-ui,-apple-system,sans-serif;background:var(--bg-tint);background-size:100% 100%;background-attachment:fixed;overflow:auto}.panel{background:var(--panel-bg);border-radius:var(--panel-br);box-shadow:var(--shadow);padding:20px;margin-bottom:20px;position:relative}.control-btn{padding:12px 24px;border-radius:8px;background:var(--accent);color:var(--fg);cursor:pointer;font:inherit;border:none;transition:all .3s ease}.control-btn:hover{opacity:.8;transform:translateY(-2px)}
  </style>

  <!-- Load full CSS asynchronously -->
  <link rel="preload" href="assets/css/app.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <link rel="preload" href="assets/css/mobile-enhancement.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript>
    <link rel="stylesheet" href="assets/css/app.css">
    <link rel="stylesheet" href="assets/css/mobile-enhancement.css">
  </noscript>
</head>
```

### 1.2 JavaScript Loading Optimization

Update script loading with proper attributes:

```html
<!-- Defer non-critical JavaScript -->
<script src="assets/js/audio-config.js" defer></script>
<script src="assets/js/analytics-config.js" defer></script>

<!-- Load critical JS with async -->
<script src="assets/js/browser-compatibility.js" async></script>

<!-- Defer remaining scripts -->
<script src="assets/js/cookie-consent.js" defer></script>
<script src="assets/js/analytics.js" defer></script>
<script src="assets/js/share-module.js" defer></script>
<script src="assets/js/onboarding-tutorial.js" defer></script>
<script src="assets/js/featured-tracks.js" defer></script>
<script src="assets/js/mobile-optimization.js" defer></script>
<script src="assets/js/audio-preloader.js" defer></script>
<script src="assets/js/app-new-ui.js" defer></script>

<!-- Add preconnect for external resources -->
<link rel="preconnect" href="https://archive.org">
<link rel="preconnect" href="https://www.google-analytics.com">
```

### 1.3 Smart Audio Preloading Implementation

Create an enhanced audio preloader:

```javascript
// assets/js/smart-audio-preloader.js
class SmartAudioPreloader {
  constructor() {
    this.preloadedTracks = new Map();
    this.loadingQueue = [];
    this.maxConcurrentLoads = 3;
    this.currentLoads = 0;
    this.preloadBudget = 30 * 1024 * 1024; // 30MB preload budget
    this.usedBudget = 0;
    this.userBehavior = new UserBehaviorTracker();
  }

  initialize() {
    // Preload samples from each category
    this.preloadCategorySamples();

    // Setup event listeners for intelligent preloading
    this.setupEventListeners();

    // Start background preloading
    this.startBackgroundPreloading();
  }

  preloadCategorySamples() {
    Object.entries(AUDIO_CONFIG.categories).forEach(([category, data]) => {
      if (data.files && data.files.length > 0) {
        // Preload first track of each category
        const firstTrack = data.files[0];
        this.addToQueue(category, firstTrack, 'sample', 'high');
      }
    });
  }

  addToQueue(category, fileName, type, priority = 'medium') {
    const trackId = `${category}__${fileName}`;

    if (this.preloadedTracks.has(trackId)) return;

    this.loadingQueue.push({
      category,
      fileName,
      trackId,
      type,
      priority,
      timestamp: Date.now()
    });

    // Sort by priority
    this.loadingQueue.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    this.processQueue();
  }

  async processQueue() {
    if (this.currentLoads >= this.maxConcurrentLoads ||
        this.loadingQueue.length === 0 ||
        this.usedBudget >= this.preloadBudget) {
      return;
    }

    const item = this.loadingQueue.shift();
    this.currentLoads++;

    try {
      const audio = new Audio();

      // Load metadata first to get file size
      audio.preload = 'metadata';
      audio.src = this.getAudioUrl(item.category, item.fileName);

      await new Promise((resolve, reject) => {
        audio.addEventListener('loadedmetadata', resolve);
        audio.addEventListener('error', reject);
      });

      // Check if we have budget for this file
      const estimatedSize = this.estimateAudioSize(audio.duration);

      if (this.usedBudget + estimatedSize <= this.preloadBudget) {
        // Actually preload the audio
        audio.preload = 'auto';

        await new Promise((resolve, reject) => {
          audio.addEventListener('canplaythrough', resolve);
          audio.addEventListener('error', reject);
        });

        this.preloadedTracks.set(item.trackId, {
          audio,
          size: estimatedSize,
          preloadTime: Date.now()
        });

        this.usedBudget += estimatedSize;

        console.log(`Preloaded: ${item.fileName} (${this.formatBytes(estimatedSize)})`);
      }

    } catch (error) {
      console.warn(`Failed to preload ${item.fileName}:`, error);
    } finally {
      this.currentLoads--;
      this.processQueue();
    }
  }

  setupEventListeners() {
    // Preload next tracks when user starts playing
    window.addEventListener('playback-started', (e) => {
      const { category, currentIndex } = e.detail;
      this.preloadNextTracks(category, currentIndex);
    });

    // Preload based on user hover/click patterns
    document.addEventListener('mouseover', (e) => {
      const trackElement = e.target.closest('[data-track]');
      if (trackElement) {
        const { category, fileName } = trackElement.dataset;
        this.addToQueue(category, fileName, 'hover', 'medium');
      }
    }, { passive: true });
  }

  preloadNextTracks(category, currentIndex) {
    const categoryData = AUDIO_CONFIG.categories[category];
    if (!categoryData || !categoryData.files) return;

    // Preload next 2 tracks
    for (let i = 1; i <= 2; i++) {
      const nextIndex = currentIndex + i;
      if (nextIndex < categoryData.files.length) {
        this.addToQueue(category, categoryData.files[nextIndex], 'next', 'high');
      }
    }

    // Preload previous track
    if (currentIndex > 0) {
      this.addToQueue(category, categoryData.files[currentIndex - 1], 'prev', 'medium');
    }
  }

  startBackgroundPreloading() {
    // Use idle time for background preloading
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.preloadPopularTracks();
      });
    } else {
      setTimeout(() => {
        this.preloadPopularTracks();
      }, 5000);
    }
  }

  preloadPopularTracks() {
    // Get most played tracks from localStorage
    const playHistory = JSON.parse(localStorage.getItem('playHistory') || '[]');
    const popularTracks = this.getMostPlayedTracks(playHistory, 5);

    popularTracks.forEach(({ category, fileName }) => {
      this.addToQueue(category, fileName, 'popular', 'low');
    });
  }

  getMostPlayedTracks(history, limit) {
    const trackCounts = {};

    history.forEach(item => {
      const key = `${item.category}__${item.fileName}`;
      trackCounts[key] = (trackCounts[key] || 0) + 1;
    });

    return Object.entries(trackCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([key]) => {
        const [category, fileName] = key.split('__');
        return { category, fileName };
      });
  }

  estimateAudioSize(duration) {
    // Estimate based on bitrate (assume 128kbps for MP3)
    const bitrate = 128; // kbps
    return (duration * bitrate) / 8; // Size in KB
  }

  formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getAudioUrl(category, fileName) {
    const baseUrl = AUDIO_CONFIG.baseUrl;
    const folder = AUDIO_CONFIG.categories[category]?.folder || category;
    return `${baseUrl}${folder}/${encodeURIComponent(fileName)}`;
  }
}

// User behavior tracking for intelligent preloading
class UserBehaviorTracker {
  constructor() {
    this.patterns = {
      timeOfDay: {},
      categorySequence: [],
      sessionDuration: 0,
      skipPatterns: {}
    };
    this.loadStoredPatterns();
  }

  recordPlay(category, fileName) {
    // Record time pattern
    const hour = new Date().getHours();
    this.patterns.timeOfDay[hour] = this.patterns.timeOfDay[hour] || {};
    this.patterns.timeOfDay[hour][category] = (this.patterns.timeOfDay[hour][category] || 0) + 1;

    // Record sequence
    this.patterns.categorySequence.push(category);
    if (this.patterns.categorySequence.length > 10) {
      this.patterns.categorySequence.shift();
    }

    this.savePatterns();
  }

  predictNextCategory() {
    const sequence = this.patterns.categorySequence;
    if (sequence.length < 2) return null;

    // Simple Markov chain prediction
    const lastCategory = sequence[sequence.length - 1];
    const transitions = {};

    for (let i = 0; i < sequence.length - 1; i++) {
      const from = sequence[i];
      const to = sequence[i + 1];

      if (from === lastCategory) {
        transitions[to] = (transitions[to] || 0) + 1;
      }
    }

    // Return most likely next category
    return Object.entries(transitions)
      .sort((a, b) => b[1] - a[1])
      [0]?.[0];
  }

  savePatterns() {
    localStorage.setItem('userPatterns', JSON.stringify(this.patterns));
  }

  loadStoredPatterns() {
    const stored = localStorage.getItem('userPatterns');
    if (stored) {
      this.patterns = JSON.parse(stored);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.smartAudioPreloader = new SmartAudioPreloader();
  window.smartAudioPreloader.initialize();
});
```

### 1.4 Enhanced Service Worker with Intelligent Caching

Update the service worker:

```javascript
// sw.js (Enhanced Version)
const CACHE_VERSION = 'v3.0.0';
const CACHE_NAME = `soundflows-${CACHE_VERSION}`;

// Cache strategies
const STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Cache tiers
const CACHE_TIERS = {
  STATIC: 'static-v3',
  AUDIO: 'audio-v3',
  DYNAMIC: 'dynamic-v3',
  RUNTIME: 'runtime-v3'
};

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_TIERS.STATIC).then(cache => {
        return cache.addAll([
          '/',
          '/index.html',
          '/manifest.json',
          '/assets/css/app.min.css',
          '/assets/css/mobile-enhancement.min.css',
          '/assets/js/app-new-ui.min.js',
          '/assets/js/audio-config.js'
        ]);
      }),
      precacheCriticalAudio()
    ])
  );

  self.skipWaiting();
});

// Precalculate audio files
async function precacheCriticalAudio() {
  if (navigator.connection?.saveData) return;

  const connectionType = navigator.connection?.effectiveType;
  if (connectionType === 'slow-2g' || connectionType === '2g') return;

  const audioCache = await caches.open(CACHE_TIERS.AUDIO);
  const criticalAudio = [
    '/assets/audio/meditation/Deep%20Meditation.mp3',
    '/assets/audio/Rain/Gentle%20Rain.mp3'
  ];

  await Promise.allSettled(
    criticalAudio.map(url =>
      fetch(url)
        .then(response => {
          if (response.ok) {
            // Check size before caching
            const contentLength = response.headers.get('content-length');
            if (contentLength && parseInt(contentLength) < 5 * 1024 * 1024) {
              return audioCache.put(url, response);
            }
          }
        })
        .catch(() => console.log(`Failed to precache: ${url}`))
    )
  );
}

// Fetch event with intelligent caching
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Handle different resource types
  if (url.pathname.endsWith('.mp3') || url.pathname.endsWith('.wav')) {
    event.respondWith(handleAudioRequest(request));
  } else if (isStaticResource(url.pathname)) {
    event.respondWith(handleStaticRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

// Audio request handler
async function handleAudioRequest(request) {
  const cache = await caches.open(CACHE_TIERS.AUDIO);

  // Try cache first
  const cached = await cache.match(request);

  if (cached) {
    // Revalidate in background
    fetch(request)
      .then(response => {
        if (response.ok) {
          cache.put(request, response);
        }
      })
      .catch(() => {});

    return cached;
  }

  // Network request with fallback
  try {
    const response = await fetch(request);

    if (response.ok) {
      // Clone response for caching
      const responseClone = response.clone();

      // Check cache size
      const cacheSize = await getCacheSize(CACHE_TIERS.AUDIO);
      if (cacheSize < 100 * 1024 * 1024) { // 100MB limit
        cache.put(request, responseClone);
      }
    }

    return response;
  } catch (error) {
    // Return cached version if network fails
    return cached || new Response('Offline', { status: 503 });
  }
}

// Static resource handler
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_TIERS.STATIC);
  const cached = await cache.match(request);

  if (cached) {
    // Background update
    fetch(request)
      .then(response => {
        if (response.ok) {
          cache.put(request, response);
        }
      })
      .catch(() => {});

    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return cached version for navigation requests
    if (request.mode === 'navigate') {
      return cache.match('/index.html');
    }
    throw error;
  }
}

// Dynamic request handler
async function handleDynamicRequest(request) {
  const cache = await caches.open(CACHE_TIERS.DYNAMIC);
  const cached = await cache.match(request);

  if (cached) {
    // Check if cache is stale (older than 1 hour)
    const dateHeader = cached.headers.get('date');
    const cacheDate = new Date(dateHeader);
    const cacheAge = Date.now() - cacheDate.getTime();

    if (cacheAge > 3600000) { // 1 hour
      // Update in background
      fetch(request)
        .then(response => {
          if (response.ok) {
            cache.put(request, response);
          }
        });
    }

    return cached;
  }

  return fetch(request);
}

// Helper functions
function isStaticResource(pathname) {
  return pathname.includes('/assets/') ||
         pathname.endsWith('.css') ||
         pathname.endsWith('.js') ||
         pathname.endsWith('.html') ||
         pathname.endsWith('.png') ||
         pathname.endsWith('.jpg') ||
         pathname.endsWith('.svg') ||
         pathname.endsWith('.ico') ||
         pathname === '/';
}

async function getCacheSize(cacheName) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  let totalSize = 0;

  for (const request of keys) {
    const response = await cache.match(request);
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      totalSize += parseInt(contentLength);
    }
  }

  return totalSize;
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'playback-sync') {
    event.waitUntil(syncPlaybackData());
  }
});

async function syncPlaybackData() {
  // Sync offline playback data when online
  const offlineData = await getOfflinePlaybackData();
  if (offlineData.length > 0) {
    await sendToServer(offlineData);
    await clearOfflineData();
  }
}

// Message handling
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CLEAN_CACHE') {
    event.waitUntil(cleanCache());
  }
});

async function cleanCache() {
  const cacheNames = await caches.keys();

  await Promise.all(
    cacheNames.map(cacheName => {
      if (!cacheName.includes(CACHE_VERSION)) {
        return caches.delete(cacheName);
      }
    })
  );
}

console.log(`SoundFlows Service Worker ${CACHE_VERSION} loaded`);
```

### 1.5 Performance Budget Monitoring

Add performance budget checking:

```javascript
// assets/js/performance-budget.js
class PerformanceBudget {
  constructor() {
    this.budgets = {
      totalJS: 100 * 1024, // 100KB
      totalCSS: 50 * 1024, // 50KB
      FCP: 2000, // 2s
      LCP: 2500, // 2.5s
      FID: 100, // 100ms
      CLS: 0.1
    };

    this.violations = [];
    this.initialize();
  }

  initialize() {
    // Check resource sizes
    this.checkResourceSizes();

    // Monitor Core Web Vitals
    this.monitorWebVitals();

    // Check at runtime
    this.checkRuntimePerformance();
  }

  checkResourceSizes() {
    // Check JavaScript bundle sizes
    const scripts = document.querySelectorAll('script[src]');
    let totalJSSize = 0;

    scripts.forEach(script => {
      const url = new URL(script.src);
      if (url.hostname === location.hostname) {
        fetch(script.src, { method: 'HEAD' })
          .then(response => {
            const size = parseInt(response.headers.get('content-length') || 0);
            totalJSSize += size;

            if (totalJSSize > this.budgets.totalJS) {
              this.reportViolation('totalJS', totalJSSize);
            }
          });
      }
    });

    // Check CSS sizes
    const styles = document.querySelectorAll('link[rel="stylesheet"]');
    let totalCSSSize = 0;

    styles.forEach(style => {
      fetch(style.href, { method: 'HEAD' })
        .then(response => {
          const size = parseInt(response.headers.get('content-length') || 0);
          totalCSSSize += size;

          if (totalCSSSize > this.budgets.totalCSS) {
            this.reportViolation('totalCSS', totalCSSSize);
          }
        });
    });
  }

  monitorWebVitals() {
    // Load web-vitals library
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/web-vitals';
    script.onload = () => {
      // Monitor FCP
      webVitals.getFCP(metric => {
        if (metric.value > this.budgets.FCP) {
          this.reportViolation('FCP', metric.value);
        }
      });

      // Monitor LCP
      webVitals.getLCP(metric => {
        if (metric.value > this.budgets.LCP) {
          this.reportViolation('LCP', metric.value);
        }
      });

      // Monitor FID
      webVitals.getFID(metric => {
        if (metric.value > this.budgets.FID) {
          this.reportViolation('FID', metric.value);
        }
      });

      // Monitor CLS
      webVitals.getCLS(metric => {
        if (metric.value > this.budgets.CLS) {
          this.reportViolation('CLS', metric.value);
        }
      });
    };
    document.head.appendChild(script);
  }

  checkRuntimePerformance() {
    // Check memory usage
    if (performance.memory) {
      setInterval(() => {
        const used = performance.memory.usedJSHeapSize;
        const total = performance.memory.jsHeapSizeLimit;
        const usage = (used / total) * 100;

        if (usage > 80) {
          this.reportViolation('memoryUsage', usage);
        }
      }, 30000);
    }

    // Check long tasks
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // 50ms threshold
          this.reportViolation('longTask', entry.duration);
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
  }

  reportViolation(type, value) {
    const violation = {
      type,
      value,
      timestamp: Date.now(),
      url: location.href,
      userAgent: navigator.userAgent
    };

    this.violations.push(violation);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Performance budget violation: ${type}`, violation);
    }

    // Send to analytics
    this.sendToAnalytics(violation);

    // Store locally
    this.storeViolation(violation);
  }

  sendToAnalytics(violation) {
    if (window.gtag) {
      gtag('event', 'performance_violation', {
        event_category: 'Performance',
        event_label: violation.type,
        value: Math.round(violation.value)
      });
    }
  }

  storeViolation(violation) {
    const violations = JSON.parse(localStorage.getItem('performanceViolations') || '[]');
    violations.push(violation);

    // Keep only last 100 violations
    if (violations.length > 100) {
      violations.shift();
    }

    localStorage.setItem('performanceViolations', JSON.stringify(violations));
  }

  getReport() {
    return {
      budgets: this.budgets,
      violations: this.violations.slice(-50), // Last 50 violations
      summary: this.generateSummary()
    };
  }

  generateSummary() {
    const summary = {};

    this.violations.forEach(violation => {
      summary[violation.type] = (summary[violation.type] || 0) + 1;
    });

    return summary;
  }
}

// Initialize performance budget monitoring
document.addEventListener('DOMContentLoaded', () => {
  window.performanceBudget = new PerformanceBudget();
});
```

### 1.6 Web Vitals Implementation

Add comprehensive Web Vitals monitoring:

```javascript
// assets/js/web-vitals-monitor.js
// Load web-vitals library dynamically
class WebVitalsMonitor {
  constructor() {
    this.metrics = {
      FCP: null,
      LCP: null,
      FID: null,
      CLS: null,
      TTFB: null,
      INP: null // Interaction to Next Paint
    };

    this.thresholds = {
      GOOD: { FCP: 1800, LCP: 2500, FID: 100, CLS: 0.1, TTFB: 600, INP: 200 },
      NEEDS_IMPROVEMENT: { FCP: 3000, LCP: 4000, FID: 300, CLS: 0.25, TTFB: 1500, INP: 500 }
    };

    this.initialize();
  }

  async initialize() {
    await this.loadWebVitals();
    this.setupPerformanceObserver();
    this.startMonitoring();
  }

  async loadWebVitals() {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js';
      script.onload = resolve;
      document.head.appendChild(script);
    });
  }

  setupPerformanceObserver() {
    // Custom metrics
    if ('PerformanceObserver' in window) {
      // Measure CLS more accurately
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            if (this.metrics.CLS === null) {
              this.metrics.CLS = 0;
            }
            this.metrics.CLS += entry.value;
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Measure TTFB
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          const navigation = entries[0];
          this.metrics.TTFB = navigation.responseStart - navigation.requestStart;
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });

      // Measure INP (Interaction to Next Paint)
      const inpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.interactionType) {
            const inp = entry.duration;
            if (!this.metrics.INP || inp > this.metrics.INP) {
              this.metrics.INP = inp;
            }
          }
        });
      });
      inpObserver.observe({ entryTypes: ['event'] });
    }
  }

  startMonitoring() {
    // Core Web Vitals
    webVitals.getFCP((metric) => {
      this.metrics.FCP = metric.value;
      this.reportMetric('FCP', metric);
    });

    webVitals.getLCP((metric) => {
      this.metrics.LCP = metric.value;
      this.reportMetric('LCP', metric);
    });

    webVitals.getFID((metric) => {
      this.metrics.FID = metric.value;
      this.reportMetric('FID', metric);
    });

    webVitals.getCLS((metric) => {
      this.metrics.CLS = metric.value;
      this.reportMetric('CLS', metric);
    });

    webVitals.getTTFB((metric) => {
      this.metrics.TTFB = metric.value;
      this.reportMetric('TTFB', metric);
    });

    webVitals.getINP((metric) => {
      this.metrics.INP = metric.value;
      this.reportMetric('INP', metric);
    });
  }

  reportMetric(name, metric) {
    const rating = this.getRating(name, metric.value);

    console.log(`${name}: ${metric.value.toFixed(2)} (${rating})`);

    // Send to analytics
    if (window.gtag) {
      gtag('event', 'web_vitals', {
        event_category: 'Performance',
        event_label: name,
        value: Math.round(metric.value),
        custom_parameter_1: rating
      });
    }

    // Store for debugging
    this.storeMetric(name, metric);

    // Check for performance issues
    if (rating === 'POOR') {
      this.handlePoorPerformance(name, metric);
    }
  }

  getRating(name, value) {
    const thresholds = this.thresholds;

    if (value <= thresholds.GOOD[name]) {
      return 'GOOD';
    } else if (value <= thresholds.NEEDS_IMPROVEMENT[name]) {
      return 'NEEDS_IMPROVEMENT';
    } else {
      return 'POOR';
    }
  }

  storeMetric(name, metric) {
    const metrics = JSON.parse(localStorage.getItem('webVitalsMetrics') || '{}');

    metrics[name] = {
      value: metric.value,
      id: metric.id,
      rating: this.getRating(name, metric.value),
      timestamp: Date.now(),
      navigationType: metric.navigationType,
      ...metric.attribution
    };

    localStorage.setItem('webVitalsMetrics', JSON.stringify(metrics));
  }

  handlePoorPerformance(name, metric) {
    // Implement corrective actions
    switch (name) {
      case 'LCP':
        this.optimizeLCP();
        break;
      case 'FID':
        this.optimizeFID();
        break;
      case 'CLS':
        this.optimizeCLS();
        break;
    }
  }

  optimizeLCP() {
    // Preload largest contentful element
    const lcpElement = document.querySelector('img, video, canvas, svg');
    if (lcpElement) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = lcpElement.tagName === 'IMG' ? 'image' : 'video';
      link.href = lcpElement.src || lcpElement.currentSrc;
      document.head.appendChild(link);
    }
  }

  optimizeFID() {
    // Reduce main thread work
    const longTasks = performance.getEntriesByType('longtask');
    longTasks.forEach(task => {
      console.warn('Long task detected:', task.duration, 'ms');
    });
  }

  optimizeCLS() {
    // Ensure images have dimensions
    document.querySelectorAll('img:not([width]):not([height])').forEach(img => {
      img.addEventListener('load', function() {
        this.setAttribute('width', this.naturalWidth);
        this.setAttribute('height', this.naturalHeight);
      });
    });
  }

  getPerformanceReport() {
    const report = {
      metrics: this.metrics,
      ratings: {},
      recommendations: []
    };

    // Calculate ratings
    Object.keys(this.metrics).forEach(name => {
      if (this.metrics[name] !== null) {
        report.ratings[name] = this.getRating(name, this.metrics[name]);
      }
    });

    // Generate recommendations
    Object.entries(report.ratings).forEach(([name, rating]) => {
      if (rating === 'POOR') {
        report.recommendations.push(this.getRecommendation(name));
      }
    });

    return report;
  }

  getRecommendation(metric) {
    const recommendations = {
      FCP: 'Consider inlining critical CSS and reducing render-blocking resources',
      LCP: 'Optimize images, preload key resources, and reduce server response times',
      FID: 'Reduce JavaScript execution time and break up long tasks',
      CLS: 'Ensure images and embeds have explicit dimensions and avoid inserting content above existing content',
      TTFB: 'Optimize server response times and use CDN for static assets',
      INP: 'Reduce JavaScript execution time and optimize event handlers'
    };

    return recommendations[metric];
  }
}

// Initialize monitoring
document.addEventListener('DOMContentLoaded', () => {
  window.webVitalsMonitor = new WebVitalsMonitor();
});
```

## Implementation Steps for Phase 1

1. **Week 1**:
   - Extract and inline critical CSS
   - Update script loading attributes
   - Implement smart audio preloader
   - Update service worker

2. **Week 2**:
   - Add performance budget monitoring
   - Implement Web Vitals tracking
   - Test on various devices and network conditions
   - Measure performance improvements

## Expected Improvements After Phase 1

- **First Contentful Paint (FCP)**: 40-50% improvement
- **Largest Contentful Paint (LCP)**: 30-40% improvement
- **Initial Page Load Time**: 35-45% reduction
- **Audio Playback Start Time**: 60-70% improvement through preloading
- **Cache Hit Rate**: 80-90% for static resources
- **Offline Functionality**: Full offline support for core features