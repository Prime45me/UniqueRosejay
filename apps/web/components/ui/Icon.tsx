import type { SVGProps } from 'react';

/**
 * Minimal line-icon set drawn for URJ (24px grid, 1.5px stroke) so the frontend does not need an
 * icon-library dependency. Icons are decorative by default (aria-hidden); pass `title` to expose
 * one to assistive technology.
 */

const PATHS = {
  'arrow-right': <path d="M5 12h14M13 6l6 6-6 6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  bag: (
    <>
      <path d="M5.5 8h13l-1 12.5h-11L5.5 8Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </>
  ),
  bed: (
    <>
      <path d="M3 19V6M3 15h18v4M21 15v-2.5A2.5 2.5 0 0 0 18.5 10H11v5" />
      <circle cx="7" cy="11.5" r="1.75" />
    </>
  ),
  building: (
    <>
      <path d="M5 21V4h10v17M15 9h4v12M3 21h18" />
      <path d="M8.5 8h1M11 8h1M8.5 12h1M11 12h1M8.5 16h1M11 16h1" />
    </>
  ),
  'map-pin': (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 1 1 13 0c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.25" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="m3.5 6.5 8.5 6 8.5-6" />
    </>
  ),
  phone: (
    <path d="M6.6 3.5h2.9l1.5 4.4-2.1 1.4a11.5 11.5 0 0 0 5.8 5.8l1.4-2.1 4.4 1.5v2.9a1.9 1.9 0 0 1-2 1.9A16.6 16.6 0 0 1 4.6 5.5a1.9 1.9 0 0 1 2-2Z" />
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.75v.01" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="1" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m21 15.5-5-5L6.5 20" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.25 2" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.25" />
      <path d="M2.75 20a6.25 6.25 0 0 1 12.5 0M15.5 4.25a3.25 3.25 0 0 1 0 6.5M18 14.5a6.25 6.25 0 0 1 3.25 5.5" />
    </>
  )
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  name: IconName;
  title?: string;
}

export function Icon({ name, title, className = 'h-4 w-4', ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {PATHS[name]}
    </svg>
  );
}
