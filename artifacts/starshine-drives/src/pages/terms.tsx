import { useSEO } from "@/lib/seo";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function Terms() {
  useSEO({
    title: "Terms of Service | Starshine Drive",
    description: "Terms and conditions for using the Starshine Drive website and requesting products or services.",
    keywords: "Starshine Drive terms of service",
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-3xl font-bold text-primary mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: August 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using this website (<strong>starshinedrive.com</strong>), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use this website.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Website Use</h2>
            <p>This website is provided for informational and commercial enquiry purposes only. You agree to use it only for lawful purposes and in a manner that does not infringe the rights of others or restrict their use of the site.</p>
            <p className="mt-3">You must not:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Use the site for any fraudulent or unlawful purpose</li>
              <li>Attempt to gain unauthorised access to any part of the site or its systems</li>
              <li>Transmit unsolicited commercial communications</li>
              <li>Reproduce, duplicate, or copy content without our express written permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Product Information</h2>
            <p>All product specifications, dimensions, power ratings, and technical data on this website are provided for reference only. Actual product specifications may vary. Starshine Drive reserves the right to modify product specifications without prior notice.</p>
            <p className="mt-3">Submission of a quote request does not constitute a binding order or contract. Orders are confirmed only upon written purchase order acceptance by Starshine Drive.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Intellectual Property</h2>
            <p>All content on this website — including text, images, technical drawings, logos, and branding — is the property of Starshine Drive (星光传动) or its licensors and is protected by applicable intellectual property laws. No content may be reproduced without express written permission.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Disclaimer of Warranties</h2>
            <p>This website and its content are provided "as is" without any warranties, express or implied. Starshine Drive does not warrant that the website will be uninterrupted, error-free, or free of viruses. We make no warranty regarding the accuracy or completeness of any information on this site.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, Starshine Drive shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of this website or reliance on any information contained herein.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Third-Party Links</h2>
            <p>This website may contain links to third-party websites. These links are provided for convenience only. Starshine Drive has no control over, and assumes no responsibility for, the content or practices of any third-party sites.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Governing Law</h2>
            <p>These Terms of Service are governed by the laws of India. Any disputes arising from the use of this website shall be subject to the exclusive jurisdiction of the courts of Gujarat, India.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contact</h2>
            <p>For any questions regarding these terms, contact us at:</p>
            <div className="mt-3 bg-gray-50 border border-gray-200 rounded-md p-4">
              <p className="font-medium text-gray-900">Starshine Drive (星光传动)</p>
              <p>Ground Floor, Plot No 4, Survey No 251P2, Jetpar Road</p>
              <p>Morbi – 363642, Gujarat, India</p>
              <p className="mt-2">Email: <a href="mailto:sales@starshinedrive.com" className="text-primary hover:underline">sales@starshinedrive.com</a></p>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
