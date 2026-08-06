import { defineMiddleware } from 'astro:middleware';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const PRODUCTION_ORIGIN = 'https://invitation.fgdev.tech';
const LOCAL_ORIGINS = new Set([
  'http://localhost:4321',
  'http://127.0.0.1:4321',
]);

function isTrustedOrigin(origin: string | null): boolean {
  if (!origin) return false;

  if (origin === PRODUCTION_ORIGIN) return true;

  return process.env.NODE_ENV !== 'production' && LOCAL_ORIGINS.has(origin);
}

/**
 * Keeps unsafe requests same-origin without relying on reverse-proxy headers.
 * Coolify/Cloudflare may terminate TLS before the Astro Node server, making
 * Astro's default URL-based check compare the browser's HTTPS origin with an
 * internal HTTP URL.
 */
export const onRequest = defineMiddleware((context, next) => {
  if (SAFE_METHODS.has(context.request.method)) {
    return next();
  }

  if (!isTrustedOrigin(context.request.headers.get('origin'))) {
    return new Response(
      JSON.stringify({ error: 'Cross-site request forbidden' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  return next();
});
