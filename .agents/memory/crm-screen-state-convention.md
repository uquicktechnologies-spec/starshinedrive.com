---
name: CRM screen-state convention
description: Standard components every CRM list/detail screen must use for loading, empty, denied, and error states.
---

Every screen in `artifacts/starshine-drives/src/pages/crm/**` renders its five states with the shared components from `crm/shared.tsx`, not bespoke `<tr>`/`<div>` text:

- Data available -> normal rows.
- Loading -> `LoadingState` (block) or `LoadingRow` (table `<tbody>`), which shows a spinner immediately and a "taking longer than expected" + manual reload hint after a timeout, so nothing spins forever on a slow API.
- No data -> `EmptyState`/`EmptyRow`, message defaults to "No records found"; pass `actionLabel`/`onAction` to add a create-action button (e.g. "Add Product") only when the viewer has the relevant `canEdit`/`canCreate` permission and a create action exists on that screen. Read-only history/list sections without a create action just get the plain "No records found" copy.
- Permission denied -> `PermissionDenied`.
- API/server error -> `LoadError` with an `onRetry` callback (usually `() => refetch()`; invalidate/refetch multiple queries on pages that load several resources at once).

**Why:** keeps CRM UX consistent across ~15 screens and avoids screens that spin indefinitely or dead-end on a fetch error with no way to retry.

**How to apply:** when adding or touching any CRM page with a data fetch, import these from `../shared` (or `./shared` inside `crm/stock/*`) instead of writing new loading/empty/error markup. Small popovers (e.g. the header search dropdown in `layout.tsx`) are an accepted exception — they use plain inline text since a retry button doesn't fit a dropdown.
