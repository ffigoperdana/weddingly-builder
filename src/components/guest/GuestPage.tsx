import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PasswordPrompt } from './PasswordPrompt';
import { EnvelopeInvitation } from './EnvelopeInvitation';
import { GuestHeroSection } from './GuestHeroSection';
import { GuestEventsSection } from './GuestEventsSection';
import { GuestStorySection } from './GuestStorySection';
import { GuestGallerySection } from './GuestGallerySection';
import { RSVPForm } from './RSVPForm';
import {
  GuestCountdownSection,
  GuestCoupleDetailsSection,
  GuestDressCodeSection,
  GuestLiveStreamSection,
  GuestQuoteSection,
  GuestRegistryDetailsSection,
  GuestStoryTimelineSection,
  GuestWishesSection,
} from './GuestOptionalSections';
import { FloatingDecorations } from './decorations/FloatingDecorations';
import { CornerDecorations } from './decorations/CornerDecorations';
import { SectionDivider } from './decorations/SectionDivider';
import { MusicPlayer } from './MusicPlayer';
import { AutumnGuestTemplate } from './AutumnGuestTemplate';
import { FloryGuestTemplate } from './FloryGuestTemplate';
import type { GuestWeddingSite } from './types';

interface GuestPageProps {
  slug: string;
}

/**
 * Keep Classic Romance sections in normal document flow. The previous
 * Framer Motion + useInView wrapper created one observer and one animation
 * per section, which made long invitations expensive to scroll.
 */
