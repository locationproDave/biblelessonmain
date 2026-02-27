import { createFileRoute, Link } from '@tanstack/react-router'
import { articles } from '@/data/articles'
import { FileText, BookOpen, Sparkles, ArrowLeft, Clock, Tag } from 'lucide-react'

export const Route = createFileRoute('/article/$slug')({
  component: ArticlePage,
})

function ArticlePage() {
  const { slug } = Route.useParams()
  const article = articles.find(a => a.slug === slug)

  if (!article) {
    return (
      <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917]">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>Article Not Found</h1>
          <p className="text-base text-stone-500 dark:text-stone-400 mb-6">The article you're looking for doesn't exist.</p>
          <Link to="/resources" className="inline-flex items-center gap-2 text-amber-700 dark:text-amber-500 font-semibold hover:text-amber-800 dark:hover:text-amber-400 transition-colors">
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Back to Resources
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <Link to="/resources" className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-500 transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={1.5} /> Back to Resources
        </Link>

        {/* Article Header */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 text-xs font-semibold uppercase tracking-wider">
              <Tag className="w-3 h-3" strokeWidth={1.5} /> {article.tag}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400">
              <Clock className="w-4 h-4" strokeWidth={1.5} /> {article.readTime} read
            </span>
            <span className="text-stone-300 dark:text-stone-600">•</span>
            <span className="text-sm text-stone-500 dark:text-stone-400">{article.category}</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 dark:text-stone-50 leading-tight mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
            {article.title}
          </h1>
          
          <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed max-w-3xl">
            {article.description}
          </p>
        </header>

        {/* Article Body */}
        <article className="article-content prose prose-stone dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: article.html }}
        />

        {/* CTA Footer */}
        <div className="mt-14 pt-8 border-t border-stone-200 dark:border-stone-700">
          <div className="relative overflow-hidden bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-8 sm:p-10 text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-50 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
              Ready to Create Your Lesson?
            </h3>
            <p className="text-base text-stone-500 dark:text-stone-400 mb-6 max-w-lg mx-auto">
              Put these ideas into practice with our AI-powered lesson planner.
            </p>
            <Link 
              to="/generate" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-100 transition-all duration-200"
            >
              <Sparkles className="w-5 h-5" strokeWidth={1.5} /> Generate a Lesson Plan
            </Link>
          </div>
        </div>

      <style>{`
        .article-content h2 {
          font-family: 'Crimson Text', serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: #1c1917;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #d6d3d1;
        }
        .dark .article-content h2 {
          color: #fafaf9;
          border-bottom-color: #44403c;
        }

        .article-content h3 {
          font-family: 'Crimson Text', serif;
          font-size: 1.375rem;
          font-weight: 600;
          color: #292524;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
        }
        .dark .article-content h3 {
          color: #e7e5e4;
        }

        .article-content p {
          font-size: 1.125rem;
          line-height: 1.8;
          color: #57534e;
          margin-bottom: 1.25rem;
        }
        .dark .article-content p {
          color: #a8a29e;
        }

        .article-content ul, .article-content ol {
          margin: 1rem 0 1.5rem 1.5rem;
          padding-left: 0;
        }
        .article-content ul {
          list-style-type: disc;
        }
        .article-content ol {
          list-style-type: decimal;
        }
        .article-content ul li, .article-content ol li {
          font-size: 1.1rem;
          line-height: 1.75;
          color: #57534e;
          margin-bottom: 0.5rem;
          padding-left: 0.5rem;
        }
        .dark .article-content ul li, .dark .article-content ol li {
          color: #a8a29e;
        }
        .article-content ul li::marker {
          color: #d97706;
        }
        .article-content ol li::marker {
          color: #d97706;
          font-weight: 600;
        }

        .article-content li strong, .article-content strong {
          color: #1c1917;
          font-weight: 600;
        }
        .dark .article-content li strong, .dark .article-content strong {
          color: #fafaf9;
        }

        .article-content em {
          font-style: italic;
          color: #78716c;
        }
        .dark .article-content em {
          color: #a8a29e;
        }

        .article-content blockquote {
          margin: 2rem 0;
          padding: 1.25rem 1.5rem;
          background: #fefce8;
          border-left: 4px solid #d97706;
          border-radius: 0 0.75rem 0.75rem 0;
          font-size: 1.1rem;
          line-height: 1.7;
          color: #713f12;
        }
        .dark .article-content blockquote {
          background: rgba(120, 53, 15, 0.1);
          color: #fef3c7;
          border-left-color: #d97706;
        }

        .article-content a {
          color: #d97706;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .article-content a:hover {
          color: #b45309;
        }
        .dark .article-content a {
          color: #fbbf24;
        }
        .dark .article-content a:hover {
          color: #fcd34d;
        }
      `}</style>
      </div>
    </div>
  )
}
