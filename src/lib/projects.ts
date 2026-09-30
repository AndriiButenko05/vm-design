import { getCollection, type CollectionEntry } from 'astro:content';
import { DEFAULT_LOCALE, caption, isLocale, localePath, pack, t, type Locale } from './i18n';

/** Проєкт; bodyText — перекладені абзаци опису, коли переклад є. */
export type Project = CollectionEntry<'projects'> & { bodyText?: string[] };

export const PROJECT_TYPES = ['residential', 'commercial', 'exhibition'] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export function typeFilters(locale: Locale) {
  return [
    { key: 'all', href: localePath(locale, '/projects'), label: t(locale, 'index.all') },
    ...PROJECT_TYPES.map((type) => ({
      key: type,
      href: localePath(locale, `/projects/type/${type}`),
      label: t(locale, `type.${type}`),
    })),
  ];
}

export function parseId(id: string): { locale: Locale; slug: string } {
  const [maybeLocale, ...rest] = id.split('/');
  return isLocale(maybeLocale)
    ? { locale: maybeLocale, slug: rest.join('/') }
    : { locale: DEFAULT_LOCALE, slug: id };
}

export function slugOf(entry: Project): string {
  return parseId(entry.id).slug;
}

export async function getProjects(
  locale: Locale = DEFAULT_LOCALE,
  { includeDrafts = false } = {},
): Promise<Project[]> {
  const all = await getCollection('projects');

  const bySlug = new Map<string, Project>();
  for (const entry of all) {
    const parsed = parseId(entry.id);
    if (parsed.locale === DEFAULT_LOCALE) bySlug.set(parsed.slug, entry);
  }
  if (locale !== DEFAULT_LOCALE) {
    for (const entry of all) {
      const parsed = parseId(entry.id);
      if (parsed.locale === locale) bySlug.set(parsed.slug, entry);
    }
  }

  return [...bySlug.values()]
    .filter((p) => includeDrafts || !p.data.draft)
    .sort((a, b) => a.data.order - b.data.order)
    .map((p) => localize(p, locale));
}

/**
 * Проєкт мовою сторінки: текст з перекладу (src/i18n/<мова>.ts), фото й
 * решта даних — з англійського файлу. Чого в перекладі немає, лишається
 * англійською.
 */
export function localize(p: Project, locale: Locale): Project {
  const tr = pack(locale);
  if (!tr) return p;
  const pt = tr.projects[slugOf(p)] ?? {};
  const cap = <T extends { caption?: string; material?: string }>(it: T): T => ({
    ...it,
    caption: caption(locale, it.caption),
    ...('material' in it ? { material: caption(locale, it.material) } : {}),
  });
  const d = p.data;
  const title = pt.title ?? d.title;
  // Alt має вигляд «Назва проєкту[ рік] — опис»: назву беремо перекладену, опис — зі словника.
  const altText = (text: string) => {
    const i = text.indexOf(' — ');
    if (i < 0) return tr.alts[text] ?? text;
    const head = text.slice(0, i);
    const rest = text.slice(i + 3);
    const year = head.match(/^(.*) (\d{4})$/);
    const name = head === d.title ? title : year && year[1] === d.title ? `${title} ${year[2]}` : head;
    return `${name} — ${tr.alts[rest] ?? rest}`;
  };
  const alt = <T extends { alt: string }>(it: T): T => ({ ...it, alt: altText(it.alt) });
  return {
    ...p,
    bodyText: pt.body,
    data: {
      ...d,
      title,
      card: pt.card ?? d.card,
      summary: pt.summary ?? d.summary,
      heroCaption: pt.heroCaption ?? d.heroCaption,
      scope: pt.scope ?? d.scope,
      coverAlt: altText(d.coverAlt),
      hero: d.hero?.map(alt),
      gallery: d.gallery.map((it) => alt(cap(it))),
      renders: d.renders.map((it) => alt(cap(it))),
      beforeAfter: d.beforeAfter && {
        ...d.beforeAfter,
        images: d.beforeAfter.images.map((it) => alt(cap(it))),
        pairs: d.beforeAfter.pairs.map(cap),
      },
    },
  };
}

export async function getFeatured(locale: Locale = DEFAULT_LOCALE): Promise<Project[]> {
  return (await getProjects(locale)).filter((p) => p.data.featured);
}

export type CityGroup = {
  city: string;
  country: string;
  coords: { lat: number; lon: number };
  projects: Project[];
};

export function groupByCity(projects: Project[]): CityGroup[] {
  const map = new Map<string, CityGroup>();
  for (const p of projects) {
    const key = p.data.city;
    if (!map.has(key)) {
      map.set(key, {
        city: p.data.city,
        country: p.data.country,
        coords: p.data.coords,
        projects: [],
      });
    }
    map.get(key)!.projects.push(p);
  }
  return [...map.values()].sort((a, b) => b.projects.length - a.projects.length);
}

export function metaLine(p: Project, typeLabel: string): string {
  return [p.data.city, typeLabel, p.data.year].filter(Boolean).join(' · ');
}