function ScrollAnimationWrapper({
  children,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return <div className="classic-section-wrapper">{children}</div>;
}

export default function GuestPage({ slug }: GuestPageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(
    null,
  );
  const [weddingSite, setWeddingSite] = useState<GuestWeddingSite | null>(
    null,
  );
  const [guestName, setGuestName] = useState<string | null>(null);
  const [envelopeOpened, setEnvelopeOpened] = useState(false);

  const handleEnvelopeOpen = () => {
    setEnvelopeOpened(true);
    // Trigger music playback on user interaction
    if ((window as any).playWeddingMusic) {
      (window as any).playWeddingMusic();
    }
  };

  useEffect(() => {
    // Get guest name from URL parameter
    const params = new URLSearchParams(window.location.search);
    const toParam = params.get('to');
    if (toParam) {
      // URLSearchParams already decodes the query value. Decoding it again
      // breaks names containing percent signs and can throw URIError.
      setGuestName(toParam);
    }

    fetchWeddingSite();
  }, [slug]);

  const fetchWeddingSite = async () => {
    try {
      const response = await fetch(`/api/wedding/${slug}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setError('Wedding site not found');
        } else if (response.status === 403) {
          setError('This wedding site is not published yet');
        } else {
          setError(data.error || 'Failed to load wedding site');
        }
        setLoading(false);
        return;
      }

      if (data.hasPassword) {
        setRequiresPassword(true);
        setLoading(false);
      } else {
        setWeddingSite(data.weddingSite);
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to load wedding site');
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    try {
      const response = await fetch(`/api/wedding/${slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPasswordError(data.error || 'Incorrect password');
        return;
      }

      setWeddingSite(data.weddingSite);
      setRequiresPassword(false);
      setPasswordError(null);
    } catch (err) {
      setPasswordError('Failed to verify password');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">💒</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Oops!
          </h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <PasswordPrompt
        onSubmit={handlePasswordSubmit}
        error={passwordError || undefined}
        primaryColor={weddingSite?.primaryColor}
        headingFont={weddingSite?.headingFont}
      />
    );
  }

  if (!weddingSite) {
    return null;
  }

  if (weddingSite.templateId === 'autumn') {
    return (
      <AutumnGuestTemplate
        weddingSite={weddingSite}
        guestName={guestName || undefined}
      />
    );
  }

  if (weddingSite.templateId === 'flory') {
    return (
      <FloryGuestTemplate
        weddingSite={weddingSite}
        guestName={guestName || undefined}
      />
    );
  }

  return (
    <>
      {/* Music Player - Always shown if enabled */}
      {weddingSite.musicEnabled && weddingSite.musicUrl && (
        <MusicPlayer
          musicUrl={weddingSite.musicUrl}
          musicTitle={weddingSite.musicTitle}
          musicArtist={weddingSite.musicArtist}
          primaryColor={weddingSite.primaryColor}
          onUserInteraction={handleEnvelopeOpen}
        />
      )}

      {/* Envelope Animation */}
      <AnimatePresence>
        {!envelopeOpened && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8 }}
          >
            <EnvelopeInvitation
              brideName={weddingSite.brideName}
              groomName={weddingSite.groomName}
              guestName={guestName || undefined}
              primaryColor={weddingSite.primaryColor}
              secondaryColor={weddingSite.secondaryColor}
              headingFont={weddingSite.headingFont}
              onOpen={handleEnvelopeOpen}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      {envelopeOpened && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="classic-invitation relative"
          style={{
            fontFamily: weddingSite.bodyFont,
          }}
        >
          {/* Floating Decorations */}
          <FloatingDecorations
            primaryColor={weddingSite.primaryColor}
            secondaryColor={weddingSite.secondaryColor}
            accentColor={weddingSite.accentColor}
          />

          {/* Content with higher z-index */}
          <div className="relative z-10">
            {/* Hero Section */}
            {weddingSite.heroEnabled && (
              <ScrollAnimationWrapper delay={0.2}>
                <GuestHeroSection
                  brideName={weddingSite.brideName}
                  groomName={weddingSite.groomName}
                  weddingDate={weddingSite.weddingDate}
                  heroImageUrl={weddingSite.heroImageUrl}
                  primaryColor={weddingSite.primaryColor}
                  headingFont={weddingSite.headingFont}
                  guestName={guestName || undefined}
                />
              </ScrollAnimationWrapper>
            )}
            {weddingSite.quoteEnabled && weddingSite.quoteText && (
              <ScrollAnimationWrapper>
                <GuestQuoteSection
                  text={weddingSite.quoteText}
                  source={weddingSite.quoteSource}
                  primaryColor={weddingSite.primaryColor}
                  headingFont={weddingSite.headingFont}
                  bodyFont={weddingSite.bodyFont}
                />
              </ScrollAnimationWrapper>
            )}
            {weddingSite.coupleDetailsEnabled && (
              <ScrollAnimationWrapper>
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
              </ScrollAnimationWrapper>
            )}
            {weddingSite.weddingDate && (
              <ScrollAnimationWrapper>
                <GuestCountdownSection
                  weddingDate={weddingSite.weddingDate}
                  primaryColor={weddingSite.primaryColor}
                  secondaryColor={weddingSite.secondaryColor}
                  headingFont={weddingSite.headingFont}
                  bodyFont={weddingSite.bodyFont}
                />
              </ScrollAnimationWrapper>
            )}
            {/* Divider */}
            {weddingSite.heroEnabled &&
              weddingSite.events &&
              weddingSite.events.length > 0 && (
                <SectionDivider
                  primaryColor={weddingSite.primaryColor}
                  accentColor={weddingSite.accentColor}
                />
              )}
            {/* Events Section */}
            {weddingSite.events && weddingSite.events.length > 0 && (
              <ScrollAnimationWrapper>
                <GuestEventsSection
                  events={weddingSite.events}
                  primaryColor={weddingSite.primaryColor}
                  secondaryColor={weddingSite.secondaryColor}
                  headingFont={weddingSite.headingFont}
                  bodyFont={weddingSite.bodyFont}
                />
              </ScrollAnimationWrapper>
            )}
            {weddingSite.dressCodeEnabled && (
              <ScrollAnimationWrapper>
                <GuestDressCodeSection
                  title={weddingSite.dressCodeTitle || undefined}
                  text={weddingSite.dressCodeText}
                  colors={weddingSite.dressCodeColors}
                  primaryColor={weddingSite.primaryColor}
                  headingFont={weddingSite.headingFont}
                  bodyFont={weddingSite.bodyFont}
                />
              </ScrollAnimationWrapper>
            )}
            {/* Divider */}
            {weddingSite.storyEnabled && (
              <SectionDivider
                primaryColor={weddingSite.primaryColor}
                accentColor={weddingSite.accentColor}
              />
            )}
            {/* Story Section */}
            {weddingSite.storyEnabled && (
              <ScrollAnimationWrapper>
                <GuestStorySection
                  storyTitle={weddingSite.storyTitle}
                  storyText={weddingSite.storyText}
                  storyImage1Url={weddingSite.storyImage1Url}
                  storyImage2Url={weddingSite.storyImage2Url}
                  primaryColor={weddingSite.primaryColor}
                  headingFont={weddingSite.headingFont}
                  bodyFont={weddingSite.bodyFont}
                />
              </ScrollAnimationWrapper>
            )}
            {weddingSite.storyTimelineEnabled &&
              weddingSite.storyTimeline &&
              weddingSite.storyTimeline.length > 0 && (
                <ScrollAnimationWrapper>
                  <GuestStoryTimelineSection
                    title="Perjalanan Kami"
                    items={weddingSite.storyTimeline}
                    primaryColor={weddingSite.primaryColor}
                    headingFont={weddingSite.headingFont}
                    bodyFont={weddingSite.bodyFont}
                  />
                </ScrollAnimationWrapper>
              )}
            {/* Divider */}
            {weddingSite.galleryEnabled && (
              <SectionDivider
                primaryColor={weddingSite.primaryColor}
                accentColor={weddingSite.accentColor}
              />
            )}
            {/* Gallery Section */}
            {weddingSite.galleryEnabled && (
              <ScrollAnimationWrapper>
                <GuestGallerySection
                  galleryTitle={weddingSite.galleryTitle}
                  galleryImages={weddingSite.galleryImages}
                  primaryColor={weddingSite.primaryColor}
                  headingFont={weddingSite.headingFont}
                />
              </ScrollAnimationWrapper>
            )}
            {weddingSite.liveStreamEnabled && (
              <ScrollAnimationWrapper>
                <GuestLiveStreamSection
                  url={weddingSite.liveStreamUrl}
                  primaryColor={weddingSite.primaryColor}
                  headingFont={weddingSite.headingFont}
                  bodyFont={weddingSite.bodyFont}
                />
              </ScrollAnimationWrapper>
            )}
            {/* Divider */}
            {weddingSite.registryEnabled && (
              <SectionDivider
                primaryColor={weddingSite.primaryColor}
                accentColor={weddingSite.accentColor}
              />
            )}{' '}
            {/* Registry Section */}
            {weddingSite.registryEnabled && (
              <ScrollAnimationWrapper>
                <GuestRegistryDetailsSection
                  title={weddingSite.registryTitle}
                  registryText={weddingSite.registryText}
                  accounts={weddingSite.bankAccounts}
                  giftAddress={weddingSite.giftAddress}
                  primaryColor={weddingSite.primaryColor}
                  secondaryColor={weddingSite.secondaryColor}
                  headingFont={weddingSite.headingFont}
                  bodyFont={weddingSite.bodyFont}
                />
              </ScrollAnimationWrapper>
            )}
            {/* RSVP Section */}
            {weddingSite.rsvpEnabled !== false && (
              <ScrollAnimationWrapper>
              <section
                className="relative py-16 px-4 sm:py-16 overflow-hidden"
                style={{
                  backgroundColor: `${weddingSite.accentColor}15`,
                }}
              >
                {/* Corner Decorations */}
                <CornerDecorations
                  primaryColor={weddingSite.primaryColor}
                  secondaryColor={weddingSite.secondaryColor}
                />

                <div className="max-w-2xl mx-auto relative z-10">
                  <h2
                    className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-12"
                    style={{
                      fontFamily: weddingSite.headingFont,
                      color: '#333',
                    }}
                  >
                    RSVP
                  </h2>

                  <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 relative overflow-hidden">
                    {/* Subtle decoration inside form */}
                    <div
                      className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 blur-2xl"
                      style={{
                        backgroundColor: weddingSite.primaryColor,
                      }}
                    />
                    <div
                      className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-5 blur-2xl"
                      style={{
                        backgroundColor: weddingSite.accentColor,
                      }}
                    />

                    <div className="relative z-10">
                      <RSVPForm
                        siteSlug={weddingSite.slug}
                        primaryColor={weddingSite.primaryColor}
                        accentColor={weddingSite.accentColor}
                        guestName={guestName || undefined}
                        guestCountEnabled={
                          weddingSite.rsvpGuestCountEnabled
                        }
                        messageEnabled={!weddingSite.wishesEnabled}
                      />
                    </div>
                  </div>
                </div>
              </section>
              </ScrollAnimationWrapper>
            )}
            {weddingSite.wishesEnabled && (
              <ScrollAnimationWrapper>
                <GuestWishesSection
                  siteSlug={weddingSite.slug}
                  guestName={guestName || undefined}
                  showPublicWishes={weddingSite.wishesDisplayEnabled !== false}
                  primaryColor={weddingSite.primaryColor}
                  headingFont={weddingSite.headingFont}
                  bodyFont={weddingSite.bodyFont}
                />
              </ScrollAnimationWrapper>
            )}
            {/* Footer */}
            <ScrollAnimationWrapper>
              <footer
                className="py-8 text-center text-sm text-gray-600"
                style={{
                  backgroundColor: `${weddingSite.primaryColor}08`,
                }}
              >
                <p>
                  Created with ❤️ by{' '}
                  <span className="font-semibold">The Evermore</span>
                </p>
              </footer>
            </ScrollAnimationWrapper>
          </div>
        </motion.div>
      )}
    </>
  );
}
