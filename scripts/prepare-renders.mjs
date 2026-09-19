/**
 * Готує 3D-візуалізації до збірки.
 *
 *   node scripts/prepare-renders.mjs
 *
 * На відміну від реалізованих проєктів, візуалізації замовниця просила
 * НЕ ділити за об'єктами — лише за типом приміщення (як розділ AMBIENTI
 * у Pistore Marmi, який вона надіслала як референс).
 *
 * Тип визначається з імені файлу: замовниця іменувала їх російською
 * («кухня-гостиная», «гостевой санузел»). Кадри без змістовної назви
 * (IMG_*, unnamed) розкладені вручну після перегляду — див. BY_FILENAME.
 *
 * Пише src/assets/renders/<room>/ і src/data/renders.json.
 */

import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, '.source', '3D-raw', '3D');
const OUT = path.join(ROOT, 'src', 'assets', 'renders');
const MANIFEST = path.join(ROOT, 'src', 'data', 'renders.json');

const MAX_EDGE = 1800;

/** Розділи. Порядок тут = порядок на сторінці. */
export const ROOMS = [
  { slug: 'kitchen-living', title: 'Kitchen & Living' },
  { slug: 'bedrooms', title: 'Bedrooms' },
  { slug: 'bathrooms', title: 'Bathrooms' },
  { slug: 'hallways', title: 'Hallways' },
  { slug: 'childrens-rooms', title: "Children's Rooms" },
  { slug: 'dressing-rooms', title: 'Dressing Rooms' },
  { slug: 'studies', title: 'Studies' },
];

/**
 * Кадри без змістовного імені — розкладені після візуального перегляду.
 * Ключ — початок імені файлу.
 */
const BY_FILENAME = [
  [/^IMG_(789[234]|793[9]|794[012])/i, 'bedrooms'],
  [/^IMG_84(3[789]|4[01])/i, 'bathrooms'],
  [/^img4/i, 'kitchen-living'],
  [/^unnamed/i, 'childrens-rooms'],
];

/**
 * Правила за змістом імені. Порядок важливий:
 * «сан уз детский» — це санвузол, а не дитяча, тому санвузол перевіряється раніше.
 */
const BY_KEYWORD = [
  [/сан\s*уз|санузел/i, 'bathrooms'],
  [/гардеробн/i, 'dressing-rooms'],
  [/кабинет/i, 'studies'],
  [/коридор/i, 'hallways'],
  [/комната\s+саши|детск(ая|ой)/i, 'childrens-rooms'],
  [/кухня|гостиная/i, 'kitchen-living'],
  [/спальн|гостевая/i, 'bedrooms'],
];

function classify(file) {
  for (const [re, room] of BY_FILENAME) if (re.test(file)) return room;
  for (const [re, room] of BY_KEYWORD) if (re.test(file)) return room;
  return null;
}

/** Латинський slug із кириличного імені — для назв файлів на диску. */
function slugify(name, index) {
  const map = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
    и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
    с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh',
    щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };
  const base = path
    .basename(name, path.extname(name))
    .toLowerCase()
    .split('')
    .map((ch) => map[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${String(index).padStart(3, '0')}-${base || 'render'}`.slice(0, 60);
}

async function main() {
  const files = (await fs.readdir(SRC)).filter((f) => /\.jpe?g$/i.test(f)).sort();

  const buckets = Object.fromEntries(ROOMS.map((r) => [r.slug, []]));
  const unmatched = [];
  const lowRes = [];

  let i = 0;
  for (const file of files) {
    const room = classify(file);
    if (!room) {
      unmatched.push(file);
      continue;
    }

    const destDir = path.join(OUT, room);
    await fs.mkdir(destDir, { recursive: true });

    const name = `${slugify(file, i++)}.jpg`;
    const dest = path.join(destDir, name);

    const pipeline = sharp(path.join(SRC, file)).rotate();
    const { dominant } = await pipeline.clone().stats();
    const hex = (n) => n.toString(16).padStart(2, '0');

    await pipeline
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
      // Без .withMetadata() — метадані рендерів теж не тягнемо у продакшн.
      .jpeg({ quality: 86, mozjpeg: true })
      .toFile(dest);

    const out = await sharp(dest).metadata();
    if (Math.min(out.width, out.height) < 1000) lowRes.push(`${room}/${name} (${out.width}×${out.height})`);

    buckets[room].push({
      file: name,
      width: out.width,
      height: out.height,
      ratio: +(out.width / out.height).toFixed(4),
      orientation: out.height > out.width ? 'portrait' : 'landscape',
      colour: `#${hex(dominant.r)}${hex(dominant.g)}${hex(dominant.b)}`,
      // Прибирає з підпису службові номери, лишає зміст.
      source: file,
    });
  }

  const manifest = {
    rooms: ROOMS.map((r) => ({ ...r, count: buckets[r.slug].length, items: buckets[r.slug] })),
  };
  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 1) + '\n');

  for (const r of manifest.rooms) console.log(`  ${r.slug.padEnd(18)} ${String(r.count).padStart(3)} кадрів`);
  console.log(`\n  разом ${files.length - unmatched.length} з ${files.length}`);
  if (unmatched.length) console.warn(`  ! не класифіковано: ${unmatched.join(', ')}`);
  if (lowRes.length) {
    console.warn(`\n  ! низька роздільність (< 1000px по короткій стороні): ${lowRes.length}`);
    for (const l of lowRes.slice(0, 10)) console.warn(`      ${l}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
