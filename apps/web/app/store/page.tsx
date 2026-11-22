import type { Metadata } from 'next';
import { CategoryTile, FutureCategoryTile } from '@/components/store/CategoryTile';
import { ProductCard } from '@/components/store/ProductCard';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { FilterTabs } from '@/components/ui/FilterTabs';
import { Media } from '@/components/ui/Media';
import { NoticePanel } from '@/components/ui/Notice';
import { Kicker, SectionHeader } from '@/components/ui/Typography';
import { findStoreCategory, getDemoProducts, getStoreCategories, getStoreGroups } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Store',
  description:
    'The URJ Store: clothing and dresses, bags and shoes, wigs, ice chests, refrigerators, washing machines and future categories.'
};

interface StorePageProps {
  searchParams: Promise<{ category?: string | string[] }>;
}

export default async function StorePage({ searchParams }: StorePageProps) {
  const params = await searchParams;
  const requested = Array.isArray(params.category) ? params.category[0] : params.category;

  const [groups, categories, activeCategory] = await Promise.all([
    getStoreGroups(),
    getStoreCategories(),
    findStoreCategory(requested)
  ]);
  const products = await getDemoProducts(activeCategory?.slug);
  const activeGroup = activeCategory ? groups.find((group) => group.id === activeCategory.group) : undefined;

  const tabs = [
    { label: 'All categories', href: '/store', active: !activeCategory },
    ...categories.map((category) => ({
      label: category.name,
      href: `/store?category=${category.slug}`,
      active: category.slug === activeCategory?.slug
    }))
  ];

  return (
    <Container className="py-10 lg:py-14">
      {/* Context-aware banner: lookbook for fashion/beauty, showroom for appliances, editorial intro otherwise. */}
      {activeCategory && activeGroup ? (
        <div className="grid grid-cols-1 items-stretch overflow-hidden rounded-sm border border-hairline bg-surface-elevated lg:grid-cols-12">
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:col-span-6">
            <Kicker>{activeGroup.kicker}</Kicker>
            <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">{activeCategory.name}</h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              {activeCategory.description} {activeGroup.description}
            </p>
          </div>
          <Media
            image={activeGroup.banner}
            frameClassName="h-56 sm:h-64 lg:col-span-6 lg:h-auto lg:min-h-[18rem]"
            sizes="(min-width: 1024px) 640px, 100vw"
            priority
          />
        </div>
      ) : (
        <div className="max-w-2xl">
          <Kicker>Unique RoseJay Store</Kicker>
          <h1 className="mt-2 text-4xl font-semibold text-ink sm:text-5xl">Fashion, Beauty &amp; Home Appliances</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">
            One Store for very different goods. Fashion and beauty are presented lookbook-style; appliances are
            presented showroom-style, with specifications up front.
          </p>
        </div>
      )}

      <div className="mt-8 border-b border-hairline pb-6">
        <FilterTabs label="Store categories" tabs={tabs} />
        {requested && !activeCategory ? (
          <p className="mt-3 text-xs text-ink-subtle" role="status">
            The category &ldquo;{requested}&rdquo; was not found, so all categories are shown.
          </p>
        ) : null}
      </div>

      <NoticePanel title="Demonstration catalogue" className="mt-6">
        The items below illustrate how products will be presented. They are not actual URJ products, and pricing,
        stock and ordering will be added in a later phase.
      </NoticePanel>

      {/* Category directory — only on the unfiltered landing view. */}
      {!activeCategory ? (
        <div className="mt-12 space-y-14">
          {groups.map((group) => (
            <section key={group.id} aria-labelledby={`group-${group.id}`}>
              <SectionHeader
                kicker={group.kicker}
                title={<span id={`group-${group.id}`}>{group.title}</span>}
                description={group.description}
              />
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3 lg:gap-8">
                {categories
                  .filter((category) => category.group === group.id)
                  .map((category) => (
                    <CategoryTile key={category.slug} category={category} />
                  ))}
              </div>
            </section>
          ))}

          <section aria-labelledby="future-categories">
            <h2 id="future-categories" className="sr-only">
              Future categories
            </h2>
            <FutureCategoryTile />
          </section>
        </div>
      ) : null}

      <section aria-labelledby="product-heading" className="mt-14">
        <SectionHeader
          kicker={activeCategory ? activeCategory.name : 'Sample selection'}
          title={<span id="product-heading">{activeCategory ? 'Demonstration items' : 'A look across the Store'}</span>}
          action={activeCategory ? <ButtonLink href="/store" variant="secondary">All categories</ButtonLink> : undefined}
        />

        {products.length === 0 ? (
          <div className="mt-8 rounded-sm border border-hairline bg-surface-elevated p-12 text-center">
            <p className="text-base font-semibold text-ink">No items in this category yet</p>
            <p className="mt-1 text-sm text-ink-muted">Products will appear here once the catalogue is connected.</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </section>
    </Container>
  );
}
