/**
 * Internationalization Manager (ESM + TypeScript)
 * 国际化管理器
 *
 * @version 3.0.0
 * @author Sound Healing Team
 */

import { create } from 'zustand'
import { subscribeWithSelector, persist } from 'zustand/middleware'
import type { LanguageConfig, I18nState, TranslationNamespace } from '@/types'

// ============================================================================
// Language Configurations
// ============================================================================

export const SUPPORTED_LANGUAGES: Record<string, LanguageConfig> = {
  'zh-CN': {
    code: 'zh-CN',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    flag: '🇨🇳',
    rtl: false,
    fontFamily: '"PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif'
  },
  'en-US': {
    code: 'en-US',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
    fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif'
  },
  'ja-JP': {
    code: 'ja-JP',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    rtl: false,
    fontFamily: '"Hiragino Sans", "Yu Gothic", "Meiryo", "Takao", "Microsoft YaHei", sans-serif'
  },
  'ko-KR': {
    code: 'ko-KR',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    rtl: false,
    fontFamily: '"Malgun Gothic", "Noto Sans KR", "Apple Gothic", sans-serif'
  },
  'es-ES': {
    code: 'es-ES',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false,
    fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif'
  }
}

const DEFAULT_LANGUAGE = 'en-US'
const FALLBACK_LANGUAGE = 'en-US'

// ============================================================================
// Translation Data
// ============================================================================

