import { useState } from "react";
import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  useListCategories, getListCategoriesQueryKey, useCreateCategory, useUpdateCategory, useDeleteCategory,
  useListSubGroups, getListSubGroupsQueryKey, useCreateSubGroup, useUpdateSubGroup, useDeleteSubGroup,
  useListSuppliers, getListSuppliersQueryKey, useCreateSupplier, useUpdateSupplier,
  useListWarehouses, getListWarehousesQueryKey, useCreateWarehouse, useUpdateWarehouse,
} from "@workspace/api-client-react";
import type { Category, SubGroup, Supplier, Warehouse } from "@workspace/api-client-react";
import { LoadError, inputClass, labelClass, btnPrimaryClass, btnSecondaryClass, cardClass, LoadingRow, EmptyRow, guardedDownload, Pagination, paginate } from "../shared";
import { Plus, Edit2, Tags, Layers, Truck, Warehouse as WarehouseIcon, Upload, Download, X, AlertTriangle, CheckCircle2 } from "lucide-react";

type Tab = "categories" | "sub-groups" | "suppliers" | "warehouses";

const TABS: { id: Tab; label: string; icon: typeof Tags }[] = [
  { id: "categories", label: "Categories", icon: Tags },
  { id: "sub-groups", label: "Sub Groups", icon: Layers },
  { id: "suppliers", label: "Suppliers", icon: Truck },
  { id: "warehouses", label: "Warehouses", icon: WarehouseIcon },
];

