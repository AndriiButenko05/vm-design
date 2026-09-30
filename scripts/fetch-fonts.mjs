import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const LATIN = ['latin', 'latin-ext'];
const EXT_A_RANGE = 'U+0100-017F';
const EXT_A = String.fromCodePoint(...Array.from({ length: 0x180 - 0x100 }, (_, i) => 0x100 + i));
const FAMILIES = [
  ['Cormorant+Garamond:wght@400', 'cormorant-garamond', [...LATIN, 'cyrillic', 'cyrillic-ext']],
  ['Inter+Tight:wght@300..600', 'inter-tight', [...LATIN, 'cyrillic', 'cyrillic-ext']],
  ['Spectral:wght@400;500', 'spectral', [...LATIN, 'cyrillic', 'cyrillic-ext']],
];

let css =
  '/* Локальні шрифти. Згенеровано scripts/fetch-fonts.mjs — не редагувати вручну.\n' +
  '   Сабсети: latin, latin-ext, cyrillic, cyrillic-ext — для ru і uk. */\n\n';

const FONT_DIR = path.join(ROOT, 'public/fonts');

await fs.mkdir(FONT_DIR, { recursive: true });
for (const f of await fs.readdir(FONT_DIR)) {
  if (f.endsWith('.woff2')) await fs.rm(path.join(FONT_DIR, f));
}

for (const [query, slug, subsets] of FAMILIES) {
  const keep = new Set(subsets);
  const res = await fetch(`https://fonts.googleapis.com/css2?family=${query}&display=swap`, {
    headers: { 'User-Agent': UA },
  });
  if (!res.ok) throw new Error(`${slug}: HTTP ${res.status}`);
  const source = await res.text();

  for (const block of source.split('/*').slice(1)) {
    const subset = block.slice(0, block.indexOf('*/')).trim();
    if (!keep.has(subset)) continue;

    const face = '@font-face' + block.slice(block.indexOf('@font-face') + 10, block.lastIndexOf('}') + 1);
    const url = face.match(/url\((https:[^)]+\.woff2)\)/)?.[1];
    if (!url) continue;

    const style = /font-style:\s*italic/.test(face) ? 'italic' : 'normal';

    const weight = (face.match(/font-weight:\s*([^;]+);/)?.[1] ?? '400').trim().replace(/\s+/g, '-');
    const name = `${slug}-${weight}-${subset}-${style}.woff2`;

    // Повний latin-ext важить до 90 КБ (в'єтнамська, рідкісні знаки), а сайту
    // з нього потрібні лише літери на кшталт «ś» у «Powiśle». Беремо тільки
    // Latin Extended-A — Google Fonts сам обрізає шрифт за параметром text=.
    let fontUrl = url;
    let faceCss = face;
    if (subset === 'latin-ext') {
      const q = `https://fonts.googleapis.com/css2?family=${query}&text=${encodeURIComponent(EXT_A)}&display=swap`;
      const cut = await (await fetch(q, { headers: { 'User-Agent': UA } })).text();
      fontUrl = cut.match(/url\((https:[^)]+)\)\s*format\('woff2'\)/)?.[1] ?? url;
      faceCss = face.replace(/unicode-range:[^;]+;/, `unicode-range: ${EXT_A_RANGE};`);
    }
    const buf = Buffer.from(await (await fetch(fontUrl, { headers: { 'User-Agent': UA } })).arrayBuffer());

    await fs.writeFile(path.join(FONT_DIR, name), buf);
    console.log(`  ${name.padEnd(40)} ${(buf.length / 1024).toFixed(1)} KB`);

    css += faceCss.replace(/src:\s*url\([^)]+\)/, `src: url('/fonts/${name}')`).trim() + '\n\n';
  }
}

await fs.writeFile(path.join(ROOT, 'src/styles/fonts.css'), css);
console.log('\n  -> src/styles/fonts.css');
