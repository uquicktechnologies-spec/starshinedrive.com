import { and, asc, count, eq, inArray, ne } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateWebCategoryBody, CreateWebMediaBody, CreateWebProductBody, ReplaceWebProductApplicationsBody,
  ReplaceWebProductConfigInputTypesBody, ReplaceWebProductFaqsBody, ReplaceWebProductFeaturesBody,
  ReplaceWebProductImagesBody, ReplaceWebProductKeyRangeBody, ReplaceWebProductModelRangeBody,
  ReplaceWebProductMountingVariantsBody, ReplaceWebProductRelatedBody, ReplaceWebProductSpecGroupsBody,
  UpdateWebCategoryBody, UpdateWebProductBody,
} from "@workspace/api-zod";
import {
  db, webCategoriesTable, webMediaLibraryTable, webProductApplicationsTable, webProductConfigInputTypesTable,
  webProductFaqsTable, webProductFeaturesTable, webProductImagesTable, webProductKeyRangeTable,
  webProductModelRangeRowsTable, webProductMountingVariantFeaturesTable, webProductMountingVariantsTable,
  webProductRelatedTable, webProductSpecGroupsTable, webProductSpecsTable, webProductsTable,
} from "@workspace/db";
import { desc } from "drizzle-orm";
import { requireStaff, requirePermission } from "../lib/staffAuth";

const router: IRouter = Router();

async function loadProductDetail(id: number) {
  const [product] = await db.select().from(webProductsTable).where(eq(webProductsTable.id, id)).limit(1);
  if (!product) return null;

  const category = product.categoryId
    ? (await db.select().from(webCategoriesTable).where(eq(webCategoriesTable.id, product.categoryId)).limit(1))[0]
    : undefined;

  const [keyRange, specGroups, specs, features, applications, images, faqs, relatedRows, configInputTypes, mountingVariants, modelRangeRows] = await Promise.all([
    db.select().from(webProductKeyRangeTable).where(eq(webProductKeyRangeTable.productId, id)).orderBy(asc(webProductKeyRangeTable.displayOrder)),
    db.select().from(webProductSpecGroupsTable).where(eq(webProductSpecGroupsTable.productId, id)).orderBy(asc(webProductSpecGroupsTable.displayOrder)),
    db.select().from(webProductSpecsTable).where(inArray(webProductSpecsTable.groupId,
      (await db.select({ id: webProductSpecGroupsTable.id }).from(webProductSpecGroupsTable).where(eq(webProductSpecGroupsTable.productId, id))).map((g) => g.id) || [-1],
    )).orderBy(asc(webProductSpecsTable.displayOrder)),
    db.select().from(webProductFeaturesTable).where(eq(webProductFeaturesTable.productId, id)).orderBy(asc(webProductFeaturesTable.displayOrder)),
    db.select().from(webProductApplicationsTable).where(eq(webProductApplicationsTable.productId, id)).orderBy(asc(webProductApplicationsTable.displayOrder)),
    db.select().from(webProductImagesTable).where(eq(webProductImagesTable.productId, id)).orderBy(asc(webProductImagesTable.displayOrder)),
    db.select().from(webProductFaqsTable).where(eq(webProductFaqsTable.productId, id)).orderBy(asc(webProductFaqsTable.displayOrder)),
    db.select().from(webProductRelatedTable).where(eq(webProductRelatedTable.productId, id)).orderBy(asc(webProductRelatedTable.displayOrder)),
    db.select().from(webProductConfigInputTypesTable).where(eq(webProductConfigInputTypesTable.productId, id)).orderBy(asc(webProductConfigInputTypesTable.displayOrder)),
    db.select().from(webProductMountingVariantsTable).where(eq(webProductMountingVariantsTable.productId, id)).orderBy(asc(webProductMountingVariantsTable.displayOrder)),
    db.select().from(webProductModelRangeRowsTable).where(eq(webProductModelRangeRowsTable.productId, id)).orderBy(asc(webProductModelRangeRowsTable.displayOrder)),
  ]);

  const variantIds = mountingVariants.map((v) => v.id);
  const variantFeatures = variantIds.length
    ? await db.select().from(webProductMountingVariantFeaturesTable)
        .where(inArray(webProductMountingVariantFeaturesTable.variantId, variantIds))
        .orderBy(asc(webProductMountingVariantFeaturesTable.displayOrder))
    : [];

  let relatedProducts = await getManualOrFallbackRelated(product.id, product.categoryId, relatedRows.map((r) => r.relatedProductId));

  return {
    ...product,
    categoryName: category?.name ?? null,
    categorySlug: category?.slug ?? null,
    modelRangeHeaders: product.modelRangeHeaders ?? [],
    keyRange: keyRange.map((k) => ({ id: k.id, label: k.label, displayOrder: k.displayOrder })),
    specGroups: specGroups.map((g) => ({
      id: g.id,
      groupName: g.groupName,
      displayOrder: g.displayOrder,
      specs: specs.filter((s) => s.groupId === g.id).map((s) => ({ id: s.id, label: s.label, value: s.value, displayOrder: s.displayOrder })),
    })),
    features: features.map((f) => ({ id: f.id, text: f.text, displayOrder: f.displayOrder })),
    applications: applications.map((a) => ({ id: a.id, label: a.label, imageUrl: a.imageUrl, displayOrder: a.displayOrder })),
    images: images.map((im) => ({ id: im.id, imageUrl: im.imageUrl, altText: im.altText, displayOrder: im.displayOrder })),
    faqs: faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer, displayOrder: f.displayOrder })),
    related: relatedProducts,
    configInputTypes: configInputTypes.map((c) => ({ id: c.id, label: c.label, imageUrl: c.imageUrl, displayOrder: c.displayOrder })),
    mountingVariants: mountingVariants.map((v) => ({
      id: v.id,
      name: v.name,
      imageUrl: v.imageUrl,
      displayOrder: v.displayOrder,
      features: variantFeatures.filter((f) => f.variantId === v.id).map((f) => f.text),
    })),
    modelRangeRows: modelRangeRows.map((r) => ({ id: r.id, cells: r.cells, displayOrder: r.displayOrder })),
  };
}

