import { DEMO_PRODUCTS, STORE_CATEGORIES, STORE_GROUPS } from '@/lib/demo/store';
import { ARRANGEMENTS, DEMO_APARTMENTS, DEMO_HOTELS } from '@/lib/demo/stays';
import type { ApartmentArrangement, StoreCategory } from '@/lib/types';

/**
 * Content access layer.
 *
 * Pages read content only through these functions. In Phase 2 they return demonstration data;
 * a later phase can swap each body for a call to the Express API without changing the pages.
 * Import this module from Server Components only, so demonstration arrays are not shipped in
 * client bundles.
 */

export async function getStoreGroups() {
  return STORE_GROUPS;
}

export async function getStoreCategories() {
  return STORE_CATEGORIES;
}

export async function findStoreCategory(slug: string | undefined): Promise<StoreCategory | undefined> {
  if (!slug) return undefined;
  return STORE_CATEGORIES.find((category) => category.slug === slug);
}

export async function getDemoProducts(categorySlug?: string) {
  return categorySlug ? DEMO_PRODUCTS.filter((product) => product.categorySlug === categorySlug) : DEMO_PRODUCTS;
}

export async function getDemoHotels() {
  return DEMO_HOTELS;
}

export async function getApartmentArrangements() {
  return ARRANGEMENTS;
}

export function isApartmentArrangement(value: string | undefined): value is ApartmentArrangement {
  return ARRANGEMENTS.some((arrangement) => arrangement.id === value);
}

export async function getDemoApartments(arrangement?: ApartmentArrangement) {
  return arrangement ? DEMO_APARTMENTS.filter((apartment) => apartment.arrangement === arrangement) : DEMO_APARTMENTS;
}
