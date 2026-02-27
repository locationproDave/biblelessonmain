import { createRootRoute, Outlet, Link, useLocation } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { useTheme } from '@/components/theme-provider'
import { useSession, useAuth } from '@/lib/auth-client'
import { useI18n } from '@/i18n'
import { useQuery } from '@tanstack/react-query'
import { preferencesAPI } from '@/lib/api'
import { Onboarding } from '@/components/Onboarding'
import { OfflineIndicator } from '@/components/OfflineIndicator'
import { NotificationBell } from '@/components/NotificationBell'
import { HelpChatbot } from '@/components/HelpChatbot'
import { Home, Sparkles, BookOpen, Calendar, CalendarDays, ClipboardList, BarChart3, HelpCircle, Library, Users, CreditCard, Mail, Sun, Moon, Globe, Twitter, Facebook, X, Menu, Settings, User, LayoutTemplate, Shield } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

function RootComponent() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session } = useSession()
  const { data: onboardingDone } = useQuery({
    queryKey: ['onboarding-status'],
    queryFn: preferencesAPI.hasCompletedOnboarding,
    enabled: !!session,
  })
  const [dismissed, setDismissed] = useState(false)

  const showOnboarding = !!session && onboardingDone === false && !dismissed

  // Close mobile menu and scroll to top on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F1] dark:bg-[#1C1917] text-stone-900 dark:text-stone-100 transition-colors duration-300">
      {showOnboarding && <Onboarding onComplete={() => setDismissed(true)} />}
      <Nav mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <OfflineIndicator />
      <HelpChatbot />
    </div>
  )
}

