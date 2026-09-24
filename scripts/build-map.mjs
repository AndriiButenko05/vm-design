/**
 * Готує SVG-геометрію для секції Geography.
 *
 *   node scripts/build-map.mjs
 *
 * Тягне Natural Earth (50 m), лишає Францію, Італію та Монако,
 * підсвічує адміністративні регіони, де є реалізовані проєкти,
 * спрощує контури й пише src/data/map.json.
 *
 * Запускається вручну, не під час збірки сайту: результат комітиться.
 * Так у рантаймі немає ані завантажень, ані обчислень — лише готові path.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'src/data/map.json');
const CACHE = path.join(ROOT, '.image-cache');

/**
 * Контури країн — Natural Earth 50 m.
 * Регіони — спеціалізовані джерела: у наборі admin-1 від Natural Earth
 * на 50 m Франції та Італії просто немає, а версія 10 m важить 39 МБ.
 * Ці два файли разом дають 4 МБ і точнішу геометрію.
 */
const SRC = {
  countries:
    'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson',
  regionsFR: 'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/regions.geojson',
  regionsIT:
    'https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_regions.geojson',
  regionsPL:
    'https://raw.githubusercontent.com/ppatrzyk/polska-geojson/master/wojewodztwa/wojewodztwa-min.geojson',
  /*
    Україна — з набору областей, а не з Natural Earth: там за
    замовчуванням Крим відрізано від України. Контур країни складається
    з самих областей (див. dissolve), тож Крим на карті український.
  */
  regionsUA: 'https://raw.githubusercontent.com/EugeneBorshch/ukraine_geojson/master/UA_FULL_Ukraine.geojson',
};

/**
 * Кадр карти: Франція та Італія.
 *
 * Німеччину прибрано разом із нею з усього позиціонування: вона стояла
 * нарівні з Рив'єрою, Монако й Італією, хоча це минулий досвід. Раніше
 * північну межу тримали на 54°, щоб умістити Kassel (51.3°) — тепер
 * досить 51.5°, рівно під північний край Франції. Карта від цього стала
 * щільнішою: зникла порожня смуга над Францією.
 *
 * Сам проєкт у Kassel нікуди не дівся — він переходить у текстовий
 * рядок міст поза картою, там само, де Гонконг. Див. MAPPED_COUNTRIES
 * у src/lib/map.ts.
 */
const VIEW = { lonMin: -5.5, lonMax: 19.0, latMin: 36.0, latMax: 51.5 };
const WIDTH = 1000;

/** Регіони, де є реалізовані проєкти. Ключ — те, що виводиться в підказці карти. */
const HIGHLIGHT = [
  { key: 'paca', label: "Provence-Alpes-Côte d'Azur", match: ['provencealpescotedazur'] },
  { key: 'idf', label: 'Île-de-France', match: ['iledefrance'] },
  { key: 'lombardia', label: 'Lombardia', match: ['lombardia', 'lombardy'] },
  { key: 'lazio', label: 'Lazio', match: ['lazio', 'latium'] },
  // Bologna — три виставкові стенди, тож регіон теж підсвічуємо.
  { key: 'emiliaromagna', label: 'Emilia-Romagna', match: ['emiliaromagna'] },
];

/**
 * Німеччина малюється лише контуром: набору регіонів для неї немає,
 * а тягнути ще одне джерело заради однієї підсвітки не варто.
 */

// ─── Проєкція (Меркатор) ───────────────────────────────────────

const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 180 / 2));
const invMercY = (y) => ((2 * Math.atan(Math.exp(y)) - Math.PI / 2) * 180) / Math.PI;

/** Кадр карти: межі в градусах → висота полотна й функція проєкції. */
function frame(view) {
  const Y0 = mercY(view.latMax);
  const Y1 = mercY(view.latMin);
  const scale = WIDTH / (view.lonMax - view.lonMin);
  const height = +((Y0 - Y1) * (180 / Math.PI) * scale).toFixed(2);
  const project = ([lon, lat]) => [(lon - view.lonMin) * scale, (Y0 - mercY(lat)) * (180 / Math.PI) * scale];
  return { view, height, project };
}

const MAIN = frame(VIEW);

/*
  Другий аркуш — Польща й Україна. Окремою картою, а не ширшим кадром
  основної: від Ніцци до Києва 2000 км, і Рив'єра з трьома містами
  стиснулася б у точку.

  Пропорції — ті самі, що в основного кадру: аркуші міняються місцями в
  одній рамці, і різна висота смикала б сторінку. Тому задаються лише
  довготи й центр, а широти добираються під висоту основної карти.
*/
function eastView() {
  const lonMin = 12.5;
  const lonMax = 41.5;
  const centre = mercY(49.6);
  const half = ((MAIN.height / (WIDTH / (lonMax - lonMin))) * (Math.PI / 180)) / 2;
  return {
    lonMin,
    lonMax,
    latMin: +invMercY(centre - half).toFixed(3),
    latMax: +invMercY(centre + half).toFixed(3),
  };
}

