import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { NoticePanel } from '@/components/ui/Notice';
import { Kicker } from '@/components/ui/Typography';
import { storeGet, StoreApiError } from '@/lib/store/api';
import { countryName, formatDateTime, formatMoney, optionLabel } from '@/lib/store/format';
import type { OrderDetail } from '@/lib/store/types';

export const metadata: Metadata = { title: 'Order request received — Store', robots: { index: false } };

const STATUS_TEXT: Record<OrderDetail['status'], { label: string; detail: string }> = {
  PENDING_REVIEW: { label: 'Pending review', detail: 'URJ will check availability and confirm charges and payment with you.' },
  CONFIRMED: { label: 'Confirmed', detail: 'URJ has confirmed this order.' },
  FULFILLED: { label: 'Fulfilled', detail: 'This order has been completed.' },
  CANCELLED: { label: 'Cancelled', detail: 'This order request was cancelled.' }
};

const PAYMENT_TEXT: Record<OrderDetail['paymentStatus'], string> = {
  NOT_REQUESTED: 'Not requested — no payment has been taken',
  AWAITING_PAYMENT: 'Awaiting payment',
  PAID: 'Paid',
  REFUNDED: 'Refunded'
};

export default async function OrderPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  if (!/^URJ-[A-Z0-9]{8}$/.test(reference)) notFound();

  let order: OrderDetail;
  try {
    // Only the browser that submitted the order holds its access cookie.
    order = (await storeGet<OrderDetail>(`/orders/${reference}`, { forwardCookies: [`urj_order_${reference}`] })).data;
  } catch (error) {
    if (error instanceof StoreApiError && error.status === 404) notFound();
    throw error;
  }

  const status = STATUS_TEXT[order.status];
  const submitted = formatDateTime(order.createdAt);

  return (
    <Container className="py-12 lg:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-hairline bg-surface-elevated">
            <Icon name="check" className="h-5 w-5 text-status-positive" />
          </span>
          <Kicker className="mt-5">Order request received</Kicker>
          <h1 className="mt-2 text-4xl font-semibold text-ink sm:text-5xl">Thank you, {order.contact.name.split(' ')[0]}</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
            Your request has been recorded. It is <strong className="text-ink">not yet a confirmed purchase</strong> and no payment has been
            taken. URJ will contact you at {order.contact.email}.
          </p>
        </div>

        <dl className="mt-10 grid grid-cols-1 divide-y divide-hairline rounded-sm border border-hairline bg-surface-elevated sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="p-5">
            <dt className="text-caption uppercase tracking-wider text-ink-subtle">Reference</dt>
            <dd className="mt-1 font-mono text-lg font-medium text-ink">{order.reference}</dd>
          </div>
          <div className="p-5">
            <dt className="text-caption uppercase tracking-wider text-ink-subtle">Status</dt>
            <dd className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-status-pending">
              <Icon name="clock" className="h-4 w-4" />
              {status.label}
            </dd>
          </div>
          <div className="p-5">
            <dt className="text-caption uppercase tracking-wider text-ink-subtle">Payment</dt>
            <dd className="mt-1 text-sm text-ink">{PAYMENT_TEXT[order.paymentStatus]}</dd>
          </div>
        </dl>
        <p className="mt-3 text-center text-xs text-ink-muted">
          {status.detail} Submitted {submitted}.
        </p>

        <section aria-labelledby="items-heading" className="mt-10 rounded-sm border border-hairline bg-surface-elevated p-6 sm:p-8">
          <h2 id="items-heading" className="text-2xl font-semibold text-ink">
            Requested items
          </h2>
          <ul className="mt-2 divide-y divide-hairline">
            {order.items.map((item) => (
              <li key={item.sku} className="flex gap-4 py-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-sm border border-hairline bg-surface">
                  {item.image ? (
                    <Image src={item.image.src} alt={item.image.alt} fill sizes="80px" className="object-cover" style={item.image.focalPoint ? { objectPosition: item.image.focalPoint } : undefined} />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/store/${item.productSlug}`} className="text-sm font-semibold text-ink hover:text-accent">
                    {item.productName}
                  </Link>
                  <p className="mt-0.5 text-xs text-ink-muted">{optionLabel(item.optionValues, item.options) || 'Standard'}</p>
                  <p className="mt-1 text-xs text-ink-muted">
                    Qty <span className="font-mono tabular-nums text-ink">{item.quantity}</span> · {formatMoney(item.unitPrice)} each
                  </p>
                </div>
                <p className="font-mono text-sm font-medium tabular-nums text-ink">{formatMoney(item.lineTotal)}</p>
              </li>
            ))}
          </ul>
          <dl className="space-y-2 border-t border-hairline pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">Items subtotal</dt>
              <dd className="font-mono font-medium tabular-nums text-ink">{formatMoney(order.itemsSubtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">{order.fulfilment.label}</dt>
              <dd className="text-ink-muted">{order.fulfilmentCharge ? formatMoney(order.fulfilmentCharge) : 'To be confirmed'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Taxes</dt>
              <dd className="text-ink-muted">{order.taxAmount ? formatMoney(order.taxAmount) : 'To be confirmed'}</dd>
            </div>
          </dl>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-sm border border-hairline bg-surface-elevated p-6 text-sm">
            <h2 className="font-sans text-xs font-semibold uppercase tracking-wider text-ink">{order.fulfilment.label}</h2>
            {order.fulfilment.address ? (
              <address className="mt-3 not-italic leading-relaxed text-ink-muted">
                {[
                  order.fulfilment.address.line1,
                  order.fulfilment.address.line2,
                  order.fulfilment.address.locality,
                  order.fulfilment.address.administrativeArea,
                  order.fulfilment.address.postalCode,
                  countryName(order.fulfilment.address.countryCode)
                ]
                  .filter(Boolean)
                  .map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
              </address>
            ) : (
              <p className="mt-3 text-ink-muted">Collection details will be arranged with you.</p>
            )}
          </div>
          <div className="rounded-sm border border-hairline bg-surface-elevated p-6 text-sm">
            <h2 className="font-sans text-xs font-semibold uppercase tracking-wider text-ink">Contact</h2>
            <p className="mt-3 leading-relaxed text-ink-muted">
              {order.contact.name}
              <br />
              {order.contact.email}
              <br />
              {order.contact.phone}
            </p>
          </div>
        </div>

        {order.containsDemoItems ? (
          <NoticePanel title="Demonstration order" className="mt-6">
            This request includes demonstration products. It will not be fulfilled as a real purchase.
          </NoticePanel>
        ) : null}

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/store">Continue shopping</ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Contact URJ
          </ButtonLink>
        </div>
        <p className="mt-4 text-center text-caption text-ink-subtle">Keep your reference. This page is visible only in this browser.</p>
      </div>
    </Container>
  );
}
