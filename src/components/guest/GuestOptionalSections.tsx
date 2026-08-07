import { useEffect, useState, type FormEvent } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Gift,
  Heart,
  Link as LinkIcon,
  MapPin,
  Send,
} from 'lucide-react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { normalizeImgproxyUrl } from '../../lib/media-url';
import type {
  BankAccount,
  StoryTimelineItem,
} from '../../lib/validations';

interface GuestSectionStyleProps {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  headingFont?: string;
  bodyFont?: string;
}

interface GuestQuoteSectionProps extends GuestSectionStyleProps {
  text?: string;
  source?: string;
}

export function GuestQuoteSection({
  text,
  source,
  primaryColor = '#e4b6c6',
  headingFont = 'Playfair Display',
  bodyFont = 'Lato',
}: GuestQuoteSectionProps) {
  if (!text?.trim()) return null;

  return (
    <section
      className="guest-optional-section guest-quote-section py-16 px-4"
      style={{ fontFamily: bodyFont }}
    >
      <div className="mx-auto max-w-3xl rounded-3xl border bg-white/80 p-8 text-center shadow-lg">
        <div
          className="mb-4 text-6xl leading-none"
          style={{ color: primaryColor }}
        >
          “
        </div>
        <blockquote
          className="text-xl italic leading-relaxed text-gray-700"
          style={{ fontFamily: headingFont }}
        >
          {text}
        </blockquote>
        {source && (
          <cite
            className="mt-5 block text-xs font-semibold uppercase tracking-widest text-gray-500"
            style={{ fontFamily: bodyFont }}
          >
            {source}
          </cite>
        )}
      </div>
    </section>
  );
}

interface GuestCoupleDetailsSectionProps extends GuestSectionStyleProps {
  brideName?: string;
  brideFullName?: string;
  brideParents?: string;
  bridePhotoUrl?: string;
  groomName?: string;
  groomFullName?: string;
  groomParents?: string;
  groomPhotoUrl?: string;
}

