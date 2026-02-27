import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useI18n } from '@/i18n'
import { BookOpen, BookMarked, Palette, Gift, Users, Scroll, Sword, GrapeIcon, ClipboardList, Sparkles, Crown, Music, Mountain, Search, Flame, Library, X, ArrowRight, Clock } from 'lucide-react'

export const Route = createFileRoute('/resources')({
  component: ResourcesPage,
})

const resourceCategories = [
  {
    titleKey: 'Teaching Guides', icon: <BookMarked className="w-5 h-5" strokeWidth={1.5} />, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20',
    resources: [
      { title: 'How to Lead a Sunday School Class', desc: 'A comprehensive guide for new and experienced teachers on classroom management and engagement techniques.', tag: 'Guide', readTime: '8 min', slug: 'how-to-lead-sunday-school-class' },
      { title: 'Age-Appropriate Teaching Strategies', desc: 'Adapt your teaching style for different age groups from preschool to adult.', tag: 'Strategy', readTime: '12 min', slug: 'age-appropriate-teaching-strategies' },
      { title: 'Using Visual Aids in Bible Teaching', desc: 'Creative ways to use props and visual storytelling to make lessons memorable.', tag: 'Tips', readTime: '6 min', slug: 'using-visual-aids-bible-teaching' },
      { title: 'Managing Classroom Behavior with Grace', desc: 'Practical strategies for maintaining a positive, respectful classroom environment.', tag: 'Guide', readTime: '10 min', slug: 'managing-classroom-behavior-with-grace' },
    ],
  },
  {
    titleKey: 'Bible Study Tools', icon: <BookOpen className="w-5 h-5" strokeWidth={1.5} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    resources: [
      { title: 'Bible Book Overview Charts', desc: 'Quick-reference charts for every book of the Bible with key themes, authors, and timelines.', tag: 'Reference', readTime: '5 min', slug: 'bible-book-overview-charts' },
      { title: 'Scripture Memory Techniques', desc: 'Proven methods to help students memorize and internalize Bible verses.', tag: 'Method', readTime: '7 min', slug: 'scripture-memory-techniques' },
      { title: 'Bible Timeline for Kids', desc: 'A visual timeline of major Bible events designed for elementary-age learners.', tag: 'Visual', readTime: '4 min', slug: 'bible-timeline-for-kids' },
      { title: 'Understanding Bible Context', desc: 'Research and explain historical, cultural, and literary context to make Scripture come alive.', tag: 'Deep Dive', readTime: '15 min', slug: 'understanding-bible-context' },
    ],
  },
  {
    titleKey: 'Activity Ideas', icon: <Palette className="w-5 h-5" strokeWidth={1.5} />, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20',
    resources: [
      { title: '50 Bible Crafts for Kids', desc: 'Easy-to-make crafts using common household materials, organized by age group.', tag: 'Crafts', readTime: '10 min', slug: '50-bible-crafts-for-kids' },
      { title: 'Bible Games for All Ages', desc: 'Indoor and outdoor games that teach Biblical principles while keeping kids engaged.', tag: 'Games', readTime: '8 min', slug: 'bible-games-for-all-ages' },
      { title: 'Worship Songs for Children', desc: 'Curated worship songs with motions, lyrics, and teaching tips.', tag: 'Music', readTime: '5 min', slug: 'worship-songs-for-children' },
      { title: 'Drama & Skit Ideas', desc: 'Short skits that bring Bible stories to life for older elementary and teen groups.', tag: 'Drama', readTime: '6 min', slug: 'drama-and-skit-ideas' },
    ],
  },
  {
    titleKey: 'Seasonal & Holiday', icon: <Gift className="w-5 h-5" strokeWidth={1.5} />, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20',
    resources: [
      { title: 'Easter Devotionals & Lessons', desc: 'Walk through Holy Week with resurrection-focused lessons and activities.', tag: 'Easter', readTime: '10 min', slug: 'easter-devotionals-and-lessons' },
      { title: 'Christmas Lessons for Sunday School', desc: 'Christ-centered Christmas lesson plans beyond the familiar nativity story.', tag: 'Christmas', readTime: '10 min', slug: 'christmas-lessons-for-sunday-school' },
      { title: 'VBS Themes & Planning Guide', desc: 'Creative Vacation Bible School themes with activities and coordination tips.', tag: 'VBS', readTime: '9 min', slug: 'vbs-themes-and-planning' },
      { title: 'Back-to-School Bible Lessons', desc: 'Lessons on courage, identity, and trusting God in new seasons.', tag: 'Fall', readTime: '7 min', slug: 'back-to-school-bible-lessons' },
    ],
  },
  {
    titleKey: 'Parent & Family', icon: <Users className="w-5 h-5" strokeWidth={1.5} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20',
    resources: [
      { title: 'Family Devotional Guide', desc: 'Simple frameworks for family devotions that actually work.', tag: 'Family', readTime: '8 min', slug: 'family-devotional-guide' },
      { title: 'Parent Communication Templates', desc: 'Ready-to-use email templates and newsletter formats.', tag: 'Templates', readTime: '6 min', slug: 'parent-communication-templates' },
      { title: 'Faith at Home Activities', desc: 'Fun, faith-building activities families can do together during the week.', tag: 'Activities', readTime: '7 min', slug: 'faith-at-home-activities' },
    ],
  },
]

