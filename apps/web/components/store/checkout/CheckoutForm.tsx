'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type ReactNode } from 'react';
import { CartLine } from '@/components/store/cart/CartLine';
import { useCart } from '@/components/store/cart/CartProvider';
import { buttonClasses } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Select } from '@/components/ui/Select';
import { formatMoney } from '@/lib/store/format';
import type { ApiErrorBody, FulfilmentMethod } from '@/lib/store/types';

type Fields = {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  locality: string;
  administrativeArea: string;
  postalCode: string;
  countryCode: string;
  notes: string;
};

const EMPTY: Fields = { name: '', email: '', phone: '', line1: '', line2: '', locality: '', administrativeArea: '', postalCode: '', countryCode: '', notes: '' };

const field =
  'w-full rounded-sm border bg-surface-elevated px-3 py-2.5 text-sm text-ink placeholder:text-ink-subtle aria-[invalid=true]:border-status-negative';

function validate(values: Fields, method: FulfilmentMethod | undefined) {
  const errors: Partial<Record<keyof Fields | 'method', string>> = {};
  if (!values.name.trim()) errors.name = 'Enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Enter a valid email address.';
  if (!/^[+()\d\s.-]{5,40}$/.test(values.phone.trim())) errors.phone = 'Enter a phone number using digits, spaces and + ( ) -.';
  if (!method) errors.method = 'Choose delivery or collection.';
  if (method?.requiresAddress) {
    if (!values.line1.trim()) errors.line1 = 'Enter the first line of the address.';
    if (!values.locality.trim()) errors.locality = 'Enter the town or city.';
    if (!values.countryCode) errors.countryCode = 'Choose a country.';
  }
  return errors;
}

