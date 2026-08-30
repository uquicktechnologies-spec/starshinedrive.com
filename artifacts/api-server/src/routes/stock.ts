import { and, count, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import multer from "multer";
import {
  CreateCategoryBody, CreateStaffRoleBody, CreateSubGroupBody, CreateSupplierBody,
  CreateWarehouseBody, CreatePurchaseBody, CreateSaleBody, CreateStockAdjustmentBody,
  UpdateCategoryBody, UpdateCategoryParams, UpdateStaffRoleBody, UpdateStaffRoleParams,
  UpdateSubGroupBody, UpdateSubGroupParams, UpdateSupplierBody, UpdateSupplierParams,
  UpdateWarehouseBody, UpdateWarehouseParams, UpdatePurchaseBody, UpdatePurchaseParams,
  UpdateSaleBody, UpdateSaleParams, DeleteCategoryParams, DeleteSubGroupParams,
  DeletePurchaseParams, DeleteSaleParams, GetStockHistoryParams, SearchStockQueryParams,
  GetStockReportQueryParams,
} from "@workspace/api-zod";
import {
  db, categoriesTable, subGroupsTable, suppliersTable, warehousesTable, staffRolesTable,
  productsTable, productStockTable, stockHistoryTable, purchasesTable, salesTable,
  stockAdjustmentsTable, customersTable, type PurchaseSaleItem,
} from "@workspace/db";
import { requireStaff, requirePermission, getStaffRole, hashPassword, type StaffRequest } from "../lib/staffAuth";
import { getPermissionsForRole, hasPermission } from "@workspace/permissions";
import { adjustStock, getStockQty, InsufficientStockError } from "../lib/stockAdjust";
import { optionalText, getOrCreateSettings, fetchLogoBuffer } from "./crm";

const NAVY = "#093C71";
const ORANGE = "#EF6F24";
const SLATE = "#475569";

function formatDateDMY(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const [y, m, d] = dateStr.split("T")[0].split("-");
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
}

export async function renderDocPdf(
  res: import("express").Response,
  opts: {
    docTitle: string; docNumber: string; date: string; partyLabel: string; partyName: string;
    // Extra party detail lines (contact person, phone, email, GSTIN, address, etc.)
    // rendered under the party name -- previously only the name was shown.
    partyDetails?: (string | null | undefined)[];
    items: PurchaseSaleItem[]; subtotal: number; discountTotal: number; gstTotal: number; totalAmount: number; notes?: string | null;
  },
): Promise<void> {
  const settings = await getOrCreateSettings();
  const logoBuffer = await fetchLogoBuffer(settings.logoUrl);
  const companyName = settings.companyName || "Starshine Drive";

  const productIds = [...new Set(opts.items.map(item => item.productId))];
  const imagesByProductId = new Map<number, Buffer>();
  if (productIds.length) {
    const productRows = await db.select({ id: productsTable.id, imageUrl: productsTable.imageUrl })
      .from(productsTable).where(inArray(productsTable.id, productIds));
    await Promise.all(productRows.map(async (p) => {
      const buf = await fetchLogoBuffer(p.imageUrl);
      if (buf) imagesByProductId.set(p.id, buf);
    }));
  }

  const doc = new PDFDocument({ size: "A4", margin: 40, bufferPages: true });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${opts.docNumber}.pdf"`);
  doc.pipe(res);

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const left = doc.page.margins.left;

  const headerTop = doc.y;
  if (logoBuffer) {
    try { doc.image(logoBuffer, left, headerTop, { fit: [110, 60] }); } catch { /* ignore invalid image */ }
  }
  const infoX = left + (logoBuffer ? 130 : 0);
  // Reserve just enough room on the right for the doc-title block (title +
  // "No: ..." + date), not a flat 170px -- that used to starve the company
  // address/contact column, forcing it to wrap mid-line (e.g. a trailing
  // "|" stranded at the end of a line with the email spilling to the next).
  const rightReserve = 150;
  const infoWidth = pageWidth - (infoX - left) - rightReserve;
  doc.fillColor(NAVY).fontSize(16).font("Helvetica-Bold").text(companyName, infoX, headerTop, { width: infoWidth });
  doc.fillColor(SLATE).fontSize(8).font("Helvetica");
  const addrLines = [settings.address, [settings.city, settings.state, settings.pincode].filter(Boolean).join(", ")].filter(Boolean);
  if (addrLines.length) doc.text(addrLines.join("\n"), infoX, doc.y, { width: infoWidth });
  // GSTIN+phone on one line, email on its own -- avoids an awkward mid-word
  // wrap when the combined "|"-joined line ran longer than the column.
  const gstPhoneLine = [settings.gstin ? `GSTIN: ${settings.gstin}` : null, settings.phone].filter(Boolean).join("   |   ");
  if (gstPhoneLine) doc.text(gstPhoneLine, infoX, doc.y, { width: infoWidth });
  if (settings.email) doc.text(settings.email, infoX, doc.y, { width: infoWidth });

  doc.fillColor(ORANGE).fontSize(20).font("Helvetica-Bold").text(opts.docTitle, left, headerTop, { width: pageWidth, align: "right" });
  doc.fillColor(SLATE).fontSize(9).font("Helvetica");
  doc.text(`${opts.docTitle} No: ${opts.docNumber}`, left, doc.y, { width: pageWidth, align: "right" });
  doc.text(`Date: ${formatDateDMY(opts.date)}`, left, doc.y, { width: pageWidth, align: "right" });

  doc.moveDown(1.2);
  doc.moveTo(left, doc.y).lineTo(left + pageWidth, doc.y).strokeColor(NAVY).lineWidth(1.5).stroke();
  doc.moveDown(0.6);

  doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold").text(`${opts.partyLabel}: `, left, doc.y, { continued: true });
  doc.fillColor(SLATE).font("Helvetica").text(opts.partyName || "-");
  const detailLines = (opts.partyDetails ?? []).filter((line): line is string => !!line && line.trim() !== "");
  if (detailLines.length) {
    doc.fontSize(8.5).fillColor(SLATE).text(detailLines.join("   |   "), left, doc.y, { width: pageWidth });
  }
  doc.moveDown(0.8);

  const colX = { name: left, qty: left + 220, price: left + 280, disc: left + 340, gst: left + 400, total: left + 460 };
  const colW = pageWidth - (colX.total - left);
  doc.fillColor(NAVY).fontSize(8).font("Helvetica-Bold");
  const headerY = doc.y;
  doc.text("Item", colX.name, headerY, { width: 220 });
  doc.text("Qty", colX.qty, headerY, { width: 55, align: "right" });
  doc.text("Price", colX.price, headerY, { width: 55, align: "right" });
  doc.text("Disc%", colX.disc, headerY, { width: 55, align: "right" });
  doc.text("GST%", colX.gst, headerY, { width: 55, align: "right" });
  doc.text("Total", colX.total, headerY, { width: colW, align: "right" });
  doc.y = headerY + 14;
  doc.moveDown(0.3);
  doc.moveTo(left, doc.y).lineTo(left + pageWidth, doc.y).strokeColor(SLATE).lineWidth(0.5).stroke();
  doc.moveDown(0.5);

  doc.font("Helvetica").fontSize(8.5).fillColor(SLATE);
  const imgSize = 22;
  for (const item of opts.items) {
    const lineAmount = item.quantity * item.price;
    const lineDiscount = lineAmount * (item.discPercent / 100);
    const lineTaxable = lineAmount - lineDiscount;
    const lineTotal = lineTaxable + lineTaxable * (item.gstPercent / 100);
    const rowY = doc.y;
    const imgBuf = imagesByProductId.get(item.productId);
    const nameX = imgBuf ? colX.name + imgSize + 6 : colX.name;
    const nameWidth = imgBuf ? 220 - imgSize - 6 : 220;
    if (imgBuf) {
      try { doc.image(imgBuf, colX.name, rowY, { fit: [imgSize, imgSize] }); } catch { /* ignore invalid image */ }
    }
    doc.text(item.productName, nameX, rowY, { width: nameWidth });
    doc.text(String(item.quantity), colX.qty, rowY, { width: 55, align: "right" });
    doc.text(item.price.toFixed(2), colX.price, rowY, { width: 55, align: "right" });
    doc.text(item.discPercent.toFixed(1), colX.disc, rowY, { width: 55, align: "right" });
    doc.text(item.gstPercent.toFixed(1), colX.gst, rowY, { width: 55, align: "right" });
    doc.text(lineTotal.toFixed(2), colX.total, rowY, { width: colW, align: "right" });
    if (imgBuf) doc.y = Math.max(doc.y, rowY + imgSize);
    doc.moveDown(0.5);
  }

  doc.moveDown(0.4);
  doc.moveTo(left, doc.y).lineTo(left + pageWidth, doc.y).strokeColor(SLATE).lineWidth(0.5).stroke();
  doc.moveDown(0.4);

  // Wider block with a label/value split (instead of "Label: value" run
  // together) and larger, more spaced-out type -- the old version was cramped
  // and the Total barely stood out from the lines above it.
  const totalsWidth = 240;
  const totalsX = left + pageWidth - totalsWidth;
  const totalsLabelWidth = 130;
  const totalsValueWidth = totalsWidth - totalsLabelWidth;
  const totalsRow = (label: string, value: string) => {
    const y = doc.y;
    doc.text(label, totalsX, y, { width: totalsLabelWidth, align: "left" });
    doc.text(value, totalsX + totalsLabelWidth, y, { width: totalsValueWidth, align: "right" });
  };
  doc.font("Helvetica").fontSize(10).fillColor(SLATE);
  totalsRow("Subtotal", opts.subtotal.toFixed(2));
  doc.moveDown(0.35);
  totalsRow("Discount", `-${opts.discountTotal.toFixed(2)}`);
  doc.moveDown(0.35);
  totalsRow("GST", opts.gstTotal.toFixed(2));
  doc.moveDown(0.5);
  doc.moveTo(totalsX, doc.y).lineTo(totalsX + totalsWidth, doc.y).strokeColor(SLATE).lineWidth(0.5).stroke();
  doc.moveDown(0.4);
  doc.font("Helvetica-Bold").fontSize(14).fillColor(NAVY);
  totalsRow("Total", opts.totalAmount.toFixed(2));

  if (opts.notes) {
    doc.moveDown(1);
    doc.font("Helvetica").fontSize(8.5).fillColor(SLATE).text(`Notes: ${opts.notes}`, left, doc.y, { width: pageWidth });
  }

  doc.end();
}

const router: IRouter = Router();

function staffEmail(req: StaffRequest): string | undefined {
  return req.staffEmail;
}

router.use("/crm", requireStaff);

// -------------------- Current user / roles --------------------

router.get("/crm/me", async (req, res): Promise<void> => {
  const sreq = req as StaffRequest;
  const email = staffEmail(sreq)!;
  const role = sreq.staffRole ?? await getStaffRole(email);
  // `permissions` is derived server-side from the same ROLE_PERMISSIONS matrix every
  // route guard uses -- the frontend renders off this, but it is never the enforcement
  // boundary: every mutating/reading route re-checks requirePermission() independently.
  res.json({ email, role, permissions: getPermissionsForRole(role) });
});

router.get("/crm/staff-roles", requirePermission("staffRoles", "view"), async (_req, res): Promise<void> => {
  const rows = await db.select().from(staffRolesTable).orderBy(desc(staffRolesTable.createdAt), desc(staffRolesTable.id));
  res.json(rows);
});

router.post("/crm/staff-roles", requirePermission("staffRoles", "create"), async (req, res): Promise<void> => {
  const parsed = CreateStaffRoleBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const data = parsed.data;
  const passwordHash = data.password ? await hashPassword(data.password) : undefined;
  const [row] = await db.insert(staffRolesTable).values({
    email: data.email.toLowerCase(),
    name: optionalText(data.name),
    role: data.role,
    salesExecutiveId: data.salesExecutiveId ?? null,
    ...(passwordHash ? { passwordHash } : {}),
  }).onConflictDoUpdate({
    target: staffRolesTable.email,
    set: {
      name: optionalText(data.name), role: data.role, salesExecutiveId: data.salesExecutiveId ?? null,
      ...(passwordHash ? { passwordHash } : {}),
    },
  }).returning();
  res.status(201).json(row);
});

router.patch("/crm/staff-roles/:id", requirePermission("staffRoles", "edit"), async (req, res): Promise<void> => {
  const params = UpdateStaffRoleParams.safeParse(req.params);
  const parsed = UpdateStaffRoleBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: !params.success ? params.error.message : parsed.error?.message }); return;
  }
  const { password, ...rest } = parsed.data;
  const passwordHash = password ? await hashPassword(password) : undefined;
  const [row] = await db.update(staffRolesTable).set({
    ...rest,
    name: optionalText(rest.name),
    ...(passwordHash ? { passwordHash } : {}),
  }).where(eq(staffRolesTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "Staff role not found" }); return; }
  res.json(row);
});