async function getManualOrFallbackRelated(productId: number, categoryId: number | null, manualIds: number[]) {
  let ids = manualIds;
  if (ids.length === 0 && categoryId) {
    const rows = await db.select({ id: webProductsTable.id }).from(webProductsTable)
      .where(and(eq(webProductsTable.categoryId, categoryId), eq(webProductsTable.status, "published"), ne(webProductsTable.id, productId)))
      .limit(4);
    ids = rows.map((r) => r.id);
  }
  if (ids.length === 0) return [];
  const rows = await db.select().from(webProductsTable).where(inArray(webProductsTable.id, ids));
  const category = await attachCategoryNames(rows);
  // preserve manual order when provided
  const order = new Map(ids.map((id, i) => [id, i]));
  return category.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

async function attachCategoryNames(rows: (typeof webProductsTable.$inferSelect)[]) {
  const categoryIds = [...new Set(rows.map((r) => r.categoryId).filter((v): v is number => v != null))];
  const categories = categoryIds.length
    ? await db.select().from(webCategoriesTable).where(inArray(webCategoriesTable.id, categoryIds))
    : [];
  const byId = new Map(categories.map((c) => [c.id, c.name]));
  return rows.map((r) => ({
    id: r.id, categoryId: r.categoryId, categoryName: r.categoryId ? byId.get(r.categoryId) ?? null : null,
    name: r.name, slug: r.slug, series: r.series, tagline: r.tagline, mainImageUrl: r.mainImageUrl,
    status: r.status, featured: r.featured, displayOrder: r.displayOrder, createdAt: r.createdAt, updatedAt: r.updatedAt,
  }));
}

// -------------------- Public routes (no auth) --------------------

router.get("/web/categories", async (_req, res) => {
  const categories = await db.select().from(webCategoriesTable)
    .where(eq(webCategoriesTable.status, "published")).orderBy(asc(webCategoriesTable.displayOrder));
  const counts = await db.select({ categoryId: webProductsTable.categoryId, value: count() }).from(webProductsTable)
    .where(eq(webProductsTable.status, "published")).groupBy(webProductsTable.categoryId);
  const countByCategory = new Map(counts.map((c) => [c.categoryId, c.value]));
  res.json(categories.map((c) => ({
    id: c.id, name: c.name, slug: c.slug, shortDescription: c.shortDescription, description: c.description,
    imageUrl: c.imageUrl, bannerUrl: c.bannerUrl, seoTitle: c.seoTitle, seoDescription: c.seoDescription,
    seoKeywords: c.seoKeywords, ogImageUrl: c.ogImageUrl, productCount: countByCategory.get(c.id) ?? 0,
  })));
});

router.get("/web/categories/:slug", async (req, res) => {
  const [category] = await db.select().from(webCategoriesTable)
    .where(and(eq(webCategoriesTable.slug, req.params.slug), eq(webCategoriesTable.status, "published"))).limit(1);
  if (!category) { res.status(404).json({ error: "Category not found" }); return; }
  const products = await db.select().from(webProductsTable)
    .where(and(eq(webProductsTable.categoryId, category.id), eq(webProductsTable.status, "published")))
    .orderBy(asc(webProductsTable.displayOrder));
  res.json({
    category: {
      id: category.id, name: category.name, slug: category.slug, shortDescription: category.shortDescription,
      description: category.description, imageUrl: category.imageUrl, bannerUrl: category.bannerUrl,
      seoTitle: category.seoTitle, seoDescription: category.seoDescription, seoKeywords: category.seoKeywords,
      ogImageUrl: category.ogImageUrl, productCount: products.length,
    },
    products: await attachCategoryNames(products),
  });
});

router.get("/web/products", async (req, res) => {
  const categorySlug = typeof req.query.categorySlug === "string" ? req.query.categorySlug : undefined;
  let categoryId: number | undefined;
  if (categorySlug) {
    const [category] = await db.select().from(webCategoriesTable).where(eq(webCategoriesTable.slug, categorySlug)).limit(1);
    if (!category) { res.json([]); return; }
    categoryId = category.id;
  }
  const conditions = [eq(webProductsTable.status, "published")];
  if (categoryId !== undefined) conditions.push(eq(webProductsTable.categoryId, categoryId));
  const products = await db.select().from(webProductsTable).where(and(...conditions)).orderBy(asc(webProductsTable.displayOrder));
  res.json(await attachCategoryNames(products));
});

router.get("/web/products/:slug", async (req, res) => {
  const [product] = await db.select().from(webProductsTable)
    .where(and(eq(webProductsTable.slug, req.params.slug), eq(webProductsTable.status, "published"))).limit(1);
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  const detail = await loadProductDetail(product.id);
  res.json(detail);
});

// -------------------- Admin routes (staff only) --------------------

router.use("/crm/web-categories", requireStaff, requirePermission("webContent", "view"));
router.use("/crm/web-products", requireStaff, requirePermission("webContent", "view"));

router.get("/crm/web-categories", async (_req, res) => {
  const categories = await db.select().from(webCategoriesTable).orderBy(asc(webCategoriesTable.displayOrder));
  const counts = await db.select({ categoryId: webProductsTable.categoryId, value: count() }).from(webProductsTable).groupBy(webProductsTable.categoryId);
  const countByCategory = new Map(counts.map((c) => [c.categoryId, c.value]));
  res.json(categories.map((c) => ({ ...c, productCount: countByCategory.get(c.id) ?? 0 })));
});

router.post("/crm/web-categories", requirePermission("webContent", "create"), async (req, res) => {
  const parsed = CreateWebCategoryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [existing] = await db.select().from(webCategoriesTable).where(eq(webCategoriesTable.slug, parsed.data.slug)).limit(1);
  if (existing) { res.status(400).json({ error: "A category with this slug already exists" }); return; }
  const [category] = await db.insert(webCategoriesTable).values(parsed.data).returning();
  res.status(201).json({ ...category, productCount: 0 });
});

router.patch("/crm/web-categories/:id", requirePermission("webContent", "edit"), async (req, res) => {
  const id = Number(req.params.id);
  const parsed = UpdateWebCategoryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  if (parsed.data.slug) {
    const [existing] = await db.select().from(webCategoriesTable).where(eq(webCategoriesTable.slug, parsed.data.slug)).limit(1);
    if (existing && existing.id !== id) { res.status(400).json({ error: "A category with this slug already exists" }); return; }
  }
  const [category] = await db.update(webCategoriesTable).set(parsed.data).where(eq(webCategoriesTable.id, id)).returning();
  if (!category) { res.status(404).json({ error: "Category not found" }); return; }
  const [{ value: productCount } = { value: 0 }] = await db.select({ value: count() }).from(webProductsTable).where(eq(webProductsTable.categoryId, id));
  res.json({ ...category, productCount });
});

router.delete("/crm/web-categories/:id", requirePermission("webContent", "delete"), async (req, res) => {
  const id = Number(req.params.id);
  const [{ value: productCount } = { value: 0 }] = await db.select({ value: count() }).from(webProductsTable).where(eq(webProductsTable.categoryId, id));
  if (productCount > 0) { res.status(400).json({ error: "This category still has products. Move or delete them first." }); return; }
  await db.delete(webCategoriesTable).where(eq(webCategoriesTable.id, id));
  res.status(204).send();
});

router.get("/crm/web-products", async (_req, res) => {
  const products = await db.select().from(webProductsTable).orderBy(asc(webProductsTable.displayOrder));
  res.json(await attachCategoryNames(products));
});

router.post("/crm/web-products", requirePermission("webContent", "create"), async (req, res) => {
  const parsed = CreateWebProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [existing] = await db.select().from(webProductsTable).where(eq(webProductsTable.slug, parsed.data.slug)).limit(1);
  if (existing) { res.status(400).json({ error: "A product with this slug already exists" }); return; }
  const [product] = await db.insert(webProductsTable).values(parsed.data).returning();
  res.status(201).json(await loadProductDetail(product.id));
});

router.get("/crm/web-products/:id", async (req, res) => {
  const detail = await loadProductDetail(Number(req.params.id));
  if (!detail) { res.status(404).json({ error: "Product not found" }); return; }
  res.json(detail);
});

router.patch("/crm/web-products/:id", requirePermission("webContent", "edit"), async (req, res) => {
  const id = Number(req.params.id);
  const parsed = UpdateWebProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  if (parsed.data.slug) {
    const [existing] = await db.select().from(webProductsTable).where(eq(webProductsTable.slug, parsed.data.slug)).limit(1);
    if (existing && existing.id !== id) { res.status(400).json({ error: "A product with this slug already exists" }); return; }
  }
  const [product] = await db.update(webProductsTable).set(parsed.data).where(eq(webProductsTable.id, id)).returning();
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  res.json(await loadProductDetail(id));
});

router.delete("/crm/web-products/:id", requirePermission("webContent", "delete"), async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(webProductRelatedTable).where(eq(webProductRelatedTable.productId, id));
  await db.delete(webProductRelatedTable).where(eq(webProductRelatedTable.relatedProductId, id));
  await db.delete(webProductKeyRangeTable).where(eq(webProductKeyRangeTable.productId, id));
  const groupIds = (await db.select({ id: webProductSpecGroupsTable.id }).from(webProductSpecGroupsTable).where(eq(webProductSpecGroupsTable.productId, id))).map((g) => g.id);
  if (groupIds.length) await db.delete(webProductSpecsTable).where(inArray(webProductSpecsTable.groupId, groupIds));
  await db.delete(webProductSpecGroupsTable).where(eq(webProductSpecGroupsTable.productId, id));
  await db.delete(webProductFeaturesTable).where(eq(webProductFeaturesTable.productId, id));
  await db.delete(webProductApplicationsTable).where(eq(webProductApplicationsTable.productId, id));
  await db.delete(webProductImagesTable).where(eq(webProductImagesTable.productId, id));
  await db.delete(webProductFaqsTable).where(eq(webProductFaqsTable.productId, id));
  await db.delete(webProductConfigInputTypesTable).where(eq(webProductConfigInputTypesTable.productId, id));
  const variantIds = (await db.select({ id: webProductMountingVariantsTable.id }).from(webProductMountingVariantsTable).where(eq(webProductMountingVariantsTable.productId, id))).map((v) => v.id);
  if (variantIds.length) await db.delete(webProductMountingVariantFeaturesTable).where(inArray(webProductMountingVariantFeaturesTable.variantId, variantIds));
  await db.delete(webProductMountingVariantsTable).where(eq(webProductMountingVariantsTable.productId, id));
  await db.delete(webProductModelRangeRowsTable).where(eq(webProductModelRangeRowsTable.productId, id));
  await db.delete(webProductsTable).where(eq(webProductsTable.id, id));
  res.status(204).send();
});

