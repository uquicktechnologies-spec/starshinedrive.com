import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useSEO, injectJSONLD, removeJSONLD } from "@/lib/seo";
import { CheckCircle2, ArrowRight, ChevronRight, ChevronDown, RotateCcw, Send, Zap, RotateCw, Ruler, Settings2, Gauge, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PRODUCTS } from "@/data/products";
import { cn } from "@/lib/utils";

/* ── Product family guide data ── */
const FAMILIES = [
  {
    id: "r-series-helical-gear-reducer",
    code: "R Series",
    name: "Inline Helical",
    shaft: "Coaxial (inline)",
    angle: "0°",
    efficiency: "95–98%",
    torque: "85–18,000 N·m",
    power: "0.12–160 kW",
    ratio: "5–200",
    bestFor: "Conveyors, mixers, pumps — straight-line drives",
    tags: ["High efficiency", "Quiet", "Compact"],
    color: "border-blue-200",
    dot: "bg-blue-500",
  },
  {
    id: "f-series-parallel-shaft-helical-gear-reducer",
    code: "F Series",
    name: "Parallel Shaft Helical",
    shaft: "Parallel offset",
    angle: "0°",
    efficiency: "94–97%",
    torque: "200–18,000 N·m",
    power: "0.12–160 kW",
    ratio: "5–200",
    bestFor: "Side-mounted drives, low-profile machines",
    tags: ["Low profile", "Side mount", "High torque"],
    color: "border-purple-200",
    dot: "bg-purple-500",
  },
  {
    id: "k-series-helical-bevel-gear-reducer",
    code: "K Series",
    name: "Helical-Bevel",
    shaft: "Right-angle",
    angle: "90°",
    efficiency: "94–97%",
    torque: "200–50,000 N·m",
    power: "0.12–200 kW",
    ratio: "5–400",
    bestFor: "Right-angle drives, heavy-duty conveyors, cranes",
    tags: ["Right angle", "High torque", "Heavy duty"],
    color: "border-orange-200",
    dot: "bg-orange-500",
  },
  {
    id: "s-series-helical-worm-gear-reducer",
    code: "S Series",
    name: "Helical-Worm",
    shaft: "Right-angle",
    angle: "90°",
    efficiency: "70–92%",
    torque: "90–4,000 N·m",
    power: "0.12–22 kW",
    ratio: "10–10,000",
    bestFor: "Self-locking applications, agitators, packaging",
    tags: ["Self-locking", "High ratio", "Compact"],
    color: "border-green-200",
    dot: "bg-green-500",
  },
  {
    id: "nmrv-worm-gear-reducers",
    code: "NMRV",
    name: "Compact Worm Gear",
    shaft: "Right-angle",
    angle: "90°",
    efficiency: "60–90%",
    torque: "2.6–1,550 N·m",
    power: "0.06–15 kW",
    ratio: "5–100",
    bestFor: "Light conveyors, packaging, gates, and compact OEM drives",
    tags: ["Compact", "Cost effective", "Self-locking"],
    color: "border-amber-200",
    dot: "bg-amber-500",
  },
  {
    id: "rv-cast-iron-worm-gear-reducer",
    code: "RV Series",
    name: "Worm Gear (Cast Iron)",
    shaft: "Right-angle",
    angle: "90°",
    efficiency: "60–85%",
    torque: "10–2,500 N·m",
    power: "0.12–15 kW",
    ratio: "5–100",
    bestFor: "Heavy industrial worm applications, shock loads",
    tags: ["Robust", "Shock resistant", "Industrial"],
    color: "border-red-200",
    dot: "bg-red-500",
  },
  {
    id: "sp-precision-planetary-gearbox",
    code: "Planetary",
    name: "Precision Planetary",
    shaft: "Coaxial (inline)",
    angle: "0°",
    efficiency: "97–99%",
    torque: "Up to 50,000 N·m",
    power: "Servo / stepper compatible",
    ratio: "3–512",
    bestFor: "Servo drives, robotics, precision positioning",
    tags: ["Low backlash", "High precision", "Servo ready"],
    color: "border-indigo-200",
    dot: "bg-indigo-500",
  },
  {
    id: "sck-helical-hypoid-gear-unit",
    code: "SCK",
    name: "Helical-Hypoid",
    shaft: "Right-angle",
    angle: "90°",
    efficiency: "92–96%",
    torque: "100–5,000 N·m",
    power: "0.12–55 kW",
    ratio: "5–300",
    bestFor: "Right-angle drives needing higher efficiency than worm",
    tags: ["High efficiency", "Right angle", "Compact"],
    color: "border-teal-200",
    dot: "bg-teal-500",
  },
];

