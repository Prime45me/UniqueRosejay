# Phase 2 Integration Progress

Design integration of the Google AI Studio reference into `apps/web`. Backend, database and dependencies were not changed for Phase 2.

## Routes

`/`, `/store` (`?category=`), `/hotels`, `/apartments` (`?arrangement=`), `/about`, `/contact`, and a styled 404.

## Files

- Modified: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `tailwind.config.ts`
- Removed: `components/SiteHeader.tsx` (replaced by `components/layout/SiteHeader.tsx`)
- Created: the other route pages, `app/not-found.tsx`, `app/icon.svg`, `components/{ui,layout,store,stays}/*`, `lib/{types,site,content}.ts`, `lib/demo/*`, `public/images/urj/*` (14 images)

## Verification (2026-11-22)

| Check | Result |
|---|---|
| Frontend and backend TypeScript | Passed |
| Frontend and backend production builds | Passed (frontend re-run on final code) |
| `npm audit`, `npm audit --omit=dev` | 0 vulnerabilities |
| Routes, internal links (16), images (14) over HTTP | Passed, before the final visual fixes |
| Horizontal overflow at 375, 768, 1024, 1440 px | None, before the final visual fixes |
| Mobile menu open, Escape, focus return, close on navigation | Passed, before the final visual fixes |
| Browser console | Only a missing favicon (404); `app/icon.svg` was then added |

The final visual fixes (overlay contrast, apartment metric cells, Future Categories width, site icon) were compiled and built but not re-inspected in a browser, as checks were stopped at the user's request.

Builds also failed along the way: once from low machine memory, once on a circular `@apply` (fixed), once on incomplete `.next` output after that failure (fixed by a clean build), and once when the network dropped.

## Known limitations

- The build downloads Google Fonts, so it needs network access. Self-hosting the font files would remove this.
- Images carry third-party-looking marks: POLARIS / RUGGED TRAIL (ice chest), AETHEL (washing machine), AVENUE (hotel). The apartment view shows a recognisable London skyline. Replace them before launch.
- No product, hotel or apartment detail pages, search or sorting. The contact form is a disabled preview.
- Commit 3d58f4a contains a circular `@apply` that does not build; the following commit fixes it.
- No Phase 3 work (cart, checkout, payments, bookings, authentication, admin, uploads, migrations) was started.

## Phase 2A — 2026-11-26

- Assessment written: `docs/PHASE_2A_ASSESSMENT.md`.
- Server: root `.env` loading, `CORS_ORIGINS` allowlist, production `JWT_SECRET` guard, JSON error envelope and 404, `validate()` middleware, migration runner (`db:migrate`, `db:status`); removed unused `lib/validation.ts` (it had a floating-point price).
- Verified: server type check and build pass; health returns 200; unknown route returns a JSON 404; malformed JSON returns 400; a disallowed origin gets no CORS header; `localhost:3000` is allowed.
- Not verified: migrations, because the database cannot be reached with the current `.env` (`ECONNREFUSED` on 5432; on 5001 the password is rejected).
