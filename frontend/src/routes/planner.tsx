import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useCallback, useRef } from 'react'
import { lessonStore, type LessonData } from '@/lib/lesson-store'
import { seriesStore } from '@/lib/series-store'
import {
  plannerStore,
  type ScheduledLesson,
  getMonthDays,
  getWeekDays,
  toDateString,
  isToday,
  isSunday,
  MONTH_NAMES,
  DAY_NAMES,
  DAY_NAMES_FULL,
} from '@/lib/planner-store'
import { Calendar, BookOpen, ClipboardList, CheckCircle, Clock, Sparkles, BookMarked, XCircle, Save, Trash2, Pencil, Check } from 'lucide-react'

type ViewMode = 'month' | 'week'

function PlannerPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [schedules, setSchedules] = useState(plannerStore.getAllSchedules())
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<ScheduledLesson | null>(null)
  const [draggedSchedule, setDraggedSchedule] = useState<string | null>(null)
  const [dragOverDate, setDragOverDate] = useState<string | null>(null)

  useEffect(() => {
    const unsub = plannerStore.subscribe(() => {
      setSchedules([...plannerStore.getAllSchedules()])
    })
    return unsub
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const navigatePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1))
    } else {
      const d = new Date(currentDate)
      d.setDate(d.getDate() - 7)
      setCurrentDate(d)
    }
  }

  const navigateNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1))
    } else {
      const d = new Date(currentDate)
      d.setDate(d.getDate() + 7)
      setCurrentDate(d)
    }
  }

  const goToToday = () => setCurrentDate(new Date())

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr)
    setEditingSchedule(null)
    setShowScheduleModal(true)
  }

  const handleScheduleClick = (sched: ScheduledLesson, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedDate(sched.date)
    setEditingSchedule(sched)
    setShowScheduleModal(true)
  }

  // Drag and drop
  const handleDragStart = (schedId: string) => {
    setDraggedSchedule(schedId)
  }

  const handleDragOver = (dateStr: string, e: React.DragEvent) => {
    e.preventDefault()
    setDragOverDate(dateStr)
  }

  const handleDrop = (dateStr: string) => {
    if (draggedSchedule) {
      plannerStore.moveSchedule(draggedSchedule, dateStr)
    }
    setDraggedSchedule(null)
    setDragOverDate(null)
  }

  const handleDragEnd = () => {
    setDraggedSchedule(null)
    setDragOverDate(null)
  }

  const stats = plannerStore.getStats()

  return (
    <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917]">
      {/* Header - Sunday Morning Style */}
      <div className="bg-white dark:bg-stone-800/30 border-b border-stone-200 dark:border-stone-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-3" style={{ fontFamily: 'Crimson Text, serif' }}>
                <Calendar className="w-8 h-8 text-amber-600 dark:text-amber-500" strokeWidth={1.5} /> Teaching Planner
              </h1>
              <p className="text-stone-500 dark:text-stone-400 mt-1 text-sm">
                Plan your church&apos;s teaching calendar — schedule lessons, track progress, and stay organized
              </p>
            </div>
          </div>

          {/* Stats - Warm amber accent boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Scheduled', value: stats.upcoming, icon: <ClipboardList className="w-5 h-5 text-amber-600 dark:text-amber-500" strokeWidth={1.5} /> },
              { label: 'Completed', value: stats.completed, icon: <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-500" strokeWidth={1.5} /> },
              { label: 'Total Planned', value: stats.total, icon: <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={1.5} /> },
              { label: 'Unique Lessons', value: stats.uniqueLessons, icon: <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" strokeWidth={1.5} /> },
            ].map(s => (
              <div key={s.label} className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-3 text-center">
                <span className="flex justify-center">{s.icon}</span>
                <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{s.value}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12">
        <div className="bg-white dark:bg-stone-800/50 rounded-2xl shadow-lg shadow-black/5 dark:shadow-black/20 border border-stone-200 dark:border-stone-700 overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-stone-200 dark:border-stone-700">
            <div className="flex items-center gap-2">
              <button onClick={navigatePrev} className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors">
                <svg className="w-5 h-5 text-stone-500 dark:text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 min-w-[200px] text-center" style={{ fontFamily: 'Crimson Text, serif' }}>
                {viewMode === 'month'
                  ? `${MONTH_NAMES[month]} ${year}`
                  : (() => {
                      const week = getWeekDays(currentDate)
                      const s = week[0]
                      const e = week[6]
                      return `${MONTH_NAMES[s.getMonth()]} ${s.getDate()} – ${s.getMonth() !== e.getMonth() ? MONTH_NAMES[e.getMonth()] + ' ' : ''}${e.getDate()}, ${e.getFullYear()}`
                    })()
                }
              </h2>
              <button onClick={navigateNext} className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors">
                <svg className="w-5 h-5 text-stone-500 dark:text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
              <button onClick={goToToday} className="ml-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors">
                Today
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5">
                {(['month', 'week'] as ViewMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                      viewMode === mode
                        ? 'bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-500 shadow-sm'
                        : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                    }`}
                  >
                    {mode === 'month' ? <><Calendar className="w-3.5 h-3.5" strokeWidth={1.5} /> Month</> : <><ClipboardList className="w-3.5 h-3.5" strokeWidth={1.5} /> Week</>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          {viewMode === 'month' ? (
            <MonthView
              year={year}
              month={month}
              schedules={schedules}
              dragOverDate={dragOverDate}
              onDateClick={handleDateClick}
              onScheduleClick={handleScheduleClick}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
            />
          ) : (
            <WeekView
              currentDate={currentDate}
              schedules={schedules}
              dragOverDate={dragOverDate}
              onDateClick={handleDateClick}
              onScheduleClick={handleScheduleClick}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
            />
          )}

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 px-4 py-3 border-t border-stone-200 dark:border-stone-700 text-xs text-stone-500 dark:text-stone-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-600" /> Scheduled</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Cancelled</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-2 border-dashed border-amber-400" /> Sunday</span>
            <span className="ml-auto text-[10px] flex items-center gap-1"><Sparkles className="w-3 h-3" strokeWidth={1.5} /> Drag lessons between dates to reschedule</span>
          </div>
        </div>

        {/* Upcoming Section */}
        <UpcomingLessons schedules={schedules} onScheduleClick={(s) => { setSelectedDate(s.date); setEditingSchedule(s); setShowScheduleModal(true) }} />
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && selectedDate && (
        <ScheduleModal
          date={selectedDate}
          editingSchedule={editingSchedule}
          onClose={() => { setShowScheduleModal(false); setEditingSchedule(null) }}
        />
      )}

      {/* Copyright */}
      <div className="text-right px-6 py-3 text-xs text-stone-400 dark:text-stone-500">
        © {new Date().getFullYear()} Bible Lesson Planner — Patent Pending
      </div>
    </div>
  )
}

