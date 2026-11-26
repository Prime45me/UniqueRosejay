import pg from 'pg';
import { env } from '../config/env.js';

/*
 * DEMONSTRATION catalogue seed — never run by db:migrate and never for production inventory.
 *
 *   npm run db:seed:demo -w apps/server
 *
 * Idempotent: categories, products and variants are upserted by slug/SKU. Every product row is
 * flagged is_demo = true and the storefront labels it as demonstration content. Prices are
 * illustrative and use USD purely as a demonstration currency; no currency policy is implied.
 */

const IMG = '/images/urj';
const DEMO_CURRENCY = 'USD';

interface SeedImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  focal?: string;
}
interface SeedOption {
  key: string;
  label: string;
  display: 'pill' | 'swatch';
  values: { value: string; hex?: string }[];
}
interface SeedProduct {
  slug: string;
  category: string;
  name: string;
  shortDescription: string;
  description: string;
  editorialNote?: string;
  highlightSpec?: string;
  specifications: { label: string; value: string }[];
  careNotes?: string;
  basePrice: string;
  featured?: boolean;
  published?: boolean;
  options: SeedOption[];
  /** SKU prefix; one variant is generated per option combination. */
  skuPrefix: string;
  /** Stock per variant, by combination index; defaults to 6. */
  stock?: (index: number, values: Record<string, string>) => number;
  priceOverride?: (values: Record<string, string>) => string | null;
  images: SeedImage[];
}

const GROUPS = [
  {
    slug: 'fashion-beauty',
    name: 'Fashion & Beauty',
    description: 'Wardrobe, leather goods and beauty, presented lookbook-style.',
    mode: 'fashion'
  },
  {
    slug: 'home-appliances',
    name: 'Home & Cooling Appliances',
    description: 'Refrigeration, laundry and cooling, presented showroom-style with specifications up front.',
    mode: 'appliance'
  }
] as const;

const CATEGORIES = [
  { slug: 'dresses-clothing', parent: 'fashion-beauty', name: 'Clothing & Dresses', mode: 'fashion', description: 'Daywear, evening silhouettes and wardrobe essentials.', image: `${IMG}/store-dress.jpg`, alt: 'Ivory and olive draped midi dress on a dress form in a white studio' },
  { slug: 'bags-shoes', parent: 'fashion-beauty', name: 'Bags & Shoes', mode: 'fashion', description: 'Handbags, totes and footwear.', image: `${IMG}/store-bag-and-mules.jpg`, alt: 'Tan leather top-handle bag beside matching block-heel mules' },
  { slug: 'wigs', parent: 'fashion-beauty', name: 'Wigs', mode: 'beauty', description: 'Lace-front and styled wig units.', image: `${IMG}/store-wig.jpg`, alt: 'Long dark-brown body-wave wig on a mannequin head' },
  { slug: 'ice-chests', parent: 'home-appliances', name: 'Ice Chests', mode: 'appliance', description: 'Insulated coolers for travel, catering and outdoor use.', image: `${IMG}/store-ice-chest.jpg`, alt: 'Sand-coloured hard-shell ice chest with steel latches' },
  { slug: 'refrigerators', parent: 'home-appliances', name: 'Refrigerators', mode: 'appliance', description: 'Domestic and multi-zone refrigeration.', image: `${IMG}/store-refrigerator.jpg`, alt: 'Stainless-steel French-door refrigerator against a stone wall' },
  { slug: 'washing-machines', parent: 'home-appliances', name: 'Washing Machines', mode: 'appliance', description: 'Front-loading laundry machines for homes and residences.', image: `${IMG}/store-washing-machine.jpg`, alt: 'Graphite front-loading washing machine in a studio' }
] as const;

