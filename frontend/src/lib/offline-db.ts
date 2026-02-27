/**
 * IndexedDB wrapper for offline lesson storage
 * Provides CRUD operations for lessons that work offline
 */

const DB_NAME = 'BibleLessonPlannerOffline'
const DB_VERSION = 2 // Incremented for pending templates store
const LESSONS_STORE = 'lessons'
const SYNC_QUEUE_STORE = 'syncQueue'
const USER_DATA_STORE = 'userData'
const PENDING_TEMPLATES_STORE = 'pendingTemplates'

export interface OfflineLesson {
  id: string
  userId: string
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
  createdAt: string
  updatedAt: string
  isFavorite?: boolean
  isOfflineCreated?: boolean
  lastSyncedAt?: string
}

export interface SyncQueueItem {
  id: string
  lessonId: string
  action: 'create' | 'update' | 'delete'
  data?: any
  timestamp: string
  retryCount: number
}

export interface PendingTemplate {
  id: string
  userId: string
  templateId: string
  templateTitle: string
  passage: string
  ageGroup: string
  duration: string
  theme: string
  description: string
  savedAt: string
  // Full template data for offline display
  templateData: any
}

let dbInstance: IDBDatabase | null = null

/**
 * Initialize the IndexedDB database
 */
export async function initOfflineDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error('[OfflineDB] Failed to open database:', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      dbInstance = request.result
      console.log('[OfflineDB] Database opened successfully')
      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      console.log('[OfflineDB] Upgrading database...')

      // Lessons store
      if (!db.objectStoreNames.contains(LESSONS_STORE)) {
        const lessonsStore = db.createObjectStore(LESSONS_STORE, { keyPath: 'id' })
        lessonsStore.createIndex('userId', 'userId', { unique: false })
        lessonsStore.createIndex('updatedAt', 'updatedAt', { unique: false })
        lessonsStore.createIndex('isFavorite', 'isFavorite', { unique: false })
      }

      // Sync queue store for offline changes
      if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
        const syncStore = db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id' })
        syncStore.createIndex('timestamp', 'timestamp', { unique: false })
        syncStore.createIndex('lessonId', 'lessonId', { unique: false })
      }

      // User data store (for caching user preferences)
      if (!db.objectStoreNames.contains(USER_DATA_STORE)) {
        db.createObjectStore(USER_DATA_STORE, { keyPath: 'key' })
      }

      // Pending templates store (v2) - templates saved for offline generation
      if (!db.objectStoreNames.contains(PENDING_TEMPLATES_STORE)) {
        const templatesStore = db.createObjectStore(PENDING_TEMPLATES_STORE, { keyPath: 'id' })
        templatesStore.createIndex('userId', 'userId', { unique: false })
        templatesStore.createIndex('savedAt', 'savedAt', { unique: false })
      }
    }
  })
}

/**
 * Get the database instance
 */
async function getDB(): Promise<IDBDatabase> {
  if (!dbInstance) {
    return initOfflineDB()
  }
  return dbInstance
}

// ==================== LESSON OPERATIONS ====================

/**
 * Save a lesson to IndexedDB
 */
export async function saveOfflineLesson(lesson: OfflineLesson): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([LESSONS_STORE], 'readwrite')
    const store = transaction.objectStore(LESSONS_STORE)
    
    const request = store.put({
      ...lesson,
      lastSyncedAt: new Date().toISOString()
    })

    request.onsuccess = () => {
      console.log('[OfflineDB] Lesson saved:', lesson.id)
      resolve()
    }
    request.onerror = () => {
      console.error('[OfflineDB] Failed to save lesson:', request.error)
      reject(request.error)
    }
  })
}

/**
 * Get a lesson by ID from IndexedDB
 */
export async function getOfflineLesson(lessonId: string): Promise<OfflineLesson | null> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([LESSONS_STORE], 'readonly')
    const store = transaction.objectStore(LESSONS_STORE)
    const request = store.get(lessonId)

    request.onsuccess = () => {
      resolve(request.result || null)
    }
    request.onerror = () => {
      reject(request.error)
    }
  })
}

/**
 * Get all lessons for a user from IndexedDB
 */
export async function getAllOfflineLessons(userId: string): Promise<OfflineLesson[]> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([LESSONS_STORE], 'readonly')
    const store = transaction.objectStore(LESSONS_STORE)
    const index = store.index('userId')
    const request = index.getAll(userId)

    request.onsuccess = () => {
      const lessons = request.result || []
      // Sort by updatedAt descending
      lessons.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      resolve(lessons)
    }
    request.onerror = () => {
      reject(request.error)
    }
  })
}

