import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductGallery } from '@/components/store/product/ProductGallery';
import { PurchasePanel } from '@/components/store/product/PurchasePanel';
import { StoreProductCard } from '@/components/store/StoreProductCard';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { Ledger } from '@/components/ui/Notice';
import { Reveal } from '@/components/ui/Reveal';
import { Kicker, SectionHeader } from '@/components/ui/Typography';
import { storeGet, StoreApiError } from '@/lib/store/api';
import { displayTitle } from '@/lib/store/format';
import type { ProductDetail } from '@/lib/store/types';

type Params = { params: Promise<{ slug: string }> };

async function loadProduct(slug: string) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) notFound();
  try {
    return (await storeGet<ProductDetail>(`/products/${slug}`)).data;
  } catch (error) {
    if (error instanceof StoreApiError && error.status === 404) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await loadProduct(slug);
    return { title: `${product.name} — Store`, description: product.shortDescription };
  } catch {
    return { title: 'Store' };
  }
}

export default async function ProductPage({ params }: Params) {
  const product = await loadProduct((await params).slug);
  const lookbook = product.category.presentationMode !== 'appliance';

  return (
    <Container className="py-8 lg:py-12">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-ink-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/store" className="hover:text-ink">
              Store
            </Link>
          </li>
          {product.group ? (
            <>
              <li aria-hidden>/</li>
              <li>
                <Link href={`/store?category=${product.group.slug}`} className="hover:text-ink">
                  {product.group.name}
                </Link>
              </li>
            </>
          ) : null}
          <li aria-hidden>/</li>
          <li>
            <Link href={`/store?category=${product.category.slug}`} className="hover:text-ink">
              {product.category.name}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-ink">
            {displayTitle(product.name)}
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} name={product.name} portrait={lookbook} />
        </div>

        <div className="rounded-sm border border-hairline bg-surface-elevated p-6 sm:p-8 lg:sticky lg:top-24 lg:col-span-5">
          <Kicker>{product.category.name}</Kicker>
          {product.editorialNote ? <p className="mt-2 text-xs font-medium italic text-ink-muted">{product.editorialNote}</p> : null}
          <h1 className="text-pretty mt-2 text-[2rem] font-semibold leading-[1.1] text-ink sm:text-[2.35rem]">{displayTitle(product.name)}</h1>
          {product.highlightSpec ? (
            <p className="mt-3 inline-block rounded-sm border border-hairline bg-canvas px-2.5 py-1.5 font-mono text-caption text-ink">{product.highlightSpec}</p>
          ) : null}
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">{product.description}</p>

          <div className="mt-6">
            <PurchasePanel options={product.options} variants={product.variants} productName={product.name} isDemo={product.isDemo} />
          </div>

          {product.careNotes ? (
            <p className="mt-6 flex items-start gap-2.5 rounded-sm bg-surface p-3.5 text-xs text-ink-muted">
              <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              {product.careNotes}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {product.specifications.length ? (
          <section aria-labelledby="spec-heading" className="lg:col-span-7">
            <h2 id="spec-heading" className="font-sans text-xs font-semibold uppercase tracking-wider text-ink">
              {lookbook ? 'Details' : 'Technical specifications'}
            </h2>
            <Ledger className="mt-3 text-sm" rows={product.specifications.map((spec) => ({ label: spec.label, value: spec.value }))} />
          </section>
        ) : null}
      </div>

      {product.related.length ? (
        <Reveal as="section" className="mt-16" aria-labelledby="related-heading">
          <SectionHeader kicker="You may also like" title={<span id="related-heading">Related pieces</span>} />
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {product.related.map((related) => (
              <StoreProductCard key={related.id} product={related} />
            ))}
          </div>
        </Reveal>
      ) : null}
    </Container>
  );
}
