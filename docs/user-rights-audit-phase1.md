# CRM User Rights & Data Flow Map — Phase 1 (Audit & Reproduce)

Generated 2026-08-17. Read-only audit of `artifacts/api-server/src/routes/{crm,stock,webContent,emailMarketing}.ts`,
`artifacts/api-server/src/lib/staffAuth.ts`, and the CRM frontend (`artifacts/starshine-drives/src/pages/crm*`).
No production logic was changed.

## 1. Roles that actually exist

The system has exactly **3 configurable roles**, stored in one column (`staff_roles.role`, `text`, default `"staff"`):

- `admin`
- `manager`
- `staff`

There is no separate "Sales" or "Support" role — anyone who isn't admin/manager is bucketed into `staff`. There is also a
**4th, hidden role**: a master-admin Clerk account identified by *username* (not email), configured via the
`MASTER_ADMIN_USERNAME`/`MASTER_ADMIN_PASSWORD` secrets. It always resolves to `admin`, never appears in the Staff Roles
page, and bypasses `staff_roles` entirely (this is the account behind the still-open "hidden master-admin login" issue).

**Role resolution gap (by design, but worth flagging):** `getStaffRole()` defaults an email with no `staff_roles` row to
`admin` only while the table is empty, and to `staff` afterward. So the very first person to sign in becomes admin
automatically; everyone after that is `staff` until an admin explicitly promotes them. This explains the "role not
showing / staff can't see full sidebar" pattern you hit earlier this session — it's expected default-deny behavior, not
a bug, but it does mean a newly onboarded staff member silently gets zero elevated access until someone remembers to
set their role.

## 2. Permission matrix (what the API actually enforces today)

Legend: **V**iew, **C**reate, **E**dit, **D**elete, e**X**port, **A**ssign, **App**rove. ✅ = allowed for that role,
❌ = blocked (403). "—" = no such endpoint exists in the API at all (not a permission gap, just not built).

| Module | Endpoint prefix | admin | manager | staff | Notes |
|---|---|---|---|---|---|
| Seller Settings | `/crm/settings` | V✅ E✅ | V✅ E❌ | V✅ E❌ | GET has no role gate — any signed-in staff can view GST/bank settings. PUT/test-email admin-only. |
| Dashboard | `/crm/dashboard` | V✅ | V✅ | V✅ | No role gate at all. |
| Customers | `/crm/customers` | VCE✅ | VCE✅ | VCE✅ | **No role gate on any verb.** Every staff member can view/create/edit every customer. No delete endpoint exists. |
| Leads (website inquiries) | `/crm/inquiries` | VE✅ | VE✅ | VE✅ | Same — no role gate. No delete endpoint. |
| Sales Executives | `/crm/sales-executives` | VCE✅ | V✅ CE❌ | V✅ CE❌ | GET open to all staff; POST/PATCH admin-only. No delete endpoint. |
| Quotations | `/crm/quotations` | VCE App(via status field)✅ | same | same | **No role gate on any verb**, including the `status` field used to mark a quotation Approved/Sent — any staff can "approve" a quotation by PATCHing status. No dedicated Approve action or delete endpoint. |
| Products & Services | `/crm/products` | VCE✅ | VCE✅ | V✅ CE❌ | GET open to all; POST/PATCH admin+manager only. No delete endpoint. |
| Staff Roles | `/crm/staff-roles` | VCE✅ | ❌ (403) | ❌ (403) | Admin-only end to end, matches frontend nav gating. No delete endpoint (roles are edited/overwritten, not removed). |
| Categories / Sub-groups | `/crm/categories`, `/crm/sub-groups` | VCED✅ | VCED✅ | V✅ CED❌ | GET open to all staff; write ops admin+manager. |
| Suppliers / Warehouses | `/crm/suppliers`, `/crm/warehouses` | VCE✅ | VCE✅ | V✅ CE❌ | Same pattern as categories, but **no delete endpoint** for either. |
| Purchases | `/crm/purchases` | VCED X(pdf)✅ | VCED X(pdf)✅ | ❌ (403) all verbs | Staff is fully excluded, including read. |
| Sales | `/crm/sales` | VCED X(pdf)✅ | VCED X(pdf)✅ | VC✅ ED❌ | Staff can create/view sales and print invoices, but cannot edit or void a completed sale. |
| Stock levels / pending / history | `/crm/stock/levels`, `/pending`, `/history/:id` | V✅ | V✅ | V✅ | Open to all 3 roles. |
| Stock adjustments | `/crm/stock/adjustments` | E✅ | E✅ | ❌ (403) | Staff can see stock levels but can't correct them. |
| Stock dashboard | `/crm/stock/dashboard` | V✅ | V✅ | ❌ (403) | Inconsistent with "stock levels" above being staff-visible — staff sees the raw numbers but not the aggregated dashboard view of the same data. |
| Stock notifications / search | `/crm/stock/notifications`, `/search` | V✅ | V✅ | V✅ | Open to all 3. |
| Reports (all exports: csv/xlsx/pdf/json) | `/crm/reports` | VX✅ | VX✅ | ❌ (403) | The only real **Export** capability in the app; staff has zero access to any report or export, including exporting their own sales. |
| Website Products / Categories / Media | `/crm/web-products`, `/crm/web-categories`, `/crm/web-media` | VCED✅ | VCED✅ | ❌ (403) | Router-level gate (`router.use(...)`), applies uniformly to the whole prefix including deletes. |
| Email Integration (senders) | `/crm/email-senders` | VCED✅ | VCED✅ | ❌ (403) | Router-level gate. |
| Bulk Email Marketing | `/crm/email-marketing` | VCE✅ | VCE✅ | ❌ (403) | Router-level gate. |