// -------------------- Categories --------------------

router.get("/crm/categories", requirePermission("categories", "view"), async (req, res): Promise<void> => {
  const activeOnly = req.query.activeOnly === "true" || req.query.activeOnly === "1";
  const query = db.select().from(categoriesTable);
  const rows = await (activeOnly ? query.where(eq(categoriesTable.status, "Active")) : query)
    .orderBy(categoriesTable.name, categoriesTable.id);
  res.json(rows);
});

router.post("/crm/categories", requirePermission("categories", "create"), async (req, res): Promise<void> => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const data = parsed.data;
  const [row] = await db.insert(categoriesTable).values({
    name: data.name, description: optionalText(data.description), status: data.status || "Active",
  }).returning();
  res.status(201).json(row);
});

router.patch("/crm/categories/:id", requirePermission("categories", "edit"), async (req, res): Promise<void> => {
  const params = UpdateCategoryParams.safeParse(req.params);
  const parsed = UpdateCategoryBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: !params.success ? params.error.message : parsed.error?.message }); return;
  }
  const [row] = await db.update(categoriesTable).set({
    ...parsed.data, description: optionalText(parsed.data.description),
  }).where(eq(categoriesTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "Category not found" }); return; }
  res.json(row);
});

router.delete("/crm/categories/:id", requirePermission("categories", "delete"), async (req, res): Promise<void> => {
  const params = DeleteCategoryParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(categoriesTable).where(eq(categoriesTable.id, params.data.id));
  res.status(204).end();
});

router.get("/crm/categories/sample-template", requirePermission("categories", "create"), async (req, res): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Categories");
  sheet.columns = [
    { header: "Name", key: "name", width: 28 },
    { header: "Description", key: "description", width: 40 },
    { header: "Status", key: "status", width: 14 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.addRow({ name: "Helical Gearboxes", description: "Helical gear reducers and drives", status: "Active" });
  sheet.addRow({ name: "Worm Gearboxes", description: "Worm gear reducers", status: "Active" });

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", 'attachment; filename="categories-sample.xlsx"');
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
  "/crm/categories/bulk-upload",
  requirePermission("categories", "create"),
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

    // Header row maps column labels (case-insensitive) to column index.
    const headerRow = sheet.getRow(1);
    const headerIndex = new Map<string, number>();
    headerRow.eachCell((cell, colNumber) => {
      const label = String(cell.value ?? "").trim().toLowerCase();
      if (label) headerIndex.set(label, colNumber);
    });
    const nameCol = headerIndex.get("name") ?? headerIndex.get("category") ?? headerIndex.get("category name");
    if (!nameCol) {
      res.status(400).json({ error: "The uploaded file must have a 'Name' column." });
      return;
    }
    const descCol = headerIndex.get("description");
    const statusCol = headerIndex.get("status");

    const cellText = (row: ExcelJS.Row, col: number | undefined): string => {
      if (!col) return "";
      const v = row.getCell(col).value;
      if (v == null) return "";
      if (typeof v === "object" && "text" in (v as { text?: string })) return String((v as { text?: string }).text ?? "").trim();
      return String(v).trim();
    };

    const existing = await db.select({ name: categoriesTable.name }).from(categoriesTable);
    const seenNames = new Set(existing.map((c) => c.name.trim().toLowerCase()));

    const toInsert: { name: string; description: string | null; status: string }[] = [];
    const skipped: { row: number; name: string; reason: string }[] = [];

    for (let r = 2; r <= sheet.rowCount; r++) {
      const row = sheet.getRow(r);
      const isBlank = row.cellCount === 0 || row.values == null || (row.values as unknown[]).every((v) => v == null || v === "");
      if (isBlank) continue;

      const name = cellText(row, nameCol);
      if (!name) { skipped.push({ row: r, name: "", reason: "Missing category name" }); continue; }

      const key = name.toLowerCase();
      if (seenNames.has(key)) { skipped.push({ row: r, name, reason: "Duplicate category name" }); continue; }

      seenNames.add(key);
      const description = descCol ? cellText(row, descCol) || null : null;
      const status = statusCol ? cellText(row, statusCol) || "Active" : "Active";
      toInsert.push({ name, description, status });
    }

    const inserted = toInsert.length ? await db.insert(categoriesTable).values(toInsert).returning() : [];
    res.status(200).json({
      insertedCount: inserted.length,
      skippedCount: skipped.length,
      inserted,
      skipped,
    });
  },
);

// -------------------- Sub groups --------------------

router.get("/crm/sub-groups", requirePermission("subGroups", "view"), async (req, res): Promise<void> => {
  const activeOnly = req.query.activeOnly === "true" || req.query.activeOnly === "1";
  const query = db.select().from(subGroupsTable);
  const rows = await (activeOnly ? query.where(eq(subGroupsTable.status, "Active")) : query)
    .orderBy(subGroupsTable.name, subGroupsTable.id);
  res.json(rows);
});

router.post("/crm/sub-groups", requirePermission("subGroups", "create"), async (req, res): Promise<void> => {
  const parsed = CreateSubGroupBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const data = parsed.data;
  const [row] = await db.insert(subGroupsTable).values({
    categoryId: data.categoryId, name: data.name, description: optionalText(data.description), status: data.status || "Active",
  }).returning();
  res.status(201).json(row);
});

router.patch("/crm/sub-groups/:id", requirePermission("subGroups", "edit"), async (req, res): Promise<void> => {
  const params = UpdateSubGroupParams.safeParse(req.params);
  const parsed = UpdateSubGroupBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: !params.success ? params.error.message : parsed.error?.message }); return;
  }
  const [row] = await db.update(subGroupsTable).set({
    ...parsed.data, description: optionalText(parsed.data.description),
  }).where(eq(subGroupsTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "Sub group not found" }); return; }
  res.json(row);
});

