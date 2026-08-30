import bcrypt from "bcryptjs";
import { count, eq } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";
import { db, staffRolesTable } from "@workspace/db";
import { hasPermission, type CrmModule, type PermissionAction, type StaffRole } from "@workspace/permissions";

/** @deprecated kept as an alias so existing imports keep working; use `StaffRole` from @workspace/permissions. */
export type StaffRoleName = StaffRole;

/** Fields stashed onto `req` by requireStaff/requireRole. Cast with `req as StaffRequest`. */
export type StaffRequest = Request & { staffEmail?: string; staffRole?: StaffRoleName };

const BCRYPT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
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
 * Verifies an email/password pair against the staff_roles table. Returns the
 * lowercased email on success, or null on any failure (unknown email, no
 * password set yet, or wrong password) -- callers should treat all of these
 * identically (generic "invalid credentials") to avoid leaking which emails
 * exist.
 */
export async function verifyStaffCredentials(email: string, password: string): Promise<string | null> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) return null;
  const [row] = await db.select().from(staffRolesTable).where(eq(staffRolesTable.email, normalizedEmail)).limit(1);
  if (!row?.passwordHash) return null;
  const valid = await bcrypt.compare(password, row.passwordHash);
  return valid ? normalizedEmail : null;
}

const SIGNUP_PASSWORD_MIN_LENGTH = 8;

export type CreateStaffAccountResult =
  | { ok: true; email: string }
  | { ok: false; error: string; status: 400 | 409 };

/**
 * Self-service account creation (sign up). Anyone can create a CRM login
 * this way -- by design, per product decision -- so every new account is
 * granted the least-privileged "staff" role; an admin promotes it later
 * from the Staff Roles page if warranted. Never grant "admin"/"manager"
 * here.
 *
 * If an admin already pre-added this email via the Staff Roles page (a row
 * exists but has no password yet), signing up claims that row and keeps its
 * assigned role instead of creating a duplicate. An email that already has
 * a password set is rejected -- sign up never overwrites an active
 * account's credentials.
 */
export async function createStaffAccount(
  email: string,
  password: string,
  name?: string,
): Promise<CreateStaffAccountResult> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return { ok: false, error: "Email is required", status: 400 };
  if (password.length < SIGNUP_PASSWORD_MIN_LENGTH) {
    return { ok: false, error: `Password must be at least ${SIGNUP_PASSWORD_MIN_LENGTH} characters`, status: 400 };
  }

  const [existing] = await db.select().from(staffRolesTable).where(eq(staffRolesTable.email, normalizedEmail)).limit(1);
  if (existing?.passwordHash) {
    return { ok: false, error: "An account with this email already exists. Please sign in instead.", status: 409 };
  }

  const passwordHash = await hashPassword(password);
  const trimmedName = name?.trim() || undefined;
  if (existing) {
    await db.update(staffRolesTable)
      .set({ passwordHash, ...(trimmedName ? { name: trimmedName } : {}) })
      .where(eq(staffRolesTable.id, existing.id));
  } else {
    await db.insert(staffRolesTable).values({
      email: normalizedEmail,
      name: trimmedName ?? null,
      role: "staff",
      passwordHash,
    });
  }
  return { ok: true, email: normalizedEmail };
}

/**
 * A hidden master-admin backup login, checked directly against the
 * MASTER_ADMIN_USERNAME/MASTER_ADMIN_PASSWORD secrets (no DB row involved).
 * It always resolves to "admin" and never appears in the Staff Roles CRM
 * page. Useful if the staff_roles table is ever locked out (e.g. every admin
 * row's password is lost).
 */
export function verifyMasterAdmin(username: string, password: string): boolean {
  const expectedUsername = (process.env.MASTER_ADMIN_USERNAME ?? "").trim();
  const expectedPassword = process.env.MASTER_ADMIN_PASSWORD ?? "";
  if (!expectedUsername || !expectedPassword) return false;
  return username.trim() === expectedUsername && password === expectedPassword;
}

declare module "express-session" {
  interface SessionData {
    staffEmail?: string;
    isMasterAdmin?: boolean;
  }
}

export async function requireStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
  const session = req.session;
  if (session?.isMasterAdmin) {
    (req as StaffRequest).staffEmail = session.staffEmail ?? "master-admin@local";
    (req as StaffRequest).staffRole = "admin";
    next();
    return;
  }
  if (!session?.staffEmail) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  (req as StaffRequest).staffEmail = session.staffEmail;
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
