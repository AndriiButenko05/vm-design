/**
 * Готує фото замовниці до збірки.
 *
 *   node scripts/prepare-images.mjs --all    # уся партія — щоб було з чого відбирати
 *   node scripts/prepare-images.mjs          # тільки відібране в src/data/curation.json
 *
 * Три потоки з .source/Project Marina new/:
 *   projects/<тека>   реалізовані інтер'єри   → src/assets/projects/<slug>/
 *   fairs/<подія>     виставкові стенди        → src/assets/projects/<slug>/  (теж проєкти)
 *   services/         процес: зразки, плани    → src/assets/services/
 *   AOZ06673.jpg      портрет                  → src/assets/portrait.jpg
 *
 * З кожним кадром робимо:
 *   1. поворот за EXIF;
 *   2. ЗНЯТТЯ ВСІХ МЕТАДАНИХ — у сирих файлах є GPS-координати житла клієнтів;
 *   3. масштаб до 2000 px по довшій стороні;
 *   4. домінантний колір — плейсхолдер до завантаження, 0 KB JS;
 *   5. запис у маніфест src/data/images.json.
 */

import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, '.source', 'Project Marina new');
const OUT_PROJECTS = path.join(ROOT, 'src', 'assets', 'projects');
const OUT_SERVICES = path.join(ROOT, 'src', 'assets', 'services');
const MANIFEST = path.join(ROOT, 'src', 'data', 'images.json');
const CURATION = path.join(ROOT, 'src', 'data', 'curation.json');

const MAX_EDGE = 2000;
const ALL = process.argv.includes('--all');

/** Реалізовані інтер'єри: тека в архіві → slug на сайті. */
const INTERIORS = {
  'Nice villa': 'la-villa-nice',
  'Monza Italy': 'monza-apartment',
  'Nice Larimar': 'larimar-nice',
  'Nice Wow Hair': 'wow-hair-nice',
  Paris: 'christina-paris',
  Roma: 'christina-roma',
  Cannes: 'christina-cannes',
  Monaco: 'christina-monaco',
  'Germany Kassel': 'christina-kassel',
};

/**
 * Виставкові стенди — теж проєкти, просто іншого типу.
 * Назву самої виставки не вигадуємо: у Bologna це майже напевно Cosmoprof,
 * але підтвердження від замовниці ще немає. Тому slug нейтральний.
 */
const FAIRS = {
  'Bologna 2024': 'stand-bologna-2024',
  'Bologna 2025': 'stand-bologna-2025',
  'Bologna 2026': 'stand-bologna-2026',
  'Paris 2025': 'stand-paris-2025',
  'Paris 2026': 'stand-paris-2026',
  'Hong Kong 2026': 'stand-hong-kong-2026',
};

const isPhoto = (f) => /\.jpe?g$/i.test(f);

async function dominantColour(file) {
  const { dominant } = await sharp(file).stats();
  const hex = (n) => n.toString(16).padStart(2, '0');
  return `#${hex(dominant.r)}${hex(dominant.g)}${hex(dominant.b)}`;
}

async function processOne(srcFile, destFile) {
  // rotate() без аргументів застосовує EXIF-орієнтацію та скидає її.
  await sharp(srcFile)
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
    // Без .withMetadata() — sharp за замовчуванням не переносить EXIF,
    // тому GPS і серійний номер камери у вихідний файл не потрапляють.
    .jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(destFile);

  const meta = await sharp(destFile).metadata();
  return {
    width: meta.width,
    height: meta.height,
    ratio: +(meta.width / meta.height).toFixed(4),
    orientation: meta.height > meta.width ? 'portrait' : 'landscape',
    colour: await dominantColour(destFile),
  };
}

