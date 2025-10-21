<!--
  Sound Healing App Main Component
  声音疗愈应用主组件

  @version 3.0.0
  @author Sound Healing Team
-->

<template>
  <div id="app" :class="appClasses">
    <!-- Loading Screen -->
    <LoadingScreen v-if="uiStore.isLoading" />

    <!-- Main Application -->
    <div v-else class="app-container">
      <!-- Header -->
      <AppHeader />

      <!-- Main Content -->
      <main class="main-content">
        <RouterView />
      </main>

      <!-- Audio Player -->
      <AudioPlayer />

      <!-- Mobile Navigation -->
      <MobileNavigation v-if="uiStore.isMobile" />
    </div>

    <!-- Global Notifications -->
    <NotificationContainer />

    <!-- Modals -->
    <component :is="currentModalComponent" v-if="uiStore.activeModal" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUIStore, usePreferencesStore, useAppStateStore } from '@/stores'
import { useAudioStore } from '@/audio/AudioManager'

// Components
import LoadingScreen from '@/components/LoadingScreen.vue'
import AppHeader from '@/components/AppHeader.vue'
import AudioPlayer from '@/components/AudioPlayer.vue'
import MobileNavigation from '@/components/MobileNavigation.vue'
import NotificationContainer from '@/components/NotificationContainer.vue'

// Modal Components
import AuthModal from '@/components/modals/AuthModal.vue'
import SettingsModal from '@/components/modals/SettingsModal.vue'
import PlaylistModal from '@/components/modals/PlaylistModal.vue'

// ============================================================================
// Composables and Stores
// ============================================================================

const router = useRouter()
const uiStore = useUIStore()
const preferencesStore = usePreferencesStore()
const appStateStore = useAppStateStore()
const audioStore = useAudioStore()

// ============================================================================
// Computed Properties
// ============================================================================

const appClasses = computed(() => [
  'sound-healing-app',
  `theme-${preferencesStore.theme}`,
  `screen-size-${uiStore.screenSize}`,
  {
    'is-mobile': uiStore.isMobile,
    'high-contrast': preferencesStore.highContrast,
    'reduced-motion': preferencesStore.reducedMotion,
    'sidebar-open': uiStore.sidebarOpen,
    'has-playing-track': audioStore.isPlaying,
    'is-loading': uiStore.isLoading
  }
])

const currentModalComponent = computed(() => {
  const modalMap = {
    auth: AuthModal,
    settings: SettingsModal,
    playlist: PlaylistModal
  }
  return modalMap[uiStore.activeModal as keyof typeof modalMap] || null
})

// ============================================================================
// Lifecycle Hooks
// ============================================================================

onMounted(async () => {
  console.log('🎵 Sound Healing App mounted')

  // Initialize any remaining features
  await initializeFeatures()

  // Add keyboard shortcuts
  setupKeyboardShortcuts()

  // Setup global event listeners
  setupGlobalEventListeners()

  // Check for deep links
  handleDeepLinks()
})

onUnmounted(() => {
  // Cleanup event listeners
  removeGlobalEventListeners()
})

// ============================================================================
// Initialization
// ============================================================================

const initializeFeatures = async () => {
  try {
    // Initialize background scenes if visual effects are enabled
    if (preferencesStore.visualEffects) {
      const { default: BackgroundSceneManager } = await import('@/utils/BackgroundSceneManager')
      BackgroundSceneManager.getInstance().initialize()
    }

    // Check URL parameters for specific actions
    const urlParams = new URLSearchParams(window.location.search)

    if (urlParams.has('track')) {
      const trackId = urlParams.get('track')
      if (trackId) {
        // Load specific track from URL
        console.log('Loading track from URL:', trackId)
      }
    }

    if (urlParams.has('lang')) {
      const lang = urlParams.get('lang')
      if (lang && preferencesStore.language !== lang) {
        preferencesStore.setLanguage(lang)
      }
    }

  } catch (error) {
    console.error('Failed to initialize features:', error)
    uiStore.addNotification({
      type: 'error',
      title: 'Initialization Error',
      message: 'Some features may not work correctly'
    })
  }
}

// ============================================================================
// Keyboard Shortcuts
// ============================================================================

