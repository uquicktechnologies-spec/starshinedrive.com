import { useState, useRef, useEffect } from "react";
import { useSEO, injectJSONLD, removeJSONLD } from "@/lib/seo";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { CheckSquare, ChevronDown, X, Check, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateInquiry } from "@workspace/api-client-react";

const PRODUCTS = [
  "R Series Helical Gear Reducer",
  "F Series Parallel Shaft Helical Gear Reducer",
  "K Series Helical-Bevel Gear Reducer",
  "S Series Helical-Worm Gear Reducer",
  "RV Series Worm Gear Reducer",
  "NMRV / NRV Worm Gear Reducer",
  "Compact Geared Motors",
  "Helical-Hypoid Gear Units",
  "Planetary Gearbox",
  "Cycloidal Gear Reducer",
];

const INDUSTRIES = [
  "Food & Beverage",
  "Packaging & Printing",
  "Material Handling / Conveyors",
  "Mining & Construction",
  "Chemical & Process",
  "Steel & Metallurgy",
  "Wastewater Treatment",
  "Agriculture & Irrigation",
  "Automation & Robotics",
  "Textile & Garment",
  "Other",
];

const COUNTRIES = [
  "India", "China", "USA", "Germany", "UK", "Australia", "UAE", "Saudi Arabia",
  "Bangladesh", "Pakistan", "Sri Lanka", "Nepal", "Indonesia", "Malaysia",
  "Thailand", "Vietnam", "Brazil", "Mexico", "Canada", "France", "Italy",
  "Spain", "Turkey", "South Korea", "Japan", "Other",
];

