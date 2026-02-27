import { useState, useCallback } from 'react'
import { quizAPI, type Quiz as QuizType, type QuizQuestion } from '@/lib/api'
import { FileText, Brain, ClipboardList, Check, X, RefreshCw, BookOpen, PartyPopper, Loader2 } from 'lucide-react'

interface QuizProps {
  lessonId: string
  lessonTitle: string
  lessonPassage?: string
  lessonTheme?: string
  lessonAgeGroup?: string
  memoryVerse?: string
  lessonContent?: string
}

interface QuizAttempt {
  quizId: string
  answers: Record<string, string>
  score: number
  totalPoints: number
  completed: boolean
  submittedAt: string
}

const DIFFICULTY_CONFIG = {
  easy: { label: 'Easy', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
  medium: { label: 'Medium', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  hard: { label: 'Hard', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
}

const QUESTION_TYPE_LABELS = {
  multiple_choice: 'Multiple Choice',
  true_false: 'True/False',
  fill_blank: 'Fill in the Blank',
  short_answer: 'Short Answer',
}

export function QuizGenerator({ lessonId, lessonTitle, lessonPassage, lessonTheme, lessonAgeGroup, memoryVerse, lessonContent }: QuizProps) {
  const [quiz, setQuiz] = useState<QuizType | null>(null)
  const [existingQuizzes, setExistingQuizzes] = useState<QuizType[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Quiz configuration
  const [questionCount, setQuestionCount] = useState(5)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [questionTypes, setQuestionTypes] = useState<string[]>(['multiple_choice', 'true_false'])
  
  // Quiz attempt state
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)

  // Load existing quizzes for this lesson
  const loadExistingQuizzes = useCallback(async () => {
    setIsLoading(true)
    try {
      const quizzes = await quizAPI.getForLesson(lessonId)
      setExistingQuizzes(quizzes || [])
      setHasLoaded(true)
    } catch (err) {
      console.error('Failed to load quizzes:', err)
    } finally {
      setIsLoading(false)
    }
  }, [lessonId])

  // Generate a new quiz
  const handleGenerateQuiz = useCallback(async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const newQuiz = await quizAPI.generate(lessonId, questionCount, questionTypes, difficulty, {
        title: lessonTitle,
        passage: lessonPassage,
        theme: lessonTheme,
        ageGroup: lessonAgeGroup,
        memoryVerse: memoryVerse,
        content: lessonContent
      })
      setQuiz(newQuiz)
      setExistingQuizzes(prev => [newQuiz, ...prev])
      setAnswers({})
      setShowResults(false)
      setActiveQuestionIndex(0)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to generate quiz. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }, [lessonId, questionCount, questionTypes, difficulty])

  // Toggle question type
  const toggleQuestionType = useCallback((type: string) => {
    setQuestionTypes(prev => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev // Keep at least one type
        return prev.filter(t => t !== type)
      }
      return [...prev, type]
    })
  }, [])

  // Select an existing quiz to take
  const selectQuiz = useCallback((q: QuizType) => {
    setQuiz(q)
    setAnswers({})
    setShowResults(false)
    setActiveQuestionIndex(0)
  }, [])

  // Answer a question
  const handleAnswer = useCallback((questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }, [])

  // Submit quiz and calculate score
  const submitQuiz = useCallback(() => {
    if (!quiz) return
    
    let score = 0
    quiz.questions.forEach(q => {
      if (answers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) {
        score += q.points
      }
    })
    
    const attempt: QuizAttempt = {
      quizId: quiz.id,
      answers,
      score,
      totalPoints: quiz.totalPoints,
      completed: true,
      submittedAt: new Date().toISOString(),
    }
    
    setCurrentAttempt(attempt)
    setShowResults(true)
  }, [quiz, answers])

  // Reset quiz
  const resetQuiz = useCallback(() => {
    setAnswers({})
    setShowResults(false)
    setCurrentAttempt(null)
    setActiveQuestionIndex(0)
  }, [])

  // Check if all questions are answered
  const allAnswered = quiz ? quiz.questions.every(q => answers[q.id]) : false

  // Initial load
  if (!hasLoaded) {
    return (
      <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 p-6">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-base mb-4">
          <FileText className="w-5 h-5" /> Quiz Generator
        </h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Test understanding with AI-generated quizzes</p>
          <p className="text-gray-500 dark:text-gray-500 text-xs mb-5 max-w-sm mx-auto">
            Generate custom quizzes based on this lesson's content to assess student comprehension.
          </p>
          <button
            onClick={loadExistingQuizzes}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-100 transition-all duration-200 disabled:opacity-50"
            data-testid="load-quizzes-btn"
          >
            {isLoading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Loading...
              </>
            ) : (
              <><FileText className="w-4 h-4" /> Get Started</>
            )}
          </button>
        </div>
      </div>
    )
  }

  // Quiz configuration panel (no active quiz)
  if (!quiz) {
    return (
      <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/5 dark:to-purple-900/5">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-base">
            <FileText className="w-5 h-5" /> Quiz Generator
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Create AI-powered quizzes to test student understanding</p>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Existing Quizzes */}
          {existingQuizzes.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Existing Quizzes</h4>
              <div className="space-y-2">
                {existingQuizzes.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => selectQuiz(q)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all group text-left"
                    data-testid={`existing-quiz-${idx}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <ClipboardList className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{q.quizTitle}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{q.questions.length} questions • {q.totalPoints} points</p>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Generate New Quiz */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50">
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Generate New Quiz</h4>
            
            {/* Configuration */}
            <div className="space-y-4">
              {/* Question Count */}
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">Number of Questions</label>
                <div className="flex gap-2">
                  {[3, 5, 7, 10].map(n => (
                    <button
                      key={n}
                      onClick={() => setQuestionCount(n)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${questionCount === n ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-2 border-indigo-300 dark:border-indigo-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">Difficulty Level</label>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as const).map(d => {
                    const config = DIFFICULTY_CONFIG[d]
                    return (
                      <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${difficulty === d ? `${config.bg} ${config.color} border-2 border-current` : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                      >
                        {config.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Question Types */}
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">Question Types</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(QUESTION_TYPE_LABELS).map(([type, label]) => (
                    <button
                      key={type}
                      onClick={() => toggleQuestionType(type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${questionTypes.includes(type) ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'}`}
                    >
                      {questionTypes.includes(type) && <Check className="w-3 h-3" />}{label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/40 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerateQuiz}
              disabled={isGenerating}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="generate-quiz-btn"
            >
              {isGenerating ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                <><Brain className="w-4 h-4" /> Generate Quiz</>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Active Quiz View
  const currentQuestion = quiz.questions[activeQuestionIndex]
  const difficultyConfig = DIFFICULTY_CONFIG[currentQuestion?.difficulty || 'medium']

  return (
    <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden">
      {/* Quiz Header */}
      <div className="px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/5 dark:to-purple-900/5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-base">
            <FileText className="w-5 h-5" /> {quiz.quizTitle}
          </h3>
          <button
            onClick={() => setQuiz(null)}
            className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            ← Back to Quizzes
          </button>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span>{quiz.questions.length} questions</span>
          <span>•</span>
          <span>{quiz.totalPoints} points</span>
          <span>•</span>
          <span>Pass: {quiz.passingScore}%</span>
        </div>
      </div>

      {showResults ? (
        // Results View
        <QuizResults
          quiz={quiz}
          attempt={currentAttempt!}
          answers={answers}
          onRetry={resetQuiz}
          onBack={() => setQuiz(null)}
        />
      ) : (
        // Question View
        <div className="p-5 sm:p-6">
          {/* Progress */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Question {activeQuestionIndex + 1} of {quiz.questions.length}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {Object.keys(answers).length}/{quiz.questions.length} answered
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-300"
                style={{ width: `${((activeQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Navigator */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {quiz.questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setActiveQuestionIndex(idx)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${idx === activeQuestionIndex ? 'bg-indigo-500 text-white shadow-md' : answers[q.id] ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-indigo-300'}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Current Question */}
          <QuestionCard
            question={currentQuestion}
            answer={answers[currentQuestion.id]}
            onAnswer={(ans) => handleAnswer(currentQuestion.id, ans)}
            showResult={false}
          />

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setActiveQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={activeQuestionIndex === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            {activeQuestionIndex < quiz.questions.length - 1 ? (
              <button
                onClick={() => setActiveQuestionIndex(prev => Math.min(quiz.questions.length - 1, prev + 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-all"
              >
                Next
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={submitQuiz}
                disabled={!allAnswered}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
                data-testid="submit-quiz-btn"
              >
                <Check className="w-4 h-4" /> Submit Quiz
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Question Card Component
function QuestionCard({
  question,
  answer,
  onAnswer,
  showResult,
  isCorrect,
}: {
  question: QuizQuestion
  answer: string | undefined
  onAnswer: (ans: string) => void
  showResult: boolean
  isCorrect?: boolean
}) {
  const difficultyConfig = DIFFICULTY_CONFIG[question.difficulty]

  return (
    <div className={`rounded-xl border p-5 transition-all ${showResult ? (isCorrect ? 'border-green-200 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10' : 'border-red-200 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10') : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40'}`}>
      {/* Question Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <p className="text-[15px] font-semibold text-gray-900 dark:text-white leading-relaxed">{question.question}</p>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${difficultyConfig.bg} ${difficultyConfig.color}`}>
            {difficultyConfig.label}
          </span>
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{question.points} pts</span>
        </div>
      </div>

      {/* Answer Options */}
      {question.type === 'multiple_choice' && question.options && (
        <div className="space-y-2">
          {question.options.map((option, idx) => {
            const isSelected = answer === option
            const isCorrectOption = showResult && option === question.correctAnswer
            const isWrongSelection = showResult && isSelected && option !== question.correctAnswer
            
            return (
              <button
                key={idx}
                onClick={() => !showResult && onAnswer(option)}
                disabled={showResult}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left text-sm transition-all ${
                  isCorrectOption ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-400 dark:border-green-600' :
                  isWrongSelection ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-600' :
                  isSelected ? 'bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-400 dark:border-indigo-600' :
                  'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isCorrectOption ? 'bg-green-500 text-white' :
                  isWrongSelection ? 'bg-red-500 text-white' :
                  isSelected ? 'bg-indigo-500 text-white' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className={`flex-1 ${isSelected ? 'font-medium' : ''} ${isCorrectOption ? 'text-green-700 dark:text-green-300' : isWrongSelection ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'}`}>
                  {option}
                </span>
                {showResult && isCorrectOption && <Check className="w-4 h-4 text-green-500" />}
                {showResult && isWrongSelection && <X className="w-4 h-4 text-red-500" />}
              </button>
            )
          })}
        </div>
      )}

      {question.type === 'true_false' && (
        <div className="flex gap-3">
          {['True', 'False'].map(option => {
            const isSelected = answer === option
            const isCorrectOption = showResult && option === question.correctAnswer
            const isWrongSelection = showResult && isSelected && option !== question.correctAnswer
            
            return (
              <button
                key={option}
                onClick={() => !showResult && onAnswer(option)}
                disabled={showResult}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                  isCorrectOption ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-400 dark:border-green-600 text-green-700 dark:text-green-300' :
                  isWrongSelection ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-600 text-red-700 dark:text-red-300' :
                  isSelected ? 'bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-400 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300' :
                  'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-600'
                }`}
              >
                {option}
              </button>
            )
          })}
        </div>
      )}

      {(question.type === 'fill_blank' || question.type === 'short_answer') && (
        <input
          type="text"
          value={answer || ''}
          onChange={(e) => !showResult && onAnswer(e.target.value)}
          disabled={showResult}
          placeholder="Type your answer..."
          className={`w-full px-4 py-3 rounded-lg text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
            showResult ? (isCorrect ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20' : 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20') : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
          } ${showResult ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'}`}
        />
      )}

      {/* Explanation (shown in results) */}
      {showResult && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${isCorrect ? 'bg-green-100/50 dark:bg-green-900/20 text-green-800 dark:text-green-200' : 'bg-amber-100/50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200'}`}>
          <span className="font-semibold flex items-center gap-1">{isCorrect ? <><Check className="w-4 h-4" /> Correct!</> : <><X className="w-4 h-4" /> Incorrect.</>}</span>
          {!isCorrect && <span className="ml-2">The correct answer is: <strong>{question.correctAnswer}</strong></span>}
          <p className="mt-1 text-xs opacity-80">{question.explanation}</p>
        </div>
      )}
    </div>
  )
}

// Quiz Results Component
function QuizResults({
  quiz,
  attempt,
  answers,
  onRetry,
  onBack,
}: {
  quiz: QuizType
  attempt: QuizAttempt
  answers: Record<string, string>
  onRetry: () => void
  onBack: () => void
}) {
  const percentage = Math.round((attempt.score / attempt.totalPoints) * 100)
  const passed = percentage >= quiz.passingScore

  return (
    <div className="p-5 sm:p-6">
      {/* Score Summary */}
      <div className={`text-center py-6 px-4 rounded-2xl mb-6 ${passed ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/15 dark:to-emerald-900/10' : 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/15 dark:to-orange-900/10'}`}>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 ${passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
          {passed ? <PartyPopper className="w-10 h-10" /> : <BookOpen className="w-10 h-10" />}
        </div>
        <h3 className={`text-2xl font-bold mb-2 ${passed ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}>
          {passed ? 'Great Job!' : 'Keep Learning!'}
        </h3>
        <p className="text-5xl font-extrabold text-gray-900 dark:text-white mb-1">{percentage}%</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {attempt.score}/{attempt.totalPoints} points • {passed ? 'Passed' : `Need ${quiz.passingScore}% to pass`}
        </p>
      </div>

      {/* Question Review */}
      <div className="space-y-4 mb-6">
        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Question Review</h4>
        {quiz.questions.map((q, idx) => {
          const userAnswer = answers[q.id]
          const isCorrect = userAnswer?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()
          return (
            <QuestionCard
              key={q.id}
              question={q}
              answer={userAnswer}
              onAnswer={() => {}}
              showResult={true}
              isCorrect={isCorrect}
            />
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
        >
          ← All Quizzes
        </button>
        <button
          onClick={onRetry}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    </div>
  )
}

// Compact Quiz Button for Sidebar
export function QuizCompactButton({ lessonId, onClick }: { lessonId: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 border border-indigo-200/60 dark:border-indigo-700/40 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all group text-left"
      data-testid="quiz-compact-btn"
    >
      <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
        <Brain className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Generate Quiz</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Test student comprehension</p>
      </div>
      <svg className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}
