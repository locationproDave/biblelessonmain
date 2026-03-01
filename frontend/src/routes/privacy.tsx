import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/privacy')({
  component: PrivacyPolicy,
})

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-100 mb-8">Privacy Policy</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-8">Last updated: March 1, 2026</p>
        
        <div className="prose prose-stone dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-4">1. Introduction</h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              Bible Lesson Planner ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our website and services at biblelessonplanner.com.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-4">2. Information We Collect</h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-4">We collect information you provide directly to us, including:</p>
            <ul className="list-disc pl-6 text-stone-600 dark:text-stone-300 space-y-2">
              <li>Account information (name, email address, password)</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Lesson content and preferences you create</li>
              <li>Communications you send to us</li>
            </ul>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mt-4">We automatically collect certain information when you use our services:</p>
            <ul className="list-disc pl-6 text-stone-600 dark:text-stone-300 space-y-2">
              <li>Device and browser information</li>
              <li>IP address and location data</li>
              <li>Usage data and analytics</li>
              <li>Cookies and similar technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-4">3. How We Use Your Information</h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 text-stone-600 dark:text-stone-300 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, investigate, and prevent fraudulent transactions and abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-4">4. Information Sharing</h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-4">We do not sell your personal information. We may share your information with:</p>
            <ul className="list-disc pl-6 text-stone-600 dark:text-stone-300 space-y-2">
              <li>Service providers who assist in our operations (payment processing, hosting, analytics)</li>
              <li>Professional advisors (lawyers, accountants) as needed</li>
              <li>Law enforcement when required by law or to protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-4">5. Data Security</h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-4">6. Your Rights</h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-4">Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 text-stone-600 dark:text-stone-300 space-y-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-4">7. Cookies</h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              We use cookies and similar tracking technologies to collect and track information about your use of our services. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-4">8. Children's Privacy</h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              Our services are not directed to individuals under 16. We do not knowingly collect personal information from children under 16. If we learn we have collected personal information from a child under 16, we will delete that information promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-4">9. International Transfers</h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that are different from the laws of your country. We take appropriate safeguards to ensure your personal data remains protected.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-4">10. Changes to This Policy</h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-4">11. Contact Us</h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              If you have any questions about this privacy policy or our data practices, please contact us at:
            </p>
            <p className="text-stone-600 dark:text-stone-300 mt-4">
              <strong>Email:</strong> hello@biblelessonplanner.com
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
