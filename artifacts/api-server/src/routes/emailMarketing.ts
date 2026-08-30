import { and, desc, eq, inArray, isNotNull, ne, or, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import nodemailer from "nodemailer";
import {
  CreateEmailSenderAccountBody, UpdateEmailSenderAccountBody, UpdateEmailSenderAccountParams,
  DeleteEmailSenderAccountParams, SendEmailSenderTestParams, SendEmailSenderTestBody,
  CreateEmailCampaignBody, GetEmailCampaignParams, PreviewEmailMarketingRecipientsQueryParams,
} from "@workspace/api-zod";
import {
  db, emailSenderAccountsTable, emailCampaignsTable, emailCampaignRecipientsTable,
  customersTable, inquiriesTable, type EmailCampaignFilters,
} from "@workspace/db";
import { requireStaff, requirePermission } from "../lib/staffAuth";
import { optionalText } from "./crm";

const router: IRouter = Router();

router.use("/crm/email-senders", requireStaff, requirePermission("emailIntegration", "view"));
router.use("/crm/email-marketing", requireStaff, requirePermission("emailMarketing", "view"));

// -------------------- Sender accounts --------------------

function toSenderJson(account: typeof emailSenderAccountsTable.$inferSelect) {
  const { smtpPassword: _smtpPassword, ...rest } = account;
  return rest;
}

router.get("/crm/email-senders", async (_req, res): Promise<void> => {
  const accounts = await db.select().from(emailSenderAccountsTable).orderBy(desc(emailSenderAccountsTable.createdAt), desc(emailSenderAccountsTable.id));
  res.json(accounts.map(toSenderJson));
});

router.post("/crm/email-senders", requirePermission("emailIntegration", "create"), async (req, res): Promise<void> => {
  const parsed = CreateEmailSenderAccountBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;
  const [account] = await db.insert(emailSenderAccountsTable).values({
    label: data.label,
    smtpHost: data.smtpHost,
    smtpPort: data.smtpPort ?? 587,
    smtpSecure: data.smtpSecure ?? false,
    smtpUser: data.smtpUser,
    smtpPassword: data.smtpPassword,
    fromEmail: data.fromEmail,
    fromName: optionalText(data.fromName),
    active: data.active ?? true,
  }).returning();
  res.status(201).json(toSenderJson(account));
});

router.patch("/crm/email-senders/:id", requirePermission("emailIntegration", "edit"), async (req, res): Promise<void> => {
  const params = UpdateEmailSenderAccountParams.safeParse(req.params);
  const parsed = UpdateEmailSenderAccountBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    const error = !params.success ? params.error.message : parsed.error?.message ?? "Invalid request";
    res.status(400).json({ error });
    return;
  }
  const data = parsed.data;
  const [account] = await db.update(emailSenderAccountsTable).set({
    ...data,
    fromName: optionalText(data.fromName),
    // Empty string means "leave the stored password unchanged".
    smtpPassword: data.smtpPassword === undefined || data.smtpPassword === "" ? undefined : data.smtpPassword,
  }).where(eq(emailSenderAccountsTable.id, params.data.id)).returning();
  if (!account) {
    res.status(404).json({ error: "Sender account not found" });
    return;
  }
  res.json(toSenderJson(account));
});

router.delete("/crm/email-senders/:id", requirePermission("emailIntegration", "delete"), async (req, res): Promise<void> => {
  const params = DeleteEmailSenderAccountParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(emailSenderAccountsTable).where(eq(emailSenderAccountsTable.id, params.data.id));
  res.status(204).send();
});

function getSenderTransporter(account: typeof emailSenderAccountsTable.$inferSelect) {
  return nodemailer.createTransport({
    host: account.smtpHost,
    port: account.smtpPort || (account.smtpSecure ? 465 : 587),
    secure: account.smtpSecure,
    auth: { user: account.smtpUser, pass: account.smtpPassword },
  });
}

