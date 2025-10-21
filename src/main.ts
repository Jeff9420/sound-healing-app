/**
 * Main Application Entry Point
 * 主应用入口点
 *
 * @version 3.0.0
 * @author Sound Healing Team
 */

import './styles/main.css'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from './App.vue'
import { routes } from './router'

// ============================================================================
// Application Bootstrap
// ============================================================================

const bootstrapApp = async (): Promise<void> => {
  console.log('🚀 Initializing Sound Healing App v3.0.0...')

  try {
    // 1. Check browser compatibility
    await checkBrowserCompatibility()

    // 2. Initialize performance monitoring
    initializePerformanceMonitoring()

    // 3. Initialize error tracking
    initializeErrorTracking()

    // 4. Initialize service worker (PWA)
    await initializeServiceWorker()

    // 5. Create Vue app
    const app = createApp(App)

    // 6. Setup router
    const router = createRouter({
      history: createWebHistory(),
      routes,
      scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
          return savedPosition
        }
        return { top: 0 }
      }
    })

    // 7. Setup state management
    const pinia = createPinia()

    // 8. Register plugins
    app.use(router)
    app.use(pinia)

    // 9. Global error handler
    app.config.errorHandler = (error, instance, info) => {
      console.error('Vue Error:', error, info)
      // Send to error tracking service
      if (window.gtag) {
        gtag('event', 'exception', {
          description: error.message,
          fatal: false
        })
      }
    }

    // 10. Global properties
    app.config.globalProperties.$formatTime = (seconds: number) => {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = Math.floor(seconds % 60)
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    // 11. Initialize app state
    await initializeAppState()

    // 12. Mount app
    app.mount('#app')

    console.log('✅ Sound Healing App initialized successfully')

    // 13. Track initial load
    trackPerformanceMetrics()

  } catch (error) {
    console.error('❌ Failed to initialize app:', error)
    showErrorScreen(error)
  }
}

// ============================================================================
// Browser Compatibility Check
// ============================================================================

const checkBrowserCompatibility = async (): Promise<void> => {
  const requiredFeatures = [
    'AudioContext',
    'Promise',
    'Map',
    'Set',
    'fetch',
    'localStorage',
    'sessionStorage'
  ]

  const missingFeatures = requiredFeatures.filter(feature => {
    if (feature === 'AudioContext') {
      return !(window.AudioContext || (window as any).webkitAudioContext)
    }
    return !(feature in window)
  })

  if (missingFeatures.length > 0) {
    throw new Error(`Browser compatibility issues: ${missingFeatures.join(', ')}`)
  }

  // Check WebAssembly support for potential optimizations
  if (typeof WebAssembly === 'undefined') {
    console.warn('⚠️ WebAssembly not supported - some features may be slower')
  }

  console.log('✅ Browser compatibility check passed')
}

// ============================================================================
// Performance Monitoring
// ============================================================================

const initializePerformanceMonitoring = (): void => {
  // Observe Core Web Vitals
  if ('PerformanceObserver' in window) {
    try {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const lastEntry = entries[entries.length - 1] as PerformanceEntry
        console.log(`📊 LCP: ${lastEntry.startTime.toFixed(2)}ms`)

        // Send to analytics
        if (window.gtag) {
          gtag('event', 'web_vitals', {
            name: 'LCP',
            value: Math.round(lastEntry.startTime)
          })
        }
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        entries.forEach((entry) => {
          console.log(`📊 FID: ${(entry as any).processingStart - entry.startTime}ms`)

          if (window.gtag) {
            gtag('event', 'web_vitals', {
              name: 'FID',
              value: Math.round((entry as any).processingStart - entry.startTime)
            })
          }
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // Cumulative Layout Shift (CLS)
      let clsValue = 0
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        console.log(`📊 CLS: ${clsValue.toFixed(4)}`)
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })

    } catch (error) {
      console.warn('⚠️ Performance observer setup failed:', error)
    }
  }

  console.log('✅ Performance monitoring initialized')
}

