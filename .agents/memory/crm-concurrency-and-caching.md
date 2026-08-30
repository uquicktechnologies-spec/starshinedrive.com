---
name: CRM concurrency & caching decisions (Phase 9)
description: Numbering race-condition fix pattern and React Query defaults chosen for the Starshine Drive CRM.
---

## Document-number generation must share a transaction with the insert
Quotation/purchase/sale number generation (`nextQuotationNumber` in `crm.ts`, `nextDocNumber` in `stock.ts`) originally ran in its own transaction (or no transaction) *before* the row insert. Under concurrent requests this let two callers compute the same "next" number before either committed, causing a duplicate-key failure on insert.

**Fix pattern:** number generation must run *inside the same transaction* as the insert, and must take a lock that's held until that transaction commits:
- Quotations: `SELECT ... FOR UPDATE` on the singleton `sellerSettingsTable` row.
- Purchases/sales (no counter row): `pg_advisory_xact_lock(hashtext(prefix))` at the top of the transaction.

**Why:** a lock released before the insert commits doesn't prevent the race — the point is to serialize "read sequence → insert" as one atomic unit per document-number prefix.

**How to apply:** any new auto-numbered document type must follow this pattern — generate the number and insert the row inside one `db.transaction`, with a lock/mutex scoped to that transaction.

## React Query defaults
`artifacts/starshine-drives/src/App.tsx`'s `QueryClient` now sets `staleTime: 30_000` and `refetchOnWindowFocus: false` globally (TanStack Query v5 defaults are `staleTime: 0` + refetch-on-focus, which caused frequent silent refetches across CRM screens). Screens needing fresher data (e.g. stock notifications) should override with a shorter per-query `staleTime` rather than changing the global default back down.
