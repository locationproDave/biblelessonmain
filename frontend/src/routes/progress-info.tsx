import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { useSession } from '@/lib/auth-client'
import { BarChart3, BookOpen, CheckCircle, Circle, Clock, Target, TrendingUp, Award, Calendar, Users, Sparkles, ArrowRight, Check, Zap, Heart, Shield, Eye, Bell } from 'lucide-react'

export const Route = createFileRoute('/progress-info')({
  component: ProgressInfoPage,
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

function ProgressInfoPage() {
  const { data: session } = useSession()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const { ref: heroRef, isVisible: heroVisible } = useInView(0.1)
  const { ref: benefitsRef, isVisible: benefitsVisible } = useInView(0.1)
  const { ref: featuresRef, isVisible: featuresVisible } = useInView(0.1)

  const features = [
    {
      icon: <CheckCircle className="w-6 h-6" strokeWidth={1.5} />,
      title: 'Status Tracking',
      description: 'Mark lessons as Not Started, In Progress, or Completed. Get a clear picture of where you are in your teaching journey at a glance.',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    {
      icon: <BarChart3 className="w-6 h-6" strokeWidth={1.5} />,
      title: 'Visual Dashboard',
      description: 'See your completion rate, total lessons, and progress breakdown in beautiful, easy-to-understand charts and statistics.',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: <Clock className="w-6 h-6" strokeWidth={1.5} />,
      title: 'Time Tracking',
      description: 'Know when you last updated each lesson. Keep track of your teaching cadence and stay consistent with your ministry.',
      color: 'text-amber-600 dark:text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-900/20'
    },
    {
      icon: <Target className="w-6 h-6" strokeWidth={1.5} />,
      title: 'Filtering & Search',
      description: 'Filter lessons by status to focus on what matters. Quickly find completed lessons for review or identify what\'s coming up next.',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      icon: <Bell className="w-6 h-6" strokeWidth={1.5} />,
      title: 'Notes & Reminders',
      description: 'Add personal notes to each lesson progress entry. Record what worked, what to improve, and reminders for next time.',
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-900/20'
    },
    {
      icon: <TrendingUp className="w-6 h-6" strokeWidth={1.5} />,
      title: 'Progress Analytics',
      description: 'Track your teaching patterns over time. See how many lessons you complete weekly, monthly, and throughout the year.',
      color: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-50 dark:bg-cyan-900/20'
    }
  ]

  const benefits = [
    {
      title: 'Never Lose Track',
      description: 'With dozens of lessons in your library, it\'s easy to forget what you\'ve taught. Progress tracking keeps everything organized.',
      stat: '100%',
      statLabel: 'visibility'
    },
    {
      title: 'Stay Accountable',
      description: 'Seeing your progress motivates you to keep going. Watch your completion rate grow as you teach through your curriculum.',
      stat: '2x',
      statLabel: 'more consistent'
    },
    {
      title: 'Improve Over Time',
      description: 'Review what you\'ve taught and add notes for next time. Continuously improve your teaching based on real experience.',
      stat: '↑ 40%',
      statLabel: 'teaching quality'
    }
  ]

  const useCases = [
    {
      title: 'Track Sunday School Lessons',
      description: 'Keep track of which lessons you\'ve taught each Sunday. Never accidentally repeat a lesson or skip an important topic.',
      icon: <Heart className="w-5 h-5" strokeWidth={1.5} />
    },
    {
      title: 'Monitor Curriculum Progress',
      description: 'See how far along you are in your multi-week curriculum. Know exactly what\'s been covered and what\'s coming up.',
      icon: <Calendar className="w-5 h-5" strokeWidth={1.5} />
    },
    {
      title: 'Coordinate Teaching Teams',
      description: 'When multiple teachers share responsibility, progress tracking ensures everyone knows what\'s been taught.',
      icon: <Users className="w-5 h-5" strokeWidth={1.5} />
    },
    {
      title: 'Plan Annual Coverage',
      description: 'Review your teaching history to ensure you\'re covering a balanced range of biblical topics throughout the year.',
      icon: <Eye className="w-5 h-5" strokeWidth={1.5} />
    }
  ]

  return (
    <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917]">
      {/* Hero Section */}
      <section ref={heroRef} className="relative py-16 sm:py-20 lg:py-28 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-emerald-100/20 to-transparent rounded-full" />
        
        <div className={`relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-500 text-sm font-semibold mb-6">
            <BarChart3 className="w-4 h-4" strokeWidth={1.5} /> Progress Tracker
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: 'Crimson Text, serif' }}>
            <span className="text-stone-900 dark:text-stone-50">Know Where You Are.</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400">
              See How Far You've Come.
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-stone-600 dark:text-stone-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            The Progress Tracker helps you <strong>monitor your teaching journey</strong>, track lesson completion, 
            and celebrate your progress. Stay organized, stay motivated, and keep moving forward.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            {session?.user ? (
              <Link
                to="/progress"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-lg shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/35 hover:scale-105 active:scale-100 transition-all duration-200"
                data-testid="open-progress-tracker-btn"
              >
                <BarChart3 className="w-5 h-5 group-hover:animate-pulse" strokeWidth={1.5} />
                Open Progress Tracker
                <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
              </Link>
            ) : (
              <Link
                to="/signup"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-lg shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/35 hover:scale-105 active:scale-100 transition-all duration-200"
                data-testid="get-started-progress-btn"
              >
                <Sparkles className="w-5 h-5 group-hover:animate-pulse" strokeWidth={1.5} />
                Start Tracking Free
                <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
              </Link>
            )}
            <Link
              to="/pricing"
              search={{ session_id: undefined, success: undefined, canceled: undefined }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl font-semibold border border-stone-200 dark:border-stone-700 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md transition-all duration-200"
            >
              View Pricing
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-stone-500 dark:text-stone-400">
            {[
              { icon: <Check className="w-4 h-4 text-emerald-500" />, text: 'Track unlimited lessons' },
              { icon: <Check className="w-4 h-4 text-emerald-500" />, text: 'Visual progress dashboard' },
              { icon: <Check className="w-4 h-4 text-emerald-500" />, text: 'Free with every plan' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {item.icon}
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Challenge / Solution */}
      <section className="py-16 sm:py-20 bg-white dark:bg-stone-800/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Problem */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full blur-2xl" />
              <div className="relative bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-8 border border-stone-200 dark:border-stone-700">
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                  <Circle className="w-6 h-6 text-red-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                  The Teaching Chaos
                </h3>
                <ul className="space-y-3 text-stone-600 dark:text-stone-400">
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>"Wait, did I already teach this lesson?"</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>You have 50+ lessons but no idea what's been covered</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Important Bible topics get missed or repeated</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>No way to measure your teaching consistency</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Solution */}
            <div className="relative">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-100 dark:bg-emerald-900/20 rounded-full blur-2xl" />
              <div className="relative bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/10 dark:to-stone-800/50 rounded-2xl p-8 border border-emerald-200 dark:border-emerald-800/40">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-emerald-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                  The Progress Solution
                </h3>
                <ul className="space-y-3 text-stone-600 dark:text-stone-400">
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-500 mt-1">✓</span>
                    <span>Every lesson's status is crystal clear</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-500 mt-1">✓</span>
                    <span>Filter by completed, in-progress, or not started</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-500 mt-1">✓</span>
                    <span>See your completion rate and celebrate wins</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-500 mt-1">✓</span>
                    <span>Track your teaching journey over time</span>
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
              Why Progress Tracking Matters
            </h2>
            <p className="text-lg text-stone-500 dark:text-stone-400 max-w-2xl mx-auto">
              Turn your teaching ministry from scattered to strategic
            </p>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-1000 delay-200 ${benefitsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="group relative bg-white dark:bg-stone-800/50 rounded-2xl p-8 border border-stone-200 dark:border-stone-700 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 dark:bg-emerald-900/10 rounded-full blur-3xl group-hover:bg-emerald-200/50 transition-all" />
                <div className="relative">
                  <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-500 mb-1">{benefit.stat}</div>
                  <div className="text-sm text-stone-500 dark:text-stone-400 font-medium mb-4">{benefit.statLabel}</div>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">{benefit.title}</h3>
                  <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Demo Section */}
      <section className="py-16 sm:py-20 bg-white dark:bg-stone-800/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
              See Your Progress at a Glance
            </h2>
            <p className="text-lg text-stone-500 dark:text-stone-400 max-w-2xl mx-auto">
              A beautiful dashboard that shows exactly where you stand
            </p>
          </div>

          {/* Mock Dashboard Preview */}
          <div className="bg-[#F9F7F1] dark:bg-[#1C1917] rounded-2xl p-6 border border-stone-200 dark:border-stone-700 shadow-xl">
            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
              <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl p-4 text-white col-span-2 sm:col-span-1">
                <div className="text-2xl font-bold">68%</div>
                <div className="text-xs text-white/80">Completion Rate</div>
                <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[68%]" />
                </div>
              </div>
              {[
                { label: 'Total Lessons', value: '24', color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40', icon: <BookOpen className="w-4 h-4 text-blue-600" /> },
                { label: 'Completed', value: '16', color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40', icon: <CheckCircle className="w-4 h-4 text-emerald-600" /> },
                { label: 'In Progress', value: '3', color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40', icon: <Clock className="w-4 h-4 text-amber-600" /> },
                { label: 'Not Started', value: '5', color: 'bg-stone-50 dark:bg-stone-800/20 border-stone-200 dark:border-stone-700', icon: <Circle className="w-4 h-4 text-stone-400" /> },
              ].map((stat, idx) => (
                <div key={idx} className={`${stat.color} rounded-xl p-3 border`}>
                  <div className="flex items-center gap-2">
                    {stat.icon}
                    <div>
                      <span className="text-lg font-bold text-stone-900 dark:text-white">{stat.value}</span>
                      <div className="text-xs text-stone-500 dark:text-stone-400">{stat.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sample Lessons */}
            <div className="space-y-2">
              {[
                { title: 'The Good Samaritan', passage: 'Luke 10:25-37', status: 'completed', statusColor: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
                { title: 'David and Goliath', passage: '1 Samuel 17:1-58', status: 'in_progress', statusColor: 'bg-amber-100 text-amber-700 border-amber-200' },
                { title: 'Noah\'s Ark', passage: 'Genesis 6-9', status: 'not_started', statusColor: 'bg-stone-100 text-stone-600 border-stone-200' },
              ].map((lesson, idx) => (
                <div key={idx} className="bg-white dark:bg-stone-800 rounded-lg p-4 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${lesson.statusColor}`}>
                      {lesson.status === 'completed' ? <Check className="w-4 h-4" /> : lesson.status === 'in_progress' ? <Clock className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900 dark:text-white text-sm">{lesson.title}</p>
                      <p className="text-xs text-stone-500">{lesson.passage}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${lesson.statusColor}`}>
                    {lesson.status === 'completed' ? 'Completed' : lesson.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section ref={featuresRef} className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
              Powerful Tracking Features
            </h2>
            <p className="text-lg text-stone-500 dark:text-stone-400 max-w-2xl mx-auto">
              Everything you need to stay on top of your teaching ministry
            </p>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 transition-all duration-1000 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group p-6 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-lg transition-all duration-300"
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

      {/* How It Works */}
      <section className="py-16 sm:py-20 bg-white dark:bg-stone-800/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
              How It Works
            </h2>
            <p className="text-lg text-stone-500 dark:text-stone-400">
              Start tracking your progress in seconds
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Create or Generate Lessons',
                description: 'Use our AI lesson generator or add your own lessons. Every lesson you create is automatically tracked.',
                icon: <BookOpen className="w-6 h-6" strokeWidth={1.5} />
              },
              {
                step: '2',
                title: 'Teach Your Lesson',
                description: 'When you teach a lesson, update its status. Mark it "In Progress" when you start, "Completed" when you finish.',
                icon: <Clock className="w-6 h-6" strokeWidth={1.5} />
              },
              {
                step: '3',
                title: 'Track & Celebrate',
                description: 'Watch your progress grow! See your completion rate rise and celebrate milestones in your teaching journey.',
                icon: <Award className="w-6 h-6" strokeWidth={1.5} />
              }
            ].map((item, idx) => (
              <div key={idx} className="relative text-center">
                {idx < 2 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-emerald-300 dark:bg-emerald-800" />
                )}
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white dark:bg-stone-800 border-2 border-emerald-400 dark:border-emerald-600 shadow-lg mb-4 group hover:scale-105 transition-all duration-300">
                  <span className="text-emerald-600 dark:text-emerald-500">{item.icon}</span>
                </div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed max-w-[250px] mx-auto">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
              Perfect For Every Teacher
            </h2>
            <p className="text-lg text-stone-500 dark:text-stone-400 max-w-2xl mx-auto">
              See how progress tracking helps different ministry contexts
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {useCases.map((useCase, idx) => (
              <div
                key={idx}
                className="group p-6 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <span className="text-emerald-600">{useCase.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">
                      {useCase.title}
                    </h3>
                    <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                      {useCase.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-10 sm:p-14 text-center shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                Start Tracking Your Progress Today
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of teachers who stay organized and motivated with Bible Lesson Planner's Progress Tracker.
              </p>
              
              {session?.user ? (
                <Link
                  to="/progress"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-700 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-100 transition-all duration-200"
                >
                  <BarChart3 className="w-5 h-5" strokeWidth={1.5} /> Open Progress Tracker
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-700 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-100 transition-all duration-200"
                >
                  <Sparkles className="w-5 h-5" strokeWidth={1.5} /> Start Tracking Free
                </Link>
              )}
              
              <p className="text-sm text-white/70 mt-4">
                Included free with every plan. No credit card required.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
