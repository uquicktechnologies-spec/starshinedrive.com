import { useState } from "react";
import { useGetStockDashboard } from "@workspace/api-client-react";
import { LoadError, cardClass, formatDate, ZoomableImage, LoadingState, Pagination, paginate } from "../shared";
import { Package, Layers, ShoppingCart, TrendingUp, AlertTriangle, XCircle, Wallet } from "lucide-react";

function StatCard({ icon: Icon, label, value, tone }: { icon: typeof Package; label: string; value: string; tone?: string }) {
  return (
    <div className={`${cardClass} p-5 flex items-center gap-4`}>
      <div className={`w-11 h-11 rounded-sm flex items-center justify-center ${tone || "bg-[#093C71]/10 text-[#093C71]"}`}>
        <Icon size={20} />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500">{label}</div>
      </div>
    </div>
  );
}

export function StockDashboard() {
  const { data, isLoading, error, refetch } = useGetStockDashboard();
  const [purchasesPage, setPurchasesPage] = useState(1);
  const [salesPage, setSalesPage] = useState(1);
  const [lowStockPage, setLowStockPage] = useState(1);
  if (error) return <LoadError error={error} onRetry={() => refetch()} />;
  if (isLoading || !data) return <LoadingState label="Loading dashboard..." />;

  const pagedPurchases = paginate(data.recentPurchases, purchasesPage);
  const pagedSales = paginate(data.recentSales, salesPage);
  const pagedLowStock = paginate(data.lowStockProducts, lowStockPage);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-[#093C71]">Stock Dashboard</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Snapshot of inventory health across the business.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Products" value={String(data.totalProducts)} />
        <StatCard icon={Layers} label="Categories" value={String(data.totalCategories)} />
        <StatCard icon={ShoppingCart} label="Current Stock Qty" value={data.currentStockQty.toLocaleString("en-IN")} />
        <StatCard icon={Wallet} label="Stock Value" value={`₹${data.stockValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} />
        <StatCard icon={AlertTriangle} label="Low Stock" value={String(data.lowStockCount)} tone="bg-amber-100 text-amber-700" />
        <StatCard icon={XCircle} label="Out of Stock" value={String(data.outOfStockCount)} tone="bg-red-100 text-red-700" />
        <StatCard icon={TrendingUp} label="Today's Purchases" value={`₹${data.todayPurchaseValue.toLocaleString("en-IN")}`} />
        <StatCard icon={TrendingUp} label="Today's Sales" value={`₹${data.todaySalesValue.toLocaleString("en-IN")}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cardClass}>
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 font-bold text-slate-700 text-sm">Recent Purchases</div>
          <div className="divide-y divide-slate-100">
            {pagedPurchases.length ? pagedPurchases.map(p => (
              <div key={p.id} className="px-5 py-3 flex justify-between text-sm">
                <div><div className="font-bold text-[#093C71]">{p.purchaseNumber}</div><div className="text-[11px] text-slate-500">{formatDate(p.purchaseDate)}</div></div>
                <div className="font-bold text-slate-800">₹{p.totalAmount.toLocaleString("en-IN")}</div>
              </div>
            )) : <div className="px-5 py-6 text-center text-sm text-slate-500">No records found</div>}
          </div>
          <Pagination page={purchasesPage} onPageChange={setPurchasesPage} totalItems={data.recentPurchases.length} />
        </div>
        <div className={cardClass}>
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 font-bold text-slate-700 text-sm">Recent Sales</div>
          <div className="divide-y divide-slate-100">
            {pagedSales.length ? pagedSales.map(s => (
              <div key={s.id} className="px-5 py-3 flex justify-between text-sm">
                <div><div className="font-bold text-[#093C71]">{s.invoiceNumber}</div><div className="text-[11px] text-slate-500">{formatDate(s.saleDate)}</div></div>
                <div className="font-bold text-slate-800">₹{s.totalAmount.toLocaleString("en-IN")}</div>
              </div>
            )) : <div className="px-5 py-6 text-center text-sm text-slate-500">No records found</div>}
          </div>
          <Pagination page={salesPage} onPageChange={setSalesPage} totalItems={data.recentSales.length} />
        </div>
      </div>

      <div className={cardClass}>
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 font-bold text-slate-700 text-sm">Low / Out of Stock</div>
        <div className="divide-y divide-slate-100">
          {pagedLowStock.length ? pagedLowStock.map(l => (
            <div key={`${l.productId}-${l.warehouseId}`} className="px-5 py-3 flex items-center justify-between text-sm gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {l.imageUrl
                  ? <ZoomableImage src={`/api/storage${l.imageUrl}`} alt={l.productName} className="w-8 h-8 rounded-sm object-cover border border-slate-200 shrink-0" />
                  : <div className="w-8 h-8 rounded-sm bg-slate-100 border border-slate-200 shrink-0" />}
                <div className="font-bold text-slate-700 truncate">{l.productName} <span className="text-slate-400 font-medium">@ {l.warehouseName}</span></div>
              </div>
              <div className={`font-bold shrink-0 ${l.statusLabel === "Out of Stock" ? "text-red-600" : "text-amber-600"}`}>{l.quantity} left</div>
            </div>
          )) : <div className="px-5 py-6 text-center text-sm text-slate-500">Everything is well stocked.</div>}
        </div>
        <Pagination page={lowStockPage} onPageChange={setLowStockPage} totalItems={data.lowStockProducts.length} />
      </div>
    </div>
  );
}
