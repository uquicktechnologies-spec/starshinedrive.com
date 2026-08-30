import { createInsertSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

const auditColumns = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const customersTable = pgTable("customers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  companyName: text("company_name").notNull(),
  contactPerson: text("contact_person"),
  designation: text("designation"),
  email: text("email"),
  phone: text("phone"),
  altPhone: text("alt_phone"),
  gstin: text("gstin"),
  pan: text("pan"),
  cin: text("cin"),
  stateCode: text("state_code"),
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  addressLine3: text("address_line3"),
  city: text("city"),
  state: text("state"),
  country: text("country").notNull().default("India"),
  pincode: text("pincode"),
  notes: text("notes"),
  leadSource: text("lead_source").notNull().default("Manual"),
  reference: text("reference"),
  ...auditColumns,
});

export type QuotationItem = {
  itemName: string;
  description?: string;
  hsnSac?: string;
  productId?: number | null;
  qty: number;
  rate: number;
  discPercent: number;
  gstPercent: number;
};

export const inquiriesTable = pgTable("inquiries", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  companyName: text("company_name"),
  contactPerson: text("contact_person").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  industry: text("industry"),
  leadSource: text("lead_source").notNull(),
  purpose: text("purpose"),
  productInterest: text("product_interest").array().notNull().default([]),
  quantity: text("quantity"),
  message: text("message").notNull(),
  status: text("status").notNull().default("New"),
  customerId: integer("customer_id").references(() => customersTable.id),
  ...auditColumns,
}, (table) => [
  index("inquiries_customer_id_idx").on(table.customerId),
]);

export const salesExecutivesTable = pgTable("sales_executives", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  employeeCode: text("employee_code"),
  designation: text("designation"),
  email: text("email"),
  phone: text("phone"),
  altPhone: text("alt_phone"),
  region: text("region"),
  city: text("city"),
  state: text("state"),
  joiningDate: text("joining_date"),
  active: boolean("active").notNull().default(true),
  notes: text("notes"),
  ...auditColumns,
});

// Singleton settings row (always id = 1) holding seller identity, banking,
// quotation numbering, and document defaults used across every quotation/PDF.
export const sellerSettingsTable = pgTable("seller_settings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  companyName: text("company_name"),
  logoUrl: text("logo_url"),
  gstin: text("gstin"),
  pan: text("pan"),
  cin: text("cin"),
  stateCode: text("state_code"),
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  authorisedSignatoryName: text("authorised_signatory_name"),
  city: text("city"),
  state: text("state"),
  country: text("country").notNull().default("India"),
  pincode: text("pincode"),
  address: text("address"),
  signatoryName: text("signatory_name"),
  signedDate: text("signed_date"),
  expiryDate: text("expiry_date"),
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  ifsc: text("ifsc"),
  branch: text("branch"),
  upiId: text("upi_id"),
  numberingPrefix: text("numbering_prefix").notNull().default("QTN-"),
  numberingNextSequence: integer("numbering_next_sequence").notNull().default(1),
  numberingPadding: integer("numbering_padding").notNull().default(6),
  defaultValidityDays: integer("default_validity_days").notNull().default(15),
  defaultGstPercent: numeric("default_gst_percent", { precision: 5, scale: 2 }).notNull().default("18"),
  defaultCurrency: text("default_currency").notNull().default("INR"),
  defaultTerms: text("default_terms"),
  defaultNotes: text("default_notes"),
  smtpHost: text("smtp_host"),
  smtpPort: integer("smtp_port"),
  smtpSecure: boolean("smtp_secure").notNull().default(false),
  smtpUser: text("smtp_user"),
  smtpPassword: text("smtp_password"),
  smtpFromEmail: text("smtp_from_email"),
  smtpFromName: text("smtp_from_name"),
  ...auditColumns,
});

