/**
 * Display types for the Phase 2 customer-facing pages.
 *
 * These are intentionally narrower than the production models in the design handoff
 * (DOMAIN_MODELS.md): no prices, currencies, stock levels or availability are modelled,
 * because none of those have been confirmed by the business yet.
 */

export interface SiteImage {
  /** Path under /public. */
  src: string;
  /** Meaningful description of what the photograph shows. */
  alt: string;
  /** Intrinsic pixel size of the source file. */
  width: number;
  height: number;
  /** CSS object-position focal point used when the frame crops the image (default: centre). */
  focalPoint?: string;
}

export type ProductPresentationMode = 'fashion' | 'beauty' | 'appliance';

export type StoreCategoryGroup = 'fashion-beauty' | 'home-cooling';

export interface StoreCategory {
  slug: string;
  name: string;
  group: StoreCategoryGroup;
  presentationMode: ProductPresentationMode;
  description: string;
  image: SiteImage;
}

export interface StoreCategoryGroupInfo {
  id: StoreCategoryGroup;
  name: string;
  kicker: string;
  title: string;
  description: string;
  banner: SiteImage;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Swatch {
  name: string;
  hex: string;
}

export interface DemoProduct {
  slug: string;
  /** Demonstration reference — not a real SKU. */
  reference: string;
  name: string;
  categorySlug: string;
  presentationMode: ProductPresentationMode;
  shortDescription: string;
  images: SiteImage[];
  editorialNote?: string;
  sizes?: string[];
  sizeLabel?: string;
  swatches?: Swatch[];
  highlightSpec?: string;
  specifications?: ProductSpecification[];
}

export interface DemoRoomTier {
  name: string;
  bedConfiguration: string;
  sizeSqm: number;
  maxGuests: number;
  amenities: string[];
}

export interface DemoHotel {
  slug: string;
  name: string;
  locationLabel: string;
  summary: string;
  description: string;
  images: SiteImage[];
  highlights: string[];
  checkInTime: string;
  checkOutTime: string;
  rooms: DemoRoomTier[];
}

export type ApartmentArrangement = 'short-term' | 'monthly-serviced' | 'long-term' | 'flexible';

export interface DemoApartment {
  slug: string;
  name: string;
  locationLabel: string;
  arrangement: ApartmentArrangement;
  furnishing: string;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  utilitiesIncluded: boolean;
  summary: string;
  images: SiteImage[];
  amenities: string[];
}
