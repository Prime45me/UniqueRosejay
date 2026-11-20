import type { Metadata } from 'next';
import { HotelCard } from '@/components/stays/HotelCard';
import { Container } from '@/components/ui/Container';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Media } from '@/components/ui/Media';
import { DemoLabel, NoticePanel } from '@/components/ui/Notice';
import { Kicker, SectionHeader } from '@/components/ui/Typography';
import { getDemoHotels } from '@/lib/content';
import { IMAGES } from '@/lib/demo/images';

export const metadata: Metadata = {
  title: 'Hotels',
  description: 'Hotel listings presented through URJ, with clear room tiers and request-based stays.'
};

const HOW_IT_WILL_WORK: { icon: IconName; title: string; copy: string }[] = [
  { icon: 'bed', title: 'Compare room tiers', copy: 'Each listing sets out room sizes, bed configurations and guest limits.' },
  { icon: 'clock', title: 'Send a stay request', copy: 'Guests will choose dates and a room tier, then submit a request.' },
  { icon: 'check', title: 'Reviewed before confirmation', copy: 'Requests will be reviewed before any stay is confirmed.' }
];

export default async function HotelsPage() {
  const hotels = await getDemoHotels();

  return (
    <Container className="py-10 lg:py-14">
      {/* Twilight arrival banner */}
      <div className="relative overflow-hidden rounded-sm border border-hairline bg-ink">
        <Media
          image={IMAGES.hotelExteriorEvening}
          frameClassName="min-h-[300px] sm:min-h-[380px] lg:min-h-[440px]"
          sizes="(min-width: 1280px) 1216px, 100vw"
          priority
          imageClassName="opacity-90"
        >
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-6 text-canvas sm:p-10">
            <Kicker tone="light">URJ Hotels</Kicker>
            <h1 className="mt-2 max-w-3xl text-4xl font-semibold sm:text-5xl">Quiet Architecture &amp; Tailored Stays</h1>
            <p className="mt-3 max-w-xl text-sm text-white/85">
              Browse hotel listings, compare room tiers and, in a later phase, send date-specific stay requests.
            </p>
            <div className="mt-4">
              <DemoLabel tone="light">Demonstration image and listings</DemoLabel>
            </div>
          </div>
        </Media>
      </div>

      {/* Where the prototype placed its date / guest search bar */}
      <NoticePanel title="Availability and reservations are not yet open" className="mt-8">
        This page previews the hotel experience. It does not check availability, show rates or take reservations.
        Listings below are demonstration content and do not represent actual URJ properties.
      </NoticePanel>

      <section aria-labelledby="hotel-listings" className="mt-12">
        <SectionHeader kicker="Listings" title={<span id="hotel-listings">Featured Hotels</span>} />
        <div className="mt-8 space-y-8">
          {hotels.map((hotel, index) => (
            <HotelCard key={hotel.slug} hotel={hotel} priority={index === 0} />
          ))}
        </div>
      </section>

      <section aria-labelledby="hotel-process" className="mt-16 rounded-sm border border-hairline bg-surface p-6 sm:p-10">
        <Kicker>How hotel stays will work</Kicker>
        <h2 id="hotel-process" className="mt-2 text-3xl font-semibold text-ink">
          Request-based, reviewed stays
        </h2>
        <ol className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          {HOW_IT_WILL_WORK.map((step, index) => (
            <li key={step.title}>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-accent">0{index + 1}</span>
                <Icon name={step.icon} className="h-4 w-4 text-ink-muted" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-ink">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{step.copy}</p>
            </li>
          ))}
        </ol>
      </section>
    </Container>
  );
}
