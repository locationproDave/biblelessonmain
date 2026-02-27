import { createFileRoute, Link } from '@tanstack/react-router'
import { BookOpen, ChevronRight, Sparkles, Mail, User, Users } from 'lucide-react'

export const Route = createFileRoute('/scripture/epistles')({
  component: EpistlesPage,
})

const paulineEpistles = [
  { name: 'Romans', theme: 'Salvation by Faith', keyVerse: 'Romans 8:28' },
  { name: '1 Corinthians', theme: 'Church Unity', keyVerse: '1 Corinthians 13:4-7' },
  { name: '2 Corinthians', theme: 'Ministry & Comfort', keyVerse: '2 Corinthians 5:17' },
  { name: 'Galatians', theme: 'Freedom in Christ', keyVerse: 'Galatians 5:22-23' },
  { name: 'Ephesians', theme: 'The Church', keyVerse: 'Ephesians 2:8-9' },
  { name: 'Philippians', theme: 'Joy', keyVerse: 'Philippians 4:13' },
  { name: 'Colossians', theme: 'Christ\'s Supremacy', keyVerse: 'Colossians 3:23' },
  { name: '1 Thessalonians', theme: 'Christ\'s Return', keyVerse: '1 Thessalonians 5:16-18' },
  { name: '2 Thessalonians', theme: 'Perseverance', keyVerse: '2 Thessalonians 3:3' },
  { name: '1 Timothy', theme: 'Church Leadership', keyVerse: '1 Timothy 4:12' },
  { name: '2 Timothy', theme: 'Faithfulness', keyVerse: '2 Timothy 3:16-17' },
  { name: 'Titus', theme: 'Good Works', keyVerse: 'Titus 3:5' },
  { name: 'Philemon', theme: 'Forgiveness', keyVerse: 'Philemon 1:15-16' },
]

const generalEpistles = [
  { name: 'Hebrews', theme: 'Christ\'s Superiority', keyVerse: 'Hebrews 11:1' },
  { name: 'James', theme: 'Faith in Action', keyVerse: 'James 1:22' },
  { name: '1 Peter', theme: 'Suffering & Hope', keyVerse: '1 Peter 5:7' },
  { name: '2 Peter', theme: 'Growing in Faith', keyVerse: '2 Peter 1:5-7' },
  { name: '1 John', theme: 'God is Love', keyVerse: '1 John 4:19' },
  { name: '2 John', theme: 'Walking in Truth', keyVerse: '2 John 1:6' },
  { name: '3 John', theme: 'Hospitality', keyVerse: '3 John 1:4' },
  { name: 'Jude', theme: 'Contending for Faith', keyVerse: 'Jude 1:3' },
]

function EpistlesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-stone-900 dark:to-stone-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 mb-8">
          <Link to="/" className="hover:text-amber-600">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/scripture/new-testament" className="hover:text-amber-600">New Testament</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-stone-900 dark:text-stone-100 font-medium">Epistles</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-sm font-semibold mb-4">
            <Mail className="w-4 h-4" />
            21 Letters
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-stone-900 dark:text-stone-100 mb-4">
            The Epistles
          </h1>
          <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
            Letters written to early churches and individuals, providing guidance for Christian living,
            doctrine, and practical wisdom for believers today.
          </p>
        </div>

        {/* Pauline Epistles */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Pauline Epistles</h2>
              <p className="text-sm text-stone-500 dark:text-stone-400">Letters written by the Apostle Paul</p>
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paulineEpistles.map((epistle) => (
              <div
                key={epistle.name}
                className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-4 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-stone-900 dark:text-stone-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {epistle.name}
                  </h3>
                  <BookOpen className="w-4 h-4 text-stone-300 dark:text-stone-600 group-hover:text-blue-500 transition-colors" />
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">{epistle.theme}</p>
                <Link
                  to="/generate"
                  search={{ topic: epistle.keyVerse }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {epistle.keyVerse}
                </Link>
                <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-700">
                  <Link
                    to="/generate"
                    search={{ book: epistle.name }}
                    className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 font-medium"
                  >
                    <Sparkles className="w-3 h-3" />
                    Create lesson
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* General Epistles */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">General Epistles</h2>
              <p className="text-sm text-stone-500 dark:text-stone-400">Letters written to the broader church</p>
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {generalEpistles.map((epistle) => (
              <div
                key={epistle.name}
                className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-4 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {epistle.name}
                  </h3>
                  <BookOpen className="w-4 h-4 text-stone-300 dark:text-stone-600 group-hover:text-emerald-500 transition-colors" />
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">{epistle.theme}</p>
                <Link
                  to="/generate"
                  search={{ topic: epistle.keyVerse }}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {epistle.keyVerse}
                </Link>
                <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-700">
                  <Link
                    to="/generate"
                    search={{ book: epistle.name }}
                    className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 font-medium"
                  >
                    <Sparkles className="w-3 h-3" />
                    Create lesson
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="inline-block p-8 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800/40">
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">
              Study a Theme Across Epistles
            </h3>
            <p className="text-stone-600 dark:text-stone-400 mb-4">
              Create lessons exploring topics like faith, love, or perseverance across multiple letters
            </p>
            <Link
              to="/generate"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Create Thematic Lesson
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
