---
name: Bulk email marketing feature
description: Design decisions behind the CRM bulk email marketing feature (sender rotation, recipient sources, async sending).
---

- Recipient sources are Customers (filterable by city/state) and Website Leads/Inquiries (filterable by industry) — the two tables don't share filterable fields, so the UI/API branch on `recipientSource` rather than using one generic filter set.
- Sender accounts are separate SMTP configs (`emailSenderAccountsTable`), rotated round-robin by index across active accounts when a campaign sends — not aliases of one login. Passwords are always stripped from API responses; PATCH treats an empty-string password as "leave unchanged" (mirrors the existing single seller-settings SMTP pattern in `crm.ts`).
- Campaign sending is fire-and-forget from the POST handler: the campaign row is created with status "sending", a background function updates counts/per-recipient log rows as it goes, then flips to "completed"/"failed". This avoids HTTP timeout risk for large recipient lists and enables a pollable history view.
  **Why:** the project has no job-queue infrastructure, and existing CRM patterns favor simple in-process async work over adding one.
- Both `/crm/email-senders` and `/crm/email-marketing` routes are gated to admin/manager only (not plain staff), matching the sensitivity level of other CRM data-management routes.
