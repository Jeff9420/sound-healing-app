/**
 * Advanced Performance Monitoring System
 * 高级性能监控系统
 *
 * @version 3.0.0
 * @author Sound Healing Team
 */

import type { PerformanceMetrics, AnalyticsEvent } from '@/types'

// ============================================================================
// Performance Monitor Singleton
// ============================================================================

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private observers: Map<string, PerformanceObserver> = new Map()
  private metrics: PerformanceMetrics
  private isMonitoring: boolean = false
  private eventQueue: AnalyticsEvent[] = []
  private reportInterval: number | null = null

  private constructor() {
    this.metrics = this.initializeMetrics()
    this.setupGlobalEventListeners()
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  private initializeMetrics(): PerformanceMetrics {
    return {
      coreWebVitals: {
        lcp: 0,
        fid: 0,
        cls: 0
      },
      audioMetrics: {
        loadTime: 0,
        bufferHealth: 100,
        dropoutCount: 0
      },
      memoryUsage: {
        used: 0,
        total: 0,
        percentage: 0
      },
      networkMetrics: {
        connectionType: 'unknown',
        downlink: 0,
        effectiveType: 'unknown'
      }
    }
  }

  // ============================================================================
  // Monitoring Control
  // ============================================================================

  public startMonitoring(): void {
    if (this.isMonitoring) return

    console.log('📊 Starting performance monitoring...')
    this.isMonitoring = true

    // Core Web Vitals monitoring
    this.monitorCoreWebVitals()

    // Memory monitoring
    this.monitorMemoryUsage()

    // Network monitoring
    this.monitorNetworkConditions()

    // Audio performance monitoring
    this.monitorAudioPerformance()

    // User interaction monitoring
    this.monitorUserInteractions()

    // Resource loading monitoring
    this.monitorResourceLoading()

    // Start periodic reporting
    this.startPeriodicReporting()

    console.log('✅ Performance monitoring started')
  }

  public stopMonitoring(): void {
    if (!this.isMonitoring) return

    console.log('📊 Stopping performance monitoring...')
    this.isMonitoring = false

    // Stop all observers
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()

    // Stop periodic reporting
    if (this.reportInterval) {
      clearInterval(this.reportInterval)
      this.reportInterval = null
    }

    console.log('✅ Performance monitoring stopped')
  }

  // ============================================================================
  // Core Web Vitals Monitoring
  // ============================================================================

  private monitorCoreWebVitals(): void {
    if (!('PerformanceObserver' in window)) {
      console.warn('⚠️ PerformanceObserver not supported')
      return
    }

    // Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const lastEntry = entries[entries.length - 1] as PerformanceEntry
        this.metrics.coreWebVitals.lcp = Math.round(lastEntry.startTime)

        console.log(`📊 LCP: ${this.metrics.coreWebVitals.lcp}ms`)

        // Track performance issues
        if (this.metrics.coreWebVitals.lcp > 2500) {
          this.trackPerformanceIssue('LCP_HIGH', this.metrics.coreWebVitals.lcp)
        }

        this.flushEventQueue()
      })

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.set('lcp', lcpObserver)

    } catch (error) {
      console.warn('⚠️ LCP observer setup failed:', error)
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        entries.forEach((entry) => {
          const fid = Math.round((entry as any).processingStart - entry.startTime)
          this.metrics.coreWebVitals.fid = fid

          console.log(`📊 FID: ${fid}ms`)

          if (fid > 100) {
            this.trackPerformanceIssue('FID_HIGH', fid)
          }
        })

        this.flushEventQueue()
      })

      fidObserver.observe({ entryTypes: ['first-input'] })
      this.observers.set('fid', fidObserver)

    } catch (error) {
      console.warn('⚠️ FID observer setup failed:', error)
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }

        this.metrics.coreWebVitals.cls = Math.round(clsValue * 1000) / 1000

        console.log(`📊 CLS: ${this.metrics.coreWebVitals.cls}`)

        if (this.metrics.coreWebVitals.cls > 0.1) {
          this.trackPerformanceIssue('CLS_HIGH', this.metrics.coreWebVitals.cls)
        }
      })

      clsObserver.observe({ entryTypes: ['layout-shift'] })
      this.observers.set('cls', clsObserver)

    } catch (error) {
      console.warn('⚠️ CLS observer setup failed:', error)
    }

    // First Contentful Paint (FCP)
    try {
      const fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')

        if (fcpEntry) {
          const fcp = Math.round(fcpEntry.startTime)
          console.log(`📊 FCP: ${fcp}ms`)

          if (fcp > 1800) {
            this.trackPerformanceIssue('FCP_HIGH', fcp)
          }
        }
      })

      fcpObserver.observe({ entryTypes: ['paint'] })
      this.observers.set('fcp', fcpObserver)

    } catch (error) {
      console.warn('⚠️ FCP observer setup failed:', error)
    }
  }

  // ============================================================================
  // Memory Usage Monitoring
  // ============================================================================

  private monitorMemoryUsage(): void {
    if (!('memory' in performance)) {
      console.warn('⚠️ Memory API not supported')
      return
    }

    const updateMemoryMetrics = () => {
      const memory = (performance as any).memory
      const used = Math.round(memory.usedJSHeapSize / 1024 / 1024) // MB
      const total = Math.round(memory.totalJSHeapSize / 1024 / 1024) // MB
      const percentage = Math.round((used / total) * 100)

      this.metrics.memoryUsage = { used, total, percentage }

      // Memory leak detection
      if (percentage > 85) {
        this.trackPerformanceIssue('MEMORY_HIGH', percentage)
      }

      // Check for memory growth patterns
      this.detectMemoryGrowth()
    }

    // Update memory metrics every 5 seconds
    const memoryInterval = setInterval(updateMemoryMetrics, 5000)

    // Store for cleanup
    this.observers.set('memory', { disconnect: () => clearInterval(memoryInterval) } as any)

    // Initial update
    updateMemoryMetrics()
  }

  private detectMemoryGrowth(): void {
    const currentUsage = this.metrics.memoryUsage.percentage
    const lastUsage = this.getLastMemoryUsage()

    if (lastUsage && currentUsage > lastUsage + 10) {
      // Memory increased by more than 10% since last check
      this.trackPerformanceIssue('MEMORY_GROWTH', currentUsage - lastUsage)
    }

    this.setLastMemoryUsage(currentUsage)
  }

  private getLastMemoryUsage(): number | null {
    return sessionStorage.getItem('lastMemoryUsage')
      ? parseFloat(sessionStorage.getItem('lastMemoryUsage')!)
      : null
  }

  private setLastMemoryUsage(usage: number): void {
    sessionStorage.setItem('lastMemoryUsage', usage.toString())
  }

  // ============================================================================
  // Network Monitoring
  // ============================================================================

  private monitorNetworkConditions(): void {
    if (!('connection' in navigator)) {
      console.warn('⚠️ Network Information API not supported')
      return
    }

    const updateNetworkMetrics = () => {
      const connection = (navigator as any).connection

      this.metrics.networkMetrics = {
        connectionType: connection.type || 'unknown',
        downlink: Math.round(connection.downlink * 100) / 100, // Mbps
        effectiveType: connection.effectiveType || 'unknown'
      }

      // Track network quality issues
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        this.trackPerformanceIssue('NETWORK_SLOW', connection.effectiveType)
      }

      console.log(`📊 Network: ${this.metrics.networkMetrics.effectiveType} (${this.metrics.networkMetrics.downlink}Mbps)`)
    }

    // Initial update
    updateNetworkMetrics()

    // Listen for network changes
    const connection = (navigator as any).connection
    if (connection && connection.addEventListener) {
      connection.addEventListener('change', updateNetworkMetrics)

      // Store for cleanup
      this.observers.set('network', {
        disconnect: () => connection.removeEventListener('change', updateNetworkMetrics)
      } as any)
    }
  }

  // ============================================================================
  // Audio Performance Monitoring
  // ============================================================================

  private monitorAudioPerformance(): void {
    // Monitor audio context state
    const monitorAudioContext = () => {
      if (window.audioContext) {
        const state = window.audioContext.state
        if (state === 'interrupted' || state === 'suspended') {
          this.trackPerformanceIssue('AUDIO_CONTEXT_INTERRUPTED', state)
        }
      }
    }

    // Monitor audio loading performance
    const monitorAudioLoading = (trackId: string, loadTime: number) => {
      this.metrics.audioMetrics.loadTime = loadTime

      if (loadTime > 3000) {
        this.trackPerformanceIssue('AUDIO_LOAD_SLOW', loadTime)
      }

      console.log(`📊 Audio load time: ${loadTime}ms`)
    }

    // Monitor buffer health
    const monitorBufferHealth = () => {
      // This would need to be implemented based on actual audio buffer monitoring
      // Placeholder for now
      const bufferHealth = Math.random() * 100 // Placeholder
      this.metrics.audioMetrics.bufferHealth = bufferHealth

      if (bufferHealth < 50) {
        this.trackPerformanceIssue('AUDIO_BUFFER_LOW', bufferHealth)
      }
    }

    // Store audio monitoring functions for external use
    (window as any).audioPerformanceMonitor = {
      monitorAudioLoading,
      monitorBufferHealth
    }

    // Periodic buffer health check
    const bufferInterval = setInterval(monitorBufferHealth, 2000)
    this.observers.set('audioBuffer', { disconnect: () => clearInterval(bufferInterval) } as any)
  }

  // ============================================================================
  // User Interaction Monitoring
  // ============================================================================

  private monitorUserInteractions(): void {
    let lastInteractionTime = Date.now()

    const recordInteraction = (event: Event) => {
      const now = Date.now()
      const timeSinceLastInteraction = now - lastInteractionTime

      this.trackEvent({
        name: 'user_interaction',
        properties: {
          type: event.type,
          target: (event.target as Element)?.tagName || 'unknown',
          timeSinceLastInteraction
        },
        timestamp: new Date(),
        sessionId: this.getSessionId()
      })

      lastInteractionTime = now
    }

    // Monitor key interactions
    const interactions = ['click', 'touchstart', 'keydown', 'scroll']
    interactions.forEach(eventType => {
      document.addEventListener(eventType, recordInteraction, { passive: true })
    })

    // Store for cleanup
    this.observers.set('interactions', {
      disconnect: () => {
        interactions.forEach(eventType => {
          document.removeEventListener(eventType, recordInteraction)
        })
      }
    } as any)
  }

  // ============================================================================
  // Resource Loading Monitoring
  // ============================================================================

  private monitorResourceLoading(): void {
    try {
      const resourceObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()

        entries.forEach((entry) => {
          const resource = entry as PerformanceResourceTiming

          // Monitor slow resources
          const loadTime = resource.responseEnd - resource.startTime
          if (loadTime > 3000) {
            this.trackPerformanceIssue('RESOURCE_LOAD_SLOW', {
              name: resource.name,
              loadTime,
              type: resource.initiatorType
            })
          }

          // Monitor large resources
          if (resource.transferSize > 1024 * 1024) { // > 1MB
            this.trackPerformanceIssue('RESOURCE_LARGE', {
              name: resource.name,
              size: resource.transferSize,
              type: resource.initiatorType
            })
          }
        })
      })

      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.set('resources', resourceObserver)

    } catch (error) {
      console.warn('⚠️ Resource observer setup failed:', error)
    }
  }

  // ============================================================================
  // Event Tracking and Reporting
  // ============================================================================

  public trackEvent(event: AnalyticsEvent): void {
    this.eventQueue.push(event)

    // Flush queue if it gets too large
    if (this.eventQueue.length > 50) {
      this.flushEventQueue()
    }
  }

  public trackPerformanceIssue(issue: string, value: any): void {
    this.trackEvent({
      name: 'performance_issue',
      properties: {
        issue,
        value,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now()
      },
      timestamp: new Date(),
      sessionId: this.getSessionId()
    })

    console.warn(`⚠️ Performance Issue: ${issue}`, value)
  }

  private flushEventQueue(): void {
    if (this.eventQueue.length === 0) return

    const events = [...this.eventQueue]
    this.eventQueue = []

    // Send to analytics (Google Analytics, Amplitude, etc.)
    this.sendEventsToAnalytics(events)

    // Send to custom monitoring service
    this.sendEventsToMonitoring(events)
  }

  private sendEventsToAnalytics(events: AnalyticsEvent[]): void {
    // Google Analytics
    if (typeof gtag !== 'undefined') {
      events.forEach(event => {
        gtag('event', event.name, event.properties)
      })
    }

    // Amplitude (if available)
    if (typeof amplitude !== 'undefined') {
      events.forEach(event => {
        amplitude.track(event.name, event.properties)
      })
    }
  }

  private sendEventsToMonitoring(events: AnalyticsEvent[]): void {
    // Send to custom monitoring endpoint
    if (this.isOnline()) {
      fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ events })
      }).catch(error => {
        console.warn('Failed to send analytics events:', error)
        // Re-queue events on failure
        this.eventQueue.unshift(...events)
      })
    } else {
      // Store events for later when offline
      this.storeEventsOffline(events)
    }
  }

  private storeEventsOffline(events: AnalyticsEvent[]): void {
    const offlineEvents = JSON.parse(localStorage.getItem('offlineEvents') || '[]')
    offlineEvents.push(...events)
    localStorage.setItem('offlineEvents', JSON.stringify(offlineEvents))
  }

  private startPeriodicReporting(): void {
    this.reportInterval = window.setInterval(() => {
      this.generatePerformanceReport()
      this.flushEventQueue()
    }, 30000) // Every 30 seconds
  }

  private generatePerformanceReport(): void {
    const report = {
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId(),
      metrics: this.metrics,
      userAgent: navigator.userAgent,
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }

    console.log('📊 Performance Report:', report)

    // Store for debugging
    if (process.env.NODE_ENV === 'development') {
      localStorage.setItem('lastPerformanceReport', JSON.stringify(report))
    }

    // Send report to monitoring service
    this.sendPerformanceReport(report)
  }

  private sendPerformanceReport(report: any): void {
    if (this.isOnline()) {
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(report)
      }).catch(error => {
        console.warn('Failed to send performance report:', error)
      })
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  public getWebVitalsScore(): 'good' | 'needs-improvement' | 'poor' {
    const { lcp, fid, cls } = this.metrics.coreWebVitals

    // LCP scoring
    const lcpScore = lcp <= 2500 ? 'good' : lcp <= 4000 ? 'needs-improvement' : 'poor'

    // FID scoring
    const fidScore = fid <= 100 ? 'good' : fid <= 300 ? 'needs-improvement' : 'poor'

    // CLS scoring
    const clsScore = cls <= 0.1 ? 'good' : cls <= 0.25 ? 'needs-improvement' : 'poor'

    // Overall score (worst of the three)
    if (lcpScore === 'poor' || fidScore === 'poor' || clsScore === 'poor') return 'poor'
    if (lcpScore === 'needs-improvement' || fidScore === 'needs-improvement' || clsScore === 'needs-improvement') return 'needs-improvement'
    return 'good'
  }

  public getOptimizationSuggestions(): string[] {
    const suggestions: string[] = []
    const { lcp, fid, cls } = this.metrics.coreWebVitals
    const { memoryUsage, networkMetrics } = this.metrics

    // LCP suggestions
    if (lcp > 2500) {
      suggestions.push('Optimize largest contentful paint by optimizing images and reducing server response time')
    }

    // FID suggestions
    if (fid > 100) {
      suggestions.push('Reduce first input delay by minimizing JavaScript execution time')
    }

    // CLS suggestions
    if (cls > 0.1) {
      suggestions.push('Reduce cumulative layout shift by ensuring proper image dimensions and avoiding content shifts')
    }

    // Memory suggestions
    if (memoryUsage.percentage > 85) {
      suggestions.push('High memory usage detected. Consider implementing memory cleanup and optimization')
    }

    // Network suggestions
    if (networkMetrics.effectiveType === 'slow-2g' || networkMetrics.effectiveType === '2g') {
      suggestions.push('Slow network detected. Consider implementing data compression and adaptive loading')
    }

    return suggestions
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('sessionId', sessionId)
    }
    return sessionId
  }

  private isOnline(): boolean {
    return navigator.onLine
  }

  private setupGlobalEventListeners(): void {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden, pause monitoring
        if (this.isMonitoring) {
          console.log('📊 Pausing performance monitoring (page hidden)')
        }
      } else {
        // Page is visible, resume monitoring
        if (this.isMonitoring) {
          console.log('📊 Resuming performance monitoring (page visible)')
        }
      }
    })

    // Handle online/offline changes
    window.addEventListener('online', () => {
      console.log('📊 Network connection restored')
      this.flushOfflineEvents()
    })

    window.addEventListener('offline', () => {
      console.log('📊 Network connection lost')
    })
  }

  private flushOfflineEvents(): void {
    const offlineEvents = JSON.parse(localStorage.getItem('offlineEvents') || '[]')
    if (offlineEvents.length > 0) {
      this.trackEvent({
        name: 'offline_events_flushed',
        properties: { count: offlineEvents.length },
        timestamp: new Date(),
        sessionId: this.getSessionId()
      })

      // Add offline events to queue
      this.eventQueue.unshift(...offlineEvents)
      localStorage.removeItem('offlineEvents')

      // Flush queue
      this.flushEventQueue()
    }
  }

  public cleanup(): void {
    this.stopMonitoring()
    this.eventQueue = []
    localStorage.removeItem('offlineEvents')
    sessionStorage.removeItem('sessionId')
    sessionStorage.removeItem('lastMemoryUsage')
  }
}

// ============================================================================
// Performance Monitor Hook for Vue
// ============================================================================

export const usePerformanceMonitor = () => {
  const monitor = PerformanceMonitor.getInstance()

  // Auto-start monitoring when hook is used
  if (!monitor.isMonitoring) {
    monitor.startMonitoring()
  }

  return {
    monitor,
    metrics: monitor.getMetrics(),
    webVitalsScore: monitor.getWebVitalsScore(),
    suggestions: monitor.getOptimizationSuggestions(),
    trackEvent: (name: string, properties: any = {}) => {
      monitor.trackEvent({
        name,
        properties,
        timestamp: new Date(),
        sessionId: monitor['getSessionId']()
      })
    },
    trackPerformanceIssue: (issue: string, value: any) => {
      monitor.trackPerformanceIssue(issue, value)
    }
  }
}

export default PerformanceMonitor