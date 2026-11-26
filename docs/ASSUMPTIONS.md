# Confirmed Requirements and Open Decisions

This list separates what the client has confirmed from matters still awaiting a business decision. Do not treat unresolved items as approved assumptions.

## Confirmed by the client

- Business name: **Unique RoseJay Enterprises (URJ)**.
- The platform has one main website and distinct business sections.
- Administration is centralized; administrators manage the business areas.
- The business intends to operate internationally.
- Retail scope is a broader Store / E-commerce catalog, including clothing, dresses, bags, shoes, wigs, ice chests, refrigerators, washing machines and future categories.

## Still unresolved

- Launch markets, initial country rollout and localization/language requirements.
- Legal entity and operating arrangements in each market.
- Hotel and apartment ownership, management and contracting model.
- Accommodation reservation approval policy and who is responsible for confirming inventory.
- Hotel and apartment pricing, rate rules, cancellation/refund terms and guest limits.
- Whether apartments support short-term rentals, long-term rentals or both.
- Payment providers, supported payment methods, settlement currencies and whether payment is in full, deposit or on arrival.
- International tax, customs, duties, foreign-exchange and regulatory responsibilities.
- Store shipping coverage, carriers, shipping rates, delivery timelines, pickup availability and returns policy.
- Store inventory, product variations, actual products, prices, currencies and catalog/category ownership.
- Guest checkout versus required customer accounts.
- Customer account profile and identity requirements.
- Exact staff roles, permissions, approval responsibilities and whether separate staff manage different sections. Centralized administration is confirmed; role granularity is not.
- Brand assets, approved logo, palette, typography, marketing copy and contact details.
- File storage provider and upload policy.
- Production hosting, database provider, backup and operational requirements.

## Temporary implementation boundaries

- Do not implement international payment processing until provider and business rules are approved.
- Never infer currency from `$`, a country, locale or property location. Any display-only demo content must be clearly marked and must not imply actual rates or inventory.
- Do not claim hotel or apartment availability without authoritative inventory checks.
- Do not define staff roles or permissions that the client has not approved.
- Keep category, address, country and shipping structures extensible while the client resolves policies.

## Phase 2 expansion — decisions required (2026-11-26)

Raised by `docs/PHASE_2A_ASSESSMENT.md` §9. Not answered, so not implemented as policy.

**Deferred by the client (2026-11-26):** hotel reservations, apartment requests and the other open decisions below will be handled later. Do not build or plan work that depends on them until the client reopens them.

- Store: delivery, collection or both; shipping regions and charges; payment provider, methods and timing (at checkout or after approval); tax display; pricing currency or currencies; guest checkout.
- Hotels: automatic confirmation or staff approval; whether a submitted request holds the room; payment, deposit, cancellation and refund policy; source of real inventory.
- Apartments: arrangements offered; minimum stay, deposit, payment and cancellation terms per arrangement; approval process.
- Accounts: email verification requirement and provider; notification channels.

Interim technical defaults (reversible; not business policy):
- Checkout submits an **order request** (`PENDING_REVIEW`); no payment is taken or simulated.
- Hotel and apartment submissions are **requests**, never shown as confirmed until the backend records a confirmation.
