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
  // Trust only the configured public builder domain so Astro can keep its
  // CSRF origin check enabled for multipart uploads and other form posts.
  security: {
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
