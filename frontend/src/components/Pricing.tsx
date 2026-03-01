import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useSession } from '@/lib/auth-client'
import { BookOpen, Sparkles, Lock, RotateCcw, CreditCard, Star, Check, Users, Building2, GraduationCap, Church } from 'lucide-react'

// Stripe Price IDs - TODO: Update with actual Stripe price IDs
const PRICE_IDS = {
  starter_monthly: 'price_starter_monthly',
  starter_annual: 'price_starter_annual',
  unlimited_monthly: 'price_unlimited_monthly',
  unlimited_annual: 'price_unlimited_annual',
  team_monthly: 'price_team_monthly',
  team_annual: 'price_team_annual',
  ministry_monthly: 'price_ministry_monthly',
  ministry_annual: 'price_ministry_annual',
  church_monthly: 'price_church_monthly',
  church_annual: 'price_church_annual',
  school_monthly: 'price_school_monthly',
  school_annual: 'price_school_annual',
  org_unlimited_monthly: 'price_org_unlimited_monthly',
  org_unlimited_annual: 'price_org_unlimited_annual',
}

const individualPlans = [
  {
    name: 'Starter',
    icon: <BookOpen className="w-5 h-5 text-white" />,
    monthlyPrice: 5.99,
    yearlyPrice: 65,
    monthlyPriceId: PRICE_IDS.starter_monthly,
    yearlyPriceId: PRICE_IDS.starter_annual,
    description: 'Perfect for individual teachers getting started.',
    features: [
      { text: '4 lessons per month', included: true },
      { text: 'All 66 books of the Bible', included: true },
      { text: '20+ Bible translations', included: true },
      { text: 'PDF export & printing', included: true },
      { text: 'Age-appropriate activities', included: true },
      { text: 'Unlimited lessons', included: false },
      { text: 'Priority processing', included: false },
    ],
    gradient: 'from-[#1E3A5F] to-[#B8890F]',
    popular: false,
  },
  {
    name: 'Unlimited',
    icon: <Sparkles className="w-5 h-5 text-white" />,
    monthlyPrice: 9.99,
    yearlyPrice: 99,
    monthlyPriceId: PRICE_IDS.unlimited_monthly,
    yearlyPriceId: PRICE_IDS.unlimited_annual,
    description: 'For dedicated teachers who need unlimited access.',
    features: [
      { text: 'Unlimited lessons', included: true },
      { text: 'All 66 books of the Bible', included: true },
      { text: '20+ Bible translations', included: true },
      { text: 'PDF export & printing', included: true },
      { text: 'Age-appropriate activities', included: true },
      { text: 'Priority processing', included: true },
      { text: 'Early access to new features', included: true },
    ],
    gradient: 'from-[#D4A017] to-[#B8860B]',
    popular: true,
  },
]

