import { randomInt } from 'node:crypto';
import { pool } from '../db/client.js';
import { ApiError } from '../lib/http.js';
import { hashToken, newToken, safeEqualHex } from '../lib/security.js';
import { money } from './catalogue.js';
import type { CreateOrderBody } from './schemas.js';

/*
 * Order requests.
 *
 * Payment, delivery charges and taxes are unresolved business decisions, so an order is created as
 * a REQUEST: status PENDING_REVIEW, payment_status NOT_REQUESTED, charges NULL ("to be confirmed").
 * Nothing here takes, simulates or reports a payment.
 *
 * Integrity:
 *  - One transaction: lock the cart, lock its variant rows (in id order, avoiding deadlocks),
 *    re-validate availability and stock, snapshot prices computed by PostgreSQL, reserve stock,
 *    record status history, then empty the cart.
 *  - Concurrent orders for the last unit serialise on the variant row lock; the loser receives 409.
 *  - A client-generated idempotency key makes retries safe: a repeated key returns the same order.
 */

const REFERENCE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I

function newReference() {
  let suffix = '';
  for (let i = 0; i < 8; i += 1) suffix += REFERENCE_ALPHABET[randomInt(REFERENCE_ALPHABET.length)];
  return `URJ-${suffix}`;
}

export const orderCookieName = (reference: string) => `urj_order_${reference}`;

export async function createOrder(cartId: string | null, body: CreateOrderBody) {
  const client = await pool.connect();
  const accessToken = newToken();
  try {
    await client.query('BEGIN');

    // Idempotent replay: return the existing order and rotate its access token for this client.
    const replay = await client.query<{ id: string; reference: string }>(
      'SELECT id, reference FROM orders WHERE idempotency_key = $1 FOR UPDATE',
      [body.idempotencyKey]
    );
    if (replay.rows[0]) {
      await client.query('UPDATE orders SET access_token_hash = $1 WHERE id = $2', [hashToken(accessToken), replay.rows[0].id]);
      await client.query('COMMIT');
      return { reference: replay.rows[0].reference, accessToken, replayed: true };
    }

    if (!cartId) throw ApiError.badRequest('Your bag is empty');
    await client.query('SELECT id FROM carts WHERE id = $1 FOR UPDATE', [cartId]);

    const method = await client.query<{ code: string; requires_address: boolean }>(
      'SELECT code, requires_address FROM fulfilment_methods WHERE code = $1 AND is_enabled',
      [body.fulfilmentMethod]
    );
    if (!method.rows[0]) throw ApiError.badRequest('This fulfilment option is not available');
    if (method.rows[0].requires_address && !body.address) {
      throw ApiError.badRequest('An address is required for this fulfilment option', [{ path: 'address', message: 'Required' }]);
    }

    const { rows: lines } = await client.query<{
      variant_id: string;
      quantity: number;
      stock_quantity: number;
      purchasable: boolean;
      currency: string;
      is_demo: boolean;
      name: string;
    }>(
      `SELECT ci.variant_id, ci.quantity, v.stock_quantity, p.currency, p.is_demo, p.name,
              (v.is_active AND p.is_published AND c.is_active) AS purchasable
         FROM cart_items ci
         JOIN product_variants v ON v.id = ci.variant_id
         JOIN products p ON p.id = v.product_id
         JOIN product_categories c ON c.id = p.category_id
        WHERE ci.cart_id = $1
        ORDER BY v.id
          FOR UPDATE OF v`,
      [cartId]
    );
    if (lines.length === 0) throw ApiError.badRequest('Your bag is empty');

    const problems = lines.flatMap((line) => {
      if (!line.purchasable) return [{ variantId: line.variant_id, reason: 'unavailable', message: `${line.name} is no longer available` }];
      if (line.quantity > line.stock_quantity) {
        return [
          {
            variantId: line.variant_id,
            reason: line.stock_quantity <= 0 ? 'out_of_stock' : 'insufficient_stock',
            available: Math.max(0, line.stock_quantity),
            message: line.stock_quantity <= 0 ? `${line.name} is out of stock` : `Only ${line.stock_quantity} of ${line.name} available`
          }
        ];
      }
      return [];
    });
    if (problems.length) throw ApiError.conflict('Some items in your bag are no longer available as requested', problems);

    const currencies = new Set(lines.map((line) => line.currency));
    if (currencies.size !== 1) throw ApiError.conflict('Items priced in different currencies cannot be ordered together');
    const currency = [...currencies][0];

    let reference = newReference();
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const clash = await client.query('SELECT 1 FROM orders WHERE reference = $1', [reference]);
      if (!clash.rowCount) break;
      reference = newReference();
    }

    const address = body.address;
    const { rows: orderRows } = await client.query<{ id: string }>(
      `INSERT INTO orders (reference, access_token_hash, idempotency_key, currency, items_subtotal,
                           contact_name, contact_email, contact_phone, fulfilment_method,
                           address_line1, address_line2, locality, administrative_area, postal_code, country_code,
                           customer_notes, contains_demo_items)
       VALUES ($1, $2, $3, $4,
               (SELECT sum(coalesce(v.price_override, p.base_price) * ci.quantity)
                  FROM cart_items ci JOIN product_variants v ON v.id = ci.variant_id JOIN products p ON p.id = v.product_id
                 WHERE ci.cart_id = $5),
               $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING id`,
      [
        reference,
        hashToken(accessToken),
        body.idempotencyKey,
        currency,
        cartId,
        body.contact.name,
        body.contact.email.toLowerCase(),
        body.contact.phone,
        body.fulfilmentMethod,
        method.rows[0].requires_address ? address?.line1 ?? null : null,
        method.rows[0].requires_address ? address?.line2 ?? null : null,
        method.rows[0].requires_address ? address?.locality ?? null : null,
        method.rows[0].requires_address ? address?.administrativeArea ?? null : null,
        method.rows[0].requires_address ? address?.postalCode ?? null : null,
        method.rows[0].requires_address ? address?.countryCode ?? null : null,
        body.notes ?? null,
        lines.some((line) => line.is_demo)
      ]
    );
    const orderId = orderRows[0].id;

    // Snapshot line items with prices computed in SQL NUMERIC.
    await client.query(
      `INSERT INTO order_items (order_id, product_id, variant_id, sku, product_name, option_values, unit_price, quantity, line_total, currency)
       SELECT $1, p.id, v.id, v.sku, p.name, v.option_values,
              coalesce(v.price_override, p.base_price), ci.quantity,
              coalesce(v.price_override, p.base_price) * ci.quantity, p.currency
         FROM cart_items ci JOIN product_variants v ON v.id = ci.variant_id JOIN products p ON p.id = v.product_id
        WHERE ci.cart_id = $2
        ORDER BY ci.created_at`,
      [orderId, cartId]
    );

    // Reserve stock. The CHECK (stock_quantity >= 0) constraint is a final guard.
    await client.query(
      `UPDATE product_variants v SET stock_quantity = v.stock_quantity - ci.quantity
         FROM cart_items ci WHERE ci.cart_id = $1 AND ci.variant_id = v.id`,
      [cartId]
    );

    await client.query(
      `INSERT INTO order_status_history (order_id, status, note) VALUES ($1, 'PENDING_REVIEW', 'Order request submitted by customer; no payment taken')`,
      [orderId]
    );
    await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

    await client.query('COMMIT');
    return { reference, accessToken, replayed: false };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    // Unique violation on idempotency_key: a concurrent duplicate submission won the race.
    if ((error as { code?: string }).code === '23505' && String((error as { constraint?: string }).constraint).includes('idempotency')) {
      throw ApiError.conflict('This order was already submitted', { reason: 'duplicate_submission' });
    }
    throw error;
  } finally {
    client.release();
  }
}

