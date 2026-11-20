import { Media } from '@/components/ui/Media';
import { DemoLabel, Ledger } from '@/components/ui/Notice';
import type { DemoProduct, Swatch } from '@/lib/types';

export function Swatches({ swatches, caption }: { swatches: Swatch[]; caption?: string }) {
  return (
    <div className="flex items-center gap-2">
      <ul className="flex items-center gap-2" aria-label="Colour options">
        {swatches.map((swatch) => (
          <li key={swatch.name}>
            <span
              title={swatch.name}
              className="block h-3.5 w-3.5 rounded-full border border-black/15"
              style={{ backgroundColor: swatch.hex }}
            />
            <span className="sr-only">{swatch.name}</span>
          </li>
        ))}
      </ul>
      {caption ? <span className="ml-1 text-caption text-ink-subtle">{caption}</span> : null}
    </div>
  );
}

/**
 * Store product card. Visual language switches by presentation mode, as required by the design
 * handoff (§7): fashion/beauty → tall 3:4 lookbook with hover image swap, swatches and sizes;
 * appliances → 4:3 studio plinth with a monospaced highlight strip and a short spec ledger.
 *
 * There is no price, stock status or add-to-bag action: pricing and commerce are out of scope.
 */
export function ProductCard({ product }: { product: DemoProduct }) {
  const isAppliance = product.presentationMode === 'appliance';
  const [primary, secondary] = product.images;

  return (
    <article className="group flex flex-col overflow-hidden rounded-sm border border-hairline bg-surface-elevated transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <Media
        image={primary}
        hoverImage={isAppliance ? undefined : secondary}
        frameClassName={`${isAppliance ? 'aspect-landscape' : 'aspect-portrait'} border-b border-hairline`}
        sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
        imageClassName={isAppliance ? 'transition-transform duration-300 group-hover:scale-[1.02]' : ''}
      />

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-center justify-between gap-2 text-caption uppercase tracking-wider">
            <DemoLabel>Demonstration item</DemoLabel>
            <span className="font-mono text-ink-subtle">{product.reference}</span>
          </div>
          <h3 className="mt-2 text-base font-semibold leading-snug text-ink">{product.name}</h3>
          {product.editorialNote ? <p className="mt-1 text-xs italic text-ink-muted">{product.editorialNote}</p> : null}
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">{product.shortDescription}</p>

          {isAppliance ? (
            <>
              {product.highlightSpec ? (
                <p className="mt-3 rounded-sm border border-hairline bg-canvas px-2.5 py-1.5 font-mono text-caption text-ink">
                  {product.highlightSpec}
                </p>
              ) : null}
              {product.specifications ? (
                <Ledger
                  className="mt-3"
                  rows={product.specifications.map((spec) => ({ label: spec.label, value: spec.value }))}
                />
              ) : null}
            </>
          ) : (
            <div className="mt-3 space-y-2">
              {product.swatches ? <Swatches swatches={product.swatches} /> : null}
              {product.sizes ? (
                <p className="text-caption text-ink-subtle">
                  <span className="font-medium text-ink-muted">{product.sizeLabel ?? 'Sizes'}:</span>{' '}
                  {product.sizes.join(' · ')}
                </p>
              ) : null}
            </div>
          )}
        </div>

        <p className="mt-4 border-t border-hairline pt-3 font-mono text-xs text-ink-muted">Pricing to be confirmed</p>
      </div>
    </article>
  );
}
