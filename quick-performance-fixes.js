// Quick Performance Fixes for SoundFlows
// Implement these immediately for significant performance gains

// 1. Implement Critical CSS Inlining (Add to head of index.html)
const CRITICAL_CSS = `
:root{--bg-tint:linear-gradient(135deg,rgba(45,35,65,.85)0%,rgba(35,25,45,.9)40%,rgba(25,35,55,.95)100%);--fg:#fff;--accent:#e8b86d;--panel-bg:rgba(255,248,235,.18);--panel-br:16px;--shadow:0 12px 40px rgba(25,15,35,.3)}
*,::after,::before{box-sizing:border-box}html,body{height:100%}
body{margin:0;color:var(--fg);font:14px/1.5 system-ui,-apple-system,sans-serif;background:var(--bg-tint);background-size:100% 100%;background-attachment:fixed;overflow:auto}
.grid{display:grid;grid-template-columns:320px 1fr;gap:20px;max-width:1400px;margin:0 auto;padding:20px}
.panel{background:var(--panel-bg);border-radius:var(--panel-br);box-shadow:var(--shadow);padding:20px;margin-bottom:20px;position:relative}
.control-btn{padding:12px 24px;border-radius:8px;background:var(--accent);color:var(--fg);cursor:pointer;font:inherit;border:none;transition:all .3s ease}
.control-btn:hover{opacity:.8;transform:translateY(-2px)}
.progress-bar-container{width:100%;height:6px;background:rgba(255,255,255,.2);border-radius:3px;cursor:pointer;position:relative;overflow:hidden}
.progress-bar-fill{height:100%;background:var(--accent);border-radius:3px;transition:width .1s linear;position:absolute;left:0;top:0}
`;

// Function to inject critical CSS
function injectCriticalCSS() {
  const style = document.createElement('style');
  style.textContent = CRITICAL_CSS;
  document.head.insertBefore(style, document.head.firstChild);
}

// 2. Optimize script loading
function optimizeScriptLoading() {
  // Find all scripts
  const scripts = document.querySelectorAll('script[src]');

  scripts.forEach(script => {
    // Skip critical scripts
    if (script.src.includes('audio-config.js') || script.src.includes('app-new-ui.js')) {
      return;
    }

    // Add async/defer attributes
    if (!script.async && !script.defer) {
      // Defer most scripts
      script.defer = true;
    }
  });
}

// 3. Implement Quick Audio Preload
class QuickAudioPreloader {
  constructor() {
    this.preloaded = new Map();
    this.preloadNext = 2; // Preload next 2 tracks
  }

  preloadTrack(category, fileName) {
    const trackId = `${category}__${fileName}`;

    if (this.preloaded.has(trackId)) {
      return Promise.resolve(this.preloaded.get(trackId));
    }

    const audio = new Audio();
    audio.preload = 'auto';

    // Get the correct URL
    const baseUrl = AUDIO_CONFIG?.baseUrl || 'https://archive.org/download/sound-healing-collection/';
    const folder = AUDIO_CONFIG?.categories?.[category]?.folder || category;
    audio.src = `${baseUrl}${folder}/${encodeURIComponent(fileName)}`;

    const promise = new Promise((resolve, reject) => {
      audio.addEventListener('canplaythrough', () => {
        this.preloaded.set(trackId, audio);
        resolve(audio);
      });

      audio.addEventListener('error', reject);
    });

    return promise;
  }

  preloadNextTracks(currentCategory, currentIndex) {
    const category = AUDIO_CONFIG?.categories?.[currentCategory];
    if (!category || !category.files) return;

    // Preload next tracks
    for (let i = 1; i <= this.preloadNext; i++) {
      const nextIndex = currentIndex + i;
      if (nextIndex < category.files.length) {
        this.preloadTrack(currentCategory, category.files[nextIndex]);
      }
    }
  }
}

// 4. Basic Performance Monitoring
function startBasicPerformanceMonitoring() {
  // Track page load metrics
  window.addEventListener('load', () => {
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');

      const metrics = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime
      };

      console.log('📊 Performance Metrics:', metrics);

      // Store for analysis
      localStorage.setItem('performanceMetrics', JSON.stringify({
        ...metrics,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      }));
    }, 0);
  });

  // Monitor memory usage
  if (performance.memory) {
    setInterval(() => {
      const memory = {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };

      if (memory.used > memory.limit * 0.9) {
        console.warn('⚠️ High memory usage detected:', memory);

        // Clear some memory if possible
        if (window.gc) window.gc();
      }
    }, 30000);
  }
}

// 5. Quick Resource Hints
function addResourceHints() {
  // Preconnect to Archive.org
  const preconnect = document.createElement('link');
  preconnect.rel = 'preconnect';
  preconnect.href = 'https://archive.org';
  document.head.appendChild(preconnect);

  // DNS prefetch for Google Analytics
  const dnsPrefetch = document.createElement('link');
  dnsPrefetch.rel = 'dns-prefetch';
  dnsPrefetch.href = 'https://www.google-analytics.com';
  document.head.appendChild(dnsPrefetch);
}

// 6. Lazy load non-critical images
function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]');

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
}

// Initialize all optimizations
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Applying quick performance optimizations...');

  // Apply fixes
  injectCriticalCSS();
  optimizeScriptLoading();
  addResourceHints();
  startBasicPerformanceMonitoring();
  lazyLoadImages();

  // Initialize audio preloader
  window.quickAudioPreloader = new QuickAudioPreloader();

  console.log('✅ Quick optimizations applied successfully!');
});

// Export for use in other scripts
window.SoundFlowsPerformance = {
  QuickAudioPreloader,
  startBasicPerformanceMonitoring,
  lazyLoadImages
};