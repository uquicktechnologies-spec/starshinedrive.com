import { useState } from "react";
import { CrmView } from "../crm";
import { useGetCrmDashboard } from "@workspace/api-client-react";
import { LoadError, cardClass, btnAccentClass, splitQuotationNumber, LoadingState, Pagination, paginate } from "./shared";
import { Users, Building2, FileText, CheckCircle2, Plus } from "lucide-react";

export function Dashboard({ onNavigate }: { onNavigate: (v: CrmView) => void }) {
  const { data, isLoading, error, refetch } = useGetCrmDashboard();
  const [quotationsPage, setQuotationsPage] = useState(1);
  
  if (error) return <LoadError error={error} onRetry={() => refetch()} />;
  if (isLoading) return <LoadingState label="Loading dashboard..." />;

  const pagedQuotations = paginate(data?.recentQuotations, quotationsPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-[#093C71]">Quotation Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Overview of pipeline and recent activity.</p>
        </div>
        <button onClick={() => onNavigate('quotation-form')} className={btnAccentClass}>
          <Plus size={16} /> New Quotation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className={`${cardClass} p-5 flex flex-col`}>
          <div className="flex items-center gap-2 text-slate-500 mb-2"><FileText size={16}/> <span className="text-xs font-bold uppercase tracking-wider">Total Quotes</span></div>
          <div className="text-3xl font-bold text-[#093C71]">{data?.totalQuotations ?? 0}</div>
          <div className="text-xs font-semibold text-slate-500 mt-auto pt-3">{data?.quotationsThisMonth ?? 0} this month</div>
        </div>
        <div className={`${cardClass} p-5 flex flex-col`}>
          <div className="flex items-center gap-2 text-slate-500 mb-2"><Building2 size={16}/> <span className="text-xs font-bold uppercase tracking-wider">Total Value</span></div>
          <div className="text-3xl font-bold text-[#093C71]">₹{(data?.totalValue ?? 0).toLocaleString('en-IN')}</div>
        </div>
        <div className={`${cardClass} p-5 flex flex-col border-b-4 border-b-green-500`}>
          <div className="flex items-center gap-2 text-slate-500 mb-2"><CheckCircle2 size={16}/> <span className="text-xs font-bold uppercase tracking-wider">Won Value</span></div>
          <div className="text-3xl font-bold text-green-700">₹{(data?.wonValue ?? 0).toLocaleString('en-IN')}</div>
          <div className="text-xs font-semibold text-slate-500 mt-auto pt-3">Conversion: {data?.conversionRate ?? 0}%</div>
        </div>
        <div className={`${cardClass} p-5 flex flex-col`}>
          <div className="flex items-center gap-2 text-slate-500 mb-2"><Users size={16}/> <span className="text-xs font-bold uppercase tracking-wider">Pipeline</span></div>
          <div className="flex gap-6 mt-1">
            <div>
              <div className="text-2xl font-bold text-[#093C71]">{data?.customerCount ?? 0}</div>
              <div className="text-xs font-semibold text-slate-500 mt-1">Customers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#EF6F24]">{data?.leadCount ?? 0}</div>
              <div className="text-xs font-semibold text-slate-500 mt-1">Leads</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className={cardClass}>
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-bold text-[#093C71]">Recent Quotations</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {pagedQuotations.length ? pagedQuotations.map(q => (
              <div key={q.id} className="p-4 hover:bg-slate-50 flex items-center justify-between group cursor-pointer" onClick={() => onNavigate('quotations')}>
                <div>
                  {(() => {
                    const [prefix, num] = splitQuotationNumber(q.quotationNumber);
                    return num ? (
                      <div className="font-bold text-[#093C71] text-sm leading-tight">
                        <div>{prefix}</div>
                        <div>{num}</div>
                      </div>
                    ) : (
                      <div className="font-bold text-[#093C71] text-sm">{q.quotationNumber}</div>
                    );
                  })()}
                  <div className="text-xs font-medium text-slate-600 mt-1">{q.subject}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-800">₹{q.amount.toLocaleString('en-IN')}</div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 mt-1">{q.status}</div>
                </div>
              </div>
            )) : <div className="p-6 text-sm font-medium text-slate-500 text-center">No records found</div>}
          </div>
          <Pagination page={quotationsPage} onPageChange={setQuotationsPage} totalItems={data?.recentQuotations?.length ?? 0} />
        </div>

        <div className={cardClass}>
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-bold text-[#093C71]">Quotation Status</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {data?.statusCounts && Object.entries(data.statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center text-sm">
                  <div className="w-24 font-bold text-slate-600 text-xs uppercase tracking-wider">{status}</div>
                  <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#093C71] h-full rounded-full" style={{width: `${(count as number) / Math.max(1, data.totalQuotations) * 100}%`}}></div>
                  </div>
                  <div className="w-10 text-right font-bold text-slate-800">{count as number}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
