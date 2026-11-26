'use client';

import { useMemo, useState } from 'react';
import { CartRequestError, useCart } from '@/components/store/cart/CartProvider';
import { StockLabel } from '@/components/store/StockLabel';
import { Icon } from '@/components/ui/Icon';
import { formatMoney } from '@/lib/store/format';
import type { OptionDefinition, ProductVariant } from '@/lib/store/types';

/**
 * Category-aware option picker. Each option (size, colour, shade, length, finish…) comes from the
 * product's own option definitions, so clothing, wigs and appliances each show only what applies.
 * The exact variant is resolved from the selections; its price and availability come from the API.
 */
export function PurchasePanel({
  options,
  variants,
  productName,
  isDemo
}: {
  options: OptionDefinition[];
  variants: ProductVariant[];
  productName: string;
  isDemo: boolean;
}) {
  const { addItem, open } = useCart();
  const initial = variants.find((variant) => variant.stockStatus !== 'out_of_stock') ?? variants[0];
  const [selected, setSelected] = useState<Record<string, string>>(initial?.optionValues ?? {});
  const [quantity, setQuantity] = useState(1);
  const [state, setState] = useState<{ kind: 'idle' | 'busy' | 'added' | 'error'; message?: string }>({ kind: 'idle' });

  const variant = useMemo(
    () => variants.find((candidate) => options.every((option) => candidate.optionValues[option.key] === selected[option.key])),
    [variants, options, selected]
  );

  /** A value is selectable if some in-stock variant has it, given the other current selections. */
  const availability = (key: string, value: string) => {
    const matches = variants.filter(
      (candidate) =>
        candidate.optionValues[key] === value &&
        options.every((option) => option.key === key || !selected[option.key] || candidate.optionValues[option.key] === selected[option.key])
    );
    if (matches.length === 0) return 'none';
    return matches.some((candidate) => candidate.stockStatus !== 'out_of_stock') ? 'available' : 'sold_out';
  };

  const choose = (key: string, value: string) => {
    setSelected((current) => ({ ...current, [key]: value }));
    setQuantity(1);
    setState({ kind: 'idle' });
  };

  const maxQuantity = variant?.maxQuantity ?? 0;
  const purchasable = Boolean(variant && variant.stockStatus !== 'out_of_stock' && maxQuantity > 0);

  const add = async () => {
    if (!variant || !purchasable) return;
    setState({ kind: 'busy' });
    try {
      await addItem(variant.id, quantity);
      setState({ kind: 'added', message: `${productName} added to your bag.` });
      open();
    } catch (error) {
      setState({ kind: 'error', message: error instanceof CartRequestError ? error.message : 'Could not add to your bag. Please try again.' });
    }
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-4 border-b border-hairline pb-5">
        <div>
          <p className="font-mono text-2xl font-medium tabular-nums text-ink" aria-live="polite">
            {variant ? formatMoney(variant.price) : '—'}
          </p>
          <p className={`mt-1 text-caption ${isDemo ? 'text-status-pending' : 'text-ink-subtle'}`}>
            {isDemo ? 'Demonstration price · ' : ''}Delivery, collection and taxes confirmed after review
          </p>
        </div>
        {variant ? <StockLabel status={variant.stockStatus} /> : null}
      </div>

      {options.map((option) => (
        <fieldset key={option.key} className="mt-6">
          <legend className="mb-2.5 flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-ink">
            <span>{option.label}</span>
            <span className="font-sans text-xs font-normal normal-case tracking-normal text-ink-muted">{selected[option.key]}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const status = availability(option.key, value.value);
              const isSelected = selected[option.key] === value.value;
              return (
                <button
                  key={value.value}
                  type="button"
                  aria-pressed={isSelected}
                  disabled={status === 'none'}
                  onClick={() => choose(option.key, value.value)}
                  className={`relative inline-flex min-h-[40px] items-center gap-2 rounded-sm border px-3.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
                    isSelected ? 'border-ink bg-ink text-canvas' : 'border-hairline bg-surface-elevated text-ink hover:border-ink'
                  } ${status === 'sold_out' ? 'line-through decoration-ink-subtle' : ''}`}
                >
                  {option.display === 'swatch' && value.hex ? (
                    <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/20" style={{ backgroundColor: value.hex }} aria-hidden />
                  ) : null}
                  {value.value}
                  {status === 'sold_out' ? <span className="sr-only"> (sold out)</span> : null}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="mt-7 flex items-stretch gap-3 border-t border-hairline pt-6">
        <div className="inline-flex items-center rounded-sm border border-hairline bg-canvas" role="group" aria-label="Quantity">
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="inline-flex h-11 w-10 items-center justify-center text-ink-muted hover:text-ink disabled:opacity-40"
          >
            <Icon name="minus" className="h-3.5 w-3.5" />
          </button>
          <span className="w-9 text-center font-mono text-sm tabular-nums text-ink" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={!purchasable || quantity >= maxQuantity}
            onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
            className="inline-flex h-11 w-10 items-center justify-center text-ink-muted hover:text-ink disabled:opacity-40"
          >
            <Icon name="plus" className="h-3.5 w-3.5" />
          </button>
        </div>
        <button
          type="button"
          onClick={add}
          disabled={!purchasable || state.kind === 'busy'}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-sm bg-ink px-5 text-xs font-semibold tracking-wide text-canvas transition-colors hover:bg-ink-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="bag" className="h-4 w-4" />
          {state.kind === 'busy' ? 'Adding…' : !variant ? 'Select options' : purchasable ? 'Add to bag' : 'Out of stock'}
        </button>
      </div>

      {variant && variant.stockStatus === 'low_stock' ? (
        <p className="mt-3 text-xs text-status-pending">Only a few left in this option.</p>
      ) : null}
      {state.kind === 'error' ? (
        <p role="alert" className="mt-3 flex items-start gap-1.5 text-xs text-status-negative">
          <Icon name="alert" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {state.message}
        </p>
      ) : null}
      {state.kind === 'added' ? (
        <p role="status" className="mt-3 flex items-center gap-1.5 text-xs text-status-positive">
          <Icon name="check" className="h-3.5 w-3.5" />
          {state.message}
        </p>
      ) : null}
      {variant ? <p className="mt-4 font-mono text-caption text-ink-subtle">Ref {variant.sku}</p> : null}
    </div>
  );
}
