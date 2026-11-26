-- 0001_store.sql — Store catalogue, carts and order requests (Phase 2B).
-- Forward-only. Money is NUMERIC(19,4) with an explicit ISO 4217 currency; never floating point.

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------------

-- Categories form a tree: top-level rows are groups (e.g. "Fashion & Beauty"); children are
-- shoppable categories. New categories are rows, not code changes.
CREATE TABLE product_categories (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id         uuid REFERENCES product_categories (id) ON DELETE RESTRICT,
  slug              text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name              text NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  description       text NOT NULL DEFAULT '',
  -- Controls the storefront presentation: lookbook (fashion/beauty) or showroom (appliance).
  presentation_mode text NOT NULL DEFAULT 'general'
                    CHECK (presentation_mode IN ('fashion', 'beauty', 'appliance', 'general')),
  image_src         text,
  image_alt         text,
  sort_order        integer NOT NULL DEFAULT 0,
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX product_categories_parent_idx ON product_categories (parent_id, sort_order);
CREATE TRIGGER product_categories_updated_at BEFORE UPDATE ON product_categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE products (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id        uuid NOT NULL REFERENCES product_categories (id) ON DELETE RESTRICT,
  slug               text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name               text NOT NULL CHECK (length(name) BETWEEN 1 AND 200),
  short_description  text NOT NULL DEFAULT '',
  description        text NOT NULL DEFAULT '',
  editorial_note     text,
  highlight_spec     text,
  -- Category-aware technical specifications: [{ "label": "Capacity", "value": "540 L" }, ...]
  specifications     jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(specifications) = 'array'),
  -- Option definitions shown in the selector: [{ "key": "size", "label": "Size", "display": "pill",
  --   "values": [{ "value": "M" }, { "value": "Olive", "hex": "#4B5334" }] }]
  options            jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(options) = 'array'),
  care_notes         text,
  currency           char(3) NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  base_price         numeric(19, 4) NOT NULL CHECK (base_price >= 0),
  is_published       boolean NOT NULL DEFAULT false,
  is_featured        boolean NOT NULL DEFAULT false,
  -- Demonstration catalogue rows: never presented as verified URJ inventory.
  is_demo            boolean NOT NULL DEFAULT false,
  sort_order         integer NOT NULL DEFAULT 0,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX products_listing_idx ON products (category_id, is_published, sort_order);
CREATE INDEX products_featured_idx ON products (is_published, is_featured, sort_order);
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Every purchasable combination is a variant. Products without options have one default variant.
CREATE TABLE product_variants (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      uuid NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  sku             text NOT NULL UNIQUE CHECK (length(sku) BETWEEN 1 AND 64),
  -- Selected option values keyed by option key: { "size": "M", "colour": "Ivory / Olive" }
  option_values   jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(option_values) = 'object'),
  -- NULL means "use the product's base price".
  price_override  numeric(19, 4) CHECK (price_override IS NULL OR price_override >= 0),
  stock_quantity  integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_active       boolean NOT NULL DEFAULT true,
  sort_order      integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, option_values)
);
CREATE INDEX product_variants_product_idx ON product_variants (product_id, sort_order);
CREATE TRIGGER product_variants_updated_at BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE product_images (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   uuid NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  src          text NOT NULL,
  alt          text NOT NULL CHECK (length(alt) > 0),
  width        integer NOT NULL CHECK (width > 0),
  height       integer NOT NULL CHECK (height > 0),
  focal_point  text,
  sort_order   integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX product_images_product_idx ON product_images (product_id, sort_order);

-- ---------------------------------------------------------------------------
-- Carts (anonymous; identified by an opaque cookie token whose SHA-256 hash is stored)
-- ---------------------------------------------------------------------------

CREATE TABLE carts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash  text NOT NULL UNIQUE,
  expires_at  timestamptz NOT NULL DEFAULT now() + interval '30 days',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX carts_expires_idx ON carts (expires_at);
CREATE TRIGGER carts_updated_at BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE cart_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id     uuid NOT NULL REFERENCES carts (id) ON DELETE CASCADE,
  variant_id  uuid NOT NULL REFERENCES product_variants (id) ON DELETE CASCADE,
  quantity    integer NOT NULL CHECK (quantity BETWEEN 1 AND 99),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cart_id, variant_id)
);
CREATE TRIGGER cart_items_updated_at BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Fulfilment methods — configuration, not policy. Charges are not modelled until approved.
-- ---------------------------------------------------------------------------

