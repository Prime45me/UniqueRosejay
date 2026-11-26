'use client';

import { useEffect, useRef, useState, type ElementType, type HTMLAttributes, type ReactNode } from 'react';

/**
 * Gentle upward fade for content as it enters the viewport.
 *
 * Progressive: content renders visible on the server and without JavaScript. Only elements that are
 * still below the fold when the page hydrates are hidden and then revealed, so nothing visible ever
 * flashes. Users who prefer reduced motion get no animation (the global reduced-motion rule also
 * applies). Uses IntersectionObserver; no animation library.
 */
export function Reveal({
  as: Tag = 'div',
  className = '',
  delay = 0,
  children,
  ...rest
}: HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  className?: string;
  /** Stagger in milliseconds. */
  delay?: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<'static' | 'hidden' | 'shown'>('static');

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (element.getBoundingClientRect().top < window.innerHeight * 0.92) return; // already visible

    setState('hidden');
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setState('shown');
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const motion =
    state === 'static'
      ? ''
      : `transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          state === 'hidden' ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
        }`;

  return (
    <Tag {...rest} ref={ref} className={`${motion} ${className}`} style={state === 'shown' && delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
}
