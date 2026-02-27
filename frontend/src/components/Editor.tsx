import { useState, useRef, useCallback, useEffect } from 'react'
import { Quote, Megaphone, Heart, Music, MessageCircle, Globe, Pencil, FileText, Plus, BookOpen, Palette, Play, Lightbulb, MessageSquare, HelpCircle } from 'lucide-react'

interface EditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
  autoSave?: boolean
  autoSaveDelay?: number
}

// Toolbar button component
function ToolbarButton({
  icon,
  label,
  active,
  onClick,
  className = '',
}: {
  icon: string | React.ReactNode
  label: string
  active?: boolean
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all duration-150 ${
        active
          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 shadow-sm border border-amber-200 dark:border-amber-700/50'
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-200'
      } ${className}`}
    >
      {icon}
    </button>
  )
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5" />
}

// Convert markdown-like content to HTML for the editor
function markdownToHtml(md: string): string {
  let html = md
  // Bold: **text** → <b>text</b>
  html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
  // Italic: *text* → <i>text</i> (but not inside bold)
  html = html.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<i>$1</i>')
  // Numbered lists: lines starting with "1. " etc
  html = html.replace(/^(\d+)\.\s+(.*)$/gm, '<li data-num="$1">$2</li>')
  // Bullet lists: lines starting with "- "
  html = html.replace(/^-\s+(.*)$/gm, '<li data-bullet="true">$1</li>')
  // Wrap consecutive <li> in <ul> or <ol>
  html = html.replace(/((?:<li data-bullet="true">.*?<\/li>\n?)+)/g, '<ul>$1</ul>')
  html = html.replace(/((?:<li data-num="\d+">.*?<\/li>\n?)+)/g, '<ol>$1</ol>')
  // Paragraphs: double newlines
  const blocks = html.split('\n\n')
  html = blocks
    .map(block => {
      const trimmed = block.trim()
      if (!trimmed) return ''
      if (trimmed.startsWith('<ul>') || trimmed.startsWith('<ol>') || trimmed.startsWith('<h')) return trimmed
      // Single newlines within a block → <br>
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`
    })
    .filter(Boolean)
    .join('')
  return html
}

// Convert HTML back to markdown-like format
function htmlToMarkdown(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html

  function processNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || ''
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return ''

    const el = node as HTMLElement
    const tag = el.tagName.toLowerCase()
    const childText = Array.from(el.childNodes).map(processNode).join('')

    switch (tag) {
      case 'b':
      case 'strong':
        return `**${childText}**`
      case 'i':
      case 'em':
        return `*${childText}*`
      case 'u':
        return childText
      case 'br':
        return '\n'
      case 'p':
      case 'div':
        return childText + '\n\n'
      case 'h1':
        return `**${childText}**\n\n`
      case 'h2':
        return `**${childText}**\n\n`
      case 'h3':
        return `**${childText}**\n\n`
      case 'li': {
        const parent = el.parentElement
        if (parent && parent.tagName.toLowerCase() === 'ol') {
          const index = Array.from(parent.children).indexOf(el) + 1
          return `${index}. ${childText}\n`
        }
        return `- ${childText}\n`
      }
      case 'ul':
      case 'ol':
        return childText + '\n'
      default:
        return childText
    }
  }

  const result = Array.from(div.childNodes).map(processNode).join('')
  // Clean up excessive newlines
  return result.replace(/\n{3,}/g, '\n\n').trim()
}

