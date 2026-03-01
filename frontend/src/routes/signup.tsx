import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useSession, useAuth } from '@/lib/auth-client'
import { useI18n } from '@/i18n'
import { BIBLE_VERSIONS } from '@/lib/bible-versions'
import { useMutation } from '@tanstack/react-query'
import { preferencesAPI } from '@/lib/api'
import { 
  BookOpen, Sparkles, User, CreditCard, PartyPopper, Lock, Loader2, 
  Check, Gift, LogIn, UserPlus, Users, Church, Building2, Crown,
  CheckCircle, Tag, ChevronRight
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL

// Types for pricing data
interface PricingPlan {
  id: string
  name: string
  price: number
  monthlyEquivalent?: number
  interval: string
  lessonsLimit: number
  description: string
  savings?: string
  features: {
    lessons: number | string
    quizzes: boolean
    supplyLists: boolean
    emailDelivery: boolean
    curriculumPlanner: boolean
    teamMembers: number
    priority: boolean
    classes?: string
    multiSite?: boolean
    dedicatedSupport?: boolean
  }
}

interface PricingData {
  individual: PricingPlan[]
  organization: PricingPlan[]
}

type SearchParams = {
  plan?: string
  billing?: string
  type?: string
}

export const Route = createFileRoute('/signup')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    plan: (search.plan as string) || undefined,
    billing: (search.billing as string) || undefined,
    type: (search.type as string) || undefined,
  }),
  component: SignUpPage,
})

