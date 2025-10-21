/**
 * Mobile Experience Optimizer
 * 移动端体验优化器
 *
 * @version 3.0.0
 * @author Sound Healing Team
 */

import type { UIState } from '@/types'

// ============================================================================
// Mobile Configuration
// ============================================================================

interface MobileConfig {
  breakpoints: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
  touch: {
    tapThreshold: number
    swipeThreshold: number
    longPressThreshold: number
    doubleTapThreshold: number
  }
  performance: {
    enableAnimations: boolean
    reducedMotion: boolean
    maxConcurrentAnimations: number
    animationDuration: number
  }
  audio: {
    autoPlay: boolean
    preloadStrategy: 'none' | 'metadata' | 'auto'
    maxConcurrentLoads: number
    cacheSize: number
  }
  ui: {
    showBottomPlayer: boolean
    enableGestures: boolean
    enableHapticFeedback: boolean
    statusBarHeight: number
    safeAreaInsets: boolean
  }
}

const MOBILE_CONFIG: MobileConfig = {
  breakpoints: {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280
  },
  touch: {
    tapThreshold: 10,
    swipeThreshold: 50,
    longPressThreshold: 500,
    doubleTapThreshold: 300
  },
  performance: {
    enableAnimations: true,
    reducedMotion: false,
    maxConcurrentAnimations: 3,
    animationDuration: 300
  },
  audio: {
    autoPlay: false,
    preloadStrategy: 'metadata',
    maxConcurrentLoads: 2,
    cacheSize: 50 * 1024 * 1024 // 50MB
  },
  ui: {
    showBottomPlayer: true,
    enableGestures: true,
    enableHapticFeedback: true,
    statusBarHeight: 44,
    safeAreaInsets: true
  }
}

// ============================================================================
// Mobile Optimizer Class
// ============================================================================

export class MobileOptimizer {
  private static instance: MobileOptimizer
  private isMobile: boolean = false
  private currentBreakpoint: keyof MobileConfig['breakpoints'] = 'lg'
  private touchHandlers: Map<string, EventListener> = new Map()
  private gestureState: any = {}
  private isInitialized: boolean = false

  private constructor() {
    this.detectMobileDevice()
    this.setupEventListeners()
  }

  public static getInstance(): MobileOptimizer {
    if (!MobileOptimizer.instance) {
      MobileOptimizer.instance = new MobileOptimizer()
    }
    return MobileOptimizer.instance
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log('📱 Initializing Mobile Optimizer...')

    try {
      // Detect mobile features
      await this.detectMobileFeatures()

      // Setup touch optimization
      this.setupTouchOptimization()

      // Setup performance optimization
      this.setupPerformanceOptimization()

      // Setup UI optimization
      this.setupUIOptimization()

      // Setup audio optimization
      this.setupAudioOptimization()

      // Setup viewport optimization
      this.setupViewportOptimization()

      this.isInitialized = true
      console.log('✅ Mobile Optimizer initialized successfully')

    } catch (error) {
      console.error('❌ Mobile Optimizer initialization failed:', error)
    }
  }

  // ============================================================================
  // Device Detection
  // ============================================================================

  private detectMobileDevice(): void {
    const userAgent = navigator.userAgent.toLowerCase()
    const mobileKeywords = [
      'android', 'iphone', 'ipad', 'ipod', 'blackberry',
      'windows phone', 'mobile', 'tablet', 'touch'
    ]

    this.isMobile = mobileKeywords.some(keyword => userAgent.includes(keyword))

    // Detect current breakpoint
    this.updateBreakpoint()

    console.log(`📱 Device detected: ${this.isMobile ? 'Mobile' : 'Desktop'}`)
    console.log(`📐 Current breakpoint: ${this.currentBreakpoint}`)
  }

