import type { Translation } from '../i18n/types';
import uk from '../i18n/uk';
import ru from '../i18n/ru';
import fr from '../i18n/fr';
import it from '../i18n/it';

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

export function localePath(locale: Locale, pathname = '/'): string {
  const trimmed = pathname.replace(/^\/+|\/+$/g, '');
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  return trimmed ? `${prefix}/${trimmed}/` : `${prefix}/`;
}

export function localeFromUrl(url: URL): Locale {
  const first = url.pathname.split('/').filter(Boolean)[0];
  return first && isLocale(first) ? first : DEFAULT_LOCALE;
}

export function resolveLocale(currentLocale: string | undefined, url: URL): Locale {
  if (currentLocale && isLocale(currentLocale)) return currentLocale;
  return localeFromUrl(url);
}

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
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.menu': 'Menu',
    'nav.close': 'Close',
    'skip': 'Skip to content',

    'hero.line1': 'Your life.',
    'hero.line2': 'Your character.',
    'hero.line3': 'Your interior.',
    'hero.lead': 'Every interior is as individual as the person it is designed for.',
    'hero.role': 'Maryna Vashchenko — architect & interior designer',
    'hero.places': 'French Riviera · Monaco · Italy',
    'hero.scroll': 'Scroll',

    'about.eyebrow': 'The studio',
    'about.title': 'Individual interiors, thoughtfully designed and precisely realised.',
    'about.lead':
      'VM Design is an interior architecture and design studio working across the French Riviera, Monaco and Italy, led by architect and interior designer Maryna Vashchenko.',
    'about.body':
      'Maryna personally leads every project — from the initial site survey and spatial concept to the selection of furniture, lighting and materials, and the supervision of its implementation. A trusted team of technical specialists supports the process under her direction.',
    'about.more': 'About the studio',

    'work.viewAll': 'View all',
    'work.prev': 'Previous',
    'work.next': 'Next',

    'christina.eyebrow': 'One client, eleven projects',
    'christina.title': 'Christina',
    'christina.text':
      'Five retail interiors across France, Monaco, Italy and Germany, and six exhibition stands in three countries. One brand, one designer, four years.',
    'christina.cta': 'See the programme',
    'footer.sections': 'On the site',

    'services.eyebrow': 'Services',
    'services.page.title': 'From first idea to final detail.',
    'services.page.lead':
      'Whether you need a single consultation or support throughout the entire project, our services are tailored to your space, your priorities and the level of involvement you need.',
    'services.more': 'Learn more',
    'services.includes': 'What’s included',

    'ba.eyebrow': 'Before / after',
    'ba.before': 'Before',
    'ba.after': 'After',
    'ba.drag': 'Drag to compare',
    'ba.title': 'The transformation',
    'ba.hint': 'Move the handle to compare the space during renovation and after completion.',
    'ba.prev': 'Previous comparison',
    'ba.next': 'Next comparison',

    'gallery.eyebrow': 'Completed interior',
    'gallery.title': 'Explore the project',
    'gallery.prev': 'Previous photo',
    'gallery.next': 'Next photo',

    'renders3d.eyebrow': '3D visualisation',
    'renders3d.title': 'The design in 3D',

    'process.eyebrow': 'Behind the project',
    'process.title': 'From construction to completion',
    'process.summary':
      'The transformation began with a substantial renovation. See the site before the finished interior took shape.',
    'process.toggle': 'View the process',
    'process.in-progress.title': 'From the flat as found to the works on site',
    'process.in-progress.summary':
      'The apartment before the works, the materials chosen for it, and the renovation as it progresses.',
    'process.design.title': 'The property as found',
    'process.design.summary':
      'Photographs of the apartment before the redesign — the starting point for the new layout.',
    'process.design.toggle': 'View the photos',

    'dwg.eyebrow': 'Design project',
    'dwg.title': 'The drawings',
    'dwg.text':
      'Survey, demolition, layout, services and elevations — the full set of drawings the project is built from.',
    'dwg.sheet': 'drawing sheet',
    'dwg.all': 'View the design project',
    'dwg.back': 'Back to the project',

    'index.eyebrow': 'Selected work',
    'index.title': 'Projects',
    'index.all': 'All projects',

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
    'map.riviera': 'French Riviera',
    'map.france': 'France',
    'map.italy': 'Italy',
    'map.east': 'Poland & Ukraine',
    'map.beyond': 'Also in',

    'contact.eyebrow': 'Contact',
    'contact.title': 'Start a project',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.type': 'Service',
    'contact.message': 'Message',
    'contact.send': 'Send message',
    'contact.lead': 'Share your project details, and I’ll be in touch to discuss the next steps.',
    'contact.sending': 'Sending…',
    'contact.ok': 'Thank you — your message has been sent. I will reply personally.',
    'contact.error': 'Something went wrong. Please write to',

    'project.location': 'Location',
    'project.year': 'Year',
    'project.area': 'Area',
    'project.type': 'Type',
    'project.brand': 'Client',
    'project.scope': 'Scope',
    'project.services': 'Services',
    'project.kind': 'Project',
    'project.about': 'The project',
    'project.materials': 'Materials',
    'project.next': 'Next project',
    'project.view': 'View project',
    'project.m2': 'm²',

    'site.role': 'Architect & interior designer',
    'contact.phone': 'Phone',
    'contact.instagram': 'Instagram',
    'contact.workingIn': 'Working in',
    'contact.other': 'Other',

    'map.projects.one': 'project',
    'map.projects.other': 'projects',
    'dwg.sheets.one': 'sheet',
    'dwg.sheets.other': 'sheets',
    'christina.projects.one': 'project',
    'christina.projects.other': 'projects',
    'christina.cities.one': 'city',
    'christina.cities.other': 'cities',
    'christina.countries.one': 'country',
    'christina.countries.other': 'countries',

    'aria.home': 'VM Design — home',
    'aria.primary': 'Primary',
    'aria.primaryMobile': 'Primary mobile',
    'aria.language': 'Language',
    'aria.pages': 'Pages',
    'aria.sections': 'Sections',
    'aria.filter': 'Filter projects',
    'materials.aria': 'Circular image gallery. Use Left and Right Arrow keys to navigate.',

    'meta.home.title':
      'Interior Designer in Nice, French Riviera & Monaco | VM Design',
    'meta.home.description':
      'Maryna Vashchenko designs residential and commercial interiors in Nice, across the French Riviera, Monaco and Italy — from first concept to site supervision.',
    'meta.about.title':
      'Maryna Vashchenko — Interior Designer in Nice | VM Design',
    'meta.about.description':
      'Architect and interior designer with over 15 years of experience. Maryna Vashchenko personally leads every project on the French Riviera, in Monaco and Italy.',
    'meta.projects.title':
      'Interior Design Projects in Nice, Monaco & Italy | VM Design',
    'meta.projects.description':
      'Villas, apartments, beauty salons and exhibition stands designed by Maryna Vashchenko in Nice, across the French Riviera, in Monaco, Italy and beyond.',
    'meta.services.title':
      'Interior Design Services on the French Riviera | VM Design',
    'meta.services.description':
      'Full-service interior design, design projects, site supervision, furniture sourcing, rental setup and consultations in Nice, Monaco and Italy.',
    'meta.contact.title':
      'Contact an Interior Designer in Nice | VM Design',
    'meta.contact.description':
      'Tell Maryna Vashchenko about your project — a home, villa or salon in Nice, on the French Riviera, in Monaco or Italy. Every enquiry gets a personal reply.',
    'meta.christina.title':
      'Christina: Beauty Spaces & Stands in 5 Countries | VM Design',
    'meta.christina.description':
      'Five beauty spaces and six exhibition stands for the cosmetics brand Christina, designed by Maryna Vashchenko in France, Monaco, Italy, Germany and Hong Kong.',
    'meta.type.residential.title':
      'Residential Interior Design: Villas & Apartments | VM Design',
    'meta.type.residential.description':
      'Villas, houses and apartments in Nice, on the French Riviera, in Italy and beyond — renovations and new-build interiors shaped around the way clients live.',
    'meta.type.commercial.title':
      'Beauty Salon & Commercial Interior Design | VM Design',
    'meta.type.commercial.description':
      'Beauty salons and spaces in Nice, Cannes, Monaco, Paris, Rome and Kassel — layouts planned around daily work and interiors that express each brand.',
    'meta.type.exhibition.title':
      'Exhibition Stand Design for Beauty Brands | VM Design',
    'meta.type.exhibition.description':
      'Exhibition stands for Christina at Cosmoprof Worldwide Bologna, Cosmoprof Asia in Hong Kong and the Congrès International Esthétique & Spa in Paris.',
    'meta.project.residential':
      'Interior Design',
    'meta.project.commercial':
      'Interior Design',
    'meta.project.exhibition':
      'Exhibition Stand Design',
    'meta.stand.more':
      'Stand design and on-site coordination by Maryna Vashchenko.',
    'meta.nf.title': 'Not found — VM Design',
    'meta.nf.description': 'This page does not exist.',

    'meta.designer': 'Maryna Vashchenko',
    'nf.title': 'Nothing here',
    'nf.home': 'Home',

    'about.name.first': 'Maryna',
    'about.name.last': 'Vashchenko',
    'about.quote': '“For me, an interior begins not with a style, but with the person it is created for.”',
    'about.fact.experience': 'Experience',
    'about.fact.experienceValue': 'Over {n} years',
    'about.fact.based': 'Based in',
    'about.fact.across': 'Working across',
    'about.fact.international': 'International experience',
    'about.fact.languages': 'Languages',
    'about.bio.1':
      'Maryna Vashchenko is an architect, interior designer and founder of VM Design, with over 15 years of professional experience.',
    'about.bio.2':
      'After completing her architectural education in Ukraine, Maryna began her career in Kyiv. She worked on residential and commercial interiors, spa complexes and large-scale architectural projects before taking responsibility for project management, site supervision and the coordination of project implementation.',
    'about.bio.3':
      'An important chapter in her professional journey began with projects involving private villas and a yacht on the French Riviera. From 2018, Maryna worked regularly between Kyiv and Nice for three years. This experience established her strong connection with the French Riviera and shaped the international direction of her work.',
    'about.bio.4':
      'Today, VM Design creates residential and commercial interiors across the French Riviera, Monaco, Italy and other European destinations. The studio’s primary focus is residential interior architecture and design, ranging from apartments and holiday residences to private houses and villas. Maryna’s professional experience also includes projects in Germany, Poland, Ukraine and the United States.',
    'about.bio.5':
      'Maryna personally leads every project. She takes the time to understand each client’s lifestyle, tastes and individual needs, conducts site surveys and measurements, develops the design concept and spatial planning, selects furniture, lighting and materials, and coordinates the implementation process.',
    'about.bio.6':
      'Technical drawings and 3D visualisations are developed by trusted specialists under her direction. When required, Maryna also brings together experienced contractors, furniture manufacturers and suppliers. Throughout the entire process, the client remains in direct contact with her and does not have to manage numerous technical and organisational matters independently.',
    'about.bio.7':
      'Her approach combines precise architectural planning, contemporary elegance, carefully selected materials and close attention to the client’s individuality. Rather than imposing a predetermined aesthetic, Maryna finds the right balance between the client’s vision and her own professional experience.',
    'about.bio.8':
      'The aim of every project is to create a beautiful and comfortable interior that reflects the character and way of life of its owners, while ensuring that the completed space remains as faithful as possible to the approved design concept.',
    'about.process.eyebrow': 'Process',
    'about.process.title': 'From survey to the last fitting',
    'about.process.1.title': 'Survey',
    'about.process.1.text': 'Measured drawings of what is actually there, before anything is proposed.',
    'about.process.2.title': 'Concept & planning',
    'about.process.2.text': 'Layout, light and the decision about which material will carry each room.',
    'about.process.3.title': 'Working drawings',
    'about.process.3.text':
      'Demolition, services, elevations and joinery, drawn in full so the site builds what was designed.',
    'about.process.4.title': 'Author supervision',
    'about.process.4.text': 'On site through to the last fitting.',

    'christina.facts.retail': 'Retail interiors',
    'christina.facts.stands': 'Exhibition stands',
    'christina.facts.countries': 'Countries',
    'christina.facts.years': 'Years',
    'christina.retail.eyebrow': 'Retail',
    'christina.retail.title': 'One brand, five rooms, five buildings',
    'christina.retail.text':
      'The same identity had to sit inside a Roman vault, a Paris courtyard, a Monaco storefront, a Cannes terrace and a German street unit. What repeats is the language — arched niches, backlit mirrors, one wall given to the product — not the plan.',
    'christina.stands.eyebrow': 'Exhibitions',
    'christina.stands.title': 'A brand built and dismantled in four days',
    'christina.stands.text':
      'Trade-fair stands work to a different clock than an interior: the whole thing is assembled, used hard for four days and taken apart. Six of them, in Bologna, Paris and Hong Kong.',

    'type.residential': 'Residential',
    'type.residential.text':
      'Private houses, villas and apartments — from new-build interiors to complete renovations. Each project is developed around the client’s lifestyle, the architecture of the property and the character of its location.',
    'type.commercial': 'Commercial & Beauty Spaces',
    'type.commercial.text':
      'Beauty salons and spaces designed around the people who work in them and the clients they welcome. Thoughtful planning supports everyday routines, while each interior expresses the identity of its brand.',
    'type.exhibition': 'Exhibition Design',
    'type.exhibition.text':
      'Exhibition stands designed to present a brand with clarity and impact. Each project brings together the visual concept, the needs of the venue and the practical details of installation.',
  },

  fr: {},
  it: {},
  ru: {},
  uk: {},
};

