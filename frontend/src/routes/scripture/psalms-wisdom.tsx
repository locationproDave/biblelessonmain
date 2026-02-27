import { createFileRoute, Link } from '@tanstack/react-router'
import { BookOpen, ChevronRight, Sparkles, Music, Lightbulb, Heart, MessageCircle, Crown } from 'lucide-react'

export const Route = createFileRoute('/scripture/psalms-wisdom')({
  component: PsalmsWisdomPage,
})

const wisdomBooks = [
  {
    name: 'Job',
    icon: Heart,
    color: 'slate',
    description: 'A profound exploration of suffering, faith, and God\'s sovereignty. Perfect for lessons on perseverance and trusting God in difficult times.',
    themes: ['Suffering', 'Faith', 'God\'s Sovereignty', 'Patience'],
    keyPassages: ['Job 1:21', 'Job 19:25-27', 'Job 38-41'],
  },
  {
    name: 'Psalms',
    icon: Music,
    color: 'purple',
    description: 'A collection of 150 songs and prayers expressing every human emotion. The heart of Hebrew worship and devotion.',
    themes: ['Worship', 'Prayer', 'Praise', 'Lament', 'Trust'],
    keyPassages: ['Psalm 23', 'Psalm 91', 'Psalm 139', 'Psalm 1', 'Psalm 119'],
  },
  {
    name: 'Proverbs',
    icon: Lightbulb,
    color: 'amber',
    description: 'Practical wisdom for daily living. Short, memorable sayings covering relationships, work, money, and character.',
    themes: ['Wisdom', 'Character', 'Relationships', 'Work Ethic'],
    keyPassages: ['Proverbs 3:5-6', 'Proverbs 22:6', 'Proverbs 31'],
  },
  {
    name: 'Ecclesiastes',
    icon: MessageCircle,
    color: 'teal',
    description: 'The search for meaning and purpose in life. A thoughtful examination of what truly matters from Solomon\'s perspective.',
    themes: ['Purpose', 'Meaning', 'Time', 'Contentment'],
    keyPassages: ['Ecclesiastes 3:1-8', 'Ecclesiastes 12:13-14'],
  },
  {
    name: 'Song of Solomon',
    icon: Crown,
    color: 'rose',
    description: 'A beautiful celebration of love and marriage. Often interpreted as portraying Christ\'s love for the church.',
    themes: ['Love', 'Marriage', 'Devotion', 'Beauty'],
    keyPassages: ['Song of Solomon 2:4', 'Song of Solomon 8:6-7'],
  },
]

const popularPsalms = [
  { number: 23, title: 'The Lord is My Shepherd', theme: 'Trust & Provision' },
  { number: 1, title: 'The Blessed Life', theme: 'Righteousness' },
  { number: 91, title: 'Dwelling in Safety', theme: 'Protection' },
  { number: 139, title: 'God Knows Me', theme: 'God\'s Omniscience' },
  { number: 119, title: 'The Word of God', theme: 'Scripture' },
  { number: 51, title: 'A Prayer of Repentance', theme: 'Forgiveness' },
  { number: 100, title: 'A Song of Praise', theme: 'Thanksgiving' },
  { number: 46, title: 'God is Our Refuge', theme: 'Strength' },
]

function PsalmsWisdomPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-stone-900 dark:to-stone-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 mb-8">
          <Link to="/" className="hover:text-amber-600">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/scripture/old-testament" className="hover:text-amber-600">Old Testament</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-stone-900 dark:text-stone-100 font-medium">Psalms & Wisdom</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-semibold mb-4">
            <Lightbulb className="w-4 h-4" />
            5 Books of Poetry & Wisdom
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-stone-900 dark:text-stone-100 mb-4">
            Psalms & Wisdom Literature
          </h1>
          <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
            Songs, prayers, and wise sayings that speak to the heart. These books explore the deepest questions 
            of life, faith, and our relationship with God.
          </p>
        </div>

        {/* Wisdom Books */}
        <div className="space-y-6 mb-12">
          {wisdomBooks.map((book) => {
            const Icon = book.icon
            const colorClasses = {
              slate: 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400',
              purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
              amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
              teal: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400',
              rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
            }[book.color]

            return (
              <div
                key={book.name}
                className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className={`p-4 rounded-xl ${colorClasses} self-start`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
                      {book.name}
                    </h2>
                    <p className="text-stone-600 dark:text-stone-400 mb-4">
                      {book.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {book.themes.map((theme) => (
                        <span
                          key={theme}
                          className="px-3 py-1 bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 rounded-full text-xs font-medium"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {book.keyPassages.map((passage) => (
                        <Link
                          key={passage}
                          to="/generate"
                          search={{ topic: passage }}
                          className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 underline underline-offset-2"
                        >
                          {passage}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <Link
                    to="/generate"
                    search={{ book: book.name }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-sm transition-colors whitespace-nowrap self-start"
                  >
                    <Sparkles className="w-4 h-4" />
                    Create Lesson
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Popular Psalms Quick Access */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-6 flex items-center gap-3">
            <Music className="w-6 h-6 text-purple-600" />
            Popular Psalms
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularPsalms.map((psalm) => (
              <Link
                key={psalm.number}
                to="/generate"
                search={{ topic: `Psalm ${psalm.number}` }}
                className="group bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-4 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold text-lg">
                    {psalm.number}
                  </span>
                  <div>
                    <h3 className="font-semibold text-stone-900 dark:text-stone-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-sm">
                      Psalm {psalm.number}
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{psalm.theme}</p>
                  </div>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400 italic">{psalm.title}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="inline-block p-8 bg-gradient-to-br from-purple-50 to-amber-50 dark:from-purple-900/20 dark:to-amber-900/20 rounded-2xl border border-purple-200 dark:border-purple-800/40">
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">
              Explore All 150 Psalms
            </h3>
            <p className="text-stone-600 dark:text-stone-400 mb-4">
              Create lessons from any Psalm - worship, lament, thanksgiving, or royal psalms
            </p>
            <Link
              to="/generate"
              search={{ book: 'Psalms' }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Browse All Psalms
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
