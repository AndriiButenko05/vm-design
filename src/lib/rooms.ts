/**
 * Порядок кімнат у галереях проєктів — погоджений із замовницею.
 *
 * Кожне фото й 3D мають позначку room у frontmatter; сторінка проєкту
 * сортує кадри за цим порядком, а в межах кімнати лишає порядок файлу.
 * Кабінет (study) і туалет у салоні (wc) у переліку замовниці не було —
 * вони стоять поруч із найближчими за змістом кімнатами.
 */
export const RESIDENTIAL_ORDER = [
  'living',
  'dining',
  'kitchen',
  'bedroom',
  'children',
  'study',
  'bathroom',
  'wc',
  'hall',
  'dressing',
] as const;

export const COMMERCIAL_ORDER = ['salon', 'stations', 'cabins', 'wc', 'reception', 'entrance'] as const;

export const ROOMS = [...new Set([...RESIDENTIAL_ORDER, ...COMMERCIAL_ORDER])] as [string, ...string[]];

type Item = { src: ImageMetadata; room?: string; pin?: boolean };

/**
 * Кадри за порядком кімнат. Без позначки — у кінці, як були.
 * Якщо в жодного кадру немає кімнати, це порядок Марини (її нумерація) —
 * лишаємо його як є. Кадри з pin: true стають першими.
 * Інакше, якщо першим випадає кадр, що вже стоїть головним на сторінці,
 * його міняємо місцями з наступним кадром тієї ж кімнати, щоб галерея не
 * починалася з повтору.
 */
export function byRoom<T extends Item>(items: T[], type: string, heroSrc?: ImageMetadata): T[] {
  const order: readonly string[] =
    type === 'residential' ? RESIDENTIAL_ORDER : type === 'commercial' ? COMMERCIAL_ORDER : [];
  if (!order.length || !items.some((it) => it.room)) return items;
  const rank = (it: T) => (it.room ? order.indexOf(it.room) : order.length);
  const sorted = [...items].sort((a, b) => rank(a) - rank(b));
  const pinned = sorted.filter((it) => it.pin);
  if (pinned.length) return [...pinned, ...sorted.filter((it) => !it.pin)];
  if (heroSrc && sorted[0]?.src === heroSrc) {
    const j = sorted.findIndex((it, i) => i > 0 && it.room === sorted[0].room);
    if (j > 0) [sorted[0], sorted[j]] = [sorted[j], sorted[0]];
  }
  return sorted;
}
