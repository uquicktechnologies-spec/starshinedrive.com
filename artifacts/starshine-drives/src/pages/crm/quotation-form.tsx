import { useState, useEffect, useMemo, useRef } from "react";
import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  useListQuotations,
  getListQuotationsQueryKey,
  useCreateQuotation,
  useUpdateQuotation,
  useListCustomers,
  useListProducts,
  useGetSellerSettings,
  useListSalesExecutives,
  useListStockLevels,
  getListCustomersQueryKey,
  getListProductsQueryKey,
  getListSalesExecutivesQueryKey,
  getListStockLevelsQueryKey,
} from "@workspace/api-client-react";
import { CrmView } from "../crm";
import { LoadError, inputClass, labelClass, btnPrimaryClass, btnSecondaryClass, cardClass, openQuotationPdf, ProductSearchInput, LoadingState } from "./shared";
import { Plus, Trash2, ArrowLeft, Search, FileDown } from "lucide-react";
import type { QuotationItem, QuotationInput, Quotation, Customer, Product, SalesExecutive } from "@workspace/api-client-react";
import { usePermissions } from "../../hooks/use-permissions";

const QUOTATION_DECISION_STATUSES = new Set(["Accepted", "Rejected", "Converted"]);

const previewInputClass = `${inputClass} bg-slate-50 text-slate-600 cursor-default focus:border-slate-300 focus:ring-0`;