const translationData: Record<string, TranslationNamespace> = {
  // Common translations
  common: {
    // Navigation
    'nav.home': 'Home',
    'nav.home.zh': '首页',
    'nav.categories': 'Categories',
    'nav.categories.zh': '分类',
    'nav.favorites': 'Favorites',
    'nav.favorites.zh': '收藏',
    'nav.playlists': 'Playlists',
    'nav.playlists.zh': '播放列表',
    'nav.settings': 'Settings',
    'nav.settings.zh': '设置',

    // Actions
    'action.play': 'Play',
    'action.play.zh': '播放',
    'action.pause': 'Pause',
    'action.pause.zh': '暂停',
    'action.stop': 'Stop',
    'action.stop.zh': '停止',
    'action.next': 'Next',
    'action.next.zh': '下一首',
    'action.previous': 'Previous',
    'action.previous.zh': '上一首',
    'action.shuffle': 'Shuffle',
    'action.shuffle.zh': '随机播放',
    'action.repeat': 'Repeat',
    'action.repeat.zh': '循环播放',
    'action.favorite': 'Favorite',
    'action.favorite.zh': '收藏',
    'action.share': 'Share',
    'action.share.zh': '分享',

    // Time
    'time.now': 'Now',
    'time.now.zh': '当前',
    'time.min': 'min',
    'time.min.zh': '分钟',
    'time.sec': 'sec',
    'time.sec.zh': '秒',
    'time.hour': 'hour',
    'time.hour.zh': '小时',
    'time.day': 'day',
    'time.day.zh': '天',

    // Status
    'status.loading': 'Loading...',
    'status.loading.zh': '加载中...',
    'status.error': 'Error',
    'status.error.zh': '错误',
    'status.success': 'Success',
    'status.success.zh': '成功',
    'status.offline': 'Offline',
    'status.offline.zh': '离线',

    // Accessibility
    'a11y.play': 'Play audio',
    'a11y.play.zh': '播放音频',
    'a11y.pause': 'Pause audio',
    'a11y.pause.zh': '暂停音频',
    'a11y.volume': 'Volume control',
    'a11y.volume.zh': '音量控制',
    'a11y.seek': 'Seek audio position',
    'a11y.seek.zh': '跳转音频位置',
    'a11y.favorite': 'Add to favorites',
    'a11y.favorite.zh': '添加到收藏'
  },

  // Audio categories
  categories: {
    'Animal sounds': 'Animal Sounds',
    'Animal sounds.zh': '动物声音',
    'Chakra': 'Chakra Healing',
    'Chakra.zh': '脉轮疗愈',
    'Fire': 'Fire Sounds',
    'Fire.zh': '火焰声音',
    'hypnosis': 'Hypnosis',
    'hypnosis.zh': '催眠',
    'meditation': 'Meditation',
    'meditation.zh': '冥想',
    'Rain': 'Rain Sounds',
    'Rain.zh': '雨声',
    'running water': 'Water Sounds',
    'running water.zh': '流水声',
    'Singing bowl sound': 'Singing Bowls',
    'Singing bowl sound.zh': '颂钵',
    'Subconscious Therapy': 'Subconscious Therapy',
    'Subconscious Therapy.zh': '潜意识疗愈'
  },

  // UI messages
  ui: {
    'welcome.title': 'Welcome to Sound Healing',
    'welcome.title.zh': '欢迎来到声音疗愈',
    'welcome.subtitle': 'Find your inner peace with healing sounds',
    'welcome.subtitle.zh': '用疗愈声音找到内心的平静',

    'player.noTrack': 'No track selected',
    'player.noTrack.zh': '未选择音轨',
    'player.loading': 'Loading track...',
    'player.loading.zh': '加载音轨中...',
    'player.error': 'Failed to load track',
    'player.error.zh': '音轨加载失败',

    'favorites.empty': 'No favorites yet',
    'favorites.empty.zh': '还没有收藏',
    'favorites.add': 'Added to favorites',
    'favorites.add.zh': '已添加到收藏',
    'favorites.remove': 'Removed from favorites',
    'favorites.remove.zh': '已从收藏中移除',

    'search.placeholder': 'Search for tracks...',
    'search.placeholder.zh': '搜索音轨...',
    'search.noResults': 'No results found',
    'search.noResults.zh': '未找到结果',
    'search.results': 'Found {count} results',
    'search.results.zh': '找到 {count} 个结果',

    'settings.title': 'Settings',
    'settings.title.zh': '设置',
    'settings.language': 'Language',
    'settings.language.zh': '语言',
    'settings.theme': 'Theme',
    'settings.theme.zh': '主题',
    'settings.volume': 'Volume',
    'settings.volume.zh': '音量',
    'settings.autoplay': 'Autoplay',
    'settings.autoplay.zh': '自动播放',
    'settings.notifications': 'Notifications',
    'settings.notifications.zh': '通知',

    'notifications.title': 'Notifications',
    'notifications.title.zh': '通知',
    'notifications.playing': 'Now playing: {track}',
    'notifications.playing.zh': '正在播放：{track}',
    'notifications.error': 'Error: {message}',
    'notifications.error.zh': '错误：{message}',
    'notifications.success': 'Success: {message}',
    'notifications.success.zh': '成功：{message}',

    'modal.close': 'Close',
    'modal.close.zh': '关闭',
    'modal.save': 'Save',
    'modal.save.zh': '保存',
    'modal.cancel': 'Cancel',
    'modal.cancel.zh': '取消',
    'modal.confirm': 'Confirm',
    'modal.confirm.zh': '确认'
  },

  // Audio descriptions
  descriptions: {
    'Animal sounds.desc': 'Natural animal sounds for relaxation and focus',
    'Animal sounds.desc.zh': '自然动物声音，帮助放松和专注',
    'Chakra.desc': 'Balancing sounds for chakra alignment and energy healing',
    'Chakra.desc.zh': '平衡脉轮的声音，促进能量疗愈',
    'Fire.desc': 'Comforting fire sounds for warmth and meditation',
    'Fire.desc.zh': '舒适的火焰声音，带来温暖和冥想',
    'hypnosis.desc': 'Guided hypnosis audio for deep relaxation and therapy',
    'hypnosis.desc.zh': '引导式催眠音频，用于深度放松和疗愈',
    'meditation.desc': 'Meditation music for mindfulness and inner peace',
    'meditation.desc.zh': '冥想音乐，帮助正念和内心平静',
    'Rain.desc': 'Gentle rain sounds for sleep and stress relief',
    'Rain.desc.zh': '轻柔的雨声，帮助睡眠和缓解压力',
    'running water.desc': 'Flowing water sounds for relaxation and focus',
    'running water.desc.zh': '流水声，帮助放松和专注',
    'Singing bowl.desc': 'Traditional singing bowl tones for healing',
    'Singing bowl.desc.zh': '传统颂钵音调，用于疗愈',
    'Subconscious Therapy.desc': 'Subconscious therapy audio for deep transformation',
    'Subconscious Therapy.desc.zh': '潜意识疗愈音频，促进深层转化'
  },

  // Error messages
  errors: {
    'network.title': 'Network Error',
    'network.title.zh': '网络错误',
    'network.message': 'Please check your internet connection',
    'network.message.zh': '请检查您的网络连接',

    'audio.title': 'Audio Error',
    'audio.title.zh': '音频错误',
    'audio.message': 'Failed to load audio file',
    'audio.message.zh': '音频文件加载失败',

    'permission.title': 'Permission Denied',
    'permission.title.zh': '权限被拒绝',
    'permission.message': 'Please enable audio permissions',
    'permission.message.zh': '请启用音频权限',

    'generic.title': 'Something went wrong',
    'generic.title.zh': '出现了一些问题',
    'generic.message': 'Please try again later',
    'generic.message.zh': '请稍后重试'
  },

  // Success messages
  success: {
    'track.added': 'Track added to favorites',
    'track.added.zh': '音轨已添加到收藏',
    'track.removed': 'Track removed from favorites',
    'track.removed.zh': '音轨已从收藏中移除',
    'playlist.created': 'Playlist created successfully',
    'playlist.created.zh': '播放列表创建成功',
    'settings.saved': 'Settings saved successfully',
    'settings.saved.zh': '设置保存成功',
    'cache.cleared': 'Cache cleared successfully',
    'cache.cleared.zh': '缓存清除成功'
  },

  // Time formats
  timeFormats: {
    'duration.hours': '{hours}h {minutes}m',
    'duration.hours.zh': '{hours}小时{minutes}分钟',
    'duration.minutes': '{minutes}m {seconds}s',
    'duration.minutes.zh': '{minutes}分钟{seconds}秒',
    'duration.seconds': '{seconds}s',
    'duration.seconds.zh': '{seconds}秒',
    'duration.less': 'Less than a minute',
    'duration.less.zh': '不到1分钟',
    'duration.less.zh': '不到1分钟',
    'duration.hours.zh': '{hours}小时',
    'duration.hours.zh': '{hours}小时{minutes}分钟'
  }
}

