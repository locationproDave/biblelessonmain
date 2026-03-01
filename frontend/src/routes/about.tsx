import { createFileRoute, Link } from '@tanstack/react-router'
import { useI18n } from '@/i18n'
import { Anchor, Cross, Medal, Code, Users, BookOpen, Globe, Lightbulb, Heart, HandHeart, BookMarked, Star, Sparkles, Mail, ArrowRight, Shield } from 'lucide-react'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
              <Heart className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-sm font-semibold uppercase tracking-wider">About Us</span>
            </div>
            <span className="text-stone-300 dark:text-stone-600">|</span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-900 text-white rounded-md text-xs font-bold">
              <Shield className="w-3.5 h-3.5" />
              Veteran Owned
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-50 mb-3" style={{ fontFamily: 'Crimson Text, serif' }}>
            Our Mission & Story
          </h1>
          <p className="text-base text-stone-500 dark:text-stone-400 max-w-xl">
            Empowering churches and educators worldwide to share God's Word effectively
          </p>
        </div>

        {/* Founder Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div>
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
              A Vision Born from Faith
            </h2>
            <div className="space-y-4 text-stone-600 dark:text-stone-400 leading-relaxed">
              <p>
                Bible Lesson Planner was founded by a lifelong Christian and proud US Navy Veteran, who grew up witnessing the dedication of Sunday school teachers, youth leaders, and pastors firsthand.
              </p>
              <p>
                With 25 years of experience building software solutions, he was inspired by his mother one day while she prepared her Sunday bible study. He recognized a critical need in churches worldwide: high-quality, Scripture-based lesson plans that don't require hours of preparation.
              </p>
              <p>
                Together with his son, they set out to create the <span className="font-semibold text-stone-900 dark:text-stone-200">world's best solution for Bible study and Sunday school lesson planning</span> — a tool that combines cutting-edge technology with deep scriptural understanding.
              </p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Anchor className="w-7 h-7 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">Our Founders</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400">US Navy Veteran & Son</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {[
                { icon: <Cross className="w-5 h-5" strokeWidth={1.5} />, text: 'Lifelong Christians dedicated to spreading God\'s Word' },
                { icon: <Medal className="w-5 h-5" strokeWidth={1.5} />, text: 'Proud US Navy Veteran with a heart for service' },
                { icon: <Code className="w-5 h-5" strokeWidth={1.5} />, text: '25 years of software development experience' },
                { icon: <Users className="w-5 h-5" strokeWidth={1.5} />, text: 'Family business built on faith and fellowship' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-stone-50 dark:bg-stone-700/30">
                  <span className="text-amber-600 dark:text-amber-500">{item.icon}</span>
                  <span className="text-sm text-stone-600 dark:text-stone-400">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mission */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-6 text-center" style={{ fontFamily: 'Crimson Text, serif' }}>
            Our Mission
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: <BookOpen className="w-6 h-6" strokeWidth={1.5} />, title: 'Scripture-Centered', desc: 'Every lesson is rooted in God\'s Word, ensuring biblical accuracy and spiritual depth', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { icon: <Globe className="w-6 h-6" strokeWidth={1.5} />, title: 'Global Reach', desc: 'Serving churches and educators around the world with multilingual support', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
              { icon: <Lightbulb className="w-6 h-6" strokeWidth={1.5} />, title: 'Innovation', desc: 'Leveraging AI technology to save time without sacrificing quality or depth', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            ].map((item, i) => (
              <div key={i} className="p-5 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 text-center">
                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mx-auto mb-3 ${item.color}`}>
                  {item.icon}
                </div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">{item.title}</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-6 text-center" style={{ fontFamily: 'Crimson Text, serif' }}>
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: <Cross className="w-6 h-6" strokeWidth={1.5} />, title: 'Faith First', desc: 'Everything we do is grounded in our faith in Jesus Christ and commitment to His teachings' },
              { icon: <HandHeart className="w-6 h-6" strokeWidth={1.5} />, title: 'Service', desc: 'Inspired by military service, we\'re committed to serving the Christian community with excellence' },
              { icon: <BookMarked className="w-6 h-6" strokeWidth={1.5} />, title: 'Biblical Integrity', desc: 'We maintain the highest standards of scriptural accuracy in every lesson we help create' },
              { icon: <Star className="w-6 h-6" strokeWidth={1.5} />, title: 'Excellence', desc: 'We strive to deliver the world\'s best Bible study and lesson planning experience' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                <span className="text-amber-600 dark:text-amber-500 mt-0.5">{item.icon}</span>
                <div>
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-1">{item.title}</h3>
                  <p className="text-sm text-stone-500 dark:text-stone-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="pt-10 border-t border-stone-200 dark:border-stone-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
                Ready to Transform Your Bible Teaching?
              </h3>
              <p className="text-stone-500 dark:text-stone-400 text-sm">
                Join thousands of churches who trust Bible Lesson Planner
              </p>
            </div>
            <div className="flex gap-3">
              <Link 
                to="/generate" 
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold transition-all"
              >
                <Sparkles className="w-4 h-4" strokeWidth={1.5} /> Get Started
              </Link>
              <Link 
                to="/contact" 
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-semibold hover:border-amber-400 transition-all"
              >
                <Mail className="w-4 h-4" strokeWidth={1.5} /> Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
