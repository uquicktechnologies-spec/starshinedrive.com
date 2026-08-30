import { useRef, useState } from "react";
import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  useListSales,
  getListSalesQueryKey,
  useUpdateSale,
  useListCustomers,
  useListWarehouses,
  useListProducts,
  useListStockLevels,
  getListCustomersQueryKey,
  getListWarehousesQueryKey,
  getListProductsQueryKey,
  getListStockLevelsQueryKey,
} from "@workspace/api-client-react";
import { CrmView } from "../../crm";
import { LoadError, inputClass, labelClass, btnPrimaryClass, cardClass, ProductSearchInput, LoadingState } from "../shared";
import { ArrowLeft, Plus, Trash2, AlertTriangle } from "lucide-react";
import type { PurchaseSaleItem } from "@workspace/api-client-react";

export function SaleForm({ id, onNavigate }: { id: number | null; onNavigate: (v: CrmView) => void }) {
  const client = useQueryClient();
  const { data: sales, isLoading, error, refetch } = useListSales({ query: { queryKey: getListSalesQueryKey(), placeholderData: keepPreviousData } });
  const { data: customers } = useListCustomers({ query: { queryKey: getListCustomersQueryKey(), placeholderData: keepPreviousData } });
  const { data: warehouses } = useListWarehouses({ activeOnly: true }, { query: { queryKey: getListWarehousesQueryKey({ activeOnly: true }), placeholderData: keepPreviousData } });
  const { data: products } = useListProducts({ query: { queryKey: getListProductsQueryKey(), placeholderData: keepPreviousData } });
  const { data: stockLevels } = useListStockLevels({ query: { queryKey: getListStockLevelsQueryKey(), placeholderData: keepPreviousData } });
  const updateMutation = useUpdateSale();

  const sale = id ? sales?.find(s => s.id === id) : null;

  const [warehouseId, setWarehouseId] = useState<number | "">("");
  const [items, setItems] = useState<PurchaseSaleItem[] | null>(null);
  const qtyRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  if (sale && items === null) {
    setItems(sale.items);
    setWarehouseId(sale.warehouseId);
  }

  if (isLoading) return <LoadingState label="Loading sale..." />;
  if (error) return <LoadError error={error} onRetry={() => refetch()} />;
  if (!sale) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600 py-8 text-center">No records found. This sale may have been deleted.</p>
        <div className="flex justify-center">
          <button type="button" onClick={() => onNavigate('sales')} className={btnPrimaryClass}>Back to Sales</button>
        </div>
      </div>
    );
  }

  const activeItems = items ?? sale.items;
  const activeWarehouseId = warehouseId === "" ? sale.warehouseId : warehouseId;

  const updateItem = (i: number, patch: Partial<PurchaseSaleItem>) => setItems(activeItems.map((it, idx) => idx === i ? { ...it, ...patch } : it));
  const removeItem = (i: number) => activeItems.length > 1 && setItems(activeItems.filter((_, idx) => idx !== i));

  // Stock already committed to this sale counts as "available" again for
  // this edit, since saving will reverse it before re-applying the new items.
  const availableFor = (productId: number) => {
    if (!activeWarehouseId) return undefined;
    const live = stockLevels?.find(l => l.productId === productId && l.warehouseId === activeWarehouseId)?.quantity ?? 0;
    const reserved = activeWarehouseId === sale.warehouseId
      ? sale.items.filter(it => it.productId === productId).reduce((a, it) => a + it.quantity, 0)
      : 0;
    return live + reserved;
  };

  const totals = activeItems.reduce((acc, it) => {
    const amt = it.quantity * it.price;
    const disc = amt * (it.discPercent / 100);
    const taxable = amt - disc;
    const gst = taxable * (it.gstPercent / 100);
    acc.subtotal += amt; acc.discount += disc; acc.gst += gst; acc.total += taxable + gst;
    return acc;
  }, { subtotal: 0, discount: 0, gst: 0, total: 0 });

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    const validItems = activeItems.filter(i => i.productId > 0);
    if (validItems.length === 0) { setFormError("Add at least one product to the sale."); return; }
    for (const it of validItems) {
      const avail = availableFor(it.productId);
      if (avail !== undefined && it.quantity > avail) {
        setFormError(`Insufficient stock for ${it.productName}: only ${avail} available.`);
        return;
      }
    }
    const fd = new FormData(e.currentTarget);
    updateMutation.mutate({
      id: sale.id,
      data: {
        saleDate: fd.get("saleDate") as string,
        customerId: fd.get("customerId") ? Number(fd.get("customerId")) : null,
        warehouseId: Number(fd.get("warehouseId")),
        items: validItems,
        status: fd.get("status") as string,
        notes: (fd.get("notes") as string) || undefined,
      },
    }, {
      onSuccess: () => {
        client.invalidateQueries({ queryKey: getListSalesQueryKey() });
        onNavigate('sales');
      },
      onError: (err) => setFormError((err as Error).message || "Could not update sale"),
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => onNavigate('sales')} className="p-2 bg-white border border-slate-200 shadow-sm rounded-sm hover:bg-slate-50 transition-colors cursor-pointer text-slate-600">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#093C71] tracking-tight">Edit Sale {sale.invoiceNumber}</h1>
          </div>
        </div>
        <select name="status" defaultValue={sale.status} className={`${inputClass} text-sm font-bold w-auto`}>
          <option>Completed</option>
          <option>Pending</option>
          <option>Cancelled</option>
        </select>
      </div>

      <div className={`${cardClass} p-6 space-y-6 border-t-4 border-t-[#093C71]`}>
        {formError && (
          <div className="flex items-center gap-2 rounded-sm bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-700">
            <AlertTriangle size={16} /> {formError}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div><label className={labelClass}>Sale Date *</label><input required type="date" name="saleDate" defaultValue={sale.saleDate.slice(0, 10)} className={inputClass} /></div>
          <div>
            <label className={labelClass}>Customer</label>
            <select name="customerId" defaultValue={sale.customerId ?? ""} className={inputClass}>
              <option value="">Walk-in / none</option>{customers?.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Warehouse *</label>
            <select required name="warehouseId" value={activeWarehouseId} onChange={e => setWarehouseId(Number(e.target.value))} className={inputClass}>
              {warehouses?.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-slate-800">Items</h3>
            <button type="button" onClick={() => setItems([...activeItems, { productId: 0, productName: "", quantity: 0, price: 0, discPercent: 0, gstPercent: 18 }])} className="text-sm font-bold text-[#EF6F24] flex items-center gap-1"><Plus size={16} /> Add Item</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[780px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <tr><th className="px-3 py-2 min-w-[220px]">Product</th><th className="px-3 py-2 w-28">In Stock</th><th className="px-3 py-2 w-24 text-right">Qty</th><th className="px-3 py-2 w-28 text-right">Price</th><th className="px-3 py-2 w-24 text-right">Disc %</th><th className="px-3 py-2 w-24 text-right">GST %</th><th className="px-3 py-2 w-10"></th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeItems.map((it, i) => {
                  const avail = it.productId ? availableFor(it.productId) : undefined;
                  return (
                    <tr key={i}>
                      <td className="px-3 py-2">
                        <ProductSearchInput value={it.productName} products={products} onChangeText={t => updateItem(i, { productName: t })}
                          onSelect={p => {
                            updateItem(i, { productId: p.id, productName: p.productName, price: p.unitPrice, gstPercent: p.gstPercent });
                            setTimeout(() => qtyRefs.current[i]?.focus(), 0);
                          }} />
                      </td>
                      <td className="px-3 py-2 text-xs font-bold">
                        {avail === undefined ? "—" : <span className={avail <= 0 ? "text-red-600" : "text-slate-600"}>{avail}</span>}
                      </td>
                      <td className="px-3 py-2"><input ref={el => { qtyRefs.current[i] = el; }} type="number" min="0" step="1" value={it.quantity === 0 ? "" : it.quantity} onChange={e => updateItem(i, { quantity: Number(e.target.value) })} className={`${inputClass} text-right`} /></td>
                      <td className="px-3 py-2"><input type="number" min="0" step="0.01" value={it.price} onChange={e => updateItem(i, { price: Number(e.target.value) })} className={`${inputClass} text-right`} /></td>
                      <td className="px-3 py-2"><input type="number" min="0" max="100" step="0.1" value={it.discPercent} onChange={e => updateItem(i, { discPercent: Number(e.target.value) })} className={`${inputClass} text-right`} /></td>
                      <td className="px-3 py-2"><input type="number" min="0" step="0.1" value={it.gstPercent} onChange={e => updateItem(i, { gstPercent: Number(e.target.value) })} className={`${inputClass} text-right`} /></td>
                      <td className="px-3 py-2"><button type="button" onClick={() => removeItem(i)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] font-medium text-slate-500 mt-2">Changing items or warehouse automatically reverses the original sale's stock impact and re-applies the new one.</p>
          <div className="flex justify-end mt-4">
            <div className="w-80 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹{totals.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-red-600"><span>Discount</span><span>- ₹{totals.discount.toFixed(2)}</span></div>
              <div className="flex justify-between text-slate-600"><span>GST</span><span>₹{totals.gst.toFixed(2)}</span></div>
              <div className="flex justify-between text-lg font-bold text-[#093C71] pt-2 border-t border-slate-200"><span>Total</span><span>₹{totals.total.toFixed(2)}</span></div>
            </div>
          </div>
        </div>

        <div><label className={labelClass}>Notes</label><textarea name="notes" rows={3} defaultValue={sale.notes || ""} className={inputClass} /></div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
          <button type="button" onClick={() => onNavigate('sales')} className="px-4 py-2.5 bg-white border border-slate-200 shadow-sm rounded-sm hover:bg-slate-50 transition-colors text-sm font-bold text-slate-600">Cancel</button>
          <button type="submit" disabled={updateMutation.isPending} className={btnPrimaryClass}>Save Changes</button>
        </div>
      </div>
    </form>
  );
}