router.delete("/crm/sub-groups/:id", requirePermission("subGroups", "delete"), async (req, res): Promise<void> => {
  const params = DeleteSubGroupParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(subGroupsTable).where(eq(subGroupsTable.id, params.data.id));
  res.status(204).end();
});

router.get("/crm/sub-groups/sample-template", requirePermission("subGroups", "create"), async (req, res): Promise<void> => {
  const categories = await db.select({ name: categoriesTable.name }).from(categoriesTable).orderBy(categoriesTable.name);
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Sub Groups");
  sheet.columns = [
    { header: "Category", key: "category", width: 28 },
    { header: "Name", key: "name", width: 28 },
    { header: "Description", key: "description", width: 40 },
    { header: "Status", key: "status", width: 14 },
  ];
  sheet.getRow(1).font = { bold: true };
  const sampleCategory = categories[0]?.name ?? "Helical Gearboxes";
  sheet.addRow({ category: sampleCategory, name: "Foot Mounted", description: "Foot mounted variant", status: "Active" });
  sheet.addRow({ category: sampleCategory, name: "Flange Mounted", description: "Flange mounted variant", status: "Active" });

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", 'attachment; filename="sub-groups-sample.xlsx"');
  await workbook.xlsx.write(res);
  res.end();
});

router.post(
  "/crm/sub-groups/bulk-upload",
  requirePermission("subGroups", "create"),
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
    const nameCol = headerIndex.get("name") ?? headerIndex.get("sub group") ?? headerIndex.get("sub group name");
    const categoryCol = headerIndex.get("category") ?? headerIndex.get("category name");
    if (!nameCol) {
      res.status(400).json({ error: "The uploaded file must have a 'Name' column." });
      return;
    }
    if (!categoryCol) {
      res.status(400).json({ error: "The uploaded file must have a 'Category' column." });
      return;
    }
    const descCol = headerIndex.get("description");
    const statusCol = headerIndex.get("status");

    const cellText = (row: ExcelJS.Row, col: number | undefined): string => {
      if (!col) return "";
      const v = row.getCell(col).value;
      if (v == null) return "";
      if (typeof v === "object" && "text" in (v as { text?: string })) return String((v as { text?: string }).text ?? "").trim();
      return String(v).trim();
    };

    const categories = await db.select({ id: categoriesTable.id, name: categoriesTable.name }).from(categoriesTable);
    const categoryByName = new Map(categories.map((c) => [c.name.trim().toLowerCase(), c.id]));

    const existing = await db.select({ categoryId: subGroupsTable.categoryId, name: subGroupsTable.name }).from(subGroupsTable);
    const seenKeys = new Set(existing.map((sg) => `${sg.categoryId}::${sg.name.trim().toLowerCase()}`));

    const toInsert: { categoryId: number; name: string; description: string | null; status: string }[] = [];
    const skipped: { row: number; name: string; reason: string }[] = [];

    for (let r = 2; r <= sheet.rowCount; r++) {
      const row = sheet.getRow(r);
      const isBlank = row.cellCount === 0 || row.values == null || (row.values as unknown[]).every((v) => v == null || v === "");
      if (isBlank) continue;

      const name = cellText(row, nameCol);
      const categoryName = cellText(row, categoryCol);
      if (!name) { skipped.push({ row: r, name: "", reason: "Missing sub group name" }); continue; }
      if (!categoryName) { skipped.push({ row: r, name, reason: "Missing category name" }); continue; }

      const categoryId = categoryByName.get(categoryName.toLowerCase());
      if (!categoryId) { skipped.push({ row: r, name, reason: `Unknown category "${categoryName}"` }); continue; }

      const key = `${categoryId}::${name.toLowerCase()}`;
      if (seenKeys.has(key)) { skipped.push({ row: r, name, reason: "Duplicate sub group name in this category" }); continue; }

      seenKeys.add(key);
      const description = descCol ? cellText(row, descCol) || null : null;
      const status = statusCol ? cellText(row, statusCol) || "Active" : "Active";
      toInsert.push({ categoryId, name, description, status });
    }

    const inserted = toInsert.length ? await db.insert(subGroupsTable).values(toInsert).returning() : [];
    res.status(200).json({
      insertedCount: inserted.length,
      skippedCount: skipped.length,
      inserted,
      skipped,
    });
  },
);

// -------------------- Suppliers --------------------

function toSupplierJson(row: typeof suppliersTable.$inferSelect) {
  return { ...row, outstandingBalance: Number(row.outstandingBalance) };
}

router.get("/crm/suppliers", requirePermission("suppliers", "view"), async (req, res): Promise<void> => {
  const activeOnly = req.query.activeOnly === "true" || req.query.activeOnly === "1";
  const query = db.select().from(suppliersTable);
  const rows = await (activeOnly ? query.where(eq(suppliersTable.status, "Active")) : query)
    .orderBy(desc(suppliersTable.createdAt), desc(suppliersTable.id));
  res.json(rows.map(toSupplierJson));
});

router.post("/crm/suppliers", requirePermission("suppliers", "create"), async (req, res): Promise<void> => {
  const parsed = CreateSupplierBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const data = parsed.data;
  const [row] = await db.insert(suppliersTable).values({
    name: data.name,
    companyName: optionalText(data.companyName),
    gstin: optionalText(data.gstin),
    phone: optionalText(data.phone),
    email: optionalText(data.email),
    address: optionalText(data.address),
    outstandingBalance: String(data.outstandingBalance ?? 0),
    notes: optionalText(data.notes),
    status: data.status || "Active",
  }).returning();
  res.status(201).json(toSupplierJson(row));
});

router.patch("/crm/suppliers/:id", requirePermission("suppliers", "edit"), async (req, res): Promise<void> => {
  const params = UpdateSupplierParams.safeParse(req.params);
  const parsed = UpdateSupplierBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: !params.success ? params.error.message : parsed.error?.message }); return;
  }
  const data = parsed.data;
  const [row] = await db.update(suppliersTable).set({
    ...data,
    companyName: optionalText(data.companyName),
    gstin: optionalText(data.gstin),
    phone: optionalText(data.phone),
    email: optionalText(data.email),
    address: optionalText(data.address),
    outstandingBalance: data.outstandingBalance === undefined ? undefined : String(data.outstandingBalance),
    notes: optionalText(data.notes),
  }).where(eq(suppliersTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "Supplier not found" }); return; }
  res.json(toSupplierJson(row));
});

// -------------------- Warehouses --------------------

router.get("/crm/warehouses", requirePermission("warehouses", "view"), async (req, res): Promise<void> => {
  const activeOnly = req.query.activeOnly === "true" || req.query.activeOnly === "1";
  const query = db.select().from(warehousesTable);
  const rows = await (activeOnly ? query.where(eq(warehousesTable.status, "Active")) : query)
    .orderBy(warehousesTable.name, warehousesTable.id);
  res.json(rows);
});

