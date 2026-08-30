import { createInsertSchema } from "drizzle-zod";
import {
  boolean,
  integer,
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

// -------------------- Website content: dynamic product/category CMS --------------------
// This is a separate content model from the CRM/inventory `categories` and
// `products` tables in crm.ts (those track stock, pricing, GST, warehouses).
// These tables back the public marketing site's product & category pages so
// staff can create/edit product pages without a code deploy.

export const webCategoriesTable = pgTable("web_categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  shortDescription: text("short_description"),
  description: text("description"),
  imageUrl: text("image_url"),
  bannerUrl: text("banner_url"),
  displayOrder: integer("display_order").notNull().default(0),
  status: text("status").notNull().default("draft"), // draft | published
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
  ogImageUrl: text("og_image_url"),
  ...auditColumns,
});

export const webProductsTable = pgTable("web_products", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  categoryId: integer("category_id").references(() => webCategoriesTable.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  series: text("series"),
  tagline: text("tagline"),
  description: text("description"),
  mainImageUrl: text("main_image_url"),
  descriptionImageUrl: text("description_image_url"),
  descriptionTitle: text("description_title"),
  docUrl: text("doc_url"),
  videoUrl: text("video_url"),
  status: text("status").notNull().default("draft"), // draft | published
  featured: boolean("featured").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  // Column headers for the "Model Range" datasheet table (e.g. ["Model", "Ratio", "Output Torque"]).
  // Row values live in webProductModelRangeRowsTable, one row per array of cells aligned to these headers.
  modelRangeHeaders: text("model_range_headers").array(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
  ogImageUrl: text("og_image_url"),
  ...auditColumns,
});

// Key-range bullet list shown in the hero ("Ratio range: 5-100" etc.)
export const webProductKeyRangeTable = pgTable("web_product_key_range", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("product_id").references(() => webProductsTable.id).notNull(),
  label: text("label").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  ...auditColumns,
});

// Grouped technical specification tables (e.g. "General", "Performance")
export const webProductSpecGroupsTable = pgTable("web_product_spec_groups", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("product_id").references(() => webProductsTable.id).notNull(),
  groupName: text("group_name").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  ...auditColumns,
});

export const webProductSpecsTable = pgTable("web_product_specs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  groupId: integer("group_id").references(() => webProductSpecGroupsTable.id).notNull(),
  label: text("label").notNull(),
  value: text("value").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  ...auditColumns,
});

export const webProductFeaturesTable = pgTable("web_product_features", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("product_id").references(() => webProductsTable.id).notNull(),
  text: text("text").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  ...auditColumns,
});

export const webProductApplicationsTable = pgTable("web_product_applications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("product_id").references(() => webProductsTable.id).notNull(),
  label: text("label").notNull(),
  imageUrl: text("image_url"),
  displayOrder: integer("display_order").notNull().default(0),
  ...auditColumns,
});

export const webProductImagesTable = pgTable("web_product_images", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("product_id").references(() => webProductsTable.id).notNull(),
  imageUrl: text("image_url").notNull(),
  altText: text("alt_text"),
  displayOrder: integer("display_order").notNull().default(0),
  ...auditColumns,
});

export const webProductFaqsTable = pgTable("web_product_faqs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("product_id").references(() => webProductsTable.id).notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  ...auditColumns,
});

// "Configuration" tab on the Technical Datasheet — input-type diagrams (e.g.
// "Direct Motor Input", "Shaft Input") each with their own illustration image.
export const webProductConfigInputTypesTable = pgTable("web_product_config_input_types", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("product_id").references(() => webProductsTable.id).notNull(),
  label: text("label").notNull(),
  imageUrl: text("image_url"),
  displayOrder: integer("display_order").notNull().default(0),
  ...auditColumns,
});

// Mounting variant sections (e.g. "R Foot-Mounted Reducer", "RF Flange-Mounted Reducer")
// rendered as alternating image/text bands below the datasheet.
export const webProductMountingVariantsTable = pgTable("web_product_mounting_variants", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("product_id").references(() => webProductsTable.id).notNull(),
  name: text("name").notNull(),
  imageUrl: text("image_url"),
  displayOrder: integer("display_order").notNull().default(0),
  ...auditColumns,
});

export const webProductMountingVariantFeaturesTable = pgTable("web_product_mounting_variant_features", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  variantId: integer("variant_id").references(() => webProductMountingVariantsTable.id).notNull(),
  text: text("text").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  ...auditColumns,
});