export function GuestCoupleDetailsSection({
  brideName,
  brideFullName,
  brideParents,
  bridePhotoUrl,
  groomName,
  groomFullName,
  groomParents,
  groomPhotoUrl,
  primaryColor = '#e4b6c6',
  secondaryColor = '#d4a5a5',
  headingFont = 'Playfair Display',
  bodyFont = 'Lato',
}: GuestCoupleDetailsSectionProps) {
  const normalizedBridePhotoUrl = normalizeImgproxyUrl(bridePhotoUrl);
  const normalizedGroomPhotoUrl = normalizeImgproxyUrl(groomPhotoUrl);
  const people = [
    {
      label: 'Mempelai wanita',
      name: brideName || 'Mempelai Wanita',
      fullName: brideFullName,
      parents: brideParents,
      photoUrl: normalizedBridePhotoUrl,
    },
    {
      label: 'Mempelai pria',
      name: groomName || 'Mempelai Pria',
      fullName: groomFullName,
      parents: groomParents,
      photoUrl: normalizedGroomPhotoUrl,
    },
  ];

  return (
    <section
      className="guest-optional-section guest-couple-details-section bg-white py-16 px-4"
      style={{ fontFamily: bodyFont }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: primaryColor }}
          >
            The happy couple
          </p>
          <h2
            className="mt-2 text-3xl font-bold text-gray-800"
            style={{ fontFamily: headingFont }}
          >
            Mengenal kedua mempelai
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          {people.map((person) => (
            <article
              key={person.label}
              className="rounded-2xl border bg-white p-5 text-center shadow-md"
              style={{ borderColor: secondaryColor + '55' }}
            >
              <div
                className="mx-auto grid h-40 w-40 overflow-hidden rounded-full border-4 bg-gradient-to-br from-white to-gray-100"
                style={{ borderColor: primaryColor, placeItems: 'center' }}
              >
                {person.photoUrl ? (
                  <img
                    src={person.photoUrl}
                    alt={person.fullName || person.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span
                    className="text-5xl font-semibold"
                    style={{ color: primaryColor, fontFamily: headingFont }}
                  >
                    {person.name.charAt(0)}
                  </span>
                )}
              </div>
              <p
                className="mt-5 text-xs font-bold uppercase tracking-widest"
                style={{ color: primaryColor }}
              >
                {person.label}
              </p>
              <h3
                className="mt-2 text-2xl font-bold text-gray-800"
                style={{ fontFamily: headingFont }}
              >
                {person.fullName || person.name}
              </h3>
              {person.parents && (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                  {person.parents}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

interface GuestCountdownSectionProps extends GuestSectionStyleProps {
  weddingDate?: string;
}

function countdownFor(dateValue?: string) {
  const target = dateValue ? new Date(dateValue).getTime() : 0;
  const difference = Math.max(target - Date.now(), 0);
  const pad = (value: number) => String(value).padStart(2, '0');

  return {
    days: pad(Math.floor(difference / 86400000)),
    hours: pad(Math.floor((difference % 86400000) / 3600000)),
    minutes: pad(Math.floor((difference % 3600000) / 60000)),
    seconds: pad(Math.floor((difference % 60000) / 1000)),
  };
}

export function GuestCountdownSection({
  weddingDate,
  primaryColor = '#e4b6c6',
  secondaryColor = '#d4a5a5',
  headingFont = 'Playfair Display',
  bodyFont = 'Lato',
}: GuestCountdownSectionProps) {
  const [countdown, setCountdown] = useState(() =>
    countdownFor(weddingDate),
  );

  useEffect(() => {
    setCountdown(countdownFor(weddingDate));
    const interval = window.setInterval(() => {
      setCountdown(countdownFor(weddingDate));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [weddingDate]);

  if (!weddingDate || Number.isNaN(new Date(weddingDate).getTime())) {
    return null;
  }

  const values = [
    ['Hari', countdown.days],
    ['Jam', countdown.hours],
    ['Menit', countdown.minutes],
    ['Detik', countdown.seconds],
  ];

  return (
    <section
      className="guest-optional-section guest-countdown-section py-14 px-4"
      style={{
        backgroundColor: primaryColor + '12',
        fontFamily: bodyFont,
      }}
    >
      <div className="mx-auto max-w-3xl text-center">
        <p
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: primaryColor }}
        >
          Counting down to forever
        </p>
        <h2
          className="mt-2 text-3xl font-bold text-gray-800"
          style={{ fontFamily: headingFont }}
        >
          Menuju hari bahagia
        </h2>
        <div className="mt-8 grid grid-cols-4 gap-2">
          {values.map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl bg-white p-3 shadow-sm"
              style={{ borderTop: '3px solid ' + secondaryColor }}
            >
              <strong
                className="block text-2xl font-bold"
                style={{ color: primaryColor, fontFamily: headingFont }}
              >
                {value}
              </strong>
              <span className="mt-1 block text-xs text-gray-500">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface GuestDressCodeSectionProps extends GuestSectionStyleProps {
  title?: string;
  text?: string;
  colors?: string[];
}

export function GuestDressCodeSection({
  title = 'Dress Code',
  text,
  colors = [],
  primaryColor = '#e4b6c6',
  headingFont = 'Playfair Display',
  bodyFont = 'Lato',
}: GuestDressCodeSectionProps) {
  return (
    <section
      className="guest-optional-section guest-dress-code-section py-14 px-4"
      style={{ fontFamily: bodyFont }}
    >
      <div className="mx-auto max-w-3xl text-center">
        <p
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: primaryColor }}
        >
          Dress code
        </p>
        <h2
          className="mt-2 text-3xl font-bold text-gray-800"
          style={{ fontFamily: headingFont }}
        >
          {title}
        </h2>
        {text && (
          <p className="mx-auto mt-4 max-w-xl whitespace-pre-line text-sm leading-relaxed text-gray-600">
            {text}
          </p>
        )}
        {colors.length > 0 && (
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {colors.map((color) => (
              <span
                key={color}
                title={color}
                className="h-12 w-12 rounded-full border-4 border-white shadow"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

interface GuestStoryTimelineSectionProps extends GuestSectionStyleProps {
  items: StoryTimelineItem[];
  title?: string;
}

export function GuestStoryTimelineSection({
  items,
  title = 'Perjalanan Kami',
  primaryColor = '#e4b6c6',
  headingFont = 'Playfair Display',
  bodyFont = 'Lato',
}: GuestStoryTimelineSectionProps) {
  if (!items.length) return null;

  return (
    <section
      className="guest-optional-section guest-story-timeline-section py-16 px-4"
      style={{ fontFamily: bodyFont }}
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: primaryColor }}
          >
            Our story
          </p>
          <h2
            className="mt-2 text-3xl font-bold text-gray-800"
            style={{ fontFamily: headingFont }}
          >
            {title}
          </h2>
        </div>
        <div
          className="relative space-y-5 border-l-2 pl-6"
          style={{ borderColor: primaryColor + '55' }}
        >
          {items.map((item, index) => (
            <article
              key={item.id || index}
              className="relative rounded-xl bg-white p-5 shadow-sm"
            >
              <span
                className="absolute -left-[38px] top-5 grid h-5 w-5 rounded-full border-4 border-white"
                style={{ backgroundColor: primaryColor }}
              />
              <time
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: primaryColor }}
              >
                {item.year}
              </time>
              <h3
                className="mt-2 text-xl font-semibold text-gray-800"
                style={{ fontFamily: headingFont }}
              >
                {item.title}
              </h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

interface GuestLiveStreamSectionProps extends GuestSectionStyleProps {
  url?: string;
}

export function GuestLiveStreamSection({
  url,
  primaryColor = '#e4b6c6',
  headingFont = 'Playfair Display',
  bodyFont = 'Lato',
}: GuestLiveStreamSectionProps) {
  if (!url?.trim()) return null;

  return (
    <section
      className="guest-optional-section guest-live-stream-section py-14 px-4 text-center"
      style={{ backgroundColor: primaryColor + '10', fontFamily: bodyFont }}
    >
      <LinkIcon
        className="mx-auto h-7 w-7"
        style={{ color: primaryColor }}
      />
      <h2
        className="mt-3 text-3xl font-bold text-gray-800"
        style={{ fontFamily: headingFont }}
      >
        Live Streaming
      </h2>
      <p className="mt-3 text-sm text-gray-600">
        Saksikan acara kami secara online.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white"
        style={{ backgroundColor: primaryColor }}
      >
        Buka Live Streaming
        <ExternalLink className="h-4 w-4" />
      </a>
    </section>
  );
}

interface GuestRegistryDetailsSectionProps extends GuestSectionStyleProps {
  title?: string;
  registryText?: string;
  accounts?: BankAccount[];
  giftAddress?: string;
}

export function GuestRegistryDetailsSection({
  title = 'Gift Registry',
  registryText,
  accounts = [],
  giftAddress,
  primaryColor = '#e4b6c6',
  secondaryColor = '#d4a5a5',
  headingFont = 'Playfair Display',
  bodyFont = 'Lato',
}: GuestRegistryDetailsSectionProps) {
  const [copied, setCopied] = useState<string | null>(null);

  if (!registryText && !accounts.length && !giftAddress) {
    return null;
  }

  const copyAccountNumber = async (number: string) => {
    try {
      await navigator.clipboard.writeText(number);
      setCopied(number);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  return (
    <section
      className="guest-optional-section guest-registry-details-section py-16 px-4"
      style={{ backgroundColor: primaryColor + '08', fontFamily: bodyFont }}
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <Gift
            className="mx-auto h-7 w-7"
            style={{ color: primaryColor }}
          />
          <h2
            className="mt-3 text-3xl font-bold text-gray-800"
            style={{ fontFamily: headingFont }}
          >
            {title}
          </h2>
        </div>
        {registryText && (
          <p className="mx-auto mb-7 max-w-2xl whitespace-pre-line text-center text-sm leading-relaxed text-gray-600">
            {registryText}
          </p>
        )}
        {accounts.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {accounts.map((account, index) => (
              <article
                key={account.id || account.number || index}
                className="rounded-xl bg-white p-5 shadow-md"
                style={{ borderTop: '4px solid ' + secondaryColor }}
              >
                <p className="text-sm font-semibold text-gray-600">
                  {account.bank}
                </p>
                <p
                  className="mt-3 text-2xl font-bold tracking-wider"
                  style={{ color: primaryColor }}
                >
                  {account.number}
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  a.n. {account.owner}
                </p>
                <button
                  type="button"
                  onClick={() => copyAccountNumber(account.number)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold"
                  style={{
                    borderColor: primaryColor + '55',
                    color: primaryColor,
                  }}
                >
                  {copied === account.number ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied === account.number
                    ? 'Tersalin'
                    : 'Salin nomor'}
                </button>
              </article>
            ))}
          </div>
        )}
        {giftAddress && (
          <div className="mt-5 rounded-xl bg-white p-5 text-center shadow-md">
            <MapPin
              className="mx-auto h-5 w-5"
              style={{ color: primaryColor }}
            />
            <h3
              className="mt-2 font-semibold text-gray-800"
              style={{ fontFamily: headingFont }}
            >
              Hadiah fisik
            </h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
              {giftAddress}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

interface GuestWishesSectionProps extends GuestSectionStyleProps {
  siteSlug: string;
  guestName?: string;
}

export function GuestWishesSection({
  siteSlug,
  guestName,
  primaryColor = '#e4b6c6',
  headingFont = 'Playfair Display',
  bodyFont = 'Lato',
}: GuestWishesSectionProps) {
  const [wishes, setWishes] = useState<
    Array<{ id: string; fullName: string; message: string; createdAt: string }>
  >([]);
  const [fullName, setFullName] = useState(guestName || '');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/wishes/' + siteSlug)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.wishes) {
          setWishes(data.wishes);
        }
      })
      .catch(() => undefined);
  }, [siteSlug]);

  const submitWish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/wishes/' + siteSlug, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, message }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ucapan gagal dikirim');
      }

      setWishes((current) => [data.wish, ...current]);
      setMessage('');
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Ucapan gagal dikirim',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="guest-optional-section guest-wishes-section bg-white py-16 px-4"
      style={{ fontFamily: bodyFont }}
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <Heart
            className="mx-auto h-7 w-7 fill-current"
            style={{ color: primaryColor }}
          />
          <h2
            className="mt-3 text-3xl font-bold text-gray-800"
            style={{ fontFamily: headingFont }}
          >
            Wedding Wishes
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sampaikan doa dan ucapan terbaik untuk kedua mempelai.
          </p>
        </div>
        <form
          onSubmit={submitWish}
          className="rounded-xl border bg-white p-5 shadow-md"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Nama
              </label>
              <Input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
                maxLength={100}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Ucapan
              </label>
              <Textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                required
                maxLength={500}
                rows={4}
                placeholder="Tuliskan doa terbaik Anda..."
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: primaryColor }}
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Mengirim...' : 'Kirim Ucapan'}
            </button>
          </div>
        </form>
        <div className="mt-6 space-y-3">
          {wishes.map((wish) => (
            <article
              key={wish.id}
              className="rounded-xl border bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <strong className="text-sm text-gray-800">
                  {wish.fullName}
                </strong>
                <time className="text-xs text-gray-500">
                  {new Date(wish.createdAt).toLocaleDateString('id-ID')}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                {wish.message}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
