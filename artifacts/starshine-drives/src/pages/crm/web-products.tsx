import { useState } from "react";
import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  useListWebCategories, getListWebCategoriesQueryKey, useCreateWebCategory, useUpdateWebCategory, useDeleteWebCategory,
  useListWebProducts, getListWebProductsQueryKey, useCreateWebProduct, useUpdateWebProduct, useDeleteWebProduct,
  useGetWebProduct, getGetWebProductQueryKey,
  useReplaceWebProductKeyRange, useReplaceWebProductSpecGroups, useReplaceWebProductFeatures,
  useReplaceWebProductApplications, useReplaceWebProductImages, useReplaceWebProductFaqs, useReplaceWebProductRelated,
  useReplaceWebProductConfigInputTypes, useReplaceWebProductMountingVariants, useReplaceWebProductModelRange,
  getWebProduct, createWebProduct,
  replaceWebProductKeyRange, replaceWebProductSpecGroups, replaceWebProductFeatures,
  replaceWebProductApplications, replaceWebProductImages, replaceWebProductFaqs,
  replaceWebProductConfigInputTypes, replaceWebProductMountingVariants, replaceWebProductModelRange,
  exportWebContent, importWebContent,
} from "@workspace/api-client-react";
import type { WebCategory, WebProductSummary, WebContentImportResult } from "@workspace/api-client-react";
import { LoadError, inputClass, labelClass, btnPrimaryClass, btnSecondaryClass, btnAccentClass, cardClass, ImagePickerButton, LoadingRow, EmptyRow, LoadingState, Pagination, paginate } from "./shared";
import { Plus, Edit2, Trash2, X, Image, Globe, Package, ArrowLeft, GripVertical, ExternalLink, Copy, Download, Upload, CheckCircle2, XCircle } from "lucide-react";

type Tab = "categories" | "products";

