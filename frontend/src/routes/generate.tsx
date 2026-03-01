import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef, useCallback } from 'react'
import { aiAPI } from '@/lib/api'
import { type LessonConfig, lessonStore } from '@/lib/lesson-store'
import { ScriptureLookup } from '@/components/ScriptureLookup'
import { useI18n } from '@/i18n'
import { useSEO, trackPageView, trackEvent } from '@/lib/seo'
import { BookOpen, Users, Settings, Sparkles, AlertTriangle, ClipboardList, Lightbulb, MessageSquare, HandHeart, Search, Zap, Palette, GraduationCap, UsersRound, Check } from 'lucide-react'

interface GenerateSearch {
  book?: string
  chapter?: string
  verse?: string
  topic?: string
  theme?: string
  ageGroup?: string
  duration?: string
  format?: string
  autoGenerate?: boolean
}

export const Route = createFileRoute('/generate')({
  component: GeneratePage,
  validateSearch: (search: Record<string, unknown>): GenerateSearch => ({
    book: typeof search.book === 'string' ? search.book : undefined,
    chapter: typeof search.chapter === 'string' ? search.chapter : undefined,
    verse: typeof search.verse === 'string' ? search.verse : undefined,
    topic: typeof search.topic === 'string' ? search.topic : undefined,
    theme: typeof search.theme === 'string' ? search.theme : undefined,
    ageGroup: typeof search.ageGroup === 'string' ? search.ageGroup : undefined,
    duration: typeof search.duration === 'string' ? search.duration : undefined,
    format: typeof search.format === 'string' ? search.format : undefined,
    autoGenerate: search.autoGenerate === true || search.autoGenerate === 'true',
  }),
})

type Step = 'scripture' | 'audience' | 'customize'

const BIBLE_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
  'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
  'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations',
  'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
  'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
  'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts',
  'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy',
  '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
  '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
  'Jude', 'Revelation',
]

// Chapter counts for each book of the Bible
const BOOK_CHAPTERS: Record<string, number> = {
  'Genesis': 50, 'Exodus': 40, 'Leviticus': 27, 'Numbers': 36, 'Deuteronomy': 34,
  'Joshua': 24, 'Judges': 21, 'Ruth': 4, '1 Samuel': 31, '2 Samuel': 24,
  '1 Kings': 22, '2 Kings': 25, '1 Chronicles': 29, '2 Chronicles': 36, 'Ezra': 10,
  'Nehemiah': 13, 'Esther': 10, 'Job': 42, 'Psalms': 150, 'Proverbs': 31,
  'Ecclesiastes': 12, 'Song of Solomon': 8, 'Isaiah': 66, 'Jeremiah': 52, 'Lamentations': 5,
  'Ezekiel': 48, 'Daniel': 12, 'Hosea': 14, 'Joel': 3, 'Amos': 9,
  'Obadiah': 1, 'Jonah': 4, 'Micah': 7, 'Nahum': 3, 'Habakkuk': 3,
  'Zephaniah': 3, 'Haggai': 2, 'Zechariah': 14, 'Malachi': 4,
  'Matthew': 28, 'Mark': 16, 'Luke': 24, 'John': 21, 'Acts': 28,
  'Romans': 16, '1 Corinthians': 16, '2 Corinthians': 13, 'Galatians': 6, 'Ephesians': 6,
  'Philippians': 4, 'Colossians': 4, '1 Thessalonians': 5, '2 Thessalonians': 3, '1 Timothy': 6,
  '2 Timothy': 4, 'Titus': 3, 'Philemon': 1, 'Hebrews': 13, 'James': 5,
  '1 Peter': 5, '2 Peter': 3, '1 John': 5, '2 John': 1, '3 John': 1,
  'Jude': 1, 'Revelation': 22,
}

