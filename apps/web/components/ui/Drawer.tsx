'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';

const CLOSE_MS = 220;

/**
 * Accessible side drawer (modal dialog): focus moves in on open and is contained while open,
 * Escape and the backdrop close it, focus returns to the opener, page scroll is locked, and it
 * animates both in and out (instant under prefers-reduced-motion).
 */
export function Drawer({
  open,
  onClose,
  title,
  side = 'right',
  footer,
  children,
  onOpen
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  side?: 'left' | 'right';
  footer?: ReactNode;
  children: ReactNode;
  /** Called once each time the drawer opens (e.g. to refresh data). */
  onOpen?: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;

  // Keep the panel mounted while the closing animation plays.
  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (!mounted) return;
    setClosing(true);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, reduce ? 0 : CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [open, mounted]);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    onOpenRef.current?.();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => panelRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), select:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const enter = side === 'right' ? 'animate-[slideIn_280ms_cubic-bezier(0.2,0.8,0.2,1)]' : 'animate-[slideInLeft_280ms_cubic-bezier(0.2,0.8,0.2,1)]';
  const exit = side === 'right' ? 'animate-[slideOut_220ms_ease-in_forwards]' : 'animate-[slideOutLeft_220ms_ease-in_forwards]';

  return (
    <div className="fixed inset-0 z-50">
      <div
        aria-hidden
        onClick={onClose}
        className={`absolute inset-0 bg-ink/40 ${closing ? 'animate-[fadeOut_220ms_ease-in_forwards]' : 'animate-[fadeIn_220ms_ease-out]'}`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`absolute inset-y-0 flex w-full max-w-md flex-col bg-canvas shadow-2xl outline-none ${
          side === 'right' ? 'right-0 border-l' : 'left-0 border-r'
        } border-hairline ${closing ? exit : enter}`}
      >
        <div className="flex items-center justify-between border-b border-hairline px-6 py-5">
          <h2 id={titleId} className="font-display text-2xl font-semibold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-hairline text-ink transition-colors hover:bg-surface"
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6">{children}</div>
        {footer ? <div className="border-t border-hairline bg-surface-elevated px-6 py-5">{footer}</div> : null}
      </div>
    </div>
  );
}
