import { pool } from '../db/client.js';
import { ApiError } from '../lib/http.js';
import { MAX_LINE_QUANTITY, type ProductListQuery } from './schemas.js';

/*
 * Catalogue reads. Only published products in active categories are visible. Prices are
 * returned as decimal strings with their currency; availability is a status, not a raw count.
 */

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
const LOW_STOCK_THRESHOLD = 3;

export function stockStatus(quantity: number): StockStatus {
  if (quantity <= 0) return 'out_of_stock';
  return quantity <= LOW_STOCK_THRESHOLD ? 'low_stock' : 'in_stock';
}

export const money = (amount: string, currency: string) => ({ amount, currency: currency.trim() });

interface OptionDefinition {
  key: string;
  label: string;
  display: 'pill' | 'swatch';
  values: { value: string; hex?: string }[];
}

// Published product + effective price range + stock flag + first image.
const BASE = `
  SELECT p.id, p.slug, p.name, p.short_description, p.editorial_note, p.highlight_spec, p.options,
         p.currency, p.is_featured, p.is_demo, p.sort_order, p.created_at,
         c.slug AS category_slug, c.name AS category_name, c.presentation_mode,
         g.slug AS group_slug, g.name AS group_name,
         agg.price_from, agg.price_to, agg.total_stock,
         img.image
    FROM products p
    JOIN product_categories c ON c.id = p.category_id AND c.is_active
    LEFT JOIN product_categories g ON g.id = c.parent_id
    JOIN LATERAL (
      SELECT min(coalesce(v.price_override, p.base_price)) AS price_from,
             max(coalesce(v.price_override, p.base_price)) AS price_to,
             coalesce(sum(v.stock_quantity), 0)::int       AS total_stock
        FROM product_variants v
       WHERE v.product_id = p.id AND v.is_active
    ) agg ON agg.price_from IS NOT NULL
    LEFT JOIN LATERAL (
      SELECT json_build_object('src', i.src, 'alt', i.alt, 'width', i.width, 'height', i.height, 'focalPoint', i.focal_point) AS image
        FROM product_images i WHERE i.product_id = p.id ORDER BY i.sort_order LIMIT 1
    ) img ON true
   WHERE p.is_published`;

type BaseRow = {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  editorial_note: string | null;
  highlight_spec: string | null;
  options: OptionDefinition[];
  currency: string;
  is_featured: boolean;
  is_demo: boolean;
  category_slug: string;
  category_name: string;
  presentation_mode: string;
  group_slug: string | null;
  group_name: string | null;
  price_from: string;
  price_to: string;
  total_stock: number;
  image: { src: string; alt: string; width: number; height: number; focalPoint: string | null } | null;
};

function toSummary(row: BaseRow) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description,
    editorialNote: row.editorial_note,
    highlightSpec: row.highlight_spec,
    category: { slug: row.category_slug, name: row.category_name, presentationMode: row.presentation_mode },
    group: row.group_slug ? { slug: row.group_slug, name: row.group_name } : null,
    priceFrom: money(row.price_from, row.currency),
    priceTo: money(row.price_to, row.currency),
    stockStatus: stockStatus(row.total_stock),
    swatches: row.options.find((option) => option.display === 'swatch')?.values ?? [],
    optionSummary: row.options
      .filter((option) => option.display === 'pill')
      .map((option) => ({ label: option.label, values: option.values.map((value) => value.value) })),
    image: row.image,
    isFeatured: row.is_featured,
    isDemo: row.is_demo
  };
}

const escapeLike = (value: string) => value.replace(/[\\%_]/g, (char) => `\\${char}`);

const ORDER_BY: Record<ProductListQuery['sort'], string> = {
  featured: 'is_featured DESC, sort_order, name',
  'price-asc': 'price_from ASC, name',
  'price-desc': 'price_from DESC, name',
  newest: 'created_at DESC, name',
  name: 'name ASC'
};

export async function listCategories() {
  const { rows } = await pool.query(`
    SELECT c.slug, c.name, c.description, c.presentation_mode, c.image_src, c.image_alt, c.sort_order,
           g.slug AS group_slug,
           (SELECT count(*)::int FROM products p WHERE p.category_id = c.id AND p.is_published) AS product_count
      FROM product_categories c
      LEFT JOIN product_categories g ON g.id = c.parent_id
     WHERE c.is_active
     ORDER BY c.sort_order, c.name`);

  const groups = rows.filter((row) => !row.group_slug);
  return groups.map((group) => ({
    slug: group.slug,
    name: group.name,
    description: group.description,
    presentationMode: group.presentation_mode,
    categories: rows
      .filter((row) => row.group_slug === group.slug)
      .map((row) => ({
        slug: row.slug,
        name: row.name,
        description: row.description,
        presentationMode: row.presentation_mode,
        image: row.image_src ? { src: row.image_src, alt: row.image_alt } : null,
        productCount: row.product_count
      }))
  }));
}

