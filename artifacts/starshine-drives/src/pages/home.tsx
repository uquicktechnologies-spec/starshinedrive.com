import { useEffect } from "react";
import { useSEO, injectJSONLD, removeJSONLD, ORGANIZATION_LD, LOCAL_BUSINESS_LD } from "@/lib/seo";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSlider } from "@/components/home/HeroSlider";
import { StatsBar } from "@/components/home/StatsBar";
import { ProductsSection } from "@/components/home/ProductsSection";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { IndustriesSection } from "@/components/home/IndustriesSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { ContactCTA } from "@/components/home/ContactCTA";

export default function Home() {
  useSEO({
    title: "Starshine Drive | Gearbox Manufacturer India",
    description: "Leading gearbox manufacturer in Morbi, India since 1965. Worm gearbox, helical gear reducer, bevel helical, geared motor. ISO/CE certified. OEM from 1 unit.",
    keywords: "gearbox manufacturer India, gearbox supplier India, gearbox dealer Gujarat, industrial gearbox India, worm gearbox India, helical gearbox India, gear reducer manufacturer, speed reducer, geared motor, power transmission gearbox, gearbox Morbi, gearbox Gujarat, industrial gear reducer",
  });

  useEffect(() => {
    injectJSONLD("ld-org", ORGANIZATION_LD);
    injectJSONLD("ld-local", LOCAL_BUSINESS_LD);
    return () => { removeJSONLD("ld-org"); removeJSONLD("ld-local"); };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <HeroSlider />
        <StatsBar />
        <ProductsSection />
        <WhyChooseUs />
        <IndustriesSection />
        <TestimonialsSection />
        <ContactCTA />
      </main>
      <Footer />
    </div>
  );
}
