# Component Migration

| Prototype | Next.js result | Type |
|---|---|---|
| index.css, index.html | globals.css, tailwind.config.ts, layout.tsx | Migrated |
| SafeImage | ui/Media (next/image and placeholder) | Rebuilt |
| StatusText | ui/Notice DemoLabel | Rebuilt |
| Header | layout/SiteHeader, PrimaryNav, MobileMenu | Rebuilt with routes |
| Footer | layout/SiteFooter | Migrated |
| HomeView | app/page.tsx | Migrated |
| StoreView (listing) | app/store/page.tsx, store/ProductCard, store/CategoryTile | Rebuilt |
| HotelsView (listing) | app/hotels/page.tsx, stays/HotelCard | Rebuilt |
| ApartmentsView (listing) | app/apartments/page.tsx, stays/ApartmentCard | Rebuilt |
| AboutContactViews | app/about, app/contact | Migrated; form disabled |
| urjData | lib/demo/* | Reduced and neutralised |
| CartDrawer, AccountView, AdminView, UrjContext, DesignSystemView, detail views | Not migrated | Out of scope |

New shared UI: Button, Container, FilterTabs, Icon, Media, Notice, Typography.
