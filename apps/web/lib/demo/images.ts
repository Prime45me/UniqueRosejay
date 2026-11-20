import type { SiteImage } from '@/lib/types';

/**
 * Registry of the 14 design-reference photographs supplied with the Google AI Studio handoff.
 * Files live in /public/images/urj. Every image is demonstration imagery: it does not depict
 * actual URJ products, hotels or apartments.
 *
 * Alt text describes what each photograph shows, not what it is being used to advertise.
 */

const base = '/images/urj';

export const IMAGES = {
  heroLifestyle: {
    src: `${base}/hero-lifestyle.jpg`,
    alt: 'Bright boutique interior with a brass clothing rail of neutral-toned garments, a linen sofa and a planted courtyard behind glass doors',
    width: 1376,
    height: 768
  },
  editorialFashionLookbook: {
    src: `${base}/editorial-fashion-lookbook.jpg`,
    alt: 'Model in a draped ivory and olive midi dress holding a tan leather top-handle bag beneath a stone arcade',
    width: 896,
    height: 1200
  },
  editorialBeautyPortrait: {
    src: `${base}/editorial-beauty-portrait.jpg`,
    alt: 'Portrait of a smiling woman with long, glossy dark-brown waves, wearing an ivory linen jacket against a travertine wall',
    width: 896,
    height: 1200
  },
  editorialApplianceShowroom: {
    src: `${base}/editorial-appliance-showroom.jpg`,
    alt: 'Stone and oak kitchen with a stainless-steel French-door refrigerator beside a utility alcove holding a front-load washer and stacked machines',
    width: 1376,
    height: 768
  },
  storeDress: {
    src: `${base}/store-dress.jpg`,
    alt: 'Ivory and olive draped satin midi dress on a dress form beside a travertine plinth in a white studio',
    width: 1200,
    height: 896
  },
  storeBagAndMules: {
    src: `${base}/store-bag-and-mules.jpg`,
    alt: 'Tan pebbled-leather top-handle bag with a brass padlock beside a pair of matching block-heel leather mules on a stone slab',
    width: 1200,
    height: 896,
    focalPoint: '40% 50%'
  },
  storeWig: {
    src: `${base}/store-wig.jpg`,
    alt: 'Long dark-brown body-wave lace wig displayed on a white mannequin head on a stone plinth',
    width: 1200,
    height: 896
  },
  storeRefrigerator: {
    src: `${base}/store-refrigerator.jpg`,
    alt: 'Stainless-steel French-door refrigerator with an external water dispenser against a pale stone wall',
    width: 1200,
    height: 896
  },
  storeWashingMachine: {
    src: `${base}/store-washing-machine.jpg`,
    alt: 'Graphite front-loading washing machine with a dial and digital display in a concrete photography studio',
    width: 1200,
    height: 896
  },
  storeIceChest: {
    src: `${base}/store-ice-chest.jpg`,
    alt: 'Sand-coloured hard-shell ice chest with stainless-steel latches and side handles on a rough stone block',
    width: 1200,
    height: 896
  },
  hotelExteriorEvening: {
    src: `${base}/hotel-exterior-evening.jpg`,
    alt: 'Limestone hotel facade at dusk with warmly lit lounges, terrace seating and a long reflecting pool',
    width: 1376,
    height: 768
  },
  hotelRoom: {
    src: `${base}/hotel-room.jpg`,
    alt: 'Calm bedroom with white linen bedding, an oak-panelled feature wall, brass bedside lamps and sheer curtains',
    width: 1200,
    height: 896
  },
  apartmentLivingSkyline: {
    src: `${base}/apartment-living-skyline.jpg`,
    alt: 'High-floor open-plan living and dining room with floor-to-ceiling windows overlooking a city skyline',
    width: 1376,
    height: 768
  },
  apartmentLoft: {
    src: `${base}/apartment-loft.jpg`,
    alt: 'Open-plan loft with walnut kitchen cabinetry, a stone island with stools, a linen sofa and tall steel-framed windows',
    width: 1200,
    height: 896
  }
} satisfies Record<string, SiteImage>;

export type ImageKey = keyof typeof IMAGES;
