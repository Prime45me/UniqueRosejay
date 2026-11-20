import Link from 'next/link';
import { SpatialMetrics } from '@/components/stays/ApartmentCard';
import { RoomTierTable } from '@/components/stays/HotelCard';
import { Swatches } from '@/components/store/ProductCard';
import { ArrowLink, ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Media } from '@/components/ui/Media';
import { DemoLabel } from '@/components/ui/Notice';
import { Kicker, SectionHeader } from '@/components/ui/Typography';
import { getDemoApartments, getDemoHotels, getDemoProducts } from '@/lib/content';
import { IMAGES } from '@/lib/demo/images';
import type { DemoProduct } from '@/lib/types';

const VERTICALS: { index: string; icon: IconName; title: string; copy: string; href: string; cta: string }[] = [
  {
    index: '01',
    icon: 'bag',
    title: 'Store',
    copy: 'A broad, growing catalogue: clothing and dresses, bags and shoes, wigs, ice chests, refrigerators and washing machines.',
    href: '/store',
    cta: 'Enter the Store'
  },
  {
    index: '02',
    icon: 'bed',
    title: 'Hotels',
    copy: 'Hotel listings presented through their architecture, with clear room tiers and request-based stays.',
    href: '/hotels',
    cta: 'Discover Hotels'
  },
  {
    index: '03',
    icon: 'building',
    title: 'Apartments',
    copy: 'Residences described by layout, floor area, furnishing and utilities, for a range of stay arrangements.',
    href: '/apartments',
    cta: 'Explore Apartments'
  }
];

