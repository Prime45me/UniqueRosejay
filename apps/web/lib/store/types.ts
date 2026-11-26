/** API contracts for /api/store (see apps/server/src/store). Money is a decimal string + ISO 4217 code. */

export interface Money {
  amount: string;
  currency: string;
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type PresentationMode = 'fashion' | 'beauty' | 'appliance' | 'general';

export interface ApiImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  focalPoint?: string | null;
}

export interface OptionDefinition {
  key: string;
  label: string;
  display: 'pill' | 'swatch';
  values: { value: string; hex?: string }[];
}

export interface CategorySummary {
  slug: string;
  name: string;
  description: string;
  presentationMode: PresentationMode;
  image: ApiImage | null;
  productCount: number;
}

export interface CategoryGroup {
  slug: string;
  name: string;
  description: string;
  presentationMode: PresentationMode;
  categories: CategorySummary[];
}

export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  editorialNote: string | null;
  highlightSpec: string | null;
  category: { slug: string; name: string; presentationMode: PresentationMode };
  group: { slug: string; name: string } | null;
  priceFrom: Money;
  priceTo: Money;
  stockStatus: StockStatus;
  swatches: { value: string; hex?: string }[];
  optionSummary: { label: string; values: string[] }[];
  image: ApiImage | null;
  isFeatured: boolean;
  isDemo: boolean;
}

export interface ProductListMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  facets: { options: OptionDefinition[]; currencies: string[] };
}

export interface ProductVariant {
  id: string;
  sku: string;
  optionValues: Record<string, string>;
  price: Money;
  stockStatus: StockStatus;
  maxQuantity: number;
}

export interface ProductDetail extends ProductSummary {
  description: string;
  specifications: { label: string; value: string }[];
  careNotes: string | null;
  options: OptionDefinition[];
  images: ApiImage[];
  variants: ProductVariant[];
  related: ProductSummary[];
}

export type CartIssue = 'unavailable' | 'out_of_stock' | 'insufficient_stock' | 'currency_mismatch';

export interface CartItem {
  id: string;
  quantity: number;
  maxQuantity: number;
  product: { id: string; slug: string; name: string; presentationMode: PresentationMode; isDemo: boolean };
  variant: { id: string; sku: string; optionValues: Record<string, string>; stockStatus: StockStatus };
  options: OptionDefinition[];
  variantChoices: { id: string; optionValues: Record<string, string>; stockStatus: StockStatus }[];
  unitPrice: Money;
  lineTotal: Money;
  image: ApiImage | null;
  issues: CartIssue[];
}

export interface Cart {
  items: CartItem[];
  itemCount: number;
  currency: string | null;
  subtotal: Money | null;
  canCheckout: boolean;
  issues: CartIssue[];
}

export interface FulfilmentMethod {
  code: string;
  label: string;
  description: string;
  requiresAddress: boolean;
}

export interface OrderDetail {
  reference: string;
  status: 'PENDING_REVIEW' | 'CONFIRMED' | 'FULFILLED' | 'CANCELLED';
  paymentStatus: 'NOT_REQUESTED' | 'AWAITING_PAYMENT' | 'PAID' | 'REFUNDED';
  createdAt: string;
  currency: string;
  itemsSubtotal: Money;
  fulfilmentCharge: Money | null;
  taxAmount: Money | null;
  fulfilment: {
    method: string;
    label: string;
    address: {
      line1: string;
      line2: string | null;
      locality: string;
      administrativeArea: string | null;
      postalCode: string | null;
      countryCode: string;
    } | null;
  };
  contact: { name: string; email: string; phone: string };
  notes: string | null;
  containsDemoItems: boolean;
  items: {
    productName: string;
    productSlug: string;
    sku: string;
    optionValues: Record<string, string>;
    options: OptionDefinition[];
    unitPrice: Money;
    quantity: number;
    lineTotal: Money;
    image: ApiImage | null;
  }[];
}

export interface ApiErrorBody {
  error: { code: string; message: string; details?: unknown };
}
