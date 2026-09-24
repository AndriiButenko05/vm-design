import manifest from '../data/drawings.json';

export type DrawingPage = {
  file: string;
  width: number;
  height: number;
};

export type DrawingSet = {
  slug: string;
  title: string;
  /** slug проєкту, до якого належить комплект; null — проєкту на сайті немає. */
  project: string | null;
  pages: DrawingPage[];
  count: number;
  redactions: number;
};


/**
 * Глоб НЕ eager.
 *
 * З `eager: true` Astro реєструє всі 193 аркуші як ассети й копіює оригінал
 * кожного в збірку — навіть тих, що ніде не використані. Це давало 137 файлів
 * і ~24 МБ мертвої ваги. Ліниві імпорти резолвляться лише для потрібних
 * аркушів, тому в `dist` потрапляє тільки те, що справді на сторінці.
 */
const loaders = import.meta.glob<{ default: ImageMetadata }>('../assets/drawings/**/*.jpg');

const byKey = new Map<string, () => Promise<{ default: ImageMetadata }>>();
for (const [p, load] of Object.entries(loaders)) {
  byKey.set(p.split('/drawings/')[1], load);
}

export const SETS: DrawingSet[] = manifest.sets as DrawingSet[];

/**
 * Комплекти креслень проєкту.
 *
 * Їх може бути кілька: у Saint-Paul-de-Vence три квартири в одному будинку,
 * і кожна має власний комплект. На сайті це один проєкт.
 */
export function setsForProject(slug: string): DrawingSet[] {
  return SETS.filter((s) => s.project === slug);
}

/** Скільки всього аркушів у проєкта. */
export function totalPages(sets: DrawingSet[]): number {
  return sets.reduce((n, s) => n + s.count, 0);
}

export type ResolvedSheet = {
  img: ImageMetadata;
  set: DrawingSet;
};

/** Усі аркуші всіх комплектів проєкту, по порядку — для переглядача. */
export async function allSheets(sets: DrawingSet[]): Promise<ResolvedSheet[]> {
  const out: ResolvedSheet[] = [];
  for (const set of sets) {
    for (const page of set.pages) {
      const load = byKey.get(`${set.slug}/${page.file}`);
      if (load) out.push({ img: (await load()).default, set });
    }
  }
  return out;
}

/** Скільки аркушів показуємо на сторінці проєкту до кнопки «усі креслення». */
export const PREVIEW_COUNT = 3;

/**
 * Два-три аркуші для сторінки проєкту.
 *
 * picks — номери аркушів із frontmatter (drawingsPreview: ["007", "008"]):
 * найвиразніші аркуші в кожному комплекті різні, і вгадувати їх кодом
 * гірше, ніж назвати руками. Без picks беруться перші аркуші після
 * обкладинки — у всіх комплектах це обмірний план і демонтаж.
 */
export async function previewSheets(sets: DrawingSet[], picks?: string[]): Promise<ResolvedSheet[]> {
  const files = picks?.length
    ? picks.map((p) => `${p.replace(/\.jpg$/, '')}.jpg`)
    : null;

  const chosen: { set: DrawingSet; file: string }[] = [];
  for (const set of sets) {
    const available = set.pages.map((p) => p.file);
    const wanted = files ? available.filter((f) => files.includes(f)) : available.slice(1);
    // порядок — як у picks, а не як у комплекті
    if (files) wanted.sort((a, b) => files.indexOf(a) - files.indexOf(b));
    for (const file of wanted) chosen.push({ set, file });
  }

  const out: ResolvedSheet[] = [];
  for (const { set, file } of chosen.slice(0, PREVIEW_COUNT)) {
    const load = byKey.get(`${set.slug}/${file}`);
    if (load) out.push({ img: (await load()).default, set });
  }
  return out;
}

/**
 * Переглядач повного комплекту — /drawings/<проєкт>.
 *
 * Сторінка з аркушами-картинками, а не PDF: замовниця попросила, щоб
 * комплект не можна було скачати одним файлом.
 */
export function viewerPath(project: string): string {
  return `/drawings/${project}`;
}
