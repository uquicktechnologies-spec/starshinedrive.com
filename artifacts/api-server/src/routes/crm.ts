import { and, count, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";
import ExcelJS from "exceljs";
import multer from "multer";
import {
  CreateCustomerBody, CreateInquiryBody, CreateProductBody, CreateQuotationBody,
  CreateSalesExecutiveBody, GetCrmDashboardResponse, ListCustomersResponse,
  ListInquiriesResponse, ListProductsResponse, ListQuotationsResponse,
  ListSalesExecutivesResponse, UpdateCustomerBody, UpdateCustomerParams, UpdateInquiryBody,
  UpdateInquiryParams, UpdateProductBody, UpdateProductParams, UpdateQuotationBody,
  UpdateQuotationParams, UpdateSalesExecutiveBody, UpdateSalesExecutiveParams,
  UpdateSellerSettingsBody, SendTestEmailBody, BulkSetProductMinStockBody,
} from "@workspace/api-zod";
import {
  customersTable, db, inquiriesTable, productsTable, quotationsTable,
  salesExecutivesTable, sellerSettingsTable, warehousesTable, productStockTable,
  stockHistoryTable, categoriesTable, subGroupsTable, type QuotationItem,
} from "@workspace/db";
import { requireStaff, requirePermission, type StaffRequest } from "../lib/staffAuth";
import { hasPermission } from "@workspace/permissions";
import { adjustStock, InsufficientStockError } from "../lib/stockAdjust";

const router: IRouter = Router();

export { requireStaff };

const DEFAULT_INQUIRY_RECIPIENT = "sales@starshinedrive.com";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function inquirySubject(contactPerson: string, companyName: string | null): string {
  const name = contactPerson.replace(/[\r\n]+/g, " ").trim().slice(0, 120);
  const company = companyName?.replace(/[\r\n]+/g, " ").trim().slice(0, 120);
  return `New website inquiry: ${name}${company ? ` — ${company}` : ""}`;
}

async function sendInquiryNotification(inquiry: typeof inquiriesTable.$inferSelect): Promise<void> {
  const settings = await getOrCreateSettings();
  const transporter = getSmtpTransporter(settings);
  if (!transporter) {
    throw new Error("SMTP is not configured for inquiry notifications");
  }

  const recipient = settings.email?.trim()
    || process.env.INQUIRY_NOTIFICATION_EMAIL?.trim()
    || DEFAULT_INQUIRY_RECIPIENT;
  const fromName = settings.smtpFromName || settings.companyName || "Starshine Drive";
  const fromEmail = settings.smtpFromEmail || settings.smtpUser;
  const productInterest = inquiry.productInterest.length > 0
    ? inquiry.productInterest.join(", ")
    : "Not specified";
  const optionalDetails = [
    ["Company", inquiry.companyName],
    ["Phone", inquiry.phone],
    ["Address / Country", inquiry.address],
    ["Industry", inquiry.industry],
    ["Purpose", inquiry.purpose],
    ["Quantity", inquiry.quantity],
    ["Products", productInterest],
    ["Lead source", inquiry.leadSource],
  ].filter(([, value]) => value);
  const textDetails = optionalDetails.map(([label, value]) => `${label}: ${value}`).join("\n");
  const htmlDetails = optionalDetails
    .map(([label, value]) => `<tr><th align="left" valign="top">${escapeHtml(String(label))}</th><td>${escapeHtml(String(value))}</td></tr>`)
    .join("");

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: recipient,
    replyTo: inquiry.email,
    subject: inquirySubject(inquiry.contactPerson, inquiry.companyName),
    text: [
      "A new inquiry was submitted through the Starshine Drive website.",
      "",
      `Contact: ${inquiry.contactPerson}`,
      `Email: ${inquiry.email}`,
      textDetails,
      "",
      "Message:",
      inquiry.message,
    ].join("\n"),
    html: `
      <h2>New website inquiry</h2>
      <p>A new inquiry was submitted through the Starshine Drive website.</p>
      <table cellpadding="6" cellspacing="0" border="0">
        <tr><th align="left" valign="top">Contact</th><td>${escapeHtml(inquiry.contactPerson)}</td></tr>
        <tr><th align="left" valign="top">Email</th><td>${escapeHtml(inquiry.email)}</td></tr>
        ${htmlDetails}
      </table>
      <h3>Message</h3>
      <p>${escapeHtml(inquiry.message).replace(/\n/g, "<br />")}</p>
    `,
  });
}

export function optionalText(value: string | null | undefined): string | null | undefined {
  return value === "" ? null : value;
}

router.post("/inquiries", async (req, res): Promise<void> => {
  const parsed = CreateInquiryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const [inquiry] = await db.insert(inquiriesTable).values({
    ...data,
    companyName: optionalText(data.companyName),
    phone: optionalText(data.phone),
    address: optionalText(data.address),
    industry: optionalText(data.industry),
    purpose: optionalText(data.purpose),
    quantity: optionalText(data.quantity),
    productInterest: data.productInterest ?? [],
  }).returning();

  try {
    await sendInquiryNotification(inquiry);
  } catch (error) {
    req.log?.error({ err: error, inquiryId: inquiry.id }, "Inquiry saved but notification email failed");
    res.status(503).json({
      error: "Your request was saved, but we could not notify the sales team. Please try again shortly or contact us directly.",
    });
    return;
  }

  res.status(201).json(inquiry);
});

router.use("/crm", requireStaff);

// -------------------- Seller settings (singleton) --------------------

const DEFAULT_TERMS = "Terms & Conditions of Sale\n\n1) Goods, Services, Software, License Keys, Activation Codes, Digital Downloads, and Subscription Services once sold, delivered, or activated shall not be accepted back and are non-refundable.";

export async function getOrCreateSettings() {
  const [existing] = await db.select().from(sellerSettingsTable).limit(1);
  if (existing) return existing;
  const [created] = await db.insert(sellerSettingsTable).values({
    defaultTerms: DEFAULT_TERMS,
  }).returning();
  return created;
}

function toSettingsJson(settings: typeof sellerSettingsTable.$inferSelect) {
  const { smtpPassword, ...rest } = settings;
  return {
    ...rest,
    defaultGstPercent: Number(settings.defaultGstPercent),
    smtpConfigured: !!(settings.smtpHost && settings.smtpUser && smtpPassword),
  };
}

router.get("/crm/settings", requirePermission("settings", "view"), async (_req, res): Promise<void> => {
  const settings = await getOrCreateSettings();
  res.json(toSettingsJson(settings));
});

router.put("/crm/settings", requirePermission("settings", "edit"), async (req, res): Promise<void> => {
  const parsed = UpdateSellerSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const current = await getOrCreateSettings();
  const data = parsed.data;
  const [settings] = await db.update(sellerSettingsTable).set({
    ...data,
    // An empty string means "leave the stored password unchanged" so the UI never has to redisplay it.
    smtpPassword: data.smtpPassword === undefined || data.smtpPassword === "" ? undefined : data.smtpPassword,
    defaultGstPercent: data.defaultGstPercent === undefined ? undefined : String(data.defaultGstPercent),
  }).where(eq(sellerSettingsTable.id, current.id)).returning();
  res.json(toSettingsJson(settings));
});

