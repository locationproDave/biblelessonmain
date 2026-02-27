import { useState, useRef, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Bell, Check, CheckCheck, Trash2, X, Share2, Users, Edit3, Clock, Info, AlertTriangle, Sparkles } from 'lucide-react'
import { useNotificationStore, type Notification, type NotificationType } from '../stores/notificationStore'
import { formatDistanceToNow } from 'date-fns'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  lesson_shared: <Share2 className="w-4 h-4" />,
  team_invite: <Users className="w-4 h-4" />,
  lesson_edited: <Edit3 className="w-4 h-4" />,
  reminder: <Clock className="w-4 h-4" />,
  success: <Sparkles className="w-4 h-4" />,
  info: <Info className="w-4 h-4" />,
  warning: <AlertTriangle className="w-4 h-4" />,
}

// Sunday Morning color palette - warm amber/stone tones
const notificationColors: Record<NotificationType, { bg: string; icon: string; border: string }> = {
  lesson_shared: { 
    bg: 'bg-amber-50 dark:bg-amber-900/20', 
    icon: 'bg-amber-100 dark:bg-amber-800/50 text-amber-600 dark:text-amber-400',
    border: 'border-amber-200/60 dark:border-amber-700/40'
  },
  team_invite: { 
    bg: 'bg-stone-50 dark:bg-stone-800/50', 
    icon: 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300',
    border: 'border-stone-200 dark:border-stone-700'
  },
  lesson_edited: { 
    bg: 'bg-orange-50 dark:bg-orange-900/20', 
    icon: 'bg-orange-100 dark:bg-orange-800/50 text-orange-600 dark:text-orange-400',
    border: 'border-orange-200/60 dark:border-orange-700/40'
  },
  reminder: { 
    bg: 'bg-emerald-50 dark:bg-emerald-900/20', 
    icon: 'bg-emerald-100 dark:bg-emerald-800/50 text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200/60 dark:border-emerald-700/40'
  },
  success: { 
    bg: 'bg-emerald-50 dark:bg-emerald-900/20', 
    icon: 'bg-emerald-100 dark:bg-emerald-800/50 text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200/60 dark:border-emerald-700/40'
  },
  info: { 
    bg: 'bg-amber-50/60 dark:bg-amber-900/15', 
    icon: 'bg-amber-100 dark:bg-amber-800/40 text-amber-600 dark:text-amber-400',
    border: 'border-amber-200/50 dark:border-amber-700/30'
  },
  warning: { 
    bg: 'bg-orange-50 dark:bg-orange-900/20', 
    icon: 'bg-orange-100 dark:bg-orange-800/50 text-orange-600 dark:text-orange-400',
    border: 'border-orange-200/60 dark:border-orange-700/40'
  },
}

function NotificationItem({ notification, onClose }: { notification: Notification; onClose: () => void }) {
  const { markAsRead, removeNotification } = useNotificationStore()
  const colors = notificationColors[notification.type]

  const handleClick = () => {
    markAsRead(notification.id)
    if (notification.actionUrl) {
      onClose()
    }
  }

  const content = (
    <div
      className={`relative p-4 rounded-xl border transition-all duration-200 ${colors.bg} ${colors.border} ${
        !notification.read ? 'ring-1 ring-amber-400/30' : ''
      } hover:shadow-sm`}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-amber-500" />
      )}

      <div className="flex gap-3">
        {/* Icon */}
        <div className={`w-9 h-9 rounded-xl ${colors.icon} flex items-center justify-center flex-shrink-0`}>
          {notificationIcons[notification.type]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-6">
          <p className="font-semibold text-stone-800 dark:text-stone-100 text-sm">
            {notification.title}
          </p>
          <p className="text-stone-600 dark:text-stone-400 text-sm mt-0.5 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-stone-400 dark:text-stone-500 text-xs mt-2">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>

        {/* Actions */}
        <div className="absolute top-2 right-8 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!notification.read && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); markAsRead(notification.id) }}
              className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
              title="Mark as read"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeNotification(notification.id) }}
            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  if (notification.actionUrl) {
    return (
      <Link to={notification.actionUrl as any} onClick={handleClick} className="block group">
        {content}
      </Link>
    )
  }

  return (
    <div onClick={handleClick} className="cursor-pointer group">
      {content}
    </div>
  )
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, markAllAsRead, clearAll } = useNotificationStore()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Button - Sunday Morning Style with Tooltip */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative p-2.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            data-testid="notification-bell"
          >
            <Bell className="w-5 h-5 text-stone-600 dark:text-stone-400" strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center shadow-md shadow-amber-600/30">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-3 py-2 text-sm font-medium rounded-lg shadow-lg">
          {unreadCount > 0 ? `${unreadCount} New Notification${unreadCount > 1 ? 's' : ''}` : 'Notifications'}
        </TooltipContent>
      </Tooltip>

      {/* Dropdown - Sunday Morning Aesthetic */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 max-h-[70vh] overflow-hidden rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-xl shadow-stone-900/10 dark:shadow-black/30 z-50">
          {/* Header - Warm Amber Style */}
          <div className="sticky top-0 flex items-center justify-between px-4 py-3 bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/30 dark:to-stone-900 border-b border-stone-200 dark:border-stone-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-bold text-stone-800 dark:text-stone-100 text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">{unreadCount} unread</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 rounded-lg hover:bg-stone-200/70 dark:hover:bg-stone-700 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-stone-200/70 dark:hover:bg-stone-700 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[calc(70vh-60px)] p-3 space-y-2">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                  <Bell className="w-7 h-7 text-stone-300 dark:text-stone-600" strokeWidth={1.5} />
                </div>
                <p className="text-stone-600 dark:text-stone-400 font-medium text-sm">No notifications yet</p>
                <p className="text-stone-400 dark:text-stone-500 text-xs mt-1">
                  We'll notify you when something happens
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification} 
                  onClose={() => setIsOpen(false)}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="sticky bottom-0 px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-t border-stone-200 dark:border-stone-700">
              <button
                onClick={clearAll}
                className="w-full py-2 rounded-xl text-sm font-medium text-stone-500 dark:text-stone-400 hover:bg-stone-200/70 dark:hover:bg-stone-700 transition-colors"
              >
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
