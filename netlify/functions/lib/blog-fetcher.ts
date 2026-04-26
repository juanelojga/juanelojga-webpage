export interface BlogContent {
  title: string;
  summary: string;
  tags: string[];
  slug: string;
  body: string;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

function extractMeta(html: string, property: string): string {
  const match =
    html.match(
      new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i')
    ) ??
    html.match(
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i')
    );
  return match?.[1] ?? '';
}

function extractArticleBody(html: string): string {
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (!articleMatch) return '';
  return decodeEntities(stripHtml(articleMatch[1]));
}

function extractTags(html: string): string[] {
  const jsonLdMatch = html.match(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i
  );
  if (!jsonLdMatch) return [];
  try {
    const data = JSON.parse(jsonLdMatch[1]);
    const keywords: string = data.keywords ?? '';
    if (!keywords) return [];
    return keywords
      .split(',')
      .map((k: string) => k.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

export async function fetchBlogContent(baseUrl: string, slug: string): Promise<BlogContent | null> {
  const url = `${baseUrl}/en/blog/${slug}/`;
  const response = await fetch(url);
  if (!response.ok) return null;

  const html = await response.text();
  const body = extractArticleBody(html);
  if (!body) return null;

  const title = extractMeta(html, 'og:title') || slug;
  const summary = extractMeta(html, 'og:description');
  const tags = extractTags(html);

  return { title, summary, tags, slug, body };
}
