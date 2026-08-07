export interface ParsedGuestContact {
  name: string;
  phone: string;
  error?: string;
}

export interface WhatsAppMessageValues {
  guestName: string;
  brideName: string;
  groomName: string;
  coupleName: string;
  invitationUrl: string;
}

/**
 * The phone number must be Indonesian local format: digits only, beginning
 * with 0, and 10–13 digits in total.
 */
export function validateGuestPhone(phone: string): string | null {
  const value = phone.trim();

  if (!value) {
    return 'Nomor WhatsApp wajib diisi.';
  }

  if (!/^\d+$/.test(value)) {
    return 'Nomor WhatsApp hanya boleh berisi angka.';
  }

  if (!value.startsWith('0')) {
    return 'Nomor WhatsApp harus diawali angka 0.';
  }

  if (value.length < 10 || value.length > 13) {
    return 'Nomor WhatsApp harus terdiri dari 10–13 digit.';
  }

  return null;
}

/**
 * Parse one guest per line. The last whitespace-separated token is treated
 * as the phone number, so names may contain spaces.
 */
export function parseGuestList(input: string): ParsedGuestContact[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(.+?)\s+(\S+)$/);

      if (!match) {
        return {
          name: line,
          phone: '',
          error: 'Gunakan format: Nama Tamu [spasi/tab] Nomor WhatsApp.',
        };
      }

      const name = match[1].trim();
      const phone = match[2].trim();

      return {
        name,
        phone,
        error: validateGuestPhone(phone) || undefined,
      };
    });
}

export function toWhatsAppPhone(phone: string): string {
  const value = phone.trim();
  return '+62' + value.slice(1);
}

export function buildWhatsAppUrl(
  phone: string,
  message: string,
): string {
  return (
    'https://wa.me/' +
    toWhatsAppPhone(phone) +
    '?text=' +
    encodeURIComponent(message)
  );
}

export function renderWhatsAppMessage(
  template: string,
  values: WhatsAppMessageValues,
): string {
  const replacements: Record<string, string> = {
    guestName: values.guestName,
    brideName: values.brideName,
    groomName: values.groomName,
    coupleName: values.coupleName,
    invitationUrl: values.invitationUrl,
  };

  return template.replace(
    /\{(guestName|brideName|groomName|coupleName|invitationUrl)\}/g,
    (_, token: string) => replacements[token] || '',
  );
}

export const DEFAULT_WHATSAPP_MESSAGE_TEMPLATE = `WEDDING INVITATION

Bismillahirrahmanirrahim
Assalamualaikum Warahmatullahi Wabarakatuh

Kepada Yth
{guestName}

Dengan ini perkenankan kami mengundang Bapak/Ibu/Saudara/i, teman sekaligus sahabat untuk hadir & memberikan doa restu pada acara pernikahan kami:

{coupleName}

Untuk informasi lebih lengkap mengenai Detail Acara, Lokasi, dan Waktu, silahkan kunjungi link di bawah ini:

{invitationUrl}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restunya.

Karena keterbatasan jarak dan waktu, kami memohon maaf perihal undangan yang hanya dikirimkan melalui e-invitation ini.
Atas waktu dan perhatiannya, kami ucapkan terima kasih.`;
