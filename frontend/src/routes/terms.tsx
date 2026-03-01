import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/terms')({
  component: TermsOfService,
})

function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-100 mb-8">Terms of Service</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-8">Last updated: March 1, 2026</p>
        
        <div className="prose prose-stone dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-4">1. Acceptance of Terms</h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              By accessing or using Bible Lesson Planner ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-4">2. Description of Service</h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              Bible Lesson Planner provides AI-powered tools for creating Sunday school lessons and educational materials based on Scripture. The Service includes lesson generation, printable materials, and related features available through our website at biblelessonplanner.com.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-4">3. Account Registration</h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-4">To use certain features of the Service, you must register for an account. You agree to:</p>
            <ul className="list-disc pl-6 text-stone-600 dark:text-stone-300 space-y-2">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Promptly update your account information as needed</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-4">4. Subscription and Payment</h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
              Some features of the Service require a paid subscription. By subscribing, you agree to:
            </p>
            <ul className="list-disc pl-6 text-stone-600 dark:text-stone-300 space-y-2">
              <li>Pay all fees associated with your subscription plan</li>
              <li>Provide valid payment information</li>
              <li>Accept automatic renewal unless cancelled before the renewal date</li>
            </ul>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mt-4">
              Payments are processed securely through Stripe. Refunds are handled in accordance with our refund policy. You may cancel your subscription at any time through your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-4">5. Acceptable Use</h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-stone-600 dark:text-stone-300 space-y-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on the rights of others</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Use automated systems to access the Service without permission</li>
              <li>Resell or redistribute the Service without authorization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-4">6. Intellectual Property</h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
              <strong>Our Content:</strong> The Service, including its design, features, and content, is owned by Bible Lesson Planner and protected by intellectual property laws.
            </p>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
              <strong>Your Content:</strong> You retain ownership of lessons and content you create using the Service. By using the Service, you grant us a limited license to store and process your content to provide the Service.
            </p>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              <strong>Generated Content:</strong> Lessons generated by our AI tools are provided for your personal or ministry use. You may use, modify, and distribute generated lessons for non-commercial educational purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-4">7. Scripture and Religious Content</h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              Bible Lesson Planner uses various Bible translations to generate lessons. Scripture quotations are used in accordance with the usage guidelines of each translation. We strive for accuracy but encourage users to verify Scripture references with authoritative sources.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-4">8. Disclaimer of Warranties</h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE. AI-GENERATED CONTENT MAY CONTAIN ERRORS AND SHOULD BE REVIEWED BEFORE USE.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-4">9. Limitation of Liability</h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, BIBLE LESSON PLANNER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE SERVICE IN THE TWELVE MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-4">10. Indemnification</h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              You agree to indemnify and hold harmless Bible Lesson Planner and its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-4">11. Termination</h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              We may terminate or suspend your account at any time for violation of these Terms. You may terminate your account at any time by contacting us. Upon termination, your right to use the Service will cease immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-4">12. Changes to Terms</h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the updated Terms on our website. Continued use of the Service after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-4">13. Governing Law</h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-4">14. Dispute Resolution</h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              Any disputes arising from these Terms or the Service shall first be attempted to be resolved through good-faith negotiation. If negotiation fails, disputes shall be resolved through binding arbitration in accordance with applicable arbitration rules.
            </p>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mt-4">
              For users in the European Union: You may also use the EU Online Dispute Resolution platform at <a href="https://ec.europa.eu/odr" target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-500 underline">https://ec.europa.eu/odr</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-4">15. Contact Information</h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              If you have any questions about these Terms, please contact us at:
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
