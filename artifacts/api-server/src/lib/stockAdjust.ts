import { and, eq, sql } from "drizzle-orm";
import { db, productStockTable } from "@workspace/db";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Thrown when a decrement would take a warehouse balance below zero. */
export class InsufficientStockError extends Error {
  constructor(public productId: number, public available: number, public requested: number) {
    super(`Insufficient stock for product ${productId}: only ${available} available, ${requested} requested`);
  }
}

/**
 * Atomically adjusts a warehouse stock balance for `productId`/`warehouseId`
 * by `delta` (positive to increase, negative to decrease), and returns the
 * resulting quantity.
 *
 * Concurrency: acquires a transaction-scoped Postgres advisory lock keyed on
 * (productId, warehouseId) before reading the balance, so two concurrent
 * transactions touching the same balance are fully serialized -- one always
 * finishes (and commits or throws) before the other's read happens. This
 * avoids the "insert-or-update" race where two first-time adjustments could
 * both see no row and insert duplicate balances, and it lets an
 * insufficient-stock check throw an ordinary catchable error instead of a
 * Postgres constraint violation, which would otherwise abort the whole
 * transaction and make every subsequent query in it fail with
 * "current transaction is aborted". The DB-level unique
 * (product_id, warehouse_id) and CHECK (quantity >= 0) constraints on
 * product_stock remain as a defense-in-depth backstop, not the primary
 * mechanism, for any code path that bypasses this helper.
 */
export async function adjustStock(
  tx: Tx,
  productId: number,
  warehouseId: number,
  delta: number,
): Promise<number> {
  await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`stock:${productId}:${warehouseId}`}))`);

  const [existing] = await tx.select().from(productStockTable)
    .where(and(eq(productStockTable.productId, productId), eq(productStockTable.warehouseId, warehouseId))).limit(1);
  const currentQty = existing?.quantity ?? 0;
  const newQty = currentQty + delta;
  if (newQty < 0) {
    throw new InsufficientStockError(productId, currentQty, -delta);
  }
  if (existing) {
    await tx.update(productStockTable).set({ quantity: newQty }).where(eq(productStockTable.id, existing.id));
  } else {
    await tx.insert(productStockTable).values({ productId, warehouseId, quantity: newQty });
  }
  return newQty;
}

export async function getStockQty(productId: number, warehouseId: number): Promise<number> {
  const [row] = await db.select().from(productStockTable)
    .where(and(eq(productStockTable.productId, productId), eq(productStockTable.warehouseId, warehouseId))).limit(1);
  return row?.quantity ?? 0;
}