// ============================================================================
// I18n Store
// ============================================================================

interface I18nStore extends I18nState {
  // Actions
  setCurrentLanguage: (language: string) => void
  setTranslations: (translations: Record<string, TranslationNamespace>) => void
  setLoading: (loading: boolean) => void
  setFallbackLanguage: (language: string) => void

  // Translation methods
  t: (key: string, params?: Record<string, string | number>) => string
  exists: (key: string) => boolean
  getPlural: (key: string, count: number, params?: Record<string, string | number>) => string
  getDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string
  getNumber: (number: number, options?: Intl.NumberFormatOptions) => string
  getCurrency: (amount: number, currency: string) => string

  // Utility methods
  getSupportedLanguages: () => LanguageConfig[]
  getLanguageConfig: (code: string) => LanguageConfig | null
  isRTL: () => boolean
  getFontFamily: () => string

  // Load translations
  loadTranslations: (language: string) => Promise<void>
  preloadTranslations: (languages: string[]) => Promise<void>
}

export const useI18nStore = create<I18nStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial State
        currentLanguage: DEFAULT_LANGUAGE,
        translations: translationData,
        isLoading: false,
        fallbackLanguage: FALLBACK_LANGUAGE,

        // Setters
        setCurrentLanguage: (language) => {
          console.log(`🌐 Changing language to: ${language}`)
          set({ currentLanguage: language })

          // Update HTML attributes
          document.documentElement.lang = language
          document.documentElement.dir = get().isRTL() ? 'rtl' : 'ltr'

          // Update font family
          const config = get().getLanguageConfig(language)
          if (config) {
            document.documentElement.style.fontFamily = config.fontFamily
          }

          // Load translations for the new language
          get().loadTranslations(language)
        },

        setTranslations: (translations) => set({ translations }),

        setLoading: (loading) => set({ isLoading: loading }),

        setFallbackLanguage: (language) => set({ fallbackLanguage: language }),

        // Translation methods
        t: (key, params = {}) => {
          const { currentLanguage, translations, fallbackLanguage } = get()

          // Try to get translation in current language
          let translation = getNestedTranslation(translations, key, currentLanguage)

          // Fallback to fallback language
          if (!translation && currentLanguage !== fallbackLanguage) {
            translation = getNestedTranslation(translations, key, fallbackLanguage)
          }

          // Fallback to English
          if (!translation && fallbackLanguage !== 'en-US') {
            translation = getNestedTranslation(translations, key, 'en-US')
          }

          // If still no translation, return the key
          if (!translation) {
            console.warn(`⚠️ Translation missing for key: ${key}`)
            return key
          }

          // Replace parameters
          return replaceParams(translation, params)
        },

        exists: (key) => {
          const { currentLanguage, translations } = get()
          return !!getNestedTranslation(translations, key, currentLanguage)
        },

        getPlural: (key, count, params = {}) => {
          const { t } = get()
          const pluralKey = `${key}.${count === 1 ? 'single' : 'multiple'}`
          return t(pluralKey, { ...params, count })
        },

        getDate: (date, options = {}) => {
          const { currentLanguage } = get()
          const defaultOptions: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            ...options
          }

          return new Intl.DateTimeFormat(currentLanguage, defaultOptions).format(date)
        },

        getNumber: (number, options = {}) => {
          const { currentLanguage } = get()
          return new Intl.NumberFormat(currentLanguage, options).format(number)
        },

        getCurrency: (amount, currency) => {
          const { currentLanguage } = get()
          return new Intl.NumberFormat(currentLanguage, {
            style: 'currency',
            currency
          }).format(amount)
        },

        // Utility methods
        getSupportedLanguages: () => Object.values(SUPPORTED_LANGUAGES),

        getLanguageConfig: (code) => SUPPORTED_LANGUAGES[code] || null,

        isRTL: () => {
          const { currentLanguage } = get()
          const config = SUPPORTED_LANGUAGES[currentLanguage]
          return config?.rtl || false
        },

        getFontFamily: () => {
          const { currentLanguage } = get()
          const config = SUPPORTED_LANGUAGES[currentLanguage]
          return config?.fontFamily || 'system-ui'
        },

        // Load translations
        loadTranslations: async (language) => {
          try {
            set({ isLoading: true })

            // For now, use the built-in translations
            // In the future, you might load from external files
            console.log(`📦 Loading translations for: ${language}`)

            // Simulate async loading
            await new Promise(resolve => setTimeout(resolve, 100))

          } catch (error) {
            console.error(`❌ Failed to load translations for ${language}:`, error)
          } finally {
            set({ isLoading: false })
          }
        },

        preloadTranslations: async (languages) => {
          const loadPromises = languages.map(lang => get().loadTranslations(lang))
          await Promise.all(loadPromises)
        }
      }),
      {
        name: 'sound-healing-i18n',
        version: 1,
        partialize: (state) => ({
          currentLanguage: state.currentLanguage,
          fallbackLanguage: state.fallbackLanguage
        })
      }
    )
  )
)

