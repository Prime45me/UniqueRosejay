import Link from 'next/link';
import { SITE } from '@/lib/site';

/**
 * Typographic wordmark lockup — not a logo. "Unique RoseJay" in the display serif over a tracked
 * small-caps "Enterprises" line, separated by a bronze hairline. No symbol is drawn: the client has
 * not approved a graphic identity (see docs/DESIGN_INTEGRATION.md for the logo proposal note).
 */
export function Wordmark({ size = 'header', asLink = true }: { size?: 'header' | 'footer'; asLink?: boolean }) {
  const large = size === 'footer';
  const content = (
    <span className="inline-flex flex-col items-start leading-none">
      <span className={`font-display font-semibold tracking-[-0.01em] text-ink ${large ? 'text-[1.85rem]' : 'text-[1.6rem]'}`}>
        Unique&nbsp;RoseJay
      </span>
      <span className="mt-1 flex w-full items-center gap-2" aria-hidden>
        <span className="h-px flex-1 bg-accent/60" />
        <span className={`font-sans font-semibold uppercase text-ink-muted ${large ? 'text-[0.6rem] tracking-[0.42em]' : 'text-[0.55rem] tracking-[0.4em]'}`}>
          Enterprises
        </span>
        <span className="h-px flex-1 bg-accent/60" />
      </span>
    </span>
  );

  if (!asLink) return <span aria-label={SITE.name}>{content}</span>;
  return (
    <Link href="/" aria-label={`${SITE.name} — home`} className="group shrink-0 transition-opacity hover:opacity-80">
      {content}
    </Link>
  );
}
