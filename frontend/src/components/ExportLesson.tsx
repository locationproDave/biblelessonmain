import { useState } from 'react'
import { exportAPI } from '@/lib/api'
import { FileText, FileJson, Download } from 'lucide-react'

interface ExportLessonProps {
  lessonId: string
  lessonTitle: string
}

export function ExportLesson({ lessonId, lessonTitle }: ExportLessonProps) {
  const [showModal, setShowModal] = useState(false)
  const [format, setFormat] = useState<'pdf' | 'docx'>('pdf')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await exportAPI.exportLesson(lessonId, format)
      
      if (result.success && result.fileData) {
        // Decode base64 and download
        const byteCharacters = atob(result.fileData)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { 
          type: format === 'pdf' 
            ? 'application/pdf' 
            : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        })
        
        // Create download link
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = result.filename || `${lessonTitle.replace(/[^a-zA-Z0-9]/g, '-')}.${format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        setShowModal(false)
      } else if (result.success && result.htmlContent) {
        // Legacy fallback for HTML content
        if (format === 'pdf') {
          const printWindow = window.open('', '_blank')
          if (printWindow) {
            printWindow.document.write(result.htmlContent)
            printWindow.document.close()
            printWindow.focus()
            setTimeout(() => {
              printWindow.print()
            }, 500)
          }
        }
        setShowModal(false)
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed. Please try again.'
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center justify-center gap-2 w-32 py-2.5 rounded-lg bg-white dark:bg-stone-800 text-[#1E3A5F] dark:text-stone-200 text-sm font-semibold border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors shadow-sm"
        data-testid="export-lesson-btn"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-[#0F1F33] rounded-2xl shadow-2xl border border-[#E8DCC8] dark:border-[#334155] w-full max-w-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#E8DCC8] dark:border-[#334155]">
              <h3 className="text-lg font-bold text-[#333333] dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5" /> Export Lesson
              </h3>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-2 rounded-lg hover:bg-[#F0F4F8] dark:hover:bg-[#334155] transition-colors"
              >
                <svg className="w-5 h-5 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              <p className="text-sm text-[#6B7280] dark:text-[#94A3B8]">
                Export "<span className="font-semibold text-[#333333] dark:text-white">{lessonTitle}</span>" as:
              </p>

              {/* Format Selection */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormat('pdf')}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    format === 'pdf'
                      ? 'border-[#D4A017] bg-[#D4A017]/10'
                      : 'border-[#E8DCC8] dark:border-[#334155] hover:border-[#D4A017]/50'
                  }`}
                >
                  <FileText className="w-8 h-8 mb-2" />
                  <span className="font-semibold text-[#333333] dark:text-white">PDF</span>
                  <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] mt-1">Print-ready format</p>
                </button>
                <button
                  onClick={() => setFormat('docx')}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    format === 'docx'
                      ? 'border-[#D4A017] bg-[#D4A017]/10'
                      : 'border-[#E8DCC8] dark:border-[#334155] hover:border-[#D4A017]/50'
                  }`}
                >
                  <FileJson className="w-8 h-8 mb-2" />
                  <span className="font-semibold text-[#333333] dark:text-white">Word</span>
                  <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] mt-1">Editable document</p>
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}

              {/* Info */}
              <p className="text-xs text-[#9CA3AF] dark:text-[#64748B]">
                {format === 'pdf' 
                  ? 'A professionally formatted PDF will be downloaded.'
                  : 'An editable Word document will be downloaded.'}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-[#E8DCC8] dark:border-[#334155]">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#6B7280] dark:text-[#94A3B8] hover:bg-[#F0F4F8] dark:hover:bg-[#334155] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#D4A017] hover:bg-[#B8890F] text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="export-confirm-btn"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Exporting...
                  </span>
                ) : (
                  `Export as ${format.toUpperCase()}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
