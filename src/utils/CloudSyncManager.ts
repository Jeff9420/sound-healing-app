/**
 * Cloud Sync Manager - Firebase Integration
 * 云端同步管理器 - Firebase 集成
 *
 * @version 3.0.0
 * @author Sound Healing Team
 */

import { doc, collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, orderBy, limit, serverTimestamp, onSnapshot, DocumentSnapshot, QuerySnapshot } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import type { UserProfile, Playlist, ListeningRecord, SyncStatus, AudioTrack } from '@/types'

// ============================================================================
// Sync Configuration
// ============================================================================

interface SyncConfig {
  enableRealtimeSync: boolean
  batchSize: number
  syncInterval: number
  retryAttempts: number
  retryDelay: number
  offlineQueueSize: number
  conflictResolution: 'client' | 'server' | 'merge'
}

const SYNC_CONFIG: SyncConfig = {
  enableRealtimeSync: true,
  batchSize: 50,
  syncInterval: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000,
  offlineQueueSize: 100,
  conflictResolution: 'merge'
}

// ============================================================================
// Cloud Sync Manager
// ============================================================================

export class CloudSyncManager {
  private static instance: CloudSyncManager
  private db: any = null
  private storage: any = null
  private userId: string | null = null
  private syncStatus: SyncStatus = {
    isOnline: navigator.onLine,
    lastSync: new Date(),
    pendingChanges: 0,
    syncInProgress: false,
    errors: []
  }
  private offlineQueue: Array<any> = []
  private syncTimer: NodeJS.Timeout | null = null
  private realtimeListeners: Map<string, Function> = new Map()
  private isInitialized: boolean = false

  private constructor() {
    this.setupEventListeners()
  }

  public static getInstance(): CloudSyncManager {
    if (!CloudSyncManager.instance) {
      CloudSyncManager.instance = new CloudSyncManager()
    }
    return CloudSyncManager.instance
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  public async initialize(firebaseApp: any): Promise<void> {
    if (this.isInitialized) return

    console.log('☁️ Initializing Cloud Sync Manager...')

    try {
      // Initialize Firebase services
      this.db = firebaseApp.firestore
      this.storage = firebaseApp.storage

      // Get current user
      await this.getCurrentUser()

      // Setup sync timer
      this.setupSyncTimer()

      // Start offline queue processing
      this.startOfflineQueueProcessing()

      // Setup conflict resolution
      this.setupConflictResolution()

      this.isInitialized = true
      console.log('✅ Cloud Sync Manager initialized successfully')

      // Trigger initial sync
      await this.performInitialSync()

    } catch (error) {
      console.error('❌ Cloud Sync Manager initialization failed:', error)
      throw new Error('Cloud sync initialization failed')
    }
  }

  private async getCurrentUser(): Promise<void> {
    const auth = firebaseApp.auth
    const user = auth.currentUser

    if (user) {
      this.userId = user.uid
      console.log(`👤 Cloud sync initialized for user: ${user.uid}`)
    } else {
      console.warn('⚠️ No authenticated user found')
      this.userId = null
    }
  }

  // ============================================================================
  // User Profile Sync
  // ============================================================================

  public async syncUserProfile(profile: Partial<UserProfile>): Promise<boolean> {
    if (!this.userId) return false

    try {
      const userRef = doc(this.db, 'users', this.userId)

      const profileData = {
        ...profile,
        lastUpdated: serverTimestamp(),
        deviceId: this.getDeviceId()
      }

      await updateDoc(userRef, profileData)
      console.log('✅ User profile synced successfully')

      return true
    } catch (error) {
      console.error('❌ Failed to sync user profile:', error)
      this.addToOfflineQueue('userProfile', profileData)
      return false
    }
  }

  public async getUserProfile(): Promise<UserProfile | null> {
    if (!this.userId) return null

    try {
      const userRef = doc(this.db, 'users', this.userId)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const data = userSnap.data()
        return {
          id: userSnap.id,
          email: data.email || '',
          displayName: data.displayName || '',
          photoURL: data.photoURL || '',
          preferences: data.preferences || {},
          favorites: data.favorites || [],
          playlists: data.playlists || [],
          listeningHistory: data.listeningHistory || [],
          subscriptionTier: data.subscriptionTier || 'free',
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate() || new Date()
        }
      }

      return null
    } catch (error) {
      console.error('❌ Failed to get user profile:', error)
      return null
    }
  }

  // ============================================================================
  // Favorites Sync
  // ============================================================================

