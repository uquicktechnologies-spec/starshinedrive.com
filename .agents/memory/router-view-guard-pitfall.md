---
name: Router-level view-only guard doesn't cover mutation actions
description: Express routers that apply requirePermission(module,"view") via router.use() need explicit create/edit/delete checks on mutation routes too.
---

When a CRM route module applies `router.use(requirePermission(module, "view"))` at
the top to gate the whole router, that only proves the caller can *view* the module.
Every mutating route (POST/PATCH/PUT/DELETE) still needs its own explicit
`requirePermission(module, "create"|"edit"|"delete")` (or an inline check for
special cases like export-only-on-certain-formats). Relying on the router-level
`view` guard alone lets any role with `view` reach mutation endpoints regardless of
what the permission matrix (`lib/permissions/src/index.ts`) actually grants that role.

**Why:** Found twice in one audit (emailMarketing.ts, webContent.ts) and a sibling
version in stock.ts reports export (view checked for all formats including
CSV/XLSX/PDF downloads, not just export). Not exploitable under the grants that
existed at the time (every view-capable role also had full CRUD), but would break
silently the moment a view-only role is introduced.

**How to apply:** When adding a new CRM route module, or a new mutation route to an
existing one, add the specific action check on that route — never assume the
router-level `view` guard is sufficient. Same logic applies on the frontend: gate
buttons with the actual `can(module, action)` check for that specific action, not
just whatever prop happens to be threaded down from `crm.tsx`.
