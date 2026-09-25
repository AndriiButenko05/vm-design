import fs from 'node:fs/promises';
import path from 'node:path';
import { sourceDir } from './_folders.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'src', 'data', 'curation.json');

const PICKS = {
  'christina-kassel': {
    after: [4, 3, 13, 5, 12, 6, 8, 2, 7, 14, 15, 11, 1],
    before: [20, 21, 18, 23, 19],
  },
  'la-villa-nice': {
    after: [5, 7, 34, 28, 16, 43, 25, 30, 22, 32, 20, 21, 36, 38, 41, 42, 8],
    before: [44, 45, 46, 50, 51, 55, 53],
  },
  'christina-roma': {
    after: [35, 36, 44, 46, 38, 40, 45, 48, 50, 51, 41, 52, 37, 43, 31],
    before: [6, 7, 8, 11, 12, 0, 24, 4],
  },
  'christina-cannes': {
    after: [19, 22, 20, 23, 25, 26, 21, 24, 3, 0, 18, 16, 4],
    before: [8, 12, 13, 14, 11],
  },
  'monza-apartment': {
    after: [0, 8, 3, 5, 13, 18, 10, 12, 21, 23, 15, 16],
    before: [24, 30, 31, 32, 25, 29],
  },

  'christina-paris': {
    after: [5, 22, 3, 11, 6, 16, 14, 9, 20, 23, 17, 15, 27, 25],
  },

  'christina-monaco': {
    after: [12, 10, 11, 9, 13, 7, 5, 8, 6],
  },

  'larimar-nice': {
    after: [7, 13, 10, 11, 12, 9, 8],
    before: [0, 2, 3, 4],
  },
  'wow-hair-nice': {
    after: [0, 3, 1, 6, 4, 2, 5, 7],
    before: [10, 11, 12, 13],
  },

  'stand-bologna-2024': { after: [0, 1, 3, 4, 2, 7] },
  'stand-bologna-2025': { after: [2, 6, 3, 9, 12, 11, 1, 4, 17, 18] },
  'stand-bologna-2026': { after: [3, 2, 4, 5, 1, 6] },
  'stand-paris-2025': { after: [3, 1, 5, 9, 2, 6, 10, 7] },
  'stand-paris-2026': { after: [0, 1, 7, 8, 3, 9, 10] },
  'stand-hong-kong-2026': { after: [2, 1, 3, 0] },
};

async function sourceFiles(slug) {
  const dir = sourceDir(ROOT, slug);
  if (!dir) return null;
  try {
    return (await fs.readdir(dir)).filter((f) => /\.jpe?g$/i.test(f)).sort();
  } catch {
    return null;
  }
}

const curation = {
  _note:
    'Відбір кадрів. after[0] = обкладинка. before — для блоку «до / після». ' +
    'Групи, яких тут немає, ще не куровані — беруться повністю. ' +
    'Генерується scripts/write-curation.mjs за індексами контактних аркушів.',
};

let kept = 0;
for (const [slug, picks] of Object.entries(PICKS)) {
  const files = await sourceFiles(slug);
  if (!files) {
    console.warn(`  ! немає теки для ${slug}`);
    continue;
  }

  const bySource = (indices) =>
    indices.map((i) => {
      if (!files[i]) throw new Error(`${slug}: індексу ${i} немає (всього ${files.length})`);
      return files[i];
    });

  curation[slug] = {
    after: bySource(picks.after),
    before: bySource(picks.before ?? []),
  };
  kept += picks.after.length + (picks.before?.length ?? 0);

  console.log(
    `  ${slug.padEnd(20)} ${String(picks.after.length).padStart(2)} після · ` +
      `${String(picks.before?.length ?? 0).padStart(2)} до   (зі ${files.length})`,
  );
}

const uncurated = [];
await fs.writeFile(OUT, JSON.stringify(curation, null, 1) + '\n');

console.log(`\n  відібрано ${kept} кадрів`);
console.log(`  ще не куровано: ${uncurated.join(', ')}`);
console.log(`  -> ${path.relative(ROOT, OUT)}`);
