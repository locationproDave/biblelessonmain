/**
 * Offline Sync Service
 * Manages synchronization between IndexedDB and the API server
 * Implements CRUD operations that work offline and sync when online
 */

import {
  initOfflineDB,
  saveOfflineLesson,
  getOfflineLesson,
  getAllOfflineLessons,
  deleteOfflineLesson,
  bulkSaveLessons,
  addToSyncQueue,
  getSyncQueue,
  removeFromSyncQueue,
  updateSyncQueueItem,
  saveUserData,
  getUserData,
} from './offline-db'
import type { OfflineLesson, SyncQueueItem } from './offline-db'
import { lessonsAPI } from './api'
import type { Lesson } from './api'

// Re-export OfflineLesson type
export type { OfflineLesson } from './offline-db'

// Sync status types
export type SyncStatus = 'idle' | 'syncing' | 'error' | 'success'

export interface SyncState {
  status: SyncStatus
  pendingChanges: number
  lastSyncedAt: string | null
  error: string | null
}

// Event listeners for sync status changes
type SyncListener = (state: SyncState) => void
let syncListeners: SyncListener[] = []
let currentSyncState: SyncState = {
  status: 'idle',
  pendingChanges: 0,
  lastSyncedAt: null,
  error: null,
}

function notifySyncListeners() {
  syncListeners.forEach(listener => listener(currentSyncState))
}

export function subscribeSyncStatus(listener: SyncListener): () => void {
  syncListeners.push(listener)
  listener(currentSyncState) // Immediately call with current state
  return () => {
    syncListeners = syncListeners.filter(l => l !== listener)
  }
}

export function getSyncState(): SyncState {
  return { ...currentSyncState }
}

function updateSyncState(updates: Partial<SyncState>) {
  currentSyncState = { ...currentSyncState, ...updates }
  notifySyncListeners()
}

// Convert API Lesson to OfflineLesson format
function apiLessonToOffline(lesson: Lesson, userId: string): OfflineLesson {
  let sections: any[] = []
  let materials: string[] = []
  let crossReferences: any[] = []

  try {
    sections = typeof lesson.sectionsJson === 'string' 
      ? JSON.parse(lesson.sectionsJson) 
      : lesson.sectionsJson || []
  } catch { sections = [] }

  try {
    materials = typeof lesson.materialsJson === 'string'
      ? JSON.parse(lesson.materialsJson)
      : lesson.materialsJson || []
  } catch { materials = [] }

  try {
    crossReferences = typeof lesson.crossReferencesJson === 'string'
      ? JSON.parse(lesson.crossReferencesJson)
      : lesson.crossReferencesJson || []
  } catch { crossReferences = [] }

  return {
    id: lesson.id,
    userId: userId,
    title: lesson.title,
    passage: lesson.passage,
    ageGroup: lesson.ageGroup,
    duration: lesson.duration,
    format: lesson.format,
    theme: lesson.theme,
    sections,
    memoryVerse: {
      text: lesson.memoryVerseText,
      reference: lesson.memoryVerseReference,
    },
    materials,
    objectives: lesson.objectives,
    crossReferences,
    createdAt: lesson.createdAt || new Date().toISOString(),
    updatedAt: lesson.createdAt || new Date().toISOString(),
    isFavorite: lesson.favorite,
    isOfflineCreated: false,
    lastSyncedAt: new Date().toISOString(),
  }
}

// Convert OfflineLesson to API format for creating/updating
function offlineLessonToApi(lesson: OfflineLesson): Omit<Lesson, 'id' | 'userId' | 'favorite' | 'createdAt'> {
  return {
    title: lesson.title,
    passage: lesson.passage,
    ageGroup: lesson.ageGroup,
    duration: lesson.duration,
    format: lesson.format,
    theme: lesson.theme || '',
    memoryVerseText: lesson.memoryVerse?.text || '',
    memoryVerseReference: lesson.memoryVerse?.reference || '',
    objectives: lesson.objectives || [],
    sectionsJson: JSON.stringify(lesson.sections || []),
    materialsJson: JSON.stringify(lesson.materials || []),
    crossReferencesJson: JSON.stringify(lesson.crossReferences || []),
  }
}

