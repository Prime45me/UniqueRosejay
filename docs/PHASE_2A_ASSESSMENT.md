# Phase 2A — Architecture & Integration Assessment

**Date:** 2026-11-26 · **Branch:** `phase-2-design-integration` · **Status:** awaiting review before Phase 2B starts.

This assessment covers the expanded customer platform: Store purchasing, hotel reservations, apartment requests and a unified customer account. Nothing here creates database tables. The proposed schema is for review.

---

## 1. Current frontend

| Area | State |
|---|---|
| Framework | Next.js 15.5.29 App Router, React 18, Tailwind 3, TypeScript strict |
| Routes | `/`, `/store` (`?category=`), `/hotels`, `/apartments` (`?arrangement=`), `/about`, `/contact`, 404 |
| Rendering | Server Components; only `PrimaryNav` and `MobileMenu` are client components |
| Data | `lib/content.ts` returns demonstration arrays from `lib/demo/*`; no API calls yet |
| Design system | Tokens in `tailwind.config.ts`; fonts via `next/font`; shared UI in `components/ui/*` |
| Not present | Detail pages, search, sorting, cart, checkout, account, forms that submit, loading/error routes |

## 2. Backend

| Area | State before Phase 2A | Changed in Phase 2A |
|---|---|---|
| Server | Express 4, helmet, global rate limit (100 per 15 min on `/api`) | No change |
| Endpoints | `GET /api/health` only | Unknown `/api/*` routes now return a structured 404 |
| Env loading | Loaded `.env` from the working directory, which missed the root `.env` when run as a workspace | Loads the root `.env` explicitly |
| CORS | `origin: true` with credentials, so any site could make credentialed requests | Allowlist via `CORS_ORIGINS` (default `http://localhost:3000`) |
| Secrets | Placeholder `JWT_SECRET` accepted in any environment | Refused in production; must be 32+ characters |
| Errors | Express defaults (HTML, stack traces in development) | JSON envelope; no stack traces or SQL in responses |
| Validation | `lib/validation.ts`: unused schemas, one with a floating-point price | Removed; `validate()` middleware added |
| Migrations | None | Forward-only runner with checksum and lock (`db:migrate`, `db:status`) |

## 3. Database

- **Schema:** none. There are no tables, migrations or seed data in the repository.
- **Local server:** PostgreSQL 18 is installed and running on **port 5001**.
- **Connection: blocked.** The `.env` `DATABASE_URL` points at port 5432, and on port 5001 its password is rejected (`28P01`). I did not change credentials. **Action for you:** set the correct port and password in `.env` and create the `uniquerosejay` database. Until then, no migration can be applied or tested.

## 4. Reusable as-is

- Design tokens, fonts, `Container`, `Button`/`ButtonLink`, `Icon`, `Media` (next/image), `Notice`/`Ledger`, `FilterTabs`, `Typography`
- `SiteHeader`, `MobileMenu`, `SiteFooter` (needs an account link and cart count later)
- `ProductCard`, `CategoryTile`, `HotelCard`/`RoomTierTable`, `ApartmentCard`/`SpatialMetrics`: listing presentation is reusable once prices come from the API
- `lib/content.ts`: the single place pages get data, so it can switch to the API without touching pages
- Backend: helmet, rate limiter, `pg` pool, Zod

## 5. Needs expansion

| Component | Expansion |
|---|---|
| `lib/types.ts` | Align with API contracts: money as `{ amount: string, currency }`, variations, availability |
| `lib/content.ts` | Call the API from the server with timeouts; keep demo data as a development fallback |
| Store listing | Search, sort and pagination through URL parameters; product detail route `/store/[slug]` |
| Hotel listing | Search bar (destination, dates, guests) through URL parameters; `/hotels/[slug]` |
| Apartment listing | Location, price, bedroom and feature filters; `/apartments/[slug]` |
| Header | Account entry and cart count (small client island) |
| Contact form | Real submission once an endpoint exists |
| New | `loading.tsx`/`error.tsx` per section, form components, stepper, date-range picker, cart drawer |

## 6. Missing API endpoints

Proposed paths. All responses use the envelope in `docs/API.md`.

**Catalogue (public):** `GET /api/categories` · `GET /api/products?category=&q=&sort=&page=&pageSize=` · `GET /api/products/:slug` (variations, media, specifications, related)

**Cart (guest cookie or customer):** `GET /api/cart` · `POST /api/cart/items` · `PATCH /api/cart/items/:id` · `DELETE /api/cart/items/:id`

**Orders:** `POST /api/orders` (recomputes prices from the database; idempotency key) · `GET /api/orders/:reference` (owner only)

**Hotels:** `GET /api/hotels?destination=&checkIn=&checkOut=&guests=` · `GET /api/hotels/:slug` · `GET /api/hotels/:slug/availability?checkIn=&checkOut=&guests=` · `POST /api/hotel-reservations` · `GET /api/hotel-reservations/:reference` (owner only)

**Apartments:** `GET /api/apartments?location=&minPrice=&maxPrice=&bedrooms=&features=&arrangement=` · `GET /api/apartments/:slug` · `POST /api/apartment-requests` · `GET /api/apartment-requests/:reference` (owner only)

**Auth and account:** `POST /api/auth/register` · `POST /api/auth/login` · `POST /api/auth/logout` · `GET /api/account` · `PATCH /api/account` · `POST /api/account/password` · `GET /api/account/orders` · `GET /api/account/hotel-reservations` · `GET /api/account/apartment-requests` · `GET|PUT|DELETE /api/account/saved/:type/:id` · `PATCH /api/account/notification-preferences`

