import Image from 'next/image';
import { Icon } from '@/components/ui/Icon';
import type { SiteImage } from '@/lib/types';

interface MediaProps {
  image?: SiteImage;
  /** Aspect / sizing classes for the frame, e.g. "aspect-portrait" or "h-72 lg:h-full". */
  frameClassName?: string;
  /** Responsive `sizes` hint so next/image serves an appropriately sized source. */
  sizes: string;
  priority?: boolean;
  /** Extra classes on the <img>, e.g. hover zoom. */
  imageClassName?: string;
  /** Label for the placeholder shown when no photograph is available yet. */
  placeholderLabel?: string;
  /** Optional second image revealed on hover (fashion lookbook cards). */
  hoverImage?: SiteImage;
  /** Overlay content (captions, gradients) positioned inside the frame. */
  children?: React.ReactNode;
}

/**
 * Responsive image frame built on next/image (`fill` + `sizes`), so the frame controls the aspect
 * ratio and Next.js serves resized, modern-format sources. When no image exists, renders an
 * explicitly labelled placeholder instead of a broken image.
 */
export function Media({
  image,
  frameClassName = 'aspect-landscape',
  sizes,
  priority = false,
  imageClassName = '',
  placeholderLabel = 'Photograph to be supplied',
  hoverImage,
  children
}: MediaProps) {
  return (
    <div className={`relative overflow-hidden bg-surface ${frameClassName}`}>
      {image ? (
        <>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes={sizes}
            priority={priority}
            className={`object-cover ${imageClassName}`}
            style={image.focalPoint ? { objectPosition: image.focalPoint } : undefined}
          />
          {hoverImage ? (
            <Image
              src={hoverImage.src}
              alt=""
              aria-hidden
              fill
              sizes={sizes}
              className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={hoverImage.focalPoint ? { objectPosition: hoverImage.focalPoint } : undefined}
            />
          ) : null}
        </>
      ) : (
        <ImagePlaceholder label={placeholderLabel} />
      )}
      {children}
    </div>
  );
}

/** Identified placeholder for imagery that has not been supplied. Never looks like a real photo. */
export function ImagePlaceholder({ label }: { label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="absolute inset-0 flex flex-col items-center justify-center gap-2 border border-dashed border-hairline bg-surface p-6 text-center"
    >
      <Icon name="image" className="h-6 w-6 text-accent" />
      <span className="text-xs font-medium tracking-wide text-ink">{label}</span>
      <span className="text-caption text-ink-subtle">Placeholder</span>
    </div>
  );
}