export function WebProducts({ canEdit }: { canEdit: boolean }) {
  const [tab, setTab] = useState<Tab>("products");
  const [editingProductId, setEditingProductId] = useState<number | null | "new">(null);

  if (editingProductId !== null) {
    return <ProductEditor id={editingProductId === "new" ? null : editingProductId} canEdit={canEdit} onClose={() => setEditingProductId(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-heading font-bold text-[#093C71]">Website Products</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage the public site's product & category pages — no code changes needed.</p>
        </div>
        {canEdit && <ExportImportControls />}
      </div>
      <div className="flex gap-2 border-b border-slate-200">
        {([{ id: "products", label: "Products", icon: Package }, { id: "categories", label: "Categories", icon: Globe }] as const).map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors ${tab === t.id ? "border-[#EF6F24] text-[#093C71]" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>
      {tab === "categories" && <CategoriesTab canEdit={canEdit} />}
      {tab === "products" && <ProductsTab canEdit={canEdit} onEdit={setEditingProductId} />}
    </div>
  );
}

// -------------------- Cross-environment export/import --------------------
// Lets an admin download all categories + products from this environment (e.g.
// Development) and re-import them in another (e.g. Production) after publishing,
// without needing direct database access. Upserts by slug, so re-running is safe.

function ExportImportControls() {
  const client = useQueryClient();
  const [busy, setBusy] = useState<"export" | "import" | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleExport = async () => {
    setBusy("export");
    setResult(null);
    try {
      const data = await exportWebContent();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `website-content-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setResult({ success: true, message: `Downloaded ${data.categories.length} categor${data.categories.length === 1 ? "y" : "ies"} and ${data.products.length} product${data.products.length === 1 ? "" : "s"}.` });
    } catch (err) {
      setResult({ success: false, message: (err as { message?: string } | null)?.message || "Export failed." });
    } finally {
      setBusy(null);
    }
  };

  const handleImportFile = async (file: File) => {
    setBusy("import");
    setResult(null);
    try {
      const parsed = JSON.parse(await file.text());
      if (!Array.isArray(parsed?.categories) || !Array.isArray(parsed?.products)) {
        throw new Error("This file doesn't look like a Website Content export.");
      }
      const summary: WebContentImportResult = await importWebContent(parsed);
      client.invalidateQueries({ queryKey: getListWebCategoriesQueryKey() });
      client.invalidateQueries({ queryKey: getListWebProductsQueryKey() });
      setResult({
        success: true,
        message: `Imported: ${summary.categoriesCreated} categor${summary.categoriesCreated === 1 ? "y" : "ies"} added, ${summary.categoriesUpdated} updated · ${summary.productsCreated} product${summary.productsCreated === 1 ? "" : "s"} added, ${summary.productsUpdated} updated.`,
      });
    } catch (err) {
      setResult({ success: false, message: (err as { message?: string } | null)?.message || "Import failed. Make sure the file was downloaded from Export here." });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <button type="button" onClick={handleExport} disabled={busy !== null} className={btnSecondaryClass} title="Download all categories & products as a JSON file">
          <Download size={14} /> {busy === "export" ? "Exporting…" : "Export"}
        </button>
        <label className={`${btnSecondaryClass} cursor-pointer ${busy !== null ? "opacity-60 pointer-events-none" : ""}`} title="Upload a JSON file exported from another environment (e.g. Development)">
          <Upload size={14} /> {busy === "import" ? "Importing…" : "Import"}
          <input
            type="file"
            accept="application/json"
            className="hidden"
            disabled={busy !== null}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) handleImportFile(file);
            }}
          />
        </label>
      </div>
      {result && (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium max-w-sm text-right ${result.success ? "text-green-700" : "text-red-700"}`}>
          {result.success ? <CheckCircle2 size={13} className="shrink-0" /> : <XCircle size={13} className="shrink-0" />}
          {result.message}
        </span>
      )}
    </div>
  );
}

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// -------------------- Categories --------------------

function CategoriesTab({ canEdit }: { canEdit: boolean }) {
  const client = useQueryClient();
  const { data, isLoading, error, refetch } = useListWebCategories({ query: { queryKey: getListWebCategoriesQueryKey(), placeholderData: keepPreviousData } });
  const createMutation = useCreateWebCategory();
  const updateMutation = useUpdateWebCategory();
  const deleteMutation = useDeleteWebCategory();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  if (error) return <LoadError error={error} onRetry={() => refetch()} />;
  const editing = editingId ? data?.find(c => c.id === editingId) : null;
  const pagedData = paginate(data, page);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      slug: (fd.get("slug") as string) || slugify(fd.get("name") as string),
      shortDescription: (fd.get("shortDescription") as string) || undefined,
      description: (fd.get("description") as string) || undefined,
      status: fd.get("status") as string,
      displayOrder: Number(fd.get("displayOrder")) || 0,
      seoTitle: (fd.get("seoTitle") as string) || undefined,
      seoDescription: (fd.get("seoDescription") as string) || undefined,
      imageUrl: imageUrl === undefined ? undefined : (imageUrl ?? ""),
    };
    const onSuccess = () => { client.invalidateQueries({ queryKey: getListWebCategoriesQueryKey() }); setShowForm(false); setEditingId(null); setImageUrl(undefined); };
    const onError = (err: unknown) => setErrorMsg((err as { message?: string })?.message || "Could not save category");
    if (editingId) updateMutation.mutate({ id: editingId, data: payload }, { onSuccess, onError });
    else createMutation.mutate({ data: payload }, { onSuccess, onError });
  };

  const currentImageUrl = imageUrl === undefined ? editing?.imageUrl : imageUrl;

  return (
    <div className="space-y-4">
      {canEdit && !showForm && (
        <button onClick={() => { setEditingId(null); setShowForm(true); setImageUrl(undefined); }} className={btnPrimaryClass}><Plus size={16} /> Add Category</button>
      )}
      {showForm && (
        <div className={`${cardClass} p-6 bg-slate-50 border-t-4 border-t-[#093C71]`}>
          {errorMsg && <p className="mb-4 text-sm font-semibold text-red-600">{errorMsg}</p>}
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label className={labelClass}>Name *</label><input required name="name" defaultValue={editing?.name} className={inputClass} /></div>
              <div><label className={labelClass}>URL Slug</label><input name="slug" defaultValue={editing?.slug} placeholder="Auto-generated from name if left blank" className={inputClass} /></div>
              <div><label className={labelClass}>Short Description</label><input name="shortDescription" defaultValue={editing?.shortDescription || ""} className={inputClass} /></div>
              <div>
                <label className={labelClass}>Status</label>
                <select name="status" defaultValue={editing?.status || "draft"} className={inputClass}>
                  <option value="draft">Draft</option><option value="published">Published</option>
                </select>
              </div>
              <div><label className={labelClass}>Display Order</label><input type="number" name="displayOrder" defaultValue={editing?.displayOrder ?? 0} className={inputClass} /></div>
            </div>
            <div><label className={labelClass}>Description</label><textarea name="description" rows={3} defaultValue={editing?.description || ""} className={inputClass} /></div>
            <div>
              <label className={labelClass}>Category Image</label>
              <div className="flex items-center gap-4 mt-1">
                <div className="w-20 h-20 rounded-sm border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                  {currentImageUrl ? <img src={`/api/storage${currentImageUrl}`} alt="" className="w-full h-full object-contain" /> : <Image size={22} className="text-slate-300" />}
                </div>
                <ImagePickerButton onSelect={(path) => setImageUrl(path)} label={currentImageUrl ? "Replace Image" : "Upload Image"} />
                {currentImageUrl && <button type="button" onClick={() => setImageUrl(null)} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-600"><X size={14} /> Remove</button>}
              </div>
            </div>
            <details className="text-sm">
              <summary className="cursor-pointer font-bold text-slate-600">SEO settings</summary>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
                <div><label className={labelClass}>SEO Title</label><input name="seoTitle" defaultValue={editing?.seoTitle || ""} className={inputClass} /></div>
                <div><label className={labelClass}>SEO Description</label><input name="seoDescription" defaultValue={editing?.seoDescription || ""} className={inputClass} /></div>
              </div>
            </details>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <button type="button" onClick={() => setShowForm(false)} className={btnSecondaryClass}>Cancel</button>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className={btnPrimaryClass}>Save</button>
            </div>
          </form>
        </div>
      )}
      <div className={cardClass}>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
            <tr><th className="px-5 py-4">Name</th><th className="px-5 py-4">Slug</th><th className="px-5 py-4">Products</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 w-20"></th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? <LoadingRow colSpan={5} />
            : pagedData.length ? pagedData.map(c => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-5 py-4 font-bold text-[#093C71]">{c.name}</td>
                <td className="px-5 py-4 text-slate-600 font-mono text-xs">{c.slug}</td>
                <td className="px-5 py-4 text-slate-600">{c.productCount}</td>
                <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${c.status === "published" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{c.status}</span></td>
                <td className="px-5 py-4 text-right whitespace-nowrap">
                  {canEdit && <>
                    <button onClick={() => { setEditingId(c.id); setShowForm(true); setImageUrl(undefined); }} className="p-2 text-slate-400 hover:text-[#093C71] rounded-sm hover:bg-slate-100"><Edit2 size={16} /></button>
                    <button onClick={() => { if (confirm(`Delete category "${c.name}"?`)) deleteMutation.mutate({ id: c.id }, { onSuccess: () => client.invalidateQueries({ queryKey: getListWebCategoriesQueryKey() }), onError: (err) => alert((err as { message?: string })?.message || "Could not delete") }); }} className="p-2 text-slate-400 hover:text-red-600 rounded-sm hover:bg-slate-100"><Trash2 size={16} /></button>
                  </>}
                </td>
              </tr>
            )) : <EmptyRow colSpan={5} actionLabel={canEdit ? "Add Category" : undefined} onAction={canEdit ? () => { setEditingId(null); setShowForm(true); setImageUrl(undefined); } : undefined} />}
          </tbody>
        </table>
        <Pagination page={page} onPageChange={setPage} totalItems={data?.length ?? 0} />
      </div>
    </div>
  );
}

// -------------------- Products list --------------------

function ProductsTab({ canEdit, onEdit }: { canEdit: boolean; onEdit: (id: number | "new") => void }) {
  const client = useQueryClient();
  const { data, isLoading, error, refetch } = useListWebProducts({ query: { queryKey: getListWebProductsQueryKey(), placeholderData: keepPreviousData } });
  const deleteMutation = useDeleteWebProduct();
  const [search, setSearch] = useState("");
  const [duplicatingId, setDuplicatingId] = useState<number | null>(null);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  if (error) return <LoadError error={error} onRetry={() => refetch()} />;
  const filtered = data?.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const pagedProducts = paginate(filtered, page);

  const handleDuplicate = async (p: { id: number; slug: string; name: string }) => {
    setDuplicateError(null);
    setDuplicatingId(p.id);
    try {
      const full = await getWebProduct(p.id);
      const existingSlugs = new Set((data ?? []).map(x => x.slug));
      let newSlug = `${full.slug}-copy`;
      let n = 2;
      while (existingSlugs.has(newSlug)) { newSlug = `${full.slug}-copy-${n}`; n++; }

      const created = await createWebProduct({
        categoryId: full.categoryId ?? null,
        name: `${full.name} (Copy)`,
        slug: newSlug,
        series: full.series ?? undefined,
        tagline: full.tagline ?? undefined,
        description: full.description ?? undefined,
        mainImageUrl: full.mainImageUrl ?? undefined,
        descriptionImageUrl: full.descriptionImageUrl ?? undefined,
        descriptionTitle: full.descriptionTitle ?? undefined,
        docUrl: full.docUrl ?? undefined,
        videoUrl: full.videoUrl ?? undefined,
        status: "draft",
        featured: false,
        displayOrder: full.displayOrder,
        modelRangeHeaders: full.modelRangeHeaders,
        seoTitle: full.seoTitle ?? undefined,
        seoDescription: full.seoDescription ?? undefined,
        seoKeywords: full.seoKeywords ?? undefined,
        ogImageUrl: full.ogImageUrl ?? undefined,
      });

      await Promise.all([
        replaceWebProductKeyRange(created.id, { items: full.keyRange.map(k => ({ label: k.label })) }),
        replaceWebProductSpecGroups(created.id, { groups: full.specGroups.map(g => ({ groupName: g.groupName, specs: g.specs.map(s => ({ label: s.label, value: s.value })) })) }),
        replaceWebProductFeatures(created.id, { items: full.features.map(f => ({ text: f.text })) }),
        replaceWebProductApplications(created.id, { items: full.applications.map(a => ({ label: a.label, imageUrl: a.imageUrl ?? undefined })) }),
        replaceWebProductImages(created.id, { items: full.images.map(i => ({ imageUrl: i.imageUrl, altText: i.altText ?? undefined })) }),
        replaceWebProductFaqs(created.id, { items: full.faqs.map(f => ({ question: f.question, answer: f.answer })) }),
        replaceWebProductConfigInputTypes(created.id, { items: full.configInputTypes.map(c => ({ label: c.label, imageUrl: c.imageUrl ?? undefined })) }),
        replaceWebProductMountingVariants(created.id, { items: full.mountingVariants.map(v => ({ name: v.name, imageUrl: v.imageUrl ?? undefined, features: v.features })) }),
        replaceWebProductModelRange(created.id, { headers: full.modelRangeHeaders, rows: full.modelRangeRows.map(r => r.cells) }),
      ]);
      // Related products are intentionally not copied — they'd point back at the source product's
      // relations, which usually isn't what you want for a fresh duplicate.

      client.invalidateQueries({ queryKey: getListWebProductsQueryKey() });
      onEdit(created.id);
    } catch (err) {
      setDuplicateError((err as { message?: string })?.message || `Could not duplicate "${p.name}"`);
    } finally {
      setDuplicatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search products..." className={`${inputClass} max-w-xs`} />
        {canEdit && <button onClick={() => onEdit("new")} className={btnPrimaryClass}><Plus size={16} /> Add Product</button>}
      </div>
      {duplicateError && <p className="text-sm font-bold text-red-600">{duplicateError}</p>}
      <div className={cardClass}>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
            <tr><th className="px-5 py-4">Name</th><th className="px-5 py-4">Category</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Featured</th><th className="px-5 py-4 w-20"></th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? <LoadingRow colSpan={5} />
            : pagedProducts.length ? pagedProducts.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => onEdit(p.id)}>
                <td className="px-5 py-4 font-bold text-[#093C71]">{p.name}</td>
                <td className="px-5 py-4 text-slate-600">{p.categoryName || "—"}</td>
                <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${p.status === "published" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{p.status}</span></td>
                <td className="px-5 py-4 text-slate-600">{p.featured ? "Yes" : "—"}</td>
                <td className="px-5 py-4 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                  {canEdit && <>
                    <button onClick={() => onEdit(p.id)} className="p-2 text-slate-400 hover:text-[#093C71] rounded-sm hover:bg-slate-100"><Edit2 size={16} /></button>
                    <button
                      title="Duplicate"
                      disabled={duplicatingId === p.id}
                      onClick={() => handleDuplicate(p)}
                      className="p-2 text-slate-400 hover:text-[#093C71] rounded-sm hover:bg-slate-100 disabled:opacity-50"
                    >
                      {duplicatingId === p.id ? <span className="block w-4 h-4 border-2 border-slate-300 border-t-[#093C71] rounded-full animate-spin" /> : <Copy size={16} />}
                    </button>
                    <button onClick={() => { if (confirm(`Delete product "${p.name}"? This removes all its specs, features, images and FAQs.`)) deleteMutation.mutate({ id: p.id }, { onSuccess: () => client.invalidateQueries({ queryKey: getListWebProductsQueryKey() }) }); }} className="p-2 text-slate-400 hover:text-red-600 rounded-sm hover:bg-slate-100"><Trash2 size={16} /></button>
                  </>}
                </td>
              </tr>
            )) : <EmptyRow colSpan={5} actionLabel={canEdit ? "Add Product" : undefined} onAction={canEdit ? () => onEdit("new") : undefined} />}
          </tbody>
        </table>
        <Pagination page={page} onPageChange={setPage} totalItems={filtered?.length ?? 0} />
      </div>
    </div>
  );
}

