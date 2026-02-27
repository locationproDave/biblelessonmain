import { useState, useEffect, useCallback, useRef } from 'react'
import { LessonCollaborationClient, type CollaborationMessage, type CollaborationUser } from '@/lib/api'
import { Users, Circle } from 'lucide-react'

interface CollaborationIndicatorProps {
  lessonId: string
  token: string
  currentUserId: string
}

// Assign consistent colors to users
const USER_COLORS = [
  '#F59E0B', // amber
  '#10B981', // emerald
  '#6366F1', // indigo
  '#EC4899', // pink
  '#8B5CF6', // violet
  '#14B8A6', // teal
  '#F97316', // orange
  '#3B82F6', // blue
]

function getUserColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length]
}

export function CollaborationIndicator({ lessonId, token, currentUserId }: CollaborationIndicatorProps) {
  const [activeUsers, setActiveUsers] = useState<CollaborationUser[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map())
  const clientRef = useRef<LessonCollaborationClient | null>(null)
  
  useEffect(() => {
    if (!token || !lessonId) return
    
    const handleMessage = (message: CollaborationMessage) => {
      switch (message.type) {
        case 'presence':
          if (message.activeUsers) {
            setActiveUsers(message.activeUsers.filter(u => u.userId !== currentUserId))
          }
          break
        case 'active_users':
          if (message.users) {
            setActiveUsers(message.users.filter(u => u.userId !== currentUserId))
          }
          break
        case 'typing':
          if (message.userId && message.userId !== currentUserId) {
            setTypingUsers(prev => {
              const next = new Map(prev)
              if (message.isTyping) {
                next.set(message.userId!, message.userName || 'Someone')
              } else {
                next.delete(message.userId!)
              }
              return next
            })
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
    }
  }, [lessonId, token, currentUserId])
  
  // Don't render if not connected or no other users
  if (!isConnected) {
    return null
  }
  
  return (
    <div className="flex items-center gap-2">
      {/* Connection Status */}
      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
        <Circle className="w-2 h-2 fill-current animate-pulse" />
        <span>Live</span>
      </div>
      
      {/* Active Users Avatars */}
      {activeUsers.length > 0 && (
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {activeUsers.slice(0, 3).map((user) => (
              <div
                key={user.userId}
                className="w-7 h-7 rounded-full border-2 border-white dark:border-stone-800 flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: getUserColor(user.userId) }}
                title={user.userName}
              >
                {user.userName.charAt(0).toUpperCase()}
              </div>
            ))}
            {activeUsers.length > 3 && (
              <div className="w-7 h-7 rounded-full border-2 border-white dark:border-stone-800 bg-stone-500 flex items-center justify-center text-xs font-bold text-white">
                +{activeUsers.length - 3}
              </div>
            )}
          </div>
          <span className="ml-2 text-xs text-stone-500 dark:text-stone-400">
            {activeUsers.length === 1 
              ? `${activeUsers[0].userName} is viewing` 
              : `${activeUsers.length} others viewing`}
          </span>
        </div>
      )}
      
      {/* Typing Indicator */}
      {typingUsers.size > 0 && (
        <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 animate-pulse">
          <span>{Array.from(typingUsers.values()).slice(0, 2).join(', ')} typing...</span>
        </div>
      )}
    </div>
  )
}

// Hook for using collaboration in lesson editing
export function useCollaboration(lessonId: string, token: string, currentUserId: string) {
  const [activeUsers, setActiveUsers] = useState<CollaborationUser[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [focusedSections, setFocusedSections] = useState<Map<string, number>>(new Map())
  const clientRef = useRef<LessonCollaborationClient | null>(null)
  
  useEffect(() => {
    if (!token || !lessonId) return
    
    const handleMessage = (message: CollaborationMessage) => {
      switch (message.type) {
        case 'presence':
        case 'active_users':
          const users = message.activeUsers || message.users || []
          setActiveUsers(users.filter(u => u.userId !== currentUserId))
          break
        case 'section_focus':
          if (message.userId && message.sectionIndex !== undefined) {
            setFocusedSections(prev => {
              const next = new Map(prev)
              next.set(message.userId!, message.sectionIndex!)
              return next
            })
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
    }
  }, [lessonId, token, currentUserId])
  
  const sendTyping = useCallback((sectionIndex: number, isTyping: boolean) => {
    clientRef.current?.sendTyping(sectionIndex, isTyping)
  }, [])
  
  const sendEdit = useCallback((sectionIndex: number, field: string, value: string, persist = false) => {
    clientRef.current?.sendEdit(sectionIndex, field, value, persist)
  }, [])
  
  const sendSectionFocus = useCallback((sectionIndex: number) => {
    clientRef.current?.sendSectionFocus(sectionIndex)
  }, [])
  
  return {
    activeUsers,
    isConnected,
    focusedSections,
    sendTyping,
    sendEdit,
    sendSectionFocus,
    getUserColor,
  }
}
