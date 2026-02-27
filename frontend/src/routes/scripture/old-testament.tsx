import { createFileRoute, Link } from '@tanstack/react-router'
import { BookOpen, ChevronRight, Sparkles } from 'lucide-react'

export const Route = createFileRoute('/scripture/old-testament')({
  component: OldTestamentPage,
})

const oldTestamentBooks = [
  { category: 'Pentateuch (Torah)', books: ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'] },
  { category: 'Historical Books', books: ['Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther'] },
  { category: 'Wisdom Literature', books: ['Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon'] },
  { category: 'Major Prophets', books: ['Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel'] },
  { category: 'Minor Prophets', books: ['Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'] },
]

function OldTestamentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-stone-900 dark:to-stone-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 mb-8">
          <Link to="/" className="hover:text-amber-600">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-stone-900 dark:text-stone-100 font-medium">Old Testament</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-semibold mb-4">
            <BookOpen className="w-4 h-4" />
            39 Books
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-stone-900 dark:text-stone-100 mb-4">
            Old Testament
          </h1>
          <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
            Explore lesson plans from the Hebrew Scriptures, from Creation to the Prophets. 
            Each book offers timeless wisdom and stories of faith.
          </p>
        </div>

        {/* Book Categories */}
        <div className="space-y-10">
          {oldTestamentBooks.map((category) => (
            <div key={category.category}>
              <h2 className="text-xl font-bold text-stone-800 dark:text-stone-200 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {category.category}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {category.books.map((book) => (
                  <Link
                    key={book}
                    to="/generate"
                    search={{ book }}
                    className="group p-4 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-stone-700 dark:text-stone-300 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                        {book}
                      </span>
                      <Sparkles className="w-4 h-4 text-stone-300 dark:text-stone-600 group-hover:text-amber-500 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="inline-block p-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-800/40">
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">
              Can't find what you're looking for?
            </h3>
            <p className="text-stone-600 dark:text-stone-400 mb-4">
              Create a custom lesson from any Old Testament passage
            </p>
            <Link
              to="/generate"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold transition-colors"
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
