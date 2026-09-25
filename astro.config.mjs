// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const SITE = 'https://vm-design.pages.dev';

export default defineConfig({
  site: SITE,

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'it', 'ru', 'uk'],
    routing: {
      prefixDefaultLocale: false,
      fallbackType: 'rewrite',
    },
    fallback: { fr: 'en', it: 'en', ru: 'en', uk: 'en' },
  },

  redirects: {
    '/projects/saint-paul-de-vence': '/projects/saint-paul-de-vence-terrace',
  },

  integrations: [
    sitemap({
      filter: (page) => !page.includes('/drawings/'),
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', fr: 'fr', it: 'it', ru: 'ru', uk: 'uk' },
      },
    }),
  ],

  cacheDir: './.astro-cache',

  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: { avif: { effort: 2 } },
    },
  },

  build: { inlineStylesheets: 'auto' },

  vite: {
    optimizeDeps: {
      include: ['ogl'],
    },
  },
});