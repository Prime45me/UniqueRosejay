import { DISPLAY_LOCALE } from '@/lib/site';
import type { Money, StockStatus } from '@/lib/store/types';

/**
 * Formats a decimal-string amount in its own currency. The amount is passed to Intl as a string
 * (no float arithmetic); display only — totals are always computed by the API.
 */
export function formatMoney(money: Money | null | undefined, locale = DISPLAY_LOCALE) {
  if (!money) return '—';
  const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency: money.currency });
  return formatter.format(money.amount as unknown as number);
}

export function formatPriceRange(from: Money, to: Money) {
  return from.amount === to.amount ? formatMoney(from) : `From ${formatMoney(from)}`;
}

export const STOCK_LABEL: Record<StockStatus, string> = {
  in_stock: 'In stock',
  low_stock: 'Low stock',
  out_of_stock: 'Out of stock'
};

/**
 * Human label for a variant's option values, ordered by the product's option definitions
 * (JSONB does not preserve key order, so stored objects cannot be relied on for ordering).
 */
export function optionLabel(values: Record<string, string>, options?: { key: string }[]) {
  const keys = options?.length ? [...options.map((o) => o.key), ...Object.keys(values).filter((k) => !options.some((o) => o.key === k))] : Object.keys(values);
  return keys
    .filter((key) => values[key] !== undefined)
    .map((key) => values[key])
    .join(' · ');
}

/**
 * Keeps hyphenated compound words together in display titles ("Two-Tone", "Body-Wave") by using a
 * non-breaking hyphen, so a title wraps between words rather than mid-compound. Spaces still wrap,
 * so titles stay fully responsive.
 */
export function displayTitle(title: string) {
  return title.replace(/(w)-(w)/g, '$1‑$2');
}

export function formatDateTime(value: string | Date, locale = DISPLAY_LOCALE) {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeStyle: 'short' }).format(new Date(value));
}

export function countryName(code: string, locale = DISPLAY_LOCALE) {
  return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code;
}
