# Decisions

## Client-confirmed direction

- The business is Unique RoseJay Enterprises (URJ).
- The website has one main entry point and separate Store, Hotels and Apartments business sections.
- Administration is centralized; administrators manage the platform and business areas.
- The business intends to operate internationally.
- Retail is a broad Store / E-commerce module, not a fashion-only catalog.

## Technical decisions

- Use Next.js, React, TypeScript, Tailwind CSS, Node.js, Express and PostgreSQL as a modular monolith.
- Keep Store product categories extensible so new goods can be added without code changes to a fixed category enumeration.
- Represent money with an explicit currency code, and do not hardcode a global currency in data or business logic.
- Keep country-specific address, shipping and validation rules extensible.
- Defer real payment processing until the client selects providers, methods and payment rules.
- Use request-based accommodation reservations until availability and confirmation workflows are approved and implemented.
- Enforce admin authorization server-side; do not assume particular staff roles or permissions before confirmation.

## Rationale

These choices align with the client's one-brand, multi-section model while avoiding technical constraints around future international commerce. A modular monolith keeps the MVP maintainable without introducing microservice overhead.
