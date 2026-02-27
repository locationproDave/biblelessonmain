import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useSyncExternalStore } from 'react'
import { lessonStore, type LessonData } from '@/lib/lesson-store'
import { useI18n } from '@/i18n'
import { useQuery } from '@tanstack/react-query'
import { teamAPI } from '@/lib/api'
import { useSession } from '@/lib/auth-client'
import { Sparkles, BookOpen, Star, Users, ClipboardList, Search, LayoutGrid, LayoutList, X, Clock, Heart, Calendar, Trash2, Download, CheckSquare, Square, Filter, ChevronDown } from 'lucide-react'

export const Route = createFileRoute('/lessons')({
  component: LessonsPage,
})

const ageFilters = ['All', 'Preschool (3-5)', 'Elementary (6-10)', 'Pre-Teen (11-13)', 'Teen (14-17)', 'Adult']
const themeFilters = ['All Themes', 'Compassion & Kindness', 'Courage & Faith', 'Forgiveness & Grace', 'God as Creator', 'Character & Growth', 'Obedience & Trust', 'Spiritual Warfare', 'God\'s Provision']

// Advanced filters
const dateRangeFilters = [
  { id: 'all', label: 'All Time' },
  { id: '7days', label: 'Last 7 Days' },
  { id: '30days', label: 'Last 30 Days' },
  { id: '3months', label: 'Last 3 Months' },
]

const durationFilters = [
  { id: 'all', label: 'Any Duration' },
  { id: 'short', label: 'Short (< 30 min)' },
  { id: 'medium', label: 'Medium (30-45 min)' },
  { id: 'long', label: 'Long (> 45 min)' },
]

const scriptureFilters = [
  { id: 'all', label: 'All Books' },
  { id: 'ot', label: 'Old Testament' },
  { id: 'nt', label: 'New Testament' },
  { id: 'gospels', label: 'Gospels' },
  { id: 'psalms', label: 'Psalms' },
]

// Helper to check if scripture is OT, NT, etc
const OLD_TESTAMENT_BOOKS = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalm', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi']
const GOSPELS = ['Matthew', 'Mark', 'Luke', 'John']

const getScriptureBook = (passage: string): string => {
  const match = passage.match(/^(\d?\s*[A-Za-z]+)/)
  return match ? match[1].trim() : ''
}

const matchesScriptureFilter = (passage: string, filter: string): boolean => {
  if (filter === 'all') return true
  const book = getScriptureBook(passage)
  if (filter === 'ot') return OLD_TESTAMENT_BOOKS.some(b => book.toLowerCase().startsWith(b.toLowerCase()))
  if (filter === 'nt') return !OLD_TESTAMENT_BOOKS.some(b => book.toLowerCase().startsWith(b.toLowerCase()))
  if (filter === 'gospels') return GOSPELS.some(g => book.toLowerCase().startsWith(g.toLowerCase()))
  if (filter === 'psalms') return book.toLowerCase().startsWith('psalm')
  return true
}

const matchesDurationFilter = (duration: string, filter: string): boolean => {
  if (filter === 'all') return true
  const mins = parseInt(duration) || 0
  if (filter === 'short') return mins < 30
  if (filter === 'medium') return mins >= 30 && mins <= 45
  if (filter === 'long') return mins > 45
  return true
}

const matchesDateFilter = (createdAt: string, filter: string): boolean => {
  if (filter === 'all') return true
  const now = new Date()
  const lessonDate = new Date(createdAt)
  if (isNaN(lessonDate.getTime())) return true // If date can't be parsed, include it
  
  const daysDiff = Math.floor((now.getTime() - lessonDate.getTime()) / (1000 * 60 * 60 * 24))
  if (filter === '7days') return daysDiff <= 7
  if (filter === '30days') return daysDiff <= 30
  if (filter === '3months') return daysDiff <= 90
  return true
}

