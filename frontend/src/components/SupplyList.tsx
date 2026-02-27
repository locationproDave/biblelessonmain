import { useState, useCallback, useRef } from 'react'
import { Pin, Gamepad2, Palette, Lightbulb, Pencil, Package, Search, Plus, Printer, ClipboardList, Eye, EyeOff, CheckSquare, Square, PartyPopper, Sparkles } from 'lucide-react'

export interface SupplyItem {
  id: string
  item: string
  category: 'essential' | 'activity' | 'craft' | 'optional' | 'custom'
  checked: boolean
  quantity?: string
  notes?: string
  source?: 'auto-detected' | 'manual'
}

interface SupplyListProps {
  materialsNeeded: { item: string; category: string }[]
  lessonTitle: string
  lessonPassage: string
  sections: { title: string; content: string; type: string }[]
  onSuppliesChange?: (supplies: SupplyItem[]) => void
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bgColor: string; borderColor: string; badgeColor: string }> = {
  essential: {
    label: 'Essential',
    icon: <Pin className="w-4 h-4" />,
    color: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-50 dark:bg-red-900/10',
    borderColor: 'border-red-200 dark:border-red-800/40',
    badgeColor: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  },
  activity: {
    label: 'Activity',
    icon: <Gamepad2 className="w-4 h-4" />,
    color: 'text-emerald-700 dark:text-emerald-300',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/10',
    borderColor: 'border-emerald-200 dark:border-emerald-800/40',
    badgeColor: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  },
  craft: {
    label: 'Craft',
    icon: <Palette className="w-4 h-4" />,
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-50 dark:bg-purple-900/10',
    borderColor: 'border-purple-200 dark:border-purple-800/40',
    badgeColor: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  },
  optional: {
    label: 'Optional',
    icon: <Lightbulb className="w-4 h-4" />,
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-50 dark:bg-amber-900/10',
    borderColor: 'border-amber-200 dark:border-amber-800/40',
    badgeColor: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  },
  custom: {
    label: 'Custom',
    icon: <Pencil className="w-4 h-4" />,
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-900/10',
    borderColor: 'border-blue-200 dark:border-blue-800/40',
    badgeColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  },
}