const I = {
  lookbook: { src: `${IMG}/editorial-fashion-lookbook.jpg`, alt: 'Model in a draped ivory and olive midi dress holding a tan leather bag beneath a stone arcade', width: 896, height: 1200 },
  dress: { src: `${IMG}/store-dress.jpg`, alt: 'Ivory and olive draped satin midi dress on a dress form beside a travertine plinth', width: 1200, height: 896 },
  portrait: { src: `${IMG}/editorial-beauty-portrait.jpg`, alt: 'Woman with long dark-brown waves wearing an ivory linen jacket against a travertine wall', width: 896, height: 1200 },
  bag: { src: `${IMG}/store-bag-and-mules.jpg`, alt: 'Tan pebbled-leather top-handle bag with a brass padlock beside matching block-heel mules on a stone slab', width: 1200, height: 896, focal: '40% 50%' },
  wig: { src: `${IMG}/store-wig.jpg`, alt: 'Long dark-brown body-wave lace wig on a white mannequin head on a stone plinth', width: 1200, height: 896 },
  fridge: { src: `${IMG}/store-refrigerator.jpg`, alt: 'Stainless-steel French-door refrigerator with an external water dispenser against a pale stone wall', width: 1200, height: 896 },
  washer: { src: `${IMG}/store-washing-machine.jpg`, alt: 'Graphite front-loading washing machine with a dial and digital display in a concrete studio', width: 1200, height: 896 },
  chest: { src: `${IMG}/store-ice-chest.jpg`, alt: 'Sand-coloured hard-shell ice chest with stainless-steel latches on a rough stone block', width: 1200, height: 896 },
  showroom: { src: `${IMG}/editorial-appliance-showroom.jpg`, alt: 'Stone and oak kitchen with a stainless refrigerator beside a utility alcove with front-load machines', width: 1376, height: 768 }
} satisfies Record<string, SeedImage>;

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

