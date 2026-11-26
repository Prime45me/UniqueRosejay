# Architecture

## Recommended architecture

Use a modular monolith with a Next.js frontend and a Node.js/Express API backed by PostgreSQL. This keeps the initial platform manageable while separating Store, Hotels, Apartments, customer and administration domains.

## Domain boundaries

- `store`: products, extensible categories, variations, carts, orders and checkout workflow
- `hotels`: hotel records, room types and reservation requests
- `apartments`: property records and reservation requests
- `users`: customer identity and profile
- `admin`: centralized business management, subject to server-side authorization
- `shared`: configuration, validation, middleware and common infrastructure

The client has confirmed centralized administration, but the exact staff roles and permission matrix are not yet defined. Do not invent role distinctions. Enforce authorization on the server when admin features are implemented, and finalize the policy with the client first.

## International operation

The platform is intended to operate internationally. Avoid country-specific assumptions in schemas, validation and workflows:

- Store country identifiers using standard country codes and keep country-specific rules configurable.
- Record each monetary amount with its ISO currency code; do not infer currency from a symbol, locale or deployment location. Use a numeric representation that preserves the currency's precision, and avoid floating-point arithmetic for financial calculations.
- Keep addresses as structured but extensible fields, including country, rather than assuming a single postal-code or region format.
- Model shipping options and serviceability as configurable rules by destination; do not bake in one delivery method, zone or country.
- Keep payment-provider integration behind a future provider boundary. No provider, payment method, settlement currency or international payment processing is selected or implemented yet.
- Display and format currencies using explicit currency codes and locale-aware formatting once the client confirms the presentation policy.

International readiness does not mean that tax, customs, foreign exchange, shipping coverage or local legal requirements have been decided. These remain business and compliance decisions.

## Frontend

The Next.js app provides one shared URJ website shell with separate Store, Hotels and Apartments sections. Shared components should keep navigation and brand identity consistent; section-specific pages can reflect each business area.

## Backend

The Express API uses TypeScript, validation and domain-grouped routes. Database access is centralized through a PostgreSQL connection layer. Use parameterized queries, server-side authorization and safe error responses when endpoints are added.

## Data integrity

Use foreign keys, indexes and safe incremental migrations. Future reservation workflows must prevent date conflicts server-side; order workflows must account for inventory concurrency. Do not claim real-time availability or complete purchases until those checks exist.

## Phase 2 expansion decisions (proposed 2026-11-26)

- **Data flow:** Next.js Server Components → `lib/content.ts` → Express API → PostgreSQL. Client components call the API only for interactive actions (cart, forms).
- **Backend layering per domain:** `routes` (HTTP and validation) → `services` (business rules and transactions) → `repositories` (parameterised SQL). Shared HTTP conventions live in `src/lib/http.ts`.
- **Sessions:** database-backed, opaque tokens in HttpOnly cookies, rather than JWTs, so logout and revocation are real.
- **Booking integrity:** physical room units plus a PostgreSQL exclusion constraint on overlapping date ranges; never frontend-only availability.
- **Migrations:** plain SQL, forward-only, checksum-verified (`apps/server/src/db/migrate.ts`).
See `docs/PHASE_2A_ASSESSMENT.md`.
