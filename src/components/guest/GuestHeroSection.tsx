import { normalizeImgproxyUrl } from '../../lib/media-url';
import { useImageReady } from './useImageReady';

interface HeroSectionProps {
  brideName?: string;
  groomName?: string;
  weddingDate?: Date | string | null;
  heroImageUrl?: string;
  primaryColor?: string;
  headingFont?: string;
  guestName?: string;
}

export function GuestHeroSection({
  brideName,
  groomName,
  weddingDate,
  heroImageUrl,
  primaryColor = '#e4b6c6',
  headingFont = 'Playfair Display',
  guestName,
}: HeroSectionProps) {
  const normalizedHeroImageUrl = normalizeImgproxyUrl(heroImageUrl);
  const heroImageReady = useImageReady(normalizedHeroImageUrl);
  const heroImageVisible = Boolean(
    normalizedHeroImageUrl && heroImageReady,
  );

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <section
      className="relative min-h-screen flex items-center justify-center text-white overflow-hidden"
      aria-busy={Boolean(normalizedHeroImageUrl && !heroImageReady)}
      style={{
        backgroundImage: heroImageVisible
          ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${normalizedHeroImageUrl})`
          : `linear-gradient(135deg, ${primaryColor} 0%, #ffffff 100%)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {normalizedHeroImageUrl && !heroImageReady && (
        <div
          className="absolute inset-x-0 top-0 z-20 h-1 overflow-hidden bg-white/25"
          role="progressbar"
          aria-label="Memuat foto utama"
        >
          <div className="h-full w-1/3 animate-pulse bg-white" />
        </div>
      )}
      <div className="relative z-10 text-center px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Personalized Greeting */}
          {guestName && (
            <p
              className="text-lg sm:text-xl md:text-2xl font-light mb-4 tracking-wide"
              style={{
                textShadow: heroImageVisible
                  ? '1px 1px 2px rgba(0,0,0,0.5)'
                  : 'none',
                color: heroImageVisible ? '#ffffff' : '#666',
                fontFamily: headingFont,
              }}
            >
              Dear {guestName},
            </p>
          )}

          {/* Invitation Text */}
          <p
            className="text-base sm:text-lg md:text-xl font-light mb-6 tracking-wide"
            style={{
              textShadow: heroImageVisible
                ? '1px 1px 2px rgba(0,0,0,0.5)'
                : 'none',
              color: heroImageVisible ? '#ffffff' : '#666',
            }}
          >
            You are cordially invited to the wedding of
          </p>

          {/* Decorative element */}
          <div
            className="text-4xl sm:text-6xl mb-6"
            style={{ color: primaryColor }}
          >
            ❤
          </div>

          {/* Names */}
          <h1
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 drop-shadow-lg"
            style={{
              fontFamily: headingFont,
              textShadow: heroImageVisible
                ? '2px 2px 4px rgba(0,0,0,0.5)'
                : 'none',
              color: heroImageVisible ? '#ffffff' : '#333',
            }}
          >
            {brideName} & {groomName}
          </h1>

          {/* Date */}
          {weddingDate && (
            <p
              className="text-xl sm:text-2xl md:text-3xl font-light tracking-wide"
              style={{
                textShadow: heroImageVisible
                  ? '1px 1px 2px rgba(0,0,0,0.5)'
                  : 'none',
                color: heroImageVisible ? '#ffffff' : '#666',
              }}
            >
              {formatDate(weddingDate)}
            </p>
          )}

          {/* Scroll indicator */}
          <div className="mt-12 animate-bounce">
            <svg
              className="w-6 h-6 mx-auto"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{
                color: heroImageVisible ? '#ffffff' : primaryColor,
              }}
            >
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