/** Returns an order only to a holder of its access token. Any mismatch is reported as not found. */
export async function getOrder(reference: string, accessToken: string | undefined) {
  if (!accessToken) throw ApiError.notFound('Order not found');
  const { rows } = await pool.query(
    `SELECT o.*, f.label AS fulfilment_label
       FROM orders o JOIN fulfilment_methods f ON f.code = o.fulfilment_method
      WHERE o.reference = $1`,
    [reference]
  );
  const order = rows[0];
  if (!order || !safeEqualHex(order.access_token_hash, hashToken(accessToken))) throw ApiError.notFound('Order not found');

  const items = await pool.query(
    `SELECT oi.product_name, oi.sku, oi.option_values, oi.unit_price, oi.quantity, oi.line_total, oi.currency, p.slug, p.options,
            (SELECT json_build_object('src', i.src, 'alt', i.alt, 'focalPoint', i.focal_point)
               FROM product_images i WHERE i.product_id = oi.product_id ORDER BY i.sort_order LIMIT 1) AS image
       FROM order_items oi JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = $1 ORDER BY oi.created_at, oi.id`,
    [order.id]
  );

  const currency = order.currency.trim();
  return {
    reference: order.reference,
    status: order.status,
    paymentStatus: order.payment_status,
    createdAt: order.created_at,
    currency,
    itemsSubtotal: money(order.items_subtotal, currency),
    fulfilmentCharge: order.fulfilment_charge === null ? null : money(order.fulfilment_charge, currency),
    taxAmount: order.tax_amount === null ? null : money(order.tax_amount, currency),
    fulfilment: {
      method: order.fulfilment_method,
      label: order.fulfilment_label,
      address: order.address_line1
        ? {
            line1: order.address_line1,
            line2: order.address_line2,
            locality: order.locality,
            administrativeArea: order.administrative_area,
            postalCode: order.postal_code,
            countryCode: order.country_code
          }
        : null
    },
    contact: { name: order.contact_name, email: order.contact_email, phone: order.contact_phone },
    notes: order.customer_notes,
    containsDemoItems: order.contains_demo_items,
    items: items.rows.map((item) => ({
      productName: item.product_name,
      productSlug: item.slug,
      sku: item.sku,
      optionValues: item.option_values,
      options: item.options,
      unitPrice: money(item.unit_price, item.currency),
      quantity: item.quantity,
      lineTotal: money(item.line_total, item.currency),
      image: item.image
    }))
  };
}
