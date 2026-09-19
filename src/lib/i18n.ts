/**
 * Порядок тут = порядок у перемикачі, і він відповідає реальним ринкам:
 * англійська як база, далі Лазурний берег та Італія, далі клієнтська база.
 * Переклади доливаються по одному — доки їх немає, працює фолбек на EN.
 */
export const LOCALES = ['en', 'fr', 'it', 'ru', 'uk'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  it: 'Italiano',
  ru: 'Русский',
  uk: 'Українська',
};

/** Короткий підпис у перемикачі мов. */
export const LOCALE_SHORT: Record<Locale, string> = {
  en: 'EN',
  fr: 'FR',
  it: 'IT',
  ru: 'RU',
  uk: 'UA',
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * Будує шлях із урахуванням локалі.
 * EN — без префікса (/about), решта — з ним (/it/about).
 */
export function localePath(locale: Locale, pathname = '/'): string {
  const clean = '/' + pathname.replace(/^\/+/, '');
  if (locale === DEFAULT_LOCALE) return clean === '/' ? '/' : clean.replace(/\/$/, '');
  return `/${locale}${clean === '/' ? '' : clean.replace(/\/$/, '')}`;
}

/** Витягує локаль з URL сторінки. */
export function localeFromUrl(url: URL): Locale {
  const first = url.pathname.split('/').filter(Boolean)[0];
  return first && isLocale(first) ? first : DEFAULT_LOCALE;
}

/**
 * Поточна локаль сторінки.
 *
 * Береться з Astro.currentLocale, а не з URL: при fallbackType 'rewrite'
 * сторінка /it/about рендериться з англійського маршруту, тож
 * Astro.url.pathname там дорівнює '/about' і локаль по ньому не визначити.
 */
export function resolveLocale(currentLocale: string | undefined, url: URL): Locale {
  if (currentLocale && isLocale(currentLocale)) return currentLocale;
  return localeFromUrl(url);
}

/**
 * Прибирає префікс локалі — щоб перемикач мов вів на ТУ САМУ сторінку,
 * а не на головну (типова помилка мультимовних сайтів).
 */
export function stripLocale(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length && isLocale(parts[0])) parts.shift();
  return '/' + parts.join('/');
}

type Dict = Record<string, string>;

