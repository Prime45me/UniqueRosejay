'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { ApiErrorBody, Cart } from '@/lib/store/types';

/*
 * Client cart state. The server is authoritative: every mutation returns the full recomputed cart
 * (prices, totals, stock issues), which replaces local state. Nothing is priced in the browser.
 */

export class CartRequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown
  ) {
    super(message);
  }
}

async function request(method: string, path: string, body?: unknown): Promise<Cart> {
  let response: Response;
  try {
    response = await fetch(`/api/store${path}`, {
      method,
      credentials: 'same-origin',
      headers: body ? { 'content-type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new CartRequestError(0, 'We could not reach the Store. Check your connection and try again.');
  }
  const json = (await response.json().catch(() => null)) as ({ data: Cart } & Partial<ApiErrorBody>) | null;
  if (!response.ok || !json?.data) {
    throw new CartRequestError(response.status, json?.error?.message ?? 'Something went wrong. Please try again.', json?.error?.details);
  }
  return json.data;
}

interface CartContextValue {
  cart: Cart | null;
  status: 'loading' | 'ready' | 'error';
  isOpen: boolean;
  open: () => void;
  close: () => void;
  refresh: () => Promise<void>;
  addItem: (variantId: string, quantity: number) => Promise<Cart>;
  updateItem: (itemId: string, change: { quantity?: number; variantId?: string }) => Promise<Cart>;
  removeItem: (itemId: string) => Promise<Cart>;
  /** Last announcement for the polite live region (screen readers). */
  announcement: string;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [status, setStatus] = useState<CartContextValue['status']>('loading');
  const [isOpen, setIsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const next = await request('GET', '/cart');
      if (mounted.current) {
        setCart(next);
        setStatus('ready');
      }
    } catch {
      if (mounted.current) setStatus('error');
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void refresh();
    return () => {
      mounted.current = false;
    };
  }, [refresh]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const apply = useCallback((next: Cart, message: string) => {
    setCart(next);
    setStatus('ready');
    setAnnouncement(message);
    return next;
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      status,
      isOpen,
      announcement,
      open,
      close,
      refresh,
      addItem: async (variantId, quantity) =>
        apply(await request('POST', '/cart/items', { variantId, quantity }), 'Added to your bag'),
      updateItem: async (itemId, change) => apply(await request('PATCH', `/cart/items/${itemId}`, change), 'Bag updated'),
      removeItem: async (itemId) => apply(await request('DELETE', `/cart/items/${itemId}`), 'Item removed from your bag')
    }),
    [cart, status, isOpen, announcement, open, close, refresh, apply]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside <CartProvider>');
  return context;
}
