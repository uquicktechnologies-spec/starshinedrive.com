import { useState } from "react";
import { inputClass, labelClass, btnPrimaryClass, btnSecondaryClass, cardClass, guardedDownload } from "../shared";
import { FileDown, FileSpreadsheet, FileText } from "lucide-react";

const REPORTS = [
  { id: "current_stock", label: "Current Stock" },
  { id: "low_stock", label: "Low Stock" },
  { id: "out_of_stock", label: "Out of Stock" },
  { id: "stock_movement", label: "Stock Movement" },
  { id: "purchases", label: "Purchases" },
  { id: "sales", label: "Sales" },
  { id: "products", label: "Products" },
  { id: "supplier", label: "Supplier" },
  { id: "customer", label: "Customer" },
  { id: "profit_loss", label: "Profit & Loss" },
];

async function downloadReport(report: string, format: "csv" | "xlsx" | "pdf", from: string, to: string) {
  return guardedDownload(`report-${report}-${format}-${from}-${to}`, async () => {
    try {
      const params = new URLSearchParams({ report, format });
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const res = await fetch(`/api/crm/reports?${params.toString()}`, { credentials: "include" });
      if (!res.ok) { alert("Unable to load data. Please try again."); return; }
      if (format === "pdf") {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report}.${format}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      alert("Unable to load data. Please try again.");
    }
  });
}

export function Reports({ canExport }: { canExport: boolean }) {
  const [report, setReport] = useState(REPORTS[0].id);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-[#093C71]">Reports</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Export stock, purchase, sales and financial reports.</p>
      </div>

      <div className={`${cardClass} p-6 space-y-5`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className={labelClass}>Report</label>
            <select value={report} onChange={e => setReport(e.target.value)} className={inputClass}>
              {REPORTS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </div>
          <div><label className={labelClass}>From</label><input type="date" value={from} onChange={e => setFrom(e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>To</label><input type="date" value={to} onChange={e => setTo(e.target.value)} className={inputClass} /></div>
        </div>
        {canExport ? (
          <div className="flex gap-3 pt-3 border-t border-slate-200">
            <button onClick={() => downloadReport(report, "csv", from, to)} className={btnSecondaryClass}><FileDown size={16} /> CSV</button>
            <button onClick={() => downloadReport(report, "xlsx", from, to)} className={btnSecondaryClass}><FileSpreadsheet size={16} /> Excel</button>
            <button onClick={() => downloadReport(report, "pdf", from, to)} className={btnPrimaryClass}><FileText size={16} /> PDF</button>
          </div>
        ) : (
          <p className="text-sm font-medium text-slate-500 pt-3 border-t border-slate-200">You have view-only access to reports and cannot export.</p>
        )}
      </div>
    </div>
  );
}
