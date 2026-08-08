import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { normalizeImgproxyUrl } from '../../lib/media-url';

interface GallerySectionProps {
  galleryTitle?: string;
  galleryImages?: string[];
  primaryColor?: string;
  headingFont?: string;
}

interface GalleryLightboxState {
  images: string[];
  index: number;
}

export function GuestGallerySection({
  galleryTitle = 'Our Gallery',
  galleryImages = [],
  primaryColor = '#e4b6c6',
  headingFont = 'Playfair Display',
}: GallerySectionProps) {
  const normalizedGalleryImages = galleryImages
    .map((image) => normalizeImgproxyUrl(image))
    .filter((image): image is string => Boolean(image));
  const [lightbox, setLightbox] =
    useState<GalleryLightboxState | null>(null);
  const lightboxTouchStartX = useRef<number | null>(null);
  const selectedImage = lightbox
    ? lightbox.images[lightbox.index]
    : null;

  const openLightbox = (index: number) => {
    setLightbox({ images: normalizedGalleryImages, index });
  };

  const moveLightbox = (direction: number) => {
    setLightbox((current) => {
      if (!current || current.images.length < 2) {
        return current;
      }

      const nextIndex =
        (current.index + direction + current.images.length) %
        current.images.length;

      return { ...current, index: nextIndex };
    });
  };

  useEffect(() => {
    if (!lightbox) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightbox(null);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        moveLightbox(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        moveLightbox(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox]);

  useEffect(() => {
    if (!lightbox) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [lightbox]);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    lightboxTouchStartX.current =
      event.changedTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const startX = lightboxTouchStartX.current;
    lightboxTouchStartX.current = null;

    if (startX === null) {
      return;
    }

    const endX = event.changedTouches[0]?.clientX;
    if (endX === undefined || Math.abs(endX - startX) < 50) {
      return;
    }

    moveLightbox(endX > startX ? -1 : 1);
  };

  if (normalizedGalleryImages.length === 0) return null;

  const getGridLayout = (count: number) => {
    if (count === 0) return 'grid-cols-1';
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-2';
    if (count === 4) return 'grid-cols-2';
    if (count === 5) return 'grid-cols-3';
    if (count >= 6) return 'grid-cols-3';
    return 'grid-cols-3';
  };

  const getImageSpan = (index: number, total: number) => {
    if (total === 3 && index === 0) return 'row-span-2';
    if (total === 5 && index < 2) return 'row-span-2';
    return '';
  };

  return (
    <>
      <section
        className="px-4 py-16 sm:py-16"
        style={{ backgroundColor: `${primaryColor}08` }}
      >
        <div className="mx-auto max-w-6xl">
          <h2
            className="mb-12 text-center text-3xl font-bold sm:mb-16 sm:text-4xl md:text-5xl"
            style={{
              fontFamily: headingFont,
              color: '#333',
            }}
          >
            {galleryTitle}
          </h2>

          <div
            className={`grid ${getGridLayout(
              normalizedGalleryImages.length,
            )} auto-rows-[12rem] gap-3 sm:auto-rows-[16rem] sm:gap-4`}
          >
            {normalizedGalleryImages.map((image, index) => (
              <button
                type="button"
                key={image + index}
                onClick={() => openLightbox(index)}
                className={`group relative cursor-pointer overflow-hidden rounded-lg bg-gray-200 shadow-md transition-shadow hover:shadow-xl ${getImageSpan(
                  index,
                  normalizedGalleryImages.length,
                )}`}
                aria-label={`Buka foto ${index + 1}`}
              >
                <img
                  src={image}
                  alt={`Gallery image ${index + 1}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {lightbox && selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau galeri"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/30 bg-white/10 text-white transition-colors hover:border-white/60 hover:bg-white/20"
            aria-label="Tutup pratinjau"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="grid h-full max-h-[calc(100vh-2rem)] w-full max-w-5xl grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] grid-rows-[minmax(0,1fr)_auto] items-center gap-3"
            onClick={(event) => event.stopPropagation()}
          >
            {lightbox.images.length > 1 ? (
              <button
                type="button"
                className="grid h-11 w-11 place-items-center rounded-full border border-white/30 bg-white/10 text-white transition hover:border-white/60 hover:bg-white/20"
                onClick={() => moveLightbox(-1)}
                aria-label="Foto sebelumnya"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            ) : (
              <span />
            )}
            <div
              className="relative flex min-h-0 items-center justify-center"
              style={{ touchAction: 'pan-y' }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img
                key={selectedImage}
                src={selectedImage}
                alt={`Full size ${lightbox.index + 1}`}
                className="max-h-[calc(100vh-11rem)] max-w-full rounded-xl object-contain shadow-2xl"
                loading="eager"
                decoding="async"
              />
              <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold tracking-wide text-white">
                {lightbox.index + 1} / {lightbox.images.length}
              </span>
            </div>
            {lightbox.images.length > 1 ? (
              <button
                type="button"
                className="grid h-11 w-11 place-items-center rounded-full border border-white/30 bg-white/10 text-white transition hover:border-white/60 hover:bg-white/20"
                onClick={() => moveLightbox(1)}
                aria-label="Foto berikutnya"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            ) : (
              <span />
            )}
            <div className="col-span-3 flex max-w-full justify-center gap-2 overflow-x-auto px-1 pb-1">
              {lightbox.images.map((image, index) => (
                <button
                  type="button"
                  key={image + index}
                  className={`h-14 w-16 shrink-0 overflow-hidden rounded-lg border-2 p-0.5 transition ${
                    index === lightbox.index
                      ? 'border-white opacity-100'
                      : 'border-white/30 opacity-60 hover:border-white/70 hover:opacity-100'
                  }`}
                  onClick={() =>
                    setLightbox((current) =>
                      current ? { ...current, index } : current,
                    )
                  }
                  aria-label={`Lihat foto ${index + 1}`}
                  aria-current={
                    index === lightbox.index ? 'true' : undefined
                  }
                >
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full rounded-md object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
