import { useState, useCallback, useEffect, useRef } from 'react'
import { fetchPassage, TRANSLATIONS, type BibleTranslation, type BiblePassage, BibleApiError } from '@/lib/bible-api'
import { BookOpen, Search, AlertTriangle, X, Check, Copy, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

interface ScriptureDrawerProps {
  isOpen: boolean
  onClose: () => void
  initialReference?: string
  onInsert?: (text: string, reference: string) => void
}

export function ScriptureDrawer({ isOpen, onClose, initialReference = '', onInsert }: ScriptureDrawerProps) {
  const [reference, setReference] = useState(initialReference)
  const [translation, setTranslation] = useState<BibleTranslation>('kjv')
  const [passage, setPassage] = useState<BiblePassage | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inserted, setInserted] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  // Auto-fetch when opened with a reference
  useEffect(() => {
    if (isOpen && initialReference) {
      setReference(initialReference)
      setPassage(null)
      setError(null)
      setInserted(false)
      // Auto-fetch the passage
      handleLookupDirect(initialReference, translation)
    }
  }, [isOpen, initialReference])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleLookupDirect = useCallback(async (ref: string, trans: BibleTranslation) => {
    if (!ref.trim()) return
    setLoading(true)
    setError(null)
    setPassage(null)
    setInserted(false)
    try {
      const result = await fetchPassage(ref, trans)
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
  }, [])

  const handleLookup = useCallback(() => {
    handleLookupDirect(reference, translation)
  }, [reference, translation, handleLookupDirect])

  const handleTranslationChange = useCallback((newTranslation: BibleTranslation) => {
    setTranslation(newTranslation)
    if (reference.trim()) {
      handleLookupDirect(reference, newTranslation)
    }
  }, [reference, handleLookupDirect])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLookup()
  }

  const handleInsert = useCallback(() => {
    if (!passage || !onInsert) return
    const formattedText = passage.verses.map(v => `${v.text}`).join(' ')
    const insertText = `\n\n**${passage.reference}** (${passage.translation_name}):\n"${formattedText.trim()}"\n`
    onInsert(insertText, passage.reference)
    setInserted(true)
    setTimeout(() => setInserted(false), 3000)
  }, [passage, onInsert])

  const handleCopy = useCallback(async () => {
    if (!passage) return
    const text = `${passage.reference} (${passage.translation_name})\n${passage.verses.map(v => `${v.verse}. ${v.text}`).join('\n')}`
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch {
      // Fallback
    }
  }, [passage])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[440px] md:w-[480px] bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700/60">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white text-base">Scripture Lookup</h2>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Search any verse &middot; Multiple translations</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          <div className="px-5 pb-4 space-y-2.5">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={reference}
                  onChange={(e) => { setReference(e.target.value); setError(null) }}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. John 3:16 or Romans 8:28-39"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 dark:focus:border-amber-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 pr-10"
                />
                {loading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin inline-block" />
                  </div>
                )}
              </div>
              <button
                onClick={handleLookup}
                disabled={loading || !reference.trim()}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-sm font-bold shadow-md shadow-amber-500/20 hover:shadow-lg hover:scale-105 active:scale-100 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 whitespace-nowrap"
              >
                {loading ? '...' : <Search className="w-4 h-4" />}
              </button>
            </div>

            {/* Translation Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex-shrink-0">Translation:</span>
              <div className="flex flex-wrap gap-1.5">
                {TRANSLATIONS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleTranslationChange(t.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      translation === t.id
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-transparent hover:bg-amber-50 dark:hover:bg-amber-900/15 hover:text-amber-600 dark:hover:text-amber-400'
                    }`}
                  >
                    {t.id.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Reference Chips */}
            <div className="flex flex-wrap gap-1.5">
              {['John 3:16', 'Psalm 23', 'Romans 8:28', 'Phil 4:13', 'Prov 3:5-6', 'Isa 40:31', 'Matt 28:19-20', 'Eph 2:8-9'].map(ref => (
                <button
                  key={ref}
                  onClick={() => { setReference(ref); setError(null); handleLookupDirect(ref, translation) }}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-amber-50 dark:hover:bg-amber-900/15 hover:text-amber-600 dark:hover:text-amber-400 transition-all border border-gray-200/60 dark:border-gray-700/40 hover:border-amber-300/60 dark:hover:border-amber-700/40"
                >
                  {ref}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Error State */}
          {error && (
            <div className="m-5 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200/60 dark:border-red-800/40">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-300 text-sm">{error}</p>
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1.5 leading-relaxed">
                    Try formats like: &quot;John 3:16&quot;, &quot;Genesis 1:1-10&quot;, or &quot;Psalm 23&quot;
                  </p>
                  <button
                    onClick={handleLookup}
                    className="mt-2.5 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs font-semibold hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" /> Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && !passage && (
            <div className="m-5 space-y-4">
              <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/40 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
                </div>
                <div className="space-y-3">
                  <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-11/12" />
                  <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                  <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
                  <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400 dark:text-gray-500">
                <span className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                Fetching scripture...
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !passage && !error && (
            <div className="flex flex-col items-center justify-center h-full px-8 py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-3xl mb-4">
                <BookOpen className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1.5">Search Scripture</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
                Enter a Bible reference above or tap a quick link to look up any passage in your preferred translation.
              </p>
            </div>
          )}

          {/* Passage Display */}
          {passage && (
            <div className="p-5 space-y-4">
              {/* Reference Header */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/15 dark:via-orange-900/10 dark:to-yellow-900/10 border border-amber-200/60 dark:border-amber-700/40">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-amber-800 dark:text-amber-300 text-lg flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> {passage.reference}
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-200/60 dark:bg-amber-800/30 text-amber-700 dark:text-amber-400">
                    {passage.translation_name}
                  </span>
                </div>
                {passage.translation_note && (
                  <p className="text-[11px] text-amber-600/70 dark:text-amber-400/60 mt-0.5">{passage.translation_note}</p>
                )}
              </div>

              {/* Verses */}
              <div className="space-y-2 px-1">
                {passage.verses.map((verse, i) => (
                  <p key={i} className="text-[15px] text-gray-800 dark:text-gray-200 leading-[1.8]">
                    <sup className="text-xs font-bold text-amber-600 dark:text-amber-400 mr-1.5 select-none">{verse.verse}</sup>
                    {verse.text}
                  </p>
                ))}
              </div>

              {/* Verse Count */}
              <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 px-1">
                <span>{passage.verses.length} verse{passage.verses.length !== 1 ? 's' : ''}</span>
                <span>&middot;</span>
                <span>{passage.text.split(' ').length} words</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {passage && (
          <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700/60 p-4 bg-gray-50/80 dark:bg-gray-800/50 space-y-2.5">
            {onInsert && (
              <button
                onClick={handleInsert}
                disabled={inserted}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                  inserted
                    ? 'bg-green-500 text-white shadow-md shadow-green-500/20'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20 hover:shadow-lg hover:scale-[1.02] active:scale-100'
                }`}
              >
                {inserted ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Inserted into Lesson!
                  </>
                ) : (
                  <><Check className="w-4 h-4" /> Insert into Lesson</>
                )}
              </button>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5"
              >
                {copySuccess ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Text</>}
              </button>
              <button
                onClick={() => {
                  setPassage(null)
                  setReference('')
                  setError(null)
                  inputRef.current?.focus()
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5"
              >
                <Search className="w-4 h-4" /> New Search
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
