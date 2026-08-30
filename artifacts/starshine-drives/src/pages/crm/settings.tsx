import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetSellerSettings, getGetSellerSettingsQueryKey, useUpdateSellerSettings } from "@workspace/api-client-react";
import { LoadError, inputClass, labelClass, btnPrimaryClass, btnSecondaryClass, cardClass, ImagePickerButton, LoadingState } from "./shared";
import { Building, Receipt, FileText, Image, X } from "lucide-react";
import type { SellerSettingsUpdate } from "@workspace/api-client-react";

export function Settings({ canEdit }: { canEdit: boolean }) {
  const client = useQueryClient();
  const { data: settings, isLoading, error, refetch } = useGetSellerSettings();
  const updateMutation = useUpdateSellerSettings();
  const [logoUrl, setLogoUrl] = useState<string | null | undefined>(undefined);
  const currentLogoUrl = logoUrl === undefined ? settings?.logoUrl : logoUrl;

  if (error) return <LoadError error={error} onRetry={() => refetch()} />;
  if (isLoading) return <LoadingState label="Loading settings..." />;

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: SellerSettingsUpdate = {
      companyName: (fd.get("companyName") as string) || undefined,
      // Only send when the user actually touched the uploader this session
      // (new upload, or explicit Remove) -- otherwise omit so the existing
      // logo isn't accidentally wiped by an untouched form submit.
      logoUrl: logoUrl === undefined ? undefined : (logoUrl ?? ""),
      gstin: (fd.get("gstin") as string) || undefined,
      pan: (fd.get("pan") as string) || undefined,
      cin: (fd.get("cin") as string) || undefined,
      stateCode: (fd.get("stateCode") as string) || undefined,
      email: (fd.get("email") as string) || undefined,
      phone: (fd.get("phone") as string) || undefined,
      website: (fd.get("website") as string) || undefined,
      address: (fd.get("address") as string) || undefined,
      city: (fd.get("city") as string) || undefined,
      state: (fd.get("state") as string) || undefined,
      pincode: (fd.get("pincode") as string) || undefined,
      
      bankName: (fd.get("bankName") as string) || undefined,
      accountNumber: (fd.get("accountNumber") as string) || undefined,
      ifsc: (fd.get("ifsc") as string) || undefined,
      branch: (fd.get("branch") as string) || undefined,
      upiId: (fd.get("upiId") as string) || undefined,
      
      numberingPrefix: (fd.get("numberingPrefix") as string) || "QTN-",
      numberingNextSequence: Number(fd.get("numberingNextSequence")) || 1,
      numberingPadding: Number(fd.get("numberingPadding")) || 4,
      defaultValidityDays: Number(fd.get("defaultValidityDays")) || 30,
      defaultGstPercent: Number(fd.get("defaultGstPercent")) || 18,
      defaultCurrency: (fd.get("defaultCurrency") as string) || "INR",
      defaultTerms: (fd.get("defaultTerms") as string) || undefined,
      defaultNotes: (fd.get("defaultNotes") as string) || undefined,
    };

    updateMutation.mutate(
      { data: payload },
      { onSuccess: () => client.invalidateQueries({ queryKey: getGetSellerSettingsQueryKey() }) }
    );
  };

  return (
    <div className="space-y-6 max-w-4xl pb-20">
      <div>
        <h1 className="text-3xl font-heading font-bold text-[#093C71]">Settings</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Configure company identity, billing details, and quotation defaults.</p>
      </div>

      {!canEdit && (
        <div className="rounded-sm bg-amber-50 border border-amber-200 px-4 py-3 text-sm font-semibold text-amber-800">
          You have view-only access to Settings. Contact an admin to make changes.
        </div>
      )}
      <fieldset disabled={!canEdit} className="space-y-8">
      <form onSubmit={handleSave} className="space-y-8">
        <div className={cardClass}>
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
            <div className="p-2 bg-white rounded-sm shadow-sm border border-slate-200 text-[#093C71]">
              <Building size={20} />
            </div>
            <h2 className="font-bold text-slate-800 text-lg">Company Identity</h2>
          </div>
          <div className="p-6 border-b border-slate-100">
            <label className={labelClass}>Company Logo</label>
            <p className="text-xs text-slate-500 -mt-1 mb-3">Shown on the customer-facing Quotation PDF.</p>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-sm border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                {currentLogoUrl ? (
                  <img src={`/api/storage${currentLogoUrl}`} alt="Company logo" className="w-full h-full object-contain" />
                ) : (
                  <Image size={28} className="text-slate-300" />
                )}
              </div>
              <div className="flex items-center gap-3">
                <ImagePickerButton onSelect={(path) => setLogoUrl(path)} label={currentLogoUrl ? "Replace Logo" : "Upload Logo"} />
                {currentLogoUrl && (
                  <button type="button" onClick={() => setLogoUrl(null)} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-600">
                    <X size={14} /> Remove
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label className={labelClass}>Company Name</label><input name="companyName" defaultValue={settings?.companyName || ""} className={inputClass} /></div>
            <div><label className={labelClass}>Website</label><input name="website" defaultValue={settings?.website || ""} className={inputClass} /></div>
            <div><label className={labelClass}>Email</label><input type="email" name="email" defaultValue={settings?.email || ""} className={inputClass} /></div>
            <div><label className={labelClass}>Phone</label><input name="phone" defaultValue={settings?.phone || ""} className={inputClass} /></div>
            <div><label className={labelClass}>GSTIN</label><input name="gstin" defaultValue={settings?.gstin || ""} className={inputClass} /></div>
            <div><label className={labelClass}>PAN</label><input name="pan" defaultValue={settings?.pan || ""} className={inputClass} /></div>
            <div><label className={labelClass}>CIN No.</label><input name="cin" defaultValue={settings?.cin || ""} className={inputClass} /></div>
            <div className="md:col-span-2"><label className={labelClass}>Address</label><input name="address" defaultValue={settings?.address || ""} className={inputClass} /></div>
            <div><label className={labelClass}>City</label><input name="city" defaultValue={settings?.city || ""} className={inputClass} /></div>
            <div><label className={labelClass}>State</label><input name="state" defaultValue={settings?.state || ""} className={inputClass} /></div>
            <div><label className={labelClass}>State Code</label><input name="stateCode" defaultValue={settings?.stateCode || ""} className={inputClass} /></div>
            <div><label className={labelClass}>Pincode</label><input name="pincode" defaultValue={settings?.pincode || ""} className={inputClass} /></div>
          </div>
        </div>

        <div className={cardClass}>
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
            <div className="p-2 bg-white rounded-sm shadow-sm border border-slate-200 text-[#093C71]">
              <Receipt size={20} />
            </div>
            <h2 className="font-bold text-slate-800 text-lg">Banking Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label className={labelClass}>Bank Name</label><input name="bankName" defaultValue={settings?.bankName || ""} className={inputClass} /></div>
            <div><label className={labelClass}>Account Number</label><input name="accountNumber" defaultValue={settings?.accountNumber || ""} className={inputClass} /></div>
            <div><label className={labelClass}>IFSC Code</label><input name="ifsc" defaultValue={settings?.ifsc || ""} className={inputClass} /></div>
            <div><label className={labelClass}>Branch</label><input name="branch" defaultValue={settings?.branch || ""} className={inputClass} /></div>
            <div><label className={labelClass}>UPI ID</label><input name="upiId" defaultValue={settings?.upiId || ""} className={inputClass} /></div>
          </div>
        </div>

        <div className={cardClass}>
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
            <div className="p-2 bg-white rounded-sm shadow-sm border border-slate-200 text-[#093C71]">
              <FileText size={20} />
            </div>
            <h2 className="font-bold text-slate-800 text-lg">Quotation Defaults</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div><label className={labelClass}>Number Prefix</label><input required name="numberingPrefix" defaultValue={settings?.numberingPrefix || "QTN-"} className={inputClass} /></div>
            <div><label className={labelClass}>Next Sequence</label><input required type="number" min="1" name="numberingNextSequence" defaultValue={settings?.numberingNextSequence || 1} className={inputClass} /></div>
            <div><label className={labelClass}>Padding (Zeros)</label><input required type="number" min="1" max="10" name="numberingPadding" defaultValue={settings?.numberingPadding || 4} className={inputClass} /></div>
            <div><label className={labelClass}>Default Validity (Days)</label><input required type="number" name="defaultValidityDays" defaultValue={settings?.defaultValidityDays || 30} className={inputClass} /></div>
            <div><label className={labelClass}>Default GST %</label><input required type="number" step="0.01" name="defaultGstPercent" defaultValue={settings?.defaultGstPercent || 18} className={inputClass} /></div>
            <div><label className={labelClass}>Default Currency</label><input required name="defaultCurrency" defaultValue={settings?.defaultCurrency || "INR"} className={inputClass} /></div>
            <div className="md:col-span-3"><label className={labelClass}>Default Terms</label><textarea rows={3} name="defaultTerms" defaultValue={settings?.defaultTerms || ""} className={`${inputClass} resize-y font-medium`} /></div>
            <div className="md:col-span-3"><label className={labelClass}>Default Notes</label><textarea rows={2} name="defaultNotes" defaultValue={settings?.defaultNotes || ""} className={`${inputClass} resize-y font-medium`} /></div>
          </div>
        </div>

        {canEdit && (
          <div className="flex justify-end pt-4">
            <button type="submit" disabled={updateMutation.isPending} className={btnPrimaryClass}>
              {updateMutation.isPending ? "Saving..." : "Save Settings"}
            </button>
          </div>
        )}
      </form>
      </fieldset>
    </div>
  );
}
