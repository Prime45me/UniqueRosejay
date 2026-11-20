import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Kicker } from '@/components/ui/Typography';

export default function NotFound() {
  return (
    <Container className="py-24 text-center lg:py-32">
      <Kicker>Page not found</Kicker>
      <h1 className="mt-3 text-4xl font-semibold text-ink sm:text-5xl">This page isn&rsquo;t here</h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
        The page may have moved, or it may belong to a section that has not been built yet.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Return home</ButtonLink>
        <ButtonLink href="/store" variant="secondary">
          Visit the Store
        </ButtonLink>
      </div>
    </Container>
  );
}
