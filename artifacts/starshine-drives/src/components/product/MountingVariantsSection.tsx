import { Button } from "@/components/ui/button";
import { PRODUCT_CONFIGS } from "@/data/products-config";
import type { Product } from "@/data/products";

/* ── Per-product variant images (static Vite imports) ────────── */
import rFoot         from "@assets/r-series-helical-gear-reducer_1785677909394.webp";
import rFlange       from "@assets/rf-series-helical-gear-reducer_1785679341594.webp";
import rShaft        from "@assets/R-series-with-Shaft-Input_1785678002515.webp";
import fParallel     from "@assets/f-series-parallel-shaft-helical-gear-reducer_1785680408884.webp";
import kHelical      from "@assets/k-series-helical-bevel-gear-reducer_1785681786890.webp";
import sHelicalWorm  from "@assets/s-series-helical-worm-gear-reducer_1785737608015.webp";
import nmrvMain      from "@assets/nmrv-worm-gear-reducers_1785682736651.webp";
import nmrvDouble    from "@assets/Double-Stage-NMRV-Reducer_1785682757708.webp";
import nmrvSpecial   from "@assets/NMRV-Special-Input-Configuration_1785682785736.webp";
import rvFlange      from "@assets/NRV-Special-Input-Configuration_1785682778082.webp";
import compactMotor  from "@assets/starshine-compact-geared-motor.webp";
import sckHypoid     from "@assets/starshine-sck-helical-hypoid-gear-unit_1785673517738.webp";
import spPlanetary   from "@assets/starshine-sp-precision-planetary-gearbox.webp";
import cycloidal     from "@assets/generated_images/prod-cycloidal.webp";

const VARIANT_IMAGES: Record<string, Record<string, string>> = {
  "r-series-helical-gear-reducer": {
    "R Foot-Mounted Reducer": rFoot,
    "RF Flange-Mounted Reducer": rFlange,
    "RS Shaft-Mounted Reducer": rShaft,
  },
  "k-series-helical-bevel-gear-reducer": {
    "K Series Helical-Bevel Reducer": kHelical,
  },
  "f-series-parallel-shaft-helical-gear-reducer": {
    "F Series Parallel-Shaft Helical Gear Reducer": fParallel,
  },
  "s-series-helical-worm-gear-reducer": {
    "S Series Helical-Worm Reducer": sHelicalWorm,
    "S Flange-Mounted Reducer": sHelicalWorm,
  },
  "nmrv-worm-gear-reducers": {
    "NMRV Worm Gear Reducer": nmrvMain,
    "Double-Stage NMRV Reducer": nmrvDouble,
    "NRV Shaft-Input Worm Reducer": nmrvSpecial,
  },
  "rv-cast-iron-worm-gear-reducer": {
    "RV Foot-Mounted": nmrvMain,
    "RV Flange-Mounted": rvFlange,
  },
  "compact-geared-motors": {
    "Inline Geared Motor": compactMotor,
    "Right-Angle Geared Motor": compactMotor,
  },
  "sck-helical-hypoid-gear-unit": {
    "HB Foot-Mounted Unit": sckHypoid,
    "HB Flange-Mounted Unit": sckHypoid,
  },
  "sp-precision-planetary-gearbox": {
    "PL Inline Planetary": spPlanetary,
    "PL Right-Angle Planetary": spPlanetary,
  },
  "cycloidal-gear-reducer": {
    "X Series Single-Stage": cycloidal,
    "X Series Double-Stage": cycloidal,
  },
};

export function getMountingVariantImage(slug: string, variantName: string) {
  return VARIANT_IMAGES[slug]?.[variantName];
}

interface Props {
  product: Product;
  onContact: () => void;
}

export function MountingVariantsSection({ product, onContact }: Props) {
  const config    = PRODUCT_CONFIGS[product.slug];
  const variants  = config?.mountingVariants ?? [];

  if (variants.length === 0) return null;

  return (
    <section className="bg-white">
      {variants.map((variant, i) => {
        const isEven  = i % 2 === 1;          // even index → image left
        const imgSrc  = getMountingVariantImage(product.slug, variant.name);

        const textBlock = (
          <div className="relative z-10 flex flex-col justify-center px-6 md:px-14 py-8 md:py-[143px]">
            <h3 className="text-[1.45rem] md:text-[1.75rem] font-heading font-bold text-primary mb-5 leading-tight">
              {variant.name}
            </h3>
            <ul className="space-y-1.5 mb-8">
              {variant.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-[13.5px] text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div>
              <Button
                onClick={onContact}
                className="bg-primary hover:bg-primary/90 text-white border-0 font-semibold px-7"
              >
                Send Requirements
              </Button>
            </div>
          </div>
        );

        const imageBlock = (
          <div className="relative flex items-center justify-center py-8 md:py-0 md:min-h-[608px]">
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={variant.name}
                className="w-full max-w-[220px] md:max-w-[480px] h-auto object-contain drop-shadow-xl"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="w-64 h-48 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm">
                {variant.name}
              </div>
            )}
          </div>
        );

        return (
          <div key={variant.name} className="relative overflow-hidden border-b border-gray-100 last:border-0">
            {/* Diagonal background split */}
            {!isEven ? (
              <>
                <div className="absolute inset-0 bg-white md:bg-[#f5f5f5]" />
                <div
                  className="absolute inset-0 bg-white hidden md:block"
                  style={{ clipPath: "polygon(53% 0, 100% 0, 100% 100%, 67% 100%)" }}
                />
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-white" />
                <div
                  className="absolute inset-0 bg-[#f5f5f5] hidden md:block"
                  style={{ clipPath: "polygon(53% 0, 100% 0, 100% 100%, 47% 100%)" }}
                />
              </>
            )}

            <div className="relative max-w-6xl mx-auto px-4 md:px-8">
              <div className={`grid grid-cols-1 md:grid-cols-2 items-center ${isEven ? "md:[direction:rtl]" : ""}`}>
                <div className={`order-2 md:order-none ${isEven ? "md:[direction:ltr]" : ""}`}>{textBlock}</div>
                <div className={`order-1 md:order-none ${isEven ? "md:[direction:ltr]" : ""}`}>{imageBlock}</div>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
