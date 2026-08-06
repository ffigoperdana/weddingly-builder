import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

const rsvpSchema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  email: z
    .string()
    .email('Invalid email')
    .optional()
    .or(z.literal('')),
  attending: z.enum(['yes', 'no']),
  guestCount: z.preprocess(
    (value) =>
      value === '' || value === undefined ? undefined : Number(value),
    z.number().int().min(1).max(20).optional(),
  ),
  dietaryRestrictions: z.string().optional(),
  message: z.string().optional(),
});

type RSVPFormData = z.infer<typeof rsvpSchema>;

interface RSVPFormProps {
  siteSlug: string;
  primaryColor?: string;
  accentColor?: string;
  guestName?: string;
  locale?: 'en' | 'id';
  guestCountEnabled?: boolean;
}

export function RSVPForm({
  siteSlug,
  primaryColor = '#e4b6c6',
  accentColor = '#9b7e7e',
  guestName,
  locale = 'en',
  guestCountEnabled = false,
}: RSVPFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const copy =
    locale === 'id'
      ? {
          thankYou: 'Terima Kasih!',
          submitted:
            'Konfirmasi kehadiran Anda sudah kami terima. Sampai jumpa di hari bahagia kami!',
          fullName: 'Nama lengkap',
          fullNamePlaceholder: 'Masukkan nama lengkap',
          email: 'Email (opsional)',
          attending: 'Apakah Anda akan hadir?',
          attendingYes: 'Ya, saya akan hadir',
          attendingNo: 'Maaf, belum bisa hadir',
          guestCount: 'Jumlah tamu (opsional)',
          guestCountPlaceholder: 'Pilih jumlah tamu',
          dietary: 'Kebutuhan makanan (opsional)',
          dietaryPlaceholder: 'Alergi atau kebutuhan makanan',
          message: 'Pesan untuk mempelai (opsional)',
          messagePlaceholder: 'Tuliskan doa dan ucapan terbaik...',
          submit: 'Kirim Konfirmasi',
          submitting: 'Mengirim...',
          success: 'RSVP berhasil dikirim!',
          failed: 'Gagal mengirim RSVP',
        }
      : {
          thankYou: 'Thank You!',
          submitted:
            "We've received your RSVP. We can't wait to celebrate with you!",
          fullName: 'Full Name',
          fullNamePlaceholder: 'Your full name',
          email: 'Email (Optional)',
          attending: 'Will you be attending?',
          attendingYes: "Yes, I'll be there!",
          attendingNo: "Sorry, can't make it",
          guestCount: 'Number of guests (Optional)',
          guestCountPlaceholder: 'Select guest count',
          dietary: 'Dietary Restrictions (Optional)',
          dietaryPlaceholder: 'Any allergies or dietary needs?',
          message: 'Message for the Couple (Optional)',
          messagePlaceholder: 'Share your warm wishes...',
          submit: 'Submit RSVP',
          submitting: 'Submitting...',
          success: 'RSVP submitted successfully!',
          failed: 'Failed to submit RSVP',
        };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RSVPFormData>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      fullName: guestName || '',
    },
  });

  const attending = watch('attending');

  const onSubmit = async (data: RSVPFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/rsvp/${siteSlug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          attending: data.attending === 'yes',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || copy.failed);
      }

      setSubmitted(true);
      toast.success(copy.success);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : copy.failed;
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        className="text-center py-12 px-4"
        style={{
          backgroundColor: `${primaryColor}10`,
          borderRadius: '12px',
        }}
      >
        <div className="max-w-md mx-auto">
        <div
          className="text-6xl mb-4"
          style={{ color: accentColor }}
          >
            ✓
          </div>
          <h3
          className="text-2xl font-bold mb-2"
          style={{ color: accentColor }}
        >
          {copy.thankYou}
        </h3>
        <p className="text-gray-600">{copy.submitted}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {copy.fullName} <span className="text-red-500">*</span>
        </label>
        <Input
          {...register('fullName')}
          placeholder={copy.fullNamePlaceholder}
          className="w-full"
        />
        {errors.fullName && (
          <p className="text-red-500 text-sm mt-1">
            {errors.fullName.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {copy.email}
        </label>
        <Input
          {...register('email')}
          type="email"
          placeholder="your@email.com"
          className="w-full"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Attending */}
      <div>
        <label className="block text-sm font-medium mb-3">
          {copy.attending}{' '}
          <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          <label className="flex items-center flex-1">
            <input
              {...register('attending')}
              type="radio"
              value="yes"
              className="mr-2 h-4 w-4"
              style={{ accentColor }}
            />
            <span className="text-sm">{copy.attendingYes}</span>
          </label>
          <label className="flex items-center flex-1">
            <input
              {...register('attending')}
              type="radio"
              value="no"
              className="mr-2 h-4 w-4"
              style={{ accentColor }}
            />
            <span className="text-sm">{copy.attendingNo}</span>
          </label>
        </div>
        {errors.attending && (
          <p className="text-red-500 text-sm mt-1">
            {errors.attending.message}
          </p>
        )}
      </div>

      {guestCountEnabled && (
        <div>
          <label className="block text-sm font-medium mb-2">
            {copy.guestCount}
          </label>
          <select
            {...register('guestCount')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            defaultValue=""
          >
            <option value="">{copy.guestCountPlaceholder}</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6+</option>
          </select>
          {errors.guestCount && (
            <p className="text-red-500 text-sm mt-1">
              {errors.guestCount.message}
            </p>
          )}
        </div>
      )}

      {/* Dietary Restrictions - only show if attending */}
      {attending === 'yes' && (
        <div>
          <label className="block text-sm font-medium mb-2">
            {copy.dietary}
          </label>
          <Input
            {...register('dietaryRestrictions')}
            placeholder={copy.dietaryPlaceholder}
            className="w-full"
          />
        </div>
      )}

      {/* Message */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {copy.message}
        </label>
        <Textarea
          {...register('message')}
          placeholder={copy.messagePlaceholder}
          className="w-full min-h-[100px]"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
        style={{
          backgroundColor: accentColor,
        }}
      >
        {isSubmitting ? copy.submitting : copy.submit}
      </Button>
    </form>
  );
}
