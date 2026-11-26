import { IMAGES } from '@/lib/demo/images';
import type { ApartmentArrangement, DemoApartment, DemoHotel } from '@/lib/types';

/**
 * DEMONSTRATION DATA — Hotels and Apartments.
 *
 * Illustrative listings adapted from the AI Studio prototype. Names no longer carry URJ or
 * RoseJay branding, locations are generic samples, and every rate, availability count, deposit and
 * minimum-stay policy has been removed: hotel/apartment ownership, pricing and rental terms are
 * unconfirmed (docs/ASSUMPTIONS.md). Replace with GET /api/hotels and GET /api/apartments later.
 */

export const DEMO_HOTELS: DemoHotel[] = [
  {
    slug: 'courtyard-hotel',
    name: 'The Courtyard Hotel',
    locationLabel: 'Sample coastal district',
    summary:
      'Limestone architecture around a reflecting pool, with terrace lounges and calm, tailored rooms.',
    description:
      'Illustrates how a boutique hotel will be presented: architectural photography, clear room tiers and request-based stays.',
    // First image is the listing lead: it must be landscape and match the summary copy.
    images: [IMAGES.hotelExteriorEvening, IMAGES.hotelBedroomSoftLight, IMAGES.hotelPoolCorfu, IMAGES.hotelExteriorPalm],
    highlights: ['Courtyard terrace & lounge', 'Reflecting-pool garden', 'Dedicated workspace', 'Arrival requests by note'],
    checkInTime: '15:00',
    checkOutTime: '11:00',
    rooms: [
      {
        name: 'Oak King Room',
        bedConfiguration: '1 king bed',
        sizeSqm: 32,
        maxGuests: 2,
        amenities: ['Rain shower', 'Work desk', 'Courtyard view']
      },
      {
        name: 'Terrace Corner Suite',
        bedConfiguration: '1 king bed + lounge sofa',
        sizeSqm: 54,
        maxGuests: 3,
        amenities: ['Private balcony', 'Soaking tub', 'Lounge seating']
      }
    ]
  },
  {
    slug: 'harborview-hotel',
    name: 'Harborview Sanctuary',
    locationLabel: 'Sample business quarter',
    summary: 'Quiet, sound-insulated rooms and private meeting salons for business and leisure travellers.',
    description:
      'Illustrates an executive-stay listing with clear room sizes, bed configurations and guest limits.',
    images: [IMAGES.hotelRoom, IMAGES.hotelReceptionBell, IMAGES.hotelPoolCorfu],
    highlights: ['Sound-insulated rooms', 'Private meeting rooms', 'Garment care on request', 'Quiet evening lounge'],
    checkInTime: '14:00',
    checkOutTime: '12:00',
    rooms: [
      {
        name: 'Studio Queen',
        bedConfiguration: '1 queen bed',
        sizeSqm: 28,
        maxGuests: 2,
        amenities: ['Walk-in shower', 'Blackout drapes']
      },
      {
        name: 'Executive Suite',
        bedConfiguration: '1 super king bed',
        sizeSqm: 68,
        maxGuests: 4,
        amenities: ['Dining area', 'Guest powder room', 'Workspace']
      }
    ]
  }
];

export const ARRANGEMENTS: { id: ApartmentArrangement; label: string }[] = [
  { id: 'short-term', label: 'Short-Term Stay' },
  { id: 'monthly-serviced', label: 'Monthly Serviced' },
  { id: 'long-term', label: 'Long-Term Lease' },
  { id: 'flexible', label: 'Flexible Arrangement' }
];

export const DEMO_APARTMENTS: DemoApartment[] = [
  {
    slug: 'skyline-residence',
    name: 'Skyline Residence',
    locationLabel: 'Sample central district',
    arrangement: 'flexible',
    furnishing: 'Fully furnished',
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 138,
    utilitiesIncluded: true,
    summary: 'High-floor two-bedroom residence with full-height glazing, a stone kitchen island and dining for six.',
    images: [IMAGES.apartmentLivingSkyline, IMAGES.editorialApplianceShowroom],
    amenities: ['Full kitchen', 'In-unit washing machine', 'Dining for six', 'Private balcony']
  },
  {
    slug: 'oak-loft',
    name: 'Atelier Oak Loft',
    locationLabel: 'Sample cultural quarter',
    arrangement: 'monthly-serviced',
    furnishing: 'Fully furnished',
    bedrooms: 1,
    bathrooms: 1.5,
    areaSqm: 86,
    utilitiesIncluded: true,
    summary: 'Walnut cabinetry, a honed stone island and tall steel windows around a calm study corner.',
    images: [IMAGES.apartmentLoft, IMAGES.apartmentLivingSkyline],
    amenities: ['Stone island kitchen', 'Study desk', 'Housekeeping option', 'Steel-framed glazing']
  },
  {
    slug: 'garden-residence',
    name: 'Garden Courtyard Residence',
    locationLabel: 'Sample residential avenue',
    arrangement: 'long-term',
    furnishing: 'Semi-furnished',
    bedrooms: 3,
    bathrooms: 3,
    areaSqm: 185,
    utilitiesIncluded: false,
    summary: 'Family-scale three-bedroom residence with courtyard access and a dedicated utility room.',
    images: [IMAGES.apartmentModernKitchen, IMAGES.apartmentLivingRoom],
    amenities: ['Courtyard access', 'Utility & laundry room', 'Covered parking', 'Furnishing options']
  }
];
