import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.ctech.web.id',
  output: 'server',
  security: {
    checkOrigin: false,
  },
  adapter: vercel(),
  integrations: [
    react(),
    sitemap({
      // The console and its API routes are not public content.
      filter: (page) =>
        !page.includes('/user/admin') && !page.includes('/api/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