router.post("/crm/warehouses", requirePermission("warehouses", "create"), async (req, res): Promise<void> => {
  const parsed = CreateWarehouseBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const data = parsed.data;
  const [row] = await db.insert(warehousesTable).values({
    name: data.name, location: optionalText(data.location), isDefault: data.isDefault ?? false, status: data.status || "Active",
  }).returning();
  res.status(201).json(row);
});

router.patch("/crm/warehouses/:id", requirePermission("warehouses", "edit"), async (req, res): Promise<void> => {
  const params = UpdateWarehouseParams.safeParse(req.params);
  const parsed = UpdateWarehouseBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: !params.success ? params.error.message : parsed.error?.message }); return;
  }
  const [row] = await db.update(warehousesTable).set({
    ...parsed.data, location: optionalText(parsed.data.location),
  }).where(eq(warehousesTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "Warehouse not found" }); return; }
  res.json(row);
});

async function getOrCreateDefaultWarehouse(): Promise<typeof warehousesTable.$inferSelect> {
  const [existing] = await db.select().from(warehousesTable).orderBy(desc(warehousesTable.isDefault), warehousesTable.id).limit(1);
  if (existing) return existing;
  const [created] = await db.insert(warehousesTable).values({ name: "Main Warehouse", isDefault: true }).returning();
  return created!;
}

// -------------------- Stock helpers --------------------
// adjustStock / getStockQty / InsufficientStockError now live in
// ../lib/stockAdjust.ts so this module and crm.ts share one implementation.

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

function computeItemTotals(items: PurchaseSaleItem[]) {
  let subtotal = 0, discountTotal = 0, gstTotal = 0;
  for (const item of items) {
    const lineAmount = item.quantity * item.price;
    const lineDiscount = lineAmount * (item.discPercent / 100);
    const lineTaxable = lineAmount - lineDiscount;
    const lineGst = lineTaxable * (item.gstPercent / 100);
    subtotal += lineAmount;
    discountTotal += lineDiscount;
    gstTotal += lineGst;
  }
  const totalAmount = subtotal - discountTotal + gstTotal;
  return {
    subtotal: subtotal.toFixed(2),
    discountTotal: discountTotal.toFixed(2),
    gstTotal: gstTotal.toFixed(2),
    totalAmount: totalAmount.toFixed(2),
  };
}