export function MasterData({ canEdit }: { canEdit: boolean }) {
  const [tab, setTab] = useState<Tab>("categories");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-[#093C71]">Master Data</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Categories, sub groups, suppliers and warehouses used across stock management.</p>
      </div>
      <div className="flex gap-2 border-b border-slate-200">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors ${tab === t.id ? "border-[#EF6F24] text-[#093C71]" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>
      {tab === "categories" && <CategoriesTab canEdit={canEdit} />}
      {tab === "sub-groups" && <SubGroupsTab canEdit={canEdit} />}
      {tab === "suppliers" && <SuppliersTab canEdit={canEdit} />}
      {tab === "warehouses" && <WarehousesTab canEdit={canEdit} />}
    </div>
  );
}

type BulkUploadResult = {
  insertedCount: number;
  skippedCount: number;
  inserted: { id: number; name: string }[];
  skipped: { row: number; name: string; reason: string }[];
};

async function downloadCategorySampleTemplate(): Promise<void> {
  return guardedDownload("categories-sample-template", async () => {
    try {
      const res = await fetch("/api/crm/categories/sample-template", { credentials: "include" });
      if (!res.ok) { alert("Unable to load data. Please try again."); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "categories-sample.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      alert("Unable to load data. Please try again.");
    }
  });
}

function CategoryBulkUploadModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
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
      const res = await fetch("/api/crm/categories/bulk-upload", { method: "POST", credentials: "include", body: fd });
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
            <h2 className="text-lg font-heading font-bold text-[#093C71]">Upload Categories from Excel</h2>
            <p className="text-sm text-slate-500 mt-1">File must have a header row with a <strong>Name</strong> column (Description and Status are optional). Rows with a name that already exists are skipped automatically.</p>
            <button type="button" onClick={() => downloadCategorySampleTemplate()} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#093C71] hover:text-[#EF6F24] mt-2">
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
              <CheckCircle2 size={16} /> {result.insertedCount} categor{result.insertedCount === 1 ? "y" : "ies"} added.
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

async function downloadSubGroupSampleTemplate(): Promise<void> {
  return guardedDownload("sub-groups-sample-template", async () => {
    try {
      const res = await fetch("/api/crm/sub-groups/sample-template", { credentials: "include" });
      if (!res.ok) { alert("Unable to load data. Please try again."); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sub-groups-sample.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      alert("Unable to load data. Please try again.");
    }
  });
}

function SubGroupBulkUploadModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
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
      const res = await fetch("/api/crm/sub-groups/bulk-upload", { method: "POST", credentials: "include", body: fd });
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
            <h2 className="text-lg font-heading font-bold text-[#093C71]">Upload Sub Groups from Excel</h2>
            <p className="text-sm text-slate-500 mt-1">File must have a header row with <strong>Category</strong> and <strong>Name</strong> columns (Description and Status are optional). Rows whose sub group name already exists under that category are skipped automatically.</p>
            <button type="button" onClick={() => downloadSubGroupSampleTemplate()} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#093C71] hover:text-[#EF6F24] mt-2">
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
              <CheckCircle2 size={16} /> {result.insertedCount} sub group{result.insertedCount === 1 ? "" : "s"} added.
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

function CategoriesTab({ canEdit }: { canEdit: boolean }) {
  const client = useQueryClient();
  const { data, isLoading, error, refetch } = useListCategories(undefined, { query: { queryKey: getListCategoriesQueryKey(), placeholderData: keepPreviousData } });
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [page, setPage] = useState(1);

  if (error) return <LoadError error={error} onRetry={() => refetch()} />;
  const editing = editingId ? data?.find(c => c.id === editingId) : null;
  const pagedData = paginate(data, page);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = { name: fd.get("name") as string, description: (fd.get("description") as string) || undefined, status: fd.get("status") as string };
    const onSuccess = () => { client.invalidateQueries({ queryKey: getListCategoriesQueryKey() }); setShowForm(false); setEditingId(null); };
    if (editingId) updateMutation.mutate({ id: editingId, data: payload }, { onSuccess });
    else createMutation.mutate({ data: payload }, { onSuccess });
  };

  return (
    <div className="space-y-4">
      {canEdit && !showForm && (
        <div className="flex gap-3">
          <button onClick={() => { setEditingId(null); setShowForm(true); }} className={btnPrimaryClass}><Plus size={16} /> Add Category</button>
          <button onClick={() => setShowUpload(true)} className={btnSecondaryClass}><Upload size={16} /> Upload Excel</button>
        </div>
      )}
      {showUpload && (
        <CategoryBulkUploadModal
          onClose={() => setShowUpload(false)}
          onDone={() => client.invalidateQueries({ queryKey: getListCategoriesQueryKey() })}
        />
      )}
      {showForm && (
        <div className={`${cardClass} p-6 bg-slate-50 border-t-4 border-t-[#093C71]`}>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div><label className={labelClass}>Name *</label><input required name="name" defaultValue={editing?.name} className={inputClass} /></div>
            <div><label className={labelClass}>Description</label><input name="description" defaultValue={editing?.description || ""} className={inputClass} /></div>
            <div>
              <label className={labelClass}>Status</label>
              <select name="status" defaultValue={editing?.status || "Active"} className={inputClass}>
                <option>Active</option><option>Inactive</option>
              </select>
            </div>
            <div className="md:col-span-3 flex justify-end gap-3 pt-3 border-t border-slate-200">
              <button type="button" onClick={() => setShowForm(false)} className={btnSecondaryClass}>Cancel</button>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className={btnPrimaryClass}>Save</button>
            </div>
          </form>
        </div>
      )}
      <div className={cardClass}>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
            <tr><th className="px-5 py-4">Name</th><th className="px-5 py-4">Description</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 w-10"></th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? <LoadingRow colSpan={4} />
            : pagedData.length ? pagedData.map(c => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-5 py-4 font-bold text-[#093C71]">{c.name}</td>
                <td className="px-5 py-4 text-slate-600">{c.description || "—"}</td>
                <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${c.status === "Active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{c.status}</span></td>
                <td className="px-5 py-4 text-right">
                  {canEdit && <button onClick={() => { setEditingId(c.id); setShowForm(true); }} className="p-2 text-slate-400 hover:text-[#093C71] rounded-sm hover:bg-slate-100"><Edit2 size={16} /></button>}
                </td>
              </tr>
            )) : <EmptyRow colSpan={4} actionLabel={canEdit ? "Add Category" : undefined} onAction={canEdit ? () => { setEditingId(null); setShowForm(true); } : undefined} />}
          </tbody>
        </table>
        <Pagination page={page} onPageChange={setPage} totalItems={data?.length ?? 0} />
      </div>
    </div>
  );
}

function SubGroupsTab({ canEdit }: { canEdit: boolean }) {
  const client = useQueryClient();
  const { data: categories } = useListCategories(undefined, { query: { queryKey: getListCategoriesQueryKey(), placeholderData: keepPreviousData } });
  const { data, isLoading, error, refetch } = useListSubGroups(undefined, { query: { queryKey: getListSubGroupsQueryKey(), placeholderData: keepPreviousData } });
  const createMutation = useCreateSubGroup();
  const updateMutation = useUpdateSubGroup();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [page, setPage] = useState(1);

  if (error) return <LoadError error={error} onRetry={() => refetch()} />;
  const editing = editingId ? data?.find(c => c.id === editingId) : null;
  const categoryName = (id: number) => categories?.find(c => c.id === id)?.name || "—";
  const pagedData = paginate(data, page);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = { categoryId: Number(fd.get("categoryId")), name: fd.get("name") as string, description: (fd.get("description") as string) || undefined, status: fd.get("status") as string };
    const onSuccess = () => { client.invalidateQueries({ queryKey: getListSubGroupsQueryKey() }); setShowForm(false); setEditingId(null); };
    if (editingId) updateMutation.mutate({ id: editingId, data: payload }, { onSuccess });
    else createMutation.mutate({ data: payload }, { onSuccess });
  };

  return (
    <div className="space-y-4">
      {canEdit && !showForm && (
        <div className="flex gap-3">
          <button onClick={() => { setEditingId(null); setShowForm(true); }} className={btnPrimaryClass}><Plus size={16} /> Add Sub Group</button>
          <button onClick={() => setShowUpload(true)} className={btnSecondaryClass}><Upload size={16} /> Upload Excel</button>
        </div>
      )}
      {showUpload && (
        <SubGroupBulkUploadModal
          onClose={() => setShowUpload(false)}
          onDone={() => client.invalidateQueries({ queryKey: getListSubGroupsQueryKey() })}
        />
      )}
      {showForm && (
        <div className={`${cardClass} p-6 bg-slate-50 border-t-4 border-t-[#093C71]`}>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className={labelClass}>Category *</label>
              <select required name="categoryId" defaultValue={editing?.categoryId || ""} className={inputClass}>
                <option value="">Select category</option>
                {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Name *</label><input required name="name" defaultValue={editing?.name} className={inputClass} /></div>
            <div>
              <label className={labelClass}>Status</label>
              <select name="status" defaultValue={editing?.status || "Active"} className={inputClass}>
                <option>Active</option><option>Inactive</option>
              </select>
            </div>
            <div className="md:col-span-3"><label className={labelClass}>Description</label><input name="description" defaultValue={editing?.description || ""} className={inputClass} /></div>
            <div className="md:col-span-3 flex justify-end gap-3 pt-3 border-t border-slate-200">
              <button type="button" onClick={() => setShowForm(false)} className={btnSecondaryClass}>Cancel</button>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className={btnPrimaryClass}>Save</button>
            </div>
          </form>
        </div>
      )}
      <div className={cardClass}>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
            <tr><th className="px-5 py-4">Name</th><th className="px-5 py-4">Category</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 w-10"></th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? <LoadingRow colSpan={4} />
            : pagedData.length ? pagedData.map(sg => (
              <tr key={sg.id} className="hover:bg-slate-50">
                <td className="px-5 py-4 font-bold text-[#093C71]">{sg.name}</td>
                <td className="px-5 py-4 text-slate-600">{categoryName(sg.categoryId)}</td>
                <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${sg.status === "Active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{sg.status}</span></td>
                <td className="px-5 py-4 text-right">
                  {canEdit && <button onClick={() => { setEditingId(sg.id); setShowForm(true); }} className="p-2 text-slate-400 hover:text-[#093C71] rounded-sm hover:bg-slate-100"><Edit2 size={16} /></button>}
                </td>
              </tr>
            )) : <EmptyRow colSpan={4} actionLabel={canEdit ? "Add Sub Group" : undefined} onAction={canEdit ? () => { setEditingId(null); setShowForm(true); } : undefined} />}
          </tbody>
        </table>
        <Pagination page={page} onPageChange={setPage} totalItems={data?.length ?? 0} />
      </div>
    </div>
  );
}

function SuppliersTab({ canEdit }: { canEdit: boolean }) {
  const client = useQueryClient();
  const { data, isLoading, error, refetch } = useListSuppliers(undefined, { query: { queryKey: getListSuppliersQueryKey(), placeholderData: keepPreviousData } });
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  if (error) return <LoadError error={error} onRetry={() => refetch()} />;
  const editing = editingId ? data?.find(c => c.id === editingId) : null;
  const pagedData = paginate(data, page);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      companyName: (fd.get("companyName") as string) || undefined,
      gstin: (fd.get("gstin") as string) || undefined,
      phone: (fd.get("phone") as string) || undefined,
      email: (fd.get("email") as string) || undefined,
      address: (fd.get("address") as string) || undefined,
      outstandingBalance: Number(fd.get("outstandingBalance")) || 0,
      status: fd.get("status") as string,
    };
    const onSuccess = () => { client.invalidateQueries({ queryKey: getListSuppliersQueryKey() }); setShowForm(false); setEditingId(null); };
    if (editingId) updateMutation.mutate({ id: editingId, data: payload }, { onSuccess });
    else createMutation.mutate({ data: payload }, { onSuccess });
  };

  return (
    <div className="space-y-4">
      {canEdit && !showForm && (
        <button onClick={() => { setEditingId(null); setShowForm(true); }} className={btnPrimaryClass}><Plus size={16} /> Add Supplier</button>
      )}
      {showForm && (
        <div className={`${cardClass} p-6 bg-slate-50 border-t-4 border-t-[#093C71]`}>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div><label className={labelClass}>Supplier Name *</label><input required name="name" defaultValue={editing?.name} className={inputClass} /></div>
            <div><label className={labelClass}>Company Name</label><input name="companyName" defaultValue={editing?.companyName || ""} className={inputClass} /></div>
            <div><label className={labelClass}>GSTIN</label><input name="gstin" defaultValue={editing?.gstin || ""} className={inputClass} /></div>
            <div><label className={labelClass}>Phone</label><input name="phone" defaultValue={editing?.phone || ""} className={inputClass} /></div>
            <div><label className={labelClass}>Email</label><input type="email" name="email" defaultValue={editing?.email || ""} className={inputClass} /></div>
            <div><label className={labelClass}>Outstanding Balance</label><input type="number" step="0.01" name="outstandingBalance" defaultValue={editing?.outstandingBalance ?? 0} className={inputClass} /></div>
            <div className="md:col-span-2"><label className={labelClass}>Address</label><input name="address" defaultValue={editing?.address || ""} className={inputClass} /></div>
            <div>
              <label className={labelClass}>Status</label>
              <select name="status" defaultValue={editing?.status || "Active"} className={inputClass}><option>Active</option><option>Inactive</option></select>
            </div>
            <div className="md:col-span-3 flex justify-end gap-3 pt-3 border-t border-slate-200">
              <button type="button" onClick={() => setShowForm(false)} className={btnSecondaryClass}>Cancel</button>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className={btnPrimaryClass}>Save</button>
            </div>
          </form>
        </div>
      )}
      <div className={cardClass}>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
            <tr><th className="px-5 py-4">Name</th><th className="px-5 py-4">Phone</th><th className="px-5 py-4 text-right">Outstanding</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 w-10"></th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? <LoadingRow colSpan={5} />
            : pagedData.length ? pagedData.map(s => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-5 py-4"><div className="font-bold text-[#093C71]">{s.name}</div>{s.companyName && <div className="text-[11px] text-slate-500">{s.companyName}</div>}</td>
                <td className="px-5 py-4 text-slate-600">{s.phone || "—"}</td>
                <td className="px-5 py-4 text-right font-bold text-slate-800">₹{s.outstandingBalance.toLocaleString("en-IN")}</td>
                <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${s.status === "Active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{s.status}</span></td>
                <td className="px-5 py-4 text-right">
                  {canEdit && <button onClick={() => { setEditingId(s.id); setShowForm(true); }} className="p-2 text-slate-400 hover:text-[#093C71] rounded-sm hover:bg-slate-100"><Edit2 size={16} /></button>}
                </td>
              </tr>
            )) : <EmptyRow colSpan={5} actionLabel={canEdit ? "Add Supplier" : undefined} onAction={canEdit ? () => { setEditingId(null); setShowForm(true); } : undefined} />}
          </tbody>
        </table>
        <Pagination page={page} onPageChange={setPage} totalItems={data?.length ?? 0} />
      </div>
    </div>
  );
}

