# Database

The project is configured around PostgreSQL and a modular schema that supports the MVP domains.

## Core entities

- users
- admins
- products
- product_categories
- product_variations
- carts
- cart_items
- orders
- order_items
- hotels
- hotel_room_types
- hotel_reservations
- apartments
- apartment_reservations
- payments

## Design principles

- Use UUID primary keys for future portability and safe record references
- Add foreign key relationships for all transactional child records
- Add indexes for listing, filtering and status queries
- Keep reservation and payment data separate from customer identity data
- Plan for availability validation, double-booking prevention and inventory checks
- Represent monetary values with PostgreSQL `NUMERIC` and store an explicit ISO 4217 currency code alongside each amount; do not use floating-point values or infer a currency from a symbol, locale or deployment location
- Preserve currency precision and record the currency used for each order, property rate and payment; currency conversion and settlement rules remain undecided
- Store country identifiers with standard country codes, while keeping country-specific validation configurable
- Model addresses with extensible structured fields for address lines, locality, administrative area, postal code and country; do not require one country's address shape globally
- Keep shipping destinations, serviceability and methods in configurable data rather than hardcoding one country, carrier, zone or delivery option
- Keep payment-provider details separate from order data behind a future integration boundary; no provider, method, settlement currency or international payment flow is selected or implemented
- Do not encode unresolved tax, customs, foreign-exchange, shipping coverage or local regulatory rules into the schema as if approved

## Future work

The schema is intentionally designed for expansion into international catalog and order workflows, real inventory, reservation status workflows and payment processing without forcing a rebuild. No business tables exist yet. A forward-only migration runner is in place (`npm run db:migrate -w apps/server`, files in `apps/server/migrations`). The proposed schema for the expansion is in `docs/PHASE_2A_ASSESSMENT.md` §7, pending review. Local PostgreSQL 18 listens on port 5001; the current `.env` credentials do not connect.

## Migration 0001_store (applied in test; not yet applied to the local URJ database)

Tables: `product_categories` (tree; groups are parents), `products` (`specifications` and `options` JSONB, `currency`, `base_price`, `is_published`, `is_demo`), `product_variants` (`option_values` JSONB, unique per product, `price_override`, `stock_quantity ≥ 0`), `product_images`, `carts` (token hash only), `cart_items` (unique per cart and variant, quantity 1–99), `fulfilment_methods` (configuration; no charges modelled), `orders` (reference, access-token hash, unique idempotency key, `PENDING_REVIEW` / `NOT_REQUESTED` defaults, nullable charges and tax, structured international address), `order_items` (name, SKU, option and price snapshots; `CHECK line_total = unit_price × quantity`), `order_status_history` (audit).

Money is `NUMERIC(19,4)` with `char(3)` currency. Every table has `updated_at` triggers where relevant. Deletes of ordered products or variants are restricted.

Demo data: `npm run db:seed:demo -w apps/server` (idempotent; every product `is_demo = true`; USD used only as a demonstration currency). Never run by `db:migrate`.
