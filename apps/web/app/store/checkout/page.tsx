import type { Metadata } from 'next';
import { CheckoutForm } from '@/components/store/checkout/CheckoutForm';
import { Container } from '@/components/ui/Container';
import { Kicker } from '@/components/ui/Typography';
import { storeGet } from '@/lib/store/api';
import { countryOptions } from '@/lib/store/countries';
import type { FulfilmentMethod } from '@/lib/store/types';

export const metadata: Metadata = {
  title: 'Checkout — Store',
  robots: { index: false }
};

export default async function CheckoutPage() {
  const { data: methods } = await storeGet<FulfilmentMethod[]>('/fulfilment-methods');

  return (
    <Container className="py-10 lg:py-14">
      <div className="max-w-2xl">
        <Kicker>Store · Checkout</Kicker>
        <h1 className="mt-2 text-4xl font-semibold text-ink sm:text-5xl">Review &amp; submit your order request</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          URJ reviews every order before confirming availability, delivery or collection charges, taxes and payment.
          Submitting does not take a payment.
        </p>
      </div>
      <CheckoutForm methods={methods} countries={countryOptions()} />
    </Container>
  );
}
