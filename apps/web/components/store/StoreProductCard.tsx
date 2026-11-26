import Image from 'next/image';
import Link from 'next/link';
import { Swatches } from '@/components/store/ProductCard';
import { StockLabel } from '@/components/store/StockLabel';
import { Icon } from '@/components/ui/Icon';
import { displayTitle, formatPriceRange } from '@/lib/store/format';
import type { ProductSummary } from '@/lib/store/types';

/**
 * Catalogue card backed by the Store API. Fashion and beauty keep the tall 3:4 lookbook frame;
 * appliances keep the 4:3 showroom frame with a monospaced specification strip (design handoff §7).
 */
export function StoreProductCard({ product, priority = false }: { product: ProductSummary; priority?: boolean }) {
  const appliance = product.category.presentationMode === 'appliance';

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-sm border border-hairline bg-surface-elevated transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-ink-subtle/40 hover:shadow-[0_18px_40px_-24px_rgba(20,20,19,0.35)] focus-within:shadow-[0_18px_40px_-24px_rgba(20,20,19,0.35)]">
      <div className={`relative overflow-hidden border-b border-hairline bg-surface ${appliance ? 'aspect-landscape' : 'aspect-portrait'}`}>
        {product.image ? (
          <Image
            src={product.image.src}
            alt={product.image.alt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            style={product.image.focalPoint ? { objectPosition: product.image.focalPoint } : undefined}
          />
        ) : (
          <div role="img" aria-label="Product photograph to be supplied" className="absolute inset-0 flex flex-col items-center justify-center gap-2 border border-dashed border-hairline text-center">
            <Icon name="image" className="h-6 w-6 text-accent" />
            <span className="text-xs text-ink-muted">Photograph to be supplied</span>
          </div>
        )}
        {product.stockStatus === 'out_of_stock' ? (
          <span className="absolute left-3 top-3 rounded-sm bg-canvas/95 px-2 py-1 text-caption font-medium text-ink">Out of stock</span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <p className="flex items-center gap-2 text-caption font-semibold uppercase tracking-wider text-accent">
            {product.category.name}
            {/* Quiet per-item marker; the full disclosure sits at the top of the page. */}
            {product.isDemo ? <span className="font-medium tracking-[0.14em] text-ink-subtle">· Demo</span> : null}
          </p>
          <h3 className="text-pretty mt-1.5 text-base font-semibold leading-snug text-ink">
            {/* Stretched link: the whole card is one target with a single accessible name. */}
            <Link href={`/store/${product.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
              {displayTitle(product.name)}
            </Link>
          </h3>
          {product.editorialNote && !appliance ? <p className="mt-1 text-xs italic text-ink-muted">{product.editorialNote}</p> : null}
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">{product.shortDescription}</p>

          {appliance && product.highlightSpec ? (
            <p className="mt-3 rounded-sm border border-hairline bg-canvas px-2.5 py-1.5 font-mono text-caption text-ink">{product.highlightSpec}</p>
          ) : null}
          {!appliance ? (
            <div className="mt-3 space-y-1.5">
              {product.swatches.length ? <Swatches swatches={product.swatches.map((s) => ({ name: s.value, hex: s.hex ?? '#ccc' }))} /> : null}
              {product.optionSummary.map((option) => (
                <p key={option.label} className="text-caption text-ink-subtle">
                  <span className="font-medium text-ink-muted">{option.label}:</span> {option.values.join(' · ')}
                </p>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-hairline pt-3">
          <p className="font-mono text-sm font-medium tabular-nums text-ink">{formatPriceRange(product.priceFrom, product.priceTo)}</p>
          <StockLabel status={product.stockStatus} />
        </div>
      </div>
    </article>
  );
}
