import { createFileRoute, Link } from '@tanstack/react-router'
import { BookOpen, ChevronRight, Sparkles } from 'lucide-react'

export const Route = createFileRoute('/scripture/new-testament')({
  component: NewTestamentPage,
})

const newTestamentBooks = [
  { category: 'Gospels', books: ['Matthew', 'Mark', 'Luke', 'John'] },
  { category: 'History', books: ['Acts'] },
  { category: 'Pauline Epistles', books: ['Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon'] },
  { category: 'General Epistles', books: ['Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude'] },
  { category: 'Prophecy', books: ['Revelation'] },
]

function NewTestamentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-stone-900 dark:to-stone-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 mb-8">
          <Link to="/" className="hover:text-amber-600">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-stone-900 dark:text-stone-100 font-medium">New Testament</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-semibold mb-4">
            <BookOpen className="w-4 h-4" />
            27 Books
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-stone-900 dark:text-stone-100 mb-4">
            New Testament
          </h1>
          <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
            Discover lesson plans from the life of Jesus, the early church, and the letters to believers.
            The foundation of Christian faith and practice.
          </p>
        </div>

        {/* Book Categories */}
        <div className="space-y-10">
          {newTestamentBooks.map((category) => (
            <div key={category.category}>
              <h2 className="text-xl font-bold text-stone-800 dark:text-stone-200 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {category.category}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {category.books.map((book) => (
                  <Link
                    key={book}
                    to="/generate"
                    search={{ book }}
                    className="group p-4 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-stone-700 dark:text-stone-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {book}
                      </span>
                      <Sparkles className="w-4 h-4 text-stone-300 dark:text-stone-600 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="inline-block p-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/40">
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">
              Can't find what you're looking for?
            </h3>
            <p className="text-stone-600 dark:text-stone-400 mb-4">
              Create a custom lesson from any New Testament passage
            </p>
            <Link
              to="/generate"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Create Custom Lesson
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
