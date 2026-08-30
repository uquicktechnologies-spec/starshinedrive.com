---
name: CRM generated-client type drift (pre-existing)
description: Many CRM pages fail `tsc --noEmit` because generated response types (e.g. ListCategories200, GetCrmDashboard200) don't match the flat-array/flat-object shape the page code expects, even though the actual runtime response and the underlying generated fetch function (e.g. `listCategories(): Promise<Category[]>`) are correct.
---

Affected files (as of Aug 2026): dashboard.tsx, customers.tsx, leads.tsx, products.tsx, quotation-form.tsx, email-integration.tsx, email-marketing.tsx, master-data.tsx (sub-groups/suppliers/warehouses tabs), use-permissions.ts.

**Why:** predates any single session's changes — confirmed present at a clean baseline commit before an abandoned envelope/pagination migration (task cancelled) ever touched these files. The generated hook's `TData` default type resolves to a `<Operation>200` name that doesn't match the actual `Promise<T>` the underlying fetch function returns; root cause not fully diagnosed (looked like an orval naming/export issue similar to the `GetStockHistoryParams` collision, but on the response-type side).

**How to apply:** Runtime is unaffected (Vite dev server doesn't run full `tsc`, so the app works fine in the browser) — don't treat these errors as new regressions from your own edits. Before touching one of these files, run `tsc --noEmit` scoped to just that file/feature to confirm you haven't introduced *new* errors, but don't feel obligated to fix this pre-existing, wide drift unless the user asks for it specifically — it's a separate, larger cleanup.