const popularTopics = [
  { name: 'Parables of Jesus', count: 12, icon: <Scroll className="w-4 h-4" strokeWidth={1.5} />, slug: 'parables-of-jesus' },
  { name: 'Old Testament Heroes', count: 18, icon: <Sword className="w-4 h-4" strokeWidth={1.5} />, slug: 'old-testament-heroes' },
  { name: 'Fruits of the Spirit', count: 9, icon: <GrapeIcon className="w-4 h-4" strokeWidth={1.5} />, slug: 'fruits-of-the-spirit' },
  { name: 'Ten Commandments', count: 10, icon: <ClipboardList className="w-4 h-4" strokeWidth={1.5} />, slug: 'the-ten-commandments' },
  { name: 'Miracles of Jesus', count: 14, icon: <Sparkles className="w-4 h-4" strokeWidth={1.5} />, slug: 'miracles-of-jesus' },
  { name: 'Women of the Bible', count: 11, icon: <Crown className="w-4 h-4" strokeWidth={1.5} />, slug: 'women-of-the-bible' },
  { name: 'Psalms & Worship', count: 8, icon: <Music className="w-4 h-4" strokeWidth={1.5} />, slug: 'psalms-and-worship' },
  { name: 'The Beatitudes', count: 9, icon: <Mountain className="w-4 h-4" strokeWidth={1.5} />, slug: 'the-beatitudes' },
]

