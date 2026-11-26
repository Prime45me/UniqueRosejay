import { Router, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler, sendData, validate } from '../lib/http.js';
import { cookieOptions, newToken, readCookie, requireAllowedOrigin } from '../lib/security.js';
import { addItem, CART_COOKIE, CART_COOKIE_DAYS, createCart, findCartId, removeItem, updateItem, viewCart } from './cart.js';
import { getProduct, listCategories, listFulfilmentMethods, listProducts } from './catalogue.js';
import { createOrder, getOrder, orderCookieName } from './orders.js';
import {
  addCartItemBody,
  cartItemParams,
  createOrderBody,
  orderParams,
  productListQuery,
  slugParams,
  updateCartItemBody,
  type CreateOrderBody,
  type ProductListQuery
} from './schemas.js';

/*
 * /api/store — catalogue (public), cart (cookie), order requests (cookie + idempotency key).
 * Limits: browsing is generous; cart changes moderate; order submission strict.
 */

export const storeRouter = Router();

const limiter = (windowMinutes: number, max: number) =>
  rateLimit({ windowMs: windowMinutes * 60 * 1000, max, standardHeaders: true, legacyHeaders: false });

const browseLimit = limiter(15, 1500);
const cartLimit = limiter(15, 300);
const orderLimit = limiter(15, 10);

const query = <T>(req: Request) => (req as Request & { validatedQuery: T }).validatedQuery;
/** Route parameters are validated by `validate('params', …)` before handlers run. */
const param = (req: Request, name: string) => String(req.params[name]);

/** Returns the cart id for this browser, creating a cart (and cookie) when `create` is true. */
async function resolveCart(req: Request, res: Response, create: boolean) {
  const token = readCookie(req, CART_COOKIE);
  const existing = await findCartId(token);
  if (existing || !create) return existing;
  const fresh = newToken();
  const cartId = await createCart(fresh);
  res.cookie(CART_COOKIE, fresh, cookieOptions(CART_COOKIE_DAYS));
  return cartId;
}

storeRouter.use((_req, res, next) => {
  // Cart, order and personalised responses must never be cached by shared caches.
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// ---- Catalogue ------------------------------------------------------------------------------

storeRouter.get(
  '/categories',
  browseLimit,
  asyncHandler(async (_req, res) => sendData(res, await listCategories()))
);

storeRouter.get(
  '/products',
  browseLimit,
  validate('query', productListQuery),
  asyncHandler(async (req, res) => {
    const result = await listProducts(query<ProductListQuery>(req));
    sendData(res, result.items, { meta: result.meta });
  })
);

storeRouter.get(
  '/products/:slug',
  browseLimit,
  validate('params', slugParams),
  asyncHandler(async (req, res) => sendData(res, await getProduct(param(req, 'slug'))))
);

storeRouter.get(
  '/fulfilment-methods',
  browseLimit,
  asyncHandler(async (_req, res) => sendData(res, await listFulfilmentMethods()))
);

// ---- Cart -----------------------------------------------------------------------------------

storeRouter.get(
  '/cart',
  cartLimit,
  asyncHandler(async (req, res) => sendData(res, await viewCart(await resolveCart(req, res, false))))
);

storeRouter.post(
  '/cart/items',
  cartLimit,
  requireAllowedOrigin,
  validate('body', addCartItemBody),
  asyncHandler(async (req, res) => {
    const cartId = (await resolveCart(req, res, true)) as string;
    await addItem(cartId, req.body.variantId, req.body.quantity);
    sendData(res, await viewCart(cartId), { status: 201 });
  })
);

storeRouter.patch(
  '/cart/items/:itemId',
  cartLimit,
  requireAllowedOrigin,
  validate('params', cartItemParams),
  validate('body', updateCartItemBody),
  asyncHandler(async (req, res) => {
    const cartId = await resolveCart(req, res, false);
    if (!cartId) return sendData(res, await viewCart(null));
    await updateItem(cartId, param(req, 'itemId'), req.body);
    sendData(res, await viewCart(cartId));
  })
);

storeRouter.delete(
  '/cart/items/:itemId',
  cartLimit,
  requireAllowedOrigin,
  validate('params', cartItemParams),
  asyncHandler(async (req, res) => {
    const cartId = await resolveCart(req, res, false);
    if (cartId) await removeItem(cartId, param(req, 'itemId'));
    sendData(res, await viewCart(cartId));
  })
);

// ---- Order requests -------------------------------------------------------------------------

storeRouter.post(
  '/orders',
  orderLimit,
  requireAllowedOrigin,
  validate('body', createOrderBody),
  asyncHandler(async (req, res) => {
    const cartId = await resolveCart(req, res, false);
    const result = await createOrder(cartId, req.body as CreateOrderBody);
    res.cookie(orderCookieName(result.reference), result.accessToken, cookieOptions(90));
    sendData(
      res,
      { reference: result.reference, status: 'PENDING_REVIEW', paymentStatus: 'NOT_REQUESTED' },
      { status: result.replayed ? 200 : 201 }
    );
  })
);

storeRouter.get(
  '/orders/:reference',
  cartLimit,
  validate('params', orderParams),
  asyncHandler(async (req, res) => {
    const reference = param(req, 'reference');
    sendData(res, await getOrder(reference, readCookie(req, orderCookieName(reference))));
  })
);
