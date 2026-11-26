import { MobileMenu } from '@/components/layout/MobileMenu';
import { PrimaryNav } from '@/components/layout/PrimaryNav';
import { Wordmark } from '@/components/layout/Wordmark';
import { BagButton } from '@/components/store/cart/BagButton';
import { DEMO_NOTICE, PRIMARY_NAV } from '@/lib/site';

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

      {/* Primary demonstration disclosure: present on every page, deliberately quiet. */}
      <p className="border-b border-hairline bg-surface px-4 py-1.5 text-center text-caption tracking-wide text-ink-muted">
        <span className="mr-1.5 font-semibold uppercase tracking-[0.18em] text-accent">Preview</span>
        {DEMO_NOTICE}
      </p>

      <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/95 backdrop-blur-sm">
        <div className="relative mx-auto flex h-[4.25rem] max-w-site items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          <Wordmark />

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
