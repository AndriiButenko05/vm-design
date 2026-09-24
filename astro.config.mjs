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

  /*
    Saint-Paul-de-Vence був одним проєктом із трьох квартир; замовниця
    розділила їх на три окремі. Старе посилання веде на першу — з терасою.
  */
  redirects: {
    '/projects/saint-paul-de-vence': '/projects/saint-paul-de-vence-terrace',
  },

  integrations: [
    sitemap({
      // Переглядач креслень — noindex, у карті сайту йому теж не місце.
      filter: (page) => !page.includes('/drawings/'),
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', fr: 'fr', it: 'it', ru: 'ru', uk: 'uk' },
      },
    }),
    react(),
  ],

  /*
    Кодувальник AVIF: сила стиснення замість типової.

    Sharp за замовчуванням кодує AVIF з effort: 4, і на кадрі 840 px це
    1147 мс. Помножено на ~1800 варіантів — близько години процесорного
    часу. Локально на 12 ядрах це 5 хв, а в контейнері Cloudflare з двома
    ядрами збірка впиралася в таймаут на 30 хвилинах.

    Заміряно на чотирьох кадрах, ширина 840:
      effort 4 — 1147 мс, базовий розмір   (типове значення)
      effort 3 —  376 мс, +4.1%
      effort 2 —  233 мс, +9.5%
      effort 0 —  113 мс, +27.1%

    Беремо 2: уп'ятеро швидше за ціну неповних десяти відсотків ваги.
    AVIF навіть так лишається значно легшим за WebP, тож у підсумку
    сторінка все одно виграє.
  */
  /*
    Кеш перетворених зображень — поза node_modules.

    Типове місце — node_modules/.astro, а його стирає кожен npm ci.
    Через це в CI кожна збірка була холодною: 257 МБ готових AVIF і WebP
    викидалися й кодувалися заново. У власній теці кеш переживає
    встановлення залежностей, і його можна просто покласти у кеш CI.
  */
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