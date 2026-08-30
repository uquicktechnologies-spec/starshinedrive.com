import { useEffect } from "react";
import { useSEO, injectJSONLD, removeJSONLD } from "@/lib/seo";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { CheckSquare } from "lucide-react";
import { Link } from "wouter";
import { IndustriesSection } from "@/components/home/IndustriesSection";
import heroImg from "@assets/generated_images/hero-solutions.webp";


export default function Solutions() {
  useSEO({
    title: "Gearbox Solutions by Industry | Starshine Drive India",
    description: "Starshine Drive gearboxes for conveyors, material handling, packaging, mining, ceramics, chemicals, textile, and automation. Manufacturer in Morbi, India.",
    keywords: "conveyor gearbox India, material handling gearbox, packaging machine gearbox, mining gearbox India, crusher gearbox, ceramic industry gearbox, tile plant gearbox, chemical plant gearbox, textile machine gearbox, industrial automation gearbox",
  });
  useEffect(() => {
    injectJSONLD("ld-solutions", {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Industry Drive Solutions",
      url: "https://starshinedrive.com/solutions",
      description: "Starshine Drive supplies industrial gearboxes for conveyor systems, material handling, packaging machinery, mining, ceramic & tile plants, chemical process, textile, and automation.",
      provider: {
        "@type": "Organization",
        name: "Starshine Drive",
        url: "https://starshinedrive.com",
      },
    });
    return () => removeJSONLD("ld-solutions");
  }, []);
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* ── Hero ── */}
      <div className="relative w-full h-[520px] overflow-hidden">
        <img
          src={heroImg}
          alt="Industry Drive Solutions"
          className="absolute inset-0 w-full h-full object-cover object-center"
          width={1024}
          height={1024}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="container relative z-10 h-full mx-auto px-8 flex items-center">
          <div className="max-w-md bg-white/95 p-8 md:p-10 shadow-lg">
            <h1 className="text-3xl md:text-[2rem] font-heading font-bold text-primary leading-tight mb-5">
              Industry Drive Solutions for Machinery and Production Lines
            </h1>
            <ul className="space-y-3 mb-7">
              {["Reducer Matching", "Geared Motors", "Speed Control"].map((b) => (
                <li key={b} className="flex items-center gap-3 text-gray-700 font-medium text-[15px]">
                  <CheckSquare className="w-4 h-4 text-primary shrink-0" strokeWidth={1.5} />
                  {b}
                </li>
              ))}
            </ul>
            <Link href="/get-quote">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white border-0 font-semibold px-7">
                Request For Your Own Industry
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Industry Carousel ── */}
      <IndustriesSection hideButton />

      {/* ── Why Starshine for Industry ── */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-accent font-bold text-sm uppercase tracking-widest mb-2">Our Advantage</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold">
              Why Industries Choose Starshine
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 32 32" stroke="currentColor" strokeWidth={1.5}>
                    <circle cx="16" cy="16" r="10"/><path d="M16 10v6l4 4" strokeLinecap="round"/>
                  </svg>
                ),
                title: "15-Day Delivery",
                desc: "Fast lead times with built-to-order manufacturing. Express options available for urgent replacements.",
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 32 32" stroke="currentColor" strokeWidth={1.5}>
                    <rect x="4" y="8" width="24" height="18" rx="1"/><path d="M4 14h24M10 8V6m12 2V6" strokeLinecap="round"/>
                  </svg>
                ),
                title: "OEM / ODM",
                desc: "Custom gear ratios, mounting configurations, and special housings engineered to your exact application.",
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 32 32" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M16 4l3 7h7l-5.5 4.5 2 7L16 19l-6.5 3.5 2-7L6 11h7l3-7z" strokeLinejoin="round"/>
                  </svg>
                ),
                title: "ISO / CE Certified",
                desc: "All products manufactured under ISO 9001:2015 quality management with CE, SGS, and UL certifications.",
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 32 32" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M6 26l5-5m0 0l5-5m-5 5l-5-5m10 5l5-5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="16" cy="10" r="5"/>
                  </svg>
                ),
                title: "Global Support",
                desc: "Technical engineers available for product selection, installation guidance, and post-sale support worldwide.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white/10 rounded-sm p-6 text-center hover:bg-white/15 transition-colors">
                <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4 text-accent">
                  {item.icon}
                </div>
                <h4 className="font-heading font-bold text-white mb-2">{item.title}</h4>
                <p className="text-blue-200 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Custom OEM CTA ── */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-accent font-bold text-sm uppercase tracking-widest mb-3">Custom Engineering</p>
          <h2 className="text-3xl font-heading font-bold text-primary mb-4">
            Don't See Your Industry?
          </h2>
          <p className="text-gray-500 leading-relaxed mb-8 max-w-2xl mx-auto">
            Starshine Drive specialises in fully custom OEM / ODM power transmission solutions. Our R&D team will design a bespoke gear reducer to your exact torque, space, and environmental requirements — starting from 1 unit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-quote">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white border-0 font-semibold px-10">
                Request a Custom Solution
              </Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white font-semibold px-10">
                Browse All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
