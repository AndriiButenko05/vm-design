import manifest from '../data/drawings.json';

export type DrawingPage = {
  file: string;
  width: number;
  height: number;
};

export type DrawingSet = {
  slug: string;
  title: string;
  project: string | null;
  pages: DrawingPage[];
  count: number;
  redactions: number;
};


const loaders = import.meta.glob<{ default: ImageMetadata }>('../assets/drawings/**/*.jpg');

const byKey = new Map<string, () => Promise<{ default: ImageMetadata }>>();
for (const [p, load] of Object.entries(loaders)) {
  byKey.set(p.split('/drawings/')[1], load);
}

export const SETS: DrawingSet[] = manifest.sets as DrawingSet[];

export function setsForProject(slug: string): DrawingSet[] {
  return SETS.filter((s) => s.project === slug);
}

export function totalPages(sets: DrawingSet[]): number {
  return sets.reduce((n, s) => n + s.count, 0);
}

export type ResolvedSheet = {
  img: ImageMetadata;
  set: DrawingSet;
};

export async function allSheets(sets: DrawingSet[]): Promise<ResolvedSheet[]> {
  const out: ResolvedSheet[] = [];
  for (const set of sets) {
    for (const page of set.pages) {
      const load = byKey.get(`${set.slug}/${page.file}`);
      if (load) out.push({ img: (await load()).default, set });
    }
  }
  return out;
}

export const PREVIEW_COUNT = 3;

export async function previewSheets(sets: DrawingSet[], picks?: string[]): Promise<ResolvedSheet[]> {
  const files = picks?.length
    ? picks.map((p) => `${p.replace(/\.jpg$/, '')}.jpg`)
    : null;

  const chosen: { set: DrawingSet; file: string }[] = [];
  for (const set of sets) {
    const available = set.pages.map((p) => p.file);
    const wanted = files ? available.filter((f) => files.includes(f)) : available.slice(1);
    if (files) wanted.sort((a, b) => files.indexOf(a) - files.indexOf(b));
    for (const file of wanted) chosen.push({ set, file });
  }

  const out: ResolvedSheet[] = [];
  for (const { set, file } of chosen.slice(0, PREVIEW_COUNT)) {
    const load = byKey.get(`${set.slug}/${file}`);
    if (load) out.push({ img: (await load()).default, set });
  }
  return out;
}

export function viewerPath(project: string): string {
  return `/drawings/${project}`;
}