// Lessons Dropdown Component (shows "Lessons" when logged out, "My Lessons" when logged in)
function LessonsDropdown({ items, isActive, currentPath, label }: { 
  items: { to: string; label: string; icon: React.ReactNode }[]
  isActive: boolean
  currentPath: string
  label: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        data-testid="lessons-dropdown-btn"
        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
          isActive
            ? 'text-stone-900 dark:text-amber-500 font-bold'
            : 'text-stone-500 dark:text-stone-300 hover:text-stone-900 dark:hover:text-amber-500 font-medium'
        }`}
      >
        <span>{label}</span>
        <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-48 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xl shadow-black/10 dark:shadow-black/30 z-50 py-1 overflow-hidden">
          {items.map(item => {
            const itemActive = currentPath.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to as any}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all duration-150 ${
                  itemActive
                    ? 'bg-amber-50 dark:bg-amber-900/30 text-stone-900 dark:text-amber-500 font-semibold'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700/50'
                }`}
              >
                <span className="w-4 h-4">{item.icon}</span>
                <span>{item.label}</span>
                {itemActive && <span className="ml-auto text-amber-600 dark:text-amber-500">•</span>}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Nav({ mobileMenuOpen, setMobileMenuOpen }: { mobileMenuOpen: boolean; setMobileMenuOpen: (v: boolean) => void }) {
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const { data: session } = useSession()
  const { t, language, setLanguage } = useI18n()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Simple nav links (no dropdown) - Templates moved to Lessons dropdown
  const simpleNavLinks = [
    { to: '/' as const, label: t('nav.home'), icon: <Home className="w-4 h-4" /> },
    { to: '/generate' as const, label: t('nav.createLesson'), icon: <Sparkles className="w-4 h-4" /> },
  ]

  // Lessons dropdown items (includes Templates and Team)
  // Settings only shows for logged-in users
  const lessonsDropdownItems = [
    { to: '/lessons' as const, label: 'All Lessons', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/templates' as const, label: 'Templates', icon: <LayoutTemplate className="w-4 h-4" /> },
    { to: '/series' as const, label: 'Series', icon: <Calendar className="w-4 h-4" /> },
    { to: '/planner' as const, label: 'Planner', icon: <CalendarDays className="w-4 h-4" /> },
    { to: '/curriculum' as const, label: 'Curriculum', icon: <ClipboardList className="w-4 h-4" /> },
    { to: '/progress' as const, label: 'Progress', icon: <BarChart3 className="w-4 h-4" /> },
    { to: '/team' as const, label: t('nav.team'), icon: <Users className="w-4 h-4" /> },
    ...(session ? [{ to: '/settings' as const, label: t('nav.settings'), icon: <Settings className="w-4 h-4" /> }] : []),
  ]

  // Remaining nav links - Hide Pricing for logged-in users
  const remainingNavLinks = [
    { to: '/resources' as const, label: t('nav.resources'), icon: <Library className="w-4 h-4" /> },
    { to: '/help' as const, label: t('nav.tutorials'), icon: <HelpCircle className="w-4 h-4" /> },
    ...(!session ? [{ to: '/pricing' as const, label: t('nav.pricing'), icon: <CreditCard className="w-4 h-4" /> }] : []),
    { to: '/contact' as const, label: t('nav.contactUs'), icon: <Mail className="w-4 h-4" /> },
  ]

  // All nav links for mobile menu
  const allNavLinks = [
    ...simpleNavLinks,
    ...lessonsDropdownItems,
    ...remainingNavLinks,
  ]

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light')
  const auth = useAuth()

  const handleSignOut = async () => {
    await auth.signOut()
  }

  // Check if Lessons dropdown should be active (includes /team now)
  const isLessonsDropdownActive = ['/lessons', '/templates', '/series', '/planner', '/curriculum', '/progress', '/team', '/settings'].some(path => location.pathname.startsWith(path))
  
  // Dynamic label: "Lessons" when logged out, "My Lessons" when logged in
  const lessonsDropdownLabel = session ? t('nav.myLessons') : t('nav.lessons')

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'backdrop-blur-xl bg-white/90 dark:bg-stone-900/90 shadow-md shadow-amber-600/10 dark:shadow-black/20'
        : 'backdrop-blur-md bg-white/70 dark:bg-stone-900/70'
    } border-b border-stone-200 dark:border-stone-700`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/images/logo-light.png" alt="Bible Lesson Planner" className="w-11 h-11 rounded-lg group-hover:scale-105 transition-all duration-200 shadow-sm dark:hidden" />
            <img src="/images/logo-icon.png" alt="Bible Lesson Planner" className="w-11 h-11 rounded-lg group-hover:scale-105 transition-all duration-200 shadow-sm hidden dark:block" />
            <span className="flex flex-col leading-none mt-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <span className="text-[23px] font-semibold tracking-tight text-stone-800 dark:text-stone-100">Bible Lesson</span>
              <span className="text-[23px] font-semibold tracking-tight text-stone-800 dark:text-stone-100">Planner</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {/* Simple nav links */}
            {simpleNavLinks.map(link => {
              const isActive = link.to === '/' ? location.pathname === '/' : location.pathname.startsWith(link.to)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isActive
                      ? 'text-stone-900 dark:text-amber-500 font-bold'
                      : 'text-stone-500 dark:text-stone-300 hover:text-stone-900 dark:hover:text-amber-500 font-medium'
                  }`}
                >
                  <span>{link.label}</span>
                </Link>
              )
            })}

            {/* Lessons Dropdown (dynamic label based on login state) */}
            <LessonsDropdown 
              items={lessonsDropdownItems} 
              isActive={isLessonsDropdownActive} 
              currentPath={location.pathname}
              label={lessonsDropdownLabel}
            />

            {/* Remaining nav links */}
            {remainingNavLinks.map(link => {
              const isActive = location.pathname.startsWith(link.to)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isActive
                      ? 'text-stone-900 dark:text-amber-500 font-bold'
                      : 'text-stone-500 dark:text-stone-300 hover:text-stone-900 dark:hover:text-amber-500 font-medium'
                  }`}
                >
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>

          <TooltipProvider delayDuration={200}>
            <div className="flex items-center gap-3">
              {/* Theme Toggle with Tooltip - centered between nav and auth */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-200 hover:scale-105"
                    aria-label="Toggle theme"
                  >
                    {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-stone-600" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-3 py-2 text-sm font-medium rounded-lg shadow-lg">
                  {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                </TooltipContent>
              </Tooltip>

              {session ? (
                <div className="hidden md:flex items-center gap-2">
                  {session.user?.role === 'admin' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to="/admin/dashboard"
                          className="p-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-200"
                          data-testid="admin-nav-btn"
                        >
                          <Shield className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-3 py-2 text-sm font-medium rounded-lg shadow-lg">
                        Admin Dashboard
                      </TooltipContent>
                    </Tooltip>
                  )}
                  <NotificationBell />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to="/profile"
                        className="p-2.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-200"
                        data-testid="profile-nav-btn"
                      >
                        <User className="w-5 h-5 text-stone-600 dark:text-stone-300" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-3 py-2 text-sm font-medium rounded-lg shadow-lg">
                      My Profile
                    </TooltipContent>
                  </Tooltip>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-200"
                  >
                    {t('nav.signOut')}
                  </button>
                </div>
              ) : (
                <Link
                  to="/signup"
                  className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-md shadow-amber-600/20 hover:shadow-lg hover:shadow-amber-600/30 hover:scale-105 active:scale-100 transition-all duration-200"
                >
                  {t('nav.signIn')}
                </Link>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-3 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-200"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-stone-600 dark:text-stone-300" />
                ) : (
                  <Menu className="w-6 h-6 text-stone-600 dark:text-stone-300" />
                )}
              </button>
            </div>
          </TooltipProvider>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-[85vh] opacity-100' : 'max-h-0 opacity-0'}`}
        data-testid="mobile-menu"
      >
        <div className="border-t border-stone-200 dark:border-stone-700 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-3 space-y-1">
            {/* Language selector removed - English only */}

            {allNavLinks.map(link => {
              const isActive = link.to === '/' ? location.pathname === '/' : location.pathname.startsWith(link.to)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-4 px-4 py-4 rounded-xl text-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-50 dark:bg-amber-900/30 text-stone-900 dark:text-amber-500 border border-amber-200 dark:border-amber-800/40 font-bold'
                      : 'text-stone-500 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium'
                  }`}
                >
                  <span className="w-6 h-6 [&>svg]:w-6 [&>svg]:h-6">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              )
            })}
            {session ? (
              <>
                {session.user?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center gap-4 px-4 py-4 rounded-xl text-lg transition-all duration-200 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 border border-amber-200 dark:border-amber-800/40 font-medium"
                    data-testid="mobile-admin-link"
                  >
                    <Shield className="w-6 h-6" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="flex items-center gap-4 px-4 py-4 rounded-xl text-lg transition-all duration-200 text-stone-500 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium"
                  data-testid="mobile-profile-link"
                >
                  <User className="w-6 h-6" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-3 px-4 py-4 text-stone-500 dark:text-stone-400 rounded-xl text-lg font-medium hover:bg-stone-100 dark:hover:bg-stone-800 mt-3"
                >
                  {t('nav.signOut')}
                </button>
              </>
            ) : (
              <Link
                to="/signup"
                className="flex items-center justify-center gap-3 px-4 py-4 bg-[#1E3A5F] hover:bg-[#162D4A] text-white rounded-xl text-lg font-bold shadow-md mt-3"
              >
                {t('nav.signIn')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  const { t } = useI18n()

  return (
    <footer className="border-t border-stone-200 dark:border-stone-700 bg-white/60 dark:bg-stone-900/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/images/logo-light.png" alt="Bible Lesson Planner" className="w-10 h-10 rounded-lg dark:hidden" />
              <img src="/images/logo-icon.png" alt="Bible Lesson Planner" className="w-10 h-10 rounded-lg hidden dark:block" />
              <span className="flex flex-col leading-none mt-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                <span className="text-[23px] font-semibold tracking-tight text-stone-800 dark:text-stone-100">Bible Lesson</span>
                <span className="text-[23px] font-semibold tracking-tight text-stone-800 dark:text-stone-100">Planner</span>
              </span>
            </div>
            <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed mb-4">
              {t('footer.description')}
            </p>
            <div className="flex items-center gap-3">
              <a href="mailto:hello@biblelessonplanner.com" className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-sm hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"><Mail className="w-4 h-4 text-stone-500 dark:text-stone-400" /></a>
              <span className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-sm hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"><Twitter className="w-4 h-4 text-stone-500 dark:text-stone-400" /></span>
              <span className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-sm hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"><Facebook className="w-4 h-4 text-stone-500 dark:text-stone-400" /></span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-4">{t('footer.platform')}</h4>
            <ul className="space-y-3">
              <li><Link to="/generate" className="text-sm text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-500 transition-colors">{t('nav.createLesson')}</Link></li>
              <li><Link to="/lessons" className="text-sm text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-500 transition-colors">{t('nav.myLessons')}</Link></li>
              <li><Link to="/resources" className="text-sm text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-500 transition-colors">{t('nav.resources')}</Link></li>
              <li><Link to="/pricing" search={{ session_id: undefined, success: undefined, canceled: undefined }} className="text-sm text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-500 transition-colors">{t('nav.pricing')}</Link></li>
            </ul>
          </div>

          {/* Information Links */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-4">{t('footer.information')}</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-sm text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-500 transition-colors">{t('footer.aboutUs')}</Link></li>
              <li><Link to="/contact" className="text-sm text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-500 transition-colors">{t('footer.contactUs')}</Link></li>
              <li><Link to="/pricing" search={{ session_id: undefined, success: undefined, canceled: undefined }} className="text-sm text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-500 transition-colors">{t('footer.pricingPlans')}</Link></li>
              <li><span className="text-sm text-stone-500 dark:text-stone-400">{t('footer.privacyPolicy')}</span></li>
              <li><span className="text-sm text-stone-500 dark:text-stone-400">{t('footer.termsOfService')}</span></li>
            </ul>
          </div>

          {/* Scripture Links */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-4">{t('footer.scripture')}</h4>
            <ul className="space-y-3">
              <li><Link to="/scripture/old-testament" className="text-sm text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-500 transition-colors">{t('footer.oldTestament')}</Link></li>
              <li><Link to="/scripture/new-testament" className="text-sm text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-500 transition-colors">{t('footer.newTestament')}</Link></li>
              <li><Link to="/scripture/gospels" className="text-sm text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-500 transition-colors">{t('footer.gospels')}</Link></li>
              <li><Link to="/scripture/epistles" className="text-sm text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-500 transition-colors">{t('footer.epistles')}</Link></li>
              <li><Link to="/scripture/psalms-wisdom" className="text-sm text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-500 transition-colors">{t('footer.psalmsWisdom')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-400 dark:text-stone-500">
            {t('footer.copyright', { year: String(new Date().getFullYear()) })}
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500 italic">
            {t('footer.proverb')}
          </p>
        </div>
      </div>
    </footer>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
