import { Button } from "@/components/ui/button";
import { getMountingVariantImage } from "@/components/product/MountingVariantsSection";
import { PRODUCT_CONFIGS } from "@/data/products-config";
import type { WebProductDetail } from "@workspace/api-client-react";

function storageUrl(path: string) {
  return `/api/storage${path}`;
}

interface Props {
  product: WebProductDetail;
  onContact: () => void;
}

export function MountingVariantsSectionDynamic({ product, onContact }: Props) {
  const configuredVariants = PRODUCT_CONFIGS[product.slug]?.mountingVariants ?? [];
  const configuredNames = new Set(configuredVariants.map((variant) => variant.name));
  const savedByName = new Map(product.mountingVariants.map((variant) => [variant.name, variant]));
  const variants = [
    ...configuredVariants.map((variant) => {
      const saved = savedByName.get(variant.name);
      return {
        key: saved?.id ?? variant.name,
        name: variant.name,
        features: saved?.features.length ? saved.features : variant.features,
        imageUrl: saved?.imageUrl,
      };
    }),
    ...product.mountingVariants
      .filter((variant) => !configuredNames.has(variant.name))
      .map((variant) => ({ ...variant, key: variant.id })),
  ];
  if (variants.length === 0) return null;

  return (
    <section className="bg-white">
      {variants.map((variant, i) => {
        const isEven = i % 2 === 1; // even index → image left
        const isFirst = i === 0;
        const localImage = getMountingVariantImage(product.slug, variant.name);

        const textBlock = (
          <div className="relative z-10 flex flex-col justify-center flex-1 md:max-w-md">
            <h3 className="text-[1.45rem] md:text-[1.75rem] font-heading font-bold text-primary mb-5 leading-tight">
              {variant.name}
            </h3>
            <ul className="space-y-1.5 mb-8">
              {variant.features.map((f, fi) => (
                <li key={fi} className="flex items-center gap-2 text-[13.5px] text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div>
              <Button
                onClick={onContact}
                className="bg-accent hover:bg-accent/90 text-white border-0 font-semibold px-7"
              >
                Send Requirements
              </Button>
            </div>
          </div>
        );

        const imageBlock = (
          <div className={`relative flex items-center justify-center shrink-0 min-h-[220px] md:min-h-[340px] w-full md:w-[420px] ${isFirst ? "bg-transparent" : "bg-white"}`}>
            {variant.imageUrl || localImage ? (
              <img
                src={variant.imageUrl ? storageUrl(variant.imageUrl) : localImage}
                alt={variant.name}
                className="w-full max-w-[300px] md:max-w-[420px] h-auto object-contain drop-shadow-xl"
                loading="lazy"
                decoding="async"
              />
            ) : null}
          </div>
        );

        // Image always comes first in source order so it's on top on mobile;
        // on desktop, md:order flips it back to the right for odd variants
        // to preserve the original left/right alternating layout. Both blocks
        // size to their content and sit together (with a fixed gap) inside a
        // centered max-width row, instead of stretching across two fixed 50%
        // grid columns — which left a huge dead gap whenever the text or
        // image was narrower than its half.
        // The first mounting variant gets the same light-grey backdrop with a
        // diagonal white cut at the bottom as the hero section above it, so
        // the page transitions smoothly instead of jumping straight to white.
        return (
          <div key={variant.key} className={isFirst ? "relative overflow-hidden bg-[#f0f0f0] pb-10 md:pb-14" : undefined}>
            {isFirst && (
              <div
                className="absolute inset-x-0 bottom-0 h-10 md:h-14 bg-white"
                style={{ clipPath: "polygon(0 100%, 100% 40%, 100% 100%)" }}
              />
            )}
            <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-20">
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                <div className={isEven ? "md:order-1" : "md:order-2"}>{imageBlock}</div>
                <div className={isEven ? "md:order-2" : "md:order-1"}>{textBlock}</div>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
