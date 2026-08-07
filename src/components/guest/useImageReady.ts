import { useEffect, useState } from 'react';

/**
 * Preload a prominent image before applying it as a CSS background.
 * Failed images are marked ready as well so the page can fall back to its
 * normal color treatment instead of waiting forever.
 */
export function useImageReady(url?: string): boolean {
  const [readyUrl, setReadyUrl] = useState<string | null>(() =>
    url ? null : '',
  );

  useEffect(() => {
    if (!url) {
      setReadyUrl('');
      return;
    }

    let cancelled = false;
    const image = new window.Image();
    image.decoding = 'async';

    const markReady = () => {
      if (!cancelled) {
        setReadyUrl(url);
      }
    };

    image.onload = markReady;
    image.onerror = markReady;
    image.src = url;

    if (image.complete) {
      markReady();
    }

    return () => {
      cancelled = true;
      image.onload = null;
      image.onerror = null;
    };
  }, [url]);

  return !url || readyUrl === url;
}