export function getSmtpTransporter(settings: typeof sellerSettingsTable.$inferSelect) {
  if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPassword) return null;
  return nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort || (settings.smtpSecure ? 465 : 587),
    secure: settings.smtpSecure,
    auth: { user: settings.smtpUser, pass: settings.smtpPassword },
  });
}

router.post("/crm/settings/test-email", requirePermission("settings", "edit"), async (req, res): Promise<void> => {
  const parsed = SendTestEmailBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const settings = await getOrCreateSettings();
  const transporter = getSmtpTransporter(settings);
  if (!transporter) {
    res.json({ success: false, message: "SMTP is not fully configured. Please fill in host, username, and password first." });
    return;
  }
  const fromName = settings.smtpFromName || settings.companyName || "Starshine Drive";
  const fromEmail = settings.smtpFromEmail || settings.smtpUser;
  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: parsed.data.to,
      subject: "Test Email from Starshine Drive CRM",
      text: "This is a test email confirming your SMTP email integration is working correctly.",
      html: "<p>This is a test email confirming your SMTP email integration is working correctly.</p>",
    });
    res.json({ success: true, message: `Test email sent to ${parsed.data.to}.` });
  } catch (err) {
    res.json({ success: false, message: err instanceof Error ? err.message : "Failed to send test email." });
  }
});

// -------------------- Dashboard --------------------

const QUOTATION_STATUSES = ["Draft", "Sent", "Viewed", "Accepted", "Rejected", "Expired", "Converted"] as const;

function toQuotationJson(quotation: typeof quotationsTable.$inferSelect) {
  return {
    ...quotation,
    subtotal: Number(quotation.subtotal),
    discountTotal: Number(quotation.discountTotal),
    taxableValue: Number(quotation.taxableValue),
    cgstAmount: Number(quotation.cgstAmount),
    sgstAmount: Number(quotation.sgstAmount),
    igstAmount: Number(quotation.igstAmount),
    amount: Number(quotation.amount),
  };
}

router.get("/crm/dashboard", requirePermission("dashboard", "view"), async (_req, res): Promise<void> => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [allQuotations, [customerCount], [leadCount], recentQuotations] = await Promise.all([
    db.select().from(quotationsTable),
    db.select({ count: count() }).from(customersTable),
    db.select({ count: count() }).from(inquiriesTable),
    db.select().from(quotationsTable).orderBy(desc(quotationsTable.createdAt), desc(quotationsTable.id)).limit(6),
  ]);

  const statusCounts = Object.fromEntries(
    QUOTATION_STATUSES.map((status) => [status, 0]),
  ) as Record<(typeof QUOTATION_STATUSES)[number], number>;
  let totalValue = 0;
  let wonValue = 0;
  let decided = 0;
  let quotationsThisMonth = 0;
  for (const quotation of allQuotations) {
    const amount = Number(quotation.amount);
    totalValue += amount;
    if (quotation.status in statusCounts) {
      statusCounts[quotation.status as (typeof QUOTATION_STATUSES)[number]] += 1;
    }
    if (quotation.status === "Accepted" || quotation.status === "Converted") {
      wonValue += amount;
    }
    if (["Accepted", "Rejected", "Converted", "Expired"].includes(quotation.status)) {
      decided += 1;
    }
    if (quotation.createdAt >= startOfMonth) {
      quotationsThisMonth += 1;
    }
  }

  res.json(GetCrmDashboardResponse.parse({
    totalQuotations: allQuotations.length,
    quotationsThisMonth,
    totalValue,
    wonValue,
    conversionRate: decided > 0 ? Math.round(((statusCounts.Accepted + statusCounts.Converted) / decided) * 10000) / 100 : 0,
    statusCounts,
    recentQuotations: recentQuotations.map(toQuotationJson),
    customerCount: customerCount?.count ?? 0,
    leadCount: leadCount?.count ?? 0,
  }));
});

// -------------------- Customers --------------------

router.get("/crm/customers", requirePermission("customers", "view"), async (_req, res): Promise<void> => {
  const customers = await db.select().from(customersTable).orderBy(desc(customersTable.createdAt), desc(customersTable.id));
  res.json(ListCustomersResponse.parse(customers));
});

router.post("/crm/customers", requirePermission("customers", "create"), async (req, res): Promise<void> => {
  const parsed = CreateCustomerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;
  const [customer] = await db.insert(customersTable).values({
    companyName: data.companyName,
    contactPerson: optionalText(data.contactPerson),
    designation: optionalText(data.designation),
    email: optionalText(data.email),
    phone: optionalText(data.phone),
    altPhone: optionalText(data.altPhone),
    gstin: optionalText(data.gstin),
    pan: optionalText(data.pan),
    cin: optionalText(data.cin),
    stateCode: optionalText(data.stateCode),
    addressLine1: optionalText(data.addressLine1),
    addressLine2: optionalText(data.addressLine2),
    city: optionalText(data.city),
    state: optionalText(data.state),
    country: data.country || "India",
    pincode: optionalText(data.pincode),
    notes: optionalText(data.notes),
    leadSource: data.leadSource ?? "Manual",
    reference: optionalText(data.reference),
  }).returning();
  res.status(201).json(customer);
});

router.patch("/crm/customers/:id", requirePermission("customers", "edit"), async (req, res): Promise<void> => {
  const params = UpdateCustomerParams.safeParse(req.params);
  const parsed = UpdateCustomerBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    const error = !params.success ? params.error.message : parsed.error?.message ?? "Invalid request";
    res.status(400).json({ error });
    return;
  }
  const data = parsed.data;
  const [customer] = await db.update(customersTable).set({
    ...data,
    contactPerson: optionalText(data.contactPerson),
    designation: optionalText(data.designation),
    email: optionalText(data.email),
    phone: optionalText(data.phone),
    altPhone: optionalText(data.altPhone),
    gstin: optionalText(data.gstin),
    pan: optionalText(data.pan),
    cin: optionalText(data.cin),
    stateCode: optionalText(data.stateCode),
    addressLine1: optionalText(data.addressLine1),
    addressLine2: optionalText(data.addressLine2),
    city: optionalText(data.city),
    state: optionalText(data.state),
    pincode: optionalText(data.pincode),
    notes: optionalText(data.notes),
    reference: optionalText(data.reference),
  }).where(eq(customersTable.id, params.data.id)).returning();
  if (!customer) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }
  res.json(customer);
});

