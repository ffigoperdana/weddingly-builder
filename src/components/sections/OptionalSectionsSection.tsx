import type {
  Control,
  FieldErrors,
  UseFieldArrayReturn,
  UseFormRegister,
  UseFormWatch,
} from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { FormField } from '../FormField';
import { Input } from '../ui/input';
import { ImageUpload } from '../ImageUpload';
import { WeddingWishesManager } from '../WeddingWishesManager';
import type { WeddingSiteFormData } from '../../lib/validations';
import { DEFAULT_DRESS_CODE_COLORS } from '../../lib/dress-code';

interface OptionalSectionsSectionProps {
  register: UseFormRegister<WeddingSiteFormData>;
  errors: FieldErrors<WeddingSiteFormData>;
  control: Control<WeddingSiteFormData>;
  watch: UseFormWatch<WeddingSiteFormData>;
  storyTimelineArray: UseFieldArrayReturn<
    WeddingSiteFormData,
    'storyTimeline',
    'id'
  >;
  hasSavedSite: boolean;
}

function SectionToggle({
  name,
  control,
  label,
}: {
  name:
    | 'coupleDetailsEnabled'
    | 'quoteEnabled'
    | 'dressCodeEnabled'
    | 'storyTimelineEnabled'
    | 'liveStreamEnabled'
    | 'rsvpEnabled'
    | 'rsvpGuestCountEnabled'
    | 'wishesEnabled'
    | 'wishesDisplayEnabled';
  control: Control<WeddingSiteFormData>;
  label: string;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={Boolean(field.value)}
            onChange={field.onChange}
            className="h-4 w-4"
          />
          <span className="text-sm font-medium">{label}</span>
        </label>
      )}
    />
  );
}

