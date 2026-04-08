export const POSTS_PER_PAGE = 6;

export interface BlogPost {
  id: string;
  data: {
    title: string;
    date: Date;
    tags: string[];
    summary: string;
    language: 'en' | 'es';
    slug: string;
    category: string;
    draft: boolean;
    readingTime?: number;
  };
  body?: string;
}

export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

export async function getBlogPostsByLang(lang: 'en' | 'es'): Promise<BlogPost[]> {
  const { getCollection } = await import('astro:content');
  const allPosts = await getCollection('blog');
  return (allPosts as BlogPost[])
    .filter(post => post.data.language === lang && !post.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function getUniqueTags(posts: BlogPost[]): string[] {
  const tags = new Set<string>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      tags.add(tag);
    }
  }
  return [...tags].sort();
}

export function getUniqueCategories(posts: BlogPost[]): string[] {
  const categories = new Set<string>();
  for (const post of posts) {
    categories.add(post.data.category);
  }
  return [...categories].sort();
}

export function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export interface TocEntry {
  depth: number;
  slug: string;
  text: string;
  children: TocEntry[];
}

export function generateTableOfContents(headings: Heading[]): TocEntry[] {
  const toc: TocEntry[] = [];
  const stack: TocEntry[] = [];

  for (const heading of headings) {
    if (heading.depth < 2 || heading.depth > 3) continue;

    const entry: TocEntry = {
      depth: heading.depth,
      slug: heading.slug,
      text: heading.text,
      children: [],
    };

    if (heading.depth === 2) {
      toc.push(entry);
      stack.length = 0;
      stack.push(entry);
    } else if (heading.depth === 3 && stack.length > 0) {
      stack[stack.length - 1].children.push(entry);
    }
  }

  return toc;
}

export function getBilingualSlug(slug: string, targetLang: 'en' | 'es'): string {
  return `/${targetLang}/blog/${slug}/`;
}

export function paginatePosts(
  posts: BlogPost[],
  page: number
): { posts: BlogPost[]; totalPages: number; currentPage: number } {
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * POSTS_PER_PAGE;
  return {
    posts: posts.slice(start, start + POSTS_PER_PAGE),
    totalPages,
    currentPage,
  };
}