export const quotationsTable = pgTable("quotations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  quotationNumber: text("quotation_number").notNull().unique(),
  customerId: integer("customer_id").references(() => customersTable.id),
  inquiryId: integer("inquiry_id").references(() => inquiriesTable.id),
  salesExecutiveId: integer("sales_executive_id").references(() => salesExecutivesTable.id),
  subject: text("subject").notNull(),
  quotationDate: text("quotation_date"),
  validUntil: text("valid_until"),
  deliveryTime: text("delivery_time"),
  referenceNumber: text("reference_number"),
  taxType: text("tax_type").notNull().default("cgst_sgst"),
  // Bill-to snapshot -- captured at quote time so a customer's later edits
  // don't silently rewrite already-issued quotations.
  billToCompany: text("bill_to_company").notNull(),
  billToContact: text("bill_to_contact"),
  billToEmail: text("bill_to_email"),
  billToPhone: text("bill_to_phone"),
  billToGstin: text("bill_to_gstin"),
  billToStateCode: text("bill_to_state_code"),
  billToCity: text("bill_to_city"),
  billToState: text("bill_to_state"),
  billToAddress: text("bill_to_address"),
  items: jsonb("items").$type<QuotationItem[]>().notNull().default([]),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  discountTotal: numeric("discount_total", { precision: 12, scale: 2 }).notNull().default("0"),
  taxableValue: numeric("taxable_value", { precision: 12, scale: 2 }).notNull().default("0"),
  cgstAmount: numeric("cgst_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  sgstAmount: numeric("sgst_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  igstAmount: numeric("igst_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull().default("0"),
  currency: text("currency").notNull().default("INR"),
  status: text("status").notNull().default("Draft"),
  notes: text("notes"),
  termsAndConditions: text("terms_and_conditions"),
  ...auditColumns,
}, (table) => [
  index("quotations_customer_id_idx").on(table.customerId),
  index("quotations_inquiry_id_idx").on(table.inquiryId),
  index("quotations_sales_executive_id_idx").on(table.salesExecutiveId),
  index("quotations_status_idx").on(table.status),
  index("quotations_created_at_idx").on(table.createdAt),
]);

// -------------------- Bulk email marketing --------------------

// Multiple outgoing SMTP accounts staff can register; bulk sends rotate
// round-robin across the active ones to spread volume across accounts.
export const emailSenderAccountsTable = pgTable("email_sender_accounts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  label: text("label").notNull(),
  smtpHost: text("smtp_host").notNull(),
  smtpPort: integer("smtp_port").notNull().default(587),
  smtpSecure: boolean("smtp_secure").notNull().default(false),
  smtpUser: text("smtp_user").notNull(),
  smtpPassword: text("smtp_password").notNull(),
  fromEmail: text("from_email").notNull(),
  fromName: text("from_name"),
  active: boolean("active").notNull().default(true),
  ...auditColumns,
});

export type EmailCampaignFilters = {
  cities?: string[];
  states?: string[];
  industries?: string[];
};

export const emailCampaignsTable = pgTable("email_campaigns", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  recipientSource: text("recipient_source").notNull(), // customers | leads
  filters: jsonb("filters").$type<EmailCampaignFilters>().notNull().default({}),
  totalRecipients: integer("total_recipients").notNull().default(0),
  sentCount: integer("sent_count").notNull().default(0),
  failedCount: integer("failed_count").notNull().default(0),
  status: text("status").notNull().default("sending"), // sending | completed | failed
  createdBy: text("created_by"),
  ...auditColumns,
});

// Append-only per-recipient send log for a campaign, so results (and which
// sender account rotation picked) can be audited after the fact.
export const emailCampaignRecipientsTable = pgTable("email_campaign_recipients", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  campaignId: integer("campaign_id").references(() => emailCampaignsTable.id).notNull(),
  recipientEmail: text("recipient_email").notNull(),
  recipientName: text("recipient_name"),
  senderAccountId: integer("sender_account_id").references(() => emailSenderAccountsTable.id, { onDelete: "set null" }),
  status: text("status").notNull().default("pending"), // pending | sent | failed
  error: text("error"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("email_campaign_recipients_campaign_id_idx").on(table.campaignId),
  index("email_campaign_recipients_sender_account_id_idx").on(table.senderAccountId),
]);

