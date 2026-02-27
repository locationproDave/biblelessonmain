/**
 * useOfflineLessons Hook
 * Provides offline-first access to lessons with automatic sync
 */

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'
import { useSession } from './auth-client'
import {
  initializeOfflineSupport,
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  toggleFavorite,
  processSyncQueue,
  subscribeSyncStatus,
  getSyncState,
  startAutoSync,
  stopAutoSync,
  clearOfflineData,
  isOnline,
} from './offline-sync'
import type { SyncState, OfflineLesson } from './offline-sync'
import { initOfflineDB, getOfflineStats, isOfflineSupported } from './offline-db'

// Global state for lessons to enable cross-component updates
let lessonsCache: OfflineLesson[] = []
let lessonsListeners: (() => void)[] = []

function notifyLessonsListeners() {
  lessonsListeners.forEach(l => l())
}

function subscribeLessons(listener: () => void) {
  lessonsListeners.push(listener)
  return () => {
    lessonsListeners = lessonsListeners.filter(l => l !== listener)
  }
}

function getLessonsSnapshot() {
  return lessonsCache
}

/**
 * Hook for managing offline lessons
 */
export function useOfflineLessons() {
  const { data: session } = useSession()
  const userId = session?.user?.id
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Subscribe to sync status changes
  const [syncState, setSyncState] = useState<SyncState>(getSyncState())
  
  useEffect(() => {
    return subscribeSyncStatus(setSyncState)
  }, [])
  
  // Use sync external store for lessons
  const lessons = useSyncExternalStore(subscribeLessons, getLessonsSnapshot)
  
  // Initialize offline support when user logs in
  useEffect(() => {
    if (!userId) {
      setIsInitialized(false)
      lessonsCache = []
      notifyLessonsListeners()
      return
    }
    
    let mounted = true
    
    const init = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Check if offline is supported
        if (!isOfflineSupported()) {
          console.warn('[useOfflineLessons] IndexedDB not supported')
          setError('Offline mode not supported in this browser')
          setIsLoading(false)
          return
        }
        
        // Initialize offline support
        await initializeOfflineSupport(userId)
        
        // Load lessons
        const fetchedLessons = await getLessons(userId)
        
        if (mounted) {
          lessonsCache = fetchedLessons
          notifyLessonsListeners()
          setIsInitialized(true)
          setIsLoading(false)
          
          // Start auto-sync
          startAutoSync()
        }
      } catch (err: any) {
        console.error('[useOfflineLessons] Initialization error:', err)
        if (mounted) {
          setError(err.message || 'Failed to initialize offline mode')
          setIsLoading(false)
        }
      }
    }
    
    init()
    
    return () => {
      mounted = false
    }
  }, [userId])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't stop auto-sync on unmount - let it continue in background
    }
  }, [])
  
  // Refresh lessons from both local and server
  const refresh = useCallback(async () => {
    if (!userId) return
    
    setIsLoading(true)
    try {
      const fetchedLessons = await getLessons(userId)
      lessonsCache = fetchedLessons
      notifyLessonsListeners()
    } catch (err: any) {
      setError(err.message || 'Failed to refresh lessons')
    } finally {
      setIsLoading(false)
    }
  }, [userId])
  
  // Force sync with server
  const forceSync = useCallback(async () => {
    if (!isOnline()) {
      return { success: false, message: 'You are offline' }
    }
    
    try {
      const result = await processSyncQueue()
      await refresh()
      return {
        success: true,
        message: `Synced ${result.success} changes${result.failed > 0 ? `, ${result.failed} failed` : ''}`,
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Sync failed' }
    }
  }, [refresh])
  
  // Create a new lesson
  const create = useCallback(async (lessonData: {
    title: string
    passage: string
    ageGroup: string
    duration: string
    format: string
    theme?: string
    sections: any[]
    memoryVerse?: any
    materials?: string[]
    objectives?: string[]
    crossReferences?: any[]
    isFavorite?: boolean
    isOfflineCreated?: boolean
  }) => {
    if (!userId) throw new Error('Not logged in')
    
    try {
      const newLesson = await createLesson({
        ...lessonData,
        userId,
      })
      
      lessonsCache = [newLesson, ...lessonsCache]
      notifyLessonsListeners()
      
      return newLesson
    } catch (err: any) {
      setError(err.message || 'Failed to create lesson')
      throw err
    }
  }, [userId])
  
  // Update a lesson
  const update = useCallback(async (lessonId: string, updates: Partial<OfflineLesson>) => {
    try {
      const updated = await updateLesson(lessonId, updates)
      
      if (updated) {
        lessonsCache = lessonsCache.map(l => l.id === lessonId ? updated : l)
        notifyLessonsListeners()
      }
      
      return updated
    } catch (err: any) {
      setError(err.message || 'Failed to update lesson')
      throw err
    }
  }, [])
  
  // Delete a lesson
  const remove = useCallback(async (lessonId: string) => {
    try {
      await deleteLesson(lessonId)
      
      lessonsCache = lessonsCache.filter(l => l.id !== lessonId)
      notifyLessonsListeners()
      
      return true
    } catch (err: any) {
      setError(err.message || 'Failed to delete lesson')
      throw err
    }
  }, [])
  
  // Toggle favorite
  const toggleFav = useCallback(async (lessonId: string) => {
    try {
      const updated = await toggleFavorite(lessonId)
      
      if (updated) {
        lessonsCache = lessonsCache.map(l => l.id === lessonId ? updated : l)
        notifyLessonsListeners()
      }
      
      return updated
    } catch (err: any) {
      setError(err.message || 'Failed to toggle favorite')
      throw err
    }
  }, [])
  
  // Clear offline data (for logout)
  const clearData = useCallback(async () => {
    try {
      stopAutoSync()
      await clearOfflineData()
      lessonsCache = []
      notifyLessonsListeners()
      setIsInitialized(false)
    } catch (err: any) {
      console.error('[useOfflineLessons] Failed to clear data:', err)
    }
  }, [])
  
  return {
    // Data
    lessons,
    isLoading,
    error,
    isInitialized,
    isOnline: isOnline(),
    
    // Sync status
    syncState,
    hasPendingChanges: syncState.pendingChanges > 0,
    isSyncing: syncState.status === 'syncing',
    
    // Actions
    refresh,
    forceSync,
    create,
    update,
    remove,
    toggleFavorite: toggleFav,
    clearData,
    
    // Utilities
    getLesson,
  }
}

