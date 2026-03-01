import { createFileRoute, Link } from '@tanstack/react-router'
import { useSEO, trackPageView } from '@/lib/seo'
import { useEffect } from 'react'
import { 
  Sun, Users, Calendar, Sparkles, Check, ChevronRight, 
  Download, Music, Palette, Drama, BookOpen, PartyPopper
} from 'lucide-react'

export const Route = createFileRoute('/vacation-bible-school')({
  component: VacationBibleSchoolPage,
})

function VacationBibleSchoolPage() {
  useSEO({
    title: 'VBS Curriculum & Vacation Bible School Lessons | Bible Lesson Planner',
    description: 'Plan your Vacation Bible School with our AI-powered curriculum generator. Free VBS themes, lessons, crafts, and activities for all ages. Create a week of unforgettable Bible learning.',
    keywords: 'VBS curriculum, Vacation Bible School, VBS lessons, VBS themes, summer Bible program, church VBS, kids VBS activities, VBS crafts, free VBS curriculum',
  })

  useEffect(() => {
    trackPageView('/vacation-bible-school', 'Vacation Bible School')
  }, [])

  const vbsThemes = [
    { name: 'Adventure Island', description: 'Explore God\'s promises through island adventures', color: 'emerald' },
    { name: 'Space Explorers', description: 'Discover the universe God created', color: 'indigo' },
    { name: 'Kingdom Quest', description: 'Medieval journey through Bible stories', color: 'amber' },
    { name: 'Safari Adventure', description: 'Wild encounters with God\'s Word', color: 'orange' },
    { name: 'Under the Sea', description: 'Dive deep into faith', color: 'blue' },
    { name: 'Super Heroes', description: 'Biblical heroes of faith', color: 'red' },
  ]

  const dailyComponents = [
    { icon: BookOpen, title: 'Bible Story', description: 'Age-appropriate scripture teaching' },
    { icon: Music, title: 'Worship Songs', description: 'Fun, memorable worship music' },
    { icon: Palette, title: 'Crafts', description: 'Creative hands-on projects' },
    { icon: Drama, title: 'Skits & Drama', description: 'Engaging performances' },
    { icon: PartyPopper, title: 'Games', description: 'Active outdoor/indoor games' },
    { icon: Users, title: 'Small Groups', description: 'Discussion and application' },
  ]

  return (
    <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50/30 dark:from-stone-900 dark:via-stone-900 dark:to-orange-950/20 border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm font-semibold mb-6">
              <Sun className="w-4 h-4" /> Summer 2026 Ready
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 dark:text-stone-50 mb-6" style={{ fontFamily: 'Crimson Text, serif' }}>
              Vacation Bible School <span className="text-orange-600">Made Simple</span>
            </h1>
            <p className="text-lg sm:text-xl text-stone-600 dark:text-stone-400 mb-8 max-w-3xl mx-auto">
              Create an unforgettable VBS experience with AI-generated curriculum. Complete daily lessons, crafts, games, and activities for your entire week.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/generate"
                className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Sparkles className="w-5 h-5" /> Plan Your VBS Free
              </Link>
              <Link
                to="/templates"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-xl text-lg font-semibold hover:border-orange-400 transition-all"
              >
                Browse VBS Themes <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Ideas */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
            Popular VBS Theme Ideas
          </h2>
          <p className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
            Generate complete curriculum for any theme, or create your own custom VBS adventure.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vbsThemes.map((theme) => (
            <Link
              key={theme.name}
              to="/generate"
              className={`bg-white dark:bg-stone-800/50 rounded-xl p-6 border border-stone-200 dark:border-stone-700 hover:shadow-lg transition-all group`}
            >
              <h3 className={`font-bold text-lg text-stone-900 dark:text-stone-100 mb-2 group-hover:text-${theme.color}-600`}>
                {theme.name}
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400">{theme.description}</p>
              <div className="mt-4 flex items-center gap-2 text-amber-600 text-sm font-medium">
                Generate Curriculum <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Daily Schedule Components */}
      <div className="bg-white dark:bg-stone-800/30 border-y border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
              Complete Daily VBS Schedule
            </h2>
            <p className="text-stone-600 dark:text-stone-400">Every day includes all the elements for an engaging VBS experience</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dailyComponents.map((component) => (
              <div key={component.title} className="flex items-start gap-4 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                  <component.icon className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-1">{component.title}</h3>
                  <p className="text-sm text-stone-500 dark:text-stone-400">{component.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VBS Planning Checklist */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-6" style={{ fontFamily: 'Crimson Text, serif' }}>
              Your VBS Curriculum Includes:
            </h2>
            <ul className="space-y-4">
              {[
                '5 days of complete lesson plans',
                'Daily Bible stories with teaching guides',
                'Memory verses for each day',
                'Craft instructions with supply lists',
                'Game ideas for all age groups',
                'Worship song suggestions',
                'Skit scripts and drama ideas',
                'Registration and volunteer forms',
                'Promotional materials templates',
                'Parent take-home resources',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-stone-600 dark:text-stone-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-2xl p-8 border border-orange-200 dark:border-orange-800/40">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-orange-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">Start Planning Your VBS</h3>
              <p className="text-stone-600 dark:text-stone-400 mb-6">Generate a complete week of curriculum in minutes</p>
              <Link
                to="/generate"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Sparkles className="w-5 h-5" /> Create VBS Curriculum Free
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Age Groups */}
      <div className="bg-stone-50 dark:bg-stone-800/20 border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-8 text-center" style={{ fontFamily: 'Crimson Text, serif' }}>
            VBS for All Ages
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            {[
              { age: 'Nursery', range: '0-2 yrs', emoji: '👶' },
              { age: 'Preschool', range: '3-5 yrs', emoji: '🧒' },
              { age: 'Elementary', range: '6-10 yrs', emoji: '📚' },
              { age: 'Pre-Teen', range: '11-13 yrs', emoji: '🎯' },
              { age: 'Teen Helpers', range: '14+ yrs', emoji: '🌟' },
            ].map((group) => (
              <div key={group.age} className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
                <div className="text-3xl mb-2">{group.emoji}</div>
                <div className="font-semibold text-stone-900 dark:text-stone-100">{group.age}</div>
                <div className="text-xs text-stone-500">{group.range}</div>
              </div>
            ))}
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
            className="p-6 bg-white dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-orange-400 hover:shadow-lg transition-all group"
          >
            <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 mb-2 group-hover:text-orange-600">Sunday School Lessons</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400">Weekly lessons for all ages from Preschool to Adult with activities and crafts.</p>
          </Link>
          <Link
            to="/bible-lesson-plans"
            className="p-6 bg-white dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-orange-400 hover:shadow-lg transition-all group"
          >
            <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 mb-2 group-hover:text-orange-600">Bible Lesson Plans</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400">Complete lesson plans for any book of the Bible with 20+ translations.</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default VacationBibleSchoolPage