const orgPlans = [
  {
    name: 'Team',
    icon: <Users className="w-5 h-5 text-white" />,
    seats: 3,
    lessonsPerMonth: 12,
    monthlyPrice: 14.99,
    yearlyPrice: 162,
    monthlyPriceId: PRICE_IDS.team_monthly,
    yearlyPriceId: PRICE_IDS.team_annual,
    description: 'Small groups and teaching teams.',
    gradient: 'from-[#3B82F6] to-[#1D4ED8]',
    popular: false,
    contactUs: false,
  },
  {
    name: 'Ministry',
    icon: <Church className="w-5 h-5 text-white" />,
    seats: 6,
    lessonsPerMonth: 24,
    monthlyPrice: 29.99,
    yearlyPrice: 324,
    monthlyPriceId: PRICE_IDS.ministry_monthly,
    yearlyPriceId: PRICE_IDS.ministry_annual,
    description: 'Growing ministries and churches.',
    gradient: 'from-[#8B5CF6] to-[#6D28D9]',
    popular: true,
    contactUs: false,
  },
  {
    name: 'Enterprise',
    icon: <Building2 className="w-5 h-5 text-white" />,
    seats: '∞',
    lessonsPerMonth: 'Unlimited',
    monthlyPrice: null,
    yearlyPrice: null,
    monthlyPriceId: null,
    yearlyPriceId: null,
    description: 'Schools, school districts, and large church organizations.',
    gradient: 'from-[#D4A017] to-[#B8860B]',
    popular: false,
    contactUs: true,
  },
]

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true)
  const [showOrg, setShowOrg] = useState(false)
  const { data: session } = useSession()

  const getCheckoutUrl = (priceId: string) => {
    return `${import.meta.env.VITE_CONVEX_SITE_URL}/stripe/checkout?priceId=${priceId}&origin=${encodeURIComponent(window.location.origin)}`
  }

  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-[#F5F8FC] dark:bg-[#1E3A5F]/40 text-[#1E3A5F] dark:text-[#D4A017] text-xs font-bold uppercase tracking-wider mb-3">
            <CreditCard className="w-3.5 h-3.5 inline mr-1.5" />Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#333333] dark:text-white">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#6B7280] dark:text-[#94A3B8] max-w-2xl mx-auto">
            Choose the plan that fits your ministry. Cancel anytime.
          </p>

          {/* Individual / Organization Toggle */}
          <div className="mt-8 inline-flex items-center gap-2 p-1.5 rounded-full bg-[#F0F4F8] dark:bg-[#0F1F33] border border-[#E8DCC8] dark:border-[#334155]">
            <button
              onClick={() => setShowOrg(false)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                !showOrg
                  ? 'bg-white dark:bg-[#334155] text-[#333333] dark:text-white shadow-md'
                  : 'text-[#6B7280] dark:text-[#94A3B8] hover:text-[#333333] dark:hover:text-white'
              }`}
            >
              Individual
            </button>
            <button
              onClick={() => setShowOrg(true)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                showOrg
                  ? 'bg-white dark:bg-[#334155] text-[#333333] dark:text-white shadow-md'
                  : 'text-[#6B7280] dark:text-[#94A3B8] hover:text-[#333333] dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              Organizations
            </button>
          </div>

          {/* Billing Toggle */}
          <div className="mt-4 inline-flex items-center gap-3 p-1.5 rounded-full bg-[#F0F4F8] dark:bg-[#0F1F33] border border-[#E8DCC8] dark:border-[#334155]">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                !isAnnual
                  ? 'bg-white dark:bg-[#334155] text-[#333333] dark:text-white shadow-md'
                  : 'text-[#6B7280] dark:text-[#94A3B8] hover:text-[#333333] dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                isAnnual
                  ? 'bg-white dark:bg-[#334155] text-[#333333] dark:text-white shadow-md'
                  : 'text-[#6B7280] dark:text-[#94A3B8] hover:text-[#333333] dark:hover:text-white'
              }`}
            >
              Annual
              <span className="px-2 py-0.5 rounded-full bg-[#D1FAE5] dark:bg-[#065F46]/40 text-[#059669] dark:text-[#34D399] text-xs font-bold">
                Save 10%
              </span>
            </button>
          </div>
        </div>

        {/* Individual Plans */}
        {!showOrg && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
            {individualPlans.map((plan) => {
              const priceId = isAnnual ? plan.yearlyPriceId : plan.monthlyPriceId

              return (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl border-2 transition-all duration-300 hover:shadow-xl ${
                    plan.popular
                      ? 'border-[#D4A017] dark:border-[#D4A017]/70 shadow-lg shadow-[#D4A017]/10 dark:shadow-[#D4A017]/5'
                      : 'border-[#E8DCC8] dark:border-[#334155] hover:border-[#D4A017]/40 dark:hover:border-[#D4A017]/40'
                  } bg-white dark:bg-[#0F1F33]/80`}
                >
                  {/* Best Value Badge */}
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#D4A017] to-[#B8860B] text-white text-xs font-bold shadow-lg shadow-[#D4A017]/30 uppercase tracking-wider">
                        <Star className="w-3 h-3 fill-current" /> Most Popular
                      </span>
                    </div>
                  )}

                  <div className="p-6 sm:p-8">
                    {/* Plan Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center text-xl shadow-sm`}>
                        {plan.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#333333] dark:text-white">
                          {plan.name}
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm text-[#6B7280] dark:text-[#94A3B8] mb-6 leading-relaxed">
                      {plan.description}
                    </p>

                    {/* Price Display */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl sm:text-5xl font-extrabold text-[#333333] dark:text-white">
                          ${isAnnual ? (plan.yearlyPrice / 12).toFixed(2) : plan.monthlyPrice.toFixed(2)}
                        </span>
                        <span className="text-sm text-[#6B7280] dark:text-[#94A3B8] font-medium">
                          /month
                        </span>
                      </div>
                      {isAnnual && (
                        <p className="mt-1.5 text-sm text-[#6B7280] dark:text-[#94A3B8]">
                          <span className="font-semibold text-[#333333] dark:text-white">${plan.yearlyPrice}</span> billed annually
                        </p>
                      )}
                    </div>

                    {/* CTA Button */}
                    {session ? (
                      <a
                        href={getCheckoutUrl(priceId)}
                        className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold transition-all duration-200 hover:scale-[1.02] active:scale-100 ${
                          plan.popular
                            ? 'bg-gradient-to-r from-[#D4A017] to-[#B8860B] text-white shadow-lg shadow-[#D4A017]/20 hover:shadow-xl hover:shadow-[#D4A017]/30'
                            : 'bg-[#D4A017] hover:bg-[#B8890F] text-white shadow-lg shadow-[#D4A017]/15 hover:shadow-xl hover:shadow-[#D4A017]/25'
                        }`}
                      >
                        Subscribe Now
                      </a>
                    ) : (
                      <Link
                        to="/signup"
                        search={{ plan: plan.name.toLowerCase(), billing: isAnnual ? 'annual' : 'monthly' }}
                        className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold transition-all duration-200 hover:scale-[1.02] active:scale-100 ${
                          plan.popular
                            ? 'bg-gradient-to-r from-[#D4A017] to-[#B8860B] text-white shadow-lg shadow-[#D4A017]/20 hover:shadow-xl hover:shadow-[#D4A017]/30'
                            : 'bg-[#D4A017] hover:bg-[#B8890F] text-white shadow-lg shadow-[#D4A017]/15 hover:shadow-xl hover:shadow-[#D4A017]/25'
                        }`}
                      >
                        Get Started
                      </Link>
                    )}

                    {/* Divider */}
                    <div className="my-6 border-t border-[#E8DCC8] dark:border-[#334155]" />

                    {/* Features */}
                    <ul className="space-y-3">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-start gap-3">
                          {feature.included ? (
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#D1FAE5] dark:bg-[#065F46]/30 flex items-center justify-center mt-0.5">
                              <Check className="w-3 h-3 text-[#059669] dark:text-[#34D399]" />
                            </span>
                          ) : (
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#F3F4F6] dark:bg-[#374151]/30 flex items-center justify-center mt-0.5">
                              <span className="text-[#9CA3AF] dark:text-[#6B7280] text-xs">—</span>
                            </span>
                          )}
                          <span className={`text-sm ${
                            feature.included
                              ? 'text-[#333333] dark:text-[#E2E8F0]'
                              : 'text-[#9CA3AF] dark:text-[#6B7280]'
                          }`}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Organization Plans */}
        {showOrg && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#E8DCC8] dark:border-[#334155]">
                  <th className="text-left py-4 px-4 text-sm font-bold text-[#333333] dark:text-white">Plan</th>
                  <th className="text-center py-4 px-4 text-sm font-bold text-[#333333] dark:text-white">Seats</th>
                  <th className="text-center py-4 px-4 text-sm font-bold text-[#333333] dark:text-white">Lessons/mo</th>
                  <th className="text-right py-4 px-4 text-sm font-bold text-[#333333] dark:text-white">
                    {isAnnual ? 'Annual' : 'Monthly'}
                  </th>
                  <th className="py-4 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {orgPlans.map((plan, idx) => {
                  const priceId = isAnnual ? plan.yearlyPriceId : plan.monthlyPriceId
                  
                  return (
                    <tr 
                      key={plan.name} 
                      className={`border-b border-[#E8DCC8] dark:border-[#334155] ${
                        plan.popular ? 'bg-[#FEF3C7]/30 dark:bg-[#D4A017]/10' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-sm`}>
                            {plan.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#333333] dark:text-white">{plan.name}</span>
                              {plan.popular && (
                                <span className="px-2 py-0.5 rounded-full bg-[#D4A017] text-white text-xs font-bold">
                                  Popular
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#6B7280] dark:text-[#94A3B8]">{plan.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[3rem] px-3 py-1 rounded-full bg-[#F0F4F8] dark:bg-[#334155] text-sm font-bold text-[#333333] dark:text-white">
                          {plan.seats}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm font-medium text-[#6B7280] dark:text-[#94A3B8]">
                          {plan.lessonsPerMonth}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {plan.contactUs ? (
                          <span className="text-lg font-bold text-[#333333] dark:text-white">
                            Custom
                          </span>
                        ) : (
                          <>
                            <div>
                              <span className="text-2xl font-extrabold text-[#333333] dark:text-white">
                                ${isAnnual ? plan.yearlyPrice : plan.monthlyPrice?.toFixed(2)}
                              </span>
                              <span className="text-sm text-[#6B7280] dark:text-[#94A3B8]">
                                {isAnnual ? '/yr' : '/mo'}
                              </span>
                            </div>
                            {isAnnual && plan.yearlyPrice && (
                              <p className="text-xs text-[#6B7280] dark:text-[#94A3B8]">
                                ${(plan.yearlyPrice / 12).toFixed(2)}/mo
                              </p>
                            )}
                          </>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {plan.contactUs ? (
                          <Link
                            to="/contact"
                            className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold bg-[#333333] hover:bg-[#1a1a1a] dark:bg-white dark:hover:bg-stone-200 text-white dark:text-[#333333] transition-colors"
                          >
                            Contact Us
                          </Link>
                        ) : session ? (
                          <a
                            href={getCheckoutUrl(priceId || '')}
                            className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold bg-[#D4A017] hover:bg-[#B8890F] text-white transition-colors"
                          >
                            Subscribe
                          </a>
                        ) : (
                          <Link
                            to="/signup"
                            search={{ plan: plan.name.toLowerCase(), billing: isAnnual ? 'annual' : 'monthly', type: 'org' }}
                            className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold bg-[#D4A017] hover:bg-[#B8890F] text-white transition-colors"
                          >
                            Get Started
                          </Link>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            
            {/* Org Features Note */}
            <div className="mt-8 p-6 rounded-2xl bg-[#F0F4F8] dark:bg-[#0F1F33] border border-[#E8DCC8] dark:border-[#334155]">
              <h4 className="font-bold text-[#333333] dark:text-white mb-3">All organization plans include:</h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  'All 66 books of the Bible',
                  '20+ Bible translations',
                  'PDF export & printing',
                  'Age-appropriate activities',
                  'Admin dashboard',
                  'Team member management',
                  'Usage analytics',
                  'Priority support',
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#059669] dark:text-[#34D399]" />
                    <span className="text-sm text-[#6B7280] dark:text-[#94A3B8]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Note */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-6 flex-wrap justify-center text-sm text-[#6B7280] dark:text-[#94A3B8]">
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4" /> Secure payments
            </span>
            <span className="flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4" /> Cancel anytime
            </span>
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4" /> No hidden fees
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
