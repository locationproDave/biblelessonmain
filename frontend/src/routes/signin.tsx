import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useSession, useAuth } from '@/lib/auth-client'
import { useI18n } from '@/i18n'
import { Loader2, BookOpen, LogIn, UserPlus } from 'lucide-react'

export const Route = createFileRoute('/signin')({
  component: SignInPage,
})

function SignInPage() {
  const { data: session, isPending } = useSession()
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const { t } = useI18n()
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  
  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Reset form when switching tabs
  useEffect(() => {
    setEmail('')
    setPassword('')
    setName('')
    setError('')
  }, [activeTab])

  // Redirect if already logged in - using useEffect to avoid setState during render
  useEffect(() => {
    if (session && !isPending) {
      navigate({ to: '/lessons' })
    }
  }, [session, isPending, navigate])

  if (isPending) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#F9F7F1] dark:bg-[#1C1917]">
        <div className="animate-spin"><Loader2 className="w-10 h-10 text-amber-600" strokeWidth={1.5} /></div>
      </div>
    )
  }

  // Show loading while redirecting
  if (session) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#F9F7F1] dark:bg-[#1C1917]">
        <div className="animate-spin"><Loader2 className="w-10 h-10 text-amber-600" strokeWidth={1.5} /></div>
      </div>
    )
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await signIn(email, password)
      if (!result.success) {
        setError(result.error?.message || 'Sign in failed')
      } else {
        navigate({ to: '/lessons' })
      }
    } catch (err: any) {
      setError(err.message || 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await signUp(email, password, name)
      if (!result.success) {
        setError(result.error?.message || 'Sign up failed')
      } else {
        navigate({ to: '/lessons' })
      }
    } catch (err: any) {
      setError(err.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 sm:py-10 bg-[#F9F7F1] dark:bg-[#1C1917]">
      <div className="w-full max-w-md">
        {/* Sign In / Sign Up Toggle - Always visible at top */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center p-1 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm">
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeTab === 'signin'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
              }`}
              data-testid="toggle-signin"
            >
              <LogIn className="w-4 h-4" />
              {t('nav.signIn')}
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeTab === 'signup'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
              }`}
              data-testid="toggle-signup"
            >
              <UserPlus className="w-4 h-4" />
              {t('nav.signUp')}
            </button>
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Text, serif' }}>
            {activeTab === 'signin' ? t('auth.welcomeBack') : 'Create Account'}
          </h1>
          <p className="text-stone-500 dark:text-stone-400 mt-1 text-sm">
            {activeTab === 'signin' ? t('auth.signInDesc') : 'Start creating Bible lessons today'}
          </p>
        </div>

        <div className="bg-white dark:bg-stone-800/50 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 overflow-hidden">
          <div className="p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Sign In Form */}
            {activeTab === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-5" data-testid="signin-form">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">{t('auth.email')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                    placeholder={t('auth.emailPlaceholder')}
                    data-testid="signin-email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">{t('auth.password')}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                    placeholder={t('auth.passwordPlaceholder')}
                    data-testid="signin-password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  data-testid="signin-submit"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('auth.signingIn')}
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      {t('nav.signIn')}
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Sign Up Form */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-5" data-testid="signup-form">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">{t('auth.name')}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                    placeholder={t('auth.namePlaceholder')}
                    data-testid="signup-name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">{t('auth.email')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                    placeholder={t('auth.emailPlaceholder')}
                    data-testid="signup-email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">{t('auth.password')}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                    placeholder={t('auth.passwordPlaceholder')}
                    data-testid="signup-password"
                  />
                  <p className="text-xs text-stone-400 mt-1">{t('auth.minPassword')}</p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  data-testid="signup-submit"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('auth.creatingAccount')}
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Create Account
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer link to pricing */}
        <p className="text-center text-sm text-stone-500 dark:text-stone-400 mt-6">
          {t('auth.explorePremium')}{' '}
          <Link to="/pricing" search={{ session_id: undefined, success: undefined, canceled: undefined }} className="text-amber-600 dark:text-amber-500 hover:underline font-medium">
            {t('auth.viewPricing')}
          </Link>
        </p>
      </div>
    </div>
  )
}
