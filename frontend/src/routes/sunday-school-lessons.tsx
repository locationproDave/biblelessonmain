import { createFileRoute, Link } from '@tanstack/react-router'
import { useSEO, trackPageView } from '@/lib/seo'
import { useEffect } from 'react'
import { 
  BookOpen, Users, Calendar, Sparkles, Check, ChevronRight, 
  Download, Printer, Clock, Heart, Star, GraduationCap
} from 'lucide-react'

export const Route = createFileRoute('/sunday-school-lessons')({
  component: SundaySchoolLessonsPage,
})

function SundaySchoolLessonsPage() {
  useSEO({
    title: 'Free Sunday School Lessons & Curriculum | Bible Lesson Planner',
    description: 'Create engaging Sunday school lessons for all ages with our AI-powered lesson planner. Free printable Bible lessons, activities, and curriculum for Preschool through Adult classes.',
    keywords: 'Sunday school lessons, free Sunday school curriculum, children\'s church lessons, Sunday school activities, Bible lessons for kids, youth Sunday school, adult Bible class, printable Sunday school lessons',
  })

  useEffect(() => {
    trackPageView('/sunday-school-lessons', 'Sunday School Lessons')
  }, [])

  const ageGroups = [
    { name: 'Preschool', ages: '3-5 years', icon: '🧒', description: 'Simple stories, songs, and hands-on activities' },
    { name: 'Elementary', ages: '6-10 years', icon: '📚', description: 'Interactive lessons with crafts and games' },
    { name: 'Pre-Teen', ages: '11-13 years', icon: '🎯', description: 'Deeper discussions and real-life applications' },
    { name: 'Teenager', ages: '14-17 years', icon: '💡', description: 'Relevant topics and group activities' },
    { name: 'Adults', ages: '18+', icon: '📖', description: 'In-depth Bible study and reflection' },
  ]

  const features = [
    { icon: Sparkles, title: 'AI-Powered Generation', description: 'Create complete lessons in under 2 minutes' },
    { icon: BookOpen, title: '20+ Bible Translations', description: 'KJV, NIV, ESV, NLT, and many more' },
    { icon: Users, title: 'All Age Groups', description: 'Tailored content from Preschool to Adult' },
    { icon: Printer, title: 'Print-Ready PDFs', description: 'Beautiful, formatted lesson handouts' },
    { icon: Calendar, title: 'Curriculum Planning', description: 'Plan your entire teaching year' },
    { icon: Download, title: 'Free First Lesson', description: 'No credit card required to start' },
  ]

  return (
    <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-amber-50 via-white to-blue-50/30 dark:from-stone-900 dark:via-stone-900 dark:to-blue-950/20 border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 dark:text-stone-50 mb-6" style={{ fontFamily: 'Crimson Text, serif' }}>
              Free Sunday School Lessons <span className="text-amber-600">Made Easy</span>
            </h1>
            <p className="text-lg sm:text-xl text-stone-600 dark:text-stone-400 mb-8 max-w-3xl mx-auto">
              Create engaging, age-appropriate Sunday school curriculum in minutes. Our AI-powered lesson planner helps teachers prepare meaningful Bible lessons that kids and adults will love.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/generate"
                className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Sparkles className="w-5 h-5" /> Create Free Lesson
              </Link>
              <Link
                to="/templates"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-xl text-lg font-semibold hover:border-amber-400 transition-all"
              >
                Browse Templates <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
            <p className="mt-4 text-sm text-stone-500">Trusted by 2,500+ churches worldwide</p>
          </div>
        </div>
      </div>

      {/* Age Groups Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
            Sunday School Lessons for Every Age
          </h2>
          <p className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
            Our lessons are specifically designed for each age group with appropriate vocabulary, activities, and teaching methods.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          {ageGroups.map((group) => (
            <div key={group.name} className="bg-white dark:bg-stone-800/50 rounded-xl p-6 border border-stone-200 dark:border-stone-700 text-center hover:shadow-lg transition-all">
              <div className="text-4xl mb-3">{group.icon}</div>
              <h3 className="font-bold text-stone-900 dark:text-stone-100 mb-1">{group.name}</h3>
              <p className="text-xs text-amber-600 font-medium mb-2">{group.ages}</p>
              <p className="text-sm text-stone-500 dark:text-stone-400">{group.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-stone-800/30 border-y border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
              Everything You Need for Sunday School
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-4 p-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-1">{feature.title}</h3>
                  <p className="text-sm text-stone-500 dark:text-stone-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What's Included Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-6" style={{ fontFamily: 'Crimson Text, serif' }}>
              What's Included in Every Sunday School Lesson
            </h2>
            <ul className="space-y-4">
              {[
                'Opening prayer and icebreaker activity',
                'Scripture reading with discussion questions',
                'Main lesson content with illustrations',
                'Interactive activities and games',
                'Memory verse with learning activity',
                'Craft or hands-on project',
                'Take-home activity sheet',
                'Teacher notes and tips',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-stone-600 dark:text-stone-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-8 border border-amber-200 dark:border-amber-800/40">
            <div className="text-center">
              <GraduationCap className="w-16 h-16 text-amber-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">Ready to Transform Your Teaching?</h3>
              <p className="text-stone-600 dark:text-stone-400 mb-6">Join thousands of Sunday school teachers using Bible Lesson Planner</p>
              <Link
                to="/generate"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Sparkles className="w-5 h-5" /> Create Your First Lesson Free
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Topics */}
      <div className="bg-stone-50 dark:bg-stone-800/20 border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-8 text-center" style={{ fontFamily: 'Crimson Text, serif' }}>
            Popular Sunday School Topics
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Creation Story', 'Noah\'s Ark', 'David and Goliath', 'Daniel in the Lion\'s Den',
              'The Good Samaritan', 'Prodigal Son', 'Birth of Jesus', 'Easter Story',
              'Ten Commandments', 'Fruits of the Spirit', 'Armor of God', 'Lord\'s Prayer',
              'Miracles of Jesus', 'Parables', 'Moses', 'Joseph\'s Coat',
            ].map((topic) => (
              <Link
                key={topic}
                to="/generate"
                className="px-4 py-2 bg-white dark:bg-stone-800 rounded-full text-sm font-medium text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-amber-400 hover:text-amber-600 transition-all"
              >
                {topic}
              </Link>
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
            to="/bible-lesson-plans"
            className="p-6 bg-white dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-amber-400 hover:shadow-lg transition-all group"
          >
            <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 mb-2 group-hover:text-amber-600">Bible Lesson Plans</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400">Complete lesson plans for any book of the Bible with discussion questions and activities.</p>
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

export default SundaySchoolLessonsPage