CREATE TABLE fulfilment_methods (
  code              text PRIMARY KEY CHECK (code ~ '^[a-z0-9_]+$'),
  label             text NOT NULL,
  description       text NOT NULL DEFAULT '',
  requires_address  boolean NOT NULL DEFAULT false,
  is_enabled        boolean NOT NULL DEFAULT false,
  sort_order        integer NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------------
-- Orders — submitted as requests. No payment is taken in this phase.
-- ---------------------------------------------------------------------------

CREATE TABLE orders (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference            text NOT NULL UNIQUE,
  -- Hash of the token that lets a guest view their own order. Accounts arrive in Phase 2E.
  access_token_hash    text NOT NULL,
  idempotency_key      text NOT NULL UNIQUE,
  customer_id          uuid,
  status               text NOT NULL DEFAULT 'PENDING_REVIEW'
                       CHECK (status IN ('PENDING_REVIEW', 'CONFIRMED', 'FULFILLED', 'CANCELLED')),
  payment_status       text NOT NULL DEFAULT 'NOT_REQUESTED'
                       CHECK (payment_status IN ('NOT_REQUESTED', 'AWAITING_PAYMENT', 'PAID', 'REFUNDED')),
  currency             char(3) NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  items_subtotal       numeric(19, 4) NOT NULL CHECK (items_subtotal >= 0),
  -- NULL = not yet determined (charges and taxes are unresolved business decisions).
  fulfilment_charge    numeric(19, 4) CHECK (fulfilment_charge IS NULL OR fulfilment_charge >= 0),
  tax_amount           numeric(19, 4) CHECK (tax_amount IS NULL OR tax_amount >= 0),
  contact_name         text NOT NULL CHECK (length(contact_name) BETWEEN 1 AND 160),
  contact_email        text NOT NULL CHECK (length(contact_email) BETWEEN 3 AND 254),
  contact_phone        text NOT NULL CHECK (length(contact_phone) BETWEEN 5 AND 40),
  fulfilment_method    text NOT NULL REFERENCES fulfilment_methods (code),
  address_line1        text,
  address_line2        text,
  locality             text,
  administrative_area  text,
  postal_code          text,
  country_code         char(2) CHECK (country_code IS NULL OR country_code ~ '^[A-Z]{2}$'),
  customer_notes       text CHECK (customer_notes IS NULL OR length(customer_notes) <= 2000),
  contains_demo_items  boolean NOT NULL DEFAULT false,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX orders_status_idx ON orders (status, created_at DESC);
CREATE INDEX orders_email_idx ON orders (lower(contact_email));
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Line items snapshot name, SKU, options and price at submission time.
CREATE TABLE order_items (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       uuid NOT NULL REFERENCES orders (id) ON DELETE RESTRICT,
  product_id     uuid NOT NULL REFERENCES products (id) ON DELETE RESTRICT,
  variant_id     uuid NOT NULL REFERENCES product_variants (id) ON DELETE RESTRICT,
  sku            text NOT NULL,
  product_name   text NOT NULL,
  option_values  jsonb NOT NULL DEFAULT '{}'::jsonb,
  unit_price     numeric(19, 4) NOT NULL CHECK (unit_price >= 0),
  quantity       integer NOT NULL CHECK (quantity BETWEEN 1 AND 99),
  line_total     numeric(19, 4) NOT NULL CHECK (line_total = unit_price * quantity),
  currency       char(3) NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX order_items_order_idx ON order_items (order_id);

-- Audit trail of status changes.
CREATE TABLE order_status_history (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id    uuid NOT NULL REFERENCES orders (id) ON DELETE RESTRICT,
  status      text NOT NULL,
  note        text,
  changed_by  text NOT NULL DEFAULT 'system',
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX order_status_history_order_idx ON order_status_history (order_id, created_at);