// -------------------- Stock management --------------------

export const categoriesTable = pgTable("categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("Active"),
  ...auditColumns,
});

export const subGroupsTable = pgTable("sub_groups", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  categoryId: integer("category_id").references(() => categoriesTable.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("Active"),
  ...auditColumns,
}, (table) => [
  index("sub_groups_category_id_idx").on(table.categoryId),
]);

export const suppliersTable = pgTable("suppliers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  companyName: text("company_name"),
  gstin: text("gstin"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  outstandingBalance: numeric("outstanding_balance", { precision: 12, scale: 2 }).notNull().default("0"),
  notes: text("notes"),
  status: text("status").notNull().default("Active"),
  ...auditColumns,
});

export const warehousesTable = pgTable("warehouses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  location: text("location"),
  isDefault: boolean("is_default").notNull().default(false),
  status: text("status").notNull().default("Active"),
  ...auditColumns,
});

export const staffRolesTable = pgTable("staff_roles", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: text("role").notNull().default("staff"), // admin | manager | staff
  salesExecutiveId: integer("sales_executive_id").references(() => salesExecutivesTable.id, { onDelete: "set null" }),
  ...auditColumns,
}, (table) => [
  index("staff_roles_sales_executive_id_idx").on(table.salesExecutiveId),
]);

export const productsTable = pgTable("products", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  productName: text("product_name").notNull(),
  description: text("description"),
  hsnSac: text("hsn_sac"),
  unit: text("unit").notNull().default("Nos"),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull().default("0"),
  gstPercent: numeric("gst_percent", { precision: 5, scale: 2 }).notNull().default("18"),
  imageUrl: text("image_url"),
  // Stock fields
  productCode: text("product_code").unique(),
  barcode: text("barcode"),
  qrCode: text("qr_code"),
  categoryId: integer("category_id").references(() => categoriesTable.id),
  subGroupId: integer("sub_group_id").references(() => subGroupsTable.id),
  brand: text("brand"),
  model: text("model"),
  minStock: integer("min_stock").notNull().default(0),
  maxStock: integer("max_stock").notNull().default(0),
  openingStock: integer("opening_stock").notNull().default(0),
  trackBatch: boolean("track_batch").notNull().default(false),
  trackExpiry: boolean("track_expiry").notNull().default(false),
  ...auditColumns,
}, (table) => [
  index("products_category_id_idx").on(table.categoryId),
  index("products_sub_group_id_idx").on(table.subGroupId),
  index("products_barcode_idx").on(table.barcode),
]);

// Live per-warehouse stock levels for a product (materialized, kept in sync
// by purchases/sales/adjustments/transfers).
export const productStockTable = pgTable("product_stock", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("product_id").references(() => productsTable.id).notNull(),
  warehouseId: integer("warehouse_id").references(() => warehousesTable.id).notNull(),
  quantity: integer("quantity").notNull().default(0),
  ...auditColumns,
}, (table) => [
  // Enforced at the DB level (not just app logic) so concurrent stock
  // adjustments for the same product+warehouse can't both create a balance
  // row, and a balance can never be driven negative even under a race.
  unique("product_stock_product_warehouse_unique").on(table.productId, table.warehouseId),
  check("product_stock_quantity_non_negative", sql`${table.quantity} >= 0`),
  // The unique constraint above already indexes (productId, warehouseId),
  // covering productId-only lookups as a leftmost prefix -- but not
  // warehouseId-only lookups (e.g. "all stock in this warehouse").
  index("product_stock_warehouse_id_idx").on(table.warehouseId),
]);

