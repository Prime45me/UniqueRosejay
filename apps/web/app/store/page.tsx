import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CatalogueControls, Pagination, storeHref, type CatalogueState } from '@/components/store/CatalogueControls';
import { FutureCategoryTile } from '@/components/store/CategoryTile';
import { StoreProductCard } from '@/components/store/StoreProductCard';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { FilterTabs } from '@/components/ui/FilterTabs';
import { Icon } from '@/components/ui/Icon';
import { NoticePanel } from '@/components/ui/Notice';
import { Kicker, SectionHeader } from '@/components/ui/Typography';
import { storeGet } from '@/lib/store/api';
import type { CategoryGroup, ProductListMeta, ProductSummary } from '@/lib/store/types';

export const metadata: Metadata = {
  title: 'Store',
  description:
    'The URJ Store: clothing and dresses, bags and shoes, wigs, ice chests, refrigerators, washing machines and future categories.'
};

const SORTS = new Set(['featured', 'price-asc', 'price-desc', 'newest', 'name']);
const DECIMAL = /^\d{1,13}(\.\d{1,4})?$/;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const OPTION_KEY = /^opt\[([a-z][a-z0-9_]{0,30})\]$/;

type RawParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)?.trim() || undefined;

/** Normalises URL parameters; anything empty or malformed is dropped rather than causing an error. */
function readState(raw: RawParams): CatalogueState {
  const opt: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    const match = OPTION_KEY.exec(key);
    const v = first(value);
    if (match && v && v.length <= 60) opt[match[1]] = v;
  }
  const category = first(raw.category);
  const sort = first(raw.sort) ?? 'featured';
  const minPrice = first(raw.minPrice);
  const maxPrice = first(raw.maxPrice);
  const page = Number.parseInt(first(raw.page) ?? '1', 10);
  return {
    category: category && SLUG.test(category) ? category : undefined,
    q: first(raw.q)?.slice(0, 100),
    sort: SORTS.has(sort) ? sort : 'featured',
    availability: first(raw.availability) === 'in-stock' ? 'in-stock' : 'all',
    minPrice: minPrice && DECIMAL.test(minPrice) ? minPrice : undefined,
    maxPrice: maxPrice && DECIMAL.test(maxPrice) ? maxPrice : undefined,
    opt,
    page: Number.isFinite(page) && page >= 1 && page <= 500 ? page : 1
  };
}

function apiQuery(state: CatalogueState) {
  const params = new URLSearchParams({ sort: state.sort, availability: state.availability, page: String(state.page), pageSize: '12' });
  if (state.category) params.set('category', state.category);
  if (state.q) params.set('q', state.q);
  if (state.minPrice) params.set('minPrice', state.minPrice);
  if (state.maxPrice) params.set('maxPrice', state.maxPrice);
  for (const [key, value] of Object.entries(state.opt)) params.set(`opt[${key}]`, value);
  return params.toString();
}

