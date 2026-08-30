import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import imgTextile   from "@assets/generated_images/industry-textile.jpg";
import imgFood      from "@assets/generated_images/industry-1.jpg";
import imgPackaging from "@assets/generated_images/industry-2.jpg";
import imgGlass     from "@assets/generated_images/industry-glass.jpg";
import imgCrane     from "@assets/generated_images/industry-4.jpg";
import imgMining    from "@assets/generated_images/industry-5.jpg";
import imgSteel     from "@assets/generated_images/industry-steel.jpg";
import imgChemical  from "@assets/generated_images/industry-6.jpg";
import imgWater     from "@assets/generated_images/industry-water.jpg";
import imgConveyor  from "@assets/generated_images/industry-3.jpg";
import imgCement    from "@assets/generated_images/industry-cement.jpg";
import imgPort      from "@assets/generated_images/industry-port.jpg";

const INDUSTRIES = [
  { name: "Food Processing",            image: imgFood,      id: "food"      },
  { name: "Packaging Lines",            image: imgPackaging, id: "packaging" },
  { name: "Glass Equipment",            image: imgGlass,     id: "glass"     },
  { name: "Crane Industry",             image: imgCrane,     id: "crane"     },
  { name: "High Voltage Switch Industry", image: imgSteel,   id: "hvswitch"  },
  { name: "Ceramics Machinery",         image: imgChemical,  id: "ceramics"  },
  { name: "Logistics Equipment",        image: imgConveyor,  id: "logistics" },
  { name: "Textile Machinery",          image: imgTextile,   id: "textile"   },
];

/* How many cards are visible at a given viewport step */
const VISIBLE = {
  mobile: 2,   // < 640
  tablet: 3,   // 640–1023
  desktop: 5,  // ≥ 1024
};

export function IndustriesSection({ hideButton = false }: { hideButton?: boolean }) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  /* Determine visible count based on viewport */
  const getVisible = () => {
    if (typeof window === "undefined") return VISIBLE.desktop;
    const w = window.innerWidth;
    return w < 640 ? VISIBLE.mobile : w < 1024 ? VISIBLE.tablet : VISIBLE.desktop;
  };

  const [visible, setVisible] = useState(getVisible);

  useEffect(() => {
    const onResize = () => setVisible(getVisible());
    window.addEventListener("resize", onResize);
    onResize(); // run immediately on mount
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const maxIndex = Math.max(0, INDUSTRIES.length - visible);

  /* Auto-rotate every 3 s; reset timer on manual nav */
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, 3000);
  };

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [maxIndex]);

  const prev = () => { setIndex((i) => Math.max(0, i - 1)); startTimer(); };
  const next = () => { setIndex((i) => Math.min(maxIndex, i + 1)); startTimer(); };

  const cardWidthPct = 100 / visible;

  return (
    <section className="bg-primary py-14 overflow-hidden">
      {/* ── Heading ── */}
      <div className="container mx-auto px-6 md:px-10 mb-8 text-center">
        <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6 leading-tight">
          Industry Application
        </h2>
        {!hideButton && (
          <Link href="/solutions">
            <Button className="bg-accent hover:bg-accent/90 text-white border-0 font-semibold px-8 py-3 text-base">
              View Industry Solutions
            </Button>
          </Link>
        )}
      </div>

      {/* ── Carousel ── */}
      <div className="relative mt-8">
        {/* Left arrow */}
        <button
          onClick={prev}
          disabled={index === 0}
          className={cn(
            "absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20",
            "w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm",
            "flex items-center justify-center transition-all",
            index === 0 ? "opacity-30 cursor-not-allowed" : "opacity-90 cursor-pointer"
          )}
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </button>

        {/* Track */}
        <div className="overflow-hidden">
          <div
            ref={trackRef}
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${index * cardWidthPct}%)` }}
          >
            {INDUSTRIES.map((ind) => (
              <div
                key={ind.id}
                style={{ width: `${cardWidthPct}%`, flexShrink: 0 }}
                className="px-1"
              >
                <div className="relative overflow-hidden"
                  style={{ aspectRatio: "3/4", maxHeight: "400px" }}>
                  <img
                    src={ind.image}
                    alt={ind.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  {/* Dark gradient at bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Label */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                    <h4 className="text-white font-heading font-bold text-sm md:text-base leading-tight">
                      {ind.name}
                    </h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right arrow */}
        <button
          onClick={next}
          disabled={index >= maxIndex}
          className={cn(
            "absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20",
            "w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm",
            "flex items-center justify-center transition-all",
            index >= maxIndex ? "opacity-30 cursor-not-allowed" : "opacity-90 cursor-pointer"
          )}
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </button>
      </div>

      {/* ── Dot indicators ── */}
      <div className="flex justify-center gap-2 mt-5">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              i === index ? "bg-accent w-6" : "bg-white/40 hover:bg-white/60"
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
