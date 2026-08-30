import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { keepPreviousData, type UseQueryOptions } from "@tanstack/react-query";
import { Search, X, ImagePlus, Images, Loader2, Inbox, ShieldOff, RotateCw } from "lucide-react";
import { useListWebMedia, useCreateWebMedia, getListWebMediaQueryKey } from "@workspace/api-client-react";
import type { MediaLibraryItem } from "@workspace/api-client-react";
import { ObjectUploader } from "@workspace/object-storage-web";

/**
 * Standardized CRM screen states (Phase 8). Every list/detail page should use these
 * instead of ad-hoc "Loading...", "No X found", or bespoke error markup, so the same
 * data/empty/denied/error/slow-loading behavior shows up everywhere:
 *
 *   - Data available          -> render the records as normal.
 *   - No data                 -> <EmptyState /> / <EmptyRow /> ("No records found" + optional action).
 *   - Permission denied (403) -> <PermissionDenied /> ("You don't have permission to access this section.").
 *   - API/server error        -> <LoadError /> ("Unable to load data." + Retry).
 *   - Slow API                -> <LoadingState /> / <LoadingRow /> show a spinner immediately, then a
 *     "taking longer than expected" hint + manual retry after a timeout, instead of spinning forever.
 */
const SLOW_LOADING_MS = 10_000;

function useSlowLoading(): boolean {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    setSlow(false);
    const t = setTimeout(() => setSlow(true), SLOW_LOADING_MS);
    return () => clearTimeout(t);
  }, []);
  return slow;
}

/** Block-level loading indicator for card/page bodies. Never spins forever -- after
 *  `SLOW_LOADING_MS` it offers a manual reload so the user isn't stuck watching a spinner. */
export function LoadingState({ label = "Loading..." }: { label?: string }) {
  const slow = useSlowLoading();
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <Loader2 size={22} className="animate-spin text-slate-400" />
      <p className="text-sm font-medium text-slate-500">{label}</p>
      {slow && (
        <p className="text-xs text-slate-400 max-w-xs">
          This is taking longer than expected.{" "}
          <button type="button" onClick={() => window.location.reload()} className="font-semibold text-[#093C71] underline underline-offset-2 cursor-pointer">
            Reload the page
          </button>
        </p>
      )}
    </div>
  );
}

