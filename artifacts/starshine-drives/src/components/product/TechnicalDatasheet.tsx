import { useState } from "react";
import { Download, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/data/products";
import { PRODUCT_CONFIGS } from "@/data/products-config";

import imgDirectMotor  from "@assets/Direct-Motor-Input_1785672233660.webp";
import imgShaftInput   from "@assets/Shaft-Input_1785672233656.webp";
import imgFlangeInput  from "@assets/Flange-Input_1785672233660.webp";
import imgIECAdapter   from "@assets/IEC-Motor-Adapter_1785672233655.webp";
import imgBrakeMotor   from "@assets/Brake-Motor_1785672233659.webp";
import imgVFDMotor     from "@assets/VFD-Motor-Option_1785672233657.webp";
import imgRDirectMotor      from "@assets/R-series-with-Direct-Motor-Input_1785677982993.webp";
import imgRShaftInput       from "@assets/R-series-with-Shaft-Input_1785678002515.webp";
import imgRFlangeInput      from "@assets/R-series-with-Flange-Input_1785678018884.webp";
import imgRightAngleWorm    from "@assets/Right-Angle_Worm_Drive_1785682690098.webp";
import imgDoubleStageOption from "@assets/Double-Stage-Option_1785682690097.webp";

const CONFIG_IMAGES: Record<string, string> = {
  "Direct Motor Input":    imgDirectMotor,
  "Direct Drive":          imgDirectMotor,
  "Inline Configuration":  imgDirectMotor,
  "Shaft Input":           imgShaftInput,
  "Flange Input":          imgFlangeInput,
  "Servo Motor Flange":    imgFlangeInput,
  "Stepper Motor Flange":  imgFlangeInput,
  "IEC Motor Adapter":       imgIECAdapter,
  "Brake Motor":             imgBrakeMotor,
  "VFD Motor Option":        imgVFDMotor,
  "Right-Angle Worm Drive":  imgRightAngleWorm,
  "Double-Stage Option":     imgDoubleStageOption,
};

/* Per-product image overrides keyed by slug → inputType label */
const PRODUCT_CONFIG_IMAGE_OVERRIDES: Record<string, Record<string, string>> = {
  "r-series-helical-gear-reducer": {
    "Direct Motor Input": imgRDirectMotor,
    "Shaft Input":        imgRShaftInput,
    "Flange Input":       imgRFlangeInput,
  },
};

interface TechnicalDatasheetProps {
  product: Product;
  onDownload?: () => void;
}


/* ── FAQ accordion item ───────────────────────────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
        onClick={() => setOpen((p) => !p)}
      >
        <span className="font-semibold text-primary text-[16px] group-hover:text-accent transition-colors leading-snug">
          {q}
        </span>
        {open ? (
          <ChevronUp className="w-5 h-5 text-accent shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
        )}
      </button>
      {open && (
        <p className="pb-5 text-gray-600 text-[15px] leading-relaxed">{a}</p>
      )}
    </div>
  );
}

/* ── Main component ───────────────────────────────────────── */
const TABS = ["Configuration", "Specifications", "Model Range", "FAQs"] as const;
type Tab = typeof TABS[number];

export function TechnicalDatasheet({ product, onDownload }: TechnicalDatasheetProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Configuration");
  const config = PRODUCT_CONFIGS[product.slug];

  return (
    <section id="datasheets" className="py-14 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center text-primary mb-8">
          Technical Datasheets
        </h2>

        {/* Tab bar — all 4 tabs in a single row */}
        <div className="mb-12 flex justify-center px-2">
          <div className="flex items-center gap-0.5 p-1 rounded-full bg-gray-100 w-full max-w-lg">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 px-2 py-2 text-xs md:text-sm font-semibold rounded-full transition-all text-center whitespace-nowrap",
                  activeTab === tab
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-600 hover:text-primary"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ── Configuration ── */}
        {activeTab === "Configuration" && config && (
          <div>
            {/* Input type diagrams — single horizontal row, real images */}
            {/* Mobile: 2-column grid; Desktop: single row */}
            <div className="grid grid-cols-2 md:hidden gap-4 mb-6 px-2">
              {config.inputTypes.map((type) => {
                const overrides = PRODUCT_CONFIG_IMAGE_OVERRIDES[product.slug] ?? {};
                const imgSrc = overrides[type] ?? CONFIG_IMAGES[type];
                return (
                  <div key={type} className="flex flex-col items-center gap-2 text-center">
                    {imgSrc ? (
                      <div className="flex items-center justify-center w-full h-[100px]">
                        <img src={imgSrc} alt={type} className="max-h-full max-w-full object-contain" loading="lazy" decoding="async" />
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded flex items-center justify-center text-gray-300 text-xs w-full h-[100px]">{type}</div>
                    )}
                    <span className="text-[11px] italic text-gray-500 leading-tight">{type}</span>
                  </div>
                );
              })}
            </div>
            {/* Desktop: single scrollable row */}
            <div className="hidden md:flex gap-4 mb-6 justify-center">
              {config.inputTypes.map((type) => {
                const overrides = PRODUCT_CONFIG_IMAGE_OVERRIDES[product.slug] ?? {};
                const imgSrc = overrides[type] ?? CONFIG_IMAGES[type];
                return (
                  <div key={type} className="flex flex-col items-center gap-2 text-center w-[160px]">
                    {imgSrc ? (
                      <div className="flex items-center justify-center w-full h-[140px]">
                        <img src={imgSrc} alt={type} className="max-h-full max-w-full object-contain" loading="lazy" decoding="async" />
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded flex items-center justify-center text-gray-300 text-xs w-full h-[140px]">{type}</div>
                    )}
                    <span className="text-[11px] italic text-gray-500 leading-tight">{type}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Specifications ── */}
        {activeTab === "Specifications" && (
          <div className="overflow-x-auto rounded-sm border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="px-5 py-3 text-left font-semibold w-1/3">Item</th>
                  <th className="px-5 py-3 text-left font-semibold">Data</th>
                </tr>
              </thead>
              <tbody>
                {product.specifications.map((row, i) => (
                  <tr key={row.item} className={cn("transition-colors hover:bg-accent/5", i % 2 === 0 ? "bg-white" : "bg-gray-50")}>
                    <td className="px-5 py-3 font-semibold text-gray-700 whitespace-nowrap border-r border-gray-100">{row.item}</td>
                    <td className="px-5 py-3 text-gray-600">{row.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Model Range ── */}
        {activeTab === "Model Range" && (
          <div className="overflow-x-auto rounded-sm border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary text-white">
                  {product.modelRangeHeaders.filter(Boolean).map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-sm whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {product.modelRange.map((row, i) => (
                  <tr key={i} className={cn("transition-colors hover:bg-accent/5", i % 2 === 0 ? "bg-white" : "bg-gray-50")}>
                    {row.filter((_, ci) => product.modelRangeHeaders[ci]).map((cell, ci) => (
                      <td key={ci} className={cn("px-4 py-3 whitespace-nowrap", ci === 0 ? "font-bold text-primary" : "text-gray-700")}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── FAQs ── */}
        {activeTab === "FAQs" && config && (
          <div className="border border-gray-200 rounded-sm px-8">
            {config.faqs.map((faq) => (
              <FAQItem key={faq.question} q={faq.question} a={faq.answer} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
