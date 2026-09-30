// Astro копіює в dist/_astro оригінал кожної картинки з колекцій, навіть коли
// сторінки використовують лише AVIF/WebP-варіанти. Після збірки видаляємо
// JPG/PNG, на які не посилається жоден HTML, CSS, JS чи XML.
import { readdirSync, readFileSync, statSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const TEXT = /\.(html|css|js|mjs|xml|txt|json|webmanifest)$/;
const ORIGINAL = /\.(jpe?g|png)$/i;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

export function pruneOriginals(distDir) {
  const files = walk(distDir);
  const referenced = new Set();
  for (const f of files) {
    if (!TEXT.test(f)) continue;
    for (const m of readFileSync(f, 'utf8').matchAll(/\/_astro\/([^"'\s,)?#&\\]+)/g)) referenced.add(m[1]);
  }
  const assets = join(distDir, '_astro');
  let count = 0;
  let bytes = 0;
  for (const name of readdirSync(assets)) {
    if (!ORIGINAL.test(name) || referenced.has(name)) continue;
    const p = join(assets, name);
    bytes += statSync(p).size;
    unlinkSync(p);
    count++;
  }
  return { count, bytes };
}

export default function pruneOriginalsIntegration() {
  return {
    name: 'prune-originals',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const { count, bytes } = pruneOriginals(fileURLToPath(dir));
        logger.info(`removed ${count} unreferenced originals (${(bytes / 1048576).toFixed(0)} MB)`);
      },
    },
  };
}