### Key inconsistencies found (Phase 1 findings, not yet fixed)

1. **Customers, Leads, and Quotations have zero server-side role gating.** Every staff member — including the
   lowest-privileged `staff` role — can view, create, and edit every customer record, every lead, and every quotation
   (including changing its status/approval state and reassigning its sales executive). This is the biggest gap: it
   means "Sales"-type staff can silently edit or approve quotations that in most CRMs would need manager sign-off.
2. **Stock visibility is inconsistent for `staff`**: they can see `/crm/stock/levels`, `/pending`, and `/history`
   (raw data) but are blocked from `/crm/stock/dashboard` (the aggregated view of the same numbers) and from
   `/crm/reports` (any export of stock data). A staff member can currently get the same numbers by screen-reading the
   levels/pending pages, just not the dashboard/report presentation — inconsistent gating rather than an intentional
   business rule.
3. **No delete capability exists for Customers, Leads, Sales Executives, Quotations, Products, Suppliers, or
   Warehouses** at the API level, for any role including admin. Records can only be edited to an "Inactive"/similar
   status where such a field exists. This may be intentional (avoid destructive deletes on financial/reference data)
   but should be confirmed as a design decision, not assumed.
4. **Frontend nav/button gating matches the backend exactly everywhere it was checked** — `CrmLayout`'s `roles` filters
   and the `canEdit`/`canEditStock` props passed into each page mirror the `requireRole()` gates above. No case was
   found where the UI hides something the API would actually allow, or shows a button that the API would then reject
   (i.e., no orphaned "Delete" or "Export" buttons pointing at endpoints that don't exist for that role).

## 3. Data-flow / API-correctness findings (pagination, filtering, records missing)

- **No pagination anywhere in the CRM API.** Every list endpoint (`customers`, `inquiries`, `quotations`, `products`,
  `purchases`, `sales`, `categories`, `sub-groups`, `suppliers`, `warehouses`, `staff-roles`) does a full
  `SELECT ... ORDER BY createdAt DESC` with no `LIMIT`/`OFFSET` and no page params accepted from the client. At
  current data volumes this returns complete data (not a "missing records" bug), but it will degrade over time and
  there is no incorrect-pagination bug to fix today because pagination doesn't exist yet.
- **No row-level / ownership filtering anywhere.** No query filters by `staffEmail` or `salesExecutiveId` for the
  signed-in user — every role that can view a module sees *all* records in it, never "my customers" or "my quotations"
  only. So there is no scenario today where "permission filtering removes valid records" — filtering isn't applied at
  the row level at all, only at the whole-endpoint level (role gate passes or 403s).
- **The one caching-related "data not showing" class of bug** (confirmed earlier this session) is client-side: React
  Query's `useGetCurrentUser()`/other CRM queries are fetched once per mount with default `staleTime: 0`, but if the
  underlying `staff_roles` row changes while the tab stays open and unfocused, the UI keeps rendering the previously
  fetched role/permissions until a refetch is triggered (refocus, remount, or manual reload). This is not a server bug
  — `getStaffRole()` re-queries the DB fresh on every request — but it does mean role/permission changes don't
  propagate to an already-open tab without a reload.
- **Server logs are clean for CRM traffic** in the current dev session (spot-checked `/api/crm/*` requests in the
  workflow and deployment logs): normal 200/304/403 codes, no 500s from permission logic. The only recurring error is
  the known, separate `ensureMasterAdminAccount()` failure at startup ("Failed to provision master admin account:
  Unprocessable Entity") — unrelated to staff/role permission checks, already tracked as its own item.

## 4. Root-cause classification (per the audit questions)

| Symptom class | Root cause found |
|---|---|
| "Full sidebar not showing for admin" | Frontend/client-cache issue (stale React Query cache after a DB role change), not a permission or API bug. |
| "Data not returned for a role" | No case found where the API silently drops rows for an allowed role — access is all-or-nothing per endpoint (403) rather than partial/filtered. |
| "Pagination incorrect" | Not applicable — no pagination is implemented anywhere yet, so there's nothing to be "incorrect"; this is a feature gap, not a bug. |
| "Permission filtering removes valid records" | Not observed — there is no row-level filtering to remove records from; gating is endpoint-level only. |
| Genuine permission-model gaps | (1) Customers/Leads/Quotations have no role gate at all — every staff role has full CRUD + status/approval control. (2) Stock dashboard/report visibility for `staff` is inconsistent with stock-levels visibility for the same role. |

## 5. Scope note

This is a Phase 1 map only — **no production logic, routes, or role gates were changed** while producing it. The
inconsistencies in section 2 (items 1–3) are candidates for a Phase 2 fix, but they represent business-rule decisions
(e.g., "should `staff` be allowed to approve quotations?") that should be confirmed with you before any code changes,
since tightening them will change what existing staff can currently do.
