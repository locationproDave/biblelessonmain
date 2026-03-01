import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { useI18n } from '@/i18n'
import { PricingSection } from '@/components/Pricing'
import { useSEO, trackPageView } from '@/lib/seo'
import { BookOpen, Church, ScrollText, Zap, Target, Palette, RefreshCw, Printer, Search, Monitor, Pencil, GraduationCap, Mail, Settings, BarChart3, Shield, Star, Sparkles, Check, BookMarked, Cross, ChevronRight } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  // SEO optimization for homepage
  useSEO({
    title: 'Bible Lesson Planner | #1 AI Sunday School Lesson Plan Generator',
    description: 'Create professional Sunday school lesson plans in minutes with AI. Free Bible lesson templates for all ages. 20+ translations, printable PDFs. Trusted by 2,500+ churches.',
    keywords: 'Sunday school lesson plans, Bible lesson planner, children\'s ministry curriculum, church lesson plans, free Sunday school curriculum, AI lesson generator, Bible study materials, VBS curriculum',
  })

  // Track page view
  useEffect(() => {
    trackPageView('/', 'Bible Lesson Planner - Home')
  }, [])

  return (
    <div className="bg-[#F9F7F1] dark:bg-[#1C1917]">
      <HeroSection />
      <StatsBar />
      <FeaturesSection />
      <ThemesAndVersesSection />
      <BibleVersionsSection />
      <TeamCollaborationSection />
      <PricingSection />
      <HowItWorksSection />
      <SampleLessonsSection />
      {/* Testimonials section - removed, will add back with real testimonials */}
      <CTASection />
    </div>
  )
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); obs.disconnect() }
    }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, isVisible }
}