// Scan lesson sections for additional materials not in the materialsNeeded list
function scanForAdditionalSupplies(sections: { title: string; content: string; type: string }[], existingItems: string[]): SupplyItem[] {
  const found: SupplyItem[] = []
  const existingLower = existingItems.map(i => i.toLowerCase())

  // Common supply keywords to look for in lesson content
  const supplyPatterns = [
    // Craft supplies
    /(?:construction|colored|tissue|brown|white|card)\s*(?:paper|stock)/gi,
    /(?:crayons?|markers?|colored\s*pencils?|paint|glitter|glue\s*sticks?|scissors|tape|stickers?)/gi,
    /(?:paper\s*plates?|paper\s*cups?|paper\s*bags?|paper\s*towels?)/gi,
    /(?:pipe\s*cleaners?|popsicle\s*sticks?|cotton\s*balls?|yarn|string|ribbon)/gi,
    /(?:foam\s*sheets?|felt\s*pieces?|beads?|buttons?|sequins?)/gi,
    // Activity supplies
    /(?:scenario\s*cards?|index\s*cards?|flash\s*cards?)/gi,
    /(?:whiteboard|dry\s*erase\s*markers?|chalk|chalkboard)/gi,
    /(?:ball|balls|bean\s*bags?|cones?|hula\s*hoops?)/gi,
    /(?:blindfold|timer|stopwatch|whistle)/gi,
    // Teaching supplies
    /(?:printed\s*handouts?|worksheets?|coloring\s*sheets?)/gi,
    /(?:poster\s*board|chart\s*paper|flip\s*chart)/gi,
    /(?:projector|laptop|screen|speakers?)/gi,
    // Props
    /(?:toy\s*animals?|puppets?|felt\s*board|flannel\s*board)/gi,
    /(?:costumes?|robes?|headbands?|crowns?)/gi,
    /(?:basket|baskets|bowl|bowls|container|containers)/gi,
    /(?:bandages?|first\s*aid)/gi,
    // Food
    /(?:snacks?|crackers?|cookies?|juice|water\s*bottles?|cups?|napkins?|plates?)/gi,
    /(?:bread|fish|fruit|grapes|grape\s*juice)/gi,
    // General
    /(?:name\s*tags?|pens?|pencils?|notebooks?|journals?)/gi,
    /(?:music|cd|playlist|speaker)/gi,
    /(?:candle|candles|matches|lighter)/gi,
    /(?:map|maps|globe|atlas)/gi,
    /(?:stones?|rocks?|pebbles?|sand)/gi,
    /(?:seeds?|plants?|flowers?|leaves?)/gi,
    /(?:aluminum\s*foil|cardboard|boxes?)/gi,
  ]

  const allContent = sections.map(s => s.content).join(' ')

  supplyPatterns.forEach(pattern => {
    const matches = allContent.match(pattern)
    if (matches) {
      matches.forEach(match => {
        const cleaned = match.trim().toLowerCase()
        // Check if this item is already in the existing materials list
        const alreadyExists = existingLower.some(existing =>
          existing.includes(cleaned) || cleaned.includes(existing.replace(/[^a-z\s]/g, '').trim())
        )
        // Check if we already found this item
        const alreadyFound = found.some(f => f.item.toLowerCase() === cleaned)

        if (!alreadyExists && !alreadyFound && cleaned.length > 2) {
          // Determine category based on section type where found
          const sourceSection = sections.find(s => s.content.toLowerCase().includes(cleaned))
          let category: SupplyItem['category'] = 'optional'
          if (sourceSection) {
            if (sourceSection.type === 'craft') category = 'craft'
            else if (sourceSection.type === 'activity') category = 'activity'
            else if (sourceSection.type === 'teaching' || sourceSection.type === 'scripture') category = 'essential'
          }

          found.push({
            id: `scanned-${crypto.randomUUID().slice(0, 8)}`,
            item: match.trim().charAt(0).toUpperCase() + match.trim().slice(1),
            category,
            checked: false,
            source: 'auto-detected',
          })
        }
      })
    }
  })

  return found
}

