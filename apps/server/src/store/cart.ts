import type { PoolClient } from 'pg';
import { pool } from '../db/client.js';
import { ApiError } from '../lib/http.js';
import { hashToken } from '../lib/security.js';
import { money, stockStatus } from './catalogue.js';
import { MAX_LINE_QUANTITY } from './schemas.js';

/*
 * Server-side cart. The browser holds only an opaque token (HttpOnly cookie); the server stores
 * its SHA-256 hash. Prices, stock and totals are always recomputed from the database: the cart
 * never stores a price, so a client cannot influence one.
 */

export const CART_COOKIE = 'urj_cart';
export const CART_COOKIE_DAYS = 30;

type Db = Pick<PoolClient, 'query'>;

export type CartIssue = 'unavailable' | 'out_of_stock' | 'insufficient_stock' | 'currency_mismatch';

export async function findCartId(token: string | undefined, db: Db = pool): Promise<string | null> {
  if (!token) return null;
  const { rows } = await db.query<{ id: string }>(
    'SELECT id FROM carts WHERE token_hash = $1 AND expires_at > now()',
    [hashToken(token)]
  );
  return rows[0]?.id ?? null;
}

export async function createCart(token: string, db: Db = pool): Promise<string> {
  const { rows } = await db.query<{ id: string }>('INSERT INTO carts (token_hash) VALUES ($1) RETURNING id', [hashToken(token)]);
  return rows[0].id;
}

async function touch(cartId: string, db: Db) {
  await db.query("UPDATE carts SET expires_at = now() + interval '30 days' WHERE id = $1", [cartId]);
}

const EMPTY = {
  items: [],
  itemCount: 0,
  currency: null,
  subtotal: null,
  canCheckout: false,
  issues: [] as string[]
};

/** Full cart view with server-computed prices, line totals, subtotal and per-line issues. */
export async function viewCart(cartId: string | null, db: Db = pool) {
  if (!cartId) return EMPTY;

  const { rows } = await db.query(
    `SELECT ci.id, ci.quantity, v.id AS variant_id, v.sku, v.option_values, v.stock_quantity, v.is_active,
            p.id AS product_id, p.slug, p.name, p.options, p.is_published, p.is_demo, p.currency,
            c.presentation_mode, c.is_active AS category_active,
            coalesce(v.price_override, p.base_price) AS unit_price,
            coalesce(v.price_override, p.base_price) * ci.quantity AS line_total,
            (SELECT json_build_object('src', i.src, 'alt', i.alt, 'focalPoint', i.focal_point)
               FROM product_images i WHERE i.product_id = p.id ORDER BY i.sort_order LIMIT 1) AS image,
            (SELECT json_agg(json_build_object('id', ov.id, 'optionValues', ov.option_values,
                     'stockQuantity', ov.stock_quantity) ORDER BY ov.sort_order)
               FROM product_variants ov WHERE ov.product_id = p.id AND ov.is_active) AS choices
       FROM cart_items ci
       JOIN product_variants v ON v.id = ci.variant_id
       JOIN products p ON p.id = v.product_id
       JOIN product_categories c ON c.id = p.category_id
      WHERE ci.cart_id = $1
      ORDER BY ci.created_at`,
    [cartId]
  );
  if (rows.length === 0) return EMPTY;

  const currency = rows[0].currency.trim() as string;
  const items = rows.map((row) => {
    const issues: CartIssue[] = [];
    if (!row.is_active || !row.is_published || !row.category_active) issues.push('unavailable');
    else if (row.stock_quantity <= 0) issues.push('out_of_stock');
    else if (row.quantity > row.stock_quantity) issues.push('insufficient_stock');
    if (row.currency.trim() !== currency) issues.push('currency_mismatch');

    return {
      id: row.id,
      quantity: row.quantity,
      maxQuantity: Math.max(1, Math.min(row.stock_quantity, MAX_LINE_QUANTITY)),
      product: { id: row.product_id, slug: row.slug, name: row.name, presentationMode: row.presentation_mode, isDemo: row.is_demo },
      variant: { id: row.variant_id, sku: row.sku, optionValues: row.option_values, stockStatus: stockStatus(row.stock_quantity) },
      options: row.options,
      variantChoices: ((row.choices ?? []) as { id: string; optionValues: Record<string, string>; stockQuantity: number }[]).map(
        (choice) => ({ id: choice.id, optionValues: choice.optionValues, stockStatus: stockStatus(choice.stockQuantity) })
      ),
      unitPrice: money(row.unit_price, row.currency),
      lineTotal: money(row.line_total, row.currency),
      image: row.image,
      issues
    };
  });

  // Subtotal summed in SQL NUMERIC to avoid any floating-point arithmetic.
  const { rows: totals } = await db.query<{ subtotal: string }>(
    `SELECT coalesce(sum(coalesce(v.price_override, p.base_price) * ci.quantity), 0) AS subtotal
       FROM cart_items ci JOIN product_variants v ON v.id = ci.variant_id JOIN products p ON p.id = v.product_id
      WHERE ci.cart_id = $1`,
    [cartId]
  );

  const issues = [...new Set(items.flatMap((item) => item.issues))];
  return {
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    currency,
    subtotal: money(totals[0].subtotal, currency),
    canCheckout: issues.length === 0,
    issues
  };
}

