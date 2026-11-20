import { IMAGES } from '@/lib/demo/images';
import type { DemoProduct, StoreCategory, StoreCategoryGroupInfo } from '@/lib/types';

/**
 * DEMONSTRATION DATA — Store.
 *
 * Category names reflect the client-confirmed Store scope. Products are illustrative design
 * content adapted from the AI Studio prototype (src/data/urjData.ts) with prices, currencies,
 * stock counts, SKUs and warranty/delivery claims removed. Replace with the Express catalogue API
 * (GET /api/categories, GET /api/products) in a later phase.
 */

export const STORE_GROUPS: StoreCategoryGroupInfo[] = [
  {
    id: 'fashion-beauty',
    name: 'Fashion & Beauty',
    kicker: 'Fashion & Beauty Edit',
    title: 'Wardrobe, Leather Goods & Beauty',
    description:
      'Presented lookbook-style: tall portrait imagery, colour swatches and clear size or length options.',
    banner: IMAGES.editorialFashionLookbook
  },
  {
    id: 'home-cooling',
    name: 'Home & Cooling Appliances',
    kicker: 'Home & Cooling Showroom',
    title: 'Refrigerators, Washing Machines & Ice Chests',
    description:
      'Presented showroom-style: studio photography with capacity, dimensions and key specifications up front.',
    banner: IMAGES.editorialApplianceShowroom
  }
];

export const STORE_CATEGORIES: StoreCategory[] = [
  {
    slug: 'dresses-clothing',
    name: 'Clothing & Dresses',
    group: 'fashion-beauty',
    presentationMode: 'fashion',
    description: 'Daywear, evening silhouettes and wardrobe essentials.',
    image: IMAGES.storeDress
  },
  {
    slug: 'bags-shoes',
    name: 'Bags & Shoes',
    group: 'fashion-beauty',
    presentationMode: 'fashion',
    description: 'Handbags, totes and footwear.',
    image: IMAGES.storeBagAndMules
  },
  {
    slug: 'wigs',
    name: 'Wigs',
    group: 'fashion-beauty',
    presentationMode: 'beauty',
    description: 'Lace-front and styled wig units.',
    image: IMAGES.storeWig
  },
  {
    slug: 'ice-chests',
    name: 'Ice Chests',
    group: 'home-cooling',
    presentationMode: 'appliance',
    description: 'Insulated coolers for travel, catering and outdoor use.',
    image: IMAGES.storeIceChest
  },
  {
    slug: 'refrigerators',
    name: 'Refrigerators',
    group: 'home-cooling',
    presentationMode: 'appliance',
    description: 'Domestic and multi-zone refrigeration.',
    image: IMAGES.storeRefrigerator
  },
  {
    slug: 'washing-machines',
    name: 'Washing Machines',
    group: 'home-cooling',
    presentationMode: 'appliance',
    description: 'Front-loading laundry machines for homes and residences.',
    image: IMAGES.storeWashingMachine
  }
];

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    slug: 'draped-two-tone-midi-dress',
    reference: 'DEMO-DRS-01',
    name: 'Draped Two-Tone Midi Dress',
    categorySlug: 'dresses-clothing',
    presentationMode: 'fashion',
    shortDescription: 'Bias-cut silhouette with an asymmetric olive drape over an ivory bodice.',
    editorialNote: 'Atelier edit · Fluid bias cut',
    images: [IMAGES.editorialFashionLookbook, IMAGES.storeDress],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    sizeLabel: 'Sizes',
    swatches: [
      { name: 'Ivory / Olive', hex: '#4B5334' },
      { name: 'Midnight / Sand', hex: '#1F242D' }
    ]
  },
  {
    slug: 'top-handle-bag-and-mule-set',
    reference: 'DEMO-ACC-01',
    name: 'Top-Handle Bag & Mule Set',
    categorySlug: 'bags-shoes',
    presentationMode: 'fashion',
    shortDescription: 'Pebbled leather top-handle bag with padlock hardware, paired with block-heel mules.',
    editorialNote: 'Leather goods · Pebbled hide & brass hardware',
    images: [IMAGES.storeBagAndMules, IMAGES.editorialFashionLookbook],
    sizes: ['EU 37', 'EU 38', 'EU 39', 'EU 40', 'EU 41'],
    sizeLabel: 'Footwear',
    swatches: [
      { name: 'Cognac', hex: '#9A5B32' },
      { name: 'Espresso', hex: '#4A3022' },
      { name: 'Obsidian', hex: '#181817' }
    ]
  },
  {
    slug: 'chestnut-body-wave-lace-wig',
    reference: 'DEMO-WIG-01',
    name: 'Chestnut Body-Wave Lace Wig',
    categorySlug: 'wigs',
    presentationMode: 'beauty',
    shortDescription: 'Natural-looking hairline on a breathable lace cap, with a soft body-wave finish.',
    editorialNote: 'Beauty edit · Lace front & natural density',
    images: [IMAGES.editorialBeautyPortrait, IMAGES.storeWig],
    sizes: ['18 in', '22 in', '26 in'],
    sizeLabel: 'Lengths',
    swatches: [
      { name: 'Rich Chestnut', hex: '#4E3124' },
      { name: 'Natural Black', hex: '#1B1918' },
      { name: 'Warm Espresso', hex: '#37241B' }
    ]
  },
  {
    slug: 'french-door-refrigerator',
    reference: 'DEMO-REF-01',
    name: 'Stainless French-Door Refrigerator',
    categorySlug: 'refrigerators',
    presentationMode: 'appliance',
    shortDescription: 'Multi-airflow cooling with an external water dispenser and a frost-free freezer drawer.',
    highlightSpec: '540 L · Inverter · Frost-free',
    images: [IMAGES.storeRefrigerator, IMAGES.editorialApplianceShowroom],
    specifications: [
      { label: 'Capacity', value: '540 L' },
      { label: 'Cooling', value: 'Inverter, frost-free' },
      { label: 'W × D × H', value: '910 × 690 × 1780 mm' }
    ]
  },
  {
    slug: 'front-load-washing-machine',
    reference: 'DEMO-WSH-01',
    name: 'Graphite Front-Load Washing Machine',
    categorySlug: 'washing-machines',
    presentationMode: 'appliance',
    shortDescription: 'Direct-drive front loader with a steam programme and a dial-and-display control panel.',
    highlightSpec: '10 kg · 1,300 rpm · Steam',
    images: [IMAGES.storeWashingMachine, IMAGES.editorialApplianceShowroom],
    specifications: [
      { label: 'Drum capacity', value: '10 kg' },
      { label: 'Max spin', value: '1,300 rpm' },
      { label: 'W × D × H', value: '600 × 585 × 850 mm' }
    ]
  },
  {
    slug: 'hard-shell-ice-chest',
    reference: 'DEMO-ICE-01',
    name: 'Hard-Shell Insulated Ice Chest',
    categorySlug: 'ice-chests',
    presentationMode: 'appliance',
    shortDescription: 'Thick-wall insulated cooler with stainless-steel latches and a drain plug.',
    highlightSpec: '65 L · 50 mm insulation · Steel latches',
    images: [IMAGES.storeIceChest],
    specifications: [
      { label: 'Volume', value: '65 L' },
      { label: 'Insulation', value: '50 mm polyurethane' },
      { label: 'W × D × H', value: '740 × 440 × 415 mm' }
    ]
  }
];
