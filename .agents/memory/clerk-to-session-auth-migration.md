---
name: Clerk to Postgres-session auth migration
description: How Starshine Drive's CRM auth was migrated off Clerk to bcrypt + express-session, and a bundling pitfall hit along the way.
---

CRM auth is now DB-backed email/password (bcrypt hash on `staff_roles.password_hash`) with
Express server-side sessions stored in Postgres via `connect-pg-simple`, not Clerk and not
JWT/in-memory sessions.

**Why:** the API server runs as autoscale (multiple instances), so an in-memory session store
would randomly log staff out when a request lands on a different instance. A staff row with no
`password_hash` set simply cannot log in — this replaces the old `CRM_STAFF_EMAILS` allow-list.
The hidden master-admin backup login checks the `MASTER_ADMIN_USERNAME`/`MASTER_ADMIN_PASSWORD`
secrets directly (no DB row, no Clerk), and is the only way in until an admin sets real staff
passwords via the Staff Roles page.

**Pitfall:** `connect-pg-simple`'s own `createTableIfMissing: true` reads a `table.sql` asset
file at runtime from its package directory. esbuild bundling (as used by this api-server's
build) does not carry that non-JS asset into `dist/`, so login 500s in the built/production
build with `ENOENT ... dist/table.sql` even though it works fine under `tsx`/dev. Fix: create
the session table yourself with a plain `CREATE TABLE IF NOT EXISTS` query at startup and pass
`createTableIfMissing: false`.

**How to apply:** any time a package's "auto-create this Postgres table for me" convenience
feature is used behind an esbuild/webpack bundle, assume its schema file won't survive the
bundle and create the table explicitly instead of trusting the flag.

**Pitfall 2 (remember-me / session length):** `@types/express-session`'s own doc comment says
to set `req.session.cookie.expires = false` to make a cookie session-only (dies when the
browser closes), but the shipped type for `Cookie.expires` is `Date | null | undefined` --
assigning `false` is a type error. Don't fight it with a cast: the `cookie` options object
passed to `session({...})` at startup is what a fresh `regenerate()`d session's cookie is built
from, so simply not setting a global `maxAge` there (and only setting
`req.session.cookie.maxAge` per-login when "remember me" is on) already makes the no-maxAge
case a plain session cookie for free.