const setupKeyboardShortcuts = () => {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Only handle shortcuts when not typing in input fields
    if (event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement) {
      return
    }

    // Prevent default for our shortcuts
    const { key, ctrlKey, metaKey, shiftKey, altKey } = event

    // Space: Play/Pause
    if (key === ' ' && !ctrlKey && !metaKey && !shiftKey && !altKey) {
      event.preventDefault()
      if (audioStore.isPlaying) {
        audioStore.pauseTrack()
      } else if (audioStore.currentTrack) {
        audioStore.resumeTrack()
      }
    }

    // Arrow Left/Right: Seek
    if (key === 'ArrowLeft' && !ctrlKey && !metaKey && !shiftKey) {
      event.preventDefault()
      audioStore.seekTo(Math.max(0, (audioStore.currentTime / audioStore.duration) * 100 - 5))
    }

    if (key === 'ArrowRight' && !ctrlKey && !metaKey && !shiftKey) {
      event.preventDefault()
      audioStore.seekTo(Math.min(100, (audioStore.currentTime / audioStore.duration) * 100 + 5))
    }

    // Arrow Up/Down: Volume
    if (key === 'ArrowUp' && !ctrlKey && !metaKey && !shiftKey) {
      event.preventDefault()
      audioStore.setVolume(Math.min(1, audioStore.volume + 0.1))
    }

    if (key === 'ArrowDown' && !ctrlKey && !metaKey && !shiftKey) {
      event.preventDefault()
      audioStore.setVolume(Math.max(0, audioStore.volume - 0.1))
    }

    // N: Next Track
    if ((key === 'n' || key === 'N') && !ctrlKey && !metaKey && !shiftKey && !altKey) {
      event.preventDefault()
      audioStore.playNext()
    }

    // P: Previous Track
    if ((key === 'p' || key === 'P') && !ctrlKey && !metaKey && !shiftKey && !altKey) {
      event.preventDefault()
      audioStore.playPrevious()
    }

    // S: Shuffle
    if ((key === 's' || key === 'S') && !ctrlKey && !metaKey && !shiftKey && !altKey) {
      event.preventDefault()
      audioStore.toggleShuffle()
    }

    // R: Repeat
    if ((key === 'r' || key === 'R') && !ctrlKey && !metaKey && !shiftKey && !altKey) {
      event.preventDefault()
      audioStore.toggleRepeat()
    }

    // M: Mute/Unmute
    if ((key === 'm' || key === 'M') && !ctrlKey && !metaKey && !shiftKey && !altKey) {
      event.preventDefault()
      audioStore.setVolume(audioStore.volume > 0 ? 0 : 0.7)
    }

    // F: Toggle Favorites
    if ((key === 'f' || key === 'F') && !ctrlKey && !metaKey && !shiftKey && !altKey) {
      event.preventDefault()
      if (audioStore.currentTrack) {
        const { useFavoritesStore } = require('@/stores')
        const favoritesStore = useFavoritesStore()
        favoritesStore.toggleFavorite(audioStore.currentTrack.id)
      }
    }

    // Ctrl/Cmd + K: Search (if search functionality exists)
    if ((key === 'k' || key === 'K') && (ctrlKey || metaKey) && !shiftKey && !altKey) {
      event.preventDefault()
      // Focus search input if available
      const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
      }
    }

    // Escape: Close modal or return to home
    if (key === 'Escape' && !ctrlKey && !metaKey && !shiftKey && !altKey) {
      event.preventDefault()
      if (uiStore.activeModal) {
        uiStore.setActiveModal(null)
      } else if (router.currentRoute.value.path !== '/') {
        router.push('/')
      }
    }

    // Ctrl/Cmd + ,: Settings
    if (key === ',' && (ctrlKey || metaKey) && !shiftKey && !altKey) {
      event.preventDefault()
      uiStore.setActiveModal('settings')
    }
  }

  document.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keydown', handleKeyDown)

  // Store for cleanup
  window._keyboardHandler = handleKeyDown
}

// ============================================================================
// Global Event Listeners
// ============================================================================

