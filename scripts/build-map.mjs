/**
 * Готує SVG-геометрію для секції Geography.
 *
 *   node scripts/build-map.mjs
 *
 * Пише src/data/map.json — кілька окремих карт («аркушів»), кожна під
 * свій масштаб: Французька Рив'єра, Франція, Італія, Польща й Україна.
 * Під картою вони перемикаються вкладками.
 *
 * Раніше була одна карта Франції та Італії з зумом. На масштабі Рив'єри
 * вона розпадалася на сходинки: контури бралися з Natural Earth 50 m,
 * розрахованого на всю Європу. Тепер кожен аркуш малюється з джерела
 * тієї детальності, яка йому потрібна, і зум не потрібен зовсім.
 *
 * Запускається вручну, не під час збірки сайту: результат комітиться.
 * Так у рантаймі немає ані завантажень, ані обчислень — лише готові path.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'src/data/map.json');
const CACHE = path.join(ROOT, '.image-cache');

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

const WIDTH = 1000;

/**
 * Висота всіх аркушів однакова: вони міняються місцями в одній рамці, і
 * різна висота смикала б сторінку. Тому для кожного задаються довготи й
 * центральна широта, а межі по широті добираються під цю висоту.
 */
const HEIGHT = 883.5;

// ─── Проєкція (Меркатор) ───────────────────────────────────────

const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 180 / 2));
const invMercY = (y) => ((2 * Math.atan(Math.exp(y)) - Math.PI / 2) * 180) / Math.PI;

/** Кадр аркуша: довготи й центральна широта → межі, висота, проєкція. */
function frame(lonMin, lonMax, latCentre) {
  const scale = WIDTH / (lonMax - lonMin);
  const half = ((HEIGHT / scale) * (Math.PI / 180)) / 2;
  const c = mercY(latCentre);
  const view = {
    lonMin,
    lonMax,
    latMin: +invMercY(c - half).toFixed(4),
    latMax: +invMercY(c + half).toFixed(4),
  };
  const Y0 = mercY(view.latMax);
  const project = ([lon, lat]) => [(lon - lonMin) * scale, (Y0 - mercY(lat)) * (180 / Math.PI) * scale];
  return { view, height: HEIGHT, project };
}

/*
  Кадри аркушів. Рив'єра — від Канн до італійського кордону; Франція — з
  Корсикою; Італія — з Сицилією й Сардинією; схід — Польща й Україна з
  Кримом.
*/
const FRAMES = {
  riviera: frame(6.7, 7.7, 43.66),
  france: frame(-6.5, 11.0, 46.3),
  italy: frame(3.5, 21.5, 41.6),
  east: frame(12.5, 41.5, 49.6),
};

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

function toPath(geometry, tolerance, fr) {
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

      /*
        Точки за рамкою притискаються до неї (з запасом 20 px, щоб край
        лишався невидимим). Регіон PACA тягнеться далеко за кадр Рив'єри,
        і без цього його контур за рамкою важив утричі більше за видимий.
        Притиснуті точки лягають на пряму, і спрощення їх прибирає.
      */
      const P = 20;
      pts = pts.map(([x, y]) => [Math.min(WIDTH + P, Math.max(-P, x)), Math.min(fr.height + P, Math.max(-P, y))]);
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
    // Усі кільця, не лише перше: у цих даних острови й материк лежать
    // кільцями одного Polygon, і в Одеської, Миколаївської та Херсонської
    // областей материк — не перше кільце. З poly[0] пропадало все
    // південне узбережжя.
    for (const r of polys.flat()) {
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
  const regionsPL = await load('regions-pl', SRC.regionsPL);
  const regionsUA = await load('regions-ua', SRC.regionsUA);

  const byIso = (iso) =>
    countries.features.find((f) => f.properties.ISO_A2 === iso || f.properties.ISO_A2_EH === iso);
  const find = (collection, name, test) => {
    const f = collection.features.find((x) => norm(name(x.properties)) === norm(test));
    if (!f) throw new Error(`не знайшов ${test}`);
    return f;
  };
  const frName = (p) => p.nom;
  const itName = (p) => p.reg_name;
  const plName = (p) => p.nazwa;
  const uaName = (p) => p['name:en'];

  /**
   * Аркуш: контури (outline — лише лінія) і підсвічені регіони (region —
   * заливка), обидва — масиви {key, label?, d}.
   */
  const sheet = (fr, outline, regions) => ({
    viewBox: `0 0 ${WIDTH} ${fr.height}`,
    width: WIDTH,
    height: fr.height,
    view: fr.view,
    outline: outline.map(([key, geometry, tol]) => ({ key, d: toPath(geometry, tol, fr) })),
    regions: regions.map(([key, label, geometry, tol]) => ({ key, label, d: toPath(geometry, tol, fr) })),
  });

  const R = FRAMES.riviera;
  const F = FRAMES.france;
  const I = FRAMES.italy;
  const E = FRAMES.east;

  const out = {
    /*
      Рив'єра: суша — регіон PACA і Лігурія (береги детальні, на відміну
      від Natural Earth). Монако — проміжок між ними на узбережжі.
    */
    riviera: sheet(
      R,
      [
        ['paca', find(regionsFR, frName, "Provence-Alpes-Côte d'Azur").geometry, 0.8],
        ['liguria', find(regionsIT, itName, 'Liguria').geometry, 0.8],
        ['piemonte', find(regionsIT, itName, 'Piemonte').geometry, 0.8],
      ],
      // Регіони не підсвічуються: на такому масштабі департамент займає
      // майже весь кадр, і межа з Варом лягала темною виїмкою. Суша
      // натомість злегка залита (див. GeographyMap.astro).
      [],
    ),
    france: sheet(
      F,
      [['france', byIso('FR').geometry, 0.6]],
      [
        ['idf', 'Île-de-France', find(regionsFR, frName, 'Île-de-France').geometry, 0.35],
        ['paca', "Provence-Alpes-Côte d'Azur", find(regionsFR, frName, "Provence-Alpes-Côte d'Azur").geometry, 0.35],
      ],
    ),
    italy: sheet(
      I,
      [['italy', byIso('IT').geometry, 0.6]],
      [
        ['lombardia', 'Lombardia', find(regionsIT, itName, 'Lombardia').geometry, 0.35],
        // Bologna — три виставкові стенди, тож регіон теж підсвічуємо.
        ['emiliaromagna', 'Emilia-Romagna', find(regionsIT, itName, 'Emilia-Romagna').geometry, 0.35],
        ['lazio', 'Lazio', find(regionsIT, itName, 'Lazio').geometry, 0.35],
      ],
    ),
    east: sheet(
      E,
      [
        ['poland', byIso('PL').geometry, 0.6],
        ['ukraine', dissolve(regionsUA.features), 0.6],
      ],
      [
        ['mazowieckie', 'Mazowieckie', find(regionsPL, plName, 'mazowieckie').geometry, 0.35],
        ['kyivska', 'Kyiv Oblast', find(regionsUA, uaName, 'Kiev Oblast').geometry, 0.35],
      ],
    ),
  };

  for (const [id, s] of Object.entries(out)) {
    const size = JSON.stringify(s).length;
    console.log(`  ${id.padEnd(8)} ${(size / 1024).toFixed(1)} KB`);
  }

  await fs.writeFile(OUT, JSON.stringify(out, null, 1) + '\n');
  const kb = ((await fs.stat(OUT)).size / 1024).toFixed(0);
  console.log(`\n  ${path.relative(ROOT, OUT)} — ${kb} KB`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
