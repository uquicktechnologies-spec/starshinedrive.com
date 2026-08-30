# CRM Permission Test Matrix (Phase 7)

Single source of truth for grants: `lib/permissions/src/index.ts` (`ROLE_PERMISSIONS`).
Enforced server-side on every request via `requirePermission(module, action)` /
`requireStaff` in `artifacts/api-server`; the frontend (`crm.tsx` + `use-permissions.ts`)
only uses the same matrix to decide what to render — it is not a security boundary.

## Backend behavior (verified by code audit)

- No session / not signed in → **401** (`requireStaff`).
- Signed in but email not on the CRM staff allow-list → **403** (`requireStaff`).
- Signed in staff, but role lacks the specific module+action → **403** with
  `{ error: "You do not have permission to perform this action" }` (`requirePermission`).
- No route was found that returns empty data or hangs instead of erroring for
  unauthorized access.

## Gaps found and fixed this session

1. `emailMarketing.ts` and `webContent.ts` mutation routes (sender accounts, campaigns,
   categories, products incl. all sub-resources, media) were only guarded by the
   router-level `requirePermission(module, "view")`, not an action-specific check —
   any role with `view` could technically reach create/edit/delete/test endpoints
   regardless of what the matrix actually grants. Fixed by adding explicit
   `create`/`edit`/`delete` checks to every affected route.
2. `GET /crm/reports` checked `reports:view` for every format, including CSV/XLSX/PDF
   downloads. Added an inline `reports:export` check before serving non-JSON formats.
3. Neither gap was exploitable under today's matrix (every role with `view` on those
   modules also has full CRUD/export today), but both would silently break if a
   view-only role were introduced later.
4. Frontend gaps: several pages rendered mutate/export controls unconditionally,
   out of sync with the actual matrix for roles that only have `view` (or lack
   `export`) on that module. Fixed: Sales Executives (add/edit — manager & staff are
   view-only), Settings (save — manager & staff are view-only, form is now disabled
   for them), Sales (New Sale — staff lacks `create`... actually staff **does** have
   `create`; gated on `sales:export` for the PDF button since staff lacks `export`),
   Purchases (PDF button — gated on `purchases:export`), Reports (CSV/Excel/PDF —
   gated on `reports:export`), Quotations list + Quotation form (Download PDF — gated
   on `quotations:export`, see open question below).

## Matrix

| Module | Action | Admin | Manager | Staff |
|---|---|---|---|---|
| customers | view/create/edit | ✅ | ✅ | ✅ |
| customers | delete | ✅ | ❌ | ❌ |
| leads | view/edit | ✅ | ✅ | ✅ |
| leads | create/delete | ✅ | ❌ | ❌ |
| quotations | view/create/edit | ✅ | ✅ | ✅ |
| quotations | approve | ✅ | ✅ | ❌ |
| quotations | export (PDF) | ✅ | ❌ | ❌ |
| quotations | delete | ✅ | ❌ | ❌ |
| salesExecutives | view | ✅ | ✅ | ✅ |
| salesExecutives | create/edit/delete | ✅ | ❌ | ❌ |
| products | view | ✅ | ✅ | ✅ |
| products | create/edit | ✅ | ✅ | ❌ |
| products | delete | ✅ | ❌ | ❌ |
| categories / subGroups | view | ✅ | ✅ | ✅ |
| categories / subGroups | create/edit/delete | ✅ | ✅ | ❌ |
| suppliers / warehouses | view | ✅ | ✅ | ✅ |
| suppliers / warehouses | create/edit | ✅ | ✅ | ❌ |
| suppliers / warehouses | delete | ✅ | ❌ | ❌ |
| purchases | view/create/edit/delete/export | ✅ | ✅ | ❌ (no access at all) |
| sales | view/create | ✅ | ✅ | ✅ |
| sales | edit/delete/export | ✅ | ✅ | ❌ |
| stock | view | ✅ | ✅ | ❌ |
| stockAdjustments | edit | ✅ | ✅ | ❌ |
| stockDashboard | view | ✅ | ✅ | ❌ |
| reports | view/export | ✅ | ✅ | ❌ |
| webContent | view/create/edit/delete | ✅ | ✅ | ❌ |
| emailIntegration | view/create/edit/delete | ✅ | ✅ | ❌ |
| emailMarketing | view/create/edit | ✅ | ✅ | ❌ |
| settings | view | ✅ | ✅ | ✅ |
| settings | edit | ✅ | ❌ | ❌ |
| staffRoles | everything | ✅ | ❌ | ❌ |

## Open policy question

`quotations:export` (PDF download) is admin-only today, even though manager and
staff can both create/edit quotations, and pending Task #39 asks for staff to be
able to email quotation PDFs to customers. The UI now correctly hides the Download
PDF button from manager/staff to match the backend (previously it was shown to
everyone and would 403 on click for non-admins). Whether to widen `quotations:export`
to manager/staff is a product decision, not made here — see the chat message.