export function OptionalSectionsSection({
  register,
  errors,
  control,
  watch,
  storyTimelineArray,
  hasSavedSite,
}: OptionalSectionsSectionProps) {
  const coupleDetailsEnabled = watch('coupleDetailsEnabled');
  const quoteEnabled = watch('quoteEnabled');
  const dressCodeEnabled = watch('dressCodeEnabled');
  const storyTimelineEnabled = watch('storyTimelineEnabled');
  const liveStreamEnabled = watch('liveStreamEnabled');
  const rsvpEnabled = watch('rsvpEnabled');
  const rsvpGuestCountEnabled = watch('rsvpGuestCountEnabled');
  const wishesEnabled = watch('wishesEnabled');
  const {
    fields: timelineFields,
    append: appendTimeline,
    remove: removeTimeline,
  } = storyTimelineArray;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Optional Sections</CardTitle>
        <CardDescription>
          Aktifkan hanya bagian yang ingin ditampilkan. Pengaturan ini
          berlaku untuk Classic Romance dan Autumn Pop-up.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <section className="space-y-4 rounded-lg border p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">Couple Details</h3>
              <p className="text-sm text-muted-foreground">
                Nama lengkap, orang tua, dan foto masing-masing mempelai.
              </p>
            </div>
            <SectionToggle
              name="coupleDetailsEnabled"
              control={control}
              label="Tampilkan"
            />
          </div>
          {coupleDetailsEnabled && (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3 rounded-md bg-muted/40 p-3">
                  <h4 className="font-medium">Mempelai wanita</h4>
                  <FormField
                    label="Nama lengkap"
                    name="brideFullName"
                    register={register}
                    errors={errors}
                  />
                  <FormField
                    label="Keterangan orang tua"
                    name="brideParents"
                    register={register}
                    errors={errors}
                    multiline
                    rows={3}
                  />
                  <Controller
                    name="bridePhotoUrl"
                    control={control}
                    render={({ field }) => (
                      <ImageUpload
                        label="Foto mempelai wanita"
                        value={field.value || ''}
                        onChange={field.onChange}
                        onClear={() => field.onChange('')}
                      />
                    )}
                  />
                </div>
                <div className="space-y-3 rounded-md bg-muted/40 p-3">
                  <h4 className="font-medium">Mempelai pria</h4>
                  <FormField
                    label="Nama lengkap"
                    name="groomFullName"
                    register={register}
                    errors={errors}
                  />
                  <FormField
                    label="Keterangan orang tua"
                    name="groomParents"
                    register={register}
                    errors={errors}
                    multiline
                    rows={3}
                  />
                  <Controller
                    name="groomPhotoUrl"
                    control={control}
                    render={({ field }) => (
                      <ImageUpload
                        label="Foto mempelai pria"
                        value={field.value || ''}
                        onChange={field.onChange}
                        onClear={() => field.onChange('')}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-lg border p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">Quote / Ayat</h3>
              <p className="text-sm text-muted-foreground">
                Tampilkan kutipan atau ayat pilihan di antara section.
              </p>
            </div>
            <SectionToggle
              name="quoteEnabled"
              control={control}
              label="Tampilkan"
            />
          </div>
          {quoteEnabled && (
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Quote atau ayat"
                name="quoteText"
                register={register}
                errors={errors}
                multiline
                rows={4}
                required
              />
              <FormField
                label="Sumber quote"
                name="quoteSource"
                placeholder="Contoh: QS. Ar-Rum: 21"
                register={register}
                errors={errors}
              />
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-lg border p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">Dress Code</h3>
              <p className="text-sm text-muted-foreground">
                Beri informasi dress code dan palet warna untuk tamu.
              </p>
            </div>
            <SectionToggle
              name="dressCodeEnabled"
              control={control}
              label="Tampilkan"
            />
          </div>
          {dressCodeEnabled && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="Judul section"
                  name="dressCodeTitle"
                  register={register}
                  errors={errors}
                  required
                />
                <FormField
                  label="Deskripsi"
                  name="dressCodeText"
                  register={register}
                  errors={errors}
                  multiline
                  rows={3}
                />
              </div>
              <Controller
                name="dressCodeColors"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Palet warna
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {DEFAULT_DRESS_CODE_COLORS.map((fallback, index) => {
                        const colors = field.value || [];
                        const color = colors[index] || fallback;
                        return (
                          <label
                            key={index}
                            className="flex items-center gap-2 text-xs text-muted-foreground"
                          >
                            <Input
                              type="color"
                              value={color}
                              onChange={(event) => {
                                const nextColors = [...colors];
                                nextColors[index] = event.target.value;
                                field.onChange(nextColors);
                              }}
                              className="h-10 w-14 p-1"
                            />
                            {color}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              />
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-lg border p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">Story Timeline</h3>
              <p className="text-sm text-muted-foreground">
                Tambahkan beberapa momen penting dalam perjalanan kalian.
              </p>
            </div>
            <SectionToggle
              name="storyTimelineEnabled"
              control={control}
              label="Tampilkan"
            />
          </div>
          {storyTimelineEnabled && (
            <div className="space-y-4">
              {timelineFields.map((field, index) => (
                <div
                  key={field.id}
                  className="space-y-3 rounded-md bg-muted/40 p-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      Momen {index + 1}
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTimeline(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <FormField
                      label="Tahun / tanggal"
                      name={'storyTimeline.' + index + '.year'}
                      register={register}
                      errors={errors}
                      required
                    />
                    <FormField
                      label="Judul momen"
                      name={'storyTimeline.' + index + '.title'}
                      register={register}
                      errors={errors}
                      required
                    />
                  </div>
                  <FormField
                    label="Cerita singkat"
                    name={'storyTimeline.' + index + '.text'}
                    register={register}
                    errors={errors}
                    multiline
                    rows={3}
                    required
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() =>
                  appendTimeline({
                    year: '',
                    title: '',
                    text: '',
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah momen
              </Button>
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-lg border p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">Live Streaming</h3>
              <p className="text-sm text-muted-foreground">
                Tampilkan tombol menuju siaran langsung acara.
              </p>
            </div>
            <SectionToggle
              name="liveStreamEnabled"
              control={control}
              label="Tampilkan"
            />
          </div>
          {liveStreamEnabled && (
            <FormField
              label="URL live streaming"
              name="liveStreamUrl"
              type="url"
              placeholder="https://youtube.com/..."
              register={register}
              errors={errors}
              required
            />
          )}
        </section>

        <section className="space-y-4 rounded-lg border p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">RSVP & Wedding Wishes</h3>
              <p className="text-sm text-muted-foreground">
                Atur konfirmasi kehadiran dan ucapan publik dari tamu.
              </p>
            </div>
            <SectionToggle
              name="rsvpEnabled"
              control={control}
              label="Tampilkan RSVP"
            />
          </div>
          <div className="space-y-3 rounded-md bg-muted/40 p-3">
            {rsvpEnabled && (
              <SectionToggle
                name="rsvpGuestCountEnabled"
                control={control}
                label="Tanyakan jumlah tamu"
              />
            )}
            <SectionToggle
              name="wishesEnabled"
              control={control}
              label="Tampilkan wedding wishes"
            />
            {wishesEnabled && (
              <>
                <SectionToggle
                  name="wishesDisplayEnabled"
                  control={control}
                  label="Tampilkan ucapan tamu kepada publik"
                />
                <p className="text-xs text-muted-foreground">
                  Ucapan tetap dapat dikirim meski daftar ucapan publik
                  disembunyikan. Kamu dapat menghapus ucapan dari daftar
                  moderasi di bawah ini.
                </p>
                <WeddingWishesManager
                  enabled={wishesEnabled}
                  hasSavedSite={hasSavedSite}
                />
              </>
            )}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
