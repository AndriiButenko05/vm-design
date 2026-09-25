import { getCollection, type CollectionEntry } from 'astro:content';
import { DEFAULT_LOCALE, isLocale, localePath, t, type Locale } from './i18n';

export type Project = CollectionEntry<'projects'>;

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
    .sort((a, b) => a.data.order - b.data.order);
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
