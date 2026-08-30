import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

import hero1 from "@assets/generated_images/hero-lineup.webp";

const SLIDES = [
  {
    image: hero1,
    title: "Industrial Gearbox Solutions for Global Manufacturers",
    bullets: ["Manufacturing Capacity", "Engineering Support", "Global Delivery"],
    cta: "View Products",
    href: "/products",
  },
  {
    image: "",
    title: "Precision Gear Transmission and Drive Systems",
    bullets: ["Drive Components", "Transmission Parts", "Engineering Support"],
    cta: "Get in Touch",
    href: "/contact",
  },
  {
    image: "",
    title: "Gearbox Solutions for Industrial Applications",
    bullets: ["Textile Machinery", "Ceramic Equipment", "Packaging Lines"],
    cta: "Explore Applications",
    href: "/solutions",
  },
  {
    image: "",
    title: "Technical Support for Every Gearbox Project",
    bullets: ["Product Selection", "Replacement Help", "Fast Response"],
    cta: "Get Support",
    href: "/support",
  },
];

const SECONDARY_IMAGES = [
  () => import("@assets/generated_images/hero-lineup-2.webp").then((m) => m.default),
  () => import("@assets/generated_images/hero-factory.webp").then((m) => m.default),
  () => import("@assets/generated_images/hero-office.webp").then((m) => m.default),
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [images, setImages] = useState<Record<number, string>>({ 0: hero1 });
  const slide = { ...SLIDES[current], image: images[current] ?? hero1 };

  useEffect(() => {
    const t = setInterval(() => setCurrent((p) => (p + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // Let the first hero paint before fetching the remaining carousel assets.
    const timer = window.setTimeout(() => {
      SECONDARY_IMAGES.forEach((loadImage, index) => {
        loadImage().then((image) => {
          setImages((loaded) => ({ ...loaded, [index + 1]: image }));
        });
      });
    }, 1200);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-[560px] overflow-hidden">
      <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out opacity-100 z-10">
          {/* Full-width background image — NO dark overlay */}
          <img
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover object-center"
            width={1024}
            height={1024}
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />

          {/* White floating card — left side, over the image */}
          <div className="container relative z-20 h-full mx-auto px-8 flex items-center">
            <div className="max-w-md bg-white/95 p-8 md:p-10 shadow-lg transition-all duration-700">
              {current === 0 ? (
                <h1 className="text-3xl md:text-[2.2rem] font-heading font-bold text-primary leading-tight mb-5">
                  {slide.title}
                </h1>
              ) : (
                <h2 className="text-3xl md:text-[2.2rem] font-heading font-bold text-primary leading-tight mb-5">
                  {slide.title}
                </h2>
              )}
              <ul className="space-y-3 mb-7">
                {slide.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-gray-700 font-medium text-[15px]">
                    <CheckSquare className="w-4 h-4 text-primary shrink-0" strokeWidth={1.5} />
                    {b}
                  </li>
                ))}
              </ul>
              <Link href={slide.href}>
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white border-0 font-semibold px-7">
                  {slide.cta}
                </Button>
              </Link>
            </div>
          </div>
      </div>

      {/* Slide indicators — bottom, matching original style */}
      <div className="absolute bottom-5 left-0 right-0 z-30 container mx-auto px-8 flex gap-8">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="flex flex-col items-start gap-1.5 group"
          >
            <span
              className={cn(
                "font-mono text-sm font-semibold tracking-wider transition-colors",
                i === current ? "text-white" : "text-white/50"
              )}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div
              className={cn(
                "h-[3px] rounded-full transition-all duration-500",
                i === current ? "w-14 bg-accent" : "w-8 bg-white/30"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
