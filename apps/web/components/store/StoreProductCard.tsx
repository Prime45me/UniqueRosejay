import Image from 'next/image';
import Link from 'next/link';
import { Swatches } from '@/components/store/ProductCard';
import { StockLabel } from '@/components/store/StockLabel';
import { Icon } from '@/components/ui/Icon';
import { formatPriceRange } from '@/lib/store/format';
import type { ProductSummary } from '@/lib/store/types';

/**
 * Catalogue card backed by the Store API. Fashion and beauty keep the tall 3:4 lookbook frame;
 * appliances keep the 4:3 showroom frame with a monospaced specification strip (design handoff §7).
 */
export function StoreProductCard({ product, priority = false }: { product: ProductSummary; priority?: boolean }) {
  const appliance = product.category.presentationMode === 'appliance';

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-sm border border-hairline bg-surface-elevated transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-within:shadow-md">
      <div className={`relative overflow-hidden border-b border-hairline bg-surface ${appliance ? 'aspect-landscape' : 'aspect-portrait'}`}>
        {product.image ? (
          <Image
            src={product.image.src}
            alt={product.image.alt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
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
          <p className="text-caption font-semibold uppercase tracking-wider text-accent">{product.category.name}</p>
          <h3 className="mt-1.5 text-base font-semibold leading-snug text-ink">
            {/* Stretched link: the whole card is one target with a single accessible name. */}
            <Link href={`/store/${product.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
              {product.name}
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
          <div>
            <p className="font-mono text-sm font-medium tabular-nums text-ink">{formatPriceRange(product.priceFrom, product.priceTo)}</p>
            {product.isDemo ? <p className="text-caption text-status-pending">Demonstration price</p> : null}
          </div>
          <StockLabel status={product.stockStatus} />
        </div>
      </div>
    </article>
  );
}