  public async syncFavorites(favorites: string[]): Promise<boolean> {
    if (!this.userId) return false

    try {
      const favoritesRef = collection(this.db, 'users', this.userId, 'favorites')

      // Clear existing favorites
      const existingSnap = await getDocs(favoritesRef)
      const deletePromises = existingSnap.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      // Add new favorites
      const addPromises = favorites.map(trackId =>
        addDoc(favoritesRef, {
          trackId,
          addedAt: serverTimestamp(),
          deviceId: this.getDeviceId()
        })
      )
      await Promise.all(addPromises)

      console.log(`✅ Synced ${favorites.length} favorites`)
      return true
    } catch (error) {
      console.error('❌ Failed to sync favorites:', error)
      this.addToOfflineQueue('favorites', { favorites })
      return false
    }
  }

  public async getFavorites(): Promise<string[]> {
    if (!this.userId) return []

    try {
      const favoritesRef = collection(this.db, 'users', this.userId, 'favorites')
      const favoritesSnap = await getDocs(favoritesRef)

      return favoritesSnap.docs.map(doc => doc.data().trackId)
    } catch (error) {
      console.error('❌ Failed to get favorites:', error)
      return []
    }
  }

  public async addFavorite(trackId: string): Promise<boolean> {
    if (!this.userId) return false

    try {
      const favoritesRef = collection(this.db, 'users', this.userId, 'favorites')
      await addDoc(favoritesRef, {
        trackId,
        addedAt: serverTimestamp(),
        deviceId: this.getDeviceId()
      })

      console.log(`✅ Added to favorites: ${trackId}`)
      return true
    } catch (error) {
      console.error('❌ Failed to add favorite:', error)
      this.addToOfflineQueue('addFavorite', { trackId })
      return false
    }
  }

  public async removeFavorite(trackId: string): Promise<boolean> {
    if (!this.userId) return false

    try {
      const favoritesRef = collection(this.db, 'users', this.userId, 'favorites')
      const q = query(favoritesRef, where('trackId', '==', trackId))
      const snap = await getDocs(q)

      const deletePromises = snap.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      console.log(`✅ Removed from favorites: ${trackId}`)
      return true
    } catch (error) {
      console.error('❌ Failed to remove favorite:', error)
      this.addToOfflineQueue('removeFavorite', { trackId })
      return false
    }
  }

  // ============================================================================
  // Playlists Sync
  // ============================================================================

  public async syncPlaylists(playlists: Playlist[]): Promise<boolean> {
    if (!this.userId) return false

    try {
      const playlistsRef = collection(this.db, 'users', this.userId, 'playlists')

      for (const playlist of playlists) {
        const playlistData = {
          ...playlist,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          deviceId: this.getDeviceId()
        }

        if (playlist.id) {
          const playlistDoc = doc(playlistsRef, playlist.id)
          await updateDoc(playlistDoc, playlistData)
        } else {
          await addDoc(playlistsRef, playlistData)
        }
      }

      console.log(`✅ Synced ${playlists.length} playlists`)
      return true
    } catch (error) {
      console.error('❌ Failed to sync playlists:', error)
      this.addToOfflineQueue('playlists', { playlists })
      return false
    }
  }

