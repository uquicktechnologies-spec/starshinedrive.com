import { Link } from "wouter";
import { ArrowRight, PackageSearch } from "lucide-react";
import { useListPublicWebProducts } from "@workspace/api-client-react";
import type { WebProductSummary } from "@workspace/api-client-react";

function storageUrl(path: string) {
  return `/api/storage${path}`;
}

export function ProductsSection() {
  const { data: products, isLoading } = useListPublicWebProducts<WebProductSummary[]>();
  const featured = (products ?? []).slice(0, 10);

  return (
    <section className="py-14 bg-white">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary">
            Product Portfolio
          </h2>
          <p className="mt-2 text-gray-500 text-sm md:text-base max-w-xl mx-auto">
            Helical, bevel, worm, planetary &amp; cycloidal gear reducers — engineered for every industrial application.
          </p>
        </div>

        {/* Card grid */}
        {!isLoading && featured.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {featured.map((product) => (
              <Link key={product.slug} href={`/products/${product.slug}`}>
                <div className="group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full">
                  {/* Image */}
                  <div className="relative bg-white overflow-hidden flex items-center justify-center p-4" style={{ aspectRatio: "4/3" }}>
                    {product.mainImageUrl ? (
                      <img
                        src={storageUrl(product.mainImageUrl)}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <PackageSearch className="w-8 h-8 text-gray-300" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="px-5 pt-1 pb-5 flex flex-col flex-1">
                    {(product.categoryName || product.series) && (
                      <span className="text-accent text-[11px] font-bold uppercase tracking-wider mb-2">
                        {product.categoryName ?? product.series}
                      </span>
                    )}
                    <h3 className="font-heading font-bold text-primary text-base leading-snug mb-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-5 flex-1">
                      {product.tagline ?? ""}
                    </p>
                    <span className="w-full bg-primary group-hover:bg-primary/90 text-white text-sm font-semibold py-3 rounded-sm flex items-center justify-center gap-2 transition-colors">
                      View Details <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* View all CTA */}
        <div className="text-center mt-8">
          <Link href="/products">
            <button className="inline-flex items-center gap-2 bg-primary text-white font-semibold text-sm px-6 py-3 hover:bg-primary/90 transition-colors">
              View Full Product Catalogue <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
