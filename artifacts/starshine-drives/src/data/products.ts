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

export const PRODUCTS: Product[] = [
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getRelatedProducts(slugs: string[]): Product[] {
  return slugs.map((s) => getProductBySlug(s)).filter(Boolean) as Product[];
}