router.put("/crm/web-products/:id/key-range", requirePermission("webContent", "edit"), async (req, res) => {
  const id = Number(req.params.id);
  const parsed = ReplaceWebProductKeyRangeBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  await db.delete(webProductKeyRangeTable).where(eq(webProductKeyRangeTable.productId, id));
  if (parsed.data.items.length) {
    await db.insert(webProductKeyRangeTable).values(parsed.data.items.map((item, i) => ({ productId: id, label: item.label, displayOrder: i })));
  }
  res.json(await loadProductDetail(id));
});

router.put("/crm/web-products/:id/spec-groups", requirePermission("webContent", "edit"), async (req, res) => {
  const id = Number(req.params.id);
  const parsed = ReplaceWebProductSpecGroupsBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const existingGroupIds = (await db.select({ id: webProductSpecGroupsTable.id }).from(webProductSpecGroupsTable).where(eq(webProductSpecGroupsTable.productId, id))).map((g) => g.id);
  if (existingGroupIds.length) await db.delete(webProductSpecsTable).where(inArray(webProductSpecsTable.groupId, existingGroupIds));
  await db.delete(webProductSpecGroupsTable).where(eq(webProductSpecGroupsTable.productId, id));
  for (const [i, group] of parsed.data.groups.entries()) {
    const [createdGroup] = await db.insert(webProductSpecGroupsTable).values({ productId: id, groupName: group.groupName, displayOrder: i }).returning();
    if (group.specs.length) {
      await db.insert(webProductSpecsTable).values(group.specs.map((s, j) => ({ groupId: createdGroup.id, label: s.label, value: s.value, displayOrder: j })));
    }
  }
  res.json(await loadProductDetail(id));
});