const ui: Record<Locale, Dict> = {
  en: {
    'nav.work': 'Work',
    'nav.renders': 'Visualisations',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.menu': 'Menu',
    'nav.close': 'Close',
    'skip': 'Skip to content',

    // Слоган замовниці — він, а не назва дисципліни, відкриває сайт.
    'hero.line1': 'Your life.',
    'hero.line2': 'Your character.',
    'hero.line3': 'Your interior.',
    'hero.lead': 'Every interior is as individual as the person it is designed for.',
    'hero.role': 'Maryna Vashchenko — architect & interior designer',
    'hero.places': "Côte d'Azur · Monaco · Italy · Germany",
    'hero.scroll': 'Scroll',

    // ─── Коротке «про мене» на головній ──────────────────────
    'about.eyebrow': 'The studio',
    'about.title': 'Fifteen years of reading people before drawing rooms',
    'about.lead':
      'I am Maryna Vashchenko — an architect and interior designer working between the Côte d’Azur, Monaco, Italy and Germany.',
    'about.body':
      'I lead every project myself: the survey, the concept, the drawings, the choice of every material, and the site until the last fitting. Clients speak to me, not to a department.',
    'about.more': 'More about the studio',

    // ─── Блоки робіт ─────────────────────────────────────────
    'work.residential.title': 'Residential',
    'work.residential.text':
      'Private houses, villas and apartments. Full renovations that begin with a measured survey and end on site.',
    'work.commercial.title': 'Commercial',
    'work.commercial.text':
      'Salons, clinics and retail across five countries — spaces that have to work every day and still look considered.',
    'work.exhibition.title': 'Exhibitions',
    'work.exhibition.text':
      'Trade-fair stands in Bologna, Paris and Hong Kong: a brand built and dismantled in four days.',
    'work.renders.title': 'Visualisations',
    'work.renders.text':
      'Interiors drawn before they are built, arranged by room rather than by project.',
    'work.viewAll': 'View all',
    'work.prev': 'Previous',
    'work.next': 'Next',

    // ─── Christina ───────────────────────────────────────────
    'christina.eyebrow': 'One client, eleven projects',
    'christina.title': 'Christina',
    'christina.text':
      'Five retail interiors across France, Monaco, Italy and Germany, and six exhibition stands in three countries. One brand, one designer, four years.',
    'christina.cta': 'See the programme',
    'footer.sections': 'On the site',
    'footer.services': 'Services',
    'christina.projects': 'projects',
    'christina.cities': 'cities',
    'christina.countries': 'countries',

    // ─── Services ────────────────────────────────────────────
    'services.eyebrow': 'What the studio does',
    'services.title': 'From the first measurement to the last fitting',

    // ─── До / після ──────────────────────────────────────────
    'ba.eyebrow': 'Before / after',
    'ba.before': 'Before',
    'ba.after': 'After',
    'ba.drag': 'Drag to compare',
    'ba.frames': 'frames',
    'ba.frame': 'frame',

    // ─── Креслення ───────────────────────────────────────────
    'dwg.eyebrow': 'Documentation',
    'dwg.title': 'Drawn in full before it is built',
    'dwg.text':
      'Survey, demolition, services, elevations and joinery — a complete working set, so the site builds what was designed rather than what was improvised.',
    'dwg.showing': 'Showing',
    'dwg.of': 'of',
    'dwg.request': 'Request the full set',
    'dwg.link': 'See the drawings',
    'dwg.sheets': 'sheets',

    'index.eyebrow': 'Selected work',
    'index.title': 'Projects',
    'index.all': 'All projects',
    'index.residential': 'Residential',
    'index.commercial': 'Commercial',
    'index.exhibition': 'Exhibitions',

    'renders.eyebrow': '3D',
    'renders.title': 'Visualisations',
    'renders.lead':
      'Interiors drawn before they are built. Arranged by room, not by project — a bathroom is a bathroom whether it stands in Nice or in Rome.',
    'renders.images': 'images',
    'renders.rooms': 'rooms',
    'renders.next': 'Next room',
    'renders.zoom': 'open larger',
    'renders.close': 'Close',
    'renders.prev': 'Previous image',
    'renders.nextImage': 'Next image',

    'approach.eyebrow': 'Approach',
    'approach.title': 'Every space is read before it is drawn',
    'materials.eyebrow': 'Materials',
    'materials.title': 'Stone, brass, plaster, oak',

    'map.eyebrow': 'Geography',
    'map.title': 'Where the work is',
    'map.hint': 'Drag to move, scroll to zoom',
    'map.reset': 'Reset view',
    'map.riviera': "Côte d'Azur",
    'map.italy': 'Italy',
    'map.list': 'All locations',
    'map.projects': 'projects',
    'map.project': 'project',
    'map.beyond': 'Beyond Europe',

    'contact.eyebrow': 'Contact',
    'contact.title': 'Start a project',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.type': 'Project type',
    'contact.message': 'Message',
    'contact.send': 'Send message',
    'contact.lead': 'Tell me about the space and how you want to live in it.',
    'contact.sending': 'Sending…',
    'contact.ok': 'Thank you — your message has been sent. I will reply personally.',
    'contact.error': 'Something went wrong. Please write to',

    'project.location': 'Location',
    'project.year': 'Year',
    'project.area': 'Area',
    'project.type': 'Type',
    'project.brand': 'Client',
    'project.scope': 'Scope',
    'project.materials': 'Materials',
    'project.next': 'Next project',
    'project.view': 'View project',
    'type.residential': 'Residential',
    'type.commercial': 'Commercial',
    'type.exhibition': 'Exhibition',
  },

  // Перекладів ще немає. Порожній словник — не помилка: t() падає
  // на англійський рядок, тому /fr, /it, /ru, /uk вже робочі сторінки.
  // Доливаємо мову по одній, у порядку LOCALES.
  fr: {},
  it: {},
  ru: {},
  uk: {},
};

export function t(locale: Locale, key: string): string {
  return ui[locale]?.[key] ?? ui[DEFAULT_LOCALE][key] ?? key;
}

/** Зручний хелпер: const _ = translator(locale); _('nav.work') */
export function translator(locale: Locale) {
  return (key: string) => t(locale, key);
}