/* ── Application categories ── */
const APPLICATIONS = [
  {
    icon: "🏭",
    name: "Conveyors & Material Handling",
    desc: "Belt conveyors, bucket elevators, roller conveyors, palletisers",
    recommended: ["R Series", "K Series", "F Series"],
    slugs: ["r-series-helical-gear-reducer", "k-series-helical-bevel-gear-reducer", "f-series-parallel-shaft-helical-gear-reducer"],
  },
  {
    icon: "🌀",
    name: "Mixers & Agitators",
    desc: "Industrial mixers, paddle agitators, ribbon blenders, reactors",
    recommended: ["R Series", "S Series", "K Series"],
    slugs: ["r-series-helical-gear-reducer", "s-series-helical-worm-gear-reducer", "k-series-helical-bevel-gear-reducer"],
  },
  {
    icon: "📦",
    name: "Packaging Machinery",
    desc: "Form-fill-seal, cartoners, wrappers, labelling machines",
    recommended: ["S Series", "Compact Geared Motors"],
    slugs: ["s-series-helical-worm-gear-reducer", "compact-geared-motors"],
  },
  {
    icon: "🤖",
    name: "Automation & Robotics",
    desc: "Servo axes, robot joints, CNC feed drives, indexing tables",
    recommended: ["Planetary", "SCK"],
    slugs: ["sp-precision-planetary-gearbox", "sck-helical-hypoid-gear-unit"],
  },
  {
    icon: "🏗️",
    name: "Cranes & Hoists",
    desc: "Bridge cranes, overhead cranes, winches, lifting equipment",
    recommended: ["K Series", "R Series", "Cycloidal"],
    slugs: ["k-series-helical-bevel-gear-reducer", "r-series-helical-gear-reducer", "cycloidal-gear-reducer"],
  },
  {
    icon: "💧",
    name: "Water & Wastewater",
    desc: "Pump drives, aerators, sludge scrapers, clarifiers",
    recommended: ["R Series", "K Series", "F Series"],
    slugs: ["r-series-helical-gear-reducer", "k-series-helical-bevel-gear-reducer", "f-series-parallel-shaft-helical-gear-reducer"],
  },
  {
    icon: "🌾",
    name: "Food & Beverage",
    desc: "Conveyors, fillers, bottling lines, food mixers",
    recommended: ["S Series", "R Series"],
    slugs: ["s-series-helical-worm-gear-reducer", "r-series-helical-gear-reducer"],
  },
  {
    icon: "⚡",
    name: "Energy & Power",
    desc: "Wind turbine yaw/pitch, solar trackers, generators",
    recommended: ["Planetary", "K Series", "R Series"],
    slugs: ["sp-precision-planetary-gearbox", "k-series-helical-bevel-gear-reducer", "r-series-helical-gear-reducer"],
  },
];

/* ── Step-by-step selector ── */
type Step1 = { shaftAngle: "inline" | "right-angle" | "" };
type Step2 = { torqueRange: "light" | "medium" | "heavy" | "precision" | "" };
type Step3 = { priority: "efficiency" | "cost" | "compact" | "selflock" | "" };

function useSelector() {
  const [step, setStep] = useState(0);
  const [s1, setS1] = useState<Step1>({ shaftAngle: "" });
  const [s2, setS2] = useState<Step2>({ torqueRange: "" });
  const [s3, setS3] = useState<Step3>({ priority: "" });

  const reset = () => { setStep(0); setS1({ shaftAngle: "" }); setS2({ torqueRange: "" }); setS3({ priority: "" }); };

  const results = (): typeof FAMILIES => {
    let f = FAMILIES;
    if (s1.shaftAngle === "inline") f = f.filter(x => x.angle === "0°");
    if (s1.shaftAngle === "right-angle") f = f.filter(x => x.angle === "90°");
    if (s2.torqueRange === "light") f = f.filter(x => x.id.includes("nmrv") || x.id.includes("compact") || x.id.includes("s-series"));
    if (s2.torqueRange === "medium") f = f.filter(x => !x.id.includes("nmrv") && !x.id.includes("compact") && !x.id.includes("planetary"));
    if (s2.torqueRange === "heavy") f = f.filter(x => x.id.includes("k-series") || x.id.includes("r-series") || x.id.includes("f-series") || x.id.includes("planetary") || x.id.includes("cycloidal"));
    if (s2.torqueRange === "precision") f = f.filter(x => x.id.includes("planetary") || x.id.includes("sck"));
    if (s3.priority === "efficiency") f = f.filter(x => parseFloat(x.efficiency) >= 92 || x.efficiency.startsWith("97") || x.efficiency.startsWith("95"));
    if (s3.priority === "cost") f = f.filter(x => x.id.includes("nmrv") || x.id.includes("rv-cast") || x.id.includes("r-series") || x.id.includes("s-series"));
    if (s3.priority === "compact") f = f.filter(x => x.tags.includes("Compact") || x.tags.includes("Lightweight"));
    if (s3.priority === "selflock") f = f.filter(x => x.tags.includes("Self-locking"));
    return f;
  };

  return { step, setStep, s1, setS1, s2, setS2, s3, setS3, reset, results };
}

