/**
 * Процесні фото: зразки в шоурумах, плани з розміткою на об'єкті, узбережжя.
 *
 * Імпортуються ЯВНО, а не через import.meta.glob. Причина практична:
 * Astro копіює в збірку оригінал кожного зареєстрованого ассета, навіть
 * якщо на нього немає посилання. Глоб реєстрував усі 11 кадрів, з яких
 * використовуються 8 — три оригінали просто лежали в dist мертвим вантажем.
 */

import boatWake from '../assets/services/000-fullsizerender.jpg';
import tileSamples from '../assets/services/001-img-1415.jpg';
import planOnSite from '../assets/services/004-img-1763.jpg';
import monacoBay from '../assets/services/005-img-2356.jpg';
import sketchDims from '../assets/services/007-img-6207.jpg';
import marbleSlabs from '../assets/services/008-img-8006.jpg';
import finishSamples from '../assets/services/009-img-8011.jpg';
import metalSamples from '../assets/services/010-img-8149.jpg';

export const SERVICE_PHOTOS = {
  planOnSite,
  sketchDims,
  tileSamples,
  marbleSlabs,
  finishSamples,
  metalSamples,
} as const;

/** Кадри для фону секції контакту: широкий для десктопа, вузький для телефона. */
export const CONTACT_BACKDROP = {
  wide: monacoBay,
  tall: boatWake,
} as const;
