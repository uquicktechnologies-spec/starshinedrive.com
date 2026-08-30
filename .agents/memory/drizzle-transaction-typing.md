---
name: Drizzle transaction callback typing in shared helpers
description: How to type the `tx` parameter when extracting a Drizzle transaction body into a standalone helper function.
---

When a piece of transaction logic is extracted into its own function so it can be called from inside `db.transaction(async (tx) => {...})`, typing that function's `tx` parameter as `typeof db` does not typecheck — Drizzle's transaction object type is distinct from the main `db` type (it lacks `.transaction` itself, among other differences).

**Why:** Caused several rounds of TS errors when factoring stock-mutation logic (purchases/sales/adjustments) into shared helpers usable both standalone and inside larger transactions.

**How to apply:** Type the parameter as `Parameters<Parameters<typeof db.transaction>[0]>[0]` instead of `typeof db`. This derives the exact transaction-scoped type Drizzle expects.