function SignUpPage() {
  const { data: session, isPending } = useSession()
  const navigate = useNavigate()
  const { t } = useI18n()
  const auth = useAuth()
  const setUserBibleVersionMut = useMutation({
    mutationFn: preferencesAPI.setBibleVersion,
  })
  const search = Route.useSearch()

  // Multi-step state
  const [step, setStep] = useState<'type' | 'billing' | 'plan' | 'account' | 'checkout'>('type')
  const [planType, setPlanType] = useState<'individual' | 'organization'>('individual')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual')
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null)
  
  // Pricing data from API
  const [pricingData, setPricingData] = useState<PricingData | null>(null)
  const [loadingPlans, setLoadingPlans] = useState(false)

  // Account form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [bibleVersion, setBibleVersion] = useState('KJV')
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch pricing plans
  useEffect(() => {
    fetchPricingPlans()
  }, [billingCycle])

  // Handle URL params
  useEffect(() => {
    if (search.type === 'individual' || search.type === 'organization') {
      setPlanType(search.type)
      setStep('billing')
    }
    if (search.billing === 'monthly' || search.billing === 'annual') {
      setBillingCycle(search.billing)
    }
    if (search.plan && pricingData) {
      const plans = planType === 'individual' ? pricingData.individual : pricingData.organization
      const foundPlan = plans.find(p => p.id === search.plan)
      if (foundPlan) {
        setSelectedPlan(foundPlan)
        setStep('account')
      }
    }
  }, [search, pricingData, planType])

  const fetchPricingPlans = async () => {
    setLoadingPlans(true)
    try {
      const response = await fetch(`${API_URL}/pricing/plans?billing=${billingCycle}`)
      if (response.ok) {
        const data = await response.json()
        const plans = data.plans || {}
        const individualIds = data.individual || []
        const organizationIds = data.organization || []
        
        const filterByCycle = (ids: string[]) => 
          ids.filter(id => billingCycle === 'annual' ? id.endsWith('_annual') : !id.endsWith('_annual'))
        
        const transformedData: PricingData = {
          individual: filterByCycle(individualIds).map(id => plans[id]).filter(Boolean),
          organization: filterByCycle(organizationIds).map(id => plans[id]).filter(Boolean)
        }
        
        setPricingData(transformedData)
      }
    } catch (error) {
      console.error('Failed to fetch pricing plans:', error)
    } finally {
      setLoadingPlans(false)
    }
  }

  if (isPending) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#F9F7F1] dark:bg-[#1C1917]">
        <Loader2 className="w-10 h-10 text-amber-600 animate-spin" strokeWidth={1.5} />
      </div>
    )
  }

  if (session) {
    navigate({ to: '/lessons' })
    return null
  }

  const handleSelectType = (type: 'individual' | 'organization') => {
    setPlanType(type)
    setStep('billing')
  }

  const handleSelectBilling = (cycle: 'monthly' | 'annual') => {
    setBillingCycle(cycle)
    setStep('plan')
  }

  const handleSelectPlan = (plan: PricingPlan) => {
    setSelectedPlan(plan)
    setStep('account')
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    
    setCouponError('')
    try {
      const response = await fetch(`${API_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim().toUpperCase() })
      })
      const data = await response.json()
      
      if (data.valid) {
        setCouponApplied(true)
        setCouponError('')
      } else {
        setCouponError(data.message || 'Invalid coupon code')
        setCouponApplied(false)
      }
    } catch {
      setCouponError('Unable to validate coupon')
      setCouponApplied(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await auth.signUp(email, password, name)
      if (!result.success) {
        setError(result.error?.message || 'Sign up failed')
        setLoading(false)
        return
      }
      // Set the user's default Bible version
      try {
        await setUserBibleVersionMut.mutateAsync(bibleVersion)
      } catch (err) {
        console.error('Failed to set Bible version:', err)
      }
      // Move to checkout step
      setStep('checkout')
      setLoading(false)
    } catch (err: any) {
      setError(err.message || 'Sign up failed')
      setLoading(false)
    }
  }

  const handleGoToCheckout = () => {
    if (!selectedPlan) return
    const checkoutUrl = `${API_URL}/checkout/create-session`
    
    const token = localStorage.getItem('auth_token')
    fetch(checkoutUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        planId: selectedPlan.id,
        originUrl: window.location.origin,
      }),
    })
    .then(res => res.json())
    .then(data => {
      if (data.url) {
        window.location.href = data.url
      }
    })
    .catch(err => console.error('Checkout error:', err))
  }

  const handleSkipToFreeLesson = () => {
    navigate({ to: '/generate' })
  }

  const getPlanIcon = (planId: string) => {
    const baseId = planId.replace('_annual', '')
    switch (baseId) {
      case 'starter':
        return <Sparkles className="w-6 h-6" />
      case 'unlimited':
        return <Crown className="w-6 h-6" />
      case 'small_church':
        return <Church className="w-6 h-6" />
      case 'medium_church':
        return <Users className="w-6 h-6" />
      case 'large_church':
        return <Building2 className="w-6 h-6" />
      default:
        return <Sparkles className="w-6 h-6" />
    }
  }

  const isPopular = (planId: string) => {
    const baseId = planId.replace('_annual', '')
    return baseId === 'unlimited' || baseId === 'medium_church'
  }

  const currentPlans = planType === 'individual' ? pricingData?.individual : pricingData?.organization

  const getStepNumber = () => {
    switch (step) {
      case 'type': return 1
      case 'billing': return 2
      case 'plan': return 3
      case 'account': return 4
      case 'checkout': return 5
      default: return 1
    }
  }

  const stepLabels = ['Plan Type', 'Billing', 'Choose Plan', 'Account', 'Payment']

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 bg-[#F9F7F1] dark:bg-[#1C1917]">
      <div className="w-full max-w-4xl">
        {/* Sign In / Sign Up Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center p-1 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm">
            <Link
              to="/signin"
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-all"
              data-testid="switch-to-signin"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
            <div className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold bg-amber-600 text-white shadow-md">
              <UserPlus className="w-4 h-4" />
              Sign Up
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-1 mb-8 overflow-x-auto px-2">
          {stepLabels.map((label, i) => {
            const stepNum = i + 1
            const currentStep = getStepNumber()
            const isActive = stepNum === currentStep
            const isCompleted = stepNum < currentStep
            return (
              <div key={label} className="flex items-center">
                {i > 0 && (
                  <div className={`w-6 sm:w-10 h-0.5 rounded-full transition-all duration-300 ${
                    isCompleted ? 'bg-amber-600' : 'bg-stone-200 dark:bg-stone-700'
                  }`} />
                )}
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 scale-110'
                      : isCompleted
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" strokeWidth={2} /> : stepNum}
                  </div>
                  <span className={`text-[10px] sm:text-xs font-medium hidden sm:block whitespace-nowrap ${
                    isActive ? 'text-amber-700 dark:text-amber-500' : isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400'
                  }`}>
                    {label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Step 1: Choose Type (Individual or Organization) */}
        {step === 'type' && (
          <div className="animate-in fade-in duration-300">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
                First Lesson Free
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
                Who are you creating lessons for?
              </h1>
              <p className="text-stone-500 dark:text-stone-400 text-sm sm:text-base">
                Choose the option that best fits your needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Individual Card */}
              <button
                onClick={() => handleSelectType('individual')}
                className="group relative p-6 sm:p-8 rounded-2xl border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/50 hover:border-amber-400 dark:hover:border-amber-500 transition-all duration-300 hover:shadow-xl text-left"
                data-testid="select-individual"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-500 group-hover:scale-110 transition-transform">
                    <User className="w-7 h-7" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">Individual</h3>
                    <p className="text-sm text-stone-500 dark:text-stone-400">Personal use</p>
                  </div>
                </div>
                <p className="text-stone-600 dark:text-stone-300 mb-4">
                  Perfect for individual Sunday School teachers, homeschool parents, or small group leaders.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                    <Check className="w-4 h-4 text-emerald-500" /> Personal lesson library
                  </li>
                  <li className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                    <Check className="w-4 h-4 text-emerald-500" /> AI-powered generation
                  </li>
                  <li className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                    <Check className="w-4 h-4 text-emerald-500" /> Export & print lessons
                  </li>
                </ul>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-stone-500 dark:text-stone-400">Starting at $8.33/mo</span>
                  <ChevronRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Organization Card */}
              <button
                onClick={() => handleSelectType('organization')}
                className="group relative p-6 sm:p-8 rounded-2xl border-2 border-amber-400 dark:border-amber-500 bg-white dark:bg-stone-800/50 hover:border-amber-500 dark:hover:border-amber-400 transition-all duration-300 hover:shadow-xl text-left shadow-md"
                data-testid="select-organization"
              >
                <div className="absolute top-0 right-0 bg-amber-600 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg rounded-tr-xl">
                  Popular
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-500 group-hover:scale-110 transition-transform">
                    <Church className="w-7 h-7" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">Organization</h3>
                    <p className="text-sm text-stone-500 dark:text-stone-400">Churches & ministries</p>
                  </div>
                </div>
                <p className="text-stone-600 dark:text-stone-300 mb-4">
                  Ideal for churches with multiple classes, children's ministries, or organizations needing team access.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                    <Check className="w-4 h-4 text-emerald-500" /> Team collaboration
                  </li>
                  <li className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                    <Check className="w-4 h-4 text-emerald-500" /> Higher lesson limits
                  </li>
                  <li className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                    <Check className="w-4 h-4 text-emerald-500" /> Priority support
                  </li>
                </ul>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-stone-500 dark:text-stone-400">Starting at $25/mo</span>
                  <ChevronRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            <p className="text-center text-sm text-stone-500 dark:text-stone-400 mt-8">
              Already have an account?{' '}
              <Link to="/signin" className="text-amber-600 dark:text-amber-500 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        )}

        {/* Step 2: Choose Billing Cycle */}
        {step === 'billing' && (
          <div className="animate-in fade-in duration-300">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
                Choose Your Billing Cycle
              </h1>
              <p className="text-stone-500 dark:text-stone-400 text-sm sm:text-base">
                Save 17% with annual billing
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Monthly */}
              <button
                onClick={() => handleSelectBilling('monthly')}
                className="group p-6 sm:p-8 rounded-2xl border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/50 hover:border-amber-400 dark:hover:border-amber-500 transition-all duration-300 hover:shadow-xl text-left"
                data-testid="select-monthly"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">Monthly</h3>
                  <CreditCard className="w-6 h-6 text-stone-400" />
                </div>
                <p className="text-stone-600 dark:text-stone-300 mb-4">
                  Pay month-to-month with flexibility to cancel anytime.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-500 dark:text-stone-400">Billed monthly</span>
                  <ChevronRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Annual */}
              <button
                onClick={() => handleSelectBilling('annual')}
                className="group relative p-6 sm:p-8 rounded-2xl border-2 border-amber-400 dark:border-amber-500 bg-white dark:bg-stone-800/50 hover:border-amber-500 dark:hover:border-amber-400 transition-all duration-300 hover:shadow-xl text-left shadow-md"
                data-testid="select-annual"
              >
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg rounded-tr-xl">
                  Save 17%
                </div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">Annual</h3>
                  <CreditCard className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-stone-600 dark:text-stone-300 mb-4">
                  Best value! Save 2 months worth with annual billing.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Like getting 2 months free!</span>
                  <ChevronRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            <button
              onClick={() => setStep('type')}
              className="mt-6 mx-auto block text-sm text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
            >
              ← Back to plan type
            </button>
          </div>
        )}

        {/* Step 3: Choose Plan */}
        {step === 'plan' && (
          <div className="animate-in fade-in duration-300">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs font-semibold uppercase tracking-wider mb-3">
                {planType === 'individual' ? <User className="w-3 h-3" /> : <Church className="w-3 h-3" />}
                {planType === 'individual' ? 'Individual Plans' : 'Organization Plans'}
                <span className="mx-1">•</span>
                {billingCycle === 'annual' ? 'Annual Billing' : 'Monthly Billing'}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
                Choose Your Plan
              </h1>
              <p className="text-stone-500 dark:text-stone-400 text-sm sm:text-base">
                Select the plan that fits your needs
              </p>
            </div>

            {loadingPlans ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" strokeWidth={1.5} />
              </div>
            ) : (
              <div className={`grid gap-5 ${
                planType === 'individual' ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto' : 'grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto'
              }`}>
                {currentPlans?.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => handleSelectPlan(plan)}
                    data-testid={`plan-card-${plan.id}`}
                    className={`relative flex flex-col rounded-2xl border bg-white dark:bg-stone-800/50 overflow-hidden transition-all hover:shadow-lg text-left ${
                      isPopular(plan.id)
                        ? 'border-amber-400 dark:border-amber-600 shadow-md'
                        : 'border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    {isPopular(plan.id) && (
                      <div className="absolute top-0 right-0 bg-amber-600 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                        Popular
                      </div>
                    )}

                    <div className="p-5 pb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-xl ${
                          isPopular(plan.id)
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500'
                            : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400'
                        }`}>
                          {getPlanIcon(plan.id)}
                        </div>
                        <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">{plan.name}</h3>
                      </div>

                      <p className="text-sm text-stone-500 dark:text-stone-400 mb-4 min-h-[40px]">{plan.description}</p>

                      <div className="mb-4">
                        {String(plan.price) === 'contact' ? (
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">Contact Us</span>
                          </div>
                        ) : plan.monthlyEquivalent ? (
                          <>
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-bold text-stone-900 dark:text-stone-100">${plan.monthlyEquivalent.toFixed(2)}</span>
                              <span className="text-stone-500 dark:text-stone-400 text-sm">/month</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-stone-400">${plan.price}/year</span>
                              {plan.savings && (
                                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-md">
                                  {plan.savings}
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-stone-900 dark:text-stone-100">${plan.price}</span>
                            <span className="text-stone-500 dark:text-stone-400 text-sm">/{plan.interval}</span>
                          </div>
                        )}
                      </div>

                      <div className={`w-full py-2.5 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                        isPopular(plan.id)
                          ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md'
                          : 'bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900'
                      }`}>
                        {String(plan.price) === 'contact' ? 'Contact Sales' : 'Select Plan'}
                      </div>
                    </div>

                    <div className="border-t border-stone-100 dark:border-stone-700 p-5 pt-4 flex-grow bg-stone-50/50 dark:bg-stone-800/30">
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Includes</p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                          <span className="text-sm text-stone-600 dark:text-stone-400">
                            {typeof plan.features.lessons === 'number'
                              ? `${plan.features.lessons} lessons/month`
                              : `${plan.features.lessons} lessons`}
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          {plan.features.supplyLists ? (
                            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                          ) : (
                            <span className="w-4 h-4 text-stone-300 flex-shrink-0 mt-0.5">✗</span>
                          )}
                          <span className="text-sm text-stone-600 dark:text-stone-400">Supply List Extractor</span>
                        </li>
                        <li className="flex items-start gap-2">
                          {plan.features.emailDelivery ? (
                            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                          ) : (
                            <span className="w-4 h-4 text-stone-300 flex-shrink-0 mt-0.5">✗</span>
                          )}
                          <span className="text-sm text-stone-600 dark:text-stone-400">Email Delivery</span>
                        </li>
                        <li className="flex items-start gap-2">
                          {(plan.features as any).quizGenerator ? (
                            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                          ) : (
                            <span className="w-4 h-4 text-stone-300 flex-shrink-0 mt-0.5">✗</span>
                          )}
                          <span className={`text-sm ${(plan.features as any).quizGenerator ? 'text-stone-600 dark:text-stone-400' : 'text-stone-400 dark:text-stone-500'}`}>Quiz Generator</span>
                        </li>
                        {!(plan.features as any).quizGenerator && planType === 'organization' && !plan.id.includes('enterprise') && (
                          <li className="flex items-start gap-2 -mt-1 ml-6">
                            <span className="text-xs text-amber-600 font-medium">+${plan.id.includes('team') ? '2.99' : '4.99'}/mo add-on</span>
                          </li>
                        )}
                        <li className="flex items-start gap-2">
                          {plan.features.curriculumPlanner ? (
                            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                          ) : (
                            <span className="w-4 h-4 text-stone-300 flex-shrink-0 mt-0.5">✗</span>
                          )}
                          <span className={`text-sm ${plan.features.curriculumPlanner ? 'text-stone-600 dark:text-stone-400' : 'text-stone-400 dark:text-stone-500'}`}>Curriculum Planner</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                          <span className="text-sm text-stone-600 dark:text-stone-400">
                            {plan.features.teamMembers} team member{plan.features.teamMembers > 1 ? 's' : ''}
                          </span>
                        </li>
                        {plan.features.priority && (
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                            <span className="text-sm text-stone-600 dark:text-stone-400">Priority Processing</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setStep('billing')}
              className="mt-6 mx-auto block text-sm text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
            >
              ← Back to billing options
            </button>
          </div>
        )}

        {/* Step 4: Create Account */}
        {step === 'account' && selectedPlan && (
          <div className="animate-in fade-in duration-300 max-w-xl mx-auto">
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <User className="w-7 h-7 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Text, serif' }}>
                {t('auth.createAccount')}
              </h1>
              <p className="text-stone-500 dark:text-stone-400 mt-1 text-sm">{t('auth.signUpDesc')}</p>
            </div>

            {/* Selected Plan Summary */}
            <div className="mb-6 p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  isPopular(selectedPlan.id)
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500'
                    : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400'
                }`}>
                  {getPlanIcon(selectedPlan.id)}
                </div>
                <div>
                  <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm">{selectedPlan.name} Plan</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    ${selectedPlan.monthlyEquivalent?.toFixed(2) || selectedPlan.price}/mo
                    {billingCycle === 'annual' && ` ($${selectedPlan.price}/yr)`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStep('plan')}
                className="text-xs text-amber-600 hover:underline font-medium"
              >
                Change
              </button>
            </div>

            <div className="bg-white dark:bg-stone-800/50 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 p-6 sm:p-8">
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl text-red-700 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">{t('auth.name')}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                    placeholder={t('auth.namePlaceholder')}
                    data-testid="signup-name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">{t('auth.email')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                    placeholder={t('auth.emailPlaceholder')}
                    data-testid="signup-email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">{t('auth.password')}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                    placeholder={t('auth.passwordPlaceholder')}
                    data-testid="signup-password"
                  />
                  <p className="text-xs text-stone-400 mt-1">{t('auth.minPassword')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Default Bible Version</label>
                  <select
                    value={bibleVersion}
                    onChange={(e) => setBibleVersion(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                  >
                    {BIBLE_VERSIONS.map((version) => (
                      <option key={version.id} value={version.id}>
                        {version.name} ({version.abbr})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Coupon Code Field */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-600" />
                    Coupon Code (Optional)
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase())
                          setCouponApplied(false)
                          setCouponError('')
                        }}
                        disabled={couponApplied}
                        className={`w-full px-4 py-3 rounded-xl border ${
                          couponApplied 
                            ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' 
                            : couponError 
                              ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
                              : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800'
                        } text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all uppercase`}
                        placeholder="Enter coupon code"
                        data-testid="coupon-code-input"
                      />
                      {couponApplied && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponApplied || !couponCode.trim()}
                      className={`px-5 py-3 rounded-xl font-semibold transition-all ${
                        couponApplied
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 cursor-default'
                          : 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                      data-testid="apply-coupon-btn"
                    >
                      {couponApplied ? 'Applied!' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                  {couponApplied && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Coupon applied successfully!
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  data-testid="create-account-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('auth.creatingAccount')}
                    </>
                  ) : (
                    <>
                      Create Account & Continue
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-stone-500 dark:text-stone-400 mt-6">
                Already have an account?{' '}
                <Link to="/signin" className="text-amber-600 dark:text-amber-500 hover:underline font-medium">
                  {t('nav.signIn')}
                </Link>
              </p>
            </div>

            <button
              onClick={() => setStep('plan')}
              className="mt-4 mx-auto block text-sm text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
            >
              ← Back to plans
            </button>
          </div>
        )}

        {/* Step 5: Checkout */}
        {step === 'checkout' && selectedPlan && (
          <div className="animate-in fade-in duration-300 max-w-xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <PartyPopper className="w-10 h-10 text-emerald-600" strokeWidth={1.5} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Text, serif' }}>
                Account Created!
              </h1>
              <p className="text-stone-500 dark:text-stone-400 mt-2">
                Welcome, {name}! You're almost ready to start creating lessons.
              </p>
            </div>

            <div className="bg-white dark:bg-stone-800/50 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 p-6 sm:p-8">
              {/* Free Lesson Offer */}
              <div className="mb-6 p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-800/40">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-200 dark:bg-emerald-800/40 flex items-center justify-center flex-shrink-0">
                    <Gift className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 mb-1">Create Your First Lesson Free!</h3>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                      Try out our AI lesson generator before completing your subscription. No payment required for your first lesson.
                    </p>
                  </div>
                </div>
              </div>

              {/* Plan Summary */}
              <div className="mb-6 p-5 rounded-xl bg-stone-50 dark:bg-stone-800/30 border border-stone-200 dark:border-stone-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                    isPopular(selectedPlan.id)
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500'
                      : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400'
                  }`}>
                    {getPlanIcon(selectedPlan.id)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">{selectedPlan.name} Plan</h3>
                    <p className="text-sm text-stone-500 dark:text-stone-400 capitalize">{billingCycle} billing</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-extrabold text-stone-900 dark:text-stone-100">
                    ${selectedPlan.monthlyEquivalent?.toFixed(2) || selectedPlan.price}
                  </span>
                  <span className="text-sm text-stone-500 dark:text-stone-400">/month</span>
                </div>
                {billingCycle === 'annual' && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    ${selectedPlan.price} billed annually — Save {selectedPlan.savings?.replace('Save ', '')}!
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleSkipToFreeLesson}
                  className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                  data-testid="create-free-lesson-btn"
                >
                  <Sparkles className="w-5 h-5" />
                  Create My Free Lesson First
                </button>

                <button
                  onClick={handleGoToCheckout}
                  className="w-full py-4 px-6 bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                  data-testid="go-to-checkout-btn"
                >
                  <CreditCard className="w-5 h-5" />
                  Complete Payment — ${billingCycle === 'annual' ? selectedPlan.price.toFixed(2) : selectedPlan.price}/{billingCycle === 'annual' ? 'yr' : 'mo'}
                </button>
              </div>

              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-stone-500 dark:text-stone-400">
                <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Secure checkout</span>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
