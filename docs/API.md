# API

## Base URL

Development API base URL is configured in `.env` as:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Current endpoints

- `GET /health` — confirms the API is running

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
