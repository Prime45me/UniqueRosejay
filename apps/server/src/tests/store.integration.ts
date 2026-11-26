/*
 * Store integration test — real HTTP against a real PostgreSQL database.
 *
 *   TEST_DATABASE_URL=postgresql://…/urj_test npm run test:store -w apps/server
 *
 * DESTRUCTIVE for the target database's store data: it migrates, reseeds the demo catalogue and
 * creates orders. It refuses to run without an explicit TEST_DATABASE_URL.
 */
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const TEST_DB = process.env.TEST_DATABASE_URL;
if (!TEST_DB) {
  console.error('Set TEST_DATABASE_URL to a disposable database. Refusing to run.');
  process.exit(1);
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const PORT = 4700 + Math.floor(Math.random() * 200);
const BASE = `http://127.0.0.1:${PORT}/api/store`;
const env = { ...process.env, DATABASE_URL: TEST_DB, PORT: String(PORT), NODE_ENV: 'test', CORS_ORIGINS: 'http://localhost:3000' };
const tsx = resolve(root, '../../node_modules/.bin/tsx' + (process.platform === 'win32' ? '.cmd' : ''));

function run(script: string) {
  const result = spawnSync(tsx, [script], { cwd: root, env, encoding: 'utf8', shell: process.platform === 'win32' });
  if (result.status !== 0) throw new Error(`${script} failed: ${result.stderr || result.stdout}`);
}

/** Minimal cookie jar per simulated browser. */
class Browser {
  cookies = new Map<string, string>();
  async call(method: string, path: string, body?: unknown, headers: Record<string, string> = {}) {
    const res = await fetch(BASE + path, {
      method,
      headers: {
        ...(body ? { 'content-type': 'application/json' } : {}),
        ...(this.cookies.size ? { cookie: [...this.cookies].map(([k, v]) => `${k}=${v}`).join('; ') } : {}),
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    });
    for (const line of res.headers.getSetCookie()) {
      const [pair] = line.split(';');
      const index = pair.indexOf('=');
      this.cookies.set(pair.slice(0, index), pair.slice(index + 1));
    }
    const json = (await res.json()) as any;
    return { status: res.status, json, data: json.data, setCookies: res.headers.getSetCookie() };
  }
}

let passed = 0;
async function check(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    throw error;
  }
}

async function main() {
  run('src/db/migrate.ts');
  run('src/db/seed-demo.ts');
  const db = new pg.Client({ connectionString: TEST_DB });
  await db.connect();
  // Clean transactional data so assertions are deterministic.
  await db.query('DELETE FROM order_status_history; DELETE FROM order_items; DELETE FROM orders; DELETE FROM cart_items; DELETE FROM carts;');

  const server = spawn(tsx, ['src/index.ts'], { cwd: root, env, shell: process.platform === 'win32', stdio: 'pipe' });
  let serverLog = '';
  server.stdout.on('data', (chunk) => (serverLog += chunk));
  server.stderr.on('data', (chunk) => (serverLog += chunk));
  for (let i = 0; i < 60; i += 1) {
    try {
      if ((await fetch(`http://127.0.0.1:${PORT}/api/health`)).ok) break;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  const variantId = async (slug: string, values: Record<string, string>) => {
    const { rows } = await db.query(
      'SELECT v.id FROM product_variants v JOIN products p ON p.id = v.product_id WHERE p.slug = $1 AND v.option_values = $2::jsonb',
      [slug, JSON.stringify(values)]
    );
    assert.ok(rows[0], `variant ${slug} ${JSON.stringify(values)} exists`);
    return rows[0].id as string;
  };
  const stock = async (id: string) => (await db.query('SELECT stock_quantity FROM product_variants WHERE id = $1', [id])).rows[0].stock_quantity;

  try {
    const guest = new Browser();
    console.log('Catalogue');
    await check('categories: 2 groups, 6 categories', async () => {
      const { data } = await guest.call('GET', '/categories');
      assert.equal(data.length, 2);
      assert.equal(data.flatMap((g: any) => g.categories).length, 6);
    });
    await check('listing hides unpublished products; pagination meta', async () => {
      const all = await guest.call('GET', '/products?pageSize=48');
      assert.equal(all.json.meta.total, 8);
      assert.ok(!all.data.some((p: any) => p.slug === 'unpublished-draft-product'));
      const page = await guest.call('GET', '/products?pageSize=3&page=2');
      assert.equal(page.data.length, 3);
      assert.equal(page.json.meta.totalPages, 3);
    });
    await check('category and group filters', async () => {
      assert.equal((await guest.call('GET', '/products?category=fashion-beauty')).json.meta.total, 4);
      assert.equal((await guest.call('GET', '/products?category=ice-chests')).json.meta.total, 2);
    });
    await check('search, including literal wildcard characters', async () => {
      const fridge = await guest.call('GET', '/products?q=refrigerator');
      assert.ok(fridge.data.some((p: any) => p.slug === 'french-door-refrigerator-540l'));
      assert.equal((await guest.call('GET', '/products?q=%25')).json.meta.total, 0);
    });
    await check('sorting by price', async () => {
      const { data } = await guest.call('GET', '/products?sort=price-asc&pageSize=48');
      const prices = data.map((p: any) => Number(p.priceFrom.amount));
      assert.deepEqual(prices, [...prices].sort((a, b) => a - b));
    });
    await check('availability, price and option filters', async () => {
      const inStock = await guest.call('GET', '/products?availability=in-stock&pageSize=48');
      assert.ok(!inStock.data.some((p: any) => p.slug === 'compact-ice-chest-25l'));
      const xl = await guest.call('GET', '/products?category=dresses-clothing&opt[size]=XL');
      assert.equal(xl.json.meta.total, 2);
      const pricey = await guest.call('GET', '/products?minPrice=500');
      assert.deepEqual(pricey.data.map((p: any) => p.slug).sort(), ['french-door-refrigerator-540l', 'graphite-front-load-washer-10kg']);
      assert.ok(xl.json.meta.facets.options.some((o: any) => o.key === 'size'));
    });
    await check('invalid query parameters are rejected', async () => {
      assert.equal((await guest.call('GET', '/products?sort=cheapest')).status, 400);
      assert.equal((await guest.call('GET', '/products?pageSize=1000')).status, 400);
    });
    await check('product detail with variants, prices and related products', async () => {
      const { data } = await guest.call('GET', '/products/chestnut-body-wave-lace-wig');
      assert.equal(data.variants.length, 9);
      const long = data.variants.find((v: any) => v.optionValues.length === '26 in');
      assert.equal(long.price.amount, '440.0000');
      assert.ok(data.related.length > 0);
      assert.equal((await guest.call('GET', '/products/unpublished-draft-product')).status, 404);
      assert.equal((await guest.call('GET', '/products/does-not-exist')).status, 404);
    });

    console.log('Cart');
    const dressM = await variantId('draped-two-tone-midi-dress', { colour: 'Ivory / Olive', size: 'M' }); // stock 2
    const dressS = await variantId('draped-two-tone-midi-dress', { colour: 'Ivory / Olive', size: 'S' }); // stock 5
    const dressXlOut = await variantId('draped-two-tone-midi-dress', { colour: 'Midnight / Sand', size: 'XL' }); // stock 0
    const wigLong = await variantId('chestnut-body-wave-lace-wig', { shade: 'Rich Chestnut', length: '26 in' });
    const fridge = await variantId('french-door-refrigerator-540l', { finish: 'Brushed Steel' });

    const shopper = new Browser();
    await check('empty cart without a cookie does not create a cart', async () => {
      const res = await shopper.call('GET', '/cart');
      assert.equal(res.data.itemCount, 0);
      assert.equal(res.setCookies.length, 0);
    });
    await check('add item sets an HttpOnly cart cookie; client price is ignored', async () => {
      const res = await shopper.call('POST', '/cart/items', { variantId: dressM, quantity: 1, price: '0.01', unitPrice: 0.01 });
      assert.equal(res.status, 201);
      assert.ok(res.setCookies[0].includes('HttpOnly') && res.setCookies[0].includes('SameSite=Lax'));
      assert.equal(res.data.subtotal.amount, '245.0000');
    });
    await check('stock limits are enforced', async () => {
      const over = await shopper.call('POST', '/cart/items', { variantId: dressM, quantity: 2 });
      assert.equal(over.status, 409);
      assert.equal(over.json.error.details.reason, 'insufficient_stock');
      assert.equal((await shopper.call('POST', '/cart/items', { variantId: dressXlOut, quantity: 1 })).status, 409);
    });
    await check('invalid quantities are rejected', async () => {
      assert.equal((await shopper.call('POST', '/cart/items', { variantId: dressS, quantity: 0 })).status, 400);
      assert.equal((await shopper.call('POST', '/cart/items', { variantId: dressS, quantity: 11 })).status, 400);
      assert.equal((await shopper.call('POST', '/cart/items', { variantId: 'not-a-uuid' })).status, 400);
    });
    let itemId = '';
    await check('update quantity and change variation', async () => {
      const cart = await shopper.call('GET', '/cart');
      itemId = cart.data.items[0].id;
      const q2 = await shopper.call('PATCH', `/cart/items/${itemId}`, { quantity: 2 });
      assert.equal(q2.data.subtotal.amount, '490.0000');
      const switched = await shopper.call('PATCH', `/cart/items/${itemId}`, { variantId: dressS });
      assert.equal(switched.data.items[0].variant.optionValues.size, 'S');
      assert.equal(switched.data.items[0].quantity, 2);
      assert.equal((await shopper.call('PATCH', `/cart/items/${itemId}`, { variantId: fridge })).status, 400);
    });
    await check('subtotal is computed server-side across lines', async () => {
      const res = await shopper.call('POST', '/cart/items', { variantId: wigLong, quantity: 1 });
      assert.equal(res.data.subtotal.amount, '930.0000'); // 2 × 245 + 440
      assert.equal(res.data.itemCount, 3);
      assert.equal(res.data.canCheckout, true);
    });
    await check('cart persists across requests (same cookie)', async () => {
      const again = await shopper.call('GET', '/cart');
      assert.equal(again.data.items.length, 2);
    });
    await check('remove item; foreign items cannot be touched', async () => {
      const other = new Browser();
      await other.call('POST', '/cart/items', { variantId: fridge, quantity: 1 });
      const foreignId = (await other.call('GET', '/cart')).data.items[0].id;
      assert.equal((await shopper.call('DELETE', `/cart/items/${foreignId}`)).status, 404);
      assert.equal((await shopper.call('PATCH', `/cart/items/${foreignId}`, { quantity: 2 })).status, 404);
    });
    await check('cross-site origin is refused on mutations', async () => {
      const res = await shopper.call('POST', '/cart/items', { variantId: dressS, quantity: 1 }, { origin: 'https://evil.example' });
      assert.equal(res.status, 403);
    });

    console.log('Order requests');
    const contact = { name: 'Test Customer', email: 'Test@Example.com', phone: '+44 20 0000 0000' };
    await check('fulfilment methods are configuration-driven', async () => {
      const { data } = await guest.call('GET', '/fulfilment-methods');
      assert.deepEqual(data.map((m: any) => m.code), ['delivery', 'collection']);
    });
    await check('delivery requires an address; unknown method rejected', async () => {
      assert.equal((await shopper.call('POST', '/orders', { idempotencyKey: randomUUID(), contact, fulfilmentMethod: 'delivery' })).status, 400);
      assert.equal((await shopper.call('POST', '/orders', { idempotencyKey: randomUUID(), contact, fulfilmentMethod: 'drone' })).status, 400);
      assert.equal((await shopper.call('POST', '/orders', { idempotencyKey: randomUUID(), contact: { ...contact, email: 'nope' }, fulfilmentMethod: 'collection' })).status, 400);
    });

    const stockBefore = await stock(dressS);
    const key = randomUUID();
    let reference = '';
    await check('order request is created with server totals and no payment', async () => {
      const res = await shopper.call('POST', '/orders', {
        idempotencyKey: key,
        contact,
        fulfilmentMethod: 'delivery',
        address: { line1: '1 Sample Street', locality: 'Sample City', countryCode: 'gb' },
        notes: 'Test order',
        total: '1.00'
      });
      assert.equal(res.status, 201, JSON.stringify(res.json));
      assert.match(res.data.reference, /^URJ-[A-Z0-9]{8}$/);
      assert.equal(res.data.paymentStatus, 'NOT_REQUESTED');
      reference = res.data.reference;
    });
    await check('order persisted with snapshots, history and reserved stock; cart emptied', async () => {
      const { rows } = await db.query('SELECT * FROM orders WHERE reference = $1', [reference]);
      assert.equal(rows.length, 1);
      assert.equal(rows[0].items_subtotal, '930.0000');
      assert.equal(rows[0].status, 'PENDING_REVIEW');
      assert.equal(rows[0].fulfilment_charge, null);
      assert.equal(rows[0].country_code, 'GB');
      assert.equal(rows[0].contact_email, 'test@example.com');
      assert.equal(rows[0].contains_demo_items, true);
      assert.notEqual(rows[0].access_token_hash.length, 0);
      const items = await db.query('SELECT * FROM order_items WHERE order_id = $1', [rows[0].id]);
      assert.equal(items.rows.length, 2);
      const history = await db.query('SELECT * FROM order_status_history WHERE order_id = $1', [rows[0].id]);
      assert.equal(history.rows.length, 1);
      assert.equal(await stock(dressS), stockBefore - 2);
      assert.equal((await shopper.call('GET', '/cart')).data.itemCount, 0);
    });
    await check('only the submitting browser can view the order', async () => {
      const mine = await shopper.call('GET', `/orders/${reference}`);
      assert.equal(mine.status, 200);
      assert.equal(mine.data.status, 'PENDING_REVIEW');
      assert.equal(mine.data.itemsSubtotal.amount, '930.0000');
      assert.equal(mine.data.fulfilmentCharge, null);
      assert.equal((await guest.call('GET', `/orders/${reference}`)).status, 404);
      const forged = new Browser();
      forged.cookies.set(`urj_order_${reference}`, 'forged-token');
      assert.equal((await forged.call('GET', `/orders/${reference}`)).status, 404);
    });
    await check('retrying with the same idempotency key returns the same order', async () => {
      const replay = await shopper.call('POST', '/orders', { idempotencyKey: key, contact, fulfilmentMethod: 'collection' });
      assert.equal(replay.status, 200);
      assert.equal(replay.data.reference, reference);
      assert.equal((await db.query('SELECT count(*)::int AS n FROM orders')).rows[0].n, 1);
    });
    await check('ordering with an empty bag is rejected', async () => {
      const res = await shopper.call('POST', '/orders', { idempotencyKey: randomUUID(), contact, fulfilmentMethod: 'collection' });
      assert.equal(res.status, 400);
    });
    await check('stock that sold out after carting blocks the order', async () => {
      const late = new Browser();
      await late.call('POST', '/cart/items', { variantId: fridge, quantity: 1 });
      await db.query('UPDATE product_variants SET stock_quantity = 0 WHERE id = $1', [fridge]);
      const cart = await late.call('GET', '/cart');
      assert.equal(cart.data.canCheckout, false);
      const res = await late.call('POST', '/orders', { idempotencyKey: randomUUID(), contact, fulfilmentMethod: 'collection' });
      assert.equal(res.status, 409);
      assert.equal(res.json.error.details[0].reason, 'out_of_stock');
    });
    await check('concurrent orders for the last unit: exactly one succeeds', async () => {
      const last = await variantId('top-handle-bag-and-mule-set', { colour: 'Obsidian', size: 'EU 37' });
      assert.equal(await stock(last), 1);
      const buyers = [new Browser(), new Browser(), new Browser()];
      for (const buyer of buyers) assert.equal((await buyer.call('POST', '/cart/items', { variantId: last, quantity: 1 })).status, 201);
      const results = await Promise.all(
        buyers.map((buyer) => buyer.call('POST', '/orders', { idempotencyKey: randomUUID(), contact, fulfilmentMethod: 'collection' }))
      );
      assert.deepEqual(results.map((r) => r.status).sort(), [201, 409, 409]);
      assert.equal(await stock(last), 0);
    });
  } finally {
    server.kill();
    if (process.platform === 'win32' && server.pid) spawnSync('taskkill', ['/pid', String(server.pid), '/t', '/f']);
    await db.end();
    if (process.exitCode) console.error(serverLog.slice(-2000));
  }
  console.log(`\n${passed} checks passed.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
