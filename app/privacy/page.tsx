import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Bible Annals',
  description: 'Privacy policy for Bible Annals - our commitment to protecting your privacy while exploring biblical history.',
  openGraph: {
    title: 'Privacy Policy - Bible Annals',
    description: 'Privacy policy for Bible Annals - our commitment to protecting your privacy while exploring biblical history.',
    type: 'website',
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-600 mb-6">
              <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Our Commitment</h2>
            <p className="text-slate-700 mb-4">
              Bible Annals is committed to protecting your privacy. This Privacy Policy explains how we collect, 
              use, and safeguard your information when you visit our website and use our biblical timeline services.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-medium text-slate-800 mt-6 mb-3">Information You Provide</h3>
            <ul className="text-slate-700 mb-4 list-disc list-inside">
              <li>Search queries and filter preferences</li>
              <li>Feedback or comments you submit</li>
              <li>Any contact information if you reach out to us</li>
            </ul>

            <h3 className="text-xl font-medium text-slate-800 mt-6 mb-3">Automatically Collected Information</h3>
            <ul className="text-slate-700 mb-4 list-disc list-inside">
              <li>Browser type and version</li>
              <li>Device information (mobile, desktop, tablet)</li>
              <li>IP address and general location</li>
              <li>Pages visited and time spent on our site</li>
              <li>Referring website or search engine</li>
            </ul>

            <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">How We Use Your Information</h2>
            <ul className="text-slate-700 mb-4 list-disc list-inside">
              <li>To provide and improve our biblical timeline services</li>
              <li>To understand how visitors use our website</li>
              <li>To optimize website performance and user experience</li>
              <li>To respond to your inquiries and provide support</li>
              <li>To ensure the security and functionality of our website</li>
            </ul>

            <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Third-Party Services</h2>
            <p className="text-slate-700 mb-4">
              We may use third-party services for analytics and website functionality. These services may 
              collect information about your visit to help us improve our website. We do not sell, trade, 
              or otherwise transfer your personal information to third parties for marketing purposes.
            </p>

            <h3 className="text-xl font-medium text-slate-800 mt-6 mb-3">External Links</h3>
            <p className="text-slate-700 mb-4">
              Our website contains links to external sites, including Bible.com for biblical references. 
              We are not responsible for the privacy practices of these external websites. We encourage 
              you to review their privacy policies before providing any personal information.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Data Security</h2>
            <p className="text-slate-700 mb-4">
              We implement appropriate technical and organizational measures to protect your information 
              against unauthorized access, alteration, disclosure, or destruction. However, no method of 
              transmission over the internet is 100% secure.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Cookies and Local Storage</h2>
            <p className="text-slate-700 mb-4">
              We may use cookies and local storage to remember your preferences (such as search filters 
              and timeline settings) and to analyze website traffic. You can control cookie settings 
              through your browser preferences.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Children&apos;s Privacy</h2>
            <p className="text-slate-700 mb-4">
              Our website is suitable for all ages and contains educational biblical content. We do not 
              knowingly collect personal information from children under 13. If you believe we have 
              collected such information, please contact us immediately.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Your Rights</h2>
            <p className="text-slate-700 mb-4">You have the right to:</p>
            <ul className="text-slate-700 mb-4 list-disc list-inside">
              <li>Access the information we have about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt out of certain data collection practices</li>
            </ul>

            <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Changes to This Policy</h2>
            <p className="text-slate-700 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any significant 
              changes by posting the new policy on this page with an updated effective date.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Contact Us</h2>
            <p className="text-slate-700 mb-4">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us.
            </p>

            <div className="mt-8 p-4 bg-slate-100 rounded-lg">
              <p className="text-sm text-slate-600">
                Bible Annals is a educational resource dedicated to presenting biblical history in an 
                accessible and chronological format. All biblical content is based on the King James 
                Version (KJV) of the Bible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}