// @ts-check

import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  // Coolify terminates TLS and forwards the public host to the container.
  // Trust only the configured public builder domain for generated request URLs.
  // CSRF validation itself is performed in src/middleware.ts because a proxy
  // chain may otherwise make Astro compare against an internal HTTP URL.
  security: {
    checkOrigin: false,
    allowedDomains: [
      {
        hostname: 'invitation.fgdev.tech',
        protocol: 'https',
      },
    ],
  },
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react()],
});
