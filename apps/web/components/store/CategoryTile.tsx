import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { Media } from '@/components/ui/Media';
import type { StoreCategory } from '@/lib/types';

/** Category entry tile on the Store landing directory. Fashion tiles are portrait, appliance tiles landscape. */
export function CategoryTile({ category }: { category: StoreCategory }) {
  const isAppliance = category.presentationMode === 'appliance';

  return (
    <Link
      href={`/store?category=${category.slug}`}
      className="group flex flex-col overflow-hidden rounded-sm border border-hairline bg-surface-elevated transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <Media
        image={category.image}
        frameClassName={`${isAppliance ? 'aspect-landscape' : 'aspect-landscape sm:aspect-portrait'} border-b border-hairline`}
        sizes="(min-width: 1024px) 400px, (min-width: 640px) 33vw, 100vw"
        imageClassName="transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <div className="flex flex-1 items-start justify-between gap-4 p-5">
        <div>
          <h3 className="font-display text-2xl font-semibold text-ink">{category.name}</h3>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">{category.description}</p>
        </div>
        <Icon name="arrow-right" className="mt-2 h-4 w-4 shrink-0 text-ink-muted transition-colors group-hover:text-accent" />
      </div>
    </Link>
  );
}

/** "Future categories" tile — signals the catalogue is extensible without inventing categories. */
export function FutureCategoryTile() {
  return (
    <div className="flex flex-col justify-between rounded-sm border border-dashed border-hairline bg-canvas p-6">
      <div>
        <p className="font-mono text-xs text-accent">+</p>
        <h3 className="mt-2 font-display text-2xl font-semibold text-ink">Future categories</h3>
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">
          The Store is built so new product categories can be added as the URJ catalogue grows.
        </p>
      </div>
      <p className="mt-6 text-caption text-ink-subtle">Categories to be announced</p>
    </div>
  );
}
