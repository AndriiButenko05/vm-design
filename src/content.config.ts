import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      city: z.string(),
      country: z.enum(['France', 'Italy', 'Monaco', 'Germany', 'Poland', 'Ukraine', 'Hong Kong']),

      type: z.enum(['residential', 'commercial', 'exhibition']),

      brand: z.string().optional(),

      year: z.number().int().min(2000).max(2100).optional(),
      area: z.number().positive().optional(),

      scope: z.array(z.string()).default([]),
      materials: z.array(z.string()).default([]),

      summary: z.string(),

      card: z.string().optional(),

      cover: image(),
      coverAlt: z.string(),

      gallery: z
        .array(
          z.object({
            src: image(),
            alt: z.string(),
            size: z.enum(['full', 'half', 'detail']).default('half'),

            material: z.string().optional(),

            caption: z.string().optional(),
          }),
        )
        .default([]),

      renders: z
        .array(z.object({ src: image(), alt: z.string(), caption: z.string().optional() }))
        .default([]),

      drawingsPreview: z.array(z.string()).optional(),

      hero: z
        .array(z.object({ src: image(), alt: z.string() }))
        .max(3)
        .optional(),

      heroCaption: z.string().optional(),

      /**
       * Стадія проєкту для блоку «Процес»: built — реалізовано, in-progress —
       * ремонт триває, design — лише проєкт, фото показують об'єкт до робіт.
       */
      processStage: z.enum(['built', 'in-progress', 'design']).default('built'),

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

      todo: z.string().optional(),
    }),
});

export const collections = { projects };