function FeatureCard({ product, image, href }: { product: DemoProduct; image: (typeof IMAGES)[keyof typeof IMAGES]; href: string }) {
  return (
    <Link
      href={href}
      className="group grid grid-cols-1 overflow-hidden rounded-sm border border-hairline bg-surface-elevated transition-all hover:-translate-y-0.5 hover:shadow-md sm:grid-cols-12"
    >
      <Media
        image={image}
        frameClassName="aspect-landscape sm:col-span-5 sm:aspect-auto sm:min-h-[16rem]"
        sizes="(min-width: 1024px) 260px, (min-width: 640px) 40vw, 100vw"
        imageClassName="transition-transform duration-300 group-hover:scale-[1.03]"
      />
      <div className="flex flex-col justify-between p-6 sm:col-span-7">
        <div>
          <DemoLabel>Demonstration item</DemoLabel>
          <h3 className="mt-2 font-display text-2xl font-semibold text-ink">{product.name}</h3>
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">{product.shortDescription}</p>
          {product.swatches ? (
            <div className="mt-4">
              <Swatches swatches={product.swatches} caption={product.sizes ? product.sizes.join(' · ') : undefined} />
            </div>
          ) : null}
        </div>
        <span className="mt-4 inline-flex items-center gap-1.5 border-t border-hairline pt-3 text-xs font-semibold text-accent">
          View category <Icon name="arrow-right" className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const [products, hotels, apartments] = await Promise.all([getDemoProducts(), getDemoHotels(), getDemoApartments()]);

  const dress = products.find((p) => p.categorySlug === 'dresses-clothing');
  const wig = products.find((p) => p.categorySlug === 'wigs');
  const bag = products.find((p) => p.categorySlug === 'bags-shoes');
  const appliances = products.filter((p) => p.presentationMode === 'appliance');
  const hotel = hotels[0];
  const apartment = apartments[0];

  return (
    <>
      {/* 1 · Split editorial hero */}
      <Container as="section" className="pb-12 pt-8 lg:pb-16 lg:pt-12">
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col justify-between py-2 lg:col-span-5 lg:py-4">
            <div>
              <Kicker>Unique RoseJay Enterprises</Kicker>
              <h1 className="mt-4 text-5xl font-semibold leading-[1.04] tracking-tight text-ink sm:text-6xl lg:text-[4rem]">
                Shop. Hotels. Apartments.
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-ink-muted">
                One website for URJ&rsquo;s three business areas: a broad Store, hotel listings and apartment residences,
                brought together under centralised administration.
              </p>
            </div>
            <div className="mt-8 space-y-5 border-t border-hairline pt-8">
              <div className="flex flex-wrap items-center gap-3">
                <ButtonLink href="/store" arrow>
                  Explore the Store
                </ButtonLink>
                <ButtonLink href="/hotels" variant="secondary">
                  Discover Stays
                </ButtonLink>
              </div>
              <p className="text-xs text-ink-subtle">
                Each business area has its own visual language, within one shared URJ identity.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Media
              image={IMAGES.heroLifestyle}
              frameClassName="h-72 rounded-sm border border-hairline sm:h-96 lg:h-full lg:min-h-[440px]"
              sizes="(min-width: 1280px) 760px, (min-width: 1024px) 58vw, 100vw"
              priority
            >
              <span className="absolute bottom-3 right-3 rounded-sm bg-canvas/90 px-2 py-1">
                <DemoLabel>Demonstration image</DemoLabel>
              </span>
            </Media>
          </div>
        </div>
      </Container>

      {/* 2 · Three business areas */}
      <section aria-label="URJ business areas" className="border-y border-hairline bg-surface-elevated">
        <Container>
          <ul className="grid grid-cols-1 divide-y divide-hairline md:grid-cols-3 md:divide-x md:divide-y-0">
            {VERTICALS.map((vertical, index) => (
              <li
                key={vertical.title}
                className={`flex flex-col justify-between py-8 ${index === 0 ? 'md:pr-8' : index === 1 ? 'md:px-8' : 'md:pl-8'}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-accent">{vertical.index}</span>
                    <Icon name={vertical.icon} className="h-4 w-4 text-ink-muted" />
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold text-ink">{vertical.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{vertical.copy}</p>
                </div>
                <ArrowLink href={vertical.href} className="mt-5">
                  {vertical.cta}
                </ArrowLink>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 3 · Chapter 01 — Fashion & Beauty */}
      <Container as="section" className="py-16 lg:py-20">
        <SectionHeader
          kicker="Chapter 01 · Fashion & Beauty"
          title="Silhouettes, Leather Goods & Beauty"
          action={<ArrowLink href="/store?category=dresses-clothing">Shop Fashion &amp; Beauty</ArrowLink>}
        />

        <div className="mt-8 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12 lg:gap-8">
          {dress ? (
            <Link
              href="/store?category=dresses-clothing"
              className="group relative overflow-hidden rounded-sm border border-hairline lg:col-span-6"
            >
              <Media
                image={IMAGES.editorialFashionLookbook}
                frameClassName="h-full min-h-[460px] lg:min-h-[600px]"
                sizes="(min-width: 1024px) 600px, 100vw"
                imageClassName="transition-transform duration-500 group-hover:scale-[1.02]"
              >
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-6 text-canvas sm:p-8">
                  <Kicker tone="light">{dress.editorialNote}</Kicker>
                  <h3 className="mt-1.5 font-display text-2xl font-semibold leading-tight sm:text-3xl">{dress.name}</h3>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                    <span className="text-xs text-white/85">
                      Sizes {dress.sizes?.join(' / ')} · <span className="text-accent-light">Demonstration item</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-light group-hover:underline">
                      Clothing &amp; Dresses <Icon name="arrow-right" className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Media>
            </Link>
          ) : null}

          <div className="grid grid-cols-1 gap-6 lg:col-span-6 lg:gap-8">
            {wig ? <FeatureCard product={wig} image={IMAGES.storeWig} href="/store?category=wigs" /> : null}
            {bag ? <FeatureCard product={bag} image={IMAGES.storeBagAndMules} href="/store?category=bags-shoes" /> : null}
          </div>
        </div>
      </Container>

      {/* 4 · Chapter 02 — Home & Cooling Appliances */}
      <section className="border-y border-hairline bg-surface py-16 lg:py-20">
        <Container>
          <div className="grid grid-cols-1 items-center gap-8 border-b border-hairline pb-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Kicker>Chapter 02 · Home &amp; Cooling Appliances</Kicker>
              <h2 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">Refrigerators, Washers &amp; Ice Chests</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                Appliances are presented with engineering clarity: capacity, dimensions and key specifications up
                front, in a calm showroom setting.
              </p>
              <ButtonLink href="/store?category=refrigerators" arrow className="mt-6">
                Browse the Showroom
              </ButtonLink>
            </div>
            <Media
              image={IMAGES.editorialApplianceShowroom}
              frameClassName="aspect-wide rounded-sm border border-hairline bg-surface-elevated lg:col-span-7"
              sizes="(min-width: 1024px) 700px, 100vw"
            />
          </div>

          <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {appliances.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/store?category=${item.categorySlug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-sm border border-hairline bg-surface-elevated transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Media
                    image={item.images[0]}
                    frameClassName="aspect-landscape border-b border-hairline"
                    sizes="(min-width: 768px) 33vw, 100vw"
                    imageClassName="transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="flex items-center justify-between font-mono text-caption text-ink-subtle">
                        <DemoLabel>Demonstration item</DemoLabel>
                        <span>{item.reference}</span>
                      </div>
                      <h3 className="mt-2 text-base font-semibold text-ink">{item.name}</h3>
                      {item.highlightSpec ? (
                        <p className="mt-2 rounded-sm border border-hairline bg-canvas px-2.5 py-1.5 font-mono text-caption text-ink">
                          {item.highlightSpec}
                        </p>
                      ) : null}
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1.5 border-t border-hairline pt-3 text-xs font-semibold text-accent">
                      View specifications <Icon name="arrow-right" className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 5 · Chapter 03 — Hotels & Apartments diptych */}
      <Container as="section" className="py-16 lg:py-20">
        <div className="max-w-2xl pb-10">
          <Kicker>Chapter 03 · Hotels &amp; Apartments</Kicker>
          <h2 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">Evening Hotels &amp; Sunlit Residences</h2>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {hotel ? (
            <article className="flex flex-col overflow-hidden rounded-sm border border-hairline bg-surface-elevated">
              <Media image={hotel.images[0]} frameClassName="aspect-wide" sizes="(min-width: 1024px) 600px, 100vw">
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-5 text-canvas">
                  <Kicker tone="light">Hotels · Demonstration listing</Kicker>
                  <h3 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">{hotel.name}</h3>
                </div>
              </Media>
              <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
                <div>
                  <p className="text-sm leading-relaxed text-ink-muted">{hotel.summary}</p>
                  <div className="mt-5">
                    <RoomTierTable hotel={hotel} />
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-5">
                  <span className="text-xs text-ink-muted">Request-based stays · Rates on request</span>
                  <ButtonLink href="/hotels" arrow className="min-h-[40px] px-4">
                    Explore Hotels
                  </ButtonLink>
                </div>
              </div>
            </article>
          ) : null}

          {apartment ? (
            <article className="flex flex-col overflow-hidden rounded-sm border border-hairline bg-surface-elevated">
              <Media image={apartment.images[0]} frameClassName="aspect-wide" sizes="(min-width: 1024px) 600px, 100vw">
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-5 text-canvas">
                  <Kicker tone="light">Apartments · Demonstration listing</Kicker>
                  <h3 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">{apartment.name}</h3>
                </div>
              </Media>
              <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
                <div>
                  <p className="text-sm leading-relaxed text-ink-muted">{apartment.summary}</p>
                  <div className="mt-5">
                    <SpatialMetrics apartment={apartment} />
                  </div>
                  <ul className="mt-4 space-y-1.5 text-xs text-ink-muted">
                    {apartment.amenities.slice(0, 2).map((amenity) => (
                      <li key={amenity} className="flex items-center gap-2">
                        <Icon name="check" className="h-3.5 w-3.5 text-accent" />
                        <span>{amenity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-5">
                  <span className="text-xs text-ink-muted">Arrangements and rates to be confirmed</span>
                  <ButtonLink href="/apartments" variant="outline" arrow className="min-h-[40px] px-4">
                    Explore Apartments
                  </ButtonLink>
                </div>
              </div>
            </article>
          ) : null}
        </div>
      </Container>
    </>
  );
}