function HeroSection() {
  const { ref, isVisible } = useInView(0.1)
  const { t } = useI18n()

  return (
    <section ref={ref} className="relative overflow-hidden">
      <div className="absolute top-10 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-5 right-10 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6 sm:pt-6 sm:pb-8 lg:pt-8 lg:pb-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

            {/* Mobile-only: Sign In / Sign Up buttons at top */}
            <div className="md:hidden mb-4">
              <div className="flex gap-3 mb-3">
                <Link
                  to="/signin"
                  data-testid="mobile-signin-btn"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-lg font-semibold shadow-md transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  data-testid="mobile-signup-btn"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-lg font-semibold shadow-md transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Sign Up
                </Link>
              </div>
              
              <p className="text-stone-400 dark:text-stone-500 text-base mb-3">or continue without account</p>
              
              <Link
                to="/generate"
                data-testid="mobile-test-lesson-btn"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 rounded-xl text-base font-semibold border-2 border-dashed border-amber-400 dark:border-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all duration-200"
              >
                <Sparkles className="w-5 h-5" strokeWidth={1.5} />
                Create a Test Lesson (No Account)
              </Link>
            </div>

            <h1 className="text-[1.75rem] md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight tracking-tight">
              <span className="text-slate-700 dark:text-slate-300">
                Bible Study & Sunday
              </span>
              <br />
              <span className="text-slate-700 dark:text-slate-300">
                School Lessons
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400">
                Rooted in Scripture
              </span>
            </h1>

            <p className="mt-4 text-base md:text-base lg:text-lg text-stone-500 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed">
              {t('hero.subtitle')}
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 md:gap-4">
              <Link
                to="/generate"
                data-testid="hero-create-lesson-btn"
                className="group w-full md:w-80 inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xl md:text-lg font-semibold shadow-lg shadow-amber-600/25 hover:shadow-xl hover:shadow-amber-600/35 hover:scale-105 active:scale-100 transition-all duration-200"
              >
                <Sparkles className="w-5 h-5 group-hover:animate-pulse" strokeWidth={1.5} />
                <span>{t('hero.cta')}</span>
              </Link>
              <Link
                to="/lessons"
                data-testid="hero-browse-lessons-btn"
                className="group w-full md:w-80 inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-xl md:text-lg font-semibold border border-stone-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all duration-200"
              >
                <BookMarked className="w-5 h-5" strokeWidth={1.5} /> {t('hero.browse')}
              </Link>
            </div>

            {/* Feature checkmarks - 2x2 grid on mobile */}
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 md:flex md:flex-wrap md:items-center md:justify-center md:gap-4 lg:gap-6 text-base md:text-sm text-stone-500 dark:text-stone-400">
              {[t('hero.allAges'), t('hero.scriptureBased'), t('hero.printReady'), t('hero.freeToStart')].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function StatsBar() {
  const { ref, isVisible } = useInView()
  const { t } = useI18n()
  const stats = [
    { value: '10,000+', label: t('stats.lessonsCreated'), icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-500" strokeWidth={1.5} /> },
    { value: '2,500+', label: t('stats.churchesServed'), icon: <Church className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-500" strokeWidth={1.5} /> },
    { value: '66', label: t('stats.booksOfBible'), icon: <ScrollText className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-500" strokeWidth={1.5} /> },
    { value: '< 2 min', label: t('stats.generationTime'), icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-500" strokeWidth={1.5} /> },
  ]

  return (
    <section ref={ref} className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 p-3 text-center hover:shadow-md transition-all duration-300"
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <div className="flex justify-center mb-1">{stat.icon}</div>
            <p className="text-xl sm:text-xl font-bold text-stone-900 dark:text-stone-100">{stat.value}</p>
            <p className="text-sm sm:text-xs text-stone-500 dark:text-stone-400">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function ThemesAndVersesSection() {
  const { ref, isVisible } = useInView()
  const { t } = useI18n()
  
  const themes = [
    { name: 'Love & Compassion', lessons: 24, passages: ['1 Corinthians 13', 'John 3:16', 'Matthew 22:37-39'] },
    { name: 'Faith & Trust', lessons: 31, passages: ['Hebrews 11:1', 'Proverbs 3:5-6', 'Romans 10:17'] },
    { name: 'Grace & Forgiveness', lessons: 18, passages: ['Ephesians 2:8-9', 'Colossians 3:13', 'Psalm 103:12'] },
    { name: 'Courage & Strength', lessons: 22, passages: ['Joshua 1:9', 'Isaiah 41:10', 'Philippians 4:13'] },
    { name: 'Wisdom & Guidance', lessons: 16, passages: ['James 1:5', 'Proverbs 2:6', 'Psalm 119:105'] },
    { name: 'Service & Humility', lessons: 14, passages: ['Mark 10:45', 'Philippians 2:3-4', 'Galatians 5:13'] },
  ]
  
  const popularVerses = [
    { reference: 'John 3:16', text: 'For God so loved the world that he gave his one and only Son...', theme: 'Salvation' },
    { reference: 'Jeremiah 29:11', text: 'For I know the plans I have for you, declares the Lord...', theme: 'Hope' },
    { reference: 'Philippians 4:13', text: 'I can do all things through Christ who strengthens me.', theme: 'Strength' },
    { reference: 'Psalm 23:1', text: 'The Lord is my shepherd; I shall not want.', theme: 'Comfort' },
    { reference: 'Romans 8:28', text: 'And we know that in all things God works for the good...', theme: 'Trust' },
    { reference: 'Proverbs 3:5-6', text: 'Trust in the Lord with all your heart...', theme: 'Guidance' },
  ]

  return (
    <section ref={ref} className="py-8 sm:py-10 bg-white dark:bg-stone-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`mb-5 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <Palette className="w-3.5 h-3.5" strokeWidth={1.5} />
            {t('themes.badge')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100" style={{ fontFamily: 'Crimson Text, serif' }}>
            {t('themes.title')}
          </h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {t('themes.subtitle')}
          </p>
        </div>

        {/* Themes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {themes.map((theme, i) => (
            <Link
              key={i}
              to="/generate"
              search={{ theme: theme.name.split(' & ')[0] }}
              className={`group p-4 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                    {theme.name}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    {theme.lessons} lesson ideas
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                    {theme.passages[0]}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Popular Verses Section - Below Themes, Horizontal Layout */}
        <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: '300ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
              <BookMarked className="w-4 h-4 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-base">{t('popularVerses.title')}</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">Quick start passages</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {popularVerses.map((verse, i) => (
              <Link
                key={i}
                to="/generate"
                search={{ book: verse.reference.split(' ')[0], topic: verse.theme }}
                className="group block p-3 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-medium text-amber-600 dark:text-amber-500 text-sm">{verse.reference}</p>
                  <span className="flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400">
                    {verse.theme}
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2">{verse.text}</p>
              </Link>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <Link
              to="/generate"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition-colors"
            >
              <Sparkles className="w-4 h-4" strokeWidth={1.5} />
              Explore All Passages
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function BibleVersionsSection() {
  const { ref, isVisible } = useInView()
  const { t } = useI18n()
  const versions = [
    { id: 'KJV', name: 'King James Version', abbr: 'KJV' },
    { id: 'NKJV', name: 'New King James Version', abbr: 'NKJV' },
    { id: 'NIV', name: 'New International Version', abbr: 'NIV' },
    { id: 'ESV', name: 'English Standard Version', abbr: 'ESV' },
    { id: 'NASB', name: 'New American Standard Bible', abbr: 'NASB' },
    { id: 'NLT', name: 'New Living Translation', abbr: 'NLT' },
    { id: 'NRSV', name: 'New Revised Standard Version', abbr: 'NRSV' },
    { id: 'CSB', name: 'Christian Standard Bible', abbr: 'CSB' },
    { id: 'HCSB', name: 'Holman Christian Standard Bible', abbr: 'HCSB' },
    { id: 'MSG', name: 'The Message', abbr: 'MSG' },
    { id: 'AMP', name: 'Amplified Bible', abbr: 'AMP' },
    { id: 'WEB', name: 'World English Bible', abbr: 'WEB' },
  ]

  return (
    <section ref={ref} className="py-8 sm:py-10 bg-white dark:bg-stone-800/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 text-xs font-semibold uppercase tracking-wider mb-2"><BookOpen className="w-3.5 h-3.5" strokeWidth={1.5} />{t('bibleVersions.badge')}</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100" style={{ fontFamily: 'Crimson Text, serif' }}>
            {t('bibleVersions.title')}
          </h2>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400 max-w-2xl mx-auto">
            {t('bibleVersions.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {versions.map((version, i) => (
            <div
              key={i}
              className={`group p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all duration-300 text-center cursor-pointer ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-500 uppercase tracking-wider mb-0.5">{version.abbr}</p>
              <p className="text-xs font-medium text-stone-700 dark:text-stone-300 leading-tight group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                {version.name}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/generate"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Sparkles className="w-4 h-4" strokeWidth={1.5} />
            <span>Create Account & Choose Your Version</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const { ref, isVisible } = useInView()
  const { t } = useI18n()
  const features = [
    { icon: <BookOpen className="w-6 h-6" strokeWidth={1.5} />, titleKey: 'features.scriptureCentered', descKey: 'features.scriptureCenteredDesc', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { icon: <Target className="w-6 h-6" strokeWidth={1.5} />, titleKey: 'features.ageAppropriate', descKey: 'features.ageAppropriateDesc', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { icon: <Palette className="w-6 h-6" strokeWidth={1.5} />, titleKey: 'features.creativeActivities', descKey: 'features.creativeActivitiesDesc', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { icon: <Zap className="w-6 h-6" strokeWidth={1.5} />, titleKey: 'features.readyInMinutes', descKey: 'features.readyInMinutesDesc', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { icon: <Printer className="w-6 h-6" strokeWidth={1.5} />, titleKey: 'features.printShare', descKey: 'features.printShareDesc', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
    { icon: <RefreshCw className="w-6 h-6" strokeWidth={1.5} />, titleKey: 'features.customizable', descKey: 'features.customizableDesc', color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
  ]

  return (
    <section ref={ref} className="py-8 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 text-xs font-semibold uppercase tracking-wider mb-2">{t('features.badge')}</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100" style={{ fontFamily: 'Crimson Text, serif' }}>
            {t('features.title')}
          </h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400 max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`group p-4 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-lg transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className={`w-10 h-10 rounded-xl ${feature.bg} flex items-center justify-center mb-2`}>
                <span className={feature.color}>{feature.icon}</span>
              </div>
              <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-1">
                {t(feature.titleKey)}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                {t(feature.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TeamCollaborationSection() {
  const { ref, isVisible } = useInView()
  const { t } = useI18n()

  return (
    <section ref={ref} className="py-12 sm:py-16 bg-white dark:bg-stone-800/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600" />
            </span>
            <span>{t('teamCollab.badge')}</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100" style={{ fontFamily: 'Crimson Text, serif' }}>
            {t('teamCollab.title')}
          </h2>
          <p className="mt-3 text-base text-stone-500 dark:text-stone-400 max-w-2xl mx-auto">
            {t('teamCollab.subtitle')}
          </p>
          <div className="mt-6 p-5 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 max-w-2xl mx-auto">
            <p className="text-base text-amber-700 dark:text-amber-400 font-semibold text-center">
              {t('teamCollab.freeNote')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-10">
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="h-full">
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">{t('teamCollab.teamRoles')}</h3>
              <div className="space-y-3 h-full">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm">{t('teamCollab.accountOwner')}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">{t('teamCollab.accountOwnerDesc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Pencil className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm">{t('teamCollab.editor')}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">{t('teamCollab.editorDesc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm">{t('teamCollab.viewer')}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">{t('teamCollab.viewerDesc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`lg:col-span-2 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '100ms' }}>
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">{t('teamCollab.keyFeatures')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="group p-4 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">{t('teamCollab.emailInvitations')}</h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">{t('teamCollab.emailInvitationsDesc')}</p>
                  </div>
                </div>
              </div>
              <div className="group p-4 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <Settings className="w-5 h-5 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">{t('teamCollab.fullAccessControl')}</h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">{t('teamCollab.fullAccessControlDesc')}</p>
                  </div>
                </div>
              </div>
              <div className="group p-4 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">{t('teamCollab.pendingInvites')}</h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">{t('teamCollab.pendingInvitesDesc')}</p>
                  </div>
                </div>
              </div>
              <div className="group p-4 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">{t('teamCollab.qualityOversight')}</h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">{t('teamCollab.qualityOversightDesc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const { ref, isVisible } = useInView()
  const { t } = useI18n()
  const steps = [
    { step: '01', titleKey: 'howItWorks.step1', descKey: 'howItWorks.step1Desc', icon: <Search className="w-7 h-7 text-amber-600 dark:text-amber-500" strokeWidth={1.5} /> },
    { step: '02', titleKey: 'howItWorks.step2', descKey: 'howItWorks.step2Desc', icon: <Monitor className="w-7 h-7 text-amber-600 dark:text-amber-500" strokeWidth={1.5} /> },
    { step: '03', titleKey: 'howItWorks.step3', descKey: 'howItWorks.step3Desc', icon: <Pencil className="w-7 h-7 text-amber-600 dark:text-amber-500" strokeWidth={1.5} /> },
    { step: '04', titleKey: 'howItWorks.step4', descKey: 'howItWorks.step4Desc', icon: <GraduationCap className="w-7 h-7 text-amber-600 dark:text-amber-500" strokeWidth={1.5} /> },
  ]

  return (
    <section ref={ref} className="py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 text-xs font-semibold uppercase tracking-wider mb-3">{t('howItWorks.badge')}</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100" style={{ fontFamily: 'Crimson Text, serif' }}>
            {t('howItWorks.title')}
          </h2>
          <p className="mt-2 text-base text-stone-500 dark:text-stone-400">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, i) => (
            <div
              key={i}
              className={`relative text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-px bg-amber-300 dark:bg-amber-800" />
              )}
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white dark:bg-stone-800 border-2 border-amber-400 dark:border-amber-600 shadow-lg mb-4 group hover:scale-105 transition-all duration-300">
                <div className="group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-semibold flex items-center justify-center shadow-md">
                  {item.step}
                </span>
              </div>
              <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-1.5">
                {t(item.titleKey)}
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed max-w-[220px] mx-auto">
                {t(item.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SampleLessonsSection() {
  const { ref, isVisible } = useInView()
  const { t } = useI18n()
  const lessons = [
    { title: 'The Good Samaritan', passage: 'Luke 10:25-37', ageGroup: t('age.elementary'), duration: '45 min', theme: 'Compassion & Kindness', search: { book: 'Luke', chapter: '10', verse: '25-37', topic: 'Compassion & Kindness', theme: 'Compassion', ageGroup: 'Elementary (6-10)', duration: '45 min', format: 'Interactive', autoGenerate: true } },
    { title: 'David and Goliath', passage: '1 Samuel 17', ageGroup: t('age.preschool'), duration: '30 min', theme: 'Courage & Faith', search: { book: '1 Samuel', chapter: '17', verse: '', topic: 'Courage & Faith', theme: 'Courage', ageGroup: 'Preschool (3-5)', duration: '30 min', format: 'Activity-Based', autoGenerate: true } },
    { title: 'The Prodigal Son', passage: 'Luke 15:11-32', ageGroup: t('age.preteen'), duration: '60 min', theme: 'Forgiveness & Grace', search: { book: 'Luke', chapter: '15', verse: '11-32', topic: 'Forgiveness & Grace', theme: 'Grace', ageGroup: 'Preteen (11-13)', duration: '60 min', format: 'Discussion-Based', autoGenerate: true } },
    { title: 'Creation Story', passage: 'Genesis 1-2', ageGroup: t('age.elementary'), duration: '45 min', theme: 'God as Creator', search: { book: 'Genesis', chapter: '1', verse: '', topic: 'God as Creator', theme: 'Creation', ageGroup: 'Elementary (6-10)', duration: '45 min', format: 'Interactive', autoGenerate: true } },
    { title: 'Fruits of the Spirit', passage: 'Galatians 5:22-23', ageGroup: t('age.teen'), duration: '60 min', theme: 'Character & Growth', search: { book: 'Galatians', chapter: '5', verse: '22-23', topic: 'Character & Growth', theme: 'Discipleship', ageGroup: 'Teen (14-17)', duration: '60 min', format: 'Discussion-Based', autoGenerate: true } },
    { title: 'Noah\'s Ark', passage: 'Genesis 6-9', ageGroup: t('age.preschool'), duration: '30 min', theme: 'Obedience & Trust', search: { book: 'Genesis', chapter: '6', verse: '', topic: 'Obedience & Trust', theme: 'Obedience', ageGroup: 'Preschool (3-5)', duration: '30 min', format: 'Activity-Based', autoGenerate: true } },
  ]

  return (
    <section ref={ref} className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 text-xs font-semibold uppercase tracking-wider mb-3">
            <BookOpen className="w-3.5 h-3.5" strokeWidth={1.5} />
            {t('examples.badge')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100" style={{ fontFamily: 'Crimson Text, serif' }}>
            {t('examples.title')}
          </h2>
          <p className="mt-2 text-base text-stone-500 dark:text-stone-400 max-w-2xl mx-auto">
            {t('examples.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.map((lesson, i) => (
            <Link
              key={i}
              to="/generate"
              search={lesson.search}
              className={`group p-5 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${i * 60}ms` }}
              data-testid={`lesson-card-${i}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors" style={{ fontFamily: 'Crimson Text, serif' }}>
                      {lesson.title}
                    </h3>
                    <span className="text-xs font-medium text-stone-400 dark:text-stone-500">
                      {lesson.duration}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-500 mb-1">
                    {lesson.passage}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">
                    {lesson.theme}
                  </p>
                  <span className="inline-block text-xs font-medium px-2 py-1 rounded-md bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
                    {lesson.ageGroup}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <Link
            to="/templates"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200"
          >
            <BookMarked className="w-5 h-5" strokeWidth={1.5} />
            <span>Browse All Templates</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

// TestimonialsSection removed - will add back with real testimonials

function CTASection() {
  const { ref, isVisible } = useInView()
  const { t } = useI18n()

  return (
    <section ref={ref} className="py-10 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E3A5F] via-[#2563EB] to-[#B8890F] p-6 sm:p-10 text-center shadow-2xl shadow-[#D4A017]/15 transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="absolute inset-0 opacity-10">
            <Cross className="absolute top-4 left-4 w-12 h-12" />
            <Cross className="absolute bottom-4 right-4 w-12 h-12" />
          </div>

          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              {t('cta.title')}
            </h2>
            <p className="text-base text-blue-100 mb-5 max-w-xl mx-auto leading-relaxed">
              {t('cta.subtitle')}
            </p>
            <Link
              to="/generate"
              className="group inline-flex items-center gap-2 px-7 py-3.5 bg-white text-[#2563EB] rounded-xl text-lg font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-100 transition-all duration-200"
            >
              <Zap className="w-5 h-5 group-hover:animate-pulse" />
              <span>{t('cta.button')}</span>
            </Link>
            <p className="mt-5 text-sm text-blue-200/80">
              {t('cta.noCreditCard')} &middot; {t('cta.unlimited')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
