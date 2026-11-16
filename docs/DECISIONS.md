# Decisions

## Chosen stack

The project follows the stack requested in the plan: Next.js on the frontend and Node.js/Express on the backend, with PostgreSQL and a modular monolith architecture.

## Why this structure

- Keeps business domains separate without unnecessary microservice complexity
- Preserves a simple workflow for a small team and early MVP delivery
- Makes it easier to add future modules and admin tooling
- Reduces early technical risk while supporting clear growth paths

## Important implementation choices

- Use TypeScript in both frontend and backend
- Centralize environment configuration and validation
- Use structured route modules and database access helpers
- Keep reservation flows request-based until confirmed booking rules are approved