// Check if we're online
export function isOnline(): boolean {
  return navigator.onLine
}

/**
 * Initialize offline support for a user
 * Downloads all lessons to IndexedDB
 */
export async function initializeOfflineSupport(userId: string): Promise<void> {
  try {
    await initOfflineDB()
    console.log('[OfflineSync] Initializing offline support for user:', userId)
    
    // Save user ID for later use
    await saveUserData('currentUserId', userId)
    
    // If online, sync lessons from server
    if (isOnline()) {
      await syncFromServer(userId)
    }
    
    // Update pending changes count
    const queue = await getSyncQueue()
    updateSyncState({
      pendingChanges: queue.length,
      lastSyncedAt: await getUserData('lastSyncedAt'),
    })
  } catch (error) {
    console.error('[OfflineSync] Failed to initialize:', error)
  }
}

/**
 * Sync lessons from server to IndexedDB
 */
export async function syncFromServer(userId: string): Promise<void> {
  if (!isOnline()) {
    console.log('[OfflineSync] Offline - skipping server sync')
    return
  }

  try {
    updateSyncState({ status: 'syncing' })
    console.log('[OfflineSync] Syncing lessons from server...')
    
    const serverLessons = await lessonsAPI.getAll()
    const offlineLessons = serverLessons.map(lesson => apiLessonToOffline(lesson, userId))
    
    await bulkSaveLessons(offlineLessons)
    
    const now = new Date().toISOString()
    await saveUserData('lastSyncedAt', now)
    
    updateSyncState({
      status: 'success',
      lastSyncedAt: now,
      error: null,
    })
    
    console.log(`[OfflineSync] Synced ${offlineLessons.length} lessons from server`)
  } catch (error: any) {
    console.error('[OfflineSync] Server sync failed:', error)
    updateSyncState({
      status: 'error',
      error: error.message || 'Failed to sync from server',
    })
  }
}

/**
 * Process the sync queue - push offline changes to server
 */
export async function processSyncQueue(): Promise<{ success: number; failed: number }> {
  if (!isOnline()) {
    console.log('[OfflineSync] Offline - cannot process sync queue')
    return { success: 0, failed: 0 }
  }

  const queue = await getSyncQueue()
  if (queue.length === 0) {
    console.log('[OfflineSync] Sync queue is empty')
    return { success: 0, failed: 0 }
  }

  console.log(`[OfflineSync] Processing ${queue.length} queued operations...`)
  updateSyncState({ status: 'syncing' })

  let success = 0
  let failed = 0

  for (const item of queue) {
    try {
      await processQueueItem(item)
      await removeFromSyncQueue(item.id)
      success++
    } catch (error: any) {
      console.error(`[OfflineSync] Failed to process queue item ${item.id}:`, error)
      
      // Increment retry count
      const newRetryCount = (item.retryCount || 0) + 1
      
      if (newRetryCount >= 3) {
        // Max retries reached, remove from queue
        console.log(`[OfflineSync] Max retries reached for item ${item.id}, removing from queue`)
        await removeFromSyncQueue(item.id)
      } else {
        await updateSyncQueueItem(item.id, { retryCount: newRetryCount })
      }
      
      failed++
    }
  }

  // Update sync state
  const remainingQueue = await getSyncQueue()
  const now = new Date().toISOString()
  await saveUserData('lastSyncedAt', now)
  
  updateSyncState({
    status: failed > 0 ? 'error' : 'success',
    pendingChanges: remainingQueue.length,
    lastSyncedAt: now,
    error: failed > 0 ? `${failed} operations failed to sync` : null,
  })

  console.log(`[OfflineSync] Sync complete: ${success} success, ${failed} failed`)
  return { success, failed }
}

async function processQueueItem(item: SyncQueueItem): Promise<void> {
  switch (item.action) {
    case 'create':
      if (item.data) {
        const apiData = offlineLessonToApi(item.data)
        const created = await lessonsAPI.create(apiData)
        // Update the offline lesson with the server-generated ID
        await deleteOfflineLesson(item.lessonId)
        const userId = await getUserData('currentUserId')
        if (userId) {
          await saveOfflineLesson(apiLessonToOffline(created, userId))
        }
      }
      break
      
    case 'update':
      if (item.data) {
        const updateData = offlineLessonToApi(item.data)
        await lessonsAPI.update(item.lessonId, updateData)
      }
      break
      
    case 'delete':
      await lessonsAPI.delete(item.lessonId)
      break
  }
}

