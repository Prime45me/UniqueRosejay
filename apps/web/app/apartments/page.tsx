import type { Metadata } from 'next';
import { ApartmentCard } from '@/components/stays/ApartmentCard';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { FilterTabs } from '@/components/ui/FilterTabs';
import { Icon } from '@/components/ui/Icon';
import { Media } from '@/components/ui/Media';
import { NoticePanel } from '@/components/ui/Notice';
import { Kicker } from '@/components/ui/Typography';
import { getApartmentArrangements, getDemoApartments, isApartmentArrangement } from '@/lib/content';
import { IMAGES } from '@/lib/demo/images';

export const metadata: Metadata = {
  title: 'Apartments',
  description: 'Apartment residences described by layout, floor area, furnishing and utilities.'
};

interface ApartmentsPageProps {
  searchParams: Promise<{ arrangement?: string | string[] }>;
}

export default async function ApartmentsPage({ searchParams }: ApartmentsPageProps) {
  const params = await searchParams;
  const requested = Array.isArray(params.arrangement) ? params.arrangement[0] : params.arrangement;
  const active = isApartmentArrangement(requested) ? requested : undefined;

  const [arrangements, apartments] = await Promise.all([getApartmentArrangements(), getDemoApartments(active)]);
  const labelFor = (id: string) => arrangements.find((arrangement) => arrangement.id === id)?.label ?? id;

  const tabs = [
    { label: 'All arrangements', href: '/apartments', active: !active },
    ...arrangements.map((arrangement) => ({
      label: arrangement.label,
      href: `/apartments?arrangement=${arrangement.id}`,
      active: arrangement.id === active
    }))
  ];

  return (
    <Container className="py-10 lg:py-14">
      {/* Daylight residential banner */}
      <div className="grid grid-cols-1 items-stretch overflow-hidden rounded-sm border border-hairline bg-surface-elevated lg:grid-cols-12">
        <div className="flex flex-col justify-center p-6 sm:p-10 lg:col-span-5">
          <Kicker>URJ Apartments</Kicker>
          <h1 className="mt-2 text-4xl font-semibold text-ink sm:text-5xl">Residences, Clearly Described</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Compare layouts, floor area, furnishing and utilities at a glance. Rental terms are set out in a simple
            ledger.
          </p>
        </div>
        <Media
          image={IMAGES.apartmentLivingSkyline}
          frameClassName="h-60 sm:h-80 lg:col-span-7 lg:h-auto lg:min-h-[22rem]"
          sizes="(min-width: 1024px) 720px, 100vw"
          priority
        />
      </div>

      <div className="mt-8 border-b border-hairline pb-6">
        <FilterTabs label="Rental arrangements" tabs={tabs} />
        <p className="mt-3 text-xs text-ink-subtle">
          Arrangement types are illustrative. Which rental arrangements URJ will offer is still being confirmed.
        </p>
      </div>

      <NoticePanel title="Apartment inquiries are not yet open" className="mt-6">
        This page previews the apartments experience. It does not check availability, quote rates or accept
        inquiries. Listings are demonstration content and do not represent actual URJ residences.
      </NoticePanel>

      {apartments.length === 0 ? (
        <div className="mt-8 rounded-sm border border-hairline bg-surface-elevated p-12 text-center">
          <Icon name="building" className="mx-auto mb-3 h-8 w-8 text-accent/70" />
          <p className="text-base font-semibold text-ink">No demonstration residences for this arrangement</p>
          <p className="mt-1 text-sm text-ink-muted">Try another arrangement, or view all residences.</p>
          <ButtonLink href="/apartments" className="mt-5">
            Show all arrangements
          </ButtonLink>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {apartments.map((apartment) => (
            <ApartmentCard key={apartment.slug} apartment={apartment} arrangementLabel={labelFor(apartment.arrangement)} />
          ))}
        </div>
      )}
    </Container>
  );
}
