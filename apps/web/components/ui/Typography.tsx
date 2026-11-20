import type { ReactNode } from 'react';

/** Bronze uppercase section label ("kicker") used above headings throughout the design. */
export function Kicker({ children, className = '', tone = 'accent' }: { children: ReactNode; className?: string; tone?: 'accent' | 'light' }) {
  const color = tone === 'light' ? 'text-accent-light' : 'text-accent';
  return <p className={`text-kicker font-semibold uppercase ${color} ${className}`}>{children}</p>;
}

interface SectionHeaderProps {
  kicker: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  as?: 'h1' | 'h2';
  className?: string;
}

/** Kicker + display heading (+ optional lead and trailing action), separated by a hairline. */
export function SectionHeader({ kicker, title, description, action, as: Heading = 'h2', className = '' }: SectionHeaderProps) {
  const size = Heading === 'h1' ? 'text-4xl sm:text-5xl' : 'text-3xl sm:text-4xl';
  return (
    <div className={`flex flex-col justify-between gap-4 border-b border-hairline pb-8 sm:flex-row sm:items-end ${className}`}>
      <div className="max-w-2xl">
        <Kicker>{kicker}</Kicker>
        <Heading className={`mt-2 font-semibold leading-tight text-ink ${size}`}>{title}</Heading>
        {description ? <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
