import { createFileRoute, Link, useSearch } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useSession } from '@/lib/auth-client'
import { useSEO, trackPageView } from '@/lib/seo'
import { Check, X, Church, Users, Building2, Sparkles, Crown, Loader2 } from 'lucide-react'
import { useI18n } from '@/i18n'

const API_URL = import.meta.env.VITE_API_URL

export const Route = createFileRoute('/pricing')({
  component: PricingPage,
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: search.session_id as string | undefined,
    success: search.success as string | undefined,
    canceled: search.canceled as string | undefined,
  }),
})

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

const featureLabels: Record<string, string> = {
  lessons: 'Lessons per month',
  quizzes: 'AI Quiz Generation',
  supplyLists: 'Supply List Extractor',
  emailDelivery: 'Email Delivery',
  curriculumPlanner: 'Curriculum Planner',
  teamMembers: 'Team Members',
  priority: 'Priority Processing',
  classes: 'Classes Supported',
  multiSite: 'Multi-Site Support',
  dedicatedSupport: 'Dedicated Support',
}

function PricingPage() {
  const { t } = useI18n()
  const [pricingData, setPricingData] = useState<PricingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'individual' | 'organization'>('individual')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'canceled' | null>(null)
  const { data: session } = useSession()
  const search = useSearch({ from: '/pricing' })

  // FAQ data with translation keys
  const faqs = [
    { qKey: 'pricing.faq.tryFree.q', aKey: 'pricing.faq.tryFree.a' },
    { qKey: 'pricing.faq.annualBenefit.q', aKey: 'pricing.faq.annualBenefit.a' },
    { qKey: 'pricing.faq.translations.q', aKey: 'pricing.faq.translations.a' },
    { qKey: 'pricing.faq.cancel.q', aKey: 'pricing.faq.cancel.a' },
    { qKey: 'pricing.faq.ageGroups.q', aKey: 'pricing.faq.ageGroups.a' },
    { qKey: 'pricing.faq.orgPricing.q', aKey: 'pricing.faq.orgPricing.a' },
    { qKey: 'pricing.faq.lessonIncludes.q', aKey: 'pricing.faq.lessonIncludes.a' },
  ]

  // SEO optimization
  useSEO({
    title: 'Pricing Plans | Bible Lesson Planner - From $8.33/month',
    description: 'Affordable Sunday school curriculum plans for individuals & churches. First lesson FREE. Starting at $8.33/month. Save 17% with annual billing. No credit card required.',
    keywords: 'Sunday school curriculum pricing, church lesson plans cost, Bible lesson subscription, children\'s ministry budget, affordable curriculum',
  })

  useEffect(() => {
    trackPageView('/pricing', 'Pricing Plans')
  }, [])

  useEffect(() => {
    fetchPricingPlans()
  }, [billingCycle])

  useEffect(() => {
    // Check for payment status from URL
    if (search.success === 'true' && search.session_id) {
      checkPaymentStatus(search.session_id)
    } else if (search.canceled === 'true') {
      setPaymentStatus('canceled')
    }
  }, [search])

  const fetchPricingPlans = async () => {
    try {
      const response = await fetch(`${API_URL}/pricing/plans?billing=${billingCycle}`)
      if (response.ok) {
        const data = await response.json()
        // Transform the API response to match expected format
        const plans = data.plans || {}
        const individualIds = data.individual || []
        const organizationIds = data.organization || []
        
        // Filter plans based on billing cycle
        const suffix = billingCycle === 'annual' ? '_annual' : ''
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
      setLoading(false)
    }
  }

  const checkPaymentStatus = async (sessionId: string) => {
    try {
      const response = await fetch(`${API_URL}/checkout/status/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.paymentStatus === 'paid') {
          setPaymentStatus('success')
        }
      }
    } catch (error) {
      console.error('Failed to check payment status:', error)
    }
  }

  const handleCheckout = async (planId: string) => {
    setCheckoutLoading(planId)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_URL}/checkout/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          planId,
          originUrl: window.location.origin,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        window.location.href = data.url
      } else {
        console.error('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setCheckoutLoading(null)
    }
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
      case 'enterprise':
        return <Building2 className="w-6 h-6" />
      default:
        return <Sparkles className="w-6 h-6" />
    }
  }

  const isPopular = (planId: string) => {
    const baseId = planId.replace('_annual', '')
    return baseId === 'unlimited' || baseId === 'medium_church'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" strokeWidth={1.5} />
      </div>
    )
  }

  const currentPlans = activeTab === 'individual' ? pricingData?.individual : pricingData?.organization

  return (
    <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917]">
      {/* Payment Status Banners */}
      {paymentStatus === 'success' && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-800/40">
          <div className="max-w-5xl mx-auto px-4 py-4 text-center">
            <p className="text-emerald-700 dark:text-emerald-300 font-semibold">
              {t('pricing.paymentSuccess')}
            </p>
            <Link to="/generate" className="text-emerald-600 dark:text-emerald-400 underline text-sm">
              {t('pricing.startCreating')}
            </Link>
          </div>
        </div>
      )}
      {paymentStatus === 'canceled' && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800/40">
          <div className="max-w-5xl mx-auto px-4 py-4 text-center">
            <p className="text-amber-700 dark:text-amber-300 font-semibold">
              {t('pricing.paymentCanceled')}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            {t('pricing.firstLessonFree')}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-50 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
            {t('pricing.title')}
          </h1>
          <p className="text-base text-stone-500 dark:text-stone-400 max-w-xl mx-auto">
            {t('pricing.subtitle')}
          </p>
        </div>

        {/* Toggles */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
            <button
              onClick={() => setActiveTab('individual')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'individual'
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
              data-testid="individual-tab"
            >
              <Users className="w-4 h-4" strokeWidth={1.5} /> {t('pricing.individual')}
            </button>
            <button
              onClick={() => setActiveTab('organization')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'organization'
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
              data-testid="organization-tab"
            >
              <Church className="w-4 h-4" strokeWidth={1.5} /> {t('pricing.organization')}
            </button>
          </div>

          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
              data-testid="monthly-billing-toggle"
            >
              {t('pricing.monthly')}
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                billingCycle === 'annual'
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
              data-testid="annual-billing-toggle"
            >
              {t('pricing.annual')}
              <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-md">
                {t('pricing.save17')}
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className={`grid gap-5 mb-16 items-stretch ${
          activeTab === 'individual' ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
        }`}>
          {currentPlans?.map((plan) => (
            <div
              key={plan.id}
              data-testid={`plan-card-${plan.id}`}
              className={`relative flex flex-col rounded-2xl border bg-white dark:bg-stone-800/50 overflow-hidden transition-all hover:shadow-lg h-full ${
                isPopular(plan.id)
                  ? 'border-amber-400 dark:border-amber-600 shadow-md'
                  : 'border-stone-200 dark:border-stone-700'
              }`}
            >
              {isPopular(plan.id) && (
                <div className="absolute top-0 right-0 bg-amber-600 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                  {t('pricing.popular')}
                </div>
              )}

              <div className="p-5 pb-4 flex-shrink-0">
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

                {String(plan.price) === 'contact' ? (
                  <Link
                    to="/contact"
                    className="w-full py-2.5 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900"
                  >
                    Contact Sales
                  </Link>
                ) : (
                  <button
                    onClick={() => handleCheckout(plan.id)}
                    disabled={checkoutLoading === plan.id}
                    data-testid={`checkout-btn-${plan.id}`}
                    className={`w-full py-2.5 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      isPopular(plan.id)
                        ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md'
                        : 'bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900'
                    } disabled:opacity-50`}
                  >
                    {checkoutLoading === plan.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                        {t('pricing.processing')}
                      </>
                    ) : (
                      t('pricing.getStarted')
                    )}
                  </button>
                )}
              </div>

              <div className="border-t border-stone-100 dark:border-stone-700 p-5 pt-4 flex-grow bg-stone-50/50 dark:bg-stone-800/30">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">{t('pricing.includes')}</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-stone-600 dark:text-stone-400">
                      {typeof plan.features.lessons === 'number'
                        ? `${plan.features.lessons} ${t('pricing.lessonsPerMonth')}`
                        : `${plan.features.lessons} ${t('pricing.lessons')}`}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    {plan.features.quizzes ? (
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    ) : (
                      <X className="w-4 h-4 text-stone-300 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    )}
                    <span className="text-sm text-stone-600 dark:text-stone-400">{t('pricing.aiQuizGeneration')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    {plan.features.supplyLists ? (
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    ) : (
                      <X className="w-4 h-4 text-stone-300 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    )}
                    <span className="text-sm text-stone-600 dark:text-stone-400">{t('pricing.supplyListExtractor')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    {plan.features.emailDelivery ? (
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    ) : (
                      <X className="w-4 h-4 text-stone-300 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    )}
                    <span className="text-sm text-stone-600 dark:text-stone-400">{t('pricing.emailDelivery')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    {plan.features.curriculumPlanner ? (
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    ) : (
                      <X className="w-4 h-4 text-stone-300 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    )}
                    <span className="text-sm text-stone-600 dark:text-stone-400">{t('pricing.curriculumPlanner')}</span>
                  </li>
                  {plan.features.biblicalMapQuiz && (
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="text-sm text-stone-600 dark:text-stone-400">Biblical Map & Quiz Generator</span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm text-stone-600 dark:text-stone-400">
                      {plan.features.teamMembers} {plan.features.teamMembers > 1 ? t('pricing.teamMembers') : t('pricing.teamMember')}
                    </span>
                  </li>
                  {plan.features.priority && (
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="text-sm text-stone-600 dark:text-stone-400">{t('pricing.priorityProcessing')}</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section - Enhanced Typography */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-stone-900 dark:text-stone-100 mb-10" style={{ fontFamily: 'Crimson Text, serif' }}>
            {t('pricing.faqTitle')}
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
                  data-testid={`faq-${index}`}
                >
                  <span className="font-semibold text-stone-900 dark:text-stone-100 text-base lg:text-lg" style={{ fontFamily: 'Crimson Text, serif' }}>{t(faq.qKey)}</span>
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-700 flex items-center justify-center transform transition-transform duration-300 ${openFaq === index ? 'rotate-180 bg-amber-100 dark:bg-amber-900/30' : ''}`}>
                    <svg className={`w-5 h-5 ${openFaq === index ? 'text-amber-600' : 'text-stone-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5 pt-0">
                    <p className="text-base text-stone-600 dark:text-stone-400 leading-relaxed">{t(faq.aKey)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="pt-10 border-t border-stone-200 dark:border-stone-700 text-center">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3" style={{ fontFamily: 'Crimson Text, serif' }}>
            {t('pricing.readyToTransform')}
          </h2>
          <p className="text-stone-500 dark:text-stone-400 mb-6">
            {t('pricing.startFreeLesson')}
          </p>
          <Link
            to="/generate"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
            data-testid="cta-generate"
          >
            <Sparkles className="w-5 h-5" strokeWidth={1.5} />
            {t('pricing.createFirstLesson')}
          </Link>
        </div>
      </div>
    </div>
  )
}
