import { useEffect } from "react";
import { useSEO, injectJSONLD, removeJSONLD } from "@/lib/seo";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { CertificationsSection } from "@/components/home/CertificationsSection";
import { Button } from "@/components/ui/button";
import { CheckSquare } from "lucide-react";
import { Link } from "wouter";
import heroImg from "@assets/generated_images/hero-factory.webp";
import factoryImg from "@assets/generated_images/hero-office.webp";

export default function About() {
  useSEO({
    title: "About Starshine Drive | Gearbox Manufacturer India",
    description: "Starshine Drive, est. 1965, Morbi, India. 50,000+ sqm factory, 80+ countries. ISO 9001:2015, CE, SGS, UL certified gearbox and gear reducer manufacturer.",
    keywords: "Starshine Drive about, gearbox manufacturer India 1965, gear reducer manufacturer Gujarat, industrial gearbox manufacturer Morbi, ISO certified gearbox India, OEM gearbox supplier India",
  });
  useEffect(() => {
    injectJSONLD("ld-about", {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "About Starshine Drive",
      url: "https://starshinedrive.com/about",
      description: "Starshine Drive (星光传动) — established 1965, Morbi, Gujarat, India. 50,000+ sqm factory, exporting to 80+ countries. ISO 9001:2015, CE, SGS, UL certified gearbox manufacturer.",
      publisher: {
        "@type": "Organization",
        name: "Starshine Drive",
        url: "https://starshinedrive.com",
        foundingDate: "1965",
        numberOfEmployees: { "@type": "QuantitativeValue", value: 200 },
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
    return () => removeJSONLD("ld-about");
  }, []);
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* ── Full-width photo hero ── */}
      <div className="relative w-full h-[520px] overflow-hidden">
        <img
          src={heroImg}
          alt="Starshine Drive Factory"
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
              Starshine Drive Since 1965
            </h1>
            <ul className="space-y-3 mb-7">
              {["Gear Reducers", "Motors & Drives", "Global Supply"].map((b) => (
                <li key={b} className="flex items-center gap-3 text-gray-700 font-medium text-[15px]">
                  <CheckSquare className="w-4 h-4 text-primary shrink-0" strokeWidth={1.5} />
                  {b}
                </li>
              ))}
            </ul>
            <Link href="/contact">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white border-0 font-semibold px-7">
                Contact Starshine
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-grow">
        {/* ── Heritage section ── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
              <div>
                <p className="text-sm font-bold text-accent uppercase tracking-wider mb-2">Our Story</p>
                <h2 className="text-3xl font-heading font-bold text-primary mb-6">Our Heritage of Precision</h2>
                <p className="text-gray-600 mb-5 leading-relaxed">
                  Founded in 1965, Starshine Drive (星光传动) has grown from a specialized local workshop into a global leader in industrial gear reducers and power transmission solutions.
                </p>
                <p className="text-gray-600 mb-7 leading-relaxed">
                  With over 58 years of dedicated manufacturing experience, we operate a state-of-the-art production facility spanning 50,000 square meters. Our investment in advanced CNC machining centers, gear grinding equipment, and rigorous testing laboratories ensures every unit meets strict international quality standards.
                </p>
                <ul className="space-y-3">
                  {[
                    "50,000+ sqm Manufacturing Facility",
                    "Exporting to 80+ Countries Worldwide",
                    "Dedicated R&D Engineering Team",
                    "ISO / CE / SGS / UL Certified",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-gray-700 font-medium">
                      <div className="w-2 h-2 bg-accent rounded-full shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <img
                  src={heroImg}
                  alt="Starshine Drive factory exterior"
                  className="rounded-sm object-cover aspect-square w-full"
                  loading="lazy"
                  decoding="async"
                />
                <img
                  src={factoryImg}
                  alt="Starshine Drive engineering team"
                  className="rounded-sm object-cover aspect-square w-full mt-8"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="py-16 bg-[#f5f5f5]">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
              {[
                { num: "1965", label: "Founded" },
                { num: "50,000+", label: "sqm Factory" },
                { num: "80+", label: "Countries Served" },
                { num: "ISO/CE", label: "Certified" },
              ].map((s, i) => {
                const border = [
                  i % 2 === 0 ? "border-r border-gray-200" : "",
                  i < 2       ? "border-b border-gray-200" : "",
                  "md:border-b-0",
                  i < 3       ? "md:border-r md:border-gray-200" : "md:border-r-0",
                ].join(" ");
                return (
                  <div key={s.label} className={`flex flex-col items-center justify-center py-10 px-4 text-center ${border}`}>
                    <span className="text-4xl font-heading font-bold text-primary mb-1">{s.num}</span>
                    <span className="text-sm text-gray-500 font-medium">{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <WhyChooseUs />
        <CertificationsSection />
      </main>

      <Footer />
    </div>
  );
}