router.put("/crm/web-products/:id/features", requirePermission("webContent", "edit"), async (req, res) => {
  const id = Number(req.params.id);
  const parsed = ReplaceWebProductFeaturesBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  await db.delete(webProductFeaturesTable).where(eq(webProductFeaturesTable.productId, id));
  if (parsed.data.items.length) {
    await db.insert(webProductFeaturesTable).values(parsed.data.items.map((item, i) => ({ productId: id, text: item.text, displayOrder: i })));
  }
  res.json(await loadProductDetail(id));
});

router.put("/crm/web-products/:id/applications", requirePermission("webContent", "edit"), async (req, res) => {
  const id = Number(req.params.id);
  const parsed = ReplaceWebProductApplicationsBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  await db.delete(webProductApplicationsTable).where(eq(webProductApplicationsTable.productId, id));
  if (parsed.data.items.length) {
    await db.insert(webProductApplicationsTable).values(parsed.data.items.map((item, i) => ({ productId: id, label: item.label, imageUrl: item.imageUrl ?? null, displayOrder: i })));
  }
  res.json(await loadProductDetail(id));
});

router.put("/crm/web-products/:id/images", requirePermission("webContent", "edit"), async (req, res) => {
  const id = Number(req.params.id);
  const parsed = ReplaceWebProductImagesBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  await db.delete(webProductImagesTable).where(eq(webProductImagesTable.productId, id));
  if (parsed.data.items.length) {
    await db.insert(webProductImagesTable).values(parsed.data.items.map((item, i) => ({ productId: id, imageUrl: item.imageUrl, altText: item.altText ?? null, displayOrder: i })));
  }
  res.json(await loadProductDetail(id));
});

