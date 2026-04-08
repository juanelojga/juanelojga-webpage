import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getBlogPostsByLang } from '../../../utils/blog';

export function getStaticPaths() {
  return [{ params: { lang: 'en' } }, { params: { lang: 'es' } }];
}

export async function GET(context: APIContext) {
  const lang = (context.params.lang as 'en' | 'es') ?? 'en';
  const posts = await getBlogPostsByLang(lang);

  return rss({
    title: lang === 'es' ? 'Juan Almeida — Blog' : 'Juan Almeida — Blog',
    description:
      lang === 'es'
        ? 'Ideas sobre construcción de software, sistemas de IA y cultura de ingeniería.'
        : 'Thoughts on building software, AI systems, and engineering culture.',
    site: context.site!,
    items: posts.map(post => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.summary,
      link: `/${lang}/blog/${post.data.slug}/`,
      categories: post.data.tags,
    })),
    customData: `<language>${lang}</language>`,
  });
}