function WarehousesTab({ canEdit }: { canEdit: boolean }) {
  const client = useQueryClient();
  const { data, isLoading, error, refetch } = useListWarehouses(undefined, { query: { queryKey: getListWarehousesQueryKey(), placeholderData: keepPreviousData } });
  const createMutation = useCreateWarehouse();
  const updateMutation = useUpdateWarehouse();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  if (error) return <LoadError error={error} onRetry={() => refetch()} />;
  const editing = editingId ? data?.find(c => c.id === editingId) : null;
  const pagedData = paginate(data, page);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = { name: fd.get("name") as string, location: (fd.get("location") as string) || undefined, isDefault: fd.get("isDefault") === "on", status: fd.get("status") as string };
    const onSuccess = () => { client.invalidateQueries({ queryKey: getListWarehousesQueryKey() }); setShowForm(false); setEditingId(null); };
    if (editingId) updateMutation.mutate({ id: editingId, data: payload }, { onSuccess });
    else createMutation.mutate({ data: payload }, { onSuccess });
  };

  return (
    <div className="space-y-4">
      {canEdit && !showForm && (
        <button onClick={() => { setEditingId(null); setShowForm(true); }} className={btnPrimaryClass}><Plus size={16} /> Add Warehouse</button>
      )}
      {showForm && (
        <div className={`${cardClass} p-6 bg-slate-50 border-t-4 border-t-[#093C71]`}>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div><label className={labelClass}>Name *</label><input required name="name" defaultValue={editing?.name} className={inputClass} /></div>
            <div><label className={labelClass}>Location</label><input name="location" defaultValue={editing?.location || ""} className={inputClass} /></div>
            <div>
              <label className={labelClass}>Status</label>
              <select name="status" defaultValue={editing?.status || "Active"} className={inputClass}><option>Active</option><option>Inactive</option></select>
            </div>
            <div className="md:col-span-3 flex items-center gap-2">
              <input type="checkbox" id="isDefault" name="isDefault" defaultChecked={editing?.isDefault} className="h-4 w-4" />
              <label htmlFor="isDefault" className="text-sm font-semibold text-slate-600">Default warehouse</label>
            </div>
            <div className="md:col-span-3 flex justify-end gap-3 pt-3 border-t border-slate-200">
              <button type="button" onClick={() => setShowForm(false)} className={btnSecondaryClass}>Cancel</button>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className={btnPrimaryClass}>Save</button>
            </div>
          </form>
        </div>
      )}
      <div className={cardClass}>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
            <tr><th className="px-5 py-4">Name</th><th className="px-5 py-4">Location</th><th className="px-5 py-4">Default</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 w-10"></th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? <LoadingRow colSpan={5} />
            : pagedData.length ? pagedData.map(w => (
              <tr key={w.id} className="hover:bg-slate-50">
                <td className="px-5 py-4 font-bold text-[#093C71]">{w.name}</td>
                <td className="px-5 py-4 text-slate-600">{w.location || "—"}</td>
                <td className="px-5 py-4">{w.isDefault ? <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#093C71]/10 text-[#093C71]">Default</span> : "—"}</td>
                <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${w.status === "Active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{w.status}</span></td>
                <td className="px-5 py-4 text-right">
                  {canEdit && <button onClick={() => { setEditingId(w.id); setShowForm(true); }} className="p-2 text-slate-400 hover:text-[#093C71] rounded-sm hover:bg-slate-100"><Edit2 size={16} /></button>}
                </td>
              </tr>
            )) : <EmptyRow colSpan={5} actionLabel={canEdit ? "Add Warehouse" : undefined} onAction={canEdit ? () => { setEditingId(null); setShowForm(true); } : undefined} />}
          </tbody>
        </table>
        <Pagination page={page} onPageChange={setPage} totalItems={data?.length ?? 0} />
      </div>
    </div>
  );
}
