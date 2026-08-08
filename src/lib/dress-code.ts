export const DEFAULT_DRESS_CODE_COLORS = [
  '#5f2e20',
  '#a84d28',
  '#d18a38',
  '#e5bf72',
  '#6e6542',
];

export function resolveDressCodeColors(colors?: string[]) {
  if (!colors?.length) {
    return [...DEFAULT_DRESS_CODE_COLORS];
  }

  return [
    ...DEFAULT_DRESS_CODE_COLORS.map(
      (fallback, index) => colors[index] || fallback,
    ),
    ...colors.slice(DEFAULT_DRESS_CODE_COLORS.length),
  ];
}
