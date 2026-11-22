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
