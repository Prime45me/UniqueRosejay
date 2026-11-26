import { z } from 'zod';

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Invalid slug').max(120);
const decimal = z.string().regex(/^\d{1,13}(\.\d{1,4})?$/, 'Must be a decimal amount');

export const SORTS = ['featured', 'price-asc', 'price-desc', 'newest', 'name'] as const;

export const productListQuery = z.object({
  category: slug.optional(),
  q: z.string().trim().max(100).optional(),
  sort: z.enum(SORTS).default('featured'),
  availability: z.enum(['all', 'in-stock']).default('all'),
  minPrice: decimal.optional(),
  maxPrice: decimal.optional(),
  /** Option filters, e.g. ?opt[size]=M&opt[colour]=Cognac */
  opt: z.record(z.string().regex(/^[a-z][a-z0-9_]{0,30}$/), z.string().max(60)).optional(),
  page: z.coerce.number().int().min(1).max(500).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(12)
});
export type ProductListQuery = z.infer<typeof productListQuery>;

export const slugParams = z.object({ slug });

/** Per-line quantity cap — a technical safeguard, not a commercial policy. */
export const MAX_LINE_QUANTITY = 10;

export const addCartItemBody = z.object({
  variantId: z.uuid(),
  quantity: z.number().int().min(1).max(MAX_LINE_QUANTITY).default(1)
});

export const cartItemParams = z.object({ itemId: z.uuid() });

export const updateCartItemBody = z
  .object({
    quantity: z.number().int().min(1).max(MAX_LINE_QUANTITY).optional(),
    variantId: z.uuid().optional()
  })
  .refine((value) => value.quantity !== undefined || value.variantId !== undefined, {
    message: 'Provide quantity and/or variantId'
  });

const text = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : undefined));

export const addressSchema = z.object({
  line1: text(200),
  line2: optionalText(200),
  locality: text(120),
  administrativeArea: optionalText(120),
  postalCode: optionalText(32),
  countryCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, 'Use a two-letter country code')
});

export const createOrderBody = z.object({
  idempotencyKey: z.uuid(),
  contact: z.object({
    name: text(160),
    email: z.email().max(254),
    phone: z
      .string()
      .trim()
      .min(5)
      .max(40)
      .regex(/^[+()\d\s.-]+$/, 'Use digits, spaces and + ( ) - only')
  }),
  fulfilmentMethod: z.string().regex(/^[a-z0-9_]+$/).max(40),
  address: addressSchema.optional(),
  notes: optionalText(2000)
});
export type CreateOrderBody = z.infer<typeof createOrderBody>;

export const orderParams = z.object({ reference: z.string().regex(/^URJ-[A-Z0-9]{8}$/) });
