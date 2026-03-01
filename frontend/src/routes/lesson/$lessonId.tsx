import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useRef, useEffect, useCallback } from 'react'
import { lessonStore, SAMPLE_LESSONS, type LessonData, type LessonSection, type LessonVersion, type LessonShare } from '@/lib/lesson-store'
import { ScriptureLookup, InlineScriptureText } from '@/components/ScriptureLookup'
import { ScriptureDrawer } from '@/components/ScriptureDrawer'
import { Editor, AddSectionModal } from '@/components/Editor'
import { QuizGenerator } from '@/components/Quiz'
import { AISupplyList } from '@/components/AISupplyList'
import { CalendarSync } from '@/components/CalendarSync'
import { ExportLesson } from '@/components/ExportLesson'
import { PresenceIndicator } from '@/components/PresenceIndicator'
import { FeatureGate } from '@/components/FeatureGate'
import { useSession } from '@/lib/auth-client'
import { useI18n } from '@/i18n'
import { 
  BookOpen, Pencil, Plus, Search, Printer, FileText, FileDown, Share2, 
  ChevronDown, ChevronUp, Pin, Brain, Package, Users, Clock, Heart, 
  ClipboardList, CheckCircle, Square, MessageCircle, Check, MoreHorizontal, 
  Calendar, Copy, X, Download, Eye, EyeOff, ChevronRight, ChevronLeft,
  Play, Pause, RotateCcw, Layers, Quote, Lightbulb, Home, Settings, Menu,
  Hand, GraduationCap, Gamepad2, Palette, MessagesSquare, History, UserPlus,
  Lock, Crown, type LucideIcon
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import '@/components/editor-styles.css'

// ============================================================================
// ICON MAPPING - Convert emoji icons to Lucide icons
// ============================================================================

const SECTION_ICON_MAP: Record<string, LucideIcon> = {
  '👋': Hand,
  '📖': BookOpen,
  '🎓': GraduationCap,
  '🎮': Gamepad2,
  '🎨': Palette,
  '💬': MessagesSquare,
  '🙏': Heart,
}

function getSectionIcon(iconStr: string, className: string = "w-5 h-5") {
  const IconComponent = SECTION_ICON_MAP[iconStr]
  if (IconComponent) {
    return <IconComponent className={className} strokeWidth={2} />
  }
  // Fallback: return the original string (emoji) if no mapping found
  return <span className="text-base">{iconStr}</span>
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function exportLessonAsText(lesson: LessonData): string {
  const lines: string[] = []
  lines.push(lesson.title)
  lines.push('='.repeat(lesson.title.length))
  lines.push('')
  lines.push(`Scripture: ${lesson.passage}`)
  lines.push(`Age Group: ${lesson.ageGroup}`)
  lines.push(`Duration: ${lesson.duration}`)
  lines.push(`Theme: ${lesson.theme}`)
  lines.push(`Format: ${lesson.format}`)
  lines.push('')
  lines.push('MEMORY VERSE')
  lines.push('-'.repeat(12))
  lines.push(`${lesson.memoryVerse.text}`)
  lines.push(`  — ${lesson.memoryVerse.reference}`)
  lines.push('')
  lines.push('LEARNING OBJECTIVES')
  lines.push('-'.repeat(19))
  lesson.objectives.forEach((obj, i) => lines.push(`${i + 1}. ${obj}`))
  lines.push('')
  lines.push('MATERIALS NEEDED')
  lines.push('-'.repeat(16))
  lesson.materialsNeeded.forEach(m => lines.push(`- ${m.item} [${m.category}]`))
  lines.push('')
  lines.push('LESSON SECTIONS')
  lines.push('-'.repeat(15))
  lesson.sections.forEach((s, i) => {
    lines.push('')
    lines.push(`${i + 1}. ${s.title} (${s.duration})`)
    lines.push(s.content.replace(/\*\*/g, ''))
  })
  lines.push('')
  lines.push('CROSS REFERENCES')
  lines.push('-'.repeat(16))
  lesson.crossReferences.forEach(r => lines.push(`- ${r.reference}: ${r.text}`))
  lines.push('')
  lines.push('TEACHER NOTES')
  lines.push('-'.repeat(13))
  lesson.teacherNotes.forEach(n => lines.push(`- ${n}`))
  return lines.join('\n')
}

function exportParentTakeHome(lesson: LessonData): string {
  const lines: string[] = []
  lines.push('PARENT TAKE-HOME SHEET')
  lines.push('='.repeat(22))
  lines.push(`Lesson: ${lesson.title}`)
  lines.push(`Scripture: ${lesson.passage}`)
  lines.push('')
  lines.push("TODAY'S LESSON")
  lines.push(lesson.parentTakeHome.summary)
  lines.push('')
  lines.push('MEMORY VERSE')
  lines.push(lesson.parentTakeHome.memoryVerse)
  lines.push('')
  lines.push('DISCUSSION STARTERS')
  lesson.parentTakeHome.discussionStarters.forEach((q, i) => lines.push(`${i + 1}. ${q}`))
  lines.push('')
  lines.push('FAMILY ACTIVITY')
  lines.push(lesson.parentTakeHome.familyActivity)
  lines.push('')
  lines.push('WEEKLY CHALLENGE')
  lines.push(lesson.parentTakeHome.weeklyChallenge)
  return lines.join('\n')
}

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function generatePrintHTML(lesson: LessonData): string {
  const sectionsHTML = lesson.sections.map((s) => `
    <div style="page-break-inside: avoid; margin-bottom: 20px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      <div style="background: #f9fafb; padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
        <strong style="font-size: 15px;">${s.icon} ${s.title}</strong>
        <span style="float: right; color: #6b7280; font-size: 12px;">${s.duration}</span>
      </div>
      <div style="padding: 16px; font-size: 13px; line-height: 1.7; color: #374151;">
        ${s.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')}
      </div>
    </div>
  `).join('')
  const objectivesHTML = lesson.objectives.map((o) => `<li style="margin-bottom: 4px;">${o}</li>`).join('')
  const materialsHTML = lesson.materialsNeeded.map(m => `<li style="margin-bottom: 2px;">${m.item} <span style="color: #9ca3af; font-size: 11px;">[${m.category}]</span></li>`).join('')
  const crossRefsHTML = lesson.crossReferences.map(r => `<li style="margin-bottom: 4px;"><strong>${r.reference}</strong> — ${r.text}</li>`).join('')
  const teacherNotesHTML = lesson.teacherNotes.map(n => `<li style="margin-bottom: 4px;">${n}</li>`).join('')
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${lesson.title}</title><style>@media print{body{margin:0;padding:20px}@page{margin:0.75in}}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1f2937;max-width:800px;margin:0 auto;padding:20px;line-height:1.5}</style></head><body>
  <div style="text-align:center;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #4A90E2"><h1 style="font-size:26px;margin-bottom:4px">${lesson.title}</h1><p style="color:#4A90E2;font-size:14px;font-weight:600">Bible Lesson Planner</p></div>
  <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:20px;font-size:13px"><span style="background:#eff6ff;color:#1d4ed8;padding:4px 12px;border-radius:20px;font-weight:600">${lesson.passage}</span><span style="background:#ecfdf5;color:#047857;padding:4px 12px;border-radius:20px;font-weight:600">${lesson.ageGroup}</span><span style="background:#fffbeb;color:#b45309;padding:4px 12px;border-radius:20px;font-weight:600">${lesson.duration}</span><span style="background:#f5f3ff;color:#6d28d9;padding:4px 12px;border-radius:20px;font-weight:600">${lesson.theme}</span></div>
  <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;margin-bottom:20px"><p style="font-size:10px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px">Memory Verse</p><p style="font-size:18px;font-style:italic;margin:0">${lesson.memoryVerse.text}</p><p style="font-size:13px;color:#b45309;margin:6px 0 0;font-weight:600">— ${lesson.memoryVerse.reference}</p></div>
  <div style="margin-bottom:20px"><h2 style="font-size:16px;margin-bottom:8px">Learning Objectives</h2><ol style="font-size:13px;padding-left:20px;line-height:1.7">${objectivesHTML}</ol></div>
  <div style="margin-bottom:20px"><h2 style="font-size:16px;margin-bottom:8px">Materials Needed</h2><ul style="font-size:13px;padding-left:20px;line-height:1.7;columns:2">${materialsHTML}</ul></div>
  <h2 style="font-size:18px;margin-bottom:12px">Lesson Plan</h2>${sectionsHTML}
  <div style="margin-top:20px"><h2 style="font-size:16px;margin-bottom:8px">Cross References</h2><ul style="font-size:13px;padding-left:20px;line-height:1.7">${crossRefsHTML}</ul></div>
  <div style="margin-top:20px"><h2 style="font-size:16px;margin-bottom:8px">Teacher Notes</h2><ul style="font-size:13px;padding-left:20px;line-height:1.7">${teacherNotesHTML}</ul></div>
  <div style="text-align:center;margin-top:24px;padding-top:12px;border-top:1px solid #e5e7eb"><p style="font-size:11px;color:#9ca3af">Generated by Bible Lesson Planner</p></div>
  </body></html>`
}

function handlePrintPDF(lesson: LessonData) {
  const html = generatePrintHTML(lesson)
  const printWindow = window.open('', '_blank')
  if (printWindow) { printWindow.document.write(html); printWindow.document.close(); setTimeout(() => printWindow.print(), 500) }
}

function handleDownloadPDF(lesson: LessonData) {
  const html = generatePrintHTML(lesson)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${lesson.title.replace(/[^a-zA-Z0-9]/g, '-')}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ============================================================================
// ROUTE DEFINITION
// ============================================================================

export const Route = createFileRoute('/lesson/$lessonId')({
  component: LessonViewPage,
})

// ============================================================================
// SECTION COLOR DEFINITIONS
// ============================================================================

const sectionColors: Record<string, { bg: string; border: string; text: string; accent: string }> = {
  opening: { bg: 'bg-sky-50/50 dark:bg-sky-950/20', border: 'border-l-sky-500', text: 'text-sky-700 dark:text-sky-300', accent: 'bg-sky-500' },
  scripture: { bg: 'bg-blue-50/50 dark:bg-blue-950/20', border: 'border-l-blue-500', text: 'text-blue-700 dark:text-blue-300', accent: 'bg-blue-500' },
  teaching: { bg: 'bg-amber-50/50 dark:bg-amber-950/20', border: 'border-l-amber-500', text: 'text-amber-700 dark:text-amber-300', accent: 'bg-amber-500' },
  activity: { bg: 'bg-emerald-50/50 dark:bg-emerald-950/20', border: 'border-l-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', accent: 'bg-emerald-500' },
  craft: { bg: 'bg-purple-50/50 dark:bg-purple-950/20', border: 'border-l-purple-500', text: 'text-purple-700 dark:text-purple-300', accent: 'bg-purple-500' },
  discussion: { bg: 'bg-rose-50/50 dark:bg-rose-950/20', border: 'border-l-rose-500', text: 'text-rose-700 dark:text-rose-300', accent: 'bg-rose-500' },
  closing: { bg: 'bg-teal-50/50 dark:bg-teal-950/20', border: 'border-l-teal-500', text: 'text-teal-700 dark:text-teal-300', accent: 'bg-teal-500' },
  custom: { bg: 'bg-orange-50/50 dark:bg-orange-950/20', border: 'border-l-orange-500', text: 'text-orange-700 dark:text-orange-300', accent: 'bg-orange-500' },
}

// ============================================================================
// BIBLE REFERENCE HELPERS
// ============================================================================

const BIBLE_REF_PATTERN = /\b(\d?\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(\d+)(?::(\d+(?:\s*[-–]\s*\d+)?))?(?:\s*\([A-Z]+\))?/g

const BIBLE_BOOKS_SET = new Set([
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', 'Samuel', 'Kings', 'Chronicles', 'Ezra',
  'Nehemiah', 'Esther', 'Job', 'Psalms', 'Psalm', 'Proverbs', 'Ecclesiastes',
  'Song', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
  'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum',
  'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
  'Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians',
  'Thessalonians', 'Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
  'Peter', 'Jude', 'Revelation',
])

function isBibleReference(bookPart: string): boolean {
  const words = bookPart.trim().split(/\s+/)
  const bookName = words[words.length - 1]
  return BIBLE_BOOKS_SET.has(bookName)
}

function TextWithRefs({ text, onRefClick }: { text: string; onRefClick: (ref: string) => void }) {
  const parts: Array<{ type: 'text' | 'ref'; value: string }> = []
  let lastIndex = 0
  const regex = new RegExp(BIBLE_REF_PATTERN.source, 'g')
  let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    const bookPart = match[1]
    if (!isBibleReference(bookPart)) continue
    if (match.index > lastIndex) parts.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    parts.push({ type: 'ref', value: match[0].trim() })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) parts.push({ type: 'text', value: text.slice(lastIndex) })
  if (parts.length === 0) return <>{text}</>
  return (
    <>
      {parts.map((part, i) =>
        part.type === 'ref' ? (
          <button 
            key={i} 
            onClick={(e) => { e.stopPropagation(); onRefClick(part.value) }} 
            className="inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-blue-300/50 underline-offset-2 hover:decoration-blue-500 font-medium cursor-pointer"
            title={`Look up ${part.value}`}
          >
            <BookOpen className="w-3 h-3 opacity-60" />{part.value}
          </button>
        ) : (
          <span key={i}>{part.value}</span>
        )
      )}
    </>
  )
}

function renderContent(content: string, onRefClick: (ref: string) => void) {
  return content.split('\n\n').map((paragraph, j) => (
    <div key={j} className="mb-4 last:mb-0">
      {paragraph.split('\n').map((line, k) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={k} className="font-semibold text-stone-900 dark:text-stone-100 mt-4 mb-1.5 first:mt-0"><TextWithRefs text={line.replace(/\*\*/g, '')} onRefClick={onRefClick} /></p>
        }
        if (line.startsWith('**')) {
          const parts = line.split('**')
          return (
            <p key={k} className="text-stone-600 dark:text-stone-300 leading-relaxed">
              {parts.map((part, l) => (
                l % 2 === 1 ? <strong key={l} className="text-stone-800 dark:text-stone-100 font-semibold"><TextWithRefs text={part} onRefClick={onRefClick} /></strong> : <span key={l}><TextWithRefs text={part} onRefClick={onRefClick} /></span>
              ))}
            </p>
          )
        }
        if (line.startsWith('- ')) {
          return (
            <div key={k} className="flex items-start gap-3 ml-1 my-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
              <span className="text-stone-600 dark:text-stone-300 leading-relaxed"><TextWithRefs text={line.slice(2)} onRefClick={onRefClick} /></span>
            </div>
          )
        }
        if (line.match(/^\d+\./)) {
          const num = line.match(/^\d+/)?.[0]
          return (
            <div key={k} className="flex items-start gap-3 ml-1 my-2">
              <span className="w-6 h-6 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center text-xs font-semibold flex-shrink-0">{num}</span>
              <span className="text-stone-600 dark:text-stone-300 leading-relaxed"><TextWithRefs text={line.replace(/^\d+\.\s*/, '')} onRefClick={onRefClick} /></span>
            </div>
          )
        }
        if (line.trim().startsWith('*(')) {
          return <p key={k} className="text-stone-400 dark:text-stone-500 text-sm italic ml-9 mt-0.5"><TextWithRefs text={line.trim()} onRefClick={onRefClick} /></p>
        }
        return line.trim() ? <p key={k} className="text-stone-600 dark:text-stone-300 leading-relaxed"><TextWithRefs text={line} onRefClick={onRefClick} /></p> : null
      })}
    </div>
  ))
}

// ============================================================================
// MEMORY VERSE EDITOR COMPONENT
// ============================================================================

function MemoryVerseEditor({ text, reference, onSave, onCancel }: { text: string; reference: string; onSave: (text: string, ref: string) => void; onCancel: () => void }) {
  const [editText, setEditText] = useState(text)
  const [editRef, setEditRef] = useState(reference)
  return (
    <div className="space-y-3">
      <textarea
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        className="w-full p-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 resize-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
        rows={3}
        autoFocus
      />
      <input
        type="text"
        value={editRef}
        onChange={(e) => setEditRef(e.target.value)}
        placeholder="Reference (e.g., John 3:16)"
        className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
      />
      <div className="flex gap-2">
        <button onClick={() => onSave(editText, editRef)} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700">Save</button>
        <button onClick={onCancel} className="px-4 py-2 bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg text-sm font-medium hover:bg-stone-200 dark:hover:bg-stone-600">Cancel</button>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function LessonViewPage() {
  const { lessonId } = Route.useParams()
  const { data: session } = useSession()
  const { t } = useI18n()
  const isLoggedIn = !!session?.user
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]))
  const storedLesson = lessonStore.getById(lessonId)
  const lessonData: LessonData = storedLesson || SAMPLE_LESSONS[0]
  const [lesson, setLesson] = useState<LessonData>(lessonData)
  const [showParentSheet, setShowParentSheet] = useState(false)
  const [showScriptureLookup, setShowScriptureLookup] = useState(false)
  const [checkedMaterials, setCheckedMaterials] = useState<Set<number>>(new Set())
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set())
  const [activeSection, setActiveSection] = useState(0)
  const [showTeacherNotes, setShowTeacherNotes] = useState(false)
  const [copied, setCopied] = useState(false)
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Edit mode state
  const [editMode, setEditMode] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingSectionTitle, setEditingSectionTitle] = useState<number | null>(null)
  const [showAddSectionModal, setShowAddSectionModal] = useState(false)
  const [editingMemoryVerse, setEditingMemoryVerse] = useState(false)
  const [editingObjective, setEditingObjective] = useState<number | null>(null)

  // Scripture Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerRef, setDrawerRef] = useState('')
  const [insertTargetSection, setInsertTargetSection] = useState<number | null>(null)
  const [insertToast, setInsertToast] = useState<string | null>(null)

  // Quiz and AI Supply List state
  const [showQuiz, setShowQuiz] = useState(false)
  const [showAISupplyList, setShowAISupplyList] = useState(false)

  // Active tool panel
  const [activePanel, setActivePanel] = useState<'none' | 'quiz' | 'supplies'>('none')
  
  // Version History & Collaboration
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareEmails, setShareEmails] = useState('')
  const [sharePermission, setSharePermission] = useState<'view' | 'edit'>('view')
  const [versionHistory, setVersionHistory] = useState<LessonVersion[]>([])
  const [shareInfo, setShareInfo] = useState<LessonShare | undefined>(undefined)
  
  // Load version history and share info
  useEffect(() => {
    setVersionHistory(lessonStore.getVersionHistory(lesson.id))
    setShareInfo(lessonStore.getShareInfo(lesson.id))
  }, [lesson.id])

  const totalMinutes = lesson.sections.reduce((sum, s) => sum + parseInt(s.duration), 0)
  const completionPct = Math.round((completedSections.size / lesson.sections.length) * 100)

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSectionContentChange = useCallback((sectionIndex: number, newContent: string) => {
    setLesson(prev => {
      const updated = { ...prev }
      const sections = [...updated.sections]
      sections[sectionIndex] = { ...sections[sectionIndex], content: newContent }
      updated.sections = sections
      lessonStore.update(updated.id, { sections })
      return updated
    })
  }, [])

  const handleSectionTitleChange = useCallback((sectionIndex: number, newTitle: string) => {
    setLesson(prev => {
      const updated = { ...prev }
      const sections = [...updated.sections]
      sections[sectionIndex] = { ...sections[sectionIndex], title: newTitle }
      updated.sections = sections
      lessonStore.update(updated.id, { sections })
      return updated
    })
    setEditingSectionTitle(null)
  }, [])

  const handleSectionDurationChange = useCallback((sectionIndex: number, newDuration: string) => {
    setLesson(prev => {
      const updated = { ...prev }
      const sections = [...updated.sections]
      sections[sectionIndex] = { ...sections[sectionIndex], duration: newDuration }
      updated.sections = sections
      lessonStore.update(updated.id, { sections })
      return updated
    })
  }, [])

  const handleDeleteSection = useCallback((sectionIndex: number) => {
    setLesson(prev => {
      const updated = { ...prev }
      const sections = updated.sections.filter((_, i) => i !== sectionIndex)
      updated.sections = sections
      const totalMin = sections.reduce((sum, s) => sum + parseInt(s.duration), 0)
      updated.duration = `${totalMin} minutes`
      lessonStore.update(updated.id, { sections, duration: updated.duration })
      return updated
    })
    setExpandedSections(prev => {
      const next = new Set<number>()
      prev.forEach(i => { if (i < sectionIndex) next.add(i); else if (i > sectionIndex) next.add(i - 1) })
      return next
    })
    setCompletedSections(prev => {
      const next = new Set<number>()
      prev.forEach(i => { if (i < sectionIndex) next.add(i); else if (i > sectionIndex) next.add(i - 1) })
      return next
    })
  }, [])

  const handleMoveSection = useCallback((sectionIndex: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1
    setLesson(prev => {
      const updated = { ...prev }
      const sections = [...updated.sections]
      if (newIndex < 0 || newIndex >= sections.length) return prev
      const temp = sections[sectionIndex]
      sections[sectionIndex] = sections[newIndex]
      sections[newIndex] = temp
      updated.sections = sections
      lessonStore.update(updated.id, { sections })
      return updated
    })
    setExpandedSections(prev => {
      const next = new Set<number>()
      prev.forEach(i => {
        if (i === sectionIndex) next.add(newIndex)
        else if (i === newIndex) next.add(sectionIndex)
        else next.add(i)
      })
      return next
    })
  }, [])

  const handleAddSection = useCallback((section: { title: string; icon: string; type: string; duration: string; content: string }) => {
    setLesson(prev => {
      const updated = { ...prev }
      const newSection: LessonSection = {
        title: section.title,
        icon: section.icon,
        type: section.type,
        duration: section.duration,
        content: section.content,
      }
      const sections = [...updated.sections]
      const closingIdx = sections.findIndex(s => s.type === 'closing')
      if (closingIdx >= 0) {
        sections.splice(closingIdx, 0, newSection)
      } else {
        sections.push(newSection)
      }
      updated.sections = sections
      const totalMin = sections.reduce((sum, s) => sum + parseInt(s.duration), 0)
      updated.duration = `${totalMin} minutes`
      lessonStore.update(updated.id, { sections, duration: updated.duration })
      const newIdx = closingIdx >= 0 ? closingIdx : sections.length - 1
      setExpandedSections(prev => new Set(prev).add(newIdx))
      return updated
    })
  }, [])

  const handleTitleChange = useCallback((newTitle: string) => {
    if (!newTitle.trim()) return
    setLesson(prev => {
      const updated = { ...prev, title: newTitle.trim() }
      lessonStore.update(updated.id, { title: updated.title })
      return updated
    })
    setEditingTitle(false)
  }, [])

  const handleMemoryVerseChange = useCallback((text: string, reference: string) => {
    setLesson(prev => {
      const updated = { ...prev, memoryVerse: { text, reference } }
      lessonStore.update(updated.id, { memoryVerse: updated.memoryVerse })
      return updated
    })
    setEditingMemoryVerse(false)
  }, [])

  const handleObjectiveChange = useCallback((index: number, newText: string) => {
    setLesson(prev => {
      const updated = { ...prev }
      const objectives = [...updated.objectives]
      objectives[index] = newText
      updated.objectives = objectives
      lessonStore.update(updated.id, { objectives })
      return updated
    })
    setEditingObjective(null)
  }, [])

  const handleAddObjective = useCallback(() => {
    setLesson(prev => {
      const updated = { ...prev }
      const objectives = [...updated.objectives, 'New learning objective']
      updated.objectives = objectives
      lessonStore.update(updated.id, { objectives })
      setEditingObjective(objectives.length - 1)
      return updated
    })
  }, [])

  const handleDeleteObjective = useCallback((index: number) => {
    setLesson(prev => {
      const updated = { ...prev }
      const objectives = updated.objectives.filter((_, i) => i !== index)
      updated.objectives = objectives
      lessonStore.update(updated.id, { objectives })
      return updated
    })
  }, [])

  const handleTeacherNoteChange = useCallback((index: number, newText: string) => {
    setLesson(prev => {
      const updated = { ...prev }
      const teacherNotes = [...updated.teacherNotes]
      teacherNotes[index] = newText
      updated.teacherNotes = teacherNotes
      lessonStore.update(updated.id, { teacherNotes })
      return updated
    })
  }, [])

  const handleAddTeacherNote = useCallback(() => {
    setLesson(prev => {
      const updated = { ...prev }
      const teacherNotes = [...updated.teacherNotes, 'New teacher note']
      updated.teacherNotes = teacherNotes
      lessonStore.update(updated.id, { teacherNotes })
      return updated
    })
  }, [])

  const handleDeleteTeacherNote = useCallback((index: number) => {
    setLesson(prev => {
      const updated = { ...prev }
      const teacherNotes = updated.teacherNotes.filter((_, i) => i !== index)
      updated.teacherNotes = teacherNotes
      lessonStore.update(updated.id, { teacherNotes })
      return updated
    })
  }, [])

  const openDrawer = useCallback((ref: string, sectionIndex?: number) => {
    const cleaned = ref.replace(/\s*\([A-Z]+\)\s*$/, '').trim()
    setDrawerRef(cleaned)
    setInsertTargetSection(sectionIndex ?? null)
    setDrawerOpen(true)
  }, [])

  const closeDrawer = useCallback(() => { setDrawerOpen(false); setDrawerRef('') }, [])

  const handleInsertIntoLesson = useCallback((text: string, reference: string) => {
    const targetIdx = insertTargetSection !== null ? insertTargetSection : (expandedSections.size > 0 ? [...expandedSections][expandedSections.size - 1] : 0)
    setLesson(prev => {
      const updated = { ...prev }
      const sections = [...updated.sections]
      sections[targetIdx] = { ...sections[targetIdx], content: sections[targetIdx].content + text }
      updated.sections = sections
      lessonStore.update(updated.id, { sections })
      return updated
    })
    const sectionName = lesson.sections[targetIdx]?.title || 'section'
    setInsertToast(`${reference} ${t('lessonView.insertedInto')} "${sectionName}"`)
    setTimeout(() => setInsertToast(null), 3000)
    setExpandedSections(prev => new Set(prev).add(targetIdx))
  }, [insertTargetSection, expandedSections, lesson])

  const toggleSection = useCallback((index: number) => {
    setExpandedSections(prev => { const next = new Set(prev); if (next.has(index)) next.delete(index); else next.add(index); return next })
    setActiveSection(index)
  }, [])

  const expandAll = () => {
    if (expandedSections.size === lesson.sections.length) setExpandedSections(new Set())
    else setExpandedSections(new Set(lesson.sections.map((_, i) => i)))
  }

  const toggleMaterial = (index: number) => {
    setCheckedMaterials(prev => { const next = new Set(prev); if (next.has(index)) next.delete(index); else next.add(index); return next })
  }

  const toggleComplete = (index: number) => {
    setCompletedSections(prev => { const next = new Set(prev); if (next.has(index)) next.delete(index); else next.add(index); return next })
  }

  const scrollToSection = (index: number) => {
    setExpandedSections(prev => new Set(prev).add(index))
    setActiveSection(index)
    sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const handleShare = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {}
  }

  const togglePanel = (panel: 'quiz' | 'supplies') => {
    if (activePanel === panel) {
      setActivePanel('none')
      if (panel === 'quiz') setShowQuiz(false)
      if (panel === 'supplies') setShowAISupplyList(false)
    } else {
      setActivePanel(panel)
      setShowQuiz(panel === 'quiz')
      setShowAISupplyList(panel === 'supplies')
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 200
      for (let i = sectionRefs.current.length - 1; i >= 0; i--) {
        const el = sectionRefs.current[i]
        if (el && el.offsetTop <= scrollY) { setActiveSection(i); break }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917]">
      {/* Insert Toast */}
      {insertToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-emerald-600 text-white shadow-xl text-sm font-medium">
            <Check className="w-4 h-4" />
            {insertToast}
          </div>
        </div>
      )}

      {/* Scripture Drawer */}
      <ScriptureDrawer
        isOpen={drawerOpen}
        onClose={closeDrawer}
        initialReference={drawerRef}
        onInsert={handleInsertIntoLesson}
      />

      {/* Add Section Modal */}
      {showAddSectionModal && (
        <AddSectionModal
          isOpen={showAddSectionModal}
          onAdd={handleAddSection}
          onClose={() => setShowAddSectionModal(false)}
        />
      )}

      {/* Parent Take-Home Modal */}
      {showParentSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowParentSheet(false)}>
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100" style={{ fontFamily: 'Crimson Text, serif' }}>{t('lessonView.parentTakeHome')}</h2>
              <button onClick={() => setShowParentSheet(false)} className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <pre className="text-sm text-stone-600 dark:text-stone-300 whitespace-pre-wrap font-sans leading-relaxed">{exportParentTakeHome(lesson)}</pre>
            </div>
            <div className="p-6 border-t border-stone-200 dark:border-stone-700 flex gap-3">
              <button onClick={() => { downloadText(exportParentTakeHome(lesson), `${lesson.title}-parent-sheet.txt`); setShowParentSheet(false) }} className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors">{t('lessonView.downloadHtml').replace('HTML', '')}</button>
              <button onClick={() => setShowParentSheet(false)} className="px-4 py-2.5 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-lg font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout - Three Column with Sticky Sidebars */}
      <div className="flex h-screen overflow-hidden">
        {/* Left Sidebar - Lesson Navigation (Sticky) */}
        <aside className={`hidden lg:flex flex-col bg-white dark:bg-[#292524] border-r border-stone-200 dark:border-stone-800 h-screen sticky top-0 transition-all duration-300 ${sidebarCollapsed ? 'w-14' : 'w-56'}`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex-shrink-0">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <Link to="/lessons" className="flex items-center gap-2 text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  <Home className="w-4 h-4" />
                  <span className="text-sm font-medium">{t('lessonView.lessons')}</span>
                </Link>
              )}
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 dark:text-stone-500">
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Lesson Flow Navigation */}
          {!sidebarCollapsed && (
            <div className="flex-1 overflow-y-auto p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">{t('lessonView.lessonFlow')}</h3>
                <span className="text-xs font-medium text-stone-500 dark:text-stone-400">{totalMinutes}m</span>
              </div>

              {/* Progress Bar */}
              {completedSections.size > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{completedSections.size}/{lesson.sections.length}</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{completionPct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${completionPct}%` }} />
                  </div>
                </div>
              )}

              {/* Section List */}
              <div className="space-y-1">
                {lesson.sections.map((section, i) => {
                  const isActive = activeSection === i
                  const isComplete = completedSections.has(i)
                  const colors = sectionColors[section.type] || sectionColors.teaching
                  return (
                    <button
                      key={i}
                      onClick={() => scrollToSection(i)}
                      className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left transition-all duration-200 ${
                        isActive 
                          ? `${colors.bg} border-l-2 ${colors.border}` 
                          : 'hover:bg-stone-50 dark:hover:bg-stone-800/50 border-l-2 border-transparent'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center text-sm flex-shrink-0 ${
                        isComplete 
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                          : isActive 
                            ? `${colors.text} bg-white dark:bg-stone-800` 
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                      }`}>
                        {isComplete ? <Check className="w-3.5 h-3.5" /> : getSectionIcon(section.icon, "w-3.5 h-3.5")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium truncate ${
                          isActive ? colors.text : isComplete ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-700 dark:text-stone-300'
                        }`}>
                          {section.title}
                        </div>
                        <div className="text-xs text-stone-400 dark:text-stone-500">{section.duration}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Sidebar Footer - Quick Actions */}
          {!sidebarCollapsed && (
            <div className="p-3 border-t border-stone-100 dark:border-stone-800 space-y-1.5 flex-shrink-0">
              <button onClick={() => setShowTeacherNotes(!showTeacherNotes)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showTeacherNotes ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'}`}>
                <Pin className="w-4 h-4" /> {t('lessonView.notes')}
              </button>
              <button onClick={expandAll} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
                {expandedSections.size === lesson.sections.length ? <><EyeOff className="w-4 h-4" /> {t('lessonView.collapse')}</> : <><Eye className="w-4 h-4" /> {t('lessonView.expand')}</>}
              </button>
            </div>
          )}
        </aside>

        {/* Main Content Area (Scrollable) */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {/* Top Bar */}
          <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#292524]/90 backdrop-blur-lg border-b border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between px-4 lg:px-6 py-2">
              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button className="lg:hidden p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300">
                    <Menu className="w-5 h-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 bg-white dark:bg-[#292524] p-0">
                  <SheetHeader className="p-4 border-b border-stone-200 dark:border-stone-700">
                    <SheetTitle className="text-left text-stone-900 dark:text-stone-100 text-base font-semibold">{t('lessonView.lessonFlow')}</SheetTitle>
                  </SheetHeader>
                  <div className="p-4 space-y-1">
                    {lesson.sections.map((section, i) => {
                      const isComplete = completedSections.has(i)
                      return (
                        <button
                          key={i}
                          onClick={() => { scrollToSection(i); setMobileMenuOpen(false) }}
                          className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-stone-50 dark:hover:bg-stone-800"
                        >
                          <div className={`w-8 h-8 rounded-md flex items-center justify-center text-sm ${isComplete ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-stone-100 dark:bg-stone-800 text-stone-500'}`}>
                            {isComplete ? <Check className="w-4 h-4" /> : getSectionIcon(section.icon, "w-4 h-4")}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-stone-700 dark:text-stone-300">{section.title}</div>
                            <div className="text-xs text-stone-400">{section.duration}</div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Breadcrumb */}
              <div className="hidden md:flex items-center gap-2 text-xs">
                <Link to="/lessons" className="text-stone-400 dark:text-stone-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">{t('lessonView.lessons')}</Link>
                <ChevronRight className="w-3 h-3 text-stone-300 dark:text-stone-600" />
                <span className="text-stone-700 dark:text-stone-300 font-medium truncate max-w-[200px]">{lesson.title}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Presence Indicator */}
                <div className="hidden md:block">
                  <PresenceIndicator lessonId={lesson.id} />
                </div>
                
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    editMode 
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/20' 
                      : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-amber-400'
                  }`}
                >
                  {editMode ? <><Check className="w-3.5 h-3.5" /> {t('lessonView.done')}</> : <><Pencil className="w-3.5 h-3.5" /> {t('lessonView.edit')}</>}
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-amber-400 transition-colors" data-testid="more-actions-btn">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-xl p-1">
                    {isLoggedIn ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/print/$lessonId" params={{ lessonId: lesson.id }} className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs">
                            <Printer className="w-3.5 h-3.5 text-amber-500" /> {t('lessonView.printLesson')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadPDF(lesson)} className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs">
                          <Download className="w-3.5 h-3.5 text-blue-500" /> {t('lessonView.downloadHtml')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => downloadText(exportLessonAsText(lesson), `${lesson.title.replace(/[^a-zA-Z0-9]/g, '-')}.txt`)} className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs">
                          <FileText className="w-3.5 h-3.5 text-emerald-500" /> {t('lessonView.exportText')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1 bg-stone-100 dark:bg-stone-700" />
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/signup" className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 text-xs">
                            <Lock className="w-3.5 h-3.5 text-stone-400" /> {t('lessonView.printLesson')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/signup" className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 text-xs">
                            <Lock className="w-3.5 h-3.5 text-stone-400" /> {t('lessonView.downloadHtml')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/signup" className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 text-xs">
                            <Lock className="w-3.5 h-3.5 text-stone-400" /> {t('lessonView.exportText')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1 bg-stone-100 dark:bg-stone-700" />
                        <div className="px-2 py-2 text-[10px] text-stone-500 dark:text-stone-400 text-center">
                          {t('lessonView.signUpUnlock')}
                        </div>
                        <DropdownMenuSeparator className="my-1 bg-stone-100 dark:bg-stone-700" />
                      </>
                    )}
                    <DropdownMenuItem onClick={() => setShowParentSheet(true)} className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs">
                      <Users className="w-3.5 h-3.5 text-purple-500" /> {t('lessonView.parentSheet')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShare} className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs">
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5 text-stone-400" />}
                      {copied ? t('lessonView.copied') : t('lessonView.copyLink')}
                    </DropdownMenuItem>
                    {isLoggedIn && (
                      <>
                        <DropdownMenuItem onClick={() => setShowShareDialog(true)} className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs">
                          <UserPlus className="w-3.5 h-3.5 text-blue-500" /> {t('lessonView.shareWithTeam')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1 bg-stone-100 dark:bg-stone-700" />
                        <DropdownMenuItem onClick={() => { setVersionHistory(lessonStore.getVersionHistory(lesson.id)); setShowVersionHistory(true) }} className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs">
                          <History className="w-3.5 h-3.5 text-orange-500" /> {t('lessonView.versionHistory')}
                          {versionHistory.length > 0 && (
                            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-500">{versionHistory.length}</span>
                          )}
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="px-4 lg:px-6 py-4 lg:py-6">
            {/* Edit Mode Banner */}
            {editMode && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                  <Pencil className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-amber-800 dark:text-amber-300 text-xs">{t('lessonView.editMode')}</h3>
                  <p className="text-[10px] text-amber-700/70 dark:text-amber-400/60">{t('lessonView.editModeDesc')}</p>
                </div>
                <button onClick={() => setShowAddSectionModal(true)} className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700 transition-colors flex items-center gap-1.5 flex-shrink-0">
                  <Plus className="w-3.5 h-3.5" /> {t('lessonView.addSection')}
                </button>
              </div>
            )}

            {/* Lesson Header - Clean Sunday Morning Style */}
            <div className="mb-6">
              {/* Header Card */}
              <div className="rounded-2xl bg-white dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 p-6 mb-4">
                {/* Scripture Reference Button */}
                <button 
                  onClick={() => openDrawer(lesson.passage)} 
                  className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E3A5F] text-white text-sm font-semibold hover:bg-[#162D4A] transition-colors mb-4"
                  data-testid="scripture-reference-btn"
                >
                  <BookOpen className="w-4 h-4" strokeWidth={2} />
                  <span>{lesson.passage}</span>
                  <ChevronRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Title */}
                {editMode && editingTitle ? (
                  <input
                    type="text"
                    defaultValue={lesson.title}
                    autoFocus
                    onBlur={(e) => handleTitleChange(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleTitleChange((e.target as HTMLInputElement).value); if (e.key === 'Escape') setEditingTitle(false) }}
                    className="w-full text-2xl lg:text-3xl font-bold text-stone-900 dark:text-stone-100 bg-transparent border-b-2 border-amber-500 outline-none pb-2"
                    style={{ fontFamily: 'Crimson Text, serif' }}
                  />
                ) : (
                  <h1
                    className={`text-2xl lg:text-3xl font-bold text-stone-900 dark:text-stone-100 leading-tight mb-4 ${editMode ? 'cursor-pointer hover:text-amber-700 dark:hover:text-amber-400 transition-colors' : ''}`}
                    style={{ fontFamily: 'Crimson Text, serif' }}
                    onClick={() => editMode && setEditingTitle(true)}
                    data-testid="lesson-title"
                  >
                    {lesson.title}
                  </h1>
                )}

                {/* Meta Tags Row */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                    <Users className="w-3.5 h-3.5" strokeWidth={2} /> {lesson.ageGroup}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5" strokeWidth={2} /> {lesson.duration}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-semibold">
                    <Heart className="w-3.5 h-3.5" strokeWidth={2} /> {lesson.theme}
                  </span>
                  <span className="text-stone-400 dark:text-stone-500 text-xs">
                    {lesson.createdAt} · {lesson.format}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-3">
                {isLoggedIn ? (
                  <>
                    <Link 
                      to="/print/$lessonId" 
                      params={{ lessonId: lesson.id }} 
                      className="flex items-center justify-center gap-2 w-32 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm" 
                      data-testid="print-preview-btn"
                    >
                      <Printer className="w-4 h-4" strokeWidth={2} /> {t('lessonView.print')}
                    </Link>
                    <ExportLesson lessonId={lesson.id} lessonTitle={lesson.title} />
                    <CalendarSync lessonId={lesson.id} lessonTitle={lesson.title} lessonPassage={lesson.passage} durationMinutes={parseInt(lesson.duration) || 45} />
                  </>
                ) : (
                  <>
                    <Link 
                      to="/signup" 
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 rounded-lg text-sm font-medium border border-stone-200 dark:border-stone-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 dark:hover:bg-amber-900/20 dark:hover:border-amber-700 dark:hover:text-amber-400 transition-colors" 
                      data-testid="print-login-btn"
                    >
                      <Lock className="w-3.5 h-3.5" /> {t('lessonView.print')}
                    </Link>
                    <Link 
                      to="/signup" 
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 rounded-lg text-sm font-medium border border-stone-200 dark:border-stone-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 dark:hover:bg-amber-900/20 dark:hover:border-amber-700 dark:hover:text-amber-400 transition-colors" 
                      data-testid="export-login-btn"
                    >
                      <Lock className="w-3.5 h-3.5" /> {t('lessonView.export')}
                    </Link>
                    <Link 
                      to="/signup" 
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 rounded-lg text-sm font-medium border border-stone-200 dark:border-stone-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 dark:hover:bg-amber-900/20 dark:hover:border-amber-700 dark:hover:text-amber-400 transition-colors" 
                      data-testid="calendar-login-btn"
                    >
                      <Lock className="w-3.5 h-3.5" /> {t('lessonView.addToCalendar')}
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Memory Verse Card - Clean Design */}
            <div className="mb-6" data-testid="memory-verse-card">
              <div className="rounded-2xl bg-gradient-to-br from-amber-50 via-white to-orange-50/30 dark:from-amber-950/30 dark:via-stone-800 dark:to-stone-800 border border-amber-200/60 dark:border-amber-800/40 p-6 relative overflow-hidden">
                {/* Decorative Quote Mark */}
                <div className="absolute top-2 right-4 opacity-[0.06]">
                  <Quote className="w-20 h-20 text-amber-700" strokeWidth={1} />
                </div>
                
                <div className="relative">
                  {/* Label */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
                    <MessageCircle className="w-3.5 h-3.5" strokeWidth={2.5} /> {t('lessonView.memoryVerse')}
                  </div>
                  
                  {editMode && editingMemoryVerse ? (
                    <MemoryVerseEditor
                      text={lesson.memoryVerse.text}
                      reference={lesson.memoryVerse.reference}
                      onSave={handleMemoryVerseChange}
                      onCancel={() => setEditingMemoryVerse(false)}
                    />
                  ) : (
                    <>
                      {/* Verse Text */}
                      <p
                        className={`text-xl lg:text-2xl font-medium text-stone-800 dark:text-stone-100 italic leading-relaxed mb-3 ${editMode ? 'cursor-pointer hover:text-amber-700 dark:hover:text-amber-400 transition-colors' : ''}`}
                        style={{ fontFamily: 'Crimson Text, serif' }}
                        onClick={() => editMode && setEditingMemoryVerse(true)}
                      >
                        "{lesson.memoryVerse.text}"
                      </p>
                      
                      {/* Reference Button */}
                      <button 
                        onClick={() => openDrawer(lesson.memoryVerse.reference)} 
                        className="inline-flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold hover:text-amber-800 dark:hover:text-amber-300 transition-colors group text-sm"
                      >
                        <Search className="w-4 h-4 group-hover:scale-110 transition-transform" strokeWidth={2} />
                        <span className="border-b border-amber-400/50 group-hover:border-amber-600 transition-colors">— {lesson.memoryVerse.reference}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Scripture Text Toggle */}
            <InlineScriptureText reference={lesson.passage} className="mb-4" />

            {/* Teacher Notes Panel - Compact */}
            {showTeacherNotes && (
              <div className="mb-4 p-5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
                <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-4 flex items-center gap-2 text-sm">
                  <Lightbulb className="w-4 h-4" /> {t('lessonView.teacherNotes')}
                </h3>
                <ul className="space-y-3">
                  {lesson.teacherNotes.map((note, i) => (
                    <li key={i} className="flex items-start gap-3 group">
                      <span className="w-6 h-6 rounded-full bg-amber-200/50 dark:bg-amber-800/30 text-amber-700 dark:text-amber-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">{i + 1}</span>
                      {editMode ? (
                        <div className="flex-1 flex items-start gap-2">
                          <input
                            type="text"
                            defaultValue={note}
                            onBlur={(e) => handleTeacherNoteChange(i, e.target.value)}
                            className="flex-1 text-sm text-amber-900 dark:text-amber-200 bg-transparent border-b border-amber-300/50 outline-none focus:border-amber-500"
                          />
                          <button onClick={() => handleDeleteTeacherNote(i)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">{note}</span>
                      )}
                    </li>
                  ))}
                </ul>
                {editMode && (
                  <button onClick={handleAddTeacherNote} className="mt-4 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> Add Note
                  </button>
                )}
              </div>
            )}

            {/* Lesson Sections - Premium Design */}
            <div className="space-y-4">
              {lesson.sections.map((section, i) => {
                const isExpanded = expandedSections.has(i)
                const isCompleted = completedSections.has(i)
                const colors = sectionColors[section.type] || sectionColors.teaching
                const minutesBefore = lesson.sections.slice(0, i).reduce((s, sec) => s + parseInt(sec.duration), 0)

                return (
                  <div
                    key={`${i}-${section.title}`}
                    ref={el => { sectionRefs.current[i] = el }}
                    data-testid={`section-${i}`}
                    className={`rounded-2xl bg-white dark:bg-[#292524] border-2 transition-all duration-300 overflow-hidden hover:shadow-md ${
                      isExpanded 
                        ? `border-l-4 ${colors.border} border-stone-200 dark:border-stone-700 shadow-lg` 
                        : isCompleted 
                          ? 'border-emerald-300 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-stone-900 border-l-4 border-l-emerald-500' 
                          : 'border-stone-200 dark:border-stone-800 hover:border-amber-300/50 dark:hover:border-amber-800/50'
                    }`}
                  >
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(i)}
                      className={`w-full px-5 py-4 flex items-center justify-between text-left transition-all ${isExpanded ? `${colors.bg} bg-opacity-50` : 'hover:bg-stone-50/50 dark:hover:bg-stone-800/30'}`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Section Number Badge */}
                        <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold transition-all ${
                          isCompleted && !isExpanded 
                            ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-md shadow-emerald-500/25' 
                            : isExpanded 
                              ? `${colors.text} bg-white dark:bg-stone-800 shadow-lg border-2 border-current` 
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                        }`}>
                          {isCompleted && !isExpanded ? <CheckCircle className="w-6 h-6" strokeWidth={2.5} /> : getSectionIcon(section.icon, "w-6 h-6")}
                          {/* Progress indicator dot */}
                          {!isCompleted && !isExpanded && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-white dark:border-stone-800" />
                          )}
                        </div>
                        <div>
                          {editMode && editingSectionTitle === i ? (
                            <input
                              type="text"
                              defaultValue={section.title}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                              onBlur={(e) => handleSectionTitleChange(i, e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleSectionTitleChange(i, (e.target as HTMLInputElement).value); if (e.key === 'Escape') setEditingSectionTitle(null) }}
                              className={`font-bold text-base bg-transparent border-b-2 border-amber-500 outline-none ${colors.text}`}
                              style={{ fontFamily: 'Crimson Text, serif' }}
                            />
                          ) : (
                            <h3
                              className={`font-bold text-base ${isExpanded ? colors.text : isCompleted ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-800 dark:text-stone-100'}`}
                              style={{ fontFamily: 'Crimson Text, serif' }}
                              onDoubleClick={(e) => { if (editMode) { e.stopPropagation(); setEditingSectionTitle(i) } }}
                            >
                              {section.title}
                              {section.type === 'custom' && <span className="ml-2 text-[10px] font-semibold text-orange-600 bg-orange-100 dark:bg-orange-900/40 px-2 py-0.5 rounded-full">Custom</span>}
                            </h3>
                          )}
                          <div className="flex items-center gap-2 mt-1 text-xs text-stone-500 dark:text-stone-400 font-medium">
                            {editMode ? (
                              <select
                                value={section.duration}
                                onChange={(e) => { e.stopPropagation(); handleSectionDurationChange(i, e.target.value) }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-transparent border-b border-dashed border-stone-300 dark:border-stone-600 outline-none cursor-pointer hover:border-amber-400 text-stone-500 dark:text-stone-400 text-xs"
                              >
                                {['2 minutes', '3 minutes', '5 minutes', '7 minutes', '8 minutes', '10 minutes', '12 minutes', '15 minutes', '20 minutes'].map(d => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800">
                                <Clock className="w-3 h-3" /> {section.duration}
                              </span>
                            )}
                            <span className="text-stone-300 dark:text-stone-600">•</span>
                            <span className="text-stone-400 dark:text-stone-500">{minutesBefore > 0 ? `Starts at ${minutesBefore}m` : 'Lesson Start'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {editMode && (
                          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 rounded-lg p-1" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => handleMoveSection(i, 'up')} disabled={i === 0} className="p-1.5 rounded-md text-stone-400 hover:text-amber-600 hover:bg-white dark:hover:bg-stone-700 disabled:opacity-30 transition-all">
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleMoveSection(i, 'down')} disabled={i === lesson.sections.length - 1} className="p-1.5 rounded-md text-stone-400 hover:text-amber-600 hover:bg-white dark:hover:bg-stone-700 disabled:opacity-30 transition-all">
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button onClick={() => { if (confirm(`Delete "${section.title}"?`)) handleDeleteSection(i) }} className="p-1.5 rounded-md text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        {/* Section Progress Badge */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-xs font-semibold text-stone-500 dark:text-stone-400">
                          <span>{i + 1}</span>
                          <span className="text-stone-300 dark:text-stone-600">/</span>
                          <span>{lesson.sections.length}</span>
                        </div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-amber-100 dark:bg-amber-900/30 rotate-180' : 'bg-stone-100 dark:bg-stone-800'}`}>
                          <ChevronDown className={`w-5 h-5 ${isExpanded ? 'text-amber-600 dark:text-amber-400' : 'text-stone-400'}`} strokeWidth={2} />
                        </div>
                      </div>
                    </button>

                    {/* Section Content - Enhanced */}
                    <div className={`transition-all duration-500 ${isExpanded ? 'max-h-[8000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                      <div className="px-6 pb-6 pt-4 border-t-2 border-stone-100 dark:border-stone-800">
                        {editMode ? (
                          <Editor
                            content={section.content}
                            onChange={(newContent) => handleSectionContentChange(i, newContent)}
                            placeholder={`Start writing content for "${section.title}"...`}
                            minHeight="120px"
                            autoSave
                            autoSaveDelay={800}
                          />
                        ) : (
                          <div className="prose prose-stone dark:prose-invert prose-base max-w-none leading-relaxed">
                            {renderContent(section.content, (ref) => openDrawer(ref, i))}
                          </div>
                        )}

                        {/* Section Footer - Enhanced */}
                        <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleComplete(i) }}
                              data-testid={`complete-section-${i}`}
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                isCompleted 
                                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/25' 
                                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 border border-stone-200 dark:border-stone-700'
                              }`}
                            >
                              {isCompleted ? <><CheckCircle className="w-4 h-4" strokeWidth={2.5} /> {t('lessonView.markComplete').replace('Mark Complete', 'Completed')}</> : <><Square className="w-4 h-4" /> {t('lessonView.markComplete')}</>}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); openDrawer('', i) }} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors border border-blue-200/50 dark:border-blue-800/30">
                              <BookOpen className="w-4 h-4" strokeWidth={2} /> Look Up Verse
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            {i > 0 && (
                              <button onClick={(e) => { e.stopPropagation(); scrollToSection(i - 1) }} className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all">
                                <ChevronLeft className="w-5 h-5" />
                              </button>
                            )}
                            {i < lesson.sections.length - 1 && (
                              <button onClick={(e) => { e.stopPropagation(); scrollToSection(i + 1) }} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-[1.02] transition-all">
                                {t('lessonView.nextSection')} <ChevronRight className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Add Section Button */}
              {editMode && (
                <button
                  onClick={() => setShowAddSectionModal(true)}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-600 text-stone-400 dark:text-stone-500 hover:text-amber-600 dark:hover:text-amber-400 transition-all flex items-center justify-center gap-1.5 text-xs font-medium hover:bg-amber-50/50 dark:hover:bg-amber-900/10"
                >
                  <Plus className="w-4 h-4" /> {t('lessonView.addSection')}
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800 text-center">
              <p className="text-[10px] text-stone-400 dark:text-stone-500">
                Bible Lesson Planner
              </p>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Cross References, Materials & Tools (Sticky) */}
        <aside className="hidden xl:flex flex-col w-80 bg-white dark:bg-[#292524] border-l border-stone-200 dark:border-stone-800 h-screen sticky top-0">
          {/* Sidebar content - scrollable */}
          <div className="flex-1 overflow-y-auto">
            {/* Cross References Section */}
            {lesson.crossReferences.length > 0 && (
              <div className="p-4 border-b border-stone-100 dark:border-stone-800">
                <h3 className="text-xs font-semibold text-stone-900 dark:text-stone-100 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" /> {t('lessonView.crossReferences').toUpperCase()}
                </h3>
                <div className="space-y-3">
                  {lesson.crossReferences.map((ref, i) => (
                    <div key={i} className="space-y-1">
                      <button 
                        onClick={() => openDrawer(ref.reference)} 
                        className="px-3 py-1.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        {ref.reference}
                      </button>
                      <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">{ref.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Materials Checklist Section */}
            {lesson.materialsNeeded.length > 0 && (
              <div className="p-4 border-b border-stone-100 dark:border-stone-800">
                <h3 className="text-xs font-semibold text-stone-900 dark:text-stone-100 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4" /> {t('lessonView.materials').toUpperCase()}
                </h3>
                <div className="space-y-1.5">
                  {lesson.materialsNeeded.map((material, i) => (
                    <button
                      key={i}
                      onClick={() => toggleMaterial(i)}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all ${
                        checkedMaterials.has(i) 
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' 
                          : 'bg-stone-50 dark:bg-stone-800/50 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        checkedMaterials.has(i) 
                          ? 'border-emerald-500 bg-emerald-500' 
                          : 'border-stone-300 dark:border-stone-600'
                      }`}>
                        {checkedMaterials.has(i) && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <span className={`text-xs ${checkedMaterials.has(i) ? 'line-through opacity-70' : ''}`}>{material.item}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Tools Section */}
            <div className="p-4 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-xs font-semibold text-stone-900 dark:text-stone-100 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Settings className="w-4 h-4" /> TOOLS
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={() => openDrawer(lesson.passage)} 
                  className="w-full flex items-center gap-2.5 px-3 py-2 bg-[#1E3A5F] text-white rounded-lg text-sm font-medium hover:bg-[#162D4A] transition-colors"
                  data-testid="scripture-lookup-btn"
                >
                  <BookOpen className="w-4 h-4" strokeWidth={2} /> Scripture Lookup
                </button>
                
                <button 
                  onClick={() => togglePanel('quiz')} 
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activePanel === 'quiz' 
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' 
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                  }`}
                  data-testid="show-quiz-btn"
                >
                  <Brain className="w-4 h-4" strokeWidth={2} /> Quiz Generator
                </button>
                
                <button 
                  onClick={() => togglePanel('supplies')} 
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activePanel === 'supplies' 
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' 
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                  }`}
                  data-testid="show-ai-supply-btn"
                >
                  <Package className="w-4 h-4" strokeWidth={2} /> Supply List
                </button>
              </div>
            </div>

            {/* Active Tool Panel Content */}
            {activePanel === 'none' && (
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-3">
                  <Layers className="w-6 h-6 text-stone-400 dark:text-stone-500" />
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">Select a tool to get started</p>
              </div>
            )}
            
            {showQuiz && (
              <div className="p-4" data-testid="quiz-section">
                <FeatureGate featureName="quizGenerator" featureLabel="Quiz Generator">
                  <QuizGenerator 
                    lessonId={lessonId} 
                    lessonTitle={lesson.title}
                    lessonPassage={lesson.passage}
                    lessonTheme={lesson.theme}
                    lessonAgeGroup={lesson.ageGroup}
                    memoryVerse={lesson.memoryVerse ? `${lesson.memoryVerse.text} - ${lesson.memoryVerse.reference}` : undefined}
                    lessonContent={lesson.sections?.map(s => `${s.title}: ${s.content}`).join('\n\n')}
                  />
                </FeatureGate>
              </div>
            )}
            
            {showAISupplyList && (
              <div className="p-4" data-testid="ai-supply-list-section">
                <AISupplyList lessonId={lessonId} lessonTitle={lesson.title} />
              </div>
            )}
          </div>
        </aside>
      </div>
      
      {/* Version History Modal */}
      {showVersionHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowVersionHistory(false)}>
          <div 
            className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden" 
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <History className="w-5 h-5 text-orange-600 dark:text-orange-400" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">Version History</h2>
                  <p className="text-sm text-stone-500 dark:text-stone-400">{versionHistory.length} version{versionHistory.length !== 1 ? 's' : ''} saved</p>
                </div>
              </div>
              <button onClick={() => setShowVersionHistory(false)} className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              {versionHistory.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                    <History className="w-8 h-8 text-stone-400" strokeWidth={1.5} />
                  </div>
                  <p className="text-base font-medium text-stone-600 dark:text-stone-400 mb-2">No versions saved yet</p>
                  <p className="text-sm text-stone-500 dark:text-stone-500">Versions are saved automatically when you make edits.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...versionHistory].reverse().map((version, i) => (
                    <div key={version.id} className={`p-4 rounded-xl border transition-all ${
                      i === 0 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40' 
                        : 'bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700 hover:border-orange-400/50'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {i === 0 && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">Current</span>
                            )}
                            <span className="text-sm font-medium text-stone-900 dark:text-stone-100">
                              {new Date(version.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm text-stone-500 dark:text-stone-400">{version.changes}</p>
                        </div>
                        {i !== 0 && (
                          <button
                            onClick={() => {
                              if (window.confirm('Restore this version? Current changes will be saved as a new version.')) {
                                lessonStore.restoreVersion(lesson.id, version.id)
                                const restored = lessonStore.getById(lesson.id)
                                if (restored) {
                                  setLesson(restored)
                                  setVersionHistory(lessonStore.getVersionHistory(lesson.id))
                                }
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-medium hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} /> Restore
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Share Dialog Modal */}
      {showShareDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowShareDialog(false)}>
          <div 
            className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-md w-full" 
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">Share Lesson</h2>
                  <p className="text-sm text-stone-500 dark:text-stone-400">Collaborate with team members</p>
                </div>
              </div>
              <button onClick={() => setShowShareDialog(false)} className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Current Share Status */}
              {shareInfo && shareInfo.sharedWith.length > 0 && (
                <div className="mb-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Currently shared with:</p>
                  <div className="flex flex-wrap gap-2">
                    {shareInfo.sharedWith.map((email, i) => (
                      <span key={i} className="px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs font-medium">
                        {email}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    Permission: {shareInfo.permissions === 'edit' ? 'Can edit' : 'View only'}
                  </p>
                </div>
              )}
              
              {/* Email Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Email addresses (comma separated)
                </label>
                <textarea
                  value={shareEmails}
                  onChange={(e) => setShareEmails(e.target.value)}
                  placeholder="colleague@church.com, pastor@church.com"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              </div>
              
              {/* Permission Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Permission level
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSharePermission('view')}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      sharePermission === 'view'
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-700'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    <Eye className="w-4 h-4 inline-block mr-1.5" strokeWidth={1.5} />
                    View Only
                  </button>
                  <button
                    onClick={() => setSharePermission('edit')}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      sharePermission === 'edit'
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    <Pencil className="w-4 h-4 inline-block mr-1.5" strokeWidth={1.5} />
                    Can Edit
                  </button>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-3">
                {shareInfo && shareInfo.sharedWith.length > 0 && (
                  <button
                    onClick={() => {
                      lessonStore.unshareLesson(lesson.id)
                      setShareInfo(undefined)
                      setShareEmails('')
                    }}
                    className="px-4 py-2.5 rounded-xl text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Remove Access
                  </button>
                )}
                <div className="flex-1"></div>
                <button
                  onClick={() => setShowShareDialog(false)}
                  className="px-4 py-2.5 rounded-xl text-stone-600 dark:text-stone-400 text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const emails = shareEmails.split(',').map(e => e.trim()).filter(e => e && e.includes('@'))
                    if (emails.length > 0) {
                      const share = lessonStore.shareLesson(lesson.id, emails, sharePermission)
                      setShareInfo(share)
                      setShowShareDialog(false)
                      // Show success toast
                      setInsertToast(`Shared with ${emails.length} team member${emails.length > 1 ? 's' : ''}`)
                      setTimeout(() => setInsertToast(null), 3000)
                    }
                  }}
                  disabled={!shareEmails.trim()}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