/**
 * Delete a lesson from IndexedDB
 */
export async function deleteOfflineLesson(lessonId: string): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([LESSONS_STORE], 'readwrite')
    const store = transaction.objectStore(LESSONS_STORE)
    const request = store.delete(lessonId)

    request.onsuccess = () => {
      console.log('[OfflineDB] Lesson deleted:', lessonId)
      resolve()
    }
    request.onerror = () => {
      reject(request.error)
    }
  })
}

/**
 * Bulk save lessons (for initial sync)
 */
export async function bulkSaveLessons(lessons: OfflineLesson[]): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([LESSONS_STORE], 'readwrite')
    const store = transaction.objectStore(LESSONS_STORE)
    
    let completed = 0
    const total = lessons.length

    if (total === 0) {
      resolve()
      return
    }

    lessons.forEach(lesson => {
      const request = store.put({
        ...lesson,
        lastSyncedAt: new Date().toISOString()
      })
      
      request.onsuccess = () => {
        completed++
        if (completed === total) {
          console.log(`[OfflineDB] Bulk saved ${total} lessons`)
          resolve()
        }
      }
      request.onerror = () => {
        reject(request.error)
      }
    })
  })
}

// ==================== SYNC QUEUE OPERATIONS ====================

/**
 * Add an action to the sync queue (for offline changes)
 */
export async function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SYNC_QUEUE_STORE], 'readwrite')
    const store = transaction.objectStore(SYNC_QUEUE_STORE)
    
    const queueItem: SyncQueueItem = {
      ...item,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      retryCount: 0
    }

    const request = store.add(queueItem)

    request.onsuccess = () => {
      console.log('[OfflineDB] Added to sync queue:', queueItem.action, item.lessonId)
      resolve()
    }
    request.onerror = () => {
      reject(request.error)
    }
  })
}

/**
 * Get all items in the sync queue
 */
export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SYNC_QUEUE_STORE], 'readonly')
    const store = transaction.objectStore(SYNC_QUEUE_STORE)
    const request = store.getAll()

    request.onsuccess = () => {
      const items = request.result || []
      items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      resolve(items)
    }
    request.onerror = () => {
      reject(request.error)
    }
  })
}

/**
 * Remove an item from the sync queue
 */
export async function removeFromSyncQueue(id: string): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SYNC_QUEUE_STORE], 'readwrite')
    const store = transaction.objectStore(SYNC_QUEUE_STORE)
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * Update retry count for a sync queue item
 */
export async function updateSyncQueueItem(id: string, updates: Partial<SyncQueueItem>): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SYNC_QUEUE_STORE], 'readwrite')
    const store = transaction.objectStore(SYNC_QUEUE_STORE)
    const getRequest = store.get(id)

    getRequest.onsuccess = () => {
      if (getRequest.result) {
        const updated = { ...getRequest.result, ...updates }
        const putRequest = store.put(updated)
        putRequest.onsuccess = () => resolve()
        putRequest.onerror = () => reject(putRequest.error)
      } else {
        resolve()
      }
    }
    getRequest.onerror = () => reject(getRequest.error)
  })
}

/**
 * Clear the entire sync queue
 */
export async function clearSyncQueue(): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SYNC_QUEUE_STORE], 'readwrite')
    const store = transaction.objectStore(SYNC_QUEUE_STORE)
    const request = store.clear()

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

// ==================== USER DATA OPERATIONS ====================

/**
 * Save user data to IndexedDB
 */
export async function saveUserData(key: string, value: any): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([USER_DATA_STORE], 'readwrite')
    const store = transaction.objectStore(USER_DATA_STORE)
    const request = store.put({ key, value, updatedAt: new Date().toISOString() })

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * Get user data from IndexedDB
 */
export async function getUserData(key: string): Promise<any> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([USER_DATA_STORE], 'readonly')
    const store = transaction.objectStore(USER_DATA_STORE)
    const request = store.get(key)

    request.onsuccess = () => {
      resolve(request.result?.value || null)
    }
    request.onerror = () => reject(request.error)
  })
}

// ==================== UTILITY FUNCTIONS ====================

// ==================== PENDING TEMPLATES OPERATIONS ====================

/**
 * Save a template for later generation (offline mode)
 */
