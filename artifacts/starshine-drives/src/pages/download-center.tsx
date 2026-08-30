import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useSEO, injectJSONLD, removeJSONLD } from "@/lib/seo";
import { Download, CheckCircle2, FileText, Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PRODUCTS } from "@/data/products";

/* ── Download categories ── */
const CATEGORIES = ["All", "Helical Gear", "Worm Gear", "Planetary", "Geared Motor"] as const;
type Category = typeof CATEGORIES[number];

interface DownloadItem {
  name: string;
  series: string;
  category: Category;
  slug: string;
  docUrl: string | undefined;
  fileLabel: string;
  fileSize: string;
  image: string;
}

const DOWNLOADS: DownloadItem[] = PRODUCTS.map((p) => {
  let category: Category = "Helical Gear";
  if (p.name.toLowerCase().includes("worm") || p.name.toLowerCase().includes("nmrv") || p.name.toLowerCase().includes("rv")) category = "Worm Gear";
  else if (p.name.toLowerCase().includes("planet")) category = "Planetary";
  else if (p.name.toLowerCase().includes("motor")) category = "Geared Motor";

  return {
    name: p.name,
    series: p.series,
    category,
    slug: p.slug,
    docUrl: p.docUrl,
    fileLabel: p.slug === "nmrv-worm-gear-reducers" ? "NMRV Worm Gear Reducer Manual 2025" : "RFKS Series Gear Speed Reducer Manual 2024",
    fileSize: p.slug === "nmrv-worm-gear-reducers" ? "4.2 MB" : "8.6 MB",
    image: p.image as string,
  };
});

/* Group downloads by series */
const SERIES_GROUPS = Array.from(
  DOWNLOADS.reduce((map, d) => {
    if (!map.has(d.series)) map.set(d.series, []);
    map.get(d.series)!.push(d);
    return map;
  }, new Map<string, DownloadItem[]>())
);

export default function DownloadCenter() {
  useSEO({
    title: "Gearbox Catalogues & Manuals | Starshine Drive India",
    description: "Download gear reducer catalogues, datasheets, and drawings for R/F/K/S helical, NMRV worm, and planetary gearboxes. Starshine Drive India.",
    keywords: "gearbox catalogue download, gear reducer technical manual, NMRV worm gearbox datasheet, helical gear reducer catalogue India, gearbox dimensional drawing, gear reducer PDF download",
  });
  useEffect(() => {
    injectJSONLD("ld-downloads", {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Gearbox Catalogues & Technical Manuals",
      url: "https://starshinedrive.com/download-center",
      description: "Download gear reducer catalogues, technical datasheets, dimensional drawings, and installation manuals for all Starshine Drive product series.",
      provider: {
        "@type": "Organization",
        name: "Starshine Drive",
        url: "https://starshinedrive.com",
      },
    });
    return () => removeJSONLD("ld-downloads");
  }, []);
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [search, setSearch] = useState("");

  const filtered = DOWNLOADS.filter((d) => {
    const matchCat = activeCategory === "All" || d.category === activeCategory;
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.series.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // group filtered results by series
  const grouped = Array.from(
    filtered.reduce((map, d) => {
      if (!map.has(d.series)) map.set(d.series, []);
      map.get(d.series)!.push(d);
      return map;
    }, new Map<string, DownloadItem[]>())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative min-h-[420px] md:min-h-[500px] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-[#0a4a8a]" />
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-16 grid md:grid-cols-2 gap-10 items-center w-full">
          {/* Left text */}
          <div>
            <p className="text-accent font-semibold tracking-widest text-sm uppercase mb-3">Resource Library</p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6 leading-tight">
              Product Catalogues<br />and Technical Manuals
            </h1>
            <ul className="space-y-3 mb-8">
              {["Reducer Catalogues", "Motor Documents", "Inverter Manuals"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-white/90 text-base">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <a href="mailto:sales@starshinedrive.com">
              <Button className="bg-accent hover:bg-accent/90 text-white border-0 font-semibold px-7 py-3 text-base">
                Request Document Support
              </Button>
            </a>
          </div>

          {/* Right stats */}
          <div className="hidden md:grid grid-cols-2 gap-4">
            {[
              { value: "12+", label: "Product Series" },
              { value: "50+", label: "Technical Documents" },
              { value: "3D", label: "CAD Files Available" },
              { value: "Free", label: "All Downloads" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
                <p className="text-4xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-white/70 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Technical Files Download ── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-3">
              Technical Files Download
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Download product manuals, dimensional drawings, CAD models, and technical specifications for all Starshine Drive product series.
            </p>
          </div>

          {/* Search + filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    activeCategory === cat
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {grouped.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No documents found.</div>
          ) : (
            <div className="space-y-10">
              {grouped.map(([series, items]) => (
                <div key={series}>
                  <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-accent rounded-full inline-block" />
                    {series}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                      <div
                        key={item.slug}
                        className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                      >
                        {/* Product image */}
                        <div className="bg-gray-50 h-36 flex items-center justify-center p-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="max-h-full max-w-full object-contain"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>

                        {/* Info */}
                        <div className="p-4 flex flex-col flex-1">
                          <p className="text-xs text-accent font-semibold uppercase tracking-wide mb-1">{item.series}</p>
                          <h4 className="font-bold text-primary text-sm mb-3 leading-snug">{item.name}</h4>

                          {/* File row */}
                          <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                              <span className="text-xs text-gray-500 truncate">{item.fileLabel}</span>
                            </div>
                            <a
                              href={item.docUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-primary/90 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              PDF
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Additional Resources ── */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary text-center mb-10">
            Additional Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "📐",
                title: "CAD Drawings",
                desc: "2D dimensional drawings (PDF/DWG) and 3D CAD models (STEP/IGES) for all standard frame sizes.",
                cta: "Request CAD Files",
                href: "mailto:sales@starshinedrive.com?subject=CAD File Request",
              },
              {
                icon: "🔧",
                title: "Installation Manuals",
                desc: "Step-by-step installation guides, maintenance schedules, and troubleshooting documentation.",
                cta: "Request Manual",
                href: "mailto:sales@starshinedrive.com?subject=Installation Manual Request",
              },
              {
                icon: "📋",
                title: "Product Certificates",
                desc: "ISO 9001, CE declarations, material certifications, and test reports for compliance needs.",
                cta: "Request Certificate",
                href: "mailto:sales@starshinedrive.com?subject=Certificate Request",
              },
            ].map((card) => (
              <div key={card.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col">
                <div className="text-3xl mb-4">{card.icon}</div>
                <h3 className="font-bold text-primary text-lg mb-2">{card.title}</h3>
                <p className="text-gray-500 text-sm flex-1 mb-4">{card.desc}</p>
                <a href={card.href}>
                  <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white text-sm font-semibold flex items-center justify-center gap-2">
                    {card.cta} <ChevronRight className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-primary py-14">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-heading font-bold text-white mb-4">Can't Find What You Need?</h2>
          <p className="text-white/80 mb-8">
            Our technical team can provide custom documentation, application-specific selection guides, and private-label catalogue preparation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:sales@starshinedrive.com">
              <Button className="bg-accent hover:bg-accent/90 text-white border-0 font-semibold px-8">
                Email Technical Team
              </Button>
            </a>
            <Link href="/contact">
              <Button className="bg-white text-primary hover:bg-gray-100 border-0 font-semibold px-8">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