// -------------------- Product editor --------------------

function ProductEditor({ id, canEdit, onClose }: { id: number | null; canEdit: boolean; onClose: () => void }) {
  const client = useQueryClient();
  const { data: product, isLoading, error, refetch } = useGetWebProduct(id ?? 0, { query: { enabled: id !== null, queryKey: getGetWebProductQueryKey(id ?? 0) } });
  const { data: categories } = useListWebCategories({ query: { queryKey: getListWebCategoriesQueryKey(), placeholderData: keepPreviousData } });
  const { data: allProducts } = useListWebProducts({ query: { queryKey: getListWebProductsQueryKey(), placeholderData: keepPreviousData } });
  const createMutation = useCreateWebProduct();
  const updateMutation = useUpdateWebProduct();
  const keyRangeMutation = useReplaceWebProductKeyRange();
  const specGroupsMutation = useReplaceWebProductSpecGroups();
  const featuresMutation = useReplaceWebProductFeatures();
  const applicationsMutation = useReplaceWebProductApplications();
  const imagesMutation = useReplaceWebProductImages();
  const faqsMutation = useReplaceWebProductFaqs();
  const relatedMutation = useReplaceWebProductRelated();
  const configInputTypesMutation = useReplaceWebProductConfigInputTypes();
  const mountingVariantsMutation = useReplaceWebProductMountingVariants();
  const modelRangeMutation = useReplaceWebProductModelRange();

  const [mainImageUrl, setMainImageUrl] = useState<string | null | undefined>(undefined);
  const [descImageUrl, setDescImageUrl] = useState<string | null | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const [keyRange, setKeyRange] = useState<string[] | null>(null);
  const [features, setFeatures] = useState<string[] | null>(null);
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[] | null>(null);
  const [applications, setApplications] = useState<{ label: string; imageUrl: string | null }[] | null>(null);
  const [images, setImages] = useState<{ imageUrl: string; altText: string | null }[] | null>(null);
  const [specGroups, setSpecGroups] = useState<{ groupName: string; specs: { label: string; value: string }[] }[] | null>(null);
  const [relatedIds, setRelatedIds] = useState<number[] | null>(null);
  const [configInputTypes, setConfigInputTypes] = useState<{ label: string; imageUrl: string | null }[] | null>(null);
  const [mountingVariants, setMountingVariants] = useState<{ name: string; imageUrl: string | null; features: string[] }[] | null>(null);
  const [modelRange, setModelRange] = useState<{ headers: string[]; rows: string[][] } | null>(null);

  if (id !== null && isLoading) return <LoadingState label="Loading product..." />;
  if (error) return <LoadError error={error} onRetry={() => refetch()} />;

  const kr = keyRange ?? product?.keyRange.map(k => k.label) ?? [];
  const ft = features ?? product?.features.map(f => f.text) ?? [];
  const fq = faqs ?? product?.faqs.map(f => ({ question: f.question, answer: f.answer })) ?? [];
  const apps = applications ?? product?.applications.map(a => ({ label: a.label, imageUrl: a.imageUrl ?? null })) ?? [];
  const imgs = images ?? product?.images.map(i => ({ imageUrl: i.imageUrl, altText: i.altText ?? null })) ?? [];
  const groups = specGroups ?? product?.specGroups.map(g => ({ groupName: g.groupName, specs: g.specs.map(s => ({ label: s.label, value: s.value })) })) ?? [];
  const related = relatedIds ?? product?.related.map(r => r.id) ?? [];
  const cfgTypes = configInputTypes ?? product?.configInputTypes.map(c => ({ label: c.label, imageUrl: c.imageUrl ?? null })) ?? [];
  const variants = mountingVariants ?? product?.mountingVariants.map(v => ({ name: v.name, imageUrl: v.imageUrl ?? null, features: v.features })) ?? [];
  const modelRangeValue = modelRange ?? {
    headers: product?.modelRangeHeaders ?? [],
    rows: product?.modelRangeRows.map(r => r.cells) ?? [],
  };

  const currentMainImage = mainImageUrl === undefined ? product?.mainImageUrl : mainImageUrl;
  const currentDescImage = descImageUrl === undefined ? product?.descriptionImageUrl : descImageUrl;

  const flash = (msg: string) => { setSavedNotice(msg); setTimeout(() => setSavedNotice(null), 2000); };

  const handleSaveGeneral = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      slug: (fd.get("slug") as string) || slugify(fd.get("name") as string),
      categoryId: fd.get("categoryId") ? Number(fd.get("categoryId")) : null,
      series: (fd.get("series") as string) || undefined,
      tagline: (fd.get("tagline") as string) || undefined,
      description: (fd.get("description") as string) || undefined,
      descriptionTitle: (fd.get("descriptionTitle") as string) || undefined,
      docUrl: (fd.get("docUrl") as string) || undefined,
      videoUrl: (fd.get("videoUrl") as string) || undefined,
      status: fd.get("status") as string,
      featured: fd.get("featured") === "on",
      displayOrder: Number(fd.get("displayOrder")) || 0,
      seoTitle: (fd.get("seoTitle") as string) || undefined,
      seoDescription: (fd.get("seoDescription") as string) || undefined,
      seoKeywords: (fd.get("seoKeywords") as string) || undefined,
      mainImageUrl: mainImageUrl === undefined ? undefined : (mainImageUrl ?? ""),
      descriptionImageUrl: descImageUrl === undefined ? undefined : (descImageUrl ?? ""),
    };
    const onError = (err: unknown) => setErrorMsg((err as { message?: string })?.message || "Could not save product");
    if (id === null) {
      createMutation.mutate({ data: payload }, {
        onSuccess: (created) => { client.invalidateQueries({ queryKey: getListWebProductsQueryKey() }); onClose(); },
        onError,
      });
    } else {
      updateMutation.mutate({ id, data: payload }, {
        onSuccess: () => { client.invalidateQueries({ queryKey: getListWebProductsQueryKey() }); client.invalidateQueries({ queryKey: getGetWebProductQueryKey(id) }); flash("Saved"); },
        onError,
      });
    }
  };

  const invalidate = () => { if (id !== null) client.invalidateQueries({ queryKey: getGetWebProductQueryKey(id) }); };

  if (id === null) {
    return (
      <ProductGeneralForm
        product={null} categories={categories} canEdit={canEdit} errorMsg={errorMsg}
        mainImageUrl={currentMainImage} descImageUrl={currentDescImage}
        onMainImage={setMainImageUrl} onDescImage={setDescImageUrl}
        onSubmit={handleSaveGeneral} onCancel={onClose} isNew
        isPending={createMutation.isPending}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#093C71]"><ArrowLeft size={16} /> Back to Products</button>
        <div className="flex items-center gap-4">
          {savedNotice && <span className="text-sm font-bold text-green-600">{savedNotice}</span>}
          {product?.slug && (
            <a
              href={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/products/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#EF6F24] hover:text-[#093C71]"
            >
              <ExternalLink size={15} /> View on site
            </a>
          )}
        </div>
      </div>
      <h1 className="text-2xl font-heading font-bold text-[#093C71]">{product?.name}</h1>
      {product?.status !== "published" && (
        <p className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-sm px-3 py-2 inline-block">
          This product is in Draft — it won't be visible at the link above until you set Status to Published and save.
        </p>
      )}

      <Section title="General & SEO">
        <ProductGeneralForm
          product={product ?? null} categories={categories} canEdit={canEdit} errorMsg={errorMsg}
          mainImageUrl={currentMainImage} descImageUrl={currentDescImage}
          onMainImage={setMainImageUrl} onDescImage={setDescImageUrl}
          onSubmit={handleSaveGeneral} onCancel={onClose}
          isPending={createMutation.isPending || updateMutation.isPending}
        />
      </Section>

      <Section title="Key Range (hero bullet list)">
        <StringListEditor items={kr} onChange={setKeyRange} canEdit={canEdit} placeholder="e.g. Ratio range: 5-100" />
        {canEdit && <SaveRow isPending={keyRangeMutation.isPending} onSave={() => keyRangeMutation.mutate({ id, data: { items: kr.map(label => ({ label })) } }, { onSuccess: () => { invalidate(); flash("Saved"); setKeyRange(null); } })} />}
      </Section>

      <Section title="Technical Specification Groups">
        <SpecGroupsEditor groups={groups} onChange={setSpecGroups} canEdit={canEdit} />
        {canEdit && <SaveRow isPending={specGroupsMutation.isPending} onSave={() => specGroupsMutation.mutate({ id, data: { groups } }, { onSuccess: () => { invalidate(); flash("Saved"); setSpecGroups(null); } })} />}
      </Section>

      <Section title="Features">
        <StringListEditor items={ft} onChange={setFeatures} canEdit={canEdit} placeholder="e.g. Aluminum alloy housing" />
        {canEdit && <SaveRow isPending={featuresMutation.isPending} onSave={() => featuresMutation.mutate({ id, data: { items: ft.map(text => ({ text })) } }, { onSuccess: () => { invalidate(); flash("Saved"); setFeatures(null); } })} />}
      </Section>

      <Section title="Typical Applications">
        <ApplicationsEditor items={apps} onChange={setApplications} canEdit={canEdit} />
        {canEdit && <SaveRow isPending={applicationsMutation.isPending} onSave={() => applicationsMutation.mutate({ id, data: { items: apps.map(a => ({ label: a.label, imageUrl: a.imageUrl ?? undefined })) } }, { onSuccess: () => { invalidate(); flash("Saved"); setApplications(null); } })} />}
      </Section>

      <Section title="Gallery Images">
        <ImagesEditor items={imgs} onChange={setImages} canEdit={canEdit} />
        {canEdit && <SaveRow isPending={imagesMutation.isPending} onSave={() => imagesMutation.mutate({ id, data: { items: imgs.map(i => ({ imageUrl: i.imageUrl, altText: i.altText ?? undefined })) } }, { onSuccess: () => { invalidate(); flash("Saved"); setImages(null); } })} />}
      </Section>

      <Section title="FAQs">
        <FaqsEditor items={fq} onChange={setFaqs} canEdit={canEdit} />
        {canEdit && <SaveRow isPending={faqsMutation.isPending} onSave={() => faqsMutation.mutate({ id, data: { items: fq } }, { onSuccess: () => { invalidate(); flash("Saved"); setFaqs(null); } })} />}
      </Section>

      <Section title="Related Products (leave empty to auto-suggest from the same category)">
        <RelatedEditor selected={related} allProducts={allProducts?.filter(p => p.id !== id)} onChange={setRelatedIds} canEdit={canEdit} />
        {canEdit && <SaveRow isPending={relatedMutation.isPending} onSave={() => relatedMutation.mutate({ id, data: { relatedProductIds: related } }, { onSuccess: () => { invalidate(); flash("Saved"); setRelatedIds(null); } })} />}
      </Section>

      <Section title="Configuration Diagrams (Technical Datasheet → Configuration tab)">
        <ConfigInputTypesEditor items={cfgTypes} onChange={setConfigInputTypes} canEdit={canEdit} />
        {canEdit && <SaveRow isPending={configInputTypesMutation.isPending} onSave={() => configInputTypesMutation.mutate({ id, data: { items: cfgTypes.map(c => ({ label: c.label, imageUrl: c.imageUrl ?? undefined })) } }, { onSuccess: () => { invalidate(); flash("Saved"); setConfigInputTypes(null); } })} />}
      </Section>

      <Section title="Model Range Table (Technical Datasheet → Model Range tab)">
        <ModelRangeEditor value={modelRangeValue} onChange={setModelRange} canEdit={canEdit} />
        {canEdit && <SaveRow isPending={modelRangeMutation.isPending} onSave={() => modelRangeMutation.mutate({ id, data: modelRangeValue }, { onSuccess: () => { invalidate(); flash("Saved"); setModelRange(null); } })} />}
      </Section>

      <Section title="Mounting Variants (alternating image/text bands)">
        <MountingVariantsEditor items={variants} onChange={setMountingVariants} canEdit={canEdit} />
        {canEdit && <SaveRow isPending={mountingVariantsMutation.isPending} onSave={() => mountingVariantsMutation.mutate({ id, data: { items: variants.map(v => ({ name: v.name, imageUrl: v.imageUrl ?? undefined, features: v.features })) } }, { onSuccess: () => { invalidate(); flash("Saved"); setMountingVariants(null); } })} />}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={`${cardClass} p-6`}>
      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function SaveRow({ onSave, isPending }: { onSave: () => void; isPending?: boolean }) {
  return (
    <div className="flex justify-end mt-4 pt-4 border-t border-slate-100">
      <button onClick={onSave} disabled={isPending} className={btnAccentClass}>Save Section</button>
    </div>
  );
}

function ProductGeneralForm({
  product, categories, canEdit, errorMsg, mainImageUrl, descImageUrl, onMainImage, onDescImage, onSubmit, onCancel, isNew, isPending,
}: {
  product: { name: string; slug: string; categoryId?: number | null; series?: string | null; tagline?: string | null; description?: string | null; descriptionTitle?: string | null; docUrl?: string | null; videoUrl?: string | null; status: string; featured: boolean; displayOrder: number; seoTitle?: string | null; seoDescription?: string | null; seoKeywords?: string | null } | null;
  categories: { id: number; name: string }[] | undefined;
  canEdit: boolean;
  errorMsg: string | null;
  mainImageUrl: string | null | undefined;
  descImageUrl: string | null | undefined;
  onMainImage: (v: string | null) => void;
  onDescImage: (v: string | null) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  isNew?: boolean;
  isPending?: boolean;
}) {
  return (
    <fieldset disabled={!canEdit}>
      {errorMsg && <p className="mb-4 text-sm font-semibold text-red-600">{errorMsg}</p>}
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div><label className={labelClass}>Name *</label><input required name="name" defaultValue={product?.name} className={inputClass} /></div>
          <div><label className={labelClass}>URL Slug</label><input name="slug" defaultValue={product?.slug} placeholder="Auto-generated from name if left blank" className={inputClass} /></div>
          <div>
            <label className={labelClass}>Category</label>
            <select name="categoryId" defaultValue={product?.categoryId ?? ""} className={inputClass}>
              <option value="">— None —</option>
              {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className={labelClass}>Series</label><input name="series" defaultValue={product?.series || ""} className={inputClass} /></div>
          <div><label className={labelClass}>Status</label>
            <select name="status" defaultValue={product?.status || "draft"} className={inputClass}>
              <option value="draft">Draft</option><option value="published">Published</option>
            </select>
          </div>
          <div className="flex items-center gap-6 pt-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600"><input type="checkbox" name="featured" defaultChecked={product?.featured} /> Featured</label>
          </div>
          <div><label className={labelClass}>Display Order</label><input type="number" name="displayOrder" defaultValue={product?.displayOrder ?? 0} className={inputClass} /></div>
        </div>
        <div><label className={labelClass}>Tagline (hero subtext)</label><textarea name="tagline" rows={2} defaultValue={product?.tagline || ""} className={inputClass} /></div>
        <div><label className={labelClass}>Description Title (below hero)</label><input name="descriptionTitle" defaultValue={product?.descriptionTitle || ""} className={inputClass} /></div>
        <div><label className={labelClass}>Description</label><textarea name="description" rows={4} defaultValue={product?.description || ""} className={inputClass} /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div><label className={labelClass}>Document / Datasheet URL</label><input name="docUrl" defaultValue={product?.docUrl || ""} className={inputClass} /></div>
          <div><label className={labelClass}>Video URL</label><input name="videoUrl" defaultValue={product?.videoUrl || ""} className={inputClass} /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Main / Hero Image</label>
            <div className="flex items-center gap-4 mt-1">
              <div className="w-20 h-20 rounded-sm border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                {mainImageUrl ? <img src={`/api/storage${mainImageUrl}`} alt="" className="w-full h-full object-contain" /> : <Image size={22} className="text-slate-300" />}
              </div>
              {canEdit && <ImagePickerButton onSelect={onMainImage} label={mainImageUrl ? "Replace" : "Upload"} />}
              {mainImageUrl && canEdit && <button type="button" onClick={() => onMainImage(null as unknown as string)} className="text-xs font-semibold text-slate-500 hover:text-red-600">Remove</button>}
            </div>
          </div>
          <div>
            <label className={labelClass}>Description Section Image</label>
            <div className="flex items-center gap-4 mt-1">
              <div className="w-20 h-20 rounded-sm border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                {descImageUrl ? <img src={`/api/storage${descImageUrl}`} alt="" className="w-full h-full object-contain" /> : <Image size={22} className="text-slate-300" />}
              </div>
              {canEdit && <ImagePickerButton onSelect={onDescImage} label={descImageUrl ? "Replace" : "Upload"} />}
              {descImageUrl && canEdit && <button type="button" onClick={() => onDescImage(null as unknown as string)} className="text-xs font-semibold text-slate-500 hover:text-red-600">Remove</button>}
            </div>
          </div>
        </div>
        <details className="text-sm">
          <summary className="cursor-pointer font-bold text-slate-600">SEO settings</summary>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
            <div><label className={labelClass}>SEO Title</label><input name="seoTitle" defaultValue={product?.seoTitle || ""} className={inputClass} /></div>
            <div><label className={labelClass}>SEO Description</label><input name="seoDescription" defaultValue={product?.seoDescription || ""} className={inputClass} /></div>
            <div className="md:col-span-2"><label className={labelClass}>SEO Keywords</label><input name="seoKeywords" defaultValue={product?.seoKeywords || ""} className={inputClass} /></div>
          </div>
        </details>
        {canEdit && (
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            {isNew && <button type="button" onClick={onCancel} className={btnSecondaryClass}>Cancel</button>}
            <button type="submit" disabled={isPending} className={btnPrimaryClass}>{isNew ? "Create Product" : "Save General Info"}</button>
          </div>
        )}
      </form>
    </fieldset>
  );
}

function StringListEditor({ items, onChange, canEdit, placeholder }: { items: string[]; onChange: (v: string[]) => void; canEdit: boolean; placeholder?: string }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <GripVertical size={14} className="text-slate-300 shrink-0" />
          <input value={item} disabled={!canEdit} placeholder={placeholder} onChange={e => onChange(items.map((it, j) => j === i ? e.target.value : it))} className={inputClass} />
          {canEdit && <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="p-2 text-slate-400 hover:text-red-600"><X size={16} /></button>}
        </div>
      ))}
      {canEdit && <button type="button" onClick={() => onChange([...items, ""])} className={btnSecondaryClass}><Plus size={14} /> Add Item</button>}
      {items.length === 0 && <p className="text-sm text-slate-400">Nothing added yet.</p>}
    </div>
  );
}

