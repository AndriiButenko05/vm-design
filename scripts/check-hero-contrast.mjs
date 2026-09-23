/**
 * Контраст білого тексту на затемненому кадрі першого екрана.
 *
 * Кадр світлий — білі стіни й мармур. На око здається, що градієнта
 * «начебто достатньо», але підпис при цьому може не діставати до 4.5:1.
 * Тому рахуємо по реальних пікселях: беремо кадр, накладаємо ту саму
 * формулу градієнта, що в Hero.astro, і міряємо найгірший піксель
 * у прямокутнику, де насправді лежить текст.
 *
 *   node scripts/check-hero-contrast.mjs
 *
 * Виходить з ненульовим кодом, якщо контраст нижчий за поріг, —
 * щоб це не можна було проґавити.
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const IMAGE = path.join(ROOT, 'src/assets/projects/la-villa-nice/034-img-2560.jpg');

/** Колір скриму — --ink-deep. Має збігатися з Hero.astro. */
const SCRIM = { r: 25, g: 24, b: 23 };

/** Поріг WCAG AA для великого тексту — 3:1, для звичайного — 4.5:1. */
const THRESHOLD = 4.5;

/**
 * Зони, де лежить текст, у частках від кадру.
 * Слоган і підписи тиснуться до лівого краю й вертикально по центру.
 */
const ZONES = [
  { name: 'слоган', x0: 0.05, x1: 0.5, y0: 0.3, y1: 0.58 },
  { name: 'підводка', x0: 0.05, x1: 0.42, y0: 0.58, y1: 0.68 },
  { name: 'роль і міста', x0: 0.05, x1: 0.4, y0: 0.72, y1: 0.82 },
];

/** Горизонтальний шар градієнта з Hero.astro. */
function alphaX(t) {
  const stops = [
    [0, 0.7],
    [0.38, 0.56],
    [0.72, 0.24],
    [1, 0.16],
  ];
  return interpolate(stops, t);
}

/** Вертикальний шар. */
function alphaY(t) {
  const stops = [
    [0, 0.35],
    [0.32, 0.06],
    [0.62, 0.06],
    [1, 0.4],
  ];
  return interpolate(stops, t);
}

function interpolate(stops, t) {
  for (let i = 0; i < stops.length - 1; i++) {
    const [p0, v0] = stops[i];
    const [p1, v1] = stops[i + 1];
    if (t >= p0 && t <= p1) {
      const k = p1 === p0 ? 0 : (t - p0) / (p1 - p0);
      return v0 + (v1 - v0) * k;
    }
  }
  return stops[stops.length - 1][1];
}

/** Відносна яскравість за WCAG. */
function luminance(r, g, b) {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/**
 * Мобільний градієнт — рівніший і сильніший, бо при object-fit: cover
 * вертикальний екран вирізає центральну смугу кадру, а вона світла.
 */
function alphaMobile(t) {
  return interpolate(
    [
      [0, 0.68],
      [0.35, 0.64],
      [0.7, 0.62],
      [1, 0.73],
    ],
    t,
  );
}

/** Найгірший контраст білого в зоні. Повертає {ratio, at}. */
function worstInZone(data, W, H, channels, zone, alphas) {
  let worst = Infinity;
  let at = null;

  for (let y = Math.floor(zone.y0 * H); y < Math.floor(zone.y1 * H); y++) {
    for (let x = Math.floor(zone.x0 * W); x < Math.floor(zone.x1 * W); x++) {
      const i = (y * W + x) * channels;
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Шари накладаються один на одного, як у CSS.
      for (const a of alphas(x / W, y / H)) {
        r = r * (1 - a) + SCRIM.r * a;
        g = g * (1 - a) + SCRIM.g * a;
        b = b * (1 - a) + SCRIM.b * a;
      }

      const ratio = 1.05 / (luminance(r, g, b) + 0.05);
      if (ratio < worst) {
        worst = ratio;
        at = { x: Math.round((x / W) * 100), y: Math.round((y / H) * 100) };
      }
    }
  }
  return { ratio: worst, at };
}

let failed = false;

async function check(title, pipeline, alphas, zones) {
  const { data, info } = await pipeline.raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels } = info;
  console.log(`${title} — ${W}×${H}`);

  for (const zone of zones) {
    const { ratio, at } = worstInZone(data, W, H, channels, zone, alphas);
    const ok = ratio >= THRESHOLD;
    if (!ok) failed = true;
    console.log(
      `${ok ? '  ok ' : ' ПРОВАЛ'} ${zone.name.padEnd(14)} найгірший ${ratio.toFixed(2)}:1  ` +
        `(${at.x}% / ${at.y}%)`,
    );
  }
  console.log();
}

console.log(`Кадр: ${path.basename(IMAGE)}, поріг ${THRESHOLD}:1\n`);

// Десктоп: кадр майже не обрізається, працюють обидва градієнти.
await check(
  'Десктоп',
  // Рахувати по 2000 px немає потреби: градієнт плавний, а мінімум
  // шукаємо по зоні, не по одному пікселю.
  sharp(IMAGE).resize({ width: 600 }),
  (x, y) => [alphaY(y), alphaX(x)],
  ZONES,
);

/*
  Телефон: 390×844, object-fit: cover обрізає альбомний кадр до
  центральної вертикальної смуги. Саме цей випадок провалювався,
  поки градієнт був спільний із десктопним.
*/
const VW = 390;
const VH = 844;
const meta = await sharp(IMAGE).metadata();
const scale = Math.max(VW / meta.width, VH / meta.height);
const rw = Math.round(meta.width * scale);
const rh = Math.round(meta.height * scale);

await check(
  'Телефон 390×844',
  sharp(IMAGE)
    .resize(rw, rh)
    .extract({
      left: Math.round((rw - VW) / 2),
      top: Math.round((rh - VH) / 2),
      width: VW,
      height: VH,
    }),
  (_x, y) => [alphaMobile(y)],
  // На вузькому екрані текст займає майже всю ширину.
  ZONES.map((z) => ({ ...z, x0: 0.05, x1: 0.95 })),
);

if (failed) {
  console.error('Контрасту бракує. Підсиль градієнт у Hero.astro і прожени ще раз.');
  process.exit(1);
}
console.log('Білий текст проходить AA в усіх зонах, на обох розкладках.');
