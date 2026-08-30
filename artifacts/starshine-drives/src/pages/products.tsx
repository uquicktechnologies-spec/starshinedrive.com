import { useState, useRef, useEffect } from "react";
import { useSEO, injectJSONLD, removeJSONLD } from "@/lib/seo";
import { Link, useSearch } from "wouter";
import { CheckSquare, ArrowRight, ChevronRight, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";
import heroImg from "@assets/generated_images/hero-lineup.webp";
import { useListPublicWebCategories, useListPublicWebProducts } from "@workspace/api-client-react";
import type { WebProductSummary } from "@workspace/api-client-react";
import type { UseQueryOptions } from "@tanstack/react-query";

function storageUrl(path: string) {
  return `/api/storage${path}`;
}

export default function Products() {
  useSEO({
    title: "Gear Reducers & Geared Motors | Starshine Drive India",
    description: "Browse Starshine Drive's industrial gearboxes: helical, worm, bevel-helical, cycloidal, planetary reducers and geared motors. Manufacturer in Gujarat, India.",
    keywords: "industrial gearbox, helical gear reducer, worm gear reducer, bevel helical gearbox, geared motor, cycloidal gear reducer, planetary gearbox, speed reducer, RFKS gear reducer, NMRV worm gearbox, RV worm gearbox, power transmission gearbox India",
  });

  useEffect(() => {
    injectJSONLD("ld-products-breadcrumb", {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://starshinedrive.com/" },
        { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://starshinedrive.com/products" },
      ]
    });
    return () => removeJSONLD("ld-products-breadcrumb");
  }, []);

  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useListPublicWebCategories();
  const search = useSearch();
  const requestedSlug = new URLSearchParams(search).get("category");

  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Once categories load, default to the requested category (via ?category=slug) or the first one.
  useEffect(() => {
    if (categories && categories.length > 0 && activeSlug === null) {
      const match = requestedSlug && categories.find((c) => c.slug === requestedSlug);
      setActiveSlug(match ? match.slug : categories[0].slug);
    }
  }, [categories, activeSlug, requestedSlug]);

  const activeCategory = categories?.find((c) => c.slug === activeSlug) ?? categories?.[0];

  const { data: categoryProducts, isLoading: productsLoading } = useListPublicWebProducts<WebProductSummary[]>(
    activeCategory ? { categorySlug: activeCategory.slug } : undefined,
    { query: { enabled: !!activeCategory } as UseQueryOptions<WebProductSummary[]> },
  );

  // Scroll active mobile tab into view
  useEffect(() => {
    if (tabsRef.current && activeCategory) {
      const btn = tabsRef.current.querySelector(`[data-id="${activeCategory.slug}"]`) as HTMLButtonElement;
      btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeCategory]);

  const handleCategoryClick = (slug: string) => {
    setActiveSlug(slug);
    // On mobile, scroll content area into view
    if (window.innerWidth < 768) {
      setTimeout(() => contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* ── Hero ── */}
      <div className="relative w-full h-[440px] md:h-[520px] overflow-hidden">
        <img
          src={heroImg}
          alt="Industrial Gear Reducers, Motors and Drives"
          className="absolute inset-0 w-full h-full object-cover object-center"
          width={1024}
          height={1024}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="container relative z-10 h-full mx-auto px-6 md:px-8 flex items-center">
          <div className="max-w-md bg-white/95 p-7 md:p-10 shadow-lg">
            <h1 className="text-2xl md:text-[2.2rem] font-heading font-bold text-primary leading-tight mb-5">
              Industrial Gear Reducers,<br />Motors and Drives
            </h1>
            <ul className="space-y-3 mb-7">
              {["Gear Reducers", "Geared Motors", "Drives & Control"].map((b) => (
                <li key={b} className="flex items-center gap-3 text-gray-700 font-medium text-[15px]">
                  <CheckSquare className="w-4 h-4 text-primary shrink-0" strokeWidth={1.5} />
                  {b}
                </li>
              ))}
            </ul>
            <Link href="/contact">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white border-0 font-semibold px-7">
                Request For Recommendation
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Product Categories heading ── */}
      <div className="pt-12 pb-6 text-center bg-white">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-accent">Product Categories</h2>
      </div>

      {categoriesError && (
        <div className="max-w-3xl mx-auto px-4 pb-16 text-center text-gray-500">
          Couldn't load product categories right now. Please try again shortly.
        </div>
      )}

      {!categoriesError && !categoriesLoading && (!categories || categories.length === 0) && (
        <div className="max-w-3xl mx-auto px-4 pb-24 text-center">
          <PackageSearch className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No product categories are published yet. Check back soon.</p>
        </div>
      )}

      {categories && categories.length > 0 && activeCategory && (
        <>
          {/* ── Mobile horizontal tab strip ── */}
          <div
            ref={tabsRef}
            className="md:hidden flex overflow-x-auto scrollbar-hide gap-1 px-4 pb-3 bg-white border-b border-gray-100 sticky top-[64px] z-20"
          >
            {categories.map((c) => (
              <button
                key={c.slug}
                data-id={c.slug}
                onClick={() => handleCategoryClick(c.slug)}
                className={cn(
                  "shrink-0 text-xs font-semibold px-4 py-2 rounded-full transition-all whitespace-nowrap",
                  activeCategory.slug === c.slug
                    ? "bg-primary text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* ── Main content: sidebar + panel ── */}
          <div className="flex flex-col md:flex-row flex-1 max-w-7xl mx-auto w-full px-0 md:px-6 lg:px-8 py-0 md:py-10 gap-0 md:gap-8">

            {/* ── Desktop sidebar ── */}
            <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0">
              <div className="sticky top-[90px] rounded-sm overflow-hidden border border-gray-200 shadow-sm">
                {categories.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => setActiveSlug(c.slug)}
                    className={cn(
                      "w-full text-left px-5 py-4 text-sm font-semibold border-b border-gray-200 last:border-b-0 transition-all flex items-center justify-between gap-2 group",
                      activeCategory.slug === c.slug
                        ? "bg-primary text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <span>{c.name}</span>
                    <ChevronRight className={cn("w-4 h-4 shrink-0 transition-transform", activeCategory.slug === c.slug ? "text-white/70" : "text-gray-300 group-hover:text-gray-500")} />
                  </button>
                ))}
              </div>
            </aside>

            {/* ── Content panel ── */}
            <div ref={contentRef} className="flex-1 min-w-0 px-4 md:px-0 pt-6 md:pt-0 scroll-mt-24">

              {/* Category header */}
              <div className="mb-8">
                <h3 className="text-2xl md:text-3xl font-heading font-bold text-primary mb-3">
                  {activeCategory.name}
                </h3>
                {activeCategory.shortDescription && (
                  <p className="text-gray-600 leading-relaxed max-w-2xl mb-4">
                    {activeCategory.shortDescription}
                  </p>
                )}
              </div>

              {/* Product cards */}
              {productsLoading && (
                <p className="text-gray-400 text-sm">Loading products…</p>
              )}

              {!productsLoading && (!categoryProducts || categoryProducts.length === 0) && (
                <div className="py-16 text-center bg-gray-50 rounded-lg border border-gray-100">
                  <PackageSearch className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No products published in this category yet.</p>
                </div>
              )}

              {!productsLoading && categoryProducts && categoryProducts.length > 0 && (
                <div className={cn(
                  "grid gap-5",
                  categoryProducts.length === 1 ? "grid-cols-1 max-w-lg" :
                  categoryProducts.length === 2 ? "grid-cols-1 sm:grid-cols-2" :
                  "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                )}>
                  {categoryProducts.map((product) => (
                    <div
                      key={product.slug}
                      className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
                    >
                      {/* Image */}
                      <div className="relative bg-gray-50 overflow-hidden flex items-center justify-center p-6 h-52">
                        {product.mainImageUrl ? (
                          <img
                            src={storageUrl(product.mainImageUrl)}
                            alt={product.name}
                            className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-md"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <PackageSearch className="w-10 h-10 text-gray-300" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-grow">
                        {product.series && (
                          <p className="text-xs font-bold text-accent uppercase tracking-wider mb-1">
                            {product.series}
                          </p>
                        )}
                        <h4 className="text-base font-heading font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors leading-snug">
                          {product.name}
                        </h4>
                        {product.tagline && (
                          <p className="text-gray-500 text-sm mb-4 flex-grow leading-relaxed line-clamp-2">
                            {product.tagline}
                          </p>
                        )}

                        <Link href={`/products/${product.slug}`}>
                          <button className="w-full bg-primary text-white font-semibold py-3 px-5 text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:bg-accent rounded-sm mt-auto">
                            <span>View Details</span>
                            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Category CTA */}
              <div className="mt-10 p-6 bg-[#f5f5f5] rounded-xl border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-primary mb-1">Need a custom spec or OEM pricing?</p>
                  <p className="text-gray-500 text-sm">Our engineers can help select the right model and size for your application.</p>
                </div>
                <Link href="/contact">
                  <Button className="bg-accent hover:bg-accent/90 text-white border-0 font-semibold whitespace-nowrap shrink-0">
                    Get a Quote
                  </Button>
                </Link>
              </div>

              {/* Browse other categories on mobile */}
              <div className="md:hidden mt-8 pt-6 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Other Product Categories</p>
                <div className="space-y-1">
                  {categories.filter((c) => c.slug !== activeCategory.slug).map((c) => (
                    <button
                      key={c.slug}
                      onClick={() => handleCategoryClick(c.slug)}
                      className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
                    >
                      {c.name}
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Bottom CTA banner ── */}
      <section className="bg-primary py-14 mt-10">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-3">
            Can't Find the Right Model?
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            We manufacture custom gear reducer variants for OEM projects — modified shafts, non-standard ratios, special mounting, and private-label supply.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button className="bg-accent hover:bg-accent/90 text-white border-0 font-semibold px-8">
                Request Custom Spec
              </Button>
            </Link>
            <Link href="/selection-guide">
              <Button className="bg-white text-primary hover:bg-gray-100 border-0 font-semibold px-8">
                Open Selection Guide
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
