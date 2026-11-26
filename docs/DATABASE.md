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
