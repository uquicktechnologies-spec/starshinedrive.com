---
name: Express Request augmentation under pnpm/bundler moduleResolution
description: Global Express Request type augmentation doesn't resolve in this workspace's tsconfig; use a local intersection type + cast instead.
---

Global `declare global { namespace Express { interface Request {...} } }` augmentation of `express-serve-static-core` fails to resolve under this monorepo's pnpm + bundler `moduleResolution` setup (the module specifier can't be found for augmentation purposes), even though Express itself resolves fine for normal imports.

**Why:** Wasted a debugging cycle trying to get global augmentation working before finding the pattern below.

**How to apply:** Instead of augmenting the global `Request` type, define a local type alias, e.g. `type StaffRequest = Request & { staffEmail?: string; staffRole?: StaffRoleName }`, and cast at call sites (`(req as StaffRequest).staffEmail`). Put shared auth/role helpers in their own module (not the route file) so multiple routers can import the same `StaffRequest` type and middleware.
