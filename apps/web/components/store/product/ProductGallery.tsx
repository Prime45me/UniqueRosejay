'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { ApiImage } from '@/lib/store/types';

/** Main image + thumbnail rail. Lookbook products use a tall 3:4 frame; appliances 4:3. */
export function ProductGallery({ images, name, portrait }: { images: ApiImage[]; name: string; portrait: boolean }) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div className="space-y-4">
      <div className={`relative w-full overflow-hidden rounded-sm border border-hairline bg-surface ${portrait ? 'aspect-portrait max-h-[720px]' : 'aspect-landscape'}`}>
        {current ? (
          <Image
            key={current.src}
            src={current.src}
            alt={current.alt}
            fill
            priority={active === 0}
            sizes="(min-width: 1024px) 680px, 100vw"
            className="object-cover animate-[fadeIn_250ms_ease-out]"
            style={current.focalPoint ? { objectPosition: current.focalPoint } : undefined}
          />
        ) : (
          <div role="img" aria-label="Product photograph to be supplied" className="absolute inset-0 flex flex-col items-center justify-center gap-2 border border-dashed border-hairline">
            <Icon name="image" className="h-7 w-7 text-accent" />
            <span className="text-sm text-ink">Photograph to be supplied</span>
            <span className="text-caption text-ink-subtle">Placeholder</span>
          </div>
        )}
      </div>

      {images.length > 1 ? (
        <ul className="flex flex-wrap gap-3" aria-label={`${name} images`}>
          {images.map((image, index) => (
            <li key={`${image.src}-${index}`}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show image ${index + 1} of ${images.length}`}
                aria-pressed={index === active}
                className={`relative block h-20 w-24 overflow-hidden rounded-sm border transition ${
                  index === active ? 'border-ink ring-1 ring-ink' : 'border-hairline opacity-75 hover:opacity-100'
                }`}
              >
                <Image src={image.src} alt="" fill sizes="96px" className="object-cover" style={image.focalPoint ? { objectPosition: image.focalPoint } : undefined} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
