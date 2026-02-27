import { createFileRoute, Link } from '@tanstack/react-router'
import { useSession } from '@/lib/auth-client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api'
import { useState } from 'react'
import { User, Mail, Calendar, BookOpen, CheckCircle, Building2, MapPin, Briefcase, Edit2, Save, X, ChevronRight, BarChart3, Settings, Crown, Sparkles, Clock, Target, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { useI18n } from '@/i18n'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})

interface UserProfile {
  id: string
  email: string
  name: string
  avatarUrl?: string
  bio?: string
  churchName?: string
  role?: string
  location?: string
  createdAt: string
  preferences?: {
    bibleVersion: string
    onboardingCompleted: boolean
    ministryRole?: string
    preferredAgeGroup?: string
  }
  subscription?: {
    planId: string
    status: string
    lessonsLimit: number
    currentPeriodEnd: string
  }
  stats: {
    totalLessons: number
    completedLessons: number
    memberSince: string
  }
}

function ProfilePage() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    churchName: '',
    role: '',
    location: '',
  })
  const { t } = useI18n()

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['user-profile'],
    queryFn: () => apiRequest('/user/profile'),
    enabled: !!session,
  })

  const { data: activity } = useQuery({
    queryKey: ['user-activity'],
    queryFn: () => apiRequest('/user/activity?limit=10'),
    enabled: !!session,
  })

  const updateMutation = useMutation({
    mutationFn: (data: typeof editForm) => apiRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      setIsEditing(false)
      toast.success(t('profile.updateSuccess'))
    },
    onError: () => {
      toast.error(t('profile.updateError'))
    },
  })

  const startEditing = () => {
    if (profile) {
      setEditForm({
        name: profile.name || '',
        bio: profile.bio || '',
        churchName: profile.churchName || '',
        role: profile.role || '',
        location: profile.location || '',
      })
      setIsEditing(true)
    }
  }

  const handleSave = () => {
    updateMutation.mutate(editForm)
  }

  // Logged out view
  if (!session) {
    return (
      <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917] py-16 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
            <User className="w-8 h-8 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mb-3" style={{ fontFamily: 'Crimson Text, serif' }}>
            {t('profile.title')}
          </h1>
          <p className="text-stone-500 dark:text-stone-400 mb-6">
            {t('profile.signInToAccess')}
          </p>
          <Link
            to="/signin"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold transition-colors"
            data-testid="profile-signin-btn"
          >
            {t('profile.signInContinue')}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917] py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-40 bg-white dark:bg-stone-800 rounded-xl"></div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 h-64 bg-white dark:bg-stone-800 rounded-xl"></div>
              <div className="h-64 bg-white dark:bg-stone-800 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const completionRate = profile?.stats?.totalLessons 
    ? Math.round((profile.stats.completedLessons / profile.stats.totalLessons) * 100) 
    : 0

  return (
    <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917] py-8 sm:py-12 px-4">
      <div className="max-w-5xl mx-auto" data-testid="profile-page">
        
        {/* Header Section */}
        <div className="bg-white dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center border border-amber-200 dark:border-amber-800">
                <span className="text-3xl font-bold text-amber-600 dark:text-amber-500">
                  {profile?.name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="text-xl font-bold bg-transparent border-b-2 border-amber-500 focus:outline-none text-stone-900 dark:text-stone-100 w-full mb-2"
                      placeholder="Your name"
                    />
                  ) : (
                    <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-1" style={{ fontFamily: 'Crimson Text, serif' }}>
                      {profile?.name || 'User'}
                    </h1>
                  )}
                  <p className="text-sm text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                    <Mail className="w-4 h-4" strokeWidth={1.5} />
                    {profile?.email}
                  </p>
                  <p className="text-sm text-stone-500 dark:text-stone-400 flex items-center gap-1.5 mt-1">
                    <Calendar className="w-4 h-4" strokeWidth={1.5} />
                    {t('profile.joined')} {new Date(profile?.stats?.memberSince || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>

                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="p-2 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
                        data-testid="save-profile-btn"
                      >
                        <Save className="w-4 h-4" />
                        {t('profile.save')}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={startEditing}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-medium hover:border-amber-400 dark:hover:border-amber-600 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                      data-testid="edit-profile-btn"
                    >
                      <Edit2 className="w-4 h-4" />
                      {t('profile.editProfile')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{profile?.stats?.totalLessons || 0}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">{t('profile.totalLessons')}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-500" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{profile?.stats?.completedLessons || 0}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">{t('profile.completed')}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-500" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{completionRate}%</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">{t('profile.completion')}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                <Crown className="w-5 h-5 text-violet-600 dark:text-violet-500" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 capitalize">
                  {profile?.subscription?.planId?.replace('_', ' ') || 'Free'}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">{t('profile.plan')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - About & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-white dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 p-6">
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                {t('profile.about')}
              </h2>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-1">{t('profile.bio')}</label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                      placeholder={t('profile.bioPlaceholder')}
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-1">{t('profile.churchOrg')}</label>
                      <input
                        type="text"
                        value={editForm.churchName}
                        onChange={(e) => setEditForm({ ...editForm, churchName: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                        placeholder={t('profile.churchPlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-1">{t('profile.role')}</label>
                      <input
                        type="text"
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                        placeholder={t('profile.rolePlaceholder')}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-1">{t('profile.location')}</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                      placeholder={t('profile.locationPlaceholder')}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  {profile?.bio ? (
                    <p className="text-sm text-stone-600 dark:text-stone-300 mb-4">{profile.bio}</p>
                  ) : (
                    <p className="text-sm text-stone-400 dark:text-stone-500 italic mb-4">{t('profile.noBio')}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-3">
                    {profile?.churchName && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 text-sm text-stone-600 dark:text-stone-400">
                        <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
                        {profile.churchName}
                      </div>
                    )}
                    {profile?.role && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 text-sm text-stone-600 dark:text-stone-400">
                        <Briefcase className="w-4 h-4 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
                        {profile.role}
                      </div>
                    )}
                    {profile?.location && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 text-sm text-stone-600 dark:text-stone-400">
                        <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
                        {profile.location}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 p-6">
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                {t('profile.recentActivity')}
              </h2>
              
              {activity && activity.length > 0 ? (
                <div className="space-y-2">
                  {activity.slice(0, 5).map((item: any, idx: number) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-lg border border-stone-100 dark:border-stone-700 hover:border-amber-200 dark:hover:border-amber-800 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                        {item.type === 'lesson_created' ? (
                          <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
                        ) : item.type === 'lesson_completed' ? (
                          <CheckCircle className="w-4 h-4 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
                        ) : (
                          <BarChart3 className="w-4 h-4 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">{item.title}</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          {new Date(item.timestamp).toLocaleDateString('en-US')}
                        </p>
                      </div>
                      {item.lessonId && (
                        <Link
                          to="/lesson/$lessonId"
                          params={{ lessonId: item.lessonId }}
                          className="text-amber-600 dark:text-amber-500 hover:underline text-sm font-medium"
                        >
                          {'View'}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-stone-50 dark:bg-stone-800 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-stone-400" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm text-stone-500 dark:text-stone-400">{t('profile.noRecentActivity')}</p>
                  <Link
                    to="/generate"
                    className="inline-flex items-center gap-1 mt-2 text-sm text-amber-600 dark:text-amber-500 hover:underline"
                  >
                    {t('profile.createFirstLesson')}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Subscription & Quick Links */}
          <div className="space-y-6">
            {/* Subscription Card */}
            <div className="bg-white dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 p-6">
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                {t('profile.subscription')}
              </h2>
              
              <div className="text-center">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                  profile?.subscription?.status === 'active'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                    : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                }`}>
                  {profile?.subscription?.status === 'active' ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : null}
                  {profile?.subscription?.status === 'active' ? t('profile.active') : t('profile.freePlan')}
                </div>
                <p className="text-lg font-semibold text-stone-900 dark:text-stone-100 capitalize mb-1">
                  {profile?.subscription?.planId?.replace('_', ' ') || t('profile.freeTrial')}
                </p>
                {profile?.subscription?.lessonsLimit && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
                    {profile.subscription.lessonsLimit === -1 ? t('profile.unlimited') : profile.subscription.lessonsLimit} {t('profile.lessonsMonth')}
                  </p>
                )}
                <Link
                  to="/pricing"
                  search={{ session_id: undefined, success: undefined, canceled: undefined }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  {profile?.subscription?.status === 'active' ? t('profile.managePlan') : t('profile.upgradePlan')}
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 p-6">
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                {t('profile.quickLinks')}
              </h2>
              
              <div className="space-y-1">
                <Link
                  to="/lessons"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300 group-hover:text-amber-600 dark:group-hover:text-amber-500">{t('profile.myLessons')}</span>
                  <ChevronRight className="w-4 h-4 ml-auto text-stone-400" />
                </Link>
                <Link
                  to="/generate"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300 group-hover:text-amber-600 dark:group-hover:text-amber-500">{t('profile.createLesson')}</span>
                  <ChevronRight className="w-4 h-4 ml-auto text-stone-400" />
                </Link>
                <Link
                  to="/progress"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                    <Target className="w-4 h-4 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300 group-hover:text-amber-600 dark:group-hover:text-amber-500">{t('profile.progress')}</span>
                  <ChevronRight className="w-4 h-4 ml-auto text-stone-400" />
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300 group-hover:text-amber-600 dark:group-hover:text-amber-500">{t('profile.settings')}</span>
                  <ChevronRight className="w-4 h-4 ml-auto text-stone-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