// Generates the next purchase/sale document number *inside* an already-open
// transaction. Takes a Postgres advisory lock keyed by `prefix` first, so
// concurrent purchase/sale creates for the same document type serialize
// around number generation instead of both reading the same "next free"
// number — the lock is released only when the caller's transaction (which
// must also perform the insert) commits or rolls back.
async function nextDocNumber(tx: Parameters<Parameters<typeof db.transaction>[0]>[0], prefix: string, table: typeof purchasesTable | typeof salesTable, column: "purchaseNumber" | "invoiceNumber"): Promise<string> {
  await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${prefix}))`);
  const [{ value }] = await tx.select({ value: count() }).from(table as typeof purchasesTable);
  let seq = value + 1;
  for (let i = 0; i < 50; i++) {
    const code = `${prefix}${String(seq).padStart(6, "0")}`;
    const [existing] = await tx.select({ id: (table as typeof purchasesTable).id }).from(table as typeof purchasesTable)
      .where(eq((table as typeof purchasesTable)[column as "purchaseNumber"], code)).limit(1);
    if (!existing) return code;
    seq++;
  }
  return `${prefix}${Date.now()}`;
}

// -------------------- Purchases --------------------

function toPurchaseJson(row: typeof purchasesTable.$inferSelect) {
  return {
    ...row,
    subtotal: Number(row.subtotal), discountTotal: Number(row.discountTotal),
    gstTotal: Number(row.gstTotal), totalAmount: Number(row.totalAmount),
  };
}

router.get("/crm/purchases", requirePermission("purchases", "view"), async (_req, res): Promise<void> => {
  const rows = await db.select().from(purchasesTable).orderBy(desc(purchasesTable.createdAt), desc(purchasesTable.id));
  res.json(rows.map(toPurchaseJson));
});

router.post("/crm/purchases", requirePermission("purchases", "create"), async (req, res): Promise<void> => {
  const parsed = CreatePurchaseBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const data = parsed.data;
  const totals = computeItemTotals(data.items);

  const result = await db.transaction(async (tx) => {
    const purchaseNumber = await nextDocNumber(tx, "PUR-", purchasesTable, "purchaseNumber");
    const [purchase] = await tx.insert(purchasesTable).values({
      purchaseNumber,
      purchaseDate: data.purchaseDate,
      supplierId: data.supplierId,
      warehouseId: data.warehouseId,
      invoiceNumber: optionalText(data.invoiceNumber),
      paymentMode: data.paymentMode || "Cash",
      items: data.items,
      ...totals,
      status: data.status || "Received",
      notes: optionalText(data.notes),
    }).returning();
    for (const item of data.items) {
      await adjustStock(tx, item.productId, data.warehouseId, item.quantity);
      await tx.insert(stockHistoryTable).values({
        productId: item.productId, warehouseId: data.warehouseId, type: "purchase",
        quantity: item.quantity, refType: "purchase", refId: purchase!.id,
        batchNumber: item.batchNumber, serialNumber: item.serialNumber,
        expiryDate: item.expiryDate, manufacturingDate: item.manufacturingDate,
        createdBy: staffEmail(req as StaffRequest),
      });
    }
    return purchase!;
  });
  res.status(201).json(toPurchaseJson(result));
});

router.get("/crm/purchases/:id/pdf", requirePermission("purchases", "export"), async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) { res.status(400).json({ error: "Invalid purchase id" }); return; }
  const purchase = await db.query.purchasesTable.findFirst({ where: eq(purchasesTable.id, id) });
  if (!purchase) { res.status(404).json({ error: "Purchase not found" }); return; }
  const [supplier] = await db.select().from(suppliersTable).where(eq(suppliersTable.id, purchase.supplierId)).limit(1);
  await renderDocPdf(res, {
    docTitle: "Purchase", docNumber: purchase.purchaseNumber, date: purchase.purchaseDate,
    partyLabel: "Supplier", partyName: supplier?.name ?? "-",
    partyDetails: supplier ? [
      supplier.phone, supplier.email, supplier.gstin ? `GSTIN: ${supplier.gstin}` : null, supplier.address,
    ] : [],
    items: purchase.items,
    subtotal: Number(purchase.subtotal), discountTotal: Number(purchase.discountTotal),
    gstTotal: Number(purchase.gstTotal), totalAmount: Number(purchase.totalAmount), notes: purchase.notes,
  });
});

router.patch("/crm/purchases/:id", requirePermission("purchases", "edit"), async (req, res): Promise<void> => {
  const params = UpdatePurchaseParams.safeParse(req.params);
  const parsed = UpdatePurchaseBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: !params.success ? params.error.message : parsed.error?.message }); return;
  }
  const data = parsed.data;
  const existing = await db.query.purchasesTable.findFirst({ where: eq(purchasesTable.id, params.data.id) });
  if (!existing) { res.status(404).json({ error: "Purchase not found" }); return; }

  const newWarehouseId = data.warehouseId ?? existing.warehouseId;
  const newItems = data.items ?? existing.items;
  const stockImpactChanged = !!data.items || (data.warehouseId !== undefined && data.warehouseId !== existing.warehouseId);
  const totals = data.items ? computeItemTotals(newItems) : {
    subtotal: existing.subtotal, discountTotal: existing.discountTotal,
    gstTotal: existing.gstTotal, totalAmount: existing.totalAmount,
  };

  let result: typeof purchasesTable.$inferSelect;
  try {
    result = await db.transaction(async (tx) => {
      if (stockImpactChanged) {
        // Reverse the original purchase's stock impact on its original
        // warehouse, then re-apply the new items against the (possibly new)
        // warehouse. If any already-received stock was subsequently sold
        // elsewhere, the reversal itself can throw InsufficientStockError,
        // which rolls back the whole transaction and blocks the edit.
        for (const item of existing.items) {
          await adjustStock(tx, item.productId, existing.warehouseId, -item.quantity);
          await tx.insert(stockHistoryTable).values({
            productId: item.productId, warehouseId: existing.warehouseId, type: "adjustment_decrease",
            quantity: item.quantity, refType: "purchase-edit-reversal", refId: existing.id,
            notes: "Purchase edited", createdBy: staffEmail(req as StaffRequest),
          });
        }
        for (const item of newItems) {
          await adjustStock(tx, item.productId, newWarehouseId, item.quantity);
          await tx.insert(stockHistoryTable).values({
            productId: item.productId, warehouseId: newWarehouseId, type: "purchase",
            quantity: item.quantity, refType: "purchase", refId: existing.id,
            batchNumber: item.batchNumber, serialNumber: item.serialNumber,
            expiryDate: item.expiryDate, manufacturingDate: item.manufacturingDate,
            createdBy: staffEmail(req as StaffRequest),
          });
        }
      }
      const [row] = await tx.update(purchasesTable).set({
        purchaseDate: data.purchaseDate ?? existing.purchaseDate,
        supplierId: data.supplierId ?? existing.supplierId,
        warehouseId: newWarehouseId,
        items: newItems,
        ...totals,
        status: data.status ?? existing.status,
        paymentMode: data.paymentMode ?? existing.paymentMode,
        notes: data.notes !== undefined ? optionalText(data.notes) : existing.notes,
        invoiceNumber: data.invoiceNumber !== undefined ? optionalText(data.invoiceNumber) : existing.invoiceNumber,
      }).where(eq(purchasesTable.id, existing.id)).returning();
      return row!;
    });
  } catch (err) {
    if (err instanceof InsufficientStockError) {
      const product = await db.query.productsTable.findFirst({ where: eq(productsTable.id, err.productId) });
      res.status(409).json({ error: `Insufficient stock for ${product?.productName ?? "product"}: only ${err.available} available, ${err.requested} requested` });
      return;
    }
    throw err;
  }
  res.json(toPurchaseJson(result));
});

router.delete("/crm/purchases/:id", requirePermission("purchases", "delete"), async (req, res): Promise<void> => {
  const params = DeletePurchaseParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const existing = await db.query.purchasesTable.findFirst({ where: eq(purchasesTable.id, params.data.id) });
  if (!existing) { res.status(404).json({ error: "Purchase not found" }); return; }
  await db.transaction(async (tx) => {
    for (const item of existing.items) {
      await adjustStock(tx, item.productId, existing.warehouseId, -item.quantity);
      await tx.insert(stockHistoryTable).values({
        productId: item.productId, warehouseId: existing.warehouseId, type: "adjustment_decrease",
        quantity: item.quantity, refType: "purchase-reversal", refId: existing.id,
        notes: "Purchase deleted", createdBy: staffEmail(req as StaffRequest),
      });
    }
    await tx.delete(purchasesTable).where(eq(purchasesTable.id, existing.id));
  });
  res.status(204).end();
});

// -------------------- Sales --------------------

function toSaleJson(row: typeof salesTable.$inferSelect) {
  return {
    ...row,
    subtotal: Number(row.subtotal), discountTotal: Number(row.discountTotal),
    gstTotal: Number(row.gstTotal), totalAmount: Number(row.totalAmount),
  };
}

router.get("/crm/sales", requirePermission("sales", "view"), async (_req, res): Promise<void> => {
  const rows = await db.select().from(salesTable).orderBy(desc(salesTable.createdAt), desc(salesTable.id));
  res.json(rows.map(toSaleJson));
});

router.post("/crm/sales", requirePermission("sales", "create"), async (req, res): Promise<void> => {
  const parsed = CreateSaleBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const data = parsed.data;

  // Cheap upfront check for a fast error before opening a transaction. This
  // aggregates duplicate product lines so two lines for the same product
  // are validated against their combined quantity, not each independently
  // against the same starting balance. The authoritative, race-safe check
  // happens inside the transaction via adjustStock's row lock below.
  const requestedByProduct = new Map<number, number>();
  for (const item of data.items) {
    requestedByProduct.set(item.productId, (requestedByProduct.get(item.productId) ?? 0) + item.quantity);
  }
  for (const [productId, requested] of requestedByProduct) {
    const available = await getStockQty(productId, data.warehouseId);
    if (available < requested) {
      const product = await db.query.productsTable.findFirst({ where: eq(productsTable.id, productId) });
      res.status(409).json({ error: `Insufficient stock for ${product?.productName ?? "product"}: only ${available} available, ${requested} requested` });
      return;
    }
  }

  const totals = computeItemTotals(data.items);

  let result: typeof salesTable.$inferSelect;
  try {
    result = await db.transaction(async (tx) => {
    const invoiceNumber = await nextDocNumber(tx, "SAL-", salesTable, "invoiceNumber");
    const [sale] = await tx.insert(salesTable).values({
      invoiceNumber,
      saleDate: data.saleDate,
      customerId: data.customerId ?? null,
      warehouseId: data.warehouseId,
      items: data.items,
      ...totals,
      status: data.status || "Completed",
      notes: optionalText(data.notes),
    }).returning();
    for (const item of data.items) {
      await adjustStock(tx, item.productId, data.warehouseId, -item.quantity);
      await tx.insert(stockHistoryTable).values({
        productId: item.productId, warehouseId: data.warehouseId, type: "sale",
        quantity: item.quantity, refType: "sale", refId: sale!.id,
        batchNumber: item.batchNumber, serialNumber: item.serialNumber,
        createdBy: staffEmail(req as StaffRequest),
      });
    }
    return sale!;
    });
  } catch (err) {
    if (err instanceof InsufficientStockError) {
      const product = await db.query.productsTable.findFirst({ where: eq(productsTable.id, err.productId) });
      res.status(409).json({ error: `Insufficient stock for ${product?.productName ?? "product"}: only ${err.available} available, ${err.requested} requested` });
      return;
    }
    throw err;
  }
  res.status(201).json(toSaleJson(result));
});

router.get("/crm/sales/:id/pdf", requirePermission("sales", "export"), async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) { res.status(400).json({ error: "Invalid sale id" }); return; }
  const sale = await db.query.salesTable.findFirst({ where: eq(salesTable.id, id) });
  if (!sale) { res.status(404).json({ error: "Sale not found" }); return; }
  let customerName = "Walk-in";
  let partyDetails: (string | null | undefined)[] = [];
  if (sale.customerId) {
    const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, sale.customerId)).limit(1);
    if (customer) {
      customerName = customer.companyName ?? customerName;
      const addressLine = [customer.addressLine1, customer.addressLine2].filter(Boolean).join(", ");
      const cityLine = [customer.city, customer.state, customer.pincode].filter(Boolean).join(", ");
      partyDetails = [
        customer.contactPerson, customer.phone, customer.email,
        customer.gstin ? `GSTIN: ${customer.gstin}` : null,
        addressLine || null, cityLine || null,
      ];
    }
  }
  await renderDocPdf(res, {
    docTitle: "Sales", docNumber: sale.invoiceNumber, date: sale.saleDate,
    partyLabel: "Customer", partyName: customerName, partyDetails, items: sale.items,
    subtotal: Number(sale.subtotal), discountTotal: Number(sale.discountTotal),
    gstTotal: Number(sale.gstTotal), totalAmount: Number(sale.totalAmount), notes: sale.notes,
  });
});

router.patch("/crm/sales/:id", requirePermission("sales", "edit"), async (req, res): Promise<void> => {
  const params = UpdateSaleParams.safeParse(req.params);
  const parsed = UpdateSaleBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: !params.success ? params.error.message : parsed.error?.message }); return;
  }
  const data = parsed.data;
  const existing = await db.query.salesTable.findFirst({ where: eq(salesTable.id, params.data.id) });
  if (!existing) { res.status(404).json({ error: "Sale not found" }); return; }

  const newWarehouseId = data.warehouseId ?? existing.warehouseId;
  const newItems = data.items ?? existing.items;
  const stockImpactChanged = !!data.items || (data.warehouseId !== undefined && data.warehouseId !== existing.warehouseId);
  const totals = data.items ? computeItemTotals(newItems) : {
    subtotal: existing.subtotal, discountTotal: existing.discountTotal,
    gstTotal: existing.gstTotal, totalAmount: existing.totalAmount,
  };

  let result: typeof salesTable.$inferSelect;
  try {
    result = await db.transaction(async (tx) => {
      if (stockImpactChanged) {
        // Reverse the original sale's stock impact on its original warehouse,
        // then re-apply the new items against the (possibly new) warehouse.
        // Both happen in one transaction, so a failed re-apply (insufficient
        // stock) rolls back the reversal too, leaving stock untouched.
        for (const item of existing.items) {
          await adjustStock(tx, item.productId, existing.warehouseId, item.quantity);
          await tx.insert(stockHistoryTable).values({
            productId: item.productId, warehouseId: existing.warehouseId, type: "adjustment_increase",
            quantity: item.quantity, refType: "sale-edit-reversal", refId: existing.id,
            notes: "Sale edited", createdBy: staffEmail(req as StaffRequest),
          });
        }
        for (const item of newItems) {
          await adjustStock(tx, item.productId, newWarehouseId, -item.quantity);
          await tx.insert(stockHistoryTable).values({
            productId: item.productId, warehouseId: newWarehouseId, type: "sale",
            quantity: item.quantity, refType: "sale", refId: existing.id,
            batchNumber: item.batchNumber, serialNumber: item.serialNumber,
            createdBy: staffEmail(req as StaffRequest),
          });
        }
      }
      const [row] = await tx.update(salesTable).set({
        saleDate: data.saleDate ?? existing.saleDate,
        customerId: data.customerId !== undefined ? data.customerId : existing.customerId,
        warehouseId: newWarehouseId,
        items: newItems,
        ...totals,
        status: data.status ?? existing.status,
        notes: data.notes !== undefined ? optionalText(data.notes) : existing.notes,
      }).where(eq(salesTable.id, existing.id)).returning();
      return row!;
    });
  } catch (err) {
    if (err instanceof InsufficientStockError) {
      const product = await db.query.productsTable.findFirst({ where: eq(productsTable.id, err.productId) });
      res.status(409).json({ error: `Insufficient stock for ${product?.productName ?? "product"}: only ${err.available} available, ${err.requested} requested` });
      return;
    }
    throw err;
  }
  res.json(toSaleJson(result));
});

router.delete("/crm/sales/:id", requirePermission("sales", "delete"), async (req, res): Promise<void> => {
  const params = DeleteSaleParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const existing = await db.query.salesTable.findFirst({ where: eq(salesTable.id, params.data.id) });
  if (!existing) { res.status(404).json({ error: "Sale not found" }); return; }
  await db.transaction(async (tx) => {
    for (const item of existing.items) {
      await adjustStock(tx, item.productId, existing.warehouseId, item.quantity);
      await tx.insert(stockHistoryTable).values({
        productId: item.productId, warehouseId: existing.warehouseId, type: "adjustment_increase",
        quantity: item.quantity, refType: "sale-reversal", refId: existing.id,
        notes: "Sale deleted", createdBy: staffEmail(req as StaffRequest),
      });
    }
    await tx.delete(salesTable).where(eq(salesTable.id, existing.id));
  });
  res.status(204).end();
});

// -------------------- Stock levels / history / adjustments --------------------

const LOW_STOCK_FLOOR = 5;

function statusLabelFor(qty: number, minStock: number): string {
  if (qty <= 0) return "Out of Stock";
  if (qty < LOW_STOCK_FLOOR || qty <= minStock) return "Low Stock";
  return "Available";
}

async function computeStockLevels() {
  const [products, warehouses, stocks] = await Promise.all([
    db.select().from(productsTable),
    db.select().from(warehousesTable),
    db.select().from(productStockTable),
  ]);
  const stockMap = new Map<string, number>();
  for (const s of stocks) stockMap.set(`${s.productId}:${s.warehouseId}`, s.quantity);

  const levels: {
    productId: number; productName: string; productCode: string | null; unit: string;
    categoryId: number | null; imageUrl: string | null; warehouseId: number; warehouseName: string;
    quantity: number; minStock: number; maxStock: number; statusLabel: string;
  }[] = [];
  for (const p of products) {
    for (const w of warehouses) {
      const qty = stockMap.get(`${p.id}:${w.id}`) ?? 0;
      if (qty === 0 && warehouses.length > 1) continue; // only show rows with activity across multi-warehouse
      levels.push({
        productId: p.id, productName: p.productName, productCode: p.productCode, unit: p.unit,
        categoryId: p.categoryId, imageUrl: p.imageUrl, warehouseId: w.id, warehouseName: w.name,
        quantity: qty, minStock: p.minStock, maxStock: p.maxStock,
        statusLabel: statusLabelFor(qty, p.minStock),
      });
    }
    if (warehouses.length === 0) {
      levels.push({
        productId: p.id, productName: p.productName, productCode: p.productCode, unit: p.unit,
        categoryId: p.categoryId, imageUrl: p.imageUrl, warehouseId: 0, warehouseName: "-",
        quantity: 0, minStock: p.minStock, maxStock: p.maxStock, statusLabel: statusLabelFor(0, p.minStock),
      });
    }
  }
  return levels;
}

router.get("/crm/stock/levels", requirePermission("stock", "view"), async (_req, res): Promise<void> => {
  res.json(await computeStockLevels());
});

router.get("/crm/stock/pending", requirePermission("stock", "view"), async (_req, res): Promise<void> => {
  const levels = await computeStockLevels();
  res.json(levels.filter((l) => l.statusLabel !== "Available"));
});

router.get("/crm/stock/history/:productId", requirePermission("stock", "view"), async (req, res): Promise<void> => {
  const params = GetStockHistoryParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const rows = await db.select().from(stockHistoryTable)
    .where(eq(stockHistoryTable.productId, params.data.productId))
    .orderBy(desc(stockHistoryTable.createdAt), desc(stockHistoryTable.id));

  const purchaseIds = [...new Set(rows.filter(r => r.refType === "purchase" || r.refType === "purchase-reversal").map(r => r.refId).filter((id): id is number => id != null))];
  const saleIds = [...new Set(rows.filter(r => r.refType === "sale" || r.refType === "sale-reversal").map(r => r.refId).filter((id): id is number => id != null))];
  const [purchases, sales] = await Promise.all([
    purchaseIds.length ? db.select({ id: purchasesTable.id, purchaseNumber: purchasesTable.purchaseNumber }).from(purchasesTable).where(inArray(purchasesTable.id, purchaseIds)) : Promise.resolve([]),
    saleIds.length ? db.select({ id: salesTable.id, invoiceNumber: salesTable.invoiceNumber }).from(salesTable).where(inArray(salesTable.id, saleIds)) : Promise.resolve([]),
  ]);
  const purchaseNumberById = new Map(purchases.map(p => [p.id, p.purchaseNumber]));
  const saleNumberById = new Map(sales.map(s => [s.id, s.invoiceNumber]));

  res.json(rows.map(r => ({
    ...r,
    refNumber:
      (r.refType === "purchase" || r.refType === "purchase-reversal") && r.refId != null ? purchaseNumberById.get(r.refId) ?? null :
      (r.refType === "sale" || r.refType === "sale-reversal") && r.refId != null ? saleNumberById.get(r.refId) ?? null :
      null,
  })));
});

router.post("/crm/stock/adjustments", requirePermission("stockAdjustments", "edit"), async (req, res): Promise<void> => {
  const parsed = CreateStockAdjustmentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const data = parsed.data;

  try {
    await db.transaction(async (tx) => {
      const createdBy = staffEmail(req as StaffRequest);
      if (data.type === "transfer") {
        if (!data.fromWarehouseId || !data.toWarehouseId) throw new Error("Both source and destination warehouses are required for a transfer");
        await adjustStock(tx, data.productId, data.fromWarehouseId, -data.quantity);
        await adjustStock(tx, data.productId, data.toWarehouseId, data.quantity);
        await tx.insert(stockHistoryTable).values({
          productId: data.productId, warehouseId: data.fromWarehouseId, type: "transfer_out",
          quantity: data.quantity, refType: "transfer", notes: data.notes, createdBy,
        });
        await tx.insert(stockHistoryTable).values({
          productId: data.productId, warehouseId: data.toWarehouseId, type: "transfer_in",
          quantity: data.quantity, refType: "transfer", notes: data.notes, createdBy,
        });
        await tx.insert(stockAdjustmentsTable).values({
          productId: data.productId, type: "transfer", quantity: data.quantity,
          fromWarehouseId: data.fromWarehouseId, toWarehouseId: data.toWarehouseId,
          reason: data.reason, notes: data.notes, createdBy,
        });
      } else {
        const warehouseId = data.warehouseId ?? (await getOrCreateDefaultWarehouse()).id;
        const delta = data.type === "increase" ? data.quantity : -data.quantity;
        await adjustStock(tx, data.productId, warehouseId, delta);
        await tx.insert(stockHistoryTable).values({
          productId: data.productId, warehouseId, type: data.type === "increase" ? "adjustment_increase" : "adjustment_decrease",
          quantity: data.quantity, refType: "adjustment",
          notes: [data.reason, data.notes].filter(Boolean).join(" - ") || undefined,
          createdBy,
        });
        await tx.insert(stockAdjustmentsTable).values({
          productId: data.productId, type: data.type, quantity: data.quantity, warehouseId,
          reason: data.reason, notes: data.notes, createdBy,
        });
      }
    });
  } catch (err) {
    res.status(409).json({ error: err instanceof Error ? err.message : "Could not adjust stock" });
    return;
  }
  res.status(201).json(await computeStockLevels());
});

// -------------------- Dashboard --------------------

router.get("/crm/stock/dashboard", requirePermission("stockDashboard", "view"), async (_req, res): Promise<void> => {
  const today = new Date().toISOString().slice(0, 10);
  const [products, categories, purchases, sales, levels, recentPurchases, recentSales] = await Promise.all([
    db.select().from(productsTable),
    db.select({ value: count() }).from(categoriesTable),
    db.select().from(purchasesTable),
    db.select().from(salesTable),
    computeStockLevels(),
    db.select().from(purchasesTable).orderBy(desc(purchasesTable.createdAt), desc(purchasesTable.id)).limit(5),
    db.select().from(salesTable).orderBy(desc(salesTable.createdAt), desc(salesTable.id)).limit(5),
  ]);

  let stockValue = 0;
  const priceByProduct = new Map(products.map((p) => [p.id, Number(p.unitPrice)]));
  const qtyByProduct = new Map<number, number>();
  for (const l of levels) qtyByProduct.set(l.productId, (qtyByProduct.get(l.productId) ?? 0) + l.quantity);
  for (const [productId, qty] of qtyByProduct) stockValue += qty * (priceByProduct.get(productId) ?? 0);

  const currentStockQty = [...qtyByProduct.values()].reduce((a, b) => a + b, 0);
  const lowStockCount = levels.filter((l) => l.statusLabel === "Low Stock").length;
  const outOfStockCount = levels.filter((l) => l.statusLabel === "Out of Stock").length;

  const todayPurchaseValue = purchases.filter((p) => p.purchaseDate === today).reduce((a, p) => a + Number(p.totalAmount), 0);
  const todaySalesValue = sales.filter((s) => s.saleDate === today).reduce((a, s) => a + Number(s.totalAmount), 0);

  res.json({
    totalProducts: products.length,
    totalCategories: categories[0]?.value ?? 0,
    totalPurchases: purchases.length,
    totalSales: sales.length,
    currentStockQty,
    lowStockCount,
    outOfStockCount,
    stockValue,
    todayPurchaseValue,
    todaySalesValue,
    recentPurchases: recentPurchases.map(toPurchaseJson),
    recentSales: recentSales.map(toSaleJson),
    lowStockProducts: levels.filter((l) => l.statusLabel !== "Available").slice(0, 10),
  });
});

// -------------------- Notifications --------------------

router.get("/crm/stock/notifications", requirePermission("stock", "view"), async (_req, res): Promise<void> => {
  const levels = await computeStockLevels();
  const notifications: { id: string; type: string; severity: string; message: string; createdAt: Date }[] = [];
  const now = new Date();
  for (const l of levels) {
    if (l.statusLabel === "Out of Stock") {
      notifications.push({ id: `out-${l.productId}-${l.warehouseId}`, type: "out_of_stock", severity: "critical", message: `${l.productName} is out of stock at ${l.warehouseName}`, createdAt: now });
    } else if (l.statusLabel === "Low Stock") {
      notifications.push({ id: `low-${l.productId}-${l.warehouseId}`, type: "low_stock", severity: "warning", message: `${l.productName} is low on stock at ${l.warehouseName} (${l.quantity} left)`, createdAt: now });
    }
  }
  const expiring = await db.select().from(stockHistoryTable)
    .where(and(eq(stockHistoryTable.type, "purchase"), sql`${stockHistoryTable.expiryDate} is not null`))
    .orderBy(desc(stockHistoryTable.createdAt), desc(stockHistoryTable.id)).limit(200);
  const soon = new Date(); soon.setDate(soon.getDate() + 30);
  const products = await db.select().from(productsTable);
  const productNames = new Map(products.map((p) => [p.id, p.productName]));
  for (const e of expiring) {
    if (!e.expiryDate) continue;
    const exp = new Date(e.expiryDate);
    if (!Number.isNaN(exp.getTime()) && exp <= soon) {
      notifications.push({ id: `exp-${e.id}`, type: "expiry", severity: "warning", message: `Batch of ${productNames.get(e.productId) ?? "product"} (batch ${e.batchNumber ?? "-"}) expires on ${e.expiryDate}`, createdAt: e.createdAt });
    }
  }
  const recentMoves = await db.select().from(stockHistoryTable).orderBy(desc(stockHistoryTable.createdAt), desc(stockHistoryTable.id)).limit(10);
  for (const m of recentMoves) {
    if (m.type === "purchase" || m.type === "sale" || m.type.startsWith("adjustment")) {
      const label = m.type === "purchase" ? "New purchase" : m.type === "sale" ? "New sale" : "Stock adjustment";
      notifications.push({ id: `move-${m.id}`, type: m.type, severity: "info", message: `${label}: ${productNames.get(m.productId) ?? "product"} (${m.quantity} units)`, createdAt: m.createdAt });
    }
  }
  notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  res.json(notifications.slice(0, 30));
});

// -------------------- Search --------------------

router.get("/crm/stock/search", requirePermission("stock", "view"), async (req, res): Promise<void> => {
  const parsed = SearchStockQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const q = `%${parsed.data.q.toLowerCase()}%`;
  const [products, suppliersRows, customersRows, purchasesRows, salesRows, categoriesRows, subGroupsRows] = await Promise.all([
    db.select().from(productsTable).where(sql`lower(${productsTable.productName}) like ${q} or lower(coalesce(${productsTable.productCode}, '')) like ${q} or lower(coalesce(${productsTable.barcode}, '')) like ${q}`).limit(10),
    db.select().from(suppliersTable).where(sql`lower(${suppliersTable.name}) like ${q}`).limit(10),
    db.select().from(customersTable).where(sql`lower(${customersTable.companyName}) like ${q}`).limit(10),
    db.select().from(purchasesTable).where(sql`lower(${purchasesTable.purchaseNumber}) like ${q}`).limit(10),
    db.select().from(salesTable).where(sql`lower(${salesTable.invoiceNumber}) like ${q}`).limit(10),
    db.select().from(categoriesTable).where(sql`lower(${categoriesTable.name}) like ${q}`).limit(10),
    db.select().from(subGroupsTable).where(sql`lower(${subGroupsTable.name}) like ${q}`).limit(10),
  ]);
  const results = [
    ...products.map((p) => ({ kind: "product", id: p.id, label: p.productName, sublabel: p.productCode ?? "" })),
    ...suppliersRows.map((s) => ({ kind: "supplier", id: s.id, label: s.name, sublabel: s.companyName ?? "" })),
    ...customersRows.map((c) => ({ kind: "customer", id: c.id, label: c.companyName, sublabel: c.contactPerson ?? "" })),
    ...purchasesRows.map((p) => ({ kind: "purchase", id: p.id, label: p.purchaseNumber, sublabel: p.purchaseDate })),
    ...salesRows.map((s) => ({ kind: "sale", id: s.id, label: s.invoiceNumber, sublabel: s.saleDate })),
    ...categoriesRows.map((c) => ({ kind: "category", id: c.id, label: c.name, sublabel: "Category" })),
    ...subGroupsRows.map((s) => ({ kind: "sub_group", id: s.id, label: s.name, sublabel: "Sub Group" })),
  ];
  res.json(results);
});

// -------------------- Reports --------------------

async function buildReportRows(report: string, from?: string, to?: string): Promise<{ columns: string[]; rows: (string | number)[][] }> {
  const inRange = (date: string) => (!from || date >= from) && (!to || date <= to);
  switch (report) {
    case "products": {
      const [rows, categories, subGroups] = await Promise.all([
        db.select().from(productsTable),
        db.select().from(categoriesTable),
        db.select().from(subGroupsTable),
      ]);
      const categoryName = new Map(categories.map((c) => [c.id, c.name]));
      const subGroupName = new Map(subGroups.map((s) => [s.id, s.name]));
      return {
        columns: ["Code", "Name", "Category", "Sub Group", "Brand", "Model", "HSN/SAC", "Unit", "Price", "GST %", "Min Stock", "Max Stock", "Opening Stock", "Barcode"],
        rows: rows.map((p) => [
          p.productCode ?? "", p.productName,
          (p.categoryId ? categoryName.get(p.categoryId) : "") ?? "",
          (p.subGroupId ? subGroupName.get(p.subGroupId) : "") ?? "",
          p.brand ?? "", p.model ?? "", p.hsnSac ?? "", p.unit,
          Number(p.unitPrice), Number(p.gstPercent), p.minStock, p.maxStock, p.openingStock, p.barcode ?? "",
        ]),
      };
    }
    case "purchases": {
      const [allRows, suppliers, warehouses] = await Promise.all([
        db.select().from(purchasesTable),
        db.select().from(suppliersTable),
        db.select().from(warehousesTable),
      ]);
      const supplierName = new Map(suppliers.map((s) => [s.id, s.name]));
      const warehouseName = new Map(warehouses.map((w) => [w.id, w.name]));
      const rows = allRows.filter((p) => inRange(p.purchaseDate));
      return {
        columns: ["Purchase No", "Date", "Supplier", "Warehouse", "Invoice No", "Payment Mode", "Status", "Subtotal", "Discount", "GST", "Total"],
        rows: rows.map((p) => [
          p.purchaseNumber, p.purchaseDate, supplierName.get(p.supplierId) ?? "", warehouseName.get(p.warehouseId) ?? "",
          p.invoiceNumber ?? "", p.paymentMode, p.status,
          Number(p.subtotal), Number(p.discountTotal), Number(p.gstTotal), Number(p.totalAmount),
        ]),
      };
    }
    case "sales": {
      const [allRows, customers, warehouses] = await Promise.all([
        db.select().from(salesTable),
        db.select().from(customersTable),
        db.select().from(warehousesTable),
      ]);
      const customerName = new Map(customers.map((c) => [c.id, c.companyName]));
      const warehouseName = new Map(warehouses.map((w) => [w.id, w.name]));
      const rows = allRows.filter((s) => inRange(s.saleDate));
      return {
        columns: ["Invoice No", "Date", "Customer", "Warehouse", "Status", "Subtotal", "Discount", "GST", "Total"],
        rows: rows.map((s) => [
          s.invoiceNumber, s.saleDate, (s.customerId ? customerName.get(s.customerId) : "") ?? "", warehouseName.get(s.warehouseId) ?? "",
          s.status, Number(s.subtotal), Number(s.discountTotal), Number(s.gstTotal), Number(s.totalAmount),
        ]),
      };
    }
    case "current_stock": {
      const levels = await computeStockLevels();
      return {
        columns: ["Product", "Code", "Warehouse", "Quantity", "Min Stock", "Max Stock", "Status"],
        rows: levels.map((l) => [l.productName, l.productCode ?? "", l.warehouseName, l.quantity, l.minStock, l.maxStock, l.statusLabel]),
      };
    }
    case "low_stock":
    case "out_of_stock": {
      const levels = (await computeStockLevels()).filter((l) => report === "low_stock" ? l.statusLabel === "Low Stock" : l.statusLabel === "Out of Stock");
      return {
        columns: ["Product", "Code", "Warehouse", "Quantity", "Min Stock"],
        rows: levels.map((l) => [l.productName, l.productCode ?? "", l.warehouseName, l.quantity, l.minStock]),
      };
    }
    case "stock_movement": {
      const [rows, products, warehouses] = await Promise.all([
        db.select().from(stockHistoryTable).orderBy(desc(stockHistoryTable.createdAt), desc(stockHistoryTable.id)).limit(1000),
        db.select().from(productsTable),
        db.select().from(warehousesTable),
      ]);
      const productName = new Map(products.map((p) => [p.id, p.productName]));
      const warehouseName = new Map(warehouses.map((w) => [w.id, w.name]));
      return {
        columns: ["Date", "Product", "Warehouse", "Type", "Quantity", "Ref", "Batch No", "Notes"],
        rows: rows.map((r) => [
          r.createdAt.toISOString().slice(0, 10), productName.get(r.productId) ?? "", warehouseName.get(r.warehouseId) ?? "",
          r.type, r.quantity, r.refType ?? "", r.batchNumber ?? "", r.notes ?? "",
        ]),
      };
    }
    case "supplier": {
      const rows = await db.select().from(suppliersTable);
      return {
        columns: ["Name", "Company", "GSTIN", "Phone", "Email", "Address", "Status", "Outstanding"],
        rows: rows.map((s) => [s.name, s.companyName ?? "", s.gstin ?? "", s.phone ?? "", s.email ?? "", s.address ?? "", s.status, Number(s.outstandingBalance)]),
      };
    }
    case "customer": {
      const rows = await db.select().from(customersTable);
      return {
        columns: ["Company", "Contact", "Phone", "Email", "GSTIN", "City", "State", "Lead Source", "Reference"],
        rows: rows.map((c) => [c.companyName, c.contactPerson ?? "", c.phone ?? "", c.email ?? "", c.gstin ?? "", c.city ?? "", c.state ?? "", c.leadSource, c.reference ?? ""]),
      };
    }
    case "profit_loss": {
      const [purchases, sales] = await Promise.all([db.select().from(purchasesTable), db.select().from(salesTable)]);
      const totalPurchases = purchases.reduce((a, p) => a + Number(p.totalAmount), 0);
      const totalSales = sales.reduce((a, s) => a + Number(s.totalAmount), 0);
      return {
        columns: ["Metric", "Value"],
        rows: [["Total Purchases", totalPurchases], ["Total Sales", totalSales], ["Gross Profit", totalSales - totalPurchases]],
      };
    }
    default:
      throw new Error(`Unknown report: ${report}`);
  }
}

router.get("/crm/reports", requirePermission("reports", "view"), async (req, res): Promise<void> => {
  const parsed = GetStockReportQueryParams.safeParse(req.query);
  const report = typeof req.query.report === "string" ? req.query.report : "";
  if (!parsed.success || !report) { res.status(400).json({ error: "report is required" }); return; }
  const { format, from, to } = parsed.data;

  // A file download (csv/xlsx/pdf) is an export, not a view -- gate it on
  // "reports:export" specifically so a role granted view-only reports access
  // can't download files through this same endpoint. requirePermission above
  // already resolved and stashed the role on the request.
  const staffRole = (req as StaffRequest).staffRole!;
  if (format && format !== "json" && !hasPermission(staffRole, "reports", "export")) {
    res.status(403).json({ error: "You do not have permission to perform this action" });
    return;
  }

  const knownReports = ["products", "purchases", "sales", "current_stock", "low_stock", "out_of_stock", "stock_movement", "supplier", "customer", "profit_loss"];
  if (!knownReports.includes(report)) {
    res.status(400).json({ error: `Unknown report: ${report}` });
    return;
  }

  // Any error past this point is a DB/query failure, not a client input error — let it
  // propagate to the global error handler so it is logged and surfaced as a 500.
  const data = await buildReportRows(report, from, to);

  if (!format || format === "json") {
    res.json({ report, columns: data.columns, rows: data.rows });
    return;
  }

  // CSV/XLSX/PDF are downloads, not just viewing -- require the export action separately
  // from the view check above so a view-only role cannot pull data out of the system.
  const sreq = req as StaffRequest;
  if (!sreq.staffRole || !hasPermission(sreq.staffRole, "reports", "export")) {
    res.status(403).json({ error: "You do not have permission to perform this action" });
    return;
  }

  if (format === "csv") {
    const csv = [data.columns.join(","), ...data.rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${report}.csv"`);
    res.send(csv);
    return;
  }

  if (format === "xlsx") {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(report);
    sheet.addRow(data.columns);
    data.rows.forEach((r) => sheet.addRow(r));
    sheet.getRow(1).font = { bold: true };
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${report}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
    return;
  }

  if (format === "pdf") {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${report}.pdf"`);
    doc.pipe(res);
    doc.fontSize(16).font("Helvetica-Bold").text(report.replace(/_/g, " ").toUpperCase());
    doc.moveDown();
    doc.fontSize(8).font("Helvetica-Bold");
    doc.text(data.columns.join("   |   "));
    doc.moveDown(0.3);
    doc.font("Helvetica");
    data.rows.forEach((r) => doc.text(r.join("   |   ")));
    doc.end();
    return;
  }

  res.status(400).json({ error: "Unsupported format" });
});

export default router;
