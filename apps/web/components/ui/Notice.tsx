import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';

/**
 * Small inline marker that identifies demonstration content. Pairs an icon with explicit text,
 * following the design's "status = colour + icon + words" rule (StatusText.tsx in the prototype).
 */
export function DemoLabel({ children = 'Demonstration listing', tone = 'default' }: { children?: ReactNode; tone?: 'default' | 'light' }) {
  const color = tone === 'light' ? 'text-accent-light' : 'text-status-pending';
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap text-caption font-medium ${color}`}>
      <Icon name="info" className="h-3.5 w-3.5 shrink-0" />
      <span>{children}</span>
    </span>
  );
}

/** Bordered explanatory panel for scope notices (e.g. "reservations open in a later phase"). */
export function NoticePanel({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-start gap-3 rounded-sm border border-hairline bg-surface-elevated p-4 sm:p-5 ${className}`}>
      <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
      <div className="text-sm leading-relaxed text-ink-muted">
        <p className="font-semibold text-ink">{title}</p>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}

/** Two-column label/value ledger with hairline rules (spec sheets, terms, room tiers). */
export function Ledger({ rows, className = '' }: { rows: { label: ReactNode; value: ReactNode }[]; className?: string }) {
  return (
    <dl className={`divide-y divide-hairline rounded-sm border border-hairline bg-canvas text-xs ${className}`}>
      {rows.map((row, index) => (
        <div key={index} className="flex items-baseline justify-between gap-4 px-3.5 py-2.5">
          <dt className="text-ink-muted">{row.label}</dt>
          <dd className="text-right font-mono font-medium text-ink">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