  private async detectMobileFeatures(): Promise<void> {
    // Detect touch support
    const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    console.log(`👆 Touch support: ${touchSupport ? 'Yes' : 'No'}`)

    // Detect haptic feedback support
    const hapticSupport = 'vibrate' in navigator
    console.log(`📳 Haptic feedback: ${hapticSupport ? 'Yes' : 'No'}`)

    // Detect device memory and capabilities
    if ('deviceMemory' in navigator) {
      const memory = (navigator as any).deviceMemory
      console.log(`💾 Device memory: ${memory}GB`)

      // Adjust performance settings based on device memory
      if (memory < 4) {
        MOBILE_CONFIG.performance.enableAnimations = false
        MOBILE_CONFIG.performance.reducedMotion = true
      }
    }

    // Detect battery API
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery()
        console.log(`🔋 Battery level: ${Math.round(battery.level * 100)}%`)

        // Adjust performance based on battery level
        if (battery.level < 0.2) {
          MOBILE_CONFIG.performance.enableAnimations = false
        }
      } catch (error) {
        console.warn('⚠️ Battery API not available')
      }
    }

    // Detect network information
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      console.log(`🌐 Network: ${connection.effectiveType} (${connection.downlink}Mbps)`)

      // Adjust loading strategy based on network
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        MOBILE_CONFIG.audio.preloadStrategy = 'none'
        MOBILE_CONFIG.audio.maxConcurrentLoads = 1
      }
    }
  }

  // ============================================================================
  // Touch Optimization
  // ============================================================================

  private setupTouchOptimization(): void {
    if (!this.isMobile) return

    console.log('👆 Setting up touch optimization...')

    // Prevent default touch behaviors
    document.addEventListener('touchstart', this.preventScrollBounce, { passive: false })
    document.addEventListener('touchmove', this.handleTouchMove, { passive: false })

    // Setup gesture recognition
    this.setupGestures()

    // Setup long press handling
    this.setupLongPress()
  }

  private preventScrollBounce = (event: TouchEvent) => {
    // Prevent rubber band scrolling on iOS
    const { clientY, target } = event
    const element = target as Element

    if (element.tagName === 'BODY' || element.tagName === 'HTML') {
      if (clientY < 50 || clientY > window.innerHeight - 50) {
        event.preventDefault()
      }
    }
  }

  private handleTouchMove = (event: TouchEvent) => {
    // Prevent scrolling during gesture recognition
    if (this.gestureState.active) {
      event.preventDefault()
    }
  }

  private setupGestures(): void {
    if (!MOBILE_CONFIG.ui.enableGestures) return

    const gestures = ['swipe', 'pinch', 'rotate']

    gestures.forEach(gesture => {
      const handler = this.createGestureHandler(gesture)
      document.addEventListener('touchstart', handler, { passive: false })
      this.touchHandlers.set(gesture, handler)
    })
  }

  private createGestureHandler = (gestureType: string): EventListener => {
    return (event: TouchEvent) => {
      const touches = event.touches

      if (touches.length === 1) {
        // Single touch gestures (swipe, tap, long press)
        this.handleSingleTouch(event, gestureType)
      } else if (touches.length === 2) {
        // Multi-touch gestures (pinch, rotate)
        this.handleMultiTouch(event, gestureType)
      }
    }
  }

  private handleSingleTouch = (event: TouchEvent, gestureType: string): void => {
    const touch = event.touches[0]
    const startTime = Date.now()

    this.gestureState = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime,
      type: gestureType,
      active: true
    }

    const moveHandler = (e: TouchEvent) => {
      if (!this.gestureState.active) return

      const currentTouch = e.touches[0]
      const deltaX = currentTouch.clientX - this.gestureState.startX
      const deltaY = currentTouch.clientY - this.gestureState.startY

      // Detect swipe
      if (Math.abs(deltaX) > MOBILE_CONFIG.touch.swipeThreshold) {
        this.handleSwipe(deltaX > 0 ? 'right' : 'left')
        this.gestureState.active = false
      }
    }

    const endHandler = () => {
      const duration = Date.now() - this.gestureState.startTime

      // Detect tap
      if (duration < MOBILE_CONFIG.touch.tapThreshold) {
        this.handleTap(event.target)
      }

      this.gestureState.active = false
      document.removeEventListener('touchmove', moveHandler)
      document.removeEventListener('touchend', endHandler)
    }

    document.addEventListener('touchmove', moveHandler, { passive: true })
    document.addEventListener('touchend', endHandler, { passive: true })
  }

  private handleMultiTouch = (event: TouchEvent, gestureType: string): void => {
    const touches = Array.from(event.touches)
    const distance = this.calculateDistance(touches[0], touches[1])

    this.gestureState = {
      initialDistance: distance,
      type: gestureType,
      active: true
    }

    const moveHandler = (e: TouchEvent) => {
      if (!this.gestureState.active) return

      const currentTouches = Array.from(e.touches)
      const currentDistance = this.calculateDistance(currentTouches[0], currentTouches[1])

      if (gestureType === 'pinch') {
        const scale = currentDistance / this.gestureState.initialDistance
        this.handlePinch(scale)
      }
    }

    const endHandler = () => {
      this.gestureState.active = false
      document.removeEventListener('touchmove', moveHandler)
      document.removeEventListener('touchend', endHandler)
    }

    document.addEventListener('touchmove', moveHandler, { passive: true })
    document.addEventListener('touchend', endHandler, { passive: true })
  }

  private setupLongPress(): void {
    let longPressTimer: NodeJS.Timeout

    const handleStart = (event: TouchEvent) => {
      longPressTimer = setTimeout(() => {
        this.handleLongPress(event.target)
      }, MOBILE_CONFIG.touch.longPressThreshold)
    }

    const handleEnd = () => {
      clearTimeout(longPressTimer)
    }

    document.addEventListener('touchstart', handleStart, { passive: true })
    document.addEventListener('touchend', handleEnd, { passive: true })
    document.addEventListener('touchmove', handleEnd, { passive: true })
  }

  private calculateDistance = (touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // ============================================================================
  // Gesture Handlers
  // ============================================================================

  private handleTap = (target: EventTarget): void => {
    // Handle tap with haptic feedback
    this.triggerHapticFeedback('tap')

    // Dispatch custom event
    const event = new CustomEvent('mobiletap', {
      detail: { target },
      bubbles: true
    })
    document.dispatchEvent(event)
  }

  private handleSwipe = (direction: 'left' | 'right'): void => {
    this.triggerHapticFeedback('light')

    // Dispatch custom event
    const event = new CustomEvent('mobileswipe', {
      detail: { direction },
      bubbles: true
    })
    document.dispatchEvent(event)
  }

  private handlePinch = (scale: number): void => {
    // Dispatch custom event
    const event = new CustomEvent('mobilepinch', {
      detail: { scale },
      bubbles: true
    })
    document.dispatchEvent(event)
  }

  private handleLongPress = (target: EventTarget): void => {
    this.triggerHapticFeedback('medium')

    // Dispatch custom event
    const event = new CustomEvent('mobilelongpress', {
      detail: { target },
      bubbles: true
    })
    document.dispatchEvent(event)
  }

  // ============================================================================
  // Performance Optimization
  // ============================================================================

  private setupPerformanceOptimization(): void {
    console.log('⚡ Setting up performance optimization...')

    // Reduce motion if needed
    if (MOBILE_CONFIG.performance.reducedMotion) {
      document.documentElement.setAttribute('data-reduced-motion', 'true')
    }

    // Optimize animations
    this.optimizeAnimations()

    // Optimize rendering
    this.optimizeRendering()
  }

  private optimizeAnimations(): void {
    if (!MOBILE_CONFIG.performance.enableAnimations) {
      // Disable all animations
      const style = document.createElement('style')
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      `
      document.head.appendChild(style)
      return
    }

    // Optimize existing animations
    const animations = document.getAnimations()
    if (animations.length > MOBILE_CONFIG.performance.maxConcurrentAnimations) {
      // Pause excess animations
      animations.slice(MOBILE_CONFIG.performance.maxConcurrentAnimations)
        .forEach(animation => animation.pause())
    }
  }

  private optimizeRendering(): void {
    // Use passive event listeners where possible
    const passiveEvents = ['touchstart', 'touchmove', 'scroll', 'wheel']

    passiveEvents.forEach(eventType => {
      document.addEventListener(eventType, () => {}, { passive: true })
    })

    // Optimize scroll performance
    document.body.style.touchAction = 'pan-y'

    // Enable GPU acceleration for animated elements
    const animatedElements = document.querySelectorAll('[data-animate]')
    animatedElements.forEach(element => {
      (element as HTMLElement).style.transform = 'translateZ(0)'
      (element as HTMLElement).style.willChange = 'transform'
    })
  }

  // ============================================================================
  // UI Optimization
  // ============================================================================

  private setupUIOptimization(): void {
    console.log('🎨 Setting up UI optimization...')

    // Setup safe area insets
    this.setupSafeAreaInsets()

    // Setup mobile-specific UI components
    this.setupMobileUI()

    // Optimize navigation
    this.setupMobileNavigation()
  }

  private setupSafeAreaInsets(): void {
    if (!MOBILE_CONFIG.ui.safeAreaInsets) return

    // Add CSS variables for safe area insets
    const style = document.createElement('style')
    style.textContent = `
      :root {
        --safe-area-inset-top: env(safe-area-inset-top);
        --safe-area-inset-right: env(safe-area-inset-right);
        --safe-area-inset-bottom: env(safe-area-inset-bottom);
        --safe-area-inset-left: env(safe-area-inset-left);
        --status-bar-height: ${MOBILE_CONFIG.ui.statusBarHeight}px;
      }
    `
    document.head.appendChild(style)
  }

  private setupMobileUI(): void {
    // Add mobile-specific CSS classes
    if (this.isMobile) {
      document.documentElement.classList.add('mobile-device')

      // Add device-specific classes
      if (/iphone|ipod|ipad/i.test(navigator.userAgent)) {
        document.documentElement.classList.add('ios-device')
      }

      if (/android/i.test(navigator.userAgent)) {
        document.documentElement.classList.add('android-device')
      }
    }

    // Setup mobile viewport
    this.setupMobileViewport()
  }

  private setupMobileViewport(): void {
    const viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement
    if (viewport) {
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
    } else {
      const meta = document.createElement('meta')
      meta.name = 'viewport'
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
      document.head.appendChild(meta)
    }
  }

  private setupMobileNavigation(): void {
    // Add mobile navigation styles
    const style = document.createElement('style')
    style.textContent = `
      @media (max-width: ${MOBILE_CONFIG.breakpoints.md}px) {
        .mobile-device {
          --mobile-nav-height: 60px;
          --bottom-player-height: ${MOBILE_CONFIG.ui.showBottomPlayer ? '80px' : '0px'};
        }

        .mobile-device .app-container {
          padding-bottom: calc(var(--mobile-nav-height) + var(--bottom-player-height) + env(safe-area-inset-bottom));
        }

        .mobile-device .mobile-navigation {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: var(--mobile-nav-height);
          background: var(--card-bg);
          border-top: 1px solid var(--border-color);
          display: flex;
          justify-content: space-around;
          align-items: center;
          z-index: 100;
          padding-bottom: env(safe-area-inset-bottom);
        }

        .mobile-device .audio-player {
          position: fixed;
          bottom: var(--mobile-nav-height);
          left: 0;
          right: 0;
          height: var(--bottom-player-height);
          background: var(--player-bg);
          border-top: 1px solid var(--border-color);
          z-index: 99;
        }
      }
    `
    document.head.appendChild(style)
  }

  // ============================================================================
  // Audio Optimization
  // ============================================================================

  private setupAudioOptimization(): void {
    console.log('🎵 Setting up audio optimization...')

    // Setup mobile-specific audio handling
    this.setupMobileAudio()

    // Optimize audio loading
    this.optimizeAudioLoading()

    // Handle iOS audio limitations
    this.handleIOSAudioLimitations()
  }

  private setupMobileAudio(): void {
    // Disable autoplay on mobile
    if (this.isMobile) {
      MOBILE_CONFIG.audio.autoPlay = false
    }

    // Setup mobile audio context handling
    if (window.AudioContext || (window as any).webkitAudioContext) {
      // Handle audio context suspension
      document.addEventListener('touchstart', () => {
        const audioContext = window.audioContext || (window as any).webkitAudioContext
        if (audioContext && audioContext.state === 'suspended') {
          audioContext.resume()
        }
      }, { once: true })
    }
  }

  private optimizeAudioLoading(): void {
    // Implement adaptive loading based on network conditions
    if (this.isMobile) {
      const connection = (navigator as any).connection

      if (connection) {
        switch (connection.effectiveType) {
          case 'slow-2g':
            MOBILE_CONFIG.audio.preloadStrategy = 'none'
            MOBILE_CONFIG.audio.maxConcurrentLoads = 1
            break
          case '2g':
            MOBILE_CONFIG.audio.preloadStrategy = 'metadata'
            MOBILE_CONFIG.audio.maxConcurrentLoads = 1
            break
          case '3g':
            MOBILE_CONFIG.audio.preloadStrategy = 'metadata'
            MOBILE_CONFIG.audio.maxConcurrentLoads = 2
            break
          default:
            MOBILE_CONFIG.audio.preloadStrategy = 'auto'
            MOBILE_CONFIG.audio.maxConcurrentLoads = 3
        }
      }
    }
  }

  private handleIOSAudioLimitations(): void {
    if (!/iphone|ipod|ipad/i.test(navigator.userAgent)) return

    console.log('🍎 Setting up iOS audio handling...')

    // Handle iOS audio playback limitations
    document.addEventListener('click', () => {
      // Create a silent audio context to enable audio playback
      const audio = new Audio()
      audio.volume = 0.01
      audio.play().catch(() => {
        // Ignore errors
      })
    }, { once: true })
  }

  // ============================================================================
  // Viewport Optimization
  // ============================================================================

  private setupViewportOptimization(): void {
    console.log('📐 Setting up viewport optimization...')

    // Handle orientation changes
    this.handleOrientationChanges()

    // Handle resize events
    this.handleResizeEvents()

    // Update CSS variables for mobile
    this.updateCSSVariables()
  }

  private handleOrientationChanges(): void {
    window.addEventListener('orientationchange', () => {
      console.log(`📱 Orientation changed to: ${window.orientation}`)

      // Update breakpoint after orientation change
      setTimeout(() => {
        this.updateBreakpoint()
        this.updateCSSVariables()
      }, 100)
    })
  }

  private handleResizeEvents(): void {
    let resizeTimer: NodeJS.Timeout

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        this.updateBreakpoint()
        this.updateCSSVariables()
      }, 250)
    })
  }

  private updateBreakpoint(): void {
    const width = window.innerWidth
    const { breakpoints } = MOBILE_CONFIG

    if (width < breakpoints.sm) {
      this.currentBreakpoint = 'xs'
    } else if (width < breakpoints.md) {
      this.currentBreakpoint = 'sm'
    } else if (width < breakpoints.lg) {
      this.currentBreakpoint = 'md'
    } else if (width < breakpoints.xl) {
      this.currentBreakpoint = 'lg'
    } else {
      this.currentBreakpoint = 'xl'
    }

    document.documentElement.setAttribute('data-breakpoint', this.currentBreakpoint)
  }

  private updateCSSVariables(): void {
    const root = document.documentElement
    const width = window.innerWidth
    const height = window.innerHeight

    root.style.setProperty('--viewport-width', `${width}px`)
    root.style.setProperty('--viewport-height', `${height}px`)
    root.style.setProperty('--is-mobile', this.isMobile ? '1' : '0')
    root.style.setProperty('--is-small-screen', width < 768 ? '1' : '0')
  }

  // ============================================================================
  // Haptic Feedback
  // ============================================================================

  private triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' | 'tap' | 'success' | 'warning' | 'error'): void {
    if (!MOBILE_CONFIG.ui.enableHapticFeedback || !('vibrate' in navigator)) return

    const patterns = {
      light: 10,
      medium: 25,
      heavy: 50,
      tap: 5,
      success: [10, 50, 10],
      warning: [25, 25, 25],
      error: [50, 25, 50, 25]
    }

    const pattern = patterns[type] || patterns.light
    navigator.vibrate(pattern)
  }

  // ============================================================================
  // Event Listeners
  // ============================================================================

  private setupEventListeners(): void {
    // Update breakpoint on resize
    window.addEventListener('resize', () => {
      this.updateBreakpoint()
    })

    // Handle visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Pause animations and reduce resource usage
        this.pauseAnimations()
      } else {
        // Resume animations
        this.resumeAnimations()
      }
    })

    // Handle battery changes (if supported)
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        battery.addEventListener('levelchange', () => {
          if (battery.level < 0.2) {
            // Enable battery saving mode
            this.enableBatterySavingMode()
          }
        })
      })
    }
  }

  private pauseAnimations(): void {
    const animations = document.getAnimations()
    animations.forEach(animation => animation.pause())
  }

  private resumeAnimations(): void {
    const animations = document.getAnimations()
    animations.forEach(animation => animation.play())
  }

  private enableBatterySavingMode(): void {
    console.log('🔋 Enabling battery saving mode...')

    MOBILE_CONFIG.performance.enableAnimations = false
    MOBILE_CONFIG.performance.reducedMotion = true

    document.documentElement.setAttribute('data-battery-saving', 'true')
    this.optimizeAnimations()
  }

  // ============================================================================
  // Public API
  // ============================================================================

  public isMobileDevice(): boolean {
    return this.isMobile
  }

  public getCurrentBreakpoint(): keyof MobileConfig['breakpoints'] {
    return this.currentBreakpoint
  }

  public getMobileConfig(): MobileConfig {
    return { ...MOBILE_CONFIG }
  }

  public updateConfig(config: Partial<MobileConfig>): void {
    Object.assign(MOBILE_CONFIG, config)
  }

  public cleanup(): void {
    // Remove event listeners
    this.touchHandlers.forEach((handler, event) => {
      document.removeEventListener(event, handler)
    })
    this.touchHandlers.clear()

    // Remove mobile-specific styles
    const mobileStyles = document.querySelectorAll('style[data-mobile-optimized]')
    mobileStyles.forEach(style => style.remove())

    this.isInitialized = false
  }
}

// ============================================================================
// Vue Composable
// ============================================================================

export const useMobileOptimizer = () => {
  const optimizer = MobileOptimizer.getInstance()

  return {
    optimizer,
    isMobile: optimizer.isMobileDevice(),
    breakpoint: optimizer.getCurrentBreakpoint(),
    config: optimizer.getMobileConfig(),
    haptic: (type: Parameters<typeof optimizer.triggerHapticFeedback>[0]) =>
      optimizer.triggerHapticFeedback(type),
    updateConfig: (config: Partial<MobileConfig>) =>
      optimizer.updateConfig(config)
  }
}

export default MobileOptimizer