const packs: Partial<Record<Locale, Translation>> = { uk, ru, fr, it };

/** Переклад мови цілком — або undefined, якщо його ще немає. */
export function pack(locale: Locale): Translation | undefined {
  return locale === DEFAULT_LOCALE ? undefined : packs[locale];
}

export function t(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  let out = pack(locale)?.ui[key] ?? ui[DEFAULT_LOCALE][key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) out = out.replace(`{${k}}`, String(v));
  return out;
}

/**
 * Слово для числа: «1 project / 3 projects», «1 проєкт / 3 проєкти / 5 проєктів».
 * Ключі — base.one, base.few, base.many, base.other (правила Intl.PluralRules).
 */
export function tp(locale: Locale, base: string, n: number): string {
  const rule = new Intl.PluralRules(locale).select(n);
  const own = pack(locale)?.ui;
  const en = ui[DEFAULT_LOCALE];
  return own?.[`${base}.${rule}`] ?? own?.[`${base}.other`] ?? en[`${base}.${n === 1 ? 'one' : 'other'}`] ?? base;
}

/** Назва міста, країни, регіону чи мови. */
export function place(locale: Locale, name: string): string {
  return pack(locale)?.places[name] ?? name;
}

/** Підпис фото або назва матеріалу. */
export function caption<T extends string | undefined>(locale: Locale, text: T): T {
  if (!text) return text;
  return (pack(locale)?.captions[text] as T) ?? text;
}

export function translator(locale: Locale) {
  return (key: string) => t(locale, key);
}
