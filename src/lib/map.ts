import mapData from '../data/map.json';
import eastData from '../data/map-east.json';
import type { CityGroup } from './projects';

export const MAP = mapData;

/**
 * Другий аркуш — Польща й Україна. Окремою картою, яку кнопка під
 * основною ставить на її місце: вписати їх у кадр Франції та Італії
 * означало б стиснути Рив'єру в точку. Див. scripts/build-map.mjs.
 */
export const MAP_EAST = eastData;

type MapData = { width: number; view: { lonMin: number; lonMax: number; latMax: number } };

/**
 * Та сама проєкція Меркатора, що у scripts/build-map.mjs.
 * Тримаємо її тут, щоб маркери сідали точно на згенеровану геометрію.
 */
const mercY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 180 / 2));

function projector(map: MapData) {
  const y0 = mercY(map.view.latMax);
  const scale = map.width / (map.view.lonMax - map.view.lonMin);
  return (lon: number, lat: number): { x: number; y: number } => ({
    x: +((lon - map.view.lonMin) * scale).toFixed(2),
    y: +((y0 - mercY(lat)) * (180 / Math.PI) * scale).toFixed(2),
  });
}

export const project = projector(MAP);
const projectEast = projector(MAP_EAST);

/**
 * Ніцца, Канни, Монако й Сен-Поль-де-Ванс вміщаються в ~40 км — на оглядовому
 * масштабі це ~27 px, тобто чотири маркери в одну пляму. Тому вони згортаються
 * в один кластер, який розкладається при наближенні.
 */
export const CLUSTERS = [
  {
    /*
      id лишається латиницею як є: він іде в атрибути розмітки й у
      якорі, тож перейменування нічого не дасть, крім ризику розсинхрону
      з CSS і скриптом. Видимий підпис — поруч, у label.
    */
    id: 'cote-dazur',
    label: 'French Riviera',
    cities: ['Nice', 'Cannes', 'Monaco', 'Saint-Paul-de-Vence'],
    /** Нижче цього масштабу показуємо кластер, вище — окремі міста. */
    splitAt: 2.4,
    /** Масштаб і центр для швидкого переходу «French Riviera». */
    zoom: { scale: 6, lon: 7.22, lat: 43.66 },
  },
] as const;

export const QUICK_VIEWS = [
  { id: 'reset', labelKey: 'map.reset', scale: 1, lon: 6.75, lat: 43.75 },
  { id: 'riviera', labelKey: 'map.riviera', scale: 6, lon: 7.22, lat: 43.66 },
  { id: 'italy', labelKey: 'map.italy', scale: 2.4, lon: 11.5, lat: 43.5 },
] as const;

export type Marker = {
  id: string;
  label: string;
  country: string;
  x: number;
  y: number;
  count: number;
  /** Місто входить у кластер — на оглядовому масштабі ховається. */
  clustered: string | null;
};

export type ClusterMarker = {
  id: string;
  label: string;
  x: number;
  y: number;
  count: number;
  splitAt: number;
};

/** Чи потрапляє точка в кадр карти. */
function inFrame(x: number, y: number): boolean {
  return x >= 0 && x <= MAP.width && y >= 0 && y <= MAP.height;
}

/**
 * Країни, контури яких намальовані на карті.
 *
 * Перевірки самих координат тут замало. Kassel лежить на 51.31°, а
 * північна межа кадру — 51.5°, тобто формально він у рамці. Без цього
 * списку його маркер стояв би просто на порожньому місці там, де раніше
 * був контур Німеччини.
 *
 * Монако обов'язкове: у контенті це окрема країна, і без неї половина
 * Рив'єри поїхала б у текстовий рядок.
 */
const MAPPED_COUNTRIES = ['France', 'Italy', 'Monaco'];

/** Країни другого аркуша. */
const EAST_COUNTRIES = ['Poland', 'Ukraine'];

export function buildMarkers(groups: CityGroup[]): {
  markers: Marker[];
  /** Маркери аркуша «Польща й Україна». */
  eastMarkers: Marker[];
  clusters: ClusterMarker[];
  /**
   * Міста поза картою: Гонконг лежить за 4800 px від правого краю,
   * Kassel — у країні, якої на карті більше немає. Малювати їх ніде,
   * тому вони йдуть окремим текстовим рядком і не зникають зовсім.
   */
  beyond: CityGroup[];
} {
  const beyond: CityGroup[] = [];
  const eastMarkers: Marker[] = [];

  const markers: Marker[] = groups.flatMap((g) => {
    if (EAST_COUNTRIES.includes(g.country)) {
      const p = projectEast(g.coords.lon, g.coords.lat);
      eastMarkers.push({
        id: g.city.toLowerCase().replace(/\s+/g, '-'),
        label: g.city,
        country: g.country,
        x: p.x,
        y: p.y,
        count: g.projects.length,
        clustered: null,
      });
      return [];
    }

    const { x, y } = project(g.coords.lon, g.coords.lat);
    if (!MAPPED_COUNTRIES.includes(g.country) || !inFrame(x, y)) {
      beyond.push(g);
      return [];
    }
    const cluster = CLUSTERS.find((c) => (c.cities as readonly string[]).includes(g.city));
    return [
      {
        id: g.city.toLowerCase().replace(/\s+/g, '-'),
        label: g.city,
        country: g.country,
        x,
        y,
        count: g.projects.length,
        clustered: cluster?.id ?? null,
      },
    ];
  });

  const clusters: ClusterMarker[] = CLUSTERS.flatMap((c) => {
    const members = markers.filter((m) => m.clustered === c.id);
    if (members.length < 2) return [];
    return [
      {
        id: c.id,
        label: c.label,
        x: +(members.reduce((s, m) => s + m.x, 0) / members.length).toFixed(2),
        y: +(members.reduce((s, m) => s + m.y, 0) / members.length).toFixed(2),
        count: members.reduce((s, m) => s + m.count, 0),
        splitAt: c.splitAt,
      },
    ];
  });

  return { markers, eastMarkers, clusters, beyond };
}
