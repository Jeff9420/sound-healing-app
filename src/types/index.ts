/**
 * Sound Healing App Type Definitions
 * 声音疗愈应用类型定义
 */

// ============================================================================
// Audio Types
// ============================================================================

export interface AudioTrack {
  id: string
  category: string
  fileName: string
  displayName: string
  duration?: number
  fileSize?: number
  format?: string
  description?: string
  tags?: string[]
  isFavorite?: boolean
  playCount?: number
  lastPlayed?: Date
}

export interface AudioCategory {
  key: string
  name: string
  displayName: string
  description: string
  icon: string
  color: string
  trackCount: number
  tracks: AudioTrack[]
}

export interface PlaybackState {
  currentTrack: AudioTrack | null
  isPlaying: boolean
  isPaused: boolean
  isLoading: boolean
  currentTime: number
  duration: number
  volume: number
  playbackRate: number
  isShuffle: boolean
  isRepeat: boolean
  queue: AudioTrack[]
  queueIndex: number
}

// ============================================================================
// User Types
// ============================================================================

export interface UserPreferences {
  language: string
  theme: 'light' | 'dark' | 'auto'
  volume: number
  autoplay: boolean
  sleepTimer: number
  visualEffects: boolean
  highContrast: boolean
  reducedMotion: boolean
  keyboardNavigation: boolean
}

export interface UserProfile {
  id: string
  email: string
  displayName: string
  photoURL?: string
  preferences: UserPreferences
  favorites: string[]
  playlists: Playlist[]
  listeningHistory: ListeningRecord[]
  subscriptionTier: 'free' | 'premium'
  createdAt: Date
  lastLoginAt: Date
}

export interface Playlist {
  id: string
  name: string
  description?: string
  tracks: AudioTrack[]
  createdAt: Date
  updatedAt: Date
  isPublic: boolean
  coverImage?: string
}

export interface ListeningRecord {
  trackId: string
  timestamp: Date
  duration: number
  completed: boolean
  category: string
  device: string
}

// ============================================================================
// UI Types
// ============================================================================

export interface UIState {
  isLoading: boolean
  activeModal: string | null
  sidebarOpen: boolean
  currentView: 'home' | 'player' | 'favorites' | 'playlists' | 'settings'
  notifications: Notification[]
  isMobile: boolean
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  actions?: NotificationAction[]
  timestamp: Date
}

export interface NotificationAction {
  label: string
  action: () => void
  primary?: boolean
}

// ============================================================================
// Scene Types
// ============================================================================

export interface SceneConfig {
  colors: string[]
  particles: ParticleType
  particleCount: number
  bgGradient: string[]
  animationSpeed: number
}

export type ParticleType = 'leaves' | 'drops' | 'sparks' | 'stars' | 'bubbles' | 'snow'

export interface BackgroundScene {
  id: string
  name: string
  category: string
  config: SceneConfig
  isActive: boolean
}

// ============================================================================
// i18n Types
// ============================================================================

export interface TranslationNamespace {
  [key: string]: string | TranslationNamespace
}

export interface LanguageConfig {
  code: string
  name: string
  nativeName: string
  flag: string
  rtl: boolean
  fontFamily: string
}

export interface I18nState {
  currentLanguage: string
  translations: Record<string, TranslationNamespace>
  isLoading: boolean
  fallbackLanguage: string
}

// ============================================================================
// Performance Types
// ============================================================================

export interface PerformanceMetrics {
  coreWebVitals: {
    lcp: number
    fid: number
    cls: number
  }
  audioMetrics: {
    loadTime: number
    bufferHealth: number
    dropoutCount: number
  }
  memoryUsage: {
    used: number
    total: number
    percentage: number
  }
  networkMetrics: {
    connectionType: string
    downlink: number
    effectiveType: string
  }
}

export interface AnalyticsEvent {
  name: string
  properties: Record<string, any>
  timestamp: Date
  userId?: string
  sessionId: string
}

// ============================================================================
// Firebase Types
// ============================================================================

export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  measurementId?: string
}

export interface SyncStatus {
  isOnline: boolean
  lastSync: Date
  pendingChanges: number
  syncInProgress: boolean
  errors: string[]
}

// ============================================================================
// API Types
// ============================================================================

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  limit: number
  total: number
  hasMore: boolean
}

// ============================================================================
// Utility Types
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type EventHandler<T = any> = (event: T) => void

export type AsyncEventHandler<T = any> = (event: T) => Promise<void>

// ============================================================================
// Error Types
// ============================================================================

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class AudioError extends AppError {
  constructor(message: string, code: string, details?: any) {
    super(message, code, 500, details)
    this.name = 'AudioError'
  }
}

export class NetworkError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'NETWORK_ERROR', 0, details)
    this.name = 'NetworkError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', 400, { field })
    this.name = 'ValidationError'
  }
}