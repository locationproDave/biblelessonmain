import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { useSession } from '@/lib/auth-client'
import { Calendar, BookOpen, Users, BarChart3, CalendarCheck, RefreshCw, Sparkles, ArrowRight, Check, Clock, Target, Layers, FileText, Share2, ChevronDown, Shield, Zap, Heart } from 'lucide-react'

export const Route = createFileRoute('/curriculum-info')({
  component: CurriculumInfoPage,
})

// Animation hook
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

function CurriculumInfoPage() {
  const { data: session } = useSession()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const features = [
    {
      icon: <Calendar className="w-6 h-6" strokeWidth={1.5} />,
      title: 'Multi-Week Planning',
      description: 'Create structured teaching programs spanning multiple weeks. Set start and end dates, and organize your lessons into a cohesive curriculum that builds upon each week.',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: <BookOpen className="w-6 h-6" strokeWidth={1.5} />,
      title: 'Lesson Organization',
      description: 'Drag and drop to reorder lessons within your curriculum. Easily add or remove lessons, and see exactly which topics will be covered each week.',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    {
      icon: <Users className="w-6 h-6" strokeWidth={1.5} />,
      title: 'Age Group Targeting',
      description: 'Assign age groups to each curriculum plan. Filter lessons by age appropriateness and ensure your content matches your audience\'s developmental stage.',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      icon: <BarChart3 className="w-6 h-6" strokeWidth={1.5} />,
      title: 'Progress Tracking',
      description: 'Monitor which lessons have been completed. Track your progress through the curriculum and stay on schedule throughout the teaching period.',
      color: 'text-amber-600 dark:text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-900/20'
    },
    {
      icon: <CalendarCheck className="w-6 h-6" strokeWidth={1.5} />,
      title: 'Calendar Integration',
      description: 'Export your curriculum to Google Calendar, Outlook, or Apple Calendar. Never miss a lesson with automatic reminders and scheduling.',
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-900/20'
    },
    {
      icon: <RefreshCw className="w-6 h-6" strokeWidth={1.5} />,
      title: 'Flexible Editing',
      description: 'Update your curriculum anytime. Add new lessons mid-series, adjust dates, or modify descriptions as your teaching needs evolve.',
      color: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-50 dark:bg-cyan-900/20'
    }
  ]

  const useCases = [
    {
      title: 'Sunday School Series',
      description: 'Plan an 8-week series on the Life of Jesus, with each week focusing on a different miracle or teaching. Perfect for quarterly planning.',
      duration: '8 weeks',
      lessons: '8 lessons',
      icon: <Heart className="w-5 h-5" strokeWidth={1.5} />
    },
    {
      title: 'Summer VBS Program',
      description: 'Create a comprehensive 5-day Vacation Bible School curriculum with daily themes, activities, and memory verses that build on each other.',
      duration: '1 week',
      lessons: '5 lessons',
      icon: <Sparkles className="w-5 h-5" strokeWidth={1.5} />
    },
    {
      title: 'Youth Group Quarter',
      description: 'Develop a 12-week teen Bible study covering a full book of the Bible, chapter by chapter. Include discussion questions and application points.',
      duration: '12 weeks',
      lessons: '12 lessons',
      icon: <Users className="w-5 h-5" strokeWidth={1.5} />
    },
    {
      title: 'New Member Classes',
      description: 'Build a 4-session introduction to faith curriculum for new church members. Cover foundational beliefs, church history, and community values.',
      duration: '4 weeks',
      lessons: '4 lessons',
      icon: <Shield className="w-5 h-5" strokeWidth={1.5} />
    }
  ]

  const benefits = [
    {
      title: 'Save Hours Every Week',
      description: 'Stop scrambling for lessons on Saturday night. With a structured curriculum, you always know what\'s coming next.',
      stat: '5+ hours',
      statLabel: 'saved weekly'
    },
    {
      title: 'Teach with Consistency',
      description: 'Build lessons that connect and reinforce key themes. Your students will develop deeper understanding over time.',
      stat: '3x',
      statLabel: 'better retention'
    },
    {
      title: 'Coordinate Your Team',
      description: 'Share your curriculum with other teachers and volunteers. Everyone stays on the same page.',
      stat: '100%',
      statLabel: 'team alignment'
    }
  ]

  const { ref: heroRef, isVisible: heroVisible } = useInView(0.1)
  const { ref: benefitsRef, isVisible: benefitsVisible } = useInView(0.1)
  const { ref: howItWorksRef, isVisible: howItWorksVisible } = useInView(0.1)

  return (
    <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917]">
      {/* Hero Section */}
      <section ref={heroRef} className="relative py-16 sm:py-20 lg:py-28 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-amber-100/20 to-transparent rounded-full" />
        
        <div className={`relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 text-sm font-semibold mb-6">
            <Layers className="w-4 h-4" strokeWidth={1.5} /> Curriculum Planner
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: 'Crimson Text, serif' }}>
            <span className="text-stone-900 dark:text-stone-50">Stop Planning Week-by-Week.</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400">
              Build a Curriculum That Transforms.
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-stone-600 dark:text-stone-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            The Curriculum Planner helps you create <strong>structured, multi-week teaching programs</strong> that 
            build on each other. Your students learn more. You stress less. And your ministry runs smoother than ever.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            {session?.user ? (
              <Link
                to="/curriculum"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-lg shadow-lg shadow-amber-600/25 hover:shadow-xl hover:shadow-amber-600/35 hover:scale-105 active:scale-100 transition-all duration-200"
                data-testid="open-curriculum-planner-btn"
              >
                <Sparkles className="w-5 h-5 group-hover:animate-pulse" strokeWidth={1.5} />
                Open Curriculum Planner
                <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
              </Link>
            ) : (
              <Link
                to="/signup"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-lg shadow-lg shadow-amber-600/25 hover:shadow-xl hover:shadow-amber-600/35 hover:scale-105 active:scale-100 transition-all duration-200"
                data-testid="get-started-curriculum-btn"
              >
                <Sparkles className="w-5 h-5 group-hover:animate-pulse" strokeWidth={1.5} />
                Start Planning Free
                <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
              </Link>
            )}
            <Link
              to="/pricing"
              search={{ session_id: undefined, success: undefined, canceled: undefined }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl font-semibold border border-stone-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all duration-200"
            >
              View Pricing
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-stone-500 dark:text-stone-400">
            {[
              { icon: <Check className="w-4 h-4 text-emerald-500" />, text: 'Used by 2,500+ churches' },
              { icon: <Check className="w-4 h-4 text-emerald-500" />, text: 'Plan entire quarters in minutes' },
              { icon: <Check className="w-4 h-4 text-emerald-500" />, text: 'Free to start' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {item.icon}
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-16 sm:py-20 bg-white dark:bg-stone-800/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Problem */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full blur-2xl" />
              <div className="relative bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-8 border border-stone-200 dark:border-stone-700">
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-red-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                  The Weekly Scramble
                </h3>
                <ul className="space-y-3 text-stone-600 dark:text-stone-400">
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Every Saturday night, you're searching for a lesson</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Your lessons don't connect—students forget last week</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Volunteer teachers don't know what's coming up</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>You miss important Bible themes and stories</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Solution */}
            <div className="relative">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-100 dark:bg-emerald-900/20 rounded-full blur-2xl" />
              <div className="relative bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/10 dark:to-stone-800/50 rounded-2xl p-8 border border-amber-200 dark:border-amber-800/40">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-emerald-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                  The Curriculum Solution
                </h3>
                <ul className="space-y-3 text-stone-600 dark:text-stone-400">
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-500 mt-1">✓</span>
                    <span>Plan weeks or months ahead in one sitting</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-500 mt-1">✓</span>
                    <span>Lessons build on each other for lasting impact</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-500 mt-1">✓</span>
                    <span>Share the schedule with your entire teaching team</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-500 mt-1">✓</span>
                    <span>Cover complete biblical themes systematically</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits with Stats */}
      <section ref={benefitsRef} className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
              Why Churches Love Curriculum Planning
            </h2>
            <p className="text-lg text-stone-500 dark:text-stone-400 max-w-2xl mx-auto">
              Transform your teaching ministry from chaotic to coordinated
            </p>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-1000 delay-200 ${benefitsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="group relative bg-white dark:bg-stone-800/50 rounded-2xl p-8 border border-stone-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/50 dark:bg-amber-900/10 rounded-full blur-3xl group-hover:bg-amber-200/50 transition-all" />
                <div className="relative">
                  <div className="text-4xl font-bold text-amber-600 dark:text-amber-500 mb-1">{benefit.stat}</div>
                  <div className="text-sm text-stone-500 dark:text-stone-400 font-medium mb-4">{benefit.statLabel}</div>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">{benefit.title}</h3>
                  <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 sm:py-20 bg-white dark:bg-stone-800/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
              Powerful Features, Simple Interface
            </h2>
            <p className="text-lg text-stone-500 dark:text-stone-400 max-w-2xl mx-auto">
              Everything you need to create, manage, and execute effective curriculum plans
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group p-6 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-lg hover:bg-white dark:hover:bg-stone-800 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <span className={feature.color}>{feature.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Detailed */}
      <section ref={howItWorksRef} className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
              How It Works
            </h2>
            <p className="text-lg text-stone-500 dark:text-stone-400">
              Create your first curriculum in just 3 simple steps
            </p>
          </div>

          <div className={`space-y-8 transition-all duration-1000 ${howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {[
              {
                step: '1',
                title: 'Create Your Curriculum Plan',
                description: 'Give your curriculum a name, set the date range, and choose your target age group. Add a description so everyone on your team understands the goals and themes you\'ll be covering.',
                details: [
                  'Set start and end dates for your teaching period',
                  'Choose age groups: Preschool, Elementary, Teen, Adult',
                  'Add descriptions and learning objectives',
                  'Plan for 1 week to 52 weeks at a time'
                ],
                color: 'bg-blue-500',
                iconBg: 'bg-blue-100 dark:bg-blue-900/30',
                iconColor: 'text-blue-600'
              },
              {
                step: '2',
                title: 'Add and Organize Lessons',
                description: 'Select from your existing AI-generated lessons or create new ones on the spot. Drag and drop to reorder them into the perfect teaching sequence that builds understanding week after week.',
                details: [
                  'Search and filter your lesson library',
                  'Drag-and-drop to reorder lessons',
                  'See which week each lesson falls on',
                  'Generate new AI lessons directly from the planner'
                ],
                color: 'bg-emerald-500',
                iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
                iconColor: 'text-emerald-600'
              },
              {
                step: '3',
                title: 'Teach, Track, and Celebrate',
                description: 'Follow your curriculum week by week with confidence. Mark lessons as complete, track your progress, and export to your calendar so you never miss a beat.',
                details: [
                  'Visual timeline shows your teaching schedule',
                  'Mark lessons complete as you go',
                  'Export to Google Calendar for reminders',
                  'Share with volunteer teachers and staff'
                ],
                color: 'bg-amber-500',
                iconBg: 'bg-amber-100 dark:bg-amber-900/30',
                iconColor: 'text-amber-600'
              }
            ].map((item, idx) => (
              <div key={idx} className="relative flex gap-6 items-start">
                {/* Timeline */}
                <div className="hidden sm:flex flex-col items-center">
                  <div className={`w-14 h-14 rounded-2xl ${item.iconBg} flex items-center justify-center shadow-lg`}>
                    <span className={`text-2xl font-bold ${item.iconColor}`}>{item.step}</span>
                  </div>
                  {idx < 2 && (
                    <div className="w-0.5 h-full mt-4 bg-gradient-to-b from-stone-300 to-stone-200 dark:from-stone-600 dark:to-stone-700" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 bg-white dark:bg-stone-800/50 rounded-2xl p-6 border border-stone-200 dark:border-stone-700 hover:shadow-lg transition-all">
                  <div className="sm:hidden mb-4">
                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${item.iconBg} text-lg font-bold ${item.iconColor}`}>
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
                    {item.title}
                  </h3>
                  <p className="text-stone-600 dark:text-stone-400 mb-4 leading-relaxed">
                    {item.description}
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {item.details.map((detail, detailIdx) => (
                      <li key={detailIdx} className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" strokeWidth={2} />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 sm:py-20 bg-white dark:bg-stone-800/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
              Perfect For Every Ministry
            </h2>
            <p className="text-lg text-stone-500 dark:text-stone-400 max-w-2xl mx-auto">
              See how churches are using curriculum planning to transform their teaching programs
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {useCases.map((useCase, idx) => (
              <div
                key={idx}
                className="group p-6 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-lg hover:bg-white dark:hover:bg-stone-800 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <span className="text-amber-600">{useCase.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">
                      {useCase.title}
                    </h3>
                    <p className="text-sm text-stone-500 dark:text-stone-400 mb-4 leading-relaxed">
                      {useCase.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs font-semibold">
                      <span className="px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} /> {useCase.duration}
                      </span>
                      <span className="px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" strokeWidth={1.5} /> {useCase.lessons}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How far in advance can I plan a curriculum?',
                a: 'You can plan curricula ranging from a single week up to a full year (52 weeks). Most churches find quarterly planning (12-13 weeks) to be the sweet spot for flexibility and preparation.'
              },
              {
                q: 'Can I use AI-generated lessons in my curriculum?',
                a: 'Absolutely! You can add any lesson from your library to a curriculum, including AI-generated lessons. You can even generate new lessons directly from within the curriculum planner.'
              },
              {
                q: 'Can multiple teachers access the same curriculum?',
                a: 'Yes! Once you create a curriculum, you can share it with your teaching team. Everyone can see the schedule, access lessons, and stay coordinated.'
              },
              {
                q: 'What if I need to change the schedule mid-curriculum?',
                a: 'Curricula are fully editable at any time. You can add, remove, or reorder lessons, change dates, or update descriptions as your needs evolve.'
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 p-6"
              >
                <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
                  {faq.q}
                </h3>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-amber-500 to-amber-600 p-10 sm:p-14 text-center shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
                <Layers className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                Ready to Transform Your Teaching?
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of churches using Bible Lesson Planner's Curriculum Planner to organize their teaching ministry and create lasting impact.
              </p>
              
              {session?.user ? (
                <Link
                  to="/curriculum"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-amber-700 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-100 transition-all duration-200"
                >
                  <Sparkles className="w-5 h-5" strokeWidth={1.5} /> Open Curriculum Planner
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-amber-700 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-100 transition-all duration-200"
                >
                  <Sparkles className="w-5 h-5" strokeWidth={1.5} /> Start Planning Free
                </Link>
              )}
              
              <p className="text-sm text-white/70 mt-4">
                No credit card required. Start building your first curriculum today.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
