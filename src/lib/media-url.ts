/**
 * Keep media uploaded before the imgproxy URL fix working. Older URLs may
 * contain raw colons in the processing path, which the public proxy rejects.
 */
export function normalizeImgproxyUrl(
  url: string | null | undefined,
): string | undefined {
  if (!url) return undefined;

  const plainMarker = '/plain/';
  const markerIndex = url.indexOf(plainMarker);
  const schemeIndex = url.indexOf('://');

  if (markerIndex === -1 || schemeIndex === -1) {
    return url;
  }

  const pathStart = url.indexOf('/', schemeIndex + 3);

  if (pathStart === -1 || pathStart >= markerIndex) {
    return url;
  }

  const optionsPath = url.slice(pathStart + 1, markerIndex);
  const encodedOptions = optionsPath
    .split('/')
    .map((option) => option.replace(/:/g, '%3A'))
    .join('/');

  return (
    url.slice(0, pathStart + 1) +
    encodedOptions +
    url.slice(markerIndex)
  );
}