function LessonsPage() {
  const { t } = useI18n()
  const { data: session } = useSession()
  const { data: myRole } = useQuery({
    queryKey: ['my-teams'],
    queryFn: teamAPI.getMyTeams,
    enabled: !!session,
  })
  const canEdit = true
  const allLessons = useSyncExternalStore(lessonStore.subscribe, lessonStore.getAll)
  const [searchQuery, setSearchQuery] = useState('')
  const [ageFilter, setAgeFilter] = useState('All')
  const [themeFilter, setThemeFilter] = useState('All Themes')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'duration'>('recent')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  
  // Advanced filters
  const [dateFilter, setDateFilter] = useState('all')
  const [durationFilter, setDurationFilter] = useState('all')
  const [scriptureFilter, setScriptureFilter] = useState('all')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  
  // Bulk operations
  const [selectedLessons, setSelectedLessons] = useState<Set<string>>(new Set())
  const [bulkMode, setBulkMode] = useState(false)

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    lessonStore.toggleFavorite(id)
  }
  
  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedLessons(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }
  
  const selectAll = () => {
    setSelectedLessons(new Set(filtered.map(l => l.id)))
  }
  
  const deselectAll = () => {
    setSelectedLessons(new Set())
  }
  
  const deleteSelected = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedLessons.size} lesson(s)?`)) {
      selectedLessons.forEach(id => lessonStore.delete(id))
      setSelectedLessons(new Set())
      setBulkMode(false)
    }
  }
  
  const exportSelected = () => {
    const lessonsToExport = allLessons.filter(l => selectedLessons.has(l.id))
    const dataStr = JSON.stringify(lessonsToExport, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `lessons-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const filtered = allLessons
    .filter((lesson: LessonData) => {
      const matchesSearch = searchQuery === '' ||
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.passage.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesAge = ageFilter === 'All' || lesson.ageGroup === ageFilter
      const matchesTheme = themeFilter === 'All Themes' || lesson.theme === themeFilter
      const matchesFav = !showFavoritesOnly || lesson.favorite
      const matchesDate = matchesDateFilter(lesson.createdAt, dateFilter)
      const matchesDuration = matchesDurationFilter(lesson.duration, durationFilter)
      const matchesScripture = matchesScriptureFilter(lesson.passage, scriptureFilter)
      return matchesSearch && matchesAge && matchesTheme && matchesFav && matchesDate && matchesDuration && matchesScripture
    })
    .sort((a: LessonData, b: LessonData) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      if (sortBy === 'duration') return parseInt(a.duration) - parseInt(b.duration)
      return 0
    })

  const basicFilterCount = (ageFilter !== 'All' ? 1 : 0) + (themeFilter !== 'All Themes' ? 1 : 0) + (showFavoritesOnly ? 1 : 0)
  const advancedFilterCount = (dateFilter !== 'all' ? 1 : 0) + (durationFilter !== 'all' ? 1 : 0) + (scriptureFilter !== 'all' ? 1 : 0)
  const activeFilterCount = basicFilterCount + advancedFilterCount
  const stats = lessonStore.getStats()

  return (
    <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Text, serif' }}>
              {t('lessons.title')}
            </h1>
            <p className="mt-1 text-base text-stone-500 dark:text-stone-400">
              {t('lessons.count', { count: String(filtered.length), s: filtered.length !== 1 ? 's' : '' })}
              {activeFilterCount > 0 && (
                <span className="ml-2 text-amber-700 dark:text-amber-500 font-medium">
                  ({t('lessons.filtersActive', { count: String(activeFilterCount), s: activeFilterCount !== 1 ? 's' : '' })})
                </span>
              )}
            </p>
          </div>
          {canEdit && (
            <Link
              to="/generate"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-100 transition-all duration-200"
              data-testid="create-lesson-btn"
            >
              <Sparkles className="w-5 h-5" strokeWidth={1.5} /> {t('lessons.newLesson')}
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: t('lessons.totalLessons'), value: stats.total, icon: <BookOpen className="w-5 h-5 text-amber-600" strokeWidth={1.5} />, color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40' },
            { label: t('lessons.favorites'), value: stats.favorites, icon: <Star className="w-5 h-5 text-amber-500" strokeWidth={1.5} />, color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40' },
            { label: t('lessons.ageGroups'), value: stats.ageGroups, icon: <Users className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />, color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40' },
            { label: t('lessons.totalSections'), value: stats.totalSections, icon: <ClipboardList className="w-5 h-5 text-purple-600" strokeWidth={1.5} />, color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/40' },
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
        
        {/* Bulk Operations Toolbar */}
        {bulkMode && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-amber-700 dark:text-amber-400 font-semibold">
                {selectedLessons.size} of {filtered.length} selected
              </span>
              <button
                onClick={selectAll}
                className="text-sm font-medium text-amber-600 dark:text-amber-500 hover:underline"
                data-testid="select-all-btn"
              >
                Select All
              </button>
              <button
                onClick={deselectAll}
                className="text-sm font-medium text-stone-500 hover:underline"
                data-testid="deselect-all-btn"
              >
                Deselect All
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportSelected}
                disabled={selectedLessons.size === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-medium hover:border-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                data-testid="export-selected-btn"
              >
                <Download className="w-4 h-4" strokeWidth={1.5} /> Export Selected
              </button>
              <button
                onClick={deleteSelected}
                disabled={selectedLessons.size === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 font-medium hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                data-testid="delete-selected-btn"
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.5} /> Delete Selected
              </button>
              <button
                onClick={() => { setBulkMode(false); setSelectedLessons(new Set()) }}
                className="px-4 py-2 rounded-lg text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-white dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 p-5 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"><Search className="w-5 h-5" strokeWidth={1.5} /></span>
              <input
                type="text"
                placeholder={t('lessons.search')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-base"
                data-testid="search-input"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                <option value="recent">{t('lessons.mostRecent')}</option>
                <option value="title">{t('lessons.azTitle')}</option>
              </select>
              <button onClick={() => setShowFavoritesOnly(!showFavoritesOnly)} className={`p-3 rounded-xl border transition-all duration-200 ${showFavoritesOnly ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-600' : 'border-stone-200 dark:border-stone-700 text-stone-400 hover:text-amber-600 hover:border-amber-400'}`} data-testid="favorites-filter-btn">
                <Star className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <button 
                onClick={() => setBulkMode(!bulkMode)} 
                className={`p-3 rounded-xl border transition-all duration-200 ${bulkMode ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-600' : 'border-stone-200 dark:border-stone-700 text-stone-400 hover:text-amber-600 hover:border-amber-400'}`} 
                data-testid="bulk-mode-btn"
                title="Bulk Operations"
              >
                <CheckSquare className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <div className="flex bg-stone-100 dark:bg-stone-700/50 rounded-xl p-1">
                <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-white dark:bg-stone-800 shadow-sm text-amber-600' : 'text-stone-400 hover:text-stone-600'}`} data-testid="grid-view-btn">
                  <LayoutGrid className="w-5 h-5" strokeWidth={1.5} />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-white dark:bg-stone-800 shadow-sm text-amber-600' : 'text-stone-400 hover:text-stone-600'}`} data-testid="list-view-btn">
                  <LayoutList className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Filter Pills */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide w-12 flex-shrink-0">Age</span>
              {ageFilters.map(filter => (
                <button key={filter} onClick={() => setAgeFilter(filter)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${ageFilter === filter ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700' : 'text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:border-amber-400'}`}>
                  {filter}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide w-12 flex-shrink-0">Topic</span>
              <select value={themeFilter} onChange={e => setThemeFilter(e.target.value)} className="px-3 py-2 rounded-lg text-sm font-medium border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                {themeFilters.map(tf => <option key={tf} value={tf}>{tf === 'All Themes' ? t('lessons.allThemes') : tf}</option>)}
              </select>
              <button 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} 
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${showAdvancedFilters || advancedFilterCount > 0 ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400' : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-purple-400'}`}
                data-testid="advanced-filters-btn"
              >
                <Filter className="w-4 h-4" strokeWidth={1.5} />
                Advanced
                {advancedFilterCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-purple-600 text-white text-xs">{advancedFilterCount}</span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} strokeWidth={1.5} />
              </button>
              {activeFilterCount > 0 && (
                <button onClick={() => { setAgeFilter('All'); setThemeFilter('All Themes'); setShowFavoritesOnly(false); setSearchQuery(''); setDateFilter('all'); setDurationFilter('all'); setScriptureFilter('all') }} className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all flex items-center gap-1">
                  <X className="w-4 h-4" strokeWidth={1.5} /> {t('lessons.clearFilters')}
                </button>
              )}
            </div>
            
            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <div className="pt-3 mt-3 border-t border-stone-200 dark:border-stone-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-2">Date Created</label>
                  <select 
                    value={dateFilter} 
                    onChange={e => setDateFilter(e.target.value)} 
                    className="w-full px-3 py-2.5 rounded-lg text-sm border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    data-testid="date-filter"
                  >
                    {dateRangeFilters.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-2">Duration</label>
                  <select 
                    value={durationFilter} 
                    onChange={e => setDurationFilter(e.target.value)} 
                    className="w-full px-3 py-2.5 rounded-lg text-sm border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    data-testid="duration-filter"
                  >
                    {durationFilters.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-2">Scripture</label>
                  <select 
                    value={scriptureFilter} 
                    onChange={e => setScriptureFilter(e.target.value)} 
                    className="w-full px-3 py-2.5 rounded-lg text-sm border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    data-testid="scripture-filter"
                  >
                    {scriptureFilters.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Empty State */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-stone-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-50 mb-2">{t('lessons.noLessons')}</h3>
            <p className="text-base text-stone-500 dark:text-stone-400 mb-6 max-w-md mx-auto">
              {searchQuery || ageFilter !== 'All' || themeFilter !== 'All Themes' || showFavoritesOnly ? t('lessons.noLessonsDesc') : t('lessons.noLessonsEmpty')}
            </p>
            {activeFilterCount > 0 && (
              <button onClick={() => { setAgeFilter('All'); setThemeFilter('All Themes'); setShowFavoritesOnly(false); setSearchQuery('') }} className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 rounded-xl font-semibold border border-stone-200 dark:border-stone-700 hover:border-amber-400 hover:shadow-md transition-all duration-200 mr-3">
                {t('lessons.clearFilters')}
              </button>
            )}
            {canEdit && (
              <Link to="/generate" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-200">
                <Sparkles className="w-5 h-5" strokeWidth={1.5} /> {t('lessons.createLesson')}
              </Link>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View - New Card Design */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((lesson: LessonData) => (
              <Link 
                key={lesson.id} 
                to="/lesson/$lessonId" 
                params={{ lessonId: lesson.id }} 
                className={`group relative bg-white dark:bg-stone-800 rounded-xl border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden ${selectedLessons.has(lesson.id) ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-stone-200 dark:border-stone-700 hover:border-amber-400/50'}`}
                data-testid={`lesson-card-${lesson.id}`}
                onClick={bulkMode ? (e) => toggleSelect(lesson.id, e) : undefined}
              >
                {/* Bulk Selection Checkbox */}
                {bulkMode && (
                  <button 
                    onClick={(e) => toggleSelect(lesson.id, e)}
                    className="absolute top-3 left-3 z-10 w-8 h-8 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center shadow-sm hover:border-amber-400 transition-all"
                    data-testid={`select-checkbox-${lesson.id}`}
                  >
                    {selectedLessons.has(lesson.id) ? (
                      <CheckSquare className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
                    ) : (
                      <Square className="w-5 h-5 text-stone-400" strokeWidth={1.5} />
                    )}
                  </button>
                )}
                
                {/* Card Content */}
                <div className={`p-6 ${bulkMode ? 'pl-14' : ''}`}>
                  {/* Header: Title + Favorite */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 
                      className="text-xl font-semibold text-stone-900 dark:text-stone-100 leading-tight group-hover:text-amber-700 dark:group-hover:text-amber-500 transition-colors"
                      style={{ fontFamily: 'Crimson Text, serif' }}
                    >
                      {lesson.title}
                    </h3>
                    <button 
                      onClick={(e) => toggleFavorite(lesson.id, e)} 
                      className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${lesson.favorite ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-500' : 'bg-stone-100 dark:bg-stone-700/50 text-stone-300 dark:text-stone-600 opacity-0 group-hover:opacity-100 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30'}`}
                      data-testid={`favorite-btn-${lesson.id}`}
                    >
                      <Star className={`w-5 h-5 ${lesson.favorite ? 'fill-current' : ''}`} strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Scripture Passage */}
                  <p className="text-base font-medium text-amber-700 dark:text-amber-500 mb-3 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" strokeWidth={1.5} /> {lesson.passage}
                  </p>

                  {/* Description */}
                  <p className="text-base text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed mb-4">
                    {lesson.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" strokeWidth={1.5} /> {lesson.ageGroup}
                    </span>
                    <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" strokeWidth={1.5} /> {lesson.duration}
                    </span>
                    <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5" strokeWidth={1.5} /> {lesson.theme}
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-700">
                    <div className="flex items-center gap-2 text-sm text-stone-400 dark:text-stone-500 font-medium">
                      <Calendar className="w-4 h-4" strokeWidth={1.5} />
                      <span>{lesson.createdAt}</span>
                      <span className="text-stone-300 dark:text-stone-600">·</span>
                      <span>{lesson.sections.length} {t('lessons.sections')}</span>
                    </div>
                    <span className="text-sm text-amber-600 dark:text-amber-500 font-semibold opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                      {t('lessons.view')} →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            
            {/* Create New Card */}
            {canEdit && (
              <Link 
                to="/generate" 
                className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-600 bg-stone-50/50 dark:bg-stone-800/20 p-8 transition-all duration-300 hover:shadow-lg min-h-[320px]"
                data-testid="create-new-lesson-card"
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-8 h-8 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
                </div>
                <p className="text-lg font-bold text-stone-700 dark:text-stone-300 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors mb-2">{t('lessons.createNew')}</p>
                <p className="text-base text-stone-500 dark:text-stone-400 text-center">{t('lessons.createNewDesc')}</p>
              </Link>
            )}
          </div>
        ) : (
          /* List View - Updated Design */
          <div className="space-y-3">
            {filtered.map((lesson: LessonData) => (
              <Link 
                key={lesson.id} 
                to="/lesson/$lessonId" 
                params={{ lessonId: lesson.id }} 
                className={`group flex items-center gap-4 p-5 rounded-xl bg-white dark:bg-stone-800 border transition-all duration-200 ${selectedLessons.has(lesson.id) ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-stone-200 dark:border-stone-700 hover:shadow-md hover:border-amber-400/50'}`}
                data-testid={`lesson-list-item-${lesson.id}`}
                onClick={bulkMode ? (e) => toggleSelect(lesson.id, e) : undefined}
              >
                {/* Bulk Selection Checkbox */}
                {bulkMode && (
                  <button 
                    onClick={(e) => toggleSelect(lesson.id, e)}
                    className="w-10 h-10 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center justify-center flex-shrink-0 hover:border-amber-400 transition-all"
                  >
                    {selectedLessons.has(lesson.id) ? (
                      <CheckSquare className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
                    ) : (
                      <Square className="w-5 h-5 text-stone-400" strokeWidth={1.5} />
                    )}
                  </button>
                )}
                
                {/* Lesson Icon */}
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-500 transition-colors truncate" style={{ fontFamily: 'Crimson Text, serif' }}>
                      {lesson.title}
                    </h3>
                    {lesson.favorite && <Star className="w-4 h-4 text-amber-500 fill-current flex-shrink-0" strokeWidth={1.5} />}
                  </div>
                  <p className="text-base text-amber-700 dark:text-amber-500 font-medium mt-0.5 flex items-center gap-1">
                    <BookOpen className="w-4 h-4" strokeWidth={1.5} /> {lesson.passage} · {lesson.theme}
                  </p>
                  <p className="text-base text-stone-500 dark:text-stone-400 mt-1 truncate">{lesson.description}</p>
                </div>
                
                {/* Meta Info */}
                <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-medium px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300">{lesson.ageGroup}</span>
                  <span className="text-sm font-medium px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">{lesson.duration}</span>
                  <span className="text-sm text-stone-400 dark:text-stone-500 w-24 text-right">{lesson.createdAt}</span>
                </div>
                
                {/* Favorite Button */}
                <button 
                  onClick={(e) => toggleFavorite(lesson.id, e)} 
                  className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${lesson.favorite ? 'text-amber-500' : 'text-stone-300 dark:text-stone-600 opacity-0 group-hover:opacity-100 hover:text-amber-500'}`}
                >
                  <Star className={`w-5 h-5 ${lesson.favorite ? 'fill-current' : ''}`} strokeWidth={1.5} />
                </button>
                
                {/* Arrow */}
                <span className="text-stone-300 dark:text-stone-600 group-hover:text-amber-600 transition-colors text-lg flex-shrink-0">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
