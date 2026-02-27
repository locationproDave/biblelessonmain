import { useState, useCallback } from 'react'
import { fetchPassage, TRANSLATIONS, type BibleTranslation, type BiblePassage, BibleApiError } from '@/lib/bible-api'
import { BookOpen, Search, AlertTriangle, Check, ChevronDown, ChevronUp } from 'lucide-react'

interface ScriptureLookupProps {
  onInsert?: (text: string, reference: string) => void
  initialReference?: string
  compact?: boolean
}

export function ScriptureLookup({ onInsert, initialReference = '', compact = false }: ScriptureLookupProps) {
  const [reference, setReference] = useState(initialReference)
  const [translation, setTranslation] = useState<BibleTranslation>('kjv')
  const [passage, setPassage] = useState<BiblePassage | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLookup = useCallback(async () => {
    if (!reference.trim()) return
    setLoading(true)
    setError(null)
    setPassage(null)
    try {
      const result = await fetchPassage(reference, translation)
      setPassage(result)
    } catch (err) {
      if (err instanceof BibleApiError) {
        setError(err.message)
      } else {
        setError('Unable to connect to the Bible API. Please check your connection and try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [reference, translation])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLookup()
  }

  return (
    <div className={`${compact ? '' : 'bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 p-5 sm:p-6'}`}>
      {!compact && (
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-sm">
          <BookOpen className="w-5 h-5" /> Scripture Lookup
        </h3>
      )}

      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={reference}
            onChange={(e) => { setReference(e.target.value); setError(null) }}
            onKeyDown={handleKeyDown}
            placeholder="e.g. John 3:16 or Romans 8:28-39"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all placeholder:text-gray-400"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <span className="w-4 h-4 border-2 border-[#D4A017]/30 border-t-[#4A90E2] rounded-full animate-spin inline-block" />
            </div>
          )}
        </div>
        <select
          value={translation}
          onChange={(e) => setTranslation(e.target.value as BibleTranslation)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent"
        >
          {TRANSLATIONS.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <button
          onClick={handleLookup}
          disabled={loading || !reference.trim()}
          className="px-5 py-2.5 bg-gradient-to-r from-[#1E3A5F] to-[#3B82F6] text-white rounded-xl text-sm font-bold shadow-md shadow-[#D4A017]/15 hover:shadow-lg hover:scale-105 active:scale-100 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 whitespace-nowrap"
        >
          {loading ? 'Looking up...' : <><Search className="w-4 h-4" /> Look Up</>}
        </button>
      </div>

      {/* Quick reference chips */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {['John 3:16', 'Psalm 23', 'Romans 8:28', 'Philippians 4:13', 'Proverbs 3:5-6', 'Isaiah 40:31'].map(ref => (
          <button
            key={ref}
            onClick={() => { setReference(ref); setError(null) }}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-[#EBF5FF] dark:hover:bg-[#1E3A5F]/20 hover:text-[#2563EB] dark:hover:text-[#93C5FD] transition-all"
          >
            {ref}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200/60 dark:border-red-800/40 text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
          <div>
            <p className="font-medium">{error}</p>
            <p className="text-xs text-red-500 dark:text-red-400 mt-1">
              Try formats like: &quot;John 3:16&quot;, &quot;Genesis 1:1-10&quot;, or &quot;Psalm 23&quot;
            </p>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !passage && (
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-200/60 dark:border-gray-700/40 animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/3" />
          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-full" />
          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-5/6" />
          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-4/6" />
        </div>
      )}

      {/* Passage display */}
      {passage && (
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/80 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/5 border border-amber-200/60 dark:border-amber-700/40">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-amber-800 dark:text-amber-300 text-sm">
              <BookOpen className="w-4 h-4" /> {passage.reference}
            </h4>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
              {passage.translation_name}
            </span>
          </div>

          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {passage.verses.map((verse, i) => (
              <p key={i} className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                <sup className="text-xs font-bold text-amber-600 dark:text-amber-400 mr-1">{verse.verse}</sup>
                {verse.text}
              </p>
            ))}
          </div>

          {onInsert && (
            <button
              onClick={() => onInsert(passage.text, passage.reference)}
              className="mt-3 w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold transition-all duration-200 hover:shadow-md"
            >
              <Check className="w-4 h-4" /> Insert into Lesson
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// Inline verse display component for the lesson viewer
export function InlineScriptureText({ reference, className = '' }: { reference: string; className?: string }) {
  const [passage, setPassage] = useState<BiblePassage | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const loadPassage = useCallback(async () => {
    if (passage || loading) return
    setLoading(true)
    try {
      const result = await fetchPassage(reference, 'kjv')
      setPassage(result)
      setExpanded(true)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [reference, passage, loading])

  return (
    <div className={className}>
      <button
        onClick={() => {
          if (passage) setExpanded(!expanded)
          else loadPassage()
        }}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A5F] dark:text-[#D4A017] hover:text-[#2563EB] dark:hover:text-[#93C5FD] transition-colors"
      >
        {loading ? (
          <span className="w-3 h-3 border-2 border-[#D4A017]/30 border-t-[#4A90E2] rounded-full animate-spin" />
        ) : (
          <span>{expanded ? <BookOpen className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}</span>
        )}
        {expanded ? 'Hide Scripture Text' : 'Show Scripture Text'}
      </button>

      {expanded && passage && (
        <div className="mt-2 p-3 rounded-lg bg-amber-50/80 dark:bg-amber-900/10 border border-amber-200/40 dark:border-amber-700/30 text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
          {passage.verses.map((v, i) => (
            <span key={i}>
              <sup className="text-[10px] font-bold text-amber-600 dark:text-amber-400 not-italic mr-0.5">{v.verse}</sup>
              {v.text}{' '}
            </span>
          ))}
          <span className="block mt-1 text-xs text-amber-600 dark:text-amber-400 not-italic font-semibold">
            — {passage.reference} ({passage.translation_name})
          </span>
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-500 dark:text-red-400">Could not load scripture text.</p>
      )}
    </div>
  )
}
