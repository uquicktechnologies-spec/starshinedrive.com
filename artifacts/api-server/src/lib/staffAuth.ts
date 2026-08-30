import { clerkClient, getAuth } from "@clerk/express";
import { count, eq } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";
import { db, staffRolesTable } from "@workspace/db";
import { hasPermission, type CrmModule, type PermissionAction, type StaffRole } from "@workspace/permissions";

/** @deprecated kept as an alias so existing imports keep working; use `StaffRole` from @workspace/permissions. */
export type StaffRoleName = StaffRole;

/** Fields stashed onto `req` by requireStaff/requireRole. Cast with `req as StaffRequest`. */
export type StaffRequest = Request & { staffEmail?: string; staffRole?: StaffRoleName };

export function staffEmailAllowList(): Set<string> {
  return new Set(
    (process.env.CRM_STAFF_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

const userEmailCache = new Map<string, string>();

export async function resolveUserEmail(userId: string, claimEmail: unknown): Promise<string> {
  if (typeof claimEmail === "string" && claimEmail) return claimEmail.toLowerCase();
  const cached = userEmailCache.get(userId);
  if (cached !== undefined) return cached;
  const user = await clerkClient.users.getUser(userId);
  const email = (
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    ""
  ).toLowerCase();
  userEmailCache.set(userId, email);
  return email;
}

/**
 * Staff without an explicit row in staff_roles default to "admin" ONLY while
 * no roles have been configured yet (a brand-new install) -- this lets the
 * very first staff member sign in and set up roles for everyone else.
 * Once at least one role row exists, unlisted staff default to the
 * least-privileged "staff" role instead, so access must be explicitly
 * granted rather than silently inherited.
 */
export async function getStaffRole(email: string): Promise<StaffRoleName> {
  const [row] = await db.select().from(staffRolesTable).where(eq(staffRolesTable.email, email)).limit(1);
  const role = row?.role;
  if (role === "admin" || role === "manager" || role === "staff") return role;
  const [{ value: rolesConfigured } = { value: 0 }] = await db.select({ value: count() }).from(staffRolesTable);
  return rolesConfigured > 0 ? "staff" : "admin";
}

/**
 * A hidden master-admin account, identified by Clerk username (not email) and
 * configured only via the MASTER_ADMIN_USERNAME/MASTER_ADMIN_PASSWORD secrets.
 * It always resolves to "admin" and never touches staff_roles, so it never
 * appears in the Staff Roles CRM page and can't be edited/removed from there.
 */
export async function requireStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
  const auth = getAuth(req);
  if (!auth.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const masterAdminUsername = (process.env.MASTER_ADMIN_USERNAME ?? "").trim().toLowerCase();
  const claimEmail = auth.sessionClaims?.email;
  let email = typeof claimEmail === "string" && claimEmail ? claimEmail.toLowerCase() : (userEmailCache.get(auth.userId) ?? "");

  if (!email || masterAdminUsername) {
    try {
      const user = await clerkClient.users.getUser(auth.userId);
      if (!email) {
        email = (user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? "").toLowerCase();
        userEmailCache.set(auth.userId, email);
      }
      if (masterAdminUsername && user.username && user.username.trim().toLowerCase() === masterAdminUsername) {
        (req as StaffRequest).staffEmail = email || `${masterAdminUsername}@master.local`;
        (req as StaffRequest).staffRole = "admin";
        next();
        return;
      }
    } catch {
      res.status(403).json({ error: "CRM access is restricted to approved staff" });
      return;
    }
  }

  if (!email || !staffEmailAllowList().has(email)) {
    res.status(403).json({ error: "CRM access is restricted to approved staff" });
    return;
  }
  (req as StaffRequest).staffEmail = email;
  next();
}

/** Must run after requireStaff (needs req.staffEmail). Respects a role already stashed by requireStaff (e.g. the master admin). */
export function requireRole(...allowed: StaffRoleName[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const sreq = req as StaffRequest;
    if (!sreq.staffEmail) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const role = sreq.staffRole ?? await getStaffRole(sreq.staffEmail);
    sreq.staffRole = role;
    if (!allowed.includes(role)) {
      res.status(403).json({ error: "You do not have permission to access this area" });
      return;
    }
    next();
  };
}

/**
 * Server-side enforcement for the centralized permission matrix in
 * `@workspace/permissions`. Must run after `requireStaff` (needs
 * `req.staffEmail`). This is the ONLY place route guards should check
 * "can this role do this action on this module" -- do not re-implement
 * role checks inline in a route handler; add/adjust the module+action in
 * `ROLE_PERMISSIONS` instead so the frontend and backend never drift apart.
 *
 * Never trust a `permissions`/`role` value sent by the client for this
 * check -- the role is always re-resolved from the DB (or the staff-role
 * already verified by `requireStaff`), never taken from the request body,
 * query string, or headers.
 */
export function requirePermission(module: CrmModule, action: PermissionAction) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const sreq = req as StaffRequest;
    if (!sreq.staffEmail) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const role = sreq.staffRole ?? await getStaffRole(sreq.staffEmail);
    sreq.staffRole = role;
    if (!hasPermission(role, module, action)) {
      res.status(403).json({ error: "You do not have permission to perform this action" });
      return;
    }
    next();
  };
}

/**
 * Ensures the hidden master-admin Clerk account exists with the current
 * MASTER_ADMIN_PASSWORD secret. Safe to call on every server start: creates
 * the account on first run, and keeps its password in sync with the secret
 * afterward (the secret is the single source of truth for this account).
 */
export async function ensureMasterAdminAccount(): Promise<void> {
  const username = (process.env.MASTER_ADMIN_USERNAME ?? "").trim();
  const password = process.env.MASTER_ADMIN_PASSWORD;
  if (!username || !password) return;
  try {
    const existing = await clerkClient.users.getUserList({ username: [username] });
    const user = existing.data[0];
    if (user) {
      await clerkClient.users.updateUser(user.id, { password, skipPasswordChecks: true });
    } else {
      await clerkClient.users.createUser({ username, password, skipPasswordChecks: true });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to provision master admin account:", err instanceof Error ? err.message : err);
  }
}
