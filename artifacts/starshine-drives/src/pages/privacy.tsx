import { useSEO } from "@/lib/seo";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function Privacy() {
  useSEO({
    title: "Privacy Policy | Starshine Drive",
    description: "Privacy policy for Starshine Drive — how we collect, use, and protect your personal information.",
    keywords: "Starshine Drive privacy policy",
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-3xl font-bold text-primary mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: August 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p>When you submit a quote request, contact form, or download request on this website, we may collect:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Name, job title, and company name</li>
              <li>Email address and phone number</li>
              <li>Country and industry/application details</li>
              <li>Product interests and technical requirements</li>
            </ul>
            <p className="mt-3">We also collect standard server logs (IP address, browser type, pages visited) for security and analytics purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p>We use the information you provide solely to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Respond to your quote requests and technical enquiries</li>
              <li>Send product catalogues, datasheets, or technical documentation you requested</li>
              <li>Improve our website and product offering</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p className="mt-3">We do <strong>not</strong> sell, rent, or trade your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Cookies</h2>
            <p>This website uses minimal cookies necessary for the site to function (session management, security). We do not use advertising or tracking cookies. You can disable cookies in your browser settings; some site features may be affected.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Retention</h2>
            <p>We retain enquiry data for up to 3 years for business correspondence purposes, after which it is securely deleted. You may request deletion of your data at any time by contacting us.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Security</h2>
            <p>We take reasonable technical and organisational measures to protect your information from unauthorised access, disclosure, or loss. All data transmissions on this site use HTTPS encryption.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Your Rights</h2>
            <p>You have the right to access, correct, or request deletion of personal data we hold about you. To exercise these rights, contact us at:</p>
            <div className="mt-3 bg-gray-50 border border-gray-200 rounded-md p-4">
              <p className="font-medium text-gray-900">Starshine Drive (星光传动)</p>
              <p>Ground Floor, Plot No 4, Survey No 251P2, Jetpar Road</p>
              <p>Morbi – 363642, Gujarat, India</p>
              <p className="mt-2">Email: <a href="mailto:sales@starshinedrive.com" className="text-primary hover:underline">sales@starshinedrive.com</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date. Continued use of the website after changes constitutes acceptance of the revised policy.</p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
