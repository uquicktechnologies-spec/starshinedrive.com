---
name: CRM self-service sign-up policy
description: Starshine Drive CRM sign-up is intentionally open to any email; default role and pending-invite claim rules to stay consistent with.
---

The CRM has a self-service Sign Up (alongside Sign In) at `POST /api/auth/signup`
(`artifacts/api-server/src/lib/staffAuth.ts` `createStaffAccount`, wired in
`artifacts/api-server/src/routes/auth.ts`, UI in `artifacts/starshine-drives/src/App.tsx`).
Sign-up is **open by explicit product decision** — anyone can create a CRM login with any
email, no admin pre-approval required.

**Why:** the user was asked and explicitly chose "open" over "restricted to admin-added
emails" despite the CRM holding customer/sales/GST data, so this is a deliberate tradeoff,
not an oversight.

Two rules keep that openness from being worse than it has to be — stay consistent with both:

1. **New accounts always default to the lowest-privilege role ("staff")** from
   `@workspace/permissions`, never "admin"/"manager". An admin upgrades a role afterward from
   the Staff Roles page.
2. **Sign-up never overwrites an active account.** If the email already has a `passwordHash`
   set, sign-up is rejected (409) — it only ever creates a brand-new row, or "claims" a
   passwordless row an admin pre-added via Staff Roles (in which case the admin-assigned role
   is preserved, not downgraded to "staff").

**Known open gap (tracked as follow-up tasks, not yet fixed):** because there's no email
ownership verification, anyone who learns/guesses an admin-pre-added pending email can race to
claim that role before the real person signs up. Don't "fix" this silently as a side effect of
unrelated work — it's tracked as its own task.

**How to apply:** if asked to touch sign-up/login again, keep the default-role and
no-overwrite invariants above; don't relax them without going back to the user given the
security tradeoff already made once here.
