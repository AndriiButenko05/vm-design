/**
 * Переклад однієї мови. Кожна мова — окремий файл (uk.ts, ru.ts, fr.ts,
 * it.ts), щоб його можна було цілком віддати на вичитку носію мови.
 *
 * Англійська — вихідна: її тексти лежать у src/lib/i18n.ts (інтерфейс),
 * src/lib/services.ts (послуги) і src/content/projects/en (проєкти).
 * Усе, чого в перекладі немає, показується англійською.
 */
export type ProjectText = {
  title?: string;
  card?: string;
  summary?: string;
  heroCaption?: string;
  scope?: string[];
  /** Абзаци опису; перший — вступ великим шрифтом, як в англійському файлі. */
  body?: string[];
};

export type ServiceText = {
  title: string;
  short: string;
  includes: string[];
};

export type Translation = {
  /** Інтерфейс і тексти сторінок — ключі як в англійському словнику. */
  ui: Record<string, string>;
  /** Міста, країни, регіони, мови — за англійською назвою. */
  places: Record<string, string>;
  /** Підписи фото, пар «до / після» і назви матеріалів — за англійським текстом. */
  captions: Record<string, string>;
  /** Описи зображень (alt) — за англійським текстом після «Назва проєкту — ». */
  alts: Record<string, string>;
  services: Record<string, ServiceText>;
  projects: Record<string, ProjectText>;
};