export async function listProducts(query: ProductListQuery) {
  const where: string[] = [];
  const params: unknown[] = [];
  const add = (value: unknown) => {
    params.push(value);
    return `$${params.length}`;
  };

  if (query.category) {
    const p = add(query.category);
    where.push(`(category_slug = ${p} OR group_slug = ${p})`);
  }
  const scopeWhere = [...where];
  const scopeParams = [...params];

  if (query.q) {
    const p = add(`%${escapeLike(query.q)}%`);
    where.push(`(name ILIKE ${p} OR short_description ILIKE ${p} OR category_name ILIKE ${p} OR coalesce(highlight_spec, '') ILIKE ${p})`);
  }
  if (query.availability === 'in-stock') where.push('total_stock > 0');
  if (query.minPrice) where.push(`price_to >= ${add(query.minPrice)}::numeric`);
  if (query.maxPrice) where.push(`price_from <= ${add(query.maxPrice)}::numeric`);
  if (query.opt && Object.keys(query.opt).length > 0) {
    // A product matches when at least one active variant has all the selected option values.
    where.push(
      `EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = b.id AND v.is_active AND v.option_values @> ${add(JSON.stringify(query.opt))}::jsonb)`
    );
  }

  const filter = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const limit = add(query.pageSize);
  const offset = add((query.page - 1) * query.pageSize);

  const { rows } = await pool.query<BaseRow & { total: number }>(
    `SELECT b.*, count(*) OVER ()::int AS total FROM (${BASE}) b ${filter}
      ORDER BY ${ORDER_BY[query.sort]} LIMIT ${limit} OFFSET ${offset}`,
    params
  );

  // Facets: option values available within the category scope (ignoring the other filters).
  const scope = await pool.query<{ options: OptionDefinition[]; currency: string; price_from: string; price_to: string }>(
    `SELECT b.options, b.currency, b.price_from, b.price_to FROM (${BASE}) b
      ${scopeWhere.length ? `WHERE ${scopeWhere.join(' AND ')}` : ''}`,
    scopeParams
  );
  const facetMap = new Map<string, OptionDefinition>();
  for (const row of scope.rows) {
    for (const option of row.options) {
      const existing = facetMap.get(option.key) ?? { ...option, values: [] };
      for (const value of option.values) {
        if (!existing.values.some((v) => v.value === value.value)) existing.values.push(value);
      }
      facetMap.set(option.key, existing);
    }
  }
  const currencies = [...new Set(scope.rows.map((row) => row.currency.trim()))];

  const total = rows[0]?.total ?? 0;
  return {
    items: rows.map(toSummary),
    meta: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
      facets: {
        options: [...facetMap.values()],
        currencies
      }
    }
  };
}

export async function getProduct(slug: string) {
  const { rows } = await pool.query<BaseRow & { description: string; specifications: unknown; care_notes: string | null }>(
    `SELECT b.*, p.description, p.specifications, p.care_notes
       FROM (${BASE}) b JOIN products p ON p.id = b.id
      WHERE b.slug = $1`,
    [slug]
  );
  const row = rows[0];
  if (!row) throw ApiError.notFound('Product not found');

  const [variants, images, related] = await Promise.all([
    pool.query(
      `SELECT v.id, v.sku, v.option_values, v.stock_quantity, coalesce(v.price_override, p.base_price) AS price, p.currency
         FROM product_variants v JOIN products p ON p.id = v.product_id
        WHERE v.product_id = $1 AND v.is_active ORDER BY v.sort_order`,
      [row.id]
    ),
    pool.query(
      `SELECT src, alt, width, height, focal_point AS "focalPoint" FROM product_images WHERE product_id = $1 ORDER BY sort_order`,
      [row.id]
    ),
    pool.query<BaseRow>(
      `SELECT b.* FROM (${BASE}) b
        WHERE b.id <> $1 AND (b.category_slug = $2 OR b.group_slug = $3)
        ORDER BY (b.category_slug = $2) DESC, b.is_featured DESC, b.sort_order LIMIT 4`,
      [row.id, row.category_slug, row.group_slug]
    )
  ]);

  return {
    ...toSummary(row),
    description: row.description,
    specifications: row.specifications,
    careNotes: row.care_notes,
    options: row.options,
    images: images.rows,
    variants: variants.rows.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      optionValues: variant.option_values as Record<string, string>,
      price: money(variant.price, variant.currency),
      stockStatus: stockStatus(variant.stock_quantity),
      maxQuantity: Math.min(variant.stock_quantity, MAX_LINE_QUANTITY)
    })),
    related: related.rows.map(toSummary)
  };
}

export async function listFulfilmentMethods() {
  const { rows } = await pool.query(
    `SELECT code, label, description, requires_address AS "requiresAddress"
       FROM fulfilment_methods WHERE is_enabled ORDER BY sort_order, label`
  );
  return rows;
}
