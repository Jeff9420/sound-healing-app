/**
 * Modern Audio Manager (ESM + TypeScript)
 * 现代音频管理器
 *
 * @version 3.0.0
 * @author Sound Healing Team
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { AudioTrack, PlaybackState, AudioError } from '@/types'

// ============================================================================
// Audio Store with Zustand
// ============================================================================

interface AudioStore extends PlaybackState {
  // Actions
  setCurrentTrack: (track: AudioTrack | null) => void
  setIsPlaying: (playing: boolean) => void
  setIsPaused: (paused: boolean) => void
  setIsLoading: (loading: boolean) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
  setPlaybackRate: (rate: number) => void
  setIsShuffle: (shuffle: boolean) => void
  setIsRepeat: (repeat: boolean) => void
  setQueue: (queue: AudioTrack[]) => void
  setQueueIndex: (index: number) => void

  // Audio Actions
  playTrack: (track: AudioTrack) => Promise<void>
  pauseTrack: () => void
  resumeTrack: () => void
  stopTrack: () => void
  seekTo: (percentage: number) => void
  playNext: () => void
  playPrevious: () => void
  toggleShuffle: () => void
  toggleRepeat: () => void

  // Queue Management
  addToQueue: (track: AudioTrack) => void
  removeFromQueue: (trackId: string) => void
  clearQueue: () => void

  // Utility
  reset: () => void
}

export const useAudioStore = create<AudioStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    currentTrack: null,
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    playbackRate: 1,
    isShuffle: false,
    isRepeat: false,
    queue: [],
    queueIndex: -1,

    // Setters
    setCurrentTrack: (track) => set({ currentTrack: track }),
    setIsPlaying: (playing) => set({ isPlaying: playing }),
    setIsPaused: (paused) => set({ isPaused: paused }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    setCurrentTime: (time) => set({ currentTime: time }),
    setDuration: (duration) => set({ duration }),
    setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
    setPlaybackRate: (rate) => set({ playbackRate: rate }),
    setIsShuffle: (shuffle) => set({ isShuffle: shuffle }),
    setIsRepeat: (repeat) => set({ isRepeat: repeat }),
    setQueue: (queue) => set({ queue }),
    setQueueIndex: (index) => set({ queueIndex: index }),

    // Audio Actions
    playTrack: async (track) => {
      const state = get()

      try {
        set({ isLoading: true })

        // Stop current playback if any
        if (state.isPlaying && state.currentTrack) {
          await state.stopTrack()
        }

        // Set new track
        set({
          currentTrack: track,
          currentTime: 0,
          isPlaying: true,
          isPaused: false
        })

        // Start actual audio playback
        await AudioManager.getInstance().playTrack(track)

        set({ isLoading: false })

      } catch (error) {
        set({ isLoading: false })
        throw new AudioError(
          `Failed to play track: ${track.displayName}`,
          'PLAYBACK_ERROR',
          error
        )
      }
    },

    pauseTrack: async () => {
      try {
        await AudioManager.getInstance().pause()
        set({ isPlaying: false, isPaused: true })
      } catch (error) {
        throw new AudioError('Failed to pause track', 'PAUSE_ERROR', error)
      }
    },

    resumeTrack: async () => {
      try {
        await AudioManager.getInstance().resume()
        set({ isPlaying: true, isPaused: false })
      } catch (error) {
        throw new AudioError('Failed to resume track', 'RESUME_ERROR', error)
      }
    },

    stopTrack: async () => {
      try {
        await AudioManager.getInstance().stop()
        set({
          isPlaying: false,
          isPaused: false,
          currentTime: 0,
          currentTrack: null
        })
      } catch (error) {
        throw new AudioError('Failed to stop track', 'STOP_ERROR', error)
      }
    },

    seekTo: async (percentage) => {
      try {
        const { duration } = get()
        const newTime = (percentage / 100) * duration
        await AudioManager.getInstance().seekTo(newTime)
        set({ currentTime: newTime })
      } catch (error) {
        throw new AudioError('Failed to seek track', 'SEEK_ERROR', error)
      }
    },

    playNext: async () => {
      const { queue, queueIndex, isShuffle } = get()

      if (queue.length === 0) return

      let nextIndex = queueIndex

      if (isShuffle) {
        nextIndex = Math.floor(Math.random() * queue.length)
      } else {
        nextIndex = (queueIndex + 1) % queue.length
      }

      const nextTrack = queue[nextIndex]
      if (nextTrack) {
        set({ queueIndex: nextIndex })
        await get().playTrack(nextTrack)
      }
    },

    playPrevious: async () => {
      const { queue, queueIndex } = get()

      if (queue.length === 0) return

      const prevIndex = queueIndex > 0 ? queueIndex - 1 : queue.length - 1
      const prevTrack = queue[prevIndex]

      if (prevTrack) {
        set({ queueIndex: prevIndex })
        await get().playTrack(prevTrack)
      }
    },

    toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
    toggleRepeat: () => set((state) => ({ isRepeat: !state.isRepeat })),

    // Queue Management
    addToQueue: (track) => set((state) => ({
      queue: [...state.queue, track]
    })),

    removeFromQueue: (trackId) => set((state) => ({
      queue: state.queue.filter(t => t.id !== trackId)
    })),

    clearQueue: () => set({ queue: [], queueIndex: -1 }),

    // Reset
    reset: () => set({
      currentTrack: null,
      isPlaying: false,
      isPaused: false,
      isLoading: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      playbackRate: 1,
      isShuffle: false,
      isRepeat: false,
      queue: [],
      queueIndex: -1
    })
  }))
)

// ============================================================================
// AudioManager Singleton Class
// ============================================================================

export class AudioManager {
  private static instance: AudioManager
  private audioContext: AudioContext | null = null
  private currentSource: AudioBufferSourceNode | null = null
  private gainNode: GainNode | null = null
  private startTime: number = 0
  private pauseTime: number = 0
  private isPaused: boolean = false
  private audioCache: Map<string, AudioBuffer> = new Map()
  private audioBuffers: Map<string, ArrayBuffer> = new Map()

  private constructor() {
    this.initializeAudioContext()
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager()
    }
    return AudioManager.instance
  }

  private initializeAudioContext(): void {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      this.audioContext = new AudioContextClass()
      this.gainNode = this.audioContext.createGain()
      this.gainNode.connect(this.audioContext.destination)

      console.log('✅ AudioContext initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize AudioContext:', error)
      throw new AudioError('AudioContext initialization failed', 'AUDIO_CONTEXT_ERROR', error)
    }
  }

  public async playTrack(track: AudioTrack): Promise<void> {
    try {
      if (!this.audioContext || !this.gainNode) {
        throw new Error('AudioContext not initialized')
      }

      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      // Stop current playback
      this.stop()

      // Get or load audio buffer
      let audioBuffer = this.audioCache.get(track.id)

      if (!audioBuffer) {
        audioBuffer = await this.loadAudioBuffer(track)
        this.audioCache.set(track.id, audioBuffer)
      }

      // Create new source
      this.currentSource = this.audioContext.createBufferSource()
      this.currentSource.buffer = audioBuffer
      this.currentSource.connect(this.gainNode)

      // Handle playback end
      this.currentSource.onended = () => {
        this.handleTrackEnd()
      }

      // Start playback
      this.startTime = this.audioContext.currentTime - this.pauseTime
      this.currentSource.start(0, this.pauseTime)
      this.isPaused = false

      // Start progress updates
      this.startProgressUpdates(track)

      console.log(`🎵 Playing: ${track.displayName}`)

    } catch (error) {
      console.error('❌ Failed to play track:', error)
      throw new AudioError(
        `Failed to play track: ${track.displayName}`,
        'PLAYBACK_ERROR',
        error
      )
    }
  }

  public async pause(): Promise<void> {
    if (this.currentSource && !this.isPaused) {
      this.pauseTime = this.audioContext!.currentTime - this.startTime
      this.currentSource.stop()
      this.currentSource = null
      this.isPaused = true
      console.log('⏸️ Track paused')
    }
  }

  public async resume(): Promise<void> {
    if (this.isPaused && this.currentSource) {
      // Resume will be handled by playTrack with current track
      this.isPaused = false
      console.log('▶️ Track resumed')
    }
  }

  public stop(): void {
    if (this.currentSource) {
      try {
        this.currentSource.stop()
        this.currentSource.disconnect()
      } catch (error) {
        // Ignore errors when stopping already stopped sources
      }
      this.currentSource = null
    }
    this.isPaused = false
    this.pauseTime = 0
    console.log('⏹️ Track stopped')
  }

  public async seekTo(time: number): Promise<void> {
    if (!this.audioContext) return

    const wasPlaying = !this.isPaused && this.currentSource !== null
    const currentTime = this.audioContext.currentTime
    this.pauseTime = time

    if (wasPlaying) {
      // Resume from new position
      this.pause()
      this.isPaused = false
      // Will need to restart playback from new position
    }
  }

  public setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(volume, this.audioContext!.currentTime)
    }
  }

  public async loadAudioBuffer(track: AudioTrack): Promise<AudioBuffer> {
    try {
      const audioUrl = `assets/audio/${track.category}/${track.fileName}`
      const response = await fetch(audioUrl)

      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      this.audioBuffers.set(track.id, arrayBuffer)

      const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer)
      return audioBuffer

    } catch (error) {
      console.error(`❌ Failed to load audio buffer for ${track.displayName}:`, error)
      throw new AudioError(
        `Failed to load audio: ${track.displayName}`,
        'AUDIO_LOAD_ERROR',
        error
      )
    }
  }

  private startProgressUpdates(track: AudioTrack): void {
    const updateProgress = () => {
      if (!this.isPaused && this.currentSource) {
        const currentTime = this.audioContext!.currentTime - this.startTime
        useAudioStore.getState().setCurrentTime(currentTime)

        if (currentTime < (this.audioCache.get(track.id)?.duration || 0)) {
          requestAnimationFrame(updateProgress)
        }
      }
    }

    requestAnimationFrame(updateProgress)
  }

  private handleTrackEnd(): void {
    console.log('🏁 Track ended')

    const state = useAudioStore.getState()

    if (state.isRepeat) {
      // Repeat current track
      state.playTrack(state.currentTrack!)
    } else {
      // Play next track
      state.playNext()
    }
  }

  public getAudioContext(): AudioContext | null {
    return this.audioContext
  }

  public isAudioSupported(): boolean {
    return !!(window.AudioContext || (window as any).webkitAudioContext)
  }

  public cleanup(): void {
    this.stop()
    this.audioCache.clear()
    this.audioBuffers.clear()

    if (this.gainNode) {
      this.gainNode.disconnect()
      this.gainNode = null
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
      this.audioContext = null
    }
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export const getAudioDuration = async (audioUrl: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio(audioUrl)

    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration)
    })

    audio.addEventListener('error', (error) => {
      reject(new AudioError('Failed to load audio metadata', 'METADATA_ERROR', error))
    })
  })
}

export const detectAudioFormat = (fileUrl: string): string => {
  const extension = fileUrl.split('.').pop()?.toLowerCase()

  switch (extension) {
    case 'mp3': return 'audio/mpeg'
    case 'wav': return 'audio/wav'
    case 'ogg': return 'audio/ogg'
    case 'm4a': return 'audio/mp4'
    case 'flac': return 'audio/flac'
    default: return 'audio/mpeg'
  }
}

// ============================================================================
// Performance Monitoring
// ============================================================================

export class AudioPerformanceMonitor {
  private static instance: AudioPerformanceMonitor
  private metrics: Map<string, number> = new Map()

  private constructor() {}

  public static getInstance(): AudioPerformanceMonitor {
    if (!AudioPerformanceMonitor.instance) {
      AudioPerformanceMonitor.instance = new AudioPerformanceMonitor()
    }
    return AudioPerformanceMonitor.instance
  }

  public measureLoadTime(trackId: string, startTime: number): void {
    const loadTime = performance.now() - startTime
    this.metrics.set(`${trackId}_loadTime`, loadTime)
    console.log(`📊 Audio load time: ${loadTime.toFixed(2)}ms`)
  }

  public measureBufferHealth(): number {
    const audioManager = AudioManager.getInstance()
    // This would need to be implemented based on actual audio buffer status
    return 100 // Placeholder
  }

  public getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }
}