## 7. Proposed database changes (for review, not applied)

Conventions: UUID keys (`gen_random_uuid()`, built into PostgreSQL 13+), `timestamptz`, money as `NUMERIC(19,4)` with a `char(3)` ISO 4217 currency column, country as ISO 3166-1 alpha-2, and `created_at`/`updated_at` on every table.

| Migration | Tables | Integrity |
|---|---|---|
| 0001 customers & sessions | `customers`, `customer_sessions`, `customer_addresses`, `notification_preferences` | Unique lower-case email; store only a hash of each session token |
| 0002 catalogue | `product_categories` (self-referencing parent, `attribute_schema jsonb`), `products` (`specifications jsonb`, `is_demo`), `product_variations` (`attributes jsonb`, SKU, price override, stock), `product_media` | Category attributes stay in data, so new categories need no code change; stock never negative (`CHECK`) |
| 0003 cart & orders | `carts` (customer or guest token), `cart_items`, `orders` (reference, status, address snapshot), `order_items` (price and name snapshots), `order_status_history` | Prices are copied from the database at order time; stock is decremented under `SELECT … FOR UPDATE`; idempotency key unique |
| 0004 hotels | `hotels`, `hotel_room_types`, `hotel_rooms` (physical units), `hotel_reservations`, `reservation_status_history` | **No double booking:** an exclusion constraint on `(room_id, daterange(check_in, check_out))` for statuses that hold inventory (needs `btree_gist`) |
| 0005 apartments | `apartments`, `apartment_arrangements` (per-apartment rate, period and terms), `apartment_requests`, status history | Arrangement types are data rather than an enum, so the business can add or remove them |
| 0006 saved items | `saved_products`, `saved_properties` | Composite primary key per customer |

**Availability:** the backend counts free `hotel_rooms` units that have no overlapping holding reservation. Booking runs in one transaction: lock the room type, pick a free unit, insert. The exclusion constraint is the final guard against concurrent requests. *Which statuses hold a room depends on a business decision (§9).*

**Demonstration data:** a separate `seeds/demo.sql`, never run by `db:migrate`. Rows carry `is_demo = true`, and the API labels them in responses.

## 8. Security

- **Passwords:** Node's built-in `crypto.scrypt` with a per-user salt, compared in constant time. No new dependency.
- **Sessions:** random 32-byte token in an `HttpOnly; Secure; SameSite=Lax` cookie, with only its SHA-256 hash stored. Logout and password change revoke sessions server-side. This is preferred over long-lived JWTs because revocation is real.
- **Authorization:** every `/account` and owner-only query filters on the session's `customer_id` in SQL; a record belonging to someone else returns 404.
- **CSRF:** SameSite=Lax cookies plus an `Origin` check on state-changing requests.
- **Rate limits:** stricter limits on login, registration, password and order/reservation creation. Login failures return a generic message.
- **Money:** totals are computed only on the server, using NUMERIC/decimal-string arithmetic. Browser-supplied prices are ignored.
- **Input:** Zod on every body, query and parameter; SQL always parameterised; length limits on free text.
- **Already fixed:** CORS allowlist, production secret guard, no stack traces in error responses.
- **Open:** `JWT_SECRET` is unused once sessions are database-backed (rename to `SESSION_SECRET`); HTTPS and secure cookies in production depend on hosting, which is undecided.

## 9. Decisions needed from the business

These block specific features. Work that does not depend on them can continue.

**Store**
1. Delivery, collection or both?
2. Shipping regions and charges, or "charges confirmed after order review"?
3. Payment: which provider and methods, and pay at checkout or after URJ approves the order? *Until decided, checkout can only submit an **order request** with status `PENDING_REVIEW`; no payment is taken or simulated.*
4. Are taxes shown or included, and in which markets?
5. Which currency or currencies do prices use?
6. Guest checkout, or account required?

**Hotels**
7. Are reservations confirmed automatically, or approved by staff?
8. Does a *submitted* request hold the room (blocking other guests) or only a confirmed one?
9. Payment and deposit timing; cancellation and refund policy.
10. Source of truth for real inventory: URJ-managed or a partner channel manager?

**Apartments**
11. Which arrangements are offered: short-term, monthly, long-term?
12. Minimum stay, deposit, payment and cancellation terms per arrangement.
13. Approval process: viewing, application, contract.

**Accounts**
14. Is email verification required before ordering or reserving? This needs an email provider, which is undecided.
15. Which notification channels are allowed: email, SMS, none yet?

## 10. Recommended sequence

| Step | Scope | Blocked by |
|---|---|---|
| **2A (this)** | Assessment, API conventions, env/CORS fixes, migration runner | — (done, pending review) |
| 2B-1 | Catalogue schema and seeds, products and categories API, product detail pages, search, sort, pagination | Database access |
| 2B-2 | Cart (server-side, guest token) and cart drawer | Database access |
| 2B-3 | Checkout interface and order *request* persistence | Decisions 1, 3, 5, 6 for payment; the request flow can proceed |
| 2E-1 | Auth and sessions (moved earlier: orders and reservations need an owner) | Decision 14 |
| 2C | Hotels schema, availability, reservation requests | Decisions 7, 8 |
| 2D | Apartments schema and requests | Decision 11 |
| 2E-2 | Account dashboard: history, saved items, preferences | 2B–2D |
| 2F | End-to-end journeys, failure tests, responsive checks, builds | — |

I recommend moving authentication (2E-1) ahead of hotels, because order and reservation ownership depends on it.
