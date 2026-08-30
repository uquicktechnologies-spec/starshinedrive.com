---
name: Passing `enabled` to orval-generated React Query hooks
description: orval-generated useXxx query hooks type `options.query` as a full (non-Partial) UseQueryOptions, so passing just `{ enabled }` fails typecheck.
---

This workspace's orval-generated React Query hooks (`lib/api-client-react/src/generated/api.ts`) type each hook's second argument as `{ query?: UseQueryOptions<TQueryFnData, TError, TData> }` — a full `UseQueryOptions`, not `Partial<UseQueryOptions>`. At runtime the generated code merges your `query` object with its own `queryKey`/`queryFn` defaults via spread, so passing just `{ enabled: someBool }` works fine at runtime but fails typechecking (`queryKey` "missing").

**Why:** Hit this adding a gated (`enabled`) search-as-you-type call to `useSearchStock` in the CRM header; no prior codebase example existed to copy from.

**How to apply:** Specify the hook's `TData` generic explicitly using its exported `XxxQueryResult` type, then cast the options argument: `useSearchStock<SearchStockQueryResult>(params, { query: { enabled } } as Parameters<typeof useSearchStock<SearchStockQueryResult>>[1])`.

**Simpler, more robust alternative (preferred):** instead of casting the whole options object (which can make TS lose TData inference and mistype the returned `data` as `{}` at call sites), just supply the missing `queryKey` field explicitly alongside the real option, using the hook's own exported `getXxxQueryKey()` helper — no generic or cast needed: `useListCustomers({ query: { queryKey: getListCustomersQueryKey(), placeholderData: keepPreviousData } })`. This satisfies the full `UseQueryOptions` type honestly (the generated wrapper's internal merge just overwrites it with the same value at runtime) and keeps `data` correctly typed. Casting the whole argument (`as Parameters<typeof fn>[0]` or `as any`) is the wrong first move — it works for a single isolated call but silently degrades TData inference and cascades into `Property 'x' does not exist on type '{}'` errors across every destructured usage of `data` in the file.
