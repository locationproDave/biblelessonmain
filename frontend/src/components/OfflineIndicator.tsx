import { useState, useEffect } from 'react'
import { WifiOff, Wifi, RefreshCw, CloudOff, Cloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { subscribeSyncStatus, getSyncState, processSyncQueue, isOnline as checkOnline } from '@/lib/offline-sync'
import type { SyncState } from '@/lib/offline-sync'
import { useSession } from '@/lib/auth-client'

export function OfflineIndicator() {
  const { data: session } = useSession()
  const [isOnline, setIsOnline] = useState(true)
  const [showReconnected, setShowReconnected] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [syncState, setSyncState] = useState<SyncState>(getSyncState())
  const [showSyncDetails, setShowSyncDetails] = useState(false)

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setShowReconnected(true)
      setTimeout(() => setShowReconnected(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowReconnected(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                setUpdateAvailable(true)
              }
            })
          }
        })
      })

      // Check for updates on page load
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.update()
        }
      })
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Subscribe to sync status changes (only when logged in)
  useEffect(() => {
    if (!session) return
    return subscribeSyncStatus(setSyncState)
  }, [session])

  const handleRefresh = () => {
    // Tell the service worker to skip waiting
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        }
      })
    }
    // Reload the page
    window.location.reload()
  }

  const handleForceSync = async () => {
    if (!checkOnline()) return
    await processSyncQueue()
  }

  // Show update available banner
  if (updateAvailable) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg border backdrop-blur-sm bg-blue-50/95 dark:bg-blue-900/95 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300">
        <div className="flex items-center gap-4">
          <RefreshCw className="w-5 h-5 animate-spin" strokeWidth={2} />
          <div>
            <span className="text-sm font-semibold block">Update available!</span>
            <span className="text-xs opacity-80">New version ready to install</span>
          </div>
          <button
            onClick={handleRefresh}
            className="ml-2 px-4 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }

  // For logged-in users, show sync status when there are pending changes or syncing
  if (session && (syncState.pendingChanges > 0 || syncState.status === 'syncing')) {
    return (
      <div 
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
        data-testid="offline-sync-indicator"
      >
        <div 
          className={`px-4 py-3 rounded-xl shadow-lg border backdrop-blur-sm transition-all duration-300 cursor-pointer ${
            syncState.status === 'syncing'
              ? 'bg-blue-50/95 dark:bg-blue-900/95 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
              : syncState.status === 'error'
              ? 'bg-red-50/95 dark:bg-red-900/95 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300'
              : 'bg-amber-50/95 dark:bg-amber-900/95 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300'
          }`}
          onClick={() => setShowSyncDetails(!showSyncDetails)}
        >
          <div className="flex items-center gap-3">
            {syncState.status === 'syncing' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2} />
                <div>
                  <span className="text-sm font-medium block">Syncing changes...</span>
                  <span className="text-xs opacity-80">{syncState.pendingChanges} pending</span>
                </div>
              </>
            ) : syncState.status === 'error' ? (
              <>
                <AlertCircle className="w-5 h-5" strokeWidth={2} />
                <div>
                  <span className="text-sm font-medium block">Sync failed</span>
                  <span className="text-xs opacity-80">{syncState.pendingChanges} changes pending</span>
                </div>
                {isOnline && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleForceSync() }}
                    className="ml-2 px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
                  >
                    Retry
                  </button>
                )}
              </>
            ) : (
              <>
                <CloudOff className="w-5 h-5" strokeWidth={2} />
                <div>
                  <span className="text-sm font-medium block">
                    {isOnline ? 'Changes pending' : "You're offline"}
                  </span>
                  <span className="text-xs opacity-80">
                    {syncState.pendingChanges} change{syncState.pendingChanges !== 1 ? 's' : ''} to sync
                  </span>
                </div>
                {isOnline && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleForceSync() }}
                    className="ml-2 px-3 py-1 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors"
                  >
                    Sync Now
                  </button>
                )}
              </>
            )}
          </div>
          
          {/* Expanded details */}
          {showSyncDetails && (
            <div className="mt-3 pt-3 border-t border-current/20 text-xs space-y-1">
              <p><strong>Status:</strong> {syncState.status}</p>
              <p><strong>Pending:</strong> {syncState.pendingChanges} changes</p>
              {syncState.lastSyncedAt && (
                <p><strong>Last sync:</strong> {new Date(syncState.lastSyncedAt).toLocaleString()}</p>
              )}
              {syncState.error && (
                <p className="text-red-600 dark:text-red-400"><strong>Error:</strong> {syncState.error}</p>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Show offline indicator for all users when offline
  if (!isOnline) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-sm bg-amber-50/95 dark:bg-amber-900/95 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300">
        <div className="flex items-center gap-3">
          <WifiOff className="w-5 h-5" strokeWidth={2} />
          <div>
            <span className="text-sm font-medium block">You're offline</span>
            <span className="text-xs opacity-80">
              {session ? 'Your lessons are saved locally' : 'Some features may be unavailable'}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Show reconnected message briefly
  if (showReconnected) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-sm bg-emerald-50/95 dark:bg-emerald-900/95 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300">
        <div className="flex items-center gap-3">
          <Wifi className="w-5 h-5" strokeWidth={2} />
          <span className="text-sm font-medium">Back online</span>
          {session && syncState.pendingChanges > 0 && (
            <span className="text-xs opacity-80">· Syncing {syncState.pendingChanges} changes...</span>
          )}
        </div>
      </div>
    )
  }

  return null
}