router.get("/crm/customers/sample-template", requirePermission("customers", "create"), async (req, res): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Customers");
  sheet.columns = [
    { header: "Company Name", key: "companyName", width: 30 },
    { header: "Contact Person", key: "contactPerson", width: 22 },
    { header: "Email", key: "email", width: 26 },
    { header: "Mobile No.", key: "phone", width: 16 },
    { header: "GSTIN", key: "gstin", width: 20 },
    { header: "CIN No.", key: "cin", width: 20 },
    { header: "State Code", key: "stateCode", width: 12 },
    { header: "Address Line 1", key: "addressLine1", width: 30 },
    { header: "Address Line 2", key: "addressLine2", width: 30 },
    { header: "Address Line 3", key: "addressLine3", width: 30 },
    { header: "City", key: "city", width: 18 },
    { header: "State", key: "state", width: 18 },
    { header: "Lead Source", key: "leadSource", width: 16 },
    { header: "Reference", key: "reference", width: 18 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.addRow({ companyName: "Acme Engineering Pvt Ltd", contactPerson: "Ramesh Kumar", email: "ramesh@acme.example", phone: "9876543210", gstin: "", cin: "", stateCode: "", addressLine1: "", addressLine2: "", addressLine3: "", city: "Pune", state: "Maharashtra", leadSource: "Manual", reference: "" });
  sheet.addRow({ companyName: "Bright Motors Ltd", contactPerson: "Priya Shah", email: "priya@brightmotors.example", phone: "9123456780", gstin: "", cin: "", stateCode: "", addressLine1: "", addressLine2: "", addressLine3: "", city: "Ahmedabad", state: "Gujarat", leadSource: "Manual", reference: "" });

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", 'attachment; filename="customers-sample.xlsx"');
  await workbook.xlsx.write(res);
  res.end();
});

router.post(
  "/crm/customers/bulk-upload",
  requirePermission("customers", "create"),
  (req, res, next) => {
    excelUpload.single("file")(req, res, (err) => {
      if (err) { res.status(400).json({ error: err.message || "Failed to read uploaded file" }); return; }
      next();
    });
  },
  async (req, res): Promise<void> => {
    if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }

    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.load(req.file.buffer as unknown as ExcelJS.Buffer);
    } catch {
      res.status(400).json({ error: "Could not read the uploaded file. Please upload a valid .xlsx file." });
      return;
    }
    const sheet = workbook.worksheets[0];
    if (!sheet) { res.status(400).json({ error: "The uploaded file has no sheets." }); return; }

    const headerRow = sheet.getRow(1);
    const headerIndex = new Map<string, number>();
    headerRow.eachCell((cell, colNumber) => {
      const label = String(cell.value ?? "").trim().toLowerCase();
      if (label) headerIndex.set(label, colNumber);
    });
    const nameCol = headerIndex.get("company name") ?? headerIndex.get("name") ?? headerIndex.get("company");
    if (!nameCol) {
      res.status(400).json({ error: "The uploaded file must have a 'Company Name' column." });
      return;
    }
    const contactCol = headerIndex.get("contact person") ?? headerIndex.get("contact");
    const emailCol = headerIndex.get("email");
    const phoneCol = headerIndex.get("mobile no.") ?? headerIndex.get("mobile no") ?? headerIndex.get("phone") ?? headerIndex.get("mobile");
    const gstinCol = headerIndex.get("gstin");
    const cinCol = headerIndex.get("cin no.") ?? headerIndex.get("cin no") ?? headerIndex.get("cin");
    const stateCodeCol = headerIndex.get("state code");
    const addressCol = headerIndex.get("address line 1") ?? headerIndex.get("address");
    const address2Col = headerIndex.get("address line 2");
    const address3Col = headerIndex.get("address line 3");
    const cityCol = headerIndex.get("city");
    const stateCol = headerIndex.get("state");
    const leadSourceCol = headerIndex.get("lead source");
    const referenceCol = headerIndex.get("reference");

    const cellText = (row: ExcelJS.Row, col: number | undefined): string => {
      if (!col) return "";
      const v = row.getCell(col).value;
      if (v == null) return "";
      if (typeof v === "object" && "text" in (v as { text?: string })) return String((v as { text?: string }).text ?? "").trim();
      return String(v).trim();
    };

    const existing = await db.select({ name: customersTable.companyName }).from(customersTable);
    const seenNames = new Set(existing.map((c) => c.name.trim().toLowerCase()));

    const toInsert: (typeof customersTable.$inferInsert)[] = [];
    const skipped: { row: number; name: string; reason: string }[] = [];

    for (let r = 2; r <= sheet.rowCount; r++) {
      const row = sheet.getRow(r);
      const isBlank = row.cellCount === 0 || row.values == null || (row.values as unknown[]).every((v) => v == null || v === "");
      if (isBlank) continue;

      const companyName = cellText(row, nameCol);
      if (!companyName) { skipped.push({ row: r, name: "", reason: "Missing company name" }); continue; }

      const key = companyName.toLowerCase();
      if (seenNames.has(key)) { skipped.push({ row: r, name: companyName, reason: "Duplicate company name" }); continue; }

      seenNames.add(key);
      toInsert.push({
        companyName,
        contactPerson: cellText(row, contactCol) || null,
        email: cellText(row, emailCol) || null,
        phone: cellText(row, phoneCol) || null,
        gstin: cellText(row, gstinCol) || null,
        cin: cellText(row, cinCol) || null,
        stateCode: cellText(row, stateCodeCol) || null,
        addressLine1: cellText(row, addressCol) || null,
        addressLine2: cellText(row, address2Col) || null,
        addressLine3: cellText(row, address3Col) || null,
        city: cellText(row, cityCol) || null,
        state: cellText(row, stateCol) || null,
        leadSource: cellText(row, leadSourceCol) || "Manual",
        reference: cellText(row, referenceCol) || null,
      });
    }

    const inserted = toInsert.length ? await db.insert(customersTable).values(toInsert).returning() : [];
    res.status(200).json({
      insertedCount: inserted.length,
      skippedCount: skipped.length,
      inserted,
      skipped,
    });
  },
);

// -------------------- Website leads (inquiries) --------------------

router.get("/crm/inquiries", requirePermission("leads", "view"), async (_req, res): Promise<void> => {
  const inquiries = await db.select().from(inquiriesTable).orderBy(desc(inquiriesTable.createdAt), desc(inquiriesTable.id));
  res.json(ListInquiriesResponse.parse(inquiries));
});

router.patch("/crm/inquiries/:id", requirePermission("leads", "edit"), async (req, res): Promise<void> => {
  const params = UpdateInquiryParams.safeParse(req.params);
  const parsed = UpdateInquiryBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    const error = !params.success ? params.error.message : parsed.error?.message ?? "Invalid request";
    res.status(400).json({ error });
    return;
  }
  const [inquiry] = await db.update(inquiriesTable).set(parsed.data)
    .where(eq(inquiriesTable.id, params.data.id)).returning();
  if (!inquiry) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }
  res.json(inquiry);
});

// -------------------- Sales executives --------------------

router.get("/crm/sales-executives", requirePermission("salesExecutives", "view"), async (req, res): Promise<void> => {
  const activeOnly = req.query.activeOnly === "true" || req.query.activeOnly === "1";
  const query = db.select().from(salesExecutivesTable);
  const executives = await (activeOnly ? query.where(eq(salesExecutivesTable.active, true)) : query)
    .orderBy(desc(salesExecutivesTable.createdAt), desc(salesExecutivesTable.id));
  res.json(ListSalesExecutivesResponse.parse(executives));
});

router.post("/crm/sales-executives", requirePermission("salesExecutives", "create"), async (req, res): Promise<void> => {
  const parsed = CreateSalesExecutiveBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;
  const [executive] = await db.insert(salesExecutivesTable).values({
    name: data.name,
    employeeCode: optionalText(data.employeeCode),
    designation: optionalText(data.designation),
    email: optionalText(data.email),
    phone: optionalText(data.phone),
    altPhone: optionalText(data.altPhone),
    region: optionalText(data.region),
    city: optionalText(data.city),
    state: optionalText(data.state),
    joiningDate: optionalText(data.joiningDate),
    active: data.active ?? true,
    notes: optionalText(data.notes),
  }).returning();
  res.status(201).json(executive);
});