/**
 * Hook for getting a single lesson (offline-first)
 */
export function useOfflineLesson(lessonId: string | undefined) {
  const [lesson, setLesson] = useState<OfflineLesson | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    if (!lessonId) {
      setLesson(null)
      setIsLoading(false)
      return
    }
    
    let mounted = true
    
    const fetchLesson = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const result = await getLesson(lessonId)
        if (mounted) {
          setLesson(result)
          setIsLoading(false)
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Failed to load lesson')
          setIsLoading(false)
        }
      }
    }
    
    fetchLesson()
    
    return () => {
      mounted = false
    }
  }, [lessonId])
  
  return { lesson, isLoading, error }
}

/**
 * Hook for offline storage stats
 */
export function useOfflineStats() {
  const [stats, setStats] = useState<{
    lessonCount: number
    syncQueueCount: number
    estimatedSize: string
  } | null>(null)
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        await initOfflineDB()
        const result = await getOfflineStats()
        setStats(result)
      } catch {
        // Ignore errors
      }
    }
    
    fetchStats()
    
    // Refresh stats periodically
    const interval = setInterval(fetchStats, 10000)
    return () => clearInterval(interval)
  }, [])
  
  return stats
}

/**
 * Hook for detecting online/offline status
 */
export function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine)
  
  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  return online
}