async function loadVariant(variantId: string, db: Db) {
  const { rows } = await db.query<{ id: string; product_id: string; stock_quantity: number; currency: string; purchasable: boolean }>(
    `SELECT v.id, v.product_id, v.stock_quantity, p.currency,
            (v.is_active AND p.is_published AND c.is_active) AS purchasable
       FROM product_variants v JOIN products p ON p.id = v.product_id JOIN product_categories c ON c.id = p.category_id
      WHERE v.id = $1`,
    [variantId]
  );
  const variant = rows[0];
  if (!variant || !variant.purchasable) throw ApiError.notFound('This product option is not available');
  return variant;
}

function assertStock(requested: number, stock: number) {
  if (stock <= 0) throw ApiError.conflict('This option is out of stock', { reason: 'out_of_stock' });
  if (requested > stock) {
    throw ApiError.conflict(`Only ${stock} of this option can be added`, { reason: 'insufficient_stock', available: stock });
  }
  if (requested > MAX_LINE_QUANTITY) {
    throw ApiError.conflict(`A maximum of ${MAX_LINE_QUANTITY} of one option can be ordered at a time`, { reason: 'line_limit' });
  }
}

async function assertSingleCurrency(cartId: string, currency: string, db: Db, ignoreItemId?: string) {
  const { rows } = await db.query<{ currency: string }>(
    `SELECT DISTINCT p.currency FROM cart_items ci JOIN product_variants v ON v.id = ci.variant_id
       JOIN products p ON p.id = v.product_id WHERE ci.cart_id = $1 AND ($2::uuid IS NULL OR ci.id <> $2)`,
    [cartId, ignoreItemId ?? null]
  );
  if (rows.some((row) => row.currency !== currency)) {
    throw ApiError.conflict('Items priced in different currencies cannot share a bag', { reason: 'currency_mismatch' });
  }
}

export async function addItem(cartId: string, variantId: string, quantity: number) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT id FROM carts WHERE id = $1 FOR UPDATE', [cartId]);
    const variant = await loadVariant(variantId, client);
    await assertSingleCurrency(cartId, variant.currency, client);

    const existing = await client.query<{ quantity: number }>(
      'SELECT quantity FROM cart_items WHERE cart_id = $1 AND variant_id = $2',
      [cartId, variantId]
    );
    const nextQuantity = (existing.rows[0]?.quantity ?? 0) + quantity;
    assertStock(nextQuantity, variant.stock_quantity);

    await client.query(
      `INSERT INTO cart_items (cart_id, variant_id, quantity) VALUES ($1, $2, $3)
       ON CONFLICT (cart_id, variant_id) DO UPDATE SET quantity = EXCLUDED.quantity`,
      [cartId, variantId, nextQuantity]
    );
    await touch(cartId, client);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function updateItem(cartId: string, itemId: string, change: { quantity?: number; variantId?: string }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query<{ variant_id: string; quantity: number; product_id: string }>(
      `SELECT ci.variant_id, ci.quantity, v.product_id FROM cart_items ci JOIN product_variants v ON v.id = ci.variant_id
        WHERE ci.id = $1 AND ci.cart_id = $2 FOR UPDATE OF ci`,
      [itemId, cartId]
    );
    const item = rows[0];
    if (!item) throw ApiError.notFound('Bag item not found');

    const targetVariantId = change.variantId ?? item.variant_id;
    const quantity = change.quantity ?? item.quantity;
    const variant = await loadVariant(targetVariantId, client);
    if (variant.product_id !== item.product_id) throw ApiError.badRequest('A bag item can only switch to another option of the same product');

    if (targetVariantId === item.variant_id) {
      assertStock(quantity, variant.stock_quantity);
      await client.query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [quantity, itemId]);
    } else {
      // Switching option: merge into an existing line for that option if there is one.
      const other = await client.query<{ id: string; quantity: number }>(
        'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND variant_id = $2 FOR UPDATE',
        [cartId, targetVariantId]
      );
      const merged = quantity + (other.rows[0]?.quantity ?? 0);
      assertStock(merged, variant.stock_quantity);
      if (other.rows[0]) {
        await client.query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [merged, other.rows[0].id]);
        await client.query('DELETE FROM cart_items WHERE id = $1', [itemId]);
      } else {
        await client.query('UPDATE cart_items SET variant_id = $1, quantity = $2 WHERE id = $3', [targetVariantId, quantity, itemId]);
      }
    }
    await touch(cartId, client);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function removeItem(cartId: string, itemId: string) {
  const { rowCount } = await pool.query('DELETE FROM cart_items WHERE id = $1 AND cart_id = $2', [itemId, cartId]);
  if (!rowCount) throw ApiError.notFound('Bag item not found');
}
