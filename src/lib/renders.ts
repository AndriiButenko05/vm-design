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

const files = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/renders/**/*.jpg',
  { eager: true },
);

const byKey = new Map<string, ImageMetadata>();
for (const [p, mod] of Object.entries(files)) {
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

export function coverOf(room: Room): RenderItem {
  return room.items.find((i) => i.orientation === 'landscape') ?? room.items[0];
}

export function captionFor(room: Room, index: number): string {
  return `${room.title} — ${String(index + 1).padStart(2, '0')}`;
}
