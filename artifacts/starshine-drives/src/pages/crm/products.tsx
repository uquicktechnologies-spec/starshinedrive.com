import { useRef, useState } from "react";
import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  useListProducts,
  getListProductsQueryKey,
  useCreateProduct,
  useUpdateProduct,
  useListCategories,
  useListSubGroups,
  getListCategoriesQueryKey,
  getListSubGroupsQueryKey,
} from "@workspace/api-client-react";
import { LoadError, inputClass, labelClass, btnPrimaryClass, btnSecondaryClass, cardClass, ImagePickerButton, LoadingRow, EmptyRow, guardedDownload, Pagination, paginate } from "./shared";
import { Plus, Edit2, Search, Image, X, Printer, Upload, Download, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { ProductInput, Product, Category, SubGroup } from "@workspace/api-client-react";
import { QRCodeSVG } from "qrcode.react";
import JsBarcode from "jsbarcode";

function LabelPrintDialog({ product, onClose }: { product: { productName: string; productCode?: string | null; barcode?: string | null; qrCode?: string | null }; onClose: () => void }) {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const code = product.barcode || product.productCode || "";
  const [ready, setReady] = useState(false);
  if (barcodeRef.current && code && !ready) {
    try { JsBarcode(barcodeRef.current, code, { format: "CODE128", height: 40, displayValue: true, fontSize: 12 }); setReady(true); } catch { /* invalid code, skip */ }
  }
  return (
    <div className="fixed inset-0 bg-black/40 z-30 flex items-center justify-center p-4 print:bg-white print:static" onClick={onClose}>
      <div className={`${cardClass} w-full max-w-sm p-6 print:shadow-none print:border-0`} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 print:hidden">
          <h2 className="font-bold text-lg text-[#093C71]">Print Label</h2>
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="font-bold text-slate-800">{product.productName}</div>
          <QRCodeSVG value={product.qrCode || product.productCode || product.productName} size={120} />
          {code && <svg ref={barcodeRef} />}
        </div>
        <div className="flex justify-end mt-5 print:hidden">
          <button onClick={() => window.print()} className={btnPrimaryClass}><Printer size={16} /> Print</button>
        </div>
      </div>
    </div>
  );
}

type BulkUploadResult = {
  insertedCount: number;
  skippedCount: number;
  inserted: { id: number; productName: string }[];
  skipped: { row: number; name: string; reason: string }[];
};

async function downloadProductSampleTemplate(): Promise<void> {
  return guardedDownload("products-sample-template", async () => {
    try {
      const res = await fetch("/api/crm/products/sample-template", { credentials: "include" });
      if (!res.ok) { alert("Unable to load data. Please try again."); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "products-sample.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      alert("Unable to load data. Please try again.");
    }
  });
}

function ProductBulkUploadModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
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
      const res = await fetch("/api/crm/products/bulk-upload", { method: "POST", credentials: "include", body: fd });
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
            <h2 className="text-lg font-heading font-bold text-[#093C71]">Upload Products from Excel</h2>
            <p className="text-sm text-slate-500 mt-1">File must have a header row with a <strong>Product Name</strong> column (Category, Sub Group, HSN/SAC, Unit, Unit Price, GST %, Brand, Model, Min/Max/Opening Stock are optional). Rows with a product name that already exists are skipped automatically.</p>
            <button type="button" onClick={() => downloadProductSampleTemplate()} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#093C71] hover:text-[#EF6F24] mt-2">
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
              <CheckCircle2 size={16} /> {result.insertedCount} product{result.insertedCount === 1 ? "" : "s"} added.
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

export function Products({ canEdit }: { canEdit: boolean }) {
  const client = useQueryClient();
  const { data: products, isLoading, error, refetch } = useListProducts({ query: { queryKey: getListProductsQueryKey(), placeholderData: keepPreviousData } });
  const { data: categories } = useListCategories({ activeOnly: true }, { query: { queryKey: getListCategoriesQueryKey({ activeOnly: true }), placeholderData: keepPreviousData } });
  const { data: subGroups } = useListSubGroups({ activeOnly: true }, { query: { queryKey: getListSubGroupsQueryKey({ activeOnly: true }), placeholderData: keepPreviousData } });
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [labelFor, setLabelFor] = useState<{ productName: string; productCode?: string | null; barcode?: string | null; qrCode?: string | null } | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [page, setPage] = useState(1);

  if (error) return <LoadError error={error} onRetry={() => refetch()} />;

  const filteredProducts = products?.filter(p => 
    p.productName.toLowerCase().includes(search.toLowerCase()) || 
    (p.hsnSac || "").toLowerCase().includes(search.toLowerCase())
  );
  const pagedProducts = paginate(filteredProducts, page);
  const categoryById = new Map((categories ?? []).map(c => [c.id, c.name]));
  const subGroupById = new Map((subGroups ?? []).map(sg => [sg.id, sg.name]));

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: ProductInput = {
      productName: fd.get("productName") as string,
      description: (fd.get("description") as string) || undefined,
      hsnSac: (fd.get("hsnSac") as string) || undefined,
      unit: (fd.get("unit") as string) || "Nos",
      unitPrice: Number(fd.get("unitPrice")) || 0,
      gstPercent: Number(fd.get("gstPercent")) || 18,
      categoryId: fd.get("categoryId") ? Number(fd.get("categoryId")) : null,
      subGroupId: fd.get("subGroupId") ? Number(fd.get("subGroupId")) : null,
      brand: (fd.get("brand") as string) || undefined,
      model: (fd.get("model") as string) || undefined,
      minStock: Number(fd.get("minStock")) || 0,
      maxStock: Number(fd.get("maxStock")) || 0,
      openingStock: Number(fd.get("openingStock")) || 0,
      trackBatch: fd.get("trackBatch") === "on",
      trackExpiry: fd.get("trackExpiry") === "on",
      // Only send when the uploader was actually touched this session
      // (new upload, or explicit Remove) -- otherwise omit so an untouched
      // form submit doesn't wipe an existing image.
      imageUrl: imageUrl === undefined ? undefined : (imageUrl ?? ""),
    };

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: payload },
        { onSuccess: () => {
          client.invalidateQueries({ queryKey: getListProductsQueryKey() });
          setShowForm(false);
          setEditingId(null);
        }}
      );
    } else {
      createMutation.mutate(
        { data: payload },
        { onSuccess: () => {
          client.invalidateQueries({ queryKey: getListProductsQueryKey() });
          setShowForm(false);
        }}
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-[#093C71]">Products & Services</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Catalog of sellable line items for quotations.</p>
        </div>
        {canEdit && !showForm && (
          <div className="flex gap-3">
            <button onClick={() => { setEditingId(null); setShowForm(true); setImageUrl(undefined); setCategoryId(""); }} className={btnPrimaryClass}>
              <Plus size={16} /> Add Product
            </button>
            <button onClick={() => setShowUpload(true)} className={btnSecondaryClass}><Upload size={16} /> Upload Excel</button>
          </div>
        )}
      </div>
      {showUpload && (
        <ProductBulkUploadModal
          onClose={() => setShowUpload(false)}
          onDone={() => client.invalidateQueries({ queryKey: getListProductsQueryKey() })}
        />
      )}

      {canEdit && showForm && (() => {
        const p = editingId ? products?.find(x => x.id === editingId) : null;
        const currentImageUrl = imageUrl === undefined ? p?.imageUrl : imageUrl;
        return (
          <div className={`${cardClass} p-6 bg-slate-50 border-t-4 border-t-[#093C71]`}>
            <h2 className="text-lg font-bold text-[#093C71] mb-5">{editingId ? 'Edit Product' : 'New Product'}</h2>
            <div className="mb-5">
              <label className={labelClass}>Product Logo / Image</label>
              <div className="flex items-center gap-4 mt-1">
                <div className="w-20 h-20 rounded-sm border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                  {currentImageUrl ? (
                    <img src={`/api/storage${currentImageUrl}`} alt={p?.productName || "Product"} className="w-full h-full object-contain" />
                  ) : (
                    <Image size={22} className="text-slate-300" />
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {/* Intentionally rendered outside the <form> below: ObjectUploader's trigger
                      button has no explicit type="button", so inside a <form> a click submits
                      the form (native default action) and the panel/modal close together. */}
                  <ImagePickerButton onSelect={(path) => setImageUrl(path)} label={currentImageUrl ? "Replace Image" : "Upload Image"} />
                  {currentImageUrl && (
                    <button type="button" onClick={() => setImageUrl(null)} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-600">
                      <X size={14} /> Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2"><label className={labelClass}>Product Name *</label><input required name="productName" defaultValue={p?.productName} className={inputClass} /></div>
              <div><label className={labelClass}>HSN/SAC Code</label><input name="hsnSac" defaultValue={p?.hsnSac || ""} className={inputClass} /></div>
              <div><label className={labelClass}>Base Price (Rate) *</label><input required type="number" min="0" step="0.01" name="unitPrice" defaultValue={p?.unitPrice} className={inputClass} /></div>
              <div><label className={labelClass}>GST % *</label><input required type="number" min="0" step="0.1" name="gstPercent" defaultValue={p?.gstPercent ?? 18} className={inputClass} /></div>
              <div><label className={labelClass}>Unit</label><input required name="unit" defaultValue={p?.unit || "Nos"} className={inputClass} /></div>
              <div>
                <label className={labelClass}>Category</label>
                <select name="categoryId" defaultValue={p?.categoryId ?? ""} onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : "")} className={inputClass}>
                  <option value="">None</option>
                  {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Sub Group</label>
                <select name="subGroupId" defaultValue={p?.subGroupId ?? ""} className={inputClass}>
                  <option value="">None</option>
                  {subGroups?.filter(sg => !categoryId && !p?.categoryId ? true : sg.categoryId === (categoryId || p?.categoryId)).map(sg => <option key={sg.id} value={sg.id}>{sg.name}</option>)}
                </select>
              </div>
              <div><label className={labelClass}>Brand</label><input name="brand" defaultValue={p?.brand || ""} className={inputClass} /></div>
              <div><label className={labelClass}>Model</label><input name="model" defaultValue={p?.model || ""} className={inputClass} /></div>
              <div><label className={labelClass}>Min Stock</label><input type="number" min="0" name="minStock" defaultValue={p?.minStock ?? 0} className={inputClass} /></div>
              <div><label className={labelClass}>Max Stock</label><input type="number" min="0" name="maxStock" defaultValue={p?.maxStock ?? 0} className={inputClass} /></div>
              <div><label className={labelClass}>Opening Stock</label><input type="number" min="0" name="openingStock" disabled={!!p} defaultValue={p?.openingStock ?? 0} className={inputClass} /></div>
              <div className="flex items-center gap-2 pt-6">
                <input type="checkbox" id="trackBatch" name="trackBatch" defaultChecked={p?.trackBatch} className="h-4 w-4" />
                <label htmlFor="trackBatch" className="text-sm font-semibold text-slate-600">Track batch/serial</label>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input type="checkbox" id="trackExpiry" name="trackExpiry" defaultChecked={p?.trackExpiry} className="h-4 w-4" />
                <label htmlFor="trackExpiry" className="text-sm font-semibold text-slate-600">Track expiry date</label>
              </div>
              {p?.productCode && (
                <div className="lg:col-span-3 text-xs font-semibold text-slate-500">Product Code: <span className="text-[#093C71]">{p.productCode}</span> · Barcode/QR are generated automatically from this code.</div>
              )}
              <div className="lg:col-span-3 flex justify-end gap-3 mt-3 pt-5 border-t border-slate-200">
                <button type="button" onClick={() => { setShowForm(false); setImageUrl(undefined); }} className={btnSecondaryClass}>Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className={btnPrimaryClass}>Save Product</button>
              </div>
            </form>
          </div>
        );
      })()}

      <div className="flex gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            placeholder="Search products..." 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1); }} 
            className={`${inputClass} pl-10`} 
          />
        </div>
      </div>

      <div className={`${cardClass} overflow-hidden`}>
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
            <tr>
              <th className="px-5 py-4 w-16"></th>
              <th className="px-5 py-4">Product Name</th>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4">Sub Group</th>
              <th className="px-5 py-4">Brand</th>
              <th className="px-5 py-4">HSN/SAC</th>
              <th className="px-5 py-4 text-right">Rate</th>
              <th className="px-5 py-4 text-right">GST</th>
              <th className="px-5 py-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <LoadingRow colSpan={9} />
            ) : pagedProducts.length ? (
              pagedProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="w-10 h-10 rounded-sm border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                      {p.imageUrl ? (
                        <img src={`/api/storage${p.imageUrl}`} alt={p.productName} className="w-full h-full object-contain" />
                      ) : (
                        <Image size={16} className="text-slate-300" />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-[#093C71] whitespace-normal break-words max-w-md">{p.productName}</div>
                    {p.description && <div className="text-[11px] font-medium text-slate-500 mt-1 whitespace-normal line-clamp-2 leading-relaxed">{p.description}</div>}
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-600">{(p.categoryId && categoryById.get(p.categoryId)) || '—'}</td>
                  <td className="px-5 py-4 font-medium text-slate-600">{(p.subGroupId && subGroupById.get(p.subGroupId)) || '—'}</td>
                  <td className="px-5 py-4 font-medium text-slate-600">{p.brand || '—'}</td>
                  <td className="px-5 py-4 font-medium text-slate-600">{p.hsnSac || '—'}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-slate-800">₹{p.unitPrice.toLocaleString('en-IN')}</span>
                      <span className="text-[11px] font-medium text-slate-400">/{p.unit}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right font-medium text-slate-600">{p.gstPercent}%</td>
                  <td className="px-5 py-4 text-right flex justify-end gap-1">
                    <button onClick={() => setLabelFor(p)} className="p-2 text-slate-400 hover:text-[#093C71] rounded-sm hover:bg-slate-100 transition-colors cursor-pointer" title="Print Label">
                      <Printer size={16} />
                    </button>
                    {canEdit && (
                      <button onClick={() => { setEditingId(p.id); setShowForm(true); setCategoryId(p.categoryId ?? ""); setImageUrl(undefined); }} className="p-2 text-slate-400 hover:text-[#093C71] rounded-sm hover:bg-slate-100 transition-colors cursor-pointer" title="Edit">
                        <Edit2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <EmptyRow colSpan={9} actionLabel={canEdit ? "Add Product" : undefined} onAction={canEdit ? () => { setEditingId(null); setShowForm(true); setImageUrl(undefined); setCategoryId(""); } : undefined} />
            )}
          </tbody>
        </table>
        <Pagination page={page} onPageChange={setPage} totalItems={filteredProducts?.length ?? 0} />
      </div>
      {labelFor && <LabelPrintDialog product={labelFor} onClose={() => setLabelFor(null)} />}
    </div>
  );
}
