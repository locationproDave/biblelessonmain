import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useSyncExternalStore, useEffect } from 'react'
import { seriesStore, type SeriesData } from '@/lib/series-store'
import { lessonStore } from '@/lib/lesson-store'
import { Calendar, BookOpen, Palette, Plus, Search, X, Check, ChevronRight, Layers, Loader2 } from 'lucide-react'

export const Route = createFileRoute('/series/')({
  component: SeriesIndexPage,
})

const themeOptions = ['All Themes', 'Compassion & Kindness', 'Courage & Faith', 'Forgiveness & Grace', 'God as Creator', 'Character & Growth', 'Obedience & Trust', 'Spiritual Warfare', 'God\'s Provision']

function SeriesIndexPage() {
  const allSeries = useSyncExternalStore(seriesStore.subscribe, seriesStore.getAll)
  const [searchQuery, setSearchQuery] = useState('')
  const [themeFilter, setThemeFilter] = useState('All Themes')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [stats, setStats] = useState({ total: 0, totalLessons: 0, themes: 0 })
  
  useEffect(() => {
    seriesStore.getStats().then(setStats)
  }, [allSeries])

  const filtered = allSeries.filter((s: SeriesData) => {
    const matchesSearch = searchQuery === '' ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.theme.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTheme = themeFilter === 'All Themes' || s.theme === themeFilter
    return matchesSearch && matchesTheme
  })

  return (
    <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Text, serif' }}>
              Curriculum Series
            </h1>
            <p className="mt-2 text-base text-stone-500 dark:text-stone-400">
              Organize your lessons into themed teaching series
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-100 transition-all duration-200"
            data-testid="new-series-btn"
          >
            <Plus className="w-5 h-5" strokeWidth={1.5} /> New Series
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Series', value: stats.total, icon: <Calendar className="w-5 h-5 text-amber-600" strokeWidth={1.5} />, color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40' },
            { label: 'Lessons Organized', value: stats.totalLessons, icon: <BookOpen className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />, color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40' },
            { label: 'Unique Themes', value: stats.themes, icon: <Palette className="w-5 h-5 text-purple-600" strokeWidth={1.5} />, color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/40' },
          ].map((stat, i) => (
            <div key={i} className={`rounded-xl border p-4 ${stat.color}`}>
              <div className="flex items-center gap-3">
                {stat.icon}
                <div>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-50">{stat.value}</p>
                  <p className="text-sm text-stone-500 dark:text-stone-400">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="bg-white dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 p-5 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search series by name, theme, or description..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-base"
                data-testid="search-input"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              )}
            </div>
            <select
              value={themeFilter}
              onChange={e => setThemeFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              {themeOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Series Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
              <Calendar className="w-10 h-10 text-stone-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-50 mb-2">No Series Found</h3>
            <p className="text-base text-stone-500 dark:text-stone-400 mb-6 max-w-md mx-auto">
              {searchQuery || themeFilter !== 'All Themes' ? 'Try adjusting your filters.' : 'Create your first series to organize your lessons.'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="w-5 h-5" strokeWidth={1.5} /> Create Series
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((series: SeriesData) => (
              <Link
                key={series.id}
                to="/series/$seriesId"
                params={{ seriesId: series.id }}
                className="group relative bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-amber-400/50 transition-all duration-300 overflow-hidden"
                data-testid={`series-card-${series.id}`}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 
                      className="text-xl font-semibold text-stone-900 dark:text-stone-100 leading-tight group-hover:text-amber-700 dark:group-hover:text-amber-500 transition-colors"
                      style={{ fontFamily: 'Crimson Text, serif' }}
                    >
                      {series.name}
                    </h3>
                    <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                      <Layers className="w-5 h-5 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-base text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed mb-4">
                    {series.summary}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 flex items-center gap-1">
                      <Palette className="w-3.5 h-3.5" strokeWidth={1.5} /> {series.theme}
                    </span>
                    <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" strokeWidth={1.5} /> {series.lessonIds.length} lessons
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-700">
                    <div className="flex items-center gap-2 text-sm text-stone-400 dark:text-stone-500 font-medium">
                      <Calendar className="w-4 h-4" strokeWidth={1.5} />
                      <span>{new Date(series.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <span className="text-sm text-amber-600 dark:text-amber-500 font-semibold opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 flex items-center gap-1">
                      View <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {/* Create New Card */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-600 bg-stone-50/50 dark:bg-stone-800/20 p-8 transition-all duration-300 hover:shadow-lg min-h-[280px]"
              data-testid="create-new-series-card"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-8 h-8 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
              </div>
              <p className="text-lg font-bold text-stone-700 dark:text-stone-300 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors mb-2">Create New Series</p>
              <p className="text-base text-stone-500 dark:text-stone-400 text-center">Organize lessons into a themed curriculum</p>
            </button>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <CreateSeriesModal onClose={() => setShowCreateModal(false)} />
        )}
      </div>
    </div>
  )
}

function CreateSeriesModal({ onClose }: { onClose: () => void }) {
  const allLessons = lessonStore.getAll()
  const [name, setName] = useState('')
  const [summary, setSummary] = useState('')
  const [theme, setTheme] = useState(themeOptions[1])
  const [selectedLessons, setSelectedLessons] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || isSubmitting) return
    
    setIsSubmitting(true)
    try {
      await seriesStore.create({
        name,
        summary,
        theme,
        lessonIds: selectedLessons,
        ageGroup: 'All Ages',
      })
      onClose()
    } catch (error) {
      console.error('Failed to create series:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleLesson = (id: string) => {
    setSelectedLessons(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id])
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-stone-800 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-stone-200 dark:border-stone-700">
          <h3 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" strokeWidth={1.5} /> Create New Series
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors">
            <X className="w-5 h-5 text-stone-500" strokeWidth={1.5} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div>
            <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Series Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Parables of Jesus"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Summary</label>
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Brief description of this series..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Theme</label>
            <select
              value={theme}
              onChange={e => setTheme(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base"
            >
              {themeOptions.filter(t => t !== 'All Themes').map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Add Lessons ({selectedLessons.length} selected)</label>
            <div className="max-h-40 overflow-y-auto border border-stone-200 dark:border-stone-700 rounded-xl divide-y divide-stone-100 dark:divide-stone-700">
              {allLessons.length === 0 ? (
                <p className="p-4 text-sm text-stone-500 dark:text-stone-400 text-center">No lessons available. Create lessons first.</p>
              ) : allLessons.map(lesson => (
                <label key={lesson.id} className="flex items-center gap-3 p-3 hover:bg-stone-50 dark:hover:bg-stone-700/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedLessons.includes(lesson.id)}
                    onChange={() => toggleLesson(lesson.id)}
                    className="w-4 h-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="flex-1 text-sm text-stone-700 dark:text-stone-300 truncate">{lesson.title}</span>
                  <span className="text-xs text-stone-400">{lesson.passage}</span>
                </label>
              ))}
            </div>
          </div>
        </form>
        
        <div className="flex items-center justify-end gap-3 p-5 border-t border-stone-200 dark:border-stone-700">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name || isSubmitting}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Creating...' : 'Create Series'}
          </button>
        </div>
      </div>
    </div>
  )
}
