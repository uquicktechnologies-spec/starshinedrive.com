import { useState, useEffect } from "react";
import { useSEO, injectJSONLD, removeJSONLD } from "@/lib/seo";
import { useParams, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ContactModal } from "@/components/ui/contact-modal";
import { TechnicalDatasheet } from "@/components/product/TechnicalDatasheet";
import { MountingVariantsSection } from "@/components/product/MountingVariantsSection";
import {
  CheckSquare,
  FileText,
  ChevronRight,
  ArrowRight,
  ChevronLeft,
  Factory,
  Package,
  UtensilsCrossed,
  Scissors,
  HeartPulse,
  FlaskConical,
  DoorOpen,
  ShoppingCart,
  Mountain,
  Printer,
  TreePine,
  Building2,
  Wheat,
  ArrowUpFromLine,
  Droplets,
  Flame,
  Bot,
  Layers,
  Wind,
} from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/data/products";
import { PRODUCT_APP_IMAGES } from "@/data/products-app-images";
import NotFound from "@/pages/not-found";

/* Fallback Unsplash images for products without real app photos */
const FALLBACK_IMGS = [
  "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1586528116493-da5d7be6e4e3?w=800&h=500&fit=crop",
];

/* Map application label keywords → Lucide icon for the icon-grid fallback */
function AppIcon({ label }: { label: string }) {
  const l = label.toLowerCase();
  const cls = "w-6 h-6 text-primary";
  if (l.includes("conveyor") || l.includes("belt") || l.includes("roller")) return <Layers className={cls} />;
  if (l.includes("packag")) return <Package className={cls} />;
  if (l.includes("food") || l.includes("beverage") || l.includes("bottling") || l.includes("filling")) return <UtensilsCrossed className={cls} />;
  if (l.includes("textile") || l.includes("fabric") || l.includes("wood") || l.includes("panel")) return <Scissors className={cls} />;
  if (l.includes("medical") || l.includes("lab") || l.includes("pharma")) return <HeartPulse className={cls} />;
  if (l.includes("chemical") || l.includes("mixing") || l.includes("mixer") || l.includes("reactor")) return <FlaskConical className={cls} />;
  if (l.includes("gate") || l.includes("door")) return <DoorOpen className={cls} />;
  if (l.includes("vending") || l.includes("retail")) return <ShoppingCart className={cls} />;
  if (l.includes("mining") || l.includes("quarry") || l.includes("cement") || l.includes("concrete") || l.includes("stone")) return <Mountain className={cls} />;
  if (l.includes("print")) return <Printer className={cls} />;
  if (l.includes("tree") || l.includes("forestry") || l.includes("timber")) return <TreePine className={cls} />;
  if (l.includes("building") || l.includes("construction") || l.includes("agri") || l.includes("grain") || l.includes("wheat")) return <Wheat className={cls} />;
  if (l.includes("lift") || l.includes("hoist") || l.includes("crane") || l.includes("elevator") || l.includes("vertical")) return <ArrowUpFromLine className={cls} />;
  if (l.includes("pump") || l.includes("water") || l.includes("irrigation")) return <Droplets className={cls} />;
  if (l.includes("kiln") || l.includes("ceramic") || l.includes("glass") || l.includes("heat") || l.includes("furnace")) return <Flame className={cls} />;
  if (l.includes("screw") || l.includes("feeder") || l.includes("auger")) return <Wind className={cls} />;
  if (l.includes("auto") || l.includes("robot") || l.includes("automated")) return <Bot className={cls} />;
  if (l.includes("building") || l.includes("facility") || l.includes("plant")) return <Building2 className={cls} />;
  return <Factory className={cls} />;
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [modalOpen, setModalOpen] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const product = getProductBySlug(slug ?? "");

  // Per-product SEO — called before early return to satisfy hooks rules
  useSEO({
    title: product
      ? `${product.name} | Industrial Gear Reducer India | Starshine Drive`
      : "Gear Reducer | Starshine Drive",
    description: product
      ? `${product.name} by Starshine Drive — ${product.tagline} ${product.keyRange.join(", ")}. Industrial gear reducer manufacturer in Gujarat, India. ISO/CE certified. OEM supply from 1 unit.`
      : "Industrial gear reducer manufacturer in India.",
    keywords: product
      ? `${product.name.toLowerCase()}, ${product.series.toLowerCase()}, gear reducer India, gearbox manufacturer India, ${product.applications.slice(0, 3).join(", ").toLowerCase()}, speed reducer India, industrial gearbox Gujarat`
      : "gear reducer India",
    canonical: `https://starshinedrive.com/products/${slug}`,
  });

  useEffect(() => {
    if (!product) return;
    injectJSONLD("ld-product", {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": product.tagline,
      "brand": { "@type": "Brand", "name": "Starshine Drive" },
      "manufacturer": {
        "@type": "Organization",
        "name": "Starshine Drive",
        "address": { "@type": "PostalAddress", "addressLocality": "Morbi", "addressRegion": "Gujarat", "addressCountry": "IN" }
      },
      "offers": {
        "@type": "Offer",
        "availability": "https://schema.org/InStock",
        "priceCurrency": "USD",
        "seller": { "@type": "Organization", "name": "Starshine Drive" }
      },
      "additionalProperty": product.techSpecs.map(s => ({
        "@type": "PropertyValue",
        "name": s.label,
        "value": s.value
      })),
    });
    injectJSONLD("ld-product-breadcrumb", {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://starshinedrive.com/" },
        { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://starshinedrive.com/products" },
        { "@type": "ListItem", "position": 3, "name": product.name, "item": `https://starshinedrive.com/products/${slug}` },
      ]
    });
    return () => { removeJSONLD("ld-product"); removeJSONLD("ld-product-breadcrumb"); };
  }, [product, slug]);

  if (!product) return <NotFound />;

  const related = getRelatedProducts(product.relatedSlugs);
  const relatedCardCopy = product.slug === "s-series-helical-worm-gear-reducer"
    ? {
        "sck-helical-hypoid-gear-unit": {
          name: "SCK Helical-Hypoid Gear Unit",
          tagline: "RV-compatible helical-hypoid layout for compact right-angle upgrade paths.",
        },
        "f-series-parallel-shaft-helical-gear-reducer": {
          name: "F Series Parallel-Shaft Helical Gear Reducer",
          tagline: "Parallel-shaft helical layout for compact side-mounted installation.",
        },
        "s-series-helical-worm-gear-reducer": {
          name: "S Series Helical-Worm Gear Reducer",
          tagline: "Compact helical-worm layout for right-angle geared motor packages.",
        },
        "nmrv-worm-gear-reducers": {
          name: "NMRV Worm Gear Reducer",
          tagline: "Fixed-ratio worm layout for compact right-angle transmission.",
        },
      }
    : {};

  /* Use real photos when available */
  const hasRealImages = !!PRODUCT_APP_IMAGES[product.slug];
  const appSlides = PRODUCT_APP_IMAGES[product.slug] ?? product.applications.map((label, i) => ({
    label,
    img: FALLBACK_IMGS[i % FALLBACK_IMGS.length],
  }));
  const total = appSlides.length;
  const p2 = (activeSlide - 2 + total) % total; // far-left  (desktop only)
  const p1 = (activeSlide - 1 + total) % total; // left
  const n1 = (activeSlide + 1) % total;          // right
  const n2 = (activeSlide + 2) % total;          // far-right (desktop only)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#f0f0f0]">
        {/* White diagonal wedge covering the left/text side */}
        <div
          className="absolute inset-0 bg-white hidden md:block"
          style={{ clipPath: "polygon(0 0, 63% 0, 47% 100%, 0 100%)" }}
        />
        {/* Mobile: plain white bg */}
        <div className="absolute inset-0 bg-white md:hidden" />

        <div className="max-w-6xl relative mx-auto px-4 md:px-8 py-12 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">

            {/* ── Text (left) ── */}
            <div className="relative z-10">
              <h1 className="text-[2rem] md:text-[2.75rem] font-heading font-bold text-primary leading-tight mb-5">
                {product.name}
              </h1>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-5 mb-5">
                {["Start From 1 Unit", "15 Days Delivery", "OEM Support"].map((badge) => (
                  <span key={badge} className="flex items-center gap-1.5 text-[13px] text-gray-500 font-medium">
                    <CheckSquare className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    {badge}
                  </span>
                ))}
              </div>

              <p className="text-gray-500 text-[14px] leading-relaxed mb-6 max-w-md">
                {product.tagline}
              </p>

              {/* Key Range */}
              <div className="mb-6">
                <h2 className="text-primary font-heading font-bold text-base mb-3">
                  Key Range
                </h2>
                <ul className="space-y-2">
                  {product.keyRange.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[14px] text-gray-700">
                      <span className="mt-[6px] w-2 h-2 rounded-full bg-accent shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Download link */}
              {product.docUrl ? (
                <a
                  href={product.docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:text-accent transition-colors mb-7 font-medium"
                >
                  <FileText className="w-4 h-4" />
                  Download documents
                </a>
              ) : (
                <button
                  onClick={() => setDownloadModalOpen(true)}
                  className="inline-flex items-center gap-2 text-sm text-primary hover:text-accent transition-colors mb-7 font-medium"
                >
                  <FileText className="w-4 h-4" />
                  Download documents
                </button>
              )}

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  onClick={() => setModalOpen(true)}
                  className="bg-accent hover:bg-accent/90 text-white border-0 font-semibold px-8"
                >
                  Send Requirements
                </Button>
              </div>
            </div>

            {/* ── Product image (right, on gray) ── */}
            <div className="relative z-10 flex items-center justify-center py-6 md:py-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-full max-w-[360px] md:max-w-[580px] h-auto object-contain drop-shadow-2xl"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </div>

          </div>
        </div>
      </section>
      {/* ── Technical Datasheets ─────────────────────────────── */}
      <TechnicalDatasheet product={product} onDownload={() => setDownloadModalOpen(true)} />
      {/* ── Mounting Variants ────────────────────────────────── */}
      <MountingVariantsSection product={product} onContact={() => setModalOpen(true)} />
      {/* ── Product Description band ─────────────────────────── */}
      <section className="relative overflow-hidden bg-white">
        <div className="max-w-6xl relative mx-auto px-4 md:px-8 py-14 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">

            {/* Left — product image on the white diagonal area */}
            <div className="relative z-10 flex items-center justify-center py-4 md:py-0">
              <img
                src={product.descriptionImage ?? product.image}
                alt={product.name}
                className="w-full max-w-[320px] md:max-w-[480px] h-auto object-contain drop-shadow-2xl"
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Right — text */}
            <div className="relative z-10">
              <h3 className="text-[1.5rem] md:text-[1.85rem] font-heading font-bold text-primary mb-5 leading-tight">
                {product.descriptionTitle ?? product.name}
              </h3>
              <ul className="space-y-2 mb-8">
                {(product.descriptionFeatures ?? product.features.slice(0, 3)).map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[14px] text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => setModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-white border-0 font-semibold px-7"
              >
                Send Requirements
              </Button>
            </div>

          </div>
        </div>
      </section>
      {/* ── Typical Applications ──────────────────────────────── */}
      <section className="bg-[#f0f0f0] pb-12 overflow-hidden pr-[10px] pl-[10px] pt-[0px] mt-[0px] mb-[0px]">
        {/* White V-chevron divider from section above */}
        <div className="w-full overflow-hidden leading-none" style={{ height: 120 }}>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
            <polygon points="0,0 1200,0 600,120" fill="white" />
          </svg>
        </div>
        {/* Header */}
        <div className="max-w-6xl mx-auto px-4 text-center mb-8 pt-6">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-[40px]">
            Typical Applications
          </h2>
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-accent hover:bg-accent/90 text-white border-0 font-semibold px-7 pt-[8px] pb-[8px] pl-[30px] pr-[30px]"
          >
            Get Industry Solution
          </Button>
        </div>

        {hasRealImages ? (
          /* ── Photo carousel — 6 panels, no overflow ── */
          (<div className="relative flex items-center justify-center w-full">
            {/* Left arrow */}
            <button
              onClick={() => setActiveSlide(p1)}
              className="absolute left-2 md:left-4 z-20 bg-white/80 hover:bg-white shadow-md rounded-full w-9 h-9 flex items-center justify-center transition-all"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5 text-primary" />
            </button>
              {/* Slides row — desktop: 12%+20%+36%+20%+12%=100%; mobile: active image only */}
            <div className="flex items-end w-full gap-[2px] pt-[25px] pb-[25px]">

              {/* p2 — far-left, desktop only (12%) */}
              <div
                className="relative overflow-hidden cursor-pointer shrink-0 hidden md:block"
                style={{ width: "12%", height: "193px" }}
                onClick={() => setActiveSlide(p2)}
              >
                <img src={appSlides[p2].img} alt={appSlides[p2].label}
                  className="w-full h-full object-cover pointer-events-none" loading="lazy" decoding="async" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                <p className="absolute bottom-2 left-2 text-white text-xs font-semibold leading-tight drop-shadow line-clamp-2">
                  {appSlides[p2].label}
                </p>
              </div>

              {/* p1 — left (desktop only) */}
              <div
                className="relative overflow-hidden cursor-pointer shrink-0 hidden md:block md:w-[20%]"
                style={{ height: "231px" }}
                onClick={() => setActiveSlide(p1)}
              >
                <img src={appSlides[p1].img} alt={appSlides[p1].label}
                  className="w-full h-full object-cover pointer-events-none" loading="lazy" decoding="async" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <p className="absolute bottom-2 left-2 text-white text-xs md:text-sm font-semibold leading-tight drop-shadow line-clamp-2">
                  {appSlides[p1].label}
                </p>
              </div>

              {/* active — center (mobile: full width, desktop: 36%) */}
              <div
                className="relative overflow-hidden shrink-0 z-10 w-full md:w-[36%]"
                style={{ height: "281px" }}
              >
                <img src={appSlides[activeSlide].img} alt={appSlides[activeSlide].label}
                  className="w-full h-full object-cover pointer-events-none" loading="lazy" decoding="async" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pt-[0px] pb-[0px] mt-[0px] mb-[0px] ml-[0px] mr-[0px] pl-[0px] pr-[0px]" />
                <p className="absolute bottom-3 left-3 text-white text-sm md:text-base font-bold leading-tight drop-shadow line-clamp-2">
                  {appSlides[activeSlide].label}
                </p>
              </div>

              {/* n1 — right (desktop only) */}
              <div
                className="relative overflow-hidden cursor-pointer shrink-0 hidden md:block md:w-[20%]"
                style={{ height: "231px" }}
                onClick={() => setActiveSlide(n1)}
              >
                <img src={appSlides[n1].img} alt={appSlides[n1].label}
                  className="w-full h-full object-cover pointer-events-none" loading="lazy" decoding="async" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <p className="absolute bottom-2 left-2 text-white text-xs md:text-sm font-semibold leading-tight drop-shadow line-clamp-2">
                  {appSlides[n1].label}
                </p>
              </div>

              {/* n2 — far-right, desktop only (12%) */}
              <div
                className="relative overflow-hidden cursor-pointer shrink-0 hidden md:block"
                style={{ width: "12%", height: "193px" }}
                onClick={() => setActiveSlide(n2)}
              >
                <img src={appSlides[n2].img} alt={appSlides[n2].label}
                  className="w-full h-full object-cover pointer-events-none" loading="lazy" decoding="async" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                <p className="absolute bottom-2 left-2 text-white text-xs font-semibold leading-tight drop-shadow line-clamp-2">
                  {appSlides[n2].label}
                </p>
              </div>

            </div>
            {/* Right arrow */}
            <button
              onClick={() => setActiveSlide(n1)}
              className="absolute right-2 md:right-4 z-20 bg-white/80 hover:bg-white shadow-md rounded-full w-9 h-9 flex items-center justify-center transition-all"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5 text-primary" />
            </button>
          </div>)
        ) : (
          /* ── Icon grid (products without real app images) ── */
          (<div className="max-w-4xl mx-auto px-6 pb-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {product.applications.map((app, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-5 flex flex-col items-center gap-3 text-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <AppIcon label={app} />
                  </div>
                  <p className="text-sm font-semibold text-gray-800 leading-snug">{app}</p>
                </div>
              ))}
            </div>
          </div>)
        )}
      </section>
      {/* ── Related Products ─────────────────────────────────── */}
      {related.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary text-center mb-10">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((rel) => (
                <div key={rel.slug} className="group bg-white border border-gray-200 rounded-sm overflow-hidden flex flex-col">
                  {/* Image — full-width, white bg, large */}
                  <div className="flex items-center justify-center h-52 p-6 bg-white border-b border-gray-100">
                    <img
                      src={rel.image}
                      alt={rel.name}
                      className="max-h-full w-full object-contain group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  {/* Content */}
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <h4 className="font-heading font-bold text-primary text-[15px] leading-snug">
                      {relatedCardCopy[rel.slug as keyof typeof relatedCardCopy]?.name ?? rel.name}
                    </h4>
                    <p className="text-gray-500 text-[13px] leading-relaxed flex-1 line-clamp-3">
                      {relatedCardCopy[rel.slug as keyof typeof relatedCardCopy]?.tagline ?? rel.tagline}
                    </p>
                    <Link href={`/products/${rel.slug}`}>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white border-0 font-semibold text-sm mt-1">
                        Product Detail
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      <Footer />
      <ContactModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        productName={product.name}
      />
      <ContactModal
        open={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        productName={product.name}
        defaultPurpose="Catalog / Drawing Request"
      />
    </div>
  );
}