const EAST = frame(eastView());
const OUT_EAST = path.join(ROOT, 'src/data/map-east.json');

const HIGHLIGHT_EAST = [
  { key: 'mazowieckie', label: 'Mazowieckie', match: ['mazowieckie'] },
  { key: 'kyivska', label: 'Kyiv Oblast', match: ['kievoblast', 'kyivoblast'] },
];

// ─── Спрощення (Дуглас — Пекер) ────────────────────────────────

function simplify(points, tolerance) {
  if (points.length < 3) return points;

  const sqDist = (p, a, b) => {
    let [x, y] = a;
    let dx = b[0] - x;
    let dy = b[1] - y;
    if (dx !== 0 || dy !== 0) {
      const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) [x, y] = b;
      else if (t > 0) { x += dx * t; y += dy * t; }
    }
    dx = p[0] - x;
    dy = p[1] - y;
    return dx * dx + dy * dy;
  };

  const tol2 = tolerance * tolerance;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];

  while (stack.length) {
    const [first, last] = stack.pop();
    let maxD = 0;
    let index = 0;
    for (let i = first + 1; i < last; i++) {
      const d = sqDist(points[i], points[first], points[last]);
      if (d > maxD) { maxD = d; index = i; }
    }
    if (maxD > tol2) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }

  return points.filter((_, i) => keep[i]);
}

// ─── GeoJSON → SVG path ────────────────────────────────────────

const MIN_RING_AREA = 3; // px² — відкидає дрібні скелі, лишає Корсику й Сицилію

function ringArea(pts) {
  let a = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    a += (pts[j][0] + pts[i][0]) * (pts[j][1] - pts[i][1]);
  }
  return Math.abs(a / 2);
}

/**
 * Кодує контур у SVG-path відносними командами з цілими координатами.
 *
 * Абсолютні координати з десятковою частиною («L332.0 321.5») — найдорожчий
 * спосіб записати контур: на карті це була половина стисненого HTML головної.
 * Відносні дельти дають короткі числа (`l2 -2`), а ціла точність на полотні
 * 1000 px непомітна — карта малюється вужчою за 800 px.
 *
 * Курсор ведемо по ВЖЕ ОКРУГЛЕНИХ значеннях, інакше похибка накопичується
 * і контур «повзе».
 */
function encodePath(points) {
  let cx = Math.round(points[0][0]);
  let cy = Math.round(points[0][1]);
  let d = `M${cx} ${cy}`;

  const chunks = [];
  for (let i = 1; i < points.length; i++) {
    const nx = Math.round(points[i][0]);
    const ny = Math.round(points[i][1]);
    const dx = nx - cx;
    const dy = ny - cy;
    if (dx === 0 && dy === 0) continue; // після округлення точка злилася з попередньою
    // Пробіл перед від'ємним числом не потрібен — мінус сам розділяє.
    chunks.push(dy < 0 ? `${dx}${dy}` : `${dx} ${dy}`);
    cx = nx;
    cy = ny;
  }

  if (!chunks.length) return '';
  d += 'l' + chunks.join(' ').replace(/ -/g, '-');
  return d + 'Z';
}

function toPath(geometry, tolerance, fr = MAIN) {
  const polygons =
    geometry.type === 'Polygon' ? [geometry.coordinates]
    : geometry.type === 'MultiPolygon' ? geometry.coordinates
    : [];

  const parts = [];
  for (const polygon of polygons) {
    for (const ring of polygon) {
      let pts = ring.map(fr.project);
      // Поза кадром — не малюємо (заморські території Франції тощо).
      const inFrame = pts.some(([x, y]) => x > -60 && x < WIDTH + 60 && y > -60 && y < fr.height + 60);
      if (!inFrame) continue;

      pts = simplify(pts, tolerance);
      if (pts.length < 3 || ringArea(pts) < MIN_RING_AREA) continue;

      parts.push(encodePath(pts));
    }
  }
  return parts.join('');
}

/**
 * Зовнішній контур країни з її областей.
 *
 * Спільний кордон двох областей складається з тих самих вузлів (дані з
 * OpenStreetMap), тож кожне його ребро трапляється двічі. Ребра, що
 * трапилися один раз, — зовнішня межа; з них і збираються кільця.
 * Бібліотека для об'єднання полігонів тут зайва.
 */
