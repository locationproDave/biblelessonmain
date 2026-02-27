import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from '@/lib/auth-client'
import { progressAPI, lessonsAPI, Lesson, Progress } from '@/lib/api'
import { BarChart3, BookOpen, CheckCircle, Circle, Sparkles, Users, Clock, Check, ChevronRight, PartyPopper } from 'lucide-react'

export const Route = createFileRoute('/progress')({
  component: ProgressPage,
})

// Half circle icon component
const CircleHalf = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 0 1 0 20 10 10 0 0 1 0-20z"/>
    <path d="M12 2v20" fill="currentColor"/>
  </svg>
)

function ProgressPage() {
  const { data: session, isPending } = useSession()
  const [progress, setProgress] = useState<Progress[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [summary, setSummary] = useState<{ total: number; completed: number; inProgress: number; notStarted: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress' | 'not_started'>('all')
  const [showConfetti, setShowConfetti] = useState(false)
  const [celebrationMessage, setCelebrationMessage] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressData, lessonsData, summaryData] = await Promise.all([
          progressAPI.getAll(),
          lessonsAPI.getAll(),
          progressAPI.getSummary(),
        ])
        setProgress(progressData)
        setLessons(lessonsData)
        setSummary(summaryData)
      } catch (err) {
        console.error('Failed to fetch progress:', err)
      } finally {
        setLoading(false)
      }
    }
    if (session?.user) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [session])

  const getProgressForLesson = (lessonId: string) => {
    return progress.find(p => p.lessonId === lessonId)
  }

  const getLessonStatus = (lessonId: string): 'not_started' | 'in_progress' | 'completed' => {
    const p = getProgressForLesson(lessonId)
    return p?.status || 'not_started'
  }

  const updateLessonProgress = async (lessonId: string, status: 'not_started' | 'in_progress' | 'completed') => {
    try {
      const previousStatus = getLessonStatus(lessonId)
      const updated = await progressAPI.update({ lessonId, status })
      setProgress(prev => {
        const existing = prev.findIndex(p => p.lessonId === lessonId)
        if (existing >= 0) {
          const newProgress = [...prev]
          newProgress[existing] = updated
          return newProgress
        }
        return [...prev, updated]
      })
      // Update summary
      const newSummary = await progressAPI.getSummary()
      setSummary(newSummary)
      
      // Trigger celebration when marking as completed
      if (status === 'completed' && previousStatus !== 'completed') {
        const lesson = lessons.find(l => l.id === lessonId)
        const completedCount = (newSummary?.completed || 0)
        const totalCount = (newSummary?.total || 1)
        const percentage = Math.round((completedCount / totalCount) * 100)
        
        // Celebration messages based on milestones
        let message = `"${lesson?.title || 'Lesson'}" completed!`
        if (percentage === 100) {
          message = "🎉 Amazing! You've completed ALL lessons!"
        } else if (percentage >= 75) {
          message = `${percentage}% complete! Almost there! 🌟`
        } else if (percentage >= 50) {
          message = `${percentage}% complete! Halfway milestone! 🎯`
        } else if (percentage >= 25) {
          message = `${percentage}% complete! Great progress! ✨`
        } else if (completedCount === 1) {
          message = "First lesson completed! Great start! 🚀"
        }
        
        setCelebrationMessage(message)
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      }
    } catch (err) {
      console.error('Failed to update progress:', err)
    }
  }

  const filteredLessons = lessons.filter(lesson => {
    if (filter === 'all') return true
    return getLessonStatus(lesson.id) === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
      case 'in_progress': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
      default: return 'bg-stone-100 dark:bg-stone-800/30 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="w-4 h-4" strokeWidth={2} />
      case 'in_progress': return <Clock className="w-4 h-4" strokeWidth={2} />
      default: return <Circle className="w-4 h-4" strokeWidth={2} />
    }
  }

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-stone-500 dark:text-stone-400">Loading progress...</span>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="bg-[#F9F7F1] dark:bg-[#1C1917]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {/* Hero */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-500 text-sm font-semibold mb-3">
              <BarChart3 className="w-4 h-4" strokeWidth={1.5} /> Progress Tracker
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-50 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
              Track Your Teaching Journey
            </h1>
            <p className="text-base text-stone-500 dark:text-stone-400 max-w-2xl mx-auto mb-5">
              Monitor lesson completion, stay organized, and celebrate your progress. Know exactly what you've taught and what's coming next.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all"
            >
              <BarChart3 className="w-5 h-5" strokeWidth={1.5} /> Start Tracking Free
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[
              { icon: <CheckCircle className="w-5 h-5" />, title: 'Status Tracking', desc: 'Mark lessons as Not Started, In Progress, or Completed', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
              { icon: <BarChart3 className="w-5 h-5" />, title: 'Visual Dashboard', desc: 'See completion rates and progress at a glance', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { icon: <Clock className="w-5 h-5" />, title: 'Time Tracking', desc: 'Know when you last updated each lesson', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
              { icon: <BookOpen className="w-5 h-5" />, title: 'Lesson Filtering', desc: 'Filter by status to focus on what matters', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
              { icon: <Users className="w-5 h-5" />, title: 'Team Visibility', desc: 'Track progress across your teaching team', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
              { icon: <Sparkles className="w-5 h-5" />, title: 'Celebrate Wins', desc: 'Watch your completion rate grow over time', color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
            ].map((f, i) => (
              <div key={i} className="p-5 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                <div className={`w-10 h-10 rounded-lg ${f.bg} flex items-center justify-center mb-3 ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-1">{f.title}</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Demo Preview */}
          <div className="bg-white dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 p-6 mb-10">
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4 text-center" style={{ fontFamily: 'Crimson Text, serif' }}>
              See Your Progress at a Glance
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white text-center">
                <div className="text-2xl font-bold">68%</div>
                <div className="text-xs text-white/80">Complete</div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800/40 text-center">
                <div className="text-2xl font-bold text-emerald-600">16</div>
                <div className="text-xs text-stone-500">Completed</div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800/40 text-center">
                <div className="text-2xl font-bold text-amber-600">3</div>
                <div className="text-xs text-stone-500">In Progress</div>
              </div>
              <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4 border border-stone-200 dark:border-stone-700 text-center">
                <div className="text-2xl font-bold text-stone-400">5</div>
                <div className="text-xs text-stone-500">Not Started</div>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { title: 'The Good Samaritan', status: 'completed', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
                { title: 'David and Goliath', status: 'in_progress', color: 'bg-amber-100 text-amber-700 border-amber-200' },
                { title: "Noah's Ark", status: 'not_started', color: 'bg-stone-100 text-stone-600 border-stone-200' },
              ].map((l, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-stone-50 dark:bg-stone-700/30 border border-stone-200 dark:border-stone-600">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded flex items-center justify-center border ${l.color}`}>
                      {l.status === 'completed' ? <Check className="w-3 h-3" /> : l.status === 'in_progress' ? <Clock className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                    </div>
                    <span className="font-medium text-stone-900 dark:text-stone-100 text-sm">{l.title}</span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded border ${l.color}`}>
                    {l.status === 'completed' ? 'Completed' : l.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <div className="inline-block bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 sm:p-8 text-white">
              <h3 className="text-xl font-bold mb-2">Ready to track your teaching?</h3>
              <p className="text-emerald-100 mb-4 text-sm">Create your free account and start monitoring your progress today.</p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const completionRate = summary && summary.total > 0 
    ? Math.round((summary.completed / summary.total) * 100) 
    : 0

  return (
    <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917] relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <>
          {/* Confetti particles */}
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10px',
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              >
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{
                    backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444'][Math.floor(Math.random() * 6)],
                    transform: `rotate(${Math.random() * 360}deg)`,
                  }}
                />
              </div>
            ))}
          </div>
          
          {/* Celebration Toast */}
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
            <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-2xl border border-emerald-200 dark:border-emerald-800 px-6 py-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <PartyPopper className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-stone-900 dark:text-white text-lg">Lesson Complete!</p>
                <p className="text-sm text-stone-500 dark:text-stone-400">{celebrationMessage}</p>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes bounce-in {
          0% { transform: translateX(-50%) scale(0.5) translateY(-20px); opacity: 0; }
          50% { transform: translateX(-50%) scale(1.05) translateY(0); }
          100% { transform: translateX(-50%) scale(1) translateY(0); opacity: 1; }
        }
        .animate-confetti { animation: confetti linear forwards; }
        .animate-bounce-in { animation: bounce-in 0.5s ease-out forwards; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Text, serif' }}>
            Progress Tracker
          </h1>
          <p className="mt-1 text-base text-stone-500 dark:text-stone-400">
            Track your teaching journey and lesson completion
          </p>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
            <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl p-5 text-white col-span-2 sm:col-span-1 shadow-lg relative overflow-hidden">
              <div className="text-3xl font-bold">{completionRate}%</div>
              <div className="text-sm text-white/80 font-medium mt-1">Completion Rate</div>
              <div className="mt-3 h-3 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-700 ease-out relative"
                  style={{ width: `${completionRate}%` }}
                >
                  {completionRate > 0 && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full animate-pulse shadow-lg" />
                  )}
                </div>
              </div>
              {completionRate === 100 && (
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full" />
              )}
            </div>
            {[
              { label: 'Total Lessons', value: summary.total, icon: <BookOpen className="w-5 h-5 text-blue-600" strokeWidth={1.5} />, color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40' },
              { label: 'Completed', value: summary.completed, icon: <CheckCircle className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />, color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40' },
              { label: 'In Progress', value: summary.inProgress, icon: <Clock className="w-5 h-5 text-amber-600" strokeWidth={1.5} />, color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40' },
              { label: 'Not Started', value: summary.notStarted, icon: <Circle className="w-5 h-5 text-stone-400" strokeWidth={1.5} />, color: 'bg-stone-50 dark:bg-stone-800/20 border-stone-200 dark:border-stone-700' },
            ].map(s => (
              <div key={s.label} className={`${s.color} rounded-xl p-4 border`}>
                <div className="flex items-center gap-3">
                  {s.icon}
                  <div>
                    <span className="text-2xl font-bold text-stone-900 dark:text-white">{s.value}</span>
                    <div className="text-sm text-stone-500 dark:text-stone-400 font-medium">{s.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Lessons', count: lessons.length },
              { key: 'completed', label: 'Completed', count: summary?.completed || 0 },
              { key: 'in_progress', label: 'In Progress', count: summary?.inProgress || 0 },
              { key: 'not_started', label: 'Not Started', count: summary?.notStarted || 0 },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as 'all' | 'completed' | 'in_progress' | 'not_started')}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  filter === tab.key
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-stone-100 dark:bg-stone-700/50 text-stone-600 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700'
                }`}
                data-testid={`filter-${tab.key}`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Lessons List */}
        {filteredLessons.length === 0 ? (
          <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-700 flex items-center justify-center mx-auto mb-4">
              {filter === 'all' ? <BookOpen className="w-8 h-8 text-stone-400" strokeWidth={1.5} /> : filter === 'completed' ? <CheckCircle className="w-8 h-8 text-emerald-500" strokeWidth={1.5} /> : filter === 'in_progress' ? <Clock className="w-8 h-8 text-amber-500" strokeWidth={1.5} /> : <Circle className="w-8 h-8 text-stone-400" strokeWidth={1.5} />}
            </div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">
              {filter === 'all' ? 'No lessons yet' : `No ${filter.replace('_', ' ')} lessons`}
            </h3>
            <p className="text-base text-stone-500 dark:text-stone-400 mb-6">
              {filter === 'all' 
                ? 'Create your first lesson to start tracking progress'
                : 'Update lesson status to see them here'}
            </p>
            {filter === 'all' && (
              <Link
                to="/generate"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
              >
                <Sparkles className="w-5 h-5" strokeWidth={1.5} /> Generate a Lesson
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLessons.map(lesson => {
              const status = getLessonStatus(lesson.id)
              const lessonProgress = getProgressForLesson(lesson.id)
              
              return (
                <div
                  key={lesson.id}
                  className="group bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-5 hover:shadow-md hover:border-amber-400/50 transition-all"
                  data-testid={`lesson-progress-${lesson.id}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Status Indicator */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${getStatusColor(status)}`}>
                      {getStatusIcon(status)}
                    </div>

                    {/* Lesson Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link
                            to="/lesson/$lessonId"
                            params={{ lessonId: lesson.id }}
                            className="text-lg font-semibold text-stone-900 dark:text-white hover:text-amber-700 dark:hover:text-amber-500 transition-colors"
                            style={{ fontFamily: 'Crimson Text, serif' }}
                          >
                            {lesson.title}
                          </Link>
                          <p className="text-base text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-2">
                            <BookOpen className="w-4 h-4" strokeWidth={1.5} /> {lesson.passage}
                            <span className="text-stone-300 dark:text-stone-600">·</span>
                            <Users className="w-4 h-4" strokeWidth={1.5} /> {lesson.ageGroup}
                            <span className="text-stone-300 dark:text-stone-600">·</span>
                            <Clock className="w-4 h-4" strokeWidth={1.5} /> {lesson.duration}
                          </p>
                        </div>

                        {/* Status Dropdown */}
                        <select
                          value={status}
                          onChange={(e) => updateLessonProgress(lesson.id, e.target.value as 'not_started' | 'in_progress' | 'completed')}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold border cursor-pointer transition-all ${getStatusColor(status)}`}
                          data-testid={`status-select-${lesson.id}`}
                        >
                          <option value="not_started">Not Started</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>

                      {/* Progress Notes */}
                      {lessonProgress?.notes && (
                        <div className="mt-3 p-3 rounded-lg bg-stone-50 dark:bg-stone-700/30 text-sm text-stone-600 dark:text-stone-300">
                          <span className="font-semibold">Notes:</span> {lessonProgress.notes}
                        </div>
                      )}

                      {/* Last Updated */}
                      {lessonProgress?.updatedAt && (
                        <p className="text-sm text-stone-400 dark:text-stone-500 mt-2">
                          Last updated: {new Date(lessonProgress.updatedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