router.patch("/crm/sales-executives/:id", requirePermission("salesExecutives", "edit"), async (req, res): Promise<void> => {
  const params = UpdateSalesExecutiveParams.safeParse(req.params);
  const parsed = UpdateSalesExecutiveBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    const error = !params.success ? params.error.message : parsed.error?.message ?? "Invalid request";
    res.status(400).json({ error });
    return;
  }
  const data = parsed.data;
  const [executive] = await db.update(salesExecutivesTable).set({
    ...data,
    employeeCode: optionalText(data.employeeCode),
    designation: optionalText(data.designation),
    email: optionalText(data.email),
    phone: optionalText(data.phone),
    altPhone: optionalText(data.altPhone),
    region: optionalText(data.region),
    city: optionalText(data.city),
    state: optionalText(data.state),
    joiningDate: optionalText(data.joiningDate),
    notes: optionalText(data.notes),
  }).where(eq(salesExecutivesTable.id, params.data.id)).returning();
  if (!executive) {
    res.status(404).json({ error: "Sales executive not found" });
    return;
  }
  res.json(executive);
});

// -------------------- Quotations --------------------

function computeTotals(items: QuotationItem[], taxType: string) {
  let subtotal = 0;
  let discountTotal = 0;
  let taxableValue = 0;
  let taxTotal = 0;
  for (const item of items) {
    const lineAmount = item.qty * item.rate;
    const lineDiscount = lineAmount * (item.discPercent / 100);
    const lineTaxable = lineAmount - lineDiscount;
    const lineTax = taxType === "none" ? 0 : lineTaxable * (item.gstPercent / 100);
    subtotal += lineAmount;
    discountTotal += lineDiscount;
    taxableValue += lineTaxable;
    taxTotal += lineTax;
  }
  const cgstAmount = taxType === "cgst_sgst" ? taxTotal / 2 : 0;
  const sgstAmount = taxType === "cgst_sgst" ? taxTotal / 2 : 0;
  const igstAmount = taxType === "igst" ? taxTotal : 0;
  const amount = taxableValue + cgstAmount + sgstAmount + igstAmount;
  return {
    subtotal: subtotal.toFixed(2),
    discountTotal: discountTotal.toFixed(2),
    taxableValue: taxableValue.toFixed(2),
    cgstAmount: cgstAmount.toFixed(2),
    sgstAmount: sgstAmount.toFixed(2),
    igstAmount: igstAmount.toFixed(2),
    amount: amount.toFixed(2),
  };
}

// Generates the next quotation number *inside* an already-open transaction.
// The caller's transaction must complete the quotation insert before
// committing, so the row lock taken here (via `for("update")`) is held for
// the whole request — that's what stops two concurrent quotation creates
// from reading the same sequence value and computing a duplicate number.
async function nextQuotationNumber(tx: Parameters<Parameters<typeof db.transaction>[0]>[0]): Promise<string> {
  const [existing] = await tx.select().from(sellerSettingsTable).limit(1).for("update");
  const settings = existing ?? (await tx.insert(sellerSettingsTable).values({
    defaultTerms: DEFAULT_TERMS,
  }).returning())[0]!;
  const sequence = settings.numberingNextSequence;
  await tx.update(sellerSettingsTable).set({
    numberingNextSequence: sequence + 1,
  }).where(eq(sellerSettingsTable.id, settings.id));
  return `${settings.numberingPrefix}${String(sequence).padStart(settings.numberingPadding, "0")}`;
}

router.get("/crm/quotations", requirePermission("quotations", "view"), async (_req, res): Promise<void> => {
  const quotations = await db.select().from(quotationsTable).orderBy(desc(quotationsTable.createdAt), desc(quotationsTable.id));
  res.json(ListQuotationsResponse.parse(quotations.map(toQuotationJson)));
});

router.post("/crm/quotations", requirePermission("quotations", "create"), async (req, res): Promise<void> => {
  const parsed = CreateQuotationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;

  if (data.customerId) {
    const customer = await db.query.customersTable.findFirst({
      where: eq(customersTable.id, data.customerId),
    });
    if (!customer) {
      res.status(400).json({ error: "Choose an existing customer" });
      return;
    }
  }

  const taxType = data.taxType || "cgst_sgst";
  const totals = computeTotals(data.items, taxType);

  // Number generation and the insert must share one transaction: the
  // sellerSettings row lock taken in nextQuotationNumber has to stay held
  // until the quotation row is committed, or two concurrent requests can
  // both grab the same sequence value and fail the unique constraint.
  const quotation = await db.transaction(async (tx) => {
    const quotationNumber = await nextQuotationNumber(tx);
    const [row] = await tx.insert(quotationsTable).values({
      quotationNumber,
      customerId: data.customerId,
      inquiryId: data.inquiryId,
      salesExecutiveId: data.salesExecutiveId,
      subject: data.subject,
      quotationDate: optionalText(data.quotationDate) ?? new Date().toISOString().slice(0, 10),
      validUntil: optionalText(data.validUntil),
      deliveryTime: optionalText(data.deliveryTime),
      referenceNumber: optionalText(data.referenceNumber),
      taxType,
      billToCompany: data.billToCompany,
      billToContact: optionalText(data.billToContact),
      billToEmail: optionalText(data.billToEmail),
      billToPhone: optionalText(data.billToPhone),
      billToGstin: optionalText(data.billToGstin),
      billToStateCode: optionalText(data.billToStateCode),
      billToCity: optionalText(data.billToCity),
      billToState: optionalText(data.billToState),
      billToAddress: optionalText(data.billToAddress),
      items: data.items,
      ...totals,
      currency: data.currency ?? "INR",
      status: data.status ?? "Draft",
      notes: optionalText(data.notes),
      termsAndConditions: optionalText(data.termsAndConditions),
    }).returning();
    return row!;
  });
  res.status(201).json(toQuotationJson(quotation));
});

// Status values that represent a final decision on a quotation -- moving into one of
// these is "approving" (or rejecting) it, not just editing draft fields, so it is
// gated separately from general edit access (Phase 1 gap, closed per user decision:
// only admin/manager may approve).
const QUOTATION_DECISION_STATUSES = new Set(["Accepted", "Rejected", "Converted"]);

