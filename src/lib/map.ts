import mapData from '../data/map.json';
import type { CityGroup } from './projects';

export type SheetId = keyof typeof mapData;

export type SheetGeometry = (typeof mapData)[SheetId];

export type LabelSide = 'right' | 'left' | 'top';

export type Marker = {
  id: string;
  label: string;
  x: number;
  y: number;
  count: number;
  side: LabelSide;
  goto?: SheetId;
};

export type Sheet = {
  id: SheetId;
  labelKey: string;
  geometry: SheetGeometry;
  markers: Marker[];
  groups: CityGroup[];
};

const RIVIERA = ['Nice', 'Cannes', 'Monaco', 'Saint-Paul-de-Vence'];

const ORDER: { id: SheetId; labelKey: string; has: (g: CityGroup) => boolean }[] = [
  { id: 'riviera', labelKey: 'map.riviera', has: (g) => RIVIERA.includes(g.city) },
  { id: 'france', labelKey: 'map.france', has: (g) => g.country === 'France' && !RIVIERA.includes(g.city) },
  { id: 'italy', labelKey: 'map.italy', has: (g) => g.country === 'Italy' },
  { id: 'east', labelKey: 'map.east', has: (g) => g.country === 'Poland' || g.country === 'Ukraine' },
];

const SIDES: Record<string, LabelSide> = {
  'Saint-Paul-de-Vence': 'left',
  'French Riviera': 'left',
};

const mercY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 180 / 2));

function projector(g: SheetGeometry) {
  const y0 = mercY(g.view.latMax);
  const scale = g.width / (g.view.lonMax - g.view.lonMin);
  return (lon: number, lat: number) => ({
    x: +((lon - g.view.lonMin) * scale).toFixed(2),
    y: +((y0 - mercY(lat)) * (180 / Math.PI) * scale).toFixed(2),
  });
}

const slug = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

export function buildSheets(
  groups: CityGroup[],
  rivieraLabel: string,
): {
  sheets: Sheet[];
  beyond: CityGroup[];
} {
  const sheets: Sheet[] = ORDER.map(({ id, labelKey, has }) => {
    const geometry = mapData[id];
    const project = projector(geometry);
    const own = groups.filter(has);
    const markers: Marker[] = own.map((g) => ({
      id: slug(g.city),
      label: g.city,
      ...project(g.coords.lon, g.coords.lat),
      count: g.projects.length,
      side: SIDES[g.city] ?? 'right',
    }));

    if (id === 'france') {
      const riv = groups.filter((g) => RIVIERA.includes(g.city));
      if (riv.length) {
        const lon = riv.reduce((s, g) => s + g.coords.lon, 0) / riv.length;
        const lat = riv.reduce((s, g) => s + g.coords.lat, 0) / riv.length;
        markers.push({
          id: 'to-riviera',
          label: rivieraLabel,
          ...project(lon, lat),
          count: riv.reduce((s, g) => s + g.projects.length, 0),
          side: SIDES['French Riviera'],
          goto: 'riviera',
        });
      }
    }

    return { id, labelKey, geometry, markers, groups: own };
  }).filter((s) => s.groups.length > 0);

  const placed = new Set(sheets.flatMap((s) => s.groups));
  return { sheets, beyond: groups.filter((g) => !placed.has(g)) };
}

export { slug as cityId };
