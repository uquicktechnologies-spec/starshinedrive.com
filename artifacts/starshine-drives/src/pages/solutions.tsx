import { useEffect } from "react";
import { ArrowRight, CheckSquare, ChevronRight, Factory, Gauge, Settings2, ShieldCheck, Wrench } from "lucide-react";
import { Link } from "wouter";
import { useSEO, injectJSONLD, removeJSONLD } from "@/lib/seo";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import heroImg from "@assets/generated_images/hero-solutions.webp";
import foodImg from "@assets/generated_images/industry-1.jpg";
import miningImg from "@assets/generated_images/industry-5.jpg";
import packagingImg from "@assets/generated_images/industry-2.jpg";
import wastewaterImg from "@assets/generated_images/industry-water.jpg";
import steelImg from "@assets/generated_images/industry-steel.jpg";
import automationImg from "@assets/generated_images/industry-3.jpg";
import agricultureImg from "@assets/generated_images/industry-cement.jpg";
import textileImg from "@assets/generated_images/industry-textile.jpg";

type RecommendedProduct = {
  name: string;
  slug: string;
  fit: string;
};

type Industry = {
  id: string;
  name: string;
  eyebrow: string;
  summary: string;
  image: string;
  tileLabel: string;
  applications: string[];
  benefits: string[];
  products: RecommendedProduct[];
};

