'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { CartRequestError, useCart } from '@/components/store/cart/CartProvider';
import { Icon } from '@/components/ui/Icon';
import { formatMoney, optionLabel, STOCK_LABEL } from '@/lib/store/format';
import type { CartIssue, CartItem } from '@/lib/store/types';

const ISSUE_TEXT: Record<CartIssue, string> = {
  unavailable: 'No longer available. Please remove it.',
  out_of_stock: 'Now out of stock. Remove it or choose another option.',
  insufficient_stock: 'Fewer units are available than requested. Reduce the quantity.',
  currency_mismatch: 'Priced in a different currency from the rest of your bag.'
};

/** One bag line: image, options (switchable), quantity stepper, remove, server-computed total. */
export function CartLine({ item, compact = false, readOnly = false }: { item: CartItem; compact?: boolean; readOnly?: boolean }) {
  const { updateItem, removeItem, close } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (caught) {
      setError(caught instanceof CartRequestError ? caught.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const hasChoices = item.options.length > 0 && item.variantChoices.length > 1;
  const portrait = item.product.presentationMode === 'fashion' || item.product.presentationMode === 'beauty';

  return (
    <li className={`flex gap-4 py-5 ${busy ? 'opacity-60' : ''}`} aria-busy={busy}>
      <div className={`relative shrink-0 overflow-hidden rounded-sm border border-hairline bg-surface ${portrait ? 'h-28 w-[5.25rem]' : 'h-20 w-28'}`}>
        {item.image ? (
          <Image
            src={item.image.src}
            alt={item.image.alt}
            fill
            sizes="120px"
            className="object-cover"
            style={item.image.focalPoint ? { objectPosition: item.image.focalPoint } : undefined}
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-ink-subtle">
            <Icon name="image" className="h-5 w-5" />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/store/${item.product.slug}`}
              onClick={close}
              className="block text-sm font-semibold leading-snug text-ink hover:text-accent"
            >
              {item.product.name}
            </Link>
            {!hasChoices || readOnly ? (
              <p className="mt-0.5 text-xs text-ink-muted">{optionLabel(item.variant.optionValues, item.options) || 'Standard'}</p>
            ) : null}
            <p className="mt-0.5 font-mono text-caption text-ink-subtle">{item.variant.sku}</p>
          </div>
          <p className="shrink-0 font-mono text-sm font-medium tabular-nums text-ink">{formatMoney(item.lineTotal)}</p>
        </div>

        {hasChoices && !readOnly ? (
          <label className="mt-2 block">
            <span className="sr-only">Option for {item.product.name}</span>
            <select
              value={item.variant.id}
              disabled={busy}
              onChange={(event) => run(() => updateItem(item.id, { variantId: event.target.value }))}
              className="w-full max-w-[16rem] rounded-sm border border-hairline bg-canvas px-2.5 py-1.5 text-xs text-ink"
            >
              {item.variantChoices.map((choice) => (
                <option key={choice.id} value={choice.id} disabled={choice.stockStatus === 'out_of_stock' && choice.id !== item.variant.id}>
                  {optionLabel(choice.optionValues, item.options)}
                  {choice.stockStatus === 'out_of_stock' ? ` — ${STOCK_LABEL.out_of_stock}` : ''}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="mt-3 flex items-center justify-between gap-3">
          {readOnly ? (
            <p className="text-xs text-ink-muted">
              Qty <span className="font-mono tabular-nums text-ink">{item.quantity}</span> ·{' '}
              <span className="font-mono tabular-nums">{formatMoney(item.unitPrice)}</span> each
            </p>
          ) : (
            <div className="inline-flex items-center rounded-sm border border-hairline bg-canvas" role="group" aria-label={`Quantity for ${item.product.name}`}>
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={busy || item.quantity <= 1}
                onClick={() => run(() => updateItem(item.id, { quantity: item.quantity - 1 }))}
                className="inline-flex h-9 w-9 items-center justify-center text-ink-muted hover:text-ink disabled:opacity-40"
              >
                <Icon name="minus" className="h-3.5 w-3.5" />
              </button>
              <span className="w-8 text-center font-mono text-xs tabular-nums text-ink" aria-live="polite">
                {item.quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={busy || item.quantity >= item.maxQuantity}
                onClick={() => run(() => updateItem(item.id, { quantity: item.quantity + 1 }))}
                className="inline-flex h-9 w-9 items-center justify-center text-ink-muted hover:text-ink disabled:opacity-40"
              >
                <Icon name="plus" className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          {!readOnly ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => removeItem(item.id))}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-status-negative disabled:opacity-40"
            >
              <Icon name="trash" className="h-3.5 w-3.5" />
              Remove
            </button>
          ) : null}
        </div>

        {!compact && item.product.isDemo ? <p className="mt-2 text-caption text-status-pending">Demonstration item</p> : null}
        {item.issues.map((issue) => (
          <p key={issue} className="mt-2 flex items-start gap-1.5 text-xs text-status-negative">
            <Icon name="alert" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {ISSUE_TEXT[issue]}
          </p>
        ))}
        {error ? (
          <p role="alert" className="mt-2 text-xs text-status-negative">
            {error}
          </p>
        ) : null}
      </div>
    </li>
  );
}