function SpecGroupsEditor({ groups, onChange, canEdit }: { groups: { groupName: string; specs: { label: string; value: string }[] }[]; onChange: (v: typeof groups) => void; canEdit: boolean }) {
  return (
    <div className="space-y-5">
      {groups.map((group, gi) => (
        <div key={gi} className="border border-slate-200 rounded-sm p-4 bg-slate-50">
          <div className="flex items-center gap-2 mb-3">
            <input value={group.groupName} disabled={!canEdit} placeholder="Group name (e.g. General)" onChange={e => onChange(groups.map((g, j) => j === gi ? { ...g, groupName: e.target.value } : g))} className={`${inputClass} font-bold`} />
            {canEdit && <button type="button" onClick={() => onChange(groups.filter((_, j) => j !== gi))} className="p-2 text-slate-400 hover:text-red-600 shrink-0"><Trash2 size={16} /></button>}
          </div>
          <div className="space-y-2 pl-2">
            {group.specs.map((spec, si) => (
              <div key={si} className="flex items-center gap-2">
                <input value={spec.label} disabled={!canEdit} placeholder="Label" onChange={e => onChange(groups.map((g, j) => j === gi ? { ...g, specs: g.specs.map((s, k) => k === si ? { ...s, label: e.target.value } : s) } : g))} className={`${inputClass} max-w-[220px]`} />
                <input value={spec.value} disabled={!canEdit} placeholder="Value" onChange={e => onChange(groups.map((g, j) => j === gi ? { ...g, specs: g.specs.map((s, k) => k === si ? { ...s, value: e.target.value } : s) } : g))} className={inputClass} />
                {canEdit && <button type="button" onClick={() => onChange(groups.map((g, j) => j === gi ? { ...g, specs: g.specs.filter((_, k) => k !== si) } : g))} className="p-2 text-slate-400 hover:text-red-600"><X size={16} /></button>}
              </div>
            ))}
            {canEdit && <button type="button" onClick={() => onChange(groups.map((g, j) => j === gi ? { ...g, specs: [...g.specs, { label: "", value: "" }] } : g))} className="text-xs font-bold text-[#093C71] hover:underline">+ Add spec row</button>}
          </div>
        </div>
      ))}
      {canEdit && <button type="button" onClick={() => onChange([...groups, { groupName: "", specs: [] }])} className={btnSecondaryClass}><Plus size={14} /> Add Group</button>}
      {groups.length === 0 && <p className="text-sm text-slate-400">No spec groups yet.</p>}
    </div>
  );
}

