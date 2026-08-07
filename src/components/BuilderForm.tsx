import { useEffect, useState } from 'react';
import {
  useForm,
  useFieldArray,
  type FieldErrors,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Save } from 'lucide-react';
import {
  weddingSiteSchema,
  type WeddingSiteFormData,
  type WeddingSite,
} from '../lib/validations';
import { weddingSiteService } from '../lib/api';
import { GlobalStylesSection } from './sections/GlobalStylesSection';
import { HeroSection } from './sections/HeroSection';
import { EventsSection } from './sections/EventsSection';
import { PublishingSection } from './sections/PublishingSection';
import { StorySection } from './sections/StorySection';
import { GallerySection } from './sections/GallerySection';
import { RegistrySection } from './sections/RegistrySection';
import { MusicSection } from './sections/MusicSection';
import { TemplatePickerSection } from './sections/TemplatePickerSection';
import { OptionalSectionsSection } from './sections/OptionalSectionsSection';

interface BuilderFormProps {
  initialData?: WeddingSite;
  onSave?: (data: WeddingSite) => void;
}

type ActionStatus = {
  kind: 'success' | 'error';
  message: string;
} | null;

function getFirstFormErrorMessage(
  errors: FieldErrors<WeddingSiteFormData>,
): string | undefined {
  const visited = new WeakSet<object>();

  const visit = (value: unknown): string | undefined => {
    if (!value || typeof value !== 'object') return undefined;

    if (visited.has(value)) return undefined;
    visited.add(value);

    const record = value as Record<string, unknown>;
    if (typeof record.message === 'string') return record.message;

    for (const [key, child] of Object.entries(record)) {
      if (key === 'ref') continue;
      const message = visit(child);
      if (message) return message;
    }

    return undefined;
  };

  return visit(errors);
}

