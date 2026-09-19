/**
 * Генерує контент-файли проєктів із маніфесту й курації.
 *
 *   node scripts/gen-content.mjs
 *
 * Переписує src/content/projects/en/*.md. Після того, як Maryna пришле
 * свої тексти й метадані, редагуємо .md напряму, а скрипт більше не запускаємо.
 *
 * Альт-тексти поки узагальнені на рівні проєкту («Christina Roma — styling
 * stations under the restored vault»), а не унікальні на кожен кадр.
 * Це точно описує зміст і не вигадує деталей; уточнення — окремим проходом.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'src/content/projects/en');
const MANIFEST = path.join(ROOT, 'src/data/images.json');

const P = [
  {
    slug: 'la-villa-nice',
    title: 'La Villa',
    city: 'Nice',
    country: 'France',
    type: 'residential',
    year: 2025,
    coords: { lat: 43.7102, lon: 7.262 },
    scope: ['Concept design', 'Space planning', 'Working drawings', 'Custom joinery', 'Author supervision'],
    materials: ['Brown onyx', 'Calacatta marble', 'Brass', 'Herringbone oak', 'Lacquered panelling'],
    summary: 'A gutted villa above Nice, rebuilt around marble and brass.',
    featured: true,
    order: 1,
    alt: { after: 'marble, brass and lacquered joinery in the finished villa', before: 'the villa stripped back to structure during the works' },
    todo: 'Рік із назви PDF — підтвердити. Потрібні площа й авторський текст. Пари «до/після» не збігаються ракурсом → mode: pair.',
    body: `A private residence organised around a single decision: let the stone speak and keep everything else quiet.

Full-height slabs of brown onyx and Calacatta marble set the tone in the bathrooms and the kitchen. Against them the joinery stays matte and pale, the panelling keeps its classical mouldings, and brass appears only where a hand actually lands — mixers, sconces, the ribbon of the chandelier over the dining table.

The house came to the studio as a shell: pink plaster, exposed services, rubble on the floors. The open oak stair is the one sculptural gesture kept from the original plan.`,
  },
  {
    slug: 'christina-roma',
    title: 'Christina Roma',
    city: 'Rome',
    country: 'Italy',
    type: 'commercial',
    brand: 'Christina',
    year: 2026,
    coords: { lat: 41.9028, lon: 12.4964 },
    scope: ['Concept design', 'Space planning', 'Working drawings', 'Custom furniture'],
    materials: ['Restored plaster vaults', 'Marble floor', 'Lacquered joinery', 'Backlit mirror'],
    summary: 'A derelict vaulted shop in Rome, brought back as an all-white salon.',
    featured: true,
    order: 2,
    alt: { after: 'the restored vault with oval mirrors and sculptural seating', before: 'the vaulted shell before restoration, plaster stripped to the brick' },
    // Єдина пара, знята з однієї точки, — тому єдина, що йде слайдером.
    sliderPairs: [
      { before: 'IMG_1488.jpeg', after: 'IMG_9684.jpeg', caption: 'The arched shopfront, before and after' },
    ],
    todo: 'Рік із назви PDF — підтвердити. Найсильніший матеріал «до/після»: вітрина знята з тієї самої точки → кандидат на slider.',
    body: `The space arrived as a ruin: Roman brick arches under failing plaster, a shuttered arched shopfront, scaffolding where the ceiling should be.

Everything added is white — walls, joinery, the sculptural seating — so the vaults stay the strongest line in the room. Oval mirrors repeat the curve at eye level. A geometric chandelier holds the centre without touching the vault.

One large portrait at the end of the room carries the only colour in the scheme.`,
  },
  {
    slug: 'christina-kassel',
    title: 'Christina Kassel',
    city: 'Kassel',
    country: 'Germany',
    type: 'commercial',
    brand: 'Christina',
    coords: { lat: 51.3127, lon: 9.4797 },
    scope: ['Concept design', 'Space planning', 'Custom furniture'],
    materials: ['Oak flooring', 'Backlit round mirror', 'Lacquered joinery', 'Glass shelving'],
    summary: 'A bright street-level salon in Kassel — the one project with professional photography.',
    featured: true,
    order: 3,
    alt: { after: 'the finished salon: oak floor, product wall and backlit round mirrors', before: 'the empty unit before fit-out' },
    todo: 'ЄДИНИЙ проєкт із професійною зйомкою (Canon 6D Mark II, 13 із 18 кадрів горизонтальні). Кандидат на hero сайту. Потрібні рік і площа.',
    body: `A street-level unit in Kassel, taken from bare shell to finished salon.

The plan is simple and the discipline is in the restraint: a single product wall running the length of the room, oak laid along it to stretch the space, and round backlit mirrors hung free of any joinery so the wall reads as wall.

The treatment rooms behind stay entirely white, with the brand's own colour appearing only on the campaign wall.`,
  },
  {
    slug: 'monza-apartment',
    title: 'Appartamento Monza',
    city: 'Monza',
    country: 'Italy',
    type: 'residential',
    area: 42.91,
    coords: { lat: 45.5845, lon: 9.2744 },
    scope: ['Survey drawings', 'Demolition plan', 'Concept design', 'Working drawings', 'Author supervision'],
    materials: ['Green quartzite', 'Black composite worktop', 'Matte lacquer', 'Marble-effect porcelain'],
    summary: 'A 1970s Monza flat taken back to the shell and rebuilt around one slab of green quartzite.',
    order: 4,
    alt: { after: 'green quartzite against matte lacquer and a black worktop', before: 'the original 1970s interior before the renovation' },
    todo: 'Площа 42.91 m² із legenda в planimetria — підтвердити. У PDF є PRIMA/DOPO. Потрібен рік.',
    body: `Forty-three square metres, taken back to the shell and rebuilt.

What was there before: patterned wall tiles, a red pendant over a plastic tablecloth, brown joinery, a kitchen from another era.

The whole new scheme leans on one material. A green quartzite with rust and amber veining runs as a full slab in the bathroom and returns as the kitchen splashback, so the two rooms that carry the plumbing also carry the character. Around it everything is deliberately flat.`,
  },
  {
    slug: 'christina-paris',
    title: 'Christina Paris',
    city: 'Paris',
    country: 'France',
    type: 'commercial',
    brand: 'Christina',
    coords: { lat: 48.8566, lon: 2.3522 },
    scope: ['Concept design', 'Space planning', 'Working drawings', 'Custom furniture', 'Author supervision'],
    materials: ['Travertine', 'Exposed Paris limestone', 'Marble', 'Lacquered joinery'],
    summary: 'A salon off a Paris courtyard, where the building’s own stone is left exposed.',
    featured: true,
    order: 5,
    alt: { after: 'round mirrors and pedestal stations against exposed Paris limestone' },
    todo: 'Кадрів «до» немає. У теці також є простір бренду DARPHIN (2 кадри) і лаунж (4) — уточнити, чи це окремі проєкти. Потрібні рік і площа.',
    body: `The space sits off a planted courtyard, behind a vaulted stone passage that the project deliberately leaves untouched.

Inside, the original limestone piers stay exposed and become the only texture in the room. Everything added is white and rounded: pedestal stations turned from a single form, marble tops, and round mirrors sized large enough to read as architecture rather than as fittings.

Travertine underfoot keeps the floor warm against all that white.`,
  },
  {
    slug: 'christina-cannes',
    title: 'Christina Cannes',
    city: 'Cannes',
    country: 'France',
    type: 'commercial',
    brand: 'Christina',
    coords: { lat: 43.5528, lon: 7.0174 },
    scope: ['Concept design', 'Space planning', 'Custom furniture', 'Author supervision'],
    materials: ['Arched plaster niches', 'Backlit mirror', 'Marble', 'Pale stone floor'],
    summary: 'Arched niches turn the product wall into the architecture of the room.',
    order: 6,
    alt: { after: 'arched niches and lit oval mirrors along the salon', before: 'the bare rooms before the fit-out' },
    todo: 'Підтвердилось: це ОДИН проєкт (салон + кабінети), не два. Потрібні рік і площа.',
    body: `The brief was a retail wall, a working salon and treatment rooms in one narrow plan.

Rather than lining the wall with shelving, the niches are cut as arches and lit from within, so the products read as a rhythm rather than as stock. Oval backlit mirrors pick up the same curve on the opposite side.

The rooms arrived bare, with a dark timber floor and nothing else. The floor and joinery now stay pale and continuous, which keeps a long room from feeling like a corridor.`,
  },
  {
    slug: 'larimar-nice',
    title: 'Larimar',
    city: 'Nice',
    country: 'France',
    type: 'commercial',
    coords: { lat: 43.7102, lon: 7.262 },
    scope: ['Concept design', 'Space planning', 'Bespoke relief panel', 'Custom furniture'],
    materials: ['Sculpted plaster relief', 'Blue-green quartzite', 'Bouclé', 'Arched backlit mirror'],
    summary: 'A sculpted relief runs the length of the wall and gives the salon its face.',
    featured: true,
    order: 7,
    alt: { after: 'the sculpted plaster face behind the styling stations', before: 'the unit during fit-out, joinery going in' },
    todo: 'Потрібні рік, площа, авторський текст. Уточнити авторство барельєфа.',
    body: `A hand-sculpted plaster relief runs behind the styling stations: a face, several metres across, with hair that becomes the texture of the wall.

Everything else is set up to let it read. Arched backlit mirrors echo the curve, the seating is bouclé in the same sand tone as the plaster, and the stations are dark and low so the eye stays up.

In the treatment room a slab of blue-green quartzite provides the one shift in colour.`,
  },
  {
    slug: 'wow-hair-nice',
    title: 'Wow Hair',
    city: 'Nice',
    country: 'France',
    type: 'commercial',
    coords: { lat: 43.7102, lon: 7.262 },
    scope: ['Concept design', 'Space planning', 'Custom furniture'],
    materials: ['Oak flooring', 'Oval backlit mirror', 'Textured art panels', 'Dusty rose upholstery'],
    summary: 'A small hair salon built on three things: oak, oval light and a single warm pink.',
    order: 8,
    alt: { after: 'oval backlit mirrors and dusty-rose chairs along the oak floor', before: 'the empty unit before the works' },
    todo: 'Потрібні рік, площа, авторський текст.',
    body: `A compact street-level salon, worked out at the scale of a single wall.

Oval backlit mirrors are hung free of any joinery, which keeps the wall reading as wall. The floor is oak laid the long way to stretch the room. Upholstery is one warm dusty rose, repeated exactly, with no second accent anywhere.

Textured monochrome panels break up the remaining wall without adding another colour.`,
  },
  {
    slug: 'christina-monaco',
    title: 'Christina Monaco',
    city: 'Monaco',
    country: 'Monaco',
    type: 'commercial',
    brand: 'Christina',
    coords: { lat: 43.7384, lon: 7.4246 },
    scope: ['Concept design', 'Custom furniture'],
    materials: ['Arched backlit mirror', 'Curved timber reception', 'Lacquered joinery'],
    summary: 'A compact Monaco salon with arched mirrors and a curved timber reception.',
    order: 9,
    alt: { after: 'arched backlit mirrors above the stations, curved timber reception' },
    todo: 'У теці також простір бренду DERMADIANE (4 кадри) — уточнити, чи це окремий проєкт. Потрібні рік і площа.',
    body: `A small salon fitted out in pale lacquer and timber.

Arched backlit mirrors set the rhythm along the product wall; a curved reception in warm timber breaks the whiteness at the entrance. A cluster of glass pendants marks the centre of the room.`,
  },

  // ─── Виставкові стенди ─────────────────────────────────────────
  {
    slug: 'stand-bologna-2025',
    title: 'Bologna 2025',
    city: 'Bologna',
    country: 'Italy',
    type: 'exhibition',
    brand: 'Christina',
    year: 2025,
    coords: { lat: 44.4949, lon: 11.3426 },
    scope: ['Stand design', 'Graphics', 'Production supervision'],
    materials: ['Printed quartzite graphic', 'Backlit display', 'Lacquered counters'],
    summary: 'A violet quartzite graphic wraps the whole stand.',
    featured: true,
    order: 20,
    alt: { after: 'the exhibition stand wrapped in a violet quartzite graphic' },
    todo: 'Підтвердити назву виставки (ймовірно Cosmoprof Worldwide Bologna) і рік.',
    body: `The strongest of the series. A violet quartzite graphic runs across every vertical surface of the stand, printed at a scale that reads from the far side of the hall.

Against it the counters, treatment tables and seating stay white and low, so the stone pattern carries the whole identity.`,
  },
  {
    slug: 'stand-paris-2026',
    title: 'Paris 2026',
    city: 'Paris',
    country: 'France',
    type: 'exhibition',
    brand: 'Christina',
    year: 2026,
    coords: { lat: 48.8566, lon: 2.3522 },
    scope: ['Stand design', 'Graphics', 'Production supervision'],
    materials: ['Suspended lighting rig', 'Campaign graphics', 'Lacquered counters'],
    summary: 'A suspended rig and a magenta floor lift the stand above the hall.',
    order: 21,
    alt: { after: 'the stand with its suspended lighting rig and campaign wall' },
    todo: 'Підтвердити назву виставки і рік.',
    body: `A corner stand built around a suspended black rig that lifts the brand mark clear of the hall.

The floor is magenta, the counters white, and the campaign portrait carries the colour at full height.`,
  },
  {
    slug: 'stand-paris-2025',
    title: 'Paris 2025',
    city: 'Paris',
    country: 'France',
    type: 'exhibition',
    brand: 'Christina',
    year: 2025,
    coords: { lat: 48.8566, lon: 2.3522 },
    scope: ['Stand design', 'Graphics'],
    materials: ['Campaign graphics', 'Treatment tables', 'Lacquered counters'],
    summary: 'A full-height campaign wall and working treatment tables.',
    order: 22,
    alt: { after: 'campaign wall and treatment stations on the stand' },
    todo: 'Підтвердити назву виставки і рік.',
    body: `An open stand planned around live treatments: tables out in the aisle, product displays behind, and a full-height campaign portrait holding the corner.`,
  },
  {
    slug: 'stand-bologna-2026',
    title: 'Bologna 2026',
    city: 'Bologna',
    country: 'Italy',
    type: 'exhibition',
    brand: 'Christina',
    year: 2026,
    coords: { lat: 44.4949, lon: 11.3426 },
    scope: ['Stand design', 'Graphics'],
    materials: ['Campaign graphics', 'Red lacquered counters'],
    summary: 'Red counters against the campaign wall.',
    order: 23,
    alt: { after: 'red counters and campaign graphics on the stand' },
    todo: 'Підтвердити назву виставки і рік.',
    body: `A tighter stand than the year before, built on two colours: white for the structure, red for the counters and the campaign wall.`,
  },
  {
    slug: 'stand-bologna-2024',
    title: 'Bologna 2024',
    city: 'Bologna',
    country: 'Italy',
    type: 'exhibition',
    brand: 'Christina',
    year: 2024,
    coords: { lat: 44.4949, lon: 11.3426 },
    scope: ['Stand design', 'Graphics'],
    materials: ['Glass display cases', 'Lacquered counters'],
    summary: 'The first stand of the series — white, with glass cases.',
    order: 24,
    alt: { after: 'white stand with glass display cases' },
    todo: 'Підтвердити назву виставки і рік.',
    body: `The earliest stand in the set: an all-white structure with glass display cases and a single portrait above the counter.`,
  },
  {
    slug: 'stand-hong-kong-2026',
    title: 'Hong Kong 2026',
    city: 'Hong Kong',
    country: 'Hong Kong',
    type: 'exhibition',
    brand: 'Christina',
    year: 2026,
    coords: { lat: 22.3193, lon: 114.1694 },
    scope: ['Stand design', 'Graphics'],
    materials: ['Campaign graphics', 'Round display table'],
    summary: 'The brand’s stand in Hong Kong.',
    order: 25,
    alt: { after: 'the stand in Hong Kong with its round display table' },
    todo: 'Лише 4 кадри. Підтвердити назву виставки. Hong Kong не потрапляє в рамку європейської карти — див. план.',
    body: `A compact stand for the Asian market, planned around a single round display table.`,
  },

  // ─── Проєкти, від яких лишилася тільки документація ─────────────
  // Фотографій немає, але комплекти креслень повні. Обкладинкою стає
  // сам аркуш: це чесно показує, що саме є, і не вдає фотозйомку.
  {
    slug: 'nice-verdi-apartment',
    title: 'Appartement rue Verdi',
    city: 'Nice',
    country: 'France',
    type: 'residential',
    year: 2025,
    coords: { lat: 43.6997, lon: 7.2688 },
    scope: ['Survey drawings', 'Concept design', 'Space planning', 'Working drawings'],
    materials: [],
    summary: 'A Nice apartment documented in full — nineteen sheets, from survey to joinery.',
    order: 10,
    drawingsOnly: 'nice-verdi-apartment',
    alt: { after: 'working drawing' },
    todo: 'Фотографій немає. Якщо обʼєкт реалізовано — попросити зйомку. Рік із дати в титульному блоці (13.11.2025), підтвердити.',
    body: `An apartment project that exists on the site as what it actually is: a complete set of working drawings.

Survey, layout, services and joinery — nineteen sheets, drawn to the level a contractor builds from.`,
  },
  {
    slug: 'saint-paul-de-vence',
    title: 'Saint-Paul-de-Vence',
    city: 'Saint-Paul-de-Vence',
    country: 'France',
    type: 'residential',
    year: 2026,
    coords: { lat: 43.6959, lon: 7.1222 },
    scope: ['Survey drawings', 'Concept design', 'Space planning', 'Working drawings'],
    materials: [],
    summary: 'Three apartments in one building above Saint-Paul-de-Vence, drawn as a single commission.',
    order: 11,
    drawingsOnly: 'saint-paul-de-vence',
    alt: { after: 'working drawing' },
    todo: 'Три комплекти по 11 аркушів = 33. Фотографій немає. Рік із дати в титульному блоці (02.03.2026), підтвердити.',
    body: `Three apartments in the same building, planned together rather than one after another.

Each has its own complete set — survey, demolition, layout and joinery — but the decisions run across all three.`,
  },
];

const q = (s) => JSON.stringify(s);
const manifest = JSON.parse(await fs.readFile(MANIFEST, 'utf8'));
await fs.mkdir(OUT, { recursive: true });

const drawings = JSON.parse(await fs.readFile(path.join(ROOT, 'src/data/drawings.json'), 'utf8'));

for (const p of P) {
  // Проєкт без фото: беремо аркуші креслень як обкладинку та галерею.
  if (p.drawingsOnly) {
    const sets = drawings.sets.filter((s) => s.project === p.drawingsOnly);
    const sheets = sets.flatMap((s) => s.pages.slice(0, 3).map((pg) => `${s.slug}/${pg.file}`));
    if (!sheets.length) {
      console.warn(`  ! немає креслень для ${p.slug}`);
      continue;
    }

    const relDwg = (f) => `../../../assets/drawings/${f}`;
    const [coverSheet, ...restSheets] = sheets;
    const total = sets.reduce((n, s) => n + s.count, 0);

    const fm = [
      `title: ${q(p.title)}`,
      `city: ${q(p.city)}`,
      `country: ${q(p.country)}`,
      `type: ${p.type}`,
      p.year ? `year: ${p.year}` : null,
      `scope:\n${p.scope.map((x) => `  - ${q(x)}`).join('\n')}`,
      `summary: ${q(p.summary)}`,
      `cover: ${relDwg(coverSheet)}`,
      `coverAlt: ${q(`${p.title} — working drawing`)}`,
      `coords: { lat: ${p.coords.lat}, lon: ${p.coords.lon} }`,
      `featured: false`,
      `order: ${p.order}`,
      `gallery:\n${restSheets
        .map(
          (sheet) =>
            `  - src: ${relDwg(sheet)}\n    alt: ${q(`${p.title} — working drawing`)}\n    size: half`,
        )
        .join('\n')}`,
      p.todo ? `todo: ${q(p.todo)}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    await fs.writeFile(path.join(OUT, `${p.slug}.md`), `---\n${fm}\n---\n\n${p.body}\n`);
    console.log(`  ${p.slug.padEnd(22)} ${total} аркушів   [${p.type}, без фото]`);
    continue;
  }

  const items = manifest.projects[p.slug];
  if (!items?.length) {
    console.warn(`  ! немає кадрів для ${p.slug}`);
    continue;
  }

  const after = items.filter((i) => i.role !== 'before');
  const before = items.filter((i) => i.role === 'before');
  const rel = (f) => `../../../assets/projects/${p.slug}/${f}`;

  const [cover, ...rest] = after;

  // Ритм галереї: перший на всю ширину, далі пари, кожен п'ятий — деталь.
  const gallery = rest
    .map((it, i) => {
      const size = i === 0 ? 'full' : (i + 1) % 5 === 0 ? 'detail' : 'half';
      return `  - src: ${rel(it.file)}\n    alt: ${q(`${p.title} — ${p.alt.after}`)}\n    size: ${size}`;
    })
    .join('\n');

  /** Файл на диску за початковим іменем кадру. */
  const bySource = (name) => items.find((i) => i.source === name)?.file;

  // Слайдер вмикається лише там, де пара явно вказана в P: він вимагає
  // однакового ракурсу, а це видно тільки очима.
  const pairs = (p.sliderPairs ?? [])
    .map((pr) => ({ before: bySource(pr.before), after: bySource(pr.after), caption: pr.caption }))
    .filter((pr) => pr.before && pr.after);

  const beforeBlock = before.length
    ? [
        'beforeAfter:',
        `  mode: ${pairs.length ? 'slider' : 'pair'}`,
        ...(pairs.length
          ? [
              '  pairs:',
              ...pairs.map(
                (pr) =>
                  `    - before: ${rel(pr.before)}\n      after: ${rel(pr.after)}` +
                  (pr.caption ? `\n      caption: ${q(pr.caption)}` : ''),
              ),
            ]
          : []),
        '  images:',
        ...before.map(
          (it) => `    - src: ${rel(it.file)}\n      alt: ${q(`${p.title} — ${p.alt.before ?? 'before the works'}`)}`,
        ),
      ].join('\n')
    : null;

  const fm = [
    `title: ${q(p.title)}`,
    `city: ${q(p.city)}`,
    `country: ${q(p.country)}`,
    `type: ${p.type}`,
    p.brand ? `brand: ${q(p.brand)}` : null,
    p.year ? `year: ${p.year}` : null,
    p.area ? `area: ${p.area}` : null,
    `scope:\n${p.scope.map((s) => `  - ${q(s)}`).join('\n')}`,
    `materials:\n${p.materials.map((s) => `  - ${q(s)}`).join('\n')}`,
    `summary: ${q(p.summary)}`,
    `cover: ${rel(cover.file)}`,
    `coverAlt: ${q(`${p.title} — ${p.alt.after}`)}`,
    `coords: { lat: ${p.coords.lat}, lon: ${p.coords.lon} }`,
    `featured: ${Boolean(p.featured)}`,
    `order: ${p.order}`,
    p.draft ? 'draft: true' : null,
    p.todo ? `todo: ${q(p.todo)}` : null,
    gallery ? `gallery:\n${gallery}` : null,
    beforeBlock,
  ]
    .filter(Boolean)
    .join('\n');

  await fs.writeFile(path.join(OUT, `${p.slug}.md`), `---\n${fm}\n---\n\n${p.body}\n`);
  console.log(
    `  ${p.slug.padEnd(22)} ${String(after.length).padStart(2)} після` +
      (before.length ? ` · ${String(before.length).padStart(2)} до` : '') +
      `   [${p.type}]`,
  );
}

// Прибираємо файли проєктів, яких більше немає в наборі.
const want = new Set(P.map((p) => `${p.slug}.md`));
for (const f of await fs.readdir(OUT)) {
  if (!want.has(f)) {
    await fs.unlink(path.join(OUT, f));
    console.log(`  вилучено застарілий ${f}`);
  }
}

console.log(`\n  ${P.length} проєктів -> ${path.relative(ROOT, OUT)}`);
