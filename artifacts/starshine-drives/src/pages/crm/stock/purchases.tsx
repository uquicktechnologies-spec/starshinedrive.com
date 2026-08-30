import { useRef, useState } from "react";
import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  useListPurchases,
  getListPurchasesQueryKey,
  useCreatePurchase,
  useListSuppliers,
  useListWarehouses,
  useListProducts,
  getListSuppliersQueryKey,
  getListWarehousesQueryKey,
  getListProductsQueryKey,
} from "@workspace/api-client-react";
import { CrmView } from "../../crm";
import { LoadError, inputClass, labelClass, btnPrimaryClass, btnSecondaryClass, cardClass, ProductSearchInput, formatDate, LoadingRow, EmptyRow, openDocPdf, Pagination, paginate } from "../shared";
import { Plus, Trash2, FileDown, Search, Pencil } from "lucide-react";
import type { PurchaseSaleItem } from "@workspace/api-client-react";

export function Purchases({ onNavigate, canEdit, canExport }: { onNavigate: (v: CrmView, id?: number) => void; canEdit: boolean; canExport: boolean }) {
  const client = useQueryClient();
  const { data: purchases, isLoading, error, refetch } = useListPurchases({ query: { queryKey: getListPurchasesQueryKey(), placeholderData: keepPreviousData } });
  const { data: suppliers } = useListSuppliers({ activeOnly: true }, { query: { queryKey: getListSuppliersQueryKey({ activeOnly: true }), placeholderData: keepPreviousData } });
  const { data: warehouses } = useListWarehouses({ activeOnly: true }, { query: { queryKey: getListWarehousesQueryKey({ activeOnly: true }), placeholderData: keepPreviousData } });
  const { data: products } = useListProducts({ query: { queryKey: getListProductsQueryKey(), placeholderData: keepPreviousData } });
  const createMutation = useCreatePurchase();

  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState<PurchaseSaleItem[]>([{ productId: 0, productName: "", quantity: 0, price: 0, discPercent: 0, gstPercent: 18 }]);
  const qtyRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  if (error) return <LoadError error={error} onRetry={() => refetch()} />;

  const searchTerm = search.trim().toLowerCase();
  const filteredPurchases = (purchases || []).filter(p =>
    !searchTerm ||
    p.purchaseNumber.toLowerCase().includes(searchTerm) ||
    (suppliers?.find(s => s.id === p.supplierId)?.name || "").toLowerCase().includes(searchTerm)
  );
  const pagedPurchases = paginate(filteredPurchases, page);

  const updateItem = (i: number, patch: Partial<PurchaseSaleItem>) => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, ...patch } : it));
  const removeItem = (i: number) => items.length > 1 && setItems(prev => prev.filter((_, idx) => idx !== i));

  const totals = items.reduce((acc, it) => {
    const amt = it.quantity * it.price;
    const disc = amt * (it.discPercent / 100);
    const taxable = amt - disc;
    const gst = taxable * (it.gstPercent / 100);
    acc.subtotal += amt; acc.discount += disc; acc.gst += gst; acc.total += taxable + gst;
    return acc;
  }, { subtotal: 0, discount: 0, gst: 0, total: 0 });

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validItems = items.filter(i => i.productId > 0);
    if (validItems.length === 0) { alert("Add at least one product to the purchase."); return; }
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      data: {
        purchaseDate: fd.get("purchaseDate") as string,
        supplierId: Number(fd.get("supplierId")),
        warehouseId: Number(fd.get("warehouseId")),
        invoiceNumber: (fd.get("invoiceNumber") as string) || undefined,
        paymentMode: fd.get("paymentMode") as string,
        items: validItems,
        notes: (fd.get("notes") as string) || undefined,
      },
    }, {
      onSuccess: () => {
        client.invalidateQueries({ queryKey: getListPurchasesQueryKey() });
        setShowForm(false);
        setItems([{ productId: 0, productName: "", quantity: 0, price: 0, discPercent: 0, gstPercent: 18 }]);
      },
      onError: (err) => alert((err as Error).message || "Could not save purchase"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-[#093C71]">Purchases</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Recording a purchase automatically increases stock.</p>
        </div>
        {canEdit && !showForm && <button onClick={() => setShowForm(true)} className={btnPrimaryClass}><Plus size={16} /> New Purchase</button>}
      </div>

      {showForm && (
        <form onSubmit={handleSave} className={`${cardClass} p-6 space-y-6 border-t-4 border-t-[#093C71]`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div><label className={labelClass}>Purchase Date *</label><input required type="date" name="purchaseDate" defaultValue={new Date().toISOString().slice(0, 10)} className={inputClass} /></div>
            <div>
              <label className={labelClass}>Supplier *</label>
              <select required name="supplierId" className={inputClass}><option value="">Select supplier</option>{suppliers?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
            </div>
            <div>
              <label className={labelClass}>Warehouse *</label>
              <select required name="warehouseId" className={inputClass}><option value="">Select warehouse</option>{warehouses?.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
            </div>
            <div><label className={labelClass}>Invoice Number</label><input name="invoiceNumber" className={inputClass} /></div>
            <div>
              <label className={labelClass}>Payment Mode</label>
              <select name="paymentMode" defaultValue="Cash" className={inputClass}><option>Cash</option><option>Bank Transfer</option><option>Cheque</option><option>UPI</option><option>Credit</option></select>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-slate-800">Items</h3>
              <button type="button" onClick={() => setItems([...items, { productId: 0, productName: "", quantity: 0, price: 0, discPercent: 0, gstPercent: 18 }])} className="text-sm font-bold text-[#EF6F24] flex items-center gap-1"><Plus size={16} /> Add Item</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[820px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                  <tr><th className="px-3 py-2 min-w-[220px]">Product</th><th className="px-3 py-2 w-24 text-right">Qty</th><th className="px-3 py-2 w-28 text-right">Price</th><th className="px-3 py-2 w-24 text-right">Disc %</th><th className="px-3 py-2 w-24 text-right">GST %</th><th className="px-3 py-2 w-32">Batch/Serial</th><th className="px-3 py-2 w-32">Expiry</th><th className="px-3 py-2 w-10"></th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((it, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2">
                        <ProductSearchInput value={it.productName} products={products} onChangeText={t => updateItem(i, { productName: t })}
                          onSelect={p => {
                            updateItem(i, { productId: p.id, productName: p.productName, price: p.unitPrice, gstPercent: p.gstPercent });
                            setTimeout(() => qtyRefs.current[i]?.focus(), 0);
                          }} />
                      </td>
                      <td className="px-3 py-2"><input ref={el => { qtyRefs.current[i] = el; }} type="number" min="0" step="1" value={it.quantity === 0 ? "" : it.quantity} onChange={e => updateItem(i, { quantity: Number(e.target.value) })} className={`${inputClass} text-right`} /></td>
                      <td className="px-3 py-2"><input type="number" min="0" step="0.01" value={it.price === 0 ? "" : it.price} onChange={e => updateItem(i, { price: Number(e.target.value) })} className={`${inputClass} text-right`} /></td>
                      <td className="px-3 py-2"><input type="number" min="0" max="100" step="0.1" value={it.discPercent === 0 ? "" : it.discPercent} onChange={e => updateItem(i, { discPercent: Number(e.target.value) })} className={`${inputClass} text-right`} /></td>
                      <td className="px-3 py-2"><input type="number" min="0" step="0.1" value={it.gstPercent === 0 ? "" : it.gstPercent} onChange={e => updateItem(i, { gstPercent: Number(e.target.value) })} className={`${inputClass} text-right`} /></td>
                      <td className="px-3 py-2"><input value={it.batchNumber || it.serialNumber || ""} onChange={e => updateItem(i, { batchNumber: e.target.value })} className={inputClass} placeholder="optional" /></td>
                      <td className="px-3 py-2"><input type="date" value={it.expiryDate || ""} onChange={e => updateItem(i, { expiryDate: e.target.value })} className={inputClass} /></td>
                      <td className="px-3 py-2"><button type="button" onClick={() => removeItem(i)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4">
              <div className="w-80 space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹{totals.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-red-600"><span>Discount</span><span>- ₹{totals.discount.toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-600"><span>GST</span><span>₹{totals.gst.toFixed(2)}</span></div>
                <div className="flex justify-between text-lg font-bold text-[#093C71] pt-2 border-t border-slate-200"><span>Total</span><span>₹{totals.total.toFixed(2)}</span></div>
              </div>
            </div>
          </div>

          <div><label className={labelClass}>Notes</label><textarea name="notes" rows={2} className={inputClass} /></div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button type="button" onClick={() => setShowForm(false)} className={btnSecondaryClass}>Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className={btnPrimaryClass}>Save Purchase</button>
          </div>
        </form>
      )}

      <div className="relative w-72">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search purchase no, supplier..."
          className={`${inputClass} pl-9`}
        />
      </div>

      <div className={cardClass}>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
            <tr><th className="px-5 py-4">Purchase No</th><th className="px-5 py-4">Date</th><th className="px-5 py-4">Warehouse</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Total</th><th className="px-5 py-4 w-10"></th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? <LoadingRow colSpan={6} />
            : pagedPurchases.length ? pagedPurchases.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-5 py-4 font-bold text-[#093C71]">{p.purchaseNumber}</td>
                <td className="px-5 py-4 text-slate-600">{formatDate(p.purchaseDate)}</td>
                <td className="px-5 py-4 text-slate-600">{warehouses?.find(w => w.id === p.warehouseId)?.name || p.warehouseId}</td>
                <td className="px-5 py-4"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-700">{p.status}</span></td>
                <td className="px-5 py-4 text-right font-bold text-slate-800">₹{p.totalAmount.toLocaleString("en-IN")}</td>
                <td className="px-5 py-4 text-right flex items-center justify-end gap-1">
                  {canEdit && <button onClick={() => onNavigate('purchase-form', p.id)} className="p-2 text-slate-400 hover:text-[#093C71]" title="Edit"><Pencil size={16} /></button>}
                  {canExport && <button onClick={() => openDocPdf(`/api/crm/purchases/${p.id}/pdf`)} className="p-2 text-slate-400 hover:text-[#093C71]"><FileDown size={16} /></button>}
                </td>
              </tr>
            )) : purchases?.length ? <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-500">No records found</td></tr>
            : <EmptyRow colSpan={6} actionLabel={canEdit ? "New Purchase" : undefined} onAction={canEdit ? () => setShowForm(true) : undefined} />}
          </tbody>
        </table>
        <Pagination page={page} onPageChange={setPage} totalItems={filteredPurchases.length} />
      </div>
    </div>
  );
}
