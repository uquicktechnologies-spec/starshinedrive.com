import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useSEO, injectJSONLD, removeJSONLD } from "@/lib/seo";
import { CheckCircle2, ArrowRight, AlertTriangle, Camera, RefreshCw, Wrench, Package, Clock, ChevronRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";

/* ── Compatible brands ── */
const BRANDS = [
  "SEW-Eurodrive", "Bonfiglioli", "Nord Drivesystems", "Flender (Siemens)",
  "Rossi", "Motovario", "Lenze", "Varvel", "Tramec", "Brevini",
  "Benzler", "Stöber", "Watt Drive", "Tsubaki",
];

/* ── Replacement scenarios ── */
const SCENARIOS = [
  {
    icon: <AlertTriangle className="w-6 h-6" />,
    title: "Failed Model Renewal",
    desc: "Your gearbox has failed and the OEM no longer supports the model. We review dimensional and performance data to propose a compatible Starshine replacement.",
    color: "border-red-200 bg-red-50",
    iconColor: "text-red-500 bg-red-100",
  },
  {
    icon: <Package className="w-6 h-6" />,
    title: "Discontinued Replacement",
    desc: "The original brand has discontinued the series. We cross-reference frame size, ratio, mounting form, and shaft interface to find the closest current equivalent.",
    color: "border-orange-200 bg-orange-50",
    iconColor: "text-orange-500 bg-orange-100",
  },
  {
    icon: <RefreshCw className="w-6 h-6" />,
    title: "Retrofit Project",
    desc: "You are upgrading a machine or changing the drive configuration. We can advise on ratio changes, motor adaptation, or switching to a more efficient series.",
    color: "border-blue-200 bg-blue-50",
    iconColor: "text-blue-500 bg-blue-100",
  },
  {
    icon: <Wrench className="w-6 h-6" />,
    title: "Preventive MRO Stocking",
    desc: "Avoid unplanned downtime by pre-stocking a replacement unit before the current one fails. We supply matched spares for your critical machines.",
    color: "border-green-200 bg-green-50",
    iconColor: "text-green-500 bg-green-100",
  },
];

/* ── Process steps ── */
const STEPS = [
  { n: "01", title: "Send Nameplate & Photos", desc: "Share the old unit's nameplate photo, installation photo, and any available dimensional sketch via email or WhatsApp." },
  { n: "02", title: "Engineering Review", desc: "Our engineers cross-reference the old unit's series, frame size, ratio, torque, mounting form, and shaft dimensions within one business day." },
  { n: "03", title: "Replacement Proposal", desc: "We confirm a direct replacement or advise on adaptations required (transition plate, modified shaft, coupling change) and provide a quotation." },
  { n: "04", title: "Sample & Approval", desc: "A sample unit can be dispatched for fitment verification before bulk order. Most standard replacements are available from stock." },
  { n: "05", title: "Delivery & Documentation", desc: "The replacement unit ships with full dimensional drawings, installation manual, and any required CE or material certificates for your records." },
];

/* ── What info to send ── */
const CHECKLIST = [
  "Nameplate photo (brand, series, model number, ratio, power, RPM)",
  "Photo of installed unit showing mounting arrangement",
  "Output shaft diameter, length, and keyway dimensions",
  "Mounting form (foot / flange / shaft-mounted / torque arm)",
  "Input configuration (motor direct / shaft / IEC flange)",
  "Gear ratio or input/output speed (r/min)",
  "Required output torque (N·m) or motor power (kW)",
  "Application description and duty cycle",
];

type FormData = {
  name: string; email: string; tel: string; company: string;
  need: string; oldBrand: string; gearboxType: string;
  ratio: string; motorPower: string; mounting: string;
  shaft: string; machine: string; workingHours: string; message: string;
};

const EMPTY: FormData = {
  name: "", email: "", tel: "", company: "",
  need: "", oldBrand: "", gearboxType: "",
  ratio: "", motorPower: "", mounting: "",
  shaft: "", machine: "", workingHours: "", message: "",
};

export default function ReplacementSupport() {
  useSEO({
    title: "Gearbox Replacement & MRO Support | Starshine Drive",
    description: "Replace failed or discontinued gearboxes with Starshine Drive equivalents. Compatible with SEW, Bonfiglioli, Nord, Flender, Rossi. Gearbox replacement India.",
    keywords: "gearbox replacement India, gear reducer replacement, MRO gearbox India, SEW replacement gearbox, Bonfiglioli replacement, discontinued gearbox replacement India, drop-in gear reducer replacement, gearbox supplier India MRO",
  });
  useEffect(() => {
    injectJSONLD("ld-replacement", {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Gearbox Replacement & MRO Support",
      url: "https://starshinedrive.com/replacement-support",
      description: "Replace failed or discontinued gearboxes with Starshine Drive equivalents. Compatible with SEW, Bonfiglioli, Nord, Flender, Rossi, and more.",
      provider: {
        "@type": "Organization",
        name: "Starshine Drive",
        url: "https://starshinedrive.com",
        telephone: "+91-9925001323",
        email: "sales@starshinedrive.com",
      },
      serviceType: "Gearbox Replacement & MRO",
      areaServed: { "@type": "Country", name: "India" },
    });
    return () => removeJSONLD("ld-replacement");
  }, []);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.need) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setForm(EMPTY);
    toast({ title: "Request Submitted", description: "Our team will review your replacement request within one business day." });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative flex items-center overflow-hidden bg-gray-100 py-16 md:py-0 md:min-h-[520px]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/75 to-white/20 z-10" />
          <div className="absolute inset-0 bg-[url('https://starshinedrives.com/wp-content/uploads/2025/03/replacement-hero.jpg')] bg-cover bg-center" />
          {/* Fallback gradient if image fails */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" style={{ zIndex: -1 }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 md:py-16 w-full">
          <div className="max-w-lg">
            <p className="text-accent font-semibold tracking-widest text-sm uppercase mb-3">MRO Support</p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-6 leading-tight">
              Replacement Review<br />for Existing Gearboxes
            </h1>
            <ul className="space-y-3 mb-8">
              {["Failed Model Renewal", "Discontinued Replace", "Retrofit Project"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-700 text-base">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <a href="#replacement-form">
              <Button className="bg-accent hover:bg-accent/90 text-white border-0 font-semibold px-7 py-3 text-base">
                Send Nameplate for Check
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ── Replacement Support heading ── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">Replacement Support</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Starshine engineers review your existing gearbox data and propose compatible replacements from our current product range — covering direct drop-ins, dimensional adaptations, and full retrofit projects.
          </p>
        </div>

        {/* Scenarios */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SCENARIOS.map((s) => (
            <div key={s.title} className={`rounded-xl border-2 p-6 flex flex-col ${s.color}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${s.iconColor}`}>
                {s.icon}
              </div>
              <h3 className="font-bold text-primary text-base mb-2">{s.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Compatible brands ── */}
      <section className="py-12 bg-[#f5f5f5]">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <h2 className="text-xl font-bold text-primary text-center mb-8">
            Compatible with Major International Brands
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {BRANDS.map((brand) => (
              <span key={brand} className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 shadow-sm">
                {brand}
              </span>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            Other brands available upon request — send nameplate for engineering confirmation.
          </p>
        </div>
      </section>

      {/* ── Important Notes + Form ── */}
      <section id="replacement-form" className="py-16 bg-white scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4 md:px-8 grid md:grid-cols-2 gap-10 items-start">

          {/* Left — Important notes */}
          <div className="bg-primary rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-heading font-bold mb-6">Important Notes</h2>
            <p className="text-white/80 text-sm mb-8 leading-relaxed">
              Replacement models require engineering confirmation. We do not publish unverified torque, ratio or dimension data for unclear models.
            </p>

            <div className="space-y-6 mb-8">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="font-bold text-accent mb-1">Direct replacement is not always possible.</p>
                  <p className="text-white/70 text-sm leading-relaxed">A direct replacement depends on the old gearbox dimensions, ratio, torque rating, shaft interface, and installation space.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Camera className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="font-bold text-accent mb-1">Photos and measurements improve review speed.</p>
                  <p className="text-white/70 text-sm leading-relaxed">Clear nameplate photos, shaft dimensions, mounting photos, and machine information help reduce back-and-forth communication.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                  <RefreshCw className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="font-bold text-accent mb-1">The old model may not be the right model anymore.</p>
                  <p className="text-white/70 text-sm leading-relaxed">If the previous gearbox failed because of overload, frequent shock, poor lubrication, or changed production demand, re-selection may be safer than copying the old unit.</p>
                </div>
              </div>
            </div>

            {/* What to send checklist */}
            <div className="bg-white/10 rounded-xl p-5">
              <p className="font-bold text-white mb-3 text-sm">What to include in your request:</p>
              <ul className="space-y-2">
                {CHECKLIST.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-white/80 text-xs">
                    <ChevronRight className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right — Replacement Check form */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-primary">Replacement Check</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="Name *" value={form.name} onChange={set("name")}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                <input required type="email" placeholder="Email *" value={form.email} onChange={set("email")}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Tel / WhatsApp" value={form.tel} onChange={set("tel")}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                <input placeholder="Company / Website" value={form.company} onChange={set("company")}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>

              <select required value={form.need} onChange={set("need")}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-gray-700">
                <option value="">Replacement Need *</option>
                <option>Failed unit — emergency replacement</option>
                <option>Discontinued model replacement</option>
                <option>Preventive MRO stocking</option>
                <option>Retrofit / upgrade project</option>
                <option>Spare parts only</option>
                <option>Other</option>
              </select>

              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Old brand / model / serial no." value={form.oldBrand} onChange={set("oldBrand")}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                <input placeholder="Gearbox type / series" value={form.gearboxType} onChange={set("gearboxType")}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Ratio / output speed" value={form.ratio} onChange={set("ratio")}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                <input placeholder="Motor power / input speed" value={form.motorPower} onChange={set("motorPower")}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Mounting type / position" value={form.mounting} onChange={set("mounting")}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                <input placeholder="Shaft / flange / key dimensions" value={form.shaft} onChange={set("shaft")}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Machine / application" value={form.machine} onChange={set("machine")}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                <input placeholder="Working hours / load condition" value={form.workingHours} onChange={set("workingHours")}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <textarea
                rows={4}
                placeholder="Briefly describe the old gearbox problem, replacement goal, space limits, failure symptoms, quantity, or any information useful for review *"
                value={form.message}
                onChange={set("message")}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />

              <Button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary/90 text-white border-0 font-semibold py-3 flex items-center justify-center gap-2">
                {submitting ? "Submitting…" : <><Send className="w-4 h-4" /> Submit Replacement Request</>}
              </Button>

              <p className="text-xs text-gray-400 text-center">
                Alternatively, email nameplate photos directly to{" "}
                <a href="mailto:sales@starshinedrive.com" className="text-primary hover:underline">sales@starshinedrive.com</a>
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* ── 5-step process ── */}
      <section className="py-16 bg-[#f5f5f5]">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-primary mb-3">How It Works</h2>
            <p className="text-gray-500 max-w-xl mx-auto">From nameplate photo to confirmed replacement in five simple steps.</p>
          </div>
          <div className="relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-gray-200" />
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {STEPS.map((step) => (
                <div key={step.n} className="flex flex-col items-center text-center relative">
                  <div className="w-16 h-16 rounded-full bg-primary text-white font-bold text-lg flex items-center justify-center mb-4 z-10 shadow-md">
                    {step.n}
                  </div>
                  <h3 className="font-bold text-primary text-sm mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-primary py-14">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Clock className="w-10 h-10 text-accent mx-auto mb-4" />
          <h2 className="text-3xl font-heading font-bold text-white mb-4">Need an Urgent Replacement?</h2>
          <p className="text-white/80 mb-8">
            Our team responds to replacement inquiries within one business day. Send us your nameplate details and we'll get back to you promptly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:sales@starshinedrive.com?subject=Urgent Replacement Request">
              <Button className="bg-accent hover:bg-accent/90 text-white border-0 font-semibold px-8">
                Email Sales Team
              </Button>
            </a>
            <Link href="/contact">
              <Button className="bg-transparent border border-white text-white hover:bg-white hover:text-primary font-semibold px-8">
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
