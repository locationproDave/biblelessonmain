import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useSession } from '@/lib/auth-client'
import { BookOpen, Sparkles, Lock, RotateCcw, CreditCard, Star, Check } from 'lucide-react'

// Stripe Price IDs
const PRICE_IDS = {
  basic_monthly: 'price_1Sym4PHWvw9gdjKYBWAHEbMi',
  basic_annual: 'price_1Sym5PHWvw9gdjKYwsMpAYbr',
  unlimited_monthly: 'price_1Sym6PHWvw9gdjKYLiwKbMFe',
  unlimited_annual: 'price_1Sym7AHWvw9gdjKY5cGSDtQP',
}

const plans = [
  {
    name: 'Basic',
    icon: <BookOpen className="w-5 h-5 text-white" />,
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    monthlyPriceId: PRICE_IDS.basic_monthly,
    yearlyPriceId: PRICE_IDS.basic_annual,
    description: 'Perfect for individual teachers and small groups getting started.',
    features: [
      { text: '6 lessons per month', included: true },
      { text: 'All 66 books of the Bible', included: true },
      { text: '20+ Bible translations', included: true },
      { text: 'PDF export & printing', included: true },
      { text: 'Age-appropriate activities', included: true },
      { text: 'Team collaboration (free)', included: true },
      { text: 'Unlimited lesson generation', included: false },
      { text: 'Priority processing', included: false },
    ],
    gradient: 'from-[#1E3A5F] to-[#B8890F]',
    popular: false,
  },
  {
    name: 'Unlimited',
    icon: <Sparkles className="w-5 h-5 text-white" />,
    monthlyPrice: 19.99,
    yearlyPrice: 199.99,
    monthlyPriceId: PRICE_IDS.unlimited_monthly,
    yearlyPriceId: PRICE_IDS.unlimited_annual,
    description: 'For churches and ministries that need unlimited curriculum.',
    features: [
      { text: 'Unlimited lesson generation', included: true },
      { text: 'All 66 books of the Bible', included: true },
      { text: '20+ Bible translations', included: true },
      { text: 'PDF export & printing', included: true },
      { text: 'Age-appropriate activities', included: true },
      { text: 'Team collaboration (free)', included: true },
      { text: 'Priority processing', included: true },
      { text: 'Early access to new features', included: true },
    ],
    gradient: 'from-[#D4A017] to-[#B8860B]',
    popular: true,
  },
]

function calcSavings(plan: typeof plans[0]) {
  const monthlyTotal = plan.monthlyPrice * 12
  const saved = monthlyTotal - plan.yearlyPrice
  const pct = Math.round((saved / monthlyTotal) * 100)
  return { saved: saved.toFixed(2), pct }
}

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true)
  const { data: session } = useSession()

  // Calculate max savings % across plans for the toggle badge
  const maxSavingsPct = Math.max(...plans.map(p => calcSavings(p).pct))

  const getCheckoutUrl = (priceId: string) => {
    return `${import.meta.env.VITE_CONVEX_SITE_URL}/stripe/checkout?priceId=${priceId}&origin=${encodeURIComponent(window.location.origin)}`
  }

  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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

          {/* Group Plan Promo */}
          <p className="mt-5 text-sm sm:text-base text-[#1E3A5F] dark:text-[#D4A017] font-semibold">
            Contact us about Group Plan Pricing for your entire church or organization
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-full bg-[#F0F4F8] dark:bg-[#0F1F33] border border-[#E8DCC8] dark:border-[#334155]">
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
                Save up to {maxSavingsPct}%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const priceId = isAnnual ? plan.yearlyPriceId : plan.monthlyPriceId
            const { saved, pct } = calcSavings(plan)

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
                {plan.popular && isAnnual && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#D4A017] to-[#B8860B] text-white text-xs font-bold shadow-lg shadow-[#D4A017]/30 uppercase tracking-wider">
                      <Star className="w-3 h-3 fill-current" /> Best Value
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
                    {isAnnual ? (
                      <>
                        {/* Annual view: show per-month equivalent + annual total + savings */}
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl sm:text-5xl font-extrabold text-[#333333] dark:text-white">
                            ${(plan.yearlyPrice / 12).toFixed(2)}
                          </span>
                          <span className="text-sm text-[#6B7280] dark:text-[#94A3B8] font-medium">
                            /month
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm text-[#6B7280] dark:text-[#94A3B8]">
                          <span className="font-semibold text-[#333333] dark:text-white">${plan.yearlyPrice.toFixed(2)}</span> billed annually
                        </p>
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D1FAE5] dark:bg-[#065F46]/30">
                          <span className="text-xs font-bold text-[#059669] dark:text-[#34D399]">
                            Save ${saved}/yr ({pct}% off vs monthly)
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Monthly view: show monthly price + annual comparison */}
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl sm:text-5xl font-extrabold text-[#333333] dark:text-white">
                            ${plan.monthlyPrice.toFixed(2)}
                          </span>
                          <span className="text-sm text-[#6B7280] dark:text-[#94A3B8] font-medium">
                            /month
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm text-[#6B7280] dark:text-[#94A3B8]">
                          Billed monthly &middot; ${(plan.monthlyPrice * 12).toFixed(2)}/yr
                        </p>
                        <button
                          onClick={() => setIsAnnual(true)}
                          className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEF3C7] dark:bg-[#78350F]/30 hover:bg-[#FDE68A] dark:hover:bg-[#78350F]/50 transition-colors cursor-pointer"
                        >
                          <span className="text-xs font-bold text-[#B45309] dark:text-[#FBBF24]">
                            Switch to annual &amp; save ${saved}/yr
                          </span>
                        </button>
                      </>
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
