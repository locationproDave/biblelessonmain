import { useEffect } from 'react'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  noindex?: boolean
}

const BASE_URL = 'https://biblelessonplanner.com'
const DEFAULT_IMAGE = `${BASE_URL}/images/og-image.png`
const SITE_NAME = 'Bible Lesson Planner'

// SEO data for each page
export const pageSEO: Record<string, SEOProps> = {
  '/': {
    title: 'Bible Lesson Planner | #1 AI Sunday School Lesson Plan Generator',
    description: 'Create professional Sunday school lesson plans in minutes with AI. Free Bible lesson templates for all ages. 20+ translations, printable PDFs. Trusted by 2,500+ churches.',
    keywords: 'Sunday school lesson plans, Bible lesson planner, children\'s ministry curriculum, church lesson plans, free Sunday school curriculum, AI lesson generator',
  },
  '/generate': {
    title: 'Create Bible Lesson Plan | Free AI Lesson Generator',
    description: 'Generate custom Sunday school lessons in minutes. Choose from 66 Bible books, 20+ translations, all age groups. Free first lesson, no credit card required.',
    keywords: 'create Bible lesson, AI lesson generator, Sunday school lesson maker, custom Bible study, lesson plan creator',
  },
  '/templates': {
    title: 'Free Sunday School Lesson Templates | Bible Lesson Planner',
    description: 'Browse 50+ free Sunday school lesson templates. Christmas, Easter, Parables, Old Testament heroes & more. Ready-to-use lessons for Preschool through Adult.',
    keywords: 'Sunday school templates, free Bible lessons, children\'s church curriculum, VBS lessons, youth group Bible study templates',
  },
  '/pricing': {
    title: 'Pricing Plans | Bible Lesson Planner - From $8.33/month',
    description: 'Affordable Sunday school curriculum plans for individuals & churches. First lesson FREE. Starting at $8.33/month. Save 17% with annual billing.',
    keywords: 'Sunday school curriculum pricing, church lesson plans cost, Bible lesson subscription, children\'s ministry budget',
  },
  '/lessons': {
    title: 'My Lesson Library | Bible Lesson Planner',
    description: 'Access your personalized library of AI-generated Bible lessons. Search, filter, organize, and share your Sunday school curriculum.',
    keywords: 'Bible lesson library, saved lessons, curriculum organizer, lesson management',
  },
  '/curriculum': {
    title: 'Curriculum Planner | Multi-Week Bible Study Series',
    description: 'Plan your entire Sunday school year. Create multi-week Bible study series, track progress, and coordinate your teaching team.',
    keywords: 'curriculum planner, Sunday school calendar, Bible study series, annual church curriculum',
  },
  '/planner': {
    title: 'Lesson Calendar Planner | Schedule Your Teaching',
    description: 'Visual calendar to plan and schedule your Bible lessons. Sync with Google Calendar, export to iCal. Never miss a Sunday.',
    keywords: 'lesson planner calendar, Sunday school schedule, teaching calendar, church curriculum scheduler',
  },
  '/resources': {
    title: 'Bible Teaching Resources | Free Downloads & Guides',
    description: 'Free Bible teaching resources, printable activities, coloring pages, and guides for Sunday school teachers and children\'s ministry leaders.',
    keywords: 'Bible teaching resources, Sunday school printables, children\'s ministry resources, free church materials',
  },
  '/help': {
    title: 'Tutorials & Help Center | Bible Lesson Planner',
    description: 'Learn how to create amazing Bible lessons. Video tutorials, FAQ, tips for Sunday school teachers. Get started in minutes.',
    keywords: 'Bible lesson tutorial, Sunday school help, how to teach Bible, children\'s ministry tips',
  },
  '/contact': {
    title: 'Contact Us | Bible Lesson Planner Support',
    description: 'Get in touch with our support team. Questions about Sunday school lesson plans? We\'re here to help your ministry succeed.',
    keywords: 'contact Bible Lesson Planner, Sunday school support, church curriculum help',
  },
  '/team': {
    title: 'Team Collaboration | Share Lessons with Your Ministry',
    description: 'Collaborate with your teaching team. Share lessons, assign roles, and build curriculum together. Perfect for churches with multiple classes.',
    keywords: 'team collaboration, share Sunday school lessons, church team management, ministry coordination',
  },
  '/series': {
    title: 'Lesson Series | Organize Multi-Week Bible Studies',
    description: 'Create and manage multi-week Bible lesson series. Perfect for VBS, youth retreats, or themed Sunday school quarters.',
    keywords: 'Bible lesson series, multi-week curriculum, VBS planning, themed Sunday school',
  },
  '/progress': {
    title: 'Teaching Progress Tracker | Monitor Your Curriculum',
    description: 'Track which lessons you\'ve taught, monitor student engagement, and ensure complete Bible coverage throughout the year.',
    keywords: 'teaching progress, lesson tracker, curriculum progress, Sunday school monitoring',
  },
  '/sunday-school-lessons': {
    title: 'Free Sunday School Lessons & Curriculum | Bible Lesson Planner',
    description: 'Create engaging Sunday school lessons for all ages with our AI-powered lesson planner. Free printable Bible lessons, activities, and curriculum for Preschool through Adult classes.',
    keywords: 'Sunday school lessons, free Sunday school curriculum, children\'s church lessons, Sunday school activities, Bible lessons for kids, youth Sunday school, adult Bible class, printable Sunday school lessons',
  },
  '/bible-lesson-plans': {
    title: 'Free Bible Lesson Plans | AI-Powered Lesson Plan Generator',
    description: 'Create comprehensive Bible lesson plans in minutes. Free printable lesson plans for Sunday school, youth groups, and Bible studies. All 66 books of the Bible, 20+ translations.',
    keywords: 'Bible lesson plans, free Bible lessons, Bible study curriculum, Christian lesson plans, church lesson plans, youth Bible study, Bible teaching resources, printable Bible lessons',
  },
  '/vacation-bible-school': {
    title: 'VBS Curriculum & Vacation Bible School Lessons | Bible Lesson Planner',
    description: 'Plan your Vacation Bible School with our AI-powered curriculum generator. Free VBS themes, lessons, crafts, and activities for all ages. Create a week of unforgettable Bible learning.',
    keywords: 'VBS curriculum, Vacation Bible School, VBS lessons, VBS themes, summer Bible program, church VBS, kids VBS activities, VBS crafts, free VBS curriculum',
  },
}

