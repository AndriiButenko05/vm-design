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
    'nav.work': 'Projects',
    'nav.services': 'Services',
    'nav.renders': 'Design Projects',
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
    'hero.places': 'French Riviera · Monaco · Italy',
    'hero.scroll': 'Scroll',

    // ─── Коротке «про мене» на головній ──────────────────────
    /*
      Текст авторський, від замовниці, і він свідомо переведений із
      першої особи в третю: раніше блок починався «I am Maryna
      Vashchenko…» і представляв людину, тепер — студію. Це те саме
      зміщення, про яке весь її фідбек: VM Design має читатися як
      студія інтер'єрної архітектури, а не як персональна сторінка.
    */
    'about.eyebrow': 'The studio',
    'about.title': 'Individual interiors, thoughtfully designed and precisely realised.',
    'about.lead':
      'VM Design is an interior architecture and design studio working across the French Riviera, Monaco and Italy, led by architect and interior designer Maryna Vashchenko.',
    'about.body':
      'Maryna personally leads every project — from the initial site survey and spatial concept to the selection of furniture, lighting and materials, and the supervision of its implementation. A trusted team of technical specialists supports the process under her direction.',
    'about.more': 'About the studio',

    // ─── Блоки робіт ─────────────────────────────────────────
    /*
      Назви й описи категорій лежать у type.* — див. нижче.

      Раніше їх було три окремі набори: index.* для фільтрів на
      /projects, type.* для бейджа проєкту і work.*.title для рейок на
      головній. Вони встигли розійтися ще до того, як це помітили:
      фільтр казав «Exhibitions», бейдж — «Exhibition». Тепер джерело
      одне, і розходитися немає чому.

      Тут лишилася тільки рейка візуалізацій: це не тип проєкту.
    */
    'work.renders.title': 'Design Projects',
    'work.renders.text':
      'Complete interior design projects presented through 3D visualisations and technical documentation, allowing every key decision to be developed before construction begins.',
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
    'christina.projects': 'projects',
    'christina.cities': 'cities',
    'christina.countries': 'countries',

    // ─── Services ────────────────────────────────────────────
    'services.eyebrow': 'Services',
    'services.title': 'How we can work together',
    'services.lead':
      'From a single consultation to a complete interior delivered and styled — each format covers a different amount of the work, so the studio fits the project rather than the other way round.',
    /*
      Окремого «All services» під списком немає: кожна картка веде на
      свою послугу, і загальне посилання поруч із п'ятьма конкретними
      нічого не додавало. Сам розділ доступний із головного меню.
    */
    'services.more': 'Learn more',
    'services.includes': 'What’s included',

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

    'renders.eyebrow': '3D',
    'renders.title': 'Design Projects',
    /*
      Попередній текст стверджував, що розділ упорядкований «за кімнатою,
      а не за проєктом — ванна є ванна, чи вона в Ніцці, чи в Римі».
      Замовниця вказала, що це суперечить самій ідеї студії: у неї кожен
      простір залежить від людини, архітектури й місця.
    */
    'renders.lead':
      'Complete interior design projects presented through 3D visualisations and technical documentation, allowing every key decision to be developed before construction begins.',
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
    'materials.title': 'Marble, wood, glass, metal, textiles',

    'map.eyebrow': 'Geography',
    'map.title': 'Where the work is',
    'map.hint': 'Drag to move, scroll to zoom',
    'map.reset': 'Reset view',
    'map.riviera': 'French Riviera',
    'map.italy': 'Italy',
    'map.list': 'All locations',
    'map.projects': 'projects',
    'map.project': 'project',
    /*
      Було «Beyond Europe» — доки поза картою лишався сам лише Гонконг.
      Тепер туди ж потрапив Kassel, а він у Європі, тож попередній підпис
      став би просто неправдою.
    */
    'map.beyond': 'Also in',

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
    /*
      Єдине джерело назв категорій: фільтри на /projects, заголовок
      /projects/type/*, бейдж проєкту, підпис на карті й рейки головної
      читають саме ці ключі. Тексти — авторські, від замовниці.
    */
    'type.residential': 'Residential',
    'type.residential.text':
      'Private houses, villas and apartments — from new-build interiors to complete renovations. Each project is developed around the client’s lifestyle, the architecture of the property and the character of its location.',
    'type.commercial': 'Commercial & Beauty Spaces',
    'type.commercial.text':
      'Beauty spaces, retail interiors, offices and showrooms designed around the client journey, operational needs and the identity of the brand.',
    'type.exhibition': 'Exhibition Design',
    'type.exhibition.text':
      'Exhibition stands and temporary spaces that translate a brand into a clear, memorable spatial experience.',
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
