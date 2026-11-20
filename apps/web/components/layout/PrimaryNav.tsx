'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem } from '@/lib/site';

export function isActivePath(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Desktop navigation (md and up). A client component only so it can read the current pathname
 * for the bronze active underline; the links themselves are ordinary Next.js <Link>s.
 */
export function PrimaryNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="hidden md:block">
      <ul className="flex items-center gap-7">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`whitespace-nowrap border-b py-1 text-sm font-medium transition-colors ${
                  active
                    ? 'border-accent text-ink'
                    : 'border-transparent text-ink-muted hover:border-hairline hover:text-ink'
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
