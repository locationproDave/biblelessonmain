import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { BookOpen, Scroll, Tag, Search, X, Clock } from 'lucide-react'

interface SearchResult {
  id: string
  type: 'lesson' | 'passage' | 'topic'
  title: string
  subtitle?: string
  url: string
}

const BIBLE_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
  'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
  'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
  'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
  'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
  'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
  '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
  '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
  'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
  'Jude', 'Revelation'
]

const POPULAR_TOPICS = [
  { title: 'Love & Compassion', search: 'love compassion' },
  { title: 'Faith & Trust', search: 'faith trust' },
  { title: 'Forgiveness', search: 'forgiveness' },
  { title: 'Prayer', search: 'prayer' },
  { title: 'Salvation', search: 'salvation' },
  { title: 'Courage', search: 'courage' },
  { title: 'Obedience', search: 'obedience' },
  { title: 'Grace', search: 'grace' },
]

export function SearchBar({ isMobile = false }: { isMobile?: boolean }) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search logic
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      return
    }

    setIsLoading(true)
    const q = searchQuery.toLowerCase()

    // Local search - Bible books
    const bookMatches = BIBLE_BOOKS
      .filter(book => book.toLowerCase().includes(q))
      .slice(0, 3)
      .map(book => ({
        id: `book-${book}`,
        type: 'passage' as const,
        title: book,
        subtitle: 'Bible Book',
        url: `/generate?book=${encodeURIComponent(book)}`
      }))

    // Topic matches
    const topicMatches = POPULAR_TOPICS
      .filter(t => t.title.toLowerCase().includes(q) || t.search.includes(q))
      .slice(0, 3)
      .map(t => ({
        id: `topic-${t.search}`,
        type: 'topic' as const,
        title: t.title,
        subtitle: 'Popular Topic',
        url: `/generate?topic=${encodeURIComponent(t.title)}`
      }))

    // Try to fetch lessons from API
    let lessonMatches: SearchResult[] = []
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/lessons/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const lessons = await response.json()
        lessonMatches = lessons.slice(0, 4).map((lesson: any) => ({
          id: lesson.id,
          type: 'lesson' as const,
          title: lesson.title,
          subtitle: lesson.passage || lesson.ageGroup,
          url: `/lesson/${lesson.id}`
        }))
      }
    } catch (err) {
      // Silent fail for API search
    }

    setResults([...lessonMatches, ...bookMatches, ...topicMatches])
    setIsLoading(false)
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, performSearch])

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false)
    setQuery('')
    navigate({ to: result.url as any })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setIsOpen(false)
      navigate({ to: '/generate', search: { topic: query } } as any)
      setQuery('')
    }
  }

  const typeIcons = {
    lesson: <BookOpen className="w-4 h-4" />,
    passage: <Scroll className="w-4 h-4" />,
    topic: <Tag className="w-4 h-4" />
  }

  if (isMobile) {
    return (
      <div ref={containerRef} className="relative w-full">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setIsOpen(true) }}
              onFocus={() => setIsOpen(true)}
              placeholder="Search lessons, passages, topics..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F5F8FC] dark:bg-[#1E3A5F]/30 border border-[#E8DCC8] dark:border-[#334155] text-sm text-[#333333] dark:text-white placeholder-[#9CA3AF] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
              data-testid="mobile-search-input"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF] dark:text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>

        {isOpen && (query.length >= 2 || results.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#0F1F33] border border-[#E8DCC8] dark:border-[#334155] rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-[#6B7280] dark:text-[#94A3B8]">
                <span className="inline-block w-4 h-4 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin mr-2" />
                Searching...
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F5F8FC] dark:hover:bg-[#1E3A5F]/30 transition-colors"
                  >
                    <span className="text-lg">{typeIcons[result.type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#333333] dark:text-white truncate">{result.title}</p>
                      {result.subtitle && (
                        <p className="text-xs text-[#6B7280] dark:text-[#94A3B8]">{result.subtitle}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : query.length >= 2 ? (
              <div className="p-4 text-center text-sm text-[#6B7280] dark:text-[#94A3B8]">
                No results found. Press Enter to search for "{query}"
              </div>
            ) : null}
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true) }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search..."
            className="w-40 lg:w-48 pl-9 pr-3 py-2 rounded-xl bg-[#F5F8FC] dark:bg-[#1E3A5F]/30 border border-[#E8DCC8] dark:border-[#334155] text-sm text-[#333333] dark:text-white placeholder-[#9CA3AF] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent focus:w-64 transition-all"
            data-testid="search-input"
          />
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] dark:text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </form>

      {isOpen && (query.length >= 2 || results.length > 0) && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-[#0F1F33] border border-[#E8DCC8] dark:border-[#334155] rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-[#6B7280] dark:text-[#94A3B8]">
              <span className="inline-block w-4 h-4 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin mr-2" />
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F5F8FC] dark:hover:bg-[#1E3A5F]/30 transition-colors"
                >
                  <span className="text-lg">{typeIcons[result.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#333333] dark:text-white truncate">{result.title}</p>
                    {result.subtitle && (
                      <p className="text-xs text-[#6B7280] dark:text-[#94A3B8]">{result.subtitle}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-sm text-[#6B7280] dark:text-[#94A3B8]">
              No results found. Press Enter to search for "{query}"
            </div>
          ) : null}

          {/* Quick Links */}
          {query.length < 2 && (
            <div className="p-4 border-t border-[#E8DCC8] dark:border-[#334155]">
              <p className="text-xs font-bold text-[#9CA3AF] dark:text-[#64748B] uppercase tracking-wider mb-2">Popular Topics</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TOPICS.slice(0, 4).map((topic) => (
                  <button
                    key={topic.search}
                    onClick={() => handleSelect({ id: `topic-${topic.search}`, type: 'topic', title: topic.title, url: `/generate?topic=${encodeURIComponent(topic.title)}` })}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[#F5F8FC] dark:bg-[#1E3A5F]/30 text-[#4B5563] dark:text-[#CBD5E1] hover:bg-[#D4A017]/10 hover:text-[#D4A017] transition-colors"
                  >
                    {topic.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
