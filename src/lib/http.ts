/**
 * Reads an API error without assuming that every upstream response is JSON.
 * Reverse proxies and framework middleware can return plain-text errors.
 */
export async function getResponseError(
  response: Response,
  fallback: string,
): Promise<string> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const payload = await response.json().catch(() => null);
    if (
      payload &&
      typeof payload === 'object' &&
      'error' in payload &&
      typeof payload.error === 'string' &&
      payload.error.trim()
    ) {
      return payload.error;
    }
  }

  const text = await response.text().catch(() => '');
  return text.trim() || fallback;
}
