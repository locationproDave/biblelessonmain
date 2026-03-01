import { createFileRoute, Link } from '@tanstack/react-router'
import { useSEO, trackPageView } from '@/lib/seo'
import { useEffect } from 'react'
import { 
  BookOpen, FileText, Sparkles, Check, ChevronRight, 
  Download, Printer, Clock, Target, Lightbulb, Users
} from 'lucide-react'

export const Route = createFileRoute('/bible-lesson-plans')({
  component: BibleLessonPlansPage,
})

function BibleLessonPlansPage() {
  useSEO({
    title: 'Free Bible Lesson Plans | AI-Powered Lesson Plan Generator',
    description: 'Create comprehensive Bible lesson plans in minutes. Free printable lesson plans for Sunday school, youth groups, and Bible studies. All 66 books of the Bible, 20+ translations.',
    keywords: 'Bible lesson plans, free Bible lessons, Bible study curriculum, Christian lesson plans, church lesson plans, youth Bible study, Bible teaching resources, printable Bible lessons',
  })

  useEffect(() => {
    trackPageView('/bible-lesson-plans', 'Bible Lesson Plans')
  }, [])

  const bibleBooks = {
    oldTestament: ['Genesis', 'Exodus', 'Psalms', 'Proverbs', 'Isaiah', 'Daniel', 'Jonah'],
    newTestament: ['Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', 'Ephesians', 'Revelation'],
  }

  const lessonTypes = [
    { icon: BookOpen, title: 'Verse-by-Verse Study', description: 'Deep dive into specific Bible passages' },
    { icon: Target, title: 'Topical Lessons', description: 'Focus on themes like faith, love, forgiveness' },
    { icon: Users, title: 'Character Studies', description: 'Learn from biblical heroes and their journeys' },
    { icon: Lightbulb, title: 'Life Application', description: 'Connect scripture to everyday life' },
  ]

  return (
    <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-amber-50/30 dark:from-stone-900 dark:via-stone-900 dark:to-amber-950/20 border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 dark:text-stone-50 mb-6" style={{ fontFamily: 'Crimson Text, serif' }}>
              Bible Lesson Plans <span className="text-amber-600">in Minutes</span>
            </h1>
            <p className="text-lg sm:text-xl text-stone-600 dark:text-stone-400 mb-8 max-w-3xl mx-auto">
              Generate professional, scripture-based lesson plans for any book of the Bible. Our AI creates engaging content with discussion questions, activities, and take-home materials.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/generate"
                className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Sparkles className="w-5 h-5" /> Create Free Lesson Plan
              </Link>
              <Link
                to="/templates"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-xl text-lg font-semibold hover:border-amber-400 transition-all"
              >
                View Templates <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Types */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
            Create Any Type of Bible Lesson
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {lessonTypes.map((type) => (
            <div key={type.title} className="bg-white dark:bg-stone-800/50 rounded-xl p-6 border border-stone-200 dark:border-stone-700 text-center hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                <type.icon className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="font-bold text-stone-900 dark:text-stone-100 mb-2">{type.title}</h3>
              <p className="text-sm text-stone-500 dark:text-stone-400">{type.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bible Books Section */}
      <div className="bg-white dark:bg-stone-800/30 border-y border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
              Lessons from Every Book of the Bible
            </h2>
            <p className="text-stone-600 dark:text-stone-400">All 66 books available with verse-by-verse lesson planning</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" /> Old Testament
              </h3>
              <div className="flex flex-wrap gap-2">
                {bibleBooks.oldTestament.map((book) => (
                  <Link
                    key={book}
                    to="/generate"
                    className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-amber-100 hover:text-amber-700 transition-all"
                  >
                    {book}
                  </Link>
                ))}
                <span className="px-3 py-1.5 text-sm text-stone-400">+ 32 more</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" /> New Testament
              </h3>
              <div className="flex flex-wrap gap-2">
                {bibleBooks.newTestament.map((book) => (
                  <Link
                    key={book}
                    to="/generate"
                    className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-blue-100 hover:text-blue-700 transition-all"
                  >
                    {book}
                  </Link>
                ))}
                <span className="px-3 py-1.5 text-sm text-stone-400">+ 19 more</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What's in a Lesson Plan */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-6" style={{ fontFamily: 'Crimson Text, serif' }}>
              Complete Bible Lesson Plans Include:
            </h2>
            <ul className="space-y-4">
              {[
                'Lesson objectives and learning goals',
                'Scripture passages with context',
                'Teacher preparation notes',
                'Discussion questions for all levels',
                'Interactive activities and games',
                'Memory verse with memorization tips',
                'Life application points',
                'Printable student handouts',
                'Take-home family activities',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-stone-600 dark:text-stone-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800/40">
            <div className="text-center">
              <FileText className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">Start Planning Today</h3>
              <p className="text-stone-600 dark:text-stone-400 mb-6">Your first lesson plan is completely free</p>
              <Link
                to="/generate"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Sparkles className="w-5 h-5" /> Generate Free Lesson Plan
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bible Translations */}
      <div className="bg-stone-50 dark:bg-stone-800/20 border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-8 text-center" style={{ fontFamily: 'Crimson Text, serif' }}>
            20+ Bible Translations Supported
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {['KJV', 'NIV', 'ESV', 'NLT', 'NASB', 'CSB', 'NKJV', 'MSG', 'AMP', 'NET', 'RSV', 'HCSB'].map((trans) => (
              <span
                key={trans}
                className="px-4 py-2 bg-white dark:bg-stone-800 rounded-full text-sm font-bold text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
              >
                {trans}
              </span>
            ))}
            <span className="px-4 py-2 text-sm text-stone-400">+ many more</span>
          </div>
        </div>
      </div>

      {/* Cross-links to other resources */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-6 text-center" style={{ fontFamily: 'Crimson Text, serif' }}>
          More Resources for Teachers
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            to="/sunday-school-lessons"
            className="p-6 bg-white dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-amber-400 hover:shadow-lg transition-all group"
          >
            <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 mb-2 group-hover:text-amber-600">Sunday School Lessons</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400">Age-appropriate lessons from Preschool to Adult with activities and crafts.</p>
          </Link>
          <Link
            to="/vacation-bible-school"
            className="p-6 bg-white dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-amber-400 hover:shadow-lg transition-all group"
          >
            <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 mb-2 group-hover:text-amber-600">VBS Curriculum</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400">Plan your entire Vacation Bible School week with themes, crafts, games, and daily lessons.</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default BibleLessonPlansPage
