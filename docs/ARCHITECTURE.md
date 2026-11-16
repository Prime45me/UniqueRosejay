# Architecture

## Recommended architecture

The project uses a modular monolith with a Next.js storefront and a Node.js/Express API. This balances speed and maintainability while keeping each business domain separated into clear modules.

## Domain boundaries

- `fashion`: products, categories, carts, orders and checkout state
- `hotels`: hotel records, room types, reservation requests
- `apartments`: property records and reservation requests
- `users`: customer and admin identity and profile data
- `admin`: protected dashboard and business workflow orchestration
- `shared`: config, validation, middleware and common infrastructure

## Frontend

The frontend is a Next.js app that hosts the shared platform shell and uses section-specific pages for fashion, hotels and apartments. Reusable layout, cards and forms are kept in shared components so feature modules can reuse the same visual language.

## Backend

The backend is built with Express and TypeScript. Route modules are grouped by domain, and database access is centralized through a simple connection layer to keep queries consistent and safe.

## Data integrity

The schema is designed to support future availability checks, inventory management and auditing without hardcoding assumptions about ownership or payment flows.