// Row data for the "Model Range" datasheet table; `cells` aligns positionally
// with `webProductsTable.modelRangeHeaders`.
export const webProductModelRangeRowsTable = pgTable("web_product_model_range_rows", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("product_id").references(() => webProductsTable.id).notNull(),
  cells: text("cells").array().notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  ...auditColumns,
});

// Manual related-product overrides. If a product has no manual relations,
// the API falls back to other published products in the same category.
export const webProductRelatedTable = pgTable("web_product_related", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("product_id").references(() => webProductsTable.id).notNull(),
  relatedProductId: integer("related_product_id").references(() => webProductsTable.id).notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  ...auditColumns,
}, (table) => [
  unique().on(table.productId, table.relatedProductId),
]);

// General-purpose media library: images uploaded once, then reusable across
// any product's images/applications/config diagrams/mounting variants without
// re-uploading the same file each time.
export const webMediaLibraryTable = pgTable("web_media_library", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  imageUrl: text("image_url").notNull(),
  fileName: text("file_name"),
  altText: text("alt_text"),
  ...auditColumns,
});

export const insertWebCategorySchema = createInsertSchema(webCategoriesTable).omit({ createdAt: true, updatedAt: true });
export const insertWebProductSchema = createInsertSchema(webProductsTable).omit({ createdAt: true, updatedAt: true });
export const insertWebProductKeyRangeSchema = createInsertSchema(webProductKeyRangeTable).omit({ createdAt: true, updatedAt: true });
export const insertWebProductSpecGroupSchema = createInsertSchema(webProductSpecGroupsTable).omit({ createdAt: true, updatedAt: true });
export const insertWebProductSpecSchema = createInsertSchema(webProductSpecsTable).omit({ createdAt: true, updatedAt: true });
export const insertWebProductFeatureSchema = createInsertSchema(webProductFeaturesTable).omit({ createdAt: true, updatedAt: true });
export const insertWebProductApplicationSchema = createInsertSchema(webProductApplicationsTable).omit({ createdAt: true, updatedAt: true });
export const insertWebProductImageSchema = createInsertSchema(webProductImagesTable).omit({ createdAt: true, updatedAt: true });
export const insertWebProductFaqSchema = createInsertSchema(webProductFaqsTable).omit({ createdAt: true, updatedAt: true });
export const insertWebProductConfigInputTypeSchema = createInsertSchema(webProductConfigInputTypesTable).omit({ createdAt: true, updatedAt: true });
export const insertWebProductMountingVariantSchema = createInsertSchema(webProductMountingVariantsTable).omit({ createdAt: true, updatedAt: true });
export const insertWebProductMountingVariantFeatureSchema = createInsertSchema(webProductMountingVariantFeaturesTable).omit({ createdAt: true, updatedAt: true });
export const insertWebProductModelRangeRowSchema = createInsertSchema(webProductModelRangeRowsTable).omit({ createdAt: true, updatedAt: true });

export type InsertWebCategory = z.infer<typeof insertWebCategorySchema>;
export type WebCategory = typeof webCategoriesTable.$inferSelect;
export type InsertWebProduct = z.infer<typeof insertWebProductSchema>;
export type WebProduct = typeof webProductsTable.$inferSelect;
export type WebProductKeyRange = typeof webProductKeyRangeTable.$inferSelect;
export type WebProductSpecGroup = typeof webProductSpecGroupsTable.$inferSelect;
export type WebProductSpec = typeof webProductSpecsTable.$inferSelect;
export type WebProductFeature = typeof webProductFeaturesTable.$inferSelect;
export type WebProductApplication = typeof webProductApplicationsTable.$inferSelect;
export type WebProductImage = typeof webProductImagesTable.$inferSelect;
export type WebProductFaq = typeof webProductFaqsTable.$inferSelect;
export type WebProductRelated = typeof webProductRelatedTable.$inferSelect;
export type WebProductConfigInputType = typeof webProductConfigInputTypesTable.$inferSelect;
export type WebProductMountingVariant = typeof webProductMountingVariantsTable.$inferSelect;
export type WebProductMountingVariantFeature = typeof webProductMountingVariantFeaturesTable.$inferSelect;
export type WebProductModelRangeRow = typeof webProductModelRangeRowsTable.$inferSelect;
