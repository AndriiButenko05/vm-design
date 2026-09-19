import { getCollection, type CollectionEntry } from 'astro:content';
import { DEFAULT_LOCALE, isLocale, localePath, t, type Locale } from './i18n';

export type Project = CollectionEntry<'projects'>;

/**
 * Типи проєктів — одне джерело правди.
 *
 * Раніше перелік фільтрів був виписаний окремо на /projects і окремо на
 * /projects/type/[type], і вони розійшлися: «exhibition» додали лише в
 * перший. Тому з будь-якої сторінки типу третій фільтр просто зникав,
 * і повернутися до виставок було нічим.
 */
export const PROJECT_TYPES = ['residential', 'commercial', 'exhibition'] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

/** Посилання фільтра: «всі» плюс по одному на кожен тип. */
export function typeFilters(locale: Locale) {
  return [
    { key: 'all', href: localePath(locale, '/projects'), label: t(locale, 'index.all') },
    ...PROJECT_TYPES.map((type) => ({
      key: type,
      href: localePath(locale, `/projects/type/${type}`),
      label: t(locale, `index.${type}`),
    })),
  ];
}

/** id має вигляд "en/la-villa-nice" — розбираємо на локаль і slug. */
export function parseId(id: string): { locale: Locale; slug: string } {
  const [maybeLocale, ...rest] = id.split('/');
  return isLocale(maybeLocale)
    ? { locale: maybeLocale, slug: rest.join('/') }
    : { locale: DEFAULT_LOCALE, slug: id };
}

export function slugOf(entry: Project): string {
  return parseId(entry.id).slug;
}

/**
 * Проєкти для заданої локалі, з фолбеком на EN.
 * Поки перекладів немає, IT та FR отримують англійський вміст —
 * це свідоме рішення, зафіксоване і в astro.config (i18n.fallback).
 */
export async function getProjects(
  locale: Locale = DEFAULT_LOCALE,
  { includeDrafts = false } = {},
): Promise<Project[]> {
  const all = await getCollection('projects');

  const bySlug = new Map<string, Project>();
  // Спершу кладемо англійські, потім перекриваємо локалізованими.
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

/**
 * Маркери на карті — по містах, не по проєктах.
 * Інакше три проєкти в Ніцці лягли б в одну точку.
 */
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

/** Рядок фактів під назвою в індексі: «Nice · Private residence · 2025». */
export function metaLine(p: Project, typeLabel: string): string {
  return [p.data.city, typeLabel, p.data.year].filter(Boolean).join(' · ');
}
