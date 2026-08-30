---
name: New workspace lib packages need install + build
description: Steps required after scaffolding a new lib/<name> package (e.g. from a skill template) before consuming artifacts can use it without Vite/tsc errors.
---

When adding a brand-new `lib/<pkg>` workspace package (e.g. copied from a skill template like object-storage-web):

1. Run `pnpm install` at the repo root after adding the package.json and any new deps — a consuming artifact's own `pnpm install` does not link the new package's own `node_modules` (needed for subpath resolution, e.g. `@uppy/react/dashboard-modal`), causing Vite "Failed to resolve import" errors even though the file exists.
2. If the package's tsconfig is referenced via TS project references from a consuming app's tsconfig, it must set `"composite": true`, or the consumer's typecheck fails with TS6306.
3. Run `pnpm --filter @workspace/<pkg> exec tsc --build` once so `dist/*.d.ts` exists — consumers with project references error with TS6305 ("Output file ... has not been built") until this is done.
4. After all this, restart the consuming app's dev workflow — Vite's optimize-deps cache can still show stale "Failed to resolve" errors from before the install/build, even though nothing is actually broken.

**Why:** hit this while wiring `@workspace/object-storage-web` (Uppy-based) into `starshine-drives`; skipped step 1 initially and got a confusing Vite resolution error that looked like a real missing dependency.
**How to apply:** any time a skill instructs copying a new `lib/` package template into the monorepo.