// Verse counts per chapter for each book
const CHAPTER_VERSES: Record<string, number[]> = {
  'Genesis': [31,25,24,26,32,22,24,22,29,32,32,20,18,24,21,16,27,33,38,18,34,24,20,67,34,35,46,22,35,43,55,32,20,31,29,43,36,30,23,23,57,38,34,34,28,34,31,22,33,26],
  'Exodus': [22,25,22,31,23,30,25,32,35,29,10,51,22,31,27,36,16,27,25,26,36,31,33,18,40,37,21,43,46,38,18,35,23,35,35,38,29,31,43,38],
  'Leviticus': [17,16,17,35,19,30,38,36,24,20,47,8,59,57,33,34,16,30,37,27],
  'Numbers': [54,34,51,49,31,27,89,26,23,36,35,16,33,45,41,50,13,32,22,29,35,41,30,25,18,65,23,31,40,16,54,42,56,29,34,13],
  'Deuteronomy': [46,37,29,49,33,25,26,20,29,22,32,32,18,29,23,22,20,22,21,20,23,30,25,22,19,19,26,68,29,20,30,52,29,12],
  'Joshua': [18,24,17,24,15,27,26,35,27,43,23,24,33,15,63,10,18,28,51,9,45,34,16,33],
  'Judges': [36,23,31,24,31,40,25,35,57,18,40,15,25,20,20,31,13,31,30,48,25],
  'Ruth': [22,23,18,22],
  '1 Samuel': [28,36,21,22,12,21,17,22,27,27,15,25,23,52,35,23,58,30,24,43,15,23,28,23,44,25,12,25,11,31,13],
  '2 Samuel': [27,32,39,12,25,23,29,18,13,19,27,31,39,33,37,23,29,33,43,26,22,51,39,25],
  '1 Kings': [53,46,28,34,18,38,51,66,28,29,43,33,34,31,34,34,24,46,21,43,29,53],
  '2 Kings': [18,25,27,44,27,33,20,29,37,36,21,21,25,29,38,20,41,37,37,21,26,20,37,20,30],
  '1 Chronicles': [54,55,24,43,26,81,40,40,44,14,47,40,14,17,29,43,27,17,19,8,30,19,32,31,31,32,34,21,30],
  '2 Chronicles': [17,18,17,22,14,42,22,18,31,19,23,16,22,15,19,14,19,34,11,37,20,12,21,27,28,23,9,27,36,27,21,33,25,33,27,23],
  'Ezra': [11,70,13,24,17,22,28,36,15,44],
  'Nehemiah': [11,20,32,23,19,19,73,18,38,39,36,47,31],
  'Esther': [22,23,15,17,14,14,10,17,32,3],
  'Job': [22,13,26,21,27,30,21,22,35,22,20,25,28,22,35,22,16,21,29,29,34,30,17,25,6,14,23,28,25,31,40,22,33,37,16,33,24,41,35,27,26,40],
  'Psalms': [6,12,8,8,12,10,17,9,20,18,7,8,6,7,5,11,15,50,14,9,13,31,6,10,22,12,14,9,11,12,24,11,22,22,28,12,40,22,13,17,13,11,5,26,17,11,9,14,20,23,19,9,6,7,23,13,11,11,17,12,8,12,11,10,13,20,7,35,36,5,24,20,28,23,10,12,20,72,13,19,16,8,18,12,13,17,7,18,52,17,16,15,5,23,11,13,12,9,9,5,8,28,22,35,45,48,43,13,31,7,10,10,9,8,18,19,2,29,176,7,8,9,4,8,5,6,5,6,8,8,3,18,3,3,21,26,9,8,24,13,10,7,12,15,21,10,20,14,9,6],
  'Proverbs': [33,22,35,27,23,35,27,36,18,32,31,28,25,35,33,33,28,24,29,30,31],
  'Ecclesiastes': [18,26,22,16,20,12,29,17,18,20,10,14],
  'Song of Solomon': [17,17,11,16,16,13,13,14],
  'Isaiah': [31,22,26,6,30,13,25,22,21,34,16,6,22,32,9,14,14,7,25,6,17,25,18,23,12,21,13,29,24,33,9,20,24,17,10,22,38,22,8,31,29,25,28,28,25,13,15,22,26,11,23,15,12,17,13,12,21,14,21,22,11,12,19,12,25,24],
  'Jeremiah': [19,37,25,31,31,30,34,22,26,25,23,17,27,22,21,21,27,23,15,18,14,30,40,10,38,24,22,17,32,24,40,44,26,22,19,32,21,28,18,16,18,22,13,30,5,28,7,47,39,46,64,34],
  'Lamentations': [22,22,66,22,22],
  'Ezekiel': [28,10,27,17,17,14,27,18,11,22,25,28,23,23,8,63,24,32,14,49,32,31,49,27,17,21,36,26,21,26,18,32,33,31,15,38,28,23,29,49,26,20,27,31,25,24,23,35],
  'Daniel': [21,49,30,37,31,28,28,27,27,21,45,13],
  'Hosea': [11,23,5,19,15,11,16,14,17,15,12,14,16,9],
  'Joel': [20,32,21],
  'Amos': [15,16,15,13,27,14,17,14,15],
  'Obadiah': [21],
  'Jonah': [17,10,10,11],
  'Micah': [16,13,12,13,15,16,20],
  'Nahum': [15,13,19],
  'Habakkuk': [17,20,19],
  'Zephaniah': [18,15,20],
  'Haggai': [15,23],
  'Zechariah': [21,13,10,14,11,15,14,23,17,12,17,14,9,21],
  'Malachi': [14,17,18,6],
  'Matthew': [25,23,17,25,48,34,29,34,38,42,30,50,58,36,39,28,27,35,30,34,46,46,39,51,46,75,66,20],
  'Mark': [45,28,35,41,43,56,37,38,50,52,33,44,37,72,47,20],
  'Luke': [80,52,38,44,39,49,50,56,62,42,54,59,35,35,32,31,37,43,48,47,38,71,56,53],
  'John': [51,25,36,54,47,71,53,59,41,42,57,50,38,31,27,33,26,40,42,31,25],
  'Acts': [26,47,26,37,42,15,60,40,43,48,30,25,52,28,41,40,34,28,41,38,40,30,35,27,27,32,44,31],
  'Romans': [32,29,31,25,21,23,25,39,33,21,36,21,14,23,33,27],
  '1 Corinthians': [31,16,23,21,13,20,40,13,27,33,34,31,13,40,58,24],
  '2 Corinthians': [24,17,18,18,21,18,16,24,15,18,33,21,14],
  'Galatians': [24,21,29,31,26,18],
  'Ephesians': [23,22,21,32,33,24],
  'Philippians': [30,30,21,23],
  'Colossians': [29,23,25,18],
  '1 Thessalonians': [10,20,13,18,28],
  '2 Thessalonians': [12,17,18],
  '1 Timothy': [20,15,16,16,25,21],
  '2 Timothy': [18,26,17,22],
  'Titus': [16,15,15],
  'Philemon': [25],
  'Hebrews': [14,18,19,16,14,20,28,13,28,39,40,29,25],
  'James': [27,26,18,17,20],
  '1 Peter': [25,25,22,19,14],
  '2 Peter': [21,22,18],
  '1 John': [10,29,24,21,21],
  '2 John': [13],
  '3 John': [14],
  'Jude': [25],
  'Revelation': [20,29,22,11,14,17,17,13,21,11,19,17,18,20,8,21,18,24,21,15,27,21],
}