function MultiSelect({
  options,
  selected,
  onChange,
  placeholder,
}: {
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (val: string) =>
    onChange(selected.includes(val) ? selected.filter((s) => s !== val) : [...selected, val]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between border border-gray-300 rounded-sm px-4 py-3 text-sm bg-white focus:outline-none focus:border-primary transition-colors min-h-[46px]"
      >
        <span className={cn("flex flex-wrap gap-1.5 flex-1 text-left", !selected.length && "text-gray-400")}>
          {selected.length === 0 ? (
            placeholder
          ) : (
            selected.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium"
              >
                {s}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-accent"
                  onClick={(e) => { e.stopPropagation(); toggle(s); }}
                />
              </span>
            ))
          )}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-gray-400 shrink-0 ml-2 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-sm shadow-xl max-h-60 overflow-y-auto">
          {options.map((opt) => {
            const isSelected = selected.includes(opt);
            return (
              <div
                key={opt}
                onClick={() => toggle(opt)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 transition-colors",
                  isSelected && "bg-primary/5"
                )}
              >
                <div className={cn(
                  "w-4 h-4 rounded-sm border flex items-center justify-center shrink-0",
                  isSelected ? "bg-primary border-primary" : "border-gray-300"
                )}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={cn("font-medium", isSelected ? "text-primary" : "text-gray-700")}>{opt}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-800 mb-1.5">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-gray-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors bg-white placeholder:text-gray-400";
const selectCls = "w-full border border-gray-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors bg-white text-gray-700 appearance-none";

export default function GetQuote() {
  useSEO({
    title: "Get a Gearbox Quote | Starshine Drive India",
    description: "Request a gearbox quote from Starshine Drive. Gear reducers, worm gearboxes, helical gearboxes, geared motors. OEM pricing, 24-hour response, India.",
    keywords: "gearbox price India, gear reducer quote, industrial gearbox price Gujarat, worm gearbox price India, helical gear reducer price, OEM gearbox quote India, gearbox supplier quote",
    noIndex: false,
  });
  useEffect(() => {
    injectJSONLD("ld-get-quote", {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Get a Gearbox Quote — Starshine Drive",
      url: "https://starshinedrive.com/get-quote",
      description: "Request a quote for industrial gearboxes, gear reducers, worm gearboxes, helical gearboxes, and geared motors. OEM pricing from Starshine Drive, India.",
      potentialAction: {
        "@type": "QuoteAction",
        target: "https://starshinedrive.com/get-quote",
        name: "Request Gearbox Quote",
      },
    });
    return () => removeJSONLD("ld-get-quote");
  }, []);
  const [products, setProducts] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const createInquiry = useCreateInquiry();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!products.length) {
      setSubmitError("Please select at least one product.");
      return;
    }
    const form = new FormData(e.currentTarget);
    setSubmitError("");
    createInquiry.mutate({
      data: {
        contactPerson: String(form.get("fullName")),
        email: String(form.get("email")),
        phone: String(form.get("phone")),
        companyName: String(form.get("companyName")),
        industry: String(form.get("industry")),
        leadSource: "Website quote form",
        productInterest: products,
        quantity: String(form.get("quantity") || ""),
        message: String(form.get("message")),
        address: String(form.get("country")),
      },
    }, {
      onSuccess: () => setSubmitted(true),
      onError: () => setSubmitError("We could not save your request. Please try again or contact us directly."),
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* ── Navy hero ── */}
      <div className="bg-primary py-16 px-4 relative overflow-hidden">
        {/* Subtle dot grid texture */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="container mx-auto max-w-3xl relative z-10 text-white text-center">
          <p className="text-accent font-bold text-sm uppercase tracking-widest mb-3">Quote Request</p>
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">Get a Quote</h1>
          <p className="text-blue-100 text-[15px] leading-relaxed max-w-xl mx-auto mb-10">
            Have a specific application in mind? Our engineering team is ready to help you select or customize the perfect power transmission solution.
          </p>

          {/* Steps */}
          <div className="flex flex-col sm:flex-row justify-center gap-5 mb-2">
            {[
              "Submit your requirements",
              "Receive detailed technical specs & CAD",
              "Get competitive pricing within 24 hours",
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3 text-left sm:flex-col sm:items-center sm:text-center">
                <div className="w-8 h-8 rounded-full border-2 border-white/50 flex items-center justify-center shrink-0 font-bold text-sm">
                  {i + 1}
                </div>
                <span className="text-blue-100 text-sm">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Form card ── */}
      <div className="bg-primary px-4 pb-16">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-sm shadow-2xl p-7 md:p-10">

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-heading font-bold text-primary mb-2">Request Submitted!</h3>
                <p className="text-gray-500 text-sm">Our team will contact you within 24 hours with technical specifications and pricing.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Personal */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Personal Details</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Full Name" required>
                      <input name="fullName" type="text" placeholder="John Doe" required className={inputCls} />
                    </Field>
                    <Field label="Job Title">
                      <input name="jobTitle" type="text" placeholder="e.g. Procurement Manager" className={inputCls} />
                    </Field>
                    <Field label="Email Address" required>
                      <input name="email" type="email" placeholder="john@company.com" required className={inputCls} />
                    </Field>
                    <Field label="Phone / WhatsApp" required>
                      <input name="phone" type="tel" placeholder="+91 99250 01323" required className={inputCls} />
                    </Field>
                    <Field label="Country" required>
                      <div className="relative">
                        <select name="country" required className={selectCls}>
                          <option value="">Select country...</option>
                          {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </Field>
                  </div>
                </div>

                {/* Company */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Company Details</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Company Name" required>
                      <input name="companyName" type="text" placeholder="Acme Industries Pvt. Ltd." required className={inputCls} />
                    </Field>
                    <Field label="Company Website">
                      <input name="website" type="url" placeholder="https://yourcompany.com" className={inputCls} />
                    </Field>
                    <Field label="Industry / Application">
                      <div className="relative">
                        <select name="industry" className={selectCls}>
                          <option value="">Select industry...</option>
                          {INDUSTRIES.map((ind) => <option key={ind}>{ind}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </Field>
                    <Field label="Estimated Quantity">
                      <div className="relative">
                        <select name="quantity" className={selectCls}>
                          <option value="">Select quantity...</option>
                          {["1–5 units", "6–20 units", "21–50 units", "51–100 units", "100+ units"].map((q) => (
                            <option key={q}>{q}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </Field>
                  </div>
                </div>

                {/* Products */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Product Interest</p>
                  <Field label="Products Interested" required>
                    <MultiSelect
                      options={PRODUCTS}
                      selected={products}
                      onChange={setProducts}
                      placeholder="Select one or more products..."
                    />
                    {products.length === 0 && (
                      <p className="text-xs text-gray-400 mt-1">You can select multiple products</p>
                    )}
                  </Field>
                </div>

                {/* Requirements */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Technical Requirements</p>
                  <Field label="Message / Requirements" required>
                      <textarea name="message"
                      rows={5}
                      required
                      placeholder="Describe your application — power (kW), torque (N·m), gear ratio, mounting type, operating conditions, or attach a nameplate photo..."
                      className={`${inputCls} resize-none`}
                    />
                  </Field>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={createInquiry.isPending}
                  className="w-full bg-accent hover:bg-accent/90 text-white border-0 font-bold text-base gap-2 mt-2"
                >
                  <Send className="w-4 h-4" />
                  {createInquiry.isPending ? "Submitting…" : "Submit Request"}
                </Button>
                {submitError && <p className="text-center text-sm text-red-600">{submitError}</p>}

                <p className="text-center text-xs text-gray-400 mt-3">
                  By submitting you agree to be contacted by Starshine Drive's sales team. No spam — ever.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