router.put("/crm/web-products/:id/faqs", requirePermission("webContent", "edit"), async (req, res) => {
  const id = Number(req.params.id);
  const parsed = ReplaceWebProductFaqsBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  await db.delete(webProductFaqsTable).where(eq(webProductFaqsTable.productId, id));
  if (parsed.data.items.length) {
    await db.insert(webProductFaqsTable).values(parsed.data.items.map((item, i) => ({ productId: id, question: item.question, answer: item.answer, displayOrder: i })));
  }
  res.json(await loadProductDetail(id));
});

router.put("/crm/web-products/:id/related", requirePermission("webContent", "edit"), async (req, res) => {
  const id = Number(req.params.id);
  const parsed = ReplaceWebProductRelatedBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  await db.delete(webProductRelatedTable).where(eq(webProductRelatedTable.productId, id));
  const relatedIds = parsed.data.relatedProductIds.filter((rid) => rid !== id);
  if (relatedIds.length) {
    await db.insert(webProductRelatedTable).values(relatedIds.map((relatedProductId, i) => ({ productId: id, relatedProductId, displayOrder: i })));
  }
  res.json(await loadProductDetail(id));
});

router.put("/crm/web-products/:id/config-input-types", requirePermission("webContent", "edit"), async (req, res) => {
  const id = Number(req.params.id);
  const parsed = ReplaceWebProductConfigInputTypesBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  await db.delete(webProductConfigInputTypesTable).where(eq(webProductConfigInputTypesTable.productId, id));
  if (parsed.data.items.length) {
    await db.insert(webProductConfigInputTypesTable).values(parsed.data.items.map((item, i) => ({ productId: id, label: item.label, imageUrl: item.imageUrl ?? null, displayOrder: i })));
  }
  res.json(await loadProductDetail(id));
});