export default function SelectionGuide() {
  useSEO({
    title: "Gear Reducer Selection Guide | Starshine Drive India",
    description: "Select the right gear reducer by shaft angle, torque, and application. Compare helical, worm, bevel, planetary, cycloidal gearboxes. Starshine Drive India.",
    keywords: "gear reducer selection guide, how to choose gearbox, gearbox selection India, helical vs worm gearbox, gear reducer calculator, industrial gearbox selection, speed reducer selection guide",
  });
  useEffect(() => {
    injectJSONLD("ld-selection", {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to Select a Gear Reducer",
      url: "https://starshinedrive.com/selection-guide",
      description: "Step-by-step guide to selecting the right industrial gear reducer by shaft angle, torque, speed, and application.",
      step: [
        { "@type": "HowToStep", name: "Define shaft angle", text: "Choose inline (0°) or right-angle (90°) based on your drive layout." },
        { "@type": "HowToStep", name: "Determine torque & power", text: "Match required output torque and motor power to the reducer rating." },
        { "@type": "HowToStep", name: "Select gear type", text: "Choose helical, worm, bevel-helical, planetary, or cycloidal based on efficiency and size requirements." },
      ],
      tool: { "@type": "HowToTool", name: "Starshine Drive Selector Tool" },
    });
    return () => removeJSONLD("ld-selection");
  }, []);
  const sel = useSelector();
  const [activeApp, setActiveApp] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative flex items-center overflow-hidden bg-gray-100 py-16 md:py-0 md:min-h-[520px]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/75 to-white/10 z-10" />
          <div className="absolute inset-0 bg-[url('https://starshinedrives.com/wp-content/uploads/2025/03/selection-hero.jpg')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-200" style={{ zIndex: -1 }} />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 md:py-16 w-full">
          <div className="max-w-lg">
            <p className="text-accent font-semibold tracking-widest text-sm uppercase mb-3">Technical Support</p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-6 leading-tight">
              Gear Reducer<br />Selection Support
            </h1>
            <ul className="space-y-3 mb-8">
              {["Drive Configurator", "Product Family Guide", "Custom Support"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-700 text-base">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <a href="#drive-selector">
              <Button className="bg-accent hover:bg-accent/90 text-white border-0 font-semibold px-7 py-3 text-base">
                Open Drive Selector
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ── Start with your Application ── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-3">Start with your Application</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Select your industry or application type to see the recommended gear reducer series.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {APPLICATIONS.map((app, i) => (
              <div
                key={app.name}
                className={cn(
                  "rounded-xl border-2 p-5 cursor-pointer transition-all",
                  activeApp === i
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                )}
                onClick={() => setActiveApp(activeApp === i ? null : i)}
              >
                <div className="text-3xl mb-3">{app.icon}</div>
                <h3 className={cn("font-bold text-sm mb-1", activeApp === i ? "text-primary" : "text-gray-800")}>{app.name}</h3>
                <p className="text-gray-500 text-xs leading-snug mb-3">{app.desc}</p>

                {activeApp === i && (
                  <div className="mt-3 pt-3 border-t border-primary/20 space-y-2">
                    <p className="text-xs font-bold text-primary mb-2">Recommended:</p>
                    {app.slugs.map((slug, j) => {
                      const product = PRODUCTS.find(p => p.slug === slug);
                      return product ? (
                        <Link key={slug} href={`/products/${slug}`}>
                          <div className="flex items-center gap-2 group">
                            <ChevronRight className="w-3.5 h-3.5 text-accent shrink-0" />
                            <span className="text-xs text-gray-700 group-hover:text-primary transition-colors">{product.name}</span>
                          </div>
                        </Link>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interactive Drive Selector ── */}
      <section id="drive-selector" className="py-16 bg-[#f5f5f5] scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-heading font-bold text-primary mb-3">Drive Selector</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Answer 3 quick questions to narrow down the right product series for your drive.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Selector steps */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-bold text-gray-500">
                  Step {Math.min(sel.step + 1, 3)} of 3
                </p>
                <button onClick={sel.reset} className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-gray-100 rounded-full mb-8">
                <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${((sel.step) / 3) * 100}%` }} />
              </div>

              {/* Step 1 */}
              <div className={cn(sel.step !== 0 && "opacity-40 pointer-events-none")}>
                <p className="font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">1</span>
                  What is your required shaft angle?
                </p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { val: "inline", label: "Inline (0°)", icon: <ArrowRight className="w-5 h-5" />, desc: "Input & output on same axis" },
                    { val: "right-angle", label: "Right-Angle (90°)", icon: <RotateCw className="w-5 h-5" />, desc: "Input & output at 90°" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => { sel.setS1({ shaftAngle: opt.val as any }); sel.setStep(1); }}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all",
                        sel.s1.shaftAngle === opt.val ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className={cn("mb-2", sel.s1.shaftAngle === opt.val ? "text-primary" : "text-gray-400")}>{opt.icon}</div>
                      <p className={cn("font-semibold text-sm", sel.s1.shaftAngle === opt.val ? "text-primary" : "text-gray-700")}>{opt.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2 */}
              <div className={cn(sel.step < 1 && "opacity-40 pointer-events-none")}>
                <p className="font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">2</span>
                  What is your torque / power requirement?
                </p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { val: "light", label: "Light (< 200 N·m)", desc: "Up to ~3 kW" },
                    { val: "medium", label: "Medium (200–5,000 N·m)", desc: "3–75 kW" },
                    { val: "heavy", label: "Heavy (> 5,000 N·m)", desc: "75 kW+" },
                    { val: "precision", label: "Precision / Servo", desc: "Low backlash required" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => { sel.setS2({ torqueRange: opt.val as any }); sel.setStep(2); }}
                      className={cn(
                        "p-3 rounded-xl border-2 text-left transition-all",
                        sel.s2.torqueRange === opt.val ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <p className={cn("font-semibold text-sm", sel.s2.torqueRange === opt.val ? "text-primary" : "text-gray-700")}>{opt.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3 */}
              <div className={cn(sel.step < 2 && "opacity-40 pointer-events-none")}>
                <p className="font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">3</span>
                  What is your top priority?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: "efficiency", label: "High Efficiency", icon: <Zap className="w-4 h-4" /> },
                    { val: "cost", label: "Cost Effective", icon: <Gauge className="w-4 h-4" /> },
                    { val: "compact", label: "Compact Size", icon: <Ruler className="w-4 h-4" /> },
                    { val: "selflock", label: "Self-Locking", icon: <Shield className="w-4 h-4" /> },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => { sel.setS3({ priority: opt.val as any }); sel.setStep(3); }}
                      className={cn(
                        "p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-all",
                        sel.s3.priority === opt.val ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <span className={sel.s3.priority === opt.val ? "text-primary" : "text-gray-400"}>{opt.icon}</span>
                      <p className={cn("font-semibold text-sm", sel.s3.priority === opt.val ? "text-primary" : "text-gray-700")}>{opt.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results */}
            <div>
              <p className="font-bold text-primary mb-4 text-sm">
                {sel.step === 0 ? "Answer the questions to see recommendations →" : `${sel.results().length} series match your requirements`}
              </p>
              <div className="space-y-3">
                {sel.step === 0 ? (
                  FAMILIES.slice(0, 3).map((f) => (
                    <div key={f.id} className="bg-white rounded-xl p-4 border border-gray-100 opacity-40">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${f.dot}`} />
                        <p className="font-bold text-primary text-sm">{f.code} — {f.name}</p>
                      </div>
                    </div>
                  ))
                ) : sel.results().length === 0 ? (
                  <div className="bg-white rounded-xl p-6 border border-gray-100 text-center text-gray-400">
                    <p className="mb-2">No exact match — try adjusting your criteria.</p>
                    <button onClick={sel.reset} className="text-primary text-sm font-semibold hover:underline">Reset selector</button>
                  </div>
                ) : (
                  sel.results().map((f, i) => (
                    <Link key={f.id} href={`/products/${f.id}`}>
                      <div className={cn(
                        "bg-white rounded-xl p-4 border-2 hover:shadow-md transition-all cursor-pointer group",
                        i === 0 ? "border-primary" : f.color
                      )}>
                        {i === 0 && <span className="text-xs font-bold text-accent uppercase tracking-wide mb-1 block">Best Match</span>}
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-3 h-3 rounded-full ${f.dot}`} />
                              <p className="font-bold text-primary text-sm">{f.code} — {f.name}</p>
                            </div>
                            <p className="text-xs text-gray-500 ml-5">{f.bestFor}</p>
                            <div className="flex gap-1 mt-2 ml-5 flex-wrap">
                              {f.tags.map(t => (
                                <span key={t} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t}</span>
                              ))}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors shrink-0" />
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-xs text-gray-500">
                          <div><span className="font-semibold text-gray-700">Torque</span><br />{f.torque}</div>
                          <div><span className="font-semibold text-gray-700">Ratio</span><br />{f.ratio}</div>
                          <div><span className="font-semibold text-gray-700">Efficiency</span><br />{f.efficiency}</div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Product family comparison table ── */}
      <section className="py-16 bg-white overflow-x-auto">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-heading font-bold text-primary mb-3">Product Family Comparison</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Side-by-side technical overview of all Starshine gear reducer series.</p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="px-4 py-3 text-left font-semibold">Series</th>
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Shaft Angle</th>
                  <th className="px-4 py-3 text-left font-semibold">Efficiency</th>
                  <th className="px-4 py-3 text-left font-semibold">Torque Range</th>
                  <th className="px-4 py-3 text-left font-semibold">Ratio</th>
                  <th className="px-4 py-3 text-left font-semibold">Best For</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {FAMILIES.map((f, i) => (
                  <tr key={f.id} className={cn("border-b border-gray-100 hover:bg-gray-50 transition-colors", i % 2 === 0 ? "bg-white" : "bg-gray-50/50")}>
                    <td className="px-4 py-3 font-bold text-primary whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${f.dot}`} />
                        {f.code}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{f.name}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{f.shaft}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{f.efficiency}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{f.torque}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{f.ratio}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-[180px]">{f.bestFor}</td>
                    <td className="px-4 py-3">
                      <Link href={`/products/${f.id}`}>
                        <span className="text-accent text-xs font-semibold hover:underline whitespace-nowrap flex items-center gap-1">
                          View <ChevronRight className="w-3 h-3" />
                        </span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Selection parameters guide ── */}
      <section className="py-16 bg-[#f5f5f5]">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-heading font-bold text-primary mb-3">Selection Parameters Guide</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Key data you need to specify for an accurate gear reducer selection.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <Gauge className="w-5 h-5" />, title: "Output Torque (N·m)", desc: "The torque the reducer must deliver at the output shaft. Calculate from the driven machine's load, including service factor (SF = 1.0–2.5 depending on shock level)." },
              { icon: <RotateCw className="w-5 h-5" />, title: "Gear Ratio (i)", desc: "Ratio = Input speed ÷ Output speed. Define your required output RPM and the motor's input RPM to calculate the required ratio." },
              { icon: <Zap className="w-5 h-5" />, title: "Motor Power (kW)", desc: "Select motor power based on required torque × output speed, with SF applied. Standard IEC frame sizes from 0.12 kW to 200 kW are supported." },
              { icon: <Settings2 className="w-5 h-5" />, title: "Mounting Form", desc: "Foot-mounted (B3), flange-mounted (B5/B14), shaft-mounted (hollow bore), or torque arm. Define available installation space before selection." },
              { icon: <ArrowRight className="w-5 h-5" />, title: "Shaft Configuration", desc: "Inline (coaxial) or right-angle (90°). Also specify output shaft diameter, length, keyway, and whether hollow shaft or solid shaft is needed." },
              { icon: <Shield className="w-5 h-5" />, title: "Environment & IP Rating", desc: "Standard units are IP55. Specify IP65 for outdoor or washdown. Confirm ambient temperature range (-20°C to +40°C standard; higher with synthetic oil)." },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-primary mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Custom support CTA ── */}
      <section className="bg-primary py-14">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-heading font-bold text-white mb-3">Need Custom Selection Support?</h2>
              <p className="text-white/80 mb-6">
                Send us your application parameters and our engineers will prepare a full selection report including recommended series, frame size, gear ratio, and service factor within one business day.
              </p>
              <ul className="space-y-2 mb-6">
                {["Torque & ratio calculation", "Service factor guidance", "Dimensional drawings", "CAD file on confirmation"].map(item => (
                  <li key={item} className="flex items-center gap-2 text-white/90 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <a href="mailto:sales@starshinedrive.com?subject=Selection Guide Request">
                <Button className="w-full bg-accent hover:bg-accent/90 text-white border-0 font-semibold py-3 flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Email Selection Request
                </Button>
              </a>
              <Link href="/products">
                <Button className="w-full bg-transparent border border-white text-white hover:bg-white hover:text-primary font-semibold py-3">
                  Browse All Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
