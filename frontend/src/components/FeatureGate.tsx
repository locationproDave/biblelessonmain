import { useState, useEffect, ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { subscriptionAPI } from '@/lib/api'
import { Lock, Crown, Sparkles, Loader2, ChevronRight } from 'lucide-react'

interface FeatureGateProps {
  featureName: string
  featureLabel: string
  children: ReactNode
  fallback?: ReactNode
}

interface FeatureAccess {
  hasAccess: boolean
  reason?: string
  upgradeRequired?: boolean
  suggestedPlan?: string
  addOn?: {
    id: string
    name: string
    price: number
    interval: string
    description: string
  }
  canPurchase?: boolean
  includedInPlan?: boolean
}

export function FeatureGate({ featureName, featureLabel, children, fallback }: FeatureGateProps) {
  const [access, setAccess] = useState<FeatureAccess | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setLoading(true)
        const result = await subscriptionAPI.checkFeatureAccess(featureName)
        setAccess(result)
      } catch {
        // If not authenticated, show locked state
        setAccess({ hasAccess: false, reason: 'not_authenticated' })
      } finally {
        setLoading(false)
      }
    }
    checkAccess()
  }, [featureName])

  const handlePurchaseAddOn = async () => {
    if (!access?.addOn?.id) return
    
    setPurchasing(true)
    setError(null)
    try {
      const result = await subscriptionAPI.purchaseAddOn(access.addOn.id)
      if (result.success) {
        // Refresh access check
        const refreshedAccess = await subscriptionAPI.checkFeatureAccess(featureName)
        setAccess(refreshedAccess)
      }
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to purchase add-on'
      setError(errorMsg)
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
      </div>
    )
  }

  if (access?.hasAccess) {
    return <>{children}</>
  }

  // Show locked/upgrade UI
  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-stone-50 to-amber-50/30 dark:from-stone-800/60 dark:to-amber-900/10 border border-stone-200 dark:border-stone-700 p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
        <Lock className="w-7 h-7 text-amber-600 dark:text-amber-400" />
      </div>
      
      <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
        {featureLabel}
      </h3>
      
      {access?.reason === 'not_authenticated' && (
        <>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
            Sign in to access this premium feature
          </p>
          <Link 
            to="/signin" 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Sign In <ChevronRight className="w-4 h-4" />
          </Link>
        </>
      )}
      
      {access?.reason === 'no_subscription' && (
        <>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
            Subscribe to a plan to unlock this feature
          </p>
          <Link 
            to="/pricing"
            search={{}}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            <Sparkles className="w-4 h-4" /> View Plans
          </Link>
        </>
      )}
      
      {access?.reason === 'upgrade_required' && (
        <>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-2">
            This feature is available on the <span className="font-semibold text-amber-600">Unlimited</span> plan
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500 mb-4">
            Includes unlimited lessons, Biblical Map Generator, Quiz Generator, and more
          </p>
          <Link 
            to="/pricing"
            search={{}}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Crown className="w-4 h-4" /> Upgrade to Unlimited
          </Link>
        </>
      )}
      
      {access?.reason === 'add_on_required' && access?.addOn && (
        <>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-2">
            Unlock this feature with the <span className="font-semibold text-amber-600">{access.addOn.name}</span> add-on
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500 mb-4">
            {access.addOn.description}
          </p>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 mb-4">
            <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">${access.addOn.price}</span>
            <span className="text-sm text-stone-500">/{access.addOn.interval}</span>
          </div>
          
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>
          )}
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handlePurchaseAddOn}
              disabled={purchasing}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              data-testid="purchase-addon-btn"
            >
              {purchasing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Add to My Plan
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// Compact version for tool buttons
export function FeatureGateButton({ 
  featureName, 
  featureLabel,
  onClick,
  icon: Icon,
  className = ''
}: { 
  featureName: string
  featureLabel: string
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  className?: string
}) {
  const [access, setAccess] = useState<FeatureAccess | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const result = await subscriptionAPI.checkFeatureAccess(featureName)
        setAccess(result)
      } catch {
        setAccess({ hasAccess: false, reason: 'not_authenticated' })
      } finally {
        setLoading(false)
      }
    }
    checkAccess()
  }, [featureName])

  const hasAccess = access?.hasAccess
  const isLocked = !hasAccess && !loading

  if (loading) {
    return (
      <button 
        disabled 
        className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-400 ${className}`}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">{featureLabel}</span>
      </button>
    )
  }

  if (isLocked) {
    return (
      <Link
        to="/pricing"
        className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-900/20 dark:hover:text-amber-400 transition-colors group ${className}`}
        title={`Upgrade to unlock ${featureLabel}`}
      >
        <Lock className="w-4 h-4 text-stone-400 group-hover:text-amber-600" />
        <span className="text-sm">{featureLabel}</span>
        <Crown className="w-3 h-3 text-amber-500 ml-auto" />
      </Link>
    )
  }

  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/40 transition-colors ${className}`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{featureLabel}</span>
    </button>
  )
}

export default FeatureGate
