import type { BlogContent } from './linkedin-post-generator';

export async function fetchBlogContent(siteUrl: string, slug: string): Promise<BlogContent | null> {
  const url = `${siteUrl}/en/blog/${slug}/`;
  const response = await fetch(url);
  if (!response.ok) return null;

  const html = await response.text();

  const title = extractMeta(html, 'og:title') ?? slug;
  const summary = extractMeta(html, 'og:description') ?? '';
  const tags = extractJsonLdKeywords(html);
  const body = extractArticleText(html);

  if (!body) return null;

  return { title, summary, tags, slug, body };
}

function extractMeta(html: string, property: string): string | null {
  const regex = new RegExp(`<meta\\s+property="${property}"\\s+content="([^"]*)"`, 'i');
  const match = html.match(regex);
  return match?.[1] ?? null;
}

function extractJsonLdKeywords(html: string): string[] {
  const regex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);
      if (data['@type'] === 'BlogPosting' && data.keywords) {
        return data.keywords.split(',').map((k: string) => k.trim());
      }
    } catch {
      continue;
    }
  }
  return [];
}

function extractArticleText(html: string): string {
  // Extract content from the article/prose section
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  const content = articleMatch?.[1] ?? html;

  // Strip HTML tags and decode basic entities
  return content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