// ============================================================================
// Helper Functions
// ============================================================================

function getNestedTranslation(
  translations: Record<string, TranslationNamespace>,
  key: string,
  language: string
): string | null {
  const parts = key.split('.')
  let current: any = translations

  for (const part of parts) {
    if (current[part]) {
      current = current[part]
    } else {
      return null
    }
  }

  // Handle language-specific translations
  if (typeof current === 'object' && current !== null) {
    return current[language] || current[`${language.split('-')[0]}`] || null
  }

  return typeof current === 'string' ? current : null
}

function replaceParams(
  template: string,
  params: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key]?.toString() || match
  })
}

// ============================================================================
// Vue Composable
// ============================================================================

export const useI18n = () => {
  const store = useI18nStore()

  return {
    // Store state
    currentLanguage: store.currentLanguage,
    isLoading: store.isLoading,
    supportedLanguages: store.getSupportedLanguages(),

    // Translation methods
    t: store.t,
    exists: store.exists,
    plural: store.getPlural,
    date: store.getDate,
    number: store.getNumber,
    currency: store.getCurrency,

    // Utility methods
    isRTL: store.isRTL(),
    fontFamily: store.getFontFamily(),
    changeLanguage: store.setCurrentLanguage,
    preloadTranslations: store.preloadTranslations
  }
}

// ============================================================================
// Auto-detect language
// ============================================================================

export function detectBrowserLanguage(): string {
  // 1. Check localStorage first
  const savedLanguage = localStorage.getItem('preferred-language')
  if (savedLanguage && SUPPORTED_LANGUAGES[savedLanguage]) {
    return savedLanguage
  }

  // 2. Check browser language
  const browserLanguage = navigator.language || (navigator as any).userLanguage

  // Direct match
  if (SUPPORTED_LANGUAGES[browserLanguage]) {
    return browserLanguage
  }

  // Language code match (e.g., 'en' matches 'en-US')
  const languageCode = browserLanguage.split('-')[0]
  const matchedLanguage = Object.keys(SUPPORTED_LANGUAGES).find(
    lang => lang.startsWith(languageCode)
  )

  if (matchedLanguage) {
    return matchedLanguage
  }

  // 3. Fallback to default
  return DEFAULT_LANGUAGE
}

// ============================================================================
// Initialize I18n
// ============================================================================

export const initializeI18n = () => {
  const store = useI18nStore()

  // Auto-detect and set language
  const detectedLanguage = detectBrowserLanguage()
  store.setCurrentLanguage(detectedLanguage)

  console.log(`🌐 I18n initialized with language: ${detectedLanguage}`)

  return store
}

export default useI18nStore