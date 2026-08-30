# Starshine Drive Website

A pixel-faithful recreation of starshinedrives.com — an industrial gearbox and gear reducer manufacturer website (星光传动, OEM & Custom Solutions, Since 1965).

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

- The public marketing site stays open to all visitors; the internal Sales Portal at `/crm` is protected with Clerk authentication.
- Website contact and quote requests are stored as persistent leads for the sales team, rather than being treated as email-only submissions.

## Product

- Industrial gearbox catalog and quote/contact website with an internal sales CRM for customer and quotation management.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The OpenAPI spec is the source of truth for API contracts: run code generation before using new API types or hooks.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
