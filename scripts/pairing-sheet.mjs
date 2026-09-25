import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const MANIFEST = path.join(ROOT, 'src/data/images.json');
const OUT = process.argv[2] ?? path.join(ROOT, '.pairing');

const CELL = 260;
const PAD = 8;
const LABEL = 26;
const COLS = 5;

function labelSvg(text, width) {
  const safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${LABEL}">
       <rect width="100%" height="100%" fill="#f4f1ec"/>
       <text x="4" y="18" font-family="Arial, sans-serif" font-size="15" fill="#2b2a29">${safe}</text>
     </svg>`,
  );
}

async function block(items, heading) {
  if (!items.length) return null;

  const rows = Math.ceil(items.length / COLS);
  const width = COLS * (CELL + PAD) + PAD;
  const height = LABEL + rows * (CELL + PAD + LABEL) + PAD;

  const layers = [{ input: labelSvg(heading, width), top: 0, left: 0 }];

  for (const [i, it] of items.entries()) {
    const buf = await sharp(it.path)
      .resize(CELL, CELL, { fit: 'inside', withoutEnlargement: true })
      .toBuffer();
    const meta = await sharp(buf).metadata();

    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = PAD + col * (CELL + PAD);
    const y = LABEL + PAD + row * (CELL + PAD + LABEL);

    layers.push({ input: buf, top: Math.round(y + (CELL - meta.height) / 2), left: Math.round(x + (CELL - meta.width) / 2) });
    layers.push({ input: labelSvg(`${it.tag}${i + 1}`, CELL), top: Math.round(y + CELL + 2), left: x });
  }

  return { width, height, layers };
}

async function main() {
  const manifest = JSON.parse(await fs.readFile(MANIFEST, 'utf8'));
  await fs.mkdir(OUT, { recursive: true });

  let made = 0;
  for (const [slug, items] of Object.entries(manifest.projects)) {
    const before = items.filter((i) => i.role === 'before');
    if (!before.length) continue;
    const after = items.filter((i) => i.role !== 'before');

    const dir = path.join(ROOT, 'src/assets/projects', slug);
    const withPath = (list, tag) => list.map((i) => ({ ...i, tag, path: path.join(dir, i.file) }));

    const b = await block(withPath(before, 'B'), `${slug} — BEFORE  (B1…B${before.length})`);
    const a = await block(withPath(after, 'A'), `${slug} — AFTER  (A1…A${after.length})`);
    if (!b || !a) continue;

    const width = Math.max(b.width, a.width);
    const height = b.height + a.height + PAD * 2;

    const canvas = sharp({
      create: { width, height, channels: 3, background: '#f4f1ec' },
    });

    const shift = (layers, dy) => layers.map((l) => ({ ...l, top: l.top + dy }));

    await canvas
      .composite([...shift(b.layers, PAD), ...shift(a.layers, b.height + PAD * 2)])
      .jpeg({ quality: 84 })
      .toFile(path.join(OUT, `${slug}.jpg`));

    console.log(`  ${slug.padEnd(20)} ${before.length} до · ${after.length} після`);
    made++;
  }

  console.log(`\n  ${made} аркушів -> ${path.relative(ROOT, OUT)}`);
  console.log('  Попросити замовницю підписати пари у форматі  B3 → A7');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
