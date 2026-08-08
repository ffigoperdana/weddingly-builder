import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type TouchEvent,
} from 'react';
import {
  CalendarPlus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flower2,
  Heart,
  Image,
  MapPin,
  Music2,
  Pause,
  Play,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';
import { RSVPForm } from './RSVPForm';
import {
  GuestCoupleDetailsSection,
  GuestDressCodeSection,
  GuestLiveStreamSection,
  GuestQuoteSection,
  GuestRegistryDetailsSection,
  GuestStoryTimelineSection,
  GuestWishesSection,
} from './GuestOptionalSections';
import type { GuestWeddingEvent, GuestWeddingSite } from './types';
import { normalizeImgproxyUrl } from '../../lib/media-url';
import { useImageReady } from './useImageReady';
import '../../styles/flory-invitation.css';

interface FloryGuestTemplateProps {
  weddingSite: GuestWeddingSite;
  guestName?: string;
}

interface Countdown {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

interface FloryLightboxState {
  images: string[];
  index: number;
}

function toDate(value?: string) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getCountdown(targetDate: Date | null): Countdown {
  if (!targetDate) {
    return { days: '00', hours: '00', minutes: '00', seconds: '00' };
  }

  const difference = Math.max(targetDate.getTime() - Date.now(), 0);
  const pad = (value: number) => String(value).padStart(2, '0');

  return {
    days: pad(Math.floor(difference / 86400000)),
    hours: pad(Math.floor((difference % 86400000) / 3600000)),
    minutes: pad(Math.floor((difference % 3600000) / 60000)),
    seconds: pad(Math.floor((difference % 60000) / 1000)),
  };
}

function formatDate(value?: string) {
  const date = toDate(value);

  if (!date) return 'Tanggal akan segera diumumkan';

  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatIcsDate(date: Date) {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

function getMapUrl(event: GuestWeddingEvent) {
  if (/^https?:\/\//i.test(event.address)) return event.address;

  return (
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent(event.location + ' ' + event.address)
  );
}

function getMapEmbedUrl(event: GuestWeddingEvent) {
  if (
    /^https?:\/\//i.test(event.address) &&
    (/embed/i.test(event.address) || /output=embed/i.test(event.address))
  ) {
    return event.address;
  }

  return (
    'https://www.google.com/maps?q=' +
    encodeURIComponent(event.location + ' ' + event.address) +
    '&output=embed'
  );
}

function getInitials(brideName?: string, groomName?: string) {
  const brideInitial = brideName?.trim().charAt(0) || 'B';
  const groomInitial = groomName?.trim().charAt(0) || 'G';
  return brideInitial + ' & ' + groomInitial;
}

function PhotoFrame({
  imageUrl,
  imageReady,
  initials,
  className,
  alt,
}: {
  imageUrl?: string;
  imageReady: boolean;
  initials: string;
  className: string;
  alt: string;
}) {
  const hasImage = Boolean(imageUrl && imageReady);

  return (
    <div
      className={
        className +
        (hasImage ? ' has-image' : imageUrl ? ' is-loading' : '')
      }
      style={
        hasImage
          ? ({ backgroundImage: `url("${imageUrl}")` } as CSSProperties)
          : undefined
      }
      role={hasImage ? 'img' : undefined}
      aria-label={hasImage ? alt : undefined}
    >
      {hasImage ? null : imageUrl ? (
        <span className="flory-image-loading" role="status">
          <span className="flory-image-loading__spinner" aria-hidden="true" />
          Memuat foto utama...
        </span>
      ) : (
        <span className="flory-photo-frame__initials">{initials}</span>
      )}
    </div>
  );
}

export function FloryGuestTemplate({
  weddingSite,
  guestName,
}: FloryGuestTemplateProps) {
  const [isOpened, setIsOpened] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [lightbox, setLightbox] = useState<FloryLightboxState | null>(null);
  const [utilityMessage, setUtilityMessage] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const lightboxTouchStartX = useRef<number | null>(null);

  const mainEvent = weddingSite.events[0];
  const targetDate = useMemo(
    () => toDate(weddingSite.weddingDate || mainEvent?.date),
    [mainEvent?.date, weddingSite.weddingDate],
  );
  const [countdown, setCountdown] = useState(() => getCountdown(targetDate));

  const brideName = weddingSite.brideName || 'Mempelai Wanita';
  const groomName = weddingSite.groomName || 'Mempelai Pria';
  const coupleName = brideName + ' & ' + groomName;
  const initials = getInitials(weddingSite.brideName, weddingSite.groomName);
  const heroImageUrl = normalizeImgproxyUrl(weddingSite.heroImageUrl);
  const heroImageReady = useImageReady(heroImageUrl);
  const bridePhotoUrl = normalizeImgproxyUrl(weddingSite.bridePhotoUrl);
  const groomPhotoUrl = normalizeImgproxyUrl(weddingSite.groomPhotoUrl);
  const storyImage1Url = normalizeImgproxyUrl(weddingSite.storyImage1Url);
  const storyImage2Url = normalizeImgproxyUrl(weddingSite.storyImage2Url);
  const storyImages = [storyImage1Url, storyImage2Url].filter(
    (image): image is string => Boolean(image),
  );
  const galleryImages = weddingSite.galleryImages
    .map((image) => normalizeImgproxyUrl(image))
    .filter((image): image is string => Boolean(image));
  const storyParagraphs = (weddingSite.storyText || '')
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const hasStoryContent = Boolean(
    weddingSite.storyText?.trim() || storyImage1Url || storyImage2Url,
  );
  const hasStoryTimeline = Boolean(
    weddingSite.storyTimelineEnabled && weddingSite.storyTimeline?.length,
  );
  const hasGallery = weddingSite.galleryEnabled && galleryImages.length > 0;
  const hasRegistry = Boolean(
    weddingSite.registryEnabled &&
      (weddingSite.registryText?.trim() ||
        weddingSite.bankAccounts?.length ||
        weddingSite.giftAddress?.trim()),
  );
  const selectedImage = lightbox ? lightbox.images[lightbox.index] : null;
  const themeStyle = {
    '--flory-primary': weddingSite.primaryColor || '#a44022',
    '--flory-secondary': weddingSite.secondaryColor || '#d99d48',
    '--flory-accent': weddingSite.accentColor || '#e7c76e',
    '--flory-heading': weddingSite.headingFont || 'Playfair Display',
    '--flory-body': weddingSite.bodyFont || 'Lato',
  } as CSSProperties;

  useEffect(() => {
    document.title = 'Undangan Pernikahan - ' + coupleName;
  }, [coupleName]);

  useEffect(() => {
    setCountdown(getCountdown(targetDate));
    if (!targetDate) return;

    const interval = window.setInterval(() => {
      setCountdown(getCountdown(targetDate));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [targetDate]);

  useEffect(() => {
    if (isOpened) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpened]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = true;
    audio.volume = 0.3;
  }, []);

  useEffect(() => {
    if (!lightbox) return;

    const onKeyDown = (event: KeyboardEvent) => {
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

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightbox]);

  useEffect(() => {
    if (!lightbox) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [lightbox]);

  useEffect(() => {
    if (!utilityMessage) return;

    const timeout = window.setTimeout(() => setUtilityMessage(''), 3000);
    return () => window.clearTimeout(timeout);
  }, [utilityMessage]);

  const openLightbox = (images: string[], index: number) => {
    setLightbox({ images, index });
  };

  const moveLightbox = (direction: number) => {
    setLightbox((current) => {
      if (!current || current.images.length < 2) return current;

      const index =
        (current.index + direction + current.images.length) %
        current.images.length;
      return { ...current, index };
    });
  };

  const startMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio
      .play()
      .then(() => setIsMusicPlaying(true))
      .catch(() => setIsMusicPlaying(false));
  };

  const openInvitation = () => {
    setIsOpened(true);
    if (weddingSite.musicEnabled && weddingSite.musicUrl) startMusic();
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      startMusic();
      return;
    }

    audio.pause();
    setIsMusicPlaying(false);
  };

  const downloadCalendar = () => {
    if (!targetDate) {
      setUtilityMessage('Tanggal acara belum diisi.');
      return;
    }

    const eventEnd = new Date(targetDate.getTime() + 2 * 60 * 60 * 1000);
    const calendarFile = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Weddingly//Invitation//ID',
      'BEGIN:VEVENT',
      'UID:' + weddingSite.slug + '@weddingly',
      'DTSTAMP:' + formatIcsDate(new Date()),
      'DTSTART:' + formatIcsDate(targetDate),
      'DTEND:' + formatIcsDate(eventEnd),
      'SUMMARY:Undangan Pernikahan ' + coupleName,
      'LOCATION:' + (mainEvent?.location || ''),
      'DESCRIPTION:' + (mainEvent?.address || ''),
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');
    const file = new Blob([calendarFile], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'undangan-' + weddingSite.slug + '.ics';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const shareInvitation = async () => {
    const shareData = {
      title: 'Undangan Pernikahan ' + coupleName,
      text: 'Kami mengundang Anda untuk hadir di hari bahagia kami.',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setUtilityMessage('Tautan undangan telah disalin.');
    } catch {
      setUtilityMessage('Salin tautan dari address bar browser.');
    }
  };

  const handleLightboxTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    lightboxTouchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleLightboxTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const startX = lightboxTouchStartX.current;
    lightboxTouchStartX.current = null;
    if (startX === null) return;

    const endX = event.changedTouches[0]?.clientX;
    if (endX === undefined || Math.abs(endX - startX) < 50) return;

    moveLightbox(endX > startX ? -1 : 1);
  };

  const coupleCards = [
    {
      label: 'Mempelai wanita',
      name: brideName,
      imageUrl: bridePhotoUrl,
    },
    {
      label: 'Mempelai pria',
      name: groomName,
      imageUrl: groomPhotoUrl,
    },
  ];

  return (
    <div className="flory-invitation" style={themeStyle}>
      {weddingSite.musicEnabled && weddingSite.musicUrl && (
        <audio ref={audioRef} src={weddingSite.musicUrl} />
      )}

      {!isOpened && (
        <section
          className="flory-cover"
          role="dialog"
          aria-modal="true"
          aria-label="Pembuka undangan"
        >
          <div className="flory-cover__art" aria-hidden="true" />
          <div className="flory-cover__content">
            <p className="flory-eyebrow">The Wedding Of</p>
            <PhotoFrame
              imageUrl={heroImageUrl}
              imageReady={heroImageReady}
              initials={initials}
              className="flory-photo-frame flory-cover__portrait"
              alt={`Foto ${coupleName}`}
            />
            <div className="flory-cover__flourish" aria-hidden="true">
              <Flower2 className="h-5 w-5" />
              <span />
              <Flower2 className="h-5 w-5" />
            </div>
            <div className="flory-cover__names">
              <h1>{coupleName}</h1>
              <p>{formatDate(weddingSite.weddingDate || mainEvent?.date)}</p>
            </div>
            <div className="flory-cover__guest">
              <span>Kepada Yth.</span>
              <strong>{guestName || 'Tamu Undangan'}</strong>
            </div>
            <button
              type="button"
              className="flory-button flory-button--primary"
              onClick={openInvitation}
            >
              <Heart className="h-4 w-4 fill-current" />
              Buka Undangan
            </button>
            {heroImageUrl && !heroImageReady && (
              <p className="flory-cover__loading-copy" role="status">
                Menyiapkan undangan...
              </p>
            )}
          </div>
        </section>
      )}

      <main className="flory-shell">
        {weddingSite.musicEnabled && weddingSite.musicUrl && (
          <button
            type="button"
            className="flory-music-toggle"
            onClick={toggleMusic}
            aria-label={isMusicPlaying ? 'Jeda musik' : 'Putar musik'}
          >
            {isMusicPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current" />
            )}
            <span>{isMusicPlaying ? 'Musik' : 'Putar musik'}</span>
          </button>
        )}

        {weddingSite.heroEnabled && (
          <section className="flory-hero" id="home">
            <div className="flory-hero__art" aria-hidden="true" />
            <div className="flory-hero__content">
              <p className="flory-eyebrow">The Wedding Invitation</p>
              <PhotoFrame
                imageUrl={heroImageUrl}
                imageReady={heroImageReady}
                initials={initials}
                className="flory-photo-frame flory-hero__portrait"
                alt={`Foto ${coupleName}`}
              />
              <div className="flory-hero__flourish" aria-hidden="true">
                <Flower2 className="h-5 w-5" />
                <span />
                <Flower2 className="h-5 w-5" />
              </div>
              <h2>{coupleName}</h2>
              <p className="flory-hero__date">
                {formatDate(weddingSite.weddingDate || mainEvent?.date)}
              </p>
              <p className="flory-hero__intro">
                Dengan penuh cinta dan kebahagiaan, kami mengundang keluarga
                serta sahabat untuk hadir di hari istimewa kami.
              </p>
              <div className="flory-hero__actions">
                <button
                  type="button"
                  className="flory-button flory-button--primary"
                  onClick={downloadCalendar}
                >
                  <CalendarPlus className="h-4 w-4" />
                  Simpan tanggal
                </button>
                <button
                  type="button"
                  className="flory-button flory-button--secondary"
                  onClick={shareInvitation}
                >
                  <Share2 className="h-4 w-4" />
                  Bagikan
                </button>
              </div>
            </div>
            <a className="flory-hero__scroll" href="#couple" aria-label="Lihat undangan">
              <ChevronDown className="h-5 w-5" />
            </a>
          </section>
        )}

        {weddingSite.quoteEnabled && weddingSite.quoteText && (
          <GuestQuoteSection
            text={weddingSite.quoteText}
            source={weddingSite.quoteSource}
            primaryColor={weddingSite.primaryColor}
            headingFont={weddingSite.headingFont}
            bodyFont={weddingSite.bodyFont}
          />
        )}

        {!weddingSite.coupleDetailsEnabled && (
          <section className="flory-section flory-section--couple" id="couple">
            <div className="flory-section__heading">
              <p className="flory-eyebrow">The happy couple</p>
              <h2>Kedua mempelai</h2>
              <p>Semoga perjalanan ini selalu dipenuhi cinta dan keberkahan.</p>
            </div>
            <div className="flory-couple-cards">
              {coupleCards.map((person) => (
                <article key={person.label}>
                  <div className="flory-couple-cards__photo">
                    {person.imageUrl ? (
                      <img
                        src={person.imageUrl}
                        alt={person.name}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span>{person.name.charAt(0)}</span>
                    )}
                  </div>
                  <p>{person.label}</p>
                  <h3>{person.name}</h3>
                </article>
              ))}
            </div>
            <Heart className="flory-couple-cards__heart h-5 w-5 fill-current" />
          </section>
        )}

        {weddingSite.coupleDetailsEnabled && (
          <GuestCoupleDetailsSection
            brideName={weddingSite.brideName}
            brideFullName={weddingSite.brideFullName}
            brideParents={weddingSite.brideParents}
            bridePhotoUrl={weddingSite.bridePhotoUrl}
            groomName={weddingSite.groomName}
            groomFullName={weddingSite.groomFullName}
            groomParents={weddingSite.groomParents}
            groomPhotoUrl={weddingSite.groomPhotoUrl}
            primaryColor={weddingSite.primaryColor}
            secondaryColor={weddingSite.secondaryColor}
            headingFont={weddingSite.headingFont}
            bodyFont={weddingSite.bodyFont}
          />
        )}

        {targetDate && (
          <section className="flory-section flory-section--countdown">
            <div className="flory-section__heading">
              <p className="flory-eyebrow">Counting down to forever</p>
              <h2>Menuju hari bahagia</h2>
            </div>
            <div className="flory-countdown" aria-label="Hitung mundur acara">
              {[
                ['Hari', countdown.days],
                ['Jam', countdown.hours],
                ['Menit', countdown.minutes],
                ['Detik', countdown.seconds],
              ].map(([label, value]) => (
                <div key={label}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {weddingSite.events.length > 0 && (
          <section className="flory-section flory-section--events" id="event">
            <div className="flory-section__heading">
              <p className="flory-eyebrow">Save the date</p>
              <h2>Waktu &amp; lokasi</h2>
            </div>
            <div className="flory-event-stack">
              {weddingSite.events.map((event) => (
                <article className="flory-event-card" key={event.id}>
                  <span className="flory-event-card__flower" aria-hidden="true">
                    <Flower2 className="h-4 w-4" />
                  </span>
                  <h3>{event.title}</h3>
                  <p>
                    <CalendarPlus className="h-4 w-4" />
                    {formatDate(event.date)}
                  </p>
                  <p>
                    <Clock3 className="h-4 w-4" />
                    {event.time}
                  </p>
                  <p>
                    <MapPin className="h-4 w-4" />
                    <span>
                      <strong>{event.location}</strong>
                      <small>{event.address}</small>
                    </span>
                  </p>
                  <div className="flory-event-card__map">
                    <iframe
                      src={getMapEmbedUrl(event)}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                      title={`Peta lokasi ${event.title}`}
                    />
                  </div>
                  <a
                    className="flory-text-link"
                    href={getMapUrl(event)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Buka Google Maps <span aria-hidden="true">→</span>
                  </a>
                </article>
              ))}
            </div>
          </section>
        )}

        {weddingSite.dressCodeEnabled && (
          <GuestDressCodeSection
            title={weddingSite.dressCodeTitle || undefined}
            text={weddingSite.dressCodeText}
            colors={weddingSite.dressCodeColors}
            primaryColor={weddingSite.primaryColor}
            headingFont={weddingSite.headingFont}
            bodyFont={weddingSite.bodyFont}
          />
        )}

        {weddingSite.storyEnabled && hasStoryContent && (
          <section className="flory-section flory-section--story" id="story">
            <div className="flory-section__heading">
              <p className="flory-eyebrow">A story in bloom</p>
              <h2>{weddingSite.storyTitle || 'Kisah Kami'}</h2>
            </div>
            {storyParagraphs.length > 0 && (
              <div className="flory-story">
                {storyParagraphs.map((paragraph, index) => (
                  <article key={index}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <p>{paragraph}</p>
                  </article>
                ))}
              </div>
            )}
            {storyImages.length > 0 && (
              <div
                className={
                  'flory-story__images ' +
                  (storyImages.length === 1 ? 'flory-story__images--single' : '')
                }
              >
                {storyImages.map((image, index) => (
                  <button
                    type="button"
                    key={image + index}
                    className="flory-story__image"
                    onClick={() => openLightbox(storyImages, index)}
                    aria-label={'Buka foto cerita ' + String(index + 1)}
                  >
                    <img
                      src={image}
                      alt={'Foto cerita ' + String(index + 1)}
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {hasStoryTimeline && (
          <GuestStoryTimelineSection
            items={weddingSite.storyTimeline || []}
            title={weddingSite.storyTitle || 'Perjalanan Kami'}
            primaryColor={weddingSite.primaryColor}
            headingFont={weddingSite.headingFont}
            bodyFont={weddingSite.bodyFont}
          />
        )}

        {hasGallery && (
          <section className="flory-section flory-section--gallery" id="gallery">
            <div className="flory-section__heading">
              <p className="flory-eyebrow">Captured moments</p>
              <h2>{weddingSite.galleryTitle || 'Galeri Kami'}</h2>
            </div>
            <div className="flory-gallery">
              {galleryImages.map((image, index) => (
                <button
                  type="button"
                  key={image + index}
                  className="flory-gallery__item"
                  onClick={() => openLightbox(galleryImages, index)}
                  aria-label={'Buka foto ' + String(index + 1)}
                >
                  <img
                    src={image}
                    alt={'Momen pernikahan ' + String(index + 1)}
                    loading="lazy"
                    decoding="async"
                  />
                  <span><Image className="h-4 w-4" /></span>
                </button>
              ))}
            </div>
          </section>
        )}

        {weddingSite.liveStreamEnabled && (
          <GuestLiveStreamSection
            url={weddingSite.liveStreamUrl}
            primaryColor={weddingSite.primaryColor}
            headingFont={weddingSite.headingFont}
            bodyFont={weddingSite.bodyFont}
          />
        )}

        {hasRegistry && (
          <GuestRegistryDetailsSection
            title={weddingSite.registryTitle || 'Wedding Gift'}
            registryText={weddingSite.registryText}
            accounts={weddingSite.bankAccounts}
            giftAddress={weddingSite.giftAddress}
            primaryColor={weddingSite.primaryColor}
            secondaryColor={weddingSite.secondaryColor}
            headingFont={weddingSite.headingFont}
            bodyFont={weddingSite.bodyFont}
          />
        )}

        {weddingSite.rsvpEnabled !== false && (
          <section className="flory-section flory-section--rsvp" id="rsvp">
            <div className="flory-section__heading">
              <p className="flory-eyebrow">RSVP</p>
              <h2>Konfirmasi kehadiran</h2>
              <p>Kehadiranmu akan menjadi kebahagiaan bagi kami.</p>
            </div>
            <div className="flory-rsvp__card">
              <RSVPForm
                siteSlug={weddingSite.slug}
                primaryColor={weddingSite.secondaryColor}
                accentColor={weddingSite.primaryColor}
                guestName={guestName}
                locale="id"
                guestCountEnabled={weddingSite.rsvpGuestCountEnabled}
                messageEnabled={!weddingSite.wishesEnabled}
              />
            </div>
          </section>
        )}

        {weddingSite.wishesEnabled && (
          <GuestWishesSection
            siteSlug={weddingSite.slug}
            guestName={guestName}
            showPublicWishes={weddingSite.wishesDisplayEnabled !== false}
            primaryColor={weddingSite.primaryColor}
            headingFont={weddingSite.headingFont}
            bodyFont={weddingSite.bodyFont}
          />
        )}

        <footer className="flory-footer">
          <Sparkles className="mx-auto h-4 w-4" />
          <p>Terima kasih atas doa dan kehadiran Anda.</p>
          <strong>{coupleName}</strong>
          <span><Music2 className="h-3.5 w-3.5" /> Made with love</span>
        </footer>

        <nav className="flory-bottom-nav" aria-label="Navigasi undangan">
          <a href="#home"><Heart className="h-4 w-4" /><span>Beranda</span></a>
          {weddingSite.events.length > 0 && (
            <a href="#event"><CalendarPlus className="h-4 w-4" /><span>Acara</span></a>
          )}
          {hasGallery && (
            <a href="#gallery"><Image className="h-4 w-4" /><span>Galeri</span></a>
          )}
          {weddingSite.rsvpEnabled !== false && (
            <a href="#rsvp"><Flower2 className="h-4 w-4" /><span>RSVP</span></a>
          )}
        </nav>
      </main>

      {utilityMessage && <div className="flory-toast" role="status">{utilityMessage}</div>}

      {lightbox && selectedImage && (
        <div
          className="flory-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau foto"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="flory-lightbox__close"
            onClick={() => setLightbox(null)}
            aria-label="Tutup pratinjau"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="flory-lightbox__content"
            onClick={(event) => event.stopPropagation()}
          >
            {lightbox.images.length > 1 ? (
              <button
                type="button"
                className="flory-lightbox__nav flory-lightbox__nav--previous"
                onClick={() => moveLightbox(-1)}
                aria-label="Foto sebelumnya"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            ) : <span />}
            <div
              className="flory-lightbox__media"
              onTouchStart={handleLightboxTouchStart}
              onTouchEnd={handleLightboxTouchEnd}
            >
              <img
                key={selectedImage}
                src={selectedImage}
                alt={`Pratinjau foto ${lightbox.index + 1}`}
                loading="eager"
                decoding="async"
              />
              <span className="flory-lightbox__counter">
                {lightbox.index + 1} / {lightbox.images.length}
              </span>
            </div>
            {lightbox.images.length > 1 ? (
              <button
                type="button"
                className="flory-lightbox__nav flory-lightbox__nav--next"
                onClick={() => moveLightbox(1)}
                aria-label="Foto berikutnya"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            ) : <span />}
            {lightbox.images.length > 1 && (
              <div className="flory-lightbox__thumbs" aria-label="Pilih foto">
                {lightbox.images.map((image, index) => (
                  <button
                    type="button"
                    key={image + index}
                    className={
                      'flory-lightbox__thumb ' +
                      (index === lightbox.index ? 'is-active' : '')
                    }
                    onClick={() =>
                      setLightbox((current) =>
                        current ? { ...current, index } : current,
                      )
                    }
                    aria-label={'Lihat foto ' + String(index + 1)}
                    aria-current={index === lightbox.index ? 'true' : undefined}
                  >
                    <img src={image} alt="" loading="lazy" decoding="async" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
