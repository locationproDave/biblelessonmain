import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useSession } from '@/lib/auth-client'
import { useI18n } from '@/i18n'
import { Calendar, Settings, ChevronRight, Check, AlertCircle, Loader2, ExternalLink, Cloud } from 'lucide-react'
import { OfflineSettings } from '@/components/OfflineSettings'

const API_URL = import.meta.env.VITE_API_URL || ''

interface CalendarConfig {
  site_calendar_id?: string
  shared_calendar_id?: string
  user_calendar_id?: string
  effective_calendar_id?: string
  google_connected: boolean
  google_email?: string
}

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const { data: session, isPending } = useSession()
  const { t } = useI18n()
  const [calendarConfig, setCalendarConfig] = useState<CalendarConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedCalendar, setSelectedCalendar] = useState<'site' | 'shared' | 'personal'>('site')
  const [customCalendarId, setCustomCalendarId] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (session?.user) {
      fetchCalendarConfig()
    }
  }, [session])

  const fetchCalendarConfig = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_URL}/calendar/config`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setCalendarConfig(data)
        // Set selected based on current config
        if (data.user_calendar_id) {
          setSelectedCalendar('personal')
          setCustomCalendarId(data.user_calendar_id)
        } else if (data.shared_calendar_id === data.effective_calendar_id) {
          setSelectedCalendar('shared')
        } else {
          setSelectedCalendar('site')
        }
      }
    } catch (err) {
      console.error('Failed to fetch calendar config:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveCalendarPreference = async () => {
    if (!session?.user) return
    
    setSaving(true)
    setMessage(null)
    
    try {
      const token = localStorage.getItem('auth_token')
      let calendarId = ''
      
      if (selectedCalendar === 'personal' && customCalendarId) {
        calendarId = customCalendarId
      } else if (selectedCalendar === 'shared' && calendarConfig?.shared_calendar_id) {
        calendarId = calendarConfig.shared_calendar_id
      } else if (calendarConfig?.site_calendar_id) {
        calendarId = calendarConfig.site_calendar_id
      }
      
      const response = await fetch(`${API_URL}/calendar/config/user-calendar?calendar_id=${encodeURIComponent(calendarId)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        setMessage({ type: 'success', text: t('settings.calendar.savedSuccess') })
        fetchCalendarConfig()
      } else {
        setMessage({ type: 'error', text: t('settings.calendar.saveFailed') })
      }
    } catch (err) {
      setMessage({ type: 'error', text: t('settings.calendar.saveError') })
    } finally {
      setSaving(false)
    }
  }

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-stone-500 dark:text-stone-400">{t('settings.loadingSettings')}</span>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917] flex items-center justify-center">
        <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-8 max-w-md text-center shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-amber-600" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
            {t('settings.signInToAccess')}
          </h2>
          <p className="text-base text-stone-500 dark:text-stone-400 mb-6">
            {t('settings.signInDesc')}
          </p>
          <Link
            to="/signin"
            className="inline-block px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
          >
            {t('nav.signIn')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Text, serif' }}>
            {t('settings.title')}
          </h1>
          <p className="mt-1 text-base text-stone-500 dark:text-stone-400">
            {t('settings.subtitle')}
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Calendar Configuration */}
          <div className="bg-white dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
            <div className="p-5 border-b border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">{t('settings.calendar.title')}</h2>
                  <p className="text-sm text-stone-500 dark:text-stone-400">{t('settings.calendar.subtitle')}</p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Google Connection Status */}
              <div className={`flex items-center gap-3 p-4 rounded-xl ${calendarConfig?.google_connected ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40' : 'bg-stone-50 dark:bg-stone-700/30 border border-stone-200 dark:border-stone-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${calendarConfig?.google_connected ? 'bg-emerald-100 dark:bg-emerald-800/50' : 'bg-stone-200 dark:bg-stone-600'}`}>
                  {calendarConfig?.google_connected ? (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-stone-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${calendarConfig?.google_connected ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-600 dark:text-stone-300'}`}>
                    {calendarConfig?.google_connected ? t('settings.calendar.googleConnected') : t('settings.calendar.googleNotConnected')}
                  </p>
                  {calendarConfig?.google_email && (
                    <p className="text-xs text-stone-500 dark:text-stone-400">{calendarConfig.google_email}</p>
                  )}
                </div>
                {!calendarConfig?.google_connected && (
                  <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5">
                    {t('common.connect')} <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Calendar Options */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">{t('settings.calendar.syncTo')}</p>
                
                {/* Site Calendar */}
                <button
                  onClick={() => setSelectedCalendar('site')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${selectedCalendar === 'site' ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20' : 'border-stone-200 dark:border-stone-700 hover:border-amber-400'}`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedCalendar === 'site' ? 'border-amber-500 bg-amber-500' : 'border-stone-300 dark:border-stone-600'}`}>
                    {selectedCalendar === 'site' && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-semibold text-sm ${selectedCalendar === 'site' ? 'text-amber-700 dark:text-amber-400' : 'text-stone-900 dark:text-stone-100'}`}>
                      {t('settings.calendar.siteCalendar')}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{t('settings.calendar.siteCalendarDesc')}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">{t('common.recommended')}</span>
                </button>

                {/* Shared Calendar */}
                <button
                  onClick={() => setSelectedCalendar('shared')}
                  disabled={!calendarConfig?.shared_calendar_id}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${selectedCalendar === 'shared' ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20' : 'border-stone-200 dark:border-stone-700 hover:border-amber-400'} ${!calendarConfig?.shared_calendar_id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedCalendar === 'shared' ? 'border-amber-500 bg-amber-500' : 'border-stone-300 dark:border-stone-600'}`}>
                    {selectedCalendar === 'shared' && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-semibold text-sm ${selectedCalendar === 'shared' ? 'text-amber-700 dark:text-amber-400' : 'text-stone-900 dark:text-stone-100'}`}>
                      {t('settings.calendar.sharedCalendar')}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {calendarConfig?.shared_calendar_id ? t('settings.calendar.sharedCalendarDesc') : t('settings.calendar.noSharedCalendar')}
                    </p>
                  </div>
                </button>

                {/* Personal Calendar */}
                <div
                  onClick={() => setSelectedCalendar('personal')}
                  className={`w-full p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedCalendar === 'personal' ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20' : 'border-stone-200 dark:border-stone-700 hover:border-amber-400'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedCalendar === 'personal' ? 'border-amber-500 bg-amber-500' : 'border-stone-300 dark:border-stone-600'}`}>
                      {selectedCalendar === 'personal' && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`font-semibold text-sm ${selectedCalendar === 'personal' ? 'text-amber-700 dark:text-amber-400' : 'text-stone-900 dark:text-stone-100'}`}>
                        {t('settings.calendar.personalCalendar')}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">{t('settings.calendar.personalCalendarDesc')}</p>
                    </div>
                  </div>
                  {selectedCalendar === 'personal' && (
                    <div className="mt-3 pl-9">
                      <input
                        type="text"
                        value={customCalendarId}
                        onChange={(e) => setCustomCalendarId(e.target.value)}
                        placeholder={t('settings.calendar.enterCalendarId')}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
                        {t('settings.calendar.findCalendarId')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Message */}
              {message && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                  {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span className="text-sm font-medium">{message.text}</span>
                </div>
              )}

              {/* Save Button */}
              <div className="pt-2">
                <button
                  onClick={saveCalendarPreference}
                  disabled={saving}
                  className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('common.saving')}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {t('settings.calendar.savePreference')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
            <div className="p-5 border-b border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">{t('settings.account.title')}</h2>
                  <p className="text-sm text-stone-500 dark:text-stone-400">{t('settings.account.subtitle')}</p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">{t('settings.account.email')}</label>
                  <p className="text-stone-900 dark:text-stone-100">{session.user.email}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">{t('settings.account.name')}</label>
                  <p className="text-stone-900 dark:text-stone-100">{session.user.name || t('common.notSet')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Offline Mode Settings */}
          <div className="bg-white dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
            <div className="p-5 border-b border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Cloud className="w-5 h-5 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">{t('settings.offline.title')}</h2>
                  <p className="text-sm text-stone-500 dark:text-stone-400">{t('settings.offline.subtitle')}</p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <OfflineSettings />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