// ==================== OFFLINE-FIRST CRUD OPERATIONS ====================

/**
 * Get all lessons (offline-first)
 */
export async function getLessons(userId: string): Promise<OfflineLesson[]> {
  try {
    // Always try to get from IndexedDB first
    const offlineLessons = await getAllOfflineLessons(userId)
    
    // If online and we have no lessons, try to sync from server
    if (offlineLessons.length === 0 && isOnline()) {
      await syncFromServer(userId)
      return await getAllOfflineLessons(userId)
    }
    
    return offlineLessons
  } catch (error) {
    console.error('[OfflineSync] Error getting lessons:', error)
    
    // Fallback to API if IndexedDB fails and we're online
    if (isOnline()) {
      const serverLessons = await lessonsAPI.getAll()
      return serverLessons.map(l => apiLessonToOffline(l, userId))
    }
    
    return []
  }
}

/**
 * Get a single lesson by ID (offline-first)
 */
export async function getLesson(lessonId: string): Promise<OfflineLesson | null> {
  try {
    // Check IndexedDB first
    const offlineLesson = await getOfflineLesson(lessonId)
    if (offlineLesson) {
      return offlineLesson
    }
    
    // If not found locally and online, try server
    if (isOnline()) {
      const serverLesson = await lessonsAPI.getById(lessonId)
      const userId = await getUserData('currentUserId')
      if (userId) {
        const offline = apiLessonToOffline(serverLesson, userId)
        await saveOfflineLesson(offline)
        return offline
      }
    }
    
    return null
  } catch (error) {
    console.error('[OfflineSync] Error getting lesson:', error)
    return null
  }
}

/**
 * Create a new lesson (offline-first)
 */
export async function createLesson(lesson: Omit<OfflineLesson, 'id' | 'createdAt' | 'updatedAt' | 'lastSyncedAt'>): Promise<OfflineLesson> {
  const now = new Date().toISOString()
  const tempId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const newLesson: OfflineLesson = {
    ...lesson,
    id: tempId,
    createdAt: now,
    updatedAt: now,
    isOfflineCreated: !isOnline(),
    lastSyncedAt: undefined,
  }
  
  // Save to IndexedDB immediately
  await saveOfflineLesson(newLesson)
  
  if (isOnline()) {
    // If online, sync immediately
    try {
      const apiData = offlineLessonToApi(newLesson)
      const created = await lessonsAPI.create(apiData)
      
      // Replace with server version
      await deleteOfflineLesson(tempId)
      const syncedLesson = apiLessonToOffline(created, lesson.userId)
      await saveOfflineLesson(syncedLesson)
      
      return syncedLesson
    } catch (error) {
      console.error('[OfflineSync] Failed to sync new lesson, queued for later:', error)
      // Add to sync queue for later
      await addToSyncQueue({
        lessonId: tempId,
        action: 'create',
        data: newLesson,
      })
      updateSyncState({ pendingChanges: (await getSyncQueue()).length })
      return newLesson
    }
  } else {
    // Queue for sync when back online
    await addToSyncQueue({
      lessonId: tempId,
      action: 'create',
      data: newLesson,
    })
    updateSyncState({ pendingChanges: (await getSyncQueue()).length })
    return newLesson
  }
}

/**
 * Update an existing lesson (offline-first)
 */