function getOrCreateSlug(data: WeddingSiteFormData) {
  const currentSlug = data.slug?.trim();
  if (currentSlug) return currentSlug;

  if (!data.brideName?.trim() || !data.groomName?.trim()) {
    return '';
  }

  return `${data.brideName}-and-${data.groomName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function BuilderForm({
  initialData,
  onSave,
}: BuilderFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [actionStatus, setActionStatus] = useState<ActionStatus>(null);

  const form = useForm<WeddingSiteFormData>({
    resolver: zodResolver(weddingSiteSchema),
    defaultValues: {
      // Template
      templateId: initialData?.templateId || 'classic',

      // Global Styles
      primaryColor: initialData?.primaryColor || '#e4b6c6',
      secondaryColor: initialData?.secondaryColor || '#d4a5a5',
      accentColor: initialData?.accentColor || '#9b7e7e',
      headingFont: initialData?.headingFont || 'Playfair Display',
      bodyFont: initialData?.bodyFont || 'Lato',

      // Hero Section
      heroEnabled: initialData?.heroEnabled ?? true,
      brideName: initialData?.brideName || '',
      groomName: initialData?.groomName || '',
      weddingDate: initialData?.weddingDate
        ? new Date(initialData.weddingDate)
        : null,
      heroImageUrl: initialData?.heroImageUrl || '',

      // Optional Couple Details Section
      coupleDetailsEnabled: initialData?.coupleDetailsEnabled ?? false,
      brideFullName: initialData?.brideFullName || '',
      brideParents: initialData?.brideParents || '',
      bridePhotoUrl: initialData?.bridePhotoUrl || '',
      groomFullName: initialData?.groomFullName || '',
      groomParents: initialData?.groomParents || '',
      groomPhotoUrl: initialData?.groomPhotoUrl || '',

      // Optional Quote Section
      quoteEnabled: initialData?.quoteEnabled ?? false,
      quoteText: initialData?.quoteText || '',
      quoteSource: initialData?.quoteSource || '',

      // Story Section
      storyEnabled: initialData?.storyEnabled ?? true,
      storyTitle: initialData?.storyTitle || 'Our Story',
      storyText: initialData?.storyText || '',
      storyImage1Url: initialData?.storyImage1Url || '',
      storyImage2Url: initialData?.storyImage2Url || '',
      storyTimelineEnabled:
        initialData?.storyTimelineEnabled ?? false,
      storyTimeline: initialData?.storyTimeline || [],

      // Optional Dress Code
      dressCodeEnabled: initialData?.dressCodeEnabled ?? false,
      dressCodeTitle: initialData?.dressCodeTitle || 'Dress Code',
      dressCodeText: initialData?.dressCodeText || '',
      dressCodeColors: initialData?.dressCodeColors || [],

      // Gallery Section
      galleryEnabled: initialData?.galleryEnabled ?? false,
      galleryTitle: initialData?.galleryTitle || 'Our Gallery',
      galleryImages: initialData?.galleryImages || [],

      // Registry Section
      registryEnabled: initialData?.registryEnabled ?? true,
      registryTitle: initialData?.registryTitle || 'Gift Registry',
      registryText: initialData?.registryText || '',
      bankAccounts: initialData?.bankAccounts || [],
      giftAddress: initialData?.giftAddress || '',

      // Music Section
      musicEnabled: initialData?.musicEnabled ?? true,
      musicUrl: initialData?.musicUrl || '',
      musicTitle: initialData?.musicTitle || '',
      musicArtist: initialData?.musicArtist || '',

      // Optional Live Streaming
      liveStreamEnabled: initialData?.liveStreamEnabled ?? false,
      liveStreamUrl: initialData?.liveStreamUrl || '',

      // RSVP and Wishes
      rsvpEnabled: initialData?.rsvpEnabled ?? true,
      rsvpGuestCountEnabled:
        initialData?.rsvpGuestCountEnabled ?? false,
      wishesEnabled: initialData?.wishesEnabled ?? false,
      wishesDisplayEnabled: initialData?.wishesDisplayEnabled ?? true,

      // Publishing
      slug: initialData?.slug || '',
      password: initialData?.password || '',

      // Events
      events:
        initialData?.events?.map((e) => ({
          ...e,
          date: new Date(e.date),
        })) || [],
    },
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const eventsArray = useFieldArray({
    control,
    name: 'events',
  });

  const storyTimelineArray = useFieldArray({
    control,
    name: 'storyTimeline',
  });

  const bankAccountsArray = useFieldArray({
    control,
    name: 'bankAccounts',
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        templateId: initialData.templateId || 'classic',
        primaryColor: initialData.primaryColor || '#e4b6c6',
        secondaryColor: initialData.secondaryColor || '#d4a5a5',
        accentColor: initialData.accentColor || '#9b7e7e',
        headingFont: initialData.headingFont || 'Playfair Display',
        bodyFont: initialData.bodyFont || 'Lato',
        heroEnabled: initialData.heroEnabled ?? true,
        brideName: initialData.brideName || '',
        groomName: initialData.groomName || '',
        weddingDate: initialData.weddingDate
          ? new Date(initialData.weddingDate)
          : null,
        heroImageUrl: initialData.heroImageUrl || '',
        coupleDetailsEnabled:
          initialData.coupleDetailsEnabled ?? false,
        brideFullName: initialData.brideFullName || '',
        brideParents: initialData.brideParents || '',
        bridePhotoUrl: initialData.bridePhotoUrl || '',
        groomFullName: initialData.groomFullName || '',
        groomParents: initialData.groomParents || '',
        groomPhotoUrl: initialData.groomPhotoUrl || '',
        quoteEnabled: initialData.quoteEnabled ?? false,
        quoteText: initialData.quoteText || '',
        quoteSource: initialData.quoteSource || '',
        storyEnabled: initialData.storyEnabled ?? true,
        storyTitle: initialData.storyTitle || 'Our Story',
        storyText: initialData.storyText || '',
        storyImage1Url: initialData.storyImage1Url || '',
        storyImage2Url: initialData.storyImage2Url || '',
        storyTimelineEnabled:
          initialData.storyTimelineEnabled ?? false,
        storyTimeline: initialData.storyTimeline || [],
        dressCodeEnabled: initialData.dressCodeEnabled ?? false,
        dressCodeTitle:
          initialData.dressCodeTitle || 'Dress Code',
        dressCodeText: initialData.dressCodeText || '',
        dressCodeColors: initialData.dressCodeColors || [],
        galleryEnabled: initialData.galleryEnabled ?? false,
        galleryTitle: initialData.galleryTitle || 'Our Gallery',
        galleryImages: initialData.galleryImages || [],
        registryEnabled: initialData.registryEnabled ?? true,
        registryTitle: initialData.registryTitle || 'Gift Registry',
        registryText: initialData.registryText || '',
        bankAccounts: initialData.bankAccounts || [],
        giftAddress: initialData.giftAddress || '',
        musicEnabled: initialData.musicEnabled ?? true,
        musicUrl: initialData.musicUrl || '',
        musicTitle: initialData.musicTitle || '',
        musicArtist: initialData.musicArtist || '',
        liveStreamEnabled:
          initialData.liveStreamEnabled ?? false,
        liveStreamUrl: initialData.liveStreamUrl || '',
        rsvpEnabled: initialData.rsvpEnabled ?? true,
        rsvpGuestCountEnabled:
          initialData.rsvpGuestCountEnabled ?? false,
        wishesEnabled: initialData.wishesEnabled ?? false,
        wishesDisplayEnabled:
          initialData.wishesDisplayEnabled ?? true,
        slug: initialData.slug || '',
        password: initialData.password || '',
        events:
          initialData.events?.map((e) => ({
            ...e,
            date: new Date(e.date),
          })) || [],
      });
    }
  }, [initialData, form]);

  const handleInvalid = (validationErrors: FieldErrors<WeddingSiteFormData>) => {
    const firstError = getFirstFormErrorMessage(validationErrors);
    const message = firstError
      ? `Periksa isian form: ${firstError}`
      : 'Periksa isian form yang ditandai merah sebelum melanjutkan.';

    setActionStatus({ kind: 'error', message });
    toast.error(message);
  };

  const onSubmit = async (data: WeddingSiteFormData) => {
    setIsSaving(true);
    setActionStatus(null);
    try {
      const slug = getOrCreateSlug(data);

      // Save as draft (isPublished = false)
      const result = await weddingSiteService.save({
        ...data,
        slug,
        isPublished: false,
      });

      const message = 'Draft undangan berhasil disimpan.';
      setActionStatus({ kind: 'success', message });
      toast.success(message);

      if (onSave) {
        onSave(result.weddingSite);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to save wedding site';
      setActionStatus({ kind: 'error', message });
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = handleSubmit(async (data) => {
    setIsPublishing(true);
    setActionStatus(null);
    try {
      const slug = getOrCreateSlug(data);
      if (!slug) {
        const message =
          'Isi URL slug atau nama kedua mempelai sebelum publish.';
        setActionStatus({ kind: 'error', message });
        toast.error(message);
        return;
      }

      // Publish the site (isPublished = true)
      const result = await weddingSiteService.save({
        ...data,
        slug,
        isPublished: true,
      });

      if (!result.weddingSite?.isPublished) {
        throw new Error(
          'Server menyimpan data, tetapi status publish belum aktif.',
        );
      }

      const message = 'Website berhasil dipublish dan sudah live.';
      setActionStatus({ kind: 'success', message });
      toast.success(message);

      if (onSave) {
        onSave(result.weddingSite);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to publish wedding site';
      setActionStatus({ kind: 'error', message });
      toast.error(message);
    } finally {
      setIsPublishing(false);
    }
  }, handleInvalid);

  return (
    <form
      onSubmit={handleSubmit(onSubmit, handleInvalid)}
      className="space-y-6 pb-10"
    >
      {/* Publishing Status Badge */}
      {initialData && (
        <div className="bg-muted rounded-lg p-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Publishing Status</h3>
            <p className="text-sm text-muted-foreground">
              {initialData.isPublished
                ? 'Your website is live and accessible to guests'
                : 'Your website is saved as draft'}
            </p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              initialData.isPublished
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {initialData.isPublished ? 'Published' : 'Draft'}
          </div>
        </div>
      )}

      <TemplatePickerSection control={control} />

      <GlobalStylesSection
        register={register}
        errors={errors}
        control={control}
      />

      <HeroSection
        register={register}
        errors={errors}
        control={control}
        watch={watch}
      />

      <EventsSection
        register={register}
        errors={errors}
        control={control}
        eventsArray={eventsArray}
      />

      <StorySection
        register={register}
        errors={errors}
        control={control}
        watch={watch}
      />

      <GallerySection
        register={register}
        errors={errors}
        control={control}
        watch={watch}
      />

      <RegistrySection
        register={register}
        errors={errors}
        control={control}
        watch={watch}
        bankAccountsArray={bankAccountsArray}
      />

      <MusicSection
        register={register}
        watch={watch}
        setValue={setValue}
      />

      <OptionalSectionsSection
        register={register}
        errors={errors}
        control={control}
        watch={watch}
        storyTimelineArray={storyTimelineArray}
        hasSavedSite={Boolean(initialData?.id)}
      />

      <PublishingSection
        register={register}
        errors={errors}
        watch={watch}
      />

      {/* Action Buttons */}
      {actionStatus && (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-lg border px-4 py-3 text-sm ${
            actionStatus.kind === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {actionStatus.message}
        </div>
      )}
      <div className="flex gap-4 sticky bottom-0 bg-background py-4 border-t">
        <Button
          type="submit"
          disabled={isSaving || isPublishing}
          className="flex-1"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Draft'}
        </Button>
        <Button
          type="button"
          onClick={handlePublish}
          disabled={isSaving || isPublishing}
          className="flex-1"
          variant="default"
        >
          {isPublishing ? 'Publishing...' : 'Publish Website'}
        </Button>
      </div>
    </form>
  );
}