function ApplicationsEditor({ items, onChange, canEdit }: { items: { label: string; imageUrl: string | null }[]; onChange: (v: typeof items) => void; canEdit: boolean }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-sm border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
            {item.imageUrl ? <img src={`/api/storage${item.imageUrl}`} alt="" className="w-full h-full object-cover" /> : <Image size={16} className="text-slate-300" />}
          </div>
          <input value={item.label} disabled={!canEdit} placeholder="e.g. Packaging conveyors" onChange={e => onChange(items.map((it, j) => j === i ? { ...it, label: e.target.value } : it))} className={inputClass} />
          {canEdit && <ImagePickerButton onSelect={(path) => onChange(items.map((it, j) => j === i ? { ...it, imageUrl: path } : it))} label="Photo" />}
          {canEdit && <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="p-2 text-slate-400 hover:text-red-600"><X size={16} /></button>}
        </div>
      ))}
      {canEdit && <button type="button" onClick={() => onChange([...items, { label: "", imageUrl: null }])} className={btnSecondaryClass}><Plus size={14} /> Add Application</button>}
      {items.length === 0 && <p className="text-sm text-slate-400">No applications yet — a generic icon grid falls back on the public page.</p>}
    </div>
  );
}

function ImagesEditor({ items, onChange, canEdit }: { items: { imageUrl: string; altText: string | null }[]; onChange: (v: typeof items) => void; canEdit: boolean }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-sm border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
            <img src={`/api/storage${item.imageUrl}`} alt="" className="w-full h-full object-cover" />
          </div>
          <input value={item.altText || ""} disabled={!canEdit} placeholder="Alt text" onChange={e => onChange(items.map((it, j) => j === i ? { ...it, altText: e.target.value } : it))} className={inputClass} />
          {canEdit && <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="p-2 text-slate-400 hover:text-red-600"><X size={16} /></button>}
        </div>
      ))}
      <div className="flex items-center gap-2">
        {canEdit && <ImagePickerButton onSelect={(path) => onChange([...items, { imageUrl: path, altText: null }])} label="Add Image" />}
      </div>
      {items.length === 0 && <p className="text-sm text-slate-400">No gallery images yet.</p>}
    </div>
  );
}

