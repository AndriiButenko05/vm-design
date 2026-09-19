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
      country: z.enum(['France', 'Italy', 'Monaco', 'Germany', 'Hong Kong']),

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
          }),
        )
        .default([]),

      /**
       * Кадри стану до робіт.
       *
       * mode вирішує подачу:
       *   slider — повзунок-витирач; вимагає, щоб «до» і «після»
       *            були зняті з ОДНІЄЇ точки, інакше картинка стрибає
       *   pair   — два кадри поруч; чесно працює за будь-якого кадрування
       *
       * pairs заповнюється лише для mode: 'slider'.
       */
      beforeAfter: z
        .object({
          mode: z.enum(['slider', 'pair']).default('pair'),
          images: z
            .array(z.object({ src: image(), alt: z.string() }))
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