export default async function StorePage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const state = readState(await searchParams);
  const [{ data: groups }, { data: products, meta }] = await Promise.all([
    storeGet<CategoryGroup[]>('/categories'),
    storeGet<ProductSummary[], ProductListMeta>(`/products?${apiQuery(state)}`)
  ]);

  const categories = groups.flatMap((group) => group.categories.map((category) => ({ ...category, group })));
  const activeCategory = categories.find((category) => category.slug === state.category);
  const activeGroup = groups.find((group) => group.slug === state.category) ?? activeCategory?.group;
  const unknownCategory = state.category && !activeCategory && !groups.some((group) => group.slug === state.category);
  const filtering = Boolean(state.q || state.minPrice || state.maxPrice || state.availability === 'in-stock' || Object.keys(state.opt).length);
  const showDirectory = !state.category && !filtering && state.page === 1;
  const banner = activeCategory?.image ?? (activeGroup ? activeGroup.categories[0]?.image : null);

  const tabs = [
    { label: 'All categories', href: '/store', active: !state.category },
    ...groups.map((group) => ({ label: group.name, href: storeHref({ category: group.slug }), active: state.category === group.slug })),
    ...categories.map((category) => ({ label: category.name, href: storeHref({ category: category.slug }), active: category.slug === state.category }))
  ];

  return (
    <Container className="py-10 lg:py-14">
      {activeGroup ? (
        <div className="grid grid-cols-1 items-stretch overflow-hidden rounded-sm border border-hairline bg-surface-elevated lg:grid-cols-12">
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:col-span-6">
            <Kicker>{activeGroup.presentationMode === 'appliance' ? 'Home & Cooling Showroom' : 'Fashion & Beauty Edit'}</Kicker>
            <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">{activeCategory?.name ?? activeGroup.name}</h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">{activeCategory?.description ?? activeGroup.description}</p>
          </div>
          <div className="relative h-56 bg-surface sm:h-64 lg:col-span-6 lg:h-auto lg:min-h-[18rem]">
            {banner ? <Image src={banner.src} alt={banner.alt} fill priority sizes="(min-width: 1024px) 640px, 100vw" className="object-cover" /> : null}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl">
          <Kicker>Unique RoseJay Store</Kicker>
          <h1 className="mt-2 text-4xl font-semibold text-ink sm:text-5xl">Fashion, Beauty &amp; Home Appliances</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">
            One Store for very different goods. Fashion and beauty are presented lookbook-style; appliances are presented
            showroom-style, with specifications up front.
          </p>
        </div>
      )}

      <div className="mt-8">
        <FilterTabs label="Store categories" tabs={tabs} />
        {unknownCategory ? (
          <p className="mt-3 text-xs text-ink-subtle" role="status">
            The category &ldquo;{state.category}&rdquo; was not found.
          </p>
        ) : null}
      </div>

      <div className="mt-6">
        <CatalogueControls state={state} facets={meta.facets.options} currency={meta.facets.currencies.length === 1 ? meta.facets.currencies[0] : undefined} />
      </div>

      <NoticePanel title="Demonstration catalogue — orders are requests, not payments" className="mt-6">
        Products, photographs and prices are illustrative and are not verified URJ inventory. Submitting an order sends a request
        for review; no payment is taken.
      </NoticePanel>

      {showDirectory ? (
        <div className="mt-12 space-y-12">
          {groups.map((group) => (
            <section key={group.slug} aria-labelledby={`group-${group.slug}`}>
              <SectionHeader
                kicker={group.presentationMode === 'appliance' ? 'Home & Cooling Showroom' : 'Fashion & Beauty Edit'}
                title={<span id={`group-${group.slug}`}>{group.name}</span>}
                description={group.description}
                action={
                  <Link href={storeHref({ category: group.slug })} className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink hover:text-accent">
                    Shop all <Icon name="arrow-right" className="h-3.5 w-3.5" />
                  </Link>
                }
              />
              <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3 lg:gap-8">
                {group.categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={storeHref({ category: category.slug })}
                      className="group flex h-full flex-col overflow-hidden rounded-sm border border-hairline bg-surface-elevated transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className={`relative overflow-hidden border-b border-hairline bg-surface ${category.presentationMode === 'appliance' ? 'aspect-landscape' : 'aspect-landscape sm:aspect-portrait'}`}>
                        {category.image ? (
                          <Image src={category.image.src} alt={category.image.alt} fill sizes="(min-width: 1024px) 400px, (min-width: 640px) 33vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                        ) : null}
                      </div>
                      <div className="flex flex-1 items-start justify-between gap-4 p-5">
                        <div>
                          <h3 className="font-display text-2xl font-semibold text-ink">{category.name}</h3>
                          <p className="mt-1 text-xs leading-relaxed text-ink-muted">{category.description}</p>
                          <p className="mt-2 font-mono text-caption text-ink-subtle">
                            {category.productCount} {category.productCount === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                        <Icon name="arrow-right" className="mt-2 h-4 w-4 shrink-0 text-ink-muted transition-colors group-hover:text-accent" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <div className="grid grid-cols-1 sm:grid-cols-3">
            <FutureCategoryTile />
          </div>
        </div>
      ) : null}

      <section aria-labelledby="results-heading" className="mt-14">
        <div className="flex flex-col justify-between gap-2 border-b border-hairline pb-5 sm:flex-row sm:items-end">
          <div>
            <Kicker>{activeCategory?.name ?? activeGroup?.name ?? 'All categories'}</Kicker>
            <h2 id="results-heading" className="mt-2 text-3xl font-semibold text-ink">
              {filtering ? 'Matching products' : showDirectory ? 'Featured across the Store' : 'Products'}
            </h2>
          </div>
          <p className="font-mono text-xs text-ink-muted" role="status">
            {meta.total} {meta.total === 1 ? 'product' : 'products'}
            {meta.totalPages > 1 ? ` · page ${meta.page} of ${meta.totalPages}` : ''}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="mt-8 rounded-sm border border-hairline bg-surface-elevated px-6 py-16 text-center">
            <Icon name="search" className="mx-auto h-7 w-7 text-accent" />
            <p className="mt-4 font-display text-2xl font-semibold text-ink">No products match these choices</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">Try removing a filter, widening the price range or searching for something broader.</p>
            <ButtonLink href={storeHref({ category: state.category })} variant="secondary" className="mt-6">
              Clear filters
            </ButtonLink>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {products.map((product, index) => (
              <StoreProductCard key={product.id} product={product} priority={index < 3 && !showDirectory} />
            ))}
          </div>
        )}

        <Pagination state={state} totalPages={meta.totalPages} />
      </section>
    </Container>
  );
}
