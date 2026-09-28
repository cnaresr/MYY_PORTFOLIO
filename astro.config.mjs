import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  outDir: './dist_app',
  // security.checkOrigin rejects multipart POSTs because @astrojs/node drops
  // the Host-header port when building context.url (origin mismatch -> 403
  // "Cross-site POST form submissions are forbidden"). CSRF is still covered:
  // admin endpoints sit behind the session middleware in src/middleware.ts and
  // the session cookie is SameSite=Strict.
  security: {
    checkOrigin: false,
  },
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [react()],
  vite: {
    cacheDir: './.vite_cache',
    plugins: [tailwindcss()],
  },
});
