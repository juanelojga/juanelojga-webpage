import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/blog',
    generateId: ({ data, entry }) => {
      // Include language prefix to avoid collisions between en/es posts with the same slug
      const lang = (data as { language?: string }).language ?? 'en';
      const slug = (data as { slug?: string }).slug ?? entry.replace(/\.md$/, '');
      return `${lang}/${slug}`;
    },
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    summary: z.string(),
    language: z.enum(['en', 'es']),
    slug: z.string(),
    category: z.string(),
    draft: z.boolean().default(false),
    readingTime: z.number().optional(),
    dateModified: z.coerce.date().optional(),
    faq: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
    sources: z
      .array(
        z.object({
          title: z.string(),
          url: z.string().url(),
          publisher: z.string(),
          publishedAt: z.string().optional(),
          sourceType: z.enum(['primary', 'reporting', 'analysis']),
        })
      )
      .optional(),
  }),
});

export const collections = { blog };