router.post("/crm/email-senders/:id/test", requirePermission("emailIntegration", "edit"), async (req, res): Promise<void> => {
  const params = SendEmailSenderTestParams.safeParse(req.params);
  const parsed = SendEmailSenderTestBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    const error = !params.success ? params.error.message : parsed.error?.message ?? "Invalid request";
    res.status(400).json({ error });
    return;
  }
  const [account] = await db.select().from(emailSenderAccountsTable).where(eq(emailSenderAccountsTable.id, params.data.id)).limit(1);
  if (!account) {
    res.status(404).json({ error: "Sender account not found" });
    return;
  }
  try {
    const transporter = getSenderTransporter(account);
    await transporter.sendMail({
      from: `"${account.fromName || account.label}" <${account.fromEmail}>`,
      to: parsed.data.to,
      subject: "Test Email from Starshine Drive CRM",
      text: `This is a test email confirming the "${account.label}" sender account is working correctly.`,
      html: `<p>This is a test email confirming the "${account.label}" sender account is working correctly.</p>`,
    });
    res.json({ success: true, message: `Test email sent to ${parsed.data.to}.` });
  } catch (err) {
    res.json({ success: false, message: err instanceof Error ? err.message : "Failed to send test email." });
  }
});

// -------------------- Recipient targeting --------------------

function parseCsv(value: string | undefined | null): string[] {
  return (value ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

async function resolveRecipients(source: "customers" | "leads", filters: EmailCampaignFilters) {
  if (source === "customers") {
    const conditions = [isNotNull(customersTable.email), ne(customersTable.email, "")];
    if (filters.cities?.length) conditions.push(inArray(customersTable.city, filters.cities));
    if (filters.states?.length) conditions.push(inArray(customersTable.state, filters.states));
    const rows = await db.select({
      email: customersTable.email,
      name: customersTable.contactPerson,
      company: customersTable.companyName,
    }).from(customersTable).where(and(...conditions));
    return rows
      .filter((r) => !!r.email)
      .map((r) => ({ email: r.email as string, name: r.name || r.company }));
  }

  const conditions = [isNotNull(inquiriesTable.email), ne(inquiriesTable.email, "")];
  if (filters.industries?.length) conditions.push(inArray(inquiriesTable.industry, filters.industries));
  const rows = await db.select({
    email: inquiriesTable.email,
    name: inquiriesTable.contactPerson,
    company: inquiriesTable.companyName,
  }).from(inquiriesTable).where(and(...conditions));
  return rows
    .filter((r) => !!r.email)
    .map((r) => ({ email: r.email as string, name: r.name || r.company || undefined }));
}

router.get("/crm/email-marketing/filter-options", async (_req, res): Promise<void> => {
  const [cities, states, industries] = await Promise.all([
    db.selectDistinct({ value: customersTable.city }).from(customersTable).where(isNotNull(customersTable.city)),
    db.selectDistinct({ value: customersTable.state }).from(customersTable).where(isNotNull(customersTable.state)),
    db.selectDistinct({ value: inquiriesTable.industry }).from(inquiriesTable).where(isNotNull(inquiriesTable.industry)),
  ]);
  res.json({
    cities: cities.map((r) => r.value).filter((v): v is string => !!v).sort(),
    states: states.map((r) => r.value).filter((v): v is string => !!v).sort(),
    industries: industries.map((r) => r.value).filter((v): v is string => !!v).sort(),
  });
});

router.get("/crm/email-marketing/recipients-preview", async (req, res): Promise<void> => {
  const parsed = PreviewEmailMarketingRecipientsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const filters: EmailCampaignFilters = {
    cities: parseCsv(parsed.data.cities),
    states: parseCsv(parsed.data.states),
    industries: parseCsv(parsed.data.industries),
  };
  const recipients = await resolveRecipients(parsed.data.source, filters);
  res.json({
    count: recipients.length,
    sample: recipients.slice(0, 8).map((r) => ({ email: r.email, name: r.name ?? null })),
  });
});

// -------------------- Campaigns --------------------

function toCampaignJson(campaign: typeof emailCampaignsTable.$inferSelect) {
  return campaign;
}

router.get("/crm/email-marketing/campaigns", async (_req, res): Promise<void> => {
  const campaigns = await db.select().from(emailCampaignsTable).orderBy(desc(emailCampaignsTable.createdAt), desc(emailCampaignsTable.id));
  res.json(campaigns.map(toCampaignJson));
});

router.get("/crm/email-marketing/campaigns/:id", async (req, res): Promise<void> => {
  const params = GetEmailCampaignParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [campaign] = await db.select().from(emailCampaignsTable).where(eq(emailCampaignsTable.id, params.data.id)).limit(1);
  if (!campaign) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }
  const recipients = await db.select().from(emailCampaignRecipientsTable)
    .where(eq(emailCampaignRecipientsTable.campaignId, campaign.id))
    .orderBy(emailCampaignRecipientsTable.id);
  res.json({ ...toCampaignJson(campaign), recipients });
});

// Sends every recipient in the background, rotating round-robin across the
// active sender accounts, and updates the campaign/recipient rows as it
// goes so the CRM can poll for live progress.
async function runCampaign(
  campaignId: number,
  recipients: { email: string; name?: string | null | undefined }[],
  subject: string,
  body: string,
) {
  const senders = await db.select().from(emailSenderAccountsTable).where(eq(emailSenderAccountsTable.active, true));
  if (!senders.length) {
    await db.update(emailCampaignsTable).set({ status: "failed" }).where(eq(emailCampaignsTable.id, campaignId));
    return;
  }

  const transporters = senders.map((s) => ({ account: s, transporter: getSenderTransporter(s) }));
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i]!;
    const { account, transporter } = transporters[i % transporters.length]!;
    try {
      await transporter.sendMail({
        from: `"${account.fromName || account.label}" <${account.fromEmail}>`,
        to: recipient.email,
        subject,
        html: body,
      });
      sent++;
      await db.insert(emailCampaignRecipientsTable).values({
        campaignId, recipientEmail: recipient.email, recipientName: recipient.name ?? null,
        senderAccountId: account.id, status: "sent", sentAt: new Date(),
      });
    } catch (err) {
      failed++;
      await db.insert(emailCampaignRecipientsTable).values({
        campaignId, recipientEmail: recipient.email, recipientName: recipient.name ?? null,
        senderAccountId: account.id, status: "failed",
        error: err instanceof Error ? err.message : "Failed to send",
      });
    }
    await db.update(emailCampaignsTable).set({ sentCount: sent, failedCount: failed })
      .where(eq(emailCampaignsTable.id, campaignId));
    // Small pacing delay between sends so a burst doesn't trip provider rate limits.
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  await db.update(emailCampaignsTable).set({ status: "completed" }).where(eq(emailCampaignsTable.id, campaignId));
}

