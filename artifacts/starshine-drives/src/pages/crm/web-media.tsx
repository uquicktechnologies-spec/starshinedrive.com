import { useRef, useState } from "react";
import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  useListWebMedia, getListWebMediaQueryKey, useCreateWebMedia, useDeleteWebMedia,
} from "@workspace/api-client-react";
import type { MediaLibraryItem } from "@workspace/api-client-react";
import { ObjectUploader } from "@workspace/object-storage-web";
import { LoadError, btnAccentClass, cardClass, ZoomableImage, LoadingState, EmptyState, Pagination, paginate } from "./shared";
import { ImagePlus, Trash2, Images } from "lucide-react";

/** Standalone image library: upload images once here, then reuse them anywhere
 * a product needs an image (gallery, applications, config diagrams, mounting variants)
 * without re-uploading the same file every time. */
export function WebMedia({ canEdit }: { canEdit: boolean }) {
  const { data: items, isLoading, error, refetch } = useListWebMedia({ query: { queryKey: getListWebMediaQueryKey(), placeholderData: keepPreviousData } });
  const createMutation = useCreateWebMedia();
  const deleteMutation = useDeleteWebMedia();
  const queryClient = useQueryClient();
  const [flashMsg, setFlashMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const pendingByFileId = useRef<Map<string, string>>(new Map());
  const [page, setPage] = useState(1);
  const IMAGES_PER_PAGE = 18;
  const pagedItems = paginate(items, page, IMAGES_PER_PAGE);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListWebMediaQueryKey() });
  const flash = (msg: string) => { setFlashMsg(msg); setTimeout(() => setFlashMsg(null), 2000); };

  if (isLoading) return <LoadingState label="Loading media library..." />;
  if (error) return <LoadError error={error} onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-[#093C71] flex items-center gap-3">
            <Images size={28} className="text-[#EF6F24]" /> Image Library
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Upload images here once, then pick them when editing any product's gallery, applications, or diagrams.
          </p>
        </div>
        {flashMsg && <span className="text-sm font-semibold text-emerald-600">{flashMsg}</span>}
      </div>

      {canEdit && (
        <div className={`${cardClass} p-6 flex items-center justify-between gap-4`}>
          <div>
            <p className="text-sm font-bold text-slate-700">Upload new images</p>
            <p className="text-xs text-slate-500 mt-0.5">JPG, PNG or WebP, up to 5MB each. Upload as many as you need.</p>
          </div>
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
              const successful = result.successful ?? [];
              if (!successful.length) return;
              setUploading(true);
              try {
                for (const f of successful) {
                  const objectPath = pendingByFileId.current.get(f.id);
                  pendingByFileId.current.delete(f.id);
                  if (!objectPath) continue;
                  await createMutation.mutateAsync({ data: { imageUrl: objectPath, fileName: f.name ?? undefined } });
                }
                invalidate();
                flash(successful.length > 1 ? `${successful.length} images uploaded` : "Image uploaded");
              } finally {
                setUploading(false);
              }
            }}
            maxFileSize={5 * 1024 * 1024}
            maxNumberOfFiles={20}
            buttonClassName={btnAccentClass}
          >
            <ImagePlus size={16} /> {uploading ? "Removing background…" : "Upload Images"}
          </ObjectUploader>
        </div>
      )}

      {!items?.length ? (
        <div className={cardClass}>
          <EmptyState message="No records found" />
        </div>
      ) : (
        <div className={cardClass}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
          {pagedItems.map((item) => (
            <div key={item.id} className={`${cardClass} group relative`}>
              <div className="aspect-square bg-slate-50 overflow-hidden">
                <ZoomableImage src={`/api/storage${item.imageUrl}`} alt={item.altText || item.fileName || ""} className="w-full h-full object-cover" />
              </div>
              <div className="p-2 space-y-0.5">
                {item.fileName && <p className="text-[10px] text-slate-500 truncate" title={item.fileName}>{item.fileName}</p>}
                {item.altText && <p className="text-[10px] text-slate-400 truncate" title={item.altText}>{item.altText}</p>}
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    if (!confirm("Remove this image from the library? Products that already use it will keep showing it.")) return;
                    deleteMutation.mutate({ id: item.id }, { onSuccess: () => { invalidate(); flash("Removed"); } });
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-slate-500 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity shadow-sm"
                  title="Remove from library"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        <Pagination page={page} onPageChange={setPage} totalItems={items?.length ?? 0} pageSize={IMAGES_PER_PAGE} />
        </div>
      )}
    </div>
  );
}