function FaqsEditor({ items, onChange, canEdit }: { items: { question: string; answer: string }[]; onChange: (v: typeof items) => void; canEdit: boolean }) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="border border-slate-200 rounded-sm p-3 space-y-2 bg-slate-50">
          <div className="flex items-center gap-2">
            <input value={item.question} disabled={!canEdit} placeholder="Question" onChange={e => onChange(items.map((it, j) => j === i ? { ...it, question: e.target.value } : it))} className={`${inputClass} font-bold`} />
            {canEdit && <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="p-2 text-slate-400 hover:text-red-600"><X size={16} /></button>}
          </div>
          <textarea value={item.answer} disabled={!canEdit} placeholder="Answer" rows={2} onChange={e => onChange(items.map((it, j) => j === i ? { ...it, answer: e.target.value } : it))} className={inputClass} />
        </div>
      ))}
      {canEdit && <button type="button" onClick={() => onChange([...items, { question: "", answer: "" }])} className={btnSecondaryClass}><Plus size={14} /> Add FAQ</button>}
      {items.length === 0 && <p className="text-sm text-slate-400">No FAQs yet.</p>}
    </div>
  );
}

function ConfigInputTypesEditor({ items, onChange, canEdit }: { items: { label: string; imageUrl: string | null }[]; onChange: (v: typeof items) => void; canEdit: boolean }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-sm border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
            {item.imageUrl ? <img src={`/api/storage${item.imageUrl}`} alt="" className="w-full h-full object-contain" /> : <Image size={16} className="text-slate-300" />}
          </div>
          <input value={item.label} disabled={!canEdit} placeholder="e.g. Direct Motor Input" onChange={e => onChange(items.map((it, j) => j === i ? { ...it, label: e.target.value } : it))} className={inputClass} />
          {canEdit && <ImagePickerButton onSelect={(path) => onChange(items.map((it, j) => j === i ? { ...it, imageUrl: path } : it))} label="Diagram" />}
          {canEdit && <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="p-2 text-slate-400 hover:text-red-600"><X size={16} /></button>}
        </div>
      ))}
      {canEdit && <button type="button" onClick={() => onChange([...items, { label: "", imageUrl: null }])} className={btnSecondaryClass}><Plus size={14} /> Add Input Type</button>}
      {items.length === 0 && <p className="text-sm text-slate-400">No configuration diagrams yet.</p>}
    </div>
  );
}

