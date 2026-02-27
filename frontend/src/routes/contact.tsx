import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { Mail, BookOpen, CheckCircle, Send, Clock, Heart, MessageCircle, HelpCircle, CreditCard, Users, Sparkles } from 'lucide-react'
import { useI18n } from '@/i18n'

export const Route = createFileRoute('/contact')({
  component: ContactPage,
})

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); obs.disconnect() }
    }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, isVisible }
}

function ContactPage() {
  const { t } = useI18n()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { ref: heroRef, isVisible: heroVisible } = useInView(0.1)
  const { ref: formRef, isVisible: formVisible } = useInView(0.1)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '', type: 'general' })
    } catch (err) {
      setError('Failed to send message. Please try again or email us directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inquiryTypes = [
    { value: 'general', label: t('contact.generalInquiry'), icon: <MessageCircle className="w-4 h-4" /> },
    { value: 'support', label: t('contact.technicalSupport'), icon: <HelpCircle className="w-4 h-4" /> },
    { value: 'billing', label: t('contact.billingQuestion'), icon: <CreditCard className="w-4 h-4" /> },
    { value: 'feedback', label: t('contact.feedback'), icon: <Heart className="w-4 h-4" /> },
    { value: 'partnership', label: t('contact.partnership'), icon: <Users className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917]">
      {/* Hero Section - Sunday Morning Aesthetic */}
      <section ref={heroRef} className="relative pt-8 pb-6 sm:pt-10 sm:pb-8 overflow-hidden">
        {/* Warm ambient background */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl" />
        
        <div className={`relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium mb-3">
            <Mail className="w-4 h-4" />
            {t('contact.loveToHear')}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 dark:text-stone-50 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
            {t('contact.title')}
          </h1>
          <p className="text-base sm:text-lg text-stone-600 dark:text-stone-400 max-w-lg mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>
      </section>

      {/* Quick Contact Options - Sunday Morning Style */}
      <section className="pb-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            <a 
              href="mailto:hello@biblelessonplanner.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-sm font-medium transition-all shadow-md shadow-amber-600/20 hover:shadow-lg hover:shadow-amber-600/30"
              data-testid="email-link"
            >
              <Mail className="w-4 h-4" strokeWidth={2} />
              hello@biblelessonplanner.com
            </a>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full text-sm font-medium text-stone-600 dark:text-stone-300">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-500" strokeWidth={2} />
              {t('contact.respondsIn')}
            </div>
            <Link
              to="/help"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full text-sm font-medium text-stone-600 dark:text-stone-300 hover:border-amber-400 dark:hover:border-amber-600 transition-colors"
              data-testid="help-link"
            >
              <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-500" strokeWidth={2} />
              {t('contact.helpCenter')}
            </Link>
          </div>
        </div>
      </section>

      {/* Main Contact Form - Sunday Morning Aesthetic */}
      <section ref={formRef} className="pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`bg-white dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden shadow-xl shadow-stone-900/5 dark:shadow-black/20 transition-all duration-700 ${formVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            
            {/* Form Header - Warm Amber Aesthetic */}
            <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-stone-900 px-6 py-6 sm:px-8 border-b border-amber-200/50 dark:border-amber-800/30">
              <div className="absolute top-4 right-4 w-16 h-16 bg-amber-500/10 rounded-full blur-xl" />
              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100" style={{ fontFamily: 'Crimson Text, serif' }}>
                    {t('contact.sendMessage')}
                  </h2>
                  <p className="text-stone-500 dark:text-stone-400 text-sm mt-0.5">
                    {t('contact.loveToHear')}
                  </p>
                </div>
              </div>
            </div>

            {submitted ? (
              <div className="p-8 sm:p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
                  {t('contact.messageSent')}
                </h3>
                <p className="text-stone-500 dark:text-stone-400 text-sm mb-5">
                  {t('contact.thankYou')}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline"
                >
                  {t('contact.sendAnother')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5" data-testid="contact-form">
                {/* Inquiry Type - Pill Selection with Amber Accents */}
                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">
                    {t('contact.whatCanWeHelp')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {inquiryTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.value })}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          formData.type === type.value
                            ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                            : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-600 hover:text-amber-700 dark:hover:text-amber-400'
                        }`}
                        data-testid={`type-${type.value}`}
                      >
                        {type.icon}
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      {t('contact.name')}
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700/50 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm placeholder:text-stone-400"
                      placeholder={t('contact.namePlaceholder')}
                      data-testid="contact-name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      {t('contact.email')}
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700/50 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm placeholder:text-stone-400"
                      placeholder="you@example.com"
                      data-testid="contact-email"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    {t('contact.subject')}
                  </label>
                  <input
                    type="text"
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700/50 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm placeholder:text-stone-400"
                    placeholder={t('contact.subjectPlaceholder')}
                    data-testid="contact-subject"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    {t('contact.message')}
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700/50 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all resize-none text-sm placeholder:text-stone-400"
                    placeholder={t('contact.messagePlaceholder')}
                    data-testid="contact-message"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold shadow-lg shadow-amber-600/20 hover:shadow-xl hover:shadow-amber-600/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  data-testid="contact-submit"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('contact.sending')}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" strokeWidth={2} />
                      {t('contact.sendBtn')}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Bottom Quick Links - Sunday Morning Style */}
          <div className="mt-8 text-center">
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">
              {t('contact.lookingFor')}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                to="/pricing"
                search={{ session_id: undefined, success: undefined, canceled: undefined }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300 hover:border-amber-400 dark:hover:border-amber-600 transition-all"
                data-testid="pricing-link"
              >
                <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-500" strokeWidth={2} />
                Pricing
              </Link>
              <Link
                to="/team"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300 hover:border-amber-400 dark:hover:border-amber-600 transition-all"
                data-testid="team-link"
              >
                <Users className="w-4 h-4 text-amber-600 dark:text-amber-500" strokeWidth={2} />
                Our Team
              </Link>
              <Link
                to="/help"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300 hover:border-amber-400 dark:hover:border-amber-600 transition-all"
                data-testid="faq-link"
              >
                <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-500" strokeWidth={2} />
                FAQs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