function dissolve(features) {
  const key = (p) => `${p[0].toFixed(6)},${p[1].toFixed(6)}`;
  const edges = new Map();
  for (const f of features) {
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const poly of polys) {
      const r = poly[0];
      for (let i = 0; i < r.length - 1; i++) {
        const a = key(r[i]);
        const b = key(r[i + 1]);
        if (a === b) continue;
        const k = a < b ? `${a}|${b}` : `${b}|${a}`;
        edges.set(k, (edges.get(k) ?? 0) + 1);
      }
    }
  }

  const adj = new Map();
  for (const [k, n] of edges) {
    if (n !== 1) continue;
    const [a, b] = k.split('|');
    if (!adj.has(a)) adj.set(a, []);
    if (!adj.has(b)) adj.set(b, []);
    adj.get(a).push(b);
    adj.get(b).push(a);
  }

  const used = new Set();
  const rings = [];
  for (const start of adj.keys()) {
    let prev = null;
    let cur = start;
    const ring = [];
    for (;;) {
      ring.push(cur.split(',').map(Number));
      const next = adj.get(cur).find((n) => n !== prev && !used.has(cur < n ? `${cur}|${n}` : `${n}|${cur}`));
      if (!next) break;
      used.add(cur < next ? `${cur}|${next}` : `${next}|${cur}`);
      prev = cur;
      cur = next;
      if (cur === start) {
        ring.push(cur.split(',').map(Number));
        break;
      }
    }
    if (ring.length > 3) rings.push([ring]);
  }
  return { type: 'MultiPolygon', coordinates: rings };
}

// ─── Завантаження з кешем ──────────────────────────────────────

async function load(name, url) {
  await fs.mkdir(CACHE, { recursive: true });
  const file = path.join(CACHE, `${name}.geojson`);
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    process.stdout.write(`  завантажую ${name}… `);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
    const text = await res.text();
    await fs.writeFile(file, text);
    console.log(`${(text.length / 1048576).toFixed(1)} MB`);
    return JSON.parse(text);
  }
}

const norm = (s) =>
  (s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z]/gi, '')
    .toLowerCase();

async function main() {
  const countries = await load('countries', SRC.countries);
  const regionsFR = await load('regions-fr', SRC.regionsFR);
  const regionsIT = await load('regions-it', SRC.regionsIT);

  const byIso = (iso) =>
    countries.features.find((f) => f.properties.ISO_A2 === iso || f.properties.ISO_A2_EH === iso);

  const out = {
    viewBox: `0 0 ${WIDTH} ${MAIN.height}`,
    width: WIDTH,
    height: MAIN.height,
    view: VIEW,
    countries: {},
    regions: {},
  };

  for (const [iso, key] of [['FR', 'france'], ['IT', 'italy']]) {
    const f = byIso(iso);
    if (!f) throw new Error(`не знайшов країну ${iso}`);
    out.countries[key] = toPath(f.geometry, 0.6);
    console.log(`  ${key.padEnd(8)} ${out.countries[key].length} симв.`);
  }

  // Різні джерела називають поле по-різному: nom (FR), reg_name (IT).
  const regionName = (p) => p.nom ?? p.reg_name ?? p.name ?? p.NAME;

  for (const collection of [regionsFR, regionsIT]) {
    for (const f of collection.features) {
      const n = norm(regionName(f.properties));
      const hit = HIGHLIGHT.find((h) => h.match.includes(n));
      if (!hit) continue;
      out.regions[hit.key] = { label: hit.label, d: toPath(f.geometry, 0.35) };
      console.log(`  регіон   ${hit.label}`);
    }
  }

  const missing = HIGHLIGHT.filter((h) => !out.regions[h.key]);
  if (missing.length) console.warn('  ! не знайшов регіони:', missing.map((m) => m.label).join(', '));

  await fs.writeFile(OUT, JSON.stringify(out, null, 1) + '\n');
  const kb = ((await fs.stat(OUT)).size / 1024).toFixed(0);
  console.log(`\n  ${path.relative(ROOT, OUT)} — ${kb} KB, viewBox ${out.viewBox}`);

  // ─── Другий аркуш: Польща й Україна ───
  const regionsPL = await load('regions-pl', SRC.regionsPL);
  const regionsUA = await load('regions-ua', SRC.regionsUA);

  const east = {
    viewBox: `0 0 ${WIDTH} ${EAST.height}`,
    width: WIDTH,
    height: EAST.height,
    view: EAST.view,
    countries: {
      poland: toPath(byIso('PL').geometry, 0.6, EAST),
      ukraine: toPath(dissolve(regionsUA.features), 0.6, EAST),
    },
    regions: {},
  };

  const nameEast = (p) => p['name:en'] ?? p.nazwa ?? p.name;
  for (const collection of [regionsPL, regionsUA]) {
    for (const f of collection.features) {
      const n = norm(nameEast(f.properties));
      const hit = HIGHLIGHT_EAST.find((h) => h.match.includes(n));
      if (!hit) continue;
      east.regions[hit.key] = { label: hit.label, d: toPath(f.geometry, 0.35, EAST) };
      console.log(`  регіон   ${hit.label}`);
    }
  }
  const missingEast = HIGHLIGHT_EAST.filter((h) => !east.regions[h.key]);
  if (missingEast.length) console.warn('  ! не знайшов регіони:', missingEast.map((m) => m.label).join(', '));

  await fs.writeFile(OUT_EAST, JSON.stringify(east, null, 1) + '\n');
  const kbE = ((await fs.stat(OUT_EAST)).size / 1024).toFixed(0);
  console.log(`  ${path.relative(ROOT, OUT_EAST)} — ${kbE} KB, viewBox ${east.viewBox}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
