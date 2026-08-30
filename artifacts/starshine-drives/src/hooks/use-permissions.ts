import { useGetCurrentUser } from "@workspace/api-client-react";
import { isStaffRole, type CrmModule, type PermissionAction, type StaffRole } from "@workspace/permissions";

/**
 * Single frontend entry point for "can this user do this". Backed by the
 * `permissions` grant the server computed for `GET /crm/me` from the same
 * `ROLE_PERMISSIONS` matrix every API route enforces -- pages/nav must call
 * `can(module, action)` here instead of comparing `role === "admin"` inline,
 * so there is exactly one place permission logic lives on the frontend.
 *
 * This only controls what renders. The API independently re-checks every
 * request server-side, so this hook is never itself a security boundary.
 */
export function usePermissions() {
  const { data: currentUser, isLoading } = useGetCurrentUser();
  const role: StaffRole = isStaffRole(currentUser?.role) ? currentUser.role : "staff";
  const permissions = currentUser?.permissions ?? {};

  const can = (module: CrmModule, action: PermissionAction): boolean =>
    permissions[module]?.includes(action) ?? false;

  return { role, permissions, can, isLoading, email: currentUser?.email };
}
