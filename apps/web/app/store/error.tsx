'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { buttonClasses } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { Kicker } from '@/components/ui/Typography';

/** Store error boundary — shown when the Store API is unreachable or fails. Offers a retry. */
export default function StoreError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-24 text-center lg:py-32">
      <Icon name="alert" className="mx-auto h-7 w-7 text-status-negative" />
      <Kicker className="mt-5">Store unavailable</Kicker>
      <h1 className="mt-3 text-4xl font-semibold text-ink">We couldn&rsquo;t load the Store</h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
        The catalogue service didn&rsquo;t respond. Your bag is safe — please try again in a moment.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className={buttonClasses('primary')}>
          Try again
        </button>
        <Link href="/" className={buttonClasses('secondary')}>
          Return home
        </Link>
      </div>
    </Container>
  );
}
