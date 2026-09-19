import manifest from '../data/renders.json';

export type RenderItem = {
  file: string;
  width: number;
  height: number;
  ratio: number;
  orientation: 'portrait' | 'landscape';
  colour: string;
  source: string;
};

export type Room = {
  slug: string;
  title: string;
  count: number;
  items: RenderItem[];
};

/**
 * Зображення підтягуються через import.meta.glob, бо в маніфесті лише імена файлів.
 * eager: true — це build-time імпорт, у клієнтський бандл нічого не потрапляє.
 */
const files = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/renders/**/*.jpg',
  { eager: true },
);

const byKey = new Map<string, ImageMetadata>();
for (const [p, mod] of Object.entries(files)) {
  // '../assets/renders/bedrooms/007-32-spalnya.jpg' -> 'bedrooms/007-32-spalnya.jpg'
  const key = p.split('/renders/')[1];
  byKey.set(key, mod.default);
}

export function imageFor(room: string, file: string): ImageMetadata {
  const img = byKey.get(`${room}/${file}`);
  if (!img) throw new Error(`renders: немає зображення ${room}/${file}`);
  return img;
}

export const ROOMS: Room[] = (manifest.rooms as Room[]).filter((r) => r.count > 0);

export function getRoom(slug: string): Room | undefined {
  return ROOMS.find((r) => r.slug === slug);
}

export const TOTAL_RENDERS = ROOMS.reduce((n, r) => n + r.count, 0);

/**
 * Обкладинка розділу — перший горизонтальний кадр.
 * Рендери переважно альбомні (103 зі 112), і саме вони добре тримають
 * картку розділу; вертикальні лишаємо для самої галереї.
 */
export function coverOf(room: Room): RenderItem {
  return room.items.find((i) => i.orientation === 'landscape') ?? room.items[0];
}

/**
 * Підпис під кадром у галереї. Замовниця іменувала файли російською
 * («2 вар кухня-гостиная 03»), тому в інтерфейс це не виводимо —
 * лишається назва розділу та порядковий номер.
 */
export function captionFor(room: Room, index: number): string {
  return `${room.title} — ${String(index + 1).padStart(2, '0')}`;
}
