/**
 * Centralized CRM permission model.
 *
 * Single source of truth for "who can do what" in the CRM:
 *
 *   User -> Role -> Permissions -> Module -> Action -> API / UI
 *
 * Both the API server (route guards) and the frontend (nav + button
 * visibility) import THIS matrix instead of hard-coding role checks in
 * individual pages/routes. Changing what a role can do means editing
 * `ROLE_PERMISSIONS` below in one place -- nowhere else.
 *
 * The backend is still the enforcement boundary: every mutating/reading
 * route re-checks `hasPermission()` server-side via `requirePermission()`
 * (see api-server/src/lib/permissions.ts). The frontend only uses this
 * matrix to decide what to render -- it must never be trusted as the
 * actual access-control decision.
 */

export type StaffRole = "admin" | "manager" | "staff";

export const STAFF_ROLES: StaffRole[] = ["admin", "manager", "staff"];

export type PermissionAction = "view" | "create" | "edit" | "delete" | "export" | "assign" | "approve";

export const CRM_MODULES = [
  "dashboard",
  "customers",
  "leads",
  "quotations",
  "salesExecutives",
  "products",
  "staffRoles",
  "categories",
  "subGroups",
  "suppliers",
  "warehouses",
  "purchases",
  "sales",
  "stock",
  "stockAdjustments",
  "stockDashboard",
  "reports",
  "webContent",
  "emailIntegration",
  "emailMarketing",
  "settings",
] as const;

export type CrmModule = (typeof CRM_MODULES)[number];

type ModulePermissions = Partial<Record<CrmModule, PermissionAction[]>>;

const ALL_ACTIONS: PermissionAction[] = ["view", "create", "edit", "delete", "export", "assign", "approve"];

/** Admin has every action on every module. Enumerated explicitly (not derived) so it stays an
 *  obvious, auditable grant rather than an implicit "everything" fallback. */
const ADMIN_PERMISSIONS: ModulePermissions = Object.fromEntries(
  CRM_MODULES.map((module) => [module, ALL_ACTIONS]),
);

const MANAGER_PERMISSIONS: ModulePermissions = {
  dashboard: ["view"],
  customers: ["view", "create", "edit"],
  leads: ["view", "edit"],
  quotations: ["view", "create", "edit", "approve", "export"],
  salesExecutives: ["view"],
  products: ["view", "create", "edit"],
  categories: ["view", "create", "edit", "delete"],
  subGroups: ["view", "create", "edit", "delete"],
  suppliers: ["view", "create", "edit"],
  warehouses: ["view", "create", "edit"],
  purchases: ["view", "create", "edit", "delete", "export"],
  sales: ["view", "create", "edit", "delete", "export"],
  stock: ["view"],
  stockAdjustments: ["edit"],
  stockDashboard: ["view"],
  reports: ["view", "export"],
  webContent: ["view", "create", "edit", "delete"],
  emailIntegration: ["view", "create", "edit", "delete"],
  emailMarketing: ["view", "create", "edit"],
  settings: ["view"],
};

const STAFF_PERMISSIONS: ModulePermissions = {
  dashboard: ["view"],
  customers: ["view", "create", "edit"],
  leads: ["view", "edit"],
  // Staff can prepare quotations but cannot approve them -- approval is
  // restricted to admin/manager (Phase 1 gap, closed per user decision).
  quotations: ["view", "create", "edit", "export"],
  salesExecutives: ["view"],
  products: ["view"],
  categories: ["view"],
  subGroups: ["view"],
  suppliers: ["view"],
  warehouses: ["view"],
  sales: ["view", "create"],
  // Staff are fully restricted from stock levels, the stock dashboard, and reports --
  // only admin/manager can see them (Phase 1 gap, closed per user decision).
  settings: ["view"],
};

/**
 * The single canonical permission matrix. Everything else in this file and
 * in consuming apps derives from this constant -- do not duplicate it.
 */
export const ROLE_PERMISSIONS: Record<StaffRole, ModulePermissions> = {
  admin: ADMIN_PERMISSIONS,
  manager: MANAGER_PERMISSIONS,
  staff: STAFF_PERMISSIONS,
};

export function hasPermission(role: StaffRole, module: CrmModule, action: PermissionAction): boolean {
  return ROLE_PERMISSIONS[role]?.[module]?.includes(action) ?? false;
}

/** Every action a role holds on a module -- used by the frontend to decide what to render. */
export function actionsFor(role: StaffRole, module: CrmModule): PermissionAction[] {
  return ROLE_PERMISSIONS[role]?.[module] ?? [];
}

/** Full permission grant for a role, e.g. to hand to the frontend once at login (`GET /crm/me`). */
export function getPermissionsForRole(role: StaffRole): Record<CrmModule, PermissionAction[]> {
  return Object.fromEntries(CRM_MODULES.map((module) => [module, actionsFor(role, module)])) as Record<
    CrmModule,
    PermissionAction[]
  >;
}

export function isStaffRole(value: unknown): value is StaffRole {
  return value === "admin" || value === "manager" || value === "staff";
}
