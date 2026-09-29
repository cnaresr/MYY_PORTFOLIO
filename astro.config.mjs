import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  security: {
    checkOrigin: false,
  },
  adapter: vercel({
    includeFiles: ['./content/**'],
  }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
