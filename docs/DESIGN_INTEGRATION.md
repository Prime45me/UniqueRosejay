# Design Integration — Architectural Linen & Obsidian

- Tokens: ported from Tailwind v4 `@theme` to `tailwind.config.ts` (the project stays on Tailwind v3).
- Type: Cormorant Garamond, Plus Jakarta Sans and IBM Plex Mono through `next/font/google`.
- Verticals: fashion uses 3:4 lookbook cards; appliances use 4:3 cards with specifications; hotels use an evening banner and room tiers; apartments use a daylight banner and spatial metrics.
- Filters are URL links rendered on the server. Only `PrimaryNav` and `MobileMenu` are client components.
- Icons are inline SVG; no dependency was added.
- The header's Bag action became Contact, because cart is out of scope. Account and Admin links are omitted.

## Demonstration data

Kept in `lib/demo` and read by pages through `lib/content.ts`, except images, which pages also import directly. Prices, currencies, stock, rates, deposits and URJ-branded property names were removed. Remaining item specifications, room sizes, check-in times and amenities are illustrative. A site-wide notice and per-item labels identify demonstration content. Garden Courtyard Residence uses an identified image placeholder.

## Images

Source: `src/assets/images` of the AI Studio archive, copied byte-identical to `public/images/urj`.
Six additional Pexels demonstration photographs are stored locally in the same directory for hotel, pool, reception and apartment variety. Reuse and attribution details are maintained in `ASSET_ATTRIBUTION.md`.

| Source (`urj_…`) | File |
|---|---|
| hero_lifestyle | hero-lifestyle.jpg |
| editorial_fashion_lookbook | editorial-fashion-lookbook.jpg |
| editorial_beauty_wig | editorial-beauty-portrait.jpg |
| editorial_appliance_showroom | editorial-appliance-showroom.jpg |
| store_fashion_dress | store-dress.jpg |
| store_shoes_bag | store-bag-and-mules.jpg |
| store_wig_collection | store-wig.jpg |
| store_refrigerator | store-refrigerator.jpg |
| store_washer_icechest | store-washing-machine.jpg |
| store_ice_chest | store-ice-chest.jpg |
| hotel_flagship | hotel-exterior-evening.jpg |
| hotel_suite | hotel-room.jpg |
| apartment_penthouse | apartment-living-skyline.jpg |
| apartment_loft | apartment-loft.jpg |

## Premium refinement pass (2026-11-26)

- **Store landing:** image-led hero built from existing editorial assets; two-level category navigation (group underline tabs, quiet category row); slim toolbar (search, sort, Filters drawer); products before the category directory.
- **Disclosure:** one quiet site-wide "Preview" bar, one disclosure line per page, a muted "· Demo" marker in each card's category line, and price disclosure next to each product price. Repeated badges and duplicate notice panels were removed.
- **Locale:** `DISPLAY_LOCALE` in `lib/site.ts` (neutral `en`, overridable with `NEXT_PUBLIC_DISPLAY_LOCALE`) drives money, dates and country names. USD now shows as "$" instead of "US$"; other currencies keep their own symbol or code. No currency policy changed.
- **Titles:** `displayTitle()` keeps hyphenated compounds together using non-breaking hyphens; product titles use `text-pretty`. Spaces still wrap normally.
- **Controls:** `components/ui/Select` styles the native select (keyboard, screen readers and mobile pickers are unchanged) and is used in the Store, bag, checkout and contact form.
- **Motion:** shared `Drawer` with animated open and close (bag and filters); `Reveal` scroll fade for below-fold sections (no library, never hides content without JavaScript); refined card hover. All respect `prefers-reduced-motion`.
- **Wordmark:** typographic lockup ("Unique RoseJay" over a tracked "Enterprises" line with bronze rules). **No logo symbol was created.** Logo proposal for approval: a monogram in the display serif, either "URJ" or an interlaced "R" and "J", set within a thin bronze square frame. It would be used for the favicon and small placements only, with the wordmark kept as the primary mark.