const PRODUCTS: SeedProduct[] = [
  {
    slug: 'draped-two-tone-midi-dress',
    category: 'dresses-clothing',
    name: 'Draped Two-Tone Midi Dress',
    shortDescription: 'Bias-cut silhouette with an asymmetric olive drape over an ivory bodice.',
    description: 'A fluid bias-cut midi with a sculpted ivory bodice and an olive wrap drape that moves as you walk. Designed to move from daytime to evening.',
    editorialNote: 'Atelier edit · Fluid bias cut',
    specifications: [{ label: 'Length', value: 'Midi' }, { label: 'Fit', value: 'Bias cut, defined waist' }],
    careNotes: 'Dry clean recommended. Cool steam on the reverse.',
    basePrice: '245.00',
    featured: true,
    skuPrefix: 'DEMO-DRS-01',
    options: [
      { key: 'colour', label: 'Colour', display: 'swatch', values: [{ value: 'Ivory / Olive', hex: '#4B5334' }, { value: 'Midnight / Sand', hex: '#1F242D' }] },
      { key: 'size', label: 'Size', display: 'pill', values: SIZES.map((value) => ({ value })) }
    ],
    stock: (_i, v) => (v.size === 'XL' && v.colour === 'Midnight / Sand' ? 0 : v.size === 'M' ? 2 : 5),
    images: [I.lookbook, I.dress]
  },
  {
    slug: 'ivory-linen-tailored-jacket',
    category: 'dresses-clothing',
    name: 'Ivory Linen Tailored Jacket',
    shortDescription: 'Softly structured single-breasted jacket in washed ivory linen.',
    description: 'A relaxed, lightly structured linen jacket with a soft shoulder, cut to layer over dresses or tailored trousers.',
    editorialNote: 'Wardrobe essential · Washed linen',
    specifications: [{ label: 'Fabric', value: 'Washed linen' }, { label: 'Fit', value: 'Relaxed, single-breasted' }],
    careNotes: 'Cool wash, line dry, warm iron.',
    basePrice: '185.00',
    skuPrefix: 'DEMO-JKT-01',
    options: [{ key: 'size', label: 'Size', display: 'pill', values: SIZES.map((value) => ({ value })) }],
    images: [I.portrait]
  },
  {
    slug: 'top-handle-bag-and-mule-set',
    category: 'bags-shoes',
    name: 'Top-Handle Bag & Mule Set',
    shortDescription: 'Pebbled leather top-handle bag with padlock hardware, paired with block-heel mules.',
    description: 'A structured top-handle bag in pebbled leather with brass padlock hardware, offered as a set with matching 55 mm block-heel mules. The size applies to the mules.',
    editorialNote: 'Leather goods · Pebbled hide & brass hardware',
    specifications: [{ label: 'Material', value: 'Pebbled leather' }, { label: 'Heel height', value: '55 mm' }],
    careNotes: 'Condition the leather periodically; store in a dust bag.',
    basePrice: '310.00',
    featured: true,
    skuPrefix: 'DEMO-ACC-01',
    options: [
      { key: 'colour', label: 'Colour', display: 'swatch', values: [{ value: 'Cognac', hex: '#9A5B32' }, { value: 'Espresso', hex: '#4A3022' }, { value: 'Obsidian', hex: '#181817' }] },
      { key: 'size', label: 'Shoe size', display: 'pill', values: ['EU 37', 'EU 38', 'EU 39', 'EU 40', 'EU 41'].map((value) => ({ value })) }
    ],
    stock: (_i, v) => (v.colour === 'Obsidian' ? 1 : 4),
    images: [I.bag, I.lookbook]
  },
  {
    slug: 'chestnut-body-wave-lace-wig',
    category: 'wigs',
    name: 'Chestnut Body-Wave Lace Wig',
    shortDescription: 'Natural-looking hairline on a breathable lace cap, with a soft body-wave finish.',
    description: 'A lace-front unit with a natural-looking parting and a soft body wave. Lengths are measured from the crown.',
    editorialNote: 'Beauty edit · Lace front & natural density',
    specifications: [{ label: 'Cap', value: 'Lace front' }, { label: 'Texture', value: 'Body wave' }],
    careNotes: 'Sulfate-free cleanse; air dry on a stand.',
    basePrice: '380.00',
    featured: true,
    skuPrefix: 'DEMO-WIG-01',
    options: [
      { key: 'shade', label: 'Shade', display: 'swatch', values: [{ value: 'Rich Chestnut', hex: '#4E3124' }, { value: 'Natural Black', hex: '#1B1918' }, { value: 'Warm Espresso', hex: '#37241B' }] },
      { key: 'length', label: 'Length', display: 'pill', values: [{ value: '18 in' }, { value: '22 in' }, { value: '26 in' }] }
    ],
    priceOverride: (v) => (v.length === '26 in' ? '440.00' : v.length === '22 in' ? '410.00' : null),
    images: [I.wig, I.portrait]
  },
  {
    slug: 'french-door-refrigerator-540l',
    category: 'refrigerators',
    name: 'Stainless French-Door Refrigerator',
    shortDescription: 'Multi-airflow cooling with an external water dispenser and a frost-free freezer drawer.',
    description: 'A 540-litre French-door refrigerator with inverter cooling, an external water dispenser and a full-width freezer drawer.',
    highlightSpec: '540 L · Inverter · Frost-free',
    specifications: [
      { label: 'Total capacity', value: '540 L' },
      { label: 'Cooling', value: 'Inverter, frost-free' },
      { label: 'Dimensions (W × D × H)', value: '910 × 690 × 1780 mm' },
      { label: 'Noise level', value: '38 dBA' },
      { label: 'Power', value: '220–240 V / 50 Hz' }
    ],
    basePrice: '1290.00',
    featured: true,
    skuPrefix: 'DEMO-REF-01',
    options: [{ key: 'finish', label: 'Finish', display: 'swatch', values: [{ value: 'Brushed Steel', hex: '#9A9B9E' }, { value: 'Matte Slate', hex: '#3D3F42' }] }],
    stock: (_i, v) => (v.finish === 'Matte Slate' ? 2 : 3),
    priceOverride: (v) => (v.finish === 'Matte Slate' ? '1340.00' : null),
    images: [I.fridge, I.showroom]
  },
  {
    slug: 'graphite-front-load-washer-10kg',
    category: 'washing-machines',
    name: 'Graphite Front-Load Washing Machine',
    shortDescription: 'Direct-drive front loader with a steam programme and a dial-and-display control panel.',
    description: 'A 10 kg direct-drive front loader with 14 programmes including steam and delicate cycles.',
    highlightSpec: '10 kg · 1,300 rpm · Steam',
    specifications: [
      { label: 'Drum capacity', value: '10 kg' },
      { label: 'Max spin speed', value: '1,300 rpm' },
      { label: 'Dimensions (W × D × H)', value: '600 × 585 × 850 mm' },
      { label: 'Programmes', value: '14, including steam' }
    ],
    basePrice: '780.00',
    featured: true,
    skuPrefix: 'DEMO-WSH-01',
    options: [{ key: 'finish', label: 'Finish', display: 'swatch', values: [{ value: 'Matte Graphite', hex: '#4B4E52' }, { value: 'Alabaster White', hex: '#EAE8E3' }] }],
    stock: (_i, v) => (v.finish === 'Alabaster White' ? 0 : 4),
    images: [I.washer, I.showroom]
  },
  {
    slug: 'hard-shell-ice-chest-65l',
    category: 'ice-chests',
    name: 'Hard-Shell Insulated Ice Chest',
    shortDescription: 'Thick-wall insulated cooler with stainless-steel latches and a drain plug.',
    description: 'A rotomoulded 65-litre cooler with 50 mm insulation, stainless-steel latches and a threaded drain plug.',
    highlightSpec: '65 L · 50 mm insulation · Steel latches',
    specifications: [
      { label: 'Internal volume', value: '65 L' },
      { label: 'Insulation', value: '50 mm polyurethane' },
      { label: 'External dimensions', value: '740 × 440 × 415 mm' },
      { label: 'Dry weight', value: '13.4 kg' }
    ],
    basePrice: '225.00',
    featured: true,
    skuPrefix: 'DEMO-ICE-01',
    options: [{ key: 'colour', label: 'Colour', display: 'swatch', values: [{ value: 'Sandstone', hex: '#B9A68B' }, { value: 'Slate Charcoal', hex: '#383A3D' }] }],
    stock: () => 8,
    images: [I.chest]
  },
  {
    slug: 'compact-ice-chest-25l',
    category: 'ice-chests',
    name: 'Compact Ice Chest',
    shortDescription: 'Smaller hard-shell cooler for day trips, with a single latch and moulded handles.',
    description: 'A 25-litre version for shorter outings. Shown with a placeholder image until product photography is supplied.',
    highlightSpec: '25 L · 40 mm insulation',
    specifications: [
      { label: 'Internal volume', value: '25 L' },
      { label: 'Insulation', value: '40 mm polyurethane' }
    ],
    basePrice: '120.00',
    skuPrefix: 'DEMO-ICE-02',
    options: [],
    stock: () => 0,
    images: []
  },
  {
    slug: 'unpublished-draft-product',
    category: 'refrigerators',
    name: 'Draft Refrigerator (unpublished)',
    shortDescription: 'Unpublished draft — must never appear in the storefront.',
    description: 'Used to verify that unpublished products are hidden.',
    specifications: [],
    basePrice: '999.00',
    published: false,
    skuPrefix: 'DEMO-DRAFT-01',
    options: [],
    images: []
  }
];