export async function savePendingTemplate(template: Omit<PendingTemplate, 'id' | 'savedAt'>): Promise<PendingTemplate> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PENDING_TEMPLATES_STORE], 'readwrite')
    const store = transaction.objectStore(PENDING_TEMPLATES_STORE)
    
    const pendingTemplate: PendingTemplate = {
      ...template,
      id: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      savedAt: new Date().toISOString()
    }

    const request = store.add(pendingTemplate)

    request.onsuccess = () => {
      console.log('[OfflineDB] Saved pending template:', pendingTemplate.templateTitle)
      resolve(pendingTemplate)
    }
    request.onerror = () => {
      reject(request.error)
    }
  })
}

/**
 * Get all pending templates for a user
 */
export async function getPendingTemplates(userId: string): Promise<PendingTemplate[]> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PENDING_TEMPLATES_STORE], 'readonly')
    const store = transaction.objectStore(PENDING_TEMPLATES_STORE)
    const index = store.index('userId')
    const request = index.getAll(userId)

    request.onsuccess = () => {
      const templates = request.result || []
      // Sort by savedAt descending (most recent first)
      templates.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
      resolve(templates)
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * Get a single pending template by ID
 */
export async function getPendingTemplate(id: string): Promise<PendingTemplate | null> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PENDING_TEMPLATES_STORE], 'readonly')
    const store = transaction.objectStore(PENDING_TEMPLATES_STORE)
    const request = store.get(id)

    request.onsuccess = () => {
      resolve(request.result || null)
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * Remove a pending template (after it's been generated or cancelled)
 */
export async function removePendingTemplate(id: string): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PENDING_TEMPLATES_STORE], 'readwrite')
    const store = transaction.objectStore(PENDING_TEMPLATES_STORE)
    const request = store.delete(id)

    request.onsuccess = () => {
      console.log('[OfflineDB] Removed pending template:', id)
      resolve()
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * Get count of pending templates
 */
export async function getPendingTemplatesCount(userId: string): Promise<number> {
  const templates = await getPendingTemplates(userId)
  return templates.length
}

/**
 * Get offline storage statistics (updated to include pending templates)
 */
export async function getOfflineStats(): Promise<{
  lessonCount: number
  syncQueueCount: number
  pendingTemplatesCount: number
  estimatedSize: string
}> {
  const db = await getDB()
  
  return new Promise((resolve) => {
    const transaction = db.transaction([LESSONS_STORE, SYNC_QUEUE_STORE, PENDING_TEMPLATES_STORE], 'readonly')
    const lessonsStore = transaction.objectStore(LESSONS_STORE)
    const syncStore = transaction.objectStore(SYNC_QUEUE_STORE)
    const pendingStore = transaction.objectStore(PENDING_TEMPLATES_STORE)
    
    const lessonsCount = lessonsStore.count()
    const syncCount = syncStore.count()
    const pendingCount = pendingStore.count()
    
    let lessonCount = 0
    let syncQueueCount = 0
    let pendingTemplatesCount = 0
    
    lessonsCount.onsuccess = () => {
      lessonCount = lessonsCount.result
    }
    
    syncCount.onsuccess = () => {
      syncQueueCount = syncCount.result
    }
    
    pendingCount.onsuccess = () => {
      pendingTemplatesCount = pendingCount.result
    }
    
    transaction.oncomplete = () => {
      // Estimate storage (rough calculation)
      const estimatedBytes = (lessonCount * 5000) + (pendingTemplatesCount * 3000) // ~5KB per lesson, ~3KB per template
      const estimatedSize = estimatedBytes < 1024 * 1024 
        ? `${Math.round(estimatedBytes / 1024)} KB`
        : `${(estimatedBytes / (1024 * 1024)).toFixed(1)} MB`
      
      resolve({ lessonCount, syncQueueCount, pendingTemplatesCount, estimatedSize })
    }
  })
}

/**
 * Clear all offline data
 */
export async function clearAllOfflineData(): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([LESSONS_STORE, SYNC_QUEUE_STORE, USER_DATA_STORE, PENDING_TEMPLATES_STORE], 'readwrite')
    
    transaction.objectStore(LESSONS_STORE).clear()
    transaction.objectStore(SYNC_QUEUE_STORE).clear()
    transaction.objectStore(USER_DATA_STORE).clear()
    transaction.objectStore(PENDING_TEMPLATES_STORE).clear()
    
    transaction.oncomplete = () => {
      console.log('[OfflineDB] All offline data cleared')
      resolve()
    }
    transaction.onerror = () => {
      reject(transaction.error)
    }
  })
}

/**
 * Check if IndexedDB is supported
 */
export function isOfflineSupported(): boolean {
  return 'indexedDB' in window
}
