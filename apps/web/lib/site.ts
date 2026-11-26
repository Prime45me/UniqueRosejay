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
  'Design preview: products, properties and photographs are demonstration content, not actual URJ inventory.';
