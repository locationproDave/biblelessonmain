import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useSyncExternalStore, useRef, useCallback } from 'react'
import { seriesStore, type SeriesData } from '@/lib/series-store'
import { lessonStore, type LessonData } from '@/lib/lesson-store'
import { Calendar, BookOpen, Plus, Sparkles, Trash2, Check, X, Search, Pencil, BarChart3, ClipboardList, CheckCircle, FileText } from 'lucide-react'

export const Route = createFileRoute('/series/$seriesId')({
  component: SeriesDetailPage,
})

function SeriesDetailPage() {
  const { seriesId } = Route.useParams()
  const allSeries = useSyncExternalStore(seriesStore.subscribe, seriesStore.getAll)
  const allLessons = useSyncExternalStore(lessonStore.subscribe, lessonStore.getAll)
  const series = allSeries.find(s => s.id === seriesId)

  if (!series) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
          <Calendar className="w-10 h-10 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>Series Not Found</h2>
        <p className="text-stone-500 dark:text-stone-400 mb-6">This series may have been removed or the link is invalid.</p>
        <Link to="/series" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-200">
          ← Back to Series
        </Link>
      </div>
    )
  }

  return <SeriesDetail series={series} allLessons={allLessons} />
}

function SeriesDetail({ series, allLessons }: { series: SeriesData; allLessons: LessonData[] }) {
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline')
  const [editingSummary, setEditingSummary] = useState(false)
  const [summaryDraft, setSummaryDraft] = useState(series.summary)
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(series.name)
  const [showAddLessons, setShowAddLessons] = useState(false)
  const [lessonSearch, setLessonSearch] = useState('')
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const dragItem = useRef<number | null>(null)

  const lessons = series.lessonIds
    .map(id => allLessons.find(l => l.id === id))
    .filter((l): l is LessonData => l !== undefined)

  const availableLessons = allLessons.filter(l => !series.lessonIds.includes(l.id))
  const filteredAvailable = availableLessons.filter(l =>
    lessonSearch === '' ||
    l.title.toLowerCase().includes(lessonSearch.toLowerCase()) ||
    l.passage.toLowerCase().includes(lessonSearch.toLowerCase())
  )

  const completedCount = lessons.filter(l => l.sections.length >= 3).length
  const totalDuration = lessons.reduce((sum, l) => sum + parseInt(l.duration), 0)

  const saveSummary = () => {
    seriesStore.update(series.id, { summary: summaryDraft })
    setEditingSummary(false)
  }

  const saveName = () => {
    if (nameDraft.trim()) {
      seriesStore.update(series.id, { name: nameDraft.trim() })
    }
    setEditingName(false)
  }

  const addLesson = (lessonId: string) => {
    seriesStore.addLesson(series.id, lessonId)
  }

  const removeLesson = (lessonId: string) => {
    seriesStore.removeLesson(series.id, lessonId)
  }

  // Drag and drop handlers
  const handleDragStart = useCallback((index: number) => {
    dragItem.current = index
    setDragIndex(index)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }, [])

  const handleDrop = useCallback((index: number) => {
    if (dragItem.current === null || dragItem.current === index) {
      setDragIndex(null)
      setDragOverIndex(null)
      return
    }
    const newOrder = [...series.lessonIds]
    const [removed] = newOrder.splice(dragItem.current, 1)
    newOrder.splice(index, 0, removed)
    seriesStore.reorderLessons(series.id, newOrder)
    dragItem.current = null
    setDragIndex(null)
    setDragOverIndex(null)
  }, [series.id, series.lessonIds])

  const handleDragEnd = useCallback(() => {
    dragItem.current = null
    setDragIndex(null)
    setDragOverIndex(null)
  }, [])

  // Move up/down for non-drag users
  const moveLesson = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...series.lessonIds]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newOrder.length) return
    ;[newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]]
    seriesStore.reorderLessons(series.id, newOrder)
  }

  const deleteSeries = () => {
    seriesStore.remove(series.id)
  }

  const getLessonStatus = (lesson: LessonData): 'complete' | 'draft' => {
    return lesson.sections.length >= 3 ? 'complete' : 'draft'
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <Link to="/series" className="text-amber-700 dark:text-amber-500 hover:underline font-medium flex items-center gap-1">
          <Calendar className="w-4 h-4" strokeWidth={1.5} /> Series
        </Link>
        <span className="text-stone-400 dark:text-stone-500">/</span>
        <span className="text-stone-600 dark:text-stone-400 truncate">{series.name}</span>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden mb-6 shadow-sm">
        <div className={`h-2 bg-gradient-to-r ${series.color}`} />
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameDraft}
                    onChange={e => setNameDraft(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveName()}
                    autoFocus
                    className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 bg-transparent border-b-2 border-amber-500 focus:outline-none w-full"
                    style={{ fontFamily: 'Crimson Text, serif' }}
                  />
                  <button onClick={saveName} className="p-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors text-sm">
                    <Check className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                  <button onClick={() => { setEditingName(false); setNameDraft(series.name) }} className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors text-sm text-stone-500">
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              ) : (
                <h1
                  onClick={() => setEditingName(true)}
                  className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 cursor-pointer hover:text-amber-700 dark:hover:text-amber-500 transition-colors group flex items-center gap-2"
                  style={{ fontFamily: 'Crimson Text, serif' }}
                >
                  {series.name}
                  <Pencil className="w-4 h-4 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                </h1>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300">{series.ageGroup}</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">{series.theme}</span>
                <span className="text-xs text-stone-400 dark:text-stone-500">Updated {series.updatedAt}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddLessons(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-md shadow-amber-600/20 hover:shadow-lg hover:scale-105 active:scale-100 transition-all duration-200"
              >
                <Plus className="w-4 h-4" strokeWidth={1.5} /> Add Lessons
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2.5 rounded-xl border border-red-200 dark:border-red-800/40 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                title="Delete series"
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Series Summary</span>
              {!editingSummary && (
                <button onClick={() => { setEditingSummary(true); setSummaryDraft(series.summary) }} className="text-xs text-amber-700 dark:text-amber-500 hover:underline">Edit</button>
              )}
            </div>
            {editingSummary ? (
              <div>
                <textarea
                  value={summaryDraft}
                  onChange={e => setSummaryDraft(e.target.value)}
                  rows={3}
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm resize-none"
                />
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={saveSummary} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors">Save</button>
                  <button onClick={() => setEditingSummary(false)} className="px-4 py-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg text-sm transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                {series.summary || <span className="italic text-stone-400">No summary yet. Click Edit to add one.</span>}
              </p>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/30 px-6 sm:px-8 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xl font-bold text-stone-900 dark:text-stone-100">{lessons.length}</p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">Total Lessons</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{completedCount}</p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">Ready</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-amber-600 dark:text-amber-500">{lessons.length - completedCount}</p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">In Draft</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-amber-700 dark:text-amber-500">{totalDuration}m</p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">Total Duration</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100" style={{ fontFamily: 'Crimson Text, serif' }}>Teaching Calendar</h2>
        <div className="flex bg-stone-100 dark:bg-stone-700/50 rounded-lg p-1">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-1 ${
              viewMode === 'timeline' ? 'bg-white dark:bg-stone-800 shadow-sm text-amber-700 dark:text-amber-500' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" strokeWidth={1.5} /> Timeline
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-1 ${
              viewMode === 'list' ? 'bg-white dark:bg-stone-800 shadow-sm text-amber-700 dark:text-amber-500' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" strokeWidth={1.5} /> List
          </button>
        </div>
      </div>

      {/* Lessons */}
      {lessons.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">No lessons in this series yet</h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">Add existing lessons or create new ones to build your curriculum.</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowAddLessons(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} /> Add Lessons
            </button>
            <Link
              to="/generate"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-sm font-semibold hover:border-amber-500 transition-all duration-200"
            >
              <Sparkles className="w-4 h-4" strokeWidth={1.5} /> Create New Lesson
            </Link>
          </div>
        </div>
      ) : viewMode === 'timeline' ? (
        <TimelineView
          lessons={lessons}
          series={series}
          getLessonStatus={getLessonStatus}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          dragIndex={dragIndex}
          dragOverIndex={dragOverIndex}
          onRemove={removeLesson}
          onMove={moveLesson}
        />
      ) : (
        <ListView
          lessons={lessons}
          series={series}
          getLessonStatus={getLessonStatus}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          dragIndex={dragIndex}
          dragOverIndex={dragOverIndex}
          onRemove={removeLesson}
          onMove={moveLesson}
        />
      )}

      {/* Add Lessons Modal */}
      {showAddLessons && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddLessons(false)} />
          <div className="relative w-full max-w-lg max-h-[80vh] overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Add Lessons to Series
                </h2>
                <button onClick={() => setShowAddLessons(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={lessonSearch}
                  onChange={e => setLessonSearch(e.target.value)}
                  placeholder="Search available lessons..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#D4A017] focus:border-transparent text-sm"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/50">
              {filteredAvailable.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {availableLessons.length === 0
                      ? 'All lessons are already in this series!'
                      : 'No lessons match your search.'}
                  </p>
                </div>
              ) : (
                filteredAvailable.map(lesson => (
                  <div key={lesson.id} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className={`w-1 h-10 rounded-full bg-gradient-to-b ${lesson.gradient} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{lesson.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> {lesson.passage} · {lesson.ageGroup} · {lesson.duration}
                      </p>
                    </div>
                    <button
                      onClick={() => addLesson(lesson.id)}
                      className="flex-shrink-0 px-3 py-1.5 bg-[#EBF5FF] dark:bg-[#1E3A5F]/30 text-[#2563EB] dark:text-[#D4A017] rounded-lg text-xs font-bold hover:bg-[#DBEAFE] dark:hover:bg-[#1E3A5F]/50 transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowAddLessons(false)}
                className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Series?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              This will delete the series "{series.name}" but will not delete the individual lessons.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <Link
                to="/series"
                onClick={deleteSeries}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors text-center"
              >
                Delete
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface LessonViewProps {
  lessons: LessonData[]
  series: SeriesData
  getLessonStatus: (l: LessonData) => 'complete' | 'draft'
  onDragStart: (index: number) => void
  onDragOver: (e: React.DragEvent, index: number) => void
  onDrop: (index: number) => void
  onDragEnd: () => void
  dragIndex: number | null
  dragOverIndex: number | null
  onRemove: (id: string) => void
  onMove: (index: number, direction: 'up' | 'down') => void
}

function TimelineView({ lessons, series, getLessonStatus, onDragStart, onDragOver, onDrop, onDragEnd, dragIndex, dragOverIndex, onRemove, onMove }: LessonViewProps) {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

      <div className="space-y-0">
        {lessons.map((lesson, index) => {
          const status = getLessonStatus(lesson)
          const isComplete = status === 'complete'
          const isDragging = dragIndex === index
          const isDragOver = dragOverIndex === index

          return (
            <div
              key={lesson.id}
              draggable
              onDragStart={() => onDragStart(index)}
              onDragOver={(e) => onDragOver(e, index)}
              onDrop={() => onDrop(index)}
              onDragEnd={onDragEnd}
              className={`relative flex items-start gap-4 sm:gap-6 py-4 transition-all duration-200 ${
                isDragging ? 'opacity-40 scale-[0.98]' : ''
              } ${isDragOver ? 'translate-y-1' : ''}`}
            >
              {/* Drop indicator */}
              {isDragOver && dragIndex !== index && (
                <div className="absolute -top-0.5 left-12 sm:left-16 right-0 h-0.5 bg-[#D4A017] rounded-full z-10">
                  <div className="absolute -left-1.5 -top-1 w-3 h-3 rounded-full bg-[#D4A017]" />
                </div>
              )}

              {/* Timeline node */}
              <div className="relative z-10 flex-shrink-0 w-12 sm:w-16 flex flex-col items-center">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-sm font-extrabold shadow-md transition-all duration-200 ${
                  isComplete
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white'
                    : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                }`}>
                  {isComplete ? <Check className="w-5 h-5" /> : index + 1}
                </div>
                <span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Wk {index + 1}
                </span>
              </div>

              {/* Lesson card */}
              <div className={`flex-1 group bg-white dark:bg-gray-800/50 rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing hover:shadow-md ${
                isComplete
                  ? 'border-green-200/60 dark:border-green-800/30'
                  : 'border-amber-200/60 dark:border-amber-800/30'
              } ${isDragOver && dragIndex !== index ? 'border-[#D4A017] shadow-md' : 'border-gray-200/80 dark:border-gray-700/50'}`}>
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          isComplete
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                        }`}>
                          {isComplete ? <><CheckCircle className="w-3 h-3" /> Ready</> : <><FileText className="w-3 h-3" /> Draft</>}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">{lesson.duration}</span>
                      </div>
                      <Link
                        to="/lesson/$lessonId"
                        params={{ lessonId: lesson.id }}
                        className="text-sm sm:text-base font-bold text-gray-900 dark:text-white hover:text-[#2563EB] dark:hover:text-[#93C5FD] transition-colors"
                        onClick={e => e.stopPropagation()}
                      >
                        {lesson.title}
                      </Link>
                      <p className="text-xs text-[#2563EB] dark:text-[#93C5FD] font-medium mt-0.5 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> {lesson.passage}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{lesson.description}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => onMove(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move up"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                      </button>
                      <button
                        onClick={() => onMove(index, 'down')}
                        disabled={index === lessons.length - 1}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move down"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      <button
                        onClick={() => onRemove(lesson.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove from series"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{lesson.ageGroup}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">{lesson.theme}</span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">{lesson.sections.length} sections</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Drag hint */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-500 italic">
          ↕️ Drag lessons to reorder, or use the arrow buttons
        </p>
      </div>
    </div>
  )
}

function ListView({ lessons, series, getLessonStatus, onDragStart, onDragOver, onDrop, onDragEnd, dragIndex, dragOverIndex, onRemove, onMove }: LessonViewProps) {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden shadow-sm">
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-4 px-5 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        <span className="w-8">#</span>
        <span>Lesson</span>
        <span className="hidden sm:block">Duration</span>
        <span>Status</span>
        <span className="w-20">Actions</span>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
        {lessons.map((lesson, index) => {
          const status = getLessonStatus(lesson)
          const isComplete = status === 'complete'
          const isDragging = dragIndex === index
          const isDragOver = dragOverIndex === index

          return (
            <div
              key={lesson.id}
              draggable
              onDragStart={() => onDragStart(index)}
              onDragOver={(e) => onDragOver(e, index)}
              onDrop={() => onDrop(index)}
              onDragEnd={onDragEnd}
              className={`grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-4 items-center px-5 py-3.5 cursor-grab active:cursor-grabbing transition-all duration-200 group ${
                isDragging ? 'opacity-40 bg-gray-50 dark:bg-gray-800' : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
              } ${isDragOver && dragIndex !== index ? 'border-t-2 border-t-[#4A90E2]' : ''}`}
            >
              <span className="w-8 text-sm font-extrabold text-gray-400 dark:text-gray-500">{index + 1}</span>
              <div className="min-w-0">
                <Link
                  to="/lesson/$lessonId"
                  params={{ lessonId: lesson.id }}
                  className="text-sm font-bold text-gray-900 dark:text-white hover:text-[#2563EB] dark:hover:text-[#93C5FD] transition-colors truncate block"
                  onClick={e => e.stopPropagation()}
                >
                  {lesson.title}
                </Link>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> {lesson.passage} · {lesson.theme}
                </p>
              </div>
              <span className="hidden sm:block text-xs font-medium text-gray-500 dark:text-gray-400">{lesson.duration}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 ${
                isComplete
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
              }`}>
                {isComplete ? <><CheckCircle className="w-3 h-3" /> Ready</> : <><FileText className="w-3 h-3" /> Draft</>}
              </span>
              <div className="w-20 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onMove(index, 'up')} disabled={index === 0} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 disabled:opacity-30 transition-colors">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                </button>
                <button onClick={() => onMove(index, 'down')} disabled={index === lessons.length - 1} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 disabled:opacity-30 transition-colors">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <button onClick={() => onRemove(lesson.id)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/10 text-gray-400 hover:text-red-500 transition-colors">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-500 italic">↕️ Drag rows to reorder your teaching calendar</p>
      </div>
    </div>
  )
}