function Section({ step, title, children }: { step: string; title: string; children: ReactNode }) {
  return (
    <section className="rounded-sm border border-hairline bg-surface-elevated p-6 sm:p-8" aria-labelledby={`step-${step}`}>
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-accent">{step}</span>
        <h2 id={`step-${step}`} className="text-2xl font-semibold text-ink">
          {title}
        </h2>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  children
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="mt-1 text-caption text-ink-subtle">{hint}</p> : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-status-negative">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function CheckoutForm({ methods, countries }: { methods: FulfilmentMethod[]; countries: { code: string; name: string }[] }) {
  const router = useRouter();
  const { cart, status, refresh, open } = useCart();
  const [values, setValues] = useState<Fields>(EMPTY);
  const [methodCode, setMethodCode] = useState(methods.length === 1 ? methods[0].code : '');
  const [errors, setErrors] = useState<ReturnType<typeof validate>>({});
  const [submitState, setSubmitState] = useState<{ kind: 'idle' | 'submitting' | 'error'; message?: string }>({ kind: 'idle' });
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const method = methods.find((candidate) => candidate.code === methodCode);
  const set = (key: keyof Fields) => (event: { target: { value: string } }) => setValues((current) => ({ ...current, [key]: event.target.value }));
  const invalid = (key: keyof Fields) => ({
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `co-${key}-error` : undefined
  });

  if (status === 'loading' && !cart) {
    return <div className="mt-10 h-64 animate-pulse rounded-sm bg-surface" aria-busy="true" aria-label="Loading your bag" />;
  }
  if (!cart || cart.items.length === 0) {
    return (
      <div className="mt-10 rounded-sm border border-hairline bg-surface-elevated px-6 py-16 text-center">
        <Icon name="bag" className="mx-auto h-7 w-7 text-accent" />
        <p className="mt-4 font-display text-2xl font-semibold text-ink">Your bag is empty</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">Add something from the Store to start an order request.</p>
        <Link href="/store" className={buttonClasses('primary', 'mt-6')}>
          Browse the Store
        </Link>
      </div>
    );
  }
  if (methods.length === 0) {
    return (
      <div className="mt-10 rounded-sm border border-hairline bg-surface-elevated p-8 text-center">
        <p className="font-display text-2xl font-semibold text-ink">Ordering is not open yet</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">Delivery and collection options have not been configured. Your bag has been kept.</p>
      </div>
    );
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validate(values, method);
    setErrors(found);
    if (Object.keys(found).length) {
      setSubmitState({ kind: 'error', message: 'Please correct the highlighted fields.' });
      const firstKey = Object.keys(found)[0];
      document.getElementById(firstKey === 'method' ? `co-method-${methods[0].code}` : `co-${firstKey}`)?.focus();
      return;
    }

    setSubmitState({ kind: 'submitting' });
    try {
      const response = await fetch('/api/store/orders', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          idempotencyKey,
          contact: { name: values.name, email: values.email, phone: values.phone },
          fulfilmentMethod: methodCode,
          address: method?.requiresAddress
            ? {
                line1: values.line1,
                line2: values.line2 || undefined,
                locality: values.locality,
                administrativeArea: values.administrativeArea || undefined,
                postalCode: values.postalCode || undefined,
                countryCode: values.countryCode
              }
            : undefined,
          notes: values.notes || undefined
        })
      });
      const json = (await response.json().catch(() => null)) as ({ data?: { reference: string } } & Partial<ApiErrorBody>) | null;
      if (!response.ok || !json?.data) {
        if (response.status === 409) await refresh();
        setSubmitState({
          kind: 'error',
          message:
            response.status === 409
              ? `${json?.error?.message ?? 'Some items changed.'} Your bag has been updated — please review it.`
              : response.status === 429
                ? 'Too many attempts. Please wait a few minutes and try again.'
                : json?.error?.message ?? 'We could not submit your order request. Please try again.'
        });
        return;
      }
      await refresh();
      router.push(`/store/orders/${json.data.reference}`);
    } catch {
      setSubmitState({ kind: 'error', message: 'We could not reach the Store. Your request was not sent; please try again.' });
    }
  };

  const busy = submitState.kind === 'submitting';

  return (
    <form onSubmit={submit} noValidate className="mt-10 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-7">
        <Section step="01" title="Your details">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field id="co-name" label="Full name" error={errors.name}>
                <input id="co-name" autoComplete="name" value={values.name} onChange={set('name')} className={`${field} border-hairline`} {...invalid('name')} />
              </Field>
            </div>
            <Field id="co-email" label="Email" error={errors.email} hint="We’ll use this to confirm your order.">
              <input id="co-email" type="email" autoComplete="email" value={values.email} onChange={set('email')} className={`${field} border-hairline`} {...invalid('email')} />
            </Field>
            <Field id="co-phone" label="Phone" error={errors.phone}>
              <input id="co-phone" type="tel" autoComplete="tel" value={values.phone} onChange={set('phone')} className={`${field} border-hairline`} {...invalid('phone')} />
            </Field>
          </div>
        </Section>

        <Section step="02" title="Delivery or collection">
          <fieldset aria-describedby={errors.method ? 'co-method-error' : undefined}>
            <legend className="sr-only">Choose how you would like to receive your order</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {methods.map((option) => (
                <label
                  key={option.code}
                  className={`flex cursor-pointer gap-3 rounded-sm border p-4 transition-colors ${
                    methodCode === option.code ? 'border-ink bg-canvas ring-1 ring-ink' : 'border-hairline hover:border-ink'
                  }`}
                >
                  <input
                    id={`co-method-${option.code}`}
                    type="radio"
                    name="fulfilment"
                    value={option.code}
                    checked={methodCode === option.code}
                    onChange={() => setMethodCode(option.code)}
                    className="mt-1 h-4 w-4 accent-[#141413]"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-ink">{option.label}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-ink-muted">{option.description}</span>
                  </span>
                </label>
              ))}
            </div>
            {errors.method ? (
              <p id="co-method-error" className="mt-2 text-xs text-status-negative">
                {errors.method}
              </p>
            ) : null}
          </fieldset>

          {method?.requiresAddress ? (
            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-hairline pt-6 sm:grid-cols-2 animate-[riseIn_220ms_ease-out]">
              <div className="sm:col-span-2">
                <Field id="co-countryCode" label="Country" error={errors.countryCode} hint="Delivery coverage is confirmed by URJ during review.">
                  <Select id="co-countryCode" autoComplete="country" value={values.countryCode} onChange={set('countryCode')} tone="surface" {...invalid('countryCode')}>
                    <option value="">Select a country</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field id="co-line1" label="Address line 1" error={errors.line1}>
                  <input id="co-line1" autoComplete="address-line1" value={values.line1} onChange={set('line1')} className={`${field} border-hairline`} {...invalid('line1')} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field id="co-line2" label="Address line 2 (optional)">
                  <input id="co-line2" autoComplete="address-line2" value={values.line2} onChange={set('line2')} className={`${field} border-hairline`} />
                </Field>
              </div>
              <Field id="co-locality" label="Town or city" error={errors.locality}>
                <input id="co-locality" autoComplete="address-level2" value={values.locality} onChange={set('locality')} className={`${field} border-hairline`} {...invalid('locality')} />
              </Field>
              <Field id="co-administrativeArea" label="State, region or province (optional)">
                <input id="co-administrativeArea" autoComplete="address-level1" value={values.administrativeArea} onChange={set('administrativeArea')} className={`${field} border-hairline`} />
              </Field>
              <Field id="co-postalCode" label="Postal code (if applicable)">
                <input id="co-postalCode" autoComplete="postal-code" value={values.postalCode} onChange={set('postalCode')} className={`${field} border-hairline`} />
              </Field>
            </div>
          ) : null}
        </Section>

        <Section step="03" title="Notes (optional)">
          <Field id="co-notes" label="Anything we should know?">
            <textarea id="co-notes" rows={3} maxLength={2000} value={values.notes} onChange={set('notes')} className={`${field} border-hairline`} placeholder="Preferred contact times, sizing questions…" />
          </Field>
        </Section>
      </div>

      <aside className="rounded-sm border border-hairline bg-surface-elevated p-6 sm:p-8 lg:sticky lg:top-24 lg:col-span-5" aria-labelledby="summary-heading">
        <div className="flex items-baseline justify-between">
          <h2 id="summary-heading" className="text-2xl font-semibold text-ink">
            Order summary
          </h2>
          <button type="button" onClick={open} className="text-xs font-semibold text-accent hover:text-accent-hover">
            Edit bag
          </button>
        </div>

        <ul className="mt-2 divide-y divide-hairline">
          {cart.items.map((item) => (
            <CartLine key={item.id} item={item} compact readOnly />
          ))}
        </ul>

        <dl className="mt-2 space-y-2 border-t border-hairline pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-muted">Items subtotal</dt>
            <dd className="font-mono font-medium tabular-nums text-ink">{formatMoney(cart.subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">{method ? method.label : 'Delivery or collection'}</dt>
            <dd className="text-right text-ink-muted">To be confirmed</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Taxes</dt>
            <dd className="text-right text-ink-muted">To be confirmed</dd>
          </div>
          <div className="flex justify-between border-t border-hairline pt-3 font-semibold text-ink">
            <dt>Total</dt>
            <dd className="text-right text-sm font-normal text-ink-muted">Confirmed after review</dd>
          </div>
        </dl>

        <div className="mt-5 flex items-start gap-2.5 rounded-sm bg-surface p-3.5 text-xs leading-relaxed text-ink-muted">
          <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <p>
            This sends an <strong className="text-ink">order request</strong>. No payment is taken now. URJ will contact you to confirm
            availability, charges and how to pay before anything is fulfilled.
          </p>
        </div>

        {!cart.canCheckout ? (
          <p role="alert" className="mt-4 flex items-start gap-1.5 text-xs text-status-negative">
            <Icon name="alert" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Some items need attention. Open your bag to update them.
          </p>
        ) : null}
        {submitState.kind === 'error' ? (
          <p role="alert" className="mt-4 flex items-start gap-1.5 text-xs text-status-negative">
            <Icon name="alert" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {submitState.message}
          </p>
        ) : null}

        <button type="submit" disabled={busy || !cart.canCheckout} className={buttonClasses('primary', 'mt-5 w-full disabled:cursor-not-allowed disabled:opacity-40')}>
          {busy ? 'Submitting request…' : 'Submit order request'}
        </button>
      </aside>
    </form>
  );
}