router.put("/crm/web-products/:id/mounting-variants", requirePermission("webContent", "edit"), async (req, res) => {
  const id = Number(req.params.id);
  const parsed = ReplaceWebProductMountingVariantsBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const existingVariantIds = (await db.select({ id: webProductMountingVariantsTable.id }).from(webProductMountingVariantsTable).where(eq(webProductMountingVariantsTable.productId, id))).map((v) => v.id);
  if (existingVariantIds.length) await db.delete(webProductMountingVariantFeaturesTable).where(inArray(webProductMountingVariantFeaturesTable.variantId, existingVariantIds));
  await db.delete(webProductMountingVariantsTable).where(eq(webProductMountingVariantsTable.productId, id));
  for (const [i, variant] of parsed.data.items.entries()) {
    const [createdVariant] = await db.insert(webProductMountingVariantsTable).values({ productId: id, name: variant.name, imageUrl: variant.imageUrl ?? null, displayOrder: i }).returning();
    if (variant.features.length) {
      await db.insert(webProductMountingVariantFeaturesTable).values(variant.features.map((text, j) => ({ variantId: createdVariant.id, text, displayOrder: j })));
    }
  }
  res.json(await loadProductDetail(id));
});

// -------------------- Cross-environment content export/import --------------------
// Lets an admin download all categories + full product detail from one environment
// (e.g. Development) and upload it into another (e.g. Production) via the app's own
// DB connection. Upserts by slug so it's safe to re-run.

router.get("/crm/web-content/export", async (_req, res) => {
  const categories = await db.select().from(webCategoriesTable).orderBy(asc(webCategoriesTable.displayOrder));
  const productRows = await db.select({ id: webProductsTable.id }).from(webProductsTable).orderBy(asc(webProductsTable.displayOrder));
  const products = [];
  for (const { id } of productRows) {
    const detail = await loadProductDetail(id);
    if (detail) products.push(detail);
  }
  res.json({ exportedAt: new Date().toISOString(), categories, products });
});

