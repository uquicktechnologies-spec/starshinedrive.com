import { useState } from "react";
import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useListSalesExecutives, getListSalesExecutivesQueryKey, useCreateSalesExecutive, useUpdateSalesExecutive } from "@workspace/api-client-react";
import { LoadError, inputClass, labelClass, btnPrimaryClass, btnSecondaryClass, cardClass, LoadingRow, EmptyRow, Pagination, paginate } from "./shared";
import { Plus, Edit2, CheckCircle2, XCircle } from "lucide-react";
import type { SalesExecutiveInput, SalesExecutive } from "@workspace/api-client-react";

export function SalesExecutives({ canEdit }: { canEdit: boolean }) {
  const client = useQueryClient();
  const { data: execs, isLoading, error, refetch } = useListSalesExecutives(undefined, { query: { queryKey: getListSalesExecutivesQueryKey(), placeholderData: keepPreviousData } });
  const createMutation = useCreateSalesExecutive();
  const updateMutation = useUpdateSalesExecutive();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);

  if (error) return <LoadError error={error} onRetry={() => refetch()} />;
  const pagedExecs = paginate(execs, page);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: SalesExecutiveInput = {
      name: fd.get("name") as string,
      employeeCode: (fd.get("employeeCode") as string) || undefined,
      designation: (fd.get("designation") as string) || undefined,
      email: (fd.get("email") as string) || undefined,
      phone: (fd.get("phone") as string) || undefined,
      region: (fd.get("region") as string) || undefined,
      active: fd.get("active") === "true",
    };

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: payload },
        { onSuccess: () => {
          client.invalidateQueries({ queryKey: getListSalesExecutivesQueryKey() });
          setShowForm(false);
          setEditingId(null);
        }}
      );
    } else {
      createMutation.mutate(
        { data: payload },
        { onSuccess: () => {
          client.invalidateQueries({ queryKey: getListSalesExecutivesQueryKey() });
          setShowForm(false);
        }}
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-[#093C71]">Sales Executives</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage the internal sales staff roster.</p>
        </div>
        {canEdit && !showForm && (
          <button onClick={() => { setEditingId(null); setShowForm(true); }} className={btnPrimaryClass}>
            <Plus size={16} /> Add Executive
          </button>
        )}
      </div>

      {showForm && (() => {
        const x = editingId ? execs?.find(e => e.id === editingId) : null;
        return (
          <div className={`${cardClass} p-6 bg-slate-50 border-t-4 border-t-[#093C71]`}>
            <h2 className="text-lg font-bold text-[#093C71] mb-5">{editingId ? 'Edit Executive' : 'New Executive'}</h2>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div><label className={labelClass}>Name *</label><input required name="name" defaultValue={x?.name} className={inputClass} /></div>
              <div><label className={labelClass}>Employee Code</label><input name="employeeCode" defaultValue={x?.employeeCode || ""} className={inputClass} /></div>
              <div><label className={labelClass}>Designation</label><input name="designation" defaultValue={x?.designation || ""} className={inputClass} /></div>
              <div><label className={labelClass}>Email</label><input type="email" name="email" defaultValue={x?.email || ""} className={inputClass} /></div>
              <div><label className={labelClass}>Phone</label><input name="phone" defaultValue={x?.phone || ""} className={inputClass} /></div>
              <div><label className={labelClass}>Region</label><input name="region" defaultValue={x?.region || ""} className={inputClass} /></div>
              <div>
                <label className={labelClass}>Status</label>
                <select name="active" defaultValue={x ? String(x.active) : "true"} className={inputClass}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="lg:col-span-3 flex justify-end gap-3 mt-3 pt-5 border-t border-slate-200">
                <button type="button" onClick={() => setShowForm(false)} className={btnSecondaryClass}>Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className={btnPrimaryClass}>Save Executive</button>
              </div>
            </form>
          </div>
        );
      })()}

      <div className={`${cardClass} overflow-hidden`}>
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
            <tr>
              <th className="px-5 py-4">Executive</th>
              <th className="px-5 py-4">Contact</th>
              <th className="px-5 py-4">Region</th>
              <th className="px-5 py-4 text-center">Status</th>
              <th className="px-5 py-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <LoadingRow colSpan={5} />
            ) : pagedExecs.length ? (
              pagedExecs.map(x => (
                <tr key={x.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-[#093C71] text-sm">{x.name}</div>
                    <div className="text-[11px] font-medium text-slate-500 mt-1">{x.designation || 'Sales'} {x.employeeCode ? `(${x.employeeCode})` : ''}</div>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-600">
                    <div className="text-sm">{x.email || '—'}</div>
                    <div className="text-[11px] mt-0.5">{x.phone || '—'}</div>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-600">{x.region || '—'}</td>
                  <td className="px-5 py-4 text-center">
                    {x.active ? 
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-sm"><CheckCircle2 size={12}/> Active</span> : 
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded-sm"><XCircle size={12}/> Inactive</span>
                    }
                  </td>
                  <td className="px-5 py-4 text-right">
                    {canEdit && (
                      <button onClick={() => { setEditingId(x.id); setShowForm(true); }} className="p-2 text-slate-400 hover:text-[#093C71] rounded-sm hover:bg-slate-100 transition-colors cursor-pointer" title="Edit">
                        <Edit2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <EmptyRow colSpan={5} actionLabel={canEdit ? "Add Executive" : undefined} onAction={canEdit ? () => { setEditingId(null); setShowForm(true); } : undefined} />
            )}
          </tbody>
        </table>
        <Pagination page={page} onPageChange={setPage} totalItems={execs?.length ?? 0} />
      </div>
    </div>
  );
}