export function QuotationForm({ id, onNavigate }: { id: number | null, onNavigate: (v: CrmView) => void }) {
  const client = useQueryClient();
  const { data: quotations, isLoading: quotationsLoading, error: quotationsError, refetch: refetchQuotations } = useListQuotations({ query: { queryKey: getListQuotationsQueryKey(), placeholderData: keepPreviousData } });
  const { data: customers, isLoading: customersLoading, error: customersError, refetch: refetchCustomers } = useListCustomers({ query: { queryKey: getListCustomersQueryKey(), placeholderData: keepPreviousData } });
  const { data: products, isLoading: productsLoading, error: productsError, refetch: refetchProducts } = useListProducts({ query: { queryKey: getListProductsQueryKey(), placeholderData: keepPreviousData } });
  const { data: settings, isLoading: settingsLoading, error: settingsError, refetch: refetchSettings } = useGetSellerSettings();
  const { data: salesExecutives } = useListSalesExecutives({ activeOnly: true }, { query: { queryKey: getListSalesExecutivesQueryKey({ activeOnly: true }), placeholderData: keepPreviousData } });
  const { data: stockLevels } = useListStockLevels({ query: { queryKey: getListStockLevelsQueryKey(), placeholderData: keepPreviousData } });
  
  const createMutation = useCreateQuotation();
  const updateMutation = useUpdateQuotation();
  const { can } = usePermissions();
  const canApprove = can("quotations", "approve");
  const canExport = can("quotations", "export");

  const isEditing = !!id;
  const quote = useMemo(() => isEditing ? quotations?.find(q => q.id === id) : null, [id, quotations, isEditing]);

  const [items, setItems] = useState<QuotationItem[]>([]);
  const qtyRefs = useRef<(HTMLInputElement | null)[]>([]);
  const quotationDateRef = useRef<HTMLInputElement>(null);
  const validUntilRef = useRef<HTMLInputElement>(null);
  const [taxType, setTaxType] = useState<string>("cgst_sgst");
  const [status, setStatus] = useState<string>("Accepted");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerOpen, setCustomerOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | "">("");
  const customerBlurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [referenceName, setReferenceName] = useState(quote?.referenceNumber || "");
  const [referenceOpen, setReferenceOpen] = useState(false);
  const referenceBlurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Use ref to init once
  const initialized = useRef(false);
  const customerInitialized = useRef(false);

  // Quotations aren't tied to a warehouse, so "Stock Qty" is the sum of live
  // stock for a product across all warehouses -- informational only, since
  // saving a quotation never adjusts stock.
  const stockQtyFor = (productId?: number | null) => {
    if (!productId) return undefined;
    return stockLevels?.filter(l => l.productId === productId).reduce((a, l) => a + l.quantity, 0);
  };

  useEffect(() => {
    if (isEditing && quote && !initialized.current) {
      setItems(quote.items.length > 0 ? quote.items : [{ itemName: "", qty: 0, rate: 0, discPercent: 0, gstPercent: settings?.defaultGstPercent || 18 }]);
      setTaxType(quote.taxType || "cgst_sgst");
      setStatus(quote.status || "Draft");
      initialized.current = true;
    } else if (!isEditing && !initialized.current && settings) {
      setItems([{ itemName: "", qty: 0, rate: 0, discPercent: 0, gstPercent: settings.defaultGstPercent || 18 }]);
      setTaxType("cgst_sgst");
      setStatus("Draft");
      initialized.current = true;
    }
  }, [isEditing, quote, settings]);

  useEffect(() => {
    if (customerInitialized.current || !customers) return;
    if (isEditing) {
      if (quote) {
        const c = quote.customerId ? customers.find(x => x.id === quote.customerId) : null;
        if (c) {
          setSelectedCustomerId(c.id);
          setCustomerSearch(c.companyName);
        }
        customerInitialized.current = true;
      }
    } else {
      customerInitialized.current = true;
    }
  }, [isEditing, quote, customers]);

  const calcTotals = () => {
    let subtotal = 0;
    let discountTotal = 0;
    let taxableValue = 0;
    let totalTax = 0;

    items.forEach(item => {
      const qty = item.qty || 0;
      const rate = item.rate || 0;
      const disc = item.discPercent || 0;
      const gst = item.gstPercent || 0;

      const lineAmt = qty * rate;
      const lineDisc = lineAmt * (disc / 100);
      const lineTaxable = lineAmt - lineDisc;
      const lineTax = taxType !== "none" ? lineTaxable * (gst / 100) : 0;

      subtotal += lineAmt;
      discountTotal += lineDisc;
      taxableValue += lineTaxable;
      totalTax += lineTax;
    });

    let cgstAmount = 0, sgstAmount = 0, igstAmount = 0;
    if (taxType === "cgst_sgst") {
      cgstAmount = totalTax / 2;
      sgstAmount = totalTax / 2;
    } else if (taxType === "igst") {
      igstAmount = totalTax;
    }

    return {
      subtotal, discountTotal, taxableValue, cgstAmount, sgstAmount, igstAmount,
      amount: taxableValue + cgstAmount + sgstAmount + igstAmount
    };
  };

  const computed = calcTotals();

  // Show server totals if editing, else show computed
  const t = isEditing && quote ? {
    subtotal: quote.subtotal,
    discountTotal: quote.discountTotal,
    taxableValue: quote.taxableValue,
    cgstAmount: quote.cgstAmount,
    sgstAmount: quote.sgstAmount,
    igstAmount: quote.igstAmount,
    amount: quote.amount
  } : computed;

  const handleCustomerSelect = (custId: string) => {
    if (!custId) return;
    const c = customers?.find(x => x.id.toString() === custId);
    if (!c) return;
    
    // Auto-fill bill-to fields
    const setVal = (name: string, val: string | null | undefined) => {
      const el = document.querySelector(`[name="${name}"]`) as HTMLInputElement | null;
      if (el) el.value = val || "";
    };
    
    setVal("billToCompany", c.companyName);
    setVal("billToContact", c.contactPerson);
    setVal("billToEmail", c.email);
    setVal("billToPhone", c.phone);
    setVal("billToGstin", c.gstin);
    setVal("billToStateCode", c.stateCode);
    setVal("billToAddressLine1", c.addressLine1);
    setVal("billToAddressLine2", c.addressLine2);
    setVal("billToAddressLine3", c.addressLine3);
    setVal("billToAddress", [c.addressLine1, c.addressLine2, c.addressLine3].filter(Boolean).join("\n"));
    setVal("billToCity", c.city);
    setVal("billToState", c.state);

    // GST tax type follows the customer's billing state: same state as the
    // seller (Gujarat) is an intra-state supply (CGST+SGST), any other state
    // is inter-state (IGST).
    const sellerState = (settings?.state || "Gujarat").trim().toLowerCase();
    const customerState = (c.state || "").trim().toLowerCase();
    if (customerState) {
      setTaxType(customerState === sellerState ? "cgst_sgst" : "igst");
    }
  };

  const handleProductSelect = (index: number, productId: string) => {
    if (!productId) return;
    const p = products?.find(x => x.id.toString() === productId);
    if (!p) return;

    updateItem(index, { 
      itemName: p.productName,
      description: p.description || "",
      hsnSac: p.hsnSac || "",
      productId: p.id,
      rate: p.unitPrice,
      gstPercent: p.gstPercent,
    });
  };

  const updateItem = (index: number, patch: Partial<QuotationItem>) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, ...patch } : item));
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    
    // Validate items
    const validItems = items.filter(i => i.itemName.trim() !== "");
    if (validItems.length === 0) {
      alert("At least one valid item is required.");
      return;
    }

    const billToCompany = fd.get("billToCompany") as string;
    const subject = isEditing && quote?.subject ? quote.subject : `Quotation for ${billToCompany}`;

    const payload: QuotationInput = {
      customerId: Number(fd.get("customerId")) || undefined,
      salesExecutiveId: Number(fd.get("salesExecutiveId")) || undefined,
      subject,
      quotationDate: (fd.get("quotationDate") as string) || undefined,
      validUntil: (fd.get("validUntil") as string) || undefined,
      deliveryTime: (fd.get("deliveryTime") as string) || undefined,
      referenceNumber: (fd.get("referenceNumber") as string) || undefined,
      taxType: taxType,
      billToCompany,
      billToContact: (fd.get("billToContact") as string) || undefined,
      billToEmail: (fd.get("billToEmail") as string) || undefined,
      billToPhone: (fd.get("billToPhone") as string) || undefined,
      billToGstin: (fd.get("billToGstin") as string) || undefined,
      billToStateCode: (fd.get("billToStateCode") as string) || undefined,
      billToAddress: (fd.get("billToAddress") as string) || undefined,
      billToCity: (fd.get("billToCity") as string) || undefined,
      billToState: (fd.get("billToState") as string) || undefined,
      status: status,
      currency: "INR",
      notes: (fd.get("notes") as string) || undefined,
      termsAndConditions: (fd.get("termsAndConditions") as string) || undefined,
      items: validItems
    };

    if (isEditing && id) {
      updateMutation.mutate(
        { id, data: payload },
        { onSuccess: () => {
          client.invalidateQueries({ queryKey: getListQuotationsQueryKey() });
          onNavigate('quotations');
        }}
      );
    } else {
      createMutation.mutate(
        { data: payload },
        { onSuccess: () => {
          client.invalidateQueries({ queryKey: getListQuotationsQueryKey() });
          onNavigate('quotations');
        }}
      );
    }
  };

  const loading = quotationsLoading || customersLoading || productsLoading || settingsLoading;
  const loadError = quotationsError || customersError || productsError || settingsError;

  if (loading) {
    return <LoadingState label="Loading data..." />;
  }
  if (loadError) {
    return (
      <LoadError
        error={loadError}
        onRetry={() => { refetchQuotations(); refetchCustomers(); refetchProducts(); refetchSettings(); }}
      />
    );
  }
  if (isEditing && !quote) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600 py-8 text-center">No records found. This quotation may have been deleted.</p>
        <div className="flex justify-center">
          <button type="button" onClick={() => onNavigate('quotations')} className={btnPrimaryClass}>Back to Quotations</button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => onNavigate('quotations')} className="p-2 bg-white border border-slate-200 shadow-sm rounded-sm hover:bg-slate-50 transition-colors cursor-pointer text-slate-600">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#093C71] tracking-tight">
              {isEditing ? `Edit Quotation ${quote?.quotationNumber || ''}` : 'New Quotation'}
            </h1>
          </div>
        </div>
        <div className="flex gap-3">
          {isEditing && (
            <>
              {canExport && (
                <button
                  type="button"
                  onClick={() => quote?.id && openQuotationPdf(quote.id)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 shadow-sm rounded-sm hover:bg-slate-50 transition-colors text-sm font-bold text-[#093C71]"
                >
                  <FileDown size={16} /> Download PDF
                </button>
              )}
              <select value={status} onChange={e => setStatus(e.target.value)} className={`${inputClass} text-sm font-bold w-auto`}>
                {["Draft", "Sent", "Viewed", "Accepted", "Rejected", "Expired", "Converted"]
                  .filter(s => canApprove || s === status || !QUOTATION_DECISION_STATUSES.has(s))
                  .map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
              </select>
              {!canApprove && QUOTATION_DECISION_STATUSES.has(status) && (
                <p className="text-[11px] text-slate-400 self-center">Only admin/manager can change an approved/rejected quotation.</p>
              )}
            </>
          )}
          <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className={`${btnPrimaryClass} text-sm font-bold`}>
            Save Quotation
          </button>
        </div>
      </div>

      <div className={`${cardClass} p-6 border-t-4 border-t-[#093C71]`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="lg:col-span-4 relative">
            <label className={labelClass}>Link to Saved Customer</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={customerSearch}
                onChange={e => {
                  setCustomerSearch(e.target.value);
                  setCustomerOpen(true);
                  if (selectedCustomerId) setSelectedCustomerId("");
                }}
                onFocus={() => setCustomerOpen(true)}
                onBlur={() => { customerBlurTimeout.current = setTimeout(() => setCustomerOpen(false), 150); }}
                placeholder="Search customers, or leave blank for manual entry..."
                className={`${inputClass} pl-9`}
              />
            </div>
            <input type="hidden" name="customerId" value={selectedCustomerId || ""} />
            {customerOpen && (
              <div
                className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-sm shadow-lg"
              >
                <button
                  type="button"
                  // Selecting on mousedown (with preventDefault) instead of click: a
                  // click fires after the input's blur has already closed this list,
                  // so the button would be unmounted before the click ever lands.
                  // preventDefault stops the input from blurring in the first place.
                  onMouseDown={e => {
                    e.preventDefault();
                    if (customerBlurTimeout.current) clearTimeout(customerBlurTimeout.current);
                    setSelectedCustomerId("");
                    setCustomerSearch("");
                    handleCustomerSelect("");
                    setCustomerOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 border-b border-slate-100 text-slate-500"
                >
                  -- Manual Entry (No Link) --
                </button>
                {customers
                  ?.filter(c => c.companyName.toLowerCase().includes(customerSearch.toLowerCase()))
                  .map(c => (
                    <button
                      type="button"
                      key={c.id}
                      onMouseDown={e => {
                        e.preventDefault();
                        if (customerBlurTimeout.current) clearTimeout(customerBlurTimeout.current);
                        setSelectedCustomerId(c.id);
                        setCustomerSearch(c.companyName);
                        handleCustomerSelect(c.id.toString());
                        setCustomerOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                    >
                      <div className="font-bold text-slate-800">{c.companyName}</div>
                      {c.city && <div className="text-[11px] text-slate-500">{c.city}</div>}
                    </button>
                  ))}
              </div>
            )}
            <p className="text-[11px] font-medium text-slate-500 mt-1.5">Selecting a customer auto-fills the bill-to fields below.</p>
          </div>
          
          <div><label className={labelClass}>Quotation Date</label><input ref={quotationDateRef} type="date" name="quotationDate" defaultValue={quote?.quotationDate?.split('T')[0] || new Date().toISOString().split('T')[0]} className={inputClass} /></div>
          <div>
            <label className={labelClass}>Valid Until</label>
            <input
              ref={validUntilRef}
              key={isEditing ? `valid-${quote?.id}-${quote?.validUntil}` : `valid-new-${settings?.defaultValidityDays}`}
              type="date"
              name="validUntil"
              defaultValue={
                quote?.validUntil?.split('T')[0] ||
                (!isEditing
                  ? (() => {
                      const base = new Date();
                      base.setDate(base.getDate() + (settings?.defaultValidityDays ?? 15));
                      return base.toISOString().split('T')[0];
                    })()
                  : "")
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Delivery Date</label>
            <input
              type="date"
              name="deliveryTime"
              defaultValue={quote?.deliveryTime?.split('T')[0] || ""}
              className={inputClass}
            />
          </div>
          <div className="relative">
            <label className={labelClass}>Reference Name</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                name="referenceNumber"
                value={referenceName}
                onChange={e => { setReferenceName(e.target.value); setReferenceOpen(true); }}
                onFocus={() => setReferenceOpen(true)}
                onBlur={() => { referenceBlurTimeout.current = setTimeout(() => setReferenceOpen(false), 150); }}
                placeholder="Search Reference Name..."
                className={`${inputClass} pl-9`}
              />
            </div>
            {referenceOpen && (
              <div
                className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-sm shadow-lg"
                onMouseDown={() => { if (referenceBlurTimeout.current) clearTimeout(referenceBlurTimeout.current); }}
              >
                <button
                  type="button"
                  onClick={() => { setReferenceName(""); setReferenceOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 border-b border-slate-100 text-slate-500"
                >
                  -- None --
                </button>
                {customers
                  ?.filter(c => c.companyName.toLowerCase().includes(referenceName.toLowerCase()))
                  .map(c => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => { setReferenceName(c.companyName); setReferenceOpen(false); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                    >
                      <div className="font-bold text-slate-800">{c.companyName}</div>
                      {c.city && <div className="text-[11px] text-slate-500">{c.city}</div>}
                    </button>
                  ))}
                {customers?.filter(c => c.companyName.toLowerCase().includes(referenceName.toLowerCase())).length === 0 && (
                  <div className="px-3 py-2 text-xs text-slate-400">No matching customers &mdash; keep typing to use free text.</div>
                )}
              </div>
            )}
          </div>
          <div>
            <label className={labelClass}>Tax Type</label>
            <select value={taxType} onChange={e => setTaxType(e.target.value)} className={inputClass}>
              <option value="cgst_sgst">CGST + SGST</option>
              <option value="igst">IGST</option>
              <option value="none">No Tax</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Sales Executive</label>
            <select name="salesExecutiveId" defaultValue={quote?.salesExecutiveId || ""} className={inputClass}>
              <option value="">-- Unassigned --</option>
              {salesExecutives?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="font-bold text-[#093C71] mb-5">Quotation To Details</h3>
          <p className="text-[11px] font-medium text-slate-500 -mt-4 mb-4">Preview only &mdash; pulled from the linked customer record above. Select a different customer to change these.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-1"><label className={labelClass}>Company Name *</label><input required readOnly name="billToCompany" defaultValue={quote?.billToCompany || ""} className={previewInputClass} /></div>
            <div><label className={labelClass}>Contact Person</label><input readOnly name="billToContact" defaultValue={quote?.billToContact || ""} className={previewInputClass} /></div>
            <div><label className={labelClass}>GSTIN</label><input readOnly name="billToGstin" defaultValue={quote?.billToGstin || ""} className={previewInputClass} /></div>
            <div><label className={labelClass}>Email</label><input type="email" readOnly name="billToEmail" defaultValue={quote?.billToEmail || ""} className={previewInputClass} /></div>
            <div><label className={labelClass}>Phone</label><input readOnly name="billToPhone" defaultValue={quote?.billToPhone || ""} className={previewInputClass} /></div>
            <div><label className={labelClass}>State Code</label><input readOnly name="billToStateCode" defaultValue={quote?.billToStateCode || ""} placeholder="e.g. 24" className={previewInputClass} /></div>
            <div><label className={labelClass}>Address Line 1</label><input readOnly name="billToAddressLine1" defaultValue={quote?.billToAddress?.split("\n")[0] || ""} className={previewInputClass} /></div>
            <div><label className={labelClass}>Address Line 2</label><input readOnly name="billToAddressLine2" defaultValue={quote?.billToAddress?.split("\n")[1] || ""} className={previewInputClass} /></div>
            <div><label className={labelClass}>Address Line 3</label><input readOnly name="billToAddressLine3" defaultValue={quote?.billToAddress?.split("\n")[2] || ""} className={previewInputClass} /></div>
            <input type="hidden" name="billToAddress" defaultValue={quote?.billToAddress || ""} />
            <div><label className={labelClass}>City</label><input readOnly name="billToCity" defaultValue={quote?.billToCity || ""} className={previewInputClass} /></div>
            <div><label className={labelClass}>State</label><input readOnly name="billToState" defaultValue={quote?.billToState || ""} className={previewInputClass} /></div>
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Line Items</h3>
          <button type="button" onClick={() => setItems([...items, { itemName: "", qty: 0, rate: 0, discPercent: 0, gstPercent: settings?.defaultGstPercent || 18 }])} className="text-sm font-bold text-[#EF6F24] hover:text-[#d65e1b] flex items-center gap-1 cursor-pointer">
            <Plus size={16}/> Add Item
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[980px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              <tr>
                <th className="pl-6 pr-4 py-3 min-w-[280px]">Item Description</th>
                <th className="px-4 py-3 w-28">HSN/SAC</th>
                <th className="px-4 py-3 w-20 text-right">Stock Qty</th>
                <th className="px-4 py-3 w-24 text-right">Qty</th>
                <th className="px-4 py-3 w-32 text-right">Rate (₹)</th>
                <th className="px-4 py-3 w-24 text-right">Disc (%)</th>
                <th className="px-4 py-3 w-24 text-right">GST (%)</th>
                <th className="px-4 py-3 w-32 text-right">Amount (₹)</th>
                <th className="px-4 py-3 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, index) => {
                const lineAmt = (item.qty || 0) * (item.rate || 0);
                const lineDisc = lineAmt * ((item.discPercent || 0) / 100);
                const lineTaxable = lineAmt - lineDisc;
                const lineTax = taxType !== "none" ? lineTaxable * ((item.gstPercent || 0) / 100) : 0;
                const lineTotal = lineTaxable + lineTax;
                
                return (
                  <tr key={index} className="group hover:bg-slate-50 transition-colors">
                    <td className="pl-6 pr-4 py-4">
                      <div className="space-y-2">
                        <ProductSearchInput
                          value={item.itemName}
                          products={products}
                          placeholder="Search or type item name..."
                          onChangeText={text => updateItem(index, { itemName: text, productId: null })}
                          onSelect={p => {
                            handleProductSelect(index, p.id.toString());
                            setTimeout(() => qtyRefs.current[index]?.focus(), 0);
                          }}
                        />
                        <textarea 
                          rows={2} 
                          value={item.description || ""} 
                          onChange={e => updateItem(index, { description: e.target.value })} 
                          placeholder="Detailed description..." 
                          className={`${inputClass} text-xs font-medium resize-none`}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top"><input value={item.hsnSac || ""} onChange={e => updateItem(index, { hsnSac: e.target.value })} className={`${inputClass} font-medium`}/></td>
                    <td className="px-4 py-4 align-top text-right text-xs font-bold pt-6">
                      {(() => { const qty = stockQtyFor(item.productId); return qty === undefined ? <span className="text-slate-400">—</span> : <span className={qty <= 0 ? "text-red-600" : "text-slate-600"}>{qty}</span>; })()}
                    </td>
                    <td className="px-4 py-4 align-top"><input ref={el => { qtyRefs.current[index] = el; }} type="number" min="0" step="0.01" value={item.qty === 0 ? "" : item.qty} onChange={e => updateItem(index, { qty: Number(e.target.value) })} className={`${inputClass} text-right font-medium`} required/></td>
                    <td className="px-4 py-4 align-top"><input type="number" min="0" step="0.01" value={item.rate === 0 ? "" : item.rate} onChange={e => updateItem(index, { rate: Number(e.target.value) })} className={`${inputClass} text-right font-medium`} required/></td>
                    <td className="px-4 py-4 align-top"><input type="number" min="0" max="100" step="0.1" value={item.discPercent === 0 ? "" : item.discPercent} onChange={e => updateItem(index, { discPercent: Number(e.target.value) })} className={`${inputClass} text-right font-medium`}/></td>
                    <td className="px-4 py-4 align-top"><input type="number" min="0" max="100" step="0.1" value={item.gstPercent === 0 ? "" : item.gstPercent} onChange={e => updateItem(index, { gstPercent: Number(e.target.value) })} className={`${inputClass} text-right font-medium`}/></td>
                    <td className="px-4 py-4 align-top text-right font-bold text-[#093C71] pt-6">{lineTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits:2})}</td>
                    <td className="pl-4 pr-6 py-4 align-top text-center pt-5">
                      <button type="button" onClick={() => removeItem(index)} className="p-2 text-slate-400 hover:text-red-500 rounded-sm hover:bg-red-50 transition-colors cursor-pointer" disabled={items.length <= 1}>
                        <Trash2 size={18}/>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="bg-slate-50 border-t border-slate-200 p-6 flex flex-col items-end">
          <div className="w-full md:w-96 space-y-2.5 text-sm">
            <div className="flex justify-between font-medium text-slate-600"><span>Subtotal:</span> <span>₹{t.subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span></div>
            {t.discountTotal > 0 && <div className="flex justify-between font-bold text-red-600"><span>Discount:</span> <span>- ₹{t.discountTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span></div>}
            <div className="flex justify-between text-slate-800 font-bold pt-2 border-t border-slate-200"><span>Taxable Value:</span> <span>₹{t.taxableValue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span></div>
            {taxType === "cgst_sgst" && (
              <>
                <div className="flex justify-between font-medium text-slate-500 text-xs"><span>CGST:</span> <span>₹{t.cgstAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span></div>
                <div className="flex justify-between font-medium text-slate-500 text-xs"><span>SGST:</span> <span>₹{t.sgstAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span></div>
              </>
            )}
            {taxType === "igst" && (
              <div className="flex justify-between font-medium text-slate-500 text-xs"><span>IGST:</span> <span>₹{t.igstAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span></div>
            )}
            <div className="flex justify-between text-2xl font-bold text-[#093C71] pt-3 border-t-2 border-slate-300 mt-2">
              <span>Grand Total:</span> <span>₹{t.amount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-800">Additional Information</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Terms & Conditions</label>
            <textarea 
              name="termsAndConditions" 
              rows={4} 
              defaultValue={quote?.termsAndConditions || settings?.defaultTerms || ""} 
              className={`${inputClass} resize-y text-xs font-medium`}
            />
          </div>
          <div>
            <label className={labelClass}>Internal Notes</label>
            <textarea 
              name="notes" 
              rows={4} 
              defaultValue={quote?.notes || settings?.defaultNotes || ""} 
              className={`${inputClass} resize-y text-xs font-medium`}
              placeholder="Private notes (not visible on customer PDF)"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => onNavigate("quotations")} className={`${btnSecondaryClass} text-sm font-bold`}>
          Cancel
        </button>
        <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className={`${btnPrimaryClass} text-sm font-bold`}>
          Save Quotation
        </button>
      </div>

    </form>
  );
}