/** Same as `LoadingState`, but as a `<tr>` for use inside a table `<tbody>`. */
export function LoadingRow({ colSpan, label = "Loading..." }: { colSpan: number; label?: string }) {
  const slow = useSlowLoading();
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-10 text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <Loader2 size={18} className="animate-spin text-slate-400" />
          <span className="text-sm font-medium text-slate-500">{label}</span>
          {slow && (
            <span className="text-xs text-slate-400">
              Taking longer than expected.{" "}
              <button type="button" onClick={() => window.location.reload()} className="font-semibold text-[#093C71] underline underline-offset-2 cursor-pointer">
                Reload
              </button>
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}

/** Block-level "no data" state for card/page bodies, with an optional call-to-action. */
export function EmptyState({ message = "No records found", actionLabel, onAction }: { message?: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <Inbox size={26} className="text-slate-300" />
      <p className="text-sm font-medium text-slate-500">{message}</p>
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className={btnPrimaryClass}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/** Same as `EmptyState`, but as a `<tr>` for use inside a table `<tbody>`. */
export function EmptyRow({ colSpan, message = "No records found", actionLabel, onAction }: { colSpan: number; message?: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-10 text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <Inbox size={20} className="text-slate-300" />
          <span className="text-sm font-medium text-slate-500">{message}</span>
          {actionLabel && onAction && (
            <button type="button" onClick={onAction} className={`${btnPrimaryClass} mt-1`}>
              {actionLabel}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

/** Simple client-side "10 rows per page" pager used by list tables. Slice your already-filtered
 *  array with `paginate(rows, page, pageSize)` and render `<Pagination />` below the table;
 *  it resets to page 1 automatically via the `page`/`onPageChange` you own in the parent. */
export const DEFAULT_PAGE_SIZE = 10;

export function paginate<T>(rows: T[] | undefined, page: number, pageSize: number = DEFAULT_PAGE_SIZE): T[] {
  if (!rows) return [];
  const start = (page - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

export function Pagination({
  page,
  onPageChange,
  totalItems,
  pageSize = DEFAULT_PAGE_SIZE,
}: {
  page: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize?: number;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalItems === 0) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(totalItems, page * pageSize);
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50 text-sm">
      <span className="font-medium text-slate-500">
        Showing {start}–{end} of {totalItems}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-1.5 rounded-sm border border-slate-300 bg-white font-semibold text-slate-600 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-100"
        >
          Prev
        </button>
        <span className="px-3 font-semibold text-slate-700">{page} / {totalPages}</span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-1.5 rounded-sm border border-slate-300 bg-white font-semibold text-slate-600 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-100"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/** Shown in place of a whole section/page when the signed-in staff member's role doesn't
 *  grant `view` on that module. The backend independently enforces the same check on every
 *  request -- this only avoids presenting a blank page or a confusing error for a request
 *  the UI never should have let the user reach. */
export function PermissionDenied() {
  return (
    <section className="rounded-sm bg-white p-10 shadow-sm border border-slate-200 flex flex-col items-center text-center gap-3">
      <ShieldOff size={26} className="text-slate-300" />
      <p className="text-sm font-semibold text-slate-600">You don't have permission to access this section.</p>
    </section>
  );
}

export function LoadError({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const status = (error as { status?: number } | null)?.status;
  const denied = status === 401 || status === 403;
  return (
    <section className="rounded-sm bg-white p-10 shadow-sm border border-red-200 flex flex-col items-center text-center gap-3">
      {denied ? <ShieldOff size={26} className="text-red-300" /> : <RotateCw size={26} className="text-red-300" />}
      <p className="text-sm font-semibold text-red-700">
        {denied ? "You don't have permission to access this section." : "Unable to load data."}
      </p>
      {!denied && (
        <button type="button" onClick={onRetry ?? (() => window.location.reload())} className={btnSecondaryClass}>
          <RotateCw size={14} /> Retry
        </button>
      )}
    </section>
  );
}

export const inputClass = "w-full rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-[#EF6F24] focus:ring-1 focus:ring-[#EF6F24]/20 disabled:bg-slate-50 disabled:text-slate-500 shadow-sm";
export const labelClass = "mb-1.5 block text-[11px] font-bold text-slate-600 uppercase tracking-wider";
export const btnPrimaryClass = "inline-flex items-center justify-center gap-2 rounded-sm bg-[#093C71] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#072d55] disabled:opacity-50 disabled:pointer-events-none shadow-sm cursor-pointer";
export const btnSecondaryClass = "inline-flex items-center justify-center gap-2 rounded-sm border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none shadow-sm cursor-pointer";
export const btnAccentClass = "inline-flex items-center justify-center gap-2 rounded-sm bg-[#EF6F24] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#d65e1b] disabled:opacity-50 disabled:pointer-events-none shadow-sm cursor-pointer";
export const cardClass = "rounded-sm border border-slate-200 bg-white shadow-sm overflow-hidden";

/** A small product/image thumbnail that opens a full-size preview in a modal when clicked. */
export function ZoomableImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <img
        src={src}
        alt={alt}
        onClick={() => setOpen(true)}
        className={`cursor-zoom-in ${className || ""}`}
      />
      {open && createPortal(
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6"
          onClick={() => setOpen(false)}
        >
          <div className="relative max-w-3xl max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-slate-700 shadow-md flex items-center justify-center hover:text-red-600"
              aria-label="Close"
            >
              <X size={16} />
            </button>
            <img src={src} alt={alt} className="max-w-full max-h-[85vh] rounded-sm shadow-2xl object-contain bg-white" />
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

/**
 * Image picker used everywhere the CRM lets staff attach an image (product
 * photos, gallery images, mounting-variant diagrams, company logo, etc).
 * Opens a modal with two tabs: "Image Gallery" to reuse a previously
 * uploaded image (from `web_media_library`) without re-uploading it, and
 * "Upload" to add a brand-new file — which is also saved into the gallery
 * so it becomes available for reuse next time.
 */
export function ImagePickerButton({ onSelect, label }: { onSelect: (path: string) => void; label: string }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"gallery" | "upload">("gallery");
  const { data: items, isLoading } = useListWebMedia({
    query: { queryKey: getListWebMediaQueryKey(), enabled: open, placeholderData: keepPreviousData } as UseQueryOptions<MediaLibraryItem[]>,
  });
  const createMutation = useCreateWebMedia();
  const pendingByFileId = useRef<Map<string, string>>(new Map());

  const tabBtn = (active: boolean) =>
    `flex-1 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${active ? "border-[#EF6F24] text-[#093C71]" : "border-transparent text-slate-500 hover:text-slate-700"}`;

  return (
    <>
      <button type="button" onClick={() => { setTab("gallery"); setOpen(true); }} className={btnSecondaryClass}>
        <ImagePlus size={14} /> {label}
      </button>
      {open && createPortal(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-sm shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Images size={18} className="text-[#EF6F24]" /> Select Image</h3>
              <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-red-600"><X size={18} /></button>
            </div>
            <div className="flex border-b border-slate-200 shrink-0">
              <button type="button" onClick={() => setTab("gallery")} className={tabBtn(tab === "gallery")}>Image Gallery</button>
              <button type="button" onClick={() => setTab("upload")} className={tabBtn(tab === "upload")}>Upload</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {tab === "gallery" ? (
                isLoading ? (
                  <p className="text-sm text-slate-500 text-center py-8">Loading…</p>
                ) : !items?.length ? (
                  <p className="text-sm text-slate-400 text-center py-8">No images in the gallery yet. Switch to "Upload" to add your first one.</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => { onSelect(item.imageUrl); setOpen(false); }}
                        title={item.fileName || undefined}
                        className="aspect-square rounded-sm border border-slate-200 overflow-hidden bg-slate-50 hover:border-[#EF6F24] hover:ring-2 hover:ring-[#EF6F24]/30 transition-all"
                      >
                        <img src={`/api/storage${item.imageUrl}`} alt={item.altText || item.fileName || ""} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-10">
                  <ImagePlus size={32} className="text-slate-300" />
                  <p className="text-sm text-slate-500 text-center max-w-xs">
                    Upload a new image (JPG, PNG or WebP, up to 5MB). It's saved to your Image Gallery so you can reuse it later.
                  </p>
                  <ObjectUploader
                    onGetUploadParameters={async (file) => {
                      const res = await fetch("/api/storage/uploads/request-url", {
                        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
                      });
                      if (!res.ok) throw new Error("Failed to get upload URL");
                      const { uploadURL, objectPath } = await res.json();
                      pendingByFileId.current.set(file.id, objectPath);
                      return { method: "PUT" as const, url: uploadURL, headers: { "Content-Type": file.type } };
                    }}
                    onComplete={async (result) => {
                      const f = result.successful?.[0];
                      if (!f) return;
                      const objectPath = pendingByFileId.current.get(f.id);
                      pendingByFileId.current.delete(f.id);
                      if (!objectPath) return;
                      createMutation.mutate({ data: { imageUrl: objectPath, fileName: f.name ?? undefined } });
                      onSelect(objectPath);
                      setOpen(false);
                    }}
                    maxFileSize={5 * 1024 * 1024}
                    buttonClassName={btnAccentClass}
                  >
                    Choose File
                  </ObjectUploader>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

interface ProductLike {
  id: number;
  productName: string;
  productCode?: string | null;
  unitPrice: number;
  gstPercent: number;
}

/**
 * Autocomplete input for picking a product on Quotations/Purchases/Sales item rows.
 *
 * The suggestion list is rendered through a portal into `document.body` and positioned
 * with fixed coordinates from the input's bounding rect, instead of being an absolutely
 * positioned child of the row. Item rows live inside a horizontally-scrolling table
 * wrapper (`overflow-x-auto`); per the CSS overflow spec, setting only `overflow-x` forces
 * the browser to also compute `overflow-y` as `auto`, which was silently clipping the
 * dropdown for rows near the bottom of the table -- looking like "search shows no data".
 * Also supports Up/Down arrow keys + Enter to pick a suggestion without the mouse.
 */
export function ProductSearchInput<P extends ProductLike>({
  value, products, onSelect, onChangeText, placeholder = "Search product...",
}: {
  value: string;
  products: P[] | undefined;
  onSelect: (product: P) => void;
  onChangeText: (text: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const matches = (products || []).filter(p => p.productName.toLowerCase().includes(value.toLowerCase())).slice(0, 20);

  useEffect(() => { setHighlight(0); }, [value, open]);

  useEffect(() => {
    if (!open) return;
    const updateRect = () => {
      const el = inputRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect({ top: r.bottom + window.scrollY, left: r.left + window.scrollX, width: r.width });
    };
    updateRect();
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [open]);

  const select = (p: P) => { onSelect(p); setOpen(false); };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || matches.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlight(h => Math.min(h + 1, matches.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); select(matches[highlight]!); }
    else if (e.key === "Escape") { setOpen(false); }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          required
          value={value}
          onChange={e => { onChangeText(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          onBlur={() => { blurTimer.current = setTimeout(() => setOpen(false), 150); }}
          placeholder={placeholder}
          className={`${inputClass} pl-8 font-bold`}
        />
      </div>
      {open && matches.length > 0 && rect && createPortal(
        <div
          style={{ position: "absolute", top: rect.top, left: rect.left, width: rect.width }}
          className="z-50 mt-1 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-sm shadow-lg"
          onMouseDown={() => { if (blurTimer.current) clearTimeout(blurTimer.current); }}
        >
          {matches.map((p, i) => (
            <button
              type="button"
              key={p.id}
              onMouseEnter={() => setHighlight(i)}
              // Select on mousedown (with preventDefault) instead of click: a
              // click fires after the input's blur has already closed this
              // list, so the button would be unmounted before the click ever
              // lands. preventDefault stops the input from blurring at all.
              onMouseDown={e => { e.preventDefault(); select(p); }}
              className={`w-full text-left px-3 py-2 text-sm border-b border-slate-100 last:border-b-0 ${i === highlight ? "bg-slate-50" : "hover:bg-slate-50"}`}
            >
              <div className="font-bold text-slate-800">{p.productName}</div>
              <div className="text-[11px] text-slate-500">{p.productCode ? `${p.productCode} · ` : ""}₹{p.unitPrice} · GST {p.gstPercent}%</div>
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

/** Splits "QTN-000001" into ["QTN-", "000001"] for two-line display. Falls back to [value, ""] if no trailing number. */
/** Formats an ISO/`yyyy-mm-dd` date string for display as dd/mm/yyyy. Non-date-shaped input is returned unchanged. */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("T")[0].split("-");
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
}

export function splitQuotationNumber(value: string): [string, string] {
  const match = value.match(/^(.*?-)(\d+)$/);
  return match ? [match[1], match[2]] : [value, ""];
}

// Tracks in-flight download/PDF keys so a double-click (or an impatient
// re-click before the first request resolves) doesn't fire a second,
// redundant request for the same file.
const inFlightDownloads = new Set<string>();

/**
 * Runs `fn` only if no download for `key` is already in flight. Use this to
 * wrap manual (non-React-Query) fetch-and-open/download helpers, which have
 * no built-in de-duping.
 */
export async function guardedDownload(key: string, fn: () => Promise<void>): Promise<void> {
  if (inFlightDownloads.has(key)) return;
  inFlightDownloads.add(key);
  try {
    await fn();
  } finally {
    inFlightDownloads.delete(key);
  }
}

/**
 * Opens a quotation PDF in a new tab via an authenticated fetch instead of a
 * plain <a href> navigation. Direct top-level navigations to the API don't
 * reliably carry the Clerk dev-instance session in this environment, so we
 * fetch with credentials (same as the rest of the app's API calls) and hand
 * the browser a blob URL instead.
 */
export async function openQuotationPdf(quotationId: number): Promise<void> {
  return guardedDownload(`quotation-pdf-${quotationId}`, async () => {
    try {
      const res = await fetch(`/api/crm/quotations/${quotationId}/pdf`, { credentials: "include" });
      if (!res.ok) {
        alert("Unable to load data. Please try again.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      alert("Unable to load data. Please try again.");
    }
  });
}

/**
 * Shared implementation for the purchase/sale "download doc PDF" buttons
 * (previously duplicated separately in purchases.tsx and sales.tsx).
 * De-duped via `guardedDownload` keyed by URL.
 */
export async function openDocPdf(url: string): Promise<void> {
  return guardedDownload(url, async () => {
    try {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) { alert("Unable to load data. Please try again."); return; }
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      window.open(objUrl, "_blank");
      setTimeout(() => URL.revokeObjectURL(objUrl), 60_000);
    } catch {
      alert("Unable to load data. Please try again.");
    }
  });
}
