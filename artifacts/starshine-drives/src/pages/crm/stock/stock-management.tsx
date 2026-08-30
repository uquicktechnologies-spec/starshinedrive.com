import { useState } from "react";
import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  useListStockLevels,
  useGetStockPending,
  useListWarehouses,
  useCreateStockAdjustment,
  useBulkSetProductMinStock,
  getListStockLevelsQueryKey,
  getGetStockPendingQueryKey,
  getListProductsQueryKey,
  useGetStockHistory, getGetStockHistoryQueryKey,
  getListWarehousesQueryKey,
} from "@workspace/api-client-react";
import type { Warehouse, StockLevel, StockHistoryEntry } from "@workspace/api-client-react";
import { LoadError, inputClass, labelClass, btnPrimaryClass, btnSecondaryClass, cardClass, ZoomableImage, LoadingRow, EmptyRow, LoadingState, EmptyState, Pagination, paginate } from "../shared";
import { ArrowRightLeft, ChevronDown, History, PackagePlus, PackageMinus, Search, SlidersHorizontal, X } from "lucide-react";

function statusColor(label: string) {
  if (label === "Out of Stock") return "bg-red-100 text-red-700";
  if (label === "Low Stock") return "bg-amber-100 text-amber-700";
  return "bg-green-100 text-green-700";
}