function combinations(options: SeedOption[]): Record<string, string>[] {
  return options.reduce<Record<string, string>[]>(
    (acc, option) => acc.flatMap((combo) => option.values.map((v) => ({ ...combo, [option.key]: v.value }))),
    [{}]
  );
}

function skuFor(prefix: string, values: Record<string, string>) {
  const suffix = Object.values(values)
    .map((value) => value.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase())
    .join('-');
  return suffix ? `${prefix}-${suffix}` : prefix;
}

async function main() {
  const client = new pg.Client({ connectionString: env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('BEGIN');

    const ids = new Map<string, string>();
    for (const [index, group] of GROUPS.entries()) {
      const { rows } = await client.query<{ id: string }>(
        `INSERT INTO product_categories (slug, name, description, presentation_mode, sort_order)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
           presentation_mode = EXCLUDED.presentation_mode, sort_order = EXCLUDED.sort_order
         RETURNING id`,
        [group.slug, group.name, group.description, group.mode, index]
      );
      ids.set(group.slug, rows[0].id);
    }
    for (const [index, category] of CATEGORIES.entries()) {
      const { rows } = await client.query<{ id: string }>(
        `INSERT INTO product_categories (slug, parent_id, name, description, presentation_mode, image_src, image_alt, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, name = EXCLUDED.name,
           description = EXCLUDED.description, presentation_mode = EXCLUDED.presentation_mode,
           image_src = EXCLUDED.image_src, image_alt = EXCLUDED.image_alt, sort_order = EXCLUDED.sort_order
         RETURNING id`,
        [category.slug, ids.get(category.parent), category.name, category.description, category.mode, category.image, category.alt, index]
      );
      ids.set(category.slug, rows[0].id);
    }

    for (const [index, product] of PRODUCTS.entries()) {
      const { rows } = await client.query<{ id: string }>(
        `INSERT INTO products (category_id, slug, name, short_description, description, editorial_note, highlight_spec,
           specifications, options, care_notes, currency, base_price, is_published, is_featured, is_demo, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,true,$15)
         ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, name = EXCLUDED.name,
           short_description = EXCLUDED.short_description, description = EXCLUDED.description,
           editorial_note = EXCLUDED.editorial_note, highlight_spec = EXCLUDED.highlight_spec,
           specifications = EXCLUDED.specifications, options = EXCLUDED.options, care_notes = EXCLUDED.care_notes,
           currency = EXCLUDED.currency, base_price = EXCLUDED.base_price, is_published = EXCLUDED.is_published,
           is_featured = EXCLUDED.is_featured, is_demo = true, sort_order = EXCLUDED.sort_order
         RETURNING id`,
        [
          ids.get(product.category),
          product.slug,
          product.name,
          product.shortDescription,
          product.description,
          product.editorialNote ?? null,
          product.highlightSpec ?? null,
          JSON.stringify(product.specifications),
          JSON.stringify(product.options),
          product.careNotes ?? null,
          DEMO_CURRENCY,
          product.basePrice,
          product.published ?? true,
          product.featured ?? false,
          index
        ]
      );
      const productId = rows[0].id;

      for (const [variantIndex, values] of combinations(product.options).entries()) {
        await client.query(
          `INSERT INTO product_variants (product_id, sku, option_values, price_override, stock_quantity, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (sku) DO UPDATE SET option_values = EXCLUDED.option_values, price_override = EXCLUDED.price_override,
             stock_quantity = EXCLUDED.stock_quantity, sort_order = EXCLUDED.sort_order, is_active = true`,
          [
            productId,
            skuFor(product.skuPrefix, values),
            JSON.stringify(values),
            product.priceOverride?.(values) ?? null,
            product.stock ? product.stock(variantIndex, values) : 6,
            variantIndex
          ]
        );
      }

      await client.query('DELETE FROM product_images WHERE product_id = $1', [productId]);
      for (const [imageIndex, image] of product.images.entries()) {
        await client.query(
          `INSERT INTO product_images (product_id, src, alt, width, height, focal_point, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [productId, image.src, image.alt, image.width, image.height, image.focal ?? null, imageIndex]
        );
      }
    }

    // Demonstration fulfilment preferences. Charges are deliberately not modelled.
    await client.query(
      `INSERT INTO fulfilment_methods (code, label, description, requires_address, is_enabled, sort_order) VALUES
         ('delivery', 'Delivery', 'Delivery availability and charges are confirmed by URJ after your request is reviewed.', true, true, 0),
         ('collection', 'Collection', 'Collection arrangements are confirmed by URJ after your request is reviewed.', false, true, 1)
       ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description,
         requires_address = EXCLUDED.requires_address, is_enabled = EXCLUDED.is_enabled, sort_order = EXCLUDED.sort_order`
    );

    await client.query('COMMIT');
    console.log(`Seeded ${CATEGORIES.length} categories and ${PRODUCTS.length} demonstration products.`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error: Error) => {
  console.error(`Demo seed failed: ${error.message}`);
  process.exitCode = 1;
});
