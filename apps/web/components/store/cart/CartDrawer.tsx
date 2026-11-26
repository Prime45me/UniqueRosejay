'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { CartLine } from '@/components/store/cart/CartLine';
import { useCart } from '@/components/store/cart/CartProvider';
import { buttonClasses } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { formatMoney } from '@/lib/store/format';

/**
 * Slide-over bag. Modal dialog semantics: focus moves in on open, Tab is contained, Escape and the
 * backdrop close it, focus returns to the opener, and page scroll is locked while open.
 */
export function CartDrawer() {
  const { cart, status, isOpen, close, refresh } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!isOpen) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    void refresh(); // re-validate prices and stock whenever the bag is opened
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), select:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreRef.current?.focus?.();
    };
  }, [isOpen, close, refresh]);

  if (!isOpen) return null;

  const items = cart?.items ?? [];

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Close bag" tabIndex={-1} onClick={close} className="absolute inset-0 h-full w-full bg-ink/40 animate-[fadeIn_200ms_ease-out]" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-hairline bg-canvas shadow-2xl outline-none animate-[slideIn_260ms_cubic-bezier(0.2,0.8,0.2,1)]"
      >
        <div className="flex items-center justify-between border-b border-hairline px-6 py-5">
          <h2 id="cart-title" className="font-display text-2xl font-semibold text-ink">
            Your bag
            {cart?.itemCount ? <span className="ml-2 font-sans text-sm font-normal text-ink-muted">({cart.itemCount})</span> : null}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close bag"
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-hairline text-ink hover:bg-surface"
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {status === 'loading' && !cart ? (
            <div className="space-y-4 py-6" aria-label="Loading bag">
              {[0, 1].map((index) => (
                <div key={index} className="flex animate-pulse gap-4">
                  <div className="h-24 w-20 rounded-sm bg-surface" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 w-3/4 rounded-sm bg-surface" />
                    <div className="h-3 w-1/2 rounded-sm bg-surface" />
                  </div>
                </div>
              ))}
            </div>
          ) : status === 'error' && !cart ? (
            <div className="py-16 text-center">
              <Icon name="alert" className="mx-auto h-6 w-6 text-status-negative" />
              <p className="mt-3 text-sm font-semibold text-ink">We couldn&rsquo;t load your bag</p>
              <button type="button" onClick={() => void refresh()} className={buttonClasses('secondary', 'mt-5')}>
                Try again
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center">
              <Icon name="bag" className="mx-auto h-7 w-7 text-accent" />
              <p className="mt-4 font-display text-2xl font-semibold text-ink">Your bag is empty</p>
              <p className="mx-auto mt-2 max-w-xs text-sm text-ink-muted">Pieces you add from the Store will appear here.</p>
              <Link href="/store" onClick={close} className={buttonClasses('primary', 'mt-6')}>
                Browse the Store
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-hairline">
              {items.map((item) => (
                <CartLine key={item.id} item={item} compact />
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <div className="border-t border-hairline bg-surface-elevated px-6 py-5">
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-muted">Subtotal</dt>
                <dd className="font-mono font-medium tabular-nums text-ink">{formatMoney(cart?.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-xs">
                <dt className="text-ink-muted">Delivery or collection, taxes</dt>
                <dd className="text-ink-muted">Confirmed after review</dd>
              </div>
            </dl>
            {cart && !cart.canCheckout ? (
              <p role="alert" className="mt-3 flex items-start gap-1.5 text-xs text-status-negative">
                <Icon name="alert" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Resolve the highlighted items before checking out.
              </p>
            ) : null}
            {cart?.canCheckout ? (
              <Link href="/store/checkout" onClick={close} className={buttonClasses('primary', 'mt-4 w-full')}>
                Continue to checkout
              </Link>
            ) : (
              <span aria-disabled="true" className={buttonClasses('primary', 'mt-4 w-full cursor-not-allowed opacity-40')}>
                Continue to checkout
              </span>
            )}
            <p className="mt-3 text-center text-caption text-ink-subtle">No payment is taken at checkout.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
