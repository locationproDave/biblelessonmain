import { useState, useCallback } from 'react'
import { supplyAPI, type SupplyList as SupplyListType, type Supply } from '@/lib/api'
import { Pin, Palette, Gamepad2, Lightbulb, Laptop, Package, Search, Brain, Printer, RefreshCw, DollarSign, ShoppingCart, Repeat, PartyPopper, CheckSquare, Square } from 'lucide-react'

interface AISupplyListProps {
  lessonId: string
  lessonTitle: string
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  essential: { label: 'Essential', icon: <Pin className="w-4 h-4" />, color: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/30' },
  craft: { label: 'Craft', icon: <Palette className="w-4 h-4" />, color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  activity: { label: 'Activity', icon: <Gamepad2 className="w-4 h-4" />, color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  optional: { label: 'Optional', icon: <Lightbulb className="w-4 h-4" />, color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  technology: { label: 'Technology', icon: <Laptop className="w-4 h-4" />, color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-900/30' },
}

export function AISupplyList({ lessonId, lessonTitle }: AISupplyListProps) {
  const [supplyData, setSupplyData] = useState<SupplyListType | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const handleExtract = useCallback(async () => {
    setIsExtracting(true)
    setError(null)
    try {
      const data = await supplyAPI.extract(lessonId)
      setSupplyData(data)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to extract supply list. Please try again.')
    } finally {
      setIsExtracting(false)
    }
  }, [lessonId])

  const toggleItem = useCallback((itemKey: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev)
      if (next.has(itemKey)) next.delete(itemKey)
      else next.add(itemKey)
      return next
    })
  }, [])

  const checkAll = useCallback(() => {
    if (!supplyData) return
    const allKeys = supplyData.supplies.map((_, i) => `supply-${i}`)
    setCheckedItems(new Set(allKeys))
  }, [supplyData])

  const uncheckAll = useCallback(() => {
    setCheckedItems(new Set())
  }, [])

  // Print handler
  const handlePrint = useCallback(() => {
    if (!supplyData) return

    const groupedSupplies = supplyData.supplies.reduce((acc, s) => {
      const cat = s.category || 'essential'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(s)
      return acc
    }, {} as Record<string, Supply[]>)

    const printHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Supply List - ${lessonTitle}</title>
  <style>
    @media print { body { margin: 0; padding: 20px; } @page { margin: 0.75in; } }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; max-width: 700px; margin: 0 auto; padding: 20px; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    .subtitle { color: #6b7280; font-size: 12px; margin-bottom: 16px; }
    .summary { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; font-size: 12px; }
    .summary-item { background: #f3f4f6; padding: 4px 10px; border-radius: 6px; }
    .category { margin-bottom: 16px; }
    .cat-header { font-size: 13px; font-weight: 700; padding: 6px 10px; border-radius: 5px; margin-bottom: 6px; background: #f9fafb; }
    .item { display: flex; align-items: flex-start; gap: 8px; padding: 4px 10px; font-size: 13px; }
    .checkbox { width: 14px; height: 14px; border: 2px solid #d1d5db; border-radius: 3px; flex-shrink: 0; margin-top: 2px; }
    .checked .checkbox { background: #10b981; border-color: #10b981; }
    .item-name { flex: 1; }
    .item-meta { font-size: 11px; color: #9ca3af; }
    .footer { text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; }
    .shopping { margin-top: 16px; padding: 12px; background: #eff6ff; border-radius: 8px; }
    .shopping h3 { font-size: 13px; margin: 0 0 8px; color: #1d4ed8; }
    .shopping-list { display: flex; flex-wrap: wrap; gap: 6px; }
    .shopping-item { background: white; padding: 3px 8px; border-radius: 4px; font-size: 12px; border: 1px solid #bfdbfe; }
  </style>
</head>
<body>
  <h1>AI-Generated Supply List</h1>
  <p class="subtitle">${lessonTitle}</p>
  
  <div class="summary">
    <span class="summary-item">${supplyData.supplies.length} items</span>
    <span class="summary-item">Est. ${supplyData.totalEstimatedCost}</span>
    <span class="summary-item">⏱️ Prep: ${supplyData.prepTime}</span>
  </div>

  ${Object.entries(groupedSupplies).map(([cat, items]) => {
    const config = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.essential
    return `
      <div class="category">
        <div class="cat-header">${config.icon} ${config.label} (${items.length})</div>
        ${items.map((item, i) => {
          const key = `supply-${supplyData.supplies.indexOf(item)}`
          const isChecked = checkedItems.has(key)
          return `
            <div class="item ${isChecked ? 'checked' : ''}">
              <div class="checkbox"></div>
              <div class="item-name">
                ${item.item}
                ${item.quantity ? `<span class="item-meta"> — ${item.quantity}</span>` : ''}
                ${item.notes ? `<div class="item-meta">${item.notes}</div>` : ''}
              </div>
              <span class="item-meta">${item.estimatedCost}</span>
            </div>
          `
        }).join('')}
      </div>
    `
  }).join('')}

  ${supplyData.shoppingList.length > 0 ? `
    <div class="shopping">
      <h3>Shopping List</h3>
      <div class="shopping-list">
        ${supplyData.shoppingList.map(item => `<span class="shopping-item">${item}</span>`).join('')}
      </div>
    </div>
  ` : ''}

  <div class="footer">
    <p>Generated by Bible Lesson Planner AI</p>
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
  }, [supplyData, lessonTitle, checkedItems])

  // Initial state - not yet extracted
  if (!supplyData) {
    return (
      <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 p-6">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-base mb-4">
          <Package className="w-5 h-5" /> Supply List
        </h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Extract a detailed supply list using AI</p>
          <p className="text-gray-500 dark:text-gray-500 text-xs mb-5 max-w-sm mx-auto">
            Our AI analyzes the lesson content to generate a comprehensive supply list with quantities, cost estimates, and shopping suggestions.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/40 text-sm text-red-600 dark:text-red-400 max-w-sm mx-auto">
              {error}
            </div>
          )}

          <button
            onClick={handleExtract}
            disabled={isExtracting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-100 transition-all duration-200 disabled:opacity-50"
            data-testid="extract-supplies-btn"
          >
            {isExtracting ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing Lesson...
              </>
            ) : (
              <><Brain className="w-4 h-4" /> Extract Supply List</>
            )}
          </button>
        </div>
      </div>
    )
  }

  // Group supplies by category
  const groupedSupplies = supplyData.supplies.reduce((acc, s, idx) => {
    const cat = s.category || 'essential'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push({ ...s, idx })
    return acc
  }, {} as Record<string, (Supply & { idx: number })[]>)

  const filteredSupplies = filterCategory === 'all' 
    ? supplyData.supplies.map((s, idx) => ({ ...s, idx }))
    : (groupedSupplies[filterCategory] || [])

  const checkedCount = checkedItems.size
  const totalCount = supplyData.supplies.length

  return (
    <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden">
      {/* Header */}
      <div className="px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-900/5 dark:to-orange-900/5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-base">
            <Package className="w-5 h-5" /> Supply List
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
              onClick={handleExtract}
              disabled={isExtracting}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
              title="Regenerate supply list"
            >
              <RefreshCw className="w-4 h-4" />
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

        {/* Summary Stats */}
        <div className="flex flex-wrap items-center gap-3 text-xs mb-3">
          <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            <DollarSign className="w-4 h-4" /> Est. {supplyData.totalEstimatedCost}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            ⏱️ Prep: {supplyData.prepTime}
          </span>
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={checkedCount === totalCount ? uncheckAll : checkAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-600 transition-all"
          >
            {checkedCount === totalCount ? <><Square className="w-4 h-4" /> Uncheck All</> : <><CheckSquare className="w-4 h-4" /> Check All</>}
          </button>

          <div className="ml-auto">
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
          </div>
        </div>
      </div>

      {/* Supply Items */}
      <div className="px-5 sm:px-6 py-4 space-y-4">
        {filterCategory === 'all' ? (
          Object.entries(groupedSupplies).map(([cat, items]) => {
            const config = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.essential
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color}`}>
                    {config.icon} {config.label}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">({items.length})</span>
                </div>
                <div className="space-y-1">
                  {items.map((item) => (
                    <SupplyItemRow
                      key={item.idx}
                      item={item}
                      isChecked={checkedItems.has(`supply-${item.idx}`)}
                      onToggle={() => toggleItem(`supply-${item.idx}`)}
                    />
                  ))}
                </div>
              </div>
            )
          })
        ) : (
          <div className="space-y-1">
            {filteredSupplies.map((item) => (
              <SupplyItemRow
                key={item.idx}
                item={item}
                isChecked={checkedItems.has(`supply-${item.idx}`)}
                onToggle={() => toggleItem(`supply-${item.idx}`)}
              />
            ))}
          </div>
        )}

        {filteredSupplies.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">No items in this category.</p>
          </div>
        )}
      </div>

      {/* Shopping List */}
      {supplyData.shoppingList.length > 0 && (
        <div className="px-5 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-700/50 bg-blue-50/50 dark:bg-blue-900/5">
          <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" /> Shopping List
          </h4>
          <div className="flex flex-wrap gap-2">
            {supplyData.shoppingList.map((item, idx) => (
              <span key={idx} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-blue-200 dark:border-blue-800/40">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Substitutions */}
      {supplyData.substitutions.length > 0 && (
        <div className="px-5 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-700/50 bg-purple-50/50 dark:bg-purple-900/5">
          <h4 className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Repeat className="w-4 h-4" /> Substitutions
          </h4>
          <div className="space-y-2">
            {supplyData.substitutions.map((sub, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">{sub.original}</span>
                <span className="text-gray-400 dark:text-gray-500">→</span>
                <span className="text-purple-700 dark:text-purple-300 font-medium">{sub.alternative}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completion message */}
      {checkedCount === totalCount && totalCount > 0 && (
        <div className="px-5 sm:px-6 py-3 bg-green-50 dark:bg-green-900/10 border-t border-green-200/60 dark:border-green-800/40">
          <p className="text-sm font-semibold text-green-700 dark:text-green-300 text-center flex items-center justify-center gap-2">
            <PartyPopper className="w-4 h-4" /> All supplies gathered! You're ready to teach!
          </p>
        </div>
      )}
    </div>
  )
}

// Supply Item Row Component
function SupplyItemRow({
  item,
  isChecked,
  onToggle,
}: {
  item: Supply & { idx: number }
  isChecked: boolean
  onToggle: () => void
}) {
  return (
    <div className={`group flex items-start gap-2.5 py-2 px-2 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/40 ${isChecked ? 'opacity-60' : ''}`}>
      <button
        onClick={onToggle}
        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all duration-200 mt-0.5 ${isChecked ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 dark:border-gray-600 hover:border-amber-400 dark:hover:border-amber-500'}`}
      >
        {isChecked && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[13px] leading-snug transition-all duration-200 ${isChecked ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
            {item.item}
          </span>
          <span className="text-[11px] text-gray-400 dark:text-gray-500 flex-shrink-0">{item.estimatedCost}</span>
        </div>
        {(item.quantity || item.notes) && (
          <div className="flex items-center gap-2 mt-0.5">
            {item.quantity && <span className="text-[11px] text-gray-400 dark:text-gray-500">Qty: {item.quantity}</span>}
            {item.notes && <span className="text-[11px] text-gray-400 dark:text-gray-500 italic">{item.notes}</span>}
          </div>
        )}
      </div>
    </div>
  )
}

// Compact Button for Sidebar
export function AISupplyListCompactButton({ lessonId, onClick }: { lessonId: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200/60 dark:border-amber-700/40 hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-md transition-all group text-left"
      data-testid="ai-supply-list-compact-btn"
    >
      <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
        <Package className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-amber-700 dark:text-amber-300">AI Supply List</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Extract materials with AI</p>
      </div>
      <svg className="w-4 h-4 text-amber-400 group-hover:text-amber-600 dark:group-hover:text-amber-300 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}
