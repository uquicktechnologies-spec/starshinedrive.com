import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { 
  useListCustomers, getListCustomersQueryKey, 
  useCreateCustomer, useUpdateCustomer,
} from "@workspace/api-client-react";
import { LoadError, inputClass, labelClass, btnPrimaryClass, btnSecondaryClass, cardClass, EmptyState, EmptyRow, LoadingRow, guardedDownload, Pagination, paginate } from "./shared";
import { Plus, Search, Edit2, Upload, Download, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Customer, CustomerInput } from "@workspace/api-client-react";

/**
 * Free-text "Reference" field with a searchable dropdown of existing customers, so staff
 * pick who referred this customer from the actual customer list instead of retyping a
 * company name that then drifts from the real record. Still stores a plain string (the
 * `reference` field isn't a foreign key), so typing a name not in the list is also allowed
 * -- e.g. for referrals who aren't customers themselves yet. Uses a portal for the dropdown
 * because the form card has `overflow-hidden` (see cardClass), which would otherwise clip it.
 */
function CustomerReferenceInput({ value, customers, onChange, excludeId }: { value: string; customers: Customer[] | undefined; onChange: (v: string) => void; excludeId: number | null }) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const matches = (customers || [])
    .filter(c => c.id !== excludeId)
    .filter(c => c.companyName.toLowerCase().includes(value.toLowerCase()))
    .slice(0, 20);

  useEffect(() => {
    if (!open) return;
    const updateRect = () => {
      const el = inputRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect({ top: r.bottom + window.scrollY, left: r.left + window.scrollX, width: r.width });
    };
    updateRect();
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [open]);

  return (
    <div className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          name="reference"
          autoComplete="off"
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => { blurTimer.current = setTimeout(() => setOpen(false), 150); }}
          placeholder="Search or type a customer name..."
          className={`${inputClass} pl-8`}
        />
      </div>
      {open && matches.length > 0 && rect && createPortal(
        <div
          style={{ position: "absolute", top: rect.top, left: rect.left, width: rect.width }}
          className="z-50 mt-1 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-sm shadow-lg"
          onMouseDown={() => { if (blurTimer.current) clearTimeout(blurTimer.current); }}
        >
          {matches.map(c => (
            <button
              type="button"
              key={c.id}
              onClick={() => { onChange(c.companyName); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
            >
              <div className="font-bold text-slate-800">{c.companyName}</div>
              {c.contactPerson && <div className="text-[11px] text-slate-500">{c.contactPerson}</div>}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

type BulkUploadResult = {
  insertedCount: number;
  skippedCount: number;
  inserted: { id: number; companyName: string }[];
  skipped: { row: number; name: string; reason: string }[];
};

async function downloadCustomerSampleTemplate(): Promise<void> {
  return guardedDownload("customers-sample-template", async () => {
    try {
      const res = await fetch("/api/crm/customers/sample-template", { credentials: "include" });
      if (!res.ok) { alert("Unable to load data. Please try again."); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "customers-sample.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      alert("Unable to load data. Please try again.");
    }
  });
}

function CustomerBulkUploadModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkUploadResult | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/crm/customers/bulk-upload", { method: "POST", credentials: "include", body: fd });
      const body = await res.json().catch(() => null);
      if (!res.ok) { setUploadError(body?.error || "Upload failed. Please try again."); return; }
      setResult(body as BulkUploadResult);
      onDone();
    } catch {
      setUploadError("Upload failed. Please check your connection and try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={`${cardClass} w-full max-w-lg p-6 space-y-5`}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-heading font-bold text-[#093C71]">Upload Customers from Excel</h2>
            <p className="text-sm text-slate-500 mt-1">File must have a header row with a <strong>Company Name</strong> column (Contact Person, Email, Mobile No., GSTIN and other fields are optional). Rows with a company name that already exists are skipped automatically.</p>
            <button type="button" onClick={() => downloadCustomerSampleTemplate()} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#093C71] hover:text-[#EF6F24] mt-2">
              <Download size={14} /> Download sample file
            </button>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-sm hover:bg-slate-100"><X size={18} /></button>
        </div>

        {!result && (
          <>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-bold file:bg-slate-100 file:text-[#093C71] hover:file:bg-slate-200"
            />
            {uploadError && <p className="text-sm font-semibold text-red-600 flex items-center gap-1.5"><AlertTriangle size={14} /> {uploadError}</p>}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <button type="button" onClick={onClose} className={btnSecondaryClass}>Cancel</button>
              <button type="button" disabled={!file || uploading} onClick={handleUpload} className={btnPrimaryClass}>
                {uploading ? "Uploading…" : "Upload"}
              </button>
            </div>
          </>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
              <CheckCircle2 size={16} /> {result.insertedCount} customer{result.insertedCount === 1 ? "" : "s"} added.
            </div>
            {result.skippedCount > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5"><AlertTriangle size={14} className="text-amber-500" /> {result.skippedCount} row{result.skippedCount === 1 ? "" : "s"} skipped:</p>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-sm divide-y divide-slate-100">
                  {result.skipped.map((s, i) => (
                    <div key={i} className="px-3 py-2 text-sm flex justify-between gap-3">
                      <span className="text-slate-600">Row {s.row}{s.name ? ` — ${s.name}` : ""}</span>
                      <span className="text-amber-600 font-medium">{s.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button type="button" onClick={onClose} className={btnPrimaryClass}>Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Customers() {
  const client = useQueryClient();
  const { data: customers, isLoading, error, refetch } = useListCustomers({ query: { queryKey: getListCustomersQueryKey(), placeholderData: keepPreviousData } });
  
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [page, setPage] = useState(1);
  const [referenceText, setReferenceText] = useState("");

  if (error) return <LoadError error={error} onRetry={() => refetch()} />;

  const filteredCustomers = customers?.filter(c => 
    c.companyName.toLowerCase().includes(search.toLowerCase()) || 
    (c.contactPerson || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase())
  );
  const pagedCustomers = paginate(filteredCustomers, page);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: CustomerInput = {
      companyName: fd.get("companyName") as string,
      contactPerson: (fd.get("contactPerson") as string) || undefined,
      email: (fd.get("email") as string) || undefined,
      phone: (fd.get("phone") as string) || undefined,
      gstin: (fd.get("gstin") as string) || undefined,
      cin: (fd.get("cin") as string) || undefined,
      stateCode: (fd.get("stateCode") as string) || undefined,
      addressLine1: (fd.get("addressLine1") as string) || undefined,
      addressLine2: (fd.get("addressLine2") as string) || undefined,
      addressLine3: (fd.get("addressLine3") as string) || undefined,
      city: (fd.get("city") as string) || undefined,
      state: (fd.get("state") as string) || undefined,
      leadSource: (fd.get("leadSource") as string) || "Manual",
      reference: (fd.get("reference") as string) || undefined,
    };

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: payload },
        { onSuccess: () => {
          client.invalidateQueries({ queryKey: getListCustomersQueryKey() });
          setShowForm(false);
          setEditingId(null);
        }}
      );
    } else {
      createMutation.mutate(
        { data: payload },
        { onSuccess: () => {
          client.invalidateQueries({ queryKey: getListCustomersQueryKey() });
          setShowForm(false);
        }}
      );
    }
  };

  const editCustomer = (c: Customer) => {
    setEditingId(c.id);
    setReferenceText(c.reference || "");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-[#093C71]">Customers</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage client billing and contact details.</p>
        </div>
        {!showForm && (
          <div className="flex gap-3">
            <button onClick={() => { setEditingId(null); setReferenceText(""); setShowForm(true); }} className={btnPrimaryClass}>
              <Plus size={16} /> Add Customer
            </button>
            <button onClick={() => setShowUpload(true)} className={btnSecondaryClass}><Upload size={16} /> Upload Excel</button>
          </div>
        )}
      </div>
      {showUpload && (
        <CustomerBulkUploadModal
          onClose={() => setShowUpload(false)}
          onDone={() => client.invalidateQueries({ queryKey: getListCustomersQueryKey() })}
        />
      )}

      {showForm && (() => {
        const c = editingId ? customers?.find(x => x.id === editingId) : null;
        return (
          <div className={`${cardClass} p-6 bg-slate-50 border-t-4 border-t-[#093C71]`}>
            <h2 className="text-lg font-bold text-[#093C71] mb-5">{editingId ? 'Edit Customer' : 'New Customer'}</h2>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div><label className={labelClass}>Company Name *</label><input required name="companyName" defaultValue={c?.companyName} className={inputClass} /></div>
              <div><label className={labelClass}>Contact Person</label><input name="contactPerson" defaultValue={c?.contactPerson || ""} className={inputClass} /></div>
              <div><label className={labelClass}>Email</label><input type="email" name="email" defaultValue={c?.email || ""} className={inputClass} /></div>
              <div><label className={labelClass}>Mobile No.</label><input name="phone" defaultValue={c?.phone || ""} className={inputClass} /></div>
              <div><label className={labelClass}>GSTIN</label><input name="gstin" defaultValue={c?.gstin || ""} className={inputClass} /></div>
              <div><label className={labelClass}>CIN No.</label><input name="cin" defaultValue={c?.cin || ""} className={inputClass} /></div>
              <div><label className={labelClass}>Address Line 1</label><input name="addressLine1" defaultValue={c?.addressLine1 || ""} className={inputClass} /></div>
              <div><label className={labelClass}>Address Line 2</label><input name="addressLine2" defaultValue={c?.addressLine2 || ""} className={inputClass} /></div>
              <div><label className={labelClass}>Address Line 3</label><input name="addressLine3" defaultValue={c?.addressLine3 || ""} className={inputClass} /></div>
              <div><label className={labelClass}>State Code</label><input name="stateCode" defaultValue={c?.stateCode || ""} className={inputClass} /></div>
              <div><label className={labelClass}>City</label><input name="city" defaultValue={c?.city || ""} className={inputClass} /></div>
              <div><label className={labelClass}>State</label><input name="state" defaultValue={c?.state || ""} className={inputClass} /></div>
              <div><label className={labelClass}>Lead Source</label><input name="leadSource" defaultValue={c?.leadSource || "Manual"} className={inputClass} /></div>
              <div><label className={labelClass}>Reference</label><CustomerReferenceInput value={referenceText} customers={customers} onChange={setReferenceText} excludeId={editingId} /></div>
              <div className="lg:col-span-3 flex justify-end gap-3 mt-3 pt-5 border-t border-slate-200">
                <button type="button" onClick={() => setShowForm(false)} className={btnSecondaryClass}>Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className={btnPrimaryClass}>Save Customer</button>
              </div>
            </form>
          </div>
        );
      })()}

      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              placeholder="Search customers..." 
              value={search} 
              onChange={e => { setSearch(e.target.value); setPage(1); }} 
              className={`${inputClass} pl-10`} 
            />
          </div>
        </div>
        <div className={cardClass}>
          <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
              <tr>
                <th className="px-5 py-4">Company</th>
                <th className="px-5 py-4">Contact Person</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Lead Source</th>
                <th className="px-5 py-4">Reference</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <LoadingRow colSpan={8} />
              ) : pagedCustomers.length ? (
                pagedCustomers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-[#093C71]">{c.companyName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{c.gstin ? `GST: ${c.gstin}` : 'No GST recorded'}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-700">{c.contactPerson || '—'}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{c.phone || '—'}</div>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-600">{c.email || '—'}</td>
                    <td className="px-5 py-4 font-medium text-slate-600">
                      {[c.city, c.state].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-600">{c.leadSource || '—'}</td>
                    <td className="px-5 py-4 font-medium text-slate-600">{c.reference || '—'}</td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button onClick={() => editCustomer(c)} className="p-2 text-slate-400 hover:text-[#093C71] rounded-sm hover:bg-slate-100 transition-colors" title="Edit">
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyRow colSpan={8} actionLabel="Add Customer" onAction={() => { setEditingId(null); setShowForm(true); }} />
              )}
            </tbody>
          </table>
          </div>
          <Pagination page={page} onPageChange={setPage} totalItems={filteredCustomers?.length ?? 0} />
        </div>
      </div>
    </div>
  );
}
