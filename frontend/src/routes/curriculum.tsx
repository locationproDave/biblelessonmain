import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useSession } from '@/lib/auth-client'
import { curriculumAPI, lessonsAPI, CurriculumPlan, Lesson } from '@/lib/api'
import { BookOpen, Calendar, Users, ClipboardList, Plus, Pencil, Trash2, CheckCircle, Clock, BookMarked, Target, ChevronRight, X } from 'lucide-react'

import { Sparkles } from 'lucide-react'

export const Route = createFileRoute('/curriculum')({
  component: CurriculumPage,
})

const AGE_GROUPS = [
  'Preschool (3-5)',
  'Elementary (6-10)',
  'Pre-Teen (11-13)',
  'Teen (14-17)',
  'Adult (18+)',
  'All Ages',
]

function CurriculumPage() {
  const { data: session, isPending } = useSession()
  const [plans, setPlans] = useState<CurriculumPlan[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<CurriculumPlan | null>(null)
  const [viewingPlan, setViewingPlan] = useState<CurriculumPlan | null>(null)

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansData, lessonsData] = await Promise.all([
          curriculumAPI.getAll(),
          lessonsAPI.getAll(),
        ])
        setPlans(plansData)
        setLessons(lessonsData)
      } catch (err) {
        console.error('Failed to fetch data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleCreatePlan = async (data: {
    title: string
    description?: string
    startDate: string
    endDate: string
    ageGroup: string
    lessonIds: string[]
  }) => {
    try {
      const newPlan = await curriculumAPI.create({ ...data, description: data.description || '' })
      setPlans([...plans, newPlan])
      setShowCreateModal(false)
    } catch (err) {
      console.error('Failed to create plan:', err)
    }
  }

  const handleUpdatePlan = async (planId: string, data: Partial<CurriculumPlan>) => {
    try {
      const updated = await curriculumAPI.update(planId, data)
      setPlans(plans.map(p => (p.id === planId ? updated : p)))
      setEditingPlan(null)
      if (viewingPlan?.id === planId) {
        setViewingPlan(updated)
      }
    } catch (err) {
      console.error('Failed to update plan:', err)
    }
  }

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this curriculum plan?')) return
    try {
      await curriculumAPI.delete(planId)
      setPlans(plans.filter(p => p.id !== planId))
      if (viewingPlan?.id === planId) {
        setViewingPlan(null)
      }
    } catch (err) {
      console.error('Failed to delete plan:', err)
    }
  }

  // Helper to get lesson details
  const getLessonById = (id: string) => lessons.find(l => l.id === id)

  // Calculate plan duration in weeks
  const getWeeksDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))
    return diffWeeks
  }

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Check if plan is active
  const isPlanActive = (plan: CurriculumPlan) => {
    const now = new Date()
    const start = new Date(plan.startDate)
    const end = new Date(plan.endDate)
    return now >= start && now <= end
  }

  // Check if plan is upcoming
  const isPlanUpcoming = (plan: CurriculumPlan) => {
    const now = new Date()
    const start = new Date(plan.startDate)
    return now < start
  }

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-stone-500 dark:text-stone-400">Loading curriculum plans...</span>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="bg-[#F9F7F1] dark:bg-[#1C1917]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 text-sm font-semibold mb-4">
              <ClipboardList className="w-4 h-4" strokeWidth={1.5} /> Curriculum Planner
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-50 mb-3" style={{ fontFamily: 'Crimson Text, serif' }}>
              Plan Multi-Week Teaching Programs
            </h1>
            <p className="text-base text-stone-500 dark:text-stone-400 max-w-2xl mx-auto mb-6">
              Create structured curriculum plans that organize your lessons into cohesive teaching series. Perfect for Sunday school quarters, VBS programs, and youth group studies.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all"
            >
              <BookOpen className="w-5 h-5" strokeWidth={1.5} /> Get Started Free
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {[
              { icon: <Calendar className="w-5 h-5" />, title: 'Multi-Week Planning', desc: 'Set start and end dates for teaching programs spanning weeks or months', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { icon: <BookOpen className="w-5 h-5" />, title: 'Lesson Organization', desc: 'Drag and drop to reorder lessons into the perfect teaching sequence', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
              { icon: <Users className="w-5 h-5" />, title: 'Age Group Targeting', desc: 'Assign curricula to specific age groups for appropriate content', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
              { icon: <CheckCircle className="w-5 h-5" />, title: 'Progress Tracking', desc: 'Monitor completion and stay on schedule throughout your program', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
              { icon: <Clock className="w-5 h-5" />, title: 'Timeline View', desc: 'Visual timeline shows your teaching schedule week by week', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
              { icon: <Target className="w-5 h-5" />, title: 'Flexible Editing', desc: 'Update your curriculum anytime as your teaching needs evolve', color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
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

          {/* Use Cases */}
          <div className="bg-white dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 p-6 mb-10">
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4 text-center" style={{ fontFamily: 'Crimson Text, serif' }}>
              Perfect For Every Ministry
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Sunday School Series', desc: '8-12 week quarterly plans covering key Bible themes' },
                { title: 'Summer VBS', desc: '5-day intensive programs with daily connected lessons' },
                { title: 'Youth Group Studies', desc: '12-week deep dives through books of the Bible' },
                { title: 'New Member Classes', desc: '4-session foundational faith courses' },
              ].map((u, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-stone-50 dark:bg-stone-700/30">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm">{u.title}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{u.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <div className="inline-block bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 sm:p-8 text-white">
              <h3 className="text-xl font-bold mb-2">Ready to organize your teaching?</h3>
              <p className="text-amber-100 mb-4 text-sm">Create your free account and start planning your first curriculum today.</p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-amber-700 rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Text, serif' }}>
              Curriculum Planner
            </h1>
            <p className="mt-2 text-base text-stone-500 dark:text-stone-400">
              Create structured multi-week teaching programs
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-100 transition-all duration-200"
            data-testid="create-curriculum-btn"
          >
            <Plus className="w-5 h-5" strokeWidth={1.5} /> New Curriculum
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Plans', value: plans.length, icon: <ClipboardList className="w-5 h-5 text-amber-600" strokeWidth={1.5} />, color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40' },
            { label: 'Active', value: plans.filter(isPlanActive).length, icon: <CheckCircle className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />, color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40' },
            { label: 'Upcoming', value: plans.filter(isPlanUpcoming).length, icon: <Calendar className="w-5 h-5 text-blue-600" strokeWidth={1.5} />, color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40' },
            { label: 'Total Lessons', value: plans.reduce((sum, p) => sum + p.lessonIds.length, 0), icon: <BookMarked className="w-5 h-5 text-purple-600" strokeWidth={1.5} />, color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/40' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
              <div className="flex items-center gap-3">
                {s.icon}
                <div>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-50">{s.value}</p>
                  <p className="text-sm text-stone-500 dark:text-stone-400">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        {plans.length === 0 ? (
          <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-12 text-center shadow-sm">
            <div className="w-20 h-20 rounded-2xl bg-stone-100 dark:bg-stone-700 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-stone-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">
              No Curriculum Plans Yet
            </h3>
            <p className="text-base text-stone-500 dark:text-stone-400 max-w-md mx-auto mb-6">
              Create your first curriculum plan to organize multiple lessons into a structured teaching program
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" strokeWidth={1.5} /> Create Your First Curriculum
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {plans.map(plan => {
              const isActive = isPlanActive(plan)
              const isUpcoming = isPlanUpcoming(plan)
              const weeks = getWeeksDuration(plan.startDate, plan.endDate)
              const planLessons = plan.lessonIds.map(getLessonById).filter(Boolean) as Lesson[]

              return (
                <div
                  key={plan.id}
                  className="group bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden hover:shadow-lg hover:border-amber-400/50 transition-all"
                  data-testid={`curriculum-card-${plan.id}`}
                >
                  {/* Card Header */}
                  <div className={`p-5 border-b border-stone-100 dark:border-stone-700 ${
                    isActive ? 'bg-emerald-50 dark:bg-emerald-900/10' : isUpcoming ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-stone-50 dark:bg-stone-800/50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            isActive 
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                              : isUpcoming 
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
                          }`}>
                            {isActive ? 'Active' : isUpcoming ? 'Upcoming' : 'Completed'}
                          </span>
                          <span className="text-xs text-[#6B7280] dark:text-[#94A3B8]">
                            {weeks} week{weeks !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-[#333333] dark:text-white">
                          {plan.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingPlan(plan)}
                          className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-[#334155]/50 transition-colors"
                          data-testid={`edit-curriculum-${plan.id}`}
                        >
                          <svg className="w-4 h-4 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                          data-testid={`delete-curriculum-${plan.id}`}
                        >
                          <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    {plan.description && (
                      <p className="text-sm text-[#6B7280] dark:text-[#94A3B8] mb-3 line-clamp-2">
                        {plan.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3 text-xs mb-4">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F5F8FC] dark:bg-[#1E3A5F]/20 text-[#6B7280] dark:text-[#94A3B8]">
                        <Users className="w-3.5 h-3.5" /> {plan.ageGroup}
                      </span>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F5F8FC] dark:bg-[#1E3A5F]/20 text-[#6B7280] dark:text-[#94A3B8]">
                        <BookMarked className="w-3.5 h-3.5" /> {plan.lessonIds.length} lessons
                      </span>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F5F8FC] dark:bg-[#1E3A5F]/20 text-[#6B7280] dark:text-[#94A3B8]">
                        <Calendar className="w-3.5 h-3.5" /> {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                      </span>
                    </div>

                    {/* Lessons Preview */}
                    {planLessons.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-[#333333] dark:text-[#E2E8F0]">Lessons in this curriculum:</p>
                        <div className="space-y-1.5">
                          {planLessons.slice(0, 3).map((lesson, idx) => (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-2 p-2 rounded-lg bg-[#F5F8FC] dark:bg-[#1E3A5F]/10 group/lesson"
                            >
                              <span className="w-6 h-6 rounded-full bg-[#D4A017]/20 flex items-center justify-center text-xs font-bold text-[#D4A017]">
                                {idx + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#333333] dark:text-white truncate">
                                  {lesson.title}
                                </p>
                                <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] truncate">
                                  {lesson.passage}
                                </p>
                              </div>
                              <Link
                                to="/lesson/$lessonId"
                                params={{ lessonId: lesson.id }}
                                className="opacity-0 group-hover/lesson:opacity-100 text-xs text-[#1E3A5F] dark:text-[#D4A017] font-medium hover:underline transition-opacity"
                              >
                                View →
                              </Link>
                            </div>
                          ))}
                          {planLessons.length > 3 && (
                            <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] pl-2">
                              +{planLessons.length - 3} more lessons
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* View Details Button */}
                    <button
                      onClick={() => setViewingPlan(plan)}
                      className="mt-4 w-full py-2.5 rounded-xl border border-[#E8DCC8] dark:border-[#334155] text-sm font-semibold text-[#1E3A5F] dark:text-[#D4A017] hover:bg-[#F5F8FC] dark:hover:bg-[#1E3A5F]/20 transition-all"
                      data-testid={`view-curriculum-${plan.id}`}
                    >
                      View Full Curriculum →
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingPlan) && (
        <CurriculumModal
          plan={editingPlan}
          lessons={lessons}
          onClose={() => {
            setShowCreateModal(false)
            setEditingPlan(null)
          }}
          onSave={(data) => {
            if (editingPlan) {
              handleUpdatePlan(editingPlan.id, data)
            } else {
              handleCreatePlan(data)
            }
          }}
        />
      )}

      {/* View Plan Modal */}
      {viewingPlan && (
        <ViewCurriculumModal
          plan={viewingPlan}
          lessons={lessons}
          onClose={() => setViewingPlan(null)}
          onEdit={() => {
            setEditingPlan(viewingPlan)
            setViewingPlan(null)
          }}
        />
      )}
    </div>
  )
}

// Create/Edit Modal Component
function CurriculumModal({
  plan,
  lessons,
  onClose,
  onSave,
}: {
  plan: CurriculumPlan | null
  lessons: Lesson[]
  onClose: () => void
  onSave: (data: Partial<CurriculumPlan> & { title: string; startDate: string; endDate: string; ageGroup: string; lessonIds: string[] }) => void
}) {
  const [title, setTitle] = useState(plan?.title || '')
  const [description, setDescription] = useState(plan?.description || '')
  const [startDate, setStartDate] = useState(plan?.startDate || '')
  const [endDate, setEndDate] = useState(plan?.endDate || '')
  const [ageGroup, setAgeGroup] = useState(plan?.ageGroup || AGE_GROUPS[1])
  const [selectedLessons, setSelectedLessons] = useState<string[]>(plan?.lessonIds || [])
  const [searchQuery, setSearchQuery] = useState('')
  const [saving, setSaving] = useState(false)

  const filteredLessons = lessons.filter(l =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.passage.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.theme.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !startDate || !endDate) return

    setSaving(true)
    await onSave({
      title,
      description,
      startDate,
      endDate,
      ageGroup,
      lessonIds: selectedLessons,
    })
    setSaving(false)
  }

  const toggleLesson = (lessonId: string) => {
    setSelectedLessons(prev =>
      prev.includes(lessonId)
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    )
  }

  const moveLesson = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...selectedLessons]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= newOrder.length) return
    ;[newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]]
    setSelectedLessons(newOrder)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#0F1F33] rounded-2xl shadow-2xl border border-[#E8DCC8] dark:border-[#334155] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E8DCC8] dark:border-[#334155]">
          <h3 className="text-lg font-bold text-[#333333] dark:text-white flex items-center gap-2">
            {plan ? <><Pencil className="w-5 h-5" /> Edit Curriculum</> : <><BookOpen className="w-5 h-5" /> Create New Curriculum</>}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F0F4F8] dark:hover:bg-[#334155] transition-colors">
            <svg className="w-5 h-5 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-[#333333] dark:text-white mb-2">
              Curriculum Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Summer Bible Study Series"
              required
              className="w-full px-4 py-3 rounded-xl border border-[#E8DCC8] dark:border-[#334155] bg-[#F5F8FC] dark:bg-[#1E3A5F]/20 text-[#333333] dark:text-white placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#D4A017] transition-all"
              data-testid="curriculum-title-input"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-[#333333] dark:text-white mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of the curriculum goals and themes..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-[#E8DCC8] dark:border-[#334155] bg-[#F5F8FC] dark:bg-[#1E3A5F]/20 text-[#333333] dark:text-white placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#D4A017] transition-all resize-none"
              data-testid="curriculum-description-input"
            />
          </div>

          {/* Dates and Age Group */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#333333] dark:text-white mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[#E8DCC8] dark:border-[#334155] bg-[#F5F8FC] dark:bg-[#1E3A5F]/20 text-[#333333] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4A017] transition-all"
                data-testid="curriculum-start-date"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#333333] dark:text-white mb-2">
                End Date *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[#E8DCC8] dark:border-[#334155] bg-[#F5F8FC] dark:bg-[#1E3A5F]/20 text-[#333333] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4A017] transition-all"
                data-testid="curriculum-end-date"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#333333] dark:text-white mb-2">
                Age Group
              </label>
              <select
                value={ageGroup}
                onChange={e => setAgeGroup(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#E8DCC8] dark:border-[#334155] bg-[#F5F8FC] dark:bg-[#1E3A5F]/20 text-[#333333] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4A017] transition-all"
                data-testid="curriculum-age-group"
              >
                {AGE_GROUPS.map(ag => (
                  <option key={ag} value={ag}>{ag}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Lesson Selection */}
          <div>
            <label className="block text-sm font-semibold text-[#333333] dark:text-white mb-2">
              Select Lessons ({selectedLessons.length} selected)
            </label>
            
            {/* Search */}
            <div className="relative mb-3">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search lessons..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F0F4F8] dark:bg-[#0F172A] border border-[#E8DCC8] dark:border-[#334155] text-sm text-[#333333] dark:text-white placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50"
              />
            </div>

            {/* Selected lessons (reorderable) */}
            {selectedLessons.length > 0 && (
              <div className="mb-3 p-3 rounded-xl bg-[#EBF5FF] dark:bg-[#1E3A5F]/20 border border-[#D4A017]/20">
                <p className="text-xs font-semibold text-[#1E3A5F] dark:text-[#D4A017] mb-2 flex items-center gap-1.5">
                  <ClipboardList className="w-3.5 h-3.5" /> Selected (drag to reorder)
                </p>
                <div className="space-y-1.5">
                  {selectedLessons.map((id, idx) => {
                    const lesson = lessons.find(l => l.id === id)
                    if (!lesson) return null
                    return (
                      <div
                        key={id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-[#0F1F33] border border-[#E8DCC8] dark:border-[#334155]"
                      >
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => moveLesson(idx, 'up')}
                            disabled={idx === 0}
                            className="p-0.5 hover:bg-[#F0F4F8] dark:hover:bg-[#334155] rounded disabled:opacity-30"
                          >
                            <svg className="w-3 h-3 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => moveLesson(idx, 'down')}
                            disabled={idx === selectedLessons.length - 1}
                            className="p-0.5 hover:bg-[#F0F4F8] dark:hover:bg-[#334155] rounded disabled:opacity-30"
                          >
                            <svg className="w-3 h-3 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                        <span className="w-6 h-6 rounded-full bg-[#D4A017] flex items-center justify-center text-xs font-bold text-white">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#333333] dark:text-white truncate">{lesson.title}</p>
                          <p className="text-xs text-[#6B7280] truncate">{lesson.passage}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleLesson(id)}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Available lessons */}
            <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-[#E8DCC8] dark:border-[#334155] p-1">
              {filteredLessons.length === 0 ? (
                <div className="text-center py-6 text-sm text-[#9CA3AF]">
                  <p>No lessons found</p>
                  <Link to="/generate" className="text-[#1E3A5F] dark:text-[#D4A017] hover:underline text-xs mt-1 inline-block flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Generate a new lesson
                  </Link>
                </div>
              ) : (
                filteredLessons.map(lesson => {
                  const isSelected = selectedLessons.includes(lesson.id)
                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => toggleLesson(lesson.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all duration-150 ${
                        isSelected
                          ? 'bg-[#D4A017]/10 border border-[#D4A017]/30'
                          : 'hover:bg-[#F0F4F8] dark:hover:bg-[#334155]/50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-[#D4A017] border-[#D4A017]'
                          : 'border-[#D1D5DB] dark:border-[#475569]'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isSelected ? 'text-[#D4A017]' : 'text-[#333333] dark:text-white'}`}>
                          {lesson.title}
                        </p>
                        <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] truncate">
                          {lesson.passage} · {lesson.ageGroup}
                        </p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#E8DCC8] dark:border-[#334155]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#6B7280] dark:text-[#94A3B8] hover:bg-[#F0F4F8] dark:hover:bg-[#334155] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title || !startDate || !endDate || saving}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#D4A017] hover:bg-[#B8890F] text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="save-curriculum-btn"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : plan ? 'Update Curriculum' : 'Create Curriculum'}
          </button>
        </div>
      </div>
    </div>
  )
}

// View Plan Modal Component
function ViewCurriculumModal({
  plan,
  lessons,
  onClose,
  onEdit,
}: {
  plan: CurriculumPlan
  lessons: Lesson[]
  onClose: () => void
  onEdit: () => void
}) {
  const planLessons = plan.lessonIds.map(id => lessons.find(l => l.id === id)).filter(Boolean) as Lesson[]
  
  const getWeeksDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }

  const weeks = getWeeksDuration(plan.startDate, plan.endDate)

  // Calculate estimated week for each lesson
  const getLessonWeek = (index: number) => {
    if (planLessons.length === 0) return 1
    const weekPerLesson = weeks / planLessons.length
    return Math.ceil((index + 1) * weekPerLesson)
  }

  // Get estimated date for a lesson
  const getLessonDate = (index: number) => {
    const start = new Date(plan.startDate)
    if (planLessons.length === 0) return start
    const daysPerLesson = (weeks * 7) / planLessons.length
    const lessonDate = new Date(start.getTime() + index * daysPerLesson * 24 * 60 * 60 * 1000)
    return lessonDate
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#0F1F33] rounded-2xl shadow-2xl border border-[#E8DCC8] dark:border-[#334155] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#E8DCC8] dark:border-[#334155] bg-gradient-to-r from-[#1E3A5F]/5 to-[#D4A017]/5">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-[#D4A017]/10 text-[#D4A017] mb-2">
                {plan.ageGroup}
              </span>
              <h2 className="text-2xl font-bold text-[#333333] dark:text-white">{plan.title}</h2>
              {plan.description && (
                <p className="text-[#6B7280] dark:text-[#94A3B8] mt-1">{plan.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-[#6B7280] dark:text-[#94A3B8]">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(plan.startDate)} - {formatDate(plan.endDate)}</span>
                <span className="flex items-center gap-1"><BookMarked className="w-4 h-4" /> {planLessons.length} lessons</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {weeks} weeks</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-[#1E3A5F] dark:text-[#D4A017] hover:bg-[#F0F4F8] dark:hover:bg-[#334155] transition-colors flex items-center gap-1.5"
              >
                <Pencil className="w-4 h-4" /> Edit
              </button>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F0F4F8] dark:hover:bg-[#334155] transition-colors">
                <svg className="w-5 h-5 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Timeline View */}
        <div className="flex-1 overflow-y-auto p-6">
          {planLessons.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-[#F5F8FC] dark:bg-[#1E3A5F]/20 flex items-center justify-center mx-auto mb-4">
                <BookMarked className="w-8 h-8 text-[#D4A017]" />
              </div>
              <p className="text-[#6B7280] dark:text-[#94A3B8] mb-4">No lessons added to this curriculum yet</p>
              <button
                onClick={onEdit}
                className="px-5 py-2.5 bg-[#D4A017] text-white rounded-xl font-semibold hover:bg-[#B8890F] transition-all"
              >
                + Add Lessons
              </button>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#D4A017] via-[#1E3A5F] to-[#D4A017]" />

              <div className="space-y-6">
                {planLessons.map((lesson, idx) => {
                  const lessonDate = getLessonDate(idx)
                  const weekNum = getLessonWeek(idx)
                  
                  return (
                    <div key={lesson.id} className="relative pl-16 group">
                      {/* Timeline dot */}
                      <div className="absolute left-4 w-5 h-5 rounded-full bg-white dark:bg-[#0F1F33] border-2 border-[#D4A017] flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-[#D4A017]" />
                      </div>

                      {/* Week label */}
                      <div className="absolute left-[-10px] top-0 text-xs font-bold text-[#D4A017]">
                        W{weekNum}
                      </div>

                      {/* Lesson Card */}
                      <div className="bg-white dark:bg-[#1E3A5F]/10 rounded-xl border border-[#E8DCC8] dark:border-[#334155] p-4 hover:shadow-lg hover:border-[#D4A017]/30 transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] mb-1">
                              {lessonDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                            </p>
                            <h4 className="text-lg font-bold text-[#333333] dark:text-white group-hover:text-[#1E3A5F] dark:group-hover:text-[#D4A017] transition-colors">
                              {lesson.title}
                            </h4>
                            <p className="text-sm text-[#6B7280] dark:text-[#94A3B8] mt-1 flex items-center gap-1">
                              <BookMarked className="w-3.5 h-3.5" /> {lesson.passage} · {lesson.duration}
                            </p>
                            {lesson.theme && (
                              <p className="text-sm text-[#6B7280] dark:text-[#94A3B8] flex items-center gap-1">
                                <Target className="w-3.5 h-3.5" /> Theme: {lesson.theme}
                              </p>
                            )}
                          </div>
                          <Link
                            to="/lesson/$lessonId"
                            params={{ lessonId: lesson.id }}
                            className="px-4 py-2 rounded-lg bg-[#F5F8FC] dark:bg-[#1E3A5F]/30 text-sm font-semibold text-[#1E3A5F] dark:text-[#D4A017] hover:bg-[#D4A017]/10 transition-all"
                          >
                            View Lesson →
                          </Link>
                        </div>

                        {/* Memory Verse Preview */}
                        {lesson.memoryVerseText && (
                          <div className="mt-3 p-3 rounded-lg bg-[#FEF3C7]/50 dark:bg-[#D4A017]/10 border-l-4 border-[#D4A017]">
                            <p className="text-sm italic text-[#333333] dark:text-white">"{lesson.memoryVerseText}"</p>
                            <p className="text-xs font-semibold text-[#D4A017] mt-1">— {lesson.memoryVerseReference}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* End marker */}
                <div className="relative pl-16">
                  <div className="absolute left-4 w-5 h-5 rounded-full bg-[#D4A017] flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <div className="py-2">
                    <p className="text-sm font-semibold text-[#333333] dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#D4A017]" /> Curriculum Complete!
                    </p>
                    <p className="text-xs text-[#6B7280] dark:text-[#94A3B8]">
                      End Date: {formatDate(plan.endDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[#E8DCC8] dark:border-[#334155] bg-[#F5F8FC] dark:bg-[#0F172A]/50">
          <p className="text-xs text-[#6B7280] dark:text-[#94A3B8]">
            Created {new Date(plan.createdAt).toLocaleDateString()}
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#1E3A5F] dark:bg-[#D4A017] text-white hover:opacity-90 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
