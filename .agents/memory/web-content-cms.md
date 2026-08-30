---
name: Website product/category CMS (webContent schema)
description: Dynamic marketing-content system for Starshine Drive products/categories, separate from the legacy static data and from the stock/inventory tables.
---

Starshine Drive has **two unrelated "product" concepts** that must not be confused:

1. **Stock/inventory products** (`crm.ts`: `productsTable`, `categoriesTable`) — used for quotations/purchases/sales, HSN/GST/stock tracking. Admin UI: `crm/products.tsx`, `crm/stock/master-data.tsx`.
2. **Website marketing-content products** (`webContent.ts`: `webProductsTable`, `webCategoriesTable`, plus child tables for key-range bullets, spec groups/specs, features, applications, images, FAQs, and a manual related-products override) — used for the public product detail/listing pages. Admin UI: `crm/web-products.tsx` (nav: "Website Products" under the Product section).

**Why two systems:** the pre-existing public site (`products.ts`, `products-config.ts`, `product-detail.tsx`, `products.tsx`) is a live, SEO-indexed marketing site with heavily hand-tuned per-product copy and an explicit regression-protection task guarding it. Rather than risk breaking it, the CMS was built as a new, additive system for *new* products going forward; migrating the ~12 existing hand-tuned pages into it is an explicit, separate, carefully-verified follow-up — not done as part of building the CMS.

**API shape decision:** child collections (key range, spec groups, features, applications, images, FAQs, related products) use whole-collection `PUT .../{id}/{subresource}` "replace" endpoints rather than granular per-row CRUD, to keep the API and admin form surface manageable. The admin editor mirrors this: each section has its own "Save Section" button that calls just that section's replace endpoint.

**Status as of Aug 2026:** backend, admin UI, and the public-facing product detail page are all wired and verified end-to-end. `/products/:slug` first checks the legacy static data (`getProductBySlug`); if not found there, it renders `pages/product-detail-dynamic.tsx`, which fetches `GET /web/products/:slug` and mirrors the legacy page's exact visual layout (hero, tabbed datasheet, mounting-variant bands, description, applications, related products) via CMS-specific components (`TechnicalDatasheetDynamic`, `MountingVariantsSectionDynamic`). Legacy-data migration and a public category-listing equivalent are still open.

**Full layout parity required extending the schema** beyond the original CRUD-first CMS: `webProductConfigInputTypesTable` (per-row image), `webProductMountingVariantsTable`+`webProductMountingVariantFeaturesTable`, `webProductModelRangeRowsTable` + `modelRangeHeaders` array column on the product. Unlike the legacy static site's hardcoded label→image lookup maps, each CMS row carries its own `imageUrl` directly — simpler, but means an admin-uploaded image is required per row for full visual parity.

**Gotcha:** after regenerating the OpenAPI spec/zod schemas and editing `api-server` routes, a stale `tsx watch` process can keep serving old route code (e.g. silently omitting newly-added response fields) even though file edits look picked up — if new fields are mysteriously missing from an API response, restart the API server workflow before debugging further.

**Image Library (Aug 2026):** a separate `web_media_library` table + `/crm/web-media` routes let staff upload an image once (CRM sidebar page `web-media.tsx`) and reuse it across any product editor field via a `LibraryPickerButton` placed next to the existing `ImageUploadButton` (gallery, applications, config diagrams, mounting variants, main/description images) — avoids re-uploading the same photo per field/product.

**Codegen gotcha:** orval's zod client names request-body schemas after the operationId (e.g. `createWebMedia` → `CreateWebMediaBody`), not after the OpenAPI component schema `$ref` name — don't assume the zod export matches the ref name in `openapi.yaml`. Also, after editing `lib/db`, `lib/api-zod`, or `lib/api-client-react`, run `pnpm exec tsc --build --force` inside that package (not just the consuming app) before trusting a `tsc --noEmit` failure downstream — stale composite build output can report false "no exported member" errors.