const setupGlobalEventListeners = () => {
  // Handle visibility change
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Page is hidden, pause playback if enabled
      if (audioStore.isPlaying && preferencesStore.autoplay) {
        console.log('Page hidden, pausing playback')
        audioStore.pauseTrack()
      }
    } else {
      // Page is visible
      console.log('Page visible')
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)

  // Handle online/offline status
  const handleOnline = () => {
    appStateStore.setNetworkConnection(true)
    uiStore.addNotification({
      type: 'success',
      title: 'Connection Restored',
      message: 'You are back online',
      duration: 3000
    })
  }

  const handleOffline = () => {
    appStateStore.setNetworkConnection(false)
    uiStore.addNotification({
      type: 'warning',
      title: 'Connection Lost',
      message: 'You are offline. Some features may be limited.',
      duration: 5000
    })
  }

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Store for cleanup
  window._globalEventListeners = {
    visibilitychange: handleVisibilityChange,
    online: handleOnline,
    offline: handleOffline
  }
}

const removeGlobalEventListeners = () => {
  // Remove keyboard shortcuts
  if (window._keyboardHandler) {
    document.removeEventListener('keydown', window._keyboardHandler)
    window.removeEventListener('keydown', window._keyboardHandler)
    delete window._keyboardHandler
  }

  // Remove global event listeners
  if (window._globalEventListeners) {
    Object.entries(window._globalEventListeners).forEach(([event, handler]) => {
      if (event === 'online' || event === 'offline') {
        window.removeEventListener(event, handler)
      } else {
        document.removeEventListener(event, handler)
      }
    })
    delete window._globalEventListeners
  }
}

// ============================================================================
// Deep Links
// ============================================================================

const handleDeepLinks = () => {
  // Handle PWA install prompt
  const handleBeforeInstallPrompt = (event: Event) => {
    event.preventDefault()
    // Store the event for later use
    window._deferredInstallPrompt = event

    // Show install banner after a delay
    setTimeout(() => {
      uiStore.addNotification({
        type: 'info',
        title: 'Install App',
        message: 'Install Sound Healing for offline access',
        actions: [
          {
            label: 'Install',
            action: () => {
              if (window._deferredInstallPrompt) {
                (window._deferredInstallPrompt as any).prompt()
              }
            },
            primary: true
          },
          {
            label: 'Later',
            action: () => {
              // Dismiss
            }
          }
        ]
      })
    }, 5000)
  }

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

  // Handle app installed
  const handleAppInstalled = () => {
    uiStore.addNotification({
      type: 'success',
      title: 'App Installed',
      message: 'Sound Healing is now installed on your device'
    })
    delete window._deferredInstallPrompt
  }

  window.addEventListener('appinstalled', handleAppInstalled)
}
</script>

<style scoped>
/* ============================================================================ */
/* App Layout Styles */
/* ============================================================================ */

.sound-healing-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--primary-bg);
  color: var(--text-primary);
  font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
  transition: all 0.3s ease;
}

.app-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: env(safe-area-inset-top) env(safe-area-inset-right)
           env(safe-area-inset-bottom) env(safe-area-inset-left);
}

/* Theme Variations */
.theme-light {
  --primary-bg: #ffffff;
  --text-primary: #1a202c;
  --text-secondary: #4a5568;
  --card-bg: #f7fafc;
  --border-color: #e2e8f0;
}

.theme-dark {
  --primary-bg: #1a1a2e;
  --text-primary: #f8fafc;
  --text-secondary: #e2e8f0;
  --card-bg: rgba(13, 19, 48, 0.92);
  --border-color: rgba(99, 102, 241, 0.45);
}

/* Accessibility Classes */
.high-contrast {
  --text-primary: #ffffff;
  --text-secondary: #f0f0f0;
  --border-color: #ffffff;
  filter: contrast(1.2);
}

.reduced-motion * {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}

/* Mobile Optimizations */
.is-mobile .main-content {
  padding-bottom: calc(env(safe-area-inset-bottom) + 80px); /* Space for mobile player */
}

.is-mobile.sidebar-open {
  overflow: hidden;
}

/* Loading State */
.is-loading {
  pointer-events: none;
}

/* Playing State */
.has-playing-track {
  /* Add subtle animation or styling when music is playing */
}

/* Screen Size Specific Styles */
.screen-size-xs .main-content {
  padding: 1rem;
}

.screen-size-sm .main-content {
  padding: 1.5rem;
}

.screen-size-md .main-content {
  padding: 2rem;
}

.screen-size-lg .main-content {
  padding: 2.5rem;
}

.screen-size-xl .main-content {
  padding: 3rem;
}

/* Print Styles */
@media print {
  .sound-healing-app {
    background: white !important;
    color: black !important;
  }

  .main-content {
    overflow: visible;
  }
}
</style>