import { createFileRoute, Link } from '@tanstack/react-router'
import { BookOpen, ChevronRight, Sparkles, Heart, Users, Crown, Zap } from 'lucide-react'

export const Route = createFileRoute('/scripture/gospels')({
  component: GospelsPage,
})

const gospels = [
  {
    name: 'Matthew',
    subtitle: 'Jesus as King',
    description: 'Written for Jewish readers, emphasizing Jesus as the promised Messiah and King of Israel. Contains the Sermon on the Mount and many parables.',
    icon: Crown,
    color: 'amber',
    themes: ['Kingdom of Heaven', 'Fulfilled Prophecy', 'Discipleship', 'The Sermon on the Mount'],
    keyPassages: ['Matthew 5-7', 'Matthew 28:18-20', 'Matthew 6:9-13'],
  },
  {
    name: 'Mark',
    subtitle: 'Jesus as Servant',
    description: 'The shortest Gospel, focusing on Jesus as the suffering servant. Action-packed narrative with emphasis on miracles and service.',
    icon: Zap,
    color: 'red',
    themes: ['Servanthood', 'Miracles', 'The Cross', 'Urgency'],
    keyPassages: ['Mark 10:45', 'Mark 8:34-38', 'Mark 16:15'],
  },
  {
    name: 'Luke',
    subtitle: 'Jesus as Savior',
    description: 'Written by a physician, emphasizing Jesus as the Savior for all people. Rich in parables and stories of compassion.',
    icon: Heart,
    color: 'rose',
    themes: ['Compassion', 'Prayer', 'The Poor & Outcast', 'Joy'],
    keyPassages: ['Luke 15', 'Luke 19:10', 'Luke 24:44-49'],
  },
  {
    name: 'John',
    subtitle: 'Jesus as God',
    description: 'A theological Gospel focusing on Jesus\' divine nature. Contains the famous "I Am" statements and deep spiritual teachings.',
    icon: Users,
    color: 'blue',
    themes: ['Belief', 'Eternal Life', 'The Holy Spirit', 'Love'],
    keyPassages: ['John 3:16', 'John 14:6', 'John 1:1-14'],
  },
]

function GospelsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-stone-900 dark:to-stone-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 mb-8">
          <Link to="/" className="hover:text-amber-600">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/scripture/new-testament" className="hover:text-amber-600">New Testament</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-stone-900 dark:text-stone-100 font-medium">Gospels</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-semibold mb-4">
            <BookOpen className="w-4 h-4" />
            4 Books
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-stone-900 dark:text-stone-100 mb-4">
            The Gospels
          </h1>
          <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
            Four accounts of the life, ministry, death, and resurrection of Jesus Christ.
            Each Gospel presents a unique perspective on the Savior.
          </p>
        </div>

        {/* Gospel Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {gospels.map((gospel) => {
            const Icon = gospel.icon
            const colorClasses = {
              amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40',
              red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/40',
              rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/40',
              blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/40',
            }[gospel.color]
            
            return (
              <div
                key={gospel.name}
                className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-xl ${colorClasses}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                      {gospel.name}
                    </h2>
                    <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
                      {gospel.subtitle}
                    </p>
                  </div>
                </div>
                
                <p className="text-stone-600 dark:text-stone-400 mb-4">
                  {gospel.description}
                </p>

                <div className="mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">Key Themes</h4>
                  <div className="flex flex-wrap gap-2">
                    {gospel.themes.map((theme) => (
                      <span
                        key={theme}
                        className="px-2 py-1 bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 rounded text-xs"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">Popular Passages</h4>
                  <div className="flex flex-wrap gap-2">
                    {gospel.keyPassages.map((passage) => (
                      <Link
                        key={passage}
                        to="/generate"
                        search={{ topic: passage }}
                        className="px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded text-xs hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                      >
                        {passage}
                      </Link>
                    ))}
                  </div>
                </div>

                <Link
                  to="/generate"
                  search={{ book: gospel.name }}
                  className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-semibold text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  Create lesson from {gospel.name}
                </Link>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="inline-block p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 dark:border-purple-800/40">
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">
              Compare the Gospels
            </h3>
            <p className="text-stone-600 dark:text-stone-400 mb-4">
              Create a lesson exploring how each Gospel tells the same story from different perspectives
            </p>
            <Link
              to="/generate"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Create Gospel Comparison Lesson
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
