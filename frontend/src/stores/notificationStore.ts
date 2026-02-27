import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NotificationType = 'info' | 'success' | 'warning' | 'lesson_shared' | 'team_invite' | 'lesson_edited' | 'reminder'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
  lessonId?: string
  actionUrl?: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          read: false,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep max 50
          unreadCount: state.unreadCount + 1,
        }))
      },

      markAsRead: (id) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id)
          if (!notification || notification.read) return state
          return {
            notifications: state.notifications.map(n =>
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          }
        })
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0,
        }))
      },

      removeNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id)
          return {
            notifications: state.notifications.filter(n => n.id !== id),
            unreadCount: notification && !notification.read 
              ? Math.max(0, state.unreadCount - 1) 
              : state.unreadCount,
          }
        })
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 })
      },
    }),
    {
      name: 'blp-notifications',
    }
  )
)

// Helper function to create common notifications
export const createNotifications = {
  lessonShared: (lessonTitle: string, sharedBy: string, lessonId?: string) => ({
    type: 'lesson_shared' as NotificationType,
    title: 'Lesson Shared With You',
    message: `${sharedBy} shared "${lessonTitle}" with you`,
    lessonId,
    actionUrl: lessonId ? `/lesson/${lessonId}` : undefined,
  }),

  teamInvite: (teamName: string, invitedBy: string) => ({
    type: 'team_invite' as NotificationType,
    title: 'Team Invitation',
    message: `${invitedBy} invited you to join "${teamName}"`,
    actionUrl: '/team',
  }),

  lessonEdited: (lessonTitle: string, editedBy: string, lessonId?: string) => ({
    type: 'lesson_edited' as NotificationType,
    title: 'Lesson Updated',
    message: `${editedBy} made changes to "${lessonTitle}"`,
    lessonId,
    actionUrl: lessonId ? `/lesson/${lessonId}` : undefined,
  }),

  reminder: (lessonTitle: string, scheduledTime: string, lessonId?: string) => ({
    type: 'reminder' as NotificationType,
    title: 'Upcoming Lesson',
    message: `"${lessonTitle}" is scheduled for ${scheduledTime}`,
    lessonId,
    actionUrl: lessonId ? `/lesson/${lessonId}` : undefined,
  }),

  success: (title: string, message: string) => ({
    type: 'success' as NotificationType,
    title,
    message,
  }),

  info: (title: string, message: string) => ({
    type: 'info' as NotificationType,
    title,
    message,
  }),

  warning: (title: string, message: string) => ({
    type: 'warning' as NotificationType,
    title,
    message,
  }),
}
