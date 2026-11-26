/**
 * Site-wide configuration.
 *
 * Only client-confirmed facts appear here (see docs/ASSUMPTIONS.md). Anything the business has not
 * supplied — contact channels, addresses, launch markets — is an explicit placeholder so it can be
 * replaced from business settings in a later phase.
 */

export const SITE = {
  name: 'Unique RoseJay Enterprises',
  shortName: 'Unique RoseJay',
  abbreviation: 'URJ',
  tagline: 'Shop. Hotels. Apartments.',
  description:
    'Unique RoseJay Enterprises (URJ) brings its Store, Hotels and Apartments together on one website, under one centrally administered business.'
} as const;

/**
 * Display locale for money, dates and country names. The business has not confirmed launch markets
 * or a presentation locale, so this is neutral English ("en") rather than a country variant: it
 * formats each price in its own ISO currency without regional prefixes (e.g. "$245.00" for USD,
 * "£245.00" for GBP, "CA$245.00" for CAD). Override with NEXT_PUBLIC_DISPLAY_LOCALE once decided.
 */
export const DISPLAY_LOCALE = process.env.NEXT_PUBLIC_DISPLAY_LOCALE || 'en';

/** Placeholder text used wherever official company information has not been supplied. */
export const TO_BE_CONFIRMED = 'To be confirmed';

export const CONTACT_PLACEHOLDERS = {
  email: TO_BE_CONFIRMED,
  phone: TO_BE_CONFIRMED,
  location: TO_BE_CONFIRMED
} as const;

export interface NavItem {
  label: string;
  href: string;
}

/** Primary navigation — the five single-line links of the design's three-zone header (Bag is the action). */
export const PRIMARY_NAV: NavItem[] = [
  { label: 'Store', href: '/store' },
  { label: 'Hotels', href: '/hotels' },
  { label: 'Apartments', href: '/apartments' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' }
];


export const DEMO_NOTICE =
  'Products, properties, prices and photographs on this site are demonstration content, not verified URJ inventory.';
