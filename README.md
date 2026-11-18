# Unique RoseJay Enterprises (URJ)

This repository is the foundation for URJ's integrated website, with separate Store, Hotels and Apartments sections and centralized administration. The Store catalog is intended to extend beyond fashion, with future product categories supported.

## Stack

- Frontend: Next.js, React, TypeScript and Tailwind CSS
- Backend: Node.js, Express and TypeScript
- Database: PostgreSQL
- Architecture: modular monolith

## Getting started

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set local values.
3. Run `npm run dev`.
4. Open the frontend at `http://localhost:3000`; check the API at `http://localhost:4000/api/health`.

Do not use the example secret values in production. No database migration or production credential setup is included yet.

## Workspaces

- `apps/web`: Next.js website shell and homepage
- `apps/server`: Express API foundation and PostgreSQL connection
- `docs/`: project overview, architecture, API, database, assumptions, decisions and progress

## Status

See [STATUS.md](./STATUS.md) and [docs/PROGRESS.md](./docs/PROGRESS.md). Business modules are not implemented yet; reservation, checkout and payment flows must not be represented as operational.
