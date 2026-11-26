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
