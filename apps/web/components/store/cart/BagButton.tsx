'use client';

import { useCart } from '@/components/store/cart/CartProvider';
import { Icon } from '@/components/ui/Icon';

/** The header's primary action (design: "Bag (N)"). Opens the cart drawer. */
export function BagButton() {
  const { cart, status, open, isOpen } = useCart();
  const count = cart?.itemCount ?? 0;

  return (
    <button
      type="button"
      onClick={open}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-label={status === 'loading' ? 'Open bag' : `Open bag, ${count} ${count === 1 ? 'item' : 'items'}`}
      className="inline-flex min-h-[40px] shrink-0 items-center gap-2 whitespace-nowrap rounded-sm bg-ink px-4 text-xs font-semibold tracking-wide text-canvas transition-colors hover:bg-ink-hover"
    >
      <Icon name="bag" className="h-3.5 w-3.5" />
      <span className="tabular-nums">Bag ({status === 'loading' ? '·' : count})</span>
    </button>
  );
}