function ModelRangeEditor({ value, onChange, canEdit }: { value: { headers: string[]; rows: string[][] }; onChange: (v: { headers: string[]; rows: string[][] }) => void; canEdit: boolean }) {
  const { headers, rows } = value;
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Column Headers</label>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {headers.map((h, i) => (
            <div key={i} className="flex items-center gap-1">
              <input value={h} disabled={!canEdit} placeholder="e.g. Model" onChange={e => onChange({ headers: headers.map((hh, j) => j === i ? e.target.value : hh), rows })} className={`${inputClass} w-36`} />
              {canEdit && <button type="button" onClick={() => onChange({ headers: headers.filter((_, j) => j !== i), rows: rows.map(r => r.filter((_, j) => j !== i)) })} className="p-1 text-slate-400 hover:text-red-600"><X size={14} /></button>}
            </div>
          ))}
          {canEdit && <button type="button" onClick={() => onChange({ headers: [...headers, ""], rows: rows.map(r => [...r, ""]) })} className="text-xs font-bold text-[#093C71] hover:underline">+ Add column</button>}
        </div>
      </div>
      <div className="space-y-2">
        {rows.map((row, ri) => (
          <div key={ri} className="flex items-center gap-2">
            <GripVertical size={14} className="text-slate-300 shrink-0" />
            {row.map((cell, ci) => (
              <input key={ci} value={cell} disabled={!canEdit} placeholder={headers[ci] || `Col ${ci + 1}`} onChange={e => onChange({ headers, rows: rows.map((r, j) => j === ri ? r.map((c, k) => k === ci ? e.target.value : c) : r) })} className={`${inputClass} w-36`} />
            ))}
            {canEdit && <button type="button" onClick={() => onChange({ headers, rows: rows.filter((_, j) => j !== ri) })} className="p-2 text-slate-400 hover:text-red-600"><X size={16} /></button>}
          </div>
        ))}
        {canEdit && headers.length > 0 && <button type="button" onClick={() => onChange({ headers, rows: [...rows, headers.map(() => "")] })} className={btnSecondaryClass}><Plus size={14} /> Add Row</button>}
      </div>
      {headers.length === 0 && <p className="text-sm text-slate-400">Add column headers first, then rows.</p>}
    </div>
  );
}

