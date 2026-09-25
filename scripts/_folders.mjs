import path from 'node:path';

export const SRC_ROOT = '.source/Project Marina new';

export const INTERIORS = {
  'Nice villa': 'la-villa-nice',
  'Monza Italy': 'monza-apartment',
  'Nice Larimar': 'larimar-nice',
  'Nice Wow Hair': 'wow-hair-nice',
  Paris: 'christina-paris',
  Roma: 'christina-roma',
  Cannes: 'christina-cannes',
  Monaco: 'christina-monaco',
  'Germany Kassel': 'christina-kassel',
};

export const FAIRS = {
  'Bologna 2024': 'stand-bologna-2024',
  'Bologna 2025': 'stand-bologna-2025',
  'Bologna 2026': 'stand-bologna-2026',
  'Paris 2025': 'stand-paris-2025',
  'Paris 2026': 'stand-paris-2026',
  'Hong Kong 2026': 'stand-hong-kong-2026',
};

export function sourceDir(root, slug) {
  for (const [folder, s] of Object.entries(INTERIORS)) {
    if (s === slug) return path.join(root, SRC_ROOT, 'projects', folder);
  }
  for (const [folder, s] of Object.entries(FAIRS)) {
    if (s === slug) return path.join(root, SRC_ROOT, 'fairs', folder);
  }
  return null;
}
