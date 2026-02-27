import { lessonStore, type LessonData } from './lesson-store'
import { seriesStore } from './series-store'

export interface ScheduledLesson {
  id: string
  lessonId: string
  date: string // YYYY-MM-DD
  timeSlot: string // e.g. "9:00 AM", "10:30 AM"
  notes: string
  status: 'scheduled' | 'completed' | 'cancelled'
  seriesId?: string
}

export interface PlannerNote {
  id: string
  date: string
  text: string
  color: string
}

const NOTE_COLORS = [
  'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700',
  'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
  'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
  'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700',
  'bg-rose-100 dark:bg-rose-900/30 border-rose-300 dark:border-rose-700',
]

// Generate sample scheduled lessons
function generateSampleSchedules(): ScheduledLesson[] {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  // Find next few Sundays
  const sundays: string[] = []
  for (let d = 1; d <= 42; d++) {
    const date = new Date(year, month, today.getDate() - today.getDay() + (d * 1) - 7)
    if (date.getDay() === 0) {
      sundays.push(formatDate(date))
      if (sundays.length >= 8) break
    }
  }

  return [
    {
      id: 'sched-1',
      lessonId: 'demo-lesson',
      date: sundays[0] || formatDate(today),
      timeSlot: '9:00 AM',
      notes: 'Main service - children\'s church',
      status: 'completed',
      seriesId: 'series-1',
    },
    {
      id: 'sched-2',
      lessonId: 'lesson-4',
      date: sundays[1] || formatDate(new Date(today.getTime() + 7 * 86400000)),
      timeSlot: '9:00 AM',
      notes: 'Prepare craft supplies in advance',
      status: 'completed',
      seriesId: 'series-1',
    },
    {
      id: 'sched-3',
      lessonId: 'lesson-3',
      date: sundays[2] || formatDate(new Date(today.getTime() + 14 * 86400000)),
      timeSlot: '10:30 AM',
      notes: '',
      status: 'scheduled',
      seriesId: 'series-2',
    },
    {
      id: 'sched-4',
      lessonId: 'lesson-5',
      date: sundays[3] || formatDate(new Date(today.getTime() + 21 * 86400000)),
      timeSlot: '9:00 AM',
      notes: 'Guest speaker joining for Q&A',
      status: 'scheduled',
    },
    {
      id: 'sched-5',
      lessonId: 'lesson-2',
      date: sundays[4] || formatDate(new Date(today.getTime() + 28 * 86400000)),
      timeSlot: '9:00 AM',
      notes: '',
      status: 'scheduled',
    },
  ]
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

let _schedules: ScheduledLesson[] = generateSampleSchedules()
let _notes: PlannerNote[] = []
let _listeners: Array<() => void> = []

function notify() {
  _listeners.forEach(fn => fn())
}

export const plannerStore = {
  // Schedules
  getAllSchedules(): ScheduledLesson[] {
    return _schedules
  },

  getSchedulesForDate(date: string): ScheduledLesson[] {
    return _schedules.filter(s => s.date === date)
  },

  getSchedulesForMonth(year: number, month: number): ScheduledLesson[] {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`
    return _schedules.filter(s => s.date.startsWith(prefix))
  },

  getSchedulesForWeek(startDate: string): ScheduledLesson[] {
    const start = new Date(startDate + 'T00:00:00')
    const end = new Date(start.getTime() + 7 * 86400000)
    return _schedules.filter(s => {
      const d = new Date(s.date + 'T00:00:00')
      return d >= start && d < end
    })
  },

  getScheduleById(id: string): ScheduledLesson | undefined {
    return _schedules.find(s => s.id === id)
  },

  scheduleLesson(data: Omit<ScheduledLesson, 'id'>): ScheduledLesson {
    const schedule: ScheduledLesson = {
      ...data,
      id: `sched-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    }
    _schedules = [..._schedules, schedule]
    notify()
    return schedule
  },

  updateSchedule(id: string, updates: Partial<Omit<ScheduledLesson, 'id'>>): void {
    _schedules = _schedules.map(s =>
      s.id === id ? { ...s, ...updates } : s
    )
    notify()
  },

  removeSchedule(id: string): void {
    _schedules = _schedules.filter(s => s.id !== id)
    notify()
  },

  moveSchedule(id: string, newDate: string): void {
    _schedules = _schedules.map(s =>
      s.id === id ? { ...s, date: newDate } : s
    )
    notify()
  },

  markCompleted(id: string): void {
    _schedules = _schedules.map(s =>
      s.id === id ? { ...s, status: 'completed' as const } : s
    )
    notify()
  },

  markCancelled(id: string): void {
    _schedules = _schedules.map(s =>
      s.id === id ? { ...s, status: 'cancelled' as const } : s
    )
    notify()
  },

  // Notes
  getNotesForDate(date: string): PlannerNote[] {
    return _notes.filter(n => n.date === date)
  },

  addNote(date: string, text: string): PlannerNote {
    const note: PlannerNote = {
      id: `note-${Date.now()}`,
      date,
      text,
      color: NOTE_COLORS[_notes.length % NOTE_COLORS.length],
    }
    _notes = [..._notes, note]
    notify()
    return note
  },

  removeNote(id: string): void {
    _notes = _notes.filter(n => n.id !== id)
    notify()
  },

  // Enriched data
  getScheduleWithLesson(scheduleId: string): { schedule: ScheduledLesson; lesson: LessonData | undefined } | undefined {
    const schedule = _schedules.find(s => s.id === scheduleId)
    if (!schedule) return undefined
    const lesson = lessonStore.getById(schedule.lessonId)
    return { schedule, lesson }
  },

  getEnrichedSchedulesForDate(date: string): Array<{ schedule: ScheduledLesson; lesson: LessonData | undefined; seriesName?: string }> {
    return _schedules
      .filter(s => s.date === date)
      .map(s => ({
        schedule: s,
        lesson: lessonStore.getById(s.lessonId),
        seriesName: s.seriesId ? seriesStore.getById(s.seriesId)?.name : undefined,
      }))
      .sort((a, b) => (a.schedule.timeSlot || '').localeCompare(b.schedule.timeSlot || ''))
  },

  // Stats
  getStats() {
    const upcoming = _schedules.filter(s => s.status === 'scheduled').length
    const completed = _schedules.filter(s => s.status === 'completed').length
    const total = _schedules.length
    const uniqueLessons = new Set(_schedules.map(s => s.lessonId)).size
    return { upcoming, completed, total, uniqueLessons }
  },

  // Subscribe
  subscribe(listener: () => void): () => void {
    _listeners.push(listener)
    return () => {
      _listeners = _listeners.filter(fn => fn !== listener)
    }
  },
}

// Calendar utility helpers
export function getMonthDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = firstDay.getDay() // 0=Sun
  const days: Date[] = []

  // Pad from previous month
  for (let i = startPad - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i))
  }

  // Current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d))
  }

  // Pad to fill 6 rows (42 cells)
  while (days.length < 42) {
    days.push(new Date(year, month + 1, days.length - lastDay.getDate() - startPad + 1))
  }

  return days
}

export function getWeekDays(startDate: Date): Date[] {
  const sunday = new Date(startDate)
  sunday.setDate(sunday.getDate() - sunday.getDay())
  const days: Date[] = []
  for (let i = 0; i < 7; i++) {
    days.push(new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i))
  }
  return days
}

export function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function isToday(d: Date): boolean {
  return isSameDay(d, new Date())
}

export function isSunday(d: Date): boolean {
  return d.getDay() === 0
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export { MONTH_NAMES, DAY_NAMES, DAY_NAMES_FULL }
