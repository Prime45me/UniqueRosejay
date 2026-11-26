'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { isActivePath } from '@/components/layout/PrimaryNav';
import { Icon } from '@/components/ui/Icon';
import type { NavItem } from '@/lib/site';

/**
 * Mobile navigation (below md): a disclosure button that reveals a full-width panel under the
 * header. Closes on route change and on Escape (returning focus to the toggle).
 */
export function MobileMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const linkClass = (href: string) =>
    `block rounded-sm px-3 py-3 text-sm font-medium ${
      isActivePath(pathname, href) ? 'bg-surface text-ink' : 'text-ink-muted hover:bg-surface hover:text-ink'
    }`;

  return (
    <div className="md:hidden">
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-hairline text-ink transition-colors hover:bg-surface"
      >
        <Icon name={open ? 'close' : 'menu'} className="h-5 w-5" />
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-t border-hairline bg-canvas px-4 py-4 shadow-sm"
      >
        <nav aria-label="Mobile">
          <ul className="space-y-1">
            <li>
              <Link href="/" aria-current={pathname === '/' ? 'page' : undefined} className={linkClass('/')}>
                Home
              </Link>
            </li>
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActivePath(pathname, item.href) ? 'page' : undefined}
                  className={linkClass(item.href)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
