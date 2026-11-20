import { ArrowLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Media } from '@/components/ui/Media';
import { DemoLabel } from '@/components/ui/Notice';
import type { DemoHotel } from '@/lib/types';

/** Room-tier table: size, beds and guest limit. Rates are deliberately omitted (not confirmed). */
export function RoomTierTable({ hotel }: { hotel: DemoHotel }) {
  return (
    <div className="overflow-hidden rounded-sm border border-hairline bg-canvas">
      <table className="w-full text-left text-xs">
        <caption className="sr-only">Room tiers at {hotel.name}</caption>
        <thead className="border-b border-hairline text-caption uppercase tracking-wider text-ink-subtle">
          <tr>
            <th scope="col" className="px-3.5 py-2 font-medium">Room tier</th>
            <th scope="col" className="hidden px-3.5 py-2 font-medium sm:table-cell">Beds</th>
            <th scope="col" className="px-3.5 py-2 text-right font-medium">Size</th>
            <th scope="col" className="px-3.5 py-2 text-right font-medium">Guests</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {hotel.rooms.map((room) => (
            <tr key={room.name}>
              <th scope="row" className="px-3.5 py-2.5 font-medium text-ink">{room.name}</th>
              <td className="hidden px-3.5 py-2.5 text-ink-muted sm:table-cell">{room.bedConfiguration}</td>
              <td className="px-3.5 py-2.5 text-right font-mono tabular-nums text-ink">{room.sizeSqm} m²</td>
              <td className="px-3.5 py-2.5 text-right font-mono tabular-nums text-ink">{room.maxGuests}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Hotel listing card: wide architectural image, room tiers, highlights and check-in times. */
export function HotelCard({ hotel, priority = false }: { hotel: DemoHotel; priority?: boolean }) {
  return (
    <article className="grid grid-cols-1 overflow-hidden rounded-sm border border-hairline bg-surface-elevated lg:grid-cols-12">
      <Media
        image={hotel.images[0]}
        frameClassName="aspect-wide lg:col-span-6 lg:aspect-auto lg:min-h-[420px]"
        sizes="(min-width: 1024px) 640px, 100vw"
        priority={priority}
      />

      <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-6">
        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
            <DemoLabel />
            <span className="inline-flex items-center gap-1">
              <Icon name="map-pin" className="h-3.5 w-3.5" />
              {hotel.locationLabel}
            </span>
          </div>
          <h2 className="mt-2 text-3xl font-semibold text-ink">{hotel.name}</h2>
          <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">{hotel.summary}</p>

          <div className="mt-5">
            <RoomTierTable hotel={hotel} />
          </div>

          <ul className="mt-5 grid grid-cols-1 gap-2 text-xs text-ink sm:grid-cols-2">
            {hotel.highlights.map((highlight) => (
              <li key={highlight} className="flex items-center gap-2">
                <Icon name="check" className="h-3.5 w-3.5 shrink-0 text-accent" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-5">
          <p className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-muted">
            <span>
              Check-in <strong className="font-mono font-medium text-ink">{hotel.checkInTime}</strong>
            </span>
            <span>
              Check-out <strong className="font-mono font-medium text-ink">{hotel.checkOutTime}</strong>
            </span>
            <span className="font-mono">Rates on request</span>
          </p>
          <ArrowLink href="/contact">Ask about stays</ArrowLink>
        </div>
      </div>
    </article>
  );
}
