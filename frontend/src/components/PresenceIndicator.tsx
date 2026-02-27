import { useState, useEffect, useRef, useCallback } from 'react'
import { create } from 'zustand'
import { Users, Eye, Edit3, Lock, Circle } from 'lucide-react'
import { LessonCollaborationClient, type CollaborationMessage, type CollaborationUser } from '@/lib/api'

// Types for presence
interface UserPresence {
  id: string
  name: string
  email?: string
  avatar?: string
  color: string
  mode: 'viewing' | 'editing'
  section?: string
  lastActive: number
}

interface PresenceState {
  viewers: UserPresence[]
  currentUser: UserPresence | null
  lockedSections: Record<string, UserPresence>
  setCurrentUser: (user: UserPresence | null) => void
  addViewer: (viewer: UserPresence) => void
  removeViewer: (id: string) => void
  updateViewer: (id: string, updates: Partial<UserPresence>) => void
  lockSection: (sectionId: string, user: UserPresence) => void
  unlockSection: (sectionId: string) => void
  clearAll: () => void
  setViewers: (viewers: UserPresence[]) => void
}

// Sunday Morning color palette - warm, muted tones
const userColors = [
  '#d97706', '#ea580c', '#ca8a04', '#65a30d', '#059669', 
  '#0891b2', '#0284c7', '#7c3aed', '#c026d3', '#e11d48'
]

export const getColorForUser = (userId: string): string => {
  const hash = userId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  return userColors[Math.abs(hash) % userColors.length]
}

// Zustand store for presence state
export const usePresenceStore = create<PresenceState>((set) => ({
  viewers: [],
  currentUser: null,
  lockedSections: {},

  setCurrentUser: (user) => set({ currentUser: user }),

  addViewer: (viewer) => set((state) => ({
    viewers: [...state.viewers.filter(v => v.id !== viewer.id), viewer]
  })),

  removeViewer: (id) => set((state) => ({
    viewers: state.viewers.filter(v => v.id !== id),
    lockedSections: Object.fromEntries(
      Object.entries(state.lockedSections).filter(([_, user]) => user.id !== id)
    )
  })),

  updateViewer: (id, updates) => set((state) => ({
    viewers: state.viewers.map(v => v.id === id ? { ...v, ...updates } : v)
  })),

  lockSection: (sectionId, user) => set((state) => ({
    lockedSections: { ...state.lockedSections, [sectionId]: user }
  })),

  unlockSection: (sectionId) => set((state) => {
    const { [sectionId]: _, ...rest } = state.lockedSections
    return { lockedSections: rest }
  }),

  clearAll: () => set({ viewers: [], lockedSections: {} }),
  
  setViewers: (viewers) => set({ viewers }),
}))

