# API

## Base URL

Development API base URL is configured in `.env` as:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Current endpoints

- `GET /api/health` — confirms the API is running

## Planned endpoints

- `GET /api/products`
- `GET /api/products/:slug`
- `POST /api/cart`
- `GET /api/cart`
- `POST /api/orders`
- `GET /api/hotels`
- `POST /api/hotel-reservations`
- `GET /api/apartments`
- `POST /api/apartment-reservations`
- `POST /api/auth/login`
- `POST /api/admin/login`

## Request conventions

- All JSON payloads should validate against Zod schemas
- All sensitive endpoints should use authentication and authorization
- Errors should return structured payloads with clear status codes

## Response conventions (implemented in `apps/server/src/lib/http.ts`)

- Success: `{ "data": … , "meta"?: { … } }` (lists put pagination in `meta`: `page`, `pageSize`, `total`).
- Error: `{ "error": { "code": "BAD_REQUEST" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | "INTERNAL_ERROR", "message": "…", "details"?: [ { "path", "message" } ] } }`.
- Money is `{ "amount": "245.0000", "currency": "XXX" }`, a decimal string plus an ISO 4217 code; never a float.
- Dates are ISO 8601 (`YYYY-MM-DD` for stay dates; UTC timestamps otherwise).
- Unknown `/api` routes return 404 in this envelope. Malformed JSON returns 400.
- CORS: only origins listed in `CORS_ORIGINS` may send credentialed requests.

The full proposed endpoint list for the expansion is in `docs/PHASE_2A_ASSESSMENT.md` §6.

## Store API (Phase 2B, implemented — `apps/server/src/store`)

Browsers reach these routes through the Next.js `/api` proxy, so cookies are first-party.

| Method | Path | Notes |
|---|---|---|
| GET | `/api/store/categories` | Groups with their categories and published product counts |
| GET | `/api/store/products` | `category` (category or group slug), `q`, `sort` (featured, price-asc, price-desc, newest, name), `availability` (all, in-stock), `minPrice`, `maxPrice`, `opt[<key>]=<value>`, `page`, `pageSize` (≤ 48). `meta` has pagination and facets. |
| GET | `/api/store/products/:slug` | Variants (price, stock status, max quantity), images, options, specifications, related products. Unpublished → 404 |
| GET | `/api/store/fulfilment-methods` | Enabled methods only (configuration) |
| GET | `/api/store/cart` | Server-priced cart with per-line issues and `canCheckout`. Never creates a cart |
| POST | `/api/store/cart/items` | `{ variantId, quantity }`. Creates the `urj_cart` HttpOnly cookie on first use |
| PATCH | `/api/store/cart/items/:itemId` | `{ quantity?, variantId? }`. Variant switch must stay within the same product; merges duplicate lines |
| DELETE | `/api/store/cart/items/:itemId` | |
| POST | `/api/store/orders` | `{ idempotencyKey, contact, fulfilmentMethod, address?, notes? }`. Creates an order **request**. Sets `urj_order_<REF>` cookie |
| GET | `/api/store/orders/:reference` | Only with that order's access cookie; otherwise 404 |

Rules: prices and totals are computed only by PostgreSQL; client-sent prices are ignored. Stock is checked on add, update and order. The line quantity limit is 10. Mutations reject foreign `Origin` headers. Rate limits per visitor: browse 1500, cart 300, orders 10 per 15 minutes. Errors use the standard envelope; stock conflicts return 409 with `details`.