export async function updateLesson(lessonId: string, updates: Partial<OfflineLesson>): Promise<OfflineLesson | null> {
  const existing = await getOfflineLesson(lessonId)
  if (!existing) {
    console.error('[OfflineSync] Cannot update - lesson not found:', lessonId)
    return null
  }
  
  const updatedLesson: OfflineLesson = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  // Save to IndexedDB immediately
  await saveOfflineLesson(updatedLesson)
  
  if (isOnline() && !lessonId.startsWith('offline_')) {
    // If online and not a local-only lesson, sync immediately
    try {
      const apiData = offlineLessonToApi(updatedLesson)
      await lessonsAPI.update(lessonId, apiData)
      
      // Update lastSyncedAt
      updatedLesson.lastSyncedAt = new Date().toISOString()
      await saveOfflineLesson(updatedLesson)
      
      return updatedLesson
    } catch (error) {
      console.error('[OfflineSync] Failed to sync update, queued for later:', error)
      await addToSyncQueue({
        lessonId,
        action: 'update',
        data: updatedLesson,
      })
      updateSyncState({ pendingChanges: (await getSyncQueue()).length })
      return updatedLesson
    }
  } else {
    // Queue for sync when back online
    await addToSyncQueue({
      lessonId,
      action: 'update',
      data: updatedLesson,
    })
    updateSyncState({ pendingChanges: (await getSyncQueue()).length })
    return updatedLesson
  }
}

/**
 * Delete a lesson (offline-first)
 */
export async function deleteLesson(lessonId: string): Promise<boolean> {
  // Delete from IndexedDB immediately
  await deleteOfflineLesson(lessonId)
  
  if (isOnline() && !lessonId.startsWith('offline_')) {
    // If online and not a local-only lesson, sync immediately
    try {
      await lessonsAPI.delete(lessonId)
      return true
    } catch (error) {
      console.error('[OfflineSync] Failed to sync delete, queued for later:', error)
      await addToSyncQueue({
        lessonId,
        action: 'delete',
      })
      updateSyncState({ pendingChanges: (await getSyncQueue()).length })
      return true
    }
  } else if (!lessonId.startsWith('offline_')) {
    // Queue for sync when back online (if it's a server lesson)
    await addToSyncQueue({
      lessonId,
      action: 'delete',
    })
    updateSyncState({ pendingChanges: (await getSyncQueue()).length })
  }
  
  return true
}

/**
 * Toggle favorite status (offline-first)
 */
export async function toggleFavorite(lessonId: string): Promise<OfflineLesson | null> {
  const existing = await getOfflineLesson(lessonId)
  if (!existing) {
    return null
  }
  
  const updated = await updateLesson(lessonId, {
    isFavorite: !existing.isFavorite,
  })
  
  // Also try to sync with server immediately if online
  if (isOnline() && !lessonId.startsWith('offline_')) {
    try {
      await lessonsAPI.toggleFavorite(lessonId)
    } catch (error) {
      console.error('[OfflineSync] Failed to sync favorite toggle:', error)
    }
  }
  
  return updated
}

// ==================== AUTO-SYNC MANAGEMENT ====================

let syncInterval: NodeJS.Timeout | null = null

/**
 * Start automatic background sync when online
 */
export function startAutoSync(intervalMs: number = 30000): void {
  if (syncInterval) return
  
  console.log('[OfflineSync] Starting auto-sync...')
  
  // Process queue immediately if we have pending changes
  processSyncQueue()
  
  // Set up interval
  syncInterval = setInterval(() => {
    if (isOnline()) {
      processSyncQueue()
    }
  }, intervalMs)
  
  // Listen for online events
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
}

/**
 * Stop automatic sync
 */
export function stopAutoSync(): void {
  if (syncInterval) {
    clearInterval(syncInterval)
    syncInterval = null
  }
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
  console.log('[OfflineSync] Auto-sync stopped')
}

async function handleOnline() {
  console.log('[OfflineSync] Back online - processing sync queue...')
  updateSyncState({ status: 'syncing' })
  
  // First sync from server to get any changes made elsewhere
  const userId = await getUserData('currentUserId')
  if (userId) {
    await syncFromServer(userId)
  }
  
  // Then push our local changes
  await processSyncQueue()
}

function handleOffline() {
  console.log('[OfflineSync] Gone offline')
  updateSyncState({ status: 'idle' })
}

/**
 * Clear all offline data for logout
 */
export async function clearOfflineData(): Promise<void> {
  const { clearAllOfflineData } = await import('./offline-db')
  await clearAllOfflineData()
  updateSyncState({
    status: 'idle',
    pendingChanges: 0,
    lastSyncedAt: null,
    error: null,
  })
  console.log('[OfflineSync] All offline data cleared')
}
