/**
 * Global State Management (Zustand)
 * 全局状态管理
 *
 * @version 3.0.0
 */

import { create } from 'zustand'
import { subscribeWithSelector, persist } from 'zustand/middleware'
import type { UIState, UserPreferences, Notification, SyncStatus } from '@/types'

// ============================================================================
// UI Store
// ============================================================================

interface UIStore extends UIState {
  // Actions
  setLoading: (loading: boolean) => void
  setActiveModal: (modal: string | null) => void
  setSidebarOpen: (open: boolean) => void
  setCurrentView: (view: UIState['currentView']) => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  updateScreenSize: () => void
}

export const useUIStore = create<UIStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    isLoading: true,
    activeModal: null,
    sidebarOpen: false,
    currentView: 'home',
    notifications: [],
    isMobile: false,
    screenSize: 'lg',

    // Actions
    setLoading: (loading) => set({ isLoading: loading }),
    setActiveModal: (modal) => set({ activeModal: modal }),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    setCurrentView: (view) => set({ currentView: view }),

    addNotification: (notification) => {
      const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const newNotification: Notification = {
        id,
        timestamp: new Date(),
        duration: 5000, // 5 seconds default
        ...notification
      }

      set((state) => ({
        notifications: [...state.notifications, newNotification]
      }))

      // Auto-remove notification after duration
      if (newNotification.duration && newNotification.duration > 0) {
        setTimeout(() => {
          get().removeNotification(id)
        }, newNotification.duration)
      }
    },

    removeNotification: (id) =>
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
      })),

    clearNotifications: () => set({ notifications: [] }),

    updateScreenSize: () => {
      const width = window.innerWidth
      let screenSize: UIStore['screenSize'] = 'lg'
      let isMobile = false

      if (width < 640) {
        screenSize = 'xs'
        isMobile = true
      } else if (width < 768) {
        screenSize = 'sm'
        isMobile = true
      } else if (width < 1024) {
        screenSize = 'md'
      } else if (width < 1280) {
        screenSize = 'lg'
      } else {
        screenSize = 'xl'
      }

      set({ screenSize, isMobile })
    }
  }))
)

// ============================================================================
// User Preferences Store (Persisted)
// ============================================================================

interface PreferencesStore extends UserPreferences {
  // Actions
  setLanguage: (language: string) => void
  setTheme: (theme: 'light' | 'dark' | 'auto') => void
  setVolume: (volume: number) => void
  setAutoplay: (autoplay: boolean) => void
  setSleepTimer: (timer: number) => void
  setVisualEffects: (effects: boolean) => void
  setHighContrast: (highContrast: boolean) => void
  setReducedMotion: (reducedMotion: boolean) => void
  setKeyboardNavigation: (enabled: boolean) => void
  updatePreferences: (preferences: Partial<UserPreferences>) => void
  resetPreferences: () => void
}

const defaultPreferences: UserPreferences = {
  language: 'en-US',
  theme: 'dark',
  volume: 0.7,
  autoplay: true,
  sleepTimer: 0,
  visualEffects: true,
  highContrast: false,
  reducedMotion: false,
  keyboardNavigation: true
}

export const usePreferencesStore = create<PreferencesStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...defaultPreferences,

        // Actions
        setLanguage: (language) => set({ language }),
        setTheme: (theme) => set({ theme }),
        setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
        setAutoplay: (autoplay) => set({ autoplay }),
        setSleepTimer: (timer) => set({ sleepTimer: Math.max(0, timer) }),
        setVisualEffects: (effects) => set({ visualEffects: effects }),
        setHighContrast: (highContrast) => set({ highContrast }),
        setReducedMotion: (reducedMotion) => set({ reducedMotion }),
        setKeyboardNavigation: (enabled) => set({ keyboardNavigation: enabled }),

        updatePreferences: (preferences) =>
          set((state) => ({ ...state, ...preferences })),

        resetPreferences: () => set(defaultPreferences)
      }),
      {
        name: 'sound-healing-preferences',
        version: 1
      }
    )
  )
)

// ============================================================================
// App State Store
// ============================================================================

interface AppStateStore {
  isInitialized: boolean
  hasNetworkConnection: boolean
  syncStatus: SyncStatus
  error: string | null
  performanceMode: 'performance' | 'quality' | 'auto'

  // Actions
  setInitialized: (initialized: boolean) => void
  setNetworkConnection: (connected: boolean) => void
  setSyncStatus: (status: Partial<SyncStatus>) => void
  setError: (error: string | null) => void
  setPerformanceMode: (mode: AppStateStore['performanceMode']) => void
  clearError: () => void
}