export function Editor({
  content,
  onChange,
  placeholder = 'Start typing...',
  className = '',
  minHeight = '120px',
  autoSave = true,
  autoSaveDelay = 1000,
}: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())
  const lastContentRef = useRef(content)
  const isInitializedRef = useRef(false)

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && !isInitializedRef.current) {
      editorRef.current.innerHTML = markdownToHtml(content)
      isInitializedRef.current = true
    }
  }, [content])

  // Update if content changes externally (e.g., scripture insert)
  useEffect(() => {
    if (editorRef.current && content !== lastContentRef.current && !isFocused) {
      editorRef.current.innerHTML = markdownToHtml(content)
      lastContentRef.current = content
    }
  }, [content, isFocused])

  // Check active formats at cursor position
  const updateActiveFormats = useCallback(() => {
    const formats = new Set<string>()
    if (document.queryCommandState('bold')) formats.add('bold')
    if (document.queryCommandState('italic')) formats.add('italic')
    if (document.queryCommandState('underline')) formats.add('underline')
    if (document.queryCommandState('insertOrderedList')) formats.add('orderedList')
    if (document.queryCommandState('insertUnorderedList')) formats.add('unorderedList')

    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      let node: Node | null = sel.anchorNode
      while (node && node !== editorRef.current) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const tag = (node as HTMLElement).tagName.toLowerCase()
          if (tag === 'h1' || tag === 'h2' || tag === 'h3') formats.add('heading')
          if (tag === 'blockquote') formats.add('quote')
        }
        node = node.parentNode
      }
    }

    setActiveFormats(formats)
  }, [])

  // Handle content changes with auto-save
  const handleInput = useCallback(() => {
    if (!editorRef.current) return

    const html = editorRef.current.innerHTML
    const md = htmlToMarkdown(html)
    lastContentRef.current = md

    if (autoSave) {
      setSaveStatus('saving')
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        onChange(md)
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 1500)
      }, autoSaveDelay)
    } else {
      onChange(md)
    }

    updateActiveFormats()
  }, [onChange, autoSave, autoSaveDelay, updateActiveFormats])

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  // Formatting commands
  const execCommand = useCallback((command: string, value?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
    handleInput()
    updateActiveFormats()
  }, [handleInput, updateActiveFormats])

  const toggleBold = () => execCommand('bold')
  const toggleItalic = () => execCommand('italic')
  const toggleUnderline = () => execCommand('underline')
  const toggleOrderedList = () => execCommand('insertOrderedList')
  const toggleUnorderedList = () => execCommand('insertUnorderedList')

  const toggleHeading = () => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return
    let node: Node | null = sel.anchorNode
    let isHeading = false
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = (node as HTMLElement).tagName.toLowerCase()
        if (tag === 'h3') {
          isHeading = true
          break
        }
      }
      node = node.parentNode
    }
    execCommand('formatBlock', isHeading ? 'p' : 'h3')
  }

  const insertQuote = () => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return
    let node: Node | null = sel.anchorNode
    let isQuote = false
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName.toLowerCase() === 'blockquote') {
        isQuote = true
        break
      }
      node = node.parentNode
    }
    if (isQuote) {
      execCommand('formatBlock', 'p')
    } else {
      execCommand('formatBlock', 'blockquote')
    }
  }

  const insertHorizontalRule = () => {
    execCommand('insertHorizontalRule')
  }

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault()
          toggleBold()
          break
        case 'i':
          e.preventDefault()
          toggleItalic()
          break
        case 'u':
          e.preventDefault()
          toggleUnderline()
          break
      }
    }
  }, [])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }, [])

  const isEmpty = editorRef.current?.textContent?.trim() === '' && !editorRef.current?.querySelector('img')

  return (
    <div className={`rounded-xl border transition-all duration-200 ${
      isFocused
        ? 'border-amber-300 dark:border-amber-600 shadow-md shadow-amber-500/10 ring-2 ring-amber-500/20'
        : 'border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600'
    } bg-white dark:bg-gray-800/60 overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className={`flex items-center gap-0.5 px-2 py-1.5 border-b transition-colors duration-200 ${
        isFocused
          ? 'border-amber-200/60 dark:border-amber-700/30 bg-amber-50/50 dark:bg-amber-900/5'
          : 'border-gray-100 dark:border-gray-700/30 bg-gray-50/50 dark:bg-gray-800/30'
      }`}>
        <ToolbarButton icon="𝐁" label="Bold (⌘B)" active={activeFormats.has('bold')} onClick={toggleBold} />
        <ToolbarButton icon="𝐼" label="Italic (⌘I)" active={activeFormats.has('italic')} onClick={toggleItalic} />
        <ToolbarButton icon="U̲" label="Underline (⌘U)" active={activeFormats.has('underline')} onClick={toggleUnderline} />
        <ToolbarDivider />
        <ToolbarButton icon="H" label="Heading" active={activeFormats.has('heading')} onClick={toggleHeading} className="font-bold text-xs" />
        <ToolbarButton icon={<Quote className="w-3.5 h-3.5" />} label="Quote" active={activeFormats.has('quote')} onClick={insertQuote} />
        <ToolbarDivider />
        <ToolbarButton icon="•" label="Bullet List" active={activeFormats.has('unorderedList')} onClick={toggleUnorderedList} className="text-lg" />
        <ToolbarButton icon="1." label="Numbered List" active={activeFormats.has('orderedList')} onClick={toggleOrderedList} className="text-xs font-bold" />
        <ToolbarDivider />
        <ToolbarButton icon="—" label="Horizontal Rule" onClick={insertHorizontalRule} className="text-xs" />

        {/* Auto-save indicator */}
        {autoSave && (
          <div className="ml-auto flex items-center gap-1.5 pr-1">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400 font-medium">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </span>
            )}
          </div>
        )}
      </div>

      {/* Editor Area */}
      <div className="relative">
        {isEmpty && !isFocused && (
          <div className="absolute top-0 left-0 right-0 px-4 py-3 text-sm text-gray-400 dark:text-gray-500 pointer-events-none select-none">
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onFocus={() => { setIsFocused(true); updateActiveFormats() }}
          onBlur={() => {
            setIsFocused(false)
            // Force save on blur
            if (editorRef.current) {
              const md = htmlToMarkdown(editorRef.current.innerHTML)
              if (md !== lastContentRef.current) {
                onChange(md)
                setSaveStatus('saved')
                setTimeout(() => setSaveStatus('idle'), 1500)
              }
            }
          }}
          onKeyDown={handleKeyDown}
          onKeyUp={updateActiveFormats}
          onMouseUp={updateActiveFormats}
          onPaste={handlePaste}
          className="px-4 py-3 outline-none text-[14.5px] text-gray-800 dark:text-gray-200 leading-relaxed overflow-y-auto prose-editor"
          style={{ minHeight }}
        />
      </div>
    </div>
  )
}

// Custom section types for adding to lessons
export const CUSTOM_SECTION_TEMPLATES = [
  {
    id: 'church-news',
    title: 'Church News & Announcements',
    icon: <Megaphone className="w-5 h-5" />,
    type: 'custom',
    duration: '3 minutes',
    content: '**Church Announcements:**\n\nAdd your local church news, upcoming events, and announcements here.\n\n- Upcoming event: \n- Volunteer opportunity: \n- Important date: ',
  },
  {
    id: 'prayer-requests',
    title: 'Prayer Requests',
    icon: <Heart className="w-5 h-5" />,
    type: 'custom',
    duration: '5 minutes',
    content: '**Prayer Time:**\n\nTake time to gather prayer requests from the group and pray together.\n\n**How to lead prayer time:**\n1. Ask if anyone has prayer requests to share\n2. Write them down so you can follow up\n3. Pray together as a group\n4. Consider assigning prayer partners for the week\n\n**Requests:**\n- \n- \n- ',
  },
  {
    id: 'worship',
    title: 'Worship & Song Time',
    icon: <Music className="w-5 h-5" />,
    type: 'custom',
    duration: '5 minutes',
    content: '**Worship Songs:**\n\nLead the group in worship with these suggested songs:\n\n1. Song title: \n2. Song title: \n3. Song title: \n\n**Tips:**\n- Choose songs that connect to today\'s theme\n- Have lyrics printed or projected\n- Encourage participation even from shy members',
  },
  {
    id: 'testimony',
    title: 'Testimony Time',
    icon: <MessageCircle className="w-5 h-5" />,
    type: 'custom',
    duration: '5 minutes',
    content: '**Testimony Sharing:**\n\nInvite a member to share how God has been working in their life this week.\n\n**Guidelines for sharing:**\n- Keep it to 3-5 minutes\n- Focus on what God has done\n- Be encouraging and uplifting\n- Respect everyone\'s comfort level',
  },
  {
    id: 'mission-spotlight',
    title: 'Mission Spotlight',
    icon: <Globe className="w-5 h-5" />,
    type: 'custom',
    duration: '3 minutes',
    content: '**Mission Spotlight:**\n\nHighlight a missionary, mission organization, or outreach opportunity.\n\n**Missionary/Organization:** \n**Location:** \n**How we can help:** \n**Prayer needs:** ',
  },
  {
    id: 'custom-blank',
    title: 'Custom Section',
    icon: <Pencil className="w-5 h-5" />,
    type: 'custom',
    duration: '5 minutes',
    content: 'Add your custom content here...',
  },
]

// Add Custom Section Modal
export function AddSectionModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean
  onClose: () => void
  onAdd: (section: { title: string; icon: string | React.ReactNode; type: string; duration: string; content: string }) => void
}) {
  const [customTitle, setCustomTitle] = useState('')
  const [customDuration, setCustomDuration] = useState('5 minutes')
  const [showCustomForm, setShowCustomForm] = useState(false)

  if (!isOpen) return null

  const handleAddTemplate = (template: typeof CUSTOM_SECTION_TEMPLATES[0]) => {
    if (template.id === 'custom-blank') {
      setShowCustomForm(true)
      return
    }
    onAdd({
      title: template.title,
      icon: template.icon,
      type: template.type,
      duration: template.duration,
      content: template.content,
    })
    onClose()
  }

  const handleAddCustom = () => {
    if (!customTitle.trim()) return
    onAdd({
      title: customTitle.trim(),
      icon: <FileText className="w-5 h-5" />,
      type: 'custom',
      duration: customDuration,
      content: 'Add your content here...',
    })
    setCustomTitle('')
    setCustomDuration('5 minutes')
    setShowCustomForm(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Section
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Choose a template or create a custom section
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh] p-5">
          {showCustomForm ? (
            <div className="space-y-4">
              <button
                onClick={() => setShowCustomForm(false)}
                className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to templates
              </button>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Section Title
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  placeholder="e.g., Local Outreach Update"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Duration
                </label>
                <select
                  value={customDuration}
                  onChange={e => setCustomDuration(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400"
                >
                  <option value="2 minutes">2 minutes</option>
                  <option value="3 minutes">3 minutes</option>
                  <option value="5 minutes">5 minutes</option>
                  <option value="8 minutes">8 minutes</option>
                  <option value="10 minutes">10 minutes</option>
                  <option value="15 minutes">15 minutes</option>
                </select>
              </div>
              <button
                onClick={handleAddCustom}
                disabled={!customTitle.trim()}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold shadow-md shadow-amber-500/20 hover:shadow-lg hover:scale-[1.02] active:scale-100 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
              >
                <Plus className="w-4 h-4" /> Add Custom Section
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {CUSTOM_SECTION_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleAddTemplate(template)}
                  className="w-full flex items-start gap-3.5 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50 hover:border-amber-300 dark:hover:border-amber-600 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-all duration-200 text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700/50 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 flex items-center justify-center text-lg transition-colors flex-shrink-0">
                    {template.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                      {template.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                      {template.id === 'custom-blank'
                        ? 'Create a section with your own title and content'
                        : template.content.split('\n')[0].replace(/\*\*/g, '')}
                    </p>
                    <span className="inline-block mt-1.5 text-[10px] font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded-full">
                      {template.duration}
                    </span>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-amber-400 dark:group-hover:text-amber-500 transition-colors flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
