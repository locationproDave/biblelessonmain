/**
 * usePendingTemplates Hook
 * Manages templates saved for offline generation
 */

import { useState, useEffect, useCallback } from 'react'
import { useSession } from './auth-client'
import {
  savePendingTemplate,
  getPendingTemplates,
  removePendingTemplate,
  getPendingTemplatesCount,
} from './offline-db'
import type { PendingTemplate } from './offline-db'
import { isOnline } from './offline-sync'

export function usePendingTemplates() {
  const { data: session } = useSession()
  const userId = session?.user?.id
  
  const [templates, setTemplates] = useState<PendingTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Load pending templates
  const loadTemplates = useCallback(async () => {
    if (!userId) {
      setTemplates([])
      setIsLoading(false)
      return
    }
    
    try {
      setIsLoading(true)
      const loaded = await getPendingTemplates(userId)
      setTemplates(loaded)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load pending templates')
    } finally {
      setIsLoading(false)
    }
  }, [userId])
  
  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])
  
  // Save a template for later
  const saveForLater = useCallback(async (templateData: {
    templateId: string
    templateTitle: string
    passage: string
    ageGroup: string
    duration: string
    theme: string
    description: string
    templateData: any
  }): Promise<PendingTemplate | null> => {
    if (!userId) {
      setError('Must be logged in to save templates')
      return null
    }
    
    try {
      const saved = await savePendingTemplate({
        userId,
        ...templateData,
      })
      
      // Update local state
      setTemplates(prev => [saved, ...prev])
      
      return saved
    } catch (err: any) {
      setError(err.message || 'Failed to save template')
      return null
    }
  }, [userId])
  
  // Remove a pending template
  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      await removePendingTemplate(id)
      setTemplates(prev => prev.filter(t => t.id !== id))
      return true
    } catch (err: any) {
      setError(err.message || 'Failed to remove template')
      return false
    }
  }, [])
  
  // Get count
  const getCount = useCallback(async (): Promise<number> => {
    if (!userId) return 0
    return await getPendingTemplatesCount(userId)
  }, [userId])
  
  return {
    templates,
    isLoading,
    error,
    hasPendingTemplates: templates.length > 0,
    count: templates.length,
    
    // Actions
    saveForLater,
    remove,
    refresh: loadTemplates,
    getCount,
    
    // Status
    isOnline: isOnline(),
  }
}

// Re-export the type for convenience
export type { PendingTemplate } from './offline-db'