// Append-only ledger of every stock movement, for the stock-history view.
export const stockHistoryTable = pgTable("stock_history", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("product_id").references(() => productsTable.id).notNull(),
  warehouseId: integer("warehouse_id").references(() => warehousesTable.id).notNull(),
  type: text("type").notNull(), // opening | purchase | sale | adjustment_increase | adjustment_decrease | transfer_in | transfer_out
  quantity: integer("quantity").notNull(),
  refType: text("ref_type"), // purchase | sale | adjustment | transfer
  refId: integer("ref_id"),
  batchNumber: text("batch_number"),
  serialNumber: text("serial_number"),
  expiryDate: text("expiry_date"),
  manufacturingDate: text("manufacturing_date"),
  notes: text("notes"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("stock_history_product_id_idx").on(table.productId),
  index("stock_history_warehouse_id_idx").on(table.warehouseId),
  index("stock_history_created_at_idx").on(table.createdAt),
]);

export const purchasesTable = pgTable("purchases", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  purchaseNumber: text("purchase_number").notNull().unique(),
  purchaseDate: text("purchase_date").notNull(),
  supplierId: integer("supplier_id").references(() => suppliersTable.id).notNull(),
  warehouseId: integer("warehouse_id").references(() => warehousesTable.id).notNull(),
  invoiceNumber: text("invoice_number"),
  paymentMode: text("payment_mode").notNull().default("Cash"),
  items: jsonb("items").$type<PurchaseSaleItem[]>().notNull().default([]),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  discountTotal: numeric("discount_total", { precision: 12, scale: 2 }).notNull().default("0"),
  gstTotal: numeric("gst_total", { precision: 12, scale: 2 }).notNull().default("0"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("Received"),
  notes: text("notes"),
  ...auditColumns,
}, (table) => [
  index("purchases_supplier_id_idx").on(table.supplierId),
  index("purchases_warehouse_id_idx").on(table.warehouseId),
  index("purchases_created_at_idx").on(table.createdAt),
  index("purchases_status_idx").on(table.status),
]);

export const salesTable = pgTable("sales", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  saleDate: text("sale_date").notNull(),
  customerId: integer("customer_id").references(() => customersTable.id),
  warehouseId: integer("warehouse_id").references(() => warehousesTable.id).notNull(),
  items: jsonb("items").$type<PurchaseSaleItem[]>().notNull().default([]),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  discountTotal: numeric("discount_total", { precision: 12, scale: 2 }).notNull().default("0"),
  gstTotal: numeric("gst_total", { precision: 12, scale: 2 }).notNull().default("0"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("Completed"),
  notes: text("notes"),
  ...auditColumns,
}, (table) => [
  index("sales_customer_id_idx").on(table.customerId),
  index("sales_warehouse_id_idx").on(table.warehouseId),
  index("sales_created_at_idx").on(table.createdAt),
  index("sales_status_idx").on(table.status),
]);

export const stockAdjustmentsTable = pgTable("stock_adjustments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("product_id").references(() => productsTable.id).notNull(),
  type: text("type").notNull(), // increase | decrease | transfer
  quantity: integer("quantity").notNull(),
  warehouseId: integer("warehouse_id").references(() => warehousesTable.id),
  fromWarehouseId: integer("from_warehouse_id").references(() => warehousesTable.id),
  toWarehouseId: integer("to_warehouse_id").references(() => warehousesTable.id),
  reason: text("reason"),
  notes: text("notes"),
  createdBy: text("created_by"),
  ...auditColumns,
}, (table) => [
  index("stock_adjustments_product_id_idx").on(table.productId),
]);

export type PurchaseSaleItem = {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  discPercent: number;
  gstPercent: number;
  batchNumber?: string;
  serialNumber?: string;
  expiryDate?: string;
  manufacturingDate?: string;
};

