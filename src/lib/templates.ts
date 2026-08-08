export const WEDDING_TEMPLATE_IDS = ['classic', 'autumn', 'flory'] as const;

export type WeddingTemplateId = (typeof WEDDING_TEMPLATE_IDS)[number];

export const WEDDING_TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic Romance',
    description:
      'Tampilan elegan dengan envelope pembuka dan nuansa romantis yang sudah ada di Weddingly.',
  },
  {
    id: 'autumn',
    name: 'Autumn Pop-up',
    description:
      'Undangan hangat bernuansa autumn dengan cover pop-up, countdown, kartu acara, dan galeri.',
  },
  {
    id: 'flory',
    name: 'Flory Garden',
    description:
      'Undangan cerah penuh bunga, pepohonan, dan bingkai foto bernuansa taman romantis.',
  },
] as const satisfies ReadonlyArray<{
  id: WeddingTemplateId;
  name: string;
  description: string;
}>;

export function isWeddingTemplateId(
  value: unknown,
): value is WeddingTemplateId {
  return (
    typeof value === 'string' &&
    WEDDING_TEMPLATE_IDS.includes(value as WeddingTemplateId)
  );
}

export function getWeddingTemplate(value: unknown) {
  const templateId = isWeddingTemplateId(value)
    ? value
    : 'classic';

  return (
    WEDDING_TEMPLATES.find((template) => template.id === templateId) ||
    WEDDING_TEMPLATES[0]
  );
}