router.patch("/crm/quotations/:id", requirePermission("quotations", "edit"), async (req, res): Promise<void> => {
  const params = UpdateQuotationParams.safeParse(req.params);
  const parsed = UpdateQuotationBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    const error = !params.success ? params.error.message : parsed.error?.message ?? "Invalid request";
    res.status(400).json({ error });
    return;
  }
  const data = parsed.data;

  const existing = await db.query.quotationsTable.findFirst({
    where: eq(quotationsTable.id, params.data.id),
  });
  if (!existing) {
    res.status(404).json({ error: "Quotation not found" });
    return;
  }

  const isDecisionChange = !!data.status && data.status !== existing.status && QUOTATION_DECISION_STATUSES.has(data.status);
  if (isDecisionChange) {
    const sreq = req as StaffRequest;
    const role = sreq.staffRole;
    if (!role || !hasPermission(role, "quotations", "approve")) {
      res.status(403).json({ error: "You do not have permission to approve or reject quotations" });
      return;
    }
  }

  const items = data.items ?? existing.items;
  const taxType = data.taxType ?? existing.taxType;
  const totals = data.items || data.taxType ? computeTotals(items, taxType) : undefined;

  const [quotation] = await db.update(quotationsTable).set({
    ...data,
    quotationDate: optionalText(data.quotationDate),
    validUntil: optionalText(data.validUntil),
    deliveryTime: optionalText(data.deliveryTime),
    referenceNumber: optionalText(data.referenceNumber),
    billToContact: optionalText(data.billToContact),
    billToEmail: optionalText(data.billToEmail),
    billToPhone: optionalText(data.billToPhone),
    billToGstin: optionalText(data.billToGstin),
    billToStateCode: optionalText(data.billToStateCode),
    billToCity: optionalText(data.billToCity),
    billToState: optionalText(data.billToState),
    billToAddress: optionalText(data.billToAddress),
    notes: optionalText(data.notes),
    termsAndConditions: optionalText(data.termsAndConditions),
    ...totals,
  }).where(eq(quotationsTable.id, params.data.id)).returning();
  res.json(toQuotationJson(quotation!));
});

// -------------------- Products & services --------------------

function toProductJson(product: typeof productsTable.$inferSelect) {
  return { ...product, unitPrice: Number(product.unitPrice), gstPercent: Number(product.gstPercent) };
}

router.get("/crm/products", requirePermission("products", "view"), async (_req, res): Promise<void> => {
  const products = await db.select().from(productsTable).orderBy(desc(productsTable.createdAt), desc(productsTable.id));
  res.json(ListProductsResponse.parse(products.map(toProductJson)));
});

async function nextProductCode(): Promise<string> {
  return db.transaction(async (tx) => {
    const [{ value: maxId } = { value: 0 }] = await tx.select({ value: count() }).from(productsTable);
    let seq = maxId + 1;
    // Guard against gaps colliding with an already-used code (e.g. after deletes).
    for (let i = 0; i < 50; i++) {
      const code = `PRD-${String(seq).padStart(6, "0")}`;
      const [existing] = await tx.select({ id: productsTable.id }).from(productsTable).where(eq(productsTable.productCode, code)).limit(1);
      if (!existing) return code;
      seq++;
    }
    return `PRD-${Date.now()}`;
  });
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function getOrCreateDefaultWarehouseTx(tx: Tx): Promise<typeof warehousesTable.$inferSelect> {
  const [existing] = await tx.select().from(warehousesTable).orderBy(desc(warehousesTable.isDefault), warehousesTable.id).limit(1);
  if (existing) return existing;
  const [created] = await tx.insert(warehousesTable).values({ name: "Main Warehouse", isDefault: true }).returning();
  return created!;
}

router.post("/crm/products", requirePermission("products", "create"), async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;
  const productCode = await nextProductCode();
  const openingStock = data.openingStock ?? 0;

  const product = await db.transaction(async (tx) => {
    const [created] = await tx.insert(productsTable).values({
      productName: data.productName,
      description: optionalText(data.description),
      hsnSac: optionalText(data.hsnSac),
      unit: data.unit || "Nos",
      unitPrice: String(data.unitPrice),
      gstPercent: String(data.gstPercent),
      imageUrl: optionalText(data.imageUrl),
      productCode,
      barcode: productCode,
      qrCode: productCode,
      categoryId: data.categoryId ?? null,
      subGroupId: data.subGroupId ?? null,
      brand: optionalText(data.brand),
      model: optionalText(data.model),
      minStock: data.minStock ?? 0,
      maxStock: data.maxStock ?? 0,
      openingStock,
      trackBatch: data.trackBatch ?? false,
      trackExpiry: data.trackExpiry ?? false,
    }).returning();

    if (openingStock > 0) {
      const warehouse = await getOrCreateDefaultWarehouseTx(tx);
      await adjustStock(tx, created!.id, warehouse.id, openingStock);
      await tx.insert(stockHistoryTable).values({
        productId: created!.id, warehouseId: warehouse.id, type: "opening",
        quantity: openingStock, refType: "opening_stock", notes: "Opening stock on product creation",
      });
    }

    return created!;
  });
  res.status(201).json(toProductJson(product));
});

router.get("/crm/products/sample-template", requirePermission("products", "create"), async (req, res): Promise<void> => {
  const categories = await db.select({ name: categoriesTable.name }).from(categoriesTable).orderBy(categoriesTable.name);
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Products");
  sheet.columns = [
    { header: "Product Name", key: "productName", width: 30 },
    { header: "Category", key: "category", width: 24 },
    { header: "Sub Group", key: "subGroup", width: 24 },
    { header: "HSN/SAC", key: "hsnSac", width: 14 },
    { header: "Unit", key: "unit", width: 10 },
    { header: "Unit Price", key: "unitPrice", width: 14 },
    { header: "GST %", key: "gstPercent", width: 10 },
    { header: "Brand", key: "brand", width: 18 },
    { header: "Model", key: "model", width: 18 },
    { header: "Min Stock", key: "minStock", width: 12 },
    { header: "Max Stock", key: "maxStock", width: 12 },
    { header: "Opening Stock", key: "openingStock", width: 14 },
  ];
  sheet.getRow(1).font = { bold: true };
  const sampleCategory = categories[0]?.name ?? "Helical Gearboxes";
  sheet.addRow({ productName: "Helical Gearbox 1HP", category: sampleCategory, subGroup: "", hsnSac: "8483", unit: "Nos", unitPrice: 12500, gstPercent: 18, brand: "Starshine", model: "SH-1", minStock: 5, maxStock: 50, openingStock: 0 });
  sheet.addRow({ productName: "Helical Gearbox 2HP", category: sampleCategory, subGroup: "", hsnSac: "8483", unit: "Nos", unitPrice: 18500, gstPercent: 18, brand: "Starshine", model: "SH-2", minStock: 5, maxStock: 50, openingStock: 0 });

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", 'attachment; filename="products-sample.xlsx"');
  await workbook.xlsx.write(res);
  res.end();
});

const excelUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb: multer.FileFilterCallback) => {
    const okType = /spreadsheet|excel/i.test(file.mimetype) || /\.xlsx?$/i.test(file.originalname);
    if (okType) cb(null, true);
    else cb(new Error("Only .xlsx/.xls files are supported"));
  },
});