const INDUSTRIES: Industry[] = [
  {
    id: "food-beverage",
    name: "Food & Beverage",
    eyebrow: "Hygienic, dependable motion",
    summary: "Keep filling, bottling, mixing, and transfer lines moving with efficient drives selected for continuous production and easy maintenance.",
    image: foodImg,
    tileLabel: "Food & Beverage",
    applications: ["Bottling and filling", "Food conveyors", "Mixers and agitators"],
    benefits: ["Smooth, quiet operation for production lines", "Washdown-ready configuration guidance", "Reliable speed control for variable batch sizes"],
    products: [
      { name: "R Series Helical Gear Reducer", slug: "r-series-helical-gear-reducer", fit: "Efficient inline drive for mixers and transfer conveyors" },
      { name: "S Series Helical-Worm Reducer", slug: "s-series-helical-worm-gear-reducer", fit: "Compact right-angle drive for filling and packaging equipment" },
      { name: "NMRV Worm Gear Reducer", slug: "nmrv-worm-gear-reducers", fit: "Space-saving reducer for light-duty line equipment" },
    ],
  },
  {
    id: "mining-quarrying",
    name: "Mining & Quarrying",
    eyebrow: "Built for demanding duty",
    summary: "Power crushers, feeders, conveyors, and bulk-handling equipment with robust reducers matched to shock loads, long runtimes, and harsh plant conditions.",
    image: miningImg,
    tileLabel: "Mining & Quarrying",
    applications: ["Crushers and feeders", "Belt conveyors", "Stone and aggregate plants"],
    benefits: ["High torque capacity for bulk material handling", "Heavy-duty housings for tough environments", "Service-factor guidance for shock and overloads"],
    products: [
      { name: "K Series Helical-Bevel Reducer", slug: "k-series-helical-bevel-gear-reducer", fit: "Right-angle torque for heavy conveyors and feeders" },
      { name: "F Series Parallel-Shaft Reducer", slug: "f-series-parallel-shaft-helical-gear-reducer", fit: "Low-profile drive for belt and chain conveyors" },
      { name: "RV Cast-Iron Worm Reducer", slug: "rv-cast-iron-worm-gear-reducer", fit: "Robust worm drive for industrial auxiliary equipment" },
    ],
  },
  {
    id: "packaging",
    name: "Packaging",
    eyebrow: "Precision at production speed",
    summary: "Support form-fill-seal, cartoning, labelling, wrapping, and palletising machinery with compact drives that keep each motion repeatable.",
    image: packagingImg,
    tileLabel: "Packaging",
    applications: ["Cartoners and wrappers", "Labelling machines", "Pallet and case conveyors"],
    benefits: ["Compact footprints for machine builders", "Flexible motor and mounting options", "Repeatable motion across high-cycle operations"],
    products: [
      { name: "S Series Helical-Worm Reducer", slug: "s-series-helical-worm-gear-reducer", fit: "Compact right-angle drive for transfer mechanisms" },
      { name: "NMRV Worm Gear Reducer", slug: "nmrv-worm-gear-reducers", fit: "Cost-effective solution for auxiliary packaging axes" },
      { name: "Compact Geared Motors", slug: "compact-geared-motors", fit: "Ready-to-install drive for space-constrained machines" },
    ],
  },
  {
    id: "water-wastewater",
    name: "Water & Wastewater",
    eyebrow: "Continuous, controlled operation",
    summary: "Select dependable drive systems for pumps, aerators, clarifiers, sludge scrapers, and other equipment that must run reliably around the clock.",
    image: wastewaterImg,
    tileLabel: "Water & Wastewater",
    applications: ["Aerators and surface mixers", "Sludge scrapers", "Pumps and screens"],
    benefits: ["Efficient operation for long duty cycles", "Protection and sealing options for wet areas", "Torque selection for starting and intermittent loads"],
    products: [
      { name: "R Series Helical Gear Reducer", slug: "r-series-helical-gear-reducer", fit: "High-efficiency inline drive for pumps and mixers" },
      { name: "K Series Helical-Bevel Reducer", slug: "k-series-helical-bevel-gear-reducer", fit: "Right-angle reducer for scraper and aerator layouts" },
      { name: "F Series Parallel-Shaft Reducer", slug: "f-series-parallel-shaft-helical-gear-reducer", fit: "Low-profile drive for treatment-line conveyors" },
    ],
  },
  {
    id: "steel-metal",
    name: "Steel & Metal",
    eyebrow: "Torque for heavy industry",
    summary: "Keep roller tables, coil handling, cooling beds, and transfer systems under control with drives engineered for high torque and demanding plant cycles.",
    image: steelImg,
    tileLabel: "Steel & Metal",
    applications: ["Roller tables", "Coil and strip handling", "Material transfer systems"],
    benefits: ["High torque density for heavy loads", "Robust construction for industrial duty", "Custom ratios and shafts for replacement projects"],
    products: [
      { name: "K Series Helical-Bevel Reducer", slug: "k-series-helical-bevel-gear-reducer", fit: "High-torque right-angle drive for transfer equipment" },
      { name: "R Series Helical Gear Reducer", slug: "r-series-helical-gear-reducer", fit: "Inline drive for roller tables and processing lines" },
      { name: "Cycloidal Gear Reducer", slug: "cycloidal-gear-reducer", fit: "Shock-resistant reduction for demanding applications" },
    ],
  },
  {
    id: "industrial-automation",
    name: "Industrial Automation",
    eyebrow: "Accurate motion, every cycle",
    summary: "Build dependable automated equipment with low-backlash precision drives and efficient reducers matched to servo axes, indexing, and robotics.",
    image: automationImg,
    tileLabel: "Industrial Automation",
    applications: ["Servo axes and robots", "Indexing tables", "CNC and assembly equipment"],
    benefits: ["Low-backlash options for accurate positioning", "Servo and inverter-compatible configurations", "Compact integration into OEM machine frames"],
    products: [
      { name: "Precision Planetary Gearbox", slug: "sp-precision-planetary-gearbox", fit: "Low-backlash reduction for servo and positioning axes" },
      { name: "SCK Helical-Hypoid Gear Unit", slug: "sck-helical-hypoid-gear-unit", fit: "Efficient right-angle drive for compact automation" },
      { name: "R Series Helical Gear Reducer", slug: "r-series-helical-gear-reducer", fit: "Quiet inline drive for general machine automation" },
    ],
  },
  {
    id: "agriculture-grain",
    name: "Agriculture & Grain",
    eyebrow: "Reliable bulk handling",
    summary: "Move grain, feed, seed, and agricultural products through conveyors, augers, elevators, and mixers with practical drive solutions built for seasonal peaks.",
    image: agricultureImg,
    tileLabel: "Agriculture & Grain",
    applications: ["Bucket elevators", "Grain conveyors and augers", "Feed mixers"],
    benefits: ["Reliable torque for starting loaded equipment", "Flexible mounting for retrofit projects", "Easy-to-match motor and speed combinations"],
    products: [
      { name: "F Series Parallel-Shaft Reducer", slug: "f-series-parallel-shaft-helical-gear-reducer", fit: "Space-saving drive for conveyors and elevators" },
      { name: "K Series Helical-Bevel Reducer", slug: "k-series-helical-bevel-gear-reducer", fit: "Right-angle torque for augers and feed systems" },
      { name: "S Series Helical-Worm Reducer", slug: "s-series-helical-worm-gear-reducer", fit: "Compact reducer for mixers and auxiliary drives" },
    ],
  },
  {
    id: "textile",
    name: "Textile Machinery",
    eyebrow: "Smooth production motion",
    summary: "Keep spinning, weaving, winding, and finishing machinery running smoothly with quiet, compact drives selected around your machine’s speed and torque needs.",
    image: textileImg,
    tileLabel: "Textile",
    applications: ["Spinning and winding", "Looms and weaving", "Finishing and processing lines"],
    benefits: ["Quiet operation for continuous production floors", "Compact options for tight machine layouts", "Fine speed matching for consistent material handling"],
    products: [
      { name: "R Series Helical Gear Reducer", slug: "r-series-helical-gear-reducer", fit: "Efficient inline drive for processing machinery" },
      { name: "F Series Parallel-Shaft Reducer", slug: "f-series-parallel-shaft-helical-gear-reducer", fit: "Low-profile drive for rollers and winding equipment" },
      { name: "NMRV Worm Gear Reducer", slug: "nmrv-worm-gear-reducers", fit: "Compact solution for auxiliary textile machine axes" },
    ],
  },
];

