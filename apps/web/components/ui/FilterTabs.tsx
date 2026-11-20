import Link from 'next/link';

export interface FilterTab {
  label: string;
  href: string;
  active: boolean;
}

/**
 * URL-driven filter tabs rendered as plain links, so filtering works without client JavaScript,
 * is shareable, and survives Back/Forward. Scrolls horizontally on narrow screens.
 */
export function FilterTabs({ tabs, label }: { tabs: FilterTab[]; label: string }) {
  return (
    <nav aria-label={label} className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      <ul className="flex w-max items-center gap-2">
        {tabs.map((tab) => (
          <li key={tab.href}>
            <Link
              href={tab.href}
              scroll={false}
              aria-current={tab.active ? 'page' : undefined}
              className={`inline-flex min-h-[40px] items-center whitespace-nowrap rounded-sm border px-3.5 text-xs font-medium transition-colors ${
                tab.active
                  ? 'border-ink bg-ink text-canvas'
                  : 'border-hairline bg-surface-elevated text-ink-muted hover:border-ink hover:text-ink'
              }`}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