/** Латинське ім'я файлу на виході: стабільне, без пробілів і кирилиці. */
function destName(file, index) {
  const base = path
    .basename(file, path.extname(file))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${String(index).padStart(3, '0')}-${base || 'img'}.jpg`.slice(0, 64);
}

/**
 * @param keep  null | string[] | { after: string[], before: string[] }
 *              Масив зберігає порядок відбору: after[0] стає обкладинкою.
 */
async function processFolder(srcDir, destDir, keep) {
  let files;
  try {
    files = (await fs.readdir(srcDir)).filter(isPhoto).sort();
  } catch {
    console.warn(`  ! теки немає: ${path.relative(SRC, srcDir)}`);
    return [];
  }

  // Індекс потрібен для стабільного імені файлу — воно не має мінятися
  // від того, що кадр підняли вище в курації.
  const indexOf = new Map(files.map((f, i) => [f, i]));

  /** Порядок виводу: спершу «після» в порядку курації, далі «до». */
  let plan;
  if (!keep) {
    plan = files.map((f) => ({ file: f, role: 'after' }));
  } else if (Array.isArray(keep)) {
    plan = keep.filter((f) => indexOf.has(f)).map((f) => ({ file: f, role: 'after' }));
  } else {
    plan = [
      ...(keep.after ?? []).map((f) => ({ file: f, role: 'after' })),
      ...(keep.before ?? []).map((f) => ({ file: f, role: 'before' })),
    ].filter((p) => indexOf.has(p.file));
  }

  await fs.mkdir(destDir, { recursive: true });

  const items = [];
  for (const { file, role } of plan) {
    const name = destName(file, indexOf.get(file));
    const dest = path.join(destDir, name);

    let info;
    try {
      await fs.access(dest);
      const meta = await sharp(dest).metadata();
      info = {
        width: meta.width,
        height: meta.height,
        ratio: +(meta.width / meta.height).toFixed(4),
        orientation: meta.height > meta.width ? 'portrait' : 'landscape',
        colour: await dominantColour(dest),
      };
    } catch {
      info = await processOne(path.join(srcDir, file), dest);
    }

    items.push({ file: name, source: file, role, ...info });
  }
  return items;
}

/** Прибирає з теки все, чого немає в поточному відборі. */
async function prune(destDir, keepNames) {
  let existing;
  try {
    existing = await fs.readdir(destDir);
  } catch {
    return 0;
  }
  let removed = 0;
  for (const f of existing) {
    if (!keepNames.has(f)) {
      await fs.unlink(path.join(destDir, f));
      removed++;
    }
  }
  return removed;
}

async function main() {
  let curation = null;
  if (!ALL) {
    try {
      curation = JSON.parse(await fs.readFile(CURATION, 'utf8'));
    } catch {
      console.log('curation.json немає — обробляю всю партію (як із --all).\n');
    }
  }

  const manifest = { projects: {}, services: [], portrait: null };

  console.log('  ІНТЕРʼЄРИ');
  for (const [folder, slug] of Object.entries(INTERIORS)) {
    const items = await processFolder(
      path.join(SRC, 'projects', folder),
      path.join(OUT_PROJECTS, slug),
      curation?.[slug],
    );
    manifest.projects[slug] = items;
    const dropped = await prune(path.join(OUT_PROJECTS, slug), new Set(items.map((i) => i.file)));
    const land = items.filter((i) => i.orientation === 'landscape').length;
    const before = items.filter((i) => i.role === 'before').length;
    console.log(
      `    ${slug.padEnd(20)} ${String(items.length).padStart(3)} кадрів ` +
        `(${items.length - before} після · ${before} до · ${land} гориз.)` +
        (dropped ? `  вилучено ${dropped}` : ''),
    );
  }

  console.log('\n  ВИСТАВКОВІ СТЕНДИ');
  for (const [folder, slug] of Object.entries(FAIRS)) {
    const items = await processFolder(
      path.join(SRC, 'fairs', folder),
      path.join(OUT_PROJECTS, slug),
      curation?.[slug],
    );
    manifest.projects[slug] = items;
    const dropped = await prune(path.join(OUT_PROJECTS, slug), new Set(items.map((i) => i.file)));
    console.log(
      `    ${slug.padEnd(20)} ${String(items.length).padStart(3)} кадрів` +
        (dropped ? `  вилучено ${dropped}` : ''),
    );
  }

  console.log('\n  ПРОЦЕС');
  manifest.services = await processFolder(
    path.join(SRC, 'services'),
    OUT_SERVICES,
    curation?.services,
  );
  console.log(`    services${' '.repeat(13)} ${String(manifest.services.length).padStart(3)} кадрів`);

  // Портрет — єдина професійна зйомка самої Марини.
  const portraitSrc = path.join(SRC, 'AOZ06673.jpg');
  const portraitDest = path.join(ROOT, 'src', 'assets', 'portrait.jpg');
  try {
    await fs.access(portraitSrc);
    try {
      await fs.access(portraitDest);
    } catch {
      manifest.portrait = await processOne(portraitSrc, portraitDest);
    }
  } catch {
    console.warn('  ! портрета немає');
  }

  await fs.mkdir(path.dirname(MANIFEST), { recursive: true });
  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 1) + '\n');

  const total = Object.values(manifest.projects).reduce((n, a) => n + a.length, 0) + manifest.services.length;
  console.log(`\n  разом ${total} кадрів`);
  console.log(`  маніфест: ${path.relative(ROOT, MANIFEST)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