const POPULAR_TOPICS = [
  'Love & Compassion', 'Forgiveness', 'Faith & Trust', 'Courage',
  'Obedience', 'Kindness', 'Honesty', 'Gratitude', 'Hope',
  'God\'s Love', 'Jesus\' Life', 'Miracles', 'Parables', 'Resurrection',
]

const THEMES = [
  'Creation', 'Salvation', 'Grace', 'Redemption', 'Kingdom of God',
  'Discipleship', 'Prayer', 'Worship', 'Service', 'Community',
]

const STEP_ORDER: Step[] = ['scripture', 'audience', 'customize']

const GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-purple-500 to-violet-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-blue-600',
]

interface GenerationProgress {
  step: number
  totalSteps: number
  label: string
  percent: number
}

function GeneratePage() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const search = Route.useSearch()
  const [step, setStep] = useState<Step>('scripture')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [progress, setProgress] = useState<GenerationProgress>({ step: 0, totalSteps: 6, label: '', percent: 0 })

  // Helper to change step and scroll to top
  const goToStep = (newStep: Step) => {
    setStep(newStep)
    // Use setTimeout to ensure scroll happens after React re-render
    setTimeout(() => {
      window.scrollTo(0, 0)
    }, 0)
  }

  // SEO optimization
  useSEO({
    title: 'Create Bible Lesson Plan | Free AI Lesson Generator',
    description: 'Generate custom Sunday school lessons in minutes. Choose from 66 Bible books, 20+ translations, all age groups. Free first lesson, no credit card required.',
    keywords: 'create Bible lesson, AI lesson generator, Sunday school lesson maker, custom Bible study, lesson plan creator, free lesson generator',
  })

  useEffect(() => {
    trackPageView('/generate', 'Create Lesson')
  }, [])
  const [showScriptureLookup, setShowScriptureLookup] = useState(false)
  const [autoGenerateTriggered, setAutoGenerateTriggered] = useState(false)
  const [config, setConfig] = useState<LessonConfig>({
    scripture: {
      book: search.book || '',
      chapter: search.chapter || '',
      verse: search.verse || '',
      topic: search.topic || '',
      theme: search.theme || '',
    },
    audience: {
      ageGroup: search.ageGroup || '',
      duration: search.duration || '45 min',
      format: search.format || '',
    },
    customize: { activities: false, crafts: false, memoryVerse: false, discussion: false, prayer: false, parentTakeHome: false },
  })

  const configRef = useRef(config)
  configRef.current = config
  const handleGenerateRef = useRef<() => void>(() => {})

  // Validation for required fields per step
  const canAdvanceFromStep = (s: Step): boolean => {
    if (s === 'scripture') {
      return !!(config.scripture.book || config.scripture.topic)
    }
    if (s === 'audience') {
      return !!(config.audience.ageGroup && config.audience.duration && config.audience.format)
    }
    return true // customize is optional
  }

  const currentIndex = STEP_ORDER.indexOf(step)

  const generationSteps = [
    t('generate.analyzingScripture'),
    t('generate.buildingStructure'),
    t('generate.creatingTeaching'),
    t('generate.generatingActivities'),
    t('generate.writingQuestions'),
    t('generate.finalizingPlan'),
  ]

  // Animate progress during generation
  useEffect(() => {
    if (!isGenerating) return
    let currentStep = 0
    const steps = [
      t('generate.analyzingScripture'),
      t('generate.buildingStructure'),
      t('generate.creatingTeaching'),
      t('generate.generatingActivities'),
      t('generate.writingQuestions'),
      t('generate.finalizingPlan'),
    ]
    const interval = setInterval(() => {
      currentStep++
      if (currentStep >= steps.length) {
        clearInterval(interval)
        return
      }
      setProgress({
        step: currentStep,
        totalSteps: steps.length,
        label: steps[currentStep],
        percent: Math.min(90, Math.round((currentStep / steps.length) * 100)),
      })
    }, 2500)
    setProgress({ step: 0, totalSteps: steps.length, label: steps[0], percent: 5 })
    return () => clearInterval(interval)
  }, [isGenerating])

  const handleGenerate = async () => {
    setIsGenerating(true)
    setGenerationError(null)
    try {
      const result = await aiAPI.generateLesson({
        book: config.scripture.book,
        chapter: config.scripture.chapter,
        verse: config.scripture.verse,
        topic: config.scripture.topic,
        theme: config.scripture.theme,
        ageGroup: config.audience.ageGroup,
        duration: config.audience.duration,
        format: config.audience.format,
        language: 'English',
        includeActivities: config.customize.activities,
        includeCrafts: config.customize.crafts,
        includeMemoryVerse: config.customize.memoryVerse,
        includeDiscussion: config.customize.discussion,
        includePrayer: config.customize.prayer,
        includeParentTakeHome: config.customize.parentTakeHome,
      })

      setProgress({ step: 6, totalSteps: 6, label: t('generate.complete'), percent: 100 })

      const id = `lesson-${Date.now()}`
      const lesson = {
        id,
        title: result.title || `${config.scripture.book || config.scripture.topic}: Lesson`,
        passage: result.passage || `${config.scripture.book} ${config.scripture.chapter}${config.scripture.verse ? ':' + config.scripture.verse : ''}`,
        ageGroup: result.ageGroup || config.audience.ageGroup || 'Elementary (6-10)',
        duration: result.duration || config.audience.duration || '45 minutes',
        format: result.format || config.audience.format || 'Interactive',
        theme: result.theme || config.scripture.topic || config.scripture.theme || 'God\'s Love',
        createdAt: 'Just now',
        memoryVerse: result.memoryVerse || { text: '', reference: '' },
        objectives: result.objectives || [],
        materialsNeeded: result.materialsNeeded || [],
        sections: result.sections || [],
        parentTakeHome: result.parentTakeHome || { summary: '', memoryVerse: '', discussionStarters: [], familyActivity: '', weeklyChallenge: '' },
        crossReferences: (result.crossReferences || []).map((ref: any) => 
          typeof ref === 'string' 
            ? { reference: ref, text: '' } 
            : { reference: ref.reference || '', text: ref.text || '' }
        ),
        teacherNotes: result.teacherNotes || [],
        favorite: false,
        gradient: GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)],
        description: result.description || '',
      }

      lessonStore.add(lesson)

      setTimeout(() => {
        navigate({ to: '/lesson/$lessonId', params: { lessonId: id } })
      }, 800)
    } catch (err: any) {
      setIsGenerating(false)
      setGenerationError(err?.message || 'Failed to generate lesson. Please try again.')
    }
  }

  // Keep ref in sync so auto-generate can call it
  handleGenerateRef.current = handleGenerate

  // Auto-generate when coming from homepage sample lessons
  useEffect(() => {
    if (search.autoGenerate && !autoGenerateTriggered && !isGenerating) {
      setAutoGenerateTriggered(true)
      const fmt = search.format || 'Interactive'
      const ag = search.ageGroup || 'Elementary (6-10)'
      setConfig(prev => ({
        ...prev,
        audience: { ...prev.audience, ageGroup: ag, format: fmt },
      }))
      setTimeout(() => {
        handleGenerateRef.current()
      }, 500)
    }
  }, [search.autoGenerate, autoGenerateTriggered, isGenerating])

  const stepMeta = [
    { key: 'scripture' as const, label: t('generate.scripture'), icon: <BookOpen className="w-5 h-5" />, desc: t('generate.scriptureDesc') },
    { key: 'audience' as const, label: t('generate.audience'), icon: <Users className="w-5 h-5" />, desc: t('generate.audienceDesc') },
    { key: 'customize' as const, label: t('generate.customize'), icon: <Settings className="w-5 h-5" />, desc: t('generate.customizeDesc') },
  ]

  return (
    <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917] py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-500 mb-2">
            <Sparkles className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-sm font-semibold uppercase tracking-wider">Lesson Generator</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Text, serif' }}>{t('generate.title')}</h1>
          <p className="text-base text-stone-500 dark:text-stone-400">{t('generate.subtitle')}</p>
        </div>

        {/* Step Indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-6 left-[calc(16.67%)] right-[calc(16.67%)] h-1 bg-stone-200 dark:bg-stone-700 rounded-full" />
            <div className="absolute top-6 left-[calc(16.67%)] h-1 bg-amber-600 rounded-full transition-all duration-500" style={{ width: `${currentIndex * 33.33}%` }} />
            {stepMeta.map((s, i) => {
              const isCompleted = currentIndex > i
              const isCurrent = step === s.key
              return (
                <button key={s.key} onClick={() => goToStep(s.key)} className="relative flex flex-col items-center flex-1 group">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${isCurrent ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 scale-110' : isCompleted ? 'bg-emerald-500 text-white shadow-md' : 'bg-white dark:bg-stone-800 text-stone-400 dark:text-stone-500 border-2 border-stone-200 dark:border-stone-700 group-hover:border-amber-400 dark:group-hover:border-amber-600'}`}>
                    {isCompleted ? <Check className="w-4 h-4" strokeWidth={2} /> : s.icon}
                  </div>
                  <p className={`mt-2 text-sm font-semibold transition-colors ${isCurrent ? 'text-amber-700 dark:text-amber-500' : 'text-stone-500 dark:text-stone-400'}`}>{s.label}</p>
                  <p className="text-xs text-stone-400 dark:text-stone-500 hidden sm:block">{s.desc}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm overflow-hidden mb-8">
          <div className="p-6 sm:p-8">
            {step === 'scripture' && <ScriptureStep config={config} setConfig={setConfig} showLookup={showScriptureLookup} setShowLookup={setShowScriptureLookup} />}
            {step === 'audience' && <AudienceStep config={config} setConfig={setConfig} />}
            {step === 'customize' && <CustomizeStep config={config} setConfig={setConfig} />}
          </div>
        </div>

        {/* Generation Error */}
        {generationError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/40 text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="font-medium">{generationError}</p>
              <button onClick={() => setGenerationError(null)} className="text-xs underline mt-1 hover:text-red-800 dark:hover:text-red-200">{t('common.dismiss')}</button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button onClick={() => { if (currentIndex > 0) goToStep(STEP_ORDER[currentIndex - 1]) }} disabled={currentIndex === 0} className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md">
            ← {t('generate.back')}
          </button>
          {step === 'customize' ? (
            <button onClick={handleGenerate} disabled={isGenerating} className="relative px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold shadow-md shadow-amber-600/20 hover:shadow-lg hover:shadow-amber-600/30 hover:scale-105 active:scale-100 transition-all duration-200 disabled:opacity-80 disabled:hover:scale-100">
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('generate.generating')}
                </span>
              ) : (
                <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" strokeWidth={1.5} /> {t('generate.generateLesson')}</span>
              )}
            </button>
          ) : (
            <button onClick={() => goToStep(STEP_ORDER[currentIndex + 1])} disabled={!canAdvanceFromStep(step)} className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold shadow-md shadow-amber-600/20 hover:shadow-lg hover:shadow-amber-600/30 hover:scale-105 active:scale-100 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed">
              {t('generate.next')} →
            </button>
          )}
        </div>

        {/* Summary Preview */}
        {(config.scripture.book || config.scripture.topic) && (
          <div className="mt-8 p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40">
            <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-500 mb-3 flex items-center gap-1.5"><ClipboardList className="w-4 h-4" strokeWidth={1.5} /> {t('generate.lessonSummary')}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              {config.scripture.book && (
                <div>
                  <span className="text-stone-500 dark:text-stone-400 text-xs block">{t('generate.passage')}</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">{config.scripture.book} {config.scripture.chapter}{config.scripture.verse ? `:${config.scripture.verse}` : ''}</span>
                </div>
              )}
              {config.scripture.topic && (
                <div>
                  <span className="text-stone-500 dark:text-stone-400 text-xs block">{t('generate.topic')}</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">{config.scripture.topic}</span>
                </div>
              )}
              {config.audience.ageGroup && (
                <div>
                  <span className="text-stone-500 dark:text-stone-400 text-xs block">{t('generate.ageGroup')}</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">{config.audience.ageGroup}</span>
                </div>
              )}
              {config.audience.duration && (
                <div>
                  <span className="text-stone-500 dark:text-stone-400 text-xs block">{t('generate.duration')}</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">{config.audience.duration}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Generating Overlay with Progress Bar */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-800 rounded-2xl p-8 sm:p-10 max-w-md w-full mx-4 shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shadow-lg animate-pulse">
              <Sparkles className="w-8 h-8 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>{t('generate.creatingLesson')}</h3>
            <p className="text-stone-500 dark:text-stone-400 mb-6 text-sm">{t('generate.creatingDesc')}</p>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-500">{progress.label}</span>
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">{progress.percent}%</span>
              </div>
              <div className="h-2 rounded-full bg-stone-100 dark:bg-stone-700 overflow-hidden">
                <div className="h-full rounded-full bg-amber-600 transition-all duration-700 ease-out" style={{ width: `${progress.percent}%` }} />
              </div>
            </div>

            <div className="space-y-3">
              {generationSteps.map((label, i) => (
                <GeneratingStep key={i} label={label} done={progress.step > i} active={progress.step === i} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function GeneratingStep({ label, done, active }: { label: string; done?: boolean; active?: boolean }) {
  return (
    <div className="flex items-center gap-3 text-left">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : active ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-stone-100 dark:bg-stone-700'}`}>
        {done ? <Check className="w-3 h-3" strokeWidth={2} /> : active ? <span className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /> : <span className="w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-500" />}
      </div>
      <span className={`text-sm ${done ? 'text-emerald-700 dark:text-emerald-400' : active ? 'text-amber-700 dark:text-amber-400 font-medium' : 'text-stone-400 dark:text-stone-500'}`}>{label}</span>
    </div>
  )
}

function ScriptureStep({ config, setConfig, showLookup, setShowLookup }: { config: LessonConfig; setConfig: (c: LessonConfig) => void; showLookup: boolean; setShowLookup: (v: boolean) => void }) {
  const [inputMode, setInputMode] = useState<'passage' | 'topic'>('passage')
  const { t } = useI18n()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>{t('generate.chooseScripture')}</h2>
        <p className="text-stone-500 dark:text-stone-400">{t('generate.chooseScriptureDesc')}</p>
      </div>

      <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-700/50 rounded-xl w-fit">
        <button onClick={() => setInputMode('passage')} className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${inputMode === 'passage' ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm' : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'}`}><BookOpen className="w-4 h-4" strokeWidth={1.5} /> {t('generate.byPassage')}</button>
        <button onClick={() => setInputMode('topic')} className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${inputMode === 'topic' ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm' : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'}`}><Lightbulb className="w-4 h-4" strokeWidth={1.5} /> {t('generate.byTopic')}</button>
      </div>

      {inputMode === 'passage' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">{t('generate.book')}</label>
              <select value={config.scripture.book} onChange={(e) => setConfig({ ...config, scripture: { ...config.scripture, book: e.target.value, chapter: '', verse: '' } })} className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all">
                <option value="">{t('generate.selectBook')}</option>
                {BIBLE_BOOKS.map(book => <option key={book} value={book}>{book}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">{t('generate.chapter')}</label>
              <select value={config.scripture.chapter} onChange={(e) => setConfig({ ...config, scripture: { ...config.scripture, chapter: e.target.value, verse: '' } })} disabled={!config.scripture.book} className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all disabled:opacity-50">
                <option value="">Select chapter</option>
                {config.scripture.book && BOOK_CHAPTERS[config.scripture.book] && Array.from({ length: BOOK_CHAPTERS[config.scripture.book] }, (_, i) => (
                  <option key={i + 1} value={String(i + 1)}>{i + 1}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">{t('generate.verses')}</label>
              <select value={config.scripture.verse} onChange={(e) => setConfig({ ...config, scripture: { ...config.scripture, verse: e.target.value } })} disabled={!config.scripture.chapter} className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all disabled:opacity-50">
                <option value="">All verses</option>
                {config.scripture.book && config.scripture.chapter && CHAPTER_VERSES[config.scripture.book] && (() => {
                  const chIdx = parseInt(config.scripture.chapter) - 1
                  const verseCount = CHAPTER_VERSES[config.scripture.book]?.[chIdx] || 0
                  return Array.from({ length: verseCount }, (_, i) => (
                    <option key={i + 1} value={String(i + 1)}>{i + 1}</option>
                  ))
                })()}
              </select>
            </div>
          </div>

          {/* Scripture Lookup Toggle */}
          <button onClick={() => setShowLookup(!showLookup)} className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
            {showLookup ? <><BookOpen className="w-4 h-4" strokeWidth={1.5} /> {t('generate.hideScripture')}</> : <><Search className="w-4 h-4" strokeWidth={1.5} /> {t('generate.previewScripture')}</>}
          </button>

          {showLookup && (
            <ScriptureLookup
              initialReference={config.scripture.book ? `${config.scripture.book} ${config.scripture.chapter}${config.scripture.verse ? ':' + config.scripture.verse : ''}` : ''}
              compact
            />
          )}

          <div>
            <label className="block text-sm font-semibold text-stone-600 dark:text-stone-400 mb-3 flex items-center gap-1.5"><Zap className="w-4 h-4" strokeWidth={1.5} /> {t('generate.quickPicks')}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { book: 'John', ch: '3', v: '16', label: 'John 3:16' },
                { book: 'Luke', ch: '10', v: '25-37', label: 'Good Samaritan' },
                { book: 'Genesis', ch: '1', v: '', label: 'Creation' },
                { book: '1 Samuel', ch: '17', v: '', label: 'David & Goliath' },
                { book: 'Luke', ch: '15', v: '11-32', label: 'Prodigal Son' },
                { book: 'Matthew', ch: '5', v: '1-12', label: 'Beatitudes' },
              ].map((pick) => (
                <button key={pick.label} onClick={() => setConfig({ ...config, scripture: { ...config.scripture, book: pick.book, chapter: pick.ch, verse: pick.v } })} className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${config.scripture.book === pick.book && config.scripture.chapter === pick.ch ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 shadow-sm' : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-amber-400 dark:hover:border-amber-600 hover:bg-amber-50/50 dark:hover:bg-amber-900/10'}`}>
                  {pick.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">{t('generate.topic')}</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {POPULAR_TOPICS.map(topic => (
                <button key={topic} onClick={() => setConfig({ ...config, scripture: { ...config.scripture, topic } })} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${config.scripture.topic === topic ? 'bg-amber-600 text-white shadow-md' : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-400'}`}>
                  {topic}
                </button>
              ))}
            </div>
            <input type="text" value={config.scripture.topic} onChange={(e) => setConfig({ ...config, scripture: { ...config.scripture, topic: e.target.value } })} placeholder={t('generate.customTopic')} className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">{t('generate.theme')}</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {THEMES.map(theme => (
                <button key={theme} onClick={() => setConfig({ ...config, scripture: { ...config.scripture, theme } })} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${config.scripture.theme === theme ? 'bg-amber-600 text-white shadow-md' : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-400'}`}>
                  {theme}
                </button>
              ))}
            </div>
            <input type="text" value={config.scripture.theme} onChange={(e) => setConfig({ ...config, scripture: { ...config.scripture, theme: e.target.value } })} placeholder={t('generate.customTheme')} className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" />
          </div>
        </div>
      )}
    </div>
  )
}

function AudienceStep({ config, setConfig }: { config: LessonConfig; setConfig: (c: LessonConfig) => void }) {
  const { t } = useI18n()
  const ageGroups = [
    { label: t('age.preschool'), icon: <Users className="w-5 h-5" strokeWidth={1.5} />, desc: t('age.preschoolDesc') },
    { label: t('age.elementary'), icon: <Users className="w-5 h-5" strokeWidth={1.5} />, desc: t('age.elementaryDesc') },
    { label: t('age.preteen'), icon: <Users className="w-5 h-5" strokeWidth={1.5} />, desc: t('age.preteenDesc') },
    { label: t('age.teen'), icon: <GraduationCap className="w-5 h-5" strokeWidth={1.5} />, desc: t('age.teenDesc') },
    { label: t('age.adult'), icon: <UsersRound className="w-5 h-5" strokeWidth={1.5} />, desc: t('age.adultDesc') },
  ]
  const durations = [
    { label: t('duration.30'), desc: t('duration.30Desc') },
    { label: t('duration.45'), desc: t('duration.45Desc') },
    { label: t('duration.60'), desc: t('duration.60Desc') },
    { label: t('duration.90'), desc: t('duration.90Desc') },
  ]
  const formats = [
    { label: t('format.traditional'), icon: <BookOpen className="w-5 h-5" strokeWidth={1.5} />, desc: t('format.traditionalDesc') },
    { label: t('format.discussion'), icon: <MessageSquare className="w-5 h-5" strokeWidth={1.5} />, desc: t('format.discussionDesc') },
    { label: t('format.interactive'), icon: <Sparkles className="w-5 h-5" strokeWidth={1.5} />, desc: t('format.interactiveDesc') },
    { label: t('format.activity'), icon: <Palette className="w-5 h-5" strokeWidth={1.5} />, desc: t('format.activityDesc') },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>{t('generate.setAudience')}</h2>
        <p className="text-stone-500 dark:text-stone-400">{t('generate.setAudienceDesc')}</p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">{t('generate.ageGroup')}</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ageGroups.map(group => (
            <button key={group.label} onClick={() => setConfig({ ...config, audience: { ...config.audience, ageGroup: group.label } })} className={`flex items-start gap-3 p-4 rounded-xl text-left transition-all duration-200 border-2 ${config.audience.ageGroup === group.label ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 shadow-sm' : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-amber-400 dark:hover:border-amber-600'}`}>
              <span className="text-amber-600 dark:text-amber-500 mt-0.5">{group.icon}</span>
              <div>
                <p className={`font-semibold text-sm ${config.audience.ageGroup === group.label ? 'text-amber-700 dark:text-amber-400' : 'text-stone-900 dark:text-stone-100'}`}>{group.label}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{group.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">{t('generate.lessonDuration')}</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {durations.map(d => (
            <button key={d.label} onClick={() => setConfig({ ...config, audience: { ...config.audience, duration: d.label } })} className={`p-4 rounded-xl text-center transition-all duration-200 border-2 ${config.audience.duration === d.label ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 shadow-sm' : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-amber-400 dark:hover:border-amber-600'}`}>
              <p className={`font-bold text-lg ${config.audience.duration === d.label ? 'text-amber-700 dark:text-amber-400' : 'text-stone-900 dark:text-stone-100'}`}>{d.label}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{d.desc}</p>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">{t('generate.lessonFormat')}</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {formats.map(f => (
            <button key={f.label} onClick={() => setConfig({ ...config, audience: { ...config.audience, format: f.label } })} className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200 border-2 ${config.audience.format === f.label ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 shadow-sm' : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-amber-400 dark:hover:border-amber-600'}`}>
              <span className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-700 flex items-center justify-center text-stone-500 dark:text-stone-400">{f.icon}</span>
              <div>
                <p className={`font-semibold text-sm ${config.audience.format === f.label ? 'text-amber-700 dark:text-amber-400' : 'text-stone-900 dark:text-stone-100'}`}>{f.label}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">{f.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function CustomizeStep({ config, setConfig }: { config: LessonConfig; setConfig: (c: LessonConfig) => void }) {
  const { t } = useI18n()
  const options = [
    { key: 'activities', label: t('generate.activities'), icon: <Sparkles className="w-5 h-5" strokeWidth={1.5} />, desc: t('generate.activitiesDesc') },
    { key: 'crafts', label: t('generate.crafts'), icon: <Palette className="w-5 h-5" strokeWidth={1.5} />, desc: t('generate.craftsDesc') },
    { key: 'memoryVerse', label: t('generate.memoryVerse'), icon: <BookOpen className="w-5 h-5" strokeWidth={1.5} />, desc: t('generate.memoryVerseDesc') },
    { key: 'discussion', label: t('generate.discussion'), icon: <MessageSquare className="w-5 h-5" strokeWidth={1.5} />, desc: t('generate.discussionDesc') },
    { key: 'prayer', label: t('generate.prayer'), icon: <HandHeart className="w-5 h-5" strokeWidth={1.5} />, desc: t('generate.prayerDesc') },
    { key: 'parentTakeHome', label: t('generate.parentTakeHome'), icon: <UsersRound className="w-5 h-5" strokeWidth={1.5} />, desc: t('generate.parentTakeHomeDesc') },
  ]
  const enabledCount = Object.values(config.customize).filter(Boolean).length

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>{t('generate.customizeLesson')}</h2>
          <p className="text-stone-500 dark:text-stone-400">{t('generate.customizeLessonDesc')}</p>
        </div>
        <span className="px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-semibold">{enabledCount}/6</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map(option => {
          const isEnabled = config.customize[option.key as keyof typeof config.customize]
          return (
            <button key={option.key} onClick={() => setConfig({ ...config, customize: { ...config.customize, [option.key]: !isEnabled } })} className={`flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-200 border-2 ${isEnabled ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 shadow-sm' : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-amber-400 dark:hover:border-amber-600'}`}>
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 ${isEnabled ? 'bg-amber-600 text-white' : 'bg-stone-200 dark:bg-stone-700'}`}>
                {isEnabled && <Check className="w-3 h-3" strokeWidth={2} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-stone-500 dark:text-stone-400">{option.icon}</span>
                  <p className={`font-semibold text-sm ${isEnabled ? 'text-amber-700 dark:text-amber-400' : 'text-stone-900 dark:text-stone-100'}`}>{option.label}</p>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{option.desc}</p>
              </div>
            </button>
          )
        })}
      </div>
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40">
        <p className="text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
          <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
          <span><span className="font-semibold">{t('generate.tip').split(':')[0]}:</span> {t('generate.tip').includes(':') ? t('generate.tip').split(':').slice(1).join(':').trim() : t('generate.tip')}</span>
        </p>
      </div>
    </div>
  )
}
