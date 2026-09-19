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
 * Скільки аркушів показуємо публічно.
 *
 * Повні комплекти — це 193 сторінки робочої документації: рівень деталізації,
 * який конкуренту цікавіший, ніж клієнту. Тому за замовчуванням іде вибірка,
 * а повний комплект — за запитом через форму. Рішення замовниці ще чекаємо;
 * щоб показати все, достатньо підняти це число.
 */
export const PUBLIC_PAGES = 8;

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

/**
 * Публічна вибірка аркушів по всіх комплектах проєкту.
 *
 * Вибірку беремо з КОЖНОГО комплекту окремо: інакше проєкт із трьох квартир
 * показав би вісім аркушів першої, а дві інші не з'явилися б зовсім.
 */
export async function publicSheets(sets: DrawingSet[]): Promise<ResolvedSheet[]> {
  const out: ResolvedSheet[] = [];

  for (const set of sets) {
    for (const page of set.pages.slice(0, PUBLIC_PAGES)) {
      const load = byKey.get(`${set.slug}/${page.file}`);
      if (!load) continue;
      out.push({ img: (await load()).default, set });
    }
  }

  return out;
}
