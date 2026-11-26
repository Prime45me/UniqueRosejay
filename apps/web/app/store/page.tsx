import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ActiveFilters, CategoryNav, Pagination, storeHref, type CatalogueState } from '@/components/store/CatalogueControls';
import { FutureCategoryTile } from '@/components/store/CategoryTile';
import { StoreProductCard } from '@/components/store/StoreProductCard';
import { StoreToolbar } from '@/components/store/StoreToolbar';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { Kicker } from '@/components/ui/Typography';
import { IMAGES } from '@/lib/demo/images';
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

/** One quiet disclosure line per page (the site-wide preview bar sits above the header). */
function Disclosure() {
  return (
    <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
      <Icon name="info" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
      <span>
        <span className="font-medium text-ink">Demonstration catalogue.</span> Items, photographs and prices are illustrative, not verified
        URJ inventory. Orders are sent as requests for review; no payment is taken.
      </span>
    </p>
  );
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
  const landing = !state.category && !filtering && state.page === 1;
  const banner = activeCategory?.image ?? (activeGroup ? activeGroup.categories[0]?.image : null);
  // Option facets (size, shade, finish…) are category-aware: offered once a category or group is chosen.
  const facets = state.category ? meta.facets.options : [];
  const appliance = activeGroup?.presentationMode === 'appliance';

  return (
    <>
      {/* ── Editorial header ───────────────────────────────────────────── */}
      {activeGroup ? (
        <Container className="pt-8 lg:pt-12">
          <div className="grid grid-cols-1 items-stretch overflow-hidden rounded-sm border border-hairline bg-surface-elevated lg:grid-cols-12">
            <div className="flex flex-col justify-center p-6 sm:p-10 lg:col-span-6">
              <Kicker>{appliance ? 'Home & Cooling Showroom' : 'Fashion & Beauty Edit'}</Kicker>
              <h1 className="mt-2 text-4xl font-semibold leading-[1.08] text-ink sm:text-5xl">{activeCategory?.name ?? activeGroup.name}</h1>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted">{activeCategory?.description ?? activeGroup.description}</p>
            </div>
            <div className="relative h-52 bg-surface sm:h-60 lg:col-span-6 lg:h-auto lg:min-h-[16rem]">
              {banner ? <Image src={banner.src} alt={banner.alt} fill priority sizes="(min-width: 1024px) 640px, 100vw" className="object-cover" /> : null}
            </div>
          </div>
        </Container>
      ) : landing ? (
        <Container as="section" className="pt-8 lg:pt-12" aria-labelledby="store-hero-title">
          <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="pb-2 lg:col-span-5 lg:pb-6">
              <Kicker>The URJ Store</Kicker>
              <h1 id="store-hero-title" className="mt-4 text-5xl font-semibold leading-[1.02] tracking-tight text-ink sm:text-6xl">
                Wardrobe, beauty
                <br className="hidden sm:block" /> &amp; home essentials
              </h1>
              <p className="mt-5 max-w-sm text-base leading-relaxed text-ink-muted">
                Two edits under one roof: lookbook fashion and beauty, and a showroom of appliances with the specifications up front.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href={storeHref({ category: 'fashion-beauty' })} arrow>
                  Fashion &amp; Beauty
                </ButtonLink>
                <ButtonLink href={storeHref({ category: 'home-appliances' })} variant="secondary">
                  Home &amp; Appliances
                </ButtonLink>
              </div>
            </div>

            {/* Two-image composition from existing design assets: portrait lookbook + landscape showroom. */}
            <div className="relative grid grid-cols-12 gap-4 lg:col-span-7">
              <Link
                href={storeHref({ category: 'fashion-beauty' })}
                className="group relative col-span-5 aspect-portrait overflow-hidden rounded-sm border border-hairline bg-surface"
                aria-label="Shop Fashion & Beauty"
              >
                <Image
                  src={IMAGES.editorialFashionLookbook.src}
                  alt={IMAGES.editorialFashionLookbook.alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 300px, 42vw"
                  className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-16 font-display text-xl font-semibold text-canvas">
                  Fashion &amp; Beauty
                </span>
              </Link>
              <div className="col-span-7 flex flex-col justify-end gap-4">
                <Link
                  href={storeHref({ category: 'home-appliances' })}
                  className="group relative aspect-[4/3] overflow-hidden rounded-sm border border-hairline bg-surface"
                  aria-label="Shop Home & Cooling Appliances"
                >
                  <Image
                    src={IMAGES.editorialApplianceShowroom.src}
                    alt={IMAGES.editorialApplianceShowroom.alt}
                    fill
                    priority
                    sizes="(min-width: 1024px) 420px, 58vw"
                    className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-16 font-display text-xl font-semibold text-canvas">
                    Home &amp; Appliances
                  </span>
                </Link>
                <p className="hidden font-mono text-caption uppercase tracking-[0.2em] text-ink-subtle sm:block">
                  {categories.length} categories · more to come
                </p>
              </div>
            </div>
          </div>
        </Container>
      ) : (
        <Container className="pt-8 lg:pt-12">
          <Kicker>The URJ Store</Kicker>
          <h1 className="mt-2 text-4xl font-semibold text-ink sm:text-5xl">{state.q ? <>Results for &ldquo;{state.q}&rdquo;</> : 'All products'}</h1>
        </Container>
      )}

      {/* ── Navigation, controls and merchandise ───────────────────────── */}
      <Container className="pb-16 pt-8 lg:pb-24">
        <Disclosure />

        <div className="mt-8 space-y-5">
          <CategoryNav groups={groups} active={state.category} />
          {unknownCategory ? (
            <p className="text-xs text-ink-subtle" role="status">
              The category &ldquo;{state.category}&rdquo; was not found.
            </p>
          ) : null}
          <StoreToolbar state={state} facets={facets} total={meta.total} currency={meta.facets.currencies.length === 1 ? meta.facets.currencies[0] : undefined} />
          <ActiveFilters state={state} facets={meta.facets.options} />
        </div>

        <section aria-labelledby="results-heading" className="mt-10">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="results-heading" className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-ink">
              {filtering ? 'Matching products' : landing ? 'Featured across the Store' : activeCategory?.name ?? activeGroup?.name ?? 'Products'}
            </h2>
            <p className="font-mono text-xs text-ink-muted" role="status">
              {meta.total} {meta.total === 1 ? 'product' : 'products'}
              {meta.totalPages > 1 ? ` · page ${meta.page} of ${meta.totalPages}` : ''}
            </p>
          </div>

          {products.length === 0 ? (
            <div className="mt-6 rounded-sm border border-hairline bg-surface-elevated px-6 py-16 text-center">
              <Icon name="search" className="mx-auto h-7 w-7 text-accent" />
              <p className="mt-4 font-display text-2xl font-semibold text-ink">No products match these choices</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">Try removing a filter, widening the price range or searching for something broader.</p>
              <ButtonLink href={storeHref({ category: state.category })} variant="secondary" className="mt-6">
                Clear filters
              </ButtonLink>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-10">
              {products.map((product, index) => (
                <StoreProductCard key={product.id} product={product} priority={index < 3 && !landing} />
              ))}
            </div>
          )}

          <Pagination state={state} totalPages={meta.totalPages} />
        </section>

        {/* ── Shop by category (landing only, after the merchandise) ───── */}
        {landing ? (
          <div className="mt-24 space-y-16">
            {groups.map((group) => (
              <Reveal as="section" key={group.slug} aria-labelledby={`group-${group.slug}`}>
                <div className="flex flex-col justify-between gap-3 border-b border-hairline pb-6 sm:flex-row sm:items-end">
                  <div className="max-w-xl">
                    <Kicker>{group.presentationMode === 'appliance' ? 'Home & Cooling Showroom' : 'Fashion & Beauty Edit'}</Kicker>
                    <h2 id={`group-${group.slug}`} className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">
                      {group.name}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">{group.description}</p>
                  </div>
                  <Link href={storeHref({ category: group.slug })} className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-ink hover:text-accent">
                    Shop all <Icon name="arrow-right" className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3 lg:gap-8">
                  {group.categories.map((category) => (
                    <li key={category.slug}>
                      <Link href={storeHref({ category: category.slug })} className="group block">
                        <div
                          className={`relative overflow-hidden rounded-sm border border-hairline bg-surface ${
                            category.presentationMode === 'appliance' ? 'aspect-landscape' : 'aspect-landscape sm:aspect-portrait'
                          }`}
                        >
                          {category.image ? (
                            <Image
                              src={category.image.src}
                              alt={category.image.alt}
                              fill
                              sizes="(min-width: 1024px) 400px, (min-width: 640px) 33vw, 100vw"
                              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                            />
                          ) : null}
                        </div>
                        <div className="mt-4 flex items-baseline justify-between gap-4">
                          <h3 className="font-display text-2xl font-semibold text-ink transition-colors group-hover:text-accent">{category.name}</h3>
                          <span className="font-mono text-caption text-ink-subtle">
                            {category.productCount} {category.productCount === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-ink-muted">{category.description}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
            <Reveal className="grid grid-cols-1 sm:grid-cols-3">
              <FutureCategoryTile />
            </Reveal>
          </div>
        ) : null}
      </Container>
    </>
  );
}
