import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import type { OptionDefinition } from '@/lib/store/types';

export interface CatalogueState {
  category?: string;
  q?: string;
  sort: string;
  availability: string;
  minPrice?: string;
  maxPrice?: string;
  opt: Record<string, string>;
  page: number;
}

/** Builds a /store URL from catalogue state; filters reset to page 1 unless a page is given. */
export function storeHref(state: Partial<CatalogueState>) {
  const params = new URLSearchParams();
  if (state.category) params.set('category', state.category);
  if (state.q) params.set('q', state.q);
  if (state.sort && state.sort !== 'featured') params.set('sort', state.sort);
  if (state.availability === 'in-stock') params.set('availability', 'in-stock');
  if (state.minPrice) params.set('minPrice', state.minPrice);
  if (state.maxPrice) params.set('maxPrice', state.maxPrice);
  for (const [key, value] of Object.entries(state.opt ?? {})) if (value) params.set(`opt[${key}]`, value);
  if (state.page && state.page > 1) params.set('page', String(state.page));
  const query = params.toString();
  return query ? `/store?${query}` : '/store';
}

const SORT_LABELS: Record<string, string> = {
  featured: 'Featured',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  newest: 'Newest',
  name: 'Name'
};

const field = 'w-full rounded-sm border border-hairline bg-surface-elevated px-3 py-2 text-sm text-ink';
const label = 'mb-1 block text-caption font-semibold uppercase tracking-wider text-ink-muted';

/**
 * Search, sort and filter controls as a plain GET form: works without JavaScript, produces
 * shareable URLs and survives Back/Forward. Option filters are category-aware (from API facets).
 */
export function CatalogueControls({ state, facets, currency }: { state: CatalogueState; facets: OptionDefinition[]; currency?: string }) {
  const activeFilters = [
    state.q ? { label: `“${state.q}”`, href: storeHref({ ...state, q: undefined, page: 1 }) } : null,
    state.availability === 'in-stock' ? { label: 'In stock only', href: storeHref({ ...state, availability: 'all', page: 1 }) } : null,
    state.minPrice ? { label: `Min ${state.minPrice}`, href: storeHref({ ...state, minPrice: undefined, page: 1 }) } : null,
    state.maxPrice ? { label: `Max ${state.maxPrice}`, href: storeHref({ ...state, maxPrice: undefined, page: 1 }) } : null,
    ...Object.entries(state.opt).map(([key, value]) => {
      const rest = { ...state.opt };
      delete rest[key];
      const name = facets.find((facet) => facet.key === key)?.label ?? key;
      return { label: `${name}: ${value}`, href: storeHref({ ...state, opt: rest, page: 1 }) };
    })
  ].filter((value): value is { label: string; href: string } => value !== null);

  return (
    <form action="/store" method="get" role="search" aria-label="Search and filter products" className="rounded-sm border border-hairline bg-surface p-4 sm:p-5">
      {state.category ? <input type="hidden" name="category" value={state.category} /> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
        <div className="sm:col-span-2 lg:col-span-4">
          <label htmlFor="store-q" className={label}>
            Search
          </label>
          <div className="relative">
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
            <input id="store-q" name="q" type="search" defaultValue={state.q} maxLength={100} placeholder="Dresses, wigs, refrigerators…" className={`${field} pl-9`} />
          </div>
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="store-sort" className={label}>
            Sort
          </label>
          <select id="store-sort" name="sort" defaultValue={state.sort} className={field}>
            {Object.entries(SORT_LABELS).map(([value, text]) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="lg:col-span-3">
          <legend className={label}>Price{currency ? ` (${currency})` : ''}</legend>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="store-min">
              Minimum price
            </label>
            <input id="store-min" name="minPrice" inputMode="decimal" pattern="\d+(\.\d{1,2})?" defaultValue={state.minPrice} placeholder="Min" className={field} />
            <span aria-hidden className="text-ink-subtle">
              –
            </span>
            <label className="sr-only" htmlFor="store-max">
              Maximum price
            </label>
            <input id="store-max" name="maxPrice" inputMode="decimal" pattern="\d+(\.\d{1,2})?" defaultValue={state.maxPrice} placeholder="Max" className={field} />
          </div>
        </fieldset>

        <div className="flex items-center gap-2 lg:col-span-3 lg:justify-end">
          <label className="inline-flex min-h-[40px] items-center gap-2 text-sm text-ink">
            <input type="checkbox" name="availability" value="in-stock" defaultChecked={state.availability === 'in-stock'} className="h-4 w-4 accent-[#141413]" />
            In stock only
          </label>
          <button type="submit" className="ml-auto inline-flex min-h-[40px] items-center rounded-sm bg-ink px-5 text-xs font-semibold tracking-wide text-canvas hover:bg-ink-hover lg:ml-3">
            Apply
          </button>
        </div>
      </div>

      {facets.length ? (
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-hairline pt-4 sm:grid-cols-3 lg:grid-cols-6">
          {facets.map((facet) => (
            <div key={facet.key}>
              <label htmlFor={`store-opt-${facet.key}`} className={label}>
                {facet.label}
              </label>
              <select id={`store-opt-${facet.key}`} name={`opt[${facet.key}]`} defaultValue={state.opt[facet.key] ?? ''} className={field}>
                <option value="">Any</option>
                {facet.values.map((value) => (
                  <option key={value.value} value={value.value}>
                    {value.value}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      ) : null}

      {activeFilters.length ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-hairline pt-4">
          <span className="text-caption text-ink-subtle">Active:</span>
          {activeFilters.map((filter) => (
            <Link
              key={filter.label}
              href={filter.href}
              scroll={false}
              className="inline-flex items-center gap-1.5 rounded-sm border border-hairline bg-surface-elevated px-2.5 py-1 text-xs text-ink hover:border-ink"
              aria-label={`Remove filter ${filter.label}`}
            >
              {filter.label}
              <Icon name="close" className="h-3 w-3" />
            </Link>
          ))}
          <Link href={storeHref({ category: state.category })} scroll={false} className="ml-1 text-xs font-semibold text-accent hover:text-accent-hover">
            Clear all
          </Link>
        </div>
      ) : null}
    </form>
  );
}

export function Pagination({ state, totalPages }: { state: CatalogueState; totalPages: number }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const link = 'inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-sm border px-3 text-xs font-medium';
  return (
    <nav aria-label="Product pages" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {state.page > 1 ? (
        <Link href={storeHref({ ...state, page: state.page - 1 })} className={`${link} border-hairline bg-surface-elevated text-ink hover:border-ink`}>
          Previous
        </Link>
      ) : null}
      {pages.map((page) => (
        <Link
          key={page}
          href={storeHref({ ...state, page })}
          aria-current={page === state.page ? 'page' : undefined}
          className={`${link} ${page === state.page ? 'border-ink bg-ink text-canvas' : 'border-hairline bg-surface-elevated text-ink hover:border-ink'}`}
        >
          {page}
        </Link>
      ))}
      {state.page < totalPages ? (
        <Link href={storeHref({ ...state, page: state.page + 1 })} className={`${link} border-hairline bg-surface-elevated text-ink hover:border-ink`}>
          Next
        </Link>
      ) : null}
    </nav>
  );
}
