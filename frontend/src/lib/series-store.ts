import { seriesAPI, type Series } from './api'
import { lessonsAPI, type Lesson } from './api'

export interface SeriesData {
  id: string
  name: string
  summary: string
  theme: string
  ageGroup: string
  lessonIds: string[]
  createdAt: string
  updatedAt: string
  color: string
}

// Convert API Series to SeriesData format
function toSeriesData(series: Series): SeriesData {
  return {
    id: series.id,
    name: series.name,
    summary: series.summary,
    theme: series.theme,
    ageGroup: series.ageGroup,
    lessonIds: series.lessonIds,
    createdAt: series.createdAt,
    updatedAt: series.updatedAt,
    color: series.color,
  }
}

let _series: SeriesData[] = []
let _listeners: Array<() => void> = []
let _initialized = false

function notify() {
  _listeners.forEach(fn => fn())
}

export const seriesStore = {
  async initialize(): Promise<void> {
    if (_initialized) return
    try {
      const series = await seriesAPI.getAll()
      _series = series.map(toSeriesData)
      _initialized = true
      notify()
    } catch (error) {
      console.error('Failed to initialize series store:', error)
      _series = []
    }
  },

  getAll(): SeriesData[] {
    return _series
  },

  getById(id: string): SeriesData | undefined {
    return _series.find(s => s.id === id)
  },

  async create(data: Omit<SeriesData, 'id' | 'createdAt' | 'updatedAt' | 'color'>): Promise<SeriesData> {
    try {
      const series = await seriesAPI.create({
        name: data.name,
        summary: data.summary,
        theme: data.theme,
        ageGroup: data.ageGroup,
        lessonIds: data.lessonIds,
      })
      const seriesData = toSeriesData(series)
      _series = [seriesData, ..._series]
      notify()
      return seriesData
    } catch (error) {
      console.error('Failed to create series:', error)
      throw error
    }
  },

  async update(id: string, updates: Partial<Omit<SeriesData, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const series = await seriesAPI.update(id, updates)
      _series = _series.map(s =>
        s.id === id ? toSeriesData(series) : s
      )
      notify()
    } catch (error) {
      console.error('Failed to update series:', error)
      throw error
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await seriesAPI.delete(id)
      _series = _series.filter(s => s.id !== id)
      notify()
    } catch (error) {
      console.error('Failed to delete series:', error)
      throw error
    }
  },

  async addLesson(seriesId: string, lessonId: string): Promise<void> {
    try {
      const series = await seriesAPI.addLesson(seriesId, lessonId)
      _series = _series.map(s =>
        s.id === seriesId ? toSeriesData(series) : s
      )
      notify()
    } catch (error) {
      console.error('Failed to add lesson to series:', error)
      throw error
    }
  },

  async removeLesson(seriesId: string, lessonId: string): Promise<void> {
    try {
      const series = await seriesAPI.removeLesson(seriesId, lessonId)
      _series = _series.map(s =>
        s.id === seriesId ? toSeriesData(series) : s
      )
      notify()
    } catch (error) {
      console.error('Failed to remove lesson from series:', error)
      throw error
    }
  },

  async reorderLessons(seriesId: string, newOrder: string[]): Promise<void> {
    try {
      const series = await seriesAPI.reorderLessons(seriesId, newOrder)
      _series = _series.map(s =>
        s.id === seriesId ? toSeriesData(series) : s
      )
      notify()
    } catch (error) {
      console.error('Failed to reorder lessons:', error)
      throw error
    }
  },

  async getLessonsForSeries(seriesId: string): Promise<Lesson[]> {
    try {
      return await seriesAPI.getLessons(seriesId)
    } catch (error) {
      console.error('Failed to get lessons for series:', error)
      return []
    }
  },

  subscribe(listener: () => void): () => void {
    _listeners.push(listener)
    // Initialize on first subscribe
    if (!_initialized) {
      seriesStore.initialize()
    }
    return () => {
      _listeners = _listeners.filter(fn => fn !== listener)
    }
  },

  async getStats(): Promise<{ total: number; totalLessons: number; themes: number }> {
    try {
      return await seriesAPI.getStats()
    } catch (error) {
      // Fallback to local calculation
      const allLessons = _series.reduce((sum, s) => sum + s.lessonIds.length, 0)
      return {
        total: _series.length,
        totalLessons: allLessons,
        themes: new Set(_series.map(s => s.theme)).size,
      }
    }
  },

  // Force refresh from server
  async refresh(): Promise<void> {
    try {
      const series = await seriesAPI.getAll()
      _series = series.map(toSeriesData)
      notify()
    } catch (error) {
      console.error('Failed to refresh series:', error)
    }
  },
}
