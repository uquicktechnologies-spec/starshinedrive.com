import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetSellerSettings,
  getGetSellerSettingsQueryKey,
  useUpdateSellerSettings,
  useSendTestEmail,
} from "@workspace/api-client-react";
import { LoadError, inputClass, labelClass, btnPrimaryClass, btnSecondaryClass, cardClass, LoadingState } from "./shared";
import { Mail, CheckCircle2, XCircle, Send } from "lucide-react";
import type { SellerSettingsUpdate } from "@workspace/api-client-react";

export function EmailIntegration() {
  const client = useQueryClient();
  const { data: settings, isLoading, error, refetch } = useGetSellerSettings();
  const updateMutation = useUpdateSellerSettings();
  const testMutation = useSendTestEmail();
  const [testTo, setTestTo] = useState("");
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string | null } | null>(null);

  if (error) return <LoadError error={error} onRetry={() => refetch()} />;
  if (isLoading) return <LoadingState label="Loading email settings..." />;

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: SellerSettingsUpdate = {
      smtpHost: (fd.get("smtpHost") as string) || undefined,
      smtpPort: fd.get("smtpPort") ? Number(fd.get("smtpPort")) : undefined,
      smtpSecure: fd.get("smtpSecure") === "on",
      smtpUser: (fd.get("smtpUser") as string) || undefined,
      // Empty means "leave unchanged" -- the stored password is never sent back to the browser.
      smtpPassword: (fd.get("smtpPassword") as string) || undefined,
      smtpFromEmail: (fd.get("smtpFromEmail") as string) || undefined,
      smtpFromName: (fd.get("smtpFromName") as string) || undefined,
    };

    updateMutation.mutate(
      { data: payload },
      {
        onSuccess: () => {
          client.invalidateQueries({ queryKey: getGetSellerSettingsQueryKey() });
          (e.target as HTMLFormElement).reset();
        },
      }
    );
  };

  const handleTestEmail = () => {
    if (!testTo) return;
    setTestResult(null);
    testMutation.mutate(
      { data: { to: testTo } },
      { onSuccess: (result) => setTestResult(result) }
    );
  };

  return (
    <div className="space-y-6 max-w-3xl pb-20">
      <div>
        <h1 className="text-3xl font-heading font-bold text-[#093C71]">Email Integration</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Connect your outgoing SMTP mail server so the CRM can send quotations, purchase emails, and notifications.
        </p>
      </div>

      <div className={cardClass}>
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-sm shadow-sm border border-slate-200 text-[#093C71]">
              <Mail size={20} />
            </div>
            <h2 className="font-bold text-slate-800 text-lg">SMTP Server</h2>
          </div>
          {settings?.smtpConfigured ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
              <CheckCircle2 size={14} /> Configured
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              <XCircle size={14} /> Not Configured
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>SMTP Host</label>
            <input name="smtpHost" placeholder="smtp.gmail.com" defaultValue={settings?.smtpHost || ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>SMTP Port</label>
            <input name="smtpPort" type="number" placeholder="587" defaultValue={settings?.smtpPort || ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Username</label>
            <input name="smtpUser" placeholder="you@company.com" defaultValue={settings?.smtpUser || ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <input
              name="smtpPassword"
              type="password"
              placeholder={settings?.smtpConfigured ? "•••••••• (leave blank to keep current)" : "App password / SMTP password"}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>From Email</label>
            <input name="smtpFromEmail" placeholder="sales@starshinedrive.com" defaultValue={settings?.smtpFromEmail || ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>From Name</label>
            <input name="smtpFromName" placeholder="Starshine Drive" defaultValue={settings?.smtpFromName || ""} className={inputClass} />
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <input id="smtpSecure" name="smtpSecure" type="checkbox" defaultChecked={settings?.smtpSecure} className="h-4 w-4 rounded border-slate-300 text-[#093C71] focus:ring-[#093C71]" />
            <label htmlFor="smtpSecure" className="text-sm font-medium text-slate-700">Use SSL/TLS (port 465)</label>
          </div>

          <div className="md:col-span-2 flex justify-end pt-2">
            <button type="submit" disabled={updateMutation.isPending} className={btnPrimaryClass}>
              {updateMutation.isPending ? "Saving..." : "Save Email Settings"}
            </button>
          </div>
        </form>
      </div>

      <div className={cardClass}>
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
          <div className="p-2 bg-white rounded-sm shadow-sm border border-slate-200 text-[#093C71]">
            <Send size={20} />
          </div>
          <h2 className="font-bold text-slate-800 text-lg">Send Test Email</h2>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-500">Save your SMTP settings above, then send a test email to confirm everything works.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="recipient@example.com"
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
              className={`${inputClass} sm:flex-1`}
            />
            <button
              type="button"
              onClick={handleTestEmail}
              disabled={!testTo || testMutation.isPending}
              className={btnSecondaryClass}
            >
              {testMutation.isPending ? "Sending..." : "Send Test Email"}
            </button>
          </div>
          {testResult && (
            <div
              className={`flex items-start gap-2 text-sm font-medium px-4 py-3 rounded-md border ${
                testResult.success
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {testResult.success ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <XCircle size={18} className="shrink-0 mt-0.5" />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
