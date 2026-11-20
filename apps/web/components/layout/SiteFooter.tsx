import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { getStoreCategories } from '@/lib/content';
import { CONTACT_PLACEHOLDERS, SITE } from '@/lib/site';

const linkClass = 'text-ink transition-colors hover:text-accent';

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="font-sans text-kicker font-semibold uppercase text-ink-muted">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={linkClass}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Four-column footer. Links only to routes that exist in Phase 2 (no account/admin/cart links). */
export async function SiteFooter() {
  const categories = await getStoreCategories();

  return (
    <footer className="border-t border-hairline bg-surface text-ink">
      <Container className="py-14">
        <div className="grid grid-cols-1 gap-10 border-b border-hairline pb-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-2xl font-semibold tracking-tight">{SITE.name}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
              One website for the URJ Store, Hotels and Apartments, under centralised administration.
            </p>
            <p className="mt-4 text-xs text-ink-subtle">Location: {CONTACT_PLACEHOLDERS.location}</p>
          </div>

          <FooterColumn
            title="Store"
            links={[
              { label: 'All categories', href: '/store' },
              ...categories.map((category) => ({ label: category.name, href: `/store?category=${category.slug}` }))
            ]}
          />

          <FooterColumn
            title="Hotels & Apartments"
            links={[
              { label: 'Hotels', href: '/hotels' },
              { label: 'Apartments', href: '/apartments' }
            ]}
          />

          <FooterColumn
            title="Company"
            links={[
              { label: `About ${SITE.abbreviation}`, href: '/about' },
              { label: 'Contact', href: '/contact' }
            ]}
          />
        </div>

        <div className="flex flex-col items-start justify-between gap-4 pt-8 text-xs text-ink-muted sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {SITE.name} ({SITE.abbreviation}).
          </p>
          <p>Demonstration content and placeholders are used where business details are pending confirmation.</p>
        </div>
      </Container>
    </footer>
  );
}