export function SupplyList({ materialsNeeded, lessonTitle, lessonPassage, sections, onSuppliesChange }: SupplyListProps) {
  // Initialize supplies from materialsNeeded
  const [supplies, setSupplies] = useState<SupplyItem[]>(() => {
    const base = materialsNeeded.map((m, i) => ({
      id: `material-${i}`,
      item: m.item,
      category: (m.category || 'essential') as SupplyItem['category'],
      checked: false,
      source: 'auto-detected' as const,
    }))
    return base
  })

  const [scannedExtras, setScannedExtras] = useState<SupplyItem[]>([])
  const [hasScanned, setHasScanned] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemCategory, setNewItemCategory] = useState<SupplyItem['category']>('essential')
  const [newItemQuantity, setNewItemQuantity] = useState('')
  const [newItemNotes, setNewItemNotes] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editQuantity, setEditQuantity] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [showChecked, setShowChecked] = useState(true)
  const [showPrintView, setShowPrintView] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const allSupplies = [...supplies, ...scannedExtras]
  const checkedCount = allSupplies.filter(s => s.checked).length
  const totalCount = allSupplies.length

  const updateSupplies = useCallback((updated: SupplyItem[]) => {
    setSupplies(updated.filter(s => !s.id.startsWith('scanned-')))
    setScannedExtras(updated.filter(s => s.id.startsWith('scanned-')))
    onSuppliesChange?.(updated)
  }, [onSuppliesChange])

  const handleScan = useCallback(() => {
    setIsScanning(true)
    // Simulate scanning delay for UX
    setTimeout(() => {
      const extras = scanForAdditionalSupplies(sections, materialsNeeded.map(m => m.item))
      setScannedExtras(extras)
      setHasScanned(true)
      setIsScanning(false)
    }, 800)
  }, [sections, materialsNeeded])

  const toggleCheck = useCallback((id: string) => {
    const inBase = supplies.find(s => s.id === id)
    if (inBase) {
      const updated = supplies.map(s => s.id === id ? { ...s, checked: !s.checked } : s)
      setSupplies(updated)
      onSuppliesChange?.([...updated, ...scannedExtras])
    } else {
      const updated = scannedExtras.map(s => s.id === id ? { ...s, checked: !s.checked } : s)
      setScannedExtras(updated)
      onSuppliesChange?.([...supplies, ...updated])
    }
  }, [supplies, scannedExtras, onSuppliesChange])

  const checkAll = useCallback(() => {
    const updatedBase = supplies.map(s => ({ ...s, checked: true }))
    const updatedExtras = scannedExtras.map(s => ({ ...s, checked: true }))
    setSupplies(updatedBase)
    setScannedExtras(updatedExtras)
    onSuppliesChange?.([...updatedBase, ...updatedExtras])
  }, [supplies, scannedExtras, onSuppliesChange])

  const uncheckAll = useCallback(() => {
    const updatedBase = supplies.map(s => ({ ...s, checked: false }))
    const updatedExtras = scannedExtras.map(s => ({ ...s, checked: false }))
    setSupplies(updatedBase)
    setScannedExtras(updatedExtras)
    onSuppliesChange?.([...updatedBase, ...updatedExtras])
  }, [supplies, scannedExtras, onSuppliesChange])

  const addItem = useCallback(() => {
    if (!newItemName.trim()) return
    const newItem: SupplyItem = {
      id: `custom-${crypto.randomUUID().slice(0, 8)}`,
      item: newItemName.trim(),
      category: newItemCategory,
      checked: false,
      quantity: newItemQuantity.trim() || undefined,
      notes: newItemNotes.trim() || undefined,
      source: 'manual',
    }
    const updated = [...supplies, newItem]
    setSupplies(updated)
    onSuppliesChange?.([...updated, ...scannedExtras])
    setNewItemName('')
    setNewItemQuantity('')
    setNewItemNotes('')
    setShowAddForm(false)
  }, [newItemName, newItemCategory, newItemQuantity, newItemNotes, supplies, scannedExtras, onSuppliesChange])

  const removeItem = useCallback((id: string) => {
    if (id.startsWith('scanned-')) {
      const updated = scannedExtras.filter(s => s.id !== id)
      setScannedExtras(updated)
      onSuppliesChange?.([...supplies, ...updated])
    } else {
      const updated = supplies.filter(s => s.id !== id)
      setSupplies(updated)
      onSuppliesChange?.([...updated, ...scannedExtras])
    }
  }, [supplies, scannedExtras, onSuppliesChange])

  const startEdit = useCallback((item: SupplyItem) => {
    setEditingId(item.id)
    setEditValue(item.item)
    setEditQuantity(item.quantity || '')
    setEditNotes(item.notes || '')
  }, [])

  const saveEdit = useCallback(() => {
    if (!editingId || !editValue.trim()) return
    const updateFn = (s: SupplyItem) =>
      s.id === editingId ? { ...s, item: editValue.trim(), quantity: editQuantity.trim() || undefined, notes: editNotes.trim() || undefined } : s

    if (editingId.startsWith('scanned-')) {
      const updated = scannedExtras.map(updateFn)
      setScannedExtras(updated)
      onSuppliesChange?.([...supplies, ...updated])
    } else {
      const updated = supplies.map(updateFn)
      setSupplies(updated)
      onSuppliesChange?.([...updated, ...scannedExtras])
    }
    setEditingId(null)
    setEditValue('')
    setEditQuantity('')
    setEditNotes('')
  }, [editingId, editValue, editQuantity, editNotes, supplies, scannedExtras, onSuppliesChange])

  const filteredSupplies = allSupplies.filter(s => {
    if (filterCategory !== 'all' && s.category !== filterCategory) return false
    if (!showChecked && s.checked) return false
    return true
  })

  const categorizedSupplies = Object.keys(CATEGORY_CONFIG).reduce((acc, cat) => {
    acc[cat] = filteredSupplies.filter(s => s.category === cat)
    return acc
  }, {} as Record<string, SupplyItem[]>)

  // Print-friendly supply list
  const handlePrint = useCallback(() => {
    const printHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Supply List — ${lessonTitle}</title>
  <style>
    @media print { body { margin: 0; padding: 20px; } @page { margin: 0.75in; } }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; max-width: 700px; margin: 0 auto; padding: 20px; }
    h1 { font-size: 22px; margin: 0 0 4px 0; }
    .subtitle { color: #6b7280; font-size: 13px; margin-bottom: 20px; }
    .category { margin-bottom: 20px; }
    .category-header { font-size: 15px; font-weight: 700; padding: 8px 12px; border-radius: 6px; margin-bottom: 8px; }
    .cat-essential .category-header { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
    .cat-activity .category-header { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
    .cat-craft .category-header { background: #faf5ff; color: #7c3aed; border: 1px solid #ddd6fe; }
    .cat-optional .category-header { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
    .cat-custom .category-header { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
    .item { display: flex; align-items: flex-start; gap: 10px; padding: 6px 12px; font-size: 14px; line-height: 1.5; }
    .checkbox { width: 16px; height: 16px; border: 2px solid #d1d5db; border-radius: 3px; flex-shrink: 0; margin-top: 3px; }
    .checked .checkbox { background: #10b981; border-color: #10b981; }
    .checked .item-text { text-decoration: line-through; color: #9ca3af; }
    .item-text { flex: 1; }
    .item-meta { font-size: 11px; color: #9ca3af; }
    .footer { text-align: center; margin-top: 24px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; }
    .stats { display: flex; gap: 16px; margin-bottom: 16px; font-size: 13px; }
    .stat { padding: 6px 12px; background: #f3f4f6; border-radius: 6px; }
  </style>
</head>
<body>
  <h1>Supply List</h1>
  <p class="subtitle">${lessonTitle} — ${lessonPassage}</p>
  <div class="stats">
    <span class="stat">${totalCount} items</span>
    <span class="stat">${checkedCount} gathered</span>
    <span class="stat">⬜ ${totalCount - checkedCount} remaining</span>
  </div>
  ${Object.entries(categorizedSupplies)
    .filter(([_, items]) => items.length > 0)
    .map(([cat, items]) => {
      const config = CATEGORY_CONFIG[cat]
      return `<div class="category cat-${cat}">
        <div class="category-header">${config.icon} ${config.label} (${items.length})</div>
        ${items.map(item => `
          <div class="item ${item.checked ? 'checked' : ''}">
            <div class="checkbox"></div>
            <div>
              <span class="item-text">${item.item}</span>
              ${item.quantity ? `<span class="item-meta"> — Qty: ${item.quantity}</span>` : ''}
              ${item.notes ? `<div class="item-meta">${item.notes}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>`
    }).join('')}
  <div class="footer">
    <p>Generated by Bible Lesson Planner — biblelessonplanner.com</p>
    <p>Printed ${new Date().toLocaleDateString()}</p>
  </div>
</body>
</html>`

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printHTML)
      printWindow.document.close()
      setTimeout(() => printWindow.print(), 500)
    }
  }, [allSupplies, categorizedSupplies, lessonTitle, lessonPassage, totalCount, checkedCount])

  const handleCopyList = useCallback(() => {
    const lines = ['SUPPLY LIST', `${lessonTitle} — ${lessonPassage}`, '', `${totalCount} items total | ${checkedCount} gathered | ${totalCount - checkedCount} remaining`, '']
    Object.entries(categorizedSupplies).forEach(([cat, items]) => {
      if (items.length === 0) return
      const config = CATEGORY_CONFIG[cat]
      lines.push(`${config.icon} ${config.label.toUpperCase()}`)
      lines.push('-'.repeat(20))
      items.forEach(item => {
        const check = item.checked ? '[X]' : '[ ]'
        lines.push(`${check} ${item.item}${item.quantity ? ` (Qty: ${item.quantity})` : ''}${item.notes ? ` — ${item.notes}` : ''}`)
      })
      lines.push('')
    })
    navigator.clipboard.writeText(lines.join('\n'))
  }, [categorizedSupplies, lessonTitle, lessonPassage, totalCount, checkedCount])

  // Empty state
  if (totalCount === 0 && !hasScanned) {
    return (
      <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 p-6">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-base mb-4">
          <Package className="w-5 h-5 text-[#D4A017]" /> Supply List
        </h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">No supplies detected for this lesson yet.</p>
          <p className="text-gray-500 dark:text-gray-500 text-xs mb-5 max-w-sm mx-auto">
            You can scan the lesson content to auto-detect materials, or add items manually.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={handleScan}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-100 transition-all duration-200"
            >
              <Search className="w-4 h-4" /> Scan Lesson for Supplies
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-md transition-all duration-200"
            >
              <Pencil className="w-4 h-4" /> Add Manually
            </button>
          </div>
        </div>
        {showAddForm && (
          <AddItemForm
            newItemName={newItemName}
            setNewItemName={setNewItemName}
            newItemCategory={newItemCategory}
            setNewItemCategory={setNewItemCategory}
            newItemQuantity={newItemQuantity}
            setNewItemQuantity={setNewItemQuantity}
            newItemNotes={newItemNotes}
            setNewItemNotes={setNewItemNotes}
            onAdd={addItem}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden">
      {/* Header */}
      <div className="px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-900/5 dark:to-orange-900/5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-base">
            <Package className="w-5 h-5 text-[#D4A017]" /> Supply List
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${checkedCount === totalCount && totalCount > 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
              {checkedCount}/{totalCount}
            </span>
          </h3>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
              title="Print supply list"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyList}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
              title="Copy to clipboard"
            >
              <ClipboardList className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-500 ${checkedCount === totalCount && totalCount > 0 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`}
            style={{ width: `${totalCount > 0 ? (checkedCount / totalCount) * 100 : 0}%` }}
          />
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-600 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Item
          </button>
          {!hasScanned && (
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900/30 transition-all disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  Scanning...
                </>
              ) : (
                <><Search className="w-3.5 h-3.5" /> Scan for More</>
              )}
            </button>
          )}
          <button
            onClick={checkedCount === totalCount ? uncheckAll : checkAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-600 transition-all"
          >
            {checkedCount === totalCount ? <><Square className="w-3.5 h-3.5" /> Uncheck All</> : <><CheckSquare className="w-3.5 h-3.5" /> Check All</>}
          </button>

          <div className="ml-auto flex items-center gap-1.5">
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="px-2 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.icon} {config.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowChecked(!showChecked)}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition-all ${showChecked ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600' : 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700'}`}
              title={showChecked ? 'Hide checked items' : 'Show checked items'}
            >
              {showChecked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <div className="px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 bg-blue-50/50 dark:bg-blue-900/5">
          <AddItemForm
            newItemName={newItemName}
            setNewItemName={setNewItemName}
            newItemCategory={newItemCategory}
            setNewItemCategory={setNewItemCategory}
            newItemQuantity={newItemQuantity}
            setNewItemQuantity={setNewItemQuantity}
            newItemNotes={newItemNotes}
            setNewItemNotes={setNewItemNotes}
            onAdd={addItem}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Scanned extras notification */}
      {hasScanned && scannedExtras.length > 0 && (
        <div className="px-5 sm:px-6 py-3 bg-emerald-50 dark:bg-emerald-900/10 border-b border-emerald-200/60 dark:border-emerald-800/40">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" /> Found {scannedExtras.length} additional {scannedExtras.length === 1 ? 'supply' : 'supplies'} mentioned in lesson content
          </p>
        </div>
      )}
      {hasScanned && scannedExtras.length === 0 && (
        <div className="px-5 sm:px-6 py-3 bg-gray-50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-700/50">
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <CheckSquare className="w-3.5 h-3.5 text-emerald-500" /> Scan complete — no additional supplies found beyond the listed materials.
          </p>
        </div>
      )}

      {/* Supply Items by Category */}
      <div className="px-5 sm:px-6 py-4 space-y-4" ref={printRef}>
        {Object.entries(categorizedSupplies).map(([cat, items]) => {
          if (items.length === 0) return null
          const config = CATEGORY_CONFIG[cat]
          return (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color}`}>
                  {config.icon} {config.label}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500">({items.length})</span>
              </div>
              <div className="space-y-1">
                {items.map(item => (
                  <SupplyItemRow
                    key={item.id}
                    item={item}
                    isEditing={editingId === item.id}
                    editValue={editValue}
                    editQuantity={editQuantity}
                    editNotes={editNotes}
                    onToggle={() => toggleCheck(item.id)}
                    onEdit={() => startEdit(item)}
                    onSaveEdit={saveEdit}
                    onCancelEdit={() => setEditingId(null)}
                    onRemove={() => removeItem(item.id)}
                    setEditValue={setEditValue}
                    setEditQuantity={setEditQuantity}
                    setEditNotes={setEditNotes}
                  />
                ))}
              </div>
            </div>
          )
        })}

        {filteredSupplies.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filterCategory !== 'all' ? `No ${CATEGORY_CONFIG[filterCategory]?.label.toLowerCase()} items found.` : 'No items to show.'}
            </p>
            {!showChecked && checkedCount > 0 && (
              <button onClick={() => setShowChecked(true)} className="text-xs text-amber-600 dark:text-amber-400 mt-2 hover:underline">
                Show {checkedCount} checked {checkedCount === 1 ? 'item' : 'items'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer with completion message */}
      {checkedCount === totalCount && totalCount > 0 && (
        <div className="px-5 sm:px-6 py-3 bg-green-50 dark:bg-green-900/10 border-t border-green-200/60 dark:border-green-800/40">
          <p className="text-sm font-semibold text-green-700 dark:text-green-300 text-center flex items-center justify-center gap-2">
            <PartyPopper className="w-4 h-4" /> All supplies gathered! You are ready to teach!
          </p>
        </div>
      )}
    </div>
  )
}

/* ─── Add Item Form ─── */
function AddItemForm({
  newItemName, setNewItemName,
  newItemCategory, setNewItemCategory,
  newItemQuantity, setNewItemQuantity,
  newItemNotes, setNewItemNotes,
  onAdd, onCancel,
}: {
  newItemName: string; setNewItemName: (v: string) => void
  newItemCategory: SupplyItem['category']; setNewItemCategory: (v: SupplyItem['category']) => void
  newItemQuantity: string; setNewItemQuantity: (v: string) => void
  newItemNotes: string; setNewItemNotes: (v: string) => void
  onAdd: () => void; onCancel: () => void
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Add New Supply</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={newItemName}
          onChange={e => setNewItemName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onAdd()}
          placeholder="Supply name (e.g., Colored markers)"
          className="flex-1 px-3 py-2 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-gray-400"
          autoFocus
        />
        <select
          value={newItemCategory}
          onChange={e => setNewItemCategory(e.target.value as SupplyItem['category'])}
          className="px-3 py-2 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.icon} {config.label}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={newItemQuantity}
          onChange={e => setNewItemQuantity(e.target.value)}
          placeholder="Quantity (optional, e.g., 12 sheets)"
          className="flex-1 px-3 py-2 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-gray-400"
        />
        <input
          type="text"
          value={newItemNotes}
          onChange={e => setNewItemNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="flex-1 px-3 py-2 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-gray-400"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={onAdd}
          disabled={!newItemName.trim()}
          className="px-4 py-2 rounded-lg text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Plus className="w-4 h-4" /> Add Supply
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

/* ─── Supply Item Row ─── */
function SupplyItemRow({
  item, isEditing, editValue, editQuantity, editNotes,
  onToggle, onEdit, onSaveEdit, onCancelEdit, onRemove,
  setEditValue, setEditQuantity, setEditNotes,
}: {
  item: SupplyItem
  isEditing: boolean
  editValue: string; editQuantity: string; editNotes: string
  onToggle: () => void; onEdit: () => void; onSaveEdit: () => void; onCancelEdit: () => void; onRemove: () => void
  setEditValue: (v: string) => void; setEditQuantity: (v: string) => void; setEditNotes: (v: string) => void
}) {
  if (isEditing) {
    return (
      <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/40 space-y-2">
        <input
          type="text"
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') onSaveEdit(); if (e.key === 'Escape') onCancelEdit() }}
          className="w-full px-3 py-1.5 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          autoFocus
        />
        <div className="flex gap-2">
          <input
            type="text"
            value={editQuantity}
            onChange={e => setEditQuantity(e.target.value)}
            placeholder="Quantity"
            className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400"
          />
          <input
            type="text"
            value={editNotes}
            onChange={e => setEditNotes(e.target.value)}
            placeholder="Notes"
            className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400"
          />
        </div>
        <div className="flex gap-1.5">
          <button onClick={onSaveEdit} className="px-3 py-1 rounded-md text-xs font-bold bg-blue-500 text-white hover:bg-blue-600 transition-all">Save</button>
          <button onClick={onCancelEdit} className="px-3 py-1 rounded-md text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div className={`group flex items-start gap-2.5 py-1.5 px-2 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/40 ${item.checked ? 'opacity-60' : ''}`}>
      <button
        onClick={onToggle}
        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all duration-200 mt-0.5 ${item.checked ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 dark:border-gray-600 hover:border-amber-400 dark:hover:border-amber-500'}`}
      >
        {item.checked && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-[13px] leading-snug transition-all duration-200 ${item.checked ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
            {item.item}
          </span>
          {item.source === 'auto-detected' && item.id.startsWith('scanned-') && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">SCANNED</span>
          )}
          {item.source === 'manual' && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">CUSTOM</span>
          )}
        </div>
        {(item.quantity || item.notes) && (
          <div className="flex items-center gap-2 mt-0.5">
            {item.quantity && <span className="text-[11px] text-gray-400 dark:text-gray-500">Qty: {item.quantity}</span>}
            {item.notes && <span className="text-[11px] text-gray-400 dark:text-gray-500 italic">{item.notes}</span>}
          </div>
        )}
      </div>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-1 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
          title="Edit"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={onRemove}
          className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          title="Remove"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

/* ─── Compact Supply List for Sidebar ─── */
export function SupplyListCompact({ materialsNeeded, sections }: { materialsNeeded: { item: string; category: string }[]; sections: { title: string; content: string; type: string }[] }) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())
  const [expanded, setExpanded] = useState(false)

  const toggleItem = (idx: number) => {
    setCheckedItems(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const categories = ['essential', 'activity', 'craft', 'optional']

  return (
    <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 p-5">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between mb-2">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
          <Package className="w-4 h-4 text-[#D4A017]" /> Supply List
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${checkedItems.size === materialsNeeded.length ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
            {checkedItems.size}/{materialsNeeded.length}
          </span>
        </h3>
        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-500 ${checkedItems.size === materialsNeeded.length && materialsNeeded.length > 0 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`}
          style={{ width: `${materialsNeeded.length > 0 ? (checkedItems.size / materialsNeeded.length) * 100 : 0}%` }}
        />
      </div>

      {expanded && (
        <div className="space-y-3">
          {categories.map(cat => {
            const items = materialsNeeded.map((m, i) => ({ ...m, globalIdx: i })).filter(m => m.category === cat)
            if (items.length === 0) return null
            const config = CATEGORY_CONFIG[cat]
            return (
              <div key={cat}>
                <p className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${config.color}`}>
                  {config.icon} {config.label}
                </p>
                <ul className="space-y-1">
                  {items.map(({ item, globalIdx }) => (
                    <li
                      key={globalIdx}
                      onClick={() => toggleItem(globalIdx)}
                      className="flex items-center gap-2.5 text-sm cursor-pointer group py-0.5"
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all duration-200 ${checkedItems.has(globalIdx) ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 dark:border-gray-600 group-hover:border-amber-400 dark:group-hover:border-amber-500'}`}>
                        {checkedItems.has(globalIdx) && (
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`transition-all duration-200 text-[13px] ${checkedItems.has(globalIdx) ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}

          {checkedItems.size === materialsNeeded.length && materialsNeeded.length > 0 && (
            <div className="text-center py-2">
              <p className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center justify-center gap-1.5">
                <PartyPopper className="w-3.5 h-3.5" /> All supplies ready!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