  public async getPlaylists(): Promise<Playlist[]> {
    if (!this.userId) return []

    try {
      const playlistsRef = collection(this.db, 'users', this.userId, 'playlists')
      const playlistsSnap = await getDocs(playlistsRef)

      return playlistsSnap.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
          tracks: data.tracks || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          isPublic: data.isPublic || false,
          coverImage: data.coverImage || ''
        }
      })
    } catch (error) {
      console.error('❌ Failed to get playlists:', error)
      return []
    }
  }

  // ============================================================================
  // Listening History Sync
  // ============================================================================

  public async syncListeningHistory(records: ListeningRecord[]): Promise<boolean> {
    if (!this.userId) return false

    try {
      const historyRef = collection(this.db, 'users', this.userId, 'listeningHistory')

      const addPromises = records.map(record =>
        addDoc(historyRef, {
          ...record,
          timestamp: serverTimestamp(),
          deviceId: this.getDeviceId()
        })
      )
      await Promise.all(addPromises)

      console.log(`✅ Synced ${records.length} listening records`)
      return true
    } catch (error) {
      console.error('❌ Failed to sync listening history:', error)
      this.addToOfflineQueue('listeningHistory', { records })
      return false
    }
  }

  public async getListeningHistory(limit: number = 100): Promise<ListeningRecord[]> {
    if (!this.userId) return []

    try {
      const historyRef = collection(this.db, 'users', this.userId, 'listeningHistory')
      const q = query(historyRef, orderBy('timestamp', 'desc'), limit(limit))
      const historySnap = await getDocs(q)

      return historySnap.docs.map(doc => {
        const data = doc.data()
        return {
          trackId: data.trackId || '',
          timestamp: data.timestamp?.toDate() || new Date(),
          duration: data.duration || 0,
          completed: data.completed || false,
          category: data.category || '',
          device: data.device || ''
        }
      })
    } catch (error) {
      console.error('❌ Failed to get listening history:', error)
      return []
    }
  }

  // ============================================================================
  // Real-time Sync
  // ============================================================================

  public enableRealtimeSync(): void {
    if (!this.userId || !SYNC_CONFIG.enableRealtimeSync) return

    console.log('🔄 Enabling real-time sync...')

    // Listen for user profile changes
    const userRef = doc(this.db, 'users', this.userId)
    const unsubscribeUser = onSnapshot(userRef, (snap: DocumentSnapshot) => {
      if (snap.exists()) {
        const data = snap.data()
        this.handleRealtimeUpdate('userProfile', data)
      }
    })

    this.realtimeListeners.set('userProfile', unsubscribeUser)

    // Listen for favorites changes
    const favoritesRef = collection(this.db, 'users', this.userId, 'favorites')
    const unsubscribeFavorites = onSnapshot(favoritesRef, (snap: QuerySnapshot) => {
      const favorites = snap.docs.map(doc => doc.data().trackId)
      this.handleRealtimeUpdate('favorites', favorites)
    })

    this.realtimeListeners.set('favorites', unsubscribeFavorites)
  }

  public disableRealtimeSync(): void {
    console.log('⏹️ Disabling real-time sync...')

    this.realtimeListeners.forEach((unsubscribe, key) => {
      unsubscribe()
      console.log(`📡 Unsubscribed from ${key} updates`)
    })
    this.realtimeListeners.clear()
  }

  private handleRealtimeUpdate(type: string, data: any): void {
    console.log(`📡 Real-time update received: ${type}`, data)

    // Dispatch custom event for components to listen to
    const event = new CustomEvent('realtime-update', {
      detail: { type, data },
      bubbles: true
    })
    document.dispatchEvent(event)
  }

  // ============================================================================
  // Offline Queue Management
  // ============================================================================

  private addToOfflineQueue(type: string, data: any): void {
    const queueItem = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: new Date(),
      retryCount: 0
    }

    this.offlineQueue.push(queueItem)

    // Limit queue size
    if (this.offlineQueue.length > SYNC_CONFIG.offlineQueueSize) {
      this.offlineQueue = this.offlineQueue.slice(-SYNC_CONFIG.offlineQueueSize)
    }

    console.log(`📝 Added to offline queue: ${type}`)
    this.updateSyncStatus()
  }

  private async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0 || !this.syncStatus.isOnline) return

    const itemsToProcess = this.offlineQueue.slice(0, SYNC_CONFIG.batchSize)
    this.offlineQueue = this.offlineQueue.slice(SYNC_CONFIG.batchSize)

    for (const item of itemsToProcess) {
      try {
        await this.processQueueItem(item)
        console.log(`✅ Processed offline queue item: ${item.type}`)
      } catch (error) {
        console.error(`❌ Failed to process queue item: ${item.type}`, error)

        item.retryCount++
        if (item.retryCount < SYNC_CONFIG.retryAttempts) {
          this.offlineQueue.push(item)
        }
      }
    }

    this.updateSyncStatus()
  }

  private async processQueueItem(item: any): Promise<void> {
    switch (item.type) {
      case 'userProfile':
        await this.syncUserProfile(item.data)
        break
      case 'favorites':
        await this.syncFavorites(item.data.favorites)
        break
      case 'addFavorite':
        await this.addFavorite(item.data.trackId)
        break
      case 'removeFavorite':
        await this.removeFavorite(item.data.trackId)
        break
      case 'playlists':
        await this.syncPlaylists(item.data.playlists)
        break
      case 'listeningHistory':
        await this.syncListeningHistory(item.data.records)
        break
      default:
        console.warn(`⚠️ Unknown queue item type: ${item.type}`)
    }
  }

  // ============================================================================
  // Sync Status and Monitoring
  // ============================================================================

  private setupSyncTimer(): void {
    this.syncTimer = setInterval(() => {
      if (this.syncStatus.isOnline && !this.syncStatus.syncInProgress) {
        this.performSync()
      }
    }, SYNC_CONFIG.syncInterval)
  }

  private async performSync(): Promise<void> {
    if (this.syncStatus.syncInProgress) return

    console.log('🔄 Performing sync...')
    this.updateSyncStatus({ syncInProgress: true })

    try {
      // Process offline queue
      await this.processOfflineQueue()

      // Update last sync time
      this.updateSyncStatus({
        lastSync: new Date(),
        syncInProgress: false
      })

      console.log('✅ Sync completed successfully')
    } catch (error) {
      console.error('❌ Sync failed:', error)
      this.updateSyncStatus({
        syncInProgress: false,
        errors: [...this.syncStatus.errors, error.message]
      })
    }
  }

  private async performInitialSync(): Promise<void> {
    if (!this.userId) return

    console.log('🔄 Performing initial sync...')

    try {
      // Get user profile
      const profile = await this.getUserProfile()
      if (profile) {
        this.handleRealtimeUpdate('userProfile', profile)
      }

      // Get favorites
      const favorites = await this.getFavorites()
      this.handleRealtimeUpdate('favorites', favorites)

      // Get playlists
      const playlists = await this.getPlaylists()
      this.handleRealtimeUpdate('playlists', playlists)

      console.log('✅ Initial sync completed')
    } catch (error) {
      console.error('❌ Initial sync failed:', error)
    }
  }

  private updateSyncStatus(updates: Partial<SyncStatus> = {}): void {
    this.syncStatus = { ...this.syncStatus, ...updates }

    // Dispatch status update event
    const event = new CustomEvent('sync-status-update', {
      detail: this.syncStatus,
      bubbles: true
    })
    document.dispatchEvent(event)
  }

  public getSyncStatus(): SyncStatus {
    return { ...this.syncStatus }
  }

  // ============================================================================
  // Conflict Resolution
  // ============================================================================

  private setupConflictResolution(): void {
    // This would implement more sophisticated conflict resolution logic
    console.log(`🔧 Conflict resolution strategy: ${SYNC_CONFIG.conflictResolution}`)
  }

  // ============================================================================
  // Event Listeners
  // ============================================================================

  private setupEventListeners(): void {
    // Online/Offline events
    window.addEventListener('online', () => {
      console.log('🌐 Back online')
      this.updateSyncStatus({ isOnline: true })
      this.processOfflineQueue()
    })

    window.addEventListener('offline', () => {
      console.log('📶 Gone offline')
      this.updateSyncStatus({ isOnline: false })
    })

    // Page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.syncStatus.isOnline) {
        this.performSync()
      }
    })
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  private getDeviceId(): string {
    let deviceId = localStorage.getItem('deviceId')
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('deviceId', deviceId)
    }
    return deviceId
  }

  private startOfflineQueueProcessing(): void {
    // Process queue when online
    if (this.syncStatus.isOnline) {
      this.processOfflineQueue()
    }
  }

  // ============================================================================
  // Public API
  // ============================================================================

  public async syncLocalToCloud(userId: string): Promise<void> {
    this.userId = userId
    await this.performSync()
  }

  public async syncCloudToLocal(): Promise<void> {
    await this.performInitialSync()
  }

  public forceSync(): Promise<void> {
    if (this.syncStatus.syncInProgress) {
      console.warn('⚠️ Sync already in progress')
      return
    }

    await this.performSync()
  }

  public clearOfflineQueue(): void {
    this.offlineQueue = []
    localStorage.removeItem('offlineQueue')
    console.log('🗑️ Offline queue cleared')
  }

  public getOfflineQueueSize(): number {
    return this.offlineQueue.length
  }

  public isOnline(): boolean {
    return this.syncStatus.isOnline
  }

  public cleanup(): void {
    // Clear sync timer
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = null
    }

    // Disable real-time sync
    this.disableRealtimeSync()

    // Clear offline queue
    this.clearOfflineQueue()

    this.isInitialized = false
    console.log('🧹 Cloud Sync Manager cleaned up')
  }
}