// Component to show who's viewing/editing - Sunday Morning Style with Real WebSocket
export function PresenceIndicator({ lessonId }: { lessonId: string }) {
  const { viewers, setViewers, addViewer, removeViewer, lockSection, unlockSection, clearAll } = usePresenceStore()
  const [showDetails, setShowDetails] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const clientRef = useRef<LessonCollaborationClient | null>(null)
  
  // Get auth token from localStorage
  const token = localStorage.getItem('auth_token')
  const currentUserStr = localStorage.getItem('auth_user')
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null

  useEffect(() => {
    if (!token || !lessonId) return
    
    const handleMessage = (message: CollaborationMessage) => {
      switch (message.type) {
        case 'presence':
          if (message.activeUsers) {
            const users: UserPresence[] = message.activeUsers
              .filter(u => u.userId !== currentUser?.id)
              .map(u => ({
                id: u.userId,
                name: u.userName,
                color: getColorForUser(u.userId),
                mode: 'viewing' as const,
                lastActive: Date.now()
              }))
            setViewers(users)
          }
          break
          
        case 'active_users':
          if (message.users) {
            const users: UserPresence[] = message.users
              .filter(u => u.userId !== currentUser?.id)
              .map(u => ({
                id: u.userId,
                name: u.userName,
                color: getColorForUser(u.userId),
                mode: 'viewing' as const,
                lastActive: Date.now()
              }))
            setViewers(users)
          }
          break
          
        case 'section_focus':
          if (message.userId && message.userName && message.sectionIndex !== undefined) {
            const user: UserPresence = {
              id: message.userId,
              name: message.userName,
              color: getColorForUser(message.userId),
              mode: 'editing',
              section: `Section ${message.sectionIndex + 1}`,
              lastActive: Date.now()
            }
            lockSection(String(message.sectionIndex), user)
            addViewer(user)
          }
          break
          
        case 'typing':
          if (message.userId && message.isTyping) {
            // Update user to editing mode when typing
            const store = usePresenceStore.getState()
            const existingUser = store.viewers.find(v => v.id === message.userId)
            if (existingUser) {
              store.updateViewer(message.userId, { 
                mode: 'editing',
                section: message.sectionIndex !== undefined ? `Section ${message.sectionIndex + 1}` : undefined
              })
            }
          } else if (message.userId && !message.isTyping) {
            // Update user back to viewing mode
            const store = usePresenceStore.getState()
            store.updateViewer(message.userId, { mode: 'viewing', section: undefined })
            if (message.sectionIndex !== undefined) {
              unlockSection(String(message.sectionIndex))
            }
          }
          break
      }
    }
    
    const client = new LessonCollaborationClient(
      lessonId,
      token,
      handleMessage,
      () => {
        setIsConnected(true)
        clientRef.current?.getActiveUsers()
      },
      () => setIsConnected(false)
    )
    
    clientRef.current = client
    client.connect()
    
    return () => {
      client.disconnect()
      clientRef.current = null
      clearAll()
    }
  }, [lessonId, token, currentUser?.id])

  // If not connected or no other users, show minimal indicator
  if (!isConnected) {
    return null
  }
  
  if (viewers.length === 0) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-emerald-600 dark:text-emerald-400">
        <Circle className="w-2 h-2 fill-current animate-pulse" />
        <span>Live</span>
      </div>
    )
  }

  const editingUsers = viewers.filter(v => v.mode === 'editing')
  const viewingUsers = viewers.filter(v => v.mode === 'viewing')

  return (
    <div className="relative">
      {/* Presence Avatars - Sunday Morning Style */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-600 hover:bg-amber-50/50 dark:hover:bg-stone-700 transition-all"
        data-testid="presence-indicator"
      >
        {/* Live indicator */}
        <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
          <Circle className="w-2 h-2 fill-current animate-pulse" />
        </div>
        
        <div className="flex -space-x-2">
          {viewers.slice(0, 3).map((user, i) => (
            <div
              key={user.id}
              className="w-7 h-7 rounded-full border-2 border-white dark:border-stone-800 flex items-center justify-center text-white text-xs font-bold shadow-sm"
              style={{ backgroundColor: user.color, zIndex: 3 - i }}
              title={user.name}
            >
              {user.name.charAt(0)}
            </div>
          ))}
          {viewers.length > 3 && (
            <div className="w-7 h-7 rounded-full border-2 border-white dark:border-stone-800 bg-stone-400 dark:bg-stone-600 flex items-center justify-center text-white text-xs font-bold">
              +{viewers.length - 3}
            </div>
          )}
        </div>
        <span className="text-sm font-medium text-stone-600 dark:text-stone-300">
          {viewers.length} {viewers.length === 1 ? 'person' : 'people'}
        </span>
        <Users className="w-4 h-4 text-stone-400" />
      </button>

      {/* Details Dropdown - Sunday Morning Aesthetic */}
      {showDetails && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xl shadow-stone-900/10 dark:shadow-black/30 z-50 overflow-hidden">
          {/* Header - Warm Amber Style */}
          <div className="px-4 py-3 bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/30 dark:to-stone-900 border-b border-stone-200 dark:border-stone-700">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="font-bold text-stone-800 dark:text-stone-100 text-sm">
                  Real-Time Collaboration
                </h4>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Circle className="w-1.5 h-1.5 fill-current" /> Connected
                </p>
              </div>
            </div>
          </div>

          {/* Editing Users */}
          {editingUsers.length > 0 && (
            <div className="p-3 border-b border-stone-100 dark:border-stone-700">
              <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Edit3 className="w-3 h-3 text-amber-500" />
                Currently Editing
              </p>
              <div className="space-y-2">
                {editingUsers.map(user => (
                  <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg bg-amber-50/50 dark:bg-amber-900/20">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-800 dark:text-stone-100 text-sm truncate">
                        {user.name}
                      </p>
                      {user.section && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          {user.section}
                        </p>
                      )}
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Viewing Users */}
          {viewingUsers.length > 0 && (
            <div className="p-3">
              <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Eye className="w-3 h-3" />
                Viewing
              </p>
              <div className="space-y-2">
                {viewingUsers.map(user => (
                  <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-800 dark:text-stone-100 text-sm truncate">
                        {user.name}
                      </p>
                      {user.email && (
                        <p className="text-xs text-stone-400 truncate">{user.email}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Component to show if a section is locked - Sunday Morning Style
export function SectionLockIndicator({ sectionId }: { sectionId: string }) {
  const { lockedSections, currentUser } = usePresenceStore()
  const lockedBy = lockedSections[sectionId]

  if (!lockedBy || lockedBy.id === currentUser?.id) return null

  return (
    <div className="absolute inset-0 bg-stone-900/5 dark:bg-stone-900/20 backdrop-blur-[1px] rounded-xl flex items-center justify-center z-10">
      <div className="bg-white dark:bg-stone-800 px-4 py-3 rounded-xl shadow-lg border border-amber-200 dark:border-amber-700/50 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
          style={{ backgroundColor: lockedBy.color }}
        >
          {lockedBy.name.charAt(0)}
        </div>
        <div>
          <p className="font-medium text-stone-800 dark:text-stone-100 text-sm">
            {lockedBy.name} is editing
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            This section is locked
          </p>
        </div>
        <Lock className="w-4 h-4 text-amber-500" />
      </div>
    </div>
  )
}

// Hook for collaboration actions in lesson editor
export function useCollaborationActions(lessonId: string) {
  const clientRef = useRef<LessonCollaborationClient | null>(null)
  const token = localStorage.getItem('auth_token')
  const currentUserStr = localStorage.getItem('auth_user')
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null
  
  const sendTyping = useCallback((sectionIndex: number, isTyping: boolean) => {
    clientRef.current?.sendTyping(sectionIndex, isTyping)
  }, [])
  
  const sendEdit = useCallback((sectionIndex: number, field: string, value: string, persist = false) => {
    clientRef.current?.sendEdit(sectionIndex, field, value, persist)
  }, [])
  
  const sendSectionFocus = useCallback((sectionIndex: number) => {
    clientRef.current?.sendSectionFocus(sectionIndex)
  }, [])
  
  useEffect(() => {
    if (!token || !lessonId) return
    
    const client = new LessonCollaborationClient(
      lessonId,
      token,
      () => {}, // Messages handled by PresenceIndicator
      () => {},
      () => {}
    )
    
    clientRef.current = client
    client.connect()
    
    return () => {
      client.disconnect()
      clientRef.current = null
    }
  }, [lessonId, token])
  
  return {
    sendTyping,
    sendEdit,
    sendSectionFocus,
  }
}
