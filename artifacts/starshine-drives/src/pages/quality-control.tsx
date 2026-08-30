import { Link } from "wouter";
import { useEffect } from "react";
import { useSEO, injectJSONLD, removeJSONLD } from "@/lib/seo";
import { ShieldCheck, CheckCircle2, Award, Microscope, Settings, ClipboardCheck, Factory, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/* ── Certifications ── */
const CERTS = [
  {
    code: "ISO 9001:2015",
    title: "Quality Management System",
    body: "Our entire manufacturing and supply chain operates under ISO 9001:2015 certified quality management — covering design, production, inspection, and after-sales.",
    scope: "All product lines",
    since: "2003",
    color: "bg-blue-50 border-blue-200",
    badge: "🏅",
  },
  {
    code: "CE Marking",
    title: "European Conformity",
    body: "CE marking confirms our gear reducers and gearmotors meet EU health, safety, and environmental protection requirements under the Machinery Directive 2006/42/EC.",
    scope: "R / F / K / S / NMRV / RV Series",
    since: "2008",
    color: "bg-yellow-50 border-yellow-200",
    badge: "🇪🇺",
  },
  {
    code: "SGS Certified",
    title: "Independent Third-Party Audit",
    body: "SGS — the world's leading inspection and certification company — independently audits our factory, processes, and products to verify conformance to international standards.",
    scope: "Factory & product inspection",
    since: "2010",
    color: "bg-red-50 border-red-200",
    badge: "🔍",
  },
  {
    code: "UL Listed",
    title: "North America Safety",
    body: "UL listing verifies our motors and electrical assemblies meet ANSI/UL safety standards required for the North American market.",
    scope: "Gearmotor units",
    since: "2015",
    color: "bg-green-50 border-green-200",
    badge: "🛡️",
  },
];

/* ── Quality control process steps ── */
const QC_PROCESS = [
  {
    step: "01",
    title: "Raw Material Incoming Inspection",
    desc: "All incoming steel, cast iron, aluminium billets, and bearings are batch-sampled and verified for chemical composition, hardness, and dimensional conformance before entering production.",
    icon: <Factory className="w-6 h-6" />,
  },
  {
    step: "02",
    title: "Gear Machining Precision Control",
    desc: "CNC gear hobbing and grinding machines hold tooth profile tolerances to DIN 6 (ISO Grade 6) or better. Gear pitch, helix angle, and runout are measured on a 3D gear measuring centre after each batch.",
    icon: <Settings className="w-6 h-6" />,
  },
  {
    step: "03",
    title: "Heat Treatment Verification",
    desc: "After carburising and case-hardening, gear surface hardness (HRC 58–62) and case depth are verified by destructive sampling from each furnace batch. Metallographic analysis is performed monthly.",
    icon: <Microscope className="w-6 h-6" />,
  },
  {
    step: "04",
    title: "Housing & Assembly Dimensional Check",
    desc: "Cast iron and aluminium housings are CMM-inspected for bore diameter, face flatness, and shaft centre distance. Assembled units are checked for bearing preload and shaft end-play against drawing tolerances.",
    icon: <ClipboardCheck className="w-6 h-6" />,
  },
  {
    step: "05",
    title: "No-Load Run Test",
    desc: "Every unit is run under no-load conditions for a minimum break-in period before dispatch. Noise level, vibration, temperature rise, and oil seal integrity are recorded. Units outside spec are quarantined and re-inspected.",
    icon: <ShieldCheck className="w-6 h-6" />,
  },
  {
    step: "06",
    title: "Final Inspection & Packaging",
    desc: "Finished units receive a final dimensional, appearance, and nameplate check. Products are packed in wooden crates or export cartons with desiccant to prevent moisture ingress during ocean freight.",
    icon: <Award className="w-6 h-6" />,
  },
];

/* ── Testing equipment ── */
const EQUIPMENT = [
  { name: "3D CMM (Coordinate Measuring Machine)", use: "Housing bore, shaft centre distance, face flatness" },
  { name: "Gear Measuring Centre (Klingelnberg / Zeiss)", use: "Tooth profile, pitch, helix angle, runout" },
  { name: "Rockwell Hardness Tester", use: "Surface and core hardness after heat treatment" },
  { name: "Metallographic Microscope", use: "Case depth, microstructure, grain size" },
  { name: "Vibration & Noise Analyser", use: "No-load run test, bearing condition" },
  { name: "Torque & Speed Test Rig", use: "Efficiency, rated torque confirmation (OEM orders)" },
  { name: "IP Ingress Protection Tester", use: "Dust and water seal integrity (IP55/IP65)" },
  { name: "Surface Roughness Tester", use: "Shaft journal and housing bore finish" },
];

/* ── Quality stats ── */
const STATS = [
  { value: "100%", label: "Units Run-Tested Before Dispatch" },
  { value: "DIN 6", label: "Gear Accuracy Grade" },
  { value: "HRC 58–62", label: "Gear Surface Hardness" },
  { value: "< 0.5%", label: "Field Return Rate" },
];

export default function QualityControl() {
  useSEO({
    title: "ISO Certified Gearbox Manufacturer | Starshine Drive",
    description: "ISO 9001:2015, CE, SGS, UL certified gearbox manufacturer India. 100% run-tested, DIN 6 gear accuracy, <0.5% field return rate. Starshine Drive.",
    keywords: "ISO certified gearbox India, CE certified gear reducer, SGS certified gearbox manufacturer, quality gearbox India, ISO 9001 gearbox, certified gear reducer supplier Gujarat",
  });
  useEffect(() => {
    injectJSONLD("ld-quality", {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Quality Control & Certifications — Starshine Drive",
      url: "https://starshinedrive.com/quality-control",
      description: "Starshine Drive: ISO 9001:2015, CE, SGS, UL certified gearbox manufacturer India. 100% run-tested units, DIN 6 accuracy, <0.5% field return rate.",
      about: {
        "@type": "Organization",
        name: "Starshine Drive",
        url: "https://starshinedrive.com",
        award: ["ISO 9001:2015 Certified", "CE Marking", "SGS Certified", "UL Listed"],
      },
    });
    return () => removeJSONLD("ld-quality");
  }, []);
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative flex items-center overflow-hidden bg-primary py-16 md:py-0 md:min-h-[520px]">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 md:py-16 grid md:grid-cols-2 gap-12 items-center w-full">
          <div>
            <p className="text-accent font-semibold tracking-widest text-sm uppercase mb-3">Quality Assurance</p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6 leading-tight">
              Quality Control &<br />Certifications
            </h1>
            <ul className="space-y-3 mb-8">
              {["ISO 9001:2015 Certified Manufacturing", "CE / SGS / UL Compliant Products", "100% Run-Test Before Dispatch"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-white/90 text-base">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/contact">
              <Button className="bg-accent hover:bg-accent/90 text-white border-0 font-semibold px-7 py-3 text-base">
                Request Certificate Copy
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center border border-white/20">
                <p className="text-3xl font-bold text-white mb-1">{s.value}</p>
                <p className="text-white/70 text-xs leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Certifications ── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold tracking-widest text-sm uppercase mb-2">Our Credentials</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary">
              International Certifications
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Every Starshine product is backed by internationally recognised quality and safety certifications audited by independent bodies.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CERTS.map((cert) => (
              <div key={cert.code} className={`rounded-xl border-2 p-6 flex flex-col ${cert.color}`}>
                <div className="text-4xl mb-4">{cert.badge}</div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{cert.code}</p>
                <h3 className="font-bold text-primary text-base mb-3 leading-snug">{cert.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed flex-1">{cert.body}</p>
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-1 text-xs text-gray-500">
                  <p><span className="font-semibold">Scope:</span> {cert.scope}</p>
                  <p><span className="font-semibold">Certified since:</span> {cert.since}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            Certificate copies available on request —{" "}
            <a href="mailto:sales@starshinedrive.com" className="text-primary hover:underline">sales@starshinedrive.com</a>
          </p>
        </div>
      </section>

      {/* ── QC Process ── */}
      <section className="py-16 bg-[#f5f5f5]">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold tracking-widest text-sm uppercase mb-2">End-to-End Control</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary">
              Quality Control Process
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Six inspection stages from raw material to final packaging ensure every unit leaving our factory meets specification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {QC_PROCESS.map((step) => (
              <div key={step.step} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {step.step}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                    {step.icon}
                  </div>
                </div>
                <h3 className="font-bold text-primary text-base mb-2 leading-snug">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testing Equipment ── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-14 items-start">
            <div>
              <p className="text-accent font-semibold tracking-widest text-sm uppercase mb-2">Precision Instruments</p>
              <h2 className="text-3xl font-heading font-bold text-primary mb-4">Testing Equipment</h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                Our QC laboratory is equipped with precision metrology instruments maintained and calibrated to national traceable standards. This ensures our measurement results are accurate, repeatable, and audit-ready.
              </p>
              <Link href="/contact">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white font-semibold flex items-center gap-2">
                  Request Lab Report <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {EQUIPMENT.map((eq) => (
                <div key={eq.name} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary text-sm">{eq.name}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{eq.use}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Manufacturing Standards ── */}
      <section className="py-16 bg-primary">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-white mb-3">Manufacturing Standards</h2>
            <p className="text-white/70 max-w-xl mx-auto">
              Our products are designed and manufactured in accordance with globally recognised technical standards.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { std: "DIN 3960", desc: "Gear Geometry" },
              { std: "ISO 6336", desc: "Gear Strength" },
              { std: "DIN 3961", desc: "Gear Tolerances" },
              { std: "ISO 281", desc: "Bearing Life" },
              { std: "IEC 60034", desc: "Motor Performance" },
              { std: "IP55 / IP65", desc: "Ingress Protection" },
            ].map((s) => (
              <div key={s.std} className="bg-white/10 rounded-xl p-4 text-center border border-white/20">
                <p className="font-bold text-white text-sm mb-1">{s.std}</p>
                <p className="text-white/60 text-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-14 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Award className="w-10 h-10 text-accent mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary mb-3">
            Need Certificates for Compliance?
          </h2>
          <p className="text-gray-500 mb-8">
            We can provide ISO 9001, CE Declaration of Conformity, SGS test reports, material certificates, and dimensional inspection reports for any order.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:sales@starshinedrive.com?subject=Certificate Request">
              <Button className="bg-accent hover:bg-accent/90 text-white border-0 font-semibold px-8">
                Request Certificates
              </Button>
            </a>
            <Link href="/download-center">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white font-semibold px-8">
                Download Center
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
