/**
 * Offline Settings Component
 * Allows users to view offline storage stats and manage sync
 */

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  Trash2, 
  HardDrive, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Download,
  Upload,
  FileText,
  Clock,
  Sparkles,
  X
} from 'lucide-react'
import { useOfflineLessons, useOfflineStats, useOnlineStatus } from '@/lib/use-offline-lessons'
import { usePendingTemplates } from '@/lib/use-pending-templates'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { lessonStore, pickGradient, GRADIENTS } from '@/lib/lesson-store'
import { useI18n } from '@/i18n'

export function OfflineSettings() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const {
    lessons,
    syncState,
    hasPendingChanges,
    isSyncing,
    forceSync,
    clearData,
    refresh,
  } = useOfflineLessons()
  
  const { templates: pendingTemplates, remove: removePendingTemplate, hasPendingTemplates } = usePendingTemplates()
  const stats = useOfflineStats()
  const isOnline = useOnlineStatus()
  const [isClearing, setIsClearing] = useState(false)
  const [generatingTemplate, setGeneratingTemplate] = useState<string | null>(null)

  const handleForceSync = async () => {
    const result = await forceSync()
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  const handleClearData = async () => {
    if (!window.confirm(t('offline.clearConfirm'))) {
      return
    }
    
    setIsClearing(true)
    try {
      await clearData()
      toast.success(t('offline.dataCleared'))
      // Refresh to reload from server
      await refresh()
    } catch (error) {
      toast.error(t('offline.clearFailed'))
    } finally {
      setIsClearing(false)
    }
  }

  const handleRefresh = async () => {
    await refresh()
    toast.success(t('offline.lessonsRefreshed'))
  }

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isOnline ? (
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Wifi className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <WifiOff className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-stone-900 dark:text-stone-100">
              {isOnline ? t('offline.online') : t('offline.offline')}
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {isOnline ? t('offline.connectedInternet') : t('offline.workingOffline')}
            </p>
          </div>
        </div>
        
        {/* Sync Status Badge */}
        <div className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 ${
          isSyncing 
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
            : hasPendingChanges
            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
            : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
        }`}>
          {isSyncing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('offline.syncing')}
            </>
          ) : hasPendingChanges ? (
            <>
              <CloudOff className="w-4 h-4" />
              {syncState.pendingChanges} {t('offline.pending')}
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              {t('offline.synced')}
            </>
          )}
        </div>
      </div>

      {/* Storage Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Download className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                {stats?.lessonCount ?? lessons.length}
              </p>
              <p className="text-sm text-stone-500 dark:text-stone-400">{t('offline.lessonsSaved')}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Upload className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                {stats?.syncQueueCount ?? syncState.pendingChanges}
              </p>
              <p className="text-sm text-stone-500 dark:text-stone-400">{t('offline.pendingSync')}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                {stats?.estimatedSize ?? '0 KB'}
              </p>
              <p className="text-sm text-stone-500 dark:text-stone-400">{t('offline.storageUsed')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Last Sync Info */}
      {syncState.lastSyncedAt && (
        <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cloud className="w-5 h-5 text-stone-400" />
              <div>
                <p className="text-sm font-medium text-stone-700 dark:text-stone-300">{t('offline.lastSynced')}</p>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {new Date(syncState.lastSyncedAt).toLocaleString()}
                </p>
              </div>
            </div>
            {syncState.error && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{syncState.error}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleForceSync}
          disabled={!isOnline || isSyncing}
          className="flex items-center gap-2"
          data-testid="force-sync-btn"
        >
          {isSyncing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {isSyncing ? t('offline.syncing') : t('offline.syncNow')}
        </Button>
        
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isSyncing}
          className="flex items-center gap-2"
          data-testid="refresh-lessons-btn"
        >
          <Download className="w-4 h-4" />
          {t('offline.refreshLessons')}
        </Button>
        
        <Button
          variant="destructive"
          onClick={handleClearData}
          disabled={isClearing}
          className="flex items-center gap-2"
          data-testid="clear-offline-data-btn"
        >
          {isClearing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          {t('offline.clearOfflineData')}
        </Button>
      </div>

      {/* Pending Templates Section */}
      {hasPendingTemplates && (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800/40 overflow-hidden">
          <div className="p-4 border-b border-purple-200 dark:border-purple-800/40">
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t('offline.savedTemplates')} ({pendingTemplates.length})
            </h4>
            <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
              {isOnline 
                ? t('offline.templatesReadyOnline')
                : t('offline.templatesAvailableOnline')
              }
            </p>
          </div>
          
          <div className="divide-y divide-purple-200 dark:divide-purple-800/40">
            {pendingTemplates.map(template => (
              <div 
                key={template.id} 
                className="p-4 hover:bg-purple-100/50 dark:hover:bg-purple-800/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-purple-900 dark:text-purple-100 truncate">
                      {template.templateTitle}
                    </h5>
                    <p className="text-sm text-purple-700 dark:text-purple-300 truncate">
                      {template.passage} • {template.ageGroup}
                    </p>
                    <p className="text-xs text-purple-500 dark:text-purple-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {t('offline.saved')} {new Date(template.savedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isOnline && (
                      <Button
                        size="sm"
                        onClick={() => {
                          // Use the template data directly
                          const templateData = template.templateData
                          const newLesson = {
                            id: `lesson-${Date.now()}`,
                            title: templateData.title,
                            passage: templateData.passage,
                            description: templateData.description,
                            ageGroup: templateData.ageGroup,
                            duration: templateData.duration,
                            theme: templateData.theme,
                            format: 'Interactive',
                            gradient: pickGradient(Math.floor(Math.random() * GRADIENTS.length)),
                            createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                            favorite: false,
                            memoryVerse: templateData.memoryVerse,
                            objectives: templateData.objectives,
                            sections: templateData.sections,
                            materialsNeeded: templateData.materialsNeeded,
                            crossReferences: templateData.crossReferences,
                            teacherNotes: templateData.teacherNotes,
                            parentTakeHome: {
                              summary: templateData.description,
                              memoryVerse: `${templateData.memoryVerse.text} - ${templateData.memoryVerse.reference}`,
                              discussionStarters: templateData.objectives.map((obj: string) => `How can we ${obj.toLowerCase()}?`),
                              familyActivity: 'Review the lesson together and discuss how to apply it this week.',
                              weeklyChallenge: 'Practice the memory verse together each day.'
                            }
                          }
                          lessonStore.add(newLesson)
                          removePendingTemplate(template.id)
                          toast.success(t('offline.lessonCreated'))
                          navigate({ to: '/lesson/$lessonId', params: { lessonId: newLesson.id } })
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        disabled={generatingTemplate === template.id}
                        data-testid={`use-pending-${template.id}`}
                      >
                        {generatingTemplate === template.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        {t('common.use')}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        removePendingTemplate(template.id)
                        toast.success(t('offline.templateRemoved'))
                      }}
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 dark:hover:bg-purple-800/30"
                      data-testid={`remove-pending-${template.id}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Offline Mode Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800/40">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          {t('offline.aboutTitle')}
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1.5 list-disc list-inside">
          <li>{t('offline.aboutItem1')}</li>
          <li>{t('offline.aboutItem2')}</li>
          <li>{t('offline.aboutItem3')}</li>
          <li>{t('offline.aboutItem4')}</li>
          <li>{t('offline.aboutItem5')}</li>
        </ul>
      </div>
    </div>
  )
}