export const useAppStateStore = create<AppStateStore>()(
  subscribeWithSelector((set) => ({
    // Initial State
    isInitialized: false,
    hasNetworkConnection: navigator.onLine,
    syncStatus: {
      isOnline: navigator.onLine,
      lastSync: new Date(),
      pendingChanges: 0,
      syncInProgress: false,
      errors: []
    },
    error: null,
    performanceMode: 'auto',

    // Actions
    setInitialized: (initialized) => set({ isInitialized: initialized }),
    setNetworkConnection: (connected) =>
      set((state) => ({
        hasNetworkConnection: connected,
        syncStatus: {
          ...state.syncStatus,
          isOnline: connected
        }
      })),
    setSyncStatus: (status) =>
      set((state) => ({
        syncStatus: { ...state.syncStatus, ...status }
      })),
    setError: (error) => set({ error }),
    setPerformanceMode: (mode) => set({ performanceMode: mode }),
    clearError: () => set({ error: null })
  }))
)

// ============================================================================
// Favorites Store (Persisted)
// ============================================================================

interface FavoritesStore {
  favoriteIds: Set<string>
  recentlyPlayed: string[]
  mostPlayed: Map<string, number>

  // Actions
  addToFavorites: (trackId: string) => void
  removeFromFavorites: (trackId: string) => void
  toggleFavorite: (trackId: string) => void
  isFavorite: (trackId: string) => boolean
  addToRecentlyPlayed: (trackId: string) => void
  incrementPlayCount: (trackId: string) => void
  getMostPlayed: (limit?: number) => string[]
  clearRecentlyPlayed: () => void
  clearMostPlayed: () => void
}

export const useFavoritesStore = create<FavoritesStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        favoriteIds: new Set(),
        recentlyPlayed: [],
        mostPlayed: new Map(),

        // Actions
        addToFavorites: (trackId) =>
          set((state) => {
            const newFavorites = new Set(state.favoriteIds)
            newFavorites.add(trackId)
            return { favoriteIds: newFavorites }
          }),

        removeFromFavorites: (trackId) =>
          set((state) => {
            const newFavorites = new Set(state.favoriteIds)
            newFavorites.delete(trackId)
            return { favoriteIds: newFavorites }
          }),

        toggleFavorite: (trackId) => {
          const { isFavorite, addToFavorites, removeFromFavorites } = get()
          if (isFavorite(trackId)) {
            removeFromFavorites(trackId)
          } else {
            addToFavorites(trackId)
          }
        },

        isFavorite: (trackId) => get().favoriteIds.has(trackId),

        addToRecentlyPlayed: (trackId) =>
          set((state) => {
            const filtered = state.recentlyPlayed.filter(id => id !== trackId)
            return { recentlyPlayed: [trackId, ...filtered].slice(0, 50) } // Keep last 50
          }),

        incrementPlayCount: (trackId) =>
          set((state) => {
            const newMostPlayed = new Map(state.mostPlayed)
            const currentCount = newMostPlayed.get(trackId) || 0
            newMostPlayed.set(trackId, currentCount + 1)
            return { mostPlayed: newMostPlayed }
          }),

        getMostPlayed: (limit = 20) => {
          const { mostPlayed } = get()
          return Array.from(mostPlayed.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([trackId]) => trackId)
        },

        clearRecentlyPlayed: () => set({ recentlyPlayed: [] }),
        clearMostPlayed: () => set({ mostPlayed: new Map() })
      }),
      {
        name: 'sound-healing-favorites',
        version: 1,
        serialize: (state) => ({
          favoriteIds: Array.from(state.favoriteIds),
          recentlyPlayed: state.recentlyPlayed,
          mostPlayed: Array.from(state.mostPlayed.entries())
        }),
        deserialize: (data) => ({
          favoriteIds: new Set(data.favoriteIds || []),
          recentlyPlayed: data.recentlyPlayed || [],
          mostPlayed: new Map(data.mostPlayed || [])
        })
      }
    )
  )
)

// ============================================================================
// Store Combinations and Selectors
// ============================================================================

export const useAppStore = () => {
  const uiStore = useUIStore()
  const preferencesStore = usePreferencesStore()
  const appStateStore = useAppStateStore()
  const favoritesStore = useFavoritesStore()

  return {
    ...uiStore,
    ...preferencesStore,
    ...appStateStore,
    ...favoritesStore,
    // Combined selectors
    isReady: appStateStore.isInitialized && !uiStore.isLoading,
    canPlayAudio: appStateStore.hasNetworkConnection || appStateStore.syncStatus.pendingChanges === 0,
    userTheme: preferencesStore.theme === 'auto'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : preferencesStore.theme
  }
}

// ============================================================================
// Store Persistence and Sync
// ============================================================================

// Sync preferences with system theme
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
mediaQuery.addEventListener('change', (e) => {
  const { theme } = usePreferencesStore.getState()
  if (theme === 'auto') {
    // Trigger re-render by updating a dummy state
    useUIStore.setState({ isLoading: useUIStore.getState().isLoading })
  }
})

// Network status monitoring
window.addEventListener('online', () => {
  useAppStateStore.getState().setNetworkConnection(true)
})

window.addEventListener('offline', () => {
  useAppStateStore.getState().setNetworkConnection(false)
})

// Screen size monitoring
window.addEventListener('resize', () => {
  useUIStore.getState().updateScreenSize()
})

// Initial screen size detection
useUIStore.getState().updateScreenSize()

export default useAppStore