// ============================================================================
// Vue Composable
// ============================================================================

export const useCloudSync = () => {
  const syncManager = CloudSyncManager.getInstance()

  return {
    syncManager,
    syncStatus: syncManager.getSyncStatus(),
    isOnline: syncManager.isOnline(),
    queueSize: syncManager.getOfflineQueueSize(),
    forceSync: () => syncManager.forceSync(),
    enableRealtimeSync: () => syncManager.enableRealtimeSync(),
    disableRealtimeSync: () => syncManager.disableRealtimeSync(),

    // Sync methods
    syncUserProfile: (profile: Partial<UserProfile>) => syncManager.syncUserProfile(profile),
    syncFavorites: (favorites: string[]) => syncManager.syncFavorites(favorites),
    addFavorite: (trackId: string) => syncManager.addFavorite(trackId),
    removeFavorite: (trackId: string) => syncManager.removeFavorite(trackId),
    syncPlaylists: (playlists: Playlist[]) => syncManager.syncPlaylists(playlists),
    syncListeningHistory: (records: ListeningRecord[]) => syncManager.syncListeningHistory(records),

    // Get methods
    getUserProfile: () => syncManager.getUserProfile(),
    getFavorites: () => syncManager.getFavorites(),
    getPlaylists: () => syncManager.getPlaylists(),
    getListeningHistory: (limit?: number) => syncManager.getListeningHistory(limit)
  }
}

export default CloudSyncManager