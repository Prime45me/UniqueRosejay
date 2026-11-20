import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Media } from '@/components/ui/Media';
import { DemoLabel } from '@/components/ui/Notice';
import { Kicker } from '@/components/ui/Typography';
import { IMAGES } from '@/lib/demo/images';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description: `${SITE.name} (${SITE.abbreviation}): one website for the URJ Store, Hotels and Apartments.`
};

/* Copy is limited to client-confirmed facts (docs/ASSUMPTIONS.md): business name, one website with
   distinct sections, centralised administration, international intent, broad Store scope. */
const PILLARS = [
  {
    index: '01',
    title: 'A Broad Store',
    copy: 'A catalogue built to carry very different goods: clothing, dresses, bags, shoes and wigs alongside ice chests, refrigerators and washing machines, with room for future categories.'
  },
  {
    index: '02',
    title: 'Hotels',
    copy: 'A dedicated section for hotel listings, designed around clear room information and request-based stays.'
  },
  {
    index: '03',
    title: 'Apartments',
    copy: 'A dedicated section for residences, designed to describe layout, space, furnishing and terms plainly.'
  }
];

export default function AboutPage() {
  return (
    <Container className="space-y-16 py-12 lg:py-16">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Kicker>About {SITE.abbreviation}</Kicker>
          <h1 className="mt-2 text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            One Enterprise Across Retail &amp; Hospitality
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            {SITE.name} ({SITE.abbreviation}) brings three business areas, a Store, Hotels and Apartments, together on one
            website, managed through one centralised administration.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            Rather than separate websites for retail and hospitality, URJ offers a single front door with a shared
            identity, while giving each business area its own clear presentation. The business intends to serve
            customers internationally.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/store">Visit the Store</ButtonLink>
            <ButtonLink href="/contact" variant="secondary">
              Contact URJ
            </ButtonLink>
          </div>
        </div>

        <figure className="lg:col-span-6">
          <Media
            image={IMAGES.hotelExteriorEvening}
            frameClassName="aspect-[16/10] rounded-sm border border-hairline"
            sizes="(min-width: 1024px) 600px, 100vw"
            priority
          />
          <figcaption className="mt-2">
            <DemoLabel>Demonstration image — not a URJ property</DemoLabel>
          </figcaption>
        </figure>
      </div>

      <section aria-labelledby="about-pillars" className="border-t border-hairline pt-10">
        <h2 id="about-pillars" className="sr-only">
          URJ business areas
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {PILLARS.map((pillar) => (
            <div key={pillar.index}>
              <span className="font-mono text-xs text-accent">{pillar.index}</span>
              <h3 className="mt-2 font-display text-2xl font-semibold text-ink">{pillar.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{pillar.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="about-administration"
        className="grid grid-cols-1 gap-6 rounded-sm bg-ink p-8 text-canvas sm:p-12 lg:grid-cols-12 lg:items-center"
      >
        <div className="lg:col-span-8">
          <Kicker tone="light">Centralised administration</Kicker>
          <h2 id="about-administration" className="mt-2 text-3xl font-semibold sm:text-4xl">
            One business, managed as one.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80">
            Store, Hotels and Apartments are administered centrally by URJ. Company details such as offices, contact
            channels and operating markets will be published here once confirmed.
          </p>
        </div>
        <div className="lg:col-span-4 lg:text-right">
          <ButtonLink href="/contact" variant="inverse" arrow>
            Get in touch
          </ButtonLink>
        </div>
      </section>
    </Container>
  );
}
