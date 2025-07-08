export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-8">
            <strong>Effective Date:</strong> [Date]
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using Blank Space, you accept and agree to be bound by the 
              terms and provision of this agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Service Description</h2>
            <p className="text-gray-700 mb-4">
              Blank Space provides a service that converts your photos into line art 
              suitable for coloring books. We offer both digital downloads and printed 
              physical books.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. User Content and Rights</h2>
            <p className="text-gray-700 mb-4">
              You retain all rights to the photos you upload. By using our service, 
              you grant us a limited license to process your photos to create coloring 
              book pages for your personal use.
            </p>
            <p className="text-gray-700 mb-4">
              You are responsible for ensuring you have the right to use any photos 
              you upload. You may not upload copyrighted material without permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Payment and Refunds</h2>
            <p className="text-gray-700 mb-4">
              Payment is processed securely through Stripe. We offer a 30-day money-back 
              guarantee for digital downloads only. Physical printed books are not eligible 
              for refunds due to their custom nature.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Prohibited Uses</h2>
            <p className="text-gray-700 mb-4">You may not use our service to:</p>
            <ul className="list-disc ml-6 text-gray-700 mb-4">
              <li>Upload illegal, harmful, or offensive content</li>
              <li>Violate any laws or regulations</li>
              <li>Infringe on others' intellectual property rights</li>
              <li>Distribute malware or harmful code</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Service Availability</h2>
            <p className="text-gray-700 mb-4">
              We strive to maintain service availability but cannot guarantee uninterrupted 
              access. We may suspend or terminate service for maintenance or other reasons.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              Our liability is limited to the amount you paid for our services. We are not 
              liable for any indirect, incidental, or consequential damages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We may update these terms from time to time. Continued use of our service 
              after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              For questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-gray-700">
              Email: legal@blankspace.app
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}