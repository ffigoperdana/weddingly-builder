import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import {
  CalendarPlus,
  ChevronDown,
  Clock3,
  Heart,
  Image,
  Leaf,
  MapPin,
  Music2,
  Pause,
  Play,
  Share2,
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
import '../../styles/autumn-invitation.css';

interface AutumnGuestTemplateProps {
  weddingSite: GuestWeddingSite;
  guestName?: string;
}

interface Countdown {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

function toDate(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getCountdown(targetDate: Date | null): Countdown {
  if (!targetDate) {
    return { days: '00', hours: '00', minutes: '00', seconds: '00' };
  }

  const difference = Math.max(targetDate.getTime() - Date.now(), 0);
  const days = Math.floor(difference / 86400000);
  const hours = Math.floor((difference % 86400000) / 3600000);
  const minutes = Math.floor((difference % 3600000) / 60000);
  const seconds = Math.floor((difference % 60000) / 1000);
  const pad = (value: number) => String(value).padStart(2, '0');

  return {
    days: pad(days),
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
  };
}

function formatDate(value?: string) {
  const date = toDate(value);

  if (!date) {
    return 'Tanggal akan segera diumumkan';
  }

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
  if (/^https?:\/\//i.test(event.address)) {
    return event.address;
  }

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

export function AutumnGuestTemplate({
  weddingSite,
  guestName,
}: AutumnGuestTemplateProps) {
  const [isOpened, setIsOpened] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [utilityMessage, setUtilityMessage] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);

  const mainEvent = weddingSite.events[0];
  const targetDate = useMemo(
    () => toDate(weddingSite.weddingDate || mainEvent?.date),
    [mainEvent?.date, weddingSite.weddingDate],
  );
  const [countdown, setCountdown] = useState(() =>
    getCountdown(targetDate),
  );

  const brideName = weddingSite.brideName || 'Mempelai Wanita';
  const groomName = weddingSite.groomName || 'Mempelai Pria';
  const coupleName = brideName + ' & ' + groomName;
  const initials = getInitials(weddingSite.brideName, weddingSite.groomName);
  const heroImageUrl = normalizeImgproxyUrl(weddingSite.heroImageUrl);
  const heroImageReady = useImageReady(heroImageUrl);
  const heroImageVisible = Boolean(heroImageUrl && heroImageReady);
  const storyImage1Url = normalizeImgproxyUrl(weddingSite.storyImage1Url);
  const storyImage2Url = normalizeImgproxyUrl(weddingSite.storyImage2Url);
  const galleryImages = weddingSite.galleryImages
    .map((image) => normalizeImgproxyUrl(image))
    .filter((image): image is string => Boolean(image));
  const heroStyle = heroImageVisible
    ? { backgroundImage: 'url("' + heroImageUrl + '")' }
    : undefined;
  const storyParagraphs = (weddingSite.storyText || '')
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const hasStoryContent = Boolean(
    weddingSite.storyText?.trim() ||
      storyImage1Url ||
      storyImage2Url,
  );
  const hasGallery =
    weddingSite.galleryEnabled && galleryImages.length > 0;
  const hasRegistry =
    weddingSite.registryEnabled &&
    Boolean(
      weddingSite.registryText?.trim() ||
        weddingSite.bankAccounts?.length ||
        weddingSite.giftAddress?.trim(),
    );
  const hasStoryTimeline =
    Boolean(
      weddingSite.storyTimelineEnabled &&
        weddingSite.storyTimeline?.length,
    );

  const themeStyle = {
    '--autumn-primary': weddingSite.primaryColor || '#a84824',
    '--autumn-secondary': weddingSite.secondaryColor || '#d87c2d',
    '--autumn-accent': weddingSite.accentColor || '#d9a93b',
  } as CSSProperties;

  useEffect(() => {
    document.title = 'Undangan Pernikahan - ' + coupleName;
  }, [coupleName]);

  useEffect(() => {
    setCountdown(getCountdown(targetDate));

    if (!targetDate) {
      return;
    }

    const interval = window.setInterval(() => {
      setCountdown(getCountdown(targetDate));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [targetDate]);

  useEffect(() => {
    if (isOpened) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpened]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.loop = true;
    audio.volume = 0.3;
  }, []);

  useEffect(() => {
    if (!selectedImage) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selectedImage]);

  useEffect(() => {
    if (!utilityMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setUtilityMessage('');
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [utilityMessage]);

  const startMusic = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio
      .play()
      .then(() => setIsMusicPlaying(true))
      .catch(() => setIsMusicPlaying(false));
  };

  const handleOpenInvitation = () => {
    setIsOpened(true);

    if (weddingSite.musicEnabled && weddingSite.musicUrl) {
      startMusic();
    }
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

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
    const file = new Blob([calendarFile], {
      type: 'text/calendar;charset=utf-8',
    });
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

  return (
    <div className="autumn-invitation" style={themeStyle}>
      {weddingSite.musicEnabled && weddingSite.musicUrl && (
        <audio ref={audioRef} src={weddingSite.musicUrl} />
      )}

      <div className="autumn-ambient" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      {!isOpened && (
        <section
          className="autumn-cover"
          role="dialog"
          aria-modal="true"
          aria-label="Pembuka undangan"
        >
          <div className="autumn-cover__card">
            <p className="autumn-eyebrow">The wedding invitation</p>
            <div
              className={
                'autumn-cover__portrait ' +
                (heroImageVisible
                  ? 'has-image'
                  : heroImageUrl
                    ? 'is-loading'
                    : '')
              }
              style={heroStyle}
            >
              {heroImageVisible ? null : heroImageUrl ? (
                <span className="autumn-image-loading" role="status">
                  <span
                    className="autumn-image-loading__spinner"
                    aria-hidden="true"
                  />
                  Memuat foto utama...
                </span>
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <h1>{coupleName}</h1>
            <p className="autumn-cover__date">
              {formatDate(weddingSite.weddingDate || mainEvent?.date)}
            </p>
            <div className="autumn-cover__guest">
              <span>Kepada Yth.</span>
              <strong>{guestName || 'Tamu Undangan'}</strong>
            </div>
            <button
              type="button"
              className="autumn-button autumn-button--primary"
              onClick={handleOpenInvitation}
            >
              <Heart className="h-4 w-4 fill-current" />
              Buka Undangan
            </button>
            {heroImageUrl && !heroImageReady && (
              <div className="autumn-cover__progress" role="status">
                <span>Memuat foto utama...</span>
                <span className="autumn-cover__progress-track">
                  <span />
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      <main className="autumn-shell">
        {weddingSite.musicEnabled && weddingSite.musicUrl && (
          <button
            type="button"
            className="autumn-music-toggle"
            onClick={toggleMusic}
            aria-label={isMusicPlaying ? 'Jeda musik' : 'Putar musik'}
          >
            {isMusicPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current" />
            )}
            <span>{isMusicPlaying ? 'Musik' : 'Putar Musik'}</span>
          </button>
        )}

        {weddingSite.heroEnabled && (
          <section className="autumn-hero" id="home">
            <div
              className={
                'autumn-hero__photo ' +
                (heroImageVisible
                  ? 'has-image'
                  : heroImageUrl
                    ? 'is-loading'
                    : '')
              }
              style={heroStyle}
            >
              {heroImageVisible ? null : heroImageUrl ? (
                <span className="autumn-image-loading" role="status">
                  <span
                    className="autumn-image-loading__spinner"
                    aria-hidden="true"
                  />
                  Memuat foto utama...
                </span>
              ) : (
                <span className="autumn-hero__initials">{initials}</span>
              )}
            </div>
            <div className="autumn-hero__content">
              <p className="autumn-eyebrow">With love and gratitude</p>
              <h2>{coupleName}</h2>
              <p className="autumn-hero__date">
                {formatDate(weddingSite.weddingDate || mainEvent?.date)}
              </p>
              <p className="autumn-hero__intro">
                Dengan penuh kebahagiaan, kami mengundang keluarga dan
                sahabat untuk hadir dan menjadi bagian dari hari istimewa
                kami.
              </p>
              <div className="autumn-hero__actions">
                <button
                  type="button"
                  className="autumn-button autumn-button--primary"
                  onClick={downloadCalendar}
                >
                  <CalendarPlus className="h-4 w-4" />
                  Simpan Tanggal
                </button>
                <button
                  type="button"
                  className="autumn-button autumn-button--secondary"
                  onClick={shareInvitation}
                >
                  <Share2 className="h-4 w-4" />
                  Bagikan
                </button>
              </div>
            </div>
            <ChevronDown className="autumn-hero__scroll h-5 w-5" />
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

        <section className="autumn-section autumn-section--couple">
          <p className="autumn-eyebrow">The happy couple</p>
          <div className="autumn-couple">
            <article>
              <span className="autumn-couple__initial">
                {brideName.charAt(0)}
              </span>
              <h2>{brideName}</h2>
              <p>Mempelai wanita</p>
            </article>
            <Heart className="autumn-couple__heart h-5 w-5 fill-current" />
            <article>
              <span className="autumn-couple__initial">
                {groomName.charAt(0)}
              </span>
              <h2>{groomName}</h2>
              <p>Mempelai pria</p>
            </article>
          </div>
        </section>

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
          <section className="autumn-section autumn-section--countdown">
            <p className="autumn-eyebrow">Counting down to forever</p>
            <h2>Menuju hari bahagia</h2>
            <div className="autumn-countdown" aria-label="Hitung mundur acara">
              <div>
                <strong>{countdown.days}</strong>
                <span>Hari</span>
              </div>
              <div>
                <strong>{countdown.hours}</strong>
                <span>Jam</span>
              </div>
              <div>
                <strong>{countdown.minutes}</strong>
                <span>Menit</span>
              </div>
              <div>
                <strong>{countdown.seconds}</strong>
                <span>Detik</span>
              </div>
            </div>
          </section>
        )}

        {weddingSite.events.length > 0 && (
          <section className="autumn-section" id="event">
            <p className="autumn-eyebrow">Save the date</p>
            <h2>Waktu & lokasi</h2>
            <div className="autumn-event-stack">
              {weddingSite.events.map((event) => (
                <article className="autumn-event-card" key={event.id}>
                  <span className="autumn-event-card__leaf">
                    <Leaf className="h-4 w-4" />
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
                  <div className="autumn-event-card__map">
                    <iframe
                      src={getMapEmbedUrl(event)}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                      title={`Peta lokasi ${event.title}`}
                    />
                  </div>
                  <a
                    className="autumn-text-link"
                    href={getMapUrl(event)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Buka Google Maps
                    <span aria-hidden="true">→</span>
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
          <section className="autumn-section autumn-section--paper" id="story">
            <p className="autumn-eyebrow">Our story</p>
            <h2>{weddingSite.storyTitle || 'Kisah Kami'}</h2>
            {storyParagraphs.length > 0 && (
              <div className="autumn-story">
                {storyParagraphs.map((paragraph, index) => (
                  <article key={index}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <p>{paragraph}</p>
                  </article>
                ))}
              </div>
            )}
            {(storyImage1Url || storyImage2Url) && (
              <div
                className={
                  'autumn-story__images ' +
                  (storyImage1Url && storyImage2Url
                    ? ''
                    : 'autumn-story__images--single')
                }
              >
                {[storyImage1Url, storyImage2Url]
                  .filter((image): image is string => Boolean(image))
                  .map((image, index) => (
                    <button
                      type="button"
                      key={image + index}
                      className="autumn-story__image"
                      onClick={() => setSelectedImage(image)}
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
          <section className="autumn-section" id="gallery">
            <p className="autumn-eyebrow">Captured moments</p>
            <h2>{weddingSite.galleryTitle || 'Galeri Kami'}</h2>
            <div className="autumn-gallery">
              {galleryImages.map((image, index) => (
                <button
                  type="button"
                  key={image + index}
                  className="autumn-gallery__item"
                  onClick={() => setSelectedImage(image)}
                  aria-label={'Buka foto ' + String(index + 1)}
                >
                  <img
                    src={image}
                    alt={'Momen pernikahan ' + String(index + 1)}
                    loading="lazy"
                    decoding="async"
                  />
                  <span>
                    <Image className="h-4 w-4" />
                  </span>
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
          <section className="autumn-section autumn-rsvp" id="rsvp">
            <p className="autumn-eyebrow">RSVP</p>
            <h2>Konfirmasi kehadiran</h2>
            <p className="autumn-section__lead">
              Kehadiranmu akan menjadi kebahagiaan bagi kami.
            </p>
            <div className="autumn-rsvp__card">
              <RSVPForm
                siteSlug={weddingSite.slug}
                primaryColor={weddingSite.secondaryColor}
                accentColor={weddingSite.primaryColor}
                guestName={guestName}
                locale="id"
                guestCountEnabled={
                  weddingSite.rsvpGuestCountEnabled
                }
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

        <footer className="autumn-footer">
          <Music2 className="mx-auto h-4 w-4" />
          <p>Terima kasih atas doa dan kehadiran Anda.</p>
          <strong>{coupleName}</strong>
        </footer>

        <nav className="autumn-bottom-nav" aria-label="Navigasi undangan">
          <a href="#home">
            <Heart className="h-4 w-4" />
            <span>Beranda</span>
          </a>
          <a href="#event">
            <CalendarPlus className="h-4 w-4" />
            <span>Acara</span>
          </a>
          {hasGallery && (
            <a href="#gallery">
              <Image className="h-4 w-4" />
              <span>Galeri</span>
            </a>
          )}
          <a href="#rsvp">
            <Heart className="h-4 w-4" />
            <span>RSVP</span>
          </a>
        </nav>
      </main>

      {utilityMessage && (
        <div className="autumn-toast" role="status">
          {utilityMessage}
        </div>
      )}

      {selectedImage && (
        <div
          className="autumn-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau foto"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            className="autumn-lightbox__close"
            onClick={() => setSelectedImage(null)}
            aria-label="Tutup pratinjau"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={selectedImage}
            alt="Pratinjau galeri"
            loading="eager"
            decoding="async"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
