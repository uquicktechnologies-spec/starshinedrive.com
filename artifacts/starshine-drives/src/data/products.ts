export type TechSpec = { label: string; value: string };
export type DatasheetRow = { size: string; ratio: string; outputTorque: string; outputSpeed: string; power: string };
export type SpecRow = { item: string; data: string };

export interface Product {
  slug: string;
  name: string;
  series: string;
  tagline: string;
  description: string;
  image: string;
  keyRange: string[];
  features: string[];
  applications: string[];
  techSpecs: TechSpec[];
  datasheets: DatasheetRow[];
  relatedSlugs: string[];
  specifications: SpecRow[];
  modelRangeHeaders: string[];
  modelRange: string[][];
  docUrl?: string;
  descriptionImage?: string;
  descriptionTitle?: string;
  descriptionFeatures?: string[];
}

const RFKS_MANUAL_URL =
  "https://starshinedrives.com/wp-content/uploads/2026/05/rfks-series-gear-speed-reducer-manual-2024.pdf";
const RV_MANUAL_URL =
  "https://starshinedrives.com/wp-content/uploads/2026/05/rv-series-worm-gear-reducer-2025.pdf";

export const PRODUCT_DOCUMENT_URLS: Readonly<Record<string, string>> = {
  "r-series-helical-gear-reducer": RFKS_MANUAL_URL,
  "f-series-parallel-shaft-helical-gear-reducer": RFKS_MANUAL_URL,
  "k-series-helical-bevel-gear-reducer": RFKS_MANUAL_URL,
  "s-series-helical-worm-gear-reducer": RFKS_MANUAL_URL,
  "nmrv-worm-gear-reducers": RV_MANUAL_URL,
  "rv-cast-iron-worm-gear-reducer": RV_MANUAL_URL,
  "compact-geared-motors":
    "https://starshinedrives.com/wp-content/uploads/2026/05/ncj-series-gear-speed-reducer-2024.pdf",
  "sck-helical-hypoid-gear-unit":
    "https://starshinedrives.com/wp-content/uploads/2026/05/sck-series-helical-hypoid-gear-units-2025.pdf",
  "sp-precision-planetary-gearbox":
    "https://starshinedrives.com/wp-content/uploads/2026/05/sp-series-precision-planetary-2025.pdf",
  "cycloidal-gear-reducer":
    "https://starshinedrives.com/wp-content/uploads/2026/05/starshine-product-catalogue-english-2026.pdf",
};

export function getProductDocumentUrl(slug: string): string | undefined {
  return PRODUCT_DOCUMENT_URLS[slug];
}

export const PRODUCTS: Product[] = [
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getRelatedProducts(slugs: string[]): Product[] {
  return slugs.map((s) => getProductBySlug(s)).filter(Boolean) as Product[];
}