function MountingVariantsEditor({ items, onChange, canEdit }: { items: { name: string; imageUrl: string | null; features: string[] }[]; onChange: (v: typeof items) => void; canEdit: boolean }) {
  return (
    <div className="space-y-5">
      {items.map((item, i) => (
        <div key={i} className="border border-slate-200 rounded-sm p-4 bg-slate-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-sm border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
              {item.imageUrl ? <img src={`/api/storage${item.imageUrl}`} alt="" className="w-full h-full object-cover" /> : <Image size={16} className="text-slate-300" />}
            </div>
            <input value={item.name} disabled={!canEdit} placeholder="e.g. R Foot-Mounted Reducer" onChange={e => onChange(items.map((it, j) => j === i ? { ...it, name: e.target.value } : it))} className={`${inputClass} font-bold`} />
            {canEdit && <ImagePickerButton onSelect={(path) => onChange(items.map((it, j) => j === i ? { ...it, imageUrl: path } : it))} label="Photo" />}
            {canEdit && <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="p-2 text-slate-400 hover:text-red-600 shrink-0"><Trash2 size={16} /></button>}
          </div>
          <div className="pl-2">
            <StringListEditor
              items={item.features}
              onChange={(features) => onChange(items.map((it, j) => j === i ? { ...it, features } : it))}
              canEdit={canEdit}
              placeholder="e.g. Compact foot-mounted design"
            />
          </div>
        </div>
      ))}
      {canEdit && <button type="button" onClick={() => onChange([...items, { name: "", imageUrl: null, features: [] }])} className={btnSecondaryClass}><Plus size={14} /> Add Mounting Variant</button>}
      {items.length === 0 && <p className="text-sm text-slate-400">No mounting variant bands yet.</p>}
    </div>
  );
}

function RelatedEditor({ selected, allProducts, onChange, canEdit }: { selected: number[]; allProducts: { id: number; name: string }[] | undefined; onChange: (v: number[]) => void; canEdit: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {allProducts?.map(p => {
        const active = selected.includes(p.id);
        return (
          <button
            key={p.id} type="button" disabled={!canEdit}
            onClick={() => onChange(active ? selected.filter(id => id !== p.id) : [...selected, p.id])}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${active ? "bg-[#093C71] text-white border-[#093C71]" : "bg-white text-slate-600 border-slate-300 hover:border-[#093C71]"}`}
          >
            {p.name}
          </button>
        );
      })}
      {!allProducts?.length && <p className="text-sm text-slate-400">No other products to relate yet.</p>}
    </div>
  );
}
