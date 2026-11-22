import { Icon } from '@/components/ui/Icon';
import { Media } from '@/components/ui/Media';
import { DemoLabel, Ledger } from '@/components/ui/Notice';
import { TO_BE_CONFIRMED } from '@/lib/site';
import type { DemoApartment } from '@/lib/types';

/** Three-cell spatial metrics grid (bed and bath · floor area · utilities) — the apartments signature element. */
export function SpatialMetrics({ apartment }: { apartment: DemoApartment }) {
  const cells = [
    { value: `${apartment.bedrooms} / ${apartment.bathrooms}`, label: 'Bed / bath', mono: true },
    { value: `${apartment.areaSqm} m²`, label: 'Floor area', mono: true },
    { value: apartment.utilitiesIncluded ? 'Included' : 'Separate', label: 'Utilities', mono: false }
  ];

  return (
    <dl className="grid grid-cols-3 divide-x divide-hairline rounded-sm border border-hairline bg-canvas text-center">
      {cells.map((cell) => (
        <div key={cell.label} className="flex flex-col-reverse px-2 py-2.5">
          <dt className="text-caption text-ink-subtle">{cell.label}</dt>
          <dd className={`text-xs font-medium text-ink ${cell.mono ? 'font-mono tabular-nums' : ''}`}>{cell.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Apartment listing card. Rental terms are shown as a ledger, with unconfirmed policy left explicit. */
export function ApartmentCard({ apartment, arrangementLabel }: { apartment: DemoApartment; arrangementLabel: string }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-sm border border-hairline bg-surface-elevated transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <Media
        image={apartment.images[0]}
        frameClassName="aspect-landscape border-b border-hairline"
        sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
        placeholderLabel="Residence photograph to be supplied"
      />

      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption uppercase tracking-wider text-ink-subtle">
            <span className="font-semibold text-accent">{arrangementLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{apartment.furnishing}</span>
          </div>
          <h2 className="mt-2 text-2xl font-semibold text-ink">{apartment.name}</h2>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-ink-subtle">
            <Icon name="map-pin" className="h-3.5 w-3.5" />
            {apartment.locationLabel}
          </p>
          <p className="mt-2.5 text-xs leading-relaxed text-ink-muted">{apartment.summary}</p>

          <div className="mt-4">
            <SpatialMetrics apartment={apartment} />
          </div>

          <ul className="mt-4 space-y-1.5 text-xs text-ink-muted">
            {apartment.amenities.slice(0, 3).map((amenity) => (
              <li key={amenity} className="flex items-center gap-2">
                <Icon name="check" className="h-3.5 w-3.5 shrink-0 text-accent" />
                <span>{amenity}</span>
              </li>
            ))}
          </ul>

          <Ledger
            className="mt-4"
            rows={[
              { label: 'Minimum term', value: TO_BE_CONFIRMED },
              { label: 'Deposit', value: TO_BE_CONFIRMED },
              { label: 'Rate', value: 'On request' }
            ]}
          />
        </div>

        <div className="mt-5 border-t border-hairline pt-4">
          <DemoLabel />
        </div>
      </div>
    </article>
  );
}
