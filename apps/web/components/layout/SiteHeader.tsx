import Link from 'next/link';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { PrimaryNav } from '@/components/layout/PrimaryNav';
import { BagButton } from '@/components/store/cart/BagButton';
import { DEMO_NOTICE, PRIMARY_NAV, SITE } from '@/lib/site';

/**
 * Strict three-zone header from the design: wordmark — single-line navigation — one primary action
 * ("Bag (N)", which opens the cart drawer).
 */
export function SiteHeader() {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-sm bg-ink px-4 py-2 text-xs font-semibold text-canvas focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <p className="bg-ink px-4 py-2 text-center text-caption text-canvas/85 sm:text-xs">{DEMO_NOTICE}</p>

      <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/95 backdrop-blur-sm">
        <div className="relative mx-auto flex h-16 max-w-site items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="shrink-0 whitespace-nowrap font-display text-2xl font-semibold tracking-tight text-ink transition-colors hover:text-accent"
          >
            {SITE.shortName}
            <span className="sr-only"> — home</span>
          </Link>

          <PrimaryNav items={PRIMARY_NAV} />

          <div className="flex shrink-0 items-center gap-3">
            <BagButton />
            <MobileMenu items={PRIMARY_NAV} />
          </div>
        </div>
      </header>
    </>
  );
}
