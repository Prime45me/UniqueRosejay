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

/** Removable chips for every active filter, plus "Clear all". Renders nothing when unfiltered. */
export function ActiveFilters({ state, facets }: { state: CatalogueState; facets: OptionDefinition[] }) {
  const chips = [
    state.q ? { label: `“${state.q}”`, href: storeHref({ ...state, q: undefined, page: 1 }) } : null,
    state.availability === 'in-stock' ? { label: 'In stock only', href: storeHref({ ...state, availability: 'all', page: 1 }) } : null,
    state.minPrice ? { label: `From ${state.minPrice}`, href: storeHref({ ...state, minPrice: undefined, page: 1 }) } : null,
    state.maxPrice ? { label: `Up to ${state.maxPrice}`, href: storeHref({ ...state, maxPrice: undefined, page: 1 }) } : null,
    ...Object.entries(state.opt).map(([key, value]) => {
      const rest = { ...state.opt };
      delete rest[key];
      const name = facets.find((facet) => facet.key === key)?.label ?? key;
      return { label: `${name}: ${value}`, href: storeHref({ ...state, opt: rest, page: 1 }) };
    })
  ].filter((chip): chip is { label: string; href: string } => chip !== null);

  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Link
          key={chip.label}
          href={chip.href}
          scroll={false}
          aria-label={`Remove filter ${chip.label}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface-elevated py-1 pl-3 pr-2 text-xs text-ink transition-colors hover:border-ink"
        >
          {chip.label}
          <Icon name="close" className="h-3 w-3 text-ink-muted" />
        </Link>
      ))}
      <Link href={storeHref({ category: state.category, sort: state.sort })} scroll={false} className="ml-1 text-xs font-semibold text-accent hover:text-accent-hover">
        Clear all
      </Link>
    </div>
  );
}

interface NavGroup {
  slug: string;
  name: string;
  categories: { slug: string; name: string }[];
}

/**
 * Two-level category navigation: groups as understated underline tabs; the selected group's
 * categories as a quiet secondary row. Replaces the long, horizontally scrolling pill strip.
 */
export function CategoryNav({ groups, active }: { groups: NavGroup[]; active?: string }) {
  const activeGroup = groups.find((group) => group.slug === active || group.categories.some((category) => category.slug === active));
  const tab = (selected: boolean) =>
    `relative whitespace-nowrap py-3 text-sm transition-colors after:absolute after:inset-x-0 after:-bottom-px after:h-px after:transition-colors ${
      selected ? 'font-medium text-ink after:bg-ink' : 'text-ink-muted hover:text-ink after:bg-transparent hover:after:bg-hairline'
    }`;
  const sub = (selected: boolean) =>
    `whitespace-nowrap rounded-full px-3 py-1.5 text-xs transition-colors ${selected ? 'bg-ink text-canvas' : 'text-ink-muted hover:bg-surface hover:text-ink'}`;

  return (
    <nav aria-label="Store categories">
      <ul className="-mx-4 flex gap-7 overflow-x-auto border-b border-hairline px-4 sm:mx-0 sm:px-0">
        <li>
          <Link href="/store" scroll={false} aria-current={!active ? 'page' : undefined} className={tab(!active)}>
            All
          </Link>
        </li>
        {groups.map((group) => (
          <li key={group.slug}>
            <Link href={storeHref({ category: group.slug })} scroll={false} aria-current={active === group.slug ? 'page' : undefined} className={tab(activeGroup?.slug === group.slug)}>
              {group.name}
            </Link>
          </li>
        ))}
      </ul>
      {activeGroup ? (
        <ul className="-mx-4 mt-3 flex gap-1 overflow-x-auto px-4 animate-[riseIn_220ms_ease-out] sm:mx-0 sm:px-0">
          <li>
            <Link href={storeHref({ category: activeGroup.slug })} scroll={false} aria-current={active === activeGroup.slug ? 'page' : undefined} className={sub(active === activeGroup.slug)}>
              All {activeGroup.name}
            </Link>
          </li>
          {activeGroup.categories.map((category) => (
            <li key={category.slug}>
              <Link href={storeHref({ category: category.slug })} scroll={false} aria-current={active === category.slug ? 'page' : undefined} className={sub(active === category.slug)}>
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </nav>
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