router.post(
  "/crm/products/bulk-upload",
  requirePermission("products", "create"),
  (req, res, next) => {
    excelUpload.single("file")(req, res, (err) => {
      if (err) { res.status(400).json({ error: err.message || "Failed to read uploaded file" }); return; }
      next();
    });
  },
  async (req, res): Promise<void> => {
    if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }

    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.load(req.file.buffer as unknown as ExcelJS.Buffer);
    } catch {
      res.status(400).json({ error: "Could not read the uploaded file. Please upload a valid .xlsx file." });
      return;
    }
    const sheet = workbook.worksheets[0];
    if (!sheet) { res.status(400).json({ error: "The uploaded file has no sheets." }); return; }

    const headerRow = sheet.getRow(1);
    const headerIndex = new Map<string, number>();
    headerRow.eachCell((cell, colNumber) => {
      const label = String(cell.value ?? "").trim().toLowerCase();
      if (label) headerIndex.set(label, colNumber);
    });
    const nameCol = headerIndex.get("product name") ?? headerIndex.get("name");
    if (!nameCol) {
      res.status(400).json({ error: "The uploaded file must have a 'Product Name' column." });
      return;
    }
    const categoryCol = headerIndex.get("category");
    const subGroupCol = headerIndex.get("sub group") ?? headerIndex.get("sub group name");
    const hsnCol = headerIndex.get("hsn/sac") ?? headerIndex.get("hsn") ?? headerIndex.get("hsn sac");
    const unitCol = headerIndex.get("unit");
    const priceCol = headerIndex.get("unit price") ?? headerIndex.get("price") ?? headerIndex.get("rate");
    const gstCol = headerIndex.get("gst %") ?? headerIndex.get("gst") ?? headerIndex.get("gst percent");
    const brandCol = headerIndex.get("brand");
    const modelCol = headerIndex.get("model");
    const minStockCol = headerIndex.get("min stock");
    const maxStockCol = headerIndex.get("max stock");
    const openingStockCol = headerIndex.get("opening stock");

    const cellText = (row: ExcelJS.Row, col: number | undefined): string => {
      if (!col) return "";
      const v = row.getCell(col).value;
      if (v == null) return "";
      if (typeof v === "object" && "text" in (v as { text?: string })) return String((v as { text?: string }).text ?? "").trim();
      return String(v).trim();
    };
    const cellNumber = (row: ExcelJS.Row, col: number | undefined, fallback: number): number => {
      const text = cellText(row, col);
      if (!text) return fallback;
      const n = Number(text);
      return Number.isFinite(n) ? n : fallback;
    };

    const categories = await db.select({ id: categoriesTable.id, name: categoriesTable.name }).from(categoriesTable);
    const categoryByName = new Map(categories.map((c) => [c.name.trim().toLowerCase(), c.id]));
    const subGroups = await db.select({ id: subGroupsTable.id, name: subGroupsTable.name, categoryId: subGroupsTable.categoryId }).from(subGroupsTable);

    const existingProducts = await db.select({ name: productsTable.productName }).from(productsTable);
    const seenNames = new Set(existingProducts.map((p) => p.name.trim().toLowerCase()));

    type ToInsert = {
      productName: string; description: null; hsnSac: string | null; unit: string; unitPrice: string; gstPercent: string;
      categoryId: number | null; subGroupId: number | null; brand: string | null; model: string | null;
      minStock: number; maxStock: number; openingStock: number;
    };
    const toInsert: ToInsert[] = [];
    const skipped: { row: number; name: string; reason: string }[] = [];

    for (let r = 2; r <= sheet.rowCount; r++) {
      const row = sheet.getRow(r);
      const isBlank = row.cellCount === 0 || row.values == null || (row.values as unknown[]).every((v) => v == null || v === "");
      if (isBlank) continue;

      const productName = cellText(row, nameCol);
      if (!productName) { skipped.push({ row: r, name: "", reason: "Missing product name" }); continue; }

      const key = productName.toLowerCase();
      if (seenNames.has(key)) { skipped.push({ row: r, name: productName, reason: "Duplicate product name" }); continue; }

      const categoryName = cellText(row, categoryCol);
      const categoryId = categoryName ? categoryByName.get(categoryName.toLowerCase()) ?? null : null;
      if (categoryName && !categoryId) { skipped.push({ row: r, name: productName, reason: `Unknown category "${categoryName}"` }); continue; }

      const subGroupName = cellText(row, subGroupCol);
      let subGroupId: number | null = null;
      if (subGroupName) {
        const match = subGroups.find((sg) => sg.name.trim().toLowerCase() === subGroupName.toLowerCase() && (categoryId == null || sg.categoryId === categoryId));
        if (!match) { skipped.push({ row: r, name: productName, reason: `Unknown sub group "${subGroupName}"` }); continue; }
        subGroupId = match.id;
      }

      seenNames.add(key);
      toInsert.push({
        productName,
        description: null,
        hsnSac: cellText(row, hsnCol) || null,
        unit: cellText(row, unitCol) || "Nos",
        unitPrice: String(cellNumber(row, priceCol, 0)),
        gstPercent: String(cellNumber(row, gstCol, 18)),
        categoryId,
        subGroupId,
        brand: cellText(row, brandCol) || null,
        model: cellText(row, modelCol) || null,
        minStock: cellNumber(row, minStockCol, 0),
        maxStock: cellNumber(row, maxStockCol, 0),
        openingStock: cellNumber(row, openingStockCol, 0),
      });
    }

    const inserted: (typeof productsTable.$inferSelect)[] = [];
    for (const item of toInsert) {
      const productCode = await nextProductCode();
      const created = await db.transaction(async (tx) => {
        const [row] = await tx.insert(productsTable).values({
          ...item,
          productCode,
          barcode: productCode,
          qrCode: productCode,
          trackBatch: false,
          trackExpiry: false,
        }).returning();
        if (item.openingStock > 0) {
          const warehouse = await getOrCreateDefaultWarehouseTx(tx);
          await adjustStock(tx, row!.id, warehouse.id, item.openingStock);
          await tx.insert(stockHistoryTable).values({
            productId: row!.id, warehouseId: warehouse.id, type: "opening",
            quantity: item.openingStock, refType: "opening_stock", notes: "Opening stock on bulk upload",
          });
        }
        return row!;
      });
      inserted.push(created);
    }

    res.status(200).json({
      insertedCount: inserted.length,
      skippedCount: skipped.length,
      inserted: inserted.map(toProductJson),
      skipped,
    });
  },
);

// -------------------- Quotation PDF --------------------

const NAVY = "#093C71";
const ORANGE = "#EF6F24";
const SLATE = "#475569";

function formatDateDMY(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const [y, m, d] = dateStr.split("T")[0].split("-");
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
}

export async function fetchLogoBuffer(logoUrl: string | null | undefined): Promise<Buffer | null> {
  if (!logoUrl || !logoUrl.startsWith("/objects/")) return null;
  try {
    const { ObjectStorageService } = await import("../lib/objectStorage");
    const service = new ObjectStorageService();
    const file = await service.getObjectEntityFile(logoUrl);
    const [buffer] = await file.download();
    // pdfkit's doc.image() only understands JPEG and PNG -- logos uploaded
    // as WebP (or anything else) silently fail to render, so normalize to
    // PNG first.
    const sharp = (await import("sharp")).default;
    return await sharp(buffer).png().toBuffer();
  } catch {
    return null;
  }
}

