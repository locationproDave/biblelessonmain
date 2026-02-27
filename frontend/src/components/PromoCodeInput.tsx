import { useState } from 'react'
import { promoAPI } from '@/lib/api'
import { Check } from 'lucide-react'

interface PromoCodeInputProps {
  planId: string
  onApply: (discountPercent: number, code: string) => void
}

export function PromoCodeInput({ planId, onApply }: PromoCodeInputProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ valid: boolean; message: string; discountPercent?: number } | null>(null)

  const handleValidate = async () => {
    if (!code.trim()) return
    
    setLoading(true)
    try {
      const response = await promoAPI.validate(code.trim(), planId)
      setResult(response)
      
      if (response.valid && response.discountPercent) {
        onApply(response.discountPercent, code.trim().toUpperCase())
      }
    } catch (err) {
      setResult({ valid: false, message: 'Failed to validate code' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              setResult(null)
            }}
            placeholder="Promo code"
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCC8] dark:border-[#334155] bg-white dark:bg-[#1E3A5F]/20 text-[#333333] dark:text-white placeholder-[#9CA3AF] text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017] transition-all"
            data-testid="promo-code-input"
          />
          {result?.valid && (
            <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
          )}
        </div>
        <button
          onClick={handleValidate}
          disabled={!code.trim() || loading || result?.valid}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#1E3A5F] dark:bg-[#D4A017] text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="apply-promo-btn"
        >
          {loading ? '...' : result?.valid ? 'Applied' : 'Apply'}
        </button>
      </div>
      
      {result && (
        <p className={`mt-2 text-xs font-medium ${
          result.valid 
            ? 'text-emerald-600 dark:text-emerald-400' 
            : 'text-red-600 dark:text-red-400'
        }`}>
          {result.message}
        </p>
      )}
    </div>
  )
}