// ============================================================================
// Error Tracking
// ============================================================================

const initializeErrorTracking = (): void => {
  // Global error handler
  window.addEventListener('error', (event) => {
    console.error('Global Error:', event.error)

    // Send to error tracking
    if (window.gtag) {
      gtag('event', 'exception', {
        description: event.error?.message || 'Unknown error',
        fatal: false
      })
    }
  })

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason)

    if (window.gtag) {
      gtag('event', 'exception', {
        description: `Unhandled promise rejection: ${event.reason}`,
        fatal: false
      })
    }
  })

  console.log('✅ Error tracking initialized')
}

// ============================================================================
// Service Worker (PWA)
// ============================================================================

const initializeServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log('✅ Service Worker registered:', registration.scope)

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              showUpdateNotification()
            }
          })
        }
      })

    } catch (error) {
      console.warn('⚠️ Service Worker registration failed:', error)
    }
  } else {
    console.warn('⚠️ Service Worker not supported')
  }
}

// ============================================================================
// App State Initialization
// ============================================================================

const initializeAppState = async (): Promise<void> => {
  // Import stores dynamically to avoid circular dependencies
  const { useAppStateStore, useUIStore, usePreferencesStore } = await import('@/stores')

  const appState = useAppStateStore()
  const uiStore = useUIStore()
  const preferencesStore = usePreferencesStore()

  // Set app as initialized
  appState.setInitialized(true)

  // Set loading state
  uiStore.setLoading(false)

  // Apply user preferences
  document.documentElement.lang = preferencesStore.language
  document.documentElement.setAttribute('data-theme', preferencesStore.theme)

  // Apply accessibility preferences
  if (preferencesStore.highContrast) {
    document.documentElement.setAttribute('data-high-contrast', 'true')
  }

  if (preferencesStore.reducedMotion) {
    document.documentElement.setAttribute('data-reduced-motion', 'true')
  }

  console.log('✅ App state initialized')
}

// ============================================================================
// Utility Functions
// ============================================================================

const trackPerformanceMetrics = (): void => {
  // Track page load time
  if (window.performance && window.performance.timing) {
    const timing = window.performance.timing
    const loadTime = timing.loadEventEnd - timing.navigationStart
    console.log(`📊 Page load time: ${loadTime}ms`)

    if (window.gtag) {
      gtag('event', 'page_load_time', {
        value: loadTime
      })
    }
  }

  // Track user engagement
  let startTime = Date.now()

  window.addEventListener('beforeunload', () => {
    const engagementTime = Date.now() - startTime
    console.log(`📊 Session engagement: ${engagementTime}ms`)

    if (window.gtag) {
      gtag('event', 'user_engagement', {
        value: Math.round(engagementTime / 1000) // Convert to seconds
      })
    }
  })
}

const showUpdateNotification = (): void => {
  // Show update notification to user
  const { useUIStore } = require('@/stores')
  const uiStore = useUIStore()

  uiStore.addNotification({
    type: 'info',
    title: 'Update Available',
    message: 'A new version of the app is available. Please refresh to update.',
    actions: [
      {
        label: 'Refresh',
        action: () => {
          window.location.reload()
        },
        primary: true
      }
    ]
  })
}

const showErrorScreen = (error: Error): void => {
  const appElement = document.getElementById('app')
  if (appElement) {
    appElement.innerHTML = `
      <div class="error-screen">
        <div class="error-content">
          <h1>Oops! Something went wrong</h1>
          <p>We're sorry, but the Sound Healing app couldn't start properly.</p>
          <details>
            <summary>Technical Details</summary>
            <pre>${error.message}</pre>
          </details>
          <button onclick="window.location.reload()">Try Again</button>
        </div>
      </div>
    `
  }
}

// ============================================================================
// Start Application
// ============================================================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapApp)
} else {
  bootstrapApp()
}

// Export for testing
export { bootstrapApp }