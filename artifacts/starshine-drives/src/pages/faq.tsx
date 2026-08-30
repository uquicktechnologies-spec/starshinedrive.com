import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useSEO, injectJSONLD, removeJSONLD } from "@/lib/seo";
import { ChevronDown, CheckCircle2, Search, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Selection", "OEM", "Replacement", "Quality", "Ordering", "Support"] as const;
type Category = typeof CATEGORIES[number];

interface FAQItem {
  q: string;
  a: string;
  category: Category;
}

const FAQS: FAQItem[] = [
  // ── Selection ──
  {
    category: "Selection",
    q: "How do I choose the right gear reducer for my application?",
    a: "To select the correct gear reducer, you need to define: required output speed (r/min) or gear ratio, output torque (N·m) or motor power (kW), mounting position (foot, flange, or shaft-mounted), duty cycle and operating hours per day, input configuration (direct motor, shaft input, or flange), and environment conditions (temperature range, IP rating, dust/moisture exposure). Our technical team can assist with selection once these parameters are provided.",
  },
  {
    category: "Selection",
    q: "What is the difference between R Series and F Series?",
    a: "The R Series is an inline (coaxial) helical reducer where the input and output shafts share the same axis — ideal for straight-line power transmission. The F Series is a parallel-shaft helical reducer where the input and output shafts run parallel but offset, making it more compact in height for applications requiring a lower profile or side-mounted drive.",
  },
  {
    category: "Selection",
    q: "What is the difference between R Series and K Series?",
    a: "The R Series uses inline helical gears for high-efficiency, quiet, coaxial power transmission. The K Series is a helical-bevel gear reducer with a 90° shaft angle, suitable for applications requiring a right-angle drive with high torque density and compact footprint.",
  },
  {
    category: "Selection",
    q: "When should I use a worm gear reducer instead of a helical reducer?",
    a: "Worm gear reducers (NMRV/RV Series) are preferred when you need a compact right-angle drive, self-locking capability, high reduction ratio in a single stage (up to 1:100), or a lower-cost solution for lighter-duty applications. Helical reducers offer higher efficiency (95–98%) and are better suited for continuous high-power applications.",
  },
  {
    category: "Selection",
    q: "What is the difference between NMRV and RV Series worm reducers?",
    a: "NMRV Series uses an aluminium alloy housing — lightweight, compact, and ideal for automation and food machinery. RV Series uses a cast iron housing — heavier and more robust, suited for industrial environments with shock loads, high torque demands, or outdoor exposure.",
  },
  {
    category: "Selection",
    q: "Can I use a VFD (variable frequency drive) with your reducers?",
    a: "Yes. All Starshine gear reducers are compatible with VFDs/inverters. For continuous operation below 25 Hz, forced cooling or an independent fan motor is recommended. Please specify VFD operation when ordering so the correct motor insulation class (Class F or H) and thermistor options are selected.",
  },
  {
    category: "Selection",
    q: "What gear ratio range is available?",
    a: "Gear ratio ranges vary by series: R/F/K/S Series — i = 1.25 to 28,233 (multi-stage); NMRV Series — i = 5 to 100 (single stage), up to 10,000 (double stage); Planetary Series — i = 3 to 512 (up to 4 stages). Please contact us with your required output speed and input speed for an exact ratio recommendation.",
  },
  {
    category: "Selection",
    q: "What is the maximum torque available?",
    a: "Output torque varies by series and frame size. R Series handles up to 18,000 N·m, K Series up to 50,000 N·m, F Series up to 18,000 N·m, S Series up to 4,200 N·m, and NMRV up to 1,550 N·m. For planetary gearboxes, rated torque up to 5,000 N·m is available. Contact us with your exact requirements for size selection.",
  },

  // ── OEM ──
  {
    category: "OEM",
    q: "Does Starshine offer OEM / private-label manufacturing?",
    a: "Yes. Starshine has provided OEM and private-label gear reducers to global machine builders since 1965. We can produce units with your brand nameplate, custom colour, special shaft dimensions, modified mounting patterns, or unique housing features. MOQ and tooling costs apply for highly customised items.",
  },
  {
    category: "OEM",
    q: "What is the minimum order quantity (MOQ) for OEM orders?",
    a: "For standard catalogue products, there is no strict MOQ — we accept orders starting from 1 unit. For OEM customisation (custom nameplates, modified housing, special colour), MOQ is typically 50–100 units depending on complexity. Please contact our sales team to discuss your volume requirements.",
  },
  {
    category: "OEM",
    q: "Can Starshine produce custom gear ratios or shaft configurations?",
    a: "Yes. We can produce non-standard gear ratios, modified shaft diameters, extended or shortened shaft lengths, hollow shaft configurations, and special keyway or spline profiles. Please provide your technical drawing or specifications for engineering review and quotation.",
  },
  {
    category: "OEM",
    q: "What certifications do your products carry?",
    a: "Starshine products are manufactured under ISO 9001:2015 quality management. Our motors carry CE marking for EU market compliance. Material certifications, test reports, and dimensional inspection reports are available upon request. ATEX-rated units for hazardous environments are available as a special order.",
  },
  {
    category: "OEM",
    q: "Can you supply matched gearmotor units?",
    a: "Yes. We supply complete gearmotor packages with IEC-standard motors (standard induction, brake motor, VFD-rated, or multi-speed). Motor power from 0.12 kW to 160 kW is available. Motors are tested and shipped as an assembled unit with the reducer for plug-and-play installation.",
  },
  {
    category: "OEM",
    q: "What is the lead time for OEM production runs?",
    a: "Standard catalogue products are available within 7–15 business days. For OEM runs with light customisation (nameplate, colour), lead time is typically 20–30 days after order confirmation and sample approval. Heavily customised or new-tooling orders require 45–60 days. We recommend placing forecast orders to avoid delays.",
  },

  // ── Replacement ──
  {
    category: "Replacement",
    q: "Can Starshine reducers replace SEW, Bonfiglioli, or Nord units?",
    a: "In most cases, yes. Starshine R/F/K/S Series are dimensionally compatible with DIN/IEC standard foot, flange, and shaft-mounted configurations used by major European brands. Please provide the old unit's nameplate data (series, frame size, ratio, output torque, mounting form) and installation drawing for our engineers to confirm interchangeability.",
  },
  {
    category: "Replacement",
    q: "What information do I need to provide for a replacement unit?",
    a: "Please provide: the old reducer's brand, series, and model number; nameplate data (ratio, output torque/speed, mounting form); a photo of the old unit and its nameplate; the installation drawing or dimensional sketch if available. With this information we can identify a compatible Starshine unit within one business day.",
  },
  {
    category: "Replacement",
    q: "Are Starshine reducers drop-in replacements or will modification be needed?",
    a: "Standard DIN/IEC frame-size units are typically drop-in replacements. Some older or proprietary designs may require a transition adapter plate or modified shaft coupling. We will advise on any required adaptations at the quotation stage — there is no charge for replacement feasibility assessment.",
  },
  {
    category: "Replacement",
    q: "Can I order spare parts rather than a complete replacement unit?",
    a: "Yes. Common spare parts including output shaft seals, bearings, oil seals, inspection covers, and breather plugs are available. For worm wheels, gears, and housings, please provide the model number and serial number from the unit's nameplate. Our parts team will advise on availability and lead time.",
  },

  // ── Quality ──
  {
    category: "Quality",
    q: "What quality standards does Starshine follow in manufacturing?",
    a: "Starshine operates under ISO 9001:2015 certified quality management. Key processes include incoming raw material inspection, gear tooth profile and hardness testing after heat treatment, dimensional inspection at each machining stage, 100% no-load run testing before dispatch, and final packaging inspection. Test reports are available for OEM orders.",
  },
  {
    category: "Quality",
    q: "What materials are used in gear and housing construction?",
    a: "Gear sets are manufactured from 20CrMnTi or 42CrMo4 alloy steel, carburised and case-hardened to HRC 58–62 for high wear resistance. R/F/K/S Series housings use grey cast iron (GG25). NMRV Series housings use die-cast aluminium alloy (ADC12). RV Series uses nodular cast iron for higher impact resistance.",
  },
  {
    category: "Quality",
    q: "What is the warranty on Starshine products?",
    a: "All Starshine gear reducers carry a 12-month warranty from the date of dispatch against manufacturing defects under normal operating conditions. The warranty covers defects in material and workmanship but excludes damage caused by incorrect installation, overloading, unsuitable lubricant, or lack of maintenance.",
  },
  {
    category: "Quality",
    q: "What IP protection rating are your reducers built to?",
    a: "Standard catalogue units are built to IP55 (dust-tight, protected against water jets). IP65 is available as an option for outdoor or washdown applications. Special sealing kits for IP66/IP67 are available on request for NMRV and RV Series. Please specify the required IP rating when ordering.",
  },
  {
    category: "Quality",
    q: "Are gear reducers tested before shipment?",
    a: "Yes. All units undergo a no-load run test at the factory before packaging. For OEM orders, a load test certificate can be provided on request. Key checks include gear mesh noise level, vibration, oil seal integrity, and dimensional verification of output shaft and mounting interfaces.",
  },
  {
    category: "Quality",
    q: "What lubrication does the reducer use and how often should it be changed?",
    a: "Standard units are filled with mineral gear oil (ISO VG 220) at the factory. Synthetic oil (PAO or PAG) is available for high-temperature, food-grade, or extended-interval applications. Initial oil change is recommended after the first 300 operating hours; subsequent changes every 5,000 hours or annually, whichever comes first.",
  },

  // ── Ordering ──
  {
    category: "Ordering",
    q: "How do I place an order?",
    a: "You can request a quote through our website's Get Quote form, email us at sales@starshinedrive.com, or call +91 9925001323. Please include your required product series, frame size or output torque, gear ratio, mounting form, quantity, and delivery destination. We will confirm pricing and lead time within one business day.",
  },
  {
    category: "Ordering",
    q: "What payment terms do you offer?",
    a: "Standard payment terms are 30% T/T advance with order confirmation and 70% T/T before shipment. For established accounts with credit history, net 30–60 day terms may be available. We accept T/T bank transfer, L/C (for orders above USD 20,000), and Western Union for smaller orders.",
  },
  {
    category: "Ordering",
    q: "What are the shipping options and lead times?",
    a: "We ship worldwide via sea freight (FCL/LCL), air freight, and express courier (DHL/FedEx/UPS). Standard catalogue items ship within 7–15 business days. Sea freight to major ports typically takes 20–35 days; air freight 3–7 days. A proforma invoice with shipping options and costs is provided at the quotation stage.",
  },
  {
    category: "Ordering",
    q: "Can I order a sample unit before placing a bulk order?",
    a: "Yes. Sample orders are accepted for most catalogue products. Sample units are invoiced at the standard unit price plus courier freight. For OEM customisation requiring tooling or setup, a non-refundable tooling charge applies. Sample lead time is typically 5–10 business days.",
  },
  {
    category: "Ordering",
    q: "Do you provide a proforma invoice and packing list?",
    a: "Yes. A proforma invoice (PI) is issued before payment confirming model, quantity, unit price, total amount, and payment terms. A commercial invoice, packing list, and bill of lading are provided with every shipment for customs clearance. Certificates of origin and material test reports are available on request.",
  },

  // ── Support ──
  {
    category: "Support",
    q: "What technical documentation is available for download?",
    a: "Our Download Center provides product catalogues, technical manuals, dimensional drawings, and selection guides for all series. 2D drawings (PDF/DWG) and 3D CAD models (STEP/IGES) are available on request by contacting our technical team with the model number.",
  },
  {
    category: "Support",
    q: "How do I contact technical support?",
    a: "Our technical team is available Monday–Saturday, 9 AM–6 PM IST. You can reach us by email at sales@starshinedrive.com, by phone at +91 9925001323, or through the Contact form on our website. For urgent technical issues, WhatsApp is also available on the same number.",
  },
  {
    category: "Support",
    q: "My reducer is overheating — what should I check?",
    a: "Common causes of overheating: (1) Incorrect oil level — too high causes churning losses; check and adjust to the oil level mark. (2) Wrong viscosity lubricant — use ISO VG 220 mineral oil or the grade specified in the manual. (3) Overloading — verify the applied torque does not exceed the rated output torque. (4) Blocked ventilation — ensure the breather plug is clean and the housing has free airflow. (5) Continuous operation below 25 Hz with VFD — add an external cooling fan.",
  },
  {
    category: "Support",
    q: "There is oil leaking from my reducer — how do I fix it?",
    a: "Oil leaks most commonly occur at: output shaft seal (lip seal wear), inspection cover gasket (loose bolts or aged gasket), breather plug (clogged, causing pressure build-up), or housing joint face (insufficient sealant). For shaft seal replacement, contact our parts team with the model and frame size. Ensure the breather is clear before replacing seals to avoid pressure-induced re-leakage.",
  },
  {
    category: "Support",
    q: "How do I calculate service factor for my application?",
    a: "Service factor (SF) accounts for load fluctuation and shock. For smooth conveyor loads use SF = 1.0–1.25; for moderate shock (mixers, fans) use SF = 1.25–1.75; for heavy shock (crushers, winches) use SF = 1.75–2.5. Multiply the rated motor torque by SF to get the required reducer output torque. Always select a reducer with rated torque ≥ (required torque × SF).",
  },
  {
    category: "Support",
    q: "Can I change the mounting position after installation?",
    a: "Mounting position changes require an oil level check and adjustment — the oil level plug and breather location may need to be repositioned. Some reducers have multiple plugged ports for different mounting orientations. Refer to the installation manual for your series, or contact our technical team with the model number and new mounting position for guidance.",
  },
];

function AccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className={cn("border border-gray-100 rounded-xl overflow-hidden transition-shadow", isOpen && "shadow-md")}>
      <button
        className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <span className={cn("text-sm md:text-base font-semibold leading-snug", isOpen ? "text-primary" : "text-gray-800")}>
          {item.q}
        </span>
        <ChevronDown className={cn("w-5 h-5 shrink-0 mt-0.5 text-gray-400 transition-transform duration-200", isOpen && "rotate-180 text-primary")} />
      </button>
      {isOpen && (
        <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
          {item.a}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  useSEO({
    title: "Gearbox FAQ | Starshine Drive India",
    description: "Common questions about gear reducers, worm gearboxes, OEM ordering, replacement, and certifications. Gearbox manufacturer Starshine Drive, India.",
    keywords: "gearbox FAQ, gear reducer selection guide, worm gearbox questions, helical gearbox FAQ, gearbox manufacturer India FAQ, OEM gearbox ordering",
  });

  useEffect(() => {
    const faqData = FAQS.slice(0, 10).map((item) => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": { "@type": "Answer", "text": item.a }
    }));
    injectJSONLD("ld-faq", {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqData,
    });
    return () => removeJSONLD("ld-faq");
  }, []);
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filtered = FAQS.filter((f) => {
    const matchCat = activeCategory === "All" || f.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  // group by category for display
  const groups = CATEGORIES.slice(1).map((cat) => ({
    cat,
    items: filtered.filter((f) => f.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative flex items-center overflow-hidden bg-gray-100 py-14 md:py-0 md:min-h-[500px]">
        {/* Background image tinted */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/20 z-10" />
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('https://starshinedrives.com/wp-content/uploads/2025/01/faq-bg.jpg')`, filter: "brightness(0.9)" }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 md:py-16 w-full">
          <div className="max-w-lg">
            <p className="text-accent font-semibold tracking-widest text-sm uppercase mb-3">Help Centre</p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-6 leading-tight">
              Frequently Asked<br />Questions
            </h1>
            <ul className="space-y-3 mb-8">
              {["Product Range", "Document & Support", "Order Communication"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-700 text-base">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/contact">
              <Button className="bg-accent hover:bg-accent/90 text-white border-0 font-semibold px-7 py-3 text-base">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ Content ── */}
      <section className="py-16 bg-white flex-1">
        <div className="max-w-6xl mx-auto px-4 md:px-8">

          {/* Search */}
          <div className="max-w-xl mx-auto mb-10 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setOpenIndex(null); }}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-8">

            {/* Left — category tabs */}
            <div className="lg:w-56 shrink-0">
              <div className="sticky top-24 flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
                {CATEGORIES.map((cat) => {
                  const count = cat === "All" ? FAQS.length : FAQS.filter(f => f.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
                      className={cn(
                        "flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors w-full text-left shrink-0",
                        activeCategory === cat
                          ? "bg-primary text-white"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      <span>{cat}</span>
                      <span className={cn("text-xs px-1.5 py-0.5 rounded-full", activeCategory === cat ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500")}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right — accordion */}
            <div className="flex-1 min-w-0">
              {filtered.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <p className="text-lg font-medium mb-2">No results found</p>
                  <p className="text-sm">Try a different search term or category.</p>
                </div>
              ) : activeCategory !== "All" ? (
                <div className="space-y-3">
                  {filtered.map((item, i) => (
                    <AccordionItem
                      key={i}
                      item={item}
                      isOpen={openIndex === i}
                      onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-10">
                  {groups.map(({ cat, items }) => (
                    <div key={cat}>
                      <h3 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
                        <span className="w-1 h-5 bg-accent rounded-full inline-block" />
                        {cat}
                      </h3>
                      <div className="space-y-3">
                        {items.map((item, i) => {
                          const globalIdx = filtered.indexOf(item);
                          return (
                            <AccordionItem
                              key={i}
                              item={item}
                              isOpen={openIndex === globalIdx}
                              onToggle={() => setOpenIndex(openIndex === globalIdx ? null : globalIdx)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Still have questions CTA ── */}
      <section className="bg-gray-50 py-14 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <MessageCircle className="w-10 h-10 text-accent mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary mb-3">Still Have Questions?</h2>
          <p className="text-gray-500 mb-8">
            Our technical team responds within one business day. Reach us by email or use the contact form.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:sales@starshinedrive.com">
              <Button className="bg-accent hover:bg-accent/90 text-white border-0 font-semibold px-8">
                Email Us
              </Button>
            </a>
            <Link href="/contact">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white font-semibold px-8">
                Contact Form
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