const ADVANTAGES = [
  { title: "Application matching", description: "Share your speed, torque, duty cycle, and mounting details. Our engineers match the reducer to the complete machine.", icon: Settings2 },
  { title: "OEM-ready options", description: "Specify custom ratios, shafts, mounting forms, motors, brakes, and VFD-ready configurations for your production line.", icon: Wrench },
  { title: "Built for uptime", description: "Robust gear trains, quality checks, and practical replacement support help keep your equipment moving.", icon: ShieldCheck },
  { title: "One technical partner", description: "From selection and drawings to delivery and after-sales support, talk to one team throughout the project.", icon: Factory },
];

export default function Solutions() {
  useSEO({
    title: "Gearbox Solutions by Industry | Starshine Drive India",
    description: "Find the right Starshine Drive gearbox for food, mining, packaging, wastewater, steel, automation, agriculture, and textile machinery.",
    keywords: "conveyor gearbox India, food processing gearbox, mining gearbox, packaging machine gearbox, wastewater gearbox, steel mill gearbox, industrial automation gearbox, agriculture gearbox, textile machine gearbox",
  });

  useEffect(() => {
    injectJSONLD("ld-solutions", {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Industry Drive Solutions",
      url: "https://starshinedrive.com/solutions",
      description: "Starshine Drive supplies industrial gearboxes for food, mining, packaging, water treatment, steel, automation, agriculture, and textile machinery.",
      provider: { "@type": "Organization", name: "Starshine Drive", url: "https://starshinedrive.com" },
      hasPart: INDUSTRIES.map((industry) => ({
        "@type": "WebPageElement",
        name: `${industry.name} gearbox solutions`,
        url: `https://starshinedrive.com/solutions#${industry.id}`,
      })),
    });
    return () => removeJSONLD("ld-solutions");
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <header className="relative min-h-[500px] overflow-hidden bg-primary">
        <img
          src={heroImg}
          alt="Industrial gearbox solutions for production lines"
          className="absolute inset-0 h-full w-full object-cover object-center"
          width={1024}
          height={1024}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-primary/55" />
        <div className="container relative z-10 mx-auto flex min-h-[500px] items-center px-6 py-16 md:px-10">
          <div className="max-w-2xl text-white">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-orange-200">Drive solutions for every line</p>
            <h1 className="mb-6 max-w-xl font-heading text-4xl font-bold leading-tight md:text-6xl">
              The right drive for your industry
            </h1>
            <p className="mb-8 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
              From food processing to steel handling, Starshine Drive helps manufacturers choose the right gearbox, geared motor, and speed solution for the job.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/get-quote">
                <Button size="lg" className="w-full border-0 bg-accent px-7 font-semibold text-white hover:bg-accent/90 sm:w-auto">
                  Request a recommendation <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#industries" className="inline-flex h-11 items-center justify-center border border-white/60 px-7 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-primary">
                Explore industries
              </a>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section id="industries" className="scroll-mt-20 bg-[#f5f5f5] px-6 py-16 md:px-10 md:py-20">
          <div className="container mx-auto">
            <div className="mb-10 max-w-2xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-accent">Industry application guide</p>
              <h2 className="mb-4 font-heading text-3xl font-bold leading-tight text-primary md:text-4xl">
                Start with the work your machine does
              </h2>
              <p className="leading-relaxed text-gray-600">
                Choose an industry to see common applications, selection priorities, and the Starshine product families our engineers typically recommend.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {INDUSTRIES.map((industry, index) => (
                <a
                  key={industry.id}
                  href={`#${industry.id}`}
                  className="group relative min-h-[250px] overflow-hidden bg-primary shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <img
                    src={industry.image}
                    alt={`${industry.name} machinery`}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/35 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-orange-200">0{index + 1}</span>
                    <h3 className="font-heading text-xl font-bold text-white">{industry.tileLabel}</h3>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-white/80 transition-colors group-hover:text-white">
                      View solution <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-6 py-16 md:px-10 md:py-20">
          <div className="container mx-auto">
            <div className="mb-12 text-center">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-accent">Why Starshine</p>
              <h2 className="font-heading text-3xl font-bold text-primary md:text-4xl">Engineering support beyond the gearbox</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {ADVANTAGES.map(({ title, description, icon: Icon }) => (
                <div key={title} className="border border-gray-200 bg-white p-6 transition-colors hover:border-accent/60">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center bg-primary/5 text-primary">
                    <Icon className="h-6 w-6" strokeWidth={1.6} />
                  </div>
                  <h3 className="mb-2 font-heading text-lg font-bold text-primary">{title}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary px-6 py-16 md:px-10 md:py-20">
          <div className="container mx-auto">
            <div className="mb-12 max-w-2xl text-white">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-orange-200">Recommended product families</p>
              <h2 className="mb-4 font-heading text-3xl font-bold md:text-4xl">Explore your industry solution</h2>
              <p className="leading-relaxed text-blue-100">
                These starting points are based on common machine layouts. The final model, ratio, and motor are selected against your actual load and operating conditions.
              </p>
            </div>

            <div className="space-y-6">
              {INDUSTRIES.map((industry, index) => (
                <article id={industry.id} key={industry.id} className="scroll-mt-24 overflow-hidden bg-white">
                  <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
                    <div className="relative min-h-[260px] lg:min-h-full">
                      <img
                        src={industry.image}
                        alt={`${industry.name} drive applications`}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/10 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-6 text-white md:p-8">
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-200">0{index + 1} / 08</p>
                        <h3 className="font-heading text-2xl font-bold md:text-3xl">{industry.name}</h3>
                      </div>
                    </div>
                    <div className="p-6 md:p-8">
                      <p className="mb-3 text-sm font-bold uppercase tracking-widest text-accent">{industry.eyebrow}</p>
                      <p className="mb-6 max-w-2xl leading-relaxed text-gray-600">{industry.summary}</p>
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary">
                            <Gauge className="h-4 w-4 text-accent" /> Common applications
                          </h4>
                          <ul className="space-y-2">
                            {industry.applications.map((application) => (
                              <li key={application} className="flex gap-2 text-sm text-gray-600">
                                <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.8} /> {application}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary">
                            <ShieldCheck className="h-4 w-4 text-accent" /> Selection priorities
                          </h4>
                          <ul className="space-y-2">
                            {industry.benefits.map((benefit) => (
                              <li key={benefit} className="flex gap-2 text-sm text-gray-600">
                                <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.8} /> {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="mt-7 border-t border-gray-100 pt-6">
                        <h4 className="mb-4 font-heading text-lg font-bold text-primary">Recommended starting points</h4>
                        <div className="grid gap-3 sm:grid-cols-3">
                          {industry.products.map((product) => (
                            <div key={product.slug} className="h-full border border-gray-200 p-4">
                              <span className="mb-2 block text-sm font-bold leading-snug text-primary">{product.name}</span>
                              <span className="block text-xs leading-relaxed text-gray-500">{product.fit}</span>
                            </div>
                          ))}
                        </div>
                        <Link href="/products">
                          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-accent transition-colors hover:text-primary">
                            Browse the product range <ArrowRight className="h-4 w-4" />
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f5f5f5] px-6 py-16 md:px-10 md:py-20">
          <div className="container mx-auto">
            <div className="mx-auto max-w-4xl border-t-4 border-accent bg-white px-6 py-10 text-center shadow-sm md:px-12">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-accent">Need help selecting?</p>
              <h2 className="mb-4 font-heading text-3xl font-bold text-primary md:text-4xl">Tell us about your machine</h2>
              <p className="mx-auto mb-8 max-w-2xl leading-relaxed text-gray-600">
                Send your required speed, torque or motor power, mounting position, and operating conditions. Our team will recommend a suitable product and configuration for your application.
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/get-quote">
                  <Button size="lg" className="w-full border-0 bg-accent px-9 font-semibold text-white hover:bg-accent/90 sm:w-auto">
                    Request a recommendation <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/selection-guide">
                  <Button size="lg" variant="outline" className="w-full border-primary px-9 font-semibold text-primary hover:bg-primary hover:text-white sm:w-auto">
                    Use the selection guide
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}