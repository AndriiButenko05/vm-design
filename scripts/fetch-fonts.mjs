/**
 * Тягне сабсети шрифтів із Google Fonts і кладе локально.
 *
 *   node scripts/fetch-fonts.mjs
 *
 * Пише woff2 у public/fonts/ і генерує src/styles/fonts.css.
 * Локально, а не з CDN: без сторонніх запитів, без cookie, без FOUT на чужій мережі.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const FAMILIES = [
  ['Instrument+Serif:ital@0;1', 'instrument-serif'],
  ['Inter+Tight:wght@300..600', 'inter-tight'],
];

/** latin + latin-ext покривають EN, IT та FR. Кирилиця й грека не потрібні. */
const KEEP = new Set(['latin', 'latin-ext']);

let css =
  '/* Локальні шрифти. Згенеровано scripts/fetch-fonts.mjs — не редагувати вручну.\n' +
  '   Сабсети: latin + latin-ext (достатньо для EN / IT / FR). */\n\n';

for (const [query, slug] of FAMILIES) {
  const res = await fetch(`https://fonts.googleapis.com/css2?family=${query}&display=swap`, {
    headers: { 'User-Agent': UA },
  });
  if (!res.ok) throw new Error(`${slug}: HTTP ${res.status}`);
  const source = await res.text();

  for (const block of source.split('/*').slice(1)) {
    const subset = block.slice(0, block.indexOf('*/')).trim();
    if (!KEEP.has(subset)) continue;

    const face = '@font-face' + block.slice(block.indexOf('@font-face') + 10, block.lastIndexOf('}') + 1);
    const url = face.match(/url\((https:[^)]+\.woff2)\)/)?.[1];
    if (!url) continue;

    const style = /font-style:\s*italic/.test(face) ? 'italic' : 'normal';
    const name = `${slug}-${subset}-${style}.woff2`;
    const buf = Buffer.from(await (await fetch(url, { headers: { 'User-Agent': UA } })).arrayBuffer());

    await fs.mkdir(path.join(ROOT, 'public/fonts'), { recursive: true });
    await fs.writeFile(path.join(ROOT, 'public/fonts', name), buf);
    console.log(`  ${name.padEnd(40)} ${(buf.length / 1024).toFixed(1)} KB`);

    css += face.replace(/src:\s*url\([^)]+\)/, `src: url('/fonts/${name}')`).trim() + '\n\n';
  }
}

await fs.writeFile(path.join(ROOT, 'src/styles/fonts.css'), css);
console.log('\n  -> src/styles/fonts.css');
