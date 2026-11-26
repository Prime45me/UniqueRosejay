import { Container } from '@/components/ui/Container';

/** Skeleton shown while the catalogue streams in. Mirrors the final layout to avoid layout shift. */
export default function StoreLoading() {
  return (
    <Container className="py-10 lg:py-14">
      <div className="animate-pulse" aria-busy="true" aria-label="Loading the Store">
        <div className="h-3 w-40 rounded-sm bg-surface" />
        <div className="mt-4 h-10 w-full max-w-lg rounded-sm bg-surface" />
        <div className="mt-3 h-4 w-full max-w-xl rounded-sm bg-surface" />
        <div className="mt-8 flex gap-2">
          {[0, 1, 2, 3, 4].map((index) => (
            <div key={index} className="h-10 w-28 rounded-sm bg-surface" />
          ))}
        </div>
        <div className="mt-6 h-24 rounded-sm bg-surface" />
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="overflow-hidden rounded-sm border border-hairline bg-surface-elevated">
              <div className="aspect-landscape bg-surface" />
              <div className="space-y-2 p-5">
                <div className="h-3 w-1/3 rounded-sm bg-surface" />
                <div className="h-4 w-3/4 rounded-sm bg-surface" />
                <div className="h-3 w-full rounded-sm bg-surface" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