router.post("/crm/email-marketing/campaigns", requirePermission("emailMarketing", "create"), async (req, res): Promise<void> => {
  const parsed = CreateEmailCampaignBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;
  const filters: EmailCampaignFilters = {
    cities: parseCsv(data.cities),
    states: parseCsv(data.states),
    industries: parseCsv(data.industries),
  };
  const recipients = await resolveRecipients(data.recipientSource, filters);
  if (!recipients.length) {
    res.status(400).json({ error: "No recipients with an email address match those filters." });
    return;
  }
  const [activeSenderCount] = await db.select({ value: sql<number>`count(*)::int` }).from(emailSenderAccountsTable)
    .where(eq(emailSenderAccountsTable.active, true));
  if (!activeSenderCount || activeSenderCount.value === 0) {
    res.status(400).json({ error: "Add at least one active sender email account before sending." });
    return;
  }

  const [campaign] = await db.insert(emailCampaignsTable).values({
    subject: data.subject,
    body: data.body,
    recipientSource: data.recipientSource,
    filters,
    totalRecipients: recipients.length,
    status: "sending",
  }).returning();

  runCampaign(campaign!.id, recipients, data.subject, data.body).catch(async (err) => {
    await db.update(emailCampaignsTable).set({ status: "failed" }).where(eq(emailCampaignsTable.id, campaign!.id));
    // eslint-disable-next-line no-console
    console.error("Bulk email campaign failed", err);
  });

  res.status(201).json(toCampaignJson(campaign!));
});

export default router;
