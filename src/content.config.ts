import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Файли лежать як src/content/projects/<locale>/<slug>.md,
 * тому id має вигляд "en/la-villa-nice". Локаль і slug розбираються
 * у src/lib/projects.ts — так i18n закладено з першого дня.
 */

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      city: z.string(),
      country: z.enum(['France', 'Italy', 'Monaco', 'Germany', 'Poland', 'Ukraine', 'Hong Kong']),

      /**
       * residential  приватне житло
       * commercial   салони, ритейл, клініки
       * exhibition   виставкові стенди
       */
      type: z.enum(['residential', 'commercial', 'exhibition']),

      /**
       * Бренд-замовник, якщо це комерційний проєкт.
       * Christina проходить через 5 міст і 6 виставок — саме це поле
       * дозволяє зібрати їх в одну історію, не дублюючи проєкти.
       */
      brand: z.string().optional(),

      year: z.number().int().min(2000).max(2100).optional(),
      area: z.number().positive().optional(),

      scope: z.array(z.string()).default([]),
      materials: z.array(z.string()).default([]),

      summary: z.string(),

      /**
       * Рядок під назвою на картці проєкту — авторський, від замовниці:
       * «Nice, France · 2025 · Complete villa renovation». Порядок частин
       * у неї різний від проєкту до проєкту, тому рядок береться як є.
       * Без нього картка показує «місто · рік».
       */
      card: z.string().optional(),

      cover: image(),
      coverAlt: z.string(),

      gallery: z
        .array(
          z.object({
            src: image(),
            alt: z.string(),
            /**
             * full   — на всю ширину контейнера
             * half   — половина, у парі з сусіднім
             * detail — макро-кадр матеріалу, вужча колонка
             */
            size: z.enum(['full', 'half', 'detail']).default('half'),

            /**
             * Назва матеріалу, який видно на кадрі — «Brass», «Green quartzite».
             *
             * Заповнюється тільки там, де матеріал справді читається. Секція
             * «Матеріали» на головній збирається саме за цим полем, а не за
             * size: detail: серед detail-кадрів є загальні плани стендів,
             * де жодного матеріалу не видно, і в секції вони були зайві.
             */
            material: z.string().optional(),

            /**
             * Підпис під кадром у галереї — назва приміщення: «The kitchen».
             * Без нього береться material, а без обох підпису немає.
             */
            caption: z.string().optional(),
          }),
        )
        .default([]),

      /**
       * 3D-візуалізації проєкту. Показуються окремим блоком на сторінці
       * проєкту, а не окремим розділом сайту — так попросила замовниця.
       * Якщо в матеріалах проєкту 3D немає, поле просто порожнє.
       * Проєкт, який не дійшов до реалізації (Варшава), може складатися
       * лише з 3D: тоді gallery порожня.
       */
      renders: z
        .array(z.object({ src: image(), alt: z.string(), caption: z.string().optional() }))
        .default([]),

      /**
       * Які аркуші креслень показати на сторінці: ["007", "008", "003"].
       * Самі комплекти прив'язані до проєкту в src/data/drawings.json;
       * тут лише вибір двох-трьох найвиразніших. Без поля — перші після
       * обкладинки.
       */
      drawingsPreview: z.array(z.string()).optional(),

      /**
       * Головний кадр сторінки проєкту — головне приміщення, а не випадкова
       * обкладинка (у Monza нею була ванна). Один горизонтальний кадр іде
       * на всю ширину; два-три вертикальні стають у ряд — так проєкти,
       * зняті лише вертикально на телефон, теж отримують великий перший
       * екран. Без поля кадр обирається автоматично.
       */
      hero: z
        .array(z.object({ src: image(), alt: z.string() }))
        .max(3)
        .optional(),

      /** Рядок під головним кадром: «Private villa · Interior architecture & design». */
      heroCaption: z.string().optional(),

      /**
       * Кадри стану до робіт.
       *
       * pairs — порівняння повзунком, гортаються стрілками. Ракурс «до» і
       *         «після» не мусить збігатися: замовниця хоче показати
       *         прогрес, а не точну накладку. Кадр «після» беремо того ж
       *         приміщення, найближчий за точкою зйомки.
       * images — усі кадри «до». Ті, що не пішли в пари, показуються в
       *         блоці «Процес» під галереєю.
       *
       * mode лишився зі старої подачі (slider / pair) і більше ні на що
       * не впливає. Поле не прибираємо, щоб старі файли проходили схему.
       */
      beforeAfter: z
        .object({
          mode: z.enum(['slider', 'pair']).optional(),
          images: z
            .array(z.object({ src: image(), alt: z.string(), caption: z.string().optional() }))
            .default([]),
          pairs: z
            .array(
              z.object({
                before: image(),
                after: image(),
                caption: z.string().optional(),
              }),
            )
            .default([]),
        })
        .optional(),

      coords: z.object({ lat: z.number(), lon: z.number() }),

      featured: z.boolean().default(false),
      order: z.number().int().default(99),
      draft: z.boolean().default(false),

      /** Внутрішня примітка. На сайт не виводиться. */
      todo: z.string().optional(),
    }),
});

export const collections = { projects };
