import { createFileRoute, Link, useParams, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api'
import { useSession } from '@/lib/auth-client'
import { Printer, Download, ArrowLeft, BookOpen, Clock, Users, Target, Package, BookMarked, Lock } from 'lucide-react'

export const Route = createFileRoute('/print/$lessonId')({
  component: PrintLessonPage,
})

interface PrintData {
  lessonId: string
  title: string
  passage: string
  ageGroup: string
  duration: string
  theme: string
  format: string
  memoryVerse: {
    text: string
    reference: string
  }
  objectives: string[]
  sections: Array<{
    icon?: string
    title: string
    duration: string
    content: string
    type?: string
  }>
  materials: Array<{
    item: string
    category?: string
  }>
  crossReferences: Array<{
    reference?: string
    text?: string
  } | string>
  description: string
}

function PrintLessonPage() {
  const { lessonId } = useParams({ from: '/print/$lessonId' })
  const { data: session, isPending: sessionLoading } = useSession()
  const navigate = useNavigate()
  const isLoggedIn = !!session?.user

  // Redirect non-logged in users
  if (!sessionLoading && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-stone-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
            Sign In Required
          </h1>
          <p className="text-stone-600 dark:text-stone-400 mb-6">
            Create a free account to print and export your lessons. You can create test lessons without an account to see how the site works.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/signup"
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold transition-colors"
            >
              Create Free Account
            </Link>
            <Link
              to="/signin"
              className="w-full py-3 bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-semibold hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/generate"
              className="text-sm text-stone-500 dark:text-stone-400 hover:text-amber-600 transition-colors mt-2"
            >
              Or try creating a test lesson first
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { data, isLoading, error } = useQuery<PrintData>({
    queryKey: ['print-lesson', lessonId],
    queryFn: () => apiRequest(`/export/print/${lessonId}`),
  })

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await apiRequest('/export/lesson', {
        method: 'POST',
        body: JSON.stringify({ lessonId, format: 'pdf' }),
      })
      
      if (response.fileData) {
        const byteCharacters = atob(response.fileData)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = response.filename || 'lesson.pdf'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('Download error:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-500">Loading lesson...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load lesson</p>
          <Link
            to="/lessons"
            className="text-amber-600 hover:underline"
          >
            Back to Lessons
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { 
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-container {
            max-width: 100% !important;
            padding: 0 !important;
          }
          .page-break { page-break-before: always; }
        }
        @media screen {
          .print-only { display: none; }
        }
      `}</style>

      {/* Action Bar (hidden when printing) */}
      <div className="no-print sticky top-0 z-50 bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to="/lesson/$lessonId"
            params={{ lessonId }}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors"
            data-testid="back-to-lesson-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Lesson
          </Link>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors"
              data-testid="download-pdf-btn"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium transition-colors"
              data-testid="print-btn"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Print Content */}
      <div className="print-container max-w-4xl mx-auto px-4 py-8 bg-white min-h-screen" data-testid="print-lesson-page">
        {/* Header */}
        <header className="text-center mb-8 pb-6 border-b-2 border-amber-500">
          <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">{data.title}</h1>
          <p className="text-lg text-stone-600">{data.passage}</p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm text-stone-500">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {data.ageGroup}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {data.duration}
            </span>
            {data.theme && (
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {data.theme}
              </span>
            )}
          </div>
        </header>

        {/* Memory Verse */}
        {data.memoryVerse?.text && (
          <section className="mb-8 p-6 bg-amber-50 rounded-lg border-l-4 border-amber-500">
            <h2 className="text-lg font-bold text-[#1E3A5F] mb-3 flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-amber-600" />
              Memory Verse
            </h2>
            <blockquote className="text-lg italic text-stone-700 mb-2">
              "{data.memoryVerse.text}"
            </blockquote>
            <p className="text-right font-semibold text-stone-600">
              — {data.memoryVerse.reference}
            </p>
          </section>
        )}

        {/* Learning Objectives */}
        {data.objectives?.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-[#1E3A5F] mb-4 flex items-center gap-2 border-b-2 border-amber-500 pb-2">
              <Target className="w-5 h-5 text-amber-600" />
              Learning Objectives
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-stone-700">
              {data.objectives.map((obj, idx) => (
                <li key={idx} className="pl-2">{obj}</li>
              ))}
            </ol>
          </section>
        )}

        {/* Lesson Sections */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#1E3A5F] mb-4 flex items-center gap-2 border-b-2 border-amber-500 pb-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            Lesson Content
          </h2>
          
          <div className="space-y-6">
            {data.sections?.map((section, idx) => (
              <div key={idx} className="p-4 bg-stone-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-[#1E3A5F]">
                    {section.icon} {section.title}
                  </h3>
                  <span className="text-sm text-stone-500 bg-white px-2 py-1 rounded">
                    {section.duration}
                  </span>
                </div>
                <p className="text-stone-700 whitespace-pre-wrap">{section.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Materials */}
        {data.materials?.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-[#1E3A5F] mb-4 flex items-center gap-2 border-b-2 border-amber-500 pb-2">
              <Package className="w-5 h-5 text-amber-600" />
              Materials Needed
            </h2>
            <ul className="grid sm:grid-cols-2 gap-2">
              {data.materials.map((mat, idx) => (
                <li key={idx} className="flex items-center gap-2 text-stone-700">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  {typeof mat === 'string' ? mat : (
                    <>
                      {mat.item}
                      {mat.category && (
                        <span className="text-xs bg-stone-200 px-2 py-0.5 rounded text-stone-500">
                          {mat.category}
                        </span>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Cross References */}
        {data.crossReferences?.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-[#1E3A5F] mb-4 flex items-center gap-2 border-b-2 border-amber-500 pb-2">
              <BookOpen className="w-5 h-5 text-amber-600" />
              Cross References
            </h2>
            <ul className="space-y-2">
              {data.crossReferences.map((ref, idx) => (
                <li key={idx} className="text-stone-700">
                  {typeof ref === 'string' ? ref : (
                    <>
                      <strong>{ref.reference}</strong>
                      {ref.text && `: ${ref.text}`}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-stone-200 text-center text-sm text-stone-500">
          <p>Generated by Bible Lesson Planner</p>
          <p className="mt-1">www.biblelessonplanner.com</p>
        </footer>
      </div>
    </>
  )
}
