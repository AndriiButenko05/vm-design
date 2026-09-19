// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import react from '@astrojs/react';

// TODO: замінити на фінальний домен перед релізом (впливає на sitemap і canonical).
const SITE = 'https://vm-design.pages.dev';

export default defineConfig({
  site: SITE,

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'it', 'ru', 'uk'],
    routing: {
      // EN живе без префікса: /about. IT та FR — /it/about, /fr/about.
      prefixDefaultLocale: false,
      // rewrite, а не redirect: локалізований URL віддає англійський вміст
      // на своєму ж URL, а не відкидає користувача на англійську версію.
      fallbackType: 'rewrite',
    },
    // Поки перекладу немає — локалізований URL віддає англійський вміст, а не 404.
    // Знімається, коли комплект перекладів стане повним.
    fallback: { fr: 'en', it: 'en', ru: 'en', uk: 'en' },
  },

  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', fr: 'fr', it: 'it', ru: 'ru', uk: 'uk' },
      },
    }),
    react(),
  ],

  build: { inlineStylesheets: 'auto' },

  vite: {
    optimizeDeps: {
      /*
        ogl доходить до Vite лише через острів CircularGallery, і сканер
        при старті його не бачив: пребандл збирався без нього, а модуль
        просив /node_modules/.vite/deps/ogl.js, якого не існувало —
        звідси «Failed to fetch dynamically imported module» і 504.

        Явне include змушує зібрати його одразу при старті.
      */
      include: ['ogl'],
    },
  },
});