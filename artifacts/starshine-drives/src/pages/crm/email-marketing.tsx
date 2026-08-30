import { useMemo, useState } from "react";
import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  useListEmailSenderAccounts, useCreateEmailSenderAccount, useUpdateEmailSenderAccount,
  useDeleteEmailSenderAccount, useSendEmailSenderTest, getListEmailSenderAccountsQueryKey,
  useGetEmailMarketingFilterOptions, usePreviewEmailMarketingRecipients,
  useCreateEmailCampaign, useListEmailCampaigns, getListEmailCampaignsQueryKey,
} from "@workspace/api-client-react";
import type { EmailSenderAccountInput, EmailCampaign, EmailSenderAccount } from "@workspace/api-client-react";
import { LoadError, inputClass, labelClass, btnPrimaryClass, btnSecondaryClass, btnAccentClass, cardClass, formatDate, LoadingState, EmptyState, Pagination, paginate } from "./shared";
import { Mail, Plus, Trash2, Send, CheckCircle2, XCircle, Users, Megaphone, History, Rotate3d } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const style =
    status === "completed" ? "bg-green-50 border-green-200 text-green-700"
      : status === "failed" ? "bg-red-50 border-red-200 text-red-700"
      : "bg-amber-50 border-amber-200 text-amber-700";
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${style}`}>{status}</span>;
}

function SenderAccountsSection() {
  const client = useQueryClient();
  const { data: accounts, isLoading, error, refetch } = useListEmailSenderAccounts({ query: { queryKey: getListEmailSenderAccountsQueryKey(), placeholderData: keepPreviousData } });
  const createMutation = useCreateEmailSenderAccount();
  const updateMutation = useUpdateEmailSenderAccount();
  const deleteMutation = useDeleteEmailSenderAccount();
  const testMutation = useSendEmailSenderTest();
  const [showForm, setShowForm] = useState(false);
  const [testTo, setTestTo] = useState<Record<number, string>>({});
  const [testResult, setTestResult] = useState<Record<number, { success: boolean; message?: string | null }>>({});
  const [page, setPage] = useState(1);
  const pagedAccounts = paginate(accounts, page);

  const invalidate = () => client.invalidateQueries({ queryKey: getListEmailSenderAccountsQueryKey() });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: EmailSenderAccountInput = {
      label: fd.get("label") as string,
      smtpHost: fd.get("smtpHost") as string,
      smtpPort: fd.get("smtpPort") ? Number(fd.get("smtpPort")) : undefined,
      smtpSecure: fd.get("smtpSecure") === "on",
      smtpUser: fd.get("smtpUser") as string,
      smtpPassword: fd.get("smtpPassword") as string,
      fromEmail: fd.get("fromEmail") as string,
      fromName: (fd.get("fromName") as string) || undefined,
    };
    createMutation.mutate({ data: payload }, {
      onSuccess: () => { invalidate(); setShowForm(false); (e.target as HTMLFormElement).reset(); },
    });
  };

  const handleTest = (id: number) => {
    const to = testTo[id];
    if (!to) return;
    setTestResult((r) => ({ ...r, [id]: undefined as unknown as { success: boolean } }));
    testMutation.mutate({ id, data: { to } }, {
      onSuccess: (result) => setTestResult((r) => ({ ...r, [id]: result })),
    });
  };

  if (error) return <LoadError error={error} onRetry={() => refetch()} />;

  return (
    <div className={cardClass}>
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-sm shadow-sm border border-slate-200 text-[#093C71]"><Rotate3d size={20} /></div>
          <div>
            <h2 className="font-bold text-slate-800 text-lg">Sender Email Accounts</h2>
            <p className="text-xs text-slate-500 mt-0.5">Add several SMTP accounts — bulk sends rotate through the active ones automatically.</p>
          </div>
        </div>
        <button type="button" onClick={() => setShowForm((v) => !v)} className={btnSecondaryClass}>
          <Plus size={14} /> {showForm ? "Cancel" : "Add Account"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 border-b border-slate-200 bg-slate-50/50">
          <div>
            <label className={labelClass}>Label</label>
            <input name="label" required placeholder="Sales Team Gmail" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>SMTP Host</label>
            <input name="smtpHost" required placeholder="smtp.gmail.com" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>SMTP Port</label>
            <input name="smtpPort" type="number" placeholder="587" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Username</label>
            <input name="smtpUser" required placeholder="you@company.com" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <input name="smtpPassword" type="password" required placeholder="App password / SMTP password" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>From Email</label>
            <input name="fromEmail" type="email" required placeholder="sales@starshinedrive.com" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>From Name</label>
            <input name="fromName" placeholder="Starshine Drive" className={inputClass} />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input id="smtpSecure" name="smtpSecure" type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[#093C71] focus:ring-[#093C71]" />
            <label htmlFor="smtpSecure" className="text-sm font-medium text-slate-700">Use SSL/TLS (port 465)</label>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" disabled={createMutation.isPending} className={btnPrimaryClass}>
              {createMutation.isPending ? "Saving..." : "Add Account"}
            </button>
          </div>
        </form>
      )}

      <div className="divide-y divide-slate-100">
        {isLoading ? (
          <LoadingState label="Loading sender accounts..." />
        ) : !accounts?.length ? (
          <EmptyState message="No records found" actionLabel="Add Account" onAction={() => setShowForm(true)} />
        ) : pagedAccounts.map((account) => (
          <div key={account.id} className="p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  {account.label}
                  {account.active ? (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">Active</span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5">Paused</span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{account.fromName ? `${account.fromName} <${account.fromEmail}>` : account.fromEmail} · {account.smtpHost}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => updateMutation.mutate({ id: account.id, data: { active: !account.active } }, { onSuccess: invalidate })}
                  className={btnSecondaryClass}
                >
                  {account.active ? "Pause" : "Activate"}
                </button>
                <button
                  type="button"
                  onClick={() => { if (confirm(`Remove sender account "${account.label}"?`)) deleteMutation.mutate({ id: account.id }, { onSuccess: invalidate }); }}
                  className="p-2 rounded-sm border border-slate-300 text-slate-500 hover:text-red-600 hover:border-red-300"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Send a test email to..."
                value={testTo[account.id] || ""}
                onChange={(e) => setTestTo((t) => ({ ...t, [account.id]: e.target.value }))}
                className={`${inputClass} sm:max-w-xs`}
              />
              <button
                type="button"
                onClick={() => handleTest(account.id)}
                disabled={!testTo[account.id] || testMutation.isPending}
                className={btnSecondaryClass}
              >
                <Send size={13} /> Test
              </button>
              {testResult[account.id] && (
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${testResult[account.id]!.success ? "text-green-700" : "text-red-700"}`}>
                  {testResult[account.id]!.success ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  {testResult[account.id]!.message}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      <Pagination page={page} onPageChange={setPage} totalItems={accounts?.length ?? 0} />
    </div>
  );
}

function ComposeSection({ onSent }: { onSent: () => void }) {
  const { data: filterOptions } = useGetEmailMarketingFilterOptions();
  const [source, setSource] = useState<"customers" | "leads">("customers");
  const [cities, setCities] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const previewParams = useMemo(() => ({
    source,
    cities: cities.join(",") || undefined,
    states: states.join(",") || undefined,
    industries: industries.join(",") || undefined,
  }), [source, cities, states, industries]);
  const { data: preview } = usePreviewEmailMarketingRecipients(previewParams);
  const createMutation = useCreateEmailCampaign();

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResult(null);
    createMutation.mutate({
      data: {
        subject, body, recipientSource: source,
        cities: cities.join(",") || undefined,
        states: states.join(",") || undefined,
        industries: industries.join(",") || undefined,
      },
    }, {
      onSuccess: (campaign) => {
        setResult({ success: true, message: `Sending to ${campaign.totalRecipients} recipient${campaign.totalRecipients === 1 ? "" : "s"}. Track progress below.` });
        setSubject("");
        setBody("");
        onSent();
      },
      onError: (err) => {
        const message = (err as { message?: string } | null)?.message || "Could not start the campaign.";
        setResult({ success: false, message });
      },
    });
  };

  const chipClass = (active: boolean) =>
    `px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${active ? "bg-[#093C71] border-[#093C71] text-white" : "bg-white border-slate-300 text-slate-600 hover:border-[#093C71]"}`;

  return (
    <div className={cardClass}>
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
        <div className="p-2 bg-white rounded-sm shadow-sm border border-slate-200 text-[#093C71]"><Megaphone size={20} /></div>
        <h2 className="font-bold text-slate-800 text-lg">Compose &amp; Send</h2>
      </div>
      <form onSubmit={handleSend} className="p-6 space-y-5">
        <div>
          <label className={labelClass}>Send To</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setSource("customers"); setIndustries([]); }} className={chipClass(source === "customers")}>Customers</button>
            <button type="button" onClick={() => { setSource("leads"); setCities([]); setStates([]); }} className={chipClass(source === "leads")}>Website Leads</button>
          </div>
        </div>

        {source === "customers" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>City</label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-sm bg-slate-50">
                {filterOptions?.cities.length ? filterOptions.cities.map((c) => (
                  <button type="button" key={c} onClick={() => toggle(cities, setCities, c)} className={chipClass(cities.includes(c))}>{c}</button>
                )) : <span className="text-xs text-slate-400 px-1">No customer cities yet.</span>}
              </div>
            </div>
            <div>
              <label className={labelClass}>State</label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-sm bg-slate-50">
                {filterOptions?.states.length ? filterOptions.states.map((s) => (
                  <button type="button" key={s} onClick={() => toggle(states, setStates, s)} className={chipClass(states.includes(s))}>{s}</button>
                )) : <span className="text-xs text-slate-400 px-1">No customer states yet.</span>}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <label className={labelClass}>Category (Industry)</label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-sm bg-slate-50">
              {filterOptions?.industries.length ? filterOptions.industries.map((i) => (
                <button type="button" key={i} onClick={() => toggle(industries, setIndustries, i)} className={chipClass(industries.includes(i))}>{i}</button>
              )) : <span className="text-xs text-slate-400 px-1">No lead industries yet.</span>}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm font-semibold text-[#093C71] bg-[#093C71]/5 border border-[#093C71]/20 rounded-sm px-4 py-2.5">
          <Users size={16} />
          {preview ? `${preview.count} recipient${preview.count === 1 ? "" : "s"} match${preview.count === 1 ? "es" : ""} these filters` : "Loading recipient count…"}
        </div>

        <div>
          <label className={labelClass}>Subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="Special offer on Cam Index Drives" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Message (HTML supported)</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={8} placeholder="Write your message..." className={`${inputClass} font-mono text-xs`} />
        </div>

        {result && (
          <div className={`flex items-start gap-2 text-sm font-medium px-4 py-3 rounded-md border ${result.success ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
            {result.success ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <XCircle size={18} className="shrink-0 mt-0.5" />}
            <span>{result.message}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button type="submit" disabled={createMutation.isPending || !preview?.count} className={btnAccentClass}>
            <Send size={14} /> {createMutation.isPending ? "Starting…" : `Send to ${preview?.count ?? 0}`}
          </button>
        </div>
      </form>
    </div>
  );
}

function CampaignHistorySection({ refreshKey }: { refreshKey: number }) {
  const client = useQueryClient();
  const { data: campaigns, isLoading, error, refetch } = useListEmailCampaigns({
    query: {
      refetchInterval: (query: { state: { data?: EmailCampaign[] } }) =>
        query.state.data?.some((c) => c.status === "sending") ? 2000 : false,
      placeholderData: keepPreviousData,
    } as Parameters<typeof useListEmailCampaigns>[0] extends { query?: infer Q } ? Q : never,
  });
  const [page, setPage] = useState(1);
  const pagedCampaigns = paginate(campaigns, page);

  return (
    <div className={cardClass}>
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-sm shadow-sm border border-slate-200 text-[#093C71]"><History size={20} /></div>
          <h2 className="font-bold text-slate-800 text-lg">Campaign History</h2>
        </div>
        <button
          type="button"
          onClick={() => client.invalidateQueries({ queryKey: getListEmailCampaignsQueryKey() })}
          className="text-xs font-semibold text-slate-500 hover:text-[#093C71]"
        >
          Refresh
        </button>
      </div>
      <div className="divide-y divide-slate-100">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <LoadError error={error} onRetry={() => refetch()} />
        ) : !campaigns?.length ? (
          <EmptyState message="No records found" />
        ) : pagedCampaigns.map((c) => (
          <div key={c.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-bold text-slate-800 truncate">{c.subject}</div>
                <div className="text-xs text-slate-500 mt-0.5 capitalize">
                  {c.recipientSource} · {formatDate(c.createdAt as unknown as string)}
                </div>
              </div>
              <StatusBadge status={c.status} />
            </div>
            <div className="mt-2 text-xs text-slate-600 flex gap-4">
              <span>{c.totalRecipients} recipients</span>
              <span className="text-green-700 font-semibold">{c.sentCount} sent</span>
              {c.failedCount > 0 && <span className="text-red-700 font-semibold">{c.failedCount} failed</span>}
            </div>
          </div>
        ))}
      </div>
      <Pagination page={page} onPageChange={setPage} totalItems={campaigns?.length ?? 0} />
    </div>
  );
}

export function EmailMarketing() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6 max-w-4xl pb-20">
      <div>
        <h1 className="text-3xl font-heading font-bold text-[#093C71] flex items-center gap-2"><Mail size={26} /> Bulk Email Marketing</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Target customers by city/state or leads by industry, then send a campaign that rotates automatically across your configured sender accounts.
        </p>
      </div>

      <SenderAccountsSection />
      <ComposeSection onSent={() => setRefreshKey((k) => k + 1)} />
      <CampaignHistorySection refreshKey={refreshKey} />
    </div>
  );
}