router.get("/crm/quotations/:id/pdf", requirePermission("quotations", "export"), async (req, res): Promise<void> => {
  const params = UpdateQuotationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const quotation = await db.query.quotationsTable.findFirst({
    where: eq(quotationsTable.id, params.data.id),
  });
  if (!quotation) {
    res.status(404).json({ error: "Quotation not found" });
    return;
  }
  const settings = await getOrCreateSettings();
  const logoBuffer = await fetchLogoBuffer(settings.logoUrl);
  const companyName = settings.companyName || "Starshine Drive";

  const doc = new PDFDocument({ size: "A4", margin: 40, bufferPages: true });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${quotation.quotationNumber}.pdf"`);
  doc.pipe(res);

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const left = doc.page.margins.left;

  // -------- Header --------
  let headerTop = doc.y;
  if (logoBuffer) {
    try { doc.image(logoBuffer, left, headerTop, { fit: [110, 60] }); } catch { /* ignore invalid image */ }
  }
  const infoX = left + (logoBuffer ? 130 : 0);
  doc.fillColor(NAVY).fontSize(16).font("Helvetica-Bold").text(companyName, infoX, headerTop, { width: pageWidth - (infoX - left) - 170 });
  doc.fillColor(SLATE).fontSize(8).font("Helvetica");
  const addrLines = [settings.address, [settings.city, settings.state, settings.pincode].filter(Boolean).join(", ")].filter(Boolean);
  if (addrLines.length) doc.text(addrLines.join("\n"), infoX, doc.y, { width: pageWidth - (infoX - left) - 170 });
  const contactBits = [settings.gstin ? `GSTIN: ${settings.gstin}` : null, settings.phone, settings.email].filter(Boolean);
  if (contactBits.length) doc.text(contactBits.join("  |  "), infoX, doc.y, { width: pageWidth - (infoX - left) - 170 });

  doc.fillColor(ORANGE).fontSize(22).font("Helvetica-Bold").text("QUOTATION", left, headerTop, { width: pageWidth, align: "right" });
  doc.fillColor(SLATE).fontSize(9).font("Helvetica");
  const metaTop = doc.y;
  doc.text(`Quotation No: ${quotation.quotationNumber}`, left, metaTop, { width: pageWidth, align: "right" });
  doc.text(`Date: ${formatDateDMY(quotation.quotationDate)}`, left, doc.y, { width: pageWidth, align: "right" });
  doc.text(`Valid Until: ${formatDateDMY(quotation.validUntil)}`, left, doc.y, { width: pageWidth, align: "right" });
  if (quotation.deliveryTime) doc.text(`Delivery Date: ${formatDateDMY(quotation.deliveryTime)}`, left, doc.y, { width: pageWidth, align: "right" });
  if (quotation.referenceNumber) doc.text(`Reference: ${quotation.referenceNumber}`, left, doc.y, { width: pageWidth, align: "right" });

  doc.moveDown(1.5);
  doc.moveTo(left, doc.y).lineTo(left + pageWidth, doc.y).strokeColor(NAVY).lineWidth(1.5).stroke();
  doc.moveDown(0.8);

  // -------- Customer detail --------
  doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold").text("Customer Detail", left, doc.y);
  doc.moveDown(0.3);
  const custTop = doc.y;
  doc.fillColor("#1e293b").fontSize(9).font("Helvetica-Bold").text(quotation.billToCompany, left, custTop, { width: pageWidth / 2 });
  doc.font("Helvetica").fillColor(SLATE);
  if (quotation.billToContact) doc.text(quotation.billToContact, left, doc.y, { width: pageWidth / 2 });
  if (quotation.billToAddress) doc.text(quotation.billToAddress, left, doc.y, { width: pageWidth / 2 });
  const cityLine = [quotation.billToCity, quotation.billToState].filter(Boolean).join(", ");
  if (cityLine) doc.text(cityLine, left, doc.y, { width: pageWidth / 2 });

  const rightColX = left + pageWidth / 2;
  doc.font("Helvetica").fillColor(SLATE).fontSize(9);
  doc.text(quotation.billToGstin ? `GSTIN: ${quotation.billToGstin}` : "", rightColX, custTop, { width: pageWidth / 2, align: "right" });
  if (quotation.billToPhone) doc.text(`Mo. No.: ${quotation.billToPhone}`, rightColX, doc.y, { width: pageWidth / 2, align: "right" });
  if (quotation.billToEmail) doc.text(quotation.billToEmail, rightColX, doc.y, { width: pageWidth / 2, align: "right" });

  doc.moveDown(1);
  doc.moveTo(left, doc.y).lineTo(left + pageWidth, doc.y).strokeColor("#cbd5e1").lineWidth(0.5).stroke();
  doc.moveDown(0.8);

  // -------- Items table --------
  const cols = [
    { key: "sr", label: "Sr.", width: 25, align: "left" as const },
    { key: "desc", label: "Description", width: pageWidth - 25 - 55 - 40 - 75 - 45 - 85, align: "left" as const },
    { key: "hsn", label: "HSN/SAC", width: 55, align: "left" as const },
    { key: "qty", label: "Qty", width: 40, align: "right" as const },
    { key: "rate", label: "Rate", width: 75, align: "right" as const },
    { key: "gst", label: "GST%", width: 45, align: "right" as const },
    { key: "amount", label: "Amount", width: 85, align: "right" as const },
  ];
  const tableX = left;
  let colX = tableX;
  const colXs = cols.map((c) => { const x = colX; colX += c.width; return x; });

  function tableHeader() {
    const rowTop = doc.y;
    doc.rect(tableX, rowTop, pageWidth, 20).fill(NAVY);
    doc.fillColor("#fff").fontSize(8).font("Helvetica-Bold");
    cols.forEach((c, i) => doc.text(c.label, colXs[i]! + 4, rowTop + 6, { width: c.width - 8, align: c.align }));
    doc.y = rowTop + 20;
  }
  tableHeader();

  const items = (quotation.items as QuotationItem[]) || [];
  doc.font("Helvetica").fontSize(8.5).fillColor("#1e293b");
  items.forEach((item, idx) => {
    if (doc.y > doc.page.height - doc.page.margins.bottom - 150) {
      doc.addPage();
      tableHeader();
    }
    const rowTop = doc.y;
    const lineAmount = item.qty * item.rate;
    const lineDiscount = lineAmount * (item.discPercent / 100);
    const lineTaxable = lineAmount - lineDiscount;
    const values = [
      String(idx + 1),
      item.description ? `${item.itemName}\n${item.description}` : item.itemName,
      item.hsnSac || "-",
      String(item.qty),
      item.rate.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      `${item.gstPercent}%`,
      lineTaxable.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    ];
    const rowHeight = Math.max(18, doc.heightOfString(values[1]!, { width: cols[1]!.width - 8 }) + 8);
    if (idx % 2 === 1) doc.rect(tableX, rowTop, pageWidth, rowHeight).fill("#f8fafc").fillColor("#1e293b");
    cols.forEach((c, i) => doc.text(values[i]!, colXs[i]! + 4, rowTop + 4, { width: c.width - 8, align: c.align }));
    doc.y = rowTop + rowHeight;
  });
  doc.moveTo(tableX, doc.y).lineTo(tableX + pageWidth, doc.y).strokeColor("#cbd5e1").lineWidth(0.5).stroke();
  doc.moveDown(0.6);

  // -------- Totals --------
  const totalsX = left + pageWidth - 220;
  function totalRow(label: string, value: string, bold = false) {
    doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(bold ? 10 : 9).fillColor(bold ? NAVY : SLATE);
    const y = doc.y;
    doc.text(label, totalsX, y, { width: 120, align: "left" });
    doc.text(value, totalsX + 120, y, { width: 100, align: "right" });
    doc.moveDown(0.35);
  }
  totalRow("Subtotal", Number(quotation.subtotal).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  if (Number(quotation.discountTotal) > 0) {
    totalRow("Discount", `-${Number(quotation.discountTotal).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  }
  totalRow("Taxable Value", Number(quotation.taxableValue).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  if (quotation.taxType === "cgst_sgst") {
    totalRow("CGST", Number(quotation.cgstAmount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    totalRow("SGST", Number(quotation.sgstAmount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  } else if (quotation.taxType === "igst") {
    totalRow("IGST", Number(quotation.igstAmount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  }
  doc.moveTo(totalsX, doc.y).lineTo(totalsX + 220, doc.y).strokeColor(NAVY).lineWidth(1).stroke();
  doc.moveDown(0.3);
  totalRow("Total", `${quotation.currency} ${Number(quotation.amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, true);

  doc.moveDown(1);

  // -------- Terms & conditions --------
  const terms = quotation.termsAndConditions || settings.defaultTerms;
  if (terms) {
    if (doc.y > doc.page.height - doc.page.margins.bottom - 100) doc.addPage();
    doc.font("Helvetica-Bold").fontSize(9).fillColor(NAVY).text("Terms & Conditions", left, doc.y);
    doc.moveDown(0.2);
    doc.font("Helvetica").fontSize(8).fillColor(SLATE).text(terms, left, doc.y, { width: pageWidth });
  }
  // -------- Banking details --------
  const hasBankDetails = settings.bankName || settings.accountNumber || settings.ifsc || settings.branch || settings.upiId;
  if (hasBankDetails) {
    if (doc.y > doc.page.height - doc.page.margins.bottom - 100) doc.addPage();
    doc.moveDown(0.6);
    doc.font("Helvetica-Bold").fontSize(9).fillColor(NAVY).text("Bank Details", left, doc.y);
    doc.moveDown(0.2);
    doc.font("Helvetica").fontSize(8).fillColor(SLATE);
    if (settings.bankName) doc.text(`Bank Name: ${settings.bankName}`, left, doc.y, { width: pageWidth });
    if (settings.accountNumber) doc.text(`Account Number: ${settings.accountNumber}`, left, doc.y, { width: pageWidth });
    if (settings.ifsc) doc.text(`IFSC Code: ${settings.ifsc}`, left, doc.y, { width: pageWidth });
    if (settings.branch) doc.text(`Branch: ${settings.branch}`, left, doc.y, { width: pageWidth });
    if (settings.upiId) doc.text(`UPI ID: ${settings.upiId}`, left, doc.y, { width: pageWidth });
  }

  const notes = quotation.notes || settings.defaultNotes;
  if (notes) {
    if (doc.y > doc.page.height - doc.page.margins.bottom - 100) doc.addPage();
    doc.moveDown(0.6);
    doc.font("Helvetica-Bold").fontSize(9).fillColor(NAVY).text("Notes", left, doc.y);
    doc.moveDown(0.2);
    doc.font("Helvetica").fontSize(8).fillColor(SLATE).text(notes, left, doc.y, { width: pageWidth });
  }

  // -------- Footer --------
  doc.moveDown(1.2);
  if (doc.y > doc.page.height - doc.page.margins.bottom - 80) doc.addPage();
  doc.moveTo(left, doc.y).lineTo(left + pageWidth, doc.y).strokeColor("#cbd5e1").lineWidth(0.5).stroke();
  doc.moveDown(0.5);
  doc.font("Helvetica").fontSize(8).fillColor(SLATE);
  if (settings.gstin) doc.text(`GST No. ${settings.gstin}`, left, doc.y, { width: pageWidth / 2 });
  doc.font("Helvetica-Bold").fontSize(9).fillColor(NAVY).text(`For, ${companyName.toUpperCase()}`, left, doc.y, { width: pageWidth, align: "right" });
  if (settings.authorisedSignatoryName) {
    doc.moveDown(1.6);
    doc.font("Helvetica").fontSize(8).fillColor(SLATE).text(settings.authorisedSignatoryName, left, doc.y, { width: pageWidth, align: "right" });
    doc.text("Authorised Signatory", left, doc.y, { width: pageWidth, align: "right" });
  }
  doc.moveDown(0.8);
  const contactLine = [settings.email, settings.phone].filter(Boolean).join(", ");
  if (contactLine) {
    doc.fontSize(7.5).fillColor(SLATE).text(`If you have any questions about this price quote, please contact ${contactLine}`, left, doc.y, { width: pageWidth, align: "center" });
  }
  doc.font("Helvetica-Bold").fontSize(8).fillColor(ORANGE).text("Thank You For Your Business!", left, doc.y, { width: pageWidth, align: "center" });

  doc.end();
});

router.patch("/crm/products/:id", requirePermission("products", "edit"), async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    const error = !params.success ? params.error.message : parsed.error?.message ?? "Invalid request";
    res.status(400).json({ error });
    return;
  }
  const data = parsed.data;

  let product: typeof productsTable.$inferSelect | undefined;
  try {
    product = await db.transaction(async (tx) => {
      const existing = await tx.query.productsTable.findFirst({ where: eq(productsTable.id, params.data.id) });
      if (!existing) return undefined;

      const [updated] = await tx.update(productsTable).set({
        productName: data.productName,
        unit: data.unit,
        description: optionalText(data.description),
        hsnSac: optionalText(data.hsnSac),
        imageUrl: optionalText(data.imageUrl),
        categoryId: data.categoryId === undefined ? undefined : data.categoryId,
        subGroupId: data.subGroupId === undefined ? undefined : data.subGroupId,
        brand: optionalText(data.brand),
        model: optionalText(data.model),
        minStock: data.minStock,
        maxStock: data.maxStock,
        openingStock: data.openingStock,
        trackBatch: data.trackBatch,
        trackExpiry: data.trackExpiry,
        unitPrice: data.unitPrice === undefined ? undefined : String(data.unitPrice),
        gstPercent: data.gstPercent === undefined ? undefined : String(data.gstPercent),
      }).where(eq(productsTable.id, params.data.id)).returning();

      // Reconcile the materialized warehouse balance/ledger if opening stock changed,
      // so the field on the product record never drifts from the actual stock ledger.
      if (data.openingStock !== undefined && data.openingStock !== existing.openingStock) {
        const delta = data.openingStock - existing.openingStock;
        const warehouse = await getOrCreateDefaultWarehouseTx(tx);
        await adjustStock(tx, existing.id, warehouse.id, delta);
        await tx.insert(stockHistoryTable).values({
          productId: existing.id, warehouseId: warehouse.id,
          type: delta >= 0 ? "adjustment_increase" : "adjustment_decrease",
          quantity: Math.abs(delta), refType: "opening_stock_edit",
          notes: "Opening stock corrected via product edit",
        });
      }

      return updated;
    });
  } catch (err) {
    if (err instanceof InsufficientStockError) {
      res.status(409).json({ error: `Cannot reduce opening stock below what's already been consumed: only ${err.available} currently in stock` });
      return;
    }
    throw err;
  }

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(toProductJson(product));
});

router.post("/crm/products/bulk-min-stock", requirePermission("products", "edit"), async (req, res): Promise<void> => {
  const parsed = BulkSetProductMinStockBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const result = await db.update(productsTable).set({ minStock: parsed.data.minStock }).returning({ id: productsTable.id });
  res.json({ updated: result.length });
});

export default router;
