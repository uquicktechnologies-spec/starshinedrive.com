import { useEffect, useState } from "react";
import { useSEO, injectJSONLD, removeJSONLD } from "@/lib/seo";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { CheckSquare, MapPin, Phone, Mail, Clock } from "lucide-react";
import { Link } from "wouter";
import heroImg from "@assets/generated_images/hero-office.webp";
import { useCreateInquiry } from "@workspace/api-client-react";

const PRODUCTS = [
  "R Series Helical Gear Reducer",
  "F Series Parallel Shaft Helical Gear Reducer",
  "K Series Helical-Bevel Gear Reducer",
  "S Series Helical-Worm Gear Reducer",
  "RV Series Worm Gear Reducer",
  "NMRV / NRV Worm Gear Reducer",
  "Compact Geared Motors",
  "Helical-Hypoid Gear Units",
  "Planetary Gearbox",
  "Cycloidal Gear Reducer",
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const createInquiry = useCreateInquiry();
  useSEO({
    title: "Contact Starshine Drive | Gearbox Supplier India",
    description: "Contact Starshine Drive for gearbox quotes, OEM supply, and technical support. Morbi, Gujarat, India. Email: sales@starshinedrive.com | +91 9925001323.",
    keywords: "contact gearbox manufacturer India, gearbox supplier contact, gear reducer quote India, industrial gearbox inquiry Gujarat, gearbox dealer India contact",
  });
  useEffect(() => {
    injectJSONLD("ld-contact", {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: "Contact Starshine Drive",
      url: "https://starshinedrive.com/contact",
      description: "Contact Starshine Drive for gearbox quotes, OEM supply, and technical support. Morbi, Gujarat, India.",
      mainEntity: {
        "@type": "Organization",
        name: "Starshine Drive",
        telephone: "+91-9925001323",
        email: "sales@starshinedrive.com",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Ground Floor, Plot No 4, Survey No 251P2, Jetpar Road",
          addressLocality: "Morbi",
          addressRegion: "Gujarat",
          postalCode: "363642",
          addressCountry: "IN",
        },
      },
    });
    return () => removeJSONLD("ld-contact");
  }, []);
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setSubmitError("");
    createInquiry.mutate({ data: {
      contactPerson: String(form.get("name")),
      companyName: String(form.get("company") || ""),
      email: String(form.get("email")),
      phone: String(form.get("phone") || ""),
      productInterest: form.get("product") ? [String(form.get("product"))] : [],
      message: String(form.get("message")),
      leadSource: "Website contact form",
    } }, { onSuccess: () => { formElement.reset(); setSubmitted(true); }, onError: () => setSubmitError("We could not send your message. Please try again.") });
  };
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* ── Full-width photo hero ── */}
      <div className="relative w-full h-[520px] overflow-hidden">
        <img
          src={heroImg}
          alt="Starshine Drive Engineering Team"
          className="absolute inset-0 w-full h-full object-cover object-center"
          width={1024}
          height={1024}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="container relative z-10 h-full mx-auto px-8 flex items-center">
          <div className="max-w-md bg-white/95 p-8 md:p-10 shadow-lg">
            <h1 className="text-3xl md:text-[2.2rem] font-heading font-bold text-primary leading-tight mb-5">
              Send Your Gearbox or Drive Requirement
            </h1>
            <ul className="space-y-3 mb-7">
              {["Model Selection", "Gearbox Replacement", "Direct Communication"].map((b) => (
                <li key={b} className="flex items-center gap-3 text-gray-700 font-medium text-[15px]">
                  <CheckSquare className="w-4 h-4 text-primary shrink-0" strokeWidth={1.5} />
                  {b}
                </li>
              ))}
            </ul>
            <Link href="#contact-form">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white border-0 font-semibold px-7">
                Send Nameplate for Check
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-grow">

        {/* ── Contact info cards ── */}
        <section className="py-16 bg-[#f5f5f5]">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: MapPin,
                  title: "Headquarters",
                  text: "Ground Floor, Plot No 4, Survey No 251P2,\nJetpar Road, Morbi – 363642,\nGujarat, India",
                },
                {
                  icon: Phone,
                  title: "Phone",
                  text: "+91 9925001323",
                },
                {
                  icon: Mail,
                  title: "Email",
                  text: "sales@starshinedrive.com",
                },
                {
                  icon: Clock,
                  title: "Business Hours",
                  text: "Monday – Friday\n8:30 AM – 5:30 PM (IST)",
                },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="bg-white border border-gray-100 p-7 text-center group hover:shadow-lg transition-all">
                  <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm whitespace-pre-line">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Contact form ── */}
        <section id="contact-form" className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-10">
              <p className="text-sm font-bold text-accent uppercase tracking-wider mb-2">Get In Touch</p>
              <h2 className="text-3xl font-heading font-bold text-primary">Send Your Requirements</h2>
              <p className="text-gray-500 mt-3 text-[15px]">Describe your gearbox needs and our engineers will respond within 24 hours.</p>
            </div>

            {submitted ? <div className="rounded border border-green-200 bg-green-50 p-6 text-center text-green-800">Thank you — your requirements have been sent to our sales team.</div> : <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                  <input
                    name="name" type="text" required
                    placeholder="Your name"
                    className="w-full border border-gray-200 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company</label>
                  <input
                    name="company" type="text"
                    placeholder="Your company"
                    className="w-full border border-gray-200 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address *</label>
                  <input
                    name="email" type="email" required
                    placeholder="you@company.com"
                    className="w-full border border-gray-200 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone / WhatsApp</label>
                  <input
                    name="phone" type="tel"
                    placeholder="+91 ..."
                    className="w-full border border-gray-200 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product / Application</label>
                <select
                  name="product" defaultValue=""
                  className="w-full border border-gray-200 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors bg-white"
                >
                  <option value="" disabled>Select a product…</option>
                  {PRODUCTS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                  <option value="Other">Other / Not sure</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message / Requirements *</label>
                <textarea
                  name="message" rows={5} required
                  placeholder="Describe your gearbox requirements — power, torque, ratio, mounting, quantity, etc."
                  className="w-full border border-gray-200 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                  disabled={createInquiry.isPending}
                className="w-full bg-accent hover:bg-accent/90 text-white border-0 font-semibold text-base"
              >
                  {createInquiry.isPending ? "Sending…" : "Send Requirements"}
              </Button>
                {submitError && <p className="text-center text-sm text-red-600">{submitError}</p>}
            </form>}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