export function useSEO(pageProps?: SEOProps) {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/'
  const defaultSEO = pageSEO[path] || pageSEO['/']
  
  const seo = {
    title: pageProps?.title || defaultSEO.title,
    description: pageProps?.description || defaultSEO.description,
    keywords: pageProps?.keywords || defaultSEO.keywords,
    image: pageProps?.image || DEFAULT_IMAGE,
    url: pageProps?.url || `${BASE_URL}${path}`,
    type: pageProps?.type || 'website',
    noindex: pageProps?.noindex || false,
  }

  useEffect(() => {
    // Update document title
    document.title = seo.title || SITE_NAME

    // Helper to update or create meta tag
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name'
      let element = document.querySelector(`meta[${attr}="${name}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attr, name)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    // Update meta tags
    if (seo.description) setMeta('description', seo.description)
    if (seo.keywords) setMeta('keywords', seo.keywords)
    
    // Robots
    setMeta('robots', seo.noindex ? 'noindex, nofollow' : 'index, follow')

    // Open Graph
    setMeta('og:title', seo.title || '', true)
    setMeta('og:description', seo.description || '', true)
    setMeta('og:image', seo.image, true)
    setMeta('og:url', seo.url, true)
    setMeta('og:type', seo.type, true)
    setMeta('og:site_name', SITE_NAME, true)

    // Twitter
    setMeta('twitter:title', seo.title || '')
    setMeta('twitter:description', seo.description || '')
    setMeta('twitter:image', seo.image)
    setMeta('twitter:card', 'summary_large_image')

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', seo.url)

  }, [seo.title, seo.description, seo.keywords, seo.image, seo.url, seo.type, seo.noindex])

  return seo
}

// Track page views with Google Analytics
export function trackPageView(url: string, title: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'page_view', {
      page_path: url,
      page_title: title,
    })
  }
}

// Track custom events
export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Track conversions (signup, purchase, lesson creation)
export function trackConversion(conversionType: 'signup' | 'purchase' | 'lesson_created' | 'checkout_started', data?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    let eventName = 'custom_event'
    if (conversionType === 'signup') eventName = 'sign_up'
    else if (conversionType === 'purchase') eventName = 'purchase'
    else if (conversionType === 'lesson_created') eventName = 'generate_lead'
    else if (conversionType === 'checkout_started') eventName = 'begin_checkout'

    ;(window as any).gtag('event', eventName, {
      ...data,
      send_to: 'G-H6JP1LBZL4',
    })
  }
}

export default useSEO