export const insertCategorySchema = createInsertSchema(categoriesTable).omit({
  createdAt: true, updatedAt: true,
});
export const insertSubGroupSchema = createInsertSchema(subGroupsTable).omit({
  createdAt: true, updatedAt: true,
});
export const insertSupplierSchema = createInsertSchema(suppliersTable).omit({
  createdAt: true, updatedAt: true,
});
export const insertWarehouseSchema = createInsertSchema(warehousesTable).omit({
  createdAt: true, updatedAt: true,
});
export const insertStaffRoleSchema = createInsertSchema(staffRolesTable).omit({
  createdAt: true, updatedAt: true,
});
export const insertPurchaseSchema = createInsertSchema(purchasesTable).omit({
  createdAt: true, updatedAt: true,
});
export const insertSaleSchema = createInsertSchema(salesTable).omit({
  createdAt: true, updatedAt: true,
});
export const insertStockAdjustmentSchema = createInsertSchema(stockAdjustmentsTable).omit({
  createdAt: true, updatedAt: true,
});

export const insertCustomerSchema = createInsertSchema(customersTable).omit({
  createdAt: true, updatedAt: true,
});
export const insertInquirySchema = createInsertSchema(inquiriesTable).omit({
  createdAt: true, updatedAt: true,
});
export const insertSalesExecutiveSchema = createInsertSchema(salesExecutivesTable).omit({
  createdAt: true, updatedAt: true,
});
export const insertSellerSettingsSchema = createInsertSchema(sellerSettingsTable).omit({
  createdAt: true, updatedAt: true,
});
export const insertQuotationSchema = createInsertSchema(quotationsTable).omit({
  createdAt: true, updatedAt: true,
});
export const insertProductSchema = createInsertSchema(productsTable).omit({
  createdAt: true, updatedAt: true,
});

export const insertEmailSenderAccountSchema = createInsertSchema(emailSenderAccountsTable).omit({
  createdAt: true, updatedAt: true,
});
export const insertEmailCampaignSchema = createInsertSchema(emailCampaignsTable).omit({
  createdAt: true, updatedAt: true,
});

export type Customer = typeof customersTable.$inferSelect;
export type Inquiry = typeof inquiriesTable.$inferSelect;
export type SalesExecutive = typeof salesExecutivesTable.$inferSelect;
export type SellerSettings = typeof sellerSettingsTable.$inferSelect;
export type Quotation = typeof quotationsTable.$inferSelect;
export type Product = typeof productsTable.$inferSelect;
export type Category = typeof categoriesTable.$inferSelect;
export type SubGroup = typeof subGroupsTable.$inferSelect;
export type Supplier = typeof suppliersTable.$inferSelect;
export type Warehouse = typeof warehousesTable.$inferSelect;
export type StaffRole = typeof staffRolesTable.$inferSelect;
export type ProductStock = typeof productStockTable.$inferSelect;
export type StockHistory = typeof stockHistoryTable.$inferSelect;
export type Purchase = typeof purchasesTable.$inferSelect;
export type Sale = typeof salesTable.$inferSelect;
export type StockAdjustment = typeof stockAdjustmentsTable.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type InsertSalesExecutive = z.infer<typeof insertSalesExecutiveSchema>;
export type InsertSellerSettings = z.infer<typeof insertSellerSettingsSchema>;
export type InsertQuotation = z.infer<typeof insertQuotationSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertSubGroup = z.infer<typeof insertSubGroupSchema>;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type InsertWarehouse = z.infer<typeof insertWarehouseSchema>;
export type InsertStaffRole = z.infer<typeof insertStaffRoleSchema>;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type InsertStockAdjustment = z.infer<typeof insertStockAdjustmentSchema>;
export type EmailSenderAccount = typeof emailSenderAccountsTable.$inferSelect;
export type EmailCampaign = typeof emailCampaignsTable.$inferSelect;
export type EmailCampaignRecipient = typeof emailCampaignRecipientsTable.$inferSelect;
export type InsertEmailSenderAccount = z.infer<typeof insertEmailSenderAccountSchema>;
export type InsertEmailCampaign = z.infer<typeof insertEmailCampaignSchema>;