router.post("/crm/web-content/import", requirePermission("webContent", "create"), async (req, res) => {
  const body = req.body as { categories?: unknown[]; products?: unknown[] };
  if (!Array.isArray(body.categories) || !Array.isArray(body.products)) {
    res.status(400).json({ error: "Expected { categories: [], products: [] }" });
    return;
  }

  let categoriesCreated = 0;
  let categoriesUpdated = 0;
  let productsCreated = 0;
  let productsUpdated = 0;
  const categorySlugToId = new Map<string, number>();

  for (const raw of body.categories as Record<string, unknown>[]) {
    const slug = String(raw.slug ?? "");
    if (!slug) continue;
    const fields = {
      name: String(raw.name ?? slug),
      slug,
      shortDescription: (raw.shortDescription as string) ?? null,
      description: (raw.description as string) ?? null,
      imageUrl: (raw.imageUrl as string) ?? null,
      bannerUrl: (raw.bannerUrl as string) ?? null,
      displayOrder: typeof raw.displayOrder === "number" ? raw.displayOrder : 0,
      status: (raw.status as string) ?? "draft",
      seoTitle: (raw.seoTitle as string) ?? null,
      seoDescription: (raw.seoDescription as string) ?? null,
      seoKeywords: (raw.seoKeywords as string) ?? null,
      ogImageUrl: (raw.ogImageUrl as string) ?? null,
    };
    const [existing] = await db.select().from(webCategoriesTable).where(eq(webCategoriesTable.slug, slug)).limit(1);
    if (existing) {
      await db.update(webCategoriesTable).set(fields).where(eq(webCategoriesTable.id, existing.id));
      categorySlugToId.set(slug, existing.id);
      categoriesUpdated++;
    } else {
      const [created] = await db.insert(webCategoriesTable).values(fields).returning();
      categorySlugToId.set(slug, created.id);
      categoriesCreated++;
    }
  }

  const productSlugToId = new Map<string, number>();

  for (const raw of body.products as Record<string, unknown>[]) {
    const slug = String(raw.slug ?? "");
    if (!slug) continue;
    const categorySlug = raw.categorySlug as string | null | undefined;
    const fields = {
      categoryId: categorySlug ? (categorySlugToId.get(categorySlug) ?? null) : null,
      name: String(raw.name ?? slug),
      slug,
      series: (raw.series as string) ?? null,
      tagline: (raw.tagline as string) ?? null,
      description: (raw.description as string) ?? null,
      mainImageUrl: (raw.mainImageUrl as string) ?? null,
      descriptionImageUrl: (raw.descriptionImageUrl as string) ?? null,
      descriptionTitle: (raw.descriptionTitle as string) ?? null,
      docUrl: (raw.docUrl as string) ?? null,
      videoUrl: (raw.videoUrl as string) ?? null,
      status: (raw.status as string) ?? "draft",
      featured: Boolean(raw.featured),
      displayOrder: typeof raw.displayOrder === "number" ? raw.displayOrder : 0,
      modelRangeHeaders: Array.isArray(raw.modelRangeHeaders) ? (raw.modelRangeHeaders as string[]) : [],
      seoTitle: (raw.seoTitle as string) ?? null,
      seoDescription: (raw.seoDescription as string) ?? null,
      seoKeywords: (raw.seoKeywords as string) ?? null,
      ogImageUrl: (raw.ogImageUrl as string) ?? null,
    };
    const [existing] = await db.select().from(webProductsTable).where(eq(webProductsTable.slug, slug)).limit(1);
    let productId: number;
    if (existing) {
      await db.update(webProductsTable).set(fields).where(eq(webProductsTable.id, existing.id));
      productId = existing.id;
      productsUpdated++;
    } else {
      const [created] = await db.insert(webProductsTable).values(fields).returning();
      productId = created.id;
      productsCreated++;
    }
    productSlugToId.set(slug, productId);

    // Replace all nested child collections for this product
    const keyRange = Array.isArray(raw.keyRange) ? (raw.keyRange as { label: string }[]) : [];
    await db.delete(webProductKeyRangeTable).where(eq(webProductKeyRangeTable.productId, productId));
    if (keyRange.length) {
      await db.insert(webProductKeyRangeTable).values(keyRange.map((k, i) => ({ productId, label: k.label, displayOrder: i })));
    }

    const specGroups = Array.isArray(raw.specGroups) ? (raw.specGroups as { groupName: string; specs: { label: string; value: string }[] }[]) : [];
    const existingGroupIds = (await db.select({ id: webProductSpecGroupsTable.id }).from(webProductSpecGroupsTable).where(eq(webProductSpecGroupsTable.productId, productId))).map((g) => g.id);
    if (existingGroupIds.length) await db.delete(webProductSpecsTable).where(inArray(webProductSpecsTable.groupId, existingGroupIds));
    await db.delete(webProductSpecGroupsTable).where(eq(webProductSpecGroupsTable.productId, productId));
    for (const [i, group] of specGroups.entries()) {
      const [createdGroup] = await db.insert(webProductSpecGroupsTable).values({ productId, groupName: group.groupName, displayOrder: i }).returning();
      if (group.specs?.length) {
        await db.insert(webProductSpecsTable).values(group.specs.map((s, j) => ({ groupId: createdGroup.id, label: s.label, value: s.value, displayOrder: j })));
      }
    }

    const features = Array.isArray(raw.features) ? (raw.features as { text: string }[]) : [];
    await db.delete(webProductFeaturesTable).where(eq(webProductFeaturesTable.productId, productId));
    if (features.length) await db.insert(webProductFeaturesTable).values(features.map((f, i) => ({ productId, text: f.text, displayOrder: i })));

    const applications = Array.isArray(raw.applications) ? (raw.applications as { label: string; imageUrl?: string | null }[]) : [];
    await db.delete(webProductApplicationsTable).where(eq(webProductApplicationsTable.productId, productId));
    if (applications.length) await db.insert(webProductApplicationsTable).values(applications.map((a, i) => ({ productId, label: a.label, imageUrl: a.imageUrl ?? null, displayOrder: i })));

    const images = Array.isArray(raw.images) ? (raw.images as { imageUrl: string; altText?: string | null }[]) : [];
    await db.delete(webProductImagesTable).where(eq(webProductImagesTable.productId, productId));
    if (images.length) await db.insert(webProductImagesTable).values(images.map((im, i) => ({ productId, imageUrl: im.imageUrl, altText: im.altText ?? null, displayOrder: i })));

    const faqs = Array.isArray(raw.faqs) ? (raw.faqs as { question: string; answer: string }[]) : [];
    await db.delete(webProductFaqsTable).where(eq(webProductFaqsTable.productId, productId));
    if (faqs.length) await db.insert(webProductFaqsTable).values(faqs.map((f, i) => ({ productId, question: f.question, answer: f.answer, displayOrder: i })));

    const configInputTypes = Array.isArray(raw.configInputTypes) ? (raw.configInputTypes as { label: string; imageUrl?: string | null }[]) : [];
    await db.delete(webProductConfigInputTypesTable).where(eq(webProductConfigInputTypesTable.productId, productId));
    if (configInputTypes.length) await db.insert(webProductConfigInputTypesTable).values(configInputTypes.map((c, i) => ({ productId, label: c.label, imageUrl: c.imageUrl ?? null, displayOrder: i })));

    const mountingVariants = Array.isArray(raw.mountingVariants) ? (raw.mountingVariants as { name: string; imageUrl?: string | null; features: string[] }[]) : [];
    const existingVariantIds = (await db.select({ id: webProductMountingVariantsTable.id }).from(webProductMountingVariantsTable).where(eq(webProductMountingVariantsTable.productId, productId))).map((v) => v.id);
    if (existingVariantIds.length) await db.delete(webProductMountingVariantFeaturesTable).where(inArray(webProductMountingVariantFeaturesTable.variantId, existingVariantIds));
    await db.delete(webProductMountingVariantsTable).where(eq(webProductMountingVariantsTable.productId, productId));
    for (const [i, variant] of mountingVariants.entries()) {
      const [createdVariant] = await db.insert(webProductMountingVariantsTable).values({ productId, name: variant.name, imageUrl: variant.imageUrl ?? null, displayOrder: i }).returning();
      if (variant.features?.length) {
        await db.insert(webProductMountingVariantFeaturesTable).values(variant.features.map((text, j) => ({ variantId: createdVariant.id, text, displayOrder: j })));
      }
    }

    const modelRangeRows = Array.isArray(raw.modelRangeRows) ? (raw.modelRangeRows as { cells: string[] }[]) : [];
    await db.delete(webProductModelRangeRowsTable).where(eq(webProductModelRangeRowsTable.productId, productId));
    if (modelRangeRows.length) await db.insert(webProductModelRangeRowsTable).values(modelRangeRows.map((r, i) => ({ productId, cells: r.cells, displayOrder: i })));
  }

  // Second pass: manual "related products" links, remapped by slug now that all products exist
  for (const raw of body.products as Record<string, unknown>[]) {
    const slug = String(raw.slug ?? "");
    const productId = productSlugToId.get(slug);
    const related = Array.isArray(raw.related) ? (raw.related as { slug: string }[]) : [];
    if (!productId) continue;
    await db.delete(webProductRelatedTable).where(eq(webProductRelatedTable.productId, productId));
    const relatedIds = related.map((r) => productSlugToId.get(r.slug)).filter((id): id is number => id != null && id !== productId);
    if (relatedIds.length) {
      await db.insert(webProductRelatedTable).values(relatedIds.map((relatedProductId, i) => ({ productId, relatedProductId, displayOrder: i })));
    }
  }

  res.json({ categoriesCreated, categoriesUpdated, productsCreated, productsUpdated });
});

