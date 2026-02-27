import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { aiAPI, preferencesAPI } from '@/lib/api'
import { lessonStore } from '@/lib/lesson-store'
import { Mic, Baby, User, GraduationCap, Users, BookOpen, Sparkles, CheckCircle } from 'lucide-react'

const STEPS = ['welcome', 'role', 'translation', 'ageGroup', 'generate'] as const
type Step = typeof STEPS[number]

const ROLES = [
  { id: 'lead-pastor', label: 'Lead Pastor', icon: <Mic className="w-6 h-6" />, desc: 'You lead services and oversee teaching ministry' },
  { id: 'childrens-director', label: "Children's Director", icon: <Baby className="w-6 h-6" />, desc: 'You coordinate and plan children\'s programs' },
  { id: 'sunday-school-teacher', label: 'Sunday School Teacher', icon: <BookOpen className="w-6 h-6" />, desc: 'You teach a class weekly or regularly' },
  { id: 'volunteer', label: 'Volunteer', icon: <Users className="w-6 h-6" />, desc: 'You help out when and where needed' },
]

const TRANSLATIONS = [
  { id: 'NIV', label: 'NIV', full: 'New International Version' },
  { id: 'KJV', label: 'KJV', full: 'King James Version' },
  { id: 'ESV', label: 'ESV', full: 'English Standard Version' },
  { id: 'NASB', label: 'NASB', full: 'New American Standard Bible' },
  { id: 'NLT', label: 'NLT', full: 'New Living Translation' },
  { id: 'NKJV', label: 'NKJV', full: 'New King James Version' },
  { id: 'CSB', label: 'CSB', full: 'Christian Standard Bible' },
  { id: 'MSG', label: 'MSG', full: 'The Message' },
]

const AGE_GROUPS = [
  { id: 'Preschool (3-5)', label: 'Preschool', ages: '3-5', icon: <Baby className="w-8 h-8" /> },
  { id: 'Elementary (6-10)', label: 'Elementary', ages: '6-10', icon: <User className="w-8 h-8" /> },
  { id: 'Pre-Teen (11-13)', label: 'Pre-Teen', ages: '11-13', icon: <User className="w-8 h-8" /> },
  { id: 'Teen (14-17)', label: 'Teen', ages: '14-17', icon: <GraduationCap className="w-8 h-8" /> },
  { id: 'Adult (18+)', label: 'Adult', ages: '18+', icon: <Users className="w-8 h-8" /> },
]

const GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-purple-500 to-violet-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-blue-600',
]

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const navigate = useNavigate()
  
  const generateLessonMut = useMutation({
    mutationFn: aiAPI.generateLesson,
  })
  const completeOnboardingMut = useMutation({
    mutationFn: preferencesAPI.completeOnboarding,
  })

  const [currentStep, setCurrentStep] = useState<Step>('welcome')
  const [role, setRole] = useState('')
  const [translation, setTranslation] = useState('NIV')
  const [ageGroup, setAgeGroup] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const [genProgress, setGenProgress] = useState(0)
  const [genLabel, setGenLabel] = useState('')
  const [fadeClass, setFadeClass] = useState('opacity-100 translate-y-0')

  const stepIndex = STEPS.indexOf(currentStep)
  const progressPercent = ((stepIndex) / (STEPS.length - 1)) * 100

  const transition = (next: Step) => {
    setFadeClass('opacity-0 translate-y-4')
    setTimeout(() => {
      setCurrentStep(next)
      setFadeClass('opacity-0 -translate-y-4')
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setFadeClass('opacity-100 translate-y-0'))
      })
    }, 200)
  }

  const goNext = () => {
    const i = STEPS.indexOf(currentStep)
    if (i < STEPS.length - 1) transition(STEPS[i + 1])
  }

  const goBack = () => {
    const i = STEPS.indexOf(currentStep)
    if (i > 0) transition(STEPS[i - 1])
  }

  const skip = () => {
    // Apply defaults for skipped step
    if (currentStep === 'role') setRole('sunday-school-teacher')
    if (currentStep === 'translation') setTranslation('NIV')
    if (currentStep === 'ageGroup') setAgeGroup('Elementary (6-10)')
    goNext()
  }

  const finishWithoutLesson = async () => {
    try {
      await completeOnboardingMut.mutateAsync({
        ministryRole: role || 'sunday-school-teacher',
        bibleVersion: translation || 'NIV',
        preferredAgeGroup: ageGroup || 'Elementary (6-10)',
      })
    } catch (_) { /* best effort */ }
    onComplete()
    navigate({ to: '/lessons' })
  }

  // Animate progress during generation
  useEffect(() => {
    if (!isGenerating) return
    const labels = [
      'Selecting the perfect passage...',
      'Analyzing Psalm 23...',
      'Building lesson structure...',
      'Creating activities...',
      'Writing discussion questions...',
      'Finalizing your lesson...',
    ]
    let step = 0
    setGenProgress(8)
    setGenLabel(labels[0])
    const interval = setInterval(() => {
      step++
      if (step >= labels.length) { clearInterval(interval); return }
      setGenProgress(Math.min(90, Math.round(((step + 1) / labels.length) * 100)))
      setGenLabel(labels[step])
    }, 2200)
    return () => clearInterval(interval)
  }, [isGenerating])

  const handleGenerate = async () => {
    setIsGenerating(true)
    setGenError(null)
    const ag = ageGroup || 'Elementary (6-10)'
    const bv = translation || 'NIV'
    const mr = role || 'sunday-school-teacher'

    try {
      // Save preferences first
      await completeOnboardingMut.mutateAsync({
        ministryRole: mr,
        bibleVersion: bv,
        preferredAgeGroup: ag,
      })

      // Generate lesson
      const result = await generateLessonMut.mutateAsync({
        book: 'Psalms',
        chapter: '23',
        verse: '',
        topic: 'The Lord is My Shepherd',
        theme: "God's Care & Provision",
        ageGroup: ag,
        duration: '45 min',
        format: 'Interactive',
        includeActivities: true,
        includeCrafts: !ag.includes('Adult') && !ag.includes('Teen'),
        includeMemoryVerse: true,
        includeDiscussion: true,
        includePrayer: true,
        includeParentTakeHome: !ag.includes('Adult'),
      })

      setGenProgress(100)
      setGenLabel('Lesson created!')

      const id = `lesson-${Date.now()}`
      const lesson = {
        id,
        title: result.title || 'Psalm 23: The Lord is My Shepherd',
        passage: result.passage || 'Psalm 23',
        ageGroup: result.ageGroup || ag,
        duration: result.duration || '45 minutes',
        format: result.format || 'Interactive',
        theme: result.theme || "God's Care & Provision",
        createdAt: 'Just now',
        memoryVerse: result.memoryVerse || { text: '', reference: '' },
        objectives: result.objectives || [],
        materialsNeeded: result.materialsNeeded || [],
        sections: result.sections || [],
        parentTakeHome: result.parentTakeHome || { summary: '', memoryVerse: '', discussionStarters: [], familyActivity: '', weeklyChallenge: '' },
        crossReferences: result.crossReferences || [],
        teacherNotes: result.teacherNotes || [],
        favorite: false,
        gradient: GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)],
        description: result.description || '',
      }

      lessonStore.add(lesson)

      setTimeout(() => {
        onComplete()
        navigate({ to: '/lesson/$lessonId', params: { lessonId: id } })
      }, 1200)
    } catch (err: any) {
      setIsGenerating(false)
      setGenError(err?.message || 'Something went wrong. No worries — you can try again!')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#F9F7F1] dark:bg-[#1C1917] flex flex-col overflow-auto">
      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-stone-200 dark:bg-stone-700 flex-shrink-0">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-r-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2 pt-6 pb-2 flex-shrink-0">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === stepIndex
                ? 'bg-amber-600 scale-125'
                : i < stepIndex
                  ? 'bg-amber-600/50'
                  : 'bg-stone-300 dark:bg-stone-600'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className={`w-full max-w-2xl transition-all duration-300 ease-out ${fadeClass}`}>

          {/* Step 1: Welcome */}
          {currentStep === 'welcome' && (
            <div className="text-center space-y-8">
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-xl shadow-amber-500/20">
                  <img src="/images/logo-icon.png" alt="" className="w-16 h-16 rounded-xl" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-50 mb-3" style={{ fontFamily: 'Crimson Text, serif' }}>
                  Welcome to Bible Lesson AI
                </h1>
                <p className="text-lg text-stone-500 dark:text-stone-400 max-w-md mx-auto">
                  Create engaging, Scripture-based lessons in minutes — powered by AI
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto text-left">
                {[
                  { icon: <Sparkles className="w-5 h-5 text-amber-600" strokeWidth={1.5} />, text: 'AI-powered lesson plans tailored to your needs' },
                  { icon: <BookOpen className="w-5 h-5 text-amber-600" strokeWidth={1.5} />, text: 'Any passage, topic, or theme from Scripture' },
                  { icon: <Users className="w-5 h-5 text-amber-600" strokeWidth={1.5} />, text: 'Customized for any age group & format' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                    <span className="flex-shrink-0 mt-0.5">{item.icon}</span>
                    <p className="text-sm text-stone-700 dark:text-stone-300 font-medium">{item.text}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={goNext}
                className="px-10 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-amber-600/25 hover:shadow-xl hover:shadow-amber-600/35 hover:scale-105 active:scale-100 transition-all duration-200"
              >
                Get Started →
              </button>
            </div>
          )}

          {/* Step 2: Ministry Role */}
          {currentStep === 'role' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>What's your role?</h2>
                <p className="text-stone-500 dark:text-stone-400">This helps us personalize your experience</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ROLES.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`flex items-start gap-4 p-5 rounded-2xl text-left transition-all duration-200 border-2 ${
                      role === r.id
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-md shadow-amber-500/10'
                        : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/50 hover:border-amber-400'
                    }`}
                  >
                    <span className={`mt-0.5 ${role === r.id ? 'text-amber-600' : 'text-stone-500 dark:text-stone-400'}`}>{r.icon}</span>
                    <div>
                      <p className={`font-bold text-base ${role === r.id ? 'text-amber-700 dark:text-amber-500' : 'text-stone-900 dark:text-stone-100'}`}>{r.label}</p>
                      <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">{r.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <button onClick={goBack} className="px-6 py-3 rounded-xl text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 font-medium transition-colors">← Back</button>
                <div className="flex items-center gap-3">
                  <button onClick={skip} className="text-sm text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 underline transition-colors">Skip</button>
                  <button
                    onClick={goNext}
                    disabled={!role}
                    className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-lg shadow-amber-600/20 hover:shadow-xl hover:scale-105 active:scale-100 transition-all duration-200 disabled:opacity-40 disabled:hover:scale-100"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Bible Translation */}
          {currentStep === 'translation' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>Preferred Bible Translation</h2>
                <p className="text-stone-500 dark:text-stone-400">We'll use this as the default for your lessons</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TRANSLATIONS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTranslation(t.id)}
                    className={`p-4 rounded-2xl text-center transition-all duration-200 border-2 ${
                      translation === t.id
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-md shadow-amber-500/10'
                        : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/50 hover:border-amber-400'
                    }`}
                  >
                    <p className={`font-extrabold text-xl ${translation === t.id ? 'text-amber-700 dark:text-amber-500' : 'text-stone-900 dark:text-stone-100'}`}>{t.label}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-tight">{t.full}</p>
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <button onClick={goBack} className="px-6 py-3 rounded-xl text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 font-medium transition-colors">← Back</button>
                <div className="flex items-center gap-3">
                  <button onClick={skip} className="text-sm text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 underline transition-colors">Skip</button>
                  <button
                    onClick={goNext}
                    className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-lg shadow-amber-600/20 hover:shadow-xl hover:scale-105 active:scale-100 transition-all duration-200"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Age Group */}
          {currentStep === 'ageGroup' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>Who do you primarily teach?</h2>
                <p className="text-stone-500 dark:text-stone-400">We'll tailor your first lesson to this age group</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {AGE_GROUPS.map(ag => (
                  <button
                    key={ag.id}
                    onClick={() => setAgeGroup(ag.id)}
                    className={`flex flex-col items-center gap-2 p-6 rounded-2xl text-center transition-all duration-200 border-2 ${
                      ageGroup === ag.id
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-md shadow-amber-500/10'
                        : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/50 hover:border-amber-400'
                    }`}
                  >
                    <span className={`${ageGroup === ag.id ? 'text-amber-600' : 'text-stone-500 dark:text-stone-400'}`}>{ag.icon}</span>
                    <div>
                      <p className={`font-bold text-base ${ageGroup === ag.id ? 'text-amber-700 dark:text-amber-500' : 'text-stone-900 dark:text-stone-100'}`}>{ag.label}</p>
                      <p className="text-sm text-stone-500 dark:text-stone-400">Ages {ag.ages}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <button onClick={goBack} className="px-6 py-3 rounded-xl text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 font-medium transition-colors">← Back</button>
                <div className="flex items-center gap-3">
                  <button onClick={skip} className="text-sm text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 underline transition-colors">Skip</button>
                  <button
                    onClick={goNext}
                    disabled={!ageGroup}
                    className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-lg shadow-amber-600/20 hover:shadow-xl hover:scale-105 active:scale-100 transition-all duration-200 disabled:opacity-40 disabled:hover:scale-100"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Generate Sample Lesson */}
          {currentStep === 'generate' && !isGenerating && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>Let's create your first lesson!</h2>
                <p className="text-stone-500 dark:text-stone-400">We'll generate a sample lesson based on your preferences</p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md">
                    <BookOpen className="w-7 h-7 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">Psalm 23: The Lord is My Shepherd</h3>
                    <p className="text-sm text-stone-500 dark:text-stone-400">A universally beloved passage about God's care and provision</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-xs font-semibold text-amber-700 dark:text-amber-500">
                    {AGE_GROUPS.find(a => a.id === ageGroup)?.label || 'Elementary'} • Ages {AGE_GROUPS.find(a => a.id === ageGroup)?.ages || '6-10'}
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-700 text-xs font-semibold text-stone-600 dark:text-stone-300">
                    {translation} Translation
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    45 min • Interactive
                  </span>
                </div>
              </div>

              {genError && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200/60 dark:border-red-800/40 text-sm text-red-700 dark:text-red-300">
                  <p className="font-medium mb-2">{genError}</p>
                  <div className="flex gap-3">
                    <button onClick={handleGenerate} className="text-sm font-semibold underline hover:text-red-800 dark:hover:text-red-200">Try Again</button>
                    <button onClick={finishWithoutLesson} className="text-sm font-semibold underline hover:text-red-800 dark:hover:text-red-200">Skip to Library</button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <button onClick={goBack} className="px-6 py-3 rounded-xl text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 font-medium transition-colors">← Back</button>
                <div className="flex items-center gap-3">
                  <button onClick={finishWithoutLesson} className="text-sm text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 underline transition-colors">Skip to Library</button>
                  <button
                    onClick={handleGenerate}
                    className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold shadow-lg shadow-amber-600/25 hover:shadow-xl hover:scale-105 active:scale-100 transition-all duration-200 flex items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" strokeWidth={1.5} /> Generate My First Lesson
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Generating Overlay */}
          {currentStep === 'generate' && isGenerating && (
            <div className="text-center space-y-8">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-xl shadow-amber-500/20 animate-pulse">
                <Sparkles className="w-10 h-10 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>Creating Your Lesson...</h2>
                <p className="text-stone-500 dark:text-stone-400">This usually takes about 15-20 seconds</p>
              </div>
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-amber-700 dark:text-amber-500">{genLabel}</span>
                  <span className="text-sm font-bold text-stone-400">{genProgress}%</span>
                </div>
                <div className="h-3 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-700 ease-out"
                    style={{ width: `${genProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
