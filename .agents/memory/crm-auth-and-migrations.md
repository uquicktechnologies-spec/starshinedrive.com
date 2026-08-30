---
name: CRM auth & DB migration conventions
description: How CRM staff access control and database migrations work in this project
---

- CRM API access is enforced server-side by an email allow-list in the `CRM_STAFF_EMAILS` env var (comma-separated, case-insensitive). It fails closed (403).
  **Why:** Any Clerk user can self-register; authentication alone is not authorization for the internal portal.
  **How to apply:** Add new sales staff by appending their email to `CRM_STAFF_EMAILS`. The middleware falls back to the Clerk API (cached) when the session token lacks an `email` claim — Replit-managed Clerk session claims here do NOT include email.
- Clerk's `<SignIn routing="path" path=...>` rendered a blank page when embedded on a route other than its `path` (e.g. gating `/crm`); use `routing="hash"` for embedded sign-in gates.
- Do NOT add file-based Drizzle migrations or run them at API startup in this project. It uses Replit's managed push-based flow (`pnpm --filter @workspace/db run push`/`push-force`) for dev, and Replit's Publish-time schema diff for prod. A prior attempt to add startup-time `migrate()` crashed every deploy: prod tables already existed (created by the publish diff) but had no migration-tracking row, so `CREATE TABLE` re-ran and errored "already exists", the port never opened, and the health check failed the whole build. Just edit `lib/db/src/schema/*.ts` and push to dev; production sync happens automatically on Publish. See `.local/skills/database/references/database-migrations-on-publish.md`.
- Public sign-up is disabled in the web app (no /sign-up route); staff accounts are created in Clerk directly.
- Staff without an explicit `staff_roles` row default to "admin" only while zero role rows exist yet (bootstrap); once any role row exists, unlisted staff default to least-privilege "staff" instead.
  **Why:** letting every unlisted allow-listed email be treated as admin forever is an insecure-by-default access model once the system is actually in use.
  **How to apply:** `getStaffRole()` in `staffAuth.ts` checks `count(staff_roles)` before falling back to a default — keep that bootstrap/steady-state distinction if touching role resolution.
