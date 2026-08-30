---
name: CRM create-form double-submit risk
description: Which class of CRM forms need a submit button disabled on mutation.isPending, and which don't.
---

Any CRM form backed by a plain POST-create mutation (not a PUT-style "replace whole list" endpoint) must disable its submit button while `createMutation.isPending || updateMutation.isPending` is true, or a double-click / slow network produces a duplicate DB row (no server-side idempotency key exists on these routes).

**Why:** a code audit found several create/edit forms (categories, sub-groups, suppliers, warehouses in stock master-data; web categories and web product "general info") missing this guard, while every other CRM create form already had it — it's an easy omission on new admin CRUD screens.

**How to apply:** when adding a new create/edit form, always wire `disabled={createMutation.isPending || updateMutation.isPending}` on the submit button. Section-level "Save Section" buttons that call a `useReplaceX` (full-list-replace) mutation are lower risk since re-sending the same replace payload isn't a duplicate — but should still show pending state for UX consistency.
