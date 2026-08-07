import { useMemo, useState } from 'react';
import type {
  FieldErrors,
  UseFormRegister,
  UseFormWatch,
} from 'react-hook-form';
import { Check, Copy, ExternalLink } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { FormField } from '../FormField';
import type { WeddingSiteFormData } from '../../lib/validations';
import {
  buildWhatsAppUrl,
  DEFAULT_WHATSAPP_MESSAGE_TEMPLATE,
  parseGuestList,
  renderWhatsAppMessage,
  validateGuestPhone,
  type ParsedGuestContact,
} from '../../lib/personalized-invitations';

interface PublishingSectionProps {
  register: UseFormRegister<WeddingSiteFormData>;
  errors: FieldErrors<WeddingSiteFormData>;
  watch: UseFormWatch<WeddingSiteFormData>;
}

export function PublishingSection({
  register,
  errors,
  watch,
}: PublishingSectionProps) {
  const slug = watch('slug');
  const brideName = watch('brideName') || '';
  const groomName = watch('groomName') || '';
  const heroImageUrl = watch('heroImageUrl') || '';
  const [guestBulkInput, setGuestBulkInput] = useState('');
  const [guestContacts, setGuestContacts] = useState<
    ParsedGuestContact[]
  >([]);
  const [messageTemplate, setMessageTemplate] = useState(
    DEFAULT_WHATSAPP_MESSAGE_TEMPLATE,
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const getContactError = (contact: ParsedGuestContact) => {
    if (!contact.name.trim()) {
      return 'Nama tamu wajib diisi.';
    }

    if (!contact.phone.trim()) {
      return (
        contact.error || validateGuestPhone(contact.phone) || undefined
      );
    }

    return validateGuestPhone(contact.phone);
  };

  const validGuestCount = useMemo(
    () =>
      guestContacts.filter((contact) => !getContactError(contact)).length,
    [guestContacts],
  );

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://invitation.fgdev.tech';
  };

  const generatePersonalizedUrl = (guestName: string) => {
    if (!slug || !guestName.trim()) return '';
    const encodedName = encodeURIComponent(guestName.trim());
    return `${getBaseUrl()}/${slug}?to=${encodedName}`;
  };

  const getContactMessage = (
    contact: ParsedGuestContact,
    invitationUrl: string,
  ) =>
    renderWhatsAppMessage(messageTemplate, {
      guestName: contact.name.trim(),
      brideName: brideName.trim(),
      groomName: groomName.trim(),
      coupleName:
        [brideName.trim(), groomName.trim()].filter(Boolean).join(' & ') ||
        'Kedua mempelai',
      invitationUrl,
    });

  const handleGuestBulkInput = (value: string) => {
    setGuestBulkInput(value);
    setGuestContacts(parseGuestList(value));
    setCopiedKey(null);
  };

  const updateGuestContact = (
    index: number,
    field: 'name' | 'phone',
    value: string,
  ) => {
    setGuestContacts((current) =>
      current.map((contact, currentIndex) => {
        if (currentIndex !== index) return contact;

        if (field === 'phone') {
          return {
            ...contact,
            phone: value,
            error: validateGuestPhone(value) || undefined,
          };
        }

        return { ...contact, name: value };
      }),
    );
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publishing Settings</CardTitle>
        <CardDescription>
          Configure your wedding website URL and security
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Website URL Slug
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              invitation.fgdev.tech/
            </span>
            <Input
              {...register('slug')}
              placeholder="jane-and-john"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Leave empty to auto-generate from couple names
          </p>
          {errors.slug && (
            <p className="text-sm text-red-500">
              {errors.slug.message}
            </p>
          )}
        </div>

        <FormField
          label="Password Protection (Optional)"
          name="password"
          type="text"
          placeholder="Leave empty for no password"
          register={register}
          errors={errors}
        />
        <p className="text-xs text-muted-foreground -mt-2">
          Guests will need this password to view your website
        </p>

        {slug && (
          <div className="border-t pt-4 mt-6">
            <h3 className="text-sm font-medium mb-3">
              Generate Personalized Invitations
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Tempel satu tamu per baris dengan format{' '}
              <strong>Nama Tamu [spasi/tab] Nomor WhatsApp</strong>.
              Daftar akan otomatis dipindai.
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">
                  Daftar Nama dan Nomor WhatsApp
                </label>
                <Textarea
                  value={guestBulkInput}
                  onChange={(event) =>
                    handleGuestBulkInput(event.target.value)
                  }
                  placeholder={'Wahid\t081216195308\nFigo\t0812161475308'}
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">
                  Nomor wajib angka saja, diawali 0, dan panjangnya
                  10–13 digit.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">
                  Template Pesan WhatsApp
                </label>
                <Textarea
                  value={messageTemplate}
                  onChange={(event) =>
                    setMessageTemplate(event.target.value)
                  }
                  rows={12}
                />
                <p className="text-xs text-muted-foreground">
                  Token yang tersedia: {'{guestName}'},{' '}
                  {'{coupleName}'}, {'{brideName}'}, {'{groomName}'},{' '}
                  {'{invitationUrl}'}.
                </p>
              </div>

              {guestContacts.length > 0 && (
                <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold">
                      Kontak terdeteksi
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {validGuestCount}/{guestContacts.length} valid
                    </span>
                  </div>

                  {guestContacts.map((contact, index) => {
                    const contactError = getContactError(contact);
                    const isValid = !contactError;
                    const invitationUrl = isValid
                      ? generatePersonalizedUrl(contact.name)
                      : '';
                    const whatsappMessage = isValid
                      ? getContactMessage(contact, invitationUrl)
                      : '';
                    const whatsappUrl = isValid
                      ? buildWhatsAppUrl(contact.phone, whatsappMessage)
                      : '';
                    const invitationKey = `invitation-${index}`;
                    const whatsappKey = `whatsapp-${index}`;

                    return (
                      <div
                        key={`${contact.name}-${index}`}
                        className="space-y-3 rounded-md border bg-white p-3"
                      >
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-1">
                            <label className="text-xs font-medium">
                              Nama tamu {index + 1}
                            </label>
                            <Input
                              value={contact.name}
                              onChange={(event) =>
                                updateGuestContact(
                                  index,
                                  'name',
                                  event.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium">
                              Nomor WhatsApp
                            </label>
                            <Input
                              value={contact.phone}
                              onChange={(event) =>
                                updateGuestContact(
                                  index,
                                  'phone',
                                  event.target.value,
                                )
                              }
                              inputMode="numeric"
                              aria-invalid={Boolean(contactError)}
                            />
                          </div>
                        </div>

                        {contactError && (
                          <p className="text-xs text-red-600">
                            {contactError}
                          </p>
                        )}

                        {isValid && (
                          <div className="space-y-3 rounded-md bg-gray-50 p-3">
                            <div className="space-y-1">
                              <label className="text-xs font-medium">
                                Link undangan personal
                              </label>
                              <div className="flex items-center gap-2">
                                <Input
                                  value={invitationUrl}
                                  readOnly
                                  className="bg-white text-xs"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    copyToClipboard(
                                      invitationUrl,
                                      invitationKey,
                                    )
                                  }
                                >
                                  {copiedKey === invitationKey ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-medium">
                                Link WhatsApp dengan pesan otomatis
                              </label>
                              <div className="flex items-center gap-2">
                                <Input
                                  value={whatsappUrl}
                                  readOnly
                                  className="bg-white text-xs"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    copyToClipboard(
                                      whatsappUrl,
                                      whatsappKey,
                                    )
                                  }
                                >
                                  {copiedKey === whatsappKey ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-green-700 underline"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Buka WhatsApp
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
                {heroImageUrl ? (
                  <p>
                    Hero image akan dipakai otomatis sebagai metadata
                    preview ketika link undangan dibagikan di WhatsApp.
                  </p>
                ) : (
                  <p>
                    Upload Hero Image agar preview link WhatsApp memiliki
                    gambar.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
