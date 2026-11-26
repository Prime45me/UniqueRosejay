'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type { CatalogueState } from '@/components/store/CatalogueControls';
import { buttonClasses } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Icon } from '@/components/ui/Icon';
import { Select } from '@/components/ui/Select';
import type { OptionDefinition } from '@/lib/store/types';

const SORT_LABELS: Record<string, string> = {
  featured: 'Featured',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  newest: 'Newest',
  name: 'Name A–Z'
};

const labelClass = 'mb-1.5 block text-caption font-semibold uppercase tracking-wider text-ink-muted';
const inputClass =
  'w-full rounded-sm border border-hairline bg-canvas px-3 text-sm text-ink placeholder:text-ink-subtle transition-colors hover:border-ink-subtle focus-visible:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40';

/** Turns a GET form into a clean /store URL (empty fields dropped, page reset). */
function hrefFromForm(form: HTMLFormElement) {
  const params = new URLSearchParams();
  for (const [key, value] of new FormData(form)) {
    if (typeof value === 'string' && value.trim()) params.set(key, value.trim());
  }
  if (params.get('sort') === 'featured') params.delete('sort');
  const query = params.toString();
  return query ? `/store?${query}` : '/store';
}

function Hidden({ name, value }: { name: string; value?: string }) {
  return value ? <input type="hidden" name={name} value={value} /> : null;
}

/**
 * Compact catalogue toolbar: search + sort inline, other filters in an accessible side drawer.
 * Both are real GET forms (they work without JavaScript); with JavaScript, navigation is
 * client-side and keeps the scroll position.
 */
export function StoreToolbar({
  state,
  facets,
  currency,
  total
}: {
  state: CatalogueState;
  facets: OptionDefinition[];
  currency?: string;
  total: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const activeCount =
    (state.availability === 'in-stock' ? 1 : 0) + (state.minPrice ? 1 : 0) + (state.maxPrice ? 1 : 0) + Object.keys(state.opt).length;

  const go = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpen(false);
    router.push(hrefFromForm(event.currentTarget), { scroll: false });
  };

  const persistedFilters = (
    <>
      <Hidden name="availability" value={state.availability === 'in-stock' ? 'in-stock' : undefined} />
      <Hidden name="minPrice" value={state.minPrice} />
      <Hidden name="maxPrice" value={state.maxPrice} />
      {Object.entries(state.opt).map(([key, value]) => (
        <Hidden key={key} name={`opt[${key}]`} value={value} />
      ))}
    </>
  );

  return (
    <>
      <form action="/store" method="get" role="search" aria-label="Search products" onSubmit={go} className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Hidden name="category" value={state.category} />
        {persistedFilters}
        <div className="relative flex-1">
          <label htmlFor="store-q" className="sr-only">
            Search the Store
          </label>
          <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
          <input
            id="store-q"
            name="q"
            type="search"
            defaultValue={state.q}
            maxLength={100}
            placeholder="Search dresses, wigs, refrigerators…"
            className={`${inputClass} min-h-[44px] bg-surface-elevated pl-10`}
          />
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="store-sort" className="sr-only">
            Sort products
          </label>
          <Select
            id="store-sort"
            name="sort"
            tone="surface"
            defaultValue={state.sort}
            onChange={(event) => event.currentTarget.form?.requestSubmit()}
            className="min-w-[11.5rem] flex-1 sm:flex-none"
          >
            {Object.entries(SORT_LABELS).map(([value, text]) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </Select>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-sm border border-hairline bg-surface-elevated px-4 text-xs font-semibold tracking-wide text-ink transition-colors hover:border-ink"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
              <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
              <circle cx="16" cy="7" r="2" />
              <circle cx="10" cy="17" r="2" />
            </svg>
            Filters
            {activeCount ? (
              <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-ink px-1.5 font-mono text-caption text-canvas">
                {activeCount}
              </span>
            ) : null}
          </button>
          <noscript>
            <button type="submit" className={buttonClasses('primary', 'min-h-[44px] px-4')}>
              Search
            </button>
          </noscript>
        </div>
      </form>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Filters"
        footer={
          <div className="flex items-center gap-3">
            <a
              href={state.category ? `/store?category=${state.category}` : '/store'}
              onClick={(event) => {
                event.preventDefault();
                setOpen(false);
                router.push(state.category ? `/store?category=${state.category}` : '/store', { scroll: false });
              }}
              className={buttonClasses('secondary', 'flex-1')}
            >
              Clear all
            </a>
            <button type="submit" form="store-filter-form" className={buttonClasses('primary', 'flex-1')}>
              Show results
            </button>
          </div>
        }
      >
        <form id="store-filter-form" action="/store" method="get" onSubmit={go} className="space-y-7 py-6">
          <Hidden name="category" value={state.category} />
          <Hidden name="q" value={state.q} />
          <Hidden name="sort" value={state.sort !== 'featured' ? state.sort : undefined} />

          <fieldset>
            <legend className={labelClass}>Availability</legend>
            <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-sm border border-hairline bg-surface-elevated px-3.5 text-sm text-ink transition-colors hover:border-ink-subtle">
              <input type="checkbox" name="availability" value="in-stock" defaultChecked={state.availability === 'in-stock'} className="h-4 w-4 accent-[#141413]" />
              In stock only
            </label>
          </fieldset>

          <fieldset>
            <legend className={labelClass}>Price{currency ? ` (${currency})` : ''}</legend>
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor="store-min">
                Minimum price
              </label>
              <input id="store-min" name="minPrice" inputMode="decimal" pattern="\d+(\.\d{1,2})?" defaultValue={state.minPrice} placeholder="Min" className={`${inputClass} min-h-[44px]`} />
              <span aria-hidden className="text-ink-subtle">
                –
              </span>
              <label className="sr-only" htmlFor="store-max">
                Maximum price
              </label>
              <input id="store-max" name="maxPrice" inputMode="decimal" pattern="\d+(\.\d{1,2})?" defaultValue={state.maxPrice} placeholder="Max" className={`${inputClass} min-h-[44px]`} />
            </div>
          </fieldset>

          {facets.length ? (
            facets.map((facet) => (
              <div key={facet.key}>
                <label htmlFor={`store-opt-${facet.key}`} className={labelClass}>
                  {facet.label}
                </label>
                <Select id={`store-opt-${facet.key}`} name={`opt[${facet.key}]`} defaultValue={state.opt[facet.key] ?? ''}>
                  <option value="">Any {facet.label.toLowerCase()}</option>
                  {facet.values.map((value) => (
                    <option key={value.value} value={value.value}>
                      {value.value}
                    </option>
                  ))}
                </Select>
              </div>
            ))
          ) : (
            <p className="rounded-sm bg-surface p-3.5 text-xs leading-relaxed text-ink-muted">
              Choose a category to filter by size, colour, shade, length or finish.
            </p>
          )}
        </form>
        <p className="pb-6 text-caption text-ink-subtle">
          {total} {total === 1 ? 'product matches' : 'products match'} the current filters.
        </p>
      </Drawer>
    </>
  );
}
