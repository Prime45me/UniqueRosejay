import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Icon, type IconName } from '@/components/ui/Icon';
import { NoticePanel } from '@/components/ui/Notice';
import { Kicker } from '@/components/ui/Typography';
import { CONTACT_PLACEHOLDERS, SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Contact ${SITE.name} (${SITE.abbreviation}).`
};

const CHANNELS: { icon: IconName; label: string; value: string }[] = [
  { icon: 'mail', label: 'Email', value: CONTACT_PLACEHOLDERS.email },
  { icon: 'phone', label: 'Telephone', value: CONTACT_PLACEHOLDERS.phone },
  { icon: 'map-pin', label: 'Location', value: CONTACT_PLACEHOLDERS.location }
];

const AREAS = ['General inquiry', 'Store', 'Hotels', 'Apartments'];

const fieldClass =
  'w-full rounded-sm border border-hairline bg-canvas px-3 py-2.5 text-sm text-ink placeholder:text-ink-subtle disabled:cursor-not-allowed disabled:opacity-70';
const labelClass = 'mb-1 block text-xs font-medium text-ink';

export default function ContactPage() {
  return (
    <Container className="py-12 lg:py-16">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          <div>
            <Kicker>Contact</Kicker>
            <h1 className="mt-2 text-4xl font-semibold text-ink sm:text-5xl">Contact {SITE.name}</h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              One team for questions about the Store, Hotels and Apartments. Official contact details will be published
              here once confirmed.
            </p>
          </div>

          <dl className="space-y-4 rounded-sm border border-hairline bg-surface-elevated p-6 text-sm">
            {CHANNELS.map((channel) => (
              <div key={channel.label} className="flex items-start gap-3">
                <Icon name={channel.icon} className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <div>
                  <dt className="font-semibold text-ink">{channel.label}</dt>
                  <dd className="mt-0.5 text-ink-muted">{channel.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <section aria-labelledby="contact-form-heading" className="rounded-sm border border-hairline bg-surface-elevated p-6 sm:p-8 lg:col-span-7">
          <h2 id="contact-form-heading" className="text-2xl font-semibold text-ink">
            Inquiry form
          </h2>

          <NoticePanel title="Form preview — not yet accepting messages" className="mt-4 bg-surface">
            <span id="contact-form-status">
              This form shows the planned layout. Sending is disabled until the contact workflow is connected, so no
              information can be submitted or stored.
            </span>
          </NoticePanel>

          <form aria-describedby="contact-form-status" className="mt-6">
            <fieldset disabled className="space-y-4">
              <legend className="sr-only">Inquiry details (disabled preview)</legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className={labelClass}>
                    Full name
                  </label>
                  <input id="contact-name" name="name" type="text" autoComplete="name" className={fieldClass} />
                </div>
                <div>
                  <label htmlFor="contact-email" className={labelClass}>
                    Email address
                  </label>
                  <input id="contact-email" name="email" type="email" autoComplete="email" className={fieldClass} />
                </div>
              </div>
              <div>
                <label htmlFor="contact-area" className={labelClass}>
                  Business area
                </label>
                <select id="contact-area" name="area" className={fieldClass} defaultValue={AREAS[0]}>
                  {AREAS.map((area) => (
                    <option key={area}>{area}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="contact-message" className={labelClass}>
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  placeholder="Product questions, travel dates or residence requirements…"
                  className={fieldClass}
                />
              </div>
              <button
                type="submit"
                className="inline-flex min-h-[44px] items-center rounded-sm bg-ink px-6 text-xs font-semibold tracking-wide text-canvas disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send inquiry
              </button>
            </fieldset>
          </form>
        </section>
      </div>
    </Container>
  );
}
