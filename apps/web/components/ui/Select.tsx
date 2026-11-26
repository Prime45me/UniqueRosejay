import { forwardRef, type SelectHTMLAttributes } from 'react';

type Size = 'sm' | 'md';

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: Size;
  /** Visual surface the control sits on. */
  tone?: 'canvas' | 'surface';
}

const SIZES: Record<Size, string> = {
  sm: 'min-h-[36px] pl-3 pr-9 text-xs',
  md: 'min-h-[44px] pl-3.5 pr-10 text-sm'
};

/**
 * URJ select. Styles the native <select> (no custom listbox), so keyboard behaviour, screen-reader
 * semantics and the platform picker on mobile are all preserved. Hover, focus, invalid and
 * disabled states follow the design tokens.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className = '', size = 'md', tone = 'canvas', children, ...props },
  ref
) {
  return (
    <span className={`relative block ${className}`}>
      <select
        ref={ref}
        {...props}
        className={`peer w-full cursor-pointer appearance-none rounded-sm border border-hairline font-sans text-ink transition-colors
          ${tone === 'surface' ? 'bg-surface-elevated' : 'bg-canvas'} ${SIZES[size]}
          hover:border-ink-subtle focus-visible:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40
          aria-[invalid=true]:border-status-negative disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted transition-colors peer-hover:text-ink peer-focus-visible:text-ink peer-disabled:opacity-50"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m7 10 5 5 5-5" />
      </svg>
    </span>
  );
});
