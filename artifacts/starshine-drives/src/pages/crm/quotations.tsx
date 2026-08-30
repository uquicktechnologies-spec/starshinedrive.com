import { keepPreviousData } from "@tanstack/react-query";
import { useState } from "react";
import { CrmView } from "../crm";
import {
  useListQuotations,
  useListSalesExecutives,
  getListQuotationsQueryKey,
  getListSalesExecutivesQueryKey,
} from "@workspace/api-client-react";
import { LoadError, inputClass, btnAccentClass, cardClass, splitQuotationNumber, openQuotationPdf, LoadingRow, EmptyRow, Pagination, paginate } from "./shared";
import { Plus, Search, Edit2, FileDown } from "lucide-react";

export function Quotations({ onNavigate, canExport }: { onNavigate: (v: CrmView, id?: number | null) => void; canExport: boolean }) {
  const { data: quotations, isLoading, error, refetch } = useListQuotations({ query: { queryKey: getListQuotationsQueryKey(), placeholderData: keepPreviousData } });
  const { data: salesExecutives } = useListSalesExecutives(undefined, { query: { queryKey: getListSalesExecutivesQueryKey(), placeholderData: keepPreviousData } });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  if (error) return <LoadError error={error} onRetry={() => refetch()} />;

  const executiveName = (id: number | null | undefined) =>
    salesExecutives?.find(e => e.id === id)?.name || '—';

  const filtered = quotations?.filter(q => 
    q.quotationNumber.toLowerCase().includes(search.toLowerCase()) ||
    q.subject.toLowerCase().includes(search.toLowerCase()) ||
    q.billToCompany.toLowerCase().includes(search.toLowerCase())
  );
  const pagedQuotations = paginate(filtered, page);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft": return "bg-slate-100 text-slate-700";
      case "Sent": return "bg-blue-50 text-blue-700 border-blue-200 border";
      case "Viewed": return "bg-purple-50 text-purple-700 border-purple-200 border";
      case "Accepted": return "bg-green-50 text-green-700 border-green-200 border";
      case "Rejected": return "bg-red-50 text-red-700 border-red-200 border";
      case "Converted": return "bg-emerald-100 text-emerald-800 font-bold border-emerald-300 border";
      case "Expired": return "bg-gray-100 text-gray-500 border-gray-200 border";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-[#093C71]">Quotations</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage quotation pipeline.</p>
        </div>
        <button onClick={() => onNavigate('quotation-form')} className={btnAccentClass}>
          <Plus size={16} /> New Quotation
        </button>
      </div>

      <div className="flex gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            placeholder="Search quotes..." 
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
              <th className="px-5 py-4">Number</th>
              <th className="px-5 py-4">Quotation To</th>
              <th className="px-5 py-4">Mobile No.</th>
              <th className="px-5 py-4 leading-tight"><div>Quotation</div><div>Valid Date</div></th>
              <th className="px-5 py-4">Sales Executive</th>
              <th className="px-5 py-4">Reference By</th>
              <th className="px-5 py-4 text-right">Amount</th>
              <th className="px-5 py-4 text-center">Status</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <LoadingRow colSpan={9} />
            ) : pagedQuotations.length ? (
              pagedQuotations.map(q => (
                <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
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
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-800">{q.billToCompany}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{q.billToContact || ''}</div>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-600">
                    {q.billToPhone || '—'}
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-600">
                    <div>{q.quotationDate ? new Date(q.quotationDate).toLocaleDateString('en-GB') : '—'}</div>
                    <div className="mt-1.5">{q.validUntil ? new Date(q.validUntil).toLocaleDateString('en-GB') : '—'}</div>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-600">
                    {executiveName(q.salesExecutiveId)}
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-600">
                    {q.referenceNumber || '—'}
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-slate-800 leading-tight">
                    <div>{q.currency}</div>
                    <div>{q.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-block px-2 py-1 text-[10px] uppercase tracking-wider font-bold rounded-sm ${getStatusColor(q.status)}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    {canExport && (
                      <button type="button" onClick={() => openQuotationPdf(q.id)} className="inline-flex p-2 text-slate-400 hover:text-[#EF6F24] rounded-sm hover:bg-slate-100 transition-colors" title="Download PDF">
                        <FileDown size={16} />
                      </button>
                    )}
                    <button onClick={() => onNavigate('quotation-form', q.id)} className="p-2 text-slate-400 hover:text-[#093C71] rounded-sm hover:bg-slate-100 transition-colors" title="Edit">
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <EmptyRow colSpan={9} actionLabel="New Quotation" onAction={() => onNavigate('quotation-form')} />
            )}
          </tbody>
        </table>
        </div>
        <Pagination page={page} onPageChange={setPage} totalItems={filtered?.length ?? 0} />
      </div>
    </div>
  );
}
