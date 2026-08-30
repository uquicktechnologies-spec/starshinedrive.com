import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WebProductDetail } from "@workspace/api-client-react";
import { getProductConfigImage } from "@/components/product/TechnicalDatasheet";

function storageUrl(path: string) {
  return `/api/storage${path}`;
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

/* ── Main component — CMS-backed equivalent of TechnicalDatasheet ───── */
const TABS = ["Configuration", "Specifications", "Model Range", "FAQs"] as const;
type Tab = typeof TABS[number];

interface Props {
  product: WebProductDetail;
}

export function TechnicalDatasheetDynamic({ product }: Props) {
  const availableTabs = TABS.filter((tab) => {
    if (tab === "Configuration") return product.configInputTypes.length > 0;
    if (tab === "Specifications") return product.specGroups.some((g) => g.specs.length > 0);
    if (tab === "Model Range") return product.modelRangeHeaders.length > 0 && product.modelRangeRows.length > 0;
    if (tab === "FAQs") return product.faqs.length > 0;
    return false;
  });
  const [activeTab, setActiveTab] = useState<Tab>(availableTabs[0] ?? "Specifications");

  if (availableTabs.length === 0) return null;

  return (
    <section id="datasheets" className="py-14 md:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center text-primary mb-8">
          Technical Datasheets
        </h2>

        <div className="mb-12 flex justify-center px-2">
          <div className="flex items-center gap-0.5 p-1 rounded-full bg-gray-100 w-full max-w-lg">
            {availableTabs.map((tab) => (
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
        {activeTab === "Configuration" && (
          <div>
            <div className="grid grid-cols-2 md:hidden gap-4 mb-6 px-2">
              {product.configInputTypes.map((type) => {
                const imgSrc = type.imageUrl
                  ? storageUrl(type.imageUrl)
                  : getProductConfigImage(product.slug, type.label);
                return (
                <div key={type.id} className="flex flex-col items-center gap-2 text-center">
                  {imgSrc ? (
                    <div className="flex items-center justify-center w-full h-[100px]">
                      <img src={imgSrc} alt={type.label} className="max-h-full max-w-full object-contain" loading="lazy" decoding="async" />
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded flex items-center justify-center text-gray-300 text-xs w-full h-[100px]">{type.label}</div>
                  )}
                  <span className="text-[11px] italic text-gray-500 leading-tight">{type.label}</span>
                </div>
                );
              })}
            </div>
            <div className="hidden md:flex gap-4 mb-6 justify-center flex-wrap">
              {product.configInputTypes.map((type) => {
                const imgSrc = type.imageUrl
                  ? storageUrl(type.imageUrl)
                  : getProductConfigImage(product.slug, type.label);
                return (
                <div key={type.id} className="flex flex-col items-center gap-2 text-center w-[160px]">
                  {imgSrc ? (
                    <div className="flex items-center justify-center w-full h-[140px]">
                      <img src={imgSrc} alt={type.label} className="max-h-full max-w-full object-contain" loading="lazy" decoding="async" />
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded flex items-center justify-center text-gray-300 text-xs w-full h-[140px]">{type.label}</div>
                  )}
                  <span className="text-[11px] italic text-gray-500 leading-tight">{type.label}</span>
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Specifications (spec groups flattened into one Item/Data table) ── */}
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
                {product.specGroups.flatMap((group) => {
                  const rows = [];
                  if (product.specGroups.length > 1) {
                    rows.push(
                      <tr key={`group-${group.id}`} className="bg-primary/5">
                        <td colSpan={2} className="px-5 py-2 font-bold text-primary text-xs uppercase tracking-wider">{group.groupName}</td>
                      </tr>
                    );
                  }
                  group.specs.forEach((row, i) => {
                    rows.push(
                      <tr key={row.id} className={cn("transition-colors hover:bg-accent/5", i % 2 === 0 ? "bg-white" : "bg-gray-50")}>
                        <td className="px-5 py-3 font-semibold text-gray-700 whitespace-nowrap border-r border-gray-100">{row.label}</td>
                        <td className="px-5 py-3 text-gray-600">{row.value}</td>
                      </tr>
                    );
                  });
                  return rows;
                })}
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
                  {product.modelRangeHeaders.filter(Boolean).map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left font-semibold text-sm whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {product.modelRangeRows.map((row, i) => (
                  <tr key={row.id} className={cn("transition-colors hover:bg-accent/5", i % 2 === 0 ? "bg-white" : "bg-gray-50")}>
                    {row.cells.map((cell, ci) => (
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
        {activeTab === "FAQs" && (
          <div className="border border-gray-200 rounded-sm px-8">
            {product.faqs.map((faq) => (
              <FAQItem key={faq.id} q={faq.question} a={faq.answer} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