// -------------------- Media library (reusable uploaded images) --------------------

router.use("/crm/web-media", requireStaff, requirePermission("webContent", "view"));

router.get("/crm/web-media", async (_req, res) => {
  const items = await db.select().from(webMediaLibraryTable).orderBy(desc(webMediaLibraryTable.createdAt), desc(webMediaLibraryTable.id));
  res.json(items);
});

router.post("/crm/web-media", requirePermission("webContent", "create"), async (req, res) => {
  const parsed = CreateWebMediaBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [item] = await db.insert(webMediaLibraryTable).values({
    imageUrl: parsed.data.imageUrl,
    fileName: parsed.data.fileName ?? null,
    altText: parsed.data.altText ?? null,
  }).returning();
  res.status(201).json(item);
});

router.delete("/crm/web-media/:id", requirePermission("webContent", "delete"), async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(webMediaLibraryTable).where(eq(webMediaLibraryTable.id, id));
  res.status(204).send();
});

router.put("/crm/web-products/:id/model-range", requirePermission("webContent", "edit"), async (req, res) => {
  const id = Number(req.params.id);
  const parsed = ReplaceWebProductModelRangeBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  await db.update(webProductsTable).set({ modelRangeHeaders: parsed.data.headers }).where(eq(webProductsTable.id, id));
  await db.delete(webProductModelRangeRowsTable).where(eq(webProductModelRangeRowsTable.productId, id));
  if (parsed.data.rows.length) {
    await db.insert(webProductModelRangeRowsTable).values(parsed.data.rows.map((cells, i) => ({ productId: id, cells, displayOrder: i })));
  }
  res.json(await loadProductDetail(id));
});

export default router;