// ─── Month View ───
function MonthView({
  year, month, schedules, dragOverDate,
  onDateClick, onScheduleClick, onDragStart, onDragOver, onDrop, onDragEnd,
}: {
  year: number; month: number; schedules: ScheduledLesson[]; dragOverDate: string | null
  onDateClick: (d: string) => void; onScheduleClick: (s: ScheduledLesson, e: React.MouseEvent) => void
  onDragStart: (id: string) => void; onDragOver: (d: string, e: React.DragEvent) => void
  onDrop: (d: string) => void; onDragEnd: () => void
}) {
  const days = getMonthDays(year, month)

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-stone-200 dark:border-stone-700">
        {DAY_NAMES.map((d, i) => (
          <div key={d} className={`py-2 text-center text-xs font-bold uppercase tracking-wider ${
            i === 0 ? 'text-amber-600 dark:text-amber-500' : 'text-stone-500 dark:text-stone-400'
          }`}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const dateStr = toDateString(day)
          const isCurrentMonth = day.getMonth() === month
          const today = isToday(day)
          const sunday = isSunday(day)
          const daySchedules = schedules.filter(s => s.date === dateStr)
          const isDragOver = dragOverDate === dateStr

          return (
            <div
              key={idx}
              onClick={() => onDateClick(dateStr)}
              onDragOver={(e) => onDragOver(dateStr, e)}
              onDrop={() => onDrop(dateStr)}
              className={`min-h-[100px] sm:min-h-[120px] border-b border-r border-stone-200 dark:border-stone-700 p-1.5 cursor-pointer transition-all duration-150 group ${
                !isCurrentMonth ? 'bg-stone-50 dark:bg-stone-900/50 opacity-50' : ''
              } ${today ? 'bg-amber-50 dark:bg-amber-900/20' : ''} ${
                sunday && isCurrentMonth ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''
              } ${isDragOver ? 'bg-amber-100 dark:bg-amber-900/30 ring-2 ring-inset ring-amber-500' : ''} hover:bg-stone-50 dark:hover:bg-stone-800/30`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                  today ? 'bg-amber-600 text-white' : sunday && isCurrentMonth ? 'text-amber-600 dark:text-amber-500' : 'text-stone-500 dark:text-stone-400'
                }`}>
                  {day.getDate()}
                </span>
                {daySchedules.length === 0 && isCurrentMonth && (
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-amber-700 dark:text-amber-500 font-medium">+ Add</span>
                )}
              </div>

              <div className="space-y-0.5">
                {daySchedules.slice(0, 3).map(sched => {
                  const lesson = lessonStore.getById(sched.lessonId)
                  return (
                    <div
                      key={sched.id}
                      draggable
                      onDragStart={() => onDragStart(sched.id)}
                      onDragEnd={onDragEnd}
                      onClick={(e) => onScheduleClick(sched, e)}
                      className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md truncate font-medium cursor-grab active:cursor-grabbing transition-all duration-150 hover:scale-[1.02] flex items-center gap-0.5 ${
                        sched.status === 'completed'
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : sched.status === 'cancelled'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800 line-through'
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {sched.status === 'completed' ? <CheckCircle className="w-2.5 h-2.5 flex-shrink-0" strokeWidth={1.5} /> : sched.status === 'cancelled' ? <XCircle className="w-2.5 h-2.5 flex-shrink-0" strokeWidth={1.5} /> : <BookMarked className="w-2.5 h-2.5 flex-shrink-0" strokeWidth={1.5} />}
                      <span className="truncate">{lesson?.title || 'Untitled'}</span>
                    </div>
                  )
                })}
                {daySchedules.length > 3 && (
                  <div className="text-[10px] text-stone-500 dark:text-stone-400 pl-1.5 font-medium">
                    +{daySchedules.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Week View ───
function WeekView({
  currentDate, schedules, dragOverDate,
  onDateClick, onScheduleClick, onDragStart, onDragOver, onDrop, onDragEnd,
}: {
  currentDate: Date; schedules: ScheduledLesson[]; dragOverDate: string | null
  onDateClick: (d: string) => void; onScheduleClick: (s: ScheduledLesson, e: React.MouseEvent) => void
  onDragStart: (id: string) => void; onDragOver: (d: string, e: React.DragEvent) => void
  onDrop: (d: string) => void; onDragEnd: () => void
}) {
  const days = getWeekDays(currentDate)
  const TIME_SLOTS = ['8:00 AM', '9:00 AM', '10:00 AM', '10:30 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM']

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Day headers */}
        <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-stone-200 dark:border-stone-700">
          <div className="p-2 text-xs font-bold text-stone-400 dark:text-stone-500 text-center">Time</div>
          {days.map((day, i) => {
            const dateStr = toDateString(day)
            const today = isToday(day)
            const sunday = isSunday(day)
            const daySchedules = schedules.filter(s => s.date === dateStr)
            return (
              <div
                key={i}
                className={`p-2 text-center border-l border-stone-200 dark:border-stone-700 ${
                  today ? 'bg-amber-50 dark:bg-amber-900/20' : sunday ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''
                }`}
              >
                <p className={`text-xs font-bold ${sunday ? 'text-amber-600 dark:text-amber-500' : 'text-stone-500 dark:text-stone-400'}`}>
                  {DAY_NAMES_FULL[day.getDay()]}
                </p>
                <p className={`text-lg font-bold ${today ? 'text-amber-700 dark:text-amber-500' : 'text-stone-900 dark:text-stone-100'}`}>
                  {day.getDate()}
                </p>
                {daySchedules.length > 0 && (
                  <span className="inline-block mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500">
                    {daySchedules.length} lesson{daySchedules.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Time rows */}
        {TIME_SLOTS.map(slot => (
          <div key={slot} className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-stone-200/50 dark:border-stone-700/50">
            <div className="p-2 text-[11px] font-medium text-stone-400 dark:text-stone-500 text-right pr-3 border-r border-stone-200 dark:border-stone-700">
              {slot}
            </div>
            {days.map((day, i) => {
              const dateStr = toDateString(day)
              const slotSchedules = schedules.filter(s => s.date === dateStr && s.timeSlot === slot)
              const isDragOver = dragOverDate === dateStr
              const today = isToday(day)

              return (
                <div
                  key={i}
                  onClick={() => onDateClick(dateStr)}
                  onDragOver={(e) => onDragOver(dateStr, e)}
                  onDrop={() => onDrop(dateStr)}
                  className={`min-h-[52px] p-1 border-l border-stone-200 dark:border-stone-700 cursor-pointer transition-all duration-150 group ${
                    today ? 'bg-amber-50/30 dark:bg-amber-900/10' : ''
                  } ${isDragOver ? 'bg-amber-100 dark:bg-amber-900/30 ring-2 ring-inset ring-amber-500' : ''} hover:bg-stone-50 dark:hover:bg-stone-800/20`}
                >
                  {slotSchedules.map(sched => {
                    const lesson = lessonStore.getById(sched.lessonId)
                    return (
                      <div
                        key={sched.id}
                        draggable
                        onDragStart={() => onDragStart(sched.id)}
                        onDragEnd={onDragEnd}
                        onClick={(e) => onScheduleClick(sched, e)}
                        className={`text-xs px-2 py-1.5 rounded-lg font-medium cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02] ${
                          sched.status === 'completed'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : sched.status === 'cancelled'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        <p className="truncate flex items-center gap-1">{sched.status === 'completed' ? <CheckCircle className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} /> : <BookMarked className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />}{lesson?.title || 'Untitled'}</p>
                        {lesson && <p className="text-[10px] opacity-70 truncate">{lesson.passage} · {lesson.ageGroup}</p>}
                      </div>
                    )
                  })}
                  {slotSchedules.length === 0 && (
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-amber-700 dark:text-amber-500 font-medium flex items-center justify-center h-full">+</span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Upcoming Lessons Panel ───
function UpcomingLessons({ schedules, onScheduleClick }: { schedules: ScheduledLesson[]; onScheduleClick: (s: ScheduledLesson) => void }) {
  const todayStr = toDateString(new Date())
  const upcoming = schedules
    .filter(s => s.date >= todayStr && s.status === 'scheduled')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6)

  const recent = schedules
    .filter(s => s.status === 'completed')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4)

  if (upcoming.length === 0 && recent.length === 0) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="bg-white dark:bg-stone-800/50 rounded-2xl shadow-lg shadow-black/5 dark:shadow-black/20 border border-stone-200 dark:border-stone-700 p-5">
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-amber-600 dark:text-amber-500" strokeWidth={1.5} /> Upcoming Lessons
          </h3>
          <div className="space-y-2">
            {upcoming.map(sched => {
              const lesson = lessonStore.getById(sched.lessonId)
              const series = sched.seriesId ? seriesStore.getById(sched.seriesId) : undefined
              const d = new Date(sched.date + 'T00:00:00')
              return (
                <button
                  key={sched.id}
                  onClick={() => onScheduleClick(sched)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-all duration-200 text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex flex-col items-center justify-center text-white shrink-0">
                    <span className="text-[10px] font-bold uppercase leading-none">{MONTH_NAMES[d.getMonth()].slice(0, 3)}</span>
                    <span className="text-lg font-extrabold leading-none">{d.getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-700 dark:group-hover:text-amber-500 transition-colors">
                      {lesson?.title || 'Untitled Lesson'}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" strokeWidth={1.5} /> {sched.timeSlot}</span>
                      {lesson && <span>· {lesson.ageGroup}</span>}
                      {series && <span className="text-amber-700 dark:text-amber-500">· {series.name}</span>}
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-stone-300 dark:text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Recently Completed */}
      {recent.length > 0 && (
        <div className="bg-white dark:bg-stone-800/50 rounded-2xl shadow-lg shadow-black/5 dark:shadow-black/20 border border-stone-200 dark:border-stone-700 p-5">
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" strokeWidth={1.5} /> Recently Completed
          </h3>
          <div className="space-y-2">
            {recent.map(sched => {
              const lesson = lessonStore.getById(sched.lessonId)
              const d = new Date(sched.date + 'T00:00:00')
              return (
                <div key={sched.id} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <CheckCircle className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                      {lesson?.title || 'Untitled'}
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      {DAY_NAMES_FULL[d.getDay()]}, {MONTH_NAMES[d.getMonth()]} {d.getDate()}
                    </p>
                  </div>
                  {lesson && (
                    <Link
                      to="/lesson/$lessonId"
                      params={{ lessonId: lesson.id }}
                      className="text-[11px] font-semibold text-amber-700 dark:text-amber-500 hover:underline shrink-0"
                    >
                      View →
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Schedule Modal ───
function ScheduleModal({ date, editingSchedule, onClose }: {
  date: string; editingSchedule: ScheduledLesson | null; onClose: () => void
}) {
  const allLessons = lessonStore.getAll()
  const [selectedLessonId, setSelectedLessonId] = useState(editingSchedule?.lessonId || '')
  const [timeSlot, setTimeSlot] = useState(editingSchedule?.timeSlot || '9:00 AM')
  const [notes, setNotes] = useState(editingSchedule?.notes || '')
  const [search, setSearch] = useState('')
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  const d = new Date(date + 'T00:00:00')
  const dateLabel = `${DAY_NAMES_FULL[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`

  const existingSchedules = plannerStore.getSchedulesForDate(date).filter(s => s.id !== editingSchedule?.id)

  const filteredLessons = allLessons.filter(l =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.passage.toLowerCase().includes(search.toLowerCase()) ||
    l.theme.toLowerCase().includes(search.toLowerCase())
  )

  const TIME_OPTIONS = ['8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM']

  const handleSave = () => {
    if (!selectedLessonId) return
    if (editingSchedule) {
      plannerStore.updateSchedule(editingSchedule.id, {
        lessonId: selectedLessonId,
        timeSlot,
        notes,
      })
    } else {
      plannerStore.scheduleLesson({
        lessonId: selectedLessonId,
        date,
        timeSlot,
        notes,
        status: 'scheduled',
      })
    }
    onClose()
  }

  const handleDelete = () => {
    if (editingSchedule) {
      plannerStore.removeSchedule(editingSchedule.id)
      onClose()
    }
  }

  const handleMarkCompleted = () => {
    if (editingSchedule) {
      plannerStore.markCompleted(editingSchedule.id)
      onClose()
    }
  }

  const handleMarkCancelled = () => {
    if (editingSchedule) {
      plannerStore.markCancelled(editingSchedule.id)
      onClose()
    }
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div ref={modalRef} className="relative bg-white dark:bg-stone-800 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-200 dark:border-stone-700">
          <div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2" style={{ fontFamily: 'Crimson Text, serif' }}>
              {editingSchedule ? <><Pencil className="w-5 h-5" strokeWidth={1.5} /> Edit Scheduled Lesson</> : <><Calendar className="w-5 h-5" strokeWidth={1.5} /> Schedule a Lesson</>}
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">{dateLabel}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors">
            <svg className="w-5 h-5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Existing schedules for this date */}
          {existingSchedules.length > 0 && (
            <div className="bg-stone-50 dark:bg-stone-900/50 rounded-xl p-3">
              <p className="text-xs font-bold text-stone-500 dark:text-stone-400 mb-2">Already scheduled for this date:</p>
              {existingSchedules.map(s => {
                const lesson = lessonStore.getById(s.lessonId)
                return (
                  <div key={s.id} className="flex items-center gap-2 text-xs text-stone-900 dark:text-stone-100">
                    {s.status === 'completed' ? <CheckCircle className="w-3 h-3 text-emerald-500" strokeWidth={1.5} /> : <BookMarked className="w-3 h-3 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />}
                    <span className="font-medium">{lesson?.title || 'Untitled'}</span>
                    <span className="text-stone-400">at {s.timeSlot}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Time Slot */}
          <div>
            <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100 mb-2 flex items-center gap-1.5"><Clock className="w-4 h-4" strokeWidth={1.5} /> Time Slot</label>
            <div className="flex flex-wrap gap-1.5">
              {TIME_OPTIONS.map(t => (
                <button
                  key={t}
                  onClick={() => setTimeSlot(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    timeSlot === t
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-stone-100 dark:bg-stone-900 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Lesson Picker */}
          <div>
            <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100 mb-2 flex items-center gap-1.5"><BookMarked className="w-4 h-4" strokeWidth={1.5} /> Select Lesson</label>
            <div className="relative mb-2">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search lessons..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-stone-200 dark:border-stone-700 p-1">
              {filteredLessons.length === 0 ? (
                <div className="text-center py-6 text-sm text-stone-400">
                  <p>No lessons found</p>
                  <Link to="/generate" className="text-amber-700 dark:text-amber-500 hover:underline text-xs mt-1 inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" strokeWidth={1.5} /> Generate a new lesson
                  </Link>
                </div>
              ) : (
                filteredLessons.map(lesson => (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLessonId(lesson.id)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all duration-150 ${
                      selectedLessonId === lesson.id
                        ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                        : 'hover:bg-stone-50 dark:hover:bg-stone-700/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${lesson.gradient} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                      {lesson.title.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${
                        selectedLessonId === lesson.id ? 'text-amber-700 dark:text-amber-500' : 'text-stone-900 dark:text-stone-100'
                      }`}>
                        {lesson.title}
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                        {lesson.passage} · {lesson.ageGroup} · {lesson.duration}
                      </p>
                    </div>
                    {selectedLessonId === lesson.id && (
                      <span className="text-amber-600 dark:text-amber-500 text-sm"><Check className="w-3.5 h-3.5" strokeWidth={1.5} /></span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100 mb-2 flex items-center gap-1.5"><Pencil className="w-4 h-4" strokeWidth={1.5} /> Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g., Prepare craft supplies, guest speaker joining..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
            />
          </div>

          {/* Status actions for editing */}
          {editingSchedule && (
            <div className="flex flex-wrap gap-2">
              {editingSchedule.status === 'scheduled' && (
                <>
                  <button
                    onClick={handleMarkCompleted}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" strokeWidth={1.5} /> Mark Completed
                  </button>
                  <button
                    onClick={handleMarkCancelled}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" strokeWidth={1.5} /> Cancel
                  </button>
                </>
              )}
              {editingSchedule.status !== 'scheduled' && (
                <button
                  onClick={() => { plannerStore.updateSchedule(editingSchedule.id, { status: 'scheduled' }); onClose() }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                >
                  <ClipboardList className="w-3.5 h-3.5" strokeWidth={1.5} /> Reschedule
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-stone-200 dark:border-stone-700">
          <div>
            {editingSchedule && !showConfirmDelete && (
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} /> Remove
              </button>
            )}
            {showConfirmDelete && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-500">Delete?</span>
                <button onClick={handleDelete} className="text-xs font-bold text-red-600 hover:underline">Yes</button>
                <button onClick={() => setShowConfirmDelete(false)} className="text-xs text-stone-500 hover:underline">No</button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedLessonId}
              className="px-5 py-2 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-1.5"
            >
              {editingSchedule ? <><Save className="w-3.5 h-3.5" strokeWidth={1.5} /> Update</> : <><Calendar className="w-3.5 h-3.5" strokeWidth={1.5} /> Schedule</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/planner')({
  component: PlannerPage,
})