export function StockManagement({ canEdit, canEditMinStock, pendingOnly }: { canEdit: boolean; canEditMinStock: boolean; pendingOnly?: boolean }) {
  const client = useQueryClient();
  const { data: warehouses } = useListWarehouses({ activeOnly: true }, { query: { queryKey: getListWarehousesQueryKey({ activeOnly: true }), placeholderData: keepPreviousData } });
  const levelsQuery = useListStockLevels({ query: { queryKey: getListStockLevelsQueryKey(), placeholderData: keepPreviousData } });
  const pendingQuery = useGetStockPending({ query: { queryKey: getGetStockPendingQueryKey(), placeholderData: keepPreviousData } });
  const query = pendingOnly ? pendingQuery : levelsQuery;
  const adjustMutation = useCreateStockAdjustment();
  const bulkMinStockMutation = useBulkSetProductMinStock();

  const [adjustFor, setAdjustFor] = useState<{ productId: number; productName: string } | null>(null);
  const [historyFor, setHistoryFor] = useState<{ productId: number; productName: string } | null>(null);
  const [showBulkMinStock, setShowBulkMinStock] = useState(false);
  const [warehouseFilter, setWarehouseFilter] = useState<number | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = query;
  if (error) return <LoadError error={error} onRetry={() => refetch()} />;

  const searchTerm = search.trim().toLowerCase();
  const rows = (data || []).filter(l => !warehouseFilter || l.warehouseId === warehouseFilter)
    .filter(l => !searchTerm || l.productName.toLowerCase().includes(searchTerm) || (l.productCode || "").toLowerCase().includes(searchTerm) || l.warehouseName.toLowerCase().includes(searchTerm));
  const pagedRows = paginate(rows, page);

  const handleAdjust = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!adjustFor) return;
    const fd = new FormData(e.currentTarget);
    const type = fd.get("type") as "increase" | "decrease" | "transfer";
    adjustMutation.mutate({
      data: {
        productId: adjustFor.productId,
        type,
        quantity: Number(fd.get("quantity")),
        warehouseId: type !== "transfer" ? Number(fd.get("warehouseId")) : undefined,
        fromWarehouseId: type === "transfer" ? Number(fd.get("fromWarehouseId")) : undefined,
        toWarehouseId: type === "transfer" ? Number(fd.get("toWarehouseId")) : undefined,
        reason: (fd.get("reason") as string) || undefined,
        notes: (fd.get("notes") as string) || undefined,
      },
    }, {
      onSuccess: () => {
        client.invalidateQueries({ queryKey: getListStockLevelsQueryKey() });
        client.invalidateQueries({ queryKey: getGetStockPendingQueryKey() });
        setAdjustFor(null);
      },
      onError: (err) => alert((err as Error).message || "Could not adjust stock"),
    });
  };

  const handleBulkMinStock = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const minStock = Number(fd.get("minStock"));
    bulkMinStockMutation.mutate({ data: { minStock } }, {
      onSuccess: (result) => {
        client.invalidateQueries({ queryKey: getListStockLevelsQueryKey() });
        client.invalidateQueries({ queryKey: getGetStockPendingQueryKey() });
        client.invalidateQueries({ queryKey: getListProductsQueryKey() });
        setShowBulkMinStock(false);
        alert(`Minimum stock set to ${minStock} for ${result.updated} product(s).`);
      },
      onError: (err) => alert((err as Error).message || "Could not update minimum stock"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-[#093C71]">{pendingOnly ? "Stock Pending" : "Stock Management"}</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">{pendingOnly ? "Products that are low or out of stock." : "Live stock levels across all warehouses."}</p>
        </div>
        <div className="flex items-center gap-3 flex-nowrap w-full sm:w-auto">
          <div className="relative flex-1 min-w-0 sm:flex-none sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search product, code, warehouse..."
              className={`${inputClass} w-full pl-9`}
            />
          </div>
          <div className="relative w-auto max-w-[160px] shrink-0">
            <select
              value={warehouseFilter}
              onChange={e => { setWarehouseFilter(e.target.value ? Number(e.target.value) : ""); setPage(1); }}
              className={`${inputClass} w-full appearance-none pr-8`}
            >
              <option value="">All warehouses</option>
              {warehouses?.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          {canEditMinStock && !pendingOnly && (
            <button onClick={() => setShowBulkMinStock(true)} className={btnSecondaryClass}>
              <SlidersHorizontal size={14} /> Set Minimum Stock
            </button>
          )}
        </div>
      </div>

      <div className={`${cardClass} overflow-x-auto`}>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
            <tr>
              <th className="px-5 py-4">Product</th><th className="px-5 py-4">Warehouse</th>
              <th className="px-5 py-4 text-right">Qty</th><th className="px-5 py-4 text-right">Min</th>
              <th className="px-5 py-4">Status</th><th className="px-5 py-4 w-40"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? <LoadingRow colSpan={6} />
            : pagedRows.length ? pagedRows.map(l => (
              <tr key={`${l.productId}-${l.warehouseId}`} className="hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {l.imageUrl
                      ? <ZoomableImage src={`/api/storage${l.imageUrl}`} alt={l.productName} className="w-9 h-9 rounded-sm object-cover border border-slate-200 shrink-0" />
                      : <div className="w-9 h-9 rounded-sm bg-slate-100 border border-slate-200 shrink-0" />}
                    <div>
                      <div className="font-bold text-[#093C71]">{l.productName}</div>
                      <div className="text-[11px] text-slate-500">{l.productCode}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-600">{l.warehouseName}</td>
                <td className="px-5 py-4 text-right font-bold text-slate-800">{l.quantity} {l.unit}</td>
                <td className="px-5 py-4 text-right text-slate-500">{l.minStock}</td>
                <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${statusColor(l.statusLabel)}`}>{l.statusLabel}</span></td>
                <td className="px-5 py-4 text-right flex justify-end gap-1">
                  <button onClick={() => setHistoryFor({ productId: l.productId, productName: l.productName })} className="p-2 text-slate-400 hover:text-[#093C71] rounded-sm hover:bg-slate-100" title="History"><History size={16} /></button>
                  {canEdit && <button onClick={() => setAdjustFor({ productId: l.productId, productName: l.productName })} className="p-2 text-slate-400 hover:text-[#EF6F24] rounded-sm hover:bg-slate-100" title="Adjust"><ArrowRightLeft size={16} /></button>}
                </td>
              </tr>
            )) : <EmptyRow colSpan={6} message={pendingOnly ? "Nothing is low or out of stock." : "No records found"} />}
          </tbody>
        </table>
        <Pagination page={page} onPageChange={setPage} totalItems={rows.length} />
      </div>

      {adjustFor && (
        <div className="fixed inset-0 bg-black/40 z-30 flex items-center justify-center p-4" onClick={() => setAdjustFor(null)}>
          <div className={`${cardClass} w-full max-w-lg p-6`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg text-[#093C71]">Adjust: {adjustFor.productName}</h2>
              <button onClick={() => setAdjustFor(null)}><X size={18} className="text-slate-400" /></button>
            </div>
            <AdjustForm warehouses={warehouses} onSubmit={handleAdjust} pending={adjustMutation.isPending} />
          </div>
        </div>
      )}

      {showBulkMinStock && (
        <div className="fixed inset-0 bg-black/40 z-30 flex items-center justify-center p-4" onClick={() => setShowBulkMinStock(false)}>
          <div className={`${cardClass} w-full max-w-md p-6`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg text-[#093C71]">Set Minimum Stock</h2>
              <button onClick={() => setShowBulkMinStock(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleBulkMinStock} className="space-y-4">
              <p className="text-sm text-slate-500">Applies this minimum stock threshold to every product. Products at or below it show as Low Stock.</p>
              <div><label className={labelClass}>Minimum Stock *</label><input required type="number" min="0" name="minStock" defaultValue={5} className={inputClass} /></div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
                <button type="button" onClick={() => setShowBulkMinStock(false)} className={btnSecondaryClass}>Cancel</button>
                <button type="submit" disabled={bulkMinStockMutation.isPending} className={btnPrimaryClass}>Apply to All Products</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {historyFor && (
        <div className="fixed inset-0 bg-black/40 z-30 flex items-center justify-center p-4" onClick={() => setHistoryFor(null)}>
          <div className={`${cardClass} w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg text-[#093C71]">History: {historyFor.productName}</h2>
              <button onClick={() => setHistoryFor(null)}><X size={18} className="text-slate-400" /></button>
            </div>
            <HistoryList productId={historyFor.productId} />
          </div>
        </div>
      )}
    </div>
  );
}

function AdjustForm({ warehouses, onSubmit, pending }: { warehouses: { id: number; name: string }[] | undefined; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; pending: boolean }) {
  const [type, setType] = useState<"increase" | "decrease" | "transfer">("increase");
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {(["increase", "decrease", "transfer"] as const).map(t => (
          <button key={t} type="button" onClick={() => setType(t)} className={`flex items-center justify-center gap-1.5 rounded-sm border px-3 py-2 text-sm font-bold ${type === t ? "border-[#EF6F24] bg-[#EF6F24]/10 text-[#EF6F24]" : "border-slate-200 text-slate-500"}`}>
            {t === "increase" && <PackagePlus size={14} />}{t === "decrease" && <PackageMinus size={14} />}{t === "transfer" && <ArrowRightLeft size={14} />}
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <input type="hidden" name="type" value={type} />
      {type !== "transfer" ? (
        <div><label className={labelClass}>Warehouse *</label><select required name="warehouseId" className={inputClass}><option value="">Select</option>{warehouses?.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>From *</label><select required name="fromWarehouseId" className={inputClass}><option value="">Select</option>{warehouses?.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
          <div><label className={labelClass}>To *</label><select required name="toWarehouseId" className={inputClass}><option value="">Select</option>{warehouses?.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
        </div>
      )}
      <div><label className={labelClass}>Quantity *</label><input required type="number" min="1" name="quantity" className={inputClass} /></div>
      <div><label className={labelClass}>Reason</label><input name="reason" className={inputClass} placeholder="e.g. Damaged, Recount, Return" /></div>
      <div><label className={labelClass}>Notes</label><textarea name="notes" rows={2} className={inputClass} /></div>
      <div className="flex justify-end"><button type="submit" disabled={pending} className={btnPrimaryClass}>Save Adjustment</button></div>
    </form>
  );
}

function HistoryList({ productId }: { productId: number }) {
  const { data, isLoading, error, refetch } = useGetStockHistory(productId, { query: { queryKey: getGetStockHistoryQueryKey(productId), placeholderData: keepPreviousData } });
  if (isLoading) return <LoadingState />;
  if (error) return <LoadError error={error} onRetry={() => refetch()} />;
  if (!data?.length) return <EmptyState message="No records found" />;
  return (
    <div className="space-y-2">
      {data.map(h => (
        <div key={h.id} className="flex items-center justify-between border-b border-slate-100 py-2 text-sm">
          <div>
            <div className="font-bold text-slate-700 capitalize">
              {h.type.replace(/_/g, " ")}
              {h.refNumber ? <span className="ml-1.5 font-semibold text-[#093C71]">· {h.refNumber}</span> : null}
            </div>
            <div className="text-[11px] text-slate-500">{new Date(h.createdAt).toLocaleString("en-IN")} {h.notes ? `· ${h.notes}` : ""}</div>
          </div>
          <div className={`font-bold ${h.type.includes("decrease") || h.type === "sale" || h.type === "transfer_out" ? "text-red-600" : "text-green-600"}`}>
            {h.type.includes("decrease") || h.type === "sale" || h.type === "transfer_out" ? "-" : "+"}{h.quantity}
          </div>
        </div>
      ))}
    </div>
  );
}
