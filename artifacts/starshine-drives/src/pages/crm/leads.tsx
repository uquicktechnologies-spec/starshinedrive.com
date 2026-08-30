import { useState } from "react";
import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  useListCustomers,
  useListInquiries,
  getListInquiriesQueryKey,
  useUpdateInquiry,
  getListCustomersQueryKey,
} from "@workspace/api-client-react";
import type { Inquiry, Customer } from "@workspace/api-client-react";
import { LoadError, inputClass, LoadingRow, EmptyRow, Pagination, paginate } from "./shared";
import { cardClass } from "./shared";

export function Leads() {
  const client = useQueryClient();
  const { data: customers } = useListCustomers({ query: { queryKey: getListCustomersQueryKey(), placeholderData: keepPreviousData } });
  const { data: inquiries, isLoading, error, refetch } = useListInquiries({ query: { queryKey: getListInquiriesQueryKey(), placeholderData: keepPreviousData } });

  const updateInquiryMutation = useUpdateInquiry();
  const [page, setPage] = useState(1);

  if (error) return <LoadError error={error} onRetry={() => refetch()} />;

  const unconvertedLeads = inquiries?.filter(i => !i.customerId) || [];
  const pagedLeads = paginate(unconvertedLeads, page);

  const linkLead = (inquiryId: number, custId: number) => {
    updateInquiryMutation.mutate(
      { id: inquiryId, data: { customerId: custId, status: "Converted" } },
      { onSuccess: () => {
        client.invalidateQueries({ queryKey: getListInquiriesQueryKey() });
      }}
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-[#093C71]">Unconverted Leads</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Website inquiries not yet linked to a customer record.</p>
      </div>

      <div className={`${cardClass} overflow-hidden`}>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
            <tr>
              <th className="px-5 py-4">Contact</th>
              <th className="px-5 py-4">Email ID</th>
              <th className="px-5 py-4">Mobile No</th>
              <th className="px-5 py-4">Product</th>
              <th className="px-5 py-4">Company</th>
              <th className="px-5 py-4">Message</th>
              <th className="px-5 py-4 w-64">Link to Customer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <LoadingRow colSpan={7} />
            ) : pagedLeads.length > 0 ? (
              pagedLeads.map(lead => (
                <tr key={lead.id} className="hover:bg-slate-50 transition-colors align-top">
                  <td className="px-5 py-4">
                    <div className="font-bold text-[#093C71] text-sm">{lead.contactPerson}</div>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-600">
                    {lead.email || '—'}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-600">
                    {lead.phone || '—'}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-600">
                    {lead.productInterest?.length ? lead.productInterest.join(", ") : '—'}
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-700">
                    {lead.companyName || '—'}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-600 leading-relaxed max-w-md">
                    {lead.message}
                  </td>
                  <td className="px-5 py-4">
                    <select
                      className={`${inputClass} text-xs font-medium py-1.5`}
                      onChange={(e) => {
                        if (e.target.value) linkLead(lead.id, Number(e.target.value));
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>Link to Customer...</option>
                      {customers?.map(c => (
                        <option key={c.id} value={c.id}>{c.companyName}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <EmptyRow colSpan={7} message="No records found" />
            )}
          </tbody>
        </table>
        <Pagination page={page} onPageChange={setPage} totalItems={unconvertedLeads.length} />
      </div>
    </div>
  );
}
