import { SITE } from './site';
import { localePath, t, place, type Locale } from './i18n';

export const OG_LOCALE: Record<Locale, string> = {
  en: 'en_GB',
  fr: 'fr_FR',
  it: 'it_IT',
  ru: 'ru_RU',
  uk: 'uk_UA',
};

type Node = Record<string, unknown>;

export function siteGraph(site: URL, locale: Locale): Node[] {
  const home = new URL('/', site).href;
  return [
    {
      '@type': 'WebSite',
      '@id': `${home}#website`,
      url: home,
      name: SITE.name,
      inLanguage: locale,
      publisher: { '@id': `${home}#studio` },
    },
    {
      '@type': 'ProfessionalService',
      '@id': `${home}#studio`,
      name: SITE.name,
      url: home,
      logo: new URL('/brand/apple-touch-icon.png', site).href,
      image: new URL('/brand/apple-touch-icon.png', site).href,
      email: SITE.email,
      telephone: SITE.phone.replace(/\s/g, ''),
      address: { '@type': 'PostalAddress', addressLocality: 'Nice', addressCountry: 'FR' },
      areaServed: ['French Riviera', 'Monaco', 'France', 'Italy'].map((name) => ({
        '@type': name === 'French Riviera' ? 'Place' : 'Country',
        name,
      })),
      founder: { '@id': `${home}#maryna` },
      hasMap: SITE.mapsUrl,
      sameAs: [SITE.instagramUrl, SITE.mapsUrl],
      ...(SITE.legal.vat ? { vatID: `IT${SITE.legal.vat}` } : {}),
    },
    {
      '@type': 'Person',
      '@id': `${home}#maryna`,
      name: SITE.designer,
      jobTitle: t(locale, 'site.role'),
      worksFor: { '@id': `${home}#studio` },
      knowsLanguage: ['en', 'fr', 'it', 'uk', 'ru'],
      sameAs: [SITE.instagramUrl],
    },
  ];
}

const TITLE_MAX = 65;

/** «Назва[ рік][, місто] — вид робіт | VM Design»; якщо задовго, спершу випадає вид робіт, потім місто. */
export function projectTitle(
  locale: Locale,
  p: { title: string; enTitle: string; type: string; city: string; year?: number },
): string {
  const name = p.type === 'exhibition' && p.year ? `${p.title} ${p.year}` : p.title;
  const withCity = p.enTitle.includes(p.city) ? name : `${name}, ${place(locale, p.city)}`;
  const kind = t(locale, `meta.project.${p.type}`);
  const candidates = [`${withCity} — ${kind} | VM Design`, `${withCity} | VM Design`, `${name} | VM Design`];
  return candidates.find((c) => c.length <= TITLE_MAX) ?? candidates[candidates.length - 1];
}

export function breadcrumbs(site: URL, items: { name: string; path: string }[]): Node {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: new URL(it.path, site).href,
    })),
  };
}

export function projectNode(
  site: URL,
  locale: Locale,
  p: { slug: string; title: string; summary: string; year?: number; city: string; country: string; image: string },
): Node {
  const home = new URL('/', site).href;
  return {
    '@type': 'CreativeWork',
    '@id': `${new URL(localePath(locale, `/projects/${p.slug}`), site).href}#project`,
    name: p.title,
    description: p.summary,
    image: p.image,
    inLanguage: locale,
    ...(p.year ? { dateCreated: String(p.year) } : {}),
    locationCreated: { '@type': 'Place', name: `${place(locale, p.city)}, ${place(locale, p.country)}` },
    creator: { '@id': `${home}#maryna` },
    publisher: { '@id': `${home}#studio` },
  };
}
