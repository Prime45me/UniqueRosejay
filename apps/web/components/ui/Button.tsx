import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'inverse' | 'text';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-canvas hover:bg-ink-hover px-6',
  secondary: 'border border-hairline bg-surface-elevated text-ink hover:bg-surface px-5',
  outline: 'border border-ink bg-surface-elevated text-ink hover:bg-ink hover:text-canvas px-5',
  inverse: 'bg-canvas text-ink hover:bg-surface px-6',
  text: 'px-0 text-ink hover:text-accent'
};

const BASE =
  'inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-sm text-xs font-semibold tracking-wide transition-colors';

export function buttonClasses(variant: ButtonVariant = 'primary', className = '') {
  return `${BASE} ${VARIANTS[variant]} ${className}`;
}

interface ButtonLinkProps {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  arrow?: boolean;
  className?: string;
}

/** Link styled as a URJ button. Sharp 2px radius, 44px minimum touch target. */
export function ButtonLink({ href, children, variant = 'primary', arrow = false, className = '' }: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonClasses(variant, className)}>
      <span>{children}</span>
      {arrow ? <Icon name="arrow-right" className="h-3.5 w-3.5" /> : null}
    </Link>
  );
}

/** Compact inline text link with a trailing arrow, used at the foot of cards and section headers. */
export function ArrowLink({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-ink transition-colors hover:text-accent ${className}`}
    >
      <span>{children}</span>
      <Icon name="arrow-right" className="h-3.5 w-3.5" />
    </Link>
  );
}
