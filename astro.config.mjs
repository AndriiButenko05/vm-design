// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';
import pruneOriginals from './scripts/prune-originals.mjs';

const SITE = 'https://vmdesignproject.com';
const LOCALES = ['en', 'fr', 'it', 'ru', 'uk'];

// Сторінки fr/it/ru/uk, що рендеряться через fallback, sitemap сам не бачить — перелічуємо їх явно.
const PROJECTS_DIR = new URL('./src/content/projects/en/', import.meta.url);
const projectSlugs = readdirSync(PROJECTS_DIR)
  .filter((f) => f.endsWith('.md') && !/^draft:\s*true/m.test(readFileSync(new URL(f, PROJECTS_DIR), 'utf8')))
  .map((f) => f.replace(/\.md$/, ''));
const fallbackPaths = [
  ...projectSlugs.map((s) => `/projects/${s}/`),
  ...['residential', 'commercial', 'exhibition'].map((t) => `/projects/type/${t}/`),
];
const customPages = LOCALES.filter((l) => l !== 'en').flatMap((l) =>
  fallbackPaths.map((p) => new URL(`/${l}${p}`, SITE).href),
);

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
    '/projects/saint-paul-de-vence': '/projects/saint-paul-de-vence-terrace/',
  },

  integrations: [
    sitemap({
      customPages,
      filter: (page) => !page.includes('/drawings/') && !page.includes('/background-preview') && !page.endsWith('/robots.txt'),
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', fr: 'fr', it: 'it', ru: 'ru', uk: 'uk' },
      },
    }),
    pruneOriginals(),
  ],

  cacheDir: './.astro-cache',

  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: { avif: { effort: 2 } },
    },
  },

  build: { inlineStylesheets: 'always' },

  vite: {
    optimizeDeps: {
      include: ['ogl'],
    },
  },
});