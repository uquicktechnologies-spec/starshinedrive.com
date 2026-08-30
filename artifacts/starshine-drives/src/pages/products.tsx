import { useMemo, useState, useRef, useEffect } from "react";
import { useSEO, injectJSONLD, removeJSONLD } from "@/lib/seo";
import { Link, useSearch } from "wouter";
import { CheckSquare, ArrowRight, ChevronRight, Filter, PackageSearch, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";
import heroImg from "@assets/generated_images/hero-lineup.webp";
import { useListPublicWebCategories, useListPublicWebProducts } from "@workspace/api-client-react";
import type { WebProductSummary } from "@workspace/api-client-react";
import type { UseQueryOptions } from "@tanstack/react-query";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

function storageUrl(path: string) {
  return `/api/storage${path}`;
}

type FilterProduct = WebProductSummary & {
  productType?: string | null;
  powerRange?: { min: number; max: number } | null;
  ratioRange?: { min: number; max: number } | null;
};

type FilterState = {
  productType: string;
  power: [number, number];
  ratio: [number, number];
};

type NumericRange = {
  min: number;
  max: number;
};

const FALLBACK_POWER_RANGE: NumericRange = { min: 0, max: 160 };
const FALLBACK_RATIO_RANGE: NumericRange = { min: 1, max: 100 };

function getNumericBounds(products: FilterProduct[], key: "powerRange" | "ratioRange", fallback: NumericRange): NumericRange {
  const ranges = products.map((product) => product[key]).filter((range): range is NumericRange => !!range);
  if (ranges.length === 0) return fallback;
  return {
    min: Math.min(...ranges.map((range) => range.min)),
    max: Math.max(...ranges.map((range) => range.max)),
  };
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function displayProductType(value: string) {
  const normalized = value.toLowerCase();
  if (normalized.includes("helical")) return "Helical";
  if (normalized.includes("worm")) return "Worm";
  if (normalized.includes("planetary")) return "Planetary";
  if (normalized.includes("cycloidal")) return "Cycloidal";
  if (normalized.includes("bevel")) return "Bevel";
  if (normalized.includes("gear")) return value.replace(/\bgear(box|boxes)?\b/gi, "").replace(/\s+/g, " ").trim();
  return value;
}

function ProductFilters({
  products,
  state,
  powerBounds,
  ratioBounds,
  onChange,
  onClear,
}: {
  products: FilterProduct[];
  state: FilterState;
  powerBounds: NumericRange;
  ratioBounds: NumericRange;
  onChange: (next: Partial<FilterState>) => void;
  onClear: () => void;
}) {
  const types = [...new Set(products.map((product) => product.productType ?? product.categoryName).filter(Boolean))]
    .map((type) => ({ value: type as string, label: displayProductType(type as string) }));
  const hasRatioData = products.some((product) => product.ratioRange);
  const hasActiveFilters = state.productType !== "all"
    || state.power[0] !== powerBounds.min
    || state.power[1] !== powerBounds.max
    || state.ratio[0] !== ratioBounds.min
    || state.ratio[1] !== ratioBounds.max;

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-primary">Refine results</p>
          <p className="text-xs text-gray-500 mt-1">Find the right drive faster.</p>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-primary transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      <fieldset>
        <legend className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Product Type</legend>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => onChange({ productType: "all" })}
            aria-pressed={state.productType === "all"}
            className={cn(
              "w-full rounded-sm border px-3 py-2 text-left text-sm transition-colors",
              state.productType === "all" ? "border-primary bg-primary/5 text-primary font-semibold" : "border-gray-200 text-gray-600 hover:border-primary/40",
            )}
          >
            All product types
          </button>
          {types.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => onChange({ productType: type.value })}
              aria-pressed={state.productType === type.value}
              className={cn(
                "w-full rounded-sm border px-3 py-2 text-left text-sm transition-colors",
                state.productType === type.value ? "border-primary bg-primary/5 text-primary font-semibold" : "border-gray-200 text-gray-600 hover:border-primary/40",
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Power range</legend>
        <div className="flex items-center justify-between text-xs font-semibold text-primary mb-3">
          <span>{formatNumber(state.power[0])} kW</span>
          <span>{formatNumber(state.power[1])} kW</span>
        </div>
        <Slider
          min={powerBounds.min}
          max={Math.max(powerBounds.max, powerBounds.min + 1)}
          step={0.01}
          value={state.power}
          onValueChange={(value) => {
            if (value.length === 2) onChange({ power: [value[0], value[1]] });
          }}
          aria-label="Power range in kilowatts"
        />
        <div className="flex justify-between text-[11px] text-gray-400 mt-2">
          <span>{formatNumber(powerBounds.min)} kW</span>
          <span>{formatNumber(powerBounds.max)} kW</span>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Gear ratio</legend>
        {hasRatioData ? (
          <>
            <div className="flex items-center justify-between text-xs font-semibold text-primary mb-3">
              <span>1:{formatNumber(state.ratio[0])}</span>
              <span>1:{formatNumber(state.ratio[1])}</span>
            </div>
            <Slider
              min={ratioBounds.min}
              max={Math.max(ratioBounds.max, ratioBounds.min + 1)}
              step={0.01}
              value={state.ratio}
              onValueChange={(value) => {
                if (value.length === 2) onChange({ ratio: [value[0], value[1]] });
              }}
              aria-label="Gear ratio range"
            />
            <div className="flex justify-between text-[11px] text-gray-400 mt-2">
              <span>1:{formatNumber(ratioBounds.min)}</span>
              <span>1:{formatNumber(ratioBounds.max)}</span>
            </div>
            {products.some((product) => !product.ratioRange) && (
              <p className="text-[11px] leading-relaxed text-gray-400 mt-3">
                Products without a published ratio are omitted when this range is narrowed.
              </p>
            )}
          </>
        ) : (
          <div className="rounded-sm border border-dashed border-gray-200 bg-gray-50 px-3 py-3">
            <p className="text-xs font-semibold text-gray-600">Ratio data is not listed for this category yet.</p>
            <p className="text-[11px] leading-relaxed text-gray-400 mt-1">Contact our engineers for ratio selection support.</p>
          </div>
        )}
      </fieldset>
    </div>
  );
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
  const filterProducts = (categoryProducts ?? []) as FilterProduct[];
  const powerBounds = useMemo(() => getNumericBounds(filterProducts, "powerRange", FALLBACK_POWER_RANGE), [filterProducts]);
  const ratioBounds = useMemo(() => getNumericBounds(filterProducts, "ratioRange", FALLBACK_RATIO_RANGE), [filterProducts]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    productType: "all",
    power: [FALLBACK_POWER_RANGE.min, FALLBACK_POWER_RANGE.max],
    ratio: [FALLBACK_RATIO_RANGE.min, FALLBACK_RATIO_RANGE.max],
  });

  useEffect(() => {
    setFilters((current) => ({
      ...current,
      power: [powerBounds.min, powerBounds.max],
      ratio: [ratioBounds.min, ratioBounds.max],
    }));
  }, [powerBounds.min, powerBounds.max, ratioBounds.min, ratioBounds.max]);

  useEffect(() => {
    setFilters((current) => ({ ...current, productType: "all" }));
  }, [activeCategory?.slug]);

  const filteredProducts = useMemo(() => filterProducts.filter((product) => {
    const typeMatches = filters.productType === "all"
      || (product.productType ?? product.categoryName) === filters.productType;
    const powerMatches = !product.powerRange
      ? filters.power[0] === powerBounds.min && filters.power[1] === powerBounds.max
      : product.powerRange.max >= filters.power[0] && product.powerRange.min <= filters.power[1];
    const ratioMatches = !product.ratioRange
      ? filters.ratio[0] === ratioBounds.min && filters.ratio[1] === ratioBounds.max
      : product.ratioRange.max >= filters.ratio[0] && product.ratioRange.min <= filters.ratio[1];
    return typeMatches && powerMatches && ratioMatches;
  }), [filterProducts, filters, powerBounds, ratioBounds]);

  const updateFilters = (next: Partial<FilterState>) => setFilters((current) => ({ ...current, ...next }));
  const clearFilters = () => setFilters({
    productType: "all",
    power: [powerBounds.min, powerBounds.max],
    ratio: [ratioBounds.min, ratioBounds.max],
  });

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

              {/* Catalogue filters */}
              <div className="flex items-center justify-between gap-4 mb-6 pb-5 border-b border-gray-100">
                <p className="text-sm text-gray-500">
                  Showing <span className="font-bold text-primary">{filteredProducts.length}</span> of {filterProducts.length} products
                </p>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="md:hidden inline-flex items-center gap-2 border border-primary/20 text-primary rounded-sm px-3 py-2 text-sm font-semibold"
                >
                  <Filter className="w-4 h-4" /> Filters
                </button>
              </div>

              <aside className="hidden md:block border border-gray-200 rounded-sm p-5 mb-8 bg-white">
                <ProductFilters
                  products={filterProducts}
                  state={filters}
                  powerBounds={powerBounds}
                  ratioBounds={ratioBounds}
                  onChange={updateFilters}
                  onClear={clearFilters}
                />
              </aside>

              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetContent side="right" className="w-[min(88vw,380px)] overflow-y-auto">
                  <SheetHeader className="text-left mb-8">
                    <SheetTitle className="flex items-center gap-2 text-primary">
                      <SlidersHorizontal className="w-5 h-5" /> Filter products
                    </SheetTitle>
                    <SheetDescription>Adjust the filters to narrow the catalogue. Results update instantly.</SheetDescription>
                  </SheetHeader>
                  <ProductFilters
                    products={filterProducts}
                    state={filters}
                    powerBounds={powerBounds}
                    ratioBounds={ratioBounds}
                    onChange={updateFilters}
                    onClear={clearFilters}
                  />
                  <Button className="w-full bg-primary hover:bg-accent mt-8" onClick={() => setFiltersOpen(false)}>
                    View {filteredProducts.length} result{filteredProducts.length === 1 ? "" : "s"}
                  </Button>
                </SheetContent>
              </Sheet>

              {/* Product cards */}
              {productsLoading && (
                <p className="text-gray-400 text-sm">Loading products…</p>
              )}

              {!productsLoading && filterProducts.length === 0 && (
                <div className="py-16 text-center bg-gray-50 rounded-lg border border-gray-100">
                  <PackageSearch className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No products published in this category yet.</p>
                </div>
              )}

              {!productsLoading && filterProducts.length > 0 && filteredProducts.length === 0 && (
                <div className="py-16 text-center bg-gray-50 rounded-lg border border-gray-100">
                  <Filter className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-semibold mb-2">No products match these filters.</p>
                  <button type="button" onClick={clearFilters} className="text-accent text-sm font-semibold hover:text-primary">
                    Clear filters and show all products
                  </button>
                </div>
              )}

              {!productsLoading && filteredProducts.length > 0 && (
                <div className={cn(
                  "grid gap-5",
                  filteredProducts.length === 1 ? "grid-cols-1 max-w-lg" :
                  filteredProducts.length === 2 ? "grid-cols-1 sm:grid-cols-2" :
                  "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                )}>
                  {filteredProducts.map((product) => (
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
