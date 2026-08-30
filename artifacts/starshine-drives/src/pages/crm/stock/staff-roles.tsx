import { useState } from "react";
import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  useListStaffRoles,
  getListStaffRolesQueryKey,
  useCreateStaffRole,
  useUpdateStaffRole,
  useListSalesExecutives,
  getListSalesExecutivesQueryKey,
} from "@workspace/api-client-react";
import type { StaffRole, SalesExecutive } from "@workspace/api-client-react";
import { LoadError, inputClass, labelClass, btnPrimaryClass, btnSecondaryClass, cardClass, LoadingRow, EmptyRow, Pagination, paginate } from "../shared";
import { Plus, Edit2, KeyRound } from "lucide-react";

export function StaffRoles() {
  const client = useQueryClient();
  const { data, isLoading, error, refetch } = useListStaffRoles({ query: { queryKey: getListStaffRolesQueryKey(), placeholderData: keepPreviousData } });
  const { data: execs } = useListSalesExecutives(undefined, { query: { queryKey: getListSalesExecutivesQueryKey(), placeholderData: keepPreviousData } });
  const createMutation = useCreateStaffRole();
  const updateMutation = useUpdateStaffRole();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  if (error) return <LoadError error={error} onRetry={() => refetch()} />;
  const editing = editingId ? data?.find(r => r.id === editingId) : null;
  const pagedData = paginate(data, page);
  const activeExecs = execs?.filter(x => x.active) || [];

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveError(null);
    const fd = new FormData(e.currentTarget);
    const execId = fd.get("salesExecutiveId") as string;
    const execName = execId ? execs?.find(x => x.id === Number(execId))?.name : undefined;
    const password = (fd.get("password") as string) || undefined;
    const onSuccess = () => { client.invalidateQueries({ queryKey: getListStaffRolesQueryKey() }); setShowForm(false); setEditingId(null); };
    const onError = (err: unknown) => setSaveError(err instanceof Error ? err.message : "Could not save staff role.");
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: {
        role: fd.get("role") as "admin" | "manager" | "staff",
        name: execName,
        salesExecutiveId: execId ? Number(execId) : null,
        ...(password ? { password } : {}),
      } }, { onSuccess, onError });
    } else {
      createMutation.mutate({ data: {
        email: fd.get("email") as string,
        name: execName,
        role: fd.get("role") as "admin" | "manager" | "staff",
        salesExecutiveId: execId ? Number(execId) : null,
        ...(password ? { password } : {}),
      } }, { onSuccess, onError });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-[#093C71]">Staff Roles</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">The first staff member (before any roles exist) defaults to Admin so someone can set up access; everyone assigned after that defaults to Staff until you grant them Manager or Admin here.</p>
        </div>
        {!showForm && <button onClick={() => { setEditingId(null); setShowForm(true); }} className={btnPrimaryClass}><Plus size={16} /> Assign Role</button>}
      </div>

      {showForm && (
        <div className={`${cardClass} p-6 bg-slate-50 border-t-4 border-t-[#093C71]`}>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div><label className={labelClass}>Email *</label><input required type="email" name="email" disabled={!!editing} defaultValue={editing?.email} className={inputClass} /></div>
            <div>
              <label className={labelClass}>Name</label>
              <select name="salesExecutiveId" defaultValue={editing?.salesExecutiveId ? String(editing.salesExecutiveId) : ""} className={inputClass}>
                <option value="">— Select Sales Executive —</option>
                {activeExecs.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Role *</label>
              <select required name="role" defaultValue={editing?.role || "staff"} className={inputClass}>
                <option value="admin">Admin — full access</option>
                <option value="manager">Manager — purchases, sales, reports</option>
                <option value="staff">Staff — sales entry & stock viewing only</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{editing ? "Reset Password" : "Password"}{!editing && " *"}</label>
              <div className="relative">
                <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required={!editing}
                  type="password"
                  name="password"
                  minLength={8}
                  autoComplete="new-password"
                  placeholder={editing ? "Leave blank to keep current password" : "Set a login password"}
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>
            <p className="md:col-span-3 text-xs font-medium text-slate-500 -mt-2">This sets the password they log in with directly — no self sign-up needed. They can change it later from their own account.</p>
            {saveError && <p className="md:col-span-3 text-sm font-semibold text-red-600">{saveError}</p>}
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
            <tr><th className="px-5 py-4">Email</th><th className="px-5 py-4">Name</th><th className="px-5 py-4">Role</th><th className="px-5 py-4 w-10"></th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? <LoadingRow colSpan={4} />
            : pagedData.length ? pagedData.map(r => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-5 py-4 font-bold text-[#093C71]">{r.email}</td>
                <td className="px-5 py-4 text-slate-600">{r.name || "—"}</td>
                <td className="px-5 py-4"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#093C71]/10 text-[#093C71] capitalize">{r.role}</span></td>
                <td className="px-5 py-4 text-right"><button onClick={() => { setEditingId(r.id); setShowForm(true); }} className="p-2 text-slate-400 hover:text-[#093C71] rounded-sm hover:bg-slate-100"><Edit2 size={16} /></button></td>
              </tr>
            )) : <EmptyRow colSpan={4} message="No explicit roles assigned yet — everyone on the staff list has Admin access by default." actionLabel="Assign Role" onAction={() => { setEditingId(null); setShowForm(true); }} />}
          </tbody>
        </table>
        <Pagination page={page} onPageChange={setPage} totalItems={data?.length ?? 0} />
      </div>
    </div>
  );
}