function ResourcesPage() {
  const { t } = useI18n()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCategories = resourceCategories
    .filter(cat => !activeCategory || cat.titleKey === activeCategory)
    .map(cat => ({
      ...cat,
      resources: cat.resources.filter(r =>
        searchQuery === '' ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.tag.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter(cat => cat.resources.length > 0)

  const totalResources = resourceCategories.reduce((s, c) => s + c.resources.length, 0)

  return (
    <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Minimal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 mb-2">
            <Library className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-sm font-semibold uppercase tracking-wider">{t('resources.resourceLibrary')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Text, serif' }}>
            {t('resources.title')}
          </h1>
          <p className="text-base text-stone-500 dark:text-stone-400 max-w-xl">
            {totalResources} {t('resources.subtitle')}
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" strokeWidth={1.5} />
            <input 
              type="text" 
              placeholder={t('resources.searchPlaceholder')}
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="w-full pl-12 pr-10 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-base placeholder:text-stone-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button 
            onClick={() => setActiveCategory(null)} 
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === null 
                ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900' 
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:border-stone-400'
            }`}
          >
            {t('resources.all')}
          </button>
          {resourceCategories.map(cat => (
            <button 
              key={cat.titleKey} 
              onClick={() => setActiveCategory(activeCategory === cat.titleKey ? null : cat.titleKey)} 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                activeCategory === cat.titleKey 
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900' 
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:border-stone-400'
              }`}
            >
              <span className={activeCategory === cat.titleKey ? '' : cat.color}>{cat.icon}</span>
              {cat.titleKey}
            </button>
          ))}
        </div>

        {/* Featured Article - Subtle Card */}
        {!activeCategory && !searchQuery && (
          <Link 
            to="/article/$slug" 
            params={{ slug: 'complete-sunday-school-teachers-handbook' }}
            className="group block mb-12 p-6 sm:p-8 rounded-2xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-lg transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="w-14 h-14 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-7 h-7 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold">{t('resources.featured')}</span>
                  <span className="text-xs text-stone-400 flex items-center gap-1"><Clock className="w-3 h-3" strokeWidth={1.5} /> 15 {t('resources.minRead')}</span>
                </div>
                <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-500 transition-colors mb-1" style={{ fontFamily: 'Crimson Text, serif' }}>
                  {t('resources.featuredArticle')}
                </h2>
                <p className="text-stone-500 dark:text-stone-400 text-sm">
                  {t('resources.featuredDesc')}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-stone-300 dark:text-stone-600 group-hover:text-amber-600 group-hover:translate-x-1 transition-all hidden sm:block" strokeWidth={1.5} />
            </div>
          </Link>
        )}

        {/* Popular Topics - Horizontal Scroll */}
        {!activeCategory && !searchQuery && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" strokeWidth={1.5} /> {t('resources.popularTopics')}
              </h2>
              <Link to="/generate" className="text-sm font-medium text-amber-600 dark:text-amber-500 hover:text-amber-700 flex items-center gap-1">
                {t('resources.generateLesson')} <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {popularTopics.map((topic, i) => (
                <Link 
                  key={i} 
                  to="/article/$slug" 
                  params={{ slug: topic.slug }} 
                  className="group flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-600 transition-all"
                >
                  <div className="w-9 h-9 rounded-lg bg-stone-100 dark:bg-stone-700 flex items-center justify-center text-stone-500 dark:text-stone-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                    {topic.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-700 dark:text-stone-300 truncate">{topic.name}</p>
                    <p className="text-xs text-stone-400">{topic.count} {t('resources.lessonsCount')}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Resource Categories */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">{t('resources.noResourcesFound')}</h3>
            <p className="text-stone-500 dark:text-stone-400 mb-4 text-sm">{t('resources.noResourcesDesc')}</p>
            <button 
              onClick={() => { setSearchQuery(''); setActiveCategory(null) }} 
              className="text-sm font-medium text-amber-600 hover:text-amber-700"
            >
              {t('resources.clearFilters')}
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredCategories.map((category, i) => (
              <div key={i}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-xl ${category.bg} flex items-center justify-center ${category.color}`}>
                    {category.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">{category.titleKey}</h2>
                    <p className="text-xs text-stone-400">{category.resources.length} {t('resources.resources')}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.resources.map((resource, j) => (
                    <Link 
                      key={j} 
                      to="/article/$slug" 
                      params={{ slug: resource.slug }} 
                      className="group p-5 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-md ${category.bg} ${category.color}`}>
                          {resource.tag}
                        </span>
                        <span className="text-xs text-stone-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" strokeWidth={1.5} /> {resource.readTime}
                        </span>
                      </div>
                      <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2 group-hover:text-amber-700 dark:group-hover:text-amber-500 transition-colors">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-2">
                        {resource.desc}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA - Simple */}
        <div className="mt-16 pt-10 border-t border-stone-200 dark:border-stone-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
                {t('resources.readyToCreate')}
              </h3>
              <p className="text-stone-500 dark:text-stone-400 text-sm">
                {t('resources.generateComplete')}
              </p>
            </div>
            <Link 
              to="/generate" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <Sparkles className="w-5 h-5" strokeWidth={1.5} /> {t('resources.generateLessonBtn